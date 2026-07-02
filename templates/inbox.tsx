// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Inbox — email triage surface with a three-column reading frame.
 *
 * @input Deterministic message fixtures: four folders (Inbox, Starred,
 *   Sent, Archive), fifteen messages with fixed ISO timestamps, sender
 *   names/addresses, subjects, snippets, and multi-paragraph bodies.
 *   No Date.now(), Math.random(), or network assets.
 * @output A mail client page: narrow folder rail with unread Badge
 *   counts, a message list pane of sender/subject/snippet/timestamp
 *   rows with unread emphasis (accent StatusDot + semibold sender),
 *   and a reading pane with the open message under a Toolbar of
 *   archive / snooze / reply actions. Opening a row marks it read,
 *   Archive really moves the message, and the star toggle feeds the
 *   Starred folder — all folder counts derive from live state.
 * @position Emitted by `astryx template inbox`.
 *
 * Frame (desktop, left to right):
 *   folder rail 208px | message list 340px | reading pane (fill)
 *
 * Container policy: dense rows and panels, zero Cards. Folders and
 * messages are List/ListItem rows; unread counts are the only Badge
 * usage; the reading pane header actions live in a Toolbar.
 *
 * Distinct from messaging-shell: this is asynchronous mail triage
 * (list/detail with read state and folder moves), not a live chat
 * stream — no Chat components anywhere.
 *
 * Responsive contract:
 * - >1024px  — full three-column frame (rail | list | reading pane).
 * - <=1024px — folder rail hidden; the list keeps its 340px width and
 *   the reading pane absorbs the reclaimed space.
 * - <=768px  — reading pane hidden; the message list becomes the
 *   content fill (mail-app list view). Rows stay tappable and still
 *   mark messages read.
 * - The message list and reading pane body scroll independently; the
 *   list header (search) and reading-pane toolbar stay pinned.
 *
 * Icon note: the demo heroicons shim exports a small fixed set, so
 * toolbar actions use the closest available names (BellIcon for
 * snooze, InboxIcon for archive, ChatBubbleLeftRightIcon for reply).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  HStack,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BellIcon,
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  railColumn: {
    height: '100%',
    minHeight: 0,
    paddingBlock: 'var(--spacing-3)',
  },
  railList: {
    paddingInline: 'var(--spacing-2)',
  },
  railFooter: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-2)',
  },
  listColumn: {
    height: '100%',
    minHeight: 0,
  },
  listSearch: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  listScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  listEmpty: {
    paddingTop: 'var(--spacing-6)',
  },
  rowTimestamp: {
    flexShrink: 0,
  },
  readingColumn: {
    height: '100%',
    minHeight: 0,
  },
  readingScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-4)',
  },
  readingBody: {
    maxWidth: 640,
  },
  readingEmpty: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures: fixed ISO timestamps, stable ordering.
// The signed-in user is Dana Whitfield, ops lead at Lumen Analytics.
// ---------------------------------------------------------------------------

type FolderId = 'inbox' | 'starred' | 'sent' | 'archive';

const FOLDERS: Array<{id: FolderId; label: string; icon: typeof InboxIcon}> = [
  {id: 'inbox', label: 'Inbox', icon: InboxIcon},
  {id: 'starred', label: 'Starred', icon: BookmarkIcon},
  {id: 'sent', label: 'Sent', icon: PencilSquareIcon},
  {id: 'archive', label: 'Archive', icon: ChatBubbleLeftRightIcon},
];

interface MailMessage {
  id: string;
  /** Physical folder; Starred is a virtual view over `starred` state. */
  folder: Exclude<FolderId, 'starred'>;
  /** Counterpart shown in the list: sender, or recipient for Sent. */
  from: string;
  email: string;
  subject: string;
  snippet: string;
  time: string;
  read: boolean;
  starred: boolean;
  body: string[];
}

