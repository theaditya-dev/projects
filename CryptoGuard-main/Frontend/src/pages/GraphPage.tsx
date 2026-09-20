import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Network, 
  SlidersHorizontal, 
  Radio, 
  Flame, 
  ShieldAlert, 
  ArrowRight,
  Info,
  Layers,
  Coins
} from 'lucide-react';
import { graphService } from '../api/services/graphService';
import { GraphData, GraphNode } from '../types/forensics';
import { ForensicGraphCanvas } from '../components/graph/ForensicGraphCanvas';
import { GlassCard } from '../components/common/GlassCard';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassButton } from '../components/common/GlassButton';
import { GlassDrawer } from '../components/common/GlassDrawer';
import { MonospaceHash } from '../components/common/MonospaceHash';
import { RiskGauge } from '../components/common/RiskGauge';

export const GraphPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const seedId = searchParams.get('seed') || 'bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9';

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Toggles
  const [highlightPath, setHighlightPath] = useState(false);
  const [showNetworkLayer, setShowNetworkLayer] = useState(true);
  const [minRisk, setMinRisk] = useState(0);

  useEffect(() => {
    async function loadGraph() {
      try {
        setIsLoading(true);
        const data = await graphService.getGraphData({
          seedId,
          includeNetworkLayer: showNetworkLayer,
          minRiskScore: minRisk,
        });
        setGraphData(data);
      } catch (err) {
        console.error('Failed to load graph data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGraph();
  }, [seedId, showNetworkLayer, minRisk]);

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Header & Graph Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/5 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-display tracking-wide text-white flex items-center gap-3">
            <span>INTERACTIVE LINK-ANALYSIS GRAPH</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              IP ↔ TXID ↔ WALLET ↔ CLUSTER
            </span>
          </h1>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Suspicious Flow Highlighter */}
          <button
            type="button"
            onClick={() => setHighlightPath(!highlightPath)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              highlightPath
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-rose font-bold'
                : 'bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{highlightPath ? 'Tracing Peel Path (Active)' : 'Trace Illicit Peel Flow'}</span>
          </button>

          {/* Toggle Network Layer */}
          <button
            type="button"
            onClick={() => setShowNetworkLayer(!showNetworkLayer)}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              showNetworkLayer
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-500 border border-white/10'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Network Layer (IPs)</span>
          </button>

          {/* Min Risk Slider */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-300">Min Risk: {minRisk}</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minRisk}
              onChange={(e) => setMinRisk(Number(e.target.value))}
              className="w-20 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main Graph Viewport & Canvas */}
      <div className="flex-1 min-h-0 relative">
        <ForensicGraphCanvas
          data={graphData}
          selectedNodeId={selectedNode?.id || null}
          onSelectNode={setSelectedNode}
          highlightPath={highlightPath}
          filterMinRisk={minRisk}
          showNetworkLayer={showNetworkLayer}
        />

        {/* Legend Overlay Floating in Bottom Left */}
        <div className="absolute bottom-4 left-4 z-10 glass-panel p-3.5 rounded-xl border border-white/10 text-xs font-mono space-y-2 pointer-events-auto shadow-2xl">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-display flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            Graph Entity Legend
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rotate-45 border border-cyan-400 bg-cyan-950 inline-block" />
              <span>IP Relay Node</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rotate-45 border border-purple-400 bg-purple-950 inline-block" />
              <span>Bitcoin TXID</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border border-rose-400 bg-slate-900 inline-block" />
              <span>Wallet Address</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded border border-dashed border-purple-400 bg-purple-950/40 inline-block" />
              <span>Co-Spend Cluster</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Node Inspection Drawer */}
      <GlassDrawer
        isOpen={Boolean(selectedNode)}
        onClose={() => setSelectedNode(null)}
        title={
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>NODE INSPECTOR // {selectedNode?.type}</span>
          </div>
        }
        width="md"
      >
        {selectedNode && (
          <div className="space-y-5 text-xs font-mono">
            {/* Visual Risk Gauge for Selected Node */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-white/10 flex items-center justify-center">
              <RiskGauge
                score={selectedNode.riskScore}
                severity={selectedNode.severity}
                confidence={0.91}
                anomalyScore={-0.68}
                size="md"
              />
            </div>

            {/* Node Identification Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/10 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                Target Entity Label:
              </span>
              <div className="font-bold text-white text-sm break-all">
                {selectedNode.label}
              </div>
            </div>

            {/* Metadata breakdown based on node type */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-semibold uppercase text-slate-300 font-display">
                Entity Forensic Metadata
              </h4>

              {selectedNode.type === 'IP' && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="text-cyan-300">{selectedNode.metadata.ip}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ASN Number:</span>
                    <span className="text-slate-200">AS{selectedNode.metadata.asn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Country:</span>
                    <span className="text-slate-200">{selectedNode.metadata.country} (Provisional)</span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'TRANSACTION' && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bitcoin TXID:</span>
                    <MonospaceHash hash={selectedNode.metadata.txid || ''} type="txid" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-amber-400 font-bold">
                      {selectedNode.metadata.amountBtc} BTC
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fee Rate:</span>
                    <span className="text-rose-400">
                      {selectedNode.metadata.feeRateSatVb} sat/vB
                    </span>
                  </div>
                </div>
              )}

              {selectedNode.type === 'WALLET' && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <MonospaceHash hash={selectedNode.metadata.address || ''} type="address" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Classification:</span>
                    <span className="text-cyan-300">{selectedNode.metadata.classification}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Action Navigation */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <Link
                to={
                  selectedNode.type === 'TRANSACTION'
                    ? `/investigate/tx/${selectedNode.metadata.txid}`
                    : `/investigate/wallet/${selectedNode.metadata.address || selectedNode.metadata.ip}`
                }
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold shadow-glow-cyan transition-all"
              >
                <span>OPEN FULL DEEP DOSSIER</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </GlassDrawer>
    </div>
  );
};
