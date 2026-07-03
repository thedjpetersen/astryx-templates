// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 'Q3 Launch Sync' meeting at a fixed
 *   00:24:13 elapsed chip; 9 participants with fixed mute/camera states and
 *   per-person tile gradients — Mira Chen hosting, 'you' as Riley Quinn,
 *   Priya Raman presenting 'Q3 Launch Plan — deck.pdf' as a tenth
 *   screen-share tile; a two-deep hand-raise queue; 10 seeded chat lines
 *   with fixed clock strings; three named breakout rooms with a seeded
 *   assignment map)
 * @output Video-call meeting surface: a dark stage that renders either a
 *   responsive participant tile grid (gradient avatar placeholders, green
 *   speaking-glow ring rotating on a fixed interval, mic/camera state chips,
 *   an always-visible per-tile MoreMenu with Pin / Spotlight / Mute) or a
 *   speaker view (pinned/spotlit/active tile large above a horizontal
 *   filmstrip); a bottom control bar with mute + camera ToggleButtons, a
 *   hand-raise toggle that appends to the queue, a Grid/Speaker
 *   SegmentedControl, and a destructive Leave Button behind an AlertDialog
 *   with a Rejoin undo; and a 340px right LayoutPanel with Chat /
 *   Participants / Breakout tabs — a working composer, a numbered raise
 *   queue + Mute all + per-row host mute roster, and drag-or-menu breakout
 *   room assignment with live per-room counts and an unassigned pool
 * @position Page template; emitted by `astryx template video-call-layout`
 *
 * Frame: Layout height="fill", no page scroll. LayoutHeader (56px chrome
 * row) carries the meeting title, REC Badge, fixed elapsed-time chip,
 * participant count, invite-link copy button, and the panel toggle.
 * LayoutContent (padding 0) hosts the stage column — tile grid or speaker
 * view scrolling above a fixed control bar. LayoutPanel end 340 hosts the
 * tabbed rail; only the tab body scrolls between the TabList and the chat
 * composer. Choose over live-stream-viewer when every tile is a peer rather
 * than one broadcast stage, and over messaging-shell when chat is one tab
 * of a call rail rather than the product itself.
 *
 * Responsive contract:
 * - >1024px: header | stage column (tiles scroll, control bar fixed) |
 *   tabbed panel 340 (fixed width; only the tab body scrolls).
 * - <=1024px: the panel drops below the stage as a fixed-height Card inside
 *   the single scrolling column (still behind the header panel toggle); the
 *   header hides the elapsed chip and invite label.
 * - Tile grid uses auto-fill minmax(200px, 1fr) — 160px at <=640px — so
 *   tiles wrap instead of overflowing; the speaker-view filmstrip is the
 *   only horizontal scroller and gets explicit overflowX auto.
 * - <=640px: control-bar buttons and the header panel toggle grow to 40px+
 *   tap targets and the bar wraps to two rows; per-tile menus are
 *   always-visible IconButtons (never hover-revealed) at every width.
 *
 * Container policy (meeting-stage archetype): frame-first rows and panels;
 * the only Cards are the stacked rail below 1024px and the breakout room
 * drop zones (bordered targets need a container). The stage is
 * colorScheme-locked dark so tiles and chrome read identically in both
 * themes.
 *
 * Color policy: the stage column is a deliberately scheme-locked surface —
 * `colorScheme: 'dark'` in styles.stageColumn plus literal hex/rgba paint
 * (STAGE_BG, camera-off slate, tile-chip scrims, speaking glow, muted-mic
 * red, hand-queue amber, share-frame and per-person tile gradients, and the
 * control-bar white hairline). Video "glass" must look identical under the
 * Light/Dark toggle, so these stay raw literals rather than tokens or
 * light-dark() pairs, and text/icons sitting on the stage use literals too
 * (TILE_TEXT) for guaranteed contrast. Everything outside the stage (header,
 * tabbed rail, breakout zones, dialogs) is token-pure and theme-adaptive. All media is mocked — no <video>/getUserMedia/network assets;
 * tiles are CSS gradients with Avatar initials, the speaking glow rotates
 * on a plain setInterval over fixture order, and the elapsed/REC chrome is
 * fixed fixture text.
 */

import {useEffect, useState, type CSSProperties, type DragEvent} from 'react';

