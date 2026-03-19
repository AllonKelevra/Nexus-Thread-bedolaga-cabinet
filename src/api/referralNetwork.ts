import apiClient from './client';
import type {
  NetworkGraphData,
  NetworkUserDetail,
  NetworkCampaignDetail,
  NetworkSearchResult,
  ScopeOptionsData,
} from '@/types/referralNetwork';

export const referralNetworkApi = {
  getScopeOptions: async (): Promise<ScopeOptionsData> => {
    const response = await apiClient.get('/cabinet/admin/referral-network/scope-options');
    return response.data;
  },

  getScopedGraph: async (scope: string, id: number): Promise<NetworkGraphData> => {
    const response = await apiClient.get('/cabinet/admin/referral-network/scoped', {
      params: { scope, id },
    });
    return response.data;
  },

  getUserDetail: async (userId: number): Promise<NetworkUserDetail> => {
    const response = await apiClient.get(`/cabinet/admin/referral-network/user/${userId}`);
    return response.data;
  },

  getCampaignDetail: async (campaignId: number): Promise<NetworkCampaignDetail> => {
    const response = await apiClient.get(`/cabinet/admin/referral-network/campaign/${campaignId}`);
    return response.data;
  },

  search: async (query: string): Promise<NetworkSearchResult> => {
    const response = await apiClient.get('/cabinet/admin/referral-network/search', {
      params: { q: query },
    });
    return response.data;
  },
};
