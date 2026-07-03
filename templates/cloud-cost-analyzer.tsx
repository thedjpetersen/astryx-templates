// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (6 cloud services across 4 teams with
 *   fixed Jan–Jun 2026 monthly spend arrays, service→team/region/tag
 *   dimension metadata, and one injected May anomaly spike on the search
 *   cluster with a written explanation)
 * @output Cloud spend-exploration surface: header with the total-spend KPI,
 *   a month-over-month delta Badge, and a period Selector; a group-by
 *   SegmentedControl (Service / Team / Region / Tag) that re-stacks a plain
 *   SVG-rect stacked-bar trend chart and re-derives the breakdown ledger
 *   from the same fixture array; three derived stat Cards (run rate, top
 *   mover, committed savings); clickable breakdown rows that drill into a
 *   dimension slice with a Breadcrumbs trail for backing out plus a reset;
 *   an anomaly marker over the spiked bar that opens an explanation Popover
 *   with an acknowledge action; and a docked what-if commitment panel whose
 *   coverage Slider and term SegmentedControl live-derive projected savings
 *   and repaint a dashed overlay line on the chart
 * @position Page template; emitted by `astryx template cloud-cost-analyzer`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (cloud mark,
 * title, total-spend KPI with MoM Badge, period Selector). LayoutContent
 * scrolls a centered max-width 1040 column: scope row (Breadcrumbs +
 * group-by SegmentedControl + reset), stat Grid, trend-chart Card,
 * breakdown ledger Card. LayoutPanel end 320 docks the what-if commitment
 * panel on wide viewports.
 *
 * Container policy: analytics archetype — Cards for the stat tiles, the
 * chart widget, and the breakdown ledger; the commitment panel is a docked
 * LayoutPanel because it is durable chrome, not a data widget. Breakdown
 * rows are full-width unstyled buttons rather than Table rows because each
 * row is a drill-down action (chevron affordance, aria-label spells out the
 * destination slice).
 *
 * Responsive contract:
 * - Page column: maxWidth 1040, centered; the whole content area scrolls.
 * - Header row wraps (wrap="wrap") so the period Selector drops below the
 *   title when one row is too narrow; the KPI meta line compresses to the
 *   bare total <=640px.
 * - Scope row wraps: Breadcrumbs truncate per-crumb (maxLines via Text) and
 *   the group-by SegmentedControl drops to its own line on phones, at
 *   size="lg" for 40px tap targets.
 * - Stat Grid: columns={{minWidth: 200, max: 3}} — 3-up wide, reflowing to
 *   1-up as the viewport narrows.
 * - Chart: the SVG stretches to container width (viewBox 0 0 100 100,
 *   preserveAspectRatio="none") so 6 stacked bars always fit at 375px with
 *   no horizontal scroll; chart height drops 240→180 on phones; month
 *   labels live in a flex row below the SVG and compress evenly. The SVG is
 *   presentational (role="img" + aria-label) and the caption below restates
 *   peak month, latest month, and the overlay math, so nothing is
 *   pointer-only. The anomaly marker is a real 40x40 button (not a hover
 *   target) positioned over the spiked bar.
 * - <=900px: the commitment LayoutPanel undocks and renders as a Card at
 *   the bottom of the content column (single-pane fallback, no side panel).
 * - <=640px: breakdown rows restack — color dot + name + chevron on line
 *   one, the share bar full-width on line two, latest-month figure + MoM
 *   Badge + total on line three — inside one >=44px tap-target button; the
 *   group-by and term SegmentedControls render size="lg".
 * - No hover-only interactions anywhere: rows drill on click/tap/Enter, the
 *   anomaly explanation is a click Popover, the overlay line is narrated in
 *   the caption.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronRightIcon,
  CloudIcon,
} from 'lucide-react';

// ============= STYLES =============

// Data colors via Astryx tokens with hex fallbacks. The stack palette
// cycles by group index; red is reserved for the anomaly marker and
// spend-up deltas so it never doubles as a series color.
const colors = {
  green: 'var(--color-data-categorical-green, #0B991F)',
  red: 'var(--color-data-categorical-red, #D92D20)',
  overlay: 'var(--color-data-categorical-green, #0B991F)',
};

const STACK_PALETTE = [
  'var(--color-data-categorical-blue, #0171E3)',
  'var(--color-data-categorical-purple, #6B1EFD)',
  'var(--color-data-categorical-green, #0B991F)',
  'var(--color-data-categorical-orange, #EB6E00)',
  '#0D9488',
  '#CA8A04',
];

