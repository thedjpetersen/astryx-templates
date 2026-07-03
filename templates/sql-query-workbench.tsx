// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file sql-query-workbench.tsx
 * @input Deterministic fixtures only (one retail Postgres schema — orders,
 *   users, events — with typed columns and row estimates; four canned
 *   result sets keyed to recognizable queries with per-connection elapsed
 *   times; three seeded saved queries; two fake connections)
 * @output Interactive SQL workbench: left, a sidebar with a connection
 *   Selector and an expandable schema tree (database > tables > columns
 *   with type badges) above a saved-queries rail; center, a tab strip of
 *   independent SQL editors over a dark textarea; below, a result grid
 *   with sortable headers and a per-column filter row, plus a status bar
 *   showing row count, elapsed time, and the active connection. Run
 *   matches the SQL to a fixture result set behind a brief running state
 *   with an animated elapsed-time readout (unknown tables produce a
 *   relation-does-not-exist error). Saving prompts for a name in a
 *   Dialog and adds to the saved rail; a saved query opens in a new tab;
 *   clicking a schema column inserts its name at the editor cursor;
 *   deleting a saved query confirms inline and can be undone.
 * @position Page template; emitted by `astryx template sql-query-workbench`
 *
 * Frame: Layout height="fill". LayoutHeader carries the workbench title,
 * the connection badge, and the primary Run button (plus the
 * Browser/Editor SegmentedControl in single-pane mode). LayoutPanel on
 * the start side owns the connection picker, schema tree, and saved
 * rail as one scrolling column. LayoutContent owns the editor column:
 * tab strip, dark SQL textarea, editor footer (Save + counts), the
 * result grid region, and the pinned status bar.
 *
 * Responsive contract:
 * - >1100px: sidebar panel is 300px; the editor column fills the rest.
 * - <=1100px: sidebar narrows to 260px; the editor column keeps fill.
 * - <=640px: single-pane mode — the start panel unmounts and a
 *   Browser/Editor SegmentedControl in the header swaps the sidebar and
 *   editor columns; inserting a schema column or pressing Run jumps to
 *   the Editor view so the change is never off-screen. The header sheds
 *   the connection badge and the title truncates. Tree rows, saved-query
 *   rows, tab buttons, filter inputs, and toolbar buttons all grow to
 *   ~40px tap targets; nothing is hover-only (sorting, filtering,
 *   expanding, and deleting are all click/tap driven with visible
 *   controls).
 * - Usable at 375px: the tab strip scrolls horizontally instead of
 *   wrapping, the result grid scrolls horizontally inside its own
 *   region (minWidth table + overflowX auto) rather than widening the
 *   page, SQL lines scroll inside the dark textarea (wrap="off"), and
 *   the status bar drops its connection segment before clipping counts.
 * - The schema/saved sidebar, the SQL textarea, and the result grid
 *   scroll independently; header, tab strip, editor footer, and status
 *   bar stay pinned.
 *
 * Container policy (database IDE archetype): one dark container only —
 * the SQL textarea keeps a fixed terminal palette in either theme (it
 * reproduces a code surface, so it never uses themed Text colors). All
 * other regions (tree, saved rail, result grid, status bar) are plain
 * frame rows on the themed background; no Cards.
 *
 * Color policy: token-driven except one scheme-locked surface — the SQL
 * editor (editorWrap/editorArea) reproduces a terminal code surface and
 * keeps its fixed dark CODE palette in both themes, with
 * colorScheme: 'dark' locked in the style; text on that surface uses the
 * CODE literals (never themed tokens) so it stays readable. Everything
 * else uses var(--color-*) tokens or light-dark() pairs.
 *
 * Fixture policy: fixed data only — no Date.now, no Math.random, no
 * network assets. Result rows, elapsed milliseconds (per connection),
 * row estimates, and timestamps are frozen constants; the running-state
 * readout animates in fixed steps toward the fixture's constant elapsed
 * time; saved-query and tab ids advance from seeded counters.
 */

