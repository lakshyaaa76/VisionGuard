from __future__ import annotations

from typing import Optional

import numpy as np
from PIL import Image


class FacePresenceDetector:
    def __init__(self):
        from facenet_pytorch import MTCNN

        self._mtcnn = MTCNN(keep_all=True, device='cpu')

    def count_faces(self, rgb_image: np.ndarray) -> int:
        if not isinstance(rgb_image, np.ndarray) or rgb_image.ndim != 3 or rgb_image.shape[2] != 3:
            raise ValueError('Invalid image')

        pil = Image.fromarray(rgb_image)
        boxes, _ = self._mtcnn.detect(pil)

        if boxes is None:
            return 0

        count = int(boxes.shape[0])
        if count <= 0:
            return 0
        if count == 1:
            return 1
        return 2