const styles: Record<string, CSSProperties> = {
  // Centered scrollable page column.
  page: {maxWidth: 1040, marginInline: 'auto', width: '100%'},
  numeric: {fontVariantNumeric: 'tabular-nums'},
  // Header cloud mark — gradient placeholder, white glyph.
  brandChip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control, 8px)',
    background: 'linear-gradient(135deg, #0171E3, #0D9488)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Chart wrapper: relative so the anomaly marker button and the SVG share
  // one coordinate space; the SVG stretches to the container.
  chartWrap: {position: 'relative', width: '100%'},
  chartSvg: {display: 'block', width: '100%', height: '100%'},
  monthLabels: {display: 'flex', gap: 2},
  monthLabel: {flex: 1, minWidth: 0, textAlign: 'center'},
  // Anomaly marker: a real 40x40 button (never hover-only) whose visible
  // face is a 24px circle; positioned over the spiked bar's top.
  anomalyButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginInlineStart: -20,
    padding: 0,
    border: 'none',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  anomalyFace: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: colors.red,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
  },
  anomalyFaceAcked: {
    backgroundColor: colors.green,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    flexShrink: 0,
  },
  // Breakdown rows are unstyled full-width buttons so tap/click/Enter all
  // drill — never hover-only.
  rowButton: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    paddingBlock: 10,
    paddingInline: 0,
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
  },
  rowButtonStatic: {cursor: 'default'},
  // Desktop: fixed name column keeps every share track starting on the
  // same x so group fills compare visually.
  nameCol: {width: 220, flexShrink: 0},
  shareTrack: {
    position: 'relative',
    height: 12,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    minWidth: 0,
  },
  shareFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    borderRadius: 999,
  },
  // Fixed numeric columns keep digits aligned across breakdown rows.
  colSpend: {width: 96, flexShrink: 0, textAlign: 'end'},
  colDelta: {width: 84, flexShrink: 0, display: 'flex', justifyContent: 'flex-end'},
  colTotal: {width: 104, flexShrink: 0, textAlign: 'end'},
  chevron: {
    display: 'flex',
    flexShrink: 0,
    color: 'var(--color-content-secondary, #666)',
  },
  chevronSpacer: {width: 20, flexShrink: 0},
  upText: {color: colors.red, fontVariantNumeric: 'tabular-nums'},
  downText: {color: colors.green, fontVariantNumeric: 'tabular-nums'},
  popoverBody: {maxWidth: 280},
};

// ============= DATA =============
// Deterministic fixtures: six services with fixed Jan–Jun 2026 monthly
// spend, fixed team/region/tag dimensions, and one hand-injected anomaly
// (the search cluster's May spike). No clocks, no randomness.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const;
const MONTH_FULL = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
] as const;

type Dimension = 'service' | 'team' | 'region' | 'tag';

const DIMENSIONS: Dimension[] = ['service', 'team', 'region', 'tag'];

const DIMENSION_LABEL: Record<Dimension, string> = {
  service: 'Service',
  team: 'Team',
  region: 'Region',
  tag: 'Tag',
};

interface ServiceSpend {
  id: string;
  service: string;
  team: string;
  region: string;
  tag: string;
  /** USD per month, Jan..Jun 2026. */
  monthly: number[];
}

const SERVICES: ServiceSpend[] = [
  {
    id: 'api-gateway',
    service: 'API Gateway',
    team: 'Platform',
    region: 'US East',
    tag: 'prod',
    monthly: [8200, 8450, 8610, 8890, 9040, 9210],
  },
  {
    id: 'compute-fleet',
    service: 'Compute Fleet',
    team: 'Platform',
    region: 'US East',
    tag: 'prod',
    monthly: [21400, 21900, 22600, 23100, 23800, 24300],
  },
  {
    id: 'search-cluster',
    service: 'Search Cluster',
    team: 'Search',
    region: 'EU West',
    tag: 'prod',
    // May carries the injected anomaly spike (runaway reindex autoscaling).
    monthly: [11800, 12050, 12300, 12550, 31200, 12900],
  },
  {
    id: 'data-warehouse',
    service: 'Data Warehouse',
    team: 'Data',
    region: 'US West',
    tag: 'analytics',
    monthly: [14600, 15200, 14900, 15600, 16100, 15400],
  },
  {
    id: 'ml-training',
    service: 'ML Training',
    team: 'Data',
    region: 'US West',
    tag: 'ml',
    monthly: [9800, 12400, 11200, 13800, 12600, 14900],
  },
  {
    id: 'edge-cdn',
    service: 'Edge CDN',
    team: 'Growth',
    region: 'Global',
    tag: 'prod',
    monthly: [6900, 7100, 7300, 7000, 7450, 7600],
  },
];

// The injected anomaly: Search Cluster's May bill ran ~2.5x its trend.
const ANOMALY = {
  serviceId: 'search-cluster',
  serviceName: 'Search Cluster',
  monthIndex: 4,
  actual: 31200,
  expected: 12700,
  title: 'May spike on Search Cluster',
  explanation:
    'A runaway reindex job pinned autoscaling at 3x nodes for 9 days ' +
    '(May 6–14). The job was killed and a max-node guardrail shipped May 15.',
};

const PERIOD_OPTIONS = [
  {value: '3m', label: 'Last 3 months'},
  {value: '6m', label: 'Last 6 months'},
];
const PERIOD_MONTH_COUNT: Record<string, number> = {'3m': 3, '6m': 6};

// Commitment terms: longer commit, deeper discount. Fixed fixture rates.
const TERM_OPTIONS = [
  {value: '1yr', label: '1-year', rate: 0.28},
  {value: '3yr', label: '3-year', rate: 0.46},
];
const DEFAULT_COVERAGE = 0;

