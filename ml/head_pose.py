from __future__ import annotations

import os
from typing import Optional, Tuple

import numpy as np


class HeadPoseEstimator:
    def __init__(self):
        import mediapipe as mp

        self._mp = mp
        self._landmarker = self._create_landmarker()

    def _create_landmarker(self):
        import urllib.request

        from mediapipe.tasks.python import BaseOptions
        from mediapipe.tasks.python.vision import FaceLandmarker, FaceLandmarkerOptions

        task_path = os.getenv('FACE_LANDMARKER_TASK_PATH')
        if task_path:
            with open(task_path, 'rb') as f:
                model_bytes = f.read()
        else:
            url = os.getenv(
                'FACE_LANDMARKER_TASK_URL',
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
            )
            with urllib.request.urlopen(url) as resp:
                model_bytes = resp.read()

        options = FaceLandmarkerOptions(
            base_options=BaseOptions(model_asset_buffer=model_bytes),
            output_face_blendshapes=False,
            output_facial_transformation_matrixes=False,
            num_faces=1,
        )
        return FaceLandmarker.create_from_options(options)

    def estimate(self, rgb_image: np.ndarray) -> Tuple[Optional[float], Optional[float], Optional[float]]:
        if not isinstance(rgb_image, np.ndarray) or rgb_image.ndim != 3 or rgb_image.shape[2] != 3:
            raise ValueError('Invalid image')

        h, w, _ = rgb_image.shape

        mp_image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb_image)
        result = self._landmarker.detect(mp_image)

        if not result.face_landmarks:
            return None, None, None

        landmarks = result.face_landmarks[0]

        image_points = np.array(
            [
                (landmarks[1].x * w, landmarks[1].y * h),
                (landmarks[152].x * w, landmarks[152].y * h),
                (landmarks[33].x * w, landmarks[33].y * h),
                (landmarks[263].x * w, landmarks[263].y * h),
                (landmarks[61].x * w, landmarks[61].y * h),
                (landmarks[291].x * w, landmarks[291].y * h),
            ],
            dtype=np.float64,
        )

        model_points = np.array(
            [
                (0.0, 0.0, 0.0),
                (0.0, -330.0, -65.0),
                (-225.0, 170.0, -135.0),
                (225.0, 170.0, -135.0),
                (-150.0, -150.0, -125.0),
                (150.0, -150.0, -125.0),
            ],
            dtype=np.float64,
        )

        focal_length = float(w)
        center = (w / 2.0, h / 2.0)
        camera_matrix = np.array(
            [[focal_length, 0.0, center[0]], [0.0, focal_length, center[1]], [0.0, 0.0, 1.0]],
            dtype=np.float64,
        )
        dist_coeffs = np.zeros((4, 1), dtype=np.float64)

        try:
            import cv2

            success, rotation_vector, translation_vector = cv2.solvePnP(
                model_points,
                image_points,
                camera_matrix,
                dist_coeffs,
                flags=cv2.SOLVEPNP_ITERATIVE,
            )
            if not success:
                return None, None, None

            rotation_matrix, _ = cv2.Rodrigues(rotation_vector)
            _, angles, _, _, _, _ = cv2.RQDecomp3x3(rotation_matrix)

            pitch = float(angles[0])
            yaw = float(angles[1])
            roll = float(angles[2])

            return yaw, pitch, roll
        except Exception:
            return None, None, None
