import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowSelectionState,
} from '@tanstack/react-table';
import { adminUsersApi, type UserListItem } from '../api/adminUsers';
import { tariffsApi, type TariffListItem } from '../api/tariffs';
import { promocodesApi, type PromoGroup } from '../api/promocodes';
import {
  adminBulkActionsApi,
  type BulkActionType,
  type BulkActionParams,
  type BulkActionResult,
} from '../api/adminBulkActions';
import { usePlatform } from '../platform/hooks/usePlatform';
import { useCurrency } from '../hooks/useCurrency';
import { cn } from '@/lib/utils';

// ============ Types ============

type SubscriptionStatusFilter = '' | 'active' | 'expired' | 'trial' | 'limited' | 'disabled';

interface ActionConfig {
  type: BulkActionType;
  labelKey: string;
  icon: React.ReactNode;
  colorClass: string;
}

interface ModalState {
  open: boolean;
  action: BulkActionType | null;
  loading: boolean;
  result: BulkActionResult | null;
}

// ============ Icons ============

const BackIcon = () => (
  <svg
    className="h-5 w-5 text-dark-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
    />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const RefreshIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="h-3 w-3 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={3}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XCloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

// ============ Status badge ============

function StatusBadge({ status }: { status: string | null }) {
  const { t } = useTranslation();

  const config: Record<string, { class: string; labelKey: string }> = {
    active: {
      class: 'border-success-500/30 bg-success-500/15 text-success-400',
      labelKey: 'admin.bulkActions.statuses.active',
    },
    expired: {
      class: 'border-error-500/30 bg-error-500/15 text-error-400',
      labelKey: 'admin.bulkActions.statuses.expired',
    },
    trial: {
      class: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
      labelKey: 'admin.bulkActions.statuses.trial',
    },
    limited: {
      class: 'border-amber-500/30 bg-amber-500/15 text-amber-400',
      labelKey: 'admin.bulkActions.statuses.limited',
    },
    disabled: {
      class: 'border-dark-500/30 bg-dark-500/15 text-dark-400',
      labelKey: 'admin.bulkActions.statuses.disabled',
    },
  };

  const c = config[status || ''] || config.disabled;

  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium leading-tight',
        c.class,
      )}
    >
      {t(c.labelKey, status || '')}
    </span>
  );
}

// ============ Progress Bar ============

