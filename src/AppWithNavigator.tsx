import { useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import {
  showBackButton,
  hideBackButton,
  onBackButtonClick,
  offBackButtonClick,
} from '@telegram-apps/sdk-react';
import { useQuery } from '@tanstack/react-query';
import Twemoji from 'react-twemoji';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformProvider } from './platform/PlatformProvider';
import { ThemeColorsProvider } from './providers/ThemeColorsProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './components/Toast';
import { TooltipProvider } from './components/primitives/Tooltip';
import { isInTelegramWebApp } from './hooks/useTelegramSDK';
import { hasInAppHistory, getFallbackParentPath } from './utils/navigation';
import { subscriptionApi } from './api/subscription';

const TWEMOJI_OPTIONS = { className: 'twemoji', folder: 'svg', ext: '.svg' } as const;

/**
 * Manages Telegram BackButton visibility based on navigation location.
 * Shows back button on non-root routes, hides on root.
 */
/** Pages reachable from bottom nav — treat as top-level (no back button). */
const BOTTOM_NAV_PATHS = ['/', '/subscriptions', '/balance', '/referral', '/support', '/wheel'];

/** Matches /subscriptions/:numericId — single-tariff users land here from
 * bot deep-links, but their /subscriptions list is empty (the list view
 * auto-redirects them straight back to this page). Pressing Back would loop
 * back to detail, so on a deep-link entry (idx=0) we hide the back button
 * and let Telegram surface its native Close (X) button instead. */
const SUBSCRIPTION_DETAIL_RE = /^\/subscriptions\/\d+\/?$/;

function TelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  // Share the subscriptions-list query with the page-level components.
  // React Query dedupes by key so this does not cause an extra fetch when
  // Subscriptions/Subscription/Dashboard pages mount.
  const { data: subData } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 30_000,
    // Don't fetch outside Telegram — the cabinet still loads on the web.
    enabled: isInTelegramWebApp(),
  });
  const isMultiTariff = subData?.multi_tariff_enabled ?? false;

  useEffect(() => {
    const isTopLevel = location.pathname === '' || BOTTOM_NAV_PATHS.includes(location.pathname);
    const isSingleTariffDetailDeepLink =
      !isMultiTariff && SUBSCRIPTION_DETAIL_RE.test(location.pathname) && !hasInAppHistory();
    try {
      if (isTopLevel || isSingleTariffDetailDeepLink) {
        hideBackButton();
      } else {
        showBackButton();
      }
    } catch {}
  }, [location, isMultiTariff]);

  // Stable handler — ref prevents re-subscription on every render
  const handler = useCallback(() => {
    // When opened via a bot deep-link directly on a nested route, there is no
    // in-app history and navigate(-1) is a no-op — the back button looks dead.
    // Fall back to the parent route so it always navigates somewhere sensible.
    if (hasInAppHistory()) {
      navigateRef.current(-1);
    } else {
      navigateRef.current(getFallbackParentPath(pathnameRef.current), { replace: true });
    }
  }, []);

  useEffect(() => {
    try {
      onBackButtonClick(handler);
    } catch {}
    return () => {
      try {
        offBackButtonClick(handler);
      } catch {}
    };
  }, [handler]);

  return null;
}

export function AppWithNavigator() {
  const isTelegram = isInTelegramWebApp();

  return (
    <BrowserRouter>
      {isTelegram && <TelegramBackButton />}
      <ErrorBoundary level="page">
        <PlatformProvider>
          <ThemeColorsProvider>
            <TooltipProvider>
              <ToastProvider>
                <WebSocketProvider>
                  <Twemoji options={TWEMOJI_OPTIONS}>
                    <App />
                  </Twemoji>
                </WebSocketProvider>
              </ToastProvider>
            </TooltipProvider>
          </ThemeColorsProvider>
        </PlatformProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
