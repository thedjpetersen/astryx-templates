// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 24h slow-query sample from a
 *   Postgres-style shop database: 6 queries with SQL text, fixed total
 *   cost / p95 latency / call counts, and full EXPLAIN plan trees; the two
 *   most expensive queries carry pre-built optimized-plan variants plus the
 *   candidate index that produces them; the other four list the indexes
 *   their plans already use)
 * @output Query performance PROFILER: a header with database icon + Heading,
 *   sample meta, a live Σ-plan-cost readout and an "N of 6 optimized"
 *   cluster; a 320px query-list rail ranked by total cost with mono
 *   cost / p95 / calls columns, a sort Selector, rank numbers, and delta
 *   badges on optimized rows; a detail region with the SQL text block, a
 *   stacked cost-breakdown bar whose segments highlight in sync with the
 *   plan tree, a collapsible EXPLAIN tree where every node carries an
 *   operator Badge (Seq Scan / Hash Join / Sort…), a row estimate, a mono
 *   cost, and a CSS cost bar; a compare toggle that renders original and
 *   optimized trees side by side with removed / added / cost-changed nodes
 *   highlighted; and a 300px index-suggestion panel whose Apply button swaps
 *   in the fixture optimized plan with a before/after total-cost delta badge
 *   (and a Revert undo) — re-ranking the query list live
 * @position Page template; emitted by `astryx template query-plan-profiler`
 *
 * Frame: Layout height="fill". LayoutHeader carries the profiler chrome
 * (title, database meta, Σ cost readout, optimized counter). LayoutPanel
 * start 320 hosts the ranked query list: a pinned rail header with the sort
 * Selector, then the scrolling rows. LayoutContent (padding 4) stacks the
 * query title row, the SQL block, the plan toolbar (Expand/Collapse all +
 * Compare Switch), and either the cost-breakdown bar + single tree or the
 * side-by-side compare grid. LayoutPanel end 300 is the index-suggestion
 * panel. Choose over table-tree when rows are PLAN OPERATORS with costs and
 * row estimates, not files; over test-runner-console when the subject is
 * query cost, not test verdicts.
 *
 * Interaction contract:
 * - Selecting a query in the rail (or the <=640px Selector) drives the SQL
 *   block, cost bar, plan tree, and suggestion panel; collapse state,
 *   highlight, and compare reset per query while applied optimizations
 *   persist across the surface.
 * - Plan nodes expand/collapse via their row button (aria-expanded); Expand
 *   all / Collapse all rewrite the collapsed-id set for every visible tree.
 * - Hovering, focusing, or tapping a node highlights its segment in the
 *   stacked cost-breakdown bar (self-cost share) and paints a caption with
 *   the exact share — hover is never the only path in.
 * - Applying a candidate index swaps in the fixture optimized plan, shows a
 *   before → after total-cost delta badge, re-sorts the query list if the
 *   ranking changed, and can be undone with Revert. Both are announced via
 *   an aria-live region.
 * - The Compare switch (shown only on queries with an optimized fixture)
 *   renders original and optimized trees side by side; nodes are diffed by
 *   id and tinted removed / added / cost-changed with a legend.
 * - The rail sort Selector re-ranks by total cost, p95, or calls; ranks and
 *   the header Σ cost recompute live from applied optimizations.
 *
 * Responsive contract:
 * - >1024px: header | rail 320 (fixed, scrolls) | detail (fill) | suggestion
 *   panel 300. Only the SQL block and compare grid own overflow-x.
 * - <=1024px: the suggestion panel leaves the end slot and renders as an
 *   inline section below the plan tree, so Apply/Revert stay reachable in a
 *   single pane. The compare grid stacks to one column.
 * - <=640px: the query rail leaves the start slot; a single-pane fallback
 *   Selector above the SQL block (cost readouts in the option labels) keeps
 *   query switching alive. The header meta hides and the Σ cluster wraps to
 *   a second row; plan rows, rail rows, and toolbar buttons grow to >=40px
 *   tap targets; the per-node cost bar hides so operator + cost fit 375px.
 * - Nothing is hover-only: segment highlights mirror node focus/tap, badges
 *   and costs are painted inline, and Tooltips only restate visible text.
 *
 * Container policy (profiler archetype): dense tool chrome — frame-first
 * rows and panels, bordered divs for the SQL block, cost bar, tree panels,
 * and suggestion rows; no Cards. All derived numbers (Σ cost, ranks, delta
 * badges, optimized counter) recompute from applied-suggestion state.
 * Fixture policy: fixed data only — no clocks, randomness, or network
 * assets; "applying" an index swaps to a pre-built plan fixture.
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronRightIcon,
  DatabaseIcon,
  GaugeIcon,
  ListTreeIcon,
  RotateCcwIcon,
  SigmaIcon,
  SparklesIcon,
  TableIcon,
  ZapIcon,
} from 'lucide-react';

// ============= STYLES =============

