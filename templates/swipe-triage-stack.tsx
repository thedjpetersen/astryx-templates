// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file swipe-triage-stack.tsx
 * @input Deterministic fixtures only (24 screenshot-cleanup candidates, each
 *   with an id, a token-driven SVG-gradient thumbnail scene — window, chat,
 *   chart, or terminal vignette over one of six gradient pairs — a filename,
 *   a size in MB, and a pre-formatted age label; the session opens mid-way by
 *   replaying 5 seeded verdicts through the same pure reducer, so the header
 *   reads "5 of 24" with a 3 kept / 2 discarded tally and a full undo
 *   history — no clocks, no randomness, no network assets)
 * @output Swipe triage stack: a gesture-quality card stack for cleaning up a
 *   screenshots folder. The top card follows the pointer 1:1 (raw pointer
 *   events with capture, translate + proportional rotate about the bottom
 *   edge) while KEEP / DISCARD verdict stamps tint progressively as the drag
 *   approaches the ±110px decision threshold and the two cards beneath peek
 *   out with scaled-down offsets. Releasing inside the threshold springs the
 *   card back with a cubic-bezier overshoot; releasing beyond it flings the
 *   card off-canvas along its extrapolated exit vector and promotes the
 *   stack with a depth-staggered settle. Keep / Later / Discard buttons and
 *   the ← ↓ → arrow keys drive the exact same commit path as the gesture —
 *   same fling, same reducer transition — so the surface is fully operable
 *   without dragging. Every decision appends to an undoable history rail
 *   with a live kept/discarded tally and reclaimed-MB counter, and undo (U,
 *   header IconButton, or rail button) replays the card back onto the stack
 *   along its exit vector in reverse. Emptying the stack renders a summary
 *   Card with a kept/discarded breakdown bar, the total space reclaimed, a
 *   "Re-check discarded" requeue round, and a full restart.
 * @position Page template; emitted by `astryx template swipe-triage-stack`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session strip
 * (images icon + title, "5 of 24" progress counter + bar, kept/discarded
 * tally Badges, undo IconButton). LayoutPanel end 300 hosts the scrollable
 * decision-history rail (tally stats, reclaimed MB, newest-first decision
 * rows with mini thumbnails). LayoutContent (padding 0) is a muted backdrop
 * that centers the 340px stack frame, the verdict button row, and the Kbd
 * hint line. Choose over flashcard-review-session when items are dispatched
 * by a spatial swipe verdict rather than graded and re-queued; choose over
 * gallery/list templates when the surface is a one-item-at-a-time
 * keep-or-toss loop with release physics, not a browse grid.
 *
 * Responsive contract:
 * - >640px: header strip | stage (fill, stack frame maxWidth 340 centered) |
 *   history rail 300 (fixed, scrolls vertically). Kbd hints (← ↓ → / U)
 *   render under the button row; verdict buttons are 44px tall.
 * - <=640px: the history rail hides and the tally collapses into the header
 *   as compact kept/discarded Badges (the reclaimed-MB stat moves onto the
 *   summary card and the action-note line), the header drops the ProgressBar
 *   and subtitle, the stack owns the viewport (frame height min(58vh,
 *   460px)), the verdict buttons grow to 48px full-width grid cells, the
 *   undo IconButton grows to a 40px touch target, and the Kbd hint line
 *   hides. Swiping and the buttons stay pointer-first — keyboard shortcuts
 *   are an enhancement, never the only path; nothing is hover-only.
 * - The stage scrolls vertically when the viewport is short; overflowX is
 *   deliberately hidden so off-canvas flings never spawn a horizontal
 *   scrollbar.
 *
 * Container policy (triage-loop archetype): the page chrome is frame-first
 * rows and panels; the swipe cards are hand-rolled shells (border, radius,
 * shadow tokens) because they need full transform ownership, while Astryx
 * Cards are reserved for the end-of-session summary. The history rail is
 * plain rows with Badges; the summary breakdown bar is plain flex divs over
 * semantic color tokens — no chart engine, no drag library.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair (verdict tints
 * and stamps are light-dark() pairs over --color-success / --color-error so
 * the red/green semantics survive dark mode). Motion: flings, snap-backs,
 * and staggered settles are CSS transitions; prefers-reduced-motion swaps
 * every one of them for opacity crossfades or instant reflow.
 */

import {useEffect, useState, type CSSProperties} from 'react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  ClockIcon,
  HistoryIcon,
  ImagesIcon,
  RepeatIcon,
  RotateCcwIcon,
  SparklesIcon,
  Trash2Icon,
  Undo2Icon,
} from 'lucide-react';

// ============= MOTION CONSTANTS =============
// The craft bar: threshold, snap-back, and fling must read as one motion.

/** Horizontal drag distance (px) at which release commits a verdict. */
const SWIPE_THRESHOLD = 110;
/** Degrees of card rotation per horizontal pixel dragged. */
const ROTATE_FACTOR = 0.08;
/** Rotation clamp so extreme drags never cartwheel the card. */
const MAX_ROTATE = 16;
/** How far off-canvas a committed card travels horizontally. */
const EXIT_X = 560;
/** Downward travel for a "Later" (skip to back) commit. */
const EXIT_SKIP_Y = 300;

const FLING_MS = 460;
const SNAP_MS = 420;
const SETTLE_MS = 340;
const STAGGER_MS = 60;
const FADE_MS = 200;

