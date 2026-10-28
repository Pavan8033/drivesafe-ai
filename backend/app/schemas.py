from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DetectionState(str, Enum):
    NO_FACE = "NO_FACE"
    CALIBRATING = "CALIBRATING"
    ALERT = "ALERT"
    EYES_CLOSED = "EYES_CLOSED"
    POSSIBLE_DROWSINESS = "POSSIBLE_DROWSINESS"
    UNKNOWN = "UNKNOWN"

class EventType(str, Enum):
    DROWSINESS = "DROWSINESS_PROLONGED_CLOSURE"
    YAWN = "POSSIBLE_YAWN"
    FACE_LOST = "FACE_LOST"

class MonitoringConfig(BaseModel):
    ear_threshold: float = Field(0.20, description="Threshold below which eyes are considered closed")
    prolonged_closure_seconds: float = Field(1.5, description="Duration in seconds before triggering drowsiness alert")
    ear_reopen_threshold: float = Field(0.23, description="Hysteresis threshold to confirm eyes reopened")
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
    event: Optional[str] = None
    event_count: int = 0
    processing_time_ms: int = 0
    session_duration_seconds: float = 0.0

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
