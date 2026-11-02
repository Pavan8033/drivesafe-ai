"""Unit tests for BlinkTracker and Constellation Landmark Extraction."""

import pytest
from backend.app.services.blink_analysis import BlinkTracker, extract_constellation_landmarks
from backend.app.services.head_pose import Point3D


def test_blink_tracker_counts_natural_blink():
    tracker = BlinkTracker(ear_threshold=0.20, ear_reopen_threshold=0.23, window_seconds=60.0)
    t = 1000.0

    # Eyes open
    blinks, bpm, perclos = tracker.update(face_detected=True, combined_ear=0.30, timestamp=t)
    assert blinks == 0

    # Eyes close
    t += 0.05
    blinks, bpm, perclos = tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)
    assert blinks == 0

    # Eyes stay closed for 150ms
    t += 0.15
    blinks, bpm, perclos = tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)
    assert blinks == 0

    # Eyes reopen above threshold
    t += 0.05
    blinks, bpm, perclos = tracker.update(face_detected=True, combined_ear=0.28, timestamp=t)
    assert blinks == 1
    assert bpm > 0.0


def test_blink_tracker_ignores_microsleep_as_blink():
    tracker = BlinkTracker(ear_threshold=0.20, ear_reopen_threshold=0.23)
    t = 2000.0

    # Eyes close
    tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)

    # Eyes stay closed for 2.0 seconds (microsleep, not a quick blink)
    t += 2.0
    tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)

    # Eyes reopen
    t += 0.1
    blinks, _, _ = tracker.update(face_detected=True, combined_ear=0.28, timestamp=t)
    # Prolonged closure (>0.75s) should NOT be counted as a normal blink
    assert blinks == 0


def test_blink_tracker_perclos_calculation():
    tracker = BlinkTracker(ear_threshold=0.20, ear_reopen_threshold=0.23, window_seconds=10.0)
    t = 3000.0

    # 5 frames open (0.28), 5 frames closed (0.15)
    for _ in range(5):
        tracker.update(face_detected=True, combined_ear=0.28, timestamp=t)
        t += 0.1

    for _ in range(5):
        tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)
        t += 0.1

    _, _, perclos = tracker.update(face_detected=True, combined_ear=0.15, timestamp=t)
    # 6 closed out of 11 frames = ~54.5%
    assert 45.0 <= perclos <= 60.0


def test_extract_constellation_landmarks():
    # Synthetic 478 landmarks
    fake_landmarks = [Point3D(x=float(i) / 500.0, y=float(i) / 500.0, z=0.0) for i in range(478)]
    pts = extract_constellation_landmarks(fake_landmarks)
    assert len(pts) > 20
    for pt in pts:
        assert len(pt) == 2
        assert 0.0 <= pt[0] <= 1.0
        assert 0.0 <= pt[1] <= 1.0