import {
  CheckIcon,
  CopyIcon,
  DoorOpenIcon,
  GalleryHorizontalIcon,
  GripVerticalIcon,
  HandIcon,
  LayoutGridIcon,
  MessageSquareIcon,
  MicIcon,
  MicOffIcon,
  MonitorUpIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PhoneOffIcon,
  PinIcon,
  SendIcon,
  ShieldIcon,
  SmileIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  VideoIcon,
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
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STAGE PAINT CONSTANTS =============
// The stage is "meeting glass": literal dark colors locked with
// colorScheme:'dark' so tiles look identical in light mode.

const STAGE_BG = '#0B0F1E';
const TILE_OFF_BG = '#171D33';
const TILE_TEXT = '#EEF1FA';
const TILE_CHIP_BG = 'rgba(7, 10, 22, 0.72)';
const SPEAKING_GLOW = '#3DDC85';
const MUTED_MIC = '#F26D6D';
const SHARE_FRAME_BG =
  'linear-gradient(160deg, #1B2440 0%, #131A31 55%, #0D1226 100%)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Stage column: tiles scroll, the control bar stays fixed at the bottom.
  stageColumn: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    colorScheme: 'dark',
    backgroundColor: STAGE_BG,
    color: TILE_TEXT,
  },
  stageScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  // Grid view: auto-fill keeps tiles wrapping instead of overflowing.
  tileGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  tileGridCompact: {
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
  },
  // One participant tile: gradient "video" or flat camera-off slate.
  tile: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSpeaking: {
    boxShadow: `0 0 0 3px ${SPEAKING_GLOW}, 0 0 18px rgba(61, 220, 133, 0.45)`,
  },
  // Speaker view: featured tile keeps 16:9 but caps height so the
  // filmstrip and control bar stay on screen.
  featuredTile: {
    maxHeight: 'min(58vh, 520px)',
    margin: '0 auto',
    width: '100%',
    maxWidth: 920,
  },
  filmstrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  filmTile: {
    flex: '0 0 160px',
  },
  // Bottom-left name chip and top overlays share the dark pill treatment.
  // The tile menu lives top-right, so the chip only needs its own edge
  // inset — no 56px menu reservation — before ellipsizing.
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
    maxWidth: 'calc(100% - 56px)',
  },
  // The tile menu is always visible (never hover-revealed) so it works on
  // touch; the chip background keeps it legible over any gradient.
  tileTopRight: {
    position: 'absolute',
    top: 'var(--spacing-1-5)',
    right: 'var(--spacing-1-5)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: TILE_CHIP_BG,
  },
  handQueueBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 999,
    backgroundColor: '#B7791F',
    fontSize: 11,
    fontWeight: 700,
  },
  // Screen-share tile body: a mocked document frame, no real content.
  shareCanvas: {
    position: 'absolute',
    inset: 0,
    background: SHARE_FRAME_BG,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    // Extra bottom padding keeps the centered mock lines clear of the
    // bottom-left presenter chip in short grid tiles.
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-6)',
    textAlign: 'center',
  },
  shareLines: {
    width: '56%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  shareLine: {
    height: 6,
    borderRadius: 3,
    background: 'rgba(123, 168, 255, 0.4)',
  },
  // Control bar: fixed dark chrome under the tiles; wraps at <=640px.
  controlBar: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // <=640px: controls grow to 40px tap targets, keeping `sm` type scale.
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Panel plumbing: TabList fixed on top, tab body scrolls, composer fixed.
  panelRoot: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelTabs: {
    padding: 'var(--spacing-2) var(--spacing-3) 0',
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  composer: {
    padding: 'var(--spacing-2) var(--spacing-3) var(--spacing-3)',
  },
  chatRow: {
    padding: '4px 0',
  },
  chatText: {
    overflowWrap: 'anywhere',
  },
  // Breakout room drop zones: dashed border brightens while dragging over.
  roomZone: {
    borderRadius: 'var(--radius-container)',
    border: '1.5px dashed var(--color-border)',
    padding: 'var(--spacing-2)',
    transition: 'border-color 120ms ease, background-color 120ms ease',
  },
  roomZoneActive: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  roomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '4px var(--spacing-1)',
    borderRadius: 'var(--radius-element)',
    cursor: 'grab',
  },
  // <=1024px: the rail becomes a fixed-height card below the stage.
  stackedPanel: {height: 460, display: 'flex', flexDirection: 'column'},
  leaveWrap: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-6)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed states, no clocks, no randomness, no
// network assets. The elapsed chip and chat times are fixture strings.

const MEETING_TITLE = 'Q3 Launch Sync';
const ELAPSED = '00:24:13';
const INVITE_LINK = 'meet.example/q3-launch-sync';
const SHARE_DOC = 'Q3 Launch Plan — deck.pdf';
const SCREEN_TILE_ID = 'screen';
const SPEAKER_INTERVAL_MS = 4000;

type Role = 'host' | 'you' | 'guest';

interface Participant {
  id: string;
  name: string;
  role: Role;
  muted: boolean;
  cameraOn: boolean;
  /** Fixed per-person tile gradient, shown when the camera is "on". */
  gradient: string;
}

