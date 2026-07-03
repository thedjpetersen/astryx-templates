// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs FY26 headcount
 *   plan (six departments whose filled seats sum to the canonical 140,
 *   base-plan targets summing to 156 and stretch targets to 164), a
 *   16-requisition pipeline (12 open + 4 at offer) plus 8 stretch-only
 *   draft seats, fixed loaded-cost figures per seat, and fixed target
 *   start quarters. No clocks, no Math.random(), no network media; every
 *   run-rate figure is derived from the same seat fixtures at module
 *   scope so all panels reconcile by construction.
 * @output Headcount Planning — the plan-vs-actuals workforce surface for
 *   Kestrel Labs (140-person platform company). A KPI strip (plan 156 /
 *   filled 140 / open 12 / offers 4 under the base plan), a
 *   per-department table with plan, filled, offers, open and a stacked
 *   utilization bar (filled + offers + open vs plan), a quarterly
 *   hiring-cost impact strip (starts per quarter and cumulative
 *   incremental annualized run-rate), and an open-requisition pipeline
 *   panel (role, level, recruiter, days open, stage dots). A Base plan /
 *   Stretch plan scenario toggle swaps every number on the page; the
 *   stretch scenario surfaces 8 additional draft seats in the pipeline.
 * @position Page template; emitted by `astryx template hr-headcount-planning`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, scenario SegmentedControl, export)
 *   | content (KPI strip, department table, hiring-cost quarter strip —
 *     one vertical scroller)
 *   | end panel 360 (requisition pipeline, scrolls independently).
 *
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. KPI tiles, quarter cells, and requisition entries are styled
 *   bordered divs, and the pipeline lives in a LayoutPanel.
 *
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard `light-dark()` fallback pairs on the data-viz
 *   categorical tokens (department dots, stacked-bar segments, stage
 *   dots) plus the pink/slate/amber literal pairs that follow the same pattern —
 *   the demo does not inject `--color-data-categorical-*`.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 360px pipeline panel on the end edge.
 * - <= 1180px: the pipeline panel drops and the same pipeline section
 *   renders inline below the cost strip in the main scroller, so every
 *   requisition stays reachable.
 * - <= 860px: the KPI strip and the quarter strip fall from 4-up rows to
 *   2x2 grids; the header row wraps instead of clipping the scenario
 *   toggle or the export button.
 * - <= 768px: the department table drops the Offers column (offer counts
 *   stay reachable in the KPI strip and on the offer-stage pipeline
 *   entries) so the remaining numeric columns never crush.
 * - The content column and the pipeline panel scroll independently
 *   (`minHeight: 0` down each flex chain).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  BriefcaseIcon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  CrosshairIcon,
  DownloadIcon,
  HandshakeIcon,
  InfoIcon,
  MapPinIcon,
  RocketIcon,
  UsersIcon,
  XIcon,
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // KPI strip ---------------------------------------------------------------
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  kpiGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  kpiTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  kpiValue: {
    fontSize: 28,
    lineHeight: 1.15,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
  },
  noteRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Department table ---------------------------------------------------------
  sectionBlock: {minWidth: 0},
  tableScrollX: {overflowX: 'auto', minWidth: 0},
  deptDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  numericHeader: {textAlign: 'end'},
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  row: {cursor: 'pointer'},
  rowSelected: {
    cursor: 'pointer',
    // Inset outline so the active row never bleeds onto neighbors.
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  totalsRow: {backgroundColor: 'var(--color-background-muted)'},
  // Stacked utilization bar: filled + offers + open segments vs plan.
  utilTrack: {
    display: 'flex',
    height: 8,
    width: '100%',
    minWidth: 120,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  utilSegment: {height: '100%'},
  utilPct: {width: 44, textAlign: 'end', flexShrink: 0},
  legendRow: {rowGap: 4},
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  // Quarterly hiring-cost strip ----------------------------------------------
  quarterGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  quarterGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  quarterCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  quarterBarTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    marginTop: 'var(--spacing-1)',
  },
  quarterBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
  },
  // Requisition pipeline -------------------------------------------------
  panelFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {flexShrink: 0, padding: 'var(--spacing-3)'},
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  reqCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  reqCode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  stageDot: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  stageDotRow: {display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0},
  daysOpen: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Intentional literal (light-dark pair): searches open > 45 days read as
  // aging in both schemes — an amber that AA-passes on the surface token.
  daysAging: {color: 'light-dark(#B45309, #FBBF24)', fontWeight: 600},
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
const VIZ = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  pink: 'light-dark(#DB2777, #F472B6)',
} as const;

