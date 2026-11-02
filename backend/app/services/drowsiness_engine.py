"""Temporal Driver Drowsiness Detection Engine.

Implements stateful temporal analysis of eye closures to distinguish normal blinks
from hazardous prolonged eyelid closures, with hysteresis, recovery state transition,
and event deduplication.
"""

from typing import Optional, Tuple
from ..schemas import DetectionState, EventType


class DrowsinessEngine:
    """Stateful temporal drowsiness evaluator."""

    def __init__(
        self,
        ear_threshold: float = 0.12,
        prolonged_closure_seconds: float = 0.8,
        ear_reopen_threshold: float = 0.15,
    ):
        self.ear_threshold = ear_threshold
        self.prolonged_closure_seconds = prolonged_closure_seconds
        self.ear_reopen_threshold = ear_reopen_threshold

        self.current_state: DetectionState = DetectionState.UNKNOWN
        self.closure_start_timestamp: Optional[float] = None
        self.event_triggered_this_closure: bool = False
        self.last_known_ear: Optional[float] = None
        self.was_drowsy_episode: bool = False

    def configure(
        self,
        ear_threshold: Optional[float] = None,
        prolonged_closure_seconds: Optional[float] = None,
        ear_reopen_threshold: Optional[float] = None,
    ):
        """Update detection thresholds dynamically."""
        if ear_threshold is not None:
            self.ear_threshold = float(ear_threshold)
        if prolonged_closure_seconds is not None:
            self.prolonged_closure_seconds = float(prolonged_closure_seconds)
        if ear_reopen_threshold is not None:
            self.ear_reopen_threshold = float(ear_reopen_threshold)

    def update(
        self,
        face_detected: bool,
        combined_ear: Optional[float],
        timestamp: float,
    ) -> Tuple[DetectionState, int, Optional[str]]:
        """Process a new telemetry frame.
        
        Args:
            face_detected: Whether a face was successfully identified in the frame.
            combined_ear: Mean Eye Aspect Ratio (or None if unavailable).
            timestamp: Monotonic or epoch timestamp in seconds.

        Returns:
            Tuple of:
            - current_state: DetectionState enum
            - eye_closure_duration_ms: integer duration in milliseconds
            - triggered_event: Optional[str] event name if a new qualifying event just fired
        """
        # Case 1: No Face Detected
        if not face_detected:
            self.current_state = DetectionState.NO_FACE
            self.closure_start_timestamp = None
            self.event_triggered_this_closure = False
            self.was_drowsy_episode = False
            self.last_known_ear = None
            return DetectionState.NO_FACE, 0, None

        # Case 2: Face detected but EAR measurement unavailable
        if combined_ear is None:
            self.current_state = DetectionState.UNKNOWN
            self.closure_start_timestamp = None
            self.event_triggered_this_closure = False
            self.was_drowsy_episode = False
            self.last_known_ear = None
            return DetectionState.UNKNOWN, 0, None

        self.last_known_ear = combined_ear
        triggered_event: Optional[str] = None
        closure_duration_ms = 0

        # Case 3: Eyes Closed (EAR < threshold)
        is_closed = combined_ear < self.ear_threshold

        # Hysteresis: If eyes were already closed, they must cross ear_reopen_threshold to be deemed open
        if not is_closed and self.closure_start_timestamp is not None:
            if combined_ear < self.ear_reopen_threshold:
                is_closed = True

        if is_closed:
            if self.closure_start_timestamp is None:
                self.closure_start_timestamp = timestamp

            closure_duration_sec = max(0.0, timestamp - self.closure_start_timestamp)
            closure_duration_ms = int(round(closure_duration_sec * 1000))

            if closure_duration_sec >= self.prolonged_closure_seconds:
                self.current_state = DetectionState.POSSIBLE_DROWSINESS
                self.was_drowsy_episode = True
                if not self.event_triggered_this_closure:
                    self.event_triggered_this_closure = True
                    triggered_event = EventType.DROWSINESS.value
            else:
                self.current_state = DetectionState.EYES_CLOSED
        else:
            # Eyes reopened
            if self.was_drowsy_episode or self.current_state == DetectionState.POSSIBLE_DROWSINESS:
                # Transition smoothly through RECOVERING state
                self.current_state = DetectionState.RECOVERING
                self.was_drowsy_episode = False
            else:
                self.current_state = DetectionState.ALERT

            self.closure_start_timestamp = None
            self.event_triggered_this_closure = False
            closure_duration_ms = 0

        return self.current_state, closure_duration_ms, triggered_event

    def reset(self):
        """Reset engine state for a new monitoring session."""
        self.current_state = DetectionState.UNKNOWN
        self.closure_start_timestamp = None
        self.event_triggered_this_closure = False
        self.last_known_ear = None
        self.was_drowsy_episode = False
