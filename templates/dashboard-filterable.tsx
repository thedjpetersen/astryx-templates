// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (region × product monthly sales series,
 *   top-account rows, fixed Jan–Jun 2026 reporting window)
 * @output Filterable revenue dashboard: a collapsible left filter panel
 *   (region CheckboxList with account counts, product-line Selector, and a
 *   DateRangeInput for the reporting window) driving a KPI Stat row, a
 *   monthly-revenue bar chart, and a top-accounts table. Region and product
 *   selections filter the fixture rows live via useState; every KPI, chart
 *   point, and table row is derived from the filtered set.
 * @position Page template; emitted by `astryx template dashboard-filterable`
 *
 * Frame: Layout height="fill". LayoutHeader carries the dashboard title, the
 * active-filter summary, and a "Filters" toggle with a live count badge.
 * The start LayoutPanel (264px) is the filter rail; an IconButton in its
 * header collapses it, and the header "Filters" button brings it back.
 * LayoutContent scrolls the widget stack (Cards are correct for dashboard
 * widgets; the chrome stays frame-first).
 *
 * Responsive contract:
 * - >768px: filter panel is a 264px start LayoutPanel (collapsible via its
 *   hide IconButton or the header "Filters" toggle); content fills the rest.
 * - <=768px: the panel and its header toggle hide entirely — the header keeps
 *   a compact active-filter summary line instead; widgets stack 1-up.
 * - KPI row: Grid columns={{minWidth: 200, max: 4}} — 4-up wide, reflowing
 *   to 2-up and 1-up as the viewport narrows.
 * - Table: the account column absorbs remaining width (proportional); pixel
 *   columns keep numeric cells stable. Chart keeps full card width and
 *   scales via its viewBox.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {DateRangeInput} from '@astryxdesign/core/DateRangeInput';
import type {DateRange} from '@astryxdesign/core/DateRangeInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {Stat} from '@astryxdesign/core/Stat';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChartV2 as Chart,
  ChartGrid,
  ChartAxis,
  bar,
} from '@astryxdesign/lab';
import {
  RefreshCwIcon,
  InboxIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  // Keep the chart from collapsing when the card flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
  emptyBody: {padding: 'var(--spacing-6) 0'},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  revenue: 'var(--color-data-categorical-blue, #0171E3)',
};

// ============= DATA =============
// Fixed reporting window: Jan 1 – Jun 30, 2026. All series are aligned to
// MONTHS by index. No clocks, randomness, or network assets.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'] as const;

const REPORTING_WINDOW: DateRange = {start: '2026-01-01', end: '2026-06-30'};

type RegionId = 'na' | 'emea' | 'apac' | 'latam';
type ProductId = 'atlas' | 'pulse' | 'relay';

const REGIONS: ReadonlyArray<{id: RegionId; label: string}> = [
  {id: 'na', label: 'North America'},
  {id: 'emea', label: 'EMEA'},
  {id: 'apac', label: 'APAC'},
  {id: 'latam', label: 'Latin America'},
];

const ALL_REGION_IDS = REGIONS.map(region => region.id);

const PRODUCT_LABEL: Record<ProductId, string> = {
  atlas: 'Atlas CRM',
  pulse: 'Pulse Analytics',
  relay: 'Relay Support',
};

const PRODUCT_OPTIONS = [
  {value: 'all', label: 'All product lines'},
  {value: 'atlas', label: 'Atlas CRM'},
  {value: 'pulse', label: 'Pulse Analytics'},
  {value: 'relay', label: 'Relay Support'},
];

// One series per region × product line. `revenue` is monthly billed revenue
// in $ thousands; `orders` is closed orders per month. Index-aligned with
// MONTHS. Every widget below derives from whichever of these rows survive
// the region/product filters.
interface SalesSeries {
  region: RegionId;
  product: ProductId;
  revenue: ReadonlyArray<number>;
  orders: ReadonlyArray<number>;
}

