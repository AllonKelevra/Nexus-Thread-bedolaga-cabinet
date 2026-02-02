import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import {
  campaignsApi,
  CampaignListItem,
  CampaignDetail,
  CampaignUpdateRequest,
  CampaignBonusType,
  ServerSquadInfo,
  TariffListItem,
} from '../api/campaigns';
import { AdminBackButton } from '../components/admin';
import { createNumberInputHandler, toNumber } from '../utils/inputHelpers';

// Icons

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const EditIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
    />
  </svg>
);

const TrashIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
    />
  </svg>
);

const CheckIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const XIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChartIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  </svg>
);

// Bonus type labels and colors
const bonusTypeConfig: Record<
  CampaignBonusType,
  { labelKey: string; color: string; bgColor: string }
> = {
  balance: {
    labelKey: 'admin.campaigns.bonusType.balance',
    color: 'text-success-400',
    bgColor: 'bg-success-500/20',
  },
  subscription: {
    labelKey: 'admin.campaigns.bonusType.subscription',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/20',
  },
  tariff: {
    labelKey: 'admin.campaigns.bonusType.tariff',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/20',
  },
  none: {
    labelKey: 'admin.campaigns.bonusType.none',
    color: 'text-dark-400',
    bgColor: 'bg-dark-500/20',
  },
};

// Locale mapping for formatting
const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', zh: 'zh-CN', fa: 'fa-IR' };

// Format number as rubles
const formatRubles = (kopeks: number) => {
  const locale = localeMap[i18n.language] || 'ru-RU';
  return (
    (kopeks / 100).toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) +
    ' ₽'
  );
};

// Campaign Edit Modal
interface CampaignModalProps {
  campaign: CampaignDetail;
  servers: ServerSquadInfo[];
  tariffs: TariffListItem[];
  onSave: (data: CampaignUpdateRequest) => void;
  onClose: () => void;
  isLoading?: boolean;
}

