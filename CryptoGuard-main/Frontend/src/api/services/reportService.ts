import { apiClient } from '../client';
import { InvestigationReport } from '../../types/forensics';
import { ReportGenerationRequest } from '../../types/api';

export const reportService = {
  async generateInvestigationReport(req: ReportGenerationRequest): Promise<InvestigationReport> {
    return apiClient.generateReport(req);
  },
};
