// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-chart.tsx
 * @input Deterministic fixtures only (eight products at one outdoor-gear
 *   store, eight weeks of unit sales, fixed unit prices; every total,
 *   share, and trend is derived from those arrays)
 * @output Table with linked chart: a weekly sales ChartV2 (store-total
 *   bars) above the underlying product table. A SegmentedControl metric
 *   switch (Revenue / Units) re-renders the chart series and shifts
 *   emphasis between the table's Revenue and Units columns; selecting a
 *   table row highlights it and overlays that product's weekly trend as
 *   a line on the chart, with a clear-selection affordance in the chart
 *   header.
 * @position Page template; emitted by `astryx template table-chart`
 *
 * Frame: LayoutHeader (title + metric switch + refresh) | LayoutContent
 * with a chart Card on top and the product table Card below.
 *
 * Linked-interaction contract:
 * - Metric lives in useState('revenue' | 'units'); it drives the chart
 *   series values, the y-axis tick format, the chart title/caption, and
 *   which table column renders emphasized (semibold primary) vs. muted
 *   (secondary).
 * - Selected product id lives in useState(string | null). Rows are
 *   keyboard-reachable (tabIndex 0, Enter/Space toggle) and carry
 *   aria-selected; clicking the selected row again deselects. While a
 *   row is selected its weekly series renders as a line over the
 *   store-total bars and the chart caption names the product.
 *
 * Responsive contract:
 * - Chart: fixed 280px height at every breakpoint; the SVG viewBox
 *   scales horizontally so the chart always keeps full content width.
 * - > 768px: all six table columns render (Product, Category, Revenue,
 *   Units, Rev. share, Trend).
 * - <= 768px: the Category and Rev. share columns are hidden so Product
 *   and the two metric columns keep readable widths; category stays
 *   visible in the chart caption when the row is selected.
 * - Frame: Layout height="fill" keeps LayoutHeader pinned; the chart +
 *   table stack scrolls inside LayoutContent as one vertical region.
 *   The header row keeps the metric switch pinned right via StackItem
 *   fill.
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
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
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
  ChartV2 as Chart,
  ChartGrid,
  ChartAxis,
  line,
  bar,
} from '@astryxdesign/lab';
import {ArrowPathIcon, XMarkIcon} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  row: {
    cursor: 'pointer',
  },
  rowSelected: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Numeric cells use tabular numerals so digit columns stay aligned.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  numericHeader: {
    textAlign: 'end',
  },
  // Keep the chart from collapsing when the card flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  total: 'var(--color-data-categorical-blue, #0171E3)',
  product: 'var(--color-data-categorical-orange, #EB6E00)',
};

// ============= DATA =============

type Metric = 'revenue' | 'units';
type Category = 'Camp' | 'Hike' | 'Apparel';

// Eight retail weeks (week-starting Mondays), oldest first.
const WEEKS = [
  'Apr 27',
  'May 4',
  'May 11',
  'May 18',
  'May 25',
  'Jun 1',
  'Jun 8',
  'Jun 15',
];

interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  unitPrice: number;
  /** Units sold per week, aligned with WEEKS. Revenue derives from these. */
  weeklyUnits: number[];
}

// Store 042 (Portland) — early-summer mix: camp gear ramping up,
// cold-weather apparel tailing off. Fixed unit counts, no randomness.
const PRODUCTS: Product[] = [
  {
    id: 'BO-1141',
    name: 'Alpine 2P Tent',
    sku: 'BO-1141',
    category: 'Camp',
    unitPrice: 289,
    weeklyUnits: [9, 11, 10, 13, 15, 18, 21, 24],
  },
  {
    id: 'BO-0873',
    name: 'Ridgeline 65L Pack',
    sku: 'BO-0873',
    category: 'Hike',
    unitPrice: 189,
    weeklyUnits: [14, 13, 16, 15, 18, 17, 20, 22],
  },
  {
    id: 'BO-0512',
    name: 'Cascade Rain Shell',
    sku: 'BO-0512',
    category: 'Apparel',
    unitPrice: 129,
    weeklyUnits: [22, 25, 21, 18, 16, 14, 12, 11],
  },
  {
    id: 'BO-0498',
    name: 'Ember Down Jacket',
    sku: 'BO-0498',
    category: 'Apparel',
    unitPrice: 179,
    weeklyUnits: [12, 10, 9, 7, 6, 5, 4, 4],
  },
  {
    id: 'BO-1327',
    name: 'Summit Trekking Poles',
    sku: 'BO-1327',
    category: 'Hike',
    unitPrice: 79,
    weeklyUnits: [18, 20, 19, 23, 24, 26, 28, 31],
  },
  {
    id: 'BO-1509',
    name: 'Basecamp Chair',
    sku: 'BO-1509',
    category: 'Camp',
    unitPrice: 59,
    weeklyUnits: [15, 17, 21, 24, 28, 33, 36, 41],
  },
  {
    id: 'BO-1618',
    name: 'Torrent Water Filter',
    sku: 'BO-1618',
    category: 'Camp',
    unitPrice: 45,
    weeklyUnits: [11, 13, 12, 16, 18, 21, 24, 27],
  },
  {
    id: 'BO-1702',
    name: 'Lumen 400 Headlamp',
    sku: 'BO-1702',
    category: 'Hike',
    unitPrice: 39,
    weeklyUnits: [26, 24, 28, 27, 31, 33, 36, 38],
  },
];

