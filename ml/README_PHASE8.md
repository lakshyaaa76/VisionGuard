# Phase 8 — Stateless ML Inference Service (Perception Only)

This folder contains a **stateless FastAPI HTTP service** that exposes **signal-level perception modules only**.

## What this service does

- `POST /infer/face-presence`
  - Input: single RGB image frame
  - Output: `{ "faces_detected": 0 | 1 | 2 }`
  - Meaning:
    - `0` = no faces detected
    - `1` = exactly one face detected
    - `2` = two or more faces detected

- `POST /infer/head-pose`
  - Input: single RGB image frame
  - Output: `{ "yaw": float|null, "pitch": float|null, "roll": float|null }` (degrees)
  - `null` values mean pose **cannot be estimated** for this frame.

## What this service does NOT do

- No cheating/violation decisions
- No thresholds for “risk”
- No temporal aggregation
- No storage (no DB, no file writes, no image logging)
- No integration with exam sessions/users/roles

## Inputs

Each endpoint accepts **either**:

- Multipart form upload: field name `image`
- JSON body: `{ "image_base64": "..." }`

## Error handling

- Invalid image: `400`
- No face detected: valid response (`faces_detected=0`, head pose fields `null`)
- Internal errors: `500` with a generic message

## Running

Install dependencies:

```bash
pip install -r ml/requirements_phase8.txt
```

Run:

```bash
uvicorn ml.main:app --host 0.0.0.0 --port 8001
```

### MediaPipe model asset

By default the service downloads the MediaPipe Face Landmarker `.task` model **into memory** at startup.
Optionally set:

- `FACE_LANDMARKER_TASK_PATH` to use a local `.task` file.
- `FACE_LANDMARKER_TASK_URL` to override the download URL.
