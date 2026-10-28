import React from 'react';

interface EarGaugeProps {
  ear: number | null;
  leftEar: number | null;
  rightEar: number | null;
  threshold?: number;
}

export const EarGauge: React.FC<EarGaugeProps> = ({
  ear,
  leftEar,
  rightEar,
  threshold = 0.20,
}) => {
  // Normalize EAR (0.0 to 0.45 range mapped to degrees -90 to +90)
  const clampedEar = ear !== null ? Math.max(0.0, Math.min(0.45, ear)) : 0.0;
  const percentage = (clampedEar / 0.45) * 100;
  const angle = (clampedEar / 0.45) * 180 - 90;

  const isBelowThreshold = ear !== null && ear < threshold;

  return (
    <div className="p-6 rounded bg-charcoal-card border border-gold/25 shadow-luxury-dark text-center flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow text-gold text-[10px] tracking-widest">
          Gauge &bull; Chronometer
        </span>
        <span className="text-[10px] font-mono text-parchment/50">
          Threshold: {threshold.toFixed(2)}
        </span>
      </div>

      {/* Semi-circular vintage dial instrument */}
      <div className="relative w-48 h-28 mx-auto overflow-hidden">
        {/* Background Arc */}
        <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
          {/* Danger zone arc (0 to threshold) */}
          <path
            d="M 10 50 A 40 40 0 0 1 35 15"
            fill="none"
            stroke="#991B1B"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Safe zone arc (threshold to max) */}
          <path
            d="M 37 14 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#173F2A"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Tick markers */}
          <circle cx="50" cy="50" r="3" fill="#B89A5A" />
        </svg>

        {/* Brass Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-24 bg-gradient-to-t from-gold-dark via-gold to-ivory origin-bottom transition-transform duration-150 shadow-md"
          style={{
            transform: `translateX(-50%) rotate(${angle}deg)`,
          }}
        >
          <div className="w-2 h-2 rounded-full bg-gold absolute -top-1 left-1/2 -translate-x-1/2" />
        </div>
      </div>

      {/* Telemetry Numeric Readout */}
      <div className="mt-2">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={`font-mono text-3xl font-bold tracking-tight ${
              isBelowThreshold ? 'text-red-400' : 'text-gold'
            }`}
          >
            {ear !== null ? ear.toFixed(3) : '&mdash;'}
          </span>
          <span className="text-xs text-parchment/60 font-sans">EAR</span>
        </div>
        <span className="text-[11px] font-sans text-parchment/50">
          {isBelowThreshold ? 'Eyelid Closure Detected' : 'Normal Palpebral Aperture'}
        </span>
      </div>

      {/* Dual Eye Split Meter */}
      <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-charcoal-border text-xs font-mono">
        <div className="p-2 rounded bg-charcoal-elevated border border-charcoal-border text-left">
          <span className="text-[10px] text-parchment/50 block font-sans">Left Eye</span>
          <span className="text-sm font-semibold text-ivory">
            {leftEar !== null ? leftEar.toFixed(3) : '&mdash;'}
          </span>
        </div>
        <div className="p-2 rounded bg-charcoal-elevated border border-charcoal-border text-left">
          <span className="text-[10px] text-parchment/50 block font-sans">Right Eye</span>
          <span className="text-sm font-semibold text-ivory">
            {rightEar !== null ? rightEar.toFixed(3) : '&mdash;'}
          </span>
        </div>
      </div>
    </div>
  );
};
