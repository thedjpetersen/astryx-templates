var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (three fixed months of envelope budgets
 *   with per-envelope spent totals, hand-written daily burn-down arrays, a
 *   recent-transaction ledger per envelope per month, and a bills list)
 * @output Envelope-budgeting tracker: header with a 3-month SegmentedControl,
 *   four summary KPI Cards (income, budgeted, spent, safe-to-spend with
 *   ProgressBars), a CSS-only flexible-spend burn-down strip with even-pace
 *   ghost bars, and an envelope ledger Card — one full-width button row per
 *   envelope with a gradient icon chip, a spent/remaining bar that turns red
 *   with an "Over" alert Badge past 100%, and an inline recent-transactions
 *   list revealed on click — plus a docked month-summary panel with
 *   overspend alerts (each coverable from safe-to-spend) and a bills list
 * @position Page template; emitted by \`astryx template budget-tracker\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (wallet mark,
 * title, month meta line, month SegmentedControl). LayoutContent scrolls a
 * centered max-width 1040 column: KPI Grid, burn-down Card, envelopes Card.
 * LayoutPanel end 320 docks the month summary (overspend alerts, bills,
 * rollover note) on wide viewports.
 *
 * Container policy: dashboard archetype — Cards for the KPI tiles, the
 * burn-down widget, and the envelope ledger; the month summary is a docked
 * panel, not a Card, because it is durable chrome. Envelope rows are
 * full-width unstyled buttons rather than Table rows because each row
 * expands an inline transactions region (aria-expanded + aria-controls).
 *
 * Responsive contract:
 * - Page column: maxWidth 1040, centered; the whole content area scrolls.
 * - Header row wraps (wrap="wrap") so the month SegmentedControl drops below
 *   the title when one row is too narrow; the income meta line hides <=640px.
 * - KPI Grid: columns={{minWidth: 200, max: 4}} — 4-up wide, reflowing to
 *   2-up and 1-up as the viewport narrows.
 * - <=900px: the month-summary LayoutPanel undocks and renders as a Card at
 *   the bottom of the content column (single-pane fallback, no side panel).
 * - <=640px: the month SegmentedControl and the envelope filter render at
 *   size="lg" (40px tap targets); envelope rows restack — icon chip + name +
 *   remaining on line one, the spent/remaining bar full-width on line two,
 *   the "spent of budgeted" figures + alert Badge on line three — and every
 *   row button keeps a >=44px min-height. The inline transactions region
 *   drops its desktop indent so amounts keep full width at 375px.
 * - Burn-down strip: one flex column per day, bars compress evenly with
 *   minWidth 0 (31 bars fit at 375px; no horizontal scroll); day labels thin
 *   to 1 / 15 / month-end on phones. The strip is presentational
 *   (role="img" + aria-label summary) and every figure it encodes is
 *   restated in the caption below it, so nothing is hover- or pointer-only.
 * - No hover-only interactions anywhere: rows toggle on click/tap/Enter,
 *   alerts are covered via real Buttons.
 *
 * Color policy: data inks (burn-down bars, envelope fill bars, alert/covered
 * icons, over-budget text) resolve through var(--color-data-categorical-*)
 * tokens with light-dark() fallbacks; all other chrome uses Astryx tokens.
 * Scheme-locked surfaces: the envelope gradient icon chips and the header
 * wallet mark are brand-gradient art with colorScheme locked to 'light' —
 * their literal hex gradient stops and literal #fff glyphs are intentional
 * so the chips render identically in light and dark mode.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  AlertTriangleIcon,
  CarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClapperboardIcon,
  HeartPulseIcon,
  HomeIcon,
  PiggyBankIcon,
  ShoppingCartIcon,
  UtensilsIcon,
  WalletIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react';

// ============= STYLES =============

// Data colors via Astryx tokens with light-dark() fallbacks: light values
// match the original hexes exactly; dark values lift lightness, same hue.
const colors = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9FFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #4ADE80))',
  amber: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FFA94D))',
  red: 'var(--color-data-categorical-red, light-dark(#D92D20, #F97066))',
};

// Gradient placeholders for the envelope icon chips (no network assets).
// Scheme-locked brand art (see Color policy above): literal hex stops on
// purpose; the chip styles lock colorScheme so they never flip in dark mode.
const chipGradients: Record<string, string> = {
  housing: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  groceries: 'linear-gradient(135deg, #0B991F, #4ADE80)',
  dining: 'linear-gradient(135deg, #F97316, #FBBF24)',
  transport: 'linear-gradient(135deg, #0171E3, #38BDF8)',
  utilities: 'linear-gradient(135deg, #CA8A04, #FACC15)',
  health: 'linear-gradient(135deg, #E11D48, #FB7185)',
  fun: 'linear-gradient(135deg, #6B1EFD, #A78BFA)',
  savings: 'linear-gradient(135deg, #0D9488, #2DD4BF)',
};

const styles: Record<string, CSSProperties> = {
  // Centered scrollable page column.
  page: {maxWidth: 1040, marginInline: 'auto', width: '100%'},
  numeric: {fontVariantNumeric: 'tabular-nums'},
  // Header wallet mark — gradient placeholder, white glyph. Scheme-locked
  // brand art: literal gradient + literal white glyph, colorScheme pinned.
  brandChip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control, 8px)',
    background: 'linear-gradient(135deg, #0171E3, #6B1EFD)',
    color: '#fff',
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Burn-down strip: fixed-height flex row; one column per day of the month.
  burnRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 96,
  },
  burnCol: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    position: 'relative',
  },
  // Even-pace ghost bar behind the actual remaining bar, sibling-funnel
  // style: same hue at low opacity so the pace reads on any card surface.
  burnGhost: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    backgroundColor: colors.blue,
    opacity: 0.16,
    borderRadius: '2px 2px 0 0',
  },
  burnBar: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    borderRadius: '2px 2px 0 0',
  },
  burnLabels: {display: 'flex', gap: 2},
  burnLabel: {flex: 1, minWidth: 0, textAlign: 'center'},
  // Envelope rows are unstyled full-width buttons so tap/click/Enter all
  // toggle the inline transactions region — never hover-only.
  rowButton: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    paddingBlock: 10,
    paddingInline: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
  },
  // Envelope icon chip — scheme-locked brand gradient surface; the white
  // glyph is a literal so it stays readable on the locked gradient.
  chip: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-control, 10px)',
    color: '#fff',
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Desktop: fixed name column keeps every bar track starting on the same
  // x so envelope fills compare visually.
  nameCol: {width: 200, flexShrink: 0},
  barTrack: {
    position: 'relative',
    height: 12,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 0,
  },
  barFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    borderRadius: 999,
  },
  // Desktop: fixed right column for remaining $ + status Badge.
  rightCol: {
    width: 128,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
  },
  chevron: {
    display: 'flex',
    flexShrink: 0,
    transition: 'transform 120ms ease',
    color: 'var(--color-content-secondary, light-dark(#666, #9CA3AF))',
  },
  chevronOpen: {transform: 'rotate(180deg)'},
  // Inline transactions region: indented under the icon chip on desktop;
  // the indent drops <=640px so amounts keep full width at 375px.
  txnRegion: {paddingInlineStart: 48, paddingBottom: 8},
  txnRegionCompact: {paddingInlineStart: 0, paddingBottom: 8},
  txnDate: {width: 56, flexShrink: 0},
  alertIcon: {display: 'flex', color: colors.red, flexShrink: 0},
  coveredIcon: {display: 'flex', color: colors.green, flexShrink: 0},
  overText: {color: colors.red, fontVariantNumeric: 'tabular-nums'},
};

// ============= DATA =============
// Deterministic fixtures: three fixed months, fixed daily burn-down arrays,
// fixed ledgers. No clocks, no randomness — "June" is simply the fixture
// month still in progress (asOfDay 28 of 30).

interface EnvelopeMeta {
  id: string;
  name: string;
  icon: LucideIcon;
}

const ENVELOPES: EnvelopeMeta[] = [
  {id: 'housing', name: 'Housing', icon: HomeIcon},
  {id: 'groceries', name: 'Groceries', icon: ShoppingCartIcon},
  {id: 'dining', name: 'Dining out', icon: UtensilsIcon},
  {id: 'transport', name: 'Transport', icon: CarIcon},
  {id: 'utilities', name: 'Utilities', icon: ZapIcon},
  {id: 'health', name: 'Health & fitness', icon: HeartPulseIcon},
  {id: 'fun', name: 'Entertainment', icon: ClapperboardIcon},
  {id: 'savings', name: 'Savings transfer', icon: PiggyBankIcon},
];

interface EnvelopeBudget {
  envelopeId: string;
  budgeted: number;
  spent: number;
}

interface Bill {
  id: string;
  date: string;
  name: string;
  amount: number;
  status: 'paid' | 'due';
}

interface MonthBudget {
  id: string;
  /** SegmentedControl label. */
  label: string;
  /** Full display name for captions. */
  full: string;
  days: number;
  /** Last day with recorded data — equals \`days\` for completed months. */
  asOfDay: number;
  income: number;
  incomeNote: string;
  /**
   * Burn-down basis: the flexible-spend pool (total budgeted minus the
   * fixed Housing + Savings envelopes, which clear on day 1).
   */
  flexBudget: number;
  /** Remaining flexible dollars per day, day 1..asOfDay. */
  burndown: number[];
  envelopes: EnvelopeBudget[];
  bills: Bill[];
}

const MONTHS: MonthBudget[] = [
  {
    id: '2026-04',
    label: 'Apr',
    full: 'April 2026',
    days: 30,
    asOfDay: 30,
    income: 6100,
    incomeNote: 'Salary ×2 · Apr 1 and Apr 15',
    flexBudget: 1650,
    burndown: [
      1642, 1588, 1531, 1502, 1466, 1420, 1395, 1341, 1296, 1262, 1214, 1189,
      1146, 1092, 1038, 1004, 961, 918, 874, 826, 771, 742, 688, 611, 566,
      502, 411, 302, 178, 82,
    ],
    envelopes: [
      {envelopeId: 'housing', budgeted: 1800, spent: 1800},
      {envelopeId: 'groceries', budgeted: 620, spent: 588},
      {envelopeId: 'dining', budgeted: 280, spent: 342},
      {envelopeId: 'transport', budgeted: 240, spent: 198},
      {envelopeId: 'utilities', budgeted: 210, spent: 196},
      {envelopeId: 'health', budgeted: 140, spent: 95},
      {envelopeId: 'fun', budgeted: 160, spent: 149},
      {envelopeId: 'savings', budgeted: 900, spent: 900},
    ],
    bills: [
      {id: 'apr-rent', date: 'Apr 1', name: 'Rent', amount: 1650, status: 'paid'},
      {id: 'apr-net', date: 'Apr 10', name: 'Clearwave Internet', amount: 69.99, status: 'paid'},
      {id: 'apr-cell', date: 'Apr 30', name: 'Cell plan', amount: 45, status: 'paid'},
    ],
  },
  {
    id: '2026-05',
    label: 'May',
    full: 'May 2026',
    days: 31,
    asOfDay: 31,
    income: 6350,
    incomeNote: 'Salary ×2 + $250 spot bonus',
    flexBudget: 1670,
    burndown: [
      1655, 1611, 1568, 1540, 1497, 1462, 1418, 1390, 1352, 1310, 1266, 1231,
      1189, 1148, 1102, 1064, 1026, 981, 940, 896, 851, 812, 770, 719, 668,
      606, 545, 471, 380, 244, 71,
    ],
    envelopes: [
      {envelopeId: 'housing', budgeted: 1800, spent: 1800},
      {envelopeId: 'groceries', budgeted: 640, spent: 612},
      {envelopeId: 'dining', budgeted: 280, spent: 265},
      {envelopeId: 'transport', budgeted: 240, spent: 291},
      {envelopeId: 'utilities', budgeted: 210, spent: 187},
      {envelopeId: 'health', budgeted: 140, spent: 140},
      {envelopeId: 'fun', budgeted: 160, spent: 104},
      {envelopeId: 'savings', budgeted: 900, spent: 900},
    ],
    bills: [
      {id: 'may-rent', date: 'May 1', name: 'Rent', amount: 1650, status: 'paid'},
      {id: 'may-net', date: 'May 10', name: 'Clearwave Internet', amount: 69.99, status: 'paid'},
      {id: 'may-cell', date: 'May 31', name: 'Cell plan', amount: 45, status: 'paid'},
    ],
  },
  {
    id: '2026-06',
    label: 'Jun',
    full: 'June 2026',
    days: 30,
    asOfDay: 28,
    income: 6100,
    incomeNote: 'Salary ×2 · Jun 1 and Jun 15',
    flexBudget: 1650,
    burndown: [
      1631, 1590, 1554, 1518, 1490, 1451, 1417, 1372, 1340, 1298, 1256, 1220,
      1184, 1139, 1096, 1051, 1008, 962, 921, 874, 826, 771, 702, 645, 561,
      468, 322, 166,
    ],
    envelopes: [
      {envelopeId: 'housing', budgeted: 1800, spent: 1800},
      {envelopeId: 'groceries', budgeted: 620, spent: 566},
      {envelopeId: 'dining', budgeted: 280, spent: 301},
      {envelopeId: 'transport', budgeted: 240, spent: 176},
      {envelopeId: 'utilities', budgeted: 210, spent: 171},
      {envelopeId: 'health', budgeted: 140, spent: 62},
      {envelopeId: 'fun', budgeted: 160, spent: 208},
      {envelopeId: 'savings', budgeted: 900, spent: 900},
    ],
    bills: [
      {id: 'jun-net', date: 'Jun 10', name: 'Clearwave Internet', amount: 69.99, status: 'paid'},
      {id: 'jun-cell', date: 'Jun 30', name: 'Cell plan', amount: 45, status: 'due'},
      {id: 'jun-ins', date: 'Jun 30', name: 'Renters insurance', amount: 18.5, status: 'due'},
    ],
  },
];

const DEFAULT_MONTH_ID = '2026-06';

// Recent-transactions ledger, keyed \`\${monthId}:\${envelopeId}\`. Newest first.
interface EnvelopeTxn {
  id: string;
  date: string;
  merchant: string;
  amount: number;
}

const TRANSACTIONS: Record<string, EnvelopeTxn[]> = {
  '2026-04:housing': [
    {id: 'a-h1', date: 'Apr 1', merchant: 'Rent — Alder Street Lofts', amount: 1650},
    {id: 'a-h2', date: 'Apr 1', merchant: 'HOA dues', amount: 150},
  ],
  '2026-04:groceries': [
    {id: 'a-g1', date: 'Apr 27', merchant: 'FreshMart', amount: 122.85},
    {id: 'a-g2', date: 'Apr 18', merchant: 'Green Valley Market', amount: 96.12},
    {id: 'a-g3', date: 'Apr 6', merchant: 'Costmart bulk run', amount: 128.93},
  ],
  '2026-04:dining': [
    {id: 'a-d1', date: 'Apr 29', merchant: 'Trattoria Lupo — birthday dinner', amount: 118.6},
    {id: 'a-d2', date: 'Apr 20', merchant: 'Cafe Solano', amount: 41.35},
    {id: 'a-d3', date: 'Apr 12', merchant: 'Nori Ramen', amount: 39.75},
    {id: 'a-d4', date: 'Apr 3', merchant: 'Tacos El Rey', amount: 26.9},
  ],
  '2026-04:transport': [
    {id: 'a-t1', date: 'Apr 22', merchant: 'Shell — fuel', amount: 51.07},
    {id: 'a-t2', date: 'Apr 10', merchant: 'Metro card reload', amount: 40},
    {id: 'a-t3', date: 'Apr 2', merchant: 'Toll pass top-up', amount: 22.5},
  ],
  '2026-04:utilities': [
    {id: 'a-u1', date: 'Apr 12', merchant: 'City Power & Light', amount: 108.55},
    {id: 'a-u2', date: 'Apr 10', merchant: 'Clearwave Internet', amount: 69.99},
    {id: 'a-u3', date: 'Apr 5', merchant: 'Water district', amount: 17.46},
  ],
  '2026-04:health': [
    {id: 'a-he1', date: 'Apr 16', merchant: 'Lakeside Pharmacy', amount: 18.4},
    {id: 'a-he2', date: 'Apr 9', merchant: 'Yoga drop-in class', amount: 22},
    {id: 'a-he3', date: 'Apr 1', merchant: 'FlexFit membership', amount: 20},
  ],
  '2026-04:fun': [
    {id: 'a-f1', date: 'Apr 26', merchant: 'MoviePlex — 2 tickets', amount: 38.5},
    {id: 'a-f2', date: 'Apr 14', merchant: 'StreamMax subscription', amount: 15.99},
    {id: 'a-f3', date: 'Apr 5', merchant: 'Arcade night', amount: 27.8},
  ],
  '2026-04:savings': [
    {id: 'a-s1', date: 'Apr 1', merchant: 'Transfer — high-yield savings', amount: 700},
    {id: 'a-s2', date: 'Apr 1', merchant: 'Transfer — vacation fund', amount: 200},
  ],
  '2026-05:housing': [
    {id: 'm-h1', date: 'May 1', merchant: 'Rent — Alder Street Lofts', amount: 1650},
    {id: 'm-h2', date: 'May 1', merchant: 'HOA dues', amount: 150},
  ],
  '2026-05:groceries': [
    {id: 'm-g1', date: 'May 25', merchant: 'FreshMart', amount: 132.6},
    {id: 'm-g2', date: 'May 16', merchant: 'Green Valley Market', amount: 88.34},
    {id: 'm-g3', date: 'May 9', merchant: 'Costmart bulk run', amount: 141.77},
  ],
  '2026-05:dining': [
    {id: 'm-d1', date: 'May 28', merchant: 'Cafe Solano', amount: 47.25},
    {id: 'm-d2', date: 'May 17', merchant: 'Saigon Kitchen', amount: 58.9},
    {id: 'm-d3', date: 'May 4', merchant: 'Pizzeria Otto', amount: 36.15},
  ],
  '2026-05:transport': [
    {id: 'm-t1', date: 'May 30', merchant: 'Brake pads & service', amount: 128.44},
    {id: 'm-t2', date: 'May 20', merchant: 'Shell — fuel', amount: 52.18},
    {id: 'm-t3', date: 'May 11', merchant: 'Metro card reload', amount: 40},
    {id: 'm-t4', date: 'May 5', merchant: 'Airport parking', amount: 44},
  ],
  '2026-05:utilities': [
    {id: 'm-u1', date: 'May 12', merchant: 'City Power & Light', amount: 99.72},
    {id: 'm-u2', date: 'May 10', merchant: 'Clearwave Internet', amount: 69.99},
    {id: 'm-u3', date: 'May 5', merchant: 'Water district', amount: 17.29},
  ],
  '2026-05:health': [
    {id: 'm-he1', date: 'May 22', merchant: 'Dental copay', amount: 60},
    {id: 'm-he2', date: 'May 14', merchant: 'Lakeside Pharmacy', amount: 22.75},
    {id: 'm-he3', date: 'May 1', merchant: 'FlexFit membership', amount: 20},
  ],
  '2026-05:fun': [
    {id: 'm-f1', date: 'May 24', merchant: 'MoviePlex — 2 tickets', amount: 32},
    {id: 'm-f2', date: 'May 15', merchant: 'StreamMax subscription', amount: 15.99},
    {id: 'm-f3', date: 'May 8', merchant: 'Mini-golf with friends', amount: 24.5},
  ],
  '2026-05:savings': [
    {id: 'm-s1', date: 'May 1', merchant: 'Transfer — high-yield savings', amount: 700},
    {id: 'm-s2', date: 'May 1', merchant: 'Transfer — vacation fund', amount: 200},
  ],
  '2026-06:housing': [
    {id: 'j-h1', date: 'Jun 1', merchant: 'Rent — Alder Street Lofts', amount: 1650},
    {id: 'j-h2', date: 'Jun 1', merchant: 'HOA dues', amount: 150},
  ],
  '2026-06:groceries': [
    {id: 'j-g1', date: 'Jun 26', merchant: 'Green Valley Market', amount: 71.18},
    {id: 'j-g2', date: 'Jun 22', merchant: 'FreshMart', amount: 118.42},
    {id: 'j-g3', date: 'Jun 15', merchant: 'Costmart bulk run', amount: 96.55},
    {id: 'j-g4', date: 'Jun 8', merchant: 'FreshMart', amount: 104.07},
  ],
  '2026-06:dining': [
    {id: 'j-d1', date: 'Jun 27', merchant: 'Nori Ramen', amount: 42.8},
    {id: 'j-d2', date: 'Jun 21', merchant: 'Cafe Solano — brunch', amount: 63.15},
    {id: 'j-d3', date: 'Jun 14', merchant: 'Tacos El Rey', amount: 28.4},
    {id: 'j-d4', date: 'Jun 6', merchant: 'Pizzeria Otto', amount: 51.9},
  ],
  '2026-06:transport': [
    {id: 'j-t1', date: 'Jun 24', merchant: 'Metro card reload', amount: 40},
    {id: 'j-t2', date: 'Jun 17', merchant: 'Shell — fuel', amount: 48.62},
    {id: 'j-t3', date: 'Jun 3', merchant: 'Toll pass top-up', amount: 22.5},
  ],
  '2026-06:utilities': [
    {id: 'j-u1', date: 'Jun 12', merchant: 'City Power & Light', amount: 84.31},
    {id: 'j-u2', date: 'Jun 10', merchant: 'Clearwave Internet', amount: 69.99},
    {id: 'j-u3', date: 'Jun 5', merchant: 'Water district', amount: 16.7},
  ],
  '2026-06:health': [
    {id: 'j-he1', date: 'Jun 18', merchant: 'Lakeside Pharmacy', amount: 14.25},
    {id: 'j-he2', date: 'Jun 2', merchant: 'Summit Climbing day pass', amount: 28},
    {id: 'j-he3', date: 'Jun 1', merchant: 'FlexFit membership', amount: 20},
  ],
  '2026-06:fun': [
    {id: 'j-f1', date: 'Jun 25', merchant: 'Concert — The Night Owls', amount: 96},
    {id: 'j-f2', date: 'Jun 19', merchant: 'StreamMax subscription', amount: 15.99},
    {id: 'j-f3', date: 'Jun 13', merchant: 'Bowling night', amount: 44.6},
    {id: 'j-f4', date: 'Jun 7', merchant: 'MoviePlex — 2 tickets', amount: 38.5},
  ],
  '2026-06:savings': [
    {id: 'j-s1', date: 'Jun 1', merchant: 'Transfer — high-yield savings', amount: 700},
    {id: 'j-s2', date: 'Jun 1', merchant: 'Transfer — vacation fund', amount: 200},
  ],
};

// ============= DERIVED MATH =============

/** \`$1,650\` for whole dollars, \`$69.99\` when cents matter, \`-$62\` when negative. */
function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const text = abs.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return \`\${value < 0 ? '-' : ''}$\${text}\`;
}

interface EnvelopeRowData extends EnvelopeMeta {
  budgeted: number;
  spent: number;
  /** Overspend beyond the original budget (0 when within budget). */
  over: number;
  /** True once the overspend has been covered from safe-to-spend. */
  isCovered: boolean;
  /** budgeted + covered overspend — the denominator for the fill bar. */
  effectiveBudget: number;
  remaining: number;
  /** Percent of effective budget spent (may exceed 100). */
  pct: number;
}

function buildEnvelopeRows(
  month: MonthBudget,
  covered: ReadonlySet<string>,
): EnvelopeRowData[] {
  return month.envelopes.map(budget => {
    const meta = ENVELOPES.find(env => env.id === budget.envelopeId);
    if (meta == null) {
      throw new Error(\`Unknown envelope "\${budget.envelopeId}"\`);
    }
    const over = Math.max(0, budget.spent - budget.budgeted);
    const isCovered = over > 0 && covered.has(\`\${month.id}:\${budget.envelopeId}\`);
    const effectiveBudget = budget.budgeted + (isCovered ? over : 0);
    return {
      ...meta,
      budgeted: budget.budgeted,
      spent: budget.spent,
      over,
      isCovered,
      effectiveBudget,
      remaining: effectiveBudget - budget.spent,
      pct: Math.round((budget.spent / effectiveBudget) * 100),
    };
  });
}

/** Fill color: green while comfortable, amber near the cap, red once over. */
function barColor(pct: number): string {
  return pct > 100 ? colors.red : pct >= 80 ? colors.amber : colors.green;
}

/** Even-pace remaining dollars on a given day of the month. */
function paceRemaining(month: MonthBudget, day: number): number {
  return month.flexBudget * (1 - day / month.days);
}

// ============= WIDGETS =============

function KpiCard({
  label,
  value,
  description,
  isDescriptionAlert = false,
  progressPct,
}: {
  label: string;
  value: string;
  description: string;
  isDescriptionAlert?: boolean;
  progressPct?: number;
}) {
  return (
    <Card>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Heading level={2}>{value}</Heading>
        <Text
          type="supporting"
          color={isDescriptionAlert ? undefined : 'secondary'}
          style={isDescriptionAlert ? styles.overText : styles.numeric}>
          {description}
        </Text>
        {progressPct != null && (
          <ProgressBar
            value={Math.min(progressPct, 100)}
            max={100}
            label={\`\${label} progress\`}
            isLabelHidden
          />
        )}
      </VStack>
    </Card>
  );
}

/**
 * CSS-only flexible-spend burn-down: one flex column per day; the solid bar
 * is actual remaining dollars, the tinted ghost behind it is even pace.
 * Presentational only (role="img"); the caption restates every figure.
 */
function BurnDownStrip({
  month,
  isPhone,
}: {
  month: MonthBudget;
  isPhone: boolean;
}) {
  const days = Array.from({length: month.days}, (_, index) => index + 1);
  const lastRemaining = month.burndown[month.burndown.length - 1];
  const paceNow = Math.round(paceRemaining(month, month.asOfDay));
  const delta = lastRemaining - paceNow;
  const isComplete = month.asOfDay === month.days;

  const summary = isComplete
    ? \`Ended \${month.full} with \${formatUsd(lastRemaining)} of flexible spend left\`
    : \`\${formatUsd(lastRemaining)} of flexible spend left through day \${month.asOfDay}\`;
  const paceLine =
    delta >= 0
      ? \`\${formatUsd(delta)} ahead of even pace\`
      : \`\${formatUsd(Math.abs(delta))} behind even pace\`;

  // Phones thin the day labels to 1 / 15 / month-end; desktop labels weekly.
  const showLabel = (day: number) =>
    isPhone
      ? day === 1 || day === 15 || day === month.days
      : day % 7 === 1 || day === month.days;

  return (
    <VStack gap={2}>
      <div
        role="img"
        aria-label={\`Burn-down for \${month.full}: started at \${formatUsd(
          month.flexBudget,
        )}, \${summary.toLowerCase()}, \${paceLine}.\`}
        style={styles.burnRow}>
        {days.map(day => {
          const actual = month.burndown[day - 1];
          const pacePct = Math.max(
            (paceRemaining(month, day) / month.flexBudget) * 100,
            0,
          );
          return (
            <div key={day} style={styles.burnCol}>
              <div style={{...styles.burnGhost, height: \`\${pacePct}%\`}} />
              {actual != null && (
                <div
                  style={{
                    ...styles.burnBar,
                    height: \`\${Math.max((actual / month.flexBudget) * 100, 2)}%\`,
                    backgroundColor:
                      actual >= paceRemaining(month, day)
                        ? colors.blue
                        : colors.amber,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      <div style={styles.burnLabels}>
        {days.map(day => (
          <div key={day} style={styles.burnLabel}>
            <Text type="supporting" color="secondary" size="sm" maxLines={1}>
              {showLabel(day) ? String(day) : ''}
            </Text>
          </div>
        ))}
      </div>
      <Text type="supporting" color="secondary" style={styles.numeric}>
        {summary} · {paceLine}. Solid bars are actual remaining; the tint
        behind them is even pace on the {formatUsd(month.flexBudget)} flexible
        pool (Housing and Savings clear on day 1).
      </Text>
    </VStack>
  );
}

function EnvelopeRow({
  row,
  monthId,
  isExpanded,
  isPhone,
  onToggle,
}: {
  row: EnvelopeRowData;
  monthId: string;
  isExpanded: boolean;
  isPhone: boolean;
  onToggle: (envelopeId: string) => void;
}) {
  const regionId = \`txns-\${monthId}-\${row.id}\`;
  const txns = TRANSACTIONS[\`\${monthId}:\${row.id}\`] ?? [];

  const chip = (
    <div style={{...styles.chip, background: chipGradients[row.id]}}>
      <Icon icon={row.icon} size="sm" color="inherit" />
    </div>
  );

  const track = (
    <div style={styles.barTrack}>
      <div
        style={{
          ...styles.barFill,
          width: \`\${Math.min(row.pct, 100)}%\`,
          backgroundColor: barColor(row.pct),
        }}
      />
    </div>
  );

  const remainingText =
    row.remaining < 0 ? (
      <Text type="label" style={styles.overText}>
        {formatUsd(row.remaining)}
      </Text>
    ) : (
      <Text type="label" style={styles.numeric}>
        {formatUsd(row.remaining)} left
      </Text>
    );

  const statusBadge = row.isCovered ? (
    <Badge label="Covered" variant="green" />
  ) : row.over > 0 ? (
    <HStack gap={1} vAlign="center">
      <span style={styles.alertIcon}>
        <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
      </span>
      <Badge label={\`Over \${formatUsd(row.over)}\`} variant="red" />
    </HStack>
  ) : null;

  const chevron = (
    <span
      style={
        isExpanded ? {...styles.chevron, ...styles.chevronOpen} : styles.chevron
      }
      aria-hidden>
      <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
    </span>
  );

  return (
    <VStack gap={0}>
      <button
        type="button"
        style={styles.rowButton}
        aria-expanded={isExpanded}
        aria-controls={isExpanded ? regionId : undefined}
        onClick={() => onToggle(row.id)}>
        {isPhone ? (
          // <=640px: three stacked lines — identity + remaining, full-width
          // bar, then figures + alert Badge — inside one >=44px tap target.
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              {chip}
              <StackItem size="fill">
                <Text type="label" maxLines={1}>
                  {row.name}
                </Text>
              </StackItem>
              {remainingText}
              {chevron}
            </HStack>
            {track}
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  {formatUsd(row.spent)} of {formatUsd(row.effectiveBudget)}
                </Text>
              </StackItem>
              {statusBadge}
            </HStack>
          </VStack>
        ) : (
          <HStack gap={3} vAlign="center">
            {chip}
            <div style={styles.nameCol}>
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {row.name}
                </Text>
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  {formatUsd(row.spent)} of {formatUsd(row.effectiveBudget)}
                </Text>
              </VStack>
            </div>
            <StackItem size="fill">{track}</StackItem>
            <div style={styles.rightCol}>
              {remainingText}
              {statusBadge}
            </div>
            {chevron}
          </HStack>
        )}
      </button>
      {isExpanded && (
        <div
          id={regionId}
          style={isPhone ? styles.txnRegionCompact : styles.txnRegion}>
          <VStack gap={0}>
            {txns.map((txn, index) => (
              <VStack key={txn.id} gap={0}>
                <HStack gap={3} vAlign="center" style={{paddingBlock: 8}}>
                  <div style={styles.txnDate}>
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.numeric}>
                      {txn.date}
                    </Text>
                  </div>
                  <StackItem size="fill">
                    <Text type="body" maxLines={1}>
                      {txn.merchant}
                    </Text>
                  </StackItem>
                  <Text type="body" style={styles.numeric}>
                    {formatUsd(txn.amount)}
                  </Text>
                </HStack>
                {index < txns.length - 1 && <Divider />}
              </VStack>
            ))}
            <Text type="supporting" color="secondary">
              Most recent {txns.length} transactions this month
            </Text>
          </VStack>
        </div>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function BudgetTrackerTemplate() {
  const [monthId, setMonthId] = useState(DEFAULT_MONTH_ID);
  // Expanded envelope, keyed \`\${monthId}:\${envelopeId}\` so each month keeps
  // its own reveal state across the month switcher.
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  // Overspends covered from safe-to-spend, same per-month keying.
  const [coveredKeys, setCoveredKeys] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [envelopeFilter, setEnvelopeFilter] = useState('all');

  // Responsive contract: <=900px undocks the month-summary panel into the
  // content column; <=640px restacks envelope rows and grows tap targets.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const month =
    MONTHS.find(candidate => candidate.id === monthId) ??
    MONTHS[MONTHS.length - 1];

  const rows = useMemo(
    () => buildEnvelopeRows(month, coveredKeys),
    [month, coveredKeys],
  );

  // ---- KPI math ----
  // Covering an overspend allocates more to that envelope, so it raises
  // Budgeted and lowers Safe-to-spend by the same amount — honest math.
  const budgetedTotal = rows.reduce((sum, row) => sum + row.effectiveBudget, 0);
  const spentTotal = rows.reduce((sum, row) => sum + row.spent, 0);
  const safeToSpend = month.income - budgetedTotal;
  const uncoveredOver = rows.reduce(
    (sum, row) => sum + (row.isCovered ? 0 : row.over),
    0,
  );
  const overRows = rows.filter(row => row.over > 0);
  const visibleRows =
    envelopeFilter === 'over' ? overRows : rows;

  const toggleEnvelope = (envelopeId: string) => {
    const key = \`\${month.id}:\${envelopeId}\`;
    setExpandedKey(prev => (prev === key ? null : key));
  };

  const coverEnvelope = (envelopeId: string) => {
    setCoveredKeys(prev => new Set([...prev, \`\${month.id}:\${envelopeId}\`]));
  };

  // Month summary body — docked in a LayoutPanel on wide viewports, rendered
  // as a Card at the bottom of the column <=900px (single-pane fallback).
  const monthSummary = (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label">Overspent envelopes</Text>
        {overRows.length === 0 ? (
          <HStack gap={2} vAlign="center">
            <span style={styles.coveredIcon}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" color="secondary">
              Every envelope is within budget this month.
            </Text>
          </HStack>
        ) : (
          overRows.map(row => (
            <HStack key={row.id} gap={2} vAlign="center">
              <span style={row.isCovered ? styles.coveredIcon : styles.alertIcon}>
                <Icon
                  icon={row.isCovered ? CheckCircle2Icon : AlertTriangleIcon}
                  size="sm"
                  color="inherit"
                />
              </span>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="supporting" maxLines={1}>
                    {row.name}
                  </Text>
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.numeric}>
                    {row.isCovered
                      ? \`Covered \${formatUsd(row.over)} from Safe to spend\`
                      : \`\${formatUsd(row.over)} over budget\`}
                  </Text>
                </VStack>
              </StackItem>
              {!row.isCovered && (
                <Button
                  label="Cover"
                  size="sm"
                  variant="secondary"
                  onClick={() => coverEnvelope(row.id)}
                />
              )}
            </HStack>
          ))
        )}
      </VStack>
      <Divider />
      <VStack gap={2}>
        <Text type="label">Bills</Text>
        {month.bills.map(bill => (
          <HStack key={bill.id} gap={2} vAlign="center">
            <div style={styles.txnDate}>
              <Text type="supporting" color="secondary" style={styles.numeric}>
                {bill.date}
              </Text>
            </div>
            <StackItem size="fill">
              <Text type="supporting" maxLines={1}>
                {bill.name}
              </Text>
            </StackItem>
            <Text type="supporting" style={styles.numeric}>
              {formatUsd(bill.amount)}
            </Text>
            <Badge
              label={bill.status === 'paid' ? 'Paid' : 'Due'}
              variant={bill.status === 'paid' ? 'neutral' : 'orange'}
            />
          </HStack>
        ))}
      </VStack>
      <Divider />
      <Text type="supporting" color="secondary">
        Unspent envelope dollars roll into next month's starting balances;
        Safe to spend does not roll over.
      </Text>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <div style={styles.brandChip}>
                  <Icon icon={WalletIcon} size="sm" color="inherit" />
                </div>
                <Heading level={1}>Budget Tracker</Heading>
                {!isPhone && (
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.numeric}>
                    {month.full} · {formatUsd(month.income)} income
                  </Text>
                )}
              </HStack>
            </StackItem>
            <SegmentedControl
              value={monthId}
              onChange={setMonthId}
              label="Month"
              size={isPhone ? 'lg' : 'md'}>
              {MONTHS.map(candidate => (
                <SegmentedControlItem
                  key={candidate.id}
                  value={candidate.id}
                  label={candidate.label}
                />
              ))}
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} label="Month summary">
            <VStack gap={4}>
              <Heading level={3}>Month summary</Heading>
              {monthSummary}
            </VStack>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={6}>
          <div style={styles.page}>
            <VStack gap={6}>
              {/* KPI row — 4-up, reflowing to 2-up and 1-up as space narrows */}
              <Grid columns={{minWidth: 200, max: 4}} gap={4}>
                <KpiCard
                  label="Income"
                  value={formatUsd(month.income)}
                  description={month.incomeNote}
                />
                <KpiCard
                  label="Budgeted"
                  value={formatUsd(budgetedTotal)}
                  description={\`\${Math.round(
                    (budgetedTotal / month.income) * 100,
                  )}% of income across \${rows.length} envelopes\`}
                  progressPct={(budgetedTotal / month.income) * 100}
                />
                <KpiCard
                  label="Spent"
                  value={formatUsd(spentTotal)}
                  description={\`\${Math.round(
                    (spentTotal / budgetedTotal) * 100,
                  )}% of budgeted\${
                    month.asOfDay < month.days
                      ? \` · through day \${month.asOfDay}\`
                      : ''
                  }\`}
                  progressPct={(spentTotal / budgetedTotal) * 100}
                />
                <KpiCard
                  label="Safe to spend"
                  value={formatUsd(safeToSpend)}
                  description={
                    uncoveredOver > 0
                      ? \`\${formatUsd(uncoveredOver)} overspend not yet covered\`
                      : 'After envelopes and covered overspends'
                  }
                  isDescriptionAlert={uncoveredOver > 0}
                />
              </Grid>

              {/* Flexible-spend burn-down — CSS-only bars, no chart library */}
              <Card>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={3}>Monthly burn-down</Heading>
                    <Text type="supporting" color="secondary">
                      Flexible spend remaining per day vs even pace
                    </Text>
                  </HStack>
                  <BurnDownStrip month={month} isPhone={isPhone} />
                </VStack>
              </Card>

              {/* Envelope ledger — click a row to reveal its transactions */}
              <Card>
                <VStack gap={2}>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <HStack gap={2} vAlign="center">
                        <Heading level={3}>Envelopes</Heading>
                        <Text type="supporting" color="secondary">
                          Tap a row for recent transactions
                        </Text>
                      </HStack>
                    </StackItem>
                    <SegmentedControl
                      value={envelopeFilter}
                      onChange={setEnvelopeFilter}
                      label="Envelope filter"
                      size={isPhone ? 'lg' : 'md'}>
                      <SegmentedControlItem
                        value="all"
                        label={\`All (\${rows.length})\`}
                      />
                      <SegmentedControlItem
                        value="over"
                        label={\`Over budget (\${overRows.length})\`}
                      />
                    </SegmentedControl>
                  </HStack>
                  <VStack gap={0}>
                    {visibleRows.map((row, index) => (
                      <VStack key={row.id} gap={0}>
                        <EnvelopeRow
                          row={row}
                          monthId={month.id}
                          isExpanded={expandedKey === \`\${month.id}:\${row.id}\`}
                          isPhone={isPhone}
                          onToggle={toggleEnvelope}
                        />
                        {index < visibleRows.length - 1 && <Divider />}
                      </VStack>
                    ))}
                    {visibleRows.length === 0 && (
                      <Text type="supporting" color="secondary">
                        No envelopes match this filter for {month.full}.
                      </Text>
                    )}
                  </VStack>
                </VStack>
              </Card>

              {/* <=900px single-pane fallback: the docked panel's content
                  joins the column as a Card instead. */}
              {isStacked && (
                <Card>
                  <VStack gap={4}>
                    <Heading level={3}>Month summary</Heading>
                    {monthSummary}
                  </VStack>
                </Card>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};