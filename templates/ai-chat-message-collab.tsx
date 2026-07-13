// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (shared experiment-review transcript
 *   with fixed ISO timestamps, per-message vote counts, two existing forks,
 *   two margin comment threads, mention candidates, reaction tallies)
 * @output Shared AI chat transcript with collaboration affordances: slim
 *   header with participant AvatarGroup, "Shared" badge, and invite-link
 *   copy; each message carries a hover action row (thumbs up/down with
 *   counts, copy, copy-link, fork); one assistant message anchors a fork
 *   Popover listing two existing forks plus "Fork from here"; two margin
 *   comment threads sit in a right gutter aligned to their anchor messages
 *   (author avatars, comment bubbles, reply inputs — one with an @mention
 *   Typeahead rendered open showing 3 candidates including an assistant
 *   bot row); a reactions summary strip of ToggleButtons under one message
 * @position Page template; emitted by `astryx template ai-chat-message-collab`
 *
 * Frame: Layout height="fill". LayoutHeader carries the shared-session
 * chrome (title, Shared badge, AvatarGroup, invite link). LayoutContent
 * (padding 0) hosts a measured wrapper: each transcript row is a flex pair
 * of message cell + fixed 300px comment gutter, so margin threads align
 * naturally to their anchor messages without absolute positioning. Unlike
 * ai-chat-tool-stream this surface is about *how people collaborate on*
 * the transcript, not how the agent worked.
 *
 * Responsive contract (container width via useElementWidth — viewport
 * media queries never fire in the inline demo stage):
 * - >900px: comment threads render in the right gutter (300px), top-aligned
 *   with their anchor message rows; message action rows are hover-revealed
 *   (opacity swap, no layout shift) and stay visible while their fork
 *   Popover is open or a vote is active.
 * - <=900px: the gutter folds away and each comment thread renders inline
 *   below its anchor message (accent left rule); action rows are always
 *   visible since hover is unavailable on touch.
 * - Conversation column: maxWidth 1180 including gutter, centered; only
 *   the transcript scrolls — header and composer are fixed chrome.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {
  createStaticSource,
  Typeahead,
  TypeaheadItem,
  type SearchableItem,
} from '@astryxdesign/core/Typeahead';
import {
  CheckIcon,
  CopyIcon,
  GitBranchIcon,
  Link2Icon,
  MessageSquareTextIcon,
  SmilePlusIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  wrap: {height: '100%'},
  // Transcript column: message cell + 300px comment gutter.
  chatColumn: {
    height: '100%',
    maxWidth: 1180,
    marginInline: 'auto',
  },
  messageRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'flex-start',
  },
  messageCell: {flex: 1, minWidth: 0},
  gutterCell: {width: 300, flexShrink: 0},
  // Hover-revealed action row: always in the DOM (no layout shift), shown
  // via opacity; pointerEvents gates interaction while hidden.
  actionRow: {
    marginTop: 'var(--spacing-1)',
    transition: 'opacity 120ms ease',
  },
  actionRowHidden: {opacity: 0, pointerEvents: 'none'},
  actionRowVisible: {opacity: 1},
  // Fork popover rows.
  popoverBody: {padding: 'var(--spacing-3)'},
  eyebrow: {
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    fontWeight: 600,
  },
  // Margin comment thread cards.
  threadBubble: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
  },
  threadInline: {
    marginTop: 'var(--spacing-2)',
    borderLeft: '2px solid var(--color-border)',
    paddingLeft: 'var(--spacing-3)',
    maxWidth: 480,
  },
  reactionStrip: {marginTop: 'var(--spacing-1)'},
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'Onboarding checklist rollout review';
const ASSISTANT_NAME = 'Beacon Copilot';

interface Participant {
  id: string;
  name: string;
  role: string;
}

const PARTICIPANTS: Participant[] = [
  {id: 'p-maya', name: 'Maya Chen', role: 'Product · owns funnel dashboards'},
  {id: 'p-jonah', name: 'Jonah Park', role: 'Growth engineering'},
  {id: 'p-priya', name: 'Priya Raman', role: 'Data science'},
];

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  author: string;
  time: string; // fixed ISO timestamp
  paragraphs: string[];
  upvotes: number;
  downvotes: number;
}

