"""Real-Time Driver Monitoring API and WebSocket Endpoint."""

import json
import logging
import time
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from ..config import settings
from ..schemas import MonitoringConfig, MonitoringTelemetry, DetectionState
from ..services import (
    FaceLandmarksService,
    compute_eyes_telemetry,
    calculate_mar,
    DrowsinessEngine,
    YawnTracker,
    MonitoringSession,
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

                action = payload.get("action")

                if action == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
                    continue

                elif action == "start":
                    # Initialize or reset session
                    custom_id = payload.get("session_id")
                    session = MonitoringSession(custom_id)
                    drowsiness_engine.reset()
                    yawn_tracker.reset()
                    total_events_count = 0
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "session_started",
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
                    frame_data = payload.get("frame")
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
                logger.warning(f"Frame payload rejected: {len(frame_data)} bytes exceeds 5MB ceiling")
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
            state = DetectionState.NO_FACE
            triggered_event: Optional[str] = None
            is_yawning = False

            if face_detected and landmarks:
                # Compute EAR
                left_ear, right_ear, combined_ear = compute_eyes_telemetry(landmarks)

                # Compute MAR
                mar = calculate_mar(landmarks)

                # Evaluate Drowsiness
                state, closure_duration_ms, d_event = drowsiness_engine.update(
                    face_detected=True,
                    combined_ear=combined_ear,
                    timestamp=now_epoch,
                )
                if d_event:
                    triggered_event = d_event
                    total_events_count += 1
                    session.record_event(
                        event_type=d_event,
                        duration_ms=closure_duration_ms,
                        metric_value=combined_ear,
                        details=f"Prolonged closure EAR={combined_ear:.3f} for {closure_duration_ms}ms",
                    )

                # Evaluate Yawning
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
                state, closure_duration_ms, _ = drowsiness_engine.update(
                    face_detected=False,
                    combined_ear=None,
                    timestamp=now_epoch,
                )
                yawn_tracker.reset()

            proc_time_ms = int((time.perf_counter() - start_proc_time) * 1000)

            telemetry = MonitoringTelemetry(
                timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
                face_detected=face_detected,
                status=state,
                left_ear=left_ear,
                right_ear=right_ear,
                ear=combined_ear,
                eye_closure_duration_ms=closure_duration_ms,
                mouth_aspect_ratio=mar,
                possible_yawning=is_yawning,
                event=triggered_event,
                event_count=total_events_count,
                processing_time_ms=proc_time_ms,
                session_duration_seconds=session.duration_seconds,
            )

            await websocket.send_text(telemetry.model_dump_json())

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected gracefully.")
    except Exception as e:
        logger.error(f"Error in monitoring loop: {e}", exc_info=True)
    finally:
        session.stop()
