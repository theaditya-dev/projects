/**
 * API Client & Gateway Service Abstraction
 * Switches seamlessly between Mock API (during parallel frontend build)
 * and Team 2 REST API (during final system integration) via VITE_USE_MOCK.
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
} from '../types/forensics';
import {
  PaginatedResponse,
  AlertQueryParams,
  GraphQueryParams,
  ReportGenerationRequest,
} from '../types/api';
import { mockService } from './mock/mockService';

const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true' || true; // Defaults to true until Team 2 is ready
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

async function fetchFromBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Request Failed: ${response.status} ${response.statusText} on ${endpoint}`);
  }

  const json = await response.json();
  return json.data !== undefined ? json.data : json;
}

export const apiClient = {
  isMockMode(): boolean {
    return IS_MOCK_MODE;
  },

  async getDashboardStats(): Promise<DashboardStatistics> {
    if (IS_MOCK_MODE) {
      return mockService.getDashboardStats();
    }
    return fetchFromBackend<DashboardStatistics>('/dashboard/stats');
  },

  async getAlerts(params: AlertQueryParams = {}): Promise<PaginatedResponse<Alert>> {
    if (IS_MOCK_MODE) {
      return mockService.getAlerts(params);
    }
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.severity) query.append('severity', params.severity);
    if (params.minRiskScore) query.append('min_risk', params.minRiskScore.toString());
    if (params.searchQuery) query.append('q', params.searchQuery);
    if (params.status) query.append('status', params.status);
    if (params.sortBy) query.append('sort_by', params.sortBy);
    if (params.sortOrder) query.append('sort_order', params.sortOrder);

    return fetchFromBackend<PaginatedResponse<Alert>>(`/alerts?${query.toString()}`);
  },

  async getAlertById(alertId: string): Promise<Alert | null> {
    if (IS_MOCK_MODE) {
      return mockService.getAlertById(alertId);
    }
    return fetchFromBackend<Alert>(`/alerts/${encodeURIComponent(alertId)}`);
  },

  async getTransactionDetails(txid: string): Promise<Transaction | null> {
    if (IS_MOCK_MODE) {
      return mockService.getTransactionDetails(txid);
    }
    return fetchFromBackend<Transaction>(`/transactions/${encodeURIComponent(txid)}`);
  },

  async getEntityDetails(address: string): Promise<WalletEntity | null> {
    if (IS_MOCK_MODE) {
      return mockService.getEntityDetails(address);
    }
    return fetchFromBackend<WalletEntity>(`/entities/${encodeURIComponent(address)}`);
  },

  async getClusterDetails(clusterId: string): Promise<Cluster | null> {
    if (IS_MOCK_MODE) {
      return mockService.getClusterDetails(clusterId);
    }
    return fetchFromBackend<Cluster>(`/clusters/${encodeURIComponent(clusterId)}`);
  },

  async getNetworkEvidence(txidOrIp: string): Promise<NetworkEvidence | null> {
    if (IS_MOCK_MODE) {
      return mockService.getNetworkEvidence(txidOrIp);
    }
    return fetchFromBackend<NetworkEvidence>(`/evidence/network/${encodeURIComponent(txidOrIp)}`);
  },

  async getGraphData(params: GraphQueryParams): Promise<GraphData> {
    if (IS_MOCK_MODE) {
      return mockService.getGraphData(params);
    }
    const query = new URLSearchParams();
    query.append('seed_id', params.seedId);
    if (params.depth) query.append('depth', params.depth.toString());
    if (params.minRiskScore) query.append('min_risk', params.minRiskScore.toString());
    if (params.includeNetworkLayer !== undefined) {
      query.append('network_layer', params.includeNetworkLayer.toString());
    }
    return fetchFromBackend<GraphData>(`/graph?${query.toString()}`);
  },

  async uploadDataset(file: File): Promise<IngestJobStatus> {
    if (IS_MOCK_MODE) {
      return mockService.uploadDataset(file);
    }
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/ingest/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Dataset upload failed');
    return response.json();
  },

  async getJobStatus(jobId: string): Promise<IngestJobStatus> {
    if (IS_MOCK_MODE) {
      return mockService.getJobStatus(jobId);
    }
    return fetchFromBackend<IngestJobStatus>(`/ingest/status/${encodeURIComponent(jobId)}`);
  },

  async generateReport(req: ReportGenerationRequest): Promise<InvestigationReport> {
    if (IS_MOCK_MODE) {
      return mockService.generateReport(req);
    }
    return fetchFromBackend<InvestigationReport>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },
};
