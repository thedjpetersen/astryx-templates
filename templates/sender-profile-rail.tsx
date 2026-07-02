// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Sender Profile Rail — one open email beside a CRM-lite sender
 *   intelligence rail.
 *
 * @input Deterministic fixtures only: one open message from Dana Whitfield
 *   <dana@meridianhealth.example> ('Renewal paperwork — countersigned
 *   copies', sent 2026-07-02T09:41:00, three body paragraphs, one PDF
 *   attachment), three participants with mini-profile data, and rail
 *   fixtures — relationship metadata (first contacted Jan 12 2024,
 *   23 threads, 4h avg response, 9 AM–5 PM ET), five dated activity
 *   entries, six exchanged files with sizes and source threads, five
 *   recent thread subjects, and one seeded pinned note. No Date.now(),
 *   Math.random(), or network assets — avatars are initials.
 * @output A mail reading surface with sender context: slim LayoutHeader
 *   (back IconButton, subject, reply/forward ButtonGroup + archive and
 *   star toggles in a Toolbar); a centered ~720px reading column
 *   (subject Heading, sender header with Avatar, HoverCard mini-profiles
 *   on every participant chip, AvatarGroup, body paragraphs, attachment
 *   Card whose 'Save to files' Button flips to a checked 'Saved' state,
 *   and a Reply / Reply all / Forward action row that opens an inline
 *   quick-reply composer — Send collapses it into a soft green 'sent'
 *   confirmation chip); and a 340px end LayoutPanel profiling the sender — identity block
 *   with 'Verified sender' Badge + StatusDot and an external-domain
 *   Token, relationship MetadataList, a rail-scoped TabList
 *   (Activity | Files | Threads) whose content scrolls, and a pinned
 *   bottom region with the notes list, an expanding 'Add note' TextArea,
 *   Compose, and a Mute sender ToggleButton that stamps a muted Token
 *   onto the sender header.
 * @position Emitted by `astryx template sender-profile-rail`.
 *
 * Frame (desktop, left to right):
 *   reading pane (fill, centered 720px text column) | sender rail 340px
 *
 * Container policy: the reading pane is a text column, not a card; the
 * only Cards are the attachment tile and HoverCard-adjacent surfaces.
 * The rail is frame-first — identity block fixed at top, tab content
 * scrolls, notes + quick actions pinned at the rail bottom.
 *
 * Distinct from inbox: there is no folder/message-list chrome — the
 * pairing is one message + who-is-this-person intelligence. Distinct
 * from messaging-shell: asynchronous mail with sender research, not a
 * live chat stream. Distinct from a profile page: sender context is a
 * rail anchored to an open message, not a standalone profile
 * destination.
 *
 * Responsive contract:
 * - >980px  — reading pane + 340px end rail, each with its own scroll;
 *   the identity block and quick-action row never scroll away.
 * - <=980px — the rail collapses behind a 'Sender info' Button in the
 *   header; it opens as an end-anchored overlay sheet (scrim click or
 *   X closes). The reading column keeps priority at every width.
 * - The reading column caps at 720px and centers; timestamps keep
 *   tabular numbers so dates align down the rail lists.
 */

