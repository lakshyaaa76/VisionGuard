# Invigilo — ML-Based Online Exam Proctoring System

Invigilo is an online examination platform with integrity monitoring and a strict separation between:

- Academic evaluation (grading)
- Integrity review (proctoring)

Machine Learning is used **only** to generate **signal-level integrity indicators** (face presence + head pose). **A human proctor records the final integrity verdict.**

## Core design principles

- Academic evaluation ≠ integrity evaluation
- ML is advisory only (signal generation), **never decision-making**
- No automated punishments
- Strict role-based authority (RBAC)
- Append-only integrity evidence/events

## Roles

- **Candidate**
  - Takes exams
  - Allows webcam sampling
  - Sees only neutral status + score (when released)
- **Proctor**
  - Reviews integrity events/evidence
  - Submits integrity verdict: `CLEARED` or `INVALIDATED`
- **Admin**
  - Manages exams/questions
  - Performs academic evaluation
  - Full system visibility (but no silent overrides of integrity outcomes)

## Candidate-facing result visibility (Phase 10)

Scores are always computed, but may be withheld.

- `finalStatus = EVALUATED`
  - Score is visible to the candidate
- `finalStatus = INVALIDATED`
  - Score is withheld and the attempt is rejected
- `finalStatus = null` (not finalized)
  - Candidate only sees `UNDER_REVIEW` (neutral wording)

Candidates never see integrity reasoning, ML labels, or proctor identity.

## Architecture

`React (frontend)` → `Node/Express (backend)` → `FastAPI (ML inference)`

Frontend never calls ML directly.

## Services & ports

- **Frontend (React):** `http://localhost:3000`
- **Backend API (Express):** `http://localhost:5000`
- **ML inference service (FastAPI):** `http://localhost:8001`

## Running the project (local)

You will run **MongoDB**, **backend**, **frontend**, and **ML service** in separate terminals.

### Prerequisites

- Node.js + npm
- Python 3.10+ recommended
- MongoDB (local or Atlas)

### 1) Backend (Node + Express)

Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/proctoring_db
JWT_SECRET=replace_with_a_secret

# Optional (defaults to http://localhost:8001)
ML_SERVICE_URL=http://localhost:8001
```

Run:

```bash
cd backend
npm install
npm start
```

### 2) Create the first admin user

From `backend/`:

```bash
npm run seed:admin "Your Name" "admin@example.com" "your-secure-password"
```

### 3) Frontend (React)

```bash
cd frontend
npm install
npm start
```

### 4) ML inference service (FastAPI)

Create & activate a virtual environment:

```bash
python -m venv ml/venv

# Windows (PowerShell)
ml\venv\Scripts\Activate.ps1

# macOS/Linux
source ml/venv/bin/activate
```

Install dependencies:

```bash
pip install -r ml/requirements_phase8.txt
```

Run the service (from the repo root):

```bash
python -m uvicorn ml.main:app --reload --host 0.0.0.0 --port 8001
```

## ML inference API (perception only)

This service is **stateless** and does not store images or sessions.

- `POST /infer/face-presence`
  - Output: `{ "faces_detected": 0 | 1 | 2 }`
  - Meaning:
    - `0` = no faces detected
    - `1` = exactly one face detected
    - `2` = two or more faces detected

- `POST /infer/head-pose`
  - Output: `{ "yaw": float|null, "pitch": float|null, "roll": float|null }` (degrees)
  - `null` values mean pose cannot be estimated for the frame

Each endpoint accepts either:

- Multipart form upload: field name `image`
- JSON body: `{ "image_base64": "..." }`

## What this project is not

- Not fully automated cheating detection
- Not AI-based grading
- Not a black-box enforcement system