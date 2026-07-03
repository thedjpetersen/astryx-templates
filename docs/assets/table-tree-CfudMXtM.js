var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a workspace drive tree: folders and
 *   files with owner, size/item count, and fixed updated dates)
 * @output Tree / hierarchical table for a team drive: header with search,
 *   expand/collapse-all controls, and an upload action; a full-width Table
 *   whose Name column carries depth indentation and per-folder chevron
 *   toggles, plus Type, Owner, Size, and Updated columns
 * @position Page template; emitted by \`astryx template table-tree\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the drive
 * title + folder/file counts, a search input, Expand all / Collapse all, and
 * the "Upload" primary action. LayoutContent holds a single data-driven
 * Table — the tree is flattened to visible rows so every hierarchy level
 * shares the same column grid (no per-level tables, no misaligned columns).
 *
 * Interaction contract:
 * - Open-folder state lives in useState as a Set of node ids; the tree is
 *   flattened against that set on each render, so toggling a chevron
 *   inserts/removes exactly that folder's descendants.
 * - Searching prunes the tree to branches with a matching name anywhere
 *   beneath them and force-expands the pruned branches (chevrons disable
 *   while a query is active); clearing the query restores manual state.
 * - Expand all / Collapse all replace the whole open-folder set.
 *
 * Responsive contract:
 * - >768px: header shows title + counts, a 260px search field, Expand
 *   all / Collapse all, and Upload in one row.
 * - <=768px: the counts caption and Expand/Collapse all buttons hide; the
 *   search field flexes to fill the remaining header width. The per-folder
 *   chevron grows to a 40px tap target (leaf rows reserve the same 40px so
 *   names stay aligned) — it is the sole expand/collapse control on phones.
 * - Table: Name is proportional (min-width floor) and truncates long names;
 *   Type/Size/Updated are pixel columns so numeric/date cells stay stable.
 *   Below ~600px the pixel columns force the table region to scroll
 *   horizontally while the page chrome keeps width.
 */

import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChevronRightIcon,
  FileTextIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Chevron rotates 0deg → 90deg on expand; the wrapper span (not the
  // button) carries the transform so focus rings stay upright.
  chevron: {
    display: 'inline-flex',
    transition: 'transform 120ms ease',
    transform: 'rotate(0deg)',
  },
  chevronOpen: {
    transform: 'rotate(90deg)',
  },
  // Reserves the chevron button's footprint on leaf rows so file names
  // align with sibling folder names at the same depth.
  chevronSpacer: {
    display: 'inline-block',
    width: 28,
    flexShrink: 0,
  },
  // <=768px: the chevron grows from the 28px \`sm\` chrome to a 40px tap
  // target — with Expand/Collapse all hidden it is the only way to open a
  // folder on phones. The leaf spacer widens to match so names stay aligned.
  chevronTouch: {width: 40, height: 40},
  chevronSpacerTouch: {width: 40},
  // Numeric cells use tabular numerals so size and date digits stay
  // column-aligned.
  numericCell: {fontVariantNumeric: 'tabular-nums'},
  emptyResults: {padding: 'var(--spacing-8) 0'},
};

/** Per-level indent for the Name column, in pixels. */
const INDENT_PER_LEVEL = 20;

// ============= DATA =============

type NodeType =
  | 'folder'
  | 'figma'
  | 'pdf'
  | 'markdown'
  | 'image'
  | 'vector'
  | 'spreadsheet'
  | 'config'
  | 'deck';

const TYPE_LABEL: Record<NodeType, string> = {
  folder: 'Folder',
  figma: 'Figma',
  pdf: 'PDF',
  markdown: 'Markdown',
  image: 'Image',
  vector: 'Vector',
  spreadsheet: 'Spreadsheet',
  config: 'Config',
  deck: 'Deck',
};

interface FileNode {
  id: string;
  name: string;
  type: NodeType;
  owner: string;
  /** Formatted file size; folders show a derived "<n> items" instead. */
  size?: string;
  /** Fixed, pre-formatted date — no clocks in fixtures. */
  updated: string;
  children?: FileNode[];
}

// Shared team drive for a product org. Two top-level folders start
// expanded so the hierarchy is visible on first paint.
const DRIVE: FileNode[] = [
  {
    id: 'brand',
    name: 'Brand assets',
    type: 'folder',
    owner: 'Dana Whitfield',
    updated: 'Jun 27, 2026',
    children: [
      {
        id: 'brand-logos',
        name: 'Logos',
        type: 'folder',
        owner: 'Dana Whitfield',
        updated: 'Jun 24, 2026',
        children: [
          {
            id: 'brand-wordmark',
            name: 'atlas-wordmark.svg',
            type: 'vector',
            owner: 'Dana Whitfield',
            size: '84 KB',
            updated: 'Jun 24, 2026',
          },
          {
            id: 'brand-mark-dark',
            name: 'atlas-mark-dark.png',
            type: 'image',
            owner: 'Dana Whitfield',
            size: '312 KB',
            updated: 'May 30, 2026',
          },
          {
            id: 'brand-mark-light',
            name: 'atlas-mark-light.png',
            type: 'image',
            owner: 'Dana Whitfield',
            size: '298 KB',
            updated: 'May 30, 2026',
          },
        ],
      },
      {
        id: 'brand-guidelines',
        name: 'brand-guidelines-v4.pdf',
        type: 'pdf',
        owner: 'Dana Whitfield',
        size: '18.6 MB',
        updated: 'Jun 27, 2026',
      },
      {
        id: 'brand-voice',
        name: 'voice-and-tone.md',
        type: 'markdown',
        owner: 'Lena Fischer',
        size: '12 KB',
        updated: 'Jun 11, 2026',
      },
    ],
  },
  {
    id: 'specs',
    name: 'Product specs',
    type: 'folder',
    owner: 'Miguel Santos',
    updated: 'Jun 30, 2026',
    children: [
      {
        id: 'specs-checkout',
        name: 'Checkout redesign',
        type: 'folder',
        owner: 'Miguel Santos',
        updated: 'Jun 30, 2026',
        children: [
          {
            id: 'specs-checkout-prd',
            name: 'prd-checkout-redesign.md',
            type: 'markdown',
            owner: 'Miguel Santos',
            size: '46 KB',
            updated: 'Jun 30, 2026',
          },
          {
            id: 'specs-checkout-flows',
            name: 'checkout-flows.fig',
            type: 'figma',
            owner: 'Aisha Karim',
            size: '9.4 MB',
            updated: 'Jun 28, 2026',
          },
          {
            id: 'specs-checkout-pricing',
            name: 'pricing-matrix.xlsx',
            type: 'spreadsheet',
            owner: 'Tom Brennan',
            size: '221 KB',
            updated: 'Jun 19, 2026',
          },
        ],
      },
      {
        id: 'specs-onboarding',
        name: 'Onboarding v2',
        type: 'folder',
        owner: 'Lena Fischer',
        updated: 'Jun 22, 2026',
        children: [
          {
            id: 'specs-onboarding-prd',
            name: 'prd-onboarding-v2.md',
            type: 'markdown',
            owner: 'Lena Fischer',
            size: '38 KB',
            updated: 'Jun 22, 2026',
          },
          {
            id: 'specs-onboarding-funnel',
            name: 'activation-funnel.xlsx',
            type: 'spreadsheet',
            owner: 'Tom Brennan',
            size: '184 KB',
            updated: 'Jun 17, 2026',
          },
        ],
      },
    ],
  },
  {
    id: 'eng',
    name: 'Engineering',
    type: 'folder',
    owner: 'Priya Raman',
    updated: 'Jun 29, 2026',
    children: [
      {
        id: 'eng-runbooks',
        name: 'Runbooks',
        type: 'folder',
        owner: 'Priya Raman',
        updated: 'Jun 29, 2026',
        children: [
          {
            id: 'eng-runbooks-incident',
            name: 'incident-response.md',
            type: 'markdown',
            owner: 'Priya Raman',
            size: '29 KB',
            updated: 'Jun 29, 2026',
          },
          {
            id: 'eng-runbooks-oncall',
            name: 'oncall-rotation.md',
            type: 'markdown',
            owner: 'Priya Raman',
            size: '11 KB',
            updated: 'Jun 15, 2026',
          },
        ],
      },
      {
        id: 'eng-api-style',
        name: 'api-style-guide.md',
        type: 'markdown',
        owner: 'Tom Brennan',
        size: '52 KB',
        updated: 'Jun 08, 2026',
      },
      {
        id: 'eng-service-catalog',
        name: 'service-catalog.yaml',
        type: 'config',
        owner: 'Priya Raman',
        size: '8 KB',
        updated: 'Jun 26, 2026',
      },
    ],
  },
  {
    id: 'research',
    name: 'Research',
    type: 'folder',
    owner: 'Aisha Karim',
    updated: 'Jun 25, 2026',
    children: [
      {
        id: 'research-interviews',
        name: '2026 Q2 user interviews',
        type: 'folder',
        owner: 'Aisha Karim',
        updated: 'Jun 25, 2026',
        children: [
          {
            id: 'research-interviews-b1',
            name: 'interview-notes-batch-1.md',
            type: 'markdown',
            owner: 'Aisha Karim',
            size: '64 KB',
            updated: 'Jun 12, 2026',
          },
          {
            id: 'research-interviews-b2',
            name: 'interview-notes-batch-2.md',
            type: 'markdown',
            owner: 'Aisha Karim',
            size: '71 KB',
            updated: 'Jun 25, 2026',
          },
        ],
      },
      {
        id: 'research-nps',
        name: 'nps-survey-results.xlsx',
        type: 'spreadsheet',
        owner: 'Tom Brennan',
        size: '402 KB',
        updated: 'Jun 20, 2026',
      },
    ],
  },
  {
    id: 'all-hands',
    name: 'all-hands-2026-07.key',
    type: 'deck',
    owner: 'Miguel Santos',
    size: '31.2 MB',
    updated: 'Jul 01, 2026',
  },
];

const INITIALLY_EXPANDED = ['brand', 'specs'];

// ============= TREE HELPERS =============

/** Every folder id in the tree — the "Expand all" set. */
function collectFolderIds(nodes: FileNode[], into: string[] = []): string[] {
  for (const node of nodes) {
    if (node.children) {
      into.push(node.id);
      collectFolderIds(node.children, into);
    }
  }
  return into;
}

const ALL_FOLDER_IDS = collectFolderIds(DRIVE);

function countNodes(nodes: FileNode[]): {folders: number; files: number} {
  let folders = 0;
  let files = 0;
  for (const node of nodes) {
    if (node.children) {
      folders += 1;
      const nested = countNodes(node.children);
      folders += nested.folders;
      files += nested.files;
    } else {
      files += 1;
    }
  }
  return {folders, files};
}

const TOTALS = countNodes(DRIVE);

/**
 * Prunes the tree to branches whose own name matches, or that contain a
 * matching descendant. Matching folders keep their full subtree.
 */
function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const result: FileNode[] = [];
  for (const node of nodes) {
    const selfMatches = node.name.toLowerCase().includes(query);
    if (selfMatches) {
      result.push(node);
      continue;
    }
    if (node.children) {
      const matchingChildren = filterTree(node.children, query);
      if (matchingChildren.length > 0) {
        result.push({...node, children: matchingChildren});
      }
    }
  }
  return result;
}

/** One visible table row: a tree node plus its rendered depth. */
interface TreeRow extends Record<string, unknown> {
  id: string;
  node: FileNode;
  depth: number;
  isExpanded: boolean;
}

/**
 * Flattens the tree against the open-folder set. While a search query is
 * active every pruned branch is force-expanded so matches are visible.
 */
function flattenTree(
  nodes: FileNode[],
  expandedIds: ReadonlySet<string>,
  forceExpand: boolean,
  depth = 0,
  into: TreeRow[] = [],
): TreeRow[] {
  for (const node of nodes) {
    const isExpanded =
      node.children != null && (forceExpand || expandedIds.has(node.id));
    into.push({id: node.id, node, depth, isExpanded});
    if (node.children && isExpanded) {
      flattenTree(node.children, expandedIds, forceExpand, depth + 1, into);
    }
  }
  return into;
}

// ============= PAGE =============

export default function TableTreeTemplate() {
  const [query, setQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(INITIALLY_EXPANDED),
  );
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const toggleFolder = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const rows = useMemo(() => {
    const tree = isSearching ? filterTree(DRIVE, normalizedQuery) : DRIVE;
    return flattenTree(tree, expandedIds, isSearching);
  }, [expandedIds, isSearching, normalizedQuery]);

  const columns = useMemo<TableColumn<TreeRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        width: proportional(2),
        renderCell: row => (
          <HStack gap={1} vAlign="center">
            {/* Depth indent — the whole hierarchy shares one column grid. */}
            <span style={{width: row.depth * INDENT_PER_LEVEL, flexShrink: 0}} />
            {row.node.children ? (
              <IconButton
                label={\`\${row.isExpanded ? 'Collapse' : 'Expand'} \${row.node.name}\`}
                icon={
                  <span
                    style={{
                      ...styles.chevron,
                      ...(row.isExpanded ? styles.chevronOpen : undefined),
                    }}>
                    <Icon icon={ChevronRightIcon} size="sm" />
                  </span>
                }
                variant="ghost"
                size="sm"
                isDisabled={isSearching}
                onClick={() => toggleFolder(row.id)}
                style={isNarrow ? styles.chevronTouch : undefined}
              />
            ) : (
              <span
                style={{
                  ...styles.chevronSpacer,
                  ...(isNarrow ? styles.chevronSpacerTouch : undefined),
                }}
              />
            )}
            <Icon
              icon={row.node.children ? FolderIcon : FileTextIcon}
              size="sm"
            />
            <Text type="body" maxLines={1}>
              {row.node.name}
            </Text>
          </HStack>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        width: pixel(110),
        renderCell: row => (
          <Text type="supporting" color="secondary">
            {TYPE_LABEL[row.node.type]}
          </Text>
        ),
      },
      {
        key: 'owner',
        header: 'Owner',
        width: proportional(1),
        renderCell: row => (
          <HStack gap={2} vAlign="center">
            <Avatar name={row.node.owner} size="xsmall" />
            <Text type="body" maxLines={1}>
              {row.node.owner}
            </Text>
          </HStack>
        ),
      },
      {
        key: 'size',
        header: 'Size',
        width: pixel(100),
        align: 'end',
        renderCell: row => (
          <span style={styles.numericCell}>
            <Text type="body">
              {row.node.children
                ? \`\${row.node.children.length} items\`
                : row.node.size}
            </Text>
          </span>
        ),
      },
      {
        key: 'updated',
        header: 'Updated',
        width: pixel(120),
        renderCell: row => (
          <span style={styles.numericCell}>
            <Text type="supporting" color="secondary">
              {row.node.updated}
            </Text>
          </span>
        ),
      },
    ],
    [isNarrow, isSearching, toggleFolder],
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size={isNarrow ? 'static' : 'fill'}>
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Team drive</Heading>
                {isNarrow ? null : (
                  <Text type="supporting" color="secondary">
                    {TOTALS.folders} folders · {TOTALS.files} files
                  </Text>
                )}
              </HStack>
            </StackItem>
            <StackItem size={isNarrow ? 'fill' : 'static'}>
              <TextInput
                label="Search files and folders"
                isLabelHidden
                placeholder="Search files and folders"
                value={query}
                onChange={setQuery}
                hasClear
                size="sm"
                width={isNarrow ? '100%' : '260px'}
                startIcon={<Icon icon={SearchIcon} size="sm" />}
              />
            </StackItem>
            {isNarrow ? null : (
              <>
                <Button
                  label="Expand all"
                  variant="ghost"
                  size="sm"
                  isDisabled={isSearching}
                  onClick={() => setExpandedIds(new Set(ALL_FOLDER_IDS))}
                />
                <Button
                  label="Collapse all"
                  variant="ghost"
                  size="sm"
                  isDisabled={isSearching}
                  onClick={() => setExpandedIds(new Set())}
                />
              </>
            )}
            <Button label="Upload" icon={<Icon icon={PlusIcon} size="sm" />} />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          {rows.length === 0 ? (
            <div style={styles.emptyResults}>
              <EmptyState
                icon={<Icon icon={SearchIcon} size="lg" />}
                title="No matches"
                description={\`Nothing in this drive matches “\${query.trim()}”.\`}
              />
            </div>
          ) : (
            <VStack gap={2}>
              {isSearching ? (
                <Text type="supporting" color="secondary">
                  {rows.length} results for “{query.trim()}”
                </Text>
              ) : null}
              <Table<TreeRow>
                data={rows}
                columns={columns}
                idKey="id"
                density="compact"
                dividers="rows"
                hasHover
              />
            </VStack>
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};