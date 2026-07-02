// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Shared Team Inbox — Front-style multi-agent support mailbox for a
 *   shared address (help@brightpath.io).
 *
 * @input Deterministic fixtures only: six queue conversations with fixed SLA
 *   countdown labels ('38m left' red, '1h 12m left' amber, '3h 40m left'
 *   green), fixed assignees drawn from four agents (Alex Chen — the signed-in
 *   agent — Maya Chen, Sam Okafor, Priya Raman), per-conversation threads
 *   with fixed ISO timestamps (the selected CSV-export thread spans
 *   Jun 30 4:12 PM → Jul 2 8:47 AM), tags, followers, and activity entries.
 *   Messages appended in-session use one fixed session timestamp — no
 *   Date.now(), Math.random(), or network assets.
 * @output A shared team mailbox: left 300px queue of conversations, each row
 *   carrying a channel icon, an SLA countdown Badge, and an assignee Avatar
 *   or 'Unassigned' Token, filtered by a Mine/Unassigned/All
 *   SegmentedControl plus a search TextInput; center conversation pane with
 *   a sticky subject header (status Badge + SLA chip), a scrolling stream —
 *   opened pinned to the newest message — mixing customer emails, agent
 *   replies, and amber-tinted internal-note Cards, a dismissable collision
 *   Banner ('Maya Chen is replying…' with a
 *   pulsing StatusDot) above the composer, and a composer whose TabList
 *   toggles Reply vs Internal note (amber tint, @-mention hint, send label
 *   swap); right 300px collaboration rail with assignee Selector, status
 *   SegmentedControl (Open/Pending/Closed), followers AvatarGroup, tag
 *   Tokens, a MetadataList of conversation facts, and an activity timeline.
 *   Every control is live: queue selection drives the center pane and rail,
 *   sending a note appends an amber card, reassignment updates the queue
 *   row's Avatar, and status changes update the header Badge.
 * @position Emitted by `astryx template shared-team-inbox`.
 *
 * Frame (desktop, left to right):
 *   queue 300px | conversation pane (fill) | collaboration rail 300px
 *
 * Container policy: dense rows and panels for the queue and rail; the only
 * Cards are the amber internal-note cards in the message stream — the tint
 * is the "team-only" signal, so notes must read as a different surface than
 * customer-visible mail.
 *
 * Distinct from inbox: one queue shared by a team (assignment, presence
 * collision, internal notes, SLA timers), not one person's folders. Distinct
 * from table-split-pane: the collaboration primitives are the point, not a
 * generic ticket split. Distinct from messaging-shell: asynchronous customer
 * mail with SLAs and internal notes, not live channel chat — no Chat
 * components anywhere.
 *
 * Responsive contract:
 * - >1100px  — full three-region frame (queue | conversation | rail).
 * - <=1100px — the rail collapses behind an info IconButton in the page
 *   header; toggling it restores the 300px end panel.
 * - <=800px  — the queue collapses to back-navigation: the conversation
 *   pane fills the width and a back IconButton in its sticky header swaps
 *   the content region to the queue list; tapping a row returns.
 * - The queue, message stream, and rail scroll independently; the page
 *   header, conversation header, collision Banner, and composer stay pinned.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArrowLeftIcon,
  AtSignIcon,
  ClockIcon,
  HistoryIcon,
  InfoIcon,
  LifeBuoyIcon,
  MailIcon,
  MessageCircleIcon,
  ReplyIcon,
  SearchIcon,
  SendIcon,
  StickyNoteIcon,
  TagIcon,
  UsersIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  queueColumn: {
    height: '100%',
    minHeight: 0,
  },
  queueControls: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  queueScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  queueEmpty: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-4)',
  },
  // Tabular numerals so stacked SLA countdowns digit-align down the queue.
  slaChip: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  conversationColumn: {
    height: '100%',
    minHeight: 0,
  },
  conversationHeader: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  // height 0 + flexGrow keeps long threads from pushing the pinned composer
  // below the fold (they scroll inside this box); the viewport-tracking
  // minHeight floor keeps the frame tall when the container is auto-sized
  // (520px ≈ page header + conversation header + banner + composer chrome).
  messageScroll: {
    height: 0,
    minHeight: 'max(320px, calc(100dvh - 520px))',
    flexGrow: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-4)',
  },
  messageStream: {
    maxWidth: 720,
  },
  // Amber "team eyes only" surface — deliberately different from the
  // customer-visible message rows around it.
  noteCard: {
    backgroundColor: 'var(--color-background-yellow)',
    borderColor: 'var(--color-border-yellow)',
  },
  composer: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  composerNoteTint: {
    backgroundColor: 'var(--color-background-yellow)',
  },
  railColumn: {
    height: '100%',
    minHeight: 0,
  },
  railScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-3)',
  },
  timelineRow: {
    alignItems: 'baseline',
  },
  // Centers the small pulsing dot on the Banner title's first text line —
  // without this the dot hugs the icon slot's top edge.
  bannerDot: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in agent is Alex Chen; the team
