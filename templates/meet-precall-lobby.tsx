// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (the Kestrel Labs 'Atlas Q3 · Launch
 *   Readiness Review' meeting on Thu Jul 16 2026 10:30–11:15 PT organized by
 *   Priya Raman with 12 invitees and 3 already in the call; Marcus Webb as
 *   'you'; fixed mic/speaker/camera device lists; a seeded 14-step mic level
 *   pattern stepped on a plain setInterval — no clocks, no Math.random, no
 *   getUserMedia, no <video>; the self-view is a CSS silhouette)
 * @output Meeting pre-call lobby (pre-join greenroom): a large scheme-locked
 *   dark camera-preview stage with a self-view silhouette placeholder,
 *   mirror toggle, mute/camera overlays, and a level-reactive mic indicator;
 *   a device selector row (mic / speaker / camera Selectors, a segmented
 *   live input-level meter, noise-suppression and low-light Switches); a
 *   background-effects gallery (None / blur / room-gradient tiles with an
 *   inset selected ring) that repaints the preview; a right meeting-info
 *   panel (title, time, location, AvatarGroup facepile with +N overflow,
 *   organizer, already-in roster, copyable invite link) over Join now /
 *   Present instead / Companion-mode actions; and a pre-call health-check
 *   footer strip with network / camera / mic / speaker status pills and a
 *   speaker-test button
 * @position Page template; emitted by `astryx template meet-precall-lobby`
 *
 * Frame: root div 100dvh so Layout height="fill" cannot collapse in the
 * demo's auto-height stage. LayoutHeader (56px chrome) carries the Kestrel
 * Meet brand, invite-link Token, and your Avatar. LayoutContent hosts the
 * greenroom column (preview stage max 880px, device row, effects gallery)
 * scrolling as one unit. LayoutPanel end 360 hosts the meeting-info + join
 * column; only the panel body scrolls. LayoutFooter is the health-check
 * strip (StatusDot pills + speaker test), pinned at every width.
 *
 * Responsive contract:
 * - >1024px: header | greenroom column + 360px end panel | footer strip.
 * - <=1024px: the panel drops below the greenroom column as a Card inside
 *   the single scrolling column; the header hides the invite-link Token
 *   (copy stays as an IconButton).
 * - <=640px: the device row stacks (Selectors full-width), the effects
 *   gallery becomes a deliberate horizontal scroller, stage overlay
 *   controls grow to 40px tap targets, and footer pills wrap.
 *
 * Container policy (greenroom archetype): frame-first rows and panels; the
 * only Cards are the meeting-info summary widget and its <=1024px stacked
 * variant. Everything else is rows on the body surface.
 *
 * Color policy: the preview stage is a deliberately scheme-locked dark
 * surface — colorScheme: 'dark' plus literal hex/rgba paint (STAGE_BG, room
 * gradients, silhouette fills, chip scrims, level green, muted red) so
 * "camera glass" reads identically under the Light/Dark toggle; the effect
 * thumbnails reuse the same literals because they preview that surface.
 * Everything else is token-pure and theme-adaptive.
 */

import {useEffect, useState, type CSSProperties} from 'react';

