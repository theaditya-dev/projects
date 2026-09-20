import { apiClient } from '../client';
import { WalletEntity, Cluster } from '../../types/forensics';

export const entityService = {
  async getEntityByAddress(address: string): Promise<WalletEntity | null> {
    return apiClient.getEntityDetails(address);
  },

  async getClusterById(clusterId: string): Promise<Cluster | null> {
    return apiClient.getClusterDetails(clusterId);
  },
};