const CATEGORY_TOKEN: Record<Category, 'green' | 'blue' | 'purple'> = {
  Camp: 'green',
  Hike: 'blue',
  Apparel: 'purple',
};

const METRIC_META: Record<
  Metric,
  {chartTitle: string; columnHeader: string; tickFormat: (v: unknown) => string}
> = {
  revenue: {
    chartTitle: 'Weekly revenue',
    columnHeader: 'Revenue (8 wk)',
    tickFormat: v => `$${v}k`,
  },
  units: {
    chartTitle: 'Weekly units sold',
    columnHeader: 'Units (8 wk)',
    tickFormat: v => `${v}`,
  },
};

// ---- Derived helpers (pure; all fixture math lives here) ----

/** One product's value for a single week under the given metric. */
function weekValue(product: Product, weekIndex: number, metric: Metric) {
  const units = product.weeklyUnits[weekIndex];
  return metric === 'revenue' ? units * product.unitPrice : units;
}

/** One product's 8-week total under the given metric. */
function productTotal(product: Product, metric: Metric) {
  return WEEKS.reduce((sum, _week, i) => sum + weekValue(product, i, metric), 0);
}

/** Store-wide total for a single week under the given metric. */
function storeWeekTotal(weekIndex: number, metric: Metric) {
  return PRODUCTS.reduce(
    (sum, product) => sum + weekValue(product, weekIndex, metric),
    0,
  );
}

/** Chart scale: revenue plots in $ thousands (1 decimal), units as-is. */
function toChartScale(value: number, metric: Metric) {
  return metric === 'revenue' ? Math.round(value / 100) / 10 : value;
}

function formatMetric(value: number, metric: Metric) {
  const digits = value.toLocaleString('en-US');
  return metric === 'revenue' ? `$${digits}` : digits;
}

/** Last four weeks vs. first four weeks, as a signed percent. */
function trendPercent(product: Product) {
  const first = product.weeklyUnits.slice(0, 4).reduce((a, b) => a + b, 0);
  const last = product.weeklyUnits.slice(4).reduce((a, b) => a + b, 0);
  return Math.round(((last - first) / first) * 100);
}

function trendBadge(percent: number): {
  label: string;
  variant: 'success' | 'error' | 'neutral';
} {
  if (percent >= 5) {
    return {label: `+${percent}%`, variant: 'success'};
  }
  if (percent <= -5) {
    return {label: `${percent}%`, variant: 'error'};
  }
  return {label: `${percent >= 0 ? '+' : ''}${percent}%`, variant: 'neutral'};
}

const STORE_REVENUE_TOTAL = PRODUCTS.reduce(
  (sum, product) => sum + productTotal(product, 'revenue'),
  0,
);

// ============= METRIC CELL =============

/**
 * Numeric cell for the Revenue / Units columns. The active metric's
 * column renders emphasized (semibold, primary); the other metric stays
 * secondary so the eye lands on the same measure the chart is plotting.
 */
function MetricCell({value, isActive}: {value: string; isActive: boolean}) {
  return (
    <TableCell style={styles.numericCell}>
      <Text
        type="body"
        weight={isActive ? 'semibold' : 'normal'}
        color={isActive ? 'primary' : 'secondary'}>
        {value}
      </Text>
    </TableCell>
  );
}

// ============= PAGE =============

