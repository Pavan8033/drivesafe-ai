"""Unit tests for 3D Head Pose estimation and sustained looking-away detection."""

import pytest
from app.services.head_pose import (
    Point3D,
    estimate_head_pose,
    HeadPoseTracker,
    NOSE_TIP_IDX,
    FOREHEAD_IDX,
    CHIN_IDX,
    LEFT_EYE_OUTER_IDX,
    RIGHT_EYE_OUTER_IDX,
)
from app.schemas import EventType


def generate_synthetic_landmarks(
    nose_x=0.50,
    nose_y=0.50,
    nose_z=-0.05,
    eye_l_x=0.35,
    eye_l_z=0.0,
    eye_r_x=0.65,
    eye_r_z=0.0,
    forehead_y=0.25,
    forehead_z=-0.02,
    chin_y=0.75,
    chin_z=0.0,
    total_count=478,
):
    """Generate deterministic synthetic landmark set for algorithmic testing."""
    pts = [Point3D(0.5, 0.5, 0.0) for _ in range(total_count)]
    pts[NOSE_TIP_IDX] = Point3D(nose_x, nose_y, nose_z)
    pts[FOREHEAD_IDX] = Point3D(0.50, forehead_y, forehead_z)
    pts[CHIN_IDX] = Point3D(0.50, chin_y, chin_z)
    pts[LEFT_EYE_OUTER_IDX] = Point3D(eye_l_x, 0.40, eye_l_z)
    pts[RIGHT_EYE_OUTER_IDX] = Point3D(eye_r_x, 0.40, eye_r_z)
    return pts


def test_estimate_head_pose_forward_facing():
    """Forward-facing face should produce approximately 0 deg yaw, pitch, roll."""
    landmarks = generate_synthetic_landmarks()
    yaw, pitch, roll = estimate_head_pose(landmarks)

    assert yaw is not None
    assert pitch is not None
    assert roll is not None
    assert abs(yaw) < 5.0
    assert abs(pitch) < 8.0
    assert abs(roll) < 2.0


def test_estimate_head_pose_turned_right():
    """Head turned right shifts nose to the right and creates differential depth."""
    landmarks = generate_synthetic_landmarks(
        nose_x=0.58,  # shifted right
        eye_l_z=-0.04,  # left eye closer
        eye_r_z=0.04,   # right eye further
    )
    yaw, pitch, _ = estimate_head_pose(landmarks)
    assert yaw is not None
    assert yaw > 15.0  # Positive yaw indicates turned right


def test_estimate_head_pose_turned_left():
    """Head turned left shifts nose to the left."""
    landmarks = generate_synthetic_landmarks(
        nose_x=0.42,  # shifted left
        eye_l_z=0.04,
        eye_r_z=-0.04,
    )
    yaw, pitch, _ = estimate_head_pose(landmarks)
    assert yaw is not None
    assert yaw < -15.0  # Negative yaw indicates turned left


def test_estimate_head_pose_insufficient_landmarks():
    """Degenerate landmark counts should return None without crashing."""
    assert estimate_head_pose([]) == (None, None, None)
    assert estimate_head_pose([Point3D(0, 0, 0)] * 50) == (None, None, None)


def test_head_pose_tracker_forward_no_event():
    """Forward-facing head produces no event and duration 0."""
    tracker = HeadPoseTracker(yaw_threshold_deg=20.0, sustained_seconds=2.0)
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=2.0, pitch=1.0, timestamp=100.0
    )
    assert not is_away
    assert dur == 0
    assert event is None


def test_head_pose_tracker_momentary_glance_no_event():
    """Momentary head turn (500ms) is tracked but does not trigger sustained alert."""
    tracker = HeadPoseTracker(yaw_threshold_deg=20.0, sustained_seconds=2.0)

    # Frame 1: Turn head away at t=10.0
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=28.0, pitch=0.0, timestamp=10.0
    )
    assert not is_away
    assert dur == 0
    assert event is None

    # Frame 2: Still turned away at t=10.5 (500ms duration < 2.0s threshold)
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=30.0, pitch=0.0, timestamp=10.5
    )
    assert not is_away
    assert dur == 500
    assert event is None

    # Frame 3: Returned forward at t=10.6
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=5.0, pitch=0.0, timestamp=10.6
    )
    assert not is_away
    assert dur == 0
    assert event is None


def test_head_pose_tracker_sustained_away_triggers_event_once():
    """Sustained head-away >= 2.0s triggers exactly ONE event with deduplication."""
    tracker = HeadPoseTracker(yaw_threshold_deg=20.0, sustained_seconds=2.0)

    # Start looking away at t=20.0
    tracker.update(face_detected=True, yaw=25.0, pitch=0.0, timestamp=20.0)

    # At t=21.0 (1.0s elapsed)
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=26.0, pitch=0.0, timestamp=21.0
    )
    assert not is_away
    assert dur == 1000
    assert event is None

    # At t=22.1 (2.1s elapsed >= 2.0s threshold!) -> Event fires!
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=27.0, pitch=0.0, timestamp=22.1
    )
    assert is_away
    assert dur == 2100
    assert event == EventType.SUSTAINED_HEAD_AWAY.value

    # Subsequent frame at t=22.5 while STILL looking away: deduplicated!
    is_away, dur, event = tracker.update(
        face_detected=True, yaw=28.0, pitch=0.0, timestamp=22.5
    )
    assert is_away
    assert dur == 2500
    assert event is None  # No duplicate event


def test_head_pose_tracker_hysteresis_and_recovery():
    """Recovery requires returning within (threshold - hysteresis_deg)."""
    tracker = HeadPoseTracker(
        yaw_threshold_deg=20.0,
        hysteresis_deg=5.0,
        sustained_seconds=1.0,
    )
    # Turn away at t=10.0
    tracker.update(face_detected=True, yaw=25.0, pitch=0.0, timestamp=10.0)
    # Exceed threshold at t=11.2
    is_away, _, event = tracker.update(
        face_detected=True, yaw=25.0, pitch=0.0, timestamp=11.2
    )
    assert is_away
    assert event == EventType.SUSTAINED_HEAD_AWAY.value

    # At yaw=18.0 (below 20 entry, but above 15 recovery boundary) -> still away
    is_away, _, _ = tracker.update(
        face_detected=True, yaw=18.0, pitch=0.0, timestamp=11.4
    )
    assert is_away

    # At yaw=10.0 (safely below 15.0 recovery boundary) -> recovered!
    is_away, dur, _ = tracker.update(
        face_detected=True, yaw=10.0, pitch=0.0, timestamp=11.6
    )
    assert not is_away
    assert dur == 0


def test_head_pose_tracker_no_face_reset():
    """Loss of face resets tracker without false alarms."""
    tracker = HeadPoseTracker(yaw_threshold_deg=20.0, sustained_seconds=2.0)
    tracker.update(face_detected=True, yaw=30.0, pitch=0.0, timestamp=5.0)

    # Face lost
    is_away, dur, event = tracker.update(
        face_detected=False, yaw=None, pitch=None, timestamp=6.0
    )
    assert not is_away
    assert dur == 0
    assert event is None
