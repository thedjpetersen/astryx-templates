// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (diff hunks with old/new line numbers,
 *   one inline comment thread, review metadata)
 * @output Diff compare viewer for a single changed file: review header with a
 *   split/unified SegmentedControl, a diff panel with file path + change-stat
 *   Badges and a "Viewed" collapse Switch, line-number gutters, token-tinted
 *   added/removed lines, and one inline comment thread anchored to a new line
 * @position Page template; emitted by `astryx template diff-viewer`
 *
 * Responsive contract:
 * - >768px: the SegmentedControl chooses split (two panes, each with its own
 *   line-number gutter) or unified (old + new gutters on one pane). Code cells
 *   never wrap (white-space: pre); the diff body scrolls horizontally when a
 *   line outgrows the panel.
 * - <=768px: the viewer always renders unified — split panes are unreadable at
 *   phone widths — and the split/unified toggle hides. The header row wraps;
 *   the primary action stays visible.
 * - The inline comment thread spans the full panel width in both views and
 *   uses body (non-mono) type; the reply composer keeps its buttons on one
 *   row and lets the textarea take the width.
 * - Toggling "Viewed" collapses the diff body to just the file header row,
 *   mirroring code-review tools; the change-stat Badges stay visible.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

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
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {ChatBubbleLeftRightIcon} from '@heroicons/react/24/outline';

// ============= STYLES =============

// Monospace metrics come from the same tokens Code/CodeBlock use, so the
// diff reads as one surface with any CodeBlock elsewhere in the product.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  // The diff panel is a bordered container, not a Card — dense tool chrome.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  fileHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  fileHeaderCollapsed: {
    borderBottom: 'none',
  },
  // Horizontal scroller so long lines never wrap or crush the gutters.
  scroller: {
    overflowX: 'auto',
  },
  hunkHeader: {
    ...mono,
    padding: 'var(--spacing-1) var(--spacing-3)',
    backgroundColor: 'var(--color-accent-muted)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'pre',
  },
  gutter: {
    ...mono,
    width: 44,
    flexShrink: 0,
    padding: '0 var(--spacing-2)',
    textAlign: 'right',
    color: 'var(--color-text-secondary)',
    userSelect: 'none',
    boxSizing: 'content-box',
  },
  gutterDivider: {
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  sign: {
    ...mono,
    width: 20,
    flexShrink: 0,
    textAlign: 'center',
    userSelect: 'none',
  },
  codeCell: {
    ...mono,
    flex: 1,
    minWidth: 0,
    whiteSpace: 'pre',
    padding: '0 var(--spacing-2)',
  },
  row: {
    display: 'flex',
    alignItems: 'stretch',
  },
  // Added/removed tinting via design tokens — success/error muted surfaces.
  rowAdd: {backgroundColor: 'var(--color-success-muted)'},
  rowDel: {backgroundColor: 'var(--color-error-muted)'},
  // Unpaired half of a split row (no counterpart on the other side).
  cellSpacer: {backgroundColor: 'var(--color-background-muted)'},
  signAdd: {color: 'var(--color-success)'},
  signDel: {color: 'var(--color-error)'},
  splitPane: {
    display: 'flex',
    flex: 1,
    minWidth: 280,
  },
  splitDivider: {
    width: 'var(--border-width)',
    flexShrink: 0,
    backgroundColor: 'var(--color-border)',
  },
  commentMarker: {
    display: 'inline-flex',
    verticalAlign: 'text-bottom',
    color: 'var(--color-accent)',
  },
  thread: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
};

// ============= DATA =============

type DiffLineType = 'context' | 'add' | 'del';

interface DiffLine {
  type: DiffLineType;
  /** Line number in the old file; null for added lines. */
  oldNo: number | null;
  /** Line number in the new file; null for removed lines. */
  newNo: number | null;
  text: string;
}

interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

const REVIEW = {
  title: 'Exponential backoff for payment retries',
  change: 'PAY-2417',
  branch: 'feat/retry-backoff',
  base: 'main',
  commit: '4f2c9ab',
  filePath: 'src/payments/retry-policy.ts',
  fileStatus: 'Modified',
};