/** Overshoot ease: the snap-back visibly springs past center and returns. */
const SNAP_EASE = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
/** Fling ease: fast launch, gentle tail as the card leaves the canvas. */
const FLING_EASE = 'cubic-bezier(0.3, 0.65, 0.45, 1)';
/** Settle ease for the staggered stack promotion. */
const SETTLE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  // Muted backdrop; scrolls vertically when short, clips horizontal flings.
  stageBackdrop: {
    height: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
  },
  // <=640px: tighter gutters so the stack owns the 375px viewport.
  stageBackdropCompact: {padding: 'var(--spacing-3)'},
  stageColumn: {
    width: '100%',
    maxWidth: 380,
    marginInline: 'auto',
    marginBlock: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // The stack frame: cards render absolute inside; peeked depths poke out
  // the bottom, so the frame reserves their offset headroom.
  stackFrame: {
    position: 'relative',
    width: '100%',
    maxWidth: 340,
    height: 470,
    marginInline: 'auto',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  stackFrameCompact: {height: 'min(58vh, 460px)'},
  stackCard: {
    position: 'absolute',
    inset: 0,
  },
  // Hand-rolled card shell: the swipe card needs full transform ownership,
  // so the surface is built from border/radius/shadow tokens directly.
  cardShell: {
    position: 'relative',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-med)',
    overflow: 'hidden',
  },
  cardShellLifted: {boxShadow: 'var(--shadow-high)'},
  thumbBox: {
    flex: '1 1 auto',
    minHeight: 0,
    overflow: 'hidden',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  thumbSvg: {display: 'block', width: '100%', height: '100%'},
  metaBox: {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-3)',
  },
  // Progressive verdict tint: opacity is driven by drag progress.
  tintOverlay: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'var(--radius-container)',
    pointerEvents: 'none',
  },
  // Rubber-stamp verdict badges; rotation + scale pop as the drag arms.
  stamp: {
    position: 'absolute',
    top: 18,
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: '3px solid',
    borderRadius: 'var(--radius-element)',
    fontSize: 20,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
  },
  stampKeep: {left: 16},
  stampDiscard: {right: 16},
  stampSkip: {left: '50%', top: 22},
  dragSurface: {
    position: 'absolute',
    inset: 0,
    touchAction: 'none',
    cursor: 'grab',
  },
  dragSurfaceActive: {cursor: 'grabbing'},
  // Verdict button row: Discard | Later | Keep; ~44px, 48px at <=640px.
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: 'var(--spacing-2)',
    width: '100%',
    maxWidth: 340,
    marginInline: 'auto',
  },
  actionButton: {width: '100%', height: 44},
  actionButtonCompact: {width: '100%', height: 48},
  hintRow: {flexWrap: 'wrap'},
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  headerBarBox: {width: 140},
  headerTapTarget: {width: 40, height: 40},
  // History rail: the panel is fixed at 300px, only the contents scroll.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  railThumb: {
    width: 44,
    height: 28,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  railStatBox: {
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    minWidth: 0,
  },
  railStatValue: {
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1.2,
    fontVariantNumeric: 'tabular-nums',
  },
  // Summary breakdown: plain flex segments over semantic color tokens.
  breakdownBar: {
    display: 'flex',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  legendRow: {flexWrap: 'wrap'},
  summaryActions: {flexWrap: 'wrap'},
};

// ============= VERDICTS =============

type Verdict = 'keep' | 'discard' | 'skip';

interface VerdictMeta {
  label: string;
  pastLabel: string;
  stampLabel: string;
  badgeVariant: 'success' | 'error' | 'neutral';
  buttonVariant: 'primary' | 'destructive' | 'ghost';
  /**
   * Stamp ink: light-dark() pair over the semantic token so the green/red
   * verdict reads on both a light and a dark card surface.
   */
  stampColor: string;
  /** Progressive card tint behind the stamp; light-dark() over tokens. */
  tint: string;
  /** Solid segment color for the summary breakdown bar. */
  barColor: string;
}

const VERDICT_META: Record<Verdict, VerdictMeta> = {
  keep: {
    label: 'Keep',
    pastLabel: 'Kept',
    stampLabel: 'Keep',
    badgeVariant: 'success',
    buttonVariant: 'primary',
    stampColor:
      'light-dark(var(--color-success), color-mix(in srgb, var(--color-success) 72%, var(--color-text-primary)))',
    tint: 'light-dark(color-mix(in srgb, var(--color-success) 14%, transparent), color-mix(in srgb, var(--color-success) 26%, transparent))',
    barColor: 'var(--color-success)',
  },
  discard: {
    label: 'Discard',
    pastLabel: 'Discarded',
    stampLabel: 'Discard',
    badgeVariant: 'error',
    buttonVariant: 'destructive',
    stampColor:
      'light-dark(var(--color-error), color-mix(in srgb, var(--color-error) 72%, var(--color-text-primary)))',
    tint: 'light-dark(color-mix(in srgb, var(--color-error) 14%, transparent), color-mix(in srgb, var(--color-error) 26%, transparent))',
    barColor: 'var(--color-error)',
  },
  skip: {
    label: 'Later',
    pastLabel: 'Deferred',
    stampLabel: 'Later',
    badgeVariant: 'neutral',
    buttonVariant: 'ghost',
    stampColor:
      'light-dark(var(--color-accent), color-mix(in srgb, var(--color-accent) 72%, var(--color-text-primary)))',
    tint: 'light-dark(color-mix(in srgb, var(--color-accent) 12%, transparent), color-mix(in srgb, var(--color-accent) 22%, transparent))',
    barColor: 'var(--color-accent)',
  },
};

// ============= DATA =============
// Deterministic fixtures: 24 screenshot-cleanup candidates. Thumbnails are
// token-driven SVG gradient scenes — no image assets, no randomness.

type SceneKind = 'window' | 'chat' | 'chart' | 'terminal';

interface Candidate {
  id: string;
  filename: string;
  sizeMb: number;
  /** Pre-formatted age label — deterministic fixture, no clocks. */
  age: string;
  /** Index into GRADIENTS for the thumbnail backdrop. */
  gradient: number;
  /** Which vignette is drawn over the gradient. */
  scene: SceneKind;
}

/**
 * Six gradient pairs, all color-mix() over semantic tokens so the wallpaper
 * hues track the active scheme instead of hardcoding hex stops.
 */
const GRADIENTS: Array<{from: string; to: string}> = [
  {
    from: 'color-mix(in srgb, var(--color-accent) 85%, var(--color-background-body))',
    to: 'color-mix(in srgb, var(--color-accent) 30%, var(--color-background-body))',
  },
  {
    from: 'color-mix(in srgb, var(--color-success) 70%, var(--color-background-body))',
    to: 'color-mix(in srgb, var(--color-accent) 45%, var(--color-background-body))',
  },
  {
    from: 'color-mix(in srgb, var(--color-warning) 75%, var(--color-background-body))',
    to: 'color-mix(in srgb, var(--color-error) 40%, var(--color-background-body))',
  },
  {
    from: 'color-mix(in srgb, var(--color-error) 55%, var(--color-background-body))',
    to: 'color-mix(in srgb, var(--color-accent) 55%, var(--color-background-body))',
  },
  {
    from: 'color-mix(in srgb, var(--color-accent) 55%, var(--color-success))',
    to: 'color-mix(in srgb, var(--color-background-body) 70%, var(--color-accent))',
  },
  {
    from: 'color-mix(in srgb, var(--color-warning) 60%, var(--color-background-body))',
    to: 'color-mix(in srgb, var(--color-success) 45%, var(--color-background-body))',
  },
];

