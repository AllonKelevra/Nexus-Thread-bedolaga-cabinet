import { useState } from 'react';
import { useNativeDialog } from '../../platform/hooks/useNativeDialog';

interface SbpConfirmButtonProps {
  ticketId: number;
  onConfirm?: () => void;
}

export function SbpConfirmButton({ ticketId, onConfirm }: SbpConfirmButtonProps) {
  const { confirm: confirmDialog } = useNativeDialog();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    const userConfirmed = await confirmDialog(
      'Подтвердить платёж СБП и зачислить баланс пользователю?',
    );
    if (!userConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`/api/cabinet/balance/sbp-admin-confirm/${ticketId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || `HTTP ${resp.status}`);
      }

      await resp.json();
      setConfirmed(true);

      onConfirm?.();

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-accent-400/20 bg-accent-400/5 p-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-accent-400">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Платёж СБП ожидает подтверждения</span>
      </div>

      <button
        onClick={handleConfirm}
        disabled={loading || confirmed}
        type="button"
        className={`w-full rounded-lg px-4 py-3 font-semibold transition-all ${
          confirmed
            ? 'cursor-not-allowed bg-green-500 text-white'
            : loading
              ? 'cursor-wait bg-accent-400/50 text-dark-900'
              : 'bg-accent-400 text-dark-900 hover:bg-accent-500 active:scale-[0.98]'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Обработка...
          </span>
        ) : confirmed ? (
          '✅ Платёж подтверждён'
        ) : (
          '💰 Подтвердить платёж'
        )}
      </button>

      {error && (
        <div className="mt-2 rounded-md bg-error-500/10 px-3 py-2 text-sm text-error-400">
          <strong>Ошибка:</strong> {error}
        </div>
      )}
    </div>
  );
}
