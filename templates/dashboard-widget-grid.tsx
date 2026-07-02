// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (storefront metrics, daily revenue
 *   series, category order counts, top-product rows, activity entries)
 * @output Configurable widget-grid dashboard for a storefront: a responsive
 *   Grid of mixed Card widgets (Stat metrics with sparklines, a revenue line
 *   chart, an orders-by-category bar chart, a compact top-products table, and
 *   a recent-activity list). Every widget header carries a MoreMenu with
 *   configure / resize / remove items; the page toolbar has an "Add widget"
 *   Button (restores widgets from the library pool) and an "Edit layout"
 *   ToggleButton that reveals drag-handle affordances. No real drag-and-drop
 *   — handles are visual only; resize and remove are the functional paths.
 * @position Page template; emitted by `astryx template dashboard-widget-grid`
 *
 * Responsive contract:
 * - Frame: Layout height="fill" — LayoutHeader (title, edit toggle, Add
 *   widget) stays pinned and the widget grid scrolls inside LayoutContent.
 * - >1120px: 4-column Grid. Metric widgets span 1 column; chart, table, and
 *   activity widgets span 2 (a user-resized metric also spans 2).
 * - 721–1120px: 2-column Grid; 2-column widgets span the full row, metrics
 *   sit side by side.
 * - <=720px: single column; every widget spans full width and the grid
 *   scrolls vertically inside LayoutContent.
 * - Widget headers keep title left / MoreMenu right at every width; the
 *   drag handle (edit mode only) sits before the title and never wraps.
 * - Charts shrink with their column (minWidth: 0 body) instead of forcing
 *   horizontal overflow; the table keeps pixel-width numeric columns and
 *   lets the product column absorb remaining space.
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
import {Grid, GridSpan} from '@astryxdesign/core/Grid';
import {Stat} from '@astryxdesign/core/Stat';
import {Badge} from '@astryxdesign/core/Badge';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
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
import {
  GripVerticalIcon,
  Maximize2Icon,
  Minimize2Icon,
  PlusIcon,
  SettingsIcon,
  SquarePenIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Reserve the sparkline's box so metric widgets keep equal height.
  sparkline: {height: 40, width: '100%'},
  // Keep charts from collapsing when their column flexes below min width.
  chartBody: {minWidth: 0, paddingTop: 'var(--spacing-2)'},
  // Numeric table cells use tabular numerals so digit columns stay aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  // Edit-mode affordances: dashed outline on each widget plus a grab handle.
  cardEditing: {
    outline: '1.5px dashed var(--color-accent)',
    outlineOffset: 2,
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 'var(--radius-control, 6px)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    cursor: 'grab',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// Chart series colors via Astryx design tokens (CSS custom properties)
const chartColors = {
  revenue: 'var(--color-data-categorical-blue, #0171E3)',
  orders: 'var(--color-data-categorical-green, #0B991F)',
  spark: 'var(--color-data-categorical-purple, #6B1EFD)',
};

// ============= DATA =============

type WidgetSize = 'sm' | 'lg';

interface MetricFixture {
  statLabel: string;
  value: string;
  delta: {
    value: string;
    direction: 'up' | 'down' | 'flat';
    sentiment?: 'positive' | 'negative' | 'neutral';
  };
  description: string;
  spark: number[];
}

// Top products table — compact ranking of best sellers by revenue.
interface ProductRow extends Record<string, unknown> {
  id: string;
  product: string;
  units: string;
  revenue: string;
  stock: 'in-stock' | 'low' | 'out';
}

// Widget catalog — a discriminated union so each widget kind carries its own
// fixture data. `defaultSize` maps to Grid spans (sm = 1 column, lg = 2).
type Widget =
  | {
      id: string;
      kind: 'metric';
      title: string;
      caption?: string;
      defaultSize: WidgetSize;
      metric: MetricFixture;
    }
  | {
      id: string;
      kind: 'line';
      title: string;
      caption?: string;
      defaultSize: WidgetSize;
      data: {day: string; revenue: number}[];
    }
  | {
      id: string;
      kind: 'bar';
      title: string;
      caption?: string;
      defaultSize: WidgetSize;
      data: {category: string; orders: number}[];
    }
  | {
      id: string;
      kind: 'table';
      title: string;
      caption?: string;
      defaultSize: WidgetSize;
      rows: ProductRow[];
    }
  | {
      id: string;
      kind: 'activity';
      title: string;
      caption?: string;
      defaultSize: WidgetSize;
      entries: {id: string; actor: string; action: string; time: string}[];
    };

const WIDGETS: Widget[] = [
  {
    id: 'gross-revenue',
    kind: 'metric',
    title: 'Gross revenue',
    defaultSize: 'sm',
    metric: {
      statLabel: 'Last 30 days',
      value: '$128,430',
      delta: {value: '+8.2%', direction: 'up'},
      description: 'vs. previous period',
      // Daily gross revenue, $ thousands — same series as the trend widget.
      spark: [3.9, 4.1, 4.0, 4.2, 4.1, 4.3, 4.2, 4.4, 4.3, 4.5, 4.4, 4.6, 4.7, 4.8],
    },
  },
  {
    id: 'orders',
    kind: 'metric',
    title: 'Orders',
    defaultSize: 'sm',
    metric: {
      statLabel: 'Last 30 days',
      value: '3,847',
      delta: {value: '+4.6%', direction: 'up'},
      description: 'vs. previous period',
      spark: [118, 121, 117, 124, 122, 128, 125, 131, 129, 134, 132, 138, 136, 141],
    },
  },
  {
    id: 'avg-order-value',
    kind: 'metric',
    title: 'Avg order value',
    defaultSize: 'sm',
    metric: {
      statLabel: 'Last 30 days',
      value: '$33.39',
      delta: {value: '+3.4%', direction: 'up'},
      description: 'vs. previous period',
      spark: [31.2, 31.6, 31.4, 31.9, 32.1, 31.8, 32.4, 32.2, 32.8, 32.6, 33.1, 32.9, 33.2, 33.4],
    },
  },
  {
    id: 'refund-rate',
    kind: 'metric',
    title: 'Refund rate',
    defaultSize: 'sm',
    metric: {
      statLabel: 'Last 30 days',
      value: '1.8%',
      delta: {value: '-0.3%', direction: 'down', sentiment: 'positive'},
      description: 'vs. previous period',
      spark: [2.4, 2.3, 2.4, 2.2, 2.3, 2.1, 2.2, 2.0, 2.1, 1.9, 2.0, 1.9, 1.8, 1.8],
    },
  },
  {
    id: 'revenue-trend',
    kind: 'line',
    title: 'Revenue trend',
    caption: 'Daily gross revenue, last 14 days ($ thousands)',
    defaultSize: 'lg',
    // ~$4.3k/day average — consistent with the $128,430 30-day gross metric.
    data: [
      {day: 'Jun 10', revenue: 3.9},
      {day: 'Jun 11', revenue: 4.1},
      {day: 'Jun 12', revenue: 4.0},
      {day: 'Jun 13', revenue: 4.2},
      {day: 'Jun 14', revenue: 4.1},
      {day: 'Jun 15', revenue: 4.3},
      {day: 'Jun 16', revenue: 4.2},
      {day: 'Jun 17', revenue: 4.4},
      {day: 'Jun 18', revenue: 4.3},
      {day: 'Jun 19', revenue: 4.5},
      {day: 'Jun 20', revenue: 4.4},
      {day: 'Jun 21', revenue: 4.6},
      {day: 'Jun 22', revenue: 4.7},
      {day: 'Jun 23', revenue: 4.8},
    ],
  },
  {
    id: 'orders-by-category',
    kind: 'bar',
    title: 'Orders by category',
    caption: 'Completed orders per category, last 30 days',
    defaultSize: 'lg',
    data: [
      {category: 'Apparel', orders: 1240},
      {category: 'Home', orders: 1032},
      {category: 'Beauty', orders: 684},
      {category: 'Outdoors', orders: 512},
      {category: 'Electronics', orders: 246},
      {category: 'Gifts', orders: 133},
    ],
  },
  {
    id: 'top-products',
    kind: 'table',
    title: 'Top products',
    caption: 'Best sellers by revenue, last 30 days',
    defaultSize: 'lg',
    rows: [
      {
        id: '1',
        product: 'Linen Throw Blanket',
        units: '386',
        revenue: '$17,370',
        stock: 'low',
      },
      {
        id: '2',
        product: 'Ceramic Pour-Over Set',
        units: '341',
        revenue: '$15,004',
        stock: 'in-stock',
      },
      {
        id: '3',
        product: 'Wool House Slippers',
        units: '268',
        revenue: '$11,792',
        stock: 'out',
      },
      {
        id: '4',
        product: 'Juniper Candle 8 oz',
        units: '412',
        revenue: '$9,888',
        stock: 'in-stock',
      },
      {
        id: '5',
        product: 'Oak Serving Board',
        units: '297',
        revenue: '$8,613',
        stock: 'in-stock',
      },
      {
        id: '6',
        product: 'Botanical Print Set',
        units: '224',
        revenue: '$6,048',
        stock: 'in-stock',
      },
    ],
  },
  {
    id: 'recent-activity',
    kind: 'activity',
    title: 'Recent activity',
    caption: 'Latest team and system events',
    defaultSize: 'lg',
    entries: [
      {
        id: 'a1',
        actor: 'Maya Chen',
        action: 'issued a refund on order #10482',
        time: '12m ago',
      },
      {
        id: 'a2',
        actor: 'Leo Tanaka',
        action: 'published the Summer Sale collection',
        time: '1h ago',
      },
      {
        id: 'a3',
        actor: 'Priya Shah',
        action: 'restocked Juniper Candle 8 oz (240 units)',
        time: '3h ago',
      },
      {
        id: 'a4',
        actor: 'Flow Bot',
        action: 'flagged order #10471 for manual review',
        time: '5h ago',
      },
      {
        id: 'a5',
        actor: 'Maya Chen',
        action: 'updated shipping zones for Canada',
        time: 'Yesterday',
      },
    ],
  },
  // Library-only widget — starts in the "Add widget" pool, not on the board.
  {
    id: 'conversion-rate',
    kind: 'metric',
    title: 'Conversion rate',
    defaultSize: 'sm',
    metric: {
      statLabel: 'Last 30 days',
      value: '3.4%',
      delta: {value: '+0.2%', direction: 'up'},
      description: 'vs. previous period',
      spark: [3.0, 3.1, 3.0, 3.2, 3.1, 3.3, 3.2, 3.3, 3.2, 3.4, 3.3, 3.4, 3.4, 3.4],
    },
  },
];

const WIDGET_BY_ID = new Map(WIDGETS.map(widget => [widget.id, widget]));

// Board seed — everything except the library-only conversion widget.
// Order matters: four metrics, then charts, then table + activity.
interface WidgetInstance {
  id: string;
  size: WidgetSize;
}

const INITIAL_LAYOUT: WidgetInstance[] = WIDGETS.filter(
  widget => widget.id !== 'conversion-rate',
).map(widget => ({id: widget.id, size: widget.defaultSize}));

const INITIAL_POOL = ['conversion-rate'];

const stockVariant: Record<ProductRow['stock'], 'green' | 'orange' | 'red'> = {
  'in-stock': 'green',
  low: 'orange',
  out: 'red',
};

const stockLabel: Record<ProductRow['stock'], string> = {
  'in-stock': 'In stock',
  low: 'Low stock',
  out: 'Out of stock',
};

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
    key: 'stock',
    header: 'Stock',
    width: pixel(120),
    renderCell: (item: ProductRow) => (
      <Badge label={stockLabel[item.stock]} variant={stockVariant[item.stock]} />
    ),
  },
];

