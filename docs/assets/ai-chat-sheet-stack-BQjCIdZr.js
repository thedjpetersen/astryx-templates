var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (main-session transcript about an
 *   index migration, a forked-session mini transcript, a single aside Q&A,
 *   fixed ISO timestamps around 2026-07)
 * @output Full-height AI chat with two stacked right-side sheets: the outer
 *   ~440px sheet is a forked session (purple "Fork" Badge, its own mini
 *   transcript and working composer); the inner ~380px sheet is an aside
 *   (uppercase "ASIDE" eyebrow, "Side question with full context — kept out
 *   of the main chat" copy, one Q&A exchange). Each sheet header carries a
 *   title, variant Badge, collapse-to-rail button, and X; collapsing turns
 *   the sheet into a 44px vertical rail with a rotated title that restores
 *   on click. The main chat dims progressively under the stack, Escape
 *   closes the top sheet, and closed sheets can be reopened from the header
 *   or the inline fork marker in the transcript.
 * @position Page template; emitted by \`astryx template ai-chat-sheet-stack\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (session
 * title, agent status, reopen buttons for closed sheets, Esc hint).
 * LayoutContent (padding 0) hosts a flex row: the main ChatLayout column
 * fills, then the fork sheet, then the aside sheet — the aside is the top
 * of the stack (innermost, right edge) and casts a left shadow over the
 * fork to read as layered paper.
 *
 * Responsive contract (measured with a local ResizeObserver — viewport
 * media queries never fire in the inline demo stage):
 * - >980px: fork sheet 440px, aside sheet 380px, side by side in flow.
 * - 721-980px: sheets narrow to 360px / 320px but stay in flow.
 * - <=720px: sheets float as absolutely-positioned overlays anchored to
 *   the right edge (aside above fork, fork peeking out on the left like a
 *   true sheet stack); rails keep working as 44px overlays.
 * - Collapsed rails are always 44px; the rotated title uses
 *   writing-mode: vertical-rl so it never wraps.
 * - The dim scrim over the main chat is pointer-events: none — the main
 *   composer stays usable under the stack.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {
  CornerDownRightIcon,
  GitBranchIcon,
  PanelRightCloseIcon,
  SendIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {height: '100%'},
  // Flex row: main chat fills, sheets stack against the right edge.
  // position: relative anchors the <=720px overlay sheets.
  body: {
    height: '100%',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  chatArea: {
    flexGrow: 1,
    minWidth: 0,
    height: '100%',
    position: 'relative',
  },
  chatColumn: {
    height: '100%',
    maxWidth: 760,
    marginInline: 'auto',
  },
  // Progressive dim under the sheet stack; pointer-events: none keeps the
  // main composer usable while dimmed.
  dimScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgb(9, 12, 20)',
    pointerEvents: 'none',
    transition: 'opacity 160ms ease',
    zIndex: 5,
  },
  sheet: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minWidth: 0,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-card)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  // <=720px: sheets float over the chat, anchored right.
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    height: 'auto',
  },
  // The top-of-stack sheet casts a left shadow so the stack reads layered.
  sheetShadow: {boxShadow: '-12px 0 28px rgba(9, 12, 20, 0.16)'},
  sheetHeader: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  sheetTitleCell: {minWidth: 0},
  eyebrow: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  sheetSubtitle: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-2)',
  },
  sheetBody: {
    flexGrow: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  sheetFooter: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
  },
  // Collapsed sheet = 44px vertical rail; a real <button> so the whole
  // strip restores the sheet.
  rail: {
    width: 44,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-3)',
    paddingInline: 0,
    border: 'none',
    borderLeft: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
  },
  railLabel: {
    writingMode: 'vertical-rl',
    maxHeight: 240,
    overflow: 'hidden',
  },
  // Main composer (pinned by ChatLayout).
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
};

// ============= RESPONSIVE HELPER =============
// The demo stage is ~1045-1075px wide inside a 1440px window, so viewport
// media queries never fire — measure the page's own width instead.

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

const SESSION_TITLE = 'search-service index migration';
const ASSISTANT_NAME = 'Relay Copilot';
const FORK_TITLE = 'Cutover without dual-write';
const ASIDE_TITLE = 'Index size check';
const ASIDE_COPY =
  'Side question with full context — kept out of the main chat';

interface FixtureMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string; // fixed ISO timestamp
}

const MAIN_MESSAGES: FixtureMessage[] = [
  {
    id: 'm-1',
    sender: 'user',
    text:
      'We need to move search-service from the v2 index schema to v3 ' +
      'without taking reads down. Sketch the rollout?',
    time: '2026-07-10T14:02:00',
  },
  {
    id: 'm-2',
    sender: 'assistant',
    text:
      'Safest path is a four-phase rollout: dual-write v2+v3 behind a ' +
      'flag, backfill historical docs in shard order, shadow-read v3 and ' +
      'diff against v2 for a week, then cut reads over shard by shard. ' +
      'Total wall time is about nine days — most of it the backfill.',
    time: '2026-07-10T14:04:00',
  },
  {
    id: 'm-3',
    sender: 'user',
    text: 'Dual-write approved. Draft the backfill job and estimate cost.',
    time: '2026-07-10T14:37:00',
  },
  {
    id: 'm-4',
    sender: 'assistant',
    text:
      'Backfill job drafted as jobs/backfill_v3.py — 12 workers walking ' +
      'shards oldest-first, checkpointing every 50k docs. At the July ' +
      'snapshot size that is roughly 14 hours per shard and about $210 of ' +
      'compute end to end. The search.dual_write flag ships default-off; ' +
      'flipping it starts phase one.',
    time: '2026-07-10T14:41:00',
  },
];

// The fork branches from turn 4 of the main session.
const FORK_MESSAGES: FixtureMessage[] = [
  {
    id: 'f-1',
    sender: 'user',
    text:
      'Different angle from the fork point: skip dual-write entirely. ' +
      'Freeze v2, replay the write queue into v3 after backfill. How long ' +
      'is the freeze?',
    time: '2026-07-10T15:02:00',
  },
  {
    id: 'f-2',
    sender: 'assistant',
    text:
      'Freeze window is queue replay plus verification: about 40 minutes ' +
      'at the p95 write rate. The catch is that any schema-invalid doc ' +
      'bounces the replay — you would want a dead-letter pen and one ' +
      'manual pass. Riskier than dual-write, but two phases instead of ' +
      'four.',
    time: '2026-07-10T15:05:00',
  },
  {
    id: 'f-3',
    sender: 'user',
    text: 'What guards the replay against double-applying a write?',
    time: '2026-07-10T15:14:00',
  },
  {
    id: 'f-4',
    sender: 'assistant',
    text:
      'Every queue entry carries a monotonic op id per document; the v3 ' +
      'writer refuses anything at or below the doc high-water mark, so ' +
      'replaying a prefix twice is a no-op. The dead-letter pen only ' +
      'collects schema rejects, never duplicates.',
    time: '2026-07-10T15:16:00',
  },
];

// The aside is a single Q&A with full context, kept out of the main chat.
const ASIDE_MESSAGES: FixtureMessage[] = [
  {
    id: 'a-1',
    sender: 'user',
    text: 'Quick check — how big is the v2 index on disk right now?',
    time: '2026-07-10T15:10:00',
  },
  {
    id: 'a-2',
    sender: 'assistant',
    text:
      '638 GB across 12 shards as of the July 8 snapshot, growing about ' +
      '2.1 GB a day. Shard 7 is the outlier at 71 GB — worth splitting ' +
      'before any backfill, whichever plan wins.',
    time: '2026-07-10T15:11:00',
  },
];

// Fixed timestamp attached to messages sent from the demo composers.
const SENT_AT = '2026-07-10T15:20:00';

type SheetId = 'fork' | 'aside';
type SheetState = 'open' | 'rail' | 'closed';

interface SheetChrome {
  id: SheetId;
  title: string;
  badgeLabel: string;
  badgeVariant: 'purple' | 'info';
  railIcon: typeof GitBranchIcon;
  eyebrow?: string;
  subtitle?: string;
}

const FORK_CHROME: SheetChrome = {
  id: 'fork',
  title: FORK_TITLE,
  badgeLabel: 'Fork',
  badgeVariant: 'purple',
  railIcon: GitBranchIcon,
};

const ASIDE_CHROME: SheetChrome = {
  id: 'aside',
  title: ASIDE_TITLE,
  badgeLabel: 'Aside',
  badgeVariant: 'info',
  railIcon: CornerDownRightIcon,
  eyebrow: 'Aside',
  subtitle: ASIDE_COPY,
};

// ============= TRANSCRIPT PIECES =============

function FixtureBubble({message}: {message: FixtureMessage}) {
  const metadata = (
    <ChatMessageMetadata
      timestamp={<Timestamp value={message.time} format="time" />}
    />
  );
  if (message.sender === 'user') {
    return (
      <ChatMessage sender="user">
        <ChatMessageBubble metadata={metadata}>
          {message.text}
        </ChatMessageBubble>
      </ChatMessage>
    );
  }
  return (
    <ChatMessage
      sender="assistant"
      avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
      <ChatMessageBubble name={ASSISTANT_NAME} metadata={metadata}>
        {message.text}
      </ChatMessageBubble>
    </ChatMessage>
  );
}

// ============= SHEET =============

/**
 * One stacked sheet. state === 'rail' renders the 44px vertical rail
 * (whole strip is a restore button with a rotated title); state === 'open'
 * renders the full sheet with header chrome, scrolling body, and an
 * optional footer/composer. 'closed' sheets are not rendered at all —
 * the page offers reopen buttons instead.
 */
function SessionSheet({
  chrome,
  state,
  sheetStyle,
  railStyle,
  onCollapse,
  onClose,
  onExpand,
  footer,
  children,
}: {
  chrome: SheetChrome;
  state: Exclude<SheetState, 'closed'>;
  sheetStyle: CSSProperties;
  railStyle: CSSProperties;
  onCollapse: () => void;
  onClose: () => void;
  onExpand: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  if (state === 'rail') {
    return (
      <button
        type="button"
        style={railStyle}
        aria-label={\`Expand \${chrome.badgeLabel.toLowerCase()} sheet: \${chrome.title}\`}
        onClick={onExpand}>
        <Icon icon={chrome.railIcon} size="sm" color="secondary" />
        <span style={styles.railLabel}>
          <Text type="supporting" color="secondary" maxLines={1}>
            {chrome.title}
          </Text>
        </span>
      </button>
    );
  }
  return (
    <section
      style={sheetStyle}
      aria-label={\`\${chrome.badgeLabel} sheet: \${chrome.title}\`}>
      <div style={styles.sheetHeader}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill" style={styles.sheetTitleCell}>
            <VStack gap={0}>
              {chrome.eyebrow != null && (
                <Text type="supporting" color="secondary" style={styles.eyebrow}>
                  {chrome.eyebrow}
                </Text>
              )}
              <HStack gap={2} vAlign="center">
                <Text type="label" maxLines={1}>
                  {chrome.title}
                </Text>
                <Badge label={chrome.badgeLabel} variant={chrome.badgeVariant} />
              </HStack>
            </VStack>
          </StackItem>
          <IconButton
            label={\`Collapse \${chrome.title} to rail\`}
            tooltip="Collapse to rail"
            icon={<Icon icon={PanelRightCloseIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onCollapse}
          />
          <IconButton
            label={\`Close \${chrome.title}\`}
            tooltip="Close sheet"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        </HStack>
      </div>
      {chrome.subtitle != null && (
        <div style={styles.sheetSubtitle}>
          <Text type="supporting" color="secondary">
            {chrome.subtitle}
          </Text>
        </div>
      )}
      <div style={styles.sheetBody}>{children}</div>
      {footer != null && <div style={styles.sheetFooter}>{footer}</div>}
    </section>
  );
}

// ============= PAGE =============

export default function AiChatSheetStackTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNarrow = wrapWidth > 0 && wrapWidth <= 980;
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const [sheets, setSheets] = useState<Record<SheetId, SheetState>>({
    fork: 'open',
    aside: 'open',
  });
  const [mainDraft, setMainDraft] = useState('');
  const [mainExtras, setMainExtras] = useState<FixtureMessage[]>([]);
  const [forkDraft, setForkDraft] = useState('');
  const [forkExtras, setForkExtras] = useState<FixtureMessage[]>([]);
  // Deterministic id counter for messages sent from the demo composers.
  const [nextSentId, setNextSentId] = useState(1);

  const setSheet = (id: SheetId, state: SheetState) => {
    setSheets(prev => ({...prev, [id]: state}));
  };

  // Escape closes the top of the stack: the aside first (innermost),
  // then the fork. Functional update avoids stale-closure state.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) {
        return;
      }
      setSheets(prev => {
        if (prev.aside !== 'closed') {
          return {...prev, aside: 'closed'};
        }
        if (prev.fork !== 'closed') {
          return {...prev, fork: 'closed'};
        }
        return prev;
      });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const sendMain = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setMainExtras(prev => [
      ...prev,
      {id: \`sent-\${nextSentId}\`, sender: 'user', text, time: SENT_AT},
    ]);
    setNextSentId(prev => prev + 1);
    setMainDraft('');
  };

  const sendFork = (value: string) => {
    const text = value.trim();
    if (text.length === 0) {
      return;
    }
    setForkExtras(prev => [
      ...prev,
      {id: \`sent-\${nextSentId}\`, sender: 'user', text, time: SENT_AT},
    ]);
    setNextSentId(prev => prev + 1);
    setForkDraft('');
  };

  // Progressive dim: each open sheet adds a layer of scrim over the main
  // chat; collapsed rails add a lighter layer.
  const dimFor = (state: SheetState) =>
    state === 'open' ? 0.18 : state === 'rail' ? 0.07 : 0;
  const dim = dimFor(sheets.fork) + dimFor(sheets.aside);

  const openSheetCount =
    (sheets.fork === 'open' ? 1 : 0) + (sheets.aside === 'open' ? 1 : 0);

  // Sheet geometry: full widths wide, narrowed in the mid band, floating
  // right-anchored overlays (aside on top, fork peeking left) when compact.
  const forkWidth = isCompact
    ? Math.min(340, Math.max(240, wrapWidth - 72))
    : isNarrow
      ? 360
      : 440;
  const asideWidth = isCompact
    ? Math.min(300, Math.max(220, wrapWidth - 104))
    : isNarrow
      ? 320
      : 380;

  const forkSheetStyle: CSSProperties = {
    ...styles.sheet,
    width: forkWidth,
    ...(isCompact
      ? {
          ...styles.sheetOverlay,
          ...styles.sheetShadow,
          right: sheets.aside === 'rail' ? 44 : 0,
          zIndex: 2,
        }
      : null),
  };
  const asideSheetStyle: CSSProperties = {
    ...styles.sheet,
    ...styles.sheetShadow,
    width: asideWidth,
    ...(isCompact ? {...styles.sheetOverlay, right: 0, zIndex: 3} : null),
  };
  const forkRailStyle: CSSProperties = {
    ...styles.rail,
    ...(isCompact
      ? {
          ...styles.sheetOverlay,
          right:
            sheets.aside === 'open'
              ? asideWidth
              : sheets.aside === 'rail'
                ? 44
                : 0,
          zIndex: 2,
        }
      : null),
  };
  const asideRailStyle: CSSProperties = {
    ...styles.rail,
    ...(isCompact ? {...styles.sheetOverlay, right: 0, zIndex: 3} : null),
  };

  const mainComposer = (
    <VStack gap={2} style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={\`Message \${ASSISTANT_NAME}\`}
            isLabelHidden
            rows={2}
            placeholder="Message the main session..."
            value={mainDraft}
            onChange={setMainDraft}
          />
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary">
              Main session — replies land here, not in the sheets
            </Text>
            <StackItem size="fill" />
            <Button
              label="Send"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              onClick={() => sendMain(mainDraft)}
            />
          </HStack>
        </VStack>
      </div>
    </VStack>
  );

  const forkComposer = (
    <VStack gap={2}>
      <TextArea
        label="Reply in this fork"
        isLabelHidden
        rows={2}
        placeholder="Reply in this fork..."
        value={forkDraft}
        onChange={setForkDraft}
      />
      <HStack gap={2} vAlign="center">
        <Text type="supporting" color="secondary">
          Stays in this fork
        </Text>
        <StackItem size="fill" />
        <IconButton
          label="Send fork reply"
          tooltip="Send"
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          size="sm"
          onClick={() => sendFork(forkDraft)}
        />
      </HStack>
    </VStack>
  );

  const asideFooter = (
    <HStack gap={2} vAlign="center">
      <Icon icon={CornerDownRightIcon} size="sm" color="secondary" />
      <Text type="supporting" color="secondary">
        One-shot aside — nothing here joins the main transcript
      </Text>
    </HStack>
  );

  return (
    <div ref={wrapRef} style={styles.page}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Heading level={1}>{SESSION_TITLE}</Heading>
                  <StatusDot variant="success" label="Agent idle" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      {openSheetCount} of 2 sheets open
                    </Text>
                  )}
                </HStack>
              </StackItem>
              {sheets.fork === 'closed' && (
                <Button
                  label="Reopen fork"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={GitBranchIcon} size="sm" color="inherit" />}
                  onClick={() => setSheet('fork', 'open')}
                />
              )}
              {sheets.aside === 'closed' && (
                <Button
                  label="Reopen aside"
                  variant="ghost"
                  size="sm"
                  icon={
                    <Icon icon={CornerDownRightIcon} size="sm" color="inherit" />
                  }
                  onClick={() => setSheet('aside', 'open')}
                />
              )}
              {!isCompact &&
                (sheets.fork !== 'closed' || sheets.aside !== 'closed') && (
                  <HStack gap={1} vAlign="center">
                    <Kbd keys="escape" />
                    <Text type="supporting" color="secondary">
                      closes the top sheet
                    </Text>
                  </HStack>
                )}
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.body}>
              {/* Main session — dims progressively under the sheet stack. */}
              <div style={styles.chatArea}>
                <div style={styles.chatColumn}>
                  <ChatLayout composer={mainComposer}>
                    <ChatMessageList density="balanced">
                      <ChatSystemMessage variant="divider">
                        Friday, July 10
                      </ChatSystemMessage>
                      <ChatSystemMessage>
                        {ASSISTANT_NAME} has the full search-service repo in
                        context.
                      </ChatSystemMessage>
                      {MAIN_MESSAGES.map(message => (
                        <FixtureBubble key={message.id} message={message} />
                      ))}
                      {/* Fork marker: turn 4 branched into the outer sheet. */}
                      <ChatSystemMessage
                        icon={
                          <Icon
                            icon={GitBranchIcon}
                            size="sm"
                            color="secondary"
                          />
                        }>
                        <HStack gap={1} vAlign="center">
                          <Text type="supporting" color="secondary">
                            Forked from this turn:
                          </Text>
                          <Button
                            label={FORK_TITLE}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSheet('fork', 'open')}
                          />
                        </HStack>
                      </ChatSystemMessage>
                      {mainExtras.map(message => (
                        <FixtureBubble key={message.id} message={message} />
                      ))}
                    </ChatMessageList>
                  </ChatLayout>
                </div>
                {dim > 0 && (
                  <div
                    style={{...styles.dimScrim, opacity: dim}}
                    aria-hidden
                  />
                )}
              </div>

              {/* Outer sheet: the forked session. */}
              {sheets.fork !== 'closed' && (
                <SessionSheet
                  chrome={FORK_CHROME}
                  state={sheets.fork}
                  sheetStyle={forkSheetStyle}
                  railStyle={forkRailStyle}
                  onCollapse={() => setSheet('fork', 'rail')}
                  onClose={() => setSheet('fork', 'closed')}
                  onExpand={() => setSheet('fork', 'open')}
                  footer={forkComposer}>
                  <ChatMessageList density="compact">
                    <ChatSystemMessage>
                      Forked from turn 4 — full context copied
                    </ChatSystemMessage>
                    {FORK_MESSAGES.map(message => (
                      <FixtureBubble key={message.id} message={message} />
                    ))}
                    {forkExtras.map(message => (
                      <FixtureBubble key={message.id} message={message} />
                    ))}
                  </ChatMessageList>
                </SessionSheet>
              )}

              {/* Inner sheet: the aside — top of the stack. */}
              {sheets.aside !== 'closed' && (
                <SessionSheet
                  chrome={ASIDE_CHROME}
                  state={sheets.aside}
                  sheetStyle={asideSheetStyle}
                  railStyle={asideRailStyle}
                  onCollapse={() => setSheet('aside', 'rail')}
                  onClose={() => setSheet('aside', 'closed')}
                  onExpand={() => setSheet('aside', 'open')}
                  footer={asideFooter}>
                  <ChatMessageList density="compact">
                    {ASIDE_MESSAGES.map(message => (
                      <FixtureBubble key={message.id} message={message} />
                    ))}
                  </ChatMessageList>
                </SessionSheet>
              )}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};