// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one live event — 'Aurora Launch Week —
 *   Live Keynote' at a fixed 8,412-viewer base and a 1:24:06 elapsed base;
 *   a 60-line scripted chat stream across 14 fixture authors with host /
 *   mod / subscriber role badges and three auto-flagged spam lines; a
 *   four-slot agenda; four emoji reaction counters)
 * @output Chat-first live-event surface: a LayoutHeader event banner with
 *   back arrow, event title + red 'LIVE' Badge, a ticking elapsed-timer chip
 *   (TimerIcon), a viewer-count chip (EyeIcon) that climbs as the script
 *   lands, and a TurtleIcon slow-mode ToggleButton; the main column stacks a
 *   pinned-message Banner slot, a fast-scrolling message stream (12 seed
 *   lines + 48 script lines auto-appending on a 1.8s interval) with
 *   role-colored usernames and host CrownIcon / mod ShieldIcon / sub
 *   StarIcon badges, hover-or-tap mod actions per message (PinIcon replaces
 *   the pinned slot, Trash2Icon collapses to a removed stub with Undo,
 *   HourglassIcon timeout greys the author's later lines), username Popover
 *   mini-profiles with mute and @mention actions, an 'N new messages'
 *   resume pill while scrolled up, and a composer row with an emoji
 *   reaction bar that fires rising burst animations; the right 320px
 *   LayoutPanel lists the agenda, hosts & mods, live reaction totals, and
 *   muted users with unmute buttons
 * @position Page template; emitted by `astryx template live-event-chat`
 *
 * Frame: Layout height="fill", no page scroll. LayoutHeader (event banner)
 * carries back arrow, title, LIVE Badge, elapsed timer, viewer count, and
 * the slow-mode toggle. LayoutContent (padding 0) hosts the chat column —
 * pinned Banner on top, its own scrolling stream body with the burst
 * overlay and resume pill, muted-user strip, reaction bar, and composer
 * fixed at the bottom. LayoutPanel end 320 hosts event details: agenda
 * List, hosts & mods, reaction totals, muted users. Choose over
 * live-stream-viewer when chat IS the product (no video stage), and over
 * messaging-shell when the surface is one ephemeral event room rather than
 * a workspace of channels.
 *
 * Responsive contract:
 * - >1024px: header banner | chat column (fill; only the stream scrolls
 *   between pinned Banner and composer) | details panel 320 (fixed width,
 *   scrolls internally).
 * - <=1024px: the details panel hides; a single-row 'Now / Next' agenda
 *   strip appears under the header (overflowX auto, no wrap) so schedule
 *   context survives; muted-user management stays available via the strip
 *   above the composer.
 * - <=640px: the header hides the 'Live events /' breadcrumb and the
 *   elapsed-timer chip (viewer count stays); mod actions are no longer
 *   hover-revealed — tapping a message toggles an inline action row with
 *   40px targets; the back button, resume pill, reaction buttons, and
 *   send button all take 40px tap-target overrides; usernames get an
 *   invisible expanded hit area. Chat lines use overflowWrap anywhere so
 *   long spam strings never force horizontal scroll at 375px.
 * - Mod actions are also revealed on keyboard focus within a message row
 *   (focusing the username button shows the row's actions), so nothing is
 *   hover-only at any width.
 *
 * Container policy (event-room archetype): frame-first rows and panels,
 * zero Cards — chat lines are plain rows, the pinned slot is a Banner, and
 * panel sections are Lists and stacks. Fixtures are deterministic: the
 * elapsed timer and script cadence run on plain setInterval ticks from
 * fixed bases, viewer count derives from how many script lines have
 * landed, burst lanes cycle a fixed offset array — no Date.now(), no
 * Math.random(), no network assets.
 */

import {useEffect, useRef, useState, type CSSProperties} from 'react';

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  AtSignIcon,
  CrownIcon,
  EyeIcon,
  FlagIcon,
  HourglassIcon,
  PinIcon,
  SendIcon,
  ShieldIcon,
  SparklesIcon,
  StarIcon,
  TimerIcon,
  Trash2Icon,
  TurtleIcon,
  Undo2Icon,
  UsersIcon,
  VolumeXIcon,
  XIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Popover} from '@astryxdesign/core/Popover';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BURST ANIMATION =============
// One-shot rising emoji for reaction bursts; removed on animationend so no
// cleanup timers are needed.

const BURST_KEYFRAMES = `
@keyframes lec-burst-rise {
  0% { transform: translateY(0) scale(0.7); opacity: 0; }
  18% { opacity: 1; }
  100% { transform: translateY(-110px) scale(1.4); opacity: 0; }
}`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Chat column plumbing: pinned Banner / scrolling stream / fixed composer.
  chatRoot: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  streamWrap: {
    position: 'relative',
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  streamScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // One chat line: relative so the desktop action bar can overlay top-right.
  messageRow: {
    position: 'relative',
    borderRadius: 'var(--radius-element)',
    padding: '3px var(--spacing-2)',
  },
  messageRowActive: {
    backgroundColor: 'var(--color-background-muted)',
  },
  messageText: {overflowWrap: 'anywhere'},
  // Flagged spam lines get a warning tint + flag row, still readable.
  messageRowFlagged: {
    backgroundColor: 'var(--color-background-warning)',
  },
  // Timed-out authors: their subsequent lines grey out but stay in place.
  messageTimedOut: {opacity: 0.45},
  // Host/mod/sub badge sits inline before the username at text size.
  roleBadge: {
    display: 'inline-flex',
    verticalAlign: '-0.125em',
    marginRight: 4,
  },
  // Username is a real <button> (Popover trigger) restyled as inline text.
  usernameButton: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
    fontWeight: 600,
    cursor: 'pointer',
    color: 'inherit',
  },
  // <=640px: invisible expanded hit area so inline usernames still give a
  // ~40px target without disturbing the text line.
  usernameTouch: {
    padding: '10px 4px',
    margin: '-10px -4px',
  },
  // Desktop: mod actions overlay the row's top-right on hover/focus.
  actionOverlay: {
    position: 'absolute',
    top: -14,
    right: 'var(--spacing-2)',
    display: 'flex',
    gap: 2,
    padding: 2,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background)',
    boxShadow: 'var(--shadow-low)',
    zIndex: 1,
  },
  // <=640px: actions render inline under the text with 40px targets.
  actionInline: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    paddingTop: 'var(--spacing-1)',
  },
  // Deleted lines collapse to a stub row with an inline Undo.
  removedStub: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '2px var(--spacing-2)',
  },
  // Rising emoji bursts float over the bottom of the stream.
  burstLayer: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    height: 160,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  burstEmoji: {
    position: 'absolute',
    bottom: 4,
    fontSize: 26,
    lineHeight: 1,
    animation: 'lec-burst-rise 1.1s ease-out forwards',
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
  // Muted strip + reaction bar + composer live below the Divider.
  composerBlock: {padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)'},
  // <=640px tap-target overrides: square for icon-only, height for labeled.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Header chips: elapsed timer + viewer count.
  headerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // <=1024px: single-row Now/Next agenda strip; scrolls, never wraps.
  agendaStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
  },
  // Details panel: its own scroll region.
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  // Mini-profile popover body.
  profileBody: {padding: 'var(--spacing-3)', maxWidth: 280},
  reactionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed counters and a scripted transcript. No