// 9 participants with mixed mute/camera states; Priya owns the share tile.
const PARTICIPANTS_FIXTURE: Participant[] = [
  {
    id: 'mira',
    name: 'Mira Chen',
    role: 'host',
    muted: false,
    cameraOn: true,
    gradient: 'linear-gradient(140deg, #2E4D8F 0%, #1B2C55 100%)',
  },
  {
    id: 'you',
    name: 'Riley Quinn',
    role: 'you',
    muted: false,
    cameraOn: true,
    gradient: 'linear-gradient(140deg, #35618A 0%, #1D3A57 100%)',
  },
  {
    id: 'priya',
    name: 'Priya Raman',
    role: 'guest',
    muted: false,
    cameraOn: false,
    gradient: 'linear-gradient(140deg, #6A3FA0 0%, #3A2260 100%)',
  },
  {
    id: 'devon',
    name: 'Devon Park',
    role: 'guest',
    muted: true,
    cameraOn: true,
    gradient: 'linear-gradient(140deg, #2F7D5B 0%, #1B4736 100%)',
  },
  {
    id: 'sasha',
    name: 'Sasha Ortiz',
    role: 'guest',
    muted: false,
    cameraOn: false,
    gradient: 'linear-gradient(140deg, #8A5A2E 0%, #533619 100%)',
  },
  {
    id: 'jonah',
    name: 'Jonah Ellis',
    role: 'guest',
    muted: true,
    cameraOn: false,
    gradient: 'linear-gradient(140deg, #7D2F49 0%, #471B2B 100%)',
  },
  {
    id: 'tamar',
    name: 'Tamar Cohen',
    role: 'guest',
    muted: false,
    cameraOn: true,
    gradient: 'linear-gradient(140deg, #2F6E7D 0%, #1B4047 100%)',
  },
  {
    id: 'felix',
    name: 'Felix Osei',
    role: 'guest',
    muted: true,
    cameraOn: true,
    gradient: 'linear-gradient(140deg, #5C4FA8 0%, #322A62 100%)',
  },
  {
    id: 'ana',
    name: 'Ana Duarte',
    role: 'guest',
    muted: false,
    cameraOn: false,
    gradient: 'linear-gradient(140deg, #A04F3F 0%, #5E2B21 100%)',
  },
];

// Jonah raised first, then Tamar — queue order is raise order.
const RAISED_HANDS_FIXTURE = ['jonah', 'tamar'];

interface CallChatMessage {
  id: string;
  authorId: string;
  time: string;
  text: string;
}

const CHAT_FIXTURE: CallChatMessage[] = [
  {id: 'c1', authorId: 'mira', time: '10:02', text: 'Welcome everyone — agenda is launch readiness, then open questions.'},
  {id: 'c2', authorId: 'devon', time: '10:03', text: 'Joining from the train, staying muted.'},
  {id: 'c3', authorId: 'priya', time: '10:05', text: 'Sharing the launch deck now, shout if it is not visible.'},
  {id: 'c4', authorId: 'tamar', time: '10:05', text: 'Visible here.'},
  {id: 'c5', authorId: 'sasha', time: '10:08', text: 'Slide 4 numbers are from the Friday snapshot, right?'},
  {id: 'c6', authorId: 'priya', time: '10:09', text: 'Correct — refreshed Friday 6pm.'},
  {id: 'c7', authorId: 'felix', time: '10:12', text: 'Can we get the deck link in chat after?'},
  {id: 'c8', authorId: 'mira', time: '10:12', text: 'Yes, I will drop it with the notes.'},
  {id: 'c9', authorId: 'ana', time: '10:15', text: 'Breakouts after this section? I have a GTM question.'},
  {id: 'c10', authorId: 'mira', time: '10:16', text: 'Yes — rooms open after Priya wraps up.'},
];

interface BreakoutRoom {
  id: string;
  name: string;
}

const ROOMS: BreakoutRoom[] = [
  {id: 'room-1', name: 'Room 1 · Design'},
  {id: 'room-2', name: 'Room 2 · Engineering'},
  {id: 'room-3', name: 'Room 3 · GTM'},
];

// null = unassigned pool. Seed a partial assignment so counts differ.
const ASSIGNMENT_FIXTURE: Record<string, string | null> = {
  mira: null,
  you: null,
  priya: 'room-3',
  devon: 'room-2',
  sasha: 'room-1',
  jonah: 'room-2',
  tamar: 'room-1',
  felix: null,
  ana: null,
};

type ViewMode = 'grid' | 'speaker';
type PanelTab = 'chat' | 'people' | 'rooms';

// ============= HELPERS =============
// Small derivations over fixture arrays — no engines, no parsers.

function findParticipant(participants: Participant[], id: string): Participant {
  return participants.find(participant => participant.id === id) ?? participants[0];
}

/** Unmuted non-self participants, in fixture order — the speaker cycle. */
function eligibleSpeakers(participants: Participant[]): Participant[] {
  return participants.filter(
    participant => !participant.muted && participant.id !== 'you',
  );
}

/** 1-based queue position for a raised hand, or null. */
function handPosition(raisedHands: string[], id: string): number | null {
  const index = raisedHands.indexOf(id);
  return index === -1 ? null : index + 1;
}

function roomMembers(
  assignment: Record<string, string | null>,
  participants: Participant[],
  roomId: string | null,
): Participant[] {
  return participants.filter(
    participant => (assignment[participant.id] ?? null) === roomId,
  );
}

// ============= TILES =============

interface TileActions {
  onTogglePin: (id: string) => void;
  onToggleSpotlight: (id: string) => void;
  onToggleMute: (id: string) => void;
}

/**
 * One participant tile: gradient "video" (or camera-off slate + Avatar),
 * speaking-glow ring, bottom name chip with mic state, top-left status
 * badges (pin / spotlight / numbered hand), and an always-visible MoreMenu
 * with Pin, Spotlight, and — for others — host Mute. No hover-only
 * affordances anywhere on the tile.
 */
