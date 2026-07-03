var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one vitest-style run over checkout-api
 *   — 5 test files, 10 describe blocks, 24 tests with fixed millisecond
 *   durations; the cart-totals suite is mid-run with one spinner test and
 *   two queued behind it; two failures carry full fixtures: an assertion
 *   message, an expected/received object diff, and a parsed stack whose
 *   frames are flagged app vs vendor; a fixed re-run resolution table says
 *   the rounding failure passes on retry while the decline failure repeats)
 * @output Test RUNNER console: a header with flask icon + Heading, run meta,
 *   colored passed/failed/skipped count clusters plus a mono wall-time
 *   readout, a watch-mode Switch with pulsing StatusDot, and a primary
 *   "Re-run failed (N)" Button that spins the failed tests back through a
 *   scripted resolver; a 280px suite-tree rail whose file and describe rows
 *   carry a status icon (check / X / spinner / dashed circle) and mono
 *   pass/fail/skip count clusters and filter the stream on click; a
 *   filter TabList (All / Failed / Slowest) over a bordered run-stream
 *   panel of per-test rows — status icon, describe › name, mono duration,
 *   a Spinner row on the running suite, dimmed queued rows, and duration
 *   bars on the Slowest tab; and a 360px failure-detail panel showing the
 *   selected failure's message block, − expected / + received diff rows,
 *   and a monospace stack trace with accent-tinted app paths and dimmed
 *   vendor frames, plus Re-run test / Copy stack / Open in editor actions
 * @position Page template; emitted by \`astryx template test-runner-console\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the run chrome (title,
 * meta, count clusters, watch Switch, Re-run failed). LayoutPanel start 280
 * hosts the suite tree: a pinned rail header with the run totals, then the
 * scrolling file/describe rows. LayoutContent (padding 4) stacks the filter
 * TabList, the bordered run-stream panel, and a watch-mode footer line.
 * LayoutPanel end 360 is the failure detail (EmptyState when nothing failed
 * is selected). Choose over code-review-diff-queue when the subject is a
 * TEST RUN — suites, assertions, stack traces — not reviewing file diffs;
 * over logs-explorer when rows are per-test verdicts with a failure
 * drill-in, not a flat log tail.
 *
 * Responsive contract:
 * - >1024px: header | tree 280 (fixed, scrolls) | stream (fill) | detail
 *   360. Stream rows fit without horizontal scrolling; only the failure
 *   panel's diff and stack blocks own overflow-x (white-space: pre).
 * - <=1024px: the failure-detail panel leaves the end slot; tapping a
 *   failed row opens the same detail as a fullscreen Dialog, so failure
 *   triage stays one tap away in a single pane.
 * - <=640px: the suite-tree rail leaves the start slot; a single-pane
 *   fallback row above the tabs carries a suite Selector (with pass/fail
 *   counts in the option labels), so suite filtering survives without the
 *   rail. The header meta line hides, count clusters condense to dot +
 *   bare count so all three plus the timer fit at 375px, the header wraps
 *   onto a second row, and the Re-run failed Button and stream rows grow
 *   to >=40px tap targets.
 * - Nothing is hover-only: status icons, counts, and selection are painted
 *   inline (Tooltips only restate them); failed rows are real buttons with
 *   aria-current, and the tree rows are >=40px buttons at every width.
 *
 * Container policy (test-console archetype): dense tool chrome — frame-first
 * rows and panels, bordered divs for the stream panel and the diff/stack
 * blocks, no Cards. All counts (header clusters, tree clusters, tab badges)
 * recompute live from test state, so the scripted re-run repaints every
 * region. Fixture policy: fixed data only — no clocks, randomness, or
 * network assets; the re-run resolver replays a fixed outcome table and only
 * its 900ms cadence is runtime, mirroring the logs-explorer live-tail rule.
 */

import {useEffect, useMemo, useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  CircleDashedIcon,
  CopyIcon,
  FileCode2Icon,
  FlaskConicalIcon,
  ListTreeIcon,
  MinusIcon,
  RotateCcwIcon,
  SquarePenIcon,
  TimerIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

// Monospace metrics come from the same tokens Code/CodeBlock use, so
// durations, diffs, and stack frames read as one surface.
const mono: CSSProperties = {
  fontFamily: 'var(--font-family-code)',
  fontSize: 'var(--text-code-size)',
  lineHeight: 'var(--text-code-leading)',
};

const styles: Record<string, CSSProperties> = {
  headerRow: {
    width: '100%',
  },
  // <=640px: grow the sm header controls to 40px tap targets; type keeps
  // its size, the hit area just grows.
  buttonTapTarget: {height: 40},
  // Suite-tree rail: pinned totals header, scrolling tree below.
  railFrame: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  railHeader: {
    padding: 'var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  railScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2)',
  },
  // Tree rows are real buttons with >=40px tap targets; the active row
  // wears the accent-muted surface so selection never depends on hover.
  treeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: '0 var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-control)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
  },
  treeRowActive: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Describe rows indent one step under their file row.
  treeRowDescribe: {
    paddingLeft: 'var(--spacing-6)',
  },
  treeName: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Fixed 20px slot so status icons align down the tree and the stream.
  iconSlot: {
    width: 20,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCluster: {
    ...mono,
    flexShrink: 0,
    display: 'inline-flex',
    gap: 'var(--spacing-1)',
  },
  countPass: {color: 'var(--color-success)'},
  countFail: {color: 'var(--color-error)'},
  countSkip: {color: 'var(--color-text-secondary)'},
  // Run-stream panel: bordered container, not a Card — dense tool chrome.
  panel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  streamHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  streamRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 36,
    padding: '0 var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Failed rows are buttons; reset button chrome and keep the row shape.
  streamRowButton: {
    border: 'none',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
  },
  streamRowSelected: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  streamRowCompact: {minHeight: 44},
  rowQueued: {opacity: 0.55},
  testNameCell: {
    flex: 1,
    minWidth: 0,
  },
  durationCell: {
    ...mono,
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
    textAlign: 'right',
    minWidth: 52,
  },
  // Slowest tab: fixed 72px track, fill width = duration / slowest max.
  durationTrack: {
    width: 72,
    height: 4,
    borderRadius: 2,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  durationFill: {
    height: '100%',
    backgroundColor: 'var(--color-accent)',
  },
  footerStrip: {paddingTop: 'var(--spacing-2)'},
  // Failure detail blocks.
  detailScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  messageBlock: {
    ...mono,
    border: 'var(--border-width) solid var(--color-error)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-error-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  diffBlock: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  diffScroll: {overflowX: 'auto'},
  diffRow: {
    ...mono,
    display: 'flex',
    whiteSpace: 'pre',
  },
  diffSign: {
    width: 20,
    flexShrink: 0,
    textAlign: 'center',
    userSelect: 'none',
  },
  diffText: {padding: '0 var(--spacing-2)'},
  rowExpected: {backgroundColor: 'var(--color-success-muted)'},
  rowReceived: {backgroundColor: 'var(--color-error-muted)'},
  signExpected: {color: 'var(--color-success)'},
  signReceived: {color: 'var(--color-error)'},
  stackBlock: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    overflowX: 'auto',
  },
  stackLine: {
    ...mono,
    whiteSpace: 'pre',
  },
  // Path styling: app-code paths carry the accent color so the eye lands
  // on actionable frames; vendor frames dim as a whole line.
  stackPath: {color: 'var(--color-accent)'},
  stackVendor: {opacity: 0.6},
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed durations in milliseconds, no clocks or
// randomness. The mid-run suite keeps its spinner row statically; the
// re-run resolver replays the fixed RERUN_RESOLUTIONS table below.

const RUN_META = {
  project: 'checkout-api',
  runner: 'vitest 3.2',
  node: 'node 22.12',
  watchedFiles: 128,
};

type TestStatus = 'pass' | 'fail' | 'skip' | 'running' | 'queued';

interface StackFrame {
  /** Function name; omitted for anonymous test-file frames. */
  fn?: string;
  path: string;
  line: number;
  col: number;
  /** App frames get accent path styling; vendor frames dim. */
  isAppFrame: boolean;
}

type DiffLineKind = 'context' | 'expected' | 'received';

interface FailureDiffLine {
  kind: DiffLineKind;
  text: string;
}

interface TestFailure {
  message: string;
  diff: FailureDiffLine[];
  stack: StackFrame[];
}

interface TestCase {
  id: string;
  suiteId: string;
  describe: string;
  name: string;
  status: TestStatus;
  /** Fixed duration; null while running or queued. */
  durationMs: number | null;
  failure?: TestFailure;
}

interface SuiteFixture {
  id: string;
  file: string;
}

const SUITES: SuiteFixture[] = [
  {id: 's-totals', file: 'tests/cart/cart-totals.test.ts'},
  {id: 's-discounts', file: 'tests/cart/discounts.test.ts'},
  {id: 's-tax', file: 'tests/tax/tax-rates.test.ts'},
  {id: 's-payment', file: 'tests/checkout/payment-intent.test.ts'},
  {id: 's-receipt', file: 'tests/checkout/receipt-email.test.ts'},
];

// Failure 1: a cent-rounding assertion out of the discounts suite. The
// diff is the vitest object diff shape: − expected rows, + received rows.
const ROUNDING_FAILURE: TestFailure = {
  message:
    'AssertionError: expected cart totals to deeply equal the rounded ' +
    'fixture — discount off by one cent',
  diff: [
    {kind: 'context', text: '{'},
    {kind: 'context', text: '  "currency": "USD",'},
    {kind: 'context', text: '  "subtotal": 9982,'},
    {kind: 'expected', text: '  "discount": 1497,'},
    {kind: 'received', text: '  "discount": 1498,'},
    {kind: 'expected', text: '  "total": 8485,'},
    {kind: 'received', text: '  "total": 8484,'},
    {kind: 'context', text: '}'},
  ],
  stack: [
    {
      fn: 'applyPercentageCoupon',
      path: 'src/cart/discounts.ts',
      line: 48,
      col: 11,
      isAppFrame: true,
    },
    {
      fn: 'computeCartTotals',
      path: 'src/cart/totals.ts',
      line: 92,
      col: 18,
      isAppFrame: true,
    },
    {
      path: 'tests/cart/discounts.test.ts',
      line: 57,
      col: 29,
      isAppFrame: true,
    },
    {
      fn: 'runTest',
      path: 'node_modules/vitest/dist/runner.js',
      line: 781,
      col: 15,
      isAppFrame: false,
    },
    {
      fn: 'processTicksAndRejections',
      path: 'node:internal/process/task_queues',
      line: 105,
      col: 5,
      isAppFrame: false,
    },
  ],
};

// Failure 2: the payment-intent decline test — the intent never leaves
// 'processing', so the decline reason is missing. Repeats on re-run.
const DECLINE_FAILURE: TestFailure = {
  message:
    "AssertionError: expected intent.status to be 'requires_payment_method' " +
    "— the decline webhook was never applied",
  diff: [
    {kind: 'context', text: '{'},
    {kind: 'context', text: '  "id": "pi_3PxT2v",'},
    {kind: 'expected', text: '  "status": "requires_payment_method",'},
    {kind: 'received', text: '  "status": "processing",'},
    {kind: 'expected', text: '  "declineReason": "card_declined",'},
    {kind: 'received', text: '  "declineReason": undefined,'},
    {kind: 'context', text: '}'},
  ],
  stack: [
    {
      fn: 'assertDeclined',
      path: 'tests/helpers/payments.ts',
      line: 33,
      col: 9,
      isAppFrame: true,
    },
    {
      path: 'tests/checkout/payment-intent.test.ts',
      line: 88,
      col: 5,
      isAppFrame: true,
    },
    {
      fn: 'confirmIntent',
      path: 'src/checkout/payment-intent.ts',
      line: 141,
      col: 22,
      isAppFrame: true,
    },
    {
      fn: 'runWithTimeout',
      path: 'node_modules/vitest/dist/runner.js',
      line: 815,
      col: 11,
      isAppFrame: false,
    },
  ],
};

// 24 tests in fixture (stream) order. The cart-totals suite is mid-run:
// one spinner row, two queued behind it — the "live-feel" of the stream.
const INITIAL_TESTS: TestCase[] = [
  {
    id: 't-sum-cents',
    suiteId: 's-totals',
    describe: 'computeCartTotals',
    name: 'sums line items in cents',
    status: 'pass',
    durationMs: 12,
  },
  {
    id: 't-sum-qty',
    suiteId: 's-totals',
    describe: 'computeCartTotals',
    name: 'applies quantity multipliers',
    status: 'pass',
    durationMs: 9,
  },
  {
    id: 't-sum-zero',
    suiteId: 's-totals',
    describe: 'computeCartTotals',
    name: 'ignores zero-quantity lines',
    status: 'pass',
    durationMs: 7,
  },
  {
    id: 't-round-mixed',
    suiteId: 's-totals',
    describe: 'currency rounding',
    name: 'rounds mixed-currency carts per line',
    status: 'running',
    durationMs: null,
  },
  {
    id: 't-round-remainder',
    suiteId: 's-totals',
    describe: 'currency rounding',
    name: 'carries sub-cent remainders to the last line',
    status: 'queued',
    durationMs: null,
  },
  {
    id: 't-round-intl',
    suiteId: 's-totals',
    describe: 'currency rounding',
    name: 'formats totals with Intl.NumberFormat',
    status: 'queued',
    durationMs: null,
  },
  {
    id: 't-disc-eligible',
    suiteId: 's-discounts',
    describe: 'percentage coupons',
    name: 'applies 15% off eligible subtotals',
    status: 'pass',
    durationMs: 11,
  },
  {
    id: 't-disc-round',
    suiteId: 's-discounts',
    describe: 'percentage coupons',
    name: 'rounds 15% off to the nearest cent',
    status: 'fail',
    durationMs: 24,
    failure: ROUNDING_FAILURE,
  },
  {
    id: 't-disc-member',
    suiteId: 's-discounts',
    describe: 'percentage coupons',
    name: 'stacks with member pricing',
    status: 'skip',
    durationMs: 0,
  },
  {
    id: 't-ship-threshold',
    suiteId: 's-discounts',
    describe: 'free shipping',
    name: 'kicks in at the 5000-cent threshold',
    status: 'pass',
    durationMs: 8,
  },
  {
    id: 't-ship-oversize',
    suiteId: 's-discounts',
    describe: 'free shipping',
    name: 'excludes oversized items',
    status: 'pass',
    durationMs: 13,
  },
  {
    id: 't-tax-zip',
    suiteId: 's-tax',
    describe: 'lookupTaxRate',
    name: 'resolves US zip codes to state rates',
    status: 'pass',
    durationMs: 41,
  },
  {
    id: 't-tax-fallback',
    suiteId: 's-tax',
    describe: 'lookupTaxRate',
    name: 'falls back to country rate for unknown zips',
    status: 'pass',
    durationMs: 17,
  },
  {
    id: 't-tax-cache',
    suiteId: 's-tax',
    describe: 'lookupTaxRate',
    name: 'caches repeated lookups',
    status: 'pass',
    durationMs: 6,
  },
  {
    id: 't-vat-reverse',
    suiteId: 's-tax',
    describe: 'VAT handling',
    name: 'applies reverse charge for EU B2B',
    status: 'pass',
    durationMs: 22,
  },
  {
    id: 't-vat-gb',
    suiteId: 's-tax',
    describe: 'VAT handling',
    name: 'treats GB as non-EU post-2021',
    status: 'pass',
    durationMs: 19,
  },
  {
    id: 't-pay-create',
    suiteId: 's-payment',
    describe: 'createPaymentIntent',
    name: 'creates an intent for a valid cart',
    status: 'pass',
    durationMs: 132,
  },
  {
    id: 't-pay-idempotent',
    suiteId: 's-payment',
    describe: 'createPaymentIntent',
    name: 'attaches idempotency keys per checkout',
    status: 'pass',
    durationMs: 88,
  },
  {
    id: 't-pay-decline',
    suiteId: 's-payment',
    describe: 'declined cards',
    name: 'surfaces the decline reason to the caller',
    status: 'fail',
    durationMs: 154,
    failure: DECLINE_FAILURE,
  },
  {
    id: 't-pay-retry',
    suiteId: 's-payment',
    describe: 'declined cards',
    name: 'retries soft declines once',
    status: 'skip',
    durationMs: 0,
  },
  {
    id: 't-receipt-lines',
    suiteId: 's-receipt',
    describe: 'renderReceipt',
    name: 'renders line items in order',
    status: 'pass',
    durationMs: 28,
  },
  {
    id: 't-receipt-tax',
    suiteId: 's-receipt',
    describe: 'renderReceipt',
    name: 'includes tax breakdown rows',
    status: 'pass',
    durationMs: 31,
  },
  {
    id: 't-send-sandbox',
    suiteId: 's-receipt',
    describe: 'sendReceipt',
    name: 'skips sending in sandbox mode',
    status: 'skip',
    durationMs: 0,
  },
  {
    id: 't-send-dedupe',
    suiteId: 's-receipt',
    describe: 'sendReceipt',
    name: 'queues the email with a stable dedupe key',
    status: 'pass',
    durationMs: 44,
  },
];

/**
 * Fixed re-run outcome table — the "scripted resolver". The rounding
 * failure is a flake and passes on retry; the decline failure is a real
 * bug and repeats with the same failure fixture. Only the 900ms cadence
 * between resolutions is runtime.
 */
const RERUN_RESOLUTIONS: Record<
  string,
  {status: 'pass' | 'fail'; durationMs: number}
> = {
  't-disc-round': {status: 'pass', durationMs: 21},
  't-pay-decline': {status: 'fail', durationMs: 149},
};

const INITIAL_SELECTED_TEST = 't-pay-decline';

const FILTER_TABS = ['all', 'failed', 'slowest'] as const;
type FilterTab = (typeof FILTER_TABS)[number];
const SLOWEST_LIMIT = 8;

// ============= HELPERS =============

const suiteBasename = (file: string) => file.slice(file.lastIndexOf('/') + 1);

function formatMs(ms: number): string {
  return ms >= 1000 ? \`\${(ms / 1000).toFixed(1)}s\` : \`\${ms}ms\`;
}

interface NodeCounts {
  pass: number;
  fail: number;
  skip: number;
  running: number;
  queued: number;
}

function countTests(tests: TestCase[]): NodeCounts {
  const counts: NodeCounts = {pass: 0, fail: 0, skip: 0, running: 0, queued: 0};
  for (const test of tests) {
    counts[test.status] += 1;
  }
  return counts;
}

/** Aggregate status icon for a tree node, worst-first. */
function nodeStatus(counts: NodeCounts): TestStatus {
  if (counts.running > 0) return 'running';
  if (counts.fail > 0) return 'fail';
  if (counts.queued > 0) return 'queued';
  if (counts.pass > 0) return 'pass';
  return 'skip';
}

const STATUS_WORD: Record<TestStatus, string> = {
  pass: 'Passed',
  fail: 'Failed',
  skip: 'Skipped',
  running: 'Running',
  queued: 'Queued',
};

/** Status icon in a fixed 20px slot so columns align everywhere. */
function StatusIcon({status, label}: {status: TestStatus; label: string}) {
  return (
    <span style={styles.iconSlot}>
      {status === 'running' ? (
        <Spinner size="sm" aria-label={label} />
      ) : status === 'pass' ? (
        <Icon icon={CheckIcon} size="sm" color="success" aria-label={label} />
      ) : status === 'fail' ? (
        <Icon icon={XIcon} size="sm" color="error" aria-label={label} />
      ) : status === 'queued' ? (
        <Icon
          icon={CircleDashedIcon}
          size="sm"
          color="secondary"
          aria-label={label}
        />
      ) : (
        <Icon icon={MinusIcon} size="sm" color="secondary" aria-label={label} />
      )}
    </span>
  );
}

/** Mono pass/fail/skip cluster; zero counts stay hidden to cut noise. */
function CountCluster({counts}: {counts: NodeCounts}) {
  return (
    <span style={styles.countCluster} aria-hidden="true">
      {counts.pass > 0 && <span style={styles.countPass}>{counts.pass}✓</span>}
      {counts.fail > 0 && <span style={styles.countFail}>{counts.fail}✕</span>}
      {counts.skip > 0 && <span style={styles.countSkip}>{counts.skip}–</span>}
    </span>
  );
}

// ============= SUITE TREE RAIL =============

interface TreeNode {
  id: string;
  kind: 'suite' | 'describe';
  label: string;
  counts: NodeCounts;
}

function TreeRow({
  node,
  isActive,
  onSelect,
}: {
  node: TreeNode;
  isActive: boolean;
  onSelect: (id: string | null) => void;
}) {
  const status = nodeStatus(node.counts);
  const countsLabel = [
    node.counts.pass > 0 ? \`\${node.counts.pass} passed\` : null,
    node.counts.fail > 0 ? \`\${node.counts.fail} failed\` : null,
    node.counts.skip > 0 ? \`\${node.counts.skip} skipped\` : null,
    node.counts.running > 0 ? \`\${node.counts.running} running\` : null,
    node.counts.queued > 0 ? \`\${node.counts.queued} queued\` : null,
  ]
    .filter(part => part !== null)
    .join(', ');
  return (
    <button
      type="button"
      aria-label={\`Filter to \${node.label}: \${countsLabel}\`}
      aria-current={isActive ? 'true' : undefined}
      // Tapping the active node again clears the filter back to all suites.
      onClick={() => onSelect(isActive ? null : node.id)}
      style={{
        ...styles.treeRow,
        ...(node.kind === 'describe' ? styles.treeRowDescribe : undefined),
        ...(isActive ? styles.treeRowActive : undefined),
      }}>
      <StatusIcon status={status} label={STATUS_WORD[status]} />
      <Icon
        icon={node.kind === 'suite' ? FileCode2Icon : ListTreeIcon}
        size="sm"
        color={isActive ? 'accent' : 'secondary'}
      />
      <span style={styles.treeName}>
        <Text
          type={node.kind === 'suite' ? 'label' : 'body'}
          maxLines={1}>
          {node.label}
        </Text>
      </span>
      <CountCluster counts={node.counts} />
    </button>
  );
}

function SuiteTreeRail({
  tests,
  selectedNode,
  onSelect,
}: {
  tests: TestCase[];
  selectedNode: string | null;
  onSelect: (id: string | null) => void;
}) {
  const totals = countTests(tests);
  const finished = totals.pass + totals.fail + totals.skip;
  return (
    <div style={styles.railFrame}>
      <div style={styles.railHeader}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>Suites</Heading>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {finished} of {tests.length} done
            </Text>
          </HStack>
          <Text type="supporting" color="secondary">
            Tap a file or describe block to filter the stream.
          </Text>
        </VStack>
      </div>
      <div style={styles.railScroll}>
        <VStack gap={1}>
          {SUITES.map(suite => {
            const suiteTests = tests.filter(test => test.suiteId === suite.id);
            // Describe blocks in fixture order (Map preserves insertion).
            const describes = [...new Set(suiteTests.map(t => t.describe))];
            return (
              <VStack key={suite.id} gap={0}>
                <TreeRow
                  node={{
                    id: suite.id,
                    kind: 'suite',
                    label: suiteBasename(suite.file),
                    counts: countTests(suiteTests),
                  }}
                  isActive={selectedNode === suite.id}
                  onSelect={onSelect}
                />
                {describes.map(describe => (
                  <TreeRow
                    key={describe}
                    node={{
                      id: \`\${suite.id}::\${describe}\`,
                      kind: 'describe',
                      label: describe,
                      counts: countTests(
                        suiteTests.filter(t => t.describe === describe),
                      ),
                    }}
                    isActive={selectedNode === \`\${suite.id}::\${describe}\`}
                    onSelect={onSelect}
                  />
                ))}
              </VStack>
            );
          })}
        </VStack>
      </div>
    </div>
  );
}

// ============= RUN STREAM =============

function StreamRow({
  test,
  isSelected,
  isCompact,
  slowestMax,
  onSelectFailure,
}: {
  test: TestCase;
  isSelected: boolean;
  isCompact: boolean;
  /** Set only on the Slowest tab: paints the duration bar. */
  slowestMax: number | null;
  onSelectFailure: (id: string) => void;
}) {
  const rowStyle: CSSProperties = {
    ...styles.streamRow,
    ...(isCompact ? styles.streamRowCompact : undefined),
    ...(test.status === 'queued' ? styles.rowQueued : undefined),
  };

  const nameCell = (
    <span style={styles.testNameCell}>
      <Text type="body" maxLines={1}>
        <Text type="body" color="secondary">
          {test.describe} ›{' '}
        </Text>
        {test.name}
      </Text>
    </span>
  );

  const durationCell =
    test.status === 'running' ? (
      <span style={styles.durationCell}>running…</span>
    ) : test.status === 'queued' ? (
      <span style={styles.durationCell}>queued</span>
    ) : test.status === 'skip' ? (
      <span style={styles.durationCell}>skipped</span>
    ) : (
      <span style={styles.durationCell}>
        {formatMs(test.durationMs ?? 0)}
      </span>
    );

  const durationBar =
    slowestMax !== null && test.durationMs !== null && test.durationMs > 0 ? (
      <span style={styles.durationTrack} aria-hidden="true">
        <span
          style={{
            ...styles.durationFill,
            width: \`\${Math.round((test.durationMs / slowestMax) * 100)}%\`,
            display: 'block',
          }}
        />
      </span>
    ) : null;

  // Failed rows are real buttons that open the failure detail; everything
  // else is a plain row — there is nothing further to drill into.
  if (test.status === 'fail') {
    return (
      <button
        type="button"
        aria-label={\`Open failure details: \${test.describe} › \${test.name}\`}
        aria-current={isSelected ? 'true' : undefined}
        onClick={() => onSelectFailure(test.id)}
        style={{
          ...rowStyle,
          ...styles.streamRowButton,
          ...(isSelected ? styles.streamRowSelected : undefined),
        }}>
        <StatusIcon status="fail" label="Failed" />
        {nameCell}
        {durationBar}
        {durationCell}
      </button>
    );
  }

  return (
    <div style={rowStyle}>
      <StatusIcon status={test.status} label={STATUS_WORD[test.status]} />
      {nameCell}
      {durationBar}
      {durationCell}
    </div>
  );
}

// ============= FAILURE DETAIL =============

function FailureDetail({
  test,
  isRerunning,
  onRerunTest,
  onAnnounce,
}: {
  test: TestCase;
  isRerunning: boolean;
  onRerunTest: (id: string) => void;
  onAnnounce: (message: string) => void;
}) {
  const suite = SUITES.find(s => s.id === test.suiteId);

  if (test.failure === undefined || test.status !== 'fail') {
    // The selected test was re-run and now passes (or is mid re-run).
    return (
      <EmptyState
        icon={
          test.status === 'running' ? (
            <Spinner size="lg" aria-label="Re-running" />
          ) : (
            <Icon icon={CheckIcon} size="lg" color="success" />
          )
        }
        title={
          test.status === 'running' ? 'Re-running this test…' : 'Now passing'
        }
        description={
          test.status === 'running'
            ? \`\${test.name} is back in the queue.\`
            : \`\${test.name} passed on the latest re-run.\`
        }
      />
    );
  }

  const {failure} = test;

  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge variant="error" label="Failed" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatMs(test.durationMs ?? 0)}
          </Text>
        </HStack>
        <Text type="label">
          {test.describe} › {test.name}
        </Text>
        {suite !== undefined && <Code>{suite.file}</Code>}
      </VStack>

      <div style={styles.messageBlock}>{failure.message}</div>

      <VStack gap={1}>
        <HStack gap={3} vAlign="center">
          <Text type="supporting" style={{color: 'var(--color-success)'}}>
            − expected
          </Text>
          <Text type="supporting" style={{color: 'var(--color-error)'}}>
            + received
          </Text>
        </HStack>
        <div style={styles.diffBlock}>
          <div style={styles.diffScroll}>
            {failure.diff.map((line, index) => (
              <div
                key={index}
                style={{
                  ...styles.diffRow,
                  ...(line.kind === 'expected'
                    ? styles.rowExpected
                    : line.kind === 'received'
                      ? styles.rowReceived
                      : undefined),
                }}>
                <span
                  aria-hidden="true"
                  style={{
                    ...styles.diffSign,
                    ...(line.kind === 'expected'
                      ? styles.signExpected
                      : line.kind === 'received'
                        ? styles.signReceived
                        : undefined),
                  }}>
                  {line.kind === 'expected'
                    ? '−'
                    : line.kind === 'received'
                      ? '+'
                      : ' '}
                </span>
                <span style={styles.diffText}>{line.text}</span>
              </div>
            ))}
          </div>
        </div>
      </VStack>

      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          Stack trace
        </Text>
        <div style={styles.stackBlock}>
          {failure.stack.map((frame, index) => (
            <div
              key={index}
              style={{
                ...styles.stackLine,
                ...(frame.isAppFrame ? undefined : styles.stackVendor),
              }}>
              {'  at '}
              {frame.fn !== undefined ? \`\${frame.fn} (\` : ''}
              <span style={frame.isAppFrame ? styles.stackPath : undefined}>
                {frame.path}
              </span>
              :{frame.line}:{frame.col}
              {frame.fn !== undefined ? ')' : ''}
            </div>
          ))}
        </div>
      </VStack>

      <HStack gap={2} vAlign="center" wrap="wrap">
        <Button
          label="Re-run test"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          isDisabled={isRerunning}
          onClick={() => onRerunTest(test.id)}
        />
        <Button
          label="Copy stack"
          variant="ghost"
          size="sm"
          icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
          onClick={() => onAnnounce(\`Copied stack trace for \${test.name}.\`)}
        />
        <Button
          label="Open in editor"
          variant="ghost"
          size="sm"
          icon={<Icon icon={SquarePenIcon} size="sm" color="inherit" />}
          onClick={() =>
            onAnnounce(
              \`Opened \${failure.stack[0].path}:\${failure.stack[0].line} in the editor.\`,
            )
          }
        />
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function TestRunnerConsoleTemplate() {
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [isWatchMode, setIsWatchMode] = useState(true);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(
    INITIAL_SELECTED_TEST,
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Failed tests queued for the scripted resolver, resolved 1 per 900ms.
  const [rerunQueue, setRerunQueue] = useState<string[]>([]);
  const [liveMessage, setLiveMessage] = useState('');

  // Responsive contract: <=1024px swaps the docked failure panel for a
  // fullscreen Dialog; <=640px swaps the tree rail for a suite Selector
  // and grows header controls and stream rows to >=40px tap targets.
  const isSinglePaneDetail = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Scripted re-run resolver: pop one queued id per 900ms tick and apply
  // its fixed outcome from RERUN_RESOLUTIONS. Deterministic outcomes;
  // only the cadence is runtime (the logs-explorer live-tail rule).
  useEffect(() => {
    if (rerunQueue.length === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      const [next, ...rest] = rerunQueue;
      setTests(prev =>
        prev.map(test => {
          if (test.id !== next) {
            return test;
          }
          const outcome = RERUN_RESOLUTIONS[test.id] ?? {
            status: 'pass' as const,
            durationMs: test.durationMs ?? 1,
          };
          return {
            ...test,
            status: outcome.status,
            durationMs: outcome.durationMs,
            failure: outcome.status === 'fail' ? test.failure : undefined,
          };
        }),
      );
      const resolved = tests.find(test => test.id === next);
      const outcome = RERUN_RESOLUTIONS[next];
      if (resolved !== undefined && outcome !== undefined) {
        setLiveMessage(
          \`\${resolved.name} \${outcome.status === 'pass' ? 'passed' : 'failed again'} on re-run.\`,
        );
      }
      setRerunQueue(rest);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [rerunQueue, tests]);

  const isRerunning = rerunQueue.length > 0;

  // ---- derived state ----
  const totals = countTests(tests);
  const finishedMs = tests.reduce(
    (sum, test) => sum + (test.durationMs ?? 0),
    0,
  );

  const selectedTest = tests.find(test => test.id === selectedTestId) ?? null;

  const nodeTests = useMemo(() => {
    if (selectedNode === null) {
      return tests;
    }
    const [suiteId, describe] = selectedNode.split('::');
    return tests.filter(
      test =>
        test.suiteId === suiteId &&
        (describe === undefined || test.describe === describe),
    );
  }, [tests, selectedNode]);

  const visibleTests = useMemo(() => {
    if (filterTab === 'failed') {
      return nodeTests.filter(test => test.status === 'fail');
    }
    if (filterTab === 'slowest') {
      return nodeTests
        .filter(test => test.durationMs !== null && test.durationMs > 0)
        .sort((a, b) => (b.durationMs ?? 0) - (a.durationMs ?? 0))
        .slice(0, SLOWEST_LIMIT);
    }
    return nodeTests;
  }, [nodeTests, filterTab]);

  const slowestMax =
    filterTab === 'slowest' && visibleTests.length > 0
      ? (visibleTests[0].durationMs ?? 1)
      : null;

  const selectedNodeLabel = useMemo(() => {
    if (selectedNode === null) {
      return 'all suites';
    }
    const [suiteId, describe] = selectedNode.split('::');
    const suite = SUITES.find(s => s.id === suiteId);
    const base = suite !== undefined ? suiteBasename(suite.file) : suiteId;
    return describe === undefined ? base : \`\${base} › \${describe}\`;
  }, [selectedNode]);

  // ---- interactions ----
  const rerunTests = (ids: string[]) => {
    if (ids.length === 0 || isRerunning) {
      return;
    }
    setTests(prev =>
      prev.map(test =>
        ids.includes(test.id)
          ? {...test, status: 'running', durationMs: null}
          : test,
      ),
    );
    setRerunQueue(ids);
    setLiveMessage(
      ids.length === 1
        ? 'Re-running 1 test.'
        : \`Re-running \${ids.length} failed tests.\`,
    );
  };

  const rerunFailed = () => {
    rerunTests(tests.filter(test => test.status === 'fail').map(t => t.id));
  };

  const selectFailure = (id: string) => {
    setSelectedTestId(id);
    if (isSinglePaneDetail) {
      setIsDetailOpen(true);
    }
  };

  const closeDetail = (isOpen: boolean) => {
    if (!isOpen) {
      setIsDetailOpen(false);
    }
  };

  // ---- header ----
  // Count clusters condense to dot + bare count at <=640px so all three
  // plus the wall-time readout fit at 375px; StatusDot labels keep each
  // count announced for screen readers.
  const summaryClusters = (
    <HStack gap={isCompact ? 2 : 3} vAlign="center">
      <HStack gap={1} vAlign="center">
        <StatusDot variant="success" label="Passed" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {isCompact ? totals.pass : \`\${totals.pass} passed\`}
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <StatusDot variant="error" label="Failed" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {isCompact ? totals.fail : \`\${totals.fail} failed\`}
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <StatusDot variant="neutral" label="Skipped" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {isCompact ? totals.skip : \`\${totals.skip} skipped\`}
        </Text>
      </HStack>
      <Tooltip content="Wall time across finished tests">
        <span>
          <HStack gap={1} vAlign="center">
            <Icon icon={TimerIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatMs(finishedMs)}
            </Text>
          </HStack>
        </span>
      </Tooltip>
    </HStack>
  );

  // ---- single-pane suite picker (<=640px) ----
  const suiteOptions = [
    {value: 'all', label: 'All suites'},
    ...SUITES.map(suite => {
      const counts = countTests(tests.filter(t => t.suiteId === suite.id));
      const parts = [
        counts.pass > 0 ? \`\${counts.pass}✓\` : null,
        counts.fail > 0 ? \`\${counts.fail}✕\` : null,
        counts.skip > 0 ? \`\${counts.skip}–\` : null,
      ]
        .filter(part => part !== null)
        .join(' ');
      return {
        value: suite.id,
        label: \`\${suiteBasename(suite.file)} · \${parts}\`,
      };
    }),
  ];

  const singlePanePicker = (
    <Selector
      label="Suite filter"
      isLabelHidden
      options={suiteOptions}
      value={
        selectedNode === null ? 'all' : (selectedNode.split('::')[0] ?? 'all')
      }
      onChange={value => setSelectedNode(value === 'all' ? null : value)}
    />
  );

  // ---- run stream panel ----
  const isRunInProgress = totals.running > 0 || totals.queued > 0;

  const streamPanel = (
    <div style={styles.panel}>
      <div style={styles.streamHeader}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StatusDot
            variant={isRunInProgress ? 'accent' : 'success'}
            label={isRunInProgress ? 'Run in progress' : 'Run complete'}
            isPulsing={isRunInProgress}
          />
          <Text type="label">Run stream</Text>
          {!isCompact && (
            <Text type="supporting" color="secondary">
              vitest --reporter=stream
            </Text>
          )}
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {filterTab === 'slowest'
              ? \`slowest \${visibleTests.length} · \${selectedNodeLabel}\`
              : \`\${visibleTests.length} of \${nodeTests.length} · \${selectedNodeLabel}\`}
          </Text>
        </HStack>
      </div>
      {visibleTests.length > 0 ? (
        visibleTests.map(test => (
          <StreamRow
            key={test.id}
            test={test}
            isSelected={test.id === selectedTestId}
            isCompact={isCompact}
            slowestMax={slowestMax}
            onSelectFailure={selectFailure}
          />
        ))
      ) : (
        <EmptyState
          isCompact
          icon={<Icon icon={CheckIcon} size="lg" color="success" />}
          title="No tests match this view"
          description={
            filterTab === 'failed'
              ? \`No failures in \${selectedNodeLabel} — nothing to triage.\`
              : 'Pick another suite or filter tab.'
          }
        />
      )}
    </div>
  );

  // ---- failure detail (docked panel or fullscreen dialog) ----
  const detailBody =
    selectedTest !== null ? (
      <FailureDetail
        test={selectedTest}
        isRerunning={isRerunning}
        onRerunTest={id => rerunTests([id])}
        onAnnounce={setLiveMessage}
      />
    ) : (
      <EmptyState
        icon={<Icon icon={FlaskConicalIcon} size="lg" color="secondary" />}
        title="No failure selected"
        description="Select a failed test in the run stream to inspect its assertion diff and stack trace."
      />
    );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Icon icon={FlaskConicalIcon} size="md" color="secondary" />
                <Heading level={1}>Test Runner</Heading>
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {RUN_META.project} · {RUN_META.runner} · {RUN_META.node}
                  </Text>
                )}
              </HStack>
            </StackItem>
            {summaryClusters}
            <HStack gap={2} vAlign="center">
              <StatusDot
                variant={isWatchMode ? 'success' : 'neutral'}
                label={isWatchMode ? 'Watch mode on' : 'Watch mode off'}
                isPulsing={isWatchMode}
              />
              <Switch
                label="Watch"
                value={isWatchMode}
                onChange={setIsWatchMode}
              />
            </HStack>
            <Button
              label={
                isRerunning
                  ? 'Re-running…'
                  : \`Re-run failed (\${totals.fail})\`
              }
              variant="primary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              isDisabled={totals.fail === 0 || isRerunning}
              onClick={rerunFailed}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isCompact ? undefined : (
          <LayoutPanel width={280} padding={0} hasDivider label="Suite tree">
            <SuiteTreeRail
              tests={tests}
              selectedNode={selectedNode}
              onSelect={setSelectedNode}
            />
          </LayoutPanel>
        )
      }
      end={
        isSinglePaneDetail ? undefined : (
          <LayoutPanel
            width={360}
            padding={0}
            hasDivider
            label="Failure details">
            <div style={styles.detailScroll}>{detailBody}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4} label="Run stream">
          <VStack gap={3}>
            {isCompact && singlePanePicker}
            <TabList
              value={filterTab}
              onChange={value => setFilterTab(value as FilterTab)}
              size={isCompact ? 'lg' : 'md'}
              hasDivider>
              <Tab
                value="all"
                label="All"
                endContent={
                  <Badge variant="neutral" label={String(nodeTests.length)} />
                }
              />
              <Tab
                value="failed"
                label="Failed"
                endContent={
                  totals.fail > 0 ? (
                    <Badge variant="error" label={String(totals.fail)} />
                  ) : undefined
                }
              />
              <Tab value="slowest" label="Slowest" />
            </TabList>
            {streamPanel}
            <div style={styles.footerStrip}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {isWatchMode
                      ? \`Watch mode on — re-runs affected suites on save (\${RUN_META.watchedFiles} files watched)\`
                      : 'Watch mode off — runs start manually'}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {totals.queued > 0
                    ? \`\${totals.running} running · \${totals.queued} queued\`
                    : isRerunning
                      ? \`re-running \${rerunQueue.length} remaining\`
                      : 'queue idle'}
                </Text>
              </HStack>
            </div>
          </VStack>

          {/* <=1024px single-pane fallback: the docked detail panel becomes
              a fullscreen Dialog opened from any failed stream row. */}
          <Dialog
            isOpen={isSinglePaneDetail && isDetailOpen && selectedTest !== null}
            onOpenChange={closeDetail}
            variant="fullscreen">
            {selectedTest !== null && (
              <Layout
                header={
                  <DialogHeader
                    title="Failure details"
                    subtitle={\`\${selectedTest.describe} › \${selectedTest.name}\`}
                    onOpenChange={closeDetail}
                  />
                }
                content={<LayoutContent>{detailBody}</LayoutContent>}
              />
            )}
          </Dialog>

          {/* Re-run progress and copy/open actions are announced. */}
          <div aria-live="polite" style={styles.srOnly}>
            {liveMessage}
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};