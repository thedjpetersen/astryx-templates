// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file bezier-easing-studio.tsx
 * @input Deterministic fixtures only (five named easing presets —
 *   ease-out-quint, anticipate, overshoot, Material standard, Material
 *   emphasized — as literal cubic-bezier control quads; a fixed 60-tick
 *   replay window; spring defaults of stiffness 170 / damping 14 whose
 *   sampled response is a pure fixed-timestep integration of those two
 *   numbers). No Date.now, no Math.random, no network assets — every curve
 *   sample, stage position, and export string is pure math over the fixture
 *   values and the transport tick.
 * @output Easing Curve Studio — a motion-design surface. A large SVG
 *   cubic-bezier graph carries two draggable control handles with 1:1
 *   pointer tracking (pointer capture, deltas mapped through the plot
 *   rect), guide lines back to their (0,0)/(1,1) anchors, and shaded
 *   overshoot bands whenever the curve leaves the 0–1 output range. Beside
 *   it a preview stage replays the live curve through four elements — a
 *   sliding card, a scaling dot, a progress bar, and an opacity chip — each
 *   a pure function of the transport tick fed through the current easing,
 *   so scrubbing is exact and reversible. A preset rail draws the fixture
 *   curves as mini SVG thumbnails and glides the handles into place when
 *   tapped (fixed-frame-count tween, instant under reduced motion). A
 *   Compare toggle snapshots the current curve as a ghost polyline on the
 *   graph and a ghost card racing the primary in the stage. A Spring mode
 *   swaps the handles for stiffness/damping Sliders whose sampled response
 *   draws as a polyline and exports as a CSS linear() easing string. The
 *   export bar always shows the live cubic-bezier() or linear() CSS with a
 *   Copy action and a changed-value highlight after every drag.
 * @position Page template; emitted by `astryx template bezier-easing-studio`
 *
 * Frame: Layout height="fill". LayoutHeader carries the studio chrome
 * (spline icon + title + a "Deterministic replay" Badge). LayoutContent
 * scrolls a column: the export bar strip, then a two-column workbench grid
 * (curve card with graph + mode control + preset rail | stage card with the
 * four preview lanes and readouts). LayoutFooter docks the transport
 * (restart / step / play / step, tick counter, scrub Slider, 0.25x/1x
 * speed, loop checkbox). Choose this over multiplayer-whiteboard-replay
 * when the exhibit is a parametric curve editor driving synthetic previews,
 * not recorded collaborator playback; choose it over wheel-picker-scheduler
 * when the composed value is a continuous easing function rather than a
 * discrete duration triple.
 *
 * Interaction contract:
 * - One commit path per handle: `commitHandle(index, x, y)` is the only way
 *   control points change. Pointer drags (with capture, coordinates mapped
 *   through the plot's bounding rect so tracking is 1:1 at any rendered
 *   size), arrow-key nudges on the focused handle (±0.02, Shift for ±0.10),
 *   and the preset tween all funnel through it, so gesture and keyboard are
 *   the same state machine. X clamps to 0–1 (CSS requirement); Y roams
 *   -0.6–1.6 so anticipation and overshoot are authorable.
 * - The transport owns the only clock: play advances the tick on a
 *   setInterval cadence (0.25x/1x), step/restart/scrub set it directly, and
 *   every stage element re-derives from (tick, curve) — stepping backward
 *   lands on exactly the frame play produced. Space toggles play, J/K step,
 *   and the scrub Slider is keyboard-operable by nature.
 * - Preset thumbnails restart the tick and tween the handles over a fixed
 *   frame count (no wall clock — progress advances 1/14 per frame); a chip
 *   reads as active whenever the live quad matches its values, however the
 *   user got there. Reduced motion applies presets instantly.
 * - Compare snapshots the current easing (label + css + 61 samples) as a
 *   ghost: dashed polyline on the graph, translucent racer card in the
 *   slide lane. Toggling off clears both; taking a new snapshot replaces
 *   the old one.
 * - Spring mode integrates stiffness/damping with a fixed-timestep
 *   semi-implicit Euler at module-deterministic dt; the response polyline,
 *   settle readout, and linear() export all derive from the same sample
 *   array the stage replays.
 * - Copy writes the live export string via navigator.clipboard when
 *   available and flips to a Copied check either way; the export chip
 *   flashes an accent highlight whenever the string changes (drag, preset,
 *   slider, mode), fading via a CSS transition that reduced motion snaps.
 * - Every commit narrates through a visually hidden aria-live region.
 * - Reduced motion: preset tweens apply instantly, the export flash loses
 *   its fade, and the playhead hairline drops its glow — playback itself is
 *   user-initiated content, always available frame by frame via step.
 *
 * Responsive contract:
 * - >960px: header | export strip + two-column grid (curve 1.1fr | stage
 *   1fr) | transport footer. The graph keeps its 360x440 aspect.
 * - 641–960px: the grid stacks (curve card, then stage card) inside the
 *   same scrolling column; the transport keeps one row.
 * - <=640px (usable at 375px): single column — the preset rail becomes a
 *   horizontal scroll-snap strip (deliberate overflowX, snap per chip), the
 *   Kbd hint line hides, and the transport wraps to two rows (buttons +
 *   counter, then the full-width scrub with speed control). Handles carry
 *   permanent 44px transparent halos so touch grabs land; all buttons keep
 *   ~40px targets. Nothing is hover-only — drag, tap, and keys carry every
 *   interaction.
 *
 * Container policy (workbench archetype): page chrome is frame-first; the
 * curve editor and stage are Astryx Cards; the graph, handles, preset
 * thumbnails, and stage lanes are hand-rolled (SVG + typed style objects)
 * because they need full ownership of geometry and per-tick positioning.
 * The export bar is a plain strip, not a Card — it is chrome, not content.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token or a
 * color-mix() over tokens (curve strokes ride the accent, the second handle
 * and ghost ride categorical tokens with semantic fallbacks, overshoot
 * bands tint the warning token). No raw hex, no rgb() anywhere.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ActivityIcon,
  CheckIcon,
  CopyIcon,
  GhostIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SplineIcon,
} from 'lucide-react';