// staffs the shared help@brightpath.io mailbox with a 4h first-reply SLA.
// All in-session writes stamp SESSION_TIME so renders never depend on clocks.
// ---------------------------------------------------------------------------

const MAILBOX = 'help@brightpath.io';
const SESSION_TIME = '2026-07-02T09:30:00';
const CURRENT_AGENT_ID = 'alex';

interface Agent {
  id: string;
  name: string;
}

const AGENTS: Agent[] = [
  {id: 'alex', name: 'Alex Chen'},
  {id: 'maya', name: 'Maya Chen'},
  {id: 'sam', name: 'Sam Okafor'},
  {id: 'priya', name: 'Priya Raman'},
];

const agentName = (id: string | null): string | null =>
  AGENTS.find(agent => agent.id === id)?.name ?? null;

type Channel = 'email' | 'chat';
type SlaLevel = 'green' | 'amber' | 'red';
type ConversationStatus = 'open' | 'pending' | 'closed';

const CHANNEL_ICON: Record<Channel, typeof MailIcon> = {
  email: MailIcon,
  chat: MessageCircleIcon,
};

const SLA_BADGE: Record<SlaLevel, 'success' | 'warning' | 'error'> = {
  green: 'success',
  amber: 'warning',
  red: 'error',
};

const STATUS_BADGE: Record<
  ConversationStatus,
  {label: string; variant: 'info' | 'warning' | 'neutral'}
> = {
  open: {label: 'Open', variant: 'info'},
  pending: {label: 'Pending', variant: 'warning'},
  closed: {label: 'Closed', variant: 'neutral'},
};

interface Conversation {
  id: string;
  subject: string;
  customer: string;
  email: string;
  channel: Channel;
  /** Fixed countdown label — no live clock in fixtures. */
  sla: string;
  slaLevel: SlaLevel;
  assigneeId: string | null;
  status: ConversationStatus;
  lastActivity: string;
  snippet: string;
  tags: Array<{label: string; color: 'red' | 'blue' | 'purple' | 'gray'}>;
  followerIds: string[];
  slaTarget: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-refund',
    subject: 'Refund not received — order #48122',
    customer: 'Riley Moss',
    email: 'riley.moss@northpine.co',
    channel: 'email',
    sla: '38m left',
    slaLevel: 'red',
    assigneeId: null,
    status: 'open',
    lastActivity: '2026-07-02T08:52:00',
    snippet:
      'It has been nine business days since the return was scanned and the refund still shows as processing.',
    tags: [{label: 'billing', color: 'purple'}],
    followerIds: ['sam'],
    slaTarget: 'First reply 1h',
  },
  {
    id: 'conv-api',
    subject: 'API key rotation question',
    customer: 'Tom Barrett',
    email: 'tom@crestlinehq.com',
    channel: 'email',
    sla: '3h 40m left',
    slaLevel: 'green',
    assigneeId: 'maya',
    status: 'open',
    lastActivity: '2026-07-02T07:41:00',
    snippet:
      'If we rotate credentials from the dashboard, how long do the old ones keep working before they are revoked?',
    tags: [{label: 'api', color: 'blue'}],
    followerIds: [],
    slaTarget: 'First reply 4h',
  },
  {
    id: 'conv-csv',
    subject: 'Broken CSV export',
    customer: 'Ana Lucia Reyes',
    email: 'ana.reyes@meridianlabs.io',
    channel: 'email',
    sla: '1h 12m left',
    slaLevel: 'amber',
    assigneeId: 'alex',
    status: 'open',
    lastActivity: '2026-07-02T08:47:00',
    snippet:
      'Checking in — finance closes the quarter Friday and we still cannot pull the June ledger.',
    tags: [
      {label: 'bug', color: 'red'},
      {label: 'csv-export', color: 'blue'},
    ],
    followerIds: ['maya', 'sam'],
    slaTarget: 'First reply 4h',
  },
  {
    id: 'conv-invoice',
    subject: 'Duplicate line item on June invoice',
    customer: 'Jordan Blake',
    email: 'jordan@fernvale.studio',
    channel: 'chat',
    sla: '2h 05m left',
    slaLevel: 'green',
    assigneeId: 'sam',
    status: 'pending',
    lastActivity: '2026-07-01T15:26:00',
    snippet:
      'The June invoice lists the Growth plan twice — one line should be the prorated May credit.',
    tags: [{label: 'billing', color: 'purple'}],
    followerIds: [],
    slaTarget: 'First reply 4h',
  },
  {
    id: 'conv-seats',
    subject: 'Cannot invite teammate — seat limit reached?',
    customer: 'Nina Kowalski',
    email: 'nina.kowalski@atlasrow.com',
    channel: 'email',
    sla: '52m left',
    slaLevel: 'amber',
    assigneeId: null,
    status: 'open',
    lastActivity: '2026-07-02T08:12:00',
    snippet:
      'The invite button is greyed out even though our plan page says we have 3 of 10 seats in use.',
    tags: [{label: 'account', color: 'gray'}],
    followerIds: ['priya'],
    slaTarget: 'First reply 2h',
  },
  {
    id: 'conv-darkmode',
    subject: 'Feature request: dark mode for reports',
    customer: 'Devon Price',
    email: 'devon@oakline.app',
    channel: 'chat',
    sla: '7h 10m left',
    slaLevel: 'green',
    assigneeId: 'priya',
    status: 'open',
    lastActivity: '2026-07-01T11:03:00',
    snippet:
      'Our analysts live in the reports view after hours — any chance dark mode is on the roadmap?',
    tags: [{label: 'feature-request', color: 'gray'}],
    followerIds: [],
    slaTarget: 'First reply 8h',
  },
];

