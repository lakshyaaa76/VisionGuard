from __future__ import annotations

from fastapi import FastAPI, HTTPException
from pydantic import ValidationError
from starlette.requests import Request

from .face_presence import FacePresenceDetector
from .head_pose import HeadPoseEstimator
from .image_utils import decode_image
from .schemas import FacePresenceResponse, HeadPoseResponse, ImageBase64Request

app = FastAPI()

_face_detector = FacePresenceDetector()
_head_pose_estimator = HeadPoseEstimator()


async def _decode_rgb_from_request(request: Request):
    content_type = (request.headers.get('content-type') or '').lower()

    if 'application/json' in content_type:
        try:
            body = await request.json()
            payload = ImageBase64Request.model_validate(body)
            return await decode_image(payload.image_base64, None)
        except (ValidationError, ValueError):
            raise ValueError('Invalid image')

    if 'multipart/form-data' in content_type:
        form = await request.form()
        upload = form.get('image')
        image_base64 = form.get('image_base64')

        if upload is not None and hasattr(upload, 'read'):
            return await decode_image(None, upload)
        if isinstance(image_base64, str) and image_base64:
            return await decode_image(image_base64, None)

        raise ValueError('Invalid image')

    raise ValueError('Invalid image')


@app.post('/infer/face-presence', response_model=FacePresenceResponse)
async def infer_face_presence(request: Request):
    try:
        rgb = await _decode_rgb_from_request(request)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid image')

    try:
        faces = _face_detector.count_faces(rgb)
        return FacePresenceResponse(faces_detected=faces)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid image')
    except Exception:
        raise HTTPException(status_code=500, detail='Server Error')


@app.post('/infer/head-pose', response_model=HeadPoseResponse)
async def infer_head_pose(request: Request):
    try:
        rgb = await _decode_rgb_from_request(request)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid image')

    try:
        yaw, pitch, roll = _head_pose_estimator.estimate(rgb)
        return HeadPoseResponse(yaw=yaw, pitch=pitch, roll=roll)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid image')
    except Exception:
        raise HTTPException(status_code=500, detail='Server Error')
