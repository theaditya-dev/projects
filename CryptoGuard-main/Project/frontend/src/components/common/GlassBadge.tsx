import React from 'react';
import { cn } from '../../utils/cn';
import { SeverityLevel } from '../../types/forensics';
import { SEVERITY_CONFIG } from '../../utils/riskCalculators';

export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'severity' | 'cyan' | 'purple' | 'provisional' | 'outline';
  severity?: SeverityLevel;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  className,
  variant = 'default',
  severity,
  size = 'sm',
  dot = false,
  ...props
}) => {
  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
    sm: 'px-2.5 py-1 text-xs font-semibold tracking-wide uppercase',
    md: 'px-3 py-1.5 text-xs font-semibold tracking-wide uppercase',
  };

  let variantStyle = 'bg-slate-800/60 text-slate-300 border border-white/10';

  if (variant === 'severity' && severity) {
    const config = SEVERITY_CONFIG[severity];
    variantStyle = `${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`;
  } else if (variant === 'cyan') {
    variantStyle = 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30';
  } else if (variant === 'purple') {
    variantStyle = 'bg-purple-500/15 text-purple-300 border border-purple-500/30';
  } else if (variant === 'provisional') {
    variantStyle = 'bg-amber-500/10 text-amber-300/80 border border-amber-500/20 italic font-mono';
  } else if (variant === 'outline') {
    variantStyle = 'bg-transparent text-slate-400 border border-white/15';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full backdrop-blur-md transition-colors border',
        sizeStyles[size],
        variantStyle,
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            severity ? SEVERITY_CONFIG[severity].barColor : 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
};
