var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (per-quarter revenue series, trend
 *   metric sparklines, and regional performance rows keyed by fiscal quarter)
 * @output Executive summary dashboard: header with a fiscal-quarter
 *   SegmentedControl that swaps the whole fixture set, a hero revenue Stat
 *   card with a trailing eight-quarter bar chart and plan-attainment
 *   progress, a right-hand rail of four compact sparkline trend Stats (ARR,
 *   NRR, churn, pipeline), and a full-width regional breakdown table
 * @position Page template; emitted by \`astryx template dashboard-executive-summary\`
 *
 * Responsive contract:
 * - Frame: Layout height="fill" — LayoutHeader stays pinned and the
 *   dashboard body scrolls inside LayoutContent.
 * - Header: the header HStack wraps, so the fiscal-quarter SegmentedControl
 *   and Refresh button drop to a second row when the title row runs out of
 *   room; below 640px the supporting subtitle hides so the quarter control
 *   stays fully on-screen on phones.
 * - Hero region: two-column CSS grid — fluid hero card (minmax(0, 1fr)) with
 *   a fixed 340px trend rail — above 960px; below 960px the rail drops under
 *   the hero.
 * - Trend rail: a vertical VStack of four compact Stats when docked right;
 *   when stacked below the hero it becomes Grid columns={{minWidth: 220,
 *   max: 2}} so trends go 2-up on tablets and 1-up on phones.
 * - Regional table: the Region column is proportional and absorbs remaining
 *   width; pixel columns keep numeric cells stable. Card header caption stays
 *   pinned right via HStack hAlign="between".
 */

import {useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Stat} from '@astryxdesign/core/Stat';
import {Badge} from '@astryxdesign/core/Badge';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChartV2 as Chart,
  ChartGrid,
  ChartAxis,
  line,
  bar,
} from '@astryxdesign/lab';
import {RefreshCwIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Hero region: fluid hero card + fixed-width trend rail. The narrow
  // variant collapses to a single column (rail drops below the hero).
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: 'var(--spacing-4)',
    alignItems: 'stretch',
  },
  heroGridStacked: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // Reserve each sparkline's box so the four trend cards keep equal height.
  sparkline: {height: 36, width: '100%'},
  // Keep the hero chart from collapsing when the card flexes below min width.
  heroChart: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  revenue: 'var(--color-data-categorical-blue, #0171E3)',
  spark: 'var(--color-data-categorical-purple, #6B1EFD)',
};

// ============= DATA =============

type QuarterKey = 'q4-fy25' | 'q1-fy26' | 'q2-fy26';

type Delta = {
  value: string;
  direction: 'up' | 'down' | 'flat';
  sentiment?: 'positive' | 'negative' | 'neutral';
};

// Full quarterly net revenue history ($M), oldest first. Each quarter's
// hero chart shows the trailing eight quarters ending at the selection.
const REVENUE_HISTORY = [
  {quarter: 'Q1 FY24', revenue: 28.4},
  {quarter: 'Q2 FY24', revenue: 29.9},
  {quarter: 'Q3 FY24', revenue: 31.2},
  {quarter: 'Q4 FY24', revenue: 33.8},
  {quarter: 'Q1 FY25', revenue: 35.1},
  {quarter: 'Q2 FY25', revenue: 39.5},
  {quarter: 'Q3 FY25', revenue: 41.7},
  {quarter: 'Q4 FY25', revenue: 43.9},
  {quarter: 'Q1 FY26', revenue: 44.4},
  {quarter: 'Q2 FY26', revenue: 48.6},
];

interface HeroFixture {
  label: string;
  value: string;
  delta: Delta;
  description: string;
  planTarget: number;
  planActual: number;
  planCaption: string;
}

// Trend rail — one entry per compact Stat. \`sentiment\` inverts the delta
// color mapping where a drop is good (gross churn). Sparklines are 12
// deterministic monthly samples ending in the selected quarter.
interface TrendMetric {
  label: string;
  value: string;
  delta: Delta;
  description: string;
  spark: readonly number[];
}

// Regional breakdown rows — each quarter's regional revenue sums to that
// quarter's hero figure.
interface RegionRow extends Record<string, unknown> {
  id: string;
  region: string;
  revenue: string;
  planAttainment: string;
  yoyGrowth: string;
  newLogos: string;
  nrr: string;
  status: 'ahead' | 'on-plan' | 'behind';
}

interface QuarterFixture {
  hero: HeroFixture;
  chart: ReadonlyArray<{quarter: string; revenue: number}>;
  trends: readonly TrendMetric[];
  regions: RegionRow[];
  tableCaption: string;
}

// The fiscal-quarter SegmentedControl in the header swaps the whole
// fixture set: hero metric, chart series, trend rail, and regional table.
const QUARTER_FIXTURES: Record<QuarterKey, QuarterFixture> = {
  'q4-fy25': {
    hero: {
      label: 'Net revenue — Q4 FY25',
      value: '$43.9M',
      delta: {value: '+5.3%', direction: 'up'},
      description: 'vs. Q3 FY25 · +29.9% YoY',
      planTarget: 43.0,
      planActual: 43.9,
      planCaption: 'Closed at 102% of the $43.0M quarterly plan.',
    },
    chart: REVENUE_HISTORY.slice(0, 8),
    trends: [
      {
        label: 'ARR',
        value: '$171.4M',
        delta: {value: '+12.8%', direction: 'up'},
        description: 'YoY',
        spark: [152, 154, 155, 157, 159, 160, 162, 164, 166, 168, 169, 171],
      },
      {
        label: 'Net revenue retention',
        value: '113%',
        delta: {value: '+1 pt', direction: 'up'},
        description: 'vs. Q3 FY25',
        spark: [109, 109, 110, 110, 111, 111, 112, 112, 112, 113, 113, 113],
      },
      {
        label: 'Gross churn (annualized)',
        value: '2.4%',
        delta: {value: '-0.3 pts', direction: 'down', sentiment: 'positive'},
        description: 'vs. Q3 FY25',
        spark: [3.1, 3.0, 3.0, 2.9, 2.9, 2.8, 2.7, 2.7, 2.6, 2.5, 2.5, 2.4],
      },
      {
        label: 'Qualified pipeline',
        value: '$82.5M',
        delta: {value: '+5.6%', direction: 'up'},
        description: 'QoQ',
        spark: [69, 70, 72, 71, 73, 75, 76, 78, 77, 80, 81, 82],
      },
    ],
    regions: [
      {
        id: '1',
        region: 'North America',
        revenue: '$19.6M',
        planAttainment: '103%',
        yoyGrowth: '+12.1%',
        newLogos: '61',
        nrr: '120%',
        status: 'ahead',
      },
      {
        id: '2',
        region: 'EMEA',
        revenue: '$12.7M',
        planAttainment: '101%',
        yoyGrowth: '+10.2%',
        newLogos: '44',
        nrr: '117%',
        status: 'on-plan',
      },
      {
        id: '3',
        region: 'APAC',
        revenue: '$6.9M',
        planAttainment: '99%',
        yoyGrowth: '+15.4%',
        newLogos: '29',
        nrr: '116%',
        status: 'on-plan',
      },
      {
        id: '4',
        region: 'Japan',
        revenue: '$2.9M',
        planAttainment: '95%',
        yoyGrowth: '+5.0%',
        newLogos: '11',
        nrr: '109%',
        status: 'behind',
      },
      {
        id: '5',
        region: 'Latin America',
        revenue: '$1.8M',
        planAttainment: '92%',
        yoyGrowth: '+9.8%',
        newLogos: '12',
        nrr: '110%',
        status: 'behind',
      },
    ],
    tableCaption: 'Full quarter vs. plan',
  },
  'q1-fy26': {
    hero: {
      label: 'Net revenue — Q1 FY26',
      value: '$44.4M',
      delta: {value: '+1.1%', direction: 'up'},
      description: 'vs. Q4 FY25 · +26.5% YoY',
      planTarget: 45.5,
      planActual: 44.4,
      planCaption: 'Closed at 98% of the $45.5M quarterly plan.',
    },
    chart: REVENUE_HISTORY.slice(1, 9),
    trends: [
      {
        label: 'ARR',
        value: '$178.9M',
        delta: {value: '+13.5%', direction: 'up'},
        description: 'YoY',
        spark: [158, 160, 161, 163, 165, 166, 168, 170, 172, 174, 176, 179],
      },
      {
        label: 'Net revenue retention',
        value: '115%',
        delta: {value: '+2 pts', direction: 'up'},
        description: 'vs. Q4 FY25',
        spark: [110, 110, 111, 111, 112, 112, 113, 113, 114, 114, 115, 115],
      },
      {
        label: 'Gross churn (annualized)',
        value: '2.2%',
        delta: {value: '-0.2 pts', direction: 'down', sentiment: 'positive'},
        description: 'vs. Q4 FY25',
        spark: [2.9, 2.8, 2.8, 2.7, 2.7, 2.6, 2.5, 2.5, 2.4, 2.3, 2.3, 2.2],
      },
      {
        label: 'Qualified pipeline',
        value: '$86.5M',
        delta: {value: '+4.9%', direction: 'up'},
        description: 'QoQ',
        spark: [74, 75, 76, 78, 77, 79, 81, 82, 84, 83, 85, 86],
      },
    ],
    regions: [
      {
        id: '1',
        region: 'North America',
        revenue: '$19.9M',
        planAttainment: '99%',
        yoyGrowth: '+10.4%',
        newLogos: '58',
        nrr: '119%',
        status: 'on-plan',
      },
      {
        id: '2',
        region: 'EMEA',
        revenue: '$12.6M',
        planAttainment: '97%',
        yoyGrowth: '+8.8%',
        newLogos: '37',
        nrr: '115%',
        status: 'on-plan',
      },
      {
        id: '3',
        region: 'APAC',
        revenue: '$7.1M',
        planAttainment: '103%',
        yoyGrowth: '+16.9%',
        newLogos: '31',
        nrr: '118%',
        status: 'ahead',
      },
      {
        id: '4',
        region: 'Japan',
        revenue: '$2.8M',
        planAttainment: '93%',
        yoyGrowth: '+3.5%',
        newLogos: '8',
        nrr: '107%',
        status: 'behind',
      },
      {
        id: '5',
        region: 'Latin America',
        revenue: '$2.0M',
        planAttainment: '105%',
        yoyGrowth: '+14.2%',
        newLogos: '15',
        nrr: '111%',
        status: 'ahead',
      },
    ],
    tableCaption: 'Full quarter vs. plan',
  },
  'q2-fy26': {
    hero: {
      label: 'Net revenue — Q2 FY26',
      value: '$48.6M',
      delta: {value: '+9.4%', direction: 'up'},
      description: 'vs. Q1 FY26 · +23.0% YoY',
      planTarget: 50.0,
      planActual: 48.6,
      planCaption:
        '97% of the $50.0M quarterly plan with four selling days remaining.',
    },
    chart: REVENUE_HISTORY.slice(2, 10),
    trends: [
      {
        label: 'ARR',
        value: '$186.2M',
        delta: {value: '+14.2%', direction: 'up'},
        description: 'YoY',
        spark: [163, 165, 168, 170, 172, 174, 177, 179, 181, 182, 184, 186],
      },
      {
        label: 'Net revenue retention',
        value: '118%',
        delta: {value: '+3 pts', direction: 'up'},
        description: 'vs. Q1 FY26',
        spark: [111, 112, 112, 113, 114, 113, 115, 115, 116, 117, 117, 118],
      },
      {
        label: 'Gross churn (annualized)',
        value: '1.8%',
        delta: {value: '-0.4 pts', direction: 'down', sentiment: 'positive'},
        description: 'vs. Q1 FY26',
        spark: [2.6, 2.5, 2.5, 2.4, 2.3, 2.3, 2.2, 2.1, 2.0, 2.0, 1.9, 1.8],
      },
      {
        label: 'Qualified pipeline',
        value: '$92.4M',
        delta: {value: '+6.8%', direction: 'up'},
        description: 'QoQ',
        spark: [78, 79, 81, 80, 83, 84, 86, 85, 88, 90, 91, 92],
      },
    ],
    regions: [
      {
        id: '1',
        region: 'North America',
        revenue: '$21.4M',
        planAttainment: '102%',
        yoyGrowth: '+11.2%',
        newLogos: '64',
        nrr: '121%',
        status: 'ahead',
      },
      {
        id: '2',
        region: 'EMEA',
        revenue: '$13.9M',
        planAttainment: '98%',
        yoyGrowth: '+9.6%',
        newLogos: '41',
        nrr: '116%',
        status: 'on-plan',
      },
      {
        id: '3',
        region: 'APAC',
        revenue: '$7.8M',
        planAttainment: '104%',
        yoyGrowth: '+18.3%',
        newLogos: '35',
        nrr: '119%',
        status: 'ahead',
      },
      {
        id: '4',
        region: 'Japan',
        revenue: '$3.1M',
        planAttainment: '91%',
        yoyGrowth: '+4.1%',
        newLogos: '9',
        nrr: '108%',
        status: 'behind',
      },
      {
        id: '5',
        region: 'Latin America',
        revenue: '$2.4M',
        planAttainment: '96%',
        yoyGrowth: '+12.7%',
        newLogos: '17',
        nrr: '112%',
        status: 'on-plan',
      },
    ],
    tableCaption: 'Quarter to date vs. plan',
  },
};

const statusVariant: Record<RegionRow['status'], 'green' | 'blue' | 'orange'> =
  {
    ahead: 'green',
    'on-plan': 'blue',
    behind: 'orange',
  };

const statusLabel: Record<RegionRow['status'], string> = {
  ahead: 'Ahead',
  'on-plan': 'On plan',
  behind: 'Behind',
};

function numericCell(value: string) {
  return (
    <span style={styles.numericCell}>
      <Text type="body">{value}</Text>
    </span>
  );
}

const regionColumns: TableColumn<RegionRow>[] = [
  {
    key: 'region',
    header: 'Region',
    width: proportional(2),
    renderCell: (item: RegionRow) => <Text type="body">{item.region}</Text>,
  },
  {
    key: 'revenue',
    header: 'Revenue (QTD)',
    width: pixel(130),
    renderCell: (item: RegionRow) => numericCell(item.revenue),
  },
  {
    key: 'planAttainment',
    header: 'Plan attainment',
    width: pixel(130),
    renderCell: (item: RegionRow) => numericCell(item.planAttainment),
  },
  {
    key: 'yoyGrowth',
    header: 'YoY growth',
    width: pixel(110),
    renderCell: (item: RegionRow) => numericCell(item.yoyGrowth),
  },
  {
    key: 'newLogos',
    header: 'New logos',
    width: pixel(100),
    renderCell: (item: RegionRow) => numericCell(item.newLogos),
  },
  {
    key: 'nrr',
    header: 'NRR',
    width: pixel(90),
    renderCell: (item: RegionRow) => numericCell(item.nrr),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (item: RegionRow) => (
      <Badge
        label={statusLabel[item.status]}
        variant={statusVariant[item.status]}
      />
    ),
  },
];

// ============= WIDGET COMPONENTS =============

/** Minimal trend line for a Stat's media slot — no axes, grid, or tooltip. */
function TrendSparkline({data}: {data: readonly number[]}) {
  const chartData = data.map((value, index) => ({index, value}));
  return (
    <div style={styles.sparkline}>
      <Chart
        data={chartData}
        xKey="index"
        series={[line('value', {color: chartColors.spark})]}
        height={36}
        margin={{top: 4, right: 0, bottom: 4, left: 0}}
      />
    </div>
  );
}

/** One compact trend Stat in a Card — used by the right-hand rail. */
function TrendStatCard({metric}: {metric: TrendMetric}) {
  return (
    <Card>
      <Stat
        label={metric.label}
        value={metric.value}
        delta={metric.delta}
        description={metric.description}
        media={<TrendSparkline data={metric.spark} />}
      />
    </Card>
  );
}

/**
 * Hero revenue card: large Stat with the trailing eight-quarter bar chart
 * and a plan-attainment progress bar as the media slot.
 */
function HeroRevenueCard({
  hero,
  chart,
}: {
  hero: HeroFixture;
  chart: ReadonlyArray<{quarter: string; revenue: number}>;
}) {
  const attainment = Math.round((hero.planActual / hero.planTarget) * 100);
  return (
    <Card>
      <Stat
        label={hero.label}
        value={hero.value}
        delta={hero.delta}
        description={hero.description}
        media={
          <VStack gap={3}>
            <div style={styles.heroChart}>
              <Chart
                data={[...chart]}
                xKey="quarter"
                series={[
                  bar('revenue', {
                    color: chartColors.revenue,
                    radius: 4,
                    label: 'Net revenue',
                  }),
                ]}
                tooltip={true}
                grid={<ChartGrid horizontal />}
                axes={
                  <>
                    <ChartAxis position="bottom" />
                    <ChartAxis
                      position="left"
                      tickFormat={(v: unknown) => \`$\${v}M\`}
                    />
                  </>
                }
                height={240}
                margin={{left: 44, right: 10, top: 10, bottom: 30}}
              />
            </div>
            <VStack gap={1}>
              <ProgressBar
                value={hero.planActual}
                max={hero.planTarget}
                label="Quarterly plan attainment"
                variant={attainment >= 100 ? 'success' : 'accent'}
                hasValueLabel
                formatValueLabel={(value, max) =>
                  \`$\${value.toFixed(1)}M of $\${max.toFixed(1)}M\`
                }
              />
              <Text type="supporting" color="secondary">
                {hero.planCaption}
              </Text>
            </VStack>
          </VStack>
        }
      />
    </Card>
  );
}

// ============= PAGE =============

export default function DashboardExecutiveSummaryTemplate() {
  const [quarter, setQuarter] = useState<QuarterKey>('q2-fy26');
  // Below 960px the trend rail drops under the hero and reflows 2-up.
  const isStacked = useMediaQuery('(max-width: 960px)');
  // Below 640px the header subtitle hides so the quarter SegmentedControl
  // (the page's primary control) keeps room when it wraps to a second row.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const fixture = QUARTER_FIXTURES[quarter];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Executive summary</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    Meridian Cloud · Board review
                  </Text>
                )}
              </HStack>
            </StackItem>
            <SegmentedControl
              value={quarter}
              onChange={value => setQuarter(value as QuarterKey)}
              label="Fiscal quarter"
              size="md">
              <SegmentedControlItem value="q4-fy25" label="Q4 FY25" />
              <SegmentedControlItem value="q1-fy26" label="Q1 FY26" />
              <SegmentedControlItem value="q2-fy26" label="Q2 QTD" />
            </SegmentedControl>
            <IconButton
              label="Refresh"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
              variant="ghost"
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* Hero region — fluid revenue card + fixed trend rail */}
            <div
              style={{
                ...styles.heroGrid,
                ...(isStacked ? styles.heroGridStacked : undefined),
              }}>
              <HeroRevenueCard hero={fixture.hero} chart={fixture.chart} />
              {isStacked ? (
                <Grid columns={{minWidth: 220, max: 2}} gap={4}>
                  {fixture.trends.map(metric => (
                    <TrendStatCard key={metric.label} metric={metric} />
                  ))}
                </Grid>
              ) : (
                <VStack gap={4}>
                  {fixture.trends.map(metric => (
                    <TrendStatCard key={metric.label} metric={metric} />
                  ))}
                </VStack>
              )}
            </div>

            {/* Regional breakdown */}
            <Card>
              <VStack gap={4}>
                <HStack hAlign="between" vAlign="center">
                  <Heading level={3}>Regional performance</Heading>
                  <Text type="supporting" color="secondary">
                    {fixture.tableCaption}
                  </Text>
                </HStack>
                <Table<RegionRow>
                  data={fixture.regions}
                  columns={regionColumns}
                  idKey="id"
                  density="compact"
                  dividers="rows"
                  hasHover
                />
              </VStack>
            </Card>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};