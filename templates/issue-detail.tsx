// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one bug ticket PLAT-482 with a
 *   three-paragraph description plus a four-step repro list, 6 sub-tasks of
 *   which 3 start done, 3 linked pull requests each carrying build/tests/lint
 *   CI checks, 4 labels, 4 watchers, and an 8-entry activity feed — 5 system
 *   events and 3 comments, one comment with a reply — with fixed ISO
 *   timestamps between 2026-06-24T09:15:00Z and 2026-07-01T11:20:00Z)
 * @output Ticket detail page: a header row (back IconButton, mono "PLAT-482"
 *   Code, red Bug Badge, orange "High" priority Badge, an editable status
 *   Selector whose options carry StatusDots and whose change appends a
 *   system event to the feed, and a Watch/Watching toggle Button), a centered
 *   content column (issue title Heading + opened-by meta line, description
 *   block with numbered repro steps and Expected/Actual rows, a sub-task
 *   checklist with a live "N of M done" ProgressBar and an add-sub-task
 *   TextInput + Button, a linked-PRs panel whose rows wear merge/open/draft
 *   icons, mono branch Codes, and per-check CI StatusDots with a "2/3 checks
 *   passing" summary), and a threaded activity feed (All|Comments|History
 *   SegmentedControl) mixing system-event rows with comment Cards — Avatar +
 *   author + Timestamp, @mentions rendered as Tokens, indented replies, an
 *   inline per-comment reply composer — capped by a new-comment TextArea +
 *   Send composer. A right 300px metadata rail holds assignee, reporter,
 *   labels as Tokens, sprint, estimate, and a watcher AvatarGroup that
 *   tracks the header Watch toggle
 * @position Page template; emitted by `astryx template issue-detail`
 *
 * Frame: Layout height="fill". LayoutHeader carries the ticket chrome (back
 * arrow, issue key, type/priority Badges, status Selector, Watch Button);
 * LayoutContent scrolls one centered column (maxWidth 760) of title,
 * description, sub-tasks, linked PRs, and activity; LayoutPanel end 300
 * hosts the scrolling metadata rail. Choose over kanban-board when the
 * surface is ONE ticket's full depth — description, sub-tasks, linked PRs,
 * activity — not a wall of cards; choose over deployment-detail when the
 * artifact is a planning issue with discussion, not a build with logs.
 *
 * Responsive contract:
 * - >960px: header | content column (fill, scrolls) | metadata rail 300
 *   (fixed, scrolls vertically). Only the column and rail scroll internally.
 * - <=960px: the rail leaves the right edge and becomes a collapsible
 *   "Details" Card between the title and the description — a single-pane
 *   fallback, closed by default so the description stays above the fold.
 * - <=640px: header chrome wraps instead of clipping — the status Selector
 *   and Watch Button drop to their own full-width row under the key/badge
 *   cluster and the Selector stretches to 100%; PR rows stack their CI
 *   summary under the title instead of squeezing it.
 * - Primary controls keep ~40px tap targets at every width: the status
 *   Selector, Watch Button, checklist CheckboxInputs, Add sub-task Button,
 *   and composer Send are all md-sized; nothing is hover-only — every
 *   Tooltip annotates a focusable control and CI dot meanings are mirrored
 *   in visible "N/M checks" text.
 * - Wide content is contained: branch Codes and PR titles truncate inside
 *   minWidth:0 cells (full value in the row Tooltip), comment bodies wrap
 *   with overflowWrap:anywhere, and the labels row wraps its Tokens.
 *
 * Container policy (ticket-detail archetype): the page chrome is frame-first
 * rows; the linked-PR list is one bordered panel of divided rows; Cards are
 * reserved for comments, the composer, and the stacked Details fallback.
 * System events render as plain icon rows so comments read heavier than
 * housekeeping. All fixtures are fixed — no clocks, randomness, or network
 * assets; new comments, replies, and status-change events append with the
 * fixed literal timestamp 2026-07-02T17:30:00Z.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

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
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Code} from '@astryxdesign/core/Code';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot, type StatusDotVariant} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BugIcon,
  ChevronsUpIcon,
  CircleDotIcon,
  EyeIcon,
  EyeOffIcon,
  GitMergeIcon,
  GitPullRequestDraftIcon,
  GitPullRequestIcon,
  ListChecksIcon,
  PanelRightIcon,
  PlusIcon,
  ReplyIcon,
  SendIcon,
  TagIcon,
  UserRoundPlusIcon,
} from 'lucide-react';

