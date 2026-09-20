import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  AlertTriangle, 
  Search, 
  ArrowUpDown, 
  ShieldAlert, 
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Activity,
  Layers,
  Cpu
} from 'lucide-react';
import { alertService } from '../api/services/alertService';
import { Alert, SeverityLevel } from '../types/forensics';
import { GlassCard } from '../components/common/GlassCard';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassButton } from '../components/common/GlassButton';
import { MonospaceHash } from '../components/common/MonospaceHash';
import { GlassModal } from '../components/common/GlassModal';
import { RiskGauge } from '../components/common/RiskGauge';
import { formatRelativeTime } from '../utils/formatters';
import { formatAnomalyScore, SEVERITY_CONFIG } from '../utils/riskCalculators';

export const AlertsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel | 'ALL'>('ALL');
  const [minRisk, setMinRisk] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'riskScore' | 'timestamp' | 'anomalyScore'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Preview Modal State
  const [previewAlert, setPreviewAlert] = useState<Alert | null>(null);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const res = await alertService.getRankedAlerts({
        severity: selectedSeverity !== 'ALL' ? selectedSeverity : undefined,
        minRiskScore: minRisk > 0 ? minRisk : undefined,
        searchQuery: searchQuery || undefined,
        sortBy,
        sortOrder,
        limit: 50,
      });
      setAlerts(res.items);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedSeverity, minRisk, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAlerts();
  };

  const severityStats = [
    { level: 'CRITICAL', count: 18, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { level: 'HIGH', count: 46, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { level: 'MEDIUM', count: 78, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/30' },
    { level: 'LOW', count: 14143, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wide text-white flex items-center gap-3">
            <span>RANKED THREAT ALERTS</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {totalCount} ANOMALIES
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Prioritized queue of anomalous Bitcoin transactions &amp; entity clusters scored by Isolation Forest
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedSeverity('ALL');
              setMinRisk(0);
              setSortBy('riskScore');
              setSortOrder('desc');
            }}
          >
            Reset Filters
          </GlassButton>
        </div>
      </div>

      {/* Visual Severity Distribution Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {severityStats.map((stat) => (
          <div
            key={stat.level}
            onClick={() => setSelectedSeverity(stat.level as any)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${stat.bg} ${
              selectedSeverity === stat.level ? 'ring-2 ring-cyan-400 shadow-glow-cyan' : 'hover:border-white/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold font-display uppercase tracking-wider text-slate-400">
                {stat.level}
              </span>
              <span className={`text-lg font-bold font-mono ${stat.color}`}>
                {stat.count.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-slate-900/60 rounded-full h-1 mt-2">
              <div
                className={`h-full rounded-full ${stat.level === 'CRITICAL' ? 'bg-rose-500' : stat.level === 'HIGH' ? 'bg-amber-500' : stat.level === 'MEDIUM' ? 'bg-sky-500' : 'bg-emerald-500'}`}
                style={{ width: `${stat.level === 'LOW' ? 90 : (stat.count / 100) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Control Bar */}
      <GlassCard className="p-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Alert ID, TXID, Wallet Address, or Heuristic..."
              className="glass-input w-full pl-10 pr-20 py-2 rounded-lg text-xs font-mono text-slate-100 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-[11px] font-mono transition-colors"
            >
              FILTER
            </button>
          </form>

          {/* Min Risk Slider */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-slate-300">Min Risk: {minRisk}</span>
            <input
              type="range"
              min="0"
              max="95"
              step="5"
              value={minRisk}
              onChange={(e) => setMinRisk(Number(e.target.value))}
              className="w-24 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Sort Controller */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input px-3 py-1.5 rounded-lg text-xs font-mono text-slate-200"
            >
              <option value="riskScore">Sort by Risk Score</option>
              <option value="anomalyScore">Sort by Anomaly Outlier</option>
              <option value="timestamp">Sort by Detection Time</option>
            </select>
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Alerts Table */}
      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 font-mono text-sm space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No threat alerts match the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-display text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Risk &amp; Severity</th>
                  <th className="py-3 px-4">Alert ID</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Isolation Forest</th>
                  <th className="py-3 px-4">Anomaly Explanation</th>
                  <th className="py-3 px-4">Detected</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {alerts.map((alert) => {
                  const config = SEVERITY_CONFIG[alert.severity];
                  return (
                    <tr
                      key={alert.alertId}
                      className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                      onClick={() => setPreviewAlert(alert)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border"
                            style={{
                              backgroundColor: config.badgeBg,
                              borderColor: config.badgeBorder,
                              color: config.barColor,
                            }}
                          >
                            {alert.riskScore.toFixed(0)}
                          </span>
                          <span className="text-[11px] font-bold" style={{ color: config.barColor }}>
                            {alert.severity}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-100 whitespace-nowrap">
                        {alert.alertId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[9px] text-slate-500">TX:</span>
                            <MonospaceHash hash={alert.txid} type="txid" linkToInvestigate={false} />
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <span className="text-[9px] text-slate-500">ADDR:</span>
                            <MonospaceHash hash={alert.primaryAddress} type="address" linkToInvestigate={false} />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-white/10 text-rose-400 font-semibold">
                          {formatAnomalyScore(alert.anomalyScore)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs font-sans">
                        <p className="text-xs text-slate-300 line-clamp-1">
                          {alert.summaryExplanation}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {alert.heuristicTags.slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {formatRelativeTime(alert.timestamp)}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setPreviewAlert(alert)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
                            title="Snapshot"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            to={`/investigate/tx/${alert.txid}`}
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono flex items-center gap-1 font-semibold transition-colors"
                          >
                            <span>DOSSIER</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Snapshot Modal */}
      {previewAlert && (
        <GlassModal
          isOpen={Boolean(previewAlert)}
          onClose={() => setPreviewAlert(null)}
          title={
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span className="font-mono text-sm font-bold">
                ALERT SNAPSHOT // {previewAlert.alertId}
              </span>
            </div>
          }
          footer={
            <div className="flex items-center justify-between w-full font-mono text-xs">
              <span className="text-slate-400">
                Confidence: {(previewAlert.confidence * 100).toFixed(0)}%
              </span>
              <div className="flex items-center gap-2">
                <GlassButton variant="ghost" size="sm" onClick={() => setPreviewAlert(null)}>
                  Close
                </GlassButton>
                <Link to={`/investigate/tx/${previewAlert.txid}`}>
                  <GlassButton variant="primary" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                    Open Deep Investigation
                  </GlassButton>
                </Link>
              </div>
            </div>
          }
        >
          <div className="space-y-4">
            <RiskGauge
              score={previewAlert.riskScore}
              severity={previewAlert.severity}
              confidence={previewAlert.confidence}
              anomalyScore={previewAlert.anomalyScore}
              size="md"
            />

            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-white/10 space-y-1.5 text-xs font-mono">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Anomaly Explanation
              </div>
              <p className="text-slate-200 font-sans">{previewAlert.summaryExplanation}</p>
            </div>

            {/* Feature Contributions Matrix */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider font-display">
                Feature Contribution Weights
              </h4>
              <div className="space-y-2">
                {previewAlert.featureContributions.map((feature, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 space-y-1 font-mono text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-slate-200 font-semibold">{feature.label}</span>
                      <span className="text-cyan-400">+{feature.contributionScore.toFixed(2)} wt</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full rounded-full"
                        style={{ width: `${feature.contributionScore * 100}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans">{feature.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassModal>
      )}
    </div>
  );
};
