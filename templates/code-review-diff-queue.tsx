// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one pull request — "Harden webhook
 *   signature verification", #482 on checkout-api — with 5 changed files
 *   carrying real-looking diff hunks with old/new line numbers, 3 inline
 *   comment threads anchored to new-file lines with fixed "Jun 30 / Jul 1,
 *   2026" author timestamps, and a 5-item CI check fixture with mixed
 *   pass/running/warning states)
 * @output PR review QUEUE surface: a top bar with PR Heading + "Open" Badge +
 *   branch/commit meta and Approve / Request-changes Buttons that open a
 *   summary-comment Dialog (RadioList verdict + TextArea, submit disabled for
 *   an empty request-changes summary), a CI checks strip of StatusDots under
 *   the title row, a 280px file-tree rail grouped by directory whose rows
 *   carry per-file +added/−removed counts, open-thread counts, and viewed
 *   CheckIcons above a files-viewed ProgressBar, and a diff panel for the
 *   active file: unified/split SegmentedControl, line-number gutters,
 *   token-tinted add/remove rows, inline comment threads with reply/resolve,
 *   a "Viewed" collapse Switch, and a "Mark viewed & next" queue advance
 * @position Page template; emitted by `astryx template code-review-diff-queue`
 *
 * Frame: Layout height="fill". LayoutHeader carries two rows — the PR chrome
 * (title, state Badge, branch → base meta, review verdict Badge once
 * submitted, Request changes / Approve Buttons) and the CI checks strip.
 * LayoutPanel start 280 hosts the file tree: a pinned rail header with the
 * files-viewed ProgressBar, then a scrolling directory-grouped file list.
 * LayoutContent (padding 4) shows ONE file's diff at a time — the queue
 * model — inside a bordered panel with its own file header. Choose over
 * diff-viewer when the surface is a MULTI-FILE review queue — tree rail,
 * viewed progress, verdict dialog, CI strip — not a single-file compare.
 *
 * Responsive contract:
 * - >768px: header | rail 280 (fixed, tree scrolls) | diff (fill). The
 *   SegmentedControl chooses split (two panes, own gutters) or unified (old +
 *   new gutters on one pane). Code cells never wrap (white-space: pre); the
 *   diff body scrolls horizontally when a line outgrows the panel.
 * - <=768px: the diff always renders unified — split panes are unreadable at
 *   phone widths — and the split/unified toggle hides.
 * - <=640px: the file-tree rail leaves the start slot; a single-pane fallback
 *   row above the diff carries the files-viewed ProgressBar, a file Selector,
 *   and 40px prev/next IconButton steppers, so the whole queue stays
 *   reachable in one pane. The header meta line hides; title, state Badge,
 *   and both review Buttons stay visible and wrap onto their own row.
 * - Tap targets: tree rows, the queue steppers, and the "Mark viewed & next"
 *   Button are all >=40px tall; nothing is hover-only — check states, thread
 *   counts, and viewed marks are painted inline (Tooltips only restate them).
 * - The CI strip scrolls horizontally at narrow widths instead of wrapping
 *   the header taller; the diff scroller owns all other overflow-x.
 *
 * Container policy (review-queue archetype): dense tool chrome — frame-first
 * rows and panels, bordered divs for the diff panel and thread blocks, no
 * Cards. All counts (rail +/− Badges, thread totals, viewed progress, the
 * dialog's open-thread caution) recompute live from state. Fixture policy:
 * fixed data only — no clocks, randomness, or network assets; new replies use
 * the fixed literal timestamp "Jul 2, 2026 at 09:15".
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Code} from '@astryxdesign/core/Code';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  FileCodeIcon,
  FilePlus2Icon,
  FolderIcon,
  GitPullRequestIcon,
  MessagesSquareIcon,
  RotateCcwIcon,
  SendIcon,
} from 'lucide-react';

// Queue stepper chevrons come from Icon's built-in semantic registry
// ('chevronLeft' / 'chevronRight').

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
    width: 40,
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
  // Queue footer inside the diff panel: mark-viewed-and-advance.
  panelFooter: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // File-tree rail: pinned header (progress), scrolling tree below.
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
  railFrame: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  treeDir: {
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  // Tree rows are real buttons with >=40px tap targets; the active row wears
  // the accent-muted surface so selection never depends on hover.
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
  treeName: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  treeStat: {
    ...mono,
    flexShrink: 0,
  },
  statAdd: {color: 'var(--color-success)'},
  statDel: {color: 'var(--color-error)'},
  // CI checks strip: one horizontal scroller, never wraps the header taller.
  checksScroll: {
    overflowX: 'auto',
  },
  checkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
    padding: 'var(--spacing-0-5) var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-control)',
    whiteSpace: 'nowrap',
  },
  // Single-pane (<=640px) queue picker above the diff.
  pickerRow: {
    marginBottom: 'var(--spacing-3)',
  },
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

type FileStatus = 'modified' | 'added';

