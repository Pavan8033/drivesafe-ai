"""Monitoring Session Management Service.

Tracks in-memory monitoring sessions, duration timing, event logging,
and generates structured session summaries.
"""

import time
import uuid
from typing import Optional, List
from ..schemas import RecordedEvent, SessionSummary


class MonitoringSession:
    """Represents an active or completed driver monitoring session."""

    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.start_timestamp = time.time()
        self.end_timestamp: Optional[float] = None
        self.drowsiness_events: List[RecordedEvent] = []
        self.yawn_events: List[RecordedEvent] = []
        self.all_events: List[RecordedEvent] = []
        self.is_active: bool = True

    @property
    def duration_seconds(self) -> float:
        """Calculate elapsed or total duration in seconds."""
        if self.end_timestamp is not None:
            return round(self.end_timestamp - self.start_timestamp, 1)
        return round(time.time() - self.start_timestamp, 1)

    def record_event(
        self,
        event_type: str,
        duration_ms: int,
        metric_value: Optional[float] = None,
        details: str = "",
    ) -> RecordedEvent:
        """Log a qualifying event with duration and timestamp."""
        event_record = RecordedEvent(
            id=str(uuid.uuid4())[:8],
            type=event_type,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            duration_ms=duration_ms,
            metric_value=metric_value,
            details=details,
        )

        self.all_events.append(event_record)
        if "DROWSINESS" in event_type:
            self.drowsiness_events.append(event_record)
        elif "YAWN" in event_type:
            self.yawn_events.append(event_record)

        return event_record

    def stop(self) -> SessionSummary:
        """Mark session complete and return summary."""
        if self.is_active:
            self.end_timestamp = time.time()
            self.is_active = False
        return self.get_summary()

    def get_summary(self) -> SessionSummary:
        """Return the structured summary of the session."""
        start_str = time.strftime(
            "%Y-%m-%d %H:%M:%S", time.localtime(self.start_timestamp)
        )
        end_str = (
            time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(self.end_timestamp))
            if self.end_timestamp
            else None
        )

        return SessionSummary(
            session_id=self.session_id,
            start_timestamp=start_str,
            end_timestamp=end_str,
            duration_seconds=self.duration_seconds,
            drowsiness_event_count=len(self.drowsiness_events),
            possible_yawning_event_count=len(self.yawn_events),
            session_status="COMPLETED" if not self.is_active else "ACTIVE",
            events=self.all_events,
        )


class SessionManager:
    """Manages active sessions across connections."""

    def __init__(self):
        self._sessions: dict[str, MonitoringSession] = {}

    def create_session(self, session_id: Optional[str] = None) -> MonitoringSession:
        """Create and store a new active session."""
        session = MonitoringSession(session_id)
        self._sessions[session.session_id] = session
        return session

    def get_session(self, session_id: str) -> Optional[MonitoringSession]:
        """Retrieve a session by ID."""
        return self._sessions.get(session_id)

    def stop_session(self, session_id: str) -> Optional[SessionSummary]:
        """Stop an active session."""
        session = self._sessions.get(session_id)
        if session:
            return session.stop()
        return None
