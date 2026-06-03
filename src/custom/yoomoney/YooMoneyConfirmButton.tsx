import { useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNativeDialog } from '../../platform/hooks/useNativeDialog';
import { sbpQueryKeys } from '../sbp/queryKeys';
import { yoomoneyApi } from './api';
import type { YooMoneyAdminConfirmResponse } from './types';

interface YooMoneyConfirmButtonProps {
  ticketId: number;
  feePercent?: number;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail || `HTTP ${error.response?.status ?? 'error'}`;
  }
  return error instanceof Error ? error.message : 'Network error';
}

export function YooMoneyConfirmButton({ ticketId, feePercent = 3 }: YooMoneyConfirmButtonProps) {
  const { confirm: confirmDialog } = useNativeDialog();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<YooMoneyAdminConfirmResponse | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyConfirmed, setAlreadyConfirmed] = useState(false);

  const refreshTicketState = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sbpQueryKeys.ticketActions(ticketId) }),
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] }),
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] }),
    ]);
  };

  const confirmMutation = useMutation({
    mutationFn: () => yoomoneyApi.confirmPayment(ticketId),
    onSuccess: async (data) => {
      setResult(data);
      setConfirmed(true);
      setAlreadyConfirmed(false);
      setError(null);
      await refreshTicketState();
    },
    onError: async (mutationError) => {
      if (mutationError instanceof AxiosError && mutationError.response?.status === 409) {
        setConfirmed(true);
        setAlreadyConfirmed(true);
        setError(null);
        await refreshTicketState();
        return;
      }

      setError(getErrorMessage(mutationError));
    },
  });

  const handleConfirm = async () => {
    const userConfirmed = await confirmDialog(
      `Подтвердить YooMoney перевод и зачислить баланс за вычетом ${feePercent}% комиссии?`,
    );
    if (!userConfirmed) return;

    setError(null);
    setAlreadyConfirmed(false);
    confirmMutation.mutate();
  };

  const isBusy = confirmMutation.isPending;

  return (
    <div className="mb-4 rounded-lg border border-accent-400/20 bg-accent-400/5 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-accent-400">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>
          {confirmed ? 'Платёж YooMoney подтверждён' : 'Платёж YooMoney ожидает подтверждения'}
        </span>
      </div>

      {!confirmed && (
        <div className="mb-3 rounded-lg border border-dark-700/70 bg-dark-900 px-3 py-2 text-sm text-dark-300">
          Сумма перевода указана пользователем в тикете. При подтверждении баланс будет пополнен за
          вычетом комиссии YooMoney {feePercent}%.
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={isBusy || confirmed}
        type="button"
        className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
          confirmed
            ? 'cursor-not-allowed bg-green-500 text-white'
            : isBusy
              ? 'cursor-wait bg-accent-400/50 text-dark-900'
              : 'bg-accent-400 text-dark-900 hover:bg-accent-500 active:scale-[0.98]'
        }`}
      >
        {isBusy ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Обработка...
          </span>
        ) : confirmed ? (
          'Платёж подтверждён'
        ) : (
          'Подтвердить платёж'
        )}
      </button>

      {result && (
        <div className="mt-2 rounded-md bg-success-500/10 px-3 py-2 text-sm text-success-400">
          Баланс пополнен на {result.credit_amount_rubles.toFixed(0)} ₽. Сумма доната:{' '}
          {result.gross_amount_rubles.toFixed(0)} ₽, комиссия YooMoney {result.fee_percent}%.{' '}
          {result.ticket_closed ? 'Тикет закрыт.' : 'Тикет не был закрыт автоматически.'}
        </div>
      )}

      {alreadyConfirmed && (
        <div className="mt-2 rounded-md bg-warning-500/10 px-3 py-2 text-sm text-warning-400">
          Платёж уже подтверждён ранее. Повторное начисление не выполнялось.
        </div>
      )}

      {error && (
        <div className="mt-2 rounded-md bg-error-500/10 px-3 py-2 text-sm text-error-400">
          <strong>Ошибка:</strong> {error}
        </div>
      )}
    </div>
  );
}