type MessageKind = 'customer' | 'agent' | 'note';

interface ThreadMessage {
  id: string;
  kind: MessageKind;
  author: string;
  time: string;
  body: string[];
}

const INITIAL_THREADS: Record<string, ThreadMessage[]> = {
  'conv-refund': [
    {
      id: 'refund-1',
      kind: 'customer',
      author: 'Riley Moss',
      time: '2026-07-02T08:52:00',
      body: [
        'Hi — it has now been nine business days since your warehouse scanned the return for order #48122, and the refund still shows as "processing" in my account.',
        'The return confirmation email said 5–7 business days. Can someone tell me where this is stuck? I would rather not dispute the charge with my bank.',
      ],
    },
  ],
  'conv-api': [
    {
      id: 'api-1',
      kind: 'customer',
      author: 'Tom Barrett',
      time: '2026-07-02T07:41:00',
      body: [
        'Quick question before our quarterly credential rotation: if we rotate from the dashboard, how long do the old credentials keep working before they are fully revoked?',
        'Our deploy pipeline takes about 20 minutes to roll, so we need a small overlap window.',
      ],
    },
    {
      id: 'api-2',
      kind: 'note',
      author: 'Maya Chen',
      time: '2026-07-02T08:05:00',
      body: [
        'Docs say 60-minute overlap but the setting is configurable per workspace — checking what this account is set to before replying.',
      ],
    },
  ],
  'conv-csv': [
    {
      id: 'csv-1',
      kind: 'customer',
      author: 'Ana Lucia Reyes',
      time: '2026-06-30T16:12:00',
      body: [
        'Hi team — the CSV export on the June ledger report has been failing since this morning. The download starts, then the file arrives as 0 bytes.',
        'We tried three browsers and two accounts. PDF export works fine, so it looks specific to CSV. Finance closes the quarter on Friday, so this is fairly urgent for us.',
      ],
    },
    {
      id: 'csv-2',
      kind: 'agent',
      author: 'Alex Chen',
      time: '2026-07-01T09:05:00',
      body: [
        'Hi Ana — thanks for the detailed report, and sorry for the trouble. We reproduced the empty-file behavior on our side and have escalated it to engineering as a priority issue.',
        'In the meantime, the ledger data is also available via the scheduled report email — I have triggered one to your address so finance is not blocked while we work on the fix.',
      ],
    },
    {
      id: 'csv-3',
      kind: 'note',
      author: 'Maya Chen',
      time: '2026-07-01T09:20:00',
      body: [
        "Eng confirmed the exporter regression, fix ships Thursday — don't promise a date to the customer until it is actually deployed.",
      ],
    },
    {
      id: 'csv-4',
      kind: 'customer',
      author: 'Ana Lucia Reyes',
      time: '2026-07-02T08:47:00',
      body: [
        'Checking in — the scheduled report email came through, thank you. Finance still needs the raw CSV for reconciliation though. Any estimate on the fix? Quarter close is Friday.',
      ],
    },
  ],
  'conv-invoice': [
    {
      id: 'invoice-1',
      kind: 'customer',
      author: 'Jordan Blake',
      time: '2026-07-01T14:58:00',
      body: [
        'The June invoice lists the Growth plan twice. I think one of the lines should be the prorated May credit, but as written we are being charged double.',
      ],
    },
    {
      id: 'invoice-2',
      kind: 'agent',
      author: 'Sam Okafor',
      time: '2026-07-01T15:26:00',
      body: [
        'Good catch, Jordan — that second line should indeed be a credit, not a charge. I have asked billing to reissue the invoice; you will get a corrected copy within one business day, and nothing will be collected until then.',
      ],
    },
  ],
  'conv-seats': [
    {
      id: 'seats-1',
      kind: 'customer',
      author: 'Nina Kowalski',
      time: '2026-07-02T08:12:00',
      body: [
        'Trying to invite a new analyst but the invite button is greyed out. The plan page says 3 of 10 seats are in use, so we should have room — is something cached wrong on our workspace?',
      ],
    },
  ],
  'conv-darkmode': [
    {
      id: 'dark-1',
      kind: 'customer',
      author: 'Devon Price',
      time: '2026-07-01T11:03:00',
      body: [
        'Not a bug, just a plea: our analysts live in the reports view after hours and the white background is brutal. Any chance dark mode for reports is on the roadmap?',
      ],
    },
    {
      id: 'dark-2',
      kind: 'agent',
      author: 'Priya Raman',
      time: '2026-07-01T11:40:00',
      body: [
        'Hi Devon — you are not alone, this is one of our most-requested items. I have added your vote to the tracker; no committed date yet, but I will follow up here the moment it lands on a release plan.',
      ],
    },
  ],
};

