/**
 * @file lucideIcons.tsx
 * @input lucide-react icon components
 * @output Registers Lucide glyphs for every Astryx semantic icon name
 * @position Imported once by main.tsx before render, so Astryx component
 *   internals (Selector chevrons, Dialog close, Banner status marks, …) and
 *   template string-mode usages (`<Icon icon="check" />`) all render Lucide
 *   instead of the built-in fallback SVGs.
 *
 * Sizing mirrors the built-in defaults: 1em box, currentColor, 1.5 stroke.
 */

import {registerIcons} from '@astryxdesign/core/Icon';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckCheckIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleCheckIcon,
  CircleStopIcon,
  CircleXIcon,
  ClockIcon,
  Columns3Icon,
  CopyIcon,
  EllipsisIcon,
  ExternalLinkIcon,
  EyeOffIcon,
  FunnelIcon,
  InfoIcon,
  MenuIcon,
  MicIcon,
  SearchIcon,
  TriangleAlertIcon,
  WrenchIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

const lucide = (Glyph: LucideIcon) => (
  <Glyph size="1em" strokeWidth={1.5} aria-hidden="true" />
);

registerIcons({
  close: lucide(XIcon),
  chevronDown: lucide(ChevronDownIcon),
  chevronLeft: lucide(ChevronLeftIcon),
  chevronRight: lucide(ChevronRightIcon),
  check: lucide(CheckIcon),
  success: lucide(CircleCheckIcon),
  error: lucide(CircleXIcon),
  warning: lucide(TriangleAlertIcon),
  info: lucide(InfoIcon),
  calendar: lucide(CalendarIcon),
  clock: lucide(ClockIcon),
  externalLink: lucide(ExternalLinkIcon),
  menu: lucide(MenuIcon),
  moreHorizontal: lucide(EllipsisIcon),
  search: lucide(SearchIcon),
  arrowUp: lucide(ArrowUpIcon),
  arrowDown: lucide(ArrowDownIcon),
  arrowsUpDown: lucide(ArrowUpDownIcon),
  funnel: lucide(FunnelIcon),
  eyeSlash: lucide(EyeOffIcon),
  viewColumns: lucide(Columns3Icon),
  copy: lucide(CopyIcon),
  checkDouble: lucide(CheckCheckIcon),
  wrench: lucide(WrenchIcon),
  stop: lucide(CircleStopIcon),
  microphone: lucide(MicIcon),
});