const MESSAGES: MailMessage[] = [
  {
    id: 'msg-01',
    folder: 'inbox',
    from: 'Priya Raghavan',
    email: 'priya@lumenanalytics.com',
    subject: 'Q3 usage review — draft agenda attached',
    snippet:
      'Before Thursday, can you sanity-check the churn numbers on slide 4? They look high for the EU cohort.',
    time: '2026-07-02T09:42:00',
    read: false,
    starred: true,
    body: [
      'Hi Dana,',
      'Before Thursday, can you sanity-check the churn numbers on slide 4? They look high for the EU cohort — my guess is the June billing migration double-counted cancellations, but I want a second pair of eyes before we put it in front of the exec team.',
      'I also added a placeholder section for the self-serve upgrade funnel. If the instrumentation landed last sprint, real numbers would be much stronger than the projection we used in Q2.',
      'Agenda draft is in the shared drive under "Q3 usage review". Comments open until Wednesday noon.',
      'Thanks,\nPriya',
    ],
  },
  {
    id: 'msg-02',
    folder: 'inbox',
    from: 'Stripe Billing',
    email: 'receipts@stripe.com',
    subject: 'Invoice LUM-2041 payment received ($4,860.00)',
    snippet:
      'Your invoice LUM-2041 for the June platform subscription was paid on July 1. A PDF receipt is attached.',
    time: '2026-07-02T08:15:00',
    read: false,
    starred: false,
    body: [
      'Your invoice LUM-2041 for the June platform subscription was paid on July 1, 2026.',
      'Amount: $4,860.00 USD. Payment method: ACH transfer ending 4417. A PDF receipt is attached to this message for your records.',
      'No action is required. If you have questions about this charge, reply to this email or visit your billing dashboard.',
    ],
  },
  {
    id: 'msg-03',
    folder: 'inbox',
    from: 'Marcus Oyelaran',
    email: 'marcus@lumenanalytics.com',
    subject: 'Re: On-call handoff — two open incidents',
    snippet:
      'Handing over with INC-311 (ingest lag, mitigated) and INC-314 (dashboard 502s, still paging). Runbook links inside.',
    time: '2026-07-02T07:58:00',
    read: false,
    starred: false,
    body: [
      'Morning Dana,',
      'Handing over the pager with two open incidents:',
      'INC-311 — ingest lag on the eu-west pipeline. Mitigated last night by scaling the consumer group to 12; root cause still unknown. Watch the lag graph after the 10:00 batch import.',
      'INC-314 — intermittent 502s on customer dashboards, still paging roughly once an hour. Suspect the new edge cache config; rollback instructions are at the top of the runbook.',
      'I am around until noon if anything gets loud.\nMarcus',
    ],
  },
  {
    id: 'msg-04',
    folder: 'inbox',
    from: 'Elena Vasquez',
    email: 'elena.vasquez@corticapartners.com',
    subject: 'Renewal call follow-up + security questionnaire',
    snippet:
      'Great speaking yesterday. Our security team sent over the standard questionnaire — 42 questions, most should map to your SOC 2 report.',
    time: '2026-07-01T16:20:00',
    read: true,
    starred: true,
    body: [
      'Hi Dana,',
      'Great speaking with you and Priya yesterday. We are aligned on the three-year term with the expanded seat count, pending our security review.',
      'Our security team sent over the standard questionnaire — 42 questions, most of which should map directly to your SOC 2 Type II report. The two areas they will dig into are data residency for EU workspaces and your subprocessor list.',
      'If we can get the questionnaire back by July 10, legal can have paper ready before our fiscal close.',
      'Best,\nElena',
    ],
  },
  {
    id: 'msg-05',
    folder: 'inbox',
    from: 'GitHub',
    email: 'notifications@github.com',
    subject: '[lumen/ingest] PR #482: Backpressure for the batch importer',
    snippet:
      'sofia-ortiz requested your review on: lumen/ingest#482 — Adds token-bucket backpressure to the batch importer.',
    time: '2026-07-01T14:03:00',
    read: true,
    starred: false,
    body: [
      'sofia-ortiz requested your review on lumen/ingest#482.',
      'Adds token-bucket backpressure to the batch importer so a single oversized customer upload can no longer starve the realtime lane. Includes a load test that replays the June 14 traffic spike.',
      '12 files changed, +486 −112. CI is green.',
    ],
  },
  {
    id: 'msg-06',
    folder: 'inbox',
    from: 'Halvorsen & Reed LLP',
    email: 'notices@halvorsenreed.com',
    subject: 'Countersigned DPA — Cortica Partners',
    snippet:
      'Attached is the fully executed data processing addendum for Cortica Partners, countersigned July 1.',
    time: '2026-07-01T11:47:00',
    read: true,
    starred: false,
    body: [
      'Dear Ms. Whitfield,',
      'Attached is the fully executed data processing addendum for Cortica Partners, countersigned on July 1, 2026. A copy has been filed to your contracts workspace.',
      'Per section 9.2, the updated subprocessor list must be published to your trust page within 30 days. We have calendared a reminder for July 24.',
      'Kind regards,\nHalvorsen & Reed LLP',
    ],
  },
  {
    id: 'msg-07',
    folder: 'inbox',
    from: 'Tomás Ferreira',
    email: 'tomas@lumenanalytics.com',
    subject: 'Warehouse cost spike — need a decision by Friday',
    snippet:
      'June compute came in 38% over budget. Two options: move the nightly rollups to spot capacity, or drop hourly granularity for free-tier workspaces.',
    time: '2026-06-30T17:31:00',
    read: true,
    starred: false,
    body: [
      'Dana,',
      'June warehouse compute came in 38% over budget — $61.4k against a $44.5k plan. Almost all of the overage traces to the hourly rollup jobs we enabled for free-tier workspaces in May.',
      'Two options on the table: (1) move the nightly rollups to spot capacity, saves roughly $9k/month with a small re-run risk, or (2) drop hourly granularity to daily for free-tier workspaces, saves about $14k/month but product is worried about conversion.',
      'Finance wants a decision before Friday close so it lands in the July forecast. I put a one-pager with the numbers in the finance channel.',
      'Tomás',
    ],
  },
  {
    id: 'msg-08',
    folder: 'sent',
    from: 'Elena Vasquez',
    email: 'elena.vasquez@corticapartners.com',
    subject: 'Re: Renewal call follow-up + security questionnaire',
    snippet:
      'Thanks Elena — July 10 works. Our compliance lead will own the questionnaire; expect residency answers by Tuesday.',
    time: '2026-07-01T17:05:00',
    read: true,
    starred: false,
    body: [
      'Hi Elena,',
      'Thanks for the quick turnaround — July 10 works on our side. Our compliance lead, Amara Diallo, will own the questionnaire and has the SOC 2 mappings ready.',
      'On data residency: EU workspaces are pinned to eu-west-1 with backups in eu-central-1, and we can share the subprocessor list under the existing NDA. Expect written answers by Tuesday.',
      'Looking forward to getting this signed.\nDana',
    ],
  },
  {
    id: 'msg-09',
    folder: 'sent',
    from: 'Marcus Oyelaran',
    email: 'marcus@lumenanalytics.com',
    subject: 'Re: On-call handoff — two open incidents',
    snippet:
      'Got the pager. Watching INC-311 through the 10:00 import; if INC-314 pages twice more I am rolling back the edge config.',
    time: '2026-07-02T08:31:00',
    read: true,
    starred: false,
    body: [
      'Got the pager, thanks for the clean handoff.',
      'Watching INC-311 through the 10:00 batch import — lag is flat so far. If INC-314 pages twice more before lunch I am rolling back the edge cache config and we can re-land it behind a flag next week.',
      'Enjoy the afternoon off.\nDana',
    ],
  },
  {
    id: 'msg-10',
    folder: 'sent',
    from: 'Tomás Ferreira',
    email: 'tomas@lumenanalytics.com',
    subject: 'Re: Warehouse cost spike — need a decision by Friday',
    snippet:
      'Let us take option 1 now and revisit granularity after the Q3 review. Can you have spot capacity live before the weekend runs?',
    time: '2026-06-30T18:12:00',
    read: true,
    starred: false,
    body: [
      'Tomás,',
      'Let us take option 1 now — spot capacity for the nightly rollups — and revisit free-tier granularity after the Q3 usage review, where product is presenting the conversion data anyway.',
      'Can you have spot capacity live before the weekend runs? If the re-run risk shows up in practice we will eat one late morning of rollups, which is acceptable for July.',
      'Dana',
    ],
  },
  {
    id: 'msg-11',
    folder: 'archive',
    from: 'Nadia Chen',
    email: 'nadia@lumenanalytics.com',
    subject: 'June board metrics — final numbers locked',
    snippet:
      'NRR 118%, gross margin 74%, logo churn 1.1%. Deck is locked; thanks for turning the usage section around overnight.',
    time: '2026-06-27T19:44:00',
    read: true,
    starred: true,
    body: [
      'Team,',
      'Final June numbers are locked for the board deck: NRR 118%, gross margin 74%, logo churn 1.1%, and 41 new logos against a plan of 36.',
      'Dana — thank you for turning the usage section around overnight after the pipeline restatement. The cohort view landed exactly the way the board asked for in April.',
      'Deck goes out Monday morning. No further edits, please.\nNadia',
    ],
  },
  {
    id: 'msg-12',
    folder: 'archive',
    from: 'PagerDuty',
    email: 'alerts@pagerduty.com',
    subject: '[RESOLVED] INC-307: API latency above SLO (us-east)',
    snippet:
      'Incident INC-307 was resolved after 42 minutes. Postmortem owner: Marcus Oyelaran. Review due July 3.',
    time: '2026-06-26T04:18:00',
    read: true,
    starred: false,
    body: [
      'Incident INC-307 — API latency above SLO in us-east — was resolved at 04:18 UTC after 42 minutes.',
      'Trigger: p99 latency exceeded 800ms for 10 consecutive minutes. Resolution: connection pool exhaustion on the primary read replica; pool size raised and alerting threshold tightened.',
      'Postmortem owner: Marcus Oyelaran. Review due July 3.',
    ],
  },
  {
    id: 'msg-13',
    folder: 'archive',
    from: 'Workday',
    email: 'no-reply@workday.com',
    subject: 'Reminder: H1 performance reviews close June 30',
    snippet:
      'You have 2 of 6 direct-report reviews remaining. Reviews lock automatically at 11:59 PM on June 30.',
    time: '2026-06-25T09:00:00',
    read: true,
    starred: false,
    body: [
      'This is a reminder that H1 performance reviews close on June 30.',
      'You have 2 of 6 direct-report reviews remaining: Sofia Ortiz and Tomás Ferreira. Reviews lock automatically at 11:59 PM on June 30 and late submissions require VP approval.',
      'Completed reviews become visible to employees on July 8.',
    ],
  },
  {
    id: 'msg-14',
    folder: 'inbox',
    from: 'Amara Diallo',
    email: 'amara@lumenanalytics.com',
    subject: 'SOC 2 bridge letter ready for Cortica',
    snippet:
      'Bridge letter covering Jan–Jun is signed and in the trust portal. I mapped 38 of the 42 questionnaire items already.',
    time: '2026-07-02T10:05:00',
    read: false,
    starred: false,
    body: [
      'Hi Dana,',
      'The SOC 2 bridge letter covering January through June is signed and posted to the trust portal, so Cortica can pull it without an NDA countersign.',
      'I went through their questionnaire this morning and mapped 38 of the 42 items straight to the report. The remaining four are the residency questions — I drafted answers and left them in suggestion mode for your review.',
      'If you approve today, we beat the July 10 deadline by a week.\nAmara',
    ],
  },
  {
    id: 'msg-15',
    folder: 'inbox',
    from: 'Lumen Status',
    email: 'status@lumenanalytics.com',
    subject: 'Scheduled maintenance: July 5, 02:00–04:00 UTC',
    snippet:
      'The metadata database will be upgraded to Postgres 17. Dashboards stay read-only for up to 20 minutes during failover.',
    time: '2026-06-30T12:00:00',
    read: true,
    starred: false,
    body: [
      'Scheduled maintenance window: July 5, 02:00–04:00 UTC.',
      'The metadata database will be upgraded to Postgres 17. Customer dashboards remain available in read-only mode for up to 20 minutes during failover; ingest is unaffected.',
      'Status updates will post to status.lumenanalytics.com throughout the window.',
    ],
  },
];