import {useState, type CSSProperties} from 'react';

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
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArchiveIcon,
  ArrowLeftIcon,
  BellOffIcon,
  Building2Icon,
  CheckIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  ForwardIcon,
  GlobeIcon,
  MailIcon,
  PaperclipIcon,
  PhoneIcon,
  PinIcon,
  ReplyAllIcon,
  ReplyIcon,
  SendIcon,
  SquarePenIcon,
  StarIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  readingScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-5)',
    paddingBlock: 'var(--spacing-5)',
  },
  // Centered text column: reading measure, not a card.
  readingColumn: {
    maxWidth: 720,
    marginInline: 'auto',
  },
  railColumn: {
    height: '100%',
    minHeight: 0,
  },
  // Host shells can hand the end panel an auto height; cap the docked rail
  // to the visible frame so the tab content scrolls instead of growing the
  // page when the note editor opens. The overlay sheet is already bounded.
  railColumnDocked: {
    maxHeight: 'calc(100dvh - 190px)',
  },
  railSection: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  railTabs: {
    paddingInline: 'var(--spacing-3)',
  },
  railScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-2)',
  },
  // Pinned bottom region: notes never push the quick actions off-frame.
  notesScroll: {
    maxHeight: 168,
    overflowY: 'auto',
  },
  noteCard: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-element)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  attachmentGlyph: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-red)',
  },
  hoverProfile: {
    width: 260,
    padding: 'var(--spacing-1)',
  },
  // <=980px: the rail becomes an end-anchored sheet over a scrim.
  sheetScrim: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--color-overlay)',
    zIndex: 40,
  },
  sheet: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: 'min(340px, 92vw)',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-high)',
    zIndex: 41,
  },
  tabularDate: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // Files tab: keep size + source-thread link on one truncated line.
  fileSize: {
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  fileThread: {
    minWidth: 0,
  },
  // Inline reply composer under the message body.
  composer: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  sentNotice: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--color-background-green)',
    borderRadius: 'var(--radius-element)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in user is Alex Chen at
// Northwind Software; the profiled sender is Dana Whitfield at Meridian
// Health (an external domain).
// ---------------------------------------------------------------------------

interface Participant {
  id: string;
  name: string;
  email: string;
  title: string;
  company: string;
  relation: string;
}

const SENDER: Participant = {
  id: 'dana',
  name: 'Dana Whitfield',
  email: 'dana@meridianhealth.example',
  title: 'VP Procurement',
  company: 'Meridian Health',
  relation: '23 threads with you since Jan 2024',
};

const PARTICIPANTS: Participant[] = [
  SENDER,
  {
    id: 'alex',
    name: 'Alex Chen',
    email: 'alex.chen@northwind.example',
    title: 'Account Executive',
    company: 'Northwind Software',
    relation: 'This is you',
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    email: 'marcus.webb@northwind.example',
    title: 'Deal Desk Lead',
    company: 'Northwind Software',
    relation: 'Cc’d on 9 Meridian threads',
  },
];

const MESSAGE = {
  subject: 'Renewal paperwork — countersigned copies',
  sentAt: '2026-07-02T09:41:00',
  body: [
    'Hi Alex,',
    'Countersigned copies of the MSA are attached — legal turned them around this morning, so we are officially done with redlines. Thank you for holding the line on the data-residency addendum; that language is what got our compliance team to yes a full week early.',
    'Two housekeeping items before the kickoff call: our accounts-payable team needs the final invoice split across the two cost centers we discussed (60/40, Procurement and Clinical Ops), and Marcus should receive the executed copy directly for your deal-desk records. I have cc’d him here so nothing gets lost.',
    'Once the invoice lands I will schedule the implementation kickoff — Thursday mornings are still best on our side. Looking forward to year three.',
  ],
  attachment: {
    name: 'Meridian-MSA-countersigned.pdf',
    size: '1.4 MB',
  },
};

interface ActivityEntry {
  id: string;
  label: string;
  detail: string;
  date: string;
  icon: typeof MailIcon;
}

const ACTIVITY: ActivityEntry[] = [
  {
    id: 'act-1',
    label: 'Signed MSA returned',
    detail: 'Countersigned PDF received on this thread',
    date: '2026-07-02T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'act-2',
    label: 'Call scheduled',
    detail: 'Renewal close-out · 25 minutes',
    date: '2026-06-27T12:00:00',
    icon: PhoneIcon,
  },
  {
    id: 'act-3',
    label: 'Redline v3 received',
    detail: 'Procurement comments on sections 4 and 9',
    date: '2026-06-25T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'act-4',
    label: 'Pricing grid sent',
    detail: 'You sent Renewal-pricing-2026.xlsx',
    date: '2026-06-18T12:00:00',
    icon: SendIcon,
  },
  {
    id: 'act-5',
    label: 'Renewal thread opened',
    detail: 'Dana kicked off the 2026 renewal',
    date: '2026-06-12T12:00:00',
    icon: MailIcon,
  },
];

