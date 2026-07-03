var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (compaction run metrics, collapsed
 *   message excerpts, summary markdown, context-tree nodes, per-category
 *   token breakdown)
 * @output Context compaction inspector: header with run title, "Complete"
 *   status Badge, and a horizontal headline-metrics MetadataList; below,
 *   three tabs — a resizable Comparison split (collapsed raw messages vs.
 *   the compressed Markdown summary with preserved-topic Token chips), a
 *   Context tree with per-node token meters, and a Stats table with
 *   before/after columns and delta Badges
 * @position Page template; emitted by \`astryx template compaction-inspector\`
 *
 * Frame: Layout height="fill". LayoutHeader (two rows) carries the run
 * identity and the metrics strip. LayoutContent (padding 0) owns a fixed
 * TabList row and a fill-height tab body; each tab manages its own scroll
 * so the page chrome never moves.
 *
 * Responsive contract:
 * - >880px: Comparison is a horizontal split — the collapsed-messages pane
 *   is a resizable region (useResizable, 300–560px, default 400) with a
 *   ResizeHandle divider; both panes scroll independently.
 * - <=880px: the ResizeHandle is removed and the split stacks vertically
 *   (messages above summary) inside one scroll container.
 * - Header metrics use a horizontal MetadataList and wrap onto extra rows
 *   as the viewport narrows; the title row truncates the run subtitle
 *   first (minWidth 0) and keeps the status Badge visible.
 * - Context tree and Stats tabs are single scroll containers; the tree's
 *   token meters keep a fixed 120px bar above 640px so bars stay
 *   comparable, and numeric cells keep tabular numerals at every width.
 * - <=640px: tree token meters narrow to a fixed 64px bar (still mutually
 *   comparable) and the token count drops its reserved column to natural
 *   width, returning space to node labels; exact figures remain in the
 *   count and the hover Tooltip.
 */

import {useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {List, ListItem} from '@astryxdesign/core/List';
import {Markdown} from '@astryxdesign/core/Markdown';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Fill the LayoutContent so the tab body can own its own scroll.
  contentFill: {height: '100%', display: 'flex', flexDirection: 'column'},
  tabRow: {flexShrink: 0, padding: '0 var(--spacing-4)'},
  tabBody: {flex: 1, minHeight: 0},
  // Comparison split: row of two independently scrolling panes.
  split: {display: 'flex', alignItems: 'stretch', height: '100%'},
  splitStacked: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  },
  splitPane: {minHeight: 0, overflowY: 'auto', boxSizing: 'border-box'},
  messagesPane: {flexShrink: 0, padding: 'var(--spacing-4)'},
  summaryPane: {flex: 1, minWidth: 0, padding: 'var(--spacing-4)'},
  // Single scroll container for the tree and stats tabs.
  scrollPane: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  tabContentMax: {maxWidth: 880},
  topicWrap: {display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-1)'},
  // Fixed-width token meter so tree bars stay visually comparable; the
  // compact variant keeps a (smaller) fixed bar and frees the count column
  // so node labels get the reclaimed width at narrow viewports.
  meterBar: {width: 120},
  meterBarCompact: {width: 64},
  meterCount: {width: 64, textAlign: 'right'},
  meterCountCompact: {textAlign: 'right'},
};

// ============= FIXTURES =============

// One compaction run over a long research session: 340 messages collapsed,
// 148,231 -> 42,118 tokens. All values are fixed; totals are consistent
// across the header metrics, the tree, and the stats table.
const RUN = {
  id: 'cmp-2481',
  session: 'Retrieval eval deep-dive',
  finishedAt: 'Jun 24, 2:32 PM',
  messagesCollapsed: 340,
  tokensBefore: 148231,
  tokensAfter: 42118,
  durationLabel: '6.4 s',
  boundary: 'm-340',
};

const REDUCTION_PCT = Math.round(
  ((RUN.tokensBefore - RUN.tokensAfter) / RUN.tokensBefore) * 100,
);

function formatTokens(value: number): string {
  return value.toLocaleString('en-US');
}

// Collapsed raw messages — the oldest slice of the transcript that the
// summary replaced. Excerpts truncate to one line in the list.
interface CollapsedMessage {
  id: string;
  author: string;
  role: 'user' | 'assistant';
  excerpt: string;
  tokens: number;
}

const COLLAPSED_MESSAGES: CollapsedMessage[] = [
  {
    id: 'm-018',
    author: 'Dana Okafor',
    role: 'user',
    excerpt:
      'Can you rerun the BM25 baseline on the refreshed corpus and compare MRR@10 against the hybrid retriever?',
    tokens: 214,
  },
  {
    id: 'm-019',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'BM25 baseline on corpus v3: MRR@10 = 0.512 (down 0.014 from v2). Hybrid retriever holds at 0.598. Full table below…',
    tokens: 1892,
  },
  {
    id: 'm-024',
    author: 'Dana Okafor',
    role: 'user',
    excerpt:
      'The drop is probably the near-duplicate pages we imported. Draft a dedupe pass before scoring.',
    tokens: 186,
  },
  {
    id: 'm-025',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Drafted scripts/dedupe.py — MinHash over 5-shingles, 0.92 similarity threshold. Dry run flags 3,481 of 60,204 pages…',
    tokens: 2431,
  },
  {
    id: 'm-041',
    author: 'Dana Okafor',
    role: 'user',
    excerpt:
      'Annotation disagreements are climbing again. Pull the ten worst kappa items so we can tighten the guide.',
    tokens: 205,
  },
  {
    id: 'm-042',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Ten lowest-agreement items pulled (kappa 0.31–0.44). Eight involve partial-answer passages; proposed wording for guide v3…',
    tokens: 2087,
  },
  {
    id: 'm-057',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Notebook updated: retrieval-eval.ipynb now sweeps k in {5, 10, 20} and logs per-query reciprocal rank to eval_runs/…',
    tokens: 1764,
  },
  {
    id: 'm-089',
    author: 'Dana Okafor',
    role: 'user',
    excerpt:
      'Set the target: we ship the hybrid retriever if MRR@10 >= 0.61 on the deduped corpus with guide v3 labels.',
    tokens: 231,
  },
  {
    id: 'm-090',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Target recorded. Current gap is +0.012 needed; the reranker ablation suggests most headroom is in the top-20 candidate pool…',
    tokens: 1508,
  },
  {
    id: 'm-134',
    author: 'Dana Okafor',
    role: 'user',
    excerpt:
      'Before we scale the sweep, sanity-check the query sampler — the tail buckets look thin in last night’s run.',
    tokens: 198,
  },
  {
    id: 'm-135',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Confirmed: buckets 8–10 undersampled by ~40% after the corpus refresh. Patched the stratifier and re-queued the sweep…',
    tokens: 1655,
  },
  {
    id: 'm-208',
    author: 'Assistant',
    role: 'assistant',
    excerpt:
      'Sweep complete across 24 configs. Best: hybrid + cross-encoder rerank, MRR@10 = 0.607. Per-bucket breakdown attached…',
    tokens: 2244,
  },
];

// Topics the compactor pinned so the summary keeps them verbatim.
const PRESERVED_TOPICS = [
  'MRR@10 target ≥ 0.61',
  'BM25 baseline',
  'dedupe pipeline',
  'annotation guide v3',
  'query sampler fix',
  'corpus v3 refresh',
];

// The compressed summary that replaced the collapsed slice, as it will be
// injected into future model turns.
const SUMMARY_MARKDOWN = [
  '## Session summary (m-001 – m-340)',
  '',
  'Research session evaluating retrieval quality for the docs search',
  'launch. The corpus was refreshed to **v3** (60,204 pages), which',
  'regressed the BM25 baseline to MRR@10 = 0.512; the hybrid retriever',
  'held at 0.598.',
  '',
  '### Findings',
  '',
  '- Near-duplicate imports caused most of the baseline drop; a MinHash',
  '  dedupe pass (\`scripts/dedupe.py\`, threshold 0.92) flags 3,481 pages.',
  '- Annotator agreement dipped to kappa 0.31–0.44 on partial-answer',
  '  passages; **annotation guide v3** adds explicit partial-credit rules.',
  '- The query sampler undersampled tail buckets 8–10 by ~40% after the',
  '  refresh; the stratifier was patched and the sweep re-queued.',
  '- Best configuration so far: hybrid + cross-encoder rerank at',
  '  **MRR@10 = 0.607** across 24 swept configs.',
  '',
  '### Decisions',
  '',
  '- Ship gate: hybrid retriever ships when **MRR@10 ≥ 0.61** on the',
  '  deduped corpus with guide v3 labels.',
  '- Dedupe runs before every scoring pass; flagged pages are excluded,',
  '  not merged.',
  '',
  '### Open threads',
  '',
  '- Reranker ablation suggests remaining headroom is in the top-20',
  '  candidate pool — widen-then-rerank experiment is queued.',
  '- Guide v3 needs a second annotator calibration round before relabel.',
].join('\\n');

// Context tree — the structure of the model context after compaction.
// Leaf tokens sum to their parent; parents sum to RUN.tokensAfter.
interface ContextNode {
  id: string;
  label: string;
  description?: string;
  tokens: number;
  isExpanded?: boolean;
  children?: ContextNode[];
}

const CONTEXT_NODES: ContextNode[] = [
  {
    id: 'system',
    label: 'System prompt',
    description: 'Base instructions and tool schema',
    tokens: 4096,
  },
  {
    id: 'skills',
    label: 'Skills & instructions',
    tokens: 6210,
    isExpanded: true,
    children: [
      {id: 'skill-workflow', label: 'research-workflow', tokens: 2748},
      {id: 'skill-citations', label: 'citation-style', tokens: 1404},
      {id: 'skill-eval', label: 'eval-checklist', tokens: 2058},
    ],
  },
  {
    id: 'files',
    label: 'File snapshots',
    tokens: 8146,
    isExpanded: true,
    children: [
      {id: 'file-notebook', label: 'notebooks/retrieval-eval.ipynb', tokens: 3912},
      {id: 'file-guide', label: 'corpus/annotation-guide.md', tokens: 2516},
      {id: 'file-dedupe', label: 'scripts/dedupe.py', tokens: 1718},
    ],
  },
  {
    id: 'summary',
    label: 'Compaction summary',
    description: 'Replaces m-001 – m-340',
    tokens: 8884,
    children: [
      {id: 'summary-findings', label: 'Findings digest', tokens: 4102},
      {id: 'summary-decisions', label: 'Decisions', tokens: 2371},
      {id: 'summary-threads', label: 'Open threads', tokens: 2411},
    ],
  },
  {
    id: 'recent',
    label: 'Recent messages',
    description: 'Kept verbatim after the boundary',
    tokens: 12364,
    isExpanded: true,
    children: [
      {id: 'recent-debug', label: 'Eval harness debugging · m-341–m-356', tokens: 5206},
      {id: 'recent-corpus', label: 'Corpus refresh planning · m-357–m-364', tokens: 4090},
      {id: 'recent-next', label: 'Next steps · m-365–m-369', tokens: 3068},
    ],
  },
];

// Per-category token breakdown for the Stats tab. Before-column sums to
// RUN.tokensBefore, after-column to RUN.tokensAfter.
interface CategoryRow extends Record<string, unknown> {
  id: string;
  category: string;
  detail: string;
  before: number;
  after: number;
}

const CATEGORY_ROWS: CategoryRow[] = [
  {
    id: 'messages',
    category: 'Conversation messages',
    detail: 'Older turns collapsed; recent tail kept',
    before: 56680,
    after: 12364,
  },
  {
    id: 'tool-results',
    category: 'Tool results',
    detail: 'Sweep tables and dry-run output dropped',
    before: 58905,
    after: 2418,
  },
  {
    id: 'files',
    category: 'File snapshots',
    detail: 'Stale revisions pruned to latest',
    before: 22340,
    after: 8146,
  },
  {
    id: 'skills',
    category: 'Skills & instructions',
    detail: 'Carried through unchanged',
    before: 6210,
    after: 6210,
  },
  {
    id: 'system',
    category: 'System prompt',
    detail: 'Carried through unchanged',
    before: 4096,
    after: 4096,
  },
  {
    id: 'summary',
    category: 'Summary artifact',
    detail: 'New — written by the compactor',
    before: 0,
    after: 8884,
  },
];

// ============= COMPARISON TAB =============

function CollapsedMessagesList() {
  return (
    <VStack gap={3}>
      <VStack gap={0.5}>
        <Text type="label">Collapsed messages</Text>
        <Text type="supporting" color="secondary">
          Showing {COLLAPSED_MESSAGES.length} of {RUN.messagesCollapsed}{' '}
          summarized turns
        </Text>
      </VStack>
      <List density="compact" hasDividers>
        {COLLAPSED_MESSAGES.map(message => (
          <ListItem
            key={message.id}
            startContent={<Avatar name={message.author} size="xsmall" />}
            label={
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="medium">
                  {message.author}
                </Text>
                <Text type="supporting" color="secondary">
                  {message.id}
                </Text>
              </HStack>
            }
            description={message.excerpt}
            endContent={
              <Badge
                variant="neutral"
                label={
                  <Text type="supporting" hasTabularNumbers>
                    {formatTokens(message.tokens)} tok
                  </Text>
                }
              />
            }
          />
        ))}
      </List>
    </VStack>
  );
}

function CompressedSummary() {
  return (
    <VStack gap={3}>
      <VStack gap={0.5}>
        <Text type="label">Compressed summary</Text>
        <Text type="supporting" color="secondary">
          {formatTokens(8884)} tokens injected in place of the collapsed slice
        </Text>
      </VStack>
      <Card>
        <VStack gap={3}>
          <VStack gap={1}>
            <Text type="supporting" color="secondary">
              Preserved topics
            </Text>
            <div style={styles.topicWrap}>
              {PRESERVED_TOPICS.map(topic => (
                <Token key={topic} label={topic} color="blue" size="sm" />
              ))}
            </div>
          </VStack>
          <Markdown density="compact" headingLevelStart={3}>
            {SUMMARY_MARKDOWN}
          </Markdown>
        </VStack>
      </Card>
    </VStack>
  );
}

// ============= CONTEXT TREE TAB =============

/**
 * Token meter for a tree node: a fixed-width bar encoding this node's
 * share of the post-compaction context, with a hover Tooltip carrying
 * the exact figure, plus a right-aligned tabular count. At <=640px the
 * bar narrows (all bars share the width, so they stay comparable) and
 * the count sheds its reserved column so node labels keep room.
 */
function NodeTokenMeter({
  label,
  tokens,
  isCompact,
}: {
  label: string;
  tokens: number;
  isCompact: boolean;
}) {
  const pct = Math.round((tokens / RUN.tokensAfter) * 100);
  return (
    <HStack gap={2} vAlign="center">
      <Tooltip
        content={\`\${formatTokens(tokens)} tokens · \${pct}% of context\`}
        hasHoverIndication={false}>
        <div style={isCompact ? styles.meterBarCompact : styles.meterBar}>
          <ProgressBar
            label={\`\${label} share of context\`}
            isLabelHidden
            value={tokens}
            max={RUN.tokensAfter}
            variant="accent"
          />
        </div>
      </Tooltip>
      <div style={isCompact ? styles.meterCountCompact : styles.meterCount}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatTokens(tokens)}
        </Text>
      </div>
    </HStack>
  );
}

function toTreeItems(
  nodes: ContextNode[],
  isCompact: boolean,
): TreeListItemData[] {
  return nodes.map(node => ({
    id: node.id,
    label: node.label,
    description: node.description,
    isExpanded: node.isExpanded,
    endContent: (
      <NodeTokenMeter
        label={node.label}
        tokens={node.tokens}
        isCompact={isCompact}
      />
    ),
    children: node.children ? toTreeItems(node.children, isCompact) : undefined,
  }));
}

function ContextTreeTab({isCompact}: {isCompact: boolean}) {
  return (
    <div style={styles.tabContentMax}>
      <Card padding={3}>
        <TreeList
          density="compact"
          header={
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">Context after compaction</Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatTokens(RUN.tokensAfter)} tokens total
              </Text>
            </HStack>
          }
          items={toTreeItems(CONTEXT_NODES, isCompact)}
        />
      </Card>
    </div>
  );
}

// ============= STATS TAB =============

function DeltaBadge({before, after}: {before: number; after: number}) {
  const delta = after - before;
  if (delta === 0) {
    return <Badge variant="neutral" label="±0" />;
  }
  const label = \`\${delta < 0 ? '−' : '+'}\${formatTokens(Math.abs(delta))}\`;
  return (
    <Badge
      variant={delta < 0 ? 'success' : 'warning'}
      label={<Text type="supporting" hasTabularNumbers>{label}</Text>}
    />
  );
}

const categoryColumns: TableColumn<CategoryRow>[] = [
  {
    key: 'category',
    header: 'Category',
    width: proportional(2),
    renderCell: (item: CategoryRow) => (
      <VStack gap={0}>
        <Text type="body">{item.category}</Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          {item.detail}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'before',
    header: 'Before',
    width: pixel(110),
    renderCell: (item: CategoryRow) => (
      <Text type="body" hasTabularNumbers>
        {formatTokens(item.before)}
      </Text>
    ),
  },
  {
    key: 'after',
    header: 'After',
    width: pixel(110),
    renderCell: (item: CategoryRow) => (
      <Text type="body" hasTabularNumbers>
        {formatTokens(item.after)}
      </Text>
    ),
  },
  {
    key: 'delta',
    header: 'Delta',
    width: pixel(120),
    renderCell: (item: CategoryRow) => (
      <DeltaBadge before={item.before} after={item.after} />
    ),
  },
];

function StatsTab() {
  return (
    <div style={styles.tabContentMax}>
      <Card>
        <VStack gap={4}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={3}>Token breakdown by category</Heading>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatTokens(RUN.tokensBefore)} → {formatTokens(RUN.tokensAfter)}{' '}
              tokens
            </Text>
          </HStack>
          <Table<CategoryRow>
            data={CATEGORY_ROWS}
            columns={categoryColumns}
            idKey="id"
            density="compact"
            dividers="rows"
            hasHover
          />
          <Text type="supporting" color="secondary">
            Unchanged categories carry through byte-for-byte; the summary
            artifact is the only content the compactor writes.
          </Text>
        </VStack>
      </Card>
    </div>
  );
}

// ============= PAGE =============

export default function CompactionInspectorTemplate() {
  const [activeTab, setActiveTab] = useState('comparison');
  const isStacked = useMediaQuery('(max-width: 880px)');
  // Tree token meters switch to their compact form at phone widths.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Left (collapsed messages) pane of the Comparison split.
  const messagesPane = useResizable({
    defaultSize: 400,
    minSizePx: 300,
    maxSizePx: 560,
  });

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Heading level={1}>Context compaction</Heading>
              <Badge variant="success" label="Complete" />
              <StackItem size="fill">
                <Text type="supporting" color="secondary" maxLines={1}>
                  {RUN.session} · run {RUN.id} · finished {RUN.finishedAt}
                </Text>
              </StackItem>
            </HStack>
            <MetadataList orientation="horizontal">
              <MetadataListItem label="Messages collapsed">
                <Text type="body" hasTabularNumbers>
                  {RUN.messagesCollapsed}
                </Text>
              </MetadataListItem>
              <MetadataListItem label="Tokens">
                <Text type="body" hasTabularNumbers>
                  {formatTokens(RUN.tokensBefore)} →{' '}
                  {formatTokens(RUN.tokensAfter)}
                </Text>
              </MetadataListItem>
              <MetadataListItem label="Reduction">
                <Text type="body" hasTabularNumbers>
                  −{REDUCTION_PCT}%
                </Text>
              </MetadataListItem>
              <MetadataListItem label="Duration">
                <Text type="body" hasTabularNumbers>
                  {RUN.durationLabel}
                </Text>
              </MetadataListItem>
              <MetadataListItem label="Boundary">
                <Text type="body" hasTabularNumbers>
                  up to {RUN.boundary}
                </Text>
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentFill}>
            <div style={styles.tabRow}>
              <TabList
                value={activeTab}
                onChange={setActiveTab}
                size="md"
                hasDivider>
                <Tab value="comparison" label="Comparison" />
                <Tab value="tree" label="Context tree" />
                <Tab value="stats" label="Stats" />
              </TabList>
            </div>
            <div style={styles.tabBody}>
              {activeTab === 'comparison' ? (
                <div style={isStacked ? styles.splitStacked : styles.split}>
                  <div
                    style={{
                      ...styles.splitPane,
                      ...styles.messagesPane,
                      width: isStacked ? 'auto' : messagesPane.size,
                      overflowY: isStacked ? 'visible' : 'auto',
                    }}>
                    <CollapsedMessagesList />
                  </div>
                  {isStacked ? null : (
                    <ResizeHandle
                      direction="horizontal"
                      hasDivider
                      isAlwaysVisible={false}
                      resizable={messagesPane.props}
                      label="Resize collapsed messages pane"
                    />
                  )}
                  <div
                    style={{
                      ...styles.splitPane,
                      ...styles.summaryPane,
                      overflowY: isStacked ? 'visible' : 'auto',
                    }}>
                    <CompressedSummary />
                  </div>
                </div>
              ) : (
                <div style={styles.scrollPane}>
                  {activeTab === 'tree' ? (
                    <ContextTreeTab isCompact={isCompact} />
                  ) : (
                    <StatsTab />
                  )}
                </div>
              )}
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};