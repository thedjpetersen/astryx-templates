// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (two workspace scopes of assistant
 *   files with fixed sizes and relative-date labels, markdown/shell file
 *   contents, three-entry version histories with one restorable snapshot,
 *   a short background chat transcript)
 * @output Dialog-style workspace files browser over a dimmed chat: a large
 *   open Dialog whose left rail carries a scope TabList (Personal / Atlas
 *   team), a file search input, and a TreeList of folders and files with
 *   size + relative-date metadata; the right viewer pane shows path
 *   Breadcrumbs, a Rendered/Source SegmentedControl, a Markdown render (or
 *   CodeBlock source) of the selected file, a History Popover with Restore
 *   actions, and a Share button with copied-state feedback. Selecting tree
 *   nodes swaps the viewer between distinct file fixtures.
 * @position Page template; emitted by `astryx template workspace-files-browser`
 *
 * Frame: the page behind the modal is a Layout height="fill" chat shell
 * (slim header + short ChatLayout transcript) that the Dialog backdrop
 * dims. The Dialog (width min(940px, 94vw)) hosts its own Layout with a
 * DialogHeader and a two-pane body: fixed 280px file rail + fluid viewer.
 * Closing the dialog reveals the chat; a "Workspace files" header button
 * reopens it.
 *
 * Responsive contract:
 * - The dialog body measures its own width with a ResizeObserver
 *   (useElementWidth) because viewport media queries never fire in the
 *   demo's inline stage.
 * - >640px body width: rail and viewer sit side by side; each pane
 *   scrolls independently inside a fixed-height body.
 * - <=640px: the body stacks — scope tabs, search, and a capped-height
 *   tree scroller above the viewer; the viewer toolbar wraps onto
 *   multiple lines and the dialog itself scrolls.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Markdown} from '@astryxdesign/core/Markdown';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {
  CheckIcon,
  FileCode2Icon,
  FileTextIcon,
  FolderIcon,
  HistoryIcon,
  Link2Icon,
  RotateCcwIcon,
  SearchIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Fixed-height two-pane dialog body; each pane scrolls on its own.
  body: {height: 'min(540px, 62vh)'},
  bodyRow: {height: '100%'},
  rail: {
    width: 280,
    height: '100%',
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    padding: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-2)',
  },
  railScroll: {
    flex: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  // <=640px: the tree becomes a capped scroller above the viewer.
  railScrollCompact: {
    maxHeight: 220,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-2)',
  },
  viewer: {
    height: '100%',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  viewerToolbar: {
    padding: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-2)',
  },
  viewerToolbarWrap: {flexWrap: 'wrap'},
  viewerScroll: {
    flex: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  viewerScrollCompact: {
    paddingInline: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-3)',
  },
  // 10-11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  eyebrowRow: {
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  noMatches: {padding: 'var(--spacing-3)'},
  popoverBody: {padding: 'var(--spacing-3)'},
  versionRow: {paddingBlock: 'var(--spacing-2)'},
  chatColumn: {height: '100%', maxWidth: 760, marginInline: 'auto'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    marginBlock: 'var(--spacing-2)',
  },
};

// ============= RESPONSIVE HELPER =============
// The demo's inline stage is ~1045-1075px wide inside a 1440px window, so
// viewport media queries never fire there; measure the dialog body itself.

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ============= DATA =============
// Deterministic fixtures: fixed sizes, static relative-date labels, no
// clocks, no randomness. "Now" for this surface is 2026-07-13 morning.

const ASSISTANT_NAME = 'Atlas Copilot';
const SESSION_TITLE = 'queue migration prep';

type ScopeId = 'personal' | 'team';

const SCOPE_LABELS: Record<ScopeId, string> = {
  personal: 'Personal',
  team: 'Atlas team',
};

type FileLanguage = 'markdown' | 'bash';

interface FileVersion {
  id: string;
  label: string;
  savedAt: string;
  author: string;
  delta: string;
  /** Older content shown when this version is restored (optional). */
  snapshot?: string;
}

