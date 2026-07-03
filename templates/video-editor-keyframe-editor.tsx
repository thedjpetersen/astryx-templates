// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 8-second, 24fps animated clip
 *   'SC04_drone_harbor_approach.mov' from the 'Harbor Light' documentary
 *   fine cut: five animatable properties — Position X/Y, Scale, Rotation,
 *   Opacity — each carrying a fixed keyframe list with literal times,
 *   values, per-segment interpolation modes, and cubic-bezier handle quads;
 *   six named easing presets as literal control-point values). No clocks,
 *   no Math.random, no network media.
 * @output Keyframe curve editor for a selected NLE clip: a header with the
 *   'Harbor Light' project title, Saved Badge, timeline zoom controls, and
 *   a primary Apply Button; a transport Toolbar (StepBack/Play/StepForward,
 *   mono clip-local timecode, keyframe-snap MagnetIcon, 50/100/200% zoom
 *   SegmentedControl); the defining region — a property-lane stack whose
 *   fixed 210px headers carry per-property color dots, live evaluated value
 *   readouts, animate ToggleButtons (TimerIcon), add-keyframe and expand
 *   controls, while the horizontally scrolling canvas shares one
 *   px-per-second scale across a tick-labeled seconds ruler, a scrub
 *   Slider, four collapsed lanes of diamond keyframe buttons, one expanded
 *   lane rendering an SVG bezier value curve (labeled value gridlines,
 *   overflow-visible plot, draggable out/in handles on the selected
 *   segment, hold-step and linear segments) with a sticky-left cluster of
 *   interpolation mode pills (Linear/Bezier/Hold) — joined, while the
 *   inspector is closed, by six easing preset chips drawn as mini curve
 *   thumbnails — plus a full-height red playhead;
 *   a 300px keyframe inspector panel (frame/value NumberInputs, handle
 *   influence Sliders, delete keyframe) and a status footer with keyframe
 *   totals.
 * @position Page template; emitted by `astryx template
 *   video-editor-keyframe-editor`
 *
 * Frame: root 100dvh div wrapping Layout height="fill" (the demo stage is
 * auto-height; the wrapper restores a real viewport so internal scrolling
 * works). LayoutHeader carries project chrome. LayoutContent hosts the
 * transport toolbar plus the lane stack: a fixed 240px lane-header column
 * that never scrolls beside a horizontally scrolling canvas where ruler
 * ticks, the scrub Slider, keyframe diamonds, the SVG curve, and the red
 * playhead all derive from one px-per-second scale so zoom keeps everything
 * registered. LayoutPanel end 300 is the keyframe inspector; LayoutFooter
 * is a slim status bar. Choose over video-clip-timeline when the user
 * animates properties of one clip rather than arranging clips on tracks,
 * and over bezier-easing-studio when curves map real property values over
 * clip time instead of a normalized easing square.
 *
 * Responsive contract:
 * - >1200px: header | lane stack (fill) | inspector 300 | status footer.
 *   While the inspector is open it carries the labeled preset chips, so
 *   the canvas pill cluster shows only the interpolation pills (the full
 *   cluster would out-span the scrollport and, being sticky-left, could
 *   never scroll its overflow into view); closing the inspector restores
 *   the in-canvas preset rail.
 * - <=1200px: the inspector panel drops out entirely (its header toggle
 *   disables); keyframe editing continues via the curve pills and presets.
 * - <=820px: the header hides the sequence caption and the footer hides
 *   the fps/snap readouts; lane headers narrow to 172px (value readouts
 *   keep tabular alignment); transport buttons grow to 40px touch targets
 *   with "sm" glyphs; the easing preset rail hides — interpolation pills
 *   and direct handle drags carry segment shaping at phone widths.
 * - The header row wraps (flexWrap) instead of clipping. The lane canvas
 *   scrolls horizontally at every width — at 200% zoom the 8s clip is
 *   1760px wide by design; lane headers and the sticky pill cluster stay
 *   visible during horizontal scroll.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels;
 * the only Card is the selected-keyframe summary in the inspector. The
 * curve plot, diamonds, and ruler are hand-rolled divs/SVG because they
 * need full ownership of geometry; the SVG keeps overflow visible so
 * endpoint anchors, handles, and overshoot excursions render whole instead
 * of clipping to half-shapes at the plot edges.
 *
 * Color policy: token-pure. Property identity colors ride the data-viz
 * categorical tokens with the repo-standard light-dark() fallback pairs
 * (blue posX, teal posY, purple scale, orange rotation, green opacity);
 * the playhead flips #EF4444 -> #F87171 via light-dark(). No scheme-locked
 * surface on this page — there is no program-feed stand-in here, so every
 * background, gridline, and label uses var(--color-*) tokens.
 */

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClapperboardIcon,
  DiamondIcon,
  DiamondPlusIcon,
  MagnetIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PauseIcon,
  PlayIcon,
  SplineIcon,
  StepBackIcon,
  StepForwardIcon,
  TimerIcon,
  Trash2Icon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';

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
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PROJECT CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const SEQUENCE_NAME = 'harbor-light_fine-cut_v7';
const CLIP_NAME = 'SC04_drone_harbor_approach.mov';
const CLIP_TRACK = 'V1';
/** Where the clip sits on the sequence — footer context only. */
const CLIP_SEQ_IN = '00:04:12:00';
const FPS = 24;
const CLIP_DURATION_SEC = 8; // 192 frames of clip-local animation time
const INITIAL_PLAYHEAD_SEC = 2.5; // 00:00:02:12

type ZoomPreset = '50' | '100' | '200';
const ZOOM_ORDER: ZoomPreset[] = ['50', '100', '200'];
/** Shared px-per-second scale: ruler ticks, diamonds, the curve SVG, and
 * the playhead all derive from this one number (see the Frame block). */
const PX_PER_SEC: Record<ZoomPreset, number> = {'50': 60, '100': 110, '200': 220};
/** Minor tick spacing in seconds per zoom; labels land on whole seconds. */
const TICK_INTERVAL_SEC: Record<ZoomPreset, number> = {
  '50': 1,
  '100': 0.5,
  '200': 0.25,
};

const MONO = 'var(--font-family-code, monospace)';

// Lane geometry: fixed header column + shared row heights so the header
// cells and canvas rows stay registered on the same gridlines.
const LANE_HEADER_W = 240;
const LANE_HEADER_W_COMPACT = 172;
const RULER_H = 28;
const SCRUB_H = 26;
const LANE_H = 40;
/** Expanded lane: 36px sticky pill row + the curve SVG below it. */
const PILL_ROW_H = 36;
const CURVE_SVG_H = 216;
const CURVE_LANE_H = PILL_ROW_H + CURVE_SVG_H;
/** Vertical padding inside the curve SVG so min/max gridlines sit inset. */
const CURVE_PAD_Y = 26;

