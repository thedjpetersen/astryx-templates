var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one fixed planning day — Thursday,
 *   June 18, 2026, with a fixed "now" of 1:15 PM for the now-line; four life
 *   areas mapped to categorical color tokens; sixteen tasks with fixed
 *   effort estimates in 15-minute increments — six pre-placed on the
 *   timeline as time blocks, two of them seeded done, one pair seeded into a
 *   deliberate 3:15–3:30 PM overlap conflict — and the other ten waiting in
 *   a ranked backlog rail; no clocks, randomness, or network assets)
 * @output Time-block DAY PLANNER surface: a header (Day planner Heading +
 *   fixed date, an SVG completion ring advancing as blocks are checked off,
 *   and a planned-hours readout), a left backlog rail of tasks with effort
 *   estimate Tokens and schedule actions, a center single-day vertical
 *   timeline (6 AM – 10 PM, 56px/hour) of area-colored blocks crossed by a
 *   red now-line — blocks carry a done CheckboxInput that strikes the title
 *   and advances the ring, a MoreMenu with 15-minute move/resize nudges and
 *   send-to-backlog, and an Overlap Badge when two blocks collide — and a
 *   right daily-shutdown panel with derived stats (planned vs open hours
 *   split bar, focus time by life area as CSS bars, conflict list with
 *   one-click nudge fixes) plus a three-line journal TextArea with a
 *   Saved/Unsaved indicator. Scheduling a backlog task (drag on fine
 *   pointers, or its ~40px schedule button anywhere) converts it into a
 *   block sized by its estimate at the next free 15-minute slot after the
 *   fixture now; dragging a block back onto the rail (or "Send to backlog")
 *   un-schedules it with an undo Toast. Every mutation recomputes the
 *   planned/open split, per-area focus bars, conflict set, and completion
 *   ring in one pass
 * @position Page template; emitted by \`astryx template day-planner-timeblock\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the planner chrome
 * (title + fixed date, completion ring, planned-hours readout, and — on
 * phones — the three-way pane switcher). The \`start\` slot docks a 280px
 * backlog LayoutPanel (rail header pinned, task list scrolls, and the whole
 * rail is a drop target that un-schedules blocks). LayoutContent (padding 0)
 * scrolls the hour-ruled timeline; the \`end\` slot docks a 320px daily
 * shutdown LayoutPanel. Choose this over the week agenda when the surface
 * is one editable day of movable, resizable, checkable time blocks fed by a
 * task backlog rather than a read-mostly multi-day calendar.
 *
 * Interaction contract:
 * - Task→placement assignment lives in useState: a task is either in the
 *   backlog rail or placed on the timeline with a start and duration, so
 *   scheduling, moving, resizing, and un-scheduling all re-render the rail,
 *   the timeline, and every derived stat together.
 * - Menu path (always available, keyboard + touch accessible): each block's
 *   MoreMenu moves it 15 minutes earlier/later, extends/shortens it by 15
 *   minutes (snapped and clamped to the 6 AM – 10 PM window, 15-minute
 *   minimum), resolves an overlap by nudging to the suggested slot, and
 *   sends it back to the backlog. Backlog rows carry a schedule IconButton.
 * - Pointer path: native HTML5 drag-and-drop on hover-capable fine pointers
 *   only — backlog tasks drag onto the timeline (drop y snaps to the
 *   nearest 15 minutes), blocks drag to a new start time, and blocks drag
 *   onto the backlog rail to un-schedule.
 * - The seeded 3:15 PM errand overlaps the 2:00–3:30 deep-work block: both
 *   blocks wear an Overlap Badge, and the one-click nudge (in the shutdown
 *   panel's conflict list and the block's MoreMenu) moves the later block
 *   to start exactly when the earlier one ends.
 * - Checking a block's CheckboxInput strikes its title, dims it, and
 *   advances the header completion ring; un-scheduling a done block also
 *   clears its done state.
 * - Un-scheduling is the only remove-shaped action and it is undoable: the
 *   Toast's Undo button restores the exact placement and done state.
 * - Journal text persists in page state (so it survives pane switches on
 *   phones); the Save button flips the Unsaved Badge to Saved, and any
 *   further edit flips it back.
 * - Every mutation is announced through a visually-hidden aria-live region
 *   ("Scheduled Write weekly review at 1:30 PM — 7 hr 30 min planned", …).
 *
 * Responsive contract:
 * - >1024px: header | backlog rail 280 (docked, list scrolls) | timeline
 *   (56px gutter + one flexible day column, scrolls internally) | shutdown
 *   panel 320 (docked, scrolls vertically).
 * - 641–1024px: the shutdown panel undocks and renders as a Card stacked
 *   under the timeline inside the content scroller, so stats and journal
 *   stay reachable without squeezing the timeline into a sliver; the
 *   backlog rail stays docked.
 * - <=640px (usable at 375px): single-pane fallback — both panels undock
 *   and a three-way ToggleButton switcher (Backlog / Plan / Shutdown) in
 *   the header swaps the content region between the backlog list, the
 *   timeline, and the shutdown panel, so whichever surface is showing
 *   always fills the width. Switcher buttons, schedule actions, and block
 *   menus upsize to ~40px tap targets.
 * - Drag-and-drop is enabled only for fine pointers with hover
 *   ("(hover: hover) and (pointer: fine)") so draggable rows never fight
 *   touch scrolling; touch users schedule via each row's schedule button
 *   and move/resize/un-schedule via each block's MoreMenu, which upsizes
 *   from "sm" to "lg" when drag is unavailable. No interaction is
 *   hover-only.
 * - The timeline is a single flexible column (gutter + minmax(0, 1fr)) and
 *   block text clips with ellipsis, so 375px viewports never scroll
 *   sideways; header rows are wrap="wrap" so the ring and readout drop
 *   below the title instead of clipping.
 *
 * Container policy (day-planner archetype): the page chrome is frame-first
 * rows and panels; the timeline is a bespoke CSS grid with absolutely
 * positioned block divs because no core component models an hour ruler
 * with movable blocks; blocks host real controls (CheckboxInput, MoreMenu)
 * so they are divs, never buttons-with-buttons. Cards are reserved for the
 * undocked shutdown summary on medium viewports. Fixtures are fixed
 * minutes-past-midnight — no Date construction at all; the now-line sits
 * at the fixed fixture minute.
 */

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {TextArea} from '@astryxdesign/core/TextArea';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CalendarClockIcon,
  ListTodoIcon,
  MoonStarIcon,
  NotebookPenIcon,
  PlusIcon,
  SaveIcon,
  TriangleAlertIcon,
  Undo2Icon,
  WandSparklesIcon,
} from 'lucide-react';

// ============= GRID CONSTANTS =============

/** Width of the hour-label gutter on the left of the timeline. */
const GUTTER_WIDTH = 56;
/** Vertical pixels per hour; a 15-minute block is 14px tall. */
const HOUR_HEIGHT = 56;
/** The visible day window: 6:00 AM … 10:00 PM. */
const DAY_START_MIN = 6 * 60;
const DAY_END_MIN = 22 * 60;
/** Total plannable minutes in the window (16 hours). */
const WINDOW_MIN = DAY_END_MIN - DAY_START_MIN;
const GRID_HEIGHT = (WINDOW_MIN / 60) * HOUR_HEIGHT;
/** All moves, resizes, and drops snap to this increment. */
const SNAP_MIN = 15;
/** Shortest allowed block after shrinking. */
const MIN_BLOCK_MIN = 15;

// Fixed fixture "now": 1:15 PM — the now-line position and the earliest
// point the scheduler searches for a free slot. Never a clock read.
const NOW_MIN = 13 * 60 + 15;

const PLAN_DATE_LABEL = 'Thursday, June 18, 2026';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // The timeline: gutter column of hour labels + one flexible day column.
  timeline: {
    display: 'grid',
    gridTemplateColumns: \`\${GUTTER_WIDTH}px minmax(0, 1fr)\`,
    padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-6) 0',
  },
  hourGutter: {
    position: 'relative',
    height: GRID_HEIGHT,
  },
  hourLabel: {
    position: 'absolute',
    right: 8,
    transform: 'translateY(-50%)',
    fontSize: 11,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // Hour rules are painted with a repeating gradient so no extra DOM rows
  // are needed; quarter-hour snapping is invisible chrome, not lines.
  dayColumn: {
    position: 'relative',
    height: GRID_HEIGHT,
    minWidth: 0,
    borderLeft: '1px solid var(--color-border)',
    borderTop: '1px solid var(--color-border)',
    backgroundImage:
      'repeating-linear-gradient(to bottom, var(--color-border) 0, ' +
      \`var(--color-border) 1px, transparent 1px, transparent \${HOUR_HEIGHT}px)\`,
  },
  dayColumnDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Positioned block shells: muted surface with a thick area-colored spine;
  // real controls (checkbox, menu) live inside, so the shell is a div.
  block: {
    position: 'absolute',
    left: 6,
    right: 6,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-1)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    borderRadius: 6,
    borderLeft: '4px solid transparent',
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    padding: '2px 4px 2px 6px',
  },
  blockDone: {
    opacity: 0.55,
  },
  blockConflict: {
    boxShadow:
      'inset 0 0 0 2px var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  blockDragging: {
    opacity: 0.5,
  },
  blockBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  blockTitle: {
    display: 'block',
    fontSize: 12,
    lineHeight: '16px',
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  blockTitleDone: {
    textDecoration: 'line-through',
  },
  blockTime: {
    display: 'block',
    fontSize: 11,
    lineHeight: '14px',
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Fixed-fixture now-line: a red rule across the day column with a time
  // chip pinned into the gutter.
  nowRule: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor:
      'var(--color-data-categorical-red, light-dark(#E5484D, #FF6369))',
    opacity: 0.9,
    pointerEvents: 'none',
    zIndex: 3,
  },
  nowDot: {
    position: 'absolute',
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: '50%',
    backgroundColor:
      'var(--color-data-categorical-red, light-dark(#E5484D, #FF6369))',
  },
  // Backlog rail: pinned header, independently scrolling task list; the
  // whole pane doubles as the un-schedule drop target.
  backlogPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  backlogPaneDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  backlogHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
    borderBottom: '1px solid var(--color-divider)',
  },
  backlogList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  backlogRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid var(--color-divider)',
  },
  backlogEmpty: {
    padding: 'var(--spacing-6) var(--spacing-3)',
  },
  // Area swatch dots in backlog rows and the focus-by-area stat rows.
  areaDot: {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  // Shutdown panel stats: a two-segment planned/open split bar and
  // per-area focus bars — plain CSS divs, no charting machinery.
  splitBar: {
    display: 'flex',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  splitBarPlanned: {
    backgroundColor: 'var(--color-accent)',
  },
  areaBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  areaBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // 641–1024px: the shutdown panel undocks into this stacked section
  // under the timeline.
  undockedShutdown: {
    padding: '0 var(--spacing-4) var(--spacing-6)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

type AreaId = 'deep-work' | 'health' | 'errands' | 'personal';
type TokenColor = 'blue' | 'green' | 'orange' | 'purple';

interface LifeArea {
  id: AreaId;
  label: string;
  /** Block spine / swatch / focus-bar color — categorical token. */
  color: string;
  /** Matching Token color for rail rows. */
  token: TokenColor;
}

const AREAS: readonly LifeArea[] = [
  {
    id: 'deep-work',
    label: 'Deep work',
    color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #409CFF))',
    token: 'blue',
  },
  {
    id: 'health',
    label: 'Health',
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    token: 'green',
  },
  {
    id: 'errands',
    label: 'Errands',
    color:
      'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    token: 'orange',
  },
  {
    id: 'personal',
    label: 'Personal',
    color:
      'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    token: 'purple',
  },
];

const AREA_BY_ID = new Map(AREAS.map(area => [area.id, area]));

interface PlannerTask {
  id: string;
  title: string;
  areaId: AreaId;
  /** Effort estimate in minutes; always a multiple of 15. */
  estimateMin: number;
}

interface Placement {
  startMin: number;
  durationMin: number;
}

// Sixteen tasks: the first six are seeded onto the timeline (see
// INITIAL_PLACEMENTS), the other ten wait in the backlog rail in this
// order. Estimates are the block duration when a task is scheduled.
const TASKS: readonly PlannerTask[] = [
  // ---- seeded onto the timeline ----
  {
    id: 't-proposal',
    title: 'Deep work — Q3 proposal draft',
    areaId: 'deep-work',
    estimateMin: 120,
  },
  {
    id: 't-admin',
    title: 'Admin sweep — email + calendar',
    areaId: 'errands',
    estimateMin: 45,
  },
  {
    id: 't-gym',
    title: 'Gym — pull day',
    areaId: 'health',
    estimateMin: 60,
  },
  {
    id: 't-review',
    title: 'Deep work — review backlog',
    areaId: 'deep-work',
    estimateMin: 90,
  },
  {
    id: 't-errands',
    title: 'Pharmacy + grocery run',
    areaId: 'errands',
    estimateMin: 45,
  },
  {
    id: 't-dinner',
    title: 'Dinner with Sam',
    areaId: 'personal',
    estimateMin: 60,
  },
  // ---- backlog rail (10 tasks) ----
  {
    id: 't-weekly',
    title: 'Write weekly review',
    areaId: 'deep-work',
    estimateMin: 30,
  },
  {
    id: 't-slides',
    title: 'Prep slides for Friday demo',
    areaId: 'deep-work',
    estimateMin: 60,
  },
  {
    id: 't-dentist',
    title: 'Call the dentist',
    areaId: 'errands',
    estimateMin: 15,
  },
  {
    id: 't-meal',
    title: 'Meal prep for the week',
    areaId: 'health',
    estimateMin: 45,
  },
  {
    id: 't-prs',
    title: 'Review open pull requests',
    areaId: 'deep-work',
    estimateMin: 45,
  },
  {
    id: 't-taxes',
    title: 'Pay quarterly estimated taxes',
    areaId: 'errands',
    estimateMin: 30,
  },
  {
    id: 't-stretch',
    title: 'Stretch + mobility routine',
    areaId: 'health',
    estimateMin: 15,
  },
  {
    id: 't-paper',
    title: 'Read distributed-systems paper',
    areaId: 'deep-work',
    estimateMin: 90,
  },
  {
    id: 't-trip',
    title: 'Plan the weekend trip',
    areaId: 'personal',
    estimateMin: 30,
  },
  {
    id: 't-inbox',
    title: 'Inbox zero pass',
    areaId: 'errands',
    estimateMin: 45,
  },
];

const TASK_BY_ID = new Map(TASKS.map(task => [task.id, task]));

// Six pre-placed blocks. t-errands starts at 3:15 PM while t-review runs
// until 3:30 PM — the seeded overlap conflict the nudge action resolves.
const INITIAL_PLACEMENTS: Readonly<Record<string, Placement>> = {
  't-proposal': {startMin: 7 * 60, durationMin: 120}, // 7:00 – 9:00 AM
  't-admin': {startMin: 9 * 60, durationMin: 45}, // 9:00 – 9:45 AM
  't-gym': {startMin: 12 * 60, durationMin: 60}, // 12:00 – 1:00 PM
  't-review': {startMin: 14 * 60, durationMin: 90}, // 2:00 – 3:30 PM
  't-errands': {startMin: 15 * 60 + 15, durationMin: 45}, // 3:15 – 4:00 PM ⚠
  't-dinner': {startMin: 18 * 60 + 30, durationMin: 60}, // 6:30 – 7:30 PM
};

/** The morning blocks are already done when the day loads. */
const INITIAL_DONE: readonly string[] = ['t-proposal', 't-admin'];

// ============= TIME HELPERS =============
// Pure minute math over the fixed fixtures — no Date anywhere.

/** "795" → "1:15 PM"; drops ":00" so hour lines read "1 PM". */
function formatMin(min: number): string {
  const hour24 = Math.floor(min / 60);
  const minute = min % 60;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return minute === 0
    ? \`\${hour12} \${period}\`
    : \`\${hour12}:\${String(minute).padStart(2, '0')} \${period}\`;
}

function formatRange(startMin: number, durationMin: number): string {
  return \`\${formatMin(startMin)} – \${formatMin(startMin + durationMin)}\`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return \`\${rest} min\`;
  }
  if (rest === 0) {
    return hours === 1 ? '1 hr' : \`\${hours} hr\`;
  }
  return \`\${hours} hr \${rest} min\`;
}

function snapMin(min: number): number {
  return Math.round(min / SNAP_MIN) * SNAP_MIN;
}

function clampStart(startMin: number, durationMin: number): number {
  return Math.min(
    Math.max(startMin, DAY_START_MIN),
    DAY_END_MIN - durationMin,
  );
}

const HOUR_MARKS: readonly number[] = (() => {
  const marks: number[] = [];
  for (let min = DAY_START_MIN; min <= DAY_END_MIN; min += 60) {
    marks.push(min);
  }
  return marks;
})();

// ============= DERIVED HELPERS =============

interface ScheduledBlock {
  task: PlannerTask;
  placement: Placement;
}

interface Conflict {
  /** The later-starting block that should move. */
  taskId: string;
  /** The block it collides with. */
  withTaskId: string;
  /** One-click nudge target: the earlier block's end, clamped to fit. */
  suggestedStart: number;
}

/**
 * Walks blocks in start order and flags any block that begins before the
 * previous block ends. The suggestion moves the later block to start
 * exactly when the earlier one ends (clamped so it still fits the day).
 */
function findConflicts(blocks: readonly ScheduledBlock[]): Conflict[] {
  const sorted = [...blocks].sort(
    (a, b) => a.placement.startMin - b.placement.startMin,
  );
  const conflicts: Conflict[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const cur = sorted[i];
    const prevEnd = prev.placement.startMin + prev.placement.durationMin;
    if (cur.placement.startMin < prevEnd) {
      conflicts.push({
        taskId: cur.task.id,
        withTaskId: prev.task.id,
        suggestedStart: clampStart(prevEnd, cur.placement.durationMin),
      });
    }
  }
  return conflicts;
}

/**
 * Finds the first free SNAP_MIN-aligned slot that fits \`durationMin\`
 * without overlapping any placed block — searching forward from the
 * fixture "now" first (planning the rest of today), then from 6 AM.
 */
function findFreeSlot(
  placements: Readonly<Record<string, Placement>>,
  durationMin: number,
): number | null {
  const placed = Object.values(placements).sort(
    (a, b) => a.startMin - b.startMin,
  );
  const fits = (start: number) =>
    start >= DAY_START_MIN &&
    start + durationMin <= DAY_END_MIN &&
    placed.every(
      p =>
        start + durationMin <= p.startMin ||
        start >= p.startMin + p.durationMin,
    );
  const fromNow = Math.ceil(NOW_MIN / SNAP_MIN) * SNAP_MIN;
  for (let start = fromNow; start + durationMin <= DAY_END_MIN; start += SNAP_MIN) {
    if (fits(start)) {
      return start;
    }
  }
  for (let start = DAY_START_MIN; start < fromNow; start += SNAP_MIN) {
    if (fits(start)) {
      return start;
    }
  }
  return null;
}

// ============= COMPLETION RING =============

/**
 * SVG completion ring in the header: fills as scheduled blocks are checked
 * off, with the fraction restated as text so the state is never
 * color-only.
 */
function CompletionRing({done, total}: {done: number; total: number}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const fraction = total === 0 ? 0 : done / total;
  return (
    <HStack gap={2} vAlign="center">
      <svg
        width={36}
        height={36}
        viewBox="0 0 36 36"
        role="img"
        aria-label={\`\${done} of \${total} blocks done\`}>
        <circle
          cx={18}
          cy={18}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={4}
        />
        <circle
          cx={18}
          cy={18}
          r={radius}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={\`\${circumference * fraction} \${circumference}\`}
          transform="rotate(-90 18 18)"
        />
      </svg>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {done}/{total} done
      </Text>
    </HStack>
  );
}

// ============= TIMELINE =============

interface DragPayload {
  kind: 'task' | 'block';
  taskId: string;
}

function TimeBlock({
  block,
  isDone,
  conflict,
  isDraggable,
  isDragging,
  onToggleDone,
  onNudge,
  onNudgeResolve,
  onResize,
  onUnschedule,
  onDraggingChange,
}: {
  block: ScheduledBlock;
  isDone: boolean;
  conflict: Conflict | undefined;
  isDraggable: boolean;
  isDragging: boolean;
  onToggleDone: (taskId: string, done: boolean) => void;
  onNudge: (taskId: string, deltaMin: number) => void;
  onNudgeResolve: (conflict: Conflict) => void;
  onResize: (taskId: string, deltaMin: number) => void;
  onUnschedule: (taskId: string) => void;
  onDraggingChange: (payload: DragPayload | null) => void;
}) {
  const {task, placement} = block;
  const area = AREA_BY_ID.get(task.areaId);
  const top =
    ((placement.startMin - DAY_START_MIN) / 60) * HOUR_HEIGHT + 1;
  const height = Math.max(
    (placement.durationMin / 60) * HOUR_HEIGHT - 2,
    24,
  );
  const showTime = height >= 48;
  const showConflictBadge = conflict !== undefined && height >= 66;
  const rangeLabel = formatRange(placement.startMin, placement.durationMin);

  return (
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', \`block:\${task.id}\`);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange({kind: 'block', taskId: task.id});
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={{
        ...styles.block,
        top,
        height,
        borderLeftColor: area?.color,
        ...(isDone ? styles.blockDone : undefined),
        ...(conflict ? styles.blockConflict : undefined),
        ...(isDragging ? styles.blockDragging : undefined),
      }}>
      <CheckboxInput
        label={
          isDone
            ? \`Reopen block: \${task.title}\`
            : \`Mark block done: \${task.title}\`
        }
        isLabelHidden
        size="sm"
        value={isDone}
        onChange={checked => onToggleDone(task.id, checked)}
      />
      <div style={styles.blockBody}>
        <span
          style={{
            ...styles.blockTitle,
            ...(isDone ? styles.blockTitleDone : undefined),
          }}>
          {task.title}
        </span>
        {showTime ? (
          <span style={styles.blockTime}>
            {rangeLabel} · {area?.label}
          </span>
        ) : null}
        {showConflictBadge && conflict ? (
          <HStack gap={1} vAlign="center">
            <Badge
              variant="warning"
              label="Overlap"
              icon={
                <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
              }
            />
          </HStack>
        ) : null}
      </div>
      {conflict && !showConflictBadge ? (
        <span
          role="img"
          aria-label={\`Overlaps \${TASK_BY_ID.get(conflict.withTaskId)?.title ?? 'another block'}\`}>
          <Icon icon={TriangleAlertIcon} size="sm" color="orange" />
        </span>
      ) : null}
      {/* On touch devices this menu is the only way to move or resize a
          block (drag is fine-pointer-only), so it upsizes for a usable
          tap target. */}
      <MoreMenu
        label={\`Actions for \${task.title}, \${rangeLabel}\`}
        size={isDraggable ? 'sm' : 'lg'}
        items={[
          {
            label: 'Move earlier 15 min',
            onClick: () => onNudge(task.id, -SNAP_MIN),
          },
          {
            label: 'Move later 15 min',
            onClick: () => onNudge(task.id, SNAP_MIN),
          },
          {
            label: 'Extend 15 min',
            onClick: () => onResize(task.id, SNAP_MIN),
          },
          {
            label: 'Shorten 15 min',
            onClick: () => onResize(task.id, -SNAP_MIN),
          },
          ...(conflict
            ? [
                {
                  label: \`Resolve overlap — move to \${formatMin(
                    conflict.suggestedStart,
                  )}\`,
                  onClick: () => onNudgeResolve(conflict),
                },
              ]
            : []),
          {
            label: 'Send to backlog',
            onClick: () => onUnschedule(task.id),
          },
        ]}
      />
    </div>
  );
}

function DayTimeline({
  blocks,
  doneIds,
  conflictsByTaskId,
  isDraggable,
  dragging,
  onToggleDone,
  onNudge,
  onNudgeResolve,
  onResize,
  onUnschedule,
  onDraggingChange,
  onDropAt,
}: {
  blocks: readonly ScheduledBlock[];
  doneIds: ReadonlySet<string>;
  conflictsByTaskId: ReadonlyMap<string, Conflict>;
  isDraggable: boolean;
  dragging: DragPayload | null;
  onToggleDone: (taskId: string, done: boolean) => void;
  onNudge: (taskId: string, deltaMin: number) => void;
  onNudgeResolve: (conflict: Conflict) => void;
  onResize: (taskId: string, deltaMin: number) => void;
  onUnschedule: (taskId: string) => void;
  onDraggingChange: (payload: DragPayload | null) => void;
  onDropAt: (payload: DragPayload, startMin: number) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const nowTop = ((NOW_MIN - DAY_START_MIN) / 60) * HOUR_HEIGHT;

  return (
    <div style={styles.timeline}>
      <div style={styles.hourGutter} aria-hidden="true">
        {HOUR_MARKS.map(min => (
          <span
            key={min}
            style={{
              ...styles.hourLabel,
              top: ((min - DAY_START_MIN) / 60) * HOUR_HEIGHT,
            }}>
            {formatMin(min)}
          </span>
        ))}
      </div>
      <div
        onDragOver={event => {
          if (!dragging) {
            return;
          }
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
          setIsDropTarget(true);
        }}
        onDragLeave={event => {
          // Ignore leave events fired when the drag moves over children.
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setIsDropTarget(false);
          }
        }}
        onDrop={event => {
          event.preventDefault();
          setIsDropTarget(false);
          if (!dragging) {
            return;
          }
          const rect = event.currentTarget.getBoundingClientRect();
          const offsetY = event.clientY - rect.top;
          const rawMin = DAY_START_MIN + (offsetY / HOUR_HEIGHT) * 60;
          onDropAt(dragging, snapMin(rawMin));
        }}
        style={{
          ...styles.dayColumn,
          ...(isDropTarget ? styles.dayColumnDropTarget : undefined),
        }}>
        {blocks.map(block => (
          <TimeBlock
            key={block.task.id}
            block={block}
            isDone={doneIds.has(block.task.id)}
            conflict={conflictsByTaskId.get(block.task.id)}
            isDraggable={isDraggable}
            isDragging={
              dragging?.kind === 'block' && dragging.taskId === block.task.id
            }
            onToggleDone={onToggleDone}
            onNudge={onNudge}
            onNudgeResolve={onNudgeResolve}
            onResize={onResize}
            onUnschedule={onUnschedule}
            onDraggingChange={onDraggingChange}
          />
        ))}
        <div style={{...styles.nowRule, top: nowTop}} aria-hidden="true">
          <span style={styles.nowDot} />
        </div>
      </div>
    </div>
  );
}

// ============= BACKLOG RAIL =============

function BacklogRow({
  task,
  isDraggable,
  hasLargeAction,
  onSchedule,
  onDraggingChange,
}: {
  task: PlannerTask;
  isDraggable: boolean;
  /** Touch surfaces upsize the schedule action to a ~40px tap target. */
  hasLargeAction: boolean;
  onSchedule: (taskId: string) => void;
  onDraggingChange: (payload: DragPayload | null) => void;
}) {
  const area = AREA_BY_ID.get(task.areaId);
  return (
    <div
      draggable={isDraggable || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', \`task:\${task.id}\`);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange({kind: 'task', taskId: task.id});
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={styles.backlogRow}>
      <HStack gap={2} vAlign="start">
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <span
                style={{...styles.areaDot, backgroundColor: area?.color}}
                aria-hidden="true"
              />
              <Text type="body" maxLines={2}>
                {task.title}
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center" wrap="wrap">
              {area ? (
                <Token label={area.label} color={area.token} size="sm" />
              ) : null}
              <Token
                label={formatDuration(task.estimateMin)}
                color="gray"
                size="sm"
              />
            </HStack>
          </VStack>
        </StackItem>
        <IconButton
          label={\`Schedule \${task.title} (\${formatDuration(task.estimateMin)})\`}
          tooltip="Schedule at next free slot"
          icon={<Icon icon={PlusIcon} size="sm" />}
          variant="secondary"
          size={hasLargeAction ? 'lg' : 'sm'}
          onClick={() => onSchedule(task.id)}
        />
      </HStack>
    </div>
  );
}

function BacklogPane({
  tasks,
  isDraggable,
  hasLargeAction,
  dragging,
  onSchedule,
  onUnschedule,
  onDraggingChange,
}: {
  tasks: readonly PlannerTask[];
  isDraggable: boolean;
  hasLargeAction: boolean;
  dragging: DragPayload | null;
  onSchedule: (taskId: string) => void;
  onUnschedule: (taskId: string) => void;
  onDraggingChange: (payload: DragPayload | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const totalEstimate = tasks.reduce((sum, task) => sum + task.estimateMin, 0);
  const acceptsDrop = dragging?.kind === 'block';

  return (
    <div
      onDragOver={event => {
        if (!acceptsDrop) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsDropTarget(true);
      }}
      onDragLeave={event => {
        if (
          !event.currentTarget.contains(event.relatedTarget as Node | null)
        ) {
          setIsDropTarget(false);
        }
      }}
      onDrop={event => {
        event.preventDefault();
        setIsDropTarget(false);
        if (dragging?.kind === 'block') {
          onUnschedule(dragging.taskId);
        }
      }}
      style={{
        ...styles.backlogPane,
        ...(isDropTarget ? styles.backlogPaneDropTarget : undefined),
      }}>
      <div style={styles.backlogHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Backlog</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {tasks.length} tasks · {formatDuration(totalEstimate)}
          </Text>
        </HStack>
      </div>
      <div style={styles.backlogList}>
        {tasks.length === 0 ? (
          <div style={styles.backlogEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={ListTodoIcon} size="lg" />}
              title="Backlog is clear"
              description="Every task is placed on the timeline. Drag a block here (or use its menu) to un-schedule it."
            />
          </div>
        ) : (
          tasks.map(task => (
            <BacklogRow
              key={task.id}
              task={task}
              isDraggable={isDraggable}
              hasLargeAction={hasLargeAction}
              onSchedule={onSchedule}
              onDraggingChange={onDraggingChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ============= SHUTDOWN PANEL =============

function ShutdownPanel({
  blocks,
  doneIds,
  conflicts,
  journalText,
  savedJournalText,
  onJournalChange,
  onJournalSave,
  onNudgeResolve,
}: {
  blocks: readonly ScheduledBlock[];
  doneIds: ReadonlySet<string>;
  conflicts: readonly Conflict[];
  journalText: string;
  savedJournalText: string;
  onJournalChange: (next: string) => void;
  onJournalSave: () => void;
  onNudgeResolve: (conflict: Conflict) => void;
}) {
  const plannedMin = blocks.reduce(
    (sum, block) => sum + block.placement.durationMin,
    0,
  );
  const openMin = Math.max(WINDOW_MIN - plannedMin, 0);
  const plannedPct = Math.min((plannedMin / WINDOW_MIN) * 100, 100);

  const areaMinutes = AREAS.map(area => ({
    area,
    minutes: blocks
      .filter(block => block.task.areaId === area.id)
      .reduce((sum, block) => sum + block.placement.durationMin, 0),
  }));
  const maxAreaMin = Math.max(
    ...areaMinutes.map(entry => entry.minutes),
    1,
  );

  const doneCount = blocks.filter(block => doneIds.has(block.task.id)).length;
  const isJournalSaved = journalText === savedJournalText;

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <Icon icon={MoonStarIcon} size="md" color="secondary" />
        <Heading level={2}>Daily shutdown</Heading>
      </HStack>

      {/* Planned vs open hours: split bar + labeled readouts. */}
      <VStack gap={2}>
        <Text type="label" color="secondary">
          Planned vs open
        </Text>
        <div
          style={styles.splitBar}
          role="img"
          aria-label={\`\${formatDuration(plannedMin)} planned, \${formatDuration(
            openMin,
          )} open of a 16 hour day\`}>
          <div style={{...styles.splitBarPlanned, width: \`\${plannedPct}%\`}} />
        </div>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Text type="supporting" hasTabularNumbers>
            {formatDuration(plannedMin)} planned
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatDuration(openMin)} open
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {doneCount}/{blocks.length} done
          </Text>
        </HStack>
      </VStack>

      <Divider />

      {/* Focus time by life area: per-area CSS bars scaled to the largest
          area, restated as durations so the stat is never color-only. */}
      <VStack gap={2}>
        <Text type="label" color="secondary">
          Focus time by area
        </Text>
        {areaMinutes.map(({area, minutes}) => (
          <VStack key={area.id} gap={1}>
            <HStack gap={2} vAlign="center">
              <span
                style={{...styles.areaDot, backgroundColor: area.color}}
                aria-hidden="true"
              />
              <StackItem size="fill">
                <Text type="supporting">{area.label}</Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {minutes === 0 ? '—' : formatDuration(minutes)}
              </Text>
            </HStack>
            <div style={styles.areaBarTrack} aria-hidden="true">
              <div
                style={{
                  ...styles.areaBarFill,
                  backgroundColor: area.color,
                  width: \`\${(minutes / maxAreaMin) * 100}%\`,
                }}
              />
            </div>
          </VStack>
        ))}
      </VStack>

      <Divider />

      {/* Conflicts: each row carries the one-click nudge fix. */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="label" color="secondary">
            Conflicts
          </Text>
          {conflicts.length > 0 ? (
            <Badge
              variant="warning"
              label={\`\${conflicts.length}\`}
              icon={<Icon icon={TriangleAlertIcon} size="sm" color="inherit" />}
            />
          ) : null}
        </HStack>
        {conflicts.length === 0 ? (
          <Text type="supporting" color="secondary">
            No overlapping blocks — the timeline is clean.
          </Text>
        ) : (
          conflicts.map(conflict => {
            const task = TASK_BY_ID.get(conflict.taskId);
            const other = TASK_BY_ID.get(conflict.withTaskId);
            if (!task || !other) {
              return null;
            }
            return (
              <VStack key={conflict.taskId} gap={1}>
                <Text type="supporting">
                  “{task.title}” overlaps “{other.title}”
                </Text>
                <HStack gap={2} vAlign="center">
                  <Button
                    label={\`Nudge to \${formatMin(conflict.suggestedStart)}\`}
                    size="sm"
                    variant="secondary"
                    icon={<Icon icon={WandSparklesIcon} size="sm" />}
                    onClick={() => onNudgeResolve(conflict)}
                  />
                </HStack>
              </VStack>
            );
          })
        )}
      </VStack>

      <Divider />

      {/* Three-line shutdown journal with an explicit saved indicator. */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={NotebookPenIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Shutdown journal
            </Text>
          </StackItem>
          <Badge
            variant={isJournalSaved ? 'success' : 'neutral'}
            label={isJournalSaved ? 'Saved' : 'Unsaved'}
          />
        </HStack>
        <TextArea
          label="Shutdown journal"
          isLabelHidden
          rows={3}
          placeholder="What moved today? What carries to tomorrow?"
          value={journalText}
          onChange={onJournalChange}
        />
        <HStack gap={2} vAlign="center">
          <Button
            label="Save journal"
            size="sm"
            icon={<Icon icon={SaveIcon} size="sm" />}
            isDisabled={isJournalSaved}
            onClick={onJournalSave}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

type MobilePane = 'backlog' | 'plan' | 'shutdown';

const MOBILE_PANES: ReadonlyArray<{
  id: MobilePane;
  label: string;
  icon: typeof ListTodoIcon;
}> = [
  {id: 'backlog', label: 'Backlog', icon: ListTodoIcon},
  {id: 'plan', label: 'Plan', icon: CalendarClockIcon},
  {id: 'shutdown', label: 'Shutdown', icon: MoonStarIcon},
];

export default function DayPlannerTimeblockTemplate() {
  // Task→placement assignment: present = scheduled block, absent = backlog
  // row. Seeded deterministically from the fixture placements.
  const [placements, setPlacements] = useState<Record<string, Placement>>(
    () => ({...INITIAL_PLACEMENTS}),
  );
  const [doneIds, setDoneIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIAL_DONE),
  );
  const [dragging, setDragging] = useState<DragPayload | null>(null);
  const [journalText, setJournalText] = useState('');
  const [savedJournalText, setSavedJournalText] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [mobilePane, setMobilePane] = useState<MobilePane>('plan');

  const toast = useToast();

  // <=640px: single-pane fallback with the three-way header switcher.
  const isSinglePane = useMediaQuery('(max-width: 640px)');
  // <=1024px: the shutdown panel undocks and stacks under the timeline.
  const isShutdownUndocked = useMediaQuery('(max-width: 1024px)');
  // Drag-and-drop only for hover-capable fine pointers; touch users use
  // the schedule buttons and each block's MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');

  const scheduledBlocks = useMemo<ScheduledBlock[]>(
    () =>
      TASKS.filter(task => placements[task.id] !== undefined).map(task => ({
        task,
        placement: placements[task.id],
      })),
    [placements],
  );

  const backlogTasks = useMemo(
    () => TASKS.filter(task => placements[task.id] === undefined),
    [placements],
  );

  const conflicts = useMemo(
    () => findConflicts(scheduledBlocks),
    [scheduledBlocks],
  );
  const conflictsByTaskId = useMemo(() => {
    const map = new Map<string, Conflict>();
    for (const conflict of conflicts) {
      map.set(conflict.taskId, conflict);
      // The earlier block wears the badge too, keyed to the same fix.
      if (!map.has(conflict.withTaskId)) {
        map.set(conflict.withTaskId, conflict);
      }
    }
    return map;
  }, [conflicts]);

  const plannedMin = useMemo(
    () =>
      scheduledBlocks.reduce(
        (sum, block) => sum + block.placement.durationMin,
        0,
      ),
    [scheduledBlocks],
  );
  const doneCount = useMemo(
    () =>
      scheduledBlocks.filter(block => doneIds.has(block.task.id)).length,
    [scheduledBlocks, doneIds],
  );

  // ---- mutations ----

  const scheduleTask = useCallback(
    (taskId: string, startMinOverride?: number) => {
      const task = TASK_BY_ID.get(taskId);
      if (!task || placements[taskId] !== undefined) {
        return;
      }
      const startMin =
        startMinOverride !== undefined
          ? clampStart(snapMin(startMinOverride), task.estimateMin)
          : findFreeSlot(placements, task.estimateMin);
      if (startMin === null) {
        setAnnouncement(
          \`No open \${formatDuration(task.estimateMin)} slot left today for \${task.title}\`,
        );
        return;
      }
      setPlacements(prev => ({
        ...prev,
        [taskId]: {startMin, durationMin: task.estimateMin},
      }));
      setAnnouncement(
        \`Scheduled \${task.title} at \${formatMin(startMin)} — \${formatDuration(
          plannedMin + task.estimateMin,
        )} planned\`,
      );
    },
    [placements, plannedMin],
  );

  const unscheduleTask = useCallback(
    (taskId: string) => {
      const task = TASK_BY_ID.get(taskId);
      const placement = placements[taskId];
      if (!task || !placement) {
        return;
      }
      const wasDone = doneIds.has(taskId);
      setPlacements(prev => {
        const next = {...prev};
        delete next[taskId];
        return next;
      });
      setDoneIds(prev => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
      setAnnouncement(
        \`Sent \${task.title} to the backlog — \${formatDuration(
          plannedMin - placement.durationMin,
        )} planned\`,
      );
      let dismiss: (() => void) | undefined;
      dismiss = toast({
        body: \`“\${task.title}” moved to the backlog\`,
        endContent: (
          <Button
            label="Undo"
            size="sm"
            variant="secondary"
            icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
            onClick={() => {
              setPlacements(prev => ({...prev, [taskId]: placement}));
              if (wasDone) {
                setDoneIds(prev => new Set(prev).add(taskId));
              }
              setAnnouncement(
                \`Restored \${task.title} at \${formatMin(placement.startMin)}\`,
              );
              dismiss?.();
            }}
          />
        ),
      });
    },
    [placements, doneIds, plannedMin, toast],
  );

  const moveBlock = useCallback(
    (taskId: string, startMin: number) => {
      const task = TASK_BY_ID.get(taskId);
      const placement = placements[taskId];
      if (!task || !placement) {
        return;
      }
      const next = clampStart(snapMin(startMin), placement.durationMin);
      if (next === placement.startMin) {
        return;
      }
      setPlacements(prev => ({
        ...prev,
        [taskId]: {...placement, startMin: next},
      }));
      setAnnouncement(\`Moved \${task.title} to \${formatMin(next)}\`);
    },
    [placements],
  );

  const nudgeBlock = useCallback(
    (taskId: string, deltaMin: number) => {
      const placement = placements[taskId];
      if (!placement) {
        return;
      }
      moveBlock(taskId, placement.startMin + deltaMin);
    },
    [placements, moveBlock],
  );

  const resizeBlock = useCallback(
    (taskId: string, deltaMin: number) => {
      const task = TASK_BY_ID.get(taskId);
      const placement = placements[taskId];
      if (!task || !placement) {
        return;
      }
      const nextDuration = Math.max(
        Math.min(
          placement.durationMin + deltaMin,
          DAY_END_MIN - placement.startMin,
        ),
        MIN_BLOCK_MIN,
      );
      if (nextDuration === placement.durationMin) {
        return;
      }
      setPlacements(prev => ({
        ...prev,
        [taskId]: {...placement, durationMin: nextDuration},
      }));
      setAnnouncement(
        \`\${task.title} is now \${formatDuration(nextDuration)} (\${formatRange(
          placement.startMin,
          nextDuration,
        )})\`,
      );
    },
    [placements],
  );

  const resolveConflict = useCallback(
    (conflict: Conflict) => {
      const task = TASK_BY_ID.get(conflict.taskId);
      if (!task) {
        return;
      }
      moveBlock(conflict.taskId, conflict.suggestedStart);
    },
    [moveBlock],
  );

  const toggleDone = useCallback((taskId: string, done: boolean) => {
    const task = TASK_BY_ID.get(taskId);
    if (!task) {
      return;
    }
    setDoneIds(prev => {
      const next = new Set(prev);
      if (done) {
        next.add(taskId);
      } else {
        next.delete(taskId);
      }
      return next;
    });
    setAnnouncement(
      done ? \`Marked \${task.title} done\` : \`Reopened \${task.title}\`,
    );
  }, []);

  const handleDropAt = useCallback(
    (payload: DragPayload, startMin: number) => {
      if (payload.kind === 'task') {
        scheduleTask(payload.taskId, startMin);
      } else {
        moveBlock(payload.taskId, startMin);
      }
      setDragging(null);
    },
    [scheduleTask, moveBlock],
  );

  const saveJournal = useCallback(() => {
    setSavedJournalText(journalText);
    setAnnouncement('Journal saved');
  }, [journalText]);

  // ---- panes ----

  const backlogPane = (
    <BacklogPane
      tasks={backlogTasks}
      isDraggable={canDrag}
      hasLargeAction={!canDrag}
      dragging={dragging}
      onSchedule={scheduleTask}
      onUnschedule={unscheduleTask}
      onDraggingChange={setDragging}
    />
  );

  const timelinePane = (
    <DayTimeline
      blocks={scheduledBlocks}
      doneIds={doneIds}
      conflictsByTaskId={conflictsByTaskId}
      isDraggable={canDrag}
      dragging={dragging}
      onToggleDone={toggleDone}
      onNudge={nudgeBlock}
      onNudgeResolve={resolveConflict}
      onResize={resizeBlock}
      onUnschedule={unscheduleTask}
      onDraggingChange={setDragging}
      onDropAt={handleDropAt}
    />
  );

  const shutdownContent = (
    <ShutdownPanel
      blocks={scheduledBlocks}
      doneIds={doneIds}
      conflicts={conflicts}
      journalText={journalText}
      savedJournalText={savedJournalText}
      onJournalChange={setJournalText}
      onJournalSave={saveJournal}
      onNudgeResolve={resolveConflict}
    />
  );

  const mobileSwitcher = (
    <HStack gap={1} vAlign="center">
      {MOBILE_PANES.map(pane => (
        <ToggleButton
          key={pane.id}
          label={pane.label}
          size="md"
          isPressed={mobilePane === pane.id}
          onPressedChange={() => setMobilePane(pane.id)}
          icon={<Icon icon={pane.icon} size="sm" />}
        />
      ))}
    </HStack>
  );

  let content: ReactNode;
  if (isSinglePane) {
    content =
      mobilePane === 'backlog' ? (
        backlogPane
      ) : mobilePane === 'shutdown' ? (
        <div style={styles.panelScroll}>{shutdownContent}</div>
      ) : (
        timelinePane
      );
  } else if (isShutdownUndocked) {
    // 641–1024px: shutdown stats stack under the timeline as a Card.
    content = (
      <VStack gap={4}>
        {timelinePane}
        <div style={styles.undockedShutdown}>
          <Card padding={4}>{shutdownContent}</Card>
        </div>
      </VStack>
    );
  } else {
    content = timelinePane;
  }

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* wrap="wrap" drops the ring, readout, and switcher below the
              title on narrow viewports instead of clipping. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={CalendarClockIcon} size="md" color="secondary" />
                <Heading level={1}>Day planner</Heading>
                <Text type="supporting" color="secondary">
                  {PLAN_DATE_LABEL}
                </Text>
              </HStack>
            </StackItem>
            <CompletionRing done={doneCount} total={scheduledBlocks.length} />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatDuration(plannedMin)} planned
            </Text>
            {conflicts.length > 0 ? (
              <Badge
                variant="warning"
                label={\`\${conflicts.length} overlap\${
                  conflicts.length === 1 ? '' : 's'
                }\`}
                icon={
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                }
              />
            ) : null}
            {isSinglePane ? mobileSwitcher : null}
          </HStack>
        </LayoutHeader>
      }
      start={
        isSinglePane ? undefined : (
          <LayoutPanel width={280} padding={0} hasDivider label="Task backlog">
            {backlogPane}
          </LayoutPanel>
        )
      }
      end={
        isSinglePane || isShutdownUndocked ? undefined : (
          <LayoutPanel width={320} padding={0} label="Daily shutdown">
            <div style={styles.panelScroll}>{shutdownContent}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {content}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};