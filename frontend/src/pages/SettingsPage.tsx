import React, { useState } from 'react';
import {
  Sliders,
  Volume2,
  VolumeX,
  User,
  Shield,
  Trash2,
  CheckCircle,
  Play,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { soundAlert } from '../lib/soundAlert';
import { PrimaryButton } from '../components/common/PrimaryButton';

export const SettingsPage: React.FC = () => {
  const { user, signOut, isFirebaseConfigured } = useAuth();

  // Settings State
  const [earThreshold, setEarThreshold] = useState<number>(0.20);
  const [prolongedClosureSec, setProlongedClosureSec] = useState<number>(1.5);
  const [marThreshold, setMarThreshold] = useState<number>(0.65);
  const [volume, setVolume] = useState<number>(80);
  const [isMuted, setIsMuted] = useState<boolean>(soundAlert.getIsMuted());
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleSoundTest = () => {
    soundAlert.unlockAudio();
    soundAlert.setVolume(volume / 100);
    soundAlert.playDrowsinessAlert(true);
  };

  const handleYawnSoundTest = () => {
    soundAlert.unlockAudio();
    soundAlert.setVolume(volume / 100);
    soundAlert.playYawnNotice();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    soundAlert.setMuted(isMuted);
    soundAlert.setVolume(volume / 100);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleClearLocalArchives = () => {
    const ok = window.confirm(
      'Are you certain you wish to purge your local session archive cache?'
    );
    if (ok && user?.uid) {
      localStorage.removeItem(`drivesafe_sessions_${user.uid}`);
      alert('Local session cache cleared.');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="pb-4 border-b border-charcoal-border">
        <h2 className="font-serif text-2xl font-medium text-ivory">
          Cockpit &amp; Instrument Settings
        </h2>
        <p className="text-xs text-parchment/60 font-sans mt-0.5">
          Fine-tune acoustic warnings, biometric thresholds, and privacy credentials.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Acoustic Warnings */}
        <div className="p-6 rounded bg-charcoal-card border border-gold/25 shadow-luxury-dark space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-charcoal-border">
            <Volume2 className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-medium text-ivory">
              Acoustic Alert Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-ivory block font-sans">
                  Sound Warning System
                </label>
                <span className="text-[11px] text-parchment/50">
                  Emit synthesized dual-tone harmonic chimes upon detected fatigue events
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`px-3 py-1.5 rounded border text-xs font-mono transition-colors ${
                  isMuted
                    ? 'bg-charcoal-elevated text-parchment/50 border-charcoal-border'
                    : 'bg-gold/15 text-gold border-gold/40'
                }`}
              >
                {isMuted ? 'Muted' : 'Active'}
              </button>
            </div>

            {/* Volume slider */}
            <div>
              <div className="flex justify-between text-xs font-mono text-parchment/70 mb-1.5">
                <span>Alert Output Volume</span>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-[#B89A5A] bg-charcoal-elevated h-2 rounded cursor-pointer"
              />
            </div>

            {/* Test Alert Buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSoundTest}
                className="px-3.5 py-2 rounded bg-charcoal-elevated hover:bg-gold/10 text-gold border border-gold/30 text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Drowsiness Pulse</span>
              </button>

              <button
                type="button"
                onClick={handleYawnSoundTest}
                className="px-3.5 py-2 rounded bg-charcoal-elevated hover:bg-gold/10 text-gold border border-gold/30 text-xs font-mono flex items-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Test Yawn Notice Chime</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Biometric Detection Thresholds */}
        <div className="p-6 rounded bg-charcoal-card border border-gold/25 shadow-luxury-dark space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-charcoal-border">
            <Sliders className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-medium text-ivory">
              Biometric Calibration Thresholds
            </h3>
          </div>

          <div className="space-y-6 text-xs font-sans">
            <div>
              <div className="flex justify-between font-mono mb-1.5">
                <span className="text-ivory font-medium font-sans">
                  Eye Aspect Ratio (EAR) Threshold
                </span>
                <span className="text-gold font-mono">{earThreshold.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-parchment/50 mb-2 font-sans">
                Measurements below this coefficient classify eyelids as closed. Recommended default: 0.20.
              </p>
              <input
                type="range"
                min="0.15"
                max="0.28"
                step="0.01"
                value={earThreshold}
                onChange={(e) => setEarThreshold(Number(e.target.value))}
                className="w-full accent-[#B89A5A] bg-charcoal-elevated h-2 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1.5">
                <span className="text-ivory font-medium font-sans">
                  Prolonged Closure Trigger Duration
                </span>
                <span className="text-gold font-mono">{prolongedClosureSec.toFixed(1)}s</span>
              </div>
              <p className="text-[11px] text-parchment/50 mb-2 font-sans">
                Continuous eye closure beyond this duration immediately triggers a hazard state. Recommended: 1.5s.
              </p>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.1"
                value={prolongedClosureSec}
                onChange={(e) => setProlongedClosureSec(Number(e.target.value))}
                className="w-full accent-[#B89A5A] bg-charcoal-elevated h-2 rounded cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1.5">
                <span className="text-ivory font-medium font-sans">
                  Mouth Aspect Ratio (MAR) Yawn Threshold
                </span>
                <span className="text-gold font-mono">{marThreshold.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-parchment/50 mb-2 font-sans">
                Mouth opening aperture ratio indicating a possible yawning event. Recommended: 0.65.
              </p>
              <input
                type="range"
                min="0.50"
                max="0.85"
                step="0.01"
                value={marThreshold}
                onChange={(e) => setMarThreshold(Number(e.target.value))}
                className="w-full accent-[#B89A5A] bg-charcoal-elevated h-2 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Driver Identity & Privacy */}
        <div className="p-6 rounded bg-charcoal-card border border-gold/25 shadow-luxury-dark space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-charcoal-border">
            <User className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-lg font-medium text-ivory">
              Driver Profile &amp; Data Control
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded bg-charcoal-elevated border border-charcoal-border">
              <span className="text-[10px] text-parchment/50 font-sans block">Driver Name</span>
              <span className="text-ivory font-medium text-sm">
                {user?.displayName || 'Driver'}
              </span>
            </div>

            <div className="p-3.5 rounded bg-charcoal-elevated border border-charcoal-border">
              <span className="text-[10px] text-parchment/50 font-sans block">Identity Status</span>
              <span className="text-gold font-medium text-sm">
                {user?.isDemoUser ? 'Demo Operator' : 'Firebase Authenticated'}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleClearLocalArchives}
              className="text-xs text-red-400 hover:text-red-300 font-sans flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Session Storage Cache</span>
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 rounded bg-charcoal-elevated border border-charcoal-border text-xs text-parchment/70 hover:text-red-400 transition-colors"
            >
              Sign Out of Studio
            </button>
          </div>
        </div>

        {/* Save Confirmation Notification */}
        {saveSuccess && (
          <div className="p-4 rounded bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Preferences saved successfully.</span>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <PrimaryButton type="submit" size="md" variant="forest">
            Save Preferences
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};