interface ChangedFile {
  id: string;
  /** Directory portion of the path, used to group the tree rail. */
  dir: string;
  name: string;
  status: FileStatus;
  hunks: DiffHunk[];
}

const PULL_REQUEST = {
  title: 'Harden webhook signature verification',
  number: 482,
  repo: 'checkout-api',
  branch: 'fix/webhook-signatures',
  base: 'main',
  author: 'Priya Nair',
  commit: '9d41c7e',
};

const CURRENT_REVIEWER = 'Maya Lindqvist';
const REPLY_WHEN = 'Jul 2, 2026 at 09:15'; // fixed literal for new replies

// Five changed files with real-looking hunks: the verifier swaps string
// comparison for timingSafeEqual, the handler and route surface rejection
// reasons, config grows the secret accessor, and a new test file lands.
const FILES: ChangedFile[] = [
  {
    id: 'file-verify',
    dir: 'src/webhooks',
    name: 'verify-signature.ts',
    status: 'modified',
    hunks: [
      {
        header: '@@ -8,9 +8,12 @@ import section',
        lines: [
          {type: 'context', oldNo: 8, newNo: 8, text: "import type {IncomingHttpHeaders} from 'node:http';"},
          {type: 'del', oldNo: 9, newNo: null, text: "import {createHmac} from 'node:crypto';"},
          {type: 'add', oldNo: null, newNo: 9, text: "import {createHmac, timingSafeEqual} from 'node:crypto';"},
          {type: 'add', oldNo: null, newNo: 10, text: "import {getWebhookSecret} from '../config/secrets';"},
          {type: 'context', oldNo: 10, newNo: 11, text: ''},
          {type: 'del', oldNo: 11, newNo: null, text: "const SIGNATURE_HEADER = 'x-signature';"},
          {type: 'add', oldNo: null, newNo: 12, text: "const SIGNATURE_HEADER = 'x-hub-signature-256';"},
          {type: 'add', oldNo: null, newNo: 13, text: 'const TOLERANCE_SECONDS = 300;'},
          {type: 'context', oldNo: 12, newNo: 14, text: ''},
          {type: 'context', oldNo: 13, newNo: 15, text: 'export interface VerifyResult {'},
        ],
      },
      {
        header: '@@ -41,8 +44,17 @@ export function verifySignature(',
        lines: [
          {type: 'context', oldNo: 41, newNo: 44, text: '  const header = headers[SIGNATURE_HEADER];'},
          {type: 'context', oldNo: 42, newNo: 45, text: "  if (typeof header !== 'string') {"},
          {type: 'context', oldNo: 43, newNo: 46, text: "    return {ok: false, reason: 'missing-signature'};"},
          {type: 'context', oldNo: 44, newNo: 47, text: '  }'},
          {type: 'del', oldNo: 45, newNo: null, text: "  const expected = createHmac('sha256', secret).update(body).digest('hex');"},
          {type: 'del', oldNo: 46, newNo: null, text: '  return {ok: header === expected};'},
          {type: 'add', oldNo: null, newNo: 48, text: "  const [scheme, provided] = header.split('=', 2);"},
          {type: 'add', oldNo: null, newNo: 49, text: "  if (scheme !== 'sha256' || provided === undefined) {"},
          {type: 'add', oldNo: null, newNo: 50, text: "    return {ok: false, reason: 'malformed-signature'};"},
          {type: 'add', oldNo: null, newNo: 51, text: '  }'},
          {type: 'add', oldNo: null, newNo: 52, text: "  const expected = createHmac('sha256', getWebhookSecret())"},
          {type: 'add', oldNo: null, newNo: 53, text: '    .update(body)'},
          {type: 'add', oldNo: null, newNo: 54, text: "    .digest('hex');"},
          {type: 'add', oldNo: null, newNo: 55, text: "  const a = Buffer.from(provided, 'hex');"},
          {type: 'add', oldNo: null, newNo: 56, text: "  const b = Buffer.from(expected, 'hex');"},
          {type: 'add', oldNo: null, newNo: 57, text: '  return {ok: a.length === b.length && timingSafeEqual(a, b)};'},
          {type: 'context', oldNo: 47, newNo: 58, text: '}'},
        ],
      },
    ],
  },
  {
    id: 'file-routes',
    dir: 'src/webhooks',
    name: 'routes.ts',
    status: 'modified',
    hunks: [
      {
        header: "@@ -27,7 +27,11 @@ router.post('/webhooks',",
        lines: [
          {type: 'context', oldNo: 27, newNo: 27, text: "router.post('/webhooks', async (req, res) => {"},
          {type: 'context', oldNo: 28, newNo: 28, text: '  const raw = await readRawBody(req);'},
          {type: 'del', oldNo: 29, newNo: null, text: '  await dispatch(req.headers, raw);'},
          {type: 'add', oldNo: null, newNo: 29, text: '  const result = await dispatch(req.headers, raw);'},
          {type: 'add', oldNo: null, newNo: 30, text: '  if (!result.accepted) {'},
          {type: 'add', oldNo: null, newNo: 31, text: '    res.status(400).json({error: result.reason});'},
          {type: 'add', oldNo: null, newNo: 32, text: '    return;'},
          {type: 'add', oldNo: null, newNo: 33, text: '  }'},
          {type: 'context', oldNo: 30, newNo: 34, text: '  res.status(202).end();'},
          {type: 'context', oldNo: 31, newNo: 35, text: '});'},
        ],
      },
    ],
  },
  {
    id: 'file-handler',
    dir: 'src/webhooks/handlers',
    name: 'payment-succeeded.ts',
    status: 'modified',
    hunks: [
      {
        header: '@@ -18,8 +18,10 @@ export async function handlePaymentSucceeded(',
        lines: [
          {type: 'context', oldNo: 18, newNo: 18, text: '  const event = parseEvent(payload);'},
          {type: 'del', oldNo: 19, newNo: null, text: '  if (!verifySignature(headers, payload).ok) {'},
          {type: 'del', oldNo: 20, newNo: null, text: "    throw new Error('bad signature');"},
          {type: 'add', oldNo: null, newNo: 19, text: '  const verdict = verifySignature(headers, payload);'},
          {type: 'add', oldNo: null, newNo: 20, text: '  if (!verdict.ok) {'},
          {type: 'add', oldNo: null, newNo: 21, text: "    metrics.increment('webhooks.rejected', {reason: verdict.reason});"},
          {type: 'add', oldNo: null, newNo: 22, text: '    throw new WebhookRejectedError(verdict.reason);'},
          {type: 'context', oldNo: 21, newNo: 23, text: '  }'},
          {type: 'context', oldNo: 22, newNo: 24, text: '  await recordPayment(event);'},
        ],
      },
    ],
  },
  {
    id: 'file-secrets',
    dir: 'src/config',
    name: 'secrets.ts',
    status: 'modified',
    hunks: [
      {
        header: '@@ -14,3 +14,7 @@ export function getDatabaseUrl(',
        lines: [
          {type: 'context', oldNo: 14, newNo: 14, text: 'export function getDatabaseUrl(): string {'},
          {type: 'context', oldNo: 15, newNo: 15, text: "  return required('DATABASE_URL');"},
          {type: 'context', oldNo: 16, newNo: 16, text: '}'},
          {type: 'add', oldNo: null, newNo: 17, text: ''},
          {type: 'add', oldNo: null, newNo: 18, text: 'export function getWebhookSecret(): string {'},
          {type: 'add', oldNo: null, newNo: 19, text: "  return required('WEBHOOK_SIGNING_SECRET');"},
          {type: 'add', oldNo: null, newNo: 20, text: '}'},
        ],
      },
    ],
  },
  {
    id: 'file-tests',
    dir: 'tests/webhooks',
    name: 'verify-signature.test.ts',
    status: 'added',
    hunks: [
      {
        header: '@@ -0,0 +1,14 @@ new file',
        lines: [
          {type: 'add', oldNo: null, newNo: 1, text: "import {describe, expect, it} from 'vitest';"},
          {type: 'add', oldNo: null, newNo: 2, text: "import {verifySignature} from '../../src/webhooks/verify-signature';"},
          {type: 'add', oldNo: null, newNo: 3, text: ''},
          {type: 'add', oldNo: null, newNo: 4, text: "const SIGNED_HEADER = 'sha256=8f3a…'; // fixture digest"},
          {type: 'add', oldNo: null, newNo: 5, text: ''},
          {type: 'add', oldNo: null, newNo: 6, text: "describe('verifySignature', () => {"},
          {type: 'add', oldNo: null, newNo: 7, text: "  it('rejects a missing header', () => {"},
          {type: 'add', oldNo: null, newNo: 8, text: "    const result = verifySignature({}, 'payload');"},
          {type: 'add', oldNo: null, newNo: 9, text: '    expect(result.ok).toBe(false);'},
          {type: 'add', oldNo: null, newNo: 10, text: "    expect(result.reason).toBe('missing-signature');"},
          {type: 'add', oldNo: null, newNo: 11, text: '  });'},
          {type: 'add', oldNo: null, newNo: 12, text: "  it('rejects a malformed scheme', () => {"},
          {type: 'add', oldNo: null, newNo: 13, text: "    expect(verifySignature({'x-hub-signature-256': 'md5=00'}, 'p').ok).toBe(false);"},
          {type: 'add', oldNo: null, newNo: 14, text: '  });'},
        ],
      },
    ],
  },
];