const CANDIDATES: Candidate[] = [
  {
    id: 'shot-01',
    filename: 'Screenshot 2026-06-02 at 09.41.17.png',
    sizeMb: 3.1,
    age: '4 wk old',
    gradient: 0,
    scene: 'window',
  },
  {
    id: 'shot-02',
    filename: 'Screenshot 2026-05-28 at 14.03.52.png',
    sizeMb: 2.4,
    age: '5 wk old',
    gradient: 1,
    scene: 'chat',
  },
  {
    id: 'shot-03',
    filename: 'CleanShot 2026-05-19 at 11.22.08@2x.png',
    sizeMb: 5.6,
    age: '6 wk old',
    gradient: 2,
    scene: 'chart',
  },
  {
    id: 'shot-04',
    filename: 'SCR-20260511-kmpq.png',
    sizeMb: 1.2,
    age: '7 wk old',
    gradient: 3,
    scene: 'terminal',
  },
  {
    id: 'shot-05',
    filename: 'Screenshot 2026-05-04 at 16.48.33.png',
    sizeMb: 3.8,
    age: '8 wk old',
    gradient: 4,
    scene: 'window',
  },
  {
    id: 'shot-06',
    filename: 'Simulator Screen Shot - iPhone 15 - 2026-04-27.png',
    sizeMb: 2.9,
    age: '2 mo old',
    gradient: 5,
    scene: 'chat',
  },
  {
    id: 'shot-07',
    filename: 'Screenshot 2026-04-20 at 10.15.09.png',
    sizeMb: 4.4,
    age: '2 mo old',
    gradient: 0,
    scene: 'chart',
  },
  {
    id: 'shot-08',
    filename: 'CleanShot 2026-04-11 at 18.05.44@2x.png',
    sizeMb: 6.2,
    age: '3 mo old',
    gradient: 1,
    scene: 'terminal',
  },
  {
    id: 'shot-09',
    filename: 'Screenshot 2026-03-30 at 08.52.26.png',
    sizeMb: 1.7,
    age: '3 mo old',
    gradient: 2,
    scene: 'window',
  },
  {
    id: 'shot-10',
    filename: 'SCR-20260322-hxvt.png',
    sizeMb: 0.9,
    age: '3 mo old',
    gradient: 3,
    scene: 'chat',
  },
  {
    id: 'shot-11',
    filename: 'Screenshot 2026-03-14 at 13.37.58.png',
    sizeMb: 2.2,
    age: '4 mo old',
    gradient: 4,
    scene: 'chart',
  },
  {
    id: 'shot-12',
    filename: 'Screen Recording frame 2026-03-02.png',
    sizeMb: 3.5,
    age: '4 mo old',
    gradient: 5,
    scene: 'terminal',
  },
  {
    id: 'shot-13',
    filename: 'Screenshot 2026-02-21 at 17.29.41.png',
    sizeMb: 4.9,
    age: '4 mo old',
    gradient: 0,
    scene: 'window',
  },
  {
    id: 'shot-14',
    filename: 'CleanShot 2026-02-10 at 09.58.12@2x.png',
    sizeMb: 5.1,
    age: '5 mo old',
    gradient: 1,
    scene: 'chat',
  },
  {
    id: 'shot-15',
    filename: 'Screenshot 2026-01-29 at 11.44.03.png',
    sizeMb: 1.4,
    age: '5 mo old',
    gradient: 2,
    scene: 'chart',
  },
  {
    id: 'shot-16',
    filename: 'SCR-20260117-qwld.png',
    sizeMb: 0.8,
    age: '6 mo old',
    gradient: 3,
    scene: 'terminal',
  },
  {
    id: 'shot-17',
    filename: 'Screenshot 2026-01-05 at 15.21.36.png',
    sizeMb: 2.6,
    age: '6 mo old',
    gradient: 4,
    scene: 'window',
  },
  {
    id: 'shot-18',
    filename: 'Simulator Screen Shot - iPad Pro - 2025-12-19.png',
    sizeMb: 3.3,
    age: '7 mo old',
    gradient: 5,
    scene: 'chat',
  },
  {
    id: 'shot-19',
    filename: 'Screenshot 2025-12-08 at 10.02.55.png',
    sizeMb: 4.1,
    age: '7 mo old',
    gradient: 0,
    scene: 'chart',
  },
  {
    id: 'shot-20',
    filename: 'CleanShot 2025-11-24 at 13.16.27@2x.png',
    sizeMb: 5.8,
    age: '7 mo old',
    gradient: 1,
    scene: 'terminal',
  },
  {
    id: 'shot-21',
    filename: 'Screenshot 2025-11-09 at 09.33.14.png',
    sizeMb: 1.9,
    age: '8 mo old',
    gradient: 2,
    scene: 'window',
  },
  {
    id: 'shot-22',
    filename: 'SCR-20251028-bnrf.png',
    sizeMb: 1.1,
    age: '8 mo old',
    gradient: 3,
    scene: 'chat',
  },
  {
    id: 'shot-23',
    filename: 'Screenshot 2025-10-12 at 19.47.02.png',
    sizeMb: 2.8,
    age: '9 mo old',
    gradient: 4,
    scene: 'chart',
  },
  {
    id: 'shot-24',
    filename: 'Screenshot 2025-09-30 at 12.10.48.png',
    sizeMb: 3.6,
    age: '9 mo old',
    gradient: 5,
    scene: 'terminal',
  },
];

const TOTAL_CANDIDATES = CANDIDATES.length; // 24

const CANDIDATE_BY_ID = new Map(CANDIDATES.map(item => [item.id, item]));

function getCandidate(id: string): Candidate {
  const candidate = CANDIDATE_BY_ID.get(id);
  if (!candidate) {
    throw new Error(`Unknown candidate id: ${id}`);
  }
  return candidate;
}

function formatMb(value: number): string {
  return `${(Math.round(value * 10) / 10).toFixed(1)} MB`;
}

// ============= TRIAGE REDUCER =============

interface Decision {
  id: string;
  verdict: Verdict;
}

interface TriageState {
  /** Remaining candidate ids; the front of the array is the top card. */
  stack: string[];
  /** Every verdict this round, in order — drives the rail and tallies. */
  log: Decision[];
  /** Pre-verdict stack snapshots; popping one reverses any decision. */
  undoStack: string[][];
}

/**
 * Pure verdict reducer shared by the gesture release, the verdict buttons,
 * the arrow keys, AND the module-scope seed replay below — one commit path,
 * every caller. Keep/discard dequeue the top card; Later sends it to the
 * back of the stack.
 */
function applyVerdict(state: TriageState, verdict: Verdict): TriageState {
  const top = state.stack[0];
  if (top == null) {
    return state;
  }
  const rest = state.stack.slice(1);
  const stack = verdict === 'skip' ? [...rest, top] : rest;
  return {
    stack,
    log: [...state.log, {id: top, verdict}],
    undoStack: [...state.undoStack, state.stack],
  };
}