// ============= REPLAY GEOMETRY =============
// The whole exhibit hangs off one number: the transport tick. Progress
// u = tick / TOTAL_TICKS feeds the live easing; nothing else moves.

/** Replay length in ticks — u sweeps 0 → 1 across these. */
const TOTAL_TICKS = 60;
/** 1x cadence: 25ms per tick → a 1.5s sweep. 0.25x divides this. */
const BASE_TICK_MS = 25;
/** The two authorable speeds. */
const SPEEDS = [0.25, 1] as const;

// ============= GRAPH GEOMETRY =============
// The plot maps the unit easing square into a viewBox with headroom above
// 1 and below 0 so anticipation and overshoot stay on screen.

const VB_W = 360;
const VB_H = 440;
/** Output-axis range the plot shows (and the handle Y clamp). */
const Y_MIN = -0.6;
const Y_MAX = 1.6;
const Y_SPAN = Y_MAX - Y_MIN;

/** Curve x → viewBox x. */
function gx(x: number): number {
  return x * VB_W;
}
/** Curve y → viewBox y (flipped: SVG grows downward). */
function gy(y: number): number {
  return ((Y_MAX - y) / Y_SPAN) * VB_H;
}

/** Keyboard nudge sizes for a focused handle. */
const NUDGE = 0.02;
const NUDGE_LARGE = 0.1;

/** Preset tween length in frames — no wall clock, just a frame counter. */
const TWEEN_FRAMES = 14;

// ============= SPRING MODEL =============
// Fixed-timestep semi-implicit Euler over a fixed window: the response is
// a pure function of (stiffness, damping), sampled once per tick.

/** Simulated window the 60 ticks sweep, in seconds. */
const SPRING_WINDOW_S = 1.2;
/** Integrator substeps per tick — fixed, so results never drift. */
const SPRING_SUBSTEPS = 8;
/** linear() export resolution (stop count). */
const LINEAR_STOPS = 21;

const STIFFNESS_MIN = 20;
const STIFFNESS_MAX = 300;
const DAMPING_MIN = 4;
const DAMPING_MAX = 40;

// ============= INJECTED CSS =============
// The typed style-object idiom covers everything except :focus-visible
// rings, the preset rail scrollbar hider, and the reduced-motion guard for
// the export-flash fade.

const STUDIO_CSS = `
.bes-handle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 50%;
}
.bes-thumb:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.bes-rail {
  scrollbar-width: none;
}
.bes-rail::-webkit-scrollbar {
  display: none;
}
.bes-export-chip {
  transition: background-color 700ms ease-out, border-color 700ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .bes-export-chip {
    transition: none;
  }
}
`;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  column: {
    width: '100%',
    maxWidth: 1080,
    marginInline: 'auto',
    paddingInline: 16,
    paddingBlock: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // Workbench grid: curve editor | stage. Stacks below 960px.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  gridStacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // Export bar: a chrome strip, not a Card. The chip flashes on change.
  exportBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  exportChip: {
    flex: '1 1 240px',
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-3)',
    minHeight: 40,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflowX: 'auto',
  },
  exportChipFlash: {
    borderColor: 'color-mix(in srgb, var(--color-accent) 60%, var(--color-border))',
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, var(--color-background-muted))',
  },
  exportCode: {
    fontFamily: MONO_FONT,
    fontSize: 13,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-primary)',
  },
  // The plot: a responsive box that keeps the viewBox aspect so handle
  // percentage positions and pointer math share one coordinate space.
  plotWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: `${VB_W} / ${VB_H}`,
    touchAction: 'none',
  },
  plotSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    display: 'block',
    // Endpoint anchors and the playhead dot sit exactly on the viewBox
    // edges — let them render whole instead of clipping to half-shapes.
    overflow: 'visible',
  },
  // Handle buttons: 44px transparent halos around a 16px visible dot, so
  // touch grabs land at every width. Positioned in plot percentages.
  handle: {
    position: 'absolute',
    width: 44,
    height: 44,
    marginLeft: -22,
    marginTop: -22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'grab',
    zIndex: 3,
  },
  handleDragging: {cursor: 'grabbing'},
  handleDot: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    border: '2.5px solid var(--color-background-card)',
    boxShadow: '0 1px 4px color-mix(in srgb, var(--color-text-primary) 30%, transparent)',
  },
  // Preset rail: wraps on desktop, scroll-snaps as a strip on phones.
  presetRail: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  presetRailStrip: {
    flexWrap: 'nowrap',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    paddingBottom: 4,
  },
  // One preset chip: mini curve thumbnail + label, one focusable button.
  presetChip: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 10px',
    minWidth: 84,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    scrollSnapAlign: 'start',
    flexShrink: 0,
  },
  presetChipActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-background-card))',
  },
  // Stage lanes: each preview element owns one labelled row.
  lane: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  laneTrack: {
    position: 'relative',
    height: 56,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  slideCard: {
    position: 'absolute',
    top: 8,
    width: 64,
    height: 40,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px color-mix(in srgb, var(--color-text-primary) 18%, transparent)',
  },
  ghostCard: {
    position: 'absolute',
    top: 8,
    width: 64,
    height: 40,
    borderRadius: 8,
    border: '1.5px dashed color-mix(in srgb, var(--color-text-secondary) 70%, transparent)',
    backgroundColor: 'color-mix(in srgb, var(--color-text-secondary) 12%, transparent)',
  },
  scaleDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 36,
    height: 36,
    marginLeft: -18,
    marginTop: -18,
    borderRadius: '50%',
  },
  progressTrack: {
    position: 'relative',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  opacityChipBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  opacityChip: {
    paddingInline: 14,
    paddingBlock: 6,
    borderRadius: 999,
  },
  laneHead: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  laneValue: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  transportRow: {flexWrap: 'wrap', rowGap: 8},
  transportTapTarget: {width: 40, height: 40},
  // The Slider thumb overhangs the track edge at t=0 — reserve room so it
  // never sits on top of the tick counter to its left.
  scrubItem: {minWidth: 180, paddingInlineStart: 12},
  tickCounter: {whiteSpace: 'nowrap'},
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

// ============= EASING MATH =============

/** [x1, y1, x2, y2] — a CSS cubic-bezier control quad. */
type CubicQuad = readonly [number, number, number, number];

/** One cubic coordinate at parameter t (endpoints 0 and 1). */
function bezierAxis(t: number, c1: number, c2: number): number {
  const inv = 1 - t;
  return 3 * inv * inv * t * c1 + 3 * inv * t * t * c2 + t * t * t;
}

/**
 * y as a function of progress x for a CSS cubic-bezier: solve the
 * parametric t for the requested x by bisection (x(t) is monotonic because
 * x1 and x2 are clamped to 0–1), then evaluate y(t).
 */
function easeCubic(quad: CubicQuad, x: number): number {
  if (x <= 0) {
    return 0;
  }
  if (x >= 1) {
    return 1;
  }
  const [x1, y1, x2, y2] = quad;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 26; i++) {
    const xt = bezierAxis(t, x1, x2);
    if (Math.abs(xt - x) < 0.00005) {
      break;
    }
    if (xt < x) {
      lo = t;
    } else {
      hi = t;
    }
    t = (lo + hi) / 2;
  }
  return bezierAxis(t, y1, y2);
}