interface WorkspaceFile {
  id: string;
  path: string;
  size: string;
  edited: string;
  language: FileLanguage;
  content: string;
  versions: FileVersion[];
}

const MEMORY_SNAPSHOT_V12 = `# Memory Index

Long-lived notes the assistant loads at session start.

- **Deploy ritual** — ship train leaves Tuesday 10:00 PT
- **Sandbox quotas** — shared nodes cap at 8 vCPU

## Standing preferences

1. Summaries as bullets, five max
`;

const PERSONAL_FILES: WorkspaceFile[] = [
  {
    id: 'p-memory',
    path: 'memory/MEMORY.md',
    size: '4.2 KB',
    edited: '2 hours ago',
    language: 'markdown',
    content: `# Memory Index

Long-lived notes the assistant loads at session start.

- **Deploy ritual** — ship train leaves Tuesday 10:00 PT; ping #atlas-release before promoting
- **Sandbox quotas** — shared nodes cap at 8 vCPU; request burst tokens from infra a day ahead
- **Queue migration** — consumer lag flattens once \`prefetch=64\`; window confirmed July 15

## Standing preferences

1. Summaries as bullets, five max
2. Include token estimates on long-context work
3. Never auto-archive sessions tagged \`keep\`
`,
    versions: [
      {
        id: 'p-memory-v14',
        label: 'v14',
        savedAt: 'Jul 13 · 09:42',
        author: 'you',
        delta: '+18 −4',
      },
      {
        id: 'p-memory-v13',
        label: 'v13',
        savedAt: 'Jul 11 · 16:08',
        author: 'assistant',
        delta: '+6 −2',
      },
      {
        id: 'p-memory-v12',
        label: 'v12',
        savedAt: 'Jul 9 · 08:15',
        author: 'you',
        delta: '+41 −0',
        snapshot: MEMORY_SNAPSHOT_V12,
      },
    ],
  },
  {
    id: 'p-note-0710',
    path: 'notes/2026-07-10.md',
    size: '2.8 KB',
    edited: '3 days ago',
    language: 'markdown',
    content: `# Daily note — July 10

## Focus

- [x] Review Priya's schema diff
- [ ] Finish rollout plan for the queue migration
- [ ] Draft on-call handoff for next week

## Worth keeping

> Migration window confirmed for **July 15, 06:00 UTC** — infra wants a dry run on the 14th.

Consumer lag flattened after setting \`prefetch=64\` on the staging consumers.
`,
    versions: [
      {
        id: 'p-note-0710-v5',
        label: 'v5',
        savedAt: 'Jul 10 · 17:31',
        author: 'you',
        delta: '+9 −1',
      },
      {
        id: 'p-note-0710-v4',
        label: 'v4',
        savedAt: 'Jul 10 · 11:02',
        author: 'assistant',
        delta: '+14 −0',
      },
      {
        id: 'p-note-0710-v3',
        label: 'v3',
        savedAt: 'Jul 10 · 08:47',
        author: 'you',
        delta: '+3 −3',
      },
    ],
  },
  {
    id: 'p-note-retro',
    path: 'notes/release-retro.md',
    size: '3.5 KB',
    edited: 'Jun 30',
    language: 'markdown',
    content: `# Release retro — 2026.26

**What went well**

- Canary caught the config regression before the 1% rollout
- Rollback rehearsal paid off: 4 minutes to restore

**What to change**

- Freeze window was announced late; automate the calendar hold
- Alert routing sent pages to the old rotation
`,
    versions: [
      {
        id: 'p-note-retro-v3',
        label: 'v3',
        savedAt: 'Jun 30 · 15:20',
        author: 'you',
        delta: '+7 −2',
      },
      {
        id: 'p-note-retro-v2',
        label: 'v2',
        savedAt: 'Jun 30 · 14:05',
        author: 'assistant',
        delta: '+22 −0',
      },
      {
        id: 'p-note-retro-v1',
        label: 'v1',
        savedAt: 'Jun 30 · 13:58',
        author: 'you',
        delta: '+11 −0',
      },
    ],
  },
  {
    id: 'p-script-backups',
    path: 'scripts/rotate-backups.sh',
    size: '1.1 KB',
    edited: 'Jun 24',
    language: 'bash',
    content: `#!/usr/bin/env bash
set -euo pipefail

KEEP=14
DEST="$HOME/backups/workspace"

find "$DEST" -name '*.tar.zst' -mtime +"$KEEP" -print -delete
tar --zstd -cf "$DEST/ws-$(date +%F).tar.zst" ~/workspace
echo "kept last $KEEP days in $DEST"
`,
    versions: [
      {
        id: 'p-script-backups-v4',
        label: 'v4',
        savedAt: 'Jun 24 · 10:12',
        author: 'you',
        delta: '+2 −2',
      },
      {
        id: 'p-script-backups-v3',
        label: 'v3',
        savedAt: 'Jun 20 · 09:44',
        author: 'assistant',
        delta: '+5 −1',
      },
      {
        id: 'p-script-backups-v2',
        label: 'v2',
        savedAt: 'Jun 17 · 18:30',
        author: 'you',
        delta: '+9 −0',
      },
    ],
  },
];

