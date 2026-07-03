// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file attribution-sankey-what-if.tsx
 * @input Deterministic fixtures only (six traffic sources with fixed weekly
 *   session volumes, a 6×4 source→stage mix matrix, a 4×3 stage→outcome rate
 *   matrix, and three hand-authored redistribution rules — pause Paid Social
 *   returns 20% of its volume as organic brand searches, enabling Retargeting
 *   adds 1,300 sessions and cannibalizes 200 from Direct, and the budget-shift
 *   slider converts Paid Social spend to Email sessions at 0.85 efficiency)
 * @output Marketing-attribution explorable: a three-column Sankey — sources →
 *   funnel stages → outcomes — hand-rolled in one SVG with cubic-bezier
 *   ribbons whose widths are proportional to fixture volumes. Hovering,
 *   focusing, or tapping a ribbon or node highlights its full
 *   source-to-outcome path and prints the flow in an aria-live status line;
 *   clicking pins the highlight. The what-if panel has Pause Paid Social and
 *   Enable Retargeting Switches plus a budget-shift Slider; every change
 *   recomputes downstream volumes through the deterministic redistribution
 *   rules and each node bar and ribbon animates to its new thickness via CSS
 *   `d` transitions on precomputed paths. Delta chips on each outcome node
 *   show change vs baseline, a compare footer tallies conversions gained or
 *   lost, and node labels stack with collision-aware spacing in plain SVG
 *   text (no foreignObject)
 * @position Page template; emitted by `astryx template attribution-sankey-what-if`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title, weekly
 * session caption, Sessions/Share SegmentedControl). LayoutContent stacks the
 * Sankey stage (its own horizontal scroller at an intrinsic 960px), the
 * highlight chip strip + aria-live selection line, and the baseline compare
 * footer. LayoutPanel end 320 hosts the what-if controls, per-source volume
 * rows, and the redistribution rules in effect.
 *
 * Responsive contract:
 * - >1024px: header | Sankey + chips + footer (fill) | what-if panel 320.
 * - <=1024px: the end panel leaves the frame; the same what-if block renders
 *   above the diagram inside the scrolling content column (single pane).
 * - <=640px: the diagram rotates to vertical (top-to-bottom flow) using the
 *   same layout math with axes swapped and scales to the viewport width via
 *   viewBox, so nothing pans at 375px; the header caption drops. The
 *   horizontal-mode diagram scroller is the only deliberate overflow-x
 *   region; page chrome never pans.
 * - Tap targets: Switches, Slider, reset Button, source rows, stage chips,
 *   and outcome chips are all >=40px. SVG bars and ribbons are supplementary
 *   hit areas — every node highlight is duplicated by a 40px chip or row, so
 *   thin marks are never the only path. No hover-only affordances: hover,
 *   focus, and tap all drive the identical highlight state, and the pinned
 *   selection persists in the status line.
 *
 * Container policy (explorable-sandbox archetype): frame-first rows and
 * panels, no Cards. The Sankey is one SVG of cubic-bezier ribbon paths and
 * rectangle node bars computed from a small fixture flow matrix — no layout
 * engine, no chart library. Scenario state is a pure function of the three
 * what-if inputs; there is no clock and no randomness. Thickness animation
 * is a CSS transition on the `d` property over precomputed paths, disabled
 * under prefers-reduced-motion (values still snap to the same end state).
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or a light-dark() pair over token mixes — ribbon
 * gradients use explicit light-dark() stops so flows stay legible on both
 * schemes.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
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
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {RotateCcwIcon, Share2Icon, XIcon} from 'lucide-react';

// ============= GEOMETRY =============
// Hand-computed node columns; no layout engine. The horizontal canvas keeps
// an intrinsic 960×560 and pans in its own scroller when the viewport is
// narrower; the vertical canvas (<=640px) is a 360×760 viewBox scaled to the
// container width so phones never pan.

const NODE_T = 16; // bar thickness along the flow axis
const CANVAS_W = 960;
const CANVAS_H = 560;
const COL_MAIN_H = [24, 472, 920]; // x of each column's bar (horizontal)
const GAP_H = 12;
const CANVAS_VW = 360;
const CANVAS_VH = 760;
const ROW_MAIN_V = [64, 356, 648]; // y of each row's bar (vertical)
const GAP_V = 8;

// Worst-case column total is 10,500 sessions (retargeting on, no pause):
// horizontal usable span 560 − 2×24 margins − 5×12 gaps = 452 → 0.042 px per
// session; vertical usable 360 − 2×16 − 5×8 = 288 → 0.027. Hand-computed.
const SCALE_H = 0.042;
const SCALE_V = 0.027;

// ============= KEYFRAMES / TRANSITIONS =============
// Node bars and ribbons are all <path> elements whose geometry lives in the
// CSS `d` property, so a scenario change animates every thickness along its
// precomputed path shape. prefers-reduced-motion snaps to the end state.