// Monospace metrics come from the same tokens Code/CodeBlock use, so SQL,
// costs, row estimates, and DDL read as one surface.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  headerRow: {width: '100%'},
  // Query rail: pinned sort header, scrolling ranked rows below.
  railFrame: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  // Rail rows are real buttons with >=40px tap targets; the active row
  // wears the accent-muted surface so selection never depends on hover.
  railRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-control)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
  },
  railRowActive: {backgroundColor: 'var(--color-accent-muted)'},
  railRank: {
    ...mono,
    width: 20,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  railMetrics: {
    ...mono,
    display: 'flex',
    gap: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
    paddingLeft: 28,
  },
  railName: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // SQL block: bordered mono panel, wraps long clauses, scrolls if needed.
  sqlBlock: {
    ...mono,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    overflowX: 'auto',
  },
  // Stacked cost-breakdown bar: one segment per plan node, width = the
  // node's SELF cost share of the plan total. Non-highlighted segments dim
  // while a node is hovered/focused/tapped.
  costBar: {
    display: 'flex',
    width: '100%',
    height: 14,
    borderRadius: 'var(--radius-control)',
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  costSegment: {
    height: '100%',
    minWidth: 2,
    transition: 'opacity 120ms ease',
  },
  costSegmentDimmed: {opacity: 0.25},
  // Plan tree panel: bordered container, not a Card — dense tool chrome.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  panelHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Node rows are single buttons: click toggles (and pins the highlight),
  // hover/focus mirror into the stacked bar. >=40px tall at <=640px.
  nodeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 36,
    padding: '0 var(--spacing-3)',
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
  },
  nodeRowCompact: {minHeight: 44},
  nodeRowHighlighted: {backgroundColor: 'var(--color-accent-muted)'},
  // Compare-mode diff tints, keyed off the id-based node diff.
  nodeRowRemoved: {backgroundColor: 'var(--color-error-muted)'},
  nodeRowAdded: {backgroundColor: 'var(--color-success-muted)'},
  nodeRowChanged: {backgroundColor: 'var(--color-warning-muted)'},
  // Chevron rotates 0deg → 90deg on expand; leaf rows reserve the same
  // footprint so operator badges align down the tree.
  chevron: {
    display: 'inline-flex',
    flexShrink: 0,
    transition: 'transform 120ms ease',
    transform: 'rotate(0deg)',
  },
  chevronOpen: {transform: 'rotate(90deg)'},
  chevronSlot: {
    width: 20,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeTarget: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  nodeMetric: {
    ...mono,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
    textAlign: 'right',
  },
  nodeRows: {minWidth: 88},
  nodeCost: {minWidth: 64},
  // Per-node inclusive-cost bar: fixed 72px track, fill = cost / plan total.
  nodeTrack: {
    width: 72,
    height: 4,
    borderRadius: 2,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  nodeFill: {height: '100%', display: 'block'},
  // Compare grid: two tree panels side by side; one column <=1024px.
  compareGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-3)',
    alignItems: 'start',
  },
  compareGridStacked: {gridTemplateColumns: '1fr'},
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
    display: 'inline-block',
  },
  // Suggestion rows: bordered stacks inside the panel / inline section.
  suggestionRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  detailScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  buttonTapTarget: {height: 40},
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

/** Per-level indent for plan-tree rows, in pixels. */
const INDENT_PER_LEVEL = 18;

// ============= DATA =============
// Deterministic fixtures: fixed costs, row estimates, p95s, and call
// counts. The two most expensive queries carry pre-built optimized plans;
// "applying" the candidate index swaps to that fixture — no simulation.

const DB_META = {
  database: 'shop-prod',
  engine: 'PostgreSQL 16.3',
  window: '24h sample',
};

interface PlanNode {
  id: string;
  /** Postgres operator name — drives the badge variant and bar color. */
  operator: string;
  /** Relation / index clause, e.g. "on orders" or "using idx_…". */
  target?: string;
  detail?: string;
  /** Inclusive cost of this subtree (root cost = plan total). */
  cost: number;
  /** Exclusive cost — the node's own segment in the stacked bar. */
  selfCost: number;
  /** Planner row estimate. */
  rows: number;
  children?: PlanNode[];
}

interface IndexSuggestion {
  id: string;
  table: string;
  ddl: string;
  impact: 'high' | 'medium';
  note: string;
}

interface QueryFixture {
  id: string;
  name: string;
  sql: string;
  p95Ms: number;
  calls: number;
  plan: PlanNode;
  /** Pre-built optimized variant, unlocked by applying `suggestion`. */
  optimized?: {plan: PlanNode; p95Ms: number};
  suggestion?: IndexSuggestion;
  /** For queries with no candidates: what the plan already leans on. */
  indexesInUse: string[];
}

