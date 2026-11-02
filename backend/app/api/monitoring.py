"""Real-Time Driver Monitoring API and WebSocket Endpoint."""

import json
import logging
import time
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..config import settings
from ..schemas import MonitoringConfig, MonitoringTelemetry, DetectionState, EventType
from ..services import (
    FaceLandmarksService,
    compute_eyes_telemetry,
    calculate_mar,
    DrowsinessEngine,
    HeadPoseTracker,
    estimate_head_pose,
    YawnTracker,
    MonitoringSession,
    BlinkTracker,
    extract_constellation_landmarks,
)

logger = logging.getLogger("drivesafe.monitoring")
router = APIRouter()


@router.get("/monitoring/config", response_model=MonitoringConfig)
async def get_monitoring_config():
    """Return the active detection configuration thresholds."""
    return MonitoringConfig(
        ear_threshold=settings.DEFAULT_EAR_THRESHOLD,
        prolonged_closure_seconds=settings.PROLONGED_CLOSURE_SECONDS,
        ear_reopen_threshold=settings.EAR_REOPEN_THRESHOLD,
        head_away_seconds=settings.HEAD_AWAY_SECONDS,
        yaw_threshold_deg=settings.YAW_THRESHOLD_DEG,
        pitch_threshold_deg=settings.PITCH_THRESHOLD_DEG,
        mar_threshold=settings.MAR_THRESHOLD,
        yawn_min_seconds=settings.YAWN_MIN_SECONDS,
        max_fps=settings.MAX_FPS,
    )


