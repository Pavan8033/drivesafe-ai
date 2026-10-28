# DriveSafe AI — Local Setup & Execution Guide

Welcome to **DriveSafe AI**, an artificial intelligence telemetry platform designed for computer vision driver fatigue monitoring. This guide provides exact, step-by-step instructions for installing, configuring, and running the system on Windows using PowerShell.

---

## 1. System Architecture Overview

DriveSafe AI operates as a decoupled, real-time client-server architecture:

```
[ Webcam ] 
    │
    ▼ (Canvas Frame Ingestion @ 10 FPS)
[ React + Vite Frontend (Port 5173) ]
    │
    │  WebSocket (JSON / Base64 frames)
    ▼
[ FastAPI Backend Engine (Port 8000) ]
    ├── MediaPipe FaceLandmarker (478 3D Landmarks)
    ├── Soukupová & Čech Eye Aspect Ratio (EAR) Math
    ├── Temporal Drowsiness Engine (Hysteresis & Deduplication)
    └── Mouth Aspect Ratio (MAR) Yawn Detector
    │
    ▼  Bi-directional Telemetry Stream
[ Browser Cockpit ]
    ├── Analog Brass Chronometer (EarGauge)
    ├── Web Audio Synthesizer (Harmonic Warning Chimes)
    └── Session Archival (Dual Firestore + LocalStorage fallback)
```

---

## 2. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18.0.0 or later (Node v20+ recommended)
- **Python**: v3.11 or v3.12 or v3.13 (Python 3.13.3 verified)
- **Git**
- A working **Webcam** (internal laptop camera or USB external camera)
- A modern browser (Google Chrome, Microsoft Edge, or Mozilla Firefox)

---

## 3. Step-by-Step Installation

### Step A: Clone the Repository
Open Windows PowerShell:
```powershell
git clone https://github.com/your-username/drivesafe-ai.git
cd drivesafe-ai
```

---

### Step B: Setup and Start the Python Backend

1. Navigate to the `backend/` directory:
   ```powershell
   cd c:\Users\dpava\drivesafe-ai\backend
   ```

2. Create a Python virtual environment (if not already created):
   ```powershell
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   *(Note: If PowerShell execution policy restricts scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first).*

4. Install backend dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

5. Verify or download the MediaPipe Face Landmarker model:
   - Check that `backend\models\face_landmarker.task` exists.
   - If missing, download it using PowerShell:
     ```powershell
     New-Item -ItemType Directory -Force -Path models
     Invoke-WebRequest -Uri "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task" -OutFile "models\face_landmarker.task"
     ```

6. Start the FastAPI backend server:
   ```powershell
   .\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

7. **Verify Backend Health**:
   Open a browser or run in PowerShell:
   ```powershell
   Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health"
   ```
   **Expected Response:**
   ```json
   {
     "status": "HEALTHY",
     "version": "1.0.0",
     "model_loaded": true,
     "service": "DriveSafe AI Telemetry Engine"
   }
   ```

---

### Step C: Setup and Start the React Frontend

1. Open a **second** Windows PowerShell terminal window:
   ```powershell
   cd c:\Users\dpava\drivesafe-ai\frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. (Optional) Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```powershell
     Copy-Item .env.example .env
     ```
   - For local evaluation, defaults work out-of-the-box (`http://localhost:8000` and `ws://localhost:8000/ws/monitor`).
   - If you have a Firebase project, paste your Firebase keys in `.env` (optional; Demo Operator mode works without Firebase).

4. Start the Vite development server:
   ```powershell
   npm run dev -- --host 127.0.0.1 --port 5173
   ```

5. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173/
   ```

---

## 4. Running Without Cloud Credentials (Demo Operator Mode)

You do **not** need a Firebase account or Google Cloud credentials to evaluate or demonstrate this project:

1. Open `http://127.0.0.1:5173/login`.
2. Click the gold button labeled:
   **"Bypass with Demo Operator &rarr;"**
3. You will immediately be authenticated as **"Lord Sterling"** (`demo_driver_001`).
4. All session recordings will be saved locally in your browser's persistent storage.

---

## 5. Live Monitoring Studio Execution

1. Once logged in, navigate to **Live Cockpit** (`/app/monitor`).
2. Click **"Initialize Optical Sensor"**.
3. When prompted by your browser, click **"Allow"** to grant camera access.
4. Click **"Begin Surveillance Session"**.
5. Observe the live EAR reading on the brass chronometer gauge.
6. When seated stationary at your desk, briefly close your eyes for more than 1.5 seconds to observe the drowsiness alarm and auditory chime.
7. Click **"Conclude Session"** to view the completed trip manifest and save it to your historical record.
