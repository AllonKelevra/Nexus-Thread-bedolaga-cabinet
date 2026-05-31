import {
  PiTextBDuotone,
  PiTextItalicDuotone,
  PiTextUnderlineDuotone,
  PiTextStrikethroughDuotone,
  PiTextHOneDuotone,
  PiTextHTwoDuotone,
  PiTextHThreeDuotone,
  PiListBulletsDuotone,
  PiListNumbersDuotone,
  PiQuotesDuotone,
  PiCodeBlockDuotone,
  PiTextAlignLeftDuotone,
  PiTextAlignCenterDuotone,
  PiHighlighterDuotone,
} from 'react-icons/pi';

import { cn } from '@/lib/utils';

interface IconProps {
  className?: string;
}

/**
 * Rich-text editor toolbar icons — Phosphor (react-icons/pi) Duotone, the
 * panel's icon family. Shared by the TipTap toolbars in AdminNewsCreate and
 * AdminInfoPageEditor. Names match the historical local definitions so the
 * toolbars import instead of hand-rolling SVGs.
 */

export const BoldIcon = ({ className }: IconProps) => (
  <PiTextBDuotone className={cn('h-5 w-5', className)} />
);

export const ItalicIcon = ({ className }: IconProps) => (
  <PiTextItalicDuotone className={cn('h-5 w-5', className)} />
);

export const UnderlineIcon = ({ className }: IconProps) => (
  <PiTextUnderlineDuotone className={cn('h-5 w-5', className)} />
);

export const StrikeIcon = ({ className }: IconProps) => (
  <PiTextStrikethroughDuotone className={cn('h-5 w-5', className)} />
);

export const H1Icon = ({ className }: IconProps) => (
  <PiTextHOneDuotone className={cn('h-5 w-5', className)} />
);

export const H2Icon = ({ className }: IconProps) => (
  <PiTextHTwoDuotone className={cn('h-5 w-5', className)} />
);

export const H3Icon = ({ className }: IconProps) => (
  <PiTextHThreeDuotone className={cn('h-5 w-5', className)} />
);

export const ListBulletIcon = ({ className }: IconProps) => (
  <PiListBulletsDuotone className={cn('h-5 w-5', className)} />
);

export const ListOrderedIcon = ({ className }: IconProps) => (
  <PiListNumbersDuotone className={cn('h-5 w-5', className)} />
);

export const QuoteIcon = ({ className }: IconProps) => (
  <PiQuotesDuotone className={cn('h-5 w-5', className)} />
);

export const CodeBlockIcon = ({ className }: IconProps) => (
  <PiCodeBlockDuotone className={cn('h-5 w-5', className)} />
);

export const AlignLeftIcon = ({ className }: IconProps) => (
  <PiTextAlignLeftDuotone className={cn('h-5 w-5', className)} />
);

export const AlignCenterIcon = ({ className }: IconProps) => (
  <PiTextAlignCenterDuotone className={cn('h-5 w-5', className)} />
);

export const HighlightIcon = ({ className }: IconProps) => (
  <PiHighlighterDuotone className={cn('h-5 w-5', className)} />
);
