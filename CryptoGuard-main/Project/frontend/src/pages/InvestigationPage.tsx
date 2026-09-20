import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Layers, 
  Network, 
  Radio, 
  FileText, 
  ArrowLeft,
  Cpu, 
  Globe, 
  Coins, 
  ArrowRight,
  Zap,
  Info
} from 'lucide-react';
import { transactionService } from '../api/services/transactionService';
import { entityService } from '../api/services/entityService';
import { Transaction, WalletEntity, NetworkEvidence, Cluster } from '../types/forensics';
import { GlassCard } from '../components/common/GlassCard';
import { GlassBadge } from '../components/common/GlassBadge';
import { GlassButton } from '../components/common/GlassButton';
import { MonospaceHash } from '../components/common/MonospaceHash';
import { RiskGauge } from '../components/common/RiskGauge';
import { TwoLayerVisualizer } from '../components/common/TwoLayerVisualizer';
import { UtxoFlowVisualizer } from '../components/investigation/UtxoFlowVisualizer';
import { formatBtc } from '../utils/formatters';
import { SEVERITY_CONFIG, formatAnomalyScore } from '../utils/riskCalculators';

export const InvestigationPage: React.FC = () => {
  const { type = 'wallet', id = '' } = useParams<{ type: string; id: string }>();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [wallet, setWallet] = useState<WalletEntity | null>(null);
  const [networkEvidence, setNetworkEvidence] = useState<NetworkEvidence | null>(null);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TWO_LAYER' | 'UTXO' | 'CLUSTER'>('OVERVIEW');

  useEffect(() => {
    async function loadEntityData() {
      if (!id) return;
      try {
        setIsLoading(true);
        if (type === 'tx') {
          const tx = await transactionService.getTransactionByTxid(id);
          setTransaction(tx);
          if (tx?.associatedIp) {
            const net = await transactionService.getNetworkEvidence(tx.associatedIp);
            setNetworkEvidence(net);
          }
        } else if (type === 'wallet') {
          const w = await entityService.getEntityByAddress(id);
          setWallet(w);
          if (w?.clusterId) {
            const cl = await entityService.getClusterById(w.clusterId);
            setCluster(cl);
          }
          if (w?.associatedIps?.[0]) {
            const net = await transactionService.getNetworkEvidence(w.associatedIps[0]);
            setNetworkEvidence(net);
          }
        } else if (type === 'ip') {
          const net = await transactionService.getNetworkEvidence(id);
          setNetworkEvidence(net);
        }
      } catch (err) {
        console.error('Failed to load investigation entity:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEntityData();
  }, [type, id]);

  const targetRisk = transaction?.riskScore || wallet?.riskScore || 94.8;
  const targetSeverity = transaction?.severity || 'CRITICAL';
  const targetAnomaly = transaction?.anomalyScore || -0.8412;

  return (
    <div className="space-y-6">
      {/* Back link & Navigation Breadcrumbs */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5 font-mono text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Link to="/alerts" className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Alerts
          </Link>
          <span>/</span>
          <span className="text-slate-200 uppercase">{type} Forensic Dossier</span>
          <span>/</span>
          <span className="text-cyan-300">{id.slice(0, 12)}...</span>
        </div>

        <div className="flex items-center gap-3">
          <Link to={`/graph?seed=${encodeURIComponent(id)}`}>
            <GlassButton variant="primary" size="sm" leftIcon={<Network className="w-3.5 h-3.5" />}>
              Visual Graph
            </GlassButton>
          </Link>
          <Link to={`/reports?target=${encodeURIComponent(id)}&type=${type}`}>
            <GlassButton variant="secondary" size="sm" leftIcon={<FileText className="w-3.5 h-3.5" />}>
              Generate Report
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* Main Entity Banner Card with Integrated Risk Gauge */}
      <GlassCard variant="elevated" glow="cyan" tint="cyan" className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/10 font-mono text-xs text-cyan-300 font-bold uppercase">
                {type} TARGET
              </span>
              <GlassBadge severity={targetSeverity} variant="severity" size="sm">
                {targetSeverity} SEVERITY
              </GlassBadge>
              {wallet?.classification && (
                <GlassBadge variant="cyan" size="sm">
                  CLASSIFICATION: {wallet.classification}
                </GlassBadge>
              )}
            </div>

            <h2 className="text-lg md:text-xl font-bold font-mono text-white tracking-tight break-all">
              {id}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
              {transaction && (
                <>
                  <span>Block Height: #{transaction.blockHeight}</span>
                  <span>•</span>
                  <span>Amount: {formatBtc(transaction.amountBtc)}</span>
                  <span>•</span>
                  <span>Fee Rate: {transaction.feeRateSatVb} sat/vB</span>
                </>
              )}
              {wallet && (
                <>
                  <span>Balance: {formatBtc(wallet.balanceBtc)}</span>
                  <span>•</span>
                  <span>Total TXs: {wallet.transactionCount}</span>
                  <span>•</span>
                  <span>Cluster: {wallet.clusterId || 'None'}</span>
                </>
              )}
            </div>
          </div>

          {/* Large Circular Risk Gauge */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 shrink-0">
            <RiskGauge
              score={targetRisk}
              severity={targetSeverity}
              confidence={0.92}
              anomalyScore={targetAnomaly}
              size="lg"
            />
          </div>
        </div>
      </GlassCard>

      {/* Investigation Tab Controls */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Forensic Overview' },
          { id: 'TWO_LAYER', label: 'Two-Layer Correlation' },
          { id: 'UTXO', label: 'UTXO Flow Structure' },
          { id: 'CLUSTER', label: 'Common-Input Clusters' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & "Why Flagged" Visual Evidence */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Two-Layer Intelligence Summary Card */}
          <TwoLayerVisualizer
            networkData={networkEvidence}
            blockchainData={transaction}
            walletData={wallet}
          />

          {/* WHY FLAGGED: Visual Anomaly Evidence Cards */}
          <GlassCard
            header={
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>WHY FLAGGED // ANOMALY FEATURE ATTRIBUTIONS</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  ISOLATION FOREST DECISION BOUNDARY
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/30 space-y-2">
                <div className="flex justify-between items-center text-rose-300 font-bold">
                  <span>1. Peeling-Chain Velocity</span>
                  <span>+0.44 wt</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '88%' }} />
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Automated fund peeling sequence: 18.54 BTC received and split immediately into an 18.0 BTC unspent change address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2">
                <div className="flex justify-between items-center text-amber-300 font-bold">
                  <span>2. Priority Fee Rate Spike</span>
                  <span>+0.31 wt</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: '62%' }} />
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Miner fee rate of 184 sat/vB represents a +3.8σ deviation from median mempool block confirmation fee.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/30 space-y-2">
                <div className="flex justify-between items-center text-cyan-300 font-bold">
                  <span>3. Rapid P2P Propagation</span>
                  <span>+0.19 wt</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: '38%' }} />
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Propagation latency measured at 120ms from monitor ingress to multiple regional Bitcoin peers.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tab 2: Two-Layer Deep Dive */}
      {activeTab === 'TWO_LAYER' && (
        <TwoLayerVisualizer
          networkData={networkEvidence}
          blockchainData={transaction}
          walletData={wallet}
        />
      )}

      {/* Tab 3: UTXO Flow Structure */}
      {activeTab === 'UTXO' && (
        <UtxoFlowVisualizer
          txid={transaction?.txid || id}
          inputs={transaction?.inputs || [
            {
              address: 'bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9',
              amountBtc: 18.54235,
              scriptType: 'P2WPKH',
              clusterId: 'CLUSTER-IO-891',
            },
          ]}
          outputs={transaction?.outputs || [
            {
              address: 'bc1qpeel01intermediate99x88w77v66u55t44s33r',
              amountBtc: 18.0,
              scriptType: 'P2WPKH',
              isChangeAddress: true,
            },
            {
              address: 'bc1qcashouttarget44x33w22v11u00t99s88r77',
              amountBtc: 0.542,
              scriptType: 'P2WPKH',
              isChangeAddress: false,
            },
          ]}
        />
      )}

      {/* Tab 4: Common-Input Cluster Members */}
      {activeTab === 'CLUSTER' && (
        <GlassCard header="Common-Input-Ownership Cluster Groupings">
          <div className="space-y-4 font-mono text-xs">
            <div className="p-4 rounded-lg bg-purple-950/30 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-300 text-sm">
                  {cluster?.clusterId || 'CLUSTER-IO-891'}
                </span>
                <GlassBadge variant="purple" size="xs">
                  {cluster?.heuristicType || 'COMMON_INPUT_OWNERSHIP'}
                </GlassBadge>
              </div>
              <p className="text-slate-300 font-sans text-xs">
                Under the Common-Input-Ownership Heuristic, all Bitcoin addresses that have ever co-spent inputs in the same transaction are inferred to belong to the same controlling entity.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-slate-300 font-bold">Known Member Addresses in Cluster:</h4>
              <div className="divide-y divide-white/5 rounded-lg bg-slate-900 border border-white/10">
                {(cluster?.memberAddresses || [
                  'bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9',
                  'bc1qpeel01intermediate99x88w77v66u55t44s33r',
                  'bc1qx99node22consolidation33w44e55r66t77y88',
                ]).map((addr, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <MonospaceHash hash={addr} type="address" />
                    <Link
                      to={`/investigate/wallet/${addr}`}
                      className="text-xs text-cyan-400 hover:underline"
                    >
                      INSPECT →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