// Stacked utilization-bar segments — one legend for every department row.
const UTIL_COLOR = {
  filled: VIZ.blue,
  offer: VIZ.orange,
  // Open seats render as a muted slate tail so the bar reads plan-shaped
  // even where nobody sits yet. Intentional literal (light-dark pair):
  // `--color-border` was near-invisible against the dark surface, both in
  // the legend swatch and in the bar itself.
  open: 'light-dark(#94A3B8, #64748B)',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company, planning FY26 headcount. Canonical filled seats per department
// (sum 140): Engineering 52, Design 18, GTM 34, Ops 16, Finance 8, People 12.
//
// Base plan 156 = 140 filled + 12 open + 4 at offer. Stretch plan 164 adds
// 8 draft seats (Eng +3, Design +1, GTM +3, People +1). Open/offer counts
// in the table and KPIs are DERIVED from the requisition fixtures below, so
// every panel reconciles by construction.
// ---------------------------------------------------------------------------

type Scenario = 'base' | 'stretch';
type DeptId = 'eng' | 'design' | 'gtm' | 'ops' | 'finance' | 'people';

interface DeptMeta {
  id: DeptId;
  label: string;
  lead: string;
  leadRole: string;
  color: string;
  tokenColor: 'blue' | 'purple' | 'orange' | 'teal' | 'green' | 'pink';
  /** Canonical filled seats — identical in both scenarios. */
  filled: number;
  /** Approved seat targets per scenario. */
  plan: Record<Scenario, number>;
}

const DEPTS: DeptMeta[] = [
  {
    id: 'eng',
    label: 'Engineering',
    lead: 'Priya Raman',
    leadRole: 'VP Engineering',
    color: VIZ.blue,
    tokenColor: 'blue',
    filled: 52,
    plan: {base: 59, stretch: 62},
  },
  {
    id: 'design',
    label: 'Design',
    lead: 'Sofia Ortiz',
    leadRole: 'Design lead',
    color: VIZ.purple,
    tokenColor: 'purple',
    filled: 18,
    plan: {base: 20, stretch: 21},
  },
  {
    id: 'gtm',
    label: 'GTM',
    lead: 'Jonah Fields',
    leadRole: 'GTM lead',
    color: VIZ.orange,
    tokenColor: 'orange',
    filled: 34,
    plan: {base: 38, stretch: 41},
  },
  {
    id: 'ops',
    label: 'Ops',
    lead: 'Omar Haddad',
    leadRole: 'Ops lead',
    color: VIZ.teal,
    tokenColor: 'teal',
    filled: 16,
    plan: {base: 17, stretch: 17},
  },
  {
    id: 'finance',
    label: 'Finance',
    lead: 'Elena Voss',
    leadRole: 'Finance lead',
    color: VIZ.green,
    tokenColor: 'green',
    filled: 8,
    plan: {base: 9, stretch: 9},
  },
  {
    id: 'people',
    label: 'People',
    lead: 'Dana Whitfield',
    leadRole: 'People Ops',
    color: VIZ.pink,
    tokenColor: 'pink',
    filled: 12,
    plan: {base: 13, stretch: 14},
  },
];

const DEPT_BY_ID = new Map(DEPTS.map(dept => [dept.id, dept]));

/** Canonical company size — the sum of every department's filled seats. */
const TOTAL_FILLED = DEPTS.reduce((sum, dept) => sum + dept.filled, 0); // 140

/** The two hires currently mid-onboarding; they count as filled seats. */
const ONBOARDING_NOTE =
  'Filled includes 2 hires in onboarding — Ava Lindqvist (Engineering) and Ken Tanaka (GTM).';

// ---------------------------------------------------------------------------
// REQUISITIONS — 16 live seats under the base plan (12 open + 4 at offer)
// plus 8 stretch-only draft seats. `costK` is the loaded annualized cost in
// $k; `startQuarter` indexes QUARTERS below. Base-plan loaded costs sum to
// $3.28M; stretch drafts add $1.57M for $4.85M at the full stretch plan.
// ---------------------------------------------------------------------------

type Stage = 'draft' | 'sourcing' | 'screening' | 'onsite' | 'offer';

/** Pipeline stages that render as dots (drafts show four empty dots). */
const STAGES: Exclude<Stage, 'draft'>[] = [
  'sourcing',
  'screening',
  'onsite',
  'offer',
];

const STAGE_LABEL: Record<Stage, string> = {
  draft: 'Draft',
  sourcing: 'Sourcing',
  screening: 'Screening',
  onsite: 'Onsite',
  offer: 'Offer out',
};

type Office = 'SF HQ' | 'Lisbon' | 'Remote-US';

interface Req {
  id: string;
  role: string;
  level: string;
  dept: DeptId;
  office: Office;
  /** People-team recruiter who owns the search. */
  recruiter: string;
  hiringManager: string;
  daysOpen: number;
  stage: Stage;
  /** Loaded annualized cost, $k. */
  costK: number;
  /** Index into QUARTERS — when the seat starts drawing payroll. */
  startQuarter: 0 | 1 | 2;
  scenario: Scenario;
  /** Display string for the target start. */
  targetStart: string;
}

// Compact fixture rows: [id, role, level, dept, office, recruiter,
// hiringManager, daysOpen, stage, costK, startQuarter, targetStart]
type ReqSpec = [
  string,
  string,
  string,
  DeptId,
  Office,
  string,
  string,
  number,
  Stage,
  number,
  0 | 1 | 2,
  string,
];

const BASE_REQ_SPECS: ReqSpec[] = [
  // ---- Engineering: 5 open + 2 at offer (plan 59 − filled 52 = 7) ----
  ['REQ-2026-104', 'Senior Backend Engineer', 'L5', 'eng', 'SF HQ',
    'Maya Chen', 'Priya Raman', 34, 'onsite', 268, 1, 'Oct 5, 2026'],
  ['REQ-2026-109', 'Platform Engineer', 'L4', 'eng', 'Remote-US',
    'Maya Chen', 'Marcus Webb', 21, 'screening', 214, 2, 'Jan 11, 2027'],
  ['REQ-2026-097', 'Infra Engineer — Observability', 'L4', 'eng', 'Lisbon',
    'Leo Barros', 'Marcus Webb', 45, 'onsite', 226, 1, 'Nov 2, 2026'],
  ['REQ-2026-118', 'Frontend Engineer', 'L4', 'eng', 'Remote-US',
    'Maya Chen', 'Priya Raman', 12, 'sourcing', 202, 2, 'Jan 18, 2027'],
  ['REQ-2026-092', 'Engineering Manager — Platform', 'M1', 'eng', 'SF HQ',
    'Ruth Okafor', 'Priya Raman', 52, 'screening', 275, 1, 'Oct 19, 2026'],
  ['REQ-2026-088', 'Staff Product Engineer', 'L6', 'eng', 'SF HQ',
    'Ruth Okafor', 'Priya Raman', 61, 'offer', 312, 0, 'Aug 3, 2026'],
  ['REQ-2026-095', 'Site Reliability Engineer', 'L5', 'eng', 'Remote-US',
    'Maya Chen', 'Marcus Webb', 40, 'offer', 248, 0, 'Aug 17, 2026'],
  // ---- Design: 2 open (plan 20 − filled 18 = 2) ----
  ['REQ-2026-112', 'Product Designer — Core', 'L4', 'design', 'Lisbon',
    'Leo Barros', 'Sofia Ortiz', 18, 'screening', 172, 0, 'Sep 14, 2026'],
  ['REQ-2026-121', 'Brand Designer', 'L3', 'design', 'SF HQ',
    'Ruth Okafor', 'Sofia Ortiz', 9, 'sourcing', 148, 0, 'Sep 28, 2026'],
  // ---- GTM: 3 open + 1 at offer (plan 38 − filled 34 = 4) ----
  ['REQ-2026-101', 'Enterprise Account Executive', 'L5', 'gtm', 'Remote-US',
    'Ruth Okafor', 'Jonah Fields', 27, 'onsite', 240, 1, 'Oct 12, 2026'],
  ['REQ-2026-115', 'Sales Engineer', 'L4', 'gtm', 'SF HQ',
    'Ruth Okafor', 'Jonah Fields', 15, 'screening', 198, 1, 'Nov 9, 2026'],
  ['REQ-2026-111', 'Lifecycle Marketing Manager', 'L4', 'gtm', 'Remote-US',
    'Maya Chen', 'Jonah Fields', 23, 'screening', 186, 2, 'Jan 4, 2027'],
  ['REQ-2026-099', 'Account Executive — EMEA', 'L4', 'gtm', 'Lisbon',
    'Leo Barros', 'Jonah Fields', 38, 'offer', 210, 0, 'Sep 7, 2026'],
  // ---- Ops: 1 open (plan 17 − filled 16 = 1) ----
  ['REQ-2026-119', 'Workplace Ops Coordinator', 'L3', 'ops', 'SF HQ',
    'Ruth Okafor', 'Omar Haddad', 11, 'sourcing', 118, 0, 'Sep 21, 2026'],
  // ---- Finance: 1 at offer (plan 9 − filled 8 = 1) ----
  ['REQ-2026-096', 'Senior Accountant', 'L4', 'finance', 'Remote-US',
    'Maya Chen', 'Elena Voss', 44, 'offer', 156, 0, 'Aug 10, 2026'],
  // ---- People: 1 open (plan 13 − filled 12 = 1) ----
  ['REQ-2026-114', 'Technical Recruiter', 'L4', 'people', 'Lisbon',
    'Leo Barros', 'Dana Whitfield', 16, 'screening', 107, 1, 'Oct 26, 2026'],
];

// Stretch drafts open only if the stretch plan is approved — daysOpen 0,
// stage 'draft'. Deltas per department: Eng +3, Design +1, GTM +3, People +1.
const STRETCH_REQ_SPECS: ReqSpec[] = [
  ['REQ-2026-S01', 'Backend Engineer', 'L4', 'eng', 'Remote-US',
    'Maya Chen', 'Marcus Webb', 0, 'draft', 208, 1, 'Q4 ’26'],
  ['REQ-2026-S02', 'Machine Learning Engineer', 'L5', 'eng', 'SF HQ',
    'Ruth Okafor', 'Priya Raman', 0, 'draft', 246, 2, 'Q1 ’27'],
  ['REQ-2026-S03', 'Security Engineer', 'L5', 'eng', 'Remote-US',
    'Maya Chen', 'Tom Okonkwo', 0, 'draft', 288, 2, 'Q1 ’27'],
  ['REQ-2026-S04', 'Product Designer — Growth', 'L4', 'design', 'Lisbon',
    'Leo Barros', 'Sofia Ortiz', 0, 'draft', 178, 1, 'Q4 ’26'],
  ['REQ-2026-S05', 'Sales Development Rep', 'L2', 'gtm', 'SF HQ',
    'Ruth Okafor', 'Jonah Fields', 0, 'draft', 132, 1, 'Q4 ’26'],
  ['REQ-2026-S06', 'Partner Manager', 'L5', 'gtm', 'Remote-US',
    'Ruth Okafor', 'Jonah Fields', 0, 'draft', 205, 2, 'Q1 ’27'],
  ['REQ-2026-S07', 'Field Marketing Manager', 'L4', 'gtm', 'Lisbon',
    'Leo Barros', 'Jonah Fields', 0, 'draft', 175, 2, 'Q1 ’27'],
  ['REQ-2026-S08', 'People Ops Generalist', 'L3', 'people', 'SF HQ',
    'Maya Chen', 'Dana Whitfield', 0, 'draft', 138, 2, 'Q1 ’27'],
];

function specToReq(spec: ReqSpec, scenario: Scenario): Req {
  const [id, role, level, dept, office, recruiter, hiringManager, daysOpen,
    stage, costK, startQuarter, targetStart] = spec;
  return {id, role, level, dept, office, recruiter, hiringManager, daysOpen,
    stage, costK, startQuarter, scenario, targetStart};
}

const REQS: Req[] = [
  ...BASE_REQ_SPECS.map(spec => specToReq(spec, 'base')),
  ...STRETCH_REQ_SPECS.map(spec => specToReq(spec, 'stretch')),
];

// ---------------------------------------------------------------------------
// DERIVED AGGREGATES — computed once at module scope from the fixtures so
// KPIs, table rows, quarter cells, and pipeline counts always agree.
// ---------------------------------------------------------------------------

/** Requisitions active under a scenario (stretch includes the drafts). */
function reqsFor(scenario: Scenario): Req[] {
  return scenario === 'base'
    ? REQS.filter(req => req.scenario === 'base')
    : REQS;
}

interface DeptCounts {
  /** Seats being recruited (every stage except offer). */
  open: number;
  /** Seats with an offer out. */
  offer: number;
}

function countsByDept(scenario: Scenario): Record<DeptId, DeptCounts> {
  const counts = {} as Record<DeptId, DeptCounts>;
  for (const dept of DEPTS) {
    counts[dept.id] = {open: 0, offer: 0};
  }
  for (const req of reqsFor(scenario)) {
    if (req.stage === 'offer') {
      counts[req.dept].offer += 1;
    } else {
      counts[req.dept].open += 1;
    }
  }
  return counts;
}

const DEPT_COUNTS: Record<Scenario, Record<DeptId, DeptCounts>> = {
  base: countsByDept('base'),
  stretch: countsByDept('stretch'),
};

interface ScenarioTotals {
  plan: number;
  open: number;
  offer: number;
  /** Loaded annualized cost of every unfilled seat, $k. */
  runRateK: number;
}

function totalsFor(scenario: Scenario): ScenarioTotals {
  const active = reqsFor(scenario);
  return {
    plan: DEPTS.reduce((sum, dept) => sum + dept.plan[scenario], 0),
    open: active.filter(req => req.stage !== 'offer').length,
    offer: active.filter(req => req.stage === 'offer').length,
    runRateK: active.reduce((sum, req) => sum + req.costK, 0),
  };
}

// base: plan 156 / open 12 / offer 4 / $3.28M; stretch: 164 / 20 / 4 / $4.85M.
const TOTALS: Record<Scenario, ScenarioTotals> = {
  base: totalsFor('base'),
  stretch: totalsFor('stretch'),
};

// Quarterly hiring-cost impact — starts per quarter plus the cumulative
// incremental annualized run-rate once those seats draw payroll.
const QUARTER_LABELS = ['Q3 ’26', 'Q4 ’26', 'Q1 ’27', 'Q2 ’27'] as const;

interface QuarterImpact {
  label: string;
  starts: number;
  /** Cumulative incremental annualized run-rate through this quarter, $k. */
  cumulativeK: number;
}

function quarterImpacts(scenario: Scenario): QuarterImpact[] {
  const active = reqsFor(scenario);
  let running = 0;
  return QUARTER_LABELS.map((label, index) => {
    const starting = active.filter(req => req.startQuarter === index);
    running += starting.reduce((sum, req) => sum + req.costK, 0);
    return {label, starts: starting.length, cumulativeK: running};
  });
}

const QUARTER_IMPACTS: Record<Scenario, QuarterImpact[]> = {
  base: quarterImpacts('base'),
  stretch: quarterImpacts('stretch'),
};

/** Shared bar ceiling so base and stretch strips stay comparable. */
const MAX_QUARTER_K = TOTALS.stretch.runRateK;

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** $k → "$3.28M" (>= $1M) or "$268k". Pure — no locale APIs. */
function formatK(valueK: number): string {
  return valueK >= 1000
    ? `$${(valueK / 1000).toFixed(2)}M`
    : `$${valueK}k`;
}

function formatPct(part: number, whole: number): string {
  return `${((part / whole) * 100).toFixed(1)}%`;
}

/** Pipeline ordering: offers first, then deepest stage, then oldest. */
const STAGE_ORDER: Record<Stage, number> = {
  offer: 0,
  onsite: 1,
  screening: 2,
  sourcing: 3,
  draft: 4,
};

function compareReqs(a: Req, b: Req): number {
  const byStage = STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage];
  return byStage !== 0 ? byStage : b.daysOpen - a.daysOpen;
}

