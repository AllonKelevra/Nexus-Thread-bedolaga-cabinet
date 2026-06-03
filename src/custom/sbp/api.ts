import apiClient from '../../api/client';
import type {
  SbpAdminConfirmResponse,
  SbpTicketActions,
  SbpTicketCreateRequest,
  SbpTicketCreateResponse,
} from './types';

export const sbpApi = {
  getTicketActions: async (ticketId: number): Promise<SbpTicketActions> => {
    const response = await apiClient.get<SbpTicketActions>(
      `/cabinet/balance/ticket-actions/${ticketId}`,
    );
    return response.data;
  },

  confirmPayment: async (ticketId: number): Promise<SbpAdminConfirmResponse> => {
    const response = await apiClient.post<SbpAdminConfirmResponse>(
      `/cabinet/balance/sbp-admin-confirm/${ticketId}`,
    );
    return response.data;
  },

  createTicket: async (payload: SbpTicketCreateRequest): Promise<SbpTicketCreateResponse> => {
    const response = await apiClient.post<SbpTicketCreateResponse>(
      '/cabinet/balance/sbp-ticket',
      payload,
    );
    return response.data;
  },
};
