var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs compliance
 *   training program as of a fixed Jul 20, 2026 snapshot: three courses
 *   (Security Awareness 2026, Harassment Prevention (CA), Data Privacy
 *   Essentials), per-department completed counts for each course (the six
 *   canonical departments sum to 140 employees; the CA cohort sums to 58),
 *   a 12-person overdue roster with per-employee due dates and fixed
 *   last-reminded ISO timestamps, four auto-assignment rules, and a fixed
 *   last-audit-export record. No clocks, no Math.random(), no network
 *   media; every ring %, heat cell, and overdue count is derived from the
 *   same module-scope fixtures so all panels reconcile by construction.
 * @output Compliance Training Tracker — the training-assignments admin
 *   surface for Kestrel Labs (140-person platform company). Course cards
 *   with SVG completion rings, due dates, and overdue counts; a
 *   department x course completion heat table (% cells tinted amber below
 *   85% and red below 70%, with an all-departments totals row); an
 *   overdue-employees panel with days-overdue, per-row Remind buttons, and
 *   last-reminded timestamps; auto-assignment rule tiles (new hires within
 *   30 days, CA employees annually) with enable switches and last-run
 *   notes; and an audit-export header button with a last-export note.
 *   Clicking a course card or a department row scopes the overdue panel.
 * @position Page template; emitted by \`astryx template hr-compliance-training\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, as-of note, audit-export button + last-export note)
 *   | content (course-card grid, heat table, auto-assignment rules — one
 *     vertical scroller)
 *   | end panel 340 (overdue employees, scrolls independently).
 *
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Course cards are styled <button> tiles (they are the course
 *   filter), rule tiles and overdue entries are styled bordered divs, and
 *   the overdue list lives in a LayoutPanel.
 *
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens (course rings, tokens, ring tracks) and the
 *   \`light-dark()\` tint/text pairs on heat-table cells and days-overdue
 *   readouts (amber/red/green compliance tiers) — the demo does not
 *   inject \`--color-data-categorical-*\`.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px overdue panel on the end edge.
 * - <= 1180px: the overdue panel drops and the same overdue section
 *   renders inline below the rules section in the main scroller, so every
 *   delinquent assignment stays reachable.
 * - <= 860px: the course-card grid falls from 3-up to 1-up, the rules
 *   grid from 2-up to 1-up, and the header row wraps instead of clipping
 *   the export button or the last-export note.
 * - The heat table scrolls horizontally behind a deliberate overflow-x
 *   wrapper on narrow viewports; the content column and the overdue panel
 *   scroll independently (\`minHeight: 0\` down each flex chain).
 */

import {useState, type CSSProperties} from 'react';

import {
  BellRingIcon,
  CalendarClockIcon,
  CheckIcon,
  DownloadIcon,
  FileCheck2Icon,
  FilterXIcon,
  LockKeyholeIcon,
  MapPinIcon,
  RepeatIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserPlusIcon,
  ZapIcon,
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
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Switch} from '@astryxdesign/core/Switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sectionBlock: {minWidth: 0},
  headerNote: {minWidth: 0},
  // Course cards --------------------------------------------------------
  courseGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  courseGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  // The card is a real <button> (it is the course filter) — reset the
  // UA button chrome and restyle as a bordered tile.
  courseCard: {
    appearance: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  // Inset outline so the selected card never bleeds onto neighbors.
  courseCardSelected: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  ringWrap: {position: 'relative', width: 72, height: 72, flexShrink: 0},
  ringCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: {
    fontSize: 15,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  courseMetaRow: {rowGap: 4},
  // Reserve two title lines so rings and token rows align across cards
  // whether or not a course name wraps.
  courseTitleRow: {minHeight: 40},
  courseTitleIcon: {marginTop: 2},
  // Reserve two supporting-text lines so the token/last-run rows align
  // across rule tiles whose trigger sentences wrap differently.
  ruleTrigger: {minHeight: 34},
  // Heat table -----------------------------------------------------------
  tableScrollX: {overflowX: 'auto', minWidth: 0},
  heatPct: {
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  heatFraction: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  heatCellTd: {textAlign: 'end'},
  heatCellInner: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 2,
    alignItems: 'flex-end',
    padding: '2px 6px',
    borderRadius: 'var(--radius-control, 6px)',
  },
  // Intentional literals (light-dark tint/text pairs): compliance tiers
  // must read identically in both schemes; dark side uses translucent
  // tints of the 400-weight hue so row hover still shows through.
  tierStrong: {
    backgroundColor: 'light-dark(#DCFCE7, rgba(74,222,128,0.14))',
    color: 'light-dark(#166534, #4ADE80)',
  },
  tierWarn: {
    backgroundColor: 'light-dark(#FEF3C7, rgba(251,191,36,0.16))',
    color: 'light-dark(#92400E, #FBBF24)',
  },
  tierLow: {
    backgroundColor: 'light-dark(#FEE2E2, rgba(248,113,113,0.16))',
    color: 'light-dark(#B91C1C, #F87171)',
  },
  deptCellRow: {cursor: 'pointer'},
  deptRowSelected: {
    cursor: 'pointer',
    // Inset outline so the active row never bleeds onto neighbors.
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  totalsRow: {backgroundColor: 'var(--color-background-muted)'},
  // Accent underline marks the course column scoped by the card filter.
  colActiveHeader: {boxShadow: 'inset 0 -2px 0 var(--color-accent)'},
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  legendRow: {rowGap: 4},
  numericHeader: {textAlign: 'end'},
  // Auto-assignment rules --------------------------------------------------
  ruleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  ruleGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  ruleTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  // Paused rules read as inactive via the muted surface — never opacity,
  // which drops the supporting text below AA contrast.
  ruleTilePaused: {backgroundColor: 'var(--color-background-muted)'},
  // Overdue panel -----------------------------------------------------------
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
  overdueTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  // Intentional literal (light-dark pair): days-overdue reads as a red
  // delinquency figure in both schemes — AA on the surface token.
  daysOverdue: {
    color: 'light-dark(#B91C1C, #F87171)',
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  dueLine: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
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
// carries the repo-standard \`light-dark()\` fallback pair.
const VIZ = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  pink: 'light-dark(#DB2777, #F472B6)',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs, a 140-person platform
// company. Snapshot date is fixed: Mon, Jul 20, 2026. Canonical department
// headcounts (sum 140): Engineering 52, Design 18, GTM 34, Ops 16,
// Finance 8, People 12. The CA cohort (SF HQ office) sums to 58.
//
// Reconciliation is by construction: course cards, heat cells, the totals
// row, and the overdue panel all derive from COMPLETED + the OVERDUE
// roster below. For every past-due course, assigned − completed equals the
// number of overdue roster rows (Data Privacy 140 − 131 = 9; Harassment
// Prevention CA 58 − 55 = 3). Security Awareness is mid-window (due
// Jul 31), so its 25 incomplete assignments are in progress, not overdue.
// ---------------------------------------------------------------------------

const AS_OF_LABEL = 'Jul 20, 2026';
/** Fixed "now" used when a Remind button fires — no clocks. */
const REMINDED_NOW_ISO = '2026-07-20T09:15:00Z';
/** Fixed "now" used when the audit export fires — no clocks. */
const EXPORT_NOW_ISO = '2026-07-20T09:12:00Z';

type DeptId = 'eng' | 'design' | 'gtm' | 'ops' | 'finance' | 'people';
type CourseId = 'sec' | 'ca' | 'privacy';

interface DeptMeta {
  id: DeptId;
  label: string;
  /** Canonical filled seats — sums to 140 across the suite. */
  headcount: number;
  /** SF HQ (California) employees — the Harassment Prevention cohort. */
  caHeadcount: number;
  tokenColor: 'blue' | 'purple' | 'orange' | 'teal' | 'green' | 'pink';
}

const DEPTS: DeptMeta[] = [
  {id: 'eng', label: 'Engineering', headcount: 52, caHeadcount: 18, tokenColor: 'blue'},
  {id: 'design', label: 'Design', headcount: 18, caHeadcount: 8, tokenColor: 'purple'},
  {id: 'gtm', label: 'GTM', headcount: 34, caHeadcount: 16, tokenColor: 'orange'},
  {id: 'ops', label: 'Ops', headcount: 16, caHeadcount: 9, tokenColor: 'teal'},
  {id: 'finance', label: 'Finance', headcount: 8, caHeadcount: 3, tokenColor: 'green'},
  {id: 'people', label: 'People', headcount: 12, caHeadcount: 4, tokenColor: 'pink'},
];

const DEPT_BY_ID = new Map(DEPTS.map(dept => [dept.id, dept]));

/** Canonical company size — the sum of every department's headcount (140). */
const TOTAL_HEADCOUNT = DEPTS.reduce((sum, dept) => sum + dept.headcount, 0);
/** CA cohort size — the sum of every department's SF HQ seats (58). */
const TOTAL_CA = DEPTS.reduce((sum, dept) => sum + dept.caHeadcount, 0);

interface CourseMeta {
  id: CourseId;
  name: string;
  /** Short label for heat-table columns and per-row tokens. */
  shortName: string;
  icon: typeof ShieldCheckIcon;
  color: string;
  tokenColor: 'blue' | 'purple' | 'teal';
  /** Who the course is assigned to. */
  audience: 'all' | 'ca';
  audienceLabel: string;
  cadence: string;
  /** Cycle due date shown on the card. */
  dueLabel: string;
  /** True once the cycle due date is behind the Jul 20 snapshot. */
  isPastDue: boolean;
  /** Card footnote explaining the due-date mechanics. */
  dueNote: string;
}

const COURSES: CourseMeta[] = [
  {
    id: 'sec',
    name: 'Security Awareness 2026',
    shortName: 'Security',
    icon: ShieldCheckIcon,
    color: VIZ.blue,
    tokenColor: 'blue',
    audience: 'all',
    audienceLabel: 'All 140 employees',
    cadence: 'Annual cycle',
    dueLabel: 'Due Jul 31, 2026',
    isPastDue: false,
    dueNote: 'Window Jul 1 – Jul 31 · 11 days left',
  },
  {
    id: 'ca',
    name: 'Harassment Prevention (CA)',
    shortName: 'Harassment CA',
    icon: ScaleIcon,
    color: VIZ.purple,
    tokenColor: 'purple',
    audience: 'ca',
    audienceLabel: '58 CA employees',
    cadence: 'Annual · hire anniversary',
    dueLabel: 'Due on hire anniversary',
    isPastDue: true,
    dueNote: 'SB 1343 · rolling due dates',
  },
  {
    id: 'privacy',
    name: 'Data Privacy Essentials',
    shortName: 'Data Privacy',
    icon: LockKeyholeIcon,
    color: VIZ.teal,
    tokenColor: 'teal',
    audience: 'all',
    audienceLabel: 'All 140 employees',
    cadence: 'Annual recertification',
    dueLabel: 'Cycle due Jul 6, 2026',
    isPastDue: true,
    dueNote: 'Late assignees get +30 days',
  },
];

const COURSE_BY_ID = new Map(COURSES.map(course => [course.id, course]));

// ---------------------------------------------------------------------------
// COMPLETED counts per department per course. Assigned counts derive from
// DEPTS (headcount for all-hands courses, caHeadcount for the CA course),
// so heat cells, card rings, and the totals row reconcile by construction:
//   Security Awareness  46+16+22+13+7+11 = 115 of 140 (82%, mid-window)
//   Harassment Prev CA  17+ 8+14+ 9+3+ 4 =  55 of  58 (95%, 3 overdue)
//   Data Privacy        49+17+30+15+8+12 = 131 of 140 (94%, 9 overdue)
// ---------------------------------------------------------------------------

const COMPLETED: Record<DeptId, Record<CourseId, number>> = {
  eng: {sec: 46, ca: 17, privacy: 49},
  design: {sec: 16, ca: 8, privacy: 17},
  gtm: {sec: 22, ca: 14, privacy: 30},
  ops: {sec: 13, ca: 9, privacy: 15},
  finance: {sec: 7, ca: 3, privacy: 8},
  people: {sec: 11, ca: 4, privacy: 12},
};

function assignedFor(dept: DeptMeta, course: CourseMeta): number {
  return course.audience === 'ca' ? dept.caHeadcount : dept.headcount;
}

interface CourseTotals {
  assigned: number;
  completed: number;
  pct: number;
}

function courseTotals(course: CourseMeta): CourseTotals {
  const assigned = course.audience === 'ca' ? TOTAL_CA : TOTAL_HEADCOUNT;
  const completed = DEPTS.reduce(
    (sum, dept) => sum + COMPLETED[dept.id][course.id],
    0,
  );
  return {assigned, completed, pct: Math.round((completed / assigned) * 100)};
}

/** Derived once at module scope — sec 115/140, ca 55/58, privacy 131/140. */
const COURSE_TOTALS: Record<CourseId, CourseTotals> = {
  sec: courseTotals(COURSES[0]),
  ca: courseTotals(COURSES[1]),
  privacy: courseTotals(COURSES[2]),
};

// ---------------------------------------------------------------------------
// OVERDUE ROSTER — every incomplete assignment on a past-due course, one
// row per employee. Per-employee due dates vary (annual anniversaries and
// +30-day windows for late assignees); daysOverdue is the fixed gap to the
// Jul 20 snapshot. Department tallies match the COMPLETED math above:
//   Data Privacy: Eng 3, GTM 4, Ops 1, Design 1 → 9
//   Harassment CA: Eng 1, GTM 2 → 3
// ---------------------------------------------------------------------------

interface OverdueEmployee {
  id: string;
  name: string;
  role: string;
  dept: DeptId;
  course: CourseId;
  /** Display due date — dueLabel + daysOverdue reconcile with Jul 20. */
  dueLabel: string;
  daysOverdue: number;
  /** Fixed ISO timestamp of the last nudge, or null if never reminded. */
  lastRemindedAt: string | null;
}

// Compact fixture rows: [id, name, role, dept, course, dueLabel,
// daysOverdue, lastRemindedAt]
type OverdueSpec = [
  string,
  string,
  string,
  DeptId,
  CourseId,
  string,
  number,
  string | null,
];

const OVERDUE_SPECS: OverdueSpec[] = [
  // ---- Data Privacy Essentials (cycle due Jul 6) ----
  ['od-01', 'Caleb Nguyen', 'Backend Engineer', 'eng', 'privacy',
    'Jul 6, 2026', 14, '2026-07-15T16:00:00Z'],
  ['od-02', 'Ingrid Solberg', 'Data Engineer', 'eng', 'privacy',
    'Jul 6, 2026', 14, '2026-07-15T16:00:00Z'],
  ['od-03', 'Tessa Bright', 'Account Executive', 'gtm', 'privacy',
    'Jul 6, 2026', 14, '2026-07-15T16:00:00Z'],
  ['od-04', 'Marcus Webb', 'Platform lead', 'eng', 'privacy',
    'Jul 8, 2026', 12, '2026-07-17T09:30:00Z'],
  ['od-05', 'Diego Fuentes', 'Sales Engineer', 'gtm', 'privacy',
    'Jul 11, 2026', 9, null],
  ['od-06', 'Hannah Kim', 'Lifecycle Marketing Mgr', 'gtm', 'privacy',
    'Jul 12, 2026', 8, '2026-07-18T10:00:00Z'],
  ['od-07', 'Omar Haddad', 'Ops lead', 'ops', 'privacy',
    'Jul 12, 2026', 8, '2026-07-18T10:00:00Z'],
  ['od-08', 'Ravi Patel', 'Sales Development Rep', 'gtm', 'privacy',
    'Jul 15, 2026', 5, null],
  ['od-09', 'Lucie Marchand', 'Product Designer', 'design', 'privacy',
    'Jul 18, 2026', 2, null],
  // ---- Harassment Prevention (CA) — hire-anniversary due dates ----
  ['od-10', 'Noah Alvarez', 'Frontend Engineer', 'eng', 'ca',
    'Jul 10, 2026', 10, '2026-07-16T14:20:00Z'],
  ['od-11', 'Britt Sanders', 'Field Marketing Mgr', 'gtm', 'ca',
    'Jul 14, 2026', 6, null],
  ['od-12', 'Jonah Fields', 'GTM lead', 'gtm', 'ca',
    'Jul 17, 2026', 3, '2026-07-19T08:45:00Z'],
];

const OVERDUE: OverdueEmployee[] = OVERDUE_SPECS.map(
  ([id, name, role, dept, course, dueLabel, daysOverdue, lastRemindedAt]) => ({
    id, name, role, dept, course, dueLabel, daysOverdue, lastRemindedAt,
  }),
);

/** Derived overdue counts per course — privacy 9, ca 3, sec 0. */
const OVERDUE_BY_COURSE: Record<CourseId, number> = {
  sec: OVERDUE.filter(row => row.course === 'sec').length,
  ca: OVERDUE.filter(row => row.course === 'ca').length,
  privacy: OVERDUE.filter(row => row.course === 'privacy').length,
};

const TOTAL_OVERDUE = OVERDUE.length; // 12

// ---------------------------------------------------------------------------
// AUTO-ASSIGNMENT RULES — the enrollment automations that produced the
// assignments above. The two pending hires (Ava Lindqvist, Ken Tanaka) are
// queued by the new-hire rule, never counted in the 140 active roster.
// ---------------------------------------------------------------------------

interface AssignmentRule {
  id: string;
  name: string;
  icon: typeof ZapIcon;
  /** Plain-language trigger → action sentence. */
  trigger: string;
  audienceToken: string;
  isEnabledDefault: boolean;
  lastRunAt: string;
  /** What the last run matched — repeats figures other panels agree on. */
  matchNote: string;
}

const RULES: AssignmentRule[] = [
  {
    id: 'r-newhire',
    name: 'New hires',
    icon: UserPlusIcon,
    trigger:
      'Assign all three core courses within 30 days of start date.',
    audienceToken: 'Every new hire',
    isEnabledDefault: true,
    lastRunAt: '2026-07-20T06:00:00Z',
    matchNote:
      '2 queued: Ava Lindqvist (starts Jul 27), Ken Tanaka (starts Aug 3)',
  },
  {
    id: 'r-ca',
    name: 'CA employees',
    icon: MapPinIcon,
    trigger:
      'Re-assign Harassment Prevention (CA) annually on each hire anniversary.',
    audienceToken: '58 SF HQ employees',
    isEnabledDefault: true,
    lastRunAt: '2026-07-20T06:00:00Z',
    matchNote: '4 anniversaries assigned in July · 3 currently overdue',
  },
  {
    id: 'r-annual-sec',
    name: 'Annual security cycle',
    icon: RepeatIcon,
    trigger:
      'Assign Security Awareness to every active employee each July 1.',
    audienceToken: 'All 140 employees',
    isEnabledDefault: true,
    lastRunAt: '2026-07-01T06:00:00Z',
    matchNote: '140 assigned Jul 1 · 115 complete so far',
  },
  {
    id: 'r-contractor',
    name: 'Contractors',
    icon: ZapIcon,
    trigger:
      'Assign Data Privacy Essentials before any system access is granted.',
    audienceToken: 'Contractors',
    isEnabledDefault: false,
    lastRunAt: '2026-06-12T06:00:00Z',
    matchNote: 'Paused · 0 active contractors this quarter',
  },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

type HeatTier = 'strong' | 'ok' | 'warn' | 'low';

/** Compliance tiers: >=95 strong, 85–94 neutral, 70–84 amber, <70 red. */
function heatTier(pct: number): HeatTier {
  if (pct >= 95) {
    return 'strong';
  }
  if (pct >= 85) {
    return 'ok';
  }
  if (pct >= 70) {
    return 'warn';
  }
  return 'low';
}

const TIER_STYLE: Record<HeatTier, CSSProperties | undefined> = {
  strong: styles.tierStrong,
  ok: undefined,
  warn: styles.tierWarn,
  low: styles.tierLow,
};

const TIER_LEGEND: {tier: HeatTier; label: string; swatch: CSSProperties}[] = [
  {tier: 'strong', label: '≥ 95% complete', swatch: styles.tierStrong ?? {}},
  // 'ok' cells render untinted, so the legend swatch is the bare surface
  // (border only) — a filled gray swatch would promise a fill no cell has.
  {
    tier: 'ok',
    label: '85–94%',
    swatch: {backgroundColor: 'var(--color-background-surface)'},
  },
  {tier: 'warn', label: '70–84%', swatch: styles.tierWarn ?? {}},
  {tier: 'low', label: '< 70%', swatch: styles.tierLow ?? {}},
];

function pctOf(completed: number, assigned: number): number {
  return Math.round((completed / assigned) * 100);
}

// ---------------------------------------------------------------------------
// COMPLETION RING — deterministic SVG donut; the arc length derives from
// the same completed/assigned fixture the card's fraction line repeats.
// ---------------------------------------------------------------------------

const RING_SIZE = 72;
const RING_STROKE = 7;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function CompletionRing({
  pct,
  color,
  label,
}: {
  pct: number;
  color: string;
  label: string;
}) {
  const arc = (pct / 100) * RING_CIRCUMFERENCE;
  return (
    <div style={styles.ringWrap} role="img" aria-label={label}>
      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={\`0 0 \${RING_SIZE} \${RING_SIZE}\`}
        aria-hidden="true">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="var(--color-background-muted)"
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={\`\${arc} \${RING_CIRCUMFERENCE - arc}\`}
          transform={\`rotate(-90 \${RING_SIZE / 2} \${RING_SIZE / 2})\`}
        />
      </svg>
      <div style={styles.ringCenter}>
        <span style={styles.ringPct}>{pct}%</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// COURSE CARDS — one tile per course: ring, audience, due date, overdue
// count. The card is a <button> that toggles the course filter scoping the
// heat-table column highlight and the overdue panel.
// ---------------------------------------------------------------------------

function CourseCard({
  course,
  isSelected,
  onToggle,
}: {
  course: CourseMeta;
  isSelected: boolean;
  onToggle: (id: CourseId) => void;
}) {
  const totals = COURSE_TOTALS[course.id];
  const overdueCount = OVERDUE_BY_COURSE[course.id];
  const inProgress = totals.assigned - totals.completed - overdueCount;
  return (
    <button
      type="button"
      style={{
        ...styles.courseCard,
        ...(isSelected ? styles.courseCardSelected : null),
      }}
      aria-pressed={isSelected}
      onClick={() => onToggle(course.id)}>
      {/* Title spans the full card width — the narrow beside-the-ring
          column ellipsizes every course name, so the ring row sits below. */}
      <HStack gap={2} vAlign="start" style={styles.courseTitleRow}>
        <span
          style={{
            color: course.color,
            display: 'inline-flex',
            ...styles.courseTitleIcon,
          }}>
          <Icon icon={course.icon} size="sm" color="inherit" />
        </span>
        <Text type="label" maxLines={2}>
          {course.name}
        </Text>
      </HStack>
      <HStack gap={3} vAlign="center">
        <CompletionRing
          pct={totals.pct}
          color={course.color}
          label={\`\${course.name}: \${totals.pct}% complete\`}
        />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary" maxLines={1}>
              {course.audienceLabel}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
              {totals.completed}/{totals.assigned} complete
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap" style={styles.courseMetaRow}>
        <Token
          size="sm"
          color="gray"
          label={course.dueLabel}
          icon={<Icon icon={CalendarClockIcon} size="xsm" color="inherit" />}
        />
        {overdueCount > 0 ? (
          <Badge variant="error" label={\`\${overdueCount} overdue\`} />
        ) : (
          <Badge
            variant="neutral"
            label={\`\${inProgress} in progress\`}
          />
        )}
      </HStack>
      <Text type="supporting" color="secondary" maxLines={2}>
        {course.cadence} · {course.dueNote}
      </Text>
    </button>
  );
}

// ---------------------------------------------------------------------------
// HEAT TABLE — departments x courses, % complete per cell with compliance
// tinting (amber 70–84%, red < 70%, green >= 95%). Clicking a row scopes
// the overdue panel to that department; clicking again clears it.
// Footgun: children-mode Table cells carry max-width: 0, so every fixed
// column sets BOTH width and minWidth on its header cell.
// ---------------------------------------------------------------------------

function HeatCell({
  completed,
  assigned,
}: {
  completed: number;
  assigned: number;
}) {
  const pct = pctOf(completed, assigned);
  const tier = heatTier(pct);
  return (
    <div style={{...styles.heatCellInner, ...TIER_STYLE[tier]}}>
      <span style={styles.heatPct}>{pct}%</span>
      <Text type="supporting" color="secondary" style={styles.heatFraction}>
        {completed}/{assigned}
      </Text>
    </div>
  );
}

function TierLegend() {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.legendRow}>
      {TIER_LEGEND.map(entry => (
        <HStack key={entry.tier} gap={1} vAlign="center">
          <span
            style={{
              ...styles.legendSwatch,
              backgroundColor:
                entry.swatch.backgroundColor ?? 'var(--color-background-muted)',
              border: 'var(--border-width) solid var(--color-border)',
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

function HeatTable({
  courseFilter,
  deptFilter,
  onToggleDept,
}: {
  courseFilter: CourseId | null;
  deptFilter: DeptId | null;
  onToggleDept: (dept: DeptId) => void;
}) {
  const courseCol: CSSProperties = {
    ...styles.numericHeader,
    width: 140,
    minWidth: 140,
  };
  return (
    <div style={styles.tableScrollX}>
      <Table
        density="balanced"
        dividers="rows"
        hasHover
        tableProps={{
          'aria-label':
            'Completion by department and course — Jul 20, 2026 snapshot',
        }}>
        <TableHeader>
          <TableRow isHeaderRow>
            <TableHeaderCell scope="col" style={{minWidth: 180}}>
              Department
            </TableHeaderCell>
            {COURSES.map(course => (
              <TableHeaderCell
                key={course.id}
                scope="col"
                style={{
                  ...courseCol,
                  ...(courseFilter === course.id
                    ? styles.colActiveHeader
                    : null),
                }}>
                {course.shortName}
              </TableHeaderCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {DEPTS.map(dept => {
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
                style={isSelected ? styles.deptRowSelected : styles.deptCellRow}>
                <TableCell>
                  <HStack gap={2} vAlign="center">
                    <Token size="sm" color={dept.tokenColor} label={dept.label} />
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers
                      maxLines={1}>
                      {dept.headcount} people · {dept.caHeadcount} CA
                    </Text>
                  </HStack>
                </TableCell>
                {COURSES.map(course => (
                  <TableCell key={course.id} style={styles.heatCellTd}>
                    <HeatCell
                      completed={COMPLETED[dept.id][course.id]}
                      assigned={assignedFor(dept, course)}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
          <TableRow style={styles.totalsRow}>
            <TableCell>
              <HStack gap={2} vAlign="center">
                <Text type="label">All departments</Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {TOTAL_HEADCOUNT} people · {TOTAL_CA} CA
                </Text>
              </HStack>
            </TableCell>
            {COURSES.map(course => {
              const totals = COURSE_TOTALS[course.id];
              return (
                <TableCell key={course.id} style={styles.heatCellTd}>
                  <HeatCell
                    completed={totals.completed}
                    assigned={totals.assigned}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AUTO-ASSIGNMENT RULES — enrollment automations with enable switches,
// last-run timestamps, and match notes that repeat figures the other
// panels agree on (58 CA employees, 140 assigned, the 2 pending hires).
// ---------------------------------------------------------------------------

function RuleTile({
  rule,
  isEnabled,
  onToggle,
}: {
  rule: AssignmentRule;
  isEnabled: boolean;
  onToggle: (id: string, next: boolean) => void;
}) {
  return (
    <div
      style={{
        ...styles.ruleTile,
        ...(isEnabled ? null : styles.ruleTilePaused),
      }}>
      <HStack gap={2} vAlign="center">
        <Icon icon={rule.icon} size="sm" color="secondary" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            {rule.name}
          </Text>
        </StackItem>
        <Switch
          label={\`\${rule.name} rule enabled\`}
          isLabelHidden
          value={isEnabled}
          onChange={next => onToggle(rule.id, next)}
        />
      </HStack>
      <div style={styles.ruleTrigger}>
        <Text type="supporting" color="secondary">
          {rule.trigger}
        </Text>
      </div>
      <HStack gap={2} vAlign="center" wrap="wrap" style={styles.legendRow}>
        <Token size="sm" color="gray" label={rule.audienceToken} />
        <Text type="supporting" color="secondary">
          Last run <Timestamp value={rule.lastRunAt} format="date_time" />
        </Text>
      </HStack>
      <Text type="supporting" color="secondary" maxLines={2}>
        {rule.matchNote}
      </Text>
    </div>
  );
}

function RulesSection({
  enabledRules,
  onToggleRule,
  isCompact,
}: {
  enabledRules: Record<string, boolean>;
  onToggleRule: (id: string, next: boolean) => void;
  isCompact: boolean;
}) {
  return (
    <VStack gap={3} style={styles.sectionBlock}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={ZapIcon} size="sm" color="secondary" />
        <Heading level={2}>
          Auto-assignment rules
        </Heading>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary">
          Runs daily at 06:00 UTC
        </Text>
      </HStack>
      <div
        style={{
          ...styles.ruleGrid,
          ...(isCompact ? styles.ruleGridCompact : null),
        }}>
        {RULES.map(rule => (
          <RuleTile
            key={rule.id}
            rule={rule}
            isEnabled={enabledRules[rule.id] ?? rule.isEnabledDefault}
            onToggle={onToggleRule}
          />
        ))}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// OVERDUE PANEL — every delinquent assignment, worst first. Each row shows
// days overdue, the per-employee due date, the last-reminded timestamp,
// and a Remind button that stamps the fixed Jul 20 09:15 fixture time.
// ---------------------------------------------------------------------------

function OverdueRow({
  row,
  remindedAt,
  onRemind,
}: {
  row: OverdueEmployee;
  remindedAt: string | undefined;
  onRemind: (id: string, name: string) => void;
}) {
  const dept = DEPT_BY_ID.get(row.dept);
  const course = COURSE_BY_ID.get(row.course);
  const lastReminded = remindedAt ?? row.lastRemindedAt;
  const wasJustReminded = remindedAt !== undefined;
  return (
    <div style={styles.overdueTile}>
      <HStack gap={2} vAlign="center">
        <Avatar name={row.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {row.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {row.role}
            </Text>
          </VStack>
        </StackItem>
        <span style={styles.daysOverdue}>{row.daysOverdue}d overdue</span>
      </HStack>
      <HStack gap={2} vAlign="center" wrap="wrap" style={styles.legendRow}>
        {dept ? (
          <Token size="sm" color={dept.tokenColor} label={dept.label} />
        ) : null}
        {course ? (
          <Token size="sm" color={course.tokenColor} label={course.shortName} />
        ) : null}
        <Text type="supporting" color="secondary" style={styles.dueLine}>
          Due {row.dueLabel}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {lastReminded === null ? (
              'Never reminded'
            ) : (
              <>
                Reminded <Timestamp value={lastReminded} format="date_time" />
              </>
            )}
          </Text>
        </StackItem>
        <Button
          label={wasJustReminded ? 'Reminded' : 'Remind'}
          variant="secondary"
          size="sm"
          isDisabled={wasJustReminded}
          icon={
            <Icon
              icon={wasJustReminded ? CheckIcon : BellRingIcon}
              size="sm"
            />
          }
          onClick={() => onRemind(row.id, row.name)}
        />
      </HStack>
    </div>
  );
}

function OverdueSection({
  courseFilter,
  deptFilter,
  onClearFilters,
  remindedMap,
  onRemind,
  isInline,
}: {
  courseFilter: CourseId | null;
  deptFilter: DeptId | null;
  onClearFilters: () => void;
  remindedMap: Record<string, string>;
  onRemind: (id: string, name: string) => void;
  isInline: boolean;
}) {
  const rows = OVERDUE.filter(
    row =>
      (courseFilter === null || row.course === courseFilter) &&
      (deptFilter === null || row.dept === deptFilter),
  ).sort((a, b) => b.daysOverdue - a.daysOverdue);

  const hasFilter = courseFilter !== null || deptFilter !== null;
  const filterLabel = [
    courseFilter !== null ? COURSE_BY_ID.get(courseFilter)?.shortName : null,
    deptFilter !== null ? DEPT_BY_ID.get(deptFilter)?.label : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const header = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Heading level={2}>
          Overdue employees
        </Heading>
        <Badge
          variant={rows.length > 0 ? 'error' : 'success'}
          label={\`\${rows.length}\${hasFilter ? \` of \${TOTAL_OVERDUE}\` : ''}\`}
        />
        <StackItem size="fill" />
        {hasFilter ? (
          <Button
            label={\`Clear · \${filterLabel}\`}
            variant="ghost"
            size="sm"
            icon={<Icon icon={FilterXIcon} size="sm" />}
            onClick={onClearFilters}
          />
        ) : null}
      </HStack>
      <Text type="supporting" color="secondary">
        Past due as of {AS_OF_LABEL} · worst first.
      </Text>
    </VStack>
  );

  const list =
    rows.length === 0 ? (
      <EmptyState
        isCompact
        icon={<Icon icon={ShieldCheckIcon} size="lg" />}
        title="Nothing overdue"
        description={
          hasFilter
            ? 'No overdue assignments match the current course or department filter.'
            : 'Every assignment is complete or inside its window.'
        }
      />
    ) : (
      <VStack gap={2}>
        {rows.map(row => (
          <OverdueRow
            key={row.id}
            row={row}
            remindedAt={remindedMap[row.id]}
            onRemind={onRemind}
          />
        ))}
      </VStack>
    );

  // Inline (<=1180px): one block inside the main scroller.
  if (isInline) {
    return (
      <VStack gap={3} style={styles.sectionBlock}>
        {header}
        {list}
      </VStack>
    );
  }

  // Panel: pinned header, independently scrolling list.
  return (
    <div style={styles.panelFill}>
      <div style={styles.panelHeader}>{header}</div>
      <div style={styles.panelScroll}>{list}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

/** Header summary — 301 of 338 assignments complete across all courses. */
const TOTAL_ASSIGNMENTS =
  COURSE_TOTALS.sec.assigned +
  COURSE_TOTALS.ca.assigned +
  COURSE_TOTALS.privacy.assigned;
const TOTAL_COMPLETED =
  COURSE_TOTALS.sec.completed +
  COURSE_TOTALS.ca.completed +
  COURSE_TOTALS.privacy.completed;

const INITIAL_EXPORT = {
  at: '2026-07-14T11:30:00Z',
  by: 'Dana Whitfield',
  note: 'SOC 2 evidence pack',
};

export default function HrComplianceTrainingTemplate() {
  const [courseFilter, setCourseFilter] = useState<CourseId | null>(null);
  const [deptFilter, setDeptFilter] = useState<DeptId | null>(null);
  const [enabledRules, setEnabledRules] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        RULES.map(rule => [rule.id, rule.isEnabledDefault]),
      ),
  );
  /** Row id → fixed "just reminded" ISO stamp. */
  const [remindedMap, setRemindedMap] = useState<Record<string, string>>({});
  const [lastExport, setLastExport] = useState(INITIAL_EXPORT);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1180px drops the overdue panel (the section
  // renders inline); <=860px collapses the card and rule grids to 1-up.
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const toggleCourse = (id: CourseId) => {
    setCourseFilter(prev => (prev === id ? null : id));
  };

  const toggleDept = (id: DeptId) => {
    setDeptFilter(prev => (prev === id ? null : id));
  };

  const clearFilters = () => {
    setCourseFilter(null);
    setDeptFilter(null);
  };

  const toggleRule = (id: string, next: boolean) => {
    setEnabledRules(prev => ({...prev, [id]: next}));
    const rule = RULES.find(entry => entry.id === id);
    setAnnouncement(
      \`\${rule?.name ?? 'Rule'} auto-assignment \${next ? 'enabled' : 'paused'}\`,
    );
  };

  const remind = (id: string, name: string) => {
    setRemindedMap(prev => ({...prev, [id]: REMINDED_NOW_ISO}));
    setAnnouncement(\`Reminder sent to \${name}\`);
  };

  const exportAudit = () => {
    setLastExport({
      at: EXPORT_NOW_ISO,
      by: 'Dana Whitfield',
      note: 'Completion + reminder audit pack',
    });
    setAnnouncement('Audit export started — completion and reminder history');
  };

  const overdueSection = (
    <OverdueSection
      courseFilter={courseFilter}
      deptFilter={deptFilter}
      onClearFilters={clearFilters}
      remindedMap={remindedMap}
      onRemind={remind}
      isInline={isPanelHidden}
    />
  );

  // ----- header: title, as-of summary, audit export + last-export note -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        {/* flexShrink 0: the H1 never compresses into a two-line wrap —
            the as-of summary and last-export note give way instead. */}
        <HStack gap={2} vAlign="center" style={{flexShrink: 0}}>
          <Icon icon={FileCheck2Icon} size="md" color="secondary" />
          <Heading level={1}>Compliance Training</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · {TOTAL_HEADCOUNT} employees
          </Text>
        </HStack>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            As of {AS_OF_LABEL} · {TOTAL_COMPLETED} of {TOTAL_ASSIGNMENTS}{' '}
            complete · {TOTAL_OVERDUE}{'\xA0'}overdue
          </Text>
        </StackItem>
        <VStack gap={0} hAlign="end" style={styles.headerNote}>
          <Button
            label="Export audit pack"
            variant="primary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
            onClick={exportAudit}
          />
          <Text type="supporting" color="secondary" maxLines={1}>
            Last export <Timestamp value={lastExport.at} format="date_time" />{' '}
            · {lastExport.note} · {lastExport.by}
          </Text>
        </VStack>
      </HStack>
    </LayoutHeader>
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
              <VStack gap={5}>
                {/* Course cards — click to scope the heat column + panel. */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={2}>
                      Courses
                    </Heading>
                    <StackItem size="fill" />
                    <Text type="supporting" color="secondary">
                      Select a course to focus the heat map and overdue list
                    </Text>
                  </HStack>
                  <div
                    style={{
                      ...styles.courseGrid,
                      ...(isCompact ? styles.courseGridCompact : null),
                    }}>
                    {COURSES.map(course => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isSelected={courseFilter === course.id}
                        onToggle={toggleCourse}
                      />
                    ))}
                  </div>
                </VStack>

                <Divider />

                {/* Heat table — click a department row to scope the panel. */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={2}>
                      Completion by department
                    </Heading>
                    <StackItem size="fill" />
                    <TierLegend />
                  </HStack>
                  <HeatTable
                    courseFilter={courseFilter}
                    deptFilter={deptFilter}
                    onToggleDept={toggleDept}
                  />
                </VStack>

                <Divider />

                <RulesSection
                  enabledRules={enabledRules}
                  onToggleRule={toggleRule}
                  isCompact={isCompact}
                />

                {isPanelHidden ? (
                  <>
                    <Divider />
                    {overdueSection}
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Overdue employees">
              {overdueSection}
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};