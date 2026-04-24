import apiClient from './client';

export type BulkActionType =
  | 'extend'
  | 'cancel'
  | 'activate'
  | 'change_tariff'
  | 'add_traffic'
  | 'add_balance'
  | 'assign_promo_group';

export interface BulkActionRequest {
  action: BulkActionType;
  user_ids: number[];
  params: BulkActionParams;
}

export interface BulkActionParams {
  days?: number;
  tariff_id?: number;
  traffic_gb?: number;
  balance_kopeks?: number;
  promo_group_id?: number | null;
}

export interface BulkActionResult {
  success: boolean;
  total: number;
  success_count: number;
  error_count: number;
  errors: Array<{
    user_id: number;
    error: string;
  }>;
}

export const adminBulkActionsApi = {
  execute: async (data: BulkActionRequest): Promise<BulkActionResult> => {
    const response = await apiClient.post('/cabinet/admin/bulk/execute', data);
    return response.data;
  },
};
