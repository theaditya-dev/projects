import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Printer, 
  ShieldCheck, 
  Coins, 
  Radio, 
  Layers, 
  Cpu,
  FileCheck
} from 'lucide-react';
import { reportService } from '../api/services/reportService';
import { InvestigationReport } from '../types/forensics';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { RiskGauge } from '../components/common/RiskGauge';
import { formatTimestamp } from '../utils/formatters';

export const ReportsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const target = searchParams.get('target') || 'bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9';
  const targetType = (searchParams.get('type') as any) || 'WALLET';

  const [report, setReport] = useState<InvestigationReport | null>(null);
  const [investigatorNotes, setInvestigatorNotes] = useState(
    'Target entity shows multi-hop peeling transactions with rapid propagation latency. Co-spend cluster verified via Common-Input-Ownership heuristics. Recommended for judicial subpoena.'
  );
  const [caseTitle, setCaseTitle] = useState('Case #2026-BTC-0941 — Illicit Fund Routing Investigation');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      try {
        setIsLoading(true);
        const rep = await reportService.generateInvestigationReport({
          targetEntityId: target,
          targetType,
          caseTitle,
          investigatorNotes,
        });
        setReport(rep);
      } catch (err) {
        console.error('Failed to generate report:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [target, targetType]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Bar (Hidden when printed) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold font-display tracking-wide text-white flex items-center gap-3">
            <span>OFFICIAL FORENSIC INVESTIGATION REPORT</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              DOSSIER EXPORT
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Standardized investigative dossier compiling Two-Layer correlation telemetry and Isolation Forest anomaly attribution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            variant="primary"
            size="md"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print / Export PDF
          </GlassButton>
        </div>
      </div>

      {/* Investigator Notes Editor (No Print) */}
      <GlassCard className="no-print space-y-3">
        <label className="text-xs font-bold text-slate-300 font-display uppercase tracking-wider block">
          Analyst Case Annotations
        </label>
        <textarea
          rows={3}
          value={investigatorNotes}
          onChange={(e) => setInvestigatorNotes(e.target.value)}
          className="glass-input w-full p-3 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-500"
          placeholder="Enter official forensic observations..."
        />
      </GlassCard>

      {/* The Printable Dossier Document */}
      <div className="glass-panel p-8 rounded-2xl border border-white/15 shadow-2xl space-y-6 text-slate-200 font-mono text-xs print:text-black print:bg-white print:p-0 print:border-none print:shadow-none">
        {/* Official Header */}
        <div className="border-b border-white/15 pb-4 flex items-start justify-between">
          <div className="space-y-1">
            <div className="text-sm font-bold tracking-wider font-display text-white print:text-black">
              CRYPTOGUARD BITCOIN TRANSACTION FORENSIC INTELLIGENCE
            </div>
            <div className="text-[11px] text-cyan-400 font-mono print:text-blue-700">
              OFFLINE INVESTIGATIVE AI SYSTEM // TWO-LAYER CORRELATION ENGINE
            </div>
            <div className="text-[10px] text-slate-400 print:text-slate-600">
              Investigative Report ID: {report?.reportId || 'REP-894120'}
            </div>
          </div>

          <div className="text-right space-y-1">
            <span className="inline-block px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold uppercase print:text-red-700 print:border-red-500">
              INVESTIGATIVE DOSSIER
            </span>
            <div className="text-[10px] text-slate-400 print:text-slate-600">
              Generated: {formatTimestamp(report?.generatedAt)}
            </div>
          </div>
        </div>

        {/* Case Title & Target Summary */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 print:bg-slate-50 print:border-slate-300">
          <div className="space-y-1">
            <div className="text-sm font-bold text-white print:text-black">{caseTitle}</div>
            <div className="text-xs">
              <span className="text-slate-400 print:text-slate-600">Target Entity:</span>{' '}
              <span className="text-cyan-300 font-bold print:text-black break-all">{target}</span>
            </div>
            <div className="text-xs">
              <span className="text-slate-400 print:text-slate-600">Investigator:</span>{' '}
              <span className="text-slate-200 print:text-black">
                {report?.investigatorBadge || 'ANALYST-402'}
              </span>
            </div>
          </div>

          {/* Mini Visual Risk Ring */}
          <div className="shrink-0 flex items-center justify-center p-2">
            <RiskGauge
              score={report?.riskScore || 94.8}
              severity={report?.severity || 'CRITICAL'}
              confidence={0.92}
              anomalyScore={-0.8412}
              size="sm"
              showDetails={false}
            />
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 print:text-black">
            1. Executive Forensic Summary
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed print:text-black">
            {report?.executiveSummary}
          </p>
        </div>

        {/* Two-Layer Correlated Evidence Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 print:text-black">
            2. Two-Layer Evidentiary Findings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40 space-y-2 print:border-slate-300 print:bg-slate-50">
              <div className="font-bold text-cyan-400 print:text-blue-700 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5" />
                Network Layer Telemetry
              </div>
              <div className="space-y-1 text-[11px] text-slate-300 print:text-black">
                <div>Source IP: 185.220.101.5</div>
                <div>Peer Port: 8333 (Bitcoin P2P)</div>
                <div>Mempool Relay Delta: 120ms</div>
                <div>Network Origin: Monitored Relay Node</div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-white/10 bg-slate-900/40 space-y-2 print:border-slate-300 print:bg-slate-50">
              <div className="font-bold text-amber-400 print:text-amber-700 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                Blockchain Ledger Record
              </div>
              <div className="space-y-1 text-[11px] text-slate-300 print:text-black">
                <div>Total Volume: 18.542000 BTC</div>
                <div>Fee Rate: 184 sat/vB (+3.8σ Anomaly)</div>
                <div>Heuristic Cluster: CLUSTER-IO-891</div>
                <div>Script Format: Native SegWit (P2WPKH)</div>
              </div>
            </div>
          </div>
        </div>

        {/* AI & Statistical Model Findings */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 print:text-black">
            3. AI &amp; Statistical Model Attributions
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-[11px] text-slate-300 print:text-black font-sans">
            {report?.anomalyFindings.map((finding, idx) => (
              <li key={idx}>{finding}</li>
            ))}
          </ul>
        </div>

        {/* Analyst Remarks */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-300 print:text-black">
            4. Analyst Observations
          </h3>
          <div className="p-3 rounded-lg border border-white/10 bg-slate-900/20 font-sans text-xs text-slate-300 print:border-slate-300 print:text-black">
            {investigatorNotes}
          </div>
        </div>

        {/* Report Integrity / Export Status */}
        <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400 print:text-slate-600">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-cyan-400 print:text-blue-700 font-semibold">
              <FileCheck className="w-3.5 h-3.5" />
              Report Integrity / Export Status Verified
            </div>
            <div className="font-mono">Hash: {report?.reportVerificationHash || 'sha256_9f8b1c4e2a7d6e5f3b8c9a1d'}</div>
          </div>

          <div className="text-right">
            <div>CryptoGuard Console // Synthetic Demo Mode</div>
          </div>
        </div>
      </div>
    </div>
  );
};
