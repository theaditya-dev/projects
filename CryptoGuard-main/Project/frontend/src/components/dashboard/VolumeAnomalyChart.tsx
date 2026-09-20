import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Bar,
  ComposedChart,
} from 'recharts';
import { GlassCard } from '../common/GlassCard';
import { Activity } from 'lucide-react';

const MOCK_CHART_DATA = [
  { time: '12:00', volumeBtc: 42.1, anomalies: 8, avgRisk: 22 },
  { time: '13:00', volumeBtc: 65.4, anomalies: 14, avgRisk: 34 },
  { time: '14:00', volumeBtc: 28.9, anomalies: 5, avgRisk: 19 },
  { time: '15:00', volumeBtc: 92.3, anomalies: 24, avgRisk: 58 },
  { time: '16:00', volumeBtc: 145.0, anomalies: 38, avgRisk: 72 },
  { time: '17:00', volumeBtc: 78.4, anomalies: 29, avgRisk: 64 },
  { time: '18:00', volumeBtc: 37.2, anomalies: 12, avgRisk: 41 },
];

export const VolumeAnomalyChart: React.FC = () => {
  return (
    <GlassCard
      tint="navy"
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Transaction Volume &amp; Anomaly Correlation</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-400 inline-block" />
              Volume (BTC)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/40 border border-rose-400 inline-block" />
              Anomalies Flagged
            </span>
          </div>
        </div>
      }
    >
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={MOCK_CHART_DATA} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="anomalyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.2} />
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
              yAxisId="left"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
              tickFormatter={(v) => `${v} BTC`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              fontFamily="JetBrains Mono"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(11, 17, 30, 0.95)',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)',
                fontFamily: 'JetBrains Mono',
                fontSize: '12px',
                color: '#f8fafc',
              }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="volumeBtc"
              name="Volume (BTC)"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#volumeGradient)"
            />
            <Bar
              yAxisId="right"
              dataKey="anomalies"
              name="Isolation Forest Anomalies"
              fill="url(#anomalyGradient)"
              radius={[4, 4, 0, 0]}
              barSize={16}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
};
