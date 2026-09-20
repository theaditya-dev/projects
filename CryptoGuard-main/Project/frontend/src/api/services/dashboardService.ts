import { apiClient } from '../client';
import { IngestJobStatus, DashboardStatistics, InvestigationReport } from '../../types/forensics';
import { ReportGenerationRequest } from '../../types/api';

export const ingestService = {
  async uploadDataset(file: File): Promise<IngestJobStatus> {
    return apiClient.uploadDataset(file);
  },

  async getJobStatus(jobId: string): Promise<IngestJobStatus> {
    return apiClient.getJobStatus(jobId);
  },
};

export const dashboardService = {
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    return apiClient.getDashboardStats();
  },
};

export const reportService = {
  async generateInvestigationReport(req: ReportGenerationRequest): Promise<InvestigationReport> {
    return apiClient.generateReport(req);
  },
};
