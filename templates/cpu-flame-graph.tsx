// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 4.0s CPU capture of a Node-style
 *   checkout-api process: a nested stack-frame tree of 49 frames — function
 *   name, call count, inclusive total time, children; self time derives as
 *   total minus the children's totals — plus per-frame baseline totals and
 *   call counts from last week's capture, so the diff view is a fixed
 *   red/blue story: a promo-regex regression and a faster jwt.verify)
 * @output Zoomable CPU FLAME GRAPH (icicle orientation, root on top): a
 *   header with flame icon + Heading, capture meta, and a frames · depth
 *   readout; a toolbar with a frame search TextInput (match-count Badge,
 *   clear button), Up one level / Reset zoom Buttons, and a compare-to-
 *   baseline Switch; a breadcrumb of ancestor frames; the flame canvas
 *   itself — every frame an absolutely positioned proportional-width button
 *   cell whose left/width animate through CSS transitions on every re-root,
 *   with a heat ramp by self time, container-query label steps (full name →
 *   short name → blank), a hover/focus tooltip with self/total/calls, and
 *   search dimming of non-matches; and a 300px detail rail with the zoom
 *   root's timings, share-of-profile meter, signed baseline deltas when
 *   diffing, and a hottest-frames list that re-roots on click
 * @position Page template; emitted by `astryx template cpu-flame-graph`
 *
 * Frame: Layout height="fill". LayoutHeader carries the profiler chrome
 * (title, capture meta, frames/depth readout, diff badge). LayoutContent
 * (padding 4) stacks the toolbar, the breadcrumb strip, the flame canvas,
 * and — when diffing — the diverging legend. LayoutPanel end 300 is the
 * frame-detail rail. Choose over query-plan-profiler when the subject is
 * CPU TIME by stack depth, not query plan operators; over
 * test-runner-console when rows are stack frames, not test verdicts.
 *
 * Interaction contract:
 * - Clicking any frame (or pressing Enter on it — every cell is a real
 *   button, tabbed in depth-first order) re-roots the graph to that frame;
 *   every mounted cell animates left/width via one CSS transition so the
 *   zoom reads as a continuous spatial stretch, never a repaint. Ancestor
 *   frames stay mounted as full-width dimmed rows above the root and click
 *   back outward through the same transition in reverse.
 * - The breadcrumb mirrors the ancestor chain; Up one level and Reset zoom
 *   drive the identical re-root path, and Escape on any cell zooms out one.
 * - Hover or keyboard focus raises a hand-rolled tooltip (self/total time,
 *   share of profile, call count, signed baseline delta when diffing); the
 *   detail rail restates the zoom root's numbers so touch users get the
 *   same data by tapping (tap = re-root = rail update).
 * - The search box highlights matching frames at every depth with an inset
 *   accent ring, dims non-matches, and paints a match-count Badge; clear
 *   restores full opacity. Matches are announced via the live region.
 * - The baseline Switch recolors every cell on a red/blue slower/faster
 *   diverging scale from fixture deltas, adds a legend, and swaps the rail
 *   to signed-delta rows (current vs baseline, Δ badges).
 * - The hottest-frames list ranks self time within the current root and
 *   re-roots on click — the same commit path as clicking the cell.
 *
 * Responsive contract:
 * - >1024px: header | flame canvas (fill, 24px rows) | detail rail 300.
 *   The canvas is percentage-laid so nothing owns overflow-x.
 * - <=1024px: the detail rail leaves the end slot and renders inline below
 *   the canvas (Divider-separated), keeping deltas and hottest frames one
 *   scroll away in a single pane.
 * - <=640px: rows grow to 44px so every cell is a >=40px tap target and
 *   depth becomes vertical page scroll under the breadcrumb strip, which
 *   turns sticky (top 0) as the pinned root row; the toolbar wraps, the
 *   header meta hides, and Up / Reset grow to 40px. Nothing is hover-only:
 *   the tooltip mirrors focus, and every tooltip number is restated in the
 *   detail rail for the tapped (re-rooted) frame.
 *
 * Container policy (profiler archetype): dense tool chrome — frame-first
 * rows and panels, bordered divs for the canvas and rail sections; no
 * Cards. All derived numbers (breadcrumb, rail timings, hottest list,
 * match count) recompute from the zoom root + search + diff state.
 * Fixture policy: fixed data only — no clocks, randomness, or network
 * assets; layout math is a pure recursive width-partition of the tree.
 * Color policy: token-pure — every color is a var(--color-*) token or an
 * explicit light-dark() pair (the heat ramp and the diverging diff scale
 * are hand-audited light/dark pairs so hot/cold and slower/faster
 * semantics survive dark mode).
 */

