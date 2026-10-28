"""Unit tests for session management and summary generation."""

import time
from app.services.session_manager import MonitoringSession, SessionManager


def test_session_lifecycle_and_summary():
    session = MonitoringSession("test-session-123")
    assert session.session_id == "test-session-123"
    assert session.is_active

    # Record drowsiness event
    session.record_event(
        event_type="DROWSINESS_PROLONGED_CLOSURE",
        duration_ms=1600,
        metric_value=0.14,
        details="Prolonged closure test",
    )

    # Record yawn event
    session.record_event(
        event_type="POSSIBLE_YAWN",
        duration_ms=2100,
        metric_value=0.74,
        details="Mouth opening test",
    )

    time.sleep(0.05)
    summary = session.stop()

    assert not session.is_active
    assert summary.session_id == "test-session-123"
    assert summary.session_status == "COMPLETED"
    assert summary.drowsiness_event_count == 1
    assert summary.possible_yawning_event_count == 1
    assert len(summary.events) == 2
    assert summary.duration_seconds >= 0.05


def test_session_manager():
    manager = SessionManager()
    s1 = manager.create_session("sess-1")
    s2 = manager.create_session("sess-2")

    assert manager.get_session("sess-1") is s1
    assert manager.get_session("sess-2") is s2

    summary = manager.stop_session("sess-1")
    assert summary is not None
    assert summary.session_id == "sess-1"
    assert summary.session_status == "COMPLETED"