import {
  useEffect,
  useMemo,
  useRef,
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
  Stack,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  BookmarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DatabaseIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  Table2Icon,
  Trash2Icon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= CODE PALETTE =============
// Scheme-locked surface: the SQL editor reproduces a code surface, so it
// keeps a fixed dark palette instead of themed Text colors (dark in both
// themes; colorScheme is locked to 'dark' on editorWrap/editorArea).
// Text on this surface deliberately uses these literals, not tokens.

const CODE = {
  bg: '#0d1117',
  border: '#22272e',
  base: '#c9d1d9',
  dim: '#768390',
  caret: '#79c0ff',
} as const;

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// Column-type accents lean on chart tokens (light-dark aware).
const TYPE_COLORS: Record<string, string> = {
  bigint: 'var(--color-data-categorical-blue)',
  numeric: 'var(--color-data-categorical-blue)',
  text: 'var(--color-data-categorical-green)',
  timestamptz: 'var(--color-data-categorical-purple)',
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  column: {height: '100%', minHeight: 0},
  columnFill: {flex: 1, minHeight: 0},
  // ---- Sidebar (connection + schema tree + saved rail) ----
  sidebar: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingBlock: 'var(--spacing-3)',
  },
  sidebarSection: {paddingInline: 'var(--spacing-3)'},
  sidebarLabelRow: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  // Tree rows are real buttons: full-width, left-aligned, no hover-only
  // affordances. minHeight comes from the compact/touch variants below.
  treeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    width: '100%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    minHeight: 32,
  },
  treeRowTouch: {minHeight: 40},
  treeDbRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 4,
  },
  treeIndentTable: {paddingLeft: 'var(--spacing-4)'},
  treeIndentColumn: {paddingLeft: 'var(--spacing-8)'},
  treeGrow: {flex: 1, minWidth: 0},
  // Column-type badge: tiny bordered mono chip tinted per type family.
  typeBadge: {
    flex: 'none',
    fontFamily: MONO_FONT,
    fontSize: 10,
    lineHeight: '16px',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    paddingInline: 4,
    whiteSpace: 'nowrap',
  },
  columnName: {
    fontFamily: MONO_FONT,
    fontSize: 12,
  },
  // Saved-query rows: button + delete affordance side by side.
  savedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingInline: 'var(--spacing-1)',
  },
  savedOpen: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 6,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 4,
    minHeight: 32,
  },
  savedOpenTouch: {minHeight: 40},
  savedMeta: {flex: 1, minWidth: 0},
  undoRow: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  // ---- Tab strip ----
  tabStrip: {
    display: 'flex',
    alignItems: 'stretch',
    overflowX: 'auto',
    paddingInline: 'var(--spacing-2)',
    gap: 2,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    flex: 'none',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    borderBottomColor: 'var(--color-accent)',
  },
  tabSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    paddingInline: 'var(--spacing-2)',
    minHeight: 36,
    whiteSpace: 'nowrap',
  },
  tabSelectTouch: {minHeight: 44},
  tabStripActions: {
    display: 'flex',
    alignItems: 'center',
    flex: 'none',
    paddingInline: 'var(--spacing-1)',
  },
  // ---- SQL editor ----
  // Scheme-locked dark code surface (see Color policy in the header).
  editorWrap: {
    flex: 'none',
    display: 'flex',
    backgroundColor: CODE.bg,
    colorScheme: 'dark',
  },
  editorArea: {
    colorScheme: 'dark',
    flex: 1,
    width: '100%',
    border: 'none',
    resize: 'none',
    backgroundColor: CODE.bg,
    color: CODE.base,
    caretColor: CODE.caret,
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.7,
    padding: 'var(--spacing-3) var(--spacing-4)',
    whiteSpace: 'pre',
    overflow: 'auto',
  },
  editorFooter: {
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  // ---- Results ----
  resultsHeader: {
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  resultsBody: {
    minHeight: 0,
    overflow: 'auto',
  },
  resultsTable: {minWidth: 560},
  // Sort headers are real buttons with a visible direction glyph.
  sortButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    color: 'inherit',
    minHeight: 28,
  },
  sortButtonTouch: {minHeight: 40},
  filterInput: {
    width: '100%',
    minWidth: 88,
    boxSizing: 'border-box',
    height: 30,
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    background: 'var(--color-bg, transparent)',
    color: 'inherit',
    fontFamily: MONO_FONT,
    fontSize: 11.5,
    paddingInline: 6,
  },
  filterInputTouch: {height: 40},
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  monoCell: {
    fontFamily: MONO_FONT,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  // Query-error block: bordered row with an error accent, no Card.
  errorBlock: {
    margin: 'var(--spacing-4)',
    border: '1px solid var(--color-border)',
    borderLeft:
      '3px solid var(--color-icon-error, light-dark(#d1242f, #f85149))',
    borderRadius: 6,
    padding: 'var(--spacing-3) var(--spacing-4)',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    color: 'var(--color-icon-error, light-dark(#d1242f, #f85149))',
  },
  runningBlock: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-8) var(--spacing-4)',
    textAlign: 'center',
  },
  idleBlock: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  emptyFill: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-6)',
  },
  statusBar: {
    alignItems: 'center',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
  },
  headerTitle: {minWidth: 0},
  dialogBody: {padding: 'var(--spacing-4)'},
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  segmentedTapTarget: {'--size-element-sm': '40px'} as CSSProperties,
};

// ============= DATA =============
// Deterministic fixtures: one retail schema, four canned result sets
// keyed to recognizable queries, fixed per-connection elapsed times.

type ConnectionId = 'prod-replica' | 'staging';

interface Connection {
  id: ConnectionId;
  label: string;
  host: string;
  database: string;
}

const CONNECTIONS: Connection[] = [
  {
    id: 'prod-replica',
    label: 'analytics-prod (read replica)',
    host: 'pg-replica-2.internal.test:5432',
    database: 'shopdb',
  },
  {
    id: 'staging',
    label: 'analytics-staging',
    host: 'pg-staging-1.internal.test:5432',
    database: 'shopdb_staging',
  },
];

type ColumnType = 'bigint' | 'text' | 'numeric' | 'timestamptz';

interface SchemaColumn {
  name: string;
  type: ColumnType;
}

interface SchemaTable {
  name: string;
  rowEstimate: string;
  columns: SchemaColumn[];
}

const SCHEMA_TABLES: SchemaTable[] = [
  {
    name: 'orders',
    rowEstimate: '12,480',
    columns: [
      {name: 'id', type: 'bigint'},
      {name: 'user_id', type: 'bigint'},
      {name: 'status', type: 'text'},
      {name: 'total_usd', type: 'numeric'},
      {name: 'placed_at', type: 'timestamptz'},
    ],
  },
  {
    name: 'users',
    rowEstimate: '3,214',
    columns: [
      {name: 'id', type: 'bigint'},
      {name: 'email', type: 'text'},
      {name: 'plan', type: 'text'},
      {name: 'country', type: 'text'},
      {name: 'signed_up_at', type: 'timestamptz'},
    ],
  },
  {
    name: 'events',
    rowEstimate: '402,118',
    columns: [
      {name: 'id', type: 'bigint'},
      {name: 'user_id', type: 'bigint'},
      {name: 'name', type: 'text'},
      {name: 'source', type: 'text'},
      {name: 'occurred_at', type: 'timestamptz'},
    ],
  },
];

// ---- Canned result sets ----

type FixtureId =
  | 'orders-recent'
  | 'orders-by-status'
  | 'users-list'
  | 'events-list';

interface ResultColumn {
  key: string;
  isNumeric: boolean;
}

