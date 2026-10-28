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
* **Session Archives & Analytics:** Historical logs, duration trends, experimental session stability ratings, and customizable threshold sliders.
* **Firebase & Local Demo Mode:** Supports official Firebase Authentication & Cloud Firestore while offering an instant zero-configuration demo mode for evaluators.

---

## 2. Documentation Suite

Full technical and operational documentation is available in the `docs/` directory:

* 📄 [**Current Verification Report**](file:///c:/Users/dpava/drivesafe-ai/docs/CURRENT_VERIFICATION_REPORT.md): Complete requirement-by-requirement verification matrix, evidence, and manual action audit.
* 🛠️ [**Setup & Startup Guide**](file:///c:/Users/dpava/drivesafe-ai/docs/SETUP_GUIDE.md): Step-by-step PowerShell installation and startup commands for Windows.
* 🧪 [**Testing & QA Guide**](file:///c:/Users/dpava/drivesafe-ai/docs/TESTING_GUIDE.md): Instructions for automated test execution and safe, stationary desk testing scripts.
* 🚀 [**Deployment Guide**](file:///c:/Users/dpava/drivesafe-ai/docs/DEPLOYMENT_GUIDE.md): Production deployment guide covering Vercel, Render Docker, and Firebase.
* ⚠️ [**Known Engineering Limitations**](file:///c:/Users/dpava/drivesafe-ai/docs/KNOWN_LIMITATIONS.md): Optical, physiological, environmental, and regulatory boundaries.
* 🏁 [**Final Completion Report**](file:///c:/Users/dpava/drivesafe-ai/docs/FINAL_COMPLETION_REPORT.md): Executive summary, verified feature status, and demonstration checklist.

---

## 3. Architecture & Repository Structure

```
drivesafe-ai/
├── frontend/                     # React + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # BrandLogo, PrimaryButton, StatusBadge
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
│   ├── vercel.json               # Vercel SPA routing and security headers
│   ├── tailwind.config.js        # Curated Heritage Luxury color palette
│   └── package.json
├── backend/                      # Python 3.13 FastAPI backend
│   ├── app/
│   │   ├── api/                  # health, monitoring endpoints & WebSockets
│   │   ├── services/             # face_landmarks, eye_analysis, yawn_analysis,
│   │   │                         # drowsiness_engine, session_manager
│   │   ├── config.py             # Configurable thresholds
│   │   ├── schemas.py            # Pydantic telemetry models
│   │   └── main.py               # FastAPI application with lifespan manager
│   ├── models/                   # MediaPipe face_landmarker.task model
│   ├── tests/                    # 23 automated unit and resilience tests
│   ├── Dockerfile                # Production containerfile with OpenCV dependencies
│   ├── requirements.txt
│   └── .env.example
├── docs/                         # Comprehensive engineering documentation
├── firestore.rules               # Production Firestore security rules
├── firebase.json                 # Firebase Hosting & Firestore configuration
├── render.yaml                   # 1-Click Render Docker blueprint
└── README.md
```

---

## 4. Quick Start & Execution

### Prerequisites
* **Node.js:** v18+ (tested on Node v24)
* **Python:** 3.11–3.13 (tested on Python 3.13.3 64-bit)

### Step 1: Launch Backend Server
```powershell
cd c:\Users\dpava\drivesafe-ai\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Health Check:* Open `http://127.0.0.1:8000/api/health` in your browser. Expected response:
```json
{
  "status": "HEALTHY",
  "version": "1.0.0",
  "model_loaded": true,
  "service": "DriveSafe AI Telemetry Engine"
}
```

### Step 2: Launch Frontend Development Server
In a second terminal window:
```powershell
cd c:\Users\dpava\drivesafe-ai\frontend
npm run dev -- --host 127.0.0.1 --port 5173
```
Open your browser and navigate to:
```
http://127.0.0.1:5173/
```

### Step 3: Instant Demo Operator Login
1. Navigate to `/login`.
2. Click **"Bypass with Demo Operator &rarr;"**.
3. You will be authenticated immediately as **"Lord Sterling"** (`demo_driver_001`) with local session storage persistence.

---

## 5. Automated Verification Results

### Backend Python Pytest Suite (23 Passed, 0 Failed)
The test suite verifies EAR mathematics, degenerate landmark handling, temporal debouncing, hysteresis recovery, yawning calculations, oversized payload rejection, corrupted base64 resilience, and WebSocket session lifecycles:
```powershell
.\backend\venv\Scripts\python.exe -m pytest backend/tests -v
```
**Result:**
```text
======================== 23 passed, 1 warning in 1.73s ========================
```

### Frontend Production Build
```powershell
cd frontend
npm run build
```
**Result:**
```text
✓ 1991 modules transformed.
dist/index.html                   1.43 kB
dist/assets/index-DZQGduq_.css   36.62 kB
dist/assets/index-C_prB1D7.js   955.06 kB
✓ built in 1.71s
```

---

## 6. Telemetry Mathematics & Formulations

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

## 7. Privacy & Safety Model

1. **Hardware-Local Frame Processing:** Video frames captured via `getUserMedia` are transmitted via local WebSocket directly to the local Python engine for landmark processing.
2. **Zero Raw Video Retention:** Frames are processed ephemerally in RAM. No video files or raw frames are written to persistent storage or external networks.
3. **Decision-Support Prototype:** DriveSafe AI is a driver-assistance research prototype. It does not medically diagnose fatigue or guarantee accident prevention. It does not replace required physical rest breaks.
