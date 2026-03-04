import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';

// SessionStorage keys (set by ConnectedAccounts.tsx handleLink)
const LINK_OAUTH_STATE_KEY = 'link_oauth_state';
const LINK_OAUTH_PROVIDER_KEY = 'link_oauth_provider';

function getAndClearLinkOAuthState(): { state: string; provider: string } | null {
  const state = sessionStorage.getItem(LINK_OAUTH_STATE_KEY);
  const provider = sessionStorage.getItem(LINK_OAUTH_PROVIDER_KEY);
  sessionStorage.removeItem(LINK_OAUTH_STATE_KEY);
  sessionStorage.removeItem(LINK_OAUTH_PROVIDER_KEY);
  if (!state || !provider) return null;
  return { state, provider };
}

export default function LinkOAuthCallback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-fire from React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const linkAccount = async () => {
      const code = searchParams.get('code');
      const urlState = searchParams.get('state');
      // VK ID returns device_id in callback URL
      const deviceId = searchParams.get('device_id');

      if (!code || !urlState) {
        navigate('/profile/accounts', { replace: true });
        return;
      }

      // Get saved state from sessionStorage
      const saved = getAndClearLinkOAuthState();
      if (!saved) {
        navigate('/profile/accounts', { replace: true });
        return;
      }

      // Validate state match
      if (saved.state !== urlState) {
        navigate('/profile/accounts', { replace: true });
        return;
      }

      try {
        const response = await authApi.linkProviderCallback(
          saved.provider,
          code,
          urlState,
          deviceId ?? undefined,
        );

        if (response.merge_required && response.merge_token) {
          // Redirect to merge page
          navigate(`/merge/${response.merge_token}`, { replace: true });
        } else {
          // Success - redirect back to accounts
          navigate('/profile/accounts', { replace: true });
        }
      } catch {
        navigate('/profile/accounts', { replace: true });
      }
    };

    linkAccount();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="fixed inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
      <div className="relative text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        <h2 className="text-lg font-semibold text-dark-50">{t('profile.accounts.linking')}</h2>
        <p className="mt-2 text-sm text-dark-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}