/** Newest first, stable — fixtures are already unique by timestamp. */
function byNewest(a: MailMessage, b: MailMessage): number {
  return a.time < b.time ? 1 : -1;
}

// ---------------------------------------------------------------------------
// MESSAGE LIST ROW — sender + timestamp line over subject + snippet, with
// unread emphasis (accent dot, semibold sender/subject).
// ---------------------------------------------------------------------------

function MessageRow({
  message,
  isRead,
  isSelected,
  onOpen,
}: {
  message: MailMessage;
  isRead: boolean;
  isSelected: boolean;
  onOpen: (id: string) => void;
}) {
  return (
    <ListItem
      isSelected={isSelected}
      onClick={() => onOpen(message.id)}
      label={
        <HStack gap={2} vAlign="center">
          {!isRead && <StatusDot variant="accent" label="Unread" />}
          <StackItem size="fill">
            <Text
              type="body"
              weight={isRead ? 'normal' : 'semibold'}
              maxLines={1}>
              {message.from}
            </Text>
          </StackItem>
          <div style={styles.rowTimestamp}>
            <Timestamp value={message.time} format="time" hasTooltip={false} />
          </div>
        </HStack>
      }
      description={
        <VStack gap={0}>
          <Text
            type="supporting"
            color="primary"
            weight={isRead ? 'normal' : 'semibold'}
            maxLines={1}>
            {message.subject}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {message.snippet}
          </Text>
        </VStack>
      }
    />
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function InboxTemplate() {
  const [selectedFolderId, setSelectedFolderId] = useState<FolderId>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    'msg-01',
  );
  const [searchQuery, setSearchQuery] = useState('');
  // Live message state, seeded from fixtures: physical folder (Archive
  // moves), read set (opening a row marks it read), starred set (the
  // Starred folder is a virtual view over this).
  const [folderById, setFolderById] = useState<Record<string, MailMessage['folder']>>(
    () => Object.fromEntries(MESSAGES.map(m => [m.id, m.folder] as const)),
  );
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(
    () => new Set(MESSAGES.filter(m => m.read).map(m => m.id)),
  );
  const [starredIds, setStarredIds] = useState<ReadonlySet<string>>(
    () => new Set(MESSAGES.filter(m => m.starred).map(m => m.id)),
  );

  // Responsive contract (see file header).
  const isRailHidden = useMediaQuery('(max-width: 1024px)');
  const isListOnly = useMediaQuery('(max-width: 768px)');

  const unreadByFolder = useMemo(() => {
    const counts: Record<FolderId, number> = {
      inbox: 0,
      starred: 0,
      sent: 0,
      archive: 0,
    };
    for (const message of MESSAGES) {
      if (readIds.has(message.id)) {
        continue;
      }
      counts[folderById[message.id]] += 1;
      if (starredIds.has(message.id)) {
        counts.starred += 1;
      }
    }
    return counts;
  }, [folderById, readIds, starredIds]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleMessages = useMemo(() => {
    return MESSAGES.filter(message => {
      const isInFolder =
        selectedFolderId === 'starred'
          ? starredIds.has(message.id)
          : folderById[message.id] === selectedFolderId;
      if (!isInFolder) {
        return false;
      }
      if (normalizedQuery === '') {
        return true;
      }
      return (
        message.from.toLowerCase().includes(normalizedQuery) ||
        message.subject.toLowerCase().includes(normalizedQuery) ||
        message.snippet.toLowerCase().includes(normalizedQuery)
      );
    }).sort(byNewest);
  }, [selectedFolderId, normalizedQuery, folderById, starredIds]);

  const openMessage =
    visibleMessages.find(message => message.id === selectedMessageId) ?? null;

  const selectedFolder =
    FOLDERS.find(folder => folder.id === selectedFolderId) ?? FOLDERS[0];

  const openFolder = (folderId: FolderId) => {
    setSelectedFolderId(folderId);
    setSelectedMessageId(null);
    setSearchQuery('');
  };

  const openMessageRow = (id: string) => {
    setSelectedMessageId(id);
    setReadIds(prev => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const archiveOpenMessage = () => {
    if (openMessage === null) {
      return;
    }
    // Select the next row down (or the previous one at the end of the
    // list) so triage keeps moving after the archive.
    const index = visibleMessages.indexOf(openMessage);
    const next =
      visibleMessages[index + 1] ?? visibleMessages[index - 1] ?? null;
    setFolderById(prev => ({...prev, [openMessage.id]: 'archive'}));
    setSelectedMessageId(next === null ? null : next.id);
  };

  const toggleStar = (id: string) => {
    setStarredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const folderRail = (
    <Stack direction="vertical" style={styles.railColumn}>
      <StackItem size="fill" style={styles.railList}>
        <List density="compact" hasDividers={false}>
          {FOLDERS.map(folder => {
            const unread = unreadByFolder[folder.id];
            return (
              <ListItem
                key={folder.id}
                label={folder.label}
                isSelected={folder.id === selectedFolderId}
                onClick={() => openFolder(folder.id)}
                startContent={
                  <Icon icon={folder.icon} size="sm" color="secondary" />
                }
                endContent={
                  unread > 0 ? (
                    <Badge label={String(unread)} variant="info" />
                  ) : undefined
                }
              />
            );
          })}
        </List>
      </StackItem>
      <div style={styles.railFooter}>
        <Text type="supporting" color="secondary">
          2.1 GB of 15 GB used
        </Text>
      </div>
    </Stack>
  );

  const messageList = (
    <Stack direction="vertical" style={styles.listColumn}>
      <div style={styles.listSearch}>
        <TextInput
          label={`Search ${selectedFolder.label}`}
          isLabelHidden
          size="sm"
          placeholder={`Search ${selectedFolder.label.toLowerCase()}…`}
          startIcon={MagnifyingGlassIcon}
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>
      <Divider />
      <StackItem size="fill" style={styles.listScroll}>
        {visibleMessages.length === 0 ? (
          <div style={styles.listEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title={
                normalizedQuery === '' ? 'Folder is empty' : 'No matches'
              }
              description={
                normalizedQuery === ''
                  ? 'Messages you move here will show up in this list.'
                  : `Nothing in ${selectedFolder.label} matches "${searchQuery.trim()}".`
              }
            />
          </div>
        ) : (
          <List density="compact" hasDividers>
            {visibleMessages.map(message => (
              <MessageRow
                key={message.id}
                message={message}
                isRead={readIds.has(message.id)}
                isSelected={message.id === selectedMessageId}
                onOpen={openMessageRow}
              />
            ))}
          </List>
        )}
      </StackItem>
    </Stack>
  );

  const readingPane = (
    <Stack direction="vertical" style={styles.readingColumn}>
      <Toolbar
        label="Message actions"
        size="sm"
        dividers={['bottom']}
        startContent={
          <>
            <Button
              label="Reply"
              size="sm"
              variant="secondary"
              icon={<Icon icon={ChatBubbleLeftRightIcon} size="sm" />}
              isDisabled={openMessage === null}
              onClick={() => {}}
            />
            <Button
              label="Archive"
              size="sm"
              variant="ghost"
              icon={<Icon icon={InboxIcon} size="sm" />}
              isDisabled={
                openMessage === null ||
                folderById[openMessage.id] === 'archive'
              }
              onClick={archiveOpenMessage}
            />
            <Button
              label="Snooze"
              size="sm"
              variant="ghost"
              icon={<Icon icon={BellIcon} size="sm" />}
              isDisabled={openMessage === null}
              onClick={() => {}}
            />
          </>
        }
        endContent={
          <IconButton
            label="More actions"
            tooltip="More actions"
            size="sm"
            variant="ghost"
            icon={<Icon icon={EllipsisHorizontalIcon} size="sm" />}
            onClick={() => {}}
          />
        }
      />
      {openMessage === null ? (
        <StackItem size="fill">
          <div style={styles.readingEmpty}>
            <EmptyState
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="Select a message"
              description="Choose a message from the list to read it here."
            />
          </div>
        </StackItem>
      ) : (
        <StackItem size="fill" style={styles.readingScroll}>
          <VStack gap={4} style={styles.readingBody}>
            <HStack gap={2} vAlign="start">
              <StackItem size="fill">
                <Heading level={3}>{openMessage.subject}</Heading>
              </StackItem>
              <Tooltip
                content={
                  starredIds.has(openMessage.id)
                    ? 'Remove star'
                    : 'Star message'
                }>
                <IconButton
                  label={
                    starredIds.has(openMessage.id)
                      ? 'Remove star'
                      : 'Star message'
                  }
                  size="sm"
                  variant={
                    starredIds.has(openMessage.id) ? 'secondary' : 'ghost'
                  }
                  icon={<Icon icon={BookmarkIcon} size="sm" />}
                  onClick={() => toggleStar(openMessage.id)}
                />
              </Tooltip>
            </HStack>
            <HStack gap={3} vAlign="center">
              <Avatar name={openMessage.from} size="small" />
              <StackItem size="fill">
                <VStack gap={0}>
                  <HStack gap={2} vAlign="center">
                    <Text type="body" weight="semibold">
                      {openMessage.from}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {openMessage.email}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {folderById[openMessage.id] === 'sent'
                      ? 'from Dana Whitfield <dana@lumenanalytics.com>'
                      : 'to Dana Whitfield <dana@lumenanalytics.com>'}
                  </Text>
                </VStack>
              </StackItem>
              <Timestamp value={openMessage.time} format="date_time" />
            </HStack>
            <Divider />
            <VStack gap={3}>
              {openMessage.body.map((paragraph, index) => (
                <Text key={index} type="body">
                  {paragraph}
                </Text>
              ))}
            </VStack>
          </VStack>
        </StackItem>
      )}
    </Stack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Mail</Heading>
                <Text type="supporting" color="secondary">
                  {unreadByFolder.inbox} unread
                </Text>
              </HStack>
            </StackItem>
            <Button
              label="Compose"
              icon={<Icon icon={PencilSquareIcon} size="sm" />}
              onClick={() => {}}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isListOnly ? undefined : (
          <>
            {!isRailHidden && (
              <LayoutPanel width={208} padding={0} hasDivider label="Folders">
                {folderRail}
              </LayoutPanel>
            )}
            <LayoutPanel width={340} padding={0} hasDivider label="Messages">
              {messageList}
            </LayoutPanel>
          </>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isListOnly ? messageList : readingPane}
        </LayoutContent>
      }
    />
  );
}
