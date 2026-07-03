// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file service-blast-radius.tsx
 * @input Deterministic fixtures only (21 services across edge/API/core/data/
 *   infra tiers with hand-authored canvas coordinates, RPS, and user-facing
 *   flags; 29 directed dependency edges marked hard or soft; two mitigation
 *   definitions that reroute named edges through a cache tier or a fallback
 *   replica; three preset outage scenarios that set kill switches and
 *   mitigations to fixed values)
 * @output Service-graph blast-radius sandbox: a pannable SVG dependency
 *   canvas where flipping any node's kill switch runs a deterministic BFS
 *   over the edges — hard-down services shade solid alarm tint, degraded
 *   ones get an SVG hatch pattern, and the failure ripples outward one BFS
 *   wave at a time under Play / Step / Rewind controls so cause-to-effect
 *   order is legible as motion. Mitigation toggles (serve catalog from
 *   cache, fail over to the orders replica) reroute specific edges along
 *   dash-animated alternate paths and visibly shrink the recomputed impact.
 *   Edge direction reads through mid-path chevrons; hovering, focusing, or
 *   selecting a node highlights its complete upstream and downstream
 *   chains. The side panel tallies affected user-facing surfaces and lost
 *   RPS, and lists the full dependency chain of the selected node; a
 *   scenario Selector loads three preset outage stories
 * @position Page template; emitted by `astryx template service-blast-radius`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * "21 services · 29 edges" caption, scenario Selector). LayoutContent stacks
 * the propagation toolbar (Play/Step/Rewind + wave readout + clear) over the
 * pan viewport that clips the fixed 1192×660 canvas. LayoutPanel end 340
 * hosts the impact tally, mitigations, and selected-service detail.
 *
 * Responsive contract:
 * - >1024px: header | toolbar + canvas (fill) | impact panel 340. The canvas
 *   keeps its intrinsic drawing size and pans by pointer drag (with capture)
 *   or arrow keys on the focused viewport — never squashed nodes.
 * - <=1024px: the end panel leaves the frame and becomes a bottom sheet
 *   docked inside the content area; a 40px handle button expands/collapses
 *   it and a one-line summary (down · degraded · RPS at risk) stays visible
 *   while collapsed.
 * - <=640px: the header caption and toolbar hint drop so controls fit;
 *   toolbar buttons keep >=40px tap heights. Node buttons are 60px tall by
 *   construction. The pan viewport is the single deliberate overflow region;
 *   page chrome never pans. No hover-only affordances: chain highlighting
 *   also runs on focus and on selection, and every pointer gesture (canvas
 *   pan) has an equivalent keyboard path committing the same pan state.
 *
 * Container policy (explorable-sandbox archetype): frame-first rows and
 * panels, no Cards. The graph is one SVG of cubic edges with mid-path
 * chevrons under plain 60px button nodes at fixture coordinates — no layout
 * algorithm, no chart library. Propagation state is a pure function of
 * (kill switches, mitigations, visible wave); playback is a setInterval
 * advancing the wave index only. No Date.now, no Math.random.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token or a
 * color-mix() over tokens — status tints, hatch strokes, and reroute dashes
 * hold their alarm semantics in both light and dark schemes.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

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
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ActivityIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MousePointerClickIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  StepForwardIcon,
} from 'lucide-react';

// ============= GEOMETRY =============
// Every node position is hand-authored in the fixture (tier columns run
// left to right); there is no layout algorithm. The canvas keeps this
// intrinsic size at every breakpoint and pans instead of squashing.

const NODE_W = 168;
const NODE_H = 60; // >=40px tap target by construction
const CANVAS_W = 1192;
const CANVAS_H = 660;
const PAN_MARGIN = 120; // keep at least this much canvas on screen
const KEY_PAN_STEP = 60;
const WAVE_INTERVAL_MS = 700;

// ============= KEYFRAMES =============
// Reroute dashes flow along the alternate path; newly revealed nodes pulse
// once per wave step. prefers-reduced-motion turns both off — the Step
// control is the non-animated equivalent of Play.

