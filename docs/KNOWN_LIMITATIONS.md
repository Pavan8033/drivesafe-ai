# DriveSafe AI — Known Engineering Limitations & Scientific Disclaimers

**Classification:** Academic Research Prototype & Decision-Support Demonstration  
**Document Version:** 1.0.0  
**Target Audience:** Evaluators, Project Reviewers, and Engineers  

---

## 1. Prototype Scope & Regulatory Safety Disclaimer

> [!IMPORTANT]
> **DRIVESAFE AI IS NOT A CERTIFIED AUTOMOTIVE SAFETY DEVICE.**  
> This software is an engineering proof-of-concept developed for college Design-Build evaluation and research demonstration. It has **NOT** been certified under automotive functional safety standards (ISO 26262, ASIL ratings), UNECE Driver Drowsiness and Attention Warning (DDAW) regulations, or Euro NCAP driver monitoring protocols.
> 
> **Explicit Non-Guarantees:**
> - DriveSafe AI **does NOT prevent motor vehicle collisions**.
> - DriveSafe AI **cannot guarantee the detection of all microsleep or fatigue episodes**.
> - Drivers remain 100% legally and physically responsible for the operation and safety of their vehicles at all times.

---

## 2. Optical & Environmental Limitations

### A. Ambient Lighting Extremes
- **Low Light / Night Driving:** Standard webcams rely on visible ambient light. In dark vehicle cabins at night without dedicated infrared (IR) illumination, optical sensors experience high noise (grain) and shutter lag. MediaPipe landmark confidence drops significantly under these conditions, occasionally leading to intermittent `NO_FACE` telemetry.
- **Direct Sunlight & Glare:** Strong direct sunlight or rapid shadows cast through trees can create high-contrast facial silhouettes, causing localized landmark drift around the eyelid margins.

### B. Eyewear & Occlusions
- **Polarized & Dark Sunglasses:** Dark lenses prevent optical camera sensors from observing pupil location, iris contours, and palpebral fissures. While the facial frame may be detected, the Eye Aspect Ratio (EAR) cannot be reliably evaluated through opaque lenses.
- **Heavy Eyeglass Frames:** Thick plastic frames positioned across the lateral or medial eye corners can partially obscure landmarks `p1` (lateral canthus) or `p4` (medial canthus), artificially distorting the horizontal eye width measurement.
- **Physical Occlusions:** Hands scratching the face, coffee cups, or smartphone usage near the mouth will temporarily affect Mouth Aspect Ratio (MAR) and eye tracking.

---

## 3. Physiological & Biometric Variations

### A. Individual Morphological Variation
- The default eye-closure threshold of `0.20` is derived from normalized population averages established in academic literature (Soukupová & Čech, 2016).
- Natural palpebral aperture varies across individuals (e.g., monolid eye shapes, deep-set orbits, or age-related ptosis). Some individuals exhibit a resting open-eye EAR of `0.21`, while others exhibit `0.32`.
- **Mitigation:** DriveSafe AI provides user-adjustable calibration sliders in **Settings** (`/app/settings`) to customize threshold values between `0.15` and `0.28`.

### B. Squinting vs. Microsleeps
- Smiling, laughing, or squinting against bright sunlight momentarily narrows the eye aperture.
- **Mitigation:** The temporal drowsiness engine enforces a minimum continuous closure duration of **1.5 seconds** before triggering a drowsiness alert. While this prevents normal blinks (100–300ms) from sounding alarms, intense sustained squinting can occasionally cross this threshold.

---

## 4. Hardware & Camera Geometry

### A. Single Monocular Camera vs. Stereo IR Sensors
- Commercial automotive OEM driver monitoring systems (DMS) utilize calibrated **near-infrared (NIR) 940nm LEDs** and global-shutter cameras mounted on the steering column.
- DriveSafe AI operates on consumer off-the-shelf RGB webcams (laptop webcams or USB cameras) using rolling shutters.

### B. Camera Angle & Head Rotation
- Optimal tracking occurs when the webcam is mounted directly facing the driver (pitch and yaw within &plusmn;25 degrees).
- Extreme head rotation (looking far over the shoulder or down at the floor) breaks facial symmetry, triggering `NO_FACE` until the driver faces forward again.

---

## 5. Network & Streaming Latency

- **Localhost Execution:** On local systems (`127.0.0.1`), frame transmission and telemetry return round-trip latency is **15ms–35ms**, enabling responsive 10 FPS surveillance.
- **Cloud Deployment Over Cellular (4G/5G):** When deployed on remote cloud servers (e.g., Render) and accessed over mobile data, packet jitter and upload bandwidth constraints may reduce effective frame rates to 5–8 FPS.
- **Mitigation:** The client viewport dynamically encodes frames at an optimized resolution (320&times;240 JPEG @ quality 0.65) to bound frame size to ~15KB per frame.

---

## 6. Summary of Claims & Boundaries

| Claim | Verified Reality |
| :--- | :--- |
| *Can detect prolonged eye closures &ge;1.5s in stationary conditions* | **YES — Verified with automated tests and live camera stream.** |
| *Can calculate Eye Aspect Ratio (EAR) mathematically in real-time* | **YES — Verified via Soukupová & Čech 6-point formulation.** |
| *Can detect yawning via Mouth Aspect Ratio (MAR) &ge;2.0s* | **YES — Verified with temporal duration hysteresis.** |
| *Can prevent vehicle accidents or collisions on the highway* | **NO — Strictly an academic demonstration tool.** |
| *Guaranteed 99.9% detection accuracy in all night/weather conditions* | **NO — Unrealistic without specialized near-infrared hardware.** |