const QUERIES: QueryFixture[] = [
  {
    id: 'q-email',
    name: 'Order lookup by email',
    sql:
      'SELECT o.id, o.status, o.total_cents\n' +
      'FROM orders o\n' +
      "WHERE o.customer_email = $1\n" +
      'ORDER BY o.created_at DESC\n' +
      'LIMIT 20;',
    p95Ms: 840,
    calls: 12400,
    plan: {
      id: 'em-limit',
      operator: 'Limit',
      cost: 48200,
      selfCost: 10,
      rows: 20,
      children: [
        {
          id: 'em-sort',
          operator: 'Sort',
          detail: 'Sort Key: o.created_at DESC',
          cost: 48190,
          selfCost: 3900,
          rows: 18432,
          children: [
            {
              id: 'em-seq',
              operator: 'Seq Scan',
              target: 'on orders o',
              detail: 'Filter: customer_email = $1',
              cost: 44290,
              selfCost: 44290,
              rows: 18432,
            },
          ],
        },
      ],
    },
    optimized: {
      p95Ms: 22,
      plan: {
        id: 'em-limit',
        operator: 'Limit',
        cost: 3900,
        selfCost: 8,
        rows: 20,
        children: [
          {
            id: 'em-idx',
            operator: 'Index Scan',
            target: 'using idx_orders_email_created on orders o',
            detail: 'Index Cond: customer_email = $1',
            cost: 3892,
            selfCost: 3892,
            rows: 20,
          },
        ],
      },
    },
    suggestion: {
      id: 'sug-email',
      table: 'orders',
      ddl: 'CREATE INDEX idx_orders_email_created ON orders (customer_email, created_at DESC);',
      impact: 'high',
      note: 'Replaces the Seq Scan + Sort with a single ordered Index Scan — the LIMIT stops after 20 index entries.',
    },
    indexesInUse: [],
  },
  {
    id: 'q-revenue',
    name: 'Daily revenue rollup',
    sql:
      "SELECT date_trunc('day', oi.created_at) AS day,\n" +
      '       sum(oi.quantity * oi.unit_price_cents) AS revenue\n' +
      'FROM order_items oi\n' +
      'JOIN orders o ON o.id = oi.order_id\n' +
      "WHERE o.status = 'paid'\n" +
      "  AND oi.created_at >= now() - interval '90 days'\n" +
      'GROUP BY 1 ORDER BY 1;',
    p95Ms: 1920,
    calls: 96,
    plan: {
      id: 'rv-agg',
      operator: 'GroupAggregate',
      detail: 'Group Key: day',
      cost: 31450,
      selfCost: 2150,
      rows: 90,
      children: [
        {
          id: 'rv-sort',
          operator: 'Sort',
          detail: 'Sort Key: day',
          cost: 29300,
          selfCost: 8400,
          rows: 412000,
          children: [
            {
              id: 'rv-hj',
              operator: 'Hash Join',
              detail: 'Hash Cond: oi.order_id = o.id',
              cost: 20900,
              selfCost: 2600,
              rows: 412000,
              children: [
                {
                  id: 'rv-seq-oi',
                  operator: 'Seq Scan',
                  target: 'on order_items oi',
                  detail: 'Filter: created_at >= …',
                  cost: 16100,
                  selfCost: 16100,
                  rows: 412000,
                },
                {
                  id: 'rv-hash',
                  operator: 'Hash',
                  cost: 2200,
                  selfCost: 400,
                  rows: 48210,
                  children: [
                    {
                      id: 'rv-seq-o',
                      operator: 'Seq Scan',
                      target: 'on orders o',
                      detail: "Filter: status = 'paid'",
                      cost: 1800,
                      selfCost: 1800,
                      rows: 48210,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    optimized: {
      p95Ms: 310,
      plan: {
        id: 'rv-agg',
        operator: 'GroupAggregate',
        detail: 'Group Key: day (pre-sorted by index)',
        cost: 8600,
        selfCost: 1900,
        rows: 90,
        children: [
          {
            id: 'rv-nl',
            operator: 'Nested Loop',
            cost: 6700,
            selfCost: 800,
            rows: 412000,
            children: [
              {
                id: 'rv-ios',
                operator: 'Index Only Scan',
                target: 'using idx_items_created_qty on order_items oi',
                detail: 'Index Cond: created_at >= …',
                cost: 4100,
                selfCost: 4100,
                rows: 412000,
              },
              {
                id: 'rv-pk',
                operator: 'Index Scan',
                target: 'using orders_pkey on orders o',
                detail: "Filter: status = 'paid'",
                cost: 1800,
                selfCost: 1800,
                rows: 1,
              },
            ],
          },
        ],
      },
    },
    suggestion: {
      id: 'sug-revenue',
      table: 'order_items',
      ddl: 'CREATE INDEX idx_items_created_qty ON order_items (created_at) INCLUDE (order_id, quantity, unit_price_cents);',
      impact: 'high',
      note: 'Covering index feeds the rollup pre-sorted — the explicit Sort and both Seq Scans drop out of the plan.',
    },
    indexesInUse: [],
  },
  {
    id: 'q-inventory',
    name: 'Low-stock inventory join',
    sql:
      'SELECT p.sku, p.name, i.quantity\n' +
      'FROM inventory i\n' +
      'JOIN products p ON p.id = i.product_id\n' +
      'WHERE i.quantity < i.reorder_point;',
    p95Ms: 460,
    calls: 2150,
    plan: {
      id: 'inv-hj',
      operator: 'Hash Join',
      detail: 'Hash Cond: i.product_id = p.id',
      cost: 18900,
      selfCost: 2400,
      rows: 1840,
      children: [
        {
          id: 'inv-seq-i',
          operator: 'Seq Scan',
          target: 'on inventory i',
          detail: 'Filter: quantity < reorder_point',
          cost: 9800,
          selfCost: 9800,
          rows: 152000,
        },
        {
          id: 'inv-hash',
          operator: 'Hash',
          cost: 6700,
          selfCost: 900,
          rows: 68000,
          children: [
            {
              id: 'inv-seq-p',
              operator: 'Seq Scan',
              target: 'on products p',
              cost: 5800,
              selfCost: 5800,
              rows: 68000,
            },
          ],
        },
      ],
    },
    indexesInUse: ['products_pkey', 'inventory_product_id_key'],
  },
  {
    id: 'q-carts',
    name: 'Abandoned cart sweep',
    sql:
      'SELECT c.user_id, count(*)\n' +
      'FROM carts c\n' +
      "WHERE c.status = 'open'\n" +
      "  AND c.updated_at < now() - interval '7 days'\n" +
      'GROUP BY c.user_id;',
    p95Ms: 380,
    calls: 288,
    plan: {
      id: 'ct-agg',
      operator: 'HashAggregate',
      detail: 'Group Key: c.user_id',
      cost: 12300,
      selfCost: 1400,
      rows: 3200,
      children: [
        {
          id: 'ct-seq',
          operator: 'Seq Scan',
          target: 'on carts c',
          detail: "Filter: status = 'open' AND updated_at < …",
          cost: 10900,
          selfCost: 10900,
          rows: 84000,
        },
      ],
    },
    indexesInUse: ['carts_pkey'],
  },
  {
    id: 'q-sessions',
    name: 'Active session count',
    sql: 'SELECT count(*)\nFROM sessions s\nWHERE s.expires_at > now();',
    p95Ms: 95,
    calls: 41000,
    plan: {
      id: 'ss-agg',
      operator: 'Aggregate',
      cost: 6100,
      selfCost: 300,
      rows: 1,
      children: [
        {
          id: 'ss-idx',
          operator: 'Index Only Scan',
          target: 'using idx_sessions_expires on sessions s',
          detail: 'Index Cond: expires_at > now()',
          cost: 5800,
          selfCost: 5800,
          rows: 21400,
        },
      ],
    },
    indexesInUse: ['idx_sessions_expires'],
  },
  {
    id: 'q-coupon',
    name: 'Coupon validation',
    sql:
      'SELECT c.code, r.redeemed_at\n' +
      'FROM coupons c\n' +
      'JOIN redemptions r ON r.coupon_id = c.id\n' +
      'WHERE c.code = $1;',
    p95Ms: 18,
    calls: 88000,
    plan: {
      id: 'cp-nl',
      operator: 'Nested Loop',
      cost: 2400,
      selfCost: 200,
      rows: 12,
      children: [
        {
          id: 'cp-idx-c',
          operator: 'Index Scan',
          target: 'using coupons_code_key on coupons c',
          detail: 'Index Cond: code = $1',
          cost: 900,
          selfCost: 900,
          rows: 1,
        },
        {
          id: 'cp-idx-r',
          operator: 'Index Scan',
          target: 'using idx_redemptions_coupon on redemptions r',
          detail: 'Index Cond: coupon_id = c.id',
          cost: 1300,
          selfCost: 1300,
          rows: 12,
        },
      ],
    },
    indexesInUse: ['coupons_code_key', 'idx_redemptions_coupon'],
  },
];

const INITIAL_QUERY_ID = 'q-email';

type SortKey = 'cost' | 'p95' | 'calls';

const SORT_OPTIONS: {value: SortKey; label: string}[] = [
  {value: 'cost', label: 'Sort by total cost'},
  {value: 'p95', label: 'Sort by p95 latency'},
  {value: 'calls', label: 'Sort by call count'},
];

// ============= HELPERS =============

const formatCost = (n: number) => n.toLocaleString('en-US');

const formatMs = (ms: number) =>
  ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;

const formatCalls = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

type OperatorCategory = 'seqscan' | 'indexscan' | 'join' | 'sortagg' | 'other';

function operatorCategory(operator: string): OperatorCategory {
  if (operator === 'Seq Scan') return 'seqscan';
  if (operator.includes('Index')) return 'indexscan';
  if (operator.includes('Join') || operator === 'Nested Loop') return 'join';
  if (operator === 'Sort' || operator.includes('Aggregate')) return 'sortagg';
  return 'other';
}

/** Segment / cost-bar color per operator family. */
const CATEGORY_COLOR: Record<OperatorCategory, string> = {
  seqscan: 'var(--color-error)',
  indexscan: 'var(--color-success)',
  join: 'var(--color-accent)',
  sortagg: 'var(--color-warning)',
  other: 'var(--color-text-secondary)',
};

/** Operator badge variant: full scans read as the problem, indexes as the fix. */
const CATEGORY_BADGE: Record<
  OperatorCategory,
  'error' | 'success' | 'info' | 'warning' | 'neutral'
> = {
  seqscan: 'error',
  indexscan: 'success',
  join: 'info',
  sortagg: 'warning',
  other: 'neutral',
};

interface FlatNode {
  node: PlanNode;
  depth: number;
}

/** Depth-first flatten of the whole tree (for the stacked cost bar). */
function flattenAll(node: PlanNode, depth = 0, into: FlatNode[] = []): FlatNode[] {
  into.push({node, depth});
  for (const child of node.children ?? []) {
    flattenAll(child, depth + 1, into);
  }
  return into;
}

/**
 * Flattens against the collapsed-id set (default = fully expanded), so
 * collapsing a node removes exactly its subtree from the visible rows.
 */
function flattenVisible(
  node: PlanNode,
  collapsedIds: ReadonlySet<string>,
  paneKey: string,
  depth = 0,
  into: FlatNode[] = [],
): FlatNode[] {
  into.push({node, depth});
  if (!collapsedIds.has(`${paneKey}:${node.id}`)) {
    for (const child of node.children ?? []) {
      flattenVisible(child, collapsedIds, paneKey, depth + 1, into);
    }
  }
  return into;
}

/** Every internal node id in a tree — the "Collapse all" set for a pane. */
function collectInternalIds(node: PlanNode, into: string[] = []): string[] {
  if (node.children !== undefined && node.children.length > 0) {
    into.push(node.id);
    for (const child of node.children) {
      collectInternalIds(child, into);
    }
  }
  return into;
}

type ChangeKind = 'removed' | 'added' | 'changed';

/**
 * Diffs original vs optimized trees by node id: ids only in the original
 * are removed, ids only in the optimized are added, shared ids with a
 * different inclusive cost are changed.
 */
function diffPlans(
  original: PlanNode,
  optimized: PlanNode,
): Map<string, ChangeKind> {
  const originalCosts = new Map<string, number>();
  for (const {node} of flattenAll(original)) {
    originalCosts.set(node.id, node.cost);
  }
  const optimizedCosts = new Map<string, number>();
  for (const {node} of flattenAll(optimized)) {
    optimizedCosts.set(node.id, node.cost);
  }
  const changes = new Map<string, ChangeKind>();
  for (const [id, cost] of originalCosts) {
    if (!optimizedCosts.has(id)) {
      changes.set(id, 'removed');
    } else if (optimizedCosts.get(id) !== cost) {
      changes.set(id, 'changed');
    }
  }
  for (const id of optimizedCosts.keys()) {
    if (!originalCosts.has(id)) {
      changes.set(id, 'added');
    }
  }
  return changes;
}

/** Percent saved by the optimized plan, for the delta badges. */
function costDeltaPercent(before: number, after: number): number {
  return Math.round((1 - after / before) * 100);
}

// ============= PLAN TREE =============

function PlanNodeRow({
  node,
  depth,
  paneKey,
  planTotal,
  isCollapsed,
  isHighlighted,
  changeKind,
  isCompact,
  onToggle,
  onHighlight,
}: {
  node: PlanNode;
  depth: number;
  paneKey: string;
  planTotal: number;
  isCollapsed: boolean;
  isHighlighted: boolean;
  changeKind?: ChangeKind;
  isCompact: boolean;
  onToggle: (paneKey: string, id: string) => void;
  onHighlight: (id: string | null) => void;
}) {
  const category = operatorCategory(node.operator);
  const hasChildren = node.children !== undefined && node.children.length > 0;
  const share = Math.round((node.cost / planTotal) * 100);
  const changeStyle =
    changeKind === 'removed'
      ? styles.nodeRowRemoved
      : changeKind === 'added'
        ? styles.nodeRowAdded
        : changeKind === 'changed'
          ? styles.nodeRowChanged
          : undefined;
  const changeWord =
    changeKind === 'removed'
      ? ', removed in optimized plan'
      : changeKind === 'added'
        ? ', new in optimized plan'
        : changeKind === 'changed'
          ? ', cost changed'
          : '';
  return (
    <button
      type="button"
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      aria-label={
        `${node.operator}${node.target !== undefined ? ` ${node.target}` : ''}: ` +
        `cost ${formatCost(node.cost)} (${share}% of plan), ` +
        `~${formatCost(node.rows)} rows${changeWord}`
      }
      onClick={() => {
        // Tap = pin the highlight (the touch path into the stacked bar);
        // internal nodes also toggle their subtree.
        onHighlight(node.id);
        if (hasChildren) {
          onToggle(paneKey, node.id);
        }
      }}
      onMouseEnter={() => onHighlight(node.id)}
      onMouseLeave={() => onHighlight(null)}
      onFocus={() => onHighlight(node.id)}
      onBlur={() => onHighlight(null)}
      style={{
        ...styles.nodeRow,
        ...(isCompact ? styles.nodeRowCompact : undefined),
        ...changeStyle,
        ...(isHighlighted ? styles.nodeRowHighlighted : undefined),
      }}>
      {/* Depth indent — every level shares one row grid. */}
      <span style={{width: depth * INDENT_PER_LEVEL, flexShrink: 0}} />
      <span style={styles.chevronSlot} aria-hidden="true">
        {hasChildren ? (
          <span
            style={{
              ...styles.chevron,
              ...(isCollapsed ? undefined : styles.chevronOpen),
            }}>
            <Icon icon={ChevronRightIcon} size="sm" color="secondary" />
          </span>
        ) : null}
      </span>
      <Badge variant={CATEGORY_BADGE[category]} label={node.operator} />
      <span style={styles.nodeTarget}>
        <Text type="body" maxLines={1}>
          {node.target ?? node.detail ?? ''}
        </Text>
      </span>
      <span style={{...styles.nodeMetric, ...styles.nodeRows}}>
        ~{formatCost(node.rows)} rows
      </span>
      {!isCompact && (
        <span style={styles.nodeTrack} aria-hidden="true">
          <span
            style={{
              ...styles.nodeFill,
              width: `${Math.max(2, share)}%`,
              backgroundColor: CATEGORY_COLOR[category],
            }}
          />
        </span>
      )}
      <span style={{...styles.nodeMetric, ...styles.nodeCost}}>
        {formatCost(node.cost)}
      </span>
    </button>
  );
}

function PlanTree({
  root,
  paneKey,
  title,
  titleBadge,
  collapsedIds,
  highlightId,
  changeMap,
  isCompact,
  onToggle,
  onHighlight,
}: {
  root: PlanNode;
  paneKey: string;
  title: string;
  titleBadge?: React.ReactNode;
  collapsedIds: ReadonlySet<string>;
  highlightId: string | null;
  changeMap?: Map<string, ChangeKind>;
  isCompact: boolean;
  onToggle: (paneKey: string, id: string) => void;
  onHighlight: (id: string | null) => void;
}) {
  const visible = flattenVisible(root, collapsedIds, paneKey);
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={ListTreeIcon} size="sm" color="secondary" />
          <Text type="label">{title}</Text>
          {titleBadge}
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            total cost {formatCost(root.cost)}
          </Text>
        </HStack>
      </div>
      {visible.map(({node, depth}) => (
        <PlanNodeRow
          key={node.id}
          node={node}
          depth={depth}
          paneKey={paneKey}
          planTotal={root.cost}
          isCollapsed={collapsedIds.has(`${paneKey}:${node.id}`)}
          isHighlighted={highlightId === node.id}
          changeKind={changeMap?.get(node.id)}
          isCompact={isCompact}
          onToggle={onToggle}
          onHighlight={onHighlight}
        />
      ))}
    </div>
  );
}

// ============= COST BREAKDOWN BAR =============

function CostBreakdownBar({
  root,
  highlightId,
  onHighlight,
}: {
  root: PlanNode;
  highlightId: string | null;
  onHighlight: (id: string | null) => void;
}) {
  const flat = flattenAll(root);
  const highlighted =
    highlightId !== null
      ? flat.find(entry => entry.node.id === highlightId)
      : undefined;
  return (
    <VStack gap={1}>
      <div style={styles.costBar} aria-hidden="true">
        {flat.map(({node}) => (
          <span
            key={node.id}
            onMouseEnter={() => onHighlight(node.id)}
            onMouseLeave={() => onHighlight(null)}
            style={{
              ...styles.costSegment,
              width: `${(node.selfCost / root.cost) * 100}%`,
              backgroundColor: CATEGORY_COLOR[operatorCategory(node.operator)],
              ...(highlightId !== null && highlightId !== node.id
                ? styles.costSegmentDimmed
                : undefined),
            }}
          />
        ))}
      </div>
      {/* Caption mirrors the highlight for screen readers and touch. */}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {highlighted !== undefined
          ? `${highlighted.node.operator} — self cost ${formatCost(
              highlighted.node.selfCost,
            )} (${Math.round(
              (highlighted.node.selfCost / root.cost) * 100,
            )}% of ${formatCost(root.cost)})`
          : 'Cost breakdown by operator — hover, focus, or tap a plan node to highlight its share.'}
      </Text>
    </VStack>
  );
}

// ============= INDEX SUGGESTIONS =============

function SuggestionPanel({
  query,
  isApplied,
  isCompact,
  onApply,
  onRevert,
}: {
  query: QueryFixture;
  isApplied: boolean;
  isCompact: boolean;
  onApply: (queryId: string) => void;
  onRevert: (queryId: string) => void;
}) {
  if (query.suggestion === undefined || query.optimized === undefined) {
    return (
      <VStack gap={3}>
        <EmptyState
          isCompact
          icon={<Icon icon={SparklesIcon} size="lg" color="secondary" />}
          title="No index candidates"
          description="The planner already uses index paths where they pay off for this query."
        />
        {query.indexesInUse.length > 0 && (
          <VStack gap={2}>
            <Text type="supporting" color="secondary">
              Indexes in use
            </Text>
            {query.indexesInUse.map(index => (
              <HStack key={index} gap={2} vAlign="center">
                <Icon icon={TableIcon} size="sm" color="secondary" />
                <Code>{index}</Code>
              </HStack>
            ))}
          </VStack>
        )}
      </VStack>
    );
  }

  const before = query.plan.cost;
  const after = query.optimized.plan.cost;
  const {suggestion} = query;

  return (
    <VStack gap={3}>
      <div style={styles.suggestionRow}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge
              variant={suggestion.impact === 'high' ? 'success' : 'info'}
              label={`${suggestion.impact} impact`}
            />
            <Text type="supporting" color="secondary">
              table {suggestion.table}
            </Text>
            {isApplied && <Badge variant="success" label="Applied" />}
          </HStack>
          <div style={styles.sqlBlock}>{suggestion.ddl}</div>
          <Text type="supporting" color="secondary">
            {suggestion.note}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Tooltip content="Estimated plan cost before → after">
              <span>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {formatCost(before)} → {formatCost(after)}
                </Text>
              </span>
            </Tooltip>
            <Badge
              variant="success"
              label={`−${costDeltaPercent(before, after)}% cost`}
            />
          </HStack>
          {isApplied ? (
            <Button
              label="Revert index"
              variant="secondary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={() => onRevert(query.id)}
            />
          ) : (
            <Button
              label="Apply index"
              variant="primary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={ZapIcon} size="sm" color="inherit" />}
              onClick={() => onApply(query.id)}
            />
          )}
        </VStack>
      </div>
      <Text type="supporting" color="secondary">
        Applying swaps in the planner&apos;s rewritten plan for this candidate
        and re-ranks the query list. Revert restores the original plan.
      </Text>
    </VStack>
  );
}

// ============= PAGE =============

export default function QueryPlanProfilerTemplate() {
  const [selectedQueryId, setSelectedQueryId] = useState(INITIAL_QUERY_ID);
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  // Query ids whose candidate index has been applied — persists across
  // query switches so optimizations hold everywhere on the surface.
  const [appliedIds, setAppliedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // Collapsed plan-node ids, keyed `${paneKey}:${nodeId}` so the main tree
  // and both compare panes track independently. Default = fully expanded.
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [liveMessage, setLiveMessage] = useState('');

  // Responsive contract: <=1024px moves the suggestion panel inline and
  // stacks the compare grid; <=640px swaps the rail for a query Selector
  // and grows rows/buttons to >=40px tap targets.
  const isSinglePaneSuggestions = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- derived state ----
  const activeMetrics = (query: QueryFixture) => {
    const isApplied =
      appliedIds.has(query.id) && query.optimized !== undefined;
    return {
      cost: isApplied ? query.optimized!.plan.cost : query.plan.cost,
      p95Ms: isApplied ? query.optimized!.p95Ms : query.p95Ms,
      calls: query.calls,
      isApplied,
    };
  };

  // The ranked list re-sorts live: applying an optimization changes the
  // query's active cost/p95, which changes its rank.
  const rankedQueries = useMemo(() => {
    const withMetrics = QUERIES.map(query => ({
      query,
      metrics: {
        cost:
          appliedIds.has(query.id) && query.optimized !== undefined
            ? query.optimized.plan.cost
            : query.plan.cost,
        p95Ms:
          appliedIds.has(query.id) && query.optimized !== undefined
            ? query.optimized.p95Ms
            : query.p95Ms,
        calls: query.calls,
      },
    }));
    withMetrics.sort((a, b) =>
      sortKey === 'cost'
        ? b.metrics.cost - a.metrics.cost
        : sortKey === 'p95'
          ? b.metrics.p95Ms - a.metrics.p95Ms
          : b.metrics.calls - a.metrics.calls,
    );
    return withMetrics;
  }, [appliedIds, sortKey]);

  const selectedQuery =
    QUERIES.find(query => query.id === selectedQueryId) ?? QUERIES[0];
  const selected = activeMetrics(selectedQuery);
  const activePlan =
    selected.isApplied && selectedQuery.optimized !== undefined
      ? selectedQuery.optimized.plan
      : selectedQuery.plan;

  const totalActiveCost = rankedQueries.reduce(
    (sum, entry) => sum + entry.metrics.cost,
    0,
  );
  const optimizedCount = QUERIES.filter(
    query => appliedIds.has(query.id) && query.optimized !== undefined,
  ).length;

  const changeMap = useMemo(
    () =>
      selectedQuery.optimized !== undefined
        ? diffPlans(selectedQuery.plan, selectedQuery.optimized.plan)
        : undefined,
    [selectedQuery],
  );

  const showCompare = isComparing && selectedQuery.optimized !== undefined;

  // ---- interactions ----
  const selectQuery = (id: string) => {
    setSelectedQueryId(id);
    // Per-query view state resets; applied optimizations persist.
    setCollapsedIds(new Set());
    setHighlightId(null);
    setIsComparing(false);
  };

  const toggleNode = (paneKey: string, nodeId: string) => {
    setCollapsedIds(prev => {
      const key = `${paneKey}:${nodeId}`;
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const expandAll = () => setCollapsedIds(new Set());

  const collapseAll = () => {
    const keys: string[] = [];
    if (showCompare && selectedQuery.optimized !== undefined) {
      for (const id of collectInternalIds(selectedQuery.plan)) {
        keys.push(`orig:${id}`);
      }
      for (const id of collectInternalIds(selectedQuery.optimized.plan)) {
        keys.push(`opt:${id}`);
      }
    } else {
      for (const id of collectInternalIds(activePlan)) {
        keys.push(`main:${id}`);
      }
    }
    setCollapsedIds(new Set(keys));
  };

  const applySuggestion = (queryId: string) => {
    const query = QUERIES.find(q => q.id === queryId);
    if (query?.optimized === undefined || query.suggestion === undefined) {
      return;
    }
    setAppliedIds(prev => new Set(prev).add(queryId));
    setLiveMessage(
      `Applied index on ${query.suggestion.table} — ${query.name} total cost ` +
        `${formatCost(query.plan.cost)} → ${formatCost(
          query.optimized.plan.cost,
        )}. Query list re-ranked.`,
    );
  };

  const revertSuggestion = (queryId: string) => {
    const query = QUERIES.find(q => q.id === queryId);
    if (query === undefined) {
      return;
    }
    setAppliedIds(prev => {
      const next = new Set(prev);
      next.delete(queryId);
      return next;
    });
    setIsComparing(false);
    setLiveMessage(
      `Reverted index for ${query.name} — original plan restored.`,
    );
  };

  // ---- rail ----
  const railRows = rankedQueries.map(({query, metrics}, index) => {
    const isActive = query.id === selectedQueryId;
    const isApplied =
      appliedIds.has(query.id) && query.optimized !== undefined;
    return (
      <button
        key={query.id}
        type="button"
        aria-current={isActive ? 'true' : undefined}
        aria-label={
          `${query.name}: rank ${index + 1}, total cost ${formatCost(metrics.cost)}, ` +
          `p95 ${formatMs(metrics.p95Ms)}, ${formatCalls(metrics.calls)} calls` +
          (isApplied ? ', index applied' : '')
        }
        onClick={() => selectQuery(query.id)}
        style={{
          ...styles.railRow,
          ...(isActive ? styles.railRowActive : undefined),
        }}>
        <HStack gap={2} vAlign="center">
          <span style={styles.railRank} aria-hidden="true">
            {index + 1}
          </span>
          <span style={styles.railName}>
            <Text type="label" maxLines={1}>
              {query.name}
            </Text>
          </span>
          {isApplied && query.optimized !== undefined && (
            <Badge
              variant="success"
              label={`−${costDeltaPercent(
                query.plan.cost,
                query.optimized.plan.cost,
              )}%`}
            />
          )}
        </HStack>
        <span style={styles.railMetrics} aria-hidden="true">
          <span>cost {formatCost(metrics.cost)}</span>
          <span>p95 {formatMs(metrics.p95Ms)}</span>
          <span>{formatCalls(metrics.calls)} calls</span>
        </span>
      </button>
    );
  });

  // ---- single-pane query picker (<=640px) ----
  const queryPicker = (
    <Selector
      label="Query"
      isLabelHidden
      options={rankedQueries.map(({query, metrics}, index) => ({
        value: query.id,
        label: `${index + 1}. ${query.name} · cost ${formatCost(metrics.cost)}`,
      }))}
      value={selectedQueryId}
      onChange={selectQuery}
    />
  );

  // ---- compare legend ----
  const compareLegend = (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <HStack gap={1} vAlign="center">
        <span
          style={{
            ...styles.legendSwatch,
            backgroundColor: 'var(--color-error-muted)',
          }}
        />
        <Text type="supporting" color="secondary">
          removed
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span
          style={{
            ...styles.legendSwatch,
            backgroundColor: 'var(--color-success-muted)',
          }}
        />
        <Text type="supporting" color="secondary">
          added
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span
          style={{
            ...styles.legendSwatch,
            backgroundColor: 'var(--color-warning-muted)',
          }}
        />
        <Text type="supporting" color="secondary">
          cost changed
        </Text>
      </HStack>
    </HStack>
  );

  // ---- suggestion body (docked panel >1024px, inline section below) ----
  const suggestionBody = (
    <SuggestionPanel
      query={selectedQuery}
      isApplied={selected.isApplied}
      isCompact={isCompact}
      onApply={applySuggestion}
      onRevert={revertSuggestion}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={GaugeIcon} size="md" color="secondary" />
                <Heading level={1}>Query Profiler</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {DB_META.database} · {DB_META.engine} · {DB_META.window}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Tooltip content="Sum of active plan costs across all 6 queries — drops as indexes are applied">
              <span>
                <HStack gap={1} vAlign="center">
                  <Icon icon={SigmaIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {formatCost(totalActiveCost)} plan cost
                  </Text>
                </HStack>
              </span>
            </Tooltip>
            <HStack gap={1} vAlign="center">
              <StatusDot
                variant={optimizedCount > 0 ? 'success' : 'neutral'}
                label={`${optimizedCount} optimized`}
              />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {optimizedCount} of {QUERIES.length} optimized
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={320} padding={0} hasDivider label="Slow queries">
            <div style={styles.railFrame}>
              <div style={styles.railHeader}>
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={DatabaseIcon} size="sm" color="secondary" />
                    <StackItem size="fill">
                      <Heading level={2}>Slow queries</Heading>
                    </StackItem>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {QUERIES.length}
                    </Text>
                  </HStack>
                  <Selector
                    label="Rank queries by"
                    isLabelHidden
                    options={SORT_OPTIONS}
                    value={sortKey}
                    onChange={value => setSortKey(value as SortKey)}
                  />
                </VStack>
              </div>
              <div style={styles.railScroll}>
                <VStack gap={1}>{railRows}</VStack>
              </div>
            </div>
          </LayoutPanel>
        )
      }
      end={
        isSinglePaneSuggestions ? undefined : (
          <LayoutPanel
            width={300}
            padding={0}
            hasDivider
            label="Index suggestions">
            <div style={styles.detailScroll}>
              <VStack gap={3}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={SparklesIcon} size="sm" color="secondary" />
                  <Heading level={2}>Index suggestions</Heading>
                </HStack>
                {suggestionBody}
              </VStack>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4} label="Query detail">
          <VStack gap={3}>
            {isCompact && queryPicker}

            {/* Query title + before/after delta once optimized. */}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Heading level={2}>{selectedQuery.name}</Heading>
              {selected.isApplied && selectedQuery.optimized !== undefined ? (
                <>
                  <Badge
                    variant="success"
                    label={`−${costDeltaPercent(
                      selectedQuery.plan.cost,
                      selectedQuery.optimized.plan.cost,
                    )}% cost`}
                  />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {formatCost(selectedQuery.plan.cost)} →{' '}
                    {formatCost(selectedQuery.optimized.plan.cost)}
                  </Text>
                </>
              ) : (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  cost {formatCost(selected.cost)} · p95{' '}
                  {formatMs(selected.p95Ms)} ·{' '}
                  {formatCalls(selected.calls)} calls
                </Text>
              )}
            </HStack>

            <div style={styles.sqlBlock}>{selectedQuery.sql}</div>

            {/* Plan toolbar: expand/collapse all + compare toggle. */}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text type="label">EXPLAIN plan</Text>
              <StackItem size="fill" />
              <Button
                label="Expand all"
                variant="ghost"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                onClick={expandAll}
              />
              <Button
                label="Collapse all"
                variant="ghost"
                size="sm"
                style={isCompact ? styles.buttonTapTarget : undefined}
                onClick={collapseAll}
              />
              {selectedQuery.optimized !== undefined && (
                <Switch
                  label="Compare plans"
                  value={isComparing}
                  onChange={setIsComparing}
                />
              )}
            </HStack>

            {showCompare && selectedQuery.optimized !== undefined ? (
              <VStack gap={2}>
                {compareLegend}
                <div
                  style={{
                    ...styles.compareGrid,
                    ...(isSinglePaneSuggestions
                      ? styles.compareGridStacked
                      : undefined),
                  }}>
                  <PlanTree
                    root={selectedQuery.plan}
                    paneKey="orig"
                    title="Original"
                    collapsedIds={collapsedIds}
                    highlightId={highlightId}
                    changeMap={changeMap}
                    isCompact={isCompact}
                    onToggle={toggleNode}
                    onHighlight={setHighlightId}
                  />
                  <PlanTree
                    root={selectedQuery.optimized.plan}
                    paneKey="opt"
                    title="Optimized"
                    titleBadge={
                      <Badge
                        variant="success"
                        label={`−${costDeltaPercent(
                          selectedQuery.plan.cost,
                          selectedQuery.optimized.plan.cost,
                        )}%`}
                      />
                    }
                    collapsedIds={collapsedIds}
                    highlightId={highlightId}
                    changeMap={changeMap}
                    isCompact={isCompact}
                    onToggle={toggleNode}
                    onHighlight={setHighlightId}
                  />
                </div>
              </VStack>
            ) : (
              <VStack gap={2}>
                <CostBreakdownBar
                  root={activePlan}
                  highlightId={highlightId}
                  onHighlight={setHighlightId}
                />
                <PlanTree
                  root={activePlan}
                  paneKey="main"
                  title={selected.isApplied ? 'Optimized plan' : 'Plan'}
                  titleBadge={
                    selected.isApplied ? (
                      <Badge variant="success" label="index applied" />
                    ) : undefined
                  }
                  collapsedIds={collapsedIds}
                  highlightId={highlightId}
                  isCompact={isCompact}
                  onToggle={toggleNode}
                  onHighlight={setHighlightId}
                />
              </VStack>
            )}

            {/* <=1024px single-pane fallback: the suggestion panel renders
                inline below the tree so Apply/Revert stay one scroll away. */}
            {isSinglePaneSuggestions && (
              <>
                <Divider />
                <VStack gap={3}>
                  <HStack gap={2} vAlign="center">
                    <Icon icon={SparklesIcon} size="sm" color="secondary" />
                    <Heading level={2}>Index suggestions</Heading>
                  </HStack>
                  {suggestionBody}
                </VStack>
              </>
            )}
          </VStack>

          {/* Apply/revert outcomes and re-ranks are announced. */}
          <div aria-live="polite" style={styles.srOnly}>
            {liveMessage}
          </div>
        </LayoutContent>
      }
    />
  );
}