const SALES: ReadonlyArray<SalesSeries> = [
  // North America — largest book of business, steady growth.
  {region: 'na', product: 'atlas', revenue: [182, 188, 194, 201, 210, 224], orders: [61, 63, 64, 66, 70, 74]},
  {region: 'na', product: 'pulse', revenue: [124, 128, 133, 131, 140, 146], orders: [41, 42, 44, 43, 46, 48]},
  {region: 'na', product: 'relay', revenue: [88, 86, 90, 93, 95, 99], orders: [52, 51, 53, 55, 56, 58]},
  // EMEA — second-largest, slower but consistent.
  {region: 'emea', product: 'atlas', revenue: [141, 146, 144, 152, 158, 166], orders: [47, 49, 48, 51, 52, 55]},
  {region: 'emea', product: 'pulse', revenue: [96, 101, 104, 108, 113, 117], orders: [32, 33, 35, 36, 38, 39]},
  {region: 'emea', product: 'relay', revenue: [64, 66, 65, 69, 71, 74], orders: [38, 39, 38, 41, 42, 44]},
  // APAC — smallest of the big three but the fastest-growing.
  {region: 'apac', product: 'atlas', revenue: [92, 97, 103, 109, 116, 124], orders: [30, 32, 34, 36, 39, 41]},
  {region: 'apac', product: 'pulse', revenue: [58, 62, 66, 71, 77, 82], orders: [19, 21, 22, 24, 26, 27]},
  {region: 'apac', product: 'relay', revenue: [41, 43, 46, 48, 51, 54], orders: [24, 25, 27, 28, 30, 32]},
  // Latin America — early market, mostly flat.
  {region: 'latam', product: 'atlas', revenue: [47, 49, 48, 52, 54, 57], orders: [16, 16, 16, 17, 18, 19]},
  {region: 'latam', product: 'pulse', revenue: [29, 31, 32, 34, 35, 37], orders: [10, 10, 11, 11, 12, 12]},
  {region: 'latam', product: 'relay', revenue: [22, 23, 22, 24, 25, 26], orders: [13, 13, 13, 14, 15, 15]},
];

// Top accounts table — filtered by the same region/product selections.
// `revenue` is period revenue in $ thousands.
interface AccountRow extends Record<string, unknown> {
  id: string;
  account: string;
  region: RegionId;
  product: ProductId;
  revenue: number;
  orders: number;
  status: 'growing' | 'steady' | 'at-risk';
}

const ACCOUNTS: AccountRow[] = [
  {id: 'a-01', account: 'Hartwell & Boone', region: 'na', product: 'atlas', revenue: 214, orders: 68, status: 'growing'},
  {id: 'a-02', account: 'Cobalt Health', region: 'na', product: 'pulse', revenue: 186, orders: 44, status: 'growing'},
  {id: 'a-03', account: 'Meridian Foods', region: 'emea', product: 'atlas', revenue: 158, orders: 49, status: 'growing'},
  {id: 'a-04', account: 'Kishimoto Retail', region: 'apac', product: 'atlas', revenue: 147, orders: 45, status: 'growing'},
  {id: 'a-05', account: 'Osterberg Group', region: 'emea', product: 'pulse', revenue: 132, orders: 38, status: 'steady'},
  {id: 'a-06', account: 'Fairbanks Logistics', region: 'na', product: 'relay', revenue: 121, orders: 57, status: 'steady'},
  {id: 'a-07', account: 'Southbridge Bank', region: 'apac', product: 'pulse', revenue: 96, orders: 27, status: 'steady'},
  {id: 'a-08', account: 'Vantaa Mobility', region: 'emea', product: 'relay', revenue: 84, orders: 41, status: 'at-risk'},
  {id: 'a-09', account: 'Aurora Mining', region: 'latam', product: 'atlas', revenue: 71, orders: 21, status: 'at-risk'},
  {id: 'a-10', account: 'Rio Verde Media', region: 'latam', product: 'relay', revenue: 43, orders: 18, status: 'steady'},
];

const STATUS_BADGE: Record<
  AccountRow['status'],
  {label: string; variant: 'green' | 'neutral' | 'orange'}
> = {
  growing: {label: 'Growing', variant: 'green'},
  steady: {label: 'Steady', variant: 'neutral'},
  'at-risk': {label: 'At risk', variant: 'orange'},
};

// ============= FORMATTERS =============

/** $ thousands → "$412k" below $1M, "$1.24M" at or above. */
function formatRevenue(thousands: number): string {
  return thousands >= 1000
    ? `$${(thousands / 1000).toFixed(2)}M`
    : `$${Math.round(thousands)}k`;
}

function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Month-over-month delta for a Stat card (last vs. previous month). */
function monthDelta(last: number, previous: number): {
  value: string;
  direction: 'up' | 'down' | 'flat';
} {
  if (previous === 0 || last === previous) {
    return {value: '0.0%', direction: 'flat'};
  }
  const pct = ((last - previous) / previous) * 100;
  return {
    value: `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`,
    direction: pct > 0 ? 'up' : 'down',
  };
}

// ============= TABLE COLUMNS =============