// Two hunks from a real-looking change: retry constants, then the delay
// computation swapping a fixed 500ms wait for capped exponential backoff.
const HUNKS: DiffHunk[] = [
  {
    header: '@@ -12,6 +12,8 @@ import section',
    lines: [
      {type: 'context', oldNo: 12, newNo: 12, text: "import {RetryContext} from './context';"},
      {type: 'context', oldNo: 13, newNo: 13, text: "import {isRetryableStatus} from './status';"},
      {type: 'context', oldNo: 14, newNo: 14, text: ''},
      {type: 'del', oldNo: 15, newNo: null, text: 'const MAX_ATTEMPTS = 3;'},
      {type: 'add', oldNo: null, newNo: 15, text: 'const MAX_ATTEMPTS = 5;'},
      {type: 'add', oldNo: null, newNo: 16, text: 'const BASE_DELAY_MS = 200;'},
      {type: 'add', oldNo: null, newNo: 17, text: 'const MAX_DELAY_MS = 8_000;'},
      {type: 'context', oldNo: 16, newNo: 18, text: ''},
      {type: 'context', oldNo: 17, newNo: 19, text: 'export interface RetryDecision {'},
    ],
  },
  {
    header: '@@ -46,10 +48,13 @@ export function nextRetryDelay(',
    lines: [
      {type: 'context', oldNo: 46, newNo: 48, text: '  if (attempt >= MAX_ATTEMPTS) {'},
      {type: 'context', oldNo: 47, newNo: 49, text: '    return {shouldRetry: false, delayMs: 0};'},
      {type: 'context', oldNo: 48, newNo: 50, text: '  }'},
      {type: 'del', oldNo: 49, newNo: null, text: '  // Fixed 500ms delay between attempts.'},
      {type: 'del', oldNo: 50, newNo: null, text: '  const delayMs = 500;'},
      {type: 'add', oldNo: null, newNo: 51, text: '  // Exponential backoff with deterministic jitter,'},
      {type: 'add', oldNo: null, newNo: 52, text: '  // capped so queued retries never wait past 8s.'},
      {type: 'add', oldNo: null, newNo: 53, text: '  const backoff = BASE_DELAY_MS * 2 ** (attempt - 1);'},
      {type: 'add', oldNo: null, newNo: 54, text: '  const jitter = backoff * 0.2 * jitterSeed(ctx.requestId, attempt);'},
      {type: 'add', oldNo: null, newNo: 55, text: '  const delayMs = Math.min(backoff + jitter, MAX_DELAY_MS);'},
      {type: 'context', oldNo: 51, newNo: 56, text: '  return {'},
      {type: 'context', oldNo: 52, newNo: 57, text: '    shouldRetry: isRetryableStatus(ctx.status),'},
      {type: 'context', oldNo: 53, newNo: 58, text: '    delayMs,'},
      {type: 'context', oldNo: 54, newNo: 59, text: '  };'},
      {type: 'context', oldNo: 55, newNo: 60, text: '}'},
    ],
  },
];

// The one inline thread, anchored to a line in the new file.
const THREAD_ANCHOR_NEW_LINE = 54;

const THREAD_COMMENTS = [
  {
    id: 'c1',
    author: 'Maya Lindqvist',
    role: 'Reviewer',
    when: 'Jun 30, 2026 at 14:12',
    body:
      'Is jitterSeed deterministic per request? If two replicas retry the ' +
      'same payment I would expect them to spread out, not sync up on the ' +
      'exact same delay.',
  },
  {
    id: 'c2',
    author: 'Daniel Okafor',
    role: 'Author',
    when: 'Jun 30, 2026 at 15:47',
    body:
      'It hashes requestId + attempt, so replicas retrying the same request ' +
      'land on the same delay by design — dedupe happens at the queue, and ' +
      'identical delays keep the dedupe window tight. Added a docblock note.',
  },
];

// ============= DIFF HELPERS =============

/**
 * Zip a hunk's lines into split-view rows: context pairs with itself, and
 * each run of removals pairs index-by-index with the following run of
 * additions (blanks fill the shorter side).
 */
interface SplitRow {
  left: DiffLine | null;
  right: DiffLine | null;
}

