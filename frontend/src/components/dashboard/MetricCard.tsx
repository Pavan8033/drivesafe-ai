import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon?: React.ReactNode;
  status?: 'safe' | 'warning' | 'danger' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  status = 'neutral',
  className = '',
}) => {
  const statusBorder = {
    safe: 'border-emerald-600/40 hover:border-emerald-500/60',
    warning: 'border-amber-600/40 hover:border-amber-500/60',
    danger: 'border-red-600/50 hover:border-red-500/80',
    neutral: 'border-gold/20 hover:border-gold/40',
  }[status];

  const valueColor = {
    safe: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    neutral: 'text-ivory',
  }[status];

  return (
    <div
      className={`p-5 rounded bg-charcoal-card border ${statusBorder} shadow-luxury-dark transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="eyebrow text-[10px] text-parchment/60 tracking-wider">
          {label}
        </span>
        {icon && <span className="text-gold/70">{icon}</span>}
      </div>

      <div className="flex items-baseline gap-1.5 my-1">
        <span className={`font-mono text-2xl md:text-3xl font-semibold tracking-tight ${valueColor}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-mono text-parchment/60 font-normal">
            {unit}
          </span>
        )}
      </div>

      {subtext && (
        <span className="text-[11px] text-parchment/50 font-sans mt-2 block">
          {subtext}
        </span>
      )}
    </div>
  );
};
