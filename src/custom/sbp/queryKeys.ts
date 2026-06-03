export const sbpQueryKeys = {
  ticketActions: (ticketId: number | null) =>
    ['custom', 'sbp', 'ticket-actions', ticketId] as const,
};
