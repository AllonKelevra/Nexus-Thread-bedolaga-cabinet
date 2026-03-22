import { useTranslation } from 'react-i18next';
import { NODE_COLORS } from '../utils';

interface NetworkLegendProps {
  className?: string;
}

const CAMPAIGN_GRADIENT_COLORS = [
  NODE_COLORS.campaignUser,
  NODE_COLORS.partner,
  NODE_COLORS.topReferrer,
  '#6b9fff',
  '#b97aff',
];

const USER_LEGEND_ITEMS = [
  { colorKey: NODE_COLORS.regular, labelKey: 'admin.referralNetwork.legend.regularUser' },
  { colorKey: NODE_COLORS.activeReferrer, labelKey: 'admin.referralNetwork.legend.activeReferrer' },
  { colorKey: NODE_COLORS.partner, labelKey: 'admin.referralNetwork.legend.partner' },
  { colorKey: NODE_COLORS.topReferrer, labelKey: 'admin.referralNetwork.legend.topReferrer' },
  { colorKey: NODE_COLORS.campaignUser, labelKey: 'admin.referralNetwork.legend.campaignUser' },
  { colorKey: NODE_COLORS.paidActive, labelKey: 'admin.referralNetwork.legend.paidActive' },
  { colorKey: NODE_COLORS.trialActive, labelKey: 'admin.referralNetwork.legend.trialActive' },
  { colorKey: NODE_COLORS.paidExpired, labelKey: 'admin.referralNetwork.legend.paidExpired' },
  { colorKey: NODE_COLORS.trialExpired, labelKey: 'admin.referralNetwork.legend.trialExpired' },
];

export function NetworkLegend({ className }: NetworkLegendProps) {
  const { t } = useTranslation();

  const gradientStyle = {
    background: `linear-gradient(135deg, ${CAMPAIGN_GRADIENT_COLORS.join(', ')})`,
  };

  return (
    <div
      className={`rounded-xl border border-dark-700/50 bg-dark-900/80 p-3 backdrop-blur-md ${className ?? ''}`}
    >
      <h4 className="mb-2 text-[10px] font-medium uppercase tracking-wider text-dark-500">
        {t('admin.referralNetwork.legend.title')}
      </h4>
      <div className="space-y-1.5">
        {USER_LEGEND_ITEMS.map((item) => (
          <div key={item.labelKey} className="flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.colorKey }}
            />
            <span className="text-xs text-dark-300">{t(item.labelKey)}</span>
          </div>
        ))}
        {/* Partner → Campaign edge */}
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-4 shrink-0 rounded-full" style={{ backgroundColor: '#ff8a65' }} />
          <span className="text-xs text-dark-300">
            {t('admin.referralNetwork.legend.partnerCampaignEdge')}
          </span>
        </div>
        {/* Campaign node with gradient to represent varying colors */}
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={gradientStyle} />
          <span className="text-xs text-dark-300">
            {t('admin.referralNetwork.legend.campaignNode')}
          </span>
        </div>
      </div>
    </div>
  );
}
