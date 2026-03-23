import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { getGlassColors } from '../../utils/glassTheme';
import { useHaptic } from '../../platform';
import type { SubscriptionListItem } from '../../types';

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

export default function SubscriptionListCard({
  subscription,
  onClick,
}: {
  subscription: SubscriptionListItem;
  onClick: () => void;
}) {
  const { t } = useTranslation();
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
          <span className="text-base font-semibold">
            {subscription.tariff_name || t('subscription.defaultName', 'Подписка')}
          </span>
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
          <div className="text-xs opacity-60">{t('subscription.traffic', 'Трафик')}</div>
          <div>
            {formatTrafficDisplay(subscription.traffic_used_gb, subscription.traffic_limit_gb)}
          </div>
        </div>
        <div>
          <div className="text-xs opacity-60">{t('subscription.devices', 'Устройства')}</div>
          <div>{subscription.device_limit}</div>
        </div>
        <div>
          <div className="text-xs opacity-60">{t('subscription.until', 'До')}</div>
          <div>{formatDate(subscription.end_date)}</div>
        </div>
      </div>

      {subscription.is_trial && (
        <div className="mt-2">
          <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
            {t('subscription.trial', 'Тестовая')}
          </span>
        </div>
      )}
    </button>
  );
}