const SCENARIO_LABEL: Record<Scenario, string> = {
  base: 'Base plan',
  stretch: 'Stretch plan',
};

// ---------------------------------------------------------------------------
// KPI STRIP — plan / filled / open / offers summary tiles.
// ---------------------------------------------------------------------------

function KpiTile({
  icon,
  label,
  value,
  detail,
}: {
  icon: typeof UsersIcon;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div style={styles.kpiTile}>
      <HStack gap={2} vAlign="center">
        <Icon icon={icon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary" maxLines={1}>
          {label}
        </Text>
      </HStack>
      <span style={styles.kpiValue}>{value}</span>
      <Text type="supporting" color="secondary" maxLines={1}>
        {detail}
      </Text>
    </div>
  );
}

// ---------------------------------------------------------------------------
// UTILIZATION BAR — one stacked track per department: filled + offers +
// open segments proportioned against the scenario plan.
// ---------------------------------------------------------------------------

function UtilizationBar({
  filled,
  offer,
  open,
  plan,
  label,
}: {
  filled: number;
  offer: number;
  open: number;
  plan: number;
  label: string;
}) {
  const pct = (count: number) => `${(count / plan) * 100}%`;
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill" style={{minWidth: 0}}>
        <div
          style={styles.utilTrack}
          role="img"
          aria-label={`${label}: ${filled} filled, ${offer} at offer, ${open} open of ${plan} planned`}>
          <div
            style={{
              ...styles.utilSegment,
              width: pct(filled),
              backgroundColor: UTIL_COLOR.filled,
            }}
          />
          {offer > 0 ? (
            <div
              style={{
                ...styles.utilSegment,
                width: pct(offer),
                backgroundColor: UTIL_COLOR.offer,
              }}
            />
          ) : null}
          {open > 0 ? (
            <div
              style={{
                ...styles.utilSegment,
                width: pct(open),
                backgroundColor: UTIL_COLOR.open,
              }}
            />
          ) : null}
        </div>
      </StackItem>
      <Text
        type="supporting"
        color="secondary"
        hasTabularNumbers
        style={styles.utilPct}>
        {formatPct(filled, plan)}
      </Text>
    </HStack>
  );
}