const filePath = (file: ChangedFile) => `${file.dir}/${file.name}`;

// ---- comment threads ----

interface ReviewComment {
  id: string;
  author: string;
  role: 'Reviewer' | 'Author';
  when: string;
  body: string;
}

interface ReviewThread {
  id: string;
  fileId: string;
  /** Anchor: line number in the NEW file. */
  newNo: number;
  comments: ReviewComment[];
}

const THREADS: ReviewThread[] = [
  {
    id: 'thread-timing',
    fileId: 'file-verify',
    newNo: 57,
    comments: [
      {
        id: 'thread-timing-1',
        author: 'Maya Lindqvist',
        role: 'Reviewer',
        when: 'Jun 30, 2026 at 14:12',
        body:
          'timingSafeEqual throws when the buffers differ in length — the ' +
          'length guard handles it, but a hex header with an odd length ' +
          'still round-trips through Buffer.from silently. Worth rejecting ' +
          'non-hex input before comparing?',
      },
      {
        id: 'thread-timing-2',
        author: 'Priya Nair',
        role: 'Author',
        when: 'Jun 30, 2026 at 16:03',
        body:
          'Good catch — malformed hex shrinks the buffer and fails the ' +
          'length check, so the compare stays safe, but I will add an ' +
          'explicit /^[0-9a-f]+$/ guard so the reason code says ' +
          'malformed-signature instead of a generic mismatch.',
      },
    ],
  },
  {
    id: 'thread-status',
    fileId: 'file-routes',
    newNo: 31,
    comments: [
      {
        id: 'thread-status-1',
        author: 'Maya Lindqvist',
        role: 'Reviewer',
        when: 'Jul 1, 2026 at 09:40',
        body:
          'Should signature failures return 401 rather than 400? Senders ' +
          'retry on 4xx either way, but 401 makes the rejection reason ' +
          'obvious in their delivery logs.',
      },
    ],
  },
  {
    id: 'thread-fixture',
    fileId: 'file-tests',
    newNo: 4,
    comments: [
      {
        id: 'thread-fixture-1',
        author: 'Maya Lindqvist',
        role: 'Reviewer',
        when: 'Jul 1, 2026 at 10:05',
        body:
          'Is the truncated digest fixture intentional? If the full digest ' +
          'matters for the happy-path test we should inline it.',
      },
      {
        id: 'thread-fixture-2',
        author: 'Priya Nair',
        role: 'Author',
        when: 'Jul 1, 2026 at 10:22',
        body:
          'Intentional — the happy-path test computes its digest from the ' +
          'secret at runtime; this constant only feeds the rejection cases.',
      },
    ],
  },
];