interface ActivityEntry {
  id: string;
  text: string;
  time: string;
}

const INITIAL_ACTIVITY: Record<string, ActivityEntry[]> = {
  'conv-refund': [
    {id: 'a-refund-1', text: 'SLA target set to 1h', time: '2026-07-02T08:52:00'},
  ],
  'conv-api': [
    {id: 'a-api-1', text: 'SLA target set to 4h', time: '2026-07-02T07:41:00'},
    {id: 'a-api-2', text: 'Maya assigned herself', time: '2026-07-02T07:55:00'},
    {id: 'a-api-3', text: 'Maya added an internal note', time: '2026-07-02T08:05:00'},
  ],
  'conv-csv': [
    {id: 'a-csv-1', text: 'SLA target set to 4h', time: '2026-06-30T16:12:00'},
    {id: 'a-csv-2', text: 'Maya added an internal note', time: '2026-07-01T09:20:00'},
    {id: 'a-csv-3', text: 'Maya assigned to Alex', time: '2026-07-02T09:14:00'},
  ],
  'conv-invoice': [
    {id: 'a-invoice-1', text: 'SLA target set to 4h', time: '2026-07-01T14:58:00'},
    {id: 'a-invoice-2', text: 'Sam assigned himself', time: '2026-07-01T15:10:00'},
    {id: 'a-invoice-3', text: 'Sam marked as Pending', time: '2026-07-01T15:27:00'},
  ],
  'conv-seats': [
    {id: 'a-seats-1', text: 'SLA target set to 2h', time: '2026-07-02T08:12:00'},
  ],
  'conv-darkmode': [
    {id: 'a-dark-1', text: 'SLA target set to 8h', time: '2026-07-01T11:03:00'},
    {id: 'a-dark-2', text: 'Priya assigned herself', time: '2026-07-01T11:22:00'},
  ],
};

/** Fixed presence fixture: who is mid-reply on which conversation. */
const TYPING_PRESENCE: Record<string, string> = {
  'conv-csv': 'Maya Chen',
};

