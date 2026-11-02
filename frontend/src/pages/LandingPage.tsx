import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Shield,
  Bell,
  Gauge,
  LineChart,
  Lock,
  ArrowRight,
  Play,
  Cpu,
  Layers,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Wifi,
  Clock,
  ScanFace,
  Volume2,
  Compass,
} from 'lucide-react';
import { SiteNavigation } from '../components/navigation/SiteNavigation';
import { Footer } from '../components/navigation/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ivory text-obsidian selection:bg-champagne/30 selection:text-emerald-dark overflow-x-hidden">
      {/* Navigation Header */}
      <SiteNavigation />

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: HERO SECTION (Wide Cinematic Luxury GT Motoring)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-[92vh] lg:min-h-screen flex flex-col justify-between pt-24 pb-8 px-6 md:px-12 bg-obsidian text-ivory overflow-hidden border-b border-champagne/20"
      >
        {/* Genuine Luxury Aston Martin DBS Hero Vehicle Photograph */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_luxury_tourer.jpg"
            alt="British racing green luxury grand tourer overlooking scenic alpine pass at sunset"
            className="w-full h-full object-cover object-right lg:object-center filter brightness-[0.95] contrast-[1.05]"
            loading="eager"
            fetchPriority="high"
          />
          {/* Two-Zone Editorial Gradient: Dark solid negative space on left fading smoothly toward the car */}
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 via-40% to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/95 via-transparent to-obsidian/40" />
        </div>

        {/* Hero Central Editorial Content - Strictly Anchored to Left Zone */}
        <div className="max-w-7xl mx-auto w-full relative z-10 my-auto pt-12 md:pt-20">
          <div className="max-w-xl lg:max-w-2xl space-y-6 animate-fade-up">
            {/* Eyebrow Label with Glowing Indicator */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full border border-champagne/40 bg-obsidian/75 backdrop-blur-md text-champagne text-[11px] font-mono tracking-widest shadow-sm">
              <span className="w-2 h-2 rounded-full bg-champagne animate-pulse" />
              <span>AI-POWERED DRIVER SAFETY</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-ivory leading-[1.08]">
              Stay Alert. <br />
              <span className="italic font-normal text-champagne-light">
                Arrive Assured.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-base sm:text-lg md:text-xl text-parchment/85 leading-relaxed font-sans max-w-xl">
              Intelligent driver monitoring that recognizes observable signs of drowsiness through real-time facial landmark analysis &mdash; for safer journeys ahead.
            </p>

            {/* Call To Action Controls */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={() => navigate('/app/monitor')}
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-sm tracking-wide transition-all shadow-sm hover:shadow-gold-glow group"
              >
                <Compass className="w-4 h-4 text-obsidian" />
                <span>Enter the Monitoring Studio</span>
                <ArrowRight className="w-4 h-4 text-obsidian transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => {
                  const el = document.getElementById('technology');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded bg-obsidian/60 hover:bg-obsidian/90 backdrop-blur-md text-ivory border border-champagne/40 hover:border-champagne text-sm font-medium transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 text-champagne fill-champagne" />
                <span>Explore the Technology</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Bottom Strip: Three Restrained Feature Indicators & Centered Scroll Indicator */}
        <div className="max-w-7xl mx-auto w-full relative z-10 pt-8 mt-12 border-t border-champagne/20 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Three Restrained Feature Indicators matching reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-10 text-xs font-sans tracking-wide">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-champagne/35 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center text-champagne shrink-0">
                <Eye className="w-4 h-4 text-champagne" />
              </div>
              <div className="text-[10px] font-mono tracking-wider text-parchment uppercase leading-tight font-semibold">
                REAL-TIME<br />OBSERVATION
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-champagne/35 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center text-champagne shrink-0">
                <Cpu className="w-4 h-4 text-champagne" />
              </div>
              <div className="text-[10px] font-mono tracking-wider text-parchment uppercase leading-tight font-semibold">
                AI-POWERED<br />ANALYSIS
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded border border-champagne/35 bg-obsidian/70 backdrop-blur-sm flex items-center justify-center text-champagne shrink-0">
                <Shield className="w-4 h-4 text-champagne" />
              </div>
              <div className="text-[10px] font-mono tracking-wider text-parchment uppercase leading-tight font-semibold">
                PRIVACY-FIRST<br />DESIGN
              </div>
            </div>
          </div>

          {/* Centered Scroll Indicator matching reference */}
          <div
            onClick={() => {
              const el = document.getElementById('purpose');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="self-center flex flex-col items-center gap-1.5 cursor-pointer text-parchment/60 hover:text-champagne transition-colors group"
          >
            <div className="w-4 h-7 rounded-full border border-champagne/40 flex items-start justify-center p-1 group-hover:border-champagne transition-colors">
              <div className="w-1 h-2 bg-champagne rounded-full animate-bounce" />
            </div>
            <div className="flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase">
              <span>SCROLL TO EXPLORE</span>
              <ChevronDown className="w-3 h-3 text-champagne transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: OUR PURPOSE (Because Every Second Matters)
          ───────────────────────────────────────────────────────────── */}
      <section id="purpose" className="py-24 px-6 md:px-12 bg-ivory border-b border-champagne/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-block px-3 py-1 rounded border border-champagne/40 bg-parchment/50 text-emerald text-[11px] eyebrow font-semibold">
                OUR PURPOSE
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-obsidian leading-[1.15]">
                Because Every <br />
                <span className="italic font-normal text-emerald">Second Matters.</span>
              </h2>

              <p className="text-base md:text-lg text-secondary-text leading-relaxed font-sans">
                Driver fatigue can reduce reaction time, impair judgment and lead to dangerous situations. DriveSafe AI observes, analyzes and alerts &mdash; so you can stay focused on what matters most.
              </p>

              <p className="text-sm text-secondary-text leading-relaxed font-sans">
                Prolonged driving across highway corridors, late-night transit, and monotonous commutes often induce micro-sleep episodes &mdash; fleeting eyelid closures sustained without driver awareness. DriveSafe AI acts as an analytical companion, safeguarding every mile with respectful digital vigilance.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded bg-emerald hover:bg-heritage text-ivory text-xs md:text-sm font-semibold tracking-wide transition-all shadow-sm border border-champagne/30"
                >
                  <span>Our Mission</span>
                  <ArrowRight className="w-3.5 h-3.5 text-champagne" />
                </button>
              </div>
            </div>

            {/* Right Editorial Driver Composite with Verified Stats */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded overflow-hidden border border-champagne/30 shadow-luxury bg-obsidian">
                <img
                  src="/images/driver_fatigue_editorial.jpg"
                  alt="Focused driver in luxury car looking ahead at sunset road"
                  className="w-full h-80 sm:h-96 object-cover object-center filter contrast-[1.05]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />

                {/* Overlaid Verified Metrics Strip */}
                <div className="absolute bottom-0 left-0 right-0 p-6 grid grid-cols-3 gap-4 text-center border-t border-champagne/20 bg-obsidian/75 backdrop-blur-md">
                  <div>
                    <span className="font-serif text-2xl sm:text-3xl font-medium text-champagne block">
                      478
                    </span>
                    <span className="eyebrow text-[9px] sm:text-[10px] text-parchment/70 tracking-wider">
                      FACIAL LANDMARKS
                    </span>
                  </div>

                  <div className="border-x border-champagne/20">
                    <span className="font-serif text-2xl sm:text-3xl font-medium text-champagne block">
                      &lt; 300ms
                    </span>
                    <span className="eyebrow text-[9px] sm:text-[10px] text-parchment/70 tracking-wider">
                      BLINK DETECTION
                    </span>
                  </div>

                  <div>
                    <span className="font-serif text-2xl sm:text-3xl font-medium text-champagne block">
                      2.0s
                    </span>
                    <span className="eyebrow text-[9px] sm:text-[10px] text-parchment/70 tracking-wider">
                      YAWN ANALYSIS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: HOW IT WORKS (From Camera to Alert)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 px-6 md:px-12 bg-obsidian text-ivory border-b border-champagne/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 dark-instrument-panel opacity-60 pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-block px-3 py-1 rounded-full border border-champagne/30 bg-emerald/30 text-champagne text-[11px] eyebrow mb-3">
            HOW IT WORKS
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ivory mb-3">
            HOW IT WORKS
          </h2>

          <p className="text-sm md:text-base text-parchment/70 max-w-xl mx-auto font-sans mb-16">
            From camera to alert &mdash; in just a few steps.
          </p>

          {/* 4 Connected Step Markers */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 mt-8">
            {/* Golden Horizontal Connecting Line (Desktop) */}
            <div className="hidden lg:block absolute top-7 left-12 right-12 h-px bg-gradient-to-r from-champagne/10 via-champagne/50 to-champagne/10 z-0" />

            {/* Step 01: Capture */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 rounded bg-obsidian-card/80 border border-champagne/20 backdrop-blur-sm hover:border-champagne/50 transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald text-champagne flex items-center justify-center font-mono text-base font-semibold border-2 border-champagne shadow-gold-glow mb-5">
                01
              </div>
              <h3 className="font-serif text-xl font-medium text-ivory mb-2">
                Capture
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed font-sans">
                Camera frames with your explicit permission, processed at 10 FPS without external streaming.
              </p>
            </div>

            {/* Step 02: Analyze */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 rounded bg-obsidian-card/80 border border-champagne/20 backdrop-blur-sm hover:border-champagne/50 transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald text-champagne flex items-center justify-center font-mono text-base font-semibold border-2 border-champagne shadow-gold-glow mb-5">
                02
              </div>
              <h3 className="font-serif text-xl font-medium text-ivory mb-2">
                Analyze
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed font-sans">
                Detect 478 3D facial landmarks and calculate key indicators including palpebral contour geometry.
              </p>
            </div>

            {/* Step 03: Calculate */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 rounded bg-obsidian-card/80 border border-champagne/20 backdrop-blur-sm hover:border-champagne/50 transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald text-champagne flex items-center justify-center font-mono text-base font-semibold border-2 border-champagne shadow-gold-glow mb-5">
                03
              </div>
              <h3 className="font-serif text-xl font-medium text-ivory mb-2">
                Calculate
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed font-sans">
                Evaluate EAR, MAR and temporal duration patterns against mathematical thresholds.
              </p>
            </div>

            {/* Step 04: Alert */}
            <div className="relative z-10 flex flex-col items-center text-center p-6 rounded bg-obsidian-card/80 border border-champagne/20 backdrop-blur-sm hover:border-champagne/50 transition-all">
              <div className="w-14 h-14 rounded-full bg-emerald text-champagne flex items-center justify-center font-mono text-base font-semibold border-2 border-champagne shadow-gold-glow mb-5">
                04
              </div>
              <h3 className="font-serif text-xl font-medium text-ivory mb-2">
                Alert
              </h3>
              <p className="text-xs text-parchment/70 leading-relaxed font-sans">
                Issue timely acoustic and visual warnings when configured closure or fatigue conditions are met.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 4: CAPABILITIES (Varied & Balanced Layout)
          ───────────────────────────────────────────────────────────── */}
      <section id="capabilities" className="py-24 px-6 md:px-12 bg-ivory border-b border-champagne/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="eyebrow inline-block mb-3 px-3 py-1 rounded border border-champagne/40 bg-parchment/50 text-emerald">
              INTELLIGENT CAPABILITIES
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-obsidian mb-4">
              Precision Telemetry. Calibrated Safety.
            </h2>
            <p className="text-base text-secondary-text leading-relaxed">
              Every capability is engineered to provide reliable, non-intrusive fatigue detection based strictly on implemented computer vision algorithms.
            </p>
          </div>

          {/* Varied Layout: 2 Hero Feature Cards + 4 Detailed Spec Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Feature 1: Landmark & EAR */}
            <div className="p-8 rounded bg-parchment/40 border border-champagne/30 shadow-sm flex flex-col justify-between hover:border-champagne/60 transition-all">
              <div>
                <div className="w-12 h-12 rounded-full bg-emerald text-champagne flex items-center justify-center mb-6 border border-champagne/30">
                  <ScanFace className="w-6 h-6" />
                </div>
                <span className="eyebrow text-champagne-dark text-[10px] tracking-widest block mb-2">
                  OPHTHALMIC GEOMETRY
                </span>
                <h3 className="font-serif text-2xl font-medium text-obsidian mb-3">
                  Face Landmarks &amp; Eye Aspect Ratio (EAR)
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed font-sans mb-4">
                  Using 478 3D facial landmarks from MediaPipe, DriveSafe AI continuously calculates the vertical and horizontal Euclidean eye landmark distances based on Soukupov&aacute; &amp; Čech algorithms.
                </p>
              </div>
              <div className="pt-4 border-t border-champagne/20 flex items-center justify-between text-xs font-mono text-emerald">
                <span>Metric: 6-Point Eyelid Vector</span>
                <span className="font-semibold">Baseline: &ge; 0.20</span>
              </div>
            </div>

            {/* Feature 2: Prolonged Closure */}
            <div className="p-8 rounded bg-parchment/40 border border-champagne/30 shadow-sm flex flex-col justify-between hover:border-champagne/60 transition-all">
              <div>
                <div className="w-12 h-12 rounded-full bg-emerald text-champagne flex items-center justify-center mb-6 border border-champagne/30">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="eyebrow text-champagne-dark text-[10px] tracking-widest block mb-2">
                  TEMPORAL FILTERING
                </span>
                <h3 className="font-serif text-2xl font-medium text-obsidian mb-3">
                  Prolonged Eye-Closure Analysis
                </h3>
                <p className="text-sm text-secondary-text leading-relaxed font-sans mb-4">
                  Normal blinks last 100&ndash;400ms. When palpebral closure is sustained continuously beyond 1.50 seconds (15 consecutive frames @ 10 FPS), the system identifies a possible micro-sleep occurrence.
                </p>
              </div>
              <div className="pt-4 border-t border-champagne/20 flex items-center justify-between text-xs font-mono text-emerald">
                <span>Threshold: 1.50 Seconds</span>
                <span className="font-semibold">Micro-Sleep Protection</span>
              </div>
            </div>
          </div>

          {/* 4 Supporting Feature Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded bg-ivory border border-champagne/25 shadow-sm">
              <Gauge className="w-6 h-6 text-champagne-dark mb-4" />
              <h4 className="font-serif text-lg font-medium text-obsidian mb-2">
                Mouth Aspect Ratio (MAR)
              </h4>
              <p className="text-xs text-secondary-text leading-relaxed font-sans">
                Monitors lip landmarks to evaluate vertical mouth aperture for sustained yawning patterns.
              </p>
            </div>

            <div className="p-6 rounded bg-ivory border border-champagne/25 shadow-sm">
              <Volume2 className="w-6 h-6 text-champagne-dark mb-4" />
              <h4 className="font-serif text-lg font-medium text-obsidian mb-2">
                Harmonic Audio Alerts
              </h4>
              <p className="text-xs text-secondary-text leading-relaxed font-sans">
                Web Audio API synthesizer generating dual-frequency acoustic tones with cooldown safeguards.
              </p>
            </div>

            <div className="p-6 rounded bg-ivory border border-champagne/25 shadow-sm">
              <Shield className="w-6 h-6 text-champagne-dark mb-4" />
              <h4 className="font-serif text-lg font-medium text-obsidian mb-2">
                Privacy-Conscious
              </h4>
              <p className="text-xs text-secondary-text leading-relaxed font-sans">
                Frames are processed in-session over local loopback. No raw video is harvested or saved remotely.
              </p>
            </div>

            <div className="p-6 rounded bg-ivory border border-champagne/25 shadow-sm">
              <LineChart className="w-6 h-6 text-champagne-dark mb-4" />
              <h4 className="font-serif text-lg font-medium text-obsidian mb-2">
                Session Telemetry Log
              </h4>
              <p className="text-xs text-secondary-text leading-relaxed font-sans">
                Permanent chronological record of trip durations, event counts, and fatigue distributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 5: THE TECHNOLOGY (Computer Vision Meets Intelligent Safety)
          ───────────────────────────────────────────────────────────── */}
      <section
        id="technology"
        className="py-24 px-6 md:px-12 bg-obsidian text-ivory border-b border-champagne/20 relative"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Narrative Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow inline-block px-3 py-1 rounded border border-champagne/30 bg-emerald/30 text-champagne">
                THE TECHNOLOGY
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-ivory leading-tight">
                Computer Vision Meets <br />
                <span className="text-champagne italic font-normal">
                  Intelligent Safety.
                </span>
              </h2>

              <p className="text-base text-parchment/80 leading-relaxed font-sans">
                Built with MediaPipe and advanced AI models, DriveSafe AI analyzes facial landmarks, eye movements and behavioural patterns in real time.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/app/monitor')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded border border-champagne text-champagne hover:bg-champagne/10 text-xs md:text-sm font-semibold tracking-wide transition-all shadow-sm"
                >
                  <span>Explore the Technology</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Side: Biometric Mesh Visual & Architecture Checklist */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Biometric Face Mesh Image */}
              <div className="rounded overflow-hidden border border-champagne/30 shadow-luxury-dark bg-obsidian-card">
                <img
                  src="/images/biometric_face_mesh.jpg"
                  alt="478 facial landmark points geometry map with EAR telemetry"
                  className="w-full h-auto object-cover filter contrast-[1.1]"
                  loading="lazy"
                />
              </div>

              {/* Technology Points with Line Icons */}
              <div className="space-y-4">
                <div className="p-3.5 rounded bg-obsidian-card border border-champagne/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald/60 text-champagne flex items-center justify-center shrink-0 border border-champagne/30">
                    <ScanFace className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory">
                      MediaPipe Face Landmarks
                    </h4>
                    <p className="text-[11px] text-parchment/60 font-sans">
                      478 3D coordinates tracked at sub-millisecond precision.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-obsidian-card border border-champagne/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald/60 text-champagne flex items-center justify-center shrink-0 border border-champagne/30">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory">
                      EAR &amp; MAR Calculation
                    </h4>
                    <p className="text-[11px] text-parchment/60 font-sans">
                      Rigorous Euclidean distance formulas for eye and mouth ratios.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-obsidian-card border border-champagne/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald/60 text-champagne flex items-center justify-center shrink-0 border border-champagne/30">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory">
                      Temporal Analysis
                    </h4>
                    <p className="text-[11px] text-parchment/60 font-sans">
                      Threshold verification across continuous frame sequences.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-obsidian-card border border-champagne/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald/60 text-champagne flex items-center justify-center shrink-0 border border-champagne/30">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory">
                      Real-Time Alerts
                    </h4>
                    <p className="text-[11px] text-parchment/60 font-sans">
                      Instant auditory pulses and high-contrast HUD warnings.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded bg-obsidian-card border border-champagne/15 flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-emerald/60 text-champagne flex items-center justify-center shrink-0 border border-champagne/30">
                    <Wifi className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-semibold text-ivory">
                      WebSocket Live Streaming
                    </h4>
                    <p className="text-[11px] text-parchment/60 font-sans">
                      Bi-directional streaming between React client and Python backend.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 6: HERITAGE DESIGN & MODERN INTELLIGENCE
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-12 bg-ivory border-b border-champagne/20">
        <div className="max-w-6xl mx-auto text-center">
          <span className="eyebrow text-emerald text-[11px] block mb-2">
            DESIGN PHILOSOPHY
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-obsidian tracking-tight mb-12">
            Premium Heritage Design. Modern AI Technology.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Card 1: Timeless Heritage */}
            <div className="p-6 rounded bg-parchment/50 border border-champagne/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="rounded overflow-hidden mb-5 border border-champagne/20">
                  <img
                    src="/images/vintage_luxury_cockpit.jpg"
                    alt="Handcrafted vintage luxury Aston Martin wood and leather cockpit"
                    className="w-full h-52 object-cover object-center filter contrast-[1.05]"
                    loading="lazy"
                  />
                </div>
                <span className="eyebrow text-champagne-dark text-[10px] tracking-widest block mb-1">
                  TIMELESS HERITAGE
                </span>
                <h3 className="font-serif text-xl font-medium text-obsidian mb-2">
                  Inspired by Classic Grand-Touring Elegance
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed font-sans">
                  Echoing the tactile instrumentation, quilted Connolly leather, and refined typography of iconic British grand tourers.
                </p>
              </div>
            </div>

            {/* Card 2: Modern Intelligence */}
            <div className="p-6 rounded bg-parchment/50 border border-champagne/30 shadow-sm flex flex-col justify-between">
              <div>
                <div className="rounded overflow-hidden mb-5 border border-champagne/20">
                  <img
                    src="/images/coastal_sunset_tourer.jpg"
                    alt="Modern green sports car touring on a scenic coastline"
                    className="w-full h-52 object-cover object-center filter contrast-[1.05]"
                    loading="lazy"
                  />
                </div>
                <span className="eyebrow text-champagne-dark text-[10px] tracking-widest block mb-1">
                  MODERN INTELLIGENCE
                </span>
                <h3 className="font-serif text-xl font-medium text-obsidian mb-2">
                  Advanced AI for Safer Driving Experiences
                </h3>
                <p className="text-xs text-secondary-text leading-relaxed font-sans">
                  Unobtrusive machine learning executing locally on the edge, providing peace of mind through vigilant computational telemetry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 7: SAFETY PRINCIPLES & INTENDED USE
          ───────────────────────────────────────────────────────────── */}
      <section id="safety" className="py-16 px-6 md:px-12 bg-parchment/30 border-b border-champagne/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald/10 border border-emerald/30 text-emerald text-[11px] eyebrow font-semibold">
            <Shield className="w-3.5 h-3.5 text-champagne-dark" />
            <span>SAFETY PRINCIPLES &amp; ETHICAL DISCLOSURE</span>
          </div>

          <h3 className="font-serif text-2xl font-medium text-obsidian">
            Intended Purpose &amp; Operational Boundaries
          </h3>

          <p className="text-xs sm:text-sm text-secondary-text leading-relaxed font-sans max-w-2xl mx-auto">
            DriveSafe AI is an assistive technology prototype designed for research and educational demonstrations. Detection telemetry provides observable indicators of possible fatigue; it does not constitute a certified medical diagnostic system or guarantee accident prevention. Never operate a vehicle when physically exhausted.
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 8: FINAL CALL TO ACTION (Coastal Sunset Tourer)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative py-28 px-6 md:px-12 bg-obsidian text-ivory text-center overflow-hidden">
        {/* Supporting Scenic Automotive Imagery */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/coastal_sunset_tourer.jpg"
            alt="British racing green tourer on coastal road at golden sunset"
            className="w-full h-full object-cover object-center filter brightness-[0.55] contrast-[1.1]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/60 to-obsidian/80" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10 space-y-6">
          <span className="eyebrow text-champagne text-xs tracking-widest block">
            VIGILANCE ON EVERY MILE
          </span>

          <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ivory leading-tight">
            Stay Alert. <br />
            <span className="italic font-normal text-champagne-light">
              Arrive Assured.
            </span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-parchment/80 max-w-xl mx-auto font-sans leading-relaxed">
            Experience the confluence of classic motoring prestige and intelligent biometric vigilance.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/app/monitor')}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-sm md:text-base tracking-wide transition-all shadow-sm hover:shadow-gold-glow group"
            >
              <span>Start Monitoring</span>
              <ArrowRight className="w-4 h-4 text-obsidian transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="px-6 py-4 rounded bg-obsidian/70 hover:bg-obsidian/90 text-ivory border border-champagne/40 hover:border-champagne text-sm font-medium transition-all"
            >
              Sign In to Your Studio Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
