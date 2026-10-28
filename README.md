# DriveSafe AI — Heritage Luxury Driver Fatigue & Drowsiness Monitoring Platform

> **"Stay Alert. Arrive Assured."**  
> *An intelligent driver vigilance monitoring experience uniting vintage motoring club heritage with modern real-time computer vision.*

---

## 1. Project Overview

**DriveSafe AI** is an AI-powered driver drowsiness and fatigue monitoring platform. Inspired by archival automotive editorial design, vintage chronographs, and private motoring club aesthetics, the application combines high-end visual elegance with a mathematical computer-vision telemetry engine.

### Core Capabilities
* **Heritage Luxury Editorial Interface:** Warm ivory, deep forest green, antique gold accents, and refined serif typography.
* **Real-Time Facial Landmark Analysis:** 478-point facial mesh tracking via Google MediaPipe Tasks API.
* **Eye Aspect Ratio (EAR) Telemetry:** Continuous calculation based on the canonical Soukupová & Čech (2016) 6-point formulation.
* **Temporal Drowsiness State Machine:** Distinguishes normal blinks (150–300ms) from hazardous prolonged eyelid closures (&ge;1.5s) with hysteresis and event deduplication.
* **Mouth Aspect Ratio (MAR) Yawning Analysis:** Tracks sustained mouth opening to flag potential respiratory fatigue signs.
* **Synthesized Audio Alert Chimes:** Web Audio API dual-harmonic alerts and pulsed emergency alarms with built-in cooldown logic.
* **Cockpit Instrument Panel:** Live analog chronometer gauge, head position reticle, real-time diagnostic latency readouts.
* **Session Archives & Analytics:** Historical logs, duration trends, vigilance fidelity ratings, and customizable threshold sliders.
* **Firebase & Local Demo Mode:** Supports official Firebase Authentication & Cloud Firestore while offering an instant zero-configuration demo mode for evaluators.

---

## 2. Architecture & Directory Structure

```
drivesafe-ai/
├── frontend/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # BrandLogo, PrimaryButton, StatusBadge, etc.
│   │   │   ├── navigation/       # SiteNavigation, Footer
│   │   │   ├── dashboard/        # DashboardLayout, DashboardHeader, MetricCard
│   │   │   └── monitoring/       # MonitoringViewport, EarGauge
│   │   ├── context/              # AuthContext (Firebase + Demo user state)
│   │   ├── lib/                  # soundAlert (Web Audio), firebase, sessionStorage
│   │   ├── pages/                # LandingPage, LoginPage, RegisterPage,
│   │   │                         # LiveMonitoringPage, SessionHistoryPage,
│   │   │                         # InsightsPage, SettingsPage, NotFoundPage
│   │   ├── types/                # Strict TypeScript interfaces
│   │   ├── App.tsx               # Client-side routing and protected routes
│   │   └── index.css             # Heritage design tokens and styles
│   ├── public/                   # SVG Crest, Favicon, static assets
│   ├── tailwind.config.js        # Curated Heritage Luxury color palette
│   ├── package.json
│   └── .env.example
├── backend/                      # Python 3.13 FastAPI backend
│   ├── app/
│   │   ├── api/                  # health, monitoring endpoints & WebSockets
│   │   ├── services/             # face_landmarks, eye_analysis, yawn_analysis,
│   │   │                         # drowsiness_engine, session_manager
│   │   ├── config.py             # Configurable thresholds
│   │   ├── schemas.py            # Pydantic telemetry models
│   │   └── main.py               # FastAPI application with lifespan manager
│   ├── models/                   # MediaPipe face_landmarker.task model
│   ├── tests/                    # 20 automated unit and integration tests
│   ├── requirements.txt
│   └── .env.example
├── docs/
│   └── FINAL_WEBSITE_STATUS.md   # Complete verification matrix & report
├── firestore.rules               # Production Firestore security rules
├── firebase.json                 # Firebase Hosting & Firestore configuration
├── .gitignore
└── README.md
```

---

## 3. Quick Start & Execution

### Prerequisites
* **Node.js:** v18+ (tested on Node v24)
* **Python:** 3.11–3.13 (tested on Python 3.13.3 64-bit)

