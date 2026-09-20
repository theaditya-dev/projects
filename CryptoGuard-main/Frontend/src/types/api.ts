/**
 * API Contract Types & Query Parameter Models
 */

import { Alert, SeverityLevel } from './forensics';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  error?: string;
  isMockSource?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AlertQueryParams {
  page?: number;
  limit?: number;
  severity?: SeverityLevel;
  minRiskScore?: number;
  searchQuery?: string;
  status?: Alert['status'];
  sortBy?: 'timestamp' | 'riskScore' | 'anomalyScore';
  sortOrder?: 'asc' | 'desc';
}

export interface GraphQueryParams {
  seedId: string;
  nodeType?: 'IP' | 'WALLET' | 'TRANSACTION' | 'CLUSTER';
  depth?: number;
  minRiskScore?: number;
  includeNetworkLayer?: boolean;
}

export interface ReportGenerationRequest {
  targetEntityId: string;
  targetType: 'WALLET' | 'TRANSACTION' | 'CLUSTER' | 'IP';
  caseTitle: string;
  investigatorNotes: string;
}
