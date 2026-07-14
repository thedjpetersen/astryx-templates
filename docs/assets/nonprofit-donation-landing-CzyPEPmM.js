var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file nonprofit-donation-landing.tsx
 * @input Deterministic fixtures only (the fictional "Clearwater Fund —
 *   Restore the Alder" river-restoration campaign: campaign totals
 *   ($68,450 raised of $100,000 · 912 donors · 23 days left), four fixed
 *   donation amounts with curated one-time and monthly impact lines plus
 *   a formula for custom amounts, three impact-story quotes, a five-slice
 *   where-money-goes budget that sums to 100% with an honest overhead
 *   slice, five milestones (3 completed, 2 upcoming), three transparency
 *   document cards, an EIN, and seven employers with gift-match policies)
 * @output Complete vertical-specific campaign landing page: sticky navbar
 *   (brand mark + 4 smooth-scrolling anchor links + Donate CTA, collapsing
 *   to a menu button + dropdown at compact widths), a tinted hero band
 *   with a schematic river SVG whose funded saplings pop in to match the
 *   campaign percentage, and a progress card whose bar fills and totals
 *   count up on first reveal. Centerpiece donation widget: One-time /
 *   Monthly SegmentedControl, amount chips + custom NumberInput that
 *   live-update an impact line, and a Donate button that fires an inline
 *   thank-you state (share-link copy row + validating receipt-email
 *   capture) and honestly bumps the hero progress totals. Below: impact
 *   stories Carousel, an interactive where-money-goes SVG donut with
 *   legend-row selection, a milestones timeline, a transparency band with
 *   report cards + copyable EIN mono row, and a corporate-match employer
 *   lookup with a static suggest list. Scroll-reveals, count-ups, and the
 *   sapling pop-in are IntersectionObserver-driven, fire once, and are
 *   fully gated by prefers-reduced-motion.
 * @position Page template; emitted by \`astryx template nonprofit-donation-landing\`
 *
 * Frame: Layout height="fill", content-only — a landing page owns its own
 * chrome, so there is no LayoutHeader. LayoutContent (padding 0) hosts a
 * single scroll container; the navbar inside it is position:sticky top:0.
 * Full-bleed tinted bands alternate with plain bands; each band centers a
 * 1080px content column. The footer is a scheme-locked dark band. The
 * interaction-receipt Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - Nav anchors smooth-scroll the container to real section ids with a
 *   sticky-nav allowance; the compact menu closes on Escape (refocusing
 *   the trigger), outside pointerdown, or any selection.
 * - The donation widget's amount chips, custom NumberInput, and cadence
 *   SegmentedControl all recompute the impact line and Donate label in
 *   one pass; Donate validates the custom amount, then swaps the widget
 *   body for a thank-you state and adds the gift to the hero totals (bar
 *   width transitions to the new percentage; funded saplings recompute).
 * - The thank-you share row copies the campaign link with a 2s "Copied"
 *   flip; the receipt-email capture validates (empty/format) with inline
 *   error text and flips to a confirmed row.
 * - Donut legend rows are buttons: selecting one thickens its slice, dims
 *   the rest, and swaps the donut center readout; selecting it again
 *   returns to the 100% summary.
 * - The employer match input filters a static suggest list from 2+
 *   characters; picking a suggestion renders the employer's match policy
 *   card with the doubled-gift math spelled out.
 * - Transparency report cards and footer links that would leave the page
 *   fire a corner Toast so the wiring is provable; EIN has a copy flip.
 *
 * Motion policy: scroll-reveals (rise + fade 12px, fire once via
 * IntersectionObserver), count-ups (rAF, ease-out cubic), the progress
 * bar fill, and the staggered sapling pop-in are all disabled by
 * prefers-reduced-motion — reveals render visible, counters render final,
 * the bar renders at its resting width, and saplings render planted.
 *
 * Color policy: token/light-dark hybrid. ONE quarantined campaign accent
 * literal (river teal, see ACCENT) with contrast math; donut slice tones
 * and SVG tints are explicit light-dark() pairs so they adapt to the app
 * scheme; story-card art gradients and the footer are scheme-locked with
 * colorScheme:'dark' so brand art reads identically in both themes.
 *
 * Responsive contract (measured with a local ResizeObserver — the demo's
 * inline stage is ~1045px wide, so viewport media queries only fire in
 * the separate 390px phone iframe):
 * - >920px: hero is split copy/progress-card, the donate band sits
 *   widget-beside-supporting-copy, and the breakdown is donut-beside-
 *   legend; milestones and transparency grids sit wide.
 * - <=920px: hero, donate band, and breakdown all stack in source order.
 * - <=780px: nav anchor links collapse behind a 40px menu button whose
 *   dropdown lists the anchors and the Donate CTA.
 * - <=640px: headline steps down, band paddings tighten, amount chips
 *   wrap 2-up, the share/receipt rows stack, and Grid minWidths carry
 *   story/report cards to single column. Holds at 390px with no
 *   overflow-x.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Carousel} from '@astryxdesign/core/Carousel';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowRightIcon,
  BirdIcon,
  Building2Icon,
  CalendarIcon,
  CheckIcon,
  CopyIcon,
  FileTextIcon,
  FishIcon,
  HeartHandshakeIcon,
  LinkIcon,
  LockIcon,
  MailCheckIcon,
  MenuIcon,
  SearchIcon,
  SproutIcon,
  UsersIcon,
  WavesIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= PAINT CONSTANTS =============
// ONE quarantined campaign accent literal (river teal), used for the
// brand mark, river water, selected chips, and nav CTA tint.
// Contrast math: light #0F766E on white = 5.5:1 (AA for text and UI);
// dark #5EEAD4 on the ~#1B1B1F dark app background = 11.6:1 (AAA).
// The rgba() variants below are alpha washes of the SAME two hexes.
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_WASH = 'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.12))';
const ACCENT_WASH_SOFT =
  'light-dark(rgba(15, 118, 110, 0.05), rgba(94, 234, 212, 0.06))';
const ACCENT_BORDER =
  'light-dark(rgba(15, 118, 110, 0.45), rgba(94, 234, 212, 0.45))';

// Scheme-locked dark-footer text (sits on colorScheme:'dark' surfaces).
const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';

const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 68;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  band: {
    width: '100%',
  },
  bandTinted: {
    backgroundColor: ACCENT_WASH_SOFT,
  },
  bandMuted: {
    backgroundColor: 'var(--color-background-muted)',
  },
  column: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
    gap: 'var(--spacing-5)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    border: \`1px solid \${ACCENT_BORDER}\`,
    color: ACCENT,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 40,
    paddingInline: 12,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  menuButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  navMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
  },
  navMenuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 8,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  heroText: {
    flex: '1.2 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 29,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 520,
    margin: 0,
  },
  riverFrame: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    lineHeight: 0,
  },
  // ---- progress card ----
  progressCard: {
    flex: '1 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  raisedStat: {
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    fontVariantNumeric: 'tabular-nums',
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: ACCENT,
  },
  // ---- donation widget ----
  donateRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'flex-start',
  },
  donateRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  donateCard: {
    flex: '1.1 1 0',
    minWidth: 0,
    boxSizing: 'border-box',
    borderRadius: 16,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  donateAside: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  amountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 'var(--spacing-2)',
  },
  amountGridCompact: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  amountChip: {
    height: 48,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
  },
  amountChipSelected: {
    borderColor: ACCENT,
    boxShadow: \`0 0 0 1px \${ACCENT}\`,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  impactLine: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  fieldError: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  shareLinkBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12.5,
    color: 'var(--color-text-secondary)',
    minWidth: 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  successDisc: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  // ---- impact stories ----
  storyCard: {
    width: 320,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  // Scheme-locked brand art: story gradients are identical in both themes.
  storyArt: {
    height: 96,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'dark',
    color: '#FFFFFF',
  },
  storyBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    flex: 1,
  },
  storyQuote: {
    fontSize: 15,
    lineHeight: 1.5,
    fontWeight: 500,
    margin: 0,
  },
  // ---- where money goes ----
  breakdownRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  breakdownRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  donutWrap: {
    flex: '0 0 auto',
    display: 'flex',
    justifyContent: 'center',
  },
  legendList: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    minHeight: 44,
    paddingInline: 'var(--spacing-3)',
    borderRadius: 10,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    boxSizing: 'border-box',
  },
  legendRowSelected: {
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 4,
    flexShrink: 0,
  },
  legendPct: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  // ---- milestones ----
  milestoneRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
  },
  milestoneRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    alignSelf: 'stretch',
    flexShrink: 0,
    width: 28,
  },
  milestoneDot: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  milestoneDotDone: {
    backgroundColor:
      'light-dark(rgba(52, 168, 83, 0.14), rgba(52, 168, 83, 0.24))',
    color: SUCCESS,
  },
  milestoneDotUpcoming: {
    border: '2px dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  milestoneLine: {
    width: 2,
    flex: 1,
    minHeight: 16,
    backgroundColor: 'var(--color-border)',
    marginBlock: 4,
  },
  milestoneBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  // ---- transparency ----
  reportCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    textAlign: 'left',
  },
  reportGlyph: {
    width: 38,
    height: 38,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: ACCENT_WASH,
    color: ACCENT,
  },
  einRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  einMono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 13,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  // ---- corporate match ----
  matchCard: {
    boxSizing: 'border-box',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  suggestList: {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  suggestRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 'var(--spacing-3)',
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
    color: 'var(--color-text-primary)',
  },
  matchResult: {
    borderRadius: 12,
    border: \`1px solid \${ACCENT_BORDER}\`,
    backgroundColor: ACCENT_WASH,
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- footer (scheme-locked dark band) ----
  footer: {
    colorScheme: 'dark',
    color: DARK_TEXT,
    backgroundColor: '#0B1F1D',
  },
  footerInner: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-8) var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 32,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: DARK_TEXT_FAINT,
    textAlign: 'left',
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Clearwater Fund campaign.
// No Date.now, no randomness, no network assets.

const BRAND = {
  org: 'Clearwater Fund',
  campaign: 'Restore the Alder',
  shareUrl: 'clearwaterfund.org/restore-the-alder',
  ein: '84-2917465',
};

const CAMPAIGN = {
  raised: 68450,
  goal: 100000,
  donors: 912,
  daysLeft: 23,
};

const HERO = {
  kicker: 'Summer 2026 campaign',
  headline: 'Bring the Alder River back to life',
  subcopy:
    'Clearwater Fund is restoring 2.4 miles of the Alder — replanting ' +
    'native banks, rebuilding salmon habitat, and reopening cold-water ' +
    'side channels. Every dollar goes to work inside the watershed.',
};

type SectionId = 'donate' | 'impact' | 'breakdown' | 'milestones' | 'transparency';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'impact', label: 'Impact'},
  {id: 'breakdown', label: 'Where it goes'},
  {id: 'milestones', label: 'Milestones'},
  {id: 'transparency', label: 'Transparency'},
];

type Cadence = 'once' | 'monthly';

const FIXED_AMOUNTS = [25, 50, 100, 250] as const;

/** Curated impact lines per fixed amount, by cadence. */
const IMPACT_LINES: Record<Cadence, Record<number, string>> = {
  once: {
    25: '6 native saplings planted along the bank',
    50: '12 native saplings planted along the bank',
    100: '8 feet of eroded bank stabilized and replanted',
    250: 'one log-jam habitat structure anchored midstream',
  },
  monthly: {
    25: 'a nursery bed of alder seedlings tended all year',
    50: 'water-quality sampling at two stations every month',
    100: 'a full restoration crew day every month',
    250: 'a sponsored riverbank section with quarterly reports',
  },
};

/** ~$4.20 puts one nursery sapling in the ground (2025 field costs). */
function customImpactLine(amount: number, cadence: Cadence): string {
  const saplings = Math.max(1, Math.round(amount / 4.2));
  return cadence === 'monthly'
    ? \`about \${saplings} native saplings planted every month\`
    : \`about \${saplings} native saplings planted along the bank\`;
}

interface Story {
  id: string;
  quote: string;
  name: string;
  role: string;
  icon: Glyph;
  /** Scheme-locked art gradient (see Color policy). */
  art: string;
}

const STORIES: readonly Story[] = [
  {
    id: 'kingfishers',
    quote:
      'The kingfishers came back within a month of the first planting. I ' +
      'hadn’t seen one from my porch in nine years.',
    name: 'Ruth Calloway',
    role: 'Streamside landowner, mile 1.2',
    icon: BirdIcon,
    art: 'linear-gradient(135deg, #0E7490 0%, #155E75 55%, #1E3A5F 100%)',
  },
  {
    id: 'classroom',
    quote:
      'My class planted 300 alders last spring. The kids check on ' +
      '“their” trees every single week — rain or shine.',
    name: 'Marcus Yee',
    role: '5th-grade teacher, Fern Hollow Elementary',
    icon: UsersIcon,
    art: 'linear-gradient(135deg, #15803D 0%, #166534 55%, #14532D 100%)',
  },
  {
    id: 'coho',
    quote:
      'We’re counting juvenile coho in reaches that were bare gravel ' +
      'two summers ago. The shade is doing exactly what the models said.',
    name: 'Dr. Amara Osei',
    role: 'Fisheries biologist, watershed council',
    icon: FishIcon,
    art: 'linear-gradient(135deg, #0F766E 0%, #115E59 55%, #134E4A 100%)',
  },
];

interface Slice {
  id: string;
  label: string;
  pct: number;
  detail: string;
  /** Explicit light-dark pair so slices adapt to the app scheme. */
  tone: string;
}

/** Budget slices sum to exactly 100 — overhead is shown honestly. */
const SLICES: readonly Slice[] = [
  {
    id: 'fieldwork',
    label: 'Restoration fieldwork & planting',
    pct: 62,
    detail: 'Crews, plants in the ground, bank stabilization, log-jam installs.',
    tone: 'light-dark(#0F766E, #5EEAD4)',
  },
  {
    id: 'nursery',
    label: 'Native plant nursery',
    pct: 18,
    detail: 'Growing 40,000 alder, willow, and sedge starts a year on-site.',
    tone: 'light-dark(#15803D, #86EFAC)',
  },
  {
    id: 'science',
    label: 'Monitoring & science',
    pct: 9,
    detail: 'Water-quality stations, fish counts, and third-party review.',
    tone: 'light-dark(#0369A1, #7DD3FC)',
  },
  {
    id: 'community',
    label: 'Community programs',
    pct: 6,
    detail: 'School plantings, volunteer days, and landowner workshops.',
    tone: 'light-dark(#B45309, #FCD34D)',
  },
  {
    id: 'overhead',
    label: 'Operations & fundraising',
    pct: 5,
    detail: 'The honest slice: bookkeeping, insurance, and this campaign.',
    tone: 'light-dark(#6B7280, #9CA3AF)',
  },
];

interface Milestone {
  id: string;
  date: string;
  title: string;
  detail: string;
  isDone: boolean;
}

const MILESTONES: readonly Milestone[] = [
  {
    id: 'survey',
    date: 'Mar 14, 2026',
    title: 'Survey & permits complete',
    detail: '2.4 river miles mapped; county and tribal permits granted.',
    isDone: true,
  },
  {
    id: 'clearing',
    date: 'Apr 22, 2026',
    title: 'Invasive clearing',
    detail: '1,800 ft of bank cleared of blackberry and knotweed.',
    isDone: true,
  },
  {
    id: 'planting',
    date: 'Jun 9, 2026',
    title: 'First planting season',
    detail: '4,200 saplings in the ground with 240 volunteers.',
    isDone: true,
  },
  {
    id: 'logjams',
    date: 'Aug 2026',
    title: 'Log-jam habitat installs',
    detail: '12 engineered structures to slow water and shelter fry.',
    isDone: false,
  },
  {
    id: 'monitoring',
    date: 'Oct 2026',
    title: 'Salmon return monitoring',
    detail: 'Fall counts begin at three stations with the watershed council.',
    isDone: false,
  },
];

const REPORTS: readonly {id: string; title: string; meta: string}[] = [
  {id: 'annual', title: '2025 Annual Report', meta: 'PDF · 28 pages'},
  {id: 'financials', title: 'Audited financials FY25', meta: 'PDF · 14 pages'},
  {id: 'form990', title: 'IRS Form 990', meta: 'PDF · filed Feb 2026'},
];

interface Employer {
  id: string;
  name: string;
  ratio: string;
  /** Multiplier applied to the employee gift for the example math. */
  multiplier: number;
  cap: string;
}

/** Static suggest list for the corporate-match lookup. */
const EMPLOYERS: readonly Employer[] = [
  {id: 'meridian', name: 'Meridian Software', ratio: '1:1', multiplier: 1, cap: '$2,500 / yr'},
  {id: 'bluepine', name: 'Bluepine Insurance', ratio: '2:1', multiplier: 2, cap: '$1,000 / yr'},
  {id: 'cascade', name: 'Cascade Analytics', ratio: '1:1', multiplier: 1, cap: '$5,000 / yr'},
  {id: 'fernfield', name: 'Fern & Field Outfitters', ratio: '1:1', multiplier: 1, cap: '$500 / yr'},
  {id: 'harborlight', name: 'Harborlight Health', ratio: '1:1', multiplier: 1, cap: '$3,000 / yr'},
  {id: 'copperline', name: 'Copperline Manufacturing', ratio: '0.5:1', multiplier: 0.5, cap: '$2,000 / yr'},
  {id: 'talus', name: 'Talus Ridge Coffee', ratio: '1:1', multiplier: 1, cap: '$750 / yr'},
];

/** Sapling x-positions along the near bank of the hero river SVG. */
const SAPLING_XS = [60, 165, 270, 380, 490, 600, 710, 820, 930, 1040] as const;

// ============= HELPERS =============

function formatUSD(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter an email for your receipt.';
  }
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

/**
 * Local ResizeObserver width hook — the demo's inline stage is ~1045px
 * wide inside a 1440px window, so viewport media queries never fire
 * there; the page measures itself instead.
 */
function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

/** Read prefers-reduced-motion once; motion is disabled for the session. */
function usePrefersReducedMotion(): boolean {
  const [prefers] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  return prefers;
}

/** Fire-once viewport reveal; skip renders revealed immediately. */
function useRevealOnce(skip: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(skip);
  useEffect(() => {
    if (isRevealed) {
      return undefined;
    }
    const element = ref.current;
    if (element == null || typeof IntersectionObserver === 'undefined') {
      setIsRevealed(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.15},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isRevealed]);
  return {ref, isRevealed};
}

/**
 * Count from 0 to target once activated (rAF, ease-out cubic).
 * Reduced motion renders the final value immediately.
 */
function useCountUp(
  target: number,
  isActive: boolean,
  isStatic: boolean,
  durationMs = 1400,
): number {
  const [value, setValue] = useState(0);
  const hasRunRef = useRef(false);
  useEffect(() => {
    if (isStatic || !isActive || hasRunRef.current) {
      return undefined;
    }
    hasRunRef.current = true;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) {
        start = now;
      }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, isStatic, target, durationMs]);
  return isStatic ? target : value;
}

// ============= SMALL PIECES =============

/** Rise-and-fade scroll reveal; renders visible under reduced motion. */
function Reveal({
  children,
  delayMs = 0,
}: {
  children: ReactNode;
  delayMs?: number;
}) {
  const isStatic = usePrefersReducedMotion();
  const {ref, isRevealed} = useRevealOnce(isStatic);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(12px)',
        transition: isStatic
          ? 'none'
          : \`opacity 600ms ease \${delayMs}ms, transform 600ms ease \${delayMs}ms\`,
      }}>
      {children}
    </div>
  );
}

/** Section intro: kicker Token + title + supporting copy. */
function SectionIntro({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <VStack gap={2}>
      <Token label={kicker} size="sm" color="green" />
      <Heading level={2}>{title}</Heading>
      <Text type="supporting" color="secondary">
        {description}
      </Text>
    </VStack>
  );
}

/**
 * Schematic river illustration. Funded saplings (campaign percentage,
 * one per 10%) pop in with a stagger once the hero reveals; the rest
 * render as outlined placeholders. Reduced motion renders the final frame.
 */
function RiverIllustration({
  fundedCount,
  isRevealed,
  isStatic,
}: {
  fundedCount: number;
  isRevealed: boolean;
  isStatic: boolean;
}) {
  return (
    <div
      style={styles.riverFrame}
      role="img"
      aria-label={\`Schematic illustration of the Alder River with \${fundedCount} of \${SAPLING_XS.length} riverbank sections replanted\`}>
      <svg
        viewBox="0 0 1100 190"
        width="100%"
        height="auto"
        aria-hidden="true">
        {/* far bank */}
        <path
          d="M0 78 C 180 58, 340 96, 550 76 C 760 56, 900 92, 1100 70 L 1100 0 L 0 0 Z"
          fill="light-dark(rgba(21, 128, 61, 0.12), rgba(134, 239, 172, 0.10))"
        />
        {/* mature alders on the far bank */}
        {[130, 330, 560, 790, 990].map(x => (
          <g key={x}>
            <line
              x1={x}
              y1={62}
              x2={x}
              y2={34}
              stroke="light-dark(#57534E, #A8A29E)"
              strokeWidth={3}
            />
            <circle
              cx={x}
              cy={26}
              r={16}
              fill="light-dark(rgba(21, 128, 61, 0.55), rgba(134, 239, 172, 0.45))"
            />
          </g>
        ))}
        {/* river channel */}
        <path
          d="M0 92 C 200 72, 380 112, 550 92 C 720 72, 900 110, 1100 86 L 1100 138 C 900 158, 720 122, 550 142 C 380 162, 200 124, 0 144 Z"
          fill="light-dark(rgba(15, 118, 110, 0.22), rgba(94, 234, 212, 0.16))"
        />
        {/* ripples */}
        {[108, 122].map(y => (
          <path
            key={y}
            d={\`M40 \${y} C 240 \${y - 14}, 420 \${y + 12}, 610 \${y - 6} C 800 \${y - 20}, 940 \${y + 10}, 1070 \${y - 4}\`}
            fill="none"
            stroke={ACCENT}
            strokeOpacity={0.5}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="14 22"
          />
        ))}
        {/* near bank */}
        <path
          d="M0 144 C 200 124, 380 162, 550 142 C 720 122, 900 158, 1100 138 L 1100 190 L 0 190 Z"
          fill="light-dark(rgba(120, 113, 108, 0.14), rgba(168, 162, 158, 0.12))"
        />
        {/* saplings: funded pop in, unfunded are outlined placeholders */}
        {SAPLING_XS.map((x, index) => {
          const isFunded = index < fundedCount;
          const shown = isStatic || isRevealed;
          const popStyle: CSSProperties = isFunded
            ? {
                opacity: shown ? 1 : 0,
                transform: shown ? 'none' : 'translateY(8px)',
                transition: isStatic
                  ? 'none'
                  : \`opacity 400ms ease \${300 + index * 80}ms, transform 400ms ease \${300 + index * 80}ms\`,
              }
            : {};
          const y = 164;
          return (
            <g key={x} style={popStyle}>
              <line
                x1={x}
                y1={y}
                x2={x}
                y2={y - 14}
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={\`M\${x} \${y - 12} C \${x - 4} \${y - 16}, \${x - 8} \${y - 16}, \${x - 9} \${y - 20}\`}
                fill="none"
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <path
                d={\`M\${x} \${y - 12} C \${x + 4} \${y - 16}, \${x + 8} \${y - 16}, \${x + 9} \${y - 20}\`}
                fill="none"
                stroke={
                  isFunded ? SUCCESS : 'light-dark(#A8A29E, #57534E)'
                }
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/** Interactive budget donut; selection thickens a slice and dims the rest. */
function BudgetDonut({
  selectedId,
}: {
  selectedId: string | null;
}) {
  const size = 240;
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const selected = SLICES.find(slice => slice.id === selectedId) ?? null;
  let offset = 0;
  return (
    <svg
      width={size}
      height={size}
      viewBox={\`0 0 \${size} \${size}\`}
      role="img"
      aria-label="Budget donut chart: fieldwork 62%, nursery 18%, science 9%, community 6%, operations 5%">
      <g transform={\`rotate(-90 \${size / 2} \${size / 2})\`}>
        {SLICES.map(slice => {
          const length = (slice.pct / 100) * circumference;
          const isSelected = slice.id === selectedId;
          const isDimmed = selectedId !== null && !isSelected;
          const dashOffset = -offset;
          offset += length;
          return (
            <circle
              key={slice.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={slice.tone}
              strokeWidth={isSelected ? 30 : 22}
              strokeDasharray={\`\${Math.max(0, length - 3)} \${circumference - Math.max(0, length - 3)}\`}
              strokeDashoffset={dashOffset}
              opacity={isDimmed ? 0.35 : 1}
              style={{transition: 'stroke-width 200ms ease, opacity 200ms ease'}}
            />
          );
        })}
      </g>
      <text
        x="50%"
        y="46%"
        textAnchor="middle"
        fontSize={selected === null ? 34 : 30}
        fontWeight={700}
        fill="var(--color-text-primary)"
        style={{fontVariantNumeric: 'tabular-nums'}}>
        {selected === null ? '100%' : \`\${selected.pct}%\`}
      </text>
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        fontSize={12}
        fill="var(--color-text-secondary)">
        {selected === null ? 'independently audited' : selected.label.slice(0, 28)}
      </text>
    </svg>
  );
}

// ============= PAGE =============

export default function NonprofitDonationLandingTemplate() {
  const isStatic = usePrefersReducedMotion();

  // ---- responsive: measure the page, not the viewport ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isStacked = wrapWidth > 0 && wrapWidth <= 920;
  const isNavCollapsed = wrapWidth > 0 && wrapWidth <= 780;
  const isCompact = wrapWidth > 0 && wrapWidth <= 640;

  // ---- nav ----
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLElement | null>>>(
    {},
  );

  // ---- hero reveal + count-ups ----
  const {ref: heroRevealRef, isRevealed: isHeroRevealed} =
    useRevealOnce(isStatic);
  /** Extra raised/donors from inline donations on this visit. */
  const [extraRaised, setExtraRaised] = useState(0);
  const [extraDonors, setExtraDonors] = useState(0);
  const raisedBase = useCountUp(CAMPAIGN.raised, isHeroRevealed, isStatic);
  const donorsBase = useCountUp(CAMPAIGN.donors, isHeroRevealed, isStatic, 1100);
  const raisedShown = raisedBase + extraRaised;
  const donorsShown = donorsBase + extraDonors;
  const raisedActual = CAMPAIGN.raised + extraRaised;
  const percent = Math.min(100, (raisedActual / CAMPAIGN.goal) * 100);
  const fundedSaplings = Math.min(
    SAPLING_XS.length,
    Math.round(percent / 10),
  );

  // ---- donation widget ----
  const [cadence, setCadence] = useState<Cadence>('once');
  const [amountId, setAmountId] = useState<string>('50');
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [amountError, setAmountError] = useState<string | null>(null);
  const [donation, setDonation] = useState<{
    amount: number;
    cadence: Cadence;
  } | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [receiptSentTo, setReceiptSentTo] = useState<string | null>(null);

  const selectedAmount =
    amountId === 'custom' ? customAmount : Number(amountId);
  const impactLine =
    selectedAmount == null || selectedAmount < 1
      ? null
      : amountId === 'custom'
        ? customImpactLine(selectedAmount, cadence)
        : (IMPACT_LINES[cadence][selectedAmount] ??
          customImpactLine(selectedAmount, cadence));

  // ---- donut ----
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  // ---- transparency ----
  const [isEinCopied, setIsEinCopied] = useState(false);

  // ---- corporate match ----
  const [employerQuery, setEmployerQuery] = useState('');
  const [pickedEmployer, setPickedEmployer] = useState<Employer | null>(null);
  const employerMatches =
    employerQuery.trim().length >= 2
      ? EMPLOYERS.filter(employer =>
          employer.name
            .toLowerCase()
            .includes(employerQuery.trim().toLowerCase()),
        ).slice(0, 5)
      : [];

  // ---- toast ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // Copied-state timers revert after 2s; cleaned up on unmount.
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const einTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimerRef.current != null) {
        clearTimeout(copyTimerRef.current);
      }
      if (einTimerRef.current != null) {
        clearTimeout(einTimerRef.current);
      }
    },
    [],
  );

  // Compact menu dismisses on Escape (refocusing its trigger) and on any
  // pointerdown outside the sticky navbar.
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav !== null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen]);

  // ---- interactions ----

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isStatic ? 'auto' : 'smooth',
    });
  };

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const submitDonation = () => {
    if (selectedAmount == null || selectedAmount < 1) {
      setAmountError('Enter an amount of $1 or more.');
      return;
    }
    setAmountError(null);
    setDonation({amount: selectedAmount, cadence});
    setExtraRaised(previous => previous + selectedAmount);
    setExtraDonors(previous => previous + 1);
    setIsLinkCopied(false);
    setReceiptEmail('');
    setReceiptError(null);
    setReceiptSentTo(null);
  };

  const resetDonation = () => {
    setDonation(null);
    setAmountError(null);
  };

  const copyShareLink = () => {
    // Copy is best-effort; the confirmation flip is the source of truth.
    void navigator.clipboard
      ?.writeText(\`https://\${BRAND.shareUrl}\`)
      .catch(() => undefined);
    setIsLinkCopied(true);
    if (copyTimerRef.current != null) {
      clearTimeout(copyTimerRef.current);
    }
    copyTimerRef.current = setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const copyEin = () => {
    void navigator.clipboard
      ?.writeText(BRAND.ein)
      .catch(() => undefined);
    setIsEinCopied(true);
    if (einTimerRef.current != null) {
      clearTimeout(einTimerRef.current);
    }
    einTimerRef.current = setTimeout(() => setIsEinCopied(false), 2000);
  };

  const submitReceiptEmail = () => {
    const error = validateEmail(receiptEmail);
    if (error !== null) {
      setReceiptError(error);
      return;
    }
    setReceiptSentTo(receiptEmail.trim());
    setReceiptError(null);
  };

  // ============= CHROME =============

  const brandMark = (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={WavesIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.org}</Text>
        {!isCompact && (
          <Text type="supporting" color="secondary">
            {BRAND.campaign}
          </Text>
        )}
      </VStack>
    </HStack>
  );

  const navMenu = (
    <div style={styles.navMenu} role="menu" aria-label="Site menu">
      <VStack gap={1}>
        {NAV_ANCHORS.map(anchor => (
          <button
            key={anchor.id}
            type="button"
            role="menuitem"
            style={styles.navMenuLink}
            onClick={() => jumpToSection(anchor.id)}>
            {anchor.label}
          </button>
        ))}
        <Divider />
        <Button
          label="Donate"
          variant="primary"
          icon={<Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />}
          onClick={() => jumpToSection('donate')}
        />
      </VStack>
    </div>
  );

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Primary">
      <div style={styles.navInner}>
        {brandMark}
        <StackItem size="fill">
          {!isNavCollapsed && (
            <HStack gap={1} vAlign="center">
              {NAV_ANCHORS.map(anchor => (
                <button
                  key={anchor.id}
                  type="button"
                  style={styles.navLink}
                  onClick={() => jumpToSection(anchor.id)}>
                  {anchor.label}
                </button>
              ))}
            </HStack>
          )}
        </StackItem>
        <Button
          label="Donate"
          variant="primary"
          size={isNavCollapsed ? 'sm' : 'md'}
          icon={<Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />}
          onClick={() => jumpToSection('donate')}
        />
        {isNavCollapsed && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.menuButton}
            onClick={() => setIsMenuOpen(previous => !previous)}>
            <Icon
              icon={isMenuOpen ? XIcon : MenuIcon}
              size="sm"
              color="inherit"
            />
          </button>
        )}
        {isMenuOpen && isNavCollapsed && navMenu}
      </div>
    </nav>
  );

  // ============= SECTIONS =============

  // ---- hero (tinted band): copy + progress card over the river art ----
  const progressCard = (
    <div style={styles.progressCard}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Token label="Campaign progress" size="sm" color="green" />
        <Badge variant="info" label={\`\${CAMPAIGN.daysLeft} days left\`} />
      </HStack>
      <div>
        <span style={styles.raisedStat}>{formatUSD(raisedShown)}</span>
        <Text type="supporting" color="secondary">
          raised of {formatUSD(CAMPAIGN.goal)} goal
        </Text>
      </div>
      <div
        style={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={CAMPAIGN.goal}
        aria-valuenow={raisedActual}
        aria-label="Campaign progress toward goal">
        <div
          style={{
            ...styles.progressFill,
            // Fills on first reveal; later donations transition wider.
            width: isHeroRevealed || isStatic ? \`\${percent}%\` : '0%',
            transition: isStatic ? 'none' : 'width 1200ms ease 200ms',
          }}
        />
      </div>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <Icon icon={UsersIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            {donorsShown.toLocaleString('en-US')} donors
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          · {fundedSaplings} of {SAPLING_XS.length} bank sections funded
        </Text>
      </HStack>
      <Button
        label="Give now"
        variant="primary"
        icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
        onClick={() => jumpToSection('donate')}
      />
    </div>
  );

  const hero = (
    <div ref={heroRevealRef}>
      <VStack gap={5}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Token label={HERO.kicker} size="sm" color="green" />
              <Badge variant="success" label="501(c)(3) nonprofit" />
            </HStack>
            <h1
              style={{
                ...styles.heroHeadline,
                ...(isCompact ? styles.heroHeadlineCompact : null),
              }}>
              {HERO.headline}
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Donate to the Alder"
                variant="primary"
                icon={
                  <Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />
                }
                onClick={() => jumpToSection('donate')}
              />
              <Button
                label="See where money goes"
                variant="secondary"
                onClick={() => jumpToSection('breakdown')}
              />
            </HStack>
          </div>
          {progressCard}
        </div>
        <RiverIllustration
          fundedCount={fundedSaplings}
          isRevealed={isHeroRevealed}
          isStatic={isStatic}
        />
      </VStack>
    </div>
  );

  // ---- donation widget (centerpiece) ----
  const donateLabel =
    selectedAmount != null && selectedAmount >= 1
      ? cadence === 'monthly'
        ? \`Donate \${formatUSD(selectedAmount)}/month\`
        : \`Donate \${formatUSD(selectedAmount)}\`
      : 'Donate';

  const thankYou = donation !== null && (
    <VStack gap={4}>
      <HStack gap={3} vAlign="center">
        <div style={styles.successDisc} aria-hidden="true">
          <Icon icon={CheckIcon} size="md" color="inherit" />
        </div>
        <VStack gap={0}>
          <Heading level={3}>Thank you!</Heading>
          <Text type="supporting" color="secondary">
            Your{' '}
            {donation.cadence === 'monthly'
              ? \`\${formatUSD(donation.amount)}/month\`
              : formatUSD(donation.amount)}{' '}
            gift is on its way to the Alder — that&rsquo;s{' '}
            {donation.amount === selectedAmount && impactLine != null
              ? impactLine
              : customImpactLine(donation.amount, donation.cadence)}
            .
          </Text>
        </VStack>
      </HStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label">Multiply your gift — share the campaign</Text>
        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-2)',
            alignItems: 'center',
            flexDirection: isCompact ? 'column' : 'row',
            ...(isCompact ? {alignItems: 'stretch'} : null),
          }}>
          <div style={{...styles.shareLinkBox, flex: '1 1 0'}}>
            <Icon icon={LinkIcon} size="xsm" color="secondary" />
            {BRAND.shareUrl}
          </div>
          <Button
            label={isLinkCopied ? 'Copied' : 'Copy link'}
            variant="secondary"
            icon={
              <Icon
                icon={isLinkCopied ? CheckIcon : CopyIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={copyShareLink}
          />
        </div>
      </VStack>
      {receiptSentTo === null ? (
        <VStack gap={1}>
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-2)',
              alignItems: 'flex-start',
              flexDirection: isCompact ? 'column' : 'row',
              ...(isCompact ? {alignItems: 'stretch'} : null),
            }}>
            <div style={{flex: '1 1 0', minWidth: 0}}>
              <TextInput
                label="Email for your tax receipt"
                isLabelHidden
                placeholder="you@example.org"
                value={receiptEmail}
                onChange={value => {
                  setReceiptEmail(value);
                  setReceiptError(null);
                }}
              />
            </div>
            <Button
              label="Email my receipt"
              variant="secondary"
              onClick={submitReceiptEmail}
            />
          </div>
          {receiptError !== null && (
            <p style={styles.fieldError} role="alert">
              {receiptError}
            </p>
          )}
        </VStack>
      ) : (
        <HStack gap={2} vAlign="center">
          <Icon icon={MailCheckIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Your tax receipt will land at {receiptSentTo}.
          </Text>
        </HStack>
      )}
      <Button
        label="Make another donation"
        variant="ghost"
        size="sm"
        onClick={resetDonation}
      />
    </VStack>
  );

  const donationWidget = (
    <div style={styles.donateCard}>
      {donation !== null ? (
        thankYou
      ) : (
        <>
          <VStack gap={1}>
            <Heading level={3}>Fund the restoration</Heading>
            <Text type="supporting" color="secondary">
              Choose a gift — the impact line updates as you go.
            </Text>
          </VStack>
          <SegmentedControl
            value={cadence}
            onChange={value => setCadence(value as Cadence)}
            label="Donation cadence"
            layout="fill">
            <SegmentedControlItem value="once" label="One-time" />
            <SegmentedControlItem value="monthly" label="Monthly" />
          </SegmentedControl>
          <div
            style={{
              ...styles.amountGrid,
              ...(isCompact ? styles.amountGridCompact : null),
            }}
            role="group"
            aria-label="Donation amount">
            {FIXED_AMOUNTS.map(amount => {
              const id = String(amount);
              const isSelected = amountId === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={isSelected}
                  style={{
                    ...styles.amountChip,
                    ...(isSelected ? styles.amountChipSelected : null),
                  }}
                  onClick={() => {
                    setAmountId(id);
                    setAmountError(null);
                  }}>
                  \${amount}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            aria-pressed={amountId === 'custom'}
            style={{
              ...styles.amountChip,
              width: '100%',
              ...(amountId === 'custom' ? styles.amountChipSelected : null),
            }}
            onClick={() => {
              setAmountId('custom');
              setAmountError(null);
            }}>
            Custom amount
          </button>
          {amountId === 'custom' && (
            <NumberInput
              label="Custom amount (USD)"
              value={customAmount}
              onChange={value => {
                setCustomAmount(value);
                setAmountError(null);
              }}
              min={1}
              max={25000}
              step={5}
              units="USD"
              isIntegerOnly
              placeholder="75"
            />
          )}
          {impactLine !== null &&
            selectedAmount != null && (
              <div style={styles.impactLine}>
                <Icon icon={SproutIcon} size="sm" color="inherit" />
                <span>
                  {formatUSD(selectedAmount)}
                  {cadence === 'monthly' ? '/mo' : ''} = {impactLine}
                </span>
              </div>
            )}
          {amountError !== null && (
            <p style={styles.fieldError} role="alert">
              {amountError}
            </p>
          )}
          <Button
            label={donateLabel}
            variant="primary"
            icon={
              <Icon icon={HeartHandshakeIcon} size="sm" color="inherit" />
            }
            onClick={submitDonation}
          />
          <HStack gap={1} vAlign="center">
            <Icon icon={LockIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              Secure · tax-deductible · cancel monthly anytime
            </Text>
          </HStack>
        </>
      )}
    </div>
  );

  const donateSection = (
    <div
      style={{
        ...styles.donateRow,
        ...(isStacked ? styles.donateRowStacked : null),
      }}>
      {donationWidget}
      <div style={styles.donateAside}>
        <SectionIntro
          kicker="Your gift at work"
          title="Small gifts, measured in saplings"
          description="We publish field costs every season, so each amount maps to real work on the bank — not a vague thermometer."
        />
        <VStack gap={2}>
          {[
            '4,200 saplings planted so far in 2026 — 74% survival at 90 days',
            'Monthly gifts fund the nursery through the wet season',
            '95% of this campaign goes directly to watershed programs',
          ].map(line => (
            <HStack key={line} gap={2} vAlign="start">
              <div
                style={{
                  ...styles.successDisc,
                  width: 24,
                  height: 24,
                }}
                aria-hidden="true">
                <Icon icon={CheckIcon} size="xsm" color="inherit" />
              </div>
              <StackItem size="fill">
                <Text type="body">{line}</Text>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </div>
    </div>
  );

  // ---- impact stories (muted band, carousel) ----
  const storiesSection = (
    <VStack gap={4}>
      <SectionIntro
        kicker="Impact stories"
        title="Voices from the riverbank"
        description="Landowners, classrooms, and biologists on what one season of restoration changed."
      />
      <Carousel gap={3} hasSnap aria-label="Impact stories">
        {STORIES.map(story => (
          <div key={story.id} style={styles.storyCard}>
            <div
              style={{...styles.storyArt, background: story.art}}
              aria-hidden="true">
              <Icon icon={story.icon} size="lg" color="inherit" />
            </div>
            <div style={styles.storyBody}>
              <p style={styles.storyQuote}>&ldquo;{story.quote}&rdquo;</p>
              <StackItem size="fill">
                <span />
              </StackItem>
              <VStack gap={0}>
                <Text size="sm" weight="semibold">
                  {story.name}
                </Text>
                <Text type="supporting" color="secondary">
                  {story.role}
                </Text>
              </VStack>
            </div>
          </div>
        ))}
      </Carousel>
    </VStack>
  );

  // ---- where money goes (plain band, interactive donut) ----
  const breakdownSection = (
    <VStack gap={4}>
      <SectionIntro
        kicker="Where money goes"
        title="Every dollar, accounted for"
        description="FY25 audited allocation. Select a line to inspect its slice — including the honest overhead one."
      />
      <div
        style={{
          ...styles.breakdownRow,
          ...(isStacked ? styles.breakdownRowStacked : null),
        }}>
        <div style={styles.donutWrap}>
          <BudgetDonut selectedId={selectedSlice} />
        </div>
        <div style={styles.legendList} role="list" aria-label="Budget lines">
          {SLICES.map(slice => {
            const isSelected = selectedSlice === slice.id;
            return (
              <button
                key={slice.id}
                type="button"
                role="listitem"
                aria-pressed={isSelected}
                style={{
                  ...styles.legendRow,
                  ...(isSelected ? styles.legendRowSelected : null),
                }}
                onClick={() =>
                  setSelectedSlice(previous =>
                    previous === slice.id ? null : slice.id,
                  )
                }>
                <span
                  style={{...styles.legendSwatch, backgroundColor: slice.tone}}
                  aria-hidden="true"
                />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text size="sm" weight="semibold">
                      {slice.label}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {slice.detail}
                    </Text>
                  </VStack>
                </StackItem>
                <span style={styles.legendPct}>{slice.pct}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </VStack>
  );

  // ---- milestones (tinted band, timeline) ----
  const milestonesSection = (
    <VStack gap={4}>
      <SectionIntro
        kicker="Milestones"
        title="The season so far — and what's next"
        description="Three phases complete, two funded by this campaign."
      />
      <div>
        {MILESTONES.map((milestone, index) => (
          <Reveal key={milestone.id} delayMs={index * 90}>
            <div style={styles.milestoneRow}>
              <div style={styles.milestoneRail}>
                <div
                  style={{
                    ...styles.milestoneDot,
                    ...(milestone.isDone
                      ? styles.milestoneDotDone
                      : styles.milestoneDotUpcoming),
                  }}
                  aria-hidden="true">
                  <Icon
                    icon={milestone.isDone ? CheckIcon : CalendarIcon}
                    size="xsm"
                    color="inherit"
                  />
                </div>
                {index < MILESTONES.length - 1 && (
                  <div style={styles.milestoneLine} aria-hidden="true" />
                )}
              </div>
              <div style={styles.milestoneBody}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label">{milestone.title}</Text>
                  <Badge
                    variant={milestone.isDone ? 'success' : 'neutral'}
                    label={
                      milestone.isDone
                        ? milestone.date
                        : \`Planned · \${milestone.date}\`
                    }
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  {milestone.detail}
                </Text>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </VStack>
  );

  // ---- transparency + corporate match (plain band) ----
  const transparencySection = (
    <VStack gap={5}>
      <SectionIntro
        kicker="Transparency"
        title="Read the paperwork"
        description="Reports, audited financials, and our federal filing — all public, all current."
      />
      <Grid columns={{minWidth: 240, max: 3}} gap={3}>
        {REPORTS.map(report => (
          <button
            key={report.id}
            type="button"
            style={styles.reportCard}
            onClick={() => fireToast(\`Transparency — \${report.title} opened.\`)}>
            <div style={styles.reportGlyph} aria-hidden="true">
              <Icon icon={FileTextIcon} size="sm" color="inherit" />
            </div>
            <VStack gap={0}>
              <Text size="sm" weight="semibold">
                {report.title}
              </Text>
              <Text type="supporting" color="secondary">
                {report.meta}
              </Text>
            </VStack>
          </button>
        ))}
      </Grid>
      <div style={styles.einRow}>
        <Icon icon={FileTextIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <span style={styles.einMono}>
            EIN {BRAND.ein} · registered 501(c)(3)
          </span>
        </StackItem>
        <Button
          label={isEinCopied ? 'Copied' : 'Copy EIN'}
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isEinCopied ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={copyEin}
        />
      </div>
      <div style={styles.matchCard}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={Building2Icon} size="md" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">Double it with a corporate match</Text>
              <Text type="supporting" color="secondary">
                1 in 3 of our donors works somewhere with a gift-match
                program. Look up your employer:
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <TextInput
          label="Your employer"
          isLabelHidden
          placeholder="Start typing — e.g. Bluepine"
          startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
          value={employerQuery}
          onChange={value => {
            setEmployerQuery(value);
            setPickedEmployer(null);
          }}
        />
        {pickedEmployer === null && employerQuery.trim().length >= 2 && (
          employerMatches.length > 0 ? (
            <div style={styles.suggestList} role="list" aria-label="Employer suggestions">
              {employerMatches.map(employer => (
                <button
                  key={employer.id}
                  type="button"
                  role="listitem"
                  style={styles.suggestRow}
                  onClick={() => {
                    setPickedEmployer(employer);
                    setEmployerQuery(employer.name);
                  }}>
                  <Icon icon={Building2Icon} size="sm" color="secondary" />
                  <StackItem size="fill">{employer.name}</StackItem>
                  <Badge variant="info" label={\`\${employer.ratio} match\`} />
                </button>
              ))}
            </div>
          ) : (
            <Text type="supporting" color="secondary">
              No match found — ask HR whether your company runs a gift-match
              program. Most take five minutes to file.
            </Text>
          )
        )}
        {pickedEmployer !== null && (
          <div style={styles.matchResult}>
            <Text type="label">
              {pickedEmployer.name} matches {pickedEmployer.ratio} up to{' '}
              {pickedEmployer.cap}
            </Text>
            <Text type="supporting" color="secondary">
              A $50 gift becomes{' '}
              {formatUSD(Math.round(50 * (1 + pickedEmployer.multiplier)))} for
              the Alder once the match clears.
            </Text>
            <HStack gap={2}>
              <Button
                label="Get the match form"
                variant="secondary"
                size="sm"
                onClick={() =>
                  fireToast(
                    \`Corporate match — \${pickedEmployer.name} form requested.\`,
                  )
                }
              />
            </HStack>
          </div>
        )}
      </div>
    </VStack>
  );

  // ---- footer (scheme-locked dark band) ----
  const footer = (
    <footer style={styles.footer}>
      <div style={styles.footerInner}>
        <HStack gap={4} vAlign="start" wrap="wrap">
          <StackItem size="fill">
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <div
                  style={{
                    ...styles.brandTile,
                    backgroundColor: 'rgba(94, 234, 212, 0.14)',
                    border: '1px solid rgba(94, 234, 212, 0.35)',
                    color: '#5EEAD4',
                  }}
                  aria-hidden="true">
                  <Icon icon={WavesIcon} size="sm" color="inherit" />
                </div>
                <Text type="label" color="inherit">
                  {BRAND.org}
                </Text>
              </HStack>
              <Text
                type="supporting"
                color="inherit"
                style={{color: DARK_TEXT_SOFT, maxWidth: 380}}>
                Restoring the rivers of the Cedar Coast watershed since 2019.
                Field office: 41 Millrace Rd, Fern Hollow.
              </Text>
            </VStack>
          </StackItem>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              Campaign
            </Text>
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                style={styles.footerLink}
                onClick={() => jumpToSection(anchor.id)}>
                {anchor.label}
              </button>
            ))}
          </VStack>
          <VStack gap={1}>
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              Organization
            </Text>
            {['About us', 'Volunteer days', 'Newsletter', 'Contact'].map(
              label => (
                <button
                  key={label}
                  type="button"
                  style={styles.footerLink}
                  onClick={() => fireToast(\`Footer — \${label} clicked.\`)}>
                  {label}
                </button>
              ),
            )}
          </VStack>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text
              type="supporting"
              color="inherit"
              style={{color: DARK_TEXT_FAINT}}>
              © 2026 Clearwater Fund · EIN {BRAND.ein} · Donations are
              tax-deductible to the extent allowed by law.
            </Text>
          </StackItem>
          <Text
            type="supporting"
            color="inherit"
            style={{color: DARK_TEXT_FAINT}}>
            Charity rating ★★★★ · 95% program spend
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= FRAME =============

  const columnStyle: CSSProperties = {
    ...styles.column,
    ...(isCompact ? styles.columnCompact : null),
  };

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Clearwater Fund campaign page">
            <div ref={pageRef} style={styles.page}>
              {navbar}
              {/* tinted hero band */}
              <div style={{...styles.band, ...styles.bandTinted}}>
                <div style={columnStyle}>{hero}</div>
              </div>
              {/* plain donate band (centerpiece) */}
              <section
                ref={registerSection('donate')}
                aria-label="Donate"
                style={styles.band}>
                <div style={columnStyle}>
                  <Reveal>{donateSection}</Reveal>
                </div>
              </section>
              {/* muted stories band */}
              <section
                ref={registerSection('impact')}
                aria-label="Impact stories"
                style={{...styles.band, ...styles.bandMuted}}>
                <div style={columnStyle}>
                  <Reveal>{storiesSection}</Reveal>
                </div>
              </section>
              {/* plain breakdown band */}
              <section
                ref={registerSection('breakdown')}
                aria-label="Where money goes"
                style={styles.band}>
                <div style={columnStyle}>
                  <Reveal>{breakdownSection}</Reveal>
                </div>
              </section>
              {/* tinted milestones band */}
              <section
                ref={registerSection('milestones')}
                aria-label="Milestones"
                style={{...styles.band, ...styles.bandTinted}}>
                <div style={columnStyle}>{milestonesSection}</div>
              </section>
              {/* plain transparency band */}
              <section
                ref={registerSection('transparency')}
                aria-label="Transparency"
                style={styles.band}>
                <div style={columnStyle}>
                  <Reveal>{transparencySection}</Reveal>
                </div>
              </section>
              {footer}
            </div>
          </LayoutContent>
        }
      />

      {/* Interaction receipt toast: keyed so repeat clicks re-announce. */}
      {toast !== null && (
        <div style={styles.toastWrap}>
          <Toast
            key={toast.key}
            type="info"
            isAutoHide={false}
            autoHideDuration={6000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </div>
  );
}
`;export{e as default};