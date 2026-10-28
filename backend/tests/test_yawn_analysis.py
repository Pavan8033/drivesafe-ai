"""Unit tests for Mouth Aspect Ratio (MAR) and yawn tracking."""

import pytest
from app.services.eye_analysis import Point2D
from app.services.yawn_analysis import calculate_mar, YawnTracker


def test_calculate_mar_synthetic():
    # Construct 478 mock landmarks
    mesh = [Point2D(0.5, 0.5) for _ in range(478)]

    # Left and right mouth corners: x=0.4 and x=0.6 (width = 0.2)
    mesh[61] = Point2D(0.4, 0.7)
    mesh[291] = Point2D(0.6, 0.7)

    # Vertical pairs across mouth (height = 0.04)
    mesh[13] = Point2D(0.5, 0.68)
    mesh[14] = Point2D(0.5, 0.72)

    mesh[37] = Point2D(0.45, 0.68)
    mesh[84] = Point2D(0.45, 0.72)

    mesh[267] = Point2D(0.55, 0.68)
    mesh[314] = Point2D(0.55, 0.72)

    mar = calculate_mar(mesh)
    assert mar is not None
    # (0.04 + 0.04 + 0.04) / (2 * 0.20) = 0.12 / 0.40 = 0.30
    assert mar == pytest.approx(0.30, abs=0.02)


def test_yawn_tracker_temporal_duration():
    tracker = YawnTracker(threshold=0.65, min_duration_sec=2.0)

    # Normal MAR at t=0
    is_yawn, new_evt = tracker.update(0.30, current_time=10.0)
    assert not is_yawn and not new_evt

    # Mouth opens wide at t=10.5
    is_yawn, new_evt = tracker.update(0.72, current_time=10.5)
    assert not is_yawn and not new_evt

    # At t=11.5 (1.0s elapsed), still below 2.0s threshold
    is_yawn, new_evt = tracker.update(0.75, current_time=11.5)
    assert not is_yawn and not new_evt

    # At t=12.6 (2.1s elapsed), exceeds 2.0s: event triggers!
    is_yawn, new_evt = tracker.update(0.74, current_time=12.6)
    assert is_yawn and new_evt

    # Next frame at t=12.8 while still open: does NOT trigger duplicate event
    is_yawn, new_evt = tracker.update(0.73, current_time=12.8)
    assert is_yawn and not new_evt

    # Mouth closes at t=13.0: tracker resets
    is_yawn, new_evt = tracker.update(0.25, current_time=13.0)
    assert not is_yawn and not new_evt
