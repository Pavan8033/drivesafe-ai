import React, { useEffect, useState } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { soundAlert } from '../../lib/soundAlert';
import { voiceCoPilot } from '../../lib/voiceCoPilot';

interface CalibrationCountdownProps {
  onComplete: () => void;
  onCancel?: () => void;
}

export const CalibrationCountdown: React.FC<CalibrationCountdownProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(3);

  useEffect(() => {
    voiceCoPilot.announceCalibrationStart();
    soundAlert.playCountdownTick(false);

    const interval = window.setInterval(() => {
      setStep((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          soundAlert.playCountdownTick(true);
          voiceCoPilot.announceCalibrationComplete();
          setTimeout(onComplete, 400);
          return 0;
        }
        soundAlert.playCountdownTick(prev === 2);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-obsidian/85 backdrop-blur-md text-ivory p-6 animate-fade-in pointer-events-auto">
      {/* Target Reticle Alignment Outline */}
      <div className="relative w-44 h-52 md:w-56 md:h-64 rounded-full border-2 border-dashed border-champagne/60 flex items-center justify-center mb-6 animate-pulse">
        {/* Subtle corner alignment ticks */}
        <div className="absolute top-0 w-8 h-1 bg-champagne rounded-full" />
        <div className="absolute bottom-0 w-8 h-1 bg-champagne rounded-full" />
        <div className="absolute left-0 h-8 w-1 bg-champagne rounded-full" />
        <div className="absolute right-0 h-8 w-1 bg-champagne rounded-full" />

        {/* Center Countdown Value */}
        <div className="text-center">
          <span className="font-serif text-5xl md:text-6xl font-bold text-champagne block tabular-nums animate-scale-up">
            {step > 0 ? step : <Sparkles className="w-12 h-12 text-emerald-400 mx-auto" />}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-parchment/70 uppercase block mt-1">
            {step > 0 ? 'CALIBRATING POSE' : 'READY'}
          </span>
        </div>
      </div>

      <div className="text-center max-w-sm">
        <h4 className="font-serif text-lg font-medium text-ivory mb-1">
          Optical Alignment in Progress
        </h4>
        <p className="text-xs text-parchment/75 font-sans leading-relaxed mb-4">
          Position your face naturally toward the camera. Baseline eye aspect ratio and facial orientation are being calibrated.
        </p>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-mono text-parchment/60 hover:text-champagne transition-colors underline"
          >
            Bypass Calibration &rarr;
          </button>
        )}
      </div>
    </div>
  );
};