/** Sample any easing into n+1 points over u ∈ [0, 1]. */
function sampleEasing(fn: (u: number) => number, n: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= n; i++) {
    out.push(fn(i / n));
  }
  return out;
}

/**
 * Deterministic spring response: semi-implicit Euler, mass 1, from 0 to 1,
 * sampled once per tick over the fixed window. Pure in (stiffness,
 * damping) — the same inputs always integrate to the same array.
 */
function springSamples(stiffness: number, damping: number): number[] {
  const dt = SPRING_WINDOW_S / TOTAL_TICKS / SPRING_SUBSTEPS;
  let position = 0;
  let velocity = 0;
  const out: number[] = [0];
  for (let tickIndex = 1; tickIndex <= TOTAL_TICKS; tickIndex++) {
    for (let sub = 0; sub < SPRING_SUBSTEPS; sub++) {
      const accel = stiffness * (1 - position) - damping * velocity;
      velocity += accel * dt;
      position += velocity * dt;
    }
    out.push(position);
  }
  return out;
}

/** Linear interpolation into a per-tick sample array at u ∈ [0, 1]. */
function sampleAt(samples: readonly number[], u: number): number {
  const clamped = Math.min(Math.max(u, 0), 1);
  const scaled = clamped * (samples.length - 1);
  const lower = Math.floor(scaled);
  const upper = Math.min(lower + 1, samples.length - 1);
  const f = scaled - lower;
  return samples[lower] + (samples[upper] - samples[lower]) * f;
}

