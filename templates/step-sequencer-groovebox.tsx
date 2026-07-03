// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file step-sequencer-groovebox.tsx
 * @input Deterministic fixtures only (eight drum-machine instruments —
 *   Kick, Snare, Clap, Rim, Closed Hat, Open Hat, Low Tom, Cowbell — each
 *   keyed to a categorical color token with a lucide glyph; four seeded
 *   16-step patterns A–D authored as `.`/`x`/`X` rows parsed into velocity
 *   grids at module load; a fixed A-B-B-C pattern chain; a 124 BPM default
 *   tempo and 20% default swing). No Date.now, no Math.random, no network
 *   assets — every visual is a pure function of one tick counter plus the
 *   edited pattern grids.
 * @output Step Sequencer Groovebox — a drum-machine surface: an
 *   8-instrument × 16-step pad grid where tapping a pad cycles
 *   off → soft → accent and long-pressing (or Shift+Enter / V on a focused
 *   pad) opens a velocity popover with a 0–127 slider and Soft / Accent /
 *   Clear shortcuts. The whole UI derives from a single tick counter:
 *   Play advances the tick via a rAF loop that accumulates frame time
 *   against the swing-warped step duration, the Step button (and →)
 *   advances exactly one column per tap, and the playback cursor column,
 *   the per-pad hit flashes (a brief scale/glow keyed off
 *   tick % 16 === column), the chain position, and the bar readout are all
 *   pure derivations of that one number — no content timers, no
 *   randomness. The transport carries play/pause, step-forward,
 *   return-to-start, a tempo readout with ±4 BPM steppers, and a swing
 *   slider that both warps the step durations and visually skews the
 *   even-numbered step columns downward so swing is legible before you
 *   imagine any sound. Per-row mute/solo LEDs ghost muted rows and isolate
 *   soloed ones; pattern bank chips A–D switch the edit grid; a Follow
 *   Chain toggle locks the displayed grid to whatever the chain is
 *   playing. Below the grid a pattern-chain lane shows the A-B-B-C
 *   arrangement with the active slot glowing and filling as the cursor
 *   wraps; tapping one slot arms it and tapping another swaps the two with
 *   a FLIP settle.
 * @position Page template; emitted by `astryx template step-sequencer-groovebox`
 *
 * Frame: Layout height="fill". LayoutHeader (56px) carries the Groovebox
 * title, a Playing/Paused Badge, the live pattern · bar · step readout,
 * and a return-to-start IconButton. LayoutContent scrolls one centered
 * column (maxWidth 880): transport card, then the pad grid (instrument
 * rail + horizontally scrollable 16-column pad field), then the bank-chip
 * row, then the pattern-chain lane. Choose this over wheel-picker-scheduler
 * when the surface is a rhythmic on/off matrix driven by a transport, and
 * over story-progress-viewer when playback is a wrapping grid cursor
 * rather than chained full-screen frames.
 *
 * Interaction contract:
 * - One tick, one commit path. `advanceTick` / `resetTick` are the only
 *   writers of the counter; the rAF loop, the Step button, → and Home all
 *   call them. Column = tick % 16, chain position = floor(tick / 16) % 4,
 *   active pattern = chain[position] — nothing else stores playback state.
 * - Pads are real <button>s: click/Enter/Space cycles off → soft → accent
 *   via the same `cyclePad` commit the pointer path uses; the long-press
 *   pointer gesture (pointer capture + 350ms timer) and the Shift+Enter /
 *   V keyboard path open the identical velocity popover.
 * - The velocity popover edits the same grid cell through one
 *   `setVelocity` function whether the slider, Soft, Accent, or Clear
 *   drove it; Escape, the Done button, and the backdrop all close it.
 * - Chain reorder is arm-then-swap: tapping a slot arms it (dashed ring),
 *   tapping a second swaps the two entries. Slots are buttons, so the
 *   keyboard path is the same commit; the FLIP settle measures rects
 *   before commit and plays the inverted transform after layout.
 * - Every commit announces through a visually hidden aria-live region.
 * - Reduced motion: hit flashes keep the glow but drop the scale, pad and
 *   chain transitions flatten, the FLIP settle is skipped, and the
 *   auto-scroll uses behavior:'auto' — every animated affordance has a
 *   non-animated equivalent.
 *
 * Responsive contract:
 * - >640px: header | transport card | instrument rail (140px: glyph, name,
 *   mute/solo LEDs) beside the 16-column pad field | bank chips + follow
 *   toggle | chain lane. The pad field is 700px of fixed 40px pads and
 *   scrolls horizontally with scroll-snap per 4-step bar whenever the
 *   viewport is narrower than the grid.
 * - <=640px (usable at 375px): single column — instrument labels collapse
 *   to an icon rail (glyph + mute/solo LEDs, no names), the pad field
 *   scrolls horizontally with scroll-snap at each bar boundary and
 *   auto-scrolls to keep the cursor column in view during play, the tempo
 *   steppers and transport buttons hold ~40px tap targets, the Kbd hint
 *   row hides, and the chain slots stay tappable at 64px. Nothing is
 *   hover-only — tap, long-press, and buttons carry every interaction.
 * - Horizontal overflow is deliberate and scoped to the pad scroller;
 *   the page itself never scrolls sideways.
 *
 * Container policy (instrument-surface archetype): frame-first chrome with
 * the transport in a Card; the pad grid, LEDs, bank chips' lane, and chain
 * slots are hand-rolled shells (radius/shadow tokens, CSS transforms, one
 * FLIP transition) because they need full ownership of per-cell paint,
 * scroll-snap, and transform timing. No chart engine, no gesture library,
 * no audio — swing and hits are visual by design.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair. Instrument
 * hues ride the categorical data ramp (scheme-aware by definition) with
 * semantic fallbacks; pad-off faces, ghosted rows, and LED-off lenses are
 * explicit light-dark() pairs so the hardware look holds in both schemes.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  AudioLinesIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleDotIcon,
  Disc3Icon,
  DiscIcon,
  DrumIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkipBackIcon,
  StepForwardIcon,
  TriangleIcon,
  WavesIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

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
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SEQUENCER GEOMETRY & TIMING =============
// The whole surface hangs off a handful of numbers: pad size, steps per
// pattern, and the tick→duration math. All timers below are gesture or
// playback-cadence bookkeeping — pattern content is pure fixture data and
// every visual derives from the tick counter.

