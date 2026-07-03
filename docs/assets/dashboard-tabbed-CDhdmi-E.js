var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file dashboard-tabbed.tsx
 * @input Deterministic fixtures only (per-tab KPI metrics, daily/channel
 *   series, and compact table rows for a storefront analytics product)
 * @output Tabbed analytics dashboard: header with title, reporting-window
 *   Selector, and a TabList (Overview / Traffic / Revenue / Quality); the
 *   active tab renders its own 4-up KPI Stat row, one chart widget, and a
 *   compact table in the same frame via useState
 * @position Page template; emitted by \`astryx template dashboard-tabbed\`
 *
 * Responsive contract:
 * - Header: title and controls share one row (wrap="wrap"), so the Selector
 *   and refresh control drop below the title instead of clipping when the
 *   row runs out of width; the TabList sits on its own row below so tabs
 *   never collide with the Selector at narrow widths.
 * - KPI row: Grid columns={{minWidth: 240, max: 4}} — 4-up on wide
 *   viewports, reflowing to 2-up and 1-up as the viewport narrows.
 * - Chart + table pair: Grid columns={{minWidth: 320, repeat: 'fit'}} —
 *   side by side on wide viewports, stacked on narrow ones; 320px tracks
 *   keep the stacked column inside a 375px viewport.
 * - Tables: the leading proportional column absorbs remaining width;
 *   pixel columns keep numeric cells stable at every breakpoint.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

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
import {Selector} from '@astryxdesign/core/Selector';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
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
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  // Keep charts from collapsing when their card flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
};

// Chart series colors via Astryx design tokens (CSS custom properties).
// The categorical data tokens are not defined in every theme, so each
// fallback is an explicit light-dark() pair: the light value matches the
// original palette exactly and the dark value is a brighter same-hue
// variant that stays legible on dark chart surfaces.
const chartColors = {
  sessions: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4DA3FF))',
  orders: 'var(--color-data-categorical-green, light-dark(#0B991F, #4CC95D))',
  channels:
    'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  gross: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #3FB2C1))',
  net: 'var(--color-data-categorical-green, light-dark(#0B991F, #4CC95D))',
  declines:
    'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF963B))',
  apiErrors:
    'var(--color-data-categorical-pink, light-dark(#D91E76, #F0619F))',
};

// ============= DATA =============

const RANGE_OPTIONS = [
  {value: '7d', label: 'Last 7 days'},
  {value: '30d', label: 'Last 30 days'},
  {value: '90d', label: 'Last quarter'},
];

// KPI shape shared by every tab. \`sentiment\` inverts the delta color for
// metrics where a drop is good (bounce rate, refunds) or a rise is bad
// (checkout errors).
interface Kpi {
  label: string;
  value: string;
  delta: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
  description: string;
}

// --- Overview tab -----------------------------------------------------

const overviewKpis: Kpi[] = [
  {
    label: 'Sessions',
    value: '412,806',
    delta: {value: '+8.2%', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Conversion rate',
    value: '3.42%',
    delta: {value: '+0.21 pts', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Net revenue',
    value: '$486,210',
    delta: {value: '+11.6%', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Support CSAT',
    value: '4.6 / 5',
    delta: {value: '0.0', direction: 'flat'},
    description: 'vs. previous 30 days',
  },
];

// Sessions vs. orders, one point per day over two weeks (thousands).
const overviewSeries = [
  {day: 'Jun 15', sessions: 12.8, orders: 0.42},
  {day: 'Jun 16', sessions: 13.1, orders: 0.44},
  {day: 'Jun 17', sessions: 12.6, orders: 0.41},
  {day: 'Jun 18', sessions: 13.4, orders: 0.45},
  {day: 'Jun 19', sessions: 13.9, orders: 0.47},
  {day: 'Jun 20', sessions: 14.2, orders: 0.49},
  {day: 'Jun 21', sessions: 13.8, orders: 0.46},
  {day: 'Jun 22', sessions: 14.6, orders: 0.51},
  {day: 'Jun 23', sessions: 14.1, orders: 0.49},
  {day: 'Jun 24', sessions: 15.0, orders: 0.53},
  {day: 'Jun 25', sessions: 15.4, orders: 0.55},
  {day: 'Jun 26', sessions: 15.1, orders: 0.54},
  {day: 'Jun 27', sessions: 15.9, orders: 0.57},
  {day: 'Jun 28', sessions: 16.4, orders: 0.6},
];

interface LandingPageRow extends Record<string, unknown> {
  id: string;
  page: string;
  sessions: string;
  conversion: string;
  revenue: string;
}

const landingPageRows: LandingPageRow[] = [
  {
    id: '1',
    page: '/collections/summer-linen',
    sessions: '48,204',
    conversion: '4.8%',
    revenue: '$86,410',
  },
  {
    id: '2',
    page: '/products/harbor-tote',
    sessions: '36,918',
    conversion: '3.9%',
    revenue: '$52,730',
  },
  {
    id: '3',
    page: '/ (home)',
    sessions: '33,551',
    conversion: '2.6%',
    revenue: '$41,088',
  },
  {
    id: '4',
    page: '/collections/new-arrivals',
    sessions: '27,463',
    conversion: '3.1%',
    revenue: '$38,916',
  },
  {
    id: '5',
    page: '/products/atlas-sneaker',
    sessions: '21,190',
    conversion: '5.2%',
    revenue: '$47,652',
  },
  {
    id: '6',
    page: '/pages/gift-guide',
    sessions: '14,876',
    conversion: '1.9%',
    revenue: '$12,341',
  },
];

const landingPageColumns: TableColumn<LandingPageRow>[] = [
  {
    key: 'page',
    header: 'Landing page',
    width: proportional(2),
    renderCell: (item: LandingPageRow) => <Text type="body">{item.page}</Text>,
  },
  {
    key: 'sessions',
    header: 'Sessions',
    width: pixel(100),
    renderCell: (item: LandingPageRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.sessions}</Text>
      </span>
    ),
  },
  {
    key: 'conversion',
    header: 'Conv.',
    width: pixel(80),
    renderCell: (item: LandingPageRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.conversion}</Text>
      </span>
    ),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    width: pixel(100),
    renderCell: (item: LandingPageRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.revenue}</Text>
      </span>
    ),
  },
];

// --- Traffic tab ------------------------------------------------------

const trafficKpis: Kpi[] = [
  {
    label: 'Unique visitors',
    value: '268,410',
    delta: {value: '+6.1%', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Bounce rate',
    value: '38.2%',
    delta: {value: '-2.4 pts', direction: 'down', sentiment: 'positive'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Pages / session',
    value: '4.8',
    delta: {value: '+0.3', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Avg. session',
    value: '3m 42s',
    delta: {value: '+11s', direction: 'up'},
    description: 'vs. previous 30 days',
  },
];

// Sessions per acquisition channel for the selected period (thousands).
const channelSeries = [
  {channel: 'Organic', sessions: 148.2},
  {channel: 'Paid search', sessions: 92.6},
  {channel: 'Direct', sessions: 71.4},
  {channel: 'Social', sessions: 48.9},
  {channel: 'Email', sessions: 31.2},
  {channel: 'Referral', sessions: 20.5},
];

interface ReferrerRow extends Record<string, unknown> {
  id: string;
  source: string;
  sessions: string;
  bounce: string;
  conversion: string;
}

const referrerRows: ReferrerRow[] = [
  {
    id: '1',
    source: 'google.com',
    sessions: '141,208',
    bounce: '34.1%',
    conversion: '3.8%',
  },
  {
    id: '2',
    source: 'instagram.com',
    sessions: '38,412',
    bounce: '47.6%',
    conversion: '2.1%',
  },
  {
    id: '3',
    source: 'facebook.com',
    sessions: '22,904',
    bounce: '51.2%',
    conversion: '1.7%',
  },
  {
    id: '4',
    source: 'stylebook.blog',
    sessions: '11,566',
    bounce: '29.8%',
    conversion: '4.4%',
  },
  {
    id: '5',
    source: 'bing.com',
    sessions: '9,341',
    bounce: '36.5%',
    conversion: '3.2%',
  },
  {
    id: '6',
    source: 'pinterest.com',
    sessions: '7,082',
    bounce: '44.9%',
    conversion: '2.6%',
  },
];

const referrerColumns: TableColumn<ReferrerRow>[] = [
  {
    key: 'source',
    header: 'Source',
    width: proportional(2),
    renderCell: (item: ReferrerRow) => <Text type="body">{item.source}</Text>,
  },
  {
    key: 'sessions',
    header: 'Sessions',
    width: pixel(100),
    renderCell: (item: ReferrerRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.sessions}</Text>
      </span>
    ),
  },
  {
    key: 'bounce',
    header: 'Bounce',
    width: pixel(80),
    renderCell: (item: ReferrerRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.bounce}</Text>
      </span>
    ),
  },
  {
    key: 'conversion',
    header: 'Conv.',
    width: pixel(80),
    renderCell: (item: ReferrerRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.conversion}</Text>
      </span>
    ),
  },
];

// --- Revenue tab ------------------------------------------------------

const revenueKpis: Kpi[] = [
  {
    label: 'Gross revenue',
    value: '$512,940',
    delta: {value: '+11.6%', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Avg. order value',
    value: '$86.40',
    delta: {value: '+$3.10', direction: 'up'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Refund rate',
    value: '1.8%',
    delta: {value: '-0.3 pts', direction: 'down', sentiment: 'positive'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Repeat purchase rate',
    value: '31.4%',
    delta: {value: '+1.9 pts', direction: 'up'},
    description: 'vs. previous 30 days',
  },
];

// Gross vs. net revenue per day over two weeks ($ thousands).
const revenueSeries = [
  {day: 'Jun 15', gross: 31.2, net: 28.7},
  {day: 'Jun 16', gross: 33.8, net: 31.1},
  {day: 'Jun 17', gross: 30.4, net: 28.0},
  {day: 'Jun 18', gross: 34.6, net: 31.8},
  {day: 'Jun 19', gross: 36.1, net: 33.2},
  {day: 'Jun 20', gross: 38.9, net: 35.8},
  {day: 'Jun 21', gross: 35.2, net: 32.4},
  {day: 'Jun 22', gross: 37.8, net: 34.8},
  {day: 'Jun 23', gross: 36.4, net: 33.5},
  {day: 'Jun 24', gross: 39.6, net: 36.4},
  {day: 'Jun 25', gross: 41.2, net: 37.9},
  {day: 'Jun 26', gross: 40.1, net: 36.9},
  {day: 'Jun 27', gross: 43.5, net: 40.0},
  {day: 'Jun 28', gross: 45.8, net: 42.1},
];

interface ProductRow extends Record<string, unknown> {
  id: string;
  product: string;
  units: string;
  revenue: string;
  refunds: string;
}

const productRows: ProductRow[] = [
  {
    id: '1',
    product: 'Atlas Sneaker',
    units: '1,286',
    revenue: '$166,894',
    refunds: '2.4%',
  },
  {
    id: '2',
    product: 'Harbor Tote',
    units: '1,842',
    revenue: '$101,310',
    refunds: '0.9%',
  },
  {
    id: '3',
    product: 'Field Jacket',
    units: '671',
    revenue: '$93,940',
    refunds: '3.1%',
  },
  {
    id: '4',
    product: 'Summer Linen Shirt',
    units: '1,154',
    revenue: '$63,470',
    refunds: '1.6%',
  },
  {
    id: '5',
    product: 'Coastline Cap',
    units: '986',
    revenue: '$27,608',
    refunds: '0.4%',
  },
  {
    id: '6',
    product: 'Trail Sock 3-Pack',
    units: '644',
    revenue: '$11,592',
    refunds: '0.2%',
  },
];

const productColumns: TableColumn<ProductRow>[] = [
  {
    key: 'product',
    header: 'Product',
    width: proportional(2),
    renderCell: (item: ProductRow) => <Text type="body">{item.product}</Text>,
  },
  {
    key: 'units',
    header: 'Units',
    width: pixel(80),
    renderCell: (item: ProductRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.units}</Text>
      </span>
    ),
  },
  {
    key: 'revenue',
    header: 'Revenue',
    width: pixel(100),
    renderCell: (item: ProductRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.revenue}</Text>
      </span>
    ),
  },
  {
    key: 'refunds',
    header: 'Refunds',
    width: pixel(90),
    renderCell: (item: ProductRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.refunds}</Text>
      </span>
    ),
  },
];

// --- Quality tab ------------------------------------------------------

const qualityKpis: Kpi[] = [
  {
    label: 'Checkout error rate',
    value: '0.94%',
    delta: {value: '+0.18 pts', direction: 'up', sentiment: 'negative'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'P95 page load',
    value: '2.4 s',
    delta: {value: '-0.3 s', direction: 'down', sentiment: 'positive'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Crash-free sessions',
    value: '99.2%',
    delta: {value: '0.0 pts', direction: 'flat'},
    description: 'vs. previous 30 days',
  },
  {
    label: 'Open defects',
    value: '14',
    delta: {value: '-6', direction: 'down', sentiment: 'positive'},
    description: 'vs. previous 30 days',
  },
];

// Checkout failures per day over two weeks (count).
const errorSeries = [
  {day: 'Jun 15', declines: 142, apiErrors: 61},
  {day: 'Jun 16', declines: 138, apiErrors: 58},
  {day: 'Jun 17', declines: 151, apiErrors: 64},
  {day: 'Jun 18', declines: 129, apiErrors: 55},
  {day: 'Jun 19', declines: 136, apiErrors: 59},
  {day: 'Jun 20', declines: 148, apiErrors: 63},
  {day: 'Jun 21', declines: 161, apiErrors: 71},
  {day: 'Jun 22', declines: 155, apiErrors: 66},
  {day: 'Jun 23', declines: 171, apiErrors: 74},
  {day: 'Jun 24', declines: 166, apiErrors: 70},
  {day: 'Jun 25', declines: 182, apiErrors: 79},
  {day: 'Jun 26', declines: 178, apiErrors: 76},
  {day: 'Jun 27', declines: 196, apiErrors: 84},
  {day: 'Jun 28', declines: 204, apiErrors: 90},
];

interface IssueRow extends Record<string, unknown> {
  id: string;
  issue: string;
  area: string;
  occurrences: string;
  status: 'investigating' | 'monitoring' | 'fix-in-review';
}

const issueRows: IssueRow[] = [
  {
    id: 'QA-412',
    issue: 'Payment declines spike on 3-D Secure retry',
    area: 'Checkout',
    occurrences: '1,204',
    status: 'investigating',
  },
  {
    id: 'QA-408',
    issue: 'Image CDN timeouts on product gallery',
    area: 'Storefront',
    occurrences: '486',
    status: 'monitoring',
  },
  {
    id: 'QA-405',
    issue: 'Search returns no results for hyphenated terms',
    area: 'Search',
    occurrences: '312',
    status: 'monitoring',
  },
  {
    id: 'QA-399',
    issue: 'Gift card balance rounds down at split payment',
    area: 'Checkout',
    occurrences: '57',
    status: 'fix-in-review',
  },
  {
    id: 'QA-396',
    issue: 'Wishlist sync drops items on account merge',
    area: 'Accounts',
    occurrences: '31',
    status: 'fix-in-review',
  },
];

const issueStatusVariant: Record<
  IssueRow['status'],
  'red' | 'orange' | 'blue'
> = {
  investigating: 'red',
  monitoring: 'orange',
  'fix-in-review': 'blue',
};

const issueStatusLabel: Record<IssueRow['status'], string> = {
  investigating: 'Investigating',
  monitoring: 'Monitoring',
  'fix-in-review': 'Fix in review',
};

const issueColumns: TableColumn<IssueRow>[] = [
  {
    key: 'issue',
    header: 'Issue',
    width: proportional(2),
    renderCell: (item: IssueRow) => <Text type="body">{item.issue}</Text>,
  },
  {
    key: 'area',
    header: 'Area',
    width: pixel(100),
    renderCell: (item: IssueRow) => (
      <Text type="body" color="secondary">
        {item.area}
      </Text>
    ),
  },
  {
    key: 'occurrences',
    header: '24h count',
    width: pixel(90),
    renderCell: (item: IssueRow) => (
      <span style={styles.numericCell}>
        <Text type="body">{item.occurrences}</Text>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: pixel(120),
    renderCell: (item: IssueRow) => (
      <Badge
        label={issueStatusLabel[item.status]}
        variant={issueStatusVariant[item.status]}
      />
    ),
  },
];

// ============= TAB VIEWS =============

type TabId = 'overview' | 'traffic' | 'revenue' | 'quality';

interface TabView {
  kpis: Kpi[];
  chart: {title: string; caption: string; body: ReactNode};
  table: {title: string; caption: string; body: ReactNode};
}

const DAILY_CHART_MARGIN = {left: 40, right: 10, top: 10, bottom: 30};

// Every tab shares one frame; only the widgets below the TabList swap.
// All chart/table bodies are prebuilt from the fixtures above.
const VIEWS: Record<TabId, TabView> = {
  overview: {
    kpis: overviewKpis,
    chart: {
      title: 'Sessions & orders',
      caption: 'Per day over the last two weeks (thousands)',
      body: (
        <Chart
          data={overviewSeries}
          xKey="day"
          series={[
            line('sessions', {color: chartColors.sessions, label: 'Sessions'}),
            line('orders', {color: chartColors.orders, label: 'Orders'}),
          ]}
          legend={{position: 'bottom', alignment: 'center'}}
          tooltip={true}
          grid={<ChartGrid horizontal />}
          axes={
            <>
              <ChartAxis position="bottom" />
              <ChartAxis
                position="left"
                tickFormat={(v: unknown) => \`\${v}k\`}
              />
            </>
          }
          height={240}
          margin={DAILY_CHART_MARGIN}
        />
      ),
    },
    table: {
      title: 'Top landing pages',
      caption: 'Entry pages ranked by sessions',
      body: (
        <Table<LandingPageRow>
          data={landingPageRows}
          columns={landingPageColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      ),
    },
  },
  traffic: {
    kpis: trafficKpis,
    chart: {
      title: 'Sessions by channel',
      caption: 'Acquisition mix for the selected period (thousands)',
      body: (
        <Chart
          data={channelSeries}
          xKey="channel"
          series={[
            bar('sessions', {
              color: chartColors.channels,
              radius: 4,
              label: 'Sessions',
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
                tickFormat={(v: unknown) => \`\${v}k\`}
              />
            </>
          }
          height={240}
          margin={DAILY_CHART_MARGIN}
        />
      ),
    },
    table: {
      title: 'Top referrers',
      caption: 'External sources ranked by sessions',
      body: (
        <Table<ReferrerRow>
          data={referrerRows}
          columns={referrerColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      ),
    },
  },
  revenue: {
    kpis: revenueKpis,
    chart: {
      title: 'Gross vs. net revenue',
      caption: 'Per day over the last two weeks ($ thousands)',
      body: (
        <Chart
          data={revenueSeries}
          xKey="day"
          series={[
            line('gross', {color: chartColors.gross, label: 'Gross'}),
            line('net', {color: chartColors.net, label: 'Net'}),
          ]}
          legend={{position: 'bottom', alignment: 'center'}}
          tooltip={true}
          grid={<ChartGrid horizontal />}
          axes={
            <>
              <ChartAxis position="bottom" />
              <ChartAxis
                position="left"
                tickFormat={(v: unknown) => \`$\${v}k\`}
              />
            </>
          }
          height={240}
          margin={DAILY_CHART_MARGIN}
        />
      ),
    },
    table: {
      title: 'Best sellers',
      caption: 'Products ranked by revenue',
      body: (
        <Table<ProductRow>
          data={productRows}
          columns={productColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      ),
    },
  },
  quality: {
    kpis: qualityKpis,
    chart: {
      title: 'Checkout failures',
      caption: 'Payment declines vs. API errors per day (count)',
      body: (
        <Chart
          data={errorSeries}
          xKey="day"
          series={[
            line('declines', {
              color: chartColors.declines,
              label: 'Payment declines',
            }),
            line('apiErrors', {
              color: chartColors.apiErrors,
              label: 'API errors',
            }),
          ]}
          legend={{position: 'bottom', alignment: 'center'}}
          tooltip={true}
          grid={<ChartGrid horizontal />}
          axes={
            <>
              <ChartAxis position="bottom" />
              <ChartAxis position="left" />
            </>
          }
          height={240}
          margin={DAILY_CHART_MARGIN}
        />
      ),
    },
    table: {
      title: 'Active quality issues',
      caption: 'Open issues ranked by 24h occurrences',
      body: (
        <Table<IssueRow>
          data={issueRows}
          columns={issueColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      ),
    },
  },
};

// ============= WIDGET COMPONENTS =============

/** Card wrapper for a widget: title, supporting caption, widget body. */
function WidgetCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <VStack gap={1}>
        <Heading level={3}>{title}</Heading>
        <Text type="supporting" color="secondary">
          {caption}
        </Text>
        <div style={styles.chartBody}>{children}</div>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function DashboardTabbedTemplate() {
  const [tab, setTab] = useState<TabId>('overview');
  const [range, setRange] = useState('30d');
  const view = VIEWS[tab];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>Storefront analytics</Heading>
                  <Text type="supporting" color="secondary">
                    acme-outfitters.shop
                  </Text>
                </HStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <Selector
                  label="Reporting window"
                  isLabelHidden
                  size="sm"
                  options={RANGE_OPTIONS}
                  value={range}
                  onChange={setRange}
                />
                <IconButton
                  label="Refresh data"
                  icon={<Icon icon={RefreshCwIcon} size="sm" />}
                  variant="ghost"
                />
              </HStack>
            </HStack>
            <TabList
              value={tab}
              onChange={value => setTab(value as TabId)}
              size="md">
              <Tab value="overview" label="Overview" />
              <Tab value="traffic" label="Traffic" />
              <Tab value="revenue" label="Revenue" />
              {/* Badge count = issueRows still in Investigating or
                  Monitoring (QA-412, QA-408, QA-405). */}
              <Tab
                value="quality"
                label="Quality"
                endContent={<Badge label="3" variant="red" />}
              />
            </TabList>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* KPI row — 4-up Stat cards for the active tab */}
            <Grid columns={{minWidth: 240, max: 4}} gap={4}>
              {view.kpis.map(kpi => (
                <Card key={kpi.label}>
                  <Stat
                    label={kpi.label}
                    value={kpi.value}
                    delta={kpi.delta}
                    description={kpi.description}
                  />
                </Card>
              ))}
            </Grid>

            {/* Chart + table pair for the active tab */}
            <Grid columns={{minWidth: 320, repeat: 'fit'}} gap={4}>
              <WidgetCard title={view.chart.title} caption={view.chart.caption}>
                {view.chart.body}
              </WidgetCard>
              <WidgetCard title={view.table.title} caption={view.table.caption}>
                {view.table.body}
              </WidgetCard>
            </Grid>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};