var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file milestone-burnup.tsx
 * @input Deterministic fixtures only (one release — Aurora 2.0 — with
 *   sixteen weekly burnup snapshots of total scope vs. completed story
 *   points, three scope-change events with fixed dates/deltas/reasons,
 *   four delivery milestones with per-milestone scope, completion, owner,
 *   and work-item breakdowns, and a fixed Aug 3 GA target; every KPI,
 *   velocity, forecast date, and chart coordinate derives from those
 *   arrays with plain helper functions — no clocks, no randomness)
 * @output Delivery burnup analytics surface: a header (release title,
 *   status Badge, chart-range SegmentedControl, refresh), a 4-up KPI Stat
 *   row (percent complete, 4-week velocity, forecast date vs. target,
 *   scope growth), the defining region — a layered static-SVG burnup
 *   chart where the total-scope line steps up/down on scope changes, the
 *   completed area rises beneath it, a velocity forecast band projects
 *   from the last snapshot to the GA target column, and tappable
 *   scope-change markers open an annotation detail card below the chart
 *   — and a per-milestone table whose rows expand in place (colSpan
 *   detail row) with owner, progress, work items, and scope-change notes
 * @position Page template; emitted by \`astryx template milestone-burnup\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the release chrome
 * (title + target caption, At risk Badge, 6w/12w/All range control,
 * refresh). LayoutContent scrolls one vertical stack: KPI Grid, burnup
 * chart Card (chart + legend + annotation detail), milestone table Card.
 *
 * Chart contract (deliberately simple — no charting engine):
 * - One fixed 720x260 viewBox; xAt/yAt map week index and points to
 *   coordinates, and four tiny path builders (linePath, areaPath,
 *   stepPath, bandPath) emit static SVG strings from the fixture arrays.
 * - Layers, back to front: horizontal gridlines, forecast band polygon
 *   (slowest→fastest observed weekly throughput projected to the target
 *   column), completed area + line, total-scope step line (flat dashed
 *   continuation across the forecast region), dashed mid-velocity
 *   forecast line, and a dashed GA-target rule in the final column.
 * - Scope-change markers are HTML <button>s absolutely positioned over
 *   the SVG from the same xAt/yAt math (percent offsets), so they scale
 *   with the chart and keep real 40px hit areas.
 *
 * Interaction contract:
 * - Chart range lives in useState<'6w' | '12w' | 'all'>; it slices the
 *   trailing history window while the six forecast columns stay
 *   appended, so every layer recomputes from one visible-weeks array.
 *   Markers whose week falls outside the window simply don't render.
 * - Selected annotation id lives in useState<string | null> (one ships
 *   selected so the detail card is visible on first render). Tapping a
 *   marker selects it — aria-pressed reflects state — tapping again or
 *   the card's close button clears it. Never hover-dependent.
 * - Expanded milestone ids live in a Set<string> in useState; the
 *   chevron IconButton per row carries aria-expanded/aria-controls and
 *   toggles a full-width colSpan detail row. M2 ships expanded.
 *
 * Responsive contract:
 * - KPI row: Grid columns={{minWidth: 220, max: 4}} — 4-up wide,
 *   reflowing to 2-up then 1-up as the viewport narrows.
 * - Chart: fixed 260px height at every breakpoint. >640px it fills the
 *   card width (preserveAspectRatio="none" stretches x only). <=640px
 *   the chart body becomes a horizontal scroller with a 560px minimum
 *   content width so week labels and markers never collide at 375px —
 *   the marker overlay lives inside the scroller and pans with it.
 * - <=640px: the header HStack wraps so the range control + refresh drop
 *   below the title; both grow to size="lg" (40px) tap targets. The
 *   milestone table hides its Target date and Progress columns (both
 *   values reappear inside the row's detail region) and the page inset
 *   drops from padding 6 to 3. Scope-change markers are 40x40 at every
 *   width, and annotation detail opens on tap, not hover.
 *
 * Color policy: token-pure — every color is a var(--color-*) token or a
 * color-mix() over tokens, so the whole surface tracks light-dark()
 * automatically. No scheme-locked surfaces.
 *
 * Container policy (analytics archetype): frame-first page chrome; Cards
 * wrap the KPI Stats, the chart widget, and the milestone table. The
 * chart is styled divs/buttons plus one static SVG — CSS colors and
 * fixture math only, never a chart library or network asset.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import type {ProgressBarVariant} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Stat} from '@astryxdesign/core/Stat';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  FlagIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// Chart palette via Astryx data tokens (CSS custom properties). Each
// data token carries its documented default as a fallback so the series
// keep their hues (and stay visible in dark mode) even when a host theme
// doesn't inject the data-viz token set.
const chartColors = {
  scope: 'var(--color-data-categorical-blue, #0171E3)',
  completed: 'var(--color-data-categorical-green, #0B991F)',
  forecast: 'var(--color-data-categorical-purple, #6B1EFD)',
  grid: 'var(--color-border)',
  axisText: 'var(--color-text-secondary)',
  target: 'var(--color-error)',
};

const styles: Record<string, CSSProperties> = {
  // Chart body: horizontal scroller on phones; the inner canvas keeps a
  // 560px floor so labels and markers never collide at 375px.
  chartScroller: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  chartCanvas: {
    position: 'relative',
    width: '100%',
  },
  chartCanvasCompact: {
    position: 'relative',
    minWidth: 560,
  },
  chartSvg: {
    display: 'block',
    width: '100%',
    height: 260,
  },
  // Scope-change marker: 40x40 hit area centered on the chart point,
  // with a small visible dot inside. Real buttons — tap, not hover.
  marker: {
    position: 'absolute',
    width: 40,
    height: 40,
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-card)',
    border: \`3px solid \${chartColors.scope}\`,
    boxSizing: 'border-box',
  },
  markerDotSelected: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: chartColors.scope,
    border: '3px solid var(--color-background-card)',
    boxShadow: \`0 0 0 2px \${chartColors.scope}\`,
    boxSizing: 'border-box',
  },
  // GA-target chip pinned to the top of the target rule.
  targetChip: {
    position: 'absolute',
    transform: 'translate(-100%, 0)',
    whiteSpace: 'nowrap',
  },
  legendSwatchLine: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: chartColors.scope,
  },
  legendSwatchArea: {
    width: 16,
    height: 10,
    borderRadius: 2,
    backgroundColor: \`color-mix(in srgb, \${chartColors.completed} 25%, transparent)\`,
    border: \`1px solid \${chartColors.completed}\`,
    boxSizing: 'border-box',
  },
  legendSwatchBand: {
    width: 16,
    height: 10,
    borderRadius: 2,
    backgroundColor: \`color-mix(in srgb, \${chartColors.forecast} 18%, transparent)\`,
    border: \`1px dashed \${chartColors.forecast}\`,
    boxSizing: 'border-box',
  },
  // Numeric table cells use tabular numerals so digit columns align.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  numericHeader: {
    textAlign: 'end',
  },
  // Astryx header cells ship with max-width: 0 (a truncation hack); any
  // column that sets an explicit width must lift it, or the auto table
  // layout crushes the fixed columns to one character per line and
  // pushes the Status column past the card edge.
  headerCol: {
    maxWidth: 'none',
  },
  progressCell: {
    minWidth: 140,
  },
  detailCell: {
    backgroundColor: 'var(--color-background-muted)',
  },
  workItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  // Keep the chart from collapsing when the card flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
};

// ============= DATA =============

const RELEASE_NAME = 'Aurora 2.0';
const TARGET_LABEL = 'Aug 3';

type ChartRange = '6w' | '12w' | 'all';

/** Weekly burnup snapshots (week-starting Mondays), oldest first. \`scope\`
 * is total committed story points after that week's changes; \`completed\`
 * is cumulative points done. Fixed values — never a clock. */
interface Snapshot {
  week: string;
  scope: number;
  completed: number;
}

const SNAPSHOTS: Snapshot[] = [
  {week: 'Mar 9', scope: 120, completed: 0},
  {week: 'Mar 16', scope: 120, completed: 5},
  {week: 'Mar 23', scope: 120, completed: 11},
  {week: 'Mar 30', scope: 134, completed: 17},
  {week: 'Apr 6', scope: 134, completed: 24},
  {week: 'Apr 13', scope: 134, completed: 30},
  {week: 'Apr 20', scope: 134, completed: 37},
  {week: 'Apr 27', scope: 126, completed: 43},
  {week: 'May 4', scope: 126, completed: 50},
  {week: 'May 11', scope: 126, completed: 57},
  {week: 'May 18', scope: 126, completed: 63},
  {week: 'May 25', scope: 142, completed: 70},
  {week: 'Jun 1', scope: 142, completed: 77},
  {week: 'Jun 8', scope: 142, completed: 84},
  {week: 'Jun 15', scope: 142, completed: 90},
  {week: 'Jun 22', scope: 142, completed: 96},
];

/** Forecast columns appended after the last snapshot; the GA target is
 * the final column. Extra labels beyond the target feed the forecast-
 * date KPI (mid-velocity finish lands past the target). */
const FORECAST_LABELS = ['Jun 29', 'Jul 6', 'Jul 13', 'Jul 20', 'Jul 27', 'Aug 3'];
const FUTURE_LABELS = [
  ...FORECAST_LABELS,
  'Aug 10',
  'Aug 17',
  'Aug 24',
  'Aug 31',
];

/** Scope-change events. \`weekIndex\` points into SNAPSHOTS at the week
 * whose scope value already includes the change. */
interface ScopeChange {
  id: string;
  weekIndex: number;
  delta: number;
  title: string;
  reason: string;
  requestedBy: string;
  approvedIn: string;
}

const SCOPE_CHANGES: ScopeChange[] = [
  {
    id: 'chg-payments',
    weekIndex: 3,
    delta: 14,
    title: 'Payments v2 pulled into Aurora',
    reason:
      'Checkout team needs the new tokenization flow to ship with Aurora so both releases share one migration window.',
    requestedBy: 'R. Okafor (Payments)',
    approvedIn: 'Change review, Mar 27',
  },
  {
    id: 'chg-importer',
    weekIndex: 7,
    delta: -8,
    title: 'Legacy importer descoped',
    reason:
      'CSV importer usage fell below 2% of accounts; the rewrite moves to the Q3 maintenance train.',
    requestedBy: 'M. Tran (Product)',
    approvedIn: 'Change review, Apr 24',
  },
  {
    id: 'chg-compliance',
    weekIndex: 11,
    delta: 16,
    title: 'Data-residency compliance work added',
    reason:
      'Legal flagged EU data-residency requirements for the new sync service; GA cannot ship without regional storage.',
    requestedBy: 'L. Haugen (Legal/Infra)',
    approvedIn: 'Change review, May 22',
  },
];

// ---- Milestones ----

type MilestoneStatus = 'done' | 'on-track' | 'at-risk';
type WorkItemStatus = 'done' | 'in-progress' | 'not-started';

interface WorkItem {
  id: string;
  name: string;
  points: number;
  status: WorkItemStatus;
}

interface Milestone {
  id: string;
  name: string;
  target: string;
  owner: string;
  scope: number;
  completed: number;
  status: MilestoneStatus;
  note: string;
  workItems: WorkItem[];
}

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'M1 — API freeze',
    target: 'Apr 20',
    owner: 'Priya Raman',
    scope: 38,
    completed: 38,
    status: 'done',
    note: 'Closed on time; Payments v2 endpoints were frozen with the rest of the surface despite landing mid-milestone.',
    workItems: [
      {id: 'm1-1', name: 'Sync service API contract', points: 13, status: 'done'},
      {id: 'm1-2', name: 'Payments v2 endpoint schemas', points: 11, status: 'done'},
      {id: 'm1-3', name: 'Deprecation headers + docs', points: 8, status: 'done'},
      {id: 'm1-4', name: 'API review sign-off', points: 6, status: 'done'},
    ],
  },
  {
    id: 'm2',
    name: 'M2 — Feature complete',
    target: 'Jun 15',
    owner: 'Diego Fuentes',
    scope: 52,
    completed: 44,
    status: 'at-risk',
    note: 'Two weeks past target with 8 pts open — the May 25 compliance change (+16 pts) landed mid-milestone and split the sync team.',
    workItems: [
      {id: 'm2-1', name: 'Regional sync storage', points: 16, status: 'done'},
      {id: 'm2-2', name: 'Payments v2 checkout flow', points: 14, status: 'done'},
      {id: 'm2-3', name: 'Offline conflict resolution', points: 14, status: 'done'},
      {id: 'm2-4', name: 'Residency-aware routing', points: 8, status: 'in-progress'},
    ],
  },
  {
    id: 'm3',
    name: 'M3 — Beta hardening',
    target: 'Jul 13',
    owner: 'Sasha Kim',
    scope: 32,
    completed: 14,
    status: 'on-track',
    note: 'Perf and reliability passes tracking to plan; load-test fixes are absorbing spillover from M2 without slipping.',
    workItems: [
      {id: 'm3-1', name: 'Load-test fixes (p95 < 300ms)', points: 10, status: 'in-progress'},
      {id: 'm3-2', name: 'Beta cohort telemetry', points: 8, status: 'done'},
      {id: 'm3-3', name: 'Crash-free sessions > 99.8%', points: 8, status: 'in-progress'},
      {id: 'm3-4', name: 'Sync failure runbooks', points: 6, status: 'done'},
    ],
  },
  {
    id: 'm4',
    name: 'M4 — GA launch',
    target: TARGET_LABEL,
    owner: 'Priya Raman',
    scope: 20,
    completed: 0,
    status: 'at-risk',
    note: 'Blocked on M2 spillover; mid-velocity forecast lands Aug 17 — two weeks past the Aug 3 target. Descope or slip decision due at the Jul 6 release review.',
    workItems: [
      {id: 'm4-1', name: 'Staged rollout tooling', points: 8, status: 'not-started'},
      {id: 'm4-2', name: 'GA migration playbook', points: 6, status: 'not-started'},
      {id: 'm4-3', name: 'Launch comms + docs', points: 6, status: 'not-started'},
    ],
  },
];

const MILESTONE_BADGE: Record<
  MilestoneStatus,
  {label: string; variant: BadgeVariant}
> = {
  done: {label: 'Done', variant: 'success'},
  'on-track': {label: 'On track', variant: 'info'},
  'at-risk': {label: 'At risk', variant: 'warning'},
};

const MILESTONE_PROGRESS: Record<MilestoneStatus, ProgressBarVariant> = {
  done: 'success',
  'on-track': 'accent',
  'at-risk': 'warning',
};

const WORK_ITEM_TOKEN: Record<
  WorkItemStatus,
  {label: string; color: TokenColor}
> = {
  done: {label: 'Done', color: 'green'},
  'in-progress': {label: 'In progress', color: 'blue'},
  'not-started': {label: 'Not started', color: 'gray'},
};

// ============= DERIVED HELPERS (pure fixture math) =============

const LAST = SNAPSHOTS[SNAPSHOTS.length - 1];
const TOTAL_SCOPE = LAST.scope;
const TOTAL_DONE = LAST.completed;
const REMAINING = TOTAL_SCOPE - TOTAL_DONE;

/** Average completed points per week over the trailing \`weeks\` window. */
function velocityOver(weeks: number): number {
  const n = SNAPSHOTS.length;
  const first = SNAPSHOTS[n - 1 - weeks].completed;
  return (LAST.completed - first) / weeks;
}

/** Single-week throughput extremes across the whole history — the
 * forecast band spans the slowest and fastest observed week. */
function weeklyDeltas(): number[] {
  return SNAPSHOTS.slice(1).map(
    (snap, i) => snap.completed - SNAPSHOTS[i].completed,
  );
}

const MID_VELOCITY = velocityOver(4); // 6.5 pts/wk
const PRIOR_VELOCITY = velocityOver(8) * 2 - MID_VELOCITY; // prior 4-wk window
const FAST_VELOCITY = Math.max(...weeklyDeltas()); // 7 pts/wk
const SLOW_VELOCITY = Math.min(...weeklyDeltas().slice(1)); // 5 pts/wk (skip ramp-up week)

/** Weeks-after-last-snapshot until \`remaining\` burns down at \`velocity\`,
 * then a label from the fixed future-week table. Deterministic. */
function forecastWeeks(velocity: number): number {
  return Math.ceil(REMAINING / velocity);
}

function forecastLabel(velocity: number): string {
  const weeks = forecastWeeks(velocity);
  return FUTURE_LABELS[Math.min(weeks, FUTURE_LABELS.length) - 1];
}

const PERCENT_COMPLETE = Math.round((TOTAL_DONE / TOTAL_SCOPE) * 100);
const SCOPE_GROWTH = TOTAL_SCOPE - SNAPSHOTS[0].scope;
const SCOPE_GROWTH_PCT = Math.round((SCOPE_GROWTH / SNAPSHOTS[0].scope) * 100);
const VELOCITY_DELTA =
  Math.round((MID_VELOCITY - PRIOR_VELOCITY) * 100) / 100;
const FORECAST_DATE = forecastLabel(MID_VELOCITY); // Aug 17
const FORECAST_SLIP_WEEKS =
  forecastWeeks(MID_VELOCITY) - FORECAST_LABELS.length; // +2 wks past target

function formatPts(value: number): string {
  return \`\${value} pts\`;
}

function signed(value: number): string {
  return value >= 0 ? \`+\${value}\` : \`\${value}\`;
}

// ============= CHART GEOMETRY =============
//
// One fixed viewBox; xAt/yAt map (week index, points) to coordinates and
// the path builders below emit static SVG strings. That is the entire
// "engine" — keep it that way.

const CHART_W = 720;
const CHART_H = 260;
const PAD = {top: 18, right: 16, bottom: 28, left: 40} as const;
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;
const Y_MAX = 160; // comfortably above peak scope (142)
const Y_TICKS = [0, 40, 80, 120, 160];

function xAt(index: number, totalCols: number): number {
  return PAD.left + (index / (totalCols - 1)) * INNER_W;
}

function yAt(points: number): number {
  return PAD.top + INNER_H * (1 - points / Y_MAX);
}

/** Straight polyline through (index, value) pairs. */
function linePath(values: number[], totalCols: number, startIndex = 0): string {
  return values
    .map((v, i) => {
      const cmd = i === 0 ? 'M' : 'L';
      return \`\${cmd}\${xAt(startIndex + i, totalCols).toFixed(1)} \${yAt(v).toFixed(1)}\`;
    })
    .join(' ');
}

/** linePath closed down to the y=0 baseline (filled area). */
function areaPath(values: number[], totalCols: number): string {
  const last = xAt(values.length - 1, totalCols).toFixed(1);
  const first = xAt(0, totalCols).toFixed(1);
  const base = yAt(0).toFixed(1);
  return \`\${linePath(values, totalCols)} L\${last} \${base} L\${first} \${base} Z\`;
}

/** Step-after path: scope holds flat, then jumps at the change week. */
function stepPath(values: number[], totalCols: number): string {
  let d = \`M\${xAt(0, totalCols).toFixed(1)} \${yAt(values[0]).toFixed(1)}\`;
  for (let i = 1; i < values.length; i++) {
    d += \` H\${xAt(i, totalCols).toFixed(1)}\`;
    if (values[i] !== values[i - 1]) {
      d += \` V\${yAt(values[i]).toFixed(1)}\`;
    }
  }
  return d;
}

/** Forecast band polygon between two projected trajectories, both fanned
 * out from the last actual point and capped at total scope. */
function bandPath(
  startIndex: number,
  cols: number,
  totalCols: number,
  fastVel: number,
  slowVel: number,
): string {
  const high = (k: number) => Math.min(TOTAL_SCOPE, TOTAL_DONE + fastVel * k);
  const low = (k: number) => Math.min(TOTAL_SCOPE, TOTAL_DONE + slowVel * k);
  let d = \`M\${xAt(startIndex, totalCols).toFixed(1)} \${yAt(TOTAL_DONE).toFixed(1)}\`;
  for (let k = 1; k <= cols; k++) {
    d += \` L\${xAt(startIndex + k, totalCols).toFixed(1)} \${yAt(high(k)).toFixed(1)}\`;
  }
  for (let k = cols; k >= 1; k--) {
    d += \` L\${xAt(startIndex + k, totalCols).toFixed(1)} \${yAt(low(k)).toFixed(1)}\`;
  }
  return \`\${d} Z\`;
}

const RANGE_WEEKS: Record<ChartRange, number> = {
  '6w': 6,
  '12w': 12,
  all: SNAPSHOTS.length,
};

// ============= CHART SUBCOMPONENTS =============

interface BurnupChartProps {
  range: ChartRange;
  selectedChangeId: string | null;
  onSelectChange: (id: string) => void;
  isCompact: boolean;
}

/**
 * The layered burnup canvas: one static SVG (gridlines, forecast band,
 * completed area, scope steps, forecast line, target rule) plus HTML
 * marker buttons positioned from the same geometry. All coordinates are
 * derived in a single useMemo from the visible snapshot window.
 */
function BurnupChart({
  range,
  selectedChangeId,
  onSelectChange,
  isCompact,
}: BurnupChartProps) {
  const geometry = useMemo(() => {
    const historyCount = RANGE_WEEKS[range];
    const startOffset = SNAPSHOTS.length - historyCount;
    const visible = SNAPSHOTS.slice(startOffset);
    const totalCols = historyCount + FORECAST_LABELS.length;
    const lastHistoryIndex = historyCount - 1;

    const scopeValues = visible.map(s => s.scope);
    const completedValues = visible.map(s => s.completed);

    // Mid-velocity forecast polyline, capped at total scope.
    const midValues = [TOTAL_DONE];
    for (let k = 1; k <= FORECAST_LABELS.length; k++) {
      midValues.push(Math.min(TOTAL_SCOPE, TOTAL_DONE + MID_VELOCITY * k));
    }

    const labels = [...visible.map(s => s.week), ...FORECAST_LABELS];

    const markers = SCOPE_CHANGES.filter(
      change => change.weekIndex >= startOffset,
    ).map(change => {
      const col = change.weekIndex - startOffset;
      const x = xAt(col, totalCols);
      const y = yAt(SNAPSHOTS[change.weekIndex].scope);
      return {
        change,
        leftPct: (x / CHART_W) * 100,
        topPct: (y / CHART_H) * 100,
      };
    });

    const targetX = xAt(totalCols - 1, totalCols);

    return {
      totalCols,
      lastHistoryIndex,
      scopeValues,
      completedValues,
      midValues,
      labels,
      markers,
      targetX,
    };
  }, [range]);

  const {
    totalCols,
    lastHistoryIndex,
    scopeValues,
    completedValues,
    midValues,
    labels,
    markers,
    targetX,
  } = geometry;

  return (
    <div style={isCompact ? styles.chartScroller : undefined}>
      <div style={isCompact ? styles.chartCanvasCompact : styles.chartCanvas}>
        <svg
          viewBox={\`0 0 \${CHART_W} \${CHART_H}\`}
          preserveAspectRatio="none"
          style={styles.chartSvg}
          role="img"
          aria-label={\`Burnup chart: \${TOTAL_DONE} of \${TOTAL_SCOPE} points complete, forecast band projected to the \${TARGET_LABEL} GA target\`}>
          {/* Gridlines + y labels */}
          {Y_TICKS.map(tick => (
            <g key={tick}>
              <line
                x1={PAD.left}
                x2={CHART_W - PAD.right}
                y1={yAt(tick)}
                y2={yAt(tick)}
                stroke={chartColors.grid}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={yAt(tick) + 3}
                textAnchor="end"
                fontSize={10}
                fill={chartColors.axisText}>
                {tick}
              </text>
            </g>
          ))}

          {/* Forecast band: slowest → fastest observed weekly throughput */}
          <path
            d={bandPath(
              lastHistoryIndex,
              FORECAST_LABELS.length,
              totalCols,
              FAST_VELOCITY,
              SLOW_VELOCITY,
            )}
            fill={chartColors.forecast}
            fillOpacity={0.14}
            stroke="none"
          />

          {/* Completed area + line */}
          <path
            d={areaPath(completedValues, totalCols)}
            fill={chartColors.completed}
            fillOpacity={0.22}
            stroke="none"
          />
          <path
            d={linePath(completedValues, totalCols)}
            fill="none"
            stroke={chartColors.completed}
            strokeWidth={2}
          />

          {/* Total scope: solid steps through history, flat dashed
              continuation across the forecast region */}
          <path
            d={stepPath(scopeValues, totalCols)}
            fill="none"
            stroke={chartColors.scope}
            strokeWidth={2}
          />
          <line
            x1={xAt(lastHistoryIndex, totalCols)}
            x2={xAt(totalCols - 1, totalCols)}
            y1={yAt(TOTAL_SCOPE)}
            y2={yAt(TOTAL_SCOPE)}
            stroke={chartColors.scope}
            strokeWidth={2}
            strokeDasharray="2 5"
            opacity={0.6}
          />

          {/* Mid-velocity forecast line */}
          <path
            d={linePath(midValues, totalCols, lastHistoryIndex)}
            fill="none"
            stroke={chartColors.forecast}
            strokeWidth={2}
            strokeDasharray="5 4"
          />

          {/* GA target rule in the final column */}
          <line
            x1={targetX}
            x2={targetX}
            y1={PAD.top}
            y2={yAt(0)}
            stroke={chartColors.target}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* X labels: every other column to keep 10px text readable */}
          {labels.map((label, i) =>
            i % 2 === totalCols % 2 ? (
              <text
                key={\`\${label}-\${i}\`}
                x={xAt(i, totalCols)}
                y={CHART_H - 8}
                textAnchor="middle"
                fontSize={10}
                fill={
                  i === totalCols - 1 ? chartColors.target : chartColors.axisText
                }>
                {label}
              </text>
            ) : null,
          )}
        </svg>

        {/* GA-target chip pinned to the top of the target rule */}
        <div
          style={{
            ...styles.targetChip,
            left: \`\${(targetX / CHART_W) * 100}%\`,
            top: 0,
          }}>
          <HStack gap={1} vAlign="center">
            <Icon icon={FlagIcon} size="xsm" color="error" />
            <Text type="supporting" color="secondary">
              GA target · {TARGET_LABEL}
            </Text>
          </HStack>
        </div>

        {/* Scope-change markers: 40px tap targets over the step line */}
        {markers.map(({change, leftPct, topPct}) => {
          const isSelected = change.id === selectedChangeId;
          return (
            <button
              key={change.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={\`Scope change \${SNAPSHOTS[change.weekIndex].week}: \${signed(change.delta)} points — \${change.title}\`}
              onClick={() => onSelectChange(change.id)}
              style={{
                ...styles.marker,
                left: \`\${leftPct}%\`,
                top: \`\${topPct}%\`,
              }}>
              <span
                style={isSelected ? styles.markerDotSelected : styles.markerDot}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Static legend row under the chart — plain color chips, no library. */
function ChartLegend() {
  return (
    <HStack gap={4} vAlign="center" wrap="wrap">
      <HStack gap={1.5} vAlign="center">
        <span style={styles.legendSwatchLine} />
        <Text type="supporting" color="secondary">
          Total scope
        </Text>
      </HStack>
      <HStack gap={1.5} vAlign="center">
        <span style={styles.legendSwatchArea} />
        <Text type="supporting" color="secondary">
          Completed
        </Text>
      </HStack>
      <HStack gap={1.5} vAlign="center">
        <span style={styles.legendSwatchBand} />
        <Text type="supporting" color="secondary">
          Forecast band ({SLOW_VELOCITY}–{FAST_VELOCITY} pts/wk)
        </Text>
      </HStack>
    </HStack>
  );
}

/** Annotation detail card: opens on marker tap, closes via its button. */
function ScopeChangeDetail({
  change,
  onClose,
}: {
  change: ScopeChange;
  onClose: () => void;
}) {
  const snapshot = SNAPSHOTS[change.weekIndex];
  const deltaVariant: BadgeVariant = change.delta > 0 ? 'warning' : 'success';
  return (
    <Card variant="muted">
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Badge
            label={\`\${signed(change.delta)} pts\`}
            variant={deltaVariant}
          />
          <StackItem size="fill">
            <Heading level={4}>{change.title}</Heading>
          </StackItem>
          <Button
            label="Close"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        </HStack>
        <Text type="body" color="secondary">
          {change.reason}
        </Text>
        <HStack gap={4} wrap="wrap">
          <Text type="supporting" color="secondary">
            Week of {snapshot.week} · scope {snapshot.scope - change.delta} →{' '}
            {snapshot.scope} pts
          </Text>
          <Text type="supporting" color="secondary">
            Requested by {change.requestedBy}
          </Text>
          <Text type="supporting" color="secondary">
            {change.approvedIn}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= MILESTONE TABLE =============

const COLUMN_COUNT = 7; // toggle, milestone, target, scope, done, progress, status
const COLUMN_COUNT_COMPACT = 5; // hides target + progress

/** Full-span drill-down region under an expanded milestone row. */
function MilestoneDetailRow({
  milestone,
  isCompact,
}: {
  milestone: Milestone;
  isCompact: boolean;
}) {
  const percent =
    milestone.scope === 0
      ? 0
      : Math.round((milestone.completed / milestone.scope) * 100);
  return (
    <TableRow id={\`milestone-detail-\${milestone.id}\`}>
      <TableCell
        colSpan={isCompact ? COLUMN_COUNT_COMPACT : COLUMN_COUNT}
        style={styles.detailCell}>
        <VStack gap={3}>
          <HStack gap={4} wrap="wrap">
            <Text type="supporting" color="secondary">
              Owner: {milestone.owner}
            </Text>
            <Text type="supporting" color="secondary">
              Target: {milestone.target}
            </Text>
            <Text type="supporting" color="secondary">
              Remaining: {formatPts(milestone.scope - milestone.completed)}
            </Text>
          </HStack>
          {isCompact && (
            <ProgressBar
              label={\`\${milestone.name} progress\`}
              isLabelHidden
              value={percent}
              hasValueLabel
              variant={MILESTONE_PROGRESS[milestone.status]}
            />
          )}
          <Text type="body" color="secondary">
            {milestone.note}
          </Text>
          <Divider />
          <VStack gap={1.5}>
            {milestone.workItems.map(item => {
              const token = WORK_ITEM_TOKEN[item.status];
              return (
                <div key={item.id} style={styles.workItemRow}>
                  <Token label={token.label} color={token.color} size="sm" />
                  <StackItem size="fill">
                    <Text type="body" maxLines={1}>
                      {item.name}
                    </Text>
                  </StackItem>
                  <Text type="supporting" color="secondary">
                    {formatPts(item.points)}
                  </Text>
                </div>
              );
            })}
          </VStack>
        </VStack>
      </TableCell>
    </TableRow>
  );
}

// ============= PAGE =============

export default function MilestoneBurnupTemplate() {
  const [range, setRange] = useState<ChartRange>('all');
  // One annotation ships selected so the detail card renders on load.
  const [selectedChangeId, setSelectedChangeId] = useState<string | null>(
    'chg-compliance',
  );
  // M2 ships expanded so the drill-down region is visible on load.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set(['m2']),
  );
  const isCompact = useMediaQuery('(max-width: 640px)');

  const selectedChange = useMemo(
    () =>
      SCOPE_CHANGES.find(change => change.id === selectedChangeId) ?? null,
    [selectedChangeId],
  );

  const toggleChange = (id: string) => {
    setSelectedChangeId(current => (current === id ? null : id));
  };

  const toggleMilestone = (id: string) => {
    setExpandedIds(current => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
            <StackItem size="fill">
              <VStack gap={0.5}>
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{RELEASE_NAME} burnup</Heading>
                  <Badge label="At risk" variant="warning" />
                </HStack>
                <Text type="supporting" color="secondary">
                  GA target {TARGET_LABEL} · {formatPts(TOTAL_DONE)} of{' '}
                  {formatPts(TOTAL_SCOPE)} complete · 16 weeks tracked
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Chart range"
              value={range}
              onChange={value => setRange(value as ChartRange)}
              size={isCompact ? 'lg' : 'md'}>
              <SegmentedControlItem label="6 wk" value="6w" />
              <SegmentedControlItem label="12 wk" value="12w" />
              <SegmentedControlItem label="All" value="all" />
            </SegmentedControl>
            <IconButton
              label="Refresh data"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
              variant="ghost"
              size={isCompact ? 'lg' : 'md'}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={isCompact ? 3 : 6}>
          <VStack gap={6}>
            {/* KPI row — every value derives from the snapshot fixtures */}
            <Grid columns={{minWidth: 220, max: 4}} gap={4}>
              <Card>
                <Stat
                  label="Percent complete"
                  value={\`\${PERCENT_COMPLETE}%\`}
                  delta={{value: \`\${formatPts(REMAINING)} remaining\`, direction: 'flat'}}
                  description="of current scope"
                />
              </Card>
              <Card>
                <Stat
                  label="Velocity (4 wk)"
                  value={\`\${MID_VELOCITY.toFixed(1)} pts/wk\`}
                  delta={{
                    value: \`\${signed(VELOCITY_DELTA)} pts/wk\`,
                    direction: VELOCITY_DELTA >= 0 ? 'up' : 'down',
                    sentiment: VELOCITY_DELTA >= 0 ? 'positive' : 'negative',
                  }}
                  description="vs. prior 4 weeks"
                />
              </Card>
              <Card>
                <Stat
                  label="Forecast date"
                  value={FORECAST_DATE}
                  delta={{
                    value: \`\${FORECAST_SLIP_WEEKS} wks past target\`,
                    direction: 'up',
                    sentiment: 'negative',
                  }}
                  description={\`range \${forecastLabel(FAST_VELOCITY)} – \${forecastLabel(SLOW_VELOCITY)}\`}
                />
              </Card>
              <Card>
                <Stat
                  label="Scope growth"
                  value={\`\${signed(SCOPE_GROWTH)} pts\`}
                  delta={{
                    value: \`\${signed(SCOPE_GROWTH_PCT)}%\`,
                    direction: 'up',
                    sentiment: 'negative',
                  }}
                  description="since kickoff (Mar 9)"
                />
              </Card>
            </Grid>

            {/* Burnup chart — scope steps, completed area, forecast band */}
            <Card>
              <VStack gap={2}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <StackItem size="fill">
                    <VStack gap={0.5}>
                      <Heading level={3}>Scope vs. completed</Heading>
                      <Text type="supporting" color="secondary">
                        Weekly story points; markers are scope changes — tap
                        one for the change record
                      </Text>
                    </VStack>
                  </StackItem>
                  <ChartLegend />
                </HStack>
                <div style={styles.chartBody}>
                  <BurnupChart
                    range={range}
                    selectedChangeId={selectedChangeId}
                    onSelectChange={toggleChange}
                    isCompact={isCompact}
                  />
                </div>
                {selectedChange != null && (
                  <ScopeChangeDetail
                    change={selectedChange}
                    onClose={() => setSelectedChangeId(null)}
                  />
                )}
              </VStack>
            </Card>

            {/* Milestone table — expand a row for the drill-down region */}
            <Card>
              <VStack gap={4}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Heading level={3}>Milestones</Heading>
                  </StackItem>
                  <Text type="supporting" color="secondary">
                    Expand a row for owner, work items, and notes
                  </Text>
                </HStack>
                <Table density="compact" dividers="rows" hasHover>
                  <TableHeader>
                    <TableRow isHeaderRow>
                      <TableHeaderCell
                        scope="col"
                        style={{...styles.headerCol, width: 48}}>
                        <Text type="supporting" color="secondary">
                          {''}
                        </Text>
                      </TableHeaderCell>
                      <TableHeaderCell scope="col" style={styles.headerCol}>
                        Milestone
                      </TableHeaderCell>
                      {!isCompact && (
                        <TableHeaderCell
                          scope="col"
                          style={{...styles.headerCol, width: 100}}>
                          Target
                        </TableHeaderCell>
                      )}
                      <TableHeaderCell
                        scope="col"
                        style={{
                          ...styles.numericHeader,
                          ...styles.headerCol,
                          width: 90,
                        }}>
                        Scope
                      </TableHeaderCell>
                      <TableHeaderCell
                        scope="col"
                        style={{
                          ...styles.numericHeader,
                          ...styles.headerCol,
                          width: 90,
                        }}>
                        Done
                      </TableHeaderCell>
                      {!isCompact && (
                        <TableHeaderCell
                          scope="col"
                          style={{...styles.headerCol, width: 180}}>
                          Progress
                        </TableHeaderCell>
                      )}
                      <TableHeaderCell
                        scope="col"
                        style={{...styles.headerCol, width: 110}}>
                        Status
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MILESTONES.map(milestone => {
                      const isExpanded = expandedIds.has(milestone.id);
                      const badge = MILESTONE_BADGE[milestone.status];
                      const percent =
                        milestone.scope === 0
                          ? 0
                          : Math.round(
                              (milestone.completed / milestone.scope) * 100,
                            );
                      return (
                        <FragmentRow
                          key={milestone.id}
                          milestone={milestone}
                          isExpanded={isExpanded}
                          isCompact={isCompact}
                          badgeLabel={badge.label}
                          badgeVariant={badge.variant}
                          percent={percent}
                          onToggle={() => toggleMilestone(milestone.id)}
                        />
                      );
                    })}
                  </TableBody>
                </Table>
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}

// ============= MILESTONE ROW =============

/**
 * One milestone row plus its optional colSpan detail row. Kept as a
 * sibling-fragment component so TableBody children stay valid rows.
 */
function FragmentRow({
  milestone,
  isExpanded,
  isCompact,
  badgeLabel,
  badgeVariant,
  percent,
  onToggle,
}: {
  milestone: Milestone;
  isExpanded: boolean;
  isCompact: boolean;
  badgeLabel: string;
  badgeVariant: BadgeVariant;
  percent: number;
  onToggle: () => void;
}) {
  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton
            label={
              isExpanded
                ? \`Collapse \${milestone.name}\`
                : \`Expand \${milestone.name}\`
            }
            icon={
              <Icon
                icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
                size="sm"
              />
            }
            variant="ghost"
            size={isCompact ? 'lg' : 'sm'}
            aria-expanded={isExpanded}
            aria-controls={
              isExpanded ? \`milestone-detail-\${milestone.id}\` : undefined
            }
            onClick={onToggle}
          />
        </TableCell>
        <TableCell scope="row">
          <VStack gap={0.5}>
            <Text type="body" maxLines={1}>
              {milestone.name}
            </Text>
            <Text type="supporting" color="secondary">
              {milestone.owner}
              {isCompact ? \` · target \${milestone.target}\` : ''}
            </Text>
          </VStack>
        </TableCell>
        {!isCompact && (
          <TableCell>
            <Text type="body" color="secondary">
              {milestone.target}
            </Text>
          </TableCell>
        )}
        <TableCell style={styles.numericCell}>
          <Text type="body">{milestone.scope}</Text>
        </TableCell>
        <TableCell style={styles.numericCell}>
          <Text type="body">{milestone.completed}</Text>
        </TableCell>
        {!isCompact && (
          <TableCell style={styles.progressCell}>
            <ProgressBar
              label={\`\${milestone.name} progress\`}
              isLabelHidden
              value={percent}
              hasValueLabel
              variant={MILESTONE_PROGRESS[milestone.status]}
            />
          </TableCell>
        )}
        <TableCell>
          <Badge label={badgeLabel} variant={badgeVariant} />
        </TableCell>
      </TableRow>
      {isExpanded && (
        <MilestoneDetailRow milestone={milestone} isCompact={isCompact} />
      )}
    </>
  );
}
`;export{e as default};