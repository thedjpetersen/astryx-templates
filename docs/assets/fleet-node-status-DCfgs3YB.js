var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (48 agent nodes across five owners with
 *   fixed heartbeat offsets from a frozen refresh instant, version
 *   distribution counts, and per-user health rollups)
 * @output Fleet-availability console for connected agent nodes: header with
 *   a Grid|Table|Users SegmentedControl and Refresh Button; a filter band
 *   with search TextInput, clickable status-count ToggleButtons, platform
 *   Token chips, mono version-distribution chips, and a pinned legend row;
 *   the main region swaps between a GitHub-style density grid of 12px
 *   status squares (each with a HoverCard instance tooltip, one pinned open
 *   in the fixture), a full detail Table (StatusDot, mono node id with type
 *   Tokens, version, last seen, uptime, SSE check/cross), and a per-user
 *   rollup with 96px stacked health bars and tinted instance chips sorted
 *   worst-first
 * @position Page template; emitted by \`astryx template fleet-node-status\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title +
 * fleet caption, view SegmentedControl, Refresh). LayoutContent scrolls a
 * centered max-width-1280 column: filter band on top, then the active view.
 * The unit here is a homogeneous fleet — a density grid with drill-down
 * table beats KPI widgets (dashboard-filterable / operations-dashboard).
 *
 * Responsive contract:
 * - Content column: maxWidth 1280, centered; the whole column scrolls.
 * - Header row flex-wraps: when the title plus view SegmentedControl and
 *   Refresh no longer fit on one line, the controls drop below the title.
 * - Filter bands (search + status toggles, platform + version chips,
 *   legend) flex-wrap onto multiple lines instead of compressing.
 * - >720px: header caption shows node count, refresh age, and window;
 *   grid squares are 12px and open their HoverCard on hover/focus.
 * - <=720px: header caption collapses to the node count only; grid
 *   squares grow to 40px tap targets and the density caption says "tap".
 * - Table: horizontal scroll below ~900px (overflow-x wrapper; pixel
 *   columns keep their width, the node column keeps a 200px floor).
 * - Grid squares wrap to fill the row at every breakpoint.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  RefreshCwIcon,
  SearchIcon,
  ServerIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered scrollable column; LayoutContent owns the scrolling.
  column: {
    maxWidth: 1280,
    marginInline: 'auto',
    width: '100%',
  },
  headerRow: {flexWrap: 'wrap'},
  filterRow: {flexWrap: 'wrap'},
  searchBox: {width: 280, maxWidth: '100%'},
  chipRow: {flexWrap: 'wrap'},
  legendRow: {flexWrap: 'wrap'},
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
    flexShrink: 0,
  },
  countDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    display: 'inline-block',
  },
  // Density grid: bordered panel of flex-wrapped 12px squares.
  gridPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
  },
  squareWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 3,
  },
  square: {
    width: 12,
    height: 12,
    borderRadius: 3,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'block',
  },
  // <=720px: each square grows to a full-size tap target.
  squareCompact: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  hoverBody: {padding: 'var(--spacing-3)'},
  // Table view: horizontal scroll below ~900px; pixel columns keep width.
  tableScroll: {overflowX: 'auto'},
  // Users view: 96px stacked health bar, tinted instance chips.
  healthBar: {
    display: 'flex',
    width: 96,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  userChips: {flexWrap: 'wrap'},
  sseIcon: {display: 'inline-flex'},
};

// ============= DATA =============
// Deterministic fixtures: every heartbeat is a fixed offset from a frozen
// refresh instant — no clocks, no randomness, no network assets.

type NodeStatus = 'online' | 'degraded' | 'offline';
type Platform = 'devvm' | 'devgpu' | 'od' | 'mac';
type SseState = 'connected' | 'disconnected' | 'none';

interface TypeChip {
  label: string;
  color: 'purple' | 'cyan';
}

interface FleetNode extends Record<string, unknown> {
  id: string;
  user: string;
  platform: Platform;
  status: NodeStatus;
  version: string;
  lastSeenLabel: string;
  lastSeenAt: string; // fixed ISO timestamp
  uptime: string;
  sse: SseState;
  typeChip?: TypeChip;
}

// Frozen refresh instant; the header caption's "refreshed 12s ago" is
// static copy against the same instant.
const REFRESHED_AT_MS = Date.parse('2026-07-01T17:30:00Z');
const FLEET_SIZE = 48;

function agoLabel(seconds: number): string {
  return seconds < 60 ? \`\${seconds}s ago\` : \`\${Math.round(seconds / 60)}m ago\`;
}

// [id, platform, status, version, heartbeat seconds ago, uptime, typeChip?]
type NodeSpec = [string, Platform, NodeStatus, string, number, string, TypeChip?];

function buildNodes(user: string, specs: NodeSpec[]): FleetNode[] {
  return specs.map(([id, platform, status, version, seconds, uptime, chip]) => ({
    id,
    user,
    platform,
    status,
    version,
    lastSeenLabel: agoLabel(seconds),
    lastSeenAt: new Date(REFRESHED_AT_MS - seconds * 1000).toISOString(),
    uptime,
    // Degraded nodes still inside the 2-minute grace window keep their SSE
    // stream; older degraded nodes have dropped it. Offline nodes have none.
    sse:
      status === 'online'
        ? 'connected'
        : status === 'offline'
          ? 'none'
          : seconds < 120
            ? 'connected'
            : 'disconnected',
    ...(chip != null ? {typeChip: chip} : null),
  }));
}

// 48 nodes: 38 online / 6 degraded / 4 offline.
// Versions: 1.42.3 x22 (46%), 1.42.1 x16 (33%), 1.41.0 x10 (21%).
const FLEET: FleetNode[] = [
  // jchen@ — 14 nodes, 13 online (93% healthy).
  ...buildNodes('jchen', [
    ['devvm2183.prn0', 'devvm', 'online', '1.42.3', 34, '6d 4h'],
    ['devvm2201.prn0', 'devvm', 'online', '1.42.3', 21, '6d 4h'],
    ['devvm2207.prn0', 'devvm', 'online', '1.42.3', 45, '3d 11h'],
    ['devvm2214.prn0', 'devvm', 'online', '1.42.1', 12, '11d 2h'],
    ['devvm2226.prn0', 'devvm', 'online', '1.42.1', 52, '2d 19h'],
    ['devvm2231.prn0', 'devvm', 'online', '1.41.0', 38, '19d 6h'],
    ['devgpu0018.ftw3', 'devgpu', 'online', '1.42.3', 26, '4d 1h'],
    ['devgpu0023.ftw3', 'devgpu', 'degraded', '1.42.3', 95, '1d 8h'],
    ['devgpu0041.ftw3', 'devgpu', 'online', '1.42.1', 18, '5d 22h'],
    ['od-4402', 'od', 'online', '1.42.3', 41, '8d 3h'],
    ['od-4403', 'od', 'online', '1.42.3', 29, '8d 3h'],
    ['od-4406', 'od', 'online', '1.42.1', 55, '1d 2h'],
    ['od-4412', 'od', 'online', '1.41.0', 47, '27d 14h'],
    [
      'mbp-jchen',
      'mac',
      'online',
      '1.42.3',
      16,
      '9h 12m',
      {label: 'browser: Main Chrome', color: 'purple'},
    ],
  ]),
  // mpark@ — 11 nodes, 9 online (82% healthy).
  ...buildNodes('mpark', [
    ['devvm2240.prn0', 'devvm', 'online', '1.42.3', 23, '5d 7h'],
    ['devvm2244.prn0', 'devvm', 'online', '1.42.3', 49, '5d 7h'],
    ['devvm2251.prn0', 'devvm', 'online', '1.42.1', 31, '2d 3h'],
    ['devvm2258.prn0', 'devvm', 'degraded', '1.42.1', 130, '14h 6m'],
    ['devvm2263.prn0', 'devvm', 'online', '1.41.0', 44, '21d 9h'],
    ['devgpu0102.ftw3', 'devgpu', 'online', '1.42.3', 27, '3d 15h'],
    ['devgpu0107.ftw3', 'devgpu', 'online', '1.42.1', 53, '3d 15h'],
    ['od-4420', 'od', 'online', '1.42.3', 19, '6d 12h'],
    ['od-4421', 'od', 'online', '1.42.1', 37, '6d 12h'],
    ['od-4425', 'od', 'offline', '1.41.0', 780, '—'],
    ['mbp-mpark', 'mac', 'online', '1.42.3', 25, '2d 1h'],
  ]),
  // drivera@ — 9 nodes, 6 online (67% healthy; worst-first sort demo).
  ...buildNodes('drivera', [
    ['devvm2270.prn0', 'devvm', 'online', '1.42.3', 33, '4d 18h'],
    ['devvm2274.prn0', 'devvm', 'online', '1.42.3', 57, '4d 18h'],
    ['devvm2281.prn0', 'devvm', 'online', '1.42.1', 24, '1d 20h'],
    ['devvm2288.prn0', 'devvm', 'degraded', '1.42.1', 110, '7h 41m'],
    ['devgpu0071.ftw3', 'devgpu', 'degraded', '1.42.3', 240, '2d 14h'],
    ['devgpu0076.ftw3', 'devgpu', 'online', '1.41.0', 48, '16d 2h'],
    ['od-4413', 'od', 'offline', '1.41.0', 720, '—'],
    ['od-4431', 'od', 'online', '1.42.1', 39, '9d 5h'],
    ['mbp-drivera', 'mac', 'online', '1.42.3', 15, '5h 58m'],
  ]),
  // aokafor@ — 8 nodes, 6 online (75% healthy).
  ...buildNodes('aokafor', [
    ['devvm2290.prn0', 'devvm', 'online', '1.42.3', 36, '3d 2h'],
    ['devvm2295.prn0', 'devvm', 'online', '1.42.1', 51, '3d 2h'],
    ['devvm2302.prn0', 'devvm', 'online', '1.41.0', 28, '24d 11h'],
    ['devgpu0110.ftw3', 'devgpu', 'degraded', '1.42.3', 150, '1d 3h'],
    ['od-4437', 'od', 'online', '1.42.1', 43, '7d 8h'],
    ['od-4440', 'od', 'offline', '1.41.0', 900, '—'],
    ['mbp-aokafor', 'mac', 'online', '1.42.3', 22, '11h 44m'],
    ['mm-aokafor', 'mac', 'online', '1.42.1', 58, '13d 19h'],
  ]),
  // tnguyen@ — 6 nodes, 4 online (67% healthy).
  ...buildNodes('tnguyen', [
    ['devvm2310.prn0', 'devvm', 'online', '1.42.3', 30, '2d 9h'],
    ['devvm2311.prn0', 'devvm', 'online', '1.42.1', 46, '2d 9h'],
    ['od-4444', 'od', 'offline', '1.41.0', 840, '—'],
    [
      'mbp-tnguyen',
      'mac',
      'online',
      '1.42.3',
      17,
      '8h 27m',
      {label: 'computer', color: 'cyan'},
    ],
    ['mba-tnguyen', 'mac', 'degraded', '1.42.1', 100, '3h 12m'],
    ['mm-tnguyen', 'mac', 'online', '1.41.0', 54, '31d 7h'],
  ]),
];

const STATUS_ORDER: NodeStatus[] = ['online', 'degraded', 'offline'];

const STATUS_LABEL: Record<NodeStatus, string> = {
  online: 'Online',
  degraded: 'Degraded',
  offline: 'Offline',
};

const STATUS_DOT: Record<NodeStatus, 'success' | 'warning' | 'error'> = {
  online: 'success',
  degraded: 'warning',
  offline: 'error',
};

const STATUS_COLOR: Record<NodeStatus, string> = {
  online: 'var(--color-success)',
  degraded: 'var(--color-warning)',
  offline: 'var(--color-error)',
};

const STATUS_TOKEN: Record<NodeStatus, 'green' | 'yellow' | 'red'> = {
  online: 'green',
  degraded: 'yellow',
  offline: 'red',
};

// Legend copy pins the exact status semantics the squares encode.
const LEGEND: Array<{status: NodeStatus; text: string}> = [
  {status: 'online', text: 'Online (heartbeat <60s, SSE connected)'},
  {status: 'degraded', text: 'Degraded (grace period or SSE disconnected)'},
  {status: 'offline', text: 'Offline (no heartbeat >2min)'},
];

const PLATFORM_LABEL: Record<Platform, string> = {
  devvm: 'DevVM',
  devgpu: 'DevGPU',
  od: 'OD',
  mac: 'Mac',
};

const PLATFORMS: Platform[] = ['devvm', 'devgpu', 'od', 'mac'];

const STATUS_COUNTS: Record<NodeStatus, number> = {
  online: FLEET.filter(node => node.status === 'online').length,
  degraded: FLEET.filter(node => node.status === 'degraded').length,
  offline: FLEET.filter(node => node.status === 'offline').length,
};

const PLATFORM_COUNTS: Record<Platform, number> = {
  devvm: FLEET.filter(node => node.platform === 'devvm').length,
  devgpu: FLEET.filter(node => node.platform === 'devgpu').length,
  od: FLEET.filter(node => node.platform === 'od').length,
  mac: FLEET.filter(node => node.platform === 'mac').length,
};

const VERSIONS = ['1.42.3', '1.42.1', '1.41.0'].map(version => {
  const count = FLEET.filter(node => node.version === version).length;
  return {
    version,
    count,
    pct: Math.round((count / FLEET.length) * 100),
  };
});

// The grid fixture pins this node's HoverCard open on first paint.
const PINNED_NODE_ID = 'devvm2183.prn0';

// ============= HOVER CONTENT =============

function NodeHoverContent({node}: {node: FleetNode}) {
  return (
    <div style={styles.hoverBody}>
      <VStack gap={2}>
        <Text type="code" size="sm">
          {node.id}
        </Text>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={STATUS_DOT[node.status]}
            label={STATUS_LABEL[node.status]}
          />
          <Text type="supporting">{STATUS_LABEL[node.status]}</Text>
          {node.typeChip != null && (
            <Token
              size="sm"
              color={node.typeChip.color}
              label={node.typeChip.label}
            />
          )}
        </HStack>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {node.user} · {node.version} · {node.lastSeenLabel}
        </Text>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            Last heartbeat
          </Text>
          <Timestamp
            value={node.lastSeenAt}
            format="time"
            type="supporting"
            color="secondary"
          />
        </HStack>
      </VStack>
    </div>
  );
}

// ============= GRID VIEW =============

function StatusSquare({
  node,
  isPinned,
  isCompact,
}: {
  node: FleetNode;
  isPinned: boolean;
  isCompact: boolean;
}) {
  return (
    <HoverCard
      content={<NodeHoverContent node={node} />}
      placement="above"
      hasHoverIndication={false}
      isDefaultOpen={isPinned}>
      <button
        type="button"
        aria-label={\`\${node.id} — \${STATUS_LABEL[node.status]}\`}
        style={{
          ...styles.square,
          ...(isCompact ? styles.squareCompact : null),
          backgroundColor: STATUS_COLOR[node.status],
        }}
      />
    </HoverCard>
  );
}

function GridView({
  nodes,
  isCompact,
}: {
  nodes: FleetNode[];
  isCompact: boolean;
}) {
  return (
    <div style={styles.gridPanel}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Fleet density
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {nodes.length} nodes ·{' '}
            {isCompact ? 'tap' : 'hover'} a square for instance detail
          </Text>
        </HStack>
        <div style={styles.squareWrap}>
          {nodes.map(node => (
            <StatusSquare
              key={node.id}
              node={node}
              isPinned={node.id === PINNED_NODE_ID}
              isCompact={isCompact}
            />
          ))}
        </div>
      </VStack>
    </div>
  );
}

// ============= TABLE VIEW =============

function SseCell({node}: {node: FleetNode}) {
  if (node.sse === 'none') {
    return (
      <Text type="supporting" color="secondary">
        —
      </Text>
    );
  }
  const isConnected = node.sse === 'connected';
  return (
    <Tooltip content={isConnected ? 'SSE connected' : 'SSE disconnected'}>
      <span
        aria-label={isConnected ? 'SSE connected' : 'SSE disconnected'}
        style={{
          ...styles.sseIcon,
          color: isConnected ? 'var(--color-success)' : 'var(--color-error)',
        }}>
        <Text type="supporting" color="inherit" weight="semibold">
          {isConnected ? '✓' : '✗'}
        </Text>
      </span>
    </Tooltip>
  );
}

const tableColumns: TableColumn<FleetNode>[] = [
  {
    key: 'status',
    header: 'Status',
    width: pixel(110),
    renderCell: (node: FleetNode) => (
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={STATUS_DOT[node.status]}
          label={STATUS_LABEL[node.status]}
        />
        <Text type="supporting">{STATUS_LABEL[node.status]}</Text>
      </HStack>
    ),
  },
  {
    key: 'user',
    header: 'User',
    width: pixel(100),
    renderCell: (node: FleetNode) => (
      <Text type="code" size="sm">
        {node.user}@
      </Text>
    ),
  },
  {
    key: 'id',
    header: 'Node',
    width: proportional(2, {minWidth: 200}),
    renderCell: (node: FleetNode) => (
      <HStack gap={2} vAlign="center">
        <Text type="code" size="sm">
          {node.id}
        </Text>
        {node.typeChip != null && (
          <Token
            size="sm"
            color={node.typeChip.color}
            label={node.typeChip.label}
          />
        )}
      </HStack>
    ),
  },
  {
    key: 'version',
    header: 'Version',
    width: pixel(90),
    renderCell: (node: FleetNode) => (
      <Text type="code" size="sm">
        {node.version}
      </Text>
    ),
  },
  {
    key: 'lastSeenLabel',
    header: 'Last Seen',
    width: pixel(100),
    renderCell: (node: FleetNode) => (
      <Text type="supporting" hasTabularNumbers>
        {node.lastSeenLabel}
      </Text>
    ),
  },
  {
    key: 'uptime',
    header: 'Uptime',
    width: pixel(100),
    renderCell: (node: FleetNode) => (
      <Text type="supporting" hasTabularNumbers>
        {node.uptime}
      </Text>
    ),
  },
  {
    key: 'sse',
    header: 'SSE',
    width: pixel(64),
    align: 'center',
    renderCell: (node: FleetNode) => <SseCell node={node} />,
  },
];

function TableView({nodes}: {nodes: FleetNode[]}) {
  return (
    <div style={styles.tableScroll}>
      <Table<FleetNode>
        data={nodes}
        columns={tableColumns}
        idKey="id"
        density="compact"
        dividers="rows"
        hasHover
      />
    </div>
  );
}

// ============= USERS VIEW =============

interface UserRollup {
  user: string;
  nodes: FleetNode[];
  online: number;
  degraded: number;
  offline: number;
  pct: number;
}

function rollupUsers(nodes: FleetNode[]): UserRollup[] {
  const byUser = new Map<string, FleetNode[]>();
  for (const node of nodes) {
    const list = byUser.get(node.user) ?? [];
    list.push(node);
    byUser.set(node.user, list);
  }
  const rollups: UserRollup[] = [...byUser.entries()].map(([user, list]) => {
    const online = list.filter(node => node.status === 'online').length;
    const degraded = list.filter(node => node.status === 'degraded').length;
    const offline = list.filter(node => node.status === 'offline').length;
    return {
      user,
      nodes: list,
      online,
      degraded,
      offline,
      pct: Math.round((online / list.length) * 100),
    };
  });
  // Worst-first: lowest healthy % on top; more unhealthy nodes breaks ties.
  rollups.sort(
    (a, b) =>
      a.pct - b.pct ||
      b.degraded + b.offline - (a.degraded + a.offline) ||
      a.user.localeCompare(b.user),
  );
  return rollups;
}

function healthVariant(pct: number): 'success' | 'warning' | 'error' {
  return pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'error';
}

function HealthBar({rollup}: {rollup: UserRollup}) {
  const segments: Array<{status: NodeStatus; count: number}> = STATUS_ORDER.map(
    status => ({
      status,
      count:
        status === 'online'
          ? rollup.online
          : status === 'degraded'
            ? rollup.degraded
            : rollup.offline,
    }),
  ).filter(segment => segment.count > 0);
  const summary = segments
    .map(segment => \`\${segment.count} \${STATUS_LABEL[segment.status].toLowerCase()}\`)
    .join(', ');
  return (
    <div style={styles.healthBar} role="img" aria-label={summary}>
      {segments.map(segment => (
        <div
          key={segment.status}
          style={{
            flex: \`\${segment.count} 0 0\`,
            backgroundColor: STATUS_COLOR[segment.status],
          }}
        />
      ))}
    </div>
  );
}

function UserRow({rollup}: {rollup: UserRollup}) {
  return (
    <VStack gap={2}>
      <HStack gap={3} vAlign="center" style={styles.filterRow}>
        <Text type="code" size="sm">
          {rollup.user}@
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {rollup.nodes.length} nodes
        </Text>
        <HealthBar rollup={rollup} />
        <Badge variant={healthVariant(rollup.pct)} label={\`\${rollup.pct}%\`} />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {rollup.online} online · {rollup.degraded} degraded ·{' '}
          {rollup.offline} offline
        </Text>
      </HStack>
      <HStack gap={1} style={styles.userChips}>
        {rollup.nodes.map(node => (
          <Token
            key={node.id}
            size="sm"
            color={STATUS_TOKEN[node.status]}
            label={node.id}
            description={\`\${STATUS_LABEL[node.status]} · \${node.lastSeenLabel}\`}
          />
        ))}
      </HStack>
    </VStack>
  );
}

function UsersView({nodes}: {nodes: FleetNode[]}) {
  const rollups = rollupUsers(nodes);
  return (
    <VStack gap={4}>
      {rollups.map((rollup, index) => (
        <VStack gap={4} key={rollup.user}>
          <UserRow rollup={rollup} />
          {index < rollups.length - 1 && <Divider />}
        </VStack>
      ))}
    </VStack>
  );
}

// ============= PAGE =============

export default function FleetNodeStatusTemplate() {
  const [view, setView] = useState('grid');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<NodeStatus | 'all'>('all');
  const [platformFilter, setPlatformFilter] = useState<Platform | null>(null);
  const [versionFilter, setVersionFilter] = useState<string | null>(null);

  const isCompact = useMediaQuery('(max-width: 720px)');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return FLEET.filter(node => {
      if (statusFilter !== 'all' && node.status !== statusFilter) {
        return false;
      }
      if (platformFilter != null && node.platform !== platformFilter) {
        return false;
      }
      if (versionFilter != null && node.version !== versionFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return (
        node.id.toLowerCase().includes(needle) ||
        node.user.toLowerCase().includes(needle) ||
        node.version.includes(needle)
      );
    });
  }, [query, statusFilter, platformFilter, versionFilter]);

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('all');
    setPlatformFilter(null);
    setVersionFilter(null);
  };

  const statusToggle = (status: NodeStatus): ReactNode => (
    <ToggleButton
      key={status}
      label={\`\${STATUS_LABEL[status]} — \${STATUS_COUNTS[status]} nodes\`}
      size="sm"
      isPressed={statusFilter === status}
      onPressedChange={isPressed =>
        setStatusFilter(isPressed ? status : 'all')
      }>
      <HStack gap={1} vAlign="center">
        <span
          style={{...styles.countDot, backgroundColor: STATUS_COLOR[status]}}
          aria-hidden
        />
        <Text type="inherit" hasTabularNumbers>
          {STATUS_COUNTS[status]}
        </Text>
      </HStack>
    </ToggleButton>
  );

  const emptyState = (
    <EmptyState
      title="No nodes match"
      description="Clear the search or relax the status, platform, and version filters."
      icon={<Icon icon={ServerIcon} size="lg" />}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Node Availability</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {isCompact
                    ? \`\${FLEET_SIZE} nodes\`
                    : \`\${FLEET_SIZE} nodes · refreshed 12s ago · last 7 days\`}
                </Text>
              </VStack>
            </StackItem>
            <SegmentedControl
              label="Fleet view"
              value={view}
              onChange={setView}
              size="sm">
              <SegmentedControlItem label="Grid" value="grid" />
              <SegmentedControlItem label="Table" value="table" />
              <SegmentedControlItem label="Users" value="users" />
            </SegmentedControl>
            <Button
              label="Refresh"
              variant="secondary"
              size="sm"
              icon={<Icon icon={RefreshCwIcon} size="sm" />}
              onClick={() => {}}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* Filter band: search + status counts. */}
              <HStack gap={3} vAlign="center" style={styles.filterRow}>
                <div style={styles.searchBox}>
                  <TextInput
                    label="Search nodes"
                    isLabelHidden
                    size="sm"
                    placeholder="Search id, user, or version..."
                    startIcon={SearchIcon}
                    value={query}
                    onChange={setQuery}
                  />
                </div>
                <HStack gap={1} vAlign="center">
                  <ToggleButton
                    label={\`All — \${FLEET_SIZE} nodes\`}
                    size="sm"
                    isPressed={statusFilter === 'all'}
                    onPressedChange={() => setStatusFilter('all')}>
                    All {FLEET_SIZE}
                  </ToggleButton>
                  {STATUS_ORDER.map(statusToggle)}
                </HStack>
                <StackItem size="fill" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {filtered.length} of {FLEET_SIZE} shown
                </Text>
              </HStack>

              {/* Platform chips + mono version-distribution chips. */}
              <HStack gap={2} vAlign="center" style={styles.chipRow}>
                <Text type="label" size="sm" color="secondary">
                  Platform
                </Text>
                {PLATFORMS.map(platform => (
                  <Token
                    key={platform}
                    size="sm"
                    color={platformFilter === platform ? 'blue' : 'default'}
                    label={\`\${PLATFORM_LABEL[platform]} · \${PLATFORM_COUNTS[platform]}\`}
                    onClick={() =>
                      setPlatformFilter(prev =>
                        prev === platform ? null : platform,
                      )
                    }
                  />
                ))}
                <Text type="label" size="sm" color="secondary">
                  Version
                </Text>
                {VERSIONS.map(entry => (
                  <ToggleButton
                    key={entry.version}
                    label={\`Version \${entry.version} — \${entry.count} nodes (\${entry.pct}%)\`}
                    size="sm"
                    isPressed={versionFilter === entry.version}
                    onPressedChange={isPressed =>
                      setVersionFilter(isPressed ? entry.version : null)
                    }>
                    <Text type="code" size="sm" hasTabularNumbers>
                      {entry.version} — {entry.count} ({entry.pct}%)
                    </Text>
                  </ToggleButton>
                ))}
              </HStack>

              {/* Legend row pins exact status semantics. */}
              <HStack gap={4} vAlign="center" style={styles.legendRow}>
                {LEGEND.map(entry => (
                  <HStack gap={2} vAlign="center" key={entry.status}>
                    <span
                      style={{
                        ...styles.legendSwatch,
                        backgroundColor: STATUS_COLOR[entry.status],
                      }}
                      aria-hidden
                    />
                    <Text type="supporting" color="secondary">
                      {entry.text}
                    </Text>
                  </HStack>
                ))}
              </HStack>

              <Divider />

              {/* Main region swaps by view. */}
              {filtered.length === 0 ? (
                <VStack gap={3}>
                  {emptyState}
                  <HStack gap={2} hAlign="center">
                    <Button
                      label="Clear filters"
                      variant="secondary"
                      size="sm"
                      onClick={clearFilters}
                    />
                  </HStack>
                </VStack>
              ) : view === 'grid' ? (
                <GridView nodes={filtered} isCompact={isCompact} />
              ) : view === 'table' ? (
                <TableView nodes={filtered} />
              ) : (
                <UsersView nodes={filtered} />
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};