function CampaignModal({
  campaign,
  servers,
  tariffs,
  onSave,
  onClose,
  isLoading,
}: CampaignModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState(campaign.name || '');
  const [startParameter, setStartParameter] = useState(campaign.start_parameter || '');
  const [bonusType, setBonusType] = useState<CampaignBonusType>(campaign.bonus_type || 'balance');
  const [isActive, setIsActive] = useState(campaign.is_active ?? true);

  // Balance bonus
  const [balanceBonusRubles, setBalanceBonusRubles] = useState<number | ''>(
    (campaign.balance_bonus_kopeks || 0) / 100,
  );

  // Subscription bonus
  const [subscriptionDays, setSubscriptionDays] = useState<number | ''>(
    campaign.subscription_duration_days || 7,
  );
  const [subscriptionTraffic, setSubscriptionTraffic] = useState<number | ''>(
    campaign.subscription_traffic_gb || 10,
  );
  const [subscriptionDevices, setSubscriptionDevices] = useState<number | ''>(
    campaign.subscription_device_limit || 1,
  );
  const [selectedSquads, setSelectedSquads] = useState<string[]>(
    campaign.subscription_squads || [],
  );

  // Tariff bonus
  const [tariffId, setTariffId] = useState<number | null>(campaign.tariff_id || null);
  const [tariffDays, setTariffDays] = useState<number | ''>(campaign.tariff_duration_days || 30);

  const handleSubmit = () => {
    const data: CampaignUpdateRequest = {
      name,
      start_parameter: startParameter,
      bonus_type: bonusType,
      is_active: isActive,
    };

    if (bonusType === 'balance') {
      data.balance_bonus_kopeks = Math.round(toNumber(balanceBonusRubles) * 100);
    } else if (bonusType === 'subscription') {
      data.subscription_duration_days = toNumber(subscriptionDays, 7);
      data.subscription_traffic_gb = toNumber(subscriptionTraffic, 10);
      data.subscription_device_limit = toNumber(subscriptionDevices, 1);
      data.subscription_squads = selectedSquads;
    } else if (bonusType === 'tariff') {
      data.tariff_id = tariffId || undefined;
      data.tariff_duration_days = toNumber(tariffDays, 30);
    }

    onSave(data);
  };

  const toggleServer = (uuid: string) => {
    setSelectedSquads((prev) =>
      prev.includes(uuid) ? prev.filter((s) => s !== uuid) : [...prev, uuid],
    );
  };

  const isValid = name.trim() && startParameter.trim() && /^[a-zA-Z0-9_-]+$/.test(startParameter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-dark-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dark-700 p-4">
          <h2 className="text-lg font-semibold text-dark-100">
            {t('admin.campaigns.modal.editTitle')}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 transition-colors hover:bg-dark-700">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm text-dark-300">
              {t('admin.campaigns.form.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
              placeholder={t('admin.campaigns.form.namePlaceholder')}
            />
          </div>

          {/* Start Parameter */}
          <div>
            <label className="mb-1 block text-sm text-dark-300">
              {t('admin.campaigns.form.startParameter')}
            </label>
            <input
              type="text"
              value={startParameter}
              onChange={(e) => setStartParameter(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
              placeholder="instagram_jan2024"
            />
            <p className="mt-1 text-xs text-dark-500">
              {t('admin.campaigns.form.startParameterHint')}
            </p>
          </div>

          {/* Bonus Type */}
          <div>
            <label className="mb-2 block text-sm text-dark-300">
              {t('admin.campaigns.form.bonusType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(bonusTypeConfig) as CampaignBonusType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBonusType(type)}
                  className={`rounded-lg p-3 text-left transition-colors ${
                    bonusType === type
                      ? `${bonusTypeConfig[type].bgColor} border border-current ${bonusTypeConfig[type].color}`
                      : 'border border-dark-600 bg-dark-700 text-dark-300 hover:border-dark-500'
                  }`}
                >
                  <span className="text-sm font-medium">{t(bonusTypeConfig[type].labelKey)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bonus Settings */}
          {bonusType === 'balance' && (
            <div className="rounded-lg border border-success-500/30 bg-success-500/10 p-4">
              <label className="mb-2 block text-sm font-medium text-success-400">
                {t('admin.campaigns.form.balanceBonus')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={balanceBonusRubles}
                  onChange={createNumberInputHandler(setBalanceBonusRubles, 0)}
                  className="w-32 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-success-500 focus:outline-none"
                  min={0}
                  step={1}
                />
                <span className="text-dark-400">₽</span>
              </div>
            </div>
          )}

          {bonusType === 'subscription' && (
            <div className="space-y-3 rounded-lg border border-accent-500/30 bg-accent-500/10 p-4">
              <label className="block text-sm font-medium text-accent-400">
                {t('admin.campaigns.form.trialSubscription')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-dark-500">
                    {t('admin.campaigns.form.days')}
                  </label>
                  <input
                    type="number"
                    value={subscriptionDays}
                    onChange={createNumberInputHandler(setSubscriptionDays, 1)}
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
                    min={1}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-dark-500">
                    {t('admin.campaigns.form.trafficGb')}
                  </label>
                  <input
                    type="number"
                    value={subscriptionTraffic}
                    onChange={createNumberInputHandler(setSubscriptionTraffic, 0)}
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
                    min={0}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-dark-500">
                    {t('admin.campaigns.form.devices')}
                  </label>
                  <input
                    type="number"
                    value={subscriptionDevices}
                    onChange={createNumberInputHandler(setSubscriptionDevices, 1)}
                    className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
                    min={1}
                  />
                </div>
              </div>
              {servers.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs text-dark-500">
                    {t('admin.campaigns.form.servers')}
                  </label>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {servers.map((server) => (
                      <button
                        key={server.id}
                        type="button"
                        onClick={() => toggleServer(server.squad_uuid)}
                        className={`flex w-full items-center gap-2 rounded-lg p-2 text-left transition-colors ${
                          selectedSquads.includes(server.squad_uuid)
                            ? 'bg-accent-500/20 text-accent-300'
                            : 'bg-dark-600 text-dark-300 hover:bg-dark-500'
                        }`}
                      >
                        <div
                          className={`flex h-4 w-4 items-center justify-center rounded ${
                            selectedSquads.includes(server.squad_uuid)
                              ? 'bg-accent-500 text-white'
                              : 'bg-dark-500'
                          }`}
                        >
                          {selectedSquads.includes(server.squad_uuid) && <CheckIcon />}
                        </div>
                        <span className="text-sm">{server.display_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {bonusType === 'tariff' && (
            <div className="space-y-3 rounded-lg border border-accent-500/30 bg-accent-500/10 p-4">
              <label className="block text-sm font-medium text-accent-400">
                {t('admin.campaigns.form.tariff')}
              </label>
              <div>
                <label className="mb-1 block text-xs text-dark-500">
                  {t('admin.campaigns.form.selectTariff')}
                </label>
                <select
                  value={tariffId || ''}
                  onChange={(e) => setTariffId(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
                >
                  <option value="">{t('admin.campaigns.form.notSelected')}</option>
                  {tariffs.map((tariff) => (
                    <option key={tariff.id} value={tariff.id}>
                      {tariff.name} (
                      {t('admin.campaigns.form.tariffOption', {
                        traffic: tariff.traffic_limit_gb,
                        devices: tariff.device_limit,
                      })}
                      )
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-dark-500">
                  {t('admin.campaigns.form.durationDays')}
                </label>
                <input
                  type="number"
                  value={tariffDays}
                  onChange={createNumberInputHandler(setTariffDays, 1)}
                  className="w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 focus:border-accent-500 focus:outline-none"
                  min={1}
                />
              </div>
            </div>
          )}

          {bonusType === 'none' && (
            <div className="rounded-lg border border-dark-500/30 bg-dark-500/10 p-4">
              <p className="text-sm text-dark-400">
                {t('admin.campaigns.form.noBonusDescription')}
              </p>
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center justify-between rounded-lg bg-dark-700 p-3">
            <span className="text-sm text-dark-300">{t('admin.campaigns.form.active')}</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative h-6 w-10 rounded-full transition-colors ${
                isActive ? 'bg-accent-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  isActive ? 'left-5' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-dark-700 p-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-dark-300 transition-colors hover:text-dark-100"
          >
            {t('admin.campaigns.form.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="rounded-lg bg-accent-500 px-4 py-2 text-white transition-colors hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? t('admin.campaigns.form.saving') : t('admin.campaigns.form.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function AdminCampaigns() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editingCampaign, setEditingCampaign] = useState<CampaignDetail | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // Queries
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => campaignsApi.getCampaigns(true),
  });

  const { data: overview } = useQuery({
    queryKey: ['admin-campaigns-overview'],
    queryFn: () => campaignsApi.getOverview(),
  });

  const { data: servers = [] } = useQuery({
    queryKey: ['admin-campaigns-servers'],
    queryFn: () => campaignsApi.getAvailableServers(),
  });

  const { data: tariffs = [] } = useQuery({
    queryKey: ['admin-campaigns-tariffs'],
    queryFn: () => campaignsApi.getAvailableTariffs(),
  });

  // Mutations
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CampaignUpdateRequest }) =>
      campaignsApi.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      setEditingCampaign(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: campaignsApi.deleteCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns-overview'] });
      setDeleteConfirm(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: campaignsApi.toggleCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });

  const handleEdit = async (campaignId: number) => {
    try {
      const detail = await campaignsApi.getCampaign(campaignId);
      setEditingCampaign(detail);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    }
  };

  const handleSave = (data: CampaignUpdateRequest) => {
    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data });
    }
  };

  const handleCloseModal = () => {
    setEditingCampaign(null);
  };

  const campaigns = campaignsData?.campaigns || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackButton />
          <div>
            <h1 className="text-xl font-semibold text-dark-100">{t('admin.campaigns.title')}</h1>
            <p className="text-sm text-dark-400">{t('admin.campaigns.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/campaigns/create')}
          className="flex items-center justify-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-white transition-colors hover:bg-accent-600"
        >
          <PlusIcon />
          {t('admin.campaigns.createButton')}
        </button>
      </div>

      {/* Overview */}
      {overview && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-dark-100">{overview.total}</div>
            <div className="text-sm text-dark-400">
              {t('admin.campaigns.overview.totalCampaigns')}
            </div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-success-400">{overview.active}</div>
            <div className="text-sm text-dark-400">{t('admin.campaigns.overview.active')}</div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-accent-400">{overview.total_registrations}</div>
            <div className="text-sm text-dark-400">
              {t('admin.campaigns.overview.registrations')}
            </div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-success-400">
              {formatRubles(overview.total_balance_issued_kopeks)}
            </div>
            <div className="text-sm text-dark-400">
              {t('admin.campaigns.overview.bonusesIssued')}
            </div>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-dark-400">{t('admin.campaigns.noData')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign: CampaignListItem) => (
            <div
              key={campaign.id}
              className={`rounded-xl border bg-dark-800 p-4 transition-colors ${
                campaign.is_active ? 'border-dark-700' : 'border-dark-700/50 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate font-medium text-dark-100">{campaign.name}</h3>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${bonusTypeConfig[campaign.bonus_type].bgColor} ${bonusTypeConfig[campaign.bonus_type].color}`}
                    >
                      {t(bonusTypeConfig[campaign.bonus_type].labelKey)}
                    </span>
                    {!campaign.is_active && (
                      <span className="rounded bg-dark-600 px-2 py-0.5 text-xs text-dark-400">
                        {t('admin.campaigns.table.inactive')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-400">
                    <span className="font-mono text-xs">?start={campaign.start_parameter}</span>
                    <span>
                      {t('admin.campaigns.table.registrations', {
                        count: campaign.registrations_count,
                      })}
                    </span>
                    <span>
                      {t('admin.campaigns.table.revenue', {
                        amount: formatRubles(campaign.total_revenue_kopeks),
                      })}
                    </span>
                    <span>
                      {t('admin.campaigns.table.conversion', { rate: campaign.conversion_rate })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Stats */}
                  <button
                    onClick={() => navigate(`/admin/campaigns/${campaign.id}/stats`)}
                    className="rounded-lg bg-dark-700 p-2 text-dark-300 transition-colors hover:bg-dark-600 hover:text-dark-100"
                    title={t('admin.campaigns.table.statistics')}
                  >
                    <ChartIcon />
                  </button>

                  {/* Toggle Active */}
                  <button
                    onClick={() => toggleMutation.mutate(campaign.id)}
                    className={`rounded-lg p-2 transition-colors ${
                      campaign.is_active
                        ? 'bg-success-500/20 text-success-400 hover:bg-success-500/30'
                        : 'bg-dark-700 text-dark-400 hover:bg-dark-600'
                    }`}
                    title={
                      campaign.is_active
                        ? t('admin.campaigns.table.deactivate')
                        : t('admin.campaigns.table.activate')
                    }
                  >
                    {campaign.is_active ? <CheckIcon /> : <XIcon />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleEdit(campaign.id)}
                    className="rounded-lg bg-dark-700 p-2 text-dark-300 transition-colors hover:bg-dark-600 hover:text-dark-100"
                    title={t('admin.campaigns.table.edit')}
                  >
                    <EditIcon />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteConfirm(campaign.id)}
                    className="rounded-lg bg-dark-700 p-2 text-dark-300 transition-colors hover:bg-error-500/20 hover:text-error-400"
                    title={t('admin.campaigns.table.delete')}
                    disabled={campaign.registrations_count > 0}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingCampaign && (
        <CampaignModal
          campaign={editingCampaign}
          servers={servers}
          tariffs={tariffs}
          onSave={handleSave}
          onClose={handleCloseModal}
          isLoading={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-xl bg-dark-800 p-6">
            <h3 className="mb-2 text-lg font-semibold text-dark-100">
              {t('admin.campaigns.confirm.deleteTitle')}
            </h3>
            <p className="mb-6 text-dark-400">{t('admin.campaigns.confirm.deleteText')}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-dark-300 transition-colors hover:text-dark-100"
              >
                {t('admin.campaigns.confirm.cancel')}
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteConfirm)}
                className="rounded-lg bg-error-500 px-4 py-2 text-white transition-colors hover:bg-error-600"
              >
                {t('admin.campaigns.confirm.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
