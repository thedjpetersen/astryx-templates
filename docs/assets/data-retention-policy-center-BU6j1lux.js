var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Retainer governance picture for
 *   Nortech Home on a FIXED demo "today" of Wed Jul 15 2026. Nine retention
 *   scopes in four groups, three legal holds, six July purge windows, and
 *   four purge-exception requests (three pending + one pre-denied).
 *   Hand-checked ledger at first render:
 *     Records governed: 1,284,300 + 862,110 + 214,800 + 18,240 + 96,500 +
 *       9,412,000 + 122,400 + 402,300 + 8,050 = 12,420,700.
 *     Past retention (overdue): 41,200 + 96,400 + 58,300 + 1,120 + 0 +
 *       388,000 + 9,850 + 12,700 + 0 = 607,570.
 *     Blocked by holds (records-at-risk): chat 96,400 + calls 58,300 +
 *       crash 9,850 + invoices 12,700 = 177,250 — approvals subtract in
 *       exception order: 177,250 → 80,850 (EX-341) → 22,550 (EX-342) →
 *       12,700 (EX-347); fin-inv stays held (EX-338 was denied Jul 9).
 *     Window W-2609 (Jul 18, chat+calls) eligible when clear: 96,400 +
 *       58,300 = 154,700; W-2611 (Jul 25) eligible: 388,000 + 1,120 =
 *       389,120. Completed runs cross-check the tree: W-2607 purged 4,180
 *       so emp-payroll overdue is 0; W-2608 purged 38,600 of cd-tickets
 *       with 41,200 re-queued to Aug 8 (the row's remaining overdue).
 *     Next CLEAR window: Jul 25 at first render (Jul 18 and Jul 22 are
 *       hold-blocked, Jul 31 stays blocked after the EX-338 denial); the
 *       stat flips to Jul 18 the moment BOTH LH-011 releases are approved.
 *     Calendar geometry: Jul 1 2026 is a Wednesday ⇒ Sun-start grid with 3
 *       leading blanks, 31 days, 1 trailing blank (5 rows × 7).
 *   No clock reads, no randomness, no timers, no network assets; the decision
 *   log clock is a frozen 15:04 start advanced +3 min per session decision.
 * @output Retainer — Data Retention Policy Center: a records-governance
 *   console. A 56px brand header (strapped-archive mark, tenant title,
 *   pending-exception chip) over a 44px derived stat strip (records
 *   governed · past retention · blocked by holds · next clear window), then
 *   a three-region body: left, a 288px policy scope tree (rule, record
 *   count, overdue count, legal-hold gavel badges) above the legal-hold
 *   ledger; center, the July 2026 purge-window calendar — day cells carry
 *   window pills whose overlay badge counts ACTIVE holds — over a detail
 *   bar for the selected window or scope; right, a 316px purge-exception
 *   queue with approve/deny actions and a decision log. Signature move:
 *   Approve a purge exception → the scope's gavel badge lifts to a green
 *   "released" chip in the tree, the calendar window's hold badge
 *   decrements (and the cell unblocks at zero), records-at-risk and the
 *   next-clear-window stat re-derive, the hold ledger's release tally
 *   moves, and the decision logs with snapshot-exact Undo — one render, no
 *   confirms, no timers.
 * @position Page template; emitted by \`astryx template data-retention-policy-center\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader (brand +
 *   pending chip) | content column: stat strip 44 → body grid
 *   [288px | minmax(0,1fr) | 316px] (hand-rolled grid so the media query
 *   can restack it — the DS grid would inline the track list). Each body
 *   column scrolls independently; the center column stacks calendar over
 *   the detail bar (min 112, flex-shrink 0).
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): 288 +
 *   316 rails leave ≈440px for the calendar — 7 columns at ≈58px cells,
 *   which the 64px-min rows are designed around. Nothing squeezes.
 * - <=900px: the grid restacks to one column (tree → calendar → detail →
 *   exceptions) and the page scrolls as a whole; inner scrollers release
 *   their max-heights.
 * - <=600px (390px embed): day cells drop their window id text and keep
 *   only the status glyph + badge (subtraction, not squeeze); exception
 *   card actions wrap; every interactive row/cell keeps a >=40px hit
 *   target (tree rows are 40, cells 64, buttons 40).
 * Container policy: dense governance console — rows, rails, a calendar
 *   grid, and one detail bar; no Cards. Tree scope rows, calendar window
 *   cells, and hold rows are real <button>s (aria-pressed marks the
 *   selection). All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Retainer
 *   umber): light-dark(#92400E, #E5A54B) — #92400E on #FFFFFF ≈ 6.3:1,
 *   #E5A54B on #1C1C1E ≈ 8.0:1 — used for the mark, today's ring,
 *   scheduled-clear window pills, and selection accents. State pairs with
 *   math at the declaration: legal-hold red light-dark(#B91C1C, #F87171)
 *   (≈5.9:1 / ≈7.2:1), released/clear green light-dark(#15803D, #4ADE80)
 *   (≈5.0:1 / ≈9.6:1). Tints are sub-16% alpha washes under text that
 *   keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · stat strip 44 ·
 *   left rail 288 · tree rows 40 · group headers 32 · hold rows 56 ·
 *   weekday row 24 · day cells 64 min · window detail bar min 112 · right
 *   rail 316 · action buttons 40 · badges 18 · 16px page gutters · 12px
 *   pane gaps · focus ring 2px.
 * Fixture policy: one state owner — a decisions map (exceptionId →
 *   approved/denied) plus its ordered session log — drives EVERYTHING
 *   derived: per-scope hold status, window blocked counts, records-at-risk,
 *   the next-clear-window stat, hold-ledger tallies, queue membership, and
 *   the log itself. Undo deletes the latest decision and every surface
 *   re-derives in the same render.
 */

import {useState} from 'react';

import {
  ArchiveIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  GavelIcon,
  HistoryIcon,
  ScaleIcon,
  Trash2Icon,
  Undo2Icon,
  XCircleIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-data-retention-policy-center';

// THE quarantined Retainer brand umber. #92400E on #FFFFFF ≈ 6.3:1 (passes
// 4.5:1 for the 11–13px pill text it colors); #E5A54B on a ~#1C1C1E dark
// surface ≈ 8.0:1. Also today's ring and scheduled-clear window pills.
const BRAND = 'light-dark(#92400E, #E5A54B)';
// Text/glyph ON a solid brand fill (selected window pill): #FFFFFF on
// #92400E ≈ 6.3:1; #2A1B04 on #E5A54B ≈ 7.4:1 (white on #E5A54B fails ~1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #2A1B04)';
// Brand wash: 10% / 14% alpha surface nudge; text on it keeps its own pair.
const BRAND_TINT = 'light-dark(rgba(146, 64, 14, 0.10), rgba(229, 165, 75, 0.14))';
// Legal-hold red: #B91C1C on #FFFFFF ≈ 5.9:1; #F87171 on #1C1C1E ≈ 7.2:1.
const HOLD = 'light-dark(#B91C1C, #F87171)';
const HOLD_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
// Released / clear green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const CLEAR = 'light-dark(#15803D, #4ADE80)';
const CLEAR_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ---------------------------------------------------------------------------
// FIXTURES — Nortech Home records governance, frozen at Wed Jul 15 2026.
// Every aggregate in the header ledger re-derives live from these rows.
// ---------------------------------------------------------------------------

type ScopeId =
  | 'cd-tickets'
  | 'cd-chat'
  | 'cd-calls'
  | 'emp-hr'
  | 'emp-payroll'
  | 'tel-events'
  | 'tel-crash'
  | 'fin-inv'
  | 'fin-tax';

type HoldId = 'lh-011' | 'lh-003' | 'lh-019';

interface RetentionScope {
  id: ScopeId;
  name: string;
  rule: string;
  records: number;
  /** Records past their retention deadline right now. */
  overdue: number;
  holdId?: HoldId;
}

interface ScopeGroup {
  id: string;
  label: string;
  scopes: RetentionScope[];
}

const SCOPE_GROUPS: ScopeGroup[] = [
  {
    id: 'grp-customer',
    label: 'Customer data',
    scopes: [
      {
        id: 'cd-tickets',
        name: 'Support tickets',
        rule: '3y after close',
        records: 1_284_300,
        overdue: 41_200,
      },
      {
        id: 'cd-chat',
        name: 'Chat transcripts',
        rule: '18m after session',
        records: 862_110,
        overdue: 96_400,
        holdId: 'lh-011',
      },
      {
        id: 'cd-calls',
        name: 'Call recordings',
        rule: '12m after call',
        records: 214_800,
        overdue: 58_300,
        holdId: 'lh-011',
      },
    ],
  },
  {
    id: 'grp-employee',
    label: 'Employee data',
    scopes: [
      {
        id: 'emp-hr',
        name: 'HR case files',
        rule: '7y after separation',
        records: 18_240,
        overdue: 1_120,
      },
      {
        id: 'emp-payroll',
        name: 'Payroll stubs',
        rule: '7y after issue',
        records: 96_500,
        overdue: 0,
      },
    ],
  },
  {
    id: 'grp-telemetry',
    label: 'Product telemetry',
    scopes: [
      {
        id: 'tel-events',
        name: 'Event logs',
        rule: '13m rolling',
        records: 9_412_000,
        overdue: 388_000,
      },
      {
        id: 'tel-crash',
        name: 'Crash dumps',
        rule: '6m rolling',
        records: 122_400,
        overdue: 9_850,
        holdId: 'lh-019',
      },
    ],
  },
  {
    id: 'grp-financial',
    label: 'Financial',
    scopes: [
      {
        id: 'fin-inv',
        name: 'Invoices',
        rule: '10y after issue',
        records: 402_300,
        overdue: 12_700,
        holdId: 'lh-003',
      },
      {
        id: 'fin-tax',
        name: 'Tax filings',
        rule: 'permanent',
        records: 8_050,
        overdue: 0,
      },
    ],
  },
];

const ALL_SCOPES: RetentionScope[] = SCOPE_GROUPS.flatMap(
  group => group.scopes,
);

interface LegalHold {
  id: HoldId;
  ref: string;
  shortRef: string;
  matter: string;
  custodian: string;
  scopeIds: ScopeId[];
}

// The 50-char Delgado matter line is the deliberate truncation stress row.
const HOLDS: LegalHold[] = [
  {
    id: 'lh-011',
    ref: 'LH-2024-011',
    shortRef: 'LH-011',
    matter: 'Delgado v. Nortech Ltd. — N.D. Cal. 3:24-cv-04412',
    custodian: 'Meyer & Bloch LLP',
    scopeIds: ['cd-chat', 'cd-calls'],
  },
  {
    id: 'lh-003',
    ref: 'LH-2025-003',
    shortRef: 'LH-003',
    matter: 'FY23 state tax audit — Franchise Tax Board',
    custodian: 'Internal tax counsel',
    scopeIds: ['fin-inv'],
  },
  {
    id: 'lh-019',
    ref: 'LH-2026-019',
    shortRef: 'LH-019',
    matter: 'Crashloop incident review (eng litigation hold)',
    custodian: 'Meyer & Bloch LLP',
    scopeIds: ['tel-crash'],
  },
];

interface PurgeException {
  id: string;
  holdId: HoldId;
  scopeId: ScopeId;
  /** Held-overdue records this release would unblock. */
  records: number;
  requestedBy: string;
  requestedOn: string;
  basis: string;
}

const PENDING_EXCEPTIONS: PurgeException[] = [
  {
    id: 'EX-341',
    holdId: 'lh-011',
    scopeId: 'cd-chat',
    records: 96_400,
    requestedBy: 'A. Okafor · Legal Ops',
    requestedOn: 'Jul 13',
    basis:
      'Stipulated order (Dkt. 84) narrows discovery to post-2023 sessions; transcripts past retention fall outside the preserved class.',
  },
  {
    id: 'EX-342',
    holdId: 'lh-011',
    scopeId: 'cd-calls',
    records: 58_300,
    requestedBy: 'A. Okafor · Legal Ops',
    requestedOn: 'Jul 14',
    basis:
      'Outside-counsel memo M-2216 extends the Dkt. 84 carve-out to call recordings; audio past the 12m rule is releasable.',
  },
  {
    id: 'EX-347',
    holdId: 'lh-019',
    scopeId: 'tel-crash',
    records: 9_850,
    requestedBy: 'D. Reyes · SRE governance',
    requestedOn: 'Jul 12',
    basis:
      'Incident review closed Jul 10; counsel drafted the release — no claim was filed within the notice period.',
  },
];

/** Pre-session decision — shown in the log, not undoable in this session. */
const RESOLVED_FIXTURE = {
  id: 'EX-338',
  holdRef: 'LH-2025-003',
  scopeName: 'Invoices',
  records: 12_700,
  verdict: 'denied' as const,
  decidedOn: 'Jul 9',
  decidedBy: 'R. Whitfield · Deputy GC',
  reason: 'Audit fieldwork extended to Sep 30 — hold must stand.',
};

interface PurgeWindow {
  id: string;
  /** Day of July 2026 (1–31). */
  day: number;
  scopeIds: ScopeId[];
  kind: 'completed' | 'scheduled';
  purged?: number;
  note?: string;
}

const WINDOWS: PurgeWindow[] = [
  {
    id: 'W-2607',
    day: 3,
    scopeIds: ['emp-payroll'],
    kind: 'completed',
    purged: 4_180,
  },
  {
    id: 'W-2608',
    day: 11,
    scopeIds: ['cd-tickets'],
    kind: 'completed',
    purged: 38_600,
    note: '41,200 re-queued to Aug 8',
  },
  {id: 'W-2609', day: 18, scopeIds: ['cd-chat', 'cd-calls'], kind: 'scheduled'},
  {id: 'W-2610', day: 22, scopeIds: ['tel-crash'], kind: 'scheduled'},
  {
    id: 'W-2611',
    day: 25,
    scopeIds: ['tel-events', 'emp-hr'],
    kind: 'scheduled',
  },
  {
    id: 'W-2612',
    day: 31,
    scopeIds: ['fin-inv'],
    kind: 'scheduled',
    note: 'EX-338 denied Jul 9 — remains blocked',
  },
];

// July 2026: Jul 1 is a Wednesday ⇒ Sun-start grid has 3 leading blanks,
// 31 days, 1 trailing blank (5 rows × 7). Fixed demo "today" is Jul 15.
const TODAY_DAY = 15;
const LEADING_BLANKS = 3;
const DAYS_IN_MONTH = 31;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Frozen session clock for the decision log: 15:04 start, +3 min per
// session decision. Pure arithmetic — never a clock read.
const SESSION_CLOCK_START_MIN = 15 * 60 + 4;
const SESSION_CLOCK_STEP_MIN = 3;

// ---------------------------------------------------------------------------
// DERIVATION HELPERS — every displayed aggregate re-derives from the row set
// plus the decisions map, so no surface can drift from the fixtures.
// ---------------------------------------------------------------------------

type Verdict = 'approved' | 'denied';
type Decisions = Record<string, Verdict | undefined>;

type ScopeHoldState =
  | {kind: 'none'}
  | {kind: 'held'; hold: LegalHold}
  | {kind: 'released'; hold: LegalHold; exceptionId: string};

function scopeOf(id: ScopeId): RetentionScope {
  return ALL_SCOPES.find(scope => scope.id === id) ?? ALL_SCOPES[0];
}

function holdOf(id: HoldId): LegalHold {
  return HOLDS.find(hold => hold.id === id) ?? HOLDS[0];
}

function fmtInt(value: number): string {
  return value.toLocaleString('en-US');
}

/** Session log clock: frozen 15:04 start advanced +3 min per decision. */
function sessionClockLabel(eventIndex: number): string {
  const total = SESSION_CLOCK_START_MIN + eventIndex * SESSION_CLOCK_STEP_MIN;
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}\`;
}

/**
 * A scope's hold state under the current decisions: a hold is RELEASED for
 * a scope iff a pending exception targeting that (hold, scope) pair has
 * been approved this session. Denials leave the hold standing.
 */
function scopeHoldState(scopeId: ScopeId, decisions: Decisions): ScopeHoldState {
  const scope = scopeOf(scopeId);
  if (scope.holdId === undefined) {
    return {kind: 'none'};
  }
  const hold = holdOf(scope.holdId);
  const release = PENDING_EXCEPTIONS.find(
    exception =>
      exception.scopeId === scopeId &&
      exception.holdId === scope.holdId &&
      decisions[exception.id] === 'approved',
  );
  return release === undefined
    ? {kind: 'held', hold}
    : {kind: 'released', hold, exceptionId: release.id};
}

/** Count of ACTIVE holds over a window's scope batch. */
function windowActiveHolds(window: PurgeWindow, decisions: Decisions): number {
  return window.scopeIds.filter(
    scopeId => scopeHoldState(scopeId, decisions).kind === 'held',
  ).length;
}

type WindowStatus = 'completed' | 'blocked' | 'clear';

function windowStatus(window: PurgeWindow, decisions: Decisions): WindowStatus {
  if (window.kind === 'completed') {
    return 'completed';
  }
  return windowActiveHolds(window, decisions) > 0 ? 'blocked' : 'clear';
}

/** Overdue records a scheduled window would purge once fully clear. */
function windowEligible(window: PurgeWindow): number {
  return window.scopeIds.reduce(
    (sum, scopeId) => sum + scopeOf(scopeId).overdue,
    0,
  );
}

/** Records past retention but blocked by an ACTIVE hold (records-at-risk). */
function recordsAtRisk(decisions: Decisions): number {
  return ALL_SCOPES.reduce(
    (sum, scope) =>
      scopeHoldState(scope.id, decisions).kind === 'held'
        ? sum + scope.overdue
        : sum,
    0,
  );
}

/** First scheduled window after today with zero active holds. */
function nextClearWindow(decisions: Decisions): PurgeWindow | undefined {
  return WINDOWS.find(
    window =>
      window.kind === 'scheduled' &&
      window.day > TODAY_DAY &&
      windowStatus(window, decisions) === 'clear',
  );
}

const TOTAL_RECORDS = ALL_SCOPES.reduce((sum, scope) => sum + scope.records, 0);
const TOTAL_OVERDUE = ALL_SCOPES.reduce((sum, scope) => sum + scope.overdue, 0);

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-data-retention-policy-center.
// Density grid (verbatim): header 56 · stat strip 44 · left rail 288 · tree
// rows 40 · group headers 32 · hold rows 56 · weekday row 24 · day cells 64
// min · window detail bar min 112 · right rail 316 · action buttons 40 ·
// badges 18 · 16px page gutters · 12px pane gaps · focus ring 2px.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .rpc-focusable:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: -2px;
}
.\${SCOPE} .rpc-num {
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .rpc-mono {
  font-family: \${MONO_FONT};
}
.\${SCOPE} .rpc-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.\${SCOPE} .rpc-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${BRAND};
}
.\${SCOPE} .rpc-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- stat strip: 44px of derived governance chips ------------------------- */
.\${SCOPE} .rpc-stats {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
  white-space: nowrap;
}
.\${SCOPE} .rpc-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .rpc-stat strong {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
}
.\${SCOPE} .rpc-stat--risk strong {
  color: \${HOLD};
}
.\${SCOPE} .rpc-stat--clear strong {
  color: \${CLEAR};
}
/* --- body grid: 288 | fill | 316 ------------------------------------------- */
/* Hand-rolled grid (not the DS grid) so the <=900px media query can restack
   the three panes — the DS grid would inline the track list. */
.\${SCOPE} .rpc-body {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 288px minmax(0, 1fr) 316px;
}
.\${SCOPE} .rpc-pane {
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .rpc-pane + .rpc-pane {
  border-inline-start: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .rpc-pane-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.\${SCOPE} .rpc-pane-title {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-1);
}
/* --- policy scope tree: 32px group headers, 40px scope rows ---------------- */
.\${SCOPE} .rpc-group-head {
  min-height: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  padding: 0 var(--spacing-3);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpc-scope-row {
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 2px var(--spacing-3) 2px var(--spacing-4);
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: start;
  min-width: 0;
}
.\${SCOPE} .rpc-scope-row[aria-pressed='true'] {
  background: \${BRAND_TINT};
  box-shadow: inset 2px 0 0 0 \${BRAND};
}
.\${SCOPE} .rpc-scope-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .rpc-scope-name {
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .rpc-scope-rule {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .rpc-scope-counts {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;
}
.\${SCOPE} .rpc-scope-records {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .rpc-scope-overdue {
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpc-scope-overdue--held {
  color: \${HOLD};
}
/* Hold / released badges: 18px pills shared by tree, calendar, and detail. */
.\${SCOPE} .rpc-hold-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 18px;
  box-sizing: border-box;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
  color: \${HOLD};
  background: \${HOLD_TINT};
  border: var(--border-width) solid \${HOLD};
}
.\${SCOPE} .rpc-hold-badge--released {
  color: \${CLEAR};
  background: \${CLEAR_TINT};
  border-color: \${CLEAR};
}
/* --- legal-hold ledger: 56px rows ------------------------------------------ */
.\${SCOPE} .rpc-hold-row {
  min-height: 56px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  padding: var(--spacing-1) var(--spacing-3);
  border-top: var(--border-width) solid var(--color-border);
  min-width: 0;
}
.\${SCOPE} .rpc-hold-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.\${SCOPE} .rpc-hold-matter {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}
.\${SCOPE} .rpc-hold-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* --- purge calendar: 24px weekday row, 64px-min day cells ------------------ */
.\${SCOPE} .rpc-cal {
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.\${SCOPE} .rpc-cal-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .rpc-weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  min-height: 24px;
  align-items: center;
}
.\${SCOPE} .rpc-weekday {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  text-align: center;
}
.\${SCOPE} .rpc-cal-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 2px;
}
.\${SCOPE} .rpc-day {
  min-height: 64px;
  box-sizing: border-box;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: 3px 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  background: transparent;
  text-align: start;
}
.\${SCOPE} .rpc-day--blank {
  border-color: transparent;
}
.\${SCOPE} .rpc-day--window {
  cursor: pointer;
}
.\${SCOPE} .rpc-day--window[aria-pressed='true'] {
  border-color: \${BRAND};
  background: \${BRAND_TINT};
}
.\${SCOPE} .rpc-day--scope-hit {
  box-shadow: inset 0 0 0 1px \${BRAND};
}
.\${SCOPE} .rpc-day--today {
  box-shadow: inset 0 2px 0 0 \${BRAND};
}
.\${SCOPE} .rpc-day-num {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpc-day-num--today {
  color: \${BRAND};
  font-weight: 700;
}
.\${SCOPE} .rpc-day-pill {
  display: flex;
  align-items: center;
  gap: 3px;
  border-radius: 4px;
  padding: 1px 4px;
  font-size: 10px;
  font-weight: 600;
  min-width: 0;
}
.\${SCOPE} .rpc-day-pill--completed {
  color: var(--color-text-secondary);
  background: var(--color-background-secondary, \${BRAND_TINT});
}
.\${SCOPE} .rpc-day-pill--blocked {
  color: \${HOLD};
  background: \${HOLD_TINT};
}
.\${SCOPE} .rpc-day-pill--clear {
  color: \${BRAND};
  background: \${BRAND_TINT};
}
/* Selected clear window: pill flips to a solid brand fill (BRAND_ON text). */
.\${SCOPE} .rpc-day--window[aria-pressed='true'] .rpc-day-pill--clear {
  color: \${BRAND_ON};
  background: \${BRAND};
}
.\${SCOPE} .rpc-day-pill-id {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .rpc-day-sub {
  font-size: 9.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* --- window / scope detail bar: min 112 ------------------------------------ */
.\${SCOPE} .rpc-detail {
  flex-shrink: 0;
  min-height: 112px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  overflow-y: auto;
  max-height: 200px;
}
.\${SCOPE} .rpc-detail-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .rpc-detail-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 24px;
  font-size: 12px;
  min-width: 0;
}
.\${SCOPE} .rpc-detail-row-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* --- exceptions rail: cards with 40px actions ------------------------------- */
.\${SCOPE} .rpc-exc-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  margin: 0 var(--spacing-3) var(--spacing-2);
  padding: var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}
.\${SCOPE} .rpc-exc-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.\${SCOPE} .rpc-exc-id {
  font-family: \${MONO_FONT};
  font-size: 12px;
  font-weight: 700;
}
.\${SCOPE} .rpc-exc-records {
  margin-inline-start: auto;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .rpc-exc-basis {
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpc-exc-actions {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
/* --- decision log ----------------------------------------------------------- */
.\${SCOPE} .rpc-log-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-1) var(--spacing-3);
  font-size: 12px;
}
.\${SCOPE} .rpc-log-clock {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .rpc-log-body {
  min-width: 0;
  flex: 1;
}
.\${SCOPE} .rpc-verdict {
  font-weight: 700;
}
.\${SCOPE} .rpc-verdict--approved {
  color: \${CLEAR};
}
.\${SCOPE} .rpc-verdict--denied {
  color: \${HOLD};
}
/* --- responsive subtraction -------------------------------------------------- */
@media (max-width: 900px) {
  .\${SCOPE} .rpc-body {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .\${SCOPE} .rpc-pane {
    flex: none;
  }
  .\${SCOPE} .rpc-pane + .rpc-pane {
    border-inline-start: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .rpc-pane-scroll {
    overflow-y: visible;
    flex: none;
  }
  .\${SCOPE} .rpc-detail {
    max-height: none;
  }
}
@media (max-width: 600px) {
  .\${SCOPE} .rpc-day-pill-id {
    display: none;
  }
  .\${SCOPE} .rpc-day-sub {
    display: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .rpc-scope-row,
  .\${SCOPE} .rpc-day--window {
    transition: background-color 120ms ease, border-color 120ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — the Retainer strapped archive: a records box with a retention
// band and clasp. Inline SVG, brand-colored via currentColor.
// ---------------------------------------------------------------------------

function RetainerMark() {
  return (
    <span className="rpc-mark" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect
          x="3"
          y="4"
          width="14"
          height="12"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M3 9.2h14" stroke="currentColor" strokeWidth="1.6" />
        <path d="M10 4v12" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="10" cy="9.2" r="1.9" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — props in, callbacks out; the page owns all state.
// ---------------------------------------------------------------------------

interface HoldBadgeProps {
  state: ScopeHoldState;
}

/**
 * The shared 18px hold pill: a red gavel + hold ref while a hold is active;
 * it "lifts" to a green released pill (naming the approving exception) the
 * moment that exception is approved — the same pill component renders in
 * the tree, the calendar detail rows, and the hold ledger.
 */
function HoldBadge({state}: HoldBadgeProps) {
  if (state.kind === 'none') {
    return null;
  }
  if (state.kind === 'held') {
    return (
      <span className="rpc-hold-badge" title={state.hold.matter}>
        <Icon icon={GavelIcon} size="xsm" color="inherit" />
        {state.hold.shortRef}
      </span>
    );
  }
  return (
    <span
      className="rpc-hold-badge rpc-hold-badge--released"
      title={\`\${state.hold.matter} — released via \${state.exceptionId}\`}>
      <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
      released
    </span>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner: the decisions map + its ordered session log drive
// every derived surface (tree badges, window blocks, stats, queue, log).
// ---------------------------------------------------------------------------

type Selection =
  | {kind: 'window'; id: string}
  | {kind: 'scope'; id: ScopeId};

interface DecisionEvent {
  id: string;
  clockLabel: string;
  exceptionId: string;
  verdict: Verdict;
  summary: string;
}

export default function DataRetentionPolicyCenterTemplate() {
  const [decisions, setDecisions] = useState<Decisions>({});
  const [decisionEvents, setDecisionEvents] = useState<DecisionEvent[]>([]);
  // Monotonic — undo does not rewind the clock, so labels stay unique.
  const [eventCount, setEventCount] = useState(0);
  const [selection, setSelection] = useState<Selection>({
    kind: 'window',
    id: 'W-2609',
  });
  const [announcement, setAnnouncement] = useState('');

  const atRisk = recordsAtRisk(decisions);
  const nextClear = nextClearWindow(decisions);
  const pendingQueue = PENDING_EXCEPTIONS.filter(
    exception => decisions[exception.id] === undefined,
  );
  const activeHoldPairs = HOLDS.reduce(
    (sum, hold) =>
      sum +
      hold.scopeIds.filter(
        scopeId => scopeHoldState(scopeId, decisions).kind === 'held',
      ).length,
    0,
  );

  const decide = (exceptionId: string, verdict: Verdict) => {
    const exception = PENDING_EXCEPTIONS.find(
      entry => entry.id === exceptionId,
    );
    if (exception === undefined || decisions[exceptionId] !== undefined) {
      return;
    }
    const nextDecisions: Decisions = {...decisions, [exceptionId]: verdict};
    const scope = scopeOf(exception.scopeId);
    const hold = holdOf(exception.holdId);
    const relatedWindow = WINDOWS.find(entry =>
      entry.scopeIds.includes(exception.scopeId),
    );
    const clockLabel = sessionClockLabel(eventCount);
    let summary: string;
    let liveNote: string;
    if (verdict === 'approved') {
      const remainingHolds =
        relatedWindow === undefined
          ? 0
          : windowActiveHolds(relatedWindow, nextDecisions);
      const windowNote =
        relatedWindow === undefined
          ? ''
          : remainingHolds === 0
            ? \` \${relatedWindow.id} (Jul \${relatedWindow.day}) is now CLEAR — \${fmtInt(
                windowEligible(relatedWindow),
              )} records purge-eligible.\`
            : \` \${relatedWindow.id} still has \${remainingHolds} active hold\${
                remainingHolds === 1 ? '' : 's'
              }.\`;
      summary = \`\${exceptionId} approved — \${hold.shortRef} released for \${
        scope.name
      } (\${fmtInt(exception.records)} records unblocked).\${windowNote}\`;
      liveNote = \`\${exceptionId} approved. Hold badge lifted on \${
        scope.name
      }; records at risk now \${fmtInt(
        recordsAtRisk(nextDecisions),
      )}.\${windowNote}\`;
    } else {
      summary = \`\${exceptionId} denied — \${hold.shortRef} stands on \${scope.name}; window stays blocked.\`;
      liveNote = \`\${exceptionId} denied. \${hold.shortRef} remains active on \${scope.name}.\`;
    }
    setDecisions(nextDecisions);
    setEventCount(count => count + 1);
    setDecisionEvents(events => [
      {
        id: \`dec-\${clockLabel}-\${exceptionId}\`,
        clockLabel,
        exceptionId,
        verdict,
        summary,
      },
      ...events,
    ]);
    setAnnouncement(liveNote);
  };

  const undoLatest = () => {
    const latest = decisionEvents[0];
    if (latest === undefined) {
      return;
    }
    setDecisions(previous => {
      const next = {...previous};
      delete next[latest.exceptionId];
      return next;
    });
    setDecisionEvents(events => events.slice(1));
    setAnnouncement(
      \`Decision on \${latest.exceptionId} undone — every derived surface reverted.\`,
    );
  };

  const selectScope = (scopeId: ScopeId) => {
    setSelection({kind: 'scope', id: scopeId});
    setAnnouncement(\`Inspecting scope \${scopeOf(scopeId).name}.\`);
  };

  const selectWindow = (windowId: string) => {
    setSelection({kind: 'window', id: windowId});
  };

  // ---- left rail: policy scope tree + legal-hold ledger ----

  const scopeTree = (
    <div className="rpc-pane" aria-label="Policy scopes">
      <div className="rpc-pane-scroll">
        <div className="rpc-pane-title">
          <HStack gap={1} vAlign="center">
            <Icon icon={ArchiveIcon} size="sm" color="secondary" />
            <Text type="label" size="sm" color="secondary">
              Policy scopes
            </Text>
          </HStack>
        </div>
        {SCOPE_GROUPS.map(group => {
          const groupRecords = group.scopes.reduce(
            (sum, scope) => sum + scope.records,
            0,
          );
          return (
            <div key={group.id} role="group" aria-label={group.label}>
              <div className="rpc-group-head">
                <span>{group.label}</span>
                <span className="rpc-num">{fmtInt(groupRecords)}</span>
              </div>
              {group.scopes.map(scope => {
                const holdState = scopeHoldState(scope.id, decisions);
                const isSelected =
                  selection.kind === 'scope' && selection.id === scope.id;
                return (
                  <button
                    key={scope.id}
                    type="button"
                    className="rpc-scope-row rpc-focusable"
                    aria-pressed={isSelected}
                    onClick={() => selectScope(scope.id)}>
                    <span className="rpc-scope-main">
                      <span className="rpc-scope-name">{scope.name}</span>
                      <span className="rpc-scope-rule">{scope.rule}</span>
                    </span>
                    <HoldBadge state={holdState} />
                    <span className="rpc-scope-counts">
                      <span className="rpc-scope-records">
                        {fmtInt(scope.records)}
                      </span>
                      <span
                        className={
                          holdState.kind === 'held' && scope.overdue > 0
                            ? 'rpc-scope-overdue rpc-scope-overdue--held'
                            : 'rpc-scope-overdue'
                        }>
                        {scope.overdue > 0
                          ? \`\${fmtInt(scope.overdue)} overdue\`
                          : 'none overdue'}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          );
        })}
        <div className="rpc-pane-title">
          <HStack gap={1} vAlign="center">
            <Icon icon={ScaleIcon} size="sm" color="secondary" />
            <Text type="label" size="sm" color="secondary">
              Legal holds ({HOLDS.length})
            </Text>
          </HStack>
        </div>
        {HOLDS.map(hold => {
          const releasedCount = hold.scopeIds.filter(
            scopeId => scopeHoldState(scopeId, decisions).kind === 'released',
          ).length;
          const activeCount = hold.scopeIds.length - releasedCount;
          return (
            <div className="rpc-hold-row" key={hold.id}>
              <div className="rpc-hold-top">
                <span
                  className={
                    activeCount === 0
                      ? 'rpc-hold-badge rpc-hold-badge--released'
                      : 'rpc-hold-badge'
                  }>
                  <Icon icon={GavelIcon} size="xsm" color="inherit" />
                  {hold.shortRef}
                </span>
                <span className="rpc-hold-matter" title={hold.matter}>
                  {hold.matter}
                </span>
              </div>
              <span className="rpc-hold-meta">
                {hold.custodian} ·{' '}
                <span className="rpc-num">
                  {activeCount === 0
                    ? 'fully released this session'
                    : \`\${activeCount} of \${hold.scopeIds.length} scope\${
                        hold.scopeIds.length === 1 ? '' : 's'
                      } still held\`}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---- center pane: purge-window calendar + detail bar ----

  const dayCells: Array<number | null> = [
    ...Array.from({length: LEADING_BLANKS}, () => null),
    ...Array.from({length: DAYS_IN_MONTH}, (_, index) => index + 1),
  ];
  while (dayCells.length % 7 !== 0) {
    dayCells.push(null);
  }

  const selectedWindow =
    selection.kind === 'window'
      ? WINDOWS.find(entry => entry.id === selection.id)
      : undefined;
  const selectedScope =
    selection.kind === 'scope' ? scopeOf(selection.id) : undefined;

  const calendarPane = (
    <div className="rpc-pane" aria-label="Purge-window calendar">
      <div className="rpc-pane-scroll">
        <div className="rpc-cal">
          <div className="rpc-cal-head">
            <HStack gap={1} vAlign="center">
              <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
              <Heading level={4} accessibilityLevel={2}>
                July 2026 purge windows
              </Heading>
            </HStack>
            <Text type="supporting" size="sm" color="secondary">
              today: Wed Jul 15 · windows run 01:00–05:00 UTC
            </Text>
          </div>
          <div className="rpc-weekdays" aria-hidden>
            {WEEKDAY_LABELS.map(label => (
              <span className="rpc-weekday" key={label}>
                {label}
              </span>
            ))}
          </div>
          <div className="rpc-cal-grid">
            {dayCells.map((day, index) => {
              if (day === null) {
                return (
                  <div
                    className="rpc-day rpc-day--blank"
                    key={\`blank-\${index}\`}
                    aria-hidden
                  />
                );
              }
              const isToday = day === TODAY_DAY;
              const dayWindow = WINDOWS.find(entry => entry.day === day);
              const dayNum = (
                <span
                  className={
                    isToday ? 'rpc-day-num rpc-day-num--today' : 'rpc-day-num'
                  }>
                  {day}
                  {isToday ? ' · today' : ''}
                </span>
              );
              if (dayWindow === undefined) {
                return (
                  <div
                    className={isToday ? 'rpc-day rpc-day--today' : 'rpc-day'}
                    key={\`day-\${day}\`}>
                    {dayNum}
                  </div>
                );
              }
              const status = windowStatus(dayWindow, decisions);
              const activeHolds = windowActiveHolds(dayWindow, decisions);
              const isSelected =
                selection.kind === 'window' && selection.id === dayWindow.id;
              const scopeHit =
                selection.kind === 'scope' &&
                dayWindow.scopeIds.includes(selection.id);
              const classes = [
                'rpc-day',
                'rpc-day--window',
                'rpc-focusable',
                isToday ? 'rpc-day--today' : '',
                scopeHit ? 'rpc-day--scope-hit' : '',
              ]
                .filter(Boolean)
                .join(' ');
              const subLabel =
                status === 'completed'
                  ? \`\${fmtInt(dayWindow.purged ?? 0)} purged\`
                  : \`\${fmtInt(windowEligible(dayWindow))} eligible\`;
              return (
                <button
                  key={dayWindow.id}
                  type="button"
                  className={classes}
                  aria-pressed={isSelected}
                  aria-label={\`Jul \${day}: \${dayWindow.id}, \${
                    status === 'blocked'
                      ? \`blocked by \${activeHolds} active hold\${
                          activeHolds === 1 ? '' : 's'
                        }\`
                      : status
                  }, \${subLabel}\`}
                  onClick={() => selectWindow(dayWindow.id)}>
                  {dayNum}
                  <span className={\`rpc-day-pill rpc-day-pill--\${status}\`}>
                    <Icon
                      icon={
                        status === 'completed'
                          ? CheckCircle2Icon
                          : status === 'blocked'
                            ? GavelIcon
                            : Trash2Icon
                      }
                      size="xsm"
                      color="inherit"
                    />
                    <span className="rpc-day-pill-id">{dayWindow.id}</span>
                    {status === 'blocked' && (
                      <span className="rpc-num">×{activeHolds}</span>
                    )}
                  </span>
                  <span className="rpc-day-sub">{subLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="rpc-detail" aria-label="Selection detail">
        {selectedWindow !== undefined && (
          <>
            <div className="rpc-detail-head">
              <Heading level={5} accessibilityLevel={3}>
                {selectedWindow.id} · Jul {selectedWindow.day}
              </Heading>
              <Badge
                label={
                  selectedWindow.kind === 'completed'
                    ? \`completed · \${fmtInt(selectedWindow.purged ?? 0)} purged\`
                    : windowStatus(selectedWindow, decisions) === 'blocked'
                      ? \`blocked · \${windowActiveHolds(
                          selectedWindow,
                          decisions,
                        )} active hold\${
                          windowActiveHolds(selectedWindow, decisions) === 1
                            ? ''
                            : 's'
                        }\`
                      : \`clear · \${fmtInt(
                          windowEligible(selectedWindow),
                        )} purge-eligible\`
                }
                variant={
                  selectedWindow.kind === 'completed'
                    ? 'neutral'
                    : windowStatus(selectedWindow, decisions) === 'blocked'
                      ? 'error'
                      : 'success'
                }
              />
              {selectedWindow.note !== undefined && (
                <Text type="supporting" size="sm" color="secondary">
                  {selectedWindow.note}
                </Text>
              )}
            </div>
            {selectedWindow.scopeIds.map(scopeId => {
              const scope = scopeOf(scopeId);
              const holdState = scopeHoldState(scopeId, decisions);
              return (
                <div className="rpc-detail-row" key={scopeId}>
                  <span className="rpc-detail-row-name">{scope.name}</span>
                  <span className="rpc-num">
                    {fmtInt(scope.overdue)} overdue
                  </span>
                  {holdState.kind === 'none' ? (
                    <Badge label="no hold" variant="neutral" />
                  ) : (
                    <HoldBadge state={holdState} />
                  )}
                </div>
              );
            })}
            {selectedWindow.kind === 'scheduled' &&
              windowStatus(selectedWindow, decisions) === 'blocked' && (
                <Text type="supporting" size="sm" color="secondary">
                  Unblocks when every hold above is released — approvals live
                  in the exception queue.
                </Text>
              )}
          </>
        )}
        {selectedScope !== undefined && (
          <>
            <div className="rpc-detail-head">
              <Heading level={5} accessibilityLevel={3}>
                {selectedScope.name}
              </Heading>
              <Badge label={selectedScope.rule} variant="neutral" />
              <HoldBadge state={scopeHoldState(selectedScope.id, decisions)} />
            </div>
            <div className="rpc-detail-row">
              <span className="rpc-detail-row-name">Records governed</span>
              <span className="rpc-num">{fmtInt(selectedScope.records)}</span>
            </div>
            <div className="rpc-detail-row">
              <span className="rpc-detail-row-name">Past retention</span>
              <span className="rpc-num">{fmtInt(selectedScope.overdue)}</span>
            </div>
            <div className="rpc-detail-row">
              <span className="rpc-detail-row-name">Next purge window</span>
              <span className="rpc-num">
                {(() => {
                  const upcoming = WINDOWS.find(
                    entry =>
                      entry.kind === 'scheduled' &&
                      entry.scopeIds.includes(selectedScope.id),
                  );
                  return upcoming === undefined
                    ? 'none scheduled'
                    : \`\${upcoming.id} · Jul \${upcoming.day}\`;
                })()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ---- right rail: purge-exception queue + decision log ----

  const exceptionsPane = (
    <div className="rpc-pane" aria-label="Purge exceptions">
      <div className="rpc-pane-scroll">
        <div className="rpc-pane-title">
          <HStack gap={2} vAlign="center">
            <Text type="label" size="sm" color="secondary">
              Purge exceptions
            </Text>
            <Badge
              label={\`\${pendingQueue.length} pending\`}
              variant={pendingQueue.length > 0 ? 'warning' : 'success'}
            />
          </HStack>
        </div>
        {pendingQueue.length === 0 ? (
          <div className="rpc-log-row">
            <Text type="supporting" size="sm" color="secondary">
              Queue clear — every pending exception has a decision. Undo from
              the log below to revisit one.
            </Text>
          </div>
        ) : (
          pendingQueue.map(exception => {
            const scope = scopeOf(exception.scopeId);
            const hold = holdOf(exception.holdId);
            return (
              <div className="rpc-exc-card" key={exception.id}>
                <div className="rpc-exc-top">
                  <span className="rpc-exc-id">{exception.id}</span>
                  <span className="rpc-hold-badge">
                    <Icon icon={GavelIcon} size="xsm" color="inherit" />
                    {hold.shortRef}
                  </span>
                  <span className="rpc-exc-records">
                    {fmtInt(exception.records)} rec
                  </span>
                </div>
                <Text type="body" size="sm">
                  Release <strong>{scope.name}</strong> from {hold.ref}
                </Text>
                <span className="rpc-exc-basis">{exception.basis}</span>
                <Text type="supporting" size="sm" color="secondary">
                  {exception.requestedBy} · requested {exception.requestedOn}
                </Text>
                <div className="rpc-exc-actions">
                  <Button
                    label="Approve release"
                    variant="primary"
                    size="md"
                    icon={<Icon icon={CheckCircle2Icon} size="sm" />}
                    onClick={() => decide(exception.id, 'approved')}
                  />
                  <Button
                    label="Deny"
                    variant="secondary"
                    size="md"
                    icon={<Icon icon={XCircleIcon} size="sm" />}
                    onClick={() => decide(exception.id, 'denied')}
                  />
                </div>
              </div>
            );
          })
        )}
        <div className="rpc-pane-title">
          <HStack gap={1} vAlign="center">
            <Icon icon={HistoryIcon} size="sm" color="secondary" />
            <Text type="label" size="sm" color="secondary">
              Decision log
            </Text>
          </HStack>
        </div>
        {decisionEvents.map((event, index) => (
          <div className="rpc-log-row" key={event.id}>
            <span className="rpc-log-clock">{event.clockLabel}</span>
            <div className="rpc-log-body">
              <Text type="body" size="sm">
                <span className={\`rpc-verdict rpc-verdict--\${event.verdict}\`}>
                  {event.verdict}
                </span>{' '}
                — {event.summary}
              </Text>
              {index === 0 && (
                <Button
                  label="Undo"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={Undo2Icon} size="sm" />}
                  onClick={undoLatest}
                />
              )}
            </div>
          </div>
        ))}
        <div className="rpc-log-row">
          <span className="rpc-log-clock">{RESOLVED_FIXTURE.decidedOn}</span>
          <div className="rpc-log-body">
            <Text type="body" size="sm" color="secondary">
              <span className="rpc-verdict rpc-verdict--denied">denied</span> —{' '}
              {RESOLVED_FIXTURE.id} ({RESOLVED_FIXTURE.holdRef} ·{' '}
              {RESOLVED_FIXTURE.scopeName},{' '}
              <span className="rpc-num">
                {fmtInt(RESOLVED_FIXTURE.records)}
              </span>{' '}
              rec) by {RESOLVED_FIXTURE.decidedBy}: {RESOLVED_FIXTURE.reason}
            </Text>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- frame ----

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="rpc-header-row">
              <HStack gap={3} vAlign="center" wrap="wrap">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <HStack gap={2} vAlign="center">
                    <RetainerMark />
                    <Heading level={1} maxLines={1}>
                      Retainer — Data Retention Policy Center
                    </Heading>
                    <Badge label="Nortech Home · FY26" variant="neutral" />
                  </HStack>
                </StackItem>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Badge
                    label={\`\${pendingQueue.length} exception\${
                      pendingQueue.length === 1 ? '' : 's'
                    } pending\`}
                    variant={pendingQueue.length > 0 ? 'warning' : 'success'}
                  />
                  <Badge
                    label={\`\${activeHoldPairs} hold-scope pair\${
                      activeHoldPairs === 1 ? '' : 's'
                    } active\`}
                    variant={activeHoldPairs > 0 ? 'error' : 'success'}
                  />
                </HStack>
              </HStack>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div className="rpc-content">
              <div
                aria-live="polite"
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  margin: -1,
                  padding: 0,
                  overflow: 'hidden',
                  clipPath: 'inset(50%)',
                  whiteSpace: 'nowrap',
                }}>
                {announcement}
              </div>
              <div className="rpc-stats" role="status" aria-label="Governance stats">
                <span className="rpc-stat">
                  <Icon icon={DatabaseIcon} size="sm" color="secondary" />
                  <strong>{fmtInt(TOTAL_RECORDS)}</strong> records governed
                </span>
                <span className="rpc-stat">
                  <Icon icon={Trash2Icon} size="sm" color="secondary" />
                  <strong>{fmtInt(TOTAL_OVERDUE)}</strong> past retention
                </span>
                <span className="rpc-stat rpc-stat--risk">
                  <Icon icon={GavelIcon} size="sm" color="secondary" />
                  <strong>{fmtInt(atRisk)}</strong> blocked by holds
                </span>
                <span className="rpc-stat rpc-stat--clear">
                  <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
                  <strong>
                    {nextClear === undefined
                      ? '—'
                      : \`Jul \${nextClear.day} · \${nextClear.id}\`}
                  </strong>{' '}
                  next clear window
                </span>
              </div>
              <div className="rpc-body">
                {scopeTree}
                {calendarPane}
                {exceptionsPane}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



`;export{e as default};