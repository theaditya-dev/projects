import React from 'react';
import { GlassCard } from '../common/GlassCard';
import { DashboardStatistics } from '../../types/forensics';
import { formatBtc } from '../../utils/formatters';
import { 
  ShieldAlert, 
  Coins, 
  Cpu, 
  TrendingUp, 
  Layers, 
  ArrowUpRight,
  Activity
} from 'lucide-react';

export interface ThreatRadarKPIProps {
  stats: DashboardStatistics | null;
  isLoading?: boolean;
}

export const ThreatRadarKPI: React.FC<ThreatRadarKPIProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      id: 'kpi-vol',
      title: 'TOTAL TRANSACTIONS ANALYZED',
      value: stats ? stats.totalTransactionsAnalyzed.toLocaleString() : '14,285',
      subtitle: `${stats ? formatBtc(stats.totalVolumeBtc) : '489.34 BTC'} parsed ledger volume`,
      trend: '+12.4% vs baseline',
      icon: Coins,
      tint: 'navy' as const,
      glow: 'none' as const,
      accentColor: 'text-cyan-400',
      barColor: 'bg-cyan-400',
      barWidth: '78%',
    },
    {
      id: 'kpi-crit',
      title: 'CRITICAL ANOMALY ALERTS',
      value: stats ? stats.criticalAlertCount.toString() : '18',
      subtitle: 'Immediate investigator priority',
      trend: '18 Active Outliers',
      icon: ShieldAlert,
      tint: 'rose' as const,
      glow: 'rose' as const,
      accentColor: 'text-rose-400',
      barColor: 'bg-rose-500',
      barWidth: '92%',
    },
    {
      id: 'kpi-clusters',
      title: 'HIGH-RISK CO-SPEND CLUSTERS',
      value: stats ? stats.highRiskClusterCount.toString() : '7',
      subtitle: 'Common-Input-Ownership heuristics',
      trend: '37.08 BTC cluster volume',
      icon: Layers,
      tint: 'violet' as const,
      glow: 'violet' as const,
      accentColor: 'text-purple-400',
      barColor: 'bg-purple-500',
      barWidth: '65%',
    },
    {
      id: 'kpi-ai',
      title: 'ISOLATION FOREST ANOMALIES',
      value: stats ? stats.anomalyCount.toString() : '142',
      subtitle: 'Statistical decision tree outliers',
      trend: 'Mean Risk: 23.6 / 100',
      icon: Activity,
      tint: 'cyan' as const,
      glow: 'cyan' as const,
      accentColor: 'text-amber-400',
      barColor: 'bg-amber-400',
      barWidth: '45%',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <GlassCard
            key={card.id}
            tint={card.tint}
            glow={card.glow}
            className="p-5 flex flex-col justify-between space-y-3 relative overflow-hidden"
          >
            {/* Header: Title & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg bg-white/5 border border-white/10 ${card.accentColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Main Value Display */}
            <div className="space-y-1">
              <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-white">
                {isLoading ? (
                  <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
                ) : (
                  card.value
                )}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {card.subtitle}
              </div>
            </div>

            {/* Visual Progress Mini-Meter & Trend */}
            <div className="space-y-1.5 pt-2 border-t border-white/08">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400">{card.trend}</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className={`h-full rounded-full ${card.barColor} transition-all duration-500`}
                  style={{ width: card.barWidth }}
                />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
