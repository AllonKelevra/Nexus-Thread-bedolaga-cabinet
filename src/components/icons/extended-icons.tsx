import {
  PiSlidersHorizontalDuotone,
  PiHeadsetDuotone,
  PiArrowDownDuotone,
  PiArrowRightDuotone,
  PiArrowUpDuotone,
  PiProhibitDuotone,
  PiMoneyDuotone,
  PiBellDuotone,
  PiLightningDuotone,
  PiRobotDuotone,
  PiBroadcastDuotone,
  PiAppWindowDuotone,
  PiCalendarDotsDuotone,
  PiCreditCardDuotone,
  PiChartBarDuotone,
  PiCheckCircleDuotone,
  PiCaretUpDownDuotone,
  PiCaretDownDuotone,
  PiCaretLeftDuotone,
  PiCaretUpDuotone,
  PiCurrencyBtcDuotone,
  PiDevicesDuotone,
  PiFileTextDuotone,
  PiCircleFill,
  PiEnvelopeDuotone,
  PiWarningDuotone,
  PiArrowSquareOutDuotone,
  PiEyeDuotone,
  PiFunnelDuotone,
  PiDotsSixDuotone,
  PiDotsSixVerticalDuotone,
  PiHeartbeatDuotone,
  PiClockCounterClockwiseDuotone,
  PiImageDuotone,
  PiInfinityDuotone,
  PiLinkDuotone,
  PiMegaphoneDuotone,
  PiMinusDuotone,
  PiNewspaperDuotone,
  PiHandshakeDuotone,
  PiPushPinDuotone,
  PiPlusDuotone,
  PiPowerDuotone,
  PiQuestionDuotone,
  PiRepeatDuotone,
  PiFlagDuotone,
  PiArrowCounterClockwiseDuotone,
  PiArrowClockwiseDuotone,
  PiRocketDuotone,
  PiFloppyDiskDuotone,
  PiPaperPlaneTiltDuotone,
  PiPercentDuotone,
  PiHardDrivesDuotone,
  PiGearSixDuotone,
  PiShareNetworkDuotone,
  PiSparkleDuotone,
  PiChartLineDuotone,
  PiGiftDuotone,
  PiTimerDuotone,
  PiCircleDuotone,
  PiTagDuotone,
  PiTelegramLogoDuotone,
  PiTicketDuotone,
  PiGaugeDuotone,
  PiTrashDuotone,
  PiTrophyDuotone,
  PiPushPinSlashDuotone,
  PiUserPlusDuotone,
  PiUsersThreeDuotone,
  PiVideoCameraDuotone,
  PiXCircleDuotone,
  PiXDuotone,
} from 'react-icons/pi';

import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

/**
 * Extended cabinet icon set — Phosphor (react-icons/pi) Duotone, the panel's
 * icon family. These cover the icons that used to be hand-written inline across
 * feature pages and components. Names match the historical local definitions so
 * every page can import from the central barrel instead of redefining SVGs.
 */

export const AdjustmentsIcon = ({ className }: IconProps) => (
  <PiSlidersHorizontalDuotone className={cn('h-5 w-5', className)} />
);

export const AgentIcon = ({ className }: IconProps) => (
  <PiHeadsetDuotone className={cn('h-5 w-5', className)} />
);

export const ArrowDownIcon = ({ className }: IconProps) => (
  <PiArrowDownDuotone className={cn('h-5 w-5', className)} />
);

export const ArrowIcon = ({ className }: IconProps) => (
  <PiArrowRightDuotone className={cn('h-5 w-5', className)} />
);

export const ArrowUpIcon = ({ className }: IconProps) => (
  <PiArrowUpDuotone className={cn('h-5 w-5', className)} />
);

export const BanIcon = ({ className }: IconProps) => (
  <PiProhibitDuotone className={cn('h-5 w-5', className)} />
);

export const BanknotesIcon = ({ className }: IconProps) => (
  <PiMoneyDuotone className={cn('h-5 w-5', className)} />
);

export const BellIcon = ({ className }: IconProps) => (
  <PiBellDuotone className={cn('h-5 w-5', className)} />
);

export const BoltIcon = ({ className }: IconProps) => (
  <PiLightningDuotone className={cn('h-5 w-5', className)} />
);

export const BotIcon = ({ className }: IconProps) => (
  <PiRobotDuotone className={cn('h-5 w-5', className)} />
);

export const BroadcastIcon = ({ className }: IconProps) => (
  <PiBroadcastDuotone className={cn('h-5 w-5', className)} />
);

export const CabinetIcon = ({ className }: IconProps) => (
  <PiAppWindowDuotone className={cn('h-5 w-5', className)} />
);

export const CalendarIcon = ({ className }: IconProps) => (
  <PiCalendarDotsDuotone className={cn('h-5 w-5', className)} />
);

