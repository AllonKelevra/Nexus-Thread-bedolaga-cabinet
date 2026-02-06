import { useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router';
import {
  showBackButton,
  hideBackButton,
  onBackButtonClick,
  offBackButtonClick,
} from '@telegram-apps/sdk-react';
import Twemoji from 'react-twemoji';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformProvider } from './platform/PlatformProvider';
import { ThemeColorsProvider } from './providers/ThemeColorsProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './components/Toast';
import { TooltipProvider } from './components/primitives/Tooltip';
import { isInTelegramWebApp } from './hooks/useTelegramSDK';

/**
 * Manages Telegram BackButton visibility based on navigation location.
 * Shows back button on non-root routes, hides on root.
 */
function TelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    const isRoot = location.pathname === '/' || location.pathname === '';
    try {
      if (isRoot) {
        hideBackButton();
      } else {
        showBackButton();
      }
    } catch {
      // Back button not mounted
    }
  }, [location]);

  // Stable handler — ref prevents re-subscription on every render
  const handler = useCallback(() => {
    navigateRef.current(-1);
  }, []);

  useEffect(() => {
    try {
      onBackButtonClick(handler);
    } catch {
      // Back button not mounted
    }
    return () => {
      try {
        offBackButtonClick(handler);
      } catch {
        // Back button not mounted
      }
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
                  <Twemoji options={{ className: 'twemoji', folder: 'svg', ext: '.svg' }}>
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
