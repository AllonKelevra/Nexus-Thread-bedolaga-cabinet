import { useCallback, useMemo } from 'react';

const FULLSCREEN_CACHE_KEY = 'cabinet_fullscreen_enabled';

/**
 * Get cached fullscreen setting
 */
export const getCachedFullscreenEnabled = (): boolean => {
  try {
    return localStorage.getItem(FULLSCREEN_CACHE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Set cached fullscreen setting
 */
export const setCachedFullscreenEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(FULLSCREEN_CACHE_KEY, String(enabled));
  } catch {
    // localStorage not available
  }
};

/**
 * Check if we're actually running inside Telegram Mini App
 */
export function isInTelegramWebApp(): boolean {
  const webApp = window.Telegram?.WebApp;
  return Boolean(webApp?.initData && webApp.initData.length > 0);
}

/**
 * Check if running on mobile Telegram client (iOS/Android)
 */
export function isTelegramMobile(): boolean {
  const webApp = window.Telegram?.WebApp;
  if (!webApp?.platform) return false;
  return webApp.platform === 'ios' || webApp.platform === 'android';
}

/**
 * Get Telegram init data for authentication
 */
export function getTelegramInitData(): string | null {
  const webApp = window.Telegram?.WebApp;
  return webApp?.initData || null;
}

/**
 * Initialize Telegram WebApp (basic setup without SDK)
 */
export function initTelegramSDK() {
  if (!isInTelegramWebApp()) {
    return;
  }

  const tg = window.Telegram?.WebApp;
  if (!tg) return;

  // Basic initialization
  tg.ready();
  tg.expand();

  // Disable closing confirmation by default
  tg.disableClosingConfirmation?.();

  // Auto-enter fullscreen if enabled in settings (mobile only)
  const fullscreenEnabled = getCachedFullscreenEnabled();
  if (fullscreenEnabled && isTelegramMobile() && tg.requestFullscreen) {
    setTimeout(() => {
      if (!tg.isFullscreen) {
        tg.requestFullscreen?.();
      }
    }, 100);
  }
}

/**
 * Type for platform values
 */
export type TelegramPlatform =
  | 'android'
  | 'ios'
  | 'tdesktop'
  | 'macos'
  | 'weba'
  | 'webk'
  | 'unigram'
  | 'unknown'
  | undefined;

// Default values
const defaultInsets = { top: 0, bottom: 0, left: 0, right: 0 };

/**
 * Hook for Telegram WebApp integration
 * Uses native window.Telegram.WebApp API
 */
export function useTelegramSDK() {
  const inTelegram = isInTelegramWebApp();
  const tg = window.Telegram?.WebApp;

  const platform = useMemo<TelegramPlatform>(() => {
    if (!inTelegram) return undefined;
    return tg?.platform as TelegramPlatform;
  }, [inTelegram, tg?.platform]);

  const isMobile = platform === 'ios' || platform === 'android';

  // Safe area insets from Telegram WebApp
  const safeAreaInset = useMemo(() => {
    if (!inTelegram || !tg?.safeAreaInset) return defaultInsets;
    return {
      top: tg.safeAreaInset.top || 0,
      bottom: tg.safeAreaInset.bottom || 0,
      left: tg.safeAreaInset.left || 0,
      right: tg.safeAreaInset.right || 0,
    };
  }, [inTelegram, tg?.safeAreaInset]);

  const contentSafeAreaInset = useMemo(() => {
    if (!inTelegram || !tg?.contentSafeAreaInset) return defaultInsets;
    return {
      top: tg.contentSafeAreaInset.top || 0,
      bottom: tg.contentSafeAreaInset.bottom || 0,
      left: tg.contentSafeAreaInset.left || 0,
      right: tg.contentSafeAreaInset.right || 0,
    };
  }, [inTelegram, tg?.contentSafeAreaInset]);

  const isFullscreen = tg?.isFullscreen ?? false;
  const viewportHeight = tg?.viewportHeight ?? 0;
  const viewportStableHeight = tg?.viewportStableHeight ?? 0;
  const isExpanded = tg?.isExpanded ?? true;

  const requestFullscreen = useCallback(() => {
    if (!inTelegram || !tg?.requestFullscreen) return;
    tg.requestFullscreen();
  }, [inTelegram, tg]);

  const exitFullscreen = useCallback(() => {
    if (!inTelegram || !tg?.exitFullscreen) return;
    tg.exitFullscreen();
  }, [inTelegram, tg]);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      requestFullscreen();
    }
  }, [isFullscreen, requestFullscreen, exitFullscreen]);

  const expand = useCallback(() => {
    if (!inTelegram || !tg?.expand) return;
    tg.expand();
  }, [inTelegram, tg]);

  const disableVerticalSwipes = useCallback(() => {
    if (!inTelegram || !tg?.disableVerticalSwipes) return;
    tg.disableVerticalSwipes();
  }, [inTelegram, tg]);

  const enableVerticalSwipes = useCallback(() => {
    if (!inTelegram || !tg?.enableVerticalSwipes) return;
    tg.enableVerticalSwipes();
  }, [inTelegram, tg]);

  const isFullscreenSupported = inTelegram && typeof tg?.requestFullscreen === 'function';

  return {
    isTelegramWebApp: inTelegram,
    isFullscreen,
    isFullscreenSupported,
    safeAreaInset,
    contentSafeAreaInset,
    viewportHeight,
    viewportStableHeight,
    viewportWidth: 0, // Not available in native API
    isExpanded,
    platform,
    isMobile,
    requestFullscreen,
    exitFullscreen,
    toggleFullscreen,
    expand,
    disableVerticalSwipes,
    enableVerticalSwipes,
    viewport: null,
    miniApp: null,
  };
}