const MESSAGES: Message[] = [
  {
    id: 'm-1',
    sender: 'user',
    author: 'Maya Chen',
    time: '2026-07-10T09:02:00',
    paragraphs: [
      'Beacon, compare activation for the new checklist onboarding ' +
        'against control and tell us whether we can ship to 100% on Monday.',
    ],
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: 'm-2',
    sender: 'assistant',
    author: ASSISTANT_NAME,
    time: '2026-07-10T09:03:40',
    paragraphs: [
      'Across 41,300 exposed users (Jun 26 – Jul 9), checklist onboarding ' +
        'lifts day-1 activation by +6.2pp (58.1% vs 51.9%, p < 0.001) and ' +
        'D7 retention by +1.8pp. Time-to-first-project drops from 11m to ' +
        '7m median.',
      'One caveat: Android activation is flat (+0.4pp, not significant) ' +
        'and Android session-start latency regressed 9% during the ' +
        'checklist fetch. Every other segment clears the ship bar.',
    ],
    upvotes: 3,
    downvotes: 0,
  },
  {
    id: 'm-3',
    sender: 'user',
    author: 'Jonah Park',
    time: '2026-07-10T09:11:00',
    paragraphs: [
      'The Android dip worries me. What does the rollout look like if we ' +
        'gate by platform instead of shipping everyone at once?',
    ],
    upvotes: 1,
    downvotes: 0,
  },
  {
    id: 'm-4',
    sender: 'assistant',
    author: ASSISTANT_NAME,
    time: '2026-07-10T09:12:55',
    paragraphs: [
      'Platform-gated plan: ship web + iOS to 100% Monday; hold Android ' +
        'at 25% behind a checklist-prefetch fix, then step 25% → 50% → ' +
        '100% across the week with an auto-halt guardrail (checkout error ' +
        'rate +0.5pp or p95 session start +8%). Prefetching the checklist ' +
        'manifest at login removes the fetch from the critical path, which ' +
        'is the likely cause of the latency regression.',
    ],
    upvotes: 1,
    downvotes: 1,
  },
  {
    id: 'm-5',
    sender: 'user',
    author: 'Priya Raman',
    time: '2026-07-10T09:18:30',
    paragraphs: [
      'Taking the guardrail-metric question to a fork so we do not derail ' +
        'this thread — the halt condition needs its own baseline math.',
    ],
    upvotes: 0,
    downvotes: 0,
  },
  {
    id: 'm-6',
    sender: 'assistant',
    author: ASSISTANT_NAME,
    time: '2026-07-10T09:19:45',
    paragraphs: [
      'Summary for Monday: ship web + iOS to 100%, Android staged behind ' +
        'the prefetch fix. Open items: Priya confirms the guardrail ' +
        'baseline in her fork, Jonah lands checklist-prefetch by Friday, ' +
        'and I will post daily rollout digests to this session.',
    ],
    upvotes: 0,
    downvotes: 0,
  },
];

// The message whose fork Popover renders open by default.
const FORK_ANCHOR_ID = 'm-4';

interface ForkEntry {
  id: string;
  title: string;
  meta: string;
}

const FORKS: ForkEntry[] = [
  {id: 'f-1', title: 'Android holdback variant', meta: 'View fork · 2h ago'},
  {
    id: 'f-2',
    title: 'Guardrail metrics deep-dive',
    meta: 'View fork · yesterday',
  },
];

interface ThreadComment {
  id: string;
  author: string;
  time: string;
  text: string;
}

interface CommentThread {
  id: string;
  anchorId: string;
  comments: ThreadComment[];
  hasMentionReply: boolean;
}

const COMMENT_THREADS: CommentThread[] = [
  {
    id: 'th-1',
    anchorId: 'm-2',
    hasMentionReply: false,
    comments: [
      {
        id: 'c-1',
        author: 'Jonah Park',
        time: 'Yesterday 4:12 PM',
        text: 'Does the +6.2pp hold on mobile web, or is this desktop-driven?',
      },
      {
        id: 'c-2',
        author: 'Maya Chen',
        time: 'Yesterday 5:03 PM',
        text: 'Mobile web is +4.9pp — close enough. Android is the outlier.',
      },
    ],
  },
  {
    id: 'th-2',
    anchorId: 'm-4',
    hasMentionReply: true,
    comments: [
      {
        id: 'c-3',
        author: 'Priya Raman',
        time: 'Today 9:41 AM',
        text:
          'Guardrail should be checkout errors, not latency. Who owns the ' +
          'dashboard for that?',
      },
    ],
  },
];

// @mention candidates for the open Typeahead (3 rows incl. the bot).
type MentionItem = SearchableItem<{description: string; isBot: boolean}>;

const MENTION_CANDIDATES: MentionItem[] = [
  {
    id: 'mention-maya',
    label: 'Maya Chen',
    auxiliaryData: {
      description: '@maya · Product · owns funnel dashboards',
      isBot: false,
    },
  },
  {
    id: 'mention-jonah',
    label: 'Jonah Park',
    auxiliaryData: {
      description: '@jonah · Growth engineering',
      isBot: false,
    },
  },
  {
    id: 'mention-assistant',
    label: ASSISTANT_NAME,
    auxiliaryData: {
      description: '@assistant · Bot — replies in this thread',
      isBot: true,
    },
  },
];