const GLOBAL_CSS = `
@keyframes sbr-dash-flow {
  to { stroke-dashoffset: -20; }
}
@keyframes sbr-wave-pulse {
  0% {
    box-shadow: 0 0 0 8px
      color-mix(in srgb, var(--color-icon-red) 40%, transparent);
  }
  100% {
    box-shadow: 0 0 0 0
      color-mix(in srgb, var(--color-icon-red) 0%, transparent);
  }
}
.sbr-reroute-edge {
  animation: sbr-dash-flow 900ms linear infinite;
}
.sbr-wave-pulse {
  animation: sbr-wave-pulse 650ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .sbr-reroute-edge,
  .sbr-wave-pulse {
    animation: none;
  }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {height: '100%', minHeight: 0},
  headerRow: {width: '100%', flexWrap: 'wrap'},
  scenarioSelect: {minWidth: 200},
  toolbar: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  toolbarButton: {minHeight: 40},
  // The single deliberate overflow region: a clipped viewport panned by
  // pointer drag (with capture) or arrow keys when focused.
  viewport: {
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
  stage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_W,
    height: CANVAS_H,
  },
  edgeSvg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  // One service node: a 60px bordered button colored by visible status.
  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    padding: '0 var(--spacing-2)',
    overflow: 'hidden',
    borderRadius: 'var(--radius-container)',
    borderWidth: 2,
    borderStyle: 'solid',
    backgroundColor: 'var(--color-background-card)',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'var(--color-text-primary)',
    transition: 'background-color 240ms ease, border-color 240ms ease',
  },
  nodeSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  nodeDimmed: {opacity: 0.35},
  nodeTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minWidth: 0,
    position: 'relative',
    zIndex: 1,
  },
  nodeCaption: {position: 'relative', zIndex: 1},
  nodeSwatch: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  nodeName: {minWidth: 0},
  // Degraded services carry the SVG hatch as an overlay rect; the pattern
  // is defined once in the edge SVG's <defs> and referenced by id.
  hatchOverlay: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },
  mitigationRow: {minHeight: 40},
  chainList: {maxHeight: 220, overflowY: 'auto'},
  // <=1024px: the impact panel docks as a bottom sheet inside the content
  // area. The 40px handle button is the expand/collapse path.
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  sheetExpanded: {height: '58%'},
  sheetHandleRow: {
    padding: 'var(--spacing-1) var(--spacing-3)',
    minHeight: 48,
  },
  sheetBody: {
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-1)',
  },
  panelBody: {
    padding: 'var(--spacing-3)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed coordinates, RPS, and edges. No clocks,
// no randomness; playback only advances an index into computed BFS waves.

type Tier = 'edge' | 'api' | 'core' | 'data' | 'infra';
type EdgeKind = 'hard' | 'soft';
type NodeStatus = 'ok' | 'degraded' | 'down';

interface ServiceNode {
  id: string;
  name: string;
  tier: Tier;
  rps: number;
  userFacing: boolean;
  x: number;
  y: number;
}

interface DependencyEdge {
  id: string;
  /** The dependent service (caller). */
  from: string;
  /** The dependency it calls. */
  to: string;
  /** hard: dependency down → caller down. soft: caller degrades only. */
  kind: EdgeKind;
}

interface Mitigation {
  id: string;
  label: string;
  description: string;
  /** Each named edge is rerouted to `via` and softened while active. */
  reroutes: Array<{edgeId: string; via: string}>;
}

interface Scenario {
  id: string;
  label: string;
  kills: string[];
  mitigations: string[];
  story: string;
}

const TIER_META: Record<Tier, {label: string; badge: BadgeVariant}> = {
  edge: {label: 'Edge', badge: 'blue'},
  api: {label: 'API', badge: 'purple'},
  core: {label: 'Core', badge: 'orange'},
  data: {label: 'Data', badge: 'neutral'},
  infra: {label: 'Infra', badge: 'neutral'},
};

// Tier columns: edge 24 | api 268 | core 512 | data 756 | infra 1000.
const NODES: ServiceNode[] = [
  // Edge tier: the user-facing surfaces the tally panel watches.
  {id: 'web-storefront', name: 'Web Storefront', tier: 'edge', rps: 8400, userFacing: true, x: 24, y: 36},
  {id: 'mobile-app', name: 'Mobile App', tier: 'edge', rps: 6200, userFacing: true, x: 24, y: 140},
  {id: 'checkout-web', name: 'Checkout Web', tier: 'edge', rps: 2100, userFacing: true, x: 24, y: 244},
  {id: 'partner-api', name: 'Partner API', tier: 'edge', rps: 940, userFacing: true, x: 24, y: 348},
  {id: 'admin-portal', name: 'Admin Portal', tier: 'edge', rps: 160, userFacing: true, x: 24, y: 452},
  // API tier.
  {id: 'api-gateway', name: 'API Gateway', tier: 'api', rps: 17400, userFacing: false, x: 268, y: 88},
  {id: 'graphql-bff', name: 'GraphQL BFF', tier: 'api', rps: 11800, userFacing: false, x: 268, y: 192},
  {id: 'checkout-api', name: 'Checkout API', tier: 'api', rps: 2400, userFacing: false, x: 268, y: 296},
  {id: 'admin-api', name: 'Admin API', tier: 'api', rps: 210, userFacing: false, x: 268, y: 452},
  // Core services.
  {id: 'catalog-svc', name: 'Catalog Service', tier: 'core', rps: 9600, userFacing: false, x: 512, y: 36},
  {id: 'search-svc', name: 'Search Service', tier: 'core', rps: 4300, userFacing: false, x: 512, y: 140},
  {id: 'cart-svc', name: 'Cart Service', tier: 'core', rps: 3100, userFacing: false, x: 512, y: 244},
  {id: 'payment-svc', name: 'Payment Service', tier: 'core', rps: 1150, userFacing: false, x: 512, y: 348},
  {id: 'auth-svc', name: 'Auth Service', tier: 'core', rps: 15200, userFacing: false, x: 512, y: 500},
  // Data tier.
  {id: 'catalog-db', name: 'Catalog DB', tier: 'data', rps: 7200, userFacing: false, x: 756, y: 36},
  {id: 'search-index', name: 'Search Index', tier: 'data', rps: 3900, userFacing: false, x: 756, y: 140},
  {id: 'redis-cache', name: 'Redis Cache', tier: 'data', rps: 21400, userFacing: false, x: 756, y: 244},
  {id: 'orders-db', name: 'Orders DB', tier: 'data', rps: 2600, userFacing: false, x: 756, y: 348},
  {id: 'orders-db-replica', name: 'Orders Replica', tier: 'data', rps: 480, userFacing: false, x: 756, y: 452},
  {id: 'auth-db', name: 'Auth DB', tier: 'data', rps: 5100, userFacing: false, x: 756, y: 556},
  // Infra tier.
  {id: 'psp-gateway', name: 'PSP Gateway', tier: 'infra', rps: 620, userFacing: false, x: 1000, y: 348},
];

const NODE_BY_ID = new Map(NODES.map(node => [node.id, node]));

const EDGES: DependencyEdge[] = [
  // Surfaces → APIs.
  {id: 'e01', from: 'web-storefront', to: 'api-gateway', kind: 'hard'},
  {id: 'e02', from: 'web-storefront', to: 'graphql-bff', kind: 'hard'},
  {id: 'e03', from: 'mobile-app', to: 'api-gateway', kind: 'hard'},
  {id: 'e04', from: 'mobile-app', to: 'graphql-bff', kind: 'hard'},
  {id: 'e05', from: 'checkout-web', to: 'api-gateway', kind: 'hard'},
  {id: 'e06', from: 'checkout-web', to: 'checkout-api', kind: 'hard'},
  {id: 'e07', from: 'partner-api', to: 'api-gateway', kind: 'hard'},
  {id: 'e08', from: 'admin-portal', to: 'admin-api', kind: 'hard'},
  // APIs → core services.
  {id: 'e09', from: 'api-gateway', to: 'auth-svc', kind: 'hard'},
  {id: 'e10', from: 'graphql-bff', to: 'catalog-svc', kind: 'hard'},
  {id: 'e11', from: 'graphql-bff', to: 'search-svc', kind: 'soft'},
  {id: 'e12', from: 'graphql-bff', to: 'cart-svc', kind: 'soft'},
  {id: 'e13', from: 'graphql-bff', to: 'auth-svc', kind: 'hard'},
  {id: 'e14', from: 'checkout-api', to: 'cart-svc', kind: 'hard'},
  {id: 'e15', from: 'checkout-api', to: 'payment-svc', kind: 'hard'},
  {id: 'e16', from: 'checkout-api', to: 'auth-svc', kind: 'hard'},
  {id: 'e17', from: 'admin-api', to: 'catalog-svc', kind: 'hard'},
  {id: 'e18', from: 'admin-api', to: 'auth-svc', kind: 'hard'},
  {id: 'e19', from: 'admin-api', to: 'orders-db', kind: 'hard'},
  // Core → data / infra.
  {id: 'e20', from: 'catalog-svc', to: 'catalog-db', kind: 'hard'},
  {id: 'e21', from: 'catalog-svc', to: 'redis-cache', kind: 'soft'},
  {id: 'e22', from: 'search-svc', to: 'search-index', kind: 'hard'},
  {id: 'e23', from: 'search-svc', to: 'redis-cache', kind: 'soft'},
  {id: 'e24', from: 'cart-svc', to: 'redis-cache', kind: 'hard'},
  {id: 'e25', from: 'payment-svc', to: 'orders-db', kind: 'hard'},
  {id: 'e26', from: 'payment-svc', to: 'psp-gateway', kind: 'hard'},
  {id: 'e27', from: 'auth-svc', to: 'auth-db', kind: 'hard'},
  {id: 'e28', from: 'auth-svc', to: 'redis-cache', kind: 'soft'},
  // Replication: the replica degrades (stale) when the primary is down.
  {id: 'e29', from: 'orders-db-replica', to: 'orders-db', kind: 'soft'},
];

const MITIGATIONS: Mitigation[] = [
  {
    id: 'cache-serve',
    label: 'Serve catalog from cache',
    description:
      'Catalog reads fall back to Redis — stale but alive, so a Catalog ' +
      'DB outage degrades browsing instead of downing it.',
    reroutes: [{edgeId: 'e20', via: 'redis-cache'}],
  },
  {
    id: 'orders-replica',
    label: 'Fail over to orders replica',
    description:
      'Payment and Admin reads move to the read replica. Checkout runs ' +
      'read-only (degraded) while the primary is gone.',
    reroutes: [
      {edgeId: 'e25', via: 'orders-db-replica'},
      {edgeId: 'e19', via: 'orders-db-replica'},
    ],
  },
];

const SCENARIOS: Scenario[] = [
  {
    id: 'catalog-db-loss',
    label: 'Catalog DB failure',
    kills: ['catalog-db'],
    mitigations: [],
    story:
      'A bad migration locks the Catalog DB. Watch the failure climb ' +
      'through Catalog Service into both BFF-backed storefronts — then ' +
      'flip “Serve catalog from cache” to shrink the blast radius.',
  },
  {
    id: 'cache-stampede',
    label: 'Cache stampede',
    kills: ['redis-cache'],
    mitigations: [],
    story:
      'Redis falls over under a stampede. Carts are hard-down (they live ' +
      'in the cache); catalog, search, and auth only degrade because their ' +
      'cache edges are soft. Note how far a shared tier reaches.',
  },
  {
    id: 'orders-failover',
    label: 'Orders primary failover',
    kills: ['orders-db'],
    mitigations: ['orders-replica'],
    story:
      'The Orders primary is gone, but the replica failover is already ' +
      'live: checkout degrades to read-only instead of going dark. Toggle ' +
      'the mitigation off to see the unmitigated outage.',
  },
];

const SCENARIO_OPTIONS = [
  {value: 'custom', label: 'Custom what-if'},
  ...SCENARIOS.map(scenario => ({value: scenario.id, label: scenario.label})),
];

// ============= PROPAGATION =============
// Pure, deterministic BFS. Status severity only ever worsens per round;
// a node's wave is the round in which it first became affected, which is
// what the Play/Step controls replay.

const SEVERITY: Record<NodeStatus, number> = {ok: 0, degraded: 1, down: 2};

interface EffectiveEdge {
  id: string;
  from: string;
  to: string;
  kind: EdgeKind;
  isRerouted: boolean;
  originalTo: string;
}

interface ImpactEntry {
  status: NodeStatus;
  wave: number;
}

function effectiveEdgesFor(
  activeMitigations: ReadonlySet<string>,
): EffectiveEdge[] {
  const rerouteByEdge = new Map<string, string>();
  for (const mitigation of MITIGATIONS) {
    if (activeMitigations.has(mitigation.id)) {
      for (const reroute of mitigation.reroutes) {
        rerouteByEdge.set(reroute.edgeId, reroute.via);
      }
    }
  }
  return EDGES.map(edge => {
    const via = rerouteByEdge.get(edge.id);
    return {
      id: edge.id,
      from: edge.from,
      to: via ?? edge.to,
      // Rerouted paths are best-effort fallbacks: never better than soft.
      kind: via != null ? 'soft' : edge.kind,
      isRerouted: via != null,
      originalTo: edge.to,
    };
  });
}

function computeImpact(
  kills: ReadonlySet<string>,
  activeMitigations: ReadonlySet<string>,
): {impact: Map<string, ImpactEntry>; maxWave: number} {
  const edges = effectiveEdgesFor(activeMitigations);
  const outEdges = new Map<string, EffectiveEdge[]>();
  for (const edge of edges) {
    const list = outEdges.get(edge.from) ?? [];
    list.push(edge);
    outEdges.set(edge.from, list);
  }

  const impact = new Map<string, ImpactEntry>();
  for (const id of kills) {
    impact.set(id, {status: 'down', wave: 0});
  }

  let maxWave = 0;
  for (let wave = 1; wave <= NODES.length; wave++) {
    let changed = false;
    for (const node of NODES) {
      if (kills.has(node.id)) {
        continue;
      }
      let derived: NodeStatus = 'ok';
      for (const edge of outEdges.get(node.id) ?? []) {
        const dep = impact.get(edge.to);
        if (dep == null) {
          continue;
        }
        if (dep.status === 'down' && edge.kind === 'hard') {
          derived = 'down';
        } else if (dep.status !== 'ok' && derived === 'ok') {
          derived = 'degraded';
        }
      }
      const current = impact.get(node.id);
      if (SEVERITY[derived] > SEVERITY[current?.status ?? 'ok']) {
        // Keep the wave a node first became affected; only severity moves.
        impact.set(node.id, {status: derived, wave: current?.wave ?? wave});
        maxWave = Math.max(maxWave, current?.wave ?? wave);
        changed = true;
      }
    }
    if (!changed) {
      break;
    }
  }
  return {impact, maxWave};
}

/** Transitive closure along effective edges, in BFS order. */
function chainFrom(
  startId: string,
  edges: EffectiveEdge[],
  direction: 'deps' | 'dependents',
): string[] {
  const out: string[] = [];
  const seen = new Set<string>([startId]);
  const queue = [startId];
  while (queue.length > 0) {
    const id = queue.shift() as string;
    for (const edge of edges) {
      const next =
        direction === 'deps'
          ? edge.from === id
            ? edge.to
            : null
          : edge.to === id
            ? edge.from
            : null;
      if (next != null && !seen.has(next)) {
        seen.add(next);
        out.push(next);
        queue.push(next);
      }
    }
  }
  return out;
}

// ============= FORMAT HELPERS =============

function formatRps(rps: number): string {
  return rps >= 1000
    ? `${(rps / 1000).toFixed(1).replace(/\.0$/, '')}k`
    : String(rps);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

const STATUS_META: Record<
  NodeStatus,
  {label: string; dot: 'success' | 'warning' | 'error'; badge: BadgeVariant}
> = {
  ok: {label: 'healthy', dot: 'success', badge: 'success'},
  degraded: {label: 'degraded', dot: 'warning', badge: 'warning'},
  down: {label: 'down', dot: 'error', badge: 'error'},
};

// Node paint per visible status — all tokens or color-mix over tokens.
const NODE_PAINT: Record<
  NodeStatus | 'killed',
  {border: string; background: string}
> = {
  ok: {
    border: 'var(--color-border)',
    background: 'var(--color-background-card)',
  },
  degraded: {
    border: 'var(--color-icon-orange)',
    background:
      'color-mix(in srgb, var(--color-icon-orange) 10%, var(--color-background-card))',
  },
  down: {
    border: 'var(--color-icon-red)',
    background:
      'color-mix(in srgb, var(--color-icon-red) 20%, var(--color-background-card))',
  },
  killed: {
    border: 'var(--color-icon-red)',
    background:
      'color-mix(in srgb, var(--color-icon-red) 32%, var(--color-background-card))',
  },
};

const EDGE_STROKE: Record<NodeStatus, string> = {
  ok: 'var(--color-border-emphasized)',
  degraded: 'var(--color-icon-orange)',
  down: 'var(--color-icon-red)',
};

// ============= BEZIER HELPERS =============
// Mid-path chevrons need a point + tangent halfway along each cubic, so
// hover thickening never touches an end marker.

interface Cubic {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
}

function cubicFor(from: ServiceNode, to: ServiceNode, yShift = 0): Cubic {
  if (from.x === to.x) {
    // Same-column edge (replica → primary): a vertical connector between
    // the facing node edges.
    const x = from.x + NODE_W / 2;
    const fromAbove = from.y < to.y;
    const y0 = fromAbove ? from.y + NODE_H : from.y;
    const y3 = fromAbove ? to.y : to.y + NODE_H;
    const midY = (y0 + y3) / 2;
    return {x0: x, y0, x1: x, y1: midY, x2: x, y2: midY, x3: x, y3};
  }
  const x0 = from.x + NODE_W;
  const y0 = from.y + NODE_H / 2 + yShift;
  const x3 = to.x;
  const y3 = to.y + NODE_H / 2 + yShift;
  const midX = (x0 + x3) / 2;
  return {x0, y0, x1: midX, y1: y0, x2: midX, y2: y3, x3, y3};
}

function cubicPath(c: Cubic): string {
  return `M ${c.x0} ${c.y0} C ${c.x1} ${c.y1}, ${c.x2} ${c.y2}, ${c.x3} ${c.y3}`;
}

function cubicAt(c: Cubic, t: number): {x: number; y: number; angle: number} {
  const u = 1 - t;
  const x =
    u * u * u * c.x0 + 3 * u * u * t * c.x1 + 3 * u * t * t * c.x2 + t * t * t * c.x3;
  const y =
    u * u * u * c.y0 + 3 * u * u * t * c.y1 + 3 * u * t * t * c.y2 + t * t * t * c.y3;
  const dx =
    3 * u * u * (c.x1 - c.x0) + 6 * u * t * (c.x2 - c.x1) + 3 * t * t * (c.x3 - c.x2);
  const dy =
    3 * u * u * (c.y1 - c.y0) + 6 * u * t * (c.y2 - c.y1) + 3 * t * t * (c.y3 - c.y2);
  return {x, y, angle: (Math.atan2(dy, dx) * 180) / Math.PI};
}

// ============= EDGE LAYER =============

/**
 * One SVG under the node buttons: the hatch pattern definition, every
 * dependency edge as a cubic with a mid-path chevron pointing at the
 * dependency, and dash-animated accent paths for active reroutes. Edge
 * stroke takes the *dependency's* visible status so failures read at the
 * source of the arrow; chain-highlighted edges thicken.
 */
function EdgeLayer({
  edges,
  statusOf,
  chainSet,
  hasFocus,
}: {
  edges: EffectiveEdge[];
  statusOf: (id: string) => NodeStatus;
  chainSet: ReadonlySet<string> | null;
  hasFocus: boolean;
}) {
  return (
    <svg
      width={CANVAS_W}
      height={CANVAS_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      style={styles.edgeSvg}
      aria-hidden
      focusable={false}>
      <defs>
        {/* Degraded hatch: token stroke so it holds up in both schemes. */}
        <pattern
          id="sbr-hatch"
          width={7}
          height={7}
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)">
          <line
            x1={0}
            y1={0}
            x2={0}
            y2={7}
            stroke="var(--color-icon-orange)"
            strokeWidth={2.5}
            opacity={0.4}
          />
        </pattern>
      </defs>
      {edges.map(edge => {
        const from = NODE_BY_ID.get(edge.from);
        const to = NODE_BY_ID.get(edge.to);
        const originalTo = NODE_BY_ID.get(edge.originalTo);
        if (from == null || to == null || originalTo == null) {
          return null;
        }
        const onChain =
          chainSet != null && chainSet.has(edge.from) && chainSet.has(edge.to);
        const dimmed = hasFocus && !onChain;
        const stroke = edge.isRerouted
          ? 'var(--color-accent)'
          : EDGE_STROKE[statusOf(edge.to)];
        const cubic = cubicFor(from, to, edge.isRerouted ? 10 : 0);
        const mid = cubicAt(cubic, 0.5);
        const width = onChain ? 3.5 : 2;
        return (
          <g key={edge.id} opacity={dimmed ? 0.15 : 1}>
            {edge.isRerouted && (
              // The bypassed original path stays as a faint ghost so the
              // reroute reads as a detour, not a deleted dependency.
              <path
                d={cubicPath(cubicFor(from, originalTo))}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth={1.5}
                strokeDasharray="2 5"
                opacity={0.5}
              />
            )}
            <path
              className={edge.isRerouted ? 'sbr-reroute-edge' : undefined}
              d={cubicPath(cubic)}
              fill="none"
              stroke={stroke}
              strokeWidth={edge.isRerouted ? width + 0.5 : width}
              strokeDasharray={edge.isRerouted ? '8 6' : undefined}
              opacity={edge.kind === 'soft' && !edge.isRerouted ? 0.65 : 0.9}
            />
            {/* Mid-path chevron: direction without end markers, so hover
                thickening of the path stays crisp. */}
            <path
              d="M -6 -5 L 4 0 L -6 5"
              fill="none"
              stroke={stroke}
              strokeWidth={width}
              strokeLinecap="round"
              strokeLinejoin="round"
              transform={`translate(${mid.x} ${mid.y}) rotate(${mid.angle})`}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ============= SERVICE NODE =============

function ServiceNodeButton({
  node,
  status,
  isKilled,
  isSelected,
  isDimmed,
  isJustRevealed,
  onSelect,
  onHover,
}: {
  node: ServiceNode;
  status: NodeStatus;
  isKilled: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isJustRevealed: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}) {
  const paint = NODE_PAINT[isKilled ? 'killed' : status];
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      className={isJustRevealed && status !== 'ok' ? 'sbr-wave-pulse' : undefined}
      style={{
        ...styles.node,
        left: node.x,
        top: node.y,
        borderColor: paint.border,
        backgroundColor: paint.background,
        ...(isSelected ? styles.nodeSelected : undefined),
        ...(isDimmed ? styles.nodeDimmed : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={`${node.name}, ${TIER_META[node.tier].label} tier, ${
        isKilled ? 'kill switch on' : meta.label
      }, ${formatRps(node.rps)} RPS`}
      onClick={() => onSelect(node.id)}
      onMouseEnter={() => onHover(node.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(node.id)}
      onBlur={() => onHover(null)}>
      {status === 'degraded' && !isKilled && (
        // SVG hatch fill referencing the pattern defined in the edge layer.
        <svg style={styles.hatchOverlay} aria-hidden focusable={false}>
          <rect width="100%" height="100%" fill="url(#sbr-hatch)" />
        </svg>
      )}
      <span style={styles.nodeTitleRow}>
        <span
          style={{
            ...styles.nodeSwatch,
            backgroundColor: `var(--color-icon-${
              status === 'down' ? 'red' : status === 'degraded' ? 'orange' : 'green'
            })`,
          }}
          aria-hidden
        />
        <span style={styles.nodeName}>
          <Text type="label" maxLines={1}>
            {node.name}
          </Text>
        </span>
      </span>
      <span style={styles.nodeCaption}>
        <Text type="supporting" color="secondary" maxLines={1}>
          {TIER_META[node.tier].label} · {formatRps(node.rps)} RPS
          {node.userFacing ? ' · user-facing' : ''}
          {isKilled ? ' · killed' : ''}
        </Text>
      </span>
    </button>
  );
}

// ============= IMPACT PANEL =============

function ImpactPanel({
  scenario,
  downCount,
  degradedCount,
  lostRps,
  affectedSurfaces,
  activeMitigations,
  selected,
  selectedStatus,
  isSelectedKilled,
  depsChain,
  dependentsChain,
  statusOf,
  onToggleMitigation,
  onToggleKill,
  onSelect,
}: {
  scenario: Scenario | null;
  downCount: number;
  degradedCount: number;
  lostRps: number;
  affectedSurfaces: Array<{node: ServiceNode; status: NodeStatus}>;
  activeMitigations: ReadonlySet<string>;
  selected: ServiceNode | null;
  selectedStatus: NodeStatus;
  isSelectedKilled: boolean;
  depsChain: string[];
  dependentsChain: string[];
  statusOf: (id: string) => NodeStatus;
  onToggleMitigation: (id: string, isOn: boolean) => void;
  onToggleKill: (id: string, isOn: boolean) => void;
  onSelect: (id: string) => void;
}) {
  const renderChain = (ids: string[], emptyLabel: string) =>
    ids.length === 0 ? (
      <Text type="supporting" color="secondary">
        {emptyLabel}
      </Text>
    ) : (
      <div style={styles.chainList}>
        <List density="compact" hasDividers>
          {ids.map(id => {
            const node = NODE_BY_ID.get(id);
            if (node == null) {
              return null;
            }
            const status = statusOf(id);
            return (
              <ListItem
                key={id}
                label={node.name}
                description={`${TIER_META[node.tier].label} · ${formatRps(node.rps)} RPS`}
                startContent={
                  <StatusDot
                    variant={STATUS_META[status].dot}
                    label={STATUS_META[status].label}
                  />
                }
                endContent={
                  status !== 'ok' ? (
                    <Badge
                      variant={STATUS_META[status].badge}
                      label={STATUS_META[status].label}
                    />
                  ) : undefined
                }
                onClick={() => onSelect(id)}
              />
            );
          })}
        </List>
      </div>
    );

  return (
    <VStack gap={4} style={styles.panelBody}>
      <VStack gap={2}>
        <Heading level={3}>Blast radius</Heading>
        {scenario != null && (
          <Text type="supporting" color="secondary">
            {scenario.story}
          </Text>
        )}
        <HStack gap={3} vAlign="center">
          <HStack gap={1} vAlign="center">
            <StatusDot variant="error" label="Down services" />
            <Text type="supporting" hasTabularNumbers>
              {downCount} down
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <StatusDot variant="warning" label="Degraded services" />
            <Text type="supporting" hasTabularNumbers>
              {degradedCount} degraded
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <StatusDot variant="success" label="Healthy services" />
            <Text type="supporting" hasTabularNumbers>
              {NODES.length - downCount - degradedCount} healthy
            </Text>
          </HStack>
        </HStack>
        <MetadataList columns={2} label={{position: 'top'}}>
          <MetadataListItem label="Lost RPS">
            <Text hasTabularNumbers>{formatRps(lostRps)}</Text>
          </MetadataListItem>
          <MetadataListItem label="Surfaces hit">
            <Text hasTabularNumbers>
              {affectedSurfaces.length} of{' '}
              {NODES.filter(node => node.userFacing).length}
            </Text>
          </MetadataListItem>
        </MetadataList>
        {affectedSurfaces.length === 0 ? (
          <Text type="supporting" color="secondary">
            All user-facing surfaces healthy. Flip a kill switch or load a
            scenario to run the propagation.
          </Text>
        ) : (
          <List density="compact" hasDividers>
            {affectedSurfaces.map(({node, status}) => (
              <ListItem
                key={node.id}
                label={node.name}
                description={`${formatRps(node.rps)} RPS at stake`}
                startContent={
                  <StatusDot
                    variant={STATUS_META[status].dot}
                    label={STATUS_META[status].label}
                  />
                }
                endContent={
                  <Badge
                    variant={STATUS_META[status].badge}
                    label={STATUS_META[status].label}
                  />
                }
                onClick={() => onSelect(node.id)}
              />
            ))}
          </List>
        )}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
          <Heading level={3}>Mitigations</Heading>
        </HStack>
        {MITIGATIONS.map(mitigation => (
          <VStack gap={1} key={mitigation.id}>
            <HStack gap={2} vAlign="center" style={styles.mitigationRow}>
              <StackItem size="fill">
                <Switch
                  label={mitigation.label}
                  value={activeMitigations.has(mitigation.id)}
                  onChange={isOn => onToggleMitigation(mitigation.id, isOn)}
                />
              </StackItem>
            </HStack>
            <Text type="supporting" color="secondary">
              {mitigation.description}
            </Text>
          </VStack>
        ))}
      </VStack>

      <Divider />

      {selected == null ? (
        <EmptyState
          title="No service selected"
          description="Click any node on the canvas to inspect its dependency chain and flip its kill switch."
          icon={<Icon icon={MousePointerClickIcon} size="lg" />}
          isCompact
        />
      ) : (
        <VStack gap={3}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Heading level={3}>{selected.name}</Heading>
              </StackItem>
              <Badge
                variant={TIER_META[selected.tier].badge}
                label={TIER_META[selected.tier].label}
              />
            </HStack>
            <HStack gap={2} vAlign="center">
              <Badge
                variant={STATUS_META[selectedStatus].badge}
                label={isSelectedKilled ? 'killed' : STATUS_META[selectedStatus].label}
              />
              {selected.userFacing && (
                <Badge variant="blue" label="user-facing" />
              )}
            </HStack>
          </VStack>
          <MetadataList columns={2} label={{position: 'top'}}>
            <MetadataListItem label="Traffic">
              <Text hasTabularNumbers>{formatRps(selected.rps)} RPS</Text>
            </MetadataListItem>
            <MetadataListItem label="Tier">
              <Text>{TIER_META[selected.tier].label}</Text>
            </MetadataListItem>
          </MetadataList>
          <Switch
            label="Kill switch"
            value={isSelectedKilled}
            onChange={isOn => onToggleKill(selected.id, isOn)}
          />
          <VStack gap={1}>
            <Text type="label" color="secondary">
              Depends on ({depsChain.length})
            </Text>
            {renderChain(depsChain, 'No downstream dependencies — leaf tier.')}
          </VStack>
          <VStack gap={1}>
            <Text type="label" color="secondary">
              Depended on by ({dependentsChain.length})
            </Text>
            {renderChain(dependentsChain, 'Nothing depends on this service.')}
          </VStack>
        </VStack>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function ServiceBlastRadiusTemplate() {
  // Boot into the first scenario, paused one wave in, so the ripple order
  // is visible immediately and Play/Step teach themselves.
  const [kills, setKills] = useState<ReadonlySet<string>>(
    () => new Set(SCENARIOS[0].kills),
  );
  const [activeMitigations, setActiveMitigations] = useState<
    ReadonlySet<string>
  >(() => new Set(SCENARIOS[0].mitigations));
  const [scenarioId, setScenarioId] = useState<string>(SCENARIOS[0].id);
  const [visibleWave, setVisibleWave] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>('catalog-db');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pan, setPan] = useState({x: 0, y: 0});
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const panRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  // Responsive contract: <=1024px the panel docks as a bottom sheet;
  // <=640px header caption and toolbar hint drop. Reduced motion swaps
  // autoplay for an instant jump to the final wave (Step still works).
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // ----- propagation (pure function of switches + mitigations) -----

  const {impact, maxWave} = useMemo(
    () => computeImpact(kills, activeMitigations),
    [kills, activeMitigations],
  );
  const effectiveEdges = useMemo(
    () => effectiveEdgesFor(activeMitigations),
    [activeMitigations],
  );

  const statusOf = (id: string): NodeStatus => {
    const entry = impact.get(id);
    return entry != null && entry.wave <= visibleWave ? entry.status : 'ok';
  };

  // Every outage change replays the ripple from wave 0 (or jumps straight
  // to the end under reduced motion) — state stays a pure function of the
  // switch sets plus the wave index.
  const commitOutage = (
    nextKills: ReadonlySet<string>,
    nextMitigations: ReadonlySet<string>,
    nextScenarioId: string,
  ) => {
    setKills(nextKills);
    setActiveMitigations(nextMitigations);
    setScenarioId(nextScenarioId);
    const next = computeImpact(nextKills, nextMitigations);
    if (prefersReducedMotion) {
      setVisibleWave(next.maxWave);
      setIsPlaying(false);
    } else {
      setVisibleWave(0);
      setIsPlaying(next.maxWave > 0);
    }
  };

  const toggleKill = (id: string, isOn: boolean) => {
    const next = new Set(kills);
    if (isOn) {
      next.add(id);
    } else {
      next.delete(id);
    }
    commitOutage(next, activeMitigations, 'custom');
  };

  const toggleMitigation = (id: string, isOn: boolean) => {
    const next = new Set(activeMitigations);
    if (isOn) {
      next.add(id);
    } else {
      next.delete(id);
    }
    commitOutage(kills, next, 'custom');
  };

  const applyScenario = (id: string) => {
    if (id === 'custom') {
      setScenarioId('custom');
      return;
    }
    const scenario = SCENARIOS.find(entry => entry.id === id);
    if (scenario != null) {
      commitOutage(
        new Set(scenario.kills),
        new Set(scenario.mitigations),
        scenario.id,
      );
      setSelectedId(scenario.kills[0] ?? null);
    }
  };

  const clearOutages = () => {
    commitOutage(new Set(), new Set(), 'custom');
  };

  // Playback cadence: the interval only advances the wave index; the
  // rendered impact stays a pure function of that index.
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(() => {
      setVisibleWave(prev => (prev < maxWave ? prev + 1 : prev));
    }, WAVE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPlaying, maxWave]);

  useEffect(() => {
    if (isPlaying && visibleWave >= maxWave) {
      setIsPlaying(false);
    }
  }, [isPlaying, visibleWave, maxWave]);

  // ----- chain highlight (hover, focus, or selection — never hover-only) --

  const focusId = hoveredId ?? selectedId;
  const chainSet = useMemo<ReadonlySet<string> | null>(() => {
    if (focusId == null) {
      return null;
    }
    return new Set([
      focusId,
      ...chainFrom(focusId, effectiveEdges, 'deps'),
      ...chainFrom(focusId, effectiveEdges, 'dependents'),
    ]);
  }, [focusId, effectiveEdges]);

  const selected = selectedId != null ? (NODE_BY_ID.get(selectedId) ?? null) : null;
  const depsChain = useMemo(
    () =>
      selectedId != null ? chainFrom(selectedId, effectiveEdges, 'deps') : [],
    [selectedId, effectiveEdges],
  );
  const dependentsChain = useMemo(
    () =>
      selectedId != null
        ? chainFrom(selectedId, effectiveEdges, 'dependents')
        : [],
    [selectedId, effectiveEdges],
  );

  // ----- tallies (over the *visible* wave, so numbers grow with motion) --

  let downCount = 0;
  let degradedCount = 0;
  let lostRps = 0;
  const affectedSurfaces: Array<{node: ServiceNode; status: NodeStatus}> = [];
  for (const node of NODES) {
    const status = statusOf(node.id);
    if (status === 'down') {
      downCount++;
    } else if (status === 'degraded') {
      degradedCount++;
    }
    if (node.userFacing && status !== 'ok') {
      affectedSurfaces.push({node, status});
      // Down loses the full stream; degraded loses half (fixed rule).
      lostRps += status === 'down' ? node.rps : Math.round(node.rps / 2);
    }
  }

  const scenario = SCENARIOS.find(entry => entry.id === scenarioId) ?? null;
  const announcement =
    maxWave === 0
      ? 'All services healthy.'
      : `Wave ${visibleWave} of ${maxWave}: ${downCount} down, ` +
        `${degradedCount} degraded, ${formatRps(lostRps)} RPS at risk.`;

  // ----- canvas pan: pointer drag with capture + arrow-key equivalent ----

  const clampPan = (x: number, y: number) => ({
    x: clamp(x, -(CANVAS_W - PAN_MARGIN), PAN_MARGIN),
    y: clamp(y, -(CANVAS_H - PAN_MARGIN), PAN_MARGIN),
  });

  const startPan = (event: React.PointerEvent<HTMLDivElement>) => {
    // Presses on node buttons stay clicks; only the canvas surface pans.
    if (event.target !== event.currentTarget) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
  };

  const movePan = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = panRef.current;
    if (drag == null || drag.pointerId !== event.pointerId) {
      return;
    }
    setPan(
      clampPan(
        drag.originX + (event.clientX - drag.startX),
        drag.originY + (event.clientY - drag.startY),
      ),
    );
  };

  const endPan = () => {
    panRef.current = null;
  };

  const keyPan = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Keyboard path commits the identical pan state as the drag gesture.
    if (event.target !== event.currentTarget) {
      return;
    }
    const step = KEY_PAN_STEP;
    let dx = 0;
    let dy = 0;
    if (event.key === 'ArrowLeft') {
      dx = step;
    } else if (event.key === 'ArrowRight') {
      dx = -step;
    } else if (event.key === 'ArrowUp') {
      dy = step;
    } else if (event.key === 'ArrowDown') {
      dy = -step;
    } else {
      return;
    }
    event.preventDefault();
    setPan(prev => clampPan(prev.x + dx, prev.y + dy));
  };

  // ----- pieces -----

  const toolbar = (
    <HStack gap={2} vAlign="center" style={styles.toolbar}>
      <Button
        label={isPlaying ? 'Pause' : 'Play'}
        variant="secondary"
        size="sm"
        style={styles.toolbarButton}
        icon={<Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" />}
        isDisabled={maxWave === 0 || (!isPlaying && visibleWave >= maxWave)}
        onClick={() => setIsPlaying(prev => !prev)}
      />
      <Button
        label="Step"
        variant="secondary"
        size="sm"
        style={styles.toolbarButton}
        icon={<Icon icon={StepForwardIcon} size="sm" />}
        isDisabled={visibleWave >= maxWave}
        onClick={() => {
          setIsPlaying(false);
          setVisibleWave(prev => Math.min(prev + 1, maxWave));
        }}
      />
      <Button
        label="Rewind"
        variant="secondary"
        size="sm"
        style={styles.toolbarButton}
        icon={<Icon icon={RotateCcwIcon} size="sm" />}
        isDisabled={maxWave === 0 || visibleWave === 0}
        onClick={() => {
          setIsPlaying(false);
          setVisibleWave(0);
        }}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        Wave {visibleWave}/{maxWave}
      </Text>
      <StackItem size="fill">
        {/* <=640px: the hint cedes its width to the controls. */}
        {!isCompact && (
          <Text type="supporting" color="secondary">
            Failures ripple one BFS wave per step — drag or arrow-key the
            canvas to pan.
          </Text>
        )}
      </StackItem>
      <Button
        label="Clear outages"
        variant="ghost"
        size="sm"
        style={styles.toolbarButton}
        isDisabled={kills.size === 0 && activeMitigations.size === 0}
        onClick={clearOutages}
      />
    </HStack>
  );

  const canvas = (
    <div
      style={styles.viewport}
      role="group"
      aria-label="Service dependency canvas. Drag to pan, or focus and use arrow keys."
      tabIndex={0}
      onPointerDown={startPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onKeyDown={keyPan}>
      <div
        style={{
          ...styles.stage,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
        }}>
        <EdgeLayer
          edges={effectiveEdges}
          statusOf={statusOf}
          chainSet={chainSet}
          hasFocus={focusId != null}
        />
        {NODES.map(node => {
          const entry = impact.get(node.id);
          return (
            <ServiceNodeButton
              key={node.id}
              node={node}
              status={statusOf(node.id)}
              isKilled={kills.has(node.id)}
              isSelected={node.id === selectedId}
              isDimmed={chainSet != null && !chainSet.has(node.id)}
              isJustRevealed={entry != null && entry.wave === visibleWave}
              onSelect={id =>
                setSelectedId(prev => (prev === id ? null : id))
              }
              onHover={setHoveredId}
            />
          );
        })}
      </div>
    </div>
  );

  const panelContent = (
    <ImpactPanel
      scenario={scenario}
      downCount={downCount}
      degradedCount={degradedCount}
      lostRps={lostRps}
      affectedSurfaces={affectedSurfaces}
      activeMitigations={activeMitigations}
      selected={selected}
      selectedStatus={selected != null ? statusOf(selected.id) : 'ok'}
      isSelectedKilled={selected != null && kills.has(selected.id)}
      depsChain={depsChain}
      dependentsChain={dependentsChain}
      statusOf={statusOf}
      onToggleMitigation={toggleMitigation}
      onToggleKill={toggleKill}
      onSelect={id => {
        setSelectedId(id);
      }}
    />
  );

  // <=1024px: the impact panel docks as a bottom sheet over the canvas.
  const bottomSheet = isNarrow && (
    <div
      style={{
        ...styles.sheet,
        ...(isSheetOpen ? styles.sheetExpanded : undefined),
      }}>
      <HStack gap={2} vAlign="center" style={styles.sheetHandleRow}>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {downCount} down · {degradedCount} degraded ·{' '}
            {formatRps(lostRps)} RPS at risk
          </Text>
        </StackItem>
        <IconButton
          label={isSheetOpen ? 'Collapse impact panel' : 'Expand impact panel'}
          tooltip={isSheetOpen ? 'Collapse impact panel' : 'Expand impact panel'}
          icon={
            <Icon
              icon={isSheetOpen ? ChevronDownIcon : ChevronUpIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="secondary"
          size="md"
          onClick={() => setIsSheetOpen(prev => !prev)}
        />
      </HStack>
      {isSheetOpen && (
        <>
          <Divider />
          <div style={styles.sheetBody}>{panelContent}</div>
        </>
      )}
    </div>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={ActivityIcon} size="sm" color="secondary" />
                  <Heading level={1}>Blast-radius sandbox</Heading>
                  {/* <=640px: the caption cedes width to the Selector. */}
                  {!isCompact && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {NODES.length} services · {EDGES.length} dependency edges
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <div style={styles.scenarioSelect}>
                <Selector
                  label="Outage scenario"
                  isLabelHidden
                  size="sm"
                  options={SCENARIO_OPTIONS}
                  value={scenarioId}
                  onChange={applyScenario}
                />
              </div>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="Blast-radius canvas">
            <VStack gap={0} style={styles.contentFill}>
              {toolbar}
              <Divider />
              <StackItem size="fill" style={{position: 'relative', minHeight: 0}}>
                {canvas}
                {bottomSheet}
              </StackItem>
            </VStack>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel width={340} padding={0} label="Impact panel">
              <div style={styles.panelScroll}>{panelContent}</div>
            </LayoutPanel>
          )
        }
      />
    </>
  );
}
