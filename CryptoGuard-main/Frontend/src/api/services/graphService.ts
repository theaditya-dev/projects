import { apiClient } from '../client';
import { GraphData } from '../../types/forensics';
import { GraphQueryParams } from '../../types/api';

export const graphService = {
  async getGraphData(params: GraphQueryParams): Promise<GraphData> {
    return apiClient.getGraphData(params);
  },
};
