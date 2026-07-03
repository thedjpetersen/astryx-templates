var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (workspace file tree, file contents,
 *   version history rows — fixed ISO timestamps, no clocks or randomness)
 * @output Two-pane workspace file browser: LayoutHeader with title and scope
 *   TabList, a 300px navigation-tree panel (search with clear + fuzzy-match
 *   highlight, TreeList with file-type icons, modified Timestamps, and a
 *   lazy-load Skeleton directory), and a rich preview pane with Breadcrumbs,
 *   Code / Rendered / History SegmentedControl, share + download IconButtons,
 *   a syntax-highlighted CodeBlock body, and a version-history drawer with a
 *   Restore Button per row
 * @position Page template; emitted by \`astryx template file-browser-preview\`
 *
 * Responsive contract:
 * - >768px: tree panel fixed at 300px (LayoutPanel start); preview fills the
 *   remaining width. The history drawer is a 320px LayoutPanel end when open.
 *   The header keeps title and scope TabList on one row (tabs pinned right).
 * - <=768px: panes stack into a single view — tree first; selecting a file
 *   swaps to the preview, which gains a back Button; the history drawer is
 *   suppressed (History still selectable, the code body stays visible). The
 *   header stacks: the scope TabList drops to its own row below the title so
 *   all three tabs stay reachable at 375px instead of clipping off-viewport.
 * - Preview header: breadcrumbs truncate via minWidth 0; at narrow widths
 *   the view-mode control and action buttons wrap onto a second row under
 *   the breadcrumbs (flexWrap) rather than clipping.
 *
 * Interaction contract:
 * - Tree expand/collapse is handled by TreeList (chevrons, internal state
 *   seeded via isExpanded); clicking a file row swaps the preview.
 * - Scope tabs swap the whole tree (Workspace files / Personal / Uploads);
 *   Uploads is an EmptyState with an upload CTA.
 * - The search input filters files across the active scope; results replace
 *   the tree with a flat List whose matched path segment is highlighted.
 * - History opens by default (drawer state on display); Restore marks a
 *   prior version current and announces it via a visually-hidden live region.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  DownloadIcon,
  FileCodeIcon,
  FileJsonIcon,
  FileTextIcon,
  FolderIcon,
  HistoryIcon,
  InboxIcon,
  RotateCcwIcon,
  SearchIcon,
  Share2Icon,
  UploadIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  paneSearch: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  paneScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-3)',
  },
  paneFootnote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  previewHeader: {
    alignItems: 'center',
    padding: 'var(--spacing-2) var(--spacing-4)',
    flexWrap: 'wrap',
  },
  // Breadcrumb trail truncates; when even the truncated row is too narrow,
  // the fixed-width controls wrap under it (previewHeader flexWrap).
  breadcrumbTrail: {
    minWidth: 0,
    overflow: 'hidden',
  },
  previewBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  emptyStateFill: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  historyHeader: {
    alignItems: 'center',
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  historyScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-3)',
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

// ============= DATA =============

type Scope = 'workspace' | 'personal';
type ScopeTab = Scope | 'uploads';
type ViewMode = 'code' | 'rendered' | 'history';
type FileKind = 'code' | 'markdown' | 'config';

interface WorkspaceFile {
  id: string;
  /** Full path within the scope root, e.g. 'src/components/chart.tsx'. */
  path: string;
  kind: FileKind;
  language: string;
  /** Fixed ISO timestamp — rendered via <Timestamp>, never computed. */
  modified: string;
  content: string;
}

interface FileVersion {
  id: string;
  label: string;
  author: string;
  size: string;
  savedAt: string;
}

/** Tree shape per scope: directories are declared, files reference FILES. */
type TreeSpecNode =
  | {
      kind: 'dir';
      id: string;
      label: string;
      isExpanded?: boolean;
      /** Lazy-loaded node still fetching — renders Skeleton child rows. */
      isLoading?: boolean;
      children?: TreeSpecNode[];
    }
  | {kind: 'file'; fileId: string};

const CHART_TSX = \`import {useMemo} from 'react';

import {scaleLinear} from '../lib/scales';
import type {Series} from '../types';

interface TrendChartProps {
  series: Series;
  width: number;
  height: number;
}

/** Sparkline-style trend chart used on the overview cards. */
export function TrendChart({series, width, height}: TrendChartProps) {
  const path = useMemo(() => {
    const x = scaleLinear([0, series.points.length - 1], [0, width]);
    const y = scaleLinear(series.extent, [height, 0]);
    return series.points
      .map((point, index) => {
        const command = index === 0 ? 'M' : 'L';
        return command + x(index).toFixed(1) + ' ' + y(point).toFixed(1);
      })
      .join(' ');
  }, [series, width, height]);

  return (
    <svg viewBox={'0 0 ' + width + ' ' + height} role="img">
      <title>{series.label}</title>
      <path d={path} fill="none" strokeWidth={1.5} />
    </svg>
  );
}
\`;

const DATA_TABLE_TSX = \`import type {Row} from '../types';

interface DataTableProps {
  rows: Row[];
  onRowClick: (id: string) => void;
}

/** Dense read-only table for the metrics drill-down view. */
export function DataTable({rows, onRowClick}: DataTableProps) {
  return (
    <table>
      <tbody>
        {rows.map(row => (
          <tr key={row.id} onClick={() => onRowClick(row.id)}>
            <td>{row.label}</td>
            <td>{row.value.toLocaleString('en-US')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
\`;

const FILTER_BAR_TSX = \`import {useState} from 'react';

const SEGMENTS = ['24h', '7d', '30d', '90d'] as const;

/** Time-range filter bar shared by every dashboard page. */
export function FilterBar({onChange}: {onChange: (range: string) => void}) {
  const [range, setRange] = useState<string>('7d');
  return (
    <div role="radiogroup" aria-label="Time range">
      {SEGMENTS.map(segment => (
        <button
          key={segment}
          role="radio"
          aria-checked={segment === range}
          onClick={() => {
            setRange(segment);
            onChange(segment);
          }}>
          {segment}
        </button>
      ))}
    </div>
  );
}
\`;

const README_MD = \`# pulse-web

Frontend for the Pulse analytics dashboard.

## Getting started

1. Install dependencies with pnpm install
2. Copy app.config.json.example to app.config.json
3. Run pnpm dev and open localhost:3000

## Project layout

- **src/components** — presentational building blocks (charts, tables)
- **src/hooks** — data-fetching and viewport hooks
- **app.config.json** — per-environment API endpoints and feature flags

## Conventions

Components are function-only, typed props, no default exports outside
route files. Charts read from the shared scale helpers in src/lib.
\`;

const APP_CONFIG_JSON = \`{
  "apiBaseUrl": "https://api.pulse.example.com/v2",
  "refreshIntervalSeconds": 30,
  "featureFlags": {
    "newFilterBar": true,
    "denseTableMode": false,
    "exportToCsv": true
  },
  "retention": {
    "rawEventsDays": 30,
    "rollupsDays": 365
  }
}
\`;

const NOTES_MD = \`# Scratch notes

- Ask design about the empty-state illustration for exports
- The p95 chart clips on 4k displays — file a bug with a screenshot
- Try the new scaleLog helper on the retention curve
\`;

const QUERY_TS = \`/** One-off query helper — not shipped, personal scratch only. */
export async function fetchSlowQueries(limit: number) {
  const response = await fetch('/api/debug/slow-queries?limit=' + limit);
  if (!response.ok) {
    throw new Error('slow-queries failed: ' + response.status);
  }
  return response.json();
}
\`;

const FILES: Record<string, WorkspaceFile> = {
  'file-chart': {
    id: 'file-chart',
    path: 'src/components/chart.tsx',
    kind: 'code',
    language: 'tsx',
    modified: '2026-06-28T14:32:00',
    content: CHART_TSX,
  },
  'file-data-table': {
    id: 'file-data-table',
    path: 'src/components/data-table.tsx',
    kind: 'code',
    language: 'tsx',
    modified: '2026-06-26T09:18:00',
    content: DATA_TABLE_TSX,
  },
  'file-filter-bar': {
    id: 'file-filter-bar',
    path: 'src/components/filter-bar.tsx',
    kind: 'code',
    language: 'tsx',
    modified: '2026-06-27T16:05:00',
    content: FILTER_BAR_TSX,
  },
  'file-readme': {
    id: 'file-readme',
    path: 'README.md',
    kind: 'markdown',
    language: 'markdown',
    modified: '2026-06-21T11:40:00',
    content: README_MD,
  },
  'file-config': {
    id: 'file-config',
    path: 'app.config.json',
    kind: 'config',
    language: 'json',
    modified: '2026-06-24T08:52:00',
    content: APP_CONFIG_JSON,
  },
  'file-notes': {
    id: 'file-notes',
    path: 'notes.md',
    kind: 'markdown',
    language: 'markdown',
    modified: '2026-06-29T18:10:00',
    content: NOTES_MD,
  },
  'file-query': {
    id: 'file-query',
    path: 'scratch/query.ts',
    kind: 'code',
    language: 'ts',
    modified: '2026-06-25T13:27:00',
    content: QUERY_TS,
  },
};

const TREES: Record<Scope, TreeSpecNode[]> = {
  workspace: [
    {
      kind: 'dir',
      id: 'dir-src',
      label: 'src',
      isExpanded: true,
      children: [
        {
          kind: 'dir',
          id: 'dir-components',
          label: 'components',
          isExpanded: true,
          children: [
            {kind: 'file', fileId: 'file-chart'},
            {kind: 'file', fileId: 'file-data-table'},
            {kind: 'file', fileId: 'file-filter-bar'},
          ],
        },
        // Lazy-loaded directory: listing is still in flight, so the
        // expanded node shows Skeleton placeholder rows instead of files.
        {
          kind: 'dir',
          id: 'dir-hooks',
          label: 'hooks',
          isExpanded: true,
          isLoading: true,
        },
      ],
    },
    {kind: 'file', fileId: 'file-readme'},
    {kind: 'file', fileId: 'file-config'},
  ],
  personal: [
    {
      kind: 'dir',
      id: 'dir-scratch',
      label: 'scratch',
      isExpanded: true,
      children: [{kind: 'file', fileId: 'file-query'}],
    },
    {kind: 'file', fileId: 'file-notes'},
  ],
};

const SCOPE_FILE_IDS: Record<Scope, string[]> = {
  workspace: [
    'file-chart',
    'file-data-table',
    'file-filter-bar',
    'file-readme',
    'file-config',
  ],
  personal: ['file-query', 'file-notes'],
};

// Version history, newest first. Only files that have been edited more
// than once carry history — others get the compact empty state.
const FILE_HISTORY: Record<string, FileVersion[]> = {
  'file-chart': [
    {
      id: 'v14',
      label: 'v14 — Add accessible title to the svg',
      author: 'Rowan Ellis',
      size: '2.4 KB',
      savedAt: '2026-06-28T14:32:00',
    },
    {
      id: 'v13',
      label: 'v13 — Memoize the path computation',
      author: 'Ines Duarte',
      size: '2.3 KB',
      savedAt: '2026-06-27T10:04:00',
    },
    {
      id: 'v12',
      label: 'v12 — Switch to shared scale helpers',
      author: 'Rowan Ellis',
      size: '2.1 KB',
      savedAt: '2026-06-24T17:46:00',
    },
    {
      id: 'v11',
      label: 'v11 — Initial sparkline extraction',
      author: 'Theo Malik',
      size: '1.8 KB',
      savedAt: '2026-06-19T09:12:00',
    },
  ],
  'file-readme': [
    {
      id: 'v3',
      label: 'v3 — Document the config copy step',
      author: 'Ines Duarte',
      size: '1.1 KB',
      savedAt: '2026-06-21T11:40:00',
    },
    {
      id: 'v2',
      label: 'v2 — Add project layout section',
      author: 'Rowan Ellis',
      size: '0.9 KB',
      savedAt: '2026-06-15T15:22:00',
    },
  ],
};

const FILE_KIND_ICON: Record<FileKind, typeof FileCodeIcon> = {
  code: FileCodeIcon,
  markdown: FileTextIcon,
  config: FileJsonIcon,
};

function fileName(path: string): string {
  const segments = path.split('/');
  return segments[segments.length - 1];
}

// ============= TREE BUILDING =============

/** Skeleton placeholder rows for a directory whose listing is loading. */
function buildLoadingRows(dirId: string): TreeListItemData[] {
  return [112, 88].map((width, index) => ({
    id: \`\${dirId}-loading-\${index}\`,
    label: <Skeleton width={width} height={12} radius={1} index={index} />,
    startContent: <Skeleton width={16} height={16} radius={1} index={index} />,
    isDisabled: true,
  }));
}

function buildTreeItems(
  specs: TreeSpecNode[],
  selectedId: string | null,
  onSelect: (fileId: string) => void,
): TreeListItemData[] {
  return specs.map(spec => {
    if (spec.kind === 'dir') {
      return {
        id: spec.id,
        label: spec.label,
        isExpanded: spec.isExpanded,
        startContent: <Icon icon={FolderIcon} size="sm" color="secondary" />,
        children: spec.isLoading
          ? buildLoadingRows(spec.id)
          : buildTreeItems(spec.children ?? [], selectedId, onSelect),
      };
    }
    const file = FILES[spec.fileId];
    return {
      id: file.id,
      label: fileName(file.path),
      startContent: (
        <Icon icon={FILE_KIND_ICON[file.kind]} size="sm" color="secondary" />
      ),
      endContent: <Timestamp value={file.modified} format="date" />,
      isSelected: file.id === selectedId,
      onClick: () => onSelect(file.id),
    };
  });
}

// ============= SEARCH =============

interface SearchMatch {
  file: WorkspaceFile;
  index: number;
}

/**
 * Path search with the matched span highlighted. Real fuzzy matchers
 * (subsequence + ranking) plug in here; the fixture ranks by earliest
 * match position, then shortest path.
 */
function searchFiles(scope: Scope, query: string): SearchMatch[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') {
    return [];
  }
  return SCOPE_FILE_IDS[scope]
    .map(fileId => {
      const file = FILES[fileId];
      return {file, index: file.path.toLowerCase().indexOf(normalized)};
    })
    .filter(match => match.index >= 0)
    .sort(
      (a, b) => a.index - b.index || a.file.path.length - b.file.path.length,
    );
}

function HighlightedPath({
  path,
  matchIndex,
  matchLength,
}: {
  path: string;
  matchIndex: number;
  matchLength: number;
}) {
  return (
    <Text type="body" color="secondary" display="inline" maxLines={1}>
      {path.slice(0, matchIndex)}
      <Text
        as="span"
        type="inherit"
        weight="semibold"
        color="primary"
        display="inline">
        {path.slice(matchIndex, matchIndex + matchLength)}
      </Text>
      {path.slice(matchIndex + matchLength)}
    </Text>
  );
}

// ============= PAGE =============

export default function FileBrowserPreviewTemplate() {
  const [scopeTab, setScopeTab] = useState<ScopeTab>('workspace');
  // Selection is remembered per scope so switching tabs round-trips.
  const [selectedByScope, setSelectedByScope] = useState<
    Record<Scope, string>
  >({workspace: 'file-chart', personal: 'file-notes'});
  // History drawer open by default — the drawer state is on display.
  const [view, setView] = useState<ViewMode>('history');
  const [query, setQuery] = useState('');
  const [restoredVersions, setRestoredVersions] = useState<
    Record<string, string>
  >({});
  const [announcement, setAnnouncement] = useState('');
  // Mobile contract: tree first; selecting a file swaps to the preview.
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
  const isNarrow = useMediaQuery('(max-width: 768px)');

  const scope: Scope = scopeTab === 'uploads' ? 'workspace' : scopeTab;
  const selectedFile = FILES[selectedByScope[scope]];
  const scopeFileCount = SCOPE_FILE_IDS[scope].length;

  const selectFile = (fileId: string) => {
    setSelectedByScope(prev => ({...prev, [scope]: fileId}));
    setIsMobilePreviewOpen(true);
  };

  const treeItems = useMemo(
    () => buildTreeItems(TREES[scope], selectedFile.id, selectFile),
    // selectFile is recreated per render but only closes over \`scope\`,
    // which is already a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scope, selectedFile.id],
  );

  const searchMatches = useMemo(
    () => searchFiles(scope, query),
    [scope, query],
  );
  const isSearching = query.trim() !== '';

  const versions = FILE_HISTORY[selectedFile.id] ?? [];
  const currentVersionId = restoredVersions[selectedFile.id] ?? versions[0]?.id;

  const handleRestore = (version: FileVersion) => {
    setRestoredVersions(prev => ({...prev, [selectedFile.id]: version.id}));
    setAnnouncement(
      \`Restored \${fileName(selectedFile.path)} to \${version.label}\`,
    );
  };

  const handleScopeChange = (value: string) => {
    setScopeTab(value as ScopeTab);
    setQuery('');
    setIsMobilePreviewOpen(false);
  };

  // ---- Left pane: search + tree (or flat search results) ----

  const treePane = (
    <div style={styles.pane}>
      <div style={styles.paneSearch}>
        <TextInput
          label="Search files"
          isLabelHidden
          size="sm"
          placeholder="Search files..."
          startIcon={SearchIcon}
          hasClear
          value={query}
          onChange={setQuery}
        />
      </div>
      <div style={styles.paneScroll}>
        {isSearching ? (
          searchMatches.length === 0 ? (
            <EmptyState
              isCompact
              icon={<Icon icon={SearchIcon} size="lg" />}
              title="No matches"
              description={\`Nothing in \${
                scope === 'workspace' ? 'workspace files' : 'personal files'
              } matches "\${query.trim()}".\`}
            />
          ) : (
            <List
              density="compact"
              hasDividers={false}
              header={
                <Text type="supporting" color="secondary">
                  {searchMatches.length}{' '}
                  {searchMatches.length === 1 ? 'match' : 'matches'} — fuzzy,
                  best path match first
                </Text>
              }>
              {searchMatches.map(({file, index}) => (
                <ListItem
                  key={file.id}
                  label={
                    <HighlightedPath
                      path={file.path}
                      matchIndex={index}
                      matchLength={query.trim().length}
                    />
                  }
                  startContent={
                    <Icon
                      icon={FILE_KIND_ICON[file.kind]}
                      size="sm"
                      color="secondary"
                    />
                  }
                  isSelected={file.id === selectedFile.id}
                  onClick={() => selectFile(file.id)}
                />
              ))}
            </List>
          )
        ) : (
          <TreeList
            density="compact"
            items={treeItems}
            header={
              <Text type="label" size="sm" color="secondary">
                {scope === 'workspace' ? 'pulse-web · main' : 'Personal'}
              </Text>
            }
          />
        )}
      </div>
      <Divider />
      <div style={styles.paneFootnote}>
        <HStack gap={1} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {scopeFileCount} files
          </Text>
          <Text type="supporting" color="secondary">
            · synced
          </Text>
          <Timestamp value="2026-06-30T07:15:00" format="date_time" />
        </HStack>
      </div>
    </div>
  );

  // ---- Right pane: preview header + body ----

  const pathSegments = selectedFile.path.split('/');

  const previewHeader = (
    <HStack gap={2} style={styles.previewHeader}>
      {isNarrow && (
        <Button
          label="All files"
          variant="ghost"
          size="sm"
          onClick={() => setIsMobilePreviewOpen(false)}
        />
      )}
      <StackItem size="fill" style={styles.breadcrumbTrail}>
        <Breadcrumbs variant="supporting" label="File path">
          {pathSegments.map((segment, index) => (
            <BreadcrumbItem
              key={\`\${index}-\${segment}\`}
              isCurrent={index === pathSegments.length - 1}
              onClick={
                index === pathSegments.length - 1 ? undefined : () => {}
              }>
              {segment}
            </BreadcrumbItem>
          ))}
        </Breadcrumbs>
      </StackItem>
      <SegmentedControl
        label="View mode"
        size="sm"
        value={view}
        onChange={value => setView(value as ViewMode)}>
        <SegmentedControlItem value="code" label="Code" />
        <SegmentedControlItem value="rendered" label="Rendered" />
        <SegmentedControlItem value="history" label="History" />
      </SegmentedControl>
      <IconButton
        label={\`Share \${fileName(selectedFile.path)}\`}
        tooltip="Share"
        icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => {}}
      />
      <IconButton
        label={\`Download \${fileName(selectedFile.path)}\`}
        tooltip="Download"
        icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => {}}
      />
    </HStack>
  );

  // Rendered view only applies to Markdown; History keeps the code body
  // visible under the drawer so the comparison context never disappears.
  const previewBody =
    view === 'rendered' ? (
      selectedFile.kind === 'markdown' ? (
        <Markdown>{selectedFile.content}</Markdown>
      ) : (
        <div style={styles.emptyStateFill}>
          <EmptyState
            icon={<Icon icon={FileCodeIcon} size="lg" />}
            title="No rendered preview"
            description={\`\${fileName(
              selectedFile.path,
            )} is source code — only Markdown files render in the browser.\`}
            actions={
              <Button
                label="View code"
                variant="secondary"
                onClick={() => setView('code')}
              />
            }
          />
        </div>
      )
    ) : (
      <CodeBlock
        code={selectedFile.content}
        language={selectedFile.language}
        title={fileName(selectedFile.path)}
        hasLineNumbers
        hasCopyButton
        isWrapped
        width="100%"
      />
    );

  const previewPane = (
    <div style={styles.pane}>
      {previewHeader}
      <Divider />
      <div style={styles.previewBody}>{previewBody}</div>
    </div>
  );

  // ---- History drawer (right-side LayoutPanel) ----

  const historyPanel = (
    <div style={styles.historyPane}>
      <HStack gap={2} style={styles.historyHeader}>
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={5} accessibilityLevel={2}>
              Version history
            </Heading>
            <Text type="supporting" color="secondary" maxLines={1}>
              {fileName(selectedFile.path)}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label="Close history"
          tooltip="Close history"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={() => setView('code')}
        />
      </HStack>
      <Divider />
      <div style={styles.historyScroll}>
        {versions.length === 0 ? (
          <EmptyState
            isCompact
            icon={<Icon icon={HistoryIcon} size="lg" />}
            title="No earlier versions"
            description="This file has only been saved once — edits will appear here."
          />
        ) : (
          <List density="compact" hasDividers={false}>
            {versions.map(version => (
              <ListItem
                key={version.id}
                label={version.label}
                description={
                  // Wrap as whole tokens (date / author / size) so narrow
                  // widths never split a name mid-word or orphan a middot.
                  <HStack gap={1} vAlign="center" wrap="wrap">
                    <Timestamp value={version.savedAt} format="date_time" />
                    <Text type="supporting" color="secondary" maxLines={1}>
                      · {version.author}
                    </Text>
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers
                      maxLines={1}>
                      · {version.size}
                    </Text>
                  </HStack>
                }
                endContent={
                  version.id === currentVersionId ? (
                    <Badge label="Current" variant="neutral" />
                  ) : (
                    <Button
                      label="Restore"
                      variant="ghost"
                      size="sm"
                      icon={<Icon icon={RotateCcwIcon} size="sm" />}
                      onClick={() => handleRestore(version)}
                    />
                  )
                }
              />
            ))}
          </List>
        )}
      </div>
    </div>
  );

  // ---- Uploads scope: EmptyState with upload CTA, no panes ----

  const uploadsContent = (
    <div style={styles.emptyStateFill}>
      <EmptyState
        icon={<Icon icon={InboxIcon} size="lg" />}
        title="No uploads yet"
        description="Files you attach to a conversation land here, ready to reference from any session."
        actions={
          <Button
            label="Upload files"
            variant="primary"
            icon={<Icon icon={UploadIcon} size="sm" />}
            onClick={() => {}}
          />
        }
      />
    </div>
  );

  const isUploads = scopeTab === 'uploads';
  const showHistoryDrawer = view === 'history' && !isNarrow && !isUploads;

  // ---- Header: title row + scope tabs ----

  const headerTitle = (
    <HStack gap={2} vAlign="center">
      <Heading level={1}>Files</Heading>
      <Text type="supporting" color="secondary">
        Pulse Analytics
      </Text>
    </HStack>
  );

  const scopeTabs = (
    <TabList value={scopeTab} onChange={handleScopeChange} size="sm">
      <Tab value="workspace" label="Workspace files" />
      <Tab value="personal" label="Personal" />
      <Tab value="uploads" label="Uploads" />
    </TabList>
  );

  const mainContent = isUploads
    ? uploadsContent
    : isNarrow
      ? isMobilePreviewOpen
        ? previewPane
        : treePane
      : previewPane;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {isNarrow ? (
            // Tabs drop to their own row so all three scopes stay
            // reachable at 375px — a single row would clip them.
            <VStack gap={2}>
              {headerTitle}
              {scopeTabs}
            </VStack>
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">{headerTitle}</StackItem>
              {scopeTabs}
            </HStack>
          )}
        </LayoutHeader>
      }
      start={
        !isNarrow && !isUploads ? (
          <LayoutPanel width={300} padding={0}>
            {treePane}
          </LayoutPanel>
        ) : undefined
      }
      end={
        showHistoryDrawer ? (
          <LayoutPanel width={320} padding={0}>
            {historyPanel}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {mainContent}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};