const MENTION_SOURCE = createStaticSource(MENTION_CANDIDATES, {
  keywords: item => [item.auxiliaryData?.description ?? ''],
});

// Reactions summary strip under m-2. The 👍 tally already includes the
// viewer, so it starts pressed — toggling off drops the count to 2.
interface ReactionSeed {
  id: string;
  emoji: string;
  othersCount: number;
  startsPressed: boolean;
  label: string;
}

const REACTION_SEEDS: ReactionSeed[] = [
  {
    id: 'react-up',
    emoji: '👍',
    othersCount: 2,
    startsPressed: true,
    label: 'React with thumbs up',
  },
  {
    id: 'react-party',
    emoji: '🎉',
    othersCount: 1,
    startsPressed: false,
    label: 'React with party popper',
  },
];

// ============= RESPONSIVE HELPER =============
// Container-width responsiveness: the demo stage is ~1045-1075px inside a
// 1440px window, so viewport media queries never fire — measure ourselves.

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

// ============= MESSAGE ACTIONS =============

type Vote = 'up' | 'down' | null;

/**
 * Hover action row under a message: vote toggles with live counts, copy
 * text, copy link (with copied feedback), and fork. The fork-anchor
 * message wraps its fork button in the fork Popover (rendered open by
 * default); other messages get a plain no-op fork button.
 */
