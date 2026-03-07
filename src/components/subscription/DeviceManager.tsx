import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { useCurrency } from '@/hooks/useCurrency';
import { useHaptic } from '@/platform';
import InsufficientBalancePrompt from '@/components/InsufficientBalancePrompt';
import { getGlassColors } from '@/utils/glassTheme';
import { getErrorMessage } from '@/utils/subscriptionHelpers';

// ─── Types ───

interface DeviceManagerProps {
  subscription: {
    device_limit: number;
    is_active: boolean;
    is_trial: boolean;
  };
  balanceKopeks: number;
  isDark: boolean;
  accentColor: string;
  onClose: () => void;
}

// ─── DotStepSelector ───
// Unified: bounded ranges show fixed dots, unbounded adds a "+" tail that grows

interface DotStepSelectorProps {
  min: number;
  max: number | null; // null = unlimited
  current: number;
  selected: number;
  connectedCount: number;
  onChange: (value: number) => void;
  accentColor: string;
  isDark: boolean;
}

function DotStepSelector({
  min,
  max,
  current,
  selected,
  connectedCount,
  onChange,
  accentColor,
  isDark,
}: DotStepSelectorProps) {
  const isUnlimited = max === null;
  const scrollRef = useRef<HTMLDivElement>(null);

  // For unbounded: dots go from min to max(current, selected)
  // For bounded: dots go from min to max
  const upperBound = isUnlimited ? Math.max(current, selected) : max;
  const total = upperBound - min + 1;

  if (total <= 0) return null;

  // For bounded large ranges (>15), show range input
  if (!isUnlimited && total > 15) {
    return (
      <div className="px-2">
        <input
          type="range"
          min={min}
          max={max}
          value={selected}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= Math.max(min, connectedCount)) {
              onChange(val);
            }
          }}
          className="w-full accent-accent-400"
          style={{ accentColor }}
        />
        <div className="mt-2 flex justify-between text-[10px] text-dark-50/30">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  }

  const dotSize = total <= 8 ? 32 : total <= 12 ? 24 : 20;
  const innerSize = (isCurrent: boolean) =>
    isCurrent ? (total <= 8 ? 16 : 12) : total <= 8 ? 10 : 8;

  const handlePlusClick = () => {
    onChange(selected + 1);
    // Scroll to end after new dot appears
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        left: scrollRef.current.scrollWidth,
        behavior: 'smooth',
      });
    });
  };

  // Track width calculation for filled portion
  const filledRatio = total > 1 ? (selected - min) / (upperBound - min) : 0;

  return (
    <div
      ref={scrollRef}
      className="flex items-center justify-center gap-0 overflow-x-auto"
      style={{ scrollbarWidth: 'none' }}
    >
      <div
        className="relative flex items-center rounded-full p-1.5"
        style={{
          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        {/* Filled track */}
        <div
          className="pointer-events-none absolute bottom-1.5 left-1.5 top-1.5 rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${filledRatio * 100}%`,
            background: `linear-gradient(90deg, ${accentColor}40, ${accentColor}90)`,
          }}
        />

        {/* Dots */}
        {Array.from({ length: total }, (_, i) => {
          const value = min + i;
          const isFilled = value <= selected;
          const isCur = value === current;
          const isLocked = value < connectedCount && value < selected;
          const floorValue = Math.max(min, connectedCount);
          const isDisabled = value < floorValue && value < current;

          return (
            <button
              key={value}
              type="button"
              onClick={() => {
                if (value >= floorValue || value > current) {
                  onChange(value);
                }
              }}
              disabled={isDisabled}
              className="relative z-10 flex shrink-0 items-center justify-center transition-all duration-200"
              style={{ width: dotSize, height: dotSize }}
              aria-label={`${value}`}
            >
              <div
                className="rounded-full transition-all duration-300"
                style={{
                  width: innerSize(isCur),
                  height: innerSize(isCur),
                  background: isFilled
                    ? isLocked
                      ? isDark
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.2)'
                      : accentColor
                    : isDark
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(0,0,0,0.12)',
                  boxShadow: isCur && isFilled ? `0 0 8px ${accentColor}60` : 'none',
                  border: isCur
                    ? `2px solid ${isFilled ? accentColor : isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}`
                    : 'none',
                }}
              />
            </button>
          );
        })}

        {/* "+" tail for unlimited */}
        {isUnlimited && (
          <button
            type="button"
            onClick={handlePlusClick}
            className="relative z-10 flex shrink-0 items-center justify-center transition-all duration-200"
            style={{ width: dotSize, height: dotSize }}
            aria-label="add"
          >
            <div
              className="flex items-center justify-center rounded-full transition-all duration-300"
              style={{
                width: total <= 8 ? 16 : 12,
                height: total <= 8 ? 16 : 12,
                background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                border: `1.5px dashed ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}`,
              }}
            >
              <svg
                width={total <= 8 ? 8 : 6}
                height={total <= 8 ? 8 : 6}
                viewBox="0 0 8 8"
                fill="none"
              >
                <path
                  d="M4 1v6M1 4h6"
                  stroke={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── DeviceManager ───

export default function DeviceManager({
  subscription,
  balanceKopeks,
  isDark,
  accentColor,
  onClose,
}: DeviceManagerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { formatAmount, currencySymbol } = useCurrency();
  const { impact: hapticImpact } = useHaptic();
  const g = getGlassColors(isDark);

  const formatPrice = (kopeks: number) => `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  const currentLimit = subscription.device_limit;
  const [selectedLimit, setSelectedLimit] = useState(currentLimit);

  // Determine mode
  const devicesToAdd = selectedLimit > currentLimit ? selectedLimit - currentLimit : 0;
  const mode: 'idle' | 'purchase' | 'reduce' =
    selectedLimit > currentLimit ? 'purchase' : selectedLimit < currentLimit ? 'reduce' : 'idle';

  // Fetch price data (gives us max_device_limit)
  const { data: priceData } = useQuery({
    queryKey: ['device-price', devicesToAdd || 1],
    queryFn: () => subscriptionApi.getDevicePrice(devicesToAdd || 1),
    enabled: !!subscription,
    placeholderData: (previousData) => previousData,
  });

  // Fetch reduction info (gives us min_device_limit, connected_devices_count)
  const { data: reductionInfo } = useQuery({
    queryKey: ['device-reduction-info'],
    queryFn: subscriptionApi.getDeviceReductionInfo,
    enabled: !!subscription,
  });

  const minLimit = reductionInfo?.min_device_limit ?? currentLimit;
  // null/undefined max_device_limit = unlimited
  const maxLimit = priceData?.max_device_limit ?? null;
  const connectedCount = reductionInfo?.connected_devices_count ?? 0;
  const isInitializing = !priceData || !reductionInfo;

  // Can we show the selector? Need range > 0 or unlimited
  const hasRange = maxLimit === null || maxLimit > minLimit;

  // Reset selectedLimit when currentLimit changes (after successful mutation)
  useEffect(() => {
    setSelectedLimit(currentLimit);
  }, [currentLimit]);

  const handleChange = useCallback(
    (value: number) => {
      setSelectedLimit(value);
      try {
        hapticImpact('light');
      } catch {
        /* not available */
      }
    },
    [hapticImpact],
  );

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: () => subscriptionApi.purchaseDevices(devicesToAdd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-price'] });
      onClose();
    },
  });

  // Reduce mutation
  const reduceMutation = useMutation({
    mutationFn: () => subscriptionApi.reduceDevices(selectedLimit),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['device-reduction-info'] });
      onClose();
    },
  });

  const isPending = purchaseMutation.isPending || reduceMutation.isPending;

  const canSubmit = (() => {
    if (mode === 'idle' || isPending) return false;
    if (mode === 'purchase') {
      if (!priceData?.available) return false;
      if (priceData.total_price_kopeks && priceData.total_price_kopeks > balanceKopeks)
        return false;
      return true;
    }
    if (mode === 'reduce') {
      if (reductionInfo?.available === false) return false;
      if (selectedLimit < connectedCount) return false;
      if (selectedLimit < minLimit) return false;
      return true;
    }
    return false;
  })();

  const handleSubmit = () => {
    if (mode === 'purchase') purchaseMutation.mutate();
    if (mode === 'reduce') reduceMutation.mutate();
  };

  const mutationError = purchaseMutation.error || reduceMutation.error;

  return (
    <div
      className={`rounded-xl border p-5 ${isDark ? 'border-dark-700/50 bg-dark-800/50' : 'border-champagne-300/60 bg-champagne-200/40'}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-medium text-dark-100">{t('subscription.deviceManager.title')}</h3>
        <button onClick={onClose} className="text-sm text-dark-400 hover:text-dark-200">
          ✕
        </button>
      </div>

      {isInitializing ? (
        <div className="flex items-center justify-center py-6">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent-400/30 border-t-accent-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Number badge + label */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold"
              style={{
                background: `${accentColor}15`,
                color: accentColor,
                border: `1px solid ${accentColor}25`,
              }}
            >
              {selectedLimit}
            </div>
            <span className="text-base font-medium text-dark-100">
              {t('subscription.deviceManager.devicesLabel')}
            </span>
          </div>

          {/* Dot selector — unified for bounded and unbounded */}
          {hasRange && (
            <DotStepSelector
              min={minLimit}
              max={maxLimit}
              current={currentLimit}
              selected={selectedLimit}
              connectedCount={connectedCount}
              onChange={handleChange}
              accentColor={accentColor}
              isDark={isDark}
            />
          )}

          {/* New limit info */}
          {mode !== 'idle' && (
            <div className="text-center text-sm" style={{ color: g.textSecondary }}>
              {t('subscription.additionalOptions.newDeviceLimit', { count: selectedLimit })}
            </div>
          )}

          {/* Purchase info */}
          {mode === 'purchase' && priceData?.available && priceData.price_per_device_label && (
            <div className="text-center">
              <div className="mb-2 text-sm" style={{ color: g.textSecondary }}>
                {priceData.discount_percent && priceData.discount_percent > 0 ? (
                  <span>
                    <span className="line-through" style={{ color: g.textMuted }}>
                      {formatPrice(priceData.original_price_per_device_kopeks || 0)}
                    </span>
                    <span className="mx-1">{priceData.price_per_device_label}</span>
                  </span>
                ) : (
                  priceData.price_per_device_label
                )}
                /{t('subscription.perDevice').replace('/ ', '')} (
                {t('subscription.days', { count: priceData.days_left })})
              </div>

              {priceData.discount_percent && priceData.discount_percent > 0 && (
                <div className="mb-2">
                  <span className="inline-block rounded-full bg-success-500/20 px-2.5 py-0.5 text-sm font-medium text-success-400">
                    -{priceData.discount_percent}%
                  </span>
                </div>
              )}

              {priceData.total_price_kopeks === 0 ? (
                <div className="text-2xl font-bold text-success-400">
                  {t('subscription.switchTariff.free')}
                </div>
              ) : (
                <div className="text-2xl font-bold text-accent-400">
                  {priceData.discount_percent &&
                    priceData.discount_percent > 0 &&
                    priceData.base_total_price_kopeks && (
                      <span className="mr-2 text-lg line-through" style={{ color: g.textMuted }}>
                        {formatPrice(priceData.base_total_price_kopeks)}
                      </span>
                    )}
                  {priceData.total_price_label}
                </div>
              )}
            </div>
          )}

          {/* Purchase unavailable reason */}
          {mode === 'purchase' && priceData?.available === false && priceData.reason && (
            <div className="rounded-lg bg-warning-500/10 p-3 text-center text-sm text-warning-400">
              {priceData.reason}
            </div>
          )}

          {/* Reduce unavailable reason */}
          {mode === 'reduce' && reductionInfo?.available === false && reductionInfo.reason && (
            <div className="rounded-lg bg-warning-500/10 p-3 text-center text-sm text-warning-400">
              {reductionInfo.reason}
            </div>
          )}

          {/* Reduce: connected devices warning */}
          {mode === 'reduce' &&
            reductionInfo?.available !== false &&
            connectedCount > selectedLimit && (
              <div className="rounded-lg bg-warning-500/10 p-3 text-center text-sm text-warning-400">
                {t('subscription.additionalOptions.disconnectDevicesFirst', {
                  count: connectedCount,
                })}
              </div>
            )}

          {/* Reduce info */}
          {mode === 'reduce' && reductionInfo && connectedCount <= selectedLimit && (
            <div className="space-y-1 text-center text-sm" style={{ color: g.textSecondary }}>
              <div>
                {t('subscription.additionalOptions.connectedDevices', { count: connectedCount })}
              </div>
            </div>
          )}

          {/* Insufficient balance */}
          {mode === 'purchase' &&
            priceData?.available &&
            priceData.total_price_kopeks &&
            priceData.total_price_kopeks > balanceKopeks && (
              <InsufficientBalancePrompt
                missingAmountKopeks={priceData.total_price_kopeks - balanceKopeks}
                compact
                onBeforeTopUp={async () => {
                  await subscriptionApi.saveDevicesCart(devicesToAdd);
                }}
              />
            )}

          {/* Action button */}
          {mode !== 'idle' && (
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="btn-primary w-full py-3"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                </span>
              ) : mode === 'reduce' ? (
                t('subscription.additionalOptions.reduce')
              ) : (
                t('subscription.additionalOptions.buy')
              )}
            </button>
          )}

          {/* Error */}
          {mutationError && (
            <div className="text-center text-sm text-error-400">
              {getErrorMessage(mutationError)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Trigger Button (no card wrapper — renders inside parent card) ───

interface DeviceManagerTriggerProps {
  deviceLimit: number;
  isDark: boolean;
  onClick: () => void;
}

export function DeviceManagerTrigger({ deviceLimit, isDark, onClick }: DeviceManagerTriggerProps) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition-colors ${isDark ? 'border-dark-700/50 bg-dark-800/50 hover:border-dark-600' : 'border-champagne-300/60 bg-champagne-200/40 hover:border-champagne-400'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-dark-100">{t('subscription.deviceManager.title')}</div>
          <div className="mt-1 text-sm text-dark-400">
            {t('subscription.additionalOptions.currentDeviceLimit', { count: deviceLimit })}
          </div>
        </div>
        <svg
          className="h-5 w-5 text-dark-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  );
}