const TEAM_FILES: WorkspaceFile[] = [
  {
    id: 't-runbook-deploy',
    path: 'runbooks/deploy-checklist.md',
    size: '5.0 KB',
    edited: 'yesterday',
    language: 'markdown',
    content: `# Deploy checklist

Run top to bottom; do not skip the canary soak.

1. Confirm the release branch is green on CI
2. Post the freeze notice in **#atlas-release**
3. Promote to canary and soak for 30 minutes
4. Watch \`error_rate\` and \`p95_latency\` dashboards
5. Promote to 100% or roll back — no partial states overnight

## Rollback

\`\`\`bash
atlasctl release rollback --env prod --to last-good
\`\`\`
`,
    versions: [
      {
        id: 't-runbook-deploy-v9',
        label: 'v9',
        savedAt: 'Jul 12 · 15:06',
        author: 'Dana',
        delta: '+12 −8',
      },
      {
        id: 't-runbook-deploy-v8',
        label: 'v8',
        savedAt: 'Jul 8 · 11:40',
        author: 'assistant',
        delta: '+4 −4',
      },
      {
        id: 't-runbook-deploy-v7',
        label: 'v7',
        savedAt: 'Jul 1 · 09:12',
        author: 'Marcus',
        delta: '+16 −2',
      },
    ],
  },
  {
    id: 't-note-standup',
    path: 'notes/standup-2026-07-09.md',
    size: '1.9 KB',
    edited: '4 days ago',
    language: 'markdown',
    content: `# Standup — July 9

**Priya** — schema diff ready for review; blocked on staging creds

**Marcus** — queue migration dry run scheduled for July 14

**Dana** — closing out alert-routing cleanup; two rotations left
`,
    versions: [
      {
        id: 't-note-standup-v2',
        label: 'v2',
        savedAt: 'Jul 9 · 10:18',
        author: 'assistant',
        delta: '+6 −0',
      },
      {
        id: 't-note-standup-v1',
        label: 'v1',
        savedAt: 'Jul 9 · 10:05',
        author: 'Priya',
        delta: '+18 −0',
      },
      {
        id: 't-note-standup-v0',
        label: 'v0',
        savedAt: 'Jul 9 · 09:58',
        author: 'Priya',
        delta: '+2 −0',
      },
    ],
  },
  {
    id: 't-script-seed',
    path: 'scripts/seed-sandbox.sh',
    size: '0.8 KB',
    edited: 'Jun 18',
    language: 'bash',
    content: `#!/usr/bin/env bash
set -euo pipefail

atlasctl sandbox reset --env team-atlas --yes
atlasctl fixtures load ./fixtures/atlas-seed.json
echo "sandbox seeded with 240 fixture rows"
`,
    versions: [
      {
        id: 't-script-seed-v3',
        label: 'v3',
        savedAt: 'Jun 18 · 14:22',
        author: 'Marcus',
        delta: '+1 −1',
      },
      {
        id: 't-script-seed-v2',
        label: 'v2',
        savedAt: 'Jun 12 · 16:51',
        author: 'assistant',
        delta: '+3 −0',
      },
      {
        id: 't-script-seed-v1',
        label: 'v1',
        savedAt: 'Jun 12 · 16:44',
        author: 'Marcus',
        delta: '+8 −0',
      },
    ],
  },
];