const INITIALLY_RESOLVED = ['thread-fixture'];
const INITIALLY_VIEWED = ['file-secrets'];
const INITIAL_FILE_ID = 'file-verify';

// ---- CI checks ----

type CheckState = 'success' | 'running' | 'warning';

interface CiCheck {
  id: string;
  name: string;
  state: CheckState;
  detail: string;
}

const CHECKS: CiCheck[] = [
  {id: 'check-lint', name: 'lint', state: 'success', detail: '42s'},
  {id: 'check-types', name: 'typecheck', state: 'success', detail: '1m 08s'},
  {id: 'check-unit', name: 'unit tests', state: 'success', detail: '2m 31s'},
  {id: 'check-integration', name: 'integration', state: 'running', detail: 'running · 4m'},
  {id: 'check-coverage', name: 'coverage', state: 'warning', detail: '−0.4%'},
];

const CHECK_DOT: Record<CheckState, 'success' | 'accent' | 'warning'> = {
  success: 'success',
  running: 'accent',
  warning: 'warning',
};

const CHECK_LABEL: Record<CheckState, string> = {
  success: 'passed',
  running: 'running',
  warning: 'warning',
};

type ReviewVerdict = 'approve' | 'request-changes';

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

// ============= CI CHECKS STRIP =============

function CiChecksStrip() {
  const passed = CHECKS.filter(check => check.state === 'success').length;
  return (
    <div style={styles.checksScroll}>
      <HStack gap={2} vAlign="center">
        {/* Default StackItem sizing is static — the count never shrinks. */}
        <StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Checks {passed}/{CHECKS.length}
          </Text>
        </StackItem>
        {CHECKS.map(check => (
          <Tooltip
            key={check.id}
            content={`${check.name}: ${CHECK_LABEL[check.state]} · ${check.detail}`}>
            <span style={styles.checkItem}>
              <StatusDot
                variant={CHECK_DOT[check.state]}
                label={`${check.name} ${CHECK_LABEL[check.state]}`}
                isPulsing={check.state === 'running'}
              />
              <Text type="supporting">{check.name}</Text>
              <Text type="supporting" color="secondary">
                {check.detail}
              </Text>
            </span>
          </Tooltip>
        ))}
      </HStack>
    </div>
  );
}

// ============= FILE TREE RAIL =============

