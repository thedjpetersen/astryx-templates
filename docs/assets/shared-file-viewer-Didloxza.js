var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a shared runbook markdown source, two
 *   unified-diff file records with fixed line numbers and per-file +/−
 *   stats, share metadata — sharer, expiry, last-checked strings)
 * @output Public shared-file page: a sticky header with the mono filepath,
 *   a "Shared file" Badge, a Live pill (pulsing success StatusDot with a
 *   "Last checked" Tooltip, flippable to an amber "Live refresh failed"
 *   state via a page-chrome Switch), a Rendered / Diff / Code view-mode
 *   SegmentedControl, and an "Open Relay" ghost Button. Rendered mode shows
 *   the Markdown (headings, a table, a code fence); Diff mode shows two
 *   file cards of unified-diff rows with dual line-number gutters and
 *   +/− tinted lines; Code mode shows the raw source in a line-numbered
 *   CodeBlock. Below: a share-provenance footer caption and a signed-out
 *   specimen Card.
 * @position Page template; emitted by \`astryx template shared-file-viewer\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the sticky chrome
 * (file identity, live pill, view-mode control); LayoutContent hosts a
 * centered reading column (maxWidth 880). Unlike file-browser-preview this
 * is a *public share* surface — one file, no tree, provenance up front.
 *
 * Responsive contract:
 * - Reading column: maxWidth 880, centered; only the content scrolls —
 *   the header is fixed chrome.
 * - Width is measured with a local ResizeObserver (useElementWidth), not
 *   viewport media queries, so the layout adapts inside inline stages.
 * - >720px: single header row — icon + path + badge + live pill on the
 *   left, view-mode control + Open Relay on the right.
 * - <=720px: the header stacks into two rows (identity, then controls),
 *   the "Shared file" Badge drops, and diff text wraps (pre-wrap) instead
 *   of forcing horizontal scroll; the dual line-number gutters stay.
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Markdown} from '@astryxdesign/core/Markdown';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {FileTextIcon, LockIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  measureWrap: {height: '100%'},
  // Centered reading column; LayoutContent owns scrolling.
  column: {
    maxWidth: 880,
    marginInline: 'auto',
    paddingBottom: 'var(--spacing-6)',
  },
  headerPath: {minWidth: 0},
  livePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 2,
    backgroundColor: 'var(--color-background-card)',
    whiteSpace: 'nowrap',
  },
  livePillFailed: {
    borderColor: 'color-mix(in srgb, var(--color-warning) 45%, transparent)',
    backgroundColor:
      'color-mix(in srgb, var(--color-warning) 12%, var(--color-background-card))',
  },
  // Diff file card: full-bleed rows, so the card chrome is hand-rolled
  // instead of Card padding.
  diffCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  diffCardHeader: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  diffBody: {
    fontFamily: 'var(--font-family-code, ui-monospace, monospace)',
    fontSize: 12,
    lineHeight: 1.7,
  },
  diffRow: {display: 'flex', alignItems: 'stretch'},
  diffRowAdd: {
    backgroundColor: 'color-mix(in srgb, var(--color-success) 10%, transparent)',
  },
  diffRowRemove: {
    backgroundColor: 'color-mix(in srgb, var(--color-error) 10%, transparent)',
  },
  diffRowHunk: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  diffGutter: {
    width: 40,
    flexShrink: 0,
    textAlign: 'right',
    paddingRight: 'var(--spacing-1)',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    userSelect: 'none',
  },
  diffGutterAdd: {
    backgroundColor: 'color-mix(in srgb, var(--color-success) 8%, transparent)',
  },
  diffGutterRemove: {
    backgroundColor: 'color-mix(in srgb, var(--color-error) 8%, transparent)',
  },
  diffSign: {
    width: 18,
    flexShrink: 0,
    textAlign: 'center',
    userSelect: 'none',
  },
  diffSignAdd: {color: 'var(--color-success)'},
  diffSignRemove: {color: 'var(--color-error)'},
  diffText: {
    flex: 1,
    minWidth: 0,
    paddingRight: 'var(--spacing-3)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    color: 'var(--color-text-primary)',
  },
  diffHunkText: {color: 'var(--color-text-secondary)'},
  statAdd: {color: 'var(--color-success)'},
  statRemove: {color: 'var(--color-error)'},
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: 11,
  },
  signedOutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
};

// ============= RESPONSIVE HELPER =============
// The demo renders pages in an inline stage narrower than the viewport,
// so media queries never fire there — measure the page's own width.

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
// Deterministic fixtures: fixed line numbers, fixed relative-time strings,
// no clocks, no randomness.

const FILE_PATH = 'memory/RUNBOOK.md';
const SHARED_BY = 'mchen';
const EXPIRES_IN = '6 days';

// One source string serves both the Rendered (Markdown) and Code
// (CodeBlock) views, so the two modes can never drift apart.
const RUNBOOK_SOURCE = \`# Checkout service — deploy runbook

Last verified 2026-07-08 · owned by @mchen · escalation in #ship-room.
Relay agents follow this runbook for every rollout; a human on-call
approves each step marked **gate**.

## Standard rollout

1. Confirm the release branch is green in CI (\\\`deploy.yml\\\`).
2. Ship to **staging** and run the smoke pack (~4 min).
3. **Gate:** on-call approves promotion in the release thread.
4. Promote to production at 10% for 15 minutes, then 100%.

## Environments

| Environment | Cluster    | Gate            | Owner  |
| ----------- | ---------- | --------------- | ------ |
| staging     | use1-blue  | automatic       | agent  |
| prod-canary | use1-green | on-call         | mchen  |
| prod        | multi      | release manager | dvorak |

## Rollback

Roll back with the pinned release id — never \\\`latest\\\`:

\\\`\\\`\\\`bash
relay deploy rollback checkout --to r-2481 --reason "5xx spike"
relay deploy status checkout --watch
\\\`\\\`\\\`

If the rollback stalls past 5 minutes, page the platform on-call.

## Escalation

- Pager: \\\`platform-oncall\\\` (5 min ack)
- Team channel: #ship-room
- Never roll forward during an active incident.
\`;

type DiffLineKind = 'context' | 'add' | 'remove' | 'hunk';

interface DiffLine {
  id: string;
  kind: DiffLineKind;
  oldNo?: number;
  newNo?: number;
  text: string;
}

interface DiffFile {
  id: string;
  path: string;
  additions: number;
  deletions: number;
  lines: DiffLine[];
}

// The latest update to the shared memory folder touched two files.
const DIFF_FILES: DiffFile[] = [
  {
    id: 'df-1',
    path: 'memory/RUNBOOK.md',
    additions: 5,
    deletions: 3,
    lines: [
      {id: 'r-h1', kind: 'hunk', text: '@@ -8,4 +8,5 @@ ## Standard rollout'},
      {
        id: 'r-1',
        kind: 'context',
        oldNo: 8,
        newNo: 8,
        text: '2. Ship to **staging** and run the smoke pack (~4 min).',
      },
      {
        id: 'r-2',
        kind: 'remove',
        oldNo: 9,
        text: '3. Promote straight to production once staging is green.',
      },
      {
        id: 'r-3',
        kind: 'add',
        newNo: 9,
        text: '3. **Gate:** on-call approves promotion in the release thread.',
      },
      {
        id: 'r-4',
        kind: 'add',
        newNo: 10,
        text: '4. Promote to production at 10% for 15 minutes, then 100%.',
      },
      {id: 'r-5', kind: 'context', oldNo: 10, newNo: 11, text: ''},
      {id: 'r-6', kind: 'context', oldNo: 11, newNo: 12, text: '## Environments'},
      {id: 'r-h2', kind: 'hunk', text: '@@ -24,5 +25,6 @@ ## Rollback'},
      {
        id: 'r-7',
        kind: 'context',
        oldNo: 24,
        newNo: 25,
        text: 'Roll back with the pinned release id — never \`latest\`:',
      },
      {id: 'r-8', kind: 'context', oldNo: 25, newNo: 26, text: '\`\`\`bash'},
      {
        id: 'r-9',
        kind: 'remove',
        oldNo: 26,
        text: 'relay deploy rollback checkout --to r-2418',
      },
      {
        id: 'r-10',
        kind: 'add',
        newNo: 27,
        text: 'relay deploy rollback checkout --to r-2481 --reason "5xx spike"',
      },
      {
        id: 'r-11',
        kind: 'add',
        newNo: 28,
        text: 'relay deploy status checkout --watch',
      },
      {id: 'r-12', kind: 'context', oldNo: 27, newNo: 29, text: '\`\`\`'},
      {
        id: 'r-13',
        kind: 'remove',
        oldNo: 28,
        text: 'If the rollback stalls, page the on-call.',
      },
      {
        id: 'r-14',
        kind: 'add',
        newNo: 30,
        text: 'If the rollback stalls past 5 minutes, page the platform on-call.',
      },
    ],
  },
  {
    id: 'df-2',
    path: 'memory/oncall/escalation.md',
    additions: 3,
    deletions: 1,
    lines: [
      {id: 'e-h1', kind: 'hunk', text: '@@ -3,3 +3,5 @@ ## Escalation'},
      {
        id: 'e-1',
        kind: 'context',
        oldNo: 3,
        newNo: 3,
        text: '- Pager: \`platform-oncall\` (5 min ack)',
      },
      {id: 'e-2', kind: 'remove', oldNo: 4, text: '- Team channel: #deploys'},
      {id: 'e-3', kind: 'add', newNo: 4, text: '- Team channel: #ship-room'},
      {
        id: 'e-4',
        kind: 'add',
        newNo: 5,
        text: '- Status page: status.relaybot.dev',
      },
      {
        id: 'e-5',
        kind: 'add',
        newNo: 6,
        text: '- Never roll forward during an active incident.',
      },
      {id: 'e-6', kind: 'context', oldNo: 5, newNo: 7, text: ''},
    ],
  },
];

const DIFF_SUMMARY =
  'Latest update · commit a4f19c2 · Jul 11, 2026 · 2 files changed';

type ViewMode = 'rendered' | 'diff' | 'code';

// ============= LIVE PILL =============

function LivePill({isFailed}: {isFailed: boolean}) {
  const pillStyle = isFailed
    ? {...styles.livePill, ...styles.livePillFailed}
    : styles.livePill;
  return (
    <Tooltip
      content={
        isFailed
          ? 'Live refresh failed · last successful check 4m ago'
          : 'Last checked 30s ago'
      }
      hasHoverIndication={false}>
      <span style={pillStyle}>
        <StatusDot
          variant={isFailed ? 'warning' : 'success'}
          label={isFailed ? 'Live refresh failed' : 'Live'}
          isPulsing={!isFailed}
        />
        <Text type="supporting" size="sm">
          {isFailed ? 'Live refresh failed' : 'Live'}
        </Text>
      </span>
    </Tooltip>
  );
}

// ============= DIFF RENDERING =============

function DiffRow({line}: {line: DiffLine}) {
  if (line.kind === 'hunk') {
    return (
      <div style={{...styles.diffRow, ...styles.diffRowHunk}}>
        <span style={styles.diffGutter} aria-hidden />
        <span style={styles.diffGutter} aria-hidden />
        <span style={styles.diffSign} aria-hidden />
        <span style={{...styles.diffText, ...styles.diffHunkText}}>
          {line.text}
        </span>
      </div>
    );
  }

  const rowStyle =
    line.kind === 'add'
      ? {...styles.diffRow, ...styles.diffRowAdd}
      : line.kind === 'remove'
        ? {...styles.diffRow, ...styles.diffRowRemove}
        : styles.diffRow;
  const gutterStyle =
    line.kind === 'add'
      ? {...styles.diffGutter, ...styles.diffGutterAdd}
      : line.kind === 'remove'
        ? {...styles.diffGutter, ...styles.diffGutterRemove}
        : styles.diffGutter;
  const signStyle =
    line.kind === 'add'
      ? {...styles.diffSign, ...styles.diffSignAdd}
      : line.kind === 'remove'
        ? {...styles.diffSign, ...styles.diffSignRemove}
        : styles.diffSign;
  const sign = line.kind === 'add' ? '+' : line.kind === 'remove' ? '−' : ' ';

  return (
    <div style={rowStyle}>
      <span style={gutterStyle}>{line.oldNo ?? ''}</span>
      <span style={gutterStyle}>{line.newNo ?? ''}</span>
      <span style={signStyle}>{sign}</span>
      <span style={styles.diffText}>{line.text || ' '}</span>
    </div>
  );
}

function DiffFileCard({file}: {file: DiffFile}) {
  return (
    <div style={styles.diffCard}>
      <div style={styles.diffCardHeader}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FileTextIcon} size="sm" color="secondary" />
          <StackItem size="fill" style={styles.headerPath}>
            <Text type="code" size="sm" maxLines={1}>
              {file.path}
            </Text>
          </StackItem>
          <Text type="code" size="sm" hasTabularNumbers style={styles.statAdd}>
            +{file.additions}
          </Text>
          <Text
            type="code"
            size="sm"
            hasTabularNumbers
            style={styles.statRemove}>
            −{file.deletions}
          </Text>
        </HStack>
      </div>
      <div style={styles.diffBody}>
        {file.lines.map(line => (
          <DiffRow key={line.id} line={line} />
        ))}
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function SharedFileViewerTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [viewMode, setViewMode] = useState<ViewMode>('rendered');
  const [isLiveFailed, setIsLiveFailed] = useState(false);

  const fileIdentity = (
    <HStack gap={2} vAlign="center">
      <Icon icon={FileTextIcon} size="sm" color="secondary" />
      <StackItem size={isCompact ? 'fill' : 'static'} style={styles.headerPath}>
        <Text type="code" size="sm" maxLines={1}>
          {FILE_PATH}
        </Text>
      </StackItem>
      {!isCompact && <Badge label="Shared file" variant="neutral" />}
      <LivePill isFailed={isLiveFailed} />
    </HStack>
  );

  const viewControls = (
    <HStack gap={2} vAlign="center">
      <SegmentedControl
        label="View mode"
        size="sm"
        value={viewMode}
        onChange={value => setViewMode(value as ViewMode)}>
        <SegmentedControlItem value="rendered" label="Rendered" />
        <SegmentedControlItem value="diff" label="Diff" />
        <SegmentedControlItem value="code" label="Code" />
      </SegmentedControl>
      <Button label="Open Relay" variant="ghost" size="sm" onClick={() => {}} />
    </HStack>
  );

  return (
    <div ref={wrapRef} style={styles.measureWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            {isCompact ? (
              <VStack gap={2}>
                {fileIdentity}
                {viewControls}
              </VStack>
            ) : (
              <HStack gap={3} vAlign="center">
                <StackItem size="fill" style={styles.headerPath}>
                  {fileIdentity}
                </StackItem>
                {viewControls}
              </HStack>
            )}
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.column}>
              <VStack gap={4}>
                {/* Page-chrome toggle: flips the Live pill into its amber
                    refresh-failed state. */}
                <HStack gap={3} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      This link re-checks the shared file every 30 seconds
                      while the source session is active.
                    </Text>
                  </StackItem>
                  <Switch
                    label="Simulate refresh failure"
                    value={isLiveFailed}
                    onChange={checked => setIsLiveFailed(checked)}
                  />
                </HStack>

                {viewMode === 'rendered' && (
                  <Card padding={5}>
                    <Markdown headingLevelStart={1}>{RUNBOOK_SOURCE}</Markdown>
                  </Card>
                )}

                {viewMode === 'diff' && (
                  <VStack gap={3}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="supporting" color="secondary">
                          {DIFF_SUMMARY}
                        </Text>
                      </StackItem>
                      <Text
                        type="code"
                        size="sm"
                        hasTabularNumbers
                        style={styles.statAdd}>
                        +8
                      </Text>
                      <Text
                        type="code"
                        size="sm"
                        hasTabularNumbers
                        style={styles.statRemove}>
                        −4
                      </Text>
                    </HStack>
                    {DIFF_FILES.map(file => (
                      <DiffFileCard key={file.id} file={file} />
                    ))}
                  </VStack>
                )}

                {viewMode === 'code' && (
                  <CodeBlock
                    code={RUNBOOK_SOURCE}
                    language="markdown"
                    hasLineNumbers
                    width="100%"
                    size="sm"
                  />
                )}

                {/* Share provenance footer. */}
                <Text type="supporting" color="secondary">
                  Shared by {SHARED_BY} · expires in {EXPIRES_IN} · view-only
                  link
                </Text>

                <Divider />

                {/* Signed-out specimen: what the link shows without a
                    session. */}
                <VStack gap={2}>
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.eyebrow}>
                    Signed-out state
                  </Text>
                  <Card padding={5}>
                    <VStack gap={3} hAlign="center">
                      <div style={styles.signedOutIconWrap}>
                        <Icon icon={LockIcon} size="sm" color="secondary" />
                      </div>
                      <VStack gap={1} hAlign="center">
                        <Heading level={2}>
                          Sign in to view this shared file.
                        </Heading>
                        <Text type="supporting" color="secondary">
                          This workspace restricts shared links to Relay
                          accounts.
                        </Text>
                      </VStack>
                      <HStack gap={2}>
                        <Button label="Sign in" size="sm" onClick={() => {}} />
                        <Button
                          label="Request access"
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                        />
                      </HStack>
                    </VStack>
                  </Card>
                </VStack>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};