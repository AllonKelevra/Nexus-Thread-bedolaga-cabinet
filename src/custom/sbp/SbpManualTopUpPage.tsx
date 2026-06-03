import { useMemo, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router';
import { motion } from 'framer-motion';

import { balanceApi } from '../../api/balance';
import { Card } from '../../components/data-display/Card';
import { staggerContainer, staggerItem } from '../../components/motion/transitions';
import { useCurrency } from '../../hooks/useCurrency';
import { sbpApi } from './api';
import type { SbpTicketCreateResponse } from './types';

const BANKS = [
  { id: 'yandex', label: 'Яндекс', note: 'рекомендуется' },
  { id: 'alfa', label: 'Альфа Банк' },
  { id: 'tbank', label: 'Т-Банк' },
  { id: 'sber', label: 'Сбербанк' },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail || `HTTP ${error.response?.status ?? 'error'}`;
  }
  return error instanceof Error ? error.message : 'Network error';
}

export default function SbpManualTopUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatAmount, currencySymbol, convertAmount, convertToRub, targetCurrency } =
    useCurrency();

  const initialAmountRubles = searchParams.get('amount')
    ? Number.parseFloat(searchParams.get('amount') || '')
    : undefined;
  const initialAmount = useMemo(() => {
    if (!initialAmountRubles || initialAmountRubles <= 0) return '';
    const converted = convertAmount(initialAmountRubles);
    return targetCurrency === 'IRR' || targetCurrency === 'RUB'
      ? Math.ceil(converted).toString()
      : converted.toFixed(2);
  }, [convertAmount, initialAmountRubles, targetCurrency]);

  const [amount, setAmount] = useState(initialAmount);
  const [bank, setBank] = useState('yandex');
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SbpTicketCreateResponse | null>(null);

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: balanceApi.getPaymentMethods,
  });

  const manualMethod = paymentMethods?.find((method) => method.id === 'manual');
  const minRubles = manualMethod ? manualMethod.min_amount_kopeks / 100 : 100;
  const maxRubles = manualMethod ? manualMethod.max_amount_kopeks / 100 : 50000;
  const quickAmounts = [100, 300, 500, 1000].filter(
    (value) => value >= minRubles && value <= maxRubles,
  );

  const createTicketMutation = useMutation({
    mutationFn: (amountKopeks: number) =>
      sbpApi.createTicket({ amount_kopeks: amountKopeks, bank }),
    onSuccess: async (data) => {
      setCreatedTicket(data);
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError));
    },
  });

  const handleSubmit = () => {
    setError(null);
    inputRef.current?.blur();

    if (!manualMethod || !manualMethod.is_available) {
      setError('Пополнение по номеру телефона через СБП временно недоступно.');
      return;
    }

    const amountCurrency = Number.parseFloat(amount);
    if (Number.isNaN(amountCurrency) || amountCurrency <= 0) {
      setError('Введите сумму пополнения.');
      return;
    }

    const amountRubles = convertToRub(amountCurrency);
    if (amountRubles < minRubles || amountRubles > maxRubles) {
      setError(`Сумма должна быть от ${minRubles.toFixed(0)} до ${maxRubles.toFixed(0)} ₽.`);
      return;
    }

    const amountKopeks =
      targetCurrency === 'RUB' ? Math.round(amountRubles * 100) : Math.ceil(amountRubles * 100);
    createTicketMutation.mutate(amountKopeks);
  };

  const isPending = createTicketMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      className="mx-auto max-w-xl space-y-5"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem} className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
            По номеру телефона через СБП
          </h1>
          <p className="mt-1 text-sm text-dark-400">
            {formatAmount(minRubles, 0)} – {formatAmount(maxRubles, 0)} {currencySymbol}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/balance/top-up')}
          className="rounded-xl border border-dark-700/70 px-3 py-2 text-sm font-medium text-dark-300 transition-colors hover:bg-dark-800"
        >
          Назад
        </button>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Card className="space-y-5">
          <div className="rounded-xl border border-accent-500/20 bg-accent-500/10 p-4 text-sm text-dark-200">
            <div className="font-semibold text-accent-400">Инструкция:</div>
            <div className="mt-3 space-y-3 leading-relaxed text-dark-300">
              <p>Для пополнения баланса направьте перевод по номеру телефона через СБП.</p>
              <div>
                <span className="text-base">📱</span> <span className="text-dark-400">Номер:</span>{' '}
                <span className="font-semibold text-dark-100">REMOVED_PAYMENT_PHONE</span>
              </div>
              <p>Переведите выбранную сумму через СБП на один из банков ниже.</p>
              <p>После перевода нажмите «Я перевёл», чтобы создать тикет на проверку.</p>
              <div className="border-t border-accent-500/15 pt-3">
                <p>Администратор проверит ваш перевод и пополнит ваш баланс.</p>
                <p className="mt-2 text-dark-400">
                  <span className="text-base">⏱️</span> Время пополнения до 2-х часов.
                </p>
                <p className="text-dark-500">
                  Обработка платежа в нерабочие часы может занять больше времени.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-400">Банк получателя</label>
            <div className="grid grid-cols-2 gap-2">
              {BANKS.map((item) => {
                const selected = bank === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBank(item.id)}
                    className={`rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors ${
                      selected
                        ? 'bg-accent-500/15 text-accent-400 ring-2 ring-accent-500/40'
                        : 'border border-dark-700/50 bg-dark-800/70 text-dark-300 hover:bg-dark-700/70'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.note && (
                      <span className="ml-2 text-xs font-medium text-warning-400">{item.note}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-400">Сумма</label>
            <div className="flex gap-2">
              <div className="relative flex-1 rounded-2xl border border-dark-700/50 bg-dark-800/70">
                <input
                  ref={inputRef}
                  type="number"
                  inputMode="decimal"
                  enterKeyHint="done"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="0"
                  className="h-14 w-full bg-transparent px-4 pr-12 text-xl font-bold text-dark-100 placeholder:text-dark-600 focus:outline-none"
                  autoComplete="off"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold text-dark-500">
                  {currencySymbol}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !amount || !!createdTicket}
                className={`flex h-14 shrink-0 items-center justify-center rounded-2xl px-6 text-base font-bold transition-colors ${
                  isPending || !amount || createdTicket
                    ? 'cursor-not-allowed bg-dark-700 text-dark-500'
                    : 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 hover:bg-accent-400 active:bg-accent-600'
                }`}
              >
                {isPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : createdTicket ? (
                  'Тикет создан'
                ) : (
                  'Я перевёл'
                )}
              </button>
            </div>
          </div>

          {quickAmounts.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setAmount(
                      convertAmount(value).toFixed(
                        targetCurrency === 'RUB' || targetCurrency === 'IRR' ? 0 : 2,
                      ),
                    )
                  }
                  className="rounded-xl border border-dark-700/50 bg-dark-800/70 px-3 py-3 text-sm font-semibold text-dark-200 transition-colors hover:bg-dark-700"
                >
                  {formatAmount(value, 0)}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-error-500/20 bg-error-500/10 p-3 text-sm text-error-400">
              {error}
            </div>
          )}

          {createdTicket && (
            <div className="space-y-3">
              <div className="rounded-xl border border-success-500/20 bg-success-500/10 p-4 text-sm text-success-400">
                Тикет #{createdTicket.ticket_id} создан. Администратор проверит перевод и пополнит
                баланс на {createdTicket.amount_rubles.toFixed(0)} ₽.
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full rounded-xl border border-success-500/40 bg-success-500/15 px-4 py-3 text-sm font-semibold text-success-300 transition-colors hover:bg-success-500/25 active:bg-success-500/30"
              >
                Вернуться домой
              </button>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
