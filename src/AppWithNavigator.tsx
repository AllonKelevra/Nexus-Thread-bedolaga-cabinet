import { useEffect, useMemo } from 'react';
import { BrowserRouter, Router } from 'react-router-dom';
import { useIntegration } from '@telegram-apps/react-router-integration';
import { initNavigator } from '@telegram-apps/sdk';
import App from './App';
import { PlatformProvider } from './platform/PlatformProvider';
import { ThemeColorsProvider } from './providers/ThemeColorsProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './components/Toast';
import { TooltipProvider } from './components/primitives/Tooltip';

/**
 * Check if running inside Telegram Mini App
 * Uses multiple checks to reliably detect Telegram environment
 */
function isTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false;

  const webApp = window.Telegram?.WebApp;
  if (!webApp) return false;

  // Check 1: initDataUnsafe should have user data in real Telegram
  const hasUserData = webApp.initDataUnsafe?.user?.id !== undefined;

  // Check 2: Platform should not be 'unknown' (which is default in browser)
  const validPlatform = webApp.platform !== 'unknown' && webApp.platform !== '';

  // Check 3: Version should be present (SDK loads in Telegram only)
  const hasVersion = webApp.version !== undefined && webApp.version !== '';

  return hasUserData || (validPlatform && hasVersion);
}

/**
 * Component wrapper for Telegram navigator setup.
 * Integrates Telegram Mini Apps navigator with React Router to provide
 * automatic BackButton management based on navigation history.
 * Falls back to BrowserRouter when not in Telegram Mini App.
 */
/**
 * Navigator-based router for Telegram Mini App
 */
function TelegramRouter({ children }: { children: React.ReactNode }) {
  const navigator = useMemo(() => initNavigator('app-navigation-state', { hashMode: null }), []);
  const [location, reactNavigator] = useIntegration(navigator);

  useEffect(() => {
    try {
      navigator.attach();
      return () => {
        try {
          navigator.detach();
        } catch (err) {
          console.warn('Failed to detach navigator:', err);
        }
      };
    } catch (err) {
      console.warn('Failed to attach navigator:', err);
    }
  }, [navigator]);

  return (
    <Router location={location} navigator={reactNavigator}>
      {children}
    </Router>
  );
}

export function AppWithNavigator() {
  const isTelegram = useMemo(() => {
    const result = isTelegramMiniApp();
    console.log('[AppWithNavigator] Platform detection:', {
      isTelegram: result,
      platform: window.Telegram?.WebApp?.platform,
      hasUser: window.Telegram?.WebApp?.initDataUnsafe?.user?.id !== undefined,
      version: window.Telegram?.WebApp?.version,
    });
    return result;
  }, []);

  // Common app content
  const appContent = (
    <PlatformProvider>
      <ThemeColorsProvider>
        <TooltipProvider>
          <ToastProvider>
            <WebSocketProvider>
              <App />
            </WebSocketProvider>
          </ToastProvider>
        </TooltipProvider>
      </ThemeColorsProvider>
    </PlatformProvider>
  );

  // Use Telegram navigator in Mini App, BrowserRouter elsewhere
  if (isTelegram) {
    return <TelegramRouter>{appContent}</TelegramRouter>;
  }

  return <BrowserRouter>{appContent}</BrowserRouter>;
}