/** Seconds -> SMPTE HH:MM:SS:FF at 24fps (clip-local). */
function formatTimecode(sec: number): string {
  const totalFrames = Math.round(sec * FPS);
  const frames = totalFrames % FPS;
  const totalSec = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totalSec / 3600))}:${pad(
    Math.floor(totalSec / 60) % 60,
  )}:${pad(totalSec % 60)}:${pad(frames)}`;
}

const toFrame = (sec: number) => Math.round(sec * FPS);
const clampSec = (sec: number) =>
  Math.min(CLIP_DURATION_SEC, Math.max(0, sec));
const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// ============= ANIMATION FIXTURES =============
// Fixed keyframe lists — literal times, values, and bezier handle quads.

type PropId = 'posX' | 'posY' | 'scale' | 'rotation' | 'opacity';
type InterpMode = 'linear' | 'bezier' | 'hold';

/** A keyframe plus the interpolation of its OUTGOING segment. The handle
 * quad is normalized to the segment box exactly like cubic-bezier():
 * c1/c2 x are fractions of the segment duration (0..1), y are fractions
 * of the segment's value delta (may leave 0..1 for overshoot). */
interface Keyframe {
  id: string;
  t: number; // clip-local seconds
  v: number; // property units
  interp: InterpMode;
  c1x: number;
  c1y: number;
  c2x: number;
  c2y: number;
}

interface PropDef {
  id: PropId;
  label: string;
  unit: string;
  min: number;
  max: number;
  /** Decimal places for readouts. */
  decimals: number;
  color: string;
}

// Data-viz categorical tokens with the repo-standard fallback pairs (the
// demo does not inject these tokens — the fallbacks are load-bearing).
const PROPS: PropDef[] = [
  {id: 'posX', label: 'Position X', unit: 'px', min: -200, max: 200, decimals: 0,
    color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))'},
  {id: 'posY', label: 'Position Y', unit: 'px', min: -120, max: 120, decimals: 0,
    color: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))'},
  {id: 'scale', label: 'Scale', unit: '%', min: 80, max: 160, decimals: 1,
    color: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))'},
  {id: 'rotation', label: 'Rotation', unit: '°', min: -12, max: 12, decimals: 1,
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))'},
  {id: 'opacity', label: 'Opacity', unit: '%', min: 0, max: 100, decimals: 0,
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))'},
];

const PROP_BY_ID = new Map(PROPS.map(p => [p.id, p]));

const kf = (
  id: string,
  t: number,
  v: number,
  interp: InterpMode = 'bezier',
  quad: [number, number, number, number] = [0.33, 0, 0.67, 1],
): Keyframe => ({
  id,
  t,
  v,
  interp,
  c1x: quad[0],
  c1y: quad[1],
  c2x: quad[2],
  c2y: quad[3],
});

/** The drone push-in: x pans across, y settles, scale grows, rotation
 * overshoots level, opacity fades in, holds, and fades out. */
const INITIAL_KEYFRAMES: Record<PropId, Keyframe[]> = {
  posX: [
    kf('px-1', 0, -160, 'bezier', [0.42, 0, 0.72, 1]),
    kf('px-2', 2.5, -40, 'bezier', [0.33, 0, 0.67, 1]),
    kf('px-3', 5.5, 60, 'linear'),
    kf('px-4', 8, 150, 'bezier'),
  ],
  posY: [
    kf('py-1', 0, 80, 'bezier', [0.4, 0, 0.6, 1]),
    kf('py-2', 4, -10, 'bezier', [0.33, 0, 0.58, 1]),
    kf('py-3', 8, -60, 'bezier'),
  ],
  scale: [
    kf('sc-1', 0, 100, 'bezier', [0.25, 0.1, 0.25, 1]),
    kf('sc-2', 3, 124, 'bezier', [0.42, 0, 0.58, 1]),
    kf('sc-3', 8, 140, 'bezier'),
  ],
  rotation: [
    kf('rt-1', 0, -6, 'linear'),
    kf('rt-2', 4.5, 2, 'bezier', [0.175, 0.885, 0.32, 1.275]),
    kf('rt-3', 8, 0, 'bezier'),
  ],
  opacity: [
    kf('op-1', 0, 0, 'bezier', [0, 0, 0.5, 1]),
    kf('op-2', 0.75, 100, 'hold'),
    kf('op-3', 7, 100, 'bezier', [0.5, 0, 1, 1]),
    kf('op-4', 8, 0, 'bezier'),
  ],
};

interface EasingPreset {
  id: string;
  label: string;
  interp: InterpMode;
  quad: [number, number, number, number];
}

/** Preset chips: each applies to the selected keyframe's outgoing segment.
 * Literal control quads — the mini thumbnails draw from the same values. */
const EASING_PRESETS: EasingPreset[] = [
  {id: 'linear', label: 'Linear', interp: 'linear', quad: [0, 0, 1, 1]},
  {id: 'easy', label: 'Easy Ease', interp: 'bezier', quad: [0.33, 0, 0.67, 1]},
  {id: 'ease-in', label: 'Ease In', interp: 'bezier', quad: [0.5, 0, 1, 1]},
  {id: 'ease-out', label: 'Ease Out', interp: 'bezier', quad: [0, 0, 0.5, 1]},
  {
    id: 'anticipate',
    label: 'Anticipate',
    interp: 'bezier',
    quad: [0.6, -0.28, 0.735, 0.045],
  },
  {
    id: 'overshoot',
    label: 'Overshoot',
    interp: 'bezier',
    quad: [0.175, 0.885, 0.32, 1.275],
  },
];

// ============= CURVE MATH =============

/** Solve a 1-D cubic bezier (anchors 0/1, controls a/b) for parameter s. */
function bez(a: number, b: number, s: number): number {
  const inv = 1 - s;
  return 3 * inv * inv * s * a + 3 * inv * s * s * b + s * s * s;
}

/** cubic-bezier easing: find s where x(s)=u (bisection), return y(s). */
function solveBezier(
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  u: number,
): number {
  let lo = 0;
  let hi = 1;
  let s = u;
  for (let i = 0; i < 24; i++) {
    const x = bez(c1x, c2x, s);
    if (Math.abs(x - u) < 0.0005) {
      break;
    }
    if (x < u) {
      lo = s;
    } else {
      hi = s;
    }
    s = (lo + hi) / 2;
  }
  return bez(c1y, c2y, s);
}

/** Evaluate a keyframe list at clip time t (pure — feeds every readout). */
function evalKeyframes(kfs: Keyframe[], t: number): number {
  if (kfs.length === 0) {
    return 0;
  }
  if (t <= kfs[0].t) {
    return kfs[0].v;
  }
  const last = kfs[kfs.length - 1];
  if (t >= last.t) {
    return last.v;
  }
  let i = 0;
  while (i < kfs.length - 2 && t >= kfs[i + 1].t) {
    i++;
  }
  const a = kfs[i];
  const b = kfs[i + 1];
  if (a.interp === 'hold') {
    return a.v;
  }
  const u = (t - a.t) / (b.t - a.t);
  if (a.interp === 'linear') {
    return a.v + (b.v - a.v) * u;
  }
  return a.v + (b.v - a.v) * solveBezier(a.c1x, a.c1y, a.c2x, a.c2y, u);
}

/** Format a property value with its unit for readouts. */
function formatValue(prop: PropDef, v: number): string {
  const num = v.toFixed(prop.decimals);
  const signed = prop.min < 0 && v > 0 ? `+${num}` : num;
  return prop.unit === '°' ? `${signed}°` : `${signed} ${prop.unit}`;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // The demo stage is auto-height; a real viewport height restores the
  // Layout fill contract (footgun: Layout height="fill" collapses).
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  timecode: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Header controls wrap onto a second row instead of clipping.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=820px: 40px touch targets for thumb-driven transport controls.
  tapTarget: {width: 40, height: 40},
  // ---- Lane stack scaffolding ----
  editor: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  // One shared vertical scroller wraps both columns so lane headers and
  // canvas rows can never scroll out of registration; only the canvas
  // side scrolls horizontally.
  editorBody: {flex: 1, minHeight: 0, display: 'flex', overflowY: 'auto'},
  laneHeaderCol: {
    width: LANE_HEADER_W,
    flexShrink: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'hidden',
  },
  laneHeaderTop: {
    height: RULER_H + SCRUB_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingInline: 'var(--spacing-2)',
  },
  laneHeaderCell: {
    height: LANE_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    paddingInline: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  // Expanded lane header: name row on top, then the value-axis labels that
  // line up with the SVG gridlines across the canvas.
  curveHeaderCell: {
    height: CURVE_LANE_H,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    paddingInline: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  curveHeaderName: {
    height: LANE_H,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  curveAxis: {position: 'relative', flex: 1},
  curveAxisLabel: {
    position: 'absolute',
    right: 4,
    transform: 'translateY(-50%)',
    fontFamily: MONO,
    fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  propDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    transform: 'rotate(45deg)',
    flexShrink: 0,
  },
  propReadout: {
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    textAlign: 'end',
  },
  // 12px inline padding: diamonds, curve anchors, and the playhead cap at
  // t=0 or t=end render whole instead of clipping at the scrollport edge
  // (the plot overflow:visible lesson, applied to the scroll container).
  laneCanvasScroll: {
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingInline: 12,
  },
  // minWidth 100%: at 50% zoom the lane backgrounds and ruler still span
  // the whole scrollport instead of stopping mid-panel at the 8s mark.
  laneCanvas: {position: 'relative', minWidth: '100%'},
  // ---- Ruler + scrub ----
  ruler: {
    position: 'relative',
    height: RULER_H,
    cursor: 'pointer',
    backgroundColor: 'var(--color-background-muted)',
  },
  rulerTick: {
    position: 'absolute',
    bottom: 0,
    width: 1,
    height: 6,
    backgroundColor: 'var(--color-border)',
  },
  rulerTickMajor: {
    position: 'absolute',
    bottom: 0,
    width: 1,
    height: 10,
    backgroundColor: 'var(--color-text-secondary)',
  },
  rulerLabel: {
    position: 'absolute',
    top: 3,
    fontFamily: MONO,
    fontSize: 9,
    color: 'var(--color-text-secondary)',
    transform: 'translateX(4px)',
    userSelect: 'none',
  },
  // Scrub row reserves inline room via the Slider width matching the
  // canvas; the ruler labels sit above so the thumb at 0 never overlaps
  // timecode text (footgun: scrubbers/sliders).
  scrubRow: {height: SCRUB_H, display: 'flex', alignItems: 'center'},
  // ---- Collapsed lanes ----
  lane: {
    position: 'relative',
    height: LANE_H,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  laneDisabled: {opacity: 0.35},
  laneBaseline: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  // Diamond keyframe: a 30px hit area button around a 12px rotated square.
  diamondBtn: {
    position: 'absolute',
    top: '50%',
    width: 30,
    height: 30,
    marginLeft: -15,
    marginTop: -15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    zIndex: 3,
  },
  diamond: {
    width: 12,
    height: 12,
    transform: 'rotate(45deg)',
    borderRadius: 2,
    border: '1.5px solid var(--color-background-card)',
    boxShadow:
      '0 0 0 1px color-mix(in srgb, var(--color-text-primary) 25%, transparent)',
  },
  // ---- Expanded curve lane ----
  curveLane: {
    position: 'relative',
    height: CURVE_LANE_H,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Sticky-left pill cluster: stays visible while the canvas scrolls
  // horizontally, so interpolation + presets never drift off screen.
  pillRow: {
    position: 'sticky',
    // Matches the scrollport's 12px inline padding so the cluster neither
    // jumps on first scroll nor slides under the lane-header divider.
    left: 12,
    height: PILL_ROW_H,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-2)',
    width: 'fit-content',
    maxWidth: '100%',
    flexWrap: 'nowrap',
    zIndex: 4,
  },
  presetRail: {display: 'flex', alignItems: 'center', gap: 4},
  presetChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    height: 26,
    paddingInline: 8,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: 11,
    color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap',
  },
  presetChipActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  // The plot: endpoint anchors, handles, and overshoot excursions sit on
  // or beyond the drawing box — render whole, never clip to half-shapes.
  curveSvg: {display: 'block', overflow: 'visible', touchAction: 'none'},
  handleDot: {cursor: 'grab'},
  handleDotDragging: {cursor: 'grabbing'},
  // ---- Playhead ----
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'light-dark(#EF4444, #F87171)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  playheadCap: {
    position: 'absolute',
    top: 0,
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: 'light-dark(#EF4444, #F87171)',
    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
  },
  // ---- Inspector panel ----
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
  // Slider thumb at 0 must never overlap its label column (footgun:
  // scrubbers/sliders) — the wrapper reserves inline padding.
  handleSliderWrap: {paddingInline: 'var(--spacing-1)'},
  // ---- Status footer ----
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    minWidth: 0,
  },
};

// ============= SMALL PIECES =============

/** Seconds ruler: minor ticks per zoom, labeled major ticks on whole
 * seconds ("1s" style, After Effects idiom). Click to scrub. */
function TimeRuler({
  pxPerSec,
  tickInterval,
  onScrub,
}: {
  pxPerSec: number;
  tickInterval: number;
  onScrub: (sec: number) => void;
}) {
  const ticks: number[] = [];
  for (let t = 0; t <= CLIP_DURATION_SEC + 1e-6; t += tickInterval) {
    ticks.push(Math.round(t * 100) / 100);
  }
  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onScrub((event.clientX - rect.left) / pxPerSec);
  };
  return (
    <div
      style={{
        ...styles.ruler,
        width: CLIP_DURATION_SEC * pxPerSec,
        minWidth: '100%',
      }}
      onClick={handleClick}
      role="presentation"
      aria-hidden>
      {ticks.map(t => {
        const isMajor = Number.isInteger(t);
        return (
          <span key={t}>
            <span
              style={{
                ...(isMajor ? styles.rulerTickMajor : styles.rulerTick),
                left: t * pxPerSec,
              }}
            />
            {isMajor && t < CLIP_DURATION_SEC && (
              <span style={{...styles.rulerLabel, left: t * pxPerSec}}>
                {t}s
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Easing preset chip with a mini curve thumbnail drawn from the same
 * literal control quad the click applies. */
function PresetChip({
  preset,
  isActive,
  isDisabled,
  onApply,
}: {
  preset: EasingPreset;
  isActive: boolean;
  isDisabled: boolean;
  onApply: (preset: EasingPreset) => void;
}) {
  const [x1, y1, x2, y2] = preset.quad;
  // 22x14 thumbnail; y flips (SVG y grows downward) with 3px headroom for
  // anticipate/overshoot excursions.
  const W = 22;
  const H = 14;
  const px = (fx: number) => fx * W;
  const py = (fy: number) => H - 3 - fy * (H - 6);
  const d =
    preset.interp === 'linear'
      ? `M 0 ${py(0)} L ${W} ${py(1)}`
      : `M 0 ${py(0)} C ${px(x1)} ${py(y1)}, ${px(x2)} ${py(y2)}, ${W} ${py(1)}`;
  return (
    <button
      type="button"
      style={{
        ...styles.presetChip,
        ...(isActive ? styles.presetChipActive : undefined),
        opacity: isDisabled ? 0.45 : 1,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
      }}
      disabled={isDisabled}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.label} easing to the selected segment`}
      onClick={() => onApply(preset)}>
      <svg width={W} height={H} style={styles.curveSvg} aria-hidden>
        <path
          d={d}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1.5}
        />
      </svg>
      {preset.label}
    </button>
  );
}

