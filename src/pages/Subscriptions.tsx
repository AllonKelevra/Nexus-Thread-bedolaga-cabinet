import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '../api/subscription';
import SubscriptionListCard from '../components/subscription/SubscriptionListCard';

function EmptyState({ onBuy }: { onBuy: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="bento-card p-6 text-center">
      <div className="mb-3 text-4xl">📋</div>
      <h3 className="mb-1 text-lg font-semibold">{t('subscriptions.empty', 'Нет подписок')}</h3>
      <p className="mb-4 text-sm opacity-60">
        {t('subscriptions.emptyDesc', 'У вас пока нет активных подписок')}
      </p>
      <button
        onClick={onBuy}
        className="rounded-xl bg-blue-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
      >
        {t('subscriptions.buy', 'Купить подписку')}
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

  const subscriptions = data?.subscriptions ?? [];
  const isMultiTariff = data?.multi_tariff_enabled ?? false;

  // Single-tariff mode with one subscription: skip list, go directly to detail
  if (data && !isMultiTariff && subscriptions.length === 1) {
    navigate(`/subscriptions/${subscriptions[0].id}`, { replace: true });
    return null;
  }

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
        <SubscriptionListCard
          key={sub.id}
          subscription={sub}
          onClick={() => navigate(`/subscriptions/${sub.id}`)}
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