function TreeFileRow({
  file,
  isActive,
  isViewed,
  openThreads,
  onSelect,
}: {
  file: ChangedFile;
  isActive: boolean;
  isViewed: boolean;
  openThreads: number;
  onSelect: (id: string) => void;
}) {
  const {additions, deletions} = countChanges(file.hunks);
  return (
    <button
      type="button"
      aria-label={`Review ${filePath(file)}: +${additions} −${deletions}${
        openThreads > 0
          ? `, ${openThreads} open ${openThreads === 1 ? 'thread' : 'threads'}`
          : ''
      }${isViewed ? ', viewed' : ''}`}
      aria-current={isActive ? 'true' : undefined}
      onClick={() => onSelect(file.id)}
      style={{
        ...styles.treeRow,
        ...(isActive ? styles.treeRowActive : undefined),
      }}>
      <Icon
        icon={file.status === 'added' ? FilePlus2Icon : FileCodeIcon}
        size="sm"
        color={isActive ? 'accent' : 'secondary'}
      />
      <span style={styles.treeName}>
        <Text type="body" maxLines={1}>
          {file.name}
        </Text>
      </span>
      {openThreads > 0 && (
        <span style={styles.commentMarker} title={`${openThreads} open`}>
          <Icon icon={MessagesSquareIcon} size="xsm" />
        </span>
      )}
      <span style={{...styles.treeStat, ...styles.statAdd}}>+{additions}</span>
      <span style={{...styles.treeStat, ...styles.statDel}}>−{deletions}</span>
      {/* Fixed-width slot so viewed checks align and rows never shift. */}
      <span style={{width: 16, flexShrink: 0, display: 'inline-flex'}}>
        {isViewed && (
          <Icon icon={CheckIcon} size="xsm" color="success" />
        )}
      </span>
    </button>
  );
}

function FileTreeRail({
  activeFileId,
  viewedIds,
  openThreadsByFile,
  onSelect,
}: {
  activeFileId: string;
  viewedIds: Set<string>;
  openThreadsByFile: Record<string, number>;
  onSelect: (id: string) => void;
}) {
  // Group files by directory in fixture order (stable, deterministic).
  const groups = useMemo(() => {
    const byDir = new Map<string, ChangedFile[]>();
    for (const file of FILES) {
      const bucket = byDir.get(file.dir);
      if (bucket) {
        bucket.push(file);
      } else {
        byDir.set(file.dir, [file]);
      }
    }
    return [...byDir.entries()];
  }, []);

  const viewedCount = FILES.filter(file => viewedIds.has(file.id)).length;

  return (
    <div style={styles.railFrame}>
      <div style={styles.railHeader}>
        <VStack gap={1.5}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>Files</Heading>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {viewedCount} of {FILES.length} viewed
            </Text>
          </HStack>
          <ProgressBar
            label={`Review progress: ${viewedCount} of ${FILES.length} files viewed`}
            isLabelHidden
            value={viewedCount}
            max={FILES.length}
            variant={viewedCount === FILES.length ? 'success' : 'accent'}
          />
        </VStack>
      </div>
      <div style={styles.railScroll}>
        <VStack gap={2}>
          {groups.map(([dir, files]) => (
            <VStack key={dir} gap={0.5}>
              <div style={styles.treeDir}>
                <HStack gap={1.5} vAlign="center">
                  <Icon icon={FolderIcon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {dir}
                  </Text>
                </HStack>
              </div>
              {files.map(file => (
                <TreeFileRow
                  key={file.id}
                  file={file}
                  isActive={file.id === activeFileId}
                  isViewed={viewedIds.has(file.id)}
                  openThreads={openThreadsByFile[file.id] ?? 0}
                  onSelect={onSelect}
                />
              ))}
            </VStack>
          ))}
        </VStack>
      </div>
    </div>
  );
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
      <Icon icon={MessagesSquareIcon} size="xsm" />
    </span>
  );
}

// ============= COMMENT THREAD =============