function ParticipantTile({
  participant,
  isSpeaking,
  isPinned,
  isSpotlit,
  handIndex,
  actions,
  variant = 'grid',
}: {
  participant: Participant;
  isSpeaking: boolean;
  isPinned: boolean;
  isSpotlit: boolean;
  handIndex: number | null;
  actions: TileActions;
  variant?: 'grid' | 'featured' | 'film';
}) {
  const isSelf = participant.id === 'you';
  const tileStyle: CSSProperties = {
    ...styles.tile,
    ...(variant === 'featured' ? styles.featuredTile : undefined),
    background: participant.cameraOn ? participant.gradient : TILE_OFF_BG,
    ...(isSpeaking ? styles.tileSpeaking : undefined),
  };

  const menuItems = [
    {
      label: isPinned ? 'Unpin' : 'Pin for me',
      icon: <Icon icon={PinIcon} size="sm" color="inherit" />,
      onClick: () => actions.onTogglePin(participant.id),
    },
    {
      label: isSpotlit ? 'Remove spotlight' : 'Spotlight for everyone',
      icon: <Icon icon={SparklesIcon} size="sm" color="inherit" />,
      onClick: () => actions.onToggleSpotlight(participant.id),
    },
    ...(isSelf
      ? []
      : [
          {
            label: participant.muted ? 'Ask to unmute' : 'Mute participant',
            icon: (
              <Icon
                icon={participant.muted ? MicIcon : MicOffIcon}
                size="sm"
                color="inherit"
              />
            ),
            onClick: () => actions.onToggleMute(participant.id),
          },
        ]),
  ];

  const wrapped =
    variant === 'film' ? (
      <div style={styles.filmTile}>
        <div style={tileStyle}>
          <TileBody
            participant={participant}
            isPinned={isPinned}
            isSpotlit={isSpotlit}
            handIndex={handIndex}
            menuItems={menuItems}
            compactChrome
          />
        </div>
      </div>
    ) : (
      <div style={tileStyle}>
        <TileBody
          participant={participant}
          isPinned={isPinned}
          isSpotlit={isSpotlit}
          handIndex={handIndex}
          menuItems={menuItems}
          compactChrome={false}
        />
      </div>
    );

  return wrapped;
}

/** Shared tile chrome: avatar, badges, name chip, and the tile menu. */
function TileBody({
  participant,
  isPinned,
  isSpotlit,
  handIndex,
  menuItems,
  compactChrome,
}: {
  participant: Participant;
  isPinned: boolean;
  isSpotlit: boolean;
  handIndex: number | null;
  menuItems: Array<{label: string; icon: React.ReactNode; onClick: () => void}>;
  compactChrome: boolean;
}) {
  const isSelf = participant.id === 'you';
  return (
    <>
      <Avatar name={participant.name} size={compactChrome ? 'small' : 'medium'} />

      {!compactChrome && (
        <div style={styles.tileTopLeft}>
          {isPinned && (
            <Token
              label="Pinned"
              size="sm"
              icon={<Icon icon={PinIcon} size="xsm" color="inherit" />}
            />
          )}
          {isSpotlit && (
            <Token
              label="Spotlight"
              size="sm"
              color="purple"
              icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
            />
          )}
          {handIndex != null && (
            <span style={styles.handQueueBadge}>
              <Icon icon={HandIcon} size="xsm" color="inherit" />
              {`#${handIndex}`}
            </span>
          )}
        </div>
      )}

      <div style={styles.tileTopRight}>
        <MoreMenu
          label={`Actions for ${participant.name}`}
          variant="ghost"
          size="sm"
          items={menuItems}
        />
      </div>

      <div style={styles.nameChip}>
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
          {isSelf ? `${participant.name} (you)` : participant.name}
        </span>
        {participant.role === 'host' && (
          <Tooltip content="Meeting host">
            <Icon icon={ShieldIcon} size="xsm" color="inherit" />
          </Tooltip>
        )}
      </div>
    </>
  );
}

/**
 * The screen-share tile: a mocked document frame credited to its owner.
 * Pinnable like any tile so it can take the speaker-view stage.
 */
function ScreenShareTile({
  ownerName,
  isPinned,
  onTogglePin,
  variant = 'grid',
}: {
  ownerName: string;
  isPinned: boolean;
  onTogglePin: () => void;
  variant?: 'grid' | 'featured' | 'film';
}) {
  const tileStyle: CSSProperties = {
    ...styles.tile,
    ...(variant === 'featured' ? styles.featuredTile : undefined),
  };
  const body = (
    <div style={tileStyle}>
      <div style={styles.shareCanvas}>
        <Icon icon={MonitorUpIcon} size="lg" color="secondary" />
        <div style={styles.shareLines} aria-hidden>
          <div style={{...styles.shareLine, width: '100%'}} />
          <div style={{...styles.shareLine, width: '78%'}} />
          <div style={{...styles.shareLine, width: '88%'}} />
          <div style={{...styles.shareLine, width: '52%'}} />
        </div>
      </div>
      {variant !== 'film' && (
        <div style={styles.tileTopLeft}>
          <Token
            label="Presenting"
            size="sm"
            color="blue"
            icon={<Icon icon={MonitorUpIcon} size="xsm" color="inherit" />}
          />
          {isPinned && (
            <Token
              label="Pinned"
              size="sm"
              icon={<Icon icon={PinIcon} size="xsm" color="inherit" />}
            />
          )}
        </div>
      )}
      <div style={styles.tileTopRight}>
        <MoreMenu
          label="Screen share actions"
          variant="ghost"
          size="sm"
          items={[
            {
              label: isPinned ? 'Unpin' : 'Pin for me',
              icon: <Icon icon={PinIcon} size="sm" color="inherit" />,
              onClick: onTogglePin,
            },
          ]}
        />
      </div>
      <div style={styles.nameChip}>
        <Icon icon={MonitorUpIcon} size="xsm" color="inherit" />
        <span style={styles.nameChipText}>
          {ownerName} is presenting · {SHARE_DOC}
        </span>
      </div>
    </div>
  );
  return variant === 'film' ? <div style={styles.filmTile}>{body}</div> : body;
}

