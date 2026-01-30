import { create } from 'zustand';

export type SuccessNotificationType =
  | 'balance_topup'
  | 'subscription_activated'
  | 'subscription_renewed'
  | 'subscription_purchased';

export interface SuccessNotificationData {
  type: SuccessNotificationType;
  /** Amount in kopeks (for balance or subscription price) */
  amountKopeks?: number;
  /** New balance in kopeks */
  newBalanceKopeks?: number;
  /** Subscription expiry date ISO string */
  expiresAt?: string;
  /** Tariff name */
  tariffName?: string;
  /** Custom title override */
  title?: string;
  /** Custom message override */
  message?: string;
}

interface SuccessNotificationState {
  isOpen: boolean;
  data: SuccessNotificationData | null;

  show: (data: SuccessNotificationData) => void;
  hide: () => void;
}

export const useSuccessNotification = create<SuccessNotificationState>((set) => ({
  isOpen: false,
  data: null,

  show: (data) => set({ isOpen: true, data }),
  hide: () => set({ isOpen: false, data: null }),
}));