/** Steps per pattern — one 16th-note bar. */
const STEPS = 16;
/** Steps per snap bar (scroll-snap unit on narrow screens). */
const BAR = 4;
/** Pad cell size — also the ~40px tap target. */
const PAD = 40;
/** Gap between pads. */
const PAD_GAP = 4;
/** Column header height above the pads. */
const HEADER_H = 26;
/** Press longer than this and the pointer-down is a long-press, not a tap. */
const LONG_PRESS_MS = 350;
/** Hit-flash / pad transition length. */
const FLASH_MS = 130;
/** FLIP settle duration for chain swaps. */
const FLIP_MS = 260;
const FLIP_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';

/** Velocity written by the tap cycle's "soft" stop. */
const SOFT_VEL = 72;
/** Velocity written by the tap cycle's "accent" stop. */
const ACCENT_VEL = 118;
/** At or above this velocity a pad reads as an accent. */
const ACCENT_AT = 96;

const MIN_BPM = 60;
const MAX_BPM = 200;
const BPM_STEP = 4;
const MAX_SWING = 60;

/** Base 16th-note length in ms for a tempo. */
function baseStepMs(bpm: number): number {
  return 15000 / bpm;
}

/**
 * Swing-warped duration of the step starting at `tick`: on-beats (even
 * tick) stretch by the swing fraction, off-beats shrink by it, so a pair
 * always sums to two base steps and the bar length never drifts.
 */
function stepDurationMs(tick: number, bpm: number, swing: number): number {
  const base = baseStepMs(bpm);
  const frac = swing / 100;
  return tick % 2 === 0 ? base * (1 + frac) : base * (1 - frac);
}

// ============= HARDWARE INK (token-pure) =============
// The groovebox look needs pad faces and LED lenses that read as unlit
// plastic in light scheme and as a dark faceplate in dark scheme — each is
// an explicit light-dark() pair over tokens, per the color policy.

/** Unlit pad face. */
const PAD_OFF =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 6%, var(--color-background)), color-mix(in srgb, var(--color-text-primary) 13%, var(--color-background)))';
/** Unlit pad face on bar 2 and 4 columns — subtle 4-step banding. */
const PAD_OFF_ALT =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 10%, var(--color-background)), color-mix(in srgb, var(--color-text-primary) 18%, var(--color-background)))';
/** Ghosted (muted / not-soloed) pad fill — the row's "power off" state. */
const PAD_GHOST =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 4%, var(--color-background)), color-mix(in srgb, var(--color-text-primary) 8%, var(--color-background)))';
/** Unlit LED lens for mute/solo and the step header. */
const LED_OFF =
  'light-dark(color-mix(in srgb, var(--color-text-primary) 14%, var(--color-background)), color-mix(in srgb, var(--color-text-primary) 24%, var(--color-background)))';
/** Lit mute LED. */
const LED_MUTE = 'var(--color-error)';
/** Lit solo LED. */
const LED_SOLO = 'var(--color-warning)';
/** Playback cursor tint for the active column. */
const CURSOR_TINT = 'color-mix(in srgb, var(--color-accent) 16%, transparent)';

// ============= INJECTED CSS =============
// The typed style-object idiom covers everything except :focus-visible
// rings, the pad transition (so the hit flash settles), and its
// reduced-motion guard.

