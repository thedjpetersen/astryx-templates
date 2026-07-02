// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (8 typed memory nodes with fixed dates,
 *   proof counts, entity mentions, and markdown bodies; 6 weighted relation
 *   edges; a ranked entity vocabulary with mention counts)
 * @output Three-pane knowledge-memory browser for an AI assistant: a docked
 *   340px left rail with a Filters/Entities TabList (color-coded memory-type
 *   and edge-type toggle pills, searchable entity checklist with mention
 *   counts, min-weight Slider with a 2-decimal readout, and a conditional
 *   Reset Filters button); a center column with a node search bar in the
 *   header, an "8 nodes · 4 edges" status caption, a memory list with
 *   fact-type StatusDots, and a relations Table whose Type cells are tinted
 *   Badges and whose Weight cells pair a mini ProgressBar with the value;
 *   and a persistent right detail panel with the selected memory's Markdown
 *   body, tinted fact-type Badge, date and proof-count Badges, clickable
 *   entity Token chips, and a per-edge-type connection-count footer
 * @position Page template; emitted by `astryx template memory-relation-explorer`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title, node
 * count caption, node search TextInput). LayoutPanel start 340 hosts the
 * filter rail (TabList: Filters | Entities). LayoutContent hosts the memory
 * list above the relations Table in one scroll region. LayoutPanel end 380
 * is the always-on detail inspector for the selected memory.
 *
 * Responsive contract:
 * - >1200px: header | rail 340 | center (fill) | detail 380. Center is the
 *   only flexible region; both panels keep fixed widths and scroll
 *   independently.
 * - <=1200px: the detail panel hides; selecting a memory opens the same
 *   detail content in a Dialog instead.
 * - <=900px: the filter rail collapses behind a filters IconButton in the
 *   header; toggling it docks the rail back in.
 *
 * Container policy (graph-browser archetype): dense data renders as rows —
 * an edge-to-edge memory list grouped by fact type and a relations Table.
 * Fact-type color is carried by StatusDot + tinted Badge (world=blue,
 * experience=green, observation=purple); edge-type color by tinted Badge
 * (entity=purple, temporal=cyan, semantic=orange, caused by=red).
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
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {
  CheckboxList,
  CheckboxListItem,
} from '@astryxdesign/core/CheckboxList';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  Cog6ToothIcon,
  HashtagIcon,
  InboxIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {
    height: '100%',
    minHeight: 0,
  },
  // Single scroll region for the center column (memory list + relations).
  centerScroll: {
    overflowY: 'auto',
    minHeight: 0,
  },
  statusRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  groupHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  relationsHeader: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  relationsTable: {
    paddingInline: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-4)',
  },
  // Left rail: TabList pinned, tab content scrolls.
  railTabs: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-2)',
  },
  railBody: {
    padding: 'var(--spacing-3)',
    overflowY: 'auto',
    minHeight: 0,
  },
  pillWrap: {flexWrap: 'wrap'},
  weightBar: {width: 56},
  entityWrap: {flexWrap: 'wrap'},
  dialogBody: {paddingBottom: 'var(--spacing-2)'},
  headerSearch: {width: 280},
};

// ============= DATA =============
// Deterministic fixtures: fixed dates, no clocks, no randomness.

type FactType = 'world' | 'experience' | 'observation';
type EdgeType = 'entity' | 'temporal' | 'semantic' | 'caused_by';

interface MemoryNode {
  id: string;
  title: string;
  factType: FactType;
  date: string; // pre-formatted, deterministic
  proofCount: number;
  entities: string[];
  body: string; // markdown
}

interface MemoryEdge extends Record<string, unknown> {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  weight: number;
  via?: string; // shared entity that produced the edge
}

// Fact-type vocabulary: world=blue, experience=green, observation=purple.
const FACT_TYPE: Record<
  FactType,
  {label: string; badge: BadgeVariant; dot: string}
> = {
  world: {label: 'world', badge: 'blue', dot: 'var(--color-icon-blue)'},
  experience: {
    label: 'experience',
    badge: 'green',
    dot: 'var(--color-icon-green)',
  },
  observation: {
    label: 'observation',
    badge: 'purple',
    dot: 'var(--color-icon-purple)',
  },
};