const GLOBAL_CSS = `
.asw-flow {
  transition: d 420ms ease, opacity 180ms ease;
}
.asw-label {
  transition: transform 420ms ease, opacity 180ms ease;
}
.asw-hit {
  cursor: pointer;
}
.asw-hit:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
}
@media (prefers-reduced-motion: reduce) {
  .asw-flow,
  .asw-label {
    transition: none;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {height: '100%', minHeight: 0},
  headerRow: {width: '100%', flexWrap: 'wrap'},
  // Deliberate overflow-x region: the horizontal Sankey pans between ~641px
  // and the intrinsic 960px; the vertical (<=640px) diagram never pans.
  stageScroll: {overflowX: 'auto', minWidth: 0},
  stageH: {width: CANVAS_W, flexShrink: 0, display: 'block'},
  stageV: {width: '100%', height: 'auto', display: 'block'},
  svgName: {
    fontSize: 12,
    fontWeight: 600,
    fill: 'var(--color-text-primary)',
    paintOrder: 'stroke',
    stroke: 'var(--color-background-body)',
    strokeWidth: 3,
    strokeLinejoin: 'round',
  },
  svgValue: {
    fontSize: 11,
    fill: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    paintOrder: 'stroke',
    stroke: 'var(--color-background-body)',
    strokeWidth: 3,
    strokeLinejoin: 'round',
  },
  chipText: {
    fontSize: 11,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  leader: {stroke: 'var(--color-border)', strokeWidth: 1},
  // Highlight chip strip: every node has a >=40px chip path, so the thin SVG
  // marks are never the only way to trace a flow.
  chipStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 40,
    padding: '0 var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  chipActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  },
  swatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  statusLine: {minHeight: 20},
  // What-if panel rows: whole source row is one >=40px button that pins the
  // matching node highlight.
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  sourceRowActive: {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  },
  numeric: {fontVariantNumeric: 'tabular-nums'},
  footerChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  footerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 44,
    padding: '0 var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  panelScroll: {minHeight: 0},
};

// ============= DATA =============
// Deterministic fixtures: fixed weekly session volumes, a source→stage mix
// matrix, and stage→outcome rates. Every what-if recompute is a pure
// function of (pausePaid, retargeting, shiftPct) — no Date.now, no
// Math.random, no network assets.

interface SourceDef {
  id: string;
  label: string;
  short: string;
  color: string;
  baseline: number;
}

// Retargeting starts at 0 sessions — the "Enable retargeting" rule funds it.
const SOURCES: SourceDef[] = [
  {
    id: 'organic',
    label: 'Organic Search',
    short: 'Organic',
    color: 'var(--color-data-categorical-blue)',
    baseline: 3400,
  },
  {
    id: 'paid-social',
    label: 'Paid Social',
    short: 'Paid Social',
    color: 'var(--color-data-categorical-purple)',
    baseline: 2600,
  },
  {
    id: 'email',
    label: 'Email',
    short: 'Email',
    color: 'var(--color-data-categorical-green)',
    baseline: 1400,
  },
  {
    id: 'direct',
    label: 'Direct',
    short: 'Direct',
    color: 'var(--color-data-categorical-orange)',
    baseline: 1100,
  },
  {
    id: 'referral',
    label: 'Referral',
    short: 'Referral',
    color:
      'color-mix(in srgb, var(--color-data-categorical-purple) 45%, var(--color-data-categorical-orange) 55%)',
    baseline: 900,
  },
  {
    id: 'retargeting',
    label: 'Retargeting',
    short: 'Retarget',
    color:
      'color-mix(in srgb, var(--color-data-categorical-blue) 45%, var(--color-data-categorical-green) 55%)',
    baseline: 0,
  },
];

const STAGES: Array<{id: string; label: string; short: string}> = [
  {id: 'tour', label: 'Product tour', short: 'Tour'},
  {id: 'pricing', label: 'Pricing', short: 'Pricing'},
  {id: 'signup', label: 'Signup flow', short: 'Signup'},
  {id: 'bounce', label: 'Bounced', short: 'Bounced'},
];

const OUTCOMES: Array<{
  id: string;
  label: string;
  short: string;
  color: string;
  goodWhenUp: boolean;
}> = [
  {
    id: 'converted',
    label: 'Converted',
    short: 'Converted',
    color: 'var(--color-icon-green)',
    goodWhenUp: true,
  },
  {
    id: 'nurture',
    label: 'Nurture list',
    short: 'Nurture',
    color: 'var(--color-icon-blue)',
    goodWhenUp: true,
  },
  {
    id: 'lost',
    label: 'Lost',
    short: 'Lost',
    color: 'var(--color-icon-red)',
    goodWhenUp: false,
  },
];

const STAGE_COLOR = 'var(--color-border-emphasized)';

// Source→stage mix (rows sum to 1): [tour, pricing, signup, bounce].
// Paid Social bounces hard; Retargeting and Email skew to high-intent
// stages, which is why the what-if toggles genuinely move conversions.
const MIX: number[][] = [
  [0.3, 0.22, 0.16, 0.32], // organic
  [0.24, 0.14, 0.1, 0.52], // paid social
  [0.18, 0.26, 0.34, 0.22], // email
  [0.2, 0.24, 0.3, 0.26], // direct
  [0.34, 0.2, 0.18, 0.28], // referral
  [0.16, 0.3, 0.38, 0.16], // retargeting
];

// Stage→outcome rates (rows sum to 1): [converted, nurture, lost].
const RATES: number[][] = [
  [0.18, 0.34, 0.48], // tour
  [0.3, 0.3, 0.4], // pricing
  [0.58, 0.18, 0.24], // signup
  [0.0, 0.06, 0.94], // bounce
];

// Redistribution rule constants (documented in the panel copy).
const PAID_BASE = 2600;
const PAUSE_ORGANIC_RETURN = 0.2; // brand searches persist when paid stops
const RETARGET_VOLUME = 1300;
const RETARGET_CANNIBAL_DIRECT = 200;
const SHIFT_EFFICIENCY = 0.85; // email sessions per shifted paid session

// ============= SCENARIO MODEL =============

interface WhatIf {
  pausePaid: boolean;
  retargeting: boolean;
  shiftPct: number; // % of Paid Social budget shifted to Email (0–60)
}

const BASELINE_INPUT: WhatIf = {pausePaid: false, retargeting: false, shiftPct: 0};

interface FlowModel {
  volumes: number[]; // per source
  layer0: number[][]; // [source][stage] sessions
  stageTotals: number[];
  layer1: number[][]; // [stage][outcome] sessions
  outcomeTotals: number[];
  total: number;
}

/**
 * Pure scenario→flows function. Rounding uses a remainder column (last stage
 * / last outcome) so every node's inflow exactly equals its outflow — the
 * Sankey conserves sessions across all three columns by construction.
 */
function computeModel(input: WhatIf): FlowModel {
  const shift = input.pausePaid ? 0 : input.shiftPct / 100;
  const volumes = SOURCES.map(source => {
    switch (source.id) {
      case 'organic':
        return (
          source.baseline +
          (input.pausePaid ? Math.round(PAID_BASE * PAUSE_ORGANIC_RETURN) : 0)
        );
      case 'paid-social':
        return input.pausePaid ? 0 : Math.round(PAID_BASE * (1 - shift));
      case 'email':
        return (
          source.baseline + Math.round(PAID_BASE * shift * SHIFT_EFFICIENCY)
        );
      case 'direct':
        return (
          source.baseline - (input.retargeting ? RETARGET_CANNIBAL_DIRECT : 0)
        );
      case 'retargeting':
        return input.retargeting ? RETARGET_VOLUME : 0;
      default:
        return source.baseline;
    }
  });

  const layer0 = volumes.map((volume, s) => {
    const row: number[] = [];
    let used = 0;
    for (let st = 0; st < STAGES.length - 1; st++) {
      const flow = Math.round(volume * MIX[s][st]);
      row.push(flow);
      used += flow;
    }
    row.push(volume - used); // remainder → Bounced, keeps the row exact
    return row;
  });

  const stageTotals = STAGES.map((_, st) =>
    layer0.reduce((sum, row) => sum + row[st], 0),
  );

  const layer1 = stageTotals.map((total, st) => {
    const row: number[] = [];
    let used = 0;
    for (let o = 0; o < OUTCOMES.length - 1; o++) {
      const flow = Math.round(total * RATES[st][o]);
      row.push(flow);
      used += flow;
    }
    row.push(total - used); // remainder → Lost
    return row;
  });

  const outcomeTotals = OUTCOMES.map((_, o) =>
    layer1.reduce((sum, row) => sum + row[o], 0),
  );

  return {
    volumes,
    layer0,
    stageTotals,
    layer1,
    outcomeTotals,
    total: volumes.reduce((sum, volume) => sum + volume, 0),
  };
}

const BASELINE = computeModel(BASELINE_INPUT);

// ============= SANKEY LAYOUT =============
// Hand-computed columns: each column stacks its bars centered on the cross
// axis; ribbon cross-offsets walk each node's edge in fixture order. The
// vertical (mobile) layout is the identical math with the axes swapped.

type Orient = 'h' | 'v';

interface NodeGeom {
  col: 0 | 1 | 2;
  index: number;
  label: string;
  short: string;
  color: string;
  value: number;
  main: number; // flow-axis position of the bar
  cross: number; // cross-axis start
  size: number; // cross-axis thickness
  labelPos: number; // collision-adjusted label center on the cross axis
  lane: 'above' | 'below'; // vertical mode only
}

interface LinkGeom {
  layer: 0 | 1;
  from: number;
  to: number;
  value: number;
  path: string;
  gradId: string;
  aria: string;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Sankey ribbon: two cubic beziers closing a band of thickness `w`. */
function ribbonPath(
  orient: Orient,
  m0: number,
  m1: number,
  s0: number,
  t0: number,
  w: number,
): string {
  const mid = round1((m0 + m1) / 2);
  const a = round1(s0);
  const b = round1(t0);
  const a1 = round1(s0 + w);
  const b1 = round1(t0 + w);
  if (orient === 'h') {
    return `M ${m0} ${a} C ${mid} ${a}, ${mid} ${b}, ${m1} ${b} L ${m1} ${b1} C ${mid} ${b1}, ${mid} ${a1}, ${m0} ${a1} Z`;
  }
  return `M ${a} ${m0} C ${a} ${mid}, ${b} ${mid}, ${b} ${m1} L ${b1} ${m1} C ${b1} ${mid}, ${a1} ${mid}, ${a1} ${m0} Z`;
}

/** Node bar as a path too, so `d` transitions animate bars and ribbons alike. */
function nodeBarPath(
  orient: Orient,
  main: number,
  cross: number,
  size: number,
): string {
  const c = round1(cross);
  const s = round1(size);
  if (orient === 'h') {
    return `M ${main} ${c} h ${NODE_T} v ${s} h ${-NODE_T} Z`;
  }
  return `M ${c} ${main} h ${s} v ${NODE_T} h ${-s} Z`;
}

/**
 * Collision-aware 1D label stacking: forward pass enforces the minimum gap,
 * backward pass pulls the run back inside the clamp range.
 */
function stackPositions(
  desired: number[],
  minGap: number,
  lo: number,
  hi: number,
): number[] {
  const out = [...desired];
  for (let i = 1; i < out.length; i++) {
    out[i] = Math.max(out[i], out[i - 1] + minGap);
  }
  if (out.length > 0 && out[out.length - 1] > hi) {
    out[out.length - 1] = hi;
    for (let i = out.length - 2; i >= 0; i--) {
      out[i] = Math.min(out[i], out[i + 1] - minGap);
    }
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = Math.max(out[i], lo + i * minGap);
  }
  return out;
}

interface SankeyLayout {
  nodes: NodeGeom[][]; // [column][index]
  links: LinkGeom[];
}

function buildLayout(model: FlowModel, orient: Orient): SankeyLayout {
  const scale = orient === 'h' ? SCALE_H : SCALE_V;
  const gap = orient === 'h' ? GAP_H : GAP_V;
  const span = orient === 'h' ? CANVAS_H : CANVAS_VW;
  const colMain = orient === 'h' ? COL_MAIN_H : ROW_MAIN_V;

  const columnValues: number[][] = [
    model.volumes,
    model.stageTotals,
    model.outcomeTotals,
  ];
  const columnMeta = [
    SOURCES.map(source => ({
      label: source.label,
      short: source.short,
      color: source.color,
    })),
    STAGES.map(stage => ({
      label: stage.label,
      short: stage.short,
      color: STAGE_COLOR,
    })),
    OUTCOMES.map(outcome => ({
      label: outcome.label,
      short: outcome.short,
      color: outcome.color,
    })),
  ];

  const nodes: NodeGeom[][] = columnValues.map((values, colIndex) => {
    const col = colIndex as 0 | 1 | 2;
    const sizes = values.map(value => value * scale);
    const visibleCount = values.filter(value => value > 0).length;
    const content =
      sizes.reduce((sum, size) => sum + size, 0) +
      gap * Math.max(0, visibleCount - 1);
    let cursor = Math.max(16, (span - content) / 2);
    return values.map((value, index) => {
      const node: NodeGeom = {
        col,
        index,
        label: columnMeta[colIndex][index].label,
        short: columnMeta[colIndex][index].short,
        color: columnMeta[colIndex][index].color,
        value,
        main: colMain[colIndex],
        cross: cursor,
        size: sizes[index],
        labelPos: 0,
        lane: 'above',
      };
      cursor += sizes[index];
      if (value > 0) {
        cursor += gap;
      }
      return node;
    });
  });

  // Collision-aware label placement. Horizontal: labels stack down each
  // column (outcomes need extra room for the delta chip). Vertical: visible
  // bars alternate above/below lanes, each lane stacked along x.
  if (orient === 'h') {
    nodes.forEach((column, colIndex) => {
      const visible = column.filter(node => node.value > 0);
      const minGap = colIndex === 2 ? 50 : 30;
      const stacked = stackPositions(
        visible.map(node => node.cross + node.size / 2),
        minGap,
        18,
        span - 18,
      );
      visible.forEach((node, i) => {
        node.labelPos = stacked[i];
      });
    });
  } else {
    nodes.forEach(column => {
      const visible = column.filter(node => node.value > 0);
      const lanes: NodeGeom[][] = [[], []];
      visible.forEach((node, i) => {
        node.lane = i % 2 === 0 ? 'above' : 'below';
        lanes[i % 2].push(node);
      });
      lanes.forEach(lane => {
        const stacked = stackPositions(
          lane.map(node => node.cross + node.size / 2),
          82,
          44,
          span - 44,
        );
        lane.forEach((node, i) => {
          node.labelPos = stacked[i];
        });
      });
    });
  }

  // Ribbons: walk each node edge in fixture order to hand out cross offsets.
  const links: LinkGeom[] = [];
  const m0a = colMain[0] + NODE_T;
  const m1a = colMain[1];
  const m0b = colMain[1] + NODE_T;
  const m1b = colMain[2];

  const stageInCursor = nodes[1].map(node => node.cross);
  nodes[0].forEach((sourceNode, s) => {
    let outCursor = sourceNode.cross;
    model.layer0[s].forEach((value, st) => {
      const w = value * scale;
      links.push({
        layer: 0,
        from: s,
        to: st,
        value,
        path: ribbonPath(orient, m0a, m1a, outCursor, stageInCursor[st], w),
        gradId: `asw-g-s-${SOURCES[s].id}`,
        aria: `${SOURCES[s].label} to ${STAGES[st].label}: ${value.toLocaleString('en-US')} sessions`,
      });
      outCursor += w;
      stageInCursor[st] += w;
    });
  });

  const outcomeInCursor = nodes[2].map(node => node.cross);
  nodes[1].forEach((stageNode, st) => {
    let outCursor = stageNode.cross;
    model.layer1[st].forEach((value, o) => {
      const w = value * scale;
      links.push({
        layer: 1,
        from: st,
        to: o,
        value,
        path: ribbonPath(orient, m0b, m1b, outCursor, outcomeInCursor[o], w),
        gradId: `asw-g-o-${OUTCOMES[o].id}`,
        aria: `${STAGES[st].label} to ${OUTCOMES[o].label}: ${value.toLocaleString('en-US')} sessions`,
      });
      outCursor += w;
      outcomeInCursor[o] += w;
    });
  });

  return {nodes, links};
}

// ============= HIGHLIGHT MODEL =============

type Highlight =
  | {kind: 'node'; col: 0 | 1 | 2; index: number}
  | {kind: 'link'; layer: 0 | 1; from: number; to: number};

function sameHighlight(a: Highlight | null, b: Highlight | null): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  if (a.kind === 'node' && b.kind === 'node') {
    return a.col === b.col && a.index === b.index;
  }
  if (a.kind === 'link' && b.kind === 'link') {
    return a.layer === b.layer && a.from === b.from && a.to === b.to;
  }
  return false;
}

/**
 * "Full source-to-outcome path" semantics: a left ribbon lights itself plus
 * every continuation out of its stage; a right ribbon lights itself plus
 * every feeder into its stage; nodes light their touching ribbons (and, for
 * sources/outcomes, the honest continuations through shared stages).
 */
function isLinkLit(
  highlight: Highlight,
  link: LinkGeom,
  model: FlowModel,
): boolean {
  if (highlight.kind === 'link') {
    if (highlight.layer === link.layer) {
      return highlight.from === link.from && highlight.to === link.to;
    }
    return highlight.layer === 0
      ? link.layer === 1 && link.from === highlight.to
      : link.layer === 0 && link.to === highlight.from;
  }
  if (highlight.col === 0) {
    return link.layer === 0
      ? link.from === highlight.index
      : model.layer0[highlight.index][link.from] > 0;
  }
  if (highlight.col === 1) {
    return link.layer === 0
      ? link.to === highlight.index
      : link.from === highlight.index;
  }
  return link.layer === 1
    ? link.to === highlight.index
    : RATES[link.to][highlight.index] > 0;
}

function isNodeLit(
  highlight: Highlight,
  node: NodeGeom,
  litLinks: LinkGeom[],
): boolean {
  if (highlight.kind === 'node') {
    if (highlight.col === node.col) {
      return highlight.index === node.index;
    }
  }
  return litLinks.some(link => {
    if (node.col === 0) {
      return link.layer === 0 && link.from === node.index;
    }
    if (node.col === 1) {
      return (
        (link.layer === 0 && link.to === node.index) ||
        (link.layer === 1 && link.from === node.index)
      );
    }
    return link.layer === 1 && link.to === node.index;
  });
}

// ============= FORMATTING =============

type ValueMode = 'sessions' | 'share';

const fmtInt = (n: number): string => n.toLocaleString('en-US');

function fmtValue(value: number, total: number, mode: ValueMode): string {
  if (mode === 'share') {
    return total === 0 ? '0%' : `${((value / total) * 100).toFixed(1)}%`;
  }
  return fmtInt(value);
}

function fmtDelta(delta: number): string {
  return delta > 0 ? `+${fmtInt(delta)}` : fmtInt(delta);
}

function describeHighlight(
  highlight: Highlight,
  model: FlowModel,
  mode: ValueMode,
): string {
  if (highlight.kind === 'link') {
    const value =
      highlight.layer === 0
        ? model.layer0[highlight.from][highlight.to]
        : model.layer1[highlight.from][highlight.to];
    const fromLabel =
      highlight.layer === 0
        ? SOURCES[highlight.from].label
        : STAGES[highlight.from].label;
    const toLabel =
      highlight.layer === 0
        ? STAGES[highlight.to].label
        : OUTCOMES[highlight.to].label;
    return `${fromLabel} → ${toLabel}: ${fmtValue(value, model.total, mode)}${mode === 'sessions' ? ' sessions' : ' of traffic'}`;
  }
  const value =
    highlight.col === 0
      ? model.volumes[highlight.index]
      : highlight.col === 1
        ? model.stageTotals[highlight.index]
        : model.outcomeTotals[highlight.index];
  const label =
    highlight.col === 0
      ? SOURCES[highlight.index].label
      : highlight.col === 1
        ? STAGES[highlight.index].label
        : OUTCOMES[highlight.index].label;
  const role =
    highlight.col === 0 ? 'source' : highlight.col === 1 ? 'stage' : 'outcome';
  const share =
    model.total === 0 ? '0' : ((value / model.total) * 100).toFixed(1);
  return `${label} (${role}): ${fmtInt(value)} sessions · ${share}% of traffic`;
}

// ============= SVG PIECES =============

/** Gradient stops: explicit light-dark() pairs over token mixes. */
function gradientStops(color: string): Array<{offset: string; stop: string}> {
  return [
    {
      offset: '0%',
      stop: `light-dark(color-mix(in srgb, ${color} 78%, transparent), color-mix(in srgb, ${color} 62%, transparent))`,
    },
    {
      offset: '100%',
      stop: `light-dark(color-mix(in srgb, ${color} 36%, transparent), color-mix(in srgb, ${color} 26%, transparent))`,
    },
  ];
}

function GradientDefs({orient}: {orient: Orient}) {
  const dir =
    orient === 'h'
      ? {x1: '0', y1: '0', x2: '1', y2: '0'}
      : {x1: '0', y1: '0', x2: '0', y2: '1'};
  return (
    <defs>
      {SOURCES.map(source => (
        <linearGradient key={source.id} id={`asw-g-s-${source.id}`} {...dir}>
          {gradientStops(source.color).map(stop => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              style={{stopColor: stop.stop}}
            />
          ))}
        </linearGradient>
      ))}
      {OUTCOMES.map(outcome => (
        <linearGradient key={outcome.id} id={`asw-g-o-${outcome.id}`} {...dir}>
          <stop
            offset="0%"
            style={{
              stopColor: `light-dark(color-mix(in srgb, ${STAGE_COLOR} 60%, transparent), color-mix(in srgb, ${STAGE_COLOR} 48%, transparent))`,
            }}
          />
          <stop
            offset="100%"
            style={{
              stopColor: `light-dark(color-mix(in srgb, ${outcome.color} 62%, transparent), color-mix(in srgb, ${outcome.color} 50%, transparent))`,
            }}
          />
        </linearGradient>
      ))}
    </defs>
  );
}

function DeltaChip({
  x,
  y,
  anchor,
  delta,
  goodWhenUp,
}: {
  x: number;
  y: number;
  anchor: 'start' | 'end' | 'middle';
  delta: number;
  goodWhenUp: boolean;
}) {
  const text = fmtDelta(delta);
  const width = text.length * 6.8 + 14;
  const rectX =
    anchor === 'end' ? x - width : anchor === 'middle' ? x - width / 2 : x;
  const isGood = delta === 0 ? null : delta > 0 === goodWhenUp;
  const fill =
    isGood == null
      ? 'color-mix(in srgb, var(--color-border) 40%, transparent)'
      : isGood
        ? 'color-mix(in srgb, var(--color-icon-green) 16%, transparent)'
        : 'color-mix(in srgb, var(--color-icon-red) 16%, transparent)';
  const textFill =
    isGood == null
      ? 'var(--color-text-secondary)'
      : isGood
        ? 'var(--color-text-green)'
        : 'var(--color-text-red)';
  return (
    <g
      className="asw-label"
      style={{transform: `translate(${rectX}px, ${y}px)`}}
      aria-hidden>
      <rect width={width} height={17} rx={8.5} style={{fill}} />
      <text
        x={width / 2}
        y={12.5}
        textAnchor="middle"
        style={{...styles.chipText, fill: textFill}}>
        {text}
      </text>
    </g>
  );
}

interface SankeyDiagramProps {
  model: FlowModel;
  orient: Orient;
  mode: ValueMode;
  active: Highlight | null;
  pinned: Highlight | null;
  onHover: (highlight: Highlight | null) => void;
  onPin: (highlight: Highlight) => void;
}

function SankeyDiagram({
  model,
  orient,
  mode,
  active,
  pinned,
  onHover,
  onPin,
}: SankeyDiagramProps) {
  const layout = useMemo(() => buildLayout(model, orient), [model, orient]);
  const litLinks =
    active == null
      ? null
      : layout.links.filter(link => isLinkLit(active, link, model));

  const width = orient === 'h' ? CANVAS_W : CANVAS_VW;
  const height = orient === 'h' ? CANVAS_H : CANVAS_VH;

  const interactiveProps = (highlight: Highlight, aria: string) => ({
    tabIndex: 0,
    role: 'button' as const,
    'aria-label': aria,
    'aria-pressed': sameHighlight(pinned, highlight),
    onMouseEnter: () => onHover(highlight),
    onMouseLeave: () => onHover(null),
    onFocus: () => onHover(highlight),
    onBlur: () => onHover(null),
    onClick: () => onPin(highlight),
    onKeyDown: (event: ReactKeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onPin(highlight);
      }
    },
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={orient === 'h' ? width : undefined}
      height={orient === 'h' ? height : undefined}
      style={orient === 'h' ? styles.stageH : styles.stageV}
      role="group"
      aria-label="Attribution Sankey: sources, funnel stages, outcomes">
      <GradientDefs orient={orient} />

      {/* Ribbons under the bars. Zero-width ribbons stay mounted so a toggle
          animates them open/closed instead of popping. */}
      {layout.links.map(link => {
        const highlight: Highlight = {
          kind: 'link',
          layer: link.layer,
          from: link.from,
          to: link.to,
        };
        const isLit =
          litLinks != null &&
          litLinks.some(
            lit =>
              lit.layer === link.layer &&
              lit.from === link.from &&
              lit.to === link.to,
          );
        const opacity = litLinks == null ? 0.72 : isLit ? 1 : 0.12;
        return (
          <path
            key={`l${link.layer}-${link.from}-${link.to}`}
            className="asw-flow asw-hit"
            d={link.path}
            fill={`url(#${link.gradId})`}
            style={{d: `path("${link.path}")`, opacity}}
            {...(link.value > 0
              ? interactiveProps(highlight, link.aria)
              : {'aria-hidden': true})}
          />
        );
      })}

      {/* Node bars (paths too, so `d` transitions animate thickness). */}
      {layout.nodes.map(column =>
        column.map(node => {
          const highlight: Highlight = {
            kind: 'node',
            col: node.col,
            index: node.index,
          };
          const isLit =
            active != null &&
            litLinks != null &&
            isNodeLit(active, node, litLinks);
          const barPath = nodeBarPath(orient, node.main, node.cross, node.size);
          const share =
            model.total === 0
              ? '0'
              : ((node.value / model.total) * 100).toFixed(1);
          return (
            <path
              key={`n${node.col}-${node.index}`}
              className="asw-flow asw-hit"
              d={barPath}
              fill={node.color}
              style={{
                d: `path("${barPath}")`,
                opacity: active == null ? 1 : isLit ? 1 : 0.25,
              }}
              {...(node.value > 0
                ? interactiveProps(
                    highlight,
                    `${node.label}: ${fmtInt(node.value)} sessions, ${share}% of traffic`,
                  )
                : {'aria-hidden': true})}
            />
          );
        }),
      )}

      {/* Labels: plain SVG text (no foreignObject) with collision-aware
          stacking; a leader tick appears when a label was pushed off its
          bar center. Horizontal: sources/stages label right of the bar,
          outcomes label left (with the vs-baseline delta chip). */}
      {orient === 'h'
        ? layout.nodes.map((column, colIndex) =>
            column.map(node => {
              if (node.value <= 0) {
                return null;
              }
              const anchorStart = colIndex < 2;
              const tx = anchorStart ? node.main + NODE_T + 8 : node.main - 8;
              const center = node.cross + node.size / 2;
              const displaced = Math.abs(node.labelPos - center) > 12;
              return (
                <g key={`t${colIndex}-${node.index}`} aria-hidden>
                  {displaced && (
                    <line
                      className="asw-flow"
                      x1={anchorStart ? node.main + NODE_T + 1 : node.main - 1}
                      y1={center}
                      x2={anchorStart ? tx - 2 : tx + 2}
                      y2={node.labelPos - 4}
                      style={styles.leader}
                    />
                  )}
                  <g
                    className="asw-label"
                    style={{transform: `translate(${tx}px, ${node.labelPos}px)`}}>
                    <text
                      y={-2}
                      textAnchor={anchorStart ? 'start' : 'end'}
                      style={styles.svgName}>
                      {node.label}
                    </text>
                    <text
                      y={12}
                      textAnchor={anchorStart ? 'start' : 'end'}
                      style={styles.svgValue}>
                      {fmtValue(node.value, model.total, mode)}
                      {mode === 'sessions' ? ' /wk' : ''}
                    </text>
                  </g>
                  {colIndex === 2 && (
                    <DeltaChip
                      x={tx}
                      y={node.labelPos + 18}
                      anchor="end"
                      delta={node.value - BASELINE.outcomeTotals[node.index]}
                      goodWhenUp={OUTCOMES[node.index].goodWhenUp}
                    />
                  )}
                </g>
              );
            }),
          )
        : layout.nodes.map((column, colIndex) =>
            column.map(node => {
              if (node.value <= 0) {
                return null;
              }
              const isAbove = node.lane === 'above';
              const ty = isAbove ? node.main - 8 : node.main + NODE_T + 14;
              const center = node.cross + node.size / 2;
              const displaced = Math.abs(node.labelPos - center) > 12;
              return (
                <g key={`t${colIndex}-${node.index}`} aria-hidden>
                  {displaced && (
                    <line
                      className="asw-flow"
                      x1={center}
                      y1={isAbove ? node.main - 2 : node.main + NODE_T + 2}
                      x2={node.labelPos}
                      y2={isAbove ? ty + 3 : ty - 9}
                      style={styles.leader}
                    />
                  )}
                  <g
                    className="asw-label"
                    style={{
                      transform: `translate(${node.labelPos}px, ${ty}px)`,
                    }}>
                    <text textAnchor="middle" style={styles.svgName}>
                      {node.short}{' '}
                      <tspan style={styles.svgValue}>
                        {fmtValue(node.value, model.total, mode)}
                      </tspan>
                    </text>
                  </g>
                  {colIndex === 2 && (
                    <DeltaChip
                      x={node.labelPos}
                      y={ty + (isAbove ? -26 : 6)}
                      anchor="middle"
                      delta={node.value - BASELINE.outcomeTotals[node.index]}
                      goodWhenUp={OUTCOMES[node.index].goodWhenUp}
                    />
                  )}
                </g>
              );
            }),
          )}
    </svg>
  );
}

