var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (two repos of open pull requests with
 *   authors, short SHAs, verification statuses, per-test result rows with
 *   fixed durations and captured error output, and three fixed 30-day
 *   passed/failed trend series)
 * @output CI verification dashboard for agent-authored PRs: a header with
 *   repo Selector and per-status summary chips (pulsing dot on Pending); a
 *   PR card list where each SelectableCard carries an author Avatar, PR
 *   number + title, \`by <author> · <sha>\` line, a verification Badge
 *   (Verified / Pending / Failed / No tests), a passed/failed caption, and
 *   a thin pass-rate ProgressBar tinted by threshold (≥95 success, ≥80
 *   warning, else error); a right detail panel with per-test rows (✓ ✗ ⚠ ⊘
 *   glyphs, mono names, tabular durations) where failing rows expand via
 *   Collapsible into an error CodeBlock, plus a \`Daily Trend (30d)\` stacked
 *   mini bar chart (inline SVG, success/error segments, hover readout); and
 *   a dashed empty-state specimen (\`No open pull requests\`) under a Divider
 * @position Page template; emitted by \`astryx template pr-verification-dashboard\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * summary chips, repo Selector). LayoutContent scrolls the PR card list and
 * the empty-state specimen; the detail lives in an end LayoutPanel so the
 * list and the selected PR's test results are visible side by side.
 *
 * Responsive contract (useElementWidth on the page wrapper — viewport media
 * queries never fire in the inline demo stage):
 * - >900px: detail is a 420px end LayoutPanel with divider; the summary
 *   chips sit inline in the header next to the repo Selector.
 * - <=900px: the end panel is dropped — the detail renders below the PR
 *   list under a Divider (selection scrolls with the list); the summary
 *   chips leave the header and become a wrapping row above the PR list.
 * - The trend chart is viewBox-scaled SVG, so it tracks the panel width in
 *   both arrangements; hover buckets are computed from the scaled width.
 */

import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, MouseEvent as ReactMouseEvent, RefObject} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {GitPullRequestIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  pageWrap: {height: '100%'},
  listColumn: {
    maxWidth: 760,
    marginInline: 'auto',
    width: '100%',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  chipWrap: {flexWrap: 'wrap'},
  cardTitleCell: {minWidth: 0},
  passRateCell: {minWidth: 0},
  rateBar: {flex: 1, minWidth: 0},
  // Per-test rows: fixed glyph column so mono names align.
  testRow: {paddingBlock: 'var(--spacing-1)'},
  testGlyph: {
    width: 16,
    flexShrink: 0,
    textAlign: 'center',
    fontFamily: 'var(--font-family-code)',
    fontSize: 13,
    lineHeight: '16px',
  },
  testName: {minWidth: 0},
  // Trend chart: swatches echo the segment fills; text stays in text tokens.
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  trendSvg: {display: 'block', width: '100%'},
  // Dashed specimen panel — matches the empty-state treatment used by
  // sibling dashboards.
  specimenPanel: {
    border: '1.5px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-6)',
  },
  detailStack: {paddingBottom: 'var(--spacing-4)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed durations, fixed SHAs, fixed trend series.
// No Date.now(), no randomness.

const PRODUCT_NAME = 'Gatecheck CI';

type VerificationStatus = 'verified' | 'pending' | 'failed' | 'no-tests';
type TestStatus = 'passed' | 'failed' | 'error' | 'skipped';

interface TestCase {
  id: string;
  name: string;
  status: TestStatus;
  duration: string;
  errorOutput?: string;
  /** Pre-expanded on load so the failure is visible without a click. */
  defaultOpen?: boolean;
}

type TrendKey = 'steady' | 'recovering' | 'flaky';

interface PullRequest {
  id: string;
  number: number;
  title: string;
  author: string;
  authorName: string;
  sha: string;
  status: VerificationStatus;
  /** Tests still executing (pending PRs only). */
  runningCount?: number;
  tests: TestCase[];
  trend: TrendKey;
}

const STATUS_META: Record<
  VerificationStatus,
  {
    label: string;
    badge: 'success' | 'warning' | 'error' | 'neutral';
    dot: 'success' | 'warning' | 'error' | 'neutral';
    isPulsing: boolean;
  }
> = {
  verified: {label: 'Verified', badge: 'success', dot: 'success', isPulsing: false},
  pending: {label: 'Pending', badge: 'warning', dot: 'warning', isPulsing: true},
  failed: {label: 'Failed', badge: 'error', dot: 'error', isPulsing: false},
  'no-tests': {label: 'No tests', badge: 'neutral', dot: 'neutral', isPulsing: false},
};

const TEST_STATUS_META: Record<
  TestStatus,
  {glyph: string; label: string; color: string}
> = {
  passed: {glyph: '✓', label: 'Passed', color: 'var(--color-success)'},
  failed: {glyph: '✗', label: 'Failed', color: 'var(--color-error)'},
  error: {glyph: '⚠', label: 'Errored', color: 'var(--color-warning)'},
  skipped: {glyph: '⊘', label: 'Skipped', color: 'var(--color-text-secondary)'},
};

// 30 days of [passed, failed] runs per day. Three fixed shapes shared
// across PRs: steady green, a recovery arc, and a flaky oscillation.
type TrendDay = readonly [number, number];

const TRENDS: Record<TrendKey, ReadonlyArray<TrendDay>> = {
  steady: [
    [12, 0], [14, 1], [13, 0], [15, 0], [12, 0], [16, 2], [14, 0], [13, 0],
    [15, 1], [14, 0], [12, 0], [15, 0], [16, 0], [13, 1], [14, 0], [15, 0],
    [12, 0], [14, 0], [16, 1], [15, 0], [13, 0], [14, 0], [15, 2], [16, 0],
    [14, 0], [13, 0], [15, 0], [14, 1], [16, 0], [15, 0],
  ],
  recovering: [
    [6, 8], [7, 7], [8, 6], [9, 6], [8, 5], [10, 4], [9, 4], [11, 3],
    [10, 3], [12, 2], [11, 2], [12, 3], [13, 2], [12, 1], [13, 2], [14, 1],
    [13, 1], [14, 2], [15, 1], [14, 0], [15, 1], [14, 0], [16, 1], [15, 0],
    [14, 1], [16, 0], [15, 0], [16, 1], [15, 0], [16, 0],
  ],
  flaky: [
    [10, 4], [12, 1], [9, 6], [13, 0], [8, 7], [12, 2], [10, 5], [13, 1],
    [9, 6], [12, 0], [11, 4], [13, 1], [8, 8], [12, 2], [10, 5], [14, 0],
    [9, 7], [12, 1], [11, 4], [13, 2], [10, 6], [12, 0], [9, 7], [13, 1],
    [11, 3], [12, 5], [10, 2], [13, 6], [11, 1], [12, 4],
  ],
};

// Jun 14 → Jul 13, 2026 — fixed 30-day window matching the trend arrays.
const TREND_DAY_LABELS: string[] = [
  ...Array.from({length: 17}, (_, i) => \`Jun \${14 + i}\`),
  ...Array.from({length: 13}, (_, i) => \`Jul \${1 + i}\`),
];

const REPO_OPTIONS = [
  {value: 'atlas/api', label: 'atlas/api · 6 open'},
  {value: 'atlas/web', label: 'atlas/web · 4 open'},
];

const PULL_REQUESTS: Record<string, PullRequest[]> = {
  'atlas/api': [
    {
      id: 'pr-482',
      number: 482,
      title: 'Fix sandbox cold start retries',
      author: 'mchen',
      authorName: 'Maya Chen',
      sha: 'a1b2c3d',
      status: 'verified',
      trend: 'steady',
      tests: [
        {id: 't-482-1', name: 'api/sandbox/coldstart.test.ts › boots warm pool on demand', status: 'passed', duration: '1.2s'},
        {id: 't-482-2', name: 'api/sandbox/coldstart.test.ts › retries boot with backoff', status: 'passed', duration: '2.4s'},
        {id: 't-482-3', name: 'api/sandbox/coldstart.test.ts › caps retries at three', status: 'passed', duration: '0.8s'},
        {id: 't-482-4', name: 'api/sandbox/pool.test.ts › recycles idle sandboxes', status: 'passed', duration: '1.9s'},
        {id: 't-482-5', name: 'api/sandbox/pool.test.ts › evicts after ttl', status: 'passed', duration: '0.6s'},
        {id: 't-482-6', name: 'api/sessions/resume.test.ts › resumes after cold start', status: 'passed', duration: '3.1s'},
        {id: 't-482-7', name: 'api/sessions/resume.test.ts › keeps context across restart', status: 'passed', duration: '2.7s'},
        {id: 't-482-8', name: 'api/health/probe.test.ts › reports pool depth', status: 'passed', duration: '0.3s'},
      ],
    },
    {
      id: 'pr-479',
      number: 479,
      title: 'Add rate-limit headers to session API',
      author: 'priyak',
      authorName: 'Priya Kumar',
      sha: 'f7e2d19',
      status: 'pending',
      runningCount: 6,
      trend: 'recovering',
      tests: [
        {id: 't-479-1', name: 'api/http/ratelimit.test.ts › sets x-ratelimit-limit', status: 'passed', duration: '0.4s'},
        {id: 't-479-2', name: 'api/http/ratelimit.test.ts › sets retry-after on 429', status: 'passed', duration: '0.5s'},
        {id: 't-479-3', name: 'api/http/ratelimit.test.ts › resets window per token', status: 'passed', duration: '1.1s'},
        {id: 't-479-4', name: 'api/middleware/headers.test.ts › preserves cors headers', status: 'passed', duration: '0.7s'},
        {id: 't-479-5', name: 'api/middleware/headers.test.ts › orders middleware chain', status: 'passed', duration: '0.9s'},
      ],
    },
    {
      id: 'pr-477',
      number: 477,
      title: 'Migrate token store to keyed cache',
      author: 'dromero',
      authorName: 'Diego Romero',
      sha: '9c41b7e',
      status: 'failed',
      trend: 'flaky',
      tests: [
        {id: 't-477-1', name: 'api/tokens/cache.test.ts › reads through on miss', status: 'passed', duration: '0.6s'},
        {
          id: 't-477-2',
          name: 'api/tokens/cache.test.ts › invalidates on rotation',
          status: 'failed',
          duration: '4.8s',
          defaultOpen: true,
          errorOutput: \`FAIL api/tokens/cache.test.ts › invalidates on rotation

Expected cache.get('tok_9f2') to be undefined after rotate()
Received: { token: 'tok_9f2', expiresAt: '2026-07-13T10:15:00Z' }

  at Object.<anonymous> (api/tokens/cache.test.ts:74:29)\`,
        },
        {
          id: 't-477-3',
          name: 'api/tokens/cache.test.ts › expires stale entries',
          status: 'error',
          duration: '0.2s',
          errorOutput: \`ERROR api/tokens/cache.test.ts › expires stale entries

TypeError: clock.advance is not a function
  at Object.<anonymous> (api/tokens/cache.test.ts:98:13)

Suite aborted before assertions ran.\`,
        },
        {id: 't-477-4', name: 'api/tokens/store.test.ts › persists across restart', status: 'passed', duration: '1.4s'},
        {id: 't-477-5', name: 'api/tokens/store.test.ts › encrypts at rest', status: 'passed', duration: '2.2s'},
        {id: 't-477-6', name: 'api/tokens/store.test.ts › migrates legacy rows', status: 'passed', duration: '3.6s'},
        {id: 't-477-7', name: 'api/tokens/metrics.test.ts › counts cache hit ratio', status: 'passed', duration: '0.5s'},
        {id: 't-477-8', name: 'api/tokens/metrics.test.ts › samples p99 lookup latency', status: 'passed', duration: '0.8s'},
        {id: 't-477-9', name: 'api/tokens/bench.test.ts › sustains 5k lookups/sec', status: 'skipped', duration: '—'},
      ],
    },
    {
      id: 'pr-474',
      number: 474,
      title: 'Bump runtime image to Node 22',
      author: 'sokafor',
      authorName: 'Sade Okafor',
      sha: '2d8ff41',
      status: 'no-tests',
      trend: 'recovering',
      tests: [],
    },
    {
      id: 'pr-471',
      number: 471,
      title: 'Retry webhook dispatch with jitter',
      author: 'mchen',
      authorName: 'Maya Chen',
      sha: 'e5a09c2',
      status: 'verified',
      trend: 'steady',
      tests: [
        {id: 't-471-1', name: 'api/webhooks/dispatch.test.ts › retries with jitter window', status: 'passed', duration: '1.8s'},
        {id: 't-471-2', name: 'api/webhooks/dispatch.test.ts › gives up after five attempts', status: 'passed', duration: '2.9s'},
        {id: 't-471-3', name: 'api/webhooks/dispatch.test.ts › records delivery latency', status: 'passed', duration: '0.7s'},
        {id: 't-471-4', name: 'api/webhooks/sign.test.ts › signs payload with rotating key', status: 'passed', duration: '0.4s'},
        {id: 't-471-5', name: 'api/webhooks/sign.test.ts › rejects stale signatures', status: 'passed', duration: '0.3s'},
        {id: 't-471-6', name: 'api/queue/backoff.test.ts › doubles delay per attempt', status: 'passed', duration: '0.5s'},
        {id: 't-471-7', name: 'api/queue/backoff.test.ts › caps delay at 60s', status: 'passed', duration: '0.4s'},
      ],
    },
    {
      id: 'pr-468',
      number: 468,
      title: 'Split billing worker queues',
      author: 'tnguyen',
      authorName: 'Trang Nguyen',
      sha: '77b31aa',
      status: 'failed',
      trend: 'flaky',
      tests: [
        {id: 't-468-1', name: 'api/billing/queues.test.ts › routes invoices to slow lane', status: 'passed', duration: '1.1s'},
        {id: 't-468-2', name: 'api/billing/queues.test.ts › keeps fifo within a lane', status: 'passed', duration: '1.6s'},
        {id: 't-468-3', name: 'api/billing/queues.test.ts › drains on shutdown', status: 'passed', duration: '2.3s'},
        {
          id: 't-468-4',
          name: 'api/billing/replay.test.ts › replays dead-lettered jobs once',
          status: 'failed',
          duration: '6.2s',
          defaultOpen: true,
          errorOutput: \`FAIL api/billing/replay.test.ts › replays dead-lettered jobs once

Expected job bil_4471 to be replayed exactly 1 time
Received: 2 replays (duplicate consumer on split queue)

  at expectReplayCount (api/billing/replay.test.ts:112:5)\`,
        },
        {id: 't-468-5', name: 'api/billing/ledger.test.ts › balances after split', status: 'passed', duration: '0.9s'},
        {id: 't-468-6', name: 'api/billing/ledger.test.ts › rejects double postings', status: 'passed', duration: '0.6s'},
      ],
    },
  ],
  'atlas/web': [
    {
      id: 'pr-291',
      number: 291,
      title: 'Stream markdown in tool output',
      author: 'jpark',
      authorName: 'June Park',
      sha: 'c19e04b',
      status: 'verified',
      trend: 'steady',
      tests: [
        {id: 't-291-1', name: 'web/render/markdown-stream.test.tsx › renders partial fences', status: 'passed', duration: '0.9s'},
        {id: 't-291-2', name: 'web/render/markdown-stream.test.tsx › closes dangling emphasis', status: 'passed', duration: '0.6s'},
        {id: 't-291-3', name: 'web/render/markdown-stream.test.tsx › batches DOM writes', status: 'passed', duration: '1.4s'},
        {id: 't-291-4', name: 'web/render/code-fence.test.tsx › highlights streamed tokens', status: 'passed', duration: '1.1s'},
        {id: 't-291-5', name: 'web/render/code-fence.test.tsx › preserves scroll position', status: 'passed', duration: '0.8s'},
        {id: 't-291-6', name: 'web/render/table.test.tsx › fills missing cells while streaming', status: 'passed', duration: '0.7s'},
      ],
    },
    {
      id: 'pr-288',
      number: 288,
      title: 'Virtualize the session sidebar',
      author: 'lfontaine',
      authorName: 'Lucas Fontaine',
      sha: '48d2c9f',
      status: 'pending',
      runningCount: 5,
      trend: 'recovering',
      tests: [
        {id: 't-288-1', name: 'web/sidebar/virtual-list.test.tsx › renders visible window only', status: 'passed', duration: '1.3s'},
        {id: 't-288-2', name: 'web/sidebar/virtual-list.test.tsx › keeps focus while scrolling', status: 'passed', duration: '1.7s'},
        {id: 't-288-3', name: 'web/sidebar/virtual-list.test.tsx › restores scroll on remount', status: 'passed', duration: '0.9s'},
        {id: 't-288-4', name: 'web/sidebar/groups.test.tsx › pins expanded groups', status: 'passed', duration: '0.5s'},
      ],
    },
    {
      id: 'pr-286',
      number: 286,
      title: 'Dark theme for the diff viewer',
      author: 'jpark',
      authorName: 'June Park',
      sha: 'b7710de',
      status: 'failed',
      trend: 'flaky',
      tests: [
        {id: 't-286-1', name: 'web/diff/theme.test.tsx › maps gutter tokens per scheme', status: 'passed', duration: '0.6s'},
        {id: 't-286-2', name: 'web/diff/theme.test.tsx › swaps schemes without reflow', status: 'passed', duration: '1.2s'},
        {
          id: 't-286-3',
          name: 'web/diff/theme.test.tsx › keeps addition contrast in dark mode',
          status: 'failed',
          duration: '2.1s',
          defaultOpen: true,
          errorOutput: \`FAIL web/diff/theme.test.tsx › keeps addition contrast in dark mode

Expected contrast ratio >= 4.5 for added-line text
Received 3.9 against the dark diff surface

  at assertContrast (web/diff/theme.test.tsx:41:9)\`,
        },
        {id: 't-286-4', name: 'web/diff/hunks.test.tsx › folds unchanged regions', status: 'passed', duration: '0.8s'},
        {id: 't-286-5', name: 'web/diff/hunks.test.tsx › expands on gutter click', status: 'passed', duration: '0.7s'},
        {id: 't-286-6', name: 'web/diff/snapshot.test.tsx › matches dark render snapshot', status: 'skipped', duration: '—'},
      ],
    },
    {
      id: 'pr-283',
      number: 283,
      title: 'Rebuild the icon pipeline',
      author: 'sokafor',
      authorName: 'Sade Okafor',
      sha: '31c9e77',
      status: 'no-tests',
      trend: 'recovering',
      tests: [],
    },
  ],
};

// ============= HELPERS =============

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

function countByStatus(tests: TestCase[], statuses: TestStatus[]): number {
  return tests.filter(test => statuses.includes(test.status)).length;
}

/** Pass rate over completed (non-skipped) tests, or null when untested. */
function passRate(pr: PullRequest): number | null {
  const passed = countByStatus(pr.tests, ['passed']);
  const failed = countByStatus(pr.tests, ['failed', 'error']);
  const total = passed + failed;
  if (total === 0) {
    return null;
  }
  return (passed / total) * 100;
}

function rateVariant(rate: number): 'success' | 'warning' | 'error' {
  if (rate >= 95) {
    return 'success';
  }
  if (rate >= 80) {
    return 'warning';
  }
  return 'error';
}

function resultCaption(pr: PullRequest): string {
  if (pr.status === 'no-tests') {
    return 'no affected tests';
  }
  const passed = countByStatus(pr.tests, ['passed']);
  const failed = countByStatus(pr.tests, ['failed', 'error']);
  const skipped = countByStatus(pr.tests, ['skipped']);
  const base = \`\${passed} passed / \${failed} failed\`;
  const suffix = skipped > 0 ? \` · \${skipped} skipped\` : '';
  const running =
    pr.status === 'pending' && pr.runningCount != null
      ? \` · \${pr.runningCount} running\`
      : '';
  return base + suffix + running;
}

// ============= VERIFICATION BADGE =============

function VerificationBadge({status}: {status: VerificationStatus}) {
  const meta = STATUS_META[status];
  return (
    <Badge
      variant={meta.badge}
      label={meta.label}
      icon={
        <StatusDot
          variant={meta.dot}
          label={\`Verification \${meta.label.toLowerCase()}\`}
          isPulsing={meta.isPulsing}
        />
      }
    />
  );
}

// ============= PASS RATE BAR =============

function PassRateBar({pr}: {pr: PullRequest}) {
  const rate = passRate(pr);
  if (rate == null) {
    return (
      <HStack gap={2} vAlign="center" style={styles.passRateCell}>
        <div style={styles.rateBar}>
          <ProgressBar
            value={0}
            label={\`Pass rate for #\${pr.number}\`}
            isLabelHidden
            variant="neutral"
            isDisabled
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          —
        </Text>
      </HStack>
    );
  }
  const rounded = Math.round(rate * 10) / 10;
  return (
    <HStack gap={2} vAlign="center" style={styles.passRateCell}>
      <div style={styles.rateBar}>
        <ProgressBar
          value={rounded}
          max={100}
          label={\`Pass rate for #\${pr.number}\`}
          isLabelHidden
          variant={rateVariant(rounded)}
        />
      </div>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {\`\${rounded}%\`}
      </Text>
    </HStack>
  );
}

// ============= TREND CHART =============

const TREND_BAR_WIDTH = 8;
const TREND_BAR_GAP = 2;
const TREND_HEIGHT = 56;
const TREND_TOP_PAD = 4;
const TREND_SEGMENT_GAP = 1.5;

/**
 * 30-day stacked mini bars: passed (success) anchored to the baseline,
 * failed (error) stacked above with a hairline surface gap. Hovering a
 * column drives the readout in the section header — fixed buckets, no
 * floating tooltip needed at this size.
 */
function TrendChart({
  data,
  hoveredIndex,
  onHover,
}: {
  data: ReadonlyArray<TrendDay>;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const width = data.length * (TREND_BAR_WIDTH + TREND_BAR_GAP) - TREND_BAR_GAP;
  const maxTotal = Math.max(...data.map(([passed, failed]) => passed + failed));
  const usable = TREND_HEIGHT - TREND_TOP_PAD;

  const handleMove = (event: ReactMouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const index = Math.floor(x / (TREND_BAR_WIDTH + TREND_BAR_GAP));
    onHover(Math.max(0, Math.min(data.length - 1, index)));
  };

  return (
    <svg
      viewBox={\`0 0 \${width} \${TREND_HEIGHT}\`}
      style={styles.trendSvg}
      height={TREND_HEIGHT}
      role="img"
      aria-label="Daily verification runs over the last 30 days, passed and failed"
      onMouseMove={handleMove}
      onMouseLeave={() => onHover(null)}>
      {data.map(([passed, failed], index) => {
        const x = index * (TREND_BAR_WIDTH + TREND_BAR_GAP);
        const passedHeight = (passed / maxTotal) * usable;
        const failedHeight = (failed / maxTotal) * usable;
        const passedY = TREND_HEIGHT - passedHeight;
        const failedY =
          passedY - (failed > 0 ? TREND_SEGMENT_GAP : 0) - failedHeight;
        return (
          <g key={index}>
            {hoveredIndex === index && (
              <rect
                x={x - 1}
                y={0}
                width={TREND_BAR_WIDTH + 2}
                height={TREND_HEIGHT}
                fill="var(--color-background-muted)"
                rx={2}
              />
            )}
            {passed > 0 && (
              <rect
                x={x}
                y={passedY}
                width={TREND_BAR_WIDTH}
                height={passedHeight}
                fill="var(--color-success)"
                rx={1.5}
              />
            )}
            {failed > 0 && (
              <rect
                x={x}
                y={failedY}
                width={TREND_BAR_WIDTH}
                height={failedHeight}
                fill="var(--color-error)"
                rx={1.5}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TrendSection({trend}: {trend: TrendKey}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const data = TRENDS[trend];
  const readout =
    hovered != null
      ? \`\${TREND_DAY_LABELS[hovered]} · \${data[hovered][0]} passed / \${data[hovered][1]} failed\`
      : \`\${TREND_DAY_LABELS[0]} – \${TREND_DAY_LABELS[TREND_DAY_LABELS.length - 1]}\`;

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <span style={styles.eyebrow}>Daily Trend (30d)</span>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {readout}
        </Text>
      </HStack>
      <TrendChart data={data} hoveredIndex={hovered} onHover={setHovered} />
      <HStack gap={3} vAlign="center">
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendSwatch, backgroundColor: 'var(--color-success)'}}
            aria-hidden
          />
          <Text type="supporting" color="secondary">
            Passed
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendSwatch, backgroundColor: 'var(--color-error)'}}
            aria-hidden
          />
          <Text type="supporting" color="secondary">
            Failed
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
}

// ============= TEST ROWS =============

function TestRowLine({test}: {test: TestCase}) {
  const meta = TEST_STATUS_META[test.status];
  return (
    <HStack gap={2} vAlign="center" style={styles.testRow}>
      <span
        style={{...styles.testGlyph, color: meta.color}}
        role="img"
        aria-label={meta.label}>
        {meta.glyph}
      </span>
      <StackItem size="fill" style={styles.testName}>
        <Text type="code" size="sm" maxLines={1}>
          {test.name}
        </Text>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {test.duration}
      </Text>
    </HStack>
  );
}

function TestRow({test}: {test: TestCase}) {
  if (test.errorOutput == null) {
    return <TestRowLine test={test} />;
  }
  return (
    <Collapsible
      defaultIsOpen={test.defaultOpen === true}
      trigger={<TestRowLine test={test} />}>
      <CodeBlock
        code={test.errorOutput}
        language="text"
        size="sm"
        width="100%"
        hasCopyButton={false}
      />
    </Collapsible>
  );
}

// ============= DETAIL PANEL =============

function DetailPanel({pr}: {pr: PullRequest}) {
  const completed = pr.tests.length;
  return (
    // Keyed by PR id upstream so Collapsible state resets per selection.
    <VStack gap={4} style={styles.detailStack}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>{\`#\${pr.number} \${pr.title}\`}</Heading>
          </StackItem>
          <VerificationBadge status={pr.status} />
        </HStack>
        <HStack gap={2} vAlign="center">
          <Avatar name={pr.authorName} size={20} />
          <Text type="supporting" color="secondary">
            by {pr.author} ·{' '}
          </Text>
          <Text type="code" size="sm" color="secondary">
            {pr.sha}
          </Text>
        </HStack>
      </VStack>

      <PassRateBar pr={pr} />

      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <span style={styles.eyebrow}>
              {pr.status === 'no-tests' ? 'Tests' : \`Tests (\${completed})\`}
            </span>
          </StackItem>
          {pr.status === 'pending' && pr.runningCount != null && (
            <HStack gap={1} vAlign="center">
              <Spinner size="sm" aria-label="Tests running" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {pr.runningCount} running
              </Text>
            </HStack>
          )}
        </HStack>
        {pr.tests.length === 0 ? (
          <EmptyState
            isCompact
            title="No test suites detected"
            description="Verification found no tests affected by this change. Merge requires a manual reviewer sign-off."
          />
        ) : (
          <VStack gap={0}>
            {pr.tests.map((test, index) => (
              <VStack key={test.id} gap={0}>
                <TestRow test={test} />
                {index < pr.tests.length - 1 && <Divider />}
              </VStack>
            ))}
          </VStack>
        )}
      </VStack>

      <Divider />

      <TrendSection trend={pr.trend} />
    </VStack>
  );
}

// ============= SUMMARY CHIPS =============

function SummaryChips({prs}: {prs: PullRequest[]}) {
  const order: VerificationStatus[] = ['verified', 'pending', 'failed', 'no-tests'];
  return (
    <HStack gap={1} vAlign="center" style={styles.chipWrap}>
      {order.map(status => {
        const count = prs.filter(pr => pr.status === status).length;
        if (count === 0) {
          return null;
        }
        const meta = STATUS_META[status];
        return (
          <Badge
            key={status}
            variant={meta.badge}
            label={\`\${count} \${meta.label.toLowerCase()}\`}
            icon={
              <StatusDot
                variant={meta.dot}
                label={\`\${count} \${meta.label.toLowerCase()}\`}
                isPulsing={meta.isPulsing}
              />
            }
          />
        );
      })}
    </HStack>
  );
}

// ============= PR CARD =============

function PullRequestCard({
  pr,
  isSelected,
  onSelect,
}: {
  pr: PullRequest;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <SelectableCard
      label={\`Select pull request #\${pr.number}: \${pr.title}\`}
      isSelected={isSelected}
      onChange={onSelect}
      padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={pr.authorName} size={24} />
          <StackItem size="fill" style={styles.cardTitleCell}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {\`#\${pr.number} \${pr.title}\`}
              </Text>
              <HStack gap={1} vAlign="center">
                <Text type="supporting" color="secondary">
                  by {pr.author} ·
                </Text>
                <Text type="code" size="sm" color="secondary">
                  {pr.sha}
                </Text>
              </HStack>
            </VStack>
          </StackItem>
          <VerificationBadge status={pr.status} />
        </HStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.passRateCell}>
            <PassRateBar pr={pr} />
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {resultCaption(pr)}
          </Text>
        </HStack>
      </VStack>
    </SelectableCard>
  );
}

// ============= PAGE =============

export default function PrVerificationDashboardTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 900;

  const [repo, setRepo] = useState('atlas/api');
  const [selectedId, setSelectedId] = useState('pr-482');

  const prs = PULL_REQUESTS[repo] ?? [];
  const selectedPr = prs.find(pr => pr.id === selectedId) ?? prs[0];

  const changeRepo = (value: string) => {
    setRepo(value);
    const first = PULL_REQUESTS[value]?.[0];
    if (first != null) {
      setSelectedId(first.id);
    }
  };

  const listBody = (
    <VStack gap={4} style={styles.listColumn}>
      {isCompact && <SummaryChips prs={prs} />}
      <VStack gap={2}>
        {prs.map(pr => (
          <PullRequestCard
            key={pr.id}
            pr={pr}
            isSelected={selectedPr != null && pr.id === selectedPr.id}
            onSelect={() => setSelectedId(pr.id)}
          />
        ))}
      </VStack>

      {isCompact && selectedPr != null && (
        <>
          <Divider />
          <DetailPanel key={selectedPr.id} pr={selectedPr} />
        </>
      )}

      <Divider />

      {/* Empty-state specimen: what the queue looks like once everything
          is merged. */}
      <VStack gap={2}>
        <span style={styles.eyebrow}>Empty state</span>
        <div style={styles.specimenPanel}>
          <EmptyState
            icon={<Icon icon={GitPullRequestIcon} size="lg" color="secondary" />}
            title="No open pull requests"
            description="Verified merges clear out of this queue automatically. New PRs appear as soon as verification picks them up."
            actions={
              <Button label="View merged PRs" variant="ghost" size="sm" onClick={() => {}} />
            }
          />
        </div>
      </VStack>
    </VStack>
  );

  return (
    <div ref={wrapRef} style={styles.pageWrap}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>PR verification</Heading>
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      {PRODUCT_NAME}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {!isCompact && <SummaryChips prs={prs} />}
              <Selector
                label="Repository"
                isLabelHidden
                size="sm"
                options={REPO_OPTIONS}
                value={repo}
                onChange={changeRepo}
              />
            </HStack>
          </LayoutHeader>
        }
        content={<LayoutContent>{listBody}</LayoutContent>}
        end={
          !isCompact && selectedPr != null ? (
            <LayoutPanel
              hasDivider
              width={420}
              role="complementary"
              label="Pull request verification detail">
              <DetailPanel key={selectedPr.id} pr={selectedPr} />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};