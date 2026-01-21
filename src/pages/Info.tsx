import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import DOMPurify from 'dompurify'
import { infoApi, FaqPage } from '../api/info'
import { promoApi, LoyaltyTierInfo } from '../api/promo'

const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
)

const QuestionIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
)

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
)

const ShieldIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
)

const StarIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
)

const ChevronIcon = ({ expanded }: { expanded: boolean }) => (
  <svg
    className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
)

type TabType = 'faq' | 'rules' | 'privacy' | 'offer' | 'loyalty'

// Sanitize HTML content to prevent XSS
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span', 'div'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
  })
}

// Convert plain text to HTML with proper formatting
const formatContent = (content: string): string => {
  if (!content) return ''

  // Check if content already has HTML tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content)

  if (hasHtmlTags) {
    return sanitizeHtml(content)
  }

  // Convert plain text to formatted HTML
  const result = content
    .split(/\n\n+/) // Split by double newlines (paragraphs)
    .map(paragraph => {
      // Check if it's a header (starts with # or numeric like "1.")
      if (/^#{1,4}\s/.test(paragraph)) {
        const level = paragraph.match(/^(#{1,4})/)?.[1].length || 1
        const text = paragraph.replace(/^#{1,4}\s*/, '')
        return `<h${level}>${text}</h${level}>`
      }

      // Check for list items
      if (/^[-•]\s/.test(paragraph) || /^\d+[.)]\s/.test(paragraph)) {
        const lines = paragraph.split('\n')
        const isOrdered = /^\d+[.)]\s/.test(lines[0])
        const listItems = lines
          .map(line => line.replace(/^[-•]\s*/, '').replace(/^\d+[.)]\s*/, ''))
          .filter(line => line.trim())
          .map(line => `<li>${line}</li>`)
          .join('')
        return isOrdered ? `<ol>${listItems}</ol>` : `<ul>${listItems}</ul>`
      }

      // Regular paragraph - handle single line breaks within
      const formattedParagraph = paragraph
        .split('\n')
        .join('<br/>')

      return `<p>${formattedParagraph}</p>`
    })
    .join('')

  return sanitizeHtml(result)
}