// ============= PANEL TABS =============

/** Chat tab: seeded transcript rows plus a working composer. */
function ChatTab({
  participants,
  messages,
  draft,
  onDraftChange,
  onSend,
}: {
  participants: Participant[];
  messages: CallChatMessage[];
  draft: string;
  onDraftChange: (draft: string) => void;
  onSend: () => void;
}) {
  return (
    <>
      <div style={styles.panelScroll} aria-label="Meeting chat messages">
        <VStack gap={0.5}>
          {messages.map(message => {
            const author = findParticipant(participants, message.authorId);
            const isSelf = message.authorId === 'you';
            return (
              <div key={message.id} style={styles.chatRow}>
                <HStack gap={2} vAlign="start">
                  <Avatar name={author.name} size="xsmall" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <HStack gap={1} vAlign="center">
                        <Text type="label" size="sm">
                          {isSelf ? 'You' : author.name}
                        </Text>
                        <Text
                          type="supporting"
                          size="xsm"
                          color="secondary"
                          hasTabularNumbers>
                          {message.time}
                        </Text>
                      </HStack>
                      <Text type="supporting" style={styles.chatText}>
                        {message.text}
                      </Text>
                    </VStack>
                  </StackItem>
                </HStack>
              </div>
            );
          })}
        </VStack>
      </div>
      <Divider />
      <div style={styles.composer}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="Message everyone"
              isLabelHidden
              value={draft}
              onChange={onDraftChange}
              onEnter={onSend}
              placeholder="Message everyone"
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
            isDisabled={draft.trim().length === 0}
            onClick={onSend}
          />
        </HStack>
      </div>
    </>
  );
}

/**
 * Participants tab: the numbered raise queue on top (raise order), a host
 * Mute all action, then the roster with per-row mute toggles that flip the
 * same state the tiles read.
 */
function PeopleTab({
  participants,
  raisedHands,
  onToggleMute,
  onLowerHand,
  onMuteAll,
  isCompact,
}: {
  participants: Participant[];
  raisedHands: string[];
  onToggleMute: (id: string) => void;
  onLowerHand: (id: string) => void;
  onMuteAll: () => void;
  isCompact: boolean;
}) {
  const anyOtherUnmuted = participants.some(
    participant => participant.id !== 'you' && !participant.muted,
  );
  return (
    <div style={styles.panelScroll}>
      <VStack gap={3}>
        {raisedHands.length > 0 && (
          <List
            density="compact"
            hasDividers={false}
            header={
              <Text type="label" size="sm" color="secondary">
                Raised hands · {raisedHands.length}
              </Text>
            }>
            {raisedHands.map((id, index) => {
              const participant = findParticipant(participants, id);
              return (
                <ListItem
                  key={id}
                  label={
                    id === 'you' ? `${participant.name} (you)` : participant.name
                  }
                  startContent={
                    <Badge label={`#${index + 1}`} variant="warning" />
                  }
                  endContent={
                    <IconButton
                      label={`Lower ${participant.name}'s hand`}
                      tooltip="Lower hand"
                      icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => onLowerHand(id)}
                      style={isCompact ? styles.controlTouch : undefined}
                    />
                  }
                />
              );
            })}
          </List>
        )}

        <Button
          label="Mute all"
          variant="secondary"
          icon={<Icon icon={MicOffIcon} size="sm" color="inherit" />}
          isDisabled={!anyOtherUnmuted}
          onClick={onMuteAll}
          style={isCompact ? styles.controlTouchWide : undefined}
        />

        <List
          density="compact"
          hasDividers={false}
          header={
            <Text type="label" size="sm" color="secondary">
              In this call · {participants.length}
            </Text>
          }>
          {participants.map(participant => {
            const position = handPosition(raisedHands, participant.id);
            const isSelf = participant.id === 'you';
            return (
              <ListItem
                key={participant.id}
                label={isSelf ? `${participant.name} (you)` : participant.name}
                description={
                  participant.role === 'host' ? 'Host' : undefined
                }
                startContent={
                  <Avatar name={participant.name} size="xsmall" />
                }
                endContent={
                  <HStack gap={1} vAlign="center">
                    {position != null && (
                      <Badge label={`#${position}`} variant="warning" />
                    )}
                    <Icon
                      icon={participant.cameraOn ? VideoIcon : VideoOffIcon}
                      size="sm"
                      color={participant.cameraOn ? 'secondary' : 'disabled'}
                    />
                    <IconButton
                      label={
                        participant.muted
                          ? `Ask ${participant.name} to unmute`
                          : `Mute ${participant.name}`
                      }
                      tooltip={participant.muted ? 'Ask to unmute' : 'Mute'}
                      icon={
                        <Icon
                          icon={participant.muted ? MicOffIcon : MicIcon}
                          size="sm"
                          color={participant.muted ? 'error' : 'inherit'}
                        />
                      }
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleMute(participant.id)}
                      style={isCompact ? styles.controlTouch : undefined}
                    />
                  </HStack>
                }
              />
            );
          })}
        </List>
      </VStack>
    </div>
  );
}