interface FileEntry {
  id: string;
  name: string;
  size: string;
  thread: string;
  date: string;
  icon: typeof FileTextIcon;
}

const FILES: FileEntry[] = [
  {
    id: 'file-1',
    name: 'Meridian-MSA-countersigned.pdf',
    size: '1.4 MB',
    thread: 'Renewal paperwork — countersigned copies',
    date: '2026-07-02T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'file-2',
    name: 'Meridian-MSA-redline-v3.docx',
    size: '812 KB',
    thread: 'Redline v3 — procurement comments',
    date: '2026-06-25T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'file-3',
    name: 'Renewal-pricing-2026.xlsx',
    size: '96 KB',
    thread: 'Updated pricing grid for the 2026 renewal',
    date: '2026-06-18T12:00:00',
    icon: FileSpreadsheetIcon,
  },
  {
    id: 'file-4',
    name: 'Vendor-security-questionnaire.docx',
    size: '240 KB',
    thread: 'Annual vendor security review',
    date: '2026-05-30T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'file-5',
    name: 'Meridian-DPA-signed.pdf',
    size: '1.1 MB',
    thread: 'Data processing addendum — executed',
    date: '2026-03-14T12:00:00',
    icon: FileTextIcon,
  },
  {
    id: 'file-6',
    name: 'Implementation-timeline.xlsx',
    size: '84 KB',
    thread: 'Year-two rollout planning',
    date: '2026-02-02T12:00:00',
    icon: FileSpreadsheetIcon,
  },
];

interface ThreadEntry {
  id: string;
  subject: string;
  messages: number;
  date: string;
}

const THREADS: ThreadEntry[] = [
  {
    id: 'thr-1',
    subject: 'Renewal paperwork — countersigned copies',
    messages: 6,
    date: '2026-07-02T12:00:00',
  },
  {
    id: 'thr-2',
    subject: 'Renewal close-out call scheduling',
    messages: 4,
    date: '2026-06-27T12:00:00',
  },
  {
    id: 'thr-3',
    subject: 'Redline v3 — procurement comments',
    messages: 11,
    date: '2026-06-25T12:00:00',
  },
  {
    id: 'thr-4',
    subject: 'Updated pricing grid for the 2026 renewal',
    messages: 5,
    date: '2026-06-18T12:00:00',
  },
  {
    id: 'thr-5',
    subject: 'Annual vendor security review',
    messages: 9,
    date: '2026-05-30T12:00:00',
  },
];

interface Note {
  id: string;
  text: string;
  byline: string;
}

const SEED_NOTES: Note[] = [
  {id: 'note-1', text: 'Prefers Thursday calls', byline: 'Alex · Jun 20'},
];

type RailTab = 'activity' | 'files' | 'threads';

type ComposeMode = 'reply' | 'reply-all' | 'forward' | 'new';

const COMPOSE_LABELS: Record<ComposeMode, string> = {
  reply: 'Replying to Dana Whitfield',
  'reply-all': 'Replying to Dana Whitfield and Marcus Webb',
  forward: 'Forwarding "Renewal paperwork — countersigned copies"',
  new: 'New message to Dana Whitfield',
};

const COMPOSE_SENT: Record<ComposeMode, string> = {
  reply: 'Reply sent to Dana Whitfield',
  'reply-all': 'Reply sent to Dana and Marcus',
  forward: 'Message forwarded',
  new: 'Message sent to Dana Whitfield',
};

// ---------------------------------------------------------------------------
// PARTICIPANT CHIP — Token trigger with a HoverCard mini-profile.
// ---------------------------------------------------------------------------