// clocks, no randomness, no network assets, no real URLs.

const EVENT_TITLE = 'Aurora Launch Week — Live Keynote';
const EVENT_CRUMB = 'Live events';
const VIEWER_BASE = 8412;
/** 1:24:06 into the event when the page mounts. */
const ELAPSED_BASE_SECONDS = 1 * 3600 + 24 * 60 + 6;
const SLOW_MODE_SECONDS = 10;
/** New script lines land this often (ms) — fast, but readable. */
const SCRIPT_CADENCE_MS = 1800;
/** How many script lines are already on screen at mount. */
const INITIAL_VISIBLE = 12;
/** Each landed script line "brings" this many viewers with it. */
const VIEWERS_PER_MESSAGE = 3;

type EventRole = 'host' | 'mod' | 'sub' | 'viewer' | 'you';

interface EventUser {
  color: string;
  role: EventRole;
  tagline: string;
  /** Sub badge tenure, shown in the star-badge tooltip. */
  months?: number;
}

// Role-colored usernames: host amber-orange, mods green, subs
// purple-family, viewers a fixed per-author palette, "you" the accent.
// Every color is an explicit light-dark() pair: the light value is darkened
// for AA-ish contrast on the light chat surface; the dark value keeps the
// same hue, brightened for contrast on the dark chat surface.
const USERS: Record<string, EventUser> = {
  ari_hale: {color: 'light-dark(#C2410C, #FB923C)', role: 'host', tagline: 'Keynote host · Aurora'},
  juno_mod: {color: 'light-dark(#1F8A4C, #5BE49B)', role: 'mod', tagline: 'Community moderator'},
  silas_mod: {color: 'light-dark(#15803D, #4ADE80)', role: 'mod', tagline: 'Community moderator'},
  comet_kai: {color: 'light-dark(#7C3AED, #A78BFA)', role: 'sub', months: 9, tagline: 'Launch-week regular'},
  lumen_lee: {color: 'light-dark(#9333EA, #C084FC)', role: 'sub', months: 3, tagline: 'Design nerd, demo enjoyer'},
  orbit_ola: {color: 'light-dark(#6D28D9, #C4B5FD)', role: 'sub', months: 15, tagline: 'Day-one subscriber'},
  vega_v: {color: 'light-dark(#8250DF, #B197FC)', role: 'sub', months: 2, tagline: 'Here for the reveals'},
  pixel_pat: {color: 'light-dark(#0E7DB8, #38BDF8)', role: 'viewer', tagline: 'First launch week'},
  torch_talia: {color: 'light-dark(#B45309, #FBBF24)', role: 'viewer', tagline: 'Hardware rumor chaser'},
  echo_eli: {color: 'light-dark(#D03C74, #F585B4)', role: 'viewer', tagline: 'Asks the pricing questions'},
  nightowl_nia: {color: 'light-dark(#4D7C0F, #A3E635)', role: 'viewer', tagline: 'Watching from UTC+9'},
  waveform_wes: {color: 'light-dark(#0F766E, #2DD4BF)', role: 'viewer', tagline: 'Clip curator'},
  spam_blitz99: {color: 'light-dark(#6B7280, #9CA3AF)', role: 'viewer', tagline: 'Joined 4 minutes ago'},
  dealz_dropz: {color: 'light-dark(#6B7280, #9CA3AF)', role: 'viewer', tagline: 'Joined 2 minutes ago'},
  you: {color: 'var(--color-accent)', role: 'you', tagline: 'That is you'},
};