// Back chevron comes from Icon's built-in semantic registry ('chevronLeft').

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered scrolling ticket column inside LayoutContent.
  column: {
    maxWidth: 760,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-4)',
  },
  // Metadata rail: the panel is fixed at 300px, only the list scrolls.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  headerWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=640px: the Selector + Watch pair takes its own full-width row.
  headerControlsRow: {width: '100%'},
  metaWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  labelsWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  // Linked-PR list: one bordered panel of divided rows.
  prPanel: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  prRow: {padding: 'var(--spacing-3)'},
  // minWidth 0 lets branch Codes and titles truncate instead of overflowing.
  truncateCell: {minWidth: 0},
  branchCode: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '100%',
  },
  // System events: icon in a muted circle so the feed scans as a timeline.
  eventIconCircle: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  replyIndent: {
    paddingLeft: 'var(--spacing-4)',
    borderLeft: '2px solid var(--color-border)',
  },
  commentBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
  stepNumber: {
    width: 22,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
};

// ============= STATUS / PRIORITY VOCABULARY =============

type StatusId = 'backlog' | 'todo' | 'in-progress' | 'in-review' | 'done';

interface StatusDef {
  id: StatusId;
  label: string;
  dot: StatusDotVariant;
}

const STATUSES: StatusDef[] = [
  {id: 'backlog', label: 'Backlog', dot: 'neutral'},
  {id: 'todo', label: 'Todo', dot: 'neutral'},
  {id: 'in-progress', label: 'In Progress', dot: 'accent'},
  {id: 'in-review', label: 'In Review', dot: 'warning'},
  {id: 'done', label: 'Done', dot: 'success'},
];

const statusById = (id: StatusId): StatusDef =>
  STATUSES.find(status => status.id === id) ?? STATUSES[0];

// ============= ISSUE DATA =============
// Deterministic fixtures: fixed ids, counts, and ISO timestamps. No clocks,
// no randomness, no network assets.

const ISSUE_KEY = 'PLAT-482';
const ISSUE_TITLE =
  'Checkout retries double-charge when the payment webhook times out';
const ISSUE_REPORTER = 'Priya Nair';
const ISSUE_ASSIGNEE = 'Maya Chen';
const ISSUE_OPENED = '2026-06-24T09:15:00Z';
const ISSUE_SPRINT = 'Sprint 24 · Jun 22 – Jul 3';
const ISSUE_ESTIMATE = '5 pts';
const CURRENT_USER = 'Maya Chen';
const INITIAL_STATUS: StatusId = 'in-progress';
// Fixed literal timestamp for everything appended at runtime.
const NOW_TIMESTAMP = '2026-07-02T17:30:00Z';

const DESCRIPTION_PARAGRAPHS = [
  'When the payment provider webhook takes longer than 10 seconds to ' +
    'acknowledge, the checkout worker treats the charge as failed and ' +
    'retries it. The provider, however, already accepted the first charge — ' +
    'so the customer is billed twice for one order.',
  'The retry path was added in the Q1 reliability push and never gained an ' +
    'idempotency key, so the provider has no way to deduplicate the second ' +
    'attempt. Support has 14 confirmed double-charge tickets since June 18, ' +
    'all clustered around the provider’s evening maintenance window.',
];

const REPRO_STEPS = [
  'Start a checkout in staging with the `slow-webhook` provider flag on.',
  'Complete payment; the provider delays its webhook past the 10s budget.',
  'Watch the checkout worker log a timeout and schedule a retry.',
  'Inspect the provider dashboard: two identical charges for one order.',
];

const EXPECTED_BEHAVIOR =
  'The retry carries an idempotency key and the provider returns the ' +
  'original charge instead of creating a new one.';
const ACTUAL_BEHAVIOR =
  'A second charge is created; the order ledger records one payment while ' +
  'the provider settles two.';

const ISSUE_LABELS: {id: string; label: string; color: TokenColor}[] = [
  {id: 'label-payments', label: 'payments', color: 'blue'},
  {id: 'label-webhook', label: 'webhook', color: 'purple'},
  {id: 'label-sev2', label: 'sev2', color: 'red'},
  {id: 'label-checkout', label: 'checkout', color: 'teal'},
];

// Watchers excluding the current user; the header Watch toggle adds them.
const BASE_WATCHERS = ['Priya Nair', 'Jordan Ellis', 'Sam Okafor', 'Alex Rivera'];

// ============= SUB-TASKS =============

