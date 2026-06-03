import { useQuery } from '@tanstack/react-query';
import { sbpApi } from './api';
import { sbpQueryKeys } from './queryKeys';

export function useSbpTicketActions(ticketId: number | null) {
  return useQuery({
    queryKey: sbpQueryKeys.ticketActions(ticketId),
    queryFn: () => sbpApi.getTicketActions(ticketId!),
    enabled: ticketId !== null,
  });
}
