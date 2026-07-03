var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Kestrel Labs (140 people; 126 US,
 *   14 Lisbon) payroll tax compliance frozen at Thu Jul 16, 2026 09:00 PT.
 *   Integer cents that reconcile across every panel: the filed Q2 Form 941
 *   line summary (L3 $461,184.00 + L5e $518,240.00 = L12 $979,424.00 =
 *   L13 deposits, balance due $0.00) sums the six semi-monthly federal
 *   deposits listed in the schedule; the CA DE-9 draft ($87,372.00 PIT +
 *   $7,596.00 UI/ETT = $94,968.00) is blocked on the $1,842.00 EDD
 *   discrepancy notice; the June Portugal DMR ($4,588.00 IRS + $12,726.00
 *   Segurança Social = $17,314.00) matches the Jul 20 remittance row.
 *   Fixed ISO timestamps; countdowns are fixed strings — no clocks,
 *   randomness, or locale money APIs.
 * @output Payroll Tax Filings Tracker — the Finance-pillar compliance
 *   console: a quarter SegmentedControl (Q4 2025 / Q1 2026 / Q2 2026,
 *   Q2 active), reconciling summary tiles (quarter liability, filings
 *   progress, next deposit countdown, open notices), a filings Table
 *   (form + agency, jurisdiction chip, period, due date, right-aligned
 *   amount, Filed/Scheduled/Action-needed status pill with one
 *   red-tinted action row), an agency-notice inbox (IRS CP 136
 *   informational + CA EDD discrepancy with amount, respond-by date, and
 *   assigned owner), a deposit schedule (federal semi-weekly EFTPS rows
 *   with a next-deposit countdown and a settled row with acknowledgment
 *   number), a filing-detail end panel showing the filed 941's form-line
 *   summary and confirmation number, and a penalties-avoided stat chip.
 * @position Page template; emitted by \`astryx template fin-tax-filings\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, quarter SegmentedControl, penalties-avoided chip)
 *   | content (summary tiles, filings Table section, two-up deposit
 *   schedule + notice inbox grid — one vertical scroller)
 *   | end panel 340 (filing detail for the active row — scrolls).
 * Container policy: app-shell compliance-console archetype — frame rows
 *   and panels only; no Cards. Summary tiles, deposit rows, notice rows,
 *   and form-line rows are styled divs inside frame regions.
 * Color policy: token-pure everywhere; the only literals are the
 *   \`light-dark()\` fallback pairs on the data-viz categorical tokens (the
 *   demo does not inject \`--color-data-categorical-*\`) used for
 *   jurisdiction dots, plus \`light-dark()\` tint pairs on the
 *   action-needed table row, the discrepancy notice accent, and the
 *   penalties-avoided chip.
 *
 * Responsive contract:
 * - > 1180px: content + 340px filing-detail end panel.
 * - <= 1180px: the end panel is dropped; the filings table stays the
 *   source of truth and each row keeps its status pill and amount.
 * - <= 860px: summary tiles wrap 2-up; the filings table drops the
 *   Jurisdiction column (jurisdiction stays readable in the form cell's
 *   agency line); the deposit/notice grid stacks; the header row wraps
 *   instead of clipping the quarter control or the penalties chip; the
 *   table scrolls horizontally below its column floor. (Period lives in
 *   the detail panel — the column set is sized to fit the demo stage
 *   with the end panel open, so Amount/Status never scroll off-screen.)
 * - Content and end panel scroll independently (\`minHeight: 0\` down every
 *   flex chain); the header and the filings-section toolbar are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BellIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  DownloadIcon,
  FileCheck2Icon,
  FileClockIcon,
  FileWarningIcon,
  InboxIcon,
  InfoIcon,
  LandmarkIcon,
  MailCheckIcon,
  ShieldCheckIcon,
  TimerIcon,
  TriangleAlertIcon,
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
import {
  Table,
  pixel,
  proportional,
} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
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
    flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)',
  },
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  // Header ------------------------------------------------------------------
  penaltyChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap',
    fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
    // Intentional literal: a soft success tint so the compliance streak
    // reads at a glance in both schemes.
    color: 'light-dark(#0B7A20, #4ADE80)',
    backgroundColor: 'light-dark(rgba(11,153,31,0.09), rgba(52,199,89,0.14))',
    border: 'var(--border-width) solid light-dark(rgba(11,153,31,0.28), rgba(52,199,89,0.32))',
  },
  // Summary tiles ------------------------------------------------------------
  tileRow: {display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap', flexShrink: 0},
  summaryTile: {
    flex: '1 1 240px', minWidth: 220, padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)',
  },
  tileValue: {
    fontSize: 22, lineHeight: 1.2, fontWeight: 650,
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  // Filings table section ------------------------------------------------------
  filingsSection: {
    display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  sectionToolbar: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  filingsTableWrap: {overflowX: 'auto', paddingInline: 'var(--spacing-2)'},
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap', textAlign: 'end'},
  jurisdictionChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '2px 9px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  jurisdictionDot: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  formGlyph: {display: 'inline-flex', flexShrink: 0},
  // Two-up deposit schedule + notice inbox grid --------------------------------
  twoUpGrid: {display: 'flex', gap: 'var(--spacing-4)', alignItems: 'stretch', flexShrink: 0},
  twoUpColumn: {
    flex: '1 1 0', minWidth: 0,
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  columnBody: {display: 'flex', flexDirection: 'column'},
  depositRow: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  depositRowNext: {
    // Intentional literal: soft accent tint marks the next deposit due.
    backgroundColor: 'light-dark(rgba(1,113,227,0.05), rgba(76,158,255,0.09))',
  },
  depositRowLast: {borderBottom: 'none'},
  depositGlyph: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  noticeRow: {
    display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  noticeRowLast: {borderBottom: 'none'},
  noticeRowDiscrepancy: {
    // Intentional literal: soft danger tint + edge marks the notice that
    // needs a response before its deadline.
    backgroundColor: 'light-dark(rgba(220,38,38,0.045), rgba(248,113,113,0.08))',
    boxShadow: 'inset 3px 0 0 light-dark(#DC2626, #F87171)',
  },
  noticeRowRead: {opacity: 0.68},
  // Detail panel ----------------------------------------------------------------
  detailStatBlock: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)',
  },
  lineRow: {
    display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-3)',
    padding: '6px 0',
  },
  lineNo: {
    flexShrink: 0, width: 34, fontSize: 11,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)',
  },
  confirmationCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums', fontSize: 12, whiteSpace: 'nowrap',
  },
  blockerBox: {
    display: 'flex', gap: 'var(--spacing-2)', alignItems: 'flex-start',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    // Intentional literal: danger tint pairs with the action-needed row.
    backgroundColor: 'light-dark(rgba(220,38,38,0.06), rgba(248,113,113,0.10))',
    border: 'var(--border-width) solid light-dark(rgba(220,38,38,0.30), rgba(248,113,113,0.34))',
  },
  visuallyHidden: {
    position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden',
    clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard \`light-dark()\` fallback pair.
const CAT_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// Action-needed table row tint (composed into the row plugin).
const ACTION_ROW_TINT = 'light-dark(rgba(220,38,38,0.05), rgba(248,113,113,0.09))';

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
// DATA — Kestrel Labs (140 people; 126 US, 14 Lisbon), EIN 88-2417036.
// Compliance instant frozen at Thu Jul 16, 2026 09:00 PT; every countdown
// is a fixed string derived from that instant. Signed-in owner: Elena Voss
// (Finance lead). Reconciliation spine:
// - Q2 Form 941: L3 461,184.00 + L5e 518,240.00 = L12 979,424.00 = L13
//   deposits (160,982 ×2 + 163,410 ×2 + 164,733 + 165,907), balance 0.00.
// - CA DE-9 draft: PIT 87,372.00 + UI/ETT 7,596.00 = 94,968.00; blocked on
//   the 1,842.00 EDD wage discrepancy (notice n-edd, respond by Jul 24).
// - June Portugal DMR: IRS 4,588.00 + Segurança Social 12,726.00 =
//   17,314.00 — the same figure as the Jul 20 remittance row.
// - Next federal deposit (Jul 15 payday, semi-weekly → Wed Jul 22):
//   166,654.00 = the Jul 15 run's withheld 78,414.00 + FICA 88,240.00.
// ---------------------------------------------------------------------------

const TODAY_LABEL = 'Thu, Jul 16, 2026';
const EIN = 'EIN 88-2417036';

type Jurisdiction = 'federal' | 'california' | 'portugal';

interface JurisdictionMeta {
  label: string;
  dotColor: string;
}

const JURISDICTIONS: Record<Jurisdiction, JurisdictionMeta> = {
  federal: {label: 'Federal', dotColor: CAT_COLOR.blue},
  california: {label: 'California', dotColor: CAT_COLOR.orange},
  portugal: {label: 'Portugal', dotColor: CAT_COLOR.teal},
};

type FilingStatus = 'filed' | 'scheduled' | 'action';

interface FormLine {
  no: string;
  label: string;
  value: string;
  isEmphasized?: boolean;
}

interface FilingBlocker {
  title: string;
  body: string;
  amountCents: number;
  respondBy: string;
  respondCountdown: string;
  noticeId: string;
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface FilingRow extends Record<string, unknown> {
  id: string;
  form: string;
  formTitle: string;
  agency: string;
  jurisdiction: Jurisdiction;
  period: string;
  /** Fixed display string; countdowns are frozen at the review instant. */
  due: string;
  dueNote: string;
  amountCents: number | null;
  status: FilingStatus;
  /** One-line status context shown under the pill in the detail panel. */
  statusNote: string;
  filedAtIso?: string;
  filedBy?: string;
  method?: string;
  confirmation?: string;
  /** Form-line summary rendered in the detail panel (filed + drafts). */
  lines?: FormLine[];
  blocker?: FilingBlocker;
  /** Cross-link chip: an open agency notice references this filing. */
  hasOpenNotice?: boolean;
}

type QuarterId = 'q4-2025' | 'q1-2026' | 'q2-2026';

interface QuarterMeta {
  id: QuarterId;
  label: string;
  rangeLabel: string;
  /** Sum of the quarter's monetary filings — repeats in the first tile. */
  liabilityCents: number;
  defaultActiveId: string;
  filings: FilingRow[];
}

// ---- Q2 2026 (active quarter) ---------------------------------------------

const Q2_FILINGS: FilingRow[] = [
  {
    id: 'f941-q2', form: 'Form 941',
    formTitle: "Employer's Quarterly Federal Tax Return",
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Apr 1 – Jun 30, 2026', due: 'Jul 31, 2026', dueNote: 'Filed 22 days early',
    amountCents: 97_942_400, status: 'filed',
    statusNote: 'E-filed via Modernized e-File; balance due $0.00.',
    filedAtIso: '2026-07-09T16:42:00Z', filedBy: 'Elena Voss',
    method: 'IRS Modernized e-File', confirmation: '941-26Q2-0748215',
    lines: [
      {no: '1', label: 'Employees who received wages', value: '126'},
      {no: '2', label: 'Wages, tips, other compensation', value: usd(342_180_600)},
      {no: '3', label: 'Federal income tax withheld', value: usd(46_118_400)},
      {no: '5e', label: 'Social Security & Medicare taxes', value: usd(51_824_000)},
      {no: '12', label: 'Total taxes after adjustments', value: usd(97_942_400)},
      {no: '13', label: 'Deposits for the quarter', value: usd(97_942_400)},
      {no: '14', label: 'Balance due', value: usd(0), isEmphasized: true},
    ],
  },
  {
    id: 'de9-q2', form: 'CA DE-9 / DE-9C',
    formTitle: 'Quarterly Contribution Return and Report of Wages',
    agency: 'CA EDD', jurisdiction: 'california',
    period: 'Apr 1 – Jun 30, 2026', due: 'Jul 31, 2026', dueNote: 'Due in 15 days',
    amountCents: 9_496_800, status: 'action',
    statusNote:
      'Draft ready; e-file is blocked until the EDD wage discrepancy is resolved.',
    method: 'EDD e-Services',
    lines: [
      {no: 'D', label: 'CA PIT withheld', value: usd(8_737_200)},
      {no: 'C', label: 'UI + ETT employer contributions', value: usd(759_600)},
      {no: '—', label: 'Total contributions due', value: usd(9_496_800), isEmphasized: true},
    ],
    blocker: {
      title: 'EDD wage discrepancy — $1,842.00',
      body: 'Q1 subject wages differ from EDD records by $1,842.00 (UI wage base on 2 corrected checks). Resolve the notice response before filing Q2.',
      amountCents: 184_200,
      respondBy: 'Fri, Jul 24, 2026',
      respondCountdown: 'in 8 days',
      noticeId: 'n-edd',
    },
    hasOpenNotice: true,
  },
  {
    id: 'dmr-jun', form: 'Portugal DMR',
    formTitle: 'Declaração Mensal de Remunerações — June 2026',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    period: 'Jun 1 – Jun 30, 2026', due: 'Jul 10, 2026', dueNote: 'Filed 2 days early',
    amountCents: 1_731_400, status: 'filed',
    statusNote: 'Submitted on Portal das Finanças; remittance debits Jul 20.',
    filedAtIso: '2026-07-08T11:05:00Z', filedBy: 'Elena Voss',
    method: 'Portal das Finanças', confirmation: 'DMR-2026-06-114982',
    lines: [
      {no: 'R', label: 'Remunerations declared (14 employees)', value: usd(5_358_300)},
      {no: 'IRS', label: 'IRS withheld', value: usd(458_800)},
      {no: 'SS', label: 'Segurança Social contributions', value: usd(1_272_600)},
      {no: '—', label: 'Total to remit by Jul 20', value: usd(1_731_400), isEmphasized: true},
    ],
  },
  {
    id: 'w2-prep', form: 'W-2 / W-3 prep',
    formTitle: 'Annual wage statements — tax year 2026',
    agency: 'SSA', jurisdiction: 'federal',
    period: 'Tax year 2026', due: 'Feb 1, 2027', dueNote: 'Mid-year checkpoint',
    amountCents: null, status: 'scheduled',
    statusNote: 'Mid-year reconciliation on track — 126 employees, 0 mismatches.',
    method: 'SSA Business Services Online',
    lines: [
      {no: '—', label: 'SSN verification (SSNVS)', value: '126 / 126 passed'},
      {no: '—', label: 'YTD wage reconciliation variance', value: usd(0)},
      {no: '—', label: 'Next checkpoint', value: 'Oct 15, 2026'},
    ],
  },
  {
    id: 'n1099-prep', form: '1099-NEC prep',
    formTitle: 'Nonemployee compensation — tax year 2026',
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Tax year 2026', due: 'Feb 1, 2027', dueNote: 'Tracking 12 payees',
    amountCents: null, status: 'scheduled',
    statusNote: '12 contractors tracked · W-9 on file for 11 of 12.',
    method: 'IRS FIRE / IRIS',
    lines: [
      {no: '—', label: 'Contractors above $600 YTD', value: '12'},
      {no: '—', label: 'W-9 on file', value: '11 / 12'},
      {no: '—', label: 'Missing W-9', value: 'Meridian QA Services'},
    ],
  },
];

// ---- Q1 2026 (all filed; the EDD notice traces back to this DE-9) ----------

const Q1_FILINGS: FilingRow[] = [
  {
    id: 'f941-q1', form: 'Form 941',
    formTitle: "Employer's Quarterly Federal Tax Return",
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Jan 1 – Mar 31, 2026', due: 'Apr 30, 2026', dueNote: 'Filed 16 days early',
    amountCents: 86_841_000, status: 'filed',
    statusNote: 'E-filed via Modernized e-File; balance due $0.00.',
    filedAtIso: '2026-04-14T15:20:00Z', filedBy: 'Elena Voss',
    method: 'IRS Modernized e-File', confirmation: '941-26Q1-0329846',
    lines: [
      {no: '1', label: 'Employees who received wages', value: '118'},
      {no: '12', label: 'Total taxes after adjustments', value: usd(86_841_000)},
      {no: '13', label: 'Deposits for the quarter', value: usd(86_841_000)},
      {no: '14', label: 'Balance due', value: usd(0), isEmphasized: true},
    ],
  },
  {
    id: 'de9-q1', form: 'CA DE-9 / DE-9C',
    formTitle: 'Quarterly Contribution Return and Report of Wages',
    agency: 'CA EDD', jurisdiction: 'california',
    period: 'Jan 1 – Mar 31, 2026', due: 'Apr 30, 2026', dueNote: 'Filed 9 days early',
    amountCents: 8_914_200, status: 'filed',
    statusNote:
      'Filed Apr 21; the EDD later flagged a $1,842.00 subject-wage discrepancy — see the notice inbox.',
    filedAtIso: '2026-04-21T18:02:00Z', filedBy: 'Elena Voss',
    method: 'EDD e-Services', confirmation: 'E-987211440',
    hasOpenNotice: true,
    lines: [
      {no: 'D', label: 'CA PIT withheld', value: usd(8_211_600)},
      {no: 'C', label: 'UI + ETT employer contributions', value: usd(702_600)},
      {no: '—', label: 'Total contributions paid', value: usd(8_914_200), isEmphasized: true},
    ],
  },
  {
    id: 'dmr-mar', form: 'Portugal DMR',
    formTitle: 'Declaração Mensal de Remunerações — March 2026',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    period: 'Mar 1 – Mar 31, 2026', due: 'Apr 10, 2026', dueNote: 'Filed on time',
    amountCents: 863_000, status: 'filed',
    statusNote: 'Submitted on Portal das Finanças; remitted Apr 20.',
    filedAtIso: '2026-04-08T10:12:00Z', filedBy: 'Elena Voss',
    method: 'Portal das Finanças', confirmation: 'DMR-2026-03-098414',
  },
  {
    id: 'dmr-feb', form: 'Portugal DMR',
    formTitle: 'Declaração Mensal de Remunerações — February 2026',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    period: 'Feb 1 – Feb 28, 2026', due: 'Mar 10, 2026', dueNote: 'Filed on time',
    amountCents: 834_200, status: 'filed',
    statusNote: 'Submitted on Portal das Finanças; remitted Mar 19.',
    filedAtIso: '2026-03-09T09:44:00Z', filedBy: 'Elena Voss',
    method: 'Portal das Finanças', confirmation: 'DMR-2026-02-091257',
  },
  {
    id: 'dmr-jan', form: 'Portugal DMR',
    formTitle: 'Declaração Mensal de Remunerações — January 2026',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    period: 'Jan 1 – Jan 31, 2026', due: 'Feb 10, 2026', dueNote: 'Filed on time',
    amountCents: 834_200, status: 'filed',
    statusNote: 'Submitted on Portal das Finanças; remitted Feb 19.',
    filedAtIso: '2026-02-09T09:31:00Z', filedBy: 'Elena Voss',
    method: 'Portal das Finanças', confirmation: 'DMR-2026-01-084633',
  },
];

// ---- Q4 2025 (closed quarter incl. year-end annuals) ------------------------

const Q4_FILINGS: FilingRow[] = [
  {
    id: 'f941-q4', form: 'Form 941',
    formTitle: "Employer's Quarterly Federal Tax Return",
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Oct 1 – Dec 31, 2025', due: 'Feb 2, 2026', dueNote: 'Filed 7 days early',
    amountCents: 87_214_000, status: 'filed',
    statusNote: 'E-filed via Modernized e-File; balance due $0.00.',
    filedAtIso: '2026-01-26T17:10:00Z', filedBy: 'Elena Voss',
    method: 'IRS Modernized e-File', confirmation: '941-25Q4-0287119',
    lines: [
      {no: '1', label: 'Employees who received wages', value: '114'},
      {no: '12', label: 'Total taxes after adjustments', value: usd(87_214_000)},
      {no: '13', label: 'Deposits for the quarter', value: usd(87_214_000)},
      {no: '14', label: 'Balance due', value: usd(0), isEmphasized: true},
    ],
  },
  {
    id: 'de9-q4', form: 'CA DE-9 / DE-9C',
    formTitle: 'Quarterly Contribution Return and Report of Wages',
    agency: 'CA EDD', jurisdiction: 'california',
    period: 'Oct 1 – Dec 31, 2025', due: 'Feb 2, 2026', dueNote: 'Filed 7 days early',
    amountCents: 9_120_800, status: 'filed',
    statusNote: 'Filed and paid through EDD e-Services.',
    filedAtIso: '2026-01-26T17:31:00Z', filedBy: 'Elena Voss',
    method: 'EDD e-Services', confirmation: 'E-961408233',
  },
  {
    id: 'f940-2025', form: 'Form 940',
    formTitle: 'Annual Federal Unemployment (FUTA) Return — 2025',
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Tax year 2025', due: 'Feb 2, 2026', dueNote: 'Filed 7 days early',
    amountCents: 764_400, status: 'filed',
    statusNote: 'Annual FUTA return; quarterly deposits covered the liability.',
    filedAtIso: '2026-01-26T17:48:00Z', filedBy: 'Elena Voss',
    method: 'IRS Modernized e-File', confirmation: '940-2025-0114378',
  },
  {
    id: 'w2-2025', form: 'W-2 / W-3',
    formTitle: 'Annual wage statements — tax year 2025',
    agency: 'SSA', jurisdiction: 'federal',
    period: 'Tax year 2025', due: 'Feb 2, 2026', dueNote: '128 forms issued',
    amountCents: null, status: 'filed',
    statusNote: '128 W-2s accepted by SSA Business Services Online.',
    filedAtIso: '2026-01-28T14:25:00Z', filedBy: 'Elena Voss',
    method: 'SSA Business Services Online', confirmation: 'WFID-2025-664102',
  },
  {
    id: 'n1099-2025', form: '1099-NEC',
    formTitle: 'Nonemployee compensation — tax year 2025',
    agency: 'IRS', jurisdiction: 'federal',
    period: 'Tax year 2025', due: 'Feb 2, 2026', dueNote: '11 forms issued',
    amountCents: null, status: 'filed',
    statusNote: '11 1099-NEC forms accepted via IRS IRIS.',
    filedAtIso: '2026-01-27T19:03:00Z', filedBy: 'Elena Voss',
    method: 'IRS IRIS', confirmation: 'IRIS-2025-2208441',
  },
  {
    id: 'dmr-dec', form: 'Portugal DMR',
    formTitle: 'Declaração Mensal de Remunerações — December 2025',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    period: 'Dec 1 – Dec 31, 2025', due: 'Jan 12, 2026', dueNote: 'Filed on time',
    amountCents: 810_100, status: 'filed',
    statusNote: 'Submitted on Portal das Finanças; remitted Jan 20.',
    filedAtIso: '2026-01-08T10:40:00Z', filedBy: 'Elena Voss',
    method: 'Portal das Finanças', confirmation: 'DMR-2025-12-078926',
  },
];

// Quarter registry — liability = sum of each quarter's monetary filings:
// Q2 979,424.00 + 94,968.00 + 17,314.00 = 1,091,706.00
// Q1 868,410.00 + 89,142.00 + 8,630.00 + 8,342.00 + 8,342.00 = 982,866.00
// Q4-25 872,140.00 + 91,208.00 + 7,644.00 + 8,101.00 = 979,093.00
const QUARTERS: Record<QuarterId, QuarterMeta> = {
  'q4-2025': {
    id: 'q4-2025', label: 'Q4 2025',
    rangeLabel: 'Oct 1 – Dec 31, 2025 · closed',
    liabilityCents: 97_909_300, defaultActiveId: 'f941-q4', filings: Q4_FILINGS,
  },
  'q1-2026': {
    id: 'q1-2026', label: 'Q1 2026',
    rangeLabel: 'Jan 1 – Mar 31, 2026 · closed',
    liabilityCents: 98_286_600, defaultActiveId: 'f941-q1', filings: Q1_FILINGS,
  },
  'q2-2026': {
    id: 'q2-2026', label: 'Q2 2026',
    rangeLabel: 'Apr 1 – Jun 30, 2026 · filing window open',
    liabilityCents: 109_170_600, defaultActiveId: 'f941-q2', filings: Q2_FILINGS,
  },
};

const QUARTER_ORDER: QuarterId[] = ['q4-2025', 'q1-2026', 'q2-2026'];

// ---------------------------------------------------------------------------
// AGENCY NOTICES — one informational, one discrepancy. The discrepancy's
// $1,842.00 figure repeats on the blocked DE-9 row and its detail blocker.
// ---------------------------------------------------------------------------

interface AgencyNotice {
  id: string;
  agency: string;
  code: string;
  title: string;
  receivedIso: string;
  kind: 'info' | 'discrepancy';
  body: string;
  amountCents?: number;
  respondBy?: string;
  respondCountdown?: string;
  owner?: string;
  ownerRole?: string;
  relatedFilingId?: string;
}

const NOTICES: AgencyNotice[] = [
  {
    id: 'n-edd', agency: 'CA EDD', code: 'DE 2176',
    title: 'Notice of discrepancy — Q1 2026 DE-9',
    receivedIso: '2026-07-06T15:12:00Z', kind: 'discrepancy',
    body: 'Subject wages reported on the Q1 2026 DE-9 differ from EDD records by $1,842.00 — UI wage base on 2 corrected checks (off-cycle adjustments dated Mar 27). File a DE-9ADJ or dispute with supporting payroll registers.',
    amountCents: 184_200,
    respondBy: 'Fri, Jul 24, 2026', respondCountdown: 'in 8 days',
    owner: 'Elena Voss', ownerRole: 'Finance lead', relatedFilingId: 'de9-q1',
  },
  {
    id: 'n-irs', agency: 'IRS', code: 'CP 136',
    title: 'Semi-weekly deposit schedule confirmed',
    receivedIso: '2026-07-02T12:00:00Z', kind: 'info',
    body: 'Based on the 2025 lookback period ($3.49M in reported taxes), Kestrel Labs remains a semi-weekly schedule depositor for 2026. No action is required; deposit rules are unchanged.',
  },
];

// ---------------------------------------------------------------------------
// DEPOSIT SCHEDULE — federal semi-weekly (EFTPS). The Jul 15 payday
// (Wednesday) makes the next 941 deposit due the following Wednesday,
// Jul 22 — 6 days from the frozen instant. The settled Jun 30 deposit
// closes out the Q2 941's Line 13 total.
// ---------------------------------------------------------------------------

type DepositStatus = 'next' | 'scheduled' | 'settled';

interface DepositRow {
  id: string;
  label: string;
  agency: string;
  jurisdiction: Jurisdiction;
  source: string;
  due: string;
  amountCents: number;
  status: DepositStatus;
  /** Fixed countdown string for the \`next\` row. */
  countdown?: string;
  /** EFTPS acknowledgment, autopay, or breakdown detail. */
  note: string;
}

const DEPOSITS: DepositRow[] = [
  {
    id: 'd-941-jul22', label: 'Federal 941 deposit',
    agency: 'IRS', jurisdiction: 'federal',
    source: 'Jul 15 payday · EFTPS semi-weekly rule',
    due: 'Wed, Jul 22, 2026', amountCents: 16_665_400,
    status: 'next', countdown: 'in 6 days',
    note: 'Withheld $78,414.00 + FICA $88,240.00',
  },
  {
    id: 'd-de88-jul22', label: 'California DE-88',
    agency: 'CA EDD', jurisdiction: 'california',
    source: 'Jul 15 payday · follows federal dates',
    due: 'Wed, Jul 22, 2026', amountCents: 1_582_800, status: 'scheduled',
    note: 'Autopay · PIT $14,562.00 + UI/ETT $1,266.00',
  },
  {
    id: 'd-pt-jul20', label: 'Portugal remittance',
    agency: 'AT / Segurança Social', jurisdiction: 'portugal',
    source: 'June DMR (filed Jul 8) · monthly',
    due: 'Mon, Jul 20, 2026', amountCents: 1_731_400, status: 'scheduled',
    note: 'SEPA debit · matches DMR-2026-06-114982',
  },
  {
    id: 'd-futa-jul31', label: 'FUTA deposit · 940',
    agency: 'IRS', jurisdiction: 'federal',
    source: 'Q2 accrual above the $500 threshold',
    due: 'Fri, Jul 31, 2026', amountCents: 187_200, status: 'scheduled',
    note: 'EFTPS scheduled with the quarter close',
  },
  {
    id: 'd-941-jul6', label: 'Federal 941 deposit',
    agency: 'IRS', jurisdiction: 'federal',
    source: 'Jun 30 payday · shifted for Jul 3 holiday',
    due: 'Mon, Jul 6, 2026', amountCents: 16_590_700, status: 'settled',
    note: 'EFTPS ack EFT-26188-004417 · final Q2 (L13)',
  },
];

// Penalties-avoided stat chip. The streak counts consecutive on-time
// quarters since Q4 2023; the avoided figure is the platform's estimate
// of late-deposit and late-filing penalties dodged YTD (fixed fixture).
const PENALTIES = {
  streakQuarters: 11,
  avoidedYtdCents: 2_314_000,
};

const NEXT_DEPOSIT = DEPOSITS[0];

// ---------------------------------------------------------------------------
// SHARED CELLS — jurisdiction chip, status pill, right-aligned money.
// ---------------------------------------------------------------------------

function JurisdictionChip({jurisdiction}: {jurisdiction: Jurisdiction}) {
  const meta = JURISDICTIONS[jurisdiction];
  return (
    <span style={styles.jurisdictionChip}>
      <span style={{...styles.jurisdictionDot, backgroundColor: meta.dotColor}} />
      {meta.label}
    </span>
  );
}

const STATUS_META: Record<
  FilingStatus,
  {label: string; icon: typeof FileCheck2Icon}
> = {
  filed: {label: 'Filed', icon: FileCheck2Icon},
  scheduled: {label: 'Scheduled', icon: FileClockIcon},
  action: {label: 'Action needed', icon: FileWarningIcon},
};

function StatusPill({status}: {status: FilingStatus}) {
  if (status === 'filed') {
    return <Badge variant="success" label="Filed" />;
  }
  if (status === 'action') {
    return <Badge variant="error" label="Action needed" />;
  }
  return <Token size="sm" color="gray" label="Scheduled" />;
}

function MoneyCell({
  cents,
  isEmphasized = false,
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

function SummaryTile({
  label,
  value,
  sub,
  icon,
  valueColor,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof LandmarkIcon;
  valueColor?: string;
}) {
  return (
    <div style={styles.summaryTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={icon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary">
          {label}
        </Text>
      </HStack>
      <span style={{...styles.tileValue, color: valueColor}}>{value}</span>
      <Text type="supporting" color="secondary" maxLines={2}>
        {sub}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FILINGS TABLE — fixed-width columns use pixel() so the header carries
// both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function FormCell({filing, isCompact}: {filing: FilingRow; isCompact: boolean}) {
  const meta = STATUS_META[filing.status];
  const glyphColor =
    filing.status === 'action'
      ? CAT_COLOR.red
      : filing.status === 'filed'
        ? CAT_COLOR.green
        : 'var(--color-text-secondary)';
  return (
    <HStack gap={2} vAlign="center">
      <span style={{...styles.formGlyph, color: glyphColor}}>
        <Icon icon={meta.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {filing.form}
          </Text>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary" maxLines={1}>
              {isCompact
                ? \`\${filing.agency} · \${JURISDICTIONS[filing.jurisdiction].label}\`
                : filing.agency}
            </Text>
            {filing.hasOpenNotice ? (
              <span style={{flexShrink: 0, display: 'inline-flex'}}>
                <Token size="sm" color="orange" label="Notice open" />
              </span>
            ) : null}
          </HStack>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function buildFilingColumns(isCompact: boolean): TableColumn<FilingRow>[] {
  const columns: TableColumn<FilingRow>[] = [
    {
      key: 'form',
      header: 'Form',
      width: proportional(2, {minWidth: 188}),
      renderCell: (filing: FilingRow) => (
        <FormCell filing={filing} isCompact={isCompact} />
      ),
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'jurisdiction',
      header: 'Jurisdiction',
      width: pixel(104),
      renderCell: (filing: FilingRow) => (
        <JurisdictionChip jurisdiction={filing.jurisdiction} />
      ),
    });
  }
  columns.push(
    {
      key: 'due',
      header: 'Due',
      width: pixel(140),
      renderCell: (filing: FilingRow) => (
        <VStack gap={0}>
          <Text type="body" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
            {filing.due}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {filing.dueNote}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      width: pixel(100),
      renderCell: (filing: FilingRow) => <MoneyCell cents={filing.amountCents} />,
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(118),
      renderCell: (filing: FilingRow) => <StatusPill status={filing.status} />,
    },
  );
  return columns;
}

// ---------------------------------------------------------------------------
// DEPOSIT SCHEDULE — pinned to the frozen instant regardless of the
// selected quarter; the \`next\` row carries the countdown chip.
// ---------------------------------------------------------------------------

function DepositScheduleRow({
  deposit,
  isLast,
}: {
  deposit: DepositRow;
  isLast: boolean;
}) {
  const isSettled = deposit.status === 'settled';
  return (
    <div
      style={{
        ...styles.depositRow,
        ...(deposit.status === 'next' ? styles.depositRowNext : null),
        ...(isLast ? styles.depositRowLast : null),
      }}>
      <span
        style={{
          ...styles.depositGlyph,
          color: isSettled
            ? CAT_COLOR.green
            : deposit.status === 'next'
              ? CAT_COLOR.blue
              : 'var(--color-text-secondary)',
        }}>
        <Icon
          icon={
            isSettled
              ? CheckCircle2Icon
              : deposit.status === 'next'
                ? TimerIcon
                : CalendarClockIcon
          }
          size="sm"
          color="inherit"
        />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={3} vAlign="start">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="label" maxLines={1}>
                {deposit.label}
              </Text>
            </StackItem>
            <Text type="label" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
              {usd(deposit.amountCents)}
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <JurisdictionChip jurisdiction={deposit.jurisdiction} />
            {deposit.status === 'next' && deposit.countdown !== undefined ? (
              <Token size="sm" color="orange" label={\`Due \${deposit.countdown}\`} />
            ) : null}
            {isSettled ? <Token size="sm" color="green" label="Settled" /> : null}
            <StackItem size="fill" />
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={{whiteSpace: 'nowrap'}}>
              {/* Weekday lives in the fixture for the tile copy; the row
                  keeps the compact date so the chips line never wraps. */}
              {deposit.due.replace(/^[A-Za-z]{3}, /, '')}
            </Text>
          </HStack>
          <VStack gap={0}>
            <Text type="supporting" color="secondary" maxLines={1}>
              {deposit.source}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1} hasTabularNumbers>
              {deposit.note}
            </Text>
          </VStack>
        </VStack>
      </StackItem>
    </div>
  );
}

function DepositSchedule() {
  return (
    <section style={styles.twoUpColumn} aria-label="Deposit schedule">
      <div style={styles.sectionToolbar}>
        <Icon icon={LandmarkIcon} size="sm" color="secondary" />
        <Heading level={2}>Deposit schedule</Heading>
        <Token size="sm" color="blue" label="Semi-weekly" />
      </div>
      <div style={styles.columnBody}>
        {DEPOSITS.map((deposit, index) => (
          <DepositScheduleRow
            key={deposit.id}
            deposit={deposit}
            isLast={index === DEPOSITS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// AGENCY-NOTICE INBOX — one discrepancy (amount, respond-by, owner) and
// one informational notice with a working acknowledge action.
// ---------------------------------------------------------------------------

function NoticeInboxRow({
  notice,
  isLast,
  isHighlighted,
  isAcknowledged,
  onAcknowledge,
}: {
  notice: AgencyNotice;
  isLast: boolean;
  isHighlighted: boolean;
  isAcknowledged: boolean;
  onAcknowledge: (id: string) => void;
}) {
  const isDiscrepancy = notice.kind === 'discrepancy';
  return (
    <div
      style={{
        ...styles.noticeRow,
        ...(isDiscrepancy ? styles.noticeRowDiscrepancy : null),
        ...(isLast ? styles.noticeRowLast : null),
        ...(isAcknowledged ? styles.noticeRowRead : null),
        ...(isHighlighted
          ? {boxShadow: 'inset 0 0 0 2px var(--color-accent)'}
          : null),
      }}>
      <span
        style={{
          ...styles.depositGlyph,
          color: isDiscrepancy ? CAT_COLOR.red : CAT_COLOR.blue,
        }}>
        <Icon
          icon={isDiscrepancy ? TriangleAlertIcon : InfoIcon}
          size="sm"
          color="inherit"
        />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label" maxLines={1}>
              {notice.title}
            </Text>
            {isDiscrepancy ? (
              <Badge variant="error" label="Respond by Jul 24" />
            ) : (
              <Token size="sm" color="blue" label="Informational" />
            )}
            {isAcknowledged ? (
              <Token size="sm" color="green" label="Acknowledged" />
            ) : null}
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
            {notice.agency} · {notice.code} · received{' '}
            <Timestamp value={notice.receivedIso} format="date" />
          </Text>
          <Text type="body" color="secondary">
            {notice.body}
          </Text>
          {isDiscrepancy &&
          notice.amountCents !== undefined &&
          notice.respondBy !== undefined ? (
            <HStack gap={3} vAlign="center" wrap="wrap">
              <Text type="label" hasTabularNumbers>
                {usd(notice.amountCents)} at issue
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Respond by {notice.respondBy} ({notice.respondCountdown})
              </Text>
              {notice.owner !== undefined ? (
                <HStack gap={1} vAlign="center">
                  <Avatar name={notice.owner} size="xsmall" />
                  <Text type="supporting" color="secondary">
                    {notice.owner} · {notice.ownerRole}
                  </Text>
                </HStack>
              ) : null}
            </HStack>
          ) : null}
          <HStack gap={2} vAlign="center" wrap="wrap">
            {isDiscrepancy ? (
              <>
                <Button label="Open response draft" variant="secondary" size="sm" />
                <Button
                  label="Download"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={DownloadIcon} size="sm" />}
                />
              </>
            ) : (
              <Button
                label={isAcknowledged ? 'Acknowledged' : 'Acknowledge & file'}
                variant="ghost"
                size="sm"
                isDisabled={isAcknowledged}
                icon={<Icon icon={MailCheckIcon} size="sm" />}
                onClick={() => onAcknowledge(notice.id)}
              />
            )}
          </HStack>
        </VStack>
      </StackItem>
    </div>
  );
}

function NoticeInbox({
  highlightedId,
  acknowledgedIds,
  onAcknowledge,
}: {
  highlightedId: string | null;
  acknowledgedIds: Set<string>;
  onAcknowledge: (id: string) => void;
}) {
  const openCount = NOTICES.filter(
    notice => notice.kind === 'discrepancy' && !acknowledgedIds.has(notice.id),
  ).length;
  return (
    <section style={styles.twoUpColumn} aria-label="Agency notices">
      <div style={styles.sectionToolbar}>
        <Icon icon={InboxIcon} size="sm" color="secondary" />
        <Heading level={2}>Agency notices</Heading>
        {openCount > 0 ? (
          <Badge variant="warning" label={\`\${openCount} needs response\`} />
        ) : (
          <Badge variant="success" label="All clear" />
        )}
      </div>
      <div style={styles.columnBody}>
        {NOTICES.map((notice, index) => (
          <NoticeInboxRow
            key={notice.id}
            notice={notice}
            isLast={index === NOTICES.length - 1}
            isHighlighted={highlightedId === notice.id}
            isAcknowledged={acknowledgedIds.has(notice.id)}
            onAcknowledge={onAcknowledge}
          />
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FILING DETAIL PANEL — form-line summary + confirmation number for filed
// forms; draft lines + the blocking discrepancy for the action row.
// ---------------------------------------------------------------------------

function FormLineRow({line}: {line: FormLine}) {
  return (
    <div style={styles.lineRow}>
      <span style={styles.lineNo}>{line.no}</span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <Text
          type={line.isEmphasized ? 'label' : 'body'}
          color={line.isEmphasized ? undefined : 'secondary'}
          maxLines={2}>
          {line.label}
        </Text>
      </StackItem>
      <Text
        type={line.isEmphasized ? 'label' : 'body'}
        hasTabularNumbers
        style={{whiteSpace: 'nowrap'}}>
        {line.value}
      </Text>
    </div>
  );
}

function FilingDetailPanel({
  filing,
  onViewNotice,
  onDownloadReceipt,
}: {
  filing: FilingRow;
  onViewNotice: (noticeId: string) => void;
  onDownloadReceipt: (filing: FilingRow) => void;
}) {
  const jurisdiction = JURISDICTIONS[filing.jurisdiction];
  return (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={3}>{filing.form}</Heading>
            <StatusPill status={filing.status} />
          </HStack>
          <Text type="supporting" color="secondary">
            {filing.formTitle}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <JurisdictionChip jurisdiction={filing.jurisdiction} />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {filing.period}
            </Text>
          </HStack>
        </VStack>

        {filing.status === 'filed' && filing.confirmation !== undefined ? (
          <div style={styles.detailStatBlock}>
            <HStack gap={2} vAlign="center">
              <Icon icon={CheckCircle2Icon} size="sm" color="success" />
              <Text type="label" size="sm">
                Accepted by {filing.agency}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary">
              Confirmation number
            </Text>
            <span style={styles.confirmationCode}>{filing.confirmation}</span>
            {filing.filedAtIso !== undefined ? (
              <Text type="supporting" color="secondary">
                Filed <Timestamp value={filing.filedAtIso} format="date_time" />{' '}
                by {filing.filedBy}
              </Text>
            ) : null}
          </div>
        ) : null}

        {filing.blocker !== undefined ? (
          <div style={styles.blockerBox}>
            <span style={{...styles.depositGlyph, color: CAT_COLOR.red}}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            </span>
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={2}>
                <Text type="label" size="sm">
                  {filing.blocker.title}
                </Text>
                <Text type="supporting" color="secondary">
                  {filing.blocker.body}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  Respond by {filing.blocker.respondBy} (
                  {filing.blocker.respondCountdown})
                </Text>
                <HStack gap={2} vAlign="center">
                  <Button
                    label="View notice"
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={BellIcon} size="sm" />}
                    onClick={() => onViewNotice(filing.blocker?.noticeId ?? '')}
                  />
                </HStack>
              </VStack>
            </StackItem>
          </div>
        ) : null}

        <MetadataList columns={1} label={{position: 'start', width: 104}}>
          <MetadataListItem label="Agency">
            <Text type="body">{filing.agency}</Text>
          </MetadataListItem>
          <MetadataListItem label="Jurisdiction">
            <Text type="body">{jurisdiction.label}</Text>
          </MetadataListItem>
          <MetadataListItem label="Due date">
            <Text type="body" hasTabularNumbers>
              {filing.due} · {filing.dueNote}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Amount">
            <Text type="body" hasTabularNumbers>
              {usd(filing.amountCents)}
            </Text>
          </MetadataListItem>
          {filing.method !== undefined ? (
            <MetadataListItem label="Channel">
              <Text type="body">{filing.method}</Text>
            </MetadataListItem>
          ) : null}
          <MetadataListItem label="Status">
            <Text type="body">{filing.statusNote}</Text>
          </MetadataListItem>
        </MetadataList>

        {filing.lines !== undefined ? (
          <VStack gap={1}>
            <Divider />
            <Text type="label" size="sm" color="secondary">
              {filing.status === 'filed' ? 'Form-line summary' : 'Draft summary'}
            </Text>
            <div>
              {filing.lines.map(line => (
                <FormLineRow key={\`\${filing.id}-\${line.no}-\${line.label}\`} line={line} />
              ))}
            </div>
          </VStack>
        ) : null}

        {filing.status === 'filed' ? (
          <Button
            label="Download filed PDF"
            variant="secondary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" />}
            onClick={() => onDownloadReceipt(filing)}
          />
        ) : filing.status === 'scheduled' ? (
          <Text type="supporting" color="secondary">
            Nothing to submit yet — this prep item rolls into the annual
            filing window.
          </Text>
        ) : null}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function FinTaxFilingsTemplate() {
  const toast = useToast();
  const [quarterId, setQuarterId] = useState<QuarterId>('q2-2026');
  const [activeId, setActiveId] = useState<string>(
    QUARTERS['q2-2026'].defaultActiveId,
  );
  const [acknowledgedIds, setAcknowledgedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [highlightedNoticeId, setHighlightedNoticeId] = useState<string | null>(
    null,
  );
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the detail panel; <=860px drops
  // the Jurisdiction/Period columns and stacks the two-up grid.
  const isDetailHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const quarter = QUARTERS[quarterId];
  const filings = quarter.filings;
  const activeFiling = filings.find(row => row.id === activeId) ?? filings[0];

  const filedCount = filings.filter(row => row.status === 'filed').length;
  const scheduledCount = filings.filter(row => row.status === 'scheduled').length;
  const actionCount = filings.filter(row => row.status === 'action').length;
  const monetaryCount = filings.filter(row => row.amountCents !== null).length;
  const openNoticeCount = NOTICES.filter(
    notice => notice.kind === 'discrepancy' && !acknowledgedIds.has(notice.id),
  ).length;

  const changeQuarter = (nextId: string) => {
    const next = nextId as QuarterId;
    setQuarterId(next);
    setActiveId(QUARTERS[next].defaultActiveId);
    setAnnouncement(\`Showing \${QUARTERS[next].label} filings\`);
  };

  const acknowledgeNotice = (id: string) => {
    setAcknowledgedIds(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast({body: 'Notice acknowledged and filed', uniqueID: 'tax-notice'});
  };

  const viewNotice = (noticeId: string) => {
    setHighlightedNoticeId(noticeId);
    setAnnouncement('Related notice highlighted in the agency-notice inbox');
  };

  const downloadReceipt = (filing: FilingRow) => {
    toast({
      body: \`\${filing.form.replaceAll(' ', '-')}-\${filing.confirmation ?? 'draft'}.pdf saved to Downloads\`,
      uniqueID: 'tax-download',
    });
  };

  const columns = useMemo(() => buildFilingColumns(isCompact), [isCompact]);

  // Row-click plugin: clicking a row makes it the detail-panel subject.
  // The action-needed row carries a persistent danger tint; the active
  // row gets an inset accent edge so it never bleeds onto neighbors.
  const activePlugin = useMemo<TablePlugin<FilingRow>>(
    () => ({
      transformBodyRow: (props, item) => {
        const prevOnClick = props.htmlProps.onClick;
        const isActive = item.id === activeId;
        return {
          ...props,
          htmlProps: {
            ...props.htmlProps,
            onClick: event => {
              prevOnClick?.(event);
              setActiveId(item.id);
            },
            'aria-selected': isActive || undefined,
            style: {
              ...props.htmlProps.style,
              cursor: 'pointer',
              ...(item.status === 'action'
                ? {backgroundColor: ACTION_ROW_TINT}
                : null),
              ...(isActive
                ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
                : null),
            },
          },
        };
      },
    }),
    [activeId],
  );

  // ----- header: brand, quarter selector, penalties-avoided chip -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={LandmarkIcon} size="md" color="secondary" />
          <Heading level={1}>Payroll tax filings</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Kestrel Labs · {EIN}
          </Text>
        </HStack>
        <StackItem size="fill" />
        <span style={styles.penaltyChip}>
          <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
          {usd(PENALTIES.avoidedYtdCents)} penalties avoided ·{' '}
          {PENALTIES.streakQuarters} on-time quarters
        </span>
        <SegmentedControl
          label="Filing quarter"
          value={quarterId}
          onChange={changeQuarter}
          size="sm">
          {QUARTER_ORDER.map(id => (
            <SegmentedControlItem
              key={id}
              label={QUARTERS[id].label}
              value={id}
            />
          ))}
        </SegmentedControl>
      </HStack>
    </LayoutHeader>
  );

  // ----- summary tiles: figures repeat the table, schedule, and inbox -----
  const tiles = (
    <div style={styles.tileRow}>
      <SummaryTile
        icon={LandmarkIcon}
        label={\`\${quarter.label} liability\`}
        value={usd(quarter.liabilityCents)}
        sub={\`\${monetaryCount} monetary filings · \${quarter.rangeLabel}\`}
      />
      <SummaryTile
        icon={FileCheck2Icon}
        label="Filings"
        value={\`\${filedCount} of \${filings.length} filed\`}
        sub={\`\${scheduledCount} scheduled · \${actionCount} action needed\`}
      />
      <SummaryTile
        icon={TimerIcon}
        label="Next deposit"
        value={usd(NEXT_DEPOSIT.amountCents)}
        sub={\`Federal 941 · due \${NEXT_DEPOSIT.due} · \${NEXT_DEPOSIT.countdown ?? ''}\`}
      />
      <SummaryTile
        icon={InboxIcon}
        label="Open notices"
        value={openNoticeCount > 0 ? \`\${openNoticeCount} open\` : 'All clear'}
        valueColor={openNoticeCount > 0 ? CAT_COLOR.red : CAT_COLOR.green}
        sub="CA EDD $1,842.00 discrepancy · respond by Jul 24 (in 8 days)"
      />
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <div style={styles.contentScroll}>
                {tiles}
                <section style={styles.filingsSection} aria-label="Filings">
                  <div style={styles.sectionToolbar}>
                    <Icon icon={FileCheck2Icon} size="sm" color="secondary" />
                    <Heading level={2}>Filings — {quarter.label}</Heading>
                    <Token size="sm" color="gray" label={String(filings.length)} />
                    {actionCount > 0 ? (
                      <Badge variant="error" label={\`\${actionCount} blocked\`} />
                    ) : null}
                    <StackItem size="fill" />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      As of {TODAY_LABEL}
                    </Text>
                  </div>
                  <div style={styles.filingsTableWrap}>
                    <Table<FilingRow>
                      data={filings}
                      columns={columns}
                      idKey="id"
                      density="balanced"
                      dividers="rows"
                      hasHover
                      plugins={{active: activePlugin}}
                    />
                  </div>
                </section>
                <div
                  style={{
                    ...styles.twoUpGrid,
                    flexDirection: isCompact ? 'column' : 'row',
                  }}>
                  <DepositSchedule />
                  <NoticeInbox
                    highlightedId={highlightedNoticeId}
                    acknowledgedIds={acknowledgedIds}
                    onAcknowledge={acknowledgeNotice}
                  />
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isDetailHidden ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Filing detail">
              <div style={styles.panelFill}>
                <FilingDetailPanel
                  filing={activeFiling}
                  onViewNotice={viewNotice}
                  onDownloadReceipt={downloadReceipt}
                />
              </div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};