// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file deploy-impact-scrubber.tsx
 * @input Deterministic fixtures only (one 8-hour, 97-sample metric window
 *   for api-gateway — latency p95, error rate, traffic RPS — built at module
 *   scope from pure piecewise ramps and sine wobble keyed to 14 fixed
 *   timeline events: 4 deploys with diff summaries and impact windows,
 *   5 config changes, 5 alerts; no Date.now, no Math.random, no assets)
 * @output Deploy-impact timeline scrubber: a sticky horizontal event
 *   timeline (glyph-coded deploy/config/alert ticks with density-stacked
 *   lanes, a brush track, and a draggable playhead that snaps to events)
 *   over three linked hand-rolled SVG line charts — latency p95, error
 *   rate, traffic — sharing one time axis. Dragging a brush window on the
 *   track zooms all three charts to that range with animated axis
 *   re-ticking; hovering any chart shows a shared crosshair with one synced
 *   tooltip across all series; selecting a deploy shades the region it
 *   influenced on every chart and on the track. A Play / step transport
 *   advances the playhead event-by-event so the cache-rewrite incident
 *   story unfolds deterministically, and the detail panel shows the
 *   selected event's diff summary plus the exact metric values under the
 *   playhead
 * @position Page template; emitted by `astryx template deploy-impact-scrubber`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * "api-gateway · 12:00–20:00 · 97 samples" caption, zoom Badge). Inside
 * LayoutContent a sticky block pins the transport toolbar + event timeline
 * while the three chart panels scroll beneath; LayoutPanel end 340 hosts
 * the playhead readout, the selected-event diff card, and the event log.
 *
 * Responsive contract:
 * - >1024px: header | sticky (transport + timeline) + charts (fill) |
 *   detail panel 340. Charts stretch x-only (preserveAspectRatio="none",
 *   non-scaling strokes); crosshair/playhead/tooltip are HTML overlays at
 *   percent offsets so nothing distorts.
 * - <=1024px: the end panel leaves the frame; the readout, event card, and
 *   event log flow below the charts in the same scroll.
 * - <=640px: charts stack under the sticky timeline; the playhead gains a
 *   fat 36px touch handle (20px otherwise) and transport IconButtons grow
 *   to 40px hit targets; the toolbar hint and header caption drop. The
 *   brush gesture keeps button equivalents (Focus ±30 m, Zoom to impact,
 *   Reset zoom) and the playhead keeps arrow-key stepping, so nothing is
 *   drag-only or hover-only: tapping a chart commits the same playhead
 *   scrub, and the tooltip's values also live in the readout panel.
 *
 * Container policy (explorable-analytics archetype): frame-first rows and
 * panels; the three chart surfaces are plain bordered panels (no Card
 * chrome) because they are one linked instrument, not separable widgets.
 * All chart geometry is fixture math in a fixed 720-wide viewBox — no
 * chart library. Playback is a setInterval advancing the playhead to the
 * next fixture event only; every rendered value is a pure function of
 * (playhead, range, hover, selection) over the fixture arrays.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token or a
 * color-mix() over tokens — series strokes, impact shading, brush fills,
 * and glyph tints resolve correctly in both light and dark schemes.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
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
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CrosshairIcon,
  GaugeIcon,
  PauseIcon,
  PlayIcon,
  RocketIcon,
  SlidersHorizontalIcon,
  StepBackIcon,
  StepForwardIcon,
  TriangleAlertIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';

// ============= GEOMETRY & CADENCE =============
// One shared time axis: 97 samples, 5 minutes apart, 12:00 → 20:00. The
// charts draw into a fixed 720×132 viewBox stretched x-only; overlays
// (crosshair, playhead, tooltip, shading) are HTML at percent offsets so
// they track the same scale without SVG text distortion.

const SAMPLE_COUNT = 97;
const SAMPLE_MAX = SAMPLE_COUNT - 1;
const STEP_MINUTES = 5;
const START_MINUTES = 12 * 60;
const PLOT_W = 720;
const PLOT_H = 132;
const PAD_Y = 10;
const MIN_SPAN = 4; // never zoom tighter than 20 minutes
const SNAP_RADIUS = 2; // playhead snaps to events within 2 samples
const PLAY_INTERVAL_MS = 1400;
const FULL_RANGE = {start: 0, end: SAMPLE_MAX} as const;

// ============= KEYFRAMES =============
// Axis ticks slide in when the zoom range changes; the playhead glides
// between event stops during playback. prefers-reduced-motion disables
// both — Step and the zoom buttons are the non-animated equivalents.