function CommentThread({
  thread,
  fileName,
  comments,
  isResolved,
  draft,
  onDraftChange,
  onReply,
  onResolvedChange,
}: {
  thread: ReviewThread;
  fileName: string;
  comments: ReviewComment[];
  isResolved: boolean;
  draft: string;
  onDraftChange: (id: string, value: string) => void;
  onReply: (id: string) => void;
  onResolvedChange: (id: string, resolved: boolean) => void;
}) {
  if (isResolved) {
    return (
      <div style={styles.thread}>
        <HStack gap={2} vAlign="center">
          <Badge variant="success" label="Resolved" />
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              Thread on line {thread.newNo} · {comments[0].author} —{' '}
              {comments[0].body}
            </Text>
          </StackItem>
          <Button
            label="Reopen"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={() => onResolvedChange(thread.id, false)}
          />
        </HStack>
      </div>
    );
  }

  const canSend = draft.trim().length > 0;

  return (
    <div style={styles.thread}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Badge variant="warning" label="Unresolved" />
          <Text type="supporting" color="secondary">
            Thread on line {thread.newNo} · {fileName}
          </Text>
        </HStack>
        {comments.map(comment => (
          <HStack key={comment.id} gap={2} vAlign="start">
            <Avatar name={comment.author} size="small" />
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
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
            label={`Reply to thread on line ${thread.newNo}`}
            isLabelHidden
            placeholder="Reply…"
            rows={2}
            value={draft}
            onChange={value => onDraftChange(thread.id, value)}
          />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Replying as {CURRENT_REVIEWER}
              </Text>
            </StackItem>
            <Button
              label="Reply"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={!canSend}
              onClick={() => onReply(thread.id)}
            />
            <Button
              label="Resolve"
              variant="secondary"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={() => onResolvedChange(thread.id, true)}
            />
          </HStack>
        </VStack>
      </VStack>
    </div>
  );
}

// ============= REVIEW DIALOG =============

function ReviewDialog({
  verdict,
  summary,
  openThreads,
  filesViewed,
  onVerdictChange,
  onSummaryChange,
  onSubmit,
  onClose,
}: {
  verdict: ReviewVerdict | null;
  summary: string;
  openThreads: number;
  filesViewed: number;
  onVerdictChange: (verdict: ReviewVerdict) => void;
  onSummaryChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  // Request-changes must explain itself; approval summaries are optional.
  const canSubmit =
    verdict === 'approve' ||
    (verdict === 'request-changes' && summary.trim().length > 0);

  return (
    <Dialog
      isOpen={verdict !== null}
      onOpenChange={isOpen => {
        if (!isOpen) {
          onClose();
        }
      }}
      purpose="form"
      width="min(480px, 92vw)">
      <Layout
        header={
          <DialogHeader
            title="Submit review"
            subtitle={`${PULL_REQUEST.title} · #${PULL_REQUEST.number}`}
            onOpenChange={isOpen => {
              if (!isOpen) {
                onClose();
              }
            }}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={3}>
              <RadioList
                label="Verdict"
                value={verdict ?? 'approve'}
                onChange={value => onVerdictChange(value as ReviewVerdict)}>
                <RadioListItem
                  label="Approve"
                  value="approve"
                  description="Sign off on these changes as-is."
                />
                <RadioListItem
                  label="Request changes"
                  value="request-changes"
                  description="Block merging until the summary is addressed."
                />
              </RadioList>
              <TextArea
                label="Summary comment"
                placeholder={
                  verdict === 'request-changes'
                    ? 'What must change before this merges?'
                    : 'Optional note for the author…'
                }
                rows={4}
                value={summary}
                onChange={onSummaryChange}
              />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {filesViewed} of {FILES.length} files viewed ·{' '}
                {openThreads === 0
                  ? 'no open threads'
                  : `${openThreads} open ${openThreads === 1 ? 'thread' : 'threads'} remaining`}
              </Text>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill" />
              <Button label="Cancel" variant="ghost" onClick={onClose} />
              <Button
                label={
                  verdict === 'request-changes'
                    ? 'Request changes'
                    : 'Approve pull request'
                }
                variant={
                  verdict === 'request-changes' ? 'destructive' : 'primary'
                }
                isDisabled={!canSubmit}
                onClick={onSubmit}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );
}

// ============= PAGE =============

export default function CodeReviewDiffQueueTemplate() {
  const [activeFileId, setActiveFileId] = useState(INITIAL_FILE_ID);
  const [viewMode, setViewMode] = useState('unified');
  const [viewedIds, setViewedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_VIEWED),
  );
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(INITIALLY_RESOLVED),
  );
  // Per-thread reply drafts and the live comment lists, keyed by thread id.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [commentsById, setCommentsById] = useState<Record<string, ReviewComment[]>>(
    () => Object.fromEntries(THREADS.map(t => [t.id, t.comments])),
  );
  // The verdict pre-seeds from whichever header Button opened the dialog.
  const [dialogVerdict, setDialogVerdict] = useState<ReviewVerdict | null>(null);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [submittedReview, setSubmittedReview] = useState<{
    verdict: ReviewVerdict;
    summary: string;
  } | null>(null);
  const [liveMessage, setLiveMessage] = useState('');

  // Responsive contract: <=768px forces unified and hides the toggle;
  // <=640px swaps the docked tree rail for the single-pane queue picker.
  const isUnifiedOnly = useMediaQuery('(max-width: 768px)');
  const isSinglePane = useMediaQuery('(max-width: 640px)');
  const effectiveMode = isUnifiedOnly ? 'unified' : viewMode;

  // ---- derived state ----
  const activeIndex = FILES.findIndex(file => file.id === activeFileId);
  const activeFile = FILES[activeIndex];
  const isViewed = viewedIds.has(activeFileId);
  const viewedCount = FILES.filter(file => viewedIds.has(file.id)).length;

  const fileThreads = THREADS.filter(t => t.fileId === activeFileId);
  const threadByNewNo = new Map(fileThreads.map(t => [t.newNo, t]));
  const openThreadTotal = THREADS.filter(t => !resolvedIds.has(t.id)).length;
  const openThreadsByFile = Object.fromEntries(
    FILES.map(file => [
      file.id,
      THREADS.filter(t => t.fileId === file.id && !resolvedIds.has(t.id))
        .length,
    ]),
  );

  const totals = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    for (const file of FILES) {
      const counts = countChanges(file.hunks);
      additions += counts.additions;
      deletions += counts.deletions;
    }
    return {additions, deletions};
  }, []);

  const {additions, deletions} = countChanges(activeFile.hunks);

  // ---- interactions ----
  const setFileViewed = (id: string, viewed: boolean) => {
    setViewedIds(prev => {
      const next = new Set(prev);
      if (viewed) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  /** Queue advance: mark the current file viewed, jump to the next one. */
  const markViewedAndNext = () => {
    setFileViewed(activeFileId, true);
    const next = FILES[activeIndex + 1];
    if (next) {
      setActiveFileId(next.id);
      setLiveMessage(`Marked ${activeFile.name} viewed. Now reviewing ${next.name}.`);
    } else {
      setLiveMessage(`Marked ${activeFile.name} viewed. End of queue.`);
    }
  };

  const stepFile = (delta: number) => {
    const next = FILES[activeIndex + delta];
    if (next) {
      setActiveFileId(next.id);
    }
  };

  const setThreadResolved = (id: string, resolved: boolean) => {
    setResolvedIds(prev => {
      const next = new Set(prev);
      if (resolved) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const setDraft = (id: string, value: string) => {
    setDrafts(prev => ({...prev, [id]: value}));
  };

  /** Reply appends with the fixed literal timestamp, then clears the draft. */
  const sendReply = (id: string) => {
    const body = (drafts[id] ?? '').trim();
    if (body.length === 0) {
      return;
    }
    setCommentsById(prev => ({
      ...prev,
      [id]: [
        ...prev[id],
        {
          id: `${id}-reply-${prev[id].length + 1}`,
          author: CURRENT_REVIEWER,
          role: 'Reviewer',
          when: REPLY_WHEN,
          body,
        },
      ],
    }));
    setDrafts(prev => ({...prev, [id]: ''}));
  };

  const openReviewDialog = (verdict: ReviewVerdict) => {
    setDialogVerdict(verdict);
    setSummaryDraft(submittedReview?.summary ?? '');
  };

  const submitReview = () => {
    if (dialogVerdict === null) {
      return;
    }
    setSubmittedReview({verdict: dialogVerdict, summary: summaryDraft.trim()});
    setLiveMessage(
      dialogVerdict === 'approve'
        ? `Approved pull request #${PULL_REQUEST.number}.`
        : `Requested changes on pull request #${PULL_REQUEST.number}.`,
    );
    setDialogVerdict(null);
  };

  // ---- diff panel ----
  const threadBlock = (thread: ReviewThread) => (
    <CommentThread
      thread={thread}
      fileName={activeFile.name}
      comments={commentsById[thread.id]}
      isResolved={resolvedIds.has(thread.id)}
      draft={drafts[thread.id] ?? ''}
      onDraftChange={setDraft}
      onReply={sendReply}
      onResolvedChange={setThreadResolved}
    />
  );

  const hunkBlocks: ReactNode[] = activeFile.hunks.map(hunk => {
    if (effectiveMode === 'unified') {
      return (
        <div key={hunk.header}>
          <div style={styles.hunkHeader}>{hunk.header}</div>
          {hunk.lines.map((line, index) => {
            const thread =
              line.newNo !== null ? threadByNewNo.get(line.newNo) : undefined;
            return (
              <div key={index}>
                <UnifiedRow line={line} hasThread={thread !== undefined} />
                {thread ? threadBlock(thread) : null}
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
          const thread =
            row.right?.newNo != null
              ? threadByNewNo.get(row.right.newNo)
              : undefined;
          return (
            <div key={index}>
              <div style={styles.row}>
                <SplitCell line={row.left} hasThread={false} />
                <div style={styles.splitDivider} />
                <SplitCell line={row.right} hasThread={thread !== undefined} />
              </div>
              {thread ? threadBlock(thread) : null}
            </div>
          );
        })}
      </div>
    );
  });

  const openInFile = openThreadsByFile[activeFileId] ?? 0;

  const diffPanel = (
    <div style={styles.panel}>
      {/* File header: path, status, change stats, viewed toggle */}
      <div
        style={{
          ...styles.fileHeader,
          ...(isViewed ? styles.fileHeaderCollapsed : undefined),
        }}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Code>{filePath(activeFile)}</Code>
          <Badge
            variant={activeFile.status === 'added' ? 'green' : 'info'}
            label={activeFile.status === 'added' ? 'Added' : 'Modified'}
          />
          <Badge variant="green" label={`+${additions}`} />
          <Badge variant="red" label={`−${deletions}`} />
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              {activeFile.hunks.length}{' '}
              {activeFile.hunks.length === 1 ? 'hunk' : 'hunks'} ·{' '}
              {fileThreads.length === 0
                ? 'no threads'
                : openInFile === 0
                  ? 'all threads resolved'
                  : `${openInFile} open ${openInFile === 1 ? 'thread' : 'threads'}`}
            </Text>
          </StackItem>
          <Switch
            label="Viewed"
            value={isViewed}
            onChange={checked => setFileViewed(activeFileId, checked)}
          />
        </HStack>
      </div>
      {/* Diff body — collapsed entirely when marked viewed */}
      {!isViewed && <div style={styles.scroller}>{hunkBlocks}</div>}
      {/* Queue advance: the whole point of the surface — clear the file,
          land on the next one. */}
      <div style={styles.panelFooter}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              File {activeIndex + 1} of {FILES.length} · {viewedCount} viewed
            </Text>
          </StackItem>
          {isViewed ? (
            <Button
              label="Next file"
              variant="secondary"
              size="sm"
              isDisabled={activeIndex === FILES.length - 1}
              onClick={() => stepFile(1)}
            />
          ) : (
            <Button
              label="Mark viewed & next"
              variant="secondary"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              onClick={markViewedAndNext}
            />
          )}
        </HStack>
      </div>
    </div>
  );

  // ---- single-pane queue picker (<=640px) ----
  const fileOptions = FILES.map(file => ({
    value: file.id,
    label: `${filePath(file)}${viewedIds.has(file.id) ? ' ✓' : ''}`,
  }));

  const singlePanePicker = (
    <div style={styles.pickerRow}>
      <VStack gap={2}>
        <ProgressBar
          label={`Review progress: ${viewedCount} of ${FILES.length} files viewed`}
          value={viewedCount}
          max={FILES.length}
          variant={viewedCount === FILES.length ? 'success' : 'accent'}
        />
        <HStack gap={2} vAlign="center">
          <IconButton
            label="Previous file"
            tooltip="Previous file"
            icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
            variant="secondary"
            isDisabled={activeIndex === 0}
            onClick={() => stepFile(-1)}
          />
          <StackItem size="fill">
            <Selector
              label="Changed file"
              isLabelHidden
              options={fileOptions}
              value={activeFileId}
              onChange={setActiveFileId}
            />
          </StackItem>
          <IconButton
            label="Next file"
            tooltip="Next file"
            icon={<Icon icon="chevronRight" size="sm" color="inherit" />}
            variant="secondary"
            isDisabled={activeIndex === FILES.length - 1}
            onClick={() => stepFile(1)}
          />
        </HStack>
      </VStack>
    </div>
  );

  // ---- header ----
  const verdictBadge =
    submittedReview === null ? null : submittedReview.verdict === 'approve' ? (
      <Badge variant="success" label="Approved" />
    ) : (
      <Badge variant="error" label="Changes requested" />
    );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={2}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Icon
                    icon={GitPullRequestIcon}
                    size="md"
                    color="secondary"
                  />
                  <Heading level={1}>{PULL_REQUEST.title}</Heading>
                  <Badge variant="info" label="Open" />
                  {verdictBadge}
                  {!isSinglePane && (
                    <Text type="supporting" color="secondary">
                      #{PULL_REQUEST.number} · {PULL_REQUEST.branch} →{' '}
                      {PULL_REQUEST.base} · {PULL_REQUEST.author} · commit{' '}
                      {PULL_REQUEST.commit} · +{totals.additions} −
                      {totals.deletions}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {!isUnifiedOnly && (
                <SegmentedControl
                  label="Diff view"
                  value={viewMode}
                  onChange={setViewMode}
                  size="sm">
                  <SegmentedControlItem label="Unified" value="unified" />
                  <SegmentedControlItem label="Split" value="split" />
                </SegmentedControl>
              )}
              <Button
                label="Request changes"
                variant="secondary"
                onClick={() => openReviewDialog('request-changes')}
              />
              <Button
                label="Approve"
                variant="primary"
                onClick={() => openReviewDialog('approve')}
              />
            </HStack>
            <Divider />
            <CiChecksStrip />
          </VStack>
        </LayoutHeader>
      }
      start={
        isSinglePane ? undefined : (
          <LayoutPanel width={280} padding={0} label="Changed files">
            <FileTreeRail
              activeFileId={activeFileId}
              viewedIds={viewedIds}
              openThreadsByFile={openThreadsByFile}
              onSelect={setActiveFileId}
            />
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={4}>
          {isSinglePane && singlePanePicker}
          {diffPanel}
        </LayoutContent>
      }>
      <ReviewDialog
        verdict={dialogVerdict}
        summary={summaryDraft}
        openThreads={openThreadTotal}
        filesViewed={viewedCount}
        onVerdictChange={setDialogVerdict}
        onSummaryChange={setSummaryDraft}
        onSubmit={submitReview}
        onClose={() => setDialogVerdict(null)}
      />
      {/* Queue and review submissions are announced for screen readers. */}
      <div aria-live="polite" style={styles.srOnly}>
        {liveMessage}
      </div>
    </Layout>
  );
}
