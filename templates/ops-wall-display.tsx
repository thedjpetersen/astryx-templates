// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ops-wall-display.tsx
 * @input Deterministic fixtures only (48-tick global series for latency p95,
 *   error rate, and throughput; 12 edge regions whose per-region series are
 *   pure phase/multiplier functions of the global tape; 8 scripted incidents
 *   with fixed start/end ticks including one SEV1 takeover window; 6 change
 *   log entries pinned to ticks; a fixture wall clock that is base time plus
 *   tick × 5s — no Date.now, no Math.random, no network assets)
 * @output Kiosk-grade NOC wall display meant to be read from across a room:
 *   three oversized metric panels whose numerals tween between tick values
 *   over EKG-style heartbeat polylines that advance one sample per tick; a
 *   region grid of pulsing status cells (pulse keyframes gated by play state
 *   so pause truly freezes the room) with a tap-to-inspect region detail
 *   strip; a spotlight panel that auto-cycles Open incidents / Slowest
 *   regions / Change log every 6 ticks behind a visible progress arc with
 *   prev/next and hold controls; a scrolling incident ticker along the
 *   bottom; and a full-bleed SEV1 takeover banner that slams the wall red
 *   when the fixture stream crosses its threshold tick, collapsing to an
 *   acknowledged alarm strip. Transport = Play / Pause / step back / step
 *   forward / restart / scrub Slider; every pulse, rotation, and clock digit
 *   derives from the tick index
 * @position Page template; emitted by `astryx template ops-wall-display`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title +
 * caption, worst-region StatusDot, fixture wall clock). LayoutContent
 * stacks the transport bar over the wall (a container-queried region that
 * scrolls vertically and hosts the takeover overlay) over the incident
 * ticker rail. No side panel — a wall display is a single broadcast surface.
 *
 * Responsive contract:
 * - The wall wrapper is an inline-size container; numerals scale with cqw
 *   units so the same markup reads as a kiosk at 1600px and a glance card
 *   at 375px.
 * - >980px container: metric panels 3-across; region grid beside the
 *   spotlight panel in a 1.6fr/1fr split.
 * - <=980px container: metrics stack 1-across and the mid band collapses
 *   to a single column (regions, then spotlight).
 * - <=640px container: region cells tighten to a 96px minimum while
 *   keeping >=64px tap heights; the phone view is a single-column glance
 *   feed. <=640px viewport drops the header caption so the clock fits.
 * - Transport buttons keep >=40px targets; no hover-only affordances —
 *   ticker hold has a ToggleButton equivalent, and every rotation gesture
 *   is a button. The wall column is the only vertical scroll region; the
 *   ticker rail deliberately overflows horizontally (it is a marquee).
 *
 * Container policy (broadcast-wall archetype): frame-first, no Cards —
 * hand-rolled bordered panels sized for distance reading. Heartbeats are
 * hand-rolled SVG polylines; pulses, marquee, and takeover flash are CSS
 * keyframes gated by data-live so pausing freezes them, and
 * prefers-reduced-motion disables them outright (Step remains the
 * non-animated path). All state is a pure function of the tick index;
 * setInterval only advances the tick, and the numeral tween is
 * presentation-only easing toward tick-pure targets (reduced motion snaps).
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair (the three
 * metric trace colors are light-dark() pairs tuned dark-first and audited
 * light); no raw hex or rgb() outside light-dark().
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
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ActivityIcon,
  AlertTriangleIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HistoryIcon,
  PauseIcon,
  PinIcon,
  PlayIcon,
  RadioTowerIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from 'lucide-react';

// ============= CLOCK CONSTANTS =============
// The wall clock is base time + tick × 5s — pure arithmetic, no Date.

const TICK_COUNT = 48;
const LAST_TICK = TICK_COUNT - 1;
const TICK_SECONDS = 5;
const TICK_INTERVAL_MS = 1000;
const ROTATION_TICKS = 6; // spotlight rotates every 6 ticks (30 wall-seconds)
const SPARK_WINDOW = 24; // heartbeat shows the trailing 24 samples
const BASE_CLOCK_SECONDS = 21 * 3600 + 14 * 60; // 21:14:00 UTC
const CLOCK_DAY = 'Wed · Jul 2';

// ============= KEYFRAMES =============
// Every animation is gated twice: data-live="false" pauses it (so Pause
// freezes the room), and prefers-reduced-motion removes it entirely — the
// Step buttons are the non-animated equivalent of Play, and pulses fall
// back to the static status dot color.

const GLOBAL_CSS = `
.owd-wall {
  container-type: inline-size;
}
.owd-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-3);
}
.owd-mid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: var(--spacing-3);
  align-items: start;
}
.owd-regions {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(148px, 1fr));
  gap: var(--spacing-2);
}
@container (max-width: 980px) {
  .owd-metrics { grid-template-columns: minmax(0, 1fr); }
  .owd-mid { grid-template-columns: minmax(0, 1fr); }
}
@container (max-width: 640px) {
  .owd-regions { grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); }
}
@keyframes owd-pulse {
  0% { box-shadow: 0 0 0 0 var(--owd-pulse); }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}
.owd-cell-pulse {
  animation: owd-pulse 1.8s ease-out infinite;
}
@keyframes owd-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.owd-ticker-track {
  animation: owd-marquee 44s linear infinite;
}
.owd-ticker-track:hover,
.owd-ticker-track:focus-within {
  animation-play-state: paused;
}
@keyframes owd-takeover-flash {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.74; }
}
.owd-takeover-flash {
  animation: owd-takeover-flash 1.6s ease-in-out infinite;
}
.owd-wall[data-live='false'] .owd-cell-pulse,
.owd-wall[data-live='false'] .owd-takeover-flash,
[data-live='false'] .owd-ticker-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .owd-cell-pulse,
  .owd-ticker-track,
  .owd-takeover-flash {
    animation: none;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {height: '100%', minHeight: 0},
  headerRow: {width: '100%', flexWrap: 'wrap'},
  clockBlock: {textAlign: 'right'},
  clockTime: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.04em',
    color: 'var(--color-text-primary)',
  },
  toolbar: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  toolbarButton: {minHeight: 40},
  scrubBox: {minWidth: 180, flexGrow: 1, maxWidth: 420},
  // The wall: the only vertical scroll region; also the container-query
  // root and the positioning context for the takeover overlay.
  wallScroll: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-body) 96%, var(--color-accent))',
  },
  wallInner: {
    padding: 'var(--spacing-4)',
    maxWidth: 1600,
    marginInline: 'auto',
    width: '100%',
  },
  // One broadcast panel: bordered, card-toned, sized for distance reading.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    minWidth: 0,
  },
  metricHead: {flexWrap: 'wrap'},
  // Oversized numerals scale with the container: kiosk at 1600px, glance
  // card at 375px, tabular so the tween never jitters horizontally.
  numeral: {
    fontSize: 'clamp(40px, 6.2cqw, 88px)',
    fontWeight: 700,
    lineHeight: 1,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  },
  numeralUnit: {
    fontSize: 'clamp(16px, 1.8cqw, 24px)',
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  sparkBox: {width: '100%'},
  spark: {width: '100%', height: 64, display: 'block'},
  sparkMini: {width: '100%', height: 40, display: 'block'},
  // Region cells: >=64px tall buttons at every breakpoint.
  regionCell: {
    minHeight: 64,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    padding: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
    minWidth: 0,
  },
  regionCellSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  regionValue: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.1,
    fontVariantNumeric: 'tabular-nums',
  },
  spotlightHead: {flexWrap: 'wrap'},
  spotlightBody: {minHeight: 236},
  leaderRow: {minWidth: 0},
  leaderTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    width: '100%',
  },
  leaderFill: {height: '100%', borderRadius: 5},
  incidentRow: {minWidth: 0, minHeight: 40},
  changeTick: {
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  // Ticker rail: the deliberate horizontal-overflow region.
  tickerRail: {
    overflow: 'hidden',
    backgroundColor:
      'color-mix(in srgb, var(--color-background-card) 88%, var(--color-background-body))',
  },
  tickerTrack: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    width: 'max-content',
    padding: 'var(--spacing-2) var(--spacing-3)',
    alignItems: 'center',
  },
  tickerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    whiteSpace: 'nowrap',
  },
  // SEV1 takeover: full-bleed over the wall, alarm-red mixed from tokens.
  takeover: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-5)',
    backgroundColor:
      'color-mix(in srgb, var(--color-icon-red) 26%, var(--color-background-body))',
  },
  takeoverCard: {
    maxWidth: 720,
    width: '100%',
    border: '2px solid var(--color-icon-red)',
    borderRadius: 'var(--radius-container)',
    backgroundColor:
      'color-mix(in srgb, var(--color-icon-red) 12%, var(--color-background-card))',
    padding: 'var(--spacing-5)',
  },
  takeoverTitle: {
    fontSize: 'clamp(28px, 4.4cqw, 52px)',
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '-0.01em',
  },
  takeoverActions: {flexWrap: 'wrap'},
  alarmStrip: {
    border: 'var(--border-width) solid var(--color-icon-red)',
    borderRadius: 'var(--radius-container)',
    backgroundColor:
      'color-mix(in srgb, var(--color-icon-red) 10%, var(--color-background-card))',
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
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
// Deterministic fixtures: three 48-sample global tapes with a scripted
// SEV1 window around ticks 32–41. Region series are pure phase/multiplier
// transforms of the global latency tape — no randomness anywhere.

const LATENCY_MS: number[] = [
  212, 208, 215, 221, 218, 224, 231, 226,
  219, 214, 222, 228, 235, 241, 236, 229,
  233, 238, 244, 239, 232, 236, 242, 248,
  255, 251, 246, 252, 259, 264, 278, 301,
  352, 441, 487, 512, 496, 463, 412, 368,
  331, 302, 281, 266, 257, 249, 243, 238,
];

const ERROR_PCT: number[] = [
  0.4, 0.3, 0.4, 0.5, 0.4, 0.4, 0.6, 0.5,
  0.4, 0.3, 0.5, 0.6, 0.5, 0.7, 0.6, 0.5,
  0.6, 0.7, 0.8, 0.6, 0.5, 0.6, 0.7, 0.9,
  1.0, 0.9, 0.8, 1.1, 1.3, 1.6, 2.2, 3.1,
  4.6, 5.8, 6.4, 6.1, 5.2, 4.3, 3.2, 2.4,
  1.8, 1.4, 1.1, 0.9, 0.8, 0.7, 0.6, 0.5,
];

const THROUGHPUT_KRPS: number[] = [
  118, 121, 124, 122, 126, 128, 125, 123,
  121, 124, 127, 129, 126, 124, 122, 125,
  128, 126, 123, 121, 124, 127, 125, 122,
  120, 118, 116, 113, 109, 104, 97, 91,
  84, 79, 76, 78, 83, 89, 96, 103,
  108, 112, 115, 117, 119, 121, 122, 123,
];

type MetricId = 'latency' | 'errors' | 'throughput';

interface MetricDef {
  id: MetricId;
  label: string;
  unit: string;
  series: number[];
  decimals: number;
  /** Which direction of change is healthy, for delta sentiment. */
  goodDirection: 'down' | 'up';
  /** Trace color: explicit light-dark() pair, dark-first. */
  trace: string;
}

const METRICS: MetricDef[] = [
  {
    id: 'latency',
    label: 'Latency p95',
    unit: 'ms',
    series: LATENCY_MS,
    decimals: 0,
    goodDirection: 'down',
    trace: 'light-dark(#0E7490, #22D3EE)',
  },
  {
    id: 'errors',
    label: 'Error rate',
    unit: '%',
    series: ERROR_PCT,
    decimals: 1,
    goodDirection: 'down',
    trace: 'light-dark(#B91C1C, #F87171)',
  },
  {
    id: 'throughput',
    label: 'Throughput',
    unit: 'k rps',
    series: THROUGHPUT_KRPS,
    decimals: 0,
    goodDirection: 'up',
    trace: 'light-dark(#6D28D9, #A78BFA)',
  },
];

interface Region {
  id: string;
  code: string;
  name: string;
  /** Latency multiplier against the global tape. */
  mult: number;
  /** Phase shift into the global tape, in ticks. */
  phase: number;
}

const REGIONS: Region[] = [
  {id: 'iad', code: 'IAD', name: 'US East (Ashburn)', mult: 0.92, phase: 0},
  {id: 'sjc', code: 'SJC', name: 'US West (San Jose)', mult: 0.88, phase: 3},
  {id: 'yyz', code: 'YYZ', name: 'Canada (Toronto)', mult: 0.95, phase: 5},
  {id: 'gru', code: 'GRU', name: 'São Paulo', mult: 1.18, phase: 8},
  {id: 'lhr', code: 'LHR', name: 'London', mult: 0.96, phase: 1},
  {id: 'fra', code: 'FRA', name: 'Frankfurt', mult: 0.94, phase: 2},
  {id: 'arn', code: 'ARN', name: 'Stockholm', mult: 0.9, phase: 6},
  {id: 'jnb', code: 'JNB', name: 'Johannesburg', mult: 1.24, phase: 10},
  {id: 'bom', code: 'BOM', name: 'Mumbai', mult: 1.12, phase: 4},
  {id: 'sin', code: 'SIN', name: 'Singapore', mult: 1.05, phase: 7},
  {id: 'nrt', code: 'NRT', name: 'Tokyo', mult: 1.02, phase: 9},
  {id: 'syd', code: 'SYD', name: 'Sydney', mult: 1.15, phase: 11},
];

const REGION_BY_ID = new Map(REGIONS.map(region => [region.id, region]));

type Severity = 1 | 2 | 3;

interface Incident {
  id: string;
  sev: Severity;
  regionId: string;
  title: string;
  startTick: number;
  /** Exclusive end tick; null = still open at the end of the tape. */
  endTick: number | null;
}

// One SEV1 window (ticks 32–41) drives the takeover state; the rest feed
// the ticker, the spotlight list, and region warn states.
const INCIDENTS: Incident[] = [
  {id: 'INC-4092', sev: 3, regionId: 'lhr', title: 'Scheduled failover drill', startTick: 0, endTick: 8},
  {id: 'INC-4095', sev: 3, regionId: 'bom', title: 'BGP flap — carrier reroute', startTick: 4, endTick: 18},
  {id: 'INC-4097', sev: 2, regionId: 'gru', title: 'Elevated 5xx from origin shield', startTick: 12, endTick: 26},
  {id: 'INC-4099', sev: 2, regionId: 'fra', title: 'Cache-fill latency regression', startTick: 20, endTick: 36},
  {id: 'INC-4102', sev: 1, regionId: 'iad', title: 'Edge POP packet loss — US East', startTick: 32, endTick: 41},
  {id: 'INC-4103', sev: 2, regionId: 'sjc', title: 'Retry storm from SDK v3.2 clients', startTick: 34, endTick: 45},
  {id: 'INC-4104', sev: 3, regionId: 'syd', title: 'Certificate rotation lag', startTick: 38, endTick: null},
  {id: 'INC-4105', sev: 3, regionId: 'nrt', title: 'Log pipeline backlog', startTick: 42, endTick: null},
];

interface ChangeEntry {
  tick: number;
  service: string;
  version: string;
  note: string;
}

const CHANGE_LOG: ChangeEntry[] = [
  {tick: 2, service: 'edge-router', version: 'v2.41.0', note: 'Enable HTTP/3 on EU POPs'},
  {tick: 9, service: 'origin-shield', version: 'v1.18.2', note: 'Raise coalescing window to 80ms'},
  {tick: 17, service: 'waf-rules', version: 'r5124', note: 'Block malformed range headers'},
  {tick: 27, service: 'edge-router', version: 'v2.41.1', note: 'Hotfix: POP drain race on reload'},
  {tick: 36, service: 'dns-steering', version: 'v3.7.0', note: 'Shift IAD weight to YYZ + LHR'},
  {tick: 44, service: 'origin-shield', version: 'v1.18.3', note: 'Revert coalescing window to 50ms'},
];

const SEV_META: Record<Severity, {label: string; badge: BadgeVariant}> = {
  1: {label: 'SEV1', badge: 'error'},
  2: {label: 'SEV2', badge: 'warning'},
  3: {label: 'SEV3', badge: 'neutral'},
};

type RegionStatus = 'ok' | 'warn' | 'alert';

const STATUS_COLOR: Record<RegionStatus, string> = {
  ok: 'var(--color-icon-green)',
  warn: 'var(--color-icon-orange)',
  alert: 'var(--color-icon-red)',
};

const STATUS_LABEL: Record<RegionStatus, string> = {
  ok: 'Nominal',
  warn: 'Degraded',
  alert: 'Incident',
};

const STATUS_DOT: Record<RegionStatus, 'success' | 'warning' | 'error'> = {
  ok: 'success',
  warn: 'warning',
  alert: 'error',
};

const SPOTLIGHT_TITLES = ['Open incidents', 'Slowest regions', 'Change log'];

// ============= PURE TICK FUNCTIONS =============
// Everything the wall shows is one of these functions of the tick index.

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function pad2(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

/** Fixture wall clock: base 21:14:00 UTC + tick × 5s, pure arithmetic. */
function clockAt(tick: number): string {
  const total = (BASE_CLOCK_SECONDS + tick * TICK_SECONDS) % 86400;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

function elapsedLabel(tick: number): string {
  return `t+${tick * TICK_SECONDS}s`;
}

function regionLatencyAt(region: Region, tick: number): number {
  const index = (tick + region.phase) % TICK_COUNT;
  return Math.round(LATENCY_MS[index] * region.mult);
}

function openIncidentsAt(tick: number): Incident[] {
  return INCIDENTS.filter(
    incident =>
      incident.startTick <= tick &&
      (incident.endTick == null || tick < incident.endTick),
  ).sort((a, b) => a.sev - b.sev || a.startTick - b.startTick);
}

function announcedIncidentsAt(tick: number): Incident[] {
  return INCIDENTS.filter(incident => incident.startTick <= tick).sort(
    (a, b) => b.startTick - a.startTick || a.sev - b.sev,
  );
}

function regionStatusAt(regionId: string, tick: number): RegionStatus {
  for (const incident of openIncidentsAt(tick)) {
    if (incident.regionId === regionId) {
      return incident.sev === 1 ? 'alert' : 'warn';
    }
  }
  const region = REGION_BY_ID.get(regionId);
  if (region != null && regionLatencyAt(region, tick) > 430) {
    return 'warn';
  }
  return 'ok';
}

function worstStatusAt(tick: number): RegionStatus {
  let worst: RegionStatus = 'ok';
  for (const region of REGIONS) {
    const status = regionStatusAt(region.id, tick);
    if (status === 'alert') {
      return 'alert';
    }
    if (status === 'warn') {
      worst = 'warn';
    }
  }
  return worst;
}

function sev1At(tick: number): Incident | null {
  return openIncidentsAt(tick).find(incident => incident.sev === 1) ?? null;
}

function formatValue(value: number, decimals: number): string {
  return value.toFixed(decimals);
}

// ============= NUMERAL TWEEN =============
// The craft detail: numerals ease toward each tick's fixture value. The
// tween is presentation-only (the target is always the pure tick value,
// exactly like a CSS transition); reduced motion snaps instantly.

const TWEEN_MS = 450;

function useTweenedNumber(target: number, isAnimated: boolean): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  useEffect(() => {
    if (!isAnimated) {
      displayRef.current = target;
      setDisplay(target);
      return undefined;
    }
    const from = displayRef.current;
    if (from === target) {
      return undefined;
    }
    let raf = 0;
    let start: number | null = null;
    const frame = (now: number) => {
      if (start == null) {
        start = now;
      }
      const t = Math.min(1, (now - start) / TWEEN_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = from + (target - from) * eased;
      displayRef.current = value;
      setDisplay(value);
      if (t < 1) {
        raf = requestAnimationFrame(frame);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [target, isAnimated]);
  return isAnimated ? display : target;
}

// ============= HEARTBEAT SPARKLINE =============

/**
 * EKG-style heartbeat: a hand-rolled SVG polyline over the trailing
 * SPARK_WINDOW samples ending at the current tick, so it advances exactly
 * one sample per tick. Normalization spans the whole tape, keeping the
 * vertical scale stable while the window slides. A soft under-stroke
 * (color-mix toward transparent) gives the phosphor glow.
 */
function Heartbeat({
  series,
  tick,
  trace,
  height,
  isMini,
}: {
  series: number[];
  tick: number;
  trace: string;
  height: number;
  isMini?: boolean;
}) {
  const width = 240;
  const pad = 6;
  let min = series[0];
  let max = series[0];
  for (const value of series) {
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  const span = max - min || 1;
  const points: string[] = [];
  let lastX = 0;
  let lastY = 0;
  for (let i = 0; i < SPARK_WINDOW; i++) {
    const sample = series[clamp(tick - (SPARK_WINDOW - 1) + i, 0, LAST_TICK)];
    const x = pad + (i / (SPARK_WINDOW - 1)) * (width - pad * 2);
    const y = height - pad - ((sample - min) / span) * (height - pad * 2);
    points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    lastX = x;
    lastY = y;
  }
  const joined = points.join(' ');
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={isMini ? styles.sparkMini : styles.spark}
      aria-hidden
      focusable={false}>
      <polyline
        points={joined}
        fill="none"
        stroke={`color-mix(in srgb, ${trace} 30%, transparent)`}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points={joined}
        fill="none"
        stroke={trace}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastX} cy={lastY} r={3.5} fill={trace} />
    </svg>
  );
}

// ============= PROGRESS ARC =============

/**
 * The spotlight's visible rotation cadence: an SVG arc that fills over the
 * ROTATION_TICKS window. Pure function of the tick, so pausing freezes it
 * and stepping advances it in visible increments.
 */
function ProgressArc({fraction, isHeld}: {fraction: number; isHeld: boolean}) {
  const r = 8;
  const c = 2 * Math.PI * r;
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden focusable={false}>
      <circle
        cx={11}
        cy={11}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={3}
      />
      <circle
        cx={11}
        cy={11}
        r={r}
        fill="none"
        stroke={isHeld ? 'var(--color-icon-orange)' : 'var(--color-accent)'}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={isHeld ? 0 : c * (1 - fraction)}
        transform="rotate(-90 11 11)"
      />
    </svg>
  );
}

// ============= METRIC PANEL =============

function MetricPanel({
  metric,
  tick,
  isTweened,
}: {
  metric: MetricDef;
  tick: number;
  isTweened: boolean;
}) {
  const target = metric.series[tick];
  const display = useTweenedNumber(target, isTweened);
  const previous = metric.series[Math.max(0, tick - 1)];
  const delta = target - previous;
  const isGood =
    delta === 0
      ? true
      : metric.goodDirection === 'down'
        ? delta < 0
        : delta > 0;
  const deltaLabel =
    delta === 0
      ? '±0'
      : `${delta > 0 ? '+' : '−'}${formatValue(Math.abs(delta), metric.decimals)}`;
  return (
    <section style={styles.panel} aria-label={metric.label}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" style={styles.metricHead}>
          <StackItem size="fill">
            <Text type="label" color="secondary">
              {metric.label}
            </Text>
          </StackItem>
          <Badge
            variant={delta === 0 ? 'neutral' : isGood ? 'success' : 'error'}
            label={`${deltaLabel} ${metric.unit} / tick`}
          />
        </HStack>
        <HStack gap={2} vAlign="end">
          <span
            style={{...styles.numeral, color: metric.trace}}
            aria-label={`${formatValue(target, metric.decimals)} ${metric.unit}`}>
            {formatValue(display, metric.decimals)}
          </span>
          <span style={styles.numeralUnit}>{metric.unit}</span>
        </HStack>
        <div style={styles.sparkBox}>
          <Heartbeat
            series={metric.series}
            tick={tick}
            trace={metric.trace}
            height={64}
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          trailing {SPARK_WINDOW} samples · one per tick
        </Text>
      </VStack>
    </section>
  );
}

// ============= REGION GRID =============

function RegionCell({
  region,
  tick,
  isSelected,
  onSelect,
}: {
  region: Region;
  tick: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const status = regionStatusAt(region.id, tick);
  const latency = regionLatencyAt(region, tick);
  const pulseStyle = {
    ...styles.pulseDot,
    backgroundColor: STATUS_COLOR[status],
    '--owd-pulse': `color-mix(in srgb, ${STATUS_COLOR[status]} 45%, transparent)`,
  } as CSSProperties;
  return (
    <button
      type="button"
      style={{
        ...styles.regionCell,
        ...(isSelected ? styles.regionCellSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={`${region.name} — ${STATUS_LABEL[status]}, ${latency} ms p95`}
      onClick={() => onSelect(region.id)}>
      <HStack gap={2} vAlign="center">
        <span
          className={status === 'ok' ? undefined : 'owd-cell-pulse'}
          style={pulseStyle}
          aria-hidden
        />
        <StackItem size="fill">
          <Text type="label">{region.code}</Text>
        </StackItem>
        <Text type="supporting" color="secondary">
          {STATUS_LABEL[status]}
        </Text>
      </HStack>
      <span style={{...styles.regionValue, color: STATUS_COLOR[status]}}>
        {latency}
        <Text type="supporting" color="secondary">
          {' '}
          ms
        </Text>
      </span>
    </button>
  );
}

function RegionDetail({
  region,
  tick,
  onClear,
}: {
  region: Region;
  tick: number;
  onClear: () => void;
}) {
  const status = regionStatusAt(region.id, tick);
  const latency = regionLatencyAt(region, tick);
  // Per-region heartbeat: the same phase/multiplier transform applied to
  // the whole tape, so the mini trace stays a pure function of the tick.
  const regionSeries = useMemo(
    () =>
      LATENCY_MS.map((_, index) =>
        regionLatencyAt(region, index),
      ),
    [region],
  );
  const incidents = openIncidentsAt(tick).filter(
    incident => incident.regionId === region.id,
  );
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" style={styles.metricHead}>
        <StatusDot variant={STATUS_DOT[status]} label={STATUS_LABEL[status]} />
        <StackItem size="fill">
          <Text type="label">{region.name}</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {latency} ms p95 · {STATUS_LABEL[status].toLowerCase()}
        </Text>
        <Button label="Clear" variant="ghost" size="sm" onClick={onClear} />
      </HStack>
      <Heartbeat
        series={regionSeries}
        tick={tick}
        trace={STATUS_COLOR[status]}
        height={40}
        isMini
      />
      {incidents.length === 0 ? (
        <Text type="supporting" color="secondary">
          No open incidents in this region at {elapsedLabel(tick)}.
        </Text>
      ) : (
        incidents.map(incident => (
          <HStack gap={2} vAlign="center" key={incident.id}>
            <Badge
              variant={SEV_META[incident.sev].badge}
              label={SEV_META[incident.sev].label}
            />
            <StackItem size="fill">
              <Text type="supporting">{incident.title}</Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              since {elapsedLabel(incident.startTick)}
            </Text>
          </HStack>
        ))
      )}
    </VStack>
  );
}

// ============= SPOTLIGHT PANEL =============

function IncidentListView({tick}: {tick: number}) {
  const open = openIncidentsAt(tick);
  if (open.length === 0) {
    return (
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={CheckIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            No open incidents at {elapsedLabel(tick)}. The board is green.
          </Text>
        </HStack>
      </VStack>
    );
  }
  return (
    <VStack gap={2}>
      {open.map(incident => {
        const region = REGION_BY_ID.get(incident.regionId);
        return (
          <HStack gap={2} vAlign="center" key={incident.id} style={styles.incidentRow}>
            <Badge
              variant={SEV_META[incident.sev].badge}
              label={SEV_META[incident.sev].label}
            />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {incident.title}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {region?.code ?? '—'} · opened {elapsedLabel(incident.startTick)} ·{' '}
                  {incident.endTick == null || tick < incident.endTick
                    ? `open ${(tick - incident.startTick) * TICK_SECONDS}s`
                    : 'resolved'}
                </Text>
              </VStack>
            </StackItem>
            <Text type="code" size="sm">
              {incident.id}
            </Text>
          </HStack>
        );
      })}
    </VStack>
  );
}

function SlowestRegionsView({tick}: {tick: number}) {
  const ranked = REGIONS.map(region => ({
    region,
    latency: regionLatencyAt(region, tick),
    status: regionStatusAt(region.id, tick),
  }))
    .sort((a, b) => b.latency - a.latency)
    .slice(0, 5);
  const worst = ranked[0].latency || 1;
  return (
    <VStack gap={2}>
      {ranked.map(entry => (
        <VStack gap={1} key={entry.region.id} style={styles.leaderRow}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label">{entry.region.code}</Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {entry.latency} ms
            </Text>
          </HStack>
          <div style={styles.leaderTrack} aria-hidden>
            <div
              style={{
                ...styles.leaderFill,
                width: `${Math.round((entry.latency / worst) * 100)}%`,
                backgroundColor: `color-mix(in srgb, ${
                  STATUS_COLOR[entry.status]
                } 70%, var(--color-background-muted))`,
              }}
            />
          </div>
        </VStack>
      ))}
    </VStack>
  );
}

function ChangeLogView({tick}: {tick: number}) {
  return (
    <VStack gap={2}>
      {CHANGE_LOG.map(entry => {
        const isShipped = entry.tick <= tick;
        return (
          <HStack
            gap={2}
            vAlign="center"
            key={`${entry.service}-${entry.tick}`}
            style={{...styles.incidentRow, opacity: isShipped ? 1 : 0.45}}>
            <Text type="code" size="sm" style={styles.changeTick}>
              {elapsedLabel(entry.tick)}
            </Text>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {entry.service} {entry.version}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {entry.note}
                </Text>
              </VStack>
            </StackItem>
            <Badge
              variant={isShipped ? 'success' : 'neutral'}
              label={isShipped ? 'shipped' : 'queued'}
            />
          </HStack>
        );
      })}
    </VStack>
  );
}

function SpotlightPanel({
  tick,
  activeIndex,
  isHeld,
  onShift,
  onToggleHold,
}: {
  tick: number;
  activeIndex: number;
  isHeld: boolean;
  onShift: (delta: number) => void;
  onToggleHold: (isOn: boolean) => void;
}) {
  const fraction = (tick % ROTATION_TICKS) / ROTATION_TICKS;
  return (
    <section style={styles.panel} aria-label="Spotlight panel">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" style={styles.spotlightHead}>
          <ProgressArc fraction={fraction} isHeld={isHeld} />
          <StackItem size="fill">
            <Text type="label">{SPOTLIGHT_TITLES[activeIndex]}</Text>
          </StackItem>
          <IconButton
            label="Previous spotlight panel"
            tooltip="Previous panel"
            icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="md"
            onClick={() => onShift(-1)}
          />
          <IconButton
            label="Next spotlight panel"
            tooltip="Next panel"
            icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
            variant="secondary"
            size="md"
            onClick={() => onShift(1)}
          />
          <ToggleButton
            label={isHeld ? 'Release spotlight rotation' : 'Hold spotlight rotation'}
            size="sm"
            isPressed={isHeld}
            onPressedChange={onToggleHold}>
            <Icon icon={PinIcon} size="sm" color="inherit" />
          </ToggleButton>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {isHeld
            ? 'Held — rotation paused on this panel'
            : `Rotates every ${ROTATION_TICKS} ticks (${
                ROTATION_TICKS * TICK_SECONDS
              }s wall time)`}
        </Text>
        <Divider />
        <div style={styles.spotlightBody}>
          {activeIndex === 0 ? (
            <IncidentListView tick={tick} />
          ) : activeIndex === 1 ? (
            <SlowestRegionsView tick={tick} />
          ) : (
            <ChangeLogView tick={tick} />
          )}
        </div>
      </VStack>
    </section>
  );
}

// ============= INCIDENT TICKER =============

/**
 * The bottom marquee: every incident announced up to the current tick,
 * duplicated once so the 50% translate loops seamlessly. The keyframe is
 * gated by data-live (pause freezes it) and by hover/focus-within; the
 * "Hold ticker" ToggleButton in the transport bar is the non-hover path.
 */
function IncidentTicker({
  tick,
  isLive,
  isHeld,
}: {
  tick: number;
  isLive: boolean;
  isHeld: boolean;
}) {
  const items = announcedIncidentsAt(tick);
  const renderItems = (keyPrefix: string, ariaHidden: boolean) =>
    items.map(incident => {
      const region = REGION_BY_ID.get(incident.regionId);
      const isOpen = incident.endTick == null || tick < incident.endTick;
      return (
        <span
          key={`${keyPrefix}-${incident.id}`}
          style={styles.tickerItem}
          aria-hidden={ariaHidden || undefined}>
          <Badge
            variant={SEV_META[incident.sev].badge}
            label={SEV_META[incident.sev].label}
          />
          <Text type="supporting" hasTabularNumbers>
            {region?.code ?? '—'} · {incident.title} ·{' '}
            {isOpen ? `open since ${elapsedLabel(incident.startTick)}` : 'resolved'}
          </Text>
        </span>
      );
    });
  return (
    <div style={styles.tickerRail} data-live={isLive ? 'true' : 'false'}>
      {items.length === 0 ? (
        <div style={styles.tickerTrack}>
          <span style={styles.tickerItem}>
            <Icon icon={RadioTowerIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              Incident wire quiet — no announcements yet at {elapsedLabel(tick)}
            </Text>
          </span>
        </div>
      ) : (
        <div
          className="owd-ticker-track"
          style={{
            ...styles.tickerTrack,
            animationPlayState: isHeld ? 'paused' : undefined,
          }}>
          {renderItems('a', false)}
          {renderItems('b', true)}
        </div>
      )}
    </div>
  );
}

// ============= TAKEOVER =============

function TakeoverBanner({
  incident,
  tick,
  onAcknowledge,
  onJumpToOnset,
}: {
  incident: Incident;
  tick: number;
  onAcknowledge: () => void;
  onJumpToOnset: () => void;
}) {
  const region = REGION_BY_ID.get(incident.regionId);
  return (
    <div style={styles.takeover} role="alert">
      <div className="owd-takeover-flash" style={styles.takeoverCard}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Icon icon={AlertTriangleIcon} size="lg" color="error" />
            <Badge variant="error" label="SEV1 · TAKEOVER" />
            <StackItem size="fill" />
            <Text type="code" size="sm">
              {incident.id}
            </Text>
          </HStack>
          <span style={{...styles.takeoverTitle, color: 'var(--color-text-primary)'}}>
            {incident.title}
          </span>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {region?.name ?? 'Unknown region'} · opened{' '}
            {elapsedLabel(incident.startTick)} · running{' '}
            {(tick - incident.startTick) * TICK_SECONDS}s · wall clock{' '}
            {clockAt(tick)} UTC
          </Text>
          <HStack gap={2} vAlign="center" style={styles.takeoverActions}>
            <Button
              label="Acknowledge"
              variant="primary"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={onAcknowledge}
            />
            <Button
              label="Jump to onset"
              variant="secondary"
              icon={<Icon icon={HistoryIcon} size="sm" color="inherit" />}
              onClick={onJumpToOnset}
            />
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function OpsWallDisplayTemplate() {
  // Boot mid-tape and playing: a wall display should be alive on first
  // paint, a few ticks before the SEV1 threshold so the takeover lands as
  // a story beat rather than a jump scare.
  const [tick, setTick] = useState(28);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>('iad');
  const [spotlightOffset, setSpotlightOffset] = useState(0);
  const [heldSpotlight, setHeldSpotlight] = useState<number | null>(null);
  const [isTickerHeld, setIsTickerHeld] = useState(false);
  const [ackedIncidents, setAckedIncidents] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  const isCompact = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // Playback cadence: the interval only advances the tick; the tape loops
  // so the wall runs ambiently. Every rendered value is a pure function of
  // the tick index.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      setTick(prev => (prev + 1) % TICK_COUNT);
    }, TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const stepBy = (delta: number) => {
    setIsPlaying(false);
    setTick(prev => clamp(prev + delta, 0, LAST_TICK));
  };

  const restart = () => {
    setIsPlaying(false);
    setTick(0);
    setAckedIncidents(new Set());
  };

  // Spotlight rotation: pure function of the tick plus a manual offset;
  // holding pins the current panel without touching the clock.
  const rotationIndex =
    (Math.floor(tick / ROTATION_TICKS) + spotlightOffset) % SPOTLIGHT_TITLES.length;
  const activeSpotlight =
    heldSpotlight ??
    ((rotationIndex + SPOTLIGHT_TITLES.length) % SPOTLIGHT_TITLES.length);

  const shiftSpotlight = (delta: number) => {
    if (heldSpotlight != null) {
      setHeldSpotlight(
        (heldSpotlight + delta + SPOTLIGHT_TITLES.length) %
          SPOTLIGHT_TITLES.length,
      );
    } else {
      setSpotlightOffset(prev => prev + delta);
    }
  };

  const toggleHold = (isOn: boolean) => {
    setHeldSpotlight(isOn ? activeSpotlight : null);
  };

  // Takeover: active whenever a SEV1 incident is open at this tick and has
  // not been acknowledged. Scrubbing back into the window re-arms only if
  // the ack is cleared (Restart clears it) — deterministic either way.
  const sev1 = sev1At(tick);
  const isTakeover = sev1 != null && !ackedIncidents.has(sev1.id);
  const isAckedAlarm = sev1 != null && ackedIncidents.has(sev1.id);

  const acknowledge = () => {
    if (sev1 != null) {
      setAckedIncidents(prev => new Set(prev).add(sev1.id));
    }
  };

  const worst = worstStatusAt(tick);
  const openCount = openIncidentsAt(tick).length;
  const selectedRegion =
    selectedRegionId != null ? (REGION_BY_ID.get(selectedRegionId) ?? null) : null;

  const isTweened = !prefersReducedMotion;
  const announcement =
    `Tick ${tick} of ${LAST_TICK}, ${clockAt(tick)} UTC. ` +
    `${STATUS_LABEL[worst]} board, ${openCount} open incident${
      openCount === 1 ? '' : 's'
    }.` +
    (isTakeover ? ` SEV1 takeover active: ${sev1.title}.` : '');

  const transport = (
    <HStack gap={2} vAlign="center" style={styles.toolbar}>
      <IconButton
        label="Restart from tick zero"
        tooltip="Restart"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="md"
        onClick={restart}
      />
      <IconButton
        label="Step back one tick"
        tooltip="Step back"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="md"
        isDisabled={tick === 0}
        onClick={() => stepBy(-1)}
      />
      <Button
        label={isPlaying ? 'Pause' : 'Play'}
        variant="primary"
        size="sm"
        style={styles.toolbarButton}
        icon={<Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" />}
        onClick={() => setIsPlaying(prev => !prev)}
      />
      <IconButton
        label="Step forward one tick"
        tooltip="Step forward"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="md"
        isDisabled={tick === LAST_TICK}
        onClick={() => stepBy(1)}
      />
      <div style={styles.scrubBox}>
        <Slider
          label="Scrub wall tick"
          isLabelHidden
          min={0}
          max={LAST_TICK}
          step={1}
          value={tick}
          onChange={(value: number) => {
            setIsPlaying(false);
            setTick(value);
          }}
          valueDisplay="none"
        />
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {elapsedLabel(tick)} · tick {tick}/{LAST_TICK}
      </Text>
      <StackItem size="fill" />
      <ToggleButton
        label={isTickerHeld ? 'Resume incident ticker' : 'Hold incident ticker'}
        size="sm"
        isPressed={isTickerHeld}
        onPressedChange={setIsTickerHeld}>
        {isTickerHeld ? 'Ticker held' : 'Hold ticker'}
      </ToggleButton>
    </HStack>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={RadioTowerIcon} size="md" color="secondary" />
                  <VStack gap={0}>
                    <Heading level={1}>Global edge · NOC wall</Heading>
                    {/* <=640px: the caption cedes width to the clock. */}
                    {!isCompact && (
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {REGIONS.length} regions · {openCount} open incident
                        {openCount === 1 ? '' : 's'} · fixture tape,{' '}
                        {TICK_SECONDS}s per tick
                      </Text>
                    )}
                  </VStack>
                </HStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <StatusDot
                  variant={STATUS_DOT[worst]}
                  label={`Board ${STATUS_LABEL[worst].toLowerCase()}`}
                />
                {!isCompact && (
                  <Badge
                    variant={
                      worst === 'ok'
                        ? 'success'
                        : worst === 'warn'
                          ? 'warning'
                          : 'error'
                    }
                    label={STATUS_LABEL[worst]}
                  />
                )}
              </HStack>
              <div style={styles.clockBlock}>
                <div style={styles.clockTime}>{clockAt(tick)}</div>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {CLOCK_DAY} · UTC
                </Text>
              </div>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="NOC wall display">
            <VStack gap={0} style={styles.contentFill}>
              {transport}
              <Divider />
              <StackItem size="fill" style={{position: 'relative', minHeight: 0}}>
                <div
                  className="owd-wall"
                  data-live={isPlaying ? 'true' : 'false'}
                  style={styles.wallScroll}>
                  <div style={styles.wallInner}>
                    <VStack gap={3}>
                      {isAckedAlarm && sev1 != null && (
                        <HStack gap={2} vAlign="center" style={styles.alarmStrip}>
                          <Icon icon={AlertTriangleIcon} size="sm" color="error" />
                          <Badge variant="error" label="SEV1" />
                          <StackItem size="fill">
                            <Text type="label" maxLines={1}>
                              {sev1.title} — acknowledged, still open
                            </Text>
                          </StackItem>
                          <Text
                            type="supporting"
                            color="secondary"
                            hasTabularNumbers>
                            running {(tick - sev1.startTick) * TICK_SECONDS}s
                          </Text>
                        </HStack>
                      )}

                      <div className="owd-metrics">
                        {METRICS.map(metric => (
                          <MetricPanel
                            key={metric.id}
                            metric={metric}
                            tick={tick}
                            isTweened={isTweened}
                          />
                        ))}
                      </div>

                      <div className="owd-mid">
                        <section style={styles.panel} aria-label="Region status grid">
                          <VStack gap={3}>
                            <HStack gap={2} vAlign="center">
                              <Icon icon={ActivityIcon} size="sm" color="secondary" />
                              <StackItem size="fill">
                                <Text type="label">Edge regions</Text>
                              </StackItem>
                              <Text
                                type="supporting"
                                color="secondary"
                                hasTabularNumbers>
                                {
                                  REGIONS.filter(
                                    region =>
                                      regionStatusAt(region.id, tick) !== 'ok',
                                  ).length
                                }{' '}
                                of {REGIONS.length} off-nominal
                              </Text>
                            </HStack>
                            <div className="owd-regions">
                              {REGIONS.map(region => (
                                <RegionCell
                                  key={region.id}
                                  region={region}
                                  tick={tick}
                                  isSelected={region.id === selectedRegionId}
                                  onSelect={id =>
                                    setSelectedRegionId(prev =>
                                      prev === id ? null : id,
                                    )
                                  }
                                />
                              ))}
                            </div>
                            <Divider />
                            {selectedRegion == null ? (
                              <Text type="supporting" color="secondary">
                                Tap a region cell to pin its heartbeat and open
                                incidents here.
                              </Text>
                            ) : (
                              <RegionDetail
                                region={selectedRegion}
                                tick={tick}
                                onClear={() => setSelectedRegionId(null)}
                              />
                            )}
                          </VStack>
                        </section>

                        <SpotlightPanel
                          tick={tick}
                          activeIndex={activeSpotlight}
                          isHeld={heldSpotlight != null}
                          onShift={shiftSpotlight}
                          onToggleHold={toggleHold}
                        />
                      </div>
                    </VStack>
                  </div>

                  {isTakeover && sev1 != null && (
                    <TakeoverBanner
                      incident={sev1}
                      tick={tick}
                      onAcknowledge={acknowledge}
                      onJumpToOnset={() => {
                        setIsPlaying(false);
                        setTick(sev1.startTick);
                      }}
                    />
                  )}
                </div>
              </StackItem>
              <Divider />
              <IncidentTicker
                tick={tick}
                isLive={isPlaying}
                isHeld={isTickerHeld}
              />
            </VStack>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
          </LayoutContent>
        }
      />
    </>
  );
}
