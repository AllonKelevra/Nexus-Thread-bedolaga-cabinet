import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  init,
  restoreInitData,
  mountMiniApp,
  miniAppReady,
  mountThemeParams,
  mountViewport,
  expandViewport,
  mountSwipeBehavior,
  disableVerticalSwipes,
  mountClosingBehavior,
  disableClosingConfirmation,
  mountBackButton,
  mountMainButton,
  bindThemeParamsCssVars,
  bindViewportCssVars,
  requestFullscreen,
  isFullscreen,
} from '@telegram-apps/sdk-react';
import { AppWithNavigator } from './AppWithNavigator';
import { initLogoPreload } from './api/branding';
import { getCachedFullscreenEnabled, isTelegramMobile } from './hooks/useTelegramSDK';
import './i18n';
import './styles/globals.css';

// Safe mount helper — ignores "already mounted/mounting" errors (HMR, StrictMode)
function safeMountSync(fn: () => void) {
  try {
    fn();
  } catch {
    // Already mounted or not available
  }
}

// Initialize Telegram SDK v3
try {
  init();
  restoreInitData();

  safeMountSync(() => mountMiniApp());
  safeMountSync(() => {
    mountThemeParams();
    bindThemeParamsCssVars();
  });
  safeMountSync(() => {
    mountSwipeBehavior();
    disableVerticalSwipes();
  });
  safeMountSync(() => {
    mountClosingBehavior();
    disableClosingConfirmation();
  });
  safeMountSync(() => mountBackButton());
  safeMountSync(() => mountMainButton());

  // Viewport — async, fullscreen зависит от смонтированного viewport
  mountViewport()
    .then(() => {
      bindViewportCssVars();
      expandViewport();

      // Auto-enter fullscreen if enabled in settings (mobile only)
      if (getCachedFullscreenEnabled() && isTelegramMobile()) {
        if (!isFullscreen()) {
          requestFullscreen();
        }
      }
    })
    .catch(() => {});

  miniAppReady();
} catch {
  // Not in Telegram — ok
}

// Preload logo from cache immediately on page load
initLogoPreload();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppWithNavigator />
    </QueryClientProvider>
  </React.StrictMode>,
);
