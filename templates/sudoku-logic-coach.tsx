// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file sudoku-logic-coach.tsx
 * @input Deterministic fixtures only (one authored 9x9 puzzle with its full
 *   81-digit solution, a 13-step precomputed solve path — each step naming
 *   its technique, the cells it spotlights, and the pencil marks it reads —
 *   and a seed set of genuine candidate pencil marks around the center box;
 *   all static arrays, no Date.now, no Math.random, no network assets)
 * @output Sudoku LOGIC COACH: a 9x9 board with heavy 3x3 box borders where
 *   selecting a cell tints its row, column, and box and highlights every
 *   same-digit cell board-wide; a thumb-sized bottom number pad whose Notes
 *   ToggleButton switches entry between big digits and 3x3 pencil-mark
 *   micro-grids, with each pad key carrying a count-remaining readout that
 *   dims when its digit is complete. A duplicate digit gets a red conflict
 *   ring the instant it lands. Entering a CORRECT big digit auto-erases the
 *   now-invalid pencil marks from all peers with a brief fade, and the
 *   undo/redo log folds the digit, the cell's own notes, and those
 *   auto-erasures into one atomic entry. Coach mode replays the authored
 *   solve path through a restart/step/play transport: each step names its
 *   technique ('Naked single', 'Hidden single (column 5)', 'Full house'),
 *   spotlights the involved cells and relevant pencil marks while dimming
 *   the rest, and writes its digit on advance
 * @position Page template; emitted by `astryx template sudoku-logic-coach`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * givens/remaining caption, conflict + solved badges, the Coach-mode
 * ToggleButton, Reset). LayoutContent centers the board (max 520px).
 * LayoutPanel end 320 hosts solve stats + the atomic move log in solve
 * mode, and the coach transport + current-step card + full step list in
 * coach mode. LayoutFooter docks the number pad (solve) or, on narrow
 * screens, the coach caption card + transport (coach).
 *
 * Responsive contract:
 * - >1024px: header | centered board | end panel 320 (scrolls) | pad footer.
 * - <=1024px: the end panel leaves the frame; its content (move log or
 *   step list) flows below the board in the same scroll.
 * - <=640px: the board takes full width, the pad docks to the bottom as a
 *   5-column two-row grid (>=48px keys), and the coach's technique caption
 *   becomes a swipeable card above the transport — swipe left/right with
 *   pointer capture to step, with Previous/Next IconButtons driving the
 *   identical commit logic. Nothing is hover-only: every tint, ring, and
 *   count is painted inline and restated in aria-labels; pad keys, cells,
 *   and transport controls are >=40px tap targets.
 * - The board grid is the page's only fixed-aspect surface; nothing owns
 *   overflow-x.
 *
 * Container policy (game-tool archetype): frame-first rows and panels; the
 * board and pad are hand-rolled grids of plain buttons (web fundamentals),
 * the move log and step list use List rows, and the coach caption is one
 * bordered card. Simulated liveness = the coach Play interval advancing an
 * index into the static step array; the board in coach mode is a pure
 * function of (givens, steps[0..index]). Keyboard path mirrors every
 * pointer path: arrows move the selection, 1-9 enter digits or notes, N
 * toggles notes, Backspace erases.
 *
 * Fixture policy: fixed data only. Puzzle, solution, solve path, and seed
 * pencil marks are static authored arrays; the only runtime cadence is the
 * coach playback interval and the 700ms fade-cleanup timer.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token or a
 * color-mix() over tokens — the layered row/column/box tints, same-digit
 * highlights, conflict rings, and coach spotlight scrims are tuned so they
 * stay distinguishable in both light and dark schemes.
 */

import {useEffect, useMemo, useRef, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EraserIcon,
  GraduationCapIcon,
  LightbulbIcon,
  PauseIcon,
  PencilIcon,
  PlayIcon,
  PuzzleIcon,
  Redo2Icon,
  RotateCcwIcon,
  SparklesIcon,
  StepBackIcon,
  StepForwardIcon,
  TriangleAlertIcon,
  Undo2Icon,
} from 'lucide-react';

// ============= KEYFRAMES =============
// Auto-erased pencil marks fade out; a coach-committed digit pops in.
// prefers-reduced-motion disables both — erased marks simply disappear
// (the move log records the count) and committed digits appear in place.