// Edge-type vocabulary: entity=indigo, temporal=cyan, semantic=orange,
// caused_by=red (indigo renders on the purple badge tint).
const EDGE_TYPE: Record<
  EdgeType,
  {label: string; badge: BadgeVariant; dot: string}
> = {
  entity: {label: 'entity', badge: 'purple', dot: 'var(--color-icon-purple)'},
  temporal: {label: 'temporal', badge: 'cyan', dot: 'var(--color-icon-cyan)'},
  semantic: {
    label: 'semantic',
    badge: 'orange',
    dot: 'var(--color-icon-orange)',
  },
  caused_by: {
    label: 'caused by',
    badge: 'red',
    dot: 'var(--color-icon-red)',
  },
};

const FACT_TYPES: FactType[] = ['world', 'experience', 'observation'];
const EDGE_TYPES: EdgeType[] = ['entity', 'temporal', 'semantic', 'caused_by'];

const MEMORY_NODES: MemoryNode[] = [
  {
    id: 'm_009',
    title: 'Works at Acme Corp (Portland office)',
    factType: 'world',
    date: 'Jan 12, 2025',
    proofCount: 5,
    entities: ['Acme Corp', 'Portland'],
    body:
      'User works at **Acme Corp** out of the Portland office, on the ' +
      'platform infrastructure team. Mentioned commuting to the Pearl ' +
      'District office roughly three days a week.',
  },
  {
    id: 'm_201',
    title: "Sarah's birthday is Mar 14",
    factType: 'world',
    date: 'Feb 27, 2025',
    proofCount: 2,
    entities: ['Sarah'],
    body:
      "**Sarah's birthday is March 14.** User asked for gift ideas twice " +
      'in late February and set a reminder for March 10.',
  },
  {
    id: 'm_042',
    title: 'Portland trip planning',
    factType: 'experience',
    date: 'Aug 3, 2025',
    proofCount: 3,
    entities: ['Sarah', 'Portland trip', 'Alberta Arts District'],
    body:
      'User is planning a **trip to Portland** with Sarah in late ' +
      'September. Confirmed so far:\n\n' +
      '- Staying near the **Alberta Arts District**\n' +
      '- Wants one museum day and one hiking day\n' +
      '- Sarah is flying in separately on the 24th\n\n' +
      'Open question: whether to extend the trip through the weekend.',
  },
  {
    id: 'm_150',
    title: 'Weekend hike in Forest Park',
    factType: 'experience',
    date: 'Jun 14, 2025',
    proofCount: 2,
    entities: ['Portland trip', 'Forest Park'],
    body:
      'User hiked the **Wildwood Trail** in Forest Park and flagged it as ' +
      'a candidate for the hiking day on the Portland trip.',
  },
  {
    id: 'm_178',
    title: 'Q3 planning offsite in Bend',
    factType: 'experience',
    date: 'Jul 21, 2025',
    proofCount: 2,
    entities: ['Acme Corp', 'Bend'],
    body:
      'Acme Corp held its **Q3 planning offsite in Bend**. User presented ' +
      'the platform roadmap and drove back through the Cascades.',
  },
  {
    id: 'm_117',
    title: 'Prefers airports with lounges',
    factType: 'observation',
    date: 'Feb 19, 2026',
    proofCount: 1,
    entities: ['PDX'],
    body:
      'User consistently books itineraries through **airports with ' +
      'lounges**, even when the routing is longer.',
  },
  {
    id: 'm_133',
    title: 'Writes TypeScript in strict mode',
    factType: 'observation',
    date: 'Nov 2, 2025',
    proofCount: 2,
    entities: ['TypeScript'],
    body:
      'Every shared snippet compiles under **`strict: true`** — explicit ' +
      'return types, no implicit any, exhaustive switches.',
  },
  {
    id: 'm_160',
    title: 'Books flights on Tuesdays',
    factType: 'observation',
    date: 'Jan 6, 2026',
    proofCount: 1,
    entities: ['PDX'],
    body:
      'Three of the last three flight bookings happened on a **Tuesday ' +
      'evening**, usually after comparing fares for about a week.',
  },
];

