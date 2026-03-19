import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { referralNetworkApi } from '@/api/referralNetwork';
import type { ScopeSelection, ScopeType } from '@/types/referralNetwork';

interface ScopeSelectorProps {
  value: ScopeSelection | null;
  onSelect: (selection: ScopeSelection | null) => void;
  className?: string;
}

const SCOPE_TABS: ScopeType[] = ['campaign', 'partner', 'user'];

export function ScopeSelector({ value, onSelect, className }: ScopeSelectorProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ScopeType>(value?.type ?? 'campaign');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedUserQuery, setDebouncedUserQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: scopeOptions, isLoading: isScopeLoading } = useQuery({
    queryKey: ['referral-network', 'scope-options'],
    queryFn: referralNetworkApi.getScopeOptions,
    staleTime: 120_000,
  });

  // Debounce user search
  useEffect(() => {
    if (activeTab !== 'user') return;
    const timer = setTimeout(() => {
      setDebouncedUserQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, activeTab]);

  const { data: userSearchResults, isFetching: isUserSearching } = useQuery({
    queryKey: ['referral-network-search', debouncedUserQuery],
    queryFn: () => referralNetworkApi.search(debouncedUserQuery),
    enabled: activeTab === 'user' && debouncedUserQuery.length >= 2,
    staleTime: 30_000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter campaigns/partners by local search input
  const filteredCampaigns = useMemo(() => {
    if (!scopeOptions) return [];
    const q = searchInput.toLowerCase().trim();
    if (!q) return scopeOptions.campaigns;
    return scopeOptions.campaigns.filter(
      (c) => c.name.toLowerCase().includes(q) || c.start_parameter.toLowerCase().includes(q),
    );
  }, [scopeOptions, searchInput]);

  const filteredPartners = useMemo(() => {
    if (!scopeOptions) return [];
    const q = searchInput.toLowerCase().trim();
    if (!q) return scopeOptions.partners;
    return scopeOptions.partners.filter(
      (p) =>
        p.display_name.toLowerCase().includes(q) ||
        (p.username && p.username.toLowerCase().includes(q)),
    );
  }, [scopeOptions, searchInput]);

  function handleTabChange(tab: ScopeType) {
    setActiveTab(tab);
    setSearchInput('');
    setDebouncedUserQuery('');
    setIsDropdownOpen(true);
    inputRef.current?.focus();
  }

  function handleSelectCampaign(campaign: { id: number; name: string }) {
    onSelect({ type: 'campaign', id: campaign.id, label: campaign.name });
    setIsDropdownOpen(false);
    setSearchInput('');
  }

  function handleSelectPartner(partner: { id: number; display_name: string }) {
    onSelect({ type: 'partner', id: partner.id, label: partner.display_name });
    setIsDropdownOpen(false);
    setSearchInput('');
  }

  function handleSelectUser(user: { id: number; display_name: string }) {
    onSelect({ type: 'user', id: user.id, label: user.display_name });
    setIsDropdownOpen(false);
    setSearchInput('');
  }

  function handleClear() {
    onSelect(null);
    setSearchInput('');
    setDebouncedUserQuery('');
    setIsDropdownOpen(false);
  }

  const tabLabels: Record<ScopeType, string> = {
    campaign: t('admin.referralNetwork.scope.campaign'),
    partner: t('admin.referralNetwork.scope.partner'),
    user: t('admin.referralNetwork.scope.user'),
  };

  const placeholders: Record<ScopeType, string> = {
    campaign: t('admin.referralNetwork.scope.selectCampaign'),
    partner: t('admin.referralNetwork.scope.selectPartner'),
    user: t('admin.referralNetwork.scope.selectUser'),
  };

  // When scope is selected, show compact display
  if (value) {
    return (
      <div className={`flex items-center gap-2 ${className ?? ''}`}>
        <span className="rounded-md bg-accent-500/20 px-2 py-1 text-xs font-medium text-accent-400">
          {tabLabels[value.type]}
        </span>
        <span className="truncate text-sm font-medium text-dark-100">{value.label}</span>
        <button
          onClick={handleClear}
          aria-label={t('admin.referralNetwork.search.clear')}
          className="shrink-0 rounded-md p-1 text-dark-500 transition-colors hover:bg-dark-800 hover:text-dark-300"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  const isLoading = activeTab === 'user' ? isUserSearching : isScopeLoading;

  return (
    <div ref={containerRef} className={`relative ${className ?? ''}`}>
      {/* Tab bar + search input row */}
      <div className="flex items-center gap-2">
        {/* Tabs */}
        <div className="flex shrink-0 rounded-lg border border-dark-700/50 bg-dark-800 p-0.5">
          {SCOPE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-accent-500/20 text-accent-400'
                  : 'text-dark-400 hover:text-dark-200'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-0 flex-1">
          <svg
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dark-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchInput}
            maxLength={200}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (!isDropdownOpen) setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder={placeholders[activeTab]}
            className="w-full rounded-lg border border-dark-700/50 bg-dark-800/50 py-1.5 pl-8 pr-8 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500/50 focus:ring-1 focus:ring-accent-500/30"
          />
          {isLoading && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-dark-600 border-t-accent-400" />
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isDropdownOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-dark-700/50 bg-dark-800 shadow-xl backdrop-blur-md">
          {activeTab === 'campaign' && renderCampaignList()}
          {activeTab === 'partner' && renderPartnerList()}
          {activeTab === 'user' && renderUserList()}
        </div>
      )}
    </div>
  );

  function renderCampaignList() {
    if (isScopeLoading) {
      return (
        <div className="flex items-center justify-center px-4 py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-dark-600 border-t-accent-400" />
        </div>
      );
    }

    if (filteredCampaigns.length === 0) {
      return (
        <div className="px-4 py-3 text-center text-sm text-dark-500">
          {t('admin.referralNetwork.scope.noResults')}
        </div>
      );
    }

    return filteredCampaigns.map((campaign) => (
      <button
        key={campaign.id}
        onClick={() => handleSelectCampaign(campaign)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-dark-700/50"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-500/20 text-xs font-medium text-success-400">
          C
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-dark-100">{campaign.name}</p>
          <p className="truncate text-xs text-dark-500">
            {campaign.start_parameter}
            {' / '}
            {campaign.direct_users} {t('admin.referralNetwork.scope.users')}
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
            campaign.is_active
              ? 'bg-success-500/20 text-success-400'
              : 'bg-dark-700/50 text-dark-400'
          }`}
        >
          {campaign.is_active
            ? t('admin.referralNetwork.scope.active')
            : t('admin.referralNetwork.scope.inactive')}
        </span>
      </button>
    ));
  }

  function renderPartnerList() {
    if (isScopeLoading) {
      return (
        <div className="flex items-center justify-center px-4 py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-dark-600 border-t-accent-400" />
        </div>
      );
    }

    if (filteredPartners.length === 0) {
      return (
        <div className="px-4 py-3 text-center text-sm text-dark-500">
          {t('admin.referralNetwork.scope.noResults')}
        </div>
      );
    }

    return filteredPartners.map((partner) => (
      <button
        key={partner.id}
        onClick={() => handleSelectPartner(partner)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-dark-700/50"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-500/20 text-xs font-medium text-warning-400">
          P
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-dark-100">{partner.display_name}</p>
          <p className="truncate text-xs text-dark-500">
            {partner.username ? `@${partner.username}` : ''}
            {partner.username ? ' / ' : ''}
            {partner.campaign_count} {t('admin.referralNetwork.scope.campaigns')}
          </p>
        </div>
      </button>
    ));
  }

  function renderUserList() {
    if (debouncedUserQuery.length < 2) {
      return (
        <div className="px-4 py-3 text-center text-sm text-dark-500">
          {t('admin.referralNetwork.scope.selectUser')}
        </div>
      );
    }

    if (isUserSearching) {
      return (
        <div className="flex items-center justify-center px-4 py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-dark-600 border-t-accent-400" />
        </div>
      );
    }

    const users = userSearchResults?.users ?? [];

    if (users.length === 0) {
      return (
        <div className="px-4 py-3 text-center text-sm text-dark-500">
          {t('admin.referralNetwork.scope.noResults')}
        </div>
      );
    }

    return users.map((user) => (
      <button
        key={user.id}
        onClick={() => handleSelectUser(user)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-dark-700/50"
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-500/20 text-xs font-medium text-accent-400">
          U
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-dark-100">{user.display_name}</p>
          <p className="truncate text-xs text-dark-500">
            {user.username ? `@${user.username}` : ''}
            {user.tg_id ? ` #${user.tg_id}` : ''}
          </p>
        </div>
        {user.is_partner && (
          <span className="shrink-0 rounded bg-warning-500/20 px-1.5 py-0.5 text-[10px] font-medium text-warning-400">
            {t('admin.referralNetwork.user.partner')}
          </span>
        )}
      </button>
    ));
  }
}