interface Subtask {
  id: string;
  title: string;
  isDone: boolean;
}

const INITIAL_SUBTASKS: Subtask[] = [
  {
    id: 'subtask-1',
    title: 'Reproduce the double-charge in staging',
    isDone: true,
  },
  {
    id: 'subtask-2',
    title: 'Add idempotency key to charge creation',
    isDone: true,
  },
  {
    id: 'subtask-3',
    title: 'Reject replayed payment webhooks',
    isDone: true,
  },
  {
    id: 'subtask-4',
    title: 'Backfill report of affected orders since June 18',
    isDone: false,
  },
  {
    id: 'subtask-5',
    title: 'Add regression test for the timeout retry path',
    isDone: false,
  },
  {
    id: 'subtask-6',
    title: 'Update the payments on-call runbook',
    isDone: false,
  },
];

// ============= LINKED PULL REQUESTS =============

type PrState = 'open' | 'merged' | 'draft';
type CheckState = 'passed' | 'failed' | 'running';

interface CiCheck {
  id: string;
  name: string;
  state: CheckState;
}

interface LinkedPr {
  id: string;
  number: number;
  title: string;
  branch: string;
  state: PrState;
  checks: CiCheck[];
}

const LINKED_PRS: LinkedPr[] = [
  {
    id: 'pr-4809',
    number: 4809,
    title: 'Reject replayed payment webhooks',
    branch: 'fix/webhook-replay-guard',
    state: 'merged',
    checks: [
      {id: 'pr-4809-build', name: 'build', state: 'passed'},
      {id: 'pr-4809-tests', name: 'tests', state: 'passed'},
      {id: 'pr-4809-lint', name: 'lint', state: 'passed'},
    ],
  },
  {
    id: 'pr-4821',
    number: 4821,
    title: 'Add idempotency key to charge creation',
    branch: 'fix/webhook-idempotency-key',
    state: 'open',
    checks: [
      {id: 'pr-4821-build', name: 'build', state: 'passed'},
      {id: 'pr-4821-tests', name: 'tests', state: 'failed'},
      {id: 'pr-4821-lint', name: 'lint', state: 'passed'},
    ],
  },
  {
    id: 'pr-4830',
    number: 4830,
    title: 'Document double-charge remediation for on-call',
    branch: 'chore/payments-runbook',
    state: 'draft',
    checks: [
      {id: 'pr-4830-build', name: 'build', state: 'passed'},
      {id: 'pr-4830-tests', name: 'tests', state: 'running'},
      {id: 'pr-4830-lint', name: 'lint', state: 'passed'},
    ],
  },
];

const PR_STATE_BADGE: Record<PrState, BadgeVariant> = {
  open: 'green',
  merged: 'purple',
  draft: 'neutral',
};

const PR_STATE_ICON: Record<PrState, IconType> = {
  open: GitPullRequestIcon,
  merged: GitMergeIcon,
  draft: GitPullRequestDraftIcon,
};

const CHECK_DOT: Record<CheckState, StatusDotVariant> = {
  passed: 'success',
  failed: 'error',
  running: 'accent',
};

const CHECK_LABEL: Record<CheckState, string> = {
  passed: 'passing',
  failed: 'failing',
  running: 'running',
};

// ============= ACTIVITY FEED =============
// 8 fixture entries, chronological: 5 system events + 3 comments, one
// comment carrying a reply. All timestamps fixed ISO literals.

interface CommentReply {
  id: string;
  author: string;
  ts: string;
  body: string;
}

interface CommentEntry {
  kind: 'comment';
  id: string;
  author: string;
  ts: string;
  body: string;
}

interface EventEntry {
  kind: 'event';
  id: string;
  actor: string;
  text: string;
  ts: string;
  icon: IconType;
}

type ActivityEntry = CommentEntry | EventEntry;

