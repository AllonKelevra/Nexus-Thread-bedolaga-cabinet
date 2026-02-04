import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppWithNavigator } from './AppWithNavigator';
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
      <AppWithNavigator />
    </QueryClientProvider>
  </React.StrictMode>,
);