const GLOBAL_CSS = `
@keyframes dis-tick-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}
.dis-tick-in {
  animation: dis-tick-in 320ms ease-out;
}
.dis-glide {
  transition: left 260ms ease;
}
@media (prefers-reduced-motion: reduce) {
  .dis-tick-in { animation: none; }
  .dis-glide { transition: none; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {height: '100%', minHeight: 0},
  scroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  // Transport + timeline pin while the charts scroll beneath (the mobile
  // "sticky timeline" contract; harmless and useful on desktop too).
  sticky: {
    position: 'sticky',
    top: 0,
    zIndex: 4,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  transportRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  transportTap: {width: 40, height: 40},
  transportButton: {minHeight: 40},
  strip: {
    position: 'relative',
    padding: '0 var(--spacing-3) var(--spacing-2)',
  },
  lanes: {position: 'relative'},
  glyphButton: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: 'var(--radius-container)',
    borderWidth: 1,
    borderStyle: 'solid',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    zIndex: 1,
  },
  glyphSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
    zIndex: 2,
  },
  // The brush surface: pointer drags here sweep a zoom window; a plain
  // press scrubs the playhead to the snapped sample.
  track: {
    position: 'relative',
    height: 44,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    touchAction: 'none',
    cursor: 'crosshair',
  },
  trackTick: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    transform: 'translateX(-50%)',
    pointerEvents: 'none',
  },
  zoomWindow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)',
    borderInline:
      '1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)',
    pointerEvents: 'none',
  },
  brushDraft: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 24%, transparent)',
    borderInline: '1px dashed var(--color-accent)',
    pointerEvents: 'none',
  },
  trackImpact: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor:
      'color-mix(in srgb, var(--color-icon-orange) 16%, transparent)',
    pointerEvents: 'none',
  },
  timeRow: {position: 'relative', height: 16, marginTop: 4},
  timeLabel: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    whiteSpace: 'nowrap',
  },
  // The playhead: a full-height slider button spanning lanes + track. The
  // visible line is 2px; the hit area is 20px (36px on touch widths).
  handle: {
    position: 'absolute',
    top: 0,
    padding: 0,
    border: 'none',
    backgroundColor: 'transparent',
    transform: 'translateX(-50%)',
    cursor: 'ew-resize',
    touchAction: 'none',
    zIndex: 3,
  },
  handleLine: {
    position: 'absolute',
    left: '50%',
    top: 6,
    bottom: 0,
    width: 2,
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--color-accent)',
    pointerEvents: 'none',
  },
  handleGrip: {
    position: 'absolute',
    left: '50%',
    top: 0,
    transform: 'translateX(-50%)',
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    border: '2px solid var(--color-background-body)',
    pointerEvents: 'none',
  },
  chartsWrap: {padding: 'var(--spacing-3)'},
  chartPanel: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)',
  },
  chartTitleRow: {marginBottom: 'var(--spacing-1)'},
  chartBody: {
    position: 'relative',
    // Vertical page scroll stays available over the charts; horizontal
    // pointer math only ever commits scrubs.
    touchAction: 'pan-y',
    cursor: 'crosshair',
  },
  chartSvg: {display: 'block', width: '100%', height: PLOT_H},
  yTickLabel: {
    position: 'absolute',
    left: 4,
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 78%, transparent)',
    padding: '0 3px',
    borderRadius: 4,
  },
  xLabelRow: {position: 'relative', height: 16, marginTop: 2},
  crosshairLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'var(--color-border-emphasized)',
    pointerEvents: 'none',
  },
  playheadLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'var(--color-accent)',
    pointerEvents: 'none',
  },
  chartImpact: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor:
      'color-mix(in srgb, var(--color-icon-orange) 12%, transparent)',
    borderInline:
      '1px solid color-mix(in srgb, var(--color-icon-orange) 40%, transparent)',
    pointerEvents: 'none',
  },
  valueDot: {
    position: 'absolute',
    width: 9,
    height: 9,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    border: '2px solid var(--color-background-card)',
    pointerEvents: 'none',
  },
  tooltip: {
    position: 'absolute',
    top: 6,
    zIndex: 3,
    pointerEvents: 'none',
    backgroundColor: 'var(--color-background-body)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    boxShadow:
      '0 2px 8px color-mix(in srgb, var(--color-text-primary) 18%, transparent)',
    whiteSpace: 'nowrap',
  },
  swatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  readoutRow: {minHeight: 24},
  panelScroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  panelBody: {padding: 'var(--spacing-3)'},
  inlinePanel: {
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  eventLogScroll: {maxHeight: 320, overflowY: 'auto'},
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
// Deterministic fixtures. The metric series are built once at module scope
// from pure piecewise functions of the sample index, shaped around the
// event story below — no clocks, no randomness, no network assets.

type EventKind = 'deploy' | 'config' | 'alert';

interface DiffSummary {
  version: string;
  files: number;
  additions: number;
  deletions: number;
  notes: string[];
}

interface TimelineEvent {
  id: string;
  kind: EventKind;
  /** Sample index on the shared time axis. */
  index: number;
  title: string;
  /** One-line detail: config delta, alert condition, or release intent. */
  summary: string;
  /** Deploys only: last sample the release visibly influenced. */
  impactUntil?: number;
  /** Deploys only: the diff summary shown in the detail panel. */
  diff?: DiffSummary;
}

const KIND_META: Record<
  EventKind,
  {
    label: string;
    icon: typeof RocketIcon;
    color: string;
    badge: 'blue' | 'orange' | 'error';
  }
> = {
  deploy: {
    label: 'Deploy',
    icon: RocketIcon,
    color: 'var(--color-accent)',
    badge: 'blue',
  },
  config: {
    label: 'Config',
    icon: SlidersHorizontalIcon,
    color: 'var(--color-icon-orange)',
    badge: 'orange',
  },
  alert: {
    label: 'Alert',
    icon: TriangleAlertIcon,
    color: 'var(--color-icon-red)',
    badge: 'error',
  },
};

// The incident story: 4.18.1 rewrites the cache layer at 14:10, latency
// and errors climb, a flag flip partially mitigates at 15:00, and the
// 15:40 revert recovers the fleet. Everything else is normal ship traffic.
const EVENTS: TimelineEvent[] = [
  {
    id: 'e01',
    kind: 'config',
    index: 2,
    title: 'Raise DB pool to 64 connections',
    summary: 'connection_pool.max: 32 → 64 on the primary pool',
  },
  {
    id: 'e02',
    kind: 'deploy',
    index: 8,
    title: 'api@4.18.0 — checkout retry budget',
    summary: 'Adds a per-request retry budget to checkout calls.',
    impactUntil: 20,
    diff: {
      version: '4.18.0',
      files: 12,
      additions: 284,
      deletions: 97,
      notes: [
        'Retry budget caps checkout fan-out at 2 attempts.',
        'Shaves ~18 ms off p95 by dropping a redundant auth round-trip.',
      ],
    },
  },
  {
    id: 'e03',
    kind: 'alert',
    index: 13,
    title: 'Latency p95 above 300 ms for 5 m',
    summary: 'Transient GC pause on two pods; auto-resolved at 13:15.',
  },
  {
    id: 'e04',
    kind: 'config',
    index: 18,
    title: 'Enable brotli on edge responses',
    summary: 'edge.compression: gzip → brotli for text content types',
  },
  {
    id: 'e05',
    kind: 'deploy',
    index: 26,
    title: 'api@4.18.1 — cache layer rewrite',
    summary: 'Replaces the read-through cache with the new async path.',
    impactUntil: 44,
    diff: {
      version: '4.18.1',
      files: 31,
      additions: 1240,
      deletions: 866,
      notes: [
        'New async read path misses the request-coalescing guard.',
        'Cache stampede on hot keys drives p95 from ~240 ms to ~500 ms.',
        'Error rate follows as origin timeouts breach 2%.',
      ],
    },
  },
  {
    id: 'e06',
    kind: 'alert',
    index: 31,
    title: 'Error rate above 2% for 10 m',
    summary: 'Origin timeouts on cache misses; paged the on-call.',
  },
  {
    id: 'e07',
    kind: 'alert',
    index: 33,
    title: 'Latency p95 above 450 ms',
    summary: 'Hot-key stampede confirmed; rollback prep started.',
  },
  {
    id: 'e08',
    kind: 'config',
    index: 36,
    title: 'Flag off: cache_rewrite_read_path',
    summary: 'Kill switch halves the blast while the revert builds.',
  },
  {
    id: 'e09',
    kind: 'deploy',
    index: 44,
    title: 'api@4.18.2 — revert cache rewrite',
    summary: 'Clean revert of 4.18.1; old read-through path restored.',
    impactUntil: 58,
    diff: {
      version: '4.18.2',
      files: 31,
      additions: 866,
      deletions: 1240,
      notes: [
        'Mechanical revert; no manual conflicts.',
        'p95 and error rate return to baseline within ~30 minutes.',
      ],
    },
  },
  {
    id: 'e10',
    kind: 'alert',
    index: 47,
    title: 'Error rate recovered below 1%',
    summary: 'Recovery notice; incident review scheduled.',
  },
  {
    id: 'e11',
    kind: 'config',
    index: 54,
    title: 'Scale out: +4 api pods',
    summary: 'replicas: 12 → 16 ahead of the evening peak',
  },
  {
    id: 'e12',
    kind: 'deploy',
    index: 64,
    title: 'api@4.19.0 — idempotent payments',
    summary: 'Adds idempotency keys to the payment capture path.',
    impactUntil: 78,
    diff: {
      version: '4.19.0',
      files: 18,
      additions: 542,
      deletions: 210,
      notes: [
        'Duplicate-capture retries drop to zero.',
        'Mild p95 win from skipping the dedupe table scan.',
      ],
    },
  },
  {
    id: 'e13',
    kind: 'alert',
    index: 67,
    title: 'Latency variance elevated (warn)',
    summary: 'Warm-up jitter on the new pods; below paging threshold.',
  },
  {
    id: 'e14',
    kind: 'config',
    index: 80,
    title: 'Canary ramp 50% → 100%',
    summary: 'traffic.canary_fraction: 0.5 → 1.0 for api@4.19.0',
  },
];

// ----- series builders (pure functions of the sample index) -----

function rampBetween(i: number, from: number, to: number): number {
  if (i <= from) {
    return 0;
  }
  if (i >= to) {
    return 1;
  }
  return (i - from) / (to - from);
}

function blipAt(i: number, at: number, width: number): number {
  return Math.max(0, 1 - Math.abs(i - at) / width);
}

const LATENCY_MS: number[] = [];
const ERROR_PCT: number[] = [];
const TRAFFIC_RPS: number[] = [];

for (let i = 0; i < SAMPLE_COUNT; i++) {
  // 4.18.1 incident envelope: climbs 26→33, flag-flip mitigation trims it
  // 36→39, the 15:40 revert drains it 44→50.
  const incident =
    rampBetween(i, 26, 33) *
    (1 - 0.35 * rampBetween(i, 36, 39)) *
    (1 - rampBetween(i, 44, 50));
  const latency =
    238 +
    24 * Math.sin(i / 7) +
    9 * Math.sin(i * 1.7) +
    85 * blipAt(i, 13, 2.5) - // 13:05 GC blip
    18 * rampBetween(i, 8, 12) + // 4.18.0 retry-budget win
    262 * incident +
    34 * blipAt(i, 67, 3) - // pod warm-up jitter
    20 * rampBetween(i, 64, 70); // 4.19.0 dedupe-scan win
  LATENCY_MS.push(Math.max(120, Math.round(latency)));

  const errIncident =
    rampBetween(i, 26, 32) *
    (1 - 0.4 * rampBetween(i, 36, 39)) *
    (1 - rampBetween(i, 44, 48));
  const error =
    0.55 +
    0.16 * Math.sin(i / 5 + 1) +
    0.07 * Math.sin(i * 2.3) +
    0.5 * blipAt(i, 13, 2) +
    2.9 * errIncident;
  ERROR_PCT.push(Math.max(0.05, Math.round(error * 100) / 100));

  // Traffic sheds ~13% while errors are user-visible, then the scale-out
  // and the canary ramp lift the evening curve.
  const shed =
    1 - 0.13 * rampBetween(i, 28, 33) * (1 - rampBetween(i, 44, 49));
  const traffic =
    (3950 +
      1350 * Math.sin((i - 14) / 26) +
      130 * Math.sin(i / 3.1) +
      260 * rampBetween(i, 54, 58) +
      420 * rampBetween(i, 80, 86)) *
    shed;
  TRAFFIC_RPS.push(Math.round(traffic));
}

interface SeriesDef {
  id: string;
  label: string;
  unit: string;
  color: string;
  values: number[];
  format: (value: number) => string;
}

function formatK(value: number): string {
  return value >= 1000
    ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : String(value);
}

const SERIES: SeriesDef[] = [
  {
    id: 'latency',
    label: 'Latency p95',
    unit: 'ms',
    color: 'var(--color-icon-purple)',
    values: LATENCY_MS,
    format: value => `${Math.round(value)} ms`,
  },
  {
    id: 'errors',
    label: 'Error rate',
    unit: '%',
    color: 'var(--color-icon-red)',
    values: ERROR_PCT,
    format: value => `${value.toFixed(2)}%`,
  },
  {
    id: 'traffic',
    label: 'Traffic',
    unit: 'RPS',
    color: 'var(--color-icon-blue)',
    values: TRAFFIC_RPS,
    format: value => `${formatK(value)} RPS`,
  },
];

// ============= SCALE HELPERS =============

interface Range {
  start: number;
  end: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function timeLabel(index: number): string {
  const minutes = START_MINUTES + index * STEP_MINUTES;
  const hh = Math.floor(minutes / 60) % 24;
  const mm = minutes % 60;
  return `${hh}:${String(mm).padStart(2, '0')}`;
}

function pctOf(index: number, range: Range): number {
  return ((index - range.start) / (range.end - range.start)) * 100;
}

/** Nearest fixture event within SNAP_RADIUS samples, else the raw sample. */
function snapToEvent(index: number, events: TimelineEvent[]): number {
  let best = index;
  let bestDist = SNAP_RADIUS + 1;
  for (const event of events) {
    const dist = Math.abs(event.index - index);
    if (dist < bestDist) {
      bestDist = dist;
      best = event.index;
    }
  }
  return bestDist <= SNAP_RADIUS ? best : index;
}

function niceStep(rough: number): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / magnitude;
  const factor = norm > 5 ? 10 : norm > 2.5 ? 5 : norm > 2 ? 2.5 : norm > 1 ? 2 : 1;
  return factor * magnitude;
}

/** Y extent + ~4 nice ticks over the visible slice — this is what re-ticks
 * (with a slide-in animation) every time the brush changes the range. */
function yScaleFor(values: number[], range: Range): {
  min: number;
  max: number;
  ticks: number[];
} {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = range.start; i <= range.end; i++) {
    lo = Math.min(lo, values[i]);
    hi = Math.max(hi, values[i]);
  }
  const pad = (hi - lo) * 0.12 || Math.abs(hi) * 0.1 || 1;
  const min = Math.max(0, lo - pad);
  const max = hi + pad;
  const step = niceStep((max - min) / 3 || 1);
  const ticks: number[] = [];
  for (let v = Math.ceil(min / step) * step; v <= max + 1e-9; v += step) {
    ticks.push(Math.round(v * 100) / 100);
  }
  return {min, max, ticks};
}

/** X tick sample indices at a nice minute step for the visible span. */
function xTicksFor(range: Range): number[] {
  const span = range.end - range.start;
  const step = [3, 6, 12, 24].find(s => span / s <= 8) ?? 24;
  const ticks: number[] = [];
  for (
    let i = Math.ceil(range.start / step) * step;
    i <= range.end;
    i += step
  ) {
    ticks.push(i);
  }
  return ticks;
}

function yPixelFor(value: number, min: number, max: number): number {
  const t = (value - min) / (max - min || 1);
  return PAD_Y + (1 - t) * (PLOT_H - 2 * PAD_Y);
}

function topPctFor(value: number, min: number, max: number): number {
  return (yPixelFor(value, min, max) / PLOT_H) * 100;
}

function linePathFor(
  values: number[],
  range: Range,
  min: number,
  max: number,
): string {
  const span = range.end - range.start || 1;
  const parts: string[] = [];
  for (let i = range.start; i <= range.end; i++) {
    const x = (((i - range.start) / span) * PLOT_W).toFixed(2);
    const y = yPixelFor(values[i], min, max).toFixed(2);
    parts.push(`${parts.length === 0 ? 'M' : 'L'} ${x} ${y}`);
  }
  return parts.join(' ');
}

function areaPathFor(
  values: number[],
  range: Range,
  min: number,
  max: number,
): string {
  return `${linePathFor(values, range, min, max)} L ${PLOT_W} ${PLOT_H} L 0 ${PLOT_H} Z`;
}

/** Greedy lane assignment: events closer than 4% of the strip stack up. */
function assignLanes(events: TimelineEvent[]): {
  laneOf: Map<string, number>;
  laneCount: number;
} {
  const laneOf = new Map<string, number>();
  const lastPct: number[] = [];
  for (const event of events) {
    const pct = pctOf(event.index, FULL_RANGE);
    let lane = lastPct.findIndex(prev => pct - prev >= 4);
    if (lane === -1) {
      lane = Math.min(lastPct.length, 2);
    }
    lastPct[lane] = pct;
    laneOf.set(event.id, lane);
  }
  return {laneOf, laneCount: Math.max(1, lastPct.length)};
}

// ============= TIMELINE STRIP =============

/**
 * The sticky overview: density-stacked event glyph buttons over a brush
 * track with the zoom window, the selected deploy's impact shading, and
 * the draggable playhead (a real slider: arrow keys step samples,
 * shift+arrows jump events, Home/End hit the edges). The strip always
 * shows the full 8-hour range — the brush window is the zoom state.
 */
function TimelineStrip({
  events,
  playhead,
  selectedEventId,
  range,
  impact,
  isCompact,
  prefersReducedMotion,
  onSelectEvent,
  onScrub,
  onScrubbingChange,
  onStepEvent,
  onBrush,
}: {
  events: TimelineEvent[];
  playhead: number;
  selectedEventId: string | null;
  range: Range;
  impact: Range | null;
  isCompact: boolean;
  prefersReducedMotion: boolean;
  onSelectEvent: (id: string) => void;
  onScrub: (raw: number, snap: boolean) => void;
  onScrubbingChange: (isScrubbing: boolean) => void;
  onStepEvent: (direction: 1 | -1) => void;
  onBrush: (a: number, b: number) => void;
}) {
  const stripRef = useRef<HTMLDivElement | null>(null);
  const brushRef = useRef<{pointerId: number; anchor: number} | null>(null);
  const dragRef = useRef<{pointerId: number} | null>(null);
  const [draft, setDraft] = useState<Range | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const {laneOf, laneCount} = useMemo(() => assignLanes(events), [events]);
  const laneH = isCompact ? 44 : 30;
  const glyphSize = isCompact ? 40 : 28;
  const handleW = isCompact ? 36 : 20;
  const gripSize = isCompact ? 22 : 14;
  const isZoomed = range.start !== 0 || range.end !== SAMPLE_MAX;

  const indexFromClientX = (clientX: number): number => {
    const strip = stripRef.current;
    if (strip == null) {
      return playhead;
    }
    const rect = strip.getBoundingClientRect();
    const fraction = clamp((clientX - rect.left) / rect.width, 0, 1);
    return fraction * SAMPLE_MAX;
  };

  // ----- brush gesture (pointer capture on the track) -----

  const onTrackPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    const anchor = indexFromClientX(event.clientX);
    brushRef.current = {pointerId: event.pointerId, anchor};
    setDraft({start: anchor, end: anchor});
  };

  const onTrackPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const brush = brushRef.current;
    if (brush == null || brush.pointerId !== event.pointerId) {
      return;
    }
    const here = indexFromClientX(event.clientX);
    setDraft({
      start: Math.min(brush.anchor, here),
      end: Math.max(brush.anchor, here),
    });
  };

  const onTrackPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const brush = brushRef.current;
    if (brush == null || brush.pointerId !== event.pointerId) {
      return;
    }
    brushRef.current = null;
    const here = indexFromClientX(event.clientX);
    setDraft(null);
    if (Math.abs(here - brush.anchor) >= 2) {
      // Wide enough sweep: commit the zoom window.
      onBrush(brush.anchor, here);
    } else {
      // A plain press scrubs the playhead (with event snapping).
      onScrub(here, true);
    }
  };

  // ----- playhead drag (pointer capture on the handle) -----

  const onHandlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {pointerId: event.pointerId};
    setIsDragging(true);
    onScrubbingChange(true);
  };

  const onHandlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
  ) => {
    const drag = dragRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    onScrub(indexFromClientX(event.clientX), true);
  };

  const onHandlePointerUp = () => {
    dragRef.current = null;
    setIsDragging(false);
    onScrubbingChange(false);
  };

  // Keyboard path commits the identical playhead state as the drag.
  const onHandleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowLeft' ? -1 : 1;
      if (event.shiftKey) {
        onStepEvent(direction);
      } else {
        onScrub(playhead + direction, false);
      }
    } else if (event.key === 'Home') {
      event.preventDefault();
      onScrub(0, false);
    } else if (event.key === 'End') {
      event.preventDefault();
      onScrub(SAMPLE_MAX, false);
    }
  };

  const eventAtPlayhead = events.find(entry => entry.index === playhead);
  const glideClass =
    !prefersReducedMotion && !isDragging ? 'dis-glide' : undefined;

  return (
    <div style={styles.strip} ref={stripRef}>
      {/* Event lanes: glyph-coded, density-stacked buttons. */}
      <div style={{...styles.lanes, height: laneCount * laneH + 4}}>
        {events.map(entry => {
          const meta = KIND_META[entry.kind];
          const isSelected = entry.id === selectedEventId;
          return (
            <button
              key={entry.id}
              type="button"
              aria-pressed={isSelected}
              aria-label={`${meta.label} at ${timeLabel(entry.index)}: ${entry.title}`}
              title={`${timeLabel(entry.index)} · ${entry.title}`}
              style={{
                ...styles.glyphButton,
                left: `${pctOf(entry.index, FULL_RANGE)}%`,
                top: (laneOf.get(entry.id) ?? 0) * laneH + 4,
                width: glyphSize,
                height: glyphSize - 4,
                borderColor: isSelected ? meta.color : 'var(--color-border)',
                color: meta.color,
                ...(isSelected ? styles.glyphSelected : undefined),
              }}
              onClick={() => onSelectEvent(entry.id)}>
              <Icon icon={meta.icon} size="sm" color="inherit" />
            </button>
          );
        })}
      </div>

      {/* Brush track: zoom window, impact shading, event tick lines. */}
      <div
        style={styles.track}
        role="application"
        aria-label="Timeline brush. Drag to zoom all charts to a range; press to move the playhead."
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={onTrackPointerUp}
        onPointerCancel={() => {
          brushRef.current = null;
          setDraft(null);
        }}>
        {impact != null && (
          <div
            style={{
              ...styles.trackImpact,
              left: `${pctOf(impact.start, FULL_RANGE)}%`,
              width: `${pctOf(impact.end, FULL_RANGE) - pctOf(impact.start, FULL_RANGE)}%`,
            }}
          />
        )}
        {isZoomed && draft == null && (
          <div
            style={{
              ...styles.zoomWindow,
              left: `${pctOf(range.start, FULL_RANGE)}%`,
              width: `${pctOf(range.end, FULL_RANGE) - pctOf(range.start, FULL_RANGE)}%`,
            }}
          />
        )}
        {draft != null && (
          <div
            style={{
              ...styles.brushDraft,
              left: `${pctOf(draft.start, FULL_RANGE)}%`,
              width: `${pctOf(draft.end, FULL_RANGE) - pctOf(draft.start, FULL_RANGE)}%`,
            }}
          />
        )}
        {events.map(entry => (
          <div
            key={entry.id}
            style={{
              ...styles.trackTick,
              left: `${pctOf(entry.index, FULL_RANGE)}%`,
              backgroundColor: `color-mix(in srgb, ${KIND_META[entry.kind].color} 65%, transparent)`,
            }}
          />
        ))}
      </div>

      {/* Full-range time labels. */}
      <div style={styles.timeRow} aria-hidden>
        {[0, 12, 24, 36, 48, 60, 72, 84, 96].map(index => (
          <span
            key={index}
            style={{...styles.timeLabel, left: `${pctOf(index, FULL_RANGE)}%`}}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {timeLabel(index)}
            </Text>
          </span>
        ))}
      </div>

      {/* The playhead slider spanning lanes + track. */}
      <button
        type="button"
        role="slider"
        className={glideClass}
        aria-label="Playhead"
        aria-valuemin={0}
        aria-valuemax={SAMPLE_MAX}
        aria-valuenow={playhead}
        aria-valuetext={
          eventAtPlayhead != null
            ? `${timeLabel(playhead)}, on event: ${eventAtPlayhead.title}`
            : timeLabel(playhead)
        }
        style={{
          ...styles.handle,
          left: `${pctOf(playhead, FULL_RANGE)}%`,
          width: handleW,
          bottom: 18,
        }}
        onPointerDown={onHandlePointerDown}
        onPointerMove={onHandlePointerMove}
        onPointerUp={onHandlePointerUp}
        onPointerCancel={onHandlePointerUp}
        onKeyDown={onHandleKeyDown}>
        <span style={styles.handleLine} aria-hidden />
        <span
          style={{...styles.handleGrip, width: gripSize, height: gripSize}}
          aria-hidden
        />
      </button>
    </div>
  );
}

// ============= METRIC CHART =============

/**
 * One linked chart: a fixed-viewBox SVG (area + line, non-scaling strokes)
 * stretched x-only, with HTML overlays for the y tick labels, the shared
 * crosshair, the playhead line + value dot, the selected deploy's impact
 * shading, and — on the hovered chart only — the synced all-series
 * tooltip. Pointer taps commit the same playhead scrub as the timeline.
 */
function MetricChart({
  series,
  range,
  playhead,
  hoverIndex,
  isHoverSource,
  impact,
  showXLabels,
  isScrubbing,
  prefersReducedMotion,
  tooltipRows,
  onHover,
  onLeave,
  onScrub,
}: {
  series: SeriesDef;
  range: Range;
  playhead: number;
  hoverIndex: number | null;
  isHoverSource: boolean;
  impact: Range | null;
  showXLabels: boolean;
  isScrubbing: boolean;
  prefersReducedMotion: boolean;
  tooltipRows: Array<{label: string; color: string; value: string}>;
  onHover: (index: number) => void;
  onLeave: () => void;
  onScrub: (index: number) => void;
}) {
  const {min, max, ticks} = useMemo(
    () => yScaleFor(series.values, range),
    [series, range],
  );
  const xTicks = useMemo(() => xTicksFor(range), [range]);
  const rangeKey = `${range.start}-${range.end}`;
  const tickClass = prefersReducedMotion ? undefined : 'dis-tick-in';

  const indexFromPointer = (
    event: React.PointerEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
  ): number => {
    const rect = event.currentTarget.getBoundingClientRect();
    const fraction = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    return Math.round(range.start + fraction * (range.end - range.start));
  };

  const playheadVisible = playhead >= range.start && playhead <= range.end;
  const hoverVisible =
    hoverIndex != null && hoverIndex >= range.start && hoverIndex <= range.end;
  const impactVisible =
    impact != null && impact.end > range.start && impact.start < range.end;
  const playheadValue = series.values[playhead];
  const glideClass =
    !prefersReducedMotion && !isScrubbing ? 'dis-glide' : undefined;

  return (
    <div style={styles.chartPanel}>
      <HStack gap={2} vAlign="center" style={styles.chartTitleRow}>
        <span style={{...styles.swatch, backgroundColor: series.color}} aria-hidden />
        <Text type="label" weight="semibold">
          {series.label}
        </Text>
        <Text type="supporting" color="secondary">
          {series.unit}
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {series.format(playheadValue)} at {timeLabel(playhead)}
        </Text>
      </HStack>

      <div
        style={styles.chartBody}
        onPointerMove={event => onHover(indexFromPointer(event))}
        onPointerLeave={onLeave}
        onClick={event => onScrub(indexFromPointer(event))}>
        <svg
          viewBox={`0 0 ${PLOT_W} ${PLOT_H}`}
          preserveAspectRatio="none"
          style={styles.chartSvg}
          aria-label={`${series.label} from ${timeLabel(range.start)} to ${timeLabel(range.end)}`}
          role="img"
          focusable={false}>
          {/* Gridlines re-tick (and re-animate) when the brush changes. */}
          <g key={rangeKey} className={tickClass}>
            {ticks.map(tick => (
              <line
                key={tick}
                x1={0}
                x2={PLOT_W}
                y1={yPixelFor(tick, min, max)}
                y2={yPixelFor(tick, min, max)}
                stroke="var(--color-border)"
                strokeWidth={1}
                vectorEffect="non-scaling-stroke"
                opacity={0.6}
              />
            ))}
          </g>
          <path
            d={areaPathFor(series.values, range, min, max)}
            fill={`color-mix(in srgb, ${series.color} 10%, transparent)`}
            stroke="none"
          />
          <path
            d={linePathFor(series.values, range, min, max)}
            fill="none"
            stroke={series.color}
            strokeWidth={2}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Y tick labels (HTML so x-stretch never distorts text). */}
        {ticks.map(tick => (
          <span
            key={`${rangeKey}-${tick}`}
            className={tickClass}
            style={{
              ...styles.yTickLabel,
              top: `${topPctFor(tick, min, max)}%`,
            }}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {series.id === 'traffic' ? formatK(tick) : tick}
            </Text>
          </span>
        ))}

        {impactVisible && impact != null && (
          <div
            style={{
              ...styles.chartImpact,
              left: `${clamp(pctOf(impact.start, range), 0, 100)}%`,
              width: `${
                clamp(pctOf(impact.end, range), 0, 100) -
                clamp(pctOf(impact.start, range), 0, 100)
              }%`,
            }}
          />
        )}

        {hoverVisible && hoverIndex != null && (
          <>
            <div
              style={{
                ...styles.crosshairLine,
                left: `${pctOf(hoverIndex, range)}%`,
              }}
            />
            <div
              style={{
                ...styles.valueDot,
                left: `${pctOf(hoverIndex, range)}%`,
                top: `${topPctFor(series.values[hoverIndex], min, max)}%`,
                backgroundColor: series.color,
              }}
            />
          </>
        )}

        {playheadVisible && (
          <>
            <div
              className={glideClass}
              style={{
                ...styles.playheadLine,
                left: `${pctOf(playhead, range)}%`,
              }}
            />
            <div
              className={glideClass}
              style={{
                ...styles.valueDot,
                left: `${pctOf(playhead, range)}%`,
                top: `${topPctFor(playheadValue, min, max)}%`,
                backgroundColor: 'var(--color-accent)',
              }}
            />
          </>
        )}

        {/* Synced tooltip: rendered on the hovered chart, values for all
            three series so the crosshair reads across the whole stack. */}
        {isHoverSource && hoverVisible && hoverIndex != null && (
          <div
            style={{
              ...styles.tooltip,
              left: `${pctOf(hoverIndex, range)}%`,
              transform:
                pctOf(hoverIndex, range) > 62
                  ? 'translateX(calc(-100% - 8px))'
                  : 'translateX(8px)',
            }}>
            <VStack gap={1}>
              <Text type="supporting" weight="semibold" hasTabularNumbers>
                {timeLabel(hoverIndex)}
              </Text>
              {tooltipRows.map(row => (
                <HStack gap={1} vAlign="center" key={row.label}>
                  <span
                    style={{...styles.swatch, backgroundColor: row.color}}
                    aria-hidden
                  />
                  <Text type="supporting" color="secondary">
                    {row.label}
                  </Text>
                  <Text type="supporting" hasTabularNumbers>
                    {row.value}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </div>
        )}
      </div>

      {/* Shared x axis labels live under the bottom chart only. */}
      {showXLabels && (
        <div style={styles.xLabelRow} aria-hidden>
          {xTicks.map(index => (
            <span
              key={`${rangeKey}-${index}`}
              className={tickClass}
              style={{...styles.timeLabel, left: `${pctOf(index, range)}%`}}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {timeLabel(index)}
              </Text>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= DETAIL PANEL =============

/**
 * Playhead readout (exact values under the cursor), the selected event's
 * detail — deploys carry the diff summary, impact window, and a
 * "Zoom to impact" button that commits the same range state as the brush —
 * and the event log, which scrubs and selects with the identical commit
 * logic as the timeline glyphs.
 */
function DetailPanelContent({
  playhead,
  selectedEvent,
  events,
  selectedEventId,
  onSelectEvent,
  onZoomToImpact,
  onClearSelection,
}: {
  playhead: number;
  selectedEvent: TimelineEvent | null;
  events: TimelineEvent[];
  selectedEventId: string | null;
  onSelectEvent: (id: string) => void;
  onZoomToImpact: (event: TimelineEvent) => void;
  onClearSelection: () => void;
}) {
  return (
    <VStack gap={4} style={styles.panelBody}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>At the playhead</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {timeLabel(playhead)}
          </Text>
        </HStack>
        {SERIES.map(series => (
          <HStack gap={2} vAlign="center" key={series.id} style={styles.readoutRow}>
            <span
              style={{...styles.swatch, backgroundColor: series.color}}
              aria-hidden
            />
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                {series.label}
              </Text>
            </StackItem>
            <Text type="body" hasTabularNumbers>
              {series.format(series.values[playhead])}
            </Text>
          </HStack>
        ))}
      </VStack>

      <Divider />

      {selectedEvent == null ? (
        <EmptyState
          title="No event selected"
          description="Tap a glyph on the timeline, or press Play to walk the deploy story event by event."
          icon={<Icon icon={CrosshairIcon} size="lg" />}
          isCompact
        />
      ) : (
        <VStack gap={3}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Badge
                variant={KIND_META[selectedEvent.kind].badge}
                label={KIND_META[selectedEvent.kind].label}
              />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {timeLabel(selectedEvent.index)}
              </Text>
              {selectedEvent.diff != null && (
                <Badge variant="neutral" label={selectedEvent.diff.version} />
              )}
            </HStack>
            <Heading level={3}>{selectedEvent.title}</Heading>
            <Text type="supporting" color="secondary">
              {selectedEvent.summary}
            </Text>
          </VStack>

          {selectedEvent.diff != null && (
            <MetadataList columns={2} label={{position: 'top'}}>
              <MetadataListItem label="Files changed">
                <Text hasTabularNumbers>{selectedEvent.diff.files}</Text>
              </MetadataListItem>
              <MetadataListItem label="Lines">
                <Text hasTabularNumbers>
                  +{selectedEvent.diff.additions} / −
                  {selectedEvent.diff.deletions}
                </Text>
              </MetadataListItem>
              {selectedEvent.impactUntil != null && (
                <MetadataListItem label="Impact window">
                  <Text hasTabularNumbers>
                    {timeLabel(selectedEvent.index)} –{' '}
                    {timeLabel(selectedEvent.impactUntil)}
                  </Text>
                </MetadataListItem>
              )}
            </MetadataList>
          )}

          {selectedEvent.diff != null && (
            <VStack gap={1}>
              {selectedEvent.diff.notes.map(note => (
                <HStack gap={2} vAlign="start" key={note}>
                  <StatusDot variant="accent" label="Note" />
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      {note}
                    </Text>
                  </StackItem>
                </HStack>
              ))}
            </VStack>
          )}

          <HStack gap={2}>
            {selectedEvent.impactUntil != null && (
              <Button
                label="Zoom to impact"
                variant="secondary"
                size="sm"
                style={styles.transportButton}
                icon={<Icon icon={ZoomInIcon} size="sm" />}
                onClick={() => onZoomToImpact(selectedEvent)}
              />
            )}
            <Button
              label="Clear selection"
              variant="ghost"
              size="sm"
              style={styles.transportButton}
              onClick={onClearSelection}
            />
          </HStack>
        </VStack>
      )}

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Event log</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {events.length} shown
          </Text>
        </HStack>
        <div style={styles.eventLogScroll}>
          <List density="compact" hasDividers>
            {events.map(entry => {
              const meta = KIND_META[entry.kind];
              return (
                <ListItem
                  key={entry.id}
                  label={entry.title}
                  description={`${timeLabel(entry.index)} · ${meta.label.toLowerCase()}`}
                  startContent={
                    <span style={{color: meta.color, display: 'inline-flex'}}>
                      <Icon icon={meta.icon} size="sm" color="inherit" />
                    </span>
                  }
                  endContent={
                    entry.impactUntil != null ? (
                      <Badge
                        variant="neutral"
                        label={`impact ${timeLabel(entry.index)}–${timeLabel(entry.impactUntil)}`}
                      />
                    ) : undefined
                  }
                  onClick={() => onSelectEvent(entry.id)}
                  isSelected={entry.id === selectedEventId}
                />
              );
            })}
          </List>
        </div>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function DeployImpactScrubberTemplate() {
  // Boot on the bad deploy (14:10 cache rewrite) with its impact region
  // shaded, so the linked-shading interaction is visible on first paint.
  const [range, setRange] = useState<Range>({...FULL_RANGE});
  const [playhead, setPlayhead] = useState(26);
  const [selectedEventId, setSelectedEventId] = useState<string | null>('e05');
  const [hover, setHover] = useState<{index: number; chart: string} | null>(
    null,
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [shownKinds, setShownKinds] = useState<ReadonlySet<EventKind>>(
    () => new Set<EventKind>(['deploy', 'config', 'alert']),
  );

  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // ----- derived state (pure functions of the controls) -----

  const visibleEvents = useMemo(
    () => EVENTS.filter(entry => shownKinds.has(entry.kind)),
    [shownKinds],
  );

  const selectedEvent =
    selectedEventId != null
      ? (EVENTS.find(entry => entry.id === selectedEventId) ?? null)
      : null;

  const impact: Range | null =
    selectedEvent != null && selectedEvent.impactUntil != null
      ? {start: selectedEvent.index, end: selectedEvent.impactUntil}
      : null;

  const eventAtPlayhead =
    visibleEvents.find(entry => entry.index === playhead) ?? null;
  const playheadOrdinal =
    eventAtPlayhead != null
      ? visibleEvents.findIndex(entry => entry.id === eventAtPlayhead.id) + 1
      : null;

  const isZoomed = range.start !== 0 || range.end !== SAMPLE_MAX;

  const tooltipRows = useMemo(() => {
    if (hover == null) {
      return [];
    }
    return SERIES.map(series => ({
      label: series.label,
      color: series.color,
      value: series.format(series.values[hover.index]),
    }));
  }, [hover]);

  // ----- shared commit logic (drag, keys, taps, playback, log) -----

  const commitPlayhead = (raw: number, snap: boolean) => {
    const index = clamp(Math.round(raw), 0, SAMPLE_MAX);
    const snapped = snap ? snapToEvent(index, visibleEvents) : index;
    setPlayhead(snapped);
    const hit = visibleEvents.find(entry => entry.index === snapped);
    if (hit != null) {
      setSelectedEventId(hit.id);
    }
  };

  const handleScrub = (raw: number, snap: boolean) => {
    setIsPlaying(false);
    commitPlayhead(raw, snap);
  };

  const stepEvent = (direction: 1 | -1) => {
    const target =
      direction === 1
        ? visibleEvents.find(entry => entry.index > playhead)
        : [...visibleEvents].reverse().find(entry => entry.index < playhead);
    if (target != null) {
      setPlayhead(target.index);
      setSelectedEventId(target.id);
    }
  };

  const handleStepEvent = (direction: 1 | -1) => {
    setIsPlaying(false);
    stepEvent(direction);
  };

  const selectEvent = (id: string) => {
    setIsPlaying(false);
    const entry = EVENTS.find(candidate => candidate.id === id);
    if (entry == null) {
      return;
    }
    if (selectedEventId === id) {
      setSelectedEventId(null);
      return;
    }
    setSelectedEventId(id);
    setPlayhead(entry.index);
  };

  // The brush commit — also driven by the Focus / Zoom-to-impact buttons,
  // so the pointer gesture always has a button path to the same state.
  const commitRange = (a: number, b: number) => {
    const lo = clamp(Math.round(Math.min(a, b)), 0, SAMPLE_MAX);
    const hi = clamp(Math.round(Math.max(a, b)), 0, SAMPLE_MAX);
    if (hi - lo >= MIN_SPAN) {
      setRange({start: lo, end: hi});
    }
  };

  const zoomToImpact = (entry: TimelineEvent) => {
    if (entry.impactUntil != null) {
      commitRange(entry.index - 2, entry.impactUntil + 2);
    }
  };

  const focusPlayhead = () => {
    commitRange(playhead - 6, playhead + 6);
  };

  const resetZoom = () => {
    setRange({...FULL_RANGE});
  };

  const toggleKind = (kind: EventKind, isOn: boolean) => {
    setShownKinds(prev => {
      const next = new Set(prev);
      if (isOn) {
        next.add(kind);
      } else {
        next.delete(kind);
      }
      return next;
    });
  };

  // Playback cadence: the interval only hops the playhead to the next
  // fixture event — every rendered value stays a pure function of it.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      const target = visibleEvents.find(entry => entry.index > playhead);
      if (target == null) {
        setIsPlaying(false);
      } else {
        setPlayhead(target.index);
        setSelectedEventId(target.id);
      }
    }, PLAY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPlaying, playhead, visibleEvents]);

  const hasNextEvent = visibleEvents.some(entry => entry.index > playhead);
  const hasPrevEvent = visibleEvents.some(entry => entry.index < playhead);

  const announcement =
    `Playhead ${timeLabel(playhead)} — ` +
    SERIES.map(
      series => `${series.label} ${series.format(series.values[playhead])}`,
    ).join(', ') +
    (eventAtPlayhead != null ? `. On event: ${eventAtPlayhead.title}.` : '.');

  // ----- pieces -----

  const transportTap = isCompact ? styles.transportTap : undefined;

  const transport = (
    <HStack gap={2} vAlign="center" style={styles.transportRow}>
      <IconButton
        label="Previous event"
        tooltip="Previous event (Shift+←)"
        icon={<Icon icon={StepBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={transportTap}
        isDisabled={!hasPrevEvent}
        onClick={() => handleStepEvent(-1)}
      />
      <IconButton
        label={isPlaying ? 'Pause playback' : 'Play through events'}
        tooltip={isPlaying ? 'Pause' : 'Play event by event'}
        icon={
          <Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" color="inherit" />
        }
        variant="ghost"
        size="sm"
        style={transportTap}
        isDisabled={!isPlaying && !hasNextEvent}
        onClick={() => setIsPlaying(prev => !prev)}
      />
      <IconButton
        label="Next event"
        tooltip="Next event (Shift+→)"
        icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={transportTap}
        isDisabled={!hasNextEvent}
        onClick={() => handleStepEvent(1)}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {timeLabel(playhead)}
        {playheadOrdinal != null
          ? ` · event ${playheadOrdinal}/${visibleEvents.length}`
          : ` · sample ${playhead}/${SAMPLE_MAX}`}
      </Text>
      <StackItem size="fill">
        {/* <=640px: the hint cedes its width to the controls. */}
        {!isCompact && (
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Drag the playhead (snaps to events) or brush the track to zoom.
            </Text>
            <Kbd keys="shift" />
            <Kbd keys="arrowright" />
          </HStack>
        )}
      </StackItem>
      {(['deploy', 'config', 'alert'] as const).map(kind => (
        <ToggleButton
          key={kind}
          label={`${KIND_META[kind].label}s`}
          size="sm"
          style={isCompact ? {height: 40} : undefined}
          icon={<Icon icon={KIND_META[kind].icon} size="sm" color="inherit" />}
          isPressed={shownKinds.has(kind)}
          onPressedChange={isOn => toggleKind(kind, isOn)}
          tooltip={
            shownKinds.has(kind)
              ? `Hide ${KIND_META[kind].label.toLowerCase()} events`
              : `Show ${KIND_META[kind].label.toLowerCase()} events`
          }
        />
      ))}
      <Button
        label="Focus ±30 m"
        variant="secondary"
        size="sm"
        style={styles.transportButton}
        icon={<Icon icon={ZoomInIcon} size="sm" />}
        onClick={focusPlayhead}
      />
      <Button
        label="Reset zoom"
        variant="ghost"
        size="sm"
        style={styles.transportButton}
        icon={<Icon icon={ZoomOutIcon} size="sm" />}
        isDisabled={!isZoomed}
        onClick={resetZoom}
      />
    </HStack>
  );

  const charts = (
    <VStack gap={3} style={styles.chartsWrap}>
      {SERIES.map((series, seriesIndex) => (
        <MetricChart
          key={series.id}
          series={series}
          range={range}
          playhead={playhead}
          hoverIndex={hover?.index ?? null}
          isHoverSource={hover?.chart === series.id}
          impact={impact}
          showXLabels={seriesIndex === SERIES.length - 1}
          isScrubbing={isScrubbing}
          prefersReducedMotion={prefersReducedMotion}
          tooltipRows={tooltipRows}
          onHover={index => setHover({index, chart: series.id})}
          onLeave={() => setHover(null)}
          onScrub={index => handleScrub(index, true)}
        />
      ))}
    </VStack>
  );

  const panelContent = (
    <DetailPanelContent
      playhead={playhead}
      selectedEvent={selectedEvent}
      events={visibleEvents}
      selectedEventId={selectedEventId}
      onSelectEvent={selectEvent}
      onZoomToImpact={zoomToImpact}
      onClearSelection={() => setSelectedEventId(null)}
    />
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={GaugeIcon} size="sm" color="secondary" />
                  <Heading level={1}>Deploy impact scrubber</Heading>
                  {/* <=640px: the caption cedes width to the zoom Badge. */}
                  {!isCompact && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      api-gateway · 12:00–20:00 · {SAMPLE_COUNT} samples ·{' '}
                      {EVENTS.length} events
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <Badge
                variant={isZoomed ? 'info' : 'neutral'}
                label={
                  isZoomed
                    ? `Zoom ${timeLabel(range.start)}–${timeLabel(range.end)}`
                    : 'Full window'
                }
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="Deploy impact timeline">
            <div style={styles.scroll}>
              <div style={styles.sticky}>
                {transport}
                <TimelineStrip
                  events={visibleEvents}
                  playhead={playhead}
                  selectedEventId={selectedEventId}
                  range={range}
                  impact={impact}
                  isCompact={isCompact}
                  prefersReducedMotion={prefersReducedMotion}
                  onSelectEvent={selectEvent}
                  onScrub={handleScrub}
                  onScrubbingChange={setIsScrubbing}
                  onStepEvent={handleStepEvent}
                  onBrush={commitRange}
                />
              </div>
              {charts}
              {/* <=1024px: the detail panel flows below the charts. */}
              {isNarrow && (
                <div style={styles.inlinePanel}>
                  <Divider />
                  {panelContent}
                </div>
              )}
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel width={340} padding={0} label="Event detail panel">
              <div style={styles.panelScroll}>{panelContent}</div>
            </LayoutPanel>
          )
        }
      />
    </>
  );
}