export default function TableChartTemplate() {
  const [metric, setMetric] = useState<Metric>('revenue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isCompact = useMediaQuery('(max-width: 768px)');

  const selected = useMemo(
    () => PRODUCTS.find(product => product.id === selectedId) ?? null,
    [selectedId],
  );

  // Chart rows: store-total bars, plus the selected product's weekly
  // series when a table row is highlighted.
  const chartData = useMemo(
    () =>
      WEEKS.map((week, i) => ({
        week,
        total: toChartScale(storeWeekTotal(i, metric), metric),
        ...(selected != null && {
          product: toChartScale(weekValue(selected, i, metric), metric),
        }),
      })),
    [metric, selected],
  );

  const chartSeries = useMemo(() => {
    const series: Array<ReturnType<typeof bar> | ReturnType<typeof line>> = [
      bar('total', {color: chartColors.total, radius: 4, label: 'Store total'}),
    ];
    if (selected != null) {
      series.push(
        line('product', {color: chartColors.product, label: selected.name}),
      );
    }
    return series;
  }, [selected]);

  const meta = METRIC_META[metric];
  const chartCaption =
    selected == null
      ? 'Store total by week, all products'
      : `Store total by week vs. ${selected.name} (${selected.category})`;

  const toggleRow = (id: string) => {
    setSelectedId(current => (current === id ? null : id));
  };

  const handleRowKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleRow(id);
    }
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>Store 042 — Weekly sales</Heading>
                <Text type="supporting" color="secondary">
                  Beacon Outfitters · Portland, OR · 8 weeks ending Jun 21
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Metric"
              value={metric}
              onChange={value => setMetric(value as Metric)}
              size="md">
              <SegmentedControlItem label="Revenue" value="revenue" />
              <SegmentedControlItem label="Units" value="units" />
            </SegmentedControl>
            <IconButton
              label="Refresh data"
              icon={<Icon icon={ArrowPathIcon} size="sm" />}
              variant="ghost"
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* Linked chart — plots the same metric the table emphasizes */}
            <Card>
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <VStack gap={0.5}>
                      <Heading level={3}>{meta.chartTitle}</Heading>
                      <Text type="supporting" color="secondary">
                        {chartCaption}
                      </Text>
                    </VStack>
                  </StackItem>
                  {selected != null && (
                    <Button
                      label="Clear selection"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={XMarkIcon} size="sm" />}
                      onClick={() => setSelectedId(null)}
                    />
                  )}
                </HStack>
                <div style={styles.chartBody}>
                  <Chart
                    data={chartData}
                    xKey="week"
                    series={chartSeries}
                    legend={{position: 'bottom', alignment: 'center'}}
                    tooltip={true}
                    grid={<ChartGrid horizontal />}
                    axes={
                      <>
                        <ChartAxis position="bottom" />
                        <ChartAxis position="left" tickFormat={meta.tickFormat} />
                      </>
                    }
                    height={280}
                    margin={{left: 44, right: 10, top: 10, bottom: 30}}
                  />
                </div>
              </VStack>
            </Card>

            {/* Underlying data — click a row to plot it on the chart */}
            <Card>
              <VStack gap={4}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Heading level={3}>Product sales</Heading>
                  </StackItem>
                  <Text type="supporting" color="secondary">
                    Select a row to compare it against the store total
                  </Text>
                </HStack>
                <Table density="compact" dividers="rows" hasHover>
                  <TableHeader>
                    <TableRow isHeaderRow>
                      <TableHeaderCell scope="col">Product</TableHeaderCell>
                      {!isCompact && (
                        <TableHeaderCell scope="col" style={{width: 110}}>
                          Category
                        </TableHeaderCell>
                      )}
                      <TableHeaderCell
                        scope="col"
                        style={{...styles.numericHeader, width: 130}}>
                        {METRIC_META.revenue.columnHeader}
                      </TableHeaderCell>
                      <TableHeaderCell
                        scope="col"
                        style={{...styles.numericHeader, width: 120}}>
                        {METRIC_META.units.columnHeader}
                      </TableHeaderCell>
                      {!isCompact && (
                        <TableHeaderCell
                          scope="col"
                          style={{...styles.numericHeader, width: 100}}>
                          Rev. share
                        </TableHeaderCell>
                      )}
                      <TableHeaderCell
                        scope="col"
                        style={{...styles.numericHeader, width: 100}}>
                        Trend
                      </TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {PRODUCTS.map(product => {
                      const isSelected = product.id === selectedId;
                      const revenue = productTotal(product, 'revenue');
                      const units = productTotal(product, 'units');
                      const share = Math.round(
                        (revenue / STORE_REVENUE_TOTAL) * 1000,
                      ) / 10;
                      const trend = trendBadge(trendPercent(product));
                      return (
                        <TableRow
                          key={product.id}
                          tabIndex={0}
                          aria-selected={isSelected}
                          onClick={() => toggleRow(product.id)}
                          onKeyDown={event =>
                            handleRowKeyDown(event, product.id)
                          }
                          style={isSelected ? styles.rowSelected : styles.row}>
                          <TableCell scope="row">
                            <VStack gap={0.5}>
                              <Text type="body" maxLines={1}>
                                {product.name}
                              </Text>
                              <Text type="supporting" color="secondary">
                                {product.sku} ·{' '}
                                {formatMetric(product.unitPrice, 'revenue')}
                              </Text>
                            </VStack>
                          </TableCell>
                          {!isCompact && (
                            <TableCell>
                              <Token
                                label={product.category}
                                color={CATEGORY_TOKEN[product.category]}
                                size="sm"
                              />
                            </TableCell>
                          )}
                          <MetricCell
                            value={formatMetric(revenue, 'revenue')}
                            isActive={metric === 'revenue'}
                          />
                          <MetricCell
                            value={formatMetric(units, 'units')}
                            isActive={metric === 'units'}
                          />
                          {!isCompact && (
                            <TableCell style={styles.numericCell}>
                              <Text type="body" color="secondary">
                                {share}%
                              </Text>
                            </TableCell>
                          )}
                          <TableCell style={styles.numericCell}>
                            <Badge label={trend.label} variant={trend.variant} />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
