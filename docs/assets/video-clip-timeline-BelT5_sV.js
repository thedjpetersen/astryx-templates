var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 92-second, 24fps sequence
 *   'spring-launch-cut_v4': five V1 video clips, two V2 title clips, a
 *   full-length A1 dialog clip and A2 music bed — each audio clip carrying a
 *   fixed 46-value waveform array; per-clip opacity/speed/gain defaults)
 * @output NLE-style video editor surface: a 52px header (project name, Saved
 *   Badge, Undo2/Redo2, zoom out/in + Fit, primary Export Button), a slim
 *   56px left tool rail of vertical IconButtons with Tooltip+Kbd shortcuts
 *   (select, razor SplitIcon, text TypeIcon, zoom), a center program monitor
 *   (16:9 gradient stage labeled 'Program: spring-launch-cut_v4', transport
 *   with StepBack/Play/StepForward and a mono 00:00:14:06 timecode, scrub
 *   Slider), a 300px collapsible properties panel bound to the selected clip
 *   (source in/out, opacity Slider, speed NumberInput, gain Slider, LockIcon
 *   toggle) — and the defining region: a fixed 280px bottom timeline dock
 *   with a tick-labeled ruler, full-height red playhead, and four track
 *   lanes (V2 titles, V1 main video, A1 dialog, A2 music) whose clip blocks
 *   are width-proportional to fixed durations, audio lanes filled with
 *   deterministic CSS waveform bars, lane headers carrying mute/lock
 *   ToggleButtons, plus snap MagnetIcon and 50/100/200% zoom controls
 * @position Page template; emitted by \`astryx template video-clip-timeline\`
 *
 * Frame: Layout height="fill", zero page scroll. LayoutHeader carries the
 * project chrome. Middle band: LayoutPanel start 56 (tool rail, fixed),
 * LayoutContent (program monitor, flexible), LayoutPanel end 300 (clip
 * properties, collapsible via the header toggle). LayoutFooter height 280
 * hosts the timeline dock: 120px lane headers stay fixed while the lane
 * canvas scrolls horizontally; the ruler, scrub Slider, clip blocks, and
 * red playhead all share one px-per-second scale so zoom changes recompute
 * every width together. The only multi-track editing surface — choose over
 * subtitle-cue-editor when clips live on lanes, and over
 * browser-session-replay when the user arranges media rather than replays
 * captured frames.
 *
 * Responsive contract:
 * - >960px: header | rail 56 | monitor (fill) | properties 300 | dock 280.
 * - <=960px: the properties panel drops out entirely (its header toggle
 *   disables); rail, monitor, and dock keep their fixed sizes.
 * - <=768px: the header hides the sequence duration text and Fit button;
 *   Export and undo/redo stay. Transport, snap, and lane mute/lock controls
 *   grow to 40px touch targets (icon glyphs stay "sm") and lane headers
 *   widen to 148px to hold the bigger toggles.
 * - The header row wraps (flexWrap) instead of clipping — the project title
 *   holds the first row and the undo/zoom/panel/Export cluster flows onto a
 *   second row at phone widths, so every control stays reachable.
 * - The lane canvas scrolls horizontally at every width — at 200% zoom the
 *   92s sequence is 1472px wide by design; lane headers never scroll.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels
 * everywhere; the only Card is the selected-clip summary in the properties
 * panel. The monitor stage and timeline lanes are styled divs — CSS
 * gradients and fixture-driven bars, never <video> or network media.
 */

import {useState, type CSSProperties, type MouseEvent} from 'react';

import {
  ClapperboardIcon,
  LockIcon,
  LockOpenIcon,
  MagnetIcon,
  MousePointerIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PauseIcon,
  PlayIcon,
  Redo2Icon,
  SplitIcon,
  StepBackIcon,
  StepForwardIcon,
  TypeIcon,
  Undo2Icon,
  Volume2Icon,
  VolumeXIcon,
  ZoomInIcon,
  ZoomOutIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SEQUENCE CONSTANTS =============

const PROJECT_NAME = 'spring-launch-cut_v4';
const FPS = 24;
const DURATION_SEC = 92; // 00:01:32:00 at 24fps
const INITIAL_PLAYHEAD_SEC = 14.25; // 00:00:14:06
const INITIAL_SELECTED_CLIP = 'v1-2'; // B-roll_office_pan.mp4

type ZoomPreset = '50' | '100' | '200';
const ZOOM_ORDER: ZoomPreset[] = ['50', '100', '200'];
/** Shared px-per-second scale: ruler ticks, clip widths, and the playhead
 * all derive from this one number, so zoom keeps everything aligned. */
const PX_PER_SEC: Record<ZoomPreset, number> = {'50': 4, '100': 8, '200': 16};
const TICK_INTERVAL_SEC: Record<ZoomPreset, number> = {'50': 10, '100': 5, '200': 2};

const MONO = 'var(--font-family-code, monospace)';

// Dock geometry: 120px lane headers, ruler + scrub rows, 46px lanes.
const LANE_HEADER_W = 120;
// <=768px: lane headers widen so the V-label still fits beside two 40px
// touch-target toggles (16px padding + 2×40 buttons + gaps + label).
const LANE_HEADER_W_COMPACT = 148;
const RULER_H = 24;
const SCRUB_H = 26;
const LANE_H = 46;
const DOCK_H = 280;

/** Seconds -> SMPTE HH:MM:SS:FF at 24fps. */
function formatTimecode(sec: number): string {
  const totalFrames = Math.round(sec * FPS);
  const frames = totalFrames % FPS;
  const totalSec = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return \`\${pad(Math.floor(totalSec / 3600))}:\${pad(
    Math.floor(totalSec / 60) % 60,
  )}:\${pad(totalSec % 60)}:\${pad(frames)}\`;
}

/** Seconds -> short ruler label, e.g. 75 -> "1:15". */
function formatRulerLabel(sec: number): string {
  return \`\${Math.floor(sec / 60)}:\${String(sec % 60).padStart(2, '0')}\`;
}

const clampSec = (sec: number) => Math.min(DURATION_SEC, Math.max(0, sec));

// ============= FIXTURES =============
// Fixed clip in/out points and waveform arrays — no clocks, no randomness.

type TrackId = 'v2' | 'v1' | 'a1' | 'a2';
type ToolId = 'select' | 'razor' | 'text' | 'zoom';

interface TimelineClip {
  id: string;
  name: string;
  start: number; // seconds on the sequence
  end: number;
  opacity: number; // % default
  speed: number; // playback rate default
  gainDb: number; // audio gain default
}

interface Track {
  id: TrackId;
  label: string;
  caption: string;
  kind: 'video' | 'audio';
  blockBg: string;
  blockBorder: string;
  waveColor?: string;
  wave?: number[];
  clips: TimelineClip[];
}

// Fixed 46-value waveform arrays (bar heights in %). Deterministic stand-ins
// for real audio peaks; A2 sits lower because the music bed is at -12 dB.
const A1_WAVE = [
  42, 66, 58, 71, 64, 80, 55, 73, 68, 61, 77, 52, 69, 83, 60, 74, 49, 66, 79,
  57, 71, 63, 84, 58, 70, 66, 52, 76, 61, 73, 68, 80, 54, 67, 75, 59, 71, 64,
  78, 56, 69, 62, 74, 51, 65, 48,
];
const A2_WAVE = [
  30, 38, 45, 52, 47, 41, 36, 44, 50, 56, 49, 42, 37, 45, 53, 58, 50, 43, 38,
  46, 54, 59, 51, 44, 39, 47, 55, 60, 52, 45, 40, 48, 56, 61, 53, 46, 41, 49,
  57, 62, 54, 47, 42, 50, 44, 35,
];

const clip = (
  id: string,
  name: string,
  start: number,
  end: number,
  gainDb = 0,
): TimelineClip => ({id, name, start, end, opacity: 100, speed: 1, gainDb});

const TRACKS: Track[] = [
  {
    id: 'v2',
    label: 'V2',
    caption: 'Titles',
    kind: 'video',
    blockBg: 'rgba(168, 85, 247, 0.24)',
    blockBorder: '#A855F7',
    clips: [
      clip('v2-1', 'Title: Spring Launch', 2, 8),
      clip('v2-2', 'Lower third: Dana Reyes', 33, 39),
    ],
  },
  {
    id: 'v1',
    label: 'V1',
    caption: 'Main video',
    kind: 'video',
    blockBg: 'rgba(59, 130, 246, 0.26)',
    blockBorder: '#3B82F6',
    clips: [
      clip('v1-1', 'A001_C012_interview.mov', 0, 18),
      clip('v1-2', 'B-roll_office_pan.mp4', 18, 31),
      clip('v1-3', 'A001_C014_interview.mov', 31, 52),
      clip('v1-4', 'product_macro_04.mp4', 52, 66),
      clip('v1-5', 'closing_wide.mov', 66, 92),
    ],
  },
  {
    id: 'a1',
    label: 'A1',
    caption: 'Dialog',
    kind: 'audio',
    blockBg: 'rgba(34, 197, 94, 0.18)',
    blockBorder: '#22C55E',
    waveColor: 'rgba(34, 197, 94, 0.75)',
    wave: A1_WAVE,
    clips: [clip('a1-1', 'interview_dialog_mixdown.wav', 0, 92)],
  },
  {
    id: 'a2',
    label: 'A2',
    caption: 'Music',
    kind: 'audio',
    blockBg: 'rgba(20, 184, 166, 0.16)',
    blockBorder: '#14B8A6',
    waveColor: 'rgba(20, 184, 166, 0.7)',
    wave: A2_WAVE,
    clips: [clip('a2-1', 'score_horizon_loop.wav', 0, 92, -12)],
  },
];

interface ClipWithTrack {
  clip: TimelineClip;
  track: Track;
}

const ALL_CLIPS: ClipWithTrack[] = TRACKS.flatMap(track =>
  track.clips.map(c => ({clip: c, track})),
);

function findClip(clipId: string | null): ClipWithTrack | null {
  return ALL_CLIPS.find(entry => entry.clip.id === clipId) ?? null;
}

const TOOLS: {id: ToolId; label: string; keys: string; icon: typeof SplitIcon}[] = [
  {id: 'select', label: 'Select', keys: 'v', icon: MousePointerIcon},
  {id: 'razor', label: 'Razor', keys: 'c', icon: SplitIcon},
  {id: 'text', label: 'Text', keys: 't', icon: TypeIcon},
  {id: 'zoom', label: 'Zoom', keys: 'z', icon: ZoomInIcon},
];

/** Per-clip editable state; edits in the properties panel write back here. */
interface ClipAdjust {
  opacity: number;
  speed: number;
  gainDb: number;
  isLocked: boolean;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping — the
  // 'spring-launch-cut_v4' title alone is wider than half a phone viewport.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=768px: grow transport/snap/lane toggles to 40px touch targets (the
  // "sm" 28px box is fine for pointers but too small for thumbs); icon
  // glyphs stay "sm" so the rows read the same, just with more padding.
  tapTarget: {width: 40, height: 40},
  // Tool rail: 56px panel, buttons stacked with 4px breathing room.
  rail: {padding: 'var(--spacing-1)', alignItems: 'center'},
  // Program monitor: muted backdrop centering the stage column.
  monitorBackdrop: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
  },
  monitorColumn: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    marginBlock: 'auto',
  },
  // 16:9 gradient stage — a styled div stands in for the program feed.
  stage: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #26334A 0%, #131B2C 55%, #0B1120 100%)',
    colorScheme: 'dark',
    boxShadow: 'var(--shadow-high)',
  },
  stageLabel: {
    position: 'absolute',
    top: 10,
    left: 12,
    fontFamily: MONO,
    fontSize: 11,
    letterSpacing: '0.06em',
    color: 'rgba(226, 232, 240, 0.75)',
  },
  // Fixed-pixel inset keeps the dashed frame's margins even on all sides
  // (percentage insets resolve against width and height separately).
  stageSafeArea: {
    position: 'absolute',
    inset: 24,
    border: '1px dashed rgba(148, 163, 184, 0.25)',
    borderRadius: 4,
    pointerEvents: 'none',
  },
  stageCenter: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    textAlign: 'center',
    paddingInline: '12%',
  },
  stageClipName: {
    fontFamily: MONO,
    fontSize: 15,
    color: 'rgba(241, 245, 249, 0.92)',
  },
  stageClipMeta: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'rgba(148, 163, 184, 0.8)',
  },
  // Inset pill progress bar — never touches the stage's rounded corners.
  stageProgressRail: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
    height: 3,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(148, 163, 184, 0.25)',
  },
  stageProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#EF4444',
  },
  timecode: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Timeline dock scaffolding.
  dock: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  dockBody: {flex: 1, minHeight: 0, display: 'flex'},
  laneHeaderCol: {
    width: LANE_HEADER_W,
    flexShrink: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  laneHeaderTop: {
    height: RULER_H + SCRUB_H,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-2)',
  },
  laneHeaderCell: {
    height: LANE_H,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    // Matches laneHeaderTop so track labels align with the px/s readout.
    paddingInline: 'var(--spacing-2)',
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  laneCanvasScroll: {flex: 1, minWidth: 0, overflowX: 'auto', overflowY: 'hidden'},
  laneCanvas: {position: 'relative'},
  ruler: {
    position: 'relative',
    height: RULER_H,
    cursor: 'pointer',
    backgroundColor: 'var(--color-background-muted)',
  },
  rulerTick: {
    position: 'absolute',
    bottom: 0,
    width: 1,
    height: 7,
    backgroundColor: 'var(--color-border)',
  },
  rulerLabel: {
    position: 'absolute',
    top: 3,
    fontFamily: MONO,
    fontSize: 9,
    color: 'var(--color-text-secondary)',
    transform: 'translateX(3px)',
    userSelect: 'none',
  },
  scrubRow: {height: SCRUB_H, display: 'flex', alignItems: 'center'},
  lane: {
    position: 'relative',
    height: LANE_H,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  clipBlock: {
    position: 'absolute',
    top: 5,
    bottom: 5,
    // Short title clips keep enough width for a recognizable label.
    minWidth: 64,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: 'solid',
    overflow: 'hidden',
    padding: 0,
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  clipName: {
    position: 'absolute',
    top: 2,
    left: 8,
    right: 8,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'var(--color-text-primary)',
    pointerEvents: 'none',
    // Above the playhead line so labels stay legible when it crosses them.
    zIndex: 3,
  },
  waveRow: {
    position: 'absolute',
    inset: '16px 4px 3px 4px',
    display: 'flex',
    alignItems: 'flex-end',
    gap: 1,
  },
  waveBar: {flex: 1, borderRadius: 1, minWidth: 1},
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
    pointerEvents: 'none',
    zIndex: 2,
  },
  playheadCap: {
    position: 'absolute',
    top: 0,
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: '#EF4444',
    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
  },
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
};

// ============= TIMELINE DOCK PIECES =============

function TimeRuler({
  pxPerSec,
  tickInterval,
  onScrub,
}: {
  pxPerSec: number;
  tickInterval: number;
  onScrub: (sec: number) => void;
}) {
  const ticks: number[] = [];
  for (let t = 0; t <= DURATION_SEC; t += tickInterval) {
    ticks.push(t);
  }
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onScrub((event.clientX - rect.left) / pxPerSec);
  };
  return (
    <div
      style={{...styles.ruler, width: DURATION_SEC * pxPerSec}}
      onClick={handleClick}
      role="presentation"
      aria-hidden>
      {ticks.map(t => (
        <span key={t}>
          <span style={{...styles.rulerTick, left: t * pxPerSec}} />
          <span style={{...styles.rulerLabel, left: t * pxPerSec}}>
            {formatRulerLabel(t)}
          </span>
        </span>
      ))}
    </div>
  );
}

/** One clip block; width/left derive from the shared px-per-second scale. */
function ClipBlock({
  entry,
  pxPerSec,
  isSelected,
  isTrackLocked,
  onSelect,
}: {
  entry: ClipWithTrack;
  pxPerSec: number;
  isSelected: boolean;
  isTrackLocked: boolean;
  onSelect: (clipId: string) => void;
}) {
  const {clip: c, track} = entry;
  // Blocks show the name without its "Title:"/"Lower third:" role prefix so
  // narrow title clips still surface a recognizable word; the properties
  // panel and aria-label keep the full fixture name.
  const displayName = c.name.includes(': ')
    ? c.name.slice(c.name.indexOf(': ') + 2)
    : c.name;
  const blockStyle: CSSProperties = {
    ...styles.clipBlock,
    left: c.start * pxPerSec,
    width: (c.end - c.start) * pxPerSec,
    backgroundColor: track.blockBg,
    borderColor: isSelected ? 'var(--color-accent)' : track.blockBorder,
    // Inset ring keeps the selection outline inside the block so it never
    // overlaps adjacent clips or clips its own label.
    boxShadow: isSelected ? 'inset 0 0 0 1px var(--color-accent)' : undefined,
    cursor: isTrackLocked ? 'not-allowed' : 'pointer',
  };
  return (
    <button
      type="button"
      style={blockStyle}
      disabled={isTrackLocked}
      aria-label={\`\${track.label} clip \${c.name}, \${formatTimecode(
        c.start,
      )} to \${formatTimecode(c.end)}\`}
      aria-pressed={isSelected}
      onClick={() => onSelect(c.id)}>
      <span style={styles.clipName}>{displayName}</span>
      {track.wave != null && (
        <span style={styles.waveRow} aria-hidden>
          {track.wave.map((v, i) => (
            <span
              // Fixed fixture array — index keys are stable.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={{
                ...styles.waveBar,
                height: \`\${v}%\`,
                backgroundColor: track.waveColor,
              }}
            />
          ))}
        </span>
      )}
    </button>
  );
}

/** Lane header (120px, 148px compact): track label + caption tooltip,
 * mute/lock toggles — 40px touch targets when isCompact. */
function LaneHeader({
  track,
  isMuted,
  isLocked,
  isCompact,
  onMuteChange,
  onLockChange,
}: {
  track: Track;
  isMuted: boolean;
  isLocked: boolean;
  isCompact: boolean;
  onMuteChange: (isPressed: boolean) => void;
  onLockChange: (isPressed: boolean) => void;
}) {
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  return (
    <div style={styles.laneHeaderCell}>
      <StackItem size="fill">
        <Tooltip content={\`\${track.label} · \${track.caption}\`}>
          <VStack gap={0}>
            <Text type="body" weight="semibold">
              {track.label}
            </Text>
          </VStack>
        </Tooltip>
      </StackItem>
      <ToggleButton
        label={\`Mute \${track.label}\`}
        size="sm"
        isIconOnly
        isPressed={isMuted}
        onPressedChange={onMuteChange}
        style={tapTargetStyle}
        icon={<Icon icon={Volume2Icon} size="sm" color="inherit" />}
        pressedIcon={<Icon icon={VolumeXIcon} size="sm" color="inherit" />}
      />
      <ToggleButton
        label={\`Lock \${track.label}\`}
        size="sm"
        isIconOnly
        isPressed={isLocked}
        onPressedChange={onLockChange}
        style={tapTargetStyle}
        icon={<Icon icon={LockOpenIcon} size="sm" color="inherit" />}
        pressedIcon={<Icon icon={LockIcon} size="sm" color="inherit" />}
      />
    </div>
  );
}

// ============= PROPERTIES PANEL =============

function PropertiesPanel({
  selected,
  adjust,
  onAdjust,
}: {
  selected: ClipWithTrack | null;
  adjust: ClipAdjust | null;
  onAdjust: (patch: Partial<ClipAdjust>) => void;
}) {
  if (selected == null || adjust == null) {
    return (
      <div style={styles.panelScroll}>
        <div style={styles.panelEmpty}>
          <VStack gap={1} hAlign="center">
            <Text type="body" weight="semibold">
              No clip selected
            </Text>
            <Text type="supporting" color="secondary">
              Click a block on the timeline to inspect and edit it.
            </Text>
          </VStack>
        </div>
      </div>
    );
  }

  const {clip: c, track} = selected;
  const isAudio = track.kind === 'audio';
  const isEditLocked = adjust.isLocked;

  return (
    <div style={styles.panelScroll}>
      <VStack gap={3}>
        <Card padding={3}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="body" weight="semibold" maxLines={2} style={styles.mono}>
                  {c.name}
                </Text>
              </StackItem>
              <Badge label={track.label} variant="neutral" />
            </HStack>
            <HStack gap={2} vAlign="center">
              <Text type="supporting" color="secondary">
                {track.caption} · {(c.end - c.start).toFixed(0)}s
              </Text>
              <StackItem size="fill">
                <span />
              </StackItem>
              <ToggleButton
                label={adjust.isLocked ? 'Unlock clip' : 'Lock clip'}
                size="sm"
                isIconOnly
                isPressed={adjust.isLocked}
                onPressedChange={isPressed => onAdjust({isLocked: isPressed})}
                icon={<Icon icon={LockOpenIcon} size="sm" color="inherit" />}
                pressedIcon={<Icon icon={LockIcon} size="sm" color="inherit" />}
              />
            </HStack>
          </VStack>
        </Card>

        <VStack gap={1}>
          <Text type="label" color="secondary">
            Source
          </Text>
          <HStack gap={2}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                In
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatTimecode(c.start)}
            </Text>
          </HStack>
          <HStack gap={2}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Out
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatTimecode(c.end)}
            </Text>
          </HStack>
        </VStack>

        <Divider />

        {!isAudio && (
          <Collapsible
            trigger={
              <Text type="body" weight="semibold">
                Video
              </Text>
            }>
            <VStack gap={3}>
              <Slider
                label="Opacity"
                value={adjust.opacity}
                min={0}
                max={100}
                step={1}
                isDisabled={isEditLocked}
                valueDisplay="text"
                formatValue={v => \`\${v}%\`}
                onChange={(v: number) => onAdjust({opacity: v})}
              />
              <NumberInput
                label="Speed"
                value={adjust.speed}
                min={0.25}
                max={4}
                step={0.25}
                units="×"
                size="sm"
                isDisabled={isEditLocked}
                onChange={v => onAdjust({speed: v})}
              />
            </VStack>
          </Collapsible>
        )}

        {!isAudio && <Divider />}

        <Collapsible
          trigger={
            <Text type="body" weight="semibold">
              Audio
            </Text>
          }>
          <VStack gap={3}>
            <Slider
              label="Gain"
              value={adjust.gainDb}
              min={-24}
              max={12}
              step={1}
              isDisabled={isEditLocked}
              valueDisplay="text"
              formatValue={v => \`\${v > 0 ? '+' : ''}\${v} dB\`}
              onChange={(v: number) => onAdjust({gainDb: v})}
            />
            <Text type="supporting" color="secondary">
              {isAudio
                ? 'Applied to the track mix bus before the master fader.'
                : 'Gain applies to audio embedded in this video clip.'}
            </Text>
          </VStack>
        </Collapsible>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function VideoClipTimelineTemplate() {
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    INITIAL_SELECTED_CLIP,
  );
  const [playheadSec, setPlayheadSec] = useState(INITIAL_PLAYHEAD_SEC);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState<ZoomPreset>('100');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [mutedTracks, setMutedTracks] = useState<Record<TrackId, boolean>>({
    v2: false,
    v1: false,
    a1: false,
    a2: false,
  });
  const [lockedTracks, setLockedTracks] = useState<Record<TrackId, boolean>>({
    v2: false,
    v1: false,
    a1: false,
    a2: false,
  });
  // Property edits write back per clip id; unedited clips fall through to
  // their fixture defaults (clip 2 ships at opacity 100 / speed 1.0 / 0 dB).
  const [clipAdjusts, setClipAdjusts] = useState<Record<string, ClipAdjust>>({});
  // Undo/redo over property edits: each edit snapshots the whole adjustments
  // map onto the past stack (capped at 100) and clears the redo stack.
  const [pastAdjusts, setPastAdjusts] = useState<Record<string, ClipAdjust>[]>(
    [],
  );
  const [futureAdjusts, setFutureAdjusts] = useState<
    Record<string, ClipAdjust>[]
  >([]);

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // 40px hit areas for the thumb-driven controls at phone widths.
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  const laneHeaderW = isCompact ? LANE_HEADER_W_COMPACT : LANE_HEADER_W;

  const pxPerSec = PX_PER_SEC[zoom];
  const canvasWidth = DURATION_SEC * pxPerSec;
  const zoomIndex = ZOOM_ORDER.indexOf(zoom);

  const selected = findClip(selectedClipId);
  const adjustFor = (entry: ClipWithTrack): ClipAdjust =>
    clipAdjusts[entry.clip.id] ?? {
      opacity: entry.clip.opacity,
      speed: entry.clip.speed,
      gainDb: entry.clip.gainDb,
      isLocked: false,
    };
  const patchSelected = (patch: Partial<ClipAdjust>) => {
    if (selected == null) {
      return;
    }
    const current = adjustFor(selected);
    setPastAdjusts(prev => [...prev.slice(-99), clipAdjusts]);
    setFutureAdjusts([]);
    setClipAdjusts(prev => ({
      ...prev,
      [selected.clip.id]: {...current, ...patch},
    }));
  };
  const undo = () => {
    if (pastAdjusts.length === 0) {
      return;
    }
    setPastAdjusts(pastAdjusts.slice(0, -1));
    setFutureAdjusts(prev => [...prev, clipAdjusts]);
    setClipAdjusts(pastAdjusts[pastAdjusts.length - 1]);
  };
  const redo = () => {
    if (futureAdjusts.length === 0) {
      return;
    }
    setFutureAdjusts(futureAdjusts.slice(0, -1));
    setPastAdjusts(prev => [...prev, clipAdjusts]);
    setClipAdjusts(futureAdjusts[futureAdjusts.length - 1]);
  };

  const scrubTo = (sec: number) => {
    setPlayheadSec(
      clampSec(snapEnabled ? Math.round(sec) : Math.round(sec * FPS) / FPS),
    );
  };
  const stepFrames = (delta: number) => {
    setIsPlaying(false);
    setPlayheadSec(prev => clampSec(prev + delta / FPS));
  };

  // The V1 clip under the playhead feeds the program monitor readout.
  const v1Track = TRACKS.find(t => t.id === 'v1');
  const programClip =
    v1Track?.clips.find(c => playheadSec >= c.start && playheadSec < c.end) ??
    null;

  const selectClip = (clipId: string) => {
    setSelectedClipId(prev => (prev === clipId ? null : clipId));
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Saved" variant="success" />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                00:01:32:00 · {FPS} fps
              </Text>
            )}
          </HStack>
        </StackItem>
        <IconButton
          label="Undo"
          tooltip="Undo property edit"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={pastAdjusts.length === 0}
          onClick={undo}
        />
        <IconButton
          label="Redo"
          tooltip="Redo property edit"
          icon={<Icon icon={Redo2Icon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={futureAdjusts.length === 0}
          onClick={redo}
        />
        <IconButton
          label="Zoom out timeline"
          tooltip="Zoom out"
          icon={<Icon icon={ZoomOutIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={zoomIndex === 0}
          onClick={() => setZoom(ZOOM_ORDER[Math.max(0, zoomIndex - 1)])}
        />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {zoom}%
        </Text>
        <IconButton
          label="Zoom in timeline"
          tooltip="Zoom in"
          icon={<Icon icon={ZoomInIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={zoomIndex === ZOOM_ORDER.length - 1}
          onClick={() =>
            setZoom(ZOOM_ORDER[Math.min(ZOOM_ORDER.length - 1, zoomIndex + 1)])
          }
        />
        {!isCompact && (
          <Button
            label="Fit"
            variant="ghost"
            size="sm"
            onClick={() => setZoom('50')}
          />
        )}
        <IconButton
          label={isPanelOpen ? 'Hide clip properties' : 'Show clip properties'}
          tooltip={isPanelOpen ? 'Hide properties' : 'Show properties'}
          icon={
            <Icon
              icon={isPanelOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
              size="sm"
              color="inherit"
            />
          }
          variant="ghost"
          size="sm"
          isDisabled={isNarrow}
          onClick={() => setIsPanelOpen(prev => !prev)}
        />
        <Button label="Export" variant="primary" size="sm" onClick={() => {}} />
      </HStack>
    </LayoutHeader>
  );

  // ----- Tool rail (56px) -----
  const toolRail = (
    <LayoutPanel width={56} padding={0} hasDivider label="Editing tools">
      <VStack gap={1} style={styles.rail}>
        {TOOLS.map(tool => (
          <Tooltip
            key={tool.id}
            content={
              <HStack gap={2} vAlign="center">
                <Text type="supporting" color="inherit">
                  {tool.label}
                </Text>
                <Kbd keys={tool.keys} />
              </HStack>
            }>
            <IconButton
              label={\`\${tool.label} tool\`}
              icon={<Icon icon={tool.icon} size="sm" color="inherit" />}
              variant={activeTool === tool.id ? 'secondary' : 'ghost'}
              size="md"
              onClick={() => setActiveTool(tool.id)}
            />
          </Tooltip>
        ))}
      </VStack>
    </LayoutPanel>
  );

  // ----- Program monitor -----
  const progressPct = (playheadSec / DURATION_SEC) * 100;
  const monitor = (
    <LayoutContent padding={0}>
      <div style={styles.monitorBackdrop}>
        <div style={styles.monitorColumn}>
          <VStack gap={2}>
            <div style={styles.stage}>
              <span style={styles.stageLabel}>Program: {PROJECT_NAME}</span>
              <div style={styles.stageSafeArea} />
              <div style={styles.stageCenter}>
                <span style={styles.stageClipName}>
                  {programClip != null ? programClip.name : '— black —'}
                </span>
                <span style={styles.stageClipMeta}>
                  {isPlaying ? 'PLAYING' : 'PAUSED'} · V1 ·{' '}
                  {formatTimecode(playheadSec)}
                </span>
              </div>
              <div style={styles.stageProgressRail} aria-hidden>
                <div
                  style={{...styles.stageProgressFill, width: \`\${progressPct}%\`}}
                />
              </div>
            </div>
            <Toolbar
              label="Transport"
              size="sm"
              gap={1}
              startContent={
                <>
                  <IconButton
                    label="Step back one frame"
                    tooltip="Back 1 frame"
                    icon={<Icon icon={StepBackIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    style={tapTargetStyle}
                    isDisabled={playheadSec <= 0}
                    onClick={() => stepFrames(-1)}
                  />
                  <Tooltip
                    content={
                      <HStack gap={2} vAlign="center">
                        <Text type="supporting" color="inherit">
                          {isPlaying ? 'Pause' : 'Play'}
                        </Text>
                        <Kbd keys="space" />
                      </HStack>
                    }>
                    <IconButton
                      label={isPlaying ? 'Pause' : 'Play'}
                      icon={
                        <Icon
                          icon={isPlaying ? PauseIcon : PlayIcon}
                          size="sm"
                          color="inherit"
                        />
                      }
                      variant="secondary"
                      size="sm"
                      style={tapTargetStyle}
                      onClick={() => setIsPlaying(prev => !prev)}
                    />
                  </Tooltip>
                  <IconButton
                    label="Step forward one frame"
                    tooltip="Forward 1 frame"
                    icon={
                      <Icon icon={StepForwardIcon} size="sm" color="inherit" />
                    }
                    variant="ghost"
                    size="sm"
                    style={tapTargetStyle}
                    isDisabled={playheadSec >= DURATION_SEC}
                    onClick={() => stepFrames(1)}
                  />
                </>
              }
              centerContent={
                <Text type="supporting" hasTabularNumbers style={styles.timecode}>
                  {formatTimecode(playheadSec)}{' '}
                  <Text type="supporting" color="secondary" style={styles.timecode}>
                    / {formatTimecode(DURATION_SEC)}
                  </Text>
                </Text>
              }
              endContent={
                <Badge
                  label={isPlaying ? 'Playing' : 'Paused'}
                  variant={isPlaying ? 'info' : 'neutral'}
                />
              }
            />
          </VStack>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Properties panel (300px, collapsible) -----
  const propertiesPanel =
    isPanelOpen && !isNarrow ? (
      <LayoutPanel width={300} padding={0} hasDivider label="Clip properties">
        <PropertiesPanel
          selected={selected}
          adjust={selected != null ? adjustFor(selected) : null}
          onAdjust={patchSelected}
        />
      </LayoutPanel>
    ) : undefined;

  // ----- Timeline dock (280px) -----
  const dock = (
    <LayoutFooter hasDivider height={DOCK_H} padding={0} label="Timeline">
      <div style={styles.dock}>
        <Toolbar
          label="Timeline controls"
          size="sm"
          gap={1}
          dividers={['bottom']}
          startContent={
            <>
              <Text type="body" weight="semibold">
                Timeline
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {TRACKS.length} tracks · {ALL_CLIPS.length} clips
              </Text>
            </>
          }
          endContent={
            <>
              <ToggleButton
                label="Snap to seconds"
                size="sm"
                isIconOnly
                isPressed={snapEnabled}
                onPressedChange={setSnapEnabled}
                style={tapTargetStyle}
                tooltip={snapEnabled ? 'Snapping on' : 'Snapping off'}
                icon={<Icon icon={MagnetIcon} size="sm" color="inherit" />}
              />
              <SegmentedControl
                value={zoom}
                onChange={v => setZoom(v as ZoomPreset)}
                label="Timeline zoom"
                size="sm">
                <SegmentedControlItem value="50" label="50%" />
                <SegmentedControlItem value="100" label="100%" />
                <SegmentedControlItem value="200" label="200%" />
              </SegmentedControl>
            </>
          }
        />
        <div style={styles.dockBody}>
          {/* Fixed lane header column (120px, 148px compact) — never
              scrolls. */}
          <div style={{...styles.laneHeaderCol, width: laneHeaderW}}>
            <div style={styles.laneHeaderTop}>
              <Text type="supporting" color="secondary">
                {pxPerSec} px/s
              </Text>
            </div>
            {TRACKS.map(track => (
              <LaneHeader
                key={track.id}
                track={track}
                isMuted={mutedTracks[track.id]}
                isLocked={lockedTracks[track.id]}
                isCompact={isCompact}
                onMuteChange={isPressed =>
                  setMutedTracks(prev => ({...prev, [track.id]: isPressed}))
                }
                onLockChange={isPressed =>
                  setLockedTracks(prev => ({...prev, [track.id]: isPressed}))
                }
              />
            ))}
          </div>
          {/* Horizontally scrolling lane canvas; ruler, slider, clips, and
              playhead share one px-per-second scale. */}
          <div style={styles.laneCanvasScroll}>
            <div style={{...styles.laneCanvas, width: canvasWidth}}>
              <TimeRuler
                pxPerSec={pxPerSec}
                tickInterval={TICK_INTERVAL_SEC[zoom]}
                onScrub={scrubTo}
              />
              <div style={styles.scrubRow}>
                <Slider
                  label="Playhead position"
                  isLabelHidden
                  value={playheadSec}
                  min={0}
                  max={DURATION_SEC}
                  step={snapEnabled ? 1 : 1 / FPS}
                  valueDisplay="none"
                  width={canvasWidth}
                  onChange={(v: number) => {
                    setIsPlaying(false);
                    setPlayheadSec(clampSec(v));
                  }}
                />
              </div>
              {TRACKS.map(track => (
                <div
                  key={track.id}
                  style={{
                    ...styles.lane,
                    opacity: mutedTracks[track.id] ? 0.4 : 1,
                  }}>
                  {track.clips.map(c => (
                    <ClipBlock
                      key={c.id}
                      entry={{clip: c, track}}
                      pxPerSec={pxPerSec}
                      isSelected={c.id === selectedClipId}
                      isTrackLocked={lockedTracks[track.id]}
                      onSelect={selectClip}
                    />
                  ))}
                </div>
              ))}
              {/* Full-height red playhead line with a top cap marker. */}
              <div
                style={{...styles.playhead, left: playheadSec * pxPerSec - 1}}
                aria-hidden>
                <div style={styles.playheadCap} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutFooter>
  );

  return (
    <Layout
      height="fill"
      header={header}
      start={toolRail}
      content={monitor}
      end={propertiesPanel}
      footer={dock}
    />
  );
}
`;export{e as default};