const MEMORY_EDGES: MemoryEdge[] = [
  {id: 'e_311', from: 'm_042', to: 'm_201', type: 'entity', weight: 0.9, via: 'Sarah'},
  {id: 'e_310', from: 'm_042', to: 'm_009', type: 'semantic', weight: 0.72, via: 'Portland'},
  {id: 'e_098', from: 'm_009', to: 'm_042', type: 'temporal', weight: 0.55},
  {id: 'e_412', from: 'm_117', to: 'm_042', type: 'caused_by', weight: 0.41},
  {id: 'e_205', from: 'm_150', to: 'm_042', type: 'entity', weight: 0.63, via: 'Portland trip'},
  {id: 'e_118', from: 'm_133', to: 'm_009', type: 'semantic', weight: 0.48},
];

const NODE_BY_ID = new Map(MEMORY_NODES.map(node => [node.id, node]));

// Ranked entity vocabulary with mention counts (top 5 of 13 tracked).
const ENTITIES: Array<{name: string; mentions: number}> = [
  {name: 'Sarah', mentions: 42},
  {name: 'Portland trip', mentions: 18},
  {name: 'Acme Corp', mentions: 15},
  {name: 'TypeScript', mentions: 11},
  {name: 'Dr. Chen', mentions: 7},
];
const HIDDEN_ENTITY_COUNT = 8;

// Filter defaults (Reset Filters returns to this state).
const DEFAULT_TYPES_ON: Record<FactType, boolean> = {
  world: true,
  experience: true,
  observation: true,
};
const DEFAULT_EDGES_ON: Record<EdgeType, boolean> = {
  entity: true,
  temporal: true,
  semantic: true,
  caused_by: true,
};
const DEFAULT_MIN_WEIGHT = 0;

// Initial state per the demo scenario: semantic edges toggled off, two
// entities selected, min weight raised — so Reset Filters is visible and
// the status caption reads "8 nodes · 4 edges".
const INITIAL_EDGES_ON: Record<EdgeType, boolean> = {
  entity: true,
  temporal: true,
  semantic: false,
  caused_by: true,
};
const INITIAL_ENTITIES = ['Sarah', 'Portland trip'];
const INITIAL_MIN_WEIGHT = 0.35;

// ============= SHARED BITS =============

/**
 * 8px type-colored dot; StatusDot with the graph color vocabulary. Pass an
 * empty label when adjacent text already names the type (decorative dot).
 */
function ColorDot({color, label}: {color: string; label: string}) {
  return (
    <StatusDot
      variant="neutral"
      label={label}
      aria-hidden={label.length === 0 || undefined}
      style={{backgroundColor: color}}
    />
  );
}

function nodeLabel(id: string): string {
  return NODE_BY_ID.get(id)?.title ?? id;
}

// ============= FILTER RAIL =============

interface FilterState {
  typesOn: Record<FactType, boolean>;
  edgesOn: Record<EdgeType, boolean>;
  selectedEntities: string[];
  minWeight: number;
}

function FiltersTab({
  state,
  onToggleType,
  onToggleEdge,
  onMinWeight,
  onReset,
  hasActiveFilters,
}: {
  state: FilterState;
  onToggleType: (type: FactType, isOn: boolean) => void;
  onToggleEdge: (type: EdgeType, isOn: boolean) => void;
  onMinWeight: (value: number) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label" color="secondary">
          Memory types
        </Text>
        <HStack gap={2} style={styles.pillWrap}>
          {FACT_TYPES.map(type => (
            <ToggleButton
              key={type}
              label={FACT_TYPE[type].label}
              size="sm"
              icon={<ColorDot color={FACT_TYPE[type].dot} label="" />}
              isPressed={state.typesOn[type]}
              onPressedChange={isOn => onToggleType(type, isOn)}
            />
          ))}
        </HStack>
      </VStack>

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Edge types
        </Text>
        <HStack gap={2} style={styles.pillWrap}>
          {EDGE_TYPES.map(type => (
            <ToggleButton
              key={type}
              label={EDGE_TYPE[type].label}
              size="sm"
              icon={<ColorDot color={EDGE_TYPE[type].dot} label="" />}
              isPressed={state.edgesOn[type]}
              onPressedChange={isOn => onToggleEdge(type, isOn)}
            />
          ))}
        </HStack>
      </VStack>

      <Divider />

      <Slider
        label="Minimum edge weight"
        min={0}
        max={1}
        step={0.01}
        value={state.minWeight}
        onChange={onMinWeight}
        valueDisplay="text"
        formatValue={value => value.toFixed(2)}
      />

      {hasActiveFilters && (
        <Button
          label="Reset filters"
          variant="secondary"
          size="sm"
          onClick={onReset}
        />
      )}
    </VStack>
  );
}

