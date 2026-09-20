import { apiClient } from '../client';
import { Transaction, NetworkEvidence } from '../../types/forensics';

export const transactionService = {
  async getTransactionByTxid(txid: string): Promise<Transaction | null> {
    return apiClient.getTransactionDetails(txid);
  },

  async getNetworkEvidence(txidOrIp: string): Promise<NetworkEvidence | null> {
    return apiClient.getNetworkEvidence(txidOrIp);
  },
};
