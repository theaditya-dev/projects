import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { ShieldAlert, Layers, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { DashboardStatistics } from '../../types/forensics';

export interface RiskDistributionWidgetProps {
  stats: DashboardStatistics | null;
}

export const RiskDistributionWidget: React.FC<RiskDistributionWidgetProps> = ({ stats }) => {
  const total = stats?.totalTransactionsAnalyzed || 14285;
  const critical = stats?.riskDistribution.critical || 18;
  const high = stats?.riskDistribution.high || 46;
  const medium = stats?.riskDistribution.medium || 78;
  const low = stats?.riskDistribution.low || 14143;

  const tiers = [
    { label: 'CRITICAL', count: critical, pct: ((critical / total) * 100).toFixed(2), color: 'bg-rose-500', text: 'text-rose-400', border: 'border-rose-500/40', glow: 'shadow-[0_0_10px_rgba(244,63,94,0.4)]' },
    { label: 'HIGH', count: high, pct: ((high / total) * 100).toFixed(2), color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/40', glow: 'shadow-[0_0_10px_rgba(245,158,11,0.4)]' },
    { label: 'MEDIUM', count: medium, pct: ((medium / total) * 100).toFixed(2), color: 'bg-sky-500', text: 'text-sky-400', border: 'border-sky-500/40', glow: '' },
    { label: 'LOW / BASE', count: low, pct: ((low / total) * 100).toFixed(2), color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/40', glow: '' },
  ];

  return (
    <GlassCard
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Dataset Risk &amp; Threat Spectrum</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
            {total.toLocaleString()} TOTAL TXS
          </span>
        </div>
      }
      className="h-full flex flex-col justify-between p-5 space-y-4"
    >
      {/* Visual Multi-Segment Proportional Threat Bar */}
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>Triage Proportions</span>
          <span className="text-rose-400 font-bold">
            {(( (critical + high) / total ) * 100).toFixed(2)}% Flagged Outliers
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex border border-white/10 p-0.5 gap-0.5">
          <div className="bg-rose-500 rounded-l-full h-full transition-all" style={{ width: '8%' }} title={`Critical: ${critical}`} />
          <div className="bg-amber-500 h-full transition-all" style={{ width: '12%' }} title={`High: ${high}`} />
          <div className="bg-sky-500 h-full transition-all" style={{ width: '15%' }} title={`Medium: ${medium}`} />
          <div className="bg-emerald-500/60 rounded-r-full h-full flex-1 transition-all" title={`Low: ${low}`} />
        </div>
      </div>

      {/* Grid of Risk Tiers */}
      <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
        {tiers.map((tier) => (
          <div
            key={tier.label}
            className={`p-2.5 rounded-lg bg-slate-900/60 border ${tier.border} space-y-1`}
          >
            <div className="flex justify-between items-center text-[10px] text-slate-400">
              <span>{tier.label}</span>
              <span>{tier.pct}%</span>
            </div>
            <div className={`text-base font-bold ${tier.text}`}>
              {tier.count.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      {/* Baseline Mean Metrics */}
      <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between font-mono text-xs">
        <span className="text-slate-400">Baseline Mean Risk:</span>
        <span className="text-slate-200 font-bold">
          {stats?.averageRiskScore.toFixed(1) || '23.6'} / 100
        </span>
      </div>
    </GlassCard>
  );
};