function EntitiesTab({
  selectedEntities,
  onChange,
}: {
  selectedEntities: string[];
  onChange: (values: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const lowered = query.trim().toLowerCase();
  const visibleEntities = ENTITIES.filter(entity =>
    entity.name.toLowerCase().includes(lowered),
  );

  return (
    <VStack gap={3}>
      <TextInput
        label="Filter entities"
        isLabelHidden
        size="sm"
        startIcon={MagnifyingGlassIcon}
        placeholder="Filter entities..."
        value={query}
        onChange={setQuery}
        hasClear
      />
      {visibleEntities.length === 0 ? (
        <EmptyState
          title="No entities match"
          description={`Nothing tracked matches “${query.trim()}”.`}
          isCompact
        />
      ) : (
        <CheckboxList
          label="Entities"
          isLabelHidden
          density="compact"
          value={selectedEntities}
          onChange={onChange}>
          {visibleEntities.map(entity => (
            <CheckboxListItem
              key={entity.name}
              label={entity.name}
              value={entity.name}
              endContent={
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {entity.mentions}
                </Text>
              }
            />
          ))}
        </CheckboxList>
      )}
      {lowered.length === 0 && (
        <Text type="supporting" color="secondary">
          + {HIDDEN_ENTITY_COUNT} more entities tracked
        </Text>
      )}
    </VStack>
  );
}

// ============= MEMORY LIST =============

function MemoryRows({
  nodes,
  selectedId,
  onSelect,
  onReset,
  hasActiveFilters,
}: {
  nodes: MemoryNode[];
  selectedId: string;
  onSelect: (id: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}) {
  const groups = FACT_TYPES.map(type => ({
    type,
    items: nodes.filter(node => node.factType === type),
  })).filter(group => group.items.length > 0);

  if (groups.length === 0) {
    return (
      <EmptyState
        title="No memories match"
        description="Loosen the type filters or clear the node search."
        icon={<Icon icon={InboxIcon} size="lg" />}
        actions={
          hasActiveFilters ? (
            <Button label="Reset filters" size="sm" onClick={onReset} />
          ) : undefined
        }
      />
    );
  }

  return (
    <VStack gap={0}>
      {groups.map(group => (
        <VStack gap={0} key={group.type}>
          <HStack gap={2} vAlign="center" style={styles.groupHeader}>
            <ColorDot
              color={FACT_TYPE[group.type].dot}
              label={`${FACT_TYPE[group.type].label} facts`}
            />
            <Text type="label" color="secondary">
              {FACT_TYPE[group.type].label}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {group.items.length}
            </Text>
          </HStack>
          <List density="compact" hasDividers>
            {group.items.map(node => (
              <ListItem
                key={node.id}
                label={node.title}
                description={`${node.id} · ${node.proofCount} ${
                  node.proofCount === 1 ? 'proof' : 'proofs'
                }`}
                startContent={
                  <ColorDot
                    color={FACT_TYPE[node.factType].dot}
                    label={`${FACT_TYPE[node.factType].label} fact`}
                  />
                }
                endContent={
                  <Text type="supporting" color="secondary">
                    {node.date}
                  </Text>
                }
                onClick={() => onSelect(node.id)}
                isSelected={node.id === selectedId}
              />
            ))}
          </List>
        </VStack>
      ))}
    </VStack>
  );
}

// ============= RELATIONS TABLE =============

function endpointCell(id: string) {
  return (
    <VStack gap={0}>
      <Text size="sm" maxLines={1}>
        {nodeLabel(id)}
      </Text>
      <Text type="supporting" color="secondary">
        {id}
      </Text>
    </VStack>
  );
}

function RelationsTable({edges}: {edges: MemoryEdge[]}) {
  if (edges.length === 0) {
    return (
      <EmptyState
        title="No relations match"
        description="Toggle more edge types on or lower the minimum weight."
        icon={<Icon icon={HashtagIcon} size="lg" />}
        isCompact
      />
    );
  }

  return (
    <Table
      data={edges}
      idKey="id"
      density="compact"
      hasHover
      textOverflow="truncate"
      columns={[
        {
          key: 'from',
          header: 'From',
          width: proportional(1),
          renderCell: edge => endpointCell(edge.from),
        },
        {
          key: 'type',
          header: 'Type',
          width: pixel(110),
          renderCell: edge => (
            <Badge
              variant={EDGE_TYPE[edge.type].badge}
              label={EDGE_TYPE[edge.type].label}
            />
          ),
        },
        {
          key: 'to',
          header: 'To',
          width: proportional(1),
          renderCell: edge => endpointCell(edge.to),
        },
        {
          key: 'via',
          header: 'Via',
          width: pixel(130),
          renderCell: edge =>
            edge.via != null ? (
              <Token label={edge.via} size="sm" />
            ) : (
              <Text type="supporting" color="secondary">
                —
              </Text>
            ),
        },
        {
          key: 'weight',
          header: 'Weight',
          width: pixel(130),
          align: 'end',
          renderCell: edge => (
            <Tooltip content={`Relation strength ${edge.weight.toFixed(2)} of 1.00`}>
              <HStack gap={2} vAlign="center" hAlign="end">
                <div style={styles.weightBar}>
                  <ProgressBar
                    value={edge.weight}
                    max={1}
                    label={`Weight ${edge.weight.toFixed(2)}`}
                    isLabelHidden
                    variant="accent"
                  />
                </div>
                <Text type="supporting" hasTabularNumbers>
                  {edge.weight.toFixed(2)}
                </Text>
              </HStack>
            </Tooltip>
          ),
        },
      ]}
    />
  );
}

// ============= DETAIL PANEL =============

function MemoryDetail({
  node,
  visibleEdges,
  selectedEntities,
  onToggleEntity,
}: {
  node: MemoryNode;
  visibleEdges: MemoryEdge[];
  selectedEntities: string[];
  onToggleEntity: (name: string) => void;
}) {
  const connectionCounts = EDGE_TYPES.map(type => ({
    type,
    count: visibleEdges.filter(
      edge =>
        edge.type === type && (edge.from === node.id || edge.to === node.id),
    ).length,
  })).filter(entry => entry.count > 0);

  const footer = connectionCounts
    .map(entry => `${EDGE_TYPE[entry.type].label} (${entry.count})`)
    .join(' · ');

  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Badge
            variant={FACT_TYPE[node.factType].badge}
            label={FACT_TYPE[node.factType].label}
          />
          <Text type="supporting" color="secondary">
            {node.id}
          </Text>
        </HStack>
        <Heading level={2}>{node.title}</Heading>
        <HStack gap={2} vAlign="center">
          <Badge variant="neutral" label={node.date} />
          <Tooltip
            content={`Backed by ${node.proofCount} source ${
              node.proofCount === 1 ? 'message' : 'messages'
            }`}>
            <Badge
              variant="neutral"
              label={`${node.proofCount} ${
                node.proofCount === 1 ? 'proof' : 'proofs'
              }`}
            />
          </Tooltip>
        </HStack>
      </VStack>

      <Divider />

      <Markdown>{node.body}</Markdown>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Entities
        </Text>
        <HStack gap={1} style={styles.entityWrap}>
          {node.entities.map(name => (
            <Token
              key={name}
              label={name}
              size="sm"
              color={selectedEntities.includes(name) ? 'blue' : 'default'}
              onClick={() => onToggleEntity(name)}
            />
          ))}
        </HStack>
        <Text type="supporting" color="secondary">
          Click an entity to toggle it in the filter rail.
        </Text>
      </VStack>

      <Divider />

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Connections
        </Text>
        {footer.length > 0 ? (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {footer}
          </Text>
        ) : (
          <Text type="supporting" color="secondary">
            No connections match the current filters.
          </Text>
        )}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function MemoryRelationExplorerTemplate() {
  const [railTab, setRailTab] = useState('filters');
  const [typesOn, setTypesOn] =
    useState<Record<FactType, boolean>>(DEFAULT_TYPES_ON);
  const [edgesOn, setEdgesOn] =
    useState<Record<EdgeType, boolean>>(INITIAL_EDGES_ON);
  const [selectedEntities, setSelectedEntities] =
    useState<string[]>(INITIAL_ENTITIES);
  const [minWeight, setMinWeight] = useState(INITIAL_MIN_WEIGHT);
  const [nodeQuery, setNodeQuery] = useState('');
  const [selectedId, setSelectedId] = useState('m_042');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isRailOpen, setIsRailOpen] = useState(false);

  // Responsive contract: detail panel hides <=1200px (Dialog takes over);
  // the filter rail collapses behind a header toggle <=900px.
  const hasDetailPanel = !useMediaQuery('(max-width: 1200px)');
  const isRailCollapsed = useMediaQuery('(max-width: 900px)');

  const hasActiveFilters =
    FACT_TYPES.some(type => typesOn[type] !== DEFAULT_TYPES_ON[type]) ||
    EDGE_TYPES.some(type => edgesOn[type] !== DEFAULT_EDGES_ON[type]) ||
    selectedEntities.length > 0 ||
    minWeight !== DEFAULT_MIN_WEIGHT;

  const resetFilters = () => {
    setTypesOn(DEFAULT_TYPES_ON);
    setEdgesOn(DEFAULT_EDGES_ON);
    setSelectedEntities([]);
    setMinWeight(DEFAULT_MIN_WEIGHT);
  };

  // Node filters: fact-type pills + node search.
  const visibleNodes = useMemo(() => {
    const lowered = nodeQuery.trim().toLowerCase();
    return MEMORY_NODES.filter(node => {
      if (!typesOn[node.factType]) {
        return false;
      }
      if (lowered.length === 0) {
        return true;
      }
      return (
        node.title.toLowerCase().includes(lowered) ||
        node.id.toLowerCase().includes(lowered) ||
        node.entities.some(name => name.toLowerCase().includes(lowered))
      );
    });
  }, [typesOn, nodeQuery]);

  // Edge filters: both endpoints visible, edge-type pill on, weight above
  // the floor, and — when entities are checked — the edge must run through
  // a selected entity (via label or either endpoint's entity list).
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(visibleNodes.map(node => node.id));
    return MEMORY_EDGES.filter(edge => {
      if (!visibleIds.has(edge.from) || !visibleIds.has(edge.to)) {
        return false;
      }
      if (!edgesOn[edge.type] || edge.weight < minWeight) {
        return false;
      }
      if (selectedEntities.length === 0) {
        return true;
      }
      const touched = new Set([
        ...(edge.via != null ? [edge.via] : []),
        ...(NODE_BY_ID.get(edge.from)?.entities ?? []),
        ...(NODE_BY_ID.get(edge.to)?.entities ?? []),
      ]);
      return selectedEntities.some(name => touched.has(name));
    });
  }, [visibleNodes, edgesOn, minWeight, selectedEntities]);

  const selectedNode = NODE_BY_ID.get(selectedId) ?? MEMORY_NODES[0];

  const selectNode = (id: string) => {
    setSelectedId(id);
    if (!hasDetailPanel) {
      setIsDetailDialogOpen(true);
    }
  };

  const toggleEntity = (name: string) => {
    setSelectedEntities(prev =>
      prev.includes(name)
        ? prev.filter(entry => entry !== name)
        : [...prev, name],
    );
  };

  const filterState: FilterState = {
    typesOn,
    edgesOn,
    selectedEntities,
    minWeight,
  };

  const rail = (
    <VStack gap={0} style={styles.contentFill}>
      <div style={styles.railTabs}>
        <TabList value={railTab} onChange={setRailTab} size="sm" hasDivider>
          <Tab value="filters" label="Filters" />
          <Tab
            value="entities"
            label="Entities"
            endContent={
              selectedEntities.length > 0 ? (
                <Badge
                  variant="info"
                  label={String(selectedEntities.length)}
                />
              ) : undefined
            }
          />
        </TabList>
      </div>
      <StackItem size="fill" style={styles.railBody}>
        {railTab === 'filters' ? (
          <FiltersTab
            state={filterState}
            onToggleType={(type, isOn) =>
              setTypesOn(prev => ({...prev, [type]: isOn}))
            }
            onToggleEdge={(type, isOn) =>
              setEdgesOn(prev => ({...prev, [type]: isOn}))
            }
            onMinWeight={setMinWeight}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        ) : (
          <EntitiesTab
            selectedEntities={selectedEntities}
            onChange={setSelectedEntities}
          />
        )}
      </StackItem>
    </VStack>
  );

  const detail = (
    <MemoryDetail
      node={selectedNode}
      visibleEdges={visibleEdges}
      selectedEntities={selectedEntities}
      onToggleEntity={toggleEntity}
    />
  );

  // <=1200px the end panel is hidden, so the same detail content opens in
  // a Dialog when a memory is selected.
  const detailDialog = !hasDetailPanel && (
    <Dialog
      isOpen={isDetailDialogOpen}
      onOpenChange={setIsDetailDialogOpen}
      purpose="info"
      width="min(560px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title="Memory details"
          subtitle={selectedNode.id}
          onOpenChange={setIsDetailDialogOpen}
        />
        {detail}
      </VStack>
    </Dialog>
  );

  return (
    <>
      {detailDialog}
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              {isRailCollapsed && (
                <IconButton
                  label={isRailOpen ? 'Hide filters' : 'Show filters'}
                  tooltip={isRailOpen ? 'Hide filters' : 'Show filters'}
                  icon={<Icon icon={Cog6ToothIcon} size="sm" color="inherit" />}
                  variant={isRailOpen ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsRailOpen(prev => !prev)}
                />
              )}
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>Memory</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {MEMORY_NODES.length} memories on file
                  </Text>
                </HStack>
              </StackItem>
              <div style={styles.headerSearch}>
                <TextInput
                  label="Search nodes"
                  isLabelHidden
                  size="sm"
                  startIcon={MagnifyingGlassIcon}
                  placeholder="Search nodes..."
                  value={nodeQuery}
                  onChange={setNodeQuery}
                  hasClear
                />
              </div>
            </HStack>
          </LayoutHeader>
        }
        start={
          isRailCollapsed && !isRailOpen ? undefined : (
            <LayoutPanel width={340} padding={0} label="Memory filters">
              {rail}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <VStack gap={0} style={styles.contentFill}>
              <HStack gap={2} vAlign="center" style={styles.statusRow}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {visibleNodes.length} nodes · {visibleEdges.length} edges
                </Text>
                {hasActiveFilters && (
                  <Badge variant="neutral" label="filters active" />
                )}
              </HStack>
              <Divider />
              <StackItem size="fill" style={styles.centerScroll}>
                <MemoryRows
                  nodes={visibleNodes}
                  selectedId={selectedId}
                  onSelect={selectNode}
                  onReset={resetFilters}
                  hasActiveFilters={hasActiveFilters}
                />
                <HStack gap={2} vAlign="center" style={styles.relationsHeader}>
                  <Heading level={3}>Relations</Heading>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {visibleEdges.length} of {MEMORY_EDGES.length}
                  </Text>
                </HStack>
                <div style={styles.relationsTable}>
                  <RelationsTable edges={visibleEdges} />
                </div>
              </StackItem>
            </VStack>
          </LayoutContent>
        }
        end={
          hasDetailPanel ? (
            <LayoutPanel width={380} label="Memory details">
              {detail}
            </LayoutPanel>
          ) : undefined
        }
      />
    </>
  );
}
