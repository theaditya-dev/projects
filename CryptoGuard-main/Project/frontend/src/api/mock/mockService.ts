/**
 * Mock Service Implementation with realistic async latency and in-memory query filters
 */

import {
  Alert,
  Transaction,
  WalletEntity,
  Cluster,
  NetworkEvidence,
  GraphData,
  DashboardStatistics,
  IngestJobStatus,
  InvestigationReport,
  PipelineStage,
} from '../../types/forensics';
import {
  PaginatedResponse,
  AlertQueryParams,
  GraphQueryParams,
  ReportGenerationRequest,
} from '../../types/api';
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ALERTS,
  MOCK_TRANSACTIONS,
  MOCK_WALLET_ENTITIES,
  MOCK_CLUSTERS,
  MOCK_NETWORK_EVIDENCE,
  MOCK_GRAPH_DATA,
} from './fixtures';

const SIMULATED_LATENCY_MS = 200;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// In-memory state for mock ingestion jobs
const activeJobs: Record<string, IngestJobStatus> = {};

export const mockService = {
  async getDashboardStats(): Promise<DashboardStatistics> {
    await sleep(SIMULATED_LATENCY_MS);
    return { ...MOCK_DASHBOARD_STATS };
  },

  async getAlerts(params: AlertQueryParams = {}): Promise<PaginatedResponse<Alert>> {
    await sleep(SIMULATED_LATENCY_MS);
    let items = [...MOCK_ALERTS];

    // Filter by severity
    if (params.severity) {
      items = items.filter((a) => a.severity === params.severity);
    }

    // Filter by minimum risk score
    if (params.minRiskScore !== undefined) {
      items = items.filter((a) => a.riskScore >= (params.minRiskScore || 0));
    }

    // Filter by status
    if (params.status) {
      items = items.filter((a) => a.status === params.status);
    }

    // Search query across alertId, txid, primaryAddress, or tags
    if (params.searchQuery && params.searchQuery.trim() !== '') {
      const q = params.searchQuery.toLowerCase().trim();
      items = items.filter(
        (a) =>
          a.alertId.toLowerCase().includes(q) ||
          a.txid.toLowerCase().includes(q) ||
          a.primaryAddress.toLowerCase().includes(q) ||
          a.heuristicTags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort
    const sortBy = params.sortBy || 'riskScore';
    const sortOrder = params.sortOrder || 'desc';
    items.sort((a, b) => {
      let valA = a[sortBy as keyof Alert] as any;
      let valB = b[sortBy as keyof Alert] as any;
      if (sortBy === 'timestamp') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginatedItems = items.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      total: items.length,
      page,
      limit,
      totalPages: Math.ceil(items.length / limit) || 1,
    };
  },

  async getAlertById(alertId: string): Promise<Alert | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const found = MOCK_ALERTS.find((a) => a.alertId === alertId);
    return found ? { ...found } : null;
  },

  async getTransactionDetails(txid: string): Promise<Transaction | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const tx = MOCK_TRANSACTIONS[txid];
    if (tx) return { ...tx };
    // Create a fallback mock transaction if an arbitrary valid hash is entered
    return {
      txid,
      blockHeight: 894100,
      blockTime: new Date().toISOString(),
      amountBtc: 2.5,
      amountUsd: 162500,
      feeSatoshis: 12000,
      feeRateSatVb: 45,
      inputs: [
        {
          address: 'bc1qgenericinputaddress0001',
          amountBtc: 2.50012,
          scriptType: 'P2WPKH',
        },
      ],
      outputs: [
        {
          address: 'bc1qgenericoutputaddress0002',
          amountBtc: 2.499,
          scriptType: 'P2WPKH',
        },
      ],
      isCoinbase: false,
      lockTime: 0,
      sizeBytes: 220,
      vsize: 140,
      riskScore: 45.0,
      anomalyScore: -0.15,
      severity: 'MEDIUM',
    };
  },

  async getEntityDetails(address: string): Promise<WalletEntity | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const entity = MOCK_WALLET_ENTITIES[address];
    if (entity) return { ...entity };
    // Generic fallback for any address lookup
    return {
      address,
      classification: 'UNCLASSIFIED',
      balanceBtc: 0.125,
      totalReceivedBtc: 1.45,
      totalSentBtc: 1.325,
      transactionCount: 3,
      firstSeen: '2026-03-01T00:00:00Z',
      lastSeen: new Date().toISOString(),
      riskScore: 25.0,
      associatedIps: [],
      coSpendAddresses: [address],
      tags: ['Unclassified-Address'],
    };
  },

  async getClusterDetails(clusterId: string): Promise<Cluster | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const cluster = MOCK_CLUSTERS[clusterId];
    return cluster ? { ...cluster } : null;
  },

  async getNetworkEvidence(txidOrIp: string): Promise<NetworkEvidence | null> {
    await sleep(SIMULATED_LATENCY_MS);
    const evidence = MOCK_NETWORK_EVIDENCE[txidOrIp];
    if (evidence) return { ...evidence };

    // Search by txid
    const foundByTx = Object.values(MOCK_NETWORK_EVIDENCE).find(
      (e) => e.txid.toLowerCase() === txidOrIp.toLowerCase()
    );
    if (foundByTx) return { ...foundByTx };

    return null;
  },

  async getGraphData(params: GraphQueryParams): Promise<GraphData> {
    await sleep(SIMULATED_LATENCY_MS);
    let nodes = [...MOCK_GRAPH_DATA.nodes];
    let edges = [...MOCK_GRAPH_DATA.edges];

    if (params.minRiskScore) {
      nodes = nodes.filter((n) => n.riskScore >= (params.minRiskScore || 0));
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    if (params.includeNetworkLayer === false) {
      nodes = nodes.filter((n) => n.type !== 'IP');
      const nodeIds = new Set(nodes.map((n) => n.id));
      edges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    return { nodes, edges };
  },

  async uploadDataset(file: File): Promise<IngestJobStatus> {
    await sleep(300);
    const jobId = `job_${Date.now()}`;
    const initialStatus: IngestJobStatus = {
      jobId,
      fileName: file.name,
      fileSizeBytes: file.size,
      status: 'INGEST_PARSE',
      progressPercentage: 15,
      currentStageDescription: 'Stage 1/5: Parsing CSV/JSON bulk metadata records...',
      recordsProcessed: 450,
      totalRecords: 2500,
      elapsedTimeMs: 320,
    };
    activeJobs[jobId] = initialStatus;
    return initialStatus;
  },

  async getJobStatus(jobId: string): Promise<IngestJobStatus> {
    await sleep(150);
    const job = activeJobs[jobId];
    if (!job) {
      return {
        jobId,
        fileName: 'sample_telemetry_batch.json',
        fileSizeBytes: 1048576,
        status: 'COMPLETED',
        progressPercentage: 100,
        currentStageDescription: 'Pipeline execution complete. Graph & anomalies updated.',
        recordsProcessed: 2500,
        totalRecords: 2500,
        elapsedTimeMs: 2450,
      };
    }

    const stages: PipelineStage[] = [
      'INGEST_PARSE',
      'BUILD_ENTITY_GRAPH',
      'DETECT_ANOMALIES',
      'EXPLAIN_FLAGS',
      'COMPLETED',
    ];
    const currentIndex = stages.indexOf(job.status);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      job.status = nextStage;
      job.progressPercentage = Math.min(100, (currentIndex + 2) * 20);
      job.elapsedTimeMs += 400;
      job.recordsProcessed = Math.min(job.totalRecords, job.recordsProcessed + 500);

      const stageDesc: Record<PipelineStage, string> = {
        PENDING: 'Initializing ingestion worker...',
        INGEST_PARSE: 'Stage 1/5: Parsing CSV/JSON metadata records...',
        BUILD_ENTITY_GRAPH: 'Stage 2/5: Constructing Common-Input-Ownership graph...',
        DETECT_ANOMALIES: 'Stage 3/5: Running Isolation Forest anomaly inference...',
        EXPLAIN_FLAGS: 'Stage 4/5: Computing feature contributions and scoring...',
        COMPLETED: 'Stage 5/5: Ingestion and correlation complete. Intelligence loaded.',
        FAILED: 'Pipeline error occurred.',
      };
      job.currentStageDescription = stageDesc[nextStage];
    }

    return { ...job };
  },

  async generateReport(req: ReportGenerationRequest): Promise<InvestigationReport> {
    await sleep(400);
    const reportId = `REP-${Date.now().toString().slice(-6)}`;
    const reportVerificationHash = `sha256_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;

    return {
      reportId,
      caseTitle: req.caseTitle || 'Bitcoin Transaction Intelligence Dossier',
      investigatorBadge: 'ANALYST-402',
      generatedAt: new Date().toISOString(),
      targetEntityId: req.targetEntityId,
      targetType: req.targetType,
      riskScore: 94.8,
      severity: 'CRITICAL',
      executiveSummary: `Target ${req.targetType} ${req.targetEntityId} exhibits severe anomalous behavior under Isolation Forest decision analysis, correlated with multi-hop peeling heuristics and rapid broadcast propagation.`,
      anomalyFindings: [
        'Isolation Forest raw anomaly score: -0.8412 (Statistically significant outlier)',
        'Common-Input-Ownership heuristics links address to 3 co-spent entities',
        'Correlation with peer IP 185.220.101.5 broadcast within 120ms of mempool ingestion',
      ],
      twoLayerEvidence: {
        txDetails: MOCK_TRANSACTIONS['9f8b1c4e2a7d6e5f3b8c9a1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f'],
        walletDetails: MOCK_WALLET_ENTITIES['bc1q9v02mdk6wxh5r8c7z2g4f9y3e1a8x7m4q0p2k9'],
        networkEvidence: MOCK_NETWORK_EVIDENCE['185.220.101.5'],
      },
      investigatorNotes: req.investigatorNotes || 'No custom investigator notes provided.',
      reportVerificationHash,
      isMockReport: true,
    };
  },
};