/** Collapsed property lane: baseline + diamond keyframe buttons. */
function CollapsedLane({
  prop,
  kfs,
  pxPerSec,
  isEnabled,
  selectedKfId,
  onSelect,
}: {
  prop: PropDef;
  kfs: Keyframe[];
  pxPerSec: number;
  isEnabled: boolean;
  selectedKfId: string | null;
  onSelect: (propId: PropId, kfId: string) => void;
}) {
  return (
    <div
      style={{
        ...styles.lane,
        ...(isEnabled ? undefined : styles.laneDisabled),
      }}>
      <div style={styles.laneBaseline} aria-hidden />
      {kfs.map(k => {
        const isSelected = k.id === selectedKfId;
        return (
          <button
            key={k.id}
            type="button"
            style={{...styles.diamondBtn, left: k.t * pxPerSec}}
            disabled={!isEnabled}
            aria-label={`${prop.label} keyframe at ${formatTimecode(
              k.t,
            )}, ${formatValue(prop, k.v)}`}
            aria-pressed={isSelected}
            onClick={() => onSelect(prop.id, k.id)}>
            <span
              style={{
                ...styles.diamond,
                backgroundColor: prop.color,
                ...(isSelected
                  ? {
                      boxShadow: '0 0 0 2px var(--color-accent)',
                      width: 14,
                      height: 14,
                    }
                  : undefined),
              }}
            />
          </button>
        );
      })}
    </div>
  );
}

