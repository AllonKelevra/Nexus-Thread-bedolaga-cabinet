export interface YooMoneyTicketCreateResponse {
  status: 'ticket_created';
  ticket_id: number;
  gross_amount_kopeks: number;
  gross_amount_rubles: number;
  credit_amount_kopeks: number;
  credit_amount_rubles: number;
  fee_percent: number;
}

export interface YooMoneyTicketCreateRequest {
  amount_kopeks: number;
}

export interface YooMoneyAutoPaymentRequest {
  amount_kopeks: number;
}

export interface YooMoneyAutoPaymentResponse {
  status: 'pending_created';
  label: string;
  receiver: string;
  form_action: string;
  form_fields: Record<string, string>;
  gross_amount_kopeks: number;
  gross_amount_rubles: number;
  credit_amount_kopeks: number;
  credit_amount_rubles: number;
  fee_percent: number;
}

export interface YooMoneyAdminConfirmResponse {
  status: 'confirmed';
  ticket_id: number;
  gross_amount_rubles: number;
  credit_amount_rubles: number;
  fee_percent: number;
  ticket_closed: boolean;
}