// ============= DERIVED MATH =============

/** `$84,310` — whole dollars with grouping; negatives keep the sign. */
function formatUsd(value: number): string {
  const rounded = Math.round(Math.abs(value));
  return `${value < 0 ? '-' : ''}$${rounded.toLocaleString('en-US')}`;
}

/** `+18.8%` / `-15.9%` with one decimal. */
function formatPct(pct: number): string {
  const magnitude = Math.abs(pct).toFixed(1);
  return pct > 0 ? `+${magnitude}%` : pct < 0 ? `-${magnitude}%` : '0.0%';
}

function dimensionValue(service: ServiceSpend, dimension: Dimension): string {
  switch (dimension) {
    case 'service':
      return service.service;
    case 'team':
      return service.team;
    case 'region':
      return service.region;
    case 'tag':
      return service.tag;
  }
}

interface DrillStep {
  dimension: Dimension;
  value: string;
}

/** Services matching every step of the drill path. */
function scopeServices(path: DrillStep[]): ServiceSpend[] {
  return SERVICES.filter(service =>
    path.every(step => dimensionValue(service, step.dimension) === step.value),
  );
}

interface GroupRow {
  key: string;
  label: string;
  color: string;
  /** Visible-window monthly totals, oldest first. */
  monthly: number[];
  /** Sum across the visible window. */
  total: number;
  /** Latest month (Jun) spend — MoM numerator. */
  latest: number;
  /** Prior month (May) spend — MoM denominator. */
  prior: number;
  /** Jun-vs-May percent change; null when the prior month is zero. */
  deltaPct: number | null;
  /** Share of the visible-window scoped total, rounded. */
  sharePct: number;
  serviceCount: number;
}

/**
 * Groups the scoped services along one dimension and derives everything the
 * chart stack, the legend, and the breakdown ledger need — all from the
 * same fixture array, so switching the dimension honestly re-stacks and
 * re-derives.
 */
function buildGroupRows(
  scoped: ServiceSpend[],
  dimension: Dimension,
  monthStart: number,
): GroupRow[] {
  const byKey = new Map<string, ServiceSpend[]>();
  for (const service of scoped) {
    const key = dimensionValue(service, dimension);
    const bucket = byKey.get(key);
    if (bucket == null) {
      byKey.set(key, [service]);
    } else {
      bucket.push(service);
    }
  }

  const visibleCount = MONTHS.length - monthStart;
  const rows = [...byKey.entries()].map(([key, members]) => {
    const monthly = Array.from({length: visibleCount}, (_, index) =>
      members.reduce(
        (sum, member) => sum + member.monthly[monthStart + index],
        0,
      ),
    );
    const latest = members.reduce(
      (sum, member) => sum + member.monthly[MONTHS.length - 1],
      0,
    );
    const prior = members.reduce(
      (sum, member) => sum + member.monthly[MONTHS.length - 2],
      0,
    );
    return {
      key,
      label: key,
      color: '',
      monthly,
      total: monthly.reduce((sum, value) => sum + value, 0),
      latest,
      prior,
      deltaPct: prior === 0 ? null : ((latest - prior) / prior) * 100,
      sharePct: 0,
      serviceCount: members.length,
    };
  });

  rows.sort((a, b) => b.total - a.total || a.key.localeCompare(b.key));
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
  return rows.map((row, index) => ({
    ...row,
    color: STACK_PALETTE[index % STACK_PALETTE.length],
    sharePct: grandTotal === 0 ? 0 : Math.round((row.total / grandTotal) * 100),
  }));
}

/** Per-visible-month scoped totals (chart bar heights, overlay basis). */
function monthTotals(rows: GroupRow[], visibleCount: number): number[] {
  return Array.from({length: visibleCount}, (_, index) =>
    rows.reduce((sum, row) => sum + row.monthly[index], 0),
  );
}

interface CommitmentPlan {
  /** Cheapest scoped month in the window — the safe commit baseline. */
  baseline: number;
  /** Committed dollars per month at the current coverage. */
  committed: number;
  /** Discount dollars saved per month. */
  savingsPerMonth: number;
  savingsPerYear: number;
  rate: number;
}

function buildCommitmentPlan(
  totals: number[],
  coverage: number,
  termValue: string,
): CommitmentPlan {
  const baseline = totals.length === 0 ? 0 : Math.min(...totals);
  const term = TERM_OPTIONS.find(option => option.value === termValue);
  const rate = term == null ? TERM_OPTIONS[0].rate : term.rate;
  const committed = Math.round(baseline * (coverage / 100));
  const savingsPerMonth = Math.round(committed * rate);
  return {
    baseline,
    committed,
    savingsPerMonth,
    savingsPerYear: savingsPerMonth * 12,
    rate,
  };
}

// ============= WIDGETS =============

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {label}
        </Text>
        <Heading level={2}>{value}</Heading>
        <Text type="supporting" color="secondary" style={styles.numeric}>
          {description}
        </Text>
      </VStack>
    </Card>
  );
}

