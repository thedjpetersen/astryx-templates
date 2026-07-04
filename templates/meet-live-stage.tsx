// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (Kestrel Labs' 'Atlas Q3 · Launch
 *   Readiness Review', Thu Jul 16 2026, fixed 00:31:04 elapsed chip; 9
 *   participants with fixed mute/camera states and per-person gradients —
 *   Priya Raman hosting, 'you' as Alex Rivera; a 12-line speaker-attributed
 *   caption fixture with fixed meeting timecodes walked in order by an
 *   interval; a three-deep raised-hands queue with fixed raise timecodes,
 *   three seeded reactions, and a '0:42' breakout countdown string — no
 *   clocks, randomness, or network media)
 * @output Live meeting stage focused on captions and participation: a dark
 *   active-speaker stage (large gradient tile following the current caption
 *   line, small-tile filmstrip, floating reactions column), a live captions
 *   band showing two speaker-attributed lines with the current one
 *   highlighted, a participation strip (CC toggle + language chip, emoji
 *   reaction buttons, raise-hand toggle, Auto/Grid/Spotlight/Sidebar layout
 *   switcher in a popover card), a host controls cluster (Mute all behind
 *   an AlertDialog, meeting Lock toggle, REC badge with fixed elapsed), a
 *   dismissible breakout banner ('Rooms open in 0:42 — Join Room 3'), and a
 *   320px raised-hands queue panel with an up-next invite card, per-row
 *   lower buttons, Lower all, and a recently-lowered trail
 * @position Page template; emitted by `astryx template meet-live-stage`
 *
 * Frame: root 100dvh div around Layout height="fill", no page scroll.
 * LayoutHeader (56px chrome row) carries the meeting title + Atlas Q3
 * token, REC Badge, fixed elapsed chip, participant count, and the host
 * controls cluster (Mute all, Lock, panel toggle). LayoutContent (padding
 * 0) stacks the token-pure breakout banner above the scheme-locked stage
 * column: speaker area (scrolls only in grid mode) over the fixed captions
 * band over the fixed participation strip. LayoutPanel end 320 hosts the
 * raised-hands queue. This surface deliberately owns NO chat rail, NO
 * per-tile menus, and NO mic/camera/leave controls — those belong to
 * video-call-layout; this page is the captions-and-participation view of
 * the same call.
 *
 * Responsive contract:
 * - >1024px: header | stage column (speaker view or grid, captions band,
 *   participation strip) | hands panel 320 (fixed width, body scrolls).
 * - <=1024px: the hands panel drops below the stage as a fixed-height Card
 *   inside the stage scroll region (still behind the header panel toggle);
 *   the header hides the elapsed chip and the workspace/date line; sidebar
 *   layout degrades to the bottom-filmstrip arrangement.
 * - The filmstrip is the only horizontal scroller (explicit overflowX);
 *   tiles shrink 148px→120px at <=640px, where the participation strip
 *   wraps and emoji buttons grow to 40px tap targets.
 *
 * Container policy (meeting-stage archetype): frame-first rows and panels;
 * the only Cards are the up-next invite card in the hands panel, the
 * layout-switcher popover body, and the stacked panel below 1024px.
 *
 * Color policy: the stage column is a deliberately scheme-locked surface —
 * `colorScheme: 'dark'` in styles.stageColumn plus literal hex/rgba paint
 * (STAGE_BG, camera-off slate, tile chips, speaking glow, muted-mic red,
 * hand-queue amber, caption band scrim + highlight, reaction chips, white
 * hairlines). Meeting "glass" must look identical under the Light/Dark
 * toggle, so these stay raw literals rather than tokens or light-dark()
 * pairs; stage text uses literals (TILE_TEXT, CAPTION_DIM) for AA
 * contrast. Everything outside the locked column (header, breakout banner,
 * hands panel, popover, dialogs) is token-pure and theme-adaptive. All
 * media is mocked — no <video>/getUserMedia/network assets; tiles are CSS
 * gradients with Avatar initials, captions advance an index over a fixture
 * array on a plain setInterval, and reactions/elapsed/countdown are
 * fixture strings. Entry animations are JS-gated on reduced motion.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import {
  CaptionsIcon,
  ChevronDownIcon,
  DoorOpenIcon,
  HandIcon,
  LanguagesIcon,
  LayoutGridIcon,
  LockIcon,
  LockOpenIcon,
  MicIcon,
  MicOffIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  ShieldIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  VideoOffIcon,
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Switch} from '@astryxdesign/core/Switch';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STAGE PAINT CONSTANTS =============
// The stage is "meeting glass": literal dark colors locked with
// colorScheme:'dark' so captions and tiles look identical in light mode.

const STAGE_BG = '#0B0F1E';
const TILE_OFF_BG = '#171D33';
const TILE_TEXT = '#EEF1FA';
const TILE_CHIP_BG = 'rgba(7, 10, 22, 0.72)';
const SPEAKING_GLOW = '#3DDC85';
const MUTED_MIC = '#F26D6D';
const HAND_AMBER = '#B7791F';
const CAPTION_BAND_BG = 'rgba(7, 10, 22, 0.65)';
const CAPTION_CURRENT_BG = 'rgba(255, 255, 255, 0.07)';
const CAPTION_ACCENT = '#7BA8FF';
const CAPTION_DIM = 'rgba(226, 232, 240, 0.84)';
const STAGE_HAIRLINE = '1px solid rgba(255, 255, 255, 0.08)';
const REACTION_CHIP_BG = 'rgba(23, 29, 51, 0.9)';