function toSplitRows(lines: DiffLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === 'context') {
      rows.push({left: line, right: line});
      i += 1;
      continue;
    }
    const dels: DiffLine[] = [];
    const adds: DiffLine[] = [];
    while (i < lines.length && lines[i].type === 'del') {
      dels.push(lines[i]);
      i += 1;
    }
    while (i < lines.length && lines[i].type === 'add') {
      adds.push(lines[i]);
      i += 1;
    }
    const length = Math.max(dels.length, adds.length);
    for (let j = 0; j < length; j += 1) {
      rows.push({left: dels[j] ?? null, right: adds[j] ?? null});
    }
  }
  return rows;
}

function countChanges(hunks: DiffHunk[]): {additions: number; deletions: number} {
  let additions = 0;
  let deletions = 0;
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.type === 'add') additions += 1;
      if (line.type === 'del') deletions += 1;
    }
  }
  return {additions, deletions};
}

const SIGN: Record<DiffLineType, string> = {context: ' ', add: '+', del: '−'};

function rowTint(type: DiffLineType): CSSProperties | undefined {
  if (type === 'add') return styles.rowAdd;
  if (type === 'del') return styles.rowDel;
  return undefined;
}

function signStyle(type: DiffLineType): CSSProperties {
  if (type === 'add') return {...styles.sign, ...styles.signAdd};
  if (type === 'del') return {...styles.sign, ...styles.signDel};
  return styles.sign;
}

// ============= DIFF ROWS =============

/** One unified-view row: old gutter, new gutter, sign, code. */
function UnifiedRow({line, hasThread}: {line: DiffLine; hasThread: boolean}) {
  return (
    <div style={{...styles.row, ...rowTint(line.type)}}>
      <span style={{...styles.gutter, ...styles.gutterDivider}}>
        {line.oldNo ?? ''}
      </span>
      <span style={{...styles.gutter, ...styles.gutterDivider}}>
        {line.newNo ?? ''}
      </span>
      <span aria-hidden="true" style={signStyle(line.type)}>
        {SIGN[line.type]}
      </span>
      <span style={styles.codeCell}>
        {line.text}
        {hasThread ? <ThreadMarker /> : null}
      </span>
    </div>
  );
}

/** One half of a split-view row; renders a muted spacer when unpaired. */
function SplitCell({line, hasThread}: {line: DiffLine | null; hasThread: boolean}) {
  if (line === null) {
    return (
      <div style={{...styles.splitPane, ...styles.cellSpacer}}>
        <span style={{...styles.gutter, ...styles.gutterDivider}} />
        <span style={styles.sign} />
        <span style={styles.codeCell} />
      </div>
    );
  }
  return (
    <div style={{...styles.splitPane, ...rowTint(line.type)}}>
      <span style={{...styles.gutter, ...styles.gutterDivider}}>
        {line.oldNo ?? line.newNo}
      </span>
      <span aria-hidden="true" style={signStyle(line.type)}>
        {SIGN[line.type]}
      </span>
      <span style={styles.codeCell}>
        {line.text}
        {hasThread ? <ThreadMarker /> : null}
      </span>
    </div>
  );
}

/** Inline marker showing a comment thread is anchored to this line. */
function ThreadMarker() {
  return (
    <span style={styles.commentMarker} title="1 comment thread">
      {' '}
      <Icon icon={ChatBubbleLeftRightIcon} size="xsm" />
    </span>
  );
}

// ============= COMMENT THREAD =============

