var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 40-person company — Atlas Labs —
 *   across four departments under a CEO, each employee with title, manager,
 *   location, and cost center, plus one open-req placeholder node per team;
 *   no clocks, randomness, or network assets — avatars are initials only)
 * @output Org chart explorer: LayoutHeader with a people search (match
 *   count + previous/next cycling) and Expand all / Collapse all; a
 *   pannable org-tree canvas of employee node Cards (Avatar, title,
 *   direct-report count, department color rail) connected by simple SVG
 *   elbow edges, with per-node collapse toggles showing hidden-descendant
 *   Badges; a docked detail rail with inline-editable title / manager /
 *   location / cost-center fields; drag-onto-a-node (or MoreMenu / manager
 *   Selector) re-parenting behind a confirm Dialog with an undo Toast
 * @position Page template; emitted by \`astryx template org-chart-explorer\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the title
 * + headcount caption, the search TextInput with match cycling, and Expand
 * all / Collapse all. LayoutContent is the org canvas: a scrollable region
 * that pans by dragging the background, holding one absolutely positioned
 * SVG edge layer beneath absolutely positioned node cards. LayoutPanel end
 * 340 hosts the employee detail rail (EmptyState until a node is picked).
 *
 * Container policy: org nodes are compact Card-like tiles (plain buttons
 * styled as cards so the whole tile is clickable and draggable — no nested
 * interactive Card), edges are one shared SVG layer, and the detail rail is
 * plain stacked Fields — no cards inside the panel.
 *
 * Interaction contract:
 * - Collapse state lives in useState as a Set of employee ids; collapsing a
 *   node hides its whole subtree and shows a "+N hidden" Badge on the card;
 *   Expand all / Collapse all swap the entire set.
 * - Searching matches name or title, highlights every match with a ring,
 *   auto-expands the active match's ancestors, and centers it in the
 *   canvas; previous/next buttons cycle matches, re-centering each time.
 * - Clicking a card selects it and fills the rail with inline-editable
 *   Title / Manager / Location / Cost center fields; text edits commit on
 *   change and persist straight onto the canvas card.
 * - Re-parenting works three ways — drag a card onto a new manager (fine
 *   pointers), the card's MoreMenu "Change manager…" item, or the rail's
 *   Manager Selector — and always lands in one confirm Dialog that names
 *   the moving subtree and target. Confirming moves the subtree, every
 *   span-of-control and team-headcount badge recomputes from the new
 *   manager map on the same render, and an undo Toast reverses the move.
 * - Illegal drops (self, own descendant, open-req nodes) are rejected at
 *   dragover time and filtered out of every manager Selector.
 *
 * Responsive contract:
 * - >768px: the detail rail stays docked at 340px on the end edge; the
 *   header shows the headcount caption and Expand/Collapse all inline.
 * - <=768px: the rail undocks (single-pane fallback) — selecting a node
 *   swaps LayoutContent to a full-width detail view with a >=40px "Back to
 *   chart" control; the caption and Expand/Collapse all hide and the
 *   header wraps so the search drops below the title and flexes full
 *   width.
 * - <=640px: collapse toggles and search-cycling controls keep >=40px tap
 *   targets, and drag re-parenting is disabled in favor of the MoreMenu /
 *   Selector paths (no hover-only interactions anywhere).
 * - The canvas is the page's one deliberate two-axis scroll region: node
 *   coordinates are fixed, so at 375px the chart pans by touch scroll and
 *   background drag while the page chrome keeps width.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MapPinIcon,
  NetworkIcon,
  SearchIcon,
  UserPlusIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

/** Node tile geometry — the layout algorithm and SVG edges share these. */
const NODE_W = 212;
const NODE_H = 104;
const H_GAP = 20;
const V_GAP = 56;
const CANVAS_PAD = 32;

const styles: Record<string, CSSProperties> = {
  // The one deliberate two-axis scroll region on the page; background drag
  // pans it (cursor flips to grabbing while a pan is live).
  canvasScroll: {
    position: 'relative',
    height: '100%',
    overflow: 'auto',
    cursor: 'grab',
    touchAction: 'pan-x pan-y',
  },
  canvasScrollPanning: {cursor: 'grabbing', userSelect: 'none'},
  // Inner surface sized to the computed tree extents; edges + nodes are
  // absolutely positioned against it.
  canvasSurface: {position: 'relative'},
  edgeLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  // Node tiles are plain buttons styled as cards so the entire tile is one
  // click/tap + drag target (no nested interactive containers).
  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    boxSizing: 'border-box',
    display: 'block',
    padding: '10px 12px 8px',
    border: '1px solid var(--color-border)',
    borderLeftWidth: 4,
    borderRadius: 10,
    background: 'var(--color-background-primary)',
    font: 'inherit',
    textAlign: 'start',
    color: 'inherit',
    cursor: 'pointer',
  },
  nodeOpenReq: {
    borderStyle: 'dashed',
    borderLeftStyle: 'solid',
    background: 'var(--color-background-secondary)',
  },
  nodeSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  nodeMatch: {
    boxShadow: '0 0 0 2px var(--color-warning)',
  },
  nodeActiveMatch: {
    boxShadow:
      '0 0 0 3px var(--color-warning), 0 2px 8px light-dark(rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.55))',
  },
  nodeDropTarget: {
    boxShadow: '0 0 0 3px var(--color-success)',
  },
  nodeDragging: {opacity: 0.45},
  // Collapse toggle + MoreMenu float on the tile's footer line; the toggle
  // grows to a 40px square on coarse pointers.
  nodeFooter: {
    position: 'absolute',
    insetInlineStart: 8,
    insetInlineEnd: 4,
    bottom: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  toggleTouch: {width: 40, height: 40},
  // Search cycling controls keep a >=40px hit area on phones.
  matchNav: {display: 'flex', alignItems: 'center', gap: 2},
  // Detail rail scroll region (the docked panel owns its own scrollbar).
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  backControl: {minHeight: 40, display: 'flex', alignItems: 'center'},
  // Undo toast: fixed bottom-right, clear of the docked rail.
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 40,
  },
};

// ============= DATA =============
// Deterministic fixtures: Atlas Labs, 40 filled seats across Engineering,
// Product & Design, Go-to-Market, and Operations, plus one open-req
// placeholder node per team (9 teams). Manager links are the only source
// of hierarchy — every count on the canvas derives from them at render
// time so re-parenting recomputes badges automatically.

type Department = 'exec' | 'engineering' | 'product' | 'gtm' | 'operations';

// Department rail colors are explicit light-dark() pairs: the light values
// are unchanged, and each dark value lifts lightness (same hue) so the 4px
// rail keeps its category contrast against dark card surfaces.
const DEPARTMENT_META: Record<Department, {label: string; color: string}> = {
  exec: {label: 'Executive', color: 'light-dark(#6e6e73, #9a9aa1)'},
  engineering: {label: 'Engineering', color: 'light-dark(#0171e3, #4da3ff)'},
  product: {label: 'Product & Design', color: 'light-dark(#8944ab, #b678d4)'},
  gtm: {label: 'Go-to-Market', color: 'light-dark(#f5a623, #f7b850)'},
  operations: {label: 'Operations', color: 'light-dark(#2fb344, #4ecf63)'},
};

interface Employee {
  id: string;
  name: string;
  title: string;
  managerId: string | null;
  department: Department;
  location: string;
  costCenter: string;
  /** Open-req placeholder seat — dashed tile, excluded from headcounts. */
  isOpenReq?: boolean;
}

/** Compact fixture row: [id, name, title, managerId, dept, location, cc]. */
type EmployeeSpec = [
  id: string,
  name: string,
  title: string,
  managerId: string | null,
  department: Department,
  location: string,
  costCenter: string,
];

const PEOPLE: EmployeeSpec[] = [
  ['ceo', 'Maya Chen', 'Chief Executive Officer', null, 'exec', 'San Francisco', 'CC-100'],
  // --- Engineering (14) ---
  ['vp-eng', 'Priya Raman', 'VP Engineering', 'ceo', 'engineering', 'San Francisco', 'CC-200'],
  ['em-plat', 'Miguel Santos', 'Eng Manager, Platform', 'vp-eng', 'engineering', 'San Francisco', 'CC-210'],
  ['plat-1', 'Sofia Alvarez', 'Senior Backend Engineer', 'em-plat', 'engineering', 'San Francisco', 'CC-210'],
  ['plat-2', 'Ken Watanabe', 'Backend Engineer', 'em-plat', 'engineering', 'Remote — Osaka', 'CC-210'],
  ['plat-3', 'Ruth Adebayo', 'Staff Engineer', 'em-plat', 'engineering', 'San Francisco', 'CC-210'],
  ['plat-4', 'Peter Kovacs', 'Backend Engineer', 'em-plat', 'engineering', 'New York', 'CC-210'],
  ['em-prod', 'Aisha Karim', 'Eng Manager, Product Eng', 'vp-eng', 'engineering', 'Remote — Lisbon', 'CC-220'],
  ['peng-1', 'Jonas Weber', 'Frontend Engineer', 'em-prod', 'engineering', 'Berlin', 'CC-220'],
  ['peng-2', 'Grace Liu', 'Senior Frontend Engineer', 'em-prod', 'engineering', 'San Francisco', 'CC-220'],
  ['peng-3', 'Omar Haddad', 'Full-stack Engineer', 'em-prod', 'engineering', 'Remote — Amman', 'CC-220'],
  ['em-infra', 'Tom Brennan', 'Eng Manager, Infrastructure', 'vp-eng', 'engineering', 'New York', 'CC-230'],
  ['infra-1', 'Elena Petrova', 'Site Reliability Engineer', 'em-infra', 'engineering', 'New York', 'CC-230'],
  ['infra-2', 'Marcus Hill', 'Site Reliability Engineer', 'em-infra', 'engineering', 'Remote — Chicago', 'CC-230'],
  ['infra-3', 'Yuki Tanaka', 'Security Engineer', 'em-infra', 'engineering', 'San Francisco', 'CC-230'],
  // --- Product & Design (8) ---
  ['vp-prod', 'Dana Whitfield', 'VP Product & Design', 'ceo', 'product', 'San Francisco', 'CC-300'],
  ['dm-design', 'Lena Fischer', 'Design Manager', 'vp-prod', 'product', 'Berlin', 'CC-310'],
  ['des-1', 'Caleb Ortiz', 'Product Designer', 'dm-design', 'product', 'San Francisco', 'CC-310'],
  ['des-2', 'Nina Rossi', 'Senior Product Designer', 'dm-design', 'product', 'Milan', 'CC-310'],
  ['des-3', 'Sam Porter', 'UX Researcher', 'dm-design', 'product', 'Remote — Portland', 'CC-310'],
  ['pm-lead', 'Noah Park', 'PM Lead', 'vp-prod', 'product', 'San Francisco', 'CC-320'],
  ['pm-1', 'Ivy Nguyen', 'Product Manager', 'pm-lead', 'product', 'San Francisco', 'CC-320'],
  ['pm-2', 'Leo Mbeki', 'Product Manager', 'pm-lead', 'product', 'Remote — Cape Town', 'CC-320'],
  // --- Go-to-Market (10) ---
  ['vp-gtm', 'Jordan Reyes', 'VP Go-to-Market', 'ceo', 'gtm', 'Austin', 'CC-400'],
  ['sm-sales', 'Claire Dubois', 'Sales Manager', 'vp-gtm', 'gtm', 'New York', 'CC-410'],
  ['ae-1', 'Victor Osei', 'Account Executive', 'sm-sales', 'gtm', 'New York', 'CC-410'],
  ['ae-2', 'Hana Suzuki', 'Account Executive', 'sm-sales', 'gtm', 'Remote — Tokyo', 'CC-410'],
  ['ae-3', 'Derek Coleman', 'Enterprise AE', 'sm-sales', 'gtm', 'Austin', 'CC-410'],
  ['ae-4', 'Paula Mendes', 'Account Executive', 'sm-sales', 'gtm', 'Remote — São Paulo', 'CC-410'],
  ['mm-mktg', 'Felix Grant', 'Marketing Manager', 'vp-gtm', 'gtm', 'Remote — Toronto', 'CC-420'],
  ['mk-1', 'Amara Diallo', 'Content Marketer', 'mm-mktg', 'gtm', 'Remote — Dakar', 'CC-420'],
  ['mk-2', 'Josh Kim', 'Growth Marketer', 'mm-mktg', 'gtm', 'Austin', 'CC-420'],
  ['mk-3', 'Tessa Wright', 'Product Marketing Manager', 'mm-mktg', 'gtm', 'San Francisco', 'CC-420'],
  // --- Operations (7) ---
  ['vp-ops', 'Rosa Jimenez', 'VP Operations', 'ceo', 'operations', 'San Francisco', 'CC-500'],
  ['fl-fin', 'Ethan Cole', 'Finance Lead', 'vp-ops', 'operations', 'San Francisco', 'CC-510'],
  ['fin-1', 'Mia Johansson', 'Accountant', 'fl-fin', 'operations', 'Remote — Stockholm', 'CC-510'],
  ['fin-2', 'Arjun Patel', 'Financial Analyst', 'fl-fin', 'operations', 'San Francisco', 'CC-510'],
  ['pl-people', 'Zoe Martin', 'People Lead', 'vp-ops', 'operations', 'Remote — Denver', 'CC-520'],
  ['ppl-1', 'Gabriel Silva', 'Recruiter', 'pl-people', 'operations', 'San Francisco', 'CC-520'],
  ['ppl-2', 'Freya Nilsson', 'People Partner', 'pl-people', 'operations', 'Remote — Oslo', 'CC-520'],
];

/** One open-req placeholder per team: [id, title, managerId, dept, cc]. */
const OPEN_REQS: Array<
  [id: string, title: string, managerId: string, department: Department, cc: string]
> = [
  ['req-plat', 'Senior Platform Engineer', 'em-plat', 'engineering', 'CC-210'],
  ['req-peng', 'Mobile Engineer', 'em-prod', 'engineering', 'CC-220'],
  ['req-infra', 'Site Reliability Engineer', 'em-infra', 'engineering', 'CC-230'],
  ['req-des', 'Brand Designer', 'dm-design', 'product', 'CC-310'],
  ['req-pm', 'Senior Product Manager', 'pm-lead', 'product', 'CC-320'],
  ['req-ae', 'Enterprise AE, EMEA', 'sm-sales', 'gtm', 'CC-410'],
  ['req-mk', 'Lifecycle Marketer', 'mm-mktg', 'gtm', 'CC-420'],
  ['req-fin', 'Payroll Specialist', 'fl-fin', 'operations', 'CC-510'],
  ['req-ppl', 'People Ops Generalist', 'pl-people', 'operations', 'CC-520'],
];

const INITIAL_EMPLOYEES: Employee[] = [
  ...PEOPLE.map(
    ([id, name, title, managerId, department, location, costCenter]) => ({
      id,
      name,
      title,
      managerId,
      department,
      location,
      costCenter,
    }),
  ),
  ...OPEN_REQS.map(([id, title, managerId, department, costCenter]) => ({
    id,
    name: 'Open role',
    title,
    managerId,
    department,
    location: 'To be hired',
    costCenter,
    isOpenReq: true,
  })),
];

const COMPANY = 'Atlas Labs';
const ROOT_ID = 'ceo';

/** Teams whose branches start collapsed so the first paint fits a laptop. */
const INITIALLY_COLLAPSED = ['sm-sales', 'mm-mktg', 'fl-fin', 'pl-people'];

// ============= DERIVED TREE HELPERS =============

/** Children grouped by manager id, in fixture order. */
function buildChildrenMap(employees: Employee[]): Map<string, Employee[]> {
  const map = new Map<string, Employee[]>();
  for (const employee of employees) {
    if (employee.managerId == null) {
      continue;
    }
    const siblings = map.get(employee.managerId);
    if (siblings) {
      siblings.push(employee);
    } else {
      map.set(employee.managerId, [employee]);
    }
  }
  return map;
}

interface NodeCounts {
  /** Filled direct reports (open reqs excluded). */
  direct: number;
  /** Filled seats anywhere in the subtree, excluding the node itself. */
  team: number;
  /** Open reqs anywhere in the subtree. */
  openReqs: number;
  /** All descendant nodes (filled + open) — the "+N hidden" badge. */
  descendants: number;
}

/** Span-of-control and team-headcount roll-ups for every node. */
function buildCounts(
  employees: Employee[],
  childrenMap: Map<string, Employee[]>,
): Map<string, NodeCounts> {
  const counts = new Map<string, NodeCounts>();
  const visit = (id: string): NodeCounts => {
    const cached = counts.get(id);
    if (cached) {
      return cached;
    }
    const children = childrenMap.get(id) ?? [];
    const result: NodeCounts = {direct: 0, team: 0, openReqs: 0, descendants: 0};
    for (const child of children) {
      const childCounts = visit(child.id);
      result.descendants += 1 + childCounts.descendants;
      if (child.isOpenReq) {
        result.openReqs += 1 + childCounts.openReqs;
        result.team += childCounts.team;
      } else {
        result.direct += 1;
        result.team += 1 + childCounts.team;
        result.openReqs += childCounts.openReqs;
      }
    }
    counts.set(id, result);
    return result;
  };
  for (const employee of employees) {
    visit(employee.id);
  }
  return counts;
}

/** Ids of the node's whole subtree (itself included) — move validation. */
function collectSubtreeIds(
  id: string,
  childrenMap: Map<string, Employee[]>,
  into: Set<string> = new Set(),
): Set<string> {
  into.add(id);
  for (const child of childrenMap.get(id) ?? []) {
    collectSubtreeIds(child.id, childrenMap, into);
  }
  return into;
}

/** Manager-chain ids from the node up to the root (node excluded). */
function collectAncestorIds(
  id: string,
  byId: Map<string, Employee>,
): string[] {
  const ancestors: string[] = [];
  let current = byId.get(id)?.managerId ?? null;
  while (current != null) {
    ancestors.push(current);
    current = byId.get(current)?.managerId ?? null;
  }
  return ancestors;
}

// ============= LAYOUT =============
// Classic tidy-ish layout: a subtree's width is the sum of its visible
// children's widths; parents center over their children; collapsed nodes
// are leaves. All coordinates are plain pixels shared by tiles and edges.

interface PlacedNode {
  employee: Employee;
  x: number;
  y: number;
  isCollapsed: boolean;
}

interface PlacedEdge {
  id: string;
  d: string;
}

interface ChartLayout {
  nodes: PlacedNode[];
  edges: PlacedEdge[];
  width: number;
  height: number;
  positions: Map<string, {x: number; y: number}>;
}

function layoutChart(
  childrenMap: Map<string, Employee[]>,
  byId: Map<string, Employee>,
  collapsedIds: ReadonlySet<string>,
): ChartLayout {
  const nodes: PlacedNode[] = [];
  const edges: PlacedEdge[] = [];
  const positions = new Map<string, {x: number; y: number}>();
  let maxDepth = 0;

  const subtreeWidth = (id: string): number => {
    const children = collapsedIds.has(id) ? [] : (childrenMap.get(id) ?? []);
    if (children.length === 0) {
      return NODE_W;
    }
    return (
      children.reduce((sum, child) => sum + subtreeWidth(child.id), 0) +
      H_GAP * (children.length - 1)
    );
  };

  const place = (id: string, left: number, depth: number): void => {
    const employee = byId.get(id);
    if (employee == null) {
      return;
    }
    maxDepth = Math.max(maxDepth, depth);
    const width = subtreeWidth(id);
    const x = left + (width - NODE_W) / 2;
    const y = CANVAS_PAD + depth * (NODE_H + V_GAP);
    const isCollapsed = collapsedIds.has(id);
    nodes.push({employee, x, y, isCollapsed});
    positions.set(id, {x, y});

    if (isCollapsed) {
      return;
    }
    let childLeft = left;
    for (const child of childrenMap.get(id) ?? []) {
      const childWidth = subtreeWidth(child.id);
      const childX = childLeft + (childWidth - NODE_W) / 2;
      const childY = CANVAS_PAD + (depth + 1) * (NODE_H + V_GAP);
      const midY = y + NODE_H + V_GAP / 2;
      edges.push({
        id: \`\${id}-\${child.id}\`,
        d: \`M \${x + NODE_W / 2} \${y + NODE_H} V \${midY} H \${
          childX + NODE_W / 2
        } V \${childY}\`,
      });
      place(child.id, childLeft, depth + 1);
      childLeft += childWidth + H_GAP;
    }
  };

  place(ROOT_ID, CANVAS_PAD, 0);

  return {
    nodes,
    edges,
    width: subtreeWidth(ROOT_ID) + CANVAS_PAD * 2,
    height: CANVAS_PAD * 2 + (maxDepth + 1) * NODE_H + maxDepth * V_GAP,
    positions,
  };
}

// ============= NODE TILE =============

function OrgNodeTile({
  node,
  counts,
  isSelected,
  isMatch,
  isActiveMatch,
  isDropTarget,
  isDragging,
  isDraggable,
  isCompact,
  onSelect,
  onToggleCollapse,
  onRequestMove,
  onDragStart,
  onDragEnd,
  onDragOverNode,
  onDragLeaveNode,
  onDropOnNode,
}: {
  node: PlacedNode;
  counts: NodeCounts;
  isSelected: boolean;
  isMatch: boolean;
  isActiveMatch: boolean;
  isDropTarget: boolean;
  isDragging: boolean;
  isDraggable: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onRequestMove: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOverNode: (id: string) => boolean;
  onDragLeaveNode: (id: string) => void;
  onDropOnNode: (id: string) => void;
}) {
  const {employee, x, y, isCollapsed} = node;
  const dept = DEPARTMENT_META[employee.department];
  const hasChildren = counts.descendants > 0;
  const canDrag = isDraggable && employee.id !== ROOT_ID && !employee.isOpenReq;

  const ring = isDropTarget
    ? styles.nodeDropTarget
    : isActiveMatch
      ? styles.nodeActiveMatch
      : isMatch
        ? styles.nodeMatch
        : isSelected
          ? styles.nodeSelected
          : undefined;

  return (
    <div
      data-org-node
      style={{position: 'absolute', left: x, top: y}}
      draggable={canDrag}
      onDragStart={event => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', employee.id);
        onDragStart(employee.id);
      }}
      onDragEnd={onDragEnd}
      onDragOver={event => {
        if (onDragOverNode(employee.id)) {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'move';
        }
      }}
      onDragLeave={() => onDragLeaveNode(employee.id)}
      onDrop={event => {
        event.preventDefault();
        onDropOnNode(employee.id);
      }}>
      <button
        type="button"
        aria-pressed={isSelected}
        aria-label={
          employee.isOpenReq
            ? \`Open role: \${employee.title} — view details\`
            : \`\${employee.name}, \${employee.title} — view details\`
        }
        style={{
          ...styles.node,
          position: 'static',
          borderLeftColor: dept.color,
          ...(employee.isOpenReq ? styles.nodeOpenReq : undefined),
          ...ring,
          ...(isDragging ? styles.nodeDragging : undefined),
        }}
        onClick={() => onSelect(employee.id)}>
        <VStack gap={0.5}>
          <HStack gap={2} vAlign="center">
            {employee.isOpenReq ? (
              <Icon icon={UserPlusIcon} size="sm" color="secondary" />
            ) : (
              <Avatar name={employee.name} size="xsmall" />
            )}
            <StackItem size="fill">
              <Text type="label" maxLines={1}>
                {employee.isOpenReq ? 'Open role' : employee.name}
              </Text>
            </StackItem>
          </HStack>
          <Text type="supporting" color="secondary" size="sm" maxLines={1}>
            {employee.title}
          </Text>
          <HStack gap={1} vAlign="center" wrap="wrap">
            {employee.isOpenReq ? (
              <Badge label="Hiring" variant="warning" />
            ) : (
              <Text type="supporting" color="secondary" size="sm" hasTabularNumbers>
                {counts.direct} direct · {counts.team} team
              </Text>
            )}
            {!employee.isOpenReq && counts.openReqs > 0 && (
              <Badge label={\`\${counts.openReqs} open\`} variant="warning" />
            )}
          </HStack>
        </VStack>
      </button>
      {/* Footer controls sit outside the button so the tile stays a single
          non-nested interactive element. */}
      <div style={styles.nodeFooter}>
        {hasChildren && (
          <IconButton
            label={
              isCollapsed
                ? \`Expand \${employee.name} (\${counts.descendants} hidden)\`
                : \`Collapse \${employee.name}\`
            }
            icon={
              <Icon
                icon={isCollapsed ? ChevronDownIcon : ChevronUpIcon}
                size="sm"
              />
            }
            variant="ghost"
            size="sm"
            onClick={() => onToggleCollapse(employee.id)}
            style={isCompact ? styles.toggleTouch : undefined}
          />
        )}
        {hasChildren && isCollapsed && (
          <Badge label={\`+\${counts.descendants} hidden\`} variant="neutral" />
        )}
        <StackItem size="fill" />
        {employee.id !== ROOT_ID && (
          <MoreMenu
            label={\`Actions for \${employee.isOpenReq ? employee.title : employee.name}\`}
            size={isCompact ? 'lg' : 'sm'}
            items={[
              {
                label: 'Change manager…',
                onClick: () => onRequestMove(employee.id),
              },
              {label: 'View details', onClick: () => onSelect(employee.id)},
            ]}
          />
        )}
      </div>
    </div>
  );
}

// ============= DETAIL RAIL =============

function EmployeeDetail({
  employee,
  counts,
  managerName,
  managerOptions,
  onBack,
  onClose,
  onEdit,
  onManagerChange,
}: {
  employee: Employee;
  counts: NodeCounts;
  managerName: string | null;
  managerOptions: Array<{value: string; label: string}>;
  onBack?: () => void;
  onClose?: () => void;
  onEdit: (
    id: string,
    patch: Partial<Pick<Employee, 'title' | 'location' | 'costCenter'>>,
  ) => void;
  onManagerChange: (id: string, managerId: string) => void;
}) {
  const dept = DEPARTMENT_META[employee.department];
  return (
    <VStack gap={4}>
      {onBack != null && (
        <div style={styles.backControl}>
          <Button
            label="Back to chart"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onBack}
          />
        </div>
      )}
      <HStack gap={3} vAlign="start">
        {employee.isOpenReq ? (
          <Icon icon={UserPlusIcon} size="lg" color="secondary" />
        ) : (
          <Avatar name={employee.name} />
        )}
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={2}>
              {employee.isOpenReq ? 'Open role' : employee.name}
            </Heading>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Badge label={dept.label} variant="neutral" />
              {employee.isOpenReq && <Badge label="Hiring" variant="warning" />}
            </HStack>
          </VStack>
        </StackItem>
        {onClose != null && (
          <IconButton
            label="Close details"
            icon={<Icon icon={XIcon} size="sm" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )}
      </HStack>

      {!employee.isOpenReq && (
        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={1} vAlign="center">
            <Icon icon={UsersIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {counts.direct} direct · {counts.team} in team ·{' '}
              {counts.openReqs} open
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={MapPinIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              {employee.location}
            </Text>
          </HStack>
        </HStack>
      )}

      <Divider />

      {/* Inline edits commit on change and persist straight to the card. */}
      <TextInput
        label="Title"
        value={employee.title}
        onChange={value => onEdit(employee.id, {title: value})}
      />
      {employee.id !== ROOT_ID && (
        <Selector
          label="Manager"
          options={managerOptions}
          value={employee.managerId ?? undefined}
          onChange={value => {
            if (value !== employee.managerId) {
              onManagerChange(employee.id, value);
            }
          }}
          width="100%"
        />
      )}
      <TextInput
        label="Location"
        value={employee.location}
        onChange={value => onEdit(employee.id, {location: value})}
      />
      <TextInput
        label="Cost center"
        value={employee.costCenter}
        onChange={value => onEdit(employee.id, {costCenter: value})}
      />

      <Divider />

      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          Reports to
        </Text>
        <Text type="body">{managerName ?? '— (top of chart)'}</Text>
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function OrgChartExplorerTemplate() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [collapsedIds, setCollapsedIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIALLY_COLLAPSED),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [matchIndex, setMatchIndex] = useState(0);
  /** Pending re-parent draft — feeds the confirm Dialog. */
  const [moveDraft, setMoveDraft] = useState<{
    employeeId: string;
    managerId: string | undefined;
  } | null>(null);
  /** Last confirmed move — feeds the undo Toast. */
  const [lastMove, setLastMove] = useState<{
    employeeId: string;
    prevManagerId: string | null;
    movedName: string;
    targetName: string;
  } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  /** Node id awaiting a scroll-to-center once its position is known. */
  const [centerTargetId, setCenterTargetId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);

  // Responsive contract: <=768px undocks the rail (single-pane fallback);
  // <=640px upsizes touch targets and disables drag re-parenting.
  const isSinglePane = useMediaQuery('(max-width: 768px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isDragCapable = useMediaQuery('(hover: hover) and (pointer: fine)');

  // ---- derived tree ----
  const byId = useMemo(
    () => new Map(employees.map(employee => [employee.id, employee])),
    [employees],
  );
  const childrenMap = useMemo(() => buildChildrenMap(employees), [employees]);
  const counts = useMemo(
    () => buildCounts(employees, childrenMap),
    [employees, childrenMap],
  );
  const chart = useMemo(
    () => layoutChart(childrenMap, byId, collapsedIds),
    [childrenMap, byId, collapsedIds],
  );

  const headcount = useMemo(
    () => employees.filter(employee => !employee.isOpenReq).length,
    [employees],
  );
  const openReqCount = employees.length - headcount;

  // ---- search ----
  const normalizedQuery = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }
    return employees.filter(
      employee =>
        employee.name.toLowerCase().includes(normalizedQuery) ||
        employee.title.toLowerCase().includes(normalizedQuery),
    );
  }, [employees, normalizedQuery]);
  const matchIds = useMemo(
    () => new Set(matches.map(match => match.id)),
    [matches],
  );
  const activeMatchId =
    matches.length > 0 ? matches[matchIndex % matches.length].id : null;

  /** Expand every ancestor of \`id\`, then queue a scroll-to-center. */
  const revealAndCenter = useCallback(
    (id: string) => {
      const ancestors = collectAncestorIds(id, byId);
      setCollapsedIds(prev => {
        if (!ancestors.some(ancestorId => prev.has(ancestorId))) {
          return prev;
        }
        const next = new Set(prev);
        for (const ancestorId of ancestors) {
          next.delete(ancestorId);
        }
        return next;
      });
      setCenterTargetId(id);
    },
    [byId],
  );

  // Typing a query jumps to its first match; cycling re-centers each one.
  useEffect(() => {
    setMatchIndex(0);
  }, [normalizedQuery]);
  useEffect(() => {
    if (activeMatchId != null) {
      revealAndCenter(activeMatchId);
    }
  }, [activeMatchId, revealAndCenter]);

  // Scroll the queued node into the middle of the canvas viewport once its
  // laid-out position exists (ancestor expansion may land a render later).
  useEffect(() => {
    if (centerTargetId == null) {
      return;
    }
    const position = chart.positions.get(centerTargetId);
    const scroller = scrollRef.current;
    if (position == null || scroller == null) {
      return;
    }
    scroller.scrollTo({
      left: Math.max(0, position.x + NODE_W / 2 - scroller.clientWidth / 2),
      top: Math.max(0, position.y + NODE_H / 2 - scroller.clientHeight / 2),
      behavior: 'smooth',
    });
    setCenterTargetId(null);
  }, [centerTargetId, chart.positions]);

  // ---- collapse ----
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const collapsibleIds = useMemo(
    () =>
      employees
        .filter(employee => (childrenMap.get(employee.id) ?? []).length > 0)
        .filter(employee => employee.id !== ROOT_ID)
        .map(employee => employee.id),
    [employees, childrenMap],
  );

  // ---- selection + edits ----
  const selected = selectedId != null ? (byId.get(selectedId) ?? null) : null;

  const editEmployee = useCallback(
    (
      id: string,
      patch: Partial<Pick<Employee, 'title' | 'location' | 'costCenter'>>,
    ) => {
      setEmployees(prev =>
        prev.map(employee =>
          employee.id === id ? {...employee, ...patch} : employee,
        ),
      );
    },
    [],
  );

  // ---- re-parenting ----
  const movingEmployee =
    moveDraft != null ? (byId.get(moveDraft.employeeId) ?? null) : null;
  const invalidTargetIds = useMemo(() => {
    if (moveDraft == null) {
      return new Set<string>();
    }
    return collectSubtreeIds(moveDraft.employeeId, childrenMap);
  }, [moveDraft, childrenMap]);

  /** Everyone who can manage \`employeeId\`: filled seats outside its subtree. */
  const managerOptionsFor = useCallback(
    (employeeId: string) => {
      const subtree = collectSubtreeIds(employeeId, childrenMap);
      return employees
        .filter(
          employee => !employee.isOpenReq && !subtree.has(employee.id),
        )
        .map(employee => ({
          value: employee.id,
          label: \`\${employee.name} — \${employee.title}\`,
        }));
    },
    [employees, childrenMap],
  );

  const requestMove = useCallback(
    (employeeId: string, managerId?: string) => {
      setMoveDraft({
        employeeId,
        managerId: managerId ?? byId.get(employeeId)?.managerId ?? undefined,
      });
    },
    [byId],
  );

  const confirmMove = () => {
    if (moveDraft == null || moveDraft.managerId == null) {
      return;
    }
    const moving = byId.get(moveDraft.employeeId);
    const target = byId.get(moveDraft.managerId);
    if (moving == null || target == null) {
      return;
    }
    setEmployees(prev =>
      prev.map(employee =>
        employee.id === moving.id
          ? {...employee, managerId: target.id}
          : employee,
      ),
    );
    // Reveal the landing spot so the recomputed badges are visible.
    setCollapsedIds(prev => {
      if (!prev.has(target.id)) {
        return prev;
      }
      const next = new Set(prev);
      next.delete(target.id);
      return next;
    });
    setLastMove({
      employeeId: moving.id,
      prevManagerId: moving.managerId,
      movedName: moving.isOpenReq ? moving.title : moving.name,
      targetName: target.name,
    });
    setMoveDraft(null);
    setCenterTargetId(moving.id);
  };

  const undoMove = () => {
    if (lastMove == null) {
      return;
    }
    setEmployees(prev =>
      prev.map(employee =>
        employee.id === lastMove.employeeId
          ? {...employee, managerId: lastMove.prevManagerId}
          : employee,
      ),
    );
    setCenterTargetId(lastMove.employeeId);
    setLastMove(null);
  };

  // ---- drag wiring ----
  const canDropOn = useCallback(
    (targetId: string) => {
      if (draggingId == null || targetId === draggingId) {
        return false;
      }
      const target = byId.get(targetId);
      if (target == null || target.isOpenReq) {
        return false;
      }
      return !collectSubtreeIds(draggingId, childrenMap).has(targetId);
    },
    [draggingId, byId, childrenMap],
  );

  const handleDragOverNode = useCallback(
    (targetId: string) => {
      const allowed = canDropOn(targetId);
      setDropTargetId(prev =>
        allowed ? targetId : prev === targetId ? null : prev,
      );
      return allowed;
    },
    [canDropOn],
  );

  const handleDropOnNode = (targetId: string) => {
    if (draggingId != null && canDropOn(targetId)) {
      requestMove(draggingId, targetId);
    }
    setDraggingId(null);
    setDropTargetId(null);
  };

  // ---- background pan ----
  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-org-node]') != null) {
      return;
    }
    const scroller = scrollRef.current;
    if (scroller == null) {
      return;
    }
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const scroller = scrollRef.current;
    if (pan == null || scroller == null) {
      return;
    }
    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  };

  const handlePanEnd = () => {
    panRef.current = null;
    setIsPanning(false);
  };

  // ---- canvas ----
  const canvas = (
    <div
      ref={scrollRef}
      style={{
        ...styles.canvasScroll,
        ...(isPanning ? styles.canvasScrollPanning : undefined),
      }}
      onPointerDown={handlePanStart}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanEnd}
      onPointerCancel={handlePanEnd}>
      <div
        style={{
          ...styles.canvasSurface,
          width: chart.width,
          height: chart.height,
        }}>
        <svg
          width={chart.width}
          height={chart.height}
          style={styles.edgeLayer}
          aria-hidden="true">
          {chart.edges.map(edge => (
            <path
              key={edge.id}
              d={edge.d}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth={1.5}
            />
          ))}
        </svg>
        {chart.nodes.map(node => {
          const nodeCounts = counts.get(node.employee.id);
          if (nodeCounts == null) {
            return null;
          }
          return (
            <OrgNodeTile
              key={node.employee.id}
              node={node}
              counts={nodeCounts}
              isSelected={node.employee.id === selectedId}
              isMatch={matchIds.has(node.employee.id)}
              isActiveMatch={node.employee.id === activeMatchId}
              isDropTarget={node.employee.id === dropTargetId}
              isDragging={node.employee.id === draggingId}
              isDraggable={isDragCapable && !isCompact}
              isCompact={isCompact}
              onSelect={setSelectedId}
              onToggleCollapse={toggleCollapse}
              onRequestMove={requestMove}
              onDragStart={setDraggingId}
              onDragEnd={() => {
                setDraggingId(null);
                setDropTargetId(null);
              }}
              onDragOverNode={handleDragOverNode}
              onDragLeaveNode={targetId =>
                setDropTargetId(prev => (prev === targetId ? null : prev))
              }
              onDropOnNode={handleDropOnNode}
            />
          );
        })}
      </div>
    </div>
  );

  // ---- detail rail ----
  const selectedCounts =
    selected != null ? counts.get(selected.id) : undefined;
  const detailBody =
    selected != null && selectedCounts != null ? (
      <EmployeeDetail
        employee={selected}
        counts={selectedCounts}
        managerName={
          selected.managerId != null
            ? (byId.get(selected.managerId)?.name ?? null)
            : null
        }
        managerOptions={managerOptionsFor(selected.id)}
        onClose={isSinglePane ? undefined : () => setSelectedId(null)}
        onBack={isSinglePane ? () => setSelectedId(null) : undefined}
        onEdit={editEmployee}
        onManagerChange={(employeeId, managerId) =>
          requestMove(employeeId, managerId)
        }
      />
    ) : (
      <EmptyState
        icon={<Icon icon={NetworkIcon} size="lg" />}
        title="No one selected"
        description="Click a card on the chart to inspect and edit their title, manager, location, and cost center."
        isCompact
      />
    );

  // <=768px single-pane fallback: a selection replaces the canvas with a
  // full-width detail view behind a Back control.
  const showMobileDetail = isSinglePane && selected != null;

  const matchCounter =
    matches.length > 0
      ? \`\${(matchIndex % matches.length) + 1} of \${matches.length}\`
      : 'No matches';

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size={isSinglePane ? 'static' : 'fill'}>
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Org chart</Heading>
                  {!isSinglePane && (
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {COMPANY} · {headcount} people · {openReqCount} open
                      roles
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <StackItem size={isSinglePane ? 'fill' : 'static'}>
                <TextInput
                  label="Search people and titles"
                  isLabelHidden
                  placeholder="Search people and titles"
                  value={query}
                  onChange={setQuery}
                  hasClear
                  size="sm"
                  width={isSinglePane ? '100%' : '260px'}
                  startIcon={<Icon icon={SearchIcon} size="sm" />}
                />
              </StackItem>
              {normalizedQuery.length > 0 && (
                <div style={styles.matchNav}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {matchCounter}
                  </Text>
                  <IconButton
                    label="Previous match"
                    icon={<Icon icon={ChevronUpIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    isDisabled={matches.length < 2}
                    onClick={() =>
                      setMatchIndex(prev =>
                        (prev - 1 + matches.length) % matches.length,
                      )
                    }
                    style={isCompact ? styles.toggleTouch : undefined}
                  />
                  <IconButton
                    label="Next match"
                    icon={<Icon icon={ChevronDownIcon} size="sm" />}
                    variant="ghost"
                    size="sm"
                    isDisabled={matches.length < 2}
                    onClick={() =>
                      setMatchIndex(prev => (prev + 1) % matches.length)
                    }
                    style={isCompact ? styles.toggleTouch : undefined}
                  />
                </div>
              )}
              {!isSinglePane && (
                <>
                  <Button
                    label="Expand all"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsedIds(new Set())}
                  />
                  <Button
                    label="Collapse all"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCollapsedIds(new Set(collapsibleIds))}
                  />
                </>
              )}
            </HStack>
          </LayoutHeader>
        }
        end={
          isSinglePane ? undefined : (
            <LayoutPanel width={340} padding={0} label="Employee details">
              <div style={styles.panelScroll}>{detailBody}</div>
            </LayoutPanel>
          )
        }
        content={
          showMobileDetail ? (
            <LayoutContent padding={4}>{detailBody}</LayoutContent>
          ) : (
            <LayoutContent padding={0}>{canvas}</LayoutContent>
          )
        }
      />

      {/* Re-parent confirm step — shared by drag, MoreMenu, and the rail
          Selector. Confirming moves the subtree and recomputes every badge. */}
      {moveDraft != null && movingEmployee != null && (
        <Dialog
          isOpen
          onOpenChange={isOpen => {
            if (!isOpen) {
              setMoveDraft(null);
            }
          }}
          purpose="form"
          width="min(480px, 92vw)">
          <Layout
            header={
              <DialogHeader
                title="Change manager"
                subtitle={\`Move \${
                  movingEmployee.isOpenReq
                    ? \`the open \${movingEmployee.title} role\`
                    : movingEmployee.name
                }\${
                  (counts.get(movingEmployee.id)?.descendants ?? 0) > 0
                    ? \` and \${counts.get(movingEmployee.id)?.descendants} people below them\`
                    : ''
                } to a new manager.\`}
                onOpenChange={isOpen => {
                  if (!isOpen) {
                    setMoveDraft(null);
                  }
                }}
              />
            }
            content={
              <LayoutContent>
                <VStack gap={3}>
                  <Selector
                    label="New manager"
                    options={employees
                      .filter(
                        employee =>
                          !employee.isOpenReq &&
                          !invalidTargetIds.has(employee.id),
                      )
                      .map(employee => ({
                        value: employee.id,
                        label: \`\${employee.name} — \${employee.title}\`,
                      }))}
                    value={moveDraft.managerId}
                    onChange={managerId =>
                      setMoveDraft(prev =>
                        prev == null ? prev : {...prev, managerId},
                      )
                    }
                    placeholder="Choose a manager..."
                    width="100%"
                  />
                  <Text type="supporting" color="secondary">
                    Span-of-control and team-headcount badges across both
                    branches update as soon as you confirm. You can undo the
                    move afterwards.
                  </Text>
                </VStack>
              </LayoutContent>
            }
            footer={
              <LayoutFooter hasDivider>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill" />
                  <Button
                    label="Cancel"
                    variant="ghost"
                    onClick={() => setMoveDraft(null)}
                  />
                  <Button
                    label="Confirm move"
                    variant="primary"
                    isDisabled={
                      moveDraft.managerId == null ||
                      moveDraft.managerId === movingEmployee.managerId
                    }
                    onClick={confirmMove}
                  />
                </HStack>
              </LayoutFooter>
            }
          />
        </Dialog>
      )}

      {/* Undo toast for the last confirmed move. */}
      {lastMove != null && (
        <div style={styles.toastWrap}>
          <Toast
            type="info"
            isAutoHide={false}
            autoHideDuration={8000}
            onDismiss={() => setLastMove(null)}
            body={
              <VStack gap={1}>
                <Text weight="semibold">
                  Moved {lastMove.movedName} under {lastMove.targetName}
                </Text>
                <HStack gap={2} vAlign="center">
                  <Button
                    label="Undo move"
                    variant="secondary"
                    size="sm"
                    onClick={undoMove}
                  />
                  <Text type="supporting" color="secondary">
                    Headcounts have been recomputed.
                  </Text>
                </HStack>
              </VStack>
            }
          />
        </div>
      )}
    </>
  );
}
`;export{e as default};