type UserId = keyof typeof USERS;

interface ScriptEntry {
  id: string;
  author: UserId;
  text: string;
  /** Auto-flagged as possible spam by the fixture "filter". */
  flagged?: boolean;
  /** Emoji burst that fires when this line lands. */
  burst?: string;
}

// 60 scripted lines: the first INITIAL_VISIBLE are on screen at mount, the
// rest auto-append on the interval. Three are auto-flagged spam.
const SCRIPT: ScriptEntry[] = [
  {id: 's01', author: 'ari_hale', text: 'Welcome to Aurora Launch Week! Keynote is live — say hi.'},
  {id: 's02', author: 'juno_mod', text: 'Mods are here. Keep it kind and on topic.'},
  {id: 's03', author: 'pixel_pat', text: 'been counting down to this all week'},
  {id: 's04', author: 'comet_kai', text: 'sub squad reporting in'},
  {id: 's05', author: 'echo_eli', text: 'audio is crystal clear tonight'},
  {id: 's06', author: 'lumen_lee', text: 'that opening reel was gorgeous'},
  {id: 's07', author: 'torch_talia', text: 'did they just tease hardware??'},
  {id: 's08', author: 'orbit_ola', text: '15 months subbed and this is the best intro yet'},
  {id: 's09', author: 'nightowl_nia', text: 'watching from UTC+9, absolutely worth staying up'},
  {id: 's10', author: 'waveform_wes', text: 'the stage lighting is unreal'},
  {id: 's11', author: 'vega_v', text: 'HYPE', burst: '🎉'},
  {id: 's12', author: 'juno_mod', text: 'Schedule and FAQ are pinned above.'},
  {id: 's13', author: 'pixel_pat', text: 'ok the aurora logo animation is so clean'},
  {id: 's14', author: 'spam_blitz99', text: 'FREE GIFT CARDS >> claim-fast.example << FIRST 50 ONLY', flagged: true},
  {id: 's15', author: 'silas_mod', text: 'Ignore the giveaway links — we never do giveaways in chat.'},
  {id: 's16', author: 'comet_kai', text: 'mods on it, love to see it'},
  {id: 's17', author: 'ari_hale', text: 'Demo time. This is the part I have been waiting for.'},
  {id: 's18', author: 'torch_talia', text: 'DEMO DEMO DEMO', burst: '🔥'},
  {id: 's19', author: 'echo_eli', text: 'the latency numbers on that slide are wild'},
  {id: 's20', author: 'lumen_lee', text: '4ms?? on stage wifi??'},
  {id: 's21', author: 'nightowl_nia', text: 'chat is moving so fast'},
  {id: 's22', author: 'waveform_wes', text: 'someone clip that transition'},
  {id: 's23', author: 'orbit_ola', text: 'clipped it already, will post after'},
  {id: 's24', author: 'vega_v', text: 'the crowd audio when it worked first try'},
  {id: 's25', author: 'pixel_pat', text: 'ship it tonight please'},
  {id: 's26', author: 'dealz_dropz', text: 'aurora merch 90% off dm me b4 mods delete', flagged: true},
  {id: 's27', author: 'juno_mod', text: 'That one is fake too. Report and move on.'},
  {id: 's28', author: 'comet_kai', text: 'live Q&A at 7:30, right?'},
  {id: 's29', author: 'silas_mod', text: 'Yes — drop questions with a Q: prefix and we will queue them.'},
  {id: 's30', author: 'torch_talia', text: 'Q: does the sync engine work offline?'},
  {id: 's31', author: 'echo_eli', text: 'Q: pricing for education accounts?'},
  {id: 's32', author: 'ari_hale', text: 'Seeing great questions already — keep them coming.', burst: '👏'},
  {id: 's33', author: 'lumen_lee', text: 'the roadmap slide has THREE new regions'},
  {id: 's34', author: 'nightowl_nia', text: 'tokyo region finally!!'},
  {id: 's35', author: 'waveform_wes', text: 'this keynote is pacing so well'},
  {id: 's36', author: 'orbit_ola', text: 'they rehearsed this one for sure'},
  {id: 's37', author: 'vega_v', text: 'goosebumps at the reveal music'},
  {id: 's38', author: 'pixel_pat', text: 'viewer count keeps climbing, deserved'},
  {id: 's39', author: 'spam_blitz99', text: 'CLICK MY PROFILE FOR VIP ACCESS!!! limited!!', flagged: true},
  {id: 's40', author: 'silas_mod', text: 'Third strike. Handling it.'},
  {id: 's41', author: 'comet_kai', text: 'thank you mods, chat feels great tonight'},
  {id: 's42', author: 'torch_talia', text: 'the pricing is actually lower than the leak said'},
  {id: 's43', author: 'echo_eli', text: 'free tier includes sync?? huge'},
  {id: 's44', author: 'lumen_lee', text: 'HUGE', burst: '🚀'},
  {id: 's45', author: 'nightowl_nia', text: 'my whole team is going to want this'},
  {id: 's46', author: 'waveform_wes', text: 'okay the migration tool demo sold me'},
  {id: 's47', author: 'orbit_ola', text: 'one-click import looked instant'},
  {id: 's48', author: 'vega_v', text: 'they know their audience'},
  {id: 's49', author: 'ari_hale', text: 'Q&A starts in five minutes — stretch break!'},
  {id: 's50', author: 'pixel_pat', text: 'perfect timing for tea'},
  {id: 's51', author: 'comet_kai', text: 'the countdown overlay is a nice touch'},
  {id: 's52', author: 'torch_talia', text: 'chat speedrun any% while we wait'},
  {id: 's53', author: 'echo_eli', text: 'Q: will the beta invites go out this week?'},
  {id: 's54', author: 'lumen_lee', text: 'crossing fingers for beta access'},
  {id: 's55', author: 'nightowl_nia', text: 'the pinned FAQ answers the beta question btw'},
  {id: 's56', author: 'juno_mod', text: 'Good catch — beta invites roll out Friday, per the FAQ.'},
  {id: 's57', author: 'waveform_wes', text: 'FRIDAY??', burst: '🎉'},
  {id: 's58', author: 'orbit_ola', text: 'best keynote of the year, calling it'},
  {id: 's59', author: 'vega_v', text: 'see everyone in the Q&A'},
  {id: 's60', author: 'ari_hale', text: 'Back in two — queue questions with Q: and we will get through as many as we can.'},
];

