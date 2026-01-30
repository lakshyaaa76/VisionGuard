ML-Based Online Exam Proctoring System
1. Project Summary

This project is an online examination platform with integrity monitoring, designed with a strict separation between academic evaluation and exam proctoring.

Machine Learning is used only to generate behavioral signals (face presence and head pose).
Human proctors make all final integrity decisions.

The system is intentionally designed to be:

Explainable

Auditable

Scalable

Defensible in academic and technical evaluations

2. Core Design Principles (DO NOT VIOLATE)

Academic evaluation ≠ Integrity evaluation

ML is advisory only (signal generation)

No automatic punishments

Strict role-based authority

Only flagged sessions require human review

Offline ML training, online ML inference

3. Roles (RBAC – Locked)
Candidate (Exam Taker)

Attempts exams

Grants webcam permissions

Views exam status and results (only if cleared)

Proctor (Integrity Authority)

Reviews integrity violations

Confirms or dismisses flags

Sets final integrity verdict

Can terminate live exam sessions (optional enhancement)

Admin (Academic & Policy Authority)

Creates exams and questions

Configures proctoring thresholds

Performs academic evaluation

Has full system visibility

Can suspend/ban users (with audit trail)

4. Exam & Evaluation Model
Supported Exam Formats

MCQs (primary)

Multiple-select MCQs

Coding questions (auto-evaluated via test cases)

Subjective questions (admin-evaluated, optional)

Academic Evaluation

MCQs & coding → system-evaluated

Subjective answers → admin-evaluated

Scores are always computed

Scores may be withheld, never altered, based on integrity verdict

5. Integrity Monitoring Model
ML-Based Signals

No face detected

Multiple faces detected

Prolonged looking away (head pose)

Non-ML Signals

Tab/window switching

Browser focus loss

ML never decides cheating.
It outputs signals + confidence only.

6. Integrity Review Workflow

Candidate submits exam

Automatic integrity assessment runs

If thresholds are exceeded:

Status → UNDER_REVIEW

Proctor reviews evidence

Proctor sets verdict:

CLEARED

INVALIDATED

Clean sessions are auto-cleared and bypass proctor review.

7. Candidate-Facing Exam Statuses

Candidates only see neutral system states:

EVALUATED → score visible

UNDER_REVIEW → score withheld

INVALIDATED → attempt rejected

No ML scores, violation details, or proctor identity is exposed.

8. System Architecture
React Frontend
   |
   | REST + WebSockets
   v
Node.js Backend (Express)
   |
   | HTTP
   v
ML Inference Service (FastAPI)


Frontend never communicates directly with ML

Backend enforces RBAC and orchestration

ML inference service is stateless and isolated

9. Tech Stack
Frontend

React

WebRTC (camera access)

WebSockets (real-time alerts)

Backend

Node.js + Express

MongoDB

JWT Authentication

Role-Based Access Control (RBAC)

Machine Learning

Training: Google Colab (offline only)

Inference: Python + FastAPI

Models:

Face presence detection

Head pose estimation

Storage

Object storage for snapshots and integrity evidence

10. Machine Learning Workflow (Explicit)
ML Training (Offline Only)

Platform: Google Colab

Purpose:

Dataset preprocessing

Model training

Hyperparameter tuning

Model evaluation

Output:

Exported model weights

Saved preprocessing pipelines

⚠️ Google Colab is used strictly for offline training.
It is NEVER used for live inference or exam-time processing.

ML Inference (Online)

Platform: Python + FastAPI

Purpose:

Run inference on frames sent by backend

Return raw signals + confidence scores

Constraints:

Stateless

<300 ms latency

No business logic

No access to users, exams, or roles

ML Responsibility Boundaries
Task	ML	System	Human
Face detection	✅	❌	❌
Head pose estimation	✅	❌	❌
Violation decision	❌	❌	✅ (Proctor)
Exam grading	❌	✅	❌
User penalties	❌	❌	✅ (Admin)
11. Core MongoDB Entities

