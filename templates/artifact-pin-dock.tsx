// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (5 pinned artifacts with CI states, two
 *   GitHub PR fixtures with fixed check counts and diff stats, two data
 *   sources with mono commands, cadences, and fixed last-run results)
 * @output Artifact/pin management dock: a horizontally scrollable row of
 *   rounded-full pill tabs — file pins carry file-type icons, PR pins carry
 *   CI StatusDots (green success, pulsing amber pending) with matching
 *   tinted borders, the active pill an accent border — above a ~60vh viewer
 *   Card with a floating top-right action cluster (open-external, copy,
 *   download, share, close IconButtons in a ButtonGroup) and a floating
 *   top-left Preview/Code/Markdown SegmentedControl; the viewer renders a
 *   GitHub PR status card (Avatar circle, title, repo#number, green Open
 *   Badge, label Tokens, author/files/±diff/comments stat row, and a
 *   "9/12 checks passed · 3 pending" CI line) or file/external-pin bodies.
 *   Below, an expandable "Data sources" bar lists read (sky Token) and
 *   write (amber Token) sources with mono commands, cadence chips, Run
 *   buttons, and result chips ("exit 0 in 412ms" success / destructive
 *   error with a "Show command output" excerpt)
 * @position Page template; emitted by `astryx template artifact-pin-dock`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (dock title,
 * pin count, sync caption). LayoutContent hosts a single centered column
 * (maxWidth 960) that scrolls as one region: pill row, viewer Card, data
 * sources bar. No side panels: unlike ai-chat-artifact this surface is
 * about juggling *multiple pinned artifacts* and external PRs with status
 * chrome, not one generated artifact beside a transcript.
 *
 * Responsive contract:
 * - Column: maxWidth 960, centered; the whole column scrolls vertically.
 * - >720px: pills stay on one line and the row scrolls horizontally
 *   (flexShrink 0 per pill); the action cluster renders as a ButtonGroup
 *   of five IconButtons floating top-right of the viewer.
 * - <=720px: pills wrap onto multiple rows and grow to 40px touch
 *   targets; the action cluster collapses into a single MoreMenu; the
 *   viewer drops from 60vh to a 360px minimum (viewerBody still scrolls
 *   internally).
 * - Data source rows: the header HStack wraps (result chip + Run button
 *   drop below the name when narrow) and the MetadataList switches from
 *   two columns to one under 720px (columns="multi" auto-fill handles
 *   this).
 *
 * Container policy (dock archetype): the viewer and the data sources bar
 * are Cards; pills are bespoke rounded-full buttons because CI tint lives
 * on their borders (green/yellow) with the accent border marking the
 * active pin. CI state vocabulary: success=green dot, pending=pulsing
 * amber dot, failure=red dot (vocabulary reserved in PIN_CI).
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Code} from '@astryxdesign/core/Code';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ChartColumnIcon,
  CheckIcon,
  CopyIcon,
  DatabaseIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  LinkIcon,
  PlayIcon,
  Share2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered dock column; the LayoutContent region owns vertical scroll.
  column: {
    maxWidth: 960,
    marginInline: 'auto',
  },
  // Pill row: one scrolling line on desktop, wraps on mobile.
  pillRowScroll: {
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  pillRowWrap: {
    flexWrap: 'wrap',
  },
  // Rounded-full pill tab; border color carries CI tint / active accent.
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  // <=720px: grow the pills to 40px touch targets (the ~28px desktop box
  // is fine for pointers but too small for thumbs); type and icons stay
  // the same size, the pill just gains vertical padding.
  pillCompact: {minHeight: 40},
  pillActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: '0 0 0 1px var(--color-accent)',
  },
  pillCiSuccess: {borderColor: 'var(--color-border-green)'},
  pillCiPending: {borderColor: 'var(--color-border-yellow)'},
  pillCiFailure: {borderColor: 'var(--color-border-red)'},
  // Viewer: relative wrapper so chrome floats above the artifact body.
  viewerWrap: {
    position: 'relative',
    height: '60vh',
    minHeight: 360,
  },
  // <=720px: give up the 60vh tie to the window and sit at the 360px
  // minimum so the pill rows and data sources stay within thumb reach;
  // viewerBody still scrolls internally for taller fixtures.
  viewerWrapCompact: {height: 360},
  viewerCard: {
    height: '100%',
  },
  viewerChrome: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    right: 'var(--spacing-3)',
    zIndex: 1,
  },
  viewerMode: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    left: 'var(--spacing-3)',
    zIndex: 1,
  },
  // Artifact body: centered, scrolls if the fixture outgrows 60vh; the
  // top padding clears the floating chrome row. Centering uses auto block
  // margins (not alignItems center) so a taller-than-viewport fixture
  // keeps its top edge scrollable instead of clipping past the overflow.
  viewerBody: {
    height: '100%',
    overflowY: 'auto',
    display: 'flex',
    justifyContent: 'center',
    paddingTop: 56,
  },
  viewerInner: {
    width: '100%',
    maxWidth: 512,
    marginBlock: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-4)',
  },
  prTitleCell: {minWidth: 0},
  diffAdditions: {color: 'var(--color-icon-green)'},
  diffDeletions: {color: 'var(--color-icon-red)'},
  labelWrap: {flexWrap: 'wrap'},
  statWrap: {flexWrap: 'wrap'},
  sourceRow: {paddingBlock: 'var(--spacing-3)'},
  sourceOutput: {paddingTop: 'var(--spacing-2)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed counts and durations, no clocks, no
// randomness, no network assets.

const SESSION_NAME = 'q2-launch-review';
const LAST_SYNC = 'Synced Jul 2, 09:41';

type PinKind = 'file' | 'pr' | 'external';
type CiState = 'success' | 'pending' | 'failure';

interface Pin {
  id: string;
  label: string;
  kind: PinKind;
  icon?: IconType;
  ci?: CiState;
  tooltip: string;
}

// CI vocabulary: success=green dot + green-tinted border, pending=pulsing
// amber, failure=red (reserved — no failing pin in this session).
const PIN_CI: Record<
  CiState,
  {dot: 'success' | 'warning' | 'error'; border: CSSProperties; label: string}
> = {
  success: {
    dot: 'success',
    border: styles.pillCiSuccess,
    label: 'Checks passed',
  },
  pending: {
    dot: 'warning',
    border: styles.pillCiPending,
    label: 'Checks pending',
  },
  failure: {dot: 'error', border: styles.pillCiFailure, label: 'Checks failed'},
};

const PINS: Pin[] = [
  {
    id: 'q2-dashboard',
    label: 'q2-dashboard.html',
    kind: 'file',
    icon: ChartColumnIcon,
    tooltip: 'Generated HTML artifact',
  },
  {
    id: 'revenue-summary',
    label: 'revenue-summary.md',
    kind: 'file',
    icon: FileTextIcon,
    tooltip: 'Generated markdown artifact',
  },
  {
    id: 'pr-482',
    label: 'PR #482',
    kind: 'pr',
    ci: 'success',
    tooltip: 'acme/api #482 · 9/12 checks passed',
  },
  {
    id: 'pr-519',
    label: 'PR #519',
    kind: 'pr',
    ci: 'pending',
    tooltip: 'acme/api #519 · checks running',
  },
  {
    id: 'vercel-docs',
    label: 'vercel.com/docs',
    kind: 'external',
    icon: LinkIcon,
    tooltip: 'External pin — opens in a new tab',
  },
];

interface PullRequest {
  id: string;
  repo: string;
  number: number;
  title: string;
  state: 'Open' | 'Merged' | 'Closed' | 'Draft';
  isDraft: boolean;
  author: string;
  authorLogin: string;
  additions: number;
  deletions: number;
  filesChanged: number;
  comments: number;
  labels: string[];
  checksPassed: number;
  checksTotal: number;
  checksPending: number;
}

// PR state badge vocabulary: Open=green, Merged=purple, Closed=red,
// Draft=gray (only Open appears in this session).
const PR_STATE_BADGE: Record<
  PullRequest['state'],
  'green' | 'purple' | 'red' | 'neutral'
> = {
  Open: 'green',
  Merged: 'purple',
  Closed: 'red',
  Draft: 'neutral',
};

const PULL_REQUESTS: Record<string, PullRequest> = {
  'pr-482': {
    id: 'pr-482',
    repo: 'acme/api',
    number: 482,
    title: 'Add retry logic to webhook dispatcher',
    state: 'Open',
    isDraft: false,
    author: 'Alice Devlin',
    authorLogin: 'alice-dev',
    additions: 412,
    deletions: 86,
    filesChanged: 14,
    comments: 5,
    labels: ['backend', 'p1'],
    checksPassed: 9,
    checksTotal: 12,
    checksPending: 3,
  },
  'pr-519': {
    id: 'pr-519',
    repo: 'acme/api',
    number: 519,
    title: 'Backfill audit events for billing exports',
    state: 'Open',
    isDraft: false,
    author: 'Rui Chen',
    authorLogin: 'rui-c',
    additions: 128,
    deletions: 40,
    filesChanged: 6,
    comments: 2,
    labels: ['billing'],
    checksPassed: 4,
    checksTotal: 9,
    checksPending: 5,
  },
};

const HTML_SNIPPET = `<section class="kpi-grid">
  <article class="kpi">
    <h2>Net revenue</h2>
    <p class="value">$4.82M</p>
    <p class="delta up">+12.4% QoQ</p>
  </article>
  <article class="kpi">
    <h2>Churn</h2>
    <p class="value">1.9%</p>
    <p class="delta down">-0.3pt</p>
  </article>
</section>`;

const MARKDOWN_SNIPPET = `# Q2 revenue summary

- Net revenue **$4.82M**, +12.4% QoQ
- Churn down to **1.9%** (-0.3pt)
- Webhook retry work (acme/api#482) unblocks the
  partner-billing launch

> Draft — numbers final after the Jul 8 close.`;

type ViewMode = 'preview' | 'code' | 'markdown';

interface SourceResult {
  chip: string;
  isError: boolean;
  output?: string;
}

interface DataSource {
  id: string;
  name: string;
  mode: 'read' | 'write';
  node: string;
  fn: string;
  command: string;
  cadence: string;
  lastRun: SourceResult;
  rerun: SourceResult; // deterministic result after pressing Run
}

// Mode vocabulary: read=sky Token, write=amber Token.
const SOURCE_MODE: Record<
  DataSource['mode'],
  {label: string; color: 'cyan' | 'yellow'}
> = {
  read: {label: 'READ', color: 'cyan'},
  write: {label: 'WRITE', color: 'yellow'},
};

const DATA_SOURCES: DataSource[] = [
  {
    id: 'orders-feed',
    name: 'Orders feed',
    mode: 'read',
    node: 'sandbox us-west-2',
    fn: 'fetch_orders',
    command: 'python fetch_orders.py --json',
    cadence: 'every 5m',
    lastRun: {chip: 'exit 0 in 412ms', isError: false},
    rerun: {chip: 'exit 0 in 398ms', isError: false},
  },
  {
    id: 'metrics-writer',
    name: 'Metrics writer',
    mode: 'write',
    node: 'sandbox us-west-2',
    fn: 'push_metrics',
    command: 'node push_metrics.js',
    cadence: 'every 15m',
    lastRun: {
      chip: 'exit 1 in 2.3s',
      isError: true,
      output: `Error: ECONNRESET writing to metrics.acme.internal:8125
    at TCPStream.write (push_metrics.js:47:19)
    at flushBatch (push_metrics.js:81:5)
retry 3/3 failed — giving up`,
    },
    rerun: {chip: 'exit 0 in 1.1s', isError: false},
  },
];

const READ_COUNT = DATA_SOURCES.filter(s => s.mode === 'read').length;
const WRITE_COUNT = DATA_SOURCES.filter(s => s.mode === 'write').length;

// ============= PILL TABS =============

function ArtifactPill({
  pin,
  isActive,
  isCompact,
  onSelect,
}: {
  pin: Pin;
  isActive: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const ci = pin.ci != null ? PIN_CI[pin.ci] : undefined;
  const pillStyle: CSSProperties = {
    ...styles.pill,
    ...(isCompact ? styles.pillCompact : {}),
    ...(ci?.border ?? {}),
    ...(isActive ? styles.pillActive : {}),
  };

  return (
    <Tooltip content={pin.tooltip}>
      <button
        type="button"
        style={pillStyle}
        aria-pressed={isActive}
        onClick={() => onSelect(pin.id)}>
        {ci != null ? (
          <StatusDot
            variant={ci.dot}
            label={ci.label}
            isPulsing={pin.ci === 'pending'}
          />
        ) : pin.icon != null ? (
          <Icon icon={pin.icon} size="sm" color="secondary" />
        ) : null}
        <Text size="sm" weight={isActive ? 'medium' : 'normal'}>
          {pin.label}
        </Text>
      </button>
    </Tooltip>
  );
}

// ============= GITHUB PR CARD =============

function GitHubPrCard({pr}: {pr: PullRequest}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <Avatar name={pr.author} alt={pr.authorLogin} size="medium" />
          <StackItem size="fill" style={styles.prTitleCell}>
            <VStack gap={0}>
              <Heading level={2}>{pr.title}</Heading>
              <Text type="supporting" color="secondary">
                {pr.repo} #{pr.number}
              </Text>
            </VStack>
          </StackItem>
          <Badge
            variant={PR_STATE_BADGE[pr.state]}
            label={pr.isDraft ? 'Draft' : pr.state}
          />
        </HStack>

        {pr.labels.length > 0 && (
          <HStack gap={1} style={styles.labelWrap}>
            {pr.labels.map(label => (
              <Token key={label} label={label} size="sm" />
            ))}
          </HStack>
        )}

        <HStack gap={2} vAlign="center" style={styles.statWrap}>
          <Text type="supporting" color="secondary">
            by {pr.authorLogin} · {pr.filesChanged} files changed ·
          </Text>
          <Text type="supporting" hasTabularNumbers style={styles.diffAdditions}>
            +{pr.additions}
          </Text>
          <Text type="supporting" hasTabularNumbers style={styles.diffDeletions}>
            −{pr.deletions}
          </Text>
          <Text type="supporting" color="secondary">
            · {pr.comments} comments
          </Text>
        </HStack>

        <Divider />

        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={pr.checksPending > 0 ? 'warning' : 'success'}
            label={pr.checksPending > 0 ? 'Checks pending' : 'Checks passed'}
            isPulsing={pr.checksPending > 0}
          />
          <Text type="supporting" hasTabularNumbers>
            {pr.checksPassed}/{pr.checksTotal} checks passed
            {pr.checksPending > 0 ? ` · ${pr.checksPending} pending` : ''}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

function prAsJson(pr: PullRequest): string {
  return JSON.stringify(
    {
      repo: pr.repo,
      number: pr.number,
      title: pr.title,
      state: pr.state.toLowerCase(),
      draft: pr.isDraft,
      author: pr.authorLogin,
      additions: pr.additions,
      deletions: pr.deletions,
      changed_files: pr.filesChanged,
      comments: pr.comments,
      labels: pr.labels,
      checks: {
        passed: pr.checksPassed,
        total: pr.checksTotal,
        pending: pr.checksPending,
      },
    },
    null,
    2,
  );
}

function prAsMarkdown(pr: PullRequest): string {
  return `## [${pr.repo}#${pr.number}] ${pr.title}

- **State:** ${pr.state} · by @${pr.authorLogin}
- **Diff:** +${pr.additions} / −${pr.deletions} across ${pr.filesChanged} files
- **Checks:** ${pr.checksPassed}/${pr.checksTotal} passed, ${pr.checksPending} pending
- **Labels:** ${pr.labels.join(', ')}`;
}

// ============= VIEWER BODY =============

function FilePinPlaceholder({
  icon,
  title,
  caption,
}: {
  icon: IconType;
  title: string;
  caption: string;
}) {
  return (
    <VStack gap={2} hAlign="center">
      <Icon icon={icon} size="lg" color="secondary" />
      <Heading level={3}>{title}</Heading>
      <Text type="supporting" color="secondary" justify="center">
        {caption}
      </Text>
    </VStack>
  );
}

function ViewerBody({pin, mode}: {pin: Pin; mode: ViewMode}) {
  if (pin.kind === 'pr') {
    const pr = PULL_REQUESTS[pin.id];
    if (mode === 'code') {
      return (
        <CodeBlock
          code={prAsJson(pr)}
          language="json"
          size="sm"
          width="100%"
          title={`${pr.repo.replace('/', '-')}-${pr.number}.json`}
        />
      );
    }
    if (mode === 'markdown') {
      return (
        <CodeBlock
          code={prAsMarkdown(pr)}
          language="markdown"
          size="sm"
          width="100%"
        />
      );
    }
    return <GitHubPrCard pr={pr} />;
  }

  if (pin.id === 'q2-dashboard') {
    if (mode === 'preview') {
      return (
        <FilePinPlaceholder
          icon={ChartColumnIcon}
          title="q2-dashboard.html"
          caption="Sandboxed preview · 2 KPI widgets · rendered from the generated HTML"
        />
      );
    }
    return (
      <CodeBlock
        code={HTML_SNIPPET}
        language="html"
        size="sm"
        width="100%"
        title="q2-dashboard.html"
      />
    );
  }

  if (pin.id === 'revenue-summary') {
    if (mode === 'code' || mode === 'markdown') {
      return (
        <CodeBlock
          code={MARKDOWN_SNIPPET}
          language="markdown"
          size="sm"
          width="100%"
          title="revenue-summary.md"
        />
      );
    }
    return (
      <FilePinPlaceholder
        icon={FileTextIcon}
        title="revenue-summary.md"
        caption="5-line summary · draft until the Jul 8 close"
      />
    );
  }

  // External pin: never rendered inline — only a jump-off.
  return (
    <VStack gap={3} hAlign="center">
      <Icon icon={LinkIcon} size="lg" color="secondary" />
      <Heading level={3}>vercel.com/docs</Heading>
      <Text type="supporting" color="secondary" justify="center">
        External pin — content is not mirrored into the dock.
      </Text>
      <Button
        label="Open vercel.com/docs"
        variant="secondary"
        size="sm"
        endContent={<Icon icon={ExternalLinkIcon} size="sm" color="inherit" />}
        onClick={() => {}}
      />
    </VStack>
  );
}

// ============= DATA SOURCES =============

function DataSourceRow({
  source,
  result,
  onRun,
}: {
  source: DataSource;
  result: SourceResult;
  onRun: (id: string) => void;
}) {
  const mode = SOURCE_MODE[source.mode];

  return (
    <VStack gap={3} style={styles.sourceRow}>
      {/* wrap="wrap" lets the result chip + Run button drop below the
          name on narrow viewports instead of squeezing it word-per-line;
          on desktop everything fits so nothing wraps. */}
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Token label={mode.label} size="sm" color={mode.color} />
        <StackItem size="fill">
          <Text weight="medium">{source.name}</Text>
        </StackItem>
        <Tooltip
          content={
            result.isError
              ? 'Last run failed — see command output'
              : 'Last run succeeded'
          }>
          <Badge
            variant={result.isError ? 'error' : 'success'}
            label={result.chip}
          />
        </Tooltip>
        <Button
          label="Run"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
          onClick={() => onRun(source.id)}
        />
      </HStack>

      <MetadataList columns="multi" label={{position: 'top'}}>
        <MetadataListItem label="Node">
          <Text type="supporting">{source.node}</Text>
        </MetadataListItem>
        <MetadataListItem label="Function">
          <Text type="supporting">{source.fn}</Text>
        </MetadataListItem>
        <MetadataListItem label="Command">
          <Code>{source.command}</Code>
        </MetadataListItem>
        <MetadataListItem label="Cadence">
          <Token label={source.cadence} size="sm" />
        </MetadataListItem>
      </MetadataList>

      {result.isError && result.output != null && (
        <Collapsible
          defaultIsOpen={false}
          trigger={
            <Text type="supporting" color="secondary">
              Show command output
            </Text>
          }>
          <div style={styles.sourceOutput}>
            <CodeBlock
              code={result.output}
              language="bash"
              size="sm"
              width="100%"
              hasCopyButton={false}
            />
          </div>
        </Collapsible>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function ArtifactPinDockTemplate() {
  // PR #482 opens first so its status chrome is front and center; every
  // pill swaps the viewer body.
  const [pins, setPins] = useState(PINS);
  const [activeId, setActiveId] = useState('pr-482');
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [isCopied, setIsCopied] = useState(false);
  // Result chips keyed by source id; "Run" swaps in the deterministic
  // rerun result (the failed Metrics writer recovers on rerun).
  const [results, setResults] = useState<Record<string, SourceResult>>(() =>
    Object.fromEntries(DATA_SOURCES.map(s => [s.id, s.lastRun])),
  );

  const isCompact = useMediaQuery('(max-width: 720px)');

  const activePin = pins.find(pin => pin.id === activeId) ?? pins[0];
  const canUnpin = pins.length > 1;

  const selectPin = (id: string) => {
    setActiveId(id);
    setViewMode('preview');
    setIsCopied(false);
  };

  // Close unpins the active artifact and falls back to its neighbor.
  const unpinActive = () => {
    if (!canUnpin) {
      return;
    }
    const index = pins.findIndex(pin => pin.id === activePin.id);
    const next = pins[index + 1] ?? pins[index - 1];
    setPins(prev => prev.filter(pin => pin.id !== activePin.id));
    selectPin(next.id);
  };

  const runSource = (id: string) => {
    const source = DATA_SOURCES.find(entry => entry.id === id);
    if (source != null) {
      setResults(prev => ({...prev, [id]: source.rerun}));
    }
  };

  const actionCluster = isCompact ? (
    <MoreMenu
      label="Artifact actions"
      variant="secondary"
      size="sm"
      items={[
        {label: 'Open in new tab', onClick: () => {}},
        {label: isCopied ? 'Copied' : 'Copy contents', onClick: () => setIsCopied(true)},
        {label: 'Download', onClick: () => {}},
        {label: 'Share', onClick: () => {}},
        {label: 'Unpin artifact', onClick: unpinActive, isDisabled: !canUnpin},
      ]}
    />
  ) : (
    <ButtonGroup label="Artifact actions" size="sm">
      <IconButton
        label={`Open ${activePin.label} in a new tab`}
        tooltip="Open in new tab"
        icon={<Icon icon={ExternalLinkIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        onClick={() => {}}
      />
      <IconButton
        label={isCopied ? 'Copied' : `Copy ${activePin.label}`}
        tooltip={isCopied ? 'Copied' : 'Copy contents'}
        icon={
          <Icon icon={isCopied ? CheckIcon : CopyIcon} size="sm" color="inherit" />
        }
        variant="secondary"
        size="sm"
        onClick={() => setIsCopied(true)}
      />
      <IconButton
        label={`Download ${activePin.label}`}
        tooltip="Download"
        icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        onClick={() => {}}
      />
      <IconButton
        label={`Share ${activePin.label}`}
        tooltip="Share"
        icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        onClick={() => {}}
      />
      <IconButton
        label={`Unpin ${activePin.label}`}
        tooltip={canUnpin ? 'Unpin' : 'Last pin — cannot unpin'}
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="secondary"
        size="sm"
        isDisabled={!canUnpin}
        onClick={unpinActive}
      />
    </ButtonGroup>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Artifact dock</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {pins.length} pinned · {SESSION_NAME}
                </Text>
              </HStack>
            </StackItem>
            {!isCompact && (
              <Text type="supporting" color="secondary">
                {LAST_SYNC}
              </Text>
            )}
            <Button label="Pin artifact" variant="secondary" size="sm" onClick={() => {}} />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* Pill tab row: scrolls on desktop, wraps on mobile. */}
              <HStack
                gap={2}
                vAlign="center"
                style={isCompact ? styles.pillRowWrap : styles.pillRowScroll}>
                {pins.map(pin => (
                  <ArtifactPill
                    key={pin.id}
                    pin={pin}
                    isActive={pin.id === activePin.id}
                    isCompact={isCompact}
                    onSelect={selectPin}
                  />
                ))}
              </HStack>

              {/* Viewer: floating mode switch (top-left) and action
                  cluster (top-right) over the centered artifact body. */}
              <div
                style={
                  isCompact
                    ? {...styles.viewerWrap, ...styles.viewerWrapCompact}
                    : styles.viewerWrap
                }>
                <Card padding={0} variant="muted" style={styles.viewerCard}>
                  <div style={styles.viewerMode}>
                    <SegmentedControl
                      label="Viewer mode"
                      size="sm"
                      value={viewMode}
                      onChange={value => setViewMode(value as ViewMode)}>
                      <SegmentedControlItem value="preview" label="Preview" />
                      <SegmentedControlItem value="code" label="Code" />
                      <SegmentedControlItem value="markdown" label="Markdown" />
                    </SegmentedControl>
                  </div>
                  <div style={styles.viewerChrome}>{actionCluster}</div>
                  <div style={styles.viewerBody}>
                    <div style={styles.viewerInner}>
                      <ViewerBody pin={activePin} mode={viewMode} />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Data sources bar: rendered expanded; the collapsed
                  trigger row is the summary. */}
              <Card padding={3}>
                <Collapsible
                  defaultIsOpen
                  trigger={
                    <HStack gap={2} vAlign="center">
                      <Icon icon={DatabaseIcon} size="sm" color="secondary" />
                      <Text weight="medium">
                        Data sources · {DATA_SOURCES.length} connected
                      </Text>
                      <StackItem size="fill" />
                      {!isCompact && (
                        <Text type="supporting" color="secondary" hasTabularNumbers>
                          {READ_COUNT} read · {WRITE_COUNT} write
                        </Text>
                      )}
                      <Token label="next sync 5m" size="sm" />
                    </HStack>
                  }>
                  <VStack gap={0}>
                    {DATA_SOURCES.map((source, index) => (
                      <VStack key={source.id} gap={0}>
                        {index > 0 && <Divider />}
                        <DataSourceRow
                          source={source}
                          result={results[source.id]}
                          onRun={runSource}
                        />
                      </VStack>
                    ))}
                  </VStack>
                </Collapsible>
              </Card>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
