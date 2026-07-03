var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file data-catalog-lineage.tsx
 * @input Deterministic fixtures only (12 datasets across warehouse, dbt, and
 *   BI layers with owners, tags, glossary terms, quality scores, column
 *   profiles with null rates, 30-day usage stats, and 12 lineage edges —
 *   several carrying column-level mappings)
 * @output Data catalog and lineage explorer: a docked 320px left rail with a
 *   dataset search box, tag filter pills whose counts recompute live as tags
 *   are edited, and a layer-grouped dataset list with freshness StatusDots
 *   and owner captions; a center detail pane whose header supports inline
 *   description editing and tag add/remove (with undo of the last removal),
 *   above a Columns | Lineage | Usage TabList. Columns sorts by null rate
 *   and pins key columns to the top; Lineage renders an upstream/downstream
 *   SVG node graph where clicking any node moves the catalog selection and a
 *   Switch expands column-level edge strands between a chosen pair; Usage
 *   shows query stats, a weekly query bar strip, and top queriers
 * @position Page template; emitted by \`astryx template data-catalog-lineage\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * "12 datasets · 12 lineage edges" caption, rail toggle when collapsed).
 * LayoutPanel start 320 hosts the search + tag rail. LayoutContent hosts the
 * dataset detail header and the Columns/Lineage/Usage tabs in one scroll
 * region.
 *
 * Responsive contract:
 * - >1024px: header | rail 320 | detail (fill). The detail pane is the only
 *   flexible region; the rail keeps its fixed width and scrolls on its own.
 * - <=1024px: the rail collapses behind a filters IconButton in the header;
 *   toggling it docks the rail back in (same pattern at phone width).
 * - <=640px: the header caption hides so the title and rail toggle fit; the
 *   lineage canvas keeps its fixed 672px drawing width inside a horizontal
 *   scroller (deliberate overflowX, never squashed nodes); the Columns table
 *   drops the Type column; primary buttons grow to ~40px tap targets.
 *
 * Container policy (catalog-browser archetype): dense data renders as rows —
 * an edge-to-edge rail list grouped by layer, a data-driven Columns table,
 * and MetadataList blocks in Usage. Layer color is carried by StatusDot +
 * tinted Badge (warehouse=blue, dbt=orange, BI=purple); freshness by
 * success/warning/error StatusDots. The lineage canvas is plain SVG paths
 * under absolutely-positioned node buttons — no chart library.
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  ArrowUpDownIcon,
  ChartColumnIcon,
  DatabaseIcon,
  FilterIcon,
  KeyRoundIcon,
  LayersIcon,
  PencilIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  Undo2Icon,
  WaypointsIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {
    height: '100%',
    minHeight: 0,
  },
  // Rail: search + pills pinned, dataset list scrolls.
  railTop: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  railList: {
    overflowY: 'auto',
    minHeight: 0,
  },
  railGroupHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  pillWrap: {flexWrap: 'wrap'},
  tokenWrap: {flexWrap: 'wrap'},
  // Detail pane is one scroll region: header block + tabs + tab body.
  detailScroll: {
    overflowY: 'auto',
    minHeight: 0,
  },
  detailHeader: {
    padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-3)',
  },
  detailTabs: {
    paddingInline: 'var(--spacing-4)',
  },
  detailBody: {
    padding: 'var(--spacing-4)',
  },
  qualityBar: {width: 72},
  nullRateBar: {width: 56},
  // Lineage canvas: fixed drawing size; the wrapper scrolls horizontally on
  // phones instead of squashing nodes.
  canvasScroller: {
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-2)',
  },
  canvasStage: {
    position: 'relative',
  },
  edgeSvg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  node: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '6px 10px',
    textAlign: 'start',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
  },
  nodeSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: '0 0 0 1px var(--color-accent)',
    cursor: 'default',
  },
  nodeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  nodeSwatch: {
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
  },
  nodeName: {
    minWidth: 0,
    overflow: 'hidden',
  },
  // Weekly usage strip: eight deterministic CSS bars, no chart library.
  usageBars: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 4,
    height: 48,
  },
  usageBar: {
    flex: 1,
    backgroundColor: 'var(--color-accent)',
    borderRadius: 2,
    minHeight: 3,
  },
  addTagInput: {width: 150},
  // ~40px touch targets on phones (size="sm" renders shorter).
  buttonTapTarget: {height: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed freshness labels, no clocks, no randomness.

type Layer = 'warehouse' | 'dbt' | 'bi';
type Freshness = 'fresh' | 'stale' | 'late';

interface DatasetColumn {
  name: string;
  type: string;
  nullRate: number; // 0..1
  isKey: boolean;
  note: string;
}

interface Dataset {
  id: string;
  name: string;
  layer: Layer;
  owner: string;
  description: string;
  tags: string[];
  glossaryTerms: string[];
  qualityScore: number; // 0..100
  freshness: Freshness;
  freshnessLabel: string; // pre-formatted, deterministic
  rowCount: string;
  columns: DatasetColumn[];
  usage: {
    queries30d: number;
    users30d: number;
    weekly: number[]; // 8 fixed weekly query counts
    topUsers: Array<{name: string; team: string; queries: number}>;
  };
}

interface LineageEdge {
  id: string;
  from: string;
  to: string;
  /** Column-level mappings; empty for BI consumption edges. */
  columnEdges: Array<{from: string; to: string}>;
}

// Layer vocabulary: warehouse=blue, dbt=orange, BI=purple.
const LAYER_META: Record<
  Layer,
  {label: string; badge: BadgeVariant; dot: string}
> = {
  warehouse: {
    label: 'Warehouse',
    badge: 'blue',
    dot: 'var(--color-icon-blue)',
  },
  dbt: {label: 'dbt', badge: 'orange', dot: 'var(--color-icon-orange)'},
  bi: {label: 'BI', badge: 'purple', dot: 'var(--color-icon-purple)'},
};

const LAYERS: Layer[] = ['warehouse', 'dbt', 'bi'];

const FRESHNESS_META: Record<
  Freshness,
  {label: string; dot: 'success' | 'warning' | 'error'}
> = {
  fresh: {label: 'Fresh', dot: 'success'},
  stale: {label: 'Stale', dot: 'warning'},
  late: {label: 'Late', dot: 'error'},
};

const DATASETS: Dataset[] = [
  {
    id: 'ds_raw_orders',
    name: 'raw.orders',
    layer: 'warehouse',
    owner: 'Ingest Platform',
    description:
      'Order headers landed hourly from the commerce API. One row per ' +
      'checkout attempt; superseded attempts are soft-deleted upstream.',
    tags: ['core', 'finance'],
    glossaryTerms: ['Order'],
    qualityScore: 88,
    freshness: 'fresh',
    freshnessLabel: '12m ago',
    rowCount: '48.2M rows',
    columns: [
      {name: 'order_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Primary key'},
      {name: 'customer_id', type: 'uuid', nullRate: 0.002, isKey: false, note: 'FK to raw.customers'},
      {name: 'amount_cents', type: 'bigint', nullRate: 0.004, isKey: false, note: 'Pre-discount total'},
      {name: 'currency', type: 'varchar(3)', nullRate: 0.001, isKey: false, note: 'ISO 4217'},
      {name: 'status', type: 'varchar', nullRate: 0.012, isKey: false, note: 'API state machine value'},
      {name: 'ordered_at', type: 'timestamp', nullRate: 0, isKey: false, note: 'Checkout time, UTC'},
      {name: 'coupon_code', type: 'varchar', nullRate: 0.412, isKey: false, note: 'Null when no coupon applied'},
    ],
    usage: {
      queries30d: 1284,
      users30d: 37,
      weekly: [260, 291, 318, 344, 302, 336, 371, 358],
      topUsers: [
        {name: 'Priya Raman', team: 'Analytics Eng', queries: 212},
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 168},
        {name: 'Tomás Rivera', team: 'Finance BI', queries: 94},
      ],
    },
  },
  {
    id: 'ds_raw_customers',
    name: 'raw.customers',
    layer: 'warehouse',
    owner: 'Ingest Platform',
    description:
      'Customer master records synced from the accounts service every 15 ' +
      'minutes. Contains contact PII; access is row-policy gated.',
    tags: ['core', 'pii'],
    glossaryTerms: ['Active Customer'],
    qualityScore: 91,
    freshness: 'fresh',
    freshnessLabel: '9m ago',
    rowCount: '6.4M rows',
    columns: [
      {name: 'id', type: 'uuid', nullRate: 0, isKey: true, note: 'Primary key'},
      {name: 'email', type: 'varchar', nullRate: 0.008, isKey: false, note: 'PII — masked outside finance'},
      {name: 'full_name', type: 'varchar', nullRate: 0.031, isKey: false, note: 'PII'},
      {name: 'country', type: 'varchar(2)', nullRate: 0.056, isKey: false, note: 'ISO 3166-1 alpha-2'},
      {name: 'created_at', type: 'timestamp', nullRate: 0, isKey: false, note: 'Account creation, UTC'},
      {name: 'marketing_opt_in', type: 'boolean', nullRate: 0.114, isKey: false, note: 'Null before the 2024 consent form'},
    ],
    usage: {
      queries30d: 742,
      users30d: 21,
      weekly: [148, 156, 171, 189, 164, 182, 190, 178],
      topUsers: [
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 154},
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 88},
        {name: 'Priya Raman', team: 'Analytics Eng', queries: 71},
      ],
    },
  },
  {
    id: 'ds_raw_events',
    name: 'raw.events',
    layer: 'warehouse',
    owner: 'Ingest Platform',
    description:
      'Product event firehose from the client SDKs. Append-only; late ' +
      'events land up to 48h behind their occurred_at.',
    tags: ['events'],
    glossaryTerms: [],
    qualityScore: 74,
    freshness: 'stale',
    freshnessLabel: '3h ago',
    rowCount: '2.1B rows',
    columns: [
      {name: 'event_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Primary key'},
      {name: 'user_id', type: 'uuid', nullRate: 0.087, isKey: false, note: 'Null for anonymous sessions'},
      {name: 'event_name', type: 'varchar', nullRate: 0.001, isKey: false, note: 'Tracking-plan enum'},
      {name: 'occurred_at', type: 'timestamp', nullRate: 0, isKey: false, note: 'Client clock, UTC'},
      {name: 'properties', type: 'json', nullRate: 0.264, isKey: false, note: 'Free-form SDK payload'},
      {name: 'session_id', type: 'uuid', nullRate: 0.142, isKey: false, note: 'Null when the SDK predates sessions'},
    ],
    usage: {
      queries30d: 968,
      users30d: 44,
      weekly: [201, 214, 232, 260, 244, 238, 271, 265],
      topUsers: [
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 176},
        {name: 'Jordan Blake', team: 'Product Data', queries: 132},
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 97},
      ],
    },
  },
  {
    id: 'ds_raw_payments',
    name: 'raw.payments',
    layer: 'warehouse',
    owner: 'Ingest Platform',
    description:
      'Payment captures and fees from the PSP webhook. The nightly backfill ' +
      'job has been failing SLA since the provider API change.',
    tags: ['finance', 'pii'],
    glossaryTerms: [],
    qualityScore: 79,
    freshness: 'late',
    freshnessLabel: '26h ago',
    rowCount: '44.7M rows',
    columns: [
      {name: 'payment_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Primary key'},
      {name: 'order_id', type: 'uuid', nullRate: 0.003, isKey: false, note: 'FK to raw.orders'},
      {name: 'provider', type: 'varchar', nullRate: 0.001, isKey: false, note: 'PSP identifier'},
      {name: 'fee_cents', type: 'bigint', nullRate: 0.019, isKey: false, note: 'Provider fee at capture'},
      {name: 'captured_at', type: 'timestamp', nullRate: 0.044, isKey: false, note: 'Null while authorization pending'},
      {name: 'risk_score', type: 'numeric', nullRate: 0.238, isKey: false, note: 'Only scored above $100'},
    ],
    usage: {
      queries30d: 411,
      users30d: 12,
      weekly: [92, 88, 104, 96, 110, 84, 101, 89],
      topUsers: [
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 121},
        {name: 'Tomás Rivera', team: 'Finance BI', queries: 84},
        {name: 'Aisha Bello', team: 'Risk', queries: 52},
      ],
    },
  },
  {
    id: 'ds_stg_orders',
    name: 'stg_orders',
    layer: 'dbt',
    owner: 'Analytics Eng',
    description:
      'Staging view over raw.orders: renames, cents-to-dollars cast, and ' +
      'deduplication on order_id keeping the latest attempt.',
    tags: ['core'],
    glossaryTerms: ['Order'],
    qualityScore: 93,
    freshness: 'fresh',
    freshnessLabel: '18m ago',
    rowCount: '46.9M rows',
    columns: [
      {name: 'order_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Deduplicated key'},
      {name: 'customer_id', type: 'uuid', nullRate: 0.002, isKey: false, note: 'FK to stg_customers'},
      {name: 'amount', type: 'numeric(12,2)', nullRate: 0.004, isKey: false, note: 'Dollars, pre-discount'},
      {name: 'currency', type: 'varchar(3)', nullRate: 0, isKey: false, note: 'Defaulted to USD when missing'},
      {name: 'status', type: 'varchar', nullRate: 0.012, isKey: false, note: 'Lowercased API state'},
      {name: 'ordered_at', type: 'timestamp', nullRate: 0, isKey: false, note: 'UTC'},
    ],
    usage: {
      queries30d: 655,
      users30d: 18,
      weekly: [140, 132, 158, 149, 166, 151, 172, 160],
      topUsers: [
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 168},
        {name: 'Priya Raman', team: 'Analytics Eng', queries: 122},
        {name: 'Jordan Blake', team: 'Product Data', queries: 58},
      ],
    },
  },
  {
    id: 'ds_stg_customers',
    name: 'stg_customers',
    layer: 'dbt',
    owner: 'Analytics Eng',
    description:
      'Staging view over raw.customers with PII hashing applied to email ' +
      'and name for downstream marts.',
    tags: ['core', 'pii'],
    glossaryTerms: ['Active Customer'],
    qualityScore: 95,
    freshness: 'fresh',
    freshnessLabel: '18m ago',
    rowCount: '6.4M rows',
    columns: [
      {name: 'customer_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Renamed from id'},
      {name: 'email', type: 'varchar', nullRate: 0.008, isKey: false, note: 'SHA-256 hashed'},
      {name: 'full_name', type: 'varchar', nullRate: 0.031, isKey: false, note: 'SHA-256 hashed'},
      {name: 'country', type: 'varchar(2)', nullRate: 0.021, isKey: false, note: 'Backfilled from billing address'},
      {name: 'signed_up_at', type: 'timestamp', nullRate: 0, isKey: false, note: 'Renamed from created_at'},
    ],
    usage: {
      queries30d: 489,
      users30d: 14,
      weekly: [101, 96, 112, 108, 118, 104, 126, 115],
      topUsers: [
        {name: 'dbt Cloud (prod)', team: 'Service account', queries: 141},
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 76},
        {name: 'Priya Raman', team: 'Analytics Eng', queries: 63},
      ],
    },
  },
  {
    id: 'ds_fct_orders',
    name: 'fct_orders',
    layer: 'dbt',
    owner: 'Analytics Eng',
    description:
      'Order fact table: one row per completed order joined to payment ' +
      'fees, with net amount derived. The contract-tested spine for revenue.',
    tags: ['core', 'finance', 'verified'],
    glossaryTerms: ['Order', 'Gross Revenue'],
    qualityScore: 97,
    freshness: 'fresh',
    freshnessLabel: '18m ago',
    rowCount: '41.3M rows',
    columns: [
      {name: 'order_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Grain: one row per order'},
      {name: 'customer_id', type: 'uuid', nullRate: 0, isKey: false, note: 'Never null after staging filter'},
      {name: 'order_date', type: 'date', nullRate: 0, isKey: false, note: 'Truncated from ordered_at'},
      {name: 'gross_amount', type: 'numeric(12,2)', nullRate: 0, isKey: false, note: 'Glossary: Gross Revenue'},
      {name: 'payment_fee', type: 'numeric(12,2)', nullRate: 0.019, isKey: false, note: 'From raw.payments'},
      {name: 'net_amount', type: 'numeric(12,2)', nullRate: 0, isKey: false, note: 'gross_amount - coalesce(fee, 0)'},
      {name: 'is_repeat', type: 'boolean', nullRate: 0, isKey: false, note: 'Second-or-later order flag'},
    ],
    usage: {
      queries30d: 2210,
      users30d: 63,
      weekly: [468, 481, 512, 540, 505, 552, 588, 571],
      topUsers: [
        {name: 'Tomás Rivera', team: 'Finance BI', queries: 402},
        {name: 'Looker (system)', team: 'Service account', queries: 371},
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 218},
      ],
    },
  },
  {
    id: 'ds_dim_customers',
    name: 'dim_customers',
    layer: 'dbt',
    owner: 'Analytics Eng',
    description:
      'Customer dimension with lifetime-value bucket and last activity, ' +
      'blended from staging customers and the event stream.',
    tags: ['core', 'pii', 'verified'],
    glossaryTerms: ['Active Customer'],
    qualityScore: 96,
    freshness: 'fresh',
    freshnessLabel: '18m ago',
    rowCount: '6.4M rows',
    columns: [
      {name: 'customer_id', type: 'uuid', nullRate: 0, isKey: true, note: 'Conformed key'},
      {name: 'email', type: 'varchar', nullRate: 0.008, isKey: false, note: 'Hashed passthrough'},
      {name: 'signup_date', type: 'date', nullRate: 0, isKey: false, note: 'From signed_up_at'},
      {name: 'country', type: 'varchar(2)', nullRate: 0.021, isKey: false, note: 'Staging passthrough'},
      {name: 'ltv_bucket', type: 'varchar', nullRate: 0.047, isKey: false, note: 'Null until first order'},
      {name: 'last_seen_at', type: 'timestamp', nullRate: 0.087, isKey: false, note: 'Max occurred_at from events'},
    ],
    usage: {
      queries30d: 1130,
      users30d: 41,
      weekly: [228, 241, 259, 246, 270, 262, 288, 275],
      topUsers: [
        {name: 'Looker (system)', team: 'Service account', queries: 244},
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 187},
        {name: 'Jordan Blake', team: 'Product Data', queries: 121},
      ],
    },
  },
  {
    id: 'ds_mart_revenue',
    name: 'mart_revenue_daily',
    layer: 'dbt',
    owner: 'Analytics Eng',
    description:
      'Daily revenue rollup: gross, fees, net, order count, and new ' +
      'customers per day. The certified source for company revenue metrics.',
    tags: ['finance', 'verified', 'gold'],
    glossaryTerms: ['Gross Revenue'],
    qualityScore: 99,
    freshness: 'fresh',
    freshnessLabel: '18m ago',
    rowCount: '1,462 rows',
    columns: [
      {name: 'date', type: 'date', nullRate: 0, isKey: true, note: 'Grain: one row per day'},
      {name: 'revenue', type: 'numeric(14,2)', nullRate: 0, isKey: false, note: 'Sum of gross_amount'},
      {name: 'fees', type: 'numeric(14,2)', nullRate: 0, isKey: false, note: 'Sum of payment_fee'},
      {name: 'net_revenue', type: 'numeric(14,2)', nullRate: 0, isKey: false, note: 'revenue - fees'},
      {name: 'orders', type: 'bigint', nullRate: 0, isKey: false, note: 'Distinct order count'},
      {name: 'new_customers', type: 'bigint', nullRate: 0, isKey: false, note: 'First-order customers that day'},
    ],
    usage: {
      queries30d: 1875,
      users30d: 58,
      weekly: [391, 404, 428, 415, 447, 439, 470, 462],
      topUsers: [
        {name: 'Looker (system)', team: 'Service account', queries: 512},
        {name: 'Tomás Rivera', team: 'Finance BI', queries: 306},
        {name: 'CFO dashboard refresh', team: 'Service account', queries: 187},
      ],
    },
  },
  {
    id: 'ds_bi_rev_overview',
    name: 'Revenue Overview',
    layer: 'bi',
    owner: 'Finance BI',
    description:
      'Executive revenue dashboard: trend, month-to-date, fee percentage, ' +
      'and orders per day, all read from mart_revenue_daily.',
    tags: ['gold', 'finance'],
    glossaryTerms: ['Gross Revenue'],
    qualityScore: 94,
    freshness: 'fresh',
    freshnessLabel: '31m ago',
    rowCount: '4 tiles',
    columns: [
      {name: 'revenue_trend', type: 'measure', nullRate: 0, isKey: false, note: '90-day line tile'},
      {name: 'mtd_revenue', type: 'measure', nullRate: 0, isKey: false, note: 'Single-value tile'},
      {name: 'fees_pct', type: 'measure', nullRate: 0, isKey: false, note: 'fees / revenue'},
      {name: 'orders_per_day', type: 'measure', nullRate: 0, isKey: false, note: '30-day bar tile'},
    ],
    usage: {
      queries30d: 3320,
      users30d: 148,
      weekly: [704, 688, 741, 725, 768, 749, 802, 786],
      topUsers: [
        {name: 'Exec weekly review', team: 'Scheduled delivery', queries: 620},
        {name: 'Tomás Rivera', team: 'Finance BI', queries: 288},
        {name: 'Aisha Bello', team: 'Risk', queries: 141},
      ],
    },
  },
  {
    id: 'ds_bi_customer_360',
    name: 'Customer 360',
    layer: 'bi',
    owner: 'Growth Analytics',
    description:
      'Looker explore over dim_customers for segment drill-downs: LTV ' +
      'bucket, country, and recency filters with saved cohort looks.',
    tags: ['customer', 'pii'],
    glossaryTerms: ['Active Customer'],
    qualityScore: 90,
    freshness: 'fresh',
    freshnessLabel: '44m ago',
    rowCount: '12 looks',
    columns: [
      {name: 'customer_id', type: 'dimension', nullRate: 0, isKey: true, note: 'Drill anchor'},
      {name: 'ltv_bucket', type: 'dimension', nullRate: 0.047, isKey: false, note: 'From dim_customers'},
      {name: 'country', type: 'dimension', nullRate: 0.021, isKey: false, note: 'Map tile filter'},
      {name: 'last_seen_at', type: 'dimension', nullRate: 0.087, isKey: false, note: 'Recency filter'},
    ],
    usage: {
      queries30d: 1490,
      users30d: 86,
      weekly: [301, 315, 338, 322, 346, 334, 361, 353],
      topUsers: [
        {name: 'Mei-Ling Chao', team: 'Growth Analytics', queries: 342},
        {name: 'Lifecycle campaign sync', team: 'Scheduled delivery', queries: 240},
        {name: 'Jordan Blake', team: 'Product Data', queries: 154},
      ],
    },
  },
  {
    id: 'ds_bi_churn_risk',
    name: 'Churn Risk Explorer',
    layer: 'bi',
    owner: 'Growth Analytics',
    description:
      'Legacy churn report reading fct_orders and raw.events directly. ' +
      'Slated for migration onto the customer mart; do not build on it.',
    tags: ['customer', 'deprecated'],
    glossaryTerms: ['Churn'],
    qualityScore: 61,
    freshness: 'late',
    freshnessLabel: '2d ago',
    rowCount: '6 looks',
    columns: [
      {name: 'customer_id', type: 'dimension', nullRate: 0, isKey: true, note: 'Drill anchor'},
      {name: 'churn_score', type: 'measure', nullRate: 0.052, isKey: false, note: 'Legacy heuristic, unowned'},
      {name: 'days_inactive', type: 'measure', nullRate: 0.087, isKey: false, note: 'From raw event scan'},
      {name: 'segment', type: 'dimension', nullRate: 0.19, isKey: false, note: 'Hand-maintained CASE mapping'},
    ],
    usage: {
      queries30d: 205,
      users30d: 9,
      weekly: [61, 48, 39, 27, 22, 18, 12, 8],
      topUsers: [
        {name: 'Retention weekly email', team: 'Scheduled delivery', queries: 88},
        {name: 'Aisha Bello', team: 'Risk', queries: 41},
        {name: 'Jordan Blake', team: 'Product Data', queries: 24},
      ],
    },
  },
];

const LINEAGE_EDGES: LineageEdge[] = [
  {
    id: 'le_01',
    from: 'ds_raw_orders',
    to: 'ds_stg_orders',
    columnEdges: [
      {from: 'order_id', to: 'order_id'},
      {from: 'customer_id', to: 'customer_id'},
      {from: 'amount_cents', to: 'amount'},
      {from: 'ordered_at', to: 'ordered_at'},
    ],
  },
  {
    id: 'le_02',
    from: 'ds_raw_customers',
    to: 'ds_stg_customers',
    columnEdges: [
      {from: 'id', to: 'customer_id'},
      {from: 'email', to: 'email'},
      {from: 'created_at', to: 'signed_up_at'},
    ],
  },
  {
    id: 'le_03',
    from: 'ds_stg_orders',
    to: 'ds_fct_orders',
    columnEdges: [
      {from: 'order_id', to: 'order_id'},
      {from: 'customer_id', to: 'customer_id'},
      {from: 'amount', to: 'gross_amount'},
      {from: 'ordered_at', to: 'order_date'},
    ],
  },
  {
    id: 'le_04',
    from: 'ds_raw_payments',
    to: 'ds_fct_orders',
    columnEdges: [
      {from: 'order_id', to: 'order_id'},
      {from: 'fee_cents', to: 'payment_fee'},
    ],
  },
  {
    id: 'le_05',
    from: 'ds_stg_customers',
    to: 'ds_dim_customers',
    columnEdges: [
      {from: 'customer_id', to: 'customer_id'},
      {from: 'email', to: 'email'},
      {from: 'signed_up_at', to: 'signup_date'},
    ],
  },
  {
    id: 'le_06',
    from: 'ds_raw_events',
    to: 'ds_dim_customers',
    columnEdges: [
      {from: 'user_id', to: 'customer_id'},
      {from: 'occurred_at', to: 'last_seen_at'},
    ],
  },
  {
    id: 'le_07',
    from: 'ds_fct_orders',
    to: 'ds_mart_revenue',
    columnEdges: [
      {from: 'order_date', to: 'date'},
      {from: 'gross_amount', to: 'revenue'},
      {from: 'payment_fee', to: 'fees'},
      {from: 'net_amount', to: 'net_revenue'},
    ],
  },
  {
    id: 'le_08',
    from: 'ds_dim_customers',
    to: 'ds_mart_revenue',
    columnEdges: [{from: 'signup_date', to: 'new_customers'}],
  },
  {id: 'le_09', from: 'ds_mart_revenue', to: 'ds_bi_rev_overview', columnEdges: []},
  {id: 'le_10', from: 'ds_dim_customers', to: 'ds_bi_customer_360', columnEdges: []},
  {id: 'le_11', from: 'ds_fct_orders', to: 'ds_bi_churn_risk', columnEdges: []},
  {id: 'le_12', from: 'ds_raw_events', to: 'ds_bi_churn_risk', columnEdges: []},
];

// ============= LINEAGE GEOMETRY =============
// Three fixed columns (upstream | selected | downstream) at a fixed drawing
// width; phones scroll the canvas horizontally instead of squashing it.

const NODE_W = 176;
const NODE_H = 52;
const COL_GAP = 64;
const ROW_GAP = 12;
const CANVAS_PAD = 8;
const CANVAS_W = CANVAS_PAD * 2 + NODE_W * 3 + COL_GAP * 2;

function colX(col: 0 | 1 | 2): number {
  return CANVAS_PAD + col * (NODE_W + COL_GAP);
}

function rowY(index: number, count: number, totalRows: number): number {
  const centerOffset = ((totalRows - count) * (NODE_H + ROW_GAP)) / 2;
  return CANVAS_PAD + centerOffset + index * (NODE_H + ROW_GAP);
}

function edgePath(x1: number, y1: number, x2: number, y2: number): string {
  const midX = (x1 + x2) / 2;
  return \`M \${x1} \${y1} C \${midX} \${y1}, \${midX} \${y2}, \${x2} \${y2}\`;
}

// ============= SHARED BITS =============

/**
 * 8px layer-colored dot; StatusDot with the catalog color vocabulary. Pass
 * an empty label when adjacent text already names the layer.
 */
function LayerDot({layer, label}: {layer: Layer; label: string}) {
  return (
    <StatusDot
      variant="neutral"
      label={label}
      aria-hidden={label.length === 0 || undefined}
      style={{backgroundColor: LAYER_META[layer].dot}}
    />
  );
}

function formatNullRate(rate: number): string {
  return \`\${(rate * 100).toFixed(1)}%\`;
}

// ============= RAIL =============

function DatasetRail({
  datasets,
  visibleDatasets,
  tagCounts,
  activeTags,
  query,
  selectedId,
  onQueryChange,
  onToggleTag,
  onClearFilters,
  onSelect,
}: {
  datasets: Dataset[];
  visibleDatasets: Dataset[];
  tagCounts: Array<{tag: string; count: number}>;
  activeTags: string[];
  query: string;
  selectedId: string;
  onQueryChange: (value: string) => void;
  onToggleTag: (tag: string, isOn: boolean) => void;
  onClearFilters: () => void;
  onSelect: (id: string) => void;
}) {
  const hasActiveFilters = query.trim().length > 0 || activeTags.length > 0;
  const groups = LAYERS.map(layer => ({
    layer,
    items: visibleDatasets.filter(dataset => dataset.layer === layer),
  })).filter(group => group.items.length > 0);

  return (
    <VStack gap={0} style={styles.contentFill}>
      <VStack gap={3} style={styles.railTop}>
        <TextInput
          label="Search datasets"
          isLabelHidden
          size="sm"
          startIcon={SearchIcon}
          placeholder="Search datasets..."
          value={query}
          onChange={onQueryChange}
          hasClear
        />
        <VStack gap={2}>
          <Text type="label" color="secondary">
            Tags
          </Text>
          <HStack gap={1} style={styles.pillWrap}>
            {tagCounts.map(entry => (
              <ToggleButton
                key={entry.tag}
                label={\`\${entry.tag} (\${entry.count})\`}
                size="sm"
                isPressed={activeTags.includes(entry.tag)}
                onPressedChange={isOn => onToggleTag(entry.tag, isOn)}
              />
            ))}
          </HStack>
        </VStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {visibleDatasets.length} of {datasets.length} datasets
            </Text>
          </StackItem>
          {hasActiveFilters && (
            <Button
              label="Clear"
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
            />
          )}
        </HStack>
      </VStack>
      <Divider />
      <StackItem size="fill" style={styles.railList}>
        {groups.length === 0 ? (
          <EmptyState
            title="No datasets match"
            description="Loosen the tag filters or clear the search."
            icon={<Icon icon={SearchXIcon} size="lg" />}
            actions={
              <Button label="Clear filters" size="sm" onClick={onClearFilters} />
            }
          />
        ) : (
          groups.map(group => (
            <VStack gap={0} key={group.layer}>
              <HStack gap={2} vAlign="center" style={styles.railGroupHeader}>
                <LayerDot
                  layer={group.layer}
                  label={\`\${LAYER_META[group.layer].label} layer\`}
                />
                <Text type="label" color="secondary">
                  {LAYER_META[group.layer].label}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {group.items.length}
                </Text>
              </HStack>
              <List density="compact" hasDividers>
                {group.items.map(dataset => (
                  <ListItem
                    key={dataset.id}
                    label={dataset.name}
                    description={dataset.owner}
                    startContent={
                      <StatusDot
                        variant={FRESHNESS_META[dataset.freshness].dot}
                        label={\`\${FRESHNESS_META[dataset.freshness].label}, updated \${dataset.freshnessLabel}\`}
                        isPulsing={dataset.freshness === 'late'}
                      />
                    }
                    endContent={
                      <Text type="supporting" color="secondary">
                        {dataset.freshnessLabel}
                      </Text>
                    }
                    onClick={() => onSelect(dataset.id)}
                    isSelected={dataset.id === selectedId}
                  />
                ))}
              </List>
            </VStack>
          ))
        )}
      </StackItem>
    </VStack>
  );
}

// ============= DETAIL HEADER =============

function DatasetHeader({
  dataset,
  isEditingDescription,
  descriptionDraft,
  tagDraft,
  lastRemovedTag,
  tapTargetStyle,
  onStartEdit,
  onDraftChange,
  onSaveDescription,
  onCancelEdit,
  onTagDraftChange,
  onAddTag,
  onRemoveTag,
  onUndoRemoveTag,
}: {
  dataset: Dataset;
  isEditingDescription: boolean;
  descriptionDraft: string;
  tagDraft: string;
  lastRemovedTag: string | null;
  tapTargetStyle?: CSSProperties;
  onStartEdit: () => void;
  onDraftChange: (value: string) => void;
  onSaveDescription: () => void;
  onCancelEdit: () => void;
  onTagDraftChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onUndoRemoveTag: () => void;
}) {
  const layer = LAYER_META[dataset.layer];
  const freshness = FRESHNESS_META[dataset.freshness];

  return (
    <VStack gap={3} style={styles.detailHeader}>
      <HStack gap={2} vAlign="center" style={styles.pillWrap}>
        <Badge variant={layer.badge} label={layer.label} />
        <StatusDot
          variant={freshness.dot}
          label={\`\${freshness.label}, updated \${dataset.freshnessLabel}\`}
          isPulsing={dataset.freshness === 'late'}
        />
        <Text type="supporting" color="secondary">
          {freshness.label} · {dataset.freshnessLabel} · {dataset.rowCount}
        </Text>
      </HStack>

      <HStack gap={3} vAlign="center" style={styles.pillWrap}>
        <Heading level={2}>{dataset.name}</Heading>
        <Token label={dataset.owner} size="sm" />
        <Tooltip content={\`Quality score \${dataset.qualityScore} of 100\`}>
          <HStack gap={2} vAlign="center">
            <div style={styles.qualityBar}>
              <ProgressBar
                value={dataset.qualityScore}
                max={100}
                label={\`Quality score \${dataset.qualityScore} of 100\`}
                isLabelHidden
                variant={dataset.qualityScore >= 90 ? 'success' : 'accent'}
              />
            </div>
            <Text type="supporting" hasTabularNumbers>
              {dataset.qualityScore}
            </Text>
          </HStack>
        </Tooltip>
      </HStack>

      {isEditingDescription ? (
        <VStack gap={2}>
          <TextArea
            label="Dataset description"
            isLabelHidden
            rows={3}
            value={descriptionDraft}
            onChange={onDraftChange}
          />
          <HStack gap={2}>
            <Button
              label="Save description"
              size="sm"
              style={tapTargetStyle}
              onClick={onSaveDescription}
            />
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              style={tapTargetStyle}
              onClick={onCancelEdit}
            />
          </HStack>
        </VStack>
      ) : (
        <HStack gap={2} vAlign="start">
          <StackItem size="fill">
            <Text color="secondary">{dataset.description}</Text>
          </StackItem>
          <IconButton
            label="Edit description"
            tooltip="Edit description"
            icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onStartEdit}
          />
        </HStack>
      )}

      <HStack gap={2} vAlign="center" style={styles.tokenWrap}>
        {dataset.tags.map(tag => (
          <Token
            key={tag}
            label={tag}
            size="sm"
            onRemove={() => onRemoveTag(tag)}
          />
        ))}
        {dataset.glossaryTerms.map(term => (
          <Tooltip key={term} content={\`Glossary term: \${term}\`}>
            <Token label={term} size="sm" color="purple" />
          </Tooltip>
        ))}
        <div style={styles.addTagInput}>
          <TextInput
            label="Add tag"
            isLabelHidden
            size="sm"
            placeholder="Add tag..."
            value={tagDraft}
            onChange={onTagDraftChange}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onAddTag();
              }
            }}
          />
        </div>
        <IconButton
          label="Add tag"
          tooltip="Add tag"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="secondary"
          size="sm"
          isDisabled={tagDraft.trim().length === 0}
          onClick={onAddTag}
        />
      </HStack>

      {lastRemovedTag != null && (
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            Removed tag “{lastRemovedTag}”.
          </Text>
          <Button
            label="Undo"
            variant="ghost"
            size="sm"
            icon={<Icon icon={Undo2Icon} size="sm" />}
            onClick={onUndoRemoveTag}
          />
        </HStack>
      )}
    </VStack>
  );
}

// ============= COLUMNS TAB =============

type ColumnSort = 'schema' | 'nulls_desc' | 'nulls_asc';

const COLUMN_SORT_LABEL: Record<ColumnSort, string> = {
  schema: 'schema order',
  nulls_desc: 'null rate, high first',
  nulls_asc: 'null rate, low first',
};

const NEXT_COLUMN_SORT: Record<ColumnSort, ColumnSort> = {
  schema: 'nulls_desc',
  nulls_desc: 'nulls_asc',
  nulls_asc: 'schema',
};

interface ColumnRow extends Record<string, unknown> {
  id: string;
  column: DatasetColumn;
  isPinned: boolean;
}

function ColumnsTab({
  dataset,
  sort,
  pinnedColumns,
  isCompact,
  onCycleSort,
  onTogglePin,
}: {
  dataset: Dataset;
  sort: ColumnSort;
  pinnedColumns: string[];
  isCompact: boolean;
  onCycleSort: () => void;
  onTogglePin: (name: string) => void;
}) {
  const rows = useMemo<ColumnRow[]>(() => {
    const sorted = [...dataset.columns];
    if (sort === 'nulls_desc') {
      sorted.sort((a, b) => b.nullRate - a.nullRate);
    } else if (sort === 'nulls_asc') {
      sorted.sort((a, b) => a.nullRate - b.nullRate);
    }
    const pinned = sorted.filter(col => pinnedColumns.includes(col.name));
    const unpinned = sorted.filter(col => !pinnedColumns.includes(col.name));
    return [...pinned, ...unpinned].map(column => ({
      id: column.name,
      column,
      isPinned: pinnedColumns.includes(column.name),
    }));
  }, [dataset, sort, pinnedColumns]);

  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" style={styles.pillWrap}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {dataset.columns.length} columns · {pinnedColumns.length} pinned
          </Text>
        </StackItem>
        <Button
          label={\`Sort: \${COLUMN_SORT_LABEL[sort]}\`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={ArrowUpDownIcon} size="sm" />}
          onClick={onCycleSort}
        />
      </HStack>
      <Table
        data={rows}
        idKey="id"
        density="compact"
        hasHover
        textOverflow="truncate"
        columns={[
          {
            key: 'pin',
            header: 'Pin',
            width: pixel(56),
            renderCell: row => (
              <IconButton
                label={
                  row.isPinned
                    ? \`Unpin \${row.column.name}\`
                    : \`Pin \${row.column.name} to top\`
                }
                tooltip={row.isPinned ? 'Unpin' : 'Pin to top'}
                icon={
                  <Icon
                    icon={PinIcon}
                    size="sm"
                    color={row.isPinned ? 'accent' : 'inherit'}
                  />
                }
                variant={row.isPinned ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onTogglePin(row.column.name)}
              />
            ),
          },
          {
            key: 'name',
            header: 'Column',
            width: proportional(1.2),
            renderCell: row => (
              <VStack gap={0}>
                <HStack gap={1} vAlign="center">
                  <Text type="code" size="sm" maxLines={1}>
                    {row.column.name}
                  </Text>
                  {row.column.isKey && (
                    <Tooltip content="Key column">
                      <Icon icon={KeyRoundIcon} size="sm" color="secondary" />
                    </Tooltip>
                  )}
                </HStack>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {row.column.note}
                </Text>
              </VStack>
            ),
          },
          // <=640px the Type column is dropped so name + null rate keep
          // readable widths; the type stays reachable via the note text.
          ...(isCompact
            ? []
            : [
                {
                  key: 'type',
                  header: 'Type',
                  width: pixel(120),
                  renderCell: (row: ColumnRow) => (
                    <Text type="code" size="sm" maxLines={1}>
                      {row.column.type}
                    </Text>
                  ),
                },
              ]),
          {
            key: 'nullRate',
            header: 'Null rate',
            width: pixel(140),
            align: 'end',
            renderCell: row => (
              <HStack gap={2} vAlign="center" hAlign="end">
                <div style={styles.nullRateBar}>
                  <ProgressBar
                    value={row.column.nullRate}
                    max={1}
                    label={\`Null rate \${formatNullRate(row.column.nullRate)}\`}
                    isLabelHidden
                    variant={row.column.nullRate > 0.2 ? 'warning' : 'accent'}
                  />
                </div>
                <Text type="supporting" hasTabularNumbers>
                  {formatNullRate(row.column.nullRate)}
                </Text>
              </HStack>
            ),
          },
        ]}
      />
    </VStack>
  );
}

// ============= LINEAGE TAB =============

interface LineageNeighbor {
  dataset: Dataset;
  edge: LineageEdge;
  direction: 'upstream' | 'downstream';
}

function LineageNode({
  dataset,
  x,
  y,
  isSelected,
  onSelect,
}: {
  dataset: Dataset;
  x: number;
  y: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const layer = LAYER_META[dataset.layer];
  return (
    <button
      type="button"
      style={{
        ...styles.node,
        left: x,
        top: y,
        width: NODE_W,
        height: NODE_H,
        ...(isSelected ? styles.nodeSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={
        isSelected
          ? \`\${dataset.name}, selected dataset\`
          : \`Open \${dataset.name} in the catalog\`
      }
      onClick={() => onSelect(dataset.id)}>
      <span style={styles.nodeTitleRow}>
        <span
          style={{...styles.nodeSwatch, backgroundColor: layer.dot}}
          aria-hidden
        />
        <span style={styles.nodeName}>
          <Text type="code" size="sm" maxLines={1}>
            {dataset.name}
          </Text>
        </span>
      </span>
      <Text type="supporting" color="secondary" maxLines={1}>
        {layer.label} · quality {dataset.qualityScore}
      </Text>
    </button>
  );
}

function LineageTab({
  dataset,
  upstream,
  downstream,
  showColumnLineage,
  pairEdgeId,
  onSelect,
  onToggleColumnLineage,
  onPickPair,
}: {
  dataset: Dataset;
  upstream: LineageNeighbor[];
  downstream: LineageNeighbor[];
  showColumnLineage: boolean;
  pairEdgeId: string | null;
  onSelect: (id: string) => void;
  onToggleColumnLineage: (isOn: boolean) => void;
  onPickPair: (edgeId: string) => void;
}) {
  const totalRows = Math.max(1, upstream.length, downstream.length);
  const canvasH =
    CANVAS_PAD * 2 + totalRows * NODE_H + (totalRows - 1) * ROW_GAP;
  const selectedY = rowY(0, 1, totalRows);
  const neighbors = [...upstream, ...downstream];
  const pairEdge = neighbors.find(n => n.edge.id === pairEdgeId);

  const edgeFor = (
    neighbor: LineageNeighbor,
    index: number,
  ): {x1: number; y1: number; x2: number; y2: number} => {
    const count =
      neighbor.direction === 'upstream' ? upstream.length : downstream.length;
    const y = rowY(index, count, totalRows) + NODE_H / 2;
    if (neighbor.direction === 'upstream') {
      return {
        x1: colX(0) + NODE_W,
        y1: y,
        x2: colX(1),
        y2: selectedY + NODE_H / 2,
      };
    }
    return {
      x1: colX(1) + NODE_W,
      y1: selectedY + NODE_H / 2,
      x2: colX(2),
      y2: y,
    };
  };

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center" style={styles.pillWrap}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {upstream.length} upstream · {downstream.length} downstream ·
            direct lineage (1 hop)
          </Text>
        </StackItem>
        <Switch
          label="Column-level lineage"
          value={showColumnLineage}
          onChange={onToggleColumnLineage}
        />
      </HStack>

      {neighbors.length === 0 ? (
        <EmptyState
          title="No lineage recorded"
          description="This dataset has no registered upstream or downstream edges."
          icon={<Icon icon={WaypointsIcon} size="lg" />}
          isCompact
        />
      ) : (
        <div style={styles.canvasScroller}>
          <div style={{...styles.canvasStage, width: CANVAS_W, height: canvasH}}>
            <svg
              width={CANVAS_W}
              height={canvasH}
              viewBox={\`0 0 \${CANVAS_W} \${canvasH}\`}
              style={styles.edgeSvg}
              aria-hidden
              focusable={false}>
              {upstream.map((neighbor, index) => {
                const {x1, y1, x2, y2} = edgeFor(neighbor, index);
                const isPair =
                  showColumnLineage && neighbor.edge.id === pairEdgeId;
                if (isPair && neighbor.edge.columnEdges.length > 0) {
                  // Column-level expansion: one strand per column mapping,
                  // fanned across the node heights.
                  const strands = neighbor.edge.columnEdges.length;
                  return neighbor.edge.columnEdges.map((_, strand) => {
                    const spread = (strand - (strands - 1) / 2) * 8;
                    return (
                      <path
                        key={\`\${neighbor.edge.id}-\${strand}\`}
                        d={edgePath(x1, y1 + spread, x2, y2 + spread)}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={1.5}
                      />
                    );
                  });
                }
                return (
                  <path
                    key={neighbor.edge.id}
                    d={edgePath(x1, y1, x2, y2)}
                    fill="none"
                    stroke={
                      isPair
                        ? 'var(--color-accent)'
                        : LAYER_META[neighbor.dataset.layer].dot
                    }
                    strokeWidth={isPair ? 3 : 2}
                    opacity={isPair ? 1 : 0.6}
                  />
                );
              })}
              {downstream.map((neighbor, index) => {
                const {x1, y1, x2, y2} = edgeFor(neighbor, index);
                const isPair =
                  showColumnLineage && neighbor.edge.id === pairEdgeId;
                if (isPair && neighbor.edge.columnEdges.length > 0) {
                  const strands = neighbor.edge.columnEdges.length;
                  return neighbor.edge.columnEdges.map((_, strand) => {
                    const spread = (strand - (strands - 1) / 2) * 8;
                    return (
                      <path
                        key={\`\${neighbor.edge.id}-\${strand}\`}
                        d={edgePath(x1, y1 + spread, x2, y2 + spread)}
                        fill="none"
                        stroke="var(--color-accent)"
                        strokeWidth={1.5}
                      />
                    );
                  });
                }
                return (
                  <path
                    key={neighbor.edge.id}
                    d={edgePath(x1, y1, x2, y2)}
                    fill="none"
                    stroke={
                      isPair
                        ? 'var(--color-accent)'
                        : LAYER_META[neighbor.dataset.layer].dot
                    }
                    strokeWidth={isPair ? 3 : 2}
                    opacity={isPair ? 1 : 0.6}
                  />
                );
              })}
            </svg>

            {upstream.map((neighbor, index) => (
              <LineageNode
                key={neighbor.edge.id}
                dataset={neighbor.dataset}
                x={colX(0)}
                y={rowY(index, upstream.length, totalRows)}
                isSelected={false}
                onSelect={onSelect}
              />
            ))}
            <LineageNode
              dataset={dataset}
              x={colX(1)}
              y={selectedY}
              isSelected
              onSelect={onSelect}
            />
            {downstream.map((neighbor, index) => (
              <LineageNode
                key={neighbor.edge.id}
                dataset={neighbor.dataset}
                x={colX(2)}
                y={rowY(index, downstream.length, totalRows)}
                isSelected={false}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {showColumnLineage && neighbors.length > 0 && (
        <VStack gap={3}>
          <Divider />
          <VStack gap={2}>
            <Text type="label" color="secondary">
              Column lineage pair
            </Text>
            <HStack gap={2} style={styles.pillWrap}>
              {neighbors.map(neighbor => (
                <ToggleButton
                  key={neighbor.edge.id}
                  label={
                    neighbor.direction === 'upstream'
                      ? \`\${neighbor.dataset.name} → \${dataset.name}\`
                      : \`\${dataset.name} → \${neighbor.dataset.name}\`
                  }
                  size="sm"
                  isPressed={neighbor.edge.id === pairEdgeId}
                  onPressedChange={isOn => {
                    if (isOn) {
                      onPickPair(neighbor.edge.id);
                    }
                  }}
                />
              ))}
            </HStack>
          </VStack>

          {pairEdge == null ? (
            <Text type="supporting" color="secondary">
              Pick a pair above to expand its column-level edges.
            </Text>
          ) : pairEdge.edge.columnEdges.length === 0 ? (
            <Text type="supporting" color="secondary">
              No column-level mappings recorded for this pair — BI consumption
              edges are tracked at dataset grain only.
            </Text>
          ) : (
            <List density="compact" hasDividers>
              {pairEdge.edge.columnEdges.map(mapping => {
                const fromName =
                  pairEdge.direction === 'upstream'
                    ? pairEdge.dataset.name
                    : dataset.name;
                const toName =
                  pairEdge.direction === 'upstream'
                    ? dataset.name
                    : pairEdge.dataset.name;
                return (
                  <ListItem
                    key={\`\${mapping.from}-\${mapping.to}\`}
                    label={\`\${mapping.from} → \${mapping.to}\`}
                    description={\`\${fromName}.\${mapping.from} feeds \${toName}.\${mapping.to}\`}
                    startContent={
                      <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
                    }
                  />
                );
              })}
            </List>
          )}
        </VStack>
      )}

      {neighbors.length > 0 && (
        <Text type="supporting" color="secondary">
          Click any node to move the catalog selection to that dataset.
        </Text>
      )}
    </VStack>
  );
}

// ============= USAGE TAB =============

function UsageTab({dataset}: {dataset: Dataset}) {
  const maxWeekly = Math.max(...dataset.usage.weekly);
  const totalWeekly = dataset.usage.weekly.reduce((sum, n) => sum + n, 0);
  const trend =
    dataset.usage.weekly[dataset.usage.weekly.length - 1] >=
    dataset.usage.weekly[0]
      ? 'rising'
      : 'falling';

  return (
    <VStack gap={4}>
      <MetadataList columns="single" label={{position: 'start', width: 140}}>
        <MetadataListItem label="Queries (30d)">
          <Text hasTabularNumbers>
            {dataset.usage.queries30d.toLocaleString('en-US')}
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Distinct users (30d)">
          <Text hasTabularNumbers>{dataset.usage.users30d}</Text>
        </MetadataListItem>
        <MetadataListItem label="Owner">
          <Text>{dataset.owner}</Text>
        </MetadataListItem>
        <MetadataListItem label="Size">
          <Text>{dataset.rowCount}</Text>
        </MetadataListItem>
      </MetadataList>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Queries per week (last 8 weeks)
        </Text>
        <div
          style={styles.usageBars}
          role="img"
          aria-label={\`Weekly query counts, \${trend} over eight weeks, \${totalWeekly} total\`}>
          {dataset.usage.weekly.map((count, index) => (
            <div
              key={index}
              style={{
                ...styles.usageBar,
                height: Math.max(3, Math.round((count / maxWeekly) * 48)),
              }}
              aria-hidden
            />
          ))}
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {totalWeekly.toLocaleString('en-US')} queries over 8 weeks · trend{' '}
          {trend}
        </Text>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Top queriers (30d)
        </Text>
        <List density="compact" hasDividers>
          {dataset.usage.topUsers.map(user => (
            <ListItem
              key={user.name}
              label={user.name}
              description={user.team}
              endContent={
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {user.queries} queries
                </Text>
              }
            />
          ))}
        </List>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function DataCatalogLineageTemplate() {
  // Datasets live in state: description edits and tag add/remove persist
  // here, and the rail tag counts derive from this state so they update
  // the moment a tag changes.
  const [datasets, setDatasets] = useState<Dataset[]>(DATASETS);
  const [selectedId, setSelectedId] = useState('ds_fct_orders');
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [detailTab, setDetailTab] = useState('columns');
  const [columnSort, setColumnSort] = useState<ColumnSort>('schema');
  // Pinned columns persist per dataset across the surface.
  const [pinnedByDataset, setPinnedByDataset] = useState<
    Record<string, string[]>
  >({ds_fct_orders: ['gross_amount']});
  const [showColumnLineage, setShowColumnLineage] = useState(false);
  const [pairEdgeId, setPairEdgeId] = useState<string | null>(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [tagDraft, setTagDraft] = useState('');
  const [lastRemovedTag, setLastRemovedTag] = useState<string | null>(null);
  const [isRailOpen, setIsRailOpen] = useState(false);

  // Responsive contract: the rail collapses behind a header toggle <=1024px;
  // <=640px the header caption drops and buttons grow to ~40px tap targets.
  const isRailCollapsed = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isCompact ? styles.buttonTapTarget : undefined;

  const datasetById = useMemo(
    () => new Map(datasets.map(dataset => [dataset.id, dataset])),
    [datasets],
  );
  const selected = datasetById.get(selectedId) ?? datasets[0];

  // Tag vocabulary + counts derive from live dataset state, so adding or
  // removing a tag in the detail header immediately moves the rail counts.
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const dataset of datasets) {
      for (const tag of dataset.tags) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([tag, count]) => ({tag, count}))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [datasets]);

  // Search and tag filters combine (AND) to narrow the rail list.
  const visibleDatasets = useMemo(() => {
    const lowered = query.trim().toLowerCase();
    return datasets.filter(dataset => {
      if (activeTags.some(tag => !dataset.tags.includes(tag))) {
        return false;
      }
      if (lowered.length === 0) {
        return true;
      }
      return (
        dataset.name.toLowerCase().includes(lowered) ||
        dataset.owner.toLowerCase().includes(lowered) ||
        dataset.tags.some(tag => tag.includes(lowered)) ||
        dataset.glossaryTerms.some(term =>
          term.toLowerCase().includes(lowered),
        ) ||
        dataset.columns.some(column =>
          column.name.toLowerCase().includes(lowered),
        )
      );
    });
  }, [datasets, query, activeTags]);

  const upstream = useMemo<LineageNeighbor[]>(
    () =>
      LINEAGE_EDGES.filter(edge => edge.to === selected.id).flatMap(edge => {
        const dataset = datasetById.get(edge.from);
        return dataset != null
          ? [{dataset, edge, direction: 'upstream' as const}]
          : [];
      }),
    [selected.id, datasetById],
  );
  const downstream = useMemo<LineageNeighbor[]>(
    () =>
      LINEAGE_EDGES.filter(edge => edge.from === selected.id).flatMap(edge => {
        const dataset = datasetById.get(edge.to);
        return dataset != null
          ? [{dataset, edge, direction: 'downstream' as const}]
          : [];
      }),
    [selected.id, datasetById],
  );

  const selectDataset = (id: string) => {
    if (id === selectedId) {
      return;
    }
    setSelectedId(id);
    setPairEdgeId(null);
    setIsEditingDescription(false);
    setTagDraft('');
    setLastRemovedTag(null);
  };

  const toggleColumnLineage = (isOn: boolean) => {
    setShowColumnLineage(isOn);
    if (isOn && pairEdgeId == null) {
      // Default the pair to the first neighbor that has column mappings.
      const neighbors = [...upstream, ...downstream];
      const withMappings = neighbors.find(n => n.edge.columnEdges.length > 0);
      setPairEdgeId((withMappings ?? neighbors[0])?.edge.id ?? null);
    }
  };

  const saveDescription = () => {
    const next = descriptionDraft.trim();
    if (next.length > 0) {
      setDatasets(prev =>
        prev.map(dataset =>
          dataset.id === selected.id
            ? {...dataset, description: next}
            : dataset,
        ),
      );
    }
    setIsEditingDescription(false);
  };

  const addTag = () => {
    const tag = tagDraft.trim().toLowerCase();
    if (tag.length === 0 || selected.tags.includes(tag)) {
      setTagDraft('');
      return;
    }
    setDatasets(prev =>
      prev.map(dataset =>
        dataset.id === selected.id
          ? {...dataset, tags: [...dataset.tags, tag]}
          : dataset,
      ),
    );
    setTagDraft('');
  };

  const removeTag = (tag: string) => {
    setDatasets(prev =>
      prev.map(dataset =>
        dataset.id === selected.id
          ? {...dataset, tags: dataset.tags.filter(t => t !== tag)}
          : dataset,
      ),
    );
    setLastRemovedTag(tag);
  };

  const undoRemoveTag = () => {
    if (lastRemovedTag == null) {
      return;
    }
    const tag = lastRemovedTag;
    setDatasets(prev =>
      prev.map(dataset =>
        dataset.id === selected.id && !dataset.tags.includes(tag)
          ? {...dataset, tags: [...dataset.tags, tag]}
          : dataset,
      ),
    );
    setLastRemovedTag(null);
  };

  const togglePin = (columnName: string) => {
    setPinnedByDataset(prev => {
      const current = prev[selected.id] ?? [];
      return {
        ...prev,
        [selected.id]: current.includes(columnName)
          ? current.filter(name => name !== columnName)
          : [...current, columnName],
      };
    });
  };

  const rail = (
    <DatasetRail
      datasets={datasets}
      visibleDatasets={visibleDatasets}
      tagCounts={tagCounts}
      activeTags={activeTags}
      query={query}
      selectedId={selected.id}
      onQueryChange={setQuery}
      onToggleTag={(tag, isOn) =>
        setActiveTags(prev =>
          isOn ? [...prev, tag] : prev.filter(t => t !== tag),
        )
      }
      onClearFilters={() => {
        setQuery('');
        setActiveTags([]);
      }}
      onSelect={selectDataset}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            {isRailCollapsed && (
              <IconButton
                label={isRailOpen ? 'Hide catalog rail' : 'Show catalog rail'}
                tooltip={isRailOpen ? 'Hide catalog rail' : 'Show catalog rail'}
                icon={<Icon icon={FilterIcon} size="sm" color="inherit" />}
                variant={isRailOpen ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setIsRailOpen(prev => !prev)}
              />
            )}
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Data catalog</Heading>
                {/* <=640px: the caption cedes its width to the title row. */}
                {!isCompact && (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {datasets.length} datasets · {LINEAGE_EDGES.length} lineage
                    edges
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Badge
              variant={selected.qualityScore >= 90 ? 'success' : 'warning'}
              label={\`quality \${selected.qualityScore}\`}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isRailCollapsed && !isRailOpen ? undefined : (
          <LayoutPanel width={320} padding={0} label="Dataset catalog">
            {rail}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <VStack gap={0} style={styles.contentFill}>
            <StackItem size="fill" style={styles.detailScroll}>
              <DatasetHeader
                dataset={selected}
                isEditingDescription={isEditingDescription}
                descriptionDraft={descriptionDraft}
                tagDraft={tagDraft}
                lastRemovedTag={lastRemovedTag}
                tapTargetStyle={tapTargetStyle}
                onStartEdit={() => {
                  setDescriptionDraft(selected.description);
                  setIsEditingDescription(true);
                }}
                onDraftChange={setDescriptionDraft}
                onSaveDescription={saveDescription}
                onCancelEdit={() => setIsEditingDescription(false)}
                onTagDraftChange={setTagDraft}
                onAddTag={addTag}
                onRemoveTag={removeTag}
                onUndoRemoveTag={undoRemoveTag}
              />
              <div style={styles.detailTabs}>
                <TabList
                  value={detailTab}
                  onChange={setDetailTab}
                  size="sm"
                  hasDivider>
                  <Tab
                    value="columns"
                    label="Columns"
                    endContent={
                      <Badge
                        variant="neutral"
                        label={String(selected.columns.length)}
                      />
                    }
                  />
                  <Tab
                    value="lineage"
                    label="Lineage"
                    endContent={
                      <Badge
                        variant="neutral"
                        label={String(upstream.length + downstream.length)}
                      />
                    }
                  />
                  <Tab value="usage" label="Usage" />
                </TabList>
              </div>
              <div style={styles.detailBody}>
                {detailTab === 'columns' && (
                  <ColumnsTab
                    dataset={selected}
                    sort={columnSort}
                    pinnedColumns={pinnedByDataset[selected.id] ?? []}
                    isCompact={isCompact}
                    onCycleSort={() =>
                      setColumnSort(prev => NEXT_COLUMN_SORT[prev])
                    }
                    onTogglePin={togglePin}
                  />
                )}
                {detailTab === 'lineage' && (
                  <LineageTab
                    dataset={selected}
                    upstream={upstream}
                    downstream={downstream}
                    showColumnLineage={showColumnLineage}
                    pairEdgeId={pairEdgeId}
                    onSelect={selectDataset}
                    onToggleColumnLineage={toggleColumnLineage}
                    onPickPair={setPairEdgeId}
                  />
                )}
                {detailTab === 'usage' && <UsageTab dataset={selected} />}
              </div>
            </StackItem>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};