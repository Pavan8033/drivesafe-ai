import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AlertOctagon, PhoneCall, ShieldAlert, CheckCircle, Navigation } from 'lucide-react';
import { soundAlert } from '../../lib/soundAlert';
import { voiceCoPilot } from '../../lib/voiceCoPilot';

interface EmergencySOSModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  guardianName?: string;
  guardianPhone?: string;
  initialCountdown?: number;
}

export const EmergencySOSModal: React.FC<EmergencySOSModalProps> = ({
  isOpen,
  onDismiss,
  guardianName = 'Dr. Rajesh & Family Dispatch',
  guardianPhone = '+91 98765 43210',
  initialCountdown = 10,
}) => {
  const [countdown, setCountdown] = useState<number>(initialCountdown);
  const [isBroadcasted, setIsBroadcasted] = useState<boolean>(false);
  const sirenIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(initialCountdown);
      setIsBroadcasted(false);
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      return;
    }

    // Play initial Siren burst & voice notice
    soundAlert.playSOSSiren();
    voiceCoPilot.announceSOSCountdown(initialCountdown);

    sirenIntervalRef.current = window.setInterval(() => {
      soundAlert.playSOSSiren();
    }, 1200);

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsBroadcasted(true);
          return 0;
        }
        soundAlert.playCountdownTick(prev === 2);
        return prev - 1;
      });
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Escape' || e.key === 'Enter') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(timer);
      if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, initialCountdown]);

  const handleCancel = () => {
    if (sirenIntervalRef.current) clearInterval(sirenIntervalRef.current);
    soundAlert.playSOSCancelled();
    voiceCoPilot.announceSOSDismissed();
    onDismiss();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Pulsing Perimeter Distress Border */}
      <div className="absolute inset-0 border-8 border-red-600/70 pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-lg rounded-lg bg-obsidian-card border-2 border-red-500 shadow-2xl p-6 md:p-8 text-center text-ivory overflow-hidden">
        {/* Ambient Red Glow Background */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />

        {!isBroadcasted ? (
          <>
            {/* Header Icon */}
            <div className="w-20 h-20 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertOctagon className="w-10 h-10 text-red-400" />
            </div>

            <span className="eyebrow text-red-400 text-xs font-mono tracking-widest block mb-1">
              AUTOMOTIVE SAFETY INTERVENTION
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-ivory mb-2">
              Critical Microsleep Detected
            </h2>
            <p className="text-xs md:text-sm text-parchment/80 font-sans max-w-md mx-auto mb-6">
              Driver eye closure has exceeded critical safety threshold. Emergency Guardian broadcast will activate automatically.
            </p>

            {/* Circular Countdown Ring */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#3f1313"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#ef4444"
                  strokeWidth="8"
                  strokeDasharray={264}
                  strokeDashoffset={264 - (countdown / initialCountdown) * 264}
                  fill="transparent"
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-4xl font-bold text-red-200">
                  {countdown}
                </span>
                <span className="text-[9px] font-mono text-red-400 uppercase tracking-widest">
                  SECONDS
                </span>
              </div>
            </div>

            {/* Target Guardian Info Card */}
            <div className="p-3.5 rounded bg-obsidian-elevated border border-red-500/30 text-left flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-red-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-parchment/60 font-mono block">
                    DESTINATION GUARDIAN
                  </span>
                  <span className="text-xs font-semibold text-ivory block">
                    {guardianName}
                  </span>
                  <span className="text-[11px] font-mono text-champagne">
                    {guardianPhone}
                  </span>
                </div>
              </div>
              <span className="px-2 py-1 rounded bg-red-950 text-red-300 text-[10px] font-mono border border-red-500/40">
                Standby
              </span>
            </div>

            {/* Large Prominent Dismiss Action */}
            <button
              onClick={handleCancel}
              className="w-full py-4 rounded-md bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-ivory font-serif text-lg font-bold tracking-wide border border-emerald-400 shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              I AM AWAKE — DISMISS SOS
            </button>
            <span className="text-[10px] text-parchment/50 font-mono block mt-2">
              Press SPACE or ESC to instantly dismiss
            </span>
          </>
        ) : (
          /* SOS Broadcast Completed Screen */
          <div className="py-4">
            <div className="w-20 h-20 rounded-full bg-red-900/60 border-2 border-red-400 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-10 h-10 text-red-300 animate-pulse" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-red-200 mb-2">
              Guardian SOS Dispatched
            </h3>
            <p className="text-xs text-parchment/80 font-sans mb-6">
              Simulated Emergency SMS and GPS Telemetry transmitted to guardian dispatch contacts. Please pull vehicle over immediately to safe shoulder.
            </p>

            <div className="p-4 rounded bg-obsidian-elevated border border-red-500/40 text-left font-mono text-xs space-y-2 mb-6">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span>SMS Alert: TRANSMITTED</span>
              </div>
              <div className="flex items-center gap-2 text-parchment/80">
                <Navigation className="w-4 h-4 text-champagne" />
                <span>GPS: 12.9234° N, 80.1432° E (High Precision)</span>
              </div>
              <div className="text-[11px] text-parchment/60">
                Target: {guardianName} ({guardianPhone})
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="w-full py-3 rounded bg-obsidian hover:bg-obsidian-border text-ivory text-xs font-mono font-medium border border-champagne/40 transition-colors"
            >
              Reset Session & Close Alert
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const targetContainer = (typeof document !== 'undefined' && (document.fullscreenElement || document.body)) || null;
  if (!targetContainer) return null;

  return createPortal(modalContent, targetContainer);
};

