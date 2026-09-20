import React from 'react';
import { Radio, Coins, ArrowRight, Zap, Globe, Layers } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassBadge } from './GlassBadge';
import { NetworkEvidence, Transaction, WalletEntity } from '../../types/forensics';
import { formatBtc } from '../../utils/formatters';

export interface TwoLayerVisualizerProps {
  networkData?: NetworkEvidence | null;
  blockchainData?: Transaction | null;
  walletData?: WalletEntity | null;
}

export const TwoLayerVisualizer: React.FC<TwoLayerVisualizerProps> = ({
  networkData,
  blockchainData,
  walletData,
}) => {
  return (
    <GlassCard
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Two-Layer Correlation Intelligence</span>
          </div>
          <GlassBadge variant="cyan" size="xs">
            CORE PIPELINE LINK
          </GlassBadge>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* Layer 1: Network Telemetry Block (4 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl glass-panel-subtle border border-cyan-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-cyan-300 font-bold font-display">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>LAYER 1 // NETWORK TELEMETRY</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300">
              P2P PROPAGATION
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Relay Peer IP:</span>
              <span className="text-cyan-300 font-bold">{networkData?.sourceIp || '185.220.101.5'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Bitcoin P2P Port:</span>
              <span className="text-slate-200">{networkData?.peerPort || 8333}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Network Location:</span>
              <span className="text-slate-300 text-[11px]">
                {networkData?.geoIp?.city ? `${networkData.geoIp.city}, ${networkData.geoIp.country}` : 'Monitored Honeypot Relay'}
              </span>
            </div>
          </div>
        </div>

        {/* Central Correlation Connector (1 col) */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-2 lg:py-0">
          <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-glow-cyan">
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-[10px] font-mono text-cyan-400 mt-1.5 font-bold">
            {networkData?.timeDeltaMs ? `Δ ${networkData.timeDeltaMs}ms` : 'LINKED'}
          </div>
        </div>

        {/* Layer 2: Blockchain Ledger Block (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl glass-panel-subtle border border-amber-500/30 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2 text-amber-300 font-bold font-display">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>LAYER 2 // BLOCKCHAIN LEDGER</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
              ON-CHAIN UTXO
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction Value:</span>
              <span className="text-amber-300 font-bold">
                {blockchainData ? formatBtc(blockchainData.amountBtc) : '18.5420 BTC'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Miner Fee Rate:</span>
              <span className="text-rose-400 font-bold">
                {blockchainData?.feeRateSatVb || 184} sat/vB (+3.8σ Anomaly)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Script Standard:</span>
              <span className="text-slate-300">Native SegWit (P2WPKH)</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
