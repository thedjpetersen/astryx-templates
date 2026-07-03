// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person) July
 *   2026 contractor payout batch (CTR-2026-07, June work, pays Jul 15)
 *   frozen at Mon Jul 13, 2026 10:00 PT: 12 contractors across Portugal
 *   (4), Brazil (3), India (3), and Canada (2); integer-cent amounts whose
 *   FX math reconciles exactly at the locked rates (EUR 1.0870, BRL
 *   5.4200, INR 83.50, CAD 1.3600) — per-country local subtotals convert
 *   to the per-country USD subtotals, which sum to the $48,220.00 batch
 *   total; one missing W-8BEN blocks $2,192.00, leaving $46,028.00
 *   payable. Fixed ISO timestamps; the FX-lock countdown is a fixed
 *   string derived from the frozen review instant. No clocks, no
 *   randomness, no locale money APIs.
 * @output Global Contractor Payments — the Finance-pillar payout console
 *   for the July 2026 contractor cycle. A blocked-payout Banner (Ravi
 *   Menon's missing W-8BEN holds ₹183,032.00 / $2,192.00) with a working
 *   send-request CTA; four summary tiles (12 contractors with payable /
 *   blocked split, $48,220.00 batch total, FX-lock countdown across 4
 *   currencies, Jul 15 payout date across 4 local rails); a filter +
 *   search toolbar; per-country grouping strips (flag chip, headcount,
 *   SEPA / PIX / UPI / EFT rail badge, locked FX rate, local + USD
 *   subtotal) over aligned contractor rows (name + country flag chip,
 *   fixed / hourly engagement, local rate, this-cycle local + USD in
 *   tabular numerics, W-9 / W-8BEN status, payment-method icon + mask); a
 *   contractor-vs-employee classification callout for one flagged hourly
 *   engagement; a 320px inspector panel (engagement, payment method, tax
 *   form, cycle amounts, payout timeline); and a pinned approve bar gated
 *   through an AlertDialog that approves the 11 ready payouts.
 * @position Page template; emitted by `astryx template fin-contractor-payments`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | content (blocked-payout banner, summary tiles, toolbar,
 *   country-grouped payout rows, compliance callout — one vertical
 *   scroller) | end panel 320 (contractor inspector, scrolls)
 *   | footer approve bar (pinned).
 * Container policy: app-shell finance-console archetype — frame rows and
 *   panels only; no Cards. Summary tiles, country strips, contractor
 *   rows, and the compliance callout are styled divs inside frame
 *   regions; the only Banner is the blocked-payout notice.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens (the
 *   demo does not inject `--color-data-categorical-*`) used for country
 *   dots and rail badges, plus `light-dark()` tint pairs on the blocked
 *   row wash and the classification callout.
 *
 * Responsive contract:
 * - > 1180px: content + 320px inspector end panel + pinned footer.
 * - <= 1180px: the inspector panel is dropped; every figure it repeats
 *   (amounts, tax status, method mask) stays readable in the rows.
 * - Compact grid: the payout grid drops the Rate and Method columns (rate
 *   moves into the engagement cell subtext; the method stays in the
 *   inspector and the country strip's rail badge) whenever the viewport is
 *   <= 980px OR the content REGION is under 1080px (measured via
 *   ResizeObserver — the 320px inspector and host chrome shrink it
 *   independently of the viewport). <= 980px also wraps the summary tiles
 *   2-up and lets the header, toolbar and footer rows wrap instead of
 *   clipping.
 * - The payout grid keeps a column floor and scrolls horizontally inside
 *   its own wrapper below that floor rather than crushing numeric cells.
 * - Content and end panel scroll independently (`minHeight: 0` down every
 *   flex chain); the header, toolbar, and footer bar are pinned.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  AlertTriangleIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileCheck2Icon,
  FileClockIcon,
  FileWarningIcon,
  GlobeIcon,
  LandmarkIcon,
  ReceiptTextIcon,
  ScaleIcon,
  SearchIcon,
  SendIcon,
  SmartphoneIcon,
  TimerIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  // Summary tiles ----------------------------------------------------------
  tileRow: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-3)'},
  tile: {
    flex: '1 1 240px',
    minWidth: 220,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  tileFigure: {fontVariantNumeric: 'tabular-nums'},
  fxChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'light-dark(#8A5300, #FFC66E)',
    backgroundColor: 'light-dark(rgba(235,110,0,0.10), rgba(255,147,48,0.16))',
    border: 'var(--border-width) solid light-dark(rgba(235,110,0,0.35), rgba(255,147,48,0.4))',
  },
  // Toolbar ----------------------------------------------------------------
  toolbar: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--spacing-3)'},
  // Payout grid ------------------------------------------------------------
  // Column floor lives on gridMin; the wrapper scrolls horizontally below
  // it instead of crushing numeric cells. Footgun: `overflow: auto` gives a
  // flex item an automatic min-height of 0, so without `flexShrink: 0` the
  // column-flex scroller squeezes the whole grid into a tiny nested scroll
  // window instead of letting the page scroll.
  gridWrap: {overflowX: 'auto', flexShrink: 0},
  gridMin: {minWidth: 1020, display: 'flex', flexDirection: 'column'},
  gridMinCompact: {minWidth: 680},
  gridHeader: {
    display: 'grid',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    color: 'var(--color-text-secondary)',
  },
  countryStrip: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    marginTop: 'var(--spacing-3)',
  },
  countryDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  row: {
    display: 'grid',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    borderRadius: 'var(--radius-control, 6px)',
  },
  // Inset outline so the active row never bleeds onto neighbors.
  rowActive: {boxShadow: 'inset 2px 0 0 var(--color-accent)'},
  rowBlocked: {backgroundColor: 'light-dark(rgba(220,38,38,0.05), rgba(248,113,113,0.09))'},
  flagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  railBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },
  numericCell: {textAlign: 'end', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  methodCell: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  methodMask: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Compliance callout ------------------------------------------------------
  complianceCallout: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid light-dark(rgba(235,110,0,0.35), rgba(255,147,48,0.4))',
    backgroundColor: 'light-dark(rgba(235,110,0,0.06), rgba(255,147,48,0.1))',
  },
  complianceGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  // Inspector panel ---------------------------------------------------------
  holdNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'light-dark(rgba(220,38,38,0.07), rgba(248,113,113,0.12))',
  },
  holdGlyph: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'light-dark(#DC2626, #F87171)',
  },
  panelNote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Footer -------------------------------------------------------------------
  footerBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// One shared grid template keeps the header row, contractor rows, and the
