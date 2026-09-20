/**
 * Forensics Domain Data Models
 * CryptoGuard: Bitcoin Transaction Traffic Monitoring & Two-Layer Correlation
 * 
 * Strict Source-of-Truth Compliance:
 * All fields strictly reflect Team 1 pipeline specifications.
 * Any field awaiting Team 2 backend confirmation is explicitly tagged as PROVISIONAL.
 */

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EntityClassification = 
  | 'CO_SPEND_CLUSTER' 
  | 'EXCHANGE' 
  | 'MIXER' 
  | 'MERCHANT' 
  | 'MINER' 
  | 'UNCLASSIFIED';

export type BitcoinScriptType = 'P2PKH' | 'P2SH' | 'P2WPKH' | 'P2WSH' | 'P2TR' | 'NON_STANDARD';

/**
 * Feature-level attribution explanation from Isolation Forest decision boundaries
 */
export interface AnomalyExplanationFeature {
  featureKey: string;           // e.g. "fee_rate_anomaly", "input_count_spike"
  label: string;                // e.g. "Miner Fee Deviation"
  contributionScore: number;    // Normalized score (0.0 to 1.0)
  observedValue: string | number;
  explanation: string;          // Plain-language reason based on anomaly detection
  isProvisional?: boolean;      // PROVISIONAL / API-DEPENDENT
}

/**
 * Ranked Alert Record
 */
export interface Alert {
  alertId: string;
  txid: string;
  primaryAddress: string;
  clusterId?: string;
  timestamp: string;            // ISO 8601 UTC
  riskScore: number;            // 0.0 - 100.0 (Composite anomaly & heuristic score)
  severity: SeverityLevel;
  confidence: number;           // 0.0 - 1.0 (Model confidence)
  anomalyScore: number;         // Isolation Forest decision function score
  heuristicTags: string[];      // e.g. ["Common-Input-Heuristic", "High-Fee-Spike", "Multi-Hop-Flow"]
  summaryExplanation: string;   // Plain language anomaly explanation
  featureContributions: AnomalyExplanationFeature[];
  status: 'NEW' | 'UNDER_INVESTIGATION' | 'VERIFIED' | 'DISMISSED';
  isMockData?: boolean;
}

/**
 * Bitcoin UTXO Input/Output
 */
export interface UtxoItem {
  address: string;
  amountBtc: number;
  amountUsd?: number;           // PROVISIONAL / MOCK ONLY
  scriptType: BitcoinScriptType;
  clusterId?: string;
  isChangeAddress?: boolean;    // Inferred change heuristic
}

/**
 * Bitcoin Transaction Record
 */
export interface Transaction {
  txid: string;
  blockHeight: number;
  blockTime: string;
  amountBtc: number;
  amountUsd?: number;           // PROVISIONAL / MOCK ONLY
  feeSatoshis: number;
  feeRateSatVb: number;
  inputs: UtxoItem[];
  outputs: UtxoItem[];
  isCoinbase: boolean;
  lockTime: number;
  sizeBytes: number;
  vsize: number;
  associatedIp?: string;        // Correlated Network Layer IP
  riskScore: number;
  anomalyScore: number;
  severity: SeverityLevel;
}

/**
 * Wallet Address / Entity Profile
 */
export interface WalletEntity {
  address: string;
  clusterId?: string;
  classification: EntityClassification;
  balanceBtc: number;
  totalReceivedBtc: number;
  totalSentBtc: number;
  transactionCount: number;
  firstSeen: string;
  lastSeen: string;
  riskScore: number;
  associatedIps: string[];
  coSpendAddresses: string[];   // Addresses linked via Common-Input-Ownership Heuristic
  tags: string[];
}

/**
 * Wallet Cluster (Common-Input-Ownership Heuristic)
 */
export interface Cluster {
  clusterId: string;
  heuristicType: 'COMMON_INPUT_OWNERSHIP' | 'BEHAVIORAL_CLUSTERING'; // BEHAVIORAL is PROVISIONAL
  memberAddresses: string[];
  totalVolumeBtc: number;
  avgRiskScore: number;
  primaryClassification: EntityClassification;
  identifiedIps: string[];
  creationDate: string;
}

/**
 * Network Layer Telemetry & Correlation
 */
export interface NetworkEvidence {
  evidenceId: string;
  txid: string;
  sourceIp: string;
  destIp?: string;
  peerPort: number;
  connectionTimestamp: string;
  timeDeltaMs: number;          // Delta between P2P broadcast and block confirmation
  geoIp?: {                     // PROVISIONAL / MOCK ONLY (Requires offline GeoIP DB)
    country: string;
    countryCode: string;
    city: string;
    asn: number;
    asOrganization: string;
    isVpnOrTor?: boolean;       // PROVISIONAL
  };
  correlationConfidence: number; // 0.0 - 1.0
  notes: string;
  isProvisionalNetworkData?: boolean;
}

/**
 * Graph link analysis nodes
 */
export type GraphNodeType = 'IP' | 'WALLET' | 'TRANSACTION' | 'CLUSTER';

export interface GraphNode {
  id: string;
  label: string;
  type: GraphNodeType;
  riskScore: number;
  severity: SeverityLevel;
  metadata: {
    address?: string;
    txid?: string;
    ip?: string;
    amountBtc?: number;
    clusterId?: string;
    classification?: EntityClassification;
    [key: string]: any;
  };
}

/**
 * Graph link analysis edges
 */
export type GraphEdgeLabel = 'SPENT_IN' | 'PAID_TO' | 'RELAYED_BY' | 'MEMBER_OF';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: GraphEdgeLabel;
  amountBtc?: number;
  timeDeltaMs?: number;
  isSuspicious: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Executive Dashboard Aggregate Metrics
 */
export interface DashboardStatistics {
  totalTransactionsAnalyzed: number;
  totalVolumeBtc: number;
  totalVolumeUsd?: number;      // PROVISIONAL / MOCK ONLY
  anomalyCount: number;
  criticalAlertCount: number;
  highRiskClusterCount: number;
  averageRiskScore: number;
  pipelineHealth: 'HEALTHY' | 'PROCESSING' | 'DEGRADED' | 'OFFLINE';
  lastProcessedBatch: string;
  riskDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * Ingestion Pipeline Stage & Job Status
 */
export type PipelineStage = 
  | 'PENDING'
  | 'INGEST_PARSE'
  | 'BUILD_ENTITY_GRAPH'
  | 'DETECT_ANOMALIES'
  | 'EXPLAIN_FLAGS'
  | 'COMPLETED'
  | 'FAILED';

export interface IngestJobStatus {
  jobId: string;
  fileName: string;
  fileSizeBytes: number;
  status: PipelineStage;
  progressPercentage: number;
  currentStageDescription: string;
  recordsProcessed: number;
  totalRecords: number;
  elapsedTimeMs: number;
  errors?: string[];
}

/**
 * Formal Forensic Investigation Dossier
 */
export interface InvestigationReport {
  reportId: string;
  caseTitle: string;
  investigatorBadge: string;
  generatedAt: string;
  targetEntityId: string;
  targetType: 'WALLET' | 'TRANSACTION' | 'CLUSTER' | 'IP';
  riskScore: number;
  severity: SeverityLevel;
  executiveSummary: string;
  anomalyFindings: string[];
  twoLayerEvidence: {
    txDetails?: Transaction;
    walletDetails?: WalletEntity;
    networkEvidence?: NetworkEvidence;
    clusterInfo?: Cluster;
  };
  investigatorNotes: string;
  reportVerificationHash: string; // SHA-256 hash of report data
  isMockReport?: boolean;
}
