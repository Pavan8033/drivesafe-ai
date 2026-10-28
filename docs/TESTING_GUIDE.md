# DriveSafe AI — Comprehensive Testing & Quality Assurance Guide

This document outlines the testing procedures for **DriveSafe AI**, including both automated test execution and safe, stationary manual testing scripts for demonstration and verification.

> [!CAUTION]
> **CRITICAL SAFETY DIRECTIVE: NEVER TEST WHILE DRIVING.**  
> DriveSafe AI is a research and academic prototype intended for demonstration and decision support. **ALL physical camera tests MUST be performed while stationary, seated at a desk or table.** Never operate a motor vehicle while conducting eye-closure or fatigue experiments.

---

## 1. Automated Test Suites

### A. Backend Pytest Execution
The backend test suite verifies mathematical formulas, temporal state machines, session management, and WebSocket resilience against malformed or oversized payloads.

To run the backend tests, open Windows PowerShell:
```powershell
cd c:\Users\dpava\drivesafe-ai
.\backend\venv\Scripts\python.exe -m pytest backend/tests -v
```

#### Expected Test Results:
```text
backend/tests/test_api.py::test_root_endpoint PASSED
backend/tests/test_api.py::test_health_endpoint PASSED
backend/tests/test_api.py::test_monitoring_config_endpoint PASSED
backend/tests/test_api.py::test_websocket_ping_and_session PASSED
backend/tests/test_api.py::test_websocket_malformed_json_resilience PASSED
backend/tests/test_api.py::test_websocket_corrupted_frame_handling PASSED
backend/tests/test_api.py::test_websocket_oversized_payload_rejection PASSED
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
======================== 23 passed in 1.73s ========================
```

---

### B. Frontend Production Build & TypeScript Verification
To test frontend compilation, type consistency, and bundle generation:

```powershell
cd c:\Users\dpava\drivesafe-ai\frontend
npm run build
```

#### Expected Build Output:
```text
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.3.5 building client environment for production...
transforming...
✓ 1991 modules transformed.
rendering chunks...
dist/index.html                   1.43 kB
dist/assets/index-DZQGduq_.css   36.62 kB
dist/assets/index-C_prB1D7.js   955.06 kB
✓ built in 1.71s
```

---

## 2. Stationary Desk Manual Testing Protocol

Follow these scripted procedures while seated at your desk in front of your webcam to manually verify each operational feature.

### Test Script 1: Normal Involuntary Blinking
- **Action**: Sit naturally and blink at normal intervals (100ms–300ms blinks).
- **Expected Result**: 
  - The live EAR gauge needle dips briefly into the lower range.
  - The status remains **"ALERT & ENGAGED"** (emerald).
  - **NO alarm or sound chime triggers.**
- **Verification Rule**: Short blinks must never trigger false-positive drowsiness alerts.

### Test Script 2: Sustained Eye Closure (Stationary Simulation)
- **Action**: While seated, close both eyes and maintain closure for approximately 2 to 3 seconds.
- **Expected Result**:
  - Between 0.0s and 1.4s, the status shifts to amber **"EYES CLOSED"**.
  - At exactly **1.5 seconds**, the status transitions to crimson **"POSSIBLE DROWSINESS DETECTED"**.
  - A dual-harmonic auditory warning chime rings in your speakers.
  - An event is logged to the active session tally.
  - Reopening eyes immediately restores the needle above 0.23 and resets the gauge to green.
- **Verification Rule**: Alert fires once upon crossing the 1.5s threshold, without rapid-fire duplicate alerts while eyes remain shut.

### Test Script 3: Looking Away / Head Turn
- **Action**: Turn your head 90 degrees away from the webcam so your face is no longer visible.
- **Expected Result**:
  - The status switches to charcoal/amber **"NO FACE DETECTED"**.
  - The eye closure timer is safely paused/reset.
  - Turning back to face the camera restores **"ALERT & ENGAGED"** immediately.

### Test Script 4: Yawn Simulation
- **Action**: Open your mouth wide (as in a deep yawn) and hold for 2.0 to 3.0 seconds.
- **Expected Result**:
  - The mouth aspect ratio (MAR) gauge exceeds 0.65.
  - After holding for 2.0s, a gentle acoustic notification sounds, and the status bar displays **"POSSIBLE YAWNING DETECTED"**.
  - Closing your mouth resets the MAR value to baseline (< 0.40).

### Test Script 5: Audio Mute & Volume Control
- **Action**: Navigate to **Settings** (`/app/settings`), click **"Test Harmonic Chime"**, then adjust the volume slider or toggle Mute.
- **Expected Result**:
  - Chime plays at the chosen volume level; when muted, no audio is synthesized.

### Test Script 6: Session Completion & History Persistence
- **Action**:
  1. Click **"Conclude Session"** in the Live Cockpit.
  2. Inspect the trip summary modal (shows total elapsed time, alert count, and average EAR).
  3. Navigate to **Session History** (`/app/history`).
  4. Verify the newly finished session appears at the top of the list.
  5. Refresh your browser (F5) &rarr; confirm the session remains saved.
  6. Click the trash can icon on a test session &rarr; confirm it deletes cleanly.

---

## 3. Environmental Edge-Case Notes

| Condition | Observed Behavior | Guidance |
| :--- | :--- | :--- |
| **Eyeglasses (Clear)** | MediaPipe tracks iris and eyelid contours accurately through clear lenses. | Ensure room light does not reflect directly into the lenses causing glare over pupils. |
| **Low Ambient Lighting** | Video contrast degrades; EAR readings may fluctuate or report NO FACE. | Ensure ambient lighting is in front of the driver, not directly behind them (backlighting). |
| **Webcam Disconnect** | Browser fires video stream disconnect handler; cockpit displays camera error banner gracefully. | Reconnect USB camera and click "Initialize Optical Sensor" to rebind stream. |
| **Multiple People in View** | Model is configured with `num_faces=1` and tracks the single primary face in foreground. | Designed for dedicated single-driver cockpit mounting. |