// Entry animations only, gated on prefers-reduced-motion at call sites.
const KEYFRAME_CSS = `
@keyframes mls-reaction-in {
  from { transform: translateY(16px) scale(0.6); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes mls-caption-in {
  from { transform: translateY(4px); opacity: 0.2; }
  to { transform: translateY(0); opacity: 1; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Layout height="fill" collapses in the demo's auto-height stage — the
  // 100dvh root keeps internal scrolling working.
  root: {height: '100dvh', width: '100%'},
  // Stage column: speaker area flexes, captions band + strip stay fixed.
  stageColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    colorScheme: 'dark',
    backgroundColor: STAGE_BG,
    color: TILE_TEXT,
  },
  contentColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  stageScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Speaker + vertical rail (sidebar mode) share one row.
  speakerRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    minHeight: 0,
  },
  // Shared tile geometry; featured/film/grid layer their extras on top.
  tileBase: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Featured tile: 16:9 capped so filmstrip + captions + strip stay on
  // screen at 1440x900.
  featuredWrap: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
  },
  featuredTile: {
    width: '100%',
    maxWidth: 880,
    maxHeight: 'min(50vh, 440px)',
  },
  featuredSpeaking: {
    boxShadow: `0 0 0 3px ${SPEAKING_GLOW}, 0 0 18px rgba(61, 220, 133, 0.45)`,
  },
  // Filmstrip: the page's only horizontal scroller. The wrap anchors a
  // right-edge fade + "+n more" chip whenever tiles overflow, so the strip
  // never looks hard-clipped mid-tile.
  filmstripWrap: {position: 'relative', flex: 'none'},
  filmstrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  filmstripFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 'var(--spacing-1)',
    width: 72,
    pointerEvents: 'none',
    background: `linear-gradient(to right, rgba(11, 15, 30, 0), ${STAGE_BG})`,
  },
  filmstripMoreChip: {
    position: 'absolute',
    right: 'var(--spacing-1)',
    top: '50%',
    transform: 'translateY(calc(-50% - var(--spacing-1) / 2))',
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: TILE_CHIP_BG,
    border: STAGE_HAIRLINE,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  },
  filmTile: {flex: '0 0 148px', borderRadius: 'var(--radius-element)'},
  filmTileCompact: {flex: '0 0 120px'},
  filmTileSpeaking: {boxShadow: `inset 0 0 0 2px ${SPEAKING_GLOW}`},
  // Sidebar mode: vertical rail of small tiles beside the speaker.
  sideRail: {
    flex: '0 0 172px',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    overflowY: 'auto',
    minHeight: 0,
    maxHeight: 'min(50vh, 440px)',
    paddingRight: 2,
  },
  sideRailTile: {flex: '0 0 auto'},
  // Grid mode: uniform small tiles, wrapping — no featured emphasis.
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  tileGridCompact: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  },
  // Bottom-left name chip: dark pill legible over any gradient.
  nameChip: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 8px',
    borderRadius: 999,
    backgroundColor: TILE_CHIP_BG,
    fontSize: 12,
    maxWidth: 'calc(100% - 2 * var(--spacing-2))',
  },
  nameChipMini: {
    bottom: 'var(--spacing-1)',
    left: 'var(--spacing-1)',
    fontSize: 11,
    padding: '2px 6px',
    gap: 4,
    maxWidth: 'calc(100% - 2 * var(--spacing-1))',
  },
  nameChipText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tileTopLeft: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexWrap: 'wrap',
    maxWidth: 'calc(100% - var(--spacing-4))',
  },
  handQueueBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: HAND_AMBER,
    fontSize: 11,
    fontWeight: 700,
  },
  handQueueBadgeMini: {
    position: 'absolute',
    top: 'var(--spacing-1)',
    left: 'var(--spacing-1)',
    padding: '1px 6px',
  },
  // Floating reactions column: a persistent stack anchored bottom-right of
  // the featured tile — newest at the bottom, older entries fade with age.
  reactionColumn: {
    position: 'absolute',
    right: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column-reverse',
    alignItems: 'flex-end',
    gap: 6,
    pointerEvents: 'none',
  },
  reactionFloat: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    backgroundColor: REACTION_CHIP_BG,
    border: STAGE_HAIRLINE,
    fontSize: 16,
    lineHeight: 1,
  },
  reactionSender: {fontSize: 11, color: CAPTION_DIM},
  // Captions band: fixed two-line region between tiles and the strip.
  captionsBand: {
    flex: 'none',
    borderTop: STAGE_HAIRLINE,
    backgroundColor: CAPTION_BAND_BG,
    padding: 'var(--spacing-2) var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  // Longhand border props (not the shorthand): the row flips between
  // current/previous across renders, and mixing `borderLeft` with a
  // `borderLeftColor` override leaves a stale currentColor border when
  // React removes the longhand — keep width/style/color separate.
  captionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: '6px var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: 'transparent',
    opacity: 0.85,
  },
  captionRowCurrent: {
    backgroundColor: CAPTION_CURRENT_BG,
    borderLeftColor: CAPTION_ACCENT,
    opacity: 1,
  },
  captionTimecode: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    fontSize: 11,
    color: CAPTION_DIM,
    paddingTop: 3,
  },
  captionSpeaker: {
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    paddingTop: 1.5,
  },
  captionText: {
    fontSize: 13,
    lineHeight: 1.45,
    overflowWrap: 'anywhere',
  },
  // Participation strip: CC + language, reactions, hand, layout switcher.
  strip: {
    flex: 'none',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: STAGE_HAIRLINE,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  stripSpacer: {flex: 1, minWidth: 'var(--spacing-2)'},
  emojiButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    border: STAGE_HAIRLINE,
    backgroundColor: REACTION_CHIP_BG,
    color: TILE_TEXT,
    fontSize: 16,
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  emojiButtonTouch: {width: 40, height: 40},
  // Breakout banner: token-pure row pinned between the header and the
  // scheme-locked stage.
  banner: {
    flex: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  bannerCountdown: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Hands panel plumbing: header fixed, queue scrolls.
  panelRoot: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelHeader: {
    flex: 'none',
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  loweredRow: {opacity: 0.62},
  // Layout switcher popover body — the popover surface is the card.
  layoutPopover: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // <=1024px: the hands panel becomes a fixed-height card in the stage
  // scroll region.
  stackedPanel: {height: 380, display: 'flex', flexDirection: 'column'},
  // <=640px tap-target overrides.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
};

// ============= DATA =============
// Deterministic fixtures: fixed states, no clocks, no randomness, no
// network assets. Elapsed, countdown, timecodes are fixture strings.
// One shared Kestrel Labs / Atlas Q3 world across the Office Suite.

const MEETING_TITLE = 'Launch Readiness Review';
const MEETING_PROGRAM = 'Atlas Q3';
const MEETING_CONTEXT = 'Kestrel Labs · Thu, Jul 16, 2026';
const ELAPSED = '00:31:04';
const BREAKOUT_COUNTDOWN = '0:42';
const BREAKOUT_ROOM = 'Room 3 · GTM follow-ups';
const CAPTION_LANGUAGE = 'English · auto';
const CAPTION_INTERVAL_MS = 4200;
const SPOTLIGHT_ID = 'priya';
const REACTION_EMOJI = ['👍', '🎉', '👏', '❤️', '😮'];
const MAX_REACTIONS = 5;

type LayoutMode = 'auto' | 'grid' | 'spotlight' | 'sidebar';

const LAYOUT_LABELS: Record<LayoutMode, string> = {
  auto: 'Auto',
  grid: 'Grid',
  spotlight: 'Spotlight',
  sidebar: 'Sidebar',
};

const LAYOUT_HINTS: Record<LayoutMode, string> = {
  auto: 'The stage follows whoever the live captions attribute — the current speaker stays large.',
  grid: 'Every participant gets an equal tile; captions keep running below the grid.',
  spotlight: "Locks the stage to the host's spotlight (Priya Raman) regardless of who is speaking.",
  sidebar: 'Keeps the speaker large and moves the small tiles into a vertical rail on the right.',
};

interface Participant {
  id: string;
  name: string;
  role: string;
  isHost: boolean;
  isYou: boolean;
  muted: boolean;
  cameraOn: boolean;
  /** Fixed per-person tile gradient, shown when the camera is "on". */
  gradient: string;
}

/** Dense fixture builder — flags default false, camera defaults on. */
function person(
  id: string,
  name: string,
  role: string,
  flags: {isHost?: boolean; isYou?: boolean; muted?: boolean; cameraOff?: boolean},
  gradient: string,
): Participant {
  return {
    id,
    name,
    role,
    isHost: flags.isHost ?? false,
    isYou: flags.isYou ?? false,
    muted: flags.muted ?? false,
    cameraOn: !(flags.cameraOff ?? false),
    gradient: `linear-gradient(140deg, ${gradient})`,
  };
}

// 9 participants; mute/camera states are fixed fixtures.
const PARTICIPANTS_FIXTURE: Participant[] = [
  person('priya', 'Priya Raman', 'Product Lead', {isHost: true}, '#2E4D8F 0%, #1B2C55 100%'),
  person('you', 'Alex Rivera', 'Platform Eng', {isYou: true, muted: true}, '#35618A 0%, #1D3A57 100%'),
  person('marcus', 'Marcus Webb', 'Eng Manager', {}, '#2F7D5B 0%, #1B4736 100%'),
  person('sofia', 'Sofia Ortiz', 'Design Lead', {}, '#6A3FA0 0%, #3A2260 100%'),
  person('jonah', 'Jonah Fields', 'Marketing', {muted: true, cameraOff: true}, '#7D2F49 0%, #471B2B 100%'),
  person('dana', 'Dana Whitfield', 'Operations', {}, '#8A5A2E 0%, #533619 100%'),
  person('theo', 'Theo Nakamura', 'Data Science', {cameraOff: true}, '#2F6E7D 0%, #1B4047 100%'),
  person('ines', 'Ines Beltran', 'QA Lead', {muted: true}, '#5C4FA8 0%, #322A62 100%'),
  person('ravi', 'Ravi Shah', 'Partnerships', {muted: true, cameraOff: true}, '#A04F3F 0%, #5E2B21 100%'),
];

interface CaptionLine {
  id: string;
  speakerId: string;
  /** Meeting-clock timecode, fixed fixture string. */
  timecode: string;
  text: string;
}

/** Dense caption builder — ids derive from the array position. */
const cap = (speakerId: string, timecode: string, text: string) => ({speakerId, timecode, text});

// 12 caption lines the interval walks in order (wrapping), consistent
// with the Atlas Q3 world: 13-item checklist, Sep 8 launch, breakouts.
const CAPTIONS_FIXTURE: CaptionLine[] = [
  cap('priya', '00:29:41', 'Okay — launch readiness. We are tracking green on eleven of thirteen checklist items as of this morning.'),
  cap('marcus', '00:29:52', 'The two ambers are the billing migration and the EU data residency review, both owned by my team.'),
  cap('marcus', '00:30:01', "Billing flips to green once the dry run finishes Friday — the residency review needs Dana's sign-off."),
  cap('dana', '00:30:11', 'Sign-off is queued for tomorrow; legal returned redlines at nine this morning.'),
  cap('priya', '00:30:20', 'Good. Sofia, where did we land on the onboarding walkthrough?'),
  cap('sofia', '00:30:26', 'Final frames shipped to the build yesterday — copy review is the only open thread.'),
  cap('theo', '00:30:34', 'Dashboards are ready — activation and retention panels go live with the September eighth build.'),
  cap('priya', '00:30:43', 'September eighth is still our date; nothing this week moves it.'),
  cap('sofia', '00:30:52', 'One ask: freeze the walkthrough copy by Monday so localization has a full week.'),
  cap('marcus', '00:31:00', 'Works for us — the freeze lands in the Monday build cut.'),
  cap('dana', '00:31:08', "I'll add the copy freeze to the readiness checklist as item fourteen."),
  cap('priya', '00:31:15', "Perfect. Let's take the raised hands before the breakout rooms open."),
].map((line, index) => ({...line, id: `cap-${index + 1}`}));

interface RaisedHand {
  participantId: string;
  /** Meeting-clock timecode when the hand went up, fixed fixture. */
  raisedAt: string;
}

// Raise order is queue order: Jonah first, then Ines, then Ravi.
const RAISED_HANDS_FIXTURE: RaisedHand[] = [
  {participantId: 'jonah', raisedAt: '00:27:58'},
  {participantId: 'ines', raisedAt: '00:29:36'},
  {participantId: 'ravi', raisedAt: '00:30:47'},
];

interface FloatingReaction {
  id: number;
  emoji: string;
  senderName: string;
}

// Seeded floats so the column reads on first paint; clicks append.
const REACTIONS_FIXTURE: FloatingReaction[] = [
  {id: 1, emoji: '👍', senderName: 'Marcus'},
  {id: 2, emoji: '🎉', senderName: 'Sofia'},
  {id: 3, emoji: '👏', senderName: 'Dana'},
];

// ============= HELPERS =============
// Small derivations over fixture arrays — no engines, no parsers.

function findParticipant(
  participants: Participant[],
  id: string,
): Participant {
  return (
    participants.find(participant => participant.id === id) ?? participants[0]
  );
}

/** 1-based queue position for a raised hand, or null. */
function handPosition(raisedHands: RaisedHand[], id: string): number | null {
  const index = raisedHands.findIndex(hand => hand.participantId === id);
  return index === -1 ? null : index + 1;
}

function displayName(participant: Participant): string {
  return participant.isYou ? `${participant.name} (you)` : participant.name;
}

// ============= TILES =============

// Shared tile chrome: gradient "video" or camera-off slate + Avatar, a
// caption-driven speaking ring, name chip with mic state, and an amber #n
// hand badge. No per-tile menus — those belong to video-call-layout.
function StageTile({
  participant,
  isSpeaking,
  handIndex,
  variant,
  isCompact,
  topTokens,
  children,
}: {
  participant: Participant;
  isSpeaking: boolean;
  handIndex: number | null;
  variant: 'featured' | 'film' | 'grid';
  isCompact: boolean;
  topTokens?: ReactNode;
  children?: ReactNode;
}) {
  const isMini = variant === 'film';
  const base: CSSProperties =
    variant === 'featured'
      ? {...styles.tileBase, ...styles.featuredTile}
      : variant === 'film'
        ? {
            ...styles.tileBase,
            ...styles.filmTile,
            ...(isCompact ? styles.filmTileCompact : undefined),
          }
        : styles.tileBase;
  const speaking =
    variant === 'featured' ? styles.featuredSpeaking : styles.filmTileSpeaking;
  const tileStyle: CSSProperties = {
    ...base,
    background: participant.cameraOn ? participant.gradient : TILE_OFF_BG,
    ...(isSpeaking ? speaking : undefined),
  };
  // Re-pin the token so initials stay readable on the locked-dark stage.
  const avatarStyle: CSSProperties = {
    ['--color-text-secondary' as string]: TILE_TEXT,
  };

  return (
    <div style={tileStyle}>
      <Avatar
        name={participant.name}
        size={variant === 'featured' ? 'large' : isMini ? 'small' : 'medium'}
        style={avatarStyle}
      />

      {variant === 'featured' && (
        <div style={styles.tileTopLeft}>{topTokens}</div>
      )}

      {handIndex != null && variant !== 'featured' && (
        <span style={{...styles.handQueueBadge, ...styles.handQueueBadgeMini}}>
          <Icon icon={HandIcon} size="xsm" color="inherit" />
          {`#${handIndex}`}
        </span>
      )}

      <div
        style={{
          ...styles.nameChip,
          ...(isMini ? styles.nameChipMini : undefined),
        }}>
        <Icon
          icon={participant.muted ? MicOffIcon : MicIcon}
          size="xsm"
          color="inherit"
          style={participant.muted ? {color: MUTED_MIC} : undefined}
        />
        {!participant.cameraOn && (
          <Icon icon={VideoOffIcon} size="xsm" color="secondary" />
        )}
        <span style={styles.nameChipText}>
          {displayName(participant)}
          {variant === 'featured' ? ` · ${participant.role}` : ''}
        </span>
        {participant.isHost && (
          <Tooltip content="Meeting host">
            <Icon icon={ShieldIcon} size="xsm" color="inherit" />
          </Tooltip>
        )}
      </div>

      {children}
    </div>
  );
}