interface PinnedMessage {
  author: UserId;
  text: string;
}

const INITIAL_PINNED: PinnedMessage = {
  author: 'juno_mod',
  text: 'Schedule + FAQ: aurora.example/launch-week — Q&A at 7:30, prefix questions with Q:',
};

interface AgendaSlot {
  time: string;
  label: string;
  state: 'done' | 'now' | 'next' | 'later';
}

const AGENDA: AgendaSlot[] = [
  {time: '6:00', label: 'Opening reel', state: 'done'},
  {time: '6:15', label: 'Keynote + live demos', state: 'now'},
  {time: '7:30', label: 'Community Q&A', state: 'next'},
  {time: '8:00', label: 'Roadmap deep dive', state: 'later'},
];

const CREW: UserId[] = ['ari_hale', 'juno_mod', 'silas_mod'];

const REACTION_EMOJIS = ['🎉', '🔥', '👏', '🚀'] as const;
type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

const INITIAL_REACTIONS: Record<ReactionEmoji, number> = {
  '🎉': 124,
  '🔥': 86,
  '👏': 210,
  '🚀': 57,
};

// Burst horizontal lanes (percent), cycled by burst id — no randomness.
const BURST_LANES = [16, 72, 38, 84, 52, 24];

// ============= HELPERS =============

