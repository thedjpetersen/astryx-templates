var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Live Workout Session Logger — a mid-session lifting tracker with a
 *   routine rail on the left, the active workout's editable set tables in
 *   the center, and a live derived-stats rail on the right that recomputes
 *   volume and projected 1RM on every keystroke.
 *
 * @input Deterministic fixtures only: the 'Push Day A' routine (Barbell
 *   Bench Press, Seated Overhead Press, Incline Dumbbell Press, Cable
 *   Triceps Pushdown, Dumbbell Lateral Raise) with 3-4 working sets each,
 *   a last-session history table (June 28) that renders as ghost
 *   previous-set values per row, and a substitution catalog of 2-3
 *   alternates per movement. The session clock seeds at a fixed 21:24
 *   elapsed and the rest timer seeds from each exercise's fixed rest
 *   budget — only the once-per-second tick cadence is runtime; there is no
 *   Date.now(), Math.random(), or network asset anywhere.
 * @output A training-app logging surface: LayoutHeader holds the session
 *   title, the ticking elapsed-time chip, a rest-countdown chip (with +30s
 *   and Skip) that appears whenever a set is checked off, and a Finish
 *   button. The left LayoutPanel lists the routine with per-exercise
 *   completion states and jump-to selection; the center column renders one
 *   block per exercise — an editable set table (weight / reps / RPE
 *   NumberInputs, done CheckboxInput, remove IconButton) with a tappable
 *   ghost "prev" cell that backfills last session's numbers, plus add-set
 *   and Swap-exercise controls; the right LayoutPanel derives total
 *   completed volume, sets-completed progress, and per-lift projected 1RM
 *   via the Epley formula (w × (1 + reps/30)), each with a delta Badge
 *   against last session. Swapping an exercise opens a Dialog of
 *   alternates and preserves every logged set; Finish swaps the center for
 *   a summary panel diffing volume and per-lift bests against last
 *   session, with Resume as the undo path.
 * @position Emitted by \`astryx template workout-session-logger\`.
 *
 * Frame (desktop, left to right):
 *   routine rail 260px (scrolls) | active workout column (fill, scrolls) |
 *   live stats rail 300px (scrolls); LayoutHeader stays pinned above all
 *   three so the timers and Finish action never scroll away.
 *
 * Container policy (dense logging-tool archetype): exercise blocks are
 * bordered row groups, not Cards, so five blocks read as one continuous
 * log rather than a widget stack; the only Card is the post-Finish
 * summary artifact, which earns it by being a standalone "session report"
 * on the muted backdrop. Rails are plain scrolling columns of rows and
 * stat groups separated by Dividers.
 *
 * Choose over form-inline-edit when every row is always editable (a live
 * logging grid) rather than display rows that swap into editors; choose
 * over invoice-builder when the derived pane is a stats rail computed from
 * the same rows rather than a WYSIWYG paper document; choose over
 * habit-tracker-style dashboards because this is one in-progress session
 * with timers and per-set state, not a calendar of streaks.
 *
 * Responsive contract:
 * - >900px  — three-region frame: 260px routine rail | workout column |
 *   300px stats rail. Each region scrolls independently under the pinned
 *   header.
 * - <=900px — both rails leave the frame. A Workout/Stats
 *   SegmentedControl appears in the header: Workout shows the routine as
 *   a horizontally scrolling chip strip above the exercise blocks (same
 *   selection behavior as the rail); Stats shows the routine list plus
 *   the full derived-stats stack in a single scrolling column. Nothing
 *   becomes unreachable.
 * - <=640px — the header HStack wraps so the timer chips and Finish drop
 *   to a second row instead of clipping at 375px; Finish collapses to an
 *   icon-only button with a tooltip and aria label; checkboxes and the
 *   per-set remove IconButtons grow to >=40px touch targets; add-set and
 *   swap buttons grow to md. All controls are always-visible buttons —
 *   nothing is hover-only.
 * - Each set table keeps a 520px minimum grid inside its own overflow-x
 *   wrapper, so weight/reps/RPE inputs never crush and the page itself
 *   never scrolls sideways at 375px.
 *
 * Color policy: token-pure chrome — every surface, border, and text color
 * resolves through var(--color-*) tokens, so the whole log adapts to dark
 * mode automatically. The one scheme-locked surface is the decorative
 * plate mark next to each exercise name: brand-gradient art with
 * colorScheme locked to 'light' — its literal hex gradient stops and
 * literal #FFFFFF glyph are intentional so the mark renders identically
 * in light and dark mode.
 */

import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  ArrowLeftRightIcon,
  CircleCheckIcon,
  CircleIcon,
  DumbbellIcon,
  FlagIcon,
  HistoryIcon,
  PlusIcon,
  TimerIcon,
  Trash2Icon,
  TrendingUpIcon,
  Undo2Icon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens. Fixed colors appear
// only in the decorative gradient plate mark (no network images).
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Rails: plain scrolling columns under the pinned header.
  railScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  // Workout column: scrolls independently; keeps a readable measure.
  workoutScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  workoutColumn: {
    width: '100%',
    maxWidth: 760,
  },
  // One exercise block: a bordered row group, not a Card, so five blocks
  // read as one continuous session log.
  exerciseBlock: {
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
  },
  exerciseBlockActive: {
    borderRadius: 10,
    border: '1px solid var(--color-border-focus, var(--color-border))',
    boxShadow: '0 0 0 1px var(--color-border-focus, var(--color-border))',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
  },
  // Decorative plate mark next to each exercise name — CSS only.
  // Scheme-locked brand art (see Color policy above): literal gradient
  // stops + literal white glyph on purpose; colorScheme is pinned so the
  // mark never flips in dark mode.
  plateMark: {
    width: 34,
    height: 34,
    borderRadius: 9,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #2E6BE6 0%, #5B4DD8 60%, #7C3AB8 100%)',
    color: '#FFFFFF',
    colorScheme: 'light',
  },
  // Set table: fixed-minimum grid inside its own overflow-x wrapper so
  // the three NumberInputs never crush and the page never pans sideways.
  tableScroll: {
    overflowX: 'auto',
  },
  tableGrid: {
    minWidth: 520,
  },
  setRow: {
    display: 'grid',
    gridTemplateColumns:
      '32px 96px minmax(88px, 1fr) minmax(88px, 1fr) minmax(88px, 1fr) 48px 40px',
    columnGap: 8,
    alignItems: 'center',
    paddingBlock: 6,
  },
  headCell: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  setNumber: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Ghost previous-session cell: a real button (tap to backfill), rendered
  // as muted italic text so it reads as a placeholder, not logged data.
  ghostButton: {
    appearance: 'none',
    background: 'transparent',
    border: '1px dashed var(--color-border)',
    borderRadius: 6,
    paddingBlock: 6,
    paddingInline: 8,
    minHeight: 32,
    fontSize: 12,
    fontStyle: 'italic',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  },
  ghostEmpty: {
    fontSize: 12,
    fontStyle: 'italic',
    color: 'var(----color-text-secondary, var(--color-text-secondary))',
    paddingInline: 8,
  },
  centerCell: {
    display: 'flex',
    justifyContent: 'center',
  },
  // Routine rail rows: full-width buttons so selection works by tap/focus.
  routineButton: {
    appearance: 'none',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'block',
  },
  routineButtonActive: {
    appearance: 'none',
    background: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    padding: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    textAlign: 'left',
    cursor: 'pointer',
    display: 'block',
  },
  // <=900px: the routine rail becomes a horizontally scrolling chip strip.
  chipStrip: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
  },
  chip: {
    appearance: 'none',
    background: 'transparent',
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    paddingBlock: 8,
    paddingInline: 12,
    minHeight: 40,
    fontSize: 13,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  chipActive: {
    appearance: 'none',
    background: 'var(--color-background-body)',
    border: '1px solid var(--color-text-secondary)',
    borderRadius: 999,
    paddingBlock: 8,
    paddingInline: 12,
    minHeight: 40,
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // Header timer chips.
  timerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 10,
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  restChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingBlock: 4,
    paddingInline: 10,
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-border)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  // Summary diff table rows (post-Finish artifact).
  summaryRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(140px, 1fr) 92px 92px 88px',
    columnGap: 10,
    alignItems: 'center',
    paddingBlock: 8,
  },
  summaryScroll: {
    overflowX: 'auto',
  },
  summaryGrid: {
    minWidth: 440,
  },
  numericCell: {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 13,
    color: 'var(--color-text-primary)',
  },
  summaryBackdrop: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Push Day A: five movements with 3-4 working
// sets each, last-session history (June 28) for the ghost cells, and a
// substitution catalog. No clocks, randomness, or network assets.
// ---------------------------------------------------------------------------

interface ExerciseInfo {
  /** Stable catalog id — history and substitutes key off this. */
  id: string;
  name: string;
  muscle: string;
  restSeconds: number;
}

const CATALOG: Record<string, ExerciseInfo> = {
  'bench-press': {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    muscle: 'Chest',
    restSeconds: 150,
  },
  'db-bench': {
    id: 'db-bench',
    name: 'Dumbbell Bench Press',
    muscle: 'Chest',
    restSeconds: 120,
  },
  'machine-chest-press': {
    id: 'machine-chest-press',
    name: 'Machine Chest Press',
    muscle: 'Chest',
    restSeconds: 105,
  },
  'overhead-press': {
    id: 'overhead-press',
    name: 'Seated Overhead Press',
    muscle: 'Shoulders',
    restSeconds: 120,
  },
  'db-shoulder-press': {
    id: 'db-shoulder-press',
    name: 'Dumbbell Shoulder Press',
    muscle: 'Shoulders',
    restSeconds: 105,
  },
  'landmine-press': {
    id: 'landmine-press',
    name: 'Landmine Press',
    muscle: 'Shoulders',
    restSeconds: 90,
  },
  'incline-db-press': {
    id: 'incline-db-press',
    name: 'Incline Dumbbell Press',
    muscle: 'Upper chest',
    restSeconds: 105,
  },
  'incline-barbell-press': {
    id: 'incline-barbell-press',
    name: 'Incline Barbell Press',
    muscle: 'Upper chest',
    restSeconds: 120,
  },
  'cable-fly': {
    id: 'cable-fly',
    name: 'Cable Chest Fly',
    muscle: 'Upper chest',
    restSeconds: 75,
  },
  'triceps-pushdown': {
    id: 'triceps-pushdown',
    name: 'Cable Triceps Pushdown',
    muscle: 'Triceps',
    restSeconds: 75,
  },
  'overhead-extension': {
    id: 'overhead-extension',
    name: 'Overhead Cable Extension',
    muscle: 'Triceps',
    restSeconds: 75,
  },
  'skull-crusher': {
    id: 'skull-crusher',
    name: 'EZ-Bar Skull Crusher',
    muscle: 'Triceps',
    restSeconds: 90,
  },
  'lateral-raise': {
    id: 'lateral-raise',
    name: 'Dumbbell Lateral Raise',
    muscle: 'Side delts',
    restSeconds: 60,
  },
  'cable-lateral-raise': {
    id: 'cable-lateral-raise',
    name: 'Cable Lateral Raise',
    muscle: 'Side delts',
    restSeconds: 60,
  },
  'machine-lateral-raise': {
    id: 'machine-lateral-raise',
    name: 'Machine Lateral Raise',
    muscle: 'Side delts',
    restSeconds: 60,
  },
};

/** Alternates offered by the Swap dialog, per routine movement. */
const SUBSTITUTES: Record<string, string[]> = {
  'bench-press': ['db-bench', 'machine-chest-press'],
  'db-bench': ['bench-press', 'machine-chest-press'],
  'machine-chest-press': ['bench-press', 'db-bench'],
  'overhead-press': ['db-shoulder-press', 'landmine-press'],
  'db-shoulder-press': ['overhead-press', 'landmine-press'],
  'landmine-press': ['overhead-press', 'db-shoulder-press'],
  'incline-db-press': ['incline-barbell-press', 'cable-fly'],
  'incline-barbell-press': ['incline-db-press', 'cable-fly'],
  'cable-fly': ['incline-db-press', 'incline-barbell-press'],
  'triceps-pushdown': ['overhead-extension', 'skull-crusher'],
  'overhead-extension': ['triceps-pushdown', 'skull-crusher'],
  'skull-crusher': ['triceps-pushdown', 'overhead-extension'],
  'lateral-raise': ['cable-lateral-raise', 'machine-lateral-raise'],
  'cable-lateral-raise': ['lateral-raise', 'machine-lateral-raise'],
  'machine-lateral-raise': ['lateral-raise', 'cable-lateral-raise'],
};

interface HistorySet {
  weight: number;
  reps: number;
  rpe: number;
}

/** Last session (Sat, June 28) — drives ghost cells and every delta. */
const LAST_SESSION: Record<string, HistorySet[]> = {
  'bench-press': [
    {weight: 135, reps: 10, rpe: 6},
    {weight: 185, reps: 8, rpe: 7.5},
    {weight: 185, reps: 7, rpe: 8.5},
    {weight: 185, reps: 6, rpe: 9},
  ],
  'overhead-press': [
    {weight: 95, reps: 10, rpe: 7},
    {weight: 105, reps: 8, rpe: 8},
    {weight: 105, reps: 7, rpe: 9},
  ],
  'incline-db-press': [
    {weight: 60, reps: 10, rpe: 7.5},
    {weight: 65, reps: 8, rpe: 8.5},
    {weight: 65, reps: 8, rpe: 9},
  ],
  'triceps-pushdown': [
    {weight: 55, reps: 12, rpe: 7},
    {weight: 60, reps: 10, rpe: 8},
    {weight: 60, reps: 9, rpe: 9},
  ],
  'lateral-raise': [
    {weight: 20, reps: 14, rpe: 7.5},
    {weight: 20, reps: 12, rpe: 8.5},
    {weight: 20, reps: 11, rpe: 9},
  ],
};

interface SetEntry {
  id: string;
  weight: number | null;
  reps: number | null;
  rpe: number | null;
  done: boolean;
}

interface ExerciseSlot {
  /** Stable slot id — survives substitution so completed sets persist. */
  slotId: string;
  exerciseId: string;
  sets: SetEntry[];
}

// Session in progress: bench is fully logged, OHP is mid-lift, the rest
// are still waiting — so the rails and deltas render meaningfully on load.
const INITIAL_SLOTS: ExerciseSlot[] = [
  {
    slotId: 'slot-1',
    exerciseId: 'bench-press',
    sets: [
      {id: 'set-1', weight: 135, reps: 10, rpe: 6, done: true},
      {id: 'set-2', weight: 185, reps: 8, rpe: 7.5, done: true},
      {id: 'set-3', weight: 190, reps: 6, rpe: 8.5, done: true},
      {id: 'set-4', weight: 190, reps: 6, rpe: 9, done: true},
    ],
  },
  {
    slotId: 'slot-2',
    exerciseId: 'overhead-press',
    sets: [
      {id: 'set-5', weight: 95, reps: 10, rpe: 7, done: true},
      {id: 'set-6', weight: 110, reps: 7, rpe: 8.5, done: true},
      {id: 'set-7', weight: 110, reps: null, rpe: null, done: false},
    ],
  },
  {
    slotId: 'slot-3',
    exerciseId: 'incline-db-press',
    sets: [
      {id: 'set-8', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-9', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-10', weight: null, reps: null, rpe: null, done: false},
    ],
  },
  {
    slotId: 'slot-4',
    exerciseId: 'triceps-pushdown',
    sets: [
      {id: 'set-11', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-12', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-13', weight: null, reps: null, rpe: null, done: false},
    ],
  },
  {
    slotId: 'slot-5',
    exerciseId: 'lateral-raise',
    sets: [
      {id: 'set-14', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-15', weight: null, reps: null, rpe: null, done: false},
      {id: 'set-16', weight: null, reps: null, rpe: null, done: false},
    ],
  },
];

/** Fixed session-clock seed: the lifter is 21:24 into Push Day A. */
const INITIAL_ELAPSED_SECONDS = 21 * 60 + 24;
const INITIAL_NEXT_SET_NUMBER = 17;

type Phase = 'active' | 'finished';
type Pane = 'workout' | 'stats';

// ---------------------------------------------------------------------------
// PURE HELPERS — deterministic math and formatting; no locale APIs.
// ---------------------------------------------------------------------------

/** 1284 → '21:24'; 3705 → '1:01:45'. */
function formatClock(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, '0') : String(minutes);
  const ss = String(seconds).padStart(2, '0');
  return hours > 0 ? \`\${hours}:\${mm}:\${ss}\` : \`\${mm}:\${ss}\`;
}

/** 12480 → '12,480' — pure string math, no locale APIs. */
function formatNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
}

/** Epley estimated one-rep max: w × (1 + reps/30), rounded to whole lb. */
function epley1RM(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) {
    return 0;
  }
  return Math.round(weight * (1 + reps / 30));
}

/** Best estimated 1RM across any set with both weight and reps filled. */
function bestE1RM(sets: Array<{weight: number | null; reps: number | null}>): number {
  return sets.reduce((best, set) => {
    if (set.weight !== null && set.reps !== null) {
      return Math.max(best, epley1RM(set.weight, set.reps));
    }
    return best;
  }, 0);
}

/** Completed volume: Σ weight × reps over done sets with filled values. */
function completedVolume(sets: SetEntry[]): number {
  return sets.reduce(
    (sum, set) =>
      set.done ? sum + (set.weight ?? 0) * (set.reps ?? 0) : sum,
    0,
  );
}

/** Whole-session volume for a history table (all sets counted). */
function historyVolume(history: Record<string, HistorySet[]>): number {
  return Object.values(history).reduce(
    (sum, sets) =>
      sum + sets.reduce((inner, set) => inner + set.weight * set.reps, 0),
    0,
  );
}

const LAST_SESSION_VOLUME = historyVolume(LAST_SESSION);

/** Signed delta Badge against a last-session baseline. */
function DeltaBadge({
  current,
  previous,
  unit,
}: {
  current: number;
  previous: number;
  unit: string;
}) {
  if (previous === 0 || current === 0) {
    return <Badge variant="neutral" label="no prior" />;
  }
  const delta = current - previous;
  if (delta === 0) {
    return <Badge variant="neutral" label="even" />;
  }
  const label = \`\${delta > 0 ? '+' : '−'}\${formatNumber(Math.abs(delta))} \${unit}\`;
  return <Badge variant={delta > 0 ? 'success' : 'warning'} label={label} />;
}

// ---------------------------------------------------------------------------
// SET ROW — one editable set: ghost prev cell, weight/reps/RPE inputs,
// done checkbox (starts the rest timer), remove control.
// ---------------------------------------------------------------------------

function SetTableRow({
  set,
  index,
  exerciseName,
  ghost,
  canRemove,
  isPhone,
  onPatch,
  onToggleDone,
  onFillFromGhost,
  onRemove,
}: {
  set: SetEntry;
  index: number;
  exerciseName: string;
  ghost: HistorySet | undefined;
  canRemove: boolean;
  isPhone: boolean;
  onPatch: (setId: string, patch: Partial<SetEntry>) => void;
  onToggleDone: (setId: string, done: boolean) => void;
  onFillFromGhost: (setId: string, ghost: HistorySet) => void;
  onRemove: (setId: string) => void;
}) {
  const setLabel = \`\${exerciseName} set \${index + 1}\`;
  return (
    <div style={styles.setRow}>
      <span style={styles.setNumber}>{index + 1}</span>
      {ghost ? (
        <button
          type="button"
          style={styles.ghostButton}
          aria-label={\`Fill \${setLabel} from last session: \${ghost.weight} pounds for \${ghost.reps} reps at RPE \${ghost.rpe}\`}
          onClick={() => onFillFromGhost(set.id, ghost)}>
          {ghost.weight}×{ghost.reps} @{ghost.rpe}
        </button>
      ) : (
        <span style={styles.ghostEmpty} aria-hidden>
          —
        </span>
      )}
      <NumberInput
        label={\`\${setLabel} weight (lb)\`}
        isLabelHidden
        value={set.weight}
        onChange={weight => onPatch(set.id, {weight})}
        min={0}
        step={5}
        width="100%"
      />
      <NumberInput
        label={\`\${setLabel} reps\`}
        isLabelHidden
        value={set.reps}
        onChange={reps => onPatch(set.id, {reps})}
        min={0}
        step={1}
        width="100%"
      />
      <NumberInput
        label={\`\${setLabel} RPE\`}
        isLabelHidden
        value={set.rpe}
        onChange={rpe => onPatch(set.id, {rpe})}
        min={5}
        max={10}
        step={0.5}
        width="100%"
      />
      <div style={styles.centerCell}>
        <CheckboxInput
          label={\`Mark \${setLabel} done\`}
          isLabelHidden
          size={isPhone ? 'md' : 'sm'}
          value={set.done}
          onChange={done => onToggleDone(set.id, done)}
        />
      </div>
      <IconButton
        label={\`Remove \${setLabel}\`}
        tooltip="Remove set"
        size={isPhone ? 'lg' : 'sm'}
        variant="ghost"
        icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
        isDisabled={!canRemove}
        onClick={() => onRemove(set.id)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EXERCISE BLOCK — header (name, muscle, done count, Swap), set table with
// ghost prev column, add-set control.
// ---------------------------------------------------------------------------

function ExerciseBlock({
  slot,
  isActive,
  isPhone,
  onSelect,
  onPatchSet,
  onToggleDone,
  onFillFromGhost,
  onAddSet,
  onRemoveSet,
  onOpenSwap,
}: {
  slot: ExerciseSlot;
  isActive: boolean;
  isPhone: boolean;
  onSelect: (slotId: string) => void;
  onPatchSet: (slotId: string, setId: string, patch: Partial<SetEntry>) => void;
  onToggleDone: (slotId: string, setId: string, done: boolean) => void;
  onFillFromGhost: (slotId: string, setId: string, ghost: HistorySet) => void;
  onAddSet: (slotId: string) => void;
  onRemoveSet: (slotId: string, setId: string) => void;
  onOpenSwap: (slotId: string) => void;
}) {
  const info = CATALOG[slot.exerciseId];
  const ghosts = LAST_SESSION[slot.exerciseId];
  const doneCount = slot.sets.filter(set => set.done).length;
  const isComplete = doneCount === slot.sets.length && slot.sets.length > 0;

  return (
    <section
      aria-label={info.name}
      style={isActive ? styles.exerciseBlockActive : styles.exerciseBlock}
      onFocusCapture={() => onSelect(slot.slotId)}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <div style={styles.plateMark} aria-hidden>
            <Icon icon={DumbbellIcon} size="sm" color="inherit" />
          </div>
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>{info.name}</Heading>
              <Text type="supporting" color="secondary">
                {info.muscle} · rest {formatClock(info.restSeconds)} between
                sets
              </Text>
            </VStack>
          </StackItem>
          <Badge
            variant={isComplete ? 'success' : 'neutral'}
            label={\`\${doneCount}/\${slot.sets.length} sets\`}
          />
          <Button
            label="Swap"
            variant="secondary"
            size={isPhone ? 'md' : 'sm'}
            icon={<Icon icon={ArrowLeftRightIcon} size="sm" color="inherit" />}
            tooltip="Substitute this exercise — logged sets are kept"
            onClick={() => onOpenSwap(slot.slotId)}
          />
        </HStack>

        {/* Set table: 520px minimum grid inside its own overflow-x wrapper
            so weight/reps/RPE inputs never crush at 375px. */}
        <div style={styles.tableScroll}>
          <div style={styles.tableGrid}>
            <div style={styles.setRow}>
              <span style={styles.headCell}>Set</span>
              <span style={styles.headCell}>Prev</span>
              <span style={styles.headCell}>Weight (lb)</span>
              <span style={styles.headCell}>Reps</span>
              <span style={styles.headCell}>RPE</span>
              <span style={{...styles.headCell, textAlign: 'center'}}>
                Done
              </span>
              <span />
            </div>
            <Divider />
            {slot.sets.map((set, index) => (
              <div key={set.id}>
                {index > 0 && <Divider variant="subtle" />}
                <SetTableRow
                  set={set}
                  index={index}
                  exerciseName={info.name}
                  ghost={ghosts?.[index]}
                  canRemove={slot.sets.length > 1}
                  isPhone={isPhone}
                  onPatch={(setId, patch) =>
                    onPatchSet(slot.slotId, setId, patch)
                  }
                  onToggleDone={(setId, done) =>
                    onToggleDone(slot.slotId, setId, done)
                  }
                  onFillFromGhost={(setId, ghost) =>
                    onFillFromGhost(slot.slotId, setId, ghost)
                  }
                  onRemove={setId => onRemoveSet(slot.slotId, setId)}
                />
              </div>
            ))}
          </div>
        </div>

        <HStack gap={2} vAlign="center">
          <Button
            label="Add set"
            variant="ghost"
            size={isPhone ? 'md' : 'sm'}
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            onClick={() => onAddSet(slot.slotId)}
          />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Tap a Prev value to log last session&apos;s numbers.
            </Text>
          </StackItem>
        </HStack>
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// STATS STACK — live derived numbers shared by the right rail (>900px) and
// the Stats pane (<=900px). Pure render of session state.
// ---------------------------------------------------------------------------

function StatsStack({slots}: {slots: ExerciseSlot[]}) {
  const totalVolume = slots.reduce(
    (sum, slot) => sum + completedVolume(slot.sets),
    0,
  );
  const totalSets = slots.reduce((sum, slot) => sum + slot.sets.length, 0);
  const doneSets = slots.reduce(
    (sum, slot) => sum + slot.sets.filter(set => set.done).length,
    0,
  );

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text type="label" color="secondary">
          Total volume (completed sets)
        </Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.statValue}>{formatNumber(totalVolume)} lb</span>
          <DeltaBadge
            current={totalVolume}
            previous={LAST_SESSION_VOLUME}
            unit="lb"
          />
        </HStack>
        <Text type="supporting" color="secondary">
          Last session: {formatNumber(LAST_SESSION_VOLUME)} lb
        </Text>
      </VStack>

      <Divider variant="subtle" />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Sets completed
            </Text>
          </StackItem>
          <Text type="label">
            {doneSets}/{totalSets}
          </Text>
        </HStack>
        <ProgressBar
          value={doneSets}
          max={totalSets}
          label="Sets completed"
          isLabelHidden
        />
      </VStack>

      <Divider variant="subtle" />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TrendingUpIcon} size="sm" color="secondary" />
          <Text type="label" color="secondary">
            Projected 1RM (Epley)
          </Text>
        </HStack>
        {slots.map(slot => {
          const info = CATALOG[slot.exerciseId];
          const current = bestE1RM(slot.sets);
          const previous = bestE1RM(LAST_SESSION[slot.exerciseId] ?? []);
          return (
            <HStack key={slot.slotId} gap={2} vAlign="center">
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body">{info.name}</Text>
                  <Text type="supporting" color="secondary">
                    {previous > 0
                      ? \`last \${formatNumber(previous)} lb\`
                      : 'no previous data'}
                  </Text>
                </VStack>
              </StackItem>
              <Text type="label">
                {current > 0 ? \`\${formatNumber(current)} lb\` : '—'}
              </Text>
              <DeltaBadge current={current} previous={previous} unit="lb" />
            </HStack>
          );
        })}
        <Text type="supporting" color="secondary">
          e1RM = weight × (1 + reps ÷ 30), best filled set per lift.
        </Text>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// ROUTINE LIST — the left rail (and the Stats pane's routine section).
// Selection highlights the matching exercise block in the center column.
// ---------------------------------------------------------------------------

function RoutineList({
  slots,
  activeSlotId,
  onSelect,
}: {
  slots: ExerciseSlot[];
  activeSlotId: string;
  onSelect: (slotId: string) => void;
}) {
  return (
    <VStack gap={1}>
      {slots.map(slot => {
        const info = CATALOG[slot.exerciseId];
        const doneCount = slot.sets.filter(set => set.done).length;
        const isComplete =
          doneCount === slot.sets.length && slot.sets.length > 0;
        const isActive = slot.slotId === activeSlotId;
        return (
          <button
            key={slot.slotId}
            type="button"
            style={isActive ? styles.routineButtonActive : styles.routineButton}
            aria-pressed={isActive}
            onClick={() => onSelect(slot.slotId)}>
            <HStack gap={2} vAlign="center">
              <Icon
                icon={isComplete ? CircleCheckIcon : CircleIcon}
                size="sm"
                color={isComplete ? 'success' : 'secondary'}
              />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="label">{info.name}</Text>
                  <Text type="supporting" color="secondary">
                    {info.muscle}
                  </Text>
                </VStack>
              </StackItem>
              <Badge
                variant={isComplete ? 'success' : 'neutral'}
                label={\`\${doneCount}/\${slot.sets.length}\`}
              />
            </HStack>
          </button>
        );
      })}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY — the post-Finish artifact: a session report Card diffing volume
// and per-lift bests against last session. Resume is the undo path.
// ---------------------------------------------------------------------------

function SessionSummary({
  slots,
  elapsedSeconds,
  onResume,
  onSave,
}: {
  slots: ExerciseSlot[];
  elapsedSeconds: number;
  onResume: () => void;
  onSave: () => void;
}) {
  const totalVolume = slots.reduce(
    (sum, slot) => sum + completedVolume(slot.sets),
    0,
  );
  const totalSets = slots.reduce((sum, slot) => sum + slot.sets.length, 0);
  const doneSets = slots.reduce(
    (sum, slot) => sum + slot.sets.filter(set => set.done).length,
    0,
  );

  return (
    <div style={styles.summaryBackdrop}>
      <Card padding={5} style={{width: 640, maxWidth: '100%'}}>
        <VStack gap={4}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Icon icon={FlagIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={2}>Push Day A — session summary</Heading>
                <Text type="supporting" color="secondary">
                  Wed, July 2 · {formatClock(elapsedSeconds)} elapsed ·
                  compared against Sat, June 28
                </Text>
              </VStack>
            </StackItem>
          </HStack>

          <Divider />

          <HStack gap={5} vAlign="start" wrap="wrap">
            <VStack gap={0}>
              <Text type="label" color="secondary">
                Total volume
              </Text>
              <HStack gap={2} vAlign="center">
                <span style={styles.statValue}>
                  {formatNumber(totalVolume)} lb
                </span>
                <DeltaBadge
                  current={totalVolume}
                  previous={LAST_SESSION_VOLUME}
                  unit="lb"
                />
              </HStack>
              <Text type="supporting" color="secondary">
                Last session: {formatNumber(LAST_SESSION_VOLUME)} lb
              </Text>
            </VStack>
            <VStack gap={0}>
              <Text type="label" color="secondary">
                Sets completed
              </Text>
              <span style={styles.statValue}>
                {doneSets}/{totalSets}
              </span>
              <Text type="supporting" color="secondary">
                {totalSets - doneSets === 0
                  ? 'Every planned set logged'
                  : \`\${totalSets - doneSets} set\${
                      totalSets - doneSets === 1 ? '' : 's'
                    } skipped\`}
              </Text>
            </VStack>
          </HStack>

          <Divider />

          {/* Per-lift bests vs last session, in a min-width grid inside an
              overflow-x wrapper so the four columns survive 375px. */}
          <VStack gap={1}>
            <Text type="label" color="secondary">
              Per-lift best (estimated 1RM)
            </Text>
            <div style={styles.summaryScroll}>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryRow}>
                  <span style={styles.headCell}>Lift</span>
                  <span style={{...styles.headCell, textAlign: 'right'}}>
                    Today
                  </span>
                  <span style={{...styles.headCell, textAlign: 'right'}}>
                    Last
                  </span>
                  <span style={{...styles.headCell, textAlign: 'right'}}>
                    Change
                  </span>
                </div>
                <Divider />
                {slots.map((slot, index) => {
                  const info = CATALOG[slot.exerciseId];
                  const current = bestE1RM(slot.sets);
                  const previous = bestE1RM(
                    LAST_SESSION[slot.exerciseId] ?? [],
                  );
                  return (
                    <div key={slot.slotId}>
                      {index > 0 && <Divider variant="subtle" />}
                      <div style={styles.summaryRow}>
                        <Text type="body">{info.name}</Text>
                        <span style={styles.numericCell}>
                          {current > 0 ? \`\${formatNumber(current)} lb\` : '—'}
                        </span>
                        <span style={styles.numericCell}>
                          {previous > 0
                            ? \`\${formatNumber(previous)} lb\`
                            : '—'}
                        </span>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                          <DeltaBadge
                            current={current}
                            previous={previous}
                            unit="lb"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </VStack>

          <Divider />

          <HStack gap={2} wrap="wrap">
            <Button
              label="Resume session"
              variant="secondary"
              icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
              onClick={onResume}
            />
            <Button
              label="Save workout"
              variant="primary"
              icon={<Icon icon={CircleCheckIcon} size="sm" color="inherit" />}
              onClick={onSave}
            />
          </HStack>
        </VStack>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function WorkoutSessionLoggerTemplate() {
  const toast = useToast();

  // ---- session state (single source of truth for all three regions) ----
  const [slots, setSlots] = useState<ExerciseSlot[]>(INITIAL_SLOTS);
  const [nextSetNumber, setNextSetNumber] = useState(INITIAL_NEXT_SET_NUMBER);
  const [activeSlotId, setActiveSlotId] = useState('slot-2');
  const [phase, setPhase] = useState<Phase>('active');
  const [elapsedSeconds, setElapsedSeconds] = useState(
    INITIAL_ELAPSED_SECONDS,
  );
  // Rest countdown: null = idle. Set to the exercise's rest budget when a
  // set is checked off; ticks down once per second to zero.
  const [restRemaining, setRestRemaining] = useState<number | null>(null);
  const [restLabel, setRestLabel] = useState('');
  // Swap dialog: the slot being substituted, or null when closed.
  const [swapSlotId, setSwapSlotId] = useState<string | null>(null);
  // aria-live announcements for set completion and rest transitions.
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract (see file header).
  const isSinglePane = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const [pane, setPane] = useState<Pane>('workout');
  const activePane: Pane = isSinglePane ? pane : 'workout';

  // Session clock: seeded at a fixed 21:24; only the tick is runtime.
  useEffect(() => {
    if (phase !== 'active') {
      return;
    }
    const timer = window.setInterval(() => {
      setElapsedSeconds(previous => previous + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Rest countdown: decrements to zero, then clears itself.
  const isResting = restRemaining !== null;
  useEffect(() => {
    if (!isResting || phase !== 'active') {
      return;
    }
    const timer = window.setInterval(() => {
      setRestRemaining(previous =>
        previous === null || previous <= 1 ? null : previous - 1,
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isResting, phase]);

  // ---- set operations ----

  const patchSet = (slotId: string, setId: string, patch: Partial<SetEntry>) => {
    setSlots(previous =>
      previous.map(slot =>
        slot.slotId === slotId
          ? {
              ...slot,
              sets: slot.sets.map(set =>
                set.id === setId ? {...set, ...patch} : set,
              ),
            }
          : slot,
      ),
    );
  };

  const toggleDone = (slotId: string, setId: string, done: boolean) => {
    patchSet(slotId, setId, {done});
    const slot = slots.find(entry => entry.slotId === slotId);
    if (slot === undefined) {
      return;
    }
    const info = CATALOG[slot.exerciseId];
    if (done) {
      // Checking a set off starts a visible rest countdown for that lift.
      setRestRemaining(info.restSeconds);
      setRestLabel(info.name);
      setAnnouncement(
        \`Set logged for \${info.name}. Rest \${formatClock(info.restSeconds)} started.\`,
      );
    } else {
      setAnnouncement(\`Set unchecked for \${info.name}.\`);
    }
  };

  const fillFromGhost = (slotId: string, setId: string, ghost: HistorySet) => {
    patchSet(slotId, setId, {
      weight: ghost.weight,
      reps: ghost.reps,
      rpe: ghost.rpe,
    });
  };

  const addSet = (slotId: string) => {
    const id = \`set-\${nextSetNumber}\`;
    setNextSetNumber(n => n + 1);
    setSlots(previous =>
      previous.map(slot => {
        if (slot.slotId !== slotId) {
          return slot;
        }
        // Seed the new set from the last row so plates carry over.
        const last = slot.sets[slot.sets.length - 1];
        return {
          ...slot,
          sets: [
            ...slot.sets,
            {
              id,
              weight: last?.weight ?? null,
              reps: null,
              rpe: null,
              done: false,
            },
          ],
        };
      }),
    );
  };

  const removeSet = (slotId: string, setId: string) => {
    setSlots(previous =>
      previous.map(slot =>
        slot.slotId === slotId
          ? {...slot, sets: slot.sets.filter(set => set.id !== setId)}
          : slot,
      ),
    );
  };

  // ---- substitution ----

  const swapSlot = slots.find(entry => entry.slotId === swapSlotId);

  const applySubstitution = (slotId: string, exerciseId: string) => {
    const previousSlot = slots.find(entry => entry.slotId === slotId);
    setSlots(previous =>
      previous.map(slot =>
        // Same slot, same sets — only the movement identity changes, so
        // every completed set is preserved through the swap.
        slot.slotId === slotId ? {...slot, exerciseId} : slot,
      ),
    );
    setSwapSlotId(null);
    if (previousSlot !== undefined) {
      const fromName = CATALOG[previousSlot.exerciseId].name;
      const toName = CATALOG[exerciseId].name;
      const kept = previousSlot.sets.filter(set => set.done).length;
      toast({
        body: \`\${fromName} → \${toName}. \${kept} completed set\${
          kept === 1 ? '' : 's'
        } kept.\`,
        uniqueID: 'workout-swap',
      });
    }
  };

  // ---- finish / resume ----

  const finishSession = () => {
    setPhase('finished');
    setRestRemaining(null);
    setAnnouncement('Session finished. Showing summary.');
  };

  const resumeSession = () => {
    setPhase('active');
    setAnnouncement('Session resumed.');
  };

  const saveSession = () => {
    toast({
      body: \`Push Day A saved — \${formatClock(elapsedSeconds)} elapsed.\`,
      uniqueID: 'workout-save',
    });
  };

  // ---- panes ----

  const workoutBlocks = (
    <VStack gap={3}>
      {slots.map(slot => (
        <ExerciseBlock
          key={slot.slotId}
          slot={slot}
          isActive={slot.slotId === activeSlotId}
          isPhone={isPhone}
          onSelect={setActiveSlotId}
          onPatchSet={patchSet}
          onToggleDone={toggleDone}
          onFillFromGhost={fillFromGhost}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          onOpenSwap={setSwapSlotId}
        />
      ))}
    </VStack>
  );

  const workoutPane = (
    <div style={styles.workoutScroll}>
      <div style={styles.workoutColumn}>
        <VStack gap={3}>
          {isSinglePane && (
            // <=900px: the routine rail collapses into a chip strip with
            // the same selection behavior; horizontal scroll is contained
            // here so the page itself never pans.
            <div style={styles.chipStrip} role="group" aria-label="Routine">
              {slots.map(slot => {
                const info = CATALOG[slot.exerciseId];
                const doneCount = slot.sets.filter(set => set.done).length;
                const isComplete =
                  doneCount === slot.sets.length && slot.sets.length > 0;
                const isActive = slot.slotId === activeSlotId;
                return (
                  <button
                    key={slot.slotId}
                    type="button"
                    style={isActive ? styles.chipActive : styles.chip}
                    aria-pressed={isActive}
                    onClick={() => setActiveSlotId(slot.slotId)}>
                    <Icon
                      icon={isComplete ? CircleCheckIcon : CircleIcon}
                      size="sm"
                      color={isComplete ? 'success' : 'secondary'}
                    />
                    {info.name} · {doneCount}/{slot.sets.length}
                  </button>
                );
              })}
            </div>
          )}
          {workoutBlocks}
        </VStack>
      </div>
    </div>
  );

  const statsPane = (
    <div style={styles.workoutScroll}>
      <div style={styles.workoutColumn}>
        <VStack gap={4}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={HistoryIcon} size="sm" color="secondary" />
              <Heading level={2}>Routine</Heading>
            </HStack>
            <RoutineList
              slots={slots}
              activeSlotId={activeSlotId}
              onSelect={slotId => {
                setActiveSlotId(slotId);
                setPane('workout');
              }}
            />
          </VStack>
          <Divider />
          <StatsStack slots={slots} />
        </VStack>
      </div>
    </div>
  );

  // ---- header ----

  const paneToggle: ReactNode =
    isSinglePane && phase === 'active' ? (
      <SegmentedControl
        label="Active pane"
        value={pane}
        onChange={value => setPane(value as Pane)}
        size="sm">
        <SegmentedControlItem
          value="workout"
          label="Workout"
          icon={<Icon icon={DumbbellIcon} size="sm" color="inherit" />}
        />
        <SegmentedControlItem
          value="stats"
          label="Stats"
          icon={<Icon icon={TrendingUpIcon} size="sm" color="inherit" />}
        />
      </SegmentedControl>
    ) : null;

  const header = (
    <LayoutHeader hasDivider>
      {/* Phone tier: the row wraps so timer chips and Finish drop under
          the title instead of clipping at 375px. */}
      <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
        <Icon icon={DumbbellIcon} size="md" color="secondary" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={1}>Push Day A</Heading>
            <Text type="supporting" color="secondary">
              Wed, July 2 · last run Sat, June 28
            </Text>
          </VStack>
        </StackItem>
        <div style={styles.timerChip}>
          <Icon icon={TimerIcon} size="sm" color="secondary" />
          {formatClock(elapsedSeconds)}
        </div>
        {restRemaining !== null && phase === 'active' && (
          <div style={styles.restChip}>
            <Icon icon={TimerIcon} size="sm" color="secondary" />
            <span aria-label={\`Resting after \${restLabel}\`}>
              Rest {formatClock(restRemaining)}
            </span>
            <IconButton
              label="Add 30 seconds of rest"
              tooltip="+30s"
              size="sm"
              variant="ghost"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              onClick={() =>
                setRestRemaining(previous =>
                  previous === null ? null : previous + 30,
                )
              }
            />
            <Button
              label="Skip"
              variant="ghost"
              size="sm"
              onClick={() => setRestRemaining(null)}
            />
          </div>
        )}
        {paneToggle}
        {phase === 'active' ? (
          <Button
            label="Finish workout"
            variant="primary"
            size={isPhone ? 'md' : 'sm'}
            icon={<Icon icon={FlagIcon} size="sm" color="inherit" />}
            // Phone tier: icon-only, but never unlabeled — tooltip plus
            // the label prop keep it announced and tappable.
            isIconOnly={isPhone}
            tooltip={isPhone ? 'Finish workout' : undefined}
            onClick={finishSession}
          />
        ) : (
          <Button
            label="Resume"
            variant="secondary"
            size={isPhone ? 'md' : 'sm'}
            icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
            onClick={resumeSession}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ---- swap dialog ----

  const swapDialog =
    swapSlot !== undefined ? (
      <Dialog
        isOpen
        onOpenChange={open => {
          if (!open) {
            setSwapSlotId(null);
          }
        }}
        purpose="form"
        width="min(480px, 92vw)">
        <Layout
          header={
            <DialogHeader
              title={\`Swap \${CATALOG[swapSlot.exerciseId].name}\`}
              subtitle="Logged sets carry over to the substitute."
              onOpenChange={open => {
                if (!open) {
                  setSwapSlotId(null);
                }
              }}
            />
          }
          content={
            <LayoutContent>
              <VStack gap={2}>
                {(SUBSTITUTES[swapSlot.exerciseId] ?? []).map(candidateId => {
                  const candidate = CATALOG[candidateId];
                  const previous = bestE1RM(LAST_SESSION[candidateId] ?? []);
                  return (
                    <button
                      key={candidateId}
                      type="button"
                      style={styles.routineButton}
                      onClick={() =>
                        applySubstitution(swapSlot.slotId, candidateId)
                      }>
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={ArrowLeftRightIcon}
                          size="sm"
                          color="secondary"
                        />
                        <StackItem size="fill">
                          <VStack gap={0}>
                            <Text type="label">{candidate.name}</Text>
                            <Text type="supporting" color="secondary">
                              {candidate.muscle} · rest{' '}
                              {formatClock(candidate.restSeconds)}
                            </Text>
                          </VStack>
                        </StackItem>
                        <Badge
                          variant="neutral"
                          label={
                            previous > 0
                              ? \`last e1RM \${formatNumber(previous)} lb\`
                              : 'no history'
                          }
                        />
                      </HStack>
                    </button>
                  );
                })}
                <Text type="supporting" color="secondary">
                  Ghost values only render for lifts with June 28 history;
                  substitutes without history show em dashes until logged.
                </Text>
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    ) : null;

  // ---- frame ----

  return (
    <Layout
      height="fill"
      header={header}
      start={
        isSinglePane || phase === 'finished' ? undefined : (
          <LayoutPanel width={260} padding={0} hasDivider label="Routine">
            <div style={styles.railScroll}>
              <VStack gap={2}>
                <Text type="label" color="secondary">
                  Routine · 5 exercises
                </Text>
                <RoutineList
                  slots={slots}
                  activeSlotId={activeSlotId}
                  onSelect={setActiveSlotId}
                />
              </VStack>
            </div>
          </LayoutPanel>
        )
      }
      end={
        isSinglePane || phase === 'finished' ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Live stats">
            <div style={styles.railScroll}>
              <StatsStack slots={slots} />
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {phase === 'finished' ? (
            <SessionSummary
              slots={slots}
              elapsedSeconds={elapsedSeconds}
              onResume={resumeSession}
              onSave={saveSession}
            />
          ) : activePane === 'workout' ? (
            workoutPane
          ) : (
            statsPane
          )}
          {swapDialog}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};