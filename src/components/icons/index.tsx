import type { CSSProperties } from 'react';
import {
  PiArrowLeftDuotone,
  PiArrowRightDuotone,
  PiArrowsClockwiseDuotone,
  PiCaretDownDuotone,
  PiCaretRightDuotone,
  PiChartBarDuotone,
  PiChatCircleDuotone,
  PiCheckDuotone,
  PiClipboardTextDuotone,
  PiClockDuotone,
  PiCopyDuotone,
  PiCreditCardDuotone,
  PiDownloadSimpleDuotone,
  PiGameControllerDuotone,
  PiGearSixDuotone,
  PiGiftDuotone,
  PiGlobeDuotone,
  PiHardDrivesDuotone,
  PiHouseDuotone,
  PiInfoDuotone,
  PiListDuotone,
  PiLockDuotone,
  PiMagnifyingGlassDuotone,
  PiMegaphoneDuotone,
  PiMoonDuotone,
  PiPaletteDuotone,
  PiPauseCircleDuotone,
  PiPencilDuotone,
  PiPencilSimpleDuotone,
  PiPlayDuotone,
  PiPlusDuotone,
  PiShieldDuotone,
  PiSignOutDuotone,
  PiSparkleDuotone,
  PiStarDuotone,
  PiStarFill,
  PiSteeringWheelDuotone,
  PiStopDuotone,
  PiSunDuotone,
  PiTrashDuotone,
  PiUploadSimpleDuotone,
  PiUserDuotone,
  PiUsersDuotone,
  PiWalletDuotone,
  PiXDuotone,
} from 'react-icons/pi';

import { cn } from '@/lib/utils';

// Re-export the extended Phosphor icon sets so the whole cabinet imports the
// panel's icon family from a single barrel.
export * from './extended-icons';
export * from './editor-icons';

interface IconProps {
  className?: string;
}

/**
 * Cabinet icons are thin wrappers over the Remnawave panel's own icon library
 * (Phosphor, via `react-icons/pi`, Duotone variants). Each export keeps the
 * historical name + default Tailwind sizing so every consumer keeps working,
 * while the cabinet now renders the exact icon set the panel uses instead of
 * hand-written SVGs.
 *
 * react-icons components inherit `currentColor` and accept `className`, so
 * Tailwind size (`h-5 w-5`) and text-color utilities control them as before.
 */

// Navigation & Layout
export const HomeIcon = ({ className }: IconProps) => (
  <PiHouseDuotone className={cn('h-5 w-5', className)} />
);