function formatElapsed(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${hours}:${mm}:${ss}`;
}

function formatCount(count: number): string {
  return count.toLocaleString('en-US');
}

function displayName(userId: UserId): string {
  return userId === 'you' ? 'you' : userId;
}

// ============= TYPES =============

interface LiveMessage extends ScriptEntry {
  /** Stable append order; used for timeout "subsequent messages" checks. */
  seq: number;
}

interface Burst {
  id: number;
  emoji: string;
  /** Horizontal lane in percent, cycled from BURST_LANES. */
  lane: number;
}

// ============= ROLE BADGE =============

/**
 * Host crown / mod shield / sub star badge, inline before the username.
 * The inline-flex span keeps the badge on the text line and centers it at
 * text size (Tooltip's display:contents wrapper would otherwise let the
 * raw svg break the line).
 */
function RoleBadge({user}: {user: EventUser}) {
  if (user.role === 'host') {
    return (
      <Tooltip content="Event host">
        <span style={styles.roleBadge}>
          <Icon icon={CrownIcon} size="xsm" color="warning" />
        </span>
      </Tooltip>
    );
  }
  if (user.role === 'mod') {
    return (
      <Tooltip content="Moderator">
        <span style={styles.roleBadge}>
          <Icon icon={ShieldIcon} size="xsm" color="success" />
        </span>
      </Tooltip>
    );
  }
  if (user.role === 'sub' && user.months != null) {
    return (
      <Tooltip content={`Subscriber · ${user.months}-month badge`}>
        <span style={styles.roleBadge}>
          <Icon icon={StarIcon} size="xsm" color="secondary" />
        </span>
      </Tooltip>
    );
  }
  return null;
}

// ============= MESSAGE ROW =============

interface MessageRowProps {
  message: LiveMessage;
  isActive: boolean;
  isTimedOut: boolean;
  isProfileOpen: boolean;
  messageCount: number;
  isMuted: boolean;
  isCompact: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
  onToggleTap: () => void;
  onProfileOpenChange: (isOpen: boolean) => void;
  onPin: () => void;
  onDelete: () => void;
  onTimeout: () => void;
  onClearTimeout: () => void;
  onMute: () => void;
  onUnmute: () => void;
  onMention: () => void;
}

/**
 * One live chat line: role badge, colored username (a Popover trigger for
 * the mini profile), message text, and mod actions. Desktop reveals the
 * action bar on hover or keyboard focus as a floating overlay; <=640px it
 * renders inline with 40px targets after a tap on the row.
 */
function MessageRow({
  message,
  isActive,
  isTimedOut,
  isProfileOpen,
  messageCount,
  isMuted,
  isCompact,
  onActivate,
  onDeactivate,
  onToggleTap,
  onProfileOpenChange,
  onPin,
  onDelete,
  onTimeout,
  onClearTimeout,
  onMute,
  onUnmute,
  onMention,
}: MessageRowProps) {
  const user = USERS[message.author];
  const isSelf = message.author === 'you';

  const rowStyle: CSSProperties = {
    ...styles.messageRow,
    ...(message.flagged ? styles.messageRowFlagged : undefined),
    ...(isActive && !message.flagged ? styles.messageRowActive : undefined),
    ...(isTimedOut ? styles.messageTimedOut : undefined),
  };

  const actionButtonSize = isCompact ? 'md' : 'sm';
  const actionTouch = isCompact ? styles.controlTouch : undefined;

  const actions = (
    <>
      <IconButton
        label={`Pin message from ${displayName(message.author)}`}
        tooltip="Pin message"
        icon={<Icon icon={PinIcon} size="sm" color="inherit" />}
        variant="ghost"
        size={actionButtonSize}
        onClick={onPin}
        style={actionTouch}
      />
      <IconButton
        label={`Delete message from ${displayName(message.author)}`}
        tooltip="Delete message"
        icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
        variant="ghost"
        size={actionButtonSize}
        onClick={onDelete}
        style={actionTouch}
      />
      {!isSelf && (
        <IconButton
          label={
            isTimedOut
              ? `Clear timeout for ${displayName(message.author)}`
              : `Timeout ${displayName(message.author)}`
          }
          tooltip={isTimedOut ? 'Clear timeout' : 'Timeout user (greys later messages)'}
          icon={<Icon icon={HourglassIcon} size="sm" color="inherit" />}
          variant="ghost"
          size={actionButtonSize}
          onClick={isTimedOut ? onClearTimeout : onTimeout}
          style={actionTouch}
        />
      )}
    </>
  );

  const profileContent = (
    <div style={styles.profileBody}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Avatar name={displayName(message.author)} size="small" />
          <StackItem size="fill">
            <VStack gap={0}>
              <HStack gap={1} vAlign="center">
                <Text type="label">{displayName(message.author)}</Text>
                {user.role === 'host' && <Token label="Host" size="sm" color="orange" />}
                {user.role === 'mod' && <Token label="Mod" size="sm" color="green" />}
                {user.role === 'sub' && user.months != null && (
                  <Token label={`Sub · ${user.months}mo`} size="sm" color="purple" />
                )}
              </HStack>
              <Text type="supporting" color="secondary" size="xsm">
                {user.tagline}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
        <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
          {messageCount} message{messageCount === 1 ? '' : 's'} this event
        </Text>
        {isTimedOut && (
          <Banner
            status="warning"
            container="section"
            title="In timeout"
            description="Later messages from this user are greyed."
          />
        )}
        {!isSelf && (
          <HStack gap={2}>
            <Button
              label={isMuted ? 'Unmute' : 'Mute'}
              variant="secondary"
              size="sm"
              icon={<Icon icon={VolumeXIcon} size="sm" color="inherit" />}
              onClick={isMuted ? onUnmute : onMute}
              style={isCompact ? styles.controlTouchWide : undefined}
            />
            <Button
              label="Mention"
              variant="secondary"
              size="sm"
              icon={<Icon icon={AtSignIcon} size="sm" color="inherit" />}
              onClick={onMention}
              style={isCompact ? styles.controlTouchWide : undefined}
            />
            {isTimedOut && (
              <Button
                label="Clear timeout"
                variant="ghost"
                size="sm"
                icon={<Icon icon={HourglassIcon} size="sm" color="inherit" />}
                onClick={onClearTimeout}
                style={isCompact ? styles.controlTouchWide : undefined}
              />
            )}
          </HStack>
        )}
      </VStack>
    </div>
  );

  return (
    <div
      style={rowStyle}
      onMouseEnter={isCompact ? undefined : onActivate}
      onMouseLeave={isCompact ? undefined : onDeactivate}
      onFocus={isCompact ? undefined : onActivate}
      onClick={isCompact ? onToggleTap : undefined}>
      {message.flagged && (
        <HStack gap={1} vAlign="center">
          <Icon icon={FlagIcon} size="xsm" color="warning" />
          <Text type="supporting" color="secondary" size="xsm">
            Auto-flagged as possible spam
          </Text>
        </HStack>
      )}
      <div style={styles.messageText}>
        <Text type="supporting">
          <RoleBadge user={user} />
          <Popover
            label={`Profile: ${displayName(message.author)}`}
            width={280}
            isOpen={isProfileOpen}
            onOpenChange={onProfileOpenChange}
            content={profileContent}>
            <button
              type="button"
              style={{
                ...styles.usernameButton,
                ...(isCompact ? styles.usernameTouch : undefined),
                color: user.color,
              }}
              onClick={event => event.stopPropagation()}>
              {displayName(message.author)}
            </button>
          </Popover>
          {': '}
          {message.text}
          {isTimedOut && (
            <span style={{marginLeft: 6, display: 'inline-flex', verticalAlign: '-0.125em'}}>
              <Token label="timed out" size="sm" color="gray" />
            </span>
          )}
        </Text>
      </div>
      {isActive && !isCompact && <div style={styles.actionOverlay}>{actions}</div>}
      {isActive && isCompact && (
        <div style={styles.actionInline} onClick={event => event.stopPropagation()}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ============= DETAILS PANEL =============

/**
 * The 320px event-details rail: agenda with the live slot highlighted,
 * hosts & mods, live reaction totals (shared state with the reaction bar),
 * and muted users with unmute buttons.
 */
function DetailsPanel({
  reactions,
  mutedUsers,
  onUnmute,
}: {
  reactions: Record<ReactionEmoji, number>;
  mutedUsers: ReadonlySet<UserId>;
  onUnmute: (userId: UserId) => void;
}) {
  return (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={TimerIcon} size="sm" color="secondary" />
            <Heading level={6} accessibilityLevel={2}>
              Agenda
            </Heading>
          </HStack>
          <List density="compact" hasDividers={false}>
            {AGENDA.map(slot => (
              <ListItem
                key={slot.time}
                label={slot.label}
                description={slot.time}
                startContent={
                  slot.state === 'now' ? (
                    <StatusDot variant="success" label="Happening now" />
                  ) : slot.state === 'done' ? (
                    <StatusDot variant="neutral" label="Finished" />
                  ) : (
                    <StatusDot variant="accent" label="Upcoming" />
                  )
                }
                endContent={
                  slot.state === 'now' ? (
                    <Badge label="Now" variant="success" />
                  ) : slot.state === 'next' ? (
                    <Badge label="Next" variant="neutral" />
                  ) : undefined
                }
              />
            ))}
          </List>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={UsersIcon} size="sm" color="secondary" />
            <Heading level={6} accessibilityLevel={2}>
              Hosts &amp; mods
            </Heading>
          </HStack>
          <List density="compact" hasDividers={false}>
            {CREW.map(userId => (
              <ListItem
                key={userId}
                label={displayName(userId)}
                description={USERS[userId].tagline}
                startContent={<Avatar name={displayName(userId)} size="xsmall" />}
                endContent={
                  USERS[userId].role === 'host' ? (
                    <Token label="Host" size="sm" color="orange" />
                  ) : (
                    <Token label="Mod" size="sm" color="green" />
                  )
                }
              />
            ))}
          </List>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={SparklesIcon} size="sm" color="secondary" />
            <Heading level={6} accessibilityLevel={2}>
              Live reactions
            </Heading>
          </HStack>
          <VStack gap={1}>
            {REACTION_EMOJIS.map(emoji => (
              <HStack key={emoji} gap={2} vAlign="center">
                <span aria-hidden style={{fontSize: 18, lineHeight: 1}}>
                  {emoji}
                </span>
                <StackItem size="fill">
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {formatCount(reactions[emoji])}
                  </Text>
                </StackItem>
              </HStack>
            ))}
          </VStack>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={VolumeXIcon} size="sm" color="secondary" />
            <Heading level={6} accessibilityLevel={2}>
              Muted by you
            </Heading>
          </HStack>
          {mutedUsers.size === 0 ? (
            <Text type="supporting" color="secondary">
              No one muted. Click a username to mute.
            </Text>
          ) : (
            <VStack gap={1}>
              {[...mutedUsers].map(userId => (
                <HStack key={userId} gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting">{displayName(userId)}</Text>
                  </StackItem>
                  <Button
                    label="Unmute"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    onClick={() => onUnmute(userId)}
                  />
                </HStack>
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function LiveEventChatTemplate() {
  // --- stream state ---
  const [messages, setMessages] = useState<LiveMessage[]>(() =>
    SCRIPT.slice(0, INITIAL_VISIBLE).map((entry, index) => ({...entry, seq: index})),
  );
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<string>>(new Set());
  const [pinned, setPinned] = useState<PinnedMessage | null>(INITIAL_PINNED);
  /** userId -> seq at timeout; that user's messages at/after it grey out. */
  const [timeoutAt, setTimeoutAt] = useState<Partial<Record<UserId, number>>>({});
  const [mutedUsers, setMutedUsers] = useState<ReadonlySet<UserId>>(new Set());
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [profileMessageId, setProfileMessageId] = useState<string | null>(null);

  // --- follow / resume-pill state ---
  const [isPaused, setIsPaused] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // --- composer state ---
  const [draft, setDraft] = useState('');
  const [slowMode, setSlowMode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // --- reactions / bursts ---
  const [reactions, setReactions] = useState(INITIAL_REACTIONS);
  const [bursts, setBursts] = useState<Burst[]>([]);

  // --- clocks (interval ticks from fixed bases; no Date.now) ---
  const [elapsedSeconds, setElapsedSeconds] = useState(ELAPSED_BASE_SECONDS);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scriptCursor = useRef(INITIAL_VISIBLE);
  const pausedRef = useRef(false);
  const burstIdRef = useRef(0);

  // Responsive contract (see file header).
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  // Elapsed event timer: +1s ticks from the fixed 1:24:06 base.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds(seconds => seconds + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Slow-mode cooldown countdown between sends.
  useEffect(() => {
    if (cooldown === 0) {
      return;
    }
    const timer = window.setTimeout(() => {
      setCooldown(seconds => seconds - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const spawnBurst = (emoji: string) => {
    const id = burstIdRef.current++;
    const lane = BURST_LANES[id % BURST_LANES.length];
    setBursts(prev => [...prev.slice(-5), {id, emoji, lane}]);
  };

  // Scripted stream: append the next line every SCRIPT_CADENCE_MS until the
  // 60-line script is exhausted. While scrolled up, landings accrue on the
  // resume pill instead of yanking the viewport.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = SCRIPT[scriptCursor.current];
      if (next == null) {
        window.clearInterval(timer);
        return;
      }
      scriptCursor.current += 1;
      setMessages(prev => [...prev, {...next, seq: prev.length}]);
      if (pausedRef.current) {
        setPendingCount(count => count + 1);
      }
      if (next.burst != null) {
        setReactions(prev => {
          const emoji = next.burst as ReactionEmoji;
          return prev[emoji] == null ? prev : {...prev, [emoji]: prev[emoji] + 1};
        });
        spawnBurst(next.burst);
      }
    }, SCRIPT_CADENCE_MS);
    return () => window.clearInterval(timer);
  }, []);

  // Auto-follow pins the newest line unless the reader scrolled away.
  useEffect(() => {
    const el = scrollRef.current;
    if (el != null && !isPaused) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isPaused]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el == null) {
      return;
    }
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 32;
    if (atBottom) {
      setIsPaused(false);
      setPendingCount(0);
    } else {
      setIsPaused(true);
    }
  };

  const resumeFollow = () => {
    setIsPaused(false);
    setPendingCount(0);
    const el = scrollRef.current;
    if (el != null) {
      el.scrollTop = el.scrollHeight;
    }
  };

  // --- mod actions ---

  const pinMessage = (message: LiveMessage) => {
    setPinned({author: message.author, text: message.text});
  };

  const deleteMessage = (id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
  };

  const undoDelete = (id: string) => {
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const timeoutUser = (userId: UserId) => {
    setTimeoutAt(prev => ({...prev, [userId]: messages.length}));
  };

  const clearTimeoutFor = (userId: UserId) => {
    setTimeoutAt(prev => {
      const next = {...prev};
      delete next[userId];
      return next;
    });
  };

  const muteUser = (userId: UserId) => {
    setMutedUsers(prev => new Set(prev).add(userId));
    setProfileMessageId(null);
  };

  const unmuteUser = (userId: UserId) => {
    setMutedUsers(prev => {
      const next = new Set(prev);
      next.delete(userId);
      return next;
    });
  };

  const mentionUser = (userId: UserId) => {
    setDraft(prev => {
      const mention = `@${displayName(userId)} `;
      return prev.startsWith(mention) ? prev : mention + prev;
    });
    setProfileMessageId(null);
  };

  // --- composer ---

  const composerLocked = slowMode && cooldown > 0;

  const sendMessage = () => {
    const text = draft.trim();
    if (text.length === 0 || composerLocked) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: `you-${prev.length}`, author: 'you', text, seq: prev.length},
    ]);
    setDraft('');
    resumeFollow();
    if (slowMode) {
      setCooldown(SLOW_MODE_SECONDS);
    }
  };

  const react = (emoji: ReactionEmoji) => {
    setReactions(prev => ({...prev, [emoji]: prev[emoji] + 1}));
    spawnBurst(emoji);
  };

  // --- derived ---

  const viewerCount = VIEWER_BASE + (messages.length - INITIAL_VISIBLE) * VIEWERS_PER_MESSAGE;
  const messageCountByUser = messages.reduce<Partial<Record<UserId, number>>>(
    (counts, message) => {
      counts[message.author] = (counts[message.author] ?? 0) + 1;
      return counts;
    },
    {},
  );
  const visibleMessages = messages.filter(message => !mutedUsers.has(message.author));
  const nowSlot = AGENDA.find(slot => slot.state === 'now');
  const nextSlot = AGENDA.find(slot => slot.state === 'next');

  const chatColumn = (
    <div style={styles.chatRoot}>
      <style>{BURST_KEYFRAMES}</style>

      {/* Pinned slot: always visible above the stream; pin replaces it. */}
      {pinned != null && (
        <Banner
          status="info"
          container="section"
          icon={<Icon icon={PinIcon} size="sm" color="inherit" />}
          title={`Pinned by ${displayName(pinned.author)}`}
          description={pinned.text}
          isDismissable
          onDismiss={() => setPinned(null)}
        />
      )}

      {/* <=1024px: Now/Next agenda strip replaces the hidden details panel. */}
      {isStacked && (
        <>
          <div style={styles.agendaStrip}>
            {nowSlot != null && (
              <>
                <StatusDot variant="success" label="Happening now" />
                <Text type="supporting" color="secondary">
                  Now · {nowSlot.label}
                </Text>
              </>
            )}
            {nextSlot != null && (
              <Text type="supporting" color="secondary">
                Next · {nextSlot.label} at {nextSlot.time}
              </Text>
            )}
          </div>
          <Divider />
        </>
      )}

      <div style={styles.streamWrap}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={styles.streamScroll}
          aria-label="Event chat messages">
          {visibleMessages.map(message =>
            deletedIds.has(message.id) ? (
              <div key={message.id} style={styles.removedStub}>
                <Icon icon={Trash2Icon} size="xsm" color="secondary" />
                <Text type="supporting" color="secondary" size="xsm">
                  Message removed by moderator
                </Text>
                <Button
                  label="Undo"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
                  onClick={() => undoDelete(message.id)}
                  style={isCompact ? styles.controlTouchWide : undefined}
                />
              </div>
            ) : (
              <MessageRow
                key={message.id}
                message={message}
                isActive={activeMessageId === message.id}
                isTimedOut={
                  timeoutAt[message.author] != null &&
                  message.seq >= (timeoutAt[message.author] as number)
                }
                isProfileOpen={profileMessageId === message.id}
                messageCount={messageCountByUser[message.author] ?? 0}
                isMuted={mutedUsers.has(message.author)}
                isCompact={isCompact}
                onActivate={() => setActiveMessageId(message.id)}
                onDeactivate={() =>
                  setActiveMessageId(current => (current === message.id ? null : current))
                }
                onToggleTap={() =>
                  setActiveMessageId(current => (current === message.id ? null : message.id))
                }
                onProfileOpenChange={isOpen =>
                  setProfileMessageId(isOpen ? message.id : null)
                }
                onPin={() => pinMessage(message)}
                onDelete={() => deleteMessage(message.id)}
                onTimeout={() => timeoutUser(message.author)}
                onClearTimeout={() => clearTimeoutFor(message.author)}
                onMute={() => muteUser(message.author)}
                onUnmute={() => unmuteUser(message.author)}
                onMention={() => mentionUser(message.author)}
              />
            ),
          )}
        </div>

        {/* Rising emoji bursts over the bottom of the stream. */}
        <div style={styles.burstLayer} aria-hidden>
          {bursts.map(burst => (
            <span
              key={burst.id}
              style={{...styles.burstEmoji, left: `${burst.lane}%`}}
              onAnimationEnd={() =>
                setBursts(prev => prev.filter(item => item.id !== burst.id))
              }>
              {burst.emoji}
            </span>
          ))}
        </div>

        {isPaused && (
          <div style={styles.resumeOverlay}>
            <div style={styles.resumePill}>
              <Button
                label={
                  pendingCount > 0
                    ? `${pendingCount} new message${pendingCount === 1 ? '' : 's'}`
                    : 'Chat paused — jump to latest'
                }
                variant="secondary"
                size="sm"
                icon={<Icon icon={ArrowDownIcon} size="sm" color="inherit" />}
                onClick={resumeFollow}
                style={isCompact ? styles.controlTouchWide : undefined}
              />
            </div>
          </div>
        )}
      </div>

      <Divider />

      <div style={styles.composerBlock}>
        <VStack gap={2}>
          {/* Muted strip: quick unmute without opening the panel. */}
          {mutedUsers.size > 0 && (
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary" size="xsm">
                Muted:
              </Text>
              {[...mutedUsers].map(userId => (
                <Button
                  key={userId}
                  label={displayName(userId)}
                  variant="secondary"
                  size="sm"
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  onClick={() => unmuteUser(userId)}
                  style={isCompact ? styles.controlTouchWide : undefined}
                />
              ))}
            </HStack>
          )}

          {/* Reaction bar: live counters + burst on every press. */}
          <div style={styles.reactionRow}>
            {REACTION_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                label={`${emoji} ${formatCount(reactions[emoji])}`}
                variant="ghost"
                size="sm"
                onClick={() => react(emoji)}
                style={isCompact ? styles.controlTouchWide : undefined}
              />
            ))}
          </div>

          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <TextInput
                label="Send a message"
                isLabelHidden
                value={draft}
                onChange={setDraft}
                onEnter={sendMessage}
                isDisabled={composerLocked}
                placeholder={
                  composerLocked
                    ? `Slow mode — you can chat again in ${cooldown}s`
                    : 'Send a message'
                }
                startIcon={<Icon icon={AtSignIcon} size="sm" color="secondary" />}
                size="md"
              />
            </StackItem>
            <IconButton
              label="Send message"
              tooltip="Send message"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              variant="primary"
              size="md"
              isDisabled={draft.trim().length === 0 || composerLocked}
              onClick={sendMessage}
              style={isCompact ? styles.controlTouch : undefined}
            />
          </HStack>
          <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
            {slowMode
              ? cooldown > 0
                ? `Slow mode on · next message in ${cooldown}s`
                : `Slow mode on · one message every ${SLOW_MODE_SECONDS}s`
              : 'Slow mode off · be kind, mods are watching'}
          </Text>
        </VStack>
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Back to events"
              tooltip="Back to events"
              icon={<Icon icon={ArrowLeftIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
              style={isCompact ? styles.controlTouch : undefined}
            />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {EVENT_CRUMB} /
                  </Text>
                )}
                <Heading level={1}>{EVENT_TITLE}</Heading>
                <Badge label="LIVE" variant="error" />
              </HStack>
            </StackItem>
            {!isCompact && (
              <div style={styles.headerChip}>
                <Icon icon={TimerIcon} size="sm" color="secondary" />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {formatElapsed(elapsedSeconds)}
                </Text>
              </div>
            )}
            <div style={styles.headerChip}>
              <Icon icon={EyeIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {formatCount(viewerCount)}
              </Text>
            </div>
            <ToggleButton
              label="Slow mode"
              size="sm"
              icon={<Icon icon={TurtleIcon} size="sm" color="inherit" />}
              isPressed={slowMode}
              onPressedChange={pressed => {
                setSlowMode(pressed);
                if (!pressed) {
                  setCooldown(0);
                }
              }}
              tooltip={slowMode ? 'Turn off slow mode' : `Slow mode (${SLOW_MODE_SECONDS}s)`}
              style={isCompact ? styles.controlTouch : styles.controlTouchWide}
            />
          </HStack>
        </LayoutHeader>
      }
      content={<LayoutContent padding={0}>{chatColumn}</LayoutContent>}
      end={
        isStacked ? undefined : (
          <LayoutPanel width={320} padding={0} label="Event details">
            <DetailsPanel
              reactions={reactions}
              mutedUsers={mutedUsers}
              onUnmute={unmuteUser}
            />
          </LayoutPanel>
        )
      }
    />
  );
}