interface ResultFixture {
  id: FixtureId;
  columns: ResultColumn[];
  /** Row cells aligned to `columns`; numeric cells are plain digits. */
  rows: string[][];
  /** Fixed elapsed milliseconds per connection (replica is faster). */
  elapsedMs: Record<ConnectionId, number>;
}

const FIXTURES: Record<FixtureId, ResultFixture> = {
  'orders-recent': {
    id: 'orders-recent',
    columns: [
      {key: 'id', isNumeric: true},
      {key: 'user_id', isNumeric: true},
      {key: 'status', isNumeric: false},
      {key: 'total_usd', isNumeric: true},
      {key: 'placed_at', isNumeric: false},
    ],
    rows: [
      ['10248', '4102', 'paid', '184.00', '2026-06-14 09:12'],
      ['10247', '4188', 'shipped', '92.50', '2026-06-14 08:47'],
      ['10246', '4021', 'paid', '311.25', '2026-06-13 22:03'],
      ['10245', '4102', 'refunded', '58.00', '2026-06-13 18:39'],
      ['10244', '4177', 'paid', '129.99', '2026-06-13 15:21'],
      ['10243', '4090', 'pending', '412.80', '2026-06-13 11:05'],
      ['10242', '4046', 'paid', '76.40', '2026-06-12 20:44'],
      ['10241', '4188', 'shipped', '203.10', '2026-06-12 16:32'],
      ['10240', '4033', 'paid', '95.00', '2026-06-12 09:58'],
    ],
    elapsedMs: {'prod-replica': 42, staging: 71},
  },
  'orders-by-status': {
    id: 'orders-by-status',
    columns: [
      {key: 'status', isNumeric: false},
      {key: 'orders', isNumeric: true},
      {key: 'revenue_usd', isNumeric: true},
      {key: 'avg_order_usd', isNumeric: true},
    ],
    rows: [
      ['paid', '1284', '118240.00', '92.09'],
      ['shipped', '342', '40118.50', '117.31'],
      ['pending', '87', '11402.75', '131.07'],
      ['refunded', '56', '5220.40', '93.22'],
    ],
    elapsedMs: {'prod-replica': 133, staging: 208},
  },
  'users-list': {
    id: 'users-list',
    columns: [
      {key: 'id', isNumeric: true},
      {key: 'email', isNumeric: false},
      {key: 'plan', isNumeric: false},
      {key: 'country', isNumeric: false},
      {key: 'signed_up_at', isNumeric: false},
    ],
    rows: [
      ['4203', 'kenji@mapleforge.test', 'free', 'JP', '2026-06-10 04:11'],
      ['4188', 'sofia@tidepool.test', 'pro', 'BR', '2026-06-02 13:40'],
      ['4177', 'amir@fernworks.test', 'team', 'CA', '2026-05-28 17:05'],
      ['4102', 'june@copperkit.test', 'pro', 'US', '2026-05-11 09:52'],
      ['4090', 'leo@quartzware.test', 'free', 'US', '2026-05-06 21:18'],
      ['4046', 'priya@northwind.test', 'team', 'IN', '2026-04-19 08:27'],
      ['4033', 'tomas@brightbay.test', 'free', 'ES', '2026-04-08 15:44'],
      ['4021', 'mara@lumenlabs.test', 'pro', 'DE', '2026-03-30 11:36'],
    ],
    elapsedMs: {'prod-replica': 38, staging: 64},
  },
  'events-list': {
    id: 'events-list',
    columns: [
      {key: 'id', isNumeric: true},
      {key: 'user_id', isNumeric: true},
      {key: 'name', isNumeric: false},
      {key: 'source', isNumeric: false},
      {key: 'occurred_at', isNumeric: false},
    ],
    rows: [
      ['98311', '4102', 'checkout_completed', 'web', '2026-06-14 09:12'],
      ['98310', '4102', 'cart_add', 'web', '2026-06-14 09:08'],
      ['98309', '4188', 'checkout_completed', 'ios', '2026-06-14 08:47'],
      ['98308', '4203', 'page_view', 'web', '2026-06-14 08:31'],
      ['98307', '4188', 'cart_add', 'ios', '2026-06-14 08:26'],
      ['98306', '4046', 'search', 'android', '2026-06-14 07:58'],
      ['98305', '4021', 'page_view', 'web', '2026-06-14 07:41'],
      ['98304', '4177', 'plan_upgraded', 'web', '2026-06-14 07:22'],
      ['98303', '4033', 'search', 'web', '2026-06-14 06:59'],
    ],
    elapsedMs: {'prod-replica': 87, staging: 141},
  },
};

/** Fixed elapsed time for queries that fail to plan (per connection). */
const ERROR_ELAPSED_MS: Record<ConnectionId, number> = {
  'prod-replica': 12,
  staging: 21,
};

// ---- Seed SQL + saved queries ----

const RECENT_ORDERS_SQL = [
  'SELECT id, user_id, status, total_usd, placed_at',
  'FROM orders',
  'ORDER BY placed_at DESC',
  'LIMIT 9;',
].join('\n');

const REVENUE_BY_STATUS_SQL = [
  'SELECT status,',
  '       COUNT(*) AS orders,',
  '       SUM(total_usd) AS revenue_usd,',
  '       AVG(total_usd) AS avg_order_usd',
  'FROM orders',
  'GROUP BY status',
  'ORDER BY revenue_usd DESC;',
].join('\n');

const NEW_SIGNUPS_SQL = [
  'SELECT id, email, plan, country, signed_up_at',
  'FROM users',
  'ORDER BY signed_up_at DESC',
  'LIMIT 8;',
].join('\n');

const RECENT_EVENTS_SQL = [
  'SELECT id, user_id, name, source, occurred_at',
  'FROM events',
  "WHERE source <> 'bot'",
  'ORDER BY occurred_at DESC',
  'LIMIT 9;',
].join('\n');

interface SavedQuery {
  id: string;
  name: string;
  sql: string;
}

