import apiClient from '../../api/client';
import type {
  YooMoneyAutoPaymentRequest,
  YooMoneyAutoPaymentResponse,
  YooMoneyAdminConfirmResponse,
  YooMoneyTicketCreateRequest,
  YooMoneyTicketCreateResponse,
} from './types';

export const yoomoneyApi = {
  createTicket: async (
    payload: YooMoneyTicketCreateRequest,
  ): Promise<YooMoneyTicketCreateResponse> => {
    const response = await apiClient.post<YooMoneyTicketCreateResponse>(
      '/cabinet/balance/yoomoney-ticket',
      payload,
    );
    return response.data;
  },

  createAutoPayment: async (
    payload: YooMoneyAutoPaymentRequest,
  ): Promise<YooMoneyAutoPaymentResponse> => {
    const response = await apiClient.post<YooMoneyAutoPaymentResponse>(
      '/cabinet/balance/yoomoney-auto-payment',
      payload,
    );
    return response.data;
  },

  confirmPayment: async (ticketId: number): Promise<YooMoneyAdminConfirmResponse> => {
    const response = await apiClient.post<YooMoneyAdminConfirmResponse>(
      `/cabinet/balance/yoomoney-admin-confirm/${ticketId}`,
    );
    return response.data;
  },
};
