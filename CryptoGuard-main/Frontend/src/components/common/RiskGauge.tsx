import React from 'react';
import { SeverityLevel } from '../../types/forensics';
import { SEVERITY_CONFIG, formatAnomalyScore } from '../../utils/riskCalculators';
import { GlassBadge } from './GlassBadge';
import { ShieldAlert, Cpu, CheckCircle } from 'lucide-react';

export interface RiskGaugeProps {
  score: number;
  severity: SeverityLevel;
  confidence?: number;
  anomalyScore?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  severity,
  confidence = 0.92,
  anomalyScore = -0.74,
  size = 'md',
  showDetails = true,
}) => {
  const config = SEVERITY_CONFIG[severity];
  const radius = size === 'lg' ? 56 : size === 'md' ? 44 : 32;
  const strokeWidth = size === 'lg' ? 8 : size === 'md' ? 6 : 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  const svgDimensions = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      {/* SVG Radial Meter */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={svgDimensions}
          height={svgDimensions}
          className="transform -rotate-90 transition-all duration-1000 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Glowing Animated Value Track */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={config.barColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              filter: `drop-shadow(0 0 8px ${config.barColor})`,
              transition: 'stroke-dashoffset 1s ease-in-out',
            }}
          />
        </svg>

        {/* Center Numeric Value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span
            className="font-mono font-bold tracking-tight text-white"
            style={{
              fontSize: size === 'lg' ? '1.75rem' : size === 'md' ? '1.35rem' : '1rem',
            }}
          >
            {score.toFixed(1)}
          </span>
          <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400">
            / 100
          </span>
        </div>
      </div>

      {/* Accompanying Visual Indicators */}
      {showDetails && (
        <div className="space-y-2 text-left font-mono">
          <div className="flex items-center gap-2">
            <GlassBadge severity={severity} variant="severity" size="xs">
              {severity} SEVERITY
            </GlassBadge>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Confidence:</span>
              <span className="text-slate-200 font-bold">{(confidence * 100).toFixed(0)}%</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>Isolation Forest:</span>
              <span className="text-rose-400 font-bold">{formatAnomalyScore(anomalyScore)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
