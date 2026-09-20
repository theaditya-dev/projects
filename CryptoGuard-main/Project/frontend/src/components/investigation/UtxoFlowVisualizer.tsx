import React from 'react';
import { ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle, Coins } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { MonospaceHash } from '../common/MonospaceHash';
import { GlassBadge } from '../common/GlassBadge';
import { UtxoItem } from '../../types/forensics';
import { formatBtc } from '../../utils/formatters';

export interface UtxoFlowVisualizerProps {
  txid: string;
  inputs: UtxoItem[];
  outputs: UtxoItem[];
  feeSatoshis?: number;
}

export const UtxoFlowVisualizer: React.FC<UtxoFlowVisualizerProps> = ({
  txid,
  inputs,
  outputs,
  feeSatoshis = 35000,
}) => {
  return (
    <GlassCard
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Interactive UTXO Flow Diagram</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Fee: {(feeSatoshis / 100000000).toFixed(6)} BTC
          </span>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center font-mono text-xs">
        {/* Left: Inputs List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-white/5 flex justify-between">
            <span>Inputs ({inputs.length})</span>
            <span className="text-cyan-400">Source UTXO</span>
          </div>

          <div className="space-y-2">
            {inputs.map((inp, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-900/80 border border-cyan-500/30 space-y-1 hover:border-cyan-400 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <MonospaceHash hash={inp.address} type="address" />
                  <span className="text-cyan-300 font-bold">{formatBtc(inp.amountBtc, 4)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Script: {inp.scriptType}</span>
                  {inp.clusterId && <span className="text-purple-300">Cluster: {inp.clusterId}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Transaction Block (3 cols) */}
        <div className="lg:col-span-3 p-4 rounded-xl bg-purple-950/25 border border-purple-500/40 text-center space-y-2 shadow-glow-cyan">
          <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">
            TRANSACTION ENGINE
          </div>
          <MonospaceHash hash={txid} type="txid" linkToInvestigate={false} className="text-white font-bold" />
          <div className="text-[10px] text-slate-400 pt-1 border-t border-white/10 flex justify-around">
            <span>1 In</span>
            <span>•</span>
            <span className="text-amber-300 font-bold">184 sat/vB</span>
            <span>•</span>
            <span>2 Out</span>
          </div>
        </div>

        {/* Right: Outputs List (4 cols) */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider pb-1 border-b border-white/5 flex justify-between">
            <span>Outputs ({outputs.length})</span>
            <span className="text-amber-400">Destinations</span>
          </div>

          <div className="space-y-2">
            {outputs.map((out, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border space-y-1 transition-colors ${
                  out.isChangeAddress
                    ? 'bg-rose-950/20 border-rose-500/40 hover:border-rose-400'
                    : 'bg-slate-900/80 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center">
                  <MonospaceHash hash={out.address} type="address" />
                  <span className={out.isChangeAddress ? 'text-rose-300 font-bold' : 'text-emerald-400 font-bold'}>
                    {formatBtc(out.amountBtc, 4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  {out.isChangeAddress ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      PEEL CHANGE HEURISTIC
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold">TARGET CASHOUT</span>
                  )}
                  <span className="text-slate-400">{out.scriptType}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