import {
  ActivityIcon,
  CalendarClockIcon,
  CheckIcon,
  CopyIcon,
  FlipHorizontal2Icon,
  GaugeIcon,
  ImageOffIcon,
  LinkIcon,
  MapPinIcon,
  MicIcon,
  MicOffIcon,
  MonitorUpIcon,
  RepeatIcon,
  ShieldIcon,
  SmartphoneIcon,
  SparklesIcon,
  SpeakerIcon,
  UsersIcon,
  VideoIcon,
  VideoOffIcon,
  Volume2Icon,
  WifiIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STAGE PAINT CONSTANTS =============
// The preview stage is "camera glass": literal dark paint locked with
// colorScheme:'dark' so the self-view looks identical in light mode.

const STAGE_BG = '#0C101F';
const STAGE_TEXT = '#EDF1FB';
const STAGE_TEXT_DIM = 'rgba(226, 232, 240, 0.72)';
const CHIP_SCRIM = 'rgba(7, 10, 22, 0.74)';
const LEVEL_GREEN = '#3DDC85';
const MUTED_RED = '#F26D6D';
const SILHOUETTE_FILL = '#232C49';
const SILHOUETTE_EDGE = 'rgba(122, 143, 199, 0.35)';
const CAMERA_OFF_BG = '#161C31';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Layout height="fill" collapses in the demo stage — root pins 100dvh.
  root: {height: '100dvh', width: '100%'},
  // Greenroom column: one scroll surface for stage + devices + effects.
  greenroomScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  greenroomInner: {
    maxWidth: 880,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // ---- Preview stage (scheme-locked dark camera glass) ----
  stage: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    colorScheme: 'dark',
    backgroundColor: STAGE_BG,
    color: STAGE_TEXT,
    boxShadow: 'var(--shadow-low)',
  },
  // Room paint sits under the silhouette so blur softens the room, not you.
  stageBackdrop: {
    position: 'absolute',
    inset: 0,
    transition: 'filter 200ms ease',
  },
  // Faux room detail (window panes / shelves) gives blur something to soften.
  roomWindow: {
    position: 'absolute',
    top: '12%',
    width: '18%',
    height: '38%',
    borderRadius: 6,
    background:
      'linear-gradient(180deg, rgba(148, 179, 235, 0.28) 0%, rgba(96, 125, 189, 0.16) 100%)',
    border: '1px solid rgba(148, 179, 235, 0.22)',
  },
  roomShelf: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    background: 'rgba(148, 179, 235, 0.20)',
  },
  // Silhouette placeholder: head + shoulders divs, no images.
  silhouetteWrap: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '34%',
    height: '62%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  silhouetteMirrored: {transform: 'translateX(-50%) scaleX(-1)'},
  silhouetteHead: {
    width: '38%',
    aspectRatio: '1 / 1.14',
    borderRadius: '50% 50% 46% 46%',
    background: `linear-gradient(160deg, ${SILHOUETTE_FILL} 30%, #1A2138 100%)`,
    boxShadow: `0 0 0 1px ${SILHOUETTE_EDGE}, 0 0 34px rgba(10, 14, 30, 0.6)`,
    marginBottom: '-6%',
    zIndex: 1,
  },
  silhouetteBody: {
    width: '100%',
    height: '52%',
    borderRadius: '48% 48% 0 0 / 88% 88% 0 0',
    background: `linear-gradient(180deg, ${SILHOUETTE_FILL} 0%, #171E36 78%)`,
    boxShadow: `0 0 0 1px ${SILHOUETTE_EDGE}`,
  },
  // Camera-off slate replaces the whole scene.
  cameraOffSlate: {
    position: 'absolute',
    inset: 0,
    backgroundColor: CAMERA_OFF_BG,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
  },
  // Stage chrome: chips share the dark pill scrim treatment.
  stageTopLeft: {
    position: 'absolute',
    top: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexWrap: 'wrap',
    maxWidth: 'calc(100% - 64px)',
  },
  stageTopRight: {
    position: 'absolute',
    top: 'var(--spacing-1-5)',
    right: 'var(--spacing-1-5)',
    display: 'flex',
    gap: 'var(--spacing-1)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: CHIP_SCRIM,
  },
  scrimChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: CHIP_SCRIM,
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  nameChip: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    left: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    backgroundColor: CHIP_SCRIM,
    fontSize: 12,
    maxWidth: 'calc(50% - var(--spacing-2))',
  },
  nameChipText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  // Bottom-center overlay controls: mute / camera on a shared scrim.
  stageControls: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-1)',
    borderRadius: 999,
    backgroundColor: CHIP_SCRIM,
  },
  // Level-reactive mic indicator: a pill of 5 vertical bars, bottom-right.
  micPulsePill: {
    position: 'absolute',
    bottom: 'var(--spacing-2)',
    right: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    borderRadius: 999,
    backgroundColor: CHIP_SCRIM,
  },
  micPulseBars: {display: 'flex', alignItems: 'flex-end', gap: 2, height: 14},
  micPulseBar: {
    width: 3,
    borderRadius: 2,
    transition: 'height 160ms ease, background-color 160ms ease',
  },
  // Joining overlay: dims the stage while "connecting".
  joiningOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(7, 10, 22, 0.78)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    textAlign: 'center',
    padding: 'var(--spacing-4)',
    zIndex: 2,
  },
  // ---- Device row (token-pure) ----
  deviceRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
    alignItems: 'start',
  },
  deviceRowStacked: {gridTemplateColumns: 'minmax(0, 1fr)'},
  // Segmented input-level meter under the mic Selector.
  levelMeter: {display: 'flex', alignItems: 'center', gap: 3, height: 8},
  levelSegment: {
    flex: 1,
    height: 6,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    transition: 'background-color 140ms ease',
  },
  levelSegmentOn: {backgroundColor: 'var(--color-success)'},
  levelSegmentHot: {backgroundColor: 'var(--color-warning)'},
  // ---- Background effects gallery ----
  effectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  // <=640px: a deliberate horizontal scroller (see responsive contract).
  effectsScroller: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  effectTile: {
    position: 'relative',
    aspectRatio: '16 / 10',
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Thumbnails preview the scheme-locked stage, so they lock too.
    colorScheme: 'dark',
    backgroundColor: STAGE_BG,
    color: STAGE_TEXT_DIM,
  },
  effectTileFixed: {flex: '0 0 124px'},
  // Selected ring insets so it never bleeds onto neighbors; rendered as
  // a non-interactive overlay so the ring sits above the scene paint.
  effectRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    pointerEvents: 'none',
    boxShadow:
      'inset 0 0 0 2px var(--color-accent), inset 0 0 0 4px rgba(255, 255, 255, 0.85)',
  },
  effectLabel: {
    position: 'absolute',
    bottom: 4,
    left: 6,
    right: 6,
    fontSize: 11,
    fontWeight: 600,
    color: STAGE_TEXT,
    textShadow: '0 1px 2px rgba(7, 10, 22, 0.8)',
    textAlign: 'start',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  effectCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // The tile is scheme-locked dark, so accent/on-accent both resolve to
    // their dark-branch values — on-accent keeps the check visible on the
    // accent disc under any theme (never literal white).
    color: 'var(--color-on-accent)',
  },
  // Miniature silhouette inside effect thumbnails.
  effectMiniPerson: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '36%',
    height: '52%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  effectMiniHead: {
    width: '40%',
    aspectRatio: '1 / 1.1',
    borderRadius: '50%',
    background: SILHOUETTE_FILL,
    marginBottom: '-8%',
    zIndex: 1,
  },
  effectMiniBody: {
    width: '100%',
    height: '48%',
    borderRadius: '50% 50% 0 0 / 100% 100% 0 0',
    background: SILHOUETTE_FILL,
  },
  // ---- Meeting-info panel (token-pure) ----
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  inCallRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) 0',
  },
  // ---- Health-check footer strip ----
  healthStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  healthPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    whiteSpace: 'nowrap',
  },
  // <=640px tap targets for the stage overlay controls.
  controlTouch: {width: 40, height: 40},
};