const accountColumns: TableColumn<AccountRow>[] = [
  {
    key: 'account',
    header: 'Account',
    width: proportional(2),
    renderCell: (item: AccountRow) => <Text type="body">{item.account}</Text>,
  },
  {
    key: 'region',
    header: 'Region',
    width: pixel(140),
    renderCell: (item: AccountRow) => (
      <Text type="body" color="secondary">
        {REGIONS.find(region => region.id === item.region)?.label}
      </Text>
    ),
  },
  {
    key: 'product',
    header: 'Product line',
    width: pixel(140),
    renderCell: (item: AccountRow) => (
      <Text type="body" color="secondary">
        {PRODUCT_LABEL[item.product]}
      </Text>
    ),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    width: pixel(100),
    renderCell: (item: AccountRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{formatRevenue(item.revenue)}</Text>
      </span>
    ),
  },
  {
    key: 'orders',
    header: 'Orders',
    width: pixel(90),
    renderCell: (item: AccountRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{formatCount(item.orders)}</Text>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(100),
    renderCell: (item: AccountRow) => (
      <Badge
        label={STATUS_BADGE[item.status].label}
        variant={STATUS_BADGE[item.status].variant}
      />
    ),
  },
];

// ============= FILTER PANEL =============

function FilterPanel({
  regions,
  onRegionsChange,
  product,
  onProductChange,
  dateRange,
  onDateRangeChange,
  activeCount,
  onReset,
  onHide,
}: {
  regions: string[];
  onRegionsChange: (values: string[]) => void;
  product: string;
  onProductChange: (value: string) => void;
  dateRange: DateRange | null;
  onDateRangeChange: (value: DateRange | null) => void;
  activeCount: number;
  onReset: () => void;
  onHide: () => void;
}) {
  // Region counts come from the unfiltered account list, so the rail keeps
  // teaching what each facet would add even while filters are applied.
  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of ACCOUNTS) {
      counts[row.region] = (counts[row.region] ?? 0) + 1;
    }
    return counts;
  }, []);

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Filters</Text>
        </StackItem>
        {activeCount > 0 ? (
          <Button label="Reset" variant="ghost" size="sm" onClick={onReset} />
        ) : null}
        <IconButton
          label="Hide filters"
          icon={<Icon icon={XIcon} size="sm" />}
          variant="ghost"
          size="sm"
          onClick={onHide}
        />
      </HStack>
      <CheckboxList
        label="Regions"
        value={regions}
        onChange={onRegionsChange}
        density="compact">
        {REGIONS.map(region => (
          <CheckboxListItem
            key={region.id}
            value={region.id}
            label={region.label}
            endContent={
              <Badge label={String(regionCounts[region.id] ?? 0)} />
            }
          />
        ))}
      </CheckboxList>
      <Divider />
      <Selector
        label="Product line"
        options={PRODUCT_OPTIONS}
        value={product}
        onChange={onProductChange}
        width="100%"
      />
      <Divider />
      {/* Visual control in this fixture: the reporting window is fixed to
          Jan–Jun 2026, so changing the range doesn't reshape the series. */}
      <DateRangeInput
        label="Reporting window"
        value={dateRange}
        onChange={onDateRangeChange}
        min="2025-07-01"
        max="2026-06-30"
        width="100%"
      />
      <Text type="supporting" color="secondary">
        Fixture data covers Jan 1 – Jun 30, 2026.
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function FilterableDashboardTemplate() {
  const [regions, setRegions] = useState<string[]>([...ALL_REGION_IDS]);
  const [product, setProduct] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | null>(
    REPORTING_WINDOW,
  );
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const isCompact = useMediaQuery('(max-width: 768px)');

  const activeFilterCount =
    (regions.length < ALL_REGION_IDS.length ? 1 : 0) +
    (product !== 'all' ? 1 : 0) +
    (dateRange?.start !== REPORTING_WINDOW.start ||
    dateRange?.end !== REPORTING_WINDOW.end
      ? 1
      : 0);

  const resetFilters = () => {
    setRegions([...ALL_REGION_IDS]);
    setProduct('all');
    setDateRange(REPORTING_WINDOW);
  };

  // ----- Derived data: everything below flows from the filtered series -----

  const filteredSeries = useMemo(
    () =>
      SALES.filter(
        series =>
          regions.includes(series.region) &&
          (product === 'all' || series.product === product),
      ),
    [regions, product],
  );

  const filteredAccounts = useMemo(
    () =>
      ACCOUNTS.filter(
        row =>
          regions.includes(row.region) &&
          (product === 'all' || row.product === product),
      ),
    [regions, product],
  );

  // Per-month totals across the filtered series ($ thousands / orders).
  const monthlyTotals = useMemo(
    () =>
      MONTHS.map((month, index) => ({
        month,
        revenue: filteredSeries.reduce(
          (sum, series) => sum + series.revenue[index],
          0,
        ),
        orders: filteredSeries.reduce(
          (sum, series) => sum + series.orders[index],
          0,
        ),
      })),
    [filteredSeries],
  );

  const totalRevenue = monthlyTotals.reduce((sum, m) => sum + m.revenue, 0);
  const totalOrders = monthlyTotals.reduce((sum, m) => sum + m.orders, 0);
  const lastMonth = monthlyTotals[monthlyTotals.length - 1];
  const prevMonth = monthlyTotals[monthlyTotals.length - 2];
  const avgOrderValue =
    totalOrders > 0 ? (totalRevenue * 1000) / totalOrders : 0;

  const productLabel =
    product === 'all'
      ? 'All product lines'
      : PRODUCT_LABEL[product as ProductId];
  const filterSummary = `${regions.length} of ${ALL_REGION_IDS.length} regions · ${productLabel} · Jan 1 – Jun 30, 2026`;

  const hasResults = filteredSeries.length > 0;
  const showPanel = !isCompact && isPanelOpen;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Revenue overview</Heading>
                <Text type="supporting" color="secondary">
                  {filterSummary}
                </Text>
              </VStack>
            </StackItem>
            {!isCompact ? (
              <Button
                label={showPanel ? 'Hide filters' : 'Filters'}
                variant="secondary"
                onClick={() => setIsPanelOpen(open => !open)}
                endContent={
                  activeFilterCount > 0 ? (
                    <Badge label={String(activeFilterCount)} variant="info" />
                  ) : undefined
                }
              />
            ) : null}
            <IconButton
              label="Refresh dashboard"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
              variant="ghost"
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        showPanel ? (
          <LayoutPanel
            width={264}
            padding={4}
            hasDivider
            isScrollable
            label="Dashboard filters">
            <FilterPanel
              regions={regions}
              onRegionsChange={setRegions}
              product={product}
              onProductChange={setProduct}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              activeCount={activeFilterCount}
              onReset={resetFilters}
              onHide={() => setIsPanelOpen(false)}
            />
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={6} label="Dashboard widgets">
          <VStack gap={6}>
            {/* KPI row — all four values derive from the filtered series */}
            <Grid columns={{minWidth: 200, max: 4}} gap={4}>
              <Card>
                <Stat
                  label="Revenue"
                  value={formatRevenue(totalRevenue)}
                  delta={monthDelta(lastMonth.revenue, prevMonth.revenue)}
                  description="MoM, June vs. May"
                />
              </Card>
              <Card>
                <Stat
                  label="Orders"
                  value={formatCount(totalOrders)}
                  delta={monthDelta(lastMonth.orders, prevMonth.orders)}
                  description="MoM, June vs. May"
                />
              </Card>
              <Card>
                <Stat
                  label="Avg order value"
                  value={
                    totalOrders > 0
                      ? `$${Math.round(avgOrderValue).toLocaleString('en-US')}`
                      : '—'
                  }
                  description="Revenue / closed orders"
                />
              </Card>
              <Card>
                <Stat
                  label="Active accounts"
                  value={formatCount(filteredAccounts.length)}
                  description="Matching current filters"
                />
              </Card>
            </Grid>

            {/* Monthly revenue chart over the filtered series */}
            <Card>
              <VStack gap={1}>
                <Heading level={3}>Monthly revenue</Heading>
                <Text type="supporting" color="secondary">
                  Billed revenue per month for the selected regions and
                  product line ($ thousands)
                </Text>
                {hasResults ? (
                  <div style={styles.chartBody}>
                    <Chart
                      data={monthlyTotals}
                      xKey="month"
                      series={[
                        bar('revenue', {
                          color: chartColors.revenue,
                          radius: 4,
                          label: 'Revenue',
                        }),
                      ]}
                      legend={{position: 'bottom', alignment: 'center'}}
                      tooltip={true}
                      grid={<ChartGrid horizontal />}
                      axes={
                        <>
                          <ChartAxis position="bottom" />
                          <ChartAxis
                            position="left"
                            tickFormat={(v: unknown) => `$${v}k`}
                          />
                        </>
                      }
                      height={260}
                      margin={{left: 48, right: 10, top: 10, bottom: 30}}
                    />
                  </div>
                ) : (
                  <div style={styles.emptyBody}>
                    <EmptyState
                      isCompact
                      icon={<Icon icon={InboxIcon} size="lg" />}
                      title="No data for these filters"
                      description="Select at least one region to plot revenue."
                    />
                  </div>
                )}
              </VStack>
            </Card>

            {/* Top accounts — same filters as the widgets above */}
            <Card>
              <VStack gap={4}>
                <HStack hAlign="between" vAlign="center">
                  <Heading level={3}>Top accounts</Heading>
                  <Text type="supporting" color="secondary">
                    {filteredAccounts.length} of {ACCOUNTS.length} accounts
                  </Text>
                </HStack>
                {filteredAccounts.length > 0 ? (
                  <Table<AccountRow>
                    data={filteredAccounts}
                    columns={accountColumns}
                    idKey="id"
                    density="compact"
                    dividers="rows"
                    hasHover
                  />
                ) : (
                  <div style={styles.emptyBody}>
                    <EmptyState
                      isCompact
                      icon={<Icon icon={InboxIcon} size="lg" />}
                      title="No matching accounts"
                      description="Broaden the region or product filters to see accounts."
                    />
                  </div>
                )}
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