/**
 * 5 pre-session verdicts so the surface opens mid-triage: the header reads
 * "5 of 24", the rail already tallies 3 kept / 2 discarded with reclaimed
 * MB, and every seeded decision is undoable through the same snapshots.
 */
const SEED_VERDICTS: Verdict[] = ['keep', 'discard', 'keep', 'keep', 'discard'];

function buildSeededState(): TriageState {
  let state: TriageState = {
    stack: CANDIDATES.map(item => item.id),
    log: [],
    undoStack: [],
  };
  for (const verdict of SEED_VERDICTS) {
    state = applyVerdict(state, verdict);
  }
  return state;
}

const SEEDED_STATE = buildSeededState();

const INITIAL_ACTION_NOTE =
  'Resuming — 5 screenshots were triaged earlier. Drag the card, tap a button, or press ← / →.';

// ============= MOTION HELPERS =============

interface ExitVector {
  x: number;
  y: number;
  rot: number;
}

interface DragState {
  pointerId: number;
  originX: number;
  originY: number;
  dx: number;
  dy: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dragRotation(dx: number): number {
  return clamp(dx * ROTATE_FACTOR, -MAX_ROTATE, MAX_ROTATE);
}

/**
 * Where a committed card flies. A gesture release extrapolates the card's
 * current drag vector off-canvas so the fling continues the hand's motion;
 * a button/key commit synthesizes the canonical vector for that verdict —
 * the state transition is identical either way.
 */
function exitVector(verdict: Verdict, drag: DragState | null): ExitVector {
  if (verdict === 'skip') {
    return {x: 0, y: EXIT_SKIP_Y, rot: 0};
  }
  const direction = verdict === 'keep' ? 1 : -1;
  if (drag && Math.abs(drag.dx) > 24) {
    const scale = EXIT_X / Math.abs(drag.dx);
    return {
      x: direction * EXIT_X,
      y: clamp(drag.dy * scale, -180, 180),
      rot: direction * (MAX_ROTATE + 8),
    };
  }
  return {x: direction * EXIT_X, y: -36, rot: direction * (MAX_ROTATE + 8)};
}

/** Depth transforms for the peeked cards + the staggered promotion settle. */
function depthStyle(depth: number, isReducedMotion: boolean): CSSProperties {
  return {
    transform: `translateY(${depth * 16}px) scale(${1 - depth * 0.05})`,
    opacity: depth >= 3 ? 0 : 1,
    zIndex: 20 - depth,
    transition: isReducedMotion
      ? 'none'
      : `transform ${SETTLE_MS}ms ${SETTLE_EASE} ${depth * STAGGER_MS}ms, ` +
        `opacity ${SETTLE_MS}ms ease ${depth * STAGGER_MS}ms`,
  };
}

type MotionPhase = 'start' | 'run';

interface OutgoingCard {
  candidate: Candidate;
  verdict: Verdict;
  from: ExitVector;
  to: ExitVector;
  phase: MotionPhase;
}

interface IncomingCard {
  id: string;
  verdict: Verdict;
  from: ExitVector;
  phase: MotionPhase;
}

// ============= THUMBNAIL ART =============
// Token-driven SVG vignettes standing in for screenshot pixels. Overlay
// fills mix over --color-background-card so the fake windows render as
// light-mode screenshots in light scheme and dark-mode ones in dark.

const SCENE_GLASS = 'color-mix(in srgb, var(--color-background-card) 88%, transparent)';
const SCENE_GLASS_SOFT = 'color-mix(in srgb, var(--color-background-card) 55%, transparent)';
const SCENE_INK = 'color-mix(in srgb, var(--color-text-secondary) 65%, transparent)';
const SCENE_ACCENT = 'color-mix(in srgb, var(--color-accent) 55%, var(--color-background-card))';
// Terminal panel stays dark in both schemes (a terminal is a scheme-locked
// surface); the pair keeps it legible over either gradient.
const SCENE_PANEL =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 88%, transparent), color-mix(in srgb, var(--color-background-body) 68%, transparent))';
const SCENE_PROMPT = 'color-mix(in srgb, var(--color-success) 85%, transparent)';

function SceneShapes({scene}: {scene: SceneKind}) {
  switch (scene) {
    case 'window':
      return (
        <g>
          <rect x={24} y={26} width={272} height={148} rx={10} fill={SCENE_GLASS} />
          <rect x={24} y={26} width={272} height={26} rx={10} fill={SCENE_GLASS_SOFT} />
          <circle cx={40} cy={39} r={4} fill={SCENE_INK} />
          <circle cx={54} cy={39} r={4} fill={SCENE_INK} />
          <circle cx={68} cy={39} r={4} fill={SCENE_INK} />
          <rect x={40} y={68} width={150} height={10} rx={5} fill={SCENE_INK} />
          <rect x={40} y={90} width={220} height={8} rx={4} fill={SCENE_INK} opacity={0.55} />
          <rect x={40} y={106} width={196} height={8} rx={4} fill={SCENE_INK} opacity={0.55} />
          <rect x={40} y={132} width={88} height={26} rx={7} fill={SCENE_ACCENT} />
        </g>
      );
    case 'chat':
      return (
        <g>
          <rect x={36} y={30} width={160} height={34} rx={17} fill={SCENE_GLASS} />
          <rect x={36} y={72} width={124} height={30} rx={15} fill={SCENE_GLASS} />
          <rect x={140} y={112} width={144} height={34} rx={17} fill={SCENE_ACCENT} />
          <rect x={196} y={154} width={88} height={28} rx={14} fill={SCENE_ACCENT} />
        </g>
      );
    case 'chart':
      return (
        <g>
          <rect x={44} y={128} width={28} height={44} rx={5} fill={SCENE_GLASS} />
          <rect x={92} y={104} width={28} height={68} rx={5} fill={SCENE_GLASS} />
          <rect x={140} y={120} width={28} height={52} rx={5} fill={SCENE_GLASS} />
          <rect x={188} y={80} width={28} height={92} rx={5} fill={SCENE_GLASS} />
          <rect x={236} y={96} width={28} height={76} rx={5} fill={SCENE_GLASS} />
          <polyline
            points="44,116 106,88 154,104 202,60 250,76 284,48"
            fill="none"
            stroke={SCENE_INK}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case 'terminal':
      return (
        <g>
          <rect x={28} y={30} width={264} height={140} rx={9} fill={SCENE_PANEL} />
          <rect x={44} y={50} width={96} height={8} rx={4} fill={SCENE_PROMPT} />
          <rect x={44} y={68} width={180} height={8} rx={4} fill={SCENE_GLASS_SOFT} />
          <rect x={44} y={86} width={152} height={8} rx={4} fill={SCENE_GLASS_SOFT} />
          <rect x={44} y={104} width={204} height={8} rx={4} fill={SCENE_GLASS_SOFT} />
          <rect x={44} y={130} width={72} height={8} rx={4} fill={SCENE_PROMPT} />
          <rect x={122} y={130} width={10} height={12} fill={SCENE_PROMPT} />
        </g>
      );
  }
}

/**
 * The gradient thumbnail. `idPrefix` keeps <linearGradient> ids unique when
 * the same candidate renders in the stack and the history rail at once.
 */
function ThumbnailArt({
  candidate,
  idPrefix,
}: {
  candidate: Candidate;
  idPrefix: string;
}) {
  const gradient = GRADIENTS[candidate.gradient % GRADIENTS.length];
  const gradientId = `${idPrefix}-${candidate.id}-grad`;
  return (
    <svg
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      style={styles.thumbSvg}
      role="img"
      aria-label={`Thumbnail of ${candidate.filename}`}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradient.from} />
          <stop offset="100%" stopColor={gradient.to} />
        </linearGradient>
      </defs>
      <rect width={320} height={200} fill={`url(#${gradientId})`} />
      <SceneShapes scene={candidate.scene} />
    </svg>
  );
}