// ============= DATA =============
// Deterministic fixtures: Kestrel Labs / Atlas Q3 world, fixed ISO-derived
// display strings only, no clocks, no randomness, no network assets.

const MEETING = {
  program: 'Atlas Q3',
  title: 'Atlas Q3 · Launch Readiness Review',
  // Fixed Q3 2026 slot; strings are fixture text, never Date math.
  when: 'Thu, Jul 16, 2026 · 10:30 – 11:15 AM PT',
  recurrence: 'Weekly on Thursdays',
  location: 'Harbor Room · Kestrel HQ + online',
  organizer: 'Priya Raman',
  organizerRole: 'Program lead',
  inviteLink: 'meet.kestrel.dev/atlas-q3-readiness',
  invitedCount: 12,
};

const YOU = 'Marcus Webb';

// 12 invitees total: facepile shows the first 5, +7 overflow.
const INVITEES = [
  'Priya Raman', 'Marcus Webb', 'Sofia Ortiz', 'Jonah Fields',
  'Dana Whitfield', 'Elena Vasquez', 'Tom Okafor', 'Grace Lin',
  'Noah Bergström', 'Ava Castillo', 'Leo Tran', 'Maya Singh',
];
const FACEPILE_VISIBLE = 5;

// Already in the call before you join — matches the panel count copy.
const ALREADY_IN: Array<{name: string; detail: string}> = [
  {name: 'Priya Raman', detail: 'Organizer · joined 10:26 AM'},
  {name: 'Sofia Ortiz', detail: 'joined 10:27 AM'},
  {name: 'Jonah Fields', detail: 'joined 10:28 AM'},
];

// Device lists: `short` feeds the health pills so the strip always
// agrees with the Selectors.
interface DeviceOption {
  value: string;
  label: string;
  short: string;
}

function device(value: string, label: string, short: string): DeviceOption {
  return {value, label, short};
}

const MIC_DEVICES: DeviceOption[] = [
  device('mac-mic', 'MacBook Pro Microphone (Built-in)', 'Built-in mic'),
  device('airpods-mic', 'AirPods Pro — Marcus', 'AirPods Pro'),
  device('harbor-array', 'Harbor Room Ceiling Array', 'Room array'),
];

const SPEAKER_DEVICES: DeviceOption[] = [
  device('mac-speakers', 'MacBook Pro Speakers (Built-in)', 'Built-in'),
  device('airpods-out', 'AirPods Pro — Marcus', 'AirPods Pro'),
  device('display-speakers', 'Studio Display Speakers', 'Studio Display'),
];

const CAMERA_DEVICES: DeviceOption[] = [
  device('facetime-hd', 'FaceTime HD Camera (Built-in)', 'FaceTime HD'),
  device('opal-c1', 'Opal C1', 'Opal C1'),
  device('display-cam', 'Studio Display Camera', 'Studio Display'),
];

// Fixed network readout — fixture text, not a probe.
const NETWORK_READOUT = 'Good · 42 ms';

// Seeded mic input pattern (0–10) stepped on a plain interval; one value
// drives the stage pulse pill, the row meter, and the mic health pill.
const LEVEL_PATTERN = [3, 5, 7, 6, 4, 6, 8, 5, 3, 4, 7, 9, 6, 4];
const LEVEL_INTERVAL_MS = 280;
const LEVEL_SEGMENTS = 10;

// Background effects: `backdrop` repaints the room layer; blur softens it.
interface BackgroundEffect {
  id: string;
  label: string;
  kind: 'none' | 'blur' | 'scene';
  blurPx?: number;
  backdrop?: string;
}

const DEFAULT_ROOM =
  'linear-gradient(180deg, #1A2036 0%, #141A2E 52%, #10152A 100%)';

const EFFECTS: BackgroundEffect[] = [
  {id: 'none', label: 'None', kind: 'none'},
  {id: 'blur-soft', label: 'Slight blur', kind: 'blur', blurPx: 3},
  {id: 'blur', label: 'Blur', kind: 'blur', blurPx: 7},
  {
    id: 'office',
    label: 'Office',
    kind: 'scene',
    backdrop: 'linear-gradient(180deg, #3A3226 0%, #2B2620 46%, #1E1B16 100%)',
  },
  {
    id: 'harbor',
    label: 'Harbor',
    kind: 'scene',
    backdrop: 'linear-gradient(180deg, #16405A 0%, #123246 52%, #0D2331 100%)',
  },
  {
    id: 'loft',
    label: 'Loft',
    kind: 'scene',
    backdrop: 'linear-gradient(180deg, #33283E 0%, #272031 50%, #1B1724 100%)',
  },
];