const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    kind: 'event',
    id: 'event-opened',
    actor: 'Priya Nair',
    text: 'opened this issue',
    ts: '2026-06-24T09:15:00Z',
    icon: CircleDotIcon,
  },
  {
    kind: 'event',
    id: 'event-labels',
    actor: 'Priya Nair',
    text: 'added labels payments, webhook, sev2, checkout',
    ts: '2026-06-24T09:16:00Z',
    icon: TagIcon,
  },
  {
    kind: 'comment',
    id: 'comment-1',
    author: 'Priya Nair',
    ts: '2026-06-24T10:02:00Z',
    body: 'Support volume is climbing — 14 confirmed tickets and finance is reconciling manually. @Maya can this jump the sprint queue? The evening maintenance window makes it reproducible almost on demand.',
  },
  {
    kind: 'event',
    id: 'event-assigned',
    actor: 'Jordan Ellis',
    text: 'assigned this to Maya Chen',
    ts: '2026-06-25T08:40:00Z',
    icon: UserRoundPlusIcon,
  },
  {
    kind: 'event',
    id: 'event-status-progress',
    actor: 'Maya Chen',
    text: 'changed status from Todo to In Progress',
    ts: '2026-06-25T09:05:00Z',
    icon: CircleDotIcon,
  },
  {
    kind: 'comment',
    id: 'comment-2',
    author: 'Maya Chen',
    ts: '2026-06-26T15:44:00Z',
    body: 'Root cause confirmed: the retry path never sends an idempotency key, so the provider treats the second attempt as a fresh charge. Fix is two-sided — key on the request (#4821) and a replay guard on the webhook (#4809). @Jordan sanity-check the ledger backfill query before I run it?',
  },
  {
    kind: 'event',
    id: 'event-linked-pr',
    actor: 'Maya Chen',
    text: 'linked pull request #4821',
    ts: '2026-06-30T11:12:00Z',
    icon: GitPullRequestIcon,
  },
  {
    kind: 'comment',
    id: 'comment-3',
    author: 'Sam Okafor',
    ts: '2026-07-01T11:20:00Z',
    body: 'QA note: the slow-webhook flag now lives under `payments.debug` in staging config. I can verify the fix in the Wednesday window once #4821 lands.',
  },
];

const INITIAL_REPLIES: Record<string, CommentReply[]> = {
  'comment-2': [
    {
      id: 'comment-2-reply-1',
      author: 'Jordan Ellis',
      ts: '2026-06-26T16:30:00Z',
      body: 'Query looks right — just scope it to captured charges so refunds don’t double-count. Approving #4809 now.',
    },
  ],
};

type ActivityFilter = 'all' | 'comments' | 'history';

// ============= @MENTION RENDERING =============

/**
 * Splits a comment body on @mentions and renders each mention as an accent
 * Token so names read as entities, not prose.
 */
function renderBody(body: string): ReactNode[] {
  return body.split(/(@[A-Za-z]+)/g).map((part, index) =>
    part.startsWith('@') ? (
      <Token
        key={`mention-${index}`}
        label={part}
        size="sm"
        color="blue"
        description={`Mention of ${part.slice(1)}`}
      />
    ) : (
      <span key={`text-${index}`}>{part}</span>
    ),
  );
}

// ============= DESCRIPTION =============

function DescriptionSection() {
  return (
    <VStack gap={3}>
      <Heading level={2}>Description</Heading>
      {DESCRIPTION_PARAGRAPHS.map((paragraph, index) => (
        <Text key={`description-${index}`} color="secondary">
          {paragraph}
        </Text>
      ))}

      <Text type="label">Steps to reproduce</Text>
      <VStack gap={1}>
        {REPRO_STEPS.map((step, index) => (
          <HStack key={`step-${index}`} gap={2} vAlign="start">
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={styles.stepNumber}>
              {index + 1}.
            </Text>
            <Text type="supporting">{step}</Text>
          </HStack>
        ))}
      </VStack>

      <HStack gap={2} vAlign="start">
        <Badge variant="green" label="Expected" />
        <Text type="supporting" color="secondary">
          {EXPECTED_BEHAVIOR}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="start">
        <Badge variant="red" label="Actual" />
        <Text type="supporting" color="secondary">
          {ACTUAL_BEHAVIOR}
        </Text>
      </HStack>
    </VStack>
  );
}

// ============= SUB-TASKS =============

