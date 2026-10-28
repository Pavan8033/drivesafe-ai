# DriveSafe AI — Public Deployment & Cloud Architecture Guide

This guide details how to deploy **DriveSafe AI** to production cloud infrastructure. It explains the dual-host deployment model required by computer-vision applications, provides exact configuration steps, and outlines troubleshooting procedures.

---

## 1. Hosting Architecture & Technology Selection

A real-time AI computer vision application has distinct requirements that prevent it from running on a purely static web host:

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│     Vercel (or Netlify)         │       │     Render (or Railway)         │
│     Frontend Web App            │       │     Backend Telemetry Engine    │
│  - React / Vite Single Page App │       │  - Python 3.11 Docker Container │
│  - HTTPS Enabled                │       │  - Persistent WebSocket (WSS)   │
│  - Global CDN Distribution      │       │  - MediaPipe & OpenCV Binaries  │
│  - Permissions-Policy: camera   │       │  - 512MB - 1GB RAM Allocation   │
└────────────────┬────────────────┘       └────────────────┬────────────────┘
                 │                                         │
                 │              WSS Telemetry              │
                 └─────────────────────────────────────────┘
```

### Why Decoupled Hosting is Mandatory:
1. **Frontend Hosting (Vercel)**: Static hosts excel at fast asset delivery and global caching, but cannot execute Python runtimes or sustain persistent bi-directional WebSockets indefinitely.
2. **Backend Hosting (Render / Railway / Cloud Run)**: The FastAPI server requires Python, OpenCV headless libraries (`libgl1`), and persistent WebSockets for low-latency streaming (~10 FPS).

---

## 2. Part 1: Deploying the Backend on Render (Free / Starter Tier)

Render provides Docker web service hosting with native WebSocket and HTTPS support out-of-the-box.

### Step 1: Push Code to GitHub
Ensure all code and configuration files are committed to your GitHub repository:
```powershell
git add .
git commit -m "Configure production Dockerfile and deployment blueprints"
git push origin master
```

### Step 2: Create a New Web Service on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** &rarr; Select **Web Service**.
3. Connect your GitHub repository (`drivesafe-ai`).
4. Configure service parameters:
   - **Name**: `drivesafe-ai-backend`
   - **Language**: `Docker`
   - **Dockerfile Path**: `backend/Dockerfile`
   - **Docker Context**: `backend`
   - **Instance Type**: `Free` (or `Starter` for dedicated CPU/RAM)
5. Set Environment Variables:
   - `PORT` = `8000`
   - `CORS_ORIGINS` = `*` (or your Vercel frontend URL once deployed)
   - `DEFAULT_EAR_THRESHOLD` = `0.20`
   - `PROLONGED_CLOSURE_SECONDS` = `1.5`
   - `MAR_THRESHOLD` = `0.65`
6. Click **Create Web Service**.

### Step 3: Verify Backend Deployment
Once Render completes building the container, test the health endpoint:
- Open: `https://<your-render-subdomain>.onrender.com/api/health`
- Expected JSON response:
  ```json
  {
    "status": "HEALTHY",
    "version": "1.0.0",
    "model_loaded": true,
    "service": "DriveSafe AI Telemetry Engine"
  }
  ```

---

## 3. Part 2: Deploying the Frontend on Vercel

### Step 1: Import Project into Vercel
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** &rarr; **Project**.
3. Select your `drivesafe-ai` repository.
4. Set **Root Directory** to `frontend`.
5. Select Framework Preset: **Vite**.

### Step 2: Configure Production Environment Variables
Under the **Environment Variables** section in Vercel, add:
- `VITE_API_BASE_URL` = `https://<your-render-subdomain>.onrender.com`
- `VITE_WS_BASE_URL` = `wss://<your-render-subdomain>.onrender.com/ws/monitor`
- *(Optional Firebase variables if utilizing cloud authentication)*:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

### Step 3: Deploy
1. Click **Deploy**.
2. Vercel will run `npm run build` and publish your site at `https://<project-name>.vercel.app`.

---

## 4. Part 3: Firebase Configuration & Authorized Domains

If you are using Firebase Authentication and Firestore persistence:

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project &rarr; Navigate to **Authentication** &rarr; **Settings** &rarr; **Authorized Domains**.
3. Click **Add Domain** and add:
   - `<project-name>.vercel.app`
4. Navigate to **Firestore Database** &rarr; **Rules**.
5. Paste the contents of `firestore.rules` from this repository:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /sessions/{sessionId} {
         allow read, write, delete: if request.auth != null && 
           (request.resource.data.userId == request.auth.uid || resource.data.userId == request.auth.uid);
       }
       match /events/{eventId} {
         allow read, write: if request.auth != null && 
           (request.resource.data.userId == request.auth.uid || resource.data.userId == request.auth.uid);
       }
     }
   }
   ```
6. Click **Publish**.

---

## 5. Post-Deployment Verification Checklist

Once deployed, perform this step-by-step verification:

- [ ] **Public Frontend URL**: Navigate to `https://<your-app>.vercel.app/` &rarr; Landing page loads with Heritage Luxury fonts and styling.
- [ ] **HTTPS Protocol**: Verify green padlock in address bar (HTTPS).
- [ ] **Demo Operator Login**: Click "Bypass with Demo Operator" &rarr; Successfully routes to `/app`.
- [ ] **Backend Health Probe**: Open `/api/health` on Render &rarr; Returns `HEALTHY`.
- [ ] **WebSocket Handshake (WSS)**: Enter `/app/monitor`, click "Initialize Optical Sensor" &rarr; Camera stream loads over HTTPS.
- [ ] **Live Telemetry Over WSS**: Click "Begin Surveillance Session" &rarr; Brass EarGauge needle begins updating in real-time.
- [ ] **Audio Warning Test**: Navigate to `/app/settings`, click "Test Harmonic Chime" &rarr; Web Audio synthesizes alert cleanly in the deployed browser.
- [ ] **Trip Archive**: Conclude session &rarr; Trip manifest renders and persists into Session History.

---

## 6. Common Deployment Troubleshooting

### Issue 1: Mixed Content Error (`Mixed Content: This request has been blocked`)
- **Cause**: Trying to connect to an insecure WebSocket (`ws://`) from an HTTPS Vercel URL.
- **Fix**: Ensure `VITE_WS_BASE_URL` uses the secure `wss://` protocol (`wss://your-service.onrender.com/ws/monitor`).

### Issue 2: Render Cold Start Delay on Free Tier
- **Cause**: Free Render instances sleep after 15 minutes of inactivity and take ~45 seconds to wake up.
- **Fix**: When demonstrating, ping `https://<your-backend>.onrender.com/api/health` 1 minute before your presentation to ensure the instance is active and warm.

### Issue 3: Camera Permission Blocked in Production
- **Cause**: Browser requires HTTPS to access `navigator.mediaDevices.getUserMedia`.
- **Fix**: Vercel provides automatic SSL certificates, and `vercel.json` includes `Permissions-Policy: camera=(self)`. Ensure you click "Allow" when the browser modal prompts for camera permission.
