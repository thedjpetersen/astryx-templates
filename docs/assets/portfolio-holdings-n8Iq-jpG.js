var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file portfolio-holdings.tsx
 * @input Deterministic fixtures only (nine holdings with fixed share
 *   counts, purchase lots, and 12-week close series; six watchlist
 *   symbols with fixed 10-week closes — every value, day change, gain,
 *   weight, and sparkline derives from those arrays; no clocks,
 *   randomness, or network assets)
 * @output Investment portfolio: summary header (total value, day change,
 *   total gain/loss with signed coloring), an allocation donut built with
 *   a CSS conic-gradient plus legend and a class/sector grouping switch,
 *   a filterable holdings table (ticker, name, shares, price, value,
 *   gain/loss, mini CSS bar sparkline) with a totals row, a position
 *   detail panel with a purchase-lots table, and a watchlist rail with
 *   working star toggles.
 * @position Page template; emitted by \`astryx template portfolio-holdings\`
 *
 * Frame: LayoutHeader (title + actions + summary metric strip) |
 * LayoutContent (allocation donut Card, holdings table Card) |
 * LayoutPanel end 340 (position detail with lots table on top, watchlist
 * rail below, one shared vertical scroll).
 *
 * Interaction contract:
 * - Selected ticker lives in useState(string | null). Holding rows are
 *   keyboard-reachable (tabIndex 0, Enter/Space toggle) and carry
 *   aria-selected; clicking the selected row again deselects. The
 *   selection populates the position detail pane (metadata + lots table).
 * - Donut grouping lives in useState('class' | 'sector'); the
 *   SegmentedControl regroups the conic-gradient segments and legend.
 * - The holdings filter (All / Equities / Bonds / Cash) lives in
 *   useState and refilters the table plus its totals row.
 * - Watchlist stars live in useState(Set<string>); tapping the star
 *   IconButton toggles it and starred symbols sort to the top.
 *
 * Responsive contract:
 * - > 1080px: the detail + watchlist rail is a docked LayoutPanel on the
 *   end edge (width 340) with its own vertical scroll.
 * - <= 1080px: the end panel leaves the frame; the detail card and the
 *   watchlist card render below the holdings table inside the shared
 *   LayoutContent scroller, side by side while two 320px tracks fit and
 *   stacked otherwise (Grid auto-fit).
 * - <= 900px: the 12-week sparkline column is hidden so the numeric
 *   columns keep readable widths; the same trend renders inside the
 *   position detail, so no data is hover-only or lost.
 * - <= 640px (single-pane fallback for the docked panel): the Shares and
 *   Price columns are also hidden (ticker, value, gain/loss remain);
 *   selecting a holding swaps LayoutContent to a full-width position
 *   detail pane with a back IconButton that returns to the portfolio;
 *   the header title row and the summary metric strip wrap instead of
 *   clipping; the donut and its legend stack vertically; the Grid rail
 *   fallback drops its 320px floor (columns={1}) so nothing forces
 *   horizontal panning at 375px. Header actions and row targets keep
 *   ~40px touch height, and every interaction is tap/keyboard driven —
 *   nothing is hover-only.
 * - Frame: Layout height="fill" keeps the header pinned; LayoutContent
 *   scrolls as one vertical region; wide numeric cells use tabular
 *   numerals and nowrap so columns never shear, and hidden-column
 *   fallbacks (not sideways scrolling) handle narrow widths.
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
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
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  CrosshairIcon,
  PlusIcon,
  RefreshCwIcon,
  StarIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  row: {
    cursor: 'pointer',
  },
  rowSelected: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Money and share columns keep tabular numerals so digits stay aligned.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  numericHeader: {
    textAlign: 'end',
  },
  // Signed coloring for gains and losses (summary strip, table, detail).
  gain: {color: 'var(--color-success)'},
  loss: {color: 'var(--color-error)'},
  // Mini CSS bar sparkline: fixed-height flex row, bars grow from the
  // baseline. Purely decorative — the signed figures carry the meaning.
  spark: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 1,
    height: 24,
    justifyContent: 'flex-end',
  },
  sparkBar: {
    width: 3,
    flex: 'none',
    borderRadius: 1,
  },
  // Donut ring: conic-gradient with a radial-gradient mask cutting the
  // hole, so the center stays transparent on any card background. The
  // mask consumes alpha only, so the opaque stop uses the scheme-neutral
  // \`black\` keyword — no color literal, identical in light and dark.
  donutWrap: {
    position: 'relative',
    flex: 'none',
  },
  donutRing: {
    borderRadius: '50%',
    WebkitMask:
      'radial-gradient(farthest-side, transparent calc(100% - 30px), black calc(100% - 29px))',
    mask: 'radial-gradient(farthest-side, transparent calc(100% - 30px), black calc(100% - 29px))',
  },
  donutCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    pointerEvents: 'none',
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flex: 'none',
  },
  // Docked rail: one shared vertical scroller for detail + watchlist.
  railScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },
  railSection: {
    padding: 'var(--spacing-4)',
  },
  railList: {
    padding: 'var(--spacing-2) 0',
  },
};

// Allocation palette via Astryx categorical data tokens; segments are
// assigned in descending-value order so colors stay deterministic. Each
// fallback is a light-dark() pair: the light value is the original hue,
// the dark value keeps the hue but lifts lightness so segments stay
// legible on dark card surfaces.
const SEGMENT_COLORS = [
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D7BFF))',
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9A45))',
  'var(--color-data-categorical-green, light-dark(#0B991F, #3DD65A))',
  'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
  'var(--color-data-categorical-pink, light-dark(#D91E76, #FF6AA9))',
  'var(--color-data-categorical-red, light-dark(#D92D20, #FF6B5E))',
  'var(--color-data-categorical-yellow, light-dark(#B78103, #E8B94A))',
];

const TREND_COLORS = {
  up: 'var(--color-success)',
  down: 'var(--color-error)',
  flat: 'var(--color-text-secondary)',
};

// ============= DATA =============

type AssetClass = 'US Equity' | 'Intl Equity' | 'Fixed Income' | 'Cash';
type ClassFilter = 'all' | 'equity' | 'fixed' | 'cash';
type GroupBy = 'class' | 'sector';

interface Lot {
  id: string;
  acquired: string; // fixed ISO date, rendered as-is
  shares: number;
  costPerShare: number;
}

interface Holding {
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sector: string;
  shares: number;
  /**
   * Twelve weekly closes, oldest first. The last entry is the live
   * price; the second-to-last is the prior close, so the day change
   * derives from the same series the sparkline draws.
   */
  closes: number[];
  lots: Lot[];
}

interface WatchItem {
  symbol: string;
  name: string;
  /** Ten weekly closes, oldest first; last = price, previous = prior close. */
  closes: number[];
}

// Meridian Brokerage · Individual account. Fixed closes and lots — every
// figure on the page is arithmetic over these arrays.
const HOLDINGS: Holding[] = [
  {
    ticker: 'NVTX',
    name: 'Novatex Systems',
    assetClass: 'US Equity',
    sector: 'Technology',
    shares: 120,
    closes: [
      148.2, 152.6, 149.9, 157.4, 161.8, 158.3, 166.1, 170.4, 175.2, 178.9,
      182.1, 186.4,
    ],
    lots: [
      {id: 'nvtx-1', acquired: '2023-03-14', shares: 80, costPerShare: 96.5},
      {id: 'nvtx-2', acquired: '2024-08-02', shares: 40, costPerShare: 141.25},
    ],
  },
  {
    ticker: 'HLXB',
    name: 'Helix Biolabs',
    assetClass: 'US Equity',
    sector: 'Healthcare',
    shares: 60,
    closes: [
      196.4, 199.1, 194.8, 201.3, 203.6, 207.2, 205.4, 209.8, 208.1, 211.5,
      212.95, 214.6,
    ],
    lots: [
      {id: 'hlxb-1', acquired: '2023-11-06', shares: 60, costPerShare: 168.4},
    ],
  },
  {
    ticker: 'FSTB',
    name: 'Firstbridge Financial',
    assetClass: 'US Equity',
    sector: 'Financials',
    shares: 150,
    closes: [
      44.1, 44.8, 45.6, 45.2, 46.3, 47.1, 46.8, 47.6, 48.4, 49.1, 48.9, 48.35,
    ],
    lots: [
      {id: 'fstb-1', acquired: '2022-06-21', shares: 100, costPerShare: 39.8},
      {id: 'fstb-2', acquired: '2024-02-09', shares: 50, costPerShare: 44.15},
    ],
  },
  {
    ticker: 'CNDR',
    name: 'Condor Energy',
    assetClass: 'US Equity',
    sector: 'Energy',
    shares: 90,
    closes: [
      68.4, 66.9, 65.2, 66.1, 63.8, 62.4, 63.1, 61.7, 60.2, 59.4, 59.85, 61.2,
    ],
    lots: [
      {id: 'cndr-1', acquired: '2024-04-17', shares: 90, costPerShare: 72.4},
    ],
  },
  {
    ticker: 'ORCH',
    name: 'Orchard Retail Group',
    assetClass: 'US Equity',
    sector: 'Consumer',
    shares: 140,
    closes: [
      43.6, 42.9, 42.1, 41.4, 40.8, 41.2, 40.1, 39.4, 38.9, 38.2, 38.6, 37.85,
    ],
    lots: [
      {id: 'orch-1', acquired: '2025-01-28', shares: 140, costPerShare: 41.2},
    ],
  },
  {
    ticker: 'MRDX',
    name: 'Meridian Intl Index',
    assetClass: 'Intl Equity',
    sector: 'Intl diversified',
    shares: 210,
    closes: [
      58.9, 59.6, 60.2, 59.8, 61.1, 61.7, 62.4, 62.1, 63.0, 63.4, 63.7, 64.15,
    ],
    lots: [
      {id: 'mrdx-1', acquired: '2022-09-12', shares: 120, costPerShare: 52.3},
      {id: 'mrdx-2', acquired: '2024-11-20', shares: 90, costPerShare: 58.75},
    ],
  },
  {
    ticker: 'CBND',
    name: 'Corebond Aggregate',
    assetClass: 'Fixed Income',
    sector: 'Fixed income',
    shares: 320,
    closes: [
      25.1, 25.05, 24.9, 24.95, 24.8, 24.85, 24.7, 24.75, 24.6, 24.7, 24.65,
      24.6,
    ],
    lots: [
      {id: 'cbnd-1', acquired: '2023-05-08', shares: 200, costPerShare: 25.4},
      {id: 'cbnd-2', acquired: '2025-03-03', shares: 120, costPerShare: 24.9},
    ],
  },
  {
    ticker: 'BMNI',
    name: 'Bright Muni Income',
    assetClass: 'Fixed Income',
    sector: 'Fixed income',
    shares: 180,
    closes: [
      50.6, 50.7, 50.65, 50.8, 50.9, 50.85, 51.0, 51.1, 51.05, 51.15, 51.22,
      51.3,
    ],
    lots: [
      {id: 'bmni-1', acquired: '2023-08-15', shares: 180, costPerShare: 49.85},
    ],
  },
  {
    ticker: 'FDMM',
    name: 'Federated Money Market',
    assetClass: 'Cash',
    sector: 'Cash',
    shares: 18450,
    closes: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    lots: [
      {id: 'fdmm-1', acquired: '2026-01-02', shares: 18450, costPerShare: 1},
    ],
  },
];

const WATCHLIST: WatchItem[] = [
  {
    symbol: 'ASTR',
    name: 'Astral Robotics',
    closes: [121.4, 125.8, 130.2, 127.6, 133.4, 137.1, 140.8, 139.2, 143.75, 148.2],
  },
  {
    symbol: 'QNTM',
    name: 'Quantum Grid',
    closes: [69.8, 71.2, 70.4, 72.6, 73.1, 72.4, 73.8, 74.2, 73.9, 74.6],
  },
  {
    symbol: 'PLNT',
    name: 'Planta Foods',
    closes: [25.4, 24.9, 24.2, 23.8, 24.1, 23.4, 23.0, 22.8, 22.6, 22.15],
  },
  {
    symbol: 'RVWR',
    name: 'Riverware Cloud',
    closes: [281.6, 288.4, 284.9, 292.3, 296.8, 301.2, 298.6, 303.4, 305.15, 310.4],
  },
  {
    symbol: 'SLRC',
    name: 'Solarcore Energy',
    closes: [49.8, 48.6, 47.9, 48.4, 47.2, 46.8, 47.4, 46.5, 46.05, 45.3],
  },
  {
    symbol: 'TIDE',
    name: 'Tidewater Marine',
    closes: [84.2, 85.1, 86.4, 85.8, 86.9, 87.6, 88.4, 87.9, 88.15, 88.9],
  },
];

const CLASS_TOKEN: Record<AssetClass, 'blue' | 'purple' | 'green' | 'yellow'> =
  {
    'US Equity': 'blue',
    'Intl Equity': 'purple',
    'Fixed Income': 'green',
    Cash: 'yellow',
  };

const CLASS_FILTER_MATCH: Record<Exclude<ClassFilter, 'all'>, AssetClass[]> = {
  equity: ['US Equity', 'Intl Equity'],
  fixed: ['Fixed Income'],
  cash: ['Cash'],
};

// ---- Derived helpers (pure; all fixture math lives here) ----

/** Live price = last weekly close. */
function price(holding: Holding) {
  return holding.closes[holding.closes.length - 1];
}

/** Prior close = second-to-last weekly close. */
function prevClose(holding: Holding) {
  return holding.closes[holding.closes.length - 2];
}

function marketValue(holding: Holding) {
  return holding.shares * price(holding);
}

function dayChange(holding: Holding) {
  return holding.shares * (price(holding) - prevClose(holding));
}

function costBasis(holding: Holding) {
  return holding.lots.reduce(
    (sum, lot) => sum + lot.shares * lot.costPerShare,
    0,
  );
}

function totalGain(holding: Holding) {
  return marketValue(holding) - costBasis(holding);
}

function lotGain(lot: Lot, holding: Holding) {
  return lot.shares * (price(holding) - lot.costPerShare);
}

const PORTFOLIO_VALUE = HOLDINGS.reduce(
  (sum, holding) => sum + marketValue(holding),
  0,
);
const PORTFOLIO_COST = HOLDINGS.reduce(
  (sum, holding) => sum + costBasis(holding),
  0,
);
const PORTFOLIO_DAY_CHANGE = HOLDINGS.reduce(
  (sum, holding) => sum + dayChange(holding),
  0,
);
const PORTFOLIO_GAIN = PORTFOLIO_VALUE - PORTFOLIO_COST;

// ---- Formatters (fixed locale so output is deterministic) ----

function formatMoney(value: number) {
  const digits = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return \`\${value < 0 ? '-' : ''}$\${digits}\`;
}

function formatSignedMoney(value: number) {
  return value > 0 ? \`+\${formatMoney(value)}\` : formatMoney(value);
}

function formatSignedPercent(value: number) {
  return \`\${value > 0 ? '+' : ''}\${value.toFixed(2)}%\`;
}

function formatShares(value: number) {
  return value.toLocaleString('en-US', {maximumFractionDigits: 0});
}

/** Signed coloring: green above zero, red below, default at zero. */
function signStyle(value: number): CSSProperties | undefined {
  if (value > 0) {
    return styles.gain;
  }
  if (value < 0) {
    return styles.loss;
  }
  return undefined;
}

// ---- Allocation segments ----

interface AllocationSegment {
  label: string;
  value: number;
  share: number; // percent of portfolio value
  color: string;
}

function buildSegments(groupBy: GroupBy): AllocationSegment[] {
  const totals = new Map<string, number>();
  for (const holding of HOLDINGS) {
    const key = groupBy === 'class' ? holding.assetClass : holding.sector;
    totals.set(key, (totals.get(key) ?? 0) + marketValue(holding));
  }
  return [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => ({
      label,
      value,
      share: (value / PORTFOLIO_VALUE) * 100,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    }));
}

/** Cumulative conic-gradient stops; the final stop pins to 100%. */
function donutGradient(segments: AllocationSegment[]) {
  let acc = 0;
  const stops = segments.map((segment, index) => {
    const start = acc.toFixed(2);
    acc += segment.share;
    const end = index === segments.length - 1 ? '100' : acc.toFixed(2);
    return \`\${segment.color} \${start}% \${end}%\`;
  });
  return \`conic-gradient(\${stops.join(', ')})\`;
}

// ============= SPARKLINE =============

/**
 * Mini CSS bar sparkline: one 3px bar per weekly close, heights
 * normalized into a 24px band, tinted by overall trend. Decorative only
 * (aria-hidden) — the adjacent signed figures carry the same information.
 */
function Sparkline({closes}: {closes: number[]}) {
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min;
  const last = closes[closes.length - 1];
  const first = closes[0];
  const trend = last > first ? 'up' : last < first ? 'down' : 'flat';
  const color = TREND_COLORS[trend];
  return (
    <div style={styles.spark} aria-hidden="true">
      {closes.map((close, index) => {
        const height =
          range === 0 ? 10 : 4 + Math.round(((close - min) / range) * 20);
        return (
          <div
            key={index}
            style={{
              ...styles.sparkBar,
              height,
              backgroundColor: color,
              opacity: index === closes.length - 1 ? 1 : 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

// ============= ALLOCATION DONUT =============

/**
 * CSS conic-gradient donut: the ring is a masked conic-gradient div (no
 * SVG, no chart library) with the portfolio total centered in the hole.
 * The legend beside it repeats every segment as text, so the graphic
 * itself can stay a described image.
 */
function AllocationDonut({
  segments,
  size,
}: {
  segments: AllocationSegment[];
  size: number;
}) {
  const summary = segments
    .map(segment => \`\${segment.label} \${segment.share.toFixed(1)}%\`)
    .join(', ');
  return (
    <div style={{...styles.donutWrap, width: size, height: size}}>
      <div
        role="img"
        aria-label={\`Allocation donut: \${summary}\`}
        style={{
          ...styles.donutRing,
          width: size,
          height: size,
          background: donutGradient(segments),
        }}
      />
      <div style={styles.donutCenter}>
        <Text type="supporting" color="secondary">
          Total value
        </Text>
        <Text type="body" weight="semibold" hasTabularNumbers>
          {formatMoney(PORTFOLIO_VALUE)}
        </Text>
      </div>
    </div>
  );
}

function AllocationLegend({segments}: {segments: AllocationSegment[]}) {
  return (
    <VStack gap={2}>
      {segments.map(segment => (
        <HStack key={segment.label} gap={2} vAlign="center">
          <div
            style={{...styles.legendSwatch, backgroundColor: segment.color}}
          />
          <StackItem size="fill">
            <Text type="body" maxLines={1}>
              {segment.label}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {segment.share.toFixed(1)}%
          </Text>
          <Text type="body" hasTabularNumbers>
            {formatMoney(segment.value)}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

// ============= SUMMARY METRIC =============

/**
 * One summary-strip metric: label above, value + signed context below.
 * Positive figures render green with an up glyph, negative red with a
 * down glyph, zero stays neutral with no glyph.
 */
function SummaryMetric({
  label,
  value,
  change,
  changePercent,
}: {
  label: string;
  value: string;
  change?: number;
  changePercent?: number;
}) {
  return (
    <VStack gap={0.5}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <HStack gap={1.5} vAlign="center">
        <Text type="body" weight="semibold" hasTabularNumbers>
          {value}
        </Text>
        {change !== undefined && change !== 0 && (
          <span style={signStyle(change)}>
            <Icon
              icon={change > 0 ? TrendingUpIcon : TrendingDownIcon}
              size="sm"
            />
          </span>
        )}
        {change !== undefined && (
          <Text type="body" hasTabularNumbers style={signStyle(change)}>
            {formatSignedMoney(change)}
            {changePercent !== undefined &&
              \` (\${formatSignedPercent(changePercent)})\`}
          </Text>
        )}
      </HStack>
    </VStack>
  );
}

// ============= POSITION DETAIL =============

/**
 * Detail pane for the selected holding: identity row, signed metrics,
 * metadata, and the purchase-lots table. Docked in the end panel on wide
 * viewports, an inline card at mid widths, and the full content pane
 * (with a back button) at phone widths.
 */
function PositionDetail({
  holding,
  isPhone,
  onClose,
}: {
  holding: Holding;
  isPhone: boolean;
  onClose: () => void;
}) {
  const value = marketValue(holding);
  const day = dayChange(holding);
  const gain = totalGain(holding);
  const cost = costBasis(holding);
  const weight = (value / PORTFOLIO_VALUE) * 100;
  const dayPercent =
    prevClose(holding) === price(holding)
      ? 0
      : (day / (holding.shares * prevClose(holding))) * 100;

  return (
    <VStack gap={4}>
      {/* Identity row: back affordance on phones, close elsewhere. */}
      <HStack gap={2} vAlign="start">
        {isPhone && (
          <IconButton
            label="Back to portfolio"
            tooltip="Back to portfolio"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onClose}
          />
        )}
        <StackItem size="fill">
          <VStack gap={0.5}>
            <HStack gap={2} vAlign="center">
              <Heading level={3}>{holding.ticker}</Heading>
              <Token
                size="sm"
                color={CLASS_TOKEN[holding.assetClass]}
                label={holding.assetClass}
              />
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {holding.name} · {holding.sector}
            </Text>
          </VStack>
        </StackItem>
        {!isPhone && (
          <IconButton
            label="Close position detail"
            tooltip="Close position detail"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        )}
      </HStack>

      {/* Signed headline figures for the position. */}
      <HStack gap={6} vAlign="start" wrap="wrap">
        <SummaryMetric label="Market value" value={formatMoney(value)} />
        <SummaryMetric
          label="Day change"
          value={formatSignedMoney(day)}
          change={day === 0 ? undefined : day}
          changePercent={day === 0 ? undefined : dayPercent}
        />
        <SummaryMetric
          label="Total gain/loss"
          value={formatSignedMoney(gain)}
          change={gain === 0 ? undefined : gain}
          changePercent={gain === 0 ? undefined : (gain / cost) * 100}
        />
      </HStack>

      <MetadataList columns={1} label={{position: 'start', width: 110}}>
        <MetadataListItem label="Shares">
          <Text type="body" hasTabularNumbers>
            {formatShares(holding.shares)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Last price">
          <Text type="body" hasTabularNumbers>
            {formatMoney(price(holding))}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Prev close">
          <Text type="body" hasTabularNumbers>
            {formatMoney(prevClose(holding))}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Avg cost">
          <Text type="body" hasTabularNumbers>
            {formatMoney(cost / holding.shares)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Cost basis">
          <Text type="body" hasTabularNumbers>
            {formatMoney(cost)}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Weight">
          <Text type="body" hasTabularNumbers>
            {weight.toFixed(1)}% of portfolio
          </Text>
        </MetadataListItem>
      </MetadataList>

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label">Purchase lots</Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            12-week trend
          </Text>
          <Sparkline closes={holding.closes} />
        </HStack>
        <Table density="compact" dividers="rows">
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Acquired</TableHeaderCell>
              <TableHeaderCell scope="col" style={styles.numericHeader}>
                Shares
              </TableHeaderCell>
              <TableHeaderCell scope="col" style={styles.numericHeader}>
                Cost/sh
              </TableHeaderCell>
              <TableHeaderCell scope="col" style={styles.numericHeader}>
                Gain/loss
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holding.lots.map(lot => {
              const gainForLot = lotGain(lot, holding);
              return (
                <TableRow key={lot.id}>
                  <TableCell scope="row">
                    <Text type="body" hasTabularNumbers>
                      {lot.acquired}
                    </Text>
                  </TableCell>
                  <TableCell style={styles.numericCell}>
                    <Text type="body" hasTabularNumbers>
                      {formatShares(lot.shares)}
                    </Text>
                  </TableCell>
                  <TableCell style={styles.numericCell}>
                    <Text type="body" hasTabularNumbers>
                      {formatMoney(lot.costPerShare)}
                    </Text>
                  </TableCell>
                  <TableCell style={styles.numericCell}>
                    <Text
                      type="body"
                      hasTabularNumbers
                      style={signStyle(gainForLot)}>
                      {formatSignedMoney(gainForLot)}
                    </Text>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </VStack>

      <HStack gap={2}>
        <Button label={\`Buy \${holding.ticker}\`} size="sm" />
        <Button label={\`Sell \${holding.ticker}\`} variant="secondary" size="sm" />
      </HStack>
    </VStack>
  );
}

// ============= WATCHLIST =============

/**
 * Watchlist rail: fixed symbols with derived day change and a mini
 * sparkline. The star IconButton is a working toggle — starred symbols
 * sort to the top of the list.
 */
const WATCHLIST_ORDER = new Map(
  WATCHLIST.map((item, index) => [item.symbol, index]),
);

function WatchlistRail({
  starred,
  onToggleStar,
}: {
  starred: ReadonlySet<string>;
  onToggleStar: (symbol: string) => void;
}) {
  const ordered = useMemo(() => {
    return [...WATCHLIST].sort((a, b) => {
      const aStar = starred.has(a.symbol) ? 0 : 1;
      const bStar = starred.has(b.symbol) ? 0 : 1;
      if (aStar !== bStar) {
        return aStar - bStar;
      }
      return (
        (WATCHLIST_ORDER.get(a.symbol) ?? 0) -
        (WATCHLIST_ORDER.get(b.symbol) ?? 0)
      );
    });
  }, [starred]);

  return (
    <List density="compact" hasDividers>
      {ordered.map(item => {
        const last = item.closes[item.closes.length - 1];
        const prev = item.closes[item.closes.length - 2];
        const change = last - prev;
        const changePercent = (change / prev) * 100;
        const isStarred = starred.has(item.symbol);
        return (
          <ListItem
            key={item.symbol}
            label={item.symbol}
            description={item.name}
            startContent={
              <IconButton
                label={
                  isStarred
                    ? \`Unstar \${item.symbol}\`
                    : \`Star \${item.symbol}\`
                }
                tooltip={isStarred ? 'Unstar symbol' : 'Star symbol'}
                size="sm"
                variant="ghost"
                icon={
                  <span style={isStarred ? styles.gain : undefined}>
                    <Icon icon={StarIcon} size="sm" />
                  </span>
                }
                onClick={() => onToggleStar(item.symbol)}
              />
            }
            endContent={
              <HStack gap={3} vAlign="center">
                <Sparkline closes={item.closes} />
                <VStack gap={0.5} hAlign="end">
                  <Text type="body" hasTabularNumbers>
                    {formatMoney(last)}
                  </Text>
                  <Text
                    type="supporting"
                    hasTabularNumbers
                    style={signStyle(change)}>
                    {formatSignedMoney(change)} (
                    {formatSignedPercent(changePercent)})
                  </Text>
                </VStack>
              </HStack>
            }
          />
        );
      })}
    </List>
  );
}

// ============= PAGE =============

export default function PortfolioHoldingsTemplate() {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('class');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [starred, setStarred] = useState<ReadonlySet<string>>(
    () => new Set(['ASTR', 'RVWR']),
  );

  // Responsive contract: <=1080px the rail leaves the frame and stacks
  // below the table; <=900px the sparkline column hides; <=640px the
  // Shares/Price columns hide and selection swaps to a single-pane
  // detail view with a back button.
  const isRailStacked = useMediaQuery('(max-width: 1080px)');
  const isMid = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const selected = useMemo(
    () => HOLDINGS.find(holding => holding.ticker === selectedTicker) ?? null,
    [selectedTicker],
  );

  const segments = useMemo(() => buildSegments(groupBy), [groupBy]);

  const visibleHoldings = useMemo(() => {
    if (classFilter === 'all') {
      return HOLDINGS;
    }
    const classes = CLASS_FILTER_MATCH[classFilter];
    return HOLDINGS.filter(holding => classes.includes(holding.assetClass));
  }, [classFilter]);

  const filteredValue = visibleHoldings.reduce(
    (sum, holding) => sum + marketValue(holding),
    0,
  );
  const filteredGain = visibleHoldings.reduce(
    (sum, holding) => sum + totalGain(holding),
    0,
  );

  const toggleRow = (ticker: string) => {
    setSelectedTicker(current => (current === ticker ? null : ticker));
  };

  const handleRowKeyDown = (event: KeyboardEvent, ticker: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleRow(ticker);
    }
  };

  const toggleStar = (symbol: string) => {
    setStarred(current => {
      const next = new Set(current);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return next;
    });
  };

  // Column visibility mirrors the Responsive contract above.
  const showSpark = !isMid;
  const showSharesAndPrice = !isPhone;

  const detailPane = selected ? (
    <PositionDetail
      holding={selected}
      isPhone={isPhone}
      onClose={() => setSelectedTicker(null)}
    />
  ) : (
    <EmptyState
      isCompact
      icon={<Icon icon={CrosshairIcon} size="lg" />}
      title="No position selected"
      description="Select a holding to inspect its lots, cost basis, and weight."
    />
  );

  const watchlistPane = (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Watchlist</Heading>
        </StackItem>
        <Badge label={\`\${starred.size} starred\`} variant="neutral" />
      </HStack>
      <Text type="supporting" color="secondary">
        Starred symbols sort to the top
      </Text>
      <div style={styles.railList}>
        <WatchlistRail starred={starred} onToggleStar={toggleStar} />
      </div>
    </VStack>
  );

  // ---- Main column: allocation card + holdings table card ----

  const allocationCard = (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Heading level={3}>Allocation</Heading>
              <Text type="supporting" color="secondary">
                Share of {formatMoney(PORTFOLIO_VALUE)} market value
              </Text>
            </VStack>
          </StackItem>
          <SegmentedControl
            label="Group allocation by"
            value={groupBy}
            onChange={value => setGroupBy(value as GroupBy)}
            size="sm">
            <SegmentedControlItem label="By class" value="class" />
            <SegmentedControlItem label="By sector" value="sector" />
          </SegmentedControl>
        </HStack>
        {/* Donut + legend sit side by side; at phone widths they stack. */}
        {isPhone ? (
          <VStack gap={4} hAlign="center">
            <AllocationDonut segments={segments} size={180} />
            <StackItem size="fill">
              <AllocationLegend segments={segments} />
            </StackItem>
          </VStack>
        ) : (
          <HStack gap={6} vAlign="center">
            <AllocationDonut segments={segments} size={180} />
            <StackItem size="fill">
              <AllocationLegend segments={segments} />
            </StackItem>
          </HStack>
        )}
      </VStack>
    </Card>
  );

  const holdingsCard = (
    <Card>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Heading level={3}>Holdings</Heading>
              <Text type="supporting" color="secondary">
                Select a row to open the position detail
              </Text>
            </VStack>
          </StackItem>
          <SegmentedControl
            label="Filter holdings by asset class"
            value={classFilter}
            onChange={value => setClassFilter(value as ClassFilter)}
            size="sm">
            <SegmentedControlItem label="All" value="all" />
            <SegmentedControlItem label="Equities" value="equity" />
            <SegmentedControlItem label="Bonds" value="fixed" />
            <SegmentedControlItem label="Cash" value="cash" />
          </SegmentedControl>
        </HStack>
        <Table density="compact" dividers="rows" hasHover>
          <TableHeader>
            <TableRow isHeaderRow>
              <TableHeaderCell scope="col">Ticker</TableHeaderCell>
              {showSharesAndPrice && (
                <TableHeaderCell
                  scope="col"
                  style={{...styles.numericHeader, width: 90}}>
                  Shares
                </TableHeaderCell>
              )}
              {showSharesAndPrice && (
                <TableHeaderCell
                  scope="col"
                  style={{...styles.numericHeader, width: 100}}>
                  Price
                </TableHeaderCell>
              )}
              <TableHeaderCell
                scope="col"
                style={{...styles.numericHeader, width: 120}}>
                Value
              </TableHeaderCell>
              <TableHeaderCell
                scope="col"
                style={{...styles.numericHeader, width: 130}}>
                Gain/loss
              </TableHeaderCell>
              {showSpark && (
                <TableHeaderCell
                  scope="col"
                  style={{...styles.numericHeader, width: 90}}>
                  12 wk
                </TableHeaderCell>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleHoldings.map(holding => {
              const isSelected = holding.ticker === selectedTicker;
              const value = marketValue(holding);
              const gain = totalGain(holding);
              const gainPercent = (gain / costBasis(holding)) * 100;
              return (
                <TableRow
                  key={holding.ticker}
                  tabIndex={0}
                  aria-selected={isSelected}
                  onClick={() => toggleRow(holding.ticker)}
                  onKeyDown={event => handleRowKeyDown(event, holding.ticker)}
                  style={isSelected ? styles.rowSelected : styles.row}>
                  <TableCell scope="row">
                    <VStack gap={0.5}>
                      <HStack gap={2} vAlign="center">
                        <Text type="body" weight="semibold">
                          {holding.ticker}
                        </Text>
                        <Token
                          size="sm"
                          color={CLASS_TOKEN[holding.assetClass]}
                          label={holding.assetClass}
                        />
                      </HStack>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {holding.name}
                      </Text>
                    </VStack>
                  </TableCell>
                  {showSharesAndPrice && (
                    <TableCell style={styles.numericCell}>
                      <Text type="body" hasTabularNumbers>
                        {formatShares(holding.shares)}
                      </Text>
                    </TableCell>
                  )}
                  {showSharesAndPrice && (
                    <TableCell style={styles.numericCell}>
                      <Text type="body" hasTabularNumbers>
                        {formatMoney(price(holding))}
                      </Text>
                    </TableCell>
                  )}
                  <TableCell style={styles.numericCell}>
                    <Text type="body" weight="medium" hasTabularNumbers>
                      {formatMoney(value)}
                    </Text>
                  </TableCell>
                  <TableCell style={styles.numericCell}>
                    <VStack gap={0.5} hAlign="end">
                      <Text
                        type="body"
                        hasTabularNumbers
                        style={signStyle(gain)}>
                        {formatSignedMoney(gain)}
                      </Text>
                      <Text
                        type="supporting"
                        hasTabularNumbers
                        style={signStyle(gain)}>
                        {formatSignedPercent(gainPercent)}
                      </Text>
                    </VStack>
                  </TableCell>
                  {showSpark && (
                    <TableCell style={styles.numericCell}>
                      <Sparkline closes={holding.closes} />
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            {/* Totals row for the filtered set. */}
            <TableRow>
              <TableCell scope="row">
                <Text type="body" weight="semibold">
                  Total · {visibleHoldings.length}{' '}
                  {visibleHoldings.length === 1 ? 'position' : 'positions'}
                </Text>
              </TableCell>
              {showSharesAndPrice && <TableCell />}
              {showSharesAndPrice && <TableCell />}
              <TableCell style={styles.numericCell}>
                <Text type="body" weight="semibold" hasTabularNumbers>
                  {formatMoney(filteredValue)}
                </Text>
              </TableCell>
              <TableCell style={styles.numericCell}>
                <Text
                  type="body"
                  weight="semibold"
                  hasTabularNumbers
                  style={signStyle(filteredGain)}>
                  {formatSignedMoney(filteredGain)}
                </Text>
              </TableCell>
              {showSpark && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </VStack>
    </Card>
  );

  // ---- Rail (docked end panel > 1080px, stacked cards below) ----

  const dockedRail = (
    <LayoutPanel width={340} padding={0} hasDivider label="Position detail and watchlist">
      <div style={styles.railScroll}>
        <div style={styles.railSection}>{detailPane}</div>
        <Divider />
        <div style={styles.railSection}>{watchlistPane}</div>
      </div>
    </LayoutPanel>
  );

  const stackedRail = (
    <Grid columns={isPhone ? 1 : {minWidth: 320, repeat: 'fit'}} gap={4}>
      {/* At phone widths selection swaps the whole content pane instead,
          so the inline detail card only renders above 640px. */}
      {!isPhone && <Card>{detailPane}</Card>}
      <Card>{watchlistPane}</Card>
    </Grid>
  );

  const portfolioContent = (
    <VStack gap={6}>
      {allocationCard}
      {holdingsCard}
      {isRailStacked && stackedRail}
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3}>
            {/* Title row wraps at phone widths so actions never clip. */}
            <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Heading level={1}>Portfolio</Heading>
                  <Text type="supporting" color="secondary">
                    Meridian Brokerage · Individual · as of Jun 30, 2026 close
                  </Text>
                </VStack>
              </StackItem>
              <Button
                label="Add holding"
                icon={<Icon icon={PlusIcon} size="sm" />}
                variant="secondary"
              />
              <IconButton
                label="Refresh quotes"
                icon={<Icon icon={RefreshCwIcon} size="sm" />}
                variant="ghost"
              />
            </HStack>
            {/* Summary strip: signed coloring on both change figures. */}
            <HStack gap={6} vAlign="start" wrap="wrap">
              <SummaryMetric
                label="Total value"
                value={formatMoney(PORTFOLIO_VALUE)}
              />
              <SummaryMetric
                label="Day change"
                value={formatSignedMoney(PORTFOLIO_DAY_CHANGE)}
                change={PORTFOLIO_DAY_CHANGE}
                changePercent={
                  (PORTFOLIO_DAY_CHANGE /
                    (PORTFOLIO_VALUE - PORTFOLIO_DAY_CHANGE)) *
                  100
                }
              />
              <SummaryMetric
                label="Total gain/loss"
                value={formatSignedMoney(PORTFOLIO_GAIN)}
                change={PORTFOLIO_GAIN}
                changePercent={(PORTFOLIO_GAIN / PORTFOLIO_COST) * 100}
              />
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      end={isRailStacked ? undefined : dockedRail}
      content={
        <LayoutContent padding={isPhone ? 4 : 6}>
          {isPhone && selected ? (
            // <=640px single-pane fallback: the position detail takes the
            // whole content pane; the back button restores the portfolio.
            <Card>
              <PositionDetail
                holding={selected}
                isPhone
                onClose={() => setSelectedTicker(null)}
              />
            </Card>
          ) : (
            portfolioContent
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};