const INITIAL_SAVED: SavedQuery[] = [
  {id: 'saved-1', name: 'Recent orders', sql: RECENT_ORDERS_SQL},
  {id: 'saved-2', name: 'Revenue by status', sql: REVENUE_BY_STATUS_SQL},
  {id: 'saved-3', name: 'New signups', sql: NEW_SIGNUPS_SQL},
];

// ---- Tabs ----

type TabResult =
  | {
      kind: 'rows';
      fixtureId: FixtureId;
      elapsedMs: number;
      connectionLabel: string;
    }
  | {kind: 'error'; message: string; elapsedMs: number; connectionLabel: string};

interface EditorTab {
  id: string;
  title: string;
  sql: string;
  result: TabResult | null;
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  /** Per-column substring filters over the fixture rows. */
  filters: Record<string, string>;
}

function makeTab(id: string, title: string, sql: string): EditorTab {
  return {id, title, sql, result: null, sortKey: null, sortDir: 'asc', filters: {}};
}

const INITIAL_TABS: EditorTab[] = [
  makeTab('tab-1', 'Recent orders', RECENT_ORDERS_SQL),
  makeTab('tab-2', 'Events sample', RECENT_EVENTS_SQL),
];

// ---- Query matching (small helpers over fixtures; no real parser) ----

/**
 * Match SQL text to a canned fixture. The matcher only looks at the
 * table referenced after FROM (plus GROUP BY for the aggregate set), so
 * any recognizable query against orders/users/events "works".
 */
function matchFixture(
  sql: string,
  connection: Connection,
): TabResult {
  const normalized = sql.toLowerCase();
  const fromMatch = normalized.match(/from\s+"?([a-z_][a-z0-9_]*)"?/);
  if (fromMatch == null) {
    return {
      kind: 'error',
      message:
        'ERROR: syntax error — no FROM clause found. Try one of the schema tables: orders, users, events.',
      elapsedMs: ERROR_ELAPSED_MS[connection.id],
      connectionLabel: connection.label,
    };
  }
  const table = fromMatch[1];
  let fixtureId: FixtureId | null = null;
  if (table === 'orders') {
    fixtureId = /group\s+by/.test(normalized)
      ? 'orders-by-status'
      : 'orders-recent';
  } else if (table === 'users') {
    fixtureId = 'users-list';
  } else if (table === 'events') {
    fixtureId = 'events-list';
  }
  if (fixtureId == null) {
    return {
      kind: 'error',
      message: `ERROR: relation "${table}" does not exist in ${connection.database} (line 1)`,
      elapsedMs: ERROR_ELAPSED_MS[connection.id],
      connectionLabel: connection.label,
    };
  }
  const fixture = FIXTURES[fixtureId];
  return {
    kind: 'rows',
    fixtureId,
    elapsedMs: fixture.elapsedMs[connection.id],
    connectionLabel: connection.label,
  };
}

/** Numeric-aware cell compare for column sorting. */
function compareCells(a: string, b: string, isNumeric: boolean): number {
  if (isNumeric) {
    return Number(a) - Number(b);
  }
  return a.localeCompare(b);
}

// ============= SCHEMA TREE =============

/**
 * One expandable table row plus its column rows. Column rows are real
 * buttons that insert the column name at the editor cursor; the type
 * badge keeps its accent per type family.
 */
function SchemaTableNode({
  table,
  isExpanded,
  isTouch,
  onToggle,
  onInsertColumn,
}: {
  table: SchemaTable;
  isExpanded: boolean;
  isTouch: boolean;
  onToggle: () => void;
  onInsertColumn: (name: string) => void;
}) {
  const rowStyle = isTouch
    ? {...styles.treeRow, ...styles.treeRowTouch}
    : styles.treeRow;
  return (
    <VStack gap={0}>
      <button
        type="button"
        aria-expanded={isExpanded}
        style={{...rowStyle, ...styles.treeIndentTable}}
        onClick={onToggle}>
        <Icon
          icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
          size="sm"
          color="secondary"
        />
        <Icon icon={Table2Icon} size="sm" color="secondary" />
        <span style={styles.treeGrow}>
          <Text type="body" maxLines={1}>
            {table.name}
          </Text>
        </span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {table.rowEstimate}
        </Text>
      </button>
      {isExpanded &&
        table.columns.map(column => (
          <button
            key={column.name}
            type="button"
            style={{...rowStyle, ...styles.treeIndentColumn}}
            onClick={() => onInsertColumn(column.name)}>
            <span style={{...styles.treeGrow, ...styles.columnName}}>
              {column.name}
            </span>
            <span
              style={{
                ...styles.typeBadge,
                color: TYPE_COLORS[column.type],
              }}>
              {column.type}
            </span>
          </button>
        ))}
    </VStack>
  );
}

// ============= RESULT GRID =============

/**
 * Sortable, filterable grid over one fixture result set. Sorting and the
 * per-column filter row live on the owning tab, so each editor tab keeps
 * its own grid state.
 */