const SCOPE_FILES: Record<ScopeId, WorkspaceFile[]> = {
  personal: PERSONAL_FILES,
  team: TEAM_FILES,
};

const FILE_ICON: Record<FileLanguage, typeof FileTextIcon> = {
  markdown: FileTextIcon,
  bash: FileCode2Icon,
};

// ============= TREE BUILDING =============

function fileName(path: string): string {
  const parts = path.split('/');
  return parts[parts.length - 1];
}

/**
 * Groups flat file paths by their top-level folder into TreeList items.
 * Folders stay expanded (this is a browse-first surface); a non-empty
 * query filters files by full-path substring and hides empty folders.
 */
function buildTreeItems(
  files: WorkspaceFile[],
  scope: ScopeId,
  selectedId: string,
  query: string,
  onSelect: (fileId: string) => void,
): TreeListItemData[] {
  const needle = query.trim().toLowerCase();
  const visible =
    needle.length === 0
      ? files
      : files.filter(file => file.path.toLowerCase().includes(needle));

  const folders = new Map<string, TreeListItemData[]>();
  for (const file of visible) {
    const folder = file.path.split('/')[0];
    const item: TreeListItemData = {
      id: file.id,
      label: fileName(file.path),
      description: `${file.size} · ${file.edited}`,
      startContent: (
        <Icon icon={FILE_ICON[file.language]} size="sm" color="secondary" />
      ),
      isSelected: file.id === selectedId,
      onClick: () => onSelect(file.id),
    };
    const bucket = folders.get(folder);
    if (bucket == null) {
      folders.set(folder, [item]);
    } else {
      bucket.push(item);
    }
  }

  return Array.from(folders.entries()).map(([folder, children]) => ({
    id: `folder-${scope}-${folder}`,
    label: folder,
    isExpanded: true,
    startContent: <Icon icon={FolderIcon} size="sm" color="secondary" />,
    children,
  }));
}

// ============= PAGE =============