function SubtaskSection({
  subtasks,
  newTitle,
  onToggle,
  onNewTitleChange,
  onAdd,
}: {
  subtasks: Subtask[];
  newTitle: string;
  onToggle: (id: string, isDone: boolean) => void;
  onNewTitleChange: (value: string) => void;
  onAdd: () => void;
}) {
  const doneCount = subtasks.filter(subtask => subtask.isDone).length;
  const isComplete = doneCount === subtasks.length;
  const canAdd = newTitle.trim().length > 0;

  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ListChecksIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Sub-tasks</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {doneCount} of {subtasks.length} done
        </Text>
      </HStack>

      <ProgressBar
        label="Sub-task completion"
        isLabelHidden
        value={doneCount}
        max={subtasks.length}
        variant={isComplete ? 'success' : 'accent'}
      />

      {/* md CheckboxInputs keep ~36px rows — comfortable touch targets. */}
      <VStack gap={0}>
        {subtasks.map(subtask => (
          <CheckboxInput
            key={subtask.id}
            label={subtask.title}
            value={subtask.isDone}
            size="md"
            onChange={checked => onToggle(subtask.id, checked)}
          />
        ))}
      </VStack>

      <HStack gap={2} vAlign="end">
        <StackItem size="fill">
          <TextInput
            label="Add a sub-task"
            isLabelHidden
            placeholder="Add a sub-task…"
            value={newTitle}
            onChange={onNewTitleChange}
            onEnter={onAdd}
          />
        </StackItem>
        <Button
          label="Add"
          variant="secondary"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          isDisabled={!canAdd}
          onClick={onAdd}
        />
      </HStack>
    </VStack>
  );
}

// ============= LINKED PULL REQUESTS =============

/** Per-check CI dots; every dot's meaning is mirrored in visible text. */
function CiChecks({checks}: {checks: CiCheck[]}) {
  const passedCount = checks.filter(check => check.state === 'passed').length;
  return (
    <HStack gap={2} vAlign="center">
      <HStack gap={1} vAlign="center">
        {checks.map(check => (
          <StatusDot
            key={check.id}
            variant={CHECK_DOT[check.state]}
            label={`${check.name} ${CHECK_LABEL[check.state]}`}
            tooltip={`${check.name}: ${CHECK_LABEL[check.state]}`}
            isPulsing={check.state === 'running'}
          />
        ))}
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {passedCount}/{checks.length} checks passing
      </Text>
    </HStack>
  );
}

function PullRequestRow({pr, isStacked}: {pr: LinkedPr; isStacked: boolean}) {
  const stateLabel = pr.state === 'merged' ? 'Merged' : pr.state === 'open' ? 'Open' : 'Draft';

  return (
    <div style={styles.prRow}>
      <HStack gap={3} vAlign="start">
        <Icon
          icon={PR_STATE_ICON[pr.state]}
          size="sm"
          color={pr.state === 'merged' ? 'accent' : pr.state === 'open' ? 'green' : 'secondary'}
        />
        <StackItem size="fill" style={styles.truncateCell}>
          <VStack gap={1}>
            <Tooltip content={`#${pr.number} · ${pr.title} · ${pr.branch}`}>
              <Text type="label" maxLines={1}>
                {pr.title}
              </Text>
            </Tooltip>
            <HStack gap={2} vAlign="center" style={styles.metaWrap}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                #{pr.number}
              </Text>
              <span style={styles.branchCode}>
                <Code>{pr.branch}</Code>
              </span>
            </HStack>
            {/* <=640px: the CI summary stacks under the title instead of
                squeezing it off the row. */}
            {isStacked && <CiChecks checks={pr.checks} />}
          </VStack>
        </StackItem>
        {!isStacked && <CiChecks checks={pr.checks} />}
        <Badge variant={PR_STATE_BADGE[pr.state]} label={stateLabel} />
      </HStack>
    </div>
  );
}

