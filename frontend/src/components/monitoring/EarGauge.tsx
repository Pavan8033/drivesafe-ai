import React, { useEffect, useRef, useState } from 'react';

interface EarGaugeProps {
  ear: number | null;
  leftEar: number | null;
  rightEar: number | null;
  mar?: number | null;
  closureMs?: number;
  threshold?: number;
  perclos?: number;
  blinkRate?: number;
}

export const EarGauge: React.FC<EarGaugeProps> = ({
  ear,
  leftEar: _leftEar,
  rightEar: _rightEar,
  mar = 0.41,
  closureMs = 0,
  threshold = 0.20,
  perclos = 0.0,
  blinkRate = 18.0,
}) => {
  // Target EAR
  const targetEar = ear !== null ? ear : 0.28;

  // Spring Physics State for Needle
  const [springEar, setSpringEar] = useState<number>(targetEar);
  const currentValRef = useRef<number>(targetEar);
  const velocityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Spring physics configuration
    const tension = 0.14; // Spring stiffness
    const friction = 0.76; // Mechanical damping

    const updateSpring = () => {
      const force = (targetEar - currentValRef.current) * tension;
      velocityRef.current = (velocityRef.current + force) * friction;
      currentValRef.current += velocityRef.current;

      setSpringEar(currentValRef.current);

      if (
        Math.abs(velocityRef.current) > 0.0002 ||
        Math.abs(targetEar - currentValRef.current) > 0.0005
      ) {
        animFrameRef.current = requestAnimationFrame(updateSpring);
      } else {
        currentValRef.current = targetEar;
        setSpringEar(targetEar);
      }
    };

    animFrameRef.current = requestAnimationFrame(updateSpring);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [targetEar]);

  // Map EAR (0.00 to 0.45) to angle (-135deg to +135deg)
  const clampedEar = Math.max(0.0, Math.min(0.45, springEar));
  const normalizedProgress = clampedEar / 0.45;
  const needleAngle = -135 + normalizedProgress * 270;

  const isDrowsy = ear !== null && (ear < threshold || closureMs > 1500);
  const isHighPerclos = perclos >= 12.0;

  // Gauge arc parameters
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const arcFraction = 270 / 360;
  const totalArcLength = circumference * arcFraction;
  const activeArcLength = normalizedProgress * totalArcLength;

  return (
    <div className="relative p-6 rounded bg-obsidian-card border border-champagne/30 shadow-luxury-dark text-center flex flex-col justify-between overflow-hidden">
      {/* Subtle Sapphire Crystal Sheen Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-champagne/[0.03] to-transparent pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-obsidian-border mb-3 relative z-10">
        <span className="eyebrow text-champagne text-[10px] tracking-widest font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-champagne animate-pulse" />
          HOROLOGICAL CHRONOMETER
        </span>
        <span className="text-[10px] font-mono text-parchment/70 bg-obsidian-elevated px-2 py-0.5 rounded border border-champagne/20">
          Threshold: {threshold.toFixed(2)}
        </span>
      </div>

      {/* Analog Chronometer Instrument Dial */}
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center my-1 relative z-10">
        <svg className="w-full h-full" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C4A66A" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#244A38" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#C4A66A" stopOpacity="0.6" />
            </linearGradient>
            <linearGradient id="emeraldArc" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="dangerArc" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#B91C1C" />
            </linearGradient>
          </defs>

          {/* Outer Brass Bezel */}
          <circle
            cx="80"
            cy="80"
            r="76"
            stroke="url(#bezelGrad)"
            strokeWidth="2.5"
            fill="#121512"
          />

          {/* Inner Dial Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1D221C"
            strokeWidth="7"
            strokeDasharray={`${totalArcLength} ${circumference}`}
            strokeDashoffset={-circumference * 0.125}
            fill="transparent"
            strokeLinecap="round"
            transform="rotate(135 80 80)"
          />

          {/* Critical Danger Range Zone (0.0 to threshold) */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#7F1D1D"
            strokeWidth="7"
            strokeDasharray={`${totalArcLength * (threshold / 0.45)} ${circumference}`}
            strokeDashoffset={-circumference * 0.125}
            fill="transparent"
            strokeLinecap="round"
            transform="rotate(135 80 80)"
          />

          {/* Active Spring Value Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={isDrowsy ? 'url(#dangerArc)' : 'url(#emeraldArc)'}
            strokeWidth="7"
            strokeDasharray={`${activeArcLength} ${circumference}`}
            strokeDashoffset={-circumference * 0.125}
            fill="transparent"
            strokeLinecap="round"
            transform="rotate(135 80 80)"
          />

          {/* Precision Horology Tick Marks */}
          {[0, 0.1, 0.2, 0.3, 0.4].map((t) => {
            const tickNormalized = t / 0.45;
            const angle = -135 + tickNormalized * 270;
            const rad = (angle * Math.PI) / 180;
            const x1 = 80 + (radius - 12) * Math.sin(rad);
            const y1 = 80 - (radius - 12) * Math.cos(rad);
            const x2 = 80 + (radius - 5) * Math.sin(rad);
            const y2 = 80 - (radius - 5) * Math.cos(rad);
            return (
              <line
                key={t}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={t < threshold ? '#EF4444' : '#C4A66A'}
                strokeWidth={t === threshold ? '2' : '1.2'}
                opacity={0.8}
              />
            );
          })}

          {/* Mechanical Needle with Inertia */}
          <g transform={`rotate(${needleAngle} 80 80)`}>
            {/* Counterweight */}
            <circle cx="80" cy="94" r="3.5" fill="#C4A66A" opacity="0.9" />
            {/* Needle Spindle */}
            <polygon
              points="78.5,80 80,24 81.5,80"
              fill={isDrowsy ? '#EF4444' : '#C4A66A'}
            />
            {/* Central Brass Cap */}
            <circle cx="80" cy="80" r="6" fill="#171916" stroke="#C4A66A" strokeWidth="2" />
            <circle cx="80" cy="80" r="2.5" fill="#C4A66A" />
          </g>
        </svg>

        {/* Center Digital Telemetry Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-10 pointer-events-none">
          <span className="text-[9px] eyebrow text-parchment/60 font-mono tracking-widest uppercase">
            EYE APERTURE
          </span>
          <span
            className={`font-mono text-2xl font-bold tracking-tight my-0.5 ${
              isDrowsy ? 'text-red-400' : 'text-ivory'
            }`}
          >
            {ear !== null ? ear.toFixed(2) : '0.28'}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[8.5px] font-mono font-semibold uppercase tracking-wider ${
              isDrowsy
                ? 'bg-red-950/90 text-red-300 border border-red-500 shadow-sm'
                : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500 shadow-sm'
            }`}
          >
            {isDrowsy ? 'DROWSY' : 'VIGILANT'}
          </span>
        </div>
      </div>

      {/* Primary Automotive Telemetry Metrics (EAR, MAR, PERCLOS, BPM) */}
      <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-obsidian-border text-xs font-mono relative z-10">
        <div className="p-2 rounded bg-obsidian-elevated border border-champagne/15 flex items-center justify-between">
          <span className="text-[10px] text-parchment/70 font-sans">PERCLOS P80</span>
          <span
            className={`text-xs font-bold ${
              isHighPerclos ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            {perclos.toFixed(1)}%
          </span>
        </div>

        <div className="p-2 rounded bg-obsidian-elevated border border-champagne/15 flex items-center justify-between">
          <span className="text-[10px] text-parchment/70 font-sans">Blink Rate</span>
          <span className="text-xs font-bold text-champagne">
            {blinkRate > 0 ? blinkRate.toFixed(0) : '--'} <span className="text-[9px] font-normal text-parchment/50">BPM</span>
          </span>
        </div>

        <div className="p-2 rounded bg-obsidian-elevated border border-champagne/15 flex items-center justify-between">
          <span className="text-[10px] text-parchment/70 font-sans">Eyelid Closure</span>
          <span
            className={`text-xs font-semibold ${
              closureMs > 1000 ? 'text-red-400' : 'text-ivory'
            }`}
          >
            {closureMs} ms
          </span>
        </div>

        <div className="p-2 rounded bg-obsidian-elevated border border-champagne/15 flex items-center justify-between">
          <span className="text-[10px] text-parchment/70 font-sans">Mouth (MAR)</span>
          <span className="text-xs font-semibold text-champagne">
            {mar !== null && mar !== undefined ? mar.toFixed(2) : '0.41'}
          </span>
        </div>
      </div>
    </div>
  );
};