// ============= WHAT-IF PANEL =============

interface WhatIfPanelProps {
  whatIf: WhatIf;
  onChange: (next: WhatIf) => void;
  model: FlowModel;
  pinned: Highlight | null;
  onPinSource: (index: number) => void;
}

function activeRules(whatIf: WhatIf): string[] {
  const rules: string[] = [];
  if (whatIf.pausePaid) {
    rules.push(
      `Paid Social paused — ${fmtInt(PAID_BASE)} paid sessions removed; 20% (${fmtInt(Math.round(PAID_BASE * PAUSE_ORGANIC_RETURN))}) return as organic brand searches.`,
    );
  }
  if (whatIf.retargeting) {
    rules.push(
      `Retargeting enabled — +${fmtInt(RETARGET_VOLUME)} high-intent sessions; ${fmtInt(RETARGET_CANNIBAL_DIRECT)} cannibalized from Direct.`,
    );
  }
  if (whatIf.shiftPct > 0 && !whatIf.pausePaid) {
    const paidLoss = Math.round(PAID_BASE * (whatIf.shiftPct / 100));
    const emailGain = Math.round(paidLoss * SHIFT_EFFICIENCY);
    rules.push(
      `${whatIf.shiftPct}% of Paid Social budget → Email at 0.85 session efficiency (−${fmtInt(paidLoss)} paid, +${fmtInt(emailGain)} email).`,
    );
  }
  return rules;
}

