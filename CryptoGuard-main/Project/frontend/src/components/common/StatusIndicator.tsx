import React from 'react';
import { cn } from '../../utils/cn';

export interface StatusIndicatorProps {
  status: 'HEALTHY' | 'PROCESSING' | 'DEGRADED' | 'OFFLINE' | 'MOCK_MODE';
  label?: string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  size = 'md',
  pulse = true,
}) => {
  const statusConfig = {
    HEALTHY: {
      color: 'bg-emerald-400',
      glow: 'shadow-[0_0_10px_rgba(52,211,153,0.8)]',
      text: 'text-emerald-400',
      defaultLabel: 'System Operational (Offline)',
    },
    PROCESSING: {
      color: 'bg-cyan-400',
      glow: 'shadow-[0_0_10px_rgba(6,182,212,0.8)]',
      text: 'text-cyan-400',
      defaultLabel: 'Pipeline Processing',
    },
    DEGRADED: {
      color: 'bg-amber-400',
      glow: 'shadow-[0_0_10px_rgba(251,191,36,0.8)]',
      text: 'text-amber-400',
      defaultLabel: 'Degraded State',
    },
    OFFLINE: {
      color: 'bg-rose-400',
      glow: 'shadow-[0_0_10px_rgba(244,63,94,0.8)]',
      text: 'text-rose-400',
      defaultLabel: 'Backend Disconnected',
    },
    MOCK_MODE: {
      color: 'bg-purple-400',
      glow: 'shadow-[0_0_10px_rgba(168,85,247,0.8)]',
      text: 'text-purple-300',
      defaultLabel: 'Mock Pipeline Active',
    },
  };

  const current = statusConfig[status];

  return (
    <div className="inline-flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        {pulse && (
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              current.color
            )}
          />
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2.5 w-2.5',
            current.color,
            current.glow
          )}
        />
      </span>
      <span
        className={cn(
          'font-mono uppercase tracking-wider',
          size === 'sm' ? 'text-[11px]' : 'text-xs',
          current.text
        )}
      >
        {label || current.defaultLabel}
      </span>
    </div>
  );
};