function LinkedPrSection({isStacked}: {isStacked: boolean}) {
  return (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={GitPullRequestIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Heading level={2}>Linked pull requests</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {LINKED_PRS.length} linked
        </Text>
      </HStack>
      <div style={styles.prPanel}>
        {LINKED_PRS.map((pr, index) => (
          <VStack key={pr.id} gap={0}>
            <PullRequestRow pr={pr} isStacked={isStacked} />
            {index < LINKED_PRS.length - 1 && <Divider />}
          </VStack>
        ))}
      </div>
    </VStack>
  );
}

// ============= METADATA RAIL =============

function RailMetadata({isWatching}: {isWatching: boolean}) {
  const watchers = isWatching
    ? [...BASE_WATCHERS, CURRENT_USER]
    : BASE_WATCHERS;

  return (
    <MetadataList label={{position: 'start', width: 96}}>
      <MetadataListItem label="Assignee">
        <HStack gap={2} vAlign="center">
          <Avatar name={ISSUE_ASSIGNEE} size="tiny" />
          <Text type="supporting">{ISSUE_ASSIGNEE}</Text>
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Reporter">
        <HStack gap={2} vAlign="center">
          <Avatar name={ISSUE_REPORTER} size="tiny" />
          <Text type="supporting">{ISSUE_REPORTER}</Text>
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Labels">
        <HStack gap={1} vAlign="center" style={styles.labelsWrap}>
          {ISSUE_LABELS.map(label => (
            <Token
              key={label.id}
              label={label.label}
              size="sm"
              color={label.color}
            />
          ))}
        </HStack>
      </MetadataListItem>
      <MetadataListItem label="Sprint">
        <Text type="supporting">{ISSUE_SPRINT}</Text>
      </MetadataListItem>
      <MetadataListItem label="Estimate">
        <Code>{ISSUE_ESTIMATE}</Code>
      </MetadataListItem>
      <MetadataListItem label="Watchers">
        <HStack gap={2} vAlign="center">
          <AvatarGroup size="tiny" aria-label="Watchers">
            {watchers.map(name => (
              <Avatar key={name} name={name} size="tiny" />
            ))}
          </AvatarGroup>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {watchers.length} watching
          </Text>
        </HStack>
      </MetadataListItem>
    </MetadataList>
  );
}

// ============= ACTIVITY FEED =============

function SystemEventRow({event}: {event: EventEntry}) {
  return (
    <HStack gap={3} vAlign="center">
      <div style={styles.eventIconCircle}>
        <Icon icon={event.icon} size="sm" color="secondary" />
      </div>
      <StackItem size="fill" style={styles.truncateCell}>
        <Text type="supporting" color="secondary">
          <Text type="supporting" weight="bold">
            {event.actor}
          </Text>{' '}
          {event.text}
        </Text>
      </StackItem>
      <Timestamp value={event.ts} format="date_time" type="supporting" />
    </HStack>
  );
}

function CommentCard({
  comment,
  replies,
  isReplyOpen,
  replyDraft,
  onToggleReply,
  onReplyDraftChange,
  onSendReply,
}: {
  comment: CommentEntry;
  replies: CommentReply[];
  isReplyOpen: boolean;
  replyDraft: string;
  onToggleReply: (id: string) => void;
  onReplyDraftChange: (id: string, value: string) => void;
  onSendReply: (id: string) => void;
}) {
  const canSend = replyDraft.trim().length > 0;

  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={comment.author} size="xsmall" />
          <StackItem size="fill">
            <HStack gap={2} vAlign="center" style={styles.metaWrap}>
              <Text type="body" weight="bold">
                {comment.author}
              </Text>
              <Timestamp value={comment.ts} format="date_time" />
            </HStack>
          </StackItem>
          <Button
            label={isReplyOpen ? 'Cancel' : 'Reply'}
            variant="ghost"
            size="sm"
            icon={<Icon icon={ReplyIcon} size="sm" color="inherit" />}
            onClick={() => onToggleReply(comment.id)}
          />
        </HStack>

        <Text type="body" style={styles.commentBody}>
          {renderBody(comment.body)}
        </Text>

        {replies.length > 0 && (
          <VStack gap={2} style={styles.replyIndent}>
            {replies.map(reply => (
              <VStack key={reply.id} gap={1}>
                <HStack gap={2} vAlign="center">
                  <Avatar name={reply.author} size="xsmall" />
                  <Text type="supporting" weight="bold">
                    {reply.author}
                  </Text>
                  <Timestamp value={reply.ts} format="date_time" />
                </HStack>
                <Text type="supporting" style={styles.commentBody}>
                  {renderBody(reply.body)}
                </Text>
              </VStack>
            ))}
          </VStack>
        )}

        {/* Inline reply composer, opened per comment. */}
        {isReplyOpen && (
          <>
            <Divider />
            <VStack gap={2}>
              <TextArea
                label={`Reply to ${comment.author}`}
                isLabelHidden
                placeholder="Reply — use @ to mention"
                rows={2}
                value={replyDraft}
                onChange={value => onReplyDraftChange(comment.id, value)}
              />
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    Replying as {CURRENT_USER}
                  </Text>
                </StackItem>
                <Button
                  label="Send"
                  variant="primary"
                  icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                  isDisabled={!canSend}
                  onClick={() => onSendReply(comment.id)}
                />
              </HStack>
            </VStack>
          </>
        )}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function IssueDetailTemplate() {
  const [status, setStatus] = useState<StatusId>(INITIAL_STATUS);
  const [isWatching, setIsWatching] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>(INITIAL_SUBTASKS);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [repliesById, setRepliesById] =
    useState<Record<string, CommentReply[]>>(INITIAL_REPLIES);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [commentDraft, setCommentDraft] = useState('');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  // Responsive contract: <=960px the metadata rail stacks into a collapsible
  // Details card; <=640px header chrome wraps and PR rows stack CI summaries.
  const isRailStacked = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- derived state ----
  const activeStatus = statusById(status);
  const commentCount = activity.filter(
    entry => entry.kind === 'comment',
  ).length;
  const visibleActivity = activity.filter(entry =>
    filter === 'all'
      ? true
      : filter === 'comments'
        ? entry.kind === 'comment'
        : entry.kind === 'event',
  );

  // ---- interactions ----
  /** Status edits are real: swap the value AND append a system event. */
  const changeStatus = (nextId: StatusId) => {
    if (nextId === status) {
      return;
    }
    const previous = statusById(status);
    const next = statusById(nextId);
    setStatus(nextId);
    setActivity(prev => [
      ...prev,
      {
        kind: 'event',
        id: `event-status-${prev.length + 1}`,
        actor: CURRENT_USER,
        text: `changed status from ${previous.label} to ${next.label}`,
        ts: NOW_TIMESTAMP,
        icon: CircleDotIcon,
      },
    ]);
  };

  const toggleSubtask = (id: string, isDone: boolean) => {
    setSubtasks(prev =>
      prev.map(subtask =>
        subtask.id === id ? {...subtask, isDone} : subtask,
      ),
    );
  };

  const addSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (title.length === 0) {
      return;
    }
    setSubtasks(prev => [
      ...prev,
      {id: `subtask-${prev.length + 1}`, title, isDone: false},
    ]);
    setNewSubtaskTitle('');
  };

  const toggleReplyComposer = (id: string) => {
    setActiveReplyId(prev => (prev === id ? null : id));
  };

  const setReplyDraft = (id: string, value: string) => {
    setReplyDrafts(prev => ({...prev, [id]: value}));
  };

  /** Replies append with the fixed literal timestamp, then close the composer. */
  const sendReply = (id: string) => {
    const body = (replyDrafts[id] ?? '').trim();
    if (body.length === 0) {
      return;
    }
    setRepliesById(prev => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          id: `${id}-reply-${(prev[id] ?? []).length + 1}`,
          author: CURRENT_USER,
          ts: NOW_TIMESTAMP,
          body,
        },
      ],
    }));
    setReplyDrafts(prev => ({...prev, [id]: ''}));
    setActiveReplyId(null);
  };

  /** New top-level comments append at the feed's end with the fixed literal. */
  const sendComment = () => {
    const body = commentDraft.trim();
    if (body.length === 0) {
      return;
    }
    setActivity(prev => [
      ...prev,
      {
        kind: 'comment',
        id: `comment-${prev.length + 1}`,
        author: CURRENT_USER,
        ts: NOW_TIMESTAMP,
        body,
      },
    ]);
    setCommentDraft('');
  };

  // ---- header ----
  const statusSelector = (
    <Selector
      label="Status"
      isLabelHidden
      size="md"
      width={isCompact ? '100%' : 180}
      value={status}
      onChange={value => changeStatus(value as StatusId)}
      startIcon={
        <StatusDot
          variant={activeStatus.dot}
          label={`Status: ${activeStatus.label}`}
        />
      }
      options={STATUSES.map(statusDef => ({
        value: statusDef.id,
        label: statusDef.label,
        icon: (
          <StatusDot variant={statusDef.dot} label={statusDef.label} />
        ),
      }))}
    />
  );

  const watchButton = (
    <Button
      label={isWatching ? 'Watching' : 'Watch'}
      variant={isWatching ? 'secondary' : 'ghost'}
      icon={
        <Icon
          icon={isWatching ? EyeIcon : EyeOffIcon}
          size="sm"
          color="inherit"
        />
      }
      onClick={() => setIsWatching(prev => !prev)}
    />
  );

  const identityCluster = (
    <HStack gap={2} vAlign="center" style={styles.headerWrap}>
      <IconButton
        label="Back to board"
        tooltip="Back to board"
        icon={<Icon icon="chevronLeft" size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => {}}
      />
      <Code>{ISSUE_KEY}</Code>
      <Badge
        variant="red"
        label="Bug"
        icon={<Icon icon={BugIcon} size="xsm" color="inherit" />}
      />
      <Tooltip content="Priority: High — fix in the current sprint">
        <Badge
          variant="orange"
          label="High"
          icon={<Icon icon={ChevronsUpIcon} size="xsm" color="inherit" />}
        />
      </Tooltip>
    </HStack>
  );

  // ---- activity ----
  const activityFeed = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center" style={styles.headerWrap}>
        <StackItem size="fill">
          <Heading level={2}>Activity</Heading>
        </StackItem>
        <SegmentedControl
          label="Filter activity"
          value={filter}
          onChange={value => setFilter(value as ActivityFilter)}
          size="sm">
          <SegmentedControlItem value="all" label="All" />
          <SegmentedControlItem
            value="comments"
            label={`Comments (${commentCount})`}
          />
          <SegmentedControlItem value="history" label="History" />
        </SegmentedControl>
      </HStack>

      <VStack gap={3}>
        {visibleActivity.map(entry =>
          entry.kind === 'event' ? (
            <SystemEventRow key={entry.id} event={entry} />
          ) : (
            <CommentCard
              key={entry.id}
              comment={entry}
              replies={repliesById[entry.id] ?? []}
              isReplyOpen={activeReplyId === entry.id}
              replyDraft={replyDrafts[entry.id] ?? ''}
              onToggleReply={toggleReplyComposer}
              onReplyDraftChange={setReplyDraft}
              onSendReply={sendReply}
            />
          ),
        )}
      </VStack>

      {/* New-comment composer: md Send keeps a ~40px tap target. */}
      <Card padding={3}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Avatar name={CURRENT_USER} size="xsmall" />
            <Text type="label">Add a comment</Text>
          </HStack>
          <TextArea
            label="New comment"
            isLabelHidden
            placeholder="Comment — use @ to mention"
            rows={3}
            value={commentDraft}
            onChange={setCommentDraft}
          />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Commenting as {CURRENT_USER}
              </Text>
            </StackItem>
            <Button
              label="Send"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={commentDraft.trim().length === 0}
              onClick={sendComment}
            />
          </HStack>
        </VStack>
      </Card>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={styles.headerWrap}>
            <StackItem size={isCompact ? undefined : 'fill'}>
              {identityCluster}
            </StackItem>
            {/* <=640px: the editable controls take their own full-width row
                under the key/badge cluster instead of clipping. */}
            {isCompact ? (
              <HStack
                gap={2}
                vAlign="center"
                style={styles.headerControlsRow}>
                <StackItem size="fill">{statusSelector}</StackItem>
                {watchButton}
              </HStack>
            ) : (
              <HStack gap={2} vAlign="center">
                {statusSelector}
                {watchButton}
              </HStack>
            )}
          </HStack>
        </LayoutHeader>
      }
      end={
        isRailStacked ? undefined : (
          <LayoutPanel width={300} padding={0} label="Issue details">
            <div style={styles.railScroll}>
              <VStack gap={3}>
                <Heading level={2}>Details</Heading>
                <RailMetadata isWatching={isWatching} />
              </VStack>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent>
          <div style={styles.column}>
            <VStack gap={4}>
              <VStack gap={2}>
                <Heading level={1}>{ISSUE_TITLE}</Heading>
                <HStack gap={2} vAlign="center" style={styles.metaWrap}>
                  <Avatar name={ISSUE_REPORTER} size="tiny" />
                  <Text type="supporting" color="secondary">
                    Opened by {ISSUE_REPORTER}
                  </Text>
                  <Timestamp
                    value={ISSUE_OPENED}
                    format="date_time"
                    type="supporting"
                    color="secondary"
                  />
                  <Text type="supporting" color="secondary">
                    · {ISSUE_SPRINT}
                  </Text>
                </HStack>
              </VStack>

              {/* <=960px: the rail's single-pane fallback — a collapsible
                  Details card, closed so the description stays above the
                  fold. */}
              {isRailStacked && (
                <Card padding={3}>
                  <Collapsible
                    defaultIsOpen={false}
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={PanelRightIcon}
                          size="sm"
                          color="secondary"
                        />
                        <Text type="label">Details</Text>
                        <Text type="supporting" color="secondary">
                          assignee, labels, sprint, watchers
                        </Text>
                      </HStack>
                    }>
                    <RailMetadata isWatching={isWatching} />
                  </Collapsible>
                </Card>
              )}

              <DescriptionSection />
              <Divider />
              <SubtaskSection
                subtasks={subtasks}
                newTitle={newSubtaskTitle}
                onToggle={toggleSubtask}
                onNewTitleChange={setNewSubtaskTitle}
                onAdd={addSubtask}
              />
              <Divider />
              <LinkedPrSection isStacked={isCompact} />
              <Divider />
              {activityFeed}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