export const BackIcon = ({ className }: IconProps) => (
  <PiArrowLeftDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronRightIcon = ({ className }: IconProps) => (
  <PiCaretRightDuotone className={cn('h-5 w-5', className)} />
);

export const MenuIcon = ({ className }: IconProps) => (
  <PiListDuotone className={cn('h-5 w-5', className)} />
);

export const CloseIcon = ({ className }: IconProps) => (
  <PiXDuotone className={cn('h-5 w-5', className)} />
);

export const ChevronDownIcon = ({ className }: IconProps) => (
  <PiCaretDownDuotone className={cn('h-5 w-5', className)} />
);

export const ArrowRightIcon = ({ className }: IconProps) => (
  <PiArrowRightDuotone className={cn('h-5 w-5', className)} />
);

// Actions
export const SearchIcon = ({ className }: IconProps) => (
  <PiMagnifyingGlassDuotone className={cn('h-5 w-5', className)} />
);

export const PlusIcon = ({ className }: IconProps) => (
  <PiPlusDuotone className={cn('h-5 w-5', className)} />
);

export const EditIcon = ({ className }: IconProps) => (
  <PiPencilSimpleDuotone className={cn('h-4 w-4', className)} />
);

export const PencilIcon = ({ className }: IconProps) => (
  <PiPencilDuotone className={cn('h-4 w-4', className)} />
);

export const TrashIcon = ({ className }: IconProps) => (
  <PiTrashDuotone className={cn('h-5 w-5', className)} />
);

export const UploadIcon = ({ className }: IconProps) => (
  <PiUploadSimpleDuotone className={cn('h-5 w-5', className)} />
);

export const DownloadIcon = ({ className }: IconProps) => (
  <PiDownloadSimpleDuotone className={cn('h-5 w-5', className)} />
);

export const RefreshIcon = ({
  className,
  spinning = false,
}: IconProps & { spinning?: boolean }) => (
  <PiArrowsClockwiseDuotone className={cn('h-4 w-4', spinning && 'animate-spin', className)} />
);

export const SyncIcon = ({ className }: IconProps) => (
  <PiArrowsClockwiseDuotone className={cn('h-5 w-5', className)} />
);

// Status
export const CheckIcon = ({ className }: IconProps) => (
  <PiCheckDuotone className={cn('h-4 w-4', className)} />
);

export const CopyIcon = ({ className }: IconProps) => (
  <PiCopyDuotone className={cn('h-4 w-4', className)} />
);

export const XIcon = ({ className }: IconProps) => (
  <PiXDuotone className={cn('h-4 w-4', className)} />
);

export const LockIcon = ({ className }: IconProps) => (
  <PiLockDuotone className={cn('h-4 w-4', className)} />
);

export const InfoIcon = ({ className }: IconProps) => (
  <PiInfoDuotone className={cn('h-5 w-5', className)} />
);

// User & People
export const UserIcon = ({ className }: IconProps) => (
  <PiUserDuotone className={cn('h-5 w-5', className)} />
);

export const UsersIcon = ({ className }: IconProps) => (
  <PiUsersDuotone className={cn('h-5 w-5', className)} />
);

export const LogoutIcon = ({ className }: IconProps) => (
  <PiSignOutDuotone className={cn('h-5 w-5', className)} />
);

// Theme
export const SunIcon = ({ className }: IconProps) => (
  <PiSunDuotone className={cn('h-5 w-5', className)} />
);

export const MoonIcon = ({ className }: IconProps) => (
  <PiMoonDuotone className={cn('h-5 w-5', className)} />
);

export const PaletteIcon = ({ className }: IconProps) => (
  <PiPaletteDuotone className={cn('h-5 w-5', className)} />
);

// Features & Content
export const SubscriptionIcon = ({ className }: IconProps) => (
  <PiSparkleDuotone className={cn('h-5 w-5', className)} />
);

export const WalletIcon = ({ className }: IconProps) => (
  <PiWalletDuotone className={cn('h-5 w-5', className)} />
);

export const ChatIcon = ({ className }: IconProps) => (
  <PiChatCircleDuotone className={cn('h-5 w-5', className)} />
);

export const GiftIcon = ({ className }: IconProps) => (
  <PiGiftDuotone className={cn('h-4 w-4', className)} />
);

export const ClockIcon = ({ className }: IconProps) => (
  <PiClockDuotone className={cn('h-5 w-5', className)} />
);

export const StarIcon = ({ className, filled }: IconProps & { filled?: boolean }) =>
  filled ? (
    <PiStarFill className={cn('h-5 w-5', className)} />
  ) : (
    <PiStarDuotone className={cn('h-5 w-5', className)} />
  );

export const GamepadIcon = ({ className }: IconProps) => (
  <PiGameControllerDuotone className={cn('h-5 w-5', className)} />
);

export const ClipboardIcon = ({ className }: IconProps) => (
  <PiClipboardTextDuotone className={cn('h-5 w-5', className)} />
);

export const CogIcon = ({ className }: IconProps) => (
  <PiGearSixDuotone className={cn('h-5 w-5', className)} />
);

export const WheelIcon = ({ className }: IconProps) => (
  <PiSteeringWheelDuotone className={cn('h-5 w-5', className)} />
);

export const ShieldIcon = ({ className }: IconProps) => (
  <PiShieldDuotone className={cn('h-5 w-5', className)} />
);

export const ServerIcon = ({ className }: IconProps) => (
  <PiHardDrivesDuotone className={cn('h-5 w-5', className)} />
);

export const CampaignIcon = ({ className }: IconProps) => (
  <PiMegaphoneDuotone className={cn('h-5 w-5', className)} />
);

// Brand mark — the genuine Remnawave panel logo (kept as-is, this is the
// panel's own SVG, not a hand-drawn substitute).
export const RemnawaveIcon = ({ className }: IconProps) => (
  <svg
    className={cn('h-5 w-5', className)}
    fill="none"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M8 1a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V1.75A.75.75 0 0 1 8 1Zm6 2a.75.75 0 0 1 .75.75v8.5a.75.75 0 0 1-1.5 0v-8.5A.75.75 0 0 1 14 3ZM5 4a.75.75 0 0 1 .75.75v6.5a.75.75 0 0 1-1.5 0v-6.5A.75.75 0 0 1 5 4Zm6 1a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 11 5ZM2 6a.75.75 0 0 1 .75.75v2.5a.75.75 0 0 1-1.5 0v-2.5A.75.75 0 0 1 2 6Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const ChartIcon = ({ className }: IconProps) => (
  <PiChartBarDuotone className={cn('h-4 w-4', className)} />
);

export const GlobeIcon = ({ className }: IconProps) => (
  <PiGlobeDuotone className={cn('h-5 w-5', className)} />
);

export const PlayIcon = ({ className }: IconProps) => (
  <PiPlayDuotone className={cn('h-4 w-4', className)} />
);

export const StopIcon = ({ className }: IconProps) => (
  <PiStopDuotone className={cn('h-4 w-4', className)} />
);

export const ArrowPathIcon = ({ className }: IconProps) => (
  <PiArrowsClockwiseDuotone className={cn('h-4 w-4', className)} />
);

export const PauseIcon = ({ className, style }: IconProps & { style?: CSSProperties }) => (
  <PiPauseCircleDuotone className={cn('h-5 w-5', className)} style={style} />
);

export const CreditCardIcon = ({ className }: IconProps) => (
  <PiCreditCardDuotone className={cn('h-5 w-5', className)} />
);
