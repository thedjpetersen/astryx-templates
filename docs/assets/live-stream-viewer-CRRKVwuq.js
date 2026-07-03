var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one live channel — 'orbitpilot',
 *   partner-verified, streaming 'Zero-G Racing League — Finals night!' in
 *   Sim Racing at 12,847 viewers with 3:42:18 uptime; a 24-line chat
 *   transcript with mod/sub role badges, two system lines, and a pinned
 *   message; four fixed quality options)
 * @output Live-stream viewing surface: a flexible left column with a 16:9
 *   AspectRatio stage (dark gradient frame with deterministic speed-line
 *   streaks, red 'LIVE' Badge + EyeIcon viewer chip pinned top-left, bottom
 *   chrome with mute toggle, '1080p60' quality DropdownMenu, theater
 *   ToggleButton, and a MaximizeIcon button), a streamer row beneath (Avatar
 *   with live ring, channel name + BadgeCheckIcon, stream title, 'Sim Racing'
 *   Token, Follow Button that flips to Following + a bell ToggleButton, and a
 *   disabled gift-a-sub affordance), and a stats strip (uptime, viewers,
 *   'Excellent · 6.2 Mbps' StatusDot health); the right 340px chat
 *   LayoutPanel stacks a pinned-message Banner, a scrolling chat List with
 *   role-colored usernames and mod ShieldIcon / sub StarIcon badges plus
 *   gifted-subs and slow-mode system lines, a 'Chat paused due to scroll'
 *   resume pill, and a bottom TextInput composer with SmileIcon and SendIcon
 * @position Page template; emitted by \`astryx template live-stream-viewer\`
 *
 * Frame: Layout height="fill", no page scroll. LayoutHeader (56px chrome
 * row) carries a back arrow, channel breadcrumb, LIVE Badge, and viewer
 * count. LayoutContent (padding 0) hosts the left column — stage + info —
 * which scrolls only when the viewport is short. LayoutPanel end 340 hosts
 * chat: pinned Banner on top, its own scrolling message body, fixed composer
 * at the bottom. Theater mode hides the info block and lets the stage fill.
 * Choose over video-watch-page when the rail is real-time chat rather than
 * up-next, and over messaging-shell when chat is an appendage to a live
 * stage rather than the product itself.
 *
 * Responsive contract:
 * - >1024px: header | stage column (fill, scrolls if short) | chat 340
 *   (fixed width; only the message list scrolls between pinned Banner and
 *   composer).
 * - <=1024px: the chat panel drops below the stage as a fixed-height Card
 *   inside the single scrolling column; the header hides the breadcrumb
 *   category and keeps the LIVE Badge + viewer count.
 * - The stage keeps 16:9 via AspectRatio at every width; its overlay chrome
 *   is colorScheme-locked dark so controls stay legible on the gradient in
 *   both themes.
 * - <=640px: the \`sm\` (28px) chrome grows to 40px tap targets — the stage
 *   transport controls (mute, quality, theater, fullscreen), the header
 *   back button, and the chat resume pill — while keeping the same \`sm\`
 *   type/icon scale. Desktop keeps the compact 28px chrome unchanged.
 *
 * Container policy (media-stage archetype): frame-first rows and panels;
 * the only Card is the stacked chat container below 1024px. All media is
 * mocked — no <video>/<audio>/<iframe>, no network assets; the stage is a
 * CSS gradient with fixture-driven streak divs, and every counter (viewers,
 * uptime, bitrate, lap) is a fixed fixture value.
 *
 * Color policy: the 16:9 stage is "broadcast glass" — its gradient, caption
 * text, viewer chip, speed lines, and bottom scrim are literal dark colors
 * locked with colorScheme:'dark' on the stage frame so the video canvas
 * looks identical in both themes (STAGE_* / speedLine / stageChrome
 * literals stay literals on purpose). Everything outside the stage is
 * token-pure: chrome uses var(--color-*) tokens, the live avatar ring uses
 * var(--color-error), and the role-colored chat usernames are explicit
 * light-dark() pairs (dark shades on the light chat surface, lifted shades
 * of the same hue in dark mode).
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  BadgeCheckIcon,
  BellIcon,
  BellRingIcon,
  CheckIcon,
  ClockIcon,
  EyeIcon,
  GiftIcon,
  HeartIcon,
  MaximizeIcon,
  PinIcon,
  RectangleHorizontalIcon,
  SendIcon,
  SettingsIcon,
  ShieldIcon,
  SmileIcon,
  StarIcon,
  TimerIcon,
  Volume2Icon,
  VolumeXIcon,
} from 'lucide-react';

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
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STAGE PAINT CONSTANTS =============
// The stage is "broadcast glass": literal dark colors locked with
// colorScheme:'dark' so the frame looks identical in light mode.

const STAGE_GRADIENT =
  'radial-gradient(120% 160% at 20% 0%, #2A1B52 0%, #141B3A 46%, #090D1E 100%)';
const STAGE_TEXT = '#EEF1FA';
const STAGE_MUTED = '#8B93B8';
const STAGE_CHIP_BG = 'rgba(9, 12, 26, 0.72)';

// Outside the locked stage: the live avatar ring rides the error token so
// it tracks the theme like the LIVE Badge does.
const LIVE_RING = 'var(--color-error)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Left column: scrolls only when the viewport is short.
  stageScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // The dark broadcast frame around the 16:9 canvas.
  stageFrame: {
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    colorScheme: 'dark',
    boxShadow: 'var(--shadow-high)',
  },
  // Container for cqw type sizing: 1cqw = 1% of the rendered stage width,
  // so the caption scales with the stage rather than the viewport.
  stageCanvas: {
    position: 'relative',
    height: '100%',
    width: '100%',
    containerType: 'inline-size',
    background: STAGE_GRADIENT,
    color: STAGE_TEXT,
  },
  speedLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    background: 'linear-gradient(90deg, transparent, #7BA8FF)',
  },
  stageCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    textAlign: 'center',
    padding: 'var(--spacing-4)',
  },
  stageTitle: {
    fontSize: 'clamp(16px, 2.6cqw, 28px)',
    fontWeight: 700,
    letterSpacing: '0.12em',
  },
  stageSub: {
    fontSize: 13,
    color: STAGE_MUTED,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.22em',
  },
  // Top-left overlay: LIVE badge + viewer chip.
  stageTopLeft: {
    position: 'absolute',
    top: 'var(--spacing-3)',
    left: 'var(--spacing-3)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  viewerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: STAGE_CHIP_BG,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
  },
  // <=640px: the \`sm\` (28px) controls grow to 40px tap targets — the stage
  // transport, header back button, and resume pill are the primary touch
  // surfaces on a phone. Square override for icon-only buttons; height-only
  // for labeled ones so their text width is untouched.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Bottom chrome: gradient scrim + transport controls.
  stageChrome: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
    background: 'linear-gradient(180deg, transparent, rgba(5, 7, 16, 0.85))',
  },
  liveAvatarRing: {
    borderRadius: '50%',
    padding: 2,
    border: \`1.5px solid \${LIVE_RING}\`,
    flexShrink: 0,
  },
  // Chat panel plumbing: pinned Banner / scrolling body / fixed composer.
  chatRoot: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  chatBodyWrap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  chatScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  chatLine: {overflowWrap: 'anywhere', padding: '2px 0'},
  // Mod/sub badge sits inline before the username, centered at text size.
  roleBadge: {
    display: 'inline-flex',
    verticalAlign: '-0.125em',
    marginRight: 4,
  },
  // Gifted-subs / slow-mode lines: tinted system rows, not plain text.
  systemLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    margin: '2px 0',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
  },
  resumeOverlay: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  resumePill: {pointerEvents: 'auto'},
  composer: {padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)'},
  // <=1024px: chat becomes a fixed-height card below the stage.
  stackedChat: {height: 420, display: 'flex', flexDirection: 'column'},
};

// ============= DATA =============
// Deterministic fixtures: fixed counters, no clocks, no randomness,
// no network assets. Nothing here is a real credential or URL.

const CHANNEL_NAME = 'orbitpilot';
const STREAM_TITLE = 'Zero-G Racing League — Finals night!';
const CATEGORY = 'Sim Racing';
const VIEWER_COUNT = '12,847';
const UPTIME = '3:42:18';
const HEALTH = 'Excellent · 6.2 Mbps';
const LAP_COUNTER = 'LAP 34 / 50 · SECTOR 2';
const PINNED_MESSAGE = 'Bracket + rules: fanhub.example/zgrl-finals';
const SLOW_MODE_NOTE = '10s slow mode is on';

const QUALITY_OPTIONS = ['1080p60', '720p60', '480p', '160p'] as const;
type Quality = (typeof QUALITY_OPTIONS)[number];

// Fixed streak geometry for the "motion" backdrop (percent coordinates).
const SPEED_LINES = [
  {top: 18, left: 6, width: 120, opacity: 0.35},
  {top: 26, left: 58, width: 180, opacity: 0.5},
  {top: 38, left: 22, width: 90, opacity: 0.25},
  {top: 52, left: 64, width: 150, opacity: 0.45},
  {top: 61, left: 10, width: 200, opacity: 0.3},
  {top: 72, left: 44, width: 110, opacity: 0.4},
  {top: 82, left: 70, width: 160, opacity: 0.28},
  {top: 88, left: 18, width: 80, opacity: 0.2},
];

type ChatRole = 'mod' | 'sub' | 'viewer' | 'you';

interface ChatAuthor {
  color: string;
  role: ChatRole;
  /** Sub badge tenure, shown in the star-badge tooltip. */
  months?: number;
}

// Role-colored usernames: mods green, subs purple-family, viewers a fixed
// per-author palette, "you" the accent color. Explicit light-dark() pairs:
// the light shades are darkened for AA-ish contrast against the light chat
// surface; the dark shades lift the same hue for the dark surface.
const AUTHORS: Record<string, ChatAuthor> = {
  nova_kestrel: {color: 'light-dark(#1F8A4C, #4CC38A)', role: 'mod'},
  gridline_sam: {color: 'light-dark(#7C3AED, #A78BFA)', role: 'sub', months: 14},
  apex_andy: {color: 'light-dark(#9333EA, #C084FC)', role: 'sub', months: 3},
  quasar_dot: {color: 'light-dark(#6D28D9, #B197FC)', role: 'sub', months: 7},
  boost_bunny: {color: 'light-dark(#8250DF, #B392F0)', role: 'sub', months: 2},
  pit_lane_pia: {color: 'light-dark(#0E7DB8, #4CB8E8)', role: 'viewer'},
  turn9_tessa: {color: 'light-dark(#B45309, #E8A33D)', role: 'viewer'},
  drs_dan: {color: 'light-dark(#D03C74, #F27DA6)', role: 'viewer'},
  slipstream_ko: {color: 'light-dark(#4D7C0F, #9BC53D)', role: 'viewer'},
  you: {color: 'var(--color-accent)', role: 'you'},
};

interface ChatMessage {
  id: string;
  kind: 'chat' | 'system';
  author?: keyof typeof AUTHORS;
  text: string;
}

// 22 chat lines + 2 system lines, in broadcast order.
const CHAT_FIXTURE: ChatMessage[] = [
  {id: 'm1', kind: 'chat', author: 'nova_kestrel', text: 'Welcome to finals night! Keep it clean in here.'},
  {id: 'm2', kind: 'chat', author: 'pit_lane_pia', text: 'THIS IS IT. THE BIG ONE.'},
  {id: 'm3', kind: 'chat', author: 'gridline_sam', text: 'been waiting 14 months for this bracket'},
  {id: 'm4', kind: 'chat', author: 'drs_dan', text: 'orbitpilot qualified P2, right?'},
  {id: 'm5', kind: 'chat', author: 'turn9_tessa', text: 'P2 with a 1:41.882, yes'},
  {id: 'm6', kind: 'chat', author: 'apex_andy', text: 'that sector 2 line last lap was unreal'},
  {id: 'm7', kind: 'system', text: 'quasar_dot gifted 5 subs to the community!'},
  {id: 'm8', kind: 'chat', author: 'quasar_dot', text: 'finals night hype, enjoy the subs'},
  {id: 'm9', kind: 'chat', author: 'boost_bunny', text: 'quasar_dot the legend'},
  {id: 'm10', kind: 'chat', author: 'pit_lane_pia', text: 'ty for the sub!!'},
  {id: 'm11', kind: 'chat', author: 'nova_kestrel', text: 'Bracket link is pinned above if you just got here.'},
  {id: 'm12', kind: 'chat', author: 'slipstream_ko', text: 'who else is in the final heat?'},
  {id: 'm13', kind: 'chat', author: 'gridline_sam', text: 'vega_rush, orbitpilot, k2_comet, and darklap'},
  {id: 'm14', kind: 'chat', author: 'drs_dan', text: 'darklap on softs is going to be scary'},
  {id: 'm15', kind: 'system', text: SLOW_MODE_NOTE},
  {id: 'm16', kind: 'chat', author: 'turn9_tessa', text: 'slow mode makes sense, chat is FLYING'},
  {id: 'm17', kind: 'chat', author: 'apex_andy', text: 'lap 34 already, pit window opens lap 36'},
  {id: 'm18', kind: 'chat', author: 'pit_lane_pia', text: 'undercut incoming, calling it now'},
  {id: 'm19', kind: 'chat', author: 'boost_bunny', text: 'the gap is 0.8s and closing'},
  {id: 'm20', kind: 'chat', author: 'quasar_dot', text: 'orbit always saves the overtake for the last sector'},
  {id: 'm21', kind: 'chat', author: 'slipstream_ko', text: 'stream quality is so crisp tonight'},
  {id: 'm22', kind: 'chat', author: 'nova_kestrel', text: 'Health is Excellent on our end — enjoy the race.'},
  {id: 'm23', kind: 'chat', author: 'gridline_sam', text: 'LAP 35 LETS GO'},
  {id: 'm24', kind: 'chat', author: 'drs_dan', text: 'DRS ENABLED. here we go.'},
];

// ============= CHAT PIECES =============

/**
 * Mod shield / sub star badge, colored to match the role. The inline-flex
 * span keeps the badge on the same line as the username (Tooltip's
 * display:contents wrapper would otherwise let the raw svg break the line)
 * and centers it at text size.
 */
function RoleBadge({author}: {author: ChatAuthor}) {
  if (author.role === 'mod') {
    return (
      <Tooltip content="Moderator">
        <span style={styles.roleBadge}>
          <Icon icon={ShieldIcon} size="xsm" color="success" />
        </span>
      </Tooltip>
    );
  }
  if (author.role === 'sub' && author.months != null) {
    return (
      <Tooltip content={\`Subscriber · \${author.months}-month badge\`}>
        <span style={styles.roleBadge}>
          <Icon icon={StarIcon} size="xsm" color="secondary" />
        </span>
      </Tooltip>
    );
  }
  return null;
}

/** One chat line: role badge, colored username, message text. */
function ChatLine({message}: {message: ChatMessage}) {
  if (message.kind === 'system' || message.author == null) {
    const isGift = message.text.includes('gifted');
    return (
      <div style={styles.systemLine}>
        <Icon icon={isGift ? GiftIcon : ClockIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" size="xsm">
          {message.text}
        </Text>
      </div>
    );
  }
  const author = AUTHORS[message.author];
  return (
    <div style={styles.chatLine}>
      <Text type="supporting">
        <RoleBadge author={author} />
        <span style={{color: author.color, fontWeight: 600}}>
          {message.author === 'you' ? 'you' : message.author}
        </span>
        {': '}
        {message.text}
      </Text>
    </div>
  );
}

/**
 * The 340px chat rail (or the stacked card body below 1024px): pinned
 * Banner on top, scrolling message list in the middle, composer fixed at
 * the bottom. Scrolling away from the newest line pauses auto-scroll and
 * surfaces the "Chat paused due to scroll" resume pill.
 */
function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>(CHAT_FIXTURE);
  const [chatDraft, setChatDraft] = useState('');
  const [chatPaused, setChatPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  // <=640px: the resume pill takes the 40px tap-target override.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Auto-scroll pins the newest line unless the reader scrolled away.
  useEffect(() => {
    const el = scrollRef.current;
    if (el != null && !chatPaused) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, chatPaused]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el == null) {
      return;
    }
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
    setChatPaused(!atBottom);
  };

  const resumeChat = () => {
    setChatPaused(false);
    const el = scrollRef.current;
    if (el != null) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const sendMessage = () => {
    const text = chatDraft.trim();
    if (text.length === 0) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: \`you-\${prev.length + 1}\`, kind: 'chat', author: 'you', text},
    ]);
    setChatDraft('');
    setChatPaused(false);
  };

  return (
    <div style={styles.chatRoot}>
      {/* Pinned message: always visible above the scrolling body. */}
      <Banner
        status="info"
        container="section"
        icon={<Icon icon={PinIcon} size="sm" color="inherit" />}
        title="Pinned by nova_kestrel"
        description={PINNED_MESSAGE}
      />
      <div style={styles.chatBodyWrap}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={styles.chatScroll}
          aria-label="Stream chat messages">
          <List density="compact">
            {messages.map(message => (
              <ListItem key={message.id} label={<ChatLine message={message} />} />
            ))}
          </List>
        </div>
        {chatPaused && (
          <div style={styles.resumeOverlay}>
            <div style={styles.resumePill}>
              <Button
                label="Chat paused due to scroll"
                variant="secondary"
                size="sm"
                icon={<Icon icon={ArrowDownIcon} size="sm" color="inherit" />}
                onClick={resumeChat}
                style={isCompact ? styles.controlTouchWide : undefined}
              />
            </div>
          </div>
        )}
      </div>
      <Divider />
      <div style={styles.composer}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <TextInput
                label="Send a message"
                isLabelHidden
                value={chatDraft}
                onChange={setChatDraft}
                onEnter={sendMessage}
                placeholder="Send a message"
                startIcon={<Icon icon={SmileIcon} size="sm" color="secondary" />}
                size="md"
              />
            </StackItem>
            <IconButton
              label="Send message"
              tooltip="Send message"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              variant="primary"
              size="md"
              isDisabled={chatDraft.trim().length === 0}
              onClick={sendMessage}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            {SLOW_MODE_NOTE}
          </Text>
        </VStack>
      </div>
    </div>
  );
}

// ============= STAGE =============

/**
 * The mocked live stage: a dark 16:9 gradient canvas with fixture speed
 * lines, the LIVE badge + viewer chip pinned top-left, a centered race
 * caption, and the bottom chrome (mute, quality, theater, fullscreen).
 * No <video>/<iframe> — playback is UI state only.
 */
function LiveStage({
  muted,
  onMutedChange,
  quality,
  onQualityChange,
  theaterMode,
  onTheaterChange,
}: {
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  quality: Quality;
  onQualityChange: (quality: Quality) => void;
  theaterMode: boolean;
  onTheaterChange: (theaterMode: boolean) => void;
}) {
  // <=640px: transport controls take the 40px tap-target override.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const touch = isCompact ? styles.controlTouch : undefined;
  const wideTouch = isCompact ? styles.controlTouchWide : undefined;
  return (
    <div style={styles.stageFrame}>
      <AspectRatio ratio={16 / 9}>
        <div style={styles.stageCanvas}>
          {SPEED_LINES.map((line, index) => (
            <div
              key={\`line-\${index}\`}
              aria-hidden
              style={{
                ...styles.speedLine,
                top: \`\${line.top}%\`,
                left: \`\${line.left}%\`,
                width: line.width,
                opacity: line.opacity,
              }}
            />
          ))}

          <div style={styles.stageCenter}>
            <span style={styles.stageTitle}>ZERO-G RACING LEAGUE</span>
            <span style={styles.stageSub}>{LAP_COUNTER}</span>
            {muted && (
              <Token
                label="Muted"
                size="sm"
                icon={<Icon icon={VolumeXIcon} size="xsm" color="inherit" />}
              />
            )}
          </div>

          <div style={styles.stageTopLeft}>
            <Badge label="LIVE" variant="error" />
            <div style={styles.viewerChip}>
              <Icon icon={EyeIcon} size="xsm" color="inherit" />
              <span>{VIEWER_COUNT}</span>
            </div>
          </div>

          <div style={styles.stageChrome}>
            <HStack gap={1} vAlign="center">
              <IconButton
                label={muted ? 'Unmute' : 'Mute'}
                tooltip={muted ? 'Unmute' : 'Mute'}
                icon={
                  <Icon
                    icon={muted ? VolumeXIcon : Volume2Icon}
                    size="sm"
                    color="inherit"
                  />
                }
                variant="ghost"
                size="sm"
                onClick={() => onMutedChange(!muted)}
                style={touch}
              />
              <DropdownMenu
                button={{
                  label: quality,
                  variant: 'ghost',
                  size: 'sm',
                  icon: <Icon icon={SettingsIcon} size="sm" color="inherit" />,
                  style: wideTouch,
                }}
                menuWidth={160}
                items={QUALITY_OPTIONS.map(option => ({
                  label: option === '1080p60' ? \`\${option} (Source)\` : option,
                  icon:
                    option === quality ? (
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    ) : undefined,
                  onClick: () => onQualityChange(option),
                }))}
              />
              <StackItem size="fill">
                <span />
              </StackItem>
              <ToggleButton
                label="Theater mode"
                size="sm"
                icon={
                  <Icon icon={RectangleHorizontalIcon} size="sm" color="inherit" />
                }
                isPressed={theaterMode}
                onPressedChange={onTheaterChange}
                tooltip={theaterMode ? 'Exit theater mode' : 'Theater mode'}
                style={wideTouch}
              />
              <IconButton
                label="Fullscreen"
                tooltip="Fullscreen"
                icon={<Icon icon={MaximizeIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                onClick={() => {}}
                style={touch}
              />
            </HStack>
          </div>
        </div>
      </AspectRatio>
    </div>
  );
}

// ============= STREAMER INFO =============

/**
 * Streamer row + stats strip below the stage; hidden entirely in theater
 * mode. Follow flips to Following and reveals the bell toggle; gifting is
 * a disabled Tooltip affordance in this demo.
 */
function StreamerInfo({
  following,
  onFollowingChange,
  notificationsOn,
  onNotificationsChange,
}: {
  following: boolean;
  onFollowingChange: (following: boolean) => void;
  notificationsOn: boolean;
  onNotificationsChange: (notificationsOn: boolean) => void;
}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <div style={styles.liveAvatarRing}>
          <Avatar name="Orbit Pilot" size={72} />
        </div>
        <StackItem size="fill">
          <VStack gap={0.5}>
            <HStack gap={1} vAlign="center">
              <Heading level={2}>{CHANNEL_NAME}</Heading>
              <Tooltip content="Verified partner">
                <Icon icon={BadgeCheckIcon} size="sm" color="accent" />
              </Tooltip>
            </HStack>
            <Text type="body">{STREAM_TITLE}</Text>
            <HStack gap={1} vAlign="center">
              <Token label={CATEGORY} size="sm" color="purple" />
            </HStack>
          </VStack>
        </StackItem>
        <HStack gap={2} vAlign="center">
          <Button
            label={following ? 'Following' : 'Follow'}
            variant={following ? 'secondary' : 'primary'}
            icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
            onClick={() => onFollowingChange(!following)}
          />
          {following && (
            <ToggleButton
              label="Live notifications"
              icon={
                <Icon
                  icon={notificationsOn ? BellRingIcon : BellIcon}
                  size="sm"
                  color="inherit"
                />
              }
              isPressed={notificationsOn}
              onPressedChange={onNotificationsChange}
              tooltip={
                notificationsOn ? 'Notifications on' : 'Turn on notifications'
              }
            />
          )}
          <Tooltip content="Gifting is disabled in this demo">
            <Button
              label="Gift a sub"
              variant="secondary"
              icon={<Icon icon={GiftIcon} size="sm" color="inherit" />}
              isDisabled
            />
          </Tooltip>
        </HStack>
      </HStack>

      {/* Stats strip: uptime, viewers, stream health. */}
      <HStack gap={4} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <Icon icon={TimerIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Live for {UPTIME}
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <Icon icon={EyeIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {VIEWER_COUNT} watching
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <StatusDot variant="success" label="Stream health excellent" />
          <Text type="supporting" color="secondary">
            {HEALTH}
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function LiveStreamViewerTemplate() {
  const [following, setFollowing] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(false);
  const [muted, setMuted] = useState(false);
  const [quality, setQuality] = useState<Quality>('1080p60');
  const [theaterMode, setTheaterMode] = useState(false);

  // Responsive contract: <=1024px the chat panel drops below the stage;
  // <=640px the header back button takes the 40px tap-target override.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const stageColumn = (
    <div style={styles.stageScroll}>
      <VStack gap={4}>
        <LiveStage
          muted={muted}
          onMutedChange={setMuted}
          quality={quality}
          onQualityChange={setQuality}
          theaterMode={theaterMode}
          onTheaterChange={setTheaterMode}
        />
        {/* Theater mode hides the info block so the stage fills. */}
        {!theaterMode && (
          <StreamerInfo
            following={following}
            onFollowingChange={setFollowing}
            notificationsOn={notificationsOn}
            onNotificationsChange={setNotificationsOn}
          />
        )}
        {isStacked && (
          <Card padding={0} style={styles.stackedChat}>
            <ChatPanel />
          </Card>
        )}
      </VStack>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Back to browse"
              tooltip="Back to browse"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
              style={isCompact ? styles.controlTouch : undefined}
            />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                {!isStacked && (
                  <Text type="supporting" color="secondary">
                    Browse / {CATEGORY} /
                  </Text>
                )}
                <Heading level={1}>{CHANNEL_NAME}</Heading>
                <Badge label="LIVE" variant="error" />
              </HStack>
            </StackItem>
            <HStack gap={1} vAlign="center">
              <Icon icon={EyeIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {VIEWER_COUNT}
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={<LayoutContent padding={0}>{stageColumn}</LayoutContent>}
      end={
        isStacked ? undefined : (
          <LayoutPanel width={340} padding={0} label="Stream chat">
            <ChatPanel />
          </LayoutPanel>
        )
      }
    />
  );
}
`;export{e as default};