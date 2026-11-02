"""Blink Pattern and PERCLOS Telemetry Analysis Service.

Implements high-fidelity human eye blink detection and rolling PERCLOS
(Percentage of Eye Closure Over Time) calculations adhering to NHTSA / SAE standards.
"""

from collections import deque
from typing import Optional, Tuple, List


class BlinkTracker:
    """Tracks human blink patterns, blink rates (BPM), and rolling PERCLOS."""

    def __init__(
        self,
        ear_threshold: float = 0.20,
        ear_reopen_threshold: float = 0.23,
        window_seconds: float = 60.0,
    ):
        self.ear_threshold = ear_threshold
        self.ear_reopen_threshold = ear_reopen_threshold
        self.window_seconds = window_seconds

        self.total_blinks: int = 0
        self.blink_timestamps: deque[float] = deque()
        self.closure_history: deque[Tuple[float, bool]] = deque()  # (timestamp, is_closed)

        self.closure_start_time: Optional[float] = None
        self.session_start_time: Optional[float] = None

    def configure(
        self,
        ear_threshold: Optional[float] = None,
        ear_reopen_threshold: Optional[float] = None,
    ):
        """Update detection thresholds dynamically."""
        if ear_threshold is not None:
            self.ear_threshold = float(ear_threshold)
        if ear_reopen_threshold is not None:
            self.ear_reopen_threshold = float(ear_reopen_threshold)

    def update(
        self,
        face_detected: bool,
        combined_ear: Optional[float],
        timestamp: float,
    ) -> Tuple[int, float, float]:
        """Update blink state and compute metrics.

        Args:
            face_detected: Whether a face was located in the current frame.
            combined_ear: Eye Aspect Ratio (or None).
            timestamp: Monotonic or epoch timestamp in seconds.

        Returns:
            Tuple of:
            - total_blinks: Cumulative count of validated natural blinks
            - blinks_per_minute: Rolling 60-second blink rate
            - perclos: Percentage of eye closure (0.0% - 100.0%)
        """
        if self.session_start_time is None:
            self.session_start_time = timestamp

        # If face is lost or EAR unavailable, maintain state without registering false blinks
        if not face_detected or combined_ear is None:
            self.closure_start_time = None
            return self.total_blinks, self._calculate_bpm(timestamp), self._calculate_perclos(timestamp)

        is_closed = combined_ear < self.ear_threshold
        # Hysteresis: Stay closed until ear_reopen_threshold
        if not is_closed and self.closure_start_time is not None:
            if combined_ear < self.ear_reopen_threshold:
                is_closed = True

        # Append to rolling closure history
        self.closure_history.append((timestamp, is_closed))
        self._prune_history(timestamp)

        if is_closed:
            if self.closure_start_time is None:
                self.closure_start_time = timestamp
        else:
            # Eyes transitioned to open
            if self.closure_start_time is not None:
                duration_sec = timestamp - self.closure_start_time
                # Valid human blink: 70ms to 750ms
                if 0.07 <= duration_sec <= 0.75:
                    self.total_blinks += 1
                    self.blink_timestamps.append(timestamp)
                self.closure_start_time = None

        blinks_per_min = self._calculate_bpm(timestamp)
        perclos = self._calculate_perclos(timestamp)

        return self.total_blinks, blinks_per_min, perclos

    def _prune_history(self, current_time: float):
        """Remove observations older than window_seconds."""
        cutoff = current_time - self.window_seconds
        while self.blink_timestamps and self.blink_timestamps[0] < cutoff:
            self.blink_timestamps.popleft()

        while self.closure_history and self.closure_history[0][0] < cutoff:
            self.closure_history.popleft()

    def _calculate_bpm(self, current_time: float) -> float:
        """Calculate rolling blinks per minute (BPM)."""
        self._prune_history(current_time)
        if self.session_start_time is None:
            return 0.0

        elapsed = max(1.0, current_time - self.session_start_time)
        effective_window = min(self.window_seconds, elapsed)

        count = len(self.blink_timestamps)
        # Normalize to 60-second rate
        rate = (count / effective_window) * 60.0
        return round(min(rate, 120.0), 1)

    def _calculate_perclos(self, current_time: float) -> float:
        """Calculate PERCLOS: percentage of time eyes were closed in window."""
        self._prune_history(current_time)
        if not self.closure_history:
            return 0.0

        closed_count = sum(1 for _, closed in self.closure_history if closed)
        total_count = len(self.closure_history)

        percentage = (closed_count / total_count) * 100.0
        return round(percentage, 1)

    def reset(self):
        """Reset blink tracker state."""
        self.total_blinks = 0
        self.blink_timestamps.clear()
        self.closure_history.clear()
        self.closure_start_time = None
        self.session_start_time = None


# Essential MediaPipe indices for biometric constellation rendering
CONSTELLATION_INDICES = [
    # Face Oval Keypoints
    10, 338, 297, 332, 284, 454, 323, 361, 152, 132, 93, 234, 127, 54, 103, 67,
    # Left Eye & Iris
    33, 160, 158, 133, 153, 144, 468,
    # Right Eye & Iris
    362, 385, 387, 263, 373, 380, 473,
    # Nose
    168, 197, 1, 4,
    # Mouth Outer Contour
    61, 37, 0, 267, 291, 314, 17, 84,
]


def extract_constellation_landmarks(landmarks: list) -> List[List[float]]:
    """Extract normalized [x, y] coordinates for key constellation landmarks."""
    if not landmarks:
        return []

    points: List[List[float]] = []
    num_landmarks = len(landmarks)

    for idx in CONSTELLATION_INDICES:
        if idx < num_landmarks:
            lm = landmarks[idx]
            points.append([round(float(lm.x), 4), round(float(lm.y), 4)])

    return points

