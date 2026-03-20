import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { UI } from '@/config/constants';

/**
 * Computes the app header height in pixels, accounting for
 * Telegram MiniApp safe area insets in fullscreen mode.
 *
 * Desktop: 56px (h-14). Mobile: 64px (h-16) + safe area + TG header when fullscreen.
 */
export function useHeaderHeight(): { mobile: number; desktop: number } {
  const { isFullscreen, safeAreaInset, contentSafeAreaInset, platform, isMobile } =
    useTelegramSDK();
  const isMobileFullscreen = isFullscreen && isMobile;

  const telegramHeaderHeight =
    platform === 'android' ? UI.TELEGRAM_HEADER_ANDROID_PX : UI.TELEGRAM_HEADER_IOS_PX;

  const mobile = isMobileFullscreen
    ? UI.MOBILE_HEADER_HEIGHT_PX +
      Math.max(safeAreaInset.top, contentSafeAreaInset.top) +
      telegramHeaderHeight
    : UI.MOBILE_HEADER_HEIGHT_PX;

  return { mobile, desktop: UI.DESKTOP_HEADER_HEIGHT_PX };
}
