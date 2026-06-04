import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';

import { adminPaymentMethodsApi } from '../../api/adminPaymentMethods';
import type {
  ManualProviderConfig,
  ProviderConfigResponse,
  SbpBankConfig,
  YooMoneyProviderConfig,
} from '../../types';

const parseAmounts = (value: string) =>
  value
    .split(/[\s,;]+/)
    .map((item) => Math.round(Number(item) * 100))
    .filter((item) => Number.isFinite(item) && item > 0);

const formatAmounts = (values: number[]) => values.map((value) => value / 100).join(', ');

function InstructionEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link.configure({ openOnClick: false })],
    content: value,
    editorProps: {
      attributes: { class: 'prose prose-invert min-h-32 max-w-none p-3 focus:outline-none' },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== value)
      editor.commands.setContent(value || '', { emitUpdate: false });
  }, [editor, value]);

  if (!editor) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-dark-700 bg-dark-900/40">
      <div className="flex gap-1 border-b border-dark-700 p-2">
        {[
          ['Жирный', () => editor.chain().focus().toggleBold().run()],
          ['Курсив', () => editor.chain().focus().toggleItalic().run()],
          ['Список', () => editor.chain().focus().toggleBulletList().run()],
        ].map(([label, action]) => (
          <button
            key={label as string}
            type="button"
            onClick={action as () => void}
            className="btn-secondary px-3 py-1 text-xs"
          >
            {label as string}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export function PaymentProviderConfigEditor({ methodId }: { methodId: string }) {
  const queryClient = useQueryClient();
  const [manual, setManual] = useState<ManualProviderConfig | null>(null);
  const [yoomoney, setYoomoney] = useState<YooMoneyProviderConfig | null>(null);
  const [secret, setSecret] = useState('');

  const query = useQuery({
    queryKey: ['admin-payment-provider-config', methodId],
    queryFn: () => adminPaymentMethodsApi.getProviderConfig(methodId),
  });

  useEffect(() => {
    if (!query.data) return;
    if (methodId === 'manual') setManual(query.data.config as ManualProviderConfig);
    if (methodId === 'yoomoney_donate') setYoomoney(query.data.config as YooMoneyProviderConfig);
  }, [methodId, query.data]);

  const saveMutation = useMutation({
    mutationFn: (config: Record<string, unknown>) =>
      adminPaymentMethodsApi.updateProviderConfig(methodId, config),
    onSuccess: (data) => {
      queryClient.setQueryData(['admin-payment-provider-config', methodId], data);
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] });
    },
  });
  const replaceSecretMutation = useMutation({
    mutationFn: () => adminPaymentMethodsApi.replaceSecret(methodId, 'notification_secret', secret),
    onSuccess: (status) => {
      setSecret('');
      queryClient.setQueryData<ProviderConfigResponse>(
        ['admin-payment-provider-config', methodId],
        (current) => (current ? { ...current, secret_status: status } : current),
      );
    },
  });
  const clearSecretMutation = useMutation({
    mutationFn: () => adminPaymentMethodsApi.clearSecret(methodId, 'notification_secret'),
    onSuccess: (status) => {
      queryClient.setQueryData<ProviderConfigResponse>(
        ['admin-payment-provider-config', methodId],
        (current) => (current ? { ...current, secret_status: status } : current),
      );
    },
  });

  const updateBank = (index: number, patch: Partial<SbpBankConfig>) =>
    setManual((current) =>
      current
        ? {
            ...current,
            banks: current.banks.map((bank, i) => (i === index ? { ...bank, ...patch } : bank)),
          }
        : current,
    );
  const moveBank = (index: number, direction: -1 | 1) =>
    setManual((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.banks.length) return current;
      const banks = [...current.banks];
      [banks[index], banks[target]] = [banks[target], banks[index]];
      return { ...current, banks: banks.map((bank, sort_order) => ({ ...bank, sort_order })) };
    });

  if (
    query.isLoading ||
    (methodId === 'manual' && !manual) ||
    (methodId === 'yoomoney_donate' && !yoomoney)
  ) {
    return <div className="card text-sm text-dark-400">Загрузка настроек провайдера...</div>;
  }

  return (
    <div className="card space-y-5">
      <h2 className="text-lg font-semibold text-dark-100">Настройки провайдера</h2>
      {manual && (
        <>
          <label className="block text-sm text-dark-300">
            Телефон
            <input
              className="input mt-2"
              value={manual.phone}
              onChange={(event) => setManual({ ...manual, phone: event.target.value })}
            />
          </label>
          <label className="block text-sm text-dark-300">
            Описание метода
            <input
              className="input mt-2"
              value={manual.description}
              onChange={(event) => setManual({ ...manual, description: event.target.value })}
            />
          </label>
          <label className="block text-sm text-dark-300">
            Быстрые суммы, ₽
            <input
              className="input mt-2"
              value={formatAmounts(manual.quick_amounts_kopeks)}
              onChange={(event) =>
                setManual({ ...manual, quick_amounts_kopeks: parseAmounts(event.target.value) })
              }
            />
          </label>
          <div>
            <div className="mb-2 text-sm text-dark-300">Инструкция</div>
            <InstructionEditor
              value={manual.instruction_html}
              onChange={(instruction_html) => setManual({ ...manual, instruction_html })}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-dark-300">Банки</span>
              <button
                type="button"
                className="btn-secondary px-3 py-1 text-xs"
                onClick={() =>
                  setManual({
                    ...manual,
                    banks: [
                      ...manual.banks,
                      {
                        id: `bank_${manual.banks.length + 1}`,
                        label: 'Новый банк',
                        enabled: true,
                        recommended: false,
                        sort_order: manual.banks.length,
                      },
                    ],
                  })
                }
              >
                Добавить
              </button>
            </div>
            {manual.banks.map((bank, index) => (
              <div
                key={`${bank.id}-${index}`}
                className="grid gap-2 rounded-xl border border-dark-700 p-3 sm:grid-cols-[1fr_1fr_auto]"
              >
                <input
                  className="input"
                  value={bank.id}
                  onChange={(event) => updateBank(index, { id: event.target.value })}
                  placeholder="id"
                />
                <input
                  className="input"
                  value={bank.label}
                  onChange={(event) => updateBank(index, { label: event.target.value })}
                  placeholder="Название"
                />
                <div className="flex flex-wrap items-center gap-2 text-xs text-dark-300">
                  <label>
                    <input
                      type="checkbox"
                      checked={bank.enabled}
                      onChange={(event) => updateBank(index, { enabled: event.target.checked })}
                    />{' '}
                    включён
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={bank.recommended}
                      onChange={(event) => updateBank(index, { recommended: event.target.checked })}
                    />{' '}
                    рекомендуется
                  </label>
                  <button type="button" onClick={() => moveBank(index, -1)}>
                    ↑
                  </button>
                  <button type="button" onClick={() => moveBank(index, 1)}>
                    ↓
                  </button>
                  <button
                    type="button"
                    className="text-error-400"
                    onClick={() =>
                      setManual({ ...manual, banks: manual.banks.filter((_, i) => i !== index) })
                    }
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate(manual as unknown as Record<string, unknown>)}
          >
            Сохранить настройки СБП
          </button>
        </>
      )}
      {yoomoney && (
        <>
          <label className="block text-sm text-dark-300">
            Номер кошелька
            <input
              className="input mt-2"
              value={yoomoney.receiver_wallet}
              onChange={(event) =>
                setYoomoney({ ...yoomoney, receiver_wallet: event.target.value })
              }
            />
          </label>
          <label className="block text-sm text-dark-300">
            Комиссия, basis points
            <input
              type="number"
              min={0}
              max={10000}
              className="input mt-2"
              value={yoomoney.fee_basis_points}
              onChange={(event) =>
                setYoomoney({ ...yoomoney, fee_basis_points: Number(event.target.value) })
              }
            />
          </label>
          <label className="block text-sm text-dark-300">
            Описание метода
            <input
              className="input mt-2"
              value={yoomoney.description}
              onChange={(event) => setYoomoney({ ...yoomoney, description: event.target.value })}
            />
          </label>
          <label className="block text-sm text-dark-300">
            Быстрые суммы, ₽
            <input
              className="input mt-2"
              value={formatAmounts(yoomoney.quick_amounts_kopeks)}
              onChange={(event) =>
                setYoomoney({ ...yoomoney, quick_amounts_kopeks: parseAmounts(event.target.value) })
              }
            />
          </label>
          <button
            type="button"
            className="btn-primary w-full"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate(yoomoney as unknown as Record<string, unknown>)}
          >
            Сохранить настройки YooMoney
          </button>
          <div className="space-y-2 border-t border-dark-700 pt-4">
            <p className="text-sm text-dark-300">
              Секрет уведомлений:{' '}
              {query.data?.secret_status?.configured
                ? `настроен (${query.data.secret_status.source})`
                : 'не настроен'}
            </p>
            <input
              type="password"
              autoComplete="new-password"
              className="input"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              placeholder="Новое значение не отображается после сохранения"
            />
            <div className="flex gap-2">
              <button
                type="button"
                className="btn-primary flex-1"
                disabled={!secret || replaceSecretMutation.isPending}
                onClick={() => replaceSecretMutation.mutate()}
              >
                Заменить секрет
              </button>
              <button
                type="button"
                className="btn-secondary flex-1 text-error-400"
                disabled={clearSecretMutation.isPending}
                onClick={() => clearSecretMutation.mutate()}
              >
                Очистить секрет
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
