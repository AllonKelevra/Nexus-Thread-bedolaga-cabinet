import { SbpConfirmButton } from './SbpConfirmButton';
import { useSbpTicketActions } from './useSbpTicketActions';
import { YooMoneyConfirmButton } from '../yoomoney/YooMoneyConfirmButton';

interface SbpTicketActionsProps {
  ticketId: number | null;
}

export function SbpTicketActions({ ticketId }: SbpTicketActionsProps) {
  const { data } = useSbpTicketActions(ticketId);

  if (!ticketId || (!data?.has_sbp_confirm && !data?.has_yoomoney_confirm)) {
    return null;
  }

  return (
    <>
      {data.has_sbp_confirm && <SbpConfirmButton ticketId={ticketId} />}
      {data.has_yoomoney_confirm && (
        <YooMoneyConfirmButton ticketId={ticketId} feePercent={data.yoomoney_fee_percent ?? 3} />
      )}
    </>
  );
}
