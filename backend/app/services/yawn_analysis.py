"""Mouth Aspect Ratio (MAR) and Yawn Analysis Service.

Computes Mouth Aspect Ratio using canonical facial landmarks and evaluates
sustained mouth opening to identify potential yawning events.
"""

import math
from typing import Optional, Sequence
from .eye_analysis import Point2D, euclidean_distance

# MediaPipe canonical mouth landmark indices:
# Corners: 61 (left), 291 (right)
# Vertical pairs:
# - Center inner: 13 (upper lip inner), 14 (lower lip inner)
# - Left inner: 37 (upper lip), 84 (lower lip)
# - Right inner: 267 (upper lip), 314 (lower lip)
MOUTH_CORNER_LEFT = 61
MOUTH_CORNER_RIGHT = 291
MOUTH_VERTICAL_CENTER = (13, 14)
MOUTH_VERTICAL_LEFT = (37, 84)
MOUTH_VERTICAL_RIGHT = (267, 314)


def calculate_mar(landmarks: Sequence[Point2D]) -> Optional[float]:
    """Calculate Mouth Aspect Ratio (MAR).
    
    MAR = (dist(13, 14) + dist(37, 84) + dist(267, 314)) / (2.0 * dist(61, 291))
    """
    if not landmarks or len(landmarks) < 320:
        return None

    try:
        p_corner_l = landmarks[MOUTH_CORNER_LEFT]
        p_corner_r = landmarks[MOUTH_CORNER_RIGHT]

        p_vc_top = landmarks[MOUTH_VERTICAL_CENTER[0]]
        p_vc_bot = landmarks[MOUTH_VERTICAL_CENTER[1]]

        p_vl_top = landmarks[MOUTH_VERTICAL_LEFT[0]]
        p_vl_bot = landmarks[MOUTH_VERTICAL_LEFT[1]]

        p_vr_top = landmarks[MOUTH_VERTICAL_RIGHT[0]]
        p_vr_bot = landmarks[MOUTH_VERTICAL_RIGHT[1]]
    except IndexError:
        return None

    # Horizontal mouth width
    horizontal = euclidean_distance(p_corner_l, p_corner_r)
    if horizontal < 1e-6 or not math.isfinite(horizontal):
        return None

    vert_c = euclidean_distance(p_vc_top, p_vc_bot)
    vert_l = euclidean_distance(p_vl_top, p_vl_bot)
    vert_r = euclidean_distance(p_vr_top, p_vr_bot)

    mar = (vert_c + vert_l + vert_r) / (2.0 * horizontal)

    if not math.isfinite(mar) or mar < 0.0 or mar > 2.5:
        return None

    return round(float(mar), 4)


class YawnTracker:
    """Temporal yawn evaluation tracking sustained mouth opening."""

    def __init__(self, threshold: float = 0.65, min_duration_sec: float = 2.0):
        self.threshold = threshold
        self.min_duration_sec = min_duration_sec
        self.opening_start_time: Optional[float] = None
        self.is_currently_yawning: bool = False
        self.event_triggered_this_yawn: bool = False

    def update(self, mar: Optional[float], current_time: float) -> tuple[bool, bool]:
        """Update tracker with current MAR measurement.
        
        Returns:
            (is_yawning, new_event_triggered)
        """
        if mar is None or mar < self.threshold:
            # Mouth closed or normal
            self.opening_start_time = None
            self.is_currently_yawning = False
            self.event_triggered_this_yawn = False
            return False, False

        # MAR >= threshold
        if self.opening_start_time is None:
            self.opening_start_time = current_time

        duration = current_time - self.opening_start_time
        if duration >= self.min_duration_sec:
            self.is_currently_yawning = True
            if not self.event_triggered_this_yawn:
                self.event_triggered_this_yawn = True
                return True, True  # (is_yawning, new_event_triggered)
            return True, False

        return False, False

    def reset(self):
        """Reset state."""
        self.opening_start_time = None
        self.is_currently_yawning = False
        self.event_triggered_this_yawn = False