type JoinStage = 'lobby' | 'joining';
type JoinMode = 'join' | 'present' | 'companion';

const JOIN_MODE_COPY: Record<JoinMode, {title: string; detail: string}> = {
  join: {
    title: 'Joining Atlas Q3 · Launch Readiness Review…',
    detail: 'Connecting audio and video with your lobby settings.',
  },
  present: {
    title: 'Joining as presenter…',
    detail: 'Your screen-share picker opens as soon as you connect.',
  },
  companion: {
    title: 'Joining in companion mode…',
    detail: 'Mic and speaker stay off on this device to avoid echo.',
  },
};

// ============= HELPERS =============

function deviceByValue(list: DeviceOption[], value: string): DeviceOption {
  return list.find(option => option.value === value) ?? list[0];
}

function effectById(id: string): BackgroundEffect {
  return EFFECTS.find(effect => effect.id === id) ?? EFFECTS[0];
}

/** Per-bar height (px) for the 5-bar stage pulse pill at a given level. */
function pulseBarHeight(barIndex: number, level: number): number {
  // Center bar tallest; neighbors taper deterministically.
  const shape = [0.45, 0.75, 1, 0.75, 0.45][barIndex] ?? 0.5;
  return Math.max(3, Math.round((level / 10) * 14 * shape));
}

// ============= STAGE PIECES =============

/**
 * Level-reactive mic indicator on the stage: five bars scale with the
 * seeded input level; muting collapses them to a red floor.
 */