// ============= WIDGET COMPONENTS =============

/** Minimal trend line for a metric widget — no axes, grid, or tooltip. */
function MetricSparkline({data}: {data: readonly number[]}) {
  const chartData = data.map((value, index) => ({index, value}));
  return (
    <div style={styles.sparkline}>
      <Chart
        data={chartData}
        xKey="index"
        series={[line('value', {color: chartColors.spark})]}
        height={40}
        margin={{top: 4, right: 0, bottom: 4, left: 0}}
      />
    </div>
  );
}

/** Renders a widget's body from its fixture, switching on widget kind. */
function WidgetBody({widget}: {widget: Widget}) {
  switch (widget.kind) {
    case 'metric':
      return (
        <Stat
          label={widget.metric.statLabel}
          value={widget.metric.value}
          delta={widget.metric.delta}
          description={widget.metric.description}
          media={<MetricSparkline data={widget.metric.spark} />}
        />
      );
    case 'line':
      return (
        <div style={styles.chartBody}>
          <Chart
            data={widget.data}
            xKey="day"
            series={[
              line('revenue', {color: chartColors.revenue, label: 'Revenue'}),
            ]}
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
            height={220}
            margin={{left: 44, right: 10, top: 10, bottom: 28}}
          />
        </div>
      );
    case 'bar':
      return (
        <div style={styles.chartBody}>
          <Chart
            data={widget.data}
            xKey="category"
            series={[
              bar('orders', {
                color: chartColors.orders,
                radius: 4,
                label: 'Orders',
              }),
            ]}
            tooltip={true}
            grid={<ChartGrid horizontal />}
            axes={
              <>
                <ChartAxis position="bottom" />
                <ChartAxis position="left" />
              </>
            }
            height={220}
            margin={{left: 44, right: 10, top: 10, bottom: 28}}
          />
        </div>
      );
    case 'table':
      return (
        <Table<ProductRow>
          data={widget.rows}
          columns={productColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
      );
    case 'activity':
      return (
        <VStack gap={3}>
          {widget.entries.map(entry => (
            <HStack key={entry.id} gap={2} vAlign="start">
              <Avatar name={entry.actor} size="xsmall" />
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Text type="body" maxLines={2}>
                    {entry.actor} {entry.action}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {entry.time}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      );
  }
}

/**
 * Card frame shared by every widget: header row with an edit-mode drag
 * handle, title + optional caption, and the configure/resize/remove menu.
 * The drag handle is a visual affordance only — no drag-and-drop here.
 */
function WidgetCard({
  widget,
  size,
  isEditing,
  onResize,
  onRemove,
}: {
  widget: Widget;
  size: WidgetSize;
  isEditing: boolean;
  onResize: () => void;
  onRemove: () => void;
}) {
  return (
    <Card
      padding={4}
      height="100%"
      style={isEditing ? styles.cardEditing : undefined}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          {isEditing ? (
            <div style={styles.dragHandle} aria-hidden="true">
              <Icon icon={GripVerticalIcon} size="sm" />
            </div>
          ) : null}
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Heading level={3}>{widget.title}</Heading>
              {widget.caption ? (
                <Text type="supporting" color="secondary" maxLines={1}>
                  {widget.caption}
                </Text>
              ) : null}
            </VStack>
          </StackItem>
          <MoreMenu
            label={`${widget.title} widget options`}
            size="sm"
            items={[
              {
                label: 'Configure widget',
                icon: <Icon icon={SettingsIcon} size="sm" />,
                // Settings dialog is out of scope for this template.
                onClick: () => {},
              },
              {
                label:
                  size === 'lg'
                    ? 'Shrink to one column'
                    : 'Expand to two columns',
                icon: (
                  <Icon
                    icon={size === 'lg' ? Minimize2Icon : Maximize2Icon}
                    size="sm"
                  />
                ),
                onClick: onResize,
              },
              {type: 'divider'},
              {
                label: 'Remove widget',
                icon: <Icon icon={XIcon} size="sm" />,
                onClick: onRemove,
              },
            ]}
          />
        </HStack>
        <WidgetBody widget={widget} />
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function DashboardWidgetGridTemplate() {
  // Board layout lives in state: remove sends a widget back to the library
  // pool, "Add widget" restores the oldest pooled widget, resize toggles a
  // widget between one and two grid columns.
  const [layout, setLayout] = useState<WidgetInstance[]>(INITIAL_LAYOUT);
  const [pool, setPool] = useState<string[]>(INITIAL_POOL);
  const [isEditing, setIsEditing] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  const isNarrow = useMediaQuery('(max-width: 720px)');
  const isMid = useMediaQuery('(max-width: 1120px)');
  const columnCount = isNarrow ? 1 : isMid ? 2 : 4;

  const nextPooled = pool.length > 0 ? WIDGET_BY_ID.get(pool[0]) : undefined;

  const addWidget = () => {
    if (!nextPooled) {
      return;
    }
    setLayout(prev => [
      ...prev,
      {id: nextPooled.id, size: nextPooled.defaultSize},
    ]);
    setPool(prev => prev.slice(1));
    setAnnouncement(`Added ${nextPooled.title} widget`);
  };

  const removeWidget = (id: string) => {
    const widget = WIDGET_BY_ID.get(id);
    setLayout(prev => prev.filter(instance => instance.id !== id));
    setPool(prev => [...prev, id]);
    if (widget) {
      setAnnouncement(`Removed ${widget.title} widget`);
    }
  };

  const resizeWidget = (id: string) => {
    setLayout(prev =>
      prev.map(instance =>
        instance.id === id
          ? {...instance, size: instance.size === 'lg' ? 'sm' : 'lg'}
          : instance,
      ),
    );
  };

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Store overview</Heading>
                <Text type="supporting" color="secondary">
                  Brightwell Goods · {layout.length} widgets
                </Text>
              </HStack>
            </StackItem>
            {isEditing ? (
              <Text type="supporting" color="secondary">
                Drag handles shown — layout editing is visual only
              </Text>
            ) : null}
            <ToggleButton
              label="Edit layout"
              icon={<Icon icon={SquarePenIcon} size="sm" />}
              isPressed={isEditing}
              onPressedChange={setIsEditing}
            />
            <Button
              label="Add widget"
              variant="primary"
              icon={<Icon icon={PlusIcon} size="sm" />}
              isDisabled={!nextPooled}
              tooltip={
                nextPooled
                  ? `Add "${nextPooled.title}" from the widget library`
                  : 'All widgets are on the board'
              }
              onClick={addWidget}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <Grid columns={columnCount} gap={4}>
            {layout.map(instance => {
              const widget = WIDGET_BY_ID.get(instance.id);
              if (!widget) {
                return null;
              }
              const span =
                columnCount === 1 ? 1 : instance.size === 'lg' ? 2 : 1;
              return (
                <GridSpan key={instance.id} columns={span}>
                  <WidgetCard
                    widget={widget}
                    size={instance.size}
                    isEditing={isEditing}
                    onResize={() => resizeWidget(instance.id)}
                    onRemove={() => removeWidget(instance.id)}
                  />
                </GridSpan>
              );
            })}
          </Grid>
        </LayoutContent>
      }
    />
  );
}