function ResultGrid({
  fixture,
  sortKey,
  sortDir,
  filters,
  isTouch,
  onToggleSort,
  onFilterChange,
}: {
  fixture: ResultFixture;
  sortKey: string | null;
  sortDir: 'asc' | 'desc';
  filters: Record<string, string>;
  isTouch: boolean;
  onToggleSort: (key: string) => void;
  onFilterChange: (key: string, value: string) => void;
}) {
  const visibleRows = useMemo(() => {
    let rows = fixture.rows.filter(row =>
      fixture.columns.every((column, index) => {
        const needle = (filters[column.key] ?? '').trim().toLowerCase();
        return needle === '' || row[index].toLowerCase().includes(needle);
      }),
    );
    if (sortKey != null) {
      const sortIndex = fixture.columns.findIndex(
        column => column.key === sortKey,
      );
      if (sortIndex >= 0) {
        const isNumeric = fixture.columns[sortIndex].isNumeric;
        rows = [...rows].sort((a, b) => {
          const delta = compareCells(a[sortIndex], b[sortIndex], isNumeric);
          return sortDir === 'asc' ? delta : -delta;
        });
      }
    }
    return rows;
  }, [fixture, filters, sortKey, sortDir]);

  const sortButtonStyle = isTouch
    ? {...styles.sortButton, ...styles.sortButtonTouch}
    : styles.sortButton;
  const filterInputStyle = isTouch
    ? {...styles.filterInput, ...styles.filterInputTouch}
    : styles.filterInput;

  return (
    <Table density="compact" dividers="rows" style={styles.resultsTable}>
      <TableHeader>
        <TableRow isHeaderRow>
          {fixture.columns.map(column => {
            const isSorted = sortKey === column.key;
            return (
              <TableHeaderCell
                key={column.key}
                scope="col"
                aria-sort={
                  isSorted
                    ? sortDir === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                }
                style={column.isNumeric ? styles.numericCell : undefined}>
                <button
                  type="button"
                  style={sortButtonStyle}
                  aria-label={
                    isSorted
                      ? `Sort ${column.key} ${
                          sortDir === 'asc' ? 'descending' : 'ascending'
                        }`
                      : `Sort by ${column.key}`
                  }
                  onClick={() => onToggleSort(column.key)}>
                  {column.key}
                  <Icon
                    icon={
                      isSorted
                        ? sortDir === 'asc'
                          ? ArrowUpIcon
                          : ArrowDownIcon
                        : ArrowUpDownIcon
                    }
                    size="xsm"
                    color={isSorted ? 'primary' : 'secondary'}
                  />
                </button>
              </TableHeaderCell>
            );
          })}
        </TableRow>
        {/* Per-column filter row: substring match, narrows rows live. */}
        <TableRow>
          {fixture.columns.map(column => (
            <TableCell key={`filter-${column.key}`}>
              <input
                type="text"
                aria-label={`Filter ${column.key}`}
                placeholder="filter…"
                style={filterInputStyle}
                value={filters[column.key] ?? ''}
                onChange={event =>
                  onFilterChange(column.key, event.currentTarget.value)
                }
              />
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleRows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={fixture.columns.length}>
              <Text type="supporting" color="secondary">
                No rows match the column filters.
              </Text>
            </TableCell>
          </TableRow>
        ) : (
          visibleRows.map(row => (
            <TableRow key={`${fixture.id}-${row[0]}`}>
              {row.map((cell, cellIndex) => (
                <TableCell
                  key={`${fixture.id}-${row[0]}-${fixture.columns[cellIndex].key}`}
                  style={
                    fixture.columns[cellIndex].isNumeric
                      ? {...styles.monoCell, ...styles.numericCell}
                      : styles.monoCell
                  }>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

// ============= PAGE =============

export default function SqlQueryWorkbenchTemplate() {
  // ---- Connection + schema tree ----
  const [connectionId, setConnectionId] =
    useState<ConnectionId>('prod-replica');
  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>(
    {orders: true},
  );

  // ---- Tabs (each holds independent SQL, result, sort, filters) ----
  const [tabs, setTabs] = useState<EditorTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  // Seeded counters keep tab/saved ids deterministic (no randomness).
  const [tabSeq, setTabSeq] = useState(3);
  const [savedSeq, setSavedSeq] = useState(4);

  // ---- Running state: animated readout toward a fixed elapsed time ----
  const [running, setRunning] = useState<{
    tabId: string;
    targetMs: number;
    outcome: TabResult;
  } | null>(null);
  const [runningMs, setRunningMs] = useState(0);

  // ---- Saved queries rail ----
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>(INITIAL_SAVED);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(
    null,
  );
  const [lastDeleted, setLastDeleted] = useState<{
    query: SavedQuery;
    index: number;
  } | null>(null);

  // ---- Save dialog ----
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');

  // Single-pane mode below 640px: one surface at a time.
  const [mobileView, setMobileView] = useState('editor');
  const isSinglePane = useMediaQuery('(max-width: 640px)');
  const isPanelNarrow = useMediaQuery('(max-width: 1100px)');

  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  const connection =
    CONNECTIONS.find(item => item.id === connectionId) ?? CONNECTIONS[0];
  const activeTab = tabs.find(tab => tab.id === activeTabId) ?? null;
  const isRunningActiveTab = running != null && running.tabId === activeTabId;

  // Animate the elapsed readout in fixed steps toward the fixture's
  // constant elapsed time; only the cadence is runtime, the final value
  // shown is always the fixture constant.
  useEffect(() => {
    if (running == null) {
      return;
    }
    setRunningMs(0);
    const step = Math.max(9, Math.ceil(running.targetMs / 7));
    const id = window.setInterval(() => {
      setRunningMs(prev => Math.min(prev + step, running.targetMs));
    }, 90);
    return () => window.clearInterval(id);
  }, [running]);

  // Completion: land the outcome on the owning tab and reset its grid
  // state (sort + filters) for the fresh result set.
  useEffect(() => {
    if (running == null || runningMs < running.targetMs) {
      return;
    }
    setTabs(prev =>
      prev.map(tab =>
        tab.id === running.tabId
          ? {...tab, result: running.outcome, sortKey: null, sortDir: 'asc', filters: {}}
          : tab,
      ),
    );
    setRunning(null);
  }, [running, runningMs]);

  const updateTab = (tabId: string, patch: Partial<EditorTab>) => {
    setTabs(prev =>
      prev.map(tab => (tab.id === tabId ? {...tab, ...patch} : tab)),
    );
  };

  // ---- Tab actions ----

  const openTab = (title: string, sql: string) => {
    const id = `tab-${tabSeq}`;
    setTabSeq(prev => prev + 1);
    setTabs(prev => [...prev, makeTab(id, title, sql)]);
    setActiveTabId(id);
    if (isSinglePane) {
      setMobileView('editor');
    }
  };

  const newTab = () => {
    openTab(`Untitled query ${tabSeq}`, 'SELECT *\nFROM orders\nLIMIT 9;');
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const index = prev.findIndex(tab => tab.id === tabId);
      const next = prev.filter(tab => tab.id !== tabId);
      if (tabId === activeTabId && next.length > 0) {
        const neighbor = next[Math.min(index, next.length - 1)];
        setActiveTabId(neighbor.id);
      }
      return next;
    });
  };

  // ---- Run ----

  const runQuery = () => {
    if (activeTab == null || running != null) {
      return;
    }
    const outcome = matchFixture(activeTab.sql, connection);
    setRunning({tabId: activeTab.id, targetMs: outcome.elapsedMs, outcome});
    if (isSinglePane) {
      // Jump to the editor pane so the result grid is never off-screen.
      setMobileView('editor');
    }
  };

  const handleEditorKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      runQuery();
    }
  };

  // ---- Schema tree → editor cursor insertion ----

  const insertColumn = (name: string) => {
    if (activeTab == null) {
      openTab(`Untitled query ${tabSeq}`, name);
      return;
    }
    const area = editorRef.current;
    const start = area?.selectionStart ?? activeTab.sql.length;
    const end = area?.selectionEnd ?? start;
    const nextSql =
      activeTab.sql.slice(0, start) + name + activeTab.sql.slice(end);
    updateTab(activeTab.id, {sql: nextSql});
    if (isSinglePane) {
      setMobileView('editor');
    }
    // Restore focus + caret just after the inserted name (best effort —
    // in single-pane mode the textarea may still be mounting).
    window.setTimeout(() => {
      const el = editorRef.current;
      if (el != null) {
        el.focus();
        const caret = start + name.length;
        el.setSelectionRange(caret, caret);
      }
    }, 0);
  };

  // ---- Saved queries ----

  const openSaveDialog = () => {
    if (activeTab == null) {
      return;
    }
    setSaveName(activeTab.title);
    setIsSaveDialogOpen(true);
  };

  const confirmSave = () => {
    if (activeTab == null || saveName.trim() === '') {
      return;
    }
    const name = saveName.trim();
    const id = `saved-${savedSeq}`;
    setSavedSeq(prev => prev + 1);
    setSavedQueries(prev => [...prev, {id, name, sql: activeTab.sql}]);
    updateTab(activeTab.id, {title: name});
    setIsSaveDialogOpen(false);
  };

  const deleteSaved = (queryId: string) => {
    const index = savedQueries.findIndex(item => item.id === queryId);
    if (index < 0) {
      return;
    }
    setLastDeleted({query: savedQueries[index], index});
    setSavedQueries(prev => prev.filter(item => item.id !== queryId));
    setConfirmingDeleteId(null);
  };

  const undoDelete = () => {
    if (lastDeleted == null) {
      return;
    }
    setSavedQueries(prev => {
      const next = [...prev];
      next.splice(Math.min(lastDeleted.index, next.length), 0, lastDeleted.query);
      return next;
    });
    setLastDeleted(null);
  };

  // ---- Grid state (lives on the active tab) ----

  const toggleSort = (key: string) => {
    if (activeTab == null) {
      return;
    }
    if (activeTab.sortKey === key) {
      updateTab(activeTab.id, {
        sortDir: activeTab.sortDir === 'asc' ? 'desc' : 'asc',
      });
    } else {
      updateTab(activeTab.id, {sortKey: key, sortDir: 'asc'});
    }
  };

  const setFilter = (key: string, value: string) => {
    if (activeTab == null) {
      return;
    }
    updateTab(activeTab.id, {
      filters: {...activeTab.filters, [key]: value},
    });
  };

  const clearFilters = () => {
    if (activeTab != null) {
      updateTab(activeTab.id, {filters: {}});
    }
  };

  const hasActiveFilters =
    activeTab != null &&
    Object.values(activeTab.filters).some(value => value.trim() !== '');

  // Filtered-row count for the status bar (mirrors the grid's math).
  const resultFixture =
    activeTab?.result?.kind === 'rows'
      ? FIXTURES[activeTab.result.fixtureId]
      : null;
  const filteredCount = useMemo(() => {
    if (resultFixture == null || activeTab == null) {
      return 0;
    }
    return resultFixture.rows.filter(row =>
      resultFixture.columns.every((column, index) => {
        const needle = (activeTab.filters[column.key] ?? '')
          .trim()
          .toLowerCase();
        return needle === '' || row[index].toLowerCase().includes(needle);
      }),
    ).length;
  }, [resultFixture, activeTab]);

  // Grow the sm controls to ~40px touch targets in single-pane mode.
  const tapTargetStyle = isSinglePane ? styles.buttonTapTarget : undefined;
  const iconTapStyle = isSinglePane ? styles.iconTapTarget : undefined;

  // ---- Sidebar column: connection / schema tree / saved rail ----

  const savedOpenStyle = isSinglePane
    ? {...styles.savedOpen, ...styles.savedOpenTouch}
    : styles.savedOpen;

  const sidebarColumn = (
    <div style={styles.sidebar}>
      <VStack gap={2}>
        <div style={styles.sidebarSection}>
          <VStack gap={1}>
            <Selector
              label="Connection"
              size="sm"
              options={CONNECTIONS.map(item => ({
                value: item.id,
                label: item.label,
              }))}
              value={connection.id}
              onChange={value => setConnectionId(value as ConnectionId)}
              style={tapTargetStyle}
            />
            <Text type="supporting" color="secondary" maxLines={1}>
              {connection.host}
            </Text>
          </VStack>
        </div>
        <Divider />
        <HStack gap={2} style={styles.sidebarLabelRow}>
          <StackItem size="fill">
            <Text type="label">Schema</Text>
          </StackItem>
          <Badge label={`${SCHEMA_TABLES.length} tables`} variant="neutral" />
        </HStack>
        <VStack gap={0}>
          <div style={styles.treeDbRow}>
            <Icon icon={DatabaseIcon} size="sm" color="secondary" />
            <Text type="body" weight="semibold" maxLines={1}>
              {connection.database}
            </Text>
          </div>
          {SCHEMA_TABLES.map(table => (
            <SchemaTableNode
              key={table.name}
              table={table}
              isExpanded={expandedTables[table.name] === true}
              isTouch={isSinglePane}
              onToggle={() =>
                setExpandedTables(prev => ({
                  ...prev,
                  [table.name]: prev[table.name] !== true,
                }))
              }
              onInsertColumn={insertColumn}
            />
          ))}
        </VStack>
        <Divider />
        <HStack gap={2} style={styles.sidebarLabelRow}>
          <StackItem size="fill">
            <Text type="label">Saved queries</Text>
          </StackItem>
          <Badge label={String(savedQueries.length)} variant="neutral" />
        </HStack>
        <VStack gap={0}>
          {savedQueries.map(query => (
            <div key={query.id} style={styles.savedRow}>
              <button
                type="button"
                style={savedOpenStyle}
                onClick={() => openTab(query.name, query.sql)}>
                <Icon icon={BookmarkIcon} size="sm" color="secondary" />
                <span style={styles.savedMeta}>
                  <Text type="body" maxLines={1}>
                    {query.name}
                  </Text>
                </span>
              </button>
              {confirmingDeleteId === query.id ? (
                <>
                  <Button
                    label="Delete"
                    variant="destructive"
                    size="sm"
                    style={tapTargetStyle}
                    onClick={() => deleteSaved(query.id)}
                  />
                  <IconButton
                    label="Cancel delete"
                    tooltip="Cancel"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    style={iconTapStyle}
                    onClick={() => setConfirmingDeleteId(null)}
                  />
                </>
              ) : (
                <IconButton
                  label={`Delete saved query ${query.name}`}
                  tooltip="Delete"
                  icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  style={iconTapStyle}
                  onClick={() => setConfirmingDeleteId(query.id)}
                />
              )}
            </div>
          ))}
          {savedQueries.length === 0 && (
            <div style={styles.sidebarSection}>
              <Text type="supporting" color="secondary">
                No saved queries yet — save one from the editor.
              </Text>
            </div>
          )}
        </VStack>
        {lastDeleted != null && (
          <HStack gap={2} style={styles.undoRow}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                Deleted “{lastDeleted.query.name}”
              </Text>
            </StackItem>
            <Button
              label="Undo"
              variant="secondary"
              size="sm"
              icon={<Icon icon={Undo2Icon} size="sm" />}
              style={tapTargetStyle}
              onClick={undoDelete}
            />
          </HStack>
        )}
      </VStack>
    </div>
  );

  // ---- Tab strip ----

  const tabSelectStyle = isSinglePane
    ? {...styles.tabSelect, ...styles.tabSelectTouch}
    : styles.tabSelect;

  const tabStrip = (
    <div style={styles.tabStrip} role="tablist" aria-label="Query editors">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            style={{...styles.tab, ...(isActive ? styles.tabActive : undefined)}}>
            <button
              type="button"
              role="tab"
              aria-selected={isActive}
              style={tabSelectStyle}
              onClick={() => setActiveTabId(tab.id)}>
              <Text
                type="body"
                color={isActive ? 'primary' : 'secondary'}
                weight={isActive ? 'semibold' : 'normal'}
                maxLines={1}>
                {tab.title}
              </Text>
            </button>
            <IconButton
              label={`Close ${tab.title}`}
              tooltip="Close tab"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              style={iconTapStyle}
              onClick={() => closeTab(tab.id)}
            />
          </div>
        );
      })}
      <div style={styles.tabStripActions}>
        <IconButton
          label="New query tab"
          tooltip="New query"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          style={iconTapStyle}
          onClick={newTab}
        />
      </div>
    </div>
  );

  // ---- Results region for the active tab ----

  let resultsBody = null;
  let resultsHeaderBadges = null;
  if (activeTab != null) {
    if (isRunningActiveTab) {
      resultsBody = (
        <div style={styles.runningBlock}>
          <Icon icon={DatabaseIcon} size="lg" color="secondary" />
          <Text type="body" color="secondary" hasTabularNumbers>
            Running on {connection.label}… {runningMs} ms
          </Text>
        </div>
      );
      resultsHeaderBadges = (
        <Badge label={`… ${runningMs} ms`} variant="neutral" />
      );
    } else if (activeTab.result == null) {
      resultsBody = (
        <div style={styles.idleBlock}>
          <Text type="supporting" color="secondary">
            Press Run (or ⌘⏎ in the editor) to execute this tab’s SQL
            against {connection.label}.
          </Text>
        </div>
      );
    } else if (activeTab.result.kind === 'error') {
      resultsBody = (
        <div style={styles.errorBlock} role="alert">
          <Text type="body" color="inherit">
            {activeTab.result.message}
          </Text>
        </div>
      );
      resultsHeaderBadges = (
        <>
          <Badge label="error" variant="error" />
          <Badge
            label={`${activeTab.result.elapsedMs} ms`}
            variant="neutral"
          />
        </>
      );
    } else if (resultFixture != null) {
      resultsBody = (
        <ResultGrid
          fixture={resultFixture}
          sortKey={activeTab.sortKey}
          sortDir={activeTab.sortDir}
          filters={activeTab.filters}
          isTouch={isSinglePane}
          onToggleSort={toggleSort}
          onFilterChange={setFilter}
        />
      );
      resultsHeaderBadges = (
        <>
          <Badge
            label={`${filteredCount} of ${resultFixture.rows.length} rows`}
            variant="neutral"
          />
          <Tooltip content="Elapsed time of the captured run">
            <span>
              <Badge
                label={`${activeTab.result.elapsedMs} ms`}
                variant="success"
              />
            </span>
          </Tooltip>
        </>
      );
    }
  }

  // ---- Status bar text ----

  let statusText = `idle · ${connection.label}`;
  if (activeTab != null) {
    if (isRunningActiveTab) {
      statusText = `Running… ${runningMs} ms`;
    } else if (activeTab.result?.kind === 'rows' && resultFixture != null) {
      statusText = `${filteredCount} of ${resultFixture.rows.length} rows · ${activeTab.result.elapsedMs} ms`;
    } else if (activeTab.result?.kind === 'error') {
      statusText = `error · ${activeTab.result.elapsedMs} ms`;
    }
  }

  // ---- Editor column ----

  const editorColumn =
    activeTab == null ? (
      <div style={styles.emptyFill}>
        <EmptyState
          icon={<Icon icon={DatabaseIcon} size="lg" />}
          title="No query tabs open"
          description="Open a saved query from the sidebar, or start a new tab."
          actions={
            <Button label="New query" variant="secondary" onClick={newTab} />
          }
        />
      </div>
    ) : (
      <Stack direction="vertical" style={styles.column}>
        {tabStrip}
        <Divider />
        <div
          style={{
            ...styles.editorWrap,
            height: isSinglePane ? 190 : 240,
          }}>
          <textarea
            ref={editorRef}
            aria-label={`SQL for ${activeTab.title}`}
            spellCheck={false}
            wrap="off"
            style={styles.editorArea}
            value={activeTab.sql}
            onChange={event =>
              updateTab(activeTab.id, {sql: event.currentTarget.value})
            }
            onKeyDown={handleEditorKeyDown}
          />
        </div>
        <Divider />
        <HStack gap={2} style={styles.editorFooter}>
          <Button
            label="Save query"
            variant="secondary"
            size="sm"
            icon={<Icon icon={SaveIcon} size="sm" />}
            style={tapTargetStyle}
            onClick={openSaveDialog}
          />
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              {activeTab.sql.split('\n').length} lines ·{' '}
              {activeTab.sql.length} chars
            </Text>
          </StackItem>
          {!isSinglePane && (
            <Text type="supporting" color="secondary">
              ⌘⏎ to run
            </Text>
          )}
        </HStack>
        <Divider />
        <HStack gap={2} style={styles.resultsHeader}>
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Heading level={2}>Results</Heading>
              {resultsHeaderBadges}
            </HStack>
          </StackItem>
          {hasActiveFilters && (
            <Button
              label="Clear filters"
              variant="ghost"
              size="sm"
              icon={<Icon icon={XIcon} size="sm" />}
              style={tapTargetStyle}
              onClick={clearFilters}
            />
          )}
        </HStack>
        <StackItem size="fill" style={styles.columnFill}>
          <div
            role="region"
            aria-label="Query results"
            tabIndex={0}
            style={{...styles.resultsBody, height: '100%'}}>
            {resultsBody}
          </div>
        </StackItem>
        <Divider />
        <HStack gap={2} style={styles.statusBar}>
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers maxLines={1}>
              {statusText}
            </Text>
          </StackItem>
          {!isSinglePane && (
            <Text type="supporting" color="secondary" maxLines={1}>
              {connection.label} · {connection.database}
            </Text>
          )}
        </HStack>
      </Stack>
    );

  // ---- Save dialog ----

  const saveDialog = (
    <Dialog
      isOpen={isSaveDialogOpen}
      onOpenChange={setIsSaveDialogOpen}
      purpose="form"
      width="min(440px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Save query"
          subtitle="Adds this tab’s SQL to the saved-queries rail."
          onOpenChange={setIsSaveDialogOpen}
        />
        <TextInput
          label="Query name"
          width="100%"
          placeholder="e.g. Refunds this week"
          value={saveName}
          onChange={setSaveName}
        />
        <HStack gap={2} hAlign="end">
          <Button
            label="Cancel"
            variant="secondary"
            style={tapTargetStyle}
            onClick={() => setIsSaveDialogOpen(false)}
          />
          <Button
            label="Save"
            variant="primary"
            isDisabled={saveName.trim() === ''}
            style={tapTargetStyle}
            onClick={confirmSave}
          />
        </HStack>
      </VStack>
    </Dialog>
  );

  return (
    <>
      {saveDialog}
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill" style={styles.headerTitle}>
                <HStack gap={2} vAlign="center">
                  <Icon icon={DatabaseIcon} size="sm" color="secondary" />
                  <Heading level={1} maxLines={1}>
                    SQL Workbench
                  </Heading>
                  {!isSinglePane && (
                    <Badge label={connection.database} variant="neutral" />
                  )}
                </HStack>
              </StackItem>
              {isSinglePane && (
                <SegmentedControl
                  label="Workbench view"
                  value={mobileView}
                  onChange={setMobileView}
                  size="sm"
                  style={styles.segmentedTapTarget}>
                  <SegmentedControlItem label="Browser" value="browser" />
                  <SegmentedControlItem label="Editor" value="editor" />
                </SegmentedControl>
              )}
              <Button
                label={running != null ? 'Running…' : 'Run'}
                variant="primary"
                icon={<Icon icon={PlayIcon} size="sm" />}
                isDisabled={running != null || activeTab == null}
                style={tapTargetStyle}
                onClick={runQuery}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          !isSinglePane ? (
            <LayoutPanel
              hasDivider
              width={isPanelNarrow ? 260 : 300}
              padding={0}
              label="Schema browser">
              {sidebarColumn}
            </LayoutPanel>
          ) : undefined
        }
        content={
          <LayoutContent padding={0}>
            {isSinglePane && mobileView === 'browser'
              ? sidebarColumn
              : editorColumn}
          </LayoutContent>
        }
      />
    </>
  );
}
