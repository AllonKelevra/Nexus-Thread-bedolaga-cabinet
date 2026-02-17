import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  partnerApi,
  type AdminPartnerItem,
  type AdminPartnerApplicationItem,
} from '../api/partners';
import { AdminBackButton } from '../components/admin';
import { useCurrency } from '../hooks/useCurrency';

export default function AdminPartners() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatWithCurrency } = useCurrency();

  const [activeTab, setActiveTab] = useState<'partners' | 'applications'>('partners');

  // Approve dialog state
  const [approveDialog, setApproveDialog] = useState<AdminPartnerApplicationItem | null>(null);
  const [approveCommission, setApproveCommission] = useState('10');

  // Reject dialog state
  const [rejectDialog, setRejectDialog] = useState<AdminPartnerApplicationItem | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  // Queries
  const { data: stats } = useQuery({
    queryKey: ['admin-partner-stats'],
    queryFn: () => partnerApi.getStats(),
  });

  const { data: partnersData, isLoading: partnersLoading } = useQuery({
    queryKey: ['admin-partners'],
    queryFn: () => partnerApi.getPartners(),
  });

  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['admin-partner-applications'],
    queryFn: () => partnerApi.getApplications({ status: 'pending' }),
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, commission }: { id: number; commission: number }) =>
      partnerApi.approveApplication(id, { commission_percent: commission }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partners'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-stats'] });
      setApproveDialog(null);
      setApproveCommission('10');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      partnerApi.rejectApplication(id, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-partner-applications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-partner-stats'] });
      setRejectDialog(null);
      setRejectComment('');
    },
  });

  const partners = partnersData?.items || [];
  const applications = applicationsData?.items || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <AdminBackButton to="/admin" />
        <div>
          <h1 className="text-xl font-semibold text-dark-100">{t('admin.partners.title')}</h1>
          <p className="text-sm text-dark-400">{t('admin.partners.subtitle')}</p>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-dark-100">{stats.total_partners}</div>
            <div className="text-sm text-dark-400">{t('admin.partners.totalPartners')}</div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-accent-400">{stats.pending_applications}</div>
            <div className="text-sm text-dark-400">{t('admin.partners.pendingApplications')}</div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-dark-100">{stats.total_referrals}</div>
            <div className="text-sm text-dark-400">{t('admin.partners.totalReferrals')}</div>
          </div>
          <div className="rounded-xl border border-dark-700 bg-dark-800 p-4">
            <div className="text-2xl font-bold text-success-400">
              {formatWithCurrency(stats.total_earnings_kopeks / 100)}
            </div>
            <div className="text-sm text-dark-400">{t('admin.partners.totalEarnings')}</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-lg border border-dark-700 bg-dark-800/40 p-1">
        <button
          onClick={() => setActiveTab('partners')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'partners'
              ? 'bg-dark-700 text-dark-100'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          {t('admin.partners.tabs.partners')}
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'applications'
              ? 'bg-dark-700 text-dark-100'
              : 'text-dark-400 hover:text-dark-200'
          }`}
        >
          {t('admin.partners.tabs.applications')}
          {applications.length > 0 && (
            <span className="ml-2 rounded-full bg-accent-500/20 px-2 py-0.5 text-xs text-accent-400">
              {applications.length}
            </span>
          )}
        </button>
      </div>

      {/* Partners Tab */}
      {activeTab === 'partners' && (
        <>
          {partnersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          ) : partners.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-dark-400">{t('admin.partners.noPartners')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((partner: AdminPartnerItem) => (
                <button
                  key={partner.user_id}
                  onClick={() => navigate(`/admin/partners/${partner.user_id}`)}
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 p-4 text-left transition-colors hover:border-dark-600"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-medium text-dark-100">
                          {partner.first_name || partner.username || `#${partner.user_id}`}
                        </h3>
                        {partner.username && (
                          <span className="text-sm text-dark-500">@{partner.username}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-dark-400">
                        <span>
                          {t('admin.partners.commission', {
                            percent: partner.commission_percent ?? 0,
                          })}
                        </span>
                        <span>
                          {t('admin.partners.referrals', { count: partner.total_referrals })}
                        </span>
                        <span className="text-success-400">
                          {formatWithCurrency(partner.total_earnings_kopeks / 100)}
                        </span>
                      </div>
                    </div>
                    <svg
                      className="h-5 w-5 shrink-0 text-dark-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <>
          {applicationsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          ) : applications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-dark-400">{t('admin.partners.noApplications')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app: AdminPartnerApplicationItem) => (
                <div key={app.id} className="rounded-xl border border-dark-700 bg-dark-800 p-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-medium text-dark-100">
                          {app.first_name || app.username || `#${app.user_id}`}
                        </h3>
                        {app.username && (
                          <span className="text-sm text-dark-500">@{app.username}</span>
                        )}
                      </div>
                      {app.company_name && (
                        <div className="text-sm text-dark-300">{app.company_name}</div>
                      )}
                    </div>
                  </div>

                  {/* Application details */}
                  <div className="mb-3 space-y-1 text-sm text-dark-400">
                    {app.website_url && (
                      <div>
                        {t('admin.partners.applicationFields.website')}: {app.website_url}
                      </div>
                    )}
                    {app.telegram_channel && (
                      <div>
                        {t('admin.partners.applicationFields.channel')}: {app.telegram_channel}
                      </div>
                    )}
                    {app.description && (
                      <div>
                        {t('admin.partners.applicationFields.description')}: {app.description}
                      </div>
                    )}
                    {app.expected_monthly_referrals != null && (
                      <div>
                        {t('admin.partners.applicationFields.expectedReferrals')}:{' '}
                        {app.expected_monthly_referrals}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setApproveDialog(app)}
                      className="flex-1 rounded-lg bg-success-500/20 px-4 py-2 text-sm font-medium text-success-400 transition-colors hover:bg-success-500/30"
                    >
                      {t('admin.partners.actions.approve')}
                    </button>
                    <button
                      onClick={() => setRejectDialog(app)}
                      className="flex-1 rounded-lg bg-error-500/20 px-4 py-2 text-sm font-medium text-error-400 transition-colors hover:bg-error-500/30"
                    >
                      {t('admin.partners.actions.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Approve Dialog */}
      {approveDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setApproveDialog(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-dark-800 p-6">
            <h3 className="mb-2 text-lg font-semibold text-dark-100">
              {t('admin.partners.approveDialog.title')}
            </h3>
            <p className="mb-4 text-sm text-dark-400">
              {t('admin.partners.approveDialog.description', {
                name:
                  approveDialog.first_name || approveDialog.username || `#${approveDialog.user_id}`,
              })}
            </p>
            <label className="mb-1 block text-sm font-medium text-dark-300">
              {t('admin.partners.approveDialog.commissionLabel')}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={approveCommission}
              onChange={(e) => setApproveCommission(e.target.value)}
              className="mb-6 w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 outline-none focus:border-accent-500"
              placeholder="10"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setApproveDialog(null);
                  setApproveCommission('10');
                }}
                className="px-4 py-2 text-dark-300 transition-colors hover:text-dark-100"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() =>
                  approveMutation.mutate({
                    id: approveDialog.id,
                    commission: Number(approveCommission),
                  })
                }
                disabled={approveMutation.isPending || !approveCommission}
                className="rounded-lg bg-success-500 px-4 py-2 text-white transition-colors hover:bg-success-600 disabled:opacity-50"
              >
                {approveMutation.isPending
                  ? t('common.saving')
                  : t('admin.partners.actions.approve')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Dialog */}
      {rejectDialog !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setRejectDialog(null)} />
          <div className="relative w-full max-w-sm rounded-xl bg-dark-800 p-6">
            <h3 className="mb-2 text-lg font-semibold text-dark-100">
              {t('admin.partners.rejectDialog.title')}
            </h3>
            <p className="mb-4 text-sm text-dark-400">
              {t('admin.partners.rejectDialog.description', {
                name:
                  rejectDialog.first_name || rejectDialog.username || `#${rejectDialog.user_id}`,
              })}
            </p>
            <label className="mb-1 block text-sm font-medium text-dark-300">
              {t('admin.partners.rejectDialog.commentLabel')}
            </label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              className="mb-6 w-full rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-dark-100 outline-none focus:border-accent-500"
              rows={3}
              placeholder={t('admin.partners.rejectDialog.commentPlaceholder')}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectDialog(null);
                  setRejectComment('');
                }}
                className="px-4 py-2 text-dark-300 transition-colors hover:text-dark-100"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() =>
                  rejectMutation.mutate({
                    id: rejectDialog.id,
                    comment: rejectComment || undefined,
                  })
                }
                disabled={rejectMutation.isPending}
                className="rounded-lg bg-error-500 px-4 py-2 text-white transition-colors hover:bg-error-600 disabled:opacity-50"
              >
                {rejectMutation.isPending ? t('common.saving') : t('admin.partners.actions.reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
