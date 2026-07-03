var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Conversation Thread Reader — one email thread read deeply.
 * @input Deterministic fixtures only: one email thread ('Re: Contract
 *   renewal — Meridian Health') of 5 messages with fixed ISO timestamps
 *   spanning Jun 24 → Jul 2, 2026, four participants (Dana Whitfield at
 *   Meridian Health — external; Alex Chen — the signed-in user; Marcus
 *   Webb — legal; procurement@meridianhealth.example), two document
 *   attachments on message 4, quoted-history paragraphs, and emoji
 *   reaction chips. No Date.now(), Math.random(), or network assets —
 *   Avatars are initials only.
 * @output Full-width single-conversation reader: a sticky LayoutHeader
 *   with breadcrumb-back Link, the subject, a '5 messages' counter, an
 *   archive/star/reply-all Toolbar, label Tokens (Legal, Renewals) and a
 *   participants AvatarGroup; below, a centered ~760px scrolling column
 *   where the oldest 3 messages are collapsed to one-line
 *   sender/snippet/date rows (click to expand, click the header to
 *   re-collapse), and expanded messages show an Avatar header, a 'show
 *   details' Popover with a full From/To/Cc/Date MetadataList, body
 *   text, a '•••' trimmed-quote toggle revealing indented quoted
 *   history, inline attachment Cards, and toggleable emoji-reaction
 *   chips. A Reply/Reply all/Forward ButtonGroup at the bottom expands
 *   into an inline composer seeded by tappable quick-reply chips; Send
 *   disables while the draft is empty.
 * @position Emitted by \`astryx template mail-thread-reader\`.
 *
 * Frame: Layout height="fill", contentWidth 760. LayoutHeader is the
 * sticky subject/action bar (two rows: breadcrumb-back + subject +
 * Toolbar; label Tokens + participants AvatarGroup). LayoutContent
 * scrolls as one centered column: collapsed messages are 44px
 * single-line rows; expanded messages are borderless sections separated
 * by Dividers. The reply composer sits in-flow at the column bottom and
 * expands from a 48px ButtonGroup row to a ~200px editor Card.
 *
 * Container policy (deep-read archetype): the thread itself is
 * borderless prose separated by Dividers — the only Cards are inline
 * attachment tiles and the expanded reply composer.
 *
 * Distinct from inbox: the entire surface is ONE conversation read
 * deeply — no folder rail, no message list. Distinct from
 * messaging-shell: messages are discrete emails with quoted history and
 * formal From/To/Cc headers, not a live chat stream.
 *
 * Responsive contract:
 * - >640px  — two-row header (subject row + labels/participants row);
 *   quoted history indents by a 3px rule plus spacing-4.
 * - <=640px — the header collapses to the subject row only (labels and
 *   AvatarGroup hide), the '5 messages' counter hides and 'Reply all'
 *   collapses to an icon button so the subject keeps room; quoted-
 *   history indentation shrinks to spacing-2; the message column keeps
 *   full width with tighter padding; the collapsed-row sender column
 *   narrows 128 → 96px; the details Popover narrows 400 → 320px so it
 *   fits a 375px viewport; the sm controls (archive/star/reply-all,
 *   'Show details', the '•••' quote toggle, close-composer) grow to
 *   40px touch targets and the clickable Tokens (reaction chip,
 *   quick replies) sit on >=44px unstyled-button hit areas.
 * - The header stays pinned at every width; only the message column
 *   scrolls.
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
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup, AvatarGroupOverflow} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Popover} from '@astryxdesign/core/Popover';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EllipsisIcon,
  FileIcon,
  FileTextIcon,
  ForwardIcon,
  PaperclipIcon,
  ReplyAllIcon,
  ReplyIcon,
  SendIcon,
  StarIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  column: {
    paddingBlock: 'var(--spacing-4)',
  },
  columnCompact: {
    paddingBlock: 'var(--spacing-3)',
  },
  // Full-width unstyled button so the whole header row toggles the
  // message (the Collapsible trigger cannot span the column).
  rowButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
  },
  // Collapsed messages read as 44px single-line rows.
  collapsedRow: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  // Fixed sender column so collapsed names never truncate and the
  // snippets left-align across rows; narrower below 640px so the
  // snippet keeps a readable share of the row.
  senderCol: {
    width: 128,
    flexShrink: 0,
  },
  senderColCompact: {
    width: 96,
    flexShrink: 0,
  },
  // Timestamps and counters never wrap or shrink.
  noWrapCell: {
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  expandedHeader: {
    paddingBlock: 'var(--spacing-2)',
    width: '100%',
  },
  messageBody: {
    paddingTop: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  // Quoted history: indented behind a 3px rule; indentation shrinks
  // below 640px (see quoteBlockCompact).
  quoteBlock: {
    borderLeft: '3px solid var(--color-border)',
    paddingLeft: 'var(--spacing-4)',
    marginLeft: 'var(--spacing-1)',
  },
  quoteBlockCompact: {
    borderLeft: '3px solid var(--color-border)',
    paddingLeft: 'var(--spacing-2)',
    marginLeft: 0,
  },
  attachmentTile: {
    minWidth: 220,
  },
  attachmentIconWell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  composerRow: {
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    paddingTop: 'var(--spacing-3)',
  },
  composerCard: {
    marginTop: 'var(--spacing-3)',
  },
  // <=640px: grow the sm controls to >=40px touch targets (size="sm"
  // renders a 28px box; the icon glyphs stay "sm").
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
  // Clickable Tokens render ~20px tall, so the click lives on an
  // unstyled native button around the chip — same footprint on
  // desktop, a >=44px touch target when the layout is compact.
  tokenButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
  },
  tokenButtonCompact: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    minHeight: 44,
    minWidth: 44,
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in user is Alex Chen,
// account lead at Coreline Systems; Meridian Health is the customer.
// ---------------------------------------------------------------------------

const SUBJECT = 'Re: Contract renewal — Meridian Health';
const THREAD_LABELS: Array<{label: string; color: 'purple' | 'blue'}> = [
  {label: 'Legal', color: 'purple'},
  {label: 'Renewals', color: 'blue'},
];

type ParticipantId = 'dana' | 'alex' | 'marcus' | 'procurement';

interface Participant {
  name: string;
  email: string;
  detail: string;
  isExternal: boolean;
}

const PARTICIPANTS: Record<ParticipantId, Participant> = {
  dana: {
    name: 'Dana Whitfield',
    email: 'dana.whitfield@meridianhealth.example',
    detail: 'VP Vendor Management, Meridian Health',
    isExternal: true,
  },
  alex: {
    name: 'Alex Chen',
    email: 'alex.chen@coreline.example',
    detail: 'Account lead, Coreline Systems (you)',
    isExternal: false,
  },
  marcus: {
    name: 'Marcus Webb',
    email: 'marcus.webb@coreline.example',
    detail: 'Commercial counsel, Coreline Systems',
    isExternal: false,
  },
  procurement: {
    name: 'Meridian Procurement',
    email: 'procurement@meridianhealth.example',
    detail: 'Shared mailbox, Meridian Health',
    isExternal: true,
  },
};

interface Attachment {
  name: string;
  size: string;
  icon: typeof FileTextIcon;
}

interface ThreadMessage {
  id: string;
  from: ParticipantId;
  to: ParticipantId[];
  cc: ParticipantId[];
  /** Fixed ISO timestamp — no clocks. */
  sentAt: string;
  snippet: string;
  body: string[];
  /** Trimmed quoted history revealed by the '•••' toggle. */
  quote?: {attribution: string; paragraphs: string[]};
  attachments: Attachment[];
  /** Emoji reaction chip; self-inclusion toggles on top of these names. */
  reaction?: {emoji: string; reactors: string[]};
}

// Dana's Jun 26 paragraph — shown in message 3 and revealed again by the
// trimmed-quote toggle on Marcus's Jun 30 reply.
const DANA_JUN26_PARAGRAPH =
  'Our main sticking point is section 7.2: the draft still carries a ' +
  '90-day termination-for-convenience window, and our board approved the ' +
  'renewal on the basis of 60 days. If Coreline can meet us at 60, ' +
  'procurement can route the rest of the paperwork this cycle.';

const MESSAGES: ThreadMessage[] = [
  {
    id: 'msg-1',
    from: 'dana',
    to: ['alex'],
    cc: ['procurement'],
    sentAt: '2026-06-24T09:12:00',
    snippet:
      'Thanks Alex, looping in procurement so they can track the renewal paperwork from here…',
    body: [
      'Thanks Alex, looping in procurement so they can track the renewal paperwork from here. They own the signature routing on our side once terms are settled.',
      'We are still targeting a July 15 effective date, so anything you can do to keep the legal review moving this month is appreciated.',
      'Best,\\nDana',
    ],
    attachments: [],
  },
  {
    id: 'msg-2',
    from: 'alex',
    to: ['dana'],
    cc: ['marcus', 'procurement'],
    sentAt: '2026-06-25T15:40:00',
    snippet:
      'Adding Marcus from our legal team — updated term sheet and MSA draft coming your way tomorrow…',
    body: [
      'Hi Dana,',
      'Adding Marcus from our legal team — he owns the MSA language on our side. An updated term sheet and MSA draft are coming your way tomorrow with the three-year pricing we discussed.',
      'Once your team has comments, Marcus can turn a redline around within two business days.',
      'Thanks,\\nAlex',
    ],
    attachments: [],
  },
  {
    id: 'msg-3',
    from: 'dana',
    to: ['alex'],
    cc: ['marcus', 'procurement'],
    sentAt: '2026-06-26T11:05:00',
    snippet:
      'Our main sticking point is section 7.2: the draft still carries a 90-day termination-for-convenience…',
    body: [
      'Alex, Marcus,',
      DANA_JUN26_PARAGRAPH,
      'On pricing, exhibit B looks close — procurement just wants the annual escalator stated explicitly rather than by reference.',
      'Dana',
    ],
    attachments: [],
  },
  {
    id: 'msg-4',
    from: 'marcus',
    to: ['dana'],
    cc: ['alex', 'procurement'],
    sentAt: '2026-06-30T16:48:00',
    snippet:
      'Redline attached — section 7.2 termination-for-convenience now reads 60 days, and exhibit B states the 4% escalator…',
    body: [
      'Dana,',
      'Redline attached. Section 7.2 now reads a 60-day termination-for-convenience window, matching your board approval, and I tightened the notice mechanics in 7.2(b) so the window runs from written notice rather than invoice date.',
      'Exhibit B is also updated: the 4% annual escalator is stated explicitly in the fee table, per procurement’s note.',
      'If these land well, we can be signature-ready this week.',
      'Marcus',
    ],
    quote: {
      attribution: 'On Jun 26, 2026, Dana Whitfield wrote:',
      paragraphs: [DANA_JUN26_PARAGRAPH],
    },
    attachments: [
      {name: 'MSA-redline-v3.docx', size: '182 KB', icon: FileTextIcon},
      {name: 'pricing-exhibit-B.pdf', size: '96 KB', icon: FileIcon},
    ],
    reaction: {emoji: '✅', reactors: ['Dana Whitfield']},
  },
  {
    id: 'msg-5',
    from: 'dana',
    to: ['alex', 'marcus'],
    cc: ['procurement'],
    sentAt: '2026-07-02T08:54:00',
    snippet:
      'The 60-day window and the explicit escalator both work — routing for signature now, expect DocuSign by Thursday…',
    body: [
      'Marcus, Alex,',
      'The 60-day window in section 7.2 and the explicit escalator in exhibit B both work for us. Procurement is routing the packet for signature now — expect the DocuSign envelope by Thursday.',
      'If anything snags in routing, are you free for a quick call Friday morning to keep the July 15 effective date?',
      'Dana',
    ],
    quote: {
      attribution: 'On Jun 30, 2026, Marcus Webb wrote:',
      paragraphs: [
        'Redline attached. Section 7.2 now reads a 60-day termination-for-convenience window, matching your board approval…',
      ],
    },
    attachments: [],
    reaction: {emoji: '👍', reactors: ['Alex Chen', 'Marcus Webb']},
  },
];

const QUICK_REPLIES = [
  'Sounds good — sending Thursday',
  'Reviewing the redline now',
  'Can we do a quick call?',
];

type ComposerMode = 'reply' | 'reply-all' | 'forward';

const COMPOSER_MODES: Array<{
  mode: ComposerMode;
  label: string;
  icon: typeof ReplyIcon;
}> = [
  {mode: 'reply', label: 'Reply', icon: ReplyIcon},
  {mode: 'reply-all', label: 'Reply all', icon: ReplyAllIcon},
  {mode: 'forward', label: 'Forward', icon: ForwardIcon},
];

const LAST_MESSAGE = MESSAGES[MESSAGES.length - 1];

/** Recipient line shown under the composer mode label. */
function composerRecipients(mode: ComposerMode): string {
  const sender = PARTICIPANTS[LAST_MESSAGE.from];
  if (mode === 'reply') {
    return \`To: \${sender.name} <\${sender.email}>\`;
  }
  if (mode === 'reply-all') {
    const others = [...LAST_MESSAGE.to, ...LAST_MESSAGE.cc]
      .filter(id => id !== 'alex')
      .map(id => PARTICIPANTS[id].name);
    return \`To: \${sender.name} · Cc: \${others.join(', ')}\`;
  }
  return 'To: add recipients — the full thread will be included below';
}

function recipientSummary(message: ThreadMessage): string {
  const to = message.to.map(id => PARTICIPANTS[id].name).join(', ');
  const cc = message.cc.map(id => PARTICIPANTS[id].name).join(', ');
  return cc === '' ? \`to \${to}\` : \`to \${to} · cc \${cc}\`;
}

// ---------------------------------------------------------------------------
// SET HELPERS — immutable toggle for the per-message useState maps.
// ---------------------------------------------------------------------------

function toggled(set: ReadonlySet<string>, id: string): Set<string> {
  const next = new Set(set);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MailThreadReaderTemplate() {
  // Per-message expanded/collapsed map — the two newest start expanded.
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(['msg-4', 'msg-5']),
  );
  // '•••' trimmed-quote toggles, per message.
  const [openQuoteIds, setOpenQuoteIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  // 'Show details' Popover — at most one open at a time.
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);
  // Reaction chips: whether the signed-in user joined each reaction.
  const [selfReactedIds, setSelfReactedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [isStarred, setIsStarred] = useState(true);
  const [isArchived, setIsArchived] = useState(false);
  // Composer: null = collapsed ButtonGroup row.
  const [composerMode, setComposerMode] = useState<ComposerMode | null>(null);
  const [draft, setDraft] = useState('');
  const [sentNote, setSentNote] = useState<string | null>(null);

  // Responsive contract (see file header).
  const isCompact = useMediaQuery('(max-width: 640px)');

  const openComposer = (mode: ComposerMode) => {
    setComposerMode(mode);
    setSentNote(null);
  };

  const closeComposer = () => {
    setComposerMode(null);
    setDraft('');
  };

  const sendDraft = () => {
    if (composerMode === null || draft.trim() === '') {
      return;
    }
    const modeLabel =
      COMPOSER_MODES.find(entry => entry.mode === composerMode)?.label ??
      'Reply';
    const trimmed = draft.trim();
    const preview =
      trimmed.length > 48 ? \`\${trimmed.slice(0, 48)}…\` : trimmed;
    setSentNote(\`\${modeLabel} sent — “\${preview}” queued for delivery.\`);
    closeComposer();
  };

  // ----- header ------------------------------------------------------------

  const threadToolbar = (
    <Toolbar
      label="Thread actions"
      size="sm"
      startContent={
        <>
          <Tooltip content={isArchived ? 'Move back to Inbox' : 'Archive thread'}>
            <IconButton
              label={isArchived ? 'Move back to Inbox' : 'Archive thread'}
              size="sm"
              variant="ghost"
              style={isCompact ? styles.iconTapTarget : undefined}
              icon={
                <Icon
                  icon={isArchived ? ArchiveRestoreIcon : ArchiveIcon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => setIsArchived(prev => !prev)}
            />
          </Tooltip>
          <Tooltip content={isStarred ? 'Remove star' : 'Star thread'}>
            <IconButton
              label={isStarred ? 'Remove star' : 'Star thread'}
              size="sm"
              variant={isStarred ? 'secondary' : 'ghost'}
              style={isCompact ? styles.iconTapTarget : undefined}
              icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
              onClick={() => setIsStarred(prev => !prev)}
            />
          </Tooltip>
          {isCompact ? (
            <Tooltip content="Reply all">
              <IconButton
                label="Reply all"
                size="sm"
                variant="secondary"
                style={styles.iconTapTarget}
                icon={<Icon icon={ReplyAllIcon} size="sm" color="inherit" />}
                onClick={() => openComposer('reply-all')}
              />
            </Tooltip>
          ) : (
            <Button
              label="Reply all"
              size="sm"
              variant="secondary"
              icon={<Icon icon={ReplyAllIcon} size="sm" color="inherit" />}
              onClick={() => openComposer('reply-all')}
            />
          )}
        </>
      }
    />
  );

  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={isCompact ? 0 : 2}>
        <HStack gap={2} vAlign="center">
          <Link href="#inbox" label="Back to Inbox">
            <Icon icon={ArrowLeftIcon} size="sm" color="secondary" />
          </Link>
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Heading level={1} maxLines={1}>
                {SUBJECT}
              </Heading>
              {isArchived && <Badge label="Archived" variant="neutral" />}
            </HStack>
          </StackItem>
          {!isCompact && (
            <div style={styles.noWrapCell}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {MESSAGES.length} messages
              </Text>
            </div>
          )}
          {threadToolbar}
        </HStack>
        {!isCompact && (
          <HStack gap={2} vAlign="center">
            {THREAD_LABELS.map(entry => (
              <Token
                key={entry.label}
                label={entry.label}
                size="sm"
                color={entry.color}
              />
            ))}
            <Badge label="External" variant="warning" />
            <StackItem size="fill">
              <span />
            </StackItem>
            <Text type="supporting" color="secondary">
              Jun 24 – Jul 2, 2026
            </Text>
            <AvatarGroup size="small" aria-label="Thread participants">
              <Avatar name={PARTICIPANTS.dana.name} size="small" />
              <Avatar name={PARTICIPANTS.alex.name} size="small" />
              <Avatar name={PARTICIPANTS.marcus.name} size="small" />
              <AvatarGroupOverflow count={1} />
            </AvatarGroup>
          </HStack>
        )}
      </VStack>
    </LayoutHeader>
  );

  // ----- per-message pieces --------------------------------------------------

  const detailsPopover = (message: ThreadMessage) => (
    <Popover
      label={\`Message details — \${PARTICIPANTS[message.from].name}\`}
      width={isCompact ? 320 : 400}
      placement="below"
      alignment="end"
      isOpen={detailsOpenId === message.id}
      onOpenChange={open => setDetailsOpenId(open ? message.id : null)}
      content={
        <MetadataList label={{position: 'start', width: 56}}>
          <MetadataListItem label="From">
            <VStack gap={0}>
              <Text type="supporting">
                {PARTICIPANTS[message.from].name} ·{' '}
                {PARTICIPANTS[message.from].detail}
              </Text>
              <Link
                href={\`mailto:\${PARTICIPANTS[message.from].email}\`}
                type="supporting">
                {PARTICIPANTS[message.from].email}
              </Link>
            </VStack>
          </MetadataListItem>
          <MetadataListItem label="To">
            <VStack gap={0}>
              {message.to.map(id => (
                <Text key={id} type="supporting">
                  {PARTICIPANTS[id].name} &lt;{PARTICIPANTS[id].email}&gt;
                </Text>
              ))}
            </VStack>
          </MetadataListItem>
          <MetadataListItem label="Cc">
            <VStack gap={0}>
              {message.cc.map(id => (
                <Text key={id} type="supporting">
                  {PARTICIPANTS[id].name} &lt;{PARTICIPANTS[id].email}&gt;
                </Text>
              ))}
            </VStack>
          </MetadataListItem>
          <MetadataListItem label="Date">
            <Timestamp value={message.sentAt} format="date_time" hasTooltip={false} />
          </MetadataListItem>
        </MetadataList>
      }>
      <Button
        label="Show details"
        size="sm"
        variant="ghost"
        style={isCompact ? styles.buttonTapTarget : undefined}
        icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
      />
    </Popover>
  );

  const reactionChip = (message: ThreadMessage) => {
    if (message.reaction === undefined) {
      return null;
    }
    const hasSelf = selfReactedIds.has(message.id);
    const count = message.reaction.reactors.length + (hasSelf ? 1 : 0);
    const names = hasSelf
      ? [...message.reaction.reactors, 'You'].join(', ')
      : message.reaction.reactors.join(', ');
    return (
      <Tooltip content={names}>
        {/* The ~20px Token stays presentational; the unstyled native
            button carries the click and grows to a >=44px touch target
            when compact. */}
        <button
          type="button"
          style={isCompact ? styles.tokenButtonCompact : styles.tokenButton}
          aria-label={\`Toggle your \${message.reaction.emoji} reaction\`}
          aria-pressed={hasSelf}
          onClick={() => setSelfReactedIds(prev => toggled(prev, message.id))}>
          <Token
            label={\`\${message.reaction.emoji} \${count}\`}
            size="sm"
            color={hasSelf ? 'blue' : 'default'}
          />
        </button>
      </Tooltip>
    );
  };

  const attachmentRow = (message: ThreadMessage) =>
    message.attachments.length === 0 ? null : (
      <VStack gap={2}>
        <HStack gap={1} vAlign="center">
          <Icon icon={PaperclipIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {message.attachments.length} attachments
          </Text>
        </HStack>
        <HStack gap={2} style={{flexWrap: 'wrap'}}>
          {message.attachments.map(attachment => (
            <Card key={attachment.name} padding={2} style={styles.attachmentTile}>
              <HStack gap={2} vAlign="center">
                <div style={styles.attachmentIconWell}>
                  <Icon icon={attachment.icon} size="sm" color="secondary" />
                </div>
                <VStack gap={0}>
                  <Text type="supporting" weight="semibold" maxLines={1}>
                    {attachment.name}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {attachment.size}
                  </Text>
                </VStack>
              </HStack>
            </Card>
          ))}
        </HStack>
      </VStack>
    );

  const quoteSection = (message: ThreadMessage) => {
    if (message.quote === undefined) {
      return null;
    }
    const isQuoteOpen = openQuoteIds.has(message.id);
    return (
      <VStack gap={2} hAlign="start">
        <Tooltip
          content={isQuoteOpen ? 'Hide trimmed content' : 'Show trimmed content'}>
          <IconButton
            label={isQuoteOpen ? 'Hide trimmed content' : 'Show trimmed content'}
            size="sm"
            variant={isQuoteOpen ? 'secondary' : 'ghost'}
            style={isCompact ? styles.iconTapTarget : undefined}
            icon={<Icon icon={EllipsisIcon} size="sm" color="inherit" />}
            onClick={() => setOpenQuoteIds(prev => toggled(prev, message.id))}
          />
        </Tooltip>
        {isQuoteOpen && (
          <div style={isCompact ? styles.quoteBlockCompact : styles.quoteBlock}>
            <VStack gap={2}>
              <Text type="supporting" color="secondary">
                {message.quote.attribution}
              </Text>
              {message.quote.paragraphs.map((paragraph, index) => (
                <Text key={index} type="body" color="secondary">
                  {paragraph}
                </Text>
              ))}
            </VStack>
          </div>
        )}
      </VStack>
    );
  };

  const collapsedTrigger = (message: ThreadMessage) => (
    <div style={styles.collapsedRow}>
      <HStack gap={2} vAlign="center" width="100%">
        <Avatar name={PARTICIPANTS[message.from].name} size={24} />
        <div style={isCompact ? styles.senderColCompact : styles.senderCol}>
          <Text type="body" weight="semibold" maxLines={1}>
            {PARTICIPANTS[message.from].name}
          </Text>
        </div>
        <StackItem size="fill">
          <Text type="supporting" color="secondary" maxLines={1}>
            {message.snippet}
          </Text>
        </StackItem>
        <div style={styles.noWrapCell}>
          <Timestamp
            value={message.sentAt}
            format="date"
            hasTooltip={false}
            color="secondary"
          />
        </div>
        <Icon icon={ChevronDownIcon} size="sm" color="secondary" />
      </HStack>
    </div>
  );

  const expandedTrigger = (message: ThreadMessage) => {
    const sender = PARTICIPANTS[message.from];
    return (
      <div style={styles.expandedHeader}>
        <HStack gap={3} vAlign="center" width="100%">
          <Avatar name={sender.name} size={36} />
          <StackItem size="fill">
            <VStack gap={0}>
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="semibold">
                  {sender.name}
                </Text>
                {sender.isExternal && (
                  <Badge label="External" variant="warning" />
                )}
                {message.from === 'alex' && (
                  <Badge label="You" variant="info" />
                )}
              </HStack>
              <Text type="supporting" color="secondary" maxLines={1}>
                {sender.email}
              </Text>
            </VStack>
          </StackItem>
          <div style={styles.noWrapCell}>
            <Timestamp
              value={message.sentAt}
              format="date_time"
              hasTooltip={false}
              color="secondary"
            />
          </div>
          <Icon icon={ChevronUpIcon} size="sm" color="secondary" />
        </HStack>
      </div>
    );
  };

  const toggleMessage = (message: ThreadMessage) => {
    const willExpand = !expandedIds.has(message.id);
    setExpandedIds(prev => toggled(prev, message.id));
    if (!willExpand && detailsOpenId === message.id) {
      setDetailsOpenId(null);
    }
  };

  const messageSection = (message: ThreadMessage, position: number) => {
    const isExpanded = expandedIds.has(message.id);
    return (
      <VStack key={message.id} gap={0}>
        {/* The whole header row is one unstyled full-width button: the
            collapsed one-line row when closed, the Avatar header when
            open — clicking either toggles the message. */}
        <button
          type="button"
          style={styles.rowButton}
          aria-expanded={isExpanded}
          aria-label={
            isExpanded
              ? \`Collapse message from \${PARTICIPANTS[message.from].name}\`
              : \`Expand message from \${PARTICIPANTS[message.from].name}\`
          }
          onClick={() => toggleMessage(message)}>
          {isExpanded ? expandedTrigger(message) : collapsedTrigger(message)}
        </button>
        {isExpanded && (
          <div style={styles.messageBody}>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {recipientSummary(message)}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {position} of {MESSAGES.length}
                </Text>
                {detailsPopover(message)}
              </HStack>
              <VStack gap={3}>
                {message.body.map((paragraph, index) => (
                  <Text key={index} type="body">
                    {paragraph}
                  </Text>
                ))}
              </VStack>
              {quoteSection(message)}
              {attachmentRow(message)}
              {message.reaction !== undefined && (
                <HStack gap={2} vAlign="center">
                  {reactionChip(message)}
                </HStack>
              )}
            </VStack>
          </div>
        )}
        <Divider />
      </VStack>
    );
  };

  // ----- composer ------------------------------------------------------------

  const activeMode = COMPOSER_MODES.find(entry => entry.mode === composerMode);

  const composer =
    composerMode === null || activeMode === undefined ? (
      <div style={styles.composerRow}>
        <VStack gap={2}>
          <ButtonGroup label="Respond to this thread" size="md">
            {COMPOSER_MODES.map(entry => (
              <Button
                key={entry.mode}
                label={entry.label}
                variant="secondary"
                icon={<Icon icon={entry.icon} size="sm" color="inherit" />}
                onClick={() => openComposer(entry.mode)}
              />
            ))}
          </ButtonGroup>
          {sentNote !== null && (
            <Text type="supporting" color="secondary">
              {sentNote}
            </Text>
          )}
        </VStack>
      </div>
    ) : (
      <Card padding={3} style={styles.composerCard}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Icon icon={activeMode.icon} size="sm" color="secondary" />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="body" weight="semibold">
                  {activeMode.label}
                  {composerMode === 'forward'
                    ? ''
                    : \` to \${PARTICIPANTS[LAST_MESSAGE.from].name}\`}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {composerRecipients(activeMode.mode)}
                </Text>
              </VStack>
            </StackItem>
            <Tooltip content="Close composer">
              <IconButton
                label="Close composer"
                size="sm"
                variant="ghost"
                style={isCompact ? styles.iconTapTarget : undefined}
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                onClick={closeComposer}
              />
            </Tooltip>
          </HStack>
          <HStack gap={2} style={{flexWrap: 'wrap'}}>
            {QUICK_REPLIES.map(suggestion => (
              /* Same wrapper-button pattern as the reaction chip: the
                 click lives on the native button so the quick-reply
                 chips get >=44px touch targets when compact. */
              <button
                key={suggestion}
                type="button"
                style={
                  isCompact ? styles.tokenButtonCompact : styles.tokenButton
                }
                aria-label={\`Use quick reply: \${suggestion}\`}
                aria-pressed={draft === suggestion}
                onClick={() => setDraft(suggestion)}>
                <Token
                  label={suggestion}
                  size="sm"
                  color={draft === suggestion ? 'blue' : 'default'}
                />
              </button>
            ))}
          </HStack>
          <TextArea
            label={\`\${activeMode.label} message\`}
            isLabelHidden
            rows={5}
            placeholder={\`Write your \${activeMode.label.toLowerCase()}…\`}
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <Button
              label="Send"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={draft.trim() === ''}
              onClick={sendDraft}
            />
            <Button label="Discard" variant="ghost" onClick={closeComposer} />
            <StackItem size="fill">
              <span />
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {draft.length} characters
            </Text>
          </HStack>
        </VStack>
      </Card>
    );

  // ----- page ---------------------------------------------------------------

  return (
    <Layout
      height="fill"
      contentWidth={760}
      header={header}
      content={
        <LayoutContent>
          <div style={isCompact ? styles.columnCompact : styles.column}>
            <VStack gap={0}>
              {MESSAGES.map((message, index) =>
                messageSection(message, index + 1),
              )}
            </VStack>
            {composer}
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};