// ============= CARD FACE =============

function stampPlacement(verdict: Verdict): CSSProperties {
  switch (verdict) {
    case 'keep':
      return styles.stampKeep;
    case 'discard':
      return styles.stampDiscard;
    case 'skip':
      return styles.stampSkip;
  }
}

function stampTransform(verdict: Verdict, progress: number): string {
  const pop = 0.85 + 0.25 * clamp(progress, 0, 1);
  switch (verdict) {
    case 'keep':
      return `rotate(-9deg) scale(${pop})`;
    case 'discard':
      return `rotate(9deg) scale(${pop})`;
    case 'skip':
      return `translateX(-50%) rotate(-3deg) scale(${pop})`;
  }
}

/**
 * One card surface: gradient thumbnail on top, filename + size/age meta
 * below, plus the progressive verdict tint and rubber-stamp overlay. Used
 * identically by the interactive top card, the peeked depths, the outgoing
 * fling clone, and (at mini scale) nowhere else — the rail draws its own
 * compact rows.
 */
function CardFace({
  candidate,
  stampVerdict,
  progress,
  isArmed,
  isLifted,
  position,
}: {
  candidate: Candidate;
  stampVerdict: Verdict | null;
  progress: number;
  isArmed: boolean;
  isLifted: boolean;
  position: string;
}) {
  const meta = stampVerdict == null ? null : VERDICT_META[stampVerdict];
  return (
    <div
      style={
        isLifted ? {...styles.cardShell, ...styles.cardShellLifted} : styles.cardShell
      }>
      <div style={styles.thumbBox}>
        <ThumbnailArt candidate={candidate} idPrefix="card" />
      </div>
      <div style={styles.metaBox}>
        <Text type="label" maxLines={1}>
          {candidate.filename}
        </Text>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatMb(candidate.sizeMb)} · {candidate.age}
          </Text>
          <StackItem size="fill">
            <span />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {position}
          </Text>
        </HStack>
      </div>
      {meta != null && (
        <>
          <div
            aria-hidden
            style={{
              ...styles.tintOverlay,
              backgroundColor: meta.tint,
              opacity: clamp(progress, 0, 1),
            }}
          />
          <div
            aria-hidden
            style={{
              ...styles.stamp,
              ...stampPlacement(stampVerdict as Verdict),
              color: meta.stampColor,
              borderColor: meta.stampColor,
              opacity: clamp(progress, 0, 1),
              transform: stampTransform(stampVerdict as Verdict, progress),
              backgroundColor: isArmed ? meta.tint : 'transparent',
            }}>
            {meta.stampLabel}
          </div>
        </>
      )}
    </div>
  );
}

// ============= HISTORY RAIL PIECES =============

function TallyStat({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.railStatBox}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <span style={styles.railStatValue}>{value}</span>
    </div>
  );
}

function DecisionRow({decision}: {decision: Decision}) {
  const candidate = getCandidate(decision.id);
  const meta = VERDICT_META[decision.verdict];
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.railThumb} aria-hidden>
        <ThumbnailArt candidate={candidate} idPrefix="rail" />
      </div>
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="supporting" maxLines={1}>
            {candidate.filename}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatMb(candidate.sizeMb)} · {candidate.age}
          </Text>
        </VStack>
      </StackItem>
      <Badge label={meta.pastLabel} variant={meta.badgeVariant} />
    </HStack>
  );
}

