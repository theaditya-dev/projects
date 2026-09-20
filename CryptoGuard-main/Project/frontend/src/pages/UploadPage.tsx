import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Terminal, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { ingestService } from '../api/services/ingestService';
import { IngestJobStatus, PipelineStage } from '../types/forensics';
import { GlassCard } from '../components/common/GlassCard';
import { GlassButton } from '../components/common/GlassButton';
import { GlassBadge } from '../components/common/GlassBadge';
import { formatFileSize } from '../utils/formatters';

const PIPELINE_STAGES: { key: PipelineStage; label: string; desc: string }[] = [
  { key: 'INGEST_PARSE', label: '1. Ingest & Parse', desc: 'Parse bulk JSON/CSV/XML metadata' },
  { key: 'BUILD_ENTITY_GRAPH', label: '2. Build Entity Graph', desc: 'Link IPs ↔ TXs ↔ Wallets & co-spends' },
  { key: 'DETECT_ANOMALIES', label: '3. Detect Anomalies', desc: 'Execute Isolation Forest inference' },
  { key: 'EXPLAIN_FLAGS', label: '4. Explain Flags', desc: 'Generate feature-level anomaly attributions' },
  { key: 'COMPLETED', label: '5. Ready for Triage', desc: 'Update intelligence queue & graph indices' },
];

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentJob, setCurrentJob] = useState<IngestJobStatus | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([
    'SYSTEM INITIALIZED: Local offline forensic node ready for dataset ingestion.',
    'Awaiting target batch upload (Supported: .json, .csv, .xml).',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toISOString().substring(11, 19);
    setLogMessages((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      addLog(`File loaded: ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      addLog(`File dropped: ${file.name} (${formatFileSize(file.size)})`);
    }
  };

  const handleStartIngest = async () => {
    if (!selectedFile) return;
    try {
      setIsUploading(true);
      addLog(`Starting ingestion for batch: ${selectedFile.name}`);
      const job = await ingestService.uploadDataset(selectedFile);
      setCurrentJob(job);
      addLog(`Job initialized [ID: ${job.jobId}]. Pipeline running...`);
    } catch (err: any) {
      addLog(`ERROR: ${err.message || 'Upload failed'}`);
      setIsUploading(false);
    }
  };

  // Poll job status until complete
  useEffect(() => {
    let timer: any;
    if (currentJob && currentJob.status !== 'COMPLETED' && currentJob.status !== 'FAILED') {
      timer = setInterval(async () => {
        try {
          const updated = await ingestService.getJobStatus(currentJob.jobId);
          setCurrentJob(updated);
          addLog(`${updated.currentStageDescription} (${updated.progressPercentage}%)`);
          if (updated.status === 'COMPLETED') {
            setIsUploading(false);
            addLog(`SUCCESS: Pipeline execution complete. ${updated.recordsProcessed} transactions parsed.`);
          }
        } catch (e) {
          console.error(e);
        }
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [currentJob]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-2 border-b border-white/5">
        <h1 className="text-2xl font-bold font-display tracking-wide text-white flex items-center gap-3">
          <span>OFFLINE DATASET INGESTION &amp; PIPELINE</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            5-STAGE AI PIPELINE
          </span>
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Ingest raw Bitcoin telemetry and execute Common-Input Graph linking + Isolation Forest anomaly detection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dropzone & Actions */}
        <div className="lg:col-span-2 space-y-6">
          <GlassCard>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-cyan-400/60 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-slate-900/40 hover:bg-cyan-950/10 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv,.xml"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto group-hover:scale-110 group-hover:shadow-glow-cyan transition-all">
                <UploadCloud className="w-7 h-7" />
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-slate-200 font-display">
                  {selectedFile ? selectedFile.name : 'Drag & drop Bitcoin telemetry file, or browse'}
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Supported formats: CSV, JSON, XML (Max 500 MB per batch)
                </p>
              </div>

              {selectedFile && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs border border-cyan-500/30">
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Size: {formatFileSize(selectedFile.size)}</span>
                </div>
              )}
            </div>

            {/* Ingestion Button Action */}
            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-xs font-mono text-slate-400">
                {selectedFile ? 'Ready to execute 5-stage pipeline' : 'Select a batch to begin'}
              </div>

              <GlassButton
                variant="cyber"
                size="md"
                disabled={!selectedFile || isUploading}
                isLoading={isUploading}
                onClick={handleStartIngest}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isUploading ? 'Executing Pipeline...' : 'Run Correlation Pipeline'}
              </GlassButton>
            </div>
          </GlassCard>

          {/* 5-Stage Stepper */}
          <GlassCard header="Pipeline Execution Lifecycle">
            <div className="space-y-4 font-mono text-xs">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isDone =
                  currentJob?.status === 'COMPLETED' ||
                  (currentJob &&
                    PIPELINE_STAGES.findIndex((s) => s.key === currentJob.status) > idx);
                const isCurrent = currentJob?.status === stage.key;

                return (
                  <div
                    key={stage.key}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isDone
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                        : isCurrent
                        ? 'bg-cyan-950/30 border-cyan-400/50 text-cyan-300 shadow-glow-cyan'
                        : 'bg-white/[0.02] border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-200">{stage.label}</div>
                        <div className="text-[11px] text-slate-400 font-sans">{stage.desc}</div>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold">
                      {isDone ? 'COMPLETE' : isCurrent ? 'RUNNING' : 'QUEUED'}
                    </span>
                  </div>
                );
              })}

              {currentJob?.status === 'COMPLETED' && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 text-emerald-300 border border-emerald-400/50 font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] transition-transform"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>PIPELINE FINISHED // OPEN DASHBOARD</span>
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Monospace Streaming Log Terminal */}
        <div className="space-y-6">
          <GlassCard
            header={
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Ingest Stream Terminal</span>
              </div>
            }
          >
            <div className="bg-background-darker rounded-lg p-3 border border-white/10 font-mono text-[11px] text-cyan-300/90 h-[420px] overflow-y-auto space-y-1.5 flex flex-col justify-start">
              {logMessages.map((msg, i) => (
                <div key={i} className="leading-tight">
                  <span className="text-slate-500">$ </span>
                  <span>{msg}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
