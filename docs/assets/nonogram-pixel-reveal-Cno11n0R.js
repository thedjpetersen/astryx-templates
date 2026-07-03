var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file nonogram-pixel-reveal.tsx
 * @input Deterministic fixtures only (a single 10x10 picross solution — a
 *   recognizable pixel-art fox authored as ten glyph strings with a matching
 *   per-cell warm-palette map — plus a scripted hint order with authored
 *   teaching copy; every row and column clue is DERIVED from the solution
 *   grid at module scope, so the puzzle and its hints can never drift; no
 *   clocks, no randomness, no network assets — the solve timer is a plain
 *   tick counter advanced by setInterval while the puzzle is live)
 * @output NONOGRAM PICTURE LOGIC surface: a 10x10 picross board flanked by
 *   row and column clue ledges; stroke-based drag painting with pointer
 *   capture where the FIRST cell of the stroke decides fill-vs-erase (plus a
 *   tap fallback and a full keyboard path — arrows move a roving cursor,
 *   Enter/Space paints, X crosses — all driving the identical commit logic);
 *   each completed stroke lands as one undoable entry in the stroke log;
 *   clue groups live-validate (satisfied runs dim to a muted token,
 *   contradictions turn the clue red); a three-heart mistakes budget checked
 *   against the fixture solution on fill (never on cross); a hint button
 *   that fills one authored teaching cell from the scripted order with a
 *   spotlight callout explaining which clue forces it; and a completion
 *   payoff where filled cells bloom row-by-row from abstract squares into
 *   the fox's warm colors before a panel shows time, mistakes, hints, and a
 *   mini share-card silhouette rendered as inline SVG
 * @position Page template; emitted by \`astryx template nonogram-pixel-reveal\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title +
 * caption, hearts meter, tick-counter timer, comfortable/compact zoom
 * SegmentedControl). LayoutContent scrolls a centered max-width-860 column:
 * paint-tool toolbar (Fill/Cross mode, undo, hint, restart), the spotlight /
 * locked / solved callout strip, then the bordered board panel with its clue
 * ledges. LayoutPanel end 320 hosts the solve log (progress, stroke log
 * list, how-to-play rules) with its own vertical scroll.
 *
 * Responsive contract:
 * - >1024px: header | content column | solve-log panel docked at the end
 *   edge (width 320) with its own scroll.
 * - <=1024px: the end panel leaves the frame; the solve log renders below
 *   the board inside the shared LayoutContent scroller.
 * - <=640px (single-pane fallback, usable at 375px): header rows and the
 *   toolbar flex-wrap onto multiple lines; toolbar buttons upsize to md
 *   (~40px tap targets); the board panel is the page's single deliberate
 *   overflow-x region. Compact zoom sizes cells container-relatively
 *   (10 fr-columns of a 100%-width grid) so ten columns plus both ledges
 *   fit a 375px viewport outright; comfortable zoom keeps a 560px minimum
 *   board and pans sideways inside its own panel. Individual cells dip
 *   below 40px only in compact zoom — stroke painting, the tap fallback,
 *   and the keyboard cursor all still target them, and every chrome
 *   control keeps ~40px touch height. Nothing is hover-only.
 *
 * Container policy (puzzle-toy archetype): frame-first rows and one
 * bordered board panel — no Cards for chrome. The board is a hand-rolled
 * CSS grid (ledge column + 10 fr columns) of plain button cells; drag
 * painting is pointer events with setPointerCapture on the grid and
 * elementFromPoint hit-testing, with touch-action: none scoped to the board
 * so painting never fights page scroll. The completion bloom is a
 * row-index reveal counter advanced by setInterval (state a pure function
 * of the counter), with background-color transitions and the hint
 * spotlight pulse both disabled under prefers-reduced-motion (a static
 * ring and an instant reveal remain).
 *
 * Color policy: token-pure. All chrome is var(--color-*) tokens or
 * color-mix() over tokens; the abstract cell ink and the fox's three warm
 * palette stops are explicit light-dark() pairs, so cell fills, crosses,
 * and both clue ledges stay readable in dark mode.
 */

import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Stat} from '@astryxdesign/core/Stat';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  HeartCrackIcon,
  HeartIcon,
  LightbulbIcon,
  PaintbrushIcon,
  RotateCcwIcon,
  SparklesIcon,
  TimerIcon,
  TriangleAlertIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// Abstract (pre-reveal) fill ink: a neutral slate pair that reads as "logic
// squares" in both schemes, deliberately colder than the fox palette so the
// completion bloom lands as a payoff.
const ABSTRACT_FILL = 'light-dark(#334155, #C3CEE0)';

const styles: Record<string, CSSProperties> = {
  column: {
    maxWidth: 860,
    marginInline: 'auto',
    width: '100%',
  },
  headerRow: {flexWrap: 'wrap'},
  toolbarRow: {flexWrap: 'wrap'},
  heartsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  heartLost: {opacity: 0.35},
  timerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
  },
  // Bordered board panel; on phones it is the page's single deliberate
  // overflow-x region (comfortable zoom pans inside it).
  boardPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
  },
  boardScroll: {overflowX: 'auto'},
  // The board grid: one ledge column + ten container-relative fr columns.
  // touch-action none is scoped here so drag painting never pans the page.
  board: {
    display: 'grid',
    touchAction: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    marginInline: 'auto',
  },
  corner: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 4,
  },
  colClue: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 1,
    paddingBottom: 6,
    minWidth: 0,
  },
  rowClue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingRight: 8,
    minWidth: 0,
  },
  clueNumber: {
    fontVariantNumeric: 'tabular-nums',
    fontWeight: 600,
    lineHeight: 1.1,
    color: 'var(--color-text-primary)',
  },
  clueSatisfied: {
    color: 'var(--color-text-secondary)',
    opacity: 0.45,
    fontWeight: 400,
  },
  clueContradicted: {
    color: 'var(--color-error)',
  },
  cell: {
    aspectRatio: '1 / 1',
    minWidth: 0,
    width: '100%',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-card)',
    borderStyle: 'solid',
    borderColor: 'var(--color-border)',
    borderWidth: 0,
    cursor: 'pointer',
  },
  crossInk: {
    color: 'var(--color-text-secondary)',
    display: 'inline-flex',
    pointerEvents: 'none',
  },
  // Spotlight ring for the hinted cell; the pulse animation only exists
  // inside a prefers-reduced-motion: no-preference media block.
  spotlightStatic: {
    boxShadow:
      '0 0 0 3px color-mix(in srgb, var(--color-accent) 80%, transparent)',
    position: 'relative',
    zIndex: 1,
  },
  callout: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  calloutHint: {
    borderColor: 'color-mix(in srgb, var(--color-accent) 45%, transparent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 8%, var(--color-background-card))',
  },
  calloutLocked: {
    borderColor: 'color-mix(in srgb, var(--color-error) 45%, transparent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-error) 8%, var(--color-background-card))',
  },
  calloutSolved: {
    borderColor: 'color-mix(in srgb, var(--color-success) 45%, transparent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-success) 8%, var(--color-background-card))',
  },
  shareRow: {flexWrap: 'wrap'},
  // Solve-log panel internals.
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: 'var(--color-accent)',
  },
  logRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    minHeight: 32,
  },
  logGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 6,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  logGlyphMistake: {
    backgroundColor:
      'color-mix(in srgb, var(--color-error) 15%, var(--color-background-muted))',
    color: 'var(--color-error)',
  },
  logGlyphHint: {
    backgroundColor:
      'color-mix(in srgb, var(--color-accent) 15%, var(--color-background-muted))',
    color: 'var(--color-accent)',
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

// The only stylesheet in the file: the hint-spotlight pulse, wrapped in a
// no-preference media block so reduced-motion users get the static ring.
const SPOTLIGHT_KEYFRAMES = \`
@media (prefers-reduced-motion: no-preference) {
  @keyframes nonogram-spotlight-pulse {
    0%, 100% {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-accent) 80%, transparent);
    }
    50% {
      box-shadow: 0 0 0 7px color-mix(in srgb, var(--color-accent) 30%, transparent);
    }
  }
}
\`;

// ============= FIXTURE: THE FOX =============
// The single source of truth. '#' = filled. Every clue below is DERIVED
// from these ten strings at module scope, so board, ledges, hints, and the
// share card can never drift apart.

const SIZE = 10;

const SOLUTION_ROWS = [
  '##......##', // ear tips
  '###....###',
  '####..####',
  '##########', // brow band
  '#.##..##.#', // eyes
  '##########', // cheek band
  '.###..###.',
  '..######..', // muzzle
  '...####...',
  '....##....', // nose tip
] as const;

// Warm palette map, aligned cell-for-cell with the solution: d = deep rust
// (ears, nose), o = fox orange (face), w = cream (muzzle). Revealed only by
// the completion bloom — until then every filled cell is the abstract ink.
const FOX_COLOR_ROWS = [
  'dd......dd',
  'ddd....ddd',
  'ddoo..oodd',
  'dooooooood',
  'o.oo..oo.o',
  'oowwwwwwoo',
  '.oww..wwo.',
  '..owwwwo..',
  '...wddw...',
  '....dd....',
] as const;

// Fox palette: explicit light-dark() pairs (brighter in dark so the reveal
// keeps its warmth on a dark board).
const FOX_PALETTE: Record<string, string> = {
  d: 'light-dark(#8C3B10, #C05621)',
  o: 'light-dark(#E8722E, #F08A44)',
  w: 'light-dark(#F7DFB8, #EBD3A8)',
};

const SOLUTION: boolean[] = SOLUTION_ROWS.flatMap(row =>
  row.split('').map(glyph => glyph === '#'),
);

const SOLUTION_CELL_COUNT = SOLUTION.filter(Boolean).length;

function cellIndex(row: number, col: number): number {
  return row * SIZE + col;
}

/** Run-length clue for one line of booleans (picross convention). */
function cluesOf(line: boolean[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const filled of line) {
    if (filled) {
      run += 1;
    } else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) {
    clues.push(run);
  }
  return clues.length > 0 ? clues : [0];
}

const ROW_CLUES: number[][] = Array.from({length: SIZE}, (_, row) =>
  cluesOf(Array.from({length: SIZE}, (_, col) => SOLUTION[cellIndex(row, col)])),
);

const COL_CLUES: number[][] = Array.from({length: SIZE}, (_, col) =>
  cluesOf(Array.from({length: SIZE}, (_, row) => SOLUTION[cellIndex(row, col)])),
);

/** Fox color for a solution cell, falling back to the abstract ink. */
function foxColorAt(row: number, col: number): string {
  return FOX_PALETTE[FOX_COLOR_ROWS[row][col]] ?? ABSTRACT_FILL;
}

// ============= SCRIPTED HINTS =============
// Authored teaching cells in a fixed order; each names the clue that forces
// the cell. All targets are solution-true by construction (asserted against
// the derived SOLUTION at module scope), so a hint can never cost a heart.

interface HintSpec {
  row: number;
  col: number;
  text: string;
}

const HINTS: readonly HintSpec[] = [
  {
    row: 3,
    col: 4,
    text: 'Row 4 reads a single 10 — one run spans the whole row, so every cell in it must fill.',
  },
  {
    row: 5,
    col: 5,
    text: 'Row 6 also reads 10 — a second full band, the widest part of the picture.',
  },
  {
    row: 4,
    col: 2,
    text: 'Column 3 reads 7. A seven-run in ten cells overlaps itself: rows 4 through 7 fill no matter where it slides.',
  },
  {
    row: 6,
    col: 6,
    text: 'Column 7 reads 7 as well — the same overlap argument forces rows 4 through 7 on the right side too.',
  },
  {
    row: 2,
    col: 2,
    text: 'Row 3 reads 4 4 — nine of ten cells are spoken for, so the first four-run must cover columns 2 through 4.',
  },
  {
    row: 2,
    col: 7,
    text: 'Row 3 reads 4 4 — mirrored on the right, the second four-run must cover columns 7 through 9.',
  },
];

const FALLBACK_HINT_TEXT =
  'The scripted lessons are spent — revealing the next unfinished cell of the picture.';

// Fixture guard: a hint pointing at an empty solution cell would be a
// fixture bug, so fail loudly at module evaluation time.
for (const hint of HINTS) {
  if (!SOLUTION[cellIndex(hint.row, hint.col)]) {
    throw new Error(
      \`Hint target \${hint.row},\${hint.col} is not part of the solution\`,
    );
  }
}

// ============= LINE VALIDATION =============

type Mark = 'empty' | 'filled' | 'crossed';

interface LineEval {
  /** Per clue group: provably placed and closed, so the ledge dims it. */
  satisfied: boolean[];
  /** The line can no longer match its clue — the ledge turns red. */
  isContradicted: boolean;
  /** Filled runs equal the clue exactly. */
  isComplete: boolean;
}

/**
 * Live ledge validation for one row or column. Front and back scans dim
 * clue groups whose runs are closed (bounded by crosses or the edge) in a
 * fully decided prefix/suffix — the standard picross ledge behavior — and
 * a handful of cheap impossibility checks turn the whole clue red.
 */
function evaluateLine(
  marks: readonly Mark[],
  clue: readonly number[],
): LineEval {
  const satisfied = clue.map(() => false);
  let isContradicted = false;

  const runs: Array<{start: number; end: number}> = [];
  let scan = 0;
  while (scan < marks.length) {
    if (marks[scan] === 'filled') {
      let end = scan;
      while (end < marks.length && marks[end] === 'filled') {
        end += 1;
      }
      runs.push({start: scan, end});
      scan = end;
    } else {
      scan += 1;
    }
  }

  const runLengths = runs.map(run => run.end - run.start);
  const filledCount = runLengths.reduce((sum, len) => sum + len, 0);
  const clueTotal = clue.reduce((sum, len) => sum + len, 0);
  const maxClue = Math.max(...clue);
  const isDecided = marks.every(mark => mark !== 'empty');
  const isComplete =
    runLengths.length === clue.length &&
    runLengths.every((len, group) => len === clue[group]);

  if (filledCount > clueTotal) {
    isContradicted = true;
  }
  if (runLengths.some(len => len > maxClue)) {
    isContradicted = true;
  }
  if (runs.length > clue.length) {
    isContradicted = true;
  }
  if (isDecided && !isComplete) {
    isContradicted = true;
  }

  if (isComplete) {
    satisfied.fill(true);
    return {satisfied, isContradicted, isComplete};
  }

  // Front scan: consume crosses, then demand each closed run match the
  // next clue group; stop at the first undecided cell or open run.
  let pos = 0;
  let group = 0;
  while (group < clue.length && pos < marks.length) {
    if (marks[pos] === 'crossed') {
      pos += 1;
      continue;
    }
    if (marks[pos] === 'empty') {
      break;
    }
    let end = pos;
    while (end < marks.length && marks[end] === 'filled') {
      end += 1;
    }
    if (end < marks.length && marks[end] !== 'crossed') {
      break; // open run — cannot attribute it yet
    }
    if (end - pos === clue[group]) {
      satisfied[group] = true;
      group += 1;
      pos = end;
    } else {
      isContradicted = true;
      break;
    }
  }

  // Back scan, mirrored; never claims groups the front scan already took.
  let backPos = marks.length - 1;
  let backGroup = clue.length - 1;
  while (backGroup >= group && backPos >= pos) {
    if (marks[backPos] === 'crossed') {
      backPos -= 1;
      continue;
    }
    if (marks[backPos] === 'empty') {
      break;
    }
    let start = backPos;
    while (start >= 0 && marks[start] === 'filled') {
      start -= 1;
    }
    if (start >= 0 && marks[start] !== 'crossed') {
      break;
    }
    if (backPos - start === clue[backGroup]) {
      satisfied[backGroup] = true;
      backGroup -= 1;
      backPos = start;
    } else {
      isContradicted = true;
      break;
    }
  }

  return {satisfied, isContradicted, isComplete};
}

// ============= GAME MODEL =============

type Tool = 'fill' | 'cross';
type StrokeAction = 'apply' | 'erase';
type GameStatus = 'playing' | 'locked' | 'solved';

const MAX_HEARTS = 3;

interface PaintResult {
  after: Mark;
  isMistake: boolean;
}

/**
 * The single commit rule shared by drag strokes, taps, keyboard, and hints:
 * applying paints only empty cells (a wrong fill converts to a cross and
 * costs a heart — crosses are never checked); erasing only removes the
 * stroke tool's own mark.
 */
function resolvePaint(
  index: number,
  before: Mark,
  tool: Tool,
  action: StrokeAction,
): PaintResult | null {
  if (action === 'apply') {
    if (before !== 'empty') {
      return null;
    }
    if (tool === 'fill') {
      return SOLUTION[index]
        ? {after: 'filled', isMistake: false}
        : {after: 'crossed', isMistake: true};
    }
    return {after: 'crossed', isMistake: false};
  }
  const target: Mark = tool === 'fill' ? 'filled' : 'crossed';
  return before === target ? {after: 'empty', isMistake: false} : null;
}

interface CellChange {
  index: number;
  before: Mark;
  after: Mark;
}

type StrokeKind = 'fill' | 'cross' | 'erase' | 'mistake' | 'hint';

interface StrokeEntry {
  id: number;
  kind: StrokeKind;
  label: string;
  changes: CellChange[];
}

interface StrokeState {
  pointerId: number;
  tool: Tool;
  action: StrokeAction;
  visited: Set<number>;
  changes: CellChange[];
  hitMistake: boolean;
  ended: boolean;
}

interface Spotlight {
  index: number;
  text: string;
}

function positionLabel(index: number): string {
  return \`row \${Math.floor(index / SIZE) + 1}, column \${(index % SIZE) + 1}\`;
}

function strokeLabel(kind: StrokeKind, changes: CellChange[]): string {
  const count = changes.length;
  const plural = count === 1 ? 'cell' : 'cells';
  switch (kind) {
    case 'fill':
      return \`Filled \${count} \${plural}\`;
    case 'cross':
      return \`Crossed \${count} \${plural}\`;
    case 'erase':
      return \`Erased \${count} \${plural}\`;
    case 'mistake':
      return \`Mistake at \${positionLabel(changes[changes.length - 1].index)}\`;
    case 'hint':
      return \`Hint filled \${positionLabel(changes[0].index)}\`;
  }
}

function formatTicks(ticks: number): string {
  const minutes = Math.floor(ticks / 60);
  const seconds = ticks % 60;
  return \`\${minutes}:\${String(seconds).padStart(2, '0')}\`;
}

// ============= CLUE LEDGES =============

function clueStatusText(evaluation: LineEval): string {
  if (evaluation.isContradicted) {
    return 'contradiction';
  }
  if (evaluation.isComplete) {
    return 'complete';
  }
  return 'in progress';
}

function ClueGroups({
  clue,
  evaluation,
  fontSize,
}: {
  clue: number[];
  evaluation: LineEval;
  fontSize: number;
}) {
  return (
    <>
      {clue.map((run, group) => (
        <span
          key={group}
          style={{
            ...styles.clueNumber,
            fontSize,
            ...(evaluation.satisfied[group] ? styles.clueSatisfied : null),
            ...(evaluation.isContradicted ? styles.clueContradicted : null),
          }}>
          {run}
        </span>
      ))}
    </>
  );
}

// ============= SHARE CARD =============

/**
 * Mini share-card silhouette: the solved fox re-rendered as inline SVG
 * rects in the warm palette on a muted plaque — the artifact a real picross
 * app would let you post.
 */
function ShareCard() {
  const cellSpan = 10;
  const pad = 10;
  const side = pad * 2 + SIZE * cellSpan;
  return (
    <svg
      viewBox={\`0 0 \${side} \${side}\`}
      width={128}
      height={128}
      role="img"
      aria-label="Share card: the completed fox pixel picture">
      <rect
        x={0}
        y={0}
        width={side}
        height={side}
        rx={12}
        fill="var(--color-background-muted)"
      />
      {SOLUTION_ROWS.map((rowGlyphs, row) =>
        rowGlyphs.split('').map((glyph, col) =>
          glyph === '#' ? (
            <rect
              key={\`\${row}-\${col}\`}
              x={pad + col * cellSpan + 0.5}
              y={pad + row * cellSpan + 0.5}
              width={cellSpan - 1}
              height={cellSpan - 1}
              rx={2}
              fill={foxColorAt(row, col)}
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

// ============= SOLVE LOG =============

function StrokeLog({entries}: {entries: StrokeEntry[]}) {
  if (entries.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        No strokes yet. Drag across the board to paint a run — the whole
        stroke lands here as one undoable entry.
      </Text>
    );
  }
  const recent = [...entries].reverse().slice(0, 14);
  return (
    <VStack gap={1}>
      {recent.map(entry => {
        const glyphStyle: CSSProperties = {
          ...styles.logGlyph,
          ...(entry.kind === 'mistake' ? styles.logGlyphMistake : null),
          ...(entry.kind === 'hint' ? styles.logGlyphHint : null),
        };
        const glyphIcon =
          entry.kind === 'mistake'
            ? TriangleAlertIcon
            : entry.kind === 'hint'
              ? SparklesIcon
              : entry.kind === 'cross'
                ? XIcon
                : entry.kind === 'erase'
                  ? Undo2Icon
                  : PaintbrushIcon;
        return (
          <div key={entry.id} style={styles.logRow}>
            <span style={glyphStyle} aria-hidden="true">
              <Icon icon={glyphIcon} size="sm" />
            </span>
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                {entry.label}
              </Text>
            </StackItem>
          </div>
        );
      })}
    </VStack>
  );
}

// ============= PAGE =============

export default function NonogramPixelRevealTemplate() {
  // Cell marks are the single source of truth; a ref mirror lets the
  // pointer-stroke handlers read the latest board between renders.
  const [cells, setCellsState] = useState<Mark[]>(() =>
    new Array<Mark>(SIZE * SIZE).fill('empty'),
  );
  const cellsRef = useRef(cells);
  const setCells = (next: Mark[]) => {
    cellsRef.current = next;
    setCellsState(next);
  };

  const [status, setStatus] = useState<GameStatus>('playing');
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const heartsRef = useRef(hearts);
  const [tool, setTool] = useState<Tool>('fill');
  const [zoom, setZoom] = useState<'comfortable' | 'compact'>('comfortable');
  const [strokeLog, setStrokeLog] = useState<StrokeEntry[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [spotlight, setSpotlight] = useState<Spotlight | null>(null);
  const [mistakes, setMistakes] = useState(0);
  // Solve timer: a plain tick counter — never a clock read.
  const [elapsedTicks, setElapsedTicks] = useState(0);
  // Completion bloom: rows 0..revealRows-1 show fox colors.
  const [revealRows, setRevealRows] = useState(0);
  const [cursor, setCursor] = useState({row: 0, col: 0});
  const [announcement, setAnnouncement] = useState('');

  const strokeRef = useRef<StrokeState | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const entryIdRef = useRef(0);

  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // ---- derived board state ----

  const rowEvals = useMemo(
    () =>
      ROW_CLUES.map((clue, row) =>
        evaluateLine(cells.slice(row * SIZE, (row + 1) * SIZE), clue),
      ),
    [cells],
  );

  const colEvals = useMemo(
    () =>
      COL_CLUES.map((clue, col) =>
        evaluateLine(
          Array.from({length: SIZE}, (_, row) => cells[cellIndex(row, col)]),
          clue,
        ),
      ),
    [cells],
  );

  const correctFills = useMemo(
    () =>
      cells.reduce(
        (count, mark, index) =>
          mark === 'filled' && SOLUTION[index] ? count + 1 : count,
        0,
      ),
    [cells],
  );

  const isSolved = correctFills === SOLUTION_CELL_COUNT;

  // ---- liveness effects (all pure functions of their tick/index) ----

  // Solve timer ticks only while the puzzle is live.
  useEffect(() => {
    if (status !== 'playing') {
      return undefined;
    }
    const id = window.setInterval(() => {
      setElapsedTicks(prev => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [status]);

  // Completion detection: the last correct fill flips the game to solved.
  useEffect(() => {
    if (status === 'playing' && isSolved) {
      setStatus('solved');
      setSpotlight(null);
      setAnnouncement(
        'Puzzle solved! The picture is a fox. Watch the rows bloom into color.',
      );
    }
  }, [status, isSolved]);

  // Row-by-row bloom: an index counter advanced by setInterval; reduced
  // motion reveals the whole picture at once.
  useEffect(() => {
    if (status !== 'solved') {
      return undefined;
    }
    if (prefersReducedMotion) {
      setRevealRows(SIZE);
      return undefined;
    }
    const id = window.setInterval(() => {
      setRevealRows(prev => {
        if (prev >= SIZE) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 150);
    return () => window.clearInterval(id);
  }, [status, prefersReducedMotion]);

  const isRevealDone = status === 'solved' && revealRows >= SIZE;

  // ---- shared commit logic ----

  const pushLogEntry = (kind: StrokeKind, changes: CellChange[]) => {
    entryIdRef.current += 1;
    const entry: StrokeEntry = {
      id: entryIdRef.current,
      kind,
      label: strokeLabel(kind, changes),
      changes,
    };
    setStrokeLog(prev => [...prev, entry]);
  };

  const applyMistake = (index: number) => {
    const nextHearts = Math.max(0, heartsRef.current - 1);
    heartsRef.current = nextHearts;
    setHearts(nextHearts);
    setMistakes(prev => prev + 1);
    if (nextHearts <= 0) {
      setStatus('locked');
      setAnnouncement(
        \`Wrong fill at \${positionLabel(index)} — that was the last heart. Restart to try again.\`,
      );
    } else {
      setAnnouncement(
        \`Wrong fill at \${positionLabel(index)} — auto-crossed. \${nextHearts} \${
          nextHearts === 1 ? 'heart' : 'hearts'
        } left.\`,
      );
    }
  };

  /** Paint one cell inside the active pointer stroke. */
  const paintStrokeCell = (index: number) => {
    const stroke = strokeRef.current;
    if (stroke == null || stroke.ended || stroke.visited.has(index)) {
      return;
    }
    stroke.visited.add(index);
    const before = cellsRef.current[index];
    const result = resolvePaint(index, before, stroke.tool, stroke.action);
    if (result == null) {
      return;
    }
    const next = [...cellsRef.current];
    next[index] = result.after;
    setCells(next);
    stroke.changes.push({index, before, after: result.after});
    if (result.isMistake) {
      stroke.hitMistake = true;
      stroke.ended = true; // a wrong fill breaks the stroke
      applyMistake(index);
    }
  };

  const finishStroke = () => {
    const stroke = strokeRef.current;
    strokeRef.current = null;
    if (stroke == null || stroke.changes.length === 0) {
      return;
    }
    const kind: StrokeKind = stroke.hitMistake
      ? 'mistake'
      : stroke.action === 'erase'
        ? 'erase'
        : stroke.tool === 'fill'
          ? 'fill'
          : 'cross';
    pushLogEntry(kind, stroke.changes);
    setSpotlight(null);
  };

  /**
   * Tap / keyboard commit path: a one-cell stroke through the identical
   * resolvePaint rule, logged as its own undoable entry.
   */
  const commitSingle = (row: number, col: number, commitTool: Tool) => {
    if (status !== 'playing') {
      return;
    }
    const index = cellIndex(row, col);
    const before = cellsRef.current[index];
    const toolMark: Mark = commitTool === 'fill' ? 'filled' : 'crossed';
    const action: StrokeAction = before === toolMark ? 'erase' : 'apply';
    const result = resolvePaint(index, before, commitTool, action);
    if (result == null) {
      return;
    }
    const next = [...cellsRef.current];
    next[index] = result.after;
    setCells(next);
    const change: CellChange = {index, before, after: result.after};
    if (result.isMistake) {
      applyMistake(index);
      pushLogEntry('mistake', [change]);
    } else {
      pushLogEntry(
        action === 'erase' ? 'erase' : commitTool === 'fill' ? 'fill' : 'cross',
        [change],
      );
    }
    setSpotlight(null);
  };

  // ---- pointer stroke handlers (capture on the board grid) ----

  const cellFromEventTarget = (target: EventTarget | null): number | null => {
    if (!(target instanceof Element)) {
      return null;
    }
    const cell = target.closest('[data-cell]');
    if (cell == null) {
      return null;
    }
    const value = cell.getAttribute('data-cell');
    return value == null ? null : Number(value);
  };

  const cellFromPoint = (clientX: number, clientY: number): number | null => {
    const board = boardRef.current;
    if (board == null) {
      return null;
    }
    const element = document.elementFromPoint(clientX, clientY);
    if (element == null || !board.contains(element)) {
      return null;
    }
    return cellFromEventTarget(element);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (status !== 'playing' || strokeRef.current != null) {
      return;
    }
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const index = cellFromEventTarget(event.target);
    if (index == null) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setCursor({row: Math.floor(index / SIZE), col: index % SIZE});
    // The FIRST cell decides the stroke: if it already carries the tool's
    // mark the stroke erases that mark, otherwise it applies it.
    const toolMark: Mark = tool === 'fill' ? 'filled' : 'crossed';
    const action: StrokeAction =
      cellsRef.current[index] === toolMark ? 'erase' : 'apply';
    strokeRef.current = {
      pointerId: event.pointerId,
      tool,
      action,
      visited: new Set(),
      changes: [],
      hitMistake: false,
      ended: false,
    };
    paintStrokeCell(index);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stroke = strokeRef.current;
    if (stroke == null || stroke.ended || stroke.pointerId !== event.pointerId) {
      return;
    }
    const index = cellFromPoint(event.clientX, event.clientY);
    if (index != null) {
      paintStrokeCell(index);
    }
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    const stroke = strokeRef.current;
    if (stroke == null || stroke.pointerId !== event.pointerId) {
      return;
    }
    finishStroke();
  };

  // ---- keyboard path (identical commit logic) ----

  const focusCell = (row: number, col: number) => {
    const board = boardRef.current;
    if (board == null) {
      return;
    }
    const node = board.querySelector<HTMLButtonElement>(
      \`[data-cell="\${cellIndex(row, col)}"]\`,
    );
    node?.focus();
  };

  const handleBoardKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    let dRow = 0;
    let dCol = 0;
    if (event.key === 'ArrowUp') {
      dRow = -1;
    } else if (event.key === 'ArrowDown') {
      dRow = 1;
    } else if (event.key === 'ArrowLeft') {
      dCol = -1;
    } else if (event.key === 'ArrowRight') {
      dCol = 1;
    } else if (event.key === 'x' || event.key === 'X') {
      event.preventDefault();
      commitSingle(cursor.row, cursor.col, 'cross');
      return;
    } else {
      return;
    }
    event.preventDefault();
    const row = Math.min(SIZE - 1, Math.max(0, cursor.row + dRow));
    const col = Math.min(SIZE - 1, Math.max(0, cursor.col + dCol));
    setCursor({row, col});
    focusCell(row, col);
  };

  // Enter/Space on a cell fires a click with detail 0; pointer-driven
  // clicks are ignored because the stroke path already committed them.
  const handleCellClick = (
    event: ReactMouseEvent<HTMLButtonElement>,
    row: number,
    col: number,
  ) => {
    if (event.detail === 0) {
      commitSingle(row, col, tool);
    }
  };

  // ---- toolbar actions ----

  const undoLastStroke = () => {
    if (strokeLog.length === 0 || status !== 'playing') {
      return;
    }
    const entry = strokeLog[strokeLog.length - 1];
    const next = [...cellsRef.current];
    for (const change of entry.changes) {
      next[change.index] = change.before;
    }
    setCells(next);
    setStrokeLog(prev => prev.slice(0, -1));
    setSpotlight(null);
    setAnnouncement(\`Undid: \${entry.label.toLowerCase()}\`);
  };

  const giveHint = () => {
    if (status !== 'playing') {
      return;
    }
    // First scripted hint whose cell is not yet filled; then a generic
    // fallback so the button never goes dead before the solve.
    let target: {index: number; text: string} | null = null;
    for (const hint of HINTS) {
      const index = cellIndex(hint.row, hint.col);
      if (cellsRef.current[index] !== 'filled') {
        target = {index, text: hint.text};
        break;
      }
    }
    if (target == null) {
      for (let index = 0; index < SOLUTION.length; index += 1) {
        if (SOLUTION[index] && cellsRef.current[index] !== 'filled') {
          target = {index, text: FALLBACK_HINT_TEXT};
          break;
        }
      }
    }
    if (target == null) {
      return;
    }
    const before = cellsRef.current[target.index];
    const next = [...cellsRef.current];
    next[target.index] = 'filled';
    setCells(next);
    pushLogEntry('hint', [{index: target.index, before, after: 'filled'}]);
    setHintsUsed(prev => prev + 1);
    setSpotlight({index: target.index, text: target.text});
    setCursor({
      row: Math.floor(target.index / SIZE),
      col: target.index % SIZE,
    });
    setAnnouncement(
      \`Hint: filled \${positionLabel(target.index)}. \${target.text}\`,
    );
  };

  const restart = () => {
    strokeRef.current = null;
    const blank = new Array<Mark>(SIZE * SIZE).fill('empty');
    cellsRef.current = blank;
    setCellsState(blank);
    heartsRef.current = MAX_HEARTS;
    setHearts(MAX_HEARTS);
    setStatus('playing');
    setStrokeLog([]);
    setHintsUsed(0);
    setSpotlight(null);
    setMistakes(0);
    setElapsedTicks(0);
    setRevealRows(0);
    setCursor({row: 0, col: 0});
    setAnnouncement('Board cleared. Three hearts restored.');
  };

  // ---- board geometry (zoom + container-relative sizing) ----

  const isCompact = zoom === 'compact';
  const ledgeWidth = isCompact ? 52 : 76;
  const clueFontSize = isCompact ? 11 : 13;
  // Compact: the grid is 100% of its container (fr columns), so ten cells
  // plus both ledges fit 375px outright. Comfortable: a 560px floor makes
  // the board panel the page's single deliberate overflow-x region.
  const boardSizing: CSSProperties = isCompact
    ? {maxWidth: 460, width: '100%'}
    : {maxWidth: 640, width: '100%', minWidth: 560};

  const cellTransition = prefersReducedMotion
    ? undefined
    : 'background-color 450ms ease';

  const cellVisual = (row: number, col: number): CSSProperties => {
    const index = cellIndex(row, col);
    const mark = cells[index];
    const isBloomed =
      status === 'solved' && mark === 'filled' && row < revealRows;
    const backgroundColor =
      mark === 'filled'
        ? isBloomed
          ? foxColorAt(row, col)
          : ABSTRACT_FILL
        : 'var(--color-background-card)';
    const isSpotlit = spotlight != null && spotlight.index === index;
    return {
      ...styles.cell,
      backgroundColor,
      transition: cellTransition,
      // Picross guides: hairline everywhere, a heavier rule after column 5
      // and row 5, and an outer frame on the first row/column of cells.
      borderTopWidth: row === 0 ? 1 : 0,
      borderLeftWidth: col === 0 ? 1 : 0,
      borderRightWidth: col === 4 ? 2 : 1,
      borderBottomWidth: row === 4 ? 2 : 1,
      ...(isSpotlit
        ? prefersReducedMotion
          ? styles.spotlightStatic
          : {
              ...styles.spotlightStatic,
              animation: 'nonogram-spotlight-pulse 1.2s ease-in-out infinite',
            }
        : null),
      cursor: status === 'playing' ? 'pointer' : 'default',
    };
  };

  const markLabel = (mark: Mark): string =>
    mark === 'filled' ? 'filled' : mark === 'crossed' ? 'crossed' : 'empty';

  // ---- chrome fragments ----

  const heartsMeter = (
    <div
      style={styles.heartsRow}
      role="img"
      aria-label={\`\${hearts} of \${MAX_HEARTS} hearts remaining\`}>
      {Array.from({length: MAX_HEARTS}, (_, slot) => {
        const isLost = slot >= hearts;
        return (
          <span
            key={slot}
            style={{
              color: 'var(--color-error)',
              ...(isLost ? styles.heartLost : null),
            }}
            aria-hidden="true">
            <Icon icon={isLost ? HeartCrackIcon : HeartIcon} size="sm" />
          </span>
        );
      })}
    </div>
  );

  const timerChip = (
    <span style={styles.timerChip}>
      <Icon icon={TimerIcon} size="sm" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatTicks(elapsedTicks)}
      </Text>
    </span>
  );

  const controlSize = isPhone ? 'md' : 'sm';

  const toolbar = (
    <HStack gap={2} vAlign="center" style={styles.toolbarRow}>
      <SegmentedControl
        label="Paint tool"
        value={tool}
        onChange={value => setTool(value as Tool)}
        size={controlSize}>
        <SegmentedControlItem label="Fill" value="fill" />
        <SegmentedControlItem label="Cross" value="cross" />
      </SegmentedControl>
      <IconButton
        label="Undo last stroke"
        tooltip="Undo last stroke"
        size={controlSize}
        variant="secondary"
        icon={<Icon icon={Undo2Icon} size="sm" />}
        isDisabled={strokeLog.length === 0 || status !== 'playing'}
        onClick={undoLastStroke}
      />
      <Button
        label="Hint"
        size={controlSize}
        variant="secondary"
        icon={<Icon icon={LightbulbIcon} size="sm" />}
        isDisabled={status !== 'playing'}
        onClick={giveHint}
      />
      <Button
        label="Restart"
        size={controlSize}
        variant="ghost"
        icon={<Icon icon={RotateCcwIcon} size="sm" />}
        onClick={restart}
      />
      <StackItem size="fill" />
      <Badge
        variant={
          status === 'solved' ? 'green' : status === 'locked' ? 'red' : 'info'
        }
        label={
          status === 'solved'
            ? 'Solved'
            : status === 'locked'
              ? 'Out of hearts'
              : \`\${correctFills}/\${SOLUTION_CELL_COUNT} cells\`
        }
      />
    </HStack>
  );

  const spotlightCallout =
    spotlight != null && status === 'playing' ? (
      <div style={{...styles.callout, ...styles.calloutHint}}>
        <HStack gap={2} vAlign="start">
          <span style={{color: 'var(--color-accent)'}} aria-hidden="true">
            <Icon icon={SparklesIcon} size="sm" />
          </span>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">
                Teaching cell — {positionLabel(spotlight.index)}
              </Text>
              <Text type="supporting" color="secondary">
                {spotlight.text}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Dismiss hint"
            tooltip="Dismiss hint"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={() => setSpotlight(null)}
          />
        </HStack>
      </div>
    ) : null;

  const lockedCallout =
    status === 'locked' ? (
      <div style={{...styles.callout, ...styles.calloutLocked}}>
        <HStack gap={2} vAlign="center" style={styles.toolbarRow}>
          <span style={{color: 'var(--color-error)'}} aria-hidden="true">
            <Icon icon={HeartCrackIcon} size="sm" />
          </span>
          <StackItem size="fill">
            <Text type="body">
              All three hearts are gone — the board is locked. The picture is
              still in there; restart to hunt it down again.
            </Text>
          </StackItem>
          <Button
            label="Restart puzzle"
            size={controlSize}
            variant="primary"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={restart}
          />
        </HStack>
      </div>
    ) : null;

  const solvedCallout =
    status === 'solved' ? (
      <div style={{...styles.callout, ...styles.calloutSolved}}>
        {isRevealDone ? (
          <HStack gap={4} vAlign="center" style={styles.shareRow}>
            <ShareCard />
            <StackItem size="fill">
              <VStack gap={2}>
                <Heading level={2}>It&apos;s a fox!</Heading>
                <HStack gap={4} vAlign="start" style={styles.shareRow}>
                  <Stat label="Time" value={formatTicks(elapsedTicks)} />
                  <Stat
                    label="Mistakes"
                    value={String(mistakes)}
                    description={\`\${hearts} \${
                      hearts === 1 ? 'heart' : 'hearts'
                    } left\`}
                  />
                  <Stat
                    label="Hints"
                    value={String(hintsUsed)}
                    description={\`of \${HINTS.length} scripted\`}
                  />
                </HStack>
                <HStack gap={2}>
                  <Button
                    label="Play again"
                    size={controlSize}
                    variant="secondary"
                    icon={<Icon icon={RotateCcwIcon} size="sm" />}
                    onClick={restart}
                  />
                </HStack>
              </VStack>
            </StackItem>
          </HStack>
        ) : (
          <HStack gap={2} vAlign="center">
            <span style={{color: 'var(--color-success)'}} aria-hidden="true">
              <Icon icon={SparklesIcon} size="sm" />
            </span>
            <Text type="body">Solved — the picture is blooming in…</Text>
          </HStack>
        )}
      </div>
    ) : null;

  // ---- the board ----

  const board = (
    <div
      ref={boardRef}
      role="grid"
      aria-label="Nonogram board, 10 by 10, with row and column clues"
      tabIndex={-1}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleBoardKeyDown}
      style={{
        ...styles.board,
        ...boardSizing,
        gridTemplateColumns: \`\${ledgeWidth}px repeat(\${SIZE}, minmax(0, 1fr))\`,
      }}>
      <div style={styles.corner} aria-hidden="true">
        <Text type="supporting" color="secondary">
          10×10
        </Text>
      </div>
      {COL_CLUES.map((clue, col) => (
        <div
          key={\`col-\${col}\`}
          role="columnheader"
          aria-label={\`Column \${col + 1} clues: \${clue.join(', ')} — \${clueStatusText(
            colEvals[col],
          )}\`}
          style={styles.colClue}>
          <ClueGroups
            clue={clue}
            evaluation={colEvals[col]}
            fontSize={clueFontSize}
          />
        </div>
      ))}
      {ROW_CLUES.map((rowClue, row) => (
        <Fragment key={\`row-\${row}\`}>
          <div
            role="rowheader"
            aria-label={\`Row \${row + 1} clues: \${rowClue.join(', ')} — \${clueStatusText(
              rowEvals[row],
            )}\`}
            style={styles.rowClue}>
            <ClueGroups
              clue={rowClue}
              evaluation={rowEvals[row]}
              fontSize={clueFontSize}
            />
          </div>
          {Array.from({length: SIZE}, (_, col) => {
            const index = cellIndex(row, col);
            const mark = cells[index];
            const isCursor = cursor.row === row && cursor.col === col;
            return (
              <button
                key={index}
                type="button"
                data-cell={index}
                tabIndex={isCursor ? 0 : -1}
                aria-label={\`Row \${row + 1}, column \${col + 1} — \${markLabel(mark)}\`}
                onClick={event => handleCellClick(event, row, col)}
                style={cellVisual(row, col)}>
                {mark === 'crossed' && status !== 'solved' && (
                  <span style={styles.crossInk} aria-hidden="true">
                    <Icon icon={XIcon} size="sm" />
                  </span>
                )}
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );

  const boardPanel = (
    <div style={styles.boardPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" style={styles.toolbarRow}>
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Drag to paint a run · the first cell sets fill or erase
            </Text>
          </StackItem>
          {!isPhone && (
            <Text type="supporting" color="secondary">
              Arrows move · Enter fills · X crosses
            </Text>
          )}
        </HStack>
        <div style={styles.boardScroll}>{board}</div>
      </VStack>
    </div>
  );

  // ---- solve log (docked panel or stacked section) ----

  const progressPct = Math.round(
    (correctFills / SOLUTION_CELL_COUNT) * 100,
  );

  const solveLog = (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Picture progress</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {progressPct}%
          </Text>
        </HStack>
        <div
          style={styles.progressTrack}
          role="img"
          aria-label={\`\${correctFills} of \${SOLUTION_CELL_COUNT} picture cells found\`}>
          <div style={{...styles.progressFill, width: \`\${progressPct}%\`}} />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {correctFills} of {SOLUTION_CELL_COUNT} picture cells · {mistakes}{' '}
          {mistakes === 1 ? 'mistake' : 'mistakes'} · {hintsUsed}{' '}
          {hintsUsed === 1 ? 'hint' : 'hints'}
        </Text>
      </VStack>
      <Divider />
      <VStack gap={2}>
        <Heading level={3}>Stroke log</Heading>
        <StrokeLog entries={strokeLog} />
      </VStack>
      <Divider />
      <VStack gap={2}>
        <Heading level={3}>How to play</Heading>
        <Text type="supporting" color="secondary">
          Clues list the runs of filled cells in each row and column, in
          order, with at least one gap between runs. Satisfied clue groups
          dim; impossible lines turn red.
        </Text>
        <Text type="supporting" color="secondary">
          Wrong fills cost a heart and auto-cross the cell — crosses are
          never checked, so mark eliminations freely. Each drag stroke is
          one undo entry.
        </Text>
      </VStack>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Nonogram Picture Logic</Heading>
                <Text type="supporting" color="secondary">
                  {isPhone
                    ? '10×10 picross · 3 hearts'
                    : '10×10 picross · clues derived from the hidden picture · 3 hearts'}
                </Text>
              </VStack>
            </StackItem>
            {heartsMeter}
            {timerChip}
            <SegmentedControl
              label="Board zoom"
              value={zoom}
              onChange={value => setZoom(value as 'comfortable' | 'compact')}
              size={controlSize}>
              <SegmentedControlItem label="Comfortable" value="comfortable" />
              <SegmentedControlItem label="Compact" value="compact" />
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} padding={0} hasDivider label="Solve log">
            <div style={styles.panelScroll}>{solveLog}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={isPhone ? 4 : 6}>
          <style>{SPOTLIGHT_KEYFRAMES}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.column}>
            <VStack gap={4}>
              {toolbar}
              {spotlightCallout}
              {lockedCallout}
              {solvedCallout}
              {boardPanel}
              {isStacked && (
                <>
                  <Divider />
                  {solveLog}
                </>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};