function ParticipantChip({person}: {person: Participant}) {
  return (
    <HoverCard
      placement="below"
      alignment="start"
      content={
        <div style={styles.hoverProfile}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Avatar name={person.name} size="medium" />
              <VStack gap={0}>
                <Text type="body" weight="semibold">
                  {person.name}
                </Text>
                <Text type="supporting" color="secondary">
                  {person.title} · {person.company}
                </Text>
              </VStack>
            </HStack>
            <Divider />
            <HStack gap={1} vAlign="center">
              <Icon icon={MailIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary">
                {person.email}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary">
              {person.relation}
            </Text>
          </VStack>
        </div>
      }>
      <Token label={person.name} size="sm" />
    </HoverCard>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function SenderProfileRailTemplate() {
  const [railTab, setRailTab] = useState<RailTab>('activity');
  const [isStarred, setIsStarred] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAttachmentSaved, setIsAttachmentSaved] = useState(false);
  const [notes, setNotes] = useState<Note[]>(SEED_NOTES);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null);
  const [composeDraft, setComposeDraft] = useState('');
  const [sentNotice, setSentNotice] = useState<string | null>(null);

  // Responsive contract (see file header).
  const isRailCollapsed = useMediaQuery('(max-width: 980px)');

  const openCompose = (mode: ComposeMode) => {
    setComposeMode(mode);
    setSentNotice(null);
    setIsSheetOpen(false);
  };

  const sendCompose = () => {
    if (composeMode === null || composeDraft.trim() === '') {
      return;
    }
    setSentNotice(COMPOSE_SENT[composeMode]);
    setComposeDraft('');
    setComposeMode(null);
  };

  const saveNote = () => {
    const text = noteDraft.trim();
    if (text === '') {
      return;
    }
    // Fixed byline stamp — fixtures stay deterministic.
    setNotes(prev => [...prev, {id: `note-${prev.length + 1}`, text, byline: 'You · Jul 2'}]);
    setNoteDraft('');
    setIsNoteEditorOpen(false);
  };

  // ---- rail tab content ----

  const activityList = (
    <List density="compact" hasDividers={false}>
      {ACTIVITY.map(entry => (
        <ListItem
          key={entry.id}
          label={entry.label}
          description={entry.detail}
          startContent={<Icon icon={entry.icon} size="sm" color="secondary" />}
          endContent={
            <div style={styles.tabularDate}>
              <Timestamp value={entry.date} format="date" hasTooltip={false} />
            </div>
          }
        />
      ))}
    </List>
  );

  const filesList = (
    <List density="compact" hasDividers={false}>
      {FILES.map(file => (
        <ListItem
          key={file.id}
          label={
            <Text type="body" maxLines={1}>
              {file.name}
            </Text>
          }
          description={
            <HStack gap={1} vAlign="center">
              <Text type="supporting" color="secondary" style={styles.fileSize}>
                {file.size} ·
              </Text>
              <StackItem size="fill" style={styles.fileThread}>
                <Link
                  type="supporting"
                  maxLines={1}
                  onClick={() => setRailTab('threads')}
                  tooltip="Open the source thread list">
                  {file.thread}
                </Link>
              </StackItem>
            </HStack>
          }
          startContent={<Icon icon={file.icon} size="sm" color="secondary" />}
        />
      ))}
    </List>
  );

  const threadsList = (
    <List density="compact" hasDividers={false}>
      {THREADS.map(thread => (
        <ListItem
          key={thread.id}
          label={
            <Text type="body" maxLines={1}>
              {thread.subject}
            </Text>
          }
          description={`${thread.messages} messages`}
          startContent={
            <Icon icon={MailIcon} size="sm" color="secondary" />
          }
          endContent={
            <div style={styles.tabularDate}>
              <Timestamp value={thread.date} format="date" hasTooltip={false} />
            </div>
          }
        />
      ))}
    </List>
  );

  const tabContent =
    railTab === 'activity'
      ? activityList
      : railTab === 'files'
        ? filesList
        : threadsList;

  // ---- sender rail (shared between the end panel and the overlay sheet) ----

  const renderSenderRail = (variant: 'docked' | 'sheet') => (
    <Stack
      direction="vertical"
      style={
        variant === 'docked'
          ? {...styles.railColumn, ...styles.railColumnDocked}
          : styles.railColumn
      }>
      {/* Identity block — fixed at the top of the rail. */}
      <div style={styles.railSection}>
        <VStack gap={3}>
          <HStack gap={3} vAlign="center">
            <Avatar name={SENDER.name} size={48} />
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={3}>{SENDER.name}</Heading>
                <Text type="supporting" color="secondary">
                  {SENDER.title}
                </Text>
                <HStack gap={1} vAlign="center">
                  <Icon icon={Building2Icon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    {SENDER.company}
                  </Text>
                </HStack>
              </VStack>
            </StackItem>
          </HStack>
          <HStack gap={2} vAlign="center">
            <Badge label="Verified sender" variant="green" />
            <StatusDot variant="success" label="Active this week" />
            <Text type="supporting" color="secondary">
              Active this week
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <Token
              label="meridianhealth.example"
              size="sm"
              color="gray"
              icon={<Icon icon={GlobeIcon} size="sm" color="inherit" />}
              description="External domain"
            />
            <Text type="supporting" color="secondary">
              External domain
            </Text>
          </HStack>
        </VStack>
      </div>
      <Divider />
      <div style={styles.railSection}>
        <MetadataList
          columns="single"
          label={{position: 'start', width: 128}}
          title="Relationship">
          <MetadataListItem label="First contacted">
            <Timestamp
              value="2024-01-12T12:00:00"
              format="date"
              hasTooltip={false}
            />
          </MetadataListItem>
          <MetadataListItem label="Total threads">23</MetadataListItem>
          <MetadataListItem label="Avg response time">4h</MetadataListItem>
          <MetadataListItem label="Usually replies">
            9 AM–5 PM ET
          </MetadataListItem>
        </MetadataList>
      </div>
      <div style={styles.railTabs}>
        <TabList
          value={railTab}
          onChange={value => setRailTab(value as RailTab)}
          size="sm"
          hasDivider>
          <Tab value="activity" label="Activity" />
          <Tab value="files" label="Files" />
          <Tab value="threads" label="Threads" />
        </TabList>
      </div>
      {/* Only the tab content scrolls. */}
      <StackItem size="fill" style={styles.railScroll}>
        {tabContent}
      </StackItem>
      <Divider />
      {/* Pinned bottom region: notes list + quick actions. */}
      <div style={styles.railSection}>
        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={PinIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary" weight="semibold">
              Pinned notes
            </Text>
          </HStack>
          <div style={styles.notesScroll}>
            <VStack gap={1}>
              {notes.map(note => (
                <div key={note.id} style={styles.noteCard}>
                  <VStack gap={0}>
                    <Text type="supporting" color="primary">
                      {note.text}
                    </Text>
                    <Text type="supporting" color="secondary">
                      {note.byline}
                    </Text>
                  </VStack>
                </div>
              ))}
            </VStack>
          </div>
          {isNoteEditorOpen && (
            <VStack gap={2}>
              <TextArea
                label="New note"
                isLabelHidden
                placeholder="Add a note about Dana…"
                value={noteDraft}
                onChange={setNoteDraft}
                rows={3}
              />
              <HStack gap={2}>
                <Button
                  label="Save note"
                  size="sm"
                  variant="primary"
                  isDisabled={noteDraft.trim() === ''}
                  onClick={saveNote}
                />
                <Button
                  label="Cancel"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsNoteEditorOpen(false);
                    setNoteDraft('');
                  }}
                />
              </HStack>
            </VStack>
          )}
          <HStack gap={2} vAlign="center">
            <Button
              label="Compose"
              size="sm"
              variant="secondary"
              icon={<Icon icon={SquarePenIcon} size="sm" color="inherit" />}
              tooltip="New message to Dana"
              onClick={() => openCompose('new')}
            />
            <ToggleButton
              label={isMuted ? 'Muted' : 'Mute'}
              size="sm"
              isPressed={isMuted}
              onPressedChange={setIsMuted}
              tooltip={
                isMuted
                  ? 'Unmute Dana Whitfield'
                  : 'Mute notifications from Dana Whitfield'
              }
            />
            <ToggleButton
              label="Add note"
              size="sm"
              isPressed={isNoteEditorOpen}
              onPressedChange={setIsNoteEditorOpen}
            />
          </HStack>
        </VStack>
      </div>
    </Stack>
  );

  // ---- reading pane ----

  const readingPane = (
    <div style={styles.readingScroll}>
      <div style={styles.readingColumn}>
        <VStack gap={4}>
          <HStack gap={2} vAlign="start">
            <StackItem size="fill">
              <Heading level={2}>{MESSAGE.subject}</Heading>
            </StackItem>
            {isArchived && <Badge label="Archived" variant="neutral" />}
          </HStack>

          {/* Sender header: avatar + participant chips with HoverCard
              mini-profiles; a muted Token appears while the sender is
              muted from the rail. */}
          <HStack gap={3} vAlign="start">
            <Avatar name={SENDER.name} size="medium" />
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center">
                  <ParticipantChip person={PARTICIPANTS[0]} />
                  <Text type="supporting" color="secondary">
                    {SENDER.email}
                  </Text>
                  {isMuted && (
                    <Token
                      label="Muted"
                      size="sm"
                      color="gray"
                      icon={
                        <Icon icon={BellOffIcon} size="sm" color="inherit" />
                      }
                    />
                  )}
                </HStack>
                <HStack gap={1} vAlign="center">
                  <Text type="supporting" color="secondary">
                    to
                  </Text>
                  <ParticipantChip person={PARTICIPANTS[1]} />
                  <Text type="supporting" color="secondary">
                    · cc
                  </Text>
                  <ParticipantChip person={PARTICIPANTS[2]} />
                </HStack>
              </VStack>
            </StackItem>
            <VStack gap={1} hAlign="end">
              <Timestamp value={MESSAGE.sentAt} format="date_time" />
              <AvatarGroup size="tiny" aria-label="Thread participants">
                {PARTICIPANTS.map(person => (
                  <Avatar key={person.id} name={person.name} />
                ))}
              </AvatarGroup>
            </VStack>
          </HStack>

          <Divider />

          <VStack gap={3}>
            {MESSAGE.body.map((paragraph, index) => (
              <Text key={index} type="body">
                {paragraph}
              </Text>
            ))}
          </VStack>

          <VStack gap={2}>
            <HStack gap={1} vAlign="center">
              <Icon icon={PaperclipIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" weight="semibold">
                1 attachment
              </Text>
            </HStack>
            <Card padding={3} maxWidth={480}>
              <HStack gap={3} vAlign="center">
                <div style={styles.attachmentGlyph}>
                  <Icon icon={FileTextIcon} size="md" color="red" />
                </div>
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="body" weight="semibold" maxLines={1}>
                      {MESSAGE.attachment.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      PDF · {MESSAGE.attachment.size}
                    </Text>
                  </VStack>
                </StackItem>
                <Button
                  label={isAttachmentSaved ? 'Saved' : 'Save to files'}
                  size="sm"
                  variant={isAttachmentSaved ? 'ghost' : 'secondary'}
                  icon={
                    <Icon
                      icon={isAttachmentSaved ? CheckIcon : DownloadIcon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  onClick={() => setIsAttachmentSaved(prev => !prev)}
                />
              </HStack>
            </Card>
          </VStack>

          <Divider />

          {/* Quick-reply area: the action row opens an inline composer;
              sending collapses it into a soft confirmation. */}
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <Button
                label="Reply"
                size="sm"
                variant="secondary"
                icon={<Icon icon={ReplyIcon} size="sm" color="inherit" />}
                onClick={() => openCompose('reply')}
              />
              <Button
                label="Reply all"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ReplyAllIcon} size="sm" color="inherit" />}
                onClick={() => openCompose('reply-all')}
              />
              <Button
                label="Forward"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ForwardIcon} size="sm" color="inherit" />}
                onClick={() => openCompose('forward')}
              />
            </HStack>
            {composeMode !== null && (
              <div style={styles.composer}>
                <VStack gap={2}>
                  <Text type="supporting" color="secondary">
                    {COMPOSE_LABELS[composeMode]}
                  </Text>
                  <TextArea
                    label="Message"
                    isLabelHidden
                    placeholder="Write your message…"
                    value={composeDraft}
                    onChange={setComposeDraft}
                    rows={4}
                  />
                  <HStack gap={2}>
                    <Button
                      label="Send"
                      size="sm"
                      variant="primary"
                      icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                      isDisabled={composeDraft.trim() === ''}
                      onClick={sendCompose}
                    />
                    <Button
                      label="Discard"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setComposeMode(null);
                        setComposeDraft('');
                      }}
                    />
                  </HStack>
                </VStack>
              </div>
            )}
            {sentNotice !== null && (
              <div style={styles.sentNotice}>
                <HStack gap={1} vAlign="center">
                  <Icon icon={CheckIcon} size="sm" color="green" />
                  <Text type="supporting" color="secondary">
                    {sentNotice}
                  </Text>
                </HStack>
              </div>
            )}
          </VStack>
        </VStack>
      </div>
    </div>
  );

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center">
              <IconButton
                label="Back to inbox"
                tooltip="Back to inbox"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                onClick={() => {}}
              />
              <StackItem size="fill">
                <Text type="body" weight="semibold" maxLines={1}>
                  {MESSAGE.subject}
                </Text>
              </StackItem>
              <Toolbar
                label="Message actions"
                size="sm"
                startContent={
                  <>
                    <ButtonGroup label="Reply actions" size="sm">
                      <IconButton
                        label="Reply"
                        tooltip="Reply to Dana"
                        icon={<Icon icon={ReplyIcon} size="sm" />}
                        onClick={() => openCompose('reply')}
                      />
                      <IconButton
                        label="Reply all"
                        tooltip="Reply all"
                        icon={<Icon icon={ReplyAllIcon} size="sm" />}
                        onClick={() => openCompose('reply-all')}
                      />
                      <IconButton
                        label="Forward"
                        tooltip="Forward"
                        icon={<Icon icon={ForwardIcon} size="sm" />}
                        onClick={() => openCompose('forward')}
                      />
                    </ButtonGroup>
                    <IconButton
                      label={isArchived ? 'Move to inbox' : 'Archive'}
                      tooltip={isArchived ? 'Move to inbox' : 'Archive'}
                      size="sm"
                      variant={isArchived ? 'secondary' : 'ghost'}
                      icon={<Icon icon={ArchiveIcon} size="sm" />}
                      onClick={() => setIsArchived(prev => !prev)}
                    />
                    <Tooltip
                      content={isStarred ? 'Remove star' : 'Star message'}>
                      <IconButton
                        label={isStarred ? 'Remove star' : 'Star message'}
                        size="sm"
                        variant={isStarred ? 'secondary' : 'ghost'}
                        icon={<Icon icon={StarIcon} size="sm" />}
                        onClick={() => setIsStarred(prev => !prev)}
                      />
                    </Tooltip>
                  </>
                }
                endContent={
                  isRailCollapsed ? (
                    <Button
                      label="Sender info"
                      size="sm"
                      variant="secondary"
                      icon={<Icon icon={UserRoundIcon} size="sm" color="inherit" />}
                      onClick={() => setIsSheetOpen(true)}
                    />
                  ) : undefined
                }
              />
            </HStack>
          </LayoutHeader>
        }
        content={<LayoutContent padding={0}>{readingPane}</LayoutContent>}
        end={
          isRailCollapsed ? undefined : (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              isScrollable={false}
              label="Sender profile">
              {renderSenderRail('docked')}
            </LayoutPanel>
          )
        }
      />
      {/* <=980px: sender rail as an end-anchored overlay sheet. */}
      {isRailCollapsed && isSheetOpen && (
        <>
          <div
            style={styles.sheetScrim}
            aria-hidden
            onClick={() => setIsSheetOpen(false)}
          />
          <div
            style={styles.sheet}
            role="dialog"
            aria-label="Sender profile for Dana Whitfield">
            <div style={styles.railSection}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary" weight="semibold">
                    Sender profile
                  </Text>
                </StackItem>
                <IconButton
                  label="Close sender profile"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={XIcon} size="sm" />}
                  onClick={() => setIsSheetOpen(false)}
                />
              </HStack>
            </div>
            <Divider />
            <StackItem size="fill" style={{minHeight: 0}}>
              {renderSenderRail('sheet')}
            </StackItem>
          </div>
        </>
      )}
    </>
  );
}
