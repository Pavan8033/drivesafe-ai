import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Settings,
  Pause,
  Play,
  Compass,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Award,
  FileText,
  Clock,
} from 'lucide-react';
import { MonitoringViewport } from '../components/monitoring/MonitoringViewport';
import { EarGauge } from '../components/monitoring/EarGauge';
import { HeadPoseHologram } from '../components/monitoring/HeadPoseHologram';
import { AcademicCharterModal } from '../components/common/AcademicCharterModal';
import { TripDossierModal } from '../components/common/TripDossierModal';
import { evaluateCircadianVulnerability } from '../lib/circadianAnalysis';
import { RollingCounter } from '../components/common/RollingCounter';
import { useAuth } from '../context/AuthContext';
import { saveSessionSummary } from '../lib/sessionStorage';
import { loadMonitoringConfig } from '../lib/settingsStorage';
import type { MonitoringTelemetry } from '../types/monitoring';
import type { SessionSummary } from '../types/session';

export const LiveMonitoringPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cockpitContainerRef = useRef<HTMLDivElement | null>(null);

  const [telemetry, setTelemetry] = useState<MonitoringTelemetry | null>(null);
  const [_completedSummary, setCompletedSummary] = useState<SessionSummary | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isMonitoringActive, setIsMonitoringActive] = useState(false);
  const [headAwayCount, setHeadAwayCount] = useState<number>(0);

  // New Modes: Fullscreen, Night/Day Theme, Academic Charter Modal, Safety Dossier
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [cockpitTheme, setCockpitTheme] = useState<'night' | 'day'>('night');
  const [isCharterOpen, setIsCharterOpen] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  const activeConfig = loadMonitoringConfig();

  // History buffer for real-time telemetry sparkline
  const [earHistory, setEarHistory] = useState<number[]>([
    0.28, 0.28, 0.29, 0.27, 0.28, 0.29, 0.28, 0.28, 0.27, 0.29,
  ]);

  // Session duration timer
  useEffect(() => {
    let timer: number | null = null;
    if (isMonitoringActive && !isPaused) {
      timer = window.setInterval(() => {
        setSessionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isMonitoringActive, isPaused]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      cockpitContainerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleTelemetryUpdate = (data: MonitoringTelemetry) => {
    setTelemetry(data);
    setIsMonitoringActive(true);
    const earVal = data.ear;
    if (typeof earVal === 'number') {
      setEarHistory((prev) => [...prev.slice(-24), earVal]);
    }
    if (data.event === 'SUSTAINED_HEAD_AWAY') {
      setHeadAwayCount((prev) => prev + 1);
    }
  };

  const handleSessionComplete = async (summary: SessionSummary) => {
    setCompletedSummary(summary);
    setIsMonitoringActive(false);
    if (user?.uid) {
      await saveSessionSummary(user.uid, summary);
    }
  };

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ear = telemetry?.ear ?? null;
  const leftEar = telemetry?.left_ear ?? null;
  const rightEar = telemetry?.right_ear ?? null;
  const mar = telemetry?.mouth_aspect_ratio ?? null;
  const closureMs = telemetry?.eye_closure_duration_ms ?? 0;
  const eventCount = telemetry?.event_count ?? 0;
  const headYaw = telemetry?.head_yaw ?? null;
  const headPitch = telemetry?.head_pitch ?? null;
  const headRoll = telemetry?.head_roll ?? null;
  const isHeadAway = telemetry?.head_away ?? false;
  const headAwayMs = telemetry?.head_away_duration_ms ?? 0;
  const perclos = telemetry?.perclos ?? 0.0;
  const blinkRate = telemetry?.blinks_per_minute ?? 18.0;

  const isDayMode = cockpitTheme === 'day';
  const circadianInfo = evaluateCircadianVulnerability();

  return (
    <div
      ref={cockpitContainerRef}
      className={`space-y-6 max-w-7xl mx-auto transition-colors duration-500 ${
        isDayMode
          ? 'bg-[#F5F2EB] text-[#171916] p-4 md:p-6 rounded-lg'
          : 'text-ivory'
      }`}
    >
      {/* Academic Charter Modal */}
      <AcademicCharterModal
        isOpen={isCharterOpen}
        onClose={() => setIsCharterOpen(false)}
      />

      {/* Trip Safety Dossier & Certification Modal */}
      <TripDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        driverName={user?.displayName || 'Devarinti Pavan Kumar Reddy'}
        activeTelemetry={telemetry}
        sessionSeconds={sessionSeconds}
        sessionSummary={_completedSummary}
      />

      {/* Studio Cockpit Top Status Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 pb-4 border-b ${
          isDayMode ? 'border-champagne/40' : 'border-obsidian-border'
        }`}
      >
        <div>
          <h2
            className={`font-serif text-2xl font-medium flex items-center gap-3 ${
              isDayMode ? 'text-[#173F2A]' : 'text-ivory'
            }`}
          >
            <span>Live Monitoring Studio</span>
          </h2>
          <p
            className={`text-xs font-sans mt-0.5 ${
              isDayMode ? 'text-[#55554D]' : 'text-parchment/60'
            }`}
          >
            Real-time biometric computer vision analyzing driver vigilance telemetry.
          </p>
        </div>

        {/* Action Pills & Controls (Theme, Fullscreen, Charter, Settings) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Team 8 Pill */}
          <button
            onClick={() => setIsCharterOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-champagne/40 text-champagne text-xs font-mono hover:bg-emerald-900 transition-all shadow-sm"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Team 8</span>
          </button>

          {/* Circadian Fatigue Risk Meter */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              circadianInfo.riskLevel === 'CRITICAL'
                ? 'bg-red-950/80 border-red-500/60 text-red-300'
                : circadianInfo.riskLevel === 'ELEVATED'
                ? 'bg-amber-950/80 border-amber-500/60 text-amber-300'
                : isDayMode
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                : 'bg-emerald-950/70 border-emerald-500/40 text-emerald-300'
            }`}
            title={`Biological Circadian Rhythm: ${circadianInfo.phaseLabel} (${circadianInfo.recommendation})`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-sans font-medium">{circadianInfo.phaseLabel}:</span>
            <span className="font-semibold">{circadianInfo.multiplier}x Risk</span>
          </div>

          {/* Safety Dossier Button */}
          <button
            onClick={() => setIsDossierOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              isDayMode
                ? 'bg-white border-champagne/50 text-[#173F2A] hover:bg-champagne/20 shadow-sm'
                : 'bg-obsidian-elevated border-champagne/40 text-champagne hover:bg-champagne/15'
            }`}
            title="Generate Official Trip Safety Dossier & Certificate"
          >
            <FileText className="w-3.5 h-3.5 text-champagne" />
            <span>Safety Dossier</span>
          </button>

          {/* Night Vision vs. Daytime Glare Toggle */}
          <button
            onClick={() => setCockpitTheme(isDayMode ? 'night' : 'day')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all ${
              isDayMode
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-obsidian-elevated border-champagne/30 text-champagne'
            }`}
            title="Toggle Night Vision / Daytime Glare Mode"
          >
            {isDayMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Day Glare</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-champagne" />
                <span className="hidden sm:inline">Night Vision</span>
              </>
            )}
          </button>

          {/* Fullscreen HUD Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded border transition-colors ${
              isDayMode
                ? 'bg-white border-champagne/40 text-stone-700 hover:text-stone-900'
                : 'bg-obsidian-elevated border-champagne/30 text-parchment/70 hover:text-champagne'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen HUD'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Status & Timer Pill */}
          <div
            className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border text-xs font-mono ${
              isDayMode
                ? 'bg-white border-champagne/50 shadow-sm'
                : 'bg-obsidian-elevated border-champagne/30'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isMonitoringActive
                  ? isPaused
                    ? 'bg-amber-400'
                    : 'bg-emerald-400 animate-pulse'
                  : 'bg-stone-500'
              }`}
            />
            <span className={isDayMode ? 'text-stone-800 font-medium' : 'text-ivory font-medium'}>
              {isMonitoringActive
                ? isPaused
                  ? 'Paused'
                  : 'Active'
                : 'Standby'}
            </span>
            <span className="text-champagne font-semibold border-l border-champagne/20 pl-2">
              {formatTimer(sessionSeconds)}
            </span>
          </div>

          <button
            onClick={() => navigate('/app/settings')}
            className={`p-2 rounded border transition-colors ${
              isDayMode
                ? 'bg-white border-champagne/40 text-stone-700 hover:text-stone-900'
                : 'bg-obsidian-elevated border-champagne/30 text-parchment/70 hover:text-champagne'
            }`}
            title="Cockpit Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Camera Viewport + Real-Time Telemetry Graph (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <MonitoringViewport
            onTelemetryUpdate={handleTelemetryUpdate}
            onSessionComplete={handleSessionComplete}
            isSoundMuted={false}
          />

          {/* Real-time Telemetry Trend Chart */}
          <div
            className={`p-5 rounded border shadow-luxury-dark transition-colors ${
              isDayMode
                ? 'bg-white border-champagne/40 shadow-sm'
                : 'bg-obsidian-card border-champagne/25'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b mb-3 ${
                isDayMode ? 'border-champagne/20' : 'border-obsidian-border'
              }`}
            >
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-champagne">
                  <span className="w-2.5 h-0.5 bg-champagne inline-block" />
                  <span>EAR (Eye Aperture)</span>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block" />
                  <span>Blinks: {telemetry?.blink_count ?? 0}</span>
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-0.5 bg-cyan-400 inline-block" />
                  <span>PERCLOS: {perclos.toFixed(1)}%</span>
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
                  <span>MAR (Mouth)</span>
                </span>
              </div>
              <span
                className={`text-[10px] font-mono ${
                  isDayMode ? 'text-stone-500' : 'text-parchment/50'
                }`}
              >
                10 FPS Sampling
              </span>
            </div>

            {/* Live Waveform SVG Canvas */}
            <div className="h-28 w-full flex items-end relative overflow-hidden">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                {/* Baseline threshold dashed line at active EAR threshold */}
                <line
                  x1="0"
                  y1={40 - (activeConfig.ear_threshold / 0.40) * 40}
                  x2="100"
                  y2={40 - (activeConfig.ear_threshold / 0.40) * 40}
                  stroke="#EF4444"
                  strokeWidth="0.6"
                  strokeDasharray="2 2"
                  opacity="0.8"
                />
                {/* Area Gradient */}
                <defs>
                  <linearGradient id="earArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4A66A" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#C4A66A" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* EAR Polyline */}
                <polygon
                  points={`0,40 ${earHistory
                    .map((val, idx) => {
                      const x = (idx / (earHistory.length - 1)) * 100;
                      const y = Math.max(4, Math.min(38, 40 - (val / 0.40) * 40));
                      return `${x},${y}`;
                    })
                    .join(' ')} 100,40`}
                  fill="url(#earArea)"
                />
                <polyline
                  points={earHistory
                    .map((val, idx) => {
                      const x = (idx / (earHistory.length - 1)) * 100;
                      const y = Math.max(4, Math.min(38, 40 - (val / 0.40) * 40));
                      return `${x},${y}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke="#C4A66A"
                  strokeWidth="1.2"
                />
              </svg>
            </div>

            {/* Time labels under waveform */}
            <div
              className={`flex justify-between text-[9px] font-mono pt-2 border-t ${
                isDayMode
                  ? 'border-champagne/20 text-stone-500'
                  : 'border-obsidian-border text-parchment/40'
              }`}
            >
              <span>-15s</span>
              <span>-10s</span>
              <span>-5s</span>
              <span>LIVE TELEMETRY</span>
            </div>
          </div>
        </div>

        {/* Right Column: Radial Gauge, 3D Head Hologram & Fatigue Tallies (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <EarGauge
            ear={ear}
            leftEar={leftEar}
            rightEar={rightEar}
            mar={mar}
            closureMs={closureMs}
            threshold={activeConfig.ear_threshold}
            perclos={perclos}
            blinkRate={blinkRate}
          />

          {/* Three.js 3D Holographic Head Pose Gyroscope Card */}
          <div
            className={`p-5 rounded border shadow-luxury-dark space-y-3 transition-colors ${
              isDayMode
                ? 'bg-white border-champagne/40'
                : 'bg-obsidian-card border-champagne/25'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-2 border-b ${
                isDayMode ? 'border-champagne/20' : 'border-obsidian-border'
              }`}
            >
              <span className="eyebrow text-champagne text-[10px] tracking-widest flex items-center gap-1.5 font-semibold">
                <Compass className="w-3.5 h-3.5" />
                <span>3D HEAD POSE GYROSCOPE</span>
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isHeadAway
                    ? 'bg-red-950 text-red-300 border border-red-500/50'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                }`}
              >
                {isHeadAway ? 'HEAD TURNED' : 'CENTERED'}
              </span>
            </div>

            {/* 3D Hologram Canvas */}
            <HeadPoseHologram
              yaw={headYaw}
              pitch={headPitch}
              roll={headRoll}
              isHeadAway={isHeadAway}
            />

            {headAwayMs > 0 && (
              <div className="p-2 rounded bg-amber-950/60 border border-amber-600/40 text-[11px] text-amber-200 flex justify-between">
                <span>Distraction Duration:</span>
                <span className="font-mono font-semibold">{headAwayMs} ms</span>
              </div>
            )}
          </div>

          {/* Fatigue Events Counters with Rolling Numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className={`p-4 rounded border flex flex-col justify-between ${
                isDayMode
                  ? 'bg-white border-champagne/30'
                  : 'bg-obsidian-card border-champagne/20'
              }`}
            >
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-[11px] font-medium font-sans">
                  Total Incidents
                </span>
              </div>
              <span className="font-mono text-2xl font-bold mt-2">
                <RollingCounter value={eventCount} />
              </span>
              <span
                className={`text-[9px] font-sans mt-0.5 ${
                  isDayMode ? 'text-stone-500' : 'text-parchment/50'
                }`}
              >
                Safety Violations
              </span>
            </div>

            <div
              className={`p-4 rounded border flex flex-col justify-between ${
                isDayMode
                  ? 'bg-white border-champagne/30'
                  : 'bg-obsidian-card border-champagne/20'
              }`}
            >
              <div className="flex items-center gap-2 text-champagne mb-1">
                <Compass className="w-4 h-4 text-champagne" />
                <span className="text-[11px] font-medium font-sans">
                  Head-Away
                </span>
              </div>
              <span className="font-mono text-2xl font-bold mt-2">
                <RollingCounter value={headAwayCount} />
              </span>
              <span
                className={`text-[9px] font-sans mt-0.5 ${
                  isDayMode ? 'text-stone-500' : 'text-parchment/50'
                }`}
              >
                Sustained &ge; {activeConfig.head_away_seconds.toFixed(1)}s
              </span>
            </div>
          </div>

          {/* Quick Cockpit Action Controls */}
          <div
            className={`p-5 rounded border space-y-3 ${
              isDayMode
                ? 'bg-white border-champagne/30'
                : 'bg-obsidian-card border-champagne/20'
            }`}
          >
            <span className="eyebrow text-champagne text-[10px] tracking-widest block font-semibold">
              COCKPIT CONTROLS
            </span>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setIsPaused(!isPaused)}
                disabled={!isMonitoringActive}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-champagne hover:bg-champagne-light text-obsidian text-xs font-semibold tracking-wide transition-all disabled:opacity-50 shadow-sm"
              >
                {isPaused ? (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Resume Monitoring</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Monitoring</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsDossierOpen(true)}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border text-xs font-medium transition-all ${
                  isDayMode
                    ? 'bg-amber-50 hover:bg-amber-100 border-champagne text-amber-950 shadow-sm'
                    : 'bg-emerald-950/40 hover:bg-emerald-950/70 border-champagne/40 text-champagne hover:text-champagne-light'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Safety Dossier & Certificate</span>
              </button>

              <button
                onClick={() => navigate('/app/history')}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded border text-xs font-medium transition-all ${
                  isDayMode
                    ? 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
                    : 'bg-obsidian-elevated hover:bg-obsidian-card border-champagne/30 text-parchment hover:text-ivory'
                }`}
              >
                <span>View Session Archive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