@router.websocket("/ws/monitor")
async def websocket_monitor_endpoint(websocket: WebSocket):
    """WebSocket endpoint for bi-directional real-time telemetry processing."""
    await websocket.accept()
    logger.info("New WebSocket monitoring connection accepted.")

    # Retrieve shared face landmark detector from app state
    landmark_service: Optional[FaceLandmarksService] = getattr(
        websocket.app.state, "landmark_service", None
    )

    # Instantiate isolated per-connection analysis engines
    drowsiness_engine = DrowsinessEngine(
        ear_threshold=settings.DEFAULT_EAR_THRESHOLD,
        prolonged_closure_seconds=settings.PROLONGED_CLOSURE_SECONDS,
        ear_reopen_threshold=settings.EAR_REOPEN_THRESHOLD,
    )
    blink_tracker = BlinkTracker(
        ear_threshold=settings.DEFAULT_EAR_THRESHOLD,
        ear_reopen_threshold=settings.EAR_REOPEN_THRESHOLD,
    )
    head_pose_tracker = HeadPoseTracker(
        yaw_threshold_deg=settings.YAW_THRESHOLD_DEG,
        pitch_threshold_deg=settings.PITCH_THRESHOLD_DEG,
        sustained_seconds=settings.HEAD_AWAY_SECONDS,
    )
    yawn_tracker = YawnTracker(
        threshold=settings.MAR_THRESHOLD,
        min_duration_sec=settings.YAWN_MIN_SECONDS,
    )
    session = MonitoringSession()

    total_events_count = 0

    try:
        while True:
            # Receive message from browser
            message = await websocket.receive()

            if "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                except Exception:
                    continue

                action = payload.get("action") or payload.get("type")

                if action == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                    continue

                elif action == "configure":
                    # Update dynamic thresholds from user settings
                    cfg = payload.get("config", {})
                    drowsiness_engine.configure(
                        ear_threshold=cfg.get("ear_threshold"),
                        prolonged_closure_seconds=cfg.get("prolonged_closure_seconds"),
                        ear_reopen_threshold=cfg.get("ear_reopen_threshold"),
                    )
                    blink_tracker.configure(
                        ear_threshold=cfg.get("ear_threshold"),
                        ear_reopen_threshold=cfg.get("ear_reopen_threshold"),
                    )
                    if "yaw_threshold_deg" in cfg:
                        head_pose_tracker.yaw_threshold_deg = float(cfg["yaw_threshold_deg"])
                    if "pitch_threshold_deg" in cfg:
                        head_pose_tracker.pitch_threshold_deg = float(cfg["pitch_threshold_deg"])
                    if "head_away_seconds" in cfg:
                        head_pose_tracker.sustained_seconds = float(cfg["head_away_seconds"])
                    if "mar_threshold" in cfg:
                        yawn_tracker.threshold = float(cfg["mar_threshold"])
                    logger.info("Dynamic detection parameters updated from client.")
                    await websocket.send_text(
                        json.dumps({"type": "config_updated", "status": "ok"})
                    )
                    continue

                elif action in ("start", "reset"):
                    # Initialize or reset session
                    custom_id = payload.get("session_id")
                    session = MonitoringSession(custom_id)
                    drowsiness_engine.reset()
                    blink_tracker.reset()
                    head_pose_tracker.reset()
                    yawn_tracker.reset()
                    total_events_count = 0
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "session_started" if action == "start" else "reset_ok",
                                "session_id": session.session_id,
                                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
                            }
                        )
                    )
                    continue

                elif action == "stop":
                    # Finalize session and send summary
                    summary = session.stop()
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "session_summary",
                                "summary": summary.model_dump(),
                            }
                        )
                    )
                    continue

                elif action == "frame":
                    frame_data = payload.get("frame") or payload.get("image")
                    if not frame_data:
                        continue
                else:
                    # Unrecognized text action
                    continue

            elif "bytes" in message and message["bytes"]:
                frame_data = message["bytes"]
            else:
                continue

            # Bounded payload security ceiling (5 MB max)
            if len(frame_data) > 5 * 1024 * 1024:
                logger.warning(
                    f"Frame payload rejected: {len(frame_data)} bytes exceeds 5MB ceiling"
                )
                continue

            # Process frame
            start_proc_time = time.perf_counter()
            now_epoch = time.time()

            if landmark_service is None or not landmark_service.is_ready:
                # Backend running in degraded mode (model not ready)
                telemetry = MonitoringTelemetry(
                    timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                    face_detected=False,
                    status=DetectionState.UNKNOWN,
                    processing_time_ms=0,
                    session_duration_seconds=session.duration_seconds,
                )
                await websocket.send_text(telemetry.model_dump_json())
                continue

            # Decode image
            cv_image = landmark_service.decode_frame(frame_data)
            if cv_image is None:
                telemetry = MonitoringTelemetry(
                    timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                    face_detected=False,
                    status=DetectionState.UNKNOWN,
                    processing_time_ms=0,
                    session_duration_seconds=session.duration_seconds,
                )
                await websocket.send_text(telemetry.model_dump_json())
                continue

            # Detect face and landmarks
            face_detected, landmarks, _ = landmark_service.process_frame(cv_image)

            left_ear: Optional[float] = None
            right_ear: Optional[float] = None
            combined_ear: Optional[float] = None
            mar: Optional[float] = None
            closure_duration_ms = 0
            head_yaw: Optional[float] = None
            head_pitch: Optional[float] = None
            head_roll: Optional[float] = None
            is_head_away = False
            head_away_ms = 0

            d_state = DetectionState.NO_FACE
            triggered_event: Optional[str] = None
            is_yawning = False
            key_landmarks: Optional[list] = None

            if face_detected and landmarks:
                # 1. Compute EAR
                left_ear, right_ear, combined_ear = compute_eyes_telemetry(landmarks)

                # 2. Extract Key Constellation Landmarks for HUD Overlay
                key_landmarks = extract_constellation_landmarks(landmarks)

                # 3. Compute MAR
                mar = calculate_mar(landmarks)

                # 3. Evaluate Drowsiness (Prolonged Eye Closure)
                d_state, closure_duration_ms, d_event = drowsiness_engine.update(
                    face_detected=True,
                    combined_ear=combined_ear,
                    timestamp=now_epoch,
                )
                if d_event:
                    triggered_event = d_event
                    total_events_count += 1
                    ear_val = combined_ear if combined_ear is not None else 0.0
                    session.record_event(
                        event_type=d_event,
                        duration_ms=closure_duration_ms,
                        metric_value=round(ear_val, 3),
                        details=f"Prolonged closure EAR={ear_val:.3f} for {closure_duration_ms}ms",
                    )

                # 4. Evaluate Head Pose & Looking-Away
                head_yaw, head_pitch, head_roll = estimate_head_pose(landmarks)
                is_head_away, head_away_ms, h_event = head_pose_tracker.update(
                    face_detected=True,
                    yaw=head_yaw,
                    pitch=head_pitch,
                    timestamp=now_epoch,
                )
                if h_event:
                    triggered_event = h_event
                    total_events_count += 1
                    session.record_event(
                        event_type=h_event,
                        duration_ms=head_away_ms,
                        metric_value=head_yaw,
                        details=f"Sustained head-away yaw={head_yaw:.1f}° pitch={head_pitch:.1f}° for {head_away_ms}ms",
                    )

                # 5. Evaluate Yawning
                is_yawning, y_event = yawn_tracker.update(mar, now_epoch)
                if y_event:
                    triggered_event = "POSSIBLE_YAWN"
                    total_events_count += 1
                    session.record_event(
                        event_type="POSSIBLE_YAWN",
                        duration_ms=int(yawn_tracker.min_duration_sec * 1000),
                        metric_value=mar,
                        details=f"Sustained mouth opening MAR={mar:.3f}",
                    )
            else:
                # No face detected
                d_state, closure_duration_ms, _ = drowsiness_engine.update(
                    face_detected=False,
                    combined_ear=None,
                    timestamp=now_epoch,
                )
                head_pose_tracker.update(
                    face_detected=False,
                    yaw=None,
                    pitch=None,
                    timestamp=now_epoch,
                )
                yawn_tracker.reset()

            # Combine multi-hazard state and warning banner message
            is_drowsy_hazard = d_state == DetectionState.POSSIBLE_DROWSINESS
            warning_active = False
            warning_message: Optional[str] = None
            overall_state = d_state

            if is_drowsy_hazard and is_head_away:
                overall_state = DetectionState.POSSIBLE_DROWSINESS
                warning_active = True
                warning_message = "WARNING: PROLONGED EYE CLOSURE & HEAD-AWAY DETECTED"
            elif is_drowsy_hazard and is_yawning:
                overall_state = DetectionState.POSSIBLE_DROWSINESS
                warning_active = True
                warning_message = "WARNING: PROLONGED EYE CLOSURE & YAWNING DETECTED"
            elif is_drowsy_hazard:
                overall_state = DetectionState.POSSIBLE_DROWSINESS
                warning_active = True
                warning_message = "WARNING: PROLONGED EYE CLOSURE DETECTED"
            elif is_head_away:
                overall_state = DetectionState.SUSTAINED_HEAD_AWAY
                warning_active = True
                warning_message = "WARNING: SUSTAINED HEAD-AWAY DETECTED"
            elif is_yawning:
                overall_state = DetectionState.POSSIBLE_DROWSINESS
                warning_active = True
                warning_message = "WARNING: PROLONGED YAWNING DETECTED"
            elif head_away_ms > 0:
                # Head turned away momentarily (pending threshold)
                overall_state = DetectionState.HEAD_AWAY
                warning_active = False
                warning_message = None
            elif d_state == DetectionState.RECOVERING:
                overall_state = DetectionState.RECOVERING
                warning_active = False
                warning_message = None
            else:
                overall_state = d_state
                warning_active = False
                warning_message = None

            # 6. Evaluate Blink Pattern and PERCLOS
            blink_count, bpm, perclos = blink_tracker.update(
                face_detected=face_detected,
                combined_ear=combined_ear,
                timestamp=now_epoch,
            )

            proc_time_ms = int((time.perf_counter() - start_proc_time) * 1000)

            telemetry = MonitoringTelemetry(
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                face_detected=face_detected,
                status=overall_state,
                left_ear=left_ear,
                right_ear=right_ear,
                ear=combined_ear,
                eye_closure_duration_ms=closure_duration_ms,
                mouth_aspect_ratio=mar,
                possible_yawning=is_yawning,
                head_yaw=head_yaw,
                head_pitch=head_pitch,
                head_roll=head_roll,
                head_away=is_head_away or (head_away_ms > 0),
                head_away_duration_ms=head_away_ms,
                warning_active=warning_active,
                warning_message=warning_message,
                event=triggered_event,
                event_count=total_events_count,
                processing_time_ms=proc_time_ms,
                session_duration_seconds=session.duration_seconds,
                blink_count=blink_count,
                blinks_per_minute=bpm,
                perclos=perclos,
                key_landmarks=key_landmarks,
            )

            await websocket.send_text(telemetry.model_dump_json())

    except (WebSocketDisconnect, RuntimeError):
        logger.info("WebSocket disconnected gracefully.")
    except Exception as e:
        logger.error(f"Error in monitoring loop: {e}", exc_info=True)
    finally:
        session.stop()
