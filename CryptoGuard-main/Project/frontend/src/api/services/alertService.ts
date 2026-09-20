import { apiClient } from '../client';
import { Alert } from '../../types/forensics';
import { PaginatedResponse, AlertQueryParams } from '../../types/api';

export const alertService = {
  async getRankedAlerts(params: AlertQueryParams = {}): Promise<PaginatedResponse<Alert>> {
    return apiClient.getAlerts(params);
  },

  async getAlertById(alertId: string): Promise<Alert | null> {
    return apiClient.getAlertById(alertId);
  },
};