users

exams

questions

exam_sessions

responses

integrity_events

Academic data and integrity data are never mixed.

12. Authority & Decision Rules

Proctor sets integrity verdict

Admin governs policy and long-term actions

System releases or withholds results

No silent overrides are allowed

13. Proposed Folder Structure
project-root/
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/
│   │   │   ├── candidate/         # Exam UI, results
│   │   │   ├── proctor/           # Review dashboard
│   │   │   └── admin/             # Exam creation, evaluation
│   │   ├── services/              # API & WebSocket clients
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Helpers (timers, permissions)
│   │   └── App.jsx
│   └── package.json
│
├── backend/                      # Node.js backend
│   ├── src/
│   │   ├── config/                # Env, DB, JWT config
│   │   ├── models/                # Mongoose schemas
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── exam.routes.js
│   │   │   ├── session.routes.js
│   │   │   ├── proctor.routes.js
│   │   │   └── admin.routes.js
│   │   ├── controllers/           # Request handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── rbac.middleware.js
│   │   ├── services/              # Business logic
│   │   ├── sockets/               # WebSocket handlers
│   │   └── app.js
│   └── package.json
│
├── ml-training/                  # Google Colab notebooks (offline)
│   ├── face_presence.ipynb
│   ├── head_pose.ipynb
│   ├── data_preprocessing.ipynb
│   └── model_evaluation.ipynb
│
├── ml-service/                   # ML inference service (FastAPI)
│   ├── app/
│   │   ├── models/                # Exported trained weights
│   │   ├── inference/             # Inference logic only
│   │   ├── schemas/               # Request/response schemas
│   │   └── main.py
│   └── requirements.txt
│
├── docs/                         # Design documents
│   ├── architecture.md
│   ├── api-spec.md
│   └── state-machine.md
│
├── README.md
└── .env.example

14. High-Level Implementation Roadmap

Authentication & RBAC

Exam & question management

Exam session lifecycle

Academic evaluation engine

Integrity event logging

Proctor review workflow

ML training (Google Colab)

ML inference service

ML integration & thresholds

Result release logic

Evidence & auditing

15. What This Project Is NOT

Not blockchain-based

Not fully automated cheating detection

Not AI-based grading

Not emotion or eye-tracking surveillance

Not a black-box AI system

16. Intended Use

This project is intended for:

Academic submissions

Portfolio demonstration

Research and learning

Not for production deployment without additional legal, privacy, and security review.

## Running the Project

To run this project, you will need to start the backend, frontend, and ML services in separate terminals. You will also need a running instance of MongoDB.

### 1. Prerequisites

-   **Node.js and npm**: Required for the backend and frontend.
-   **Python and pip**: Required for the ML service.
-   **MongoDB**: A running instance is required for the backend to connect to. You can use a local installation or a cloud service like MongoDB Atlas.

### 2. Setup

#### a. Backend (Node.js + Express)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Ensure your `.env` file** in the `backend` directory is configured correctly:
    ```
    MONGO_URI=mongodb://localhost:27017/proctoring_db
    JWT_SECRET=a_very_secret_key
    ```
4.  **Start the server:**
    ```bash
    npm start
    ```
    The backend will be running on `http://localhost:5000`.

#### b. Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the development server:**
    ```bash
    npm start
    ```
    The frontend will be running on `http://localhost:3000`.

#### c. ML Service (FastAPI)

1.  **Navigate to the ml directory:**
    ```bash
    cd ml
    ```
2.  **Activate the virtual environment:**
    -   **Windows:**
        ```bash
        .\venv\Scripts\activate
        ```
    -   **macOS/Linux:**
        ```bash
        source venv/bin/activate
        ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Start the FastAPI server:**
    ```bash
    uvicorn main:app --reload
    ```
    The ML service will be running on `http://localhost:8000`.

### 3. Running Order

1.  Ensure your MongoDB instance is running.
2.  Start the backend server.
3.  Start the frontend development server.
4.  Start the ML service.