function WhatIfPanel({
  whatIf,
  onChange,
  model,
  pinned,
  onPinSource,
}: WhatIfPanelProps) {
  const isBaseline =
    !whatIf.pausePaid && !whatIf.retargeting && whatIf.shiftPct === 0;
  const rules = activeRules(whatIf);

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>What-if scenario</Heading>
        </StackItem>
        <Button
          label="Reset"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" />}
          isDisabled={isBaseline}
          onClick={() => onChange(BASELINE_INPUT)}
        />
      </HStack>

      <VStack gap={3}>
        <VStack gap={1}>
          <Switch
            label="Pause Paid Social"
            value={whatIf.pausePaid}
            onChange={value => onChange({...whatIf, pausePaid: value})}
          />
          <Text type="supporting" color="secondary">
            Removes all paid sessions; 20% return as organic brand searches.
          </Text>
        </VStack>
        <VStack gap={1}>
          <Switch
            label="Enable retargeting"
            value={whatIf.retargeting}
            onChange={value => onChange({...whatIf, retargeting: value})}
          />
          <Text type="supporting" color="secondary">
            Adds {fmtInt(RETARGET_VOLUME)} high-intent sessions, minus{' '}
            {fmtInt(RETARGET_CANNIBAL_DIRECT)} cannibalized from Direct.
          </Text>
        </VStack>
        {whatIf.pausePaid ? (
          <Text type="supporting" color="secondary">
            Budget shift is unavailable while Paid Social is paused — there is
            no paid spend left to move.
          </Text>
        ) : (
          <Slider
            label="Shift Paid Social budget to Email"
            min={0}
            max={60}
            step={5}
            value={whatIf.shiftPct}
            onChange={(value: number) => onChange({...whatIf, shiftPct: value})}
            formatValue={value => `${value}%`}
            marks={[
              {value: 0, label: '0%'},
              {value: 30, label: '30%'},
              {value: 60, label: '60%'},
            ]}
          />
        )}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={4}>Source volumes</Heading>
        <VStack gap={0}>
          {SOURCES.map((source, index) => {
            const value = model.volumes[index];
            const delta = value - BASELINE.volumes[index];
            const highlight: Highlight = {kind: 'node', col: 0, index};
            const isActive = sameHighlight(pinned, highlight);
            return (
              <button
                key={source.id}
                type="button"
                style={{
                  ...styles.sourceRow,
                  ...(isActive ? styles.sourceRowActive : undefined),
                }}
                aria-pressed={isActive}
                aria-label={`Highlight ${source.label}: ${fmtInt(value)} sessions`}
                onClick={() => onPinSource(index)}>
                <span
                  style={{...styles.swatch, backgroundColor: source.color}}
                  aria-hidden
                />
                <StackItem size="fill">
                  <Text type="label" maxLines={1}>
                    {source.label}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  {fmtInt(value)}
                </Text>
                {delta !== 0 && (
                  <Badge
                    variant={delta > 0 ? 'success' : 'error'}
                    label={fmtDelta(delta)}
                  />
                )}
              </button>
            );
          })}
        </VStack>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={4}>Redistribution rules in effect</Heading>
        {rules.length === 0 ? (
          <Text type="supporting" color="secondary">
            Baseline — no rules active. Flip a toggle or move the slider to
            re-flow volumes through the diagram.
          </Text>
        ) : (
          rules.map(rule => (
            <Text key={rule} type="supporting" color="secondary">
              {rule}
            </Text>
          ))
        )}
      </VStack>
    </VStack>
  );
}

