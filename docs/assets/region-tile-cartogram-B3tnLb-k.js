var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file region-tile-cartogram.tsx
 * @input Deterministic fixtures only (50 US states with hand-authored tile
 *   grid coordinates on a 12x8 schematic board — no geo projection — plus
 *   2022/2026 endpoint values for three metrics per state; the five-year
 *   series in between is a pure linear interpolation with a fixed
 *   seed-indexed ripple, so every number on the page derives from the
 *   fixture tuples with no clocks, randomness, or network assets)
 * @output Tile-cartogram metric atlas: a choropleth grid of 50 rounded
 *   state tiles shaded by a switchable metric (adoption, revenue per
 *   capita, churn) through five hand-tuned color stops; tapping a tile
 *   pins it (up to three, oldest drops first) into comparison chips with
 *   five-year sparklines and signed deltas; a linked ranking bar chart
 *   highlights pinned states and scrolls the newest pin into view; the
 *   quantize legend doubles as a filter that dims tiles and ranking rows
 *   outside the clicked bucket; and a year SegmentedControl plus
 *   prev/next/play transport steps the whole surface through five fixture
 *   years with tiles animating between color stops
 * @position Page template; emitted by \`astryx template region-tile-cartogram\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title +
 * atlas caption, metric SegmentedControl). LayoutContent scrolls a
 * centered max-width-980 column: year transport row, pinned comparison
 * chips, the bordered cartogram panel, then the quantize legend band.
 * LayoutPanel end 340 hosts the linked ranking bar chart with its own
 * vertical scroll.
 *
 * Responsive contract:
 * - >1024px: header | content column | ranking panel docked at the end
 *   edge (width 340) with its own scroll; tiles show the two-letter code
 *   with the metric value beneath.
 * - <=1024px: the end panel leaves the frame; the ranking renders below
 *   the legend inside the shared LayoutContent scroller, capped at 420px
 *   with its own vertical scroll so the cartogram stays reachable.
 * - <=900px: tiles drop the value line and show two-letter codes only;
 *   the value still reads through each tile's aria-label, the ranking
 *   rows, and the comparison chips, so nothing is lost or hover-only.
 * - <=640px (single-pane fallback): the year transport, chips, and
 *   legend flex-wrap onto multiple lines; tiles become fixed 44px tap
 *   targets and the cartogram panel becomes the page's single deliberate
 *   overflow-x region (the 12-column board pans sideways inside its own
 *   panel; page chrome never pans). Every control keeps ~40px touch
 *   height and every interaction is tap/keyboard driven — pin, filter,
 *   sort, and transport are all plain buttons, nothing is hover-only.
 *
 * Container policy (explorable-atlas archetype): frame-first rows and one
 * bordered map panel — no Cards. The cartogram is pure CSS grid (each
 * tile a plain button placed by fixture gridColumn/gridRow), the ranking
 * is hand-rolled divs, and the sparklines are CSS bar stacks; no chart
 * library, no SVG map, no layout algorithm. Year playback is a
 * setInterval advancing the year index only — the whole surface is a
 * pure function of (metric, yearIndex, pins, bucketFilter, sortDir).
 * Tile-to-tile color animation is a CSS background-color transition
 * disabled under prefers-reduced-motion (stepping still works).
 *
 * Color policy: token-pure. Chrome colors are var(--color-*) tokens; the
 * three choropleth ramps are hand-tuned five-stop fill/ink scales where
 * every stop is an explicit light-dark() pair, so the atlas holds its
 * contrast and its "stronger = more" read in both schemes (the dark ramp
 * runs lighter = more, so on-page copy stays scheme-neutral).
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
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered scrollable column; LayoutContent owns the scrolling.
  column: {
    maxWidth: 980,
    marginInline: 'auto',
    width: '100%',
  },
  headerRow: {flexWrap: 'wrap'},
  toolbarRow: {flexWrap: 'wrap'},
  chipRow: {flexWrap: 'wrap'},
  legendRow: {flexWrap: 'wrap'},
  // Bordered map panel (fleet-node-status gridPanel idiom).
  mapPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
  },
  // <=640px: the board pans sideways inside the panel — the page's single
  // deliberate overflow-x region.
  mapScroll: {overflowX: 'auto'},
  // The cartogram itself: pure CSS grid, 12 columns, tiles placed by
  // fixture gridColumn/gridRow. Rows size from the square tiles.
  mapGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
    gap: 6,
  },
  // Phone board: fixed 44px tracks keep tiles at tap-target size.
  mapGridCompact: {
    gridTemplateColumns: 'repeat(12, 44px)',
    width: 'max-content',
  },
  tile: {
    aspectRatio: '1 / 1',
    minWidth: 0,
    border: 'none',
    borderRadius: 8,
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    // Fallback outline slot so pinning never shifts layout.
    outline: '2px solid transparent',
    outlineOffset: 2,
    // Subtle inset ring so lowest-bucket tiles (near-white / near-navy)
    // never dissolve into the panel background.
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
  },
  tilePinned: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: 2,
  },
  // Legend-bucket filter dims non-matching tiles and ranking rows; the
  // elements stay interactive so a dimmed state can still be pinned.
  dimmed: {opacity: 0.25},
  // Inset ring keeps the extreme ramp stops (near-white / near-navy)
  // visible against the panel in both schemes.
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
  },
  // Comparison chip: bordered mini-card for one pinned state.
  chip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    width: 224,
    maxWidth: '100%',
    flexShrink: 0,
  },
  chipHint: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    flex: 1,
    minWidth: 200,
  },
  // Five-year CSS bar sparkline (portfolio-holdings idiom): decorative,
  // the adjacent signed figures carry the same information.
  spark: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 28,
  },
  sparkBar: {
    width: 8,
    flex: 'none',
    borderRadius: 2,
  },
  gain: {color: 'var(--color-success)'},
  loss: {color: 'var(--color-error)'},
  // Ranking bar chart: hand-rolled rows inside a scroll region.
  rankScrollDocked: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  rankScrollStacked: {
    maxHeight: 420,
    overflowY: 'auto',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  rankRow: {
    display: 'grid',
    gridTemplateColumns: '28px 34px 1fr 62px',
    gap: 8,
    alignItems: 'center',
    width: '100%',
    minHeight: 32,
    border: 'none',
    borderRadius: 6,
    padding: '2px 6px',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    textAlign: 'start',
  },
  rankRowPinned: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Bordered track + inset-ringed fill keep bottom-ranked bars (whose
  // fill is the near-invisible lowest ramp stop) readable in both schemes.
  rankBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
    overflow: 'hidden',
  },
  rankBarFill: {
    height: '100%',
    borderRadius: 5,
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
  },
  rankIndex: {textAlign: 'end'},
  rankValue: {textAlign: 'end'},
};

// ============= COLOR RAMPS =============
// Three hand-tuned quantize ramps, five stops each. Every stop is an
// explicit light-dark() pair (fill + ink) so the "stronger = more" read
// survives scheme flips and tile labels always clear contrast. These are
// the only literal colors in the file; all chrome uses tokens.

type MetricKey = 'adoption' | 'revenue' | 'churn';

interface RampStop {
  fill: string;
  ink: string;
}

const RAMPS: Record<MetricKey, RampStop[]> = {
  // Adoption: blues, light wash -> saturated.
  adoption: [
    {
      fill: 'light-dark(#EFF6FF, #0F2547)',
      ink: 'light-dark(#1E3A8A, #9EC1E8)',
    },
    {
      fill: 'light-dark(#BFDBFE, #143A6B)',
      ink: 'light-dark(#1E3A8A, #C7DCF5)',
    },
    {
      fill: 'light-dark(#93C5FD, #1D5CA8)',
      ink: 'light-dark(#172E64, #E3EEFB)',
    },
    {
      fill: 'light-dark(#3B82F6, #3B82F6)',
      ink: 'light-dark(#FFFFFF, #FFFFFF)',
    },
    {
      fill: 'light-dark(#1D4ED8, #93C5FD)',
      ink: 'light-dark(#FFFFFF, #0B1D3A)',
    },
  ],
  // Revenue per capita: greens.
  revenue: [
    {
      fill: 'light-dark(#ECFDF5, #0C2B1E)',
      ink: 'light-dark(#065F46, #8FD6B8)',
    },
    {
      fill: 'light-dark(#A7F3D0, #11402C)',
      ink: 'light-dark(#065F46, #B5E8CF)',
    },
    {
      fill: 'light-dark(#6EE7B7, #17603F)',
      ink: 'light-dark(#064E3B, #DFF7EA)',
    },
    {
      fill: 'light-dark(#10B981, #10B981)',
      ink: 'light-dark(#FFFFFF, #04281A)',
    },
    {
      fill: 'light-dark(#047857, #6EE7B7)',
      ink: 'light-dark(#FFFFFF, #06301F)',
    },
  ],
  // Churn: ambers into reds — higher is worse, so the hot end alarms.
  churn: [
    {
      fill: 'light-dark(#FFFBEB, #2B1C0C)',
      ink: 'light-dark(#92400E, #E8C69E)',
    },
    {
      fill: 'light-dark(#FDE68A, #4A2E10)',
      ink: 'light-dark(#92400E, #F2D9B0)',
    },
    {
      fill: 'light-dark(#FBBF24, #8A5A14)',
      ink: 'light-dark(#5B3A05, #FFF3D6)',
    },
    {
      fill: 'light-dark(#F97316, #EA7C1C)',
      ink: 'light-dark(#FFFFFF, #331303)',
    },
    {
      fill: 'light-dark(#DC2626, #F87171)',
      ink: 'light-dark(#FFFFFF, #3D0808)',
    },
  ],
};

const BUCKET_COUNT = 5;

// ============= DATA =============
// Hand-authored tile board: [code, name, col, row] on a 12x8 schematic
// grid (the familiar NPR-style square-state arrangement — coordinates are
// fixture data, not a projection), followed by 2022 and 2026 endpoint
// values for adoption %, revenue per capita $, and churn %.

type StateSpec = [
  code: string,
  name: string,
  col: number,
  row: number,
  adoption2022: number,
  adoption2026: number,
  revenue2022: number,
  revenue2026: number,
  churn2022: number,
  churn2026: number,
];

const STATE_SPECS: StateSpec[] = [
  // Row 0-1: the detached corners and northern New England.
  ['AK', 'Alaska', 0, 0, 30, 44, 26, 38, 8.1, 6.9],
  ['ME', 'Maine', 11, 0, 33, 50, 24, 37, 7.5, 6.1],
  ['VT', 'Vermont', 10, 1, 36, 53, 27, 41, 6.7, 5.5],
  ['NH', 'New Hampshire', 11, 1, 47, 66, 39, 55, 5.6, 4.3],
  // Row 2: the northern tier.
  ['WA', 'Washington', 1, 2, 63, 87, 56, 80, 4.3, 3.0],
  ['ID', 'Idaho', 2, 2, 28, 46, 20, 33, 8.4, 6.6],
  ['MT', 'Montana', 3, 2, 27, 43, 19, 31, 8.5, 6.8],
  ['ND', 'North Dakota', 4, 2, 26, 41, 18, 29, 8.6, 7.0],
  ['MN', 'Minnesota', 5, 2, 52, 74, 44, 63, 5.2, 3.8],
  ['IL', 'Illinois', 6, 2, 50, 70, 42, 60, 5.8, 4.4],
  ['WI', 'Wisconsin', 7, 2, 39, 58, 30, 46, 7.0, 5.5],
  ['MI', 'Michigan', 8, 2, 40, 60, 31, 47, 6.9, 5.4],
  ['NY', 'New York', 9, 2, 62, 84, 60, 84, 4.6, 3.2],
  ['MA', 'Massachusetts', 10, 2, 64, 86, 58, 82, 4.4, 3.0],
  ['RI', 'Rhode Island', 11, 2, 43, 61, 35, 50, 6.1, 4.8],
  // Row 3.
  ['OR', 'Oregon', 1, 3, 53, 75, 43, 62, 5.0, 3.6],
  ['NV', 'Nevada', 2, 3, 39, 59, 30, 46, 7.2, 5.5],
  ['WY', 'Wyoming', 3, 3, 23, 37, 16, 26, 9.1, 7.5],
  ['SD', 'South Dakota', 4, 3, 25, 40, 17, 27, 8.9, 7.2],
  ['IA', 'Iowa', 5, 3, 30, 47, 22, 34, 8.0, 6.4],
  ['IN', 'Indiana', 6, 3, 34, 52, 26, 40, 7.6, 6.0],
  ['OH', 'Ohio', 7, 3, 38, 57, 30, 45, 7.1, 5.6],
  ['PA', 'Pennsylvania', 8, 3, 45, 65, 37, 54, 6.3, 4.9],
  ['NJ', 'New Jersey', 9, 3, 55, 76, 50, 70, 5.1, 3.8],
  ['CT', 'Connecticut', 10, 3, 52, 71, 46, 64, 5.4, 4.1],
  // Row 4.
  ['CA', 'California', 1, 4, 66, 88, 62, 86, 4.2, 2.9],
  ['UT', 'Utah', 2, 4, 56, 80, 44, 66, 4.7, 3.3],
  ['CO', 'Colorado', 3, 4, 58, 82, 48, 70, 4.8, 3.4],
  ['NE', 'Nebraska', 4, 4, 31, 48, 23, 35, 7.9, 6.3],
  ['MO', 'Missouri', 5, 4, 33, 50, 25, 38, 7.8, 6.2],
  ['KY', 'Kentucky', 6, 4, 26, 41, 19, 30, 8.8, 7.1],
  ['WV', 'West Virginia', 7, 4, 19, 30, 13, 21, 10.8, 9.0],
  ['VA', 'Virginia', 8, 4, 53, 74, 45, 64, 5.3, 3.9],
  ['MD', 'Maryland', 9, 4, 54, 75, 48, 68, 5.0, 3.7],
  ['DE', 'Delaware', 10, 4, 44, 60, 38, 52, 6.2, 4.9],
  // Row 5.
  ['AZ', 'Arizona', 2, 5, 41, 63, 34, 52, 6.8, 5.2],
  ['NM', 'New Mexico', 3, 5, 26, 40, 18, 28, 9.0, 7.3],
  ['KS', 'Kansas', 4, 5, 29, 45, 21, 33, 8.2, 6.6],
  ['AR', 'Arkansas', 5, 5, 22, 35, 16, 26, 9.6, 7.8],
  ['TN', 'Tennessee', 6, 5, 37, 57, 28, 44, 7.3, 5.7],
  ['NC', 'North Carolina', 7, 5, 44, 66, 34, 52, 6.4, 4.8],
  ['SC', 'South Carolina', 8, 5, 33, 51, 24, 37, 7.7, 6.1],
  // Row 6.
  ['OK', 'Oklahoma', 4, 6, 24, 38, 17, 27, 9.5, 7.9],
  ['LA', 'Louisiana', 5, 6, 25, 39, 18, 28, 9.4, 7.7],
  ['MS', 'Mississippi', 6, 6, 20, 32, 14, 23, 10.4, 8.6],
  ['AL', 'Alabama', 7, 6, 24, 38, 18, 29, 9.2, 7.4],
  ['GA', 'Georgia', 8, 6, 42, 64, 32, 50, 7.0, 5.3],
  // Row 7: the southern outliers.
  ['HI', 'Hawaii', 0, 7, 38, 55, 30, 44, 6.6, 5.4],
  ['TX', 'Texas', 4, 7, 51, 73, 40, 60, 5.9, 4.3],
  ['FL', 'Florida', 9, 7, 46, 68, 36, 56, 7.4, 5.6],
];

const YEARS = [2022, 2023, 2024, 2025, 2026] as const;

interface MetricDef {
  key: MetricKey;
  label: string;
  shortLabel: string;
  /** Which direction is good news — drives delta coloring in chips. */
  better: 'higher' | 'lower';
  /** Ripple amplitude for the interpolated middle years. */
  amp: number;
  decimals: number;
  format: (value: number) => string;
  formatDelta: (delta: number) => string;
}

const METRICS: Record<MetricKey, MetricDef> = {
  adoption: {
    key: 'adoption',
    label: 'Adoption',
    shortLabel: 'adoption',
    better: 'higher',
    amp: 0.9,
    decimals: 1,
    format: value => \`\${value.toFixed(1)}%\`,
    formatDelta: delta =>
      \`\${delta > 0 ? '+' : ''}\${delta.toFixed(1)} pts\`,
  },
  revenue: {
    key: 'revenue',
    label: 'Rev / capita',
    shortLabel: 'revenue per capita',
    better: 'higher',
    amp: 0.8,
    decimals: 0,
    format: value => \`$\${Math.round(value)}\`,
    formatDelta: delta =>
      \`\${delta > 0 ? '+' : delta < 0 ? '-' : ''}$\${Math.round(Math.abs(delta))}\`,
  },
  churn: {
    key: 'churn',
    label: 'Churn',
    shortLabel: 'churn',
    better: 'lower',
    amp: 0.12,
    decimals: 1,
    format: value => \`\${value.toFixed(1)}%\`,
    formatDelta: delta =>
      \`\${delta > 0 ? '+' : ''}\${delta.toFixed(1)} pts\`,
  },
};

const METRIC_ORDER: MetricKey[] = ['adoption', 'revenue', 'churn'];

// ---- Series derivation (pure fixture math, no randomness) ----

/** Stable per-state seed from the two-letter code. */
function seedOf(code: string): number {
  return code.charCodeAt(0) * 7 + code.charCodeAt(1) * 13;
}

/**
 * Five-year series between fixture endpoints: linear interpolation plus a
 * fixed seed-indexed ripple on the middle years so sparklines read as
 * real trajectories. Endpoints stay exactly as authored.
 */
function buildSeries(
  seed: number,
  start: number,
  end: number,
  amp: number,
  decimals: number,
): number[] {
  const factor = 10 ** decimals;
  return YEARS.map((_, index) => {
    const base = start + ((end - start) * index) / (YEARS.length - 1);
    const ripple =
      index === 0 || index === YEARS.length - 1
        ? 0
        : (((seed + index * 11) % 5) - 2) * amp;
    return Math.round((base + ripple) * factor) / factor;
  });
}

interface StateDatum {
  code: string;
  name: string;
  col: number;
  row: number;
  series: Record<MetricKey, number[]>;
}

const STATES: StateDatum[] = STATE_SPECS.map(
  ([code, name, col, row, a0, a4, r0, r4, c0, c4]) => {
    const seed = seedOf(code);
    return {
      code,
      name,
      col,
      row,
      series: {
        adoption: buildSeries(seed, a0, a4, METRICS.adoption.amp, 1),
        revenue: buildSeries(seed, r0, r4, METRICS.revenue.amp, 0),
        churn: buildSeries(seed, c0, c4, METRICS.churn.amp, 1),
      },
    };
  },
);

const STATE_BY_CODE = new Map(STATES.map(state => [state.code, state]));

// ---- Quantize scale (global per metric across all five years, so the
// legend stays put while the year transport animates tile colors) ----

interface MetricScale {
  min: number;
  max: number;
  step: number;
}

function buildScale(metric: MetricKey): MetricScale {
  let min = Infinity;
  let max = -Infinity;
  for (const state of STATES) {
    for (const value of state.series[metric]) {
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  return {min, max, step: (max - min) / BUCKET_COUNT};
}

const SCALES: Record<MetricKey, MetricScale> = {
  adoption: buildScale('adoption'),
  revenue: buildScale('revenue'),
  churn: buildScale('churn'),
};

function bucketOf(metric: MetricKey, value: number): number {
  const scale = SCALES[metric];
  if (scale.step === 0) {
    return 0;
  }
  return Math.min(
    BUCKET_COUNT - 1,
    Math.floor((value - scale.min) / scale.step),
  );
}

/** Bucket range label, e.g. "38.0% – 52.4%". */
function bucketRange(metric: MetricKey, bucket: number): string {
  const scale = SCALES[metric];
  const lo = scale.min + scale.step * bucket;
  const hi = bucket === BUCKET_COUNT - 1 ? scale.max : lo + scale.step;
  const def = METRICS[metric];
  return \`\${def.format(lo)} – \${def.format(hi)}\`;
}

/** Bar width share on the metric's global scale (stable across years). */
function barShare(metric: MetricKey, value: number): number {
  const scale = SCALES[metric];
  if (scale.max === scale.min) {
    return 100;
  }
  return 8 + ((value - scale.min) / (scale.max - scale.min)) * 92;
}

const MAX_PINS = 3;

// ============= SPARKLINE =============

/**
 * Five-year CSS bar sparkline for a pinned state: one bar per fixture
 * year, height normalized within the state's own series, each bar tinted
 * by its year's quantize bucket so the chip re-tells the choropleth
 * story. The selected year's bar renders at full opacity. Decorative
 * (aria-hidden) — the chip's signed figures carry the same information.
 */
function YearSparkline({
  metric,
  series,
  yearIndex,
}: {
  metric: MetricKey;
  series: number[];
  yearIndex: number;
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const range = max - min;
  return (
    <div style={styles.spark} aria-hidden="true">
      {series.map((value, index) => {
        const height =
          range === 0 ? 12 : 6 + Math.round(((value - min) / range) * 20);
        return (
          <div
            key={index}
            style={{
              ...styles.sparkBar,
              height,
              backgroundColor: RAMPS[metric][bucketOf(metric, value)].fill,
              opacity: index === yearIndex ? 1 : 0.45,
            }}
          />
        );
      })}
    </div>
  );
}

// ============= COMPARISON CHIPS =============

function ComparisonChip({
  state,
  metric,
  yearIndex,
  onUnpin,
}: {
  state: StateDatum;
  metric: MetricKey;
  yearIndex: number;
  onUnpin: (code: string) => void;
}) {
  const def = METRICS[metric];
  const series = state.series[metric];
  const current = series[yearIndex];
  const delta = current - series[0];
  const isGood =
    delta === 0 ? null : def.better === 'higher' ? delta > 0 : delta < 0;
  const deltaStyle =
    isGood == null ? undefined : isGood ? styles.gain : styles.loss;
  return (
    <div style={styles.chip}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="code" size="sm">
            {state.code}
          </Text>
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              {state.name}
            </Text>
          </StackItem>
          <IconButton
            label={\`Unpin \${state.name}\`}
            tooltip={\`Unpin \${state.name}\`}
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={() => onUnpin(state.code)}
          />
        </HStack>
        <HStack gap={3} vAlign="center">
          <YearSparkline metric={metric} series={series} yearIndex={yearIndex} />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body" weight="semibold" hasTabularNumbers>
                {def.format(current)}
              </Text>
              <Text type="supporting" hasTabularNumbers style={deltaStyle}>
                {def.formatDelta(delta)} since {YEARS[0]}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
      </VStack>
    </div>
  );
}

// ============= CARTOGRAM =============

function StateTile({
  state,
  metric,
  yearIndex,
  isPinned,
  isDimmed,
  showValue,
  transition,
  onToggle,
}: {
  state: StateDatum;
  metric: MetricKey;
  yearIndex: number;
  isPinned: boolean;
  isDimmed: boolean;
  showValue: boolean;
  transition: string | undefined;
  onToggle: (code: string) => void;
}) {
  const def = METRICS[metric];
  const value = state.series[metric][yearIndex];
  const stop = RAMPS[metric][bucketOf(metric, value)];
  return (
    <button
      type="button"
      aria-pressed={isPinned}
      aria-label={\`\${state.name}: \${def.format(value)} \${def.shortLabel} in \${
        YEARS[yearIndex]
      }\${isPinned ? ' — pinned' : ''}\`}
      onClick={() => onToggle(state.code)}
      style={{
        ...styles.tile,
        ...(isPinned ? styles.tilePinned : null),
        ...(isDimmed ? styles.dimmed : null),
        gridColumn: \`\${state.col + 1}\`,
        gridRow: \`\${state.row + 1}\`,
        backgroundColor: stop.fill,
        color: stop.ink,
        transition,
      }}>
      <Text type="code" size="sm" weight="semibold" color="inherit">
        {state.code}
      </Text>
      {showValue && (
        <Text type="supporting" color="inherit" hasTabularNumbers>
          {def.format(value)}
        </Text>
      )}
    </button>
  );
}

// ============= RANKING =============

interface RankedEntry {
  state: StateDatum;
  value: number;
  rank: number;
}

function RankingList({
  entries,
  metric,
  bucketFilter,
  pins,
  onToggle,
  registerRow,
}: {
  entries: RankedEntry[];
  metric: MetricKey;
  bucketFilter: number | null;
  pins: string[];
  onToggle: (code: string) => void;
  registerRow: (code: string, node: HTMLButtonElement | null) => void;
}) {
  const def = METRICS[metric];
  return (
    <VStack gap={0}>
      {entries.map(entry => {
        const isPinned = pins.includes(entry.state.code);
        const bucket = bucketOf(metric, entry.value);
        const isDimmed = bucketFilter != null && bucket !== bucketFilter;
        return (
          <button
            key={entry.state.code}
            type="button"
            ref={node => registerRow(entry.state.code, node)}
            aria-pressed={isPinned}
            aria-label={\`Rank \${entry.rank}: \${entry.state.name}, \${def.format(
              entry.value,
            )}\${isPinned ? ' — pinned' : ''}\`}
            onClick={() => onToggle(entry.state.code)}
            style={{
              ...styles.rankRow,
              ...(isPinned ? styles.rankRowPinned : null),
              ...(isDimmed ? styles.dimmed : null),
            }}>
            <span style={styles.rankIndex}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {entry.rank}
              </Text>
            </span>
            <Text type="code" size="sm" weight={isPinned ? 'semibold' : undefined}>
              {entry.state.code}
            </Text>
            <div style={styles.rankBarTrack} aria-hidden="true">
              <div
                style={{
                  ...styles.rankBarFill,
                  width: \`\${barShare(metric, entry.value).toFixed(1)}%\`,
                  backgroundColor: RAMPS[metric][bucket].fill,
                }}
              />
            </div>
            <span style={styles.rankValue}>
              <Text type="supporting" hasTabularNumbers>
                {def.format(entry.value)}
              </Text>
            </span>
          </button>
        );
      })}
    </VStack>
  );
}

// ============= PAGE =============

export default function RegionTileCartogramTemplate() {
  const [metric, setMetric] = useState<MetricKey>('adoption');
  const [yearIndex, setYearIndex] = useState(YEARS.length - 1);
  const [isPlaying, setIsPlaying] = useState(false);
  // Ordered pin list, oldest first; capped at three (oldest drops).
  const [pins, setPins] = useState<string[]>(['CA', 'TX']);
  const [lastPinned, setLastPinned] = useState<string | null>(null);
  const [bucketFilter, setBucketFilter] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  // Responsive contract (see header): panel docks >1024, values on tiles
  // >900, phone board <=640. Reduced motion kills the color tweens and
  // smooth scrolling; stepping still works.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const showTileValues = !useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const rankRowRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const def = METRICS[metric];
  const year = YEARS[yearIndex];

  // Year playback: the tick advances an index into the fixture years —
  // the whole surface is a pure function of that index, so pausing
  // genuinely freezes the atlas.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setYearIndex(prev => (prev + 1) % YEARS.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  // The newest pin scrolls into view inside the ranking list.
  useEffect(() => {
    if (lastPinned == null) {
      return;
    }
    const node = rankRowRefs.current.get(lastPinned);
    node?.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [lastPinned, prefersReducedMotion]);

  const togglePin = (code: string) => {
    setPins(current => {
      if (current.includes(code)) {
        return current.filter(pinned => pinned !== code);
      }
      const next =
        current.length >= MAX_PINS
          ? [...current.slice(1), code]
          : [...current, code];
      return next;
    });
    setLastPinned(prev => (pins.includes(code) ? prev : code));
  };

  const registerRow = (code: string, node: HTMLButtonElement | null) => {
    if (node == null) {
      rankRowRefs.current.delete(code);
    } else {
      rankRowRefs.current.set(code, node);
    }
  };

  const ranked = useMemo<RankedEntry[]>(() => {
    const byValueDesc = [...STATES]
      .map(state => ({state, value: state.series[metric][yearIndex]}))
      .sort(
        (a, b) =>
          b.value - a.value || a.state.code.localeCompare(b.state.code),
      )
      .map((entry, index) => ({...entry, rank: index + 1}));
    return sortDir === 'desc' ? byValueDesc : [...byValueDesc].reverse();
  }, [metric, yearIndex, sortDir]);

  const bucketCounts = useMemo(() => {
    const counts = new Array<number>(BUCKET_COUNT).fill(0);
    for (const state of STATES) {
      counts[bucketOf(metric, state.series[metric][yearIndex])] += 1;
    }
    return counts;
  }, [metric, yearIndex]);

  const pinnedStates = pins
    .map(code => STATE_BY_CODE.get(code))
    .filter((state): state is StateDatum => state != null);

  const tileTransition = prefersReducedMotion
    ? undefined
    : 'background-color 400ms ease, color 400ms ease, opacity 200ms ease';

  // ---- Year transport ----

  const yearToolbar = (
    <HStack gap={2} vAlign="center" style={styles.toolbarRow}>
      <IconButton
        label="Previous year"
        tooltip="Previous year"
        size="sm"
        variant="secondary"
        icon={<Icon icon={ChevronLeftIcon} size="sm" />}
        isDisabled={yearIndex === 0}
        onClick={() => setYearIndex(prev => Math.max(0, prev - 1))}
      />
      <SegmentedControl
        label="Fixture year"
        value={String(year)}
        onChange={value => {
          setIsPlaying(false);
          setYearIndex(YEARS.findIndex(candidate => String(candidate) === value));
        }}
        size="sm">
        {YEARS.map(candidate => (
          <SegmentedControlItem
            key={candidate}
            label={String(candidate)}
            value={String(candidate)}
          />
        ))}
      </SegmentedControl>
      <IconButton
        label="Next year"
        tooltip="Next year"
        size="sm"
        variant="secondary"
        icon={<Icon icon={ChevronRightIcon} size="sm" />}
        isDisabled={yearIndex === YEARS.length - 1}
        onClick={() =>
          setYearIndex(prev => Math.min(YEARS.length - 1, prev + 1))
        }
      />
      <Button
        label={isPlaying ? 'Pause' : 'Play years'}
        variant="secondary"
        size="sm"
        icon={<Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" />}
        onClick={() => setIsPlaying(playing => !playing)}
      />
      <StackItem size="fill" />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {def.label} · {year} · 50 states
      </Text>
    </HStack>
  );

  // ---- Pinned comparison chips ----

  const chipsRow = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="label" color="secondary">
          Pinned comparison
        </Text>
        <Badge
          variant={pins.length > 0 ? 'info' : 'neutral'}
          label={\`\${pins.length}/\${MAX_PINS} pinned\`}
        />
        <StackItem size="fill" />
        {pins.length > 0 && (
          <Button
            label="Clear pins"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPins([]);
              setLastPinned(null);
            }}
          />
        )}
      </HStack>
      <HStack gap={3} vAlign="start" style={styles.chipRow}>
        {pinnedStates.map(state => (
          <ComparisonChip
            key={state.code}
            state={state}
            metric={metric}
            yearIndex={yearIndex}
            onUnpin={togglePin}
          />
        ))}
        {pinnedStates.length === 0 && (
          <div style={styles.chipHint}>
            <Text type="supporting" color="secondary">
              Tap tiles (or ranking rows) to pin up to three states — pins
              become comparison chips with five-year sparklines, and the
              oldest pin drops when a fourth arrives.
            </Text>
          </div>
        )}
      </HStack>
    </VStack>
  );

  // ---- Cartogram panel ----

  const board = (
    <div
      role="group"
      aria-label={\`Tile cartogram: \${def.shortLabel} by state, \${year}\`}
      style={{
        ...styles.mapGrid,
        ...(isPhone ? styles.mapGridCompact : null),
      }}>
      {STATES.map(state => {
        const value = state.series[metric][yearIndex];
        const isDimmed =
          bucketFilter != null && bucketOf(metric, value) !== bucketFilter;
        return (
          <StateTile
            key={state.code}
            state={state}
            metric={metric}
            yearIndex={yearIndex}
            isPinned={pins.includes(state.code)}
            isDimmed={isDimmed}
            showValue={showTileValues}
            transition={tileTransition}
            onToggle={togglePin}
          />
        );
      })}
    </div>
  );

  const mapPanel = (
    <div style={styles.mapPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Schematic tile grid — fixture coordinates, no projection
            </Text>
          </StackItem>
          {!isPhone && (
            <Text type="supporting" color="secondary">
              Tap a tile to pin · stronger = more
            </Text>
          )}
        </HStack>
        {/* Phone: the board keeps 44px tap targets and pans sideways
            inside this panel — the page's one deliberate overflow-x. */}
        {isPhone ? <div style={styles.mapScroll}>{board}</div> : board}
      </VStack>
    </div>
  );

  // ---- Quantize legend (doubles as bucket filter) ----

  const legend = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" style={styles.legendRow}>
        <Text type="label" color="secondary">
          Quantize legend — click a bucket to filter
        </Text>
        <Token
          size="sm"
          color={def.better === 'higher' ? 'green' : 'red'}
          label={def.better === 'higher' ? 'higher is better' : 'lower is better'}
        />
      </HStack>
      <HStack gap={2} vAlign="center" style={styles.legendRow}>
        {RAMPS[metric].map((stop, bucket) => (
          <ToggleButton
            key={bucket}
            label={\`Bucket \${bucket + 1}: \${bucketRange(metric, bucket)} — \${
              bucketCounts[bucket]
            } states\`}
            size="sm"
            isPressed={bucketFilter === bucket}
            onPressedChange={isPressed =>
              setBucketFilter(isPressed ? bucket : null)
            }>
            <HStack gap={2} vAlign="center">
              <span
                style={{...styles.legendSwatch, backgroundColor: stop.fill}}
                aria-hidden
              />
              <Text type="inherit" hasTabularNumbers>
                {bucketRange(metric, bucket)}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {bucketCounts[bucket]}
              </Text>
            </HStack>
          </ToggleButton>
        ))}
        {bucketFilter != null && (
          <Button
            label="Clear bucket filter"
            variant="ghost"
            size="sm"
            onClick={() => setBucketFilter(null)}
          />
        )}
      </HStack>
    </VStack>
  );

  // ---- Linked ranking bar chart ----

  const rankingHeader = (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <VStack gap={0}>
          <Heading level={3}>Ranking</Heading>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {def.label} · {year} · click a row to pin
          </Text>
        </VStack>
      </StackItem>
      <IconButton
        label={
          sortDir === 'desc'
            ? 'Sort low to high'
            : 'Sort high to low'
        }
        tooltip={sortDir === 'desc' ? 'Sort low to high' : 'Sort high to low'}
        size="sm"
        variant="secondary"
        icon={
          <Icon
            icon={
              sortDir === 'desc'
                ? ArrowDownWideNarrowIcon
                : ArrowUpNarrowWideIcon
            }
            size="sm"
          />
        }
        onClick={() => setSortDir(dir => (dir === 'desc' ? 'asc' : 'desc'))}
      />
    </HStack>
  );

  const rankingList = (
    <RankingList
      entries={ranked}
      metric={metric}
      bucketFilter={bucketFilter}
      pins={pins}
      onToggle={togglePin}
      registerRow={registerRow}
    />
  );

  const dockedRanking = (
    <LayoutPanel width={340} padding={0} hasDivider label="State ranking">
      <div style={styles.rankScrollDocked}>
        <VStack gap={3}>
          {rankingHeader}
          {rankingList}
        </VStack>
      </div>
    </LayoutPanel>
  );

  const stackedRanking = (
    <VStack gap={3}>
      {rankingHeader}
      <div style={styles.rankScrollStacked}>{rankingList}</div>
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
                <Heading level={1}>Metric Atlas</Heading>
                <Text type="supporting" color="secondary">
                  {isPhone
                    ? '50 states · 5 fixture years'
                    : '50 states · 5 fixture years · schematic tile cartogram'}
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Metric"
              value={metric}
              onChange={value => setMetric(value as MetricKey)}
              size="sm">
              {METRIC_ORDER.map(key => (
                <SegmentedControlItem
                  key={key}
                  label={METRICS[key].label}
                  value={key}
                />
              ))}
            </SegmentedControl>
          </HStack>
        </LayoutHeader>
      }
      end={isStacked ? undefined : dockedRanking}
      content={
        <LayoutContent padding={isPhone ? 4 : 6}>
          <div style={styles.column}>
            <VStack gap={5}>
              {yearToolbar}
              {chipsRow}
              {mapPanel}
              {legend}
              {isStacked && (
                <>
                  <Divider />
                  {stackedRanking}
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