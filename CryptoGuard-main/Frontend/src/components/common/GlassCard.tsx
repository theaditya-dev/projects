import React from 'react';
import { cn } from '../../utils/cn';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'standard' | 'elevated' | 'inset' | 'interactive';
  tint?: 'none' | 'navy' | 'cyan' | 'violet' | 'rose' | 'amber';
  glow?: 'none' | 'cyan' | 'rose' | 'amber' | 'violet';
  noPadding?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  header,
  footer,
  variant = 'elevated',
  tint = 'navy',
  glow = 'none',
  noPadding = false,
  ...props
}) => {
  const tintClasses = {
    none: '',
    navy: 'glass-tint-navy',
    cyan: 'glass-tint-cyan',
    violet: 'glass-tint-violet',
    rose: 'glass-tint-rose',
    amber: 'glass-tint-amber',
  };

  const glowClasses = {
    none: '',
    cyan: 'shadow-[0_16px_40px_-8px_rgba(6,182,212,0.3)] border-cyan-400/40',
    rose: 'shadow-[0_16px_40px_-8px_rgba(244,63,94,0.35)] border-rose-500/40',
    amber: 'shadow-[0_16px_40px_-8px_rgba(245,158,11,0.3)] border-amber-500/40',
    violet: 'shadow-[0_16px_40px_-8px_rgba(139,92,246,0.3)] border-purple-500/40',
  };

  return (
    <div
      className={cn(
        'rounded-2xl transition-all duration-300 glass-sheen',
        variant === 'elevated' && 'glass-card-elevated',
        variant === 'standard' && 'glass-panel',
        variant === 'inset' && 'glass-inset p-4 rounded-xl',
        variant === 'interactive' && 'glass-card-elevated hover:scale-[1.01] cursor-pointer',
        tintClasses[tint],
        glowClasses[glow],
        className
      )}
      {...props}
    >
      {header && (
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between font-display font-semibold text-sm tracking-wide text-white">
          {header}
        </div>
      )}
      <div className={cn(!noPadding && 'p-5')}>{children}</div>
      {footer && (
        <div className="px-5 py-3.5 border-t border-white/08 bg-black/20 text-xs font-mono text-slate-400 rounded-b-2xl">
          {footer}
        </div>
      )}
    </div>
  );
};
