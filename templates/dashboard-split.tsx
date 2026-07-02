// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (per-range revenue series, supporting
 *   stats, and plan-mix breakdown rows keyed by time range)
 * @output Split revenue dashboard: header with page title and export action,
 *   a two-pane body — left half is one primary time-series chart Card with a
 *   SegmentedControl range switcher (7d / 30d / 90d swaps the fixture
 *   series), right half is a rail of stacked Stat cards plus a compact
 *   revenue-by-plan breakdown list with share bars
 * @position Page template; emitted by `astryx template dashboard-split`
 *
 * Responsive contract:
 * - Split: Grid columns={{minWidth: 400, repeat: 'fit'}} — the chart pane
 *   and the stat rail render as equal halves side by side when the viewport
 *   fits two 400px tracks, and stack chart-first on narrower viewports.
 * - Chart Card: the chart body keeps minWidth 0 so the SVG scales down with
 *   its pane instead of forcing horizontal overflow; the range switcher
 *   stays pinned right of the card title via StackItem fill.
 * - Stat rail: cards are always a single vertical stack, so nothing inside
 *   the right pane reflows — the pane simply moves below the chart.
 * - Breakdown rows: plan names truncate to one line; share percentages and
 *   amounts use tabular numerals so the right-aligned figures stay in a
 *   steady column.
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {ChartV2 as Chart, ChartGrid, ChartAxis, line} from '@astryxdesign/lab';
import {RefreshCwIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Keep the chart SVG from forcing overflow when its pane narrows.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
  // Right-aligned share and money figures stay in a steady column across rows.
  numeric: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  current: 'var(--color-data-categorical-blue, #0171E3)',
  previous: 'var(--color-data-categorical-purple, #6B1EFD)',
};

// ============= DATA =============

type RangeKey = '7d' | '30d' | '90d';

interface RevenuePoint extends Record<string, unknown> {
  label: string;
  current: number; // net revenue, $ thousands
  previous: number; // same position in the prior period, $ thousands
}

interface RangeStat {
  label: string;
  value: string;
  delta: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
  description: string;
}

interface PlanShare {
  plan: string;
  amount: string;
  share: number; // percent of net revenue for the selected range
}

// One self-consistent fixture bundle per time range. The SegmentedControl
// swaps the whole bundle so the chart, the stat rail, and the plan mix
// always describe the same window.
const RANGE_FIXTURES: Record<
  RangeKey,
  {
    caption: string;
    series: RevenuePoint[];
    stats: RangeStat[];
    breakdown: PlanShare[];
  }
> = {
  '7d': {
    caption: 'Net revenue per day vs. the prior week ($ thousands)',
    series: [
      {label: 'Jun 24', current: 41, previous: 38},
      {label: 'Jun 25', current: 44, previous: 37},
      {label: 'Jun 26', current: 43, previous: 40},
      {label: 'Jun 27', current: 47, previous: 39},
      {label: 'Jun 28', current: 39, previous: 36},
      {label: 'Jun 29', current: 35, previous: 34},
      {label: 'Jun 30', current: 49, previous: 41},
    ],
    stats: [
      {
        label: 'Net revenue',
        value: '$298K',
        delta: {value: '+9.6%', direction: 'up'},
        description: 'vs. prior 7 days',
      },
      {
        label: 'New subscriptions',
        value: '164',
        delta: {value: '+22', direction: 'up'},
        description: 'vs. prior 7 days',
      },
      {
        label: 'Churned MRR',
        value: '$4.1K',
        delta: {value: '-$0.8K', direction: 'down', sentiment: 'positive'},
        description: 'vs. prior 7 days',
      },
    ],
    breakdown: [
      {plan: 'Enterprise', amount: '$121K', share: 41},
      {plan: 'Growth', amount: '$86K', share: 29},
      {plan: 'Starter', amount: '$48K', share: 16},
      {plan: 'Usage add-ons', amount: '$27K', share: 9},
      {plan: 'Marketplace', amount: '$16K', share: 5},
    ],
  },
  '30d': {
    caption: 'Net revenue per 3-day bucket vs. the prior month ($ thousands)',
    series: [
      {label: 'Jun 1', current: 118, previous: 104},
      {label: 'Jun 4', current: 124, previous: 109},
      {label: 'Jun 7', current: 121, previous: 112},
      {label: 'Jun 10', current: 131, previous: 108},
      {label: 'Jun 13', current: 128, previous: 115},
      {label: 'Jun 16', current: 136, previous: 118},
      {label: 'Jun 19', current: 133, previous: 116},
      {label: 'Jun 22', current: 141, previous: 121},
      {label: 'Jun 25', current: 138, previous: 124},
      {label: 'Jun 28', current: 147, previous: 126},
    ],
    stats: [
      {
        label: 'Net revenue',
        value: '$1.32M',
        delta: {value: '+12.1%', direction: 'up'},
        description: 'vs. prior 30 days',
      },
      {
        label: 'New subscriptions',
        value: '712',
        delta: {value: '+64', direction: 'up'},
        description: 'vs. prior 30 days',
      },
      {
        label: 'Churned MRR',
        value: '$18.6K',
        delta: {value: '+$2.3K', direction: 'up', sentiment: 'negative'},
        description: 'vs. prior 30 days',
      },
    ],
    breakdown: [
      {plan: 'Enterprise', amount: '$541K', share: 41},
      {plan: 'Growth', amount: '$369K', share: 28},
      {plan: 'Starter', amount: '$224K', share: 17},
      {plan: 'Usage add-ons', amount: '$119K', share: 9},
      {plan: 'Marketplace', amount: '$66K', share: 5},
    ],
  },
  '90d': {
    caption: 'Net revenue per week vs. the prior quarter ($ thousands)',
    series: [
      {label: 'Apr 6', current: 262, previous: 231},
      {label: 'Apr 13', current: 258, previous: 236},
      {label: 'Apr 20', current: 271, previous: 229},
      {label: 'Apr 27', current: 266, previous: 241},
      {label: 'May 4', current: 279, previous: 238},
      {label: 'May 11', current: 284, previous: 247},
      {label: 'May 18', current: 276, previous: 251},
      {label: 'May 25', current: 291, previous: 249},
      {label: 'Jun 1', current: 288, previous: 256},
      {label: 'Jun 8', current: 297, previous: 254},
      {label: 'Jun 15', current: 304, previous: 262},
      {label: 'Jun 22', current: 299, previous: 266},
      {label: 'Jun 29', current: 312, previous: 264},
    ],
    stats: [
      {
        label: 'Net revenue',
        value: '$3.69M',
        delta: {value: '+14.8%', direction: 'up'},
        description: 'vs. prior quarter',
      },
      {
        label: 'New subscriptions',
        value: '2,138',
        delta: {value: '+241', direction: 'up'},
        description: 'vs. prior quarter',
      },
      {
        label: 'Churned MRR',
        value: '$52.4K',
        delta: {value: '-$6.1K', direction: 'down', sentiment: 'positive'},
        description: 'vs. prior quarter',
      },
    ],
    breakdown: [
      {plan: 'Enterprise', amount: '$1.48M', share: 40},
      {plan: 'Growth', amount: '$1.03M', share: 28},
      {plan: 'Starter', amount: '$664K', share: 18},
      {plan: 'Usage add-ons', amount: '$332K', share: 9},
      {plan: 'Marketplace', amount: '$185K', share: 5},
    ],
  },
};

