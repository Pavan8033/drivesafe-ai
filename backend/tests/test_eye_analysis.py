"""Unit tests for Eye Aspect Ratio (EAR) calculations and landmark telemetry."""

import math
import pytest
from app.services.eye_analysis import (
    Point2D,
    calculate_ear,
    euclidean_distance,
    extract_eye_ear,
    compute_eyes_telemetry,
    LEFT_EYE_LANDMARKS,
    RIGHT_EYE_LANDMARKS,
)


def test_euclidean_distance():
    p1 = Point2D(0.0, 0.0)
    p2 = Point2D(3.0, 4.0)
    assert euclidean_distance(p1, p2) == pytest.approx(5.0)


def test_ear_open_eye():
    """An open eye should yield EAR around 0.30."""
    # Horizontal width = 20 (from x=10 to x=30 at y=50)
    # Vertical height = 6 (y=47 to y=53)
    p1 = Point2D(10.0, 50.0)  # outer corner
    p2 = Point2D(16.0, 47.0)  # top outer
    p3 = Point2D(24.0, 47.0)  # top inner
    p4 = Point2D(30.0, 50.0)  # inner corner
    p5 = Point2D(24.0, 53.0)  # bottom inner
    p6 = Point2D(16.0, 53.0)  # bottom outer

    ear = calculate_ear([p1, p2, p3, p4, p5, p6])
    assert ear is not None
    # (6 + 6) / (2 * 20) = 12 / 40 = 0.30
    assert ear == pytest.approx(0.30, abs=0.01)


def test_ear_closed_eye():
    """A closed eyelid should yield EAR around 0.10 (well below 0.20 threshold)."""
    # Horizontal width = 20
    # Vertical height = 2 (eyelids nearly touching)
    p1 = Point2D(10.0, 50.0)
    p2 = Point2D(16.0, 49.0)
    p3 = Point2D(24.0, 49.0)
    p4 = Point2D(30.0, 50.0)
    p5 = Point2D(24.0, 51.0)
    p6 = Point2D(16.0, 51.0)

    ear = calculate_ear([p1, p2, p3, p4, p5, p6])
    assert ear is not None
    # (2 + 2) / (2 * 20) = 4 / 40 = 0.10
    assert ear == pytest.approx(0.10, abs=0.01)


def test_ear_degenerate_zero_width():
    """Points with zero horizontal width (p1 and p4 coincide) must not cause ZeroDivisionError."""
    # p1 and p4 are the same point (zero eye width)
    p = Point2D(10.0, 10.0)
    pts = [p, Point2D(10.0, 5.0), Point2D(10.0, 5.0), p, Point2D(10.0, 15.0), Point2D(10.0, 15.0)]
    ear = calculate_ear(pts)
    assert ear is None


def test_ear_invalid_length():
    """Less or more than 6 points returns None."""
    pts = [Point2D(10.0, float(i)) for i in range(5)]
    assert calculate_ear(pts) is None
    assert calculate_ear([]) is None


def test_ear_nan_inf_handling():
    """NaN or Inf coordinates safely return None."""
    pts = [Point2D(10.0, 20.0) for _ in range(5)] + [Point2D(float("nan"), 20.0)]
    assert calculate_ear(pts) is None

    pts_inf = [Point2D(10.0, 20.0) for _ in range(5)] + [Point2D(float("inf"), 20.0)]
    assert calculate_ear(pts_inf) is None


def test_compute_eyes_telemetry_synthetic_face():
    """Telemetry returns valid left, right, and mean EAR for synthetic face mesh."""
    # Create 478 mock points
    synthetic_mesh = [Point2D(0.5, 0.5) for _ in range(478)]

    # Populate left eye landmarks with open eye geometry
    for idx, (x, y) in zip(
        LEFT_EYE_LANDMARKS,
        [(0.2, 0.5), (0.23, 0.47), (0.27, 0.47), (0.3, 0.5), (0.27, 0.53), (0.23, 0.53)],
    ):
        synthetic_mesh[idx] = Point2D(x, y)

    # Populate right eye landmarks with open eye geometry
    for idx, (x, y) in zip(
        RIGHT_EYE_LANDMARKS,
        [(0.7, 0.5), (0.73, 0.47), (0.77, 0.47), (0.8, 0.5), (0.77, 0.53), (0.73, 0.53)],
    ):
        synthetic_mesh[idx] = Point2D(x, y)

    left_ear, right_ear, combined_ear = compute_eyes_telemetry(synthetic_mesh)
    assert left_ear is not None
    assert right_ear is not None
    assert combined_ear is not None
    assert combined_ear == pytest.approx((left_ear + right_ear) / 2.0)
