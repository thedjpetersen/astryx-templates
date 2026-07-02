// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file table-split-pane.tsx
 * @input Fixed support-ticket fixtures (ids, requesters, statuses,
 *   priorities, ISO timestamps, conversation threads) — no clocks,
 *   randomness, or network assets.
 * @output Split Pane List/Detail — an email-client-style support queue.
 *   Left pane is a dense, searchable, selectable ticket List inside a
 *   resizable LayoutPanel; right pane shows the selected ticket with
 *   header actions, metadata, the conversation thread, and a pinned
 *   reply composer.
 * @position Emitted by `astryx template table-split-pane`.
 *
 * Frame: header | ticket list panel 340 (resizable 280–480) | detail (fill).
 * The list panel lives in the Layout `start` slot with a ResizeHandle;
 * the detail pane is LayoutContent. Dense records render as rows
 * (List/ListItem), not cards — status and priority are carried by
 * Token and StatusDot.
 *
 * Responsive contract:
 * - > 900px: list panel is drag-resizable between 280 and 480px
 *   (default 340); the detail pane takes the remaining width.
 * - <= 900px: the resize handle is hidden and the list panel keeps a
 *   fixed 280px so dense rows are never crushed; the detail pane keeps
 *   fill width and its metadata grid wraps to fewer columns ('multi').
 * - The ticket list scrolls independently under its pinned search box;
 *   the conversation thread scrolls independently between the pinned
 *   detail header and the pinned reply composer.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  InboxIcon,
  MessagesSquareIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  panelFill: {
    height: '100%',
    minHeight: 0,
  },
  panelSearch: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  panelList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  panelEmpty: {
    padding: 'var(--spacing-4) var(--spacing-3)',
  },
  detailFill: {
    height: '100%',
    minHeight: 0,
  },
  detailHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-3)',
  },
  thread: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  composer: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  noteBody: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
};

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

type Status = 'open' | 'pending' | 'solved';
type Priority = 'urgent' | 'high' | 'normal';

interface TicketMessage {
  id: string;
  author: string;
  role: 'customer' | 'agent';
  isNote?: boolean;
  at: string;
  body: string;
}

