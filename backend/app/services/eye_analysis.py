"""Eye Aspect Ratio (EAR) calculation service.

Based on Soukupová & Čech (2016) 'Real-Time Eye Blink Detection using Facial Landmarks'.
EAR = (||p2 - p6|| + ||p3 - p5||) / (2 * ||p1 - p4||)

Where:
- p1, p4 are the horizontal eye corner landmarks.
- p2, p6 and p3, p5 are the vertical landmark pairs across the eyelid.
"""

import math
from typing import NamedTuple, Optional, Sequence

class Point2D(NamedTuple):
    x: float
    y: float

# MediaPipe 468/478 Landmark Indices for 6-point EAR
# Left Eye indices: [33, 160, 158, 133, 153, 144]
# p1=33 (outer), p2=160 (top-outer), p3=158 (top-inner),
# p4=133 (inner), p5=153 (bot-inner), p6=144 (bot-outer)
LEFT_EYE_LANDMARKS = [33, 160, 158, 133, 153, 144]

# Right Eye indices: [362, 385, 387, 263, 373, 380]
# p1=362 (inner), p2=385 (top-inner), p3=387 (top-outer),
# p4=263 (outer), p5=373 (bot-outer), p6=380 (bot-inner)
RIGHT_EYE_LANDMARKS = [362, 385, 387, 263, 373, 380]


def euclidean_distance(p1: Point2D, p2: Point2D) -> float:
    """Calculate Euclidean distance between two 2D points."""
    return math.hypot(p1.x - p2.x, p1.y - p2.y)


def calculate_ear(points: Sequence[Point2D]) -> Optional[float]:
    """Calculate Eye Aspect Ratio for a 6-point ordered eye contour.
    
    Args:
        points: Ordered sequence of 6 Point2D objects [p1, p2, p3, p4, p5, p6].
    
    Returns:
        EAR float value rounded to 4 decimals, or None if degenerate/invalid.
    """
    if len(points) != 6:
        return None

    # Check for NaN / Inf
    for pt in points:
        if not (math.isfinite(pt.x) and math.isfinite(pt.y)):
            return None

    p1, p2, p3, p4, p5, p6 = points

    # Vertical distances between upper and lower eyelids
    vertical_a = euclidean_distance(p2, p6)
    vertical_b = euclidean_distance(p3, p5)

    # Horizontal distance between lateral and medial corners
    horizontal = euclidean_distance(p1, p4)

    # Guard against zero or near-zero division (e.g. collapsed points)
    if horizontal < 1e-6:
        return None

    ear = (vertical_a + vertical_b) / (2.0 * horizontal)

    # Plausibility sanity check (EAR is rarely > 0.6 in human facial geometry)
    if not math.isfinite(ear) or ear < 0.0 or ear > 1.5:
        return None

    return round(float(ear), 4)


def extract_eye_ear(
    landmarks: Sequence[Point2D],
    indices: Sequence[int]
) -> Optional[float]:
    """Extract 6 points by index from a full landmark set and compute EAR."""
    if not landmarks:
        return None

    max_idx = len(landmarks)
    pts: list[Point2D] = []
    for idx in indices:
        if idx >= max_idx:
            return None
        pts.append(landmarks[idx])

    return calculate_ear(pts)


def compute_eyes_telemetry(
    landmarks: Sequence[Point2D]
) -> tuple[Optional[float], Optional[float], Optional[float]]:
    """Compute left eye EAR, right eye EAR, and mean EAR from full face landmarks.
    
    Returns:
        (left_ear, right_ear, combined_ear)
    """
    if not landmarks or len(landmarks) < 400:
        return None, None, None

    left_ear = extract_eye_ear(landmarks, LEFT_EYE_LANDMARKS)
    right_ear = extract_eye_ear(landmarks, RIGHT_EYE_LANDMARKS)

    combined_ear: Optional[float] = None
    if left_ear is not None and right_ear is not None:
        combined_ear = round((left_ear + right_ear) / 2.0, 4)
    elif left_ear is not None:
        combined_ear = left_ear
    elif right_ear is not None:
        combined_ear = right_ear

    return left_ear, right_ear, combined_ear