export default function Info() {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<TabType>('faq')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const { data: faqPages, isLoading: faqLoading } = useQuery({
    queryKey: ['faq-pages'],
    queryFn: infoApi.getFaqPages,
    enabled: activeTab === 'faq',
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: rules, isLoading: rulesLoading } = useQuery({
    queryKey: ['rules'],
    queryFn: infoApi.getRules,
    enabled: activeTab === 'rules',
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: privacy, isLoading: privacyLoading } = useQuery({
    queryKey: ['privacy-policy'],
    queryFn: infoApi.getPrivacyPolicy,
    enabled: activeTab === 'privacy',
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: offer, isLoading: offerLoading } = useQuery({
    queryKey: ['public-offer'],
    queryFn: infoApi.getPublicOffer,
    enabled: activeTab === 'offer',
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['loyalty-tiers'],
    queryFn: promoApi.getLoyaltyTiers,
    enabled: activeTab === 'loyalty',
    staleTime: 0,
    refetchOnMount: 'always',
  })

  const tabs = [
    { id: 'faq' as TabType, label: t('info.faq'), icon: QuestionIcon },
    { id: 'rules' as TabType, label: t('info.rules'), icon: DocumentIcon },
    { id: 'privacy' as TabType, label: t('info.privacy'), icon: ShieldIcon },
    { id: 'offer' as TabType, label: t('info.offer'), icon: DocumentIcon },
    { id: 'loyalty' as TabType, label: t('info.loyalty'), icon: StarIcon },
  ]

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const renderContent = () => {
    if (activeTab === 'faq') {
      if (faqLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      if (!faqPages || faqPages.length === 0) {
        return (
          <div className="text-center py-8 text-dark-400">
            {t('info.noFaq')}
          </div>
        )
      }

      return (
        <div className="space-y-2">
          {faqPages.map((faq: FaqPage) => (
            <div key={faq.id} className="bento-card p-0 overflow-hidden">
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-dark-800/50 transition-colors"
              >
                <span className="font-medium">{faq.title}</span>
                <ChevronIcon expanded={expandedFaq === faq.id} />
              </button>
              {expandedFaq === faq.id && (
                <div className="px-4 pb-4 text-dark-300 prose prose-invert max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: formatContent(faq.content) }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (activeTab === 'rules') {
      if (rulesLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      if (!rules?.content) {
        return (
          <div className="text-center py-8 text-dark-400">
            {t('info.noContent')}
          </div>
        )
      }

      return (
        <div className="bento-card prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatContent(rules.content) }} />
          {rules.updated_at && (
            <p className="text-sm text-dark-400 mt-6 pt-4 border-t border-dark-700">
              {t('info.updatedAt')}: {new Date(rules.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }

    if (activeTab === 'privacy') {
      if (privacyLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      if (!privacy?.content) {
        return (
          <div className="text-center py-8 text-dark-400">
            {t('info.noContent')}
          </div>
        )
      }

      return (
        <div className="bento-card prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatContent(privacy.content) }} />
          {privacy.updated_at && (
            <p className="text-sm text-dark-400 mt-6 pt-4 border-t border-dark-700">
              {t('info.updatedAt')}: {new Date(privacy.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }

    if (activeTab === 'offer') {
      if (offerLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      if (!offer?.content) {
        return (
          <div className="text-center py-8 text-dark-400">
            {t('info.noContent')}
          </div>
        )
      }

      return (
        <div className="bento-card prose prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: formatContent(offer.content) }} />
          {offer.updated_at && (
            <p className="text-sm text-dark-400 mt-6 pt-4 border-t border-dark-700">
              {t('info.updatedAt')}: {new Date(offer.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )
    }

    if (activeTab === 'loyalty') {
      if (loyaltyLoading) {
        return (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      }

      if (!loyaltyData || loyaltyData.tiers.length === 0) {
        return (
          <div className="text-center py-8 text-dark-400">
            {t('info.noLoyaltyTiers')}
          </div>
        )
      }

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(amount)
      }

      const getStatusBadge = (tier: LoyaltyTierInfo) => {
        if (tier.is_current) {
          return (
            <span className="px-2 py-1 text-xs font-medium bg-accent-500/20 text-accent-400 rounded-full">
              {t('info.statusCurrent')}
            </span>
          )
        }
        if (tier.is_achieved) {
          return (
            <span className="px-2 py-1 text-xs font-medium bg-success-500/20 text-success-400 rounded-full">
              {t('info.statusAchieved')}
            </span>
          )
        }
        return (
          <span className="px-2 py-1 text-xs font-medium bg-dark-600 text-dark-400 rounded-full">
            {t('info.statusLocked')}
          </span>
        )
      }

      const hasAnyDiscount = (tier: LoyaltyTierInfo) => {
        return (
          tier.server_discount_percent > 0 ||
          tier.traffic_discount_percent > 0 ||
          tier.device_discount_percent > 0 ||
          Object.keys(tier.period_discounts).length > 0
        )
      }

      return (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="bento-card p-5">
            <h3 className="text-lg font-semibold text-dark-50 mb-4">{t('info.yourProgress')}</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-dark-800/50 rounded-xl p-3">
                <div className="text-xs text-dark-400 mb-1">{t('info.totalSpent')}</div>
                <div className="text-lg font-bold text-dark-50">
                  {formatCurrency(loyaltyData.current_spent_rubles)}
                </div>
              </div>
              <div className="bg-dark-800/50 rounded-xl p-3">
                <div className="text-xs text-dark-400 mb-1">{t('info.currentStatus')}</div>
                <div className="text-lg font-bold text-accent-400">
                  {loyaltyData.current_tier_name || '-'}
                </div>
              </div>
            </div>

            {/* Progress bar to next tier */}
            {loyaltyData.next_tier_name && loyaltyData.next_tier_threshold_rubles ? (
              <div>
                <div className="flex justify-between text-xs text-dark-400 mb-2">
                  <span>{t('info.nextStatus')}: {loyaltyData.next_tier_name}</span>
                  <span>{t('info.toNextStatus')}: {formatCurrency(loyaltyData.next_tier_threshold_rubles - loyaltyData.current_spent_rubles)}</span>
                </div>
                <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-500 to-accent-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, loyaltyData.progress_percent)}%` }}
                  />
                </div>
                <div className="text-right text-xs text-dark-400 mt-1">
                  {loyaltyData.progress_percent.toFixed(1)}%
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-success-400 font-medium">
                {t('info.allStatusesAchieved')}
              </div>
            )}
          </div>

          {/* Tiers List */}
          <div className="space-y-3">
            {loyaltyData.tiers.map((tier) => (
              <div
                key={tier.id}
                className={`bento-card p-4 transition-all ${
                  tier.is_current
                    ? 'ring-2 ring-accent-500/50 bg-accent-500/5'
                    : tier.is_achieved
                    ? 'bg-success-500/5'
                    : 'opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tier.is_current
                          ? 'bg-accent-500/20 text-accent-400'
                          : tier.is_achieved
                          ? 'bg-success-500/20 text-success-400'
                          : 'bg-dark-700 text-dark-400'
                      }`}
                    >
                      <StarIcon />
                    </div>
                    <div>
                      <h4 className="font-semibold text-dark-50">{tier.name}</h4>
                      <p className="text-xs text-dark-400">
                        {t('info.threshold')}: {formatCurrency(tier.threshold_rubles)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(tier)}
                </div>

                {/* Discounts */}
                {hasAnyDiscount(tier) ? (
                  <div className="bg-dark-800/50 rounded-xl p-3">
                    <div className="text-xs text-dark-400 mb-2">{t('info.discounts')}:</div>
                    <div className="flex flex-wrap gap-2">
                      {tier.server_discount_percent > 0 && (
                        <span className="px-2 py-1 text-xs bg-dark-700 rounded-lg text-dark-200">
                          {t('info.serverDiscount')}: -{tier.server_discount_percent}%
                        </span>
                      )}
                      {tier.traffic_discount_percent > 0 && (
                        <span className="px-2 py-1 text-xs bg-dark-700 rounded-lg text-dark-200">
                          {t('info.trafficDiscount')}: -{tier.traffic_discount_percent}%
                        </span>
                      )}
                      {tier.device_discount_percent > 0 && (
                        <span className="px-2 py-1 text-xs bg-dark-700 rounded-lg text-dark-200">
                          {t('info.deviceDiscount')}: -{tier.device_discount_percent}%
                        </span>
                      )}
                      {Object.entries(tier.period_discounts).map(([days, percent]) => (
                        <span key={days} className="px-2 py-1 text-xs bg-dark-700 rounded-lg text-dark-200">
                          {t('info.periodDiscount', { days })}: -{percent}%
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-dark-500 italic">{t('info.noDiscounts')}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <InfoIcon />
        <h1 className="text-2xl sm:text-3xl font-bold text-dark-50">{t('info.title')}</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-accent-500 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  )
}