const GLOBAL_CSS = `
@keyframes slc-mark-fade {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.55); }
}
.slc-mark-fade {
  animation: slc-mark-fade 620ms ease forwards;
}
@keyframes slc-digit-pop {
  from { opacity: 0.2; transform: scale(0.55); }
  to { opacity: 1; transform: scale(1); }
}
.slc-digit-pop {
  animation: slc-digit-pop 260ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .slc-mark-fade { animation: none; opacity: 0; }
  .slc-digit-pop { animation: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  scroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  column: {
    maxWidth: 560,
    margin: '0 auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // The 9x9 board: heavy outer frame, aspect-locked, full width up to 520.
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 1fr)',
    gridTemplateRows: 'repeat(9, 1fr)',
    width: '100%',
    maxWidth: 520,
    margin: '0 auto',
    aspectRatio: '1 / 1',
    border: '2px solid var(--color-border-emphasized)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
  },
  cell: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    minWidth: 0,
    minHeight: 0,
    border: 'none',
    backgroundColor: 'var(--color-background-card)',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  // Layered tints (selected cell > same digit > row/col/box peers). All
  // color-mix over tokens so the stack survives dark mode.
  cellPeer: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 8%, var(--color-background-card))',
  },
  cellSameDigit: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 20%, var(--color-background-card))',
  },
  cellSelected: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 28%, var(--color-background-card))',
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  // The conflict ring lands the instant a duplicate digit does.
  cellConflict: {
    backgroundColor:
      'color-mix(in srgb, var(--color-error) 16%, var(--color-background-card))',
    boxShadow: 'inset 0 0 0 2px var(--color-error)',
  },
  // Coach spotlight layers: scrim-dim the rest, tint the involved cells,
  // ring the step's target cell.
  cellSpotlit: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 11%, var(--color-background-card))',
  },
  cellTarget: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 24%, var(--color-background-card))',
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  glyph: {
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
    userSelect: 'none',
  },
  glyphGiven: {color: 'var(--color-text-primary)'},
  glyphEntry: {color: 'var(--color-accent)'},
  glyphConflict: {color: 'var(--color-error)'},
  glyphDimmed: {opacity: 0.3},
  // 3x3 pencil-mark micro-grid inside an unfilled cell.
  markGrid: {
    position: 'absolute',
    inset: 2,
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(3, 1fr)',
    pointerEvents: 'none',
  },
  mark: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    lineHeight: 1,
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
  },
  markCoach: {
    color: 'var(--color-accent)',
    fontWeight: 'var(--font-weight-semibold)',
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 22%, var(--color-background-card))',
    borderRadius: 3,
  },
  markFading: {color: 'var(--color-error)'},
  // Number pad: thumb-sized keys; 9-up row on wide, 5-column grid <=640px.
  padWrap: {
    width: '100%',
    maxWidth: 560,
    margin: '0 auto',
  },
  padGrid: {
    display: 'grid',
    gap: 'var(--spacing-1)',
  },
  padKey: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 0,
    height: 52,
    padding: 0,
    borderRadius: 'var(--radius-control)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  padKeyNotes: {
    borderStyle: 'dashed',
    borderColor: 'var(--color-accent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 8%, var(--color-background-card))',
  },
  padKeyDone: {opacity: 0.4, cursor: 'default'},
  padDigit: {
    fontSize: 18,
    fontWeight: 'var(--font-weight-semibold)',
    lineHeight: 1,
    color: 'var(--color-text-primary)',
  },
  padCount: {
    fontSize: 10,
    lineHeight: 1,
    color: 'var(--color-text-secondary)',
  },
  padControl: {height: 40},
  // Coach caption card (swipeable on touch widths).
  stepCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    touchAction: 'pan-y',
  },
  stepCardBody: {minWidth: 0},
  panelScroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  panelBody: {padding: 'var(--spacing-3)'},
  inlinePanel: {padding: '0 var(--spacing-4) var(--spacing-4)'},
  statRow: {minHeight: 24},
  logScroll: {maxHeight: 320, overflowY: 'auto'},
  stepListScroll: {maxHeight: 360, overflowY: 'auto'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures. One authored puzzle (51 blanks), its verified
// solution, a 13-step solve path, and seed pencil marks — every candidate
// set below is genuinely derivable from the givens, so the coach's story
// and the auto-erase demo are both truthful.

const GIVEN_ROWS = [
  '530070000',
  '600195000',
  '098000060',
  '800060003',
  '400803001',
  '700020006',
  '060000280',
  '000419005',
  '000080079',
];

const SOLUTION_ROWS = [
  '534678912',
  '672195348',
  '198342567',
  '859761423',
  '426853791',
  '713924856',
  '961537284',
  '287419635',
  '345286179',
];

const GIVENS: number[] = GIVEN_ROWS.join('').split('').map(Number);
const SOLUTION: number[] = SOLUTION_ROWS.join('').split('').map(Number);

/** Seed pencil marks: true candidate sets around the center box, so the
 * very first coach move (5 at R5C5), played by hand in solve mode, fades
 * seven stale 5-marks out of its peers in one atomic entry. */
const NOTE_SEEDS: ReadonlyArray<{cell: number; digits: number[]}> = [
  {cell: 22, digits: [3, 4]},
  {cell: 30, digits: [5, 7, 9]},
  {cell: 37, digits: [2, 5]},
  {cell: 38, digits: [2, 5, 6, 9]},
  {cell: 40, digits: [5]},
  {cell: 42, digits: [5, 7, 9]},
  {cell: 43, digits: [2, 5, 9]},
  {cell: 48, digits: [5, 9]},
  {cell: 58, digits: [3, 5]},
];

interface CoachStep {
  id: string;
  /** 0-based cell index (row * 9 + col). */
  cell: number;
  digit: number;
  technique: string;
  caption: string;
  /** Spotlighted regions (0-based rows / cols / boxes) and extra cells. */
  rows?: number[];
  cols?: number[];
  boxes?: number[];
  cells?: number[];
  /** Pencil marks the step reads, drawn in the involved empty cells. */
  marks: Array<{cell: number; digits: number[]}>;
}

const COACH_STEPS: CoachStep[] = [
  {
    id: 's01',
    cell: 40,
    digit: 5,
    technique: 'Naked single',
    caption:
      'Row 5, column 5, and the center box already contain every digit ' +
      'except 5 — R5C5 has exactly one candidate left.',
    rows: [4],
    cols: [4],
    boxes: [4],
    marks: [{cell: 40, digits: [5]}],
  },
  {
    id: 's02',
    cell: 48,
    digit: 9,
    technique: 'Naked single',
    caption:
      'With the 5 placed, the center box still needs 1, 4, 7, 9. Row 6 ' +
      'supplies the 7 and column 4 the 1 and 4 — only 9 survives at R6C4.',
    rows: [5],
    cols: [3],
    boxes: [4],
    cells: [40],
    marks: [{cell: 48, digits: [9]}],
  },
  {
    id: 's03',
    cell: 30,
    digit: 7,
    technique: 'Naked single',
    caption:
      'R4C4 was down to the pencil pair 7/9. The 9 just written below it ' +
      'shares column 4, so the pair collapses to 7.',
    cols: [3],
    boxes: [4],
    cells: [48],
    marks: [{cell: 30, digits: [7, 9]}],
  },
  {
    id: 's04',
    cell: 58,
    digit: 3,
    technique: 'Hidden single (column 5)',
    caption:
      'Column 5 is missing only 3 and 4. The given 4 in the bottom-middle ' +
      'box rules 4 out of R7C5, pinning it to 3.',
    cols: [4],
    boxes: [7],
    cells: [66],
    marks: [
      {cell: 58, digits: [3, 4]},
      {cell: 22, digits: [3, 4]},
    ],
  },
  {
    id: 's05',
    cell: 22,
    digit: 4,
    technique: 'Full house (column 5)',
    caption:
      'One empty cell remains in column 5, so the last missing digit — ' +
      '4 — drops into R3C5.',
    cols: [4],
    marks: [{cell: 22, digits: [4]}],
  },
  {
    id: 's06',
    cell: 23,
    digit: 2,
    technique: 'Naked single',
    caption:
      'Row 3 forbids 4, 6, 8, 9 and column 6 forbids 3, 5, 9. Of the ' +
      'top-middle box’s missing digits, only 2 fits R3C6.',
    rows: [2],
    cols: [5],
    boxes: [1],
    marks: [{cell: 23, digits: [2]}],
  },
  {
    id: 's07',
    cell: 21,
    digit: 3,
    technique: 'Naked single',
    caption:
      'R3C4 held the pencil pair 2/3. The 2 just landed next door in the ' +
      'same row, leaving 3.',
    rows: [2],
    boxes: [1],
    cells: [23],
    marks: [{cell: 21, digits: [2, 3]}],
  },
  {
    id: 's08',
    cell: 3,
    digit: 6,
    technique: 'Naked single',
    caption:
      'The top-middle box needs 6 and 8. Column 4 already shows an 8 at ' +
      'R5C4, so R1C4 must take the 6.',
    cols: [3],
    boxes: [1],
    cells: [39],
    marks: [{cell: 3, digits: [6, 8]}],
  },
  {
    id: 's09',
    cell: 5,
    digit: 8,
    technique: 'Full house (box 2)',
    caption:
      'That closes the box: the final empty cell at R1C6 takes the final ' +
      'missing digit, 8.',
    boxes: [1],
    marks: [{cell: 5, digits: [8]}],
  },
  {
    id: 's10',
    cell: 37,
    digit: 2,
    technique: 'Naked single',
    caption:
      'Row 5 eliminates 1, 3, 4, 5, 8 and column 2 eliminates 3, 6, 9 — ' +
      'R5C2 is squeezed to a single candidate, 2.',
    rows: [4],
    cols: [1],
    boxes: [3],
    marks: [{cell: 37, digits: [2]}],
  },
  {
    id: 's11',
    cell: 43,
    digit: 9,
    technique: 'Naked single',
    caption:
      'Row 5 still needs 6, 7, 9. At R5C8 the box’s given 6 and the 7 down ' +
      'column 8 both interfere — 9 is forced.',
    rows: [4],
    cols: [7],
    boxes: [5],
    cells: [53, 79],
    marks: [{cell: 43, digits: [6, 7, 9]}],
  },
  {
    id: 's12',
    cell: 42,
    digit: 7,
    technique: 'Naked single',
    caption:
      'The remaining 6/7 pair in row 5 splits: the middle-right box ' +
      'already holds a 6, so R5C7 takes the 7.',
    rows: [4],
    boxes: [5],
    cells: [53],
    marks: [
      {cell: 42, digits: [6, 7]},
      {cell: 38, digits: [6, 7]},
    ],
  },
  {
    id: 's13',
    cell: 38,
    digit: 6,
    technique: 'Full house (row 5)',
    caption:
      'Row 5 finishes: its last open cell, R5C3, receives the last ' +
      'missing digit, 6.',
    rows: [4],
    marks: [{cell: 38, digits: [6]}],
  },
];

// ============= HELPERS =============

const CELLS = Array.from({length: 81}, (_, i) => i);

function rowOf(i: number): number {
  return Math.floor(i / 9);
}
function colOf(i: number): number {
  return i % 9;
}
function boxOf(i: number): number {
  return Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
}

/** Precomputed peer lists (same row, column, or box; 20 cells each). */
const PEERS: number[][] = CELLS.map(i =>
  CELLS.filter(
    j =>
      j !== i &&
      (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i)),
  ),
);

function cellName(i: number): string {
  return `R${rowOf(i) + 1}C${colOf(i) + 1}`;
}

function hasNote(mask: number, digit: number): boolean {
  return (mask & (1 << digit)) !== 0;
}

function notesToDigits(mask: number): number[] {
  const digits: number[] = [];
  for (let d = 1; d <= 9; d++) {
    if (hasNote(mask, d)) {
      digits.push(d);
    }
  }
  return digits;
}

function seedNotes(): number[] {
  const masks = CELLS.map(() => 0);
  for (const seed of NOTE_SEEDS) {
    for (const digit of seed.digits) {
      masks[seed.cell] |= 1 << digit;
    }
  }
  return masks;
}

function spotlightLabel(step: CoachStep): string {
  const parts: string[] = [];
  for (const r of step.rows ?? []) {
    parts.push(`row ${r + 1}`);
  }
  for (const c of step.cols ?? []) {
    parts.push(`column ${c + 1}`);
  }
  for (const b of step.boxes ?? []) {
    parts.push(`box ${b + 1}`);
  }
  return parts.join(' · ');
}

/** Cells a coach step spotlights: its regions, helper cells, and target. */
function spotlightSet(step: CoachStep): Set<number> {
  const spot = new Set<number>();
  for (const i of CELLS) {
    if (
      (step.rows ?? []).includes(rowOf(i)) ||
      (step.cols ?? []).includes(colOf(i)) ||
      (step.boxes ?? []).includes(boxOf(i))
    ) {
      spot.add(i);
    }
  }
  for (const extra of step.cells ?? []) {
    spot.add(extra);
  }
  spot.add(step.cell);
  return spot;
}

// ----- undo/redo moves -----
// A 'digit' move is ATOMIC: the digit, the cell's own cleared notes, and
// every auto-erased peer pencil mark travel together through undo/redo.

type Move =
  | {
      seq: number;
      kind: 'digit';
      cell: number;
      digit: number;
      prevValue: number;
      prevNotes: number;
      erased: Array<{cell: number; digit: number}>;
    }
  | {seq: number; kind: 'note'; cell: number; digit: number; wasOn: boolean}
  | {seq: number; kind: 'erase'; cell: number; prevValue: number; prevNotes: number};

function moveLabel(move: Move): string {
  switch (move.kind) {
    case 'digit':
      return `Placed ${move.digit} at ${cellName(move.cell)}`;
    case 'note':
      return `${move.wasOn ? 'Removed' : 'Added'} note ${move.digit} at ${cellName(move.cell)}`;
    case 'erase':
      return `Cleared ${cellName(move.cell)}`;
  }
}

function moveDetail(move: Move): string {
  switch (move.kind) {
    case 'digit':
      return move.erased.length > 0
        ? `atomic: auto-erased ${move.erased.length} peer pencil mark${
            move.erased.length === 1 ? '' : 's'
          }`
        : 'no pencil marks affected';
    case 'note':
      return 'pencil mark';
    case 'erase':
      return move.prevValue > 0 ? 'removed a digit' : 'removed pencil marks';
  }
}

// ============= BOARD CELL =============

interface CellView {
  index: number;
  value: number;
  isGiven: boolean;
  noteDigits: number[];
  fadingDigits: number[];
  coachMarks: number[] | null;
  isSelected: boolean;
  isPeer: boolean;
  isSameDigit: boolean;
  isConflict: boolean;
  isSpotlit: boolean;
  isTarget: boolean;
  isDimmed: boolean;
  didJustLand: boolean;
}

function cellAria(view: CellView): string {
  const parts = [`Row ${rowOf(view.index) + 1}, column ${colOf(view.index) + 1}`];
  if (view.value > 0) {
    parts.push(view.isGiven ? `given ${view.value}` : `entry ${view.value}`);
  } else if (view.noteDigits.length > 0) {
    parts.push(`notes ${view.noteDigits.join(' ')}`);
  } else {
    parts.push('empty');
  }
  if (view.isConflict) {
    parts.push('conflict');
  }
  if (view.isSelected) {
    parts.push('selected');
  }
  return parts.join(', ');
}

function BoardCell({
  view,
  isInteractive,
  isCompact,
  animate,
  registerRef,
  onSelect,
}: {
  view: CellView;
  isInteractive: boolean;
  isCompact: boolean;
  animate: boolean;
  registerRef: (index: number, el: HTMLButtonElement | null) => void;
  onSelect: (index: number) => void;
}) {
  const r = rowOf(view.index);
  const c = colOf(view.index);
  // Heavy 3x3 box borders: 2px emphasized on box seams, hairline inside.
  const borders: CSSProperties = {
    borderRight:
      c === 8
        ? undefined
        : c % 3 === 2
          ? '2px solid var(--color-border-emphasized)'
          : 'var(--border-width) solid var(--color-border)',
    borderBottom:
      r === 8
        ? undefined
        : r % 3 === 2
          ? '2px solid var(--color-border-emphasized)'
          : 'var(--border-width) solid var(--color-border)',
  };

  const surface: CSSProperties = view.isConflict
    ? styles.cellConflict
    : view.isTarget
      ? styles.cellTarget
      : view.isSelected
        ? styles.cellSelected
        : view.isSameDigit
          ? styles.cellSameDigit
          : view.isSpotlit
            ? styles.cellSpotlit
            : view.isPeer
              ? styles.cellPeer
              : {};

  const marks = view.coachMarks ?? view.noteDigits;
  const showMarks =
    view.value === 0 && (marks.length > 0 || view.fadingDigits.length > 0);

  const content = (
    <>
      {view.value > 0 && (
        <span
          className={view.didJustLand && animate ? 'slc-digit-pop' : undefined}
          style={{
            ...styles.glyph,
            fontSize: isCompact ? 20 : 24,
            ...(view.isGiven ? styles.glyphGiven : styles.glyphEntry),
            ...(view.isConflict ? styles.glyphConflict : undefined),
            ...(view.isDimmed ? styles.glyphDimmed : undefined),
          }}>
          {view.value}
        </span>
      )}
      {showMarks && (
        <span
          style={{
            ...styles.markGrid,
            ...(view.isDimmed ? styles.glyphDimmed : undefined),
          }}
          aria-hidden="true">
          {Array.from({length: 9}, (_, slot) => {
            const digit = slot + 1;
            const isOn = marks.includes(digit);
            const isFading = view.fadingDigits.includes(digit);
            if (!isOn && !isFading) {
              return <span key={digit} style={styles.mark} />;
            }
            return (
              <span
                key={digit}
                className={isFading ? 'slc-mark-fade' : undefined}
                style={{
                  ...styles.mark,
                  ...(view.coachMarks != null ? styles.markCoach : undefined),
                  ...(isFading ? styles.markFading : undefined),
                }}>
                {digit}
              </span>
            );
          })}
        </span>
      )}
    </>
  );

  if (!isInteractive) {
    return (
      <div
        role="img"
        aria-label={cellAria(view)}
        style={{...styles.cell, ...borders, ...surface}}>
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      ref={el => registerRef(view.index, el)}
      tabIndex={view.isSelected ? 0 : -1}
      aria-label={cellAria(view)}
      aria-pressed={view.isSelected}
      style={{...styles.cell, ...borders, ...surface, cursor: 'pointer'}}
      onClick={() => onSelect(view.index)}>
      {content}
    </button>
  );
}

// ============= COACH PIECES =============

function CoachTransport({
  coachIndex,
  isPlaying,
  isCompact,
  onRestart,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  coachIndex: number;
  isPlaying: boolean;
  isCompact: boolean;
  onRestart: () => void;
  onPrev: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
}) {
  const total = COACH_STEPS.length;
  const atEnd = coachIndex >= total;
  const tap = isCompact ? {width: 40, height: 40} : undefined;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <IconButton
          label="Restart solve path"
          tooltip="Restart from the first step"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tap}
          isDisabled={coachIndex === 0}
          onClick={onRestart}
        />
        <IconButton
          label="Previous step"
          tooltip="Undo the last coached placement"
          icon={<Icon icon={StepBackIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tap}
          isDisabled={coachIndex === 0}
          onClick={onPrev}
        />
        <IconButton
          label={isPlaying ? 'Pause the solve path' : 'Play the solve path'}
          tooltip={isPlaying ? 'Pause' : 'Play step by step'}
          icon={
            <Icon
              icon={isPlaying ? PauseIcon : PlayIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          style={tap}
          isDisabled={!isPlaying && atEnd}
          onClick={onTogglePlay}
        />
        <IconButton
          label="Next step (writes the digit)"
          tooltip="Commit this step's digit and advance"
          icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={tap}
          isDisabled={atEnd}
          onClick={onNext}
        />
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {atEnd
            ? `${total} of ${total} placed`
            : `Step ${coachIndex + 1} of ${total}`}
        </Text>
      </HStack>
      <ProgressBar
        value={coachIndex}
        max={total}
        label="Solve path progress"
        isLabelHidden
      />
    </VStack>
  );
}

/**
 * The technique caption. On touch widths it is swipeable: pointer capture
 * follows the drag, and releasing past the threshold commits the same
 * step-forward/step-back logic as the transport buttons beside it.
 */
function CoachStepCard({
  coachIndex,
  onPrev,
  onNext,
  onRestart,
}: {
  coachIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onRestart: () => void;
}) {
  const [dragX, setDragX] = useState(0);
  const dragRef = useRef<{pointerId: number; startX: number} | null>(null);
  const step =
    coachIndex < COACH_STEPS.length ? COACH_STEPS[coachIndex] : null;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {pointerId: event.pointerId, startX: event.clientX};
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    setDragX(Math.max(-72, Math.min(72, dx)));
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    const dx = event.clientX - drag.startX;
    dragRef.current = null;
    setDragX(0);
    if (dx <= -48) {
      onNext();
    } else if (dx >= 48) {
      onPrev();
    }
  };

  return (
    <div
      style={{
        ...styles.stepCard,
        transform: dragX !== 0 ? `translateX(${dragX}px)` : undefined,
      }}
      aria-label="Coach step card. Swipe left for the next step, right for the previous one."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragRef.current = null;
        setDragX(0);
      }}>
      {step == null ? (
        <HStack gap={3} vAlign="center">
          <Icon icon={SparklesIcon} size="md" color="success" />
          <StackItem size="fill">
            <VStack gap={1}>
              <Text type="label" weight="semibold">
                Solve path complete
              </Text>
              <Text type="supporting" color="secondary">
                All {COACH_STEPS.length} coached placements are on the board.
                Restart to replay the reasoning.
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Restart"
            variant="secondary"
            size="sm"
            style={styles.padControl}
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={onRestart}
          />
        </HStack>
      ) : (
        <HStack gap={2} vAlign="center">
          <IconButton
            label="Previous step"
            tooltip="Previous step"
            icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={{width: 40, height: 40}}
            isDisabled={coachIndex === 0}
            onClick={onPrev}
          />
          <StackItem size="fill">
            <VStack gap={1} style={styles.stepCardBody}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Badge variant="info" label={step.technique} />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  writes {step.digit} at {cellName(step.cell)}
                </Text>
              </HStack>
              <Text type="supporting" color="secondary">
                {step.caption}
              </Text>
              {spotlightLabel(step) !== '' && (
                <Text type="supporting" color="secondary">
                  Spotlight: {spotlightLabel(step)}
                </Text>
              )}
            </VStack>
          </StackItem>
          <IconButton
            label="Next step (writes the digit)"
            tooltip="Write the digit and advance"
            icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={{width: 40, height: 40}}
            onClick={onNext}
          />
        </HStack>
      )}
    </div>
  );
}

function CoachStepList({
  coachIndex,
  onJump,
}: {
  coachIndex: number;
  onJump: (index: number) => void;
}) {
  return (
    <div style={styles.stepListScroll}>
      <List density="compact" hasDividers>
        {COACH_STEPS.map((step, index) => (
          <ListItem
            key={step.id}
            label={`${index + 1}. ${step.technique}`}
            description={`${step.digit} at ${cellName(step.cell)}`}
            onClick={() => onJump(index)}
            isSelected={index === coachIndex}
            endContent={
              index < coachIndex ? (
                <Icon
                  icon={CheckIcon}
                  size="sm"
                  color="success"
                  aria-label="Placed"
                />
              ) : undefined
            }
          />
        ))}
      </List>
    </div>
  );
}

// ============= MOVE LOG =============

function MoveLog({moves}: {moves: Move[]}) {
  if (moves.length === 0) {
    return (
      <EmptyState
        title="No moves yet"
        description="Digits, notes, and their auto-erasures land here as single atomic entries."
        icon={<Icon icon={LightbulbIcon} size="lg" />}
        isCompact
      />
    );
  }
  const recent = [...moves].reverse().slice(0, 14);
  return (
    <div style={styles.logScroll}>
      <List density="compact" hasDividers>
        {recent.map(move => (
          <ListItem
            key={move.seq}
            label={moveLabel(move)}
            description={moveDetail(move)}
            endContent={
              move.kind === 'digit' && move.erased.length > 0 ? (
                <Badge variant="info" label={`−${move.erased.length} marks`} />
              ) : undefined
            }
          />
        ))}
      </List>
    </div>
  );
}

// ============= PAGE =============

type Mode = 'solve' | 'coach';

const COACH_PLAY_MS = 2600;
const FADE_CLEANUP_MS = 700;
const GIVEN_COUNT = GIVENS.filter(v => v > 0).length;

export default function SudokuLogicCoachTemplate() {
  // ----- solve state -----
  const [values, setValues] = useState<number[]>(() => CELLS.map(() => 0));
  const [notes, setNotes] = useState<number[]>(seedNotes);
  const [selected, setSelected] = useState<number>(40);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [undoStack, setUndoStack] = useState<Move[]>([]);
  const [redoStack, setRedoStack] = useState<Move[]>([]);
  const [fading, setFading] = useState<Array<{cell: number; digit: number}>>(
    [],
  );
  // ----- coach state -----
  const [mode, setMode] = useState<Mode>('solve');
  const [coachIndex, setCoachIndex] = useState(0);
  const [isCoachPlaying, setIsCoachPlaying] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  const seqRef = useRef(0);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // ----- derived solve state (pure functions of the fixtures + inputs) ---

  const board = useMemo(
    () => CELLS.map(i => (GIVENS[i] > 0 ? GIVENS[i] : values[i])),
    [values],
  );

  const conflicts = useMemo(
    () =>
      CELLS.map(
        i =>
          board[i] > 0 && PEERS[i].some(peer => board[peer] === board[i]),
      ),
    [board],
  );

  const digitCounts = useMemo(() => {
    const counts = Array.from({length: 10}, () => 0);
    for (const value of board) {
      counts[value] += 1;
    }
    return counts;
  }, [board]);

  const filledCount = 81 - digitCounts[0];
  const conflictCount = conflicts.filter(Boolean).length;
  const notesCellCount = notes.filter(mask => mask !== 0).length;
  const isSolved = board.every((value, i) => value === SOLUTION[i]);

  // ----- derived coach state -----

  const coachBoard = useMemo(() => {
    const next = [...GIVENS];
    for (let k = 0; k < coachIndex; k++) {
      next[COACH_STEPS[k].cell] = COACH_STEPS[k].digit;
    }
    return next;
  }, [coachIndex]);

  const activeStep =
    mode === 'coach' && coachIndex < COACH_STEPS.length
      ? COACH_STEPS[coachIndex]
      : null;

  const coachSpot = useMemo(
    () => (activeStep != null ? spotlightSet(activeStep) : null),
    [activeStep],
  );

  const coachMarkMap = useMemo(() => {
    const map = new Map<number, number[]>();
    if (activeStep != null) {
      for (const mark of activeStep.marks) {
        map.set(mark.cell, mark.digits);
      }
    }
    return map;
  }, [activeStep]);

  const lastCommittedCell =
    mode === 'coach' && coachIndex > 0
      ? COACH_STEPS[coachIndex - 1].cell
      : null;

  // ----- solve interactions -----
  // Every entry path (pad taps, keyboard digits, coach-free play) funnels
  // through these three commits, so undo/redo sees identical moves.

  const pushMove = (move: Move) => {
    setUndoStack(prev => [...prev, move]);
    setRedoStack([]);
  };

  const eraseCell = (cell: number) => {
    if (GIVENS[cell] > 0) {
      setLiveMessage(`${cellName(cell)} is a given clue and cannot change.`);
      return;
    }
    const prevValue = values[cell];
    const prevNotes = notes[cell];
    if (prevValue === 0 && prevNotes === 0) {
      return;
    }
    setValues(prev => prev.map((v, i) => (i === cell ? 0 : v)));
    setNotes(prev => prev.map((m, i) => (i === cell ? 0 : m)));
    pushMove({
      seq: seqRef.current++,
      kind: 'erase',
      cell,
      prevValue,
      prevNotes,
    });
    setLiveMessage(`Cleared ${cellName(cell)}.`);
  };

  const toggleNote = (cell: number, digit: number) => {
    if (GIVENS[cell] > 0 || values[cell] > 0) {
      setLiveMessage(`${cellName(cell)} already holds a digit.`);
      return;
    }
    const wasOn = hasNote(notes[cell], digit);
    setNotes(prev =>
      prev.map((mask, i) => (i === cell ? mask ^ (1 << digit) : mask)),
    );
    pushMove({seq: seqRef.current++, kind: 'note', cell, digit, wasOn});
    setLiveMessage(
      `${wasOn ? 'Removed' : 'Added'} pencil mark ${digit} at ${cellName(cell)}.`,
    );
  };

  const enterDigit = (digit: number) => {
    const cell = selected;
    if (GIVENS[cell] > 0) {
      setLiveMessage(`${cellName(cell)} is a given clue and cannot change.`);
      return;
    }
    if (isNotesMode) {
      toggleNote(cell, digit);
      return;
    }
    if (values[cell] === digit) {
      eraseCell(cell);
      return;
    }
    const prevValue = values[cell];
    const prevNotes = notes[cell];
    // A CORRECT digit invalidates the same digit penciled into any peer:
    // collect and clear those marks so the erasure rides the same move.
    const erased: Array<{cell: number; digit: number}> = [];
    const isCorrect = SOLUTION[cell] === digit;
    setNotes(prev => {
      const next = [...prev];
      next[cell] = 0;
      if (isCorrect) {
        for (const peer of PEERS[cell]) {
          if (hasNote(next[peer], digit)) {
            next[peer] &= ~(1 << digit);
            erased.push({cell: peer, digit});
          }
        }
      }
      return next;
    });
    setValues(prev => prev.map((v, i) => (i === cell ? digit : v)));
    pushMove({
      seq: seqRef.current++,
      kind: 'digit',
      cell,
      digit,
      prevValue,
      prevNotes,
      erased,
    });
    if (erased.length > 0) {
      setFading(erased);
    }
    const duplicate = PEERS[cell].some(peer => board[peer] === digit);
    setLiveMessage(
      `Placed ${digit} at ${cellName(cell)}.` +
        (duplicate ? ' Conflict: the digit already appears in a peer.' : '') +
        (erased.length > 0
          ? ` Auto-erased ${erased.length} stale pencil mark${
              erased.length === 1 ? '' : 's'
            }.`
          : ''),
    );
  };

  // The fade is presentation-only: the marks are already gone from state;
  // this timer just retires the ghost glyphs after the animation.
  useEffect(() => {
    if (fading.length === 0) {
      return undefined;
    }
    const timer = window.setTimeout(() => setFading([]), FADE_CLEANUP_MS);
    return () => window.clearTimeout(timer);
  }, [fading]);

  const undo = () => {
    const move = undoStack[undoStack.length - 1];
    if (move == null) {
      return;
    }
    setUndoStack(prev => prev.slice(0, -1));
    setRedoStack(prev => [...prev, move]);
    setFading([]);
    if (move.kind === 'digit') {
      setValues(prev => prev.map((v, i) => (i === move.cell ? move.prevValue : v)));
      setNotes(prev => {
        const next = [...prev];
        next[move.cell] = move.prevNotes;
        // Atomic rewind: the auto-erased peer marks come back with it.
        for (const entry of move.erased) {
          next[entry.cell] |= 1 << entry.digit;
        }
        return next;
      });
      setLiveMessage(
        `Undid ${move.digit} at ${cellName(move.cell)}` +
          (move.erased.length > 0
            ? ` and restored ${move.erased.length} pencil mark${
                move.erased.length === 1 ? '' : 's'
              }.`
            : '.'),
      );
    } else if (move.kind === 'note') {
      setNotes(prev =>
        prev.map((mask, i) =>
          i === move.cell ? mask ^ (1 << move.digit) : mask,
        ),
      );
      setLiveMessage(`Undid note ${move.digit} at ${cellName(move.cell)}.`);
    } else {
      setValues(prev => prev.map((v, i) => (i === move.cell ? move.prevValue : v)));
      setNotes(prev => prev.map((m, i) => (i === move.cell ? move.prevNotes : m)));
      setLiveMessage(`Restored ${cellName(move.cell)}.`);
    }
  };

  const redo = () => {
    const move = redoStack[redoStack.length - 1];
    if (move == null) {
      return;
    }
    setRedoStack(prev => prev.slice(0, -1));
    setUndoStack(prev => [...prev, move]);
    if (move.kind === 'digit') {
      setValues(prev => prev.map((v, i) => (i === move.cell ? move.digit : v)));
      setNotes(prev => {
        const next = [...prev];
        next[move.cell] = 0;
        // Atomic replay: the same auto-erasures apply again.
        for (const entry of move.erased) {
          next[entry.cell] &= ~(1 << entry.digit);
        }
        return next;
      });
      setLiveMessage(`Redid ${move.digit} at ${cellName(move.cell)}.`);
    } else if (move.kind === 'note') {
      setNotes(prev =>
        prev.map((mask, i) =>
          i === move.cell ? mask ^ (1 << move.digit) : mask,
        ),
      );
      setLiveMessage(`Redid note ${move.digit} at ${cellName(move.cell)}.`);
    } else {
      setValues(prev => prev.map((v, i) => (i === move.cell ? 0 : v)));
      setNotes(prev => prev.map((m, i) => (i === move.cell ? 0 : m)));
      setLiveMessage(`Redid clearing ${cellName(move.cell)}.`);
    }
  };

  const resetBoard = () => {
    setValues(CELLS.map(() => 0));
    setNotes(seedNotes());
    setUndoStack([]);
    setRedoStack([]);
    setFading([]);
    setSelected(40);
    setLiveMessage('Board reset to the givens and seed pencil marks.');
  };

  // Roving selection: arrows move focus+selection; digits and Backspace
  // commit the same logic as the pad keys.
  const moveSelection = (dRow: number, dCol: number) => {
    const r = Math.min(8, Math.max(0, rowOf(selected) + dRow));
    const c = Math.min(8, Math.max(0, colOf(selected) + dCol));
    const next = r * 9 + c;
    setSelected(next);
    cellRefs.current[next]?.focus();
  };

  const onBoardKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (mode !== 'solve') {
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveSelection(0, -1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveSelection(0, 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveSelection(-1, 0);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveSelection(1, 0);
    } else if (event.key >= '1' && event.key <= '9') {
      event.preventDefault();
      enterDigit(Number(event.key));
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      eraseCell(selected);
    } else if (event.key === 'n' || event.key === 'N') {
      event.preventDefault();
      setIsNotesMode(prev => !prev);
      setLiveMessage(
        isNotesMode ? 'Big-digit entry.' : 'Pencil-mark entry.',
      );
    }
  };

  // ----- coach interactions -----

  const announceStep = (index: number, committed: boolean) => {
    if (committed && index > 0) {
      const step = COACH_STEPS[index - 1];
      setLiveMessage(
        `${step.technique}: wrote ${step.digit} at ${cellName(step.cell)}.`,
      );
    } else if (index < COACH_STEPS.length) {
      const step = COACH_STEPS[index];
      setLiveMessage(
        `Step ${index + 1}: ${step.technique} at ${cellName(step.cell)}.`,
      );
    }
  };

  // State updaters stay pure: the next index is computed outside setState
  // (every caller re-renders per step, so coachIndex is always fresh).
  const coachNext = () => {
    const next = Math.min(COACH_STEPS.length, coachIndex + 1);
    setCoachIndex(next);
    announceStep(next, true);
  };
  const coachPrev = () => {
    setIsCoachPlaying(false);
    const next = Math.max(0, coachIndex - 1);
    setCoachIndex(next);
    announceStep(next, false);
  };
  const coachRestart = () => {
    setIsCoachPlaying(false);
    setCoachIndex(0);
    announceStep(0, false);
  };
  const coachJump = (index: number) => {
    setIsCoachPlaying(false);
    setCoachIndex(index);
    announceStep(index, false);
  };
  const coachStepForward = () => {
    setIsCoachPlaying(false);
    coachNext();
  };

  // Playback cadence: the interval only advances the step index; the board
  // stays a pure function of (givens, steps[0..index]).
  useEffect(() => {
    if (!isCoachPlaying) {
      return undefined;
    }
    if (coachIndex >= COACH_STEPS.length) {
      setIsCoachPlaying(false);
      return undefined;
    }
    const timer = window.setInterval(() => {
      coachNext();
    }, COACH_PLAY_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCoachPlaying, coachIndex]);

  const setModeTo = (nextMode: Mode) => {
    setMode(nextMode);
    setIsCoachPlaying(false);
    setLiveMessage(
      nextMode === 'coach'
        ? 'Coach mode: the board shows the authored solve path.'
        : 'Solve mode: your entries are back on the board.',
    );
  };

  // ----- cell views -----

  const selectedDigit = mode === 'solve' ? board[selected] : 0;

  const cellViews: CellView[] = CELLS.map(i => {
    if (mode === 'coach') {
      const value = coachBoard[i];
      return {
        index: i,
        value,
        isGiven: GIVENS[i] > 0,
        noteDigits: [],
        fadingDigits: [],
        coachMarks: value === 0 ? (coachMarkMap.get(i) ?? null) : null,
        isSelected: false,
        isPeer: false,
        isSameDigit: false,
        isConflict: false,
        isSpotlit: coachSpot != null && coachSpot.has(i) && i !== activeStep?.cell,
        isTarget: activeStep != null && i === activeStep.cell,
        isDimmed: coachSpot != null && !coachSpot.has(i),
        didJustLand: i === lastCommittedCell,
      };
    }
    const value = board[i];
    const isPeer =
      i !== selected &&
      (rowOf(i) === rowOf(selected) ||
        colOf(i) === colOf(selected) ||
        boxOf(i) === boxOf(selected));
    return {
      index: i,
      value,
      isGiven: GIVENS[i] > 0,
      noteDigits: notesToDigits(notes[i]),
      fadingDigits: fading
        .filter(entry => entry.cell === i)
        .map(entry => entry.digit),
      coachMarks: null,
      isSelected: i === selected,
      isPeer,
      isSameDigit:
        selectedDigit > 0 && value === selectedDigit && i !== selected,
      isConflict: conflicts[i],
      isSpotlit: false,
      isTarget: false,
      isDimmed: false,
      didJustLand: false,
    };
  });

  const registerCellRef = (index: number, el: HTMLButtonElement | null) => {
    cellRefs.current[index] = el;
  };

  // ----- pieces -----

  const boardGrid = (
    <div
      role="group"
      aria-label={
        mode === 'coach'
          ? 'Sudoku board, coach replay'
          : 'Sudoku board. Arrow keys move the selection; 1 to 9 enters a digit; N toggles pencil marks; Backspace erases.'
      }
      style={styles.board}
      onKeyDown={onBoardKeyDown}>
      {cellViews.map(view => (
        <BoardCell
          key={view.index}
          view={view}
          isInteractive={mode === 'solve'}
          isCompact={isCompact}
          animate={!prefersReducedMotion}
          registerRef={registerCellRef}
          onSelect={setSelected}
        />
      ))}
    </div>
  );

  const padKeys = (
    <div
      style={{
        ...styles.padGrid,
        gridTemplateColumns: isCompact ? 'repeat(5, 1fr)' : 'repeat(9, 1fr)',
      }}>
      {Array.from({length: 9}, (_, slot) => {
        const digit = slot + 1;
        const remaining = 9 - digitCounts[digit];
        const isDone = remaining <= 0;
        return (
          <button
            key={digit}
            type="button"
            aria-label={
              isNotesMode
                ? `Toggle pencil mark ${digit}`
                : `Enter ${digit}, ${remaining} remaining`
            }
            style={{
              ...styles.padKey,
              ...(isNotesMode ? styles.padKeyNotes : undefined),
              ...(isDone ? styles.padKeyDone : undefined),
            }}
            disabled={isDone && !isNotesMode}
            onClick={() => enterDigit(digit)}>
            <span style={styles.padDigit}>{digit}</span>
            <span style={styles.padCount} aria-hidden="true">
              {isDone ? '✓' : `${remaining} left`}
            </span>
          </button>
        );
      })}
      {isCompact && (
        <button
          type="button"
          aria-label="Erase the selected cell"
          style={styles.padKey}
          onClick={() => eraseCell(selected)}>
          <Icon icon={EraserIcon} size="sm" color="secondary" />
          <span style={styles.padCount} aria-hidden="true">
            erase
          </span>
        </button>
      )}
    </div>
  );

  const padControls = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <ToggleButton
        label="Notes"
        size="sm"
        style={styles.padControl}
        icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
        isPressed={isNotesMode}
        onPressedChange={pressed => {
          setIsNotesMode(pressed);
          setLiveMessage(pressed ? 'Pencil-mark entry.' : 'Big-digit entry.');
        }}
        tooltip="Switch between big digits and pencil marks (N)"
      />
      {!isCompact && (
        <IconButton
          label="Erase the selected cell"
          tooltip="Erase (Backspace)"
          icon={<Icon icon={EraserIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={styles.padControl}
          onClick={() => eraseCell(selected)}
        />
      )}
      <IconButton
        label="Undo"
        tooltip="Undo the last atomic move"
        icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.padControl}
        isDisabled={undoStack.length === 0}
        onClick={undo}
      />
      <IconButton
        label="Redo"
        tooltip="Redo (auto-erasures replay too)"
        icon={<Icon icon={Redo2Icon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.padControl}
        isDisabled={redoStack.length === 0}
        onClick={redo}
      />
      <StackItem size="fill">
        <span />
      </StackItem>
      {!isCompact && (
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            Arrows move · digits type
          </Text>
          <Kbd keys="n" />
          <Text type="supporting" color="secondary">
            notes
          </Text>
        </HStack>
      )}
    </HStack>
  );

  const solveStats = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" style={styles.statRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Filled
          </Text>
        </StackItem>
        <Text type="body" hasTabularNumbers>
          {filledCount} / 81
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center" style={styles.statRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Givens
          </Text>
        </StackItem>
        <Text type="body" hasTabularNumbers>
          {GIVEN_COUNT}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center" style={styles.statRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Cells with pencil marks
          </Text>
        </StackItem>
        <Text type="body" hasTabularNumbers>
          {notesCellCount}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center" style={styles.statRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Conflicts
          </Text>
        </StackItem>
        <Text
          type="body"
          hasTabularNumbers
          style={
            conflictCount > 0 ? {color: 'var(--color-error)'} : undefined
          }>
          {conflictCount}
        </Text>
      </HStack>
    </VStack>
  );

  const solvePanel = (
    <VStack gap={4} style={styles.panelBody}>
      <VStack gap={2}>
        <Heading level={3}>This attempt</Heading>
        {solveStats}
        <Button
          label="Reset board"
          variant="secondary"
          size="sm"
          style={styles.padControl}
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          isDisabled={undoStack.length === 0 && redoStack.length === 0}
          onClick={resetBoard}
        />
      </VStack>
      <Divider />
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Move log</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {undoStack.length} moves
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          A correct digit and the pencil marks it invalidates are one entry —
          undo brings the marks back with it.
        </Text>
        <MoveLog moves={undoStack} />
      </VStack>
    </VStack>
  );

  const coachPanel = (
    <VStack gap={4} style={styles.panelBody}>
      <VStack gap={2}>
        <Heading level={3}>Solve path</Heading>
        <Text type="supporting" color="secondary">
          Each step spotlights the cells and pencil marks it reasons over,
          then writes its digit when you advance.
        </Text>
        <CoachTransport
          coachIndex={coachIndex}
          isPlaying={isCoachPlaying}
          isCompact={isCompact}
          onRestart={coachRestart}
          onPrev={coachPrev}
          onNext={coachStepForward}
          onTogglePlay={() => setIsCoachPlaying(prev => !prev)}
        />
      </VStack>
      <CoachStepCard
        coachIndex={coachIndex}
        onPrev={coachPrev}
        onNext={coachStepForward}
        onRestart={coachRestart}
      />
      <Divider />
      <VStack gap={2}>
        <Heading level={3}>All steps</Heading>
        <CoachStepList coachIndex={coachIndex} onJump={coachJump} />
      </VStack>
    </VStack>
  );

  const panelContent = mode === 'coach' ? coachPanel : solvePanel;

  const footer =
    mode === 'solve' ? (
      <LayoutFooter hasDivider>
        <VStack gap={2} style={styles.padWrap}>
          {padKeys}
          {padControls}
        </VStack>
      </LayoutFooter>
    ) : isNarrow ? (
      <LayoutFooter hasDivider>
        <VStack gap={2} style={styles.padWrap}>
          <CoachStepCard
            coachIndex={coachIndex}
            onPrev={coachPrev}
            onNext={coachStepForward}
            onRestart={coachRestart}
          />
          <CoachTransport
            coachIndex={coachIndex}
            isPlaying={isCoachPlaying}
            isCompact={isCompact}
            onRestart={coachRestart}
            onPrev={coachPrev}
            onNext={coachStepForward}
            onTogglePlay={() => setIsCoachPlaying(prev => !prev)}
          />
        </VStack>
      </LayoutFooter>
    ) : undefined;

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Icon icon={PuzzleIcon} size="sm" color="secondary" />
                  <Heading level={1}>Sudoku logic coach</Heading>
                  {!isCompact && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      Puzzle 001 · {GIVEN_COUNT} givens ·{' '}
                      {COACH_STEPS.length}-step coached opening
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {isSolved && <Badge variant="success" label="Solved" />}
              {mode === 'solve' && conflictCount > 0 && (
                <HStack gap={1} vAlign="center">
                  <Icon icon={TriangleAlertIcon} size="sm" color="error" />
                  <Badge
                    variant="error"
                    label={`${conflictCount} conflict${conflictCount === 1 ? '' : 's'}`}
                  />
                </HStack>
              )}
              <ToggleButton
                label="Coach mode"
                size="sm"
                style={isCompact ? styles.padControl : undefined}
                icon={
                  <Icon icon={GraduationCapIcon} size="sm" color="inherit" />
                }
                isPressed={mode === 'coach'}
                onPressedChange={pressed =>
                  setModeTo(pressed ? 'coach' : 'solve')
                }
                tooltip={
                  mode === 'coach'
                    ? 'Back to your own attempt'
                    : 'Replay the authored solve path'
                }
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="Sudoku board">
            <div style={styles.scroll}>
              <div style={styles.column}>
                <VStack gap={3}>
                  {boardGrid}
                  {mode === 'coach' && !isNarrow && activeStep == null && (
                    <Text type="supporting" color="secondary">
                      Solve path complete — restart the transport to replay it.
                    </Text>
                  )}
                  {mode === 'solve' && (
                    <Text type="supporting" color="secondary">
                      Seeded pencil marks surround the center box — place the
                      5 at R5C5 and watch seven stale marks fade in one
                      atomic move.
                    </Text>
                  )}
                </VStack>
              </div>
              {/* <=1024px: the end panel's content flows below the board. */}
              {isNarrow && (
                <div style={styles.inlinePanel}>
                  <Divider />
                  {mode === 'coach' ? (
                    <VStack gap={2} style={{paddingTop: 'var(--spacing-3)'}}>
                      <Heading level={3}>All steps</Heading>
                      <CoachStepList
                        coachIndex={coachIndex}
                        onJump={coachJump}
                      />
                    </VStack>
                  ) : (
                    solvePanel
                  )}
                </div>
              )}
              <div aria-live="polite" style={styles.visuallyHidden}>
                {liveMessage}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label={mode === 'coach' ? 'Solve path coach' : 'Attempt panel'}>
              <div style={styles.panelScroll}>{panelContent}</div>
            </LayoutPanel>
          )
        }
        footer={footer}
      />
    </>
  );
}