// ============= COMPARE FOOTER =============

function CompareFooter({
  model,
  pinned,
  onPinOutcome,
}: {
  model: FlowModel;
  pinned: Highlight | null;
  onPinOutcome: (index: number) => void;
}) {
  const deltas = OUTCOMES.map(
    (_, o) => model.outcomeTotals[o] - BASELINE.outcomeTotals[o],
  );
  const summary =
    deltas.every(delta => delta === 0)
      ? 'Scenario matches baseline — no conversions gained or lost.'
      : `Net vs baseline: ${fmtDelta(deltas[0])} conversions · ${fmtDelta(deltas[1])} nurture · ${fmtDelta(deltas[2])} lost.`;

  return (
    <VStack gap={2}>
      <div style={styles.footerChips}>
        {OUTCOMES.map((outcome, index) => {
          const highlight: Highlight = {kind: 'node', col: 2, index};
          const isActive = sameHighlight(pinned, highlight);
          const delta = deltas[index];
          return (
            <button
              key={outcome.id}
              type="button"
              style={{
                ...styles.footerChip,
                ...(isActive ? styles.chipActive : undefined),
              }}
              aria-pressed={isActive}
              aria-label={`Highlight ${outcome.label}: baseline ${fmtInt(BASELINE.outcomeTotals[index])}, scenario ${fmtInt(model.outcomeTotals[index])}`}
              onClick={() => onPinOutcome(index)}>
              <span
                style={{...styles.swatch, backgroundColor: outcome.color}}
                aria-hidden
              />
              <Text type="label">{outcome.label}</Text>
              <Text type="supporting" color="secondary" style={styles.numeric}>
                {fmtInt(BASELINE.outcomeTotals[index])} →{' '}
                {fmtInt(model.outcomeTotals[index])}
              </Text>
              {delta !== 0 && (
                <Badge
                  variant={
                    delta > 0 === outcome.goodWhenUp ? 'success' : 'error'
                  }
                  label={fmtDelta(delta)}
                />
              )}
            </button>
          );
        })}
      </div>
      <Text type="supporting" color="secondary" style={styles.numeric}>
        {summary}
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function AttributionSankeyWhatIfTemplate() {
  const [whatIf, setWhatIf] = useState<WhatIf>(BASELINE_INPUT);
  const [mode, setMode] = useState<ValueMode>('sessions');
  const [hover, setHover] = useState<Highlight | null>(null);
  const [pinned, setPinned] = useState<Highlight | null>(null);

  // Responsive contract: <=1024px the panel folds above the diagram;
  // <=640px the diagram rotates vertical and the header caption drops.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const orient: Orient = isCompact ? 'v' : 'h';

  const model = useMemo(() => computeModel(whatIf), [whatIf]);
  const active = hover ?? pinned;

  const togglePin = (highlight: Highlight) => {
    setPinned(prev => (sameHighlight(prev, highlight) ? null : highlight));
  };
  const clearPin = () => {
    setPinned(null);
    setHover(null);
  };

  const statusText =
    active != null
      ? describeHighlight(active, model, mode)
      : 'Hover, focus, or tap a bar, ribbon, or chip to trace its source-to-outcome path.';

  const whatIfPanel = (
    <WhatIfPanel
      whatIf={whatIf}
      onChange={setWhatIf}
      model={model}
      pinned={pinned}
      onPinSource={index => togglePin({kind: 'node', col: 0, index})}
    />
  );

  // 40px chips duplicate stage-node highlighting (SVG bars can be thin).
  const stageChips = (
    <div style={styles.chipStrip} role="group" aria-label="Highlight a stage">
      <Text type="supporting" color="secondary">
        Highlight:
      </Text>
      {STAGES.map((stage, index) => {
        const highlight: Highlight = {kind: 'node', col: 1, index};
        const isActive = sameHighlight(pinned, highlight);
        return (
          <button
            key={stage.id}
            type="button"
            style={{
              ...styles.chip,
              ...(isActive ? styles.chipActive : undefined),
            }}
            aria-pressed={isActive}
            onClick={() => togglePin(highlight)}>
            <Text type="label">{stage.label}</Text>
            <Text type="supporting" color="secondary" style={styles.numeric}>
              {fmtValue(model.stageTotals[index], model.total, mode)}
            </Text>
          </button>
        );
      })}
      {pinned != null && (
        <Button
          label="Clear"
          variant="secondary"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={clearPin}
        />
      )}
    </div>
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
                  <Icon icon={Share2Icon} size="sm" color="secondary" />
                  <Heading level={1}>Attribution Sankey</Heading>
                  {/* <=640px: the caption cedes width to the mode control. */}
                  {!isCompact && (
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.numeric}>
                      {fmtInt(model.total)} sessions/wk · baseline{' '}
                      {fmtInt(BASELINE.total)}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <SegmentedControl
                label="Value display"
                value={mode}
                onChange={value => setMode(value as ValueMode)}
                size="sm">
                <SegmentedControlItem label="Sessions" value="sessions" />
                <SegmentedControlItem label="Share %" value="share" />
              </SegmentedControl>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={4}>
            <VStack gap={4}>
              {/* <=1024px single pane: the what-if block folds in here. */}
              {isNarrow && (
                <>
                  {whatIfPanel}
                  <Divider />
                </>
              )}

              <div style={orient === 'h' ? styles.stageScroll : undefined}>
                <SankeyDiagram
                  model={model}
                  orient={orient}
                  mode={mode}
                  active={active}
                  pinned={pinned}
                  onHover={setHover}
                  onPin={togglePin}
                />
              </div>

              {stageChips}

              {/* The pinned/hovered flow persists here, so highlighting is
                  never hover-only and screen readers hear the same values. */}
              <div role="status" aria-live="polite" style={styles.statusLine}>
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  {statusText}
                </Text>
              </div>

              <Divider />

              <CompareFooter
                model={model}
                pinned={pinned}
                onPinOutcome={index => togglePin({kind: 'node', col: 2, index})}
              />
            </VStack>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel width={320} label="What-if scenario" style={styles.panelScroll}>
              {whatIfPanel}
            </LayoutPanel>
          )
        }
      />
    </>
  );
}