// numeric columns registered on the same gridlines in every country group.
// Columns: contractor | engagement | rate | this cycle (local) | USD | tax
// form | method. Compact (viewport <=980px or content region <1080px)
// drops Rate + Method; the rate moves into the engagement cell subtext.
// The compact floor (690px) fits the demo's ~700px content region without
// horizontal scroll.
const GRID_TEMPLATE_FULL =
  'minmax(210px, 1.6fr) 120px 120px 140px 110px 120px 150px';
const GRID_TEMPLATE_COMPACT = 'minmax(205px, 1.6fr) 100px 100px 85px 120px';

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company) July 2026 contractor
// payout batch CTR-2026-07: June 2026 work, pays Wed Jul 15, 2026. Frozen
// review instant: Mon Jul 13, 2026 10:00 PT. FX rates locked Jul 12, 16:00
// PT for 72h -> the fixed countdown string "2d 6h".
//
// Reconciliation (all integer cents; local x rate = USD exactly):
//   Portugal EUR 19,000.00 x 1.0870          = $20,653.00
//   Brazil   BRL 61,246.00 / 5.4200          = $11,300.00
//   India    INR 784,232.00 / 83.50          =  $9,392.00
//   Canada   CAD  9,350.00 / 1.3600          =  $6,875.00
//   Batch total                              = $48,220.00
//   Blocked (Ravi Menon, missing W-8BEN)     =  $2,192.00
//   Payable now                              = $46,028.00
// ---------------------------------------------------------------------------

type CountryId = 'PT' | 'BR' | 'IN' | 'CA';
type Engagement = 'fixed' | 'hourly';
type TaxFormKind = 'W-9' | 'W-8BEN';
type TaxFormState = 'on-file' | 'missing' | 'requested';
type StatusFilter = 'all' | 'ready' | 'attention';
type BatchStage = 'review' | 'approved';

interface CountryMeta {
  id: CountryId;
  name: string;
  flag: string;
  currency: string;
  /** Currency prefix used by the deterministic money formatter. */
  symbol: string;
  /** Locked FX rate, displayed verbatim — never recomputed. */
  fxLabel: string;
  rail: string;
  railDetail: string;
  railIcon: typeof LandmarkIcon;
  railColor: string;
  /** Local-currency subtotal for the group strip, in cents. */
  localSubtotalCents: number;
  /** USD subtotal for the group strip, in cents. */
  usdSubtotalCents: number;
}

const COUNTRY_ORDER: CountryId[] = ['PT', 'BR', 'IN', 'CA'];

const COUNTRIES: Record<CountryId, CountryMeta> = {
  PT: {
    id: 'PT',
    name: 'Portugal',
    flag: '🇵🇹',
    currency: 'EUR',
    symbol: '€',
    fxLabel: '1 EUR = 1.0870 USD',
    rail: 'SEPA',
    railDetail: 'SEPA credit transfer · 1 business day',
    railIcon: LandmarkIcon,
    railColor: CATEGORICAL.blue,
    localSubtotalCents: 1_900_000, // €19,000.00
    usdSubtotalCents: 2_065_300, // $20,653.00 = 19,000 x 1.0870
  },
  BR: {
    id: 'BR',
    name: 'Brazil',
    flag: '🇧🇷',
    currency: 'BRL',
    symbol: 'R$',
    fxLabel: '1 USD = 5.4200 BRL',
    rail: 'PIX',
    railDetail: 'PIX instant transfer · same day',
    railIcon: ZapIcon,
    railColor: CATEGORICAL.green,
    localSubtotalCents: 6_124_600, // R$61,246.00
    usdSubtotalCents: 1_130_000, // $11,300.00 = 61,246 / 5.42
  },
  IN: {
    id: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    fxLabel: '1 USD = 83.50 INR',
    rail: 'UPI',
    railDetail: 'UPI transfer · same day',
    railIcon: SmartphoneIcon,
    railColor: CATEGORICAL.orange,
    localSubtotalCents: 78_423_200, // ₹784,232.00
    usdSubtotalCents: 939_200, // $9,392.00 = 784,232 / 83.50
  },
  CA: {
    id: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'C$',
    fxLabel: '1 USD = 1.3600 CAD',
    rail: 'EFT',
    railDetail: 'EFT batch transfer · 2 business days',
    railIcon: BanknoteIcon,
    railColor: CATEGORICAL.teal,
    localSubtotalCents: 935_000, // C$9,350.00
    usdSubtotalCents: 687_500, // $6,875.00 = 9,350 / 1.36
  },
};

interface Contractor {
  id: string;
  name: string;
  role: string;
  country: CountryId;
  engagement: Engagement;
  /** Local-currency rate in cents (per hour for hourly, per month fixed). */
  rateCents: number;
  /** Hours billed this cycle — hourly engagements only. */
  hours?: number;
  /** This-cycle amount in local-currency cents. */
  localCents: number;
  /** This-cycle amount in USD cents at the locked rate. */
  usdCents: number;
  taxForm: TaxFormKind;
  /** Initial tax-form state; Ravi's `missing` state is lifted into state. */
  taxState: TaxFormState;
  taxDetail: string;
  /** Payment-method mask shown next to the rail icon. */
  methodMask: string;
  contractStart: string;
  invoiceRef: string;
  /** True for the contractor-vs-employee classification flag. */
  isFlagged?: boolean;
}

