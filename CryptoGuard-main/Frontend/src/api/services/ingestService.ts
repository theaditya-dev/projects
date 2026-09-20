import { apiClient } from '../client';
import { IngestJobStatus } from '../../types/forensics';

export const ingestService = {
  async uploadDataset(file: File): Promise<IngestJobStatus> {
    return apiClient.uploadDataset(file);
  },

  async getJobStatus(jobId: string): Promise<IngestJobStatus> {
    return apiClient.getJobStatus(jobId);
  },
};