/**
 * Breakout tab: an unassigned pool plus three room drop zones. Rows drag
 * between zones (HTML5 drag) and every row also has a Move-to MoreMenu so
 * assignment never requires drag — counts update live from the map.
 */
function RoomsTab({
  participants,
  assignment,
  onMove,
}: {
  participants: Participant[];
  assignment: Record<string, string | null>;
  onMove: (participantId: string, roomId: string | null) => void;
}) {
  const [dragOverZone, setDragOverZone] = useState<string | 'pool' | null>(null);

  const zoneProps = (zoneId: string | null) => ({
    onDragOver: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setDragOverZone(zoneId ?? 'pool');
    },
    onDragLeave: () => setDragOverZone(null),
    onDrop: (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const participantId = event.dataTransfer.getData('text/plain');
      if (participantId.length > 0) {
        onMove(participantId, zoneId);
      }
      setDragOverZone(null);
    },
  });

  const renderRow = (participant: Participant, currentRoom: string | null) => (
    <div
      key={participant.id}
      style={styles.roomRow}
      draggable
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', participant.id);
        event.dataTransfer.effectAllowed = 'move';
      }}>
      <Icon icon={GripVerticalIcon} size="sm" color="disabled" />
      <Avatar name={participant.name} size="xsmall" />
      <StackItem size="fill">
        <Text type="supporting">
          {participant.id === 'you'
            ? `${participant.name} (you)`
            : participant.name}
        </Text>
      </StackItem>
      <MoreMenu
        label={`Move ${participant.name}`}
        variant="ghost"
        size="sm"
        items={[
          ...ROOMS.map(room => ({
            label: `Move to ${room.name}`,
            icon:
              currentRoom === room.id ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : (
                <Icon icon={DoorOpenIcon} size="sm" color="inherit" />
              ),
            isDisabled: currentRoom === room.id,
            onClick: () => onMove(participant.id, room.id),
          })),
          {
            label: 'Return to unassigned',
            icon: <Icon icon={UsersIcon} size="sm" color="inherit" />,
            isDisabled: currentRoom === null,
            onClick: () => onMove(participant.id, null),
          },
        ]}
      />
    </div>
  );

  const renderZone = (roomId: string | null, title: string) => {
    const members = roomMembers(assignment, participants, roomId);
    const zoneKey = roomId ?? 'pool';
    return (
      <Card key={zoneKey} padding={0}>
        <div
          style={{
            ...styles.roomZone,
            ...(dragOverZone === zoneKey ? styles.roomZoneActive : undefined),
          }}
          {...zoneProps(roomId)}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <Icon
                icon={roomId == null ? UsersIcon : DoorOpenIcon}
                size="sm"
                color="secondary"
              />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  {title}
                </Text>
              </StackItem>
              <Badge label={String(members.length)} variant="neutral" />
            </HStack>
            {members.length === 0 ? (
              <Text type="supporting" size="xsm" color="secondary">
                Drop participants here
              </Text>
            ) : (
              <VStack gap={0}>
                {members.map(member => renderRow(member, roomId))}
              </VStack>
            )}
          </VStack>
        </div>
      </Card>
    );
  };

  return (
    <div style={styles.panelScroll}>
      <VStack gap={2}>
        <Text type="supporting" size="xsm" color="secondary">
          Drag people between rooms, or use each row's move menu.
        </Text>
        {renderZone(null, 'Unassigned')}
        {ROOMS.map(room => renderZone(room.id, room.name))}
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function VideoCallLayoutTemplate() {
  const [participants, setParticipants] = useState(PARTICIPANTS_FIXTURE);
  const [view, setView] = useState<ViewMode>('grid');
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [spotlightId, setSpotlightId] = useState<string | null>(null);
  const [raisedHands, setRaisedHands] = useState(RAISED_HANDS_FIXTURE);
  const [speakerTick, setSpeakerTick] = useState(0);
  const [messages, setMessages] = useState(CHAT_FIXTURE);
  const [chatDraft, setChatDraft] = useState('');
  const [assignment, setAssignment] = useState(ASSIGNMENT_FIXTURE);
  const [tab, setTab] = useState<PanelTab>('chat');
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [hasLeft, setHasLeft] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // Responsive contract: <=1024px the rail stacks below the stage;
  // <=640px controls take the 40px tap-target override and the bar wraps.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // The active-speaker glow rotates through unmuted participants on a
  // fixed interval. Pinning pauses rotation; leaving stops it.
  const cycle = eligibleSpeakers(participants);
  const activeSpeakerId =
    cycle.length === 0 ? null : cycle[speakerTick % cycle.length].id;

  useEffect(() => {
    if (pinnedId != null || hasLeft) {
      return undefined;
    }
    const timer = setInterval(() => {
      setSpeakerTick(prev => prev + 1);
    }, SPEAKER_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [pinnedId, hasLeft]);

  const you = findParticipant(participants, 'you');
  const sharer = findParticipant(participants, 'priya');

  // Speaker view features pinned > spotlit > active speaker > the share.
  const featuredId =
    pinnedId ?? spotlightId ?? activeSpeakerId ?? SCREEN_TILE_ID;

  const setParticipantMuted = (id: string, muted: boolean) => {
    setParticipants(prev =>
      prev.map(participant =>
        participant.id === id ? {...participant, muted} : participant,
      ),
    );
  };

  const toggleMute = (id: string) => {
    const participant = findParticipant(participants, id);
    setParticipantMuted(id, !participant.muted);
  };

  const toggleSelfCamera = () => {
    setParticipants(prev =>
      prev.map(participant =>
        participant.id === 'you'
          ? {...participant, cameraOn: !participant.cameraOn}
          : participant,
      ),
    );
  };

  const muteAll = () => {
    setParticipants(prev =>
      prev.map(participant =>
        participant.id === 'you' ? participant : {...participant, muted: true},
      ),
    );
  };

  const toggleHand = () => {
    setRaisedHands(prev =>
      prev.includes('you') ? prev.filter(id => id !== 'you') : [...prev, 'you'],
    );
  };

  const lowerHand = (id: string) => {
    setRaisedHands(prev => prev.filter(raised => raised !== id));
  };

  const togglePin = (id: string) => {
    setPinnedId(prev => (prev === id ? null : id));
  };

  const toggleSpotlight = (id: string) => {
    setSpotlightId(prev => (prev === id ? null : id));
  };

  const sendChat = () => {
    const text = chatDraft.trim();
    if (text.length === 0) {
      return;
    }
    setMessages(prev => [
      ...prev,
      {id: `you-${prev.length + 1}`, authorId: 'you', time: '10:24', text},
    ]);
    setChatDraft('');
  };

  const moveToRoom = (participantId: string, roomId: string | null) => {
    setAssignment(prev => ({...prev, [participantId]: roomId}));
  };

  const tileActions: TileActions = {
    onTogglePin: togglePin,
    onToggleSpotlight: toggleSpotlight,
    onToggleMute: toggleMute,
  };

  const yourHandIndex = handPosition(raisedHands, 'you');
  const touch = isCompact ? styles.controlTouch : undefined;
  const wideTouch = isCompact ? styles.controlTouchWide : undefined;

  const renderTile = (
    participant: Participant,
    variant: 'grid' | 'featured' | 'film',
  ) => (
    <ParticipantTile
      key={participant.id}
      participant={participant}
      isSpeaking={participant.id === activeSpeakerId}
      isPinned={pinnedId === participant.id}
      isSpotlit={spotlightId === participant.id}
      handIndex={handPosition(raisedHands, participant.id)}
      actions={tileActions}
      variant={variant}
    />
  );

  const screenTile = (variant: 'grid' | 'featured' | 'film') => (
    <ScreenShareTile
      key={SCREEN_TILE_ID}
      ownerName={sharer.name}
      isPinned={pinnedId === SCREEN_TILE_ID}
      onTogglePin={() => togglePin(SCREEN_TILE_ID)}
      variant={variant}
    />
  );

  const gridView = (
    <div
      style={{
        ...styles.tileGrid,
        ...(isCompact ? styles.tileGridCompact : undefined),
      }}>
      {screenTile('grid')}
      {participants.map(participant => renderTile(participant, 'grid'))}
    </div>
  );

  const speakerView = (
    <VStack gap={3}>
      {featuredId === SCREEN_TILE_ID
        ? screenTile('featured')
        : renderTile(findParticipant(participants, featuredId), 'featured')}
      <div style={styles.filmstrip}>
        {featuredId !== SCREEN_TILE_ID && screenTile('film')}
        {participants
          .filter(participant => participant.id !== featuredId)
          .map(participant => renderTile(participant, 'film'))}
      </div>
    </VStack>
  );

  const controlBar = (
    <div style={styles.controlBar}>
      <ToggleButton
        label={you.muted ? 'Unmute' : 'Mute'}
        size="sm"
        icon={
          <Icon icon={you.muted ? MicOffIcon : MicIcon} size="sm" color="inherit" />
        }
        isPressed={you.muted}
        onPressedChange={() => toggleMute('you')}
        tooltip={you.muted ? 'Unmute microphone' : 'Mute microphone'}
        style={wideTouch}
      />
      <ToggleButton
        label={you.cameraOn ? 'Camera' : 'Camera off'}
        size="sm"
        icon={
          <Icon
            icon={you.cameraOn ? VideoIcon : VideoOffIcon}
            size="sm"
            color="inherit"
          />
        }
        isPressed={!you.cameraOn}
        onPressedChange={toggleSelfCamera}
        tooltip={you.cameraOn ? 'Turn camera off' : 'Turn camera on'}
        style={wideTouch}
      />
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
        style={wideTouch}
      />
      <SegmentedControl
        label="Stage layout"
        value={view}
        onChange={value => setView(value as ViewMode)}>
        <SegmentedControlItem
          value="grid"
          label="Grid"
          icon={<Icon icon={LayoutGridIcon} size="sm" color="inherit" />}
        />
        <SegmentedControlItem
          value="speaker"
          label="Speaker"
          icon={<Icon icon={GalleryHorizontalIcon} size="sm" color="inherit" />}
        />
      </SegmentedControl>
      <Button
        label="Leave"
        variant="destructive"
        size="sm"
        icon={<Icon icon={PhoneOffIcon} size="sm" color="inherit" />}
        onClick={() => setIsLeaveConfirmOpen(true)}
        style={wideTouch}
      />
    </div>
  );

  const panelBody = (
    <div style={styles.panelRoot}>
      <div style={styles.panelTabs}>
        <TabList value={tab} onChange={value => setTab(value as PanelTab)}>
          <Tab
            value="chat"
            label="Chat"
            icon={<Icon icon={MessageSquareIcon} size="sm" color="inherit" />}
          />
          <Tab
            value="people"
            label={`People (${participants.length})`}
            icon={<Icon icon={UsersIcon} size="sm" color="inherit" />}
          />
          <Tab
            value="rooms"
            label="Breakout"
            icon={<Icon icon={DoorOpenIcon} size="sm" color="inherit" />}
          />
        </TabList>
      </div>
      {tab === 'chat' && (
        <ChatTab
          participants={participants}
          messages={messages}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSend={sendChat}
        />
      )}
      {tab === 'people' && (
        <PeopleTab
          participants={participants}
          raisedHands={raisedHands}
          onToggleMute={toggleMute}
          onLowerHand={lowerHand}
          onMuteAll={muteAll}
          isCompact={isCompact}
        />
      )}
      {tab === 'rooms' && (
        <RoomsTab
          participants={participants}
          assignment={assignment}
          onMove={moveToRoom}
        />
      )}
    </div>
  );

  const stage = hasLeft ? (
    <div style={{...styles.stageColumn, colorScheme: undefined}}>
      <div style={styles.leaveWrap}>
        <EmptyState
          icon={<Icon icon={PhoneOffIcon} size="lg" />}
          title="You left the meeting"
          description="The call is still running. Rejoin to pick up where you left off — your pins, hand queue, and room assignments are kept."
          actions={
            <Button
              label="Rejoin meeting"
              variant="primary"
              onClick={() => setHasLeft(false)}
            />
          }
        />
      </div>
    </div>
  ) : (
    <div style={styles.stageColumn}>
      <div style={styles.stageScroll}>
        <VStack gap={3}>
          {view === 'grid' ? gridView : speakerView}
          {isStacked && isPanelOpen && (
            <Card padding={0} style={styles.stackedPanel}>
              {panelBody}
            </Card>
          )}
        </VStack>
      </div>
      {controlBar}
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>{MEETING_TITLE}</Heading>
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
              </HStack>
            </StackItem>
            {isStacked ? (
              <IconButton
                label={inviteCopied ? 'Invite link copied' : 'Copy invite link'}
                tooltip={inviteCopied ? 'Copied' : `Copy ${INVITE_LINK}`}
                icon={
                  <Icon
                    icon={inviteCopied ? CheckIcon : CopyIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                variant="ghost"
                size="sm"
                onClick={() => setInviteCopied(true)}
                style={isCompact ? styles.controlTouch : undefined}
              />
            ) : (
              <Button
                label={inviteCopied ? 'Copied' : 'Copy invite'}
                variant="secondary"
                size="sm"
                icon={
                  <Icon
                    icon={inviteCopied ? CheckIcon : CopyIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => setInviteCopied(true)}
              />
            )}
            <ToggleButton
              label={isPanelOpen ? 'Hide panel' : 'Show panel'}
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
              tooltip={isPanelOpen ? 'Hide side panel' : 'Show side panel'}
              style={isCompact ? styles.controlTouchWide : undefined}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          {stage}
          <AlertDialog
            isOpen={isLeaveConfirmOpen}
            onOpenChange={setIsLeaveConfirmOpen}
            title="Leave this meeting?"
            description="You can rejoin from the same link while the call is running. Recording continues without you."
            cancelLabel="Stay in call"
            actionLabel="Leave meeting"
            actionVariant="destructive"
            onAction={() => {
              setIsLeaveConfirmOpen(false);
              setHasLeft(true);
            }}
          />
        </LayoutContent>
      }
      end={
        !hasLeft && isPanelOpen && !isStacked ? (
          <LayoutPanel width={340} padding={0} label="Meeting panel">
            {panelBody}
          </LayoutPanel>
        ) : undefined
      }
    />
  );
}