function MicPulsePill({level, isMuted}: {level: number; isMuted: boolean}) {
  return (
    <div
      style={styles.micPulsePill}
      role="img"
      aria-label={
        isMuted ? 'Microphone muted' : `Microphone input level ${level} of 10`
      }>
      <Icon
        icon={isMuted ? MicOffIcon : MicIcon}
        size="xsm"
        color="inherit"
        style={isMuted ? {color: MUTED_RED} : undefined}
      />
      <div style={styles.micPulseBars} aria-hidden>
        {[0, 1, 2, 3, 4].map(barIndex => (
          <div
            key={barIndex}
            style={{
              ...styles.micPulseBar,
              height: isMuted ? 3 : pulseBarHeight(barIndex, level),
              backgroundColor: isMuted ? MUTED_RED : LEVEL_GREEN,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Room paint behind the silhouette: default room detail (windows +
 * shelves) that blur softens, or a flat scene gradient that replaces it.
 */
function StageBackdrop({effect}: {effect: BackgroundEffect}) {
  const isScene = effect.kind === 'scene';
  const blurPx = effect.kind === 'blur' ? (effect.blurPx ?? 0) : 0;
  return (
    <div
      aria-hidden
      style={{
        ...styles.stageBackdrop,
        background: isScene ? effect.backdrop : DEFAULT_ROOM,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
      }}>
      {!isScene && (
        <>
          <div style={{...styles.roomWindow, left: '9%'}} />
          <div style={{...styles.roomWindow, left: '31%'}} />
          <div style={{...styles.roomShelf, top: '62%', left: '68%', width: '24%'}} />
          <div style={{...styles.roomShelf, top: '70%', left: '72%', width: '20%'}} />
          <div style={{...styles.roomShelf, top: '78%', left: '68%', width: '24%'}} />
        </>
      )}
    </div>
  );
}

/** Head-and-shoulders self-view placeholder; flips with the mirror toggle. */
function Silhouette({isMirrored}: {isMirrored: boolean}) {
  return (
    <div
      aria-hidden
      style={{
        ...styles.silhouetteWrap,
        ...(isMirrored ? styles.silhouetteMirrored : undefined),
      }}>
      <div style={styles.silhouetteHead} />
      <div style={styles.silhouetteBody} />
    </div>
  );
}

/**
 * Segmented input-level meter for the device row: 10 segments fill with
 * the live level; the top two run warning-hot. Muted empties the track.
 */
function InputLevelMeter({level, isMuted}: {level: number; isMuted: boolean}) {
  const lit = isMuted ? 0 : level;
  return (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="xsm" color="secondary">
            Input level
          </Text>
        </StackItem>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {isMuted ? 'Muted' : `${lit}/10`}
        </Text>
      </HStack>
      <div
        style={styles.levelMeter}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={LEVEL_SEGMENTS}
        aria-valuenow={lit}
        aria-label="Microphone input level">
        {Array.from({length: LEVEL_SEGMENTS}, (_, segmentIndex) => (
          <div
            key={segmentIndex}
            style={{
              ...styles.levelSegment,
              ...(segmentIndex < lit
                ? segmentIndex >= LEVEL_SEGMENTS - 2
                  ? styles.levelSegmentHot
                  : styles.levelSegmentOn
                : undefined),
            }}
          />
        ))}
      </div>
    </VStack>
  );
}

/**
 * The camera-preview stage: scheme-locked dark glass with the room
 * backdrop + silhouette (or a camera-off slate), chips, mirror toggle,
 * mute/camera controls, the pulse pill, and a joining overlay.
 */
function PreviewStage({
  isMuted,
  isCameraOn,
  isMirrored,
  effect,
  level,
  joinStage,
  joinMode,
  isCompact,
  onToggleMute,
  onToggleCamera,
  onToggleMirror,
  onCancelJoin,
}: {
  isMuted: boolean;
  isCameraOn: boolean;
  isMirrored: boolean;
  effect: BackgroundEffect;
  level: number;
  joinStage: JoinStage;
  joinMode: JoinMode;
  isCompact: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleMirror: (pressed: boolean) => void;
  onCancelJoin: () => void;
}) {
  const touch = isCompact ? styles.controlTouch : undefined;
  const isJoining = joinStage === 'joining';
  return (
    <div style={styles.stage} aria-label="Camera preview">
      {isCameraOn ? (
        <>
          <StageBackdrop effect={effect} />
          <Silhouette isMirrored={isMirrored} />
        </>
      ) : (
        <div style={styles.cameraOffSlate}>
          {/* Footgun 14: re-pin the initials token on the locked surface. */}
          <Avatar
            name={YOU}
            size="large"
            style={{'--color-text-secondary': STAGE_TEXT} as CSSProperties}
          />
          <Text type="supporting" style={{color: STAGE_TEXT_DIM}}>
            Your camera is off
          </Text>
        </div>
      )}

      <div style={styles.stageTopLeft}>
        <span style={styles.scrimChip}>
          <Icon icon={VideoIcon} size="xsm" color="inherit" />
          Preview
        </span>
        {effect.kind !== 'none' && isCameraOn && (
          <span style={styles.scrimChip}>
            <Icon icon={SparklesIcon} size="xsm" color="inherit" />
            {effect.label}
          </span>
        )}
      </div>

      <div style={styles.stageTopRight}>
        <ToggleButton
          label="Mirror my video"
          size="sm"
          icon={<Icon icon={FlipHorizontal2Icon} size="sm" color="inherit" />}
          isPressed={isMirrored}
          onPressedChange={onToggleMirror}
          isDisabled={!isCameraOn || isJoining}
          tooltip={isMirrored ? 'Show unmirrored' : 'Mirror my video'}
          style={touch}
        />
      </div>

      <div style={styles.nameChip}>
        <Icon
          icon={isMuted ? MicOffIcon : MicIcon}
          size="xsm"
          color="inherit"
          style={isMuted ? {color: MUTED_RED} : undefined}
        />
        <span style={styles.nameChipText}>{`${YOU} (you)`}</span>
      </div>

      <div style={styles.stageControls}>
        <IconButton
          label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          tooltip={isMuted ? 'Unmute' : 'Mute'}
          icon={
            <Icon
              icon={isMuted ? MicOffIcon : MicIcon}
              size="sm"
              color="inherit"
              style={isMuted ? {color: MUTED_RED} : undefined}
            />
          }
          variant="ghost"
          size="md"
          isDisabled={isJoining}
          onClick={onToggleMute}
          style={touch}
        />
        <IconButton
          label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          tooltip={isCameraOn ? 'Camera off' : 'Camera on'}
          icon={
            <Icon
              icon={isCameraOn ? VideoIcon : VideoOffIcon}
              size="sm"
              color="inherit"
              style={!isCameraOn ? {color: MUTED_RED} : undefined}
            />
          }
          variant="ghost"
          size="md"
          isDisabled={isJoining}
          onClick={onToggleCamera}
          style={touch}
        />
      </div>

      <MicPulsePill level={level} isMuted={isMuted} />

      {isJoining && (
        <div style={styles.joiningOverlay}>
          <Spinner size="md" aria-label="Connecting" />
          <VStack gap={1}>
            <Text type="label" style={{color: STAGE_TEXT}}>
              {JOIN_MODE_COPY[joinMode].title}
            </Text>
            <Text type="supporting" size="sm" style={{color: STAGE_TEXT_DIM}}>
              {JOIN_MODE_COPY[joinMode].detail}
            </Text>
          </VStack>
          <Button
            label="Cancel join"
            variant="secondary"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={onCancelJoin}
          />
        </div>
      )}
    </div>
  );
}

// ============= DEVICE ROW =============

/**
 * Mic / speaker / camera Selectors with the live input meter under the
 * mic column and processing Switches under the others; stacks <=640px.
 */
function DeviceRow({
  micValue,
  speakerValue,
  cameraValue,
  level,
  isMuted,
  isCameraOn,
  noiseSuppression,
  lowLight,
  isCompact,
  onMicChange,
  onSpeakerChange,
  onCameraChange,
  onNoiseSuppressionChange,
  onLowLightChange,
}: {
  micValue: string;
  speakerValue: string;
  cameraValue: string;
  level: number;
  isMuted: boolean;
  isCameraOn: boolean;
  noiseSuppression: boolean;
  lowLight: boolean;
  isCompact: boolean;
  onMicChange: (value: string) => void;
  onSpeakerChange: (value: string) => void;
  onCameraChange: (value: string) => void;
  onNoiseSuppressionChange: (value: boolean) => void;
  onLowLightChange: (value: boolean) => void;
}) {
  return (
    <div
      style={{
        ...styles.deviceRow,
        ...(isCompact ? styles.deviceRowStacked : undefined),
      }}>
      <VStack gap={2}>
        <Selector
          label="Microphone"
          options={MIC_DEVICES}
          value={micValue}
          onChange={onMicChange}
        />
        <InputLevelMeter level={level} isMuted={isMuted} />
      </VStack>
      <VStack gap={2}>
        <Selector
          label="Speaker"
          options={SPEAKER_DEVICES}
          value={speakerValue}
          onChange={onSpeakerChange}
        />
        <Switch
          label="Noise suppression"
          value={noiseSuppression}
          onChange={onNoiseSuppressionChange}
        />
      </VStack>
      <VStack gap={2}>
        <Selector
          label="Camera"
          options={CAMERA_DEVICES}
          value={cameraValue}
          onChange={onCameraChange}
          isDisabled={!isCameraOn}
        />
        <Switch
          label="Adjust for low light"
          value={lowLight}
          onChange={onLowLightChange}
          isDisabled={!isCameraOn}
        />
      </VStack>
    </div>
  );
}

// ============= EFFECTS GALLERY =============

/**
 * Background-effects thumbnails: None / blur strengths / scene gradients;
 * real <button> tiles with an inset selected ring and a check badge.
 */
function EffectsGallery({
  selectedId,
  isCameraOn,
  isCompact,
  onSelect,
}: {
  selectedId: string;
  isCameraOn: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const renderTile = (effect: BackgroundEffect) => {
    const isSelected = effect.id === selectedId;
    const blurPx = effect.kind === 'blur' ? (effect.blurPx ?? 0) : 0;
    return (
      <button
        key={effect.id}
        type="button"
        onClick={() => onSelect(effect.id)}
        disabled={!isCameraOn}
        aria-pressed={isSelected}
        aria-label={`Background effect: ${effect.label}`}
        style={{
          ...styles.effectTile,
          ...(isCompact ? styles.effectTileFixed : undefined),
          opacity: isCameraOn ? 1 : 0.45,
          cursor: isCameraOn ? 'pointer' : 'default',
        }}>
        {effect.kind === 'none' ? (
          <Icon icon={ImageOffIcon} size="sm" color="inherit" />
        ) : (
          <>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  effect.kind === 'scene' ? effect.backdrop : DEFAULT_ROOM,
                filter: blurPx > 0 ? `blur(${blurPx}px)` : undefined,
              }}
            />
            <div style={styles.effectMiniPerson} aria-hidden>
              <div style={styles.effectMiniHead} />
              <div style={styles.effectMiniBody} />
            </div>
          </>
        )}
        <span style={styles.effectLabel}>{effect.label}</span>
        {isSelected && (
          <>
            <span style={styles.effectCheck} aria-hidden>
              <Icon icon={CheckIcon} size="xsm" color="inherit" />
            </span>
            <span aria-hidden style={styles.effectRing} />
          </>
        )}
      </button>
    );
  };

  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={SparklesIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label" size="sm">
            Background effects
          </Text>
        </StackItem>
        {!isCameraOn && (
          <Text type="supporting" size="xsm" color="secondary">
            Turn the camera on to preview effects
          </Text>
        )}
      </HStack>
      {isCompact ? (
        <div style={styles.effectsScroller}>{EFFECTS.map(renderTile)}</div>
      ) : (
        <div style={styles.effectsGrid}>{EFFECTS.map(renderTile)}</div>
      )}
    </VStack>
  );
}

// ============= MEETING INFO + JOIN =============

/**
 * The meeting-info summary Card plus join actions: schedule, location,
 * organizer, facepile with +N overflow, already-in roster, copyable link,
 * and the three join paths. 360px end panel, or stacked Card <=1024px.
 */
function MeetingInfoPanel({
  linkCopied,
  joinStage,
  isMuted,
  onCopyLink,
  onJoin,
}: {
  linkCopied: boolean;
  joinStage: JoinStage;
  isMuted: boolean;
  onCopyLink: () => void;
  onJoin: (mode: JoinMode) => void;
}) {
  const isJoining = joinStage === 'joining';
  const overflow = INVITEES.length - FACEPILE_VISIBLE;
  return (
    <VStack gap={3}>
      <Card>
        <VStack gap={3}>
          <VStack gap={1}>
            {/* HStack wrapper keeps the Badge hugging its label instead of
                stretching to the Card width inside the VStack. */}
            <HStack gap={1}>
              <Badge label={MEETING.program} variant="info" />
            </HStack>
            <Heading level={2}>{MEETING.title}</Heading>
          </VStack>

          <VStack gap={2}>
            <div style={styles.infoRow}>
              <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
              <VStack gap={0}>
                <Text type="supporting" size="sm">
                  {MEETING.when}
                </Text>
                <HStack gap={1} vAlign="center">
                  <Icon icon={RepeatIcon} size="xsm" color="secondary" />
                  <Text type="supporting" size="xsm" color="secondary">
                    {MEETING.recurrence}
                  </Text>
                </HStack>
              </VStack>
            </div>
            <div style={styles.infoRow}>
              <Icon icon={MapPinIcon} size="sm" color="secondary" />
              <Text type="supporting" size="sm">
                {MEETING.location}
              </Text>
            </div>
            <div style={styles.infoRow}>
              <Icon icon={ShieldIcon} size="sm" color="secondary" />
              <Text type="supporting" size="sm">
                Organized by {MEETING.organizer} · {MEETING.organizerRole}
              </Text>
            </div>
          </VStack>

          <Divider />

          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={UsersIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <Text type="label" size="sm">
                  Invited · {MEETING.invitedCount}
                </Text>
              </StackItem>
            </HStack>
            <AvatarGroup size="small" aria-label="Invited attendees">
              {INVITEES.slice(0, FACEPILE_VISIBLE).map(name => (
                <Avatar key={name} name={name} />
              ))}
              {overflow > 0 && <AvatarGroupOverflow count={overflow} />}
            </AvatarGroup>
          </VStack>

          <VStack gap={1}>
            <Text type="label" size="sm" color="secondary">
              Already in this meeting · {ALREADY_IN.length}
            </Text>
            {ALREADY_IN.map(person => (
              <div key={person.name} style={styles.inCallRow}>
                <Avatar name={person.name} size="xsmall" />
                <StackItem size="fill">
                  <Text type="supporting" size="sm">
                    {person.name}
                  </Text>
                </StackItem>
                <Text type="supporting" size="xsm" color="secondary">
                  {person.detail}
                </Text>
              </div>
            ))}
          </VStack>

          <HStack gap={2} vAlign="center">
            <Icon icon={LinkIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text
                type="supporting"
                size="xsm"
                color="secondary"
                maxLines={1}
                style={{fontFamily: 'var(--font-family-code, monospace)'}}>
                {MEETING.inviteLink}
              </Text>
            </StackItem>
            <IconButton
              label={linkCopied ? 'Invite link copied' : 'Copy invite link'}
              tooltip={linkCopied ? 'Copied' : 'Copy link'}
              icon={
                <Icon
                  icon={linkCopied ? CheckIcon : CopyIcon}
                  size="sm"
                  color="inherit"
                />
              }
              variant="ghost"
              size="sm"
              onClick={onCopyLink}
            />
          </HStack>
        </VStack>
      </Card>

      <VStack gap={2}>
        <Button
          label={isJoining ? 'Joining…' : 'Join now'}
          variant="primary"
          size="lg"
          isDisabled={isJoining}
          icon={<Icon icon={VideoIcon} size="sm" color="inherit" />}
          onClick={() => onJoin('join')}
        />
        <Button
          label="Present instead"
          variant="secondary"
          isDisabled={isJoining}
          icon={<Icon icon={MonitorUpIcon} size="sm" color="inherit" />}
          onClick={() => onJoin('present')}
        />
        <Button
          label="Join with companion mode"
          variant="ghost"
          isDisabled={isJoining}
          icon={<Icon icon={SmartphoneIcon} size="sm" color="inherit" />}
          onClick={() => onJoin('companion')}
        />
        <Text type="supporting" size="xsm" color="secondary">
          {isMuted
            ? 'You will join muted — others hear nothing until you unmute.'
            : 'Companion mode keeps mic and speaker off on this device to avoid echo.'}
        </Text>
      </VStack>
    </VStack>
  );
}

// ============= HEALTH-CHECK STRIP =============

interface HealthPill {
  id: string;
  icon: typeof WifiIcon;
  label: string;
  detail: string;
  variant: 'success' | 'warning' | 'neutral';
  isPulsing?: boolean;
}

/** One status pill: StatusDot + label + device/readout detail. */
function HealthPillChip({pill}: {pill: HealthPill}) {
  return (
    <Tooltip content={`${pill.label}: ${pill.detail}`}>
      <span style={styles.healthPill}>
        <StatusDot
          variant={pill.variant}
          label={`${pill.label} status`}
          isPulsing={pill.isPulsing}
        />
        <Icon icon={pill.icon} size="xsm" color="secondary" />
        <Text type="label" size="xsm">
          {pill.label}
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {pill.detail}
        </Text>
      </span>
    </Tooltip>
  );
}

/**
 * Pre-call health check: network / camera / mic / speaker pills derived
 * from the same state the stage reads, plus a speaker-test action.
 */
function HealthStrip({
  pills,
  isTestingSpeaker,
  onTestSpeaker,
}: {
  pills: HealthPill[];
  isTestingSpeaker: boolean;
  onTestSpeaker: () => void;
}) {
  return (
    <div style={styles.healthStrip}>
      <HStack gap={1} vAlign="center">
        <Icon icon={GaugeIcon} size="sm" color="secondary" />
        <Text type="label" size="sm" color="secondary">
          Pre-call check
        </Text>
      </HStack>
      {pills.map(pill => (
        <HealthPillChip key={pill.id} pill={pill} />
      ))}
      <Button
        style={{marginLeft: 'auto'}}
        label={isTestingSpeaker ? 'Playing test tone…' : 'Test speaker'}
        variant="ghost"
        size="sm"
        isDisabled={isTestingSpeaker}
        icon={
          <Icon
            icon={isTestingSpeaker ? ActivityIcon : Volume2Icon}
            size="sm"
            color="inherit"
          />
        }
        onClick={onTestSpeaker}
      />
    </div>
  );
}

// ============= PAGE =============

export default function MeetPrecallLobbyTemplate() {
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMirrored, setIsMirrored] = useState(true);
  const [micValue, setMicValue] = useState(MIC_DEVICES[0].value);
  const [speakerValue, setSpeakerValue] = useState(SPEAKER_DEVICES[0].value);
  const [cameraValue, setCameraValue] = useState(CAMERA_DEVICES[0].value);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [lowLight, setLowLight] = useState(false);
  const [effectId, setEffectId] = useState('none');
  const [levelTick, setLevelTick] = useState(0);
  const [isTestingSpeaker, setIsTestingSpeaker] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinStage, setJoinStage] = useState<JoinStage>('lobby');
  const [joinMode, setJoinMode] = useState<JoinMode>('join');

  // Responsive contract: <=1024px the info panel stacks below the
  // greenroom; <=640px the device row stacks and effects scroll.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // The seeded level pattern steps while the mic is live; muting freezes
  // (and empties) every meter that reads it.
  useEffect(() => {
    if (isMuted || joinStage === 'joining') {
      return undefined;
    }
    const timer = setInterval(() => {
      setLevelTick(prev => prev + 1);
    }, LEVEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isMuted, joinStage]);

  // Speaker test "plays" for a fixed beat, then re-arms.
  useEffect(() => {
    if (!isTestingSpeaker) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setIsTestingSpeaker(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, [isTestingSpeaker]);

  const level = LEVEL_PATTERN[levelTick % LEVEL_PATTERN.length];
  const effect = effectById(effectId);
  const camera = deviceByValue(CAMERA_DEVICES, cameraValue);
  const speaker = deviceByValue(SPEAKER_DEVICES, speakerValue);
  const mic = deviceByValue(MIC_DEVICES, micValue);

  const startJoin = (mode: JoinMode) => {
    setJoinMode(mode);
    setJoinStage('joining');
    if (mode === 'companion') {
      setIsMuted(true);
    }
  };

  // Pills derive from the exact state the controls above them read.
  const healthPills: HealthPill[] = [
    {
      id: 'network',
      icon: WifiIcon,
      label: 'Network',
      detail: NETWORK_READOUT,
      variant: 'success',
    },
    {
      id: 'camera',
      icon: isCameraOn ? VideoIcon : VideoOffIcon,
      label: 'Camera',
      // The StatusDot already says "ready"; short copy keeps the whole
      // strip + Test speaker on one footer line at desktop widths.
      detail: isCameraOn ? camera.short : 'Off',
      variant: isCameraOn ? 'success' : 'neutral',
    },
    {
      id: 'mic',
      icon: isMuted ? MicOffIcon : MicIcon,
      label: 'Mic',
      detail: isMuted ? `Muted · ${mic.short}` : `${mic.short} · ${level}/10`,
      variant: isMuted ? 'warning' : 'success',
    },
    {
      id: 'speaker',
      icon: SpeakerIcon,
      label: 'Speaker',
      detail: isTestingSpeaker ? `Testing · ${speaker.short}` : speaker.short,
      variant: 'success',
      isPulsing: isTestingSpeaker,
    },
  ];

  const infoPanel = (
    <MeetingInfoPanel
      linkCopied={linkCopied}
      joinStage={joinStage}
      isMuted={isMuted}
      onCopyLink={() => setLinkCopied(true)}
      onJoin={startJoin}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>Kestrel Meet</Heading>
                  <Badge label="Lobby" variant="neutral" />
                  {!isStacked && (
                    <Token
                      label={MEETING.inviteLink}
                      size="sm"
                      icon={<Icon icon={LinkIcon} size="xsm" color="inherit" />}
                    />
                  )}
                </HStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                {!isCompact && (
                  <Text type="supporting" size="sm" color="secondary">
                    {YOU}
                  </Text>
                )}
                <Avatar name={YOU} size="small" />
              </HStack>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.greenroomScroll}>
              <div style={styles.greenroomInner}>
                <PreviewStage
                  isMuted={isMuted}
                  isCameraOn={isCameraOn}
                  isMirrored={isMirrored}
                  effect={effect}
                  level={level}
                  joinStage={joinStage}
                  joinMode={joinMode}
                  isCompact={isCompact}
                  onToggleMute={() => setIsMuted(prev => !prev)}
                  onToggleCamera={() => setIsCameraOn(prev => !prev)}
                  onToggleMirror={setIsMirrored}
                  onCancelJoin={() => setJoinStage('lobby')}
                />
                <DeviceRow
                  micValue={micValue}
                  speakerValue={speakerValue}
                  cameraValue={cameraValue}
                  level={level}
                  isMuted={isMuted}
                  isCameraOn={isCameraOn}
                  noiseSuppression={noiseSuppression}
                  lowLight={lowLight}
                  isCompact={isCompact}
                  onMicChange={setMicValue}
                  onSpeakerChange={setSpeakerValue}
                  onCameraChange={setCameraValue}
                  onNoiseSuppressionChange={setNoiseSuppression}
                  onLowLightChange={setLowLight}
                />
                <Divider />
                <EffectsGallery
                  selectedId={effectId}
                  isCameraOn={isCameraOn}
                  isCompact={isCompact}
                  onSelect={setEffectId}
                />
                {isStacked && <Card>{infoPanel}</Card>}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isStacked ? (
            <LayoutPanel width={360} padding={0} label="Meeting details">
              <div style={styles.panelScroll}>{infoPanel}</div>
            </LayoutPanel>
          ) : undefined
        }
        footer={
          <LayoutFooter hasDivider>
            <HealthStrip
              pills={healthPills}
              isTestingSpeaker={isTestingSpeaker}
              onTestSpeaker={() => setIsTestingSpeaker(true)}
            />
          </LayoutFooter>
        }
      />
    </div>
  );
}
