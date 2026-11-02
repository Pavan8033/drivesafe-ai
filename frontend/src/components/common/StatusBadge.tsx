import React from 'react';
import type { DetectionState } from '../../types/monitoring';

interface StatusBadgeProps {
  status: DetectionState | 'READY' | 'CONNECTED' | 'DISCONNECTED';
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  size = 'md',
}) => {
  const config = {
    ALERT: {
      label: 'Vigilant / Alert',
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
      dot: 'bg-emerald-400',
    },
    READY: {
      label: 'System Ready',
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
      dot: 'bg-emerald-400',
    },
    CONNECTED: {
      label: 'Connected',
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/40',
      dot: 'bg-emerald-400',
    },
    CALIBRATING: {
      label: 'Calibrating...',
      bg: 'bg-amber-950/80 text-amber-300 border-amber-600/40',
      dot: 'bg-amber-400 animate-pulse',
    },
    EYES_CLOSED: {
      label: 'Eyes Closed',
      bg: 'bg-amber-950/80 text-amber-200 border-amber-500/50',
      dot: 'bg-amber-400',
    },
    POSSIBLE_DROWSINESS: {
      label: 'Drowsiness Warning',
      bg: 'bg-red-950/90 text-red-200 border-red-500 animate-pulse',
      dot: 'bg-red-400',
    },
    HEAD_AWAY: {
      label: 'Head Turned Away',
      bg: 'bg-amber-950/80 text-amber-200 border-amber-500/50',
      dot: 'bg-amber-400',
    },
    SUSTAINED_HEAD_AWAY: {
      label: 'Sustained Head-Away',
      bg: 'bg-red-950/90 text-red-200 border-red-500 animate-pulse',
      dot: 'bg-red-400',
    },
    RECOVERING: {
      label: 'Driver Recovering',
      bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50',
      dot: 'bg-emerald-400',
    },
    NO_FACE: {
      label: 'Waiting For Face',
      bg: 'bg-stone-900/80 text-stone-400 border-stone-700/60',
      dot: 'bg-stone-500',
    },
    DISCONNECTED: {
      label: 'Engine Disconnected',
      bg: 'bg-stone-900/80 text-stone-400 border-stone-700/60',
      dot: 'bg-stone-500',
    },
    UNKNOWN: {
      label: 'Standby',
      bg: 'bg-stone-900/80 text-stone-400 border-stone-700/60',
      dot: 'bg-stone-500',
    },
  }[status] || {
    label: status,
    bg: 'bg-stone-900/80 text-stone-400 border-stone-700/60',
    dot: 'bg-stone-500',
  };

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-sans font-medium rounded border tracking-wide uppercase ${sizeClass} ${config.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