### Step 1: Launch Backend Server
```powershell
# Navigate to backend directory
cd backend

# Activate virtual environment
.\venv\Scripts\activate

# Start FastAPI Uvicorn server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Health Check:* Open `http://127.0.0.1:8000/api/health` in your browser.  
Expected response:
```json
{
  "status": "HEALTHY",
  "version": "1.0.0",
  "model_loaded": true,
  "service": "DriveSafe AI Telemetry Engine"
}
```

### Step 2: Launch Frontend Development Server
```powershell
# In a second terminal, navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Launch Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```
*Open Application:* Navigate to `http://127.0.0.1:5173/`.

---

## 4. Testing Suite

### Backend Python Unit Tests (20 Tests Passed)
The backend test suite verifies EAR mathematics, degenerate landmark protection, temporal closure debounce, hysteresis recovery, yawning durations, and WebSocket communication:
```powershell
cd backend
.\venv\Scripts\python.exe -m pytest tests -v
```
Output:
```
backend/tests/test_api.py::test_root_endpoint PASSED
backend/tests/test_api.py::test_health_endpoint PASSED
backend/tests/test_api.py::test_monitoring_config_endpoint PASSED
backend/tests/test_api.py::test_websocket_ping_and_session PASSED
backend/tests/test_drowsiness_engine.py::test_drowsiness_engine_initial_alert PASSED
backend/tests/test_drowsiness_engine.py::test_drowsiness_engine_short_blink_no_event PASSED
backend/tests/test_drowsiness_engine.py::test_drowsiness_engine_prolonged_closure_triggers_event_once PASSED
backend/tests/test_drowsiness_engine.py::test_drowsiness_engine_hysteresis_reopen PASSED
backend/tests/test_drowsiness_engine.py::test_drowsiness_engine_no_face_handling PASSED
backend/tests/test_eye_analysis.py::test_euclidean_distance PASSED
backend/tests/test_eye_analysis.py::test_ear_open_eye PASSED
backend/tests/test_eye_analysis.py::test_ear_closed_eye PASSED
backend/tests/test_eye_analysis.py::test_ear_degenerate_zero_width PASSED
backend/tests/test_eye_analysis.py::test_ear_invalid_length PASSED
backend/tests/test_eye_analysis.py::test_ear_nan_inf_handling PASSED
backend/tests/test_eye_analysis.py::test_compute_eyes_telemetry_synthetic_face PASSED
backend/tests/test_session_manager.py::test_session_lifecycle_and_summary PASSED
backend/tests/test_session_manager.py::test_session_manager PASSED
backend/tests/test_yawn_analysis.py::test_calculate_mar_synthetic PASSED
backend/tests/test_yawn_analysis.py::test_yawn_tracker_temporal_duration PASSED
======================== 20 passed in 1.00s ========================
```

### Frontend Production Build
```powershell
cd frontend
npm run build
```
Compiles with 0 errors via TypeScript and Vite into `frontend/dist/`.

---

## 5. Telemetry Mathematics

### Eye Aspect Ratio (EAR)
For 6 ordered eye landmarks $p_1, p_2, p_3, p_4, p_5, p_6$:
$$\text{EAR} = \frac{\|p_2 - p_6\| + \|p_3 - p_5\|}{2 \cdot \|p_1 - p_4\|}$$
* Normal open eye coefficient: $\approx 0.28 - 0.35$
* Default closure threshold: $< 0.20$
* Reopening hysteresis threshold: $\ge 0.23$

### Mouth Aspect Ratio (MAR)
$$\text{MAR} = \frac{\|p_{13} - p_{14}\| + \|p_{37} - p_{84}\| + \|p_{267} - p_{314}\|}{2 \cdot \|p_{61} - p_{291}\|}$$
* Normal closed/speaking mouth: $\approx 0.20 - 0.40$
* Default yawn threshold: $\ge 0.65$ sustained for $\ge 2.0\text{s}$

---

## 6. Privacy & Safety Model

1. **Hardware-Local Frame Processing:** Video frames captured via `getUserMedia` are transmitted via localhost WebSocket directly to the local Python engine for landmark processing.
2. **Zero Raw Video Retention:** Frames are processed ephemerally in RAM. No video files or raw frames are written to persistent storage or external networks.
3. **Assistive Nature:** DriveSafe AI is a driver-assistance research prototype. It does not medically diagnose fatigue or guarantee accident prevention. It does not replace required physical rest breaks.
