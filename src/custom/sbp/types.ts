export interface SbpTicketActions {
  has_sbp_confirm: boolean;
  status: 'pending' | 'confirmed' | 'missing';
  has_yoomoney_confirm?: boolean;
  yoomoney_status?: 'pending' | 'confirmed' | 'missing';
  yoomoney_fee_percent?: number;
}

export interface SbpAdminConfirmResponse {
  status: 'confirmed';
  ticket_id: number;
  amount_rubles: number;
  bank: string;
  ticket_closed: boolean;
}

export interface SbpTicketCreateRequest {
  amount_kopeks: number;
  bank: string;
}

export interface SbpTicketCreateResponse {
  status: 'ticket_created';
  ticket_id: number;
  amount_kopeks: number;
  amount_rubles: number;
  bank: string;
}
