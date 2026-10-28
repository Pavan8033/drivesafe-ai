"""Unit tests for temporal drowsiness detection engine."""

from app.schemas import DetectionState
from app.services.drowsiness_engine import DrowsinessEngine


def test_drowsiness_engine_initial_alert():
    engine = DrowsinessEngine(ear_threshold=0.20, prolonged_closure_seconds=1.5)
    state, duration_ms, event = engine.update(
        face_detected=True, combined_ear=0.28, timestamp=100.0
    )
    assert state == DetectionState.ALERT
    assert duration_ms == 0
    assert event is None


def test_drowsiness_engine_short_blink_no_event():
    """A normal short blink (200ms) transitions to EYES_CLOSED without triggering an alert."""
    engine = DrowsinessEngine(ear_threshold=0.20, prolonged_closure_seconds=1.5)

    # Frame 1: Eyes open
    engine.update(face_detected=True, combined_ear=0.28, timestamp=100.0)

    # Frame 2: Eyes close at 100.1
    state, duration_ms, event = engine.update(
        face_detected=True, combined_ear=0.14, timestamp=100.1
    )
    assert state == DetectionState.EYES_CLOSED
    assert duration_ms == 0
    assert event is None

    # Frame 3: Eyes still closed at 100.3 (200ms duration)
    state, duration_ms, event = engine.update(
        face_detected=True, combined_ear=0.12, timestamp=100.3
    )
    assert state == DetectionState.EYES_CLOSED
    assert duration_ms == 200
    assert event is None

    # Frame 4: Eyes reopen at 100.4
    state, duration_ms, event = engine.update(
        face_detected=True, combined_ear=0.29, timestamp=100.4
    )
    assert state == DetectionState.ALERT
    assert duration_ms == 0
    assert event is None


def test_drowsiness_engine_prolonged_closure_triggers_event_once():
    """Prolonged eye closure >= 1.5s triggers POSSIBLE_DROWSINESS and exactly ONE event."""
    engine = DrowsinessEngine(ear_threshold=0.20, prolonged_closure_seconds=1.5)

    # Initial frame
    engine.update(face_detected=True, combined_ear=0.30, timestamp=10.0)

    # Eyes close at 10.5
    engine.update(face_detected=True, combined_ear=0.15, timestamp=10.5)

    # 1.0s elapsed (at 11.5) -> still below 1.5s threshold
    state, dur, event = engine.update(
        face_detected=True, combined_ear=0.14, timestamp=11.5
    )
    assert state == DetectionState.EYES_CLOSED
    assert dur == 1000
    assert event is None

    # 1.6s elapsed (at 12.1) -> exceeds 1.5s threshold! Event triggers!
    state, dur, event = engine.update(
        face_detected=True, combined_ear=0.13, timestamp=12.1
    )
    assert state == DetectionState.POSSIBLE_DROWSINESS
    assert dur == 1600
    assert event == "DROWSINESS_PROLONGED_CLOSURE"

    # Subsequent frame at 12.3 while eyes STILL closed: must NOT fire duplicate event
    state2, dur2, event2 = engine.update(
        face_detected=True, combined_ear=0.12, timestamp=12.3
    )
    assert state2 == DetectionState.POSSIBLE_DROWSINESS
    assert dur2 == 1800
    assert event2 is None  # Deduplicated!


def test_drowsiness_engine_hysteresis_reopen():
    """Tests hysteresis: eyes must exceed reopen_threshold (0.23) to return to ALERT."""
    engine = DrowsinessEngine(
        ear_threshold=0.20,
        prolonged_closure_seconds=1.5,
        ear_reopen_threshold=0.23,
    )

    # Eyes close at t=10.0
    engine.update(face_detected=True, combined_ear=0.15, timestamp=10.0)

    # At t=10.5, EAR is 0.21 (above 0.20 close threshold, but below 0.23 reopen threshold)
    state, _, _ = engine.update(face_detected=True, combined_ear=0.21, timestamp=10.5)
    # Hysteresis keeps it in EYES_CLOSED state
    assert state == DetectionState.EYES_CLOSED

    # At t=10.6, EAR crosses 0.26 (exceeds reopen threshold)
    state_open, _, _ = engine.update(
        face_detected=True, combined_ear=0.26, timestamp=10.6
    )
    assert state_open == DetectionState.ALERT


def test_drowsiness_engine_no_face_handling():
    """Loss of face sets state to NO_FACE and resets closure timer."""
    engine = DrowsinessEngine()
    engine.update(face_detected=True, combined_ear=0.12, timestamp=5.0)

    # Face lost
    state, dur, event = engine.update(
        face_detected=False, combined_ear=None, timestamp=6.0
    )
    assert state == DetectionState.NO_FACE
    assert dur == 0
    assert event is None
