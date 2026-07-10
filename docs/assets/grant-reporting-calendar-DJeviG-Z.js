var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Grantline compliance workspace for
 *   a three-grant portfolio in July 2026 (internal today fixed at Thu Jul 9,
 *   2026; every deliverable stores a dueInDays dual field beside its display
 *   date, never a clock read). Grants: EDA-2412 Downtown Corridor
 *   Revitalization ($480,000 awarded, $118,306.90 reimbursed = base
 *   $79,394.80 reqs #1–#5 + the modeled paid req #6 $38,912.10 ✓) ·
 *   SAC-26-114 Riverfront Arts Series ($60,000 awarded, $21,730.00
 *   reimbursed) · BFF-0193 Youth Futures Program ($125,000 awarded,
 *   $47,925.00 reimbursed). Portfolio awarded $665,000 = 480,000 + 60,000 +
 *   125,000 ✓. Ready-to-file reimbursements: req #7 $42,380.55 + req #3
 *   $8,450.00 = $50,830.55 (req #5 $16,275.00 is blocked on receipts and
 *   excluded) ✓. Remaining balances: EDA 480,000 − 118,306.90 = $361,693.10;
 *   SAC $38,270.00; BFF $77,075.00 ✓. Filing req #7 moves $42,380.55 from
 *   ready-to-file into EDA's with-funder segment (remaining $319,312.55 =
 *   361,693.10 − 42,380.55 ✓) — all derived live from one status record.
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Grantline — Grant Reporting Calendar. A month calendar grid
 *   (July 2026, Sun–Sat, 35 cells with muted leading/trailing days and a
 *   brand-ringed today) whose day cells carry deliverable chips — grant-dot
 *   + kind glyph + title, colored by a derived status (overdue / due ≤ 3d /
 *   upcoming / filed / funder review / accepted / paid / blocked) — beside
 *   a 340px rail: a detail pane for the selected deliverable (funder,
 *   amount, requirements checklist, File action with a reasoned disabled
 *   state, Undo), a four-stage funder-review lane (Filed → Funder review →
 *   Accepted → Paid), and a per-grant reimbursement ledger with stacked
 *   paid / with-funder / remaining bars. Signature move: filing a
 *   deliverable flips its calendar chip in place, drops it into the review
 *   lane's Filed stage, and — when it is a reimbursement — moves its exact
 *   dollars out of the ready-to-file KPI into the grant's with-funder bar
 *   segment and re-derives the remaining balance, with snapshot-exact Undo
 *   and a polite live-region announcement. The cascade across calendar,
 *   lane, and ledger is the product; a screenshot cannot show it.
 * @position Page template; emitted by \`astryx template grant-reporting-calendar\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 *   brand row (Grantline ledger-line mark, month title with decorative
 *   prev/next month buttons pinned to the July 2026 demo window, KPI strip:
 *   open deliverables · overdue · ready-to-file $ · with-funder $ ·
 *   portfolio awarded $). LayoutContent holds a two-column CSS grid:
 *   minmax(0,1fr) calendar column (weekday header row + 5 week rows, then a
 *   mobile-only agenda list) + 340px rail. The content column is the page
 *   scroller; the rail is sticky at desktop widths.
 * Container policy: work-surface archetype — the calendar is a hand-rolled
 *   CSS grid (a DS grid would inline widths that defeat the 620px media
 *   query), chips and agenda rows are single <button>s with aria-pressed
 *   selection, rail sections are panels, KPI tiles are the only card-shaped
 *   chrome. No marketing cards.
 * Color policy: token-pure chrome. ONE quarantined brand literal (Grantline
 *   green) as a light-dark() pair with contrast math at the declaration;
 *   status pairs (overdue red, due amber, filed blue, review violet,
 *   accepted green, paid teal) and three grant-identity pairs (EDA indigo,
 *   SAC magenta, BFF orange) each carry their own math. Text colors are
 *   --color-text-primary / --color-text-secondary only.
 * Density grid (repeated verbatim): day cells min 128px · chips min 40px ·
 *   agenda rows 48px · rail 340px · stage rows min 44px · ledger bars 10px ·
 *   KPI tiles 64px · 12px gutters · 10px container radius · tabular-nums on
 *   every date, count, and dollar figure.
 * Fixture policy: one state owner — Record<deliverableId, StoredStatus>
 *   ('open' | 'blocked' | 'filed' | 'review' | 'accepted' | 'paid') — feeds
 *   every derivation: chip styling (overdue/due/upcoming derive from
 *   dueInDays only while status is open), review-lane membership, ledger
 *   segments, and all four money KPIs. File/Undo mutate that record only;
 *   filed stamps use the fixed literal 'Jul 9'.
 *
 * Responsive contract (subtraction, not squeeze):
 * - Default (the ~1045–1075px inline demo stage — no media query needed):
 *   full two-column frame; the ~660px calendar column gives ~94px day
 *   columns, wide enough for one-line chip titles with ellipsis.
 * - <= 900px: the rail leaves the grid and stacks below the calendar at
 *   full width (sticky released).
 * - <= 620px (390px embed iframe — media queries DO fire there): day-cell
 *   chips collapse to aria-hidden status dots and the agenda list (48px
 *   rows, the accessible path, hidden at wider widths) appears under the
 *   calendar; the KPI strip wraps to a 2-up grid; requirements and actions
 *   in the detail pane go full-width. Nothing scrolls horizontally.
 */

import {useMemo, useRef, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  LandmarkIcon,
  LockIcon,
  SendIcon,
  Undo2Icon,
} from 'lucide-react';

const SCOPE = 'tpl-grant-reporting-calendar';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand literal (Grantline green).
// #15803D on #FFFFFF ≈ 4.6:1 (passes 4.5:1); #4ADE80 on ~#1C1C1E ≈ 9.6:1.
const BRAND_ACCENT = 'light-dark(#15803D, #4ADE80)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #15803D ≈ 4.6:1;
// #052E16 on #4ADE80 ≈ 8.7:1 (white on #4ADE80 would fail at ≈1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #052E16)';
// Non-text brand wash for selection/hover chrome — decorative.
const BRAND_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';

// Status pairs (text-grade on body surfaces):
// overdue red — #B42318 on #FFFFFF ≈ 6.3:1; #F97066 on #1C1C1E ≈ 5.6:1.
const OVERDUE_RED = 'light-dark(#B42318, #F97066)';
const OVERDUE_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(249, 112, 102, 0.14))';
// due-soon amber — #92400E on #FFFFFF ≈ 6.4:1; #FBBF24 on #1C1C1E ≈ 10.2:1.
const DUE_AMBER = 'light-dark(#92400E, #FBBF24)';
const DUE_TINT = 'light-dark(rgba(146, 64, 14, 0.10), rgba(251, 191, 36, 0.14))';
// filed blue — #1D4ED8 on #FFFFFF ≈ 6.3:1; #93C5FD on #1C1C1E ≈ 9.5:1.
const FILED_BLUE = 'light-dark(#1D4ED8, #93C5FD)';
const FILED_TINT = 'light-dark(rgba(29, 78, 216, 0.10), rgba(147, 197, 253, 0.14))';
// funder-review violet — #6D28D9 on #FFFFFF ≈ 7.0:1; #C4B5FD on #1C1C1E ≈ 9.6:1.
const REVIEW_VIOLET = 'light-dark(#6D28D9, #C4B5FD)';
const REVIEW_TINT = 'light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.14))';
// accepted green — deliberately a separate constant from the brand pair
// (state, not chrome); same values, same math as the brand declaration.
const ACCEPTED_GREEN = 'light-dark(#15803D, #4ADE80)';
const ACCEPTED_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// paid teal — #0F766E on #FFFFFF ≈ 5.0:1; #5EEAD4 on #1C1C1E ≈ 11.4:1.
const PAID_TEAL = 'light-dark(#0F766E, #5EEAD4)';
const PAID_TINT = 'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.14))';

// Grant identity pairs (dots and ledger accents):
// EDA indigo — #4338CA on #FFFFFF ≈ 7.5:1; #A5B4FC on #1C1C1E ≈ 8.6:1.
const EDA_INDIGO = 'light-dark(#4338CA, #A5B4FC)';
// SAC magenta — #A21CAF on #FFFFFF ≈ 5.9:1; #F0ABFC on #1C1C1E ≈ 9.3:1.
const SAC_MAGENTA = 'light-dark(#A21CAF, #F0ABFC)';
// BFF orange — #B45309 on #FFFFFF ≈ 4.8:1; #FDBA74 on #1C1C1E ≈ 10.4:1.
const BFF_ORANGE = 'light-dark(#B45309, #FDBA74)';

// ---------------------------------------------------------------------------
// DOMAIN MODEL
// ---------------------------------------------------------------------------

type GrantId = 'eda' | 'sac' | 'bff';

type Grant = {
  id: GrantId;
  code: string;
  name: string;
  funder: string;
  color: string;
  awarded: number;
  /**
   * Reimbursed dollars from requests NOT modeled as deliverables on this
   * page — modeled paid deliverables add on top (header arithmetic: EDA
   * $79,394.80 base + req #6 $38,912.10 = $118,306.90).
   */
  basePaid: number;
};

const GRANTS: readonly Grant[] = [
  {
    id: 'eda',
    code: 'EDA-2412',
    name: 'Downtown Corridor Revitalization',
    funder: 'U.S. Economic Development Administration',
    color: EDA_INDIGO,
    awarded: 480000,
    basePaid: 79394.8,
  },
  {
    id: 'sac',
    code: 'SAC-26-114',
    name: 'Riverfront Arts Series',
    funder: 'State Arts Council',
    color: SAC_MAGENTA,
    awarded: 60000,
    basePaid: 21730,
  },
  {
    id: 'bff',
    code: 'BFF-0193',
    name: 'Youth Futures Program',
    funder: 'Bright Futures Foundation',
    color: BFF_ORANGE,
    awarded: 125000,
    basePaid: 47925,
  },
] as const;

const GRANT_BY_ID = new Map(GRANTS.map(grant => [grant.id, grant]));

type DeliverableKind = 'report' | 'reimbursement' | 'certification';

const KIND_LABEL: Record<DeliverableKind, string> = {
  report: 'Report',
  reimbursement: 'Reimbursement',
  certification: 'Certification',
};

type Requirement = {
  label: string;
  ready: boolean;
};

type Deliverable = {
  id: string;
  grantId: GrantId;
  kind: DeliverableKind;
  title: string;
  /** Display date + dual math field vs the fixed today (Thu Jul 9, 2026). */
  dueLabel: string;
  dueInDays: number;
  /** July day-of-month for calendar placement; null = off this month's grid. */
  calendarDay: number | null;
  amount?: number;
  requirements: readonly Requirement[];
  /** Fixed history stamps for pre-filed fixtures. */
  historyNote?: string;
};

/**
 * StoredStatus is the single state dimension the page mutates. While
 * status === 'open', the DISPLAY status derives from dueInDays: overdue
 * (< 0), due (≤ 3), upcoming (> 3). 'blocked' renders locked until its
 * requirements story changes (it never does in this demo — it exists as the
 * reasoned-disabled stress fixture).
 */
type StoredStatus = 'open' | 'blocked' | 'filed' | 'review' | 'accepted' | 'paid';
type DisplayStatus = 'overdue' | 'due' | 'upcoming' | Exclude<StoredStatus, 'open'>;

const TODAY_DAY = 9;
const TODAY_STAMP = 'Jul 9';
const MONTH_LABEL = 'July 2026';
const AS_OF_LABEL = 'Thu Jul 9, 2026';

const DELIVERABLES: readonly Deliverable[] = [
  {
    id: 'r2q',
    grantId: 'sac',
    kind: 'report',
    title: 'Q2 narrative report',
    dueLabel: 'Jul 2',
    dueInDays: -7,
    calendarDay: 2,
    requirements: [
      {label: 'Narrative draft approved by program director', ready: true},
      {label: 'Attendance appendix (6 events)', ready: true},
    ],
    historyNote: 'Filed Jul 2 · accepted by funder Jul 7.',
  },
  {
    id: 'f425',
    grantId: 'eda',
    kind: 'report',
    title: 'SF-425 Federal Financial Report — Q2',
    dueLabel: 'Jul 6',
    dueInDays: -3,
    calendarDay: 6,
    requirements: [
      {label: 'GL close through Jun 30', ready: true},
      {label: 'Match contribution schedule', ready: true},
      {label: 'AOR signature (M. Okafor)', ready: true},
    ],
    historyNote: 'Filed Jul 6 · in funder review since Jul 7.',
  },
  {
    id: 'tec',
    grantId: 'bff',
    kind: 'certification',
    title: 'Time & effort certifications — June',
    dueLabel: 'Jul 8',
    dueInDays: -1,
    calendarDay: 8,
    requirements: [
      {label: 'Timesheets exported (14 staff)', ready: true},
      {label: 'Supervisor signatures (14 of 14)', ready: true},
      {label: 'Allocation worksheet reconciled', ready: true},
    ],
  },
  {
    id: 'r7',
    grantId: 'eda',
    kind: 'reimbursement',
    title: 'Reimbursement request #7 — June drawdown',
    dueLabel: 'Jul 10',
    dueInDays: 1,
    calendarDay: 10,
    amount: 42380.55,
    requirements: [
      {label: 'GL export tied to request total', ready: true},
      {label: 'Contractor invoices (streetscape phase 2)', ready: true},
      {label: 'Match certification signed', ready: true},
    ],
  },
  {
    id: 'out',
    grantId: 'bff',
    kind: 'report',
    title: 'Q2 outcomes report',
    dueLabel: 'Jul 15',
    dueInDays: 6,
    calendarDay: 15,
    requirements: [
      {label: 'Participant survey export (n=212)', ready: true},
      {label: 'Outcome metrics table', ready: true},
      {label: 'Case-study narratives (2 of 3 drafted)', ready: false},
      {label: 'Program photos with releases', ready: false},
    ],
  },
  {
    id: 'r3s',
    grantId: 'sac',
    kind: 'reimbursement',
    title: 'Reimbursement request #3',
    dueLabel: 'Jul 17',
    dueInDays: 8,
    calendarDay: 17,
    amount: 8450,
    requirements: [
      {label: 'Artist contracts and paid invoices', ready: true},
      {label: 'Venue receipts (3 events)', ready: true},
    ],
  },
  {
    // Stress fixture: 78-char title exercises single-line chip ellipsis and
    // the two-line clamp in the detail pane.
    id: 'dbp',
    grantId: 'eda',
    kind: 'certification',
    title: 'Davis-Bacon certified payrolls — June (all subcontractors, WD-2025-0441 rev 3)',
    dueLabel: 'Jul 22',
    dueInDays: 13,
    calendarDay: 22,
    requirements: [
      {label: 'WH-347 forms from 4 subcontractors', ready: true},
      {label: 'Wage-determination revision check', ready: true},
    ],
  },
  {
    id: 'r5b',
    grantId: 'bff',
    kind: 'reimbursement',
    title: 'Reimbursement request #5',
    dueLabel: 'Jul 24',
    dueInDays: 15,
    calendarDay: 24,
    amount: 16275,
    requirements: [
      {label: 'GL export tied to request total', ready: true},
      {label: 'Receipts — 2 missing ($1,140.20 of travel)', ready: false},
    ],
  },
  {
    id: 'pnq',
    grantId: 'eda',
    kind: 'report',
    title: 'Q2 progress narrative',
    dueLabel: 'Jul 31',
    dueInDays: 22,
    calendarDay: 31,
    requirements: [
      {label: 'Milestone table updated', ready: true},
      {label: 'Narrative draft (in progress)', ready: false},
      {label: 'Photos of corridor work', ready: false},
    ],
  },
  {
    id: 'att',
    grantId: 'sac',
    kind: 'report',
    title: 'Final attendance data — series 1',
    dueLabel: 'Jul 31',
    dueInDays: 22,
    calendarDay: 31,
    requirements: [{label: 'Box-office and door counts merged', ready: true}],
  },
  {
    // Off-calendar fixture: paid in June; lives in the review lane's Paid
    // stage and inside EDA's reimbursed total ($79,394.80 + $38,912.10).
    id: 'r6',
    grantId: 'eda',
    kind: 'reimbursement',
    title: 'Reimbursement request #6 — May drawdown',
    dueLabel: 'Jun 12',
    dueInDays: -27,
    calendarDay: null,
    amount: 38912.1,
    requirements: [
      {label: 'GL export tied to request total', ready: true},
      {label: 'Contractor invoices (demolition)', ready: true},
    ],
    historyNote: 'Filed Jun 12 · accepted Jun 24 · paid Jun 30.',
  },
] as const;

const DELIVERABLE_BY_ID = new Map(DELIVERABLES.map(item => [item.id, item]));

type StatusMap = Record<string, StoredStatus>;

const INITIAL_STATUSES: StatusMap = {
  r2q: 'accepted',
  f425: 'review',
  tec: 'open',
  r7: 'open',
  out: 'open',
  r3s: 'open',
  dbp: 'open',
  r5b: 'blocked',
  pnq: 'open',
  att: 'open',
  r6: 'paid',
};

// ---------------------------------------------------------------------------
// DERIVATIONS — one pure pipeline off the status record.
// ---------------------------------------------------------------------------

const STATUS_META: Record<DisplayStatus, {label: string; color: string; tint: string}> = {
  overdue: {label: 'Overdue', color: OVERDUE_RED, tint: OVERDUE_TINT},
  due: {label: 'Due soon', color: DUE_AMBER, tint: DUE_TINT},
  upcoming: {label: 'Upcoming', color: 'var(--color-text-secondary)', tint: 'var(--color-background-muted)'},
  blocked: {label: 'Blocked', color: OVERDUE_RED, tint: 'var(--color-background-muted)'},
  filed: {label: 'Filed', color: FILED_BLUE, tint: FILED_TINT},
  review: {label: 'Funder review', color: REVIEW_VIOLET, tint: REVIEW_TINT},
  accepted: {label: 'Accepted', color: ACCEPTED_GREEN, tint: ACCEPTED_TINT},
  paid: {label: 'Paid', color: PAID_TEAL, tint: PAID_TINT},
};

function displayStatus(deliverable: Deliverable, stored: StoredStatus): DisplayStatus {
  if (stored !== 'open') {
    return stored;
  }
  if (deliverable.dueInDays < 0) {
    return 'overdue';
  }
  if (deliverable.dueInDays <= 3) {
    return 'due';
  }
  return 'upcoming';
}

function allRequirementsReady(deliverable: Deliverable): boolean {
  return deliverable.requirements.every(requirement => requirement.ready);
}

/** '$42,380.55' — cents always shown; math stays on the numeric field. */
function formatMoney(value: number): string {
  return \`$\${value.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}\`;
}

type GrantLedger = {
  grant: Grant;
  paid: number;
  withFunder: number;
  remaining: number;
};

function deriveLedger(grant: Grant, statuses: StatusMap): GrantLedger {
  let paid = grant.basePaid;
  let withFunder = 0;
  for (const deliverable of DELIVERABLES) {
    if (deliverable.grantId !== grant.id || deliverable.amount === undefined) {
      continue;
    }
    const stored = statuses[deliverable.id] ?? 'open';
    if (stored === 'paid') {
      paid += deliverable.amount;
    } else if (stored === 'filed' || stored === 'review' || stored === 'accepted') {
      withFunder += deliverable.amount;
    }
  }
  return {grant, paid, withFunder, remaining: grant.awarded - paid - withFunder};
}

// ---- calendar geometry: July 2026, Sun–Sat, 35 cells --------------------------
// Jul 1, 2026 is a Wednesday → 3 leading June days (28–30); the grid closes
// on Sat Aug 1. Verified against the proleptic Gregorian calendar by hand.

type CalendarCell = {
  key: string;
  dayLabel: number;
  /** July day number when in-month; null for the muted lead/trail days. */
  julyDay: number | null;
};

const CALENDAR_CELLS: readonly CalendarCell[] = [
  {key: 'jun-28', dayLabel: 28, julyDay: null},
  {key: 'jun-29', dayLabel: 29, julyDay: null},
  {key: 'jun-30', dayLabel: 30, julyDay: null},
  ...Array.from({length: 31}, (_, index) => ({
    key: \`jul-\${index + 1}\`,
    dayLabel: index + 1,
    julyDay: index + 1,
  })),
  {key: 'aug-1', dayLabel: 1, julyDay: null},
] as const;

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

const LANE_STAGES = ['filed', 'review', 'accepted', 'paid'] as const;
type LaneStage = (typeof LANE_STAGES)[number];

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-grant-reporting-calendar.
// Density grid repeated from the header: day cells min 128 · chips min 40 ·
// agenda rows 48 · rail 340 · stage rows min 44 · ledger bars 10 · KPI 64 ·
// gutters 12 · radius 10.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} *,
.\${SCOPE} *::before,
.\${SCOPE} *::after {
  box-sizing: border-box;
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} button:focus-visible {
  outline: 2px solid \${BRAND_ACCENT};
  outline-offset: 2px;
}

/* ---- header ------------------------------------------------------------ */
.\${SCOPE}.topbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
}
.\${SCOPE} .brandCluster {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.\${SCOPE} .brandMark {
  display: inline-flex;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
}
.\${SCOPE} .eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .monthRow {
  display: flex;
  align-items: center;
  gap: 4px;
}
.\${SCOPE} .pageTitle {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .monthNav {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-surface);
  cursor: default;
  opacity: 0.5;
}
.\${SCOPE} .asOf {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .kpiStrip {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-inline-start: auto;
}
.\${SCOPE} .kpiTile {
  display: flex;
  min-height: 64px;
  min-width: 116px;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
}
.\${SCOPE} .kpiValue {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .kpiLabel {
  font-size: 11px;
  color: var(--color-text-secondary);
}

/* ---- workspace grid ------------------------------------------------------ */
.\${SCOPE}.workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  align-items: start;
  width: 100%;
  padding: 12px 16px 20px;
}

/* ---- calendar ------------------------------------------------------------ */
.\${SCOPE} .calendar {
  min-width: 0;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  overflow: hidden;
}
.\${SCOPE} .weekdayRow {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .weekday {
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .dayGrid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}
.\${SCOPE} .dayCell {
  display: flex;
  min-height: 128px;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .dayCell:not(:nth-child(7n + 1)) {
  border-inline-start: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .dayGrid .dayCell:nth-child(-n + 7) {
  border-top: none;
}
.\${SCOPE} .dayCell.outMonth {
  background: var(--color-background-muted);
}
.\${SCOPE} .dayCell.outMonth .dayNum {
  opacity: 0.5;
}
.\${SCOPE} .dayNum {
  align-self: flex-end;
  display: inline-flex;
  min-width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .dayCell.isToday .dayNum {
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
}

/* ---- deliverable chips — one <button> each -------------------------------- */
.\${SCOPE} .chip {
  display: flex;
  min-height: 40px;
  width: 100%;
  align-items: center;
  gap: 5px;
  padding: 4px 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  text-align: start;
  cursor: pointer;
}
.\${SCOPE} .chip[aria-pressed='true'] {
  box-shadow: inset 0 0 0 1px \${BRAND_ACCENT}, 0 0 0 2px \${BRAND_ACCENT};
}
@media (hover: hover) {
  .\${SCOPE} .chip:hover {
    background: \${BRAND_TINT};
  }
}
.\${SCOPE} .grantDot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
}
.\${SCOPE} .chipGlyph {
  display: inline-flex;
  flex-shrink: 0;
}
.\${SCOPE} .chipText {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .chipTitle {
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .chipStatus {
  overflow: hidden;
  font-size: 10px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .dotStack {
  display: none;
  gap: 4px;
  flex-wrap: wrap;
  padding-top: 2px;
}
.\${SCOPE} .statusDot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* ---- mobile agenda list (hidden at desktop widths) ------------------------- */
.\${SCOPE} .agenda {
  display: none;
  margin-top: 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px;
}
.\${SCOPE} .agendaList {
  display: flex;
  flex-direction: column;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.\${SCOPE} .agendaRow {
  display: flex;
  min-height: 48px;
  width: 100%;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  border: none;
  border-top: var(--border-width) solid var(--color-border);
  background: none;
  text-align: start;
  cursor: pointer;
}
.\${SCOPE} .agendaBody {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.\${SCOPE} .agendaTitle {
  overflow: hidden;
  font-size: 12.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .agendaMeta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .statusPill {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  white-space: nowrap;
}

/* ---- rail ------------------------------------------------------------------ */
.\${SCOPE} .rail {
  position: sticky;
  top: 12px;
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 12px;
}
.\${SCOPE} .panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  padding: 12px 14px;
}
.\${SCOPE} .sectionTitle {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
}
.\${SCOPE} .sectionHead {
  display: flex;
  align-items: center;
  gap: 8px;
}
.\${SCOPE} .sectionHint {
  margin-inline-start: auto;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* detail pane */
.\${SCOPE} .detailTitle {
  margin: 6px 0 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
}
.\${SCOPE} .detailMeta {
  margin: 4px 0 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}
.\${SCOPE} .detailAmount {
  margin: 8px 0 0;
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .reqList {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 10px 0 0;
  padding: 0;
  list-style: none;
}
.\${SCOPE} .reqRow {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 11.5px;
  line-height: 1.4;
}
.\${SCOPE} .reqRow .reqGlyph {
  display: inline-flex;
  flex-shrink: 0;
  margin-top: 1px;
}
.\${SCOPE} .reqRow.pendingReq {
  color: var(--color-text-secondary);
}
.\${SCOPE} .detailActions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.\${SCOPE} .fileButton {
  display: inline-flex;
  min-height: 40px;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: \${BRAND_ACCENT};
  color: \${BRAND_ON};
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
}
.\${SCOPE} .fileButton:disabled {
  opacity: 0.55;
  cursor: default;
}
.\${SCOPE} .undoButton {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background-body);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}
.\${SCOPE} .undoButton:disabled {
  opacity: 0.45;
  cursor: default;
}
@media (hover: hover) {
  .\${SCOPE} .undoButton:not(:disabled):hover,
  .\${SCOPE} .agendaRow:hover {
    background: \${BRAND_TINT};
  }
}
.\${SCOPE} .blockReason {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  background: \${OVERDUE_TINT};
  color: \${OVERDUE_RED};
  font-size: 11.5px;
  line-height: 1.4;
}
.\${SCOPE} .historyNote {
  margin: 10px 0 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* review lane */
.\${SCOPE} .stageList {
  display: flex;
  flex-direction: column;
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
}
.\${SCOPE} .stageRow {
  display: flex;
  min-height: 44px;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}
.\${SCOPE} .stageRow + .stageRow {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .stageLabel {
  display: flex;
  width: 108px;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  padding-top: 2px;
}
.\${SCOPE} .stageCount {
  display: inline-flex;
  min-width: 20px;
  justify-content: center;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--color-background-muted);
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .stageItems {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.\${SCOPE} .stageChiplet {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  background: var(--color-background-body);
  font-size: 11px;
}
.\${SCOPE} .stageChipletText {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .stageChipletAmount {
  flex-shrink: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .stageEmpty {
  font-size: 11px;
  color: var(--color-text-secondary);
  padding-top: 4px;
}

/* reimbursement ledger */
.\${SCOPE} .ledgerGrant {
  padding: 10px 0;
}
.\${SCOPE} .ledgerGrant + .ledgerGrant {
  border-top: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .ledgerGrantHead {
  display: flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;
}
.\${SCOPE} .ledgerCode {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ledgerName {
  min-width: 0;
  overflow: hidden;
  font-size: 11.5px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .ledgerAwarded {
  margin-inline-start: auto;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ledgerBar {
  display: flex;
  height: 10px;
  margin-top: 6px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--color-background-muted);
}
.\${SCOPE} .ledgerSeg {
  height: 100%;
}
.\${SCOPE} .ledgerFigures {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 6px;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ledgerFigures strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .legendSwatch {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-inline-end: 4px;
  border-radius: 2px;
  vertical-align: 0;
}

/* ---- a11y utility ----------------------------------------------------------- */
.\${SCOPE} .visuallyHidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------------- */
@media (max-width: 900px) {
  .\${SCOPE}.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .rail {
    position: static;
  }
}
@media (max-width: 620px) {
  .\${SCOPE} .chip {
    display: none;
  }
  .\${SCOPE} .dotStack {
    display: flex;
  }
  .\${SCOPE} .agenda {
    display: block;
  }
  .\${SCOPE} .dayCell {
    min-height: 64px;
  }
  .\${SCOPE} .kpiStrip {
    width: 100%;
    margin-inline-start: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .\${SCOPE} .detailActions {
    flex-direction: column;
  }
  .\${SCOPE} .stageLabel {
    width: 92px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .chip,
  .\${SCOPE} .ledgerSeg,
  .\${SCOPE} .fileButton,
  .\${SCOPE} .undoButton,
  .\${SCOPE} .agendaRow {
    transition: background-color 120ms ease, box-shadow 120ms ease, flex-grow 160ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// CUSTOM SVG GLYPHS — domain vocabulary a Badge cannot carry.
// ---------------------------------------------------------------------------

/** Grantline mark — a calendar page whose baseline rises into a drawn line. */
function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.5" y="4" width="15" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 2.2v3.4M14 2.2v3.4M2.5 8h15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m5.4 14.6 2.6-2.2 2.4 1.4 4-3.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Deliverable-kind glyph — report: document with rule lines; reimbursement:
 * dollar disc with an outbound arrow; certification: ribboned seal. All share
 * a 14px frame so chips and agenda rows keep one optical rhythm.
 */
function KindGlyph({kind, color}: {kind: DeliverableKind; color: string}) {
  if (kind === 'report') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{color}}>
        <path d="M3 1.5h5.2L11 4.3v8.2H3V1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        <path d="M4.8 6.4h4.4M4.8 8.6h4.4M4.8 10.8h2.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'reimbursement') {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{color}}>
        <circle cx="6" cy="7.6" r="4.6" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 5.3v4.6M7.4 6.1c-.4-.5-2.1-.7-2.4.3-.3 1 .8 1.1 1.3 1.2.6.1 1.6.3 1.3 1.3-.3.9-2 .8-2.5.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        <path d="M9.6 3.4h3m0 0-1.2-1.2M12.6 3.4l-1.2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{color}}>
      <circle cx="7" cy="5.4" r="3.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="m5.6 5.4 1 1 1.9-1.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.2 8.6 4.4 12.4l2.6-1.5 2.6 1.5-.8-3.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS — purely presentational; all state lifts to the page.
// ---------------------------------------------------------------------------

function KpiTile({value, label, tone}: {value: string; label: string; tone?: string}) {
  return (
    <div className="kpiTile">
      <span className="kpiValue" style={tone !== undefined ? {color: tone} : undefined}>
        {value}
      </span>
      <span className="kpiLabel">{label}</span>
    </div>
  );
}

function DeliverableChip({
  deliverable,
  status,
  isSelected,
  onSelect,
}: {
  deliverable: Deliverable;
  status: DisplayStatus;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const grant = GRANT_BY_ID.get(deliverable.grantId);
  const meta = STATUS_META[status];
  if (grant === undefined) {
    return null;
  }
  return (
    <button
      type="button"
      className="chip"
      style={{background: isSelected ? undefined : meta.tint}}
      aria-pressed={isSelected}
      aria-label={\`\${deliverable.title} — \${grant.code}, \${meta.label}, due \${deliverable.dueLabel}\${
        deliverable.amount !== undefined ? \`, \${formatMoney(deliverable.amount)}\` : ''
      }\`}
      onClick={() => onSelect(deliverable.id)}>
      <span className="grantDot" style={{background: grant.color}} aria-hidden="true" />
      <span className="chipGlyph">
        <KindGlyph kind={deliverable.kind} color={meta.color} />
      </span>
      <span className="chipText">
        <span className="chipTitle">{deliverable.title}</span>
        <span className="chipStatus" style={{color: meta.color}}>
          {meta.label}
          {deliverable.amount !== undefined ? \` · \${formatMoney(deliverable.amount)}\` : ''}
        </span>
      </span>
    </button>
  );
}

function GrantLedgerRow({ledger}: {ledger: GrantLedger}) {
  const {grant, paid, withFunder, remaining} = ledger;
  return (
    <div className="ledgerGrant">
      <div className="ledgerGrantHead">
        <span className="ledgerCode" style={{color: grant.color}}>
          {grant.code}
        </span>
        <span className="ledgerName" title={\`\${grant.name} — \${grant.funder}\`}>
          {grant.name}
        </span>
        <span className="ledgerAwarded">{formatMoney(grant.awarded)}</span>
      </div>
      {/* Stacked bar: paid / with-funder / remaining, proportional to award. */}
      <div className="ledgerBar" aria-hidden="true">
        <span className="ledgerSeg" style={{flexGrow: paid, backgroundColor: ACCEPTED_GREEN}} />
        <span className="ledgerSeg" style={{flexGrow: withFunder, backgroundColor: REVIEW_VIOLET}} />
        <span className="ledgerSeg" style={{flexGrow: remaining, backgroundColor: 'transparent'}} />
      </div>
      <div className="ledgerFigures">
        <span>
          <span className="legendSwatch" style={{background: ACCEPTED_GREEN}} aria-hidden="true" />
          Reimbursed <strong>{formatMoney(paid)}</strong>
        </span>
        <span>
          <span className="legendSwatch" style={{background: REVIEW_VIOLET}} aria-hidden="true" />
          With funder <strong>{formatMoney(withFunder)}</strong>
        </span>
        <span>
          Remaining <strong>{formatMoney(remaining)}</strong>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner: the stored-status record. Everything derives.
// ---------------------------------------------------------------------------

type UndoRecord = {
  deliverableId: string;
  prev: StoredStatus;
};

export default function GrantReportingCalendarTemplate() {
  const [statuses, setStatuses] = useState<StatusMap>(INITIAL_STATUSES);
  const [selectedId, setSelectedId] = useState<string>('r7');
  const [undoStack, setUndoStack] = useState<readonly UndoRecord[]>([]);
  const [announcement, setAnnouncement] = useState('');
  // Deterministic sequence for future extension points (kept ref-stable so
  // repeated File/Undo cycles never re-key React lists).
  const fileSeq = useRef(0);

  const byDay = useMemo(() => {
    const map = new Map<number, Deliverable[]>();
    for (const deliverable of DELIVERABLES) {
      if (deliverable.calendarDay === null) {
        continue;
      }
      const list = map.get(deliverable.calendarDay) ?? [];
      list.push(deliverable);
      map.set(deliverable.calendarDay, list);
    }
    return map;
  }, []);

  const ledgers = useMemo(() => GRANTS.map(grant => deriveLedger(grant, statuses)), [statuses]);

  const money = useMemo(() => {
    let readyToFile = 0;
    let withFunder = 0;
    let openCount = 0;
    let overdueCount = 0;
    for (const deliverable of DELIVERABLES) {
      const stored = statuses[deliverable.id] ?? 'open';
      const display = displayStatus(deliverable, stored);
      if (stored === 'open' || stored === 'blocked') {
        openCount += 1;
      }
      if (display === 'overdue') {
        overdueCount += 1;
      }
      if (
        deliverable.kind === 'reimbursement' &&
        deliverable.amount !== undefined &&
        stored === 'open' &&
        allRequirementsReady(deliverable)
      ) {
        readyToFile += deliverable.amount;
      }
    }
    for (const ledger of ledgers) {
      withFunder += ledger.withFunder;
    }
    const awarded = GRANTS.reduce((sum, grant) => sum + grant.awarded, 0);
    return {readyToFile, withFunder, openCount, overdueCount, awarded};
  }, [statuses, ledgers]);

  const laneItems = useMemo(() => {
    const map: Record<LaneStage, Deliverable[]> = {filed: [], review: [], accepted: [], paid: []};
    for (const deliverable of DELIVERABLES) {
      const stored = statuses[deliverable.id] ?? 'open';
      if (stored === 'filed' || stored === 'review' || stored === 'accepted' || stored === 'paid') {
        map[stored].push(deliverable);
      }
    }
    return map;
  }, [statuses]);

  const agendaItems = useMemo(
    () =>
      DELIVERABLES.filter(deliverable => deliverable.calendarDay !== null).sort(
        (a, b) => (a.calendarDay ?? 0) - (b.calendarDay ?? 0),
      ),
    [],
  );

  const selected = DELIVERABLE_BY_ID.get(selectedId) ?? DELIVERABLES[0];
  const selectedStored = statuses[selected.id] ?? 'open';
  const selectedDisplay = displayStatus(selected, selectedStored);
  const selectedMeta = STATUS_META[selectedDisplay];
  const selectedGrant = GRANT_BY_ID.get(selected.grantId);
  const selectedReady = allRequirementsReady(selected);
  const canFile = selectedStored === 'open' && selectedReady;
  const outstanding = selected.requirements.filter(requirement => !requirement.ready).length;

  // ---- mutations -------------------------------------------------------------
  const handleFile = () => {
    if (!canFile || selectedGrant === undefined) {
      return;
    }
    fileSeq.current += 1;
    setStatuses(current => ({...current, [selected.id]: 'filed'}));
    setUndoStack(current => [{deliverableId: selected.id, prev: selectedStored}, ...current]);
    const parts = [
      \`\${selected.title} filed with \${selectedGrant.funder} on \${TODAY_STAMP}.\`,
      'It enters the funder-review lane at Filed.',
    ];
    if (selected.amount !== undefined) {
      parts.push(
        \`\${formatMoney(selected.amount)} moves from ready-to-file into \${selectedGrant.code}'s with-funder balance.\`,
      );
    }
    setAnnouncement(parts.join(' '));
  };

  const handleUndo = () => {
    const record = undoStack[0];
    if (record === undefined) {
      return;
    }
    setStatuses(current => ({...current, [record.deliverableId]: record.prev}));
    setUndoStack(current => current.slice(1));
    const deliverable = DELIVERABLE_BY_ID.get(record.deliverableId);
    setAnnouncement(
      \`Undid filing\${deliverable !== undefined ? \` of \${deliverable.title}\` : ''} — status, review lane, and ledger restored.\`,
    );
  };

  // ---- file-button copy: reasoned states, never a bare disabled ---------------
  let fileLabel = 'File deliverable';
  let fileReason: string | null = null;
  if (selected.kind === 'reimbursement' && selected.amount !== undefined) {
    fileLabel = \`File & request \${formatMoney(selected.amount)}\`;
  }
  if (selectedStored === 'blocked') {
    fileReason = 'Blocked — clear the missing requirements before filing.';
  } else if (selectedStored !== 'open') {
    fileReason = \`Already \${selectedMeta.label.toLowerCase()} — nothing left to file here.\`;
  } else if (!selectedReady) {
    fileReason = \`\${outstanding} requirement\${outstanding === 1 ? '' : 's'} outstanding — File unlocks when every item is ready.\`;
  }

  return (
    <div style={{height: '100dvh', width: '100%'}}>
      <Layout height="fill">
        <style>{TEMPLATE_CSS}</style>
        <LayoutHeader>
          <div className={\`\${SCOPE} topbar\`}>
            <div className="brandCluster">
              <span className="brandMark">
                <BrandMark />
              </span>
              <div>
                <p className="eyebrow">Grantline / Compliance</p>
                <div className="monthRow">
                  <span className="monthNav" aria-hidden="true" title="Demo window is July 2026">
                    <Icon icon={ChevronLeftIcon} size="xsm" />
                  </span>
                  <h1 className="pageTitle">{MONTH_LABEL}</h1>
                  <span className="monthNav" aria-hidden="true" title="Demo window is July 2026">
                    <Icon icon={ChevronRightIcon} size="xsm" />
                  </span>
                </div>
                <p className="asOf">As of {AS_OF_LABEL} · {GRANTS.length} active grants</p>
              </div>
            </div>
            <div className="kpiStrip" role="group" aria-label="Portfolio reporting metrics">
              <KpiTile value={String(money.openCount)} label="Open deliverables" />
              <KpiTile
                value={String(money.overdueCount)}
                label="Overdue"
                tone={money.overdueCount > 0 ? OVERDUE_RED : ACCEPTED_GREEN}
              />
              <KpiTile value={formatMoney(money.readyToFile)} label="Ready to file" tone={BRAND_ACCENT} />
              <KpiTile value={formatMoney(money.withFunder)} label="With funder" tone={REVIEW_VIOLET} />
              <KpiTile value={formatMoney(money.awarded)} label="Portfolio awarded" />
            </div>
          </div>
        </LayoutHeader>
        <LayoutContent>
          <div className={\`\${SCOPE} workspace\`}>
            <div aria-live="polite" className="visuallyHidden">
              {announcement}
            </div>

            {/* ---- calendar column ---- */}
            <div style={{minWidth: 0}}>
              <div className="calendar" role="group" aria-label={\`Deliverable calendar, \${MONTH_LABEL}\`}>
                <div className="weekdayRow" aria-hidden="true">
                  {WEEKDAY_LABELS.map(label => (
                    <span key={label} className="weekday">
                      {label}
                    </span>
                  ))}
                </div>
                <div className="dayGrid">
                  {CALENDAR_CELLS.map(cell => {
                    const dayDeliverables =
                      cell.julyDay !== null ? byDay.get(cell.julyDay) ?? [] : [];
                    const isToday = cell.julyDay === TODAY_DAY;
                    return (
                      <div
                        key={cell.key}
                        className={\`dayCell\${cell.julyDay === null ? ' outMonth' : ''}\${
                          isToday ? ' isToday' : ''
                        }\`}>
                        <span className="dayNum" aria-hidden="true">
                          {cell.dayLabel}
                        </span>
                        {dayDeliverables.map(deliverable => (
                          <DeliverableChip
                            key={deliverable.id}
                            deliverable={deliverable}
                            status={displayStatus(deliverable, statuses[deliverable.id] ?? 'open')}
                            isSelected={deliverable.id === selectedId}
                            onSelect={setSelectedId}
                          />
                        ))}
                        {/* ≤620px: chips collapse to these aria-hidden dots;
                            the agenda list below is the accessible path. */}
                        {dayDeliverables.length > 0 && (
                          <span className="dotStack" aria-hidden="true">
                            {dayDeliverables.map(deliverable => (
                              <span
                                key={deliverable.id}
                                className="statusDot"
                                style={{
                                  background:
                                    STATUS_META[
                                      displayStatus(
                                        deliverable,
                                        statuses[deliverable.id] ?? 'open',
                                      )
                                    ].color,
                                }}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ---- mobile agenda (display: none above 620px) ---- */}
              <section className="agenda" aria-label="July deliverables agenda">
                <div className="sectionHead">
                  <h2 className="sectionTitle">July deliverables</h2>
                  <span className="sectionHint">{agendaItems.length} scheduled</span>
                </div>
                <ul className="agendaList">
                  {agendaItems.map(deliverable => {
                    const stored = statuses[deliverable.id] ?? 'open';
                    const display = displayStatus(deliverable, stored);
                    const meta = STATUS_META[display];
                    const grant = GRANT_BY_ID.get(deliverable.grantId);
                    return (
                      <li key={deliverable.id}>
                        <button
                          type="button"
                          className="agendaRow"
                          aria-pressed={deliverable.id === selectedId}
                          onClick={() => setSelectedId(deliverable.id)}>
                          <span
                            className="grantDot"
                            style={{background: grant?.color}}
                            aria-hidden="true"
                          />
                          <span className="agendaBody">
                            <span className="agendaTitle">{deliverable.title}</span>
                            <span className="agendaMeta">
                              {grant?.code} · due {deliverable.dueLabel}
                              {deliverable.amount !== undefined
                                ? \` · \${formatMoney(deliverable.amount)}\`
                                : ''}
                            </span>
                          </span>
                          <span
                            className="statusPill"
                            style={{background: meta.tint, color: meta.color}}>
                            {meta.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>

            {/* ---- rail ---- */}
            <div className="rail">
              {/* detail pane */}
              <section className="panel" aria-label={\`Deliverable detail: \${selected.title}\`}>
                <div className="sectionHead">
                  <h2 className="sectionTitle">Deliverable</h2>
                  <span
                    className="statusPill"
                    style={{
                      background: selectedMeta.tint,
                      color: selectedMeta.color,
                      marginInlineStart: 'auto',
                    }}>
                    {selectedMeta.label}
                  </span>
                </div>
                <h3 className="detailTitle">{selected.title}</h3>
                <p className="detailMeta">
                  {selectedGrant?.code} · {selectedGrant?.name}
                  <br />
                  <span style={{display: 'inline-flex', verticalAlign: '-2px', marginInlineEnd: 5}}>
                    <Icon icon={LandmarkIcon} size="xsm" color="secondary" />
                  </span>
                  {selectedGrant?.funder}
                  <br />
                  {KIND_LABEL[selected.kind]} · due {selected.dueLabel}
                  {selected.dueInDays < 0
                    ? \` (\${Math.abs(selected.dueInDays)}d ago)\`
                    : \` (in \${selected.dueInDays}d)\`}
                </p>
                {selected.amount !== undefined && (
                  <p className="detailAmount">{formatMoney(selected.amount)}</p>
                )}
                <ul className="reqList">
                  {selected.requirements.map(requirement => (
                    <li
                      key={requirement.label}
                      className={\`reqRow\${requirement.ready ? '' : ' pendingReq'}\`}>
                      <span
                        className="reqGlyph"
                        style={{color: requirement.ready ? ACCEPTED_GREEN : DUE_AMBER}}>
                        <Icon
                          icon={requirement.ready ? CheckIcon : CircleAlertIcon}
                          size="xsm"
                          color="inherit"
                        />
                      </span>
                      {requirement.label}
                    </li>
                  ))}
                </ul>
                {selectedStored === 'blocked' && (
                  <div className="blockReason">
                    <span style={{display: 'inline-flex', flexShrink: 0, marginTop: 1}}>
                      <Icon icon={LockIcon} size="xsm" color="inherit" />
                    </span>
                    Filing is locked: 2 travel receipts totaling $1,140.20 are missing from the
                    backup packet.
                  </div>
                )}
                {selected.historyNote !== undefined && (
                  <p className="historyNote">{selected.historyNote}</p>
                )}
                <div className="detailActions">
                  <button
                    type="button"
                    className="fileButton"
                    disabled={!canFile}
                    title={fileReason ?? undefined}
                    onClick={handleFile}>
                    <Icon icon={SendIcon} size="xsm" color="inherit" />
                    {fileLabel}
                  </button>
                  <button
                    type="button"
                    className="undoButton"
                    disabled={undoStack.length === 0}
                    onClick={handleUndo}>
                    <Icon icon={Undo2Icon} size="xsm" />
                    Undo
                  </button>
                </div>
                {fileReason !== null && <p className="historyNote">{fileReason}</p>}
              </section>

              {/* funder-review lane */}
              <section className="panel" aria-label="Funder review lane">
                <div className="sectionHead">
                  <h2 className="sectionTitle">Funder review lane</h2>
                  <span className="sectionHint">
                    {LANE_STAGES.reduce((sum, stage) => sum + laneItems[stage].length, 0)} items
                  </span>
                </div>
                <ul className="stageList">
                  {LANE_STAGES.map(stage => {
                    const meta = STATUS_META[stage];
                    const items = laneItems[stage];
                    return (
                      <li key={stage} className="stageRow">
                        <span className="stageLabel" style={{color: meta.color}}>
                          {meta.label}
                          <span className="stageCount">{items.length}</span>
                        </span>
                        <span className="stageItems">
                          {items.length === 0 ? (
                            <span className="stageEmpty">
                              {stage === 'filed' ? 'Nothing newly filed — file a deliverable to see it land here.' : '—'}
                            </span>
                          ) : (
                            items.map(deliverable => {
                              const grant = GRANT_BY_ID.get(deliverable.grantId);
                              return (
                                <span key={deliverable.id} className="stageChiplet">
                                  <span
                                    className="grantDot"
                                    style={{background: grant?.color}}
                                    aria-hidden="true"
                                  />
                                  <span className="stageChipletText">{deliverable.title}</span>
                                  {deliverable.amount !== undefined && (
                                    <span className="stageChipletAmount">
                                      {formatMoney(deliverable.amount)}
                                    </span>
                                  )}
                                </span>
                              );
                            })
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* reimbursement ledger */}
              <section className="panel" aria-label="Reimbursement ledger">
                <div className="sectionHead">
                  <h2 className="sectionTitle">Reimbursement ledger</h2>
                  <span className="sectionHint">FY26</span>
                </div>
                {ledgers.map(ledger => (
                  <GrantLedgerRow key={ledger.grant.id} ledger={ledger} />
                ))}
                <p className="historyNote">
                  Ready to file {formatMoney(money.readyToFile)} · with funder{' '}
                  {formatMoney(money.withFunder)}. Filing a reimbursement moves its exact amount
                  between these columns — watch {selectedGrant?.code ?? 'EDA-2412'}
                  &apos;s bar when you file.
                </p>
              </section>
            </div>
          </div>
        </LayoutContent>
      </Layout>
    </div>
  );
}
`;export{e as default};