export const CardIcon = ({ className }: IconProps) => (
  <PiCreditCardDuotone className={cn('h-5 w-5', className)} />
);

export const ChannelIcon = ({ className }: IconProps) => (
  <PiBroadcastDuotone className={cn('h-5 w-5', className)} />
);

export const ChartBarIcon = ({ className }: IconProps) => (
  <PiChartBarDuotone className={cn('h-5 w-5', className)} />
);

export const CheckCircleIcon = ({ className }: IconProps) => (
  <PiCheckCircleDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronExpandIcon = ({ className }: IconProps) => (
  <PiCaretUpDownDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronIcon = ({ className }: IconProps) => (
  <PiCaretDownDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronLeftIcon = ({ className }: IconProps) => (
  <PiCaretLeftDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronUpIcon = ({ className }: IconProps) => (
  <PiCaretUpDuotone className={cn('h-5 w-5', className)} />
);

export const CryptoIcon = ({ className }: IconProps) => (
  <PiCurrencyBtcDuotone className={cn('h-5 w-5', className)} />
);

export const DevicesIcon = ({ className }: IconProps) => (
  <PiDevicesDuotone className={cn('h-5 w-5', className)} />
);

export const DocumentIcon = ({ className }: IconProps) => (
  <PiFileTextDuotone className={cn('h-5 w-5', className)} />
);

export const DotIcon = ({ className }: IconProps) => (
  <PiCircleFill className={cn('h-2 w-2', className)} />
);

export const EmailIcon = ({ className }: IconProps) => (
  <PiEnvelopeDuotone className={cn('h-5 w-5', className)} />
);

export const ExclamationIcon = ({ className }: IconProps) => (
  <PiWarningDuotone className={cn('h-5 w-5', className)} />
);

export const ExternalLinkIcon = ({ className }: IconProps) => (
  <PiArrowSquareOutDuotone className={cn('h-5 w-5', className)} />
);

export const EyeIcon = ({ className }: IconProps) => (
  <PiEyeDuotone className={cn('h-5 w-5', className)} />
);

export const FileTextIcon = ({ className }: IconProps) => (
  <PiFileTextDuotone className={cn('h-5 w-5', className)} />
);

export const FilterIcon = ({ className }: IconProps) => (
  <PiFunnelDuotone className={cn('h-5 w-5', className)} />
);

export const GripIcon = ({ className }: IconProps) => (
  <PiDotsSixDuotone className={cn('h-5 w-5', className)} />
);

export const GripVerticalIcon = ({ className }: IconProps) => (
  <PiDotsSixVerticalDuotone className={cn('h-5 w-5', className)} />
);

export const HealthIcon = ({ className }: IconProps) => (
  <PiHeartbeatDuotone className={cn('h-5 w-5', className)} />
);

export const HistoryIcon = ({ className }: IconProps) => (
  <PiClockCounterClockwiseDuotone className={cn('h-5 w-5', className)} />
);

export const ImageIcon = ({ className }: IconProps) => (
  <PiImageDuotone className={cn('h-5 w-5', className)} />
);

export const InfinityIcon = ({ className }: IconProps) => (
  <PiInfinityDuotone className={cn('h-5 w-5', className)} />
);

export const LinkIcon = ({ className }: IconProps) => (
  <PiLinkDuotone className={cn('h-5 w-5', className)} />
);

export const MailIcon = ({ className }: IconProps) => (
  <PiEnvelopeDuotone className={cn('h-5 w-5', className)} />
);

export const MegaphoneIcon = ({ className }: IconProps) => (
  <PiMegaphoneDuotone className={cn('h-5 w-5', className)} />
);

export const MinusIcon = ({ className }: IconProps) => (
  <PiMinusDuotone className={cn('h-5 w-5', className)} />
);

export const NewsIcon = ({ className }: IconProps) => (
  <PiNewspaperDuotone className={cn('h-5 w-5', className)} />
);

export const PartnerIcon = ({ className }: IconProps) => (
  <PiHandshakeDuotone className={cn('h-5 w-5', className)} />
);

export const PhotoIcon = ({ className }: IconProps) => (
  <PiImageDuotone className={cn('h-5 w-5', className)} />
);

export const PercentIcon = ({ className }: IconProps) => (
  <PiPercentDuotone className={cn('h-5 w-5', className)} />
);

export const PinIcon = ({ className }: IconProps) => (
  <PiPushPinDuotone className={cn('h-5 w-5', className)} />
);

export const PlusSmallIcon = ({ className }: IconProps) => (
  <PiPlusDuotone className={cn('h-4 w-4', className)} />
);

export const PowerIcon = ({ className }: IconProps) => (
  <PiPowerDuotone className={cn('h-5 w-5', className)} />
);

export const QuestionIcon = ({ className }: IconProps) => (
  <PiQuestionDuotone className={cn('h-5 w-5', className)} />
);

export const RepeatIcon = ({ className }: IconProps) => (
  <PiRepeatDuotone className={cn('h-5 w-5', className)} />
);

export const ReportIcon = ({ className }: IconProps) => (
  <PiFlagDuotone className={cn('h-5 w-5', className)} />
);

export const ResetIcon = ({ className }: IconProps) => (
  <PiArrowCounterClockwiseDuotone className={cn('h-5 w-5', className)} />
);

export const RestartIcon = ({ className }: IconProps) => (
  <PiArrowClockwiseDuotone className={cn('h-5 w-5', className)} />
);

export const RocketIcon = ({ className }: IconProps) => (
  <PiRocketDuotone className={cn('h-5 w-5', className)} />
);

export const SaveIcon = ({ className }: IconProps) => (
  <PiFloppyDiskDuotone className={cn('h-5 w-5', className)} />
);

export const SendIcon = ({ className }: IconProps) => (
  <PiPaperPlaneTiltDuotone className={cn('h-5 w-5', className)} />
);

export const ServerSmallIcon = ({ className }: IconProps) => (
  <PiHardDrivesDuotone className={cn('h-4 w-4', className)} />
);

export const SettingsIcon = ({ className }: IconProps) => (
  <PiGearSixDuotone className={cn('h-5 w-5', className)} />
);

export const ShareIcon = ({ className }: IconProps) => (
  <PiShareNetworkDuotone className={cn('h-5 w-5', className)} />
);

export const SparklesIcon = ({ className }: IconProps) => (
  <PiSparkleDuotone className={cn('h-5 w-5', className)} />
);

export const StatBotIcon = ({ className }: IconProps) => (
  <PiRobotDuotone className={cn('h-5 w-5', className)} />
);

export const StatCabinetIcon = ({ className }: IconProps) => (
  <PiAppWindowDuotone className={cn('h-5 w-5', className)} />
);

export const StatPaidIcon = ({ className }: IconProps) => (
  <PiMoneyDuotone className={cn('h-5 w-5', className)} />
);

export const StatsChartIcon = ({ className }: IconProps) => (
  <PiChartLineDuotone className={cn('h-5 w-5', className)} />
);

export const StatTrialIcon = ({ className }: IconProps) => (
  <PiGiftDuotone className={cn('h-5 w-5', className)} />
);

export const StatUptimeIcon = ({ className }: IconProps) => (
  <PiTimerDuotone className={cn('h-5 w-5', className)} />
);

export const StatusIcon = ({ className }: IconProps) => (
  <PiCircleDuotone className={cn('h-5 w-5', className)} />
);

export const TagIcon = ({ className }: IconProps) => (
  <PiTagDuotone className={cn('h-5 w-5', className)} />
);

export const TelegramIcon = ({ className }: IconProps) => (
  <PiTelegramLogoDuotone className={cn('h-5 w-5', className)} />
);

export const TelegramSmallIcon = ({ className }: IconProps) => (
  <PiTelegramLogoDuotone className={cn('h-4 w-4', className)} />
);

export const TicketIcon = ({ className }: IconProps) => (
  <PiTicketDuotone className={cn('h-5 w-5', className)} />
);

export const TrafficIcon = ({ className }: IconProps) => (
  <PiGaugeDuotone className={cn('h-5 w-5', className)} />
);

export const TrashSmallIcon = ({ className }: IconProps) => (
  <PiTrashDuotone className={cn('h-4 w-4', className)} />
);

export const TrophyIcon = ({ className }: IconProps) => (
  <PiTrophyDuotone className={cn('h-5 w-5', className)} />
);

export const UnpinIcon = ({ className }: IconProps) => (
  <PiPushPinSlashDuotone className={cn('h-5 w-5', className)} />
);

export const UserPlusIcon = ({ className }: IconProps) => (
  <PiUserPlusDuotone className={cn('h-5 w-5', className)} />
);

export const UsersOnlineIcon = ({ className }: IconProps) => (
  <PiUsersThreeDuotone className={cn('h-5 w-5', className)} />
);

export const VideoIcon = ({ className }: IconProps) => (
  <PiVideoCameraDuotone className={cn('h-5 w-5', className)} />
);

export const WarningIcon = ({ className }: IconProps) => (
  <PiWarningDuotone className={cn('h-5 w-5', className)} />
);

export const XCircleIcon = ({ className }: IconProps) => (
  <PiXCircleDuotone className={cn('h-5 w-5', className)} />
);

export const XCloseIcon = ({ className }: IconProps) => (
  <PiXDuotone className={cn('h-5 w-5', className)} />
);

export const XMarkIcon = ({ className }: IconProps) => (
  <PiXDuotone className={cn('h-5 w-5', className)} />
);
