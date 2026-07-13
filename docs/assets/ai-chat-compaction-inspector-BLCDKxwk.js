var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (long-running database-migration
 *   transcript with fixed ISO timestamps, two compaction marker records,
 *   before/after context-manifest diff text, a kept/dropped context tree,
 *   and four before → after compaction stats)
 * @output Full-height AI chat whose transcript carries two inline compaction
 *   marker chips between messages: a successful "Memory compacted" chip with
 *   a mono removal subtitle and an Inspect action, and a "Compaction failed"
 *   error chip whose Retry flips it into an in-progress state. Inspect opens
 *   a large "Compaction Details" Dialog (rendered open by default) with a
 *   TabList: Diff (two-column before/after context manifest as diff-language
 *   CodeBlocks), Tree (TreeList of model-context/… paths with kept/dropped
 *   Badges per node), and Stats (four stat Cards: Messages, Tokens,
 *   Reduction, Boundary)
 * @position Page template; emitted by \`astryx template
 *   ai-chat-compaction-inspector\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session chrome
 * (title, agent status, post-compaction context meter). LayoutContent
 * (padding 0) hosts a centered ChatLayout; the Dialog paints over the page
 * with the native backdrop. Unlike ai-chat-tool-stream this surface is about
 * *what compaction did to the context*, not what tools the agent ran.
 *
 * Responsive contract:
 * - Conversation column: maxWidth 880, centered; only the transcript
 *   scrolls — header and composer are fixed chrome.
 * - Dialog: width min(880px, 94vw) keeps comfortable margins on phones;
 *   body scrolls inside LayoutContent while the DialogHeader and footer
 *   actions stay pinned.
 * - Diff tab: the before/after manifest columns use a CSS grid with
 *   repeat(auto-fit, minmax(300px, 1fr)) so they sit side by side in the
 *   wide dialog and stack into one column on narrow screens — no JS
 *   measurement needed.
 * - Stats tab: stat cards flow on the same auto-fit grid (minmax 170px),
 *   4-up wide, 2-up or 1-up narrow.
 * - Compaction chips keep intrinsic width and center themselves; the mono
 *   subtitle truncates to one line rather than wrapping the pill.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {
  ArchiveIcon,
  ArchiveXIcon,
  FileTextIcon,
  FolderIcon,
  PaperclipIcon,
  RefreshCwIcon,
  SendIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered conversation column; ChatLayout owns transcript scrolling.
  chatColumn: {
    height: '100%',
    maxWidth: 880,
    marginInline: 'auto',
  },
  // Compaction markers sit centered between messages, like a system divider
  // that grew chrome.
  markerRow: {
    display: 'flex',
    justifyContent: 'center',
    paddingBlock: 'var(--spacing-2)',
  },
  markerPill: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    maxWidth: 620,
    minWidth: 0,
  },
  markerPillError: {
    border: 'var(--border-width) solid var(--color-error)',
    backgroundColor: 'var(--color-error-muted)',
  },
  markerTextCell: {minWidth: 0},
  // 10-11px uppercase tracking-wide eyebrows (column headers, stat labels).
  eyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  headerMeterBar: {width: 96},
  // Diff tab: before/after columns; auto-fit stacks them when narrow.
  diffGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  // Stats tab: 4-up stat cards that reflow on narrow screens.
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  tabPanel: {paddingTop: 'var(--spacing-3)'},
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'orders-db shard migration';
const ASSISTANT_NAME = 'Foundry Copilot';

// Post-compaction context usage shown in the header meter.
const CONTEXT_WINDOW = 200000;
const CONTEXT_USED = 32000;
const CONTEXT_USED_PCT = 16;

// Compaction run #1 — the successful marker and everything the Dialog shows.
const COMPACTION_SUBTITLE =
  '12 messages summarized · 45,000 tokens (38%) removed';
const COMPACTION_FAILED_SUBTITLE =
  'Summarizer timed out after 30s · context unchanged';
const COMPACTION_RETRYING_SUBTITLE =
  'Summarizing 18 messages · boundary at message 96';

// Two-column manifest diff: what run #1 removed from the old manifest and
// what it wrote into the new one. Token columns are space-padded so the
// numbers align in the mono block.
const MANIFEST_BEFORE = \`  manifest v41 · 120 entries · 120,000 tok
  model-context/system/prompt.md          2,140 tok
  model-context/system/tools.json         3,480 tok
- messages/0001-0042 (raw turns)         45,210 tok
  messages/0043-0120 (raw turns)         28,660 tok
- tool-results/bash/0007-0031            22,384 tok
  tool-results/web/0032-0035              4,118 tok
- files/orders/schema-v1.sql              6,912 tok
  files/orders/schema-v2.sql              7,148 tok
- files/runbooks/shard-backfill.md        3,806 tok
  skills/sql-migration/SKILL.md           1,860 tok
- memory/scratch/plan-draft.md            2,300 tok
- memory/decisions.md (stale copy)        1,120 tok\`;

const MANIFEST_AFTER = \`  manifest v42 · 64 entries · 60,000 tok
  model-context/system/prompt.md          2,140 tok
  model-context/system/tools.json         3,480 tok
+ summaries/compaction-001.md             3,910 tok
  messages/0043-0120 (raw turns)         28,660 tok
  tool-results/web/0032-0035              4,118 tok
  files/orders/schema-v2.sql              7,148 tok
  skills/sql-migration/SKILL.md           1,860 tok
+ memory/decisions.md (rewritten)           940 tok\`;

// Kept/dropped badge helpers for the Tree tab.
const KEPT_BADGE = <Badge label="kept" variant="success" />;
const DROPPED_BADGE = <Badge label="dropped" variant="error" />;

function folderIcon() {
  return <Icon icon={FolderIcon} size="sm" color="secondary" />;
}

function fileIcon() {
  return <Icon icon={FileTextIcon} size="sm" color="secondary" />;
}

function keptCount(text: string) {
  return (
    <Text type="supporting" color="secondary" hasTabularNumbers>
      {text}
    </Text>
  );
}

// Context tree after run #1: every node carries its fate.
const CONTEXT_TREE: TreeListItemData[] = [
  {
    id: 'model-context',
    label: 'model-context/',
    startContent: folderIcon(),
    endContent: keptCount('5 kept · 4 dropped'),
    isExpanded: true,
    children: [
      {
        id: 'mc-system',
        label: 'system/',
        startContent: folderIcon(),
        endContent: keptCount('2 kept'),
        isExpanded: true,
        children: [
          {
            id: 'mc-system-prompt',
            label: 'prompt.md',
            description: '2,140 tokens · loaded every turn',
            startContent: fileIcon(),
            endContent: KEPT_BADGE,
          },
          {
            id: 'mc-system-tools',
            label: 'tools.json',
            description: '3,480 tokens · loaded every turn',
            startContent: fileIcon(),
            endContent: KEPT_BADGE,
          },
        ],
      },
      {
        id: 'mc-files',
        label: 'files/',
        startContent: folderIcon(),
        endContent: keptCount('1 kept · 2 dropped'),
        isExpanded: true,
        children: [
          {
            id: 'mc-files-schema-v1',
            label: 'orders/schema-v1.sql',
            description: '6,912 tokens · superseded by v2',
            startContent: fileIcon(),
            endContent: DROPPED_BADGE,
          },
          {
            id: 'mc-files-schema-v2',
            label: 'orders/schema-v2.sql',
            description: '7,148 tokens · active migration target',
            startContent: fileIcon(),
            endContent: KEPT_BADGE,
          },
          {
            id: 'mc-files-runbook',
            label: 'runbooks/shard-backfill.md',
            description: '3,806 tokens · steps already executed',
            startContent: fileIcon(),
            endContent: DROPPED_BADGE,
          },
        ],
      },
      {
        id: 'mc-skills',
        label: 'skills/',
        startContent: folderIcon(),
        endContent: keptCount('1 kept'),
        children: [
          {
            id: 'mc-skills-sql',
            label: 'sql-migration/SKILL.md',
            description: '1,860 tokens',
            startContent: fileIcon(),
            endContent: KEPT_BADGE,
          },
        ],
      },
      {
        id: 'mc-memory',
        label: 'memory/',
        startContent: folderIcon(),
        endContent: keptCount('1 rewritten · 2 dropped'),
        children: [
          {
            id: 'mc-memory-scratch',
            label: 'scratch/plan-draft.md',
            description: '2,300 tokens · folded into the summary',
            startContent: fileIcon(),
            endContent: DROPPED_BADGE,
          },
          {
            id: 'mc-memory-stale',
            label: 'decisions.md (stale copy)',
            description: '1,120 tokens · duplicate of the rewrite',
            startContent: fileIcon(),
            endContent: DROPPED_BADGE,
          },
          {
            id: 'mc-memory-decisions',
            label: 'decisions.md',
            description: '940 tokens · rewritten from 14 scattered notes',
            startContent: fileIcon(),
            endContent: <Badge label="rewritten" variant="warning" />,
          },
        ],
      },
    ],
  },
  {
    id: 'messages',
    label: 'messages/',
    startContent: folderIcon(),
    endContent: keptCount('78 kept · 42 summarized'),
    isExpanded: true,
    children: [
      {
        id: 'messages-early',
        label: '0001-0042 (raw turns)',
        description: '45,210 tokens · before the boundary',
        startContent: fileIcon(),
        endContent: <Badge label="summarized" variant="warning" />,
      },
      {
        id: 'messages-late',
        label: '0043-0120 (raw turns)',
        description: '28,660 tokens · after the boundary',
        startContent: fileIcon(),
        endContent: KEPT_BADGE,
      },
    ],
  },
  {
    id: 'tool-results',
    label: 'tool-results/',
    startContent: folderIcon(),
    endContent: keptCount('1 kept · 1 dropped'),
    children: [
      {
        id: 'tools-bash',
        label: 'bash/0007-0031',
        description: '22,384 tokens · backfill logs, findings kept in summary',
        startContent: fileIcon(),
        endContent: DROPPED_BADGE,
      },
      {
        id: 'tools-web',
        label: 'web/0032-0035',
        description: '4,118 tokens · vendor docs still referenced',
        startContent: fileIcon(),
        endContent: KEPT_BADGE,
      },
    ],
  },
  {
    id: 'summaries',
    label: 'summaries/',
    startContent: folderIcon(),
    endContent: keptCount('1 new'),
    isExpanded: true,
    children: [
      {
        id: 'summaries-001',
        label: 'compaction-001.md',
        description: '3,910 tokens · replaces messages 1-42',
        startContent: fileIcon(),
        endContent: <Badge label="new" variant="info" />,
      },
    ],
  },
];

// Stats tab: four before → after cards.
const COMPACTION_STATS: ReadonlyArray<{
  id: string;
  label: string;
  value: string;
  caption: string;
}> = [
  {
    id: 'messages',
    label: 'Messages',
    value: '120 → 64',
    caption: '12 summarized · 44 dropped',
  },
  {
    id: 'tokens',
    label: 'Tokens',
    value: '120,000 → 60,000',
    caption: '45,000 summarized away · 15,000 deduplicated',
  },
  {
    id: 'reduction',
    label: 'Reduction',
    value: '50%',
    caption: 'context halved in one pass',
  },
  {
    id: 'boundary',
    label: 'Boundary',
    value: 'message 42',
    caption: 'everything earlier lives in the summary',
  },
];

// ============= COMPACTION MARKERS =============

/**
 * Inline compaction marker chip: a centered pill between messages. The
 * success variant carries the removal stats and an Inspect action; the
 * failed variant goes error-toned with a Retry that flips it into an
 * in-progress (retrying) state.
 */
function CompactionMarker({
  state,
  onInspect,
  onRetry,
}: {
  state: 'compacted' | 'failed' | 'retrying';
  onInspect?: () => void;
  onRetry?: () => void;
}) {
  const isFailed = state === 'failed';
  const pillStyle = isFailed
    ? {...styles.markerPill, ...styles.markerPillError}
    : styles.markerPill;
  const title =
    state === 'compacted'
      ? 'Memory compacted'
      : isFailed
        ? 'Compaction failed'
        : 'Compacting…';
  const subtitle =
    state === 'compacted'
      ? COMPACTION_SUBTITLE
      : isFailed
        ? COMPACTION_FAILED_SUBTITLE
        : COMPACTION_RETRYING_SUBTITLE;

  return (
    <div style={styles.markerRow}>
      <HStack gap={3} vAlign="center" style={pillStyle}>
        {state === 'retrying' ? (
          <Spinner size="sm" aria-label="Compaction in progress" />
        ) : (
          <Icon
            icon={isFailed ? ArchiveXIcon : ArchiveIcon}
            size="sm"
            color="secondary"
          />
        )}
        <StackItem size="fill" style={styles.markerTextCell}>
          <VStack gap={0.5}>
            <Text type="label" size="sm">
              {title}
            </Text>
            <Text type="code" size="sm" color="secondary" maxLines={1}>
              {subtitle}
            </Text>
          </VStack>
        </StackItem>
        {state === 'compacted' && onInspect != null && (
          <Button label="Inspect" variant="secondary" size="sm" onClick={onInspect} />
        )}
        {isFailed && onRetry != null && (
          <Button
            label="Retry"
            variant="secondary"
            size="sm"
            icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
            onClick={onRetry}
          />
        )}
      </HStack>
    </div>
  );
}

// ============= INSPECTOR DIALOG =============

type InspectorTab = 'diff' | 'tree' | 'stats';

function CompactionDetailsDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [tab, setTab] = useState<InspectorTab>('diff');

  const diffPanel = (
    <VStack gap={2} style={styles.tabPanel}>
      <Text type="supporting" color="secondary">
        Context manifest v41 → v42 — what the summarizer dropped from the old
        manifest and what it wrote into the new one.
      </Text>
      <div style={styles.diffGrid}>
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            Before · 120 entries
          </Text>
          <CodeBlock
            code={MANIFEST_BEFORE}
            language="diff"
            size="sm"
            width="100%"
            hasCopyButton={false}
          />
        </VStack>
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary" style={styles.eyebrow}>
            After · 64 entries
          </Text>
          <CodeBlock
            code={MANIFEST_AFTER}
            language="diff"
            size="sm"
            width="100%"
            hasCopyButton={false}
          />
        </VStack>
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        45,000 tokens (38%) removed at the boundary · summary written to
        summaries/compaction-001.md
      </Text>
    </VStack>
  );

  const treePanel = (
    <VStack gap={2} style={styles.tabPanel}>
      <Text type="supporting" color="secondary">
        Every node in the context tree with its fate after run #1.
      </Text>
      <TreeList items={CONTEXT_TREE} density="compact" />
    </VStack>
  );

  const statsPanel = (
    <VStack gap={2} style={styles.tabPanel}>
      <div style={styles.statsGrid}>
        {COMPACTION_STATS.map(stat => (
          <Card key={stat.id} padding={3}>
            <VStack gap={1}>
              <Text
                type="label"
                size="sm"
                color="secondary"
                style={styles.eyebrow}>
                {stat.label}
              </Text>
              <Text type="display-2" hasTabularNumbers>
                {stat.value}
              </Text>
              <Text type="supporting" color="secondary">
                {stat.caption}
              </Text>
            </VStack>
          </Card>
        ))}
      </div>
      <Text type="supporting" color="secondary">
        Counts are exact — recomputed from the manifest after the summarizer
        committed, not estimated.
      </Text>
    </VStack>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      purpose="info"
      width="min(880px, 94vw)"
      maxHeight="85vh">
      <Layout
        header={
          <DialogHeader
            title="Compaction Details"
            subtitle="Run #1 · Jul 11, 9:14 PM · automatic at 70% threshold"
            endContent={<Badge label="auto" variant="neutral" />}
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={0}>
              <TabList
                aria-label="Compaction details views"
                value={tab}
                onChange={value => setTab(value as InspectorTab)}
                size="sm"
                hasDivider>
                <Tab value="diff" label="Diff" />
                <Tab value="tree" label="Tree" />
                <Tab value="stats" label="Stats" />
              </TabList>
              {tab === 'diff' && diffPanel}
              {tab === 'tree' && treePanel}
              {tab === 'stats' && statsPanel}
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Dropped context is recoverable from the session archive for
                  30 days.
                </Text>
              </StackItem>
              <Button
                label="Restore dropped context"
                variant="ghost"
                onClick={() => {}}
              />
              <Button
                label="Done"
                variant="primary"
                onClick={() => onOpenChange(false)}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

// ============= PAGE =============

export default function AiChatCompactionInspectorTemplate() {
  // The inspector Dialog is open on first render — the transcript with its
  // compaction markers is the dimmed backdrop.
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  // Run #2 failed; Retry flips the marker into its in-progress state.
  const [failedMarkerState, setFailedMarkerState] = useState<
    'failed' | 'retrying'
  >('failed');
  const [draft, setDraft] = useState('');
  // Composer sends append real user turns to the end of the transcript.
  const [sentNotes, setSentNotes] = useState<string[]>([]);

  const sendDraft = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setSentNotes(prev => [...prev, text]);
    setDraft('');
  };

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={\`Message \${ASSISTANT_NAME}\`}
            isLabelHidden
            rows={2}
            placeholder="Type a message…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
            <Text type="supporting" color="secondary">
              Long session — turns before the boundary live in the compaction
              summary
            </Text>
            <StackItem size="fill" />
            <IconButton
              label="Send message"
              tooltip="Send"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              variant="primary"
              size="sm"
              onClick={() => sendDraft(draft)}
            />
          </HStack>
        </VStack>
      </div>
    </VStack>
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
                <Text type="supporting" color="secondary">
                  auto-compaction at 70%
                </Text>
              </HStack>
            </StackItem>
            <div style={styles.headerMeterBar}>
              <ProgressBar
                value={CONTEXT_USED}
                max={CONTEXT_WINDOW}
                label="Context window used"
                isLabelHidden
              />
            </div>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {CONTEXT_USED_PCT}% after compaction
            </Text>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.chatColumn}>
            <ChatLayout composer={composer}>
              <ChatMessageList density="balanced">
                <ChatSystemMessage variant="divider">
                  Friday, July 10
                </ChatSystemMessage>
                <ChatSystemMessage>
                  {ASSISTANT_NAME} keeps long sessions inside the context
                  window by compacting older turns into summaries.
                </ChatSystemMessage>

                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-10T21:02:00" format="time" />
                        }
                      />
                    }>
                    Resume the orders-db shard migration — shard 7 of 12 was
                    mid-backfill when we paused on Wednesday.
                  </ChatMessageBubble>
                </ChatMessage>

                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    Picked up from the checkpoint: shard 7 backfill resumed at
                    row 4.2M of 9.8M. I&apos;m verifying row counts against
                    the v2 schema as batches land.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-10T21:04:30" format="time" />
                    }
                  />
                </ChatMessage>

                <ChatSystemMessage variant="divider">
                  Saturday, July 11
                </ChatSystemMessage>

                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-11T09:18:00" format="time" />
                        }
                      />
                    }>
                    How are shards 8 through 10 looking?
                  </ChatMessageBubble>
                </ChatMessage>

                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    Shards 8 and 9 verified clean. Shard 10 had 214 rows with
                    conflicting order_status values — I quarantined them in
                    orders_conflicts and continued; the quarantine query is in
                    memory/decisions.md.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-11T09:22:10" format="time" />
                    }
                  />
                </ChatMessage>

                {/* Compaction run #1: succeeded — Inspect opens the Dialog. */}
                <CompactionMarker
                  state="compacted"
                  onInspect={() => setIsInspectorOpen(true)}
                />

                <ChatSystemMessage variant="divider">
                  Sunday, July 12
                </ChatSystemMessage>

                <ChatMessage sender="user">
                  <ChatMessageBubble
                    metadata={
                      <ChatMessageMetadata
                        timestamp={
                          <Timestamp value="2026-07-12T13:40:00" format="time" />
                        }
                      />
                    }>
                    Great. Run the checksum sweep on everything migrated so
                    far before we start shard 11.
                  </ChatMessageBubble>
                </ChatMessage>

                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    Checksums match on shards 1-10, including the quarantined
                    rows. Full sweep report is 96 turns of tool output — the
                    window is filling again, so I scheduled another
                    compaction.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-12T14:02:45" format="time" />
                    }
                  />
                </ChatMessage>

                {/* Compaction run #2: failed — Retry flips to in-progress. */}
                <CompactionMarker
                  state={failedMarkerState}
                  onRetry={() => setFailedMarkerState('retrying')}
                />

                <ChatMessage
                  sender="assistant"
                  avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                  <ChatMessageBubble name={ASSISTANT_NAME}>
                    That compaction hit the summarizer timeout, so the
                    manifest is unchanged. You can retry from the marker
                    above, or I&apos;ll retry automatically before shard 11
                    kicks off.
                  </ChatMessageBubble>
                  <ChatMessageMetadata
                    timestamp={
                      <Timestamp value="2026-07-12T14:06:20" format="time" />
                    }
                  />
                </ChatMessage>

                {/* Composer sends land as real user turns. */}
                {sentNotes.map((note, index) => (
                  <ChatMessage key={\`sent-\${index}\`} sender="user">
                    <ChatMessageBubble
                      metadata={
                        <ChatMessageMetadata
                          timestamp={
                            <Timestamp
                              value="2026-07-12T14:30:00"
                              format="time"
                            />
                          }
                        />
                      }>
                      {note}
                    </ChatMessageBubble>
                  </ChatMessage>
                ))}
              </ChatMessageList>
            </ChatLayout>
          </div>

          <CompactionDetailsDialog
            isOpen={isInspectorOpen}
            onOpenChange={setIsInspectorOpen}
          />
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};