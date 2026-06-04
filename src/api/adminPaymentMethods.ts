import apiClient from './client';
import type {
  PaymentMethodConfig,
  PromoGroupSimple,
  ProviderConfigResponse,
  SecretStatus,
} from '../types';

export const adminPaymentMethodsApi = {
  getAll: async (): Promise<PaymentMethodConfig[]> => {
    const response = await apiClient.get<PaymentMethodConfig[]>('/cabinet/admin/payment-methods');
    return response.data;
  },

  getOne: async (methodId: string): Promise<PaymentMethodConfig> => {
    const response = await apiClient.get<PaymentMethodConfig>(
      `/cabinet/admin/payment-methods/${methodId}`,
    );
    return response.data;
  },

  update: async (methodId: string, data: Record<string, unknown>): Promise<PaymentMethodConfig> => {
    const response = await apiClient.put<PaymentMethodConfig>(
      `/cabinet/admin/payment-methods/${methodId}`,
      data,
    );
    return response.data;
  },

  updateOrder: async (methodIds: string[]): Promise<void> => {
    await apiClient.put('/cabinet/admin/payment-methods/order', { method_ids: methodIds });
  },

  getPromoGroups: async (): Promise<PromoGroupSimple[]> => {
    const response = await apiClient.get<PromoGroupSimple[]>(
      '/cabinet/admin/payment-methods/promo-groups',
    );
    return response.data;
  },

  getProviderConfig: async (methodId: string): Promise<ProviderConfigResponse> => {
    const response = await apiClient.get<ProviderConfigResponse>(
      `/cabinet/admin/payment-methods/${methodId}/provider-config`,
    );
    return response.data;
  },

  updateProviderConfig: async (
    methodId: string,
    config: Record<string, unknown>,
  ): Promise<ProviderConfigResponse> => {
    const response = await apiClient.put<ProviderConfigResponse>(
      `/cabinet/admin/payment-methods/${methodId}/provider-config`,
      { config },
    );
    return response.data;
  },

  replaceSecret: async (
    methodId: string,
    secretKey: string,
    value: string,
  ): Promise<SecretStatus> => {
    const response = await apiClient.put<SecretStatus>(
      `/cabinet/admin/payment-methods/${methodId}/secrets/${secretKey}`,
      { value },
    );
    return response.data;
  },

  clearSecret: async (methodId: string, secretKey: string): Promise<SecretStatus> => {
    const response = await apiClient.delete<SecretStatus>(
      `/cabinet/admin/payment-methods/${methodId}/secrets/${secretKey}`,
    );
    return response.data;
  },
};
