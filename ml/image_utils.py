import base64
import binascii
import io
from typing import Optional

import numpy as np
from PIL import Image


def _pil_to_rgb_np(img: Image.Image) -> np.ndarray:
    rgb = img.convert('RGB')
    return np.asarray(rgb)


def decode_image_from_base64(image_base64: str) -> np.ndarray:
    try:
        raw = base64.b64decode(image_base64, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise ValueError('Invalid image') from exc

    try:
        with Image.open(io.BytesIO(raw)) as img:
            return _pil_to_rgb_np(img)
    except Exception as exc:
        raise ValueError('Invalid image') from exc


async def decode_image_from_upload(upload) -> np.ndarray:
    try:
        raw = await upload.read()
        with Image.open(io.BytesIO(raw)) as img:
            return _pil_to_rgb_np(img)
    except Exception as exc:
        raise ValueError('Invalid image') from exc


async def decode_image(image_base64: Optional[str], upload) -> np.ndarray:
    if upload is not None:
        return await decode_image_from_upload(upload)
    if image_base64:
        return decode_image_from_base64(image_base64)
    raise ValueError('Invalid image')