/**
 * Stacked-bar trend chart built from plain SVG rects — no chart library.
 * viewBox 0 0 100 100 with preserveAspectRatio="none" stretches to the
 * container so all bars fit at 375px. The dashed overlay polyline is the
 * what-if effective spend (total minus committed-discount savings); it uses
 * vector-effect="non-scaling-stroke" so the stroke stays crisp under the
 * non-uniform stretch. Presentational only (role="img"); the caption below
 * the chart restates every figure the pixels encode.
 */
function StackedSpendChart({
  rows,
  totals,
  monthStart,
  maxTotal,
  overlayValues,
  isPhone,
  anomalyMarker,
}: {
  rows: GroupRow[];
  totals: number[];
  monthStart: number;
  maxTotal: number;
  /** Effective-spend line per visible month; null hides the overlay. */
  overlayValues: number[] | null;
  isPhone: boolean;
  anomalyMarker: React.ReactNode;
}) {
  const visibleCount = totals.length;
  const chartHeight = isPhone ? 180 : 240;
  const step = 100 / visibleCount;
  const barWidth = step * 0.68;
  const barInset = step * 0.16;

  const peakIndex = totals.indexOf(Math.max(...totals));
  const ariaLabel =
    `Stacked monthly spend, ${MONTHS[monthStart]} through Jun 2026, ` +
    `${rows.length} ${rows.length === 1 ? 'series' : 'series'}. Peak month ` +
    `${MONTH_FULL[monthStart + peakIndex]} at ${formatUsd(totals[peakIndex])}.` +
    (overlayValues == null
      ? ''
      : ' A dashed line marks projected spend with the commitment applied.');

  return (
    <VStack gap={2}>
      <div style={{...styles.chartWrap, height: chartHeight}}>
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={ariaLabel}
          style={styles.chartSvg}>
          {/* Quarter gridlines keep bar heights readable without an axis. */}
          {[25, 50, 75].map(gridY => (
            <line
              key={gridY}
              x1={0}
              x2={100}
              y1={gridY}
              y2={gridY}
              stroke="var(--color-border-primary, #E4E4E7)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {totals.map((total, monthIdx) => {
            if (total === 0) {
              return null;
            }
            const x = monthIdx * step + barInset;
            // Stack bottom-up in table order (largest group at the base) so
            // re-grouping visibly re-stacks the same dollars.
            let cumulative = 0;
            return (
              <g key={monthIdx}>
                {rows.map(row => {
                  const value = row.monthly[monthIdx];
                  if (value === 0) {
                    return null;
                  }
                  const heightPct = (value / maxTotal) * 100;
                  cumulative += value;
                  const y = 100 - (cumulative / maxTotal) * 100;
                  return (
                    <rect
                      key={row.key}
                      x={x.toFixed(2)}
                      y={y.toFixed(2)}
                      width={barWidth.toFixed(2)}
                      height={Math.max(heightPct, 0.4).toFixed(2)}
                      fill={row.color}
                    />
                  );
                })}
              </g>
            );
          })}
          {overlayValues != null && (
            <polyline
              points={overlayValues
                .map((value, monthIdx) => {
                  const x = (monthIdx + 0.5) * step;
                  const y = 100 - (Math.max(value, 0) / maxTotal) * 100;
                  return `${x.toFixed(2)},${y.toFixed(2)}`;
                })
                .join(' ')}
              fill="none"
              stroke={colors.overlay}
              strokeWidth={2}
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>
        {anomalyMarker}
      </div>
      <div style={styles.monthLabels}>
        {totals.map((_, monthIdx) => (
          <div key={monthIdx} style={styles.monthLabel}>
            <Text type="supporting" color="secondary" size="sm" maxLines={1}>
              {MONTHS[monthStart + monthIdx]}
            </Text>
          </div>
        ))}
      </div>
      {/* Legend restates each series with its window total. */}
      <HStack gap={3} vAlign="center" wrap="wrap">
        {rows.map(row => (
          <HStack key={row.key} gap={1} vAlign="center">
            <span
              style={{...styles.legendDot, backgroundColor: row.color}}
              aria-hidden
            />
            <Text type="supporting" color="secondary" style={styles.numeric}>
              {row.label} {formatUsd(row.total)}
            </Text>
          </HStack>
        ))}
      </HStack>
    </VStack>
  );
}

function DeltaBadge({deltaPct}: {deltaPct: number | null}) {
  if (deltaPct == null) {
    return <Badge label="new" variant="neutral" />;
  }
  const rounded = Math.round(deltaPct * 10) / 10;
  // Spend up is bad (red); spend down is savings (green).
  const variant = rounded > 0 ? 'red' : rounded < 0 ? 'green' : 'neutral';
  return <Badge label={formatPct(rounded)} variant={variant} />;
}

function BreakdownRow({
  row,
  dimension,
  maxShare,
  isDrillable,
  isPhone,
  onDrill,
}: {
  row: GroupRow;
  dimension: Dimension;
  /** Largest sharePct among sibling rows — the share bar's 100%. */
  maxShare: number;
  isDrillable: boolean;
  isPhone: boolean;
  onDrill: (row: GroupRow) => void;
}) {
  const fillPct = maxShare === 0 ? 0 : (row.sharePct / maxShare) * 100;

  const shareBar = (
    <div style={styles.shareTrack}>
      <div
        style={{
          ...styles.shareFill,
          width: `${fillPct}%`,
          backgroundColor: row.color,
        }}
      />
    </div>
  );

  const identity = (
    <HStack gap={2} vAlign="center">
      <span
        style={{...styles.legendDot, backgroundColor: row.color}}
        aria-hidden
      />
      <Text type="label" maxLines={1}>
        {row.label}
      </Text>
    </HStack>
  );

  const meta = (
    <Text type="supporting" color="secondary" style={styles.numeric}>
      {row.serviceCount} {row.serviceCount === 1 ? 'service' : 'services'} ·{' '}
      {row.sharePct}% of scope
    </Text>
  );

  const chevron = isDrillable ? (
    <span style={styles.chevron} aria-hidden>
      <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
    </span>
  ) : (
    <span style={styles.chevronSpacer} aria-hidden />
  );

  return (
    <button
      type="button"
      style={
        isDrillable
          ? styles.rowButton
          : {...styles.rowButton, ...styles.rowButtonStatic}
      }
      aria-label={
        isDrillable
          ? `Drill into ${DIMENSION_LABEL[dimension]} ${row.label}: ` +
            `${formatUsd(row.latest)} in June, ${formatUsd(row.total)} total`
          : `${DIMENSION_LABEL[dimension]} ${row.label}: ` +
            `${formatUsd(row.latest)} in June, ${formatUsd(row.total)} total ` +
            '(no further drill dimensions)'
      }
      disabled={!isDrillable}
      onClick={() => onDrill(row)}>
      {isPhone ? (
        // <=640px: three stacked lines inside one >=44px tap target.
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">{identity}</StackItem>
            {chevron}
          </HStack>
          {shareBar}
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary" style={styles.numeric}>
                Jun {formatUsd(row.latest)} · total {formatUsd(row.total)}
              </Text>
            </StackItem>
            <DeltaBadge deltaPct={row.deltaPct} />
          </HStack>
        </VStack>
      ) : (
        <HStack gap={3} vAlign="center">
          <div style={styles.nameCol}>
            <VStack gap={0}>
              {identity}
              {meta}
            </VStack>
          </div>
          <StackItem size="fill">{shareBar}</StackItem>
          <div style={styles.colSpend}>
            <Text type="label" style={styles.numeric}>
              {formatUsd(row.latest)}
            </Text>
          </div>
          <div style={styles.colDelta}>
            <DeltaBadge deltaPct={row.deltaPct} />
          </div>
          <div style={styles.colTotal}>
            <Text type="supporting" color="secondary" style={styles.numeric}>
              {formatUsd(row.total)}
            </Text>
          </div>
          {chevron}
        </HStack>
      )}
    </button>
  );
}

// ============= PAGE =============

export default function CloudCostAnalyzerTemplate() {
  const [period, setPeriod] = useState('6m');
  const [groupBy, setGroupBy] = useState<Dimension>('service');
  const [drillPath, setDrillPath] = useState<DrillStep[]>([]);
  const [coverage, setCoverage] = useState(DEFAULT_COVERAGE);
  const [term, setTerm] = useState('1yr');
  const [isAnomalyOpen, setIsAnomalyOpen] = useState(false);
  const [isAnomalyAcked, setIsAnomalyAcked] = useState(false);

  // Responsive contract: <=900px undocks the commitment panel into the
  // content column; <=640px restacks breakdown rows and grows tap targets.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  const visibleCount = PERIOD_MONTH_COUNT[period] ?? 6;
  const monthStart = MONTHS.length - visibleCount;
  const periodLabel =
    PERIOD_OPTIONS.find(option => option.value === period)?.label ??
    'Last 6 months';

  // ---- Scope + grouping: everything derives from the one fixture array ----
  const scoped = useMemo(() => scopeServices(drillPath), [drillPath]);
  const rows = useMemo(
    () => buildGroupRows(scoped, groupBy, monthStart),
    [scoped, groupBy, monthStart],
  );
  const totals = useMemo(
    () => monthTotals(rows, visibleCount),
    [rows, visibleCount],
  );
  const windowTotal = totals.reduce((sum, value) => sum + value, 0);
  const latestTotal = scoped.reduce(
    (sum, service) => sum + service.monthly[MONTHS.length - 1],
    0,
  );
  const priorTotal = scoped.reduce(
    (sum, service) => sum + service.monthly[MONTHS.length - 2],
    0,
  );
  const headlineDelta =
    priorTotal === 0 ? null : ((latestTotal - priorTotal) / priorTotal) * 100;
  const maxTotal = Math.max(...totals, 1);
  const peakIndex = totals.indexOf(Math.max(...totals));

  // ---- What-if commitment ----
  const plan = useMemo(
    () => buildCommitmentPlan(totals, coverage, term),
    [totals, coverage, term],
  );
  const overlayValues =
    coverage > 0
      ? totals.map(total => Math.max(total - plan.savingsPerMonth, 0))
      : null;

  // ---- Drill state ----
  const usedDimensions = new Set(drillPath.map(step => step.dimension));
  const availableDimensions = DIMENSIONS.filter(
    dimension => !usedDimensions.has(dimension),
  );
  // Drilling consumes the grouping dimension too, so a row is drillable
  // only while another dimension remains to regroup by.
  const remainingAfterDrill = availableDimensions.filter(
    dimension => dimension !== groupBy,
  );
  const isDrillable = remainingAfterDrill.length > 0;

  const drillInto = (row: GroupRow) => {
    if (!isDrillable) {
      return;
    }
    setDrillPath(prev => [...prev, {dimension: groupBy, value: row.key}]);
    setGroupBy(remainingAfterDrill[0]);
  };

  const backOutTo = (depth: number) => {
    const nextPath = drillPath.slice(0, depth);
    setDrillPath(nextPath);
    const nextUsed = new Set(nextPath.map(step => step.dimension));
    if (nextUsed.has(groupBy)) {
      const fallback = DIMENSIONS.find(dimension => !nextUsed.has(dimension));
      if (fallback != null) {
        setGroupBy(fallback);
      }
    }
  };

  const resetDrill = () => {
    setDrillPath([]);
    setGroupBy('service');
  };

  // ---- Anomaly marker geometry ----
  // Visible only while the spiked service is in scope (May is inside both
  // fixture windows). Positioned over the spiked month's bar top.
  const anomalyInScope = scoped.some(
    service => service.id === ANOMALY.serviceId,
  );
  const anomalyMonthVisible = ANOMALY.monthIndex - monthStart;
  const showAnomaly = anomalyInScope && anomalyMonthVisible >= 0;
  const chartHeight = isPhone ? 180 : 240;
  const anomalyBarTotal = showAnomaly ? totals[anomalyMonthVisible] : 0;
  const anomalyTopPx = Math.max(
    chartHeight * (1 - anomalyBarTotal / maxTotal) - 20,
    0,
  );
  const anomalyLeftPct = ((anomalyMonthVisible + 0.5) / visibleCount) * 100;

  const anomalyMarker = showAnomaly ? (
    <Popover
      isOpen={isAnomalyOpen}
      onOpenChange={setIsAnomalyOpen}
      label="Anomaly explanation"
      placement="below"
      width={300}
      content={
        <VStack gap={3} style={styles.popoverBody}>
          <HStack gap={2} vAlign="center">
            <Icon
              icon={isAnomalyAcked ? CheckCircle2Icon : AlertTriangleIcon}
              size="sm"
            />
            <Text type="label">{ANOMALY.title}</Text>
          </HStack>
          <Text type="supporting" color="secondary" style={styles.numeric}>
            {formatUsd(ANOMALY.actual)} actual vs {formatUsd(ANOMALY.expected)}{' '}
            expected — {formatUsd(ANOMALY.actual - ANOMALY.expected)} over
            trend.
          </Text>
          <Text type="supporting" color="secondary">
            {ANOMALY.explanation}
          </Text>
          {isAnomalyAcked ? (
            <Badge label="Acknowledged" variant="green" />
          ) : (
            <Button
              label="Acknowledge anomaly"
              size="sm"
              onClick={() => {
                setIsAnomalyAcked(true);
                setIsAnomalyOpen(false);
              }}
            />
          )}
        </VStack>
      }>
      <button
        type="button"
        style={{
          ...styles.anomalyButton,
          top: anomalyTopPx,
          insetInlineStart: `${anomalyLeftPct}%`,
        }}
        aria-label={
          isAnomalyAcked
            ? `Acknowledged anomaly: ${ANOMALY.title}`
            : `Anomaly detected: ${ANOMALY.title}. Open explanation.`
        }>
        <span
          style={
            isAnomalyAcked
              ? {...styles.anomalyFace, ...styles.anomalyFaceAcked}
              : styles.anomalyFace
          }>
          <Icon
            icon={isAnomalyAcked ? CheckCircle2Icon : AlertTriangleIcon}
            size="xsm"
            color="inherit"
          />
        </span>
      </button>
    </Popover>
  ) : null;

  // ---- Stat tiles ----
  const runRate = visibleCount === 0 ? 0 : Math.round(windowTotal / visibleCount);
  const topMover = rows.reduce<GroupRow | null>((best, row) => {
    const delta = row.latest - row.prior;
    if (best == null || delta > best.latest - best.prior) {
      return row;
    }
    return best;
  }, null);

  const scopeCaption =
    drillPath.length === 0
      ? 'All spend'
      : drillPath
          .map(step => `${DIMENSION_LABEL[step.dimension]}: ${step.value}`)
          .join(' · ');

  const maxShare = rows.reduce((best, row) => Math.max(best, row.sharePct), 0);

  // Commitment panel body — docked in a LayoutPanel on wide viewports,
  // rendered as a Card at the bottom of the column <=900px.
  const commitmentPanel = (
    <VStack gap={4}>
      <Text type="supporting" color="secondary">
        Commit to a baseline of always-on spend in exchange for a discount.
        The dashed chart line previews the effective monthly bill.
      </Text>
      <SegmentedControl
        value={term}
        onChange={setTerm}
        label="Commitment term"
        size={isPhone ? 'lg' : 'md'}>
        {TERM_OPTIONS.map(option => (
          <SegmentedControlItem
            key={option.value}
            value={option.value}
            label={`${option.label} · ${Math.round(option.rate * 100)}% off`}
          />
        ))}
      </SegmentedControl>
      <Slider
        label="Coverage of baseline month"
        min={0}
        max={100}
        step={5}
        value={coverage}
        onChange={setCoverage}
        formatValue={value => `${value}%`}
        marks={[
          {value: 0, label: '0%'},
          {value: 50, label: '50%'},
          {value: 100, label: '100%'},
        ]}
        width="100%"
      />
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Baseline (cheapest scoped month)
            </Text>
          </StackItem>
          <Text type="supporting" style={styles.numeric}>
            {formatUsd(plan.baseline)}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Committed / month
            </Text>
          </StackItem>
          <Text type="supporting" style={styles.numeric}>
            {formatUsd(plan.committed)}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Projected savings / month
            </Text>
          </StackItem>
          <Text type="supporting" style={styles.downText}>
            {plan.savingsPerMonth > 0
              ? `-${formatUsd(plan.savingsPerMonth).slice(1)}`
              : '$0'}
          </Text>
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label">Annualized savings</Text>
          </StackItem>
          <Text type="label" style={styles.numeric}>
            {formatUsd(plan.savingsPerYear)}
          </Text>
        </HStack>
      </VStack>
      {coverage > 80 && (
        <Text type="supporting" style={styles.upText}>
          Coverage above 80% risks paying for idle commitment in low months —
          the baseline is a single-month floor, not a guarantee.
        </Text>
      )}
      <Text type="supporting" color="secondary">
        Savings apply to the current scope ({scopeCaption.toLowerCase()}) and
        re-derive as you drill.
      </Text>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <div style={styles.brandChip}>
                  <Icon icon={CloudIcon} size="sm" color="inherit" />
                </div>
                <Heading level={1}>Cloud Cost Analyzer</Heading>
                <HStack gap={1} vAlign="center">
                  <Text type="label" style={styles.numeric}>
                    {formatUsd(windowTotal)}
                  </Text>
                  {!isPhone && (
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.numeric}>
                      · {periodLabel.toLowerCase()}
                    </Text>
                  )}
                  {headlineDelta != null && (
                    <DeltaBadge deltaPct={headlineDelta} />
                  )}
                </HStack>
              </HStack>
            </StackItem>
            <Selector
              label="Period"
              isLabelHidden
              size="sm"
              options={PERIOD_OPTIONS}
              value={period}
              onChange={setPeriod}
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} label="What-if commitment">
            <VStack gap={4}>
              <Heading level={3}>What-if commitment</Heading>
              {commitmentPanel}
            </VStack>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={6}>
          <div style={styles.page}>
            <VStack gap={6}>
              {/* Scope row: breadcrumb trail backs out of drills; the
                  group-by control consumes the remaining dimensions. */}
              <HStack gap={3} vAlign="center" wrap="wrap">
                <StackItem size="fill">
                  <Breadcrumbs variant="supporting" label="Spend scope">
                    <BreadcrumbItem
                      isCurrent={drillPath.length === 0}
                      onClick={
                        drillPath.length === 0 ? undefined : () => backOutTo(0)
                      }>
                      All spend
                    </BreadcrumbItem>
                    {drillPath.map((step, index) => (
                      <BreadcrumbItem
                        key={`${step.dimension}-${step.value}`}
                        isCurrent={index === drillPath.length - 1}
                        onClick={
                          index === drillPath.length - 1
                            ? undefined
                            : () => backOutTo(index + 1)
                        }>
                        {`${DIMENSION_LABEL[step.dimension]}: ${step.value}`}
                      </BreadcrumbItem>
                    ))}
                  </Breadcrumbs>
                </StackItem>
                {drillPath.length > 0 && (
                  <Button
                    label="Reset"
                    size="sm"
                    variant="secondary"
                    onClick={resetDrill}
                  />
                )}
                <SegmentedControl
                  value={groupBy}
                  onChange={value => setGroupBy(value as Dimension)}
                  label="Group by"
                  size={isPhone ? 'lg' : 'md'}>
                  {availableDimensions.map(dimension => (
                    <SegmentedControlItem
                      key={dimension}
                      value={dimension}
                      label={DIMENSION_LABEL[dimension]}
                    />
                  ))}
                </SegmentedControl>
              </HStack>

              {/* Derived stat tiles — 3-up, reflowing to 1-up on phones. */}
              <Grid columns={{minWidth: 200, max: 3}} gap={4}>
                <StatCard
                  label="Run rate"
                  value={`${formatUsd(runRate)}/mo`}
                  description={`Average across ${visibleCount} months · ${scopeCaption}`}
                />
                <StatCard
                  label="Top mover (MoM)"
                  value={
                    topMover == null
                      ? '—'
                      : `${topMover.latest - topMover.prior >= 0 ? '+' : '-'}${formatUsd(
                          Math.abs(topMover.latest - topMover.prior),
                        ).slice(1)}`
                  }
                  description={
                    topMover == null
                      ? 'No groups in scope'
                      : `${topMover.label} · Jun vs May`
                  }
                />
                <StatCard
                  label="Committed savings"
                  value={
                    plan.savingsPerMonth > 0
                      ? `${formatUsd(plan.savingsPerMonth)}/mo`
                      : '$0'
                  }
                  description={
                    coverage === 0
                      ? 'Set coverage in the what-if panel'
                      : `At ${coverage}% coverage · ${
                          TERM_OPTIONS.find(option => option.value === term)
                            ?.label ?? '1-year'
                        } term`
                  }
                />
              </Grid>

              {/* Trend chart — SVG rects only; the group-by control above
                  re-stacks these same dollars along another dimension. */}
              <Card>
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={3}>Spend trend</Heading>
                    <Text type="supporting" color="secondary">
                      Stacked by {DIMENSION_LABEL[groupBy].toLowerCase()} ·{' '}
                      {periodLabel.toLowerCase()}
                    </Text>
                  </HStack>
                  <StackedSpendChart
                    rows={rows}
                    totals={totals}
                    monthStart={monthStart}
                    maxTotal={maxTotal}
                    overlayValues={overlayValues}
                    isPhone={isPhone}
                    anomalyMarker={anomalyMarker}
                  />
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.numeric}>
                    Peak month {MONTH_FULL[monthStart + peakIndex]} at{' '}
                    {formatUsd(totals[peakIndex])}; June closed at{' '}
                    {formatUsd(latestTotal)}
                    {headlineDelta != null &&
                      ` (${formatPct(Math.round(headlineDelta * 10) / 10)} vs May)`}
                    .
                    {overlayValues != null &&
                      ` Dashed line: projected spend with ${coverage}% coverage, saving ${formatUsd(plan.savingsPerMonth)}/mo.`}
                    {showAnomaly &&
                      !isAnomalyAcked &&
                      ' The marker flags the May anomaly — tap it for the explanation.'}
                    {showAnomaly &&
                      isAnomalyAcked &&
                      ' The May anomaly has been acknowledged.'}
                  </Text>
                </VStack>
              </Card>

              {/* Breakdown ledger — same fixture array as the chart. Rows
                  drill into their slice while dimensions remain. */}
              <Card>
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={3}>
                      Breakdown by {DIMENSION_LABEL[groupBy].toLowerCase()}
                    </Heading>
                    <Text type="supporting" color="secondary">
                      {isDrillable
                        ? 'Tap a row to drill into that slice'
                        : 'Deepest drill level for this scope'}
                    </Text>
                  </HStack>
                  {!isPhone && (
                    <HStack gap={3} vAlign="center">
                      <div style={styles.nameCol}>
                        <Text type="supporting" color="secondary" size="sm">
                          {DIMENSION_LABEL[groupBy]}
                        </Text>
                      </div>
                      <StackItem size="fill">
                        <Text type="supporting" color="secondary" size="sm">
                          Share of scope
                        </Text>
                      </StackItem>
                      <div style={styles.colSpend}>
                        <Text type="supporting" color="secondary" size="sm">
                          Jun spend
                        </Text>
                      </div>
                      <div style={styles.colDelta}>
                        <Text type="supporting" color="secondary" size="sm">
                          MoM
                        </Text>
                      </div>
                      <div style={styles.colTotal}>
                        <Text type="supporting" color="secondary" size="sm">
                          {visibleCount}-mo total
                        </Text>
                      </div>
                      <span style={styles.chevronSpacer} aria-hidden />
                    </HStack>
                  )}
                  <VStack gap={0}>
                    {rows.map((row, index) => (
                      <VStack key={row.key} gap={0}>
                        <BreakdownRow
                          row={row}
                          dimension={groupBy}
                          maxShare={maxShare}
                          isDrillable={isDrillable}
                          isPhone={isPhone}
                          onDrill={drillInto}
                        />
                        {index < rows.length - 1 && <Divider />}
                      </VStack>
                    ))}
                  </VStack>
                  <Text type="supporting" color="secondary" style={styles.numeric}>
                    {rows.length} {rows.length === 1 ? 'group' : 'groups'} ·{' '}
                    {scoped.length} {scoped.length === 1 ? 'service' : 'services'}{' '}
                    in scope · {formatUsd(windowTotal)} across{' '}
                    {periodLabel.toLowerCase()}
                  </Text>
                </VStack>
              </Card>

              {/* <=900px single-pane fallback: the docked panel's content
                  joins the column as a Card instead. */}
              {isStacked && (
                <Card>
                  <VStack gap={4}>
                    <Heading level={3}>What-if commitment</Heading>
                    {commitmentPanel}
                  </VStack>
                </Card>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
