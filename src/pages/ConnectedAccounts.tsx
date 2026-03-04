import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { authApi } from '../api/auth';
import { useToast } from '../components/Toast';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import OAuthProviderIcon from '../components/OAuthProviderIcon';
import type { LinkedProvider } from '../types';

const OAUTH_PROVIDERS = ['google', 'yandex', 'discord', 'vk'];

const isOAuthProvider = (provider: string): boolean => OAUTH_PROVIDERS.includes(provider);

// Icons for providers not covered by OAuthProviderIcon
function TelegramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.28-.02-.12.03-2.02 1.28-5.69 3.77-.54.37-1.03.55-1.47.54-.48-.01-1.41-.27-2.1-.5-.85-.28-1.52-.43-1.46-.91.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.26-3.54 3.93-1.62 4.75-1.9 5.28-1.91.12 0 .37.03.54.17.14.12.18.28.2.46-.01.06.01.24 0 .37z"
        fill="#29B6F6"
      />
    </svg>
  );
}

function EmailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function ProviderIcon({ provider }: { provider: string }) {
  switch (provider) {
    case 'telegram':
      return <TelegramIcon className="h-6 w-6" />;
    case 'email':
      return <EmailIcon className="h-6 w-6 text-dark-300" />;
    default:
      return <OAuthProviderIcon provider={provider} className="h-6 w-6" />;
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <div className="flex animate-pulse items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-dark-700" />
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-dark-700" />
                <div className="h-3 w-32 rounded bg-dark-700" />
              </div>
            </div>
            <div className="h-8 w-20 rounded bg-dark-700" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function ConnectedAccounts() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['linked-providers'],
    queryFn: () => authApi.getLinkedProviders(),
  });

  const unlinkMutation = useMutation({
    mutationFn: (provider: string) => authApi.unlinkProvider(provider),
    onSuccess: () => {
      refetch();
      showToast({
        type: 'success',
        message: t('profile.accounts.unlinkSuccess'),
      });
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('profile.accounts.unlinkError'),
      });
    },
  });

  const canUnlink = (provider: LinkedProvider): boolean => {
    if (!provider.linked) return false;
    if (!isOAuthProvider(provider.provider)) return false;
    const linkedCount = data?.providers.filter((p) => p.linked).length ?? 0;
    return linkedCount > 1;
  };

  const handleLink = async (provider: string) => {
    try {
      const { authorize_url, state } = await authApi.linkProviderInit(provider);
      sessionStorage.setItem('link_oauth_state', state);
      sessionStorage.setItem('link_oauth_provider', provider);
      window.location.href = authorize_url;
    } catch {
      showToast({
        type: 'error',
        message: t('profile.accounts.linkError'),
      });
    }
  };

  const handleUnlink = (provider: string) => {
    if (window.confirm(t('profile.accounts.unlinkConfirm'))) {
      unlinkMutation.mutate(provider);
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Page title */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
          {t('profile.accounts.title')}
        </h1>
        <p className="mt-1 text-dark-400">{t('profile.accounts.subtitle')}</p>
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <motion.div variants={staggerItem}>
          <LoadingSkeleton />
        </motion.div>
      )}

      {/* Provider cards */}
      {data?.providers.map((provider) => (
        <motion.div key={provider.provider} variants={staggerItem}>
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ProviderIcon provider={provider.provider} />
                <div>
                  <p className="font-medium text-dark-100">
                    {t(`profile.accounts.providers.${provider.provider}`)}
                  </p>
                  {provider.identifier && (
                    <p className="text-sm text-dark-400">{provider.identifier}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {provider.linked ? (
                  <>
                    <span className="text-sm text-success-500">{t('profile.accounts.linked')}</span>
                    {canUnlink(provider) && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unlinkMutation.isPending}
                        loading={
                          unlinkMutation.isPending && unlinkMutation.variables === provider.provider
                        }
                        onClick={() => handleUnlink(provider.provider)}
                      >
                        {t('profile.accounts.unlink')}
                      </Button>
                    )}
                  </>
                ) : (
                  isOAuthProvider(provider.provider) && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleLink(provider.provider)}
                    >
                      {t('profile.accounts.link')}
                    </Button>
                  )
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