// Filmstrip scroller: measures overflow on mount/resize/scroll and, while
// tiles remain off-screen to the right, shows a fade mask + "+n more" chip
// so the strip never reads as hard-clipped. Chip count derives from the
// measured overflow width over the fixed tile+gap span.
function Filmstrip({
  isCompact,
  children,
  tileCount,
}: {
  isCompact: boolean;
  children: ReactNode;
  tileCount: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hiddenCount, setHiddenCount] = useState(0);

  const measure = () => {
    const node = scrollRef.current;
    if (node == null) {
      return;
    }
    const remaining = node.scrollWidth - node.clientWidth - node.scrollLeft;
    const tileSpan = (isCompact ? 120 : 148) + 8; // tile + gap
    setHiddenCount(remaining > 12 ? Math.round(remaining / tileSpan) : 0);
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // Re-measure when the tile set or tile width changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tileCount, isCompact]);

  return (
    <div style={styles.filmstripWrap}>
      <div ref={scrollRef} style={styles.filmstrip} onScroll={measure}>
        {children}
      </div>
      {hiddenCount > 0 && (
        <>
          <div style={styles.filmstripFade} aria-hidden />
          <span style={styles.filmstripMoreChip} aria-hidden>
            +{hiddenCount} more
          </span>
        </>
      )}
    </div>
  );
}

// ============= STAGE OVERLAYS & BANDS =============

// Floating reactions column: a persistent stack (newest at the bottom) —
// older entries fade with age instead of vanishing on a timer, so the
// column always reads. Entry pop is gated on reduced motion.
function ReactionsColumn({
  reactions,
  isReducedMotion,
}: {
  reactions: FloatingReaction[];
  isReducedMotion: boolean;
}) {
  return (
    <div style={styles.reactionColumn} aria-label="Recent reactions">
      {[...reactions].reverse().map((reaction, indexFromNewest) => (
        <div
          key={reaction.id}
          style={{
            ...styles.reactionFloat,
            opacity: 1 - indexFromNewest * 0.16,
            animation: isReducedMotion
              ? undefined
              : 'mls-reaction-in 420ms ease-out',
          }}>
          <span aria-hidden>{reaction.emoji}</span>
          <span style={styles.reactionSender}>{reaction.senderName}</span>
        </div>
      ))}
    </div>
  );
}

// Live captions band: exactly two speaker-attributed lines — the previous
// line dimmed, the current one highlighted with an accent bar. Timecodes
// are fixed meeting-clock fixture strings, tabular and monospaced.
function CaptionsBand({
  participants,
  previous,
  current,
  isReducedMotion,
  isCompact,
}: {
  participants: Participant[];
  previous: CaptionLine;
  current: CaptionLine;
  isReducedMotion: boolean;
  isCompact: boolean;
}) {
  const renderRow = (line: CaptionLine, isCurrent: boolean) => {
    const speaker = findParticipant(participants, line.speakerId);
    return (
      <div
        key={line.id}
        style={{
          ...styles.captionRow,
          ...(isCurrent ? styles.captionRowCurrent : undefined),
          animation:
            isCurrent && !isReducedMotion
              ? 'mls-caption-in 240ms ease-out'
              : undefined,
        }}>
        {!isCompact && <span style={styles.captionTimecode}>{line.timecode}</span>}
        <span
          style={{
            ...styles.captionSpeaker,
            color: isCurrent ? TILE_TEXT : CAPTION_DIM,
          }}>
          {speaker.name}
        </span>
        <span
          style={{
            ...styles.captionText,
            color: isCurrent ? TILE_TEXT : CAPTION_DIM,
          }}>
          {line.text}
        </span>
      </div>
    );
  };

  return (
    <div style={styles.captionsBand} aria-label="Live captions" aria-live="off">
      {renderRow(previous, false)}
      {renderRow(current, true)}
    </div>
  );
}

// Layout switcher: a popover-style card holding the Auto/Grid/Spotlight/
// Sidebar SegmentedControl (short one-line labels), a per-mode hint, and
// the hide-non-video Switch. View-local only.
function LayoutSwitcher({
  mode,
  onModeChange,
  hideNoVideo,
  onHideNoVideoChange,
  isOpen,
  onOpenChange,
}: {
  mode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
  hideNoVideo: boolean;
  onHideNoVideoChange: (hide: boolean) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const body = (
    <div style={styles.layoutPopover}>
      <Text type="label" size="sm">
        Stage layout
      </Text>
      <SegmentedControl
        label="Stage layout"
        value={mode}
        onChange={value => onModeChange(value as LayoutMode)}>
        {(Object.keys(LAYOUT_LABELS) as LayoutMode[]).map(value => (
          <SegmentedControlItem
            key={value}
            value={value}
            label={LAYOUT_LABELS[value]}
          />
        ))}
      </SegmentedControl>
      <Text type="supporting" size="xsm" color="secondary">
        {LAYOUT_HINTS[mode]}
      </Text>
      <Divider />
      <Switch
        label="Hide tiles without video"
        description="Filmstrip and grid only — the speaker always shows. Applies only to your view."
        value={hideNoVideo}
        onChange={onHideNoVideoChange}
      />
    </div>
  );

  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="above"
      alignment="end"
      width={340}
      label="Stage layout options"
      content={body}>
      <Button
        label={LAYOUT_LABELS[mode]}
        variant="secondary"
        size="sm"
        icon={<Icon icon={LayoutGridIcon} size="sm" color="inherit" />}
        endContent={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
      />
    </Popover>
  );
}

// Breakout banner: token-pure announcement row between the header and the
// dark stage. The countdown is a fixed fixture string — no live clock.
function BreakoutBanner({
  onJoin,
  onDismiss,
  hasJoined,
}: {
  onJoin: () => void;
  onDismiss: () => void;
  hasJoined: boolean;
}) {
  return (
    <div style={styles.banner} role="status">
      <Icon icon={DoorOpenIcon} size="sm" color="secondary" />
      <StackItem size="fill">
        <HStack gap={1} vAlign="center" wrap="wrap">
          <Text type="label" size="sm">
            Breakout rooms open in{' '}
            <span style={styles.bannerCountdown}>{BREAKOUT_COUNTDOWN}</span>
          </Text>
          <Text type="supporting" size="sm" color="primary">
            — you're assigned to {BREAKOUT_ROOM}
          </Text>
        </HStack>
      </StackItem>
      <Button
        label={hasJoined ? 'Joining Room 3…' : 'Join Room 3'}
        variant="primary"
        size="sm"
        isDisabled={hasJoined}
        onClick={onJoin}
      />
      <IconButton
        label="Dismiss breakout banner"
        tooltip="Dismiss"
        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={onDismiss}
      />
    </div>
  );
}

// ============= RAISED-HANDS PANEL =============

// The raised-hands queue: an up-next invite card for #1, the numbered
// queue with per-row lower buttons, a Lower all control, and a
// recently-lowered trail so host actions leave a visible trace.
function HandsPanel({
  participants,
  raisedHands,
  loweredNames,
  onInvite,
  onLower,
  onLowerAll,
  isCompact,
}: {
  participants: Participant[];
  raisedHands: RaisedHand[];
  loweredNames: string[];
  onInvite: (id: string) => void;
  onLower: (id: string) => void;
  onLowerAll: () => void;
  isCompact: boolean;
}) {
  const upNext = raisedHands.length > 0 ? raisedHands[0] : null;
  const upNextPerson =
    upNext == null ? null : findParticipant(participants, upNext.participantId);

  return (
    <div style={styles.panelRoot}>
      <div style={styles.panelHeader}>
        <HStack gap={2} vAlign="center">
          <Icon icon={HandIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <HStack gap={1} vAlign="center">
              <Heading level={2}>Raised hands</Heading>
              <Badge label={String(raisedHands.length)} variant="warning" />
            </HStack>
          </StackItem>
          <Button
            label="Lower all"
            variant="ghost"
            size="sm"
            isDisabled={raisedHands.length === 0}
            onClick={onLowerAll}
            style={isCompact ? styles.controlTouchWide : undefined}
          />
        </HStack>
      </div>

      <div style={styles.panelScroll}>
        <VStack gap={3}>
          {upNext != null && upNextPerson != null ? (
            <Card padding={2}>
              <VStack gap={2}>
                <Text type="label" size="xsm" color="secondary">
                  Up next
                </Text>
                <HStack gap={2} vAlign="center">
                  <Avatar name={upNextPerson.name} size="small" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text type="label" size="sm">
                        {displayName(upNextPerson)}
                      </Text>
                      <Text
                        type="supporting"
                        size="xsm"
                        color="secondary"
                        hasTabularNumbers>
                        {upNextPerson.role} · raised at {upNext.raisedAt}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
                <HStack gap={2}>
                  <Button
                    label="Invite to speak"
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={MicIcon} size="sm" color="inherit" />}
                    onClick={() => onInvite(upNextPerson.id)}
                    style={isCompact ? styles.controlTouchWide : undefined}
                  />
                  <Button
                    label="Lower"
                    variant="secondary"
                    size="sm"
                    onClick={() => onLower(upNextPerson.id)}
                    style={isCompact ? styles.controlTouchWide : undefined}
                  />
                </HStack>
              </VStack>
            </Card>
          ) : (
            <EmptyState
              icon={<Icon icon={HandIcon} size="lg" />}
              title="No hands raised"
              description="Raise-hand requests appear here in the order they arrive."
            />
          )}

          {raisedHands.length > 0 && (
            <List
              density="compact"
              hasDividers={false}
              header={
                <Text type="label" size="sm" color="secondary">
                  In the queue · {raisedHands.length}
                </Text>
              }>
              {raisedHands.map((hand, index) => {
                const person = findParticipant(
                  participants,
                  hand.participantId,
                );
                return (
                  <ListItem
                    key={hand.participantId}
                    label={displayName(person)}
                    description={`${person.role} · at ${hand.raisedAt}`}
                    startContent={
                      <Badge label={`#${index + 1}`} variant="warning" />
                    }
                    endContent={
                      <IconButton
                        label={`Lower ${person.name}'s hand`}
                        tooltip="Lower hand"
                        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => onLower(hand.participantId)}
                        style={isCompact ? styles.controlTouch : undefined}
                      />
                    }
                  />
                );
              })}
            </List>
          )}

          {loweredNames.length > 0 && (
            <>
              <Divider />
              <VStack gap={1}>
                <Text type="label" size="sm" color="secondary">
                  Recently lowered
                </Text>
                {loweredNames.map(name => (
                  <div key={name} style={styles.loweredRow}>
                    <HStack gap={2} vAlign="center">
                      <Avatar name={name} size="xsmall" />
                      <Text type="supporting" size="sm" color="secondary">
                        {name}
                      </Text>
                    </HStack>
                  </div>
                ))}
              </VStack>
            </>
          )}
        </VStack>
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function MeetLiveStageTemplate() {
  const [participants, setParticipants] = useState(PARTICIPANTS_FIXTURE);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('auto');
  const [hideNoVideo, setHideNoVideo] = useState(false);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [captionIndex, setCaptionIndex] = useState(1);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [raisedHands, setRaisedHands] = useState(RAISED_HANDS_FIXTURE);
  const [loweredNames, setLoweredNames] = useState<string[]>([]);
  const [reactions, setReactions] = useState(REACTIONS_FIXTURE);
  const [reactionSeq, setReactionSeq] = useState(REACTIONS_FIXTURE.length + 1);
  const [invitedId, setInvitedId] = useState<string | null>(null);
  const [isMuteAllOpen, setIsMuteAllOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  // <=1024px: panel stacks + sidebar degrades; <=640px: touch targets.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Captions advance in fixture order on a fixed interval — the page's
  // only "live" behavior; the auto layout follows it.
  useEffect(() => {
    const timer = setInterval(() => {
      setCaptionIndex(prev => prev + 1);
    }, CAPTION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const captionCount = CAPTIONS_FIXTURE.length;
  const currentCaption = CAPTIONS_FIXTURE[captionIndex % captionCount];
  const previousCaption =
    CAPTIONS_FIXTURE[(captionIndex + captionCount - 1) % captionCount];
  const activeSpeakerId = currentCaption.speakerId;

  // Featured: invited hand > host spotlight > caption-attributed speaker.
  const featuredId =
    invitedId ?? (layoutMode === 'spotlight' ? SPOTLIGHT_ID : activeSpeakerId);
  const featured = findParticipant(participants, featuredId);

  // Sidebar degrades to the bottom-filmstrip arrangement when stacked.
  const effectiveMode: LayoutMode =
    layoutMode === 'sidebar' && isStacked ? 'auto' : layoutMode;

  const smallTileFilter = (participant: Participant) =>
    participant.id !== featuredId && (!hideNoVideo || participant.cameraOn);
  const filmstripPeople = participants.filter(smallTileFilter);
  const gridPeople = participants.filter(
    participant =>
      participant.id === featuredId || !hideNoVideo || participant.cameraOn,
  );

  const yourHandIndex = handPosition(raisedHands, 'you');

  const addReaction = (emoji: string) => {
    setReactions(prev => [
      ...prev.slice(-(MAX_REACTIONS - 1)),
      {id: reactionSeq, emoji, senderName: 'You'},
    ]);
    setReactionSeq(prev => prev + 1);
  };

  const toggleHand = () => {
    setRaisedHands(prev =>
      prev.some(hand => hand.participantId === 'you')
        ? prev.filter(hand => hand.participantId !== 'you')
        : [...prev, {participantId: 'you', raisedAt: '00:31:20'}],
    );
  };

  const lowerHand = (id: string) => {
    const person = findParticipant(participants, id);
    setRaisedHands(prev => prev.filter(hand => hand.participantId !== id));
    setLoweredNames(prev => [person.name, ...prev].slice(0, 3));
  };

  const lowerAll = () => {
    const names = raisedHands.map(
      hand => findParticipant(participants, hand.participantId).name,
    );
    setRaisedHands([]);
    setLoweredNames(prev => [...names, ...prev].slice(0, 3));
  };

  const inviteToSpeak = (id: string) => {
    setRaisedHands(prev => prev.filter(hand => hand.participantId !== id));
    setParticipants(prev =>
      prev.map(participant =>
        participant.id === id ? {...participant, muted: false} : participant,
      ),
    );
    setInvitedId(id);
  };

  const muteAll = () => {
    setParticipants(prev =>
      prev.map(participant =>
        participant.isYou ? participant : {...participant, muted: true},
      ),
    );
    setIsMuteAllOpen(false);
  };

  // ----- stage views -----

  const featuredTokens = (
    <>
      {layoutMode === 'spotlight' && invitedId == null && (
        <Token
          label="Spotlight"
          size="sm"
          color="purple"
          icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
        />
      )}
      {invitedId != null && (
        <>
          <Token
            label="Invited to speak"
            size="sm"
            color="green"
            icon={<Icon icon={MicIcon} size="xsm" color="inherit" />}
          />
          <IconButton
            label="Return stage to active speaker"
            tooltip="Return to active speaker"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => setInvitedId(null)}
          />
        </>
      )}
    </>
  );

  const renderSmallTile = (
    participant: Participant,
    variant: 'film' | 'grid',
  ) => (
    <StageTile
      key={participant.id}
      participant={participant}
      isSpeaking={participant.id === activeSpeakerId}
      handIndex={handPosition(raisedHands, participant.id)}
      variant={variant}
      isCompact={isCompact}
    />
  );

  const featuredTile = (
    <div style={styles.featuredWrap}>
      <StageTile
        participant={featured}
        isSpeaking={featured.id === activeSpeakerId}
        handIndex={null}
        variant="featured"
        isCompact={isCompact}
        topTokens={featuredTokens}>
        <ReactionsColumn
          reactions={reactions}
          isReducedMotion={isReducedMotion}
        />
      </StageTile>
    </div>
  );

  const speakerArea =
    effectiveMode === 'grid' ? (
      <div style={{position: 'relative'}}>
        <div
          style={{
            ...styles.tileGrid,
            ...(isCompact ? styles.tileGridCompact : undefined),
          }}>
          {gridPeople.map(participant => renderSmallTile(participant, 'grid'))}
        </div>
        <ReactionsColumn
          reactions={reactions}
          isReducedMotion={isReducedMotion}
        />
      </div>
    ) : effectiveMode === 'sidebar' ? (
      <div style={styles.speakerRow}>
        {featuredTile}
        <div style={styles.sideRail}>
          {filmstripPeople.map(participant => (
            <div key={participant.id} style={styles.sideRailTile}>
              {renderSmallTile(participant, 'film')}
            </div>
          ))}
        </div>
      </div>
    ) : (
      <>
        {featuredTile}
        <Filmstrip isCompact={isCompact} tileCount={filmstripPeople.length}>
          {filmstripPeople.map(participant =>
            renderSmallTile(participant, 'film'),
          )}
        </Filmstrip>
      </>
    );

  // ----- participation strip -----

  const emojiTouch = isCompact ? styles.emojiButtonTouch : undefined;

  const participationStrip = (
    <div style={styles.strip}>
      <ToggleButton
        label="CC"
        size="sm"
        icon={<Icon icon={CaptionsIcon} size="sm" color="inherit" />}
        isPressed={captionsOn}
        onPressedChange={setCaptionsOn}
        tooltip={captionsOn ? 'Hide live captions' : 'Show live captions'}
        style={isCompact ? styles.controlTouchWide : undefined}
      />
      {!isCompact && (
        <Token
          label={CAPTION_LANGUAGE}
          size="sm"
          icon={<Icon icon={LanguagesIcon} size="xsm" color="inherit" />}
        />
      )}
      <div style={styles.stripSpacer} />
      {REACTION_EMOJI.map(emoji => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          style={{...styles.emojiButton, ...emojiTouch}}
          onClick={() => addReaction(emoji)}>
          {emoji}
        </button>
      ))}
      <ToggleButton
        label={yourHandIndex != null ? `Hand #${yourHandIndex}` : 'Raise hand'}
        size="sm"
        icon={<Icon icon={HandIcon} size="sm" color="inherit" />}
        isPressed={yourHandIndex != null}
        onPressedChange={toggleHand}
        tooltip={
          yourHandIndex != null
            ? `Lower hand (queued #${yourHandIndex})`
            : 'Raise hand'
        }
        style={isCompact ? styles.controlTouchWide : undefined}
      />
      <div style={styles.stripSpacer} />
      <LayoutSwitcher
        mode={layoutMode}
        onModeChange={mode => {
          setLayoutMode(mode);
          setIsLayoutOpen(false);
        }}
        hideNoVideo={hideNoVideo}
        onHideNoVideoChange={setHideNoVideo}
        isOpen={isLayoutOpen}
        onOpenChange={setIsLayoutOpen}
      />
    </div>
  );

  // ----- hands panel (side panel >1024px, stacked card below) -----

  const handsPanel = (
    <HandsPanel
      participants={participants}
      raisedHands={raisedHands}
      loweredNames={loweredNames}
      onInvite={inviteToSpeak}
      onLower={lowerHand}
      onLowerAll={lowerAll}
      isCompact={isCompact}
    />
  );

  const stage = (
    <div style={styles.contentColumn}>
      {!isBannerDismissed && (
        <BreakoutBanner
          onJoin={() => setHasJoinedRoom(true)}
          onDismiss={() => setIsBannerDismissed(true)}
          hasJoined={hasJoinedRoom}
        />
      )}
      <div style={styles.stageColumn}>
        <div style={styles.stageScroll}>
          {speakerArea}
          {isStacked && isPanelOpen && (
            <Card padding={0} style={styles.stackedPanel}>
              {handsPanel}
            </Card>
          )}
        </div>
        {captionsOn && (
          <CaptionsBand
            participants={participants}
            previous={previousCaption}
            current={currentCaption}
            isReducedMotion={isReducedMotion}
            isCompact={isCompact}
          />
        )}
        {participationStrip}
      </div>
    </div>
  );

  // ----- header: title cluster + host controls cluster -----

  const anyOtherUnmuted = participants.some(
    participant => !participant.isYou && !participant.muted,
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={1}>{MEETING_TITLE}</Heading>
            <Token label={MEETING_PROGRAM} size="sm" color="purple" />
            <Badge label="REC" variant="error" />
            {!isStacked && (
              <Token
                label={ELAPSED}
                size="sm"
                icon={<Icon icon={TimerIcon} size="xsm" color="inherit" />}
              />
            )}
            <HStack gap={1} vAlign="center">
              <Icon icon={UsersIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {participants.length}
              </Text>
            </HStack>
            {!isStacked && (
              <Text type="supporting" size="sm" color="secondary">
                {MEETING_CONTEXT}
              </Text>
            )}
          </HStack>
        </StackItem>
        <Button
          label="Mute all"
          variant="secondary"
          size="sm"
          icon={<Icon icon={MicOffIcon} size="sm" color="inherit" />}
          isDisabled={!anyOtherUnmuted}
          onClick={() => setIsMuteAllOpen(true)}
          style={isCompact ? styles.controlTouchWide : undefined}
        />
        <ToggleButton
          label={isLocked ? 'Locked' : 'Lock'}
          size="sm"
          icon={
            <Icon
              icon={isLocked ? LockIcon : LockOpenIcon}
              size="sm"
              color="inherit"
            />
          }
          isPressed={isLocked}
          onPressedChange={setIsLocked}
          tooltip={isLocked ? 'Unlock — allow new joins' : 'Lock — block new joins'}
          style={isCompact ? styles.controlTouchWide : undefined}
        />
        <ToggleButton
          label={isPanelOpen ? 'Hide hands' : 'Show hands'}
          size="sm"
          icon={
            <Icon
              icon={isPanelOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
              size="sm"
              color="inherit"
            />
          }
          isPressed={isPanelOpen}
          onPressedChange={setIsPanelOpen}
          tooltip={isPanelOpen ? 'Hide raised-hands panel' : 'Show raised-hands panel'}
          style={isCompact ? styles.controlTouchWide : undefined}
        />
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <style>{KEYFRAME_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            {stage}
            <AlertDialog
              isOpen={isMuteAllOpen}
              onOpenChange={setIsMuteAllOpen}
              title="Mute all participants?"
              description="Everyone except you will be muted. Participants can unmute themselves at any time."
              cancelLabel="Cancel"
              actionLabel="Mute all"
              onAction={muteAll}
            />
          </LayoutContent>
        }
        end={
          isPanelOpen && !isStacked ? (
            <LayoutPanel width={320} padding={0} label="Raised hands panel">
              {handsPanel}
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
