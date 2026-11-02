"""Facial Landmark Extraction Service using MediaPipe Tasks API."""

import base64
import logging
from pathlib import Path
from typing import Optional, List, Tuple

import cv2
import numpy as np
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions

from .head_pose import Point3D

logger = logging.getLogger("drivesafe.landmarks")


class FaceLandmarksService:
    """Service to detect facial landmarks using MediaPipe FaceLandmarker."""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.landmarker: Optional[vision.FaceLandmarker] = None
        self._initialize_detector()

    def _initialize_detector(self) -> bool:
        """Initialize the FaceLandmarker detector."""
        path = Path(self.model_path)
        if not path.is_file():
            logger.error(f"Face landmark model file not found at: {self.model_path}")
            return False

        try:
            options = vision.FaceLandmarkerOptions(
                base_options=BaseOptions(model_asset_path=str(path)),
                running_mode=vision.RunningMode.IMAGE,
                num_faces=1,
                min_face_detection_confidence=0.5,
                min_face_presence_confidence=0.5,
                min_tracking_confidence=0.5,
                output_face_blendshapes=True,
            )
            self.landmarker = vision.FaceLandmarker.create_from_options(options)
            logger.info("FaceLandmarker successfully initialized.")
            return True
        except Exception as e:
            logger.error(f"Failed to initialize FaceLandmarker: {e}", exc_info=True)
            self.landmarker = None
            return False

    @property
    def is_ready(self) -> bool:
        """Return True if model is loaded and ready."""
        return self.landmarker is not None

    def decode_frame(self, frame_data: str | bytes) -> Optional[np.ndarray]:
        """Decode base64 string or raw bytes into a cv2 BGR image."""
        try:
            if isinstance(frame_data, str):
                # Strip potential data URL prefix
                if "," in frame_data:
                    frame_data = frame_data.split(",", 1)[1]
                image_bytes = base64.b64decode(frame_data)
            else:
                image_bytes = frame_data

            nparr = np.frombuffer(image_bytes, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return image
        except Exception as e:
            logger.warning(f"Error decoding image frame: {e}")
            return None

    def process_frame(
        self, frame: np.ndarray
    ) -> Tuple[bool, List[Point3D], Optional[List[dict]]]:
        """Extract facial landmarks from a BGR image frame.
        
        Returns:
            (face_detected, landmarks_list, blendshapes_optional)
        """
        if not self.is_ready or frame is None or frame.size == 0:
            return False, [], None

        try:
            # Convert BGR to RGB for MediaPipe
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

            detection_result = self.landmarker.detect(mp_image)

            if not detection_result.face_landmarks:
                return False, [], None

            # Primary face landmarks (normalized coordinates x: [0, 1], y: [0, 1], z)
            primary_landmarks = detection_result.face_landmarks[0]
            points = [
                Point3D(
                    x=float(lm.x),
                    y=float(lm.y),
                    z=float(getattr(lm, "z", 0.0)),
                )
                for lm in primary_landmarks
            ]

            blendshapes = None
            if detection_result.face_blendshapes:
                blendshapes = [
                    {"category": b.category_name, "score": round(float(b.score), 4)}
                    for b in detection_result.face_blendshapes[0]
                ]

            return True, points, blendshapes

        except Exception as e:
            logger.error(f"Error running face landmark detection: {e}")
            return False, [], None

    def close(self):
        """Clean up resources."""
        if self.landmarker:
            try:
                self.landmarker.close()
            except Exception:
                pass
            self.landmarker = None