interface Ticket {
  id: string;
  subject: string;
  requester: string;
  company: string;
  plan: 'Enterprise' | 'Growth' | 'Starter';
  channel: 'Chat widget' | 'Help center' | 'API';
  status: Status;
  priority: Priority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const STATUS_LABEL: Record<Status, string> = {
  open: 'Open',
  pending: 'Pending',
  solved: 'Solved',
};

const STATUS_TOKEN_COLOR: Record<Status, 'red' | 'yellow' | 'green'> = {
  open: 'red',
  pending: 'yellow',
  solved: 'green',
};

const PRIORITY_DOT: Record<
  Priority,
  {variant: 'error' | 'warning' | 'neutral'; label: string}
> = {
  urgent: {variant: 'error', label: 'Urgent priority'},
  high: {variant: 'warning', label: 'High priority'},
  normal: {variant: 'neutral', label: 'Normal priority'},
};

// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.
const TICKETS: Ticket[] = [
  {
    id: 'TKT-4821',
    subject: 'Webhook signatures failing after key rotation',
    requester: 'Dana Whitfield',
    company: 'Northwind Retail',
    plan: 'Enterprise',
    channel: 'API',
    status: 'open',
    priority: 'urgent',
    assignee: 'Maya Chen',
    createdAt: '2026-07-01T14:22:00Z',
    updatedAt: '2026-07-02T08:05:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Dana Whitfield',
        role: 'customer',
        at: '2026-07-01T14:22:00Z',
        body: 'We rotated our signing secret this morning and every webhook since then fails verification with SIGNATURE_MISMATCH. Order sync to our warehouse is down — this is blocking fulfillment.',
      },
      {
        id: 'm2',
        author: 'Maya Chen',
        role: 'agent',
        at: '2026-07-01T14:41:00Z',
        body: 'Sorry about the disruption, Dana. Rotated secrets take up to 10 minutes to propagate, but 18 hours is far outside that. Can you confirm whether you deleted the old secret or kept it during the overlap window?',
      },
      {
        id: 'm3',
        author: 'Maya Chen',
        role: 'agent',
        isNote: true,
        at: '2026-07-02T08:05:00Z',
        body: 'Internal: propagation job for their region stalled at 14:30 UTC — infra is replaying. Keep the customer on this thread until replay confirms.',
      },
    ],
  },
  {
    id: 'TKT-4818',
    subject: 'CSV export truncates orders past 10,000 rows',
    requester: 'Luis Barrera',
    company: 'Cascade Outfitters',
    plan: 'Growth',
    channel: 'Help center',
    status: 'open',
    priority: 'high',
    assignee: 'Tomas Verde',
    createdAt: '2026-07-01T09:48:00Z',
    updatedAt: '2026-07-01T16:30:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Luis Barrera',
        role: 'customer',
        at: '2026-07-01T09:48:00Z',
        body: 'Monthly export stops at exactly 10,000 rows even though the dashboard shows 14,286 orders for June. Finance closes the books Friday, so we need the full file.',
      },
      {
        id: 'm2',
        author: 'Tomas Verde',
        role: 'agent',
        at: '2026-07-01T16:30:00Z',
        body: 'Confirmed — the synchronous exporter caps at 10k rows. I have queued an async export to your email; it covers all 14,286 rows. A permanent fix ships with the next release.',
      },
    ],
  },
  {
    id: 'TKT-4815',
    subject: 'SSO login loops back to the sign-in page',
    requester: 'Priya Nair',
    company: 'Helix Biotech',
    plan: 'Enterprise',
    channel: 'Chat widget',
    status: 'open',
    priority: 'high',
    assignee: 'Unassigned',
    createdAt: '2026-06-30T18:12:00Z',
    updatedAt: '2026-06-30T18:12:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Priya Nair',
        role: 'customer',
        at: '2026-06-30T18:12:00Z',
        body: 'Since this afternoon, anyone signing in through Okta gets bounced back to the sign-in page with no error. Password logins work. We have ~200 users locked out of dashboards.',
      },
    ],
  },
  {
    id: 'TKT-4809',
    subject: 'Sandbox API rate limits lower than documented',
    requester: 'Jordan Blake',
    company: 'Fernwood Software',
    plan: 'Starter',
    channel: 'API',
    status: 'pending',
    priority: 'normal',
    assignee: 'Maya Chen',
    createdAt: '2026-06-29T21:35:00Z',
    updatedAt: '2026-06-30T10:02:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Jordan Blake',
        role: 'customer',
        at: '2026-06-29T21:35:00Z',
        body: 'Docs say sandbox allows 120 requests/min but we get 429s at around 60. Is the documented limit wrong, or is something misconfigured on our key?',
      },
      {
        id: 'm2',
        author: 'Maya Chen',
        role: 'agent',
        at: '2026-06-30T10:02:00Z',
        body: 'Starter sandbox keys are limited to 60/min; the docs page shows the Growth tier limit. I have flagged the docs for correction — could you confirm which tier you expected so I can route an upgrade quote if useful?',
      },
    ],
  },
  {
    id: 'TKT-4806',
    subject: 'Invoice PDF shows the old billing address',
    requester: 'Amelie Fournier',
    company: 'Atelier Lumen',
    plan: 'Growth',
    channel: 'Help center',
    status: 'pending',
    priority: 'normal',
    assignee: 'Tomas Verde',
    createdAt: '2026-06-29T13:20:00Z',
    updatedAt: '2026-06-29T15:44:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Amelie Fournier',
        role: 'customer',
        at: '2026-06-29T13:20:00Z',
        body: 'We updated our billing address three weeks ago, but the June invoice PDF still shows the old one. Our accounts team rejects mismatched invoices.',
      },
      {
        id: 'm2',
        author: 'Tomas Verde',
        role: 'agent',
        at: '2026-06-29T15:44:00Z',
        body: 'The address change applies to invoices generated after the update; June was generated on the 1st. I have requested a regenerated June invoice — waiting on your confirmation that the address on file is final.',
      },
    ],
  },
  {
    id: 'TKT-4801',
    subject: 'Add teammate seats without changing plan tier',
    requester: 'Owen Gallagher',
    company: 'Brightside Media',
    plan: 'Starter',
    channel: 'Chat widget',
    status: 'solved',
    priority: 'normal',
    assignee: 'Rosa Delgado',
    createdAt: '2026-06-28T11:05:00Z',
    updatedAt: '2026-06-28T11:52:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Owen Gallagher',
        role: 'customer',
        at: '2026-06-28T11:05:00Z',
        body: 'We just need two more seats for contractors this quarter — do we have to jump to Growth for that?',
      },
      {
        id: 'm2',
        author: 'Rosa Delgado',
        role: 'agent',
        at: '2026-06-28T11:52:00Z',
        body: 'No tier change needed — Starter supports add-on seats at $12/seat/month. I have added two seats effective today, prorated for June. Invite links are in Settings → Team.',
      },
    ],
  },
  {
    id: 'TKT-4797',
    subject: 'Dashboard charts blank in Safari 18',
    requester: 'Keiko Tanaka',
    company: 'Harbor Analytics',
    plan: 'Growth',
    channel: 'Help center',
    status: 'solved',
    priority: 'high',
    assignee: 'Rosa Delgado',
    createdAt: '2026-06-27T08:40:00Z',
    updatedAt: '2026-06-27T17:15:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Keiko Tanaka',
        role: 'customer',
        at: '2026-06-27T08:40:00Z',
        body: 'All dashboard charts render as empty white boxes in Safari 18. Chrome is fine. Half our exec team is on Safari.',
      },
      {
        id: 'm2',
        author: 'Rosa Delgado',
        role: 'agent',
        at: '2026-06-27T17:15:00Z',
        body: 'This was a regression in our canvas renderer under Safari 18’s new GPU compositing. A fix went out at 16:50 UTC — please hard-refresh and confirm. Marking solved; reply to reopen.',
      },
    ],
  },
  {
    id: 'TKT-4793',
    subject: 'Data residency documentation for EU customers',
    requester: 'Stefan Krueger',
    company: 'Alpenglow Travel',
    plan: 'Enterprise',
    channel: 'API',
    status: 'solved',
    priority: 'normal',
    assignee: 'Maya Chen',
    createdAt: '2026-06-26T15:58:00Z',
    updatedAt: '2026-06-26T16:47:00Z',
    messages: [
      {
        id: 'm1',
        author: 'Stefan Krueger',
        role: 'customer',
        at: '2026-06-26T15:58:00Z',
        body: 'Our DPO needs written confirmation of where EU customer data is stored and processed before we can renew.',
      },
      {
        id: 'm2',
        author: 'Maya Chen',
        role: 'agent',
        at: '2026-06-26T16:47:00Z',
        body: 'Sent our EU data residency whitepaper and signed DPA addendum to your procurement contact. EU data stays in eu-central-1 with backups in eu-west-1.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// TICKET LIST (left pane)
// ---------------------------------------------------------------------------

function TicketList({
  tickets,
  selectedId,
  onSelect,
}: {
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (tickets.length === 0) {
    return (
      <div style={styles.panelEmpty}>
        <EmptyState
          isCompact
          icon={<Icon icon={InboxIcon} size="lg" />}
          title="No matching tickets"
          description="Try a different search or status filter."
        />
      </div>
    );
  }
  return (
    <List density="compact" hasDividers>
      {tickets.map(ticket => (
        <ListItem
          key={ticket.id}
          label={ticket.subject}
          description={`${ticket.id} · ${ticket.requester} · ${ticket.company}`}
          startContent={
            <StatusDot
              variant={PRIORITY_DOT[ticket.priority].variant}
              label={PRIORITY_DOT[ticket.priority].label}
              isPulsing={ticket.priority === 'urgent' && ticket.status === 'open'}
            />
          }
          endContent={
            <VStack gap={1} hAlign="end">
              <Token
                size="sm"
                color={STATUS_TOKEN_COLOR[ticket.status]}
                label={STATUS_LABEL[ticket.status]}
              />
              <Timestamp
                value={ticket.updatedAt}
                format="relative"
                color="secondary"
              />
            </VStack>
          }
          onClick={() => onSelect(ticket.id)}
          isSelected={ticket.id === selectedId}
        />
      ))}
    </List>
  );
}

// ---------------------------------------------------------------------------
// TICKET DETAIL (right pane)
// ---------------------------------------------------------------------------

function ThreadMessage({message}: {message: TicketMessage}) {
  return (
    <HStack gap={3} vAlign="start">
      <Avatar name={message.author} size="small" />
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Text type="label">{message.author}</Text>
            {message.role === 'agent' && !message.isNote && (
              <Badge variant="info" label="Agent" />
            )}
            {message.isNote && <Badge variant="warning" label="Internal note" />}
            <StackItem size="fill" />
            <Timestamp value={message.at} format="date_time" color="secondary" />
          </HStack>
          {message.isNote ? (
            <div style={styles.noteBody}>
              <Text type="body">{message.body}</Text>
            </div>
          ) : (
            <Text type="body">{message.body}</Text>
          )}
        </VStack>
      </StackItem>
    </HStack>
  );
}

function TicketDetail({ticket, isNarrow}: {ticket: Ticket; isNarrow: boolean}) {
  const [reply, setReply] = useState('');
  const statusAction =
    ticket.status === 'open'
      ? 'Mark pending'
      : ticket.status === 'pending'
        ? 'Mark solved'
        : 'Reopen';

  return (
    <VStack gap={0} style={styles.detailFill}>
      {/* Detail header: subject, status/priority tokens, header actions. */}
      <VStack gap={3} style={styles.detailHeader}>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            {ticket.id}
          </Text>
          <Token
            size="sm"
            color={STATUS_TOKEN_COLOR[ticket.status]}
            label={STATUS_LABEL[ticket.status]}
          />
          <StatusDot
            variant={PRIORITY_DOT[ticket.priority].variant}
            label={PRIORITY_DOT[ticket.priority].label}
          />
          <Text type="supporting" color="secondary">
            {PRIORITY_DOT[ticket.priority].label}
          </Text>
          <StackItem size="fill" />
          <Button label={statusAction} size="sm" />
          <Button label="Assign to me" variant="secondary" size="sm" />
          <MoreMenu
            label={`More actions for ${ticket.id}`}
            size="sm"
            items={[
              {label: 'Merge into another ticket', onClick: () => {}},
              {label: 'Escalate to engineering', onClick: () => {}},
              {label: 'Copy ticket link', onClick: () => {}},
            ]}
          />
        </HStack>
        <Heading level={2}>{ticket.subject}</Heading>
        <MetadataList
          columns={isNarrow ? 'multi' : 3}
          label={{position: 'start', width: 88}}>
          <MetadataListItem label="Requester">
            <Text type="body">{ticket.requester}</Text>
          </MetadataListItem>
          <MetadataListItem label="Company">
            <Text type="body">
              {ticket.company} · {ticket.plan}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Channel">
            <Text type="body">{ticket.channel}</Text>
          </MetadataListItem>
          <MetadataListItem label="Assignee">
            <Text type="body">{ticket.assignee}</Text>
          </MetadataListItem>
          <MetadataListItem label="Created">
            <Timestamp value={ticket.createdAt} format="date_time" />
          </MetadataListItem>
          <MetadataListItem label="Updated">
            <Timestamp value={ticket.updatedAt} format="relative" />
          </MetadataListItem>
        </MetadataList>
      </VStack>

      <Divider />

      {/* Conversation thread scrolls independently between header and composer. */}
      <div style={styles.thread}>
        <VStack gap={4}>
          {ticket.messages.map(message => (
            <ThreadMessage key={`${ticket.id}-${message.id}`} message={message} />
          ))}
        </VStack>
      </div>

      <Divider />

      {/* Reply composer pinned below the thread. */}
      <VStack gap={2} style={styles.composer}>
        <TextArea
          label={`Reply to ${ticket.requester}`}
          isLabelHidden
          placeholder={`Reply to ${ticket.requester}...`}
          value={reply}
          onChange={setReply}
          rows={3}
          width="100%"
        />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Replying via {ticket.channel.toLowerCase()}
            </Text>
          </StackItem>
          <Button label="Add internal note" variant="ghost" size="sm" />
          <Button
            label="Send reply"
            size="sm"
            icon={<Icon icon={SendIcon} size="sm" />}
            isDisabled={reply.trim().length === 0}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TableSplitPaneTemplate() {
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(TICKETS[0].id);

  // Responsive contract: below 900px the list keeps a fixed 280px and the
  // resize handle is hidden (never crush dense rows with a drag handle).
  const isNarrow = useMediaQuery('(max-width: 900px)');

  const listPanel = useResizable({
    defaultSize: 340,
    minSizePx: 280,
    maxSizePx: 480,
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return TICKETS.filter(ticket => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return [ticket.id, ticket.subject, ticket.requester, ticket.company]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [statusFilter, query]);

  const selected = visible.find(ticket => ticket.id === selectedId) ?? null;
  const openCount = TICKETS.filter(ticket => ticket.status === 'open').length;

  const ticketListPane = (
    <VStack gap={0} style={styles.panelFill}>
      <div style={styles.panelSearch}>
        <TextInput
          label="Search tickets"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search id, subject, requester..."
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={setQuery}
          hasClear
        />
      </div>
      <div style={styles.panelList}>
        <TicketList
          tickets={visible}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
        />
      </div>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Support queue</Heading>
                <Text type="supporting" color="secondary">
                  {openCount} open
                </Text>
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              size="sm">
              <SegmentedControlItem label="All" value="all" />
              <SegmentedControlItem label="Open" value="open" />
              <SegmentedControlItem label="Pending" value="pending" />
              <SegmentedControlItem label="Solved" value="solved" />
            </SegmentedControl>
            <Button
              label="New ticket"
              icon={<Icon icon={PlusIcon} size="sm" />}
              size="sm"
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isNarrow ? (
          <LayoutPanel width={280} padding={0} hasDivider label="Ticket list">
            {ticketListPane}
          </LayoutPanel>
        ) : (
          <>
            <LayoutPanel
              resizable={listPanel.props}
              padding={0}
              label="Ticket list">
              {ticketListPane}
            </LayoutPanel>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              isAlwaysVisible={false}
              resizable={listPanel.props}
              label="Resize ticket list"
            />
          </>
        )
      }
      content={
        <LayoutContent padding={0}>
          {selected ? (
            <TicketDetail ticket={selected} isNarrow={isNarrow} />
          ) : (
            <EmptyState
              title="No ticket selected"
              description="Select a ticket from the list to read the conversation and reply."
              icon={<Icon icon={MessagesSquareIcon} size="lg" />}
            />
          )}
        </LayoutContent>
      }
    />
  );
}