// ============= WIDGET COMPONENTS =============

/** One row of the plan-mix breakdown: name, share bar, amount. */
function PlanShareRow({row}: {row: PlanShare}) {
  return (
    <VStack gap={1}>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <Text type="body" maxLines={1}>
            {row.plan}
          </Text>
        </StackItem>
        <span style={styles.numeric}>
          <Text type="supporting" color="secondary">
            {row.share}%
          </Text>
        </span>
        <span style={styles.numeric}>
          <Text type="body">{row.amount}</Text>
        </span>
      </HStack>
      <ProgressBar
        label={`${row.plan} share of net revenue`}
        isLabelHidden
        value={row.share}
        variant="accent"
      />
    </VStack>
  );
}

// ============= PAGE =============

export default function DashboardSplitTemplate() {
  const [range, setRange] = useState<RangeKey>('30d');
  const fixture = RANGE_FIXTURES[range];

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Revenue</Heading>
                <Text type="supporting" color="secondary">
                  Billing performance across all Atlas Cloud plans
                </Text>
              </VStack>
            </StackItem>
            <Button label="Export report" variant="secondary" />
            <IconButton
              label="Refresh data"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
              variant="ghost"
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          {/* Two-pane split: chart half + stat rail half. Grid keeps the
              halves equal and stacks them chart-first on narrow viewports. */}
          <Grid columns={{minWidth: 400, repeat: 'fit'}} gap={4}>
            {/* Left half — primary time-series chart */}
            <Card>
              <VStack gap={1}>
                <HStack gap={3} vAlign="center">
                  <StackItem size="fill">
                    <Heading level={3}>Net revenue</Heading>
                  </StackItem>
                  <SegmentedControl
                    label="Time range"
                    value={range}
                    onChange={value => setRange(value as RangeKey)}
                    size="sm">
                    <SegmentedControlItem value="7d" label="7d" />
                    <SegmentedControlItem value="30d" label="30d" />
                    <SegmentedControlItem value="90d" label="90d" />
                  </SegmentedControl>
                </HStack>
                <Text type="supporting" color="secondary">
                  {fixture.caption}
                </Text>
                <div style={styles.chartBody}>
                  <Chart
                    data={fixture.series}
                    xKey="label"
                    series={[
                      line('current', {
                        color: chartColors.current,
                        label: 'This period',
                      }),
                      line('previous', {
                        color: chartColors.previous,
                        label: 'Prior period',
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
                    height={320}
                    margin={{left: 48, right: 10, top: 10, bottom: 30}}
                  />
                </div>
              </VStack>
            </Card>

            {/* Right half — supporting stats + plan-mix breakdown */}
            <VStack gap={4}>
              {fixture.stats.map(stat => (
                <Card key={stat.label}>
                  <Stat
                    label={stat.label}
                    value={stat.value}
                    delta={stat.delta}
                    description={stat.description}
                  />
                </Card>
              ))}
              <Card>
                <VStack gap={3}>
                  <VStack gap={0}>
                    <Heading level={3}>Revenue by plan</Heading>
                    <Text type="supporting" color="secondary">
                      Share of net revenue for the selected range
                    </Text>
                  </VStack>
                  <Divider />
                  <VStack gap={3}>
                    {fixture.breakdown.map(row => (
                      <PlanShareRow key={row.plan} row={row} />
                    ))}
                  </VStack>
                </VStack>
              </Card>
            </VStack>
          </Grid>
        </LayoutContent>
      }
    />
  );
}