import {useMemo, useState, type CSSProperties, type KeyboardEvent} from 'react';

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
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronRightIcon,
  CornerLeftUpIcon,
  FlameIcon,
  GitCompareArrowsIcon,
  RotateCcwIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';

// ============= CSS (transitions + container-query label steps) =============
// The zoom is CSS transitions only — no animation engine. Every cell
// transitions left/width on re-root; prefers-reduced-motion snaps instead.
// Each cell is an inline-size container, so its label steps down from full
// name to short name to blank as the cell narrows at any zoom level.

const FLAME_CSS = `
.cfg-cell {
  transition:
    left 360ms cubic-bezier(0.25, 0.1, 0.25, 1),
    width 360ms cubic-bezier(0.25, 0.1, 0.25, 1),
    opacity 180ms ease;
}
.cfg-cell:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
  z-index: 3;
}
.cfg-label-full, .cfg-label-short {
  display: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
@container (min-width: 34px) {
  .cfg-label-short { display: inline-block; max-width: 100%; }
}
@container (min-width: 150px) {
  .cfg-label-full { display: inline-block; max-width: 100%; }
  .cfg-label-short { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .cfg-cell { transition: none; }
}
`;

// ============= STYLES =============

// Monospace metrics come from the same tokens Code uses, so frame labels,
// timings, and deltas read as one surface.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  headerRow: {width: '100%'},
  buttonTapTarget: {height: 40},
  // Breadcrumb strip: ancestor chain of the zoom root. On <=640px it goes
  // sticky and becomes the pinned "root row" above the scrolling depths.
  crumbStrip: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1) 0',
  },
  crumbStripSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 4,
    backgroundColor: 'var(--color-background)',
  },
  // Flame canvas: a positioned box the depth rows stack into. Percentage
  // layout means it never owns horizontal overflow at any width.
  canvasFrame: {
    position: 'relative',
    width: '100%',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  canvas: {position: 'relative', width: '100%'},
  // Frame cells: absolutely positioned proportional-width buttons. The
  // border matches the card surface so adjacent frames read as separate
  // blocks; left/width transitions live in FLAME_CSS.
  cell: {
    position: 'absolute',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid var(--color-background-card)',
    borderRadius: 3,
    padding: '0 var(--spacing-1)',
    margin: 0,
    ...mono,
    fontSize: 11,
    color: 'var(--color-text)',
    textAlign: 'left',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    containerType: 'inline-size',
  },
  // Ancestors of the zoom root: full-width, muted, clickable to zoom out.
  cellAncestor: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  cellMatch: {boxShadow: 'inset 0 0 0 2px var(--color-accent)', zIndex: 2},
  cellDimmed: {opacity: 0.3},
  cellHidden: {visibility: 'hidden', pointerEvents: 'none'},
  // Hand-rolled tooltip: follows the hovered/focused cell, never the only
  // path to the numbers (the rail restates them for the zoom root).
  tooltip: {
    position: 'absolute',
    zIndex: 5,
    maxWidth: 280,
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-high)',
    pointerEvents: 'none',
  },
  tooltipName: {...mono, overflowWrap: 'anywhere', whiteSpace: 'normal'},
  tooltipRow: {
    ...mono,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
  },
  // Diff legend: diverging swatch strip, faster (blue) → slower (red).
  legendSwatch: {
    width: 18,
    height: 12,
    flexShrink: 0,
    display: 'inline-block',
  },
  legendStrip: {
    display: 'inline-flex',
    borderRadius: 3,
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  // Rail sections: bordered stacks, dense tool chrome — no Cards.
  railSection: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  statRow: {
    ...mono,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 'var(--spacing-3)',
  },
  statLabel: {color: 'var(--color-text-secondary)'},
  // Share-of-profile meter under the rail timings.
  meterTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    display: 'block',
    backgroundColor: 'var(--color-accent)',
  },
  // Hottest-frames rows: real buttons, self-time mini bar under the name.
  hotRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-control)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
  },
  hotName: {
    ...mono,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  hotTrack: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  hotFill: {height: '100%', display: 'block'},
  searchBox: {minWidth: 180, flex: 1, maxWidth: 320},
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

/** Flame row heights: dense on desktop, >=40px tap targets on <=640px. */
const ROW_HEIGHT = 24;
const ROW_HEIGHT_COMPACT = 44;

// ============= DATA =============
// Deterministic fixture: one 4.0s CPU capture of checkout-api. totalMs is
// inclusive; self time derives as total minus children. baseTotalMs /
// baseCalls carry last week's capture for the diff view — the story is a
// promo-regex regression (+230ms in RegexEngine.exec) and a faster
// jwt.verify (−80ms) after a native-crypto upgrade.

const PROFILE_META = {
  app: 'checkout-api',
  capture: '4.0s CPU sample',
  interval: '1ms interval',
  baselineLabel: 'baseline: last week',
};

interface FrameFixture {
  id: string;
  name: string;
  calls: number;
  /** Inclusive time in ms. */
  totalMs: number;
  /** Baseline inclusive time; defaults to totalMs (unchanged). */
  baseTotalMs?: number;
  /** Baseline call count; defaults to calls. */
  baseCalls?: number;
  children?: FrameFixture[];
}

/** Fixture constructor — pure data shaping, keeps the 49-frame tree legible. */
function f(
  id: string,
  name: string,
  calls: number,
  totalMs: number,
  children?: FrameFixture[],
  baseline?: {totalMs?: number; calls?: number},
): FrameFixture {
  return {
    id,
    name,
    calls,
    totalMs,
    baseTotalMs: baseline?.totalMs,
    baseCalls: baseline?.calls,
    children,
  };
}

const PROFILE: FrameFixture = f('root', '(profile root)', 1, 4000, [
  f('handle', 'http.Server.handleRequest', 312, 3620, [
    f('dispatch', 'Router.dispatch', 312, 3400, [
      f('checkout', 'checkoutController.create', 84, 2080, [
        f('cart-load', 'CartService.load', 84, 620, [
          f('pool-connect', 'pg.Pool.connect', 84, 60),
          f('q-cart', 'pg.Client.query [carts]', 84, 480, [
            f('parse-cart', 'pg.Client.parse', 84, 70),
            f('exec-cart', 'pg.Client.execute', 84, 330, [
              f('write-cart', 'net.Socket.write', 84, 90),
              f('read-cart', 'net.Socket.read', 168, 180),
            ]),
            f('rows-cart', 'pg.Result.parseRows', 84, 50),
          ]),
          f('cart-hydrate', 'Cart.hydrate', 84, 60),
        ]),
        f('pricing', 'PricingEngine.calculate', 84, 840, [
          f('promos', 'PricingEngine.applyPromotions', 84, 470, [
            f('regex', 'RegexEngine.exec', 4210, 320, undefined, {
              totalMs: 90,
              calls: 1120,
            }),
            f('promo-elig', 'Promo.checkEligibility', 252, 90),
          ], {totalMs: 230}),
          f('tax', 'TaxTable.lookup', 84, 200, [
            f('tax-search', 'TaxTable.binarySearch', 840, 130),
          ]),
          f('round', 'Money.round', 1680, 70),
        ], {totalMs: 590}),
        f('order-insert', 'OrderRepo.insert', 84, 460, [
          f('q-order', 'pg.Client.query [orders]', 84, 420, [
            f('parse-order', 'pg.Client.parse', 84, 60),
            f('exec-order', 'pg.Client.execute', 84, 300, [
              f('write-order', 'net.Socket.write', 84, 80),
              f('read-order', 'net.Socket.read', 168, 160),
            ]),
            f('rows-order', 'pg.Result.parseRows', 84, 30),
          ]),
        ]),
        f('stringify-order', 'JSON.stringify [response]', 84, 90),
      ], {totalMs: 1830}),
      f('products', 'productController.list', 196, 890, [
        f('prod-search', 'ProductRepo.search', 196, 610, [
          f('q-search', 'pg.Client.query [products]', 196, 540, [
            f('parse-search', 'pg.Client.parse', 196, 80),
            f('exec-search', 'pg.Client.execute', 196, 380, [
              f('write-search', 'net.Socket.write', 196, 90),
              f('read-search', 'net.Socket.read', 392, 230),
            ]),
            f('rows-search', 'pg.Result.parseRows', 196, 50),
          ]),
        ]),
        f('serialize', 'serializeProducts', 196, 220, [
          f('cdn-url', 'Image.cdnUrl', 2352, 90),
          f('stringify-products', 'JSON.stringify [products]', 196, 80),
        ]),
      ]),
      f('auth', 'authMiddleware.verify', 312, 370, [
        f('jwt', 'jwt.verify', 312, 300, [
          f('b64', 'base64.decode', 936, 40),
          f('crypto-verify', 'crypto.verifySignature', 312, 230, undefined, {
            totalMs: 310,
          }),
        ], {totalMs: 380}),
        f('session', 'Session.touch', 312, 40),
      ], {totalMs: 450}),
    ], {totalMs: 3230}),
    f('parse-headers', 'http.parseHeaders', 312, 150),
  ], {totalMs: 3450}),
  f('gc', 'gc.minorSweep', 18, 240, [
    f('gc-mark', 'gc.markRoots', 18, 90),
    f('gc-copy', 'gc.copyYoung', 18, 120),
  ]),
  f('io-poll', 'uv.ioPoll (idle)', 2140, 120),
], {totalMs: 3830});

// ============= LAYOUT (pure recursive width-partition) =============
// Every frame gets a fixed [x0, x1) span of the full profile, partitioned
// left-to-right by inclusive time within its parent; the leftover tail of
// each parent is its self time. Zooming never relayouts — it only remaps
// these fixed spans onto the current window, which is what lets one CSS
// transition carry every cell to its new place.

interface LaidFrame {
  frame: FrameFixture;
  depth: number;
  /** Span of the full profile, in [0, 1]. */
  x0: number;
  x1: number;
  selfMs: number;
  parentId: string | null;
  /** Ancestor ids, profile root first. */
  ancestorIds: string[];
}

function layoutFrames(
  frame: FrameFixture,
  depth: number,
  x0: number,
  x1: number,
  parentId: string | null,
  ancestorIds: string[],
  into: LaidFrame[],
): void {
  const children = frame.children ?? [];
  const childTotal = children.reduce((sum, child) => sum + child.totalMs, 0);
  into.push({
    frame,
    depth,
    x0,
    x1,
    selfMs: frame.totalMs - childTotal,
    parentId,
    ancestorIds,
  });
  let cursor = x0;
  const span = x1 - x0;
  for (const child of children) {
    const childSpan = (child.totalMs / frame.totalMs) * span;
    layoutFrames(
      child,
      depth + 1,
      cursor,
      cursor + childSpan,
      frame.id,
      [...ancestorIds, frame.id],
      into,
    );
    cursor += childSpan;
  }
}

const FRAMES: LaidFrame[] = (() => {
  const into: LaidFrame[] = [];
  layoutFrames(PROFILE, 0, 0, 1, null, [], into);
  return into;
})();

const FRAME_BY_ID = new Map(FRAMES.map(laid => [laid.frame.id, laid]));
const MAX_DEPTH = Math.max(...FRAMES.map(laid => laid.depth));
const MAX_SELF_MS = Math.max(...FRAMES.map(laid => laid.selfMs));
const MAX_ABS_DELTA = Math.max(
  ...FRAMES.map(laid => Math.abs(frameDelta(laid.frame))),
);
const PROFILE_TOTAL_MS = PROFILE.totalMs;

// ============= HELPERS =============

/** Signed inclusive-time delta vs the baseline capture (+ = slower). */
function frameDelta(frame: FrameFixture): number {
  return frame.totalMs - (frame.baseTotalMs ?? frame.totalMs);
}

function formatMs(ms: number): string {
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${ms}ms`;
}

function formatSigned(ms: number): string {
  if (ms === 0) {
    return '±0ms';
  }
  return `${ms > 0 ? '+' : '−'}${formatMs(Math.abs(ms))}`;
}

function formatCalls(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function formatShare(ms: number): string {
  return `${((ms / PROFILE_TOTAL_MS) * 100).toFixed(1)}%`;
}

/** Short label step: the segment after the last dot ("applyPromotions"). */
function shortName(name: string): string {
  const base = name.split(' ')[0]!;
  const dot = base.lastIndexOf('.');
  return dot >= 0 ? base.slice(dot + 1) : base;
}

// Heat ramp: cold (low self time) → hot (high self time). Explicit
// light-dark() pairs — pale surfaces in light mode, deep embers in dark —
// so var(--color-text) keeps contrast in both schemes.
const HEAT_RAMP = [
  'light-dark(#fdf1df, #3a2517)',
  'light-dark(#fbe2bd, #4f2f18)',
  'light-dark(#f8cd92, #6b3c1a)',
  'light-dark(#f5b06b, #8a471c)',
  'light-dark(#f18f4e, #a8521e)',
] as const;

function heatColor(selfMs: number): string {
  const ratio = MAX_SELF_MS === 0 ? 0 : selfMs / MAX_SELF_MS;
  const index = Math.min(
    HEAT_RAMP.length - 1,
    Math.floor(ratio * HEAT_RAMP.length),
  );
  return HEAT_RAMP[index]!;
}

// Diverging diff scale: faster (blue) → unchanged (neutral token) →
// slower (red). Explicit light-dark() pairs at every step.
const DIFF_RAMP = [
  'light-dark(#93c5fd, #1d4ed8)',
  'light-dark(#bfdbfe, #1e40af)',
  'light-dark(#dfeafd, #21365f)',
  'var(--color-background-muted)',
  'light-dark(#fbe0e0, #56201f)',
  'light-dark(#f7bcbc, #7f1d1d)',
  'light-dark(#f0908f, #a11d1d)',
] as const;

function diffColor(deltaMs: number): string {
  if (MAX_ABS_DELTA === 0) {
    return DIFF_RAMP[3]!;
  }
  const t = Math.max(-1, Math.min(1, deltaMs / MAX_ABS_DELTA));
  const index = Math.round(((t + 1) / 2) * (DIFF_RAMP.length - 1));
  return DIFF_RAMP[index]!;
}

interface CellGeometry {
  leftPct: number;
  widthPct: number;
  isHidden: boolean;
}

/**
 * Remaps a frame's fixed profile span onto the zoom window. Frames outside
 * the window collapse to zero width at the nearest edge (so re-entering
 * animates from that edge); ancestors span the full window.
 */
function cellGeometry(laid: LaidFrame, w0: number, w1: number): CellGeometry {
  const span = w1 - w0;
  const start = Math.max(laid.x0, w0);
  const end = Math.min(laid.x1, w1);
  if (end - start <= 1e-9) {
    return {
      leftPct: laid.x1 <= w0 ? 0 : 100,
      widthPct: 0,
      isHidden: true,
    };
  }
  return {
    leftPct: ((start - w0) / span) * 100,
    widthPct: ((end - start) / span) * 100,
    isHidden: false,
  };
}

// ============= FLAME CELL =============

function FlameCell({
  laid,
  geometry,
  rowHeight,
  isRoot,
  isAncestor,
  isDiffing,
  isMatch,
  isDimmed,
  onActivate,
  onEscape,
  onHover,
}: {
  laid: LaidFrame;
  geometry: CellGeometry;
  rowHeight: number;
  isRoot: boolean;
  isAncestor: boolean;
  isDiffing: boolean;
  isMatch: boolean;
  isDimmed: boolean;
  onActivate: (id: string) => void;
  onEscape: () => void;
  onHover: (id: string | null) => void;
}) {
  const {frame, depth, selfMs} = laid;
  const delta = frameDelta(frame);
  const background = isAncestor
    ? undefined
    : isDiffing
      ? diffColor(delta)
      : heatColor(selfMs);
  const deltaWord = isDiffing
    ? `, ${formatSigned(delta)} vs baseline`
    : '';
  const roleWord = isAncestor
    ? ', ancestor of the zoom root — press Enter to zoom out to it'
    : isRoot
      ? ', current zoom root'
      : ', press Enter to zoom in';
  return (
    <button
      type="button"
      className="cfg-cell"
      aria-current={isRoot ? 'true' : undefined}
      aria-label={
        `${frame.name}, depth ${depth}: total ${formatMs(frame.totalMs)} ` +
        `(${formatShare(frame.totalMs)} of profile), self ${formatMs(selfMs)}, ` +
        `${formatCalls(frame.calls)} calls${deltaWord}${roleWord}`
      }
      onClick={() => onActivate(frame.id)}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onEscape();
        }
      }}
      onMouseEnter={() => onHover(frame.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(frame.id)}
      onBlur={() => onHover(null)}
      style={{
        ...styles.cell,
        ...(isAncestor ? styles.cellAncestor : undefined),
        ...(isMatch ? styles.cellMatch : undefined),
        ...(isDimmed ? styles.cellDimmed : undefined),
        ...(geometry.isHidden ? styles.cellHidden : undefined),
        left: `${geometry.leftPct}%`,
        width: `${geometry.widthPct}%`,
        top: depth * rowHeight,
        height: rowHeight - 1,
        backgroundColor: background,
      }}>
      {/* Container-query label steps: full → short → blank. */}
      <span className="cfg-label-full" aria-hidden="true">
        {frame.name}
      </span>
      <span className="cfg-label-short" aria-hidden="true">
        {shortName(frame.name)}
      </span>
    </button>
  );
}

// ============= DETAIL RAIL =============

function FrameDetail({
  laid,
  isDiffing,
  isCompact,
  hottest,
  maxHotSelf,
  onActivate,
}: {
  laid: LaidFrame;
  isDiffing: boolean;
  isCompact: boolean;
  hottest: LaidFrame[];
  maxHotSelf: number;
  onActivate: (id: string) => void;
}) {
  const {frame, selfMs, depth, ancestorIds} = laid;
  const delta = frameDelta(frame);
  const baseTotal = frame.baseTotalMs ?? frame.totalMs;
  const baseCalls = frame.baseCalls ?? frame.calls;
  const callsDelta = frame.calls - baseCalls;
  const path = ancestorIds
    .map(id => shortName(FRAME_BY_ID.get(id)?.frame.name ?? id))
    .join(' › ');
  return (
    <VStack gap={3}>
      <div style={styles.railSection}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge variant="info" label={`depth ${depth}`} />
            {isDiffing && delta !== 0 && (
              <Badge
                variant={delta > 0 ? 'error' : 'info'}
                label={`${formatSigned(delta)} ${delta > 0 ? 'slower' : 'faster'}`}
              />
            )}
          </HStack>
          <Code>{frame.name}</Code>
          {path.length > 0 && (
            <Text type="supporting" color="secondary">
              {path} › {shortName(frame.name)}
            </Text>
          )}
          <div style={styles.statRow}>
            <span style={styles.statLabel}>total</span>
            <span>
              {formatMs(frame.totalMs)} · {formatShare(frame.totalMs)}
            </span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>self</span>
            <span>
              {formatMs(selfMs)} · {formatShare(selfMs)}
            </span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>calls</span>
            <span>{formatCalls(frame.calls)}</span>
          </div>
          <div style={styles.meterTrack} aria-hidden="true">
            <span
              style={{
                ...styles.meterFill,
                width: `${(frame.totalMs / PROFILE_TOTAL_MS) * 100}%`,
              }}
            />
          </div>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatShare(frame.totalMs)} of the {formatMs(PROFILE_TOTAL_MS)}{' '}
            capture
          </Text>
        </VStack>
      </div>

      {/* Signed-delta block: current vs baseline, only while diffing. */}
      {isDiffing && (
        <div style={styles.railSection}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={GitCompareArrowsIcon} size="sm" color="secondary" />
              <Text type="label">vs baseline</Text>
            </HStack>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>total Δ</span>
              <span>
                {formatMs(baseTotal)} → {formatMs(frame.totalMs)} (
                {formatSigned(delta)})
              </span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>calls Δ</span>
              <span>
                {formatCalls(baseCalls)} → {formatCalls(frame.calls)}
                {callsDelta !== 0
                  ? ` (${callsDelta > 0 ? '+' : '−'}${formatCalls(
                      Math.abs(callsDelta),
                    )})`
                  : ''}
              </span>
            </div>
            <Text type="supporting" color="secondary">
              {delta > 0
                ? 'Slower than the baseline capture — red on the canvas.'
                : delta < 0
                  ? 'Faster than the baseline capture — blue on the canvas.'
                  : 'Unchanged from the baseline capture.'}
            </Text>
          </VStack>
        </div>
      )}

      {/* Hottest frames under the zoom root — click re-roots, the same
          commit path as clicking the cell itself. */}
      <div style={styles.railSection}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={FlameIcon} size="sm" color="secondary" />
            <Text type="label">Hottest under root</Text>
          </HStack>
          {hottest.map(hot => (
            <button
              key={hot.frame.id}
              type="button"
              aria-label={
                `Zoom to ${hot.frame.name}: self ${formatMs(hot.selfMs)}, ` +
                `${formatCalls(hot.frame.calls)} calls`
              }
              onClick={() => onActivate(hot.frame.id)}
              style={{
                ...styles.hotRow,
                ...(isCompact ? styles.buttonTapTarget : undefined),
              }}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <span style={styles.hotName}>{hot.frame.name}</span>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {formatMs(hot.selfMs)}
                </Text>
              </HStack>
              <span style={styles.hotTrack} aria-hidden="true">
                <span
                  style={{
                    ...styles.hotFill,
                    width: `${(hot.selfMs / maxHotSelf) * 100}%`,
                    backgroundColor: heatColor(hot.selfMs),
                  }}
                />
              </span>
            </button>
          ))}
        </VStack>
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function CpuFlameGraphTemplate() {
  // The zoom root: the whole graph remaps onto this frame's fixed span.
  const [rootId, setRootId] = useState('root');
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [isDiffing, setIsDiffing] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  // Responsive contract: <=1024px moves the detail rail inline below the
  // canvas; <=640px grows rows to 44px tap targets and pins the breadcrumb
  // as a sticky root row above the vertically scrolling depths.
  const isSinglePane = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const rowHeight = isCompact ? ROW_HEIGHT_COMPACT : ROW_HEIGHT;

  // ---- derived state ----
  const root = FRAME_BY_ID.get(rootId) ?? FRAMES[0]!;
  const window0 = root.x0;
  const window1 = root.x1;

  const matchIds = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length === 0) {
      return null;
    }
    return new Set(
      FRAMES.filter(laid =>
        laid.frame.name.toLowerCase().includes(trimmed),
      ).map(laid => laid.frame.id),
    );
  }, [query]);

  // Hottest self-time frames inside the current root's span (root included
  // only via its descendants — the rail already shows the root itself).
  const hottest = useMemo(() => {
    const within = FRAMES.filter(
      laid =>
        laid.frame.id !== root.frame.id &&
        laid.depth > root.depth &&
        laid.x0 >= root.x0 - 1e-9 &&
        laid.x1 <= root.x1 + 1e-9,
    );
    within.sort((a, b) => b.selfMs - a.selfMs);
    return within.slice(0, 6);
  }, [root]);
  const maxHotSelf = hottest.length > 0 ? hottest[0]!.selfMs : 1;

  const crumb = [...root.ancestorIds, root.frame.id];
  const hovered = hoverId !== null ? FRAME_BY_ID.get(hoverId) : undefined;
  const hoveredGeometry =
    hovered !== undefined
      ? cellGeometry(hovered, window0, window1)
      : undefined;

  // ---- interactions ----
  const zoomTo = (id: string) => {
    const target = FRAME_BY_ID.get(id);
    if (target === undefined || id === rootId) {
      return;
    }
    setRootId(id);
    setHoverId(null);
    setLiveMessage(
      `Zoomed to ${target.frame.name} — total ${formatMs(
        target.frame.totalMs,
      )}, ${formatShare(target.frame.totalMs)} of the profile, depth ${
        target.depth
      }.`,
    );
  };

  const zoomOutOne = () => {
    if (root.parentId !== null) {
      zoomTo(root.parentId);
    }
  };

  const resetZoom = () => zoomTo('root');

  const changeQuery = (next: string) => {
    setQuery(next);
    const trimmed = next.trim().toLowerCase();
    if (trimmed.length === 0) {
      setLiveMessage('Search cleared — all frames restored.');
      return;
    }
    const count = FRAMES.filter(laid =>
      laid.frame.name.toLowerCase().includes(trimmed),
    ).length;
    setLiveMessage(`${count} frames match “${next.trim()}”.`);
  };

  const toggleDiff = (next: boolean) => {
    setIsDiffing(next);
    setLiveMessage(
      next
        ? 'Comparing to baseline — red frames are slower, blue frames are faster.'
        : 'Baseline comparison off — heat ramp restored.',
    );
  };

  // ---- flame cells (all mounted, DFS order = keyboard walk order) ----
  const cells = FRAMES.map(laid => {
    const geometry = cellGeometry(laid, window0, window1);
    const isRoot = laid.frame.id === root.frame.id;
    const isAncestor = laid.depth < root.depth;
    const isMatch = matchIds !== null && matchIds.has(laid.frame.id);
    const isDimmed = matchIds !== null && !isMatch && !geometry.isHidden;
    return (
      <FlameCell
        key={laid.frame.id}
        laid={laid}
        geometry={geometry}
        rowHeight={rowHeight}
        isRoot={isRoot}
        isAncestor={isAncestor}
        isDiffing={isDiffing}
        isMatch={isMatch}
        isDimmed={isDimmed}
        onActivate={id =>
          laid.depth < root.depth || id !== root.frame.id
            ? zoomTo(id)
            : undefined
        }
        onEscape={zoomOutOne}
        onHover={setHoverId}
      />
    );
  });

  // ---- hover/focus tooltip (never the only path to the numbers) ----
  const tooltip =
    hovered !== undefined &&
    hoveredGeometry !== undefined &&
    !hoveredGeometry.isHidden ? (
      <div
        role="presentation"
        style={{
          ...styles.tooltip,
          left: `${Math.min(hoveredGeometry.leftPct, 62)}%`,
          top: (hovered.depth + 1) * rowHeight + 4,
        }}>
        <VStack gap={1}>
          <span style={styles.tooltipName}>{hovered.frame.name}</span>
          <div style={styles.tooltipRow}>
            <span>total</span>
            <span>
              {formatMs(hovered.frame.totalMs)} ·{' '}
              {formatShare(hovered.frame.totalMs)}
            </span>
          </div>
          <div style={styles.tooltipRow}>
            <span>self</span>
            <span>{formatMs(hovered.selfMs)}</span>
          </div>
          <div style={styles.tooltipRow}>
            <span>calls</span>
            <span>{formatCalls(hovered.frame.calls)}</span>
          </div>
          {isDiffing && (
            <div style={styles.tooltipRow}>
              <span>Δ baseline</span>
              <span>{formatSigned(frameDelta(hovered.frame))}</span>
            </div>
          )}
        </VStack>
      </div>
    ) : null;

  // ---- breadcrumb (sticky root row on <=640px) ----
  const breadcrumb = (
    <nav
      aria-label="Zoom path"
      style={{
        ...styles.crumbStrip,
        ...(isCompact ? styles.crumbStripSticky : undefined),
      }}>
      {crumb.map((id, index) => {
        const entry = FRAME_BY_ID.get(id);
        if (entry === undefined) {
          return null;
        }
        const isCurrent = index === crumb.length - 1;
        return (
          <HStack key={id} gap={1} vAlign="center">
            {index > 0 && (
              <Icon icon={ChevronRightIcon} size="xsm" color="secondary" />
            )}
            {isCurrent ? (
              <Badge variant="info" label={shortName(entry.frame.name)} />
            ) : (
              <Button
                label={shortName(entry.frame.name)}
                variant="ghost"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                onClick={() => zoomTo(id)}
              />
            )}
          </HStack>
        );
      })}
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {formatMs(root.frame.totalMs)} · {formatShare(root.frame.totalMs)}
      </Text>
    </nav>
  );

  // ---- diff legend ----
  const diffLegend = isDiffing ? (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Text type="supporting" color="secondary">
        faster
      </Text>
      <span style={styles.legendStrip} aria-hidden="true">
        {DIFF_RAMP.map(color => (
          <span
            key={color}
            style={{...styles.legendSwatch, backgroundColor: color}}
          />
        ))}
      </span>
      <Text type="supporting" color="secondary">
        slower
      </Text>
      <Text type="supporting" color="secondary">
        · {PROFILE_META.baselineLabel}
      </Text>
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Text type="supporting" color="secondary">
        cold
      </Text>
      <span style={styles.legendStrip} aria-hidden="true">
        {HEAT_RAMP.map(color => (
          <span
            key={color}
            style={{...styles.legendSwatch, backgroundColor: color}}
          />
        ))}
      </span>
      <Text type="supporting" color="secondary">
        hot · ramp by self time
      </Text>
    </HStack>
  );

  // ---- detail rail body (docked >1024px, inline below) ----
  const detailBody = (
    <FrameDetail
      laid={root}
      isDiffing={isDiffing}
      isCompact={isCompact}
      hottest={hottest}
      maxHotSelf={maxHotSelf}
      onActivate={zoomTo}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={FlameIcon} size="md" color="secondary" />
                <Heading level={1}>CPU Flame Graph</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {PROFILE_META.app} · {PROFILE_META.capture} ·{' '}
                    {PROFILE_META.interval}
                  </Text>
                )}
              </HStack>
            </StackItem>
            {isDiffing && (
              <Badge variant="warning" label={PROFILE_META.baselineLabel} />
            )}
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {FRAMES.length} frames · depth {MAX_DEPTH}
            </Text>
          </HStack>
        </LayoutHeader>
      }
      end={
        isSinglePane ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Frame detail">
            <div style={styles.railScroll}>
              <VStack gap={3}>
                <Heading level={2}>Zoom root</Heading>
                {detailBody}
              </VStack>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4} label="Flame graph">
          {/* CSS transitions + container-query label steps; reduced motion
              snaps zooms instead of animating them. */}
          <style>{FLAME_CSS}</style>
          <VStack gap={3}>
            {/* Toolbar: search, match count, zoom controls, diff switch. */}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Icon icon={SearchIcon} size="sm" color="secondary" />
              <div style={styles.searchBox}>
                <TextInput
                  label="Search frames"
                  isLabelHidden
                  size="sm"
                  placeholder="Search frames (e.g. pg.Client)"
                  value={query}
                  onChange={changeQuery}
                  style={isCompact ? styles.buttonTapTarget : undefined}
                />
              </div>
              {matchIds !== null && (
                <>
                  <Badge
                    variant={matchIds.size > 0 ? 'info' : 'neutral'}
                    label={`${matchIds.size} match${
                      matchIds.size === 1 ? '' : 'es'
                    }`}
                  />
                  <Button
                    label="Clear"
                    variant="ghost"
                    size="sm"
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    onClick={() => changeQuery('')}
                  />
                </>
              )}
              <StackItem size="fill" />
              <Button
                label="Up one level"
                variant="ghost"
                size="sm"
                isDisabled={root.parentId === null}
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={
                  <Icon icon={CornerLeftUpIcon} size="sm" color="inherit" />
                }
                onClick={zoomOutOne}
              />
              <Button
                label="Reset zoom"
                variant="ghost"
                size="sm"
                isDisabled={rootId === 'root'}
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                onClick={resetZoom}
              />
              <Tooltip content="Recolor every frame by its signed time delta vs last week's capture">
                <span>
                  <Switch
                    label="Compare baseline"
                    value={isDiffing}
                    onChange={toggleDiff}
                  />
                </span>
              </Tooltip>
            </HStack>

            {breadcrumb}

            {/* Flame canvas: all 49 cells stay mounted in DFS order, so Tab
                walks the tree depth-first and one transition carries every
                cell to its new span on re-root. */}
            <div style={styles.canvasFrame}>
              <div
                role="group"
                aria-label={
                  `Flame graph, zoomed to ${root.frame.name}. Tab walks ` +
                  'frames depth-first; Enter zooms to a frame; Escape zooms out.'
                }
                style={{
                  ...styles.canvas,
                  height: (MAX_DEPTH + 1) * rowHeight,
                }}>
                {cells}
                {tooltip}
              </div>
            </div>

            {diffLegend}

            {/* <=1024px single-pane fallback: the detail rail renders inline
                below the canvas so deltas stay one scroll away. */}
            {isSinglePane && (
              <>
                <Divider />
                <VStack gap={3}>
                  <Heading level={2}>Zoom root</Heading>
                  {detailBody}
                </VStack>
              </>
            )}
          </VStack>

          {/* Zooms, search counts, and diff toggles are announced. */}
          <div aria-live="polite" style={styles.srOnly}>
            {liveMessage}
          </div>
        </LayoutContent>
      }
    />
  );
}
