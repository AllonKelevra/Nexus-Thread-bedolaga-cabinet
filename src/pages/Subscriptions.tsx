import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '../api/subscription';
import { useTheme } from '../hooks/useTheme';
import { getGlassColors } from '../utils/glassTheme';
import { useHaptic } from '../platform';
import type { SubscriptionListItem } from '../types';

function formatTrafficDisplay(used: number, limit: number): string {
  if (limit === 0) return '∞';
  return `${used.toFixed(1)} / ${limit} ГБ`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' || status === 'trial'
      ? 'bg-emerald-400'
      : status === 'limited'
        ? 'bg-amber-400'
        : 'bg-red-400';
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}

function SubscriptionCard({
  subscription,
  onClick,
}: {
  subscription: SubscriptionListItem;
  onClick: () => void;
}) {
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const { impact } = useHaptic();

  const handleClick = () => {
    impact('light');
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className="bento-card w-full text-left transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: g.cardBg, borderColor: g.cardBorder }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={subscription.status} />
          <span className="text-base font-semibold">{subscription.tariff_name || 'Подписка'}</span>
        </div>
        <svg
          className="h-5 w-5 opacity-40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm opacity-70">
        <div>
          <div className="text-xs opacity-60">Трафик</div>
          <div>
            {formatTrafficDisplay(subscription.traffic_used_gb, subscription.traffic_limit_gb)}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-60">Устройства</div>
          <div>{subscription.device_limit}</div>
        </div>
        <div>
          <div className="text-xs opacity-60">До</div>
          <div>{formatDate(subscription.end_date)}</div>
        </div>
      </div>

      {subscription.is_trial && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
            Тестовая
          </span>
        </div>
      )}
    </button>
  );
}

function EmptyState({ onBuy }: { onBuy: () => void }) {
  return (
    <div className="bento-card p-6 text-center">
      <div className="mb-3 text-4xl">📋</div>
      <h3 className="mb-1 text-lg font-semibold">Нет подписок</h3>
      <p className="mb-4 text-sm opacity-60">У вас пока нет активных подписок</p>
      <button
        onClick={onBuy}
        className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
      >
        Купить подписку
      </button>
    </div>
  );
}

export default function Subscriptions() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 30_000,
    refetchOnMount: 'always',
  });

  // If multi_tariff not enabled, redirect to legacy subscription page
  if (data && !data.multi_tariff_enabled) {
    navigate('/subscription', { replace: true });
    return null;
  }

  const subscriptions = data?.subscriptions ?? [];

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-bold">{t('subscriptions.title', 'Мои подписки')}</h1>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      )}

      {!isLoading && subscriptions.length === 0 && (
        <EmptyState onBuy={() => navigate('/subscription/purchase')} />
      )}

      {subscriptions.map((sub) => (
        <SubscriptionCard
          key={sub.id}
          subscription={sub}
          onClick={() => navigate(`/subscription/${sub.id}`)}
        />
      ))}

      {!isLoading && subscriptions.length > 0 && (
        <button
          onClick={() => navigate('/subscription/purchase')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 p-4 text-sm opacity-60 transition-opacity hover:opacity-100"
        >
          <span className="text-lg">+</span>
          {t('subscriptions.buyAnother', 'Купить ещё тариф')}
        </button>
      )}
    </div>
  );
}
