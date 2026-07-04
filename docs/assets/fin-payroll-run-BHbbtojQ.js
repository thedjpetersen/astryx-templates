var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs (140-person) Jul 15
 *   2026 semi-monthly pay run frozen at Fri Jul 10, 2026 09:00 PT. Integer
 *   cents that reconcile across every panel (gross $612,480.00 − pre-tax
 *   $54,610.00 − employee taxes $139,390.00 = net $418,480.00; employer
 *   taxes $52,061.00; debit $664,541.00), 15 highlighted register rows
 *   whose per-row gross − pre-tax − taxes = net exactly, 3 anomalies, one
 *   off-cycle signing bonus. Fixed ISO timestamps; no clocks, randomness,
 *   or locale money APIs — the countdown is a fixed string.
 * @output Payroll Run Review — the Finance-pillar pay-run console for run
 *   REG-2026-07-15: a run-status stepper (Drafted → In review → Approvals
 *   → Submitted, currently In review with a submit-by countdown chip),
 *   four reconciling summary cards, a sortable pay-register Table
 *   (employee, gross, pre-tax, taxes, net — right-aligned tabular
 *   numerics) with filter/search toolbar and run-totals strip, an
 *   off-cycle payments section, a review-queue panel (3 anomalies with
 *   working resolve actions: expected 62% promo increase, negative-PTO
 *   deduction, blocking missing timesheet; pre-flight checks; dual
 *   approvers — Elena Voss approved, Dana Whitfield pending), and a pinned
 *   approve-and-submit bar gated on the blocker, confirming via
 *   AlertDialog before the run advances to Submitted.
 * @position Page template; emitted by \`astryx template fin-payroll-run\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | content (stepper strip, summary cards, register toolbar +
 *   Table scrolling, off-cycle section — one vertical scroller)
 *   | end panel 340 (anomalies, pre-flight checks, approvals — scrolls)
 *   | footer approve-and-submit bar (pinned).
 * Container policy: app-shell finance-console archetype — frame rows and
 *   panels only; no Cards. Summary tiles, stepper nodes, anomaly rows,
 *   check rows, and off-cycle rows are styled divs inside frame regions.
 * Color policy: token-pure everywhere; the only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens (the
 *   demo does not inject \`--color-data-categorical-*\`) used for
 *   department dots and anomaly severity accents, plus \`light-dark()\`
 *   tint pairs on the stepper "current" halo and the deadline chip.
 *
 * Responsive contract:
 * - > 1180px: content + 340px review-queue end panel + pinned footer.
 * - <= 1180px: the end panel is dropped; the review queue renders inline
 *   between the summary cards and the register.
 * - <= 860px: summary cards wrap 2-up; the register drops the Pre-tax
 *   column (still reachable via the totals strip); the stepper hides step
 *   captions; header/footer rows wrap instead of clipping; the register
 *   scrolls horizontally below its column floor rather than crushing.
 * - Content and end panel scroll independently (\`minHeight: 0\` down every
 *   flex chain); the header, footer bar, and register toolbar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  AlertTriangleIcon,
  BellIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  InfoIcon,
  LandmarkIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  TimerIcon,
  TrendingUpIcon,
  UsersIcon,
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    // Clearance equal to the pinned approve-and-submit bar (~100px when its
    // rows wrap) so the last register row scrolls fully clear of it.
    paddingBottom: 'calc(var(--spacing-4) + 100px)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {
    flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)',
    // Same footer-bar clearance as contentScroll — keeps the last pre-flight
    // check and approver rows visible at full scroll.
    paddingBottom: 'calc(var(--spacing-4) + 100px)',
  },
  // Stepper ----------------------------------------------------------------
  stepperStrip: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  stepNode: {display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', minWidth: 0},
  stepDisc: {
    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontVariantNumeric: 'tabular-nums', fontSize: 12, fontWeight: 600,
  },
  stepDiscDone: {backgroundColor: 'var(--color-accent)', color: 'var(--color-on-accent)'},
  stepDiscCurrent: {
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    // Intentional literal: a soft accent halo so the live step reads at a
    // glance in both schemes.
    backgroundColor: 'light-dark(rgba(1,113,227,0.08), rgba(76,158,255,0.16))',
  },
  stepDiscUpcoming: {border: '2px solid var(--color-border)', color: 'var(--color-text-secondary)'},
  stepConnector: {
    flex: '1 1 24px', height: 2, marginTop: 12, borderRadius: 1, minWidth: 16,
    backgroundColor: 'var(--color-border)',
  },
  stepConnectorDone: {backgroundColor: 'var(--color-accent)'},
  // Summary cards ----------------------------------------------------------
  cardRow: {display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', flexShrink: 0},
  summaryCard: {
    flex: '1 1 240px', minWidth: 220, padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)',
  },
  summaryValue: {
    fontSize: 24, lineHeight: 1.2, fontWeight: 650,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  // Register ---------------------------------------------------------------
  registerSection: {
    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  registerToolbar: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  registerTableWrap: {overflowX: 'auto', paddingInline: 'var(--spacing-2)'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  totalsStrip: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  totalFigure: {display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0},
  deptDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  // Anomalies / checks / approvals ------------------------------------------
  anomalyRow: {
    display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  anomalyRowResolved: {opacity: 0.72},
  severityGlyph: {display: 'inline-flex', flexShrink: 0, marginTop: 1},
  checkRow: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start'},
  // Off-cycle rows + pinned footer bar ---------------------------------------
  offCycleRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  footerBar: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-4)', width: '100%',
  },
  approverCell: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', minWidth: 0},
};

// The sortable-header button is a left-packed flex row, so the 'Gross' and
// 'Net pay' labels of the end-aligned numeric columns stop short of their
// right-aligned data edges (non-sortable 'Pre-tax'/'Taxes' sit flush). The
// Table exposes no header-justify hook, so a scoped rule pushes the
// label + sort-icon cluster to the column's end edge.
const REGISTER_SORT_HEADER_CSS = \`
  .fin-payroll-register th[data-column-key='gross'] > button,
  .fin-payroll-register th[data-column-key='net'] > button {
    justify-content: flex-end;
  }
\`;

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const CAT_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// ---------------------------------------------------------------------------
// MONEY — integer cents everywhere; one pure formatter, no locale APIs.
// ---------------------------------------------------------------------------

function usd(cents: number | null): string {
  if (cents === null) {
    return '—';
  }
  const sign = cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  const grouped = String(Math.floor(abs / 100)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`\${sign}$\${grouped}.\${String(abs % 100).padStart(2, '0')}\`;
}

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140 people; Engineering 52, Design 18, GTM 34,
// Ops 16, Finance 8, People 12). Signed-in approver: Dana Whitfield.
// Review instant frozen at Fri Jul 10, 2026 09:00 PT. Run totals reconcile:
// gross 612,480.00 − pre-tax 54,610.00 − employee taxes 139,390.00
// = net 418,480.00; employer taxes 52,061.00; debit = gross + employer
// taxes = 664,541.00. Prior (Jun 30) gross 598,125.00 → +2.4%.
// ---------------------------------------------------------------------------

const RUN = {
  id: 'REG-2026-07-15',
  label: 'Jul 15 semi-monthly',
  period: 'Jul 1 – Jul 15, 2026',
  payDate: 'Wed, Jul 15',
  debitDate: 'Mon, Jul 13',
  submitBy: 'Jul 13, 2:00 PM PT',
  countdown: '3d 5h',
  draftedAt: '2026-07-08T13:00:00Z', // Jul 8, 6:00 AM PT (auto-draft)
  bankAccount: 'Operating ••4821',
  bankAvailableCents: 70_241_000,
  employees: 140,
  grossCents: 61_248_000,
  preTaxCents: 5_461_000,
  employeeTaxCents: 13_939_000,
  netCents: 41_848_000,
  employerTaxCents: 5_206_100,
  totalDebitCents: 66_454_100,
  priorGrossCents: 59_812_500,
  grossDeltaLabel: '+2.4% vs Jun 30 run',
} as const;

const SUBMITTED_AT = '2026-07-10T16:14:00Z'; // Jul 10, 9:14 AM PT
const ELENA_APPROVED_AT = '2026-07-09T23:32:00Z'; // Jul 9, 4:32 PM PT

type FlagKind = 'promo' | 'pto' | 'timesheet';
type CheckKind = 'first' | 'prorated';

// The Table generic requires rows assignable to Record<string, unknown>.
interface RegisterRow extends Record<string, unknown> {
  id: string;
  name: string;
  role: string;
  dept: 'Engineering' | 'Design' | 'GTM' | 'Ops' | 'Finance' | 'People';
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
  payType: 'Salaried' | 'Hourly';
  grossCents: number | null;
  preTaxCents: number | null;
  taxCents: number | null;
  netCents: number | null;
  flag?: FlagKind;
  firstCheck?: CheckKind;
}

const DEPT_COLOR: Record<RegisterRow['dept'], string> = {
  Engineering: CAT_COLOR.blue,
  Design: CAT_COLOR.purple,
  GTM: CAT_COLOR.orange,
  Ops: CAT_COLOR.teal,
  Finance: CAT_COLOR.green,
  People: CAT_COLOR.red,
};

// Compact fixture rows (tuple pattern): [id, name, role, dept, office,
// payType, gross, preTax, taxes, net, flag?, firstCheck?]. Every row's
// gross − preTax − taxes equals net exactly (integer cents).
type RowSpec = [
  string,
  string,
  string,
  RegisterRow['dept'],
  RegisterRow['office'],
  RegisterRow['payType'],
  number | null,
  number | null,
  number | null,
  number | null,
  FlagKind?,
  CheckKind?,
];

const ROW_SPECS: RowSpec[] = [
  ['e-priya', 'Priya Raman', 'VP Engineering', 'Engineering', 'SF HQ', 'Salaried',
    1_300_000, 156_000, 391_900, 752_100],
  ['e-marcus', 'Marcus Webb', 'Platform lead', 'Engineering', 'SF HQ', 'Salaried',
    937_500, 112_500, 268_100, 556_900],
  ['e-sofia', 'Sofia Ortiz', 'Design lead', 'Design', 'SF HQ', 'Salaried',
    875_000, 96_250, 246_650, 532_100],
  ['e-elena', 'Elena Voss', 'Finance lead', 'Finance', 'Remote-US', 'Salaried',
    825_000, 90_750, 230_150, 504_100],
  ['e-grace', 'Grace Liu', 'Staff engineer', 'Engineering', 'Remote-US', 'Salaried',
    812_500, 81_250, 229_650, 501_600],
  // Anomaly 1 — promotion: Jun 30 gross 4,750.00 × 1.62 = 7,695.00 (+62%).
  ['e-nadia', 'Nadia Kerr', 'Staff engineer', 'Engineering', 'SF HQ', 'Salaried',
    769_500, 76_950, 225_750, 466_800, 'promo'],
  ['e-jonah', 'Jonah Fields', 'GTM lead', 'GTM', 'SF HQ', 'Salaried',
    725_000, 72_500, 198_800, 453_700],
  ['e-dana', 'Dana Whitfield', 'People Ops', 'People', 'SF HQ', 'Salaried',
    687_500, 68_750, 185_750, 433_000],
  ['e-tom', 'Tom Okonkwo', 'IT admin', 'Ops', 'SF HQ', 'Salaried',
    650_000, 65_000, 174_200, 410_800],
  // First checks — the two in-flight hires; benefits start Aug 1, so no
  // pre-tax deductions on these checks.
  ['e-ava', 'Ava Lindqvist', 'Product designer', 'Design', 'SF HQ', 'Salaried',
    625_000, 0, 174_250, 450_750, undefined, 'first'],
  ['e-hannah', 'Hannah Cole', 'Payroll analyst', 'Finance', 'Remote-US', 'Salaried',
    587_500, 58_750, 158_550, 370_200],
  ['e-mateo', 'Mateo Silva', 'Account executive', 'GTM', 'Lisbon', 'Salaried',
    562_500, 56_250, 148_650, 357_600],
  // Ken starts Mon Jul 6 → 8 of 11 working days: 7,000.00 × 8/11 = 5,090.91.
  ['e-ken', 'Ken Tanaka', 'Platform engineer', 'Engineering', 'Remote-US', 'Salaried',
    509_091, 0, 147_791, 361_300, undefined, 'prorated'],
  // Anomaly 2 — PTO overdraw: base 5,400.00 − 486.00 (−12.0 hrs) = 4,914.00.
  ['e-owen', 'Owen Marsh', 'SDR manager', 'GTM', 'Remote-US', 'Salaried',
    491_400, 24_570, 125_430, 341_400, 'pto'],
  // Anomaly 3 — hourly, no approved timesheet for Jul 6–12; blocked.
  ['e-rosa', 'Rosa Duarte', 'Facilities coordinator', 'Ops', 'Lisbon', 'Hourly',
    null, null, null, null, 'timesheet'],
];

const REGISTER_ROWS: RegisterRow[] = ROW_SPECS.map(
  ([id, name, role, dept, office, payType, grossCents, preTaxCents, taxCents, netCents, flag, firstCheck]) => ({
    id, name, role, dept, office, payType,
    grossCents, preTaxCents, taxCents, netCents, flag, firstCheck,
  }),
);

// ---------------------------------------------------------------------------
// ANOMALIES — three flagged rows; only the missing timesheet blocks
// submission. Resolution state lives in the page component.
// ---------------------------------------------------------------------------

type AnomalyId = 'a-promo' | 'a-pto' | 'a-timesheet';
type Severity = 'info' | 'warning' | 'error';

interface Anomaly {
  id: AnomalyId;
  severity: Severity;
  employee: string;
  rowId: string;
  title: string;
  detail: string;
  isBlocking: boolean;
}

const ANOMALIES: Anomaly[] = [
  {
    id: 'a-promo',
    severity: 'info',
    employee: 'Nadia Kerr',
    rowId: 'e-nadia',
    title: 'Gross +62% vs Jun 30 run',
    detail:
      '$4,750.00 → $7,695.00. Promotion to Staff engineer effective Jul 1 — comp change CC-2041, approved by Priya Raman.',
    isBlocking: false,
  },
  {
    id: 'a-pto',
    severity: 'warning',
    employee: 'Owen Marsh',
    rowId: 'e-owen',
    title: 'Negative PTO balance (−12.0 hrs)',
    detail:
      'Policy deducts the $486.00 overdraw from this check: base $5,400.00 → $4,914.00 gross.',
    isBlocking: false,
  },
  {
    id: 'a-timesheet',
    severity: 'error',
    employee: 'Rosa Duarte',
    rowId: 'e-rosa',
    title: 'Missing timesheet — payment blocked',
    detail:
      'Hourly ($31.50/hr, Lisbon). No approved timesheet for Jul 6–12; her payment and run submission are blocked until resolved.',
    isBlocking: true,
  },
];

type SeverityMeta = {icon: typeof InfoIcon; color: string; label: string};
const SEVERITY_META: Record<Severity, SeverityMeta> = {
  info: {icon: InfoIcon, color: CAT_COLOR.blue, label: 'Info'},
  warning: {icon: AlertTriangleIcon, color: CAT_COLOR.orange, label: 'Warning'},
  error: {icon: AlertTriangleIcon, color: CAT_COLOR.red, label: 'Blocking'},
};

// ---------------------------------------------------------------------------
// OFF-CYCLE — one seeded row; moving Rosa off-cycle appends a second. The
// signing-bonus math is exact: 5,000.00 − 1,542.50 = 3,457.50 net;
// employer taxes 382.50 → 5,382.50 debit.
// ---------------------------------------------------------------------------

interface OffCyclePayment {
  id: string;
  payee: string;
  reason: string;
  paysOn: string;
  grossCents: number | null;
  taxCents: number | null;
  netCents: number | null;
  note?: string;
}

const OFF_CYCLE_SEED: OffCyclePayment[] = [
  {
    id: 'OC-2026-0712',
    payee: 'Ken Tanaka',
    reason: 'Signing bonus — offer OL-118',
    paysOn: 'Jul 13',
    grossCents: 500_000,
    taxCents: 154_250,
    netCents: 345_750,
    note: 'Supplemental rate · debits $5,382.50 with employer taxes',
  },
];

const ROSA_OFF_CYCLE: OffCyclePayment = {
  id: 'OC-2026-0713',
  payee: 'Rosa Duarte',
  reason: 'Jul 1–15 hours — pending timesheet approval',
  paysOn: 'Jul 17',
  grossCents: null,
  taxCents: null,
  netCents: null,
  note: 'Amount calculates when the Jul 6–12 timesheet is approved',
};

// ---- PRE-FLIGHT CHECKS + APPROVERS ----------------------------------------

interface PreflightCheck {
  id: string;
  label: string;
  detail: string;
}

const PREFLIGHT_PASSED: PreflightCheck[] = [
  {
    id: 'c-funds',
    label: 'Bank funds verified',
    detail: \`$702,410.00 available in \${RUN.bankAccount} — covers the $664,541.00 debit\`,
  },
  {
    id: 'c-tax',
    label: 'Tax registrations current',
    detail: '6 jurisdictions · CA, WA, NY, MA, TX, Portugal (EOR)',
  },
  {
    id: 'c-dd',
    label: 'First-check direct deposits verified',
    detail: 'Ava Lindqvist and Ken Tanaka — penny-test cleared Jul 8',
  },
  {
    id: 'c-gl',
    label: 'GL mapping synced',
    detail: 'Department mapping pushed to the ledger Jul 8, 6:04 AM PT',
  },
];

const APPROVERS = [
  {name: 'Elena Voss', role: 'Finance lead', isYou: false},
  {name: 'Dana Whitfield', role: 'People Ops', isYou: true},
] as const;

type RunStage = 'review' | 'submitted';

interface StepDef {
  id: string;
  label: string;
  caption: (stage: RunStage, approvals: number) => string;
}

const STEPS: StepDef[] = [
  {id: 'draft', label: 'Drafted', caption: () => 'Auto-drafted Jul 8, 6:00 AM PT'},
  {
    id: 'review',
    label: 'In review',
    caption: stage =>
      stage === 'review' ? '140 employees · 3 flagged' : 'Completed Jul 10',
  },
  {
    id: 'approve',
    label: 'Approvals',
    caption: (stage, approvals) =>
      stage === 'submitted' ? '2 of 2 · Jul 10, 9:14 AM PT' : \`\${approvals} of 2 approvers\`,
  },
  {
    id: 'submit',
    label: 'Submitted',
    caption: stage =>
      stage === 'submitted' ? 'Jul 10, 9:14 AM PT' : \`Submit by \${RUN.submitBy}\`,
  },
];

function stepStatus(index: number, stage: RunStage): 'done' | 'current' | 'upcoming' {
  if (stage === 'submitted') {
    return 'done';
  }
  return index === 0 ? 'done' : index === 1 ? 'current' : 'upcoming';
}

// ---------------------------------------------------------------------------
// STEPPER — Drafted → In review → Approvals → Submitted. Done discs are
// accent-filled with a check; the live step carries an accent halo.
// ---------------------------------------------------------------------------

function RunStepper({
  stage,
  approvals,
  hideCaptions,
}: {
  stage: RunStage;
  approvals: number;
  hideCaptions: boolean;
}) {
  return (
    <div style={styles.stepperStrip} role="list" aria-label="Run status">
      {STEPS.map((step, index) => {
        const status = stepStatus(index, stage);
        const discStyle = {
          ...styles.stepDisc,
          ...(status === 'done'
            ? styles.stepDiscDone
            : status === 'current'
              ? styles.stepDiscCurrent
              : styles.stepDiscUpcoming),
        };
        const isConnectorDone = status === 'done';
        return (
          <div
            key={step.id}
            role="listitem"
            aria-current={status === 'current' ? 'step' : undefined}
            style={{
              ...styles.stepNode,
              flex: index < STEPS.length - 1 ? '1 1 auto' : '0 1 auto',
            }}>
            <span style={discStyle} aria-hidden>
              {status === 'done' ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : (
                index + 1
              )}
            </span>
            <VStack gap={0} style={{minWidth: 0}}>
              <Text
                type="label"
                size="sm"
                color={status === 'upcoming' ? 'secondary' : undefined}>
                {step.label}
              </Text>
              {!hideCaptions && (
                <Text type="supporting" color="secondary" maxLines={2}>
                  {step.caption(stage, approvals)}
                </Text>
              )}
            </VStack>
            {index < STEPS.length - 1 && (
              <span
                aria-hidden
                style={
                  isConnectorDone
                    ? {...styles.stepConnector, ...styles.stepConnectorDone}
                    : styles.stepConnector
                }
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY CARDS — four figures that repeat (and reconcile) elsewhere:
// gross/net/taxes in the totals strip, the employee split in the queue.
// ---------------------------------------------------------------------------

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: typeof LandmarkIcon;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div style={styles.summaryCard}>
      <HStack gap={2} vAlign="center">
        <Icon icon={icon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary">
          {label}
        </Text>
      </HStack>
      <span style={styles.summaryValue}>{value}</span>
      <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
        {sub}
      </Text>
    </div>
  );
}

function SummaryCards({rosaMoved}: {rosaMoved: boolean}) {
  return (
    <div style={styles.cardRow}>
      <SummaryCard
        icon={TrendingUpIcon}
        label="Gross pay"
        value={usd(RUN.grossCents)}
        sub={RUN.grossDeltaLabel}
      />
      <SummaryCard
        icon={LandmarkIcon}
        label="Net pay"
        value={usd(RUN.netCents)}
        sub={\`Taxes \${usd(RUN.employeeTaxCents)} · Pre-tax \${usd(RUN.preTaxCents)}\`}
      />
      <SummaryCard
        icon={ShieldCheckIcon}
        label="Employer taxes"
        value={usd(RUN.employerTaxCents)}
        sub={\`Total debit \${usd(RUN.totalDebitCents)}\`}
      />
      <SummaryCard
        icon={UsersIcon}
        label="Employees"
        value="140"
        sub={
          rosaMoved
            ? '139 payable · 1 moved off-cycle · 2 first checks'
            : '139 payable · 1 blocked · 2 first checks'
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAY REGISTER — cells and columns. Fixed-width numeric columns use
// pixel() so the header carries both width and minWidth (Table cells have
// max-width: 0); all money is right-aligned tabular numerals.
// ---------------------------------------------------------------------------

function rowChip(
  row: RegisterRow,
  owenWaived: boolean,
  rosaMoved: boolean,
): {label: string; color: 'blue' | 'orange' | 'red' | 'green' | 'gray' | 'teal'} | null {
  if (row.flag === 'promo') {
    return {label: '+62% · expected', color: 'blue'};
  }
  if (row.flag === 'pto') {
    return owenWaived
      ? {label: 'PTO waived · repays Jul 31', color: 'green'}
      : {label: 'PTO −12.0 hr', color: 'orange'};
  }
  if (row.flag === 'timesheet') {
    return rosaMoved
      ? {label: 'Moved to off-cycle', color: 'gray'}
      : {label: 'Timesheet missing', color: 'red'};
  }
  if (row.firstCheck === 'first') {
    return {label: 'First check', color: 'teal'};
  }
  if (row.firstCheck === 'prorated') {
    return {label: 'Prorated · started Jul 6', color: 'teal'};
  }
  return null;
}

function EmployeeCell({
  row,
  owenWaived,
  rosaMoved,
}: {
  row: RegisterRow;
  owenWaived: boolean;
  rosaMoved: boolean;
}) {
  const chip = rowChip(row, owenWaived, rosaMoved);
  return (
    <HStack gap={2} vAlign="center">
      <Avatar name={row.name} size="xsmall" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="label" maxLines={1}>
              {row.name}
            </Text>
            {chip !== null && (
              <Token size="sm" color={chip.color} label={chip.label} />
            )}
          </HStack>
          <HStack gap={1} vAlign="center">
            <span
              style={{...styles.deptDot, backgroundColor: DEPT_COLOR[row.dept]}}
              aria-hidden
            />
            <Text type="supporting" color="secondary" maxLines={1}>
              {row.dept} · {row.office} · {row.payType}
            </Text>
          </HStack>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function MoneyCell({
  cents,
  isEmphasized,
}: {
  cents: number | null;
  isEmphasized?: boolean;
}) {
  return (
    <Text
      type={isEmphasized ? 'label' : 'body'}
      color={cents === null ? 'secondary' : undefined}
      hasTabularNumbers
      style={styles.numericCell}>
      {usd(cents)}
    </Text>
  );
}

function buildColumns(
  isCompact: boolean,
  owenWaived: boolean,
  rosaMoved: boolean,
): TableColumn<RegisterRow>[] {
  const columns: TableColumn<RegisterRow>[] = [
    {
      key: 'name',
      header: 'Employee',
      width: proportional(2, {minWidth: 220}),
      sortable: true,
      renderCell: (row: RegisterRow) => (
        <EmployeeCell row={row} owenWaived={owenWaived} rosaMoved={rosaMoved} />
      ),
    },
    {
      key: 'gross',
      header: 'Gross',
      align: 'end',
      width: pixel(104),
      sortable: {sortKey: 'grossCents'},
      renderCell: (row: RegisterRow) => <MoneyCell cents={row.grossCents} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'pretax',
      header: 'Pre-tax',
      align: 'end',
      width: pixel(96),
      renderCell: (row: RegisterRow) => <MoneyCell cents={row.preTaxCents} />,
    });
  }
  columns.push(
    {
      key: 'taxes',
      header: 'Taxes',
      align: 'end',
      width: pixel(96),
      renderCell: (row: RegisterRow) => <MoneyCell cents={row.taxCents} />,
    },
    {
      key: 'net',
      header: 'Net pay',
      align: 'end',
      width: pixel(112),
      sortable: {sortKey: 'netCents'},
      renderCell: (row: RegisterRow) => (
        <MoneyCell cents={row.netCents} isEmphasized />
      ),
    },
  );
  return columns;
}

function FigureCell({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.totalFigure}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <Text type="label" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
        {value}
      </Text>
    </div>
  );
}

function TotalFigure({label, cents}: {label: string; cents: number}) {
  return <FigureCell label={label} value={usd(cents)} />;
}

// ---------------------------------------------------------------------------
// REVIEW QUEUE — anomalies with working resolve actions, pre-flight
// checks, and the dual-approver ledger. Renders in the 340px end panel
// (>1180px) or inline above the register (<=1180px).
// ---------------------------------------------------------------------------

interface AnomalyActions {
  onConfirmPromo: () => void;
  onKeepDeduction: () => void;
  onWaiveDeduction: () => void;
  onMoveOffCycle: () => void;
  onRemindManager: () => void;
}

interface AnomalyButton {
  label: string;
  variant: 'secondary' | 'ghost';
  icon?: typeof CheckIcon;
  onClick: () => void;
}

/** Per-anomaly resolve actions; the first button is the primary path. */
function anomalyButtons(id: AnomalyId, actions: AnomalyActions): AnomalyButton[] {
  if (id === 'a-promo') {
    return [
      {label: 'Confirm expected', variant: 'secondary', icon: CheckIcon, onClick: actions.onConfirmPromo},
    ];
  }
  if (id === 'a-pto') {
    return [
      {label: 'Keep deduction', variant: 'secondary', icon: CheckIcon, onClick: actions.onKeepDeduction},
      {label: 'Waive — repay Jul 31', variant: 'ghost', icon: CalendarClockIcon, onClick: actions.onWaiveDeduction},
    ];
  }
  return [
    {label: 'Move to off-cycle', variant: 'secondary', icon: CalendarClockIcon, onClick: actions.onMoveOffCycle},
    {label: 'Remind manager', variant: 'ghost', icon: BellIcon, onClick: actions.onRemindManager},
  ];
}

function AnomalyItem({
  anomaly,
  resolution,
  actions,
}: {
  anomaly: Anomaly;
  resolution: string | null;
  actions: AnomalyActions;
}) {
  const meta = SEVERITY_META[anomaly.severity];
  const isResolved = resolution !== null;
  return (
    <div style={isResolved ? {...styles.anomalyRow, ...styles.anomalyRowResolved} : styles.anomalyRow}>
      <span style={{...styles.severityGlyph, color: meta.color}}>
        <Icon icon={isResolved ? CheckCircle2Icon : meta.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={2}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="label" size="sm" maxLines={1}>
                  {anomaly.employee}
                </Text>
              </StackItem>
              {anomaly.isBlocking && !isResolved ? (
                <Badge variant="error" label="Blocking" />
              ) : anomaly.severity === 'info' && !isResolved ? (
                <Token size="sm" color="blue" label="Expected" />
              ) : null}
              {isResolved && <Token size="sm" color="green" label="Reviewed" />}
            </HStack>
            <Text type="label" size="sm" color="secondary">
              {anomaly.title}
            </Text>
          </VStack>
          <Text type="supporting" color="secondary">
            {anomaly.detail}
          </Text>
          {isResolved ? (
            <Text type="supporting" color="secondary">
              {resolution}
            </Text>
          ) : (
            <HStack gap={2} wrap="wrap">
              {anomalyButtons(anomaly.id, actions).map(button => (
                <Button
                  key={button.label}
                  label={button.label}
                  variant={button.variant}
                  size="sm"
                  icon={
                    button.icon !== undefined ? (
                      <Icon icon={button.icon} size="sm" />
                    ) : undefined
                  }
                  onClick={button.onClick}
                />
              ))}
            </HStack>
          )}
        </VStack>
      </StackItem>
    </div>
  );
}

function ApproverRow({
  name,
  role,
  isYou,
  approvedAtIso,
}: {
  name: string;
  role: string;
  isYou: boolean;
  approvedAtIso: string | null;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.approverCell}>
      <Avatar name={name} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1}>
            {name}
            {isYou ? ' (you)' : ''}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {role}
          </Text>
        </VStack>
      </StackItem>
      {approvedAtIso !== null ? (
        <HStack gap={1} vAlign="center">
          <StatusDot variant="success" label={\`\${name} approved\`} />
          <Timestamp value={approvedAtIso} format="date_time" color="secondary" />
        </HStack>
      ) : (
        <HStack gap={1} vAlign="center">
          <StatusDot variant="warning" label={\`\${name} pending\`} />
          <Text type="supporting" color="secondary">
            {isYou ? 'Your approval' : 'Awaiting'}
          </Text>
        </HStack>
      )}
    </HStack>
  );
}

function ReviewQueue({
  resolutions,
  actions,
  danaApproved,
}: {
  resolutions: Record<AnomalyId, string | null>;
  actions: AnomalyActions;
  danaApproved: boolean;
}) {
  const openCount = ANOMALIES.filter(a => resolutions[a.id] === null).length;
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Anomalies</Heading>
          </StackItem>
          {openCount > 0 ? (
            <Badge variant="warning" label={\`\${openCount} open\`} />
          ) : (
            <Badge variant="success" label="All reviewed" />
          )}
        </HStack>
        {ANOMALIES.map(anomaly => (
          <AnomalyItem
            key={anomaly.id}
            anomaly={anomaly}
            resolution={resolutions[anomaly.id]}
            actions={actions}
          />
        ))}
      </VStack>
      <Divider />
      <VStack gap={2}>
        <Heading level={3}>Pre-flight checks</Heading>
        {PREFLIGHT_PASSED.map(check => (
          <div key={check.id} style={styles.checkRow}>
            <span style={{...styles.severityGlyph, color: CAT_COLOR.green}}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <VStack gap={0} style={{minWidth: 0}}>
              <Text type="label" size="sm">
                {check.label}
              </Text>
              <Text type="supporting" color="secondary">
                {check.detail}
              </Text>
            </VStack>
          </div>
        ))}
      </VStack>
      <Divider />
      <VStack gap={2}>
        <Heading level={3}>Approvals</Heading>
        <ApproverRow
          name={APPROVERS[0].name}
          role={APPROVERS[0].role}
          isYou={false}
          approvedAtIso={ELENA_APPROVED_AT}
        />
        <ApproverRow
          name={APPROVERS[1].name}
          role={APPROVERS[1].role}
          isYou
          approvedAtIso={danaApproved ? SUBMITTED_AT : null}
        />
        <Text type="supporting" color="secondary">
          Two approvals are required before this run can be submitted.
        </Text>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// OFF-CYCLE PAYMENTS — flat rows under the register; not part of the
// regular-run totals (each row states its own debit).
// ---------------------------------------------------------------------------

function OffCycleSection({payments}: {payments: OffCyclePayment[]}) {
  return (
    <div style={styles.registerSection}>
      <div style={styles.registerToolbar}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Heading level={3}>Off-cycle payments</Heading>
          <Token size="sm" color="gray" label={String(payments.length)} />
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          Debits separately from the regular run
        </Text>
      </div>
      <VStack gap={0}>
        {payments.map((payment, index) => (
          <VStack gap={0} key={payment.id}>
            {index > 0 && <Divider />}
            <div style={styles.offCycleRow}>
              <Avatar name={payment.payee} size="xsmall" />
              <StackItem size="fill" style={{minWidth: 200}}>
                <VStack gap={0}>
                  <HStack gap={2} vAlign="center">
                    <Text type="label" maxLines={1}>
                      {payment.payee}
                    </Text>
                    <Token size="sm" color="purple" label={payment.id} />
                  </HStack>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {payment.reason}
                    {payment.note !== undefined ? \` · \${payment.note}\` : ''}
                  </Text>
                </VStack>
              </StackItem>
              <HStack gap={4} vAlign="center">
                <FigureCell label="Pays" value={payment.paysOn} />
                <FigureCell label="Gross" value={usd(payment.grossCents)} />
                <FigureCell label="Taxes" value={usd(payment.taxCents)} />
                <FigureCell label="Net" value={usd(payment.netCents)} />
              </HStack>
            </div>
          </VStack>
        ))}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type RegisterFilter = 'all' | 'flagged' | 'first';

export default function FinPayrollRunTemplate() {
  const toast = useToast();

  const [stage, setStage] = useState<RunStage>('review');
  const [filter, setFilter] = useState<RegisterFilter>('all');
  const [query, setQuery] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [resolutions, setResolutions] = useState<Record<AnomalyId, string | null>>({
    'a-promo': null,
    'a-pto': null,
    'a-timesheet': null,
  });
  const [owenWaived, setOwenWaived] = useState(false);
  const [rosaMoved, setRosaMoved] = useState(false);

  // Responsive contract: <=1180px inlines the review queue; <=860px drops
  // the Pre-tax column, wraps the cards 2-up, and hides step captions.
  const isQueueInline = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const resolveAnomaly = (id: AnomalyId, summary: string) => {
    setResolutions(prev => ({...prev, [id]: summary}));
  };

  const anomalyActions: AnomalyActions = {
    onConfirmPromo: () => {
      resolveAnomaly('a-promo', 'Confirmed expected — comp change CC-2041 on file.');
      toast({body: 'Nadia Kerr’s increase confirmed as expected', uniqueID: 'payroll-anomaly'});
    },
    onKeepDeduction: () => {
      resolveAnomaly('a-pto', 'Deduction kept — $486.00 withheld on this check per policy.');
      toast({body: 'PTO overdraw deduction kept for Owen Marsh', uniqueID: 'payroll-anomaly'});
    },
    onWaiveDeduction: () => {
      setOwenWaived(true);
      resolveAnomaly('a-pto', 'Deduction waived — $486.00 will be recovered on the Jul 31 run.');
      toast({body: 'Deduction waived — repayment scheduled for Jul 31', uniqueID: 'payroll-anomaly'});
    },
    onMoveOffCycle: () => {
      setRosaMoved(true);
      resolveAnomaly(
        'a-timesheet',
        'Moved to off-cycle OC-2026-0713 — pays Jul 17 once the timesheet is approved.',
      );
      toast({body: 'Rosa Duarte moved to the Jul 17 off-cycle run', uniqueID: 'payroll-anomaly'});
    },
    onRemindManager: () => {
      toast({
        body: 'Reminder sent to Hugo Mendes (Ops manager, Lisbon)',
        uniqueID: 'payroll-remind',
      });
    },
  };

  // ----- derived state (no effects — everything derives during render) -----
  const isBlockerOpen = resolutions['a-timesheet'] === null;
  const canSubmit = stage === 'review' && !isBlockerOpen;
  const approvals = stage === 'submitted' ? 2 : 1;
  const flaggedCount = REGISTER_ROWS.filter(row => row.flag !== undefined).length;
  const firstCheckCount = REGISTER_ROWS.filter(
    row => row.firstCheck !== undefined,
  ).length;

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return REGISTER_ROWS.filter(row => {
      if (filter === 'flagged' && row.flag === undefined) {
        return false;
      }
      if (filter === 'first' && row.firstCheck === undefined) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return \`\${row.name} \${row.role} \${row.dept} \${row.office}\`
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, query]);

  // Default sort: gross descending (blocked/null rows sink to the bottom).
  const {sortedData, sortConfig} = useTableSortableState<RegisterRow>({
    data: visibleRows,
    defaultSort: [{sortKey: 'grossCents', direction: 'descending'}],
    comparators: {
      grossCents: (a, b) => (a.grossCents ?? -1) - (b.grossCents ?? -1),
      netCents: (a, b) => (a.netCents ?? -1) - (b.netCents ?? -1),
      name: (a, b) => a.name.localeCompare(b.name),
    },
  });
  const sortPlugin = useTableSortable<RegisterRow>(sortConfig);

  const columns = useMemo(
    () => buildColumns(isCompact, owenWaived, rosaMoved),
    [isCompact, owenWaived, rosaMoved],
  );

  const offCyclePayments = rosaMoved
    ? [...OFF_CYCLE_SEED, ROSA_OFF_CYCLE]
    : OFF_CYCLE_SEED;

  const submitRun = () => {
    setStage('submitted');
    setIsConfirmOpen(false);
    toast({
      body: \`Run \${RUN.id} submitted — \${usd(RUN.totalDebitCents)} debits \${RUN.debitDate}\`,
      uniqueID: 'payroll-submit',
    });
  };

  const exportRegister = () => {
    toast({
      body: 'pay-register-2026-07-15.csv (140 rows) saved to Downloads',
      uniqueID: 'payroll-export',
    });
  };

  // ----- header: run identity + deadline chip -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={LandmarkIcon} size="md" color="secondary" />
          <Heading level={1}>Payroll</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Text type="label" color="secondary">
            {RUN.label}
          </Text>
          <Token size="sm" color="gray" label={RUN.id} />
          <Text type="supporting" color="secondary">
            {RUN.period} · pays {RUN.payDate}
          </Text>
        </HStack>
        <StackItem size="fill" />
        {stage === 'review' ? (
          <Token
            color="orange"
            label={\`Submit in \${RUN.countdown} · by \${RUN.submitBy}\`}
            icon={<Icon icon={TimerIcon} size="xsm" color="inherit" />}
          />
        ) : (
          <Token
            color="green"
            label="Submitted · Jul 10, 9:14 AM PT"
            icon={<Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />}
          />
        )}
        <Button
          label="Export register"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          onClick={exportRegister}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- register section: toolbar + table + totals strip -----
  const registerSection = (
    <div style={styles.registerSection}>
      <div style={styles.registerToolbar}>
        <Heading level={2}>Pay register</Heading>
        <SegmentedControl
          label="Register filter"
          value={filter}
          onChange={value => setFilter(value as RegisterFilter)}
          size="sm">
          <SegmentedControlItem label="All" value="all" />
          <SegmentedControlItem label={\`Flagged (\${flaggedCount})\`} value="flagged" />
          <SegmentedControlItem label={\`First checks (\${firstCheckCount})\`} value="first" />
        </SegmentedControl>
        <StackItem size="fill" />
        <TextInput
          label="Search the register"
          isLabelHidden
          size="sm"
          width={isCompact ? 160 : 220}
          placeholder="Search name or department…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={setQuery}
          hasClear
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {filter === 'all' && query.trim().length === 0
            ? 'Showing 15 of 140'
            : \`\${sortedData.length} \${sortedData.length === 1 ? 'row' : 'rows'}\`}
        </Text>
      </div>
      <div style={styles.registerTableWrap} className="fin-payroll-register">
        <style>{REGISTER_SORT_HEADER_CSS}</style>
        <Table<RegisterRow>
          data={sortedData}
          columns={columns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
          plugins={{sort: sortPlugin}}
          emptyState={
            <div style={{padding: 'var(--spacing-6) var(--spacing-4)'}}>
              <EmptyState
                isCompact
                icon={<Icon icon={SearchIcon} size="lg" />}
                title="No matching employees"
                description="Try a different name, role, or department."
              />
            </div>
          }
        />
      </div>
      {/* Run totals repeat the summary-card figures exactly; the 15 rows
          above are the highlighted subset (flagged, first-check, and
          leadership rows) of the 140-employee register. */}
      <div style={styles.totalsStrip}>
        <VStack gap={0} style={{minWidth: 0}}>
          <Text type="label" size="sm">
            Run totals · 139 payable of 140
          </Text>
          <Text type="supporting" color="secondary">
            Full register in the CSV export
          </Text>
        </VStack>
        <StackItem size="fill" />
        <TotalFigure label="Gross" cents={RUN.grossCents} />
        {!isCompact && <TotalFigure label="Pre-tax" cents={RUN.preTaxCents} />}
        <TotalFigure label="Taxes" cents={RUN.employeeTaxCents} />
        <TotalFigure label="Net pay" cents={RUN.netCents} />
      </div>
    </div>
  );

  // ----- pinned approve-and-submit bar -----
  const footer = (
    <LayoutFooter hasDivider padding={0}>
      <div style={styles.footerBar}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <ApproverRow
            name="Elena Voss"
            role="Finance lead"
            isYou={false}
            approvedAtIso={ELENA_APPROVED_AT}
          />
          <ApproverRow
            name="Dana Whitfield"
            role="People Ops"
            isYou
            approvedAtIso={stage === 'submitted' ? SUBMITTED_AT : null}
          />
        </HStack>
        <StackItem size="fill" style={{minWidth: 160}}>
          <VStack gap={0} hAlign={isCompact ? undefined : 'end'}>
            <Text type="label" size="sm" hasTabularNumbers>
              Debits {usd(RUN.totalDebitCents)} from {RUN.bankAccount}
            </Text>
            <Text type="supporting" color="secondary">
              {stage === 'submitted'
                ? \`Submitted Jul 10, 9:14 AM PT · initiates \${RUN.debitDate}\`
                : isBlockerOpen
                  ? 'Resolve the blocking timesheet anomaly to submit'
                  : \`Initiates \${RUN.debitDate} · submit by \${RUN.submitBy}\`}
            </Text>
          </VStack>
        </StackItem>
        {stage === 'review' && (
          <HStack gap={2} vAlign="center">
            <Button
              label="Request changes"
              variant="ghost"
              size="sm"
              onClick={() =>
                toast({
                  body: 'Change request drafted for Elena Voss',
                  uniqueID: 'payroll-changes',
                })
              }
            />
            <Button
              label="Approve & submit"
              variant="primary"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={!canSubmit}
              tooltip={
                canSubmit
                  ? undefined
                  : 'Blocked — resolve Rosa Duarte’s missing timesheet first'
              }
              onClick={() => setIsConfirmOpen(true)}
            />
          </HStack>
        )}
      </div>
    </LayoutFooter>
  );

  const queue = (
    <ReviewQueue
      resolutions={resolutions}
      actions={anomalyActions}
      danaApproved={stage === 'submitted'}
    />
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
                {stage === 'submitted' && (
                  <Banner
                    status="success"
                    icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
                    title="Run submitted"
                    description={\`139 payments locked. \${usd(RUN.totalDebitCents)} debits \${RUN.bankAccount} on \${RUN.debitDate}; employees are paid \${RUN.payDate}.\`}
                  />
                )}
                <RunStepper
                  stage={stage}
                  approvals={approvals}
                  hideCaptions={isCompact}
                />
                <SummaryCards rosaMoved={rosaMoved} />
                <HStack gap={1} vAlign="center">
                  <Icon icon={ClockIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    Figures frozen at review start — Fri, Jul 10, 9:00 AM PT
                  </Text>
                </HStack>
                {isQueueInline && (
                  <VStack gap={3}>
                    <Divider />
                    {queue}
                    <Divider />
                  </VStack>
                )}
                {registerSection}
                <OffCycleSection payments={offCyclePayments} />
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isQueueInline ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Review queue">
              <div style={styles.panelFill}>
                <div style={styles.panelScroll}>{queue}</div>
              </div>
            </LayoutPanel>
          ) : undefined
        }
        footer={footer}
      />
      <AlertDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Approve and submit this run?"
        description={\`Submits \${RUN.id} for 139 employees. \${usd(RUN.totalDebitCents)} (gross \${usd(RUN.grossCents)} + employer taxes \${usd(RUN.employerTaxCents)}) debits \${RUN.bankAccount} on \${RUN.debitDate}. Payments land \${RUN.payDate}. This can't be undone from the console.\`}
        actionLabel="Approve & submit"
        cancelLabel="Keep reviewing"
        onAction={submitRun}
      />
    </div>
  );
}
`;export{e as default};