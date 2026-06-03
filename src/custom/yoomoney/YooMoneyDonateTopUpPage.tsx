import { useMemo, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

import { balanceApi } from '../../api/balance';
import { Card } from '../../components/data-display/Card';
import { staggerContainer, staggerItem } from '../../components/motion/transitions';
import { useCurrency } from '../../hooks/useCurrency';
import { yoomoneyApi } from './api';
import type { YooMoneyAutoPaymentResponse } from './types';

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = (error.response?.data as { detail?: string } | undefined)?.detail;
    return detail || `HTTP ${error.response?.status ?? 'error'}`;
  }
  return error instanceof Error ? error.message : 'Network error';
}

export default function YooMoneyDonateTopUpPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { formatAmount, currencySymbol, convertAmount, convertToRub, targetCurrency } =
    useCurrency();
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const { data: paymentMethods, isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: balanceApi.getPaymentMethods,
  });

  const yoomoneyMethod = paymentMethods?.find((method) => method.id === 'yoomoney_donate');
  const minRubles = yoomoneyMethod ? yoomoneyMethod.min_amount_kopeks / 100 : 100;
  const maxRubles = yoomoneyMethod ? yoomoneyMethod.max_amount_kopeks / 100 : 50000;
  const quickAmounts = [100, 300, 500, 1000].filter(
    (value) => value >= minRubles && value <= maxRubles,
  );
  const creditPreview = useMemo(() => {
    const amountCurrency = Number.parseFloat(amount);
    if (Number.isNaN(amountCurrency) || amountCurrency <= 0) return null;
    return convertToRub(amountCurrency) * 0.97;
  }, [amount, convertToRub]);

  const getAmountKopeks = (): number | null => {
    if (!yoomoneyMethod || !yoomoneyMethod.is_available) {
      setError('Пополнение через YooMoney временно недоступно.');
      return null;
    }

    const amountCurrency = Number.parseFloat(amount);
    if (Number.isNaN(amountCurrency) || amountCurrency <= 0) {
      setError('Введите сумму перевода.');
      return null;
    }

    const amountRubles = convertToRub(amountCurrency);
    if (amountRubles < minRubles || amountRubles > maxRubles) {
      setError(`Сумма должна быть от ${minRubles.toFixed(0)} до ${maxRubles.toFixed(0)} ₽.`);
      return null;
    }

    return targetCurrency === 'RUB'
      ? Math.round(amountRubles * 100)
      : Math.ceil(amountRubles * 100);
  };

  const createAutoPaymentMutation = useMutation({
    mutationFn: (amountKopeks: number) =>
      yoomoneyApi.createAutoPayment({ amount_kopeks: amountKopeks }),
    onSuccess: (data) => {
      setError(null);
      submitYooMoneyPayment(data);
    },
    onError: (mutationError) => {
      setError(getErrorMessage(mutationError));
    },
  });

  const submitYooMoneyPayment = (payment: YooMoneyAutoPaymentResponse) => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = payment.form_action;
    form.style.display = 'none';

    Object.entries(payment.form_fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    form.remove();
  };

  const handleSubmit = () => {
    setError(null);
    inputRef.current?.blur();

    const amountKopeks = getAmountKopeks();
    if (!amountKopeks) return;

    createAutoPaymentMutation.mutate(amountKopeks);
  };

  const isAutoPending = createAutoPaymentMutation.isPending;

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
          <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">YooMoney</h1>
          <p className="mt-1 text-sm text-dark-400">
            Оплата картой, комиссия 3%, автоматическое пополнение
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
        <Card className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark-400">Сумма</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_128px]">
              <div className="relative rounded-2xl border border-[#00D9FF]/45 bg-[#070C1A] shadow-[inset_0_0_0_1px_rgba(0,217,255,0.04)]">
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
                  className="h-14 w-full bg-transparent px-4 pr-12 text-xl font-bold text-dark-100 placeholder:text-dark-600 focus:outline-none sm:h-16"
                  autoComplete="off"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base font-semibold text-dark-500">
                  {currencySymbol}
                </span>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isAutoPending || !amount}
                className={`flex h-14 w-full items-center justify-center rounded-2xl px-5 text-base font-bold transition-colors sm:h-16 ${
                  isAutoPending || !amount
                    ? 'cursor-not-allowed bg-dark-700 text-dark-500'
                    : 'bg-[#E6F600] text-[#070C1A] shadow-lg shadow-[#E6F600]/20 hover:bg-[#D7E900] active:bg-[#C6D800]'
                }`}
              >
                {isAutoPending ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#070C1A]/30 border-t-[#070C1A]" />
                ) : (
                  'Оплатить'
                )}
              </button>
            </div>
            {creditPreview !== null && (
              <p className="text-xs text-dark-400">
                К зачислению после комиссии 3%: {formatAmount(creditPreview, 0)} ₽
              </p>
            )}
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
                  className="rounded-xl border border-[#00D9FF]/35 bg-[#070C1A] px-3 py-3 text-sm font-semibold text-dark-200 transition-colors hover:border-[#8B5CFF]/70 hover:bg-[#10142A]"
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
        </Card>
      </motion.div>
    </motion.div>
  );
}
