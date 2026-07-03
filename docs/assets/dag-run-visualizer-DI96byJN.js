var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 9-task revenue-rollup DAG with
 *   hand-placed column/row geometry, 8 historical runs at fixed 06:00 UTC
 *   dates with per-task states/durations/attempt lists — one run failing at
 *   transform_events with every downstream task upstream_failed — plus
 *   canned log-line templates derived from task id and run date)
 * @output Airflow-style orchestration console: the left rail lists recent
 *   runs with derived StatusDots, total task time, and an All/Failed
 *   SegmentedControl; the center draws the selected run's task DAG as
 *   absolutely-positioned node buttons over one edge SVG, node borders and
 *   edge strokes colored by per-task state; a bottom strip renders the
 *   run-history grid (tasks x runs) of tiny status cells with the selected
 *   run's column tinted. Clicking a task opens the right panel with a
 *   MetadataList, attempt history rows, and a mono log box; Retry and Mark
 *   success mutate the task and cascade queued → running → success down the
 *   DAG on a short interval, live re-deriving the run's rail dot; a
 *   Backfill Dialog picks a DateInput range and appends synthetic queued
 *   runs to the rail and grid; a header Paused Switch gates backfills
 * @position Page template; emitted by \`astryx template dag-run-visualizer\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (DAG name,
 * cron Code chip, colored run-count summary, Paused Switch, Backfill
 * button). LayoutPanel start 264 is the run rail (filter + run rows).
 * LayoutContent stacks the DAG canvas (its own horizontal scroller at an
 * intrinsic 996px) over a Divider and the run-history grid strip (second
 * deliberate horizontal scroller). The end LayoutPanel (340, scrollable)
 * opens on task selection with attempts, logs, and actions.
 *
 * Responsive contract:
 * - > 1024px: run rail 264 | DAG + history grid (fill) | task panel 340
 *   (only while a task is selected; the center reflows when it closes).
 * - <= 1024px: the rail leaves the \`start\` slot and becomes a horizontal
 *   run-chip strip above the canvas (40px chips, its own overflow-x); the
 *   task panel becomes a Dialog opened by node or grid-cell taps.
 * - <= 640px: the header caption and Switch description drop, chrome
 *   wraps, and the Backfill button keeps a 40px tap height. The DAG canvas
 *   and history grid keep intrinsic width and pan horizontally — the only
 *   two deliberate overflow-x regions; page chrome never pans.
 * - Tap targets: run rows/chips and DAG nodes are >=40px buttons. History
 *   grid cells are intentionally tiny (20px swatches) but every cell
 *   action (select run, open task) is duplicated by the 40px rail/chips
 *   and node buttons, so the grid is a shortcut, never the only path.
 * - No hover-only affordances: nodes and cells are real buttons with
 *   aria-pressed selection state; Tooltips also open on focus.
 *
 * Container policy (orchestration-console archetype): frame-first rows and
 * panels, no Cards. The DAG is one SVG of cubic edges under plain button
 * nodes, all driven by fixture col/row integers — never a chart or graph
 * library. The history grid is styled divs; log lines are canned strings
 * in a mono box. Retry/mark-success cascades run on setInterval ticks over
 * fixture task order (no clocks read, no randomness).
 */

import {useRef, useState, type CSSProperties} from 'react';

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
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Code} from '@astryxdesign/core/Code';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarPlusIcon,
  CheckIcon,
  MousePointerClickIcon,
  RotateCcwIcon,
  WorkflowIcon,
} from 'lucide-react';

// ============= DAG GEOMETRY =============
// Node positions come from fixture col/row integers; the canvas is a
// position:relative div sized from the grid, with one SVG of cubic edges
// underneath and a plain <button> per node on top (buttons keep the nodes
// focusable and >=40px tall without any SVG hit-testing).

const NODE_W = 148;
const NODE_H = 56; // >=40px tap target by construction
const COL_GAP = 56;
const ROW_GAP = 18;
const CANVAS_PAD = 16;
const DAG_COLS = 5;
const DAG_ROWS = 3;

const CANVAS_W = CANVAS_PAD * 2 + DAG_COLS * NODE_W + (DAG_COLS - 1) * COL_GAP;
const CANVAS_H = CANVAS_PAD * 2 + DAG_ROWS * NODE_H + (DAG_ROWS - 1) * ROW_GAP;

function nodeX(col: number): number {
  return CANVAS_PAD + col * (NODE_W + COL_GAP);
}

function nodeY(row: number): number {
  return CANVAS_PAD + row * (NODE_H + ROW_GAP);
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  headerRow: {width: '100%', flexWrap: 'wrap'},
  backfillButton: {minHeight: 40},
  contentFill: {height: '100%', minHeight: 0},
  // Deliberate overflow-x region #1: the DAG canvas pans at narrow widths
  // (intrinsic 996px); vertical space above the grid strip is flexible.
  canvasScroll: {
    overflow: 'auto',
    minHeight: 0,
    flex: 1,
  },
  canvas: {
    position: 'relative',
    width: CANVAS_W,
    height: CANVAS_H,
    flexShrink: 0,
  },
  edgeSvg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  // One DAG node: bordered button colored by task state. Selected nodes
  // pick up the blue selection tint used across sibling templates.
  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    padding: '0 var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: 'var(--color-background-body)',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  nodeSelected: {
    backgroundColor: 'var(--color-background-blue)',
  },
  nodeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  nodeSwatch: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  nodeName: {minWidth: 0},
  // Run rail rows are plain buttons so the whole row is one 44px target.
  runRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  runRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
  },
  runRowBody: {minWidth: 0, flex: 1},
  railScroll: {
    minHeight: 0,
    overflowY: 'auto',
  },
  // <=1024px replacement for the rail: horizontally scrolling chip strip.
  chipStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  runChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    padding: '0 var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
    flexShrink: 0,
  },
  runChipSelected: {
    backgroundColor: 'var(--color-background-blue)',
    borderColor: 'var(--color-icon-blue)',
  },
  // Deliberate overflow-x region #2: the run-history grid strip.
  gridStrip: {
    padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)',
  },
  gridScroll: {
    display: 'flex',
    overflowX: 'auto',
    gap: 2,
  },
  gridLabelCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flexShrink: 0,
    width: 140,
    position: 'sticky',
    left: 0,
    backgroundColor: 'var(--color-background-body)',
    paddingRight: 'var(--spacing-2)',
  },
  gridLabelCell: {
    height: 20,
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  gridRunCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flexShrink: 0,
    borderRadius: 4,
    padding: 1,
  },
  gridRunColSelected: {
    backgroundColor: 'var(--color-background-blue)',
  },
  gridHeadCell: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  // Tiny status cell: 20px button around a 12px swatch. The grid is a
  // shortcut — the same actions live on 40px rail rows and node buttons.
  gridCell: {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
  },
  gridSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  gridSwatchSelected: {
    outline: '2px solid var(--color-icon-blue)',
    outlineOffset: 1,
  },
  // Task panel bits.
  panelScroll: {minHeight: 0},
  attemptRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  attemptRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
  },
  logBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    maxHeight: 220,
    overflowY: 'auto',
  },
  logLine: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontSize: 12,
    lineHeight: '18px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    margin: 0,
  },
  logError: {color: 'var(--color-text-red)'},
  countSuccess: {color: 'var(--color-text-green)'},
  countFailed: {color: 'var(--color-text-red)'},
  countRunning: {color: 'var(--color-text-blue)'},
  dialogBody: {paddingBottom: 'var(--spacing-2)'},
  truncateCell: {minWidth: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed run dates at 06:00 UTC, hand-authored task
// states and durations. No Date.now, no randomness; retry cascades advance
// on setInterval ticks over fixture task order.

type TaskState =
  | 'success'
  | 'failed'
  | 'running'
  | 'queued'
  | 'skipped'
  | 'upstream_failed';

interface DagTask {
  id: string;
  operator: string;
  col: number;
  row: number;
  deps: string[];
}

interface Attempt {
  n: number;
  state: 'success' | 'failed' | 'running' | 'queued';
  durationSec: number | null;
}

interface TaskInstance {
  state: TaskState;
  durationSec: number | null;
  attempts: Attempt[];
}

interface DagRun {
  id: string;
  /** YYYY-MM-DD logical date; also seeds the canned log timestamps. */
  isoDate: string;
  dateLabel: string;
  timeLabel: string;
  kind: 'scheduled' | 'backfill';
  tasks: Record<string, TaskInstance>;
}

// Topological fixture order: every task appears after all of its deps, so
// downstream cascades can just filter this list.
const TASKS: DagTask[] = [
  {id: 'extract_orders', operator: 'PythonOperator', col: 0, row: 0, deps: []},
  {id: 'extract_events', operator: 'PythonOperator', col: 0, row: 2, deps: []},
  {
    id: 'validate_schema',
    operator: 'SQLCheckOperator',
    col: 1,
    row: 1,
    deps: ['extract_orders', 'extract_events'],
  },
  {
    id: 'transform_orders',
    operator: 'DbtRunOperator',
    col: 2,
    row: 0,
    deps: ['validate_schema'],
  },
  {
    id: 'transform_events',
    operator: 'DbtRunOperator',
    col: 2,
    row: 1,
    deps: ['validate_schema'],
  },
  {
    id: 'enrich_geo',
    operator: 'PythonOperator',
    col: 2,
    row: 2,
    deps: ['validate_schema'],
  },
  {
    id: 'aggregate_daily',
    operator: 'SQLOperator',
    col: 3,
    row: 1,
    deps: ['transform_orders', 'transform_events', 'enrich_geo'],
  },
  {
    id: 'publish_metrics',
    operator: 'PythonOperator',
    col: 4,
    row: 0,
    deps: ['aggregate_daily'],
  },
  {
    id: 'notify_slack',
    operator: 'SlackOperator',
    col: 4,
    row: 2,
    deps: ['aggregate_daily'],
  },
];

const TASK_BY_ID = new Map(TASKS.map(task => [task.id, task]));

/** Baseline per-task durations (seconds); retried runs reuse these. */
const BASE_DURATION: Record<string, number> = {
  extract_orders: 142,
  extract_events: 218,
  validate_schema: 37,
  transform_orders: 304,
  transform_events: 351,
  enrich_geo: 129,
  aggregate_daily: 468,
  publish_metrics: 55,
  notify_slack: 8,
};

const STATE_META: Record<
  TaskState,
  {label: string; color: string; badge: BadgeVariant}
> = {
  success: {label: 'success', color: 'var(--color-icon-green)', badge: 'success'},
  failed: {label: 'failed', color: 'var(--color-icon-red)', badge: 'error'},
  running: {label: 'running', color: 'var(--color-icon-blue)', badge: 'info'},
  queued: {
    label: 'queued',
    color: 'var(--color-border-emphasized)',
    badge: 'neutral',
  },
  skipped: {label: 'skipped', color: 'var(--color-icon-purple)', badge: 'neutral'},
  upstream_failed: {
    label: 'upstream failed',
    color: 'var(--color-icon-orange)',
    badge: 'warning',
  },
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function dateLabelOf(isoDate: string): string {
  const month = MONTH_NAMES[Number(isoDate.slice(5, 7)) - 1];
  return \`\${month} \${Number(isoDate.slice(8, 10))}\`;
}

function okInstance(taskId: string, factor: number): TaskInstance {
  const duration = Math.round(BASE_DURATION[taskId] * factor);
  return {
    state: 'success',
    durationSec: duration,
    attempts: [{n: 1, state: 'success', durationSec: duration}],
  };
}

/** All-green scheduled run; \`factor\` nudges durations per run. */
function successRun(isoDate: string, factor: number): DagRun {
  const tasks: Record<string, TaskInstance> = {};
  for (const task of TASKS) {
    tasks[task.id] = okInstance(task.id, factor);
  }
  return {
    id: \`run-\${isoDate}\`,
    isoDate,
    dateLabel: dateLabelOf(isoDate),
    timeLabel: '06:00',
    kind: 'scheduled',
    tasks,
  };
}

function queuedInstance(): TaskInstance {
  return {state: 'queued', durationSec: null, attempts: []};
}

function buildInitialRuns(): DagRun[] {
  // Jul 2: mid-flight — extracts and validation landed, transform_orders
  // is running, everything after is queued. Frozen fixture, not a clock.
  const running = successRun('2026-07-02', 1.02);
  running.tasks.transform_orders = {
    state: 'running',
    durationSec: null,
    attempts: [{n: 1, state: 'running', durationSec: null}],
  };
  for (const id of [
    'transform_events',
    'enrich_geo',
    'aggregate_daily',
    'publish_metrics',
    'notify_slack',
  ]) {
    running.tasks[id] = queuedInstance();
  }

  // Jun 29: the failure fixture — transform_events failed twice, so every
  // task downstream of it is upstream_failed (never attempted).
  const failed = successRun('2026-06-29', 0.97);
  failed.tasks.transform_events = {
    state: 'failed',
    durationSec: 91,
    attempts: [
      {n: 1, state: 'failed', durationSec: 84},
      {n: 2, state: 'failed', durationSec: 91},
    ],
  };
  for (const id of ['aggregate_daily', 'publish_metrics', 'notify_slack']) {
    failed.tasks[id] = {state: 'upstream_failed', durationSec: null, attempts: []};
  }

  // Jun 27: flaky-but-recovered flavor — transform_events needed 2 tries.
  const flaky = successRun('2026-06-27', 1.06);
  flaky.tasks.transform_events = {
    state: 'success',
    durationSec: 356,
    attempts: [
      {n: 1, state: 'failed', durationSec: 87},
      {n: 2, state: 'success', durationSec: 356},
    ],
  };

  // Newest first, matching the rail order.
  return [
    running,
    successRun('2026-07-01', 0.94),
    successRun('2026-06-30', 1.11),
    failed,
    successRun('2026-06-28', 1.0),
    flaky,
    successRun('2026-06-26', 0.9),
    successRun('2026-06-25', 1.04),
  ];
}

// ============= DERIVATIONS =============

type RunStatus = 'success' | 'failed' | 'running' | 'queued';

function runStatusOf(run: DagRun): RunStatus {
  const states = TASKS.map(task => run.tasks[task.id].state);
  if (states.some(state => state === 'running')) {
    return 'running';
  }
  if (states.some(state => state === 'failed' || state === 'upstream_failed')) {
    return 'failed';
  }
  if (states.every(state => state === 'queued')) {
    return 'queued';
  }
  if (states.some(state => state === 'queued')) {
    return 'running';
  }
  return 'success';
}

const RUN_STATUS_META: Record<
  RunStatus,
  {dot: 'success' | 'error' | 'accent' | 'neutral'; label: string}
> = {
  success: {dot: 'success', label: 'success'},
  failed: {dot: 'error', label: 'failed'},
  running: {dot: 'accent', label: 'running'},
  queued: {dot: 'neutral', label: 'queued'},
};

function formatDuration(seconds: number | null): string {
  if (seconds == null) {
    return '—';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return \`\${secs}s\`;
  }
  return \`\${mins}m \${String(secs).padStart(2, '0')}s\`;
}

/** Total task time across the run (the rail's duration readout). */
function runDurationSec(run: DagRun): number | null {
  let total = 0;
  let hasAny = false;
  for (const task of TASKS) {
    const duration = run.tasks[task.id].durationSec;
    if (duration != null) {
      total += duration;
      hasAny = true;
    }
  }
  return hasAny ? total : null;
}

/** Direct children per task, derived once from the deps fixture. */
const CHILDREN: Record<string, string[]> = (() => {
  const map: Record<string, string[]> = {};
  for (const task of TASKS) {
    map[task.id] = [];
  }
  for (const task of TASKS) {
    for (const dep of task.deps) {
      map[dep].push(task.id);
    }
  }
  return map;
})();

/** Every task reachable below \`taskId\`, in fixture (topological) order. */
function downstreamOf(taskId: string): string[] {
  const reached = new Set<string>();
  const walk = (id: string) => {
    for (const child of CHILDREN[id]) {
      if (!reached.has(child)) {
        reached.add(child);
        walk(child);
      }
    }
  };
  walk(taskId);
  return TASKS.filter(task => reached.has(task.id)).map(task => task.id);
}

// Canned log lines, derived from fixture values only (task id + run date +
// attempt state), so the same selection always prints the same log.
function attemptLogs(task: DagTask, run: DagRun, attempt: Attempt): string[] {
  const stamp = (secs: number) =>
    \`[\${run.isoDate} 06:0\${Math.floor(secs / 60)}:\${String(secs % 60).padStart(2, '0')}]\`;
  if (attempt.state === 'queued') {
    return [
      \`\${stamp(1)} INFO - Task \${task.id} queued by scheduler\`,
      \`\${stamp(2)} INFO - Waiting for an executor slot in pool default_pool\`,
    ];
  }
  const lines = [
    \`\${stamp(4)} INFO - Dependencies all met for \${task.id}\`,
    \`\${stamp(5)} INFO - Starting attempt \${attempt.n} of \${attempt.n + 1}\`,
    \`\${stamp(5)} INFO - Executing \${task.operator} on host worker-2\`,
  ];
  if (attempt.state === 'running') {
    lines.push(\`\${stamp(8)} INFO - \${task.id} in progress…\`);
    return lines;
  }
  if (attempt.state === 'failed') {
    lines.push(
      \`\${stamp(9)} ERROR - ValueError: events batch \${run.isoDate} contains 47 rows with null event_ts\`,
      \`\${stamp(9)} ERROR - Task failed after \${formatDuration(attempt.durationSec)}; downstream set to upstream_failed\`,
    );
    return lines;
  }
  lines.push(
    \`\${stamp(9)} INFO - \${task.id} completed in \${formatDuration(attempt.durationSec)}\`,
    \`\${stamp(9)} INFO - Marking task as SUCCESS\`,
  );
  return lines;
}

// ============= DAG CANVAS =============

/**
 * One SVG of cubic edges under the node buttons. Each edge runs from the
 * source's right edge to the target's left edge and takes the *target*
 * task's state color, so a failed task's feed-in edges stay green while
 * everything below it reads orange at a glance. Edges touching the
 * selected task render thicker.
 */
function EdgeLayer({
  run,
  selectedTaskId,
}: {
  run: DagRun;
  selectedTaskId: string | null;
}) {
  return (
    <svg
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={\`0 0 \${CANVAS_W} \${CANVAS_H}\`}
      style={styles.edgeSvg}
      aria-hidden
      focusable={false}>
      {TASKS.flatMap(task =>
        task.deps.map(dep => {
          const source = TASK_BY_ID.get(dep);
          if (source == null) {
            return null;
          }
          const x1 = nodeX(source.col) + NODE_W;
          const y1 = nodeY(source.row) + NODE_H / 2;
          const x2 = nodeX(task.col);
          const y2 = nodeY(task.row) + NODE_H / 2;
          const midX = (x1 + x2) / 2;
          const isOnSelection =
            selectedTaskId === task.id || selectedTaskId === dep;
          return (
            <path
              key={\`\${dep}->\${task.id}\`}
              d={\`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${y2}, \${x2} \${y2}\`}
              fill="none"
              stroke={STATE_META[run.tasks[task.id].state].color}
              strokeWidth={isOnSelection ? 3 : 2}
            />
          );
        }),
      )}
    </svg>
  );
}

function DagNode({
  task,
  instance,
  isSelected,
  onSelect,
}: {
  task: DagTask;
  instance: TaskInstance;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meta = STATE_META[instance.state];
  return (
    <button
      type="button"
      style={{
        ...styles.node,
        left: nodeX(task.col),
        top: nodeY(task.row),
        borderColor: meta.color,
        ...(isSelected ? styles.nodeSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={\`\${task.id}, \${meta.label}, \${formatDuration(instance.durationSec)}\`}
      onClick={() => onSelect(task.id)}>
      <span style={styles.nodeTitleRow}>
        <span
          style={{...styles.nodeSwatch, backgroundColor: meta.color}}
          aria-hidden
        />
        <span style={styles.nodeName}>
          <Text type="code" size="sm" maxLines={1}>
            {task.id}
          </Text>
        </span>
      </span>
      <Text type="supporting" color="secondary" maxLines={1}>
        {meta.label} · {formatDuration(instance.durationSec)}
      </Text>
    </button>
  );
}

// ============= RUN RAIL =============

function RunRow({
  run,
  isSelected,
  onSelect,
}: {
  run: DagRun;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const status = runStatusOf(run);
  const failedCount = TASKS.filter(task => {
    const state = run.tasks[task.id].state;
    return state === 'failed' || state === 'upstream_failed';
  }).length;
  return (
    <button
      type="button"
      style={{
        ...styles.runRow,
        ...(isSelected ? styles.runRowSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={\`Run \${run.dateLabel} \${run.timeLabel}, \${RUN_STATUS_META[status].label}\`}
      onClick={() => onSelect(run.id)}>
      <StatusDot
        variant={RUN_STATUS_META[status].dot}
        label={RUN_STATUS_META[status].label}
        isPulsing={status === 'running'}
      />
      <span style={styles.runRowBody}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={styles.truncateCell}>
              <Text type="label" maxLines={1}>
                {run.dateLabel} · {run.timeLabel}
              </Text>
            </StackItem>
            {failedCount > 0 && status === 'failed' && (
              <Badge variant="error" label={\`\${failedCount} failed\`} />
            )}
            {run.kind === 'backfill' && (
              <Badge variant="neutral" label="backfill" />
            )}
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {formatDuration(runDurationSec(run))} task time
          </Text>
        </VStack>
      </span>
    </button>
  );
}

// ============= HISTORY GRID =============

function HistoryGrid({
  runs,
  selectedRunId,
  selectedTaskId,
  onPickCell,
  onPickRun,
}: {
  /** Chronological (oldest first) — the rail is newest first. */
  runs: DagRun[];
  selectedRunId: string;
  selectedTaskId: string | null;
  onPickCell: (runId: string, taskId: string) => void;
  onPickRun: (runId: string) => void;
}) {
  return (
    <div style={styles.gridScroll}>
      <div style={styles.gridLabelCol}>
        <div style={styles.gridLabelCell} aria-hidden />
        {TASKS.map(task => (
          <div key={task.id} style={styles.gridLabelCell}>
            <Text type="code" size="sm" color="secondary" maxLines={1}>
              {task.id}
            </Text>
          </div>
        ))}
      </div>
      {runs.map(run => {
        const isSelectedRun = run.id === selectedRunId;
        return (
          <div
            key={run.id}
            style={{
              ...styles.gridRunCol,
              ...(isSelectedRun ? styles.gridRunColSelected : undefined),
            }}>
            <Tooltip
              content={\`\${run.dateLabel} · \${run.timeLabel}\${run.kind === 'backfill' ? ' · backfill' : ''}\`}>
              <button
                type="button"
                style={styles.gridHeadCell}
                aria-pressed={isSelectedRun}
                aria-label={\`Select run \${run.dateLabel} \${run.timeLabel}\`}
                onClick={() => onPickRun(run.id)}>
                <Text
                  type="supporting"
                  color={isSelectedRun ? 'primary' : 'secondary'}
                  hasTabularNumbers>
                  {run.isoDate.slice(8, 10)}
                </Text>
              </button>
            </Tooltip>
            {TASKS.map(task => {
              const instance = run.tasks[task.id];
              const meta = STATE_META[instance.state];
              const isSelectedCell =
                isSelectedRun && task.id === selectedTaskId;
              return (
                <button
                  key={task.id}
                  type="button"
                  style={styles.gridCell}
                  aria-pressed={isSelectedCell}
                  aria-label={\`\${task.id} · \${run.dateLabel} · \${meta.label}\`}
                  onClick={() => onPickCell(run.id, task.id)}>
                  <span
                    style={{
                      ...styles.gridSwatch,
                      backgroundColor: meta.color,
                      ...(isSelectedCell
                        ? styles.gridSwatchSelected
                        : undefined),
                    }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ============= TASK DETAIL =============

function TaskDetail({
  task,
  run,
  instance,
  selectedAttempt,
  onSelectAttempt,
  onRetry,
  onMarkSuccess,
}: {
  task: DagTask;
  run: DagRun;
  instance: TaskInstance;
  /** null = latest attempt. */
  selectedAttempt: number | null;
  onSelectAttempt: (n: number | null) => void;
  onRetry: () => void;
  onMarkSuccess: () => void;
}) {
  const meta = STATE_META[instance.state];
  const shownAttempt =
    instance.attempts.find(attempt => attempt.n === selectedAttempt) ??
    instance.attempts[instance.attempts.length - 1] ??
    null;
  const canRetry =
    instance.state === 'failed' ||
    instance.state === 'upstream_failed' ||
    instance.state === 'skipped';
  const canMarkSuccess =
    instance.state !== 'success' && instance.state !== 'running';

  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <span
            style={{...styles.nodeSwatch, backgroundColor: meta.color}}
            aria-hidden
          />
          <Heading level={2}>{task.id}</Heading>
        </HStack>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          <Badge variant={meta.badge} label={meta.label} />
          <Badge variant="neutral" label={task.operator} />
          <Text type="supporting" color="secondary">
            {run.dateLabel} · {run.timeLabel} run
          </Text>
        </HStack>
      </VStack>

      <HStack gap={2}>
        <Button
          label="Retry"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" />}
          isDisabled={!canRetry}
          onClick={onRetry}
        />
        <Button
          label="Mark success"
          variant="secondary"
          size="sm"
          icon={<Icon icon={CheckIcon} size="sm" />}
          isDisabled={!canMarkSuccess}
          onClick={onMarkSuccess}
        />
      </HStack>

      <Divider />

      <MetadataList columns={2} label={{position: 'top'}}>
        <MetadataListItem label="State">
          <Badge variant={meta.badge} label={meta.label} />
        </MetadataListItem>
        <MetadataListItem label="Duration">
          <Text type="body" hasTabularNumbers>
            {formatDuration(instance.durationSec)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Tries">
          <Text type="body" hasTabularNumbers>
            {instance.attempts.length}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Operator">
          <Code>{task.operator}</Code>
        </MetadataListItem>
        <MetadataListItem label="Upstream">
          <Text type="body">
            {task.deps.length === 0 ? 'none (root)' : task.deps.join(', ')}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Downstream">
          <Text type="body" hasTabularNumbers>
            {downstreamOf(task.id).length} tasks
          </Text>
        </MetadataListItem>
      </MetadataList>

      <Divider />

      <VStack gap={2}>
        <Heading level={3}>Attempts</Heading>
        {instance.attempts.length === 0 ? (
          <Text type="supporting" color="secondary">
            {instance.state === 'upstream_failed'
              ? 'Never attempted — an upstream task failed first.'
              : 'No attempts yet — waiting on the scheduler.'}
          </Text>
        ) : (
          <VStack gap={1}>
            {instance.attempts.map(attempt => {
              const isShown = shownAttempt?.n === attempt.n;
              return (
                <button
                  key={attempt.n}
                  type="button"
                  style={{
                    ...styles.attemptRow,
                    ...(isShown ? styles.attemptRowSelected : undefined),
                  }}
                  aria-pressed={isShown}
                  aria-label={\`Attempt \${attempt.n}, \${attempt.state}\`}
                  onClick={() => onSelectAttempt(attempt.n)}>
                  <StackItem size="fill">
                    <Text type="label">Attempt {attempt.n}</Text>
                  </StackItem>
                  <Badge
                    variant={STATE_META[attempt.state].badge}
                    label={attempt.state}
                  />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {formatDuration(attempt.durationSec)}
                  </Text>
                </button>
              );
            })}
          </VStack>
        )}
      </VStack>

      <VStack gap={2}>
        <Heading level={3}>Logs</Heading>
        {shownAttempt == null ? (
          <Text type="supporting" color="secondary">
            No log output for this task instance.
          </Text>
        ) : (
          <div style={styles.logBox}>
            {attemptLogs(task, run, shownAttempt).map((line, index) => (
              <p
                key={index}
                style={{
                  ...styles.logLine,
                  ...(line.includes('ERROR') ? styles.logError : undefined),
                }}>
                {line}
              </p>
            ))}
          </div>
        )}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function DagRunVisualizerPage() {
  const [runs, setRuns] = useState<DagRun[]>(buildInitialRuns);
  const [selectedRunId, setSelectedRunId] = useState('run-2026-06-29');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(
    'transform_events',
  );
  const [selectedAttempt, setSelectedAttempt] = useState<number | null>(null);
  const [railFilter, setRailFilter] = useState('all');
  const [isPaused, setIsPaused] = useState(false);
  const [isBackfillOpen, setIsBackfillOpen] = useState(false);
  const [backfillStart, setBackfillStart] =
    useState<ISODateString>('2026-06-20');
  const [backfillEnd, setBackfillEnd] = useState<ISODateString>('2026-06-22');

  // Responsive contract: <=1024px the run rail becomes a chip strip and
  // the task panel becomes a Dialog; <=640px header chrome tightens.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ----- cascade engine -----
  // Retry / mark-success push [task, ...downstream] through queued →
  // running → success one step per tick. State lives in a ref so ticks
  // stay a pure walk over fixture task order (no clocks read).
  const cascadeRef = useRef<{
    runId: string;
    pending: string[];
    phase: 'queued' | 'running';
    timer: ReturnType<typeof setInterval>;
  } | null>(null);

  const stopCascade = () => {
    if (cascadeRef.current != null) {
      clearInterval(cascadeRef.current.timer);
      cascadeRef.current = null;
    }
  };

  const patchTask = (
    runId: string,
    taskId: string,
    patch: (instance: TaskInstance) => TaskInstance,
  ) => {
    setRuns(prev =>
      prev.map(run =>
        run.id === runId
          ? {...run, tasks: {...run.tasks, [taskId]: patch(run.tasks[taskId])}}
          : run,
      ),
    );
  };

  const patchLastAttempt = (
    attempts: Attempt[],
    patch: (attempt: Attempt) => Attempt,
  ): Attempt[] =>
    attempts.map((attempt, index) =>
      index === attempts.length - 1 ? patch(attempt) : attempt,
    );

  const tickCascade = () => {
    const cascade = cascadeRef.current;
    if (cascade == null || cascade.pending.length === 0) {
      stopCascade();
      return;
    }
    const head = cascade.pending[0];
    if (cascade.phase === 'queued') {
      patchTask(cascade.runId, head, instance => ({
        ...instance,
        state: 'running',
        attempts: patchLastAttempt(instance.attempts, attempt => ({
          ...attempt,
          state: 'running',
        })),
      }));
      cascade.phase = 'running';
      return;
    }
    const duration = BASE_DURATION[head];
    patchTask(cascade.runId, head, instance => ({
      ...instance,
      state: 'success',
      durationSec: duration,
      attempts: patchLastAttempt(instance.attempts, attempt => ({
        ...attempt,
        state: 'success',
        durationSec: duration,
      })),
    }));
    cascade.pending.shift();
    cascade.phase = 'queued';
    if (cascade.pending.length === 0) {
      stopCascade();
    }
  };

  /** Set every id to queued with a fresh attempt, then start ticking. */
  const startCascade = (runId: string, taskIds: string[]) => {
    stopCascade();
    if (taskIds.length === 0) {
      return;
    }
    setRuns(prev =>
      prev.map(run => {
        if (run.id !== runId) {
          return run;
        }
        const tasks = {...run.tasks};
        for (const id of taskIds) {
          const instance = tasks[id];
          tasks[id] = {
            state: 'queued',
            durationSec: null,
            attempts: [
              ...instance.attempts,
              {
                n: instance.attempts.length + 1,
                state: 'queued',
                durationSec: null,
              },
            ],
          };
        }
        return {...run, tasks};
      }),
    );
    cascadeRef.current = {
      runId,
      pending: [...taskIds],
      phase: 'queued',
      timer: setInterval(tickCascade, 650),
    };
  };

  const retryTask = (runId: string, taskId: string) => {
    setSelectedAttempt(null);
    startCascade(runId, [taskId, ...downstreamOf(taskId)]);
  };

  const markTaskSuccess = (runId: string, taskId: string) => {
    setSelectedAttempt(null);
    patchTask(runId, taskId, instance => ({
      ...instance,
      state: 'success',
      // Marked, not executed — Airflow leaves the duration empty too.
      durationSec: instance.durationSec,
    }));
    startCascade(runId, downstreamOf(taskId));
  };

  // ----- selection -----

  const selectedRun =
    runs.find(run => run.id === selectedRunId) ?? runs[0];
  const selectedTask =
    selectedTaskId != null ? (TASK_BY_ID.get(selectedTaskId) ?? null) : null;

  const selectRun = (id: string) => {
    setSelectedRunId(id);
    setSelectedAttempt(null);
    // Selecting a run repaints the DAG; keep the task focus if any, but on
    // narrow screens do not throw the task dialog open on a run tap.
    if (isNarrow) {
      setSelectedTaskId(null);
    }
  };

  const selectTask = (id: string) => {
    setSelectedAttempt(null);
    setSelectedTaskId(prev => (prev === id && !isNarrow ? null : id));
  };

  const pickGridCell = (runId: string, taskId: string) => {
    setSelectedRunId(runId);
    setSelectedAttempt(null);
    setSelectedTaskId(taskId);
  };

  // ----- rail + counts -----

  const railRuns =
    railFilter === 'failed'
      ? runs.filter(run => runStatusOf(run) === 'failed')
      : runs;
  const successCount = runs.filter(run => runStatusOf(run) === 'success').length;
  const failedCount = runs.filter(run => runStatusOf(run) === 'failed').length;
  const activeCount = runs.filter(run => {
    const status = runStatusOf(run);
    return status === 'running' || status === 'queued';
  }).length;

  // Grid columns run oldest → newest; backfills (appended with older
  // dates) sort into place by logical date.
  const gridRuns = [...runs].sort((a, b) => a.isoDate.localeCompare(b.isoDate));

  // ----- backfill -----

  const backfillDates = (() => {
    const out: string[] = [];
    const cursor = new Date(\`\${backfillStart}T00:00:00Z\`);
    const end = new Date(\`\${backfillEnd}T00:00:00Z\`);
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) {
      return out;
    }
    while (cursor.getTime() <= end.getTime() && out.length <= 10) {
      out.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    return out;
  })();
  const backfillFresh = backfillDates.filter(
    date => !runs.some(run => run.isoDate === date),
  );
  const backfillError =
    backfillDates.length === 0
      ? 'End date must be on or after the start date.'
      : backfillDates.length > 10
        ? 'Backfills are capped at 10 runs per request.'
        : backfillFresh.length === 0
          ? 'Every date in this range already has a run.'
          : null;

  const confirmBackfill = () => {
    if (backfillError != null) {
      return;
    }
    const created: DagRun[] = backfillFresh.map(isoDate => ({
      id: \`run-\${isoDate}\`,
      isoDate,
      dateLabel: dateLabelOf(isoDate),
      timeLabel: '06:00',
      kind: 'backfill',
      tasks: Object.fromEntries(
        TASKS.map(task => [task.id, queuedInstance()]),
      ),
    }));
    setRuns(prev => [...prev, ...created]);
    setSelectedRunId(created[0].id);
    setSelectedTaskId(null);
    setSelectedAttempt(null);
    setIsBackfillOpen(false);
  };

  // ----- pieces -----

  const runRail = (
    <VStack gap={2} style={styles.contentFill}>
      <SegmentedControl
        label="Run filter"
        value={railFilter}
        onChange={setRailFilter}
        size="sm">
        <SegmentedControlItem label="All runs" value="all" />
        <SegmentedControlItem label="Failed" value="failed" />
      </SegmentedControl>
      <StackItem size="fill" style={styles.railScroll}>
        {railRuns.length === 0 ? (
          <EmptyState
            title="No failed runs"
            description="Every recent run finished green. Switch back to All runs."
            icon={<Icon icon={CheckIcon} size="lg" />}
            isCompact
          />
        ) : (
          <VStack gap={1}>
            {railRuns.map(run => (
              <RunRow
                key={run.id}
                run={run}
                isSelected={run.id === selectedRunId}
                onSelect={selectRun}
              />
            ))}
          </VStack>
        )}
      </StackItem>
    </VStack>
  );

  // <=1024px: the rail collapses to this horizontally scrolling strip.
  const runChipStrip = (
    <div style={styles.chipStrip} role="group" aria-label="Recent runs">
      {railRuns.map(run => {
        const status = runStatusOf(run);
        const isSelected = run.id === selectedRunId;
        return (
          <button
            key={run.id}
            type="button"
            style={{
              ...styles.runChip,
              ...(isSelected ? styles.runChipSelected : undefined),
            }}
            aria-pressed={isSelected}
            aria-label={\`Run \${run.dateLabel}, \${RUN_STATUS_META[status].label}\`}
            onClick={() => selectRun(run.id)}>
            <StatusDot
              variant={RUN_STATUS_META[status].dot}
              label={RUN_STATUS_META[status].label}
              isPulsing={status === 'running'}
            />
            <Text type="label" maxLines={1}>
              {run.dateLabel}
            </Text>
          </button>
        );
      })}
    </div>
  );

  const canvas = (
    <div style={styles.canvasScroll}>
      <div style={styles.canvas} role="group" aria-label="Task DAG">
        <EdgeLayer run={selectedRun} selectedTaskId={selectedTaskId} />
        {TASKS.map(task => (
          <DagNode
            key={task.id}
            task={task}
            instance={selectedRun.tasks[task.id]}
            isSelected={task.id === selectedTaskId}
            onSelect={selectTask}
          />
        ))}
      </div>
    </div>
  );

  const gridStrip = (
    <VStack gap={2} style={styles.gridStrip}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Run history</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {TASKS.length} tasks × {runs.length} runs
        </Text>
      </HStack>
      <HistoryGrid
        runs={gridRuns}
        selectedRunId={selectedRunId}
        selectedTaskId={selectedTaskId}
        onPickCell={pickGridCell}
        onPickRun={selectRun}
      />
    </VStack>
  );

  const taskDetail =
    selectedTask != null ? (
      <TaskDetail
        task={selectedTask}
        run={selectedRun}
        instance={selectedRun.tasks[selectedTask.id]}
        selectedAttempt={selectedAttempt}
        onSelectAttempt={setSelectedAttempt}
        onRetry={() => retryTask(selectedRun.id, selectedTask.id)}
        onMarkSuccess={() => markTaskSuccess(selectedRun.id, selectedTask.id)}
      />
    ) : (
      <EmptyState
        title="No task selected"
        description="Click a node in the DAG or a cell in the run history to inspect attempts and logs."
        icon={<Icon icon={MousePointerClickIcon} size="lg" />}
        isCompact
      />
    );

  // <=1024px the end panel is gone; node/cell taps open this Dialog.
  const taskDialog = isNarrow && (
    <Dialog
      isOpen={selectedTask != null}
      onOpenChange={isOpen => {
        if (!isOpen) {
          setSelectedTaskId(null);
        }
      }}
      purpose="info"
      width="min(520px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Task instance"
          subtitle={\`\${selectedRun.dateLabel} · \${selectedRun.timeLabel}\`}
          onOpenChange={isOpen => {
            if (!isOpen) {
              setSelectedTaskId(null);
            }
          }}
        />
        {taskDetail}
      </VStack>
    </Dialog>
  );

  const backfillDialog = (
    <Dialog
      isOpen={isBackfillOpen}
      onOpenChange={setIsBackfillOpen}
      purpose="info"
      width="min(440px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Backfill daily_revenue_rollup"
          subtitle="One synthetic queued run per day at 06:00 UTC"
          onOpenChange={setIsBackfillOpen}
        />
        <DateInput
          label="Start date"
          value={backfillStart}
          onChange={value => setBackfillStart(prev => value ?? prev)}
        />
        <DateInput
          label="End date"
          value={backfillEnd}
          onChange={value => setBackfillEnd(prev => value ?? prev)}
        />
        {backfillError != null ? (
          <FieldStatus type="error" variant="detached" message={backfillError} />
        ) : (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Will append {backfillFresh.length}{' '}
            {backfillFresh.length === 1 ? 'run' : 'runs'} to the rail and
            history grid.
          </Text>
        )}
        <HStack gap={2}>
          <Button
            label={\`Create \${backfillFresh.length} \${backfillFresh.length === 1 ? 'run' : 'runs'}\`}
            variant="primary"
            size="sm"
            isDisabled={backfillError != null}
            onClick={confirmBackfill}
          />
          <Button
            label="Cancel"
            variant="secondary"
            size="sm"
            onClick={() => setIsBackfillOpen(false)}
          />
        </HStack>
      </VStack>
    </Dialog>
  );

  return (
    <>
      {taskDialog}
      {backfillDialog}
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill" style={styles.truncateCell}>
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={WorkflowIcon} size="sm" color="secondary" />
                    <Heading level={1}>daily_revenue_rollup</Heading>
                    {isPaused && <Badge variant="warning" label="paused" />}
                    {/* <=640px: the cron chip cedes width to the controls. */}
                    {!isCompact && <Code>0 6 * * *</Code>}
                  </HStack>
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      {runs.length} runs ·{' '}
                      <span style={styles.countSuccess}>
                        {successCount} success
                      </span>{' '}
                      ·{' '}
                      <span style={styles.countFailed}>
                        {failedCount} failed
                      </span>
                      {activeCount > 0 && (
                        <>
                          {' '}
                          ·{' '}
                          <span style={styles.countRunning}>
                            {activeCount} active
                          </span>
                        </>
                      )}
                    </Text>
                  )}
                </VStack>
              </StackItem>
              <Switch
                label="Paused"
                value={isPaused}
                onChange={setIsPaused}
              />
              <Button
                label="Backfill"
                variant="secondary"
                size="sm"
                icon={<Icon icon={CalendarPlusIcon} size="sm" />}
                isDisabled={isPaused}
                onClick={() => setIsBackfillOpen(true)}
                style={styles.backfillButton}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          isNarrow ? undefined : (
            <LayoutPanel width={264} label="Recent runs">
              {runRail}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0} label="Run detail">
            <VStack gap={0} style={styles.contentFill}>
              {isNarrow && (
                <>
                  {runChipStrip}
                  <Divider />
                </>
              )}
              {canvas}
              <Divider />
              {gridStrip}
            </VStack>
          </LayoutContent>
        }
        end={
          !isNarrow && selectedTask != null ? (
            <LayoutPanel width={340} label="Task instance" style={styles.panelScroll}>
              {taskDetail}
            </LayoutPanel>
          ) : undefined
        }
      />
    </>
  );
}
`;export{e as default};