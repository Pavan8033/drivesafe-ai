from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DetectionState(str, Enum):
    NO_FACE = "NO_FACE"
    CALIBRATING = "CALIBRATING"
    ALERT = "ALERT"
    EYES_CLOSED = "EYES_CLOSED"
    POSSIBLE_DROWSINESS = "POSSIBLE_DROWSINESS"
    HEAD_AWAY = "HEAD_AWAY"
    SUSTAINED_HEAD_AWAY = "SUSTAINED_HEAD_AWAY"
    RECOVERING = "RECOVERING"
    UNKNOWN = "UNKNOWN"

class EventType(str, Enum):
    DROWSINESS = "DROWSINESS_PROLONGED_CLOSURE"
    PROLONGED_EYE_CLOSURE = "DROWSINESS_PROLONGED_CLOSURE"
    SUSTAINED_HEAD_AWAY = "SUSTAINED_HEAD_AWAY"
    POSSIBLE_DROWSINESS = "POSSIBLE_DROWSINESS"
    FACE_NOT_DETECTED = "FACE_NOT_DETECTED"
    YAWN = "POSSIBLE_YAWN"
    FACE_LOST = "FACE_LOST"

class MonitoringConfig(BaseModel):
    ear_threshold: float = Field(0.12, description="Threshold below which eyes are considered closed")
    prolonged_closure_seconds: float = Field(0.8, description="Duration in seconds before triggering drowsiness alert")
    ear_reopen_threshold: float = Field(0.15, description="Hysteresis threshold to confirm eyes reopened")
    head_away_seconds: float = Field(1.0, description="Duration in seconds before triggering sustained head-away alert")
    yaw_threshold_deg: float = Field(12.0, description="Yaw angle threshold in degrees for head turned away")
    pitch_threshold_deg: float = Field(12.0, description="Pitch angle threshold in degrees for head tilted away")
    mar_threshold: float = Field(0.65, description="Mouth aspect ratio threshold for potential yawning")
    yawn_min_seconds: float = Field(2.0, description="Minimum duration in seconds for yawning event")
    max_fps: int = Field(10, description="Target frame rate for browser capture")

class MonitoringTelemetry(BaseModel):
    timestamp: str
    face_detected: bool
    status: DetectionState
    left_ear: Optional[float] = None
    right_ear: Optional[float] = None
    ear: Optional[float] = None
    eye_closure_duration_ms: int = 0
    mouth_aspect_ratio: Optional[float] = None
    possible_yawning: bool = False
    head_yaw: Optional[float] = None
    head_pitch: Optional[float] = None
    head_roll: Optional[float] = None
    head_away: bool = False
    head_away_duration_ms: int = 0
    warning_active: bool = False
    warning_message: Optional[str] = None
    event: Optional[str] = None
    event_count: int = 0
    processing_time_ms: int = 0
    session_duration_seconds: float = 0.0
    blink_count: int = 0
    blinks_per_minute: float = 0.0
    perclos: float = 0.0
    key_landmarks: Optional[List[List[float]]] = None

class RecordedEvent(BaseModel):
    id: str
    type: str
    timestamp: str
    duration_ms: int
    metric_value: Optional[float] = None
    details: str

class SessionSummary(BaseModel):
    session_id: str
    start_timestamp: str
    end_timestamp: Optional[str] = None
    duration_seconds: float
    drowsiness_event_count: int
    possible_yawning_event_count: int
    session_status: str
    events: List[RecordedEvent] = []

class HealthStatus(BaseModel):
    status: str
    version: str
    model_loaded: bool
    service: str
