var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one calendar-year FY26 roadmap: four
 *   team swimlanes — Platform, Growth, Mobile, Infrastructure — carrying
 *   twelve initiatives with fixed ISO start/end dates, progress percentages,
 *   statuses, owners, and milestone dates; four finish-to-start dependency
 *   pairs; a fixed 2026-06-15 status date)
 * @output Quarter-roadmap Gantt surface: a header (roadmap title, Planning
 *   locked Badge, team/initiative counts, panel toggle, Share + New
 *   initiative Buttons), a controls row with a Quarter/Half/Year zoom
 *   SegmentedControl that rescales the shared px-per-day axis plus a
 *   status legend of toggleable filter chips (On track / At risk / Blocked
 *   / Done with counts), and the defining region: a horizontally scrolling
 *   Gantt canvas under a two-row time axis (Q1–Q4 FY26 quarter cells over
 *   twelve month cells), four collapsible team swimlanes whose initiative
 *   bars are width-proportional to fixture date ranges with a darker
 *   progress fill inside each bar, DiamondIcon-shaped milestone markers on
 *   the bar rows, an SVG overlay drawing elbow dependency arrows between
 *   four bar pairs (arrowhead markers, accent highlight when an endpoint is
 *   selected), and a dashed status-date line at Jun 15 — initiative click
 *   opens a 320px detail panel (owner Avatar, date range, duration,
 *   ProgressBar, milestone list, Blocked by / Blocks jump buttons)
 * @position Page template; emitted by \`astryx template roadmap-gantt\`
 *
 * Frame: Layout height="fill", zero page scroll. LayoutHeader carries the
 * roadmap chrome. LayoutContent stacks the zoom/legend controls row over
 * the chart body: a fixed 176px team-header column (128px compact) that
 * never scrolls horizontally, beside a horizontally scrolling canvas where
 * the quarter/month axis, initiative bars, milestone diamonds, dependency
 * arrows, and status-date line all derive from one px-per-day scale — the
 * zoom control recomputes every width together. LayoutPanel end 320 holds
 * the initiative detail and opens on bar click. Choose over timeline when
 * work spans date ranges on team lanes rather than discrete events on a
 * feed, and over calendar-month-grid when the horizon is quarters, not one
 * month.
 *
 * Responsive contract:
 * - >960px: header | controls row | team column 176 + canvas (fill) |
 *   detail panel 320 (opens on selection, closable via the header toggle).
 * - <=960px (single-pane fallback for the docked panel): the detail panel
 *   leaves the frame and its header toggle disables; selecting an
 *   initiative swaps the whole content region to a full-width detail view
 *   with a 40px back IconButton that returns to the chart.
 * - <=640px: the header hides the counts caption and the Share button
 *   (New initiative stays); the controls row already wraps (flexWrap) so
 *   the legend chips flow under the zoom control instead of clipping. The
 *   zoom SegmentedControl raises --size-element-sm to 40px locally and the
 *   legend chips, collapse chevrons, and back button grow to 40px touch
 *   targets. The team column narrows to 128px and drops its initiative
 *   count caption.
 * - The Gantt canvas scrolls horizontally at every width by design — the
 *   365-day year is 2920px wide at Quarter zoom — while the team column
 *   stays fixed; if the lanes outgrow the viewport the chart body scrolls
 *   vertically as one unit so lane headers never desync from their lanes.
 * - No hover-only affordances: bars, milestones, legend chips, and
 *   dependency jump buttons are real buttons; milestone Tooltips also open
 *   on focus, and every detail lives in the detail panel reached by tap.
 *
 * Container policy (planning-board archetype): frame-first rows and panels;
 * the only Cards are the initiative summary in the detail panel. The axis,
 * swimlanes, bars, and diamonds are styled divs/buttons and one SVG overlay
 * — CSS colors and fixture math, never chart libraries or network images.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarRangeIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DiamondIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  Share2Icon,
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
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import type {ProgressBarVariant} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= CALENDAR CONSTANTS =============

const ROADMAP_TITLE = 'FY26 Product Roadmap';
const STATUS_DATE = '2026-06-15'; // fixed status/"today" line — never a clock
const INITIAL_SELECTED = 'plat-billing';

// 2026 is not a leap year: 365 days, cumulative offsets below.
const MONTHS: ReadonlyArray<{label: string; days: number}> = [
  {label: 'Jan', days: 31},
  {label: 'Feb', days: 28},
  {label: 'Mar', days: 31},
  {label: 'Apr', days: 30},
  {label: 'May', days: 31},
  {label: 'Jun', days: 30},
  {label: 'Jul', days: 31},
  {label: 'Aug', days: 31},
  {label: 'Sep', days: 30},
  {label: 'Oct', days: 31},
  {label: 'Nov', days: 30},
  {label: 'Dec', days: 31},
];
const MONTH_STARTS: number[] = MONTHS.reduce<number[]>((starts, month, i) => {
  starts.push(i === 0 ? 0 : starts[i - 1] + MONTHS[i - 1].days);
  return starts;
}, []);
const YEAR_DAYS = MONTH_STARTS[11] + MONTHS[11].days; // 365

const QUARTERS: ReadonlyArray<{label: string; firstMonth: number}> = [
  {label: 'Q1 FY26', firstMonth: 0},
  {label: 'Q2 FY26', firstMonth: 3},
  {label: 'Q3 FY26', firstMonth: 6},
  {label: 'Q4 FY26', firstMonth: 9},
];

type ZoomPreset = 'quarter' | 'half' | 'year';
/** Shared px-per-day scale: axis cells, bar widths, milestone x positions,
 * dependency arrows, and the status-date line all derive from this one
 * number, so the zoom control rescales everything together. */
const PX_PER_DAY: Record<ZoomPreset, number> = {quarter: 8, half: 4, year: 2};

// Axis + swimlane geometry (px).
const QUARTER_ROW_H = 22;
const MONTH_ROW_H = 24;
const AXIS_H = QUARTER_ROW_H + MONTH_ROW_H;
const ROW_H = 44;
const BAR_H = 28;
const LANE_PAD = 6;
const COLLAPSED_LANE_H = 36;
const TEAM_COL_W = 176;
// <=640px: the column narrows and drops the count caption so the canvas
// keeps a usable share of a 375px viewport.
const TEAM_COL_W_COMPACT = 128;

const MONO = 'var(--font-family-code, monospace)';

/** '2026-03-02' -> zero-based day-of-year (fixture math, no Date object). */
function dayIndex(iso: string): number {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return MONTH_STARTS[month - 1] + (day - 1);
}

/** '2026-03-02' -> 'Mar 2'. */
function formatDay(iso: string): string {
  const month = Number(iso.slice(5, 7));
  const day = Number(iso.slice(8, 10));
  return \`\${MONTHS[month - 1].label} \${day}\`;
}

function formatRange(start: string, end: string): string {
  return \`\${formatDay(start)} – \${formatDay(end)}\`;
}

function durationWeeks(start: string, end: string): number {
  return Math.round((dayIndex(end) - dayIndex(start) + 1) / 7);
}

// ============= FIXTURES =============
// Fixed date ranges, progress, and dependencies — no clocks, no randomness.

type StatusId = 'on-track' | 'at-risk' | 'blocked' | 'done';
type TeamId = 'platform' | 'growth' | 'mobile' | 'infra';

interface StatusMeta {
  label: string;
  /** Bar border + legend dot. */
  line: string;
  /** Translucent bar background. */
  track: string;
  /** Darker progress fill inside the bar. */
  fill: string;
  badge: BadgeVariant;
  progressVariant: ProgressBarVariant;
}

const STATUS_ORDER: StatusId[] = ['on-track', 'at-risk', 'blocked', 'done'];

const STATUS_META: Record<StatusId, StatusMeta> = {
  // Status hues are explicit light-dark() pairs (500-weight light, 400-weight
  // dark) so bars stay saturated-but-legible over the dark canvas; the
  // translucent track/fill alphas ride the same hue in both schemes.
  'on-track': {
    label: 'On track',
    line: 'light-dark(#3B82F6, #60A5FA)',
    track: 'light-dark(rgba(59, 130, 246, 0.16), rgba(96, 165, 250, 0.2))',
    fill: 'light-dark(rgba(59, 130, 246, 0.45), rgba(96, 165, 250, 0.45))',
    badge: 'info',
    progressVariant: 'accent',
  },
  'at-risk': {
    label: 'At risk',
    line: 'light-dark(#F59E0B, #FBBF24)',
    track: 'light-dark(rgba(245, 158, 11, 0.16), rgba(251, 191, 36, 0.2))',
    fill: 'light-dark(rgba(245, 158, 11, 0.45), rgba(251, 191, 36, 0.45))',
    badge: 'warning',
    progressVariant: 'warning',
  },
  blocked: {
    label: 'Blocked',
    line: 'light-dark(#EF4444, #F87171)',
    track: 'light-dark(rgba(239, 68, 68, 0.16), rgba(248, 113, 113, 0.2))',
    fill: 'light-dark(rgba(239, 68, 68, 0.45), rgba(248, 113, 113, 0.45))',
    badge: 'error',
    progressVariant: 'error',
  },
  done: {
    label: 'Done',
    line: 'light-dark(#22C55E, #4ADE80)',
    track: 'light-dark(rgba(34, 197, 94, 0.16), rgba(74, 222, 128, 0.2))',
    fill: 'light-dark(rgba(34, 197, 94, 0.45), rgba(74, 222, 128, 0.45))',
    badge: 'success',
    progressVariant: 'success',
  },
};

interface Milestone {
  id: string;
  label: string;
  date: string; // fixed ISO date inside the initiative's range
}

interface Initiative {
  id: string;
  name: string;
  start: string;
  end: string;
  /** Zero-based stacking row inside the team lane (fixture-assigned so
   * overlapping ranges never collide). */
  row: number;
  progress: number; // 0..100
  status: StatusId;
  owner: string;
  ownerRole: string;
  summary: string;
  milestones: Milestone[];
}

interface Team {
  id: TeamId;
  name: string;
  color: string;
  initiatives: Initiative[];
}

const TEAMS: Team[] = [
  {
    id: 'platform',
    name: 'Platform',
    color: 'light-dark(#6366F1, #818CF8)',
    initiatives: [
      {
        id: 'plat-auth',
        name: 'Unified auth service',
        start: '2026-01-12',
        end: '2026-04-03',
        row: 0,
        progress: 78,
        status: 'on-track',
        owner: 'Priya Raman',
        ownerRole: 'Staff engineer',
        summary:
          'Consolidate the three legacy login paths behind one token service so every surface shares sessions and MFA.',
        milestones: [
          {id: 'ms-auth-beta', label: 'Beta', date: '2026-03-02'},
          {id: 'ms-auth-ga', label: 'GA', date: '2026-04-03'},
        ],
      },
      {
        id: 'plat-billing',
        name: 'Usage-based billing engine',
        start: '2026-04-06',
        end: '2026-08-21',
        row: 1,
        progress: 34,
        status: 'at-risk',
        owner: 'Marcus Bell',
        ownerRole: 'Eng manager',
        summary:
          'Meter API calls and storage per workspace and rate them nightly; pricing sign-off is the gating decision.',
        milestones: [
          {id: 'ms-bill-price', label: 'Pricing sign-off', date: '2026-05-15'},
        ],
      },
      {
        id: 'plat-api',
        name: 'Public API v3',
        start: '2026-08-24',
        end: '2026-11-27',
        row: 0,
        progress: 5,
        status: 'on-track',
        owner: 'Lena Fischer',
        ownerRole: 'API lead',
        summary:
          'Cursor pagination, idempotency keys, and a versioning policy — the last breaking revision before enterprise GA.',
        milestones: [
          {id: 'ms-api-freeze', label: 'Spec freeze', date: '2026-09-18'},
        ],
      },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    color: 'light-dark(#EC4899, #F472B6)',
    initiatives: [
      {
        id: 'gro-onboard',
        name: 'Self-serve onboarding revamp',
        start: '2026-02-02',
        end: '2026-05-15',
        row: 0,
        progress: 62,
        status: 'on-track',
        owner: 'Sofia Andersson',
        ownerRole: 'Product manager',
        summary:
          'Replace the 9-step wizard with a 3-step checklist plus templates; target is +8pt week-1 activation.',
        milestones: [
          {id: 'ms-onb-ab', label: 'A/B readout', date: '2026-04-20'},
        ],
      },
      {
        id: 'gro-referral',
        name: 'Referral program',
        start: '2026-05-18',
        end: '2026-07-31',
        row: 0,
        progress: 18,
        status: 'blocked',
        owner: 'Jonah Kim',
        ownerRole: 'Growth engineer',
        summary:
          'Double-sided credits for workspace invites. Blocked: reward credits cannot post until the billing engine meters usage.',
        milestones: [],
      },
      {
        id: 'gro-lifecycle',
        name: 'Lifecycle email engine',
        start: '2026-07-06',
        end: '2026-10-16',
        row: 1,
        progress: 8,
        status: 'at-risk',
        owner: 'Noor Haddad',
        ownerRole: 'Marketing eng',
        summary:
          'Event-triggered sends off the warehouse; deliverability review moved the first sends out by two weeks.',
        milestones: [
          {id: 'ms-life-send', label: 'First sends', date: '2026-09-14'},
        ],
      },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    color: 'light-dark(#14B8A6, #2DD4BF)',
    initiatives: [
      {
        id: 'mob-rewrite',
        name: 'Navigation rewrite (RN 0.78)',
        start: '2026-01-19',
        end: '2026-06-12',
        row: 0,
        progress: 88,
        status: 'on-track',
        owner: 'Alex Wu',
        ownerRole: 'Mobile lead',
        summary:
          'Move both apps to the new stack navigator and kill the last three native bridges; dogfood ran clean.',
        milestones: [
          {id: 'ms-nav-dog', label: 'Dogfood', date: '2026-04-13'},
          {id: 'ms-nav-100', label: '100% rollout', date: '2026-06-12'},
        ],
      },
      {
        id: 'mob-offline',
        name: 'Offline sync',
        start: '2026-06-15',
        end: '2026-10-02',
        row: 0,
        progress: 12,
        status: 'at-risk',
        owner: 'Dana Reyes',
        ownerRole: 'Senior engineer',
        summary:
          'Local-first cache with conflict-free merges for notes and tasks; the merge-rule spike is running long.',
        milestones: [{id: 'ms-off-alpha', label: 'Alpha', date: '2026-08-24'}],
      },
      {
        id: 'mob-widgets',
        name: 'Home-screen widgets',
        start: '2026-09-07',
        end: '2026-12-11',
        row: 1,
        progress: 4,
        status: 'on-track',
        owner: 'Maya Lindqvist',
        ownerRole: 'Product engineer',
        summary:
          'iOS and Android widgets for today view and quick capture, reusing the offline cache read path.',
        milestones: [],
      },
    ],
  },
  {
    id: 'infra',
    name: 'Infrastructure',
    color: 'light-dark(#F97316, #FB923C)',
    initiatives: [
      {
        id: 'inf-obs',
        name: 'Observability consolidation',
        start: '2026-01-05',
        end: '2026-03-20',
        row: 0,
        progress: 100,
        status: 'done',
        owner: 'Tomás Herrera',
        ownerRole: 'SRE',
        summary:
          'Shipped: one tracing pipeline and a shared dashboard taxonomy; retired two vendor contracts at cutover.',
        milestones: [{id: 'ms-obs-cut', label: 'Cutover', date: '2026-03-06'}],
      },
      {
        id: 'inf-multi',
        name: 'Multi-region failover',
        start: '2026-03-23',
        end: '2026-08-28',
        row: 0,
        progress: 45,
        status: 'on-track',
        owner: 'Ravi Patel',
        ownerRole: 'Principal SRE',
        summary:
          'Active-passive Postgres with a 15-minute RTO; the June region drill is the go/no-go checkpoint.',
        milestones: [
          {id: 'ms-mr-drill', label: 'Region drill', date: '2026-06-26'},
        ],
      },
      {
        id: 'inf-cost',
        name: 'Compute cost program',
        start: '2026-09-01',
        end: '2026-12-18',
        row: 0,
        progress: 10,
        status: 'on-track',
        owner: 'Owen Clarke',
        ownerRole: 'Infra PM',
        summary:
          'Rightsize the batch fleet and put per-team spend on the billing meters once usage rating lands.',
        milestones: [],
      },
    ],
  },
];

/** Finish-to-start dependencies drawn as SVG elbow arrows on the canvas. */
const DEPENDENCIES: ReadonlyArray<{id: string; from: string; to: string}> = [
  {id: 'dep-1', from: 'plat-auth', to: 'plat-billing'},
  {id: 'dep-2', from: 'plat-billing', to: 'gro-referral'},
  {id: 'dep-3', from: 'mob-rewrite', to: 'mob-offline'},
  {id: 'dep-4', from: 'plat-billing', to: 'inf-cost'},
];

interface InitiativeWithTeam {
  initiative: Initiative;
  team: Team;
}

const ALL_INITIATIVES: InitiativeWithTeam[] = TEAMS.flatMap(team =>
  team.initiatives.map(initiative => ({initiative, team})),
);

function findInitiative(id: string | null): InitiativeWithTeam | null {
  return ALL_INITIATIVES.find(entry => entry.initiative.id === id) ?? null;
}

/** Rows a team lane needs = max fixture row index + 1. */
const TEAM_ROW_COUNT: Record<TeamId, number> = TEAMS.reduce(
  (acc, team) => {
    acc[team.id] = Math.max(...team.initiatives.map(i => i.row)) + 1;
    return acc;
  },
  {} as Record<TeamId, number>,
);

const STATUS_COUNTS: Record<StatusId, number> = ALL_INITIATIVES.reduce(
  (acc, entry) => {
    acc[entry.initiative.status] += 1;
    return acc;
  },
  {'on-track': 0, 'at-risk': 0, blocked: 0, done: 0} as Record<StatusId, number>,
);

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping — the
  // roadmap title plus two buttons overflow half a phone viewport.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=640px: grow legend chips / chevrons / back button to 40px touch
  // targets (28px "sm" boxes are fine for pointers, too small for thumbs).
  tapTarget: {minWidth: 40, minHeight: 40},
  // SegmentedControlItem height derives from --size-element-sm; raising the
  // token locally gives the zoom control ~40px segments at phone widths
  // while keeping size="sm" padding so three segments fit a 360px row.
  zoomTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
  // Controls row: zoom left, legend right; wraps at narrow widths.
  controlsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2) var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  legendRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    marginLeft: 'auto',
  },
  legendChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 28,
    paddingInline: 10,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  legendChipOff: {opacity: 0.45},
  legendDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  // Chart body: one shared vertical scroller so the fixed team column and
  // the horizontal canvas can never desync while scrolling down.
  chartColumn: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  chartBody: {flex: 1, minHeight: 0, display: 'flex', overflowY: 'auto'},
  teamCol: {
    flexShrink: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  teamColSpacer: {
    height: AXIS_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'flex-end',
    padding: '0 var(--spacing-2) 4px',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  teamCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  teamSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  // Horizontally scrolling canvas; everything inside shares px-per-day.
  canvasScroll: {flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'hidden'},
  canvas: {position: 'relative'},
  axis: {
    position: 'relative',
    height: AXIS_H,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  quarterCell: {
    position: 'absolute',
    top: 0,
    height: QUARTER_ROW_H,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 10,
    letterSpacing: '0.05em',
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
  },
  monthCell: {
    position: 'absolute',
    top: QUARTER_ROW_H,
    height: MONTH_ROW_H,
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 6,
    borderRight: 'var(--border-width) solid var(--color-border)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  lanesWrap: {position: 'relative'},
  lane: {
    position: 'relative',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Faint month gridlines behind the bars keep long lanes scannable.
  gridline: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'var(--color-border)',
    opacity: 0.45,
    pointerEvents: 'none',
  },
  bar: {
    position: 'absolute',
    height: BAR_H,
    // Short bars keep enough width for a recognizable label at Year zoom.
    minWidth: 56,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  barFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    pointerEvents: 'none',
  },
  barLabel: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 8,
    fontSize: 11,
    lineHeight: \`\${BAR_H - 2}px\`,
    color: 'var(--color-text-primary)',
    pointerEvents: 'none',
    // Above the dependency arrows so labels stay legible where they cross.
    zIndex: 3,
  },
  barName: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    minWidth: 0,
  },
  barPct: {
    marginLeft: 'auto',
    fontFamily: MONO,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  // 24px milestone hit area wrapping a 10px rotated-square diamond.
  milestoneButton: {
    position: 'absolute',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 4,
  },
  milestoneDiamond: {
    width: 10,
    height: 10,
    transform: 'rotate(45deg)',
    borderRadius: 2,
    border: '1.5px solid var(--color-background-body)',
    flexShrink: 0,
  },
  // Collapsed team lane: one condensed strip spanning the team's extent.
  collapsedStrip: {
    position: 'absolute',
    top: (COLLAPSED_LANE_H - 10) / 2,
    height: 10,
    borderRadius: 999,
    opacity: 0.5,
    pointerEvents: 'none',
  },
  depSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
    zIndex: 2,
  },
  statusDateLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 0,
    borderLeft: '2px dashed var(--color-accent)',
    opacity: 0.7,
    pointerEvents: 'none',
    zIndex: 1,
  },
  statusDatePill: {
    position: 'absolute',
    top: 2,
    transform: 'translateX(-50%)',
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: '14px',
    paddingInline: 5,
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-background-body)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    zIndex: 2,
  },
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
  // <=960px single-pane detail view replacing the chart.
  detailPane: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  detailPaneColumn: {maxWidth: 560, marginInline: 'auto'},
};

// ============= LANE LAYOUT =============

interface LaneLayout {
  top: number;
  height: number;
}

/** Vertical geometry for every team lane given the collapse state; bar
 * tops, milestone centers, and arrow endpoints all read from this map. */
function computeLaneLayout(collapsed: Record<TeamId, boolean>): {
  map: Record<TeamId, LaneLayout>;
  totalHeight: number;
} {
  const map = {} as Record<TeamId, LaneLayout>;
  let y = 0;
  for (const team of TEAMS) {
    const height = collapsed[team.id]
      ? COLLAPSED_LANE_H
      : TEAM_ROW_COUNT[team.id] * ROW_H + LANE_PAD * 2;
    map[team.id] = {top: y, height};
    y += height;
  }
  return {map, totalHeight: y};
}

function rowCenterY(laneTop: number, row: number): number {
  return laneTop + LANE_PAD + row * ROW_H + ROW_H / 2;
}

// ============= AXIS =============

function TimeAxis({pxPerDay}: {pxPerDay: number}) {
  return (
    <div style={{...styles.axis, width: YEAR_DAYS * pxPerDay}} aria-hidden>
      {QUARTERS.map(quarter => {
        const startDay = MONTH_STARTS[quarter.firstMonth];
        const days =
          MONTHS[quarter.firstMonth].days +
          MONTHS[quarter.firstMonth + 1].days +
          MONTHS[quarter.firstMonth + 2].days;
        return (
          <div
            key={quarter.label}
            style={{
              ...styles.quarterCell,
              left: startDay * pxPerDay,
              width: days * pxPerDay,
            }}>
            {quarter.label}
          </div>
        );
      })}
      {MONTHS.map((month, i) => (
        <div
          key={month.label}
          style={{
            ...styles.monthCell,
            left: MONTH_STARTS[i] * pxPerDay,
            width: month.days * pxPerDay,
          }}>
          {month.label}
        </div>
      ))}
    </div>
  );
}

// ============= BARS + MILESTONES =============

function InitiativeBar({
  entry,
  pxPerDay,
  isSelected,
  isDimmed,
  onSelect,
}: {
  entry: InitiativeWithTeam;
  pxPerDay: number;
  isSelected: boolean;
  isDimmed: boolean;
  onSelect: (id: string) => void;
}) {
  const {initiative, team} = entry;
  const meta = STATUS_META[initiative.status];
  const left = dayIndex(initiative.start) * pxPerDay;
  const width = (dayIndex(initiative.end) - dayIndex(initiative.start) + 1) * pxPerDay;
  const top = LANE_PAD + initiative.row * ROW_H + (ROW_H - BAR_H) / 2;
  const barStyle: CSSProperties = {
    ...styles.bar,
    left,
    width,
    top,
    backgroundColor: meta.track,
    borderColor: isSelected ? 'var(--color-accent)' : meta.line,
    // Inset ring keeps the selection outline inside the bar so it never
    // bleeds over neighbors or the lane divider.
    boxShadow: isSelected ? 'inset 0 0 0 1px var(--color-accent)' : undefined,
    opacity: isDimmed && !isSelected ? 0.25 : 1,
  };
  return (
    <button
      type="button"
      style={barStyle}
      aria-label={\`\${initiative.name}, \${team.name}, \${formatRange(
        initiative.start,
        initiative.end,
      )}, \${initiative.progress}% complete, \${meta.label}\`}
      aria-pressed={isSelected}
      onClick={() => onSelect(initiative.id)}>
      <span
        style={{
          ...styles.barFill,
          width: \`\${initiative.progress}%\`,
          backgroundColor: meta.fill,
        }}
        aria-hidden
      />
      <span style={styles.barLabel} aria-hidden>
        <span style={styles.barName}>{initiative.name}</span>
        {width >= 120 && <span style={styles.barPct}>{initiative.progress}%</span>}
      </span>
    </button>
  );
}

function MilestoneMarker({
  entry,
  milestone,
  pxPerDay,
  onSelect,
}: {
  entry: InitiativeWithTeam;
  milestone: Milestone;
  pxPerDay: number;
  onSelect: (id: string) => void;
}) {
  const {initiative, team} = entry;
  const isReached = dayIndex(milestone.date) <= dayIndex(STATUS_DATE);
  const centerY = LANE_PAD + initiative.row * ROW_H + ROW_H / 2;
  return (
    <Tooltip
      content={\`\${milestone.label} · \${formatDay(milestone.date)}\${
        isReached ? ' · reached' : ''
      }\`}>
      <button
        type="button"
        style={{
          ...styles.milestoneButton,
          left: dayIndex(milestone.date) * pxPerDay - 12,
          top: centerY - 12,
        }}
        aria-label={\`Milestone \${milestone.label}, \${formatDay(
          milestone.date,
        )}, \${initiative.name}\`}
        onClick={() => onSelect(initiative.id)}>
        <span
          style={{
            ...styles.milestoneDiamond,
            backgroundColor: isReached ? team.color : 'var(--color-background-body)',
            borderColor: team.color,
            border: \`2px solid \${team.color}\`,
          }}
          aria-hidden
        />
      </button>
    </Tooltip>
  );
}

// ============= DEPENDENCY ARROWS =============

/** SVG overlay across the lanes area: one elbow path per dependency, an
 * arrowhead marker at the successor's start edge, accent highlight when
 * either endpoint is the current selection. Skips pairs whose team lane is
 * collapsed — there is no bar to point at. */
function DependencyArrows({
  pxPerDay,
  laneMap,
  totalHeight,
  collapsed,
  selectedId,
}: {
  pxPerDay: number;
  laneMap: Record<TeamId, LaneLayout>;
  totalHeight: number;
  collapsed: Record<TeamId, boolean>;
  selectedId: string | null;
}) {
  const width = YEAR_DAYS * pxPerDay;
  return (
    <svg
      style={styles.depSvg}
      width={width}
      height={totalHeight}
      viewBox={\`0 0 \${width} \${totalHeight}\`}
      aria-hidden>
      <defs>
        <marker
          id="roadmap-dep-arrow"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto">
          <path
            d="M0,0 L7,3.5 L0,7 Z"
            fill="light-dark(rgba(100, 116, 139, 0.9), rgba(148, 163, 184, 0.9))"
          />
        </marker>
        <marker
          id="roadmap-dep-arrow-active"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3.5"
          orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--color-accent)" />
        </marker>
      </defs>
      {DEPENDENCIES.map(dep => {
        const from = findInitiative(dep.from);
        const to = findInitiative(dep.to);
        if (from == null || to == null) {
          return null;
        }
        if (collapsed[from.team.id] || collapsed[to.team.id]) {
          return null;
        }
        const x1 = (dayIndex(from.initiative.end) + 1) * pxPerDay;
        const y1 = rowCenterY(laneMap[from.team.id].top, from.initiative.row);
        const x2 = dayIndex(to.initiative.start) * pxPerDay;
        const y2 = rowCenterY(laneMap[to.team.id].top, to.initiative.row);
        // Elbow: out of the predecessor's end, down/up to the successor's
        // row, then into its start edge. All fixtures are finish-to-start
        // so the elbow x always sits between the two bars.
        const elbowX = Math.min(x1 + 10, Math.max(x1 + 4, x2 - 8));
        const isActive = selectedId === dep.from || selectedId === dep.to;
        return (
          <path
            key={dep.id}
            d={\`M \${x1} \${y1} L \${elbowX} \${y1} L \${elbowX} \${y2} L \${x2 - 2} \${y2}\`}
            fill="none"
            stroke={
              isActive
                ? 'var(--color-accent)'
                : 'light-dark(rgba(100, 116, 139, 0.7), rgba(148, 163, 184, 0.7))'
            }
            strokeWidth={isActive ? 2 : 1.5}
            markerEnd={
              isActive
                ? 'url(#roadmap-dep-arrow-active)'
                : 'url(#roadmap-dep-arrow)'
            }
          />
        );
      })}
    </svg>
  );
}

// ============= LEGEND =============

function LegendChip({
  status,
  isVisible,
  isCompact,
  onToggle,
}: {
  status: StatusId;
  isVisible: boolean;
  isCompact: boolean;
  onToggle: (status: StatusId) => void;
}) {
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      style={{
        ...styles.legendChip,
        ...(isCompact ? styles.tapTarget : undefined),
        ...(isVisible ? undefined : styles.legendChipOff),
      }}
      aria-pressed={isVisible}
      aria-label={\`\${meta.label}: \${STATUS_COUNTS[status]} initiatives, \${
        isVisible ? 'shown' : 'dimmed'
      }\`}
      onClick={() => onToggle(status)}>
      <span style={{...styles.legendDot, backgroundColor: meta.line}} aria-hidden />
      <Text type="supporting" color="secondary">
        {meta.label} · {STATUS_COUNTS[status]}
      </Text>
    </button>
  );
}

// ============= DETAIL PANEL =============

/** Detail body shared by the 320px docked panel (>960px) and the
 * single-pane fallback view (<=960px). */
function InitiativeDetail({
  entry,
  onSelect,
}: {
  entry: InitiativeWithTeam;
  onSelect: (id: string) => void;
}) {
  const {initiative, team} = entry;
  const meta = STATUS_META[initiative.status];
  const blockedBy = DEPENDENCIES.filter(dep => dep.to === initiative.id)
    .map(dep => findInitiative(dep.from))
    .filter((e): e is InitiativeWithTeam => e != null);
  const blocks = DEPENDENCIES.filter(dep => dep.from === initiative.id)
    .map(dep => findInitiative(dep.to))
    .filter((e): e is InitiativeWithTeam => e != null);

  return (
    <VStack gap={3}>
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="body" weight="semibold" maxLines={2}>
                {initiative.name}
              </Text>
            </StackItem>
            <Badge label={meta.label} variant={meta.badge} />
          </HStack>
          <HStack gap={2} vAlign="center">
            <span
              style={{...styles.teamSwatch, backgroundColor: team.color}}
              aria-hidden
            />
            <Text type="supporting" color="secondary">
              {team.name} · {formatRange(initiative.start, initiative.end)} ·{' '}
              {durationWeeks(initiative.start, initiative.end)} wks
            </Text>
          </HStack>
        </VStack>
      </Card>

      <HStack gap={2} vAlign="center">
        <Avatar name={initiative.owner} size="xsmall" />
        <VStack gap={0}>
          <Text type="body" weight="semibold">
            {initiative.owner}
          </Text>
          <Text type="supporting" color="secondary">
            {initiative.ownerRole}
          </Text>
        </VStack>
      </HStack>

      <ProgressBar
        label="Progress"
        value={initiative.progress}
        max={100}
        hasValueLabel
        variant={meta.progressVariant}
      />

      <Text type="supporting" color="secondary">
        {initiative.summary}
      </Text>

      <Divider />

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Milestones
        </Text>
        {initiative.milestones.length === 0 ? (
          <Text type="supporting" color="secondary">
            No milestones on this initiative.
          </Text>
        ) : (
          initiative.milestones.map(milestone => {
            const isReached = dayIndex(milestone.date) <= dayIndex(STATUS_DATE);
            return (
              <HStack key={milestone.id} gap={2} vAlign="center">
                <Icon
                  icon={DiamondIcon}
                  size="sm"
                  color={isReached ? 'success' : 'secondary'}
                />
                <StackItem size="fill">
                  <Text type="supporting">{milestone.label}</Text>
                </StackItem>
                <Text type="supporting" color="secondary" style={styles.mono}>
                  {formatDay(milestone.date)}
                </Text>
              </HStack>
            );
          })
        )}
      </VStack>

      {(blockedBy.length > 0 || blocks.length > 0) && <Divider />}

      {blockedBy.length > 0 && (
        <VStack gap={1}>
          <Text type="label" color="secondary">
            Blocked by
          </Text>
          {blockedBy.map(other => (
            <Button
              key={other.initiative.id}
              label={other.initiative.name}
              variant="ghost"
              size="sm"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              onClick={() => onSelect(other.initiative.id)}
            />
          ))}
        </VStack>
      )}

      {blocks.length > 0 && (
        <VStack gap={1}>
          <Text type="label" color="secondary">
            Blocks
          </Text>
          {blocks.map(other => (
            <Button
              key={other.initiative.id}
              label={other.initiative.name}
              variant="ghost"
              size="sm"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() => onSelect(other.initiative.id)}
            />
          ))}
        </VStack>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function RoadmapGanttTemplate() {
  const [zoom, setZoom] = useState<ZoomPreset>('half');
  const [selectedId, setSelectedId] = useState<string | null>(INITIAL_SELECTED);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [statusVisible, setStatusVisible] = useState<Record<StatusId, boolean>>({
    'on-track': true,
    'at-risk': true,
    blocked: true,
    done: true,
  });
  const [collapsedTeams, setCollapsedTeams] = useState<Record<TeamId, boolean>>({
    platform: false,
    growth: false,
    mobile: false,
    infra: false,
  });

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const teamColW = isCompact ? TEAM_COL_W_COMPACT : TEAM_COL_W;

  const pxPerDay = PX_PER_DAY[zoom];
  const canvasWidth = YEAR_DAYS * pxPerDay;
  const statusDateX = dayIndex(STATUS_DATE) * pxPerDay;

  const {map: laneMap, totalHeight: lanesHeight} = useMemo(
    () => computeLaneLayout(collapsedTeams),
    [collapsedTeams],
  );

  const selected = findInitiative(selectedId);

  const selectInitiative = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
    // Bar click opens the detail panel on desktop; on narrow viewports the
    // selection itself swaps the content region to the single-pane detail.
    setIsPanelOpen(true);
  };
  const jumpToInitiative = (id: string) => {
    // Dependency jump buttons never deselect — they move the selection.
    setSelectedId(id);
    setIsPanelOpen(true);
  };

  const toggleStatus = (status: StatusId) => {
    setStatusVisible(prev => ({...prev, [status]: !prev[status]}));
  };
  const toggleTeam = (teamId: TeamId) => {
    setCollapsedTeams(prev => ({...prev, [teamId]: !prev[teamId]}));
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={CalendarRangeIcon} size="md" color="secondary" />
            <Heading level={1}>{ROADMAP_TITLE}</Heading>
            <Badge label="Planning locked" variant="success" />
            {!isCompact && (
              <Text type="supporting" color="secondary">
                {TEAMS.length} teams · {ALL_INITIATIVES.length} initiatives ·
                Jan – Dec 2026
              </Text>
            )}
          </HStack>
        </StackItem>
        {!isCompact && (
          <Button
            label="Share"
            variant="ghost"
            size="sm"
            icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
        )}
        <IconButton
          label={isPanelOpen ? 'Hide initiative detail' : 'Show initiative detail'}
          tooltip={isPanelOpen ? 'Hide detail' : 'Show detail'}
          icon={
            <Icon
              icon={isPanelOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          isDisabled={isNarrow}
          onClick={() => setIsPanelOpen(prev => !prev)}
        />
        <Button
          label="New initiative"
          variant="primary"
          size="sm"
          onClick={() => {}}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Controls row: zoom + status legend -----
  const controls = (
    <div style={styles.controlsRow}>
      <SegmentedControl
        value={zoom}
        onChange={v => setZoom(v as ZoomPreset)}
        label="Axis zoom"
        size="sm"
        style={isCompact ? styles.zoomTapTarget : undefined}>
        <SegmentedControlItem value="quarter" label="Quarter" />
        <SegmentedControlItem value="half" label="Half" />
        <SegmentedControlItem value="year" label="Year" />
      </SegmentedControl>
      {!isCompact && (
        <Text type="supporting" color="secondary" style={styles.mono}>
          {pxPerDay} px/day · status {formatDay(STATUS_DATE)}
        </Text>
      )}
      <div style={styles.legendRow} role="group" aria-label="Status legend">
        {STATUS_ORDER.map(status => (
          <LegendChip
            key={status}
            status={status}
            isVisible={statusVisible[status]}
            isCompact={isCompact}
            onToggle={toggleStatus}
          />
        ))}
      </div>
    </div>
  );

  // ----- Gantt chart body -----
  const chart = (
    <div style={styles.chartColumn}>
      {controls}
      <div style={styles.chartBody}>
        {/* Fixed team column (176px, 128px compact) — never scrolls
            horizontally; heights mirror the lane layout exactly. */}
        <div style={{...styles.teamCol, width: teamColW}}>
          <div style={styles.teamColSpacer}>
            <Text type="supporting" color="secondary" style={styles.mono}>
              FY26
            </Text>
          </div>
          {TEAMS.map(team => (
            <div
              key={team.id}
              style={{...styles.teamCell, height: laneMap[team.id].height}}>
              <IconButton
                label={
                  collapsedTeams[team.id]
                    ? \`Expand \${team.name} lane\`
                    : \`Collapse \${team.name} lane\`
                }
                icon={
                  <Icon
                    icon={collapsedTeams[team.id] ? ChevronRightIcon : ChevronDownIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                variant="ghost"
                size="sm"
                style={isCompact ? styles.tapTarget : undefined}
                onClick={() => toggleTeam(team.id)}
              />
              <span
                style={{...styles.teamSwatch, backgroundColor: team.color}}
                aria-hidden
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body" weight="semibold" maxLines={1}>
                    {team.name}
                  </Text>
                  {!isCompact && !collapsedTeams[team.id] && (
                    <Text type="supporting" color="secondary">
                      {team.initiatives.length} initiatives
                    </Text>
                  )}
                </VStack>
              </StackItem>
            </div>
          ))}
        </div>
        {/* Horizontally scrolling canvas; axis, bars, diamonds, arrows, and
            the status-date line share one px-per-day scale. */}
        <div style={styles.canvasScroll}>
          <div style={{...styles.canvas, width: canvasWidth}}>
            <TimeAxis pxPerDay={pxPerDay} />
            <div style={{...styles.lanesWrap, height: lanesHeight}}>
              {/* Month gridlines behind everything. */}
              {MONTH_STARTS.slice(1).map(startDay => (
                <div
                  key={startDay}
                  style={{...styles.gridline, left: startDay * pxPerDay}}
                  aria-hidden
                />
              ))}
              {TEAMS.map(team => {
                const layout = laneMap[team.id];
                if (collapsedTeams[team.id]) {
                  const firstDay = Math.min(
                    ...team.initiatives.map(i => dayIndex(i.start)),
                  );
                  const lastDay = Math.max(
                    ...team.initiatives.map(i => dayIndex(i.end)),
                  );
                  return (
                    <div
                      key={team.id}
                      style={{...styles.lane, height: layout.height}}>
                      <div
                        style={{
                          ...styles.collapsedStrip,
                          left: firstDay * pxPerDay,
                          width: (lastDay - firstDay + 1) * pxPerDay,
                          backgroundColor: team.color,
                        }}
                        aria-hidden
                      />
                    </div>
                  );
                }
                return (
                  <div key={team.id} style={{...styles.lane, height: layout.height}}>
                    {team.initiatives.map(initiative => (
                      <InitiativeBar
                        key={initiative.id}
                        entry={{initiative, team}}
                        pxPerDay={pxPerDay}
                        isSelected={initiative.id === selectedId}
                        isDimmed={!statusVisible[initiative.status]}
                        onSelect={selectInitiative}
                      />
                    ))}
                    {team.initiatives.flatMap(initiative =>
                      initiative.milestones.map(milestone => (
                        <MilestoneMarker
                          key={milestone.id}
                          entry={{initiative, team}}
                          milestone={milestone}
                          pxPerDay={pxPerDay}
                          onSelect={selectInitiative}
                        />
                      )),
                    )}
                  </div>
                );
              })}
              <DependencyArrows
                pxPerDay={pxPerDay}
                laneMap={laneMap}
                totalHeight={lanesHeight}
                collapsed={collapsedTeams}
                selectedId={selectedId}
              />
            </div>
            {/* Fixed status-date line across the axis and every lane. */}
            <div
              style={{
                ...styles.statusDateLine,
                left: statusDateX,
                height: AXIS_H + lanesHeight,
              }}
              aria-hidden
            />
            <div style={{...styles.statusDatePill, left: statusDateX}} aria-hidden>
              {formatDay(STATUS_DATE)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ----- <=960px single-pane fallback: detail swaps in for the chart -----
  const singlePaneDetail = selected != null && (
    <div style={styles.detailPane}>
      <div style={styles.detailPaneColumn}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Back to roadmap"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={styles.tapTarget}
              onClick={() => setSelectedId(null)}
            />
            <Text type="body" weight="semibold">
              Initiative detail
            </Text>
          </HStack>
          <InitiativeDetail entry={selected} onSelect={jumpToInitiative} />
        </VStack>
      </div>
    </div>
  );

  const content = (
    <LayoutContent padding={0}>
      {isNarrow && selected != null ? singlePaneDetail : chart}
    </LayoutContent>
  );

  // ----- Detail panel (320px, desktop only) -----
  const detailPanel =
    isPanelOpen && !isNarrow ? (
      <LayoutPanel width={320} padding={0} hasDivider label="Initiative detail">
        <div style={styles.panelScroll}>
          {selected == null ? (
            <div style={styles.panelEmpty}>
              <VStack gap={1} hAlign="center">
                <Text type="body" weight="semibold">
                  No initiative selected
                </Text>
                <Text type="supporting" color="secondary">
                  Click a bar or a milestone diamond on the roadmap to inspect
                  it.
                </Text>
              </VStack>
            </div>
          ) : (
            <InitiativeDetail entry={selected} onSelect={jumpToInitiative} />
          )}
        </div>
      </LayoutPanel>
    ) : undefined;

  return (
    <Layout height="fill" header={header} content={content} end={detailPanel} />
  );
}
`;export{e as default};