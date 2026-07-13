var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 14-turn form-kit migration
 *   transcript with fixed ISO timestamps, a 4-file session-changes list
 *   with +/− line counts, and a two-sentence recap string)
 * @output Long AI chat transcript demonstrating navigation furniture:
 *   a right-edge minimap (thin bar per message — user bars short and
 *   accent-tinted, assistant bars longer, one thicker bar for the long
 *   plan message) that expands on hover into a navigator of 64-char
 *   previews and scrolls to the clicked message; an aria-live RECAP Card
 *   pinned above the composer with Clock icon, uppercase eyebrow, and X
 *   dismiss; and a floating bottom-right session-changes pill that shows
 *   only a diff glyph until hovered ("4 files changed") and opens a
 *   Dialog of changed files with per-file status dots and a close X
 *   deliberately placed on the LEFT
 * @position Page template; emitted by \`astryx template ai-chat-minimap-recap\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the session chrome
 * (title, status dot, turn count). LayoutContent (padding 0) hosts a
 * position:relative wrapper: the centered ChatLayout scrolls inside it
 * while the minimap and the session-changes pill float above the
 * transcript as absolutely positioned overlays.
 *
 * Responsive contract:
 * - Conversation column: maxWidth 880, centered; only the transcript
 *   scrolls — header, recap, and composer are fixed chrome.
 * - The demo stage never resizes the viewport, so adaptation is driven
 *   by a local ResizeObserver (useElementWidth), not media queries.
 * - >720px: minimap rail hugs the right edge (expands to a 300px
 *   navigator on hover/focus); the changes pill floats bottom-right.
 * - <=720px: the minimap is removed (bars would collide with bubbles);
 *   the recap card and changes pill remain, and the pill keeps its
 *   40px-tall tap target.
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
import {Text, Heading} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  ClockIcon,
  FileDiffIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Overlay anchor: ChatLayout scrolls inside; minimap + pill float above.
  stage: {
    position: 'relative',
    height: '100%',
  },
  chatColumn: {
    height: '100%',
    maxWidth: 880,
    marginInline: 'auto',
  },
  // ---- Minimap (right edge, vertically centered) ----
  minimap: {
    position: 'absolute',
    right: 'var(--spacing-2)',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 5,
  },
  minimapRail: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 5,
    padding: 'var(--spacing-1)',
  },
  minimapBarButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    background: 'transparent',
    border: 'none',
    padding: 2,
    margin: 0,
    cursor: 'pointer',
  },
  // User bars: short + accent-tinted. Assistant bars: longer, neutral.
  barUser: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-accent)',
    opacity: 0.75,
  },
  barAssistant: {
    width: 26,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-border-emphasized)',
  },
  // One thicker bar marks the long plan message.
  barThick: {height: 9},
  barActive: {opacity: 1, backgroundColor: 'var(--color-accent)'},
  // Expanded navigator panel (replaces the rail in place on hover/focus).
  navPanel: {
    width: 300,
    maxHeight: 420,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: '0 8px 24px var(--color-shadow)',
    padding: 'var(--spacing-1)',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    paddingBlock: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
    margin: 0,
    cursor: 'pointer',
  },
  navRowActive: {backgroundColor: 'var(--color-background-muted)'},
  navRowBarCell: {
    width: 26,
    display: 'flex',
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  navRowText: {minWidth: 0},
  // ---- Recap card (aria-live, pinned above the composer) ----
  recapEyebrow: {
    fontSize: 11,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  recapBody: {minWidth: 0},
  // ---- Composer ----
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
  // ---- Session-changes pill (floating bottom-right) ----
  changesPill: {
    position: 'absolute',
    right: 'var(--spacing-4)',
    bottom: 128,
    zIndex: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    height: 40,
    paddingInline: 10,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    cursor: 'pointer',
  },
  fileRow: {paddingBlock: 'var(--spacing-2)'},
  filePathCell: {minWidth: 0},
  addCount: {color: 'var(--color-success)'},
  removeCount: {color: 'var(--color-error)'},
};

// ============= RESPONSIVE HELPER =============
// The demo stage is ~1045-1075px inside a 1440px window, so viewport
// media queries never fire there — measure the page's own width instead.

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
// Deterministic fixtures: fixed ISO timestamps, no clocks, no randomness.

const SESSION_TITLE = 'settings page form-kit migration';
const ASSISTANT_NAME = 'Beacon Copilot';

type Sender = 'user' | 'assistant';

interface TranscriptMessage {
  id: string;
  sender: Sender;
  text: string;
  sentAt: string; // fixed ISO timestamp
}

const MESSAGES: TranscriptMessage[] = [
  {
    id: 'm-1',
    sender: 'user',
    text: 'The settings page still renders the legacy FieldRow grid. Can you migrate Profile and Notifications to the new form kit?',
    sentAt: '2026-07-09T09:12:00',
  },
  {
    id: 'm-2',
    sender: 'assistant',
    text: 'On it — starting with ProfileForm since it has the most legacy fields. Scanning for FieldRow call sites now.',
    sentAt: '2026-07-09T09:12:40',
  },
  {
    id: 'm-3',
    sender: 'user',
    text: 'One constraint: keep every validation message exactly as it reads today.',
    sentAt: '2026-07-09T09:14:05',
  },
  {
    id: 'm-4',
    sender: 'assistant',
    text: 'Understood. Found 14 FieldRow call sites in ProfileForm; all of them map cleanly onto Field + FieldStatus.',
    sentAt: '2026-07-09T09:15:22',
  },
  {
    // The long turn — rendered as the one thicker bar in the minimap.
    id: 'm-5',
    sender: 'assistant',
    text: 'Migration plan: first I extract the shared debounce and dirty-state tracking out of FieldRow into a new useFormKit hook so both forms consume one implementation. Then ProfileForm moves field by field — display name, avatar upload, pronouns, timezone, and the two email rows — asserting after each move that the rendered validation copy is byte-identical to the snapshot I captured before touching anything. NotificationsForm follows the same recipe but also swaps its hand-rolled digest-frequency dropdown for the kit Selector adapter. When both forms are green I delete the legacy FieldRow component entirely so nothing new can import it.',
    sentAt: '2026-07-09T09:17:48',
  },
  {
    id: 'm-6',
    sender: 'user',
    text: 'Plan looks right. Go ahead.',
    sentAt: '2026-07-09T09:19:10',
  },
  {
    id: 'm-7',
    sender: 'assistant',
    text: 'ProfileForm migrated — 48 insertions, 31 deletions. Validation copy verified byte-identical against the pre-migration snapshot.',
    sentAt: '2026-07-09T09:26:33',
  },
  {
    id: 'm-8',
    sender: 'user',
    text: 'Does the avatar upload row still debounce the crop preview?',
    sentAt: '2026-07-09T09:28:02',
  },
  {
    id: 'm-9',
    sender: 'assistant',
    text: 'Yes — the 300ms debounce moved into useFormKit, so both forms now share one implementation instead of two copies.',
    sentAt: '2026-07-09T09:28:47',
  },
  {
    id: 'm-10',
    sender: 'user',
    text: 'Great. Do NotificationsForm next.',
    sentAt: '2026-07-09T09:30:15',
  },
  {
    id: 'm-11',
    sender: 'assistant',
    text: 'NotificationsForm is done — the digest-frequency dropdown now goes through the kit Selector adapter, 36 insertions and 24 deletions.',
    sentAt: '2026-07-09T09:39:51',
  },
  {
    id: 'm-12',
    sender: 'user',
    text: 'Anything left before I start the review?',
    sentAt: '2026-07-09T09:41:20',
  },
  {
    id: 'm-13',
    sender: 'assistant',
    text: 'Two things: legacy FieldRow had no remaining importers so I removed it, and one snapshot test needs regenerating — run pnpm test -u in src/settings.',
    sentAt: '2026-07-09T09:42:36',
  },
  {
    id: 'm-14',
    sender: 'user',
    text: 'Kicking off the review now — thanks.',
    sentAt: '2026-07-09T09:43:12',
  },
];

// Messages over this length get the thicker minimap bar.
const LONG_MESSAGE_CHARS = 300;

const RECAP_TEXT =
  'ProfileForm and NotificationsForm now run on the new form kit with ' +
  'validation copy verified byte-identical. Legacy FieldRow was deleted ' +
  'and one snapshot test in src/settings still needs regenerating.';

type FileStatus = 'modified' | 'added' | 'removed';

interface ChangedFile {
  id: string;
  path: string;
  additions: number;
  deletions: number;
  status: FileStatus;
}

const CHANGED_FILES: ChangedFile[] = [
  {
    id: 'cf-1',
    path: 'src/settings/ProfileForm.tsx',
    additions: 48,
    deletions: 31,
    status: 'modified',
  },
  {
    id: 'cf-2',
    path: 'src/settings/NotificationsForm.tsx',
    additions: 36,
    deletions: 24,
    status: 'modified',
  },
  {
    id: 'cf-3',
    path: 'src/forms/useFormKit.ts',
    additions: 112,
    deletions: 0,
    status: 'added',
  },
  {
    id: 'cf-4',
    path: 'src/settings/legacy/FieldRow.tsx',
    additions: 0,
    deletions: 86,
    status: 'removed',
  },
];

const FILE_STATUS_DOT: Record<
  FileStatus,
  {variant: 'accent' | 'success' | 'error'; label: string}
> = {
  modified: {variant: 'accent', label: 'Modified'},
  added: {variant: 'success', label: 'Added'},
  removed: {variant: 'error', label: 'Removed'},
};

function previewOf(text: string): string {
  return text.length > 64 ? \`\${text.slice(0, 64).trimEnd()}…\` : text;
}

// ============= MINIMAP =============

function minimapBarStyle(message: TranscriptMessage, isActive: boolean) {
  const base =
    message.sender === 'user' ? styles.barUser : styles.barAssistant;
  return {
    ...base,
    ...(message.text.length > LONG_MESSAGE_CHARS ? styles.barThick : null),
    ...(isActive ? styles.barActive : null),
  };
}

/**
 * Right-edge minimap: a thin rail of bars (one per message) that expands
 * into a preview navigator on hover or keyboard focus. Clicking a bar or
 * a preview row scrolls the transcript to that message.
 */
function Minimap({
  messages,
  activeId,
  onJump,
}: {
  messages: TranscriptMessage[];
  activeId: string | null;
  onJump: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <nav
      aria-label="Conversation minimap"
      style={styles.minimap}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={() => setIsExpanded(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsExpanded(false);
        }
      }}>
      {isExpanded ? (
        <div style={styles.navPanel}>
          <VStack gap={0}>
            {messages.map((message, index) => (
              <button
                key={message.id}
                type="button"
                style={{
                  ...styles.navRow,
                  ...(message.id === activeId ? styles.navRowActive : null),
                }}
                onClick={() => onJump(message.id)}>
                <span style={styles.navRowBarCell} aria-hidden>
                  <span
                    style={minimapBarStyle(message, message.id === activeId)}
                  />
                </span>
                <StackItem size="fill" style={styles.navRowText}>
                  <Text type="supporting" maxLines={1}>
                    {previewOf(message.text)}
                  </Text>
                </StackItem>
                <span hidden>{\`Jump to message \${index + 1}\`}</span>
              </button>
            ))}
          </VStack>
        </div>
      ) : (
        <div style={styles.minimapRail}>
          {messages.map((message, index) => (
            <button
              key={message.id}
              type="button"
              aria-label={\`Jump to message \${index + 1}: \${previewOf(
                message.text,
              )}\`}
              style={styles.minimapBarButton}
              onClick={() => onJump(message.id)}>
              <span
                aria-hidden
                style={minimapBarStyle(message, message.id === activeId)}
              />
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

// ============= PAGE =============

export default function AiChatMinimapRecapTemplate() {
  const [messages, setMessages] = useState(MESSAGES);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isRecapVisible, setIsRecapVisible] = useState(true);
  const [isPillHovered, setIsPillHovered] = useState(false);
  const [isChangesOpen, setIsChangesOpen] = useState(false);
  const [draft, setDraft] = useState('');
  // Deterministic id counter for messages sent from the composer.
  const [nextMessageId, setNextMessageId] = useState(15);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const jumpToMessage = (id: string) => {
    setActiveId(id);
    messageRefs.current[id]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  const sendDraft = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {
        id: \`m-\${nextMessageId}\`,
        sender: 'user',
        // Fixed timestamp keeps the page deterministic.
        sentAt: '2026-07-09T09:45:00',
        text,
      },
    ]);
    setNextMessageId(prev => prev + 1);
    setDraft('');
  };

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      {/* aria-live recap: announced when it (re)renders, dismissible. */}
      {isRecapVisible && (
        <div aria-live="polite">
          <Card padding={3}>
            <HStack gap={2} vAlign="start">
              <Icon icon={ClockIcon} size="sm" color="secondary" />
              <StackItem size="fill" style={styles.recapBody}>
                <VStack gap={1}>
                  <Text type="label" size="sm" style={styles.recapEyebrow}>
                    Recap
                  </Text>
                  <Text type="supporting" color="secondary">
                    {RECAP_TEXT}
                  </Text>
                </VStack>
              </StackItem>
              <IconButton
                label="Dismiss recap"
                tooltip="Dismiss"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => setIsRecapVisible(false)}
              />
            </HStack>
          </Card>
        </div>
      )}
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={\`Message \${ASSISTANT_NAME}\`}
            isLabelHidden
            rows={2}
            placeholder="Type a message…"
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
            <Text type="supporting" color="secondary">
              Session is idle — replies land immediately
            </Text>
            <StackItem size="fill" />
            <IconButton
              label="Send message"
              tooltip="Send"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              size="sm"
              onClick={() => sendDraft(draft)}
            />
          </HStack>
        </VStack>
      </div>
    </VStack>
  );

  const totalAdditions = CHANGED_FILES.reduce(
    (sum, file) => sum + file.additions,
    0,
  );
  const totalDeletions = CHANGED_FILES.reduce(
    (sum, file) => sum + file.deletions,
    0,
  );

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{SESSION_TITLE}</Heading>
                  <StatusDot variant="success" label="Session idle" />
                </HStack>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {messages.length} messages
              </Text>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.stage}>
              <div style={styles.chatColumn}>
                <ChatLayout composer={composer}>
                  <ChatMessageList density="balanced">
                    <ChatSystemMessage variant="divider">
                      Thursday, July 9
                    </ChatSystemMessage>
                    <ChatSystemMessage>
                      {ASSISTANT_NAME} can edit files in the settings-web
                      sandbox.
                    </ChatSystemMessage>
                    {messages.map(message => (
                      <div
                        key={message.id}
                        ref={element => {
                          messageRefs.current[message.id] = element;
                        }}>
                        <ChatMessage
                          sender={message.sender}
                          avatar={
                            message.sender === 'assistant' ? (
                              <Avatar name={ASSISTANT_NAME} size="small" />
                            ) : undefined
                          }>
                          <ChatMessageBubble
                            name={
                              message.sender === 'assistant'
                                ? ASSISTANT_NAME
                                : undefined
                            }
                            metadata={
                              <ChatMessageMetadata
                                timestamp={
                                  <Timestamp
                                    value={message.sentAt}
                                    format="time"
                                  />
                                }
                              />
                            }>
                            {message.text}
                          </ChatMessageBubble>
                        </ChatMessage>
                      </div>
                    ))}
                  </ChatMessageList>
                </ChatLayout>
              </div>

              {/* (a) Right-edge minimap — pointer-width surfaces only. */}
              {!isCompact && (
                <Minimap
                  messages={messages}
                  activeId={activeId}
                  onJump={jumpToMessage}
                />
              )}

              {/* (c) Floating session-changes pill: diff glyph collapsed,
                  label revealed on hover/focus, click opens the Dialog. */}
              <button
                type="button"
                aria-label={\`Session changes: \${CHANGED_FILES.length} files changed\`}
                style={styles.changesPill}
                onMouseEnter={() => setIsPillHovered(true)}
                onMouseLeave={() => setIsPillHovered(false)}
                onFocus={() => setIsPillHovered(true)}
                onBlur={() => setIsPillHovered(false)}
                onClick={() => setIsChangesOpen(true)}>
                <Icon icon={FileDiffIcon} size="sm" color="secondary" />
                {isPillHovered && (
                  <Text type="label" size="sm">
                    {CHANGED_FILES.length} files changed
                  </Text>
                )}
              </button>
            </div>
          </LayoutContent>
        }
      />

      <Dialog
        isOpen={isChangesOpen}
        onOpenChange={setIsChangesOpen}
        width={480}>
        <Layout
          header={
            <DialogHeader
              title="Session changes"
              subtitle={\`\${CHANGED_FILES.length} files changed · +\${totalAdditions} / −\${totalDeletions}\`}
              // Deliberate: the dismiss X sits on the LEFT of the header
              // (startContent) — no onOpenChange, so no right-side close.
              startContent={
                <IconButton
                  label="Close session changes"
                  tooltip="Close"
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChangesOpen(false)}
                />
              }
            />
          }
          content={
            <LayoutContent>
              <VStack gap={0}>
                {CHANGED_FILES.map((file, index) => (
                  <VStack key={file.id} gap={0}>
                    <HStack gap={2} vAlign="center" style={styles.fileRow}>
                      <StatusDot
                        variant={FILE_STATUS_DOT[file.status].variant}
                        label={FILE_STATUS_DOT[file.status].label}
                      />
                      <StackItem size="fill" style={styles.filePathCell}>
                        <Text type="code" size="sm" maxLines={1}>
                          {file.path}
                        </Text>
                      </StackItem>
                      <Text
                        type="supporting"
                        hasTabularNumbers
                        style={styles.addCount}>
                        +{file.additions}
                      </Text>
                      <Text
                        type="supporting"
                        hasTabularNumbers
                        style={styles.removeCount}>
                        −{file.deletions}
                      </Text>
                    </HStack>
                    {index < CHANGED_FILES.length - 1 && <Divider />}
                  </VStack>
                ))}
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    </div>
  );
}
`;export{e as default};