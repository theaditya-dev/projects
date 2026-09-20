import React, { useState } from 'react';
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { Activity, Flame, Clock, AlertTriangle, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { formatBtc } from '../../utils/formatters';

interface TimelineDataPoint {
  time: string;
  volumeBtc: number;
  anomalies: number;
  riskScore: number;
  criticalEvents: number;
  incidentLabel?: string;
}

const MOCK_24H_DATA: TimelineDataPoint[] = [
  { time: '00:00', volumeBtc: 18.2, anomalies: 2, riskScore: 18, criticalEvents: 0 },
  { time: '02:00', volumeBtc: 12.5, anomalies: 1, riskScore: 14, criticalEvents: 0 },
  { time: '04:00', volumeBtc: 9.8, anomalies: 0, riskScore: 11, criticalEvents: 0 },
  { time: '06:00', volumeBtc: 24.1, anomalies: 3, riskScore: 22, criticalEvents: 0 },
  { time: '08:00', volumeBtc: 58.4, anomalies: 6, riskScore: 35, criticalEvents: 1 },
  { time: '10:00', volumeBtc: 84.0, anomalies: 12, riskScore: 48, criticalEvents: 2 },
  { time: '12:00', volumeBtc: 42.1, anomalies: 8, riskScore: 31, criticalEvents: 1 },
  { time: '14:00', volumeBtc: 28.9, anomalies: 5, riskScore: 24, criticalEvents: 0, incidentLabel: 'Dusting Probe' },
  { time: '15:30', volumeBtc: 92.3, anomalies: 24, riskScore: 74, criticalEvents: 3, incidentLabel: 'Script Mismatch' },
  { time: '17:15', volumeBtc: 145.0, anomalies: 38, riskScore: 88, criticalEvents: 5, incidentLabel: 'Common-Input Consolidation' },
  { time: '18:42', volumeBtc: 78.4, anomalies: 29, riskScore: 95, criticalEvents: 6, incidentLabel: 'Peel-Chain Rapid Outlier' },
  { time: '20:00', volumeBtc: 37.2, anomalies: 12, riskScore: 42, criticalEvents: 1 },
  { time: '22:00', volumeBtc: 22.0, anomalies: 4, riskScore: 25, criticalEvents: 0 },
];

// Heatmap hourly blocks for the 24h risk concentration strip
const HEATMAP_SLOTS = [
  { hour: '00', level: 'LOW', val: 18 },
  { hour: '02', level: 'LOW', val: 14 },
  { hour: '04', level: 'LOW', val: 11 },
  { hour: '06', level: 'LOW', val: 22 },
  { hour: '08', level: 'MEDIUM', val: 35 },
  { hour: '10', level: 'MEDIUM', val: 48 },
  { hour: '12', level: 'MEDIUM', val: 31 },
  { hour: '14', level: 'MEDIUM', val: 24 },
  { hour: '15', level: 'HIGH', val: 74 },
  { hour: '17', level: 'CRITICAL', val: 88 },
  { hour: '18', level: 'CRITICAL', val: 95 },
  { hour: '20', level: 'MEDIUM', val: 42 },
  { hour: '22', level: 'LOW', val: 25 },
];

export const AnomalyActivityTimeline: React.FC = () => {
  const [timeWindow, setTimeWindow] = useState<'24H' | '12H' | '6H'>('24H');
  const [activeMetric, setActiveMetric] = useState<'ALL' | 'VOLUME' | 'ANOMALIES' | 'RISK'>('ALL');

  const displayData =
    timeWindow === '6H'
      ? MOCK_24H_DATA.slice(-6)
      : timeWindow === '12H'
      ? MOCK_24H_DATA.slice(-9)
      : MOCK_24H_DATA;

  return (
    <GlassCard
      header={
        <div className="flex flex-wrap items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wide text-white">
                  ANOMALY ACTIVITY &amp; THREAT INTENSITY MATRIX
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  TEMPORAL SURVEILLANCE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Real-time correlation of Bitcoin transaction volume against Isolation Forest anomaly density
              </p>
            </div>
          </div>

          {/* Time Window Switcher */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            {(['24H', '12H', '6H'] as const).map((win) => (
              <button
                key={win}
                type="button"
                onClick={() => setTimeWindow(win)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeWindow === win
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-glow-cyan font-bold'
                    : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
                }`}
              >
                {win}
              </button>
            ))}
          </div>
        </div>
      }
      className="p-5 space-y-5"
    >
      {/* Legend & Quick Metric Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5 text-xs font-mono">
        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === 'VOLUME' ? 'ALL' : 'VOLUME')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'VOLUME' || activeMetric === 'ALL'
                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
            <span>Volume (BTC)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === 'ANOMALIES' ? 'ALL' : 'ANOMALIES')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'ANOMALIES' || activeMetric === 'ALL'
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                : 'text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            <span>Isolation Forest Anomalies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMetric(activeMetric === 'RISK' ? 'ALL' : 'RISK')}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-md transition-all ${
              activeMetric === 'RISK' || activeMetric === 'ALL'
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : 'text-slate-500'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span>Risk Intensity (0–100)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Timeline synchronized with memory pool</span>
        </div>
      </div>

      {/* Primary Composed Timeline Visualization */}
      <div className="h-[280px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="cyberVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="cyberAnomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.3} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />

            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />

            <YAxis
              yAxisId="volumeAxis"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
              tickFormatter={(v) => `${v} BTC`}
            />

            <YAxis
              yAxisId="metricAxis"
              orientation="right"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}`}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(9, 14, 26, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '10px',
                backdropFilter: 'blur(16px)',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                color: '#f8fafc',
                boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
              }}
              formatter={(value: any, name: string) => {
                if (name === 'Volume') return [`${value} BTC`, 'Volume'];
                if (name === 'Anomalies') return [`${value} flagged`, 'Isolation Forest'];
                if (name === 'Risk Score') return [`${value} / 100`, 'Risk Intensity'];
                return [value, name];
              }}
            />

            {(activeMetric === 'VOLUME' || activeMetric === 'ALL') && (
              <Area
                yAxisId="volumeAxis"
                type="monotone"
                dataKey="volumeBtc"
                name="Volume"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cyberVolumeGradient)"
              />
            )}

            {(activeMetric === 'ANOMALIES' || activeMetric === 'ALL') && (
              <Bar
                yAxisId="metricAxis"
                dataKey="anomalies"
                name="Anomalies"
                fill="url(#cyberAnomalyGradient)"
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            )}

            {(activeMetric === 'RISK' || activeMetric === 'ALL') && (
              <Line
                yAxisId="metricAxis"
                type="monotone"
                dataKey="riskScore"
                name="Risk Score"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ fill: '#f59e0b', r: 4, strokeWidth: 1, stroke: '#fff' }}
                activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Concentration Heatmap Strip */}
      <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider font-display">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            Risk Concentration Intensity Strip (Hourly Distribution)
          </span>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500/80 inline-block" /> Low</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-sky-500/80 inline-block" /> Med</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-500/80 inline-block" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-rose-500/80 inline-block" /> Critical Burst</span>
          </div>
        </div>

        <div className="grid grid-cols-13 gap-1.5 p-2 rounded-xl bg-slate-950/60 border border-white/5">
          {HEATMAP_SLOTS.map((slot, idx) => {
            const isCrit = slot.level === 'CRITICAL';
            const isHigh = slot.level === 'HIGH';
            const isMed = slot.level === 'MEDIUM';

            const bgClass = isCrit
              ? 'bg-rose-500/30 border-rose-500/50 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
              : isHigh
              ? 'bg-amber-500/25 border-amber-500/40 text-amber-300'
              : isMed
              ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
              : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-300';

            return (
              <div
                key={idx}
                className={`p-2 rounded-lg border text-center transition-all duration-200 hover:scale-105 cursor-pointer ${bgClass}`}
                title={`Hour ${slot.hour}:00 UTC - Risk Index: ${slot.val} (${slot.level})`}
              >
                <div className="text-[10px] text-slate-400 font-mono">{slot.hour}h</div>
                <div className="text-xs font-bold font-mono mt-0.5">{slot.val}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Incident Milestone Markers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1 font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
          <div className="flex justify-between text-[11px] text-rose-300 font-bold">
            <span>18:42 UTC // PEEL OUTLIER</span>
            <span>RISK 94.8</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Rapid 18.54 BTC multi-output split (6 hops in 180s).
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-1">
          <div className="flex justify-between text-[11px] text-rose-300 font-bold">
            <span>17:15 UTC // CONSOLIDATION</span>
            <span>RISK 88.5</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            14-input Common-Input-Ownership co-spend (42.50 BTC).
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-1">
          <div className="flex justify-between text-[11px] text-amber-300 font-bold">
            <span>15:30 UTC // SCRIPT MISMATCH</span>
            <span>RISK 74.2</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            Heterogeneous P2SH + Taproot mixed payment.
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-sky-950/20 border border-sky-500/30 space-y-1">
          <div className="flex justify-between text-[11px] text-sky-300 font-bold">
            <span>14:10 UTC // DUST PROBE</span>
            <span>RISK 52.0</span>
          </div>
          <p className="text-[10px] text-slate-400 font-sans">
            8 micro-outputs below economic threshold (&lt;1000 sat).
          </p>
        </div>
      </div>
    </GlassCard>
  );
};
