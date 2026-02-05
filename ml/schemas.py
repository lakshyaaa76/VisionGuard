from typing import Literal, Optional

from pydantic import BaseModel, Field


class ImageBase64Request(BaseModel):
    image_base64: str = Field(..., description='Single RGB frame encoded as base64 image bytes')


class FacePresenceResponse(BaseModel):
    faces_detected: Literal[0, 1, 2]


class HeadPoseResponse(BaseModel):
    yaw: Optional[float]
    pitch: Optional[float]
    roll: Optional[float]
