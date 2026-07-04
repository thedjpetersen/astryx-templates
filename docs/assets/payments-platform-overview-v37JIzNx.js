var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Ledgerline's fictional payments book:
 *   28 fixed daily gross-volume samples (Jun 5 – Jul 2, 2026) for both live
 *   and test environments, ten live payments (and four test payments) with
 *   statuses, payment methods, and risk scores, two open disputes derived
 *   from the disputed table rows, a payout schedule whose three upcoming
 *   payouts sum exactly to the available balance, and a 7-day fraud-block
 *   series whose per-rule hit counts sum to the blocked-attempts total.
 *   No clocks, no randomness, no network media.
 * @output Payments Platform Overview — the logged-in home of "Ledgerline",
 *   a fictional payments platform (Stripe-style). A gross-volume area chart
 *   with labeled axes, a 7d/14d range control, and a previous-period compare
 *   overlay; a balance + next-payout card with the rolling payout schedule;
 *   a fraud-radar strip (blocked-attempts sparkline + top rules hit); a
 *   recent-payments table (amount, status, method, customer, risk score)
 *   with a status filter whose counts match the rows; a disputes panel with
 *   two cases needing evidence by fixed due dates; and a test-mode Switch
 *   that swaps every region to the simulated test dataset under a warning
 *   banner.
 * @position Page template; emitted by \`astryx template payments-platform-overview\`
 *
 * Frame: dashboard archetype per \`kpi-dashboard.tsx\` — Layout height="auto"
 *   (whole page scrolls), LayoutHeader with brand mark, test-mode Switch and
 *   primary CTA; LayoutContent with a 2-column widget grid
 *   (minmax(0,1fr) + 340px rail) for chart/balance and table/disputes rows.
 * Container policy: dashboard widgets live in Cards (chart, balance,
 *   fraud radar, payments table, disputes) — the kpi-dashboard precedent;
 *   rows inside cards are styled divs, no nested cards.
 * Color policy: token-pure except (a) the ONE Ledgerline brand accent,
 *   indigo \`light-dark(#4F46E5, #818CF8)\`, used only for the brand mark,
 *   the current gross-volume series, and the next-payout emphasis tint; and
 *   (b) the repo-standard \`light-dark()\` fallback pairs on data-viz
 *   categorical tokens. The previous-period compare line and axis chrome sit
 *   on neutral theme tokens so the accent stays singular.
 *
 * Responsive contract:
 * - > 1080px (designed at 1440x900): chart+balance and table+disputes render
 *   as two-column grid rows with a 340px end rail.
 * - <= 1080px: both grids collapse to one column; the balance card and the
 *   disputes panel stack under their neighbors. Header rows wrap
 *   (\`flexWrap\`) instead of clipping the range control or CTA.
 * - <= 720px: the payments table drops the Risk column so
 *   amount/status/method/customer never crush; the fraud-radar strip wraps
 *   its rule meters below the sparkline.
 * - Numeric cells are right-aligned with tabular numerals throughout.
 */

import {useState, type CSSProperties} from 'react';

import {
  CreditCardIcon,
  FileWarningIcon,
  LandmarkIcon,
  LayersIcon,
  PlusIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  WalletIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Stat} from '@astryxdesign/core/Stat';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BRAND =============

// Ledgerline indigo — the ONE brand accent (light: indigo-600, dark:
// indigo-400). Used only for the brand mark, the current gross-volume
// series, and the next-payout emphasis tint. AA-checked: #4F46E5 on white
// 6.3:1; #818CF8 on near-black surfaces 6.9:1.
const BRAND_ACCENT = 'light-dark(#4F46E5, #818CF8)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(79,70,229,0.10), rgba(129,140,248,0.16))';
const BRAND_ACCENT_FILL =
  'light-dark(rgba(79,70,229,0.16), rgba(129,140,248,0.20))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Brand tile in the header: accent-filled rounded square + white glyph.
  brandTile: {
    alignItems: 'center',
    backgroundColor: BRAND_ACCENT,
    borderRadius: 'var(--radius-control, 8px)',
    color: 'light-dark(#FFFFFF, #1E1B4B)',
    display: 'flex',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  wordmark: {letterSpacing: '-0.02em'},
  // Scoped re-pin for Switches: the Switch knob paints
  // --color-background-surface (#1F1F22 in dark), which vanishes against the
  // off-state --color-background-gray track (#666A724C over the dark header
  // ≈ the same shade). Lightening the OFF track — not the knob — keeps the
  // ON state intact (its track is --color-accent, white-ish in dark here, so
  // a lightened knob would disappear there instead). Light mode keeps the
  // stock #0A131733 track; dark gets a solid gray the dark knob reads
  // against at ~3.5:1.
  switchKnobScope: {
    '--color-background-gray': 'light-dark(#0A131733, #6F747C)',
  } as CSSProperties,
  // Two-column dashboard rows: main widget + 340px end rail.
  splitGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    alignItems: 'stretch',
  },
  splitGridNarrow: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // Gross-volume chart: fixed viewBox scales to the card width.
  chartSvg: {display: 'block', height: 'auto', width: '100%'},
  chartWrap: {minWidth: 0},
  legendSwatch: {
    backgroundColor: BRAND_ACCENT,
    borderRadius: 2,
    display: 'inline-block',
    height: 3,
    width: 16,
  },
  legendDash: {
    borderTop: '3px dashed var(--color-text-secondary)',
    display: 'inline-block',
    height: 0,
    width: 16,
  },
  // Numeric readouts: tabular numerals, right-aligned in table cells.
  numericCell: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  tabular: {fontVariantNumeric: 'tabular-nums'},
  // Balance card: the next-payout block is the one accent-tinted surface.
  nextPayout: {
    backgroundColor: BRAND_ACCENT_SOFT,
    border: \`var(--border-width) solid \${BRAND_ACCENT}\`,
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  payoutRow: {
    alignItems: 'baseline',
    display: 'flex',
    gap: 'var(--spacing-2)',
    justifyContent: 'space-between',
  },
  // Disputes panel: one bordered row per case (no nested cards).
  disputeRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  // Fraud radar: sparkline bars + rule meters share one strip.
  sparkCol: {minWidth: 220},
  ruleMeterTrack: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  ruleMeterFill: {
    backgroundColor:
      'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    borderRadius: 999,
    height: '100%',
  },
  riskWrap: {
    alignItems: 'center',
    display: 'flex',
    gap: 'var(--spacing-1)',
    justifyContent: 'flex-end',
  },
  // Fixed-width score + label keep the risk StatusDots vertically aligned
  // across rows (labels vary: Normal / Elevated / Highest).
  riskScore: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
    width: '2ch',
  },
  riskLabel: {flexShrink: 0, width: 52},
  methodWrap: {
    alignItems: 'center',
    display: 'flex',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  // Breathing room under the table so the last row clears the card border.
  tableWrap: {paddingBottom: 'var(--spacing-2)'},
  // display:block so overflow/text-overflow apply (inline spans ignore them).
  cellText: {
    display: 'block',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

// ============= FORMATTERS =============

/** $1,248.00 — fixed en-US currency formatting, deterministic. */
function usd(amount: number): string {
  return amount.toLocaleString('en-US', {
    currency: 'USD',
    style: 'currency',
  });
}

/** $146,000 — whole-dollar variant for chart headers and axis extremes. */
function usdWhole(amount: number): string {
  return \`$\${Math.round(amount).toLocaleString('en-US')}\`;
}

/** Axis tick label: $12k / $7.5k / $400. */
function axisLabel(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return \`$\${Number.isInteger(k) ? k : k.toFixed(1)}k\`;
  }
  return \`$\${value}\`;
}

/** Round a chart maximum up to a tidy tick step. */
function niceCeil(value: number): number {
  const pow = 10 ** Math.floor(Math.log10(Math.max(value, 1)));
  const unit = pow / 2;
  return Math.ceil(value / unit) * unit;
}

// ============= DATA — GROSS VOLUME =============

// "Today" inside every fixture is Wednesday, Jul 2, 2026. 28 daily samples
// (Jun 5 – Jul 2) so the 7d/14d range control can slice the current window
// from the tail and the compare overlay from the window before it. All
// header totals and deltas are reduced from this single array, so the chart,
// its caption, and the gross-volume stat reconcile by construction.
interface DailyVolume {
  date: string; // short label for the x-axis
  amount: number; // gross volume in USD
}

const LIVE_DAILY_VOLUME: DailyVolume[] = [
  {date: 'Jun 5', amount: 7480},
  {date: 'Jun 6', amount: 8120},
  {date: 'Jun 7', amount: 6890},
  {date: 'Jun 8', amount: 8460},
  {date: 'Jun 9', amount: 8790},
  {date: 'Jun 10', amount: 8310},
  {date: 'Jun 11', amount: 9040},
  {date: 'Jun 12', amount: 9420},
  {date: 'Jun 13', amount: 8150},
  {date: 'Jun 14', amount: 7610},
  {date: 'Jun 15', amount: 9260},
  {date: 'Jun 16', amount: 9580},
  {date: 'Jun 17', amount: 9110},
  {date: 'Jun 18', amount: 9840},
  {date: 'Jun 19', amount: 10190},
  {date: 'Jun 20', amount: 8720},
  {date: 'Jun 21', amount: 8060},
  {date: 'Jun 22', amount: 10480},
  {date: 'Jun 23', amount: 10920},
  {date: 'Jun 24', amount: 10310},
  {date: 'Jun 25', amount: 11040},
  {date: 'Jun 26', amount: 11460},
  {date: 'Jun 27', amount: 9370},
  {date: 'Jun 28', amount: 8590},
  {date: 'Jun 29', amount: 11210},
  {date: 'Jun 30', amount: 11890},
  {date: 'Jul 1', amount: 11520},
  {date: 'Jul 2', amount: 12240},
];

// Test-mode volume: the same 28-day shape at simulated-checkout scale, so
// toggling test mode keeps the chart geometry sensible.
const TEST_DAILY_VOLUME: DailyVolume[] = [
  {date: 'Jun 5', amount: 120},
  {date: 'Jun 6', amount: 180},
  {date: 'Jun 7', amount: 95},
  {date: 'Jun 8', amount: 210},
  {date: 'Jun 9', amount: 160},
  {date: 'Jun 10', amount: 240},
  {date: 'Jun 11', amount: 190},
  {date: 'Jun 12', amount: 260},
  {date: 'Jun 13', amount: 140},
  {date: 'Jun 14', amount: 110},
  {date: 'Jun 15', amount: 280},
  {date: 'Jun 16', amount: 230},
  {date: 'Jun 17', amount: 305},
  {date: 'Jun 18', amount: 260},
  {date: 'Jun 19', amount: 330},
  {date: 'Jun 20', amount: 215},
  {date: 'Jun 21', amount: 185},
  {date: 'Jun 22', amount: 340},
  {date: 'Jun 23', amount: 310},
  {date: 'Jun 24', amount: 285},
  {date: 'Jun 25', amount: 355},
  {date: 'Jun 26', amount: 320},
  {date: 'Jun 27', amount: 245},
  {date: 'Jun 28', amount: 205},
  {date: 'Jun 29', amount: 365},
  {date: 'Jun 30', amount: 390},
  {date: 'Jul 1', amount: 335},
  {date: 'Jul 2', amount: 287},
];

// ============= DATA — PAYMENTS =============

type PaymentStatus = 'succeeded' | 'refunded' | 'disputed';
type MethodKind = 'card' | 'bank' | 'wallet';

interface PaymentRow extends Record<string, unknown> {
  id: string;
  amount: number;
  status: PaymentStatus;
  methodKind: MethodKind;
  methodLabel: string;
  customer: string;
  risk: number; // 0–99, Ledgerline risk score
  created: string;
}

// Ten live payments across Jul 1–2, 2026. Status mix: 6 succeeded,
// 2 refunded, 2 disputed — the filter counts and the disputes panel derive
// from these rows, so every count shown elsewhere reconciles with this list.
const LIVE_PAYMENTS: PaymentRow[] = [
  {
    id: 'py_1Lx84QaT2vR9',
    amount: 1248.0,
    status: 'succeeded',
    methodKind: 'card',
    methodLabel: 'Card •• 4242',
    customer: 'orders@lumefolk.com',
    risk: 12,
    created: 'Jul 2, 9:41 AM',
  },
  {
    id: 'py_1Lx82KmW8pF3',
    amount: 86.0,
    status: 'succeeded',
    methodKind: 'wallet',
    methodLabel: 'Wallet pay',
    customer: 'mari.okafor@sablecafe.com',
    risk: 8,
    created: 'Jul 2, 9:12 AM',
  },
  {
    id: 'py_1Lx7wTnJ4dQ6',
    amount: 432.5,
    status: 'refunded',
    methodKind: 'card',
    methodLabel: 'Card •• 8812',
    customer: 'billing@northloomstudio.com',
    risk: 21,
    created: 'Jul 2, 8:47 AM',
  },
  {
    id: 'py_1Lx7pVdN6sB1',
    amount: 2150.0,
    status: 'disputed',
    methodKind: 'card',
    methodLabel: 'Card •• 3007',
    customer: 'kenji.sato@arboraudio.com',
    risk: 82,
    created: 'Jul 1, 11:26 PM',
  },
  {
    id: 'py_1Lx7hRcK9mV4',
    amount: 310.75,
    status: 'succeeded',
    methodKind: 'bank',
    methodLabel: 'Bank •• 6021',
    customer: 'ap@fernline.com',
    risk: 15,
    created: 'Jul 1, 6:03 PM',
  },
  {
    id: 'py_1Lx7cJbF2wH8',
    amount: 54.0,
    status: 'succeeded',
    methodKind: 'wallet',
    methodLabel: 'Wallet pay',
    customer: 'tessa@quiltandquill.com',
    risk: 11,
    created: 'Jul 1, 4:38 PM',
  },
  {
    id: 'py_1Lx76FsR5gY2',
    amount: 918.4,
    status: 'disputed',
    methodKind: 'card',
    methodLabel: 'Card •• 5561',
    customer: 'dmitri@voltbikeparts.com',
    risk: 78,
    created: 'Jul 1, 2:19 PM',
  },
  {
    id: 'py_1Lx71ZeB7kM5',
    amount: 189.99,
    status: 'succeeded',
    methodKind: 'card',
    methodLabel: 'Card •• 0119',
    customer: 'hello@petalpress.com',
    risk: 34,
    created: 'Jul 1, 12:52 PM',
  },
  {
    id: 'py_1Lx6vNhQ3tC7',
    amount: 67.25,
    status: 'refunded',
    methodKind: 'wallet',
    methodLabel: 'Wallet pay',
    customer: 'sam.reyes@copperkettle.com',
    risk: 18,
    created: 'Jul 1, 10:31 AM',
  },
  {
    id: 'py_1Lx6qLdV1nZ9',
    amount: 1024.0,
    status: 'succeeded',
    methodKind: 'bank',
    methodLabel: 'Bank •• 8834',
    customer: 'finance@driftwoodgoods.com',
    risk: 67,
    created: 'Jul 1, 9:05 AM',
  },
];

// Four simulated test payments (test mode swaps the table to these).
const TEST_PAYMENTS: PaymentRow[] = [
  {
    id: 'py_test_4Qa8Tz2R',
    amount: 42.0,
    status: 'succeeded',
    methodKind: 'card',
    methodLabel: 'Card •• 4242',
    customer: 'test+jenny@ledgerline.dev',
    risk: 5,
    created: 'Jul 2, 9:02 AM',
  },
  {
    id: 'py_test_2KmW6pF1',
    amount: 19.99,
    status: 'succeeded',
    methodKind: 'wallet',
    methodLabel: 'Wallet pay',
    customer: 'test+omar@ledgerline.dev',
    risk: 3,
    created: 'Jul 2, 8:55 AM',
  },
  {
    id: 'py_test_7wTnH4dQ',
    amount: 150.0,
    status: 'refunded',
    methodKind: 'card',
    methodLabel: 'Card •• 0005',
    customer: 'test+refund@ledgerline.dev',
    risk: 7,
    created: 'Jul 1, 3:20 PM',
  },
  {
    id: 'py_test_9hRcB2mV',
    amount: 75.5,
    status: 'succeeded',
    methodKind: 'bank',
    methodLabel: 'Bank •• 6789',
    customer: 'test+ach@ledgerline.dev',
    risk: 4,
    created: 'Jul 1, 11:47 AM',
  },
];

// ============= DATA — DISPUTES, PAYOUTS, FRAUD =============

interface Dispute {
  id: string;
  paymentId: string;
  amount: number; // matches the disputed payment row exactly
  reason: string;
  customer: string;
  evidenceDue: string;
  daysLeft: number; // relative to the fixed "today", Jul 2 2026
}

// Both disputes point at the two \`disputed\` rows in LIVE_PAYMENTS —
// same payment ids, amounts, and customers, so the panel and the table
// visibly agree. Test mode has no disputes (EmptyState).
const LIVE_DISPUTES: Dispute[] = [
  {
    id: 'dp_9Q2MHTKR',
    paymentId: 'py_1Lx7pVdN6sB1',
    amount: 2150.0,
    reason: 'Fraudulent',
    customer: 'kenji.sato@arboraudio.com',
    evidenceDue: 'Jul 9, 2026',
    daysLeft: 7,
  },
  {
    id: 'dp_8X7KLPWD',
    paymentId: 'py_1Lx76FsR5gY2',
    amount: 918.4,
    reason: 'Product not received',
    customer: 'dmitri@voltbikeparts.com',
    evidenceDue: 'Jul 14, 2026',
    daysLeft: 12,
  },
];

interface UpcomingPayout {
  arrives: string;
  amount: number;
}

// The three scheduled payouts sum to exactly the available balance
// ($12,480.32 + $9,867.14 + $10,063.39 = $32,410.85), i.e. the full
// available balance is spoken for across the next three business days.
const LIVE_BALANCE = {
  available: 32410.85,
  pending: 8924.1,
  payoutAccount: 'First Harbor Bank •••• 4417',
  schedule: 'Daily · 2-business-day rolling basis',
  upcoming: [
    {arrives: 'Mon, Jul 6', amount: 12480.32},
    {arrives: 'Tue, Jul 7', amount: 9867.14},
    {arrives: 'Wed, Jul 8', amount: 10063.39},
  ] as UpcomingPayout[],
};

const TEST_BALANCE = {
  available: 287.49,
  pending: 75.5, // the settling test bank debit
  payoutAccount: 'Test bank •••• 0000',
  schedule: 'Payouts are simulated in test mode',
  upcoming: [] as UpcomingPayout[],
};

// Fraud radar — last 7 days (Jun 26 – Jul 2). The per-day blocked counts
// sum to 38; the per-rule hit counts also sum to 38, so the strip
// reconciles with itself in both directions.
const FRAUD_BLOCKED_DAILY = [
  {date: 'Jun 26', blocked: 4},
  {date: 'Jun 27', blocked: 6},
  {date: 'Jun 28', blocked: 5},
  {date: 'Jun 29', blocked: 7},
  {date: 'Jun 30', blocked: 3},
  {date: 'Jul 1', blocked: 6},
  {date: 'Jul 2', blocked: 7},
];

const FRAUD_RULES_HIT = [
  {rule: 'Block if CVC verification fails', hits: 16},
  {rule: 'Block if risk score is above 75', hits: 13},
  {rule: 'Block cards on the network blocklist', hits: 9},
];

// ============= STATUS / RISK METADATA =============

const STATUS_META: Record<
  PaymentStatus,
  {label: string; variant: 'success' | 'neutral' | 'error'}
> = {
  succeeded: {label: 'Succeeded', variant: 'success'},
  refunded: {label: 'Refunded', variant: 'neutral'},
  disputed: {label: 'Disputed', variant: 'error'},
};

type RiskLevel = 'normal' | 'elevated' | 'highest';

function riskLevel(score: number): RiskLevel {
  if (score >= 75) {
    return 'highest';
  }
  return score >= 65 ? 'elevated' : 'normal';
}

const RISK_META: Record<
  RiskLevel,
  {label: string; variant: 'success' | 'warning' | 'error'}
> = {
  normal: {label: 'Normal', variant: 'success'},
  elevated: {label: 'Elevated', variant: 'warning'},
  highest: {label: 'Highest', variant: 'error'},
};

const METHOD_ICON: Record<MethodKind, typeof CreditCardIcon> = {
  card: CreditCardIcon,
  bank: LandmarkIcon,
  wallet: WalletIcon,
};

// ============= GROSS-VOLUME AREA CHART =============

// Fixed geometry; the SVG scales to the card width via viewBox. The left
// gutter fits five "$12.5k"-style tick labels; the bottom band fits date
// labels without clipping.
const CHART_W = 760;
const CHART_H = 280;
const CHART_PAD_L = 56;
const CHART_PAD_R = 14;
const CHART_PAD_T = 14;
const CHART_PAD_B = 34;

interface VolumeChartProps {
  current: DailyVolume[];
  previous: DailyVolume[];
  compare: boolean;
}

/**
 * Custom SVG area chart: current-period indigo area (the one brand-accent
 * data series) with an optional previous-period dashed compare line on a
 * neutral token. Labeled Y axis ($ ticks), labeled X axis (5 date ticks),
 * horizontal gridlines, and an end-point marker on today's value.
 */
function GrossVolumeChart({current, previous, compare}: VolumeChartProps) {
  const n = current.length;
  const innerW = CHART_W - CHART_PAD_L - CHART_PAD_R;
  const innerH = CHART_H - CHART_PAD_T - CHART_PAD_B;
  const baseline = CHART_PAD_T + innerH;

  const maxValue = Math.max(
    ...current.map(d => d.amount),
    ...(compare ? previous.map(d => d.amount) : [0]),
  );
  const yMax = niceCeil(maxValue);
  const x = (i: number) => CHART_PAD_L + (i * innerW) / (n - 1);
  const y = (v: number) => CHART_PAD_T + innerH - (v / yMax) * innerH;

  const currentPts = current
    .map((d, i) => \`\${x(i).toFixed(1)},\${y(d.amount).toFixed(1)}\`)
    .join(' ');
  const areaPath =
    \`M\${CHART_PAD_L},\${baseline} L\` +
    current
      .map((d, i) => \`\${x(i).toFixed(1)},\${y(d.amount).toFixed(1)}\`)
      .join(' L') +
    \` L\${CHART_PAD_L + innerW},\${baseline} Z\`;
  const previousPts = previous
    .map((d, i) => \`\${x(i).toFixed(1)},\${y(d.amount).toFixed(1)}\`)
    .join(' ');

  // Five Y ticks (0 → yMax) and five X ticks (start/quarters/end).
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => t * yMax);
  const xTickIdx = [
    0,
    Math.round((n - 1) * 0.25),
    Math.round((n - 1) * 0.5),
    Math.round((n - 1) * 0.75),
    n - 1,
  ];

  const currentTotal = current.reduce((sum, d) => sum + d.amount, 0);
  const previousTotal = previous.reduce((sum, d) => sum + d.amount, 0);
  const label =
    \`Gross volume, \${current[0].date} to \${current[n - 1].date}: \` +
    \`\${usdWhole(currentTotal)} total\` +
    (compare
      ? \`; previous period \${previous[0].date} to \${
          previous[previous.length - 1].date
        }: \${usdWhole(previousTotal)}\`
      : '');

  return (
    <svg
      viewBox={\`0 0 \${CHART_W} \${CHART_H}\`}
      style={styles.chartSvg}
      role="img"
      aria-label={label}>
      {/* Horizontal gridlines + Y-axis tick labels */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={CHART_PAD_L}
            x2={CHART_W - CHART_PAD_R}
            y1={y(tick)}
            y2={y(tick)}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
          <text
            x={CHART_PAD_L - 8}
            y={y(tick) + 4}
            textAnchor="end"
            fontSize={11}
            fill="var(--color-text-secondary)">
            {axisLabel(tick)}
          </text>
        </g>
      ))}
      {/* X-axis tick labels */}
      {xTickIdx.map(i => (
        <text
          key={i}
          x={x(i)}
          y={CHART_H - 10}
          textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}
          fontSize={11}
          fill="var(--color-text-secondary)">
          {current[i].date}
        </text>
      ))}
      {/* Previous-period compare line (neutral, dashed) */}
      {compare ? (
        <polyline
          points={previousPts}
          fill="none"
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          opacity={0.8}
        />
      ) : null}
      {/* Current-period area + line — the one brand-accent series */}
      <path d={areaPath} fill={BRAND_ACCENT_FILL} />
      <polyline
        points={currentPts}
        fill="none"
        stroke={BRAND_ACCENT}
        strokeWidth={2}
      />
      {/* Today's endpoint marker */}
      <circle
        cx={x(n - 1)}
        cy={y(current[n - 1].amount)}
        r={3.5}
        fill={BRAND_ACCENT}
      />
    </svg>
  );
}

// ============= FRAUD SPARKLINE =============

const SPARK_W = 220;
const SPARK_H = 48;
const SPARK_GAP = 6;

/** 7 daily blocked-attempt bars on the orange categorical token. */
function BlockedSparkline({data}: {data: typeof FRAUD_BLOCKED_DAILY}) {
  const max = Math.max(...data.map(d => d.blocked), 1);
  const barW = (SPARK_W - SPARK_GAP * (data.length - 1)) / data.length;
  const total = data.reduce((sum, d) => sum + d.blocked, 0);
  return (
    <svg
      width={SPARK_W}
      height={SPARK_H}
      viewBox={\`0 0 \${SPARK_W} \${SPARK_H}\`}
      role="img"
      aria-label={\`Blocked attempts per day, \${data[0].date} to \${
        data[data.length - 1].date
      }: \${total} total\`}>
      {data.map((d, i) => {
        const h = max === 0 ? 0 : Math.max((d.blocked / max) * (SPARK_H - 4), 2);
        return (
          <rect
            key={d.date}
            x={i * (barW + SPARK_GAP)}
            y={SPARK_H - h}
            width={barW}
            height={h}
            rx={2}
            fill="var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))"
            opacity={i === data.length - 1 ? 1 : 0.55}
          />
        );
      })}
    </svg>
  );
}

// ============= TABLE COLUMNS =============

// Column widths are budgeted for the ~614px card the table renders in next
// to the 340px rail: 92 + 96 + 110 fixed leaves ~316px of flexible space,
// split 1 : 1.75 so Method gets ~115px (icon + "Card ·· 4242") and Customer
// gets ~200px — enough for the longest fixture email
// (billing@northloomstudio.com) to render without ellipsis at desktop width.
// Table min-width = pixels + max(minWidth × totalWeight / weight) must stay
// under the card width or the table scrolls: 298 + 108×2.75 ≈ 595 < 614.
function paymentColumns(showRisk: boolean) {
  const columns: TableColumn<PaymentRow>[] = [
    {
      key: 'amount',
      header: 'Amount',
      width: pixel(92),
      align: 'end',
      renderCell: (item: PaymentRow) => (
        <span style={styles.numericCell}>
          <Text type="body" weight="bold">
            {usd(item.amount)}
          </Text>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(96),
      renderCell: (item: PaymentRow) => (
        <Badge
          label={STATUS_META[item.status].label}
          variant={STATUS_META[item.status].variant}
        />
      ),
    },
    {
      key: 'method',
      header: 'Method',
      width: proportional(1, {minWidth: 108}),
      renderCell: (item: PaymentRow) => (
        <span style={styles.methodWrap}>
          <Icon
            icon={METHOD_ICON[item.methodKind]}
            size="sm"
            color="secondary"
          />
          <span style={{...styles.cellText, ...styles.tabular}}>
            <Text type="body">{item.methodLabel}</Text>
          </span>
        </span>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      width: proportional(1.75, {minWidth: 168}),
      renderCell: (item: PaymentRow) => (
        <span style={styles.cellText}>
          <Text type="body" color="secondary">
            {item.customer}
          </Text>
        </span>
      ),
    },
  ];
  if (showRisk) {
    columns.push({
      key: 'risk',
      header: 'Risk',
      width: pixel(110),
      align: 'end',
      renderCell: (item: PaymentRow) => {
        const meta = RISK_META[riskLevel(item.risk)];
        return (
          <span style={styles.riskWrap}>
            <StatusDot variant={meta.variant} label={\`\${meta.label} risk\`} />
            <span style={styles.riskScore}>
              <Text type="body">{item.risk}</Text>
            </span>
            <span style={styles.riskLabel}>
              <Text type="supporting" color="secondary">
                {meta.label}
              </Text>
            </span>
          </span>
        );
      },
    });
  }
  return columns;
}

// ============= BALANCE + PAYOUTS CARD =============

function BalancePayoutCard({testMode}: {testMode: boolean}) {
  const balance = testMode ? TEST_BALANCE : LIVE_BALANCE;
  const nextPayout = balance.upcoming[0];
  return (
    <Card>
      <VStack gap={4}>
        <Heading level={3}>Balance</Heading>
        <HStack gap={6}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Available
            </Text>
            <Text type="body" weight="bold" hasTabularNumbers>
              {usd(balance.available)}
            </Text>
          </VStack>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Pending
            </Text>
            <Text type="body" weight="bold" hasTabularNumbers>
              {usd(balance.pending)}
            </Text>
          </VStack>
        </HStack>
        <Divider />
        {nextPayout ? (
          <div style={styles.nextPayout}>
            <VStack gap={1}>
              <Text type="supporting" color="secondary">
                Next payout · arrives {nextPayout.arrives}
              </Text>
              <Text type="large" weight="bold" hasTabularNumbers>
                {usd(nextPayout.amount)}
              </Text>
              <Text type="supporting" color="secondary">
                To {balance.payoutAccount}
              </Text>
            </VStack>
          </div>
        ) : (
          <EmptyState
            isCompact
            icon={<Icon icon={LandmarkIcon} size="lg" />}
            title="No payouts in test mode"
            description="Simulated balances never leave the test environment."
          />
        )}
        <VStack gap={2}>
          <HStack hAlign="between" vAlign="center">
            <Text type="supporting" weight="bold">
              Payout schedule
            </Text>
            <Text type="supporting" color="secondary">
              {balance.schedule}
            </Text>
          </HStack>
          {balance.upcoming.map(payout => (
            <div key={payout.arrives} style={styles.payoutRow}>
              <Text type="body" color="secondary">
                {payout.arrives}
              </Text>
              <Text type="body" hasTabularNumbers>
                {usd(payout.amount)}
              </Text>
            </div>
          ))}
          {balance.upcoming.length > 0 ? (
            <>
              <Divider />
              <div style={styles.payoutRow}>
                <Text type="supporting" color="secondary">
                  Total scheduled (= available balance)
                </Text>
                <Text type="body" weight="bold" hasTabularNumbers>
                  {usd(
                    balance.upcoming.reduce((sum, p) => sum + p.amount, 0),
                  )}
                </Text>
              </div>
            </>
          ) : null}
        </VStack>
        <Button
          label={testMode ? 'Payouts paused in test mode' : 'Pay out now'}
          variant="secondary"
          isDisabled={testMode}
        />
      </VStack>
    </Card>
  );
}

// ============= DISPUTES PANEL =============

function DisputesPanel({testMode}: {testMode: boolean}) {
  const disputes = testMode ? [] : LIVE_DISPUTES;
  const totalDisputed = disputes.reduce((sum, d) => sum + d.amount, 0);
  return (
    <Card>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FileWarningIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={3}>Disputes</Heading>
          </StackItem>
          {disputes.length > 0 ? (
            <Badge
              label={\`\${disputes.length} need evidence\`}
              variant="warning"
            />
          ) : null}
        </HStack>
        {disputes.length === 0 ? (
          <EmptyState
            isCompact
            icon={<Icon icon={ShieldCheckIcon} size="lg" />}
            title="No open disputes"
            description="Simulated payments in test mode never generate disputes."
          />
        ) : (
          <>
            <Text type="supporting" color="secondary">
              {usd(totalDisputed)} across {disputes.length} open cases — both
              are counter-filed once evidence is submitted.
            </Text>
            {disputes.map(dispute => (
              <div key={dispute.id} style={styles.disputeRow}>
                <VStack gap={2}>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="body" weight="bold" hasTabularNumbers>
                      {usd(dispute.amount)}
                    </Text>
                    <Badge label={dispute.reason} variant="error" />
                  </HStack>
                  <VStack gap={1}>
                    <Text type="supporting" color="secondary">
                      {dispute.customer}
                    </Text>
                    <span style={styles.mono}>
                      <Text type="supporting" color="secondary">
                        {dispute.paymentId}
                      </Text>
                    </span>
                  </VStack>
                  <HStack hAlign="between" vAlign="center">
                    <Text type="supporting">
                      Evidence due {dispute.evidenceDue}
                    </Text>
                    <Badge
                      label={\`\${dispute.daysLeft} days left\`}
                      variant={dispute.daysLeft <= 7 ? 'warning' : 'neutral'}
                    />
                  </HStack>
                  <Button label="Submit evidence" variant="secondary" />
                </VStack>
              </div>
            ))}
          </>
        )}
      </VStack>
    </Card>
  );
}

// ============= FRAUD RADAR STRIP =============

function FraudRadarStrip({testMode}: {testMode: boolean}) {
  const daily = testMode
    ? FRAUD_BLOCKED_DAILY.map(d => ({...d, blocked: 0}))
    : FRAUD_BLOCKED_DAILY;
  const rules = testMode ? [] : FRAUD_RULES_HIT;
  const totalBlocked = daily.reduce((sum, d) => sum + d.blocked, 0);
  const maxHits = Math.max(...FRAUD_RULES_HIT.map(r => r.hits), 1);
  return (
    <Card>
      <HStack gap={6} wrap="wrap" vAlign="center">
        <div style={styles.sparkCol}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={ShieldAlertIcon} size="sm" color="secondary" />
              <Text type="supporting" weight="bold">
                Fraud radar · last 7 days
              </Text>
            </HStack>
            <HStack gap={3} vAlign="center">
              <Text type="large" weight="bold" hasTabularNumbers>
                {totalBlocked}
              </Text>
              <Text type="supporting" color="secondary">
                blocked attempts
                <br />
                Jun 26 – Jul 2
              </Text>
            </HStack>
            <BlockedSparkline data={daily} />
          </VStack>
        </div>
        <StackItem size="fill">
          {rules.length === 0 ? (
            <Text type="supporting" color="secondary">
              Fraud rules do not run against simulated test traffic.
            </Text>
          ) : (
            <VStack gap={2}>
              <Text type="supporting" weight="bold">
                Rules hit ({rules.reduce((sum, r) => sum + r.hits, 0)} total)
              </Text>
              {rules.map(rule => (
                <HStack key={rule.rule} gap={3} vAlign="center">
                  <StackItem size="fill">
                    <VStack gap={1}>
                      <Text type="supporting">{rule.rule}</Text>
                      <div style={styles.ruleMeterTrack}>
                        <div
                          style={{
                            ...styles.ruleMeterFill,
                            width: \`\${(rule.hits / maxHits) * 100}%\`,
                          }}
                        />
                      </div>
                    </VStack>
                  </StackItem>
                  <span style={styles.tabular}>
                    <Text type="body" weight="bold">
                      {rule.hits}
                    </Text>
                  </span>
                </HStack>
              ))}
            </VStack>
          )}
        </StackItem>
      </HStack>
    </Card>
  );
}

// ============= PAGE =============

type StatusFilter = 'all' | PaymentStatus;

const FILTER_ORDER: StatusFilter[] = [
  'all',
  'succeeded',
  'refunded',
  'disputed',
];

const FILTER_LABEL: Record<StatusFilter, string> = {
  all: 'All',
  succeeded: 'Succeeded',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

export default function PaymentsPlatformOverviewTemplate() {
  const [testMode, setTestMode] = useState(false);
  const [range, setRange] = useState('14d');
  const [compare, setCompare] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Responsive contract: <=1080px collapses the 2-column grids; <=720px
  // drops the Risk and Created table columns.
  const isNarrow = useMediaQuery('(max-width: 1080px)');
  const isCompact = useMediaQuery('(max-width: 720px)');

  // ----- Gross volume: slice current + previous windows from one array -----
  const daily = testMode ? TEST_DAILY_VOLUME : LIVE_DAILY_VOLUME;
  const windowSize = range === '7d' ? 7 : 14;
  const current = daily.slice(daily.length - windowSize);
  const previous = daily.slice(
    daily.length - 2 * windowSize,
    daily.length - windowSize,
  );
  const currentTotal = current.reduce((sum, d) => sum + d.amount, 0);
  const previousTotal = previous.reduce((sum, d) => sum + d.amount, 0);
  const deltaPct = ((currentTotal - previousTotal) / previousTotal) * 100;
  const deltaLabel = \`\${deltaPct >= 0 ? '+' : ''}\${deltaPct.toFixed(1)}%\`;

  // ----- Payments: filter + counts derive from one fixture list -----
  const payments = testMode ? TEST_PAYMENTS : LIVE_PAYMENTS;
  const countsByStatus: Record<StatusFilter, number> = {
    all: payments.length,
    succeeded: payments.filter(p => p.status === 'succeeded').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    disputed: payments.filter(p => p.status === 'disputed').length,
  };
  const visiblePayments =
    statusFilter === 'all'
      ? payments
      : payments.filter(p => p.status === statusFilter);
  const columns = paymentColumns(!isCompact);

  const splitGrid = isNarrow ? styles.splitGridNarrow : styles.splitGrid;

  return (
    <Layout
      height="auto"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <HStack gap={2} vAlign="center">
              <div style={styles.brandTile} aria-hidden>
                <Icon icon={LayersIcon} size="sm" color="inherit" />
              </div>
              <span style={styles.wordmark}>
                <Heading level={1}>Ledgerline</Heading>
              </span>
              {testMode ? <Badge label="TEST" variant="warning" /> : null}
            </HStack>
            <StackItem size="fill">
              <span />
            </StackItem>
            <span style={styles.switchKnobScope}>
              <Switch
                label="Test mode"
                value={testMode}
                onChange={checked => setTestMode(checked)}
              />
            </span>
            <Button
              label="Create payment"
              variant="primary"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={5}>
            {testMode ? (
              <Banner
                status="warning"
                title="Test mode"
                description="You're viewing simulated Ledgerline data. Payments, balances, and payouts on this page never move real money."
              />
            ) : null}

            {/* Overview heading */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={2}>Payments overview</Heading>
                  <Text type="supporting" color="secondary">
                    Wednesday, Jul 2, 2026 ·{' '}
                    {testMode ? 'Test environment' : 'Live environment'}
                  </Text>
                </VStack>
              </StackItem>
              <SegmentedControl
                value={range}
                onChange={setRange}
                label="Chart range"
                size={isCompact ? 'lg' : 'md'}>
                <SegmentedControlItem value="7d" label="7d" />
                <SegmentedControlItem value="14d" label="14d" />
              </SegmentedControl>
              <span style={styles.switchKnobScope}>
                <Switch
                  label="Compare"
                  value={compare}
                  onChange={checked => setCompare(checked)}
                />
              </span>
            </HStack>

            {/* Row 1: gross-volume chart + balance/payout rail */}
            <div style={splitGrid}>
              <Card>
                <VStack gap={3}>
                  <HStack gap={3} vAlign="start" wrap="wrap">
                    <StackItem size="fill">
                      <Stat
                        label={\`Gross volume · \${current[0].date} – \${
                          current[current.length - 1].date
                        }\`}
                        value={usdWhole(currentTotal)}
                        delta={{
                          value: deltaLabel,
                          direction:
                            deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat',
                        }}
                        description={\`vs \${usdWhole(previousTotal)} previous \${windowSize} days\`}
                      />
                    </StackItem>
                    <VStack gap={1}>
                      <Text type="supporting" color="secondary">
                        Today so far
                      </Text>
                      <Text type="body" weight="bold" hasTabularNumbers>
                        {usdWhole(current[current.length - 1].amount)}
                      </Text>
                    </VStack>
                  </HStack>
                  <div style={styles.chartWrap}>
                    <GrossVolumeChart
                      current={current}
                      previous={previous}
                      compare={compare}
                    />
                  </div>
                  <HStack gap={4} vAlign="center" wrap="wrap">
                    <HStack gap={2} vAlign="center">
                      <span style={styles.legendSwatch} aria-hidden />
                      <Text type="supporting" color="secondary">
                        {current[0].date} – {current[current.length - 1].date}
                      </Text>
                    </HStack>
                    {compare ? (
                      <HStack gap={2} vAlign="center">
                        <span style={styles.legendDash} aria-hidden />
                        <Text type="supporting" color="secondary">
                          {previous[0].date} –{' '}
                          {previous[previous.length - 1].date} (previous
                          period)
                        </Text>
                      </HStack>
                    ) : null}
                  </HStack>
                </VStack>
              </Card>
              <BalancePayoutCard testMode={testMode} />
            </div>

            {/* Row 2: fraud radar strip */}
            <FraudRadarStrip testMode={testMode} />

            {/* Row 3: recent payments + disputes rail */}
            <div style={splitGrid}>
              <Card>
                <VStack gap={4}>
                  <HStack gap={3} vAlign="center" wrap="wrap">
                    <StackItem size="fill">
                      <Heading level={3}>Recent payments</Heading>
                    </StackItem>
                    <SegmentedControl
                      value={statusFilter}
                      onChange={value =>
                        setStatusFilter(value as StatusFilter)
                      }
                      label="Filter payments by status"
                      size="md">
                      {FILTER_ORDER.map(filter => (
                        <SegmentedControlItem
                          key={filter}
                          value={filter}
                          label={
                            isCompact
                              ? FILTER_LABEL[filter]
                              : \`\${FILTER_LABEL[filter]} (\${countsByStatus[filter]})\`
                          }
                        />
                      ))}
                    </SegmentedControl>
                  </HStack>
                  <div style={styles.tableWrap}>
                    {visiblePayments.length === 0 ? (
                      <EmptyState
                        isCompact
                        icon={<Icon icon={CreditCardIcon} size="lg" />}
                        title="No payments match this filter"
                        description="Test mode only simulates succeeded and refunded payments."
                      />
                    ) : (
                      <Table<PaymentRow>
                        data={visiblePayments}
                        columns={columns}
                        idKey="id"
                        density="compact"
                        dividers="rows"
                        hasHover
                      />
                    )}
                  </div>
                  <Text type="supporting" color="secondary">
                    {countsByStatus.succeeded} succeeded ·{' '}
                    {countsByStatus.refunded} refunded ·{' '}
                    {countsByStatus.disputed} disputed — counts match the
                    filter above
                    {testMode ? ' (simulated test payments)' : ''}.
                  </Text>
                </VStack>
              </Card>
              <DisputesPanel testMode={testMode} />
            </div>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};