import React, { useState } from 'react';
import {
  Volume2,
  Compass,
  Eye,
  Shield,
  CheckCircle,
  Bell,
  Info,
  Mic,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
} from 'lucide-react';
import { soundAlert } from '../lib/soundAlert';
import { voiceCoPilot } from '../lib/voiceCoPilot';
import {
  loadMonitoringConfig,
  saveMonitoringConfig,
  DEFAULT_MONITORING_CONFIG,
} from '../lib/settingsStorage';

export const SettingsPage: React.FC = () => {
  // Authentication Gateway State (Password: BLACKSQUAD)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem('drivesafe_blacksquad_auth') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Load persisted configuration
  const savedConfig = loadMonitoringConfig();

  // Detection heuristics with verified defaults
  const [earThreshold, setEarThreshold] = useState<number>(
    savedConfig.ear_threshold ?? 0.12
  );
  const [prolongedClosureSec, setProlongedClosureSec] = useState<number>(
    savedConfig.prolonged_closure_seconds ?? 0.8
  );
  const [headAwaySec, setHeadAwaySec] = useState<number>(
    savedConfig.head_away_seconds ?? 1.0
  );
  const [yawThresholdDeg, setYawThresholdDeg] = useState<number>(
    savedConfig.yaw_threshold_deg ?? 12
  );
  const [pitchThresholdDeg, setPitchThresholdDeg] = useState<number>(
    savedConfig.pitch_threshold_deg ?? 12
  );
  const [marThreshold, setMarThreshold] = useState<number>(
    savedConfig.mar_threshold ?? 0.65
  );
  const [volume, setVolume] = useState<number>(
    savedConfig.alert_volume ?? 100
  );

  const [audioAlerts, setAudioAlerts] = useState<boolean>(
    savedConfig.audio_alerts_enabled ?? true
  );
  const [voiceCopilotEnabled, setVoiceCopilotEnabled] = useState<boolean>(
    savedConfig.voice_copilot_enabled ?? true
  );
  const [cockpitTheme] = useState<'night' | 'day'>(
    savedConfig.cockpit_theme ?? 'night'
  );

  const [isTestingSound, setIsTestingSound] = useState<boolean>(false);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim().toUpperCase() === 'BLACKSQUAD') {
      setIsUnlocked(true);
      setAuthError(null);
      sessionStorage.setItem('drivesafe_blacksquad_auth', 'true');
    } else {
      setAuthError('ACCESS DENIED: Invalid Security Key. Level-1 Engineering authorization required.');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setPasscodeInput('');
    sessionStorage.removeItem('drivesafe_blacksquad_auth');
  };

  const handleSoundTest = async () => {
    setIsTestingSound(true);
    soundAlert.setVolume(volume / 100);
    soundAlert.setMuted(!audioAlerts);
    await soundAlert.testAlertSound();
    setIsTestingSound(false);
  };

  const handleVoiceTest = () => {
    setIsTestingVoice(true);
    voiceCoPilot.setEnabled(true);
    voiceCoPilot.speak('This is DriveSafe AI Voice Co-Pilot speaking. Stay alert, arrive assured.', 'test', true);
    setTimeout(() => setIsTestingVoice(false), 3000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    saveMonitoringConfig({
      ear_threshold: Number(earThreshold.toFixed(2)),
      prolonged_closure_seconds: Number(prolongedClosureSec.toFixed(1)),
      head_away_seconds: Number(headAwaySec.toFixed(1)),
      yaw_threshold_deg: Number(yawThresholdDeg.toFixed(0)),
      pitch_threshold_deg: Number(pitchThresholdDeg.toFixed(0)),
      mar_threshold: Number(marThreshold.toFixed(2)),
      alert_volume: volume,
      audio_alerts_enabled: audioAlerts,
      voice_copilot_enabled: voiceCopilotEnabled,
      cockpit_theme: cockpitTheme,
    });

    soundAlert.setMuted(!audioAlerts);
    soundAlert.setVolume(volume / 100);
    voiceCoPilot.setEnabled(voiceCopilotEnabled);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetDefaults = () => {
    setEarThreshold(DEFAULT_MONITORING_CONFIG.ear_threshold);
    setProlongedClosureSec(DEFAULT_MONITORING_CONFIG.prolonged_closure_seconds);
    setHeadAwaySec(DEFAULT_MONITORING_CONFIG.head_away_seconds);
    setYawThresholdDeg(DEFAULT_MONITORING_CONFIG.yaw_threshold_deg);
    setPitchThresholdDeg(DEFAULT_MONITORING_CONFIG.pitch_threshold_deg);
    setMarThreshold(DEFAULT_MONITORING_CONFIG.mar_threshold);
    setVolume(DEFAULT_MONITORING_CONFIG.alert_volume ?? 100);
    setAudioAlerts(DEFAULT_MONITORING_CONFIG.audio_alerts_enabled ?? true);
    setVoiceCopilotEnabled(true);
  };

  // 1. Password Protected Gateway Screen
  if (!isUnlocked) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md p-6 sm:p-8 rounded-lg bg-obsidian-card border border-champagne/30 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-obsidian-elevated border-2 border-champagne/40 flex items-center justify-center mx-auto text-champagne shadow-inner">
            <Lock className="w-8 h-8 text-champagne animate-pulse" />
          </div>

          <div>
            <span className="eyebrow text-champagne text-[11px] tracking-[0.2em] uppercase font-mono font-semibold block mb-1">
              Restricted Cockpit Diagnostics
            </span>
            <h2 className="font-serif text-2xl font-bold text-ivory">
              Engineering Calibration Access
            </h2>
            <p className="text-xs text-parchment/70 font-sans mt-2 leading-relaxed">
              Detection heuristics, safety boundaries, and acoustic parameters are restricted to authorized personnel. Enter your security key to unlock the engineering console.
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-4 pt-2">
            <div className="space-y-2 text-left">
              <label className="text-xs font-mono text-champagne block">
                Security Passcode
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter Security Key"
                  autoFocus
                  className="w-full px-4 py-3 pl-10 rounded bg-obsidian-elevated border border-champagne/40 text-ivory placeholder-parchment/30 text-sm font-mono tracking-widest uppercase focus:outline-none focus:border-champagne focus:ring-1 focus:ring-champagne"
                />
                <KeyRound className="w-4 h-4 text-champagne/60 absolute left-3 top-3.5" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-center gap-2 text-left animate-shake">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate &amp; Unlock Settings</span>
            </button>
          </form>

          <div className="pt-2 border-t border-obsidian-border text-[11px] text-parchment/40 font-mono">
            DriveSafe AI &bull; Automotive Diagnostic Console
          </div>
        </div>
      </div>
    );
  }

  // 2. Unlocked Full Engineering Settings View
  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto px-2 sm:px-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-obsidian-border">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-ivory">
              Monitoring Settings
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-mono">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>BLACKSQUAD AUTHENTICATED</span>
            </span>
          </div>
          <p className="text-xs text-parchment/60 font-sans">
            Calibrate eye aperture ratios, head-away boundaries, and alert thresholds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs font-mono text-parchment/70 hover:text-champagne transition-colors underline"
          >
            Reset Defaults
          </button>

          <button
            type="button"
            onClick={handleLock}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-obsidian-elevated border border-champagne/30 text-champagne text-xs font-mono hover:bg-obsidian transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Lock Console</span>
          </button>
        </div>
      </div>

      {/* Safety & Prototype Advisory Banner */}
      <div className="p-4 rounded bg-obsidian-card border border-champagne/30 text-xs text-parchment/80 flex items-start gap-3">
        <Info className="w-5 h-5 text-champagne shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-sans font-semibold text-ivory block">
            Engineering Telemetry Heuristics Notice
          </span>
          <p className="leading-relaxed">
            The thresholds configured below govern live computer-vision hazard detection. These values reflect tested automotive benchmarks (EAR 0.12, Closure 0.8s, Head-Away 1.0s, Angle ±12°). Modifications take effect immediately upon saving.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Eye Closure & Drowsiness Heuristics */}
        <div className="p-5 sm:p-7 rounded bg-obsidian-card border border-champagne/25 shadow-luxury-dark space-y-6">
          <h3 className="font-serif text-lg text-ivory flex items-center gap-2 pb-2 border-b border-obsidian-border">
            <Eye className="w-4 h-4 text-champagne" />
            <span>Eye Aspect Ratio (EAR) &amp; Eyelid Closure</span>
          </h3>

          {/* EAR Threshold Slider (Default: 0.12) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">EAR Closure Threshold</span>
              <span className="text-champagne font-semibold text-sm">{earThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.08"
              max="0.25"
              step="0.01"
              value={earThreshold}
              onChange={(e) => setEarThreshold(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">0.12</strong>. Real-time eye aspect ratio values below this mark signify eyelid closure.
            </span>
          </div>

          {/* Prolonged Closure Duration (Default: 0.8s) */}
          <div className="space-y-2 pt-2 border-t border-obsidian-border">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">Prolonged Closure Duration (seconds)</span>
              <span className="text-champagne font-semibold text-sm">{prolongedClosureSec.toFixed(1)} s</span>
            </div>
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={prolongedClosureSec}
              onChange={(e) => setProlongedClosureSec(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">0.8 s</strong>. Continuous closure duration before triggering immediate drowsiness hazard alarm.
            </span>
          </div>
        </div>

        {/* Head-Pose & Looking-Away Heuristics */}
        <div className="p-5 sm:p-7 rounded bg-obsidian-card border border-champagne/25 shadow-luxury-dark space-y-6">
          <h3 className="font-serif text-lg text-ivory flex items-center gap-2 pb-2 border-b border-obsidian-border">
            <Compass className="w-4 h-4 text-champagne" />
            <span>Head Pose &amp; Sustained Looking-Away</span>
          </h3>

          {/* Sustained Head Away Duration (Default: 1.0s) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">Sustained Head-Away Duration (seconds)</span>
              <span className="text-champagne font-semibold text-sm">{headAwaySec.toFixed(1)} s</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={headAwaySec}
              onChange={(e) => setHeadAwaySec(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">1.0 s</strong>. Sustained time rotated outside forward cone before acoustic distraction alert triggers.
            </span>
          </div>

          {/* Yaw Boundary (Default: 12°) */}
          <div className="space-y-2 pt-2 border-t border-obsidian-border">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">Yaw Angle Boundary (&plusmn; degrees)</span>
              <span className="text-champagne font-semibold text-sm">&plusmn;{yawThresholdDeg.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="6"
              max="30"
              step="1"
              value={yawThresholdDeg}
              onChange={(e) => setYawThresholdDeg(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">&plusmn;12°</strong>. Horizontal head rotation boundary away from road center.
            </span>
          </div>

          {/* Pitch Boundary (Default: 12°) */}
          <div className="space-y-2 pt-2 border-t border-obsidian-border">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">Pitch Angle Boundary (&plusmn; degrees)</span>
              <span className="text-champagne font-semibold text-sm">&plusmn;{pitchThresholdDeg.toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="6"
              max="30"
              step="1"
              value={pitchThresholdDeg}
              onChange={(e) => setPitchThresholdDeg(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">&plusmn;12°</strong>. Vertical head tilt angle (looking down at lap, phone, or nodding off).
            </span>
          </div>
        </div>

        {/* Acoustic Warnings & Audio Configuration */}
        <div className="p-5 sm:p-7 rounded bg-obsidian-card border border-champagne/25 shadow-luxury-dark space-y-6">
          <h3 className="font-serif text-lg text-ivory flex items-center gap-2 pb-2 border-b border-obsidian-border">
            <Volume2 className="w-4 h-4 text-champagne" />
            <span>Acoustic Warning Engine (Web Audio API)</span>
          </h3>

          {/* Audio Alerts Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
            <div>
              <span className="text-xs font-medium text-ivory block font-sans">
                Acoustic Alarm Alerts
              </span>
              <span className="text-[11px] text-parchment/50">
                Pulsed dual-tone alert audio plays when prolonged closure or head-away triggers.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAudioAlerts(!audioAlerts)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                audioAlerts ? 'bg-[#C4A66A]' : 'bg-obsidian-elevated border border-stone-600'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-obsidian absolute top-1 transition-transform ${
                  audioAlerts ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Alert Volume Slider (Default: 100%) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono text-ivory">
              <span className="font-sans font-medium">Alarm Volume</span>
              <span className="text-champagne font-semibold text-sm">{volume}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-[#C4A66A] bg-obsidian-elevated h-2.5 rounded cursor-pointer"
            />
            <span className="text-[11px] text-parchment/50 font-sans block">
              Default: <strong className="text-champagne">100%</strong>. Master acoustic gain for cabin safety warnings.
            </span>
          </div>

          {/* Sound Test Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSoundTest}
              disabled={isTestingSound}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-obsidian-elevated hover:bg-obsidian border border-champagne/30 text-xs font-medium text-ivory transition-all shadow-sm"
            >
              <Bell className="w-4 h-4 text-champagne" />
              <span>{isTestingSound ? 'Playing Repeating Alarm Test...' : 'Test Repeating Alarm Audio'}</span>
            </button>
          </div>
        </div>

        {/* Voice Co-Pilot Configuration */}
        <div className="p-5 sm:p-7 rounded bg-obsidian-card border border-champagne/25 shadow-luxury-dark space-y-6">
          <h3 className="font-serif text-lg text-ivory flex items-center gap-2 pb-2 border-b border-obsidian-border">
            <Mic className="w-4 h-4 text-champagne" />
            <span>Voice Co-Pilot (Web Speech API)</span>
          </h3>

          <div className="flex items-center justify-between pb-3 border-b border-obsidian-border">
            <div>
              <span className="text-xs font-medium text-ivory block font-sans">
                Enable Verbal Safety Guidance
              </span>
              <span className="text-[11px] text-parchment/50">
                Speaks natural verbal safety prompts when fatigue, yawning, or distraction is detected.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceCopilotEnabled(!voiceCopilotEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                voiceCopilotEnabled ? 'bg-[#C4A66A]' : 'bg-obsidian-elevated border border-stone-600'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-obsidian absolute top-1 transition-transform ${
                  voiceCopilotEnabled ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleVoiceTest}
              disabled={isTestingVoice}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-obsidian-elevated hover:bg-obsidian border border-champagne/30 text-xs font-medium text-ivory transition-all shadow-sm"
            >
              <Mic className="w-4 h-4 text-champagne" />
              <span>{isTestingVoice ? 'Speaking Test Cue...' : 'Test Voice Co-Pilot Speech'}</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          {saveSuccess ? (
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Settings saved and synchronized with detection engine.</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-champagne hover:bg-champagne-light active:bg-champagne-dark text-obsidian font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};