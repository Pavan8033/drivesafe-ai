import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { RollingCounter } from '../common/RollingCounter';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  status?: 'safe' | 'warning' | 'danger' | 'neutral';
  showBars?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  trend,
  trendPositive = true,
  icon,
  status = 'neutral',
  showBars = false,
  className = '',
}) => {
  const statusBorder = {
    safe: 'border-emerald/40 hover:border-emerald/70',
    warning: 'border-amber-600/40 hover:border-amber-500/70',
    danger: 'border-red-600/50 hover:border-red-500/80',
    neutral: 'border-champagne/20 hover:border-champagne/45',
  }[status];

  const valueColor = {
    safe: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
    neutral: 'text-ivory',
  }[status];

  return (
    <div
      className={`p-5 rounded bg-obsidian-card border ${statusBorder} shadow-luxury-dark transition-all duration-200 flex flex-col justify-between ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="eyebrow text-[10px] text-parchment/60 tracking-wider">
          {label}
        </span>
        {icon && <span className="text-champagne/80">{icon}</span>}
      </div>

      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="flex items-baseline gap-1.5">
          <span className={`font-mono text-2xl md:text-3xl font-bold tracking-tight ${valueColor}`}>
            {typeof value === 'number' ? <RollingCounter value={value} /> : value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-parchment/60 font-normal">
              {unit}
            </span>
          )}
        </div>

        {trend && (
          <div
            className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium ${
              trendPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trendPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Mini Bar Sparkline */}
      {showBars && (
        <div className="flex items-end gap-1 h-3 mt-2 mb-1">
          <span className="w-1.5 h-2 bg-emerald/60 rounded-xs" />
          <span className="w-1.5 h-3 bg-emerald rounded-xs" />
          <span className="w-1.5 h-2 bg-emerald/70 rounded-xs" />
          <span className="w-1.5 h-3 bg-emerald rounded-xs" />
          <span className="w-1.5 h-2.5 bg-champagne rounded-xs" />
        </div>
      )}

      {subtext && (
        <span className="text-[11px] text-parchment/50 font-sans mt-2 block">
          {subtext}
        </span>
      )}
    </div>
  );
};