/** First tick after which the spring stays within 1% of rest, or null. */
function settleTick(samples: readonly number[]): number | null {
  for (let i = samples.length - 1; i >= 0; i--) {
    if (Math.abs(samples[i] - 1) > 0.01) {
      return i + 1 <= TOTAL_TICKS ? i + 1 : null;
    }
  }
  return 0;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function formatQuad(quad: CubicQuad): string {
  return `cubic-bezier(${quad.map(round2).join(', ')})`;
}

/** CSS linear() export: evenly spaced stops need no percentages. */
function formatLinear(samples: readonly number[]): string {
  const stops: string[] = [];
  for (let i = 0; i < LINEAR_STOPS; i++) {
    const u = i / (LINEAR_STOPS - 1);
    stops.push(String(Math.round(sampleAt(samples, u) * 1000) / 1000));
  }
  return `linear(${stops.join(', ')})`;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============= FIXTURES =============

interface CurvePreset {
  id: string;
  label: string;
  quad: CubicQuad;
  blurb: string;
}

/** The preset rail — every quad is a literal, nothing derived at runtime. */
const PRESETS: readonly CurvePreset[] = [
  {
    id: 'ease-out-quint',
    label: 'Ease-out quint',
    quad: [0.22, 1, 0.36, 1],
    blurb: 'Fast launch, long soft landing',
  },
  {
    id: 'anticipate',
    label: 'Anticipate',
    quad: [0.36, 0, 0.66, -0.56],
    blurb: 'Pulls back below zero before committing',
  },
  {
    id: 'overshoot',
    label: 'Overshoot',
    quad: [0.34, 1.56, 0.64, 1],
    blurb: 'Blows past the target and settles back',
  },
  {
    id: 'material-standard',
    label: 'Material standard',
    quad: [0.2, 0, 0, 1],
    blurb: 'M3 workhorse for on-screen moves',
  },
  {
    id: 'material-emphasized',
    label: 'Material emphasized',
    quad: [0.05, 0.7, 0.1, 1],
    blurb: 'M3 hero transition — dramatic decel',
  },
];

/** The studio opens on ease-out-quint so a chip reads active at load. */
const INITIAL_QUAD: CubicQuad = PRESETS[0].quad;

/** Handle identities: P1 rides the accent, P2 a categorical token. */
const HANDLE_COLORS = [
  'var(--color-accent)',
  'var(--color-data-categorical-purple, var(--color-accent))',
] as const;

const GHOST_COLOR =
  'color-mix(in srgb, var(--color-text-secondary) 75%, transparent)';

/** Stage element tints — categorical tokens with semantic fallbacks. */
const STAGE_SLIDE_COLOR = 'var(--color-data-categorical-blue, var(--color-accent))';
const STAGE_SCALE_COLOR = 'var(--color-data-categorical-purple, var(--color-accent))';
const STAGE_BAR_COLOR = 'var(--color-data-categorical-green, var(--color-success))';
const STAGE_CHIP_COLOR = 'var(--color-data-categorical-orange, var(--color-warning))';

type Mode = 'cubic' | 'spring';

/** Compare snapshot: label + export string + one sample per tick. */
interface GhostSnapshot {
  label: string;
  css: string;
  samples: number[];
}

// ============= CURVE THUMBNAIL =============

/** Mini curve drawing for the preset rail — same mapping, smaller box. */
function CurveThumb({quad, isActive}: {quad: CubicQuad; isActive: boolean}) {
  const w = 56;
  const h = 40;
  const yTop = 1.6;
  const ySpan = 2.2;
  const tx = (x: number) => x * w;
  const ty = (y: number) => ((yTop - y) / ySpan) * h;
  const [x1, y1, x2, y2] = quad;
  const d =
    `M ${tx(0)} ${ty(0)} C ${tx(x1)} ${ty(y1)}, ` +
    `${tx(x2)} ${ty(y2)}, ${tx(1)} ${ty(1)}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <line
        x1={0}
        y1={ty(0)}
        x2={w}
        y2={ty(0)}
        stroke="color-mix(in srgb, var(--color-border) 70%, transparent)"
        strokeWidth={1}
      />
      <line
        x1={0}
        y1={ty(1)}
        x2={w}
        y2={ty(1)}
        stroke="color-mix(in srgb, var(--color-border) 70%, transparent)"
        strokeWidth={1}
      />
      <path
        d={d}
        fill="none"
        stroke={isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)'}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ============= EASING GRAPH =============

/**
 * The big plot. Cubic mode draws the exact SVG cubic path plus draggable
 * handles; spring mode draws the sampled polyline. Both share the same
 * viewBox mapping, overshoot bands, ghost polyline, and playhead.
 */
function EasingGraph({
  mode,
  quad,
  springCurve,
  ghost,
  progressU,
  easedValue,
  draggingHandle,
  onHandlePointerDown,
  onHandlePointerMove,
  onHandlePointerUp,
  onHandleKeyDown,
}: {
  mode: Mode;
  quad: CubicQuad;
  springCurve: readonly number[];
  ghost: GhostSnapshot | null;
  progressU: number;
  easedValue: number;
  draggingHandle: number | null;
  onHandlePointerDown: (index: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandlePointerMove: (index: number, event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandlePointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => void;
  onHandleKeyDown: (index: number, event: ReactKeyboardEvent<HTMLButtonElement>) => void;
}) {
  const [x1, y1, x2, y2] = quad;

  // Overshoot detection: sample the live easing and find its output range.
  const liveSamples = useMemo(
    () =>
      mode === 'cubic'
        ? sampleEasing(u => easeCubic(quad, u), 120)
        : [...springCurve],
    [mode, quad, springCurve],
  );
  const maxY = Math.max(...liveSamples);
  const minY = Math.min(...liveSamples);
  const overshootsHigh = maxY > 1.001;
  const overshootsLow = minY < -0.001;

  const polylinePoints = useMemo(
    () =>
      liveSamples
        .map((y, i) => `${gx(i / (liveSamples.length - 1))},${gy(y)}`)
        .join(' '),
    [liveSamples],
  );

  const ghostPoints = useMemo(() => {
    if (ghost == null) {
      return null;
    }
    return ghost.samples
      .map((y, i) => `${gx(i / (ghost.samples.length - 1))},${gy(y)}`)
      .join(' ');
  }, [ghost]);

  const cubicPath =
    `M ${gx(0)} ${gy(0)} C ${gx(x1)} ${gy(y1)}, ` +
    `${gx(x2)} ${gy(y2)}, ${gx(1)} ${gy(1)}`;

  const gridStroke = 'color-mix(in srgb, var(--color-border) 60%, transparent)';
  const axisStroke = 'color-mix(in srgb, var(--color-text-secondary) 45%, transparent)';

  const handles: Array<{index: number; x: number; y: number; anchorX: number; anchorY: number}> = [
    {index: 0, x: x1, y: y1, anchorX: 0, anchorY: 0},
    {index: 1, x: x2, y: y2, anchorX: 1, anchorY: 1},
  ];

  return (
    <div style={styles.plotWrap} data-bes-plot>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        style={styles.plotSvg}
        preserveAspectRatio="none"
        role="img"
        aria-label={
          mode === 'cubic'
            ? `Cubic bezier curve with control points ${round2(x1)}, ${round2(y1)} and ${round2(x2)}, ${round2(y2)}`
            : 'Spring response curve'
        }>
        {/* Overshoot bands: warning-tinted regions past the unit range. */}
        {overshootsHigh && (
          <rect
            x={0}
            y={gy(Y_MAX)}
            width={VB_W}
            height={gy(1) - gy(Y_MAX)}
            fill="color-mix(in srgb, var(--color-warning) 10%, transparent)"
          />
        )}
        {overshootsLow && (
          <rect
            x={0}
            y={gy(0)}
            width={VB_W}
            height={gy(Y_MIN) - gy(0)}
            fill="color-mix(in srgb, var(--color-warning) 10%, transparent)"
          />
        )}

        {/* Grid: quarter lines inside the unit square, axes emphasized. */}
        {[0.25, 0.5, 0.75].map(v => (
          <g key={v}>
            <line x1={gx(v)} y1={gy(Y_MAX)} x2={gx(v)} y2={gy(Y_MIN)} stroke={gridStroke} strokeWidth={1} />
            <line x1={gx(0)} y1={gy(v)} x2={gx(1)} y2={gy(v)} stroke={gridStroke} strokeWidth={1} />
          </g>
        ))}
        <line x1={gx(0)} y1={gy(0)} x2={gx(1)} y2={gy(0)} stroke={axisStroke} strokeWidth={1.5} />
        <line x1={gx(0)} y1={gy(1)} x2={gx(1)} y2={gy(1)} stroke={axisStroke} strokeWidth={1.5} />
        <line x1={gx(0)} y1={gy(Y_MAX)} x2={gx(0)} y2={gy(Y_MIN)} stroke={axisStroke} strokeWidth={1.5} />
        <line x1={gx(1)} y1={gy(Y_MAX)} x2={gx(1)} y2={gy(Y_MIN)} stroke={axisStroke} strokeWidth={1.5} />

        {/* Ghost curve, under the live one. */}
        {ghostPoints != null && (
          <polyline
            points={ghostPoints}
            fill="none"
            stroke={GHOST_COLOR}
            strokeWidth={2}
            strokeDasharray="6 5"
          />
        )}

        {/* Live curve: exact cubic path, or the spring polyline. */}
        {mode === 'cubic' ? (
          <path
            d={cubicPath}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ) : (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Guide lines from anchors to handles (cubic mode only). */}
        {mode === 'cubic' &&
          handles.map(handle => (
            <line
              key={handle.index}
              x1={gx(handle.anchorX)}
              y1={gy(handle.anchorY)}
              x2={gx(handle.x)}
              y2={gy(handle.y)}
              stroke={`color-mix(in srgb, ${HANDLE_COLORS[handle.index]} 60%, transparent)`}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          ))}

        {/* Anchors. */}
        <circle cx={gx(0)} cy={gy(0)} r={5} fill="var(--color-text-secondary)" />
        <circle cx={gx(1)} cy={gy(1)} r={5} fill="var(--color-text-secondary)" />

        {/* Playhead: hairline at u plus a dot riding the live curve. */}
        <line
          x1={gx(progressU)}
          y1={gy(Y_MAX)}
          x2={gx(progressU)}
          y2={gy(Y_MIN)}
          stroke="color-mix(in srgb, var(--color-accent) 40%, transparent)"
          strokeWidth={1.5}
        />
        <circle
          cx={gx(progressU)}
          cy={gy(easedValue)}
          r={6}
          fill="var(--color-accent)"
          stroke="var(--color-background-card)"
          strokeWidth={2}
        />
      </svg>

      {/* Draggable handles: 44px halos, arrow-key operable. */}
      {mode === 'cubic' &&
        handles.map(handle => (
          <button
            key={handle.index}
            type="button"
            className="bes-handle"
            style={{
              ...styles.handle,
              ...(draggingHandle === handle.index ? styles.handleDragging : undefined),
              left: `${(gx(handle.x) / VB_W) * 100}%`,
              top: `${(gy(handle.y) / VB_H) * 100}%`,
            }}
            aria-label={
              `Control point ${handle.index + 1}: x ${round2(handle.x)}, y ${round2(handle.y)}. ` +
              'Drag or use arrow keys to move; hold Shift for larger steps.'
            }
            onPointerDown={event => onHandlePointerDown(handle.index, event)}
            onPointerMove={event => onHandlePointerMove(handle.index, event)}
            onPointerUp={onHandlePointerUp}
            onPointerCancel={onHandlePointerUp}
            onKeyDown={event => onHandleKeyDown(handle.index, event)}>
            <span
              style={{
                ...styles.handleDot,
                backgroundColor: HANDLE_COLORS[handle.index],
              }}
            />
          </button>
        ))}
    </div>
  );
}

// ============= PREVIEW STAGE =============

/**
 * Four preview lanes, each a pure function of the eased progress — no
 * transitions, no timers, so the transport's tick is the only motion
 * source and scrubbing is frame-exact.
 */
function PreviewStage({
  progressU,
  easedValue,
  ghostValue,
  ghostLabel,
}: {
  progressU: number;
  easedValue: number;
  ghostValue: number | null;
  ghostLabel: string | null;
}) {
  const slideLeft = `calc(${easedValue} * (100% - 72px) + 4px)`;
  const scale = 0.3 + 0.7 * easedValue;
  const barWidth = `${clamp(easedValue, 0, 1) * 100}%`;
  const opacity = clamp(easedValue, 0.04, 1);

  return (
    <VStack gap={4}>
      <div style={styles.lane}>
        <div style={styles.laneHead}>
          <Text type="label" size="sm" color="secondary">
            Slide
            {ghostLabel != null ? ` — racing ${ghostLabel}` : ''}
          </Text>
          <span style={styles.laneValue}>x {Math.round(easedValue * 100)}%</span>
        </div>
        <div style={styles.laneTrack}>
          {ghostValue != null && (
            <div
              style={{
                ...styles.ghostCard,
                left: `calc(${ghostValue} * (100% - 72px) + 4px)`,
              }}
              aria-hidden="true"
            />
          )}
          <div
            style={{
              ...styles.slideCard,
              left: slideLeft,
              backgroundColor: STAGE_SLIDE_COLOR,
            }}
          />
        </div>
      </div>

      <div style={styles.lane}>
        <div style={styles.laneHead}>
          <Text type="label" size="sm" color="secondary">
            Scale
          </Text>
          <span style={styles.laneValue}>×{(0.3 + 0.7 * easedValue).toFixed(2)}</span>
        </div>
        <div style={styles.laneTrack}>
          <div
            style={{
              ...styles.scaleDot,
              backgroundColor: STAGE_SCALE_COLOR,
              transform: `scale(${Math.max(scale, 0.05)})`,
            }}
          />
        </div>
      </div>

      <div style={styles.lane}>
        <div style={styles.laneHead}>
          <Text type="label" size="sm" color="secondary">
            Progress
          </Text>
          <span style={styles.laneValue}>{Math.round(clamp(easedValue, 0, 1) * 100)}%</span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: barWidth,
              backgroundColor: STAGE_BAR_COLOR,
            }}
          />
        </div>
      </div>

      <div style={styles.lane}>
        <div style={styles.laneHead}>
          <Text type="label" size="sm" color="secondary">
            Opacity
          </Text>
          <span style={styles.laneValue}>{clamp(easedValue, 0, 1).toFixed(2)}</span>
        </div>
        <div style={styles.opacityChipBox}>
          <div
            style={{
              ...styles.opacityChip,
              backgroundColor: STAGE_CHIP_COLOR,
              opacity,
            }}>
            <Text type="supporting" size="sm" weight="semibold">
              Fade in
            </Text>
          </div>
        </div>
      </div>

      <HStack gap={3} vAlign="center" wrap="wrap">
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          t {Math.round(progressU * 100)}% → eased {easedValue.toFixed(3)}
        </Text>
        {ghostValue != null && (
          <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
            ghost {ghostValue.toFixed(3)}
          </Text>
        )}
      </HStack>
    </VStack>
  );
}

// ============= TRANSPORT =============

function TransportBar({
  tick,
  isPlaying,
  speed,
  isLooping,
  isCompact,
  onTickChange,
  onStep,
  onRestart,
  onPlayToggle,
  onSpeedChange,
  onLoopChange,
}: {
  tick: number;
  isPlaying: boolean;
  speed: number;
  isLooping: boolean;
  isCompact: boolean;
  onTickChange: (tick: number) => void;
  onStep: (delta: number) => void;
  onRestart: () => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
  onLoopChange: (loop: boolean) => void;
}) {
  const atStart = tick <= 0;
  const atEnd = tick >= TOTAL_TICKS;
  const tapTarget = isCompact ? styles.transportTapTarget : undefined;

  return (
    <HStack gap={2} vAlign="center" style={styles.transportRow}>
      <IconButton
        label="Restart replay"
        tooltip="Restart"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={onRestart}
      />
      <IconButton
        label="Step back one tick"
        tooltip="Step back (J)"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={() => onStep(-1)}
      />
      <IconButton
        label={isPlaying ? 'Pause replay' : 'Play replay'}
        tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        icon={<Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd && !isPlaying && !isLooping}
        onClick={onPlayToggle}
      />
      <IconButton
        label="Step forward one tick"
        tooltip="Step forward (K)"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd}
        onClick={() => onStep(1)}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers style={styles.tickCounter}>
        t {tick} / {TOTAL_TICKS}
      </Text>
      <StackItem size="fill" style={styles.scrubItem}>
        <Slider
          label="Scrub replay tick"
          isLabelHidden
          min={0}
          max={TOTAL_TICKS}
          step={1}
          value={tick}
          onChange={onTickChange}
          valueDisplay="none"
        />
      </StackItem>
      <SegmentedControl
        label="Playback speed"
        value={String(speed)}
        onChange={value => onSpeedChange(Number(value))}>
        {SPEEDS.map(s => (
          <SegmentedControlItem key={s} value={String(s)} label={`${s}x`} />
        ))}
      </SegmentedControl>
      <CheckboxInput label="Loop" size="sm" value={isLooping} onChange={onLoopChange} />
      {!isCompact && (
        <HStack gap={1} vAlign="center">
          <Kbd keys="space" />
          <Kbd keys="j" />
          <Kbd keys="k" />
        </HStack>
      )}
    </HStack>
  );
}

// ============= PAGE =============

export default function BezierEasingStudioTemplate() {
  // ---- curve state (the only mutable design surface) ----
  const [mode, setMode] = useState<Mode>('cubic');
  const [quad, setQuad] = useState<CubicQuad>(INITIAL_QUAD);
  const [stiffness, setStiffness] = useState(170);
  const [damping, setDamping] = useState(14);

  // ---- transport (the only clock is this tick) ----
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isLooping, setIsLooping] = useState(false);

  // ---- compare ghost + chrome state ----
  const [ghost, setGhost] = useState<GhostSnapshot | null>(null);
  const [draggingHandle, setDraggingHandle] = useState<number | null>(null);
  const [isExportFlash, setIsExportFlash] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const dragRef = useRef<{index: number; pointerId: number} | null>(null);
  const tweenRef = useRef<number | null>(null);
  const skipFirstFlashRef = useRef(true);

  const isStacked = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ---- pure derivations ----
  const springCurve = useMemo(
    () => springSamples(stiffness, damping),
    [stiffness, damping],
  );
  const springSettle = useMemo(() => settleTick(springCurve), [springCurve]);

  const progressU = tick / TOTAL_TICKS;
  const easedValue =
    mode === 'cubic' ? easeCubic(quad, progressU) : sampleAt(springCurve, progressU);
  const ghostValue = ghost != null ? sampleAt(ghost.samples, progressU) : null;

  const exportCss = useMemo(
    () => (mode === 'cubic' ? formatQuad(quad) : formatLinear(springCurve)),
    [mode, quad, springCurve],
  );

  // Derived active preset: matches the live quad within epsilon, however
  // the user got there (tap, drag back, keyboard).
  const activePresetId = useMemo(() => {
    if (mode !== 'cubic') {
      return null;
    }
    const match = PRESETS.find(preset =>
      preset.quad.every((v, i) => Math.abs(v - quad[i]) < 0.005),
    );
    return match?.id ?? null;
  }, [mode, quad]);

  const activePreset = PRESETS.find(preset => preset.id === activePresetId);

  // Overshoot summary for the caption under the graph.
  const outputRange = useMemo(() => {
    const samples =
      mode === 'cubic'
        ? sampleEasing(u => easeCubic(quad, u), 120)
        : springCurve;
    return {min: Math.min(...samples), max: Math.max(...samples)};
  }, [mode, quad, springCurve]);

  // ---- playback interval: advances the tick, nothing else ----
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      setTick(prev => {
        if (prev >= TOTAL_TICKS) {
          return isLooping ? 0 : prev;
        }
        return prev + 1;
      });
    }, Math.round(BASE_TICK_MS / speed));
    return () => clearInterval(timer);
  }, [isPlaying, speed, isLooping]);

  useEffect(() => {
    if (tick >= TOTAL_TICKS && !isLooping) {
      setIsPlaying(false);
    }
  }, [tick, isLooping]);

  // ---- export flash: highlight the chip whenever the string changes ----
  useEffect(() => {
    if (skipFirstFlashRef.current) {
      skipFirstFlashRef.current = false;
      return undefined;
    }
    setIsExportFlash(true);
    setIsCopied(false);
    const timer = setTimeout(() => setIsExportFlash(false), 900);
    return () => clearTimeout(timer);
  }, [exportCss]);

  // ---- global transport keys (Space, J, K) ----
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [role="slider"], [contenteditable="true"]',
        ) != null
      ) {
        return;
      }
      if (event.key === ' ') {
        if (target?.closest('button') != null) {
          return;
        }
        event.preventDefault();
        setIsPlaying(prev => !prev);
        setTick(prev => (prev >= TOTAL_TICKS ? 0 : prev));
      } else if (event.key === 'j' || event.key === 'k') {
        setIsPlaying(false);
        setTick(prev =>
          Math.min(TOTAL_TICKS, Math.max(0, prev + (event.key === 'j' ? -1 : 1))),
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cancel a pending preset tween on unmount.
  useEffect(
    () => () => {
      if (tweenRef.current != null) {
        cancelAnimationFrame(tweenRef.current);
      }
    },
    [],
  );

  // ---- the single commit path for control points ----
  const commitHandle = useCallback((index: number, x: number, y: number) => {
    const nextX = clamp(x, 0, 1);
    const nextY = clamp(y, Y_MIN + 0.05, Y_MAX - 0.05);
    setQuad(prev => {
      const next = [...prev] as [number, number, number, number];
      next[index * 2] = nextX;
      next[index * 2 + 1] = nextY;
      return next;
    });
  }, []);

  // Pointer path: capture on the handle, map movement through the plot
  // rect so tracking stays 1:1 at any rendered size.
  const handleHandlePointerDown = useCallback(
    (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      if (tweenRef.current != null) {
        cancelAnimationFrame(tweenRef.current);
        tweenRef.current = null;
      }
      dragRef.current = {index, pointerId: event.pointerId};
      setDraggingHandle(index);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handleHandlePointerMove = useCallback(
    (index: number, event: ReactPointerEvent<HTMLButtonElement>) => {
      const drag = dragRef.current;
      if (drag == null || drag.index !== index) {
        return;
      }
      const plot = (event.currentTarget as HTMLElement).closest('[data-bes-plot]');
      if (plot == null) {
        return;
      }
      const rect = plot.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = Y_MAX - ((event.clientY - rect.top) / rect.height) * Y_SPAN;
      commitHandle(index, x, y);
    },
    [commitHandle],
  );

  const handleHandlePointerUp = useCallback(() => {
    if (dragRef.current != null) {
      const index = dragRef.current.index;
      dragRef.current = null;
      setDraggingHandle(null);
      setAnnouncement(`Control point ${index + 1} placed`);
    }
  }, []);

  // Keyboard path: identical commit logic on the focused handle.
  const handleHandleKeyDown = useCallback(
    (index: number, event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const step = event.shiftKey ? NUDGE_LARGE : NUDGE;
      let dx = 0;
      let dy = 0;
      switch (event.key) {
        case 'ArrowLeft':
          dx = -step;
          break;
        case 'ArrowRight':
          dx = step;
          break;
        case 'ArrowUp':
          dy = step;
          break;
        case 'ArrowDown':
          dy = -step;
          break;
        default:
          return;
      }
      event.preventDefault();
      const x = quad[index * 2] + dx;
      const y = quad[index * 2 + 1] + dy;
      commitHandle(index, x, y);
      setAnnouncement(
        `Control point ${index + 1}: x ${round2(clamp(x, 0, 1))}, y ${round2(y)}`,
      );
    },
    [quad, commitHandle],
  );

  // ---- presets: fixed-frame tween through the same commit path ----
  const applyPreset = useCallback(
    (preset: CurvePreset) => {
      if (tweenRef.current != null) {
        cancelAnimationFrame(tweenRef.current);
        tweenRef.current = null;
      }
      setTick(0);
      setAnnouncement(`${preset.label} preset applied — ${formatQuad(preset.quad)}`);
      if (isReducedMotion) {
        setQuad(preset.quad);
        return;
      }
      const from = quad;
      const to = preset.quad;
      let frame = 0;
      const stepTween = () => {
        frame += 1;
        const raw = Math.min(frame / TWEEN_FRAMES, 1);
        // Ease the glide itself so handles settle rather than stop dead.
        const f = 1 - (1 - raw) * (1 - raw);
        setQuad([
          from[0] + (to[0] - from[0]) * f,
          from[1] + (to[1] - from[1]) * f,
          from[2] + (to[2] - from[2]) * f,
          from[3] + (to[3] - from[3]) * f,
        ]);
        if (raw < 1) {
          tweenRef.current = requestAnimationFrame(stepTween);
        } else {
          setQuad(to);
          tweenRef.current = null;
        }
      };
      tweenRef.current = requestAnimationFrame(stepTween);
    },
    [quad, isReducedMotion],
  );

  // ---- compare ghost ----
  const toggleCompare = useCallback(() => {
    if (ghost != null) {
      setGhost(null);
      setAnnouncement('Compare off — ghost cleared');
      return;
    }
    const label =
      mode === 'cubic'
        ? (activePreset?.label ?? 'custom cubic')
        : `spring ${stiffness}/${damping}`;
    const samples =
      mode === 'cubic'
        ? sampleEasing(u => easeCubic(quad, u), TOTAL_TICKS)
        : [...springCurve];
    setGhost({label, css: exportCss, samples});
    setAnnouncement(`Comparing against ${label} — edit the curve to race it`);
  }, [ghost, mode, activePreset, quad, springCurve, stiffness, damping, exportCss]);

  // ---- copy ----
  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(exportCss);
    }
    setIsCopied(true);
    setAnnouncement('Easing CSS copied to clipboard');
  }, [exportCss]);

  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [isCopied]);

  // ---- mode switch ----
  const handleModeChange = useCallback((value: string) => {
    const next = value === 'spring' ? 'spring' : 'cubic';
    setMode(next);
    setTick(0);
    setAnnouncement(
      next === 'spring'
        ? 'Spring mode — tune stiffness and damping, exports as linear()'
        : 'Cubic bezier mode — drag the handles, exports as cubic-bezier()',
    );
  }, []);

  // ---- transport handlers ----
  const handleJump = useCallback((next: number) => {
    setIsPlaying(false);
    setTick(clamp(next, 0, TOTAL_TICKS));
  }, []);

  const handlePlayToggle = useCallback(() => {
    setTick(prev => (prev >= TOTAL_TICKS ? 0 : prev));
    setIsPlaying(prev => !prev);
  }, []);

  // ---- sections ----

  const exportBar = (
    <div style={styles.exportBar} role="group" aria-label="Easing CSS export">
      <div
        className="bes-export-chip"
        style={{
          ...styles.exportChip,
          ...(isExportFlash ? styles.exportChipFlash : undefined),
        }}>
        <code style={styles.exportCode}>{exportCss}</code>
      </div>
      <IconButton
        label={isCopied ? 'Copied easing CSS' : 'Copy easing CSS'}
        tooltip={isCopied ? 'Copied' : 'Copy'}
        icon={<Icon icon={isCopied ? CheckIcon : CopyIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={styles.transportTapTarget}
        onClick={handleCopy}
      />
      <ToggleButton
        label="Compare"
        size="md"
        isPressed={ghost != null}
        onPressedChange={toggleCompare}
        icon={<Icon icon={GhostIcon} size="sm" />}
      />
    </div>
  );

  const curveCard = (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={2}>Curve</Heading>
          </StackItem>
          <SegmentedControl label="Easing model" value={mode} onChange={handleModeChange}>
            <SegmentedControlItem value="cubic" label="Cubic bézier" />
            <SegmentedControlItem value="spring" label="Spring" />
          </SegmentedControl>
        </HStack>

        <EasingGraph
          mode={mode}
          quad={quad}
          springCurve={springCurve}
          ghost={ghost}
          progressU={progressU}
          easedValue={easedValue}
          draggingHandle={draggingHandle}
          onHandlePointerDown={handleHandlePointerDown}
          onHandlePointerMove={handleHandlePointerMove}
          onHandlePointerUp={handleHandlePointerUp}
          onHandleKeyDown={handleHandleKeyDown}
        />

        <HStack gap={2} vAlign="center" wrap="wrap">
          {outputRange.max > 1.001 && (
            <Badge
              variant="warning"
              label={`Overshoots to ${outputRange.max.toFixed(2)}`}
            />
          )}
          {outputRange.min < -0.001 && (
            <Badge
              variant="warning"
              label={`Anticipates to ${outputRange.min.toFixed(2)}`}
            />
          )}
          {mode === 'spring' && (
            <Badge
              variant={springSettle != null ? 'success' : 'neutral'}
              label={
                springSettle != null
                  ? `Settles at ${Math.round((springSettle / TOTAL_TICKS) * 100)}%`
                  : 'Still moving at the window edge'
              }
            />
          )}
          {ghost != null && (
            <Text type="supporting" size="sm" color="secondary">
              Ghost: {ghost.css.length > 40 ? `${ghost.label} (linear)` : ghost.css}
            </Text>
          )}
        </HStack>

        {mode === 'cubic' ? (
          <VStack gap={2}>
            <Text type="label" size="sm" color="secondary">
              Presets
            </Text>
            <div
              className="bes-rail"
              role="group"
              aria-label="Easing presets"
              style={{
                ...styles.presetRail,
                ...(isCompact ? styles.presetRailStrip : undefined),
              }}>
              {PRESETS.map(preset => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className="bes-thumb"
                    style={{
                      ...styles.presetChip,
                      ...(isActive ? styles.presetChipActive : undefined),
                    }}
                    aria-pressed={isActive}
                    aria-label={`${preset.label} — ${preset.blurb}`}
                    onClick={() => applyPreset(preset)}>
                    <CurveThumb quad={preset.quad} isActive={isActive} />
                    <Text
                      type="supporting"
                      size="sm"
                      weight={isActive ? 'semibold' : undefined}
                      maxLines={1}>
                      {preset.label}
                    </Text>
                  </button>
                );
              })}
            </div>
            {!isCompact && (
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Kbd keys="←" />
                <Kbd keys="→" />
                <Kbd keys="↑" />
                <Kbd keys="↓" />
                <Text type="supporting" size="sm" color="secondary">
                  nudge a focused handle — Shift for 5x steps
                </Text>
              </HStack>
            )}
          </VStack>
        ) : (
          <VStack gap={3}>
            <Slider
              label="Stiffness"
              min={STIFFNESS_MIN}
              max={STIFFNESS_MAX}
              step={5}
              value={stiffness}
              onChange={setStiffness}
              formatValue={value => String(value)}
            />
            <Slider
              label="Damping"
              min={DAMPING_MIN}
              max={DAMPING_MAX}
              step={1}
              value={damping}
              onChange={setDamping}
              formatValue={value => String(value)}
            />
            <Text type="supporting" size="sm" color="secondary">
              The sampled response exports as a CSS linear() easing — drop it
              on any transition to ship the spring without JavaScript.
            </Text>
          </VStack>
        )}
      </VStack>
    </Card>
  );

  const stageCard = (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Stage</Heading>
          </StackItem>
          <Text type="supporting" size="sm" color="secondary">
            Every element is the tick fed through the live curve
          </Text>
        </HStack>
        <PreviewStage
          progressU={progressU}
          easedValue={easedValue}
          ghostValue={ghostValue}
          ghostLabel={ghost?.label ?? null}
        />
      </VStack>
    </Card>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={SplineIcon} size="md" color="secondary" />
                <Heading level={1}>Easing curve studio</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {mode === 'cubic'
                      ? (activePreset?.blurb ?? 'Custom cubic — drag the handles')
                      : `Spring ${stiffness} / ${damping}`}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Badge
              variant="info"
              label="Deterministic replay"
              icon={<Icon icon={ActivityIcon} size="xsm" />}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} role="main" label="Easing workbench">
          <style>{STUDIO_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.column}>
            {exportBar}
            <div
              style={{
                ...styles.grid,
                ...(isStacked ? styles.gridStacked : undefined),
              }}>
              {curveCard}
              {stageCard}
            </div>
          </div>
        </LayoutContent>
      }
      footer={
        <LayoutFooter hasDivider>
          <TransportBar
            tick={tick}
            isPlaying={isPlaying}
            speed={speed}
            isLooping={isLooping}
            isCompact={isCompact}
            onTickChange={handleJump}
            onStep={delta => {
              setIsPlaying(false);
              setTick(prev => clamp(prev + delta, 0, TOTAL_TICKS));
            }}
            onRestart={() => handleJump(0)}
            onPlayToggle={handlePlayToggle}
            onSpeedChange={setSpeed}
            onLoopChange={setIsLooping}
          />
        </LayoutFooter>
      }
    />
  );
}
