var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (5 related tables — users, orders,
 *   order_items, products, addresses — with fixed canvas positions, typed
 *   column lists with PK/nullable flags, and 5 FK edges keyed by column id;
 *   two seeded schema problems: order_items ships without a primary key and
 *   orders.shipping_address_id is integer against addresses.id uuid)
 * @output Visual schema designer (ERD): a pannable dot-grid canvas of
 *   draggable entity cards (table-name drag handle, 40px column rows with
 *   PK key / FK link icons and a \`type?\` nullable shorthand) connected by
 *   SVG bezier relationship lines that re-anchor per column as cards move;
 *   tapping a column opens an in-card editor (rename TextInput with
 *   duplicate/empty validation, type Selector, nullable + primary-key
 *   Switches, two-step delete with an Undo chip) and every edit re-derives
 *   the right panel's CREATE TABLE DDL CodeBlock plus a validation strip of
 *   clickable warnings (missing PK, FK type mismatch, duplicate/unnamed
 *   column) that select and pulse the offending card
 * @position Page template; emitted by \`astryx template schema-designer-erd\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * live "5 tables · 5 relationships" caption, issues Badge, conditional
 * Reset view button, and a SQL button when the panel is hidden).
 * LayoutContent stacks the validation strip over the canvas viewport; the
 * canvas is the only pannable region. LayoutPanel end 360 is the live DDL
 * inspector for the selected table (stats line, CREATE TABLE CodeBlock,
 * relationship list).
 *
 * Responsive contract:
 * - >1100px: header | canvas (fill) | DDL panel 360. The canvas is the
 *   flexible region; the panel keeps its fixed width and scrolls.
 * - <=1100px: the DDL panel hides; a SQL button appears in the header and
 *   opens the same panel content in a Dialog, so the canvas gets the full
 *   width (single-pane fallback).
 * - <=640px: the header caption hides so the title, issues badge, and SQL
 *   button fit a phone width; the validation strip trades wrapping for a
 *   single overflowX-auto row of chips. Cards keep their 248px width —
 *   the canvas pans, so nothing is clipped off-reach at 375px.
 * - Touch: the canvas and card headers set touchAction: 'none' and use
 *   pointer capture, so drag/pan work with a finger; column rows are 40px
 *   tap targets and every affordance is click-based (no hover-only UI).
 *   Card headers are focusable — arrow keys nudge the card 16px per press
 *   as the keyboard path for dragging.
 *
 * Container policy (canvas-tool archetype): entity cards are hand-rolled
 * absolutely-positioned surfaces (not Card) because the SVG edge layer
 * anchors to exact row offsets; everything docked around the canvas uses
 * frame parts — the validation strip is a chip row, the inspector is a
 * LayoutPanel with a CodeBlock and a List. Geometry is simple arithmetic
 * over fixture arrays: row anchor = y + header + index * rowHeight.
 */

import {useMemo, useRef, useState, type CSSProperties} from 'react';

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
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CodeIcon,
  CrosshairIcon,
  DatabaseIcon,
  KeyRoundIcon,
  LinkIcon,
  PlusIcon,
  Table2Icon,
  Trash2Icon,
  TriangleAlertIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ============= GEOMETRY CONSTANTS =============
// The SVG edge layer anchors to exact pixel offsets inside each card, so
// the card header and every column row have fixed heights. The column
// editor and add-column footer render BELOW the rows, which keeps row
// anchors stable while a column is being edited.

const CARD_WIDTH = 248;
const CARD_HEADER_HEIGHT = 44;
const COLUMN_ROW_HEIGHT = 40; // 40px tap target per column row
const CANVAS_EXTENT_X = 1400; // drag clamp so cards stay reachable
const CANVAS_EXTENT_Y = 1000;
const NUDGE_STEP = 16; // arrow-key move distance for card headers

// One-shot warning pulse for "click a warning → flash the offending card".
const PULSE_KEYFRAMES = \`
@keyframes erd-card-pulse {
  0% { outline: 3px solid var(--color-warning); outline-offset: 2px; }
  100% { outline: 3px solid transparent; outline-offset: 12px; }
}\`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {
    height: '100%',
    minHeight: 0,
  },
  // Validation strip: wraps on desktop, single scrolling row on phones.
  warningStrip: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  warningStripCompact: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  // Canvas viewport: clips the panned surface; dot grid scrolls with pan.
  canvasViewport: {
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    minHeight: 0,
    cursor: 'grab',
    touchAction: 'none',
    backgroundColor: 'var(--color-background-body)',
    backgroundImage:
      'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  edgeLayer: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  // Zero-size translated origin; cards absolutely position from it.
  cardLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    overflow: 'visible',
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    backgroundColor: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: '0 1px 3px light-dark(rgba(0, 0, 0, 0.08), rgba(0, 0, 0, 0.35))',
  },
  cardSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
    zIndex: 2,
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    height: CARD_HEADER_HEIGHT,
    padding: '0 var(--spacing-3)',
    boxSizing: 'border-box',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container) var(--radius-container) 0 0',
    cursor: 'grab',
    touchAction: 'none',
    userSelect: 'none',
  },
  headerName: {
    minWidth: 0,
    flex: 1,
  },
  // Column rows are real buttons: tap to open the in-card editor.
  columnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    height: COLUMN_ROW_HEIGHT,
    padding: '0 var(--spacing-3)',
    boxSizing: 'border-box',
    border: 'none',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  columnRowActive: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  columnIconSlot: {
    display: 'inline-flex',
    width: 16,
    flexShrink: 0,
  },
  columnName: {
    minWidth: 0,
    flex: 1,
  },
  pkIcon: {color: 'var(--color-warning)', display: 'inline-flex'},
  fkIcon: {color: 'var(--color-accent)', display: 'inline-flex'},
  editorBody: {
    padding: 'var(--spacing-3)',
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  cardFooter: {
    padding: 'var(--spacing-2)',
    borderTop: '1px solid var(--color-border)',
  },
  panelCode: {
    minWidth: 0,
  },
  dialogBody: {paddingBottom: 'var(--spacing-2)'},
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

// ============= DATA =============
// Deterministic fixtures: fixed positions and ids, no clocks, no randomness.
// Column types are plain SQL strings so the type Selector, the mismatch
// check, and the DDL printer all share one vocabulary.

const COLUMN_TYPES = [
  'uuid',
  'text',
  'varchar(255)',
  'integer',
  'bigint',
  'numeric(10,2)',
  'boolean',
  'timestamptz',
  'date',
] as const;

const COLUMN_TYPE_OPTIONS = COLUMN_TYPES.map(type => ({
  value: type,
  label: type,
}));

interface SchemaColumn {
  id: string;
  name: string;
  type: string;
  isNullable: boolean;
  isPrimaryKey: boolean;
}

interface SchemaTable {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: SchemaColumn[];
}

/** FK edge keyed by column ids so renames never orphan a relationship. */
interface FkEdge {
  id: string;
  fromTable: string;
  fromColumnId: string;
  toTable: string;
  toColumnId: string;
}

// Seeded scenario: order_items ships without a primary key (classic
// junction-table omission) and orders.shipping_address_id is integer
// against addresses.id uuid — so the validation strip has two live
// warnings on load, both fixable in the column editor.
const INITIAL_TABLES: SchemaTable[] = [
  {
    id: 'users',
    name: 'users',
    x: 48,
    y: 40,
    columns: [
      {id: 'users_id', name: 'id', type: 'uuid', isNullable: false, isPrimaryKey: true},
      {id: 'users_email', name: 'email', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'users_full_name', name: 'full_name', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'users_created_at', name: 'created_at', type: 'timestamptz', isNullable: false, isPrimaryKey: false},
    ],
  },
  {
    id: 'addresses',
    name: 'addresses',
    x: 48,
    y: 340,
    columns: [
      {id: 'addresses_id', name: 'id', type: 'uuid', isNullable: false, isPrimaryKey: true},
      {id: 'addresses_user_id', name: 'user_id', type: 'uuid', isNullable: false, isPrimaryKey: false},
      {id: 'addresses_street', name: 'street', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'addresses_city', name: 'city', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'addresses_country', name: 'country', type: 'text', isNullable: true, isPrimaryKey: false},
    ],
  },
  {
    id: 'orders',
    name: 'orders',
    x: 420,
    y: 140,
    columns: [
      {id: 'orders_id', name: 'id', type: 'uuid', isNullable: false, isPrimaryKey: true},
      {id: 'orders_user_id', name: 'user_id', type: 'uuid', isNullable: false, isPrimaryKey: false},
      // Seeded FK type mismatch: integer against addresses.id uuid.
      {id: 'orders_shipping_address_id', name: 'shipping_address_id', type: 'integer', isNullable: true, isPrimaryKey: false},
      {id: 'orders_status', name: 'status', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'orders_total', name: 'total', type: 'numeric(10,2)', isNullable: false, isPrimaryKey: false},
      {id: 'orders_placed_at', name: 'placed_at', type: 'timestamptz', isNullable: false, isPrimaryKey: false},
    ],
  },
  {
    id: 'order_items',
    name: 'order_items',
    x: 792,
    y: 60,
    // Seeded missing primary key: toggling PK on order_id fixes it.
    columns: [
      {id: 'order_items_order_id', name: 'order_id', type: 'uuid', isNullable: false, isPrimaryKey: false},
      {id: 'order_items_product_id', name: 'product_id', type: 'uuid', isNullable: false, isPrimaryKey: false},
      {id: 'order_items_quantity', name: 'quantity', type: 'integer', isNullable: false, isPrimaryKey: false},
      {id: 'order_items_unit_price', name: 'unit_price', type: 'numeric(10,2)', isNullable: false, isPrimaryKey: false},
    ],
  },
  {
    id: 'products',
    name: 'products',
    x: 792,
    y: 360,
    columns: [
      {id: 'products_id', name: 'id', type: 'uuid', isNullable: false, isPrimaryKey: true},
      {id: 'products_sku', name: 'sku', type: 'varchar(255)', isNullable: false, isPrimaryKey: false},
      {id: 'products_name', name: 'name', type: 'text', isNullable: false, isPrimaryKey: false},
      {id: 'products_price', name: 'price', type: 'numeric(10,2)', isNullable: false, isPrimaryKey: false},
      {id: 'products_is_active', name: 'is_active', type: 'boolean', isNullable: false, isPrimaryKey: false},
    ],
  },
];

const INITIAL_EDGES: FkEdge[] = [
  {id: 'fk_orders_user', fromTable: 'orders', fromColumnId: 'orders_user_id', toTable: 'users', toColumnId: 'users_id'},
  {id: 'fk_addresses_user', fromTable: 'addresses', fromColumnId: 'addresses_user_id', toTable: 'users', toColumnId: 'users_id'},
  {id: 'fk_orders_address', fromTable: 'orders', fromColumnId: 'orders_shipping_address_id', toTable: 'addresses', toColumnId: 'addresses_id'},
  {id: 'fk_items_order', fromTable: 'order_items', fromColumnId: 'order_items_order_id', toTable: 'orders', toColumnId: 'orders_id'},
  {id: 'fk_items_product', fromTable: 'order_items', fromColumnId: 'order_items_product_id', toTable: 'products', toColumnId: 'products_id'},
];

// ============= DERIVATIONS =============

/** Pretty name for DDL and messages; blank names print as "unnamed". */
function printedName(column: SchemaColumn): string {
  const trimmed = column.name.trim();
  return trimmed === '' ? '"unnamed"' : trimmed;
}

function findColumn(
  tables: SchemaTable[],
  tableId: string,
  columnId: string,
): {table: SchemaTable; column: SchemaColumn} | null {
  const table = tables.find(entry => entry.id === tableId);
  const column = table?.columns.find(entry => entry.id === columnId);
  return table && column ? {table, column} : null;
}

type WarningKind =
  | 'missing_pk'
  | 'fk_mismatch'
  | 'duplicate_column'
  | 'unnamed_column';

interface SchemaWarning {
  id: string;
  kind: WarningKind;
  /** Card to select + pulse when the warning chip is clicked. */
  tableId: string;
  message: string;
}

/**
 * Pure derivation over the live tables/edges state. Re-runs on every edit,
 * so fixing a type in the editor removes its chip immediately — and
 * deleting a PK column or typing a duplicate name introduces one.
 */
function deriveWarnings(
  tables: SchemaTable[],
  edges: FkEdge[],
): SchemaWarning[] {
  const warnings: SchemaWarning[] = [];

  for (const table of tables) {
    if (!table.columns.some(column => column.isPrimaryKey)) {
      warnings.push({
        id: \`missing_pk:\${table.id}\`,
        kind: 'missing_pk',
        tableId: table.id,
        message: \`\${table.name} has no primary key\`,
      });
    }
    const seen = new Set<string>();
    const reported = new Set<string>();
    for (const column of table.columns) {
      const trimmed = column.name.trim();
      if (trimmed === '') {
        if (!reported.has('')) {
          reported.add('');
          warnings.push({
            id: \`unnamed_column:\${table.id}\`,
            kind: 'unnamed_column',
            tableId: table.id,
            message: \`\${table.name} has an unnamed column\`,
          });
        }
        continue;
      }
      if (seen.has(trimmed) && !reported.has(trimmed)) {
        reported.add(trimmed);
        warnings.push({
          id: \`duplicate_column:\${table.id}:\${trimmed}\`,
          kind: 'duplicate_column',
          tableId: table.id,
          message: \`\${table.name} has two "\${trimmed}" columns\`,
        });
      }
      seen.add(trimmed);
    }
  }

  for (const edge of edges) {
    const from = findColumn(tables, edge.fromTable, edge.fromColumnId);
    const to = findColumn(tables, edge.toTable, edge.toColumnId);
    if (!from || !to) {
      continue;
    }
    if (from.column.type !== to.column.type) {
      warnings.push({
        id: \`fk_mismatch:\${edge.id}\`,
        kind: 'fk_mismatch',
        tableId: edge.fromTable,
        message:
          \`\${from.table.name}.\${printedName(from.column)} (\${from.column.type}) → \` +
          \`\${to.table.name}.\${printedName(to.column)} (\${to.column.type}) type mismatch\`,
      });
    }
  }

  return warnings;
}

/** CREATE TABLE printer; re-derives from live state on every edit. */
function buildDdl(
  table: SchemaTable,
  tables: SchemaTable[],
  edges: FkEdge[],
  warnings: SchemaWarning[],
): string {
  const lines: string[] = [];
  for (const warning of warnings) {
    if (warning.tableId === table.id) {
      lines.push(\`-- WARNING: \${warning.message}\`);
    }
  }
  lines.push(\`CREATE TABLE \${table.name} (\`);

  const pad =
    Math.max(4, ...table.columns.map(column => printedName(column).length)) +
    2;
  const body: string[] = table.columns.map(
    column =>
      \`  \${printedName(column).padEnd(pad)}\${column.type}\` +
      \`\${column.isNullable ? '' : ' NOT NULL'}\`,
  );

  const pkColumns = table.columns.filter(column => column.isPrimaryKey);
  if (pkColumns.length > 0) {
    body.push(
      \`  CONSTRAINT \${table.name}_pkey PRIMARY KEY \` +
        \`(\${pkColumns.map(printedName).join(', ')})\`,
    );
  }
  for (const edge of edges) {
    if (edge.fromTable !== table.id) {
      continue;
    }
    const from = findColumn(tables, edge.fromTable, edge.fromColumnId);
    const to = findColumn(tables, edge.toTable, edge.toColumnId);
    if (!from || !to) {
      continue;
    }
    body.push(
      \`  CONSTRAINT \${table.name}_\${from.column.name.trim() || 'unnamed'}_fkey\` +
        \`\\n    FOREIGN KEY (\${printedName(from.column)})\` +
        \`\\n    REFERENCES \${to.table.name} (\${printedName(to.column)})\`,
    );
  }

  lines.push(body.join(',\\n'));
  lines.push(');');
  return lines.join('\\n');
}

/**
 * Edge anchor: card side at the vertical center of the column's row.
 * Rows have fixed heights and the editor renders below them, so anchors
 * stay exact while cards drag or a column is being edited.
 */
function columnAnchorY(table: SchemaTable, columnId: string): number {
  const index = table.columns.findIndex(column => column.id === columnId);
  if (index < 0) {
    return table.y + CARD_HEADER_HEIGHT / 2;
  }
  return (
    table.y +
    CARD_HEADER_HEIGHT +
    index * COLUMN_ROW_HEIGHT +
    COLUMN_ROW_HEIGHT / 2
  );
}

/** Horizontal bezier between two card sides, exits toward the target. */
function edgePath(from: SchemaTable, fromColumnId: string, to: SchemaTable, toColumnId: string): {d: string; x1: number; y1: number; x2: number; y2: number} {
  const exitRight = to.x + CARD_WIDTH / 2 >= from.x + CARD_WIDTH / 2;
  const x1 = exitRight ? from.x + CARD_WIDTH : from.x;
  const x2 = exitRight ? to.x : to.x + CARD_WIDTH;
  const y1 = columnAnchorY(from, fromColumnId);
  const y2 = columnAnchorY(to, toColumnId);
  const reach = Math.max(40, Math.abs(x2 - x1) / 2);
  const c1 = exitRight ? x1 + reach : x1 - reach;
  const c2 = exitRight ? x2 - reach : x2 + reach;
  return {d: \`M \${x1} \${y1} C \${c1} \${y1}, \${c2} \${y2}, \${x2} \${y2}\`, x1, y1, x2, y2};
}

/** Unique snake_case name for Add column: new_column, new_column_2, ... */
function nextColumnName(table: SchemaTable): string {
  const taken = new Set(table.columns.map(column => column.name.trim()));
  if (!taken.has('new_column')) {
    return 'new_column';
  }
  let suffix = 2;
  while (taken.has(\`new_column_\${suffix}\`)) {
    suffix += 1;
  }
  return \`new_column_\${suffix}\`;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// ============= COLUMN ROW =============

function ColumnRow({
  column,
  isForeignKey,
  isEditing,
  onOpen,
}: {
  column: SchemaColumn;
  isForeignKey: boolean;
  isEditing: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      style={
        isEditing
          ? {...styles.columnRow, ...styles.columnRowActive}
          : styles.columnRow
      }
      aria-label={\`Edit column \${printedName(column)}, \${column.type}\${
        column.isNullable ? ', nullable' : ', not null'
      }\${column.isPrimaryKey ? ', primary key' : ''}\${
        isForeignKey ? ', foreign key' : ''
      }\`}
      onClick={onOpen}>
      <span style={styles.columnIconSlot} aria-hidden>
        {column.isPrimaryKey ? (
          <span style={styles.pkIcon}>
            <Icon icon={KeyRoundIcon} size="sm" color="inherit" />
          </span>
        ) : isForeignKey ? (
          <span style={styles.fkIcon}>
            <Icon icon={LinkIcon} size="sm" color="inherit" />
          </span>
        ) : null}
      </span>
      <span style={styles.columnName}>
        <Text size="sm" maxLines={1}>
          {column.name.trim() === '' ? '(unnamed)' : column.name}
        </Text>
      </span>
      {/* ERD shorthand: \`type?\` marks a nullable column. */}
      <Text type="supporting" color="secondary">
        {column.type}
        {column.isNullable ? '?' : ''}
      </Text>
    </button>
  );
}

// ============= COLUMN EDITOR =============
// Renders in the card footer (below the rows) so row anchors never move.
// Every control commits immediately — the DDL panel and warning strip
// re-derive on each keystroke/toggle.

function ColumnEditor({
  column,
  nameError,
  isConfirmingDelete,
  onRename,
  onTypeChange,
  onNullableChange,
  onPrimaryKeyChange,
  onDelete,
  onClose,
}: {
  column: SchemaColumn;
  nameError: string | null;
  isConfirmingDelete: boolean;
  onRename: (name: string) => void;
  onTypeChange: (type: string) => void;
  onNullableChange: (isNullable: boolean) => void;
  onPrimaryKeyChange: (isPrimaryKey: boolean) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div style={styles.editorBody}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Edit column
            </Text>
          </StackItem>
          <IconButton
            label="Close column editor"
            tooltip="Close"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </HStack>
        <TextInput
          label="Column name"
          size="sm"
          value={column.name}
          onChange={onRename}
          hasAutoFocus
          onKeyDown={event => {
            if (event.key === 'Escape' || event.key === 'Enter') {
              onClose();
            }
          }}
          status={
            nameError ? {type: 'error', message: nameError} : undefined
          }
          width="100%"
        />
        <Selector
          label="Type"
          size="sm"
          options={COLUMN_TYPE_OPTIONS}
          value={column.type}
          onChange={onTypeChange}
          width="100%"
        />
        <Switch
          label="Nullable"
          value={column.isNullable}
          onChange={onNullableChange}
        />
        <Switch
          label="Primary key"
          value={column.isPrimaryKey}
          onChange={onPrimaryKeyChange}
        />
        <Button
          label={isConfirmingDelete ? 'Confirm delete' : 'Delete column'}
          variant={isConfirmingDelete ? 'destructive' : 'secondary'}
          size="sm"
          icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
          onClick={onDelete}
        />
      </VStack>
    </div>
  );
}

// ============= ENTITY CARD =============

function EntityCard({
  table,
  isSelected,
  isPulsing,
  foreignKeyColumnIds,
  editingColumnId,
  nameError,
  isConfirmingDelete,
  onSelect,
  onDragStart,
  onNudge,
  onOpenColumn,
  onRename,
  onTypeChange,
  onNullableChange,
  onPrimaryKeyChange,
  onDelete,
  onCloseEditor,
  onAddColumn,
}: {
  table: SchemaTable;
  isSelected: boolean;
  isPulsing: boolean;
  foreignKeyColumnIds: Set<string>;
  editingColumnId: string | null;
  nameError: string | null;
  isConfirmingDelete: boolean;
  onSelect: () => void;
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onNudge: (dx: number, dy: number) => void;
  onOpenColumn: (columnId: string) => void;
  onRename: (columnId: string, name: string) => void;
  onTypeChange: (columnId: string, type: string) => void;
  onNullableChange: (columnId: string, isNullable: boolean) => void;
  onPrimaryKeyChange: (columnId: string, isPrimaryKey: boolean) => void;
  onDelete: (columnId: string) => void;
  onCloseEditor: () => void;
  onAddColumn: () => void;
}) {
  const editingColumn =
    editingColumnId != null
      ? table.columns.find(column => column.id === editingColumnId) ?? null
      : null;

  const cardStyle: CSSProperties = {
    ...styles.card,
    left: table.x,
    top: table.y,
    ...(isSelected ? styles.cardSelected : null),
    ...(isPulsing
      ? {animation: 'erd-card-pulse 700ms ease-out 2'}
      : null),
  };

  return (
    <div style={cardStyle}>
      {/* Drag handle: pointer drag or arrow-key nudge; Enter selects. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={\`\${table.name} table. Drag to move, arrow keys nudge \${NUDGE_STEP}px, Enter selects.\`}
        style={styles.cardHeader}
        onPointerDown={onDragStart}
        onClick={onSelect}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
          } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            onNudge(-NUDGE_STEP, 0);
          } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            onNudge(NUDGE_STEP, 0);
          } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            onNudge(0, -NUDGE_STEP);
          } else if (event.key === 'ArrowDown') {
            event.preventDefault();
            onNudge(0, NUDGE_STEP);
          }
        }}>
        <Icon icon={Table2Icon} size="sm" />
        <span style={styles.headerName}>
          <Text type="label" maxLines={1}>
            {table.name}
          </Text>
        </span>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {table.columns.length}
        </Text>
      </div>

      <VStack gap={0}>
        {table.columns.map(column => (
          <ColumnRow
            key={column.id}
            column={column}
            isForeignKey={foreignKeyColumnIds.has(column.id)}
            isEditing={column.id === editingColumnId}
            onOpen={() => onOpenColumn(column.id)}
          />
        ))}
      </VStack>

      {editingColumn != null && (
        <ColumnEditor
          column={editingColumn}
          nameError={nameError}
          isConfirmingDelete={isConfirmingDelete}
          onRename={name => onRename(editingColumn.id, name)}
          onTypeChange={type => onTypeChange(editingColumn.id, type)}
          onNullableChange={isNullable =>
            onNullableChange(editingColumn.id, isNullable)
          }
          onPrimaryKeyChange={isPrimaryKey =>
            onPrimaryKeyChange(editingColumn.id, isPrimaryKey)
          }
          onDelete={() => onDelete(editingColumn.id)}
          onClose={onCloseEditor}
        />
      )}

      <div style={styles.cardFooter}>
        <Button
          label="Add column"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={onAddColumn}
        />
      </div>
    </div>
  );
}

// ============= EDGE LAYER =============

function RelationshipLines({
  tables,
  edges,
  warnings,
  selectedTableId,
  pan,
}: {
  tables: SchemaTable[];
  edges: FkEdge[];
  warnings: SchemaWarning[];
  selectedTableId: string;
  pan: {x: number; y: number};
}) {
  const tableById = new Map(tables.map(table => [table.id, table]));
  const mismatchEdgeIds = new Set(
    warnings
      .filter(warning => warning.kind === 'fk_mismatch')
      .map(warning => warning.id.slice('fk_mismatch:'.length)),
  );

  return (
    <svg style={styles.edgeLayer} aria-hidden>
      <defs>
        <marker
          id="erd-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
        </marker>
      </defs>
      <g transform={\`translate(\${pan.x} \${pan.y})\`}>
        {edges.map(edge => {
          const from = tableById.get(edge.fromTable);
          const to = tableById.get(edge.toTable);
          if (!from || !to) {
            return null;
          }
          const geometry = edgePath(
            from,
            edge.fromColumnId,
            to,
            edge.toColumnId,
          );
          const isMismatch = mismatchEdgeIds.has(edge.id);
          const touchesSelection =
            edge.fromTable === selectedTableId ||
            edge.toTable === selectedTableId;
          const stroke = isMismatch
            ? 'var(--color-error)'
            : touchesSelection
              ? 'var(--color-accent)'
              : 'var(--color-border-emphasized)';
          return (
            <g key={edge.id}>
              <path
                d={geometry.d}
                fill="none"
                stroke={stroke}
                strokeWidth={touchesSelection || isMismatch ? 2 : 1.5}
                strokeDasharray={isMismatch ? '6 4' : undefined}
                markerEnd="url(#erd-arrow)"
              />
              <circle
                cx={geometry.x1}
                cy={geometry.y1}
                r={3.5}
                fill={stroke}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ============= DDL PANEL =============

function DdlInspector({
  table,
  tables,
  edges,
  warnings,
  onSelectTable,
}: {
  table: SchemaTable;
  tables: SchemaTable[];
  edges: FkEdge[];
  warnings: SchemaWarning[];
  onSelectTable: (tableId: string) => void;
}) {
  const ddl = buildDdl(table, tables, edges, warnings);
  const pkCount = table.columns.filter(column => column.isPrimaryKey).length;
  const outgoing = edges.filter(edge => edge.fromTable === table.id);
  const incoming = edges.filter(edge => edge.toTable === table.id);
  const related = [...outgoing, ...incoming];
  const mismatchEdgeIds = new Set(
    warnings
      .filter(warning => warning.kind === 'fk_mismatch')
      .map(warning => warning.id.slice('fk_mismatch:'.length)),
  );

  const describeEdge = (edge: FkEdge): string => {
    const from = findColumn(tables, edge.fromTable, edge.fromColumnId);
    const to = findColumn(tables, edge.toTable, edge.toColumnId);
    if (!from || !to) {
      return edge.id;
    }
    return \`\${from.table.name}.\${printedName(from.column)} → \${to.table.name}.\${printedName(to.column)}\`;
  };

  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={Table2Icon} size="sm" />
          <Heading level={2}>{table.name}</Heading>
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {table.columns.length} columns ·{' '}
          {pkCount > 0 ? \`\${pkCount} in PK\` : 'no PK'} · {outgoing.length} FK
          out · {incoming.length} FK in
        </Text>
      </VStack>

      <Divider />

      <div style={styles.panelCode}>
        <CodeBlock
          code={ddl}
          language="sql"
          size="sm"
          width="100%"
          hasCopyButton
          isWrapped
        />
      </div>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Relationships
        </Text>
        {related.length === 0 ? (
          <Text type="supporting" color="secondary">
            No foreign keys touch this table yet.
          </Text>
        ) : (
          <List density="compact" hasDividers>
            {related.map(edge => {
              const isOutgoing = edge.fromTable === table.id;
              const otherTableId = isOutgoing ? edge.toTable : edge.fromTable;
              return (
                <ListItem
                  key={edge.id}
                  label={describeEdge(edge)}
                  description={isOutgoing ? 'outgoing' : 'incoming'}
                  startContent={
                    <span style={styles.fkIcon}>
                      <Icon icon={LinkIcon} size="sm" color="inherit" />
                    </span>
                  }
                  endContent={
                    mismatchEdgeIds.has(edge.id) ? (
                      <Badge variant="error" label="type mismatch" />
                    ) : undefined
                  }
                  onClick={() => onSelectTable(otherTableId)}
                />
              );
            })}
          </List>
        )}
        <Text type="supporting" color="secondary">
          Click a relationship to jump to the other table.
        </Text>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

interface DeletedColumnSnapshot {
  tableId: string;
  tableName: string;
  column: SchemaColumn;
  index: number;
  edges: FkEdge[];
}

type DragState =
  | {kind: 'card'; tableId: string; startX: number; startY: number; originX: number; originY: number}
  | {kind: 'pan'; startX: number; startY: number; originX: number; originY: number};

export default function SchemaDesignerErdTemplate() {
  const [tables, setTables] = useState<SchemaTable[]>(INITIAL_TABLES);
  const [edges, setEdges] = useState<FkEdge[]>(INITIAL_EDGES);
  const [selectedTableId, setSelectedTableId] = useState('orders');
  const [editing, setEditing] = useState<{
    tableId: string;
    columnId: string;
  } | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [lastDeleted, setLastDeleted] =
    useState<DeletedColumnSnapshot | null>(null);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [pulse, setPulse] = useState<{tableId: string; key: number} | null>(
    null,
  );
  const [isDdlDialogOpen, setIsDdlDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // Live pointer drags don't need re-renders per handler swap: capture the
  // press origin in a ref, move via pointer capture on the pressed element.
  const dragRef = useRef<DragState | null>(null);
  const columnCounter = useRef(100); // deterministic id source for new columns

  // Responsive contract: DDL panel docks >1100px; below that a SQL button
  // opens the same inspector in a Dialog. <=640px the header caption hides
  // and the warning strip becomes one horizontally scrolling row.
  const hasDdlPanel = !useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const warnings = useMemo(() => deriveWarnings(tables, edges), [tables, edges]);

  const foreignKeyColumnIds = useMemo(
    () => new Set(edges.map(edge => edge.fromColumnId)),
    [edges],
  );

  const selectedTable =
    tables.find(table => table.id === selectedTableId) ?? tables[0];

  // ----- selection + warning pulse -----

  const selectTable = (tableId: string) => {
    setSelectedTableId(tableId);
    if (editing != null && editing.tableId !== tableId) {
      setEditing(null);
      setIsConfirmingDelete(false);
    }
  };

  const pulseTable = (tableId: string) => {
    setPulse(prev => ({tableId, key: (prev?.key ?? 0) + 1}));
  };

  const handleWarningClick = (warning: SchemaWarning) => {
    selectTable(warning.tableId);
    pulseTable(warning.tableId);
    const table = tables.find(entry => entry.id === warning.tableId);
    setAnnouncement(\`Selected \${table?.name ?? warning.tableId}: \${warning.message}.\`);
  };

  // ----- drag: cards + canvas pan -----

  const startCardDrag = (
    tableId: string,
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    const table = tables.find(entry => entry.id === tableId);
    if (!table) {
      return;
    }
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: 'card',
      tableId,
      startX: event.clientX,
      startY: event.clientY,
      originX: table.x,
      originY: table.y,
    };
    selectTable(tableId);
  };

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    // Only empty canvas pans; presses on cards are handled upstream.
    if (event.target !== event.currentTarget) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      kind: 'pan',
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) {
      return;
    }
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (drag.kind === 'pan') {
      setPan({x: drag.originX + dx, y: drag.originY + dy});
      return;
    }
    const x = clamp(drag.originX + dx, 0, CANVAS_EXTENT_X);
    const y = clamp(drag.originY + dy, 0, CANVAS_EXTENT_Y);
    setTables(prev =>
      prev.map(table =>
        table.id === drag.tableId ? {...table, x, y} : table,
      ),
    );
  };

  const endDrag = () => {
    dragRef.current = null;
  };

  const nudgeTable = (tableId: string, dx: number, dy: number) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? {
              ...table,
              x: clamp(table.x + dx, 0, CANVAS_EXTENT_X),
              y: clamp(table.y + dy, 0, CANVAS_EXTENT_Y),
            }
          : table,
      ),
    );
  };

  // ----- column edits (all commit immediately; DDL re-derives) -----

  const openColumnEditor = (tableId: string, columnId: string) => {
    selectTable(tableId);
    setEditing(prev =>
      prev?.tableId === tableId && prev.columnId === columnId
        ? null
        : {tableId, columnId},
    );
    setIsConfirmingDelete(false);
  };

  const patchColumn = (
    tableId: string,
    columnId: string,
    patch: Partial<SchemaColumn>,
  ) => {
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.map(column =>
                column.id === columnId ? {...column, ...patch} : column,
              ),
            }
          : table,
      ),
    );
  };

  const editingNameError = useMemo(() => {
    if (editing == null) {
      return null;
    }
    const found = findColumn(tables, editing.tableId, editing.columnId);
    if (!found) {
      return null;
    }
    const trimmed = found.column.name.trim();
    if (trimmed === '') {
      return 'Column name is required.';
    }
    const duplicate = found.table.columns.some(
      column => column.id !== found.column.id && column.name.trim() === trimmed,
    );
    return duplicate ? \`"\${trimmed}" is already used in this table.\` : null;
  }, [editing, tables]);

  const addColumn = (tableId: string) => {
    const table = tables.find(entry => entry.id === tableId);
    if (!table) {
      return;
    }
    columnCounter.current += 1;
    const column: SchemaColumn = {
      id: \`col_\${columnCounter.current}\`,
      name: nextColumnName(table),
      type: 'text',
      isNullable: true,
      isPrimaryKey: false,
    };
    setTables(prev =>
      prev.map(entry =>
        entry.id === tableId
          ? {...entry, columns: [...entry.columns, column]}
          : entry,
      ),
    );
    selectTable(tableId);
    setEditing({tableId, columnId: column.id});
    setIsConfirmingDelete(false);
    setAnnouncement(\`Added \${column.name} to \${table.name}.\`);
  };

  // Two-step destructive action: first press arms Confirm delete, second
  // press removes the column plus any FK edges through it and offers Undo.
  const deleteColumn = (tableId: string, columnId: string) => {
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    const found = findColumn(tables, tableId, columnId);
    if (!found) {
      return;
    }
    const index = found.table.columns.findIndex(
      column => column.id === columnId,
    );
    const droppedEdges = edges.filter(
      edge => edge.fromColumnId === columnId || edge.toColumnId === columnId,
    );
    setTables(prev =>
      prev.map(table =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.filter(column => column.id !== columnId),
            }
          : table,
      ),
    );
    setEdges(prev =>
      prev.filter(
        edge =>
          edge.fromColumnId !== columnId && edge.toColumnId !== columnId,
      ),
    );
    setLastDeleted({
      tableId,
      tableName: found.table.name,
      column: found.column,
      index,
      edges: droppedEdges,
    });
    setEditing(null);
    setIsConfirmingDelete(false);
    setAnnouncement(
      \`Deleted \${printedName(found.column)} from \${found.table.name}. Undo available.\`,
    );
  };

  const undoDelete = () => {
    const snapshot = lastDeleted;
    if (!snapshot) {
      return;
    }
    setTables(prev =>
      prev.map(table => {
        if (table.id !== snapshot.tableId) {
          return table;
        }
        const columns = [...table.columns];
        columns.splice(
          clamp(snapshot.index, 0, columns.length),
          0,
          snapshot.column,
        );
        return {...table, columns};
      }),
    );
    setEdges(prev => [...prev, ...snapshot.edges]);
    setLastDeleted(null);
    setAnnouncement(
      \`Restored \${printedName(snapshot.column)} to \${snapshot.tableName}.\`,
    );
  };

  // ----- render -----

  const isPanned = pan.x !== 0 || pan.y !== 0;

  const inspector = (
    <DdlInspector
      table={selectedTable}
      tables={tables}
      edges={edges}
      warnings={warnings}
      onSelectTable={tableId => {
        selectTable(tableId);
        pulseTable(tableId);
      }}
    />
  );

  // <=1100px the end panel is hidden; the SQL button opens the same
  // inspector content in a Dialog.
  const ddlDialog = !hasDdlPanel && (
    <Dialog
      isOpen={isDdlDialogOpen}
      onOpenChange={setIsDdlDialogOpen}
      purpose="info"
      width="min(560px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Generated DDL"
          subtitle={selectedTable.name}
          onOpenChange={setIsDdlDialogOpen}
        />
        {inspector}
      </VStack>
    </Dialog>
  );

  return (
    <>
      <style>{PULSE_KEYFRAMES}</style>
      {ddlDialog}
      <div aria-live="polite" style={styles.visuallyHidden}>
        {announcement}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <Icon icon={DatabaseIcon} size="sm" />
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Schema Designer</Heading>
                  {/* <=640px: the caption cedes its width to the actions. */}
                  {!isCompact && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {tables.length} tables · {edges.length} relationships
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <Tooltip
                content={
                  warnings.length > 0
                    ? warnings.map(warning => warning.message).join(' · ')
                    : 'No schema issues detected'
                }>
                <Badge
                  variant={warnings.length > 0 ? 'error' : 'success'}
                  label={
                    warnings.length > 0
                      ? \`\${warnings.length} \${
                          warnings.length === 1 ? 'issue' : 'issues'
                        }\`
                      : 'valid'
                  }
                />
              </Tooltip>
              {isPanned && (
                <IconButton
                  label="Reset view"
                  tooltip="Reset view"
                  icon={<Icon icon={CrosshairIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setPan({x: 0, y: 0})}
                />
              )}
              {!hasDdlPanel && (
                <Button
                  label="SQL"
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={CodeIcon} size="sm" color="inherit" />}
                  onClick={() => setIsDdlDialogOpen(true)}
                />
              )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <VStack gap={0} style={styles.contentFill}>
              {/* Validation strip: chips select + pulse the offending card. */}
              <HStack
                gap={2}
                vAlign="center"
                style={
                  isCompact ? styles.warningStripCompact : styles.warningStrip
                }>
                {warnings.length === 0 ? (
                  <HStack gap={2} vAlign="center">
                    <StatusDot variant="success" label="Schema valid" />
                    <Text type="supporting" color="secondary">
                      No schema issues — every FK matches and each table has
                      a primary key.
                    </Text>
                  </HStack>
                ) : (
                  warnings.map(warning => (
                    <Button
                      key={warning.id}
                      label={warning.message}
                      variant="ghost"
                      size="sm"
                      icon={
                        <span style={{color: 'var(--color-warning)', display: 'inline-flex'}}>
                          <Icon
                            icon={TriangleAlertIcon}
                            size="sm"
                            color="inherit"
                          />
                        </span>
                      }
                      onClick={() => handleWarningClick(warning)}
                    />
                  ))
                )}
                {lastDeleted != null && (
                  <Button
                    label={\`Undo delete \${printedName(lastDeleted.column)}\`}
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                    onClick={undoDelete}
                  />
                )}
              </HStack>
              <Divider />
              <StackItem size="fill">
                <div
                  style={{
                    ...styles.canvasViewport,
                    backgroundPosition: \`\${pan.x}px \${pan.y}px\`,
                  }}
                  onPointerDown={startPan}
                  onPointerMove={handlePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}>
                  <RelationshipLines
                    tables={tables}
                    edges={edges}
                    warnings={warnings}
                    selectedTableId={selectedTableId}
                    pan={pan}
                  />
                  <div
                    style={{
                      ...styles.cardLayer,
                      transform: \`translate(\${pan.x}px, \${pan.y}px)\`,
                    }}>
                    {tables.map(table => (
                      <EntityCard
                        // pulse.key in the key restarts the CSS animation.
                        key={
                          pulse?.tableId === table.id
                            ? \`\${table.id}:\${pulse.key}\`
                            : table.id
                        }
                        table={table}
                        isSelected={table.id === selectedTableId}
                        isPulsing={pulse?.tableId === table.id}
                        foreignKeyColumnIds={foreignKeyColumnIds}
                        editingColumnId={
                          editing?.tableId === table.id
                            ? editing.columnId
                            : null
                        }
                        nameError={
                          editing?.tableId === table.id
                            ? editingNameError
                            : null
                        }
                        isConfirmingDelete={
                          editing?.tableId === table.id && isConfirmingDelete
                        }
                        onSelect={() => selectTable(table.id)}
                        onDragStart={event => startCardDrag(table.id, event)}
                        onNudge={(dx, dy) => nudgeTable(table.id, dx, dy)}
                        onOpenColumn={columnId =>
                          openColumnEditor(table.id, columnId)
                        }
                        onRename={(columnId, name) =>
                          patchColumn(table.id, columnId, {name})
                        }
                        onTypeChange={(columnId, type) =>
                          patchColumn(table.id, columnId, {type})
                        }
                        onNullableChange={(columnId, isNullable) =>
                          patchColumn(table.id, columnId, {isNullable})
                        }
                        onPrimaryKeyChange={(columnId, isPrimaryKey) =>
                          patchColumn(table.id, columnId, {isPrimaryKey})
                        }
                        onDelete={columnId =>
                          deleteColumn(table.id, columnId)
                        }
                        onCloseEditor={() => {
                          setEditing(null);
                          setIsConfirmingDelete(false);
                        }}
                        onAddColumn={() => addColumn(table.id)}
                      />
                    ))}
                  </div>
                </div>
              </StackItem>
            </VStack>
          </LayoutContent>
        }
        end={
          hasDdlPanel ? (
            <LayoutPanel width={360} label="Generated DDL">
              {inspector}
            </LayoutPanel>
          ) : undefined
        }
      />
    </>
  );
}
`;export{e as default};