/** Kept/discarded segments of the summary breakdown bar + legend. */
function VerdictBreakdown({log}: {log: Decision[]}) {
  const finalVerdicts: Verdict[] = ['keep', 'discard'];
  const counts = finalVerdicts.map(verdict => ({
    verdict,
    count: log.filter(entry => entry.verdict === verdict).length,
  }));
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  return (
    <VStack gap={2}>
      <div style={styles.eyebrow}>Verdicts · {total} decisions</div>
      <div style={styles.breakdownBar} role="img" aria-label="Kept versus discarded breakdown">
        {counts
          .filter(({count}) => count > 0)
          .map(({verdict, count}) => (
            <div
              key={verdict}
              title={`${VERDICT_META[verdict].pastLabel}: ${count}`}
              style={{
                width: `${(count / Math.max(1, total)) * 100}%`,
                backgroundColor: VERDICT_META[verdict].barColor,
              }}
            />
          ))}
      </div>
      <HStack gap={3} vAlign="center" style={styles.legendRow}>
        {counts.map(({verdict, count}) => (
          <HStack key={verdict} gap={1} vAlign="center">
            <span
              aria-hidden
              style={{
                ...styles.legendDot,
                backgroundColor: VERDICT_META[verdict].barColor,
              }}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {VERDICT_META[verdict].pastLabel} {count}
            </Text>
          </HStack>
        ))}
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function SwipeTriageStackTemplate() {
  const [session, setSession] = useState<TriageState>(SEEDED_STATE);
  const [roundTotal, setRoundTotal] = useState(TOTAL_CANDIDATES);
  const [round, setRound] = useState(1);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapFade, setSnapFade] = useState<MotionPhase | null>(null);
  const [outgoing, setOutgoing] = useState<OutgoingCard | null>(null);
  const [incoming, setIncoming] = useState<IncomingCard | null>(null);
  const [actionNote, setActionNote] = useState(INITIAL_ACTION_NOTE);

  // Responsive contract: <=640px the rail hides and the tally collapses
  // into the header; verdict buttons grow to 48px.
  const isCompact = useMediaQuery('(max-width: 640px)');
  // Reduced motion: flings and snap-backs become opacity crossfades; the
  // stack promotion settles instantly instead of staggering.
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ----- Derived session math (recomputed live from the stack/log) -----
  const topCardId = session.stack[0];
  const topCard = topCardId == null ? undefined : getCandidate(topCardId);
  const visibleCards = session.stack.slice(0, 4).map(getCandidate);
  const keptCount = session.log.filter(entry => entry.verdict === 'keep').length;
  const discardedCount = session.log.filter(
    entry => entry.verdict === 'discard',
  ).length;
  const decidedCount = roundTotal - session.stack.length;
  const reclaimedMb = session.log
    .filter(entry => entry.verdict === 'discard')
    .reduce((sum, entry) => sum + getCandidate(entry.id).sizeMb, 0);
  const canUndo = session.undoStack.length > 0;
  const isSessionDone = session.stack.length === 0;
  const isBusy = outgoing != null || incoming != null;

  const dragRot = drag == null ? 0 : dragRotation(drag.dx);
  const keepProgress = drag == null ? 0 : clamp(drag.dx / SWIPE_THRESHOLD, 0, 1);
  const discardProgress =
    drag == null ? 0 : clamp(-drag.dx / SWIPE_THRESHOLD, 0, 1);
  const dragVerdict: Verdict | null =
    drag == null || drag.dx === 0 ? null : drag.dx > 0 ? 'keep' : 'discard';
  const dragProgress = Math.max(keepProgress, discardProgress);
  const isArmed = drag != null && Math.abs(drag.dx) >= SWIPE_THRESHOLD;

  const discardedIds = session.log
    .filter(entry => entry.verdict === 'discard')
    .map(entry => entry.id);

  // ----- Shared commit path (gesture release, buttons, and arrow keys) ----
  const commitVerdict = (verdict: Verdict, gestureDrag: DragState | null) => {
    if (!topCard || isBusy) {
      return;
    }
    const from: ExitVector =
      gestureDrag == null
        ? {x: 0, y: 0, rot: 0}
        : {x: gestureDrag.dx, y: gestureDrag.dy, rot: dragRotation(gestureDrag.dx)};
    setSession(prev => applyVerdict(prev, verdict));
    setOutgoing({
      candidate: topCard,
      verdict,
      from,
      to: exitVector(verdict, gestureDrag),
      phase: 'start',
    });
    setDrag(null);
    setIsSnapping(false);
    const meta = VERDICT_META[verdict];
    setActionNote(
      verdict === 'skip'
        ? `Deferred ${topCard.filename} — it goes to the back of the stack.`
        : verdict === 'keep'
          ? `Kept ${topCard.filename}.`
          : `Discarded ${topCard.filename} — ${formatMb(topCard.sizeMb)} reclaimed (${meta.pastLabel.toLowerCase()} is undoable).`,
    );
  };

  const undoLast = () => {
    if (!canUndo || isBusy) {
      return;
    }
    const lastEntry = session.log[session.log.length - 1];
    setSession(prev => {
      const previousStack = prev.undoStack[prev.undoStack.length - 1];
      if (previousStack == null) {
        return prev;
      }
      return {
        stack: previousStack,
        log: prev.log.slice(0, -1),
        undoStack: prev.undoStack.slice(0, -1),
      };
    });
    setDrag(null);
    setIsSnapping(false);
    if (lastEntry) {
      // Replay the card back in along its exit vector, reversed.
      setIncoming({
        id: lastEntry.id,
        verdict: lastEntry.verdict,
        from: exitVector(lastEntry.verdict, null),
        phase: 'start',
      });
      setActionNote(
        `Undid ${VERDICT_META[lastEntry.verdict].pastLabel.toLowerCase()} on ${getCandidate(lastEntry.id).filename} — the card is back on top.`,
      );
    }
  };

  const restartSession = () => {
    setSession({stack: CANDIDATES.map(item => item.id), log: [], undoStack: []});
    setRoundTotal(TOTAL_CANDIDATES);
    setRound(1);
    setDrag(null);
    setIsSnapping(false);
    setOutgoing(null);
    setIncoming(null);
    setActionNote(`Fresh pass — all ${TOTAL_CANDIDATES} screenshots restacked.`);
  };

  const reviewDiscarded = () => {
    if (discardedIds.length === 0) {
      return;
    }
    setSession({stack: discardedIds, log: [], undoStack: []});
    setRoundTotal(discardedIds.length);
    setRound(prev => prev + 1);
    setDrag(null);
    setActionNote(
      `Second look — ${discardedIds.length} discarded screenshots restacked for a final check.`,
    );
  };

  // ----- Pointer gesture (capture on the top card) -----
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!topCard || isBusy || drag != null) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsSnapping(false);
    setDrag({
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      dx: 0,
      dy: 0,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const {clientX, clientY, pointerId} = event;
    setDrag(prev =>
      prev != null && prev.pointerId === pointerId
        ? {...prev, dx: clientX - prev.originX, dy: clientY - prev.originY}
        : prev,
    );
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    if (Math.abs(drag.dx) >= SWIPE_THRESHOLD) {
      // Beyond the threshold: same commit path as the buttons and keys.
      commitVerdict(drag.dx > 0 ? 'keep' : 'discard', drag);
      return;
    }
    // Inside the threshold: spring back with overshoot (or crossfade).
    setDrag(null);
    if (drag.dx !== 0 || drag.dy !== 0) {
      if (isReducedMotion) {
        setSnapFade('start');
      } else {
        setIsSnapping(true);
      }
    }
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLDivElement>) => {
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    setDrag(null);
    if (isReducedMotion) {
      setSnapFade('start');
    } else {
      setIsSnapping(true);
    }
  };

  // ----- Two-phase motion kickoffs (render at `from`, then transition) ----
  useEffect(() => {
    if (outgoing == null || outgoing.phase !== 'start') {
      return;
    }
    let rafB = 0;
    const rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        setOutgoing(prev =>
          prev != null && prev.phase === 'start' ? {...prev, phase: 'run'} : prev,
        );
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [outgoing]);

  useEffect(() => {
    if (incoming == null || incoming.phase !== 'start') {
      return;
    }
    let rafB = 0;
    const rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        setIncoming(prev =>
          prev != null && prev.phase === 'start' ? {...prev, phase: 'run'} : prev,
        );
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [incoming]);

  useEffect(() => {
    if (snapFade !== 'start') {
      return;
    }
    let rafB = 0;
    const rafA = requestAnimationFrame(() => {
      rafB = requestAnimationFrame(() => {
        setSnapFade(prev => (prev === 'start' ? 'run' : prev));
      });
    });
    return () => {
      cancelAnimationFrame(rafA);
      cancelAnimationFrame(rafB);
    };
  }, [snapFade]);

  // Safety nets: if a transitionend is swallowed (tab hidden mid-fling),
  // clear the motion states on a timer so the surface never wedges. These
  // timers are animation bookkeeping only — all content is fixture-driven.
  useEffect(() => {
    if (outgoing == null || outgoing.phase !== 'run') {
      return;
    }
    const timer = window.setTimeout(
      () => setOutgoing(null),
      (isReducedMotion ? FADE_MS : FLING_MS) + 160,
    );
    return () => window.clearTimeout(timer);
  }, [outgoing, isReducedMotion]);

  useEffect(() => {
    if (incoming == null || incoming.phase !== 'run') {
      return;
    }
    const timer = window.setTimeout(
      () => setIncoming(null),
      (isReducedMotion ? FADE_MS : FLING_MS) + 160,
    );
    return () => window.clearTimeout(timer);
  }, [incoming, isReducedMotion]);

  useEffect(() => {
    if (!isSnapping && snapFade !== 'run') {
      return;
    }
    const timer = window.setTimeout(() => {
      setIsSnapping(false);
      setSnapFade(null);
    }, SNAP_MS + 160);
    return () => window.clearTimeout(timer);
  }, [isSnapping, snapFade]);

  // Keyboard: ← discard, → keep, ↓ later, U undo — the exact same commit
  // path as the gesture and the buttons. Re-subscribes every render so the
  // handlers never close over stale stack state; text inputs keep their
  // keys.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      const isOnField =
        target != null && target.closest('input, textarea, select') != null;
      if (isOnField) {
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        commitVerdict('keep', null);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        commitVerdict('discard', null);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        commitVerdict('skip', null);
      } else if (event.key === 'u' || event.key === 'U') {
        undoLast();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ----- Top-card style (drag / snap-back / undo replay / idle) -----
  const topCardStyle = ((): CSSProperties => {
    if (drag != null) {
      return {
        transform: `translate(${drag.dx}px, ${drag.dy}px) rotate(${dragRot}deg)`,
        transformOrigin: '50% 110%',
        transition: 'none',
        zIndex: 20,
      };
    }
    if (incoming != null && topCardId === incoming.id) {
      if (isReducedMotion) {
        return {
          transform: 'translateY(0) scale(1)',
          opacity: incoming.phase === 'start' ? 0 : 1,
          transition:
            incoming.phase === 'start' ? 'none' : `opacity ${FADE_MS}ms ease`,
          zIndex: 20,
        };
      }
      if (incoming.phase === 'start') {
        return {
          transform: `translate(${incoming.from.x}px, ${incoming.from.y}px) rotate(${incoming.from.rot}deg)`,
          transformOrigin: '50% 110%',
          transition: 'none',
          zIndex: 20,
        };
      }
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transformOrigin: '50% 110%',
        transition: `transform ${FLING_MS}ms ${FLING_EASE}`,
        zIndex: 20,
      };
    }
    if (isSnapping) {
      return {
        transform: 'translate(0px, 0px) rotate(0deg)',
        transformOrigin: '50% 110%',
        transition: `transform ${SNAP_MS}ms ${SNAP_EASE}`,
        zIndex: 20,
      };
    }
    if (snapFade != null) {
      return {
        ...depthStyle(0, isReducedMotion),
        opacity: snapFade === 'start' ? 0.35 : 1,
        transition: snapFade === 'start' ? 'none' : `opacity ${FADE_MS}ms ease`,
      };
    }
    return depthStyle(0, isReducedMotion);
  })();

  const handleTopTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    if (isSnapping && event.propertyName === 'transform') {
      setIsSnapping(false);
    }
    if (snapFade === 'run' && event.propertyName === 'opacity') {
      setSnapFade(null);
    }
    if (
      incoming != null &&
      topCardId === incoming.id &&
      event.propertyName === (isReducedMotion ? 'opacity' : 'transform')
    ) {
      setIncoming(null);
    }
  };

  // ----- Outgoing fling clone style -----
  const outgoingStyle = ((): CSSProperties | null => {
    if (outgoing == null) {
      return null;
    }
    const base: CSSProperties = {
      ...styles.stackCard,
      transformOrigin: '50% 110%',
      zIndex: 40,
      pointerEvents: 'none',
    };
    if (isReducedMotion) {
      // Reduced motion: the fling becomes a crossfade in place.
      return {
        ...base,
        transform: `translate(${outgoing.from.x}px, ${outgoing.from.y}px) rotate(${outgoing.from.rot}deg)`,
        opacity: outgoing.phase === 'start' ? 1 : 0,
        transition:
          outgoing.phase === 'start' ? 'none' : `opacity ${FADE_MS}ms ease`,
      };
    }
    if (outgoing.phase === 'start') {
      return {
        ...base,
        transform: `translate(${outgoing.from.x}px, ${outgoing.from.y}px) rotate(${outgoing.from.rot}deg)`,
        opacity: 1,
        transition: 'none',
      };
    }
    return {
      ...base,
      transform: `translate(${outgoing.to.x}px, ${outgoing.to.y}px) rotate(${outgoing.to.rot}deg)`,
      opacity: 0,
      transition: `transform ${FLING_MS}ms ${FLING_EASE}, opacity ${FLING_MS}ms ease`,
    };
  })();

  const handleOutgoingTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>,
  ) => {
    if (event.target === event.currentTarget && event.propertyName === 'opacity') {
      setOutgoing(null);
    }
  };

  // ----- Stage -----

  const stackFrameStyle = isCompact
    ? {...styles.stackFrame, ...styles.stackFrameCompact}
    : styles.stackFrame;

  const dragHint = isArmed
    ? dragVerdict === 'keep'
      ? 'Release to keep'
      : 'Release to discard'
    : drag != null
      ? 'Drag right to keep · left to discard'
      : isCompact
        ? 'Swipe right to keep · left to discard'
        : 'Drag the card, or use the buttons and arrow keys below';

  const cardStack = !isSessionDone && (
    <div
      style={stackFrameStyle}
      role="group"
      aria-label={`Triage stack — ${session.stack.length} screenshots remaining`}>
      {outgoing != null && outgoingStyle != null && (
        <div style={outgoingStyle} onTransitionEnd={handleOutgoingTransitionEnd}>
          <CardFace
            candidate={outgoing.candidate}
            stampVerdict={outgoing.verdict}
            progress={1}
            isArmed
            isLifted
            position=""
          />
        </div>
      )}
      {visibleCards.map((candidate, depth) =>
        depth === 0 ? (
          <div
            key={candidate.id}
            style={{
              ...styles.stackCard,
              ...styles.dragSurface,
              ...(drag != null ? styles.dragSurfaceActive : undefined),
              ...topCardStyle,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
            onTransitionEnd={handleTopTransitionEnd}>
            <CardFace
              candidate={candidate}
              stampVerdict={dragVerdict}
              progress={dragProgress}
              isArmed={isArmed}
              isLifted={drag != null}
              position={`${decidedCount + 1} of ${roundTotal}`}
            />
          </div>
        ) : (
          <div
            key={candidate.id}
            aria-hidden
            style={{...styles.stackCard, ...depthStyle(depth, isReducedMotion)}}>
            <CardFace
              candidate={candidate}
              stampVerdict={null}
              progress={0}
              isArmed={false}
              isLifted={false}
              position={`${decidedCount + 1 + depth} of ${roundTotal}`}
            />
          </div>
        ),
      )}
    </div>
  );

  const actionButtonStyle = isCompact
    ? styles.actionButtonCompact
    : styles.actionButton;

  const verdictButtons = !isSessionDone && (
    <div style={styles.actionRow}>
      <Button
        label="Discard"
        variant="destructive"
        size="lg"
        icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
        onClick={() => commitVerdict('discard', null)}
        style={actionButtonStyle}
      />
      <Button
        label="Later"
        variant="secondary"
        size="lg"
        icon={<Icon icon={ClockIcon} size="sm" color="inherit" />}
        onClick={() => commitVerdict('skip', null)}
        style={actionButtonStyle}
      />
      <Button
        label="Keep"
        variant="primary"
        size="lg"
        icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
        onClick={() => commitVerdict('keep', null)}
        style={actionButtonStyle}
      />
    </div>
  );

  const summaryStage = isSessionDone && (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={SparklesIcon} size="lg" color="secondary" />
            <Heading level={2}>Stack cleared</Heading>
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {keptCount} kept · {discardedCount} discarded ·{' '}
            {formatMb(reclaimedMb)} reclaimed
            {round > 1 ? ` · round ${round}` : ''}
          </Text>
        </VStack>
        <Divider />
        <VerdictBreakdown log={session.log} />
        <Divider />
        <HStack gap={2} vAlign="center" style={styles.summaryActions}>
          {discardedIds.length > 0 ? (
            <Button
              label={`Re-check discarded (${discardedIds.length})`}
              variant="primary"
              icon={<Icon icon={RepeatIcon} size="sm" color="inherit" />}
              onClick={reviewDiscarded}
            />
          ) : (
            <Text type="supporting" color="secondary">
              Nothing discarded — the whole roll survived.
            </Text>
          )}
          <Button
            label="Restart full pass"
            variant="secondary"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={restartSession}
          />
        </HStack>
      </VStack>
    </Card>
  );

  const stage = (
    <div
      style={
        isCompact
          ? {...styles.stageBackdrop, ...styles.stageBackdropCompact}
          : styles.stageBackdrop
      }>
      <div style={styles.stageColumn}>
        {isSessionDone ? (
          summaryStage
        ) : (
          <>
            {cardStack}
            <HStack hAlign="center">
              <Text type="supporting" color="secondary">
                {dragHint}
              </Text>
            </HStack>
            {verdictButtons}
            {!isCompact && (
              <HStack gap={3} vAlign="center" hAlign="center" style={styles.hintRow}>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="←" />
                  <Text type="supporting" color="secondary">
                    discard
                  </Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="↓" />
                  <Text type="supporting" color="secondary">
                    later
                  </Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="→" />
                  <Text type="supporting" color="secondary">
                    keep
                  </Text>
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Kbd keys="u" />
                  <Text type="supporting" color="secondary">
                    undo
                  </Text>
                </HStack>
              </HStack>
            )}
          </>
        )}
        <HStack hAlign="center">
          <Text type="supporting" color="secondary" role="status">
            {actionNote}
          </Text>
        </HStack>
      </div>
    </div>
  );

  // ----- History rail (desktop only; the tally collapses into the header
  // at <=640px per the responsive contract) -----
  const historyRail = (
    <div style={styles.railScroll}>
      <VStack gap={4}>
        <VStack gap={2}>
          <div style={styles.eyebrow}>This session</div>
          <HStack gap={2}>
            <TallyStat label="Kept" value={String(keptCount)} />
            <TallyStat label="Discarded" value={String(discardedCount)} />
          </HStack>
          <TallyStat label="Space reclaimed" value={formatMb(reclaimedMb)} />
          <Button
            label="Undo last decision"
            variant="secondary"
            size="sm"
            icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
            isDisabled={!canUndo || isBusy}
            onClick={undoLast}
          />
        </VStack>
        <Divider />
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={HistoryIcon} size="sm" color="secondary" />
            <div style={styles.eyebrow}>Decisions · newest first</div>
          </HStack>
          {session.log.length === 0 ? (
            <Text type="supporting" color="secondary">
              No decisions yet — swipe the top card to start the rail.
            </Text>
          ) : (
            [...session.log]
              .reverse()
              .map((decision, index) => (
                <DecisionRow
                  key={`${decision.id}-${session.log.length - index}`}
                  decision={decision}
                />
              ))
          )}
        </VStack>
      </VStack>
    </div>
  );

  // <=640px: 40px hit box for the header undo control.
  const tapTargetStyle = isCompact ? styles.headerTapTarget : undefined;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={ImagesIcon} size="md" color="secondary" />
                <Heading level={1}>Screenshot Triage</Heading>
                {round > 1 && (
                  <Badge label={`Round ${round} · re-check`} variant="warning" />
                )}
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    Swipe to keep or toss
                  </Text>
                )}
              </HStack>
            </StackItem>
            <HStack gap={3} vAlign="center">
              <VStack gap={0.5}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {decidedCount} of {roundTotal}
                </Text>
                {!isCompact && (
                  <div style={styles.headerBarBox}>
                    <ProgressBar
                      value={decidedCount}
                      max={roundTotal}
                      label="Triage progress"
                      isLabelHidden
                    />
                  </div>
                )}
              </VStack>
              <Badge label={`${keptCount} kept`} variant="success" />
              <Tooltip content={`${formatMb(reclaimedMb)} reclaimed so far`}>
                <Badge label={`${discardedCount} tossed`} variant="error" />
              </Tooltip>
              <IconButton
                label="Undo last decision"
                tooltip="Undo last decision (U)"
                icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                isDisabled={!canUndo || isBusy}
                onClick={undoLast}
                style={tapTargetStyle}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      end={
        isCompact ? undefined : (
          <LayoutPanel width={300} padding={0} label="Decision history">
            {historyRail}
          </LayoutPanel>
        )
      }
      content={<LayoutContent padding={0}>{stage}</LayoutContent>}
    />
  );
}