const ASSIGNEE_OPTIONS = [
  {value: 'unassigned', label: 'Unassigned'},
  ...AGENTS.map(agent => ({value: agent.id, label: agent.name})),
];

type QueueFilter = 'mine' | 'unassigned' | 'all';
type ComposerMode = 'reply' | 'note';

// ---------------------------------------------------------------------------
// MESSAGE BLOCKS — customer/agent rows vs amber internal-note Cards.
// ---------------------------------------------------------------------------

function MessageBlock({message}: {message: ThreadMessage}) {
  if (message.kind === 'note') {
    return (
      <Card padding={3} style={styles.noteCard}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={StickyNoteIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" weight="semibold">
                Internal note · {message.author}
              </Text>
            </StackItem>
            <Timestamp
              value={message.time}
              format="date_time"
              type="supporting"
              color="secondary"
            />
          </HStack>
          {message.body.map((paragraph, index) => (
            <Text key={index} type="body">
              {paragraph}
            </Text>
          ))}
          <Text type="supporting" color="secondary">
            Only visible to the help@ team.
          </Text>
        </VStack>
      </Card>
    );
  }
  return (
    <HStack gap={3} vAlign="start">
      <Avatar name={message.author} size="small" />
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Text type="body" weight="semibold">
              {message.author}
            </Text>
            {message.kind === 'agent' && (
              <Badge label="Team" variant="info" />
            )}
            <StackItem size="fill">
              <span />
            </StackItem>
            <Timestamp
              value={message.time}
              format="date_time"
              type="supporting"
              color="secondary"
            />
          </HStack>
          {message.body.map((paragraph, index) => (
            <Text key={index} type="body">
              {paragraph}
            </Text>
          ))}
        </VStack>
      </StackItem>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function SharedTeamInboxTemplate() {
  const [selectedId, setSelectedId] = useState('conv-csv');
  const [queueFilter, setQueueFilter] = useState<QueueFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerMode>('reply');
  const [draft, setDraft] = useState('');
  // Live collaboration state, seeded from fixtures.
  const [assigneeById, setAssigneeById] = useState<Record<string, string | null>>(
    () => Object.fromEntries(CONVERSATIONS.map(c => [c.id, c.assigneeId])),
  );
  const [statusById, setStatusById] = useState<Record<string, ConversationStatus>>(
    () => Object.fromEntries(CONVERSATIONS.map(c => [c.id, c.status])),
  );
  const [threadById, setThreadById] =
    useState<Record<string, ThreadMessage[]>>(INITIAL_THREADS);
  const [activityById, setActivityById] =
    useState<Record<string, ActivityEntry[]>>(INITIAL_ACTIVITY);
  const [dismissedCollisionIds, setDismissedCollisionIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  // Responsive contract (see file header).
  const isRailCollapsed = useMediaQuery('(max-width: 1100px)');
  const [isRailOpen, setIsRailOpen] = useState(false);
  const isSinglePane = useMediaQuery('(max-width: 800px)');
  const [isQueueShownOnMobile, setIsQueueShownOnMobile] = useState(false);
  const streamRef = useRef<HTMLElement | null>(null);

  const selected =
    CONVERSATIONS.find(conversation => conversation.id === selectedId) ??
    CONVERSATIONS[0];
  const selectedThread = threadById[selected.id];
  const selectedActivity = activityById[selected.id];
  const selectedAssigneeId = assigneeById[selected.id];
  const selectedStatus = statusById[selected.id];
  const typingAgent = TYPING_PRESENCE[selected.id];
  const showCollision =
    typingAgent !== undefined && !dismissedCollisionIds.has(selected.id);

  // A shared inbox opens on the newest mail: pin the stream to its end when
  // switching conversations and after appending a reply or note.
  useEffect(() => {
    const streamEl = streamRef.current;
    if (streamEl) {
      streamEl.scrollTop = streamEl.scrollHeight;
    }
  }, [selectedId, selectedThread.length]);

  const openCount = useMemo(
    () =>
      CONVERSATIONS.filter(conversation => statusById[conversation.id] === 'open')
        .length,
    [statusById],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleConversations = useMemo(() => {
    return CONVERSATIONS.filter(conversation => {
      const assignee = assigneeById[conversation.id];
      if (queueFilter === 'mine' && assignee !== CURRENT_AGENT_ID) {
        return false;
      }
      if (queueFilter === 'unassigned' && assignee !== null) {
        return false;
      }
      if (normalizedQuery === '') {
        return true;
      }
      return (
        conversation.subject.toLowerCase().includes(normalizedQuery) ||
        conversation.customer.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [queueFilter, normalizedQuery, assigneeById]);

  const appendActivity = (conversationId: string, text: string) => {
    setActivityById(prev => ({
      ...prev,
      [conversationId]: [
        ...prev[conversationId],
        {
          id: `a-live-${conversationId}-${prev[conversationId].length}`,
          text,
          time: SESSION_TIME,
        },
      ],
    }));
  };

  const openConversation = (id: string) => {
    setSelectedId(id);
    setDraft('');
    setComposerMode('reply');
    setIsQueueShownOnMobile(false);
  };

  const changeAssignee = (value: string) => {
    const nextId = value === 'unassigned' ? null : value;
    setAssigneeById(prev => ({...prev, [selected.id]: nextId}));
    appendActivity(
      selected.id,
      nextId === null
        ? 'Alex removed the assignee'
        : `Alex assigned to ${agentName(nextId)}`,
    );
  };

  const changeStatus = (value: string) => {
    const nextStatus = value as ConversationStatus;
    setStatusById(prev => ({...prev, [selected.id]: nextStatus}));
    appendActivity(
      selected.id,
      `Alex marked as ${STATUS_BADGE[nextStatus].label}`,
    );
  };

  const sendDraft = () => {
    const body = draft.trim();
    if (body === '') {
      return;
    }
    setThreadById(prev => ({
      ...prev,
      [selected.id]: [
        ...prev[selected.id],
        {
          id: `live-${selected.id}-${prev[selected.id].length}`,
          kind: composerMode === 'reply' ? 'agent' : 'note',
          author: 'Alex Chen',
          time: SESSION_TIME,
          body: body.split('\n\n'),
        },
      ],
    }));
    appendActivity(
      selected.id,
      composerMode === 'reply'
        ? `Alex replied to ${selected.customer}`
        : 'Alex added an internal note',
    );
    setDraft('');
  };

  // ---- queue pane ----
  const queuePane = (
    <Stack direction="vertical" style={styles.queueColumn}>
      <VStack gap={2} style={styles.queueControls}>
        <SegmentedControl
          label="Queue filter"
          value={queueFilter}
          onChange={value => setQueueFilter(value as QueueFilter)}
          size="sm"
          layout="fill">
          <SegmentedControlItem value="mine" label="Mine" />
          <SegmentedControlItem value="unassigned" label="Unassigned" />
          <SegmentedControlItem value="all" label="All" />
        </SegmentedControl>
        <TextInput
          label="Search conversations"
          isLabelHidden
          size="sm"
          placeholder="Search subject or customer…"
          startIcon={SearchIcon}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </VStack>
      <Divider />
      <StackItem size="fill" style={styles.queueScroll}>
        {visibleConversations.length === 0 ? (
          <div style={styles.queueEmpty}>
            <Text type="supporting" color="secondary">
              {normalizedQuery === ''
                ? 'Nothing in this view — switch the filter to see the rest of the queue.'
                : `No conversations match "${searchQuery.trim()}".`}
            </Text>
          </div>
        ) : (
          <List density="compact" hasDividers>
            {visibleConversations.map(conversation => {
              const assignee = agentName(assigneeById[conversation.id]);
              return (
                <ListItem
                  key={conversation.id}
                  isSelected={conversation.id === selectedId}
                  onClick={() => openConversation(conversation.id)}
                  startContent={
                    <Icon
                      icon={CHANNEL_ICON[conversation.channel]}
                      size="sm"
                      color="secondary"
                    />
                  }
                  label={
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="body" weight="semibold" maxLines={1}>
                          {conversation.customer}
                        </Text>
                      </StackItem>
                      <div style={styles.slaChip}>
                        <Badge
                          label={conversation.sla}
                          variant={SLA_BADGE[conversation.slaLevel]}
                        />
                      </div>
                    </HStack>
                  }
                  description={
                    <VStack gap={1}>
                      <Text type="supporting" color="primary" maxLines={1}>
                        {conversation.subject}
                      </Text>
                      <HStack gap={2} vAlign="center">
                        {assignee === null ? (
                          <Token label="Unassigned" size="sm" color="gray" />
                        ) : (
                          <HStack gap={1} vAlign="center">
                            <Avatar name={assignee} size={16} />
                            <Text type="supporting" color="secondary">
                              {assignee}
                            </Text>
                          </HStack>
                        )}
                        <StackItem size="fill">
                          <span />
                        </StackItem>
                        <Timestamp
                          value={conversation.lastActivity}
                          format="time"
                          hasTooltip={false}
                          type="supporting"
                          color="secondary"
                        />
                      </HStack>
                    </VStack>
                  }
                />
              );
            })}
          </List>
        )}
      </StackItem>
    </Stack>
  );

  // ---- conversation pane ----
  const conversationPane = (
    <Stack direction="vertical" style={styles.conversationColumn}>
      <div style={styles.conversationHeader}>
        <HStack gap={3} vAlign="center">
          {isSinglePane && (
            <IconButton
              label="Back to queue"
              tooltip="Back to queue"
              size="sm"
              variant="ghost"
              icon={<Icon icon={ArrowLeftIcon} size="sm" />}
              onClick={() => setIsQueueShownOnMobile(true)}
            />
          )}
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>{selected.subject}</Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {selected.customer} &lt;{selected.email}&gt; · via{' '}
                {selected.channel}
              </Text>
            </VStack>
          </StackItem>
          <Badge
            label={STATUS_BADGE[selectedStatus].label}
            variant={STATUS_BADGE[selectedStatus].variant}
          />
          <Tooltip content={`${selected.slaTarget} — countdown to breach`}>
            <Badge
              label={`SLA · ${selected.sla}`}
              variant={SLA_BADGE[selected.slaLevel]}
              icon={<Icon icon={ClockIcon} size="sm" />}
            />
          </Tooltip>
        </HStack>
      </div>
      <Divider />
      <StackItem ref={streamRef} size="fill" style={styles.messageScroll}>
        <VStack gap={4} style={styles.messageStream}>
          {selectedThread.map(message => (
            <MessageBlock key={message.id} message={message} />
          ))}
        </VStack>
      </StackItem>
      {showCollision && (
        <Banner
          status="info"
          container="section"
          icon={
            <span style={styles.bannerDot}>
              <StatusDot variant="accent" isPulsing label="Typing" />
            </span>
          }
          title={`${typingAgent} is replying…`}
          description="Hold your draft or coordinate in an internal note to avoid a double reply."
          isDismissable
          onDismiss={() =>
            setDismissedCollisionIds(prev => new Set(prev).add(selected.id))
          }
        />
      )}
      <Divider />
      <div
        style={{
          ...styles.composer,
          ...(composerMode === 'note' ? styles.composerNoteTint : undefined),
        }}>
        <VStack gap={2}>
          <TabList
            value={composerMode}
            onChange={value => setComposerMode(value as ComposerMode)}
            size="sm">
            <Tab
              value="reply"
              label="Reply"
              icon={<Icon icon={ReplyIcon} size="sm" />}
            />
            <Tab
              value="note"
              label="Internal note"
              icon={<Icon icon={StickyNoteIcon} size="sm" />}
            />
          </TabList>
          <TextArea
            label={composerMode === 'reply' ? 'Reply' : 'Internal note'}
            isLabelHidden
            rows={3}
            value={draft}
            onChange={setDraft}
            placeholder={
              composerMode === 'reply'
                ? `Reply to ${selected.customer}…`
                : 'Add a note for the team — @mention a teammate to loop them in…'
            }
          />
          <HStack gap={2} vAlign="center">
            <Icon
              icon={composerMode === 'reply' ? MailIcon : AtSignIcon}
              size="sm"
              color="secondary"
            />
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                {composerMode === 'reply'
                  ? `Sends from ${MAILBOX} to ${selected.customer}.`
                  : 'Notes stay internal — the customer never sees them.'}
              </Text>
            </StackItem>
            <Button
              label={composerMode === 'reply' ? 'Send reply' : 'Add note'}
              size="sm"
              variant="primary"
              icon={
                <Icon
                  icon={composerMode === 'reply' ? SendIcon : StickyNoteIcon}
                  size="sm"
                  color="inherit"
                />
              }
              isDisabled={draft.trim() === ''}
              onClick={sendDraft}
            />
          </HStack>
        </VStack>
      </div>
    </Stack>
  );

  // ---- collaboration rail ----
  const collaborationRail = (
    <Stack direction="vertical" style={styles.railColumn}>
      <StackItem size="fill" style={styles.railScroll}>
        <VStack gap={4}>
          <Selector
            label="Assignee"
            options={ASSIGNEE_OPTIONS}
            value={selectedAssigneeId ?? 'unassigned'}
            onChange={changeAssignee}
            size="sm"
            width="100%"
          />
          <SegmentedControl
            label="Status"
            value={selectedStatus}
            onChange={changeStatus}
            size="sm"
            layout="fill">
            <SegmentedControlItem value="open" label="Open" />
            <SegmentedControlItem value="pending" label="Pending" />
            <SegmentedControlItem value="closed" label="Closed" />
          </SegmentedControl>
          <Divider />
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={UsersIcon} size="sm" color="secondary" />
              <Text type="supporting" weight="semibold">
                Followers
              </Text>
            </HStack>
            {selected.followerIds.length === 0 ? (
              <Text type="supporting" color="secondary">
                No teammates following yet.
              </Text>
            ) : (
              <HStack gap={2} vAlign="center">
                <AvatarGroup size={24} aria-label="Followers">
                  {selected.followerIds.map(id => (
                    <Avatar key={id} name={agentName(id) ?? id} />
                  ))}
                </AvatarGroup>
                <Text type="supporting" color="secondary">
                  {selected.followerIds
                    .map(id => (agentName(id) ?? id).split(' ')[0])
                    .join(', ')}
                </Text>
              </HStack>
            )}
          </VStack>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={TagIcon} size="sm" color="secondary" />
              <Text type="supporting" weight="semibold">
                Tags
              </Text>
            </HStack>
            <HStack gap={1} style={{flexWrap: 'wrap'}}>
              {selected.tags.map(tag => (
                <Token
                  key={tag.label}
                  label={tag.label}
                  size="sm"
                  color={tag.color}
                />
              ))}
            </HStack>
          </VStack>
          <Divider />
          <MetadataList columns="single">
            <MetadataListItem label="Requester">
              <Text type="supporting">{selected.customer}</Text>
            </MetadataListItem>
            <MetadataListItem label="Channel">
              <Text type="supporting">
                {selected.channel === 'email' ? 'Email' : 'Chat'}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="SLA target">
              <Text type="supporting">{selected.slaTarget}</Text>
            </MetadataListItem>
            <MetadataListItem label="Last activity">
              <Timestamp
                value={selected.lastActivity}
                format="date_time"
                type="supporting"
              />
            </MetadataListItem>
          </MetadataList>
          <Divider />
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={HistoryIcon} size="sm" color="secondary" />
              <Text type="supporting" weight="semibold">
                Activity
              </Text>
            </HStack>
            <VStack gap={2}>
              {selectedActivity.map(entry => (
                <HStack key={entry.id} gap={2} style={styles.timelineRow}>
                  <StatusDot variant="neutral" label="Activity" />
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      {entry.text} ·{' '}
                      <Timestamp
                        value={entry.time}
                        format="time"
                        hasTooltip={false}
                        type="supporting"
                        color="secondary"
                      />
                    </Text>
                  </StackItem>
                </HStack>
              ))}
            </VStack>
          </VStack>
        </VStack>
      </StackItem>
    </Stack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <Icon icon={LifeBuoyIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{MAILBOX}</Heading>
                <Badge label={`${openCount} open`} variant="info" />
              </HStack>
            </StackItem>
            <Tooltip content="On shift: Alex, Maya, Sam, Priya">
              <AvatarGroup size={24} aria-label="Agents on shift">
                {AGENTS.map(agent => (
                  <Avatar key={agent.id} name={agent.name} />
                ))}
              </AvatarGroup>
            </Tooltip>
            {isRailCollapsed && (
              <IconButton
                label={isRailOpen ? 'Hide details' : 'Show details'}
                tooltip={isRailOpen ? 'Hide details' : 'Show details'}
                size="sm"
                variant={isRailOpen ? 'secondary' : 'ghost'}
                icon={<Icon icon={InfoIcon} size="sm" />}
                onClick={() => setIsRailOpen(prev => !prev)}
              />
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        isSinglePane ? undefined : (
          <LayoutPanel width={300} padding={0} hasDivider label="Queue">
            {queuePane}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isSinglePane && isQueueShownOnMobile
            ? queuePane
            : conversationPane}
        </LayoutContent>
      }
      end={
        !isRailCollapsed || isRailOpen ? (
          <LayoutPanel
            width={300}
            padding={0}
            hasDivider
            label="Conversation details">
            {collaborationRail}
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
