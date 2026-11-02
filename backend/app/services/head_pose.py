"""Head Pose and Gaze Orientation Estimation Service.

Estimates 3D head orientation (yaw, pitch, roll) from facial landmarks
and tracks sustained looking-away / head-turned behaviour with hysteresis
and temporal event deduplication.
"""

import math
from typing import NamedTuple, Optional, Sequence, Tuple
from ..schemas import EventType


class Point3D(NamedTuple):
    x: float
    y: float
    z: float = 0.0


# MediaPipe 468/478 Landmark Indices for Head Orientation
NOSE_TIP_IDX = 1
FOREHEAD_IDX = 10
CHIN_IDX = 152
LEFT_EYE_OUTER_IDX = 33
RIGHT_EYE_OUTER_IDX = 263
LEFT_MOUTH_IDX = 61
RIGHT_MOUTH_IDX = 291


def estimate_head_pose(
    landmarks: Sequence[Point3D],
) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    """Estimate head orientation angles (yaw, pitch, roll) in degrees from 3D landmarks.

    Coordinate system conventions:
    - Yaw: negative = turned left, positive = turned right, 0 = facing forward.
    - Pitch: negative = tilted down, positive = tilted up, 0 = level.
    - Roll: tilt sideways (ear toward shoulder).

    Args:
        landmarks: Ordered sequence of at least 300 3D facial landmarks.

    Returns:
        (yaw_degrees, pitch_degrees, roll_degrees) or (None, None, None) if invalid.
    """
    if not landmarks or len(landmarks) < 300:
        return None, None, None

    try:
        nose = landmarks[NOSE_TIP_IDX]
        forehead = landmarks[FOREHEAD_IDX]
        chin = landmarks[CHIN_IDX]
        left_eye = landmarks[LEFT_EYE_OUTER_IDX]
        right_eye = landmarks[RIGHT_EYE_OUTER_IDX]

        # Verify coordinates are finite
        for pt in (nose, forehead, chin, left_eye, right_eye):
            if not (math.isfinite(pt.x) and math.isfinite(pt.y) and math.isfinite(pt.z)):
                return None, None, None

        # 1. Yaw Calculation:
        # Measures differential eye-to-nose geometry and relative z-depth
        eye_dx = right_eye.x - left_eye.x
        if eye_dx < 1e-5:
            return None, None, None

        nose_center_x = (left_eye.x + right_eye.x) / 2.0
        horizontal_ratio = (nose.x - nose_center_x) / eye_dx  # Centered at 0 when looking straight

        # Blend geometric offset with 3D depth difference for high accuracy
        eye_dz = right_eye.z - left_eye.z
        yaw_from_depth = math.degrees(math.atan2(eye_dz, eye_dx))
        yaw_from_ratio = horizontal_ratio * 90.0

        # Weighted combination of 2.5D geometric ratio and 3D depth
        yaw = 0.65 * yaw_from_ratio + 0.35 * yaw_from_depth

        # 2. Pitch Calculation:
        # Measures vertical position of nose between forehead and chin
        face_dy = chin.y - forehead.y
        if face_dy < 1e-5:
            return None, None, None

        nose_center_y = (forehead.y + chin.y) / 2.0
        vertical_ratio = (nose.y - nose_center_y) / face_dy

        face_dz = chin.z - forehead.z
        pitch_from_depth = math.degrees(math.atan2(face_dz, face_dy))
        pitch_from_ratio = (vertical_ratio - 0.05) * 85.0

        pitch = 0.60 * pitch_from_ratio + 0.40 * pitch_from_depth

        # 3. Roll Calculation:
        # Angular tilt between outer eye corners in the image plane
        roll = math.degrees(math.atan2(right_eye.y - left_eye.y, eye_dx))

        # Clamp to realistic physiological ranges [-90, +90]
        yaw = max(-90.0, min(90.0, round(float(yaw), 2)))
        pitch = max(-90.0, min(90.0, round(float(pitch), 2)))
        roll = max(-90.0, min(90.0, round(float(roll), 2)))

        return yaw, pitch, roll

    except Exception:
        return None, None, None


