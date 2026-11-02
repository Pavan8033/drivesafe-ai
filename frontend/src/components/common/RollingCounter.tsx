import React, { useEffect, useState, useRef } from 'react';

interface RollingCounterProps {
  value: number;
  durationMs?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const RollingCounter: React.FC<RollingCounterProps> = ({
  value,
  durationMs = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState<number>(value);
  const currentValRef = useRef<number>(value);
  const targetValRef = useRef<number>(value);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const fromVal = currentValRef.current;
    targetValRef.current = value;
    startTimeRef.current = null;

    if (fromVal === value) return;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) startTimeRef.current = currentTime;
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationMs);

      // Smooth cubic-out easing
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = fromVal + (targetValRef.current - fromVal) * eased;
      currentValRef.current = current;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        currentValRef.current = targetValRef.current;
        setDisplayValue(targetValRef.current);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  const formatted =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString();

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

