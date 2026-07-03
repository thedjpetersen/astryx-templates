// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Kestrel Labs' three payroll entities
 *   (US C-Corp, Portugal Lda, EOR contractor pool), July 2026 filing
 *   deadlines, per-entity compliance registers, EUR hedge positions, and one
 *   Ireland expansion request. All figures are frozen "as of Fri, Jul 3,
 *   2026"; no clocks, no randomness, no network media.
 * @output Global Payroll & Entities — the multi-entity oversight console of
 *   a Rippling-style workforce platform for Kestrel Labs (140 people).
 *   Entity cards (Kestrel Labs, Inc. US — 118 employees; Kestrel Portugal,
 *   Lda. — 16; EOR remote contractors — 6) with next-payday chips and
 *   local-currency payroll totals; a filing-deadline calendar strip (941
 *   quarterly, W-2 annual, Portugal Segurança Social monthly) with days-left
 *   chips and one urgent red filing; a per-entity compliance checklist Table
 *   (registrations, tax accounts, one pending Colorado registration amber);
 *   an FX exposure card splitting EUR payroll into hedged/unhedged; and a
 *   country-expansion request note (Ireland entity under review).
 * @position Page template; emitted by `astryx template fin-global-payroll`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title + cycle totals + export) | content (entity card grid,
 *   filing-deadline strip, compliance section with entity filter + Table)
 *   | end panel 340 (FX exposure card, Ireland expansion note).
 * Container policy: app-shell archetype — frame rows and styled sections;
 *   the entity tiles are selectable <button> cards (they drive the
 *   compliance filter), and the FX/expansion blocks are genuine summary
 *   widgets, the only card-shaped chrome on the page.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens (the
 *   demo does not inject `--color-data-categorical-*`) and the soft accent /
 *   red tint pairs on the selected entity card and the urgent filing tile.
 *
 * Responsive contract:
 * - > 1180px: full three-region frame; entity cards sit three-up.
 * - <= 1180px: the end panel is dropped; the FX exposure card and the
 *   Ireland expansion note render as a two-up wrap grid at the bottom of
 *   the content column so no spec'd region is lost.
 * - <= 860px: entity cards stack via the auto-fit grid, the deadline strip
 *   scrolls horizontally (deliberate), the compliance Table drops the Type
 *   and Verified columns, and the header row wraps instead of clipping.
 * - The content column is the single scroll body (`minHeight: 0` down the
 *   flex chain); the end panel scrolls independently.
 *
 * Fixture reconciliation (Kestrel Labs canon — 140 people):
 * - Headcount: US 118 + Portugal 16 + EOR 6 = 140.
 * - US state jurisdiction counts: CA 64 + WA 18 + NY 14 + MA 9 + TX 13 = 118.
 * - July cycle gross, USD-equivalent: US $521,180.00 + Portugal €58,400.00 ×
 *   1.0800 = $63,072.00 + EOR $28,228.00 = $612,480.00 — the same figure as
 *   the fin-payroll-run Jul 15 register.
 * - FX: monthly EUR employer cost €58,400.00 gross + €13,870.00 employer
 *   Segurança Social (23.75%) = €72,270.00; H2 2026 exposure 6 × €72,270.00
 *   = €433,620.00; hedged €260,000.00 (60%) via two €130,000.00 forwards,
 *   unhedged €173,620.00 × 1.0800 spot = $187,509.60.
 * - Segurança Social remittance: employee 11% (€6,424.00) + employer 23.75%
 *   (€13,870.00) = €20,294.00 due Jul 10.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  AlertTriangleIcon,
  ArrowRightLeftIcon,
  Building2Icon,
  CalendarClockIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  GlobeIcon,
  LandmarkIcon,
  MapPinIcon,
  PlusIcon,
  ShieldCheckIcon,
  UsersIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
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
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // Entity cards -----------------------------------------------------------
  entityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--spacing-3)',
    flexShrink: 0,
  },
  entityCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    textAlign: 'start',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    minWidth: 0,
  },
  entityCardSelected: {
    // Inset outline so selection never bleeds onto grid neighbors.
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    // Intentional literal: soft accent wash pairing the selected card with
    // the compliance filter below it; reads in both schemes.
    backgroundColor: 'light-dark(rgba(1,113,227,0.05), rgba(76,158,255,0.10))',
  },
  entityGlyph: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-container)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  entityFigure: {
    fontSize: 22,
    lineHeight: 1.2,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  entityStatCol: {display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0},
  entityFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    borderTop: 'var(--border-width) solid var(--color-border)',
    paddingTop: 'var(--spacing-2)',
  },
  // Filing-deadline strip ----------------------------------------------------
  deadlineStrip: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
    flexShrink: 0,
  },
  deadlineTile: {
    flex: '0 0 360px',
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  deadlineTileUrgent: {
    // Intentional literal: red tint + border for the one urgent filing so
    // it reads at a glance in both schemes.
    borderColor: 'light-dark(#DC2626, #F87171)',
    backgroundColor: 'light-dark(rgba(220,38,38,0.05), rgba(248,113,113,0.10))',
  },
  dateBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    flexShrink: 0,
    padding: 'var(--spacing-1) 0',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  dateBlockMonth: {
    fontSize: 10,
    fontWeight: 650,
    letterSpacing: '0.08em',
    color: 'var(--color-text-secondary)',
  },
  dateBlockDay: {
    fontSize: 18,
    fontWeight: 650,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  // Compliance section -------------------------------------------------------
  complianceSection: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  complianceToolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  complianceTableWrap: {overflowX: 'auto', paddingInline: 'var(--spacing-2)'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  refCell: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  // End-panel widgets --------------------------------------------------------
  widgetCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  inlineWidgetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--spacing-3)',
    alignItems: 'start',
    flexShrink: 0,
  },
  fxBar: {
    display: 'flex',
    height: 14,
    borderRadius: 999,
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  fxLegendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  fxFigure: {
    fontSize: 20,
    lineHeight: 1.2,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  timelineRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  // Optically centers the 8px dot on the step-label cap height.
  timelineDot: {display: 'inline-flex', flexShrink: 0, paddingTop: 5},
  noteQuote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '3px solid var(--color-border)',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CAT_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// Soft tint pairs for the entity glyph squares (dark side lightens).
const GLYPH_TINT = {
  blue: 'light-dark(rgba(1,113,227,0.10), rgba(76,158,255,0.18))',
  teal: 'light-dark(rgba(14,126,139,0.10), rgba(51,184,199,0.18))',
  purple: 'light-dark(rgba(107,30,253,0.08), rgba(157,107,255,0.18))',
} as const;

// ---------------------------------------------------------------------------
// MONEY — integer cents everywhere; pure formatters, no locale APIs.
// ---------------------------------------------------------------------------

function group(units: number): string {
  return String(units).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function money(cents: number, symbol: '$' | '€'): string {
  const abs = Math.abs(cents);
  const sign = cents < 0 ? '−' : '';
  return `${sign}${symbol}${group(Math.floor(abs / 100))}.${String(abs % 100).padStart(2, '0')}`;
}

const usd = (cents: number) => money(cents, '$');
const eur = (cents: number) => money(cents, '€');

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140 people; Engineering 52, Design 18, GTM 34,
// Ops 16, Finance 8, People 12). Console frozen at Fri, Jul 3, 2026.
// Signed-in admin: Elena Voss (Finance lead). Headcount reconciles:
// US 118 + Portugal 16 + EOR 6 = 140. July cycle gross (USD equiv):
// 521,180.00 + 63,072.00 + 28,228.00 = 612,480.00.
// ---------------------------------------------------------------------------

const AS_OF = 'Fri, Jul 3, 2026';
const EUR_USD_SPOT = 1.08; // ECB fix, Jul 2, 2026

type EntityId = 'us' | 'pt' | 'eor';
type EntityFilter = 'all' | EntityId;

interface Entity {
  id: EntityId;
  name: string;
  legalLine: string;
  kind: 'Local entity' | 'EOR';
  glyphColor: keyof typeof GLYPH_TINT;
  headcount: number;
  headcountLabel: string;
  currency: '$' | '€';
  payrollCents: number; // July cycle gross, local currency
  payrollCaption: string;
  usdEquivCents: number | null; // non-null only for non-USD entities
  frequency: string;
  paydayLabel: string; // e.g. "Pays Wed, Jul 15"
  paydayDaysLeft: number; // from Jul 3
  jurisdictionLine: string;
}

const ENTITIES: Entity[] = [
  {
    id: 'us',
    name: 'Kestrel Labs, Inc.',
    legalLine: 'Delaware C-Corp · San Francisco, CA',
    kind: 'Local entity',
    glyphColor: 'blue',
    headcount: 118,
    headcountLabel: '118 employees',
    currency: '$',
    payrollCents: 52_118_000,
    payrollCaption: 'Jul 1–15 run gross',
    usdEquivCents: null,
    frequency: 'Semi-monthly',
    paydayLabel: 'Pays Wed, Jul 15',
    paydayDaysLeft: 12,
    jurisdictionLine: 'Federal + 5 states · CA 64 · WA 18 · NY 14 · MA 9 · TX 13',
  },
  {
    id: 'pt',
    name: 'Kestrel Portugal, Lda.',
    legalLine: 'Sociedade por quotas · Lisbon',
    kind: 'Local entity',
    glyphColor: 'teal',
    headcount: 16,
    headcountLabel: '16 employees',
    currency: '€',
    payrollCents: 5_840_000,
    payrollCaption: 'July gross',
    usdEquivCents: 6_307_200, // €58,400.00 × 1.0800
    frequency: 'Monthly',
    paydayLabel: 'Pays Fri, Jul 24',
    paydayDaysLeft: 21,
    jurisdictionLine: 'Portugal · Segurança Social + AT withholding',
  },
  {
    id: 'eor',
    name: 'EOR — Remote contractors',
    legalLine: 'via Anchorpoint EOR (MSA-2024-118)',
    kind: 'EOR',
    glyphColor: 'purple',
    headcount: 6,
    headcountLabel: '6 contractors',
    currency: '$',
    payrollCents: 2_822_800,
    payrollCaption: 'July invoice',
    usdEquivCents: null,
    frequency: 'Monthly',
    paydayLabel: 'Pays Fri, Jul 31',
    paydayDaysLeft: 28,
    jurisdictionLine: 'Canada 2 · Ireland 2 · Brazil 1 · Japan 1',
  },
];

// Header roll-up: 140 people, $612,480.00 USD-equivalent July cycle gross —
// the same figure as the fin-payroll-run Jul 15 register.
const CYCLE_GROSS_USD_CENTS = 61_248_000;
const TOTAL_HEADCOUNT = 140;

// ---------------------------------------------------------------------------
// FILING DEADLINES — days-left computed from the frozen Jul 3 instant.
// Chip urgency: <= 7 days red, <= 21 amber, else neutral.
// ---------------------------------------------------------------------------

type FilingStatus = 'not-started' | 'in-prep' | 'scheduled' | 'not-due';

interface Filing {
  id: string;
  entityId: EntityId;
  month: string; // date-block month, e.g. 'JUL'
  day: number;
  name: string;
  agency: string;
  cadence: 'Monthly' | 'Quarterly' | 'Annual';
  daysLeft: number;
  status: FilingStatus;
  amountLine: string;
}

const FILINGS: Filing[] = [
  {
    id: 'f-dri',
    entityId: 'pt',
    month: 'JUL',
    day: 10,
    name: 'Segurança Social — DRI',
    agency: 'Instituto da Segurança Social',
    cadence: 'Monthly',
    daysLeft: 7,
    status: 'not-started',
    // €6,424.00 employee (11%) + €13,870.00 employer (23.75%) on €58,400.00.
    amountLine: 'Remits €20,294.00 (June remuneration)',
  },
  {
    id: 'f-dmr',
    entityId: 'pt',
    month: 'JUL',
    day: 20,
    name: 'IRS withholding — DMR',
    agency: 'Autoridade Tributária',
    cadence: 'Monthly',
    daysLeft: 17,
    status: 'in-prep',
    amountLine: 'Remits €9,782.00 (June Cat. A withholding)',
  },
  {
    id: 'f-941',
    entityId: 'us',
    month: 'JUL',
    day: 31,
    name: 'Form 941 — Q2 2026',
    agency: 'IRS',
    cadence: 'Quarterly',
    daysLeft: 28,
    status: 'in-prep',
    amountLine: 'Reports Q2 wages · deposits already made via EFTPS',
  },
  {
    id: 'f-de9',
    entityId: 'us',
    month: 'JUL',
    day: 31,
    name: 'DE 9 / DE 9C — Q2',
    agency: 'California EDD',
    cadence: 'Quarterly',
    daysLeft: 28,
    status: 'scheduled',
    amountLine: 'Auto-files with the Q2 close · 64 CA employees',
  },
  {
    id: 'f-wapfml',
    entityId: 'us',
    month: 'JUL',
    day: 31,
    name: 'WA Paid Leave & WA Cares — Q2',
    agency: 'Washington ESD',
    cadence: 'Quarterly',
    daysLeft: 28,
    status: 'scheduled',
    amountLine: 'Auto-files with the Q2 close · 18 WA employees',
  },
  {
    id: 'f-w2',
    entityId: 'us',
    month: 'FEB',
    day: 1,
    name: 'W-2 / W-3 — TY 2026',
    agency: 'IRS / SSA',
    cadence: 'Annual',
    daysLeft: 213,
    status: 'not-due',
    amountLine: 'Annual wage statements · opens after the Dec 31 run',
  },
];

const FILING_STATUS_META: Record<
  FilingStatus,
  {label: string; color: TokenColor}
> = {
  'not-started': {label: 'Not started', color: 'red'},
  'in-prep': {label: 'In prep', color: 'blue'},
  scheduled: {label: 'Scheduled', color: 'green'},
  'not-due': {label: 'Not due yet', color: 'gray'},
};

function daysLeftChip(daysLeft: number): {label: string; color: TokenColor} {
  if (daysLeft <= 7) {
    return {label: `${daysLeft}d left`, color: 'red'};
  }
  if (daysLeft <= 21) {
    return {label: `${daysLeft}d left`, color: 'orange'};
  }
  return {label: `${daysLeft}d left`, color: 'gray'};
}

// ---------------------------------------------------------------------------
// COMPLIANCE REGISTER — registrations, tax accounts, insurance, agreements.
// One amber row: the pending Colorado registration (first Denver hire
// starts Aug 3). US state headcounts sum to 118: 64+18+14+9+13.
// ---------------------------------------------------------------------------

type ComplianceStatus = 'active' | 'pending' | 'review';

// The Table generic requires rows assignable to Record<string, unknown>.
interface ComplianceRow extends Record<string, unknown> {
  id: string;
  entityId: EntityId;
  name: string;
  note?: string;
  type: 'Registration' | 'Tax account' | 'Insurance' | 'Agreement';
  jurisdiction: string;
  reference: string;
  status: ComplianceStatus;
  verified: string;
  hasStatusCheck?: boolean;
}

// Compact fixture rows (tuple pattern): [id, entityId, name, type,
// jurisdiction, reference, status, verified, note?, hasStatusCheck?].
type ComplianceSpec = [
  string,
  EntityId,
  string,
  ComplianceRow['type'],
  string,
  string,
  ComplianceStatus,
  string,
  string?,
  boolean?,
];

const COMPLIANCE_SPECS: ComplianceSpec[] = [
  // --- Kestrel Labs, Inc. (US) — 9 active, 1 pending -----------------------
  ['c-ein', 'us', 'Federal EIN', 'Registration', 'Federal', '84-3921647',
    'active', 'Mar 2, 2026'],
  ['c-eftps', 'us', 'EFTPS deposit enrollment', 'Tax account', 'Federal',
    'BATCH-2214', 'active', 'Mar 2, 2026'],
  ['c-ca', 'us', 'CA EDD employer account', 'Tax account',
    'California · 64 ppl', '921-4487-1', 'active', 'Apr 14, 2026'],
  ['c-wa', 'us', 'WA ESD + L&I accounts', 'Tax account',
    'Washington · 18 ppl', '604-118-334', 'active', 'Apr 14, 2026'],
  ['c-ny', 'us', 'NY withholding + UI', 'Tax account', 'New York · 14 ppl',
    'NY-88-41172', 'active', 'Apr 20, 2026'],
  ['c-ma', 'us', 'MA DOR / DUA accounts', 'Tax account',
    'Massachusetts · 9 ppl', 'WTH-4471820', 'active', 'Apr 20, 2026'],
  ['c-tx', 'us', 'TX TWC unemployment account', 'Tax account',
    'Texas · 13 ppl', '14-887729-6', 'active', 'May 5, 2026'],
  ['c-co', 'us', 'CO wage withholding + UI', 'Registration',
    'Colorado · hire Aug 3', 'FILED-0626', 'pending', 'Filed Jun 26, 2026',
    'First Denver hire (Maya Brooks, Platform) starts Aug 3 — CDLE account number pending.',
    true],
  ['c-wc', 'us', 'Workers’ comp policy — The Hartford', 'Insurance',
    'All US states', 'WC-8834412', 'active', 'Renews Jan 1, 2027'],
  ['c-agent', 'us', 'Registered-agent coverage — CSC', 'Registration',
    '5 states + DE', 'RA-118-05', 'active', 'Jun 1, 2026'],
  // --- Kestrel Portugal, Lda. — 5 active ------------------------------------
  ['c-nipc', 'pt', 'NIPC — commercial registry', 'Registration', 'Portugal',
    'PT 517 442 908', 'active', 'Feb 6, 2026'],
  ['c-ss', 'pt', 'Segurança Social employer no.', 'Tax account', 'Portugal',
    '25118244716', 'active', 'Feb 6, 2026'],
  ['c-at', 'pt', 'AT withholding — Cat. A', 'Tax account', 'Portugal',
    '517442908', 'active', 'Feb 6, 2026'],
  ['c-fid', 'pt', 'Work-accident insurance — Fidelidade', 'Insurance',
    'Portugal', 'AP-2210443', 'active', 'Renews Mar 1, 2027'],
  ['c-fct', 'pt', 'FCT / FGCT compensation funds', 'Tax account', 'Portugal',
    '517442908-01', 'active', 'Mar 12, 2026'],
  // --- EOR — Anchorpoint ----------------------------------------------------
  ['c-msa', 'eor', 'Anchorpoint EOR master agreement', 'Agreement', 'Global',
    'MSA-2024-118', 'active', 'Renewed May 8, 2026'],
  ['c-contracts', 'eor', 'Local employment contracts', 'Agreement',
    '4 countries', '6/6 signed', 'active', 'Jun 3, 2026'],
  ['c-class', 'eor', 'Contractor classification review', 'Agreement',
    'CA · IE · BR · JP', 'CR-2026-06', 'active', 'Jun 12, 2026'],
  ['c-ie', 'eor', 'Ireland conversion assessment', 'Registration',
    'Ireland · 2 contractors', 'EXP-IE-01', 'review', 'Opened Jun 18, 2026',
    'Feeds the Ireland entity request — see the expansion note.'],
];

const COMPLIANCE_ROWS: ComplianceRow[] = COMPLIANCE_SPECS.map(
  ([id, entityId, name, type, jurisdiction, reference, status, verified, note, hasStatusCheck]) => ({
    id, entityId, name, type, jurisdiction, reference, status, verified, note, hasStatusCheck,
  }),
);

const COMPLIANCE_STATUS_META: Record<
  ComplianceStatus,
  {label: string; variant: 'success' | 'warning' | 'info'}
> = {
  active: {label: 'Active', variant: 'success'},
  pending: {label: 'Pending', variant: 'warning'},
  review: {label: 'Under review', variant: 'info'},
};

// ---------------------------------------------------------------------------
// FX EXPOSURE — EUR payroll hedge program, H2 2026 (Jul–Dec).
// Monthly EUR employer cost: €58,400.00 gross + €13,870.00 employer SS
// = €72,270.00; 6 months = €433,620.00. Hedged €260,000.00 (~60%) via two
// forwards; unhedged €173,620.00 × 1.0800 spot = $187,509.60.
// ---------------------------------------------------------------------------

const FX = {
  exposureCents: 43_362_000,
  hedgedCents: 26_000_000,
  unhedgedCents: 17_362_000,
  hedgedPctLabel: '60%',
  unhedgedPctLabel: '40%',
  spotLabel: '1.0800 · ECB fix, Jul 2',
  unhedgedAtSpotUsdCents: 18_750_960,
  policyLine: 'Policy: keep ≥ 50% of rolling 6-month EUR payroll hedged',
  forwards: [
    {
      id: 'FWD-2026-031',
      amountCents: 13_000_000,
      rateLabel: '@ 1.0765',
      settles: 'Settles Sep 30, 2026',
      bank: 'Meridian Bank',
    },
    {
      id: 'FWD-2026-044',
      amountCents: 13_000_000,
      rateLabel: '@ 1.0812',
      settles: 'Settles Dec 31, 2026',
      bank: 'Meridian Bank',
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// COUNTRY EXPANSION — Ireland entity request EXP-IE-01, under review.
// ---------------------------------------------------------------------------

const EXPANSION = {
  requestId: 'EXP-IE-01',
  country: 'Ireland — Kestrel Ireland Ltd (proposed)',
  summary:
    'Convert 2 Anchorpoint EOR contractors (Aoife Byrne — Senior SRE, ' +
    'Cillian Walsh — Data engineer) to a local entity; 3 Dublin ' +
    'engineering hires planned for H2 2026.',
  financeNote:
    'EOR premium at current Ireland headcount runs $2,340.00/mo; the ' +
    'entity breaks even at 4 heads. Recommend approval if all 3 H2 ' +
    'requisitions are confirmed. — Elena Voss, Jun 30',
  decisionTarget: 'Due Jul 24, 2026',
  steps: [
    {
      id: 'x-req',
      label: 'Requested — Priya Raman',
      detail: 'Jun 18, 2026',
      state: 'done' as const,
    },
    {
      id: 'x-fin',
      label: 'Finance model — Elena Voss',
      detail: 'Jun 30, 2026',
      state: 'done' as const,
    },
    {
      id: 'x-legal',
      label: 'Legal review — Arden & Gray LLP',
      detail: 'Started Jul 2 · est. 3 weeks',
      state: 'current' as const,
    },
    {
      id: 'x-decision',
      label: 'Decision — Finance & Legal',
      detail: 'Target Jul 24, 2026',
      state: 'upcoming' as const,
    },
  ],
} as const;

// ---------------------------------------------------------------------------
// ENTITY CARD — selectable <button> tile; selection drives the compliance
// filter below the fold.
// ---------------------------------------------------------------------------

function complianceSummary(entityId: EntityId): {
  variant: 'success' | 'warning';
  label: string;
} {
  const rows = COMPLIANCE_ROWS.filter(row => row.entityId === entityId);
  const open = rows.filter(row => row.status === 'pending').length;
  const done = rows.filter(row => row.status === 'active').length;
  return open > 0
    ? {variant: 'warning', label: `${done}/${rows.length} complete · ${open} pending`}
    : {variant: 'success', label: `${done}/${rows.length} complete`};
}

function EntityCard({
  entity,
  isSelected,
  onSelect,
}: {
  entity: Entity;
  isSelected: boolean;
  onSelect: (id: EntityId) => void;
}) {
  const summary = complianceSummary(entity.id);
  const payday = daysLeftChip(entity.paydayDaysLeft);
  const fmt = entity.currency === '€' ? eur : usd;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(entity.id)}
      style={
        isSelected
          ? {...styles.entityCard, ...styles.entityCardSelected}
          : styles.entityCard
      }>
      <HStack gap={3} vAlign="center">
        <span
          style={{
            ...styles.entityGlyph,
            backgroundColor: GLYPH_TINT[entity.glyphColor],
            color: CAT_COLOR[entity.glyphColor],
          }}
          aria-hidden>
          <Icon
            icon={entity.kind === 'EOR' ? GlobeIcon : Building2Icon}
            size="sm"
            color="inherit"
          />
        </span>
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Text type="label" maxLines={1}>
                {entity.name}
              </Text>
              <Token
                size="sm"
                color={entity.kind === 'EOR' ? 'purple' : 'gray'}
                label={entity.kind}
              />
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {entity.legalLine}
            </Text>
          </VStack>
        </StackItem>
        {isSelected ? (
          <Icon icon={CheckCircle2Icon} size="sm" color="accent" />
        ) : null}
      </HStack>
      <HStack gap={4} vAlign="end" wrap="wrap">
        <div style={styles.entityStatCol}>
          <Text type="supporting" color="secondary">
            {entity.payrollCaption}
          </Text>
          <span style={styles.entityFigure}>{fmt(entity.payrollCents)}</span>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {entity.usdEquivCents !== null
              ? `≈ ${usd(entity.usdEquivCents)} @ ${EUR_USD_SPOT.toFixed(4)}`
              : `${entity.frequency} · USD`}
          </Text>
        </div>
        <StackItem size="fill" />
        <div style={{...styles.entityStatCol, alignItems: 'flex-end'}}>
          <HStack gap={1} vAlign="center">
            <Icon icon={UsersIcon} size="xsm" color="secondary" />
            <Text type="label" size="sm" hasTabularNumbers>
              {entity.headcountLabel}
            </Text>
          </HStack>
          <Token
            size="sm"
            color={payday.color === 'red' ? 'orange' : payday.color}
            icon={<Icon icon={CalendarClockIcon} size="xsm" color="inherit" />}
            label={`${entity.paydayLabel} · ${payday.label}`}
          />
        </div>
      </HStack>
      <div style={styles.entityFooter}>
        <HStack gap={1} vAlign="center">
          <StatusDot
            variant={summary.variant}
            label={summary.variant === 'warning' ? 'Needs attention' : 'Complete'}
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {summary.label}
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {entity.jurisdictionLine}
        </Text>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// FILING TILE — one deadline in the calendar strip. The single red filing
// (Segurança Social DRI, 7 days out) carries a working "Start prep" action.
// ---------------------------------------------------------------------------

// Short entity names keep the one-line tile meta from double-truncating.
const ENTITY_SHORT: Record<EntityId, string> = {
  us: 'US entity',
  pt: 'Portugal',
  eor: 'EOR',
};

function FilingTile({
  filing,
  status,
  onStartPrep,
}: {
  filing: Filing;
  status: FilingStatus;
  onStartPrep: (id: string) => void;
}) {
  const isUrgent = filing.daysLeft <= 7;
  const chip = daysLeftChip(filing.daysLeft);
  const statusMeta = FILING_STATUS_META[status];
  return (
    <div
      style={
        isUrgent
          ? {...styles.deadlineTile, ...styles.deadlineTileUrgent}
          : styles.deadlineTile
      }>
      <div style={styles.dateBlock} aria-hidden>
        <span style={styles.dateBlockMonth}>{filing.month}</span>
        <span style={styles.dateBlockDay}>{filing.day}</span>
      </div>
      <VStack gap={1} style={{minWidth: 0, flex: 1}}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="label" maxLines={1}>
              {filing.name}
            </Text>
          </StackItem>
          <Token
            size="sm"
            color={chip.color}
            label={chip.label}
            style={{flexShrink: 0}}
          />
        </HStack>
        <Text type="supporting" color="secondary" maxLines={1}>
          {filing.agency} · {filing.cadence} · {ENTITY_SHORT[filing.entityId]}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
          {filing.amountLine}
        </Text>
        <HStack gap={2} vAlign="center">
          <Token
            size="sm"
            color={statusMeta.color}
            label={statusMeta.label}
            style={{flexShrink: 0}}
          />
          {isUrgent && status === 'not-started' ? (
            <Button
              label="Start prep"
              size="sm"
              variant="secondary"
              onClick={() => onStartPrep(filing.id)}
            />
          ) : null}
          {isUrgent && status !== 'not-started' ? (
            <Text type="supporting" color="secondary">
              Assigned to Elena Voss
            </Text>
          ) : null}
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPLIANCE TABLE — columns; compact drops Type and Verified so item /
// jurisdiction / reference / status never crush.
// ---------------------------------------------------------------------------

function ItemCell({
  row,
  onCheckStatus,
}: {
  row: ComplianceRow;
  onCheckStatus: () => void;
}) {
  return (
    <VStack gap={0} style={{minWidth: 0, paddingBlock: 'var(--spacing-1)'}}>
      <Text type="label" maxLines={1}>
        {row.name}
      </Text>
      {row.note !== undefined ? (
        <Text type="supporting" color="secondary" maxLines={2}>
          {row.note}
        </Text>
      ) : null}
      {row.hasStatusCheck === true ? (
        <div style={{marginTop: 'var(--spacing-1)'}}>
          <Button
            label="Check status"
            size="sm"
            variant="secondary"
            onClick={onCheckStatus}
          />
        </div>
      ) : null}
    </VStack>
  );
}

function buildComplianceColumns(
  isCompact: boolean,
  onCheckStatus: () => void,
): TableColumn<ComplianceRow>[] {
  const columns: TableColumn<ComplianceRow>[] = [
    {
      key: 'name',
      header: 'Item',
      width: proportional(2, {minWidth: 240}),
      renderCell: (row: ComplianceRow) => (
        <ItemCell row={row} onCheckStatus={onCheckStatus} />
      ),
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'type',
      header: 'Type',
      width: pixel(110),
      renderCell: (row: ComplianceRow) => (
        <Text type="body" color="secondary" maxLines={1}>
          {row.type}
        </Text>
      ),
    });
  }
  columns.push(
    {
      key: 'jurisdiction',
      header: 'Jurisdiction',
      width: pixel(170),
      renderCell: (row: ComplianceRow) => (
        <Text type="body" maxLines={1}>
          {row.jurisdiction}
        </Text>
      ),
    },
    {
      key: 'reference',
      header: 'Account / ref',
      width: pixel(140),
      renderCell: (row: ComplianceRow) => (
        <span style={styles.refCell}>{row.reference}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(120),
      renderCell: (row: ComplianceRow) => {
        const meta = COMPLIANCE_STATUS_META[row.status];
        return <Badge variant={meta.variant} label={meta.label} />;
      },
    },
  );
  if (!isCompact) {
    columns.push({
      key: 'verified',
      header: 'Verified',
      width: pixel(130),
      renderCell: (row: ComplianceRow) => (
        <Text type="body" color="secondary" maxLines={1} hasTabularNumbers>
          {row.verified}
        </Text>
      ),
    });
  }
  return columns;
}

// ---------------------------------------------------------------------------
// FX EXPOSURE WIDGET — hedged/unhedged split of the H2 2026 EUR payroll.
// ---------------------------------------------------------------------------

function FxExposureCard() {
  return (
    <div style={styles.widgetCard}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ArrowRightLeftIcon} size="sm" color="secondary" />
        <Heading level={2}>FX exposure</Heading>
        <StackItem size="fill" />
        <Token
          size="sm"
          color="green"
          label="Within policy"
          style={{flexShrink: 0}}
        />
      </HStack>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          H2 2026 EUR payroll + employer charges (Jul–Dec)
        </Text>
        <span style={styles.fxFigure}>{eur(FX.exposureCents)}</span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          6 × €72,270.00/mo (€58,400.00 gross + €13,870.00 employer SS)
        </Text>
      </VStack>
      {/* Hedged/unhedged split bar — legend below labels each segment. */}
      <div
        style={styles.fxBar}
        role="img"
        aria-label={`Hedged ${eur(FX.hedgedCents)} (${FX.hedgedPctLabel}), unhedged ${eur(FX.unhedgedCents)} (${FX.unhedgedPctLabel})`}>
        <span
          style={{flexGrow: 60, backgroundColor: CAT_COLOR.teal}}
          aria-hidden
        />
        <span
          style={{flexGrow: 40, backgroundColor: CAT_COLOR.orange}}
          aria-hidden
        />
      </div>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <span
            style={{...styles.fxLegendSwatch, backgroundColor: CAT_COLOR.teal}}
            aria-hidden
          />
          <Text type="label" size="sm">
            Hedged
          </Text>
          <StackItem size="fill" />
          <Text type="body" hasTabularNumbers style={styles.numericCell}>
            {eur(FX.hedgedCents)} · {FX.hedgedPctLabel}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <span
            style={{...styles.fxLegendSwatch, backgroundColor: CAT_COLOR.orange}}
            aria-hidden
          />
          <Text type="label" size="sm">
            Unhedged
          </Text>
          <StackItem size="fill" />
          <Text type="body" hasTabularNumbers style={styles.numericCell}>
            {eur(FX.unhedgedCents)} · {FX.unhedgedPctLabel}
          </Text>
        </HStack>
      </VStack>
      <Divider />
      <VStack gap={2}>
        {FX.forwards.map(forward => (
          <VStack key={forward.id} gap={0}>
            <HStack gap={2} vAlign="center">
              <Token
                size="sm"
                color="teal"
                label={forward.id}
                style={{flexShrink: 0}}
              />
              <StackItem size="fill" />
              <Text type="body" hasTabularNumbers style={styles.numericCell}>
                {eur(forward.amountCents)} {forward.rateLabel}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {forward.settles} · {forward.bank}
            </Text>
          </VStack>
        ))}
      </VStack>
      <MetadataList>
        <MetadataListItem label="Spot rate">
          <Text type="body" hasTabularNumbers>
            {FX.spotLabel}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Unhedged at spot">
          <Text type="body" hasTabularNumbers>
            {usd(FX.unhedgedAtSpotUsdCents)}
          </Text>
        </MetadataListItem>
      </MetadataList>
      <Text type="supporting" color="secondary">
        {FX.policyLine}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COUNTRY-EXPANSION NOTE — Ireland entity request, under review.
// ---------------------------------------------------------------------------

function ExpansionCard({onOpenRequest}: {onOpenRequest: () => void}) {
  return (
    <div style={styles.widgetCard}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={MapPinIcon} size="sm" color="secondary" />
        <Heading level={2}>Entity expansion</Heading>
        <StackItem size="fill" />
        <Badge variant="info" label="Under review" />
      </HStack>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text type="label">{EXPANSION.country}</Text>
          </StackItem>
          <Token
            size="sm"
            color="gray"
            label={EXPANSION.requestId}
            style={{flexShrink: 0}}
          />
        </HStack>
        <Text type="supporting" color="secondary">
          {EXPANSION.summary}
        </Text>
      </VStack>
      <div style={styles.noteQuote}>
        <HStack gap={2} vAlign="start">
          <Avatar name="Elena Voss" size="xsmall" />
          <Text type="supporting" color="secondary">
            {EXPANSION.financeNote}
          </Text>
        </HStack>
      </div>
      <VStack gap={2}>
        {EXPANSION.steps.map(step => (
          <div key={step.id} style={styles.timelineRow}>
            <span style={styles.timelineDot}>
              <StatusDot
                variant={
                  step.state === 'done'
                    ? 'success'
                    : step.state === 'current'
                      ? 'warning'
                      : 'neutral'
                }
                label={
                  step.state === 'done'
                    ? 'Done'
                    : step.state === 'current'
                      ? 'In progress'
                      : 'Upcoming'
                }
              />
            </span>
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="label" size="sm">
                {step.label}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {step.detail}
              </Text>
            </VStack>
          </div>
        ))}
      </VStack>
      <HStack gap={2} vAlign="center">
        <Button
          label="Open request"
          size="sm"
          variant="secondary"
          icon={<Icon icon={FileTextIcon} size="sm" />}
          onClick={onOpenRequest}
        />
        <StackItem size="fill" />
        <HStack gap={1} vAlign="center">
          <Icon icon={ClockIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            {EXPANSION.decisionTarget}
          </Text>
        </HStack>
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const ENTITY_FILTER_LABEL: Record<EntityFilter, string> = {
  all: 'All entities',
  us: 'Kestrel Labs, Inc. (US)',
  pt: 'Kestrel Portugal, Lda.',
  eor: 'EOR — Anchorpoint',
};

export default function FinGlobalPayrollTemplate() {
  const toast = useToast();

  // Entity-card selection and the SegmentedControl share one filter value;
  // clicking a selected card toggles back to "All entities".
  const [filter, setFilter] = useState<EntityFilter>('all');
  const [filingStatuses, setFilingStatuses] = useState<
    Record<string, FilingStatus>
  >({});

  // Responsive contract: <=1180px inlines the end-panel widgets; <=860px
  // drops the Type/Verified columns and stacks the entity cards.
  const isPanelInline = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const selectEntity = (id: EntityId) => {
    setFilter(prev => (prev === id ? 'all' : id));
  };

  const startPrep = (id: string) => {
    setFilingStatuses(prev => ({...prev, [id]: 'in-prep'}));
    toast({
      body: 'DRI prep started — June remuneration data pulled from the Jul run',
      uniqueID: 'global-payroll-filing',
    });
  };

  const checkRegistrationStatus = () => {
    toast({
      body: 'CDLE portal: application received Jun 26 — account number expected by Jul 9',
      uniqueID: 'global-payroll-registration',
    });
  };

  const openExpansionRequest = () => {
    toast({
      body: `${EXPANSION.requestId} opened — legal review in progress since Jul 2`,
      uniqueID: 'global-payroll-expansion',
    });
  };

  const exportSummary = () => {
    toast({
      body: 'entity-summary-2026-07.csv (3 entities, 6 filings) saved to Downloads',
      uniqueID: 'global-payroll-export',
    });
  };

  const requestEntity = () => {
    toast({
      body: 'New entity request drafted — routes to Finance & Legal for review',
      uniqueID: 'global-payroll-request',
    });
  };

  // ----- derived state (no effects — everything derives during render) -----
  const visibleRows = useMemo(
    () =>
      filter === 'all'
        ? COMPLIANCE_ROWS
        : COMPLIANCE_ROWS.filter(row => row.entityId === filter),
    [filter],
  );
  const pendingCount = visibleRows.filter(
    row => row.status === 'pending',
  ).length;
  // 19 static rows — cheap enough to rebuild per render, no memo needed.
  const columns = buildComplianceColumns(isCompact, checkRegistrationStatus);

  // ----- header: title + cycle roll-up + actions -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={LandmarkIcon} size="md" color="secondary" />
          <Heading level={1}>Global Payroll & Entities</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Token size="sm" color="gray" label="3 entities" />
          <Token
            size="sm"
            color="gray"
            label={`${TOTAL_HEADCOUNT} people`}
            icon={<Icon icon={UsersIcon} size="xsm" color="inherit" />}
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Jul cycle gross {usd(CYCLE_GROSS_USD_CENTS)} (USD equiv)
          </Text>
        </HStack>
        <StackItem size="fill" />
        <HStack gap={1} vAlign="center">
          <Icon icon={ClockIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            As of {AS_OF}
          </Text>
        </HStack>
        <Button
          label="Export summary"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          onClick={exportSummary}
        />
        <Button
          label="Request entity"
          variant="primary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          onClick={requestEntity}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- entity cards -----
  const entitySection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={Building2Icon} size="sm" color="secondary" />
        <Heading level={2}>Entities</Heading>
        <Text type="supporting" color="secondary">
          Select an entity to filter the compliance register
        </Text>
      </HStack>
      <div style={styles.entityGrid}>
        {ENTITIES.map(entity => (
          <EntityCard
            key={entity.id}
            entity={entity}
            isSelected={filter === entity.id}
            onSelect={selectEntity}
          />
        ))}
      </div>
    </VStack>
  );

  // ----- filing-deadline strip -----
  const filingSection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
        <Heading level={2}>Filing deadlines</Heading>
        <Token
          size="sm"
          color="red"
          icon={<Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />}
          label="1 due within 7 days"
        />
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          Next 30 days + annual look-ahead · scrolls sideways
        </Text>
      </HStack>
      <div style={styles.deadlineStrip}>
        {FILINGS.map(filing => (
          <FilingTile
            key={filing.id}
            filing={filing}
            status={filingStatuses[filing.id] ?? filing.status}
            onStartPrep={startPrep}
          />
        ))}
      </div>
    </VStack>
  );

  // ----- compliance register -----
  const complianceSection = (
    <div style={styles.complianceSection}>
      <div style={styles.complianceToolbar}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <Heading level={2}>Compliance</Heading>
          <Text type="supporting" color="secondary" maxLines={1}>
            {ENTITY_FILTER_LABEL[filter]}
          </Text>
        </HStack>
        {pendingCount > 0 ? (
          <Badge variant="warning" label={`${pendingCount} pending`} />
        ) : (
          <Badge variant="success" label="All active" />
        )}
        <StackItem size="fill" />
        <SegmentedControl
          label="Compliance entity filter"
          value={filter}
          onChange={value => setFilter(value as EntityFilter)}
          size="sm">
          <SegmentedControlItem label="All" value="all" />
          <SegmentedControlItem label="US" value="us" />
          <SegmentedControlItem label="Portugal" value="pt" />
          <SegmentedControlItem label="EOR" value="eor" />
        </SegmentedControl>
      </div>
      <div style={styles.complianceTableWrap}>
        <Table<ComplianceRow>
          data={visibleRows}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      </div>
    </div>
  );

  // ----- end-panel widgets (inline below the fold at <=1180px) -----
  const widgets = (
    <>
      <FxExposureCard />
      <ExpansionCard onOpenRequest={openExpansionRequest} />
    </>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div style={styles.contentScroll}>
                {entitySection}
                {filingSection}
                {complianceSection}
                {isPanelInline ? (
                  <>
                    <Divider />
                    <div style={styles.inlineWidgetGrid}>{widgets}</div>
                  </>
                ) : null}
                <HStack gap={1} vAlign="center">
                  <Icon icon={CircleDollarSignIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    Entity totals reconcile with the Jul 15 pay register:{' '}
                    {usd(52_118_000)} + {eur(5_840_000)} (≈ {usd(6_307_200)}) +{' '}
                    {usd(2_822_800)} = {usd(CYCLE_GROSS_USD_CENTS)}.
                  </Text>
                </HStack>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelInline ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Treasury and expansion">
              <div style={styles.panelFill}>
                <div style={styles.panelScroll}>{widgets}</div>
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}