const UTIL_LEGEND: {key: keyof typeof UTIL_COLOR; label: string}[] = [
  {key: 'filled', label: 'Filled'},
  {key: 'offer', label: 'Offer out'},
  {key: 'open', label: 'Open'},
];

function UtilizationLegend() {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.legendRow}>
      {UTIL_LEGEND.map(entry => (
        <HStack key={entry.key} gap={1} vAlign="center">
          <span
            style={{
              ...styles.legendSwatch,
              backgroundColor: UTIL_COLOR[entry.key],
            }}
          />
          <Text type="supporting" color="secondary">
            {entry.label}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// DEPARTMENT TABLE — plan vs actuals per department. Clicking a row scopes
// the requisition pipeline to that department; clicking again clears it.
// Footgun: children-mode Table cells carry max-width: 0, so every fixed
// column sets BOTH width and minWidth on its header cell.
// ---------------------------------------------------------------------------

function DeptTable({
  scenario,
  deptFilter,
  onToggleDept,
  hidesOffers,
}: {
  scenario: Scenario;
  deptFilter: DeptId | null;
  onToggleDept: (dept: DeptId) => void;
  hidesOffers: boolean;
}) {
  const totals = TOTALS[scenario];
  const numericCol: CSSProperties = {
    ...styles.numericHeader,
    width: 72,
    minWidth: 72,
  };
  return (
    <div style={styles.tableScrollX}>
      <Table
        density="balanced"
        dividers="rows"
        hasHover
        tableProps={{
          'aria-label': `Headcount by department — ${SCENARIO_LABEL[scenario]}`,
        }}>
        <TableHeader>
          <TableRow isHeaderRow>
            <TableHeaderCell scope="col" style={{minWidth: 190}}>
              Department
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={numericCol}>
              Plan
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={numericCol}>
              Filled
            </TableHeaderCell>
            {!hidesOffers && (
              <TableHeaderCell scope="col" style={numericCol}>
                Offers
              </TableHeaderCell>
            )}
            <TableHeaderCell scope="col" style={numericCol}>
              Open
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={{minWidth: 170}}>
              Utilization vs plan
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEPTS.map(dept => {
            const counts = DEPT_COUNTS[scenario][dept.id];
            const plan = dept.plan[scenario];
            const isSelected = deptFilter === dept.id;
            return (
              <TableRow
                key={dept.id}
                tabIndex={0}
                aria-selected={isSelected}
                onClick={() => onToggleDept(dept.id)}
                onKeyDown={event => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onToggleDept(dept.id);
                  }
                }}
                style={isSelected ? styles.rowSelected : styles.row}>
                <TableCell scope="row">
                  <HStack gap={2} vAlign="center">
                    <span
                      style={{...styles.deptDot, backgroundColor: dept.color}}
                    />
                    <VStack gap={0} style={{minWidth: 0}}>
                      <Text type="label" maxLines={1}>
                        {dept.label}
                      </Text>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {dept.lead} · {dept.leadRole}
                      </Text>
                    </VStack>
                  </HStack>
                </TableCell>
                <TableCell style={styles.numericCell}>
                  <Text type="body" hasTabularNumbers>
                    {plan}
                  </Text>
                </TableCell>
                <TableCell style={styles.numericCell}>
                  <Text type="body" hasTabularNumbers>
                    {dept.filled}
                  </Text>
                </TableCell>
                {!hidesOffers && (
                  <TableCell style={styles.numericCell}>
                    <Text
                      type="body"
                      hasTabularNumbers
                      color={counts.offer > 0 ? 'primary' : 'secondary'}>
                      {counts.offer > 0 ? counts.offer : '—'}
                    </Text>
                  </TableCell>
                )}
                <TableCell style={styles.numericCell}>
                  <Text
                    type="body"
                    hasTabularNumbers
                    color={counts.open > 0 ? 'primary' : 'secondary'}>
                    {counts.open > 0 ? counts.open : '—'}
                  </Text>
                </TableCell>
                <TableCell>
                  <UtilizationBar
                    filled={dept.filled}
                    offer={counts.offer}
                    open={counts.open}
                    plan={plan}
                    label={dept.label}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {/* Totals row — every figure is the sum of the rows above. */}
          <TableRow style={styles.totalsRow}>
            <TableCell scope="row">
              <Text type="label">All departments</Text>
            </TableCell>
            <TableCell style={styles.numericCell}>
              <Text type="label" hasTabularNumbers>
                {totals.plan}
              </Text>
            </TableCell>
            <TableCell style={styles.numericCell}>
              <Text type="label" hasTabularNumbers>
                {TOTAL_FILLED}
              </Text>
            </TableCell>
            {!hidesOffers && (
              <TableCell style={styles.numericCell}>
                <Text type="label" hasTabularNumbers>
                  {totals.offer}
                </Text>
              </TableCell>
            )}
            <TableCell style={styles.numericCell}>
              <Text type="label" hasTabularNumbers>
                {totals.open}
              </Text>
            </TableCell>
            <TableCell>
              <UtilizationBar
                filled={TOTAL_FILLED}
                offer={totals.offer}
                open={totals.open}
                plan={totals.plan}
                label="All departments"
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUARTERLY HIRING-COST STRIP — starts per quarter and the cumulative
// incremental annualized run-rate once those seats draw payroll. Bars share
// one ceiling (the full stretch run-rate) so scenarios stay comparable.
// ---------------------------------------------------------------------------

function QuarterStrip({
  scenario,
  isCompact,
}: {
  scenario: Scenario;
  isCompact: boolean;
}) {
  const impacts = QUARTER_IMPACTS[scenario];
  const totals = TOTALS[scenario];
  return (
    <VStack gap={2} style={styles.sectionBlock}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={CircleDollarSignIcon} size="sm" color="secondary" />
        <Heading level={2}>
          Hiring cost impact
        </Heading>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Full {SCENARIO_LABEL[scenario].toLowerCase()} adds{' '}
          {formatK(totals.runRateK)} annualized (loaded)
        </Text>
      </HStack>
      <div
        style={{
          ...styles.quarterGrid,
          ...(isCompact ? styles.quarterGridCompact : null),
        }}>
        {impacts.map(impact => (
          <div key={impact.label} style={styles.quarterCell}>
            <Text type="label" size="sm" color="secondary">
              {impact.label}
            </Text>
            <Text type="label" size="lg" hasTabularNumbers>
              {formatK(impact.cumulativeK)}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {impact.starts > 0
                ? `+${impact.starts} start${impact.starts === 1 ? '' : 's'} this quarter`
                : 'No new starts'}
            </Text>
            <div style={styles.quarterBarTrack}>
              <div
                style={{
                  ...styles.quarterBarFill,
                  width: `${(impact.cumulativeK / MAX_QUARTER_K) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Text type="supporting" color="secondary">
        Cumulative incremental run-rate by target start quarter · fully loaded
        cost, USD annualized.
      </Text>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// REQUISITION PIPELINE — one entry per unfilled seat: role, level, dept
// token, recruiter, days open, stage dots, loaded cost, target start.
// ---------------------------------------------------------------------------

function StageDots({stage}: {stage: Stage}) {
  const reached = STAGES.indexOf(stage as Exclude<Stage, 'draft'>);
  return (
    <span
      style={styles.stageDotRow}
      role="img"
      aria-label={`Stage: ${STAGE_LABEL[stage]}`}>
      {STAGES.map((step, index) => {
        const isDone = reached >= 0 && index <= reached;
        return (
          <span
            key={step}
            style={{
              ...styles.stageDot,
              backgroundColor: isDone
                ? step === 'offer'
                  ? UTIL_COLOR.offer
                  : 'var(--color-accent)'
                : 'var(--color-border)',
            }}
          />
        );
      })}
    </span>
  );
}

function ReqCard({req}: {req: Req}) {
  const dept = DEPT_BY_ID.get(req.dept);
  const isDraft = req.stage === 'draft';
  const isAging = req.daysOpen > 45;
  return (
    <div style={styles.reqCard}>
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary" style={styles.reqCode}>
          {req.id}
        </Text>
        <StackItem size="fill" />
        {isDraft ? (
          <Badge
            variant="info"
            label="Stretch"
            icon={<Icon icon={RocketIcon} size="xsm" color="inherit" />}
          />
        ) : null}
        {dept ? (
          <Token size="sm" color={dept.tokenColor} label={dept.label} />
        ) : null}
      </HStack>
      <VStack gap={0}>
        <Text type="label" maxLines={1}>
          {req.role}
        </Text>
        <HStack gap={1} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {req.level}
          </Text>
          <Text type="supporting" color="secondary">
            ·
          </Text>
          <Icon icon={MapPinIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary" maxLines={1}>
            {req.office}
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatK(req.costK)}/yr loaded
          </Text>
        </HStack>
      </VStack>
      <HStack gap={2} vAlign="center">
        <Avatar name={req.recruiter} size="xsmall" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {req.recruiter} · HM {req.hiringManager}
          </Text>
        </StackItem>
        {isDraft ? (
          <Text type="supporting" color="secondary" style={styles.daysOpen}>
            Not yet posted
          </Text>
        ) : (
          <Text
            type="supporting"
            color="secondary"
            style={isAging ? {...styles.daysOpen, ...styles.daysAging} : styles.daysOpen}>
            {req.daysOpen}d open{isAging ? ' · aging' : ''}
          </Text>
        )}
      </HStack>
      <HStack gap={2} vAlign="center">
        <StageDots stage={req.stage} />
        <Text type="supporting" color="secondary" maxLines={1}>
          {STAGE_LABEL[req.stage]}
        </Text>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
          {isDraft ? `Opens on approval · ${req.targetStart}` : `Target ${req.targetStart}`}
        </Text>
      </HStack>
    </div>
  );
}

function PipelineSection({
  scenario,
  deptFilter,
  onClearFilter,
  isInline,
}: {
  scenario: Scenario;
  deptFilter: DeptId | null;
  onClearFilter: () => void;
  /** True when the panel is folded into the main scroller (<=1180px). */
  isInline: boolean;
}) {
  const filterDept = deptFilter !== null ? DEPT_BY_ID.get(deptFilter) : null;
  // filter() already copies, so an in-place sort never mutates fixtures.
  const reqs = reqsFor(scenario)
    .filter(req => deptFilter === null || req.dept === deptFilter)
    .sort(compareReqs);
  const offerCount = reqs.filter(req => req.stage === 'offer').length;
  const draftCount = reqs.filter(req => req.stage === 'draft').length;

  const headerBlock = (
    <VStack gap={2} style={isInline ? undefined : styles.panelHeader}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ClipboardListIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>
            Requisition pipeline
          </Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {reqs.length} req{reqs.length === 1 ? '' : 's'}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {filterDept ? (
          <Token
            size="sm"
            color={filterDept.tokenColor}
            label={filterDept.label}
            onRemove={onClearFilter}
          />
        ) : (
          <Text type="supporting" color="secondary">
            All departments
          </Text>
        )}
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {offerCount} at offer
          {draftCount > 0 ? ` · ${draftCount} draft` : ''}
        </Text>
      </HStack>
    </VStack>
  );

  const cards = (
    <VStack gap={2}>
      {reqs.map(req => (
        <ReqCard key={req.id} req={req} />
      ))}
      {filterDept ? (
        <Button
          label="Show all departments"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={onClearFilter}
        />
      ) : null}
    </VStack>
  );

  if (isInline) {
    return (
      <VStack gap={3} style={styles.sectionBlock}>
        {headerBlock}
        {cards}
      </VStack>
    );
  }
  return (
    <div style={styles.panelFill}>
      {headerBlock}
      <Divider />
      <div style={styles.panelScroll}>
        <VStack gap={2} style={{paddingTop: 'var(--spacing-3)'}}>
          {cards}
        </VStack>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function HrHeadcountPlanningTemplate() {
  const [scenario, setScenario] = useState<Scenario>('base');
  const [deptFilter, setDeptFilter] = useState<DeptId | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px folds the pipeline panel inline;
  // <=860px compacts the KPI/quarter grids; <=768px drops Offers.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');
  const hidesOffers = useMediaQuery('(max-width: 768px)');

  const totals = TOTALS[scenario];
  const toHire = totals.plan - TOTAL_FILLED;

  // KPI sub-lines derived from the same requisition fixtures.
  const {onsiteCount, draftCount} = useMemo(() => {
    const active = reqsFor(scenario);
    return {
      onsiteCount: active.filter(req => req.stage === 'onsite').length,
      draftCount: active.filter(req => req.stage === 'draft').length,
    };
  }, [scenario]);

  const changeScenario = (next: Scenario) => {
    setScenario(next);
    setAnnouncement(
      `Switched to the ${SCENARIO_LABEL[next].toLowerCase()} — plan ${TOTALS[next].plan}, ${TOTALS[next].open} open requisitions.`,
    );
  };

  const toggleDept = (dept: DeptId) => {
    const next = deptFilter === dept ? null : dept;
    setDeptFilter(next);
    setAnnouncement(
      next === null
        ? 'Pipeline shows all departments.'
        : `Pipeline scoped to ${DEPT_BY_ID.get(next)?.label ?? next}.`,
    );
  };

  const clearFilter = () => {
    setDeptFilter(null);
    setAnnouncement('Pipeline shows all departments.');
  };

  const exportPlan = () => {
    setAnnouncement(
      `Exported the ${SCENARIO_LABEL[scenario].toLowerCase()} headcount plan as CSV.`,
    );
  };

  // ----- header: brand, scenario toggle, export -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="md" color="secondary" />
          <Heading level={1}>Headcount Planning</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · FY26 plan of record
          </Text>
        </HStack>
        <StackItem size="fill" />
        {/* Scenario toggle — swaps every number on the page. Labels are
            short so the control never wraps (footgun #7). */}
        <SegmentedControl
          value={scenario}
          onChange={value => changeScenario(value as Scenario)}
          label="Headcount scenario"
          size="sm">
          <SegmentedControlItem value="base" label="Base plan" />
          <SegmentedControlItem value="stretch" label="Stretch plan" />
        </SegmentedControl>
        <Button
          label="Export plan"
          variant="secondary"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          onClick={exportPlan}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- KPI strip: plan / filled / open / offers -----
  const kpiStrip = (
    <div
      style={{
        ...styles.kpiGrid,
        ...(isCompact ? styles.kpiGridCompact : null),
      }}>
      {/* Copy stays short — beside the 360px panel each tile is ~130px of
          text, so long labels/details ellipsize (footgun: maxLines={1}). */}
      <KpiTile
        icon={CrosshairIcon}
        label={`Plan · ${scenario === 'base' ? 'Base' : 'Stretch'}`}
        value={String(totals.plan)}
        detail={`+${toHire} seats to hire`}
      />
      <KpiTile
        icon={UsersIcon}
        label="Filled"
        value={String(TOTAL_FILLED)}
        detail={`${formatPct(TOTAL_FILLED, totals.plan)} of FY26 plan`}
      />
      <KpiTile
        icon={BriefcaseIcon}
        label="Open reqs"
        value={String(totals.open)}
        detail={
          draftCount > 0
            ? `+${draftCount} stretch drafts`
            : `${onsiteCount} at onsite stage`
        }
      />
      <KpiTile
        icon={HandshakeIcon}
        label="Offers out"
        value={String(totals.offer)}
        detail="All start in Q3 ’26"
      />
    </div>
  );

  // ----- department section: legend + plan-vs-actuals table -----
  const deptSection = (
    <VStack gap={2} style={styles.sectionBlock}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>Plan vs actuals by department</Heading>
        <StackItem size="fill" />
        <UtilizationLegend />
      </HStack>
      <Text type="supporting" color="secondary">
        Select a department row to scope the requisition pipeline.
      </Text>
      <DeptTable
        scenario={scenario}
        deptFilter={deptFilter}
        onToggleDept={toggleDept}
        hidesOffers={hidesOffers}
      />
    </VStack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <VStack gap={4}>
                {kpiStrip}
                <div style={styles.noteRow}>
                  <Icon icon={InfoIcon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    {ONBOARDING_NOTE} Plan figures are approved seats for
                    FY26; the stretch plan needs sign-off from Elena Voss
                    (Finance) before its 8 draft seats post.
                  </Text>
                </div>
                {deptSection}
                <Divider />
                <QuarterStrip scenario={scenario} isCompact={isCompact} />
                {isPanelHidden ? (
                  <>
                    <Divider />
                    <PipelineSection
                      scenario={scenario}
                      deptFilter={deptFilter}
                      onClearFilter={clearFilter}
                      isInline
                    />
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={360}
              padding={0}
              hasDivider
              label="Requisition pipeline">
              <PipelineSection
                scenario={scenario}
                deptFilter={deptFilter}
                onClearFilter={clearFilter}
                isInline={false}
              />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
