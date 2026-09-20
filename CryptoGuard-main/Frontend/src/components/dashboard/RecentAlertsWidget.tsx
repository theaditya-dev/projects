import React from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { MonospaceHash } from '../common/MonospaceHash';
import { Alert } from '../../types/forensics';
import { 
  ShieldAlert, 
  ArrowRight, 
} from 'lucide-react';

export interface RecentAlertsWidgetProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export const RecentAlertsWidget: React.FC<RecentAlertsWidgetProps> = ({ alerts, isLoading }) => {
  return (
    <GlassCard
      tint="navy"
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Priority Threat Stream</span>
          </div>
          <Link
            to="/alerts"
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
      className="p-5 space-y-3"
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-8 text-slate-500 font-mono text-xs">
          No critical alerts pending triage.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.alertId}
              className="p-3.5 rounded-xl bg-slate-950/70 hover:bg-slate-900/90 border border-white/10 hover:border-cyan-400/40 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs group"
            >
              {/* Left Details */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white tracking-wide">{alert.alertId}</span>
                  <GlassBadge severity={alert.severity} size="xs">
                    {alert.severity}
                  </GlassBadge>
                  <span className="text-[10px] text-slate-400">
                    Score: {alert.riskScore.toFixed(1)} / 100
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 flex items-center gap-2 truncate">
                  <span className="text-slate-500">TX:</span>
                  <MonospaceHash hash={alert.txid} type="txid" startChars={6} endChars={6} linkToInvestigate={false} />
                </div>
              </div>

              {/* Right Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                <Link
                  to={`/investigate/tx/${alert.txid}`}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
};
