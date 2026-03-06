import { useState, useCallback, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { landingApi } from '../api/landings';
import { copyToClipboard } from '../utils/clipboard';
import { cn } from '../lib/utils';

const MAX_POLL_MS = 10 * 60 * 1000; // 10 minutes

// ============================================================
// Sub-components
// ============================================================

function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-dark-600 border-t-accent-500',
        className,
      )}
    />
  );
}

function PendingState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <Spinner className="h-16 w-16 border-[3px]" />
      <div>
        <h1 className="text-xl font-bold text-dark-50">
          {t('landing.awaitingPayment', 'Awaiting payment')}
        </h1>
        <p className="mt-2 text-sm text-dark-400">{t('landing.awaitingPaymentDesc')}</p>
      </div>
    </motion.div>
  );
}

function SuccessState({
  subscriptionUrl,
  cryptoLink,
  contactValue,
  recipientContactValue,
  tariffName,
  periodDays,
  isGift,
  giftMessage,
}: {
  subscriptionUrl: string | null;
  cryptoLink: string | null;
  contactValue: string | null;
  recipientContactValue: string | null;
  tariffName: string | null;
  periodDays: number | null;
  isGift: boolean;
  giftMessage: string | null;
}) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    const url = subscriptionUrl ?? cryptoLink;
    if (!url) return;

    try {
      await copyToClipboard(url);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard write failed silently
    }
  }, [subscriptionUrl, cryptoLink]);

  const displayUrl = subscriptionUrl ?? cryptoLink;
  const displayContact = isGift ? recipientContactValue : contactValue;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-success-500/10"
      >
        <motion.svg
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="h-10 w-10 text-success-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
        </motion.svg>
      </motion.div>

      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-dark-50">{t('landing.purchaseSuccess')}</h1>
        {tariffName && periodDays && (
          <p className="mt-1 text-sm text-dark-300">
            {tariffName} — {periodDays} {t('landing.daysAccess')}
          </p>
        )}
        {displayContact && (
          <p className="mt-2 text-sm text-dark-400">
            {isGift
              ? t('landing.giftSentTo', { contact: displayContact })
              : t('landing.keySentTo', { contact: displayContact })}
          </p>
        )}
        {isGift && giftMessage && (
          <p className="mt-2 text-sm italic text-dark-400">
            {t('landing.giftMessage')}: {giftMessage}
          </p>
        )}
      </div>

      {/* QR Code */}
      {displayUrl && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5">
            <QRCodeSVG
              value={displayUrl}
              size={200}
              level="M"
              includeMargin={false}
              className="h-[200px] w-[200px]"
            />
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
              copied
                ? 'bg-success-500/10 text-success-500'
                : 'bg-dark-800/50 text-dark-200 hover:bg-dark-700/50',
            )}
          >
            {copied ? (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t('landing.copied', 'Copied!')}
              </>
            ) : (
              <>
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                {t('landing.copyLink', 'Copy link')}
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function PendingActivationState({
  tariffName,
  periodDays,
  giftMessage,
  isGift,
  isActivating,
  onActivate,
}: {
  tariffName: string | null;
  periodDays: number | null;
  giftMessage: string | null;
  isGift: boolean;
  isActivating: boolean;
  onActivate: () => void;
}) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      {/* Warning icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning-500/10">
        <svg
          className="h-10 w-10 text-warning-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <div>
        <h1 className="text-xl font-bold text-dark-50">{t('landing.pendingActivation')}</h1>
        {tariffName && periodDays && (
          <p className="mt-1 text-sm text-dark-300">
            {tariffName} — {periodDays} {t('landing.daysAccess')}
          </p>
        )}
        <p className="mt-2 text-sm text-dark-400">{t('landing.pendingActivationDesc')}</p>
        {isGift && giftMessage && (
          <p className="mt-2 text-sm italic text-dark-400">
            {t('landing.giftMessage')}: {giftMessage}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onActivate}
        disabled={isActivating}
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-medium text-white transition-colors',
          isActivating
            ? 'cursor-not-allowed bg-accent-500/50'
            : 'bg-accent-500 hover:bg-accent-400',
        )}
      >
        {isActivating ? (
          <>
            <Spinner className="h-4 w-4" />
            {t('landing.activating')}
          </>
        ) : (
          t('landing.activateNow')
        )}
      </button>
    </motion.div>
  );
}

function FailedState() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-error-500/10">
        <svg
          className="h-10 w-10 text-error-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-dark-50">{t('landing.purchaseFailed')}</h1>
        <p className="mt-2 text-sm text-dark-400">{t('landing.purchaseFailedDesc')}</p>
      </div>
    </motion.div>
  );
}

function PollTimedOutState({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-dark-800/50">
        <svg
          className="h-10 w-10 text-dark-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-dark-50">
          {t('landing.pollTimedOut', 'Taking longer than expected')}
        </h1>
        <p className="mt-2 text-sm text-dark-400">
          {t(
            'landing.pollTimedOutDesc',
            'Payment processing is taking longer than usual. You can try checking again.',
          )}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl bg-accent-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-400"
      >
        {t('common.retry', 'Retry')}
      </button>
    </motion.div>
  );
}

// ============================================================
// Main Component
// ============================================================

export default function PurchaseSuccess() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const pollStart = useRef(Date.now());
  const [pollTimedOut, setPollTimedOut] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activationError, setActivationError] = useState(false);
  const activatingRef = useRef(false);

  // Referrer-Policy: prevent leaking payment token via referer header
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'referrer';
    meta.content = 'no-referrer';
    document.head.appendChild(meta);
    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  const {
    data: purchaseStatus,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['purchase-status', token],
    queryFn: () => landingApi.getPurchaseStatus(token!),
    enabled: !!token && !pollTimedOut,
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status;
      if (currentStatus === 'pending' || currentStatus === 'paid') {
        if (Date.now() - pollStart.current > MAX_POLL_MS) {
          setPollTimedOut(true);
          return false;
        }
        return 3_000;
      }
      return false;
    },
    retry: 2,
  });

  const handleRetryPoll = useCallback(() => {
    pollStart.current = Date.now();
    setPollTimedOut(false);
    refetch();
  }, [refetch]);

  const handleActivate = useCallback(async () => {
    if (!token || activatingRef.current) return;
    activatingRef.current = true;
    setIsActivating(true);
    setActivationError(false);
    try {
      await landingApi.activatePurchase(token);
      await refetch();
    } catch {
      setActivationError(true);
    } finally {
      activatingRef.current = false;
      setIsActivating(false);
    }
  }, [token, refetch]);

  const isSuccess = purchaseStatus?.status === 'delivered';
  const isPendingActivation = purchaseStatus?.status === 'pending_activation';
  const isFailed = purchaseStatus?.status === 'failed' || purchaseStatus?.status === 'expired';

  return (
    <div className="flex min-h-dvh items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-dark-800/50 bg-dark-900/50 p-8">
        {isError ? (
          <FailedState />
        ) : isSuccess ? (
          <SuccessState
            subscriptionUrl={purchaseStatus.subscription_url}
            cryptoLink={purchaseStatus.subscription_crypto_link}
            contactValue={purchaseStatus.contact_value}
            recipientContactValue={purchaseStatus.recipient_contact_value}
            tariffName={purchaseStatus.tariff_name}
            periodDays={purchaseStatus.period_days}
            isGift={purchaseStatus.is_gift}
            giftMessage={purchaseStatus.gift_message}
          />
        ) : isPendingActivation ? (
          <div className="space-y-4">
            <PendingActivationState
              tariffName={purchaseStatus.tariff_name}
              periodDays={purchaseStatus.period_days}
              giftMessage={purchaseStatus.gift_message}
              isGift={purchaseStatus.is_gift}
              isActivating={isActivating}
              onActivate={handleActivate}
            />
            {activationError && (
              <p className="text-center text-sm text-error-400">{t('landing.activationFailed')}</p>
            )}
          </div>
        ) : isFailed ? (
          <FailedState />
        ) : pollTimedOut ? (
          <PollTimedOutState onRetry={handleRetryPoll} />
        ) : (
          <PendingState />
        )}
      </div>
    </div>
  );
}
