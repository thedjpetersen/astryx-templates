var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (15 agent-session cards across five
 *   lanes with priorities, workspaces, live tool-activity chips, and short
 *   per-session chat threads; workspace filter options; fixed relative-time
 *   labels)
 * @output "Mission Control" agent-work kanban: header with workspace
 *   Selector, live counter strip (pulsing StatusDots for active/review),
 *   and a chat drawer toggle; five lanes (Ideas / Inbox / In Progress /
 *   Review / Done) whose In Progress and Review lanes carry a colored glow;
 *   TaskCards show model + updated meta, priority Badge, workspace Token,
 *   and — on in-progress cards — a live activity chip (tool icon, action
 *   text, tool-count Badge, one error-tinted specimen); a kebab MoreMenu
 *   moves cards between lanes, sets priority, and archives; selecting a
 *   card opens a 380px chat drawer with the session mini-thread (You/Agent
 *   bubbles + a tool chip with exit-code footer), Approve/Reject when the
 *   card sits in Review, and a working reply composer
 * @position Page template; emitted by \`astryx template mission-control-kanban\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (Heading,
 * workspace Selector, live counters, chat toggle). LayoutContent (padding
 * 0) hosts the horizontal lane scroller; the chat drawer is a LayoutPanel
 * in the \`end\` slot. Unlike the generic kanban-board template (a product
 * delivery board), every card here is a live agent session — the lanes
 * glow with activity, cards stream tool chips, and the drawer is a
 * conversation with the agent, not a task detail pane.
 *
 * Responsive contract (measured with a local ResizeObserver — viewport
 * media queries never fire in the inline demo stage):
 * - >760px: board + optional 380px end-panel drawer side by side; the
 *   live counter strip shows between the Selector and the chat toggle.
 * - <=760px: the counter strip collapses to the two pulsing counts; when
 *   the drawer is open it replaces the board full-width with a Back to
 *   board button. Lanes are always a horizontal scroller (fixed 276px
 *   columns), so the board itself never reflows.
 */

import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu, type MoreMenuProps} from '@astryxdesign/core/MoreMenu';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  SearchIcon,
  SquarePenIcon,
  TerminalIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {height: '100%'},
  board: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    height: '100%',
    overflowX: 'auto',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  lane: {
    display: 'flex',
    flexDirection: 'column',
    width: 276,
    flexShrink: 0,
    minHeight: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    borderTop: '2px solid var(--color-border)',
  },
  laneHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  laneTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontSize: 11,
  },
  laneBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  laneEmpty: {
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4) var(--spacing-2)',
    textAlign: 'center',
  },
  cardWrap: {
    borderRadius: 'var(--radius-container)',
    marginBottom: 'var(--spacing-2)',
  },
  cardWrapSelected: {
    boxShadow: '0 0 0 2px var(--color-accent)',
  },
  cardWrapError: {
    boxShadow: '0 0 0 1px var(--color-error)',
  },
  cardTitleCell: {minWidth: 0},
  // Live activity chip — the signature difference from a plain task tile:
  // this row is the agent working *right now*.
  activityChip: {
    backgroundColor: 'var(--color-success-muted)',
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  activityChipError: {
    backgroundColor: 'var(--color-error-muted)',
  },
  activityText: {minWidth: 0},
  // Chat drawer.
  drawer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  drawerHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
  },
  drawerThread: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  drawerFooter: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
  },
  bubbleYou: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
    backgroundColor: 'var(--color-accent-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  bubbleAgent: {
    alignSelf: 'flex-start',
    maxWidth: '85%',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  toolChip: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2)',
  },
  toolChipCommand: {minWidth: 0},
  toolChipExit: {color: 'var(--color-success)'},
  reviewBar: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-warning-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  drawerEmpty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-4)',
  },
  compactBackBar: {
    padding: 'var(--spacing-2) var(--spacing-3) 0',
  },
};

// ============= RESPONSIVE HELPER =============
// The demo renders pages in an inline stage narrower than the viewport,
// so media queries never fire there — measure our own width instead.

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
// Deterministic fixtures: fixed relative-time labels, no clocks, no
// randomness. Model names are invented (relay-ultra / relay-swift).

type LaneId = 'ideas' | 'inbox' | 'progress' | 'review' | 'done';
type Priority = 'high' | 'medium' | 'low';
type WorkspaceId = 'atlas' | 'personal';
type ActivityKind = 'bash' | 'edit' | 'search';

interface LaneConfig {
  id: LaneId;
  label: string;
  barColor: string;
  glow?: string;
}

const LANES: LaneConfig[] = [
  {id: 'ideas', label: 'Ideas', barColor: 'var(--color-icon-blue)'},
  {id: 'inbox', label: 'Inbox', barColor: 'var(--color-border-emphasized)'},
  {
    id: 'progress',
    label: 'In Progress',
    barColor: 'var(--color-success)',
    glow: '0 0 14px var(--color-success-muted)',
  },
  {
    id: 'review',
    label: 'Review',
    barColor: 'var(--color-warning)',
    glow: '0 0 14px var(--color-warning-muted)',
  },
  {id: 'done', label: 'Done', barColor: 'var(--color-border)'},
];

const WORKSPACE_OPTIONS = [
  {value: 'all', label: 'All Workspaces'},
  {value: 'atlas', label: 'Atlas'},
  {value: 'personal', label: 'Personal'},
];

const WORKSPACE_META: Record<
  WorkspaceId,
  {label: string; color: 'blue' | 'purple'}
> = {
  atlas: {label: 'Atlas', color: 'blue'},
  personal: {label: 'Personal', color: 'purple'},
};

const PRIORITY_META: Record<
  Priority,
  {label: string; variant: 'error' | 'warning' | 'neutral'}
> = {
  high: {label: 'High', variant: 'error'},
  medium: {label: 'Medium', variant: 'warning'},
  low: {label: 'Low', variant: 'neutral'},
};

const ACTIVITY_ICON: Record<ActivityKind, typeof TerminalIcon> = {
  bash: TerminalIcon,
  edit: SquarePenIcon,
  search: SearchIcon,
};

interface ThreadEntry {
  id: string;
  kind: 'you' | 'agent' | 'tool';
  text: string;
  tool?: {command: string; exit: string; duration: string};
}

interface SessionCard {
  id: string;
  sessionId: string;
  title: string;
  model: string;
  updated: string;
  lane: LaneId;
  priority: Priority;
  workspace: WorkspaceId;
  activity?: {kind: ActivityKind; text: string; toolCount: number};
  hasError?: boolean;
  thread: ThreadEntry[];
}

const CARDS: SessionCard[] = [
  // ---- Ideas ----
  {
    id: 't-01',
    sessionId: '9f2c41ab',
    title: 'Cluster flaky test signatures across repos',
    model: 'relay-swift',
    updated: '2d ago',
    lane: 'ideas',
    priority: 'low',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-01a',
        kind: 'you',
        text: 'Idea: group flaky test failures by stack signature so we stop re-triaging the same breakage.',
      },
      {
        id: 'm-01b',
        kind: 'agent',
        text: 'Parked. When you start this I would begin with the last 30 days of CI logs from atlas/api and atlas/web.',
      },
    ],
  },
  {
    id: 't-02',
    sessionId: '4b8e17cd',
    title: 'Auto-draft release notes from merged PRs',
    model: 'relay-ultra',
    updated: '1d ago',
    lane: 'ideas',
    priority: 'medium',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-02a',
        kind: 'you',
        text: 'Sketch a weekly release-notes draft from merged PR titles and labels.',
      },
      {
        id: 'm-02b',
        kind: 'agent',
        text: 'I can template this on the changelog format in docs/RELEASING.md. Want it posted as a draft or opened as a PR?',
      },
    ],
  },
  {
    id: 't-03',
    sessionId: 'c7d0932e',
    title: 'Personal finance export cleanup',
    model: 'relay-swift',
    updated: '3d ago',
    lane: 'ideas',
    priority: 'low',
    workspace: 'personal',
    thread: [
      {
        id: 'm-03a',
        kind: 'you',
        text: 'Normalize the bank CSV exports in ~/finance/2026 — column names drift month to month.',
      },
      {
        id: 'm-03b',
        kind: 'agent',
        text: 'Noted. I will propose a canonical schema before touching any files.',
      },
    ],
  },
  {
    id: 't-04',
    sessionId: '2ae65f90',
    title: 'Summarize on-call handoff every Friday',
    model: 'relay-ultra',
    updated: '5h ago',
    lane: 'ideas',
    priority: 'medium',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-04a',
        kind: 'you',
        text: 'Recurring idea: a Friday 4pm digest of open incidents and paged alerts for the next on-call.',
      },
      {
        id: 'm-04b',
        kind: 'agent',
        text: 'This fits a schedule. I drafted the digest sections — promote to Inbox when you want me to wire it up.',
      },
    ],
  },
  // ---- Inbox ----
  {
    id: 't-05',
    sessionId: '7d31b6e4',
    title: 'Triage: webhook retries exhausted for billing',
    model: 'relay-ultra',
    updated: '18m ago',
    lane: 'inbox',
    priority: 'high',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-05a',
        kind: 'agent',
        text: 'Billing webhooks to stripe-bridge have exhausted retries 41 times since 09:00. I need a decision: replay the dead-letter queue or pause the endpoint first?',
      },
      {
        id: 'm-05b',
        kind: 'tool',
        text: 'bash',
        tool: {
          command: 'kv queue stats billing-webhooks --since 09:00',
          exit: 'exit 0',
          duration: '0.8s',
        },
      },
    ],
  },
  {
    id: 't-06',
    sessionId: 'e19a58c2',
    title: 'Reply to security questionnaire draft',
    model: 'relay-swift',
    updated: '1h ago',
    lane: 'inbox',
    priority: 'medium',
    workspace: 'personal',
    thread: [
      {
        id: 'm-06a',
        kind: 'agent',
        text: 'The vendor questionnaire draft is ready in memory/security-q.md. Two answers are marked NEEDS-INPUT: data retention window and subprocessor list.',
      },
    ],
  },
  // ---- In Progress ----
  {
    id: 't-07',
    sessionId: 'a1b2c3d4',
    title: 'Fix flaky checkout deploy checks',
    model: 'relay-ultra',
    updated: '2m ago',
    lane: 'progress',
    priority: 'high',
    workspace: 'atlas',
    activity: {kind: 'bash', text: 'bash — running tests on laptop', toolCount: 12},
    thread: [
      {
        id: 'm-07a',
        kind: 'you',
        text: 'Deploy checks for checkout flake about once in five runs. Find the root cause and fix it.',
      },
      {
        id: 'm-07b',
        kind: 'agent',
        text: 'Reproduced: the health probe races the warm-up on cold pods. I widened the readiness window and am re-running the full check suite 20x to confirm.',
      },
      {
        id: 'm-07c',
        kind: 'tool',
        text: 'bash',
        tool: {
          command: 'pnpm test:deploy-checks --repeat 20',
          exit: 'exit 0',
          duration: '3m 12s',
        },
      },
    ],
  },
  {
    id: 't-08',
    sessionId: '5c9df021',
    title: 'Migrate session store to KV',
    model: 'relay-ultra',
    updated: '12m ago',
    lane: 'progress',
    priority: 'medium',
    workspace: 'atlas',
    activity: {kind: 'edit', text: 'edit — Editing api.ts', toolCount: 7},
    thread: [
      {
        id: 'm-08a',
        kind: 'you',
        text: 'Move session reads to the KV store behind the flag, writes dual-path for a week.',
      },
      {
        id: 'm-08b',
        kind: 'agent',
        text: 'Dual-write shim is in. Now editing api.ts to route reads through the flag — 3 call sites left.',
      },
    ],
  },
  {
    id: 't-09',
    sessionId: 'f4e8a7b3',
    title: 'Backfill invoice PDFs (June)',
    model: 'relay-swift',
    updated: '4m ago',
    lane: 'progress',
    priority: 'medium',
    workspace: 'personal',
    activity: {kind: 'bash', text: 'bash — pdf render failing (exit 1)', toolCount: 21},
    hasError: true,
    thread: [
      {
        id: 'm-09a',
        kind: 'you',
        text: 'Regenerate the June invoice PDFs with the new letterhead.',
      },
      {
        id: 'm-09b',
        kind: 'tool',
        text: 'bash',
        tool: {
          command: 'node scripts/render-invoice.js --month 2026-06',
          exit: 'exit 1',
          duration: '4.6s',
        },
      },
      {
        id: 'm-09c',
        kind: 'agent',
        text: 'The renderer crashes on invoices with more than one page of line items — the letterhead SVG collides with the table header. Trying a fixed-height header region next.',
      },
    ],
  },
  // ---- Review ----
  {
    id: 't-10',
    sessionId: '8b6c0d5f',
    title: 'Rotate stale API tokens',
    model: 'relay-ultra',
    updated: '26m ago',
    lane: 'review',
    priority: 'high',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-10a',
        kind: 'you',
        text: 'Rotate every service token older than 90 days. List them before revoking anything.',
      },
      {
        id: 'm-10b',
        kind: 'tool',
        text: 'bash',
        tool: {
          command: 'atlasctl tokens list --older-than 90d',
          exit: 'exit 0',
          duration: '1.2s',
        },
      },
      {
        id: 'm-10c',
        kind: 'agent',
        text: 'Found 6 stale tokens. New tokens are minted and staged; the old ones revoke on your approval. Two belong to the metrics exporter, so expect a 30s gap in dashboards during cutover.',
      },
    ],
  },
  {
    id: 't-11',
    sessionId: '3d72e9a8',
    title: 'Draft Q3 infra budget summary',
    model: 'relay-swift',
    updated: '1h ago',
    lane: 'review',
    priority: 'low',
    workspace: 'personal',
    thread: [
      {
        id: 'm-11a',
        kind: 'agent',
        text: 'Draft is ready: spend is up 8% QoQ, driven almost entirely by the sandbox pool. I flagged two reserved-capacity options in the appendix. Approve to send to your notes.',
      },
    ],
  },
  // ---- Done ----
  {
    id: 't-12',
    sessionId: '0c4f91d7',
    title: 'Upgrade CI runners to Node 22',
    model: 'relay-ultra',
    updated: '3h ago',
    lane: 'done',
    priority: 'medium',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-12a',
        kind: 'agent',
        text: 'All 4 runner pools upgraded and green for 12 consecutive builds. Rollback image kept for 7 days.',
      },
    ],
  },
  {
    id: 't-13',
    sessionId: '6a5b3c8e',
    title: 'De-dupe alert routing rules',
    model: 'relay-swift',
    updated: '6h ago',
    lane: 'done',
    priority: 'low',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-13a',
        kind: 'agent',
        text: 'Collapsed 58 routing rules to 31. Every alert from the last 30 days still routes to the same channel — verification table in the session.',
      },
    ],
  },
  {
    id: 't-14',
    sessionId: 'b9e2f6a0',
    title: 'Archive stale feature flags',
    model: 'relay-swift',
    updated: '1d ago',
    lane: 'done',
    priority: 'low',
    workspace: 'atlas',
    thread: [
      {
        id: 'm-14a',
        kind: 'agent',
        text: '14 flags fully rolled out for 60+ days were archived; 3 kept because they gate the sandbox pool experiment.',
      },
    ],
  },
  {
    id: 't-15',
    sessionId: 'd8137c5b',
    title: 'Book travel for platform offsite',
    model: 'relay-swift',
    updated: '2d ago',
    lane: 'done',
    priority: 'low',
    workspace: 'personal',
    thread: [
      {
        id: 'm-15a',
        kind: 'agent',
        text: 'Flights and hotel held under the options you approved. Confirmation numbers are in memory/travel-offsite.md.',
      },
    ],
  },
];

const CARD_BY_ID = new Map(CARDS.map(card => [card.id, card]));

const INITIAL_LANES: Record<string, LaneId> = Object.fromEntries(
  CARDS.map(card => [card.id, card.lane]),
);

const INITIAL_PRIORITIES: Record<string, Priority> = Object.fromEntries(
  CARDS.map(card => [card.id, card.priority]),
);

// ============= TASK CARD =============

function ActivityChip({card}: {card: SessionCard}) {
  if (card.activity == null) {
    return null;
  }
  const isError = card.hasError === true;
  return (
    <div
      style={{
        ...styles.activityChip,
        ...(isError ? styles.activityChipError : undefined),
      }}>
      <HStack gap={2} vAlign="center">
        <StatusDot
          variant={isError ? 'error' : 'success'}
          label={isError ? 'Tool failing' : 'Agent working'}
          isPulsing
        />
        <Icon
          icon={ACTIVITY_ICON[card.activity.kind]}
          size="sm"
          color="secondary"
        />
        <StackItem size="fill" style={styles.activityText}>
          <Text type="code" size="sm" maxLines={1}>
            {card.activity.text}
          </Text>
        </StackItem>
        <Badge
          label={\`\${card.activity.toolCount} tools\`}
          variant={isError ? 'error' : 'neutral'}
        />
      </HStack>
    </div>
  );
}

function TaskCard({
  card,
  lane,
  priority,
  isSelected,
  onSelect,
  onMove,
  onSetPriority,
  onArchive,
}: {
  card: SessionCard;
  lane: LaneId;
  priority: Priority;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, lane: LaneId) => void;
  onSetPriority: (id: string, priority: Priority) => void;
  onArchive: (id: string) => void;
}) {
  const menuItems: MoreMenuProps['items'] = [
    {label: 'Open in chat', onClick: () => onSelect(card.id)},
    {label: 'Rename', onClick: () => {}},
    {label: 'Copy session ID', onClick: () => {}},
    {
      type: 'section',
      title: 'Move to lane',
      items: LANES.filter(item => item.id !== lane).map(item => ({
        label: item.label,
        onClick: () => onMove(card.id, item.id),
      })),
    },
    {
      type: 'section',
      title: 'Set priority',
      items: (['high', 'medium', 'low'] as Priority[]).map(level => ({
        label: PRIORITY_META[level].label,
        isDisabled: level === priority,
        onClick: () => onSetPriority(card.id, level),
      })),
    },
    {type: 'divider'},
    {label: 'Archive', onClick: () => onArchive(card.id)},
  ];

  return (
    <div
      style={{
        ...styles.cardWrap,
        ...(isSelected ? styles.cardWrapSelected : undefined),
        ...(card.hasError === true && !isSelected
          ? styles.cardWrapError
          : undefined),
      }}>
      <ClickableCard
        label={\`Open session: \${card.title}\`}
        padding={3}
        width="100%"
        variant={lane === 'done' ? 'muted' : 'default'}
        onClick={() => onSelect(card.id)}>
        <VStack gap={2}>
          <HStack gap={1} vAlign="start">
            <StackItem size="fill" style={styles.cardTitleCell}>
              <Text type="label" size="sm" maxLines={2}>
                {card.title}
              </Text>
            </StackItem>
            <MoreMenu
              label={\`Actions for \${card.title}\`}
              size="sm"
              items={menuItems}
            />
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {card.model} · {card.updated}
          </Text>
          <HStack gap={1} vAlign="center">
            <Badge
              label={PRIORITY_META[priority].label}
              variant={PRIORITY_META[priority].variant}
            />
            <Token
              label={WORKSPACE_META[card.workspace].label}
              size="sm"
              color={WORKSPACE_META[card.workspace].color}
            />
          </HStack>
          {lane === 'progress' && <ActivityChip card={card} />}
        </VStack>
      </ClickableCard>
    </div>
  );
}

// ============= CHAT DRAWER =============

function ThreadBubble({entry}: {entry: ThreadEntry}) {
  if (entry.kind === 'tool' && entry.tool != null) {
    return (
      <div style={styles.toolChip}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={TerminalIcon} size="sm" color="secondary" />
            <Text type="code" size="sm">
              {entry.text}
            </Text>
            <StackItem size="fill" style={styles.toolChipCommand}>
              <Text type="code" size="sm" color="secondary" maxLines={1}>
                {entry.tool.command}
              </Text>
            </StackItem>
          </HStack>
          <Text
            type="supporting"
            hasTabularNumbers
            style={
              entry.tool.exit === 'exit 0' ? styles.toolChipExit : undefined
            }
            color={entry.tool.exit === 'exit 0' ? undefined : 'secondary'}>
            {entry.tool.exit === 'exit 0' ? '✔' : '✗'} {entry.tool.exit} ·{' '}
            {entry.tool.duration}
          </Text>
        </VStack>
      </div>
    );
  }
  const isYou = entry.kind === 'you';
  return (
    <div style={isYou ? styles.bubbleYou : styles.bubbleAgent}>
      <VStack gap={0.5}>
        <Text type="supporting" size="sm" color="secondary">
          {isYou ? 'You' : 'Agent'}
        </Text>
        <Text size="sm">{entry.text}</Text>
      </VStack>
    </div>
  );
}

function ChatDrawer({
  card,
  lane,
  replies,
  onClose,
  onApprove,
  onReject,
  onReply,
}: {
  card: SessionCard | null;
  lane: LaneId | null;
  replies: string[];
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onReply: (id: string, text: string) => void;
}) {
  const [draft, setDraft] = useState('');

  if (card == null || lane == null) {
    return (
      <div style={styles.drawer}>
        <div style={styles.drawerEmpty}>
          <EmptyState
            title="No session selected"
            description="Select a card on the board to open its agent thread."
            icon={<Icon icon={MessageSquareIcon} size="lg" color="secondary" />}
            isCompact
          />
        </div>
      </div>
    );
  }

  const laneLabel = LANES.find(item => item.id === lane)?.label ?? lane;

  const sendReply = () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    onReply(card.id, text);
    setDraft('');
  };

  return (
    <div style={styles.drawer}>
      <div style={styles.drawerHeader}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="start">
            <StackItem size="fill" style={styles.cardTitleCell}>
              <VStack gap={0.5}>
                <Text type="label" maxLines={1}>
                  {card.title}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {card.model} · {card.updated} · {card.sessionId}
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label="Close chat drawer"
              tooltip="Close"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={onClose}
            />
          </HStack>
          <HStack gap={2} vAlign="center">
            <Button label="Open" variant="ghost" size="sm" onClick={() => {}} />
            <Button
              label="TeamChat"
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
            <StackItem size="fill" />
            <Badge label={laneLabel} variant="neutral" />
          </HStack>
        </VStack>
      </div>
      <Divider />
      <div style={styles.drawerThread}>
        <VStack gap={2}>
          {card.thread.map(entry => (
            <ThreadBubble key={entry.id} entry={entry} />
          ))}
          {replies.map((text, index) => (
            <ThreadBubble
              key={\`reply-\${card.id}-\${index}\`}
              entry={{id: \`reply-\${index}\`, kind: 'you', text}}
            />
          ))}
        </VStack>
      </div>
      {lane === 'review' && (
        <div style={styles.reviewBar}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting">Agent is waiting on your review</Text>
            </StackItem>
            <Button
              label="Reject"
              variant="destructive"
              size="sm"
              onClick={() => onReject(card.id)}
            />
            <Button
              label="Approve"
              size="sm"
              onClick={() => onApprove(card.id)}
            />
          </HStack>
        </div>
      )}
      <div style={styles.drawerFooter}>
        <VStack gap={2}>
          <TextArea
            label={\`Reply to agent on \${card.title}\`}
            isLabelHidden
            rows={2}
            placeholder="Reply to agent…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Replies queue while the agent is running
            </Text>
            <StackItem size="fill" />
            <Button label="Send" size="sm" onClick={sendReply} />
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MissionControlKanbanTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 760;

  const [laneById, setLaneById] = useState<Record<string, LaneId>>(
    INITIAL_LANES,
  );
  const [priorityById, setPriorityById] = useState<Record<string, Priority>>(
    INITIAL_PRIORITIES,
  );
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [workspace, setWorkspace] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>('t-10');
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [repliesById, setRepliesById] = useState<Record<string, string[]>>({});

  const visibleCards = useMemo(
    () =>
      CARDS.filter(
        card =>
          !archivedIds.includes(card.id) &&
          (workspace === 'all' || card.workspace === workspace),
      ),
    [archivedIds, workspace],
  );

  const laneCards = useMemo(() => {
    const byLane: Record<LaneId, SessionCard[]> = {
      ideas: [],
      inbox: [],
      progress: [],
      review: [],
      done: [],
    };
    for (const card of visibleCards) {
      byLane[laneById[card.id] ?? card.lane].push(card);
    }
    return byLane;
  }, [visibleCards, laneById]);

  const selectedCard =
    selectedId != null ? (CARD_BY_ID.get(selectedId) ?? null) : null;
  const selectedLane =
    selectedCard != null
      ? (laneById[selectedCard.id] ?? selectedCard.lane)
      : null;

  const selectCard = (id: string) => {
    setSelectedId(id);
    setIsDrawerOpen(true);
  };

  const moveCard = (id: string, lane: LaneId) => {
    setLaneById(prev => ({...prev, [id]: lane}));
  };

  const setPriority = (id: string, priority: Priority) => {
    setPriorityById(prev => ({...prev, [id]: priority}));
  };

  const archiveCard = (id: string) => {
    setArchivedIds(prev => [...prev, id]);
    if (selectedId === id) {
      setSelectedId(null);
    }
  };

  const addReply = (id: string, text: string) => {
    setRepliesById(prev => ({...prev, [id]: [...(prev[id] ?? []), text]}));
  };

  const counterStrip = (
    <HStack gap={2} vAlign="center">
      <StatusDot variant="success" label="Active sessions" isPulsing />
      <Text type="supporting" hasTabularNumbers>
        {laneCards.progress.length} active
      </Text>
      <StatusDot variant="warning" label="Sessions in review" isPulsing />
      <Text type="supporting" hasTabularNumbers>
        {laneCards.review.length} review
      </Text>
      {!isCompact && (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          · {laneCards.ideas.length} ideas · {laneCards.inbox.length} inbox ·{' '}
          {laneCards.done.length} done
        </Text>
      )}
    </HStack>
  );

  const drawer = (
    <ChatDrawer
      // Key by session so the reply draft resets when switching cards.
      key={selectedCard?.id ?? 'empty'}
      card={selectedCard}
      lane={selectedLane}
      replies={selectedCard != null ? (repliesById[selectedCard.id] ?? []) : []}
      onClose={() => setIsDrawerOpen(false)}
      onApprove={id => moveCard(id, 'done')}
      onReject={id => moveCard(id, 'progress')}
      onReply={addReply}
    />
  );

  const board = (
    <div style={styles.board}>
      {LANES.map(lane => {
        const cards = laneCards[lane.id];
        return (
          <div
            key={lane.id}
            style={{
              ...styles.lane,
              borderTopColor: lane.barColor,
              ...(lane.glow != null ? {boxShadow: lane.glow} : undefined),
            }}>
            <div style={styles.laneHeader}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text
                    type="label"
                    size="sm"
                    color="secondary"
                    style={styles.laneTitle}>
                    {lane.label}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {cards.length}
                </Text>
              </HStack>
            </div>
            <div style={styles.laneBody}>
              {cards.length === 0 ? (
                <div style={styles.laneEmpty}>
                  <Text type="supporting" color="secondary">
                    No sessions
                  </Text>
                </div>
              ) : (
                cards.map(card => (
                  <TaskCard
                    key={card.id}
                    card={card}
                    lane={lane.id}
                    priority={priorityById[card.id] ?? card.priority}
                    isSelected={card.id === selectedId && isDrawerOpen}
                    onSelect={selectCard}
                    onMove={moveCard}
                    onSetPriority={setPriority}
                    onArchive={archiveCard}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const showDrawerAsPage = isCompact && isDrawerOpen;

  return (
    <div ref={wrapRef} style={styles.page}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <Heading level={1}>Mission Control</Heading>
              <Selector
                label="Workspace"
                isLabelHidden
                size="sm"
                options={WORKSPACE_OPTIONS}
                value={workspace}
                onChange={setWorkspace}
              />
              <StackItem size="fill">{counterStrip}</StackItem>
              <Button
                label={isDrawerOpen ? 'Hide chat' : 'Chat'}
                variant="secondary"
                size="sm"
                onClick={() => setIsDrawerOpen(prev => !prev)}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            {showDrawerAsPage ? (
              <VStack gap={0} height="100%">
                <div style={styles.compactBackBar}>
                  <Button
                    label="Back to board"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
                    onClick={() => setIsDrawerOpen(false)}
                  />
                </div>
                <StackItem size="fill">{drawer}</StackItem>
              </VStack>
            ) : (
              board
            )}
          </LayoutContent>
        }
        end={
          !isCompact && isDrawerOpen ? (
            <LayoutPanel
              width={380}
              hasDivider
              padding={0}
              isScrollable={false}
              label="Session chat drawer">
              {drawer}
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};