function ProgressBar({ loading }: { loading: boolean }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    if (loading) {
      setProgress(0);
      setVisible(true);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 30) return prev + 8;
          if (prev < 60) return prev + 3;
          if (prev < 85) return prev + 1;
          if (prev < 95) return prev + 0.3;
          return prev;
        });
      }, 100);
    } else {
      if (visible) {
        setProgress(100);
        clearInterval(intervalRef.current);
        const timer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [loading, visible]);

  if (!visible) return null;

  return (
    <div className="absolute left-0 right-0 top-0 z-50 h-0.5 overflow-hidden rounded-full bg-dark-700/50">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400 transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

// ============ Dropdown Select ============

interface DropdownOption {
  value: string;
  label: string;
}

function DropdownSelect({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 pr-8 text-sm text-dark-100 outline-none transition-colors focus:border-accent-500/40 focus:shadow-[0_0_0_3px_rgba(var(--color-accent-500),0.08)]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-500">
        <ChevronDownIcon />
      </div>
    </div>
  );
}

// ============ Action Modal ============

interface ActionModalProps {
  modal: ModalState;
  selectedCount: number;
  tariffs: TariffListItem[];
  promoGroups: PromoGroup[];
  onClose: () => void;
  onExecute: (params: BulkActionParams) => void;
}

function ActionModal({
  modal,
  selectedCount,
  tariffs,
  promoGroups,
  onClose,
  onExecute,
}: ActionModalProps) {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);
  const [tariffId, setTariffId] = useState<number>(tariffs[0]?.id ?? 0);
  const [trafficGb, setTrafficGb] = useState(10);
  const [balanceRub, setBalanceRub] = useState(100);
  const [promoGroupId, setPromoGroupId] = useState<number | null>(promoGroups[0]?.id ?? null);

  useEffect(() => {
    if (tariffs.length > 0 && tariffId === 0) {
      setTariffId(tariffs[0].id);
    }
  }, [tariffs, tariffId]);

  useEffect(() => {
    if (promoGroups.length > 0 && promoGroupId === null) {
      setPromoGroupId(promoGroups[0].id);
    }
  }, [promoGroups, promoGroupId]);

  if (!modal.open || !modal.action) return null;

  const actionLabelKeys: Record<BulkActionType, string> = {
    extend: 'admin.bulkActions.actions.extend',
    cancel: 'admin.bulkActions.actions.cancel',
    activate: 'admin.bulkActions.actions.activate',
    change_tariff: 'admin.bulkActions.actions.changeTariff',
    add_traffic: 'admin.bulkActions.actions.addTraffic',
    add_balance: 'admin.bulkActions.actions.addBalance',
    assign_promo_group: 'admin.bulkActions.actions.assignPromoGroup',
  };

  const handleSubmit = () => {
    const params: BulkActionParams = {};
    switch (modal.action) {
      case 'extend':
        params.days = days;
        break;
      case 'change_tariff':
        params.tariff_id = tariffId;
        break;
      case 'add_traffic':
        params.traffic_gb = trafficGb;
        break;
      case 'add_balance':
        params.balance_kopeks = Math.round(balanceRub * 100);
        break;
      case 'assign_promo_group':
        params.promo_group_id = promoGroupId;
        break;
    }
    onExecute(params);
  };

  const renderInputs = () => {
    switch (modal.action) {
      case 'extend':
        return (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">
              {t('admin.bulkActions.params.days')}
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 text-sm text-dark-100 outline-none transition-colors focus:border-accent-500/40"
            />
          </div>
        );
      case 'change_tariff':
        return (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">
              {t('admin.bulkActions.params.tariff')}
            </label>
            <DropdownSelect
              value={String(tariffId)}
              options={tariffs.map((tt) => ({ value: String(tt.id), label: tt.name }))}
              onChange={(v) => setTariffId(Number(v))}
            />
          </div>
        );
      case 'add_traffic':
        return (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">
              {t('admin.bulkActions.params.trafficGb')}
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={trafficGb}
              onChange={(e) => setTrafficGb(Number(e.target.value))}
              className="w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 text-sm text-dark-100 outline-none transition-colors focus:border-accent-500/40"
            />
          </div>
        );
      case 'add_balance':
        return (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">
              {t('admin.bulkActions.params.balanceRub')}
            </label>
            <input
              type="number"
              min={1}
              max={100000}
              value={balanceRub}
              onChange={(e) => setBalanceRub(Number(e.target.value))}
              className="w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2.5 text-sm text-dark-100 outline-none transition-colors focus:border-accent-500/40"
            />
          </div>
        );
      case 'assign_promo_group':
        return (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-300">
              {t('admin.bulkActions.params.promoGroup')}
            </label>
            <DropdownSelect
              value={promoGroupId !== null ? String(promoGroupId) : 'null'}
              options={[
                { value: 'null', label: t('admin.bulkActions.params.removePromoGroup') },
                ...promoGroups.map((pg) => ({ value: String(pg.id), label: pg.name })),
              ]}
              onChange={(v) => setPromoGroupId(v === 'null' ? null : Number(v))}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-dark-100">{t(actionLabelKeys[modal.action])}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-dark-400 transition-colors hover:bg-dark-800 hover:text-dark-200"
            aria-label={t('admin.bulkActions.cancel')}
          >
            <XCloseIcon />
          </button>
        </div>

        {/* Result view */}
        {modal.result ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-dark-700 bg-dark-800/50 p-4">
              <div className="mb-3 text-center text-sm font-semibold text-dark-100">
                {t('admin.bulkActions.complete')}
              </div>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success-400">
                    {modal.result.success_count}
                  </div>
                  <div className="text-xs text-dark-400">
                    {t('admin.bulkActions.successCount', { count: modal.result.success_count })}
                  </div>
                </div>
                {modal.result.error_count > 0 && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-error-400">
                      {modal.result.error_count}
                    </div>
                    <div className="text-xs text-dark-400">
                      {t('admin.bulkActions.errorCount', { count: modal.result.error_count })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
            >
              {t('common.close')}
            </button>
          </div>
        ) : (
          <>
            {/* Affected count */}
            <div className="mb-4 rounded-xl border border-accent-500/20 bg-accent-500/5 px-4 py-3">
              <p className="text-sm text-dark-200">
                {t('admin.bulkActions.selectedCount', { count: selectedCount })}
              </p>
            </div>

            {/* Action-specific inputs */}
            <div className="mb-6">{renderInputs()}</div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={modal.loading}
                className="flex-1 rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm font-medium text-dark-300 transition-colors hover:bg-dark-700 disabled:opacity-50"
              >
                {t('admin.bulkActions.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={modal.loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-600 disabled:opacity-50"
              >
                {modal.loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {t('admin.bulkActions.executing')}
                  </>
                ) : (
                  t('admin.bulkActions.confirm')
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============ Floating Action Bar ============

function FloatingActionBar({
  selectedCount,
  onAction,
}: {
  selectedCount: number;
  onAction: (type: BulkActionType) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (selectedCount === 0) return null;

  const actions: ActionConfig[] = [
    {
      type: 'extend',
      labelKey: 'admin.bulkActions.actions.extend',
      icon: <span aria-hidden="true">+</span>,
      colorClass: 'text-success-400 hover:bg-success-500/10',
    },
    {
      type: 'activate',
      labelKey: 'admin.bulkActions.actions.activate',
      icon: <span aria-hidden="true">+</span>,
      colorClass: 'text-success-400 hover:bg-success-500/10',
    },
    {
      type: 'cancel',
      labelKey: 'admin.bulkActions.actions.cancel',
      icon: <span aria-hidden="true">-</span>,
      colorClass: 'text-error-400 hover:bg-error-500/10',
    },
    {
      type: 'change_tariff',
      labelKey: 'admin.bulkActions.actions.changeTariff',
      icon: <span aria-hidden="true">~</span>,
      colorClass: 'text-accent-400 hover:bg-accent-500/10',
    },
    {
      type: 'add_traffic',
      labelKey: 'admin.bulkActions.actions.addTraffic',
      icon: <span aria-hidden="true">+</span>,
      colorClass: 'text-accent-400 hover:bg-accent-500/10',
    },
    {
      type: 'add_balance',
      labelKey: 'admin.bulkActions.actions.addBalance',
      icon: <span aria-hidden="true">$</span>,
      colorClass: 'text-warning-400 hover:bg-warning-500/10',
    },
    {
      type: 'assign_promo_group',
      labelKey: 'admin.bulkActions.actions.assignPromoGroup',
      icon: <span aria-hidden="true">%</span>,
      colorClass: 'text-accent-300 hover:bg-accent-300/10',
    },
  ];

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        ref={menuRef}
        className="relative flex w-full max-w-2xl items-center gap-3 rounded-2xl border border-dark-700/60 bg-dark-800/80 px-5 py-3 shadow-2xl backdrop-blur-xl"
      >
        {/* Selection count */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/20 text-sm font-bold text-accent-400">
            {selectedCount}
          </div>
          <span className="hidden text-sm font-medium text-dark-200 sm:inline">
            {t('admin.bulkActions.selectedCount', { count: selectedCount })}
          </span>
        </div>

        <div className="mx-2 h-6 w-px bg-dark-700" />

        {/* Actions dropdown */}
        <div className="relative ml-auto">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-600"
          >
            {t('common.actions')}
            <ChevronDownIcon />
          </button>

          {open && (
            <div className="absolute bottom-full right-0 mb-2 w-64 rounded-xl border border-dark-700 bg-dark-800 py-1.5 shadow-2xl">
              {actions.map((a) => (
                <button
                  key={a.type}
                  onClick={() => {
                    setOpen(false);
                    onAction(a.type);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-colors',
                    a.colorClass,
                  )}
                >
                  <span className="border-current/20 bg-current/5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-bold">
                    {a.icon}
                  </span>
                  {t(a.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============ Helpers ============

// ============ Main Page ============

export default function AdminBulkActions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { capabilities } = usePlatform();
  const { formatWithCurrency } = useCurrency();

  // Data
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [tariffs, setTariffs] = useState<TariffListItem[]>([]);
  const [promoGroups, setPromoGroups] = useState<PromoGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [committedSearch, setCommittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatusFilter>('');
  const [tariffFilter, setTariffFilter] = useState('');
  const [promoGroupFilter, setPromoGroupFilter] = useState('');

  // Pagination
  const [offset, setOffset] = useState(0);
  const limit = 50;

  // Selection
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Modal
  const [modal, setModal] = useState<ModalState>({
    open: false,
    action: null,
    loading: false,
    result: null,
  });

  // Debounce timer ref
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // ---- Data loading ----

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, unknown> = {
        offset,
        limit,
      };
      if (committedSearch) params.search = committedSearch;
      if (statusFilter) params.subscription_status = statusFilter;
      if (tariffFilter) params.tariff_id = Number(tariffFilter);
      if (promoGroupFilter) params.promo_group_id = Number(promoGroupFilter);

      const data = await adminUsersApi.getUsers(
        params as Parameters<typeof adminUsersApi.getUsers>[0],
      );
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
    }
  }, [offset, committedSearch, statusFilter, tariffFilter, promoGroupFilter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Load tariffs and promo groups once
  useEffect(() => {
    const load = async () => {
      try {
        const [tariffData, pgData] = await Promise.all([
          tariffsApi.getTariffs(true),
          promocodesApi.getPromoGroups({ limit: 200 }),
        ]);
        setTariffs(tariffData.tariffs);
        setPromoGroups(pgData.items);
      } catch {
        // silently fail
      }
    };
    load();
  }, []);

  // ---- Handlers ----

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setOffset(0);
      setCommittedSearch(value);
      setRowSelection({});
    }, 400);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => clearTimeout(searchTimerRef.current);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearTimeout(searchTimerRef.current);
    setOffset(0);
    setCommittedSearch(searchInput);
    setRowSelection({});
  };

  const handleStatusFilterChange = (v: string) => {
    setStatusFilter(v as SubscriptionStatusFilter);
    setOffset(0);
    setRowSelection({});
  };

  const handleTariffFilterChange = (v: string) => {
    setTariffFilter(v);
    setOffset(0);
    setRowSelection({});
  };

  const handlePromoGroupFilterChange = (v: string) => {
    setPromoGroupFilter(v);
    setOffset(0);
    setRowSelection({});
  };

  const handleRefresh = () => {
    setRowSelection({});
    loadUsers();
  };

  const selectedUserIds = useMemo(() => {
    return Object.keys(rowSelection)
      .filter((k) => rowSelection[k])
      .map(Number)
      .filter((id) => id > 0);
  }, [rowSelection]);

  const handleOpenAction = (type: BulkActionType) => {
    setModal({ open: true, action: type, loading: false, result: null });
  };

  const handleExecuteAction = async (params: BulkActionParams) => {
    if (!modal.action || selectedUserIds.length === 0) return;

    setModal((prev) => ({ ...prev, loading: true }));

    try {
      const result = await adminBulkActionsApi.execute({
        action: modal.action,
        user_ids: selectedUserIds,
        params,
      });
      setModal((prev) => ({ ...prev, loading: false, result }));
      // Refresh the user list after action
      loadUsers();
    } catch {
      setModal((prev) => ({
        ...prev,
        loading: false,
        result: {
          success: false,
          total: selectedUserIds.length,
          success_count: 0,
          error_count: selectedUserIds.length,
          errors: [],
        },
      }));
    }
  };

  const handleCloseModal = () => {
    if (modal.result) {
      setRowSelection({});
    }
    setModal({ open: false, action: null, loading: false, result: null });
  };

  // ---- TanStack Table ----

  const columns = useMemo<ColumnDef<UserListItem>[]>(
    () => [
      {
        id: 'select',
        size: 40,
        header: ({ table }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={table.getToggleAllRowsSelectedHandler()}
              className={cn(
                'h-4.5 w-4.5 flex items-center justify-center rounded border transition-colors',
                table.getIsAllRowsSelected()
                  ? 'border-accent-500 bg-accent-500'
                  : table.getIsSomeRowsSelected()
                    ? 'border-accent-500 bg-accent-500/30'
                    : 'border-dark-600 bg-dark-800 hover:border-dark-500',
              )}
              aria-label={t('admin.bulkActions.selectAll')}
            >
              {table.getIsAllRowsSelected() && <CheckIcon />}
              {table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected() && (
                <div className="h-0.5 w-2 rounded-full bg-white" />
              )}
            </button>
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center">
            <button
              onClick={row.getToggleSelectedHandler()}
              className={cn(
                'h-4.5 w-4.5 flex items-center justify-center rounded border transition-colors',
                row.getIsSelected()
                  ? 'border-accent-500 bg-accent-500'
                  : 'border-dark-600 bg-dark-800 hover:border-dark-500',
              )}
              aria-label={
                row.getIsSelected()
                  ? t('admin.bulkActions.deselectAll')
                  : t('admin.bulkActions.selectAll')
              }
            >
              {row.getIsSelected() && <CheckIcon />}
            </button>
          </div>
        ),
        enableSorting: false,
      },
      {
        id: 'user',
        accessorFn: (row) => row.full_name,
        header: t('admin.bulkActions.columns.user'),
        size: 200,
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-[10px] font-medium text-white">
                {user.first_name?.[0] || user.username?.[0] || '?'}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium text-dark-100">{user.full_name}</div>
                <div className="truncate text-[10px] leading-tight text-dark-500">
                  {user.username ? `@${user.username}` : `ID: ${user.telegram_id}`}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'subscription_status',
        accessorFn: (row) => row.subscription_status,
        header: t('admin.bulkActions.columns.status'),
        size: 100,
        cell: ({ row }) => {
          const user = row.original;
          if (!user.has_subscription) {
            return <span className="text-xs text-dark-500">-</span>;
          }
          return <StatusBadge status={user.subscription_status} />;
        },
      },
      {
        id: 'tariff',
        accessorFn: (row) => row.promo_group_name,
        header: t('admin.bulkActions.columns.tariff'),
        size: 120,
        cell: ({ row }) => {
          // UserListItem doesn't have tariff_name directly; we'll show subscription info
          const user = row.original;
          if (!user.has_subscription) {
            return <span className="text-xs text-dark-500">-</span>;
          }
          return (
            <span className="text-xs text-dark-300">
              {user.subscription_status === 'trial'
                ? t('admin.bulkActions.statuses.trial')
                : user.subscription_status || '-'}
            </span>
          );
        },
      },
      {
        id: 'balance',
        accessorKey: 'balance_rubles',
        header: t('admin.bulkActions.columns.balance'),
        size: 100,
        cell: ({ getValue }) => (
          <span className="text-xs font-medium text-dark-200">
            {formatWithCurrency(getValue() as number)}
          </span>
        ),
      },
      {
        id: 'days_remaining',
        header: t('admin.bulkActions.columns.daysRemaining'),
        size: 80,
        cell: ({ row }) => {
          const user = row.original;
          if (!user.subscription_end_date) {
            return <span className="text-xs text-dark-500">-</span>;
          }
          const end = new Date(user.subscription_end_date);
          const now = new Date();
          const days = Math.max(
            0,
            Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
          );
          return (
            <span
              className={cn(
                'text-xs font-medium tabular-nums',
                days === 0 ? 'text-error-400' : days <= 3 ? 'text-warning-400' : 'text-dark-300',
              )}
            >
              {days}
            </span>
          );
        },
      },
      {
        id: 'promo_group',
        accessorFn: (row) => row.promo_group_name,
        header: t('admin.bulkActions.columns.promoGroup'),
        size: 120,
        cell: ({ getValue }) => {
          const name = getValue() as string | null;
          return name ? (
            <span className="inline-flex rounded-lg border border-accent-500/20 bg-accent-500/5 px-2 py-0.5 text-[10px] font-medium text-accent-400">
              {name}
            </span>
          ) : (
            <span className="text-xs text-dark-500">-</span>
          );
        },
      },
      {
        id: 'total_spent',
        accessorKey: 'total_spent_kopeks',
        header: t('admin.bulkActions.columns.spent'),
        size: 100,
        cell: ({ getValue }) => {
          const kopeks = getValue() as number;
          return (
            <span className="text-xs text-dark-300">
              {kopeks > 0 ? formatWithCurrency(kopeks / 100) : '-'}
            </span>
          );
        },
      },
    ],
    [t, formatWithCurrency],
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    getRowId: (row) => String(row.id),
  });

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // ---- Status filter options ----
  const statusOptions: DropdownOption[] = [
    { value: '', label: t('admin.bulkActions.filters.allStatuses') },
    { value: 'active', label: t('admin.bulkActions.statuses.active') },
    { value: 'expired', label: t('admin.bulkActions.statuses.expired') },
    { value: 'trial', label: t('admin.bulkActions.statuses.trial') },
    { value: 'limited', label: t('admin.bulkActions.statuses.limited') },
    { value: 'disabled', label: t('admin.bulkActions.statuses.disabled') },
  ];

  const tariffOptions: DropdownOption[] = [
    { value: '', label: t('admin.bulkActions.filters.allTariffs') },
    ...tariffs.map((tt) => ({ value: String(tt.id), label: tt.name })),
  ];

  const promoGroupOptions: DropdownOption[] = [
    { value: '', label: t('admin.bulkActions.filters.allGroups') },
    ...promoGroups.map((pg) => ({ value: String(pg.id), label: pg.name })),
  ];

  return (
    <div className="relative animate-fade-in">
      <ProgressBar loading={loading} />

      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!capabilities.hasBackButton && (
            <button
              onClick={() => navigate('/admin')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-dark-700 bg-dark-800 transition-colors hover:border-dark-600"
              aria-label={t('common.back')}
            >
              <BackIcon />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-dark-100">{t('admin.bulkActions.title')}</h1>
              <span className="rounded-lg border border-dark-700 bg-dark-800 px-2 py-0.5 text-xs font-medium tabular-nums text-dark-400">
                {total.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-dark-400">{t('admin.bulkActions.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-lg p-2 text-dark-400 transition-colors hover:bg-dark-700 hover:text-dark-200 disabled:opacity-50"
          aria-label={t('common.refresh')}
        >
          <RefreshIcon className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t('admin.bulkActions.filters.search')}
              className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 pl-10 pr-4 text-sm text-dark-100 outline-none transition-colors placeholder:text-dark-500 focus:border-accent-500/40 focus:shadow-[0_0_0_3px_rgba(var(--color-accent-500),0.08)]"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500">
              <SearchIcon />
            </div>
          </div>
        </form>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <DropdownSelect
            value={statusFilter}
            options={statusOptions}
            onChange={handleStatusFilterChange}
          />
          <DropdownSelect
            value={tariffFilter}
            options={tariffOptions}
            onChange={handleTariffFilterChange}
          />
          <DropdownSelect
            value={promoGroupFilter}
            options={promoGroupOptions}
            onChange={handlePromoGroupFilterChange}
          />
        </div>
      </div>

      {/* Table */}
      {loading && users.length === 0 ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-dark-700/50 bg-dark-800/40 text-dark-500">
            <SearchIcon />
          </div>
          <p className="text-sm font-medium text-dark-300">{t('admin.bulkActions.noResults')}</p>
        </div>
      ) : (
        <div
          className={cn(
            'transition-opacity duration-200',
            loading && users.length > 0 && 'opacity-60',
          )}
        >
          <div className="overflow-x-auto rounded-xl border border-dark-700">
            <table className="w-full text-left text-sm">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-dark-700 bg-dark-800/80">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="whitespace-nowrap px-3 py-2.5 text-xs font-medium text-dark-400"
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className={cn(
                      'border-b border-dark-700/50 transition-colors',
                      row.getIsSelected() ? 'bg-accent-500/5' : 'hover:bg-dark-800/50',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2.5"
                        style={{ width: cell.column.getSize() }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-dark-400">
            {offset + 1}&ndash;{Math.min(offset + limit, total)} / {total}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setOffset(Math.max(0, offset - limit));
                setRowSelection({});
              }}
              disabled={offset === 0}
              className="rounded-lg border border-dark-700 bg-dark-800 p-2 transition-colors hover:bg-dark-700 disabled:opacity-50"
              aria-label={t('common.back')}
            >
              <ChevronLeftIcon />
            </button>
            <span className="px-3 py-2 text-sm text-dark-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => {
                setOffset(offset + limit);
                setRowSelection({});
              }}
              disabled={offset + limit >= total}
              className="rounded-lg border border-dark-700 bg-dark-800 p-2 transition-colors hover:bg-dark-700 disabled:opacity-50"
              aria-label={t('common.next')}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}

      {/* Floating action bar */}
      <FloatingActionBar selectedCount={selectedUserIds.length} onAction={handleOpenAction} />

      {/* Action modal */}
      <ActionModal
        modal={modal}
        selectedCount={selectedUserIds.length}
        tariffs={tariffs}
        promoGroups={promoGroups}
        onClose={handleCloseModal}
        onExecute={handleExecuteAction}
      />

      {/* Bottom spacer when action bar is visible */}
      {selectedUserIds.length > 0 && <div className="h-20" />}
    </div>
  );
}