// Per-row FX math (cents, exact at the locked rates):
//   PT: EUR x 1.0870   BR: BRL / 5.4200   IN: INR / 83.50   CA: CAD / 1.3600
const CONTRACTORS: Contractor[] = [
  // ---- Portugal · SEPA · EUR 19,000.00 -> $20,653.00 ----
  {
    id: 'c-almeida', name: 'Inês Almeida', role: 'Backend engineer', country: 'PT',
    engagement: 'fixed', rateCents: 580_000, localCents: 580_000, usdCents: 630_460,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Mar 2025 · valid through 2027',
    methodMask: 'PT50 ···· 4821', contractStart: '2025-03-02', invoiceRef: 'INV-2026-06-014',
  },
  {
    id: 'c-silva', name: 'Duarte Silva', role: 'Site reliability engineer', country: 'PT',
    engagement: 'hourly', rateCents: 8_000, hours: 60.5, localCents: 484_000, usdCents: 526_108,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Sep 2025 · valid through 2028',
    methodMask: 'PT50 ···· 1177', contractStart: '2025-09-15', invoiceRef: 'INV-2026-06-019',
  },
  {
    id: 'c-costa', name: 'Mariana Costa', role: 'Product designer', country: 'PT',
    engagement: 'fixed', rateCents: 490_000, localCents: 490_000, usdCents: 532_630,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Jan 2026 · valid through 2028',
    methodMask: 'PT50 ···· 9034', contractStart: '2026-01-12', invoiceRef: 'INV-2026-06-021',
  },
  {
    id: 'c-rocha', name: 'Tiago Rocha', role: 'QA engineer', country: 'PT',
    engagement: 'hourly', rateCents: 4_000, hours: 86.5, localCents: 346_000, usdCents: 376_102,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Jun 2025 · valid through 2027',
    methodMask: 'PT50 ···· 6650', contractStart: '2025-06-01', invoiceRef: 'INV-2026-06-025',
  },
  // ---- Brazil · PIX · R$61,246.00 -> $11,300.00 ----
  {
    id: 'c-ferreira', name: 'Lucas Ferreira', role: 'Mobile engineer', country: 'BR',
    engagement: 'hourly', rateCents: 13_550, hours: 152, localCents: 2_059_600, usdCents: 380_000,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Apr 2025 · valid through 2027',
    methodMask: 'PIX ···· 7093 (CPF)', contractStart: '2025-04-14', invoiceRef: 'INV-2026-06-016',
    isFlagged: true,
  },
  {
    id: 'c-santos', name: 'Beatriz Santos', role: 'Data analyst', country: 'BR',
    engagement: 'fixed', rateCents: 1_897_000, localCents: 1_897_000, usdCents: 350_000,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Nov 2025 · valid through 2028',
    methodMask: 'PIX ···· 2841 (CPF)', contractStart: '2025-11-03', invoiceRef: 'INV-2026-06-018',
  },
  {
    id: 'c-lima', name: 'Rafael Lima', role: 'Frontend engineer', country: 'BR',
    engagement: 'fixed', rateCents: 2_168_000, localCents: 2_168_000, usdCents: 400_000,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Feb 2026 · valid through 2028',
    methodMask: 'PIX ···· 5518 (CNPJ)', contractStart: '2026-02-09', invoiceRef: 'INV-2026-06-022',
  },
  // ---- India · UPI · ₹784,232.00 -> $9,392.00 ----
  {
    id: 'c-iyer', name: 'Ananya Iyer', role: 'ML engineer', country: 'IN',
    engagement: 'fixed', rateCents: 35_070_000, localCents: 35_070_000, usdCents: 420_000,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since May 2025 · valid through 2027',
    methodMask: 'UPI ananya@···hdfc', contractStart: '2025-05-19', invoiceRef: 'INV-2026-06-015',
  },
  {
    id: 'c-menon', name: 'Ravi Menon', role: 'Platform engineer', country: 'IN',
    engagement: 'hourly', rateCents: 334_000, hours: 54.8, localCents: 18_303_200, usdCents: 219_200,
    taxForm: 'W-8BEN', taxState: 'missing', taxDetail: 'Never submitted — payout held',
    methodMask: 'UPI ravi@···icici', contractStart: '2026-05-04', invoiceRef: 'INV-2026-06-027',
  },
  {
    id: 'c-pillai', name: 'Sanjay Pillai', role: 'DevOps engineer', country: 'IN',
    engagement: 'fixed', rateCents: 25_050_000, localCents: 25_050_000, usdCents: 300_000,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Aug 2025 · valid through 2027',
    methodMask: 'UPI sanjay@···axis', contractStart: '2025-08-25', invoiceRef: 'INV-2026-06-020',
  },
  // ---- Canada · EFT · C$9,350.00 -> $6,875.00 ----
  {
    id: 'c-tran', name: 'Emily Tran', role: 'Technical writer', country: 'CA',
    engagement: 'hourly', rateCents: 8_500, hours: 52, localCents: 442_000, usdCents: 325_000,
    taxForm: 'W-9', taxState: 'on-file', taxDetail: 'US person abroad · on file since Oct 2025',
    methodMask: 'EFT ···· 2210', contractStart: '2025-10-06', invoiceRef: 'INV-2026-06-017',
  },
  {
    id: 'c-bergeron', name: 'Noah Bergeron', role: 'Security consultant', country: 'CA',
    engagement: 'fixed', rateCents: 493_000, localCents: 493_000, usdCents: 362_500,
    taxForm: 'W-8BEN', taxState: 'on-file', taxDetail: 'On file since Jul 2025 · valid through 2027',
    methodMask: 'EFT ···· 8804', contractStart: '2025-07-07', invoiceRef: 'INV-2026-06-023',
  },
];