function MessageActions({
  message,
  isVisible,
  vote,
  onVote,
  copiedKind,
  onCopy,
  forkPopover,
}: {
  message: Message;
  isVisible: boolean;
  vote: Vote;
  onVote: (id: string, next: Vote) => void;
  copiedKind: 'text' | 'link' | null;
  onCopy: (id: string, kind: 'text' | 'link') => void;
  forkPopover?: {isOpen: boolean; onOpenChange: (isOpen: boolean) => void};
}) {
  const upCount = message.upvotes + (vote === 'up' ? 1 : 0);
  const downCount = message.downvotes + (vote === 'down' ? 1 : 0);

  const forkButton = (
    <IconButton
      label={`Fork the session from this message`}
      tooltip="Fork from here"
      icon={<Icon icon={GitBranchIcon} size="sm" color="inherit" />}
      variant="ghost"
      size="sm"
      onClick={
        forkPopover == null
          ? () => {}
          : () => forkPopover.onOpenChange(!forkPopover.isOpen)
      }
    />
  );

  return (
    <div
      style={{
        ...styles.actionRow,
        ...(isVisible ? styles.actionRowVisible : styles.actionRowHidden),
      }}>
      <HStack gap={1} vAlign="center">
        <ToggleButton
          label="Mark this message helpful"
          tooltip="Helpful"
          size="sm"
          icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
          isPressed={vote === 'up'}
          onPressedChange={pressed =>
            onVote(message.id, pressed ? 'up' : null)
          }>
          {upCount > 0 ? String(upCount) : ''}
        </ToggleButton>
        <ToggleButton
          label="Mark this message unhelpful"
          tooltip="Not helpful"
          size="sm"
          icon={<Icon icon={ThumbsDownIcon} size="sm" color="inherit" />}
          isPressed={vote === 'down'}
          onPressedChange={pressed =>
            onVote(message.id, pressed ? 'down' : null)
          }>
          {downCount > 0 ? String(downCount) : ''}
        </ToggleButton>
        <IconButton
          label="Copy message text"
          tooltip={copiedKind === 'text' ? 'Copied' : 'Copy text'}
          icon={
            <Icon
              icon={copiedKind === 'text' ? CheckIcon : CopyIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          onClick={() => onCopy(message.id, 'text')}
        />
        <IconButton
          label="Copy link to this message"
          tooltip={copiedKind === 'link' ? 'Link copied' : 'Copy link'}
          icon={
            <Icon
              icon={copiedKind === 'link' ? CheckIcon : Link2Icon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          onClick={() => onCopy(message.id, 'link')}
        />
        {forkPopover == null ? (
          forkButton
        ) : (
          <Popover
            label="Forks from this message"
            placement="below"
            alignment="start"
            width={300}
            isOpen={forkPopover.isOpen}
            onOpenChange={forkPopover.onOpenChange}
            content={
              <div style={styles.popoverBody}>
                <VStack gap={2}>
                  <div style={styles.eyebrow}>Forks from this message</div>
                  {FORKS.map(fork => (
                    <HStack key={fork.id} gap={2} vAlign="center">
                      <Icon
                        icon={GitBranchIcon}
                        size="sm"
                        color="secondary"
                      />
                      <StackItem size="fill">
                        <VStack gap={0}>
                          <Text size="sm">{fork.title}</Text>
                          <Text type="supporting" color="secondary">
                            {fork.meta}
                          </Text>
                        </VStack>
                      </StackItem>
                      <Button
                        label="Open"
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                      />
                    </HStack>
                  ))}
                  <Divider />
                  <Button
                    label="Fork from here"
                    variant="secondary"
                    size="sm"
                    icon={
                      <Icon icon={GitBranchIcon} size="sm" color="inherit" />
                    }
                    onClick={() => forkPopover.onOpenChange(false)}
                  />
                </VStack>
              </div>
            }>
            {forkButton}
          </Popover>
        )}
      </HStack>
    </div>
  );
}

// ============= COMMENT THREADS =============

/**
 * Margin comment thread: author bubbles plus a reply input. One thread
 * carries the @mention Typeahead, rendered open (autofocus + entries on
 * focus) with 3 candidates including the assistant bot row.
 */
function CommentThreadCard({thread}: {thread: CommentThread}) {
  const [mention, setMention] = useState<MentionItem | null>(null);
  const [reply, setReply] = useState('');
  const firstComment = thread.comments[0];

  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={MessageSquareTextIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <div style={styles.eyebrow}>Thread</div>
          </StackItem>
          <IconButton
            label={`Resolve thread started by ${firstComment.author}`}
            tooltip="Resolve thread"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => {}}
          />
        </HStack>
        {thread.comments.map(comment => (
          <VStack key={comment.id} gap={1}>
            <HStack gap={2} vAlign="center">
              <Avatar name={comment.author} size="xsmall" />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  {comment.author}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary">
                {comment.time}
              </Text>
            </HStack>
            <div style={styles.threadBubble}>
              <Text size="sm">{comment.text}</Text>
            </div>
          </VStack>
        ))}
        {thread.hasMentionReply ? (
          <Typeahead<MentionItem>
            label={`Reply to ${firstComment.author} — @ to mention`}
            isLabelHidden
            size="sm"
            width="100%"
            placeholder="Reply — @ to mention"
            searchSource={MENTION_SOURCE}
            debounceMs={0}
            hasEntriesOnFocus
            hasAutoFocus
            value={mention}
            onChange={setMention}
            renderItem={item => (
              <TypeaheadItem
                item={item}
                icon={<Avatar name={item.label} size="xsmall" />}
                description={item.auxiliaryData?.description}
              />
            )}
          />
        ) : (
          <TextInput
            label={`Reply to ${firstComment.author}`}
            isLabelHidden
            size="sm"
            placeholder={`Reply to ${firstComment.author}…`}
            value={reply}
            onChange={setReply}
          />
        )}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function AiChatMessageCollabTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  // Fold margin comments inline below their message on compact widths.
  const isCompact = wrapWidth > 0 && wrapWidth <= 900;

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [copied, setCopied] = useState<{
    id: string;
    kind: 'text' | 'link';
  } | null>(null);
  const [isForkOpen, setIsForkOpen] = useState(true);
  const [pressedReactions, setPressedReactions] = useState<
    Record<string, boolean>
  >(() =>
    Object.fromEntries(
      REACTION_SEEDS.map(seed => [seed.id, seed.startsPressed]),
    ),
  );
  const [isInviteCopied, setIsInviteCopied] = useState(false);
  const [draft, setDraft] = useState('');

  const setVote = (id: string, next: Vote) => {
    setVotes(prev => ({...prev, [id]: next}));
  };

  const copyFrom = (id: string, kind: 'text' | 'link') => {
    setCopied({id, kind});
  };

  const toggleReaction = (id: string, isPressed: boolean) => {
    setPressedReactions(prev => ({...prev, [id]: isPressed}));
  };

  const threadByAnchor = new Map(
    COMMENT_THREADS.map(thread => [thread.anchorId, thread]),
  );

  const composer = (
    <div style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={`Message ${ASSISTANT_NAME}`}
            isLabelHidden
            rows={2}
            placeholder="Reply — everyone in this session sees your message…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Shared session · 3 can reply · 1 view only
            </Text>
            <StackItem size="fill" />
            <Button label="Send" size="sm" onClick={() => setDraft('')} />
          </HStack>
        </VStack>
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>{SESSION_TITLE}</Heading>
                <Badge label="Shared" variant="info" />
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    workspace: growth-experiments
                  </Text>
                )}
              </HStack>
            </StackItem>
            <AvatarGroup size="small" aria-label="Session participants">
              {PARTICIPANTS.map(person => (
                <Avatar key={person.id} name={person.name} />
              ))}
              <Avatar name={ASSISTANT_NAME} />
            </AvatarGroup>
            <Button
              label={isInviteCopied ? 'Link copied' : 'Copy invite link'}
              variant="ghost"
              size="sm"
              icon={
                <Icon
                  icon={isInviteCopied ? CheckIcon : Link2Icon}
                  size="sm"
                  color="inherit"
                />
              }
              onClick={() => setIsInviteCopied(true)}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div ref={wrapRef} style={styles.wrap}>
            <div style={styles.chatColumn}>
              <ChatLayout composer={composer}>
                <ChatMessageList density="balanced">
                  <ChatSystemMessage variant="divider">
                    Friday, July 10
                  </ChatSystemMessage>
                  <ChatSystemMessage>
                    Maya Chen shared this session with Jonah Park and Priya
                    Raman · comments and forks are visible to everyone
                  </ChatSystemMessage>

                  {MESSAGES.map(message => {
                    const thread = threadByAnchor.get(message.id);
                    const isForkAnchor = message.id === FORK_ANCHOR_ID;
                    const vote = votes[message.id] ?? null;
                    const copiedKind =
                      copied != null && copied.id === message.id
                        ? copied.kind
                        : null;
                    // Keep the row visible while its popover is open or a
                    // vote is active; always visible on compact (no hover).
                    const actionsVisible =
                      isCompact ||
                      hoveredId === message.id ||
                      (isForkAnchor && isForkOpen) ||
                      vote != null;

                    return (
                      <div
                        key={message.id}
                        style={styles.messageRow}
                        onMouseEnter={() => setHoveredId(message.id)}
                        onMouseLeave={() =>
                          setHoveredId(prev =>
                            prev === message.id ? null : prev,
                          )
                        }>
                        <div style={styles.messageCell}>
                          <ChatMessage
                            sender={message.sender}
                            avatar={
                              message.sender === 'assistant' ? (
                                <Avatar name={ASSISTANT_NAME} size="small" />
                              ) : undefined
                            }>
                            <ChatMessageBubble
                              name={message.author}
                              metadata={
                                <ChatMessageMetadata
                                  timestamp={
                                    <Timestamp
                                      value={message.time}
                                      format="time"
                                    />
                                  }
                                />
                              }>
                              <VStack gap={2}>
                                {message.paragraphs.map((paragraph, index) => (
                                  <Text key={index} size="sm">
                                    {paragraph}
                                  </Text>
                                ))}
                              </VStack>
                            </ChatMessageBubble>
                            {message.id === 'm-2' && (
                              <HStack
                                gap={1}
                                vAlign="center"
                                style={styles.reactionStrip}>
                                {REACTION_SEEDS.map(seed => {
                                  const isPressed =
                                    pressedReactions[seed.id] ?? false;
                                  const count =
                                    seed.othersCount + (isPressed ? 1 : 0);
                                  return (
                                    <ToggleButton
                                      key={seed.id}
                                      label={seed.label}
                                      size="sm"
                                      isPressed={isPressed}
                                      onPressedChange={next =>
                                        toggleReaction(seed.id, next)
                                      }>
                                      {`${seed.emoji} ${count}`}
                                    </ToggleButton>
                                  );
                                })}
                                <IconButton
                                  label="Add a reaction"
                                  tooltip="Add reaction"
                                  icon={
                                    <Icon
                                      icon={SmilePlusIcon}
                                      size="sm"
                                      color="inherit"
                                    />
                                  }
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {}}
                                />
                              </HStack>
                            )}
                            <MessageActions
                              message={message}
                              isVisible={actionsVisible}
                              vote={vote}
                              onVote={setVote}
                              copiedKind={copiedKind}
                              onCopy={copyFrom}
                              forkPopover={
                                isForkAnchor
                                  ? {
                                      isOpen: isForkOpen,
                                      onOpenChange: setIsForkOpen,
                                    }
                                  : undefined
                              }
                            />
                          </ChatMessage>
                          {isCompact && thread != null && (
                            <div style={styles.threadInline}>
                              <CommentThreadCard thread={thread} />
                            </div>
                          )}
                        </div>
                        {!isCompact && (
                          <div style={styles.gutterCell}>
                            {thread != null && (
                              <CommentThreadCard thread={thread} />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </ChatMessageList>
              </ChatLayout>
            </div>
          </div>
        </LayoutContent>
      }
    />
  );
}