export default function WorkspaceFilesBrowserTemplate() {
  const [isOpen, setIsOpen] = useState(true);
  const [scope, setScope] = useState<ScopeId>('personal');
  const [selectedId, setSelectedId] = useState(PERSONAL_FILES[0].id);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('rendered');
  // fileId -> restored version id (latest stays current when absent).
  const [restoredVersions, setRestoredVersions] = useState<
    Record<string, string>
  >({});
  const [isCopied, setIsCopied] = useState(false);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const bodyWidth = useElementWidth(bodyRef);
  const isCompact = bodyWidth > 0 && bodyWidth <= 640;

  // Copied-state feedback on the Share button resets after a beat.
  useEffect(() => {
    if (!isCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isCopied]);

  const files = SCOPE_FILES[scope];
  const selectedFile = files.find(file => file.id === selectedId) ?? files[0];

  const restoredVersion = selectedFile.versions.find(
    version => version.id === restoredVersions[selectedFile.id],
  );
  const viewerContent = restoredVersion?.snapshot ?? selectedFile.content;
  const isMarkdown = selectedFile.language === 'markdown';
  const showsSource = viewMode === 'source' || !isMarkdown;

  const switchScope = (next: string) => {
    const nextScope = next as ScopeId;
    setScope(nextScope);
    setSelectedId(SCOPE_FILES[nextScope][0].id);
    setQuery('');
  };

  const selectFile = (fileId: string) => {
    setSelectedId(fileId);
    setViewMode('rendered');
  };

  const restoreVersion = (versionId: string) => {
    setRestoredVersions(prev => ({...prev, [selectedFile.id]: versionId}));
  };

  const undoRestore = () => {
    setRestoredVersions(prev => {
      const next = {...prev};
      delete next[selectedFile.id];
      return next;
    });
  };

  const treeItems = buildTreeItems(files, scope, selectedFile.id, query, selectFile);
  const pathParts = selectedFile.path.split('/');

  // ---- Left rail (scope tabs, search, tree) ----

  const railHeader = (
    <VStack gap={2} style={styles.railHeader}>
      <TabList value={scope} onChange={switchScope} size="sm" hasDivider>
        <Tab value="personal" label="Personal" />
        <Tab value="team" label="Atlas team" />
      </TabList>
      <TextInput
        label="Search files"
        isLabelHidden
        size="sm"
        placeholder="Search files…"
        startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
        value={query}
        onChange={setQuery}
      />
    </VStack>
  );

  const treeArea = (
    <>
      <HStack gap={2} vAlign="center" style={styles.eyebrowRow}>
        <StackItem size="fill">
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            All files
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {files.length} files
        </Text>
      </HStack>
      {treeItems.length > 0 ? (
        <TreeList items={treeItems} density="compact" />
      ) : (
        <div style={styles.noMatches}>
          <Text type="supporting" color="secondary">
            No files match “{query.trim()}”
          </Text>
        </div>
      )}
    </>
  );

  // ---- Viewer pane ----

  const historyPanel = (
    <div style={styles.popoverBody}>
      <VStack gap={0}>
        <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
          Version history
        </Text>
        {selectedFile.versions.map((version, index) => {
          const isCurrent =
            restoredVersion == null
              ? index === 0
              : restoredVersion.id === version.id;
          return (
            <VStack key={version.id} gap={0}>
              <HStack gap={2} vAlign="center" style={styles.versionRow}>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <HStack gap={2} vAlign="center">
                      <Text type="label" size="sm">
                        {version.label}
                      </Text>
                      {isCurrent && <Badge label="Current" variant="info" />}
                    </HStack>
                    <Text type="supporting" color="secondary">
                      {version.savedAt} · {version.author} · {version.delta}
                    </Text>
                  </VStack>
                </StackItem>
                {!isCurrent && (
                  <Button
                    label={`Restore ${version.label}`}
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                    onClick={() => restoreVersion(version.id)}>
                    Restore
                  </Button>
                )}
              </HStack>
              {index < selectedFile.versions.length - 1 && <Divider />}
            </VStack>
          );
        })}
      </VStack>
    </div>
  );

  const viewerToolbar = (
    <VStack gap={2} style={styles.viewerToolbar}>
      <HStack
        gap={2}
        vAlign="center"
        style={isCompact ? styles.viewerToolbarWrap : undefined}>
        <StackItem size="fill">
          <Breadcrumbs>
            <BreadcrumbItem>{SCOPE_LABELS[scope]}</BreadcrumbItem>
            {pathParts.map((part, index) => (
              <BreadcrumbItem key={part} isCurrent={index === pathParts.length - 1}>
                {part}
              </BreadcrumbItem>
            ))}
          </Breadcrumbs>
        </StackItem>
        <SegmentedControl
          value={showsSource ? 'source' : 'rendered'}
          onChange={setViewMode}
          label="View mode"
          size="sm">
          <SegmentedControlItem value="rendered" label="Rendered" />
          <SegmentedControlItem value="source" label="Source" />
        </SegmentedControl>
        <Popover
          label="Version history"
          placement="below"
          alignment="end"
          width={300}
          content={historyPanel}>
          <Button
            label="History"
            variant="ghost"
            size="sm"
            icon={<Icon icon={HistoryIcon} size="sm" color="inherit" />}
          />
        </Popover>
        <Button
          label={isCopied ? 'Link copied' : 'Share'}
          variant={isCopied ? 'secondary' : 'primary'}
          size="sm"
          icon={
            <Icon
              icon={isCopied ? CheckIcon : Link2Icon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setIsCopied(true)}
        />
      </HStack>
      <Text type="supporting" color="secondary">
        Edited {selectedFile.edited} · {selectedFile.size} ·{' '}
        {selectedFile.versions.length} versions
      </Text>
      {restoredVersion != null && (
        <Banner
          status="info"
          title={`Restored ${restoredVersion.label}`}
          description={
            restoredVersion.snapshot != null
              ? `Snapshot from ${restoredVersion.savedAt} is now shown below.`
              : `Snapshot from ${restoredVersion.savedAt} is now current.`
          }
          endContent={
            <Button label="Undo" variant="ghost" size="sm" onClick={undoRestore} />
          }
        />
      )}
    </VStack>
  );

  const viewerBody = (
    <div
      style={{
        ...styles.viewerScroll,
        ...(isCompact ? styles.viewerScrollCompact : undefined),
      }}>
      {showsSource ? (
        <VStack gap={2}>
          {!isMarkdown && viewMode === 'rendered' && (
            <Text type="supporting" color="secondary">
              Plain-text file — showing source
            </Text>
          )}
          <CodeBlock
            code={viewerContent}
            language={isMarkdown ? 'markdown' : 'bash'}
            size="sm"
            width="100%"
          />
        </VStack>
      ) : (
        <Markdown density="compact" headingLevelStart={2}>
          {viewerContent}
        </Markdown>
      )}
    </div>
  );

  const dialogBody = isCompact ? (
    <div ref={bodyRef}>
      <VStack gap={0}>
        {railHeader}
        <div style={styles.railScrollCompact}>{treeArea}</div>
        <Divider />
        {viewerToolbar}
        {viewerBody}
      </VStack>
    </div>
  ) : (
    <div ref={bodyRef} style={styles.body}>
      <HStack gap={0} style={styles.bodyRow} vAlign="stretch">
        <div style={styles.rail}>
          {railHeader}
          <div style={styles.railScroll}>{treeArea}</div>
        </div>
        <StackItem size="fill">
          <div style={styles.viewer}>
            {viewerToolbar}
            {viewerBody}
          </div>
        </StackItem>
      </HStack>
    </div>
  );

  // ---- Dimmed chat behind the modal ----

  const backgroundComposer = (
    <div style={styles.composerCard}>
      <VStack gap={2}>
        <TextArea
          label={`Message ${ASSISTANT_NAME}`}
          isLabelHidden
          rows={2}
          placeholder="Type a message…"
          value=""
          onChange={() => {}}
        />
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            The assistant can read and edit workspace files
          </Text>
          <StackItem size="fill" />
          <Button label="Send" size="sm" onClick={() => {}} />
        </HStack>
      </VStack>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <StatusDot variant="success" label="Agent idle" />
              </HStack>
            </StackItem>
            <Button
              label="Workspace files"
              variant="secondary"
              size="sm"
              icon={<Icon icon={FolderIcon} size="sm" color="inherit" />}
              onClick={() => setIsOpen(true)}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.chatColumn}>
            <ChatLayout composer={backgroundComposer}>
              <ChatMessageList density="balanced">
                <ChatSystemMessage variant="divider">
                  Monday, July 13
                </ChatSystemMessage>
                <ChatMessage sender="user">
                  <ChatMessageBubble>
                    Pull up the migration notes before the dry run — I want to
                    confirm the window we agreed on.
                  </ChatMessageBubble>
                </ChatMessage>
                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    The July 10 daily note has the confirmed window: July 15,
                    06:00 UTC, with a dry run on the 14th. Opening the
                    workspace files so you can double-check.
                  </ChatMessageBubble>
                </ChatMessage>
              </ChatMessageList>
            </ChatLayout>
          </div>
          <Dialog
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            purpose="info"
            width="min(940px, 94vw)"
            maxHeight="min(720px, 88vh)">
            <Layout
              header={
                <DialogHeader
                  title="Workspace files"
                  subtitle="Files the assistant reads and edits in this workspace"
                  onOpenChange={setIsOpen}
                  hasDivider
                />
              }
              content={<LayoutContent padding={0}>{dialogBody}</LayoutContent>}
            />
          </Dialog>
        </LayoutContent>
      }
    />
  );
}