// ============= EXPANDED CURVE LANE =============

interface CurveLaneProps {
  prop: PropDef;
  kfs: Keyframe[];
  pxPerSec: number;
  playheadSec: number;
  playheadValue: number;
  selectedKfId: string | null;
  /** Sticky-left interpolation pills + preset chips (built by the page). */
  pillCluster: ReactNode;
  onSelectKf: (propId: PropId, kfId: string) => void;
  onHandleChange: (
    propId: PropId,
    kfId: string,
    patch: Partial<Keyframe>,
  ) => void;
}

/** Expanded lane: value-over-time bezier plot. The SVG is 1:1 with CSS
 * pixels (width = duration * pxPerSec) so pointer math needs no viewBox
 * scaling; overflow stays visible so anchors/handles at the edges and
 * overshoot excursions render whole. */
function CurveLane({
  prop,
  kfs,
  pxPerSec,
  playheadSec,
  playheadValue,
  selectedKfId,
  pillCluster,
  onSelectKf,
  onHandleChange,
}: CurveLaneProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [dragging, setDragging] = useState<'c1' | 'c2' | null>(null);

  const width = CLIP_DURATION_SEC * pxPerSec;
  const innerH = CURVE_SVG_H - 2 * CURVE_PAD_Y;
  const xOf = (t: number) => t * pxPerSec;
  const yOf = (v: number) =>
    CURVE_PAD_Y + (1 - (v - prop.min) / (prop.max - prop.min)) * innerH;
  const valOfY = (y: number) =>
    prop.min + (1 - (y - CURVE_PAD_Y) / innerH) * (prop.max - prop.min);

  // ---- Path assembly: hold steps, linear lines, bezier C segments ----
  let mainPath = '';
  const dashPaths: string[] = [];
  if (kfs.length > 0) {
    const first = kfs[0];
    const last = kfs[kfs.length - 1];
    if (first.t > 0) {
      dashPaths.push(`M 0 ${yOf(first.v)} L ${xOf(first.t)} ${yOf(first.v)}`);
    }
    if (last.t < CLIP_DURATION_SEC) {
      dashPaths.push(`M ${xOf(last.t)} ${yOf(last.v)} L ${width} ${yOf(last.v)}`);
    }
    mainPath = `M ${xOf(first.t)} ${yOf(first.v)}`;
    for (let i = 0; i < kfs.length - 1; i++) {
      const a = kfs[i];
      const b = kfs[i + 1];
      const dt = b.t - a.t;
      const dv = b.v - a.v;
      if (a.interp === 'hold') {
        mainPath += ` L ${xOf(b.t)} ${yOf(a.v)} L ${xOf(b.t)} ${yOf(b.v)}`;
      } else if (a.interp === 'linear') {
        mainPath += ` L ${xOf(b.t)} ${yOf(b.v)}`;
      } else {
        mainPath += ` C ${xOf(a.t + a.c1x * dt)} ${yOf(a.v + a.c1y * dv)}, ${xOf(
          a.t + a.c2x * dt,
        )} ${yOf(a.v + a.c2y * dv)}, ${xOf(b.t)} ${yOf(b.v)}`;
      }
    }
  }

  // ---- Selected segment: outgoing bezier handles become draggable ----
  const selIndex = kfs.findIndex(k => k.id === selectedKfId);
  const segA = selIndex >= 0 && selIndex < kfs.length - 1 ? kfs[selIndex] : null;
  const segB = segA != null ? kfs[selIndex + 1] : null;
  const showHandles = segA != null && segB != null && segA.interp === 'bezier';
  const segDt = segA != null && segB != null ? segB.t - segA.t : 0;
  const segDv = segA != null && segB != null ? segB.v - segA.v : 0;

  const dragTo = useCallback(
    (which: 'c1' | 'c2', clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (svg == null || segA == null || segDt === 0) {
        return;
      }
      const rect = svg.getBoundingClientRect();
      const t = (clientX - rect.left) / pxPerSec;
      const v = valOfY(clientY - rect.top);
      const fx = clamp((t - segA.t) / segDt, 0, 1);
      // Flat segments keep y handles at 0 — dv of 0 makes fy meaningless.
      const fy = segDv !== 0 ? clamp((v - segA.v) / segDv, -2, 3) : 0;
      onHandleChange(
        prop.id,
        segA.id,
        which === 'c1' ? {c1x: fx, c1y: fy} : {c2x: fx, c2y: fy},
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [segA, segDt, segDv, pxPerSec, prop.id, onHandleChange],
  );

  const handlePointerDown =
    (which: 'c1' | 'c2') => (event: ReactPointerEvent<SVGCircleElement>) => {
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(which);
    };
  const handlePointerMove =
    (which: 'c1' | 'c2') => (event: ReactPointerEvent<SVGCircleElement>) => {
      if (dragging === which) {
        dragTo(which, event.clientX, event.clientY);
      }
    };
  const handlePointerUp = (event: ReactPointerEvent<SVGCircleElement>) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(null);
  };

  const gridValues = [prop.max, (prop.min + prop.max) / 2, prop.min];
  const secondLines: number[] = [];
  for (let s = 0; s <= CLIP_DURATION_SEC; s++) {
    secondLines.push(s);
  }
  const gridStroke =
    'color-mix(in srgb, var(--color-border) 70%, transparent)';
  const handleStroke = 'var(--color-accent)';

  const c1pt =
    showHandles && segA != null
      ? {x: xOf(segA.t + segA.c1x * segDt), y: yOf(segA.v + segA.c1y * segDv)}
      : null;
  const c2pt =
    showHandles && segA != null
      ? {x: xOf(segA.t + segA.c2x * segDt), y: yOf(segA.v + segA.c2y * segDv)}
      : null;

  return (
    <div style={styles.curveLane}>
      {pillCluster}
      <svg
        ref={svgRef}
        width={width}
        height={CURVE_SVG_H}
        style={styles.curveSvg}
        role="img"
        aria-label={`${prop.label} value curve, ${kfs.length} keyframes from ${
          kfs.length > 0 ? formatValue(prop, kfs[0].v) : ''
        } to ${
          kfs.length > 0 ? formatValue(prop, kfs[kfs.length - 1].v) : ''
        }`}>
        {/* Value gridlines — labels live in the fixed header column so
            they survive horizontal scroll. */}
        {gridValues.map(v => (
          <line
            key={`h-${v}`}
            x1={0}
            x2={width}
            y1={yOf(v)}
            y2={yOf(v)}
            stroke={gridStroke}
            strokeWidth={1}
          />
        ))}
        {secondLines.map(s => (
          <line
            key={`v-${s}`}
            x1={xOf(s)}
            x2={xOf(s)}
            y1={CURVE_PAD_Y - 8}
            y2={CURVE_SVG_H - CURVE_PAD_Y + 8}
            stroke={gridStroke}
            strokeWidth={1}
            strokeDasharray="2 4"
          />
        ))}
        {/* Flat extensions before the first / after the last keyframe. */}
        {dashPaths.map(d => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={prop.color}
            strokeWidth={1.5}
            strokeDasharray="3 4"
            opacity={0.6}
          />
        ))}
        <path d={mainPath} fill="none" stroke={prop.color} strokeWidth={2} />
        {/* Selected-segment emphasis + bezier handles. */}
        {segA != null && segB != null && (
          <g>
            {c1pt != null && c2pt != null && (
              <g>
                {(
                  [
                    {which: 'c1', pt: c1pt, anchor: segA, label: 'Out handle'},
                    {which: 'c2', pt: c2pt, anchor: segB, label: 'In handle'},
                  ] as const
                ).map(({which, pt, anchor, label}) => (
                  <g key={which}>
                    <line
                      x1={xOf(anchor.t)}
                      y1={yOf(anchor.v)}
                      x2={pt.x}
                      y2={pt.y}
                      stroke={handleStroke}
                      strokeWidth={1.25}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={6}
                      fill="var(--color-background-card)"
                      stroke={handleStroke}
                      strokeWidth={2}
                      style={
                        dragging === which
                          ? {...styles.handleDot, ...styles.handleDotDragging}
                          : styles.handleDot
                      }
                      aria-label={label}
                      onPointerDown={handlePointerDown(which)}
                      onPointerMove={handlePointerMove(which)}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                    />
                  </g>
                ))}
              </g>
            )}
          </g>
        )}
        {/* Keyframe anchors: rotated squares, keyboard-focusable. */}
        {kfs.map(k => {
          const isSelected = k.id === selectedKfId;
          const size = isSelected ? 11 : 9;
          return (
            <rect
              key={k.id}
              x={xOf(k.t) - size / 2}
              y={yOf(k.v) - size / 2}
              width={size}
              height={size}
              rx={1.5}
              transform={`rotate(45 ${xOf(k.t)} ${yOf(k.v)})`}
              fill={prop.color}
              stroke={
                isSelected
                  ? 'var(--color-accent)'
                  : 'var(--color-background-card)'
              }
              strokeWidth={isSelected ? 2 : 1.5}
              tabIndex={0}
              role="button"
              aria-label={`${prop.label} keyframe at ${formatTimecode(
                k.t,
              )}, ${formatValue(prop, k.v)}`}
              style={{cursor: 'pointer', outline: 'none'}}
              onClick={() => onSelectKf(prop.id, k.id)}
              onKeyDown={event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectKf(prop.id, k.id);
                }
              }}
            />
          );
        })}
        {/* Evaluated value marker riding the playhead. */}
        <circle
          cx={xOf(playheadSec)}
          cy={yOf(playheadValue)}
          r={4}
          fill="light-dark(#EF4444, #F87171)"
          stroke="var(--color-background-card)"
          strokeWidth={1.5}
          aria-hidden
        />
      </svg>
    </div>
  );
}

// ============= LANE HEADER CELLS =============

interface LaneHeaderProps {
  prop: PropDef;
  isEnabled: boolean;
  isExpanded: boolean;
  liveValue: number;
  keyframeAtPlayhead: boolean;
  onToggleEnabled: (propId: PropId, isPressed: boolean) => void;
  onToggleExpanded: (propId: PropId) => void;
  onAddKeyframe: (propId: PropId) => void;
}

/** Fixed-column header row for one property: expand chevron, animate
 * stopwatch, name, live evaluated readout, add-keyframe. Height matches
 * the collapsed lane (or tops the expanded lane) so gridlines register. */
function LaneHeaderRow({
  prop,
  isEnabled,
  isExpanded,
  liveValue,
  keyframeAtPlayhead,
  onToggleEnabled,
  onToggleExpanded,
  onAddKeyframe,
}: LaneHeaderProps) {
  return (
    <>
      <IconButton
        label={
          isExpanded
            ? `Collapse ${prop.label} curve`
            : `Expand ${prop.label} curve`
        }
        tooltip={isExpanded ? 'Collapse curve' : 'Show value curve'}
        icon={
          <Icon
            icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
            size="sm"
            color="inherit"
          />
        }
        variant="ghost"
        size="sm"
        onClick={() => onToggleExpanded(prop.id)}
      />
      <ToggleButton
        label={`Animate ${prop.label}`}
        size="sm"
        isIconOnly
        isPressed={isEnabled}
        onPressedChange={isPressed => onToggleEnabled(prop.id, isPressed)}
        tooltip={isEnabled ? 'Animation on' : 'Animation off'}
        icon={<Icon icon={TimerIcon} size="sm" color="inherit" />}
      />
      <span style={{...styles.propDot, backgroundColor: prop.color}} aria-hidden />
      <StackItem size="fill">
        <Text type="supporting" weight="semibold" maxLines={1}>
          {prop.label}
        </Text>
      </StackItem>
      <Text
        type="supporting"
        color={isEnabled ? 'primary' : 'secondary'}
        hasTabularNumbers
        style={styles.propReadout}>
        {formatValue(prop, liveValue)}
      </Text>
      <IconButton
        label={`Add ${prop.label} keyframe at playhead`}
        tooltip={
          keyframeAtPlayhead ? 'Keyframe exists here' : 'Add keyframe at playhead'
        }
        icon={<Icon icon={DiamondPlusIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        isDisabled={!isEnabled || keyframeAtPlayhead}
        onClick={() => onAddKeyframe(prop.id)}
      />
    </>
  );
}

// ============= INSPECTOR PANEL =============

interface InspectorProps {
  prop: PropDef | null;
  kfs: Keyframe[];
  selected: Keyframe | null;
  selectedIndex: number;
  onPatch: (patch: Partial<Keyframe>) => void;
  onDelete: () => void;
  onApplyPreset: (preset: EasingPreset) => void;
}

function InspectorPanel({
  prop,
  kfs,
  selected,
  selectedIndex,
  onPatch,
  onDelete,
  onApplyPreset,
}: InspectorProps) {
  if (prop == null || selected == null) {
    return (
      <div style={styles.panelScroll}>
        <div style={styles.panelEmpty}>
          <VStack gap={1} hAlign="center">
            <Icon icon={DiamondIcon} size="md" color="secondary" />
            <Text type="body" weight="semibold">
              No keyframe selected
            </Text>
            <Text type="supporting" color="secondary">
              Click a diamond on a property lane to inspect and shape its
              interpolation.
            </Text>
          </VStack>
        </div>
      </div>
    );
  }

  const prev = selectedIndex > 0 ? kfs[selectedIndex - 1] : null;
  const next = selectedIndex < kfs.length - 1 ? kfs[selectedIndex + 1] : null;
  const isLast = next == null;
  const frame = toFrame(selected.t);
  const minFrame = prev != null ? toFrame(prev.t) + 1 : 0;
  const maxFrame =
    next != null ? toFrame(next.t) - 1 : toFrame(CLIP_DURATION_SEC);
  const isEndpoint = selectedIndex === 0 || isLast;
  const activePreset = EASING_PRESETS.find(
    p =>
      p.interp === selected.interp &&
      (p.interp === 'linear' ||
        (Math.abs(p.quad[0] - selected.c1x) < 0.01 &&
          Math.abs(p.quad[1] - selected.c1y) < 0.01 &&
          Math.abs(p.quad[2] - selected.c2x) < 0.01 &&
          Math.abs(p.quad[3] - selected.c2y) < 0.01)),
  );

  return (
    <div style={styles.panelScroll}>
      <VStack gap={3}>
        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <span
                style={{...styles.propDot, backgroundColor: prop.color}}
                aria-hidden
              />
              <StackItem size="fill">
                <Text type="body" weight="semibold">
                  {prop.label}
                </Text>
              </StackItem>
              <Badge
                label={`${selectedIndex + 1} of ${kfs.length}`}
                variant="neutral"
              />
            </HStack>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers
                  style={styles.mono}>
                  {formatTimecode(selected.t)}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers style={styles.mono}>
                {formatValue(prop, selected.v)}
              </Text>
            </HStack>
          </VStack>
        </Card>

        <VStack gap={2}>
          <Text type="label" color="secondary">
            Keyframe
          </Text>
          <NumberInput
            label="Frame"
            value={frame}
            min={minFrame}
            max={maxFrame}
            step={1}
            size="sm"
            isDisabled={isEndpoint}
            onChange={v => onPatch({t: clampSec(v / FPS)})}
          />
          {isEndpoint ? (
            <Text type="supporting" color="secondary">
              Endpoint keyframes stay pinned to the clip bounds.
            </Text>
          ) : (
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Between frames {minFrame} and {maxFrame}.
            </Text>
          )}
          <NumberInput
            label={`Value (${prop.unit})`}
            value={Number(selected.v.toFixed(prop.decimals))}
            min={prop.min}
            max={prop.max}
            step={prop.decimals > 0 ? 0.1 : 1}
            size="sm"
            onChange={v => onPatch({v: clamp(v, prop.min, prop.max)})}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <Text type="label" color="secondary">
            Outgoing interpolation
          </Text>
          {isLast ? (
            <Text type="supporting" color="secondary">
              Last keyframe — the value holds at{' '}
              {formatValue(prop, selected.v)} to the clip end.
            </Text>
          ) : (
            <>
              <SegmentedControl
                value={selected.interp}
                onChange={v => onPatch({interp: v as InterpMode})}
                label="Interpolation mode"
                size="sm">
                <SegmentedControlItem value="linear" label="Linear" />
                <SegmentedControlItem value="bezier" label="Bezier" />
                <SegmentedControlItem value="hold" label="Hold" />
              </SegmentedControl>
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={styles.mono}>
                → {formatTimecode(next.t)} · Δ{' '}
                {formatValue(prop, next.v - selected.v)}
              </Text>
            </>
          )}
        </VStack>

        {!isLast && selected.interp === 'bezier' && (
          <>
            <Divider />
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Bezier handles
              </Text>
              <div style={styles.handleSliderWrap}>
                <VStack gap={3}>
                  {(
                    [
                      // In influence reads from the next keyframe backward,
                      // hence the 1 - c2x mapping (After Effects idiom).
                      {label: 'Out influence', value: Math.round(selected.c1x * 100), min: 0, max: 100, patch: (v: number) => ({c1x: v / 100})},
                      {label: 'Out velocity', value: Math.round(selected.c1y * 100), min: -100, max: 200, patch: (v: number) => ({c1y: v / 100})},
                      {label: 'In influence', value: Math.round((1 - selected.c2x) * 100), min: 0, max: 100, patch: (v: number) => ({c2x: 1 - v / 100})},
                      {label: 'In velocity', value: Math.round(selected.c2y * 100), min: -100, max: 200, patch: (v: number) => ({c2y: v / 100})},
                    ] as const
                  ).map(s => (
                    <Slider
                      key={s.label}
                      label={s.label}
                      value={s.value}
                      min={s.min}
                      max={s.max}
                      step={1}
                      valueDisplay="text"
                      formatValue={v => `${v}%`}
                      onChange={(v: number) => onPatch(s.patch(v))}
                    />
                  ))}
                </VStack>
              </div>
              <Text type="supporting" color="secondary">
                Or drag the handles on the curve directly.
              </Text>
            </VStack>
          </>
        )}

        {!isLast && (
          <>
            <Divider />
            <VStack gap={2}>
              <Text type="label" color="secondary">
                Easing presets
              </Text>
              <HStack gap={1} style={{flexWrap: 'wrap', rowGap: 4}}>
                {EASING_PRESETS.map(preset => (
                  <PresetChip
                    key={preset.id}
                    preset={preset}
                    isActive={activePreset?.id === preset.id}
                    isDisabled={false}
                    onApply={onApplyPreset}
                  />
                ))}
              </HStack>
            </VStack>
          </>
        )}

        <Divider />

        <Button
          label="Delete keyframe"
          variant="ghost"
          size="sm"
          icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
          isDisabled={kfs.length <= 2}
          onClick={onDelete}
        />
        {kfs.length <= 2 && (
          <Text type="supporting" color="secondary">
            A property keeps at least two keyframes while animated.
          </Text>
        )}
      </VStack>
    </div>
  );
}

// ============= PAGE =============

interface Selection {
  prop: PropId;
  kfId: string;
}

export default function VideoEditorKeyframeEditorTemplate() {
  const [keyframes, setKeyframes] =
    useState<Record<PropId, Keyframe[]>>(INITIAL_KEYFRAMES);
  const [enabled, setEnabled] = useState<Record<PropId, boolean>>({
    posX: true,
    posY: true,
    scale: true,
    rotation: true,
    opacity: true,
  });
  const [expandedProp, setExpandedProp] = useState<PropId | null>('posX');
  const [selection, setSelection] = useState<Selection | null>({
    prop: 'posX',
    kfId: 'px-2',
  });
  const [playheadSec, setPlayheadSec] = useState(INITIAL_PLAYHEAD_SEC);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState<ZoomPreset>('100');
  const [snapToKeyframes, setSnapToKeyframes] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const nextIdRef = useRef(1);

  const isNarrow = useMediaQuery('(max-width: 1200px)');
  const isCompact = useMediaQuery('(max-width: 820px)');
  const inspectorVisible = isPanelOpen && !isNarrow;
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  const laneHeaderW = isCompact ? LANE_HEADER_W_COMPACT : LANE_HEADER_W;

  const pxPerSec = PX_PER_SEC[zoom];
  const canvasWidth = CLIP_DURATION_SEC * pxPerSec;
  const zoomIndex = ZOOM_ORDER.indexOf(zoom);

  // ---- Derived readouts (pure functions of state — no effects) ----
  const liveValues = useMemo(() => {
    const out = {} as Record<PropId, number>;
    for (const p of PROPS) {
      out[p.id] = evalKeyframes(keyframes[p.id], playheadSec);
    }
    return out;
  }, [keyframes, playheadSec]);

  const totalKeyframes = PROPS.reduce(
    (sum, p) => sum + keyframes[p.id].length,
    0,
  );
  const animatedCount = PROPS.filter(p => enabled[p.id]).length;

  const selectedProp =
    selection != null ? (PROP_BY_ID.get(selection.prop) ?? null) : null;
  const selectedKfs = selection != null ? keyframes[selection.prop] : [];
  const selectedIndex =
    selection != null
      ? selectedKfs.findIndex(k => k.id === selection.kfId)
      : -1;
  const selectedKf = selectedIndex >= 0 ? selectedKfs[selectedIndex] : null;

  // ---- Handlers (single commit path per concern) ----
  const selectKf = useCallback((propId: PropId, kfId: string) => {
    setSelection({prop: propId, kfId});
    setExpandedProp(propId);
  }, []);

  const toggleExpanded = useCallback(
    (propId: PropId) => {
      setExpandedProp(prev => (prev === propId ? null : propId));
      if (expandedProp !== propId && selection?.prop !== propId) {
        // Expanding a fresh lane focuses its first keyframe so the pill
        // cluster and inspector always describe something visible.
        const first = keyframes[propId][0];
        if (first != null) {
          setSelection({prop: propId, kfId: first.id});
        }
      }
    },
    [expandedProp, selection, keyframes],
  );

  const patchKf = useCallback(
    (propId: PropId, kfId: string, patch: Partial<Keyframe>) => {
      setKeyframes(prev => ({
        ...prev,
        [propId]: prev[propId]
          .map(k => (k.id === kfId ? {...k, ...patch} : k))
          .slice()
          .sort((a, b) => a.t - b.t),
      }));
    },
    [],
  );

  const patchSelected = useCallback(
    (patch: Partial<Keyframe>) => {
      if (selection != null) {
        patchKf(selection.prop, selection.kfId, patch);
      }
    },
    [selection, patchKf],
  );

  const applyPreset = useCallback(
    (preset: EasingPreset) => {
      patchSelected({
        interp: preset.interp,
        c1x: preset.quad[0],
        c1y: preset.quad[1],
        c2x: preset.quad[2],
        c2y: preset.quad[3],
      });
    },
    [patchSelected],
  );

  const addKeyframe = useCallback(
    (propId: PropId) => {
      const t = Math.round(playheadSec * FPS) / FPS;
      const v = evalKeyframes(keyframes[propId], t);
      const id = `add-${nextIdRef.current++}`;
      setKeyframes(prev => ({
        ...prev,
        [propId]: [...prev[propId], kf(id, t, v)].sort((a, b) => a.t - b.t),
      }));
      setSelection({prop: propId, kfId: id});
      setExpandedProp(propId);
    },
    [playheadSec, keyframes],
  );

  const deleteSelected = useCallback(() => {
    if (selection == null || selectedKfs.length <= 2) {
      return;
    }
    const neighbor =
      selectedKfs[selectedIndex + 1] ?? selectedKfs[selectedIndex - 1];
    setKeyframes(prev => ({
      ...prev,
      [selection.prop]: prev[selection.prop].filter(
        k => k.id !== selection.kfId,
      ),
    }));
    setSelection(
      neighbor != null ? {prop: selection.prop, kfId: neighbor.id} : null,
    );
  }, [selection, selectedKfs, selectedIndex]);

  /** Ruler scrub: snap to the nearest keyframe (any enabled property)
   * within 0.15s when the magnet is on; otherwise round to whole frames. */
  const scrubTo = useCallback(
    (sec: number) => {
      setIsPlaying(false);
      const frameSnapped = Math.round(clampSec(sec) * FPS) / FPS;
      if (!snapToKeyframes) {
        setPlayheadSec(frameSnapped);
        return;
      }
      let best: number | null = null;
      for (const p of PROPS) {
        if (!enabled[p.id]) {
          continue;
        }
        for (const k of keyframes[p.id]) {
          if (
            Math.abs(k.t - sec) <= 0.15 &&
            (best == null || Math.abs(k.t - sec) < Math.abs(best - sec))
          ) {
            best = k.t;
          }
        }
      }
      setPlayheadSec(best ?? frameSnapped);
    },
    [snapToKeyframes, enabled, keyframes],
  );

  const stepFrames = useCallback((delta: number) => {
    setIsPlaying(false);
    setPlayheadSec(prev => clampSec(prev + delta / FPS));
  }, []);

  // ---- Sticky pill cluster for the expanded lane ----
  // Interp pills + preset chips act on the selected keyframe's outgoing
  // segment; they only apply when the selection lives in the expanded lane.
  const selectionInExpanded =
    selection != null && expandedProp != null && selection.prop === expandedProp;
  const selectedIsLast =
    selectedKf != null && selectedIndex === selectedKfs.length - 1;
  const pillsApply = selectionInExpanded && selectedKf != null && !selectedIsLast;
  const activePresetId = pillsApply
    ? EASING_PRESETS.find(
        p =>
          p.interp === selectedKf.interp &&
          (p.interp === 'linear' ||
            (Math.abs(p.quad[0] - selectedKf.c1x) < 0.01 &&
              Math.abs(p.quad[1] - selectedKf.c1y) < 0.01 &&
              Math.abs(p.quad[2] - selectedKf.c2x) < 0.01 &&
              Math.abs(p.quad[3] - selectedKf.c2y) < 0.01)),
      )?.id
    : undefined;

  const pillCluster = (
    <div style={styles.pillRow}>
      {pillsApply ? (
        <SegmentedControl
          value={selectedKf.interp}
          onChange={v => patchSelected({interp: v as InterpMode})}
          label="Segment interpolation"
          size="sm">
          <SegmentedControlItem value="linear" label="Linear" />
          <SegmentedControlItem value="bezier" label="Bezier" />
          <SegmentedControlItem value="hold" label="Hold" />
        </SegmentedControl>
      ) : (
        <Text type="supporting" color="secondary">
          {selectionInExpanded
            ? 'Last keyframe — value holds to clip end'
            : 'Select a keyframe to shape its segment'}
        </Text>
      )}
      {/* The open inspector already lists the labeled preset chips; the
          in-canvas rail appears only when the inspector is away so this
          sticky-left cluster always fits inside the scrollport (sticky
          rows can never scroll their overflow into view). */}
      {!isCompact && !inspectorVisible && (
        <div style={styles.presetRail}>
          {EASING_PRESETS.map(preset => (
            <PresetChip
              key={preset.id}
              preset={preset}
              isActive={activePresetId === preset.id}
              isDisabled={!pillsApply}
              onApply={applyPreset}
            />
          ))}
        </div>
      )}
    </div>
  );

  // ---- Header ----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Saved" variant="success" />
            <Badge
              label="Keyframes"
              variant="info"
              icon={<Icon icon={SplineIcon} size="sm" color="inherit" />}
            />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {SEQUENCE_NAME} · {FPS} fps
              </Text>
            )}
          </HStack>
        </StackItem>
        <IconButton
          label="Zoom out timeline"
          tooltip="Zoom out"
          icon={<Icon icon={ZoomOutIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={zoomIndex === 0}
          onClick={() => setZoom(ZOOM_ORDER[Math.max(0, zoomIndex - 1)])}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {zoom}%
        </Text>
        <IconButton
          label="Zoom in timeline"
          tooltip="Zoom in"
          icon={<Icon icon={ZoomInIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={zoomIndex === ZOOM_ORDER.length - 1}
          onClick={() =>
            setZoom(ZOOM_ORDER[Math.min(ZOOM_ORDER.length - 1, zoomIndex + 1)])
          }
        />
        <IconButton
          label={isPanelOpen ? 'Hide keyframe inspector' : 'Show keyframe inspector'}
          tooltip={isPanelOpen ? 'Hide inspector' : 'Show inspector'}
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
        <Button label="Apply" variant="primary" size="sm" onClick={() => {}} />
      </HStack>
    </LayoutHeader>
  );

  // ---- Transport toolbar ----
  const transport = (
    <Toolbar
      label="Transport and timeline controls"
      size="sm"
      gap={1}
      dividers={['bottom']}
      startContent={
        <>
          <IconButton
            label="Step back one frame"
            tooltip="Back 1 frame"
            icon={<Icon icon={StepBackIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={tapTargetStyle}
            isDisabled={playheadSec <= 0}
            onClick={() => stepFrames(-1)}
          />
          <Tooltip
            content={
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="inherit">
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
                <Kbd keys="space" />
              </HStack>
            }>
            <IconButton
              label={isPlaying ? 'Pause' : 'Play'}
              icon={
                <Icon
                  icon={isPlaying ? PauseIcon : PlayIcon}
                  size="sm"
                  color="inherit"
                />
              }
              variant="secondary"
              size="sm"
              style={tapTargetStyle}
              onClick={() => setIsPlaying(prev => !prev)}
            />
          </Tooltip>
          <IconButton
            label="Step forward one frame"
            tooltip="Forward 1 frame"
            icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            style={tapTargetStyle}
            isDisabled={playheadSec >= CLIP_DURATION_SEC}
            onClick={() => stepFrames(1)}
          />
        </>
      }
      centerContent={
        <Text type="supporting" hasTabularNumbers style={styles.timecode}>
          {formatTimecode(playheadSec)}{' '}
          <Text type="supporting" color="secondary" style={styles.timecode}>
            / {formatTimecode(CLIP_DURATION_SEC)}
          </Text>
        </Text>
      }
      endContent={
        <>
          <ToggleButton
            label="Snap playhead to keyframes"
            size="sm"
            isIconOnly
            isPressed={snapToKeyframes}
            onPressedChange={setSnapToKeyframes}
            style={tapTargetStyle}
            tooltip={
              snapToKeyframes ? 'Keyframe snapping on' : 'Keyframe snapping off'
            }
            icon={<Icon icon={MagnetIcon} size="sm" color="inherit" />}
          />
          <SegmentedControl
            value={zoom}
            onChange={v => setZoom(v as ZoomPreset)}
            label="Timeline zoom"
            size="sm">
            <SegmentedControlItem value="50" label="50%" />
            <SegmentedControlItem value="100" label="100%" />
            <SegmentedControlItem value="200" label="200%" />
          </SegmentedControl>
        </>
      }
    />
  );

  // ---- Lane stack: fixed header column + horizontally scrolling canvas ----
  const kfAtPlayhead = (propId: PropId) =>
    keyframes[propId].some(k => Math.abs(k.t - playheadSec) < 0.5 / FPS);

  const curveInnerH = CURVE_SVG_H - 2 * CURVE_PAD_Y;
  const axisLabelTop = (prop: PropDef, v: number) =>
    PILL_ROW_H +
    CURVE_PAD_Y +
    (1 - (v - prop.min) / (prop.max - prop.min)) * curveInnerH -
    LANE_H;

  const laneHeaderColumn = (
    <div style={{...styles.laneHeaderCol, width: laneHeaderW}}>
      <div style={styles.laneHeaderTop}>
        <Text type="supporting" color="secondary" weight="semibold">
          {CLIP_TRACK} · Motion
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {pxPerSec} px/s
        </Text>
      </div>
      {PROPS.map(prop => {
        const headerRow = (
          <LaneHeaderRow
            prop={prop}
            isEnabled={enabled[prop.id]}
            isExpanded={expandedProp === prop.id}
            liveValue={liveValues[prop.id]}
            keyframeAtPlayhead={kfAtPlayhead(prop.id)}
            onToggleEnabled={(propId, isPressed) =>
              setEnabled(prev => ({...prev, [propId]: isPressed}))
            }
            onToggleExpanded={toggleExpanded}
            onAddKeyframe={addKeyframe}
          />
        );
        if (expandedProp !== prop.id) {
          return (
            <div key={prop.id} style={styles.laneHeaderCell}>
              {headerRow}
            </div>
          );
        }
        const mid = (prop.min + prop.max) / 2;
        return (
          <div key={prop.id} style={styles.curveHeaderCell}>
            <div style={styles.curveHeaderName}>{headerRow}</div>
            <div style={styles.curveAxis} aria-hidden>
              {[prop.max, mid, prop.min].map(v => (
                <span
                  key={v}
                  style={{
                    ...styles.curveAxisLabel,
                    top: axisLabelTop(prop, v),
                  }}>
                  {formatValue(prop, v)}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const laneCanvas = (
    <div style={styles.laneCanvasScroll}>
      <div style={{...styles.laneCanvas, width: canvasWidth}}>
        <TimeRuler
          pxPerSec={pxPerSec}
          tickInterval={TICK_INTERVAL_SEC[zoom]}
          onScrub={scrubTo}
        />
        <div style={styles.scrubRow}>
          <Slider
            label="Playhead position"
            isLabelHidden
            value={playheadSec}
            min={0}
            max={CLIP_DURATION_SEC}
            step={1 / FPS}
            valueDisplay="none"
            width={canvasWidth}
            onChange={(v: number) => {
              setIsPlaying(false);
              setPlayheadSec(clampSec(v));
            }}
          />
        </div>
        {PROPS.map(prop =>
          expandedProp === prop.id ? (
            <CurveLane
              key={prop.id}
              prop={prop}
              kfs={keyframes[prop.id]}
              pxPerSec={pxPerSec}
              playheadSec={playheadSec}
              playheadValue={liveValues[prop.id]}
              selectedKfId={
                selection?.prop === prop.id ? selection.kfId : null
              }
              pillCluster={pillCluster}
              onSelectKf={selectKf}
              onHandleChange={patchKf}
            />
          ) : (
            <CollapsedLane
              key={prop.id}
              prop={prop}
              kfs={keyframes[prop.id]}
              pxPerSec={pxPerSec}
              isEnabled={enabled[prop.id]}
              selectedKfId={
                selection?.prop === prop.id ? selection.kfId : null
              }
              onSelect={selectKf}
            />
          ),
        )}
        {/* Full-height red playhead line with a top cap marker. */}
        <div
          style={{...styles.playhead, left: playheadSec * pxPerSec - 1}}
          aria-hidden>
          <div style={styles.playheadCap} />
        </div>
      </div>
    </div>
  );

  // ---- Inspector panel (300px, collapsible) ----
  const inspectorPanel =
    inspectorVisible ? (
      <LayoutPanel width={300} padding={0} hasDivider label="Keyframe inspector">
        <InspectorPanel
          prop={selectedProp}
          kfs={selectedKfs}
          selected={selectedKf}
          selectedIndex={selectedIndex}
          onPatch={patchSelected}
          onDelete={deleteSelected}
          onApplyPreset={applyPreset}
        />
      </LayoutPanel>
    ) : undefined;

  // ---- Status footer ----
  const statusFooter = (
    <LayoutFooter hasDivider>
      <div style={styles.statusBar}>
        <Icon icon={DiamondIcon} size="sm" color="secondary" />
        <Text
          type="supporting"
          color="secondary"
          maxLines={1}
          style={styles.mono}>
          {CLIP_TRACK} · {CLIP_NAME} · in {CLIP_SEQ_IN}
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {totalKeyframes} keyframes · {animatedCount}/{PROPS.length} animated
        </Text>
        {!isCompact && (
          <>
            <Text type="supporting" color="secondary">
              Snap: {snapToKeyframes ? 'keyframes' : 'frames'}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {FPS} fps
            </Text>
          </>
        )}
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.editor}>
              {transport}
              <div style={styles.editorBody}>
                {laneHeaderColumn}
                {laneCanvas}
              </div>
            </div>
          </LayoutContent>
        }
        end={inspectorPanel}
        footer={statusFooter}
      />
    </div>
  );
}