// Batch-level constants — every figure repeats verbatim wherever it appears.
const BATCH = {
  id: 'CTR-2026-07',
  cycleLabel: 'June 2026 work',
  payDate: 'Jul 15, 2026',
  fundingDeadline: 'Jul 14, 18:00 PT',
  fxLockedAt: '2026-07-12T23:00:00Z', // Jul 12, 16:00 PT
  // Frozen review instant Jul 13, 10:00 PT; the 72h lock expires Jul 15,
  // 16:00 PT -> fixed countdown string, never computed from a clock.
  fxCountdown: '2d 6h',
  totalUsdCents: 4_822_000, // $48,220.00
  payableUsdCents: 4_602_800, // $46,028.00
  blockedUsdCents: 219_200, // $2,192.00 (Ravi Menon)
  contractorCount: 12,
  payableCount: 11,
  blockedCount: 1,
  approvedBy: 'Elena Voss',
  approvedOn: '2026-07-12T17:30:00Z',
};

// ---------------------------------------------------------------------------
// HELPERS — deterministic money formatting (no locale APIs).
// ---------------------------------------------------------------------------

function money(cents: number, symbol: string): string {
  const dollars = Math.floor(cents / 100);
  const rem = String(cents % 100).padStart(2, '0');
  const grouped = String(dollars).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${symbol}${grouped}.${rem}`;
}

function usd(cents: number): string {
  return money(cents, '$');
}

function local(cents: number, country: CountryId): string {
  return money(cents, COUNTRIES[country].symbol);
}

function formatHours(hours: number): string {
  return Number.isInteger(hours) ? `${hours} hrs` : `${hours.toFixed(1)} hrs`;
}

function rateLabel(contractor: Contractor): string {
  const symbol = COUNTRIES[contractor.country].symbol;
  return contractor.engagement === 'hourly'
    ? `${money(contractor.rateCents, symbol)}/hr`
    : `${money(contractor.rateCents, symbol)}/mo`;
}

/**
 * Method mask without its rail prefix — next to a RailBadge the prefix
 * ("UPI UPI ravi@…") would read as a duplicate.
 */
function maskWithoutRail(contractor: Contractor): string {
  const rail = COUNTRIES[contractor.country].rail;
  return contractor.methodMask.startsWith(`${rail} `)
    ? contractor.methodMask.slice(rail.length + 1)
    : contractor.methodMask;
}

/** Effective tax state — Ravi's row is lifted into component state. */
function taxStateFor(contractor: Contractor, raviState: TaxFormState): TaxFormState {
  return contractor.id === 'c-menon' ? raviState : contractor.taxState;
}

function isBlocked(contractor: Contractor, raviState: TaxFormState): boolean {
  return taxStateFor(contractor, raviState) !== 'on-file';
}

function needsAttention(contractor: Contractor, raviState: TaxFormState): boolean {
  return isBlocked(contractor, raviState) || contractor.isFlagged === true;
}

// ---------------------------------------------------------------------------
// SMALL PIECES — flag chip, rail badge, tax cell.
// ---------------------------------------------------------------------------

function FlagChip({country}: {country: CountryId}) {
  const meta = COUNTRIES[country];
  return (
    <span style={styles.flagChip} title={meta.name}>
      <span aria-hidden="true">{meta.flag}</span>
      {meta.id}
    </span>
  );
}

function RailBadge({country}: {country: CountryId}) {
  const meta = COUNTRIES[country];
  return (
    <span
      style={{
        ...styles.railBadge,
        color: meta.railColor,
        border: `var(--border-width) solid ${meta.railColor}`,
      }}
      title={meta.railDetail}>
      <Icon icon={meta.railIcon} size="xsm" color="inherit" />
      {meta.rail}
    </span>
  );
}

function TaxFormCell({
  contractor,
  raviState,
  isCompact,
}: {
  contractor: Contractor;
  raviState: TaxFormState;
  isCompact: boolean;
}) {
  const state = taxStateFor(contractor, raviState);
  if (state === 'on-file') {
    return (
      <HStack gap={1} vAlign="center">
        <Icon icon={FileCheck2Icon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {contractor.taxForm} on file
        </Text>
      </HStack>
    );
  }
  // Compact drops the form name from the tokens (the column header and the
  // inspector carry it) so the state never truncates mid-word.
  if (state === 'requested') {
    return (
      <HStack gap={1} vAlign="center">
        <Icon icon={FileClockIcon} size="xsm" color="secondary" />
        <Token
          size="sm"
          color="orange"
          label={isCompact ? 'Requested' : `${contractor.taxForm} requested`}
        />
      </HStack>
    );
  }
  return (
    <HStack gap={1} vAlign="center">
      <Icon icon={FileWarningIcon} size="xsm" color="secondary" />
      <Token
        size="sm"
        color="red"
        label={isCompact ? 'Missing' : `${contractor.taxForm} missing`}
      />
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY TILES — 12 contractors (11 payable / 1 blocked), $48,220.00 batch
// total, FX lock countdown, Jul 15 payout date across 4 rails. Figures
// repeat the BATCH constants verbatim.
// ---------------------------------------------------------------------------

function SummaryTiles() {
  return (
    <div style={styles.tileRow}>
      <div style={styles.tile}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" color="secondary">
            Contractors
          </Text>
        </HStack>
        <Heading level={2} style={styles.tileFigure}>
          {BATCH.contractorCount}
        </Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {BATCH.payableCount} payable · {BATCH.blockedCount} blocked
        </Text>
      </div>
      <div style={styles.tile}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ReceiptTextIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" color="secondary">
            This cycle (USD)
          </Text>
        </HStack>
        <Heading level={2} style={styles.tileFigure}>
          {usd(BATCH.totalUsdCents)}
        </Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {usd(BATCH.payableUsdCents)} payable now · {usd(BATCH.blockedUsdCents)} held
        </Text>
      </div>
      <div style={styles.tile}>
        <HStack gap={2} vAlign="center">
          <Icon icon={GlobeIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" color="secondary">
            FX rates
          </Text>
          <StackItem size="fill" />
          <span style={styles.fxChip} title={`FX lock expires in ${BATCH.fxCountdown}`}>
            <Icon icon={TimerIcon} size="xsm" color="inherit" />
            Expires in {BATCH.fxCountdown}
          </span>
        </HStack>
        <Heading level={2} style={styles.tileFigure}>
          4 currencies
        </Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Locked Jul 12, 16:00 PT · EUR · BRL · INR · CAD
        </Text>
      </div>
      <div style={styles.tile}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" color="secondary">
            Payout date
          </Text>
        </HStack>
        <Heading level={2} style={styles.tileFigure}>
          {BATCH.payDate}
        </Heading>
        <Text type="supporting" color="secondary">
          4 local rails · SEPA · PIX · UPI · EFT
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAYOUT GRID — one shared grid template registers the header row and every
// contractor row on the same gridlines across all four country groups.
// ---------------------------------------------------------------------------

function GridHeaderRow({isCompact}: {isCompact: boolean}) {
  const template = isCompact ? GRID_TEMPLATE_COMPACT : GRID_TEMPLATE_FULL;
  return (
    <div style={{...styles.gridHeader, gridTemplateColumns: template}} aria-hidden="true">
      <Text type="label" size="sm" color="secondary">
        Contractor
      </Text>
      <Text type="label" size="sm" color="secondary">
        Engagement
      </Text>
      {!isCompact && (
        <Text type="label" size="sm" color="secondary" style={styles.numericCell}>
          Rate
        </Text>
      )}
      <Text type="label" size="sm" color="secondary" style={styles.numericCell}>
        This cycle
      </Text>
      <Text type="label" size="sm" color="secondary" style={styles.numericCell}>
        USD
      </Text>
      <Text type="label" size="sm" color="secondary">
        Tax form
      </Text>
      {!isCompact && (
        <Text type="label" size="sm" color="secondary">
          Method
        </Text>
      )}
    </div>
  );
}

function ContractorRow({
  contractor,
  raviState,
  isActive,
  isCompact,
  onSelect,
}: {
  contractor: Contractor;
  raviState: TaxFormState;
  isActive: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const meta = COUNTRIES[contractor.country];
  const blocked = isBlocked(contractor, raviState);
  const template = isCompact ? GRID_TEMPLATE_COMPACT : GRID_TEMPLATE_FULL;
  const rowStyle: CSSProperties = {
    ...styles.row,
    gridTemplateColumns: template,
    ...(blocked ? styles.rowBlocked : null),
    ...(isActive ? styles.rowActive : null),
  };
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isActive}
      aria-label={`${contractor.name}, ${meta.name}, ${usd(contractor.usdCents)} this cycle`}
      style={rowStyle}
      onClick={() => onSelect(contractor.id)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(contractor.id);
        }
      }}>
      {/* Contractor: avatar, name + flag chip, role */}
      <HStack gap={2} vAlign="center" style={{minWidth: 0}}>
        <Avatar name={contractor.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Text type="label" maxLines={1}>
                {contractor.name}
              </Text>
              <FlagChip country={contractor.country} />
              {contractor.isFlagged &&
                (isCompact ? (
                  // The full token has no room in the compact name cell; the
                  // callout and inspector carry the full label.
                  <span
                    title="Classification review"
                    style={{
                      display: 'inline-flex',
                      flexShrink: 0,
                      color: CATEGORICAL.orange,
                    }}>
                    <Icon icon={ScaleIcon} size="xsm" color="inherit" />
                  </span>
                ) : (
                  <Token size="sm" color="orange" label="Classification review" />
                ))}
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {contractor.role}
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      {/* Engagement (compact folds the rate in as subtext) */}
      <VStack gap={0}>
        <Token
          size="sm"
          color={contractor.engagement === 'fixed' ? 'blue' : 'purple'}
          label={contractor.engagement === 'fixed' ? 'Fixed' : 'Hourly'}
        />
        {isCompact ? (
          <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
            {rateLabel(contractor)}
          </Text>
        ) : contractor.hours !== undefined ? (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatHours(contractor.hours)}
          </Text>
        ) : (
          <Text type="supporting" color="secondary">
            Monthly retainer
          </Text>
        )}
      </VStack>
      {/* Rate (full layout only) */}
      {!isCompact && (
        <Text type="body" color="secondary" hasTabularNumbers style={styles.numericCell}>
          {rateLabel(contractor)}
        </Text>
      )}
      {/* This cycle — local currency */}
      <Text type="body" hasTabularNumbers style={styles.numericCell}>
        {local(contractor.localCents, contractor.country)}
      </Text>
      {/* This cycle — USD at the locked rate */}
      <Text
        type="body"
        hasTabularNumbers
        color={blocked ? 'secondary' : undefined}
        style={styles.numericCell}>
        {usd(contractor.usdCents)}
      </Text>
      {/* Tax form status */}
      <TaxFormCell contractor={contractor} raviState={raviState} isCompact={isCompact} />
      {/* Payment method (full layout only) */}
      {!isCompact && (
        <div style={styles.methodCell}>
          <span style={{display: 'inline-flex', color: meta.railColor}}>
            <Icon icon={meta.railIcon} size="sm" color="inherit" />
          </span>
          <span style={styles.methodMask}>{contractor.methodMask}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Country grouping strip + its contractor rows. The strip repeats the
 * country's canonical subtotals (local -> USD at the locked rate) and the
 * local rail badge; rows below share the page-wide grid template.
 */
function CountryGroup({
  country,
  contractors,
  raviState,
  activeId,
  isCompact,
  onSelect,
}: {
  country: CountryId;
  contractors: Contractor[];
  raviState: TaxFormState;
  activeId: string | null;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const meta = COUNTRIES[country];
  if (contractors.length === 0) {
    return null;
  }
  // Canonical group size (PT 4 / BR 3 / IN 3 / CA 2). The strip's subtotal
  // only renders when the group is complete, so a filtered view never shows
  // a total that disagrees with the rows beneath it.
  const totalInCountry = CONTRACTORS.filter(
    row => row.country === country,
  ).length;
  const isComplete = contractors.length === totalInCountry;
  return (
    <div>
      <div style={styles.countryStrip}>
        <HStack gap={2} vAlign="center">
          <span style={{...styles.countryDot, backgroundColor: meta.railColor}} />
          <Text type="label">
            <span aria-hidden="true">{meta.flag} </span>
            {meta.name}
          </Text>
          <Token
            size="sm"
            color="gray"
            label={
              isComplete
                ? String(totalInCountry)
                : `${contractors.length} of ${totalInCountry}`
            }
          />
          <RailBadge country={country} />
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {meta.fxLabel}
        </Text>
        {isComplete && (
          <HStack gap={1} vAlign="center">
            <Text type="body" hasTabularNumbers>
              {money(meta.localSubtotalCents, meta.symbol)}
            </Text>
            <span aria-hidden="true" style={{color: 'var(--color-text-secondary)'}}>
              →
            </span>
            <Text type="body" hasTabularNumbers>
              {usd(meta.usdSubtotalCents)}
            </Text>
          </HStack>
        )}
      </div>
      {contractors.map(contractor => (
        <ContractorRow
          key={contractor.id}
          contractor={contractor}
          raviState={raviState}
          isActive={contractor.id === activeId}
          isCompact={isCompact}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE CALLOUT — contractor-vs-employee classification note for the
// one flagged engagement (Lucas Ferreira, Brazil, hourly).
// ---------------------------------------------------------------------------

function ComplianceCallout({onOpenReview}: {onOpenReview: () => void}) {
  return (
    <div style={styles.complianceCallout}>
      <span style={styles.complianceGlyph}>
        <Icon icon={ScaleIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <VStack gap={1}>
          <Text type="label">Classification review — Lucas Ferreira (Brazil, hourly)</Text>
          <Text type="supporting" color="secondary">
            Billed 152 hrs in June (≈38 hrs/week for the 12th consecutive
            week), works core team hours, and takes day-to-day direction from
            the mobile lead — 2 of 3 misclassification markers under Brazil's
            CLT tests. People Ops recommends converting this engagement to
            EOR employment before the Aug 1 cycle; payouts continue on the
            contractor rail until the review closes.
          </Text>
        </VStack>
      </StackItem>
      <Button label="Open review" variant="secondary" size="sm" onClick={onOpenReview} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// INSPECTOR PANEL — engagement, payment method, tax form, cycle amounts at
// the locked FX rate, and the payout timeline for the active contractor.
// ---------------------------------------------------------------------------

function PayoutTimeline({contractor}: {contractor: Contractor}) {
  return (
    <List density="compact">
      <ListItem
        label="Invoice received"
        description={`${contractor.invoiceRef} · Jul 1, 2026`}
        startContent={<Icon icon={ReceiptTextIcon} size="sm" color="secondary" />}
      />
      <ListItem
        label={`Approved by ${BATCH.approvedBy}`}
        description="Finance lead · Jul 2, 2026"
        startContent={<Icon icon={CheckCircle2Icon} size="sm" color="secondary" />}
      />
      <ListItem
        label="FX rate locked"
        description={`${COUNTRIES[contractor.country].fxLabel} · Jul 12, 16:00 PT`}
        startContent={<Icon icon={GlobeIcon} size="sm" color="secondary" />}
      />
      <ListItem
        label={`Pays out via ${COUNTRIES[contractor.country].rail}`}
        description={`${BATCH.payDate} · ${COUNTRIES[contractor.country].railDetail}`}
        startContent={<Icon icon={SendIcon} size="sm" color="secondary" />}
      />
    </List>
  );
}

function DetailsPanel({
  contractor,
  raviState,
  onSendTaxRequest,
  onOpenReview,
}: {
  contractor: Contractor | null;
  raviState: TaxFormState;
  onSendTaxRequest: () => void;
  onOpenReview: () => void;
}) {
  if (contractor === null) {
    return (
      <div style={styles.panelScroll}>
        <EmptyState
          isCompact
          icon={<Icon icon={UsersIcon} size="lg" />}
          title="No contractor selected"
          description="Select a payout row to inspect the engagement, payment method, and tax form."
        />
      </div>
    );
  }
  const meta = COUNTRIES[contractor.country];
  const state = taxStateFor(contractor, raviState);
  const blocked = state !== 'on-file';
  return (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        <HStack gap={3} vAlign="center">
          <Avatar name={contractor.name} size="medium" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Heading level={3}>{contractor.name}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {contractor.role}
              </Text>
            </VStack>
          </StackItem>
          <FlagChip country={contractor.country} />
        </HStack>

        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token
            size="sm"
            color={contractor.engagement === 'fixed' ? 'blue' : 'purple'}
            label={contractor.engagement === 'fixed' ? 'Fixed retainer' : 'Hourly'}
          />
          {blocked ? (
            <Token
              size="sm"
              color={state === 'requested' ? 'orange' : 'red'}
              label={state === 'requested' ? 'Payout held · form requested' : 'Payout blocked'}
            />
          ) : (
            <Token size="sm" color="green" label="Ready to pay" />
          )}
          {contractor.isFlagged && (
            <Token size="sm" color="orange" label="Classification review" />
          )}
        </HStack>

        {blocked && (
          <div style={styles.holdNote}>
            <span style={styles.holdGlyph}>
              <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
            </span>
            <StackItem size="fill">
              <VStack gap={2}>
                <Text type="supporting" color="secondary">
                  {state === 'requested'
                    ? `W-8BEN request sent Jul 13, 2026. The ${local(contractor.localCents, contractor.country)} (${usd(contractor.usdCents)}) payout stays held until the signed form is on file.`
                    : `No W-8BEN on file. The ${local(contractor.localCents, contractor.country)} (${usd(contractor.usdCents)}) payout is held and drops from the Jul 15 batch unless the form arrives before funding.`}
                </Text>
                {state === 'missing' && (
                  <Button
                    label="Send W-8BEN request"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={SendIcon} size="sm" />}
                    onClick={onSendTaxRequest}
                  />
                )}
              </VStack>
            </StackItem>
          </div>
        )}

        <MetadataList columns={1} label={{position: 'start', width: 104}}>
          <MetadataListItem label="Engagement">
            <Text type="body">
              {contractor.engagement === 'fixed' ? 'Fixed monthly retainer' : 'Hourly'} · since{' '}
              {/* Noon UTC keeps the calendar date stable in every viewer TZ. */}
              <Timestamp value={`${contractor.contractStart}T12:00:00Z`} format="date" />
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Rate">
            <Text type="body" hasTabularNumbers>
              {rateLabel(contractor)}
            </Text>
          </MetadataListItem>
          {contractor.hours !== undefined && (
            <MetadataListItem label="Hours (June)">
              <Text type="body" hasTabularNumbers>
                {formatHours(contractor.hours)}
              </Text>
            </MetadataListItem>
          )}
          <MetadataListItem label="This cycle">
            <Text type="body" hasTabularNumbers>
              {local(contractor.localCents, contractor.country)} → {usd(contractor.usdCents)}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="FX rate">
            <Text type="body" hasTabularNumbers>
              {meta.fxLabel} · locked
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Method">
            <HStack gap={1} vAlign="center">
              <RailBadge country={contractor.country} />
              <span style={styles.methodMask}>{maskWithoutRail(contractor)}</span>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Tax form">
            <Text type="body">
              {contractor.taxForm} ·{' '}
              {state === 'on-file'
                ? contractor.taxDetail
                : state === 'requested'
                  ? 'Requested Jul 13, 2026'
                  : 'Missing'}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Invoice">
            <Text type="body" hasTabularNumbers>
              {contractor.invoiceRef}
            </Text>
          </MetadataListItem>
        </MetadataList>

        {contractor.isFlagged && (
          <div style={styles.panelNote}>
            <VStack gap={2}>
              <HStack gap={1} vAlign="center">
                <Icon icon={ScaleIcon} size="sm" color="secondary" />
                <Text type="label" size="sm">
                  Classification note
                </Text>
              </HStack>
              <Text type="supporting" color="secondary">
                152 hrs in June (≈38 hrs/week, 12th consecutive week) under
                direct manager assignment. People Ops recommends EOR
                conversion before the Aug 1 cycle.
              </Text>
              <Button label="Open classification review" variant="ghost" size="sm" onClick={onOpenReview} />
            </VStack>
          </div>
        )}

        <Divider />
        <VStack gap={2}>
          <Text type="label" size="sm" color="secondary">
            Payout timeline
          </Text>
          <PayoutTimeline contractor={contractor} />
        </VStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

/**
 * Observe the content region's real width. The 320px inspector panel and
 * any host chrome shrink the payout grid independently of the viewport, so
 * viewport media queries alone cannot tell when the full column set is out
 * of room.
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

export default function FinContractorPaymentsTemplate() {
  const [raviState, setRaviState] = useState<TaxFormState>('missing');
  const [stage, setStage] = useState<BatchStage>('review');
  const [activeId, setActiveId] = useState<string | null>('c-menon');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const toast = useToast();

  // Responsive contract: <=1180px drops the inspector panel; the grid drops
  // its Rate/Method columns when the viewport is <=980px OR the measured
  // content region is under the full column set's ~1066px floor.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isViewportCompact = useMediaQuery('(max-width: 980px)');
  const contentRegionRef = useRef<HTMLDivElement | null>(null);
  const contentRegionWidth = useElementWidth(contentRegionRef);
  const isCompact =
    isViewportCompact || (contentRegionWidth > 0 && contentRegionWidth < 1080);

  // Filter + search, derived during render. Counts stay fixed at the
  // canonical figures (all 12 / ready 10 / attention 2) because the tax
  // request keeps Ravi's payout held.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CONTRACTORS.filter(contractor => {
      if (filter === 'ready' && needsAttention(contractor, raviState)) {
        return false;
      }
      if (filter === 'attention' && !needsAttention(contractor, raviState)) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const haystack =
        `${contractor.name} ${contractor.role} ${COUNTRIES[contractor.country].name}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [filter, query, raviState]);

  const visibleByCountry = useMemo(() => {
    const groups = new Map<CountryId, Contractor[]>();
    for (const country of COUNTRY_ORDER) {
      groups.set(country, []);
    }
    for (const contractor of visible) {
      groups.get(contractor.country)?.push(contractor);
    }
    return groups;
  }, [visible]);

  const activeContractor =
    CONTRACTORS.find(contractor => contractor.id === activeId) ?? null;
  const attentionCount = CONTRACTORS.filter(contractor =>
    needsAttention(contractor, raviState),
  ).length;

  const sendTaxRequest = () => {
    setRaviState('requested');
    toast({
      body: 'W-8BEN request emailed to Ravi Menon — payout stays held until the signed form is back',
      uniqueID: 'contractor-tax-request',
    });
  };

  const openReview = () => {
    toast({
      body: 'Classification review CLS-2026-014 opened with People Ops (Dana Whitfield)',
      uniqueID: 'contractor-classification',
    });
  };

  const approveBatch = () => {
    // AlertDialog does not auto-close on action — close it explicitly.
    setIsConfirmOpen(false);
    setStage('approved');
    toast({
      body: `Approved ${BATCH.payableCount} payouts — ${usd(BATCH.payableUsdCents)} funds by ${BATCH.fundingDeadline}`,
      uniqueID: 'contractor-batch-approve',
    });
  };

  // ----- header: title, batch chips, export -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={GlobeIcon} size="md" color="secondary" />
          <Heading level={1}>Contractor payments</Heading>
          <Token size="sm" color="gray" label={BATCH.id} />
          {stage === 'approved' ? (
            <Token size="sm" color="green" label="Approved" />
          ) : (
            <Token size="sm" color="blue" label="In review" />
          )}
        </HStack>
        <Text type="supporting" color="secondary">
          {BATCH.cycleLabel} · pays {BATCH.payDate}
        </Text>
        <StackItem size="fill" />
        <span style={styles.fxChip}>
          <Icon icon={TimerIcon} size="xsm" color="inherit" />
          FX lock expires in {BATCH.fxCountdown}
        </span>
        <Button
          label="Export batch"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          onClick={() =>
            toast({
              body: 'Batch preview CTR-2026-07.csv exported',
              uniqueID: 'contractor-batch-export',
            })
          }
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- blocked-payout banner: missing W-8BEN with a working fix CTA -----
  const blockedBanner =
    raviState === 'missing' ? (
      <Banner
        status="error"
        icon={<Icon icon={FileWarningIcon} size="sm" color="inherit" />}
        title="1 payout blocked — missing W-8BEN"
        description={`Ravi Menon (India, hourly) has no W-8BEN on file, so his ₹183,032.00 ($2,192.00) payout is held. Unless the signed form is back before funding closes ${BATCH.fundingDeadline}, it drops from the ${BATCH.payDate} batch.`}
        endContent={
          <Button
            label="Send W-8BEN request"
            variant="secondary"
            size="sm"
            icon={<Icon icon={SendIcon} size="sm" />}
            onClick={sendTaxRequest}
          />
        }
      />
    ) : (
      <Banner
        status="info"
        icon={<Icon icon={FileClockIcon} size="sm" color="inherit" />}
        title="W-8BEN request sent to Ravi Menon"
        description={`Requested Jul 13, 2026. His ₹183,032.00 ($2,192.00) payout stays held until the signed form is on file; the other ${BATCH.payableCount} payouts are unaffected.`}
      />
    );

  // ----- toolbar: status filter + search + visible count -----
  const toolbar = (
    <div style={styles.toolbar}>
      <SegmentedControl
        label="Payout status filter"
        value={filter}
        onChange={value => setFilter(value as StatusFilter)}
        size="sm">
        <SegmentedControlItem label={`All ${BATCH.contractorCount}`} value="all" />
        <SegmentedControlItem
          label={`Ready ${BATCH.contractorCount - attentionCount}`}
          value="ready"
        />
        <SegmentedControlItem label={`Attention ${attentionCount}`} value="attention" />
      </SegmentedControl>
      <TextInput
        label="Search contractors"
        isLabelHidden
        size="sm"
        width={260}
        placeholder="Search name, role, country…"
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={query}
        onChange={setQuery}
        hasClear
      />
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {visible.length} of {BATCH.contractorCount} contractors ·{' '}
        {COUNTRY_ORDER.length} countries
      </Text>
    </div>
  );

  // ----- payout groups (or the search empty state) -----
  const groups =
    visible.length === 0 ? (
      <EmptyState
        isCompact
        icon={<Icon icon={SearchIcon} size="lg" />}
        title="No matching contractors"
        description="Try a different name, role, or country — or clear the status filter."
      />
    ) : (
      <div style={styles.gridWrap}>
        <div style={{...styles.gridMin, ...(isCompact ? styles.gridMinCompact : null)}}>
          <GridHeaderRow isCompact={isCompact} />
          <Divider />
          {COUNTRY_ORDER.map(country => (
            <CountryGroup
              key={country}
              country={country}
              contractors={visibleByCountry.get(country) ?? []}
              raviState={raviState}
              activeId={activeId}
              isCompact={isCompact}
              onSelect={setActiveId}
            />
          ))}
        </div>
      </div>
    );

  // ----- pinned footer: funding summary + approve bar -----
  const footer = (
    <LayoutFooter hasDivider>
      <div style={styles.footerBar}>
        {/* StatusDot's `label` is aria-only — the visible copy rides Text. */}
        {stage === 'approved' ? (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StatusDot variant="success" label="Batch approved" />
            <Text type="label" size="sm">
              Batch approved
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {BATCH.payableCount} payouts · {usd(BATCH.payableUsdCents)} funding by{' '}
              {BATCH.fundingDeadline}
            </Text>
          </HStack>
        ) : (
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StatusDot
              variant="warning"
              label={`${BATCH.payableCount} of ${BATCH.contractorCount} payouts ready`}
            />
            <Text type="label" size="sm" hasTabularNumbers>
              {BATCH.payableCount} of {BATCH.contractorCount} payouts ready
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {usd(BATCH.payableUsdCents)} payable now · {usd(BATCH.blockedUsdCents)} held ·
              fund by {BATCH.fundingDeadline}
            </Text>
          </HStack>
        )}
        <StackItem size="fill" />
        <Badge
          variant={raviState === 'missing' ? 'error' : 'warning'}
          label={raviState === 'missing' ? '1 blocker' : '1 form pending'}
        />
        <Button
          label={`Approve ${BATCH.payableCount} payouts`}
          variant="primary"
          size="sm"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          isDisabled={stage === 'approved'}
          onClick={() => setIsConfirmOpen(true)}
        />
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div ref={contentRegionRef} style={styles.contentScroll}>
                {stage === 'approved' && (
                  <Banner
                    status="success"
                    icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
                    title="Batch approved"
                    description={`${BATCH.payableCount} payouts locked at the Jul 12 FX rates. ${usd(BATCH.payableUsdCents)} funds by ${BATCH.fundingDeadline}; contractors are paid ${BATCH.payDate} on their local rails.`}
                  />
                )}
                {blockedBanner}
                <SummaryTiles />
                {toolbar}
                {groups}
                <ComplianceCallout onOpenReview={openReview} />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden ? (
            <LayoutPanel width={320} padding={0} hasDivider label="Contractor details">
              <div style={styles.panelFill}>
                <DetailsPanel
                  contractor={activeContractor}
                  raviState={raviState}
                  onSendTaxRequest={sendTaxRequest}
                  onOpenReview={openReview}
                />
              </div>
            </LayoutPanel>
          ) : undefined
        }
        footer={footer}
      />
      <AlertDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={`Approve ${BATCH.payableCount} contractor payouts?`}
        description={`Approves ${usd(BATCH.payableUsdCents)} across SEPA, PIX, UPI, and EFT at the locked FX rates (expire in ${BATCH.fxCountdown}). Funding debits the Kestrel operating account by ${BATCH.fundingDeadline}; contractors are paid ${BATCH.payDate}. Ravi Menon's held ${usd(BATCH.blockedUsdCents)} is excluded until his W-8BEN is on file.`}
        actionLabel="Approve payouts"
        actionVariant="primary"
        cancelLabel="Keep reviewing"
        onAction={approveBatch}
      />
    </div>
  );
}