function CommentThread({
  isResolved,
  onResolvedChange,
}: {
  isResolved: boolean;
  onResolvedChange: (resolved: boolean) => void;
}) {
  const [reply, setReply] = useState('');

  if (isResolved) {
    return (
      <div style={styles.thread}>
        <HStack gap={2} vAlign="center">
          <Badge variant="success" label="Resolved" />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Thread on line {THREAD_ANCHOR_NEW_LINE} resolved by Daniel Okafor
            </Text>
          </StackItem>
          <Button
            label="Reopen"
            variant="ghost"
            size="sm"
            onClick={() => onResolvedChange(false)}
          />
        </HStack>
      </div>
    );
  }

  return (
    <div style={styles.thread}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Badge variant="warning" label="Unresolved" />
          <Text type="supporting" color="secondary">
            Thread on line {THREAD_ANCHOR_NEW_LINE} · retry-policy.ts
          </Text>
        </HStack>
        {THREAD_COMMENTS.map(comment => (
          <HStack key={comment.id} gap={2} vAlign="start">
            <Avatar name={comment.author} size="small" />
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  <Text type="label">{comment.author}</Text>
                  <Badge variant="neutral" label={comment.role} />
                  <Text type="supporting" color="secondary">
                    {comment.when}
                  </Text>
                </HStack>
                <Text type="body">{comment.body}</Text>
              </VStack>
            </StackItem>
          </HStack>
        ))}
        <VStack gap={2}>
          <TextArea
            label="Reply to thread"
            isLabelHidden
            placeholder="Reply…"
            rows={2}
            value={reply}
            onChange={setReply}
          />
          <HStack gap={2}>
            <Button label="Reply" size="sm" isDisabled={reply.trim() === ''} />
            <Button
              label="Resolve thread"
              variant="secondary"
              size="sm"
              onClick={() => onResolvedChange(true)}
            />
          </HStack>
        </VStack>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function DiffViewerTemplate() {
  const [viewMode, setViewMode] = useState('split');
  const [isViewed, setIsViewed] = useState(false);
  const [isThreadResolved, setIsThreadResolved] = useState(false);
  const isNarrow = useMediaQuery('(max-width: 768px)');
  // Split panes are unreadable at phone widths — force unified and hide the
  // toggle rather than letting a stale choice crush both panes.
  const effectiveMode = isNarrow ? 'unified' : viewMode;

  const {additions, deletions} = useMemo(() => countChanges(HUNKS), []);

  const thread = (
    <CommentThread
      isResolved={isThreadResolved}
      onResolvedChange={setIsThreadResolved}
    />
  );

  const hunkBlocks: ReactNode[] = HUNKS.map(hunk => {
    if (effectiveMode === 'unified') {
      return (
        <div key={hunk.header}>
          <div style={styles.hunkHeader}>{hunk.header}</div>
          {hunk.lines.map((line, index) => {
            const hasThread = line.newNo === THREAD_ANCHOR_NEW_LINE;
            return (
              <div key={index}>
                <UnifiedRow line={line} hasThread={hasThread} />
                {hasThread ? thread : null}
              </div>
            );
          })}
        </div>
      );
    }
    const rows = toSplitRows(hunk.lines);
    return (
      <div key={hunk.header}>
        <div style={styles.hunkHeader}>{hunk.header}</div>
        {rows.map((row, index) => {
          const hasThread = row.right?.newNo === THREAD_ANCHOR_NEW_LINE;
          return (
            <div key={index}>
              <div style={styles.row}>
                <SplitCell line={row.left} hasThread={false} />
                <div style={styles.splitDivider} />
                <SplitCell line={row.right} hasThread={hasThread} />
              </div>
              {hasThread ? thread : null}
            </div>
          );
        })}
      </div>
    );
  });

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>{REVIEW.title}</Heading>
                <Text type="supporting" color="secondary">
                  {REVIEW.change} · {REVIEW.branch} → {REVIEW.base} · commit{' '}
                  {REVIEW.commit}
                </Text>
              </VStack>
            </StackItem>
            {!isNarrow && (
              <SegmentedControl
                label="Diff view"
                value={viewMode}
                onChange={setViewMode}
                size="sm">
                <SegmentedControlItem label="Split" value="split" />
                <SegmentedControlItem label="Unified" value="unified" />
              </SegmentedControl>
            )}
            <Button label="Approve" variant="primary" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={4}>
          <div style={styles.panel}>
            {/* File header: path, status, change stats, viewed toggle */}
            <div
              style={{
                ...styles.fileHeader,
                ...(isViewed ? styles.fileHeaderCollapsed : undefined),
              }}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Code>{REVIEW.filePath}</Code>
                <Badge variant="info" label={REVIEW.fileStatus} />
                <Badge variant="green" label={`+${additions}`} />
                <Badge variant="red" label={`−${deletions}`} />
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {HUNKS.length} hunks ·{' '}
                    {isThreadResolved ? '1 resolved thread' : '1 open thread'}
                  </Text>
                </StackItem>
                <Switch
                  label="Viewed"
                  value={isViewed}
                  onChange={setIsViewed}
                />
              </HStack>
            </div>
            {/* Diff body — collapsed entirely when marked viewed */}
            {!isViewed && <div style={styles.scroller}>{hunkBlocks}</div>}
          </div>
        </LayoutContent>
      }
    />
  );
}
