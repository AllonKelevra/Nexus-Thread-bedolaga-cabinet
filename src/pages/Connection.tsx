import { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { openLink as sdkOpenLink } from '@telegram-apps/sdk-react';
import { subscriptionApi } from '../api/subscription';
import { useTelegramSDK } from '../hooks/useTelegramSDK';
import { useHaptic } from '@/platform';
import { resolveTemplate, hasTemplates } from '../utils/templateEngine';
import { useAuthStore } from '../store/auth';
import type { AppConfig } from '../types';
import InstallationGuide from '../components/connection/InstallationGuide';

export default function Connection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { isTelegramWebApp } = useTelegramSDK();
  const { impact: hapticImpact } = useHaptic();

  const hapticRef = useRef(hapticImpact);
  hapticRef.current = hapticImpact;

  const {
    data: appConfig,
    isLoading,
    error,
  } = useQuery<AppConfig>({
    queryKey: ['appConfig'],
    queryFn: () => subscriptionApi.getAppConfig(),
  });

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleGoBack();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleGoBack]);

  const resolveUrl = useCallback(
    (url: string): string => {
      if (!hasTemplates(url) || !appConfig?.subscriptionUrl) return url;
      return resolveTemplate(url, {
        subscriptionUrl: appConfig.subscriptionUrl,
        username: user?.username ?? undefined,
      });
    },
    [appConfig?.subscriptionUrl, user?.username],
  );

  const openDeepLink = useCallback(
    (deepLink: string) => {
      let resolved = deepLink;
      if (hasTemplates(resolved)) {
        resolved = resolveUrl(resolved);
      }

      const finalUrl = `${window.location.origin}/miniapp/redirect.html?url=${encodeURIComponent(resolved)}&lang=${i18n.language || 'en'}`;

      if (isTelegramWebApp) {
        try {
          sdkOpenLink(finalUrl, { tryInstantView: false });
          return;
        } catch {
          // SDK not available, fallback
        }
      }

      window.location.href = finalUrl;
    },
    [isTelegramWebApp, i18n.language, resolveUrl],
  );

  // Loading
  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-accent-500/30 border-t-accent-500" />
      </div>
    );
  }

  // Error
  if (error || !appConfig) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <p className="mb-4 text-lg text-dark-300">{t('common.error')}</p>
        <button onClick={handleGoBack} className="btn-primary px-6 py-2">
          {t('common.close')}
        </button>
      </div>
    );
  }

  // No subscription
  if (!appConfig.hasSubscription) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <h3 className="mb-2 text-xl font-bold text-dark-100">
          {t('subscription.connection.title')}
        </h3>
        <p className="mb-4 text-dark-400">{t('subscription.connection.noSubscription')}</p>
        <button onClick={handleGoBack} className="btn-primary px-6 py-2">
          {t('common.close')}
        </button>
      </div>
    );
  }

  return (
    <InstallationGuide
      appConfig={appConfig}
      onOpenDeepLink={openDeepLink}
      isTelegramWebApp={isTelegramWebApp}
      onGoBack={handleGoBack}
    />
  );
}
