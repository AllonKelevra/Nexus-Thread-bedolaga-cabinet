import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { PlatformProvider } from './platform/PlatformProvider';
import { ThemeColorsProvider } from './providers/ThemeColorsProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './components/Toast';
import { TooltipProvider } from './components/primitives/Tooltip';
import { initLogoPreload } from './api/branding';
import { initTelegramSDK } from './hooks/useTelegramSDK';
import './i18n';
import './styles/globals.css';

// Initialize Telegram SDK (init, viewport mount, CSS vars binding, swipe control)
initTelegramSDK();

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
      <BrowserRouter>
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
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