const GROOVE_CSS = `
.ssg-pad {
  transition: transform ${FLASH_MS}ms ease, box-shadow ${FLASH_MS}ms ease,
    background-color ${FLASH_MS}ms ease;
}
.ssg-pad:focus-visible,
.ssg-led:focus-visible,
.ssg-slot:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
@media (prefers-reduced-motion: reduce) {
  .ssg-pad {
    transition: none;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Scrolling page column.
  column: {
    width: '100%', maxWidth: 880, marginInline: 'auto',
    padding: 'var(--spacing-4) 16px var(--spacing-6)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)',
  },
  columnPhone: {padding: 'var(--spacing-3) 8px var(--spacing-5)'},
  // Transport internals.
  tempoBox: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)'},
  tempoReadout: {
    minWidth: 76, textAlign: 'center', fontVariantNumeric: 'tabular-nums',
    fontWeight: 600, fontSize: 15,
  },
  swingBox: {minWidth: 170, flex: 1, maxWidth: 280},
  transportButton: {width: 40, height: 40},
  // Grid shell: instrument rail + horizontally scrollable pad field.
  gridShell: {
    display: 'flex', gap: PAD_GAP,
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-low)',
    padding: 'var(--spacing-3)',
  },
  rail: {
    display: 'flex', flexDirection: 'column', gap: PAD_GAP,
    flexShrink: 0, width: 140,
  },
  railCompact: {width: 84},
  railHeaderSpacer: {height: HEADER_H},
  railRow: {
    height: PAD, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0,
  },
  railName: {
    fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', minWidth: 0, flex: 1,
    color: 'var(--color-text-primary)',
  },
  railGlyph: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 22, flexShrink: 0,
  },
  // Mute/solo LED buttons: 22px lens inside a 28×40 hit area.
  ledButton: {
    width: 28, height: PAD, display: 'inline-flex', alignItems: 'center',
    justifyContent: 'center', border: 'none', background: 'transparent',
    padding: 0, cursor: 'pointer', flexShrink: 0,
    borderRadius: 'var(--radius-element)',
  },
  ledLens: {
    width: 22, height: 22, borderRadius: '50%', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', fontSize: 10,
    fontWeight: 700, border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: LED_OFF, color: 'var(--color-text-secondary)',
  },
  // Pad field: deliberate horizontal overflow with per-bar snap points.
  padScroller: {
    overflowX: 'auto', overflowY: 'hidden', scrollSnapType: 'x mandatory',
    overscrollBehavior: 'contain', minWidth: 0, flex: 1,
  },
  padColumnHeader: {
    display: 'grid', gridTemplateColumns: `repeat(${STEPS}, ${PAD}px)`,
    gap: PAD_GAP, height: HEADER_H, marginBottom: PAD_GAP,
  },
  headerCell: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-end', gap: 3, fontSize: 10,
    fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)',
  },
  headerLamp: {
    width: 16, height: 4, borderRadius: 'var(--radius-full)',
    backgroundColor: LED_OFF,
  },
  headerLampOn: {
    backgroundColor: 'var(--color-accent)',
    boxShadow: '0 0 6px color-mix(in srgb, var(--color-accent) 70%, transparent)',
  },
  padRow: {
    display: 'grid', gridTemplateColumns: `repeat(${STEPS}, ${PAD}px)`,
    gap: PAD_GAP, marginBottom: PAD_GAP,
  },
  pad: {
    width: PAD, height: PAD,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)', cursor: 'pointer', padding: 0,
    touchAction: 'manipulation', userSelect: 'none', WebkitUserSelect: 'none',
  },
  // Bank chips + follow toggle.
  bankRow: {
    display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-2)',
    alignItems: 'center',
  },
  // Pattern-chain lane.
  chainLane: {display: 'flex', gap: 'var(--spacing-2)', alignItems: 'stretch'},
  chainSlot: {
    position: 'relative', width: 64, minHeight: 64,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)', backgroundColor: PAD_OFF,
    cursor: 'pointer', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 2,
    padding: 'var(--spacing-1)', overflow: 'hidden',
    color: 'var(--color-text-primary)',
  },
  chainSlotArmed: {borderStyle: 'dashed', borderColor: 'var(--color-accent)'},
  chainLetter: {fontSize: 20, fontWeight: 700, lineHeight: 1},
  chainSlotIndex: {fontSize: 10, color: 'var(--color-text-secondary)'},
  // Wrap-progress fill inside the active chain slot — pure f(tick).
  chainFill: {position: 'absolute', insetBlock: 0, left: 0, pointerEvents: 'none'},
  chainContent: {
    position: 'relative', display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 2,
  },
  hintRow: {flexWrap: 'wrap'},
  // Velocity popover: fixed, token-surfaced, above a click-away backdrop.
  popoverBackdrop: {
    position: 'fixed', inset: 0, zIndex: 30, background: 'transparent',
    border: 'none', padding: 0, cursor: 'default',
  },
  popover: {
    position: 'fixed', zIndex: 31, width: 248,
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-3)', display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  visuallyHidden: {
    position: 'absolute', width: '1px', height: '1px', margin: '-1px',
    padding: 0, overflow: 'hidden', clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: eight instruments keyed by categorical color
// tokens (semantic fallbacks keep the file valid without the data ramp),
// four seeded patterns, one seeded chain.

interface Instrument {
  id: string;
  name: string;
  short: string;
  color: string;
  icon: typeof DrumIcon;
}

const cat = (hue: string, fallback: string) =>
  `var(--color-data-categorical-${hue}, var(--color-${fallback}))`;

const INSTRUMENTS: readonly Instrument[] = [
  {id: 'kick', name: 'Kick', short: 'BD', color: cat('red', 'error'), icon: CircleDotIcon},
  {id: 'snare', name: 'Snare', short: 'SD', color: cat('orange', 'warning'), icon: DrumIcon},
  {id: 'clap', name: 'Clap', short: 'CP', color: cat('yellow', 'warning'), icon: ZapIcon},
  {id: 'rim', name: 'Rim', short: 'RS', color: cat('pink', 'accent'), icon: TriangleIcon},
  {id: 'chat', name: 'Closed Hat', short: 'CH', color: cat('teal', 'success'), icon: DiscIcon},
  {id: 'ohat', name: 'Open Hat', short: 'OH', color: cat('cyan', 'accent'), icon: Disc3Icon},
  {id: 'tom', name: 'Low Tom', short: 'LT', color: cat('purple', 'accent'), icon: WavesIcon},
  {id: 'cow', name: 'Cowbell', short: 'CB', color: cat('green', 'success'), icon: BellIcon},
];

const ROWS = INSTRUMENTS.length;

type BankId = 'A' | 'B' | 'C' | 'D';
const BANK_IDS: readonly BankId[] = ['A', 'B', 'C', 'D'];

interface BankMeta {
  id: BankId;
  name: string;
  color: string;
}

const BANKS: readonly BankMeta[] = [
  {id: 'A', name: 'Warehouse', color: cat('blue', 'accent')},
  {id: 'B', name: 'Offbeat', color: cat('purple', 'accent')},
  {id: 'C', name: 'Breaker', color: cat('orange', 'warning')},
  {id: 'D', name: 'Fill', color: cat('green', 'success')},
];

const BANK_BY_ID = new Map(BANKS.map(bank => [bank.id, bank]));

/** `.` = off, `x` = soft hit, `X` = accent. Sixteen chars per row. */
function parseRow(row: string): number[] {
  return Array.from(row, ch =>
    ch === 'X' ? ACCENT_VEL : ch === 'x' ? SOFT_VEL : 0,
  );
}

function parsePattern(rows: readonly string[]): number[][] {
  return rows.map(parseRow);
}

type PatternGrid = number[][];

/** Four seeded patterns, row order matching INSTRUMENTS. */
const SEED_PATTERNS: Record<BankId, PatternGrid> = {
  // A — Warehouse: four-on-the-floor, backbeat clap, driving hats.
  A: parsePattern([
    'X...x...X...x...',
    '....X.......X...',
    '....x.......x..x',
    '..........x.....',
    'x.x.x.x.x.x.x.x.',
    '..X...x...X...x.',
    '..............x.',
    '........x.......',
  ]),
  // B — Offbeat: kick pushes the "and", rim chatter, open-hat answers.
  B: parsePattern([
    'X..x....X..x....',
    '....X.......X...',
    '............x...',
    '..x...x...x...x.',
    'x.xxx.x.x.xxx.x.',
    '......X.......X.',
    '.........x......',
    '....x.......x...',
  ]),
  // C — Breaker: broken kick, ghosted snares, sparse bell.
  C: parsePattern([
    'X..x..x...x..X..',
    '....X..x.x..X..x',
    '........x.......',
    '.x....x....x....',
    'x.x.x.x.x.x.x.x.',
    '...x.......x....',
    '......x.....x...',
    'x.......x.......',
  ]),
  // D — Fill: tom walk and a snare roll that crests into the wrap.
  D: parsePattern([
    'X.......X.......',
    '....X...x.x.xxXX',
    '............x.x.',
    'x...x...x.......',
    'x.x.x.x.x.x.....',
    '..........X...X.',
    '..x...x...xx.xx.',
    '..............X.',
  ]),
};

const cloneGrid = (grid: PatternGrid): PatternGrid => grid.map(row => [...row]);

interface ChainSlot {
  id: string;
  bank: BankId;
}

/** The seeded arrangement: A-B-B-C. */
const SEED_CHAIN: readonly ChainSlot[] = [
  {id: 'slot-1', bank: 'A'},
  {id: 'slot-2', bank: 'B'},
  {id: 'slot-3', bank: 'B'},
  {id: 'slot-4', bank: 'C'},
];

// ============= HELPERS =============

function velocityLabel(vel: number): string {
  if (vel === 0) {
    return 'off';
  }
  return vel >= ACCENT_AT ? `accent (${vel})` : `soft (${vel})`;
}

/** Tap cycle: off → soft → accent → off, preserving nothing else. */
function nextCycleVelocity(vel: number): number {
  if (vel === 0) {
    return SOFT_VEL;
  }
  return vel < ACCENT_AT ? ACCENT_VEL : 0;
}

/** Lit pad fill: instrument hue scaled by velocity over the background. */
function padFill(color: string, vel: number): string {
  const pct = 24 + Math.round((vel / 127) * 56);
  return `color-mix(in srgb, ${color} ${pct}%, var(--color-background))`;
}

// ============= PAD BUTTON =============

/**
 * One pad: click/Enter/Space cycles off → soft → accent; pointer capture +
 * a 350ms timer turns a press into the long-press that opens the velocity
 * popover, and Shift+Enter / V is the keyboard path to the same popover.
 */
function PadButton({
  instrument,
  rowIndex,
  colIndex,
  velocity,
  isCursorCol,
  isFlash,
  isGhost,
  skewY,
  isReducedMotion,
  onCycle,
  onOpenEditor,
}: {
  instrument: Instrument;
  rowIndex: number;
  colIndex: number;
  velocity: number;
  isCursorCol: boolean;
  isFlash: boolean;
  isGhost: boolean;
  skewY: number;
  isReducedMotion: boolean;
  onCycle: (row: number, col: number) => void;
  onOpenEditor: (row: number, col: number, anchor: DOMRect) => void;
}) {
  const timerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    longPressFiredRef.current = false;
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      onOpenEditor(rowIndex, colIndex, el.getBoundingClientRect());
    }, LONG_PRESS_MS);
  };

  const handlePointerEnd = () => {
    clearTimer();
  };

  const handleClick = () => {
    // A long-press already opened the editor — swallow the trailing click.
    if (longPressFiredRef.current) {
      longPressFiredRef.current = false;
      return;
    }
    onCycle(rowIndex, colIndex);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (
      (event.key === 'Enter' && event.shiftKey) ||
      event.key.toLowerCase() === 'v'
    ) {
      event.preventDefault();
      onOpenEditor(rowIndex, colIndex, event.currentTarget.getBoundingClientRect());
    }
  };

  const isOn = velocity > 0 && !isGhost;
  const isAccent = isOn && velocity >= ACCENT_AT;
  const flash = isFlash && isOn;

  const padStyle: CSSProperties = {
    ...styles.pad,
    backgroundColor: isGhost
      ? PAD_GHOST
      : velocity > 0
        ? padFill(instrument.color, velocity)
        : Math.floor(colIndex / BAR) % 2 === 1
          ? PAD_OFF_ALT
          : PAD_OFF,
    borderColor: isOn
      ? `color-mix(in srgb, ${instrument.color} ${isAccent ? 90 : 55}%, var(--color-border))`
      : 'var(--color-border)',
    boxShadow: flash
      ? `0 0 12px color-mix(in srgb, ${instrument.color} 70%, transparent)`
      : isAccent
        ? `0 0 6px color-mix(in srgb, ${instrument.color} 40%, transparent)`
        : 'none',
    transform: `translateY(${skewY}px)${
      flash && !isReducedMotion ? ' scale(1.14)' : ''
    }`,
    ...(isCursorCol && !isGhost
      ? {backgroundImage: `linear-gradient(${CURSOR_TINT}, ${CURSOR_TINT})`}
      : undefined),
    ...(isGhost ? {opacity: 0.55} : undefined),
  };

  return (
    <button
      type="button"
      className="ssg-pad"
      style={padStyle}
      aria-label={`${instrument.name} step ${colIndex + 1}: ${velocityLabel(
        velocity,
      )}. Press to cycle, Shift+Enter for velocity`}
      aria-pressed={velocity > 0}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}

// ============= MUTE / SOLO LED =============

/** One rail LED: a 22px lens in a 28×40 hit area, lit in its own hue. */
function LedButton({
  letter,
  litColor,
  isOn,
  label,
  onToggle,
}: {
  letter: 'M' | 'S';
  litColor: string;
  isOn: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      className="ssg-led"
      style={styles.ledButton}
      aria-pressed={isOn}
      aria-label={label}
      onClick={onToggle}>
      <span
        style={{
          ...styles.ledLens,
          ...(isOn
            ? {
                backgroundColor: litColor,
                color: 'var(--color-text-on-color, var(--color-background))',
                borderColor: litColor,
                boxShadow: `0 0 6px color-mix(in srgb, ${litColor} 60%, transparent)`,
              }
            : undefined),
        }}
        aria-hidden>
        {letter}
      </span>
    </button>
  );
}

// ============= CHAIN LANE =============

/**
 * The A-B-B-C arrangement lane. The active slot glows in its bank color
 * and fills left-to-right as the cursor wraps — both pure derivations of
 * the tick. Reordering is arm-then-swap: rects are measured before the
 * swap commits, and a FLIP settle plays the inverted transform after
 * layout (skipped under reduced motion).
 */
function ChainLane({
  chain,
  armedId,
  activeIndex,
  progress,
  isReducedMotion,
  onSlotTap,
}: {
  chain: readonly ChainSlot[];
  armedId: string | null;
  activeIndex: number;
  progress: number;
  isReducedMotion: boolean;
  onSlotTap: (slotId: string) => void;
}) {
  const slotRefs = useRef(new Map<string, HTMLButtonElement>());
  const beforeRects = useRef<Map<string, DOMRect> | null>(null);

  const handleTap = (slotId: string) => {
    // Measure every slot before the parent commits the swap.
    const rects = new Map<string, DOMRect>();
    slotRefs.current.forEach((el, id) => rects.set(id, el.getBoundingClientRect()));
    beforeRects.current = rects;
    onSlotTap(slotId);
  };

  useLayoutEffect(() => {
    const prev = beforeRects.current;
    beforeRects.current = null;
    if (prev == null || isReducedMotion) {
      return;
    }
    chain.forEach(slot => {
      const el = slotRefs.current.get(slot.id);
      const old = prev.get(slot.id);
      if (el == null || old == null) {
        return;
      }
      const dx = old.left - el.getBoundingClientRect().left;
      if (dx === 0) {
        return;
      }
      el.style.transition = 'none';
      el.style.transform = `translateX(${dx}px)`;
      requestAnimationFrame(() => {
        el.style.transition = `transform ${FLIP_MS}ms ${FLIP_EASE}`;
        el.style.transform = '';
      });
    });
  }, [chain, isReducedMotion]);

  return (
    <div style={styles.chainLane} role="group" aria-label="Pattern chain">
      {chain.map((slot, index) => {
        const bank = BANK_BY_ID.get(slot.bank);
        const isActive = index === activeIndex;
        const isArmed = slot.id === armedId;
        const bankColor = bank?.color ?? 'var(--color-accent)';
        return (
          <button
            key={slot.id}
            ref={el => {
              if (el == null) {
                slotRefs.current.delete(slot.id);
              } else {
                slotRefs.current.set(slot.id, el);
              }
            }}
            type="button"
            className="ssg-slot"
            style={{
              ...styles.chainSlot,
              ...(isArmed ? styles.chainSlotArmed : undefined),
              ...(isActive
                ? {
                    borderColor: `color-mix(in srgb, ${bankColor} 80%, var(--color-border))`,
                    boxShadow: `0 0 10px color-mix(in srgb, ${bankColor} 45%, transparent)`,
                  }
                : undefined),
            }}
            aria-pressed={isArmed}
            aria-label={`Chain slot ${index + 1}: pattern ${slot.bank}${
              isActive ? ', now playing' : ''
            }${isArmed ? ', armed to swap' : ''}. Tap one slot, then another, to swap them`}
            onClick={() => handleTap(slot.id)}>
            {isActive && (
              <span
                aria-hidden
                style={{
                  ...styles.chainFill,
                  width: `${progress * 100}%`,
                  backgroundColor: `color-mix(in srgb, ${bankColor} 22%, transparent)`,
                }}
              />
            )}
            <span style={styles.chainContent}>
              <span style={{...styles.chainLetter, color: bankColor}}>
                {slot.bank}
              </span>
              <span style={styles.chainSlotIndex}>slot {index + 1}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ============= VELOCITY POPOVER =============

interface EditorState {
  row: number;
  col: number;
  top: number;
  left: number;
}

function VelocityPopover({
  editor,
  velocity,
  onSetVelocity,
  onClose,
}: {
  editor: EditorState;
  velocity: number;
  onSetVelocity: (row: number, col: number, vel: number) => void;
  onClose: () => void;
}) {
  const instrument = INSTRUMENTS[editor.row];
  return (
    <>
      <button
        type="button"
        style={styles.popoverBackdrop}
        aria-label="Close velocity editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-label={`Velocity — ${instrument.name} step ${editor.col + 1}`}
        style={{...styles.popover, top: editor.top, left: editor.left}}>
        <HStack gap={2} vAlign="center">
          <Icon icon={instrument.icon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label" weight="semibold">
              {instrument.name} · step {editor.col + 1}
            </Text>
          </StackItem>
          <IconButton
            label="Done"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </HStack>
        <Slider
          label="Velocity"
          min={0}
          max={127}
          step={1}
          value={velocity}
          onChange={(next: number) => onSetVelocity(editor.row, editor.col, next)}
          formatValue={(value: number) => (value === 0 ? 'Off' : String(value))}
          width="100%"
        />
        <HStack gap={2} vAlign="center">
          <Button
            label="Soft"
            variant="secondary"
            size="sm"
            onClick={() => onSetVelocity(editor.row, editor.col, SOFT_VEL)}
          />
          <Button
            label="Accent"
            variant="secondary"
            size="sm"
            onClick={() => onSetVelocity(editor.row, editor.col, ACCENT_VEL)}
          />
          <StackItem size="fill" />
          <Button
            label="Clear"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSetVelocity(editor.row, editor.col, 0);
              onClose();
            }}
          />
        </HStack>
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          {velocity === 0
            ? 'Silent — the pad is off.'
            : velocity >= ACCENT_AT
              ? `Accent — flashes hard at ${velocity}.`
              : `Soft hit at ${velocity}.`}
        </Text>
      </div>
    </>
  );
}

// ============= PAGE =============

export default function StepSequencerGrooveboxTemplate() {
  // The one counter everything derives from.
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(124);
  const [swing, setSwing] = useState(20);
  // Pattern grids are the only other substantive state — pad edits.
  const [patterns, setPatterns] = useState<Record<BankId, PatternGrid>>(() => ({
    A: cloneGrid(SEED_PATTERNS.A),
    B: cloneGrid(SEED_PATTERNS.B),
    C: cloneGrid(SEED_PATTERNS.C),
    D: cloneGrid(SEED_PATTERNS.D),
  }));
  const [bank, setBank] = useState<BankId>('A');
  const [followChain, setFollowChain] = useState(true);
  const [chain, setChain] = useState<readonly ChainSlot[]>(SEED_CHAIN);
  const [armedSlotId, setArmedSlotId] = useState<string | null>(null);
  const [mutes, setMutes] = useState<boolean[]>(() => Array(ROWS).fill(false));
  const [solos, setSolos] = useState<boolean[]>(() => Array(ROWS).fill(false));
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const isCompact = useMediaQuery('(max-width: 640px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ----- Pure derivations of the tick -----

  const col = tick % STEPS;
  const chainPos = Math.floor(tick / STEPS) % chain.length;
  const activeBank = chain[chainPos].bank;
  const displayedBank: BankId = followChain ? activeBank : bank;
  const grid = patterns[displayedBank];
  const flashesLive = isPlaying && displayedBank === activeBank;
  const anySolo = solos.some(Boolean);

  const audible = useMemo(
    () =>
      INSTRUMENTS.map((_, row) =>
        anySolo ? solos[row] && !mutes[row] : !mutes[row],
      ),
    [anySolo, solos, mutes],
  );

  /** Downward skew (px) for even-numbered step columns — swing made visible. */
  const swingSkewPx = (swing / MAX_SWING) * 7;

  // ----- Tick commit path (the only writers) -----

  const advanceTick = useCallback((by: number) => {
    tickRef.current += by;
    setTick(tickRef.current);
  }, []);

  const resetTick = useCallback(() => {
    tickRef.current = 0;
    setTick(0);
  }, []);

  // ----- Playback: rAF loop accumulating frame time against the
  // swing-warped step duration. Playback cadence only — every visual
  // still derives from the tick it advances. -----

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    let raf = 0;
    let last: number | null = null;
    let acc = 0;
    const loop = (now: number) => {
      if (last != null) {
        acc += now - last;
        let guard = 0;
        while (
          acc >= stepDurationMs(tickRef.current, bpm, swing) &&
          guard < STEPS
        ) {
          acc -= stepDurationMs(tickRef.current, bpm, swing);
          tickRef.current += 1;
          guard += 1;
        }
        if (guard > 0) {
          setTick(tickRef.current);
        }
      }
      last = now;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, bpm, swing]);

  // ----- Auto-scroll: keep the cursor's 4-step bar in view during play. -----

  useEffect(() => {
    const el = scrollerRef.current;
    if (el == null || !isPlaying) {
      return;
    }
    if (el.scrollWidth <= el.clientWidth) {
      return;
    }
    const bar = Math.floor(col / BAR);
    const left = bar * BAR * (PAD + PAD_GAP);
    el.scrollTo({left, behavior: isReducedMotion ? 'auto' : 'smooth'});
  }, [col, isPlaying, isReducedMotion]);

  // ----- Transport commits -----

  const togglePlay = useCallback(() => {
    setIsPlaying(prev => {
      setAnnouncement(prev ? 'Paused' : `Playing at ${bpm} BPM`);
      return !prev;
    });
  }, [bpm]);

  const stepForward = useCallback(() => {
    advanceTick(1);
    const nextCol = tickRef.current % STEPS;
    setAnnouncement(`Stepped to column ${nextCol + 1}`);
  }, [advanceTick]);

  const returnToStart = useCallback(() => {
    resetTick();
    setAnnouncement('Returned to bar 1, step 1');
  }, [resetTick]);

  const nudgeBpm = useCallback((delta: number) => {
    setBpm(prev => {
      const next = Math.min(Math.max(prev + delta, MIN_BPM), MAX_BPM);
      setAnnouncement(`Tempo ${next} BPM`);
      return next;
    });
  }, []);

  // ----- Grid commits (shared by tap cycle, keyboard, and popover) -----

  const setVelocity = useCallback(
    (row: number, colIndex: number, vel: number) => {
      setPatterns(prev => {
        const nextGrid = cloneGrid(prev[displayedBank]);
        nextGrid[row][colIndex] = vel;
        return {...prev, [displayedBank]: nextGrid};
      });
      setAnnouncement(
        `${INSTRUMENTS[row].name} step ${colIndex + 1} ${velocityLabel(vel)}`,
      );
    },
    [displayedBank],
  );

  const cyclePad = useCallback(
    (row: number, colIndex: number) => {
      setVelocity(row, colIndex, nextCycleVelocity(grid[row][colIndex]));
    },
    [grid, setVelocity],
  );

  const openEditor = useCallback((row: number, colIndex: number, anchor: DOMRect) => {
    const width = 248;
    const height = 196;
    const left = Math.min(
      Math.max(anchor.left + anchor.width / 2 - width / 2, 8),
      window.innerWidth - width - 8,
    );
    const above = anchor.top - height - 8;
    const top = above >= 8 ? above : anchor.bottom + 8;
    setEditor({row, col: colIndex, top, left});
  }, []);

  const closeEditor = useCallback(() => setEditor(null), []);

  // ----- Row commits -----

  const toggleMute = useCallback((row: number) => {
    setMutes(prev => {
      const next = [...prev];
      next[row] = !next[row];
      setAnnouncement(
        `${INSTRUMENTS[row].name} ${next[row] ? 'muted' : 'unmuted'}`,
      );
      return next;
    });
  }, []);

  const toggleSolo = useCallback((row: number) => {
    setSolos(prev => {
      const next = [...prev];
      next[row] = !next[row];
      setAnnouncement(
        `${INSTRUMENTS[row].name} solo ${next[row] ? 'on' : 'off'}`,
      );
      return next;
    });
  }, []);

  // ----- Bank / chain commits -----

  const selectBank = useCallback((id: BankId) => {
    setBank(id);
    setFollowChain(false);
    setAnnouncement(`Editing pattern ${id} — ${BANK_BY_ID.get(id)?.name ?? ''}`);
  }, []);

  const toggleFollow = useCallback(() => {
    setFollowChain(prev => {
      setAnnouncement(
        prev ? 'Follow chain off — grid stays on the edit bank' : 'Following the chain',
      );
      return !prev;
    });
  }, []);

  const handleSlotTap = useCallback(
    (slotId: string) => {
      if (armedSlotId == null) {
        setArmedSlotId(slotId);
        setAnnouncement('Slot armed — tap another slot to swap');
        return;
      }
      if (armedSlotId === slotId) {
        setArmedSlotId(null);
        setAnnouncement('Slot disarmed');
        return;
      }
      setChain(prev => {
        const next = [...prev];
        const i = next.findIndex(slot => slot.id === armedSlotId);
        const j = next.findIndex(slot => slot.id === slotId);
        if (i >= 0 && j >= 0) {
          [next[i], next[j]] = [next[j], next[i]];
          setAnnouncement(
            `Swapped chain slots ${i + 1} and ${j + 1}: now ${next
              .map(slot => slot.bank)
              .join('-')}`,
          );
        }
        return next;
      });
      setArmedSlotId(null);
    },
    [armedSlotId],
  );

  // ----- Keyboard: Space play/pause, → step, Home restart, Esc closes
  // the popover. Re-subscribed each render so nothing goes stale; form
  // fields and focused buttons keep their native keys. -----

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editor != null) {
        event.preventDefault();
        closeEditor();
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target != null &&
        target.closest('input, textarea, select, button') != null
      ) {
        return;
      }
      if (event.key === ' ') {
        event.preventDefault();
        togglePlay();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        stepForward();
      } else if (event.key === 'Home') {
        event.preventDefault();
        returnToStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // ----- Sections -----

  const transportCard = (
    <Card padding={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <IconButton
            label="Return to start"
            tooltip="Return to start (Home)"
            icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="md"
            onClick={returnToStart}
            style={styles.transportButton}
          />
          <IconButton
            label={isPlaying ? 'Pause' : 'Play'}
            tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            icon={
              <Icon
                icon={isPlaying ? PauseIcon : PlayIcon}
                size="sm"
                color="inherit"
              />
            }
            variant="primary"
            size="md"
            onClick={togglePlay}
            style={styles.transportButton}
          />
          <IconButton
            label="Step forward one column"
            tooltip="Step forward (→)"
            icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="md"
            onClick={stepForward}
            style={styles.transportButton}
          />
        </HStack>

        <div style={styles.tempoBox} role="group" aria-label="Tempo">
          <IconButton
            label={`Slow down to ${Math.max(bpm - BPM_STEP, MIN_BPM)} BPM`}
            icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            isDisabled={bpm <= MIN_BPM}
            onClick={() => nudgeBpm(-BPM_STEP)}
            style={styles.transportButton}
          />
          <span style={styles.tempoReadout} role="status" aria-label={`Tempo ${bpm} beats per minute`}>
            {bpm} BPM
          </span>
          <IconButton
            label={`Speed up to ${Math.min(bpm + BPM_STEP, MAX_BPM)} BPM`}
            icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            isDisabled={bpm >= MAX_BPM}
            onClick={() => nudgeBpm(BPM_STEP)}
            style={styles.transportButton}
          />
        </div>

        <div style={styles.swingBox}>
          <Slider
            label="Swing"
            min={0}
            max={MAX_SWING}
            step={5}
            value={swing}
            onChange={setSwing}
            formatValue={(value: number) => `${value}%`}
            width="100%"
          />
        </div>
      </HStack>
    </Card>
  );

  const columnHeader = (
    <div style={styles.padColumnHeader} aria-hidden>
      {Array.from({length: STEPS}, (_, step) => (
        <div
          key={step}
          style={{
            ...styles.headerCell,
            fontWeight: step % BAR === 0 ? 700 : 400,
            // Bar boundaries are the scroll-snap points on narrow screens.
            scrollSnapAlign: step % BAR === 0 ? 'start' : undefined,
            transform: `translateY(${step % 2 === 1 ? swingSkewPx : 0}px)`,
          }}>
          <span>{step + 1}</span>
          <span
            style={{
              ...styles.headerLamp,
              ...(step === col ? styles.headerLampOn : undefined),
            }}
          />
        </div>
      ))}
    </div>
  );

  const padGrid = (
    <div style={styles.gridShell}>
      <div
        style={{...styles.rail, ...(isCompact ? styles.railCompact : undefined)}}
        role="group"
        aria-label="Instruments — mute and solo">
        <div style={styles.railHeaderSpacer} />
        {INSTRUMENTS.map((instrument, row) => {
          const isGhost = !audible[row];
          return (
            <div
              key={instrument.id}
              style={{...styles.railRow, ...(isGhost ? {opacity: 0.55} : undefined)}}>
              <span style={{...styles.railGlyph, color: instrument.color}}>
                <Icon icon={instrument.icon} size="sm" color="inherit" />
              </span>
              {!isCompact && <span style={styles.railName}>{instrument.name}</span>}
              <LedButton
                letter="M"
                litColor={LED_MUTE}
                isOn={mutes[row]}
                label={`${mutes[row] ? 'Unmute' : 'Mute'} ${instrument.name}`}
                onToggle={() => toggleMute(row)}
              />
              <LedButton
                letter="S"
                litColor={LED_SOLO}
                isOn={solos[row]}
                label={`${solos[row] ? 'Unsolo' : 'Solo'} ${instrument.name}`}
                onToggle={() => toggleSolo(row)}
              />
            </div>
          );
        })}
      </div>

      <div
        ref={scrollerRef}
        style={styles.padScroller}
        role="group"
        aria-label={`Pattern ${displayedBank} pad grid — 8 instruments by 16 steps`}>
        {columnHeader}
        {INSTRUMENTS.map((instrument, row) => (
          <div key={instrument.id} style={styles.padRow} role="group" aria-label={`${instrument.name} row`}>
            {Array.from({length: STEPS}, (_, step) => (
              <PadButton
                key={step}
                instrument={instrument}
                rowIndex={row}
                colIndex={step}
                velocity={grid[row][step]}
                isCursorCol={step === col}
                isFlash={flashesLive && step === col}
                isGhost={!audible[row]}
                skewY={step % 2 === 1 ? swingSkewPx : 0}
                isReducedMotion={isReducedMotion}
                onCycle={cyclePad}
                onOpenEditor={openEditor}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  const bankRow = (
    <div style={styles.bankRow} role="group" aria-label="Pattern banks">
      {BANKS.map(meta => (
        <ToggleButton
          key={meta.id}
          label={`${meta.id} · ${meta.name}`}
          size="md"
          isPressed={displayedBank === meta.id}
          onPressedChange={() => selectBank(meta.id)}
        />
      ))}
      <StackItem size="fill" />
      <ToggleButton
        label="Follow chain"
        size="md"
        isPressed={followChain}
        onPressedChange={toggleFollow}
        icon={<Icon icon={AudioLinesIcon} size="sm" />}
      />
    </div>
  );

  const chainSection = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Pattern chain</Heading>
        </StackItem>
        <Text type="supporting" size="sm" color="secondary">
          {chain.map(slot => slot.bank).join(' - ')} · tap two slots to swap
        </Text>
      </HStack>
      <ChainLane
        chain={chain}
        armedId={armedSlotId}
        activeIndex={chainPos}
        progress={(col + 1) / STEPS}
        isReducedMotion={isReducedMotion}
        onSlotTap={handleSlotTap}
      />
    </VStack>
  );

  const hintRow = !isCompact && (
    <HStack gap={3} vAlign="center" style={styles.hintRow}>
      <HStack gap={1} vAlign="center">
        <Kbd keys="Space" />
        <Text type="supporting" color="secondary">
          play / pause
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Kbd keys="→" />
        <Text type="supporting" color="secondary">
          step one column
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <Kbd keys="Home" />
        <Text type="supporting" color="secondary">
          restart
        </Text>
      </HStack>
      <Text type="supporting" color="secondary">
        Long-press a pad (or Shift+Enter) for velocity
      </Text>
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={AudioLinesIcon} size="md" color="secondary" />
                <Heading level={1}>Groovebox</Heading>
                <Badge
                  label={isPlaying ? 'Playing' : 'Paused'}
                  variant={isPlaying ? 'blue' : 'neutral'}
                  icon={
                    <Icon icon={isPlaying ? PlayIcon : PauseIcon} size="xsm" />
                  }
                />
              </HStack>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers role="status">
              Pattern {activeBank} · bar {chainPos + 1}/{chain.length} · step{' '}
              {col + 1}/{STEPS}
            </Text>
            <IconButton
              label="Return to start"
              tooltip="Return to start (Home)"
              icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={returnToStart}
              style={isCompact ? styles.transportButton : undefined}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} role="main" label="Step sequencer">
          <style>{GROOVE_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div
            style={{
              ...styles.column,
              ...(isCompact ? styles.columnPhone : undefined),
            }}>
            {transportCard}
            {padGrid}
            {bankRow}
            {chainSection}
            {hintRow}
          </div>
          {editor != null && (
            <VelocityPopover
              editor={editor}
              velocity={grid[editor.row][editor.col]}
              onSetVelocity={setVelocity}
              onClose={closeEditor}
            />
          )}
        </LayoutContent>
      }
    />
  );
}