class HeadPoseTracker:
    """Stateful temporal evaluator for sustained looking-away detection.

    Applies hysteresis, temporal duration gating, and event deduplication
    to prevent momentary blinks/glances from generating false alarms.
    """

    def __init__(
        self,
        yaw_threshold_deg: float = 12.0,
        pitch_threshold_deg: float = 12.0,
        hysteresis_deg: float = 4.0,
        sustained_seconds: float = 1.0,
    ):
        self.yaw_threshold_deg = yaw_threshold_deg
        self.pitch_threshold_deg = pitch_threshold_deg
        self.hysteresis_deg = hysteresis_deg
        self.sustained_seconds = sustained_seconds

        self.is_away: bool = False
        self.away_start_timestamp: Optional[float] = None
        self.event_triggered_this_episode: bool = False
        self.last_yaw: Optional[float] = None
        self.last_pitch: Optional[float] = None

    def update(
        self,
        face_detected: bool,
        yaw: Optional[float],
        pitch: Optional[float],
        timestamp: float,
    ) -> Tuple[bool, int, Optional[str]]:
        """Process a new telemetry frame for head orientation.

        Args:
            face_detected: Whether a face was detected in the frame.
            yaw: Estimated yaw angle in degrees (or None).
            pitch: Estimated pitch angle in degrees (or None).
            timestamp: Epoch or monotonic timestamp in seconds.

        Returns:
            Tuple of:
            - is_sustained_away: bool (True if looking away sustained >= threshold)
            - away_duration_ms: integer duration of continuous looking-away in ms
            - triggered_event: Optional[str] event name if triggered on this frame
        """
        if not face_detected or yaw is None or pitch is None:
            # Face lost or landmarks unreliable: pause timer without generating false looking-away alarms
            self.is_away = False
            self.away_start_timestamp = None
            self.event_triggered_this_episode = False
            self.last_yaw = None
            self.last_pitch = None
            return False, 0, None

        self.last_yaw = yaw
        self.last_pitch = pitch
        triggered_event: Optional[str] = None
        away_duration_ms = 0

        # Check if current orientation qualifies as "head turned away"
        # Entry requires exceeding threshold; Recovery requires returning within (threshold - hysteresis)
        entry_yaw = abs(yaw) >= self.yaw_threshold_deg
        entry_pitch = abs(pitch) >= self.pitch_threshold_deg
        is_currently_away = entry_yaw or entry_pitch

        # Hysteresis check: If already in away state, require returning within recovery boundary
        if not is_currently_away and self.away_start_timestamp is not None:
            recovery_yaw_thresh = max(5.0, self.yaw_threshold_deg - self.hysteresis_deg)
            recovery_pitch_thresh = max(5.0, self.pitch_threshold_deg - self.hysteresis_deg)
            if abs(yaw) >= recovery_yaw_thresh or abs(pitch) >= recovery_pitch_thresh:
                is_currently_away = True

        if is_currently_away:
            if self.away_start_timestamp is None:
                self.away_start_timestamp = timestamp

            away_duration_sec = max(0.0, timestamp - self.away_start_timestamp)
            away_duration_ms = int(round(away_duration_sec * 1000))

            if away_duration_sec >= self.sustained_seconds:
                self.is_away = True
                if not self.event_triggered_this_episode:
                    self.event_triggered_this_episode = True
                    triggered_event = EventType.SUSTAINED_HEAD_AWAY.value
            else:
                self.is_away = False
        else:
            # Head has safely returned to forward-facing range
            self.is_away = False
            self.away_start_timestamp = None
            self.event_triggered_this_episode = False
            away_duration_ms = 0

        return self.is_away, away_duration_ms, triggered_event

    def reset(self):
        """Reset stateful tracker."""
        self.is_away = False
        self.away_start_timestamp = None
        self.event_triggered_this_episode = False
        self.last_yaw = None
        self.last_pitch = None
