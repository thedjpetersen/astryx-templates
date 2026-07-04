var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 168-second, 24fps documentary
 *   sequence 'harbor-light_rough-cut_v7': nine V1 picture clips, four V2
 *   overlay/title clips, four A1 dialog clips and three A2 music/ambience
 *   clips — audio clips carry seeded deterministic waveform arrays; four
 *   named sequence markers; per-clip opacity/speed/gain defaults)
 * @output Flagship NLE editing workspace for the documentary 'Harbor Light':
 *   a project header (title, Documentary + Auto-saved Badges, sequence
 *   duration/fps readout, primary Export Button), a slim 56px left tool rail
 *   of vertical IconButtons with Tooltip+Kbd shortcuts (select, razor
 *   SplitIcon, slip MoveHorizontalIcon, zoom), a center program monitor
 *   (16:9 scheme-locked dark gradient stage labeled 'Program:
 *   harbor-light_rough-cut_v7' with safe-area frame, active-clip + overlay
 *   readout, inset progress rail), a transport Toolbar (skip to start/end,
 *   frame step, Play/Pause, mono 00:00:21:12 timecode), a selected-clip mini
 *   inspector strip (track Badge, clip name, In/Out/Duration timecodes,
 *   opacity Slider, speed NumberInput, gain Slider) — and the defining
 *   region: a fixed 320px bottom timeline dock where a tick-labeled ruler
 *   with colored sequence markers, a snapping full-height red playhead, and
 *   four track lanes (V2 overlays, V1 picture, A1 dialog, A2 music) share
 *   one px-per-second scale; clip blocks carry ellipsized labels, accent
 *   trim handles on the selected clip, and deterministic CSS waveform bars
 *   on audio lanes; 148px track headers hold lock plus video-visibility
 *   EyeIcon or audio mute/solo HeadphonesIcon ToggleButtons, with snap
 *   MagnetIcon and a 50/100/200% zoom SegmentedControl in the dock toolbar
 * @position Page template; emitted by \`astryx template video-editor-workspace\`
 *
 * Frame: root 100dvh div wrapping Layout height="fill", zero page scroll.
 * LayoutHeader carries the project chrome. Middle band: LayoutPanel start 56
 * (tool rail, fixed), LayoutContent (program monitor backdrop that flexes,
 * then the transport row and the mini inspector strip pinned to its bottom
 * edge). LayoutFooter height 320 hosts the timeline dock: a 148px track
 * header column stays fixed while the lane canvas scrolls horizontally; the
 * ruler, markers, scrub Slider, clip blocks, trim handles, and red playhead
 * all derive from one px-per-second scale so zoom recomputes every width
 * together, and snapping pulls the playhead to clip boundaries and markers
 * within 0.75s. The full-workspace multi-track surface — choose over
 * video-clip-timeline when the brief asks for the complete editing cockpit
 * (solo/visibility per track, trim handles, sequence markers, inline
 * inspector strip) rather than a side properties panel.
 *
 * Responsive contract:
 * - >960px: header | rail 56 | monitor + transport + inspector strip (fill)
 *   | dock 320.
 * - <=960px: the inspector strip wraps its control cluster onto a second
 *   row (flexWrap) and the header drops the secondary Render queue Button
 *   (Export stays); rail and dock keep their fixed sizes.
 * - <=768px: the header hides the sequence duration/fps readout; transport,
 *   snap, and track-header toggles grow to 40px touch targets (icon glyphs
 *   stay "sm") and track headers widen to 172px to hold the bigger toggles.
 * - The header row wraps (flexWrap) instead of clipping — the title cluster
 *   holds the first row and the Export cluster flows onto a second row at
 *   phone widths.
 * - The lane canvas scrolls horizontally at every width — at 200% zoom the
 *   168s sequence is 2688px wide by design; track headers never scroll.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels
 * everywhere; no Cards — the mini inspector is a bordered strip, and the
 * monitor stage and timeline lanes are styled divs (CSS gradients and
 * fixture-driven bars, never <video> or network media).
 *
 * Color policy: the program monitor stage is deliberately scheme-locked
 * dark (colorScheme: 'dark' in \`styles.stage\`) — it stands in for a video
 * program feed, which stays dark in both schemes, so its gradient, slate
 * label/scrim values, and red progress fill are intentional literals.
 * Every other color is a var(--color-*) token or an explicit light-dark()
 * pair: track tints, clip borders, waveform bars, and sequence-marker chips
 * keep their exact light values and shift to the lighter 400-weight hues on
 * dark; the red timeline playhead flips #EF4444 -> #F87171.
 */

import {useState, type CSSProperties, type MouseEvent} from 'react';

import {
  EyeIcon,
  EyeOffIcon,
  FilmIcon,
  HeadphonesIcon,
  LockIcon,
  LockOpenIcon,
  MagnetIcon,
  MousePointerIcon,
  MoveHorizontalIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SplitIcon,
  StepBackIcon,
  StepForwardIcon,
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

const PROJECT_NAME = 'Harbor Light';
const SEQUENCE_NAME = 'harbor-light_rough-cut_v7';
const FPS = 24;
const DURATION_SEC = 168; // 00:02:48:00 at 24fps
const INITIAL_PLAYHEAD_SEC = 21.5; // 00:00:21:12
const INITIAL_SELECTED_CLIP = 'v1-2'; // interview_marta_A.mov

type ZoomPreset = '50' | '100' | '200';
const ZOOM_ORDER: ZoomPreset[] = ['50', '100', '200'];
/** Shared px-per-second scale: ruler ticks, markers, clip widths, trim
 * handles, and the playhead all derive from this one number, so zoom keeps
 * everything registered. */
const PX_PER_SEC: Record<ZoomPreset, number> = {'50': 4, '100': 8, '200': 16};
const TICK_INTERVAL_SEC: Record<ZoomPreset, number> = {'50': 10, '100': 5, '200': 2};

/** Snapping pulls the playhead to the nearest clip boundary or sequence
 * marker when the scrub lands within this many seconds of one. */
const SNAP_THRESHOLD_SEC = 0.75;

const MONO = 'var(--font-family-code, monospace)';

// Dock geometry: 148px track headers, ruler + scrub rows, 54px lanes.
const TRACK_HEADER_W = 148;
// <=768px: track headers widen so the label still fits beside up to three
// 40px touch-target toggles.
const TRACK_HEADER_W_COMPACT = 172;
const RULER_H = 26;
const SCRUB_H = 26;
const LANE_H = 54;
const DOCK_H = 320;
const INSPECTOR_H = 72;

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

/** Seconds -> short ruler label, e.g. 95 -> "1:35". */
function formatRulerLabel(sec: number): string {
  return \`\${Math.floor(sec / 60)}:\${String(sec % 60).padStart(2, '0')}\`;
}

const clampSec = (sec: number) => Math.min(DURATION_SEC, Math.max(0, sec));

/** Deterministic waveform bars (heights in %): a fixed harmonic blend per
 * seed — pure math, no clocks, no randomness, identical every render. */
function wavePattern(seed: number, count: number, base: number, span: number) {
  const bars: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const a = Math.abs(Math.sin(i * 0.83 + seed * 1.7));
    const b = Math.abs(Math.sin(i * 0.31 + seed * 0.9));
    bars.push(Math.round(base + span * (0.62 * a + 0.38 * b)));
  }
  return bars;
}

// ============= FIXTURES =============
// Fixed clip in/out points, markers, and seeded waveforms — deterministic.

type TrackId = 'v2' | 'v1' | 'a1' | 'a2';
type ToolId = 'select' | 'razor' | 'slip' | 'zoom';

interface TimelineClip {
  id: string;
  name: string;
  start: number; // seconds on the sequence
  end: number;
  opacity: number; // % default (video)
  speed: number; // playback rate default (video)
  gainDb: number; // audio gain default
  wave?: number[]; // deterministic waveform bars (audio)
}

interface Track {
  id: TrackId;
  label: string;
  caption: string;
  kind: 'video' | 'audio';
  blockBg: string;
  blockBorder: string;
  waveColor?: string;
  clips: TimelineClip[];
}

const vClip = (
  id: string,
  name: string,
  start: number,
  end: number,
): TimelineClip => ({id, name, start, end, opacity: 100, speed: 1, gainDb: 0});

const aClip = (
  id: string,
  name: string,
  start: number,
  end: number,
  gainDb: number,
  seed: number,
  base: number,
  span: number,
): TimelineClip => ({
  id,
  name,
  start,
  end,
  opacity: 100,
  speed: 1,
  gainDb,
  wave: wavePattern(seed, Math.max(10, Math.round((end - start) * 0.6)), base, span),
});

const TRACKS: Track[] = [
  {
    id: 'v2',
    label: 'V2',
    caption: 'Overlays',
    kind: 'video',
    blockBg: 'light-dark(rgba(168, 85, 247, 0.24), rgba(192, 132, 252, 0.28))',
    blockBorder: 'light-dark(#A855F7, #C084FC)',
    clips: [
      vClip('v2-1', 'Title: Harbor Light', 4, 11),
      vClip('v2-2', 'Lower third: Marta Voss — Harbormaster', 16, 23),
      vClip('v2-3', 'Archival card: Pelican Cove, 1962', 49, 56),
      vClip('v2-4', 'Lower third: Ezra Lund — Boat builder', 116, 123),
    ],
  },
  {
    id: 'v1',
    label: 'V1',
    caption: 'Picture',
    kind: 'video',
    blockBg: 'light-dark(rgba(59, 130, 246, 0.26), rgba(96, 165, 250, 0.3))',
    blockBorder: 'light-dark(#3B82F6, #60A5FA)',
    clips: [
      vClip('v1-1', 'harbor_dawn_wide.mov', 0, 14),
      vClip('v1-2', 'interview_marta_A.mov', 14, 36),
      vClip('v1-3', 'fishmarket_handheld.mov', 36, 47),
      vClip('v1-4', 'archival_1962_storm.mp4', 47, 68),
      vClip('v1-5', 'interview_marta_B.mov', 68, 92),
      vClip('v1-6', 'boats_return_tele.mov', 92, 114),
      vClip('v1-7', 'interview_ezra_A.mov', 114, 139),
      vClip('v1-8', 'lighthouse_dusk.mov', 139, 158),
      vClip('v1-9', 'end_slate_credits.mov', 158, 168),
    ],
  },
  {
    id: 'a1',
    label: 'A1',
    caption: 'Dialog',
    kind: 'audio',
    blockBg: 'light-dark(rgba(34, 197, 94, 0.18), rgba(74, 222, 128, 0.22))',
    blockBorder: 'light-dark(#22C55E, #4ADE80)',
    waveColor: 'light-dark(rgba(34, 197, 94, 0.75), rgba(74, 222, 128, 0.8))',
    clips: [
      aClip('a1-1', 'marta_int_A_lav.wav', 14, 36, 0, 3, 40, 44),
      aClip('a1-2', 'storm_vo_narration.wav', 47, 68, -2, 7, 44, 40),
      aClip('a1-3', 'marta_int_B_lav.wav', 68, 92, 0, 11, 40, 44),
      aClip('a1-4', 'ezra_int_A_boom.wav', 114, 139, -1, 5, 42, 42),
    ],
  },
  {
    id: 'a2',
    label: 'A2',
    caption: 'Music & amb',
    kind: 'audio',
    blockBg: 'light-dark(rgba(20, 184, 166, 0.16), rgba(45, 212, 191, 0.2))',
    blockBorder: 'light-dark(#14B8A6, #2DD4BF)',
    waveColor: 'light-dark(rgba(20, 184, 166, 0.7), rgba(45, 212, 191, 0.75))',
    clips: [
      aClip('a2-1', 'ambience_harbor_dawn.wav', 0, 36, -8, 13, 26, 28),
      aClip('a2-2', 'score_tides_theme.wav', 36, 120, -14, 17, 30, 30),
      aClip('a2-3', 'score_last_light.wav', 120, 168, -12, 19, 28, 32),
    ],
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

/** Named sequence markers rendered as colored chips on the ruler; snapping
 * targets include these alongside clip boundaries. Colors reuse the repo
 * data-viz categorical tokens with their standard literal fallbacks. */
interface SequenceMarker {
  sec: number;
  label: string;
  color: string;
}

const MARKERS: SequenceMarker[] = [
  {
    sec: 11,
    label: 'Cold open out',
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  {
    sec: 47,
    label: 'Storm archival in',
    color: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  },
  {
    sec: 114,
    label: 'Second interview',
    color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  },
  {
    sec: 158,
    label: 'Credits start',
    color: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  },
];

/** Every clip boundary plus every marker, sorted — the snap target list. */
const SNAP_POINTS: number[] = [
  ...new Set([
    0,
    DURATION_SEC,
    ...ALL_CLIPS.flatMap(({clip: c}) => [c.start, c.end]),
    ...MARKERS.map(m => m.sec),
  ]),
].sort((a, b) => a - b);

const TOOLS: {id: ToolId; label: string; keys: string; icon: typeof SplitIcon}[] =
  [
    {id: 'select', label: 'Select', keys: 'v', icon: MousePointerIcon},
    {id: 'razor', label: 'Razor', keys: 'c', icon: SplitIcon},
    {id: 'slip', label: 'Slip', keys: 'y', icon: MoveHorizontalIcon},
    {id: 'zoom', label: 'Zoom', keys: 'z', icon: ZoomInIcon},
  ];

/** Per-clip editable state; edits in the inspector strip write back here. */
interface ClipAdjust {
  opacity: number;
  speed: number;
  gainDb: number;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Demo stages render templates at auto height; the root div restores a
  // real viewport so Layout height="fill" and the fixed dock behave.
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping — the title
  // cluster plus Export never share one cramped row at phone widths.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // <=768px: grow transport/snap/track toggles to 40px touch targets (the
  // "sm" 28px box is fine for pointers but too small for thumbs); icon
  // glyphs stay "sm" so the rows read the same, just with more padding.
  tapTarget: {width: 40, height: 40},
  // Tool rail: 56px panel, buttons stacked with 4px breathing room.
  rail: {padding: 'var(--spacing-1)', alignItems: 'center'},
  // Program monitor: muted backdrop centering the stage column; the
  // transport row and inspector strip pin below it inside LayoutContent.
  contentCol: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  monitorBackdrop: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
  },
  monitorColumn: {
    width: '100%',
    // Stage width derives from viewport height so the 16:9 stage plus the
    // transport row always clear the inspector strip and timeline dock at
    // the 900px review height (100dvh minus fixed chrome: header 66 +
    // inspector 72 + dock 321 + backdrop padding 40 + transport row 36).
    // Below ~760px tall the backdrop's overflowY: auto is the fallback.
    maxWidth: 'clamp(360px, (100dvh - 545px) * 16 / 9, 820px)',
    marginInline: 'auto',
    marginBlock: 'auto',
  },
  // 16:9 gradient stage — a styled div stands in for the program feed.
  // Scheme-locked dark (see the header Color policy): a program monitor
  // stays dark in both schemes, so this gradient and every color rendered
  // on top of it (label, safe-area frame, readouts, progress bar) are
  // deliberate literals, not tokens.
  stage: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    background:
      'linear-gradient(150deg, #2B3A52 0%, #16213A 48%, #0B1120 100%)',
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
  stageTimecode: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    color: 'rgba(226, 232, 240, 0.75)',
  },
  // Fixed-pixel inset keeps the dashed frame's margins even on all sides
  // (percentage insets resolve against width and height separately).
  stageSafeArea: {
    position: 'absolute',
    inset: 26,
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
  stageOverlayChip: {
    fontFamily: MONO,
    fontSize: 11,
    color: 'rgba(216, 180, 254, 0.9)',
    border: '1px solid rgba(216, 180, 254, 0.35)',
    borderRadius: 999,
    paddingInline: 10,
    paddingBlock: 2,
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
  // Mini inspector strip: one bordered row pinned above the timeline dock.
  inspectorStrip: {
    minHeight: INSPECTOR_H,
    borderTop: 'var(--border-width) solid var(--color-border)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    display: 'flex',
    alignItems: 'center',
  },
  inspectorRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)', width: '100%'},
  inspectorDividerBox: {alignSelf: 'stretch', display: 'flex'},
  // Sliders reserve their own horizontal padding so a thumb at 0 never
  // overlaps the adjacent timecode/label text. Readouts are rendered as
  // separate gap-separated Text (not valueDisplay="text") because the
  // built-in text display sits flush against the track and the thumb at
  // max position covers it (same workaround as storefront-browse.tsx).
  inspectorSlider: {width: 160, paddingInline: 'var(--spacing-1)'},
  sliderReadout: {
    fontFamily: MONO,
    fontVariantNumeric: 'tabular-nums',
    minWidth: 44,
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  // Timeline dock scaffolding.
  dock: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  dockBody: {flex: 1, minHeight: 0, display: 'flex'},
  trackHeaderCol: {
    width: TRACK_HEADER_W,
    flexShrink: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    flexDirection: 'column',
  },
  trackHeaderTop: {
    height: RULER_H + SCRUB_H,
    display: 'flex',
    alignItems: 'center',
    paddingInline: 'var(--spacing-2)',
  },
  trackHeaderCell: {
    height: LANE_H,
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    // Matches trackHeaderTop so track labels align with the px/s readout.
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
  // Sequence marker chip: a small flag anchored to the ruler baseline.
  markerChip: {
    position: 'absolute',
    bottom: 0,
    width: 8,
    height: 12,
    borderRadius: '2px 2px 2px 0',
    transform: 'translateX(-1px)',
    pointerEvents: 'none',
  },
  scrubRow: {height: SCRUB_H, display: 'flex', alignItems: 'center'},
  lane: {
    position: 'relative',
    height: LANE_H,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  clipBlock: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    // Short overlay clips keep enough width for a recognizable label.
    minWidth: 56,
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
    top: 3,
    left: 10,
    right: 10,
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
  clipDuration: {
    position: 'absolute',
    left: 10,
    bottom: 3,
    fontFamily: MONO,
    fontSize: 9,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    pointerEvents: 'none',
    zIndex: 3,
  },
  // Trim handles: accent grips on the selected clip's in/out edges — the
  // visual affordance for ripple trims (static in this fixture-driven demo).
  trimHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 7,
    backgroundColor: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
    pointerEvents: 'none',
  },
  trimGrip: {
    width: 1,
    height: 12,
    backgroundColor: 'light-dark(rgba(255,255,255,0.85), rgba(15,23,42,0.7))',
  },
  waveRow: {
    position: 'absolute',
    inset: '18px 4px 4px 4px',
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
    backgroundColor: 'light-dark(#EF4444, #F87171)',
    pointerEvents: 'none',
    zIndex: 2,
  },
  playheadCap: {
    position: 'absolute',
    // Sits in the ruler's lower (tick) band, apex on the ruler baseline —
    // below the label row so it never covers the tick label it crosses.
    top: RULER_H - 10,
    left: -4,
    width: 10,
    height: 10,
    backgroundColor: 'light-dark(#EF4444, #F87171)',
    clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
  },
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
      {MARKERS.map(m => (
        <span
          key={m.sec}
          title={\`\${m.label} · \${formatTimecode(m.sec)}\`}
          style={{
            ...styles.markerChip,
            left: m.sec * pxPerSec,
            backgroundColor: m.color,
          }}
        />
      ))}
    </div>
  );
}

/** One clip block; width/left derive from the shared px-per-second scale.
 * The selected clip grows accent trim handles on its in/out edges. */
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
  const durationSec = c.end - c.start;
  // Blocks show the name without its "Title:"/"Lower third:" role prefix so
  // narrow overlay clips still surface a recognizable word; the inspector
  // strip and aria-label keep the full fixture name.
  const displayName = c.name.includes(': ')
    ? c.name.slice(c.name.indexOf(': ') + 2)
    : c.name;
  const blockStyle: CSSProperties = {
    ...styles.clipBlock,
    left: c.start * pxPerSec,
    width: durationSec * pxPerSec,
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
      {track.kind === 'video' && (
        <span style={styles.clipDuration}>{durationSec.toFixed(0)}s</span>
      )}
      {c.wave != null && (
        <span style={styles.waveRow} aria-hidden>
          {c.wave.map((v, i) => (
            <span
              // Fixed deterministic array — index keys are stable.
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
      {isSelected && (
        <>
          <span style={{...styles.trimHandle, left: 0}} aria-hidden>
            <span style={styles.trimGrip} />
          </span>
          <span style={{...styles.trimHandle, right: 0}} aria-hidden>
            <span style={styles.trimGrip} />
          </span>
        </>
      )}
    </button>
  );
}

/** Track header (148px, 172px compact): label + caption tooltip, lock
 * toggle, then visibility (video) or mute + solo (audio) — 40px touch
 * targets when isCompact. */
function TrackHeader({
  track,
  isMuted,
  isLocked,
  isSolo,
  isCompact,
  onMuteChange,
  onLockChange,
  onSoloChange,
}: {
  track: Track;
  isMuted: boolean;
  isLocked: boolean;
  isSolo: boolean;
  isCompact: boolean;
  onMuteChange: (isPressed: boolean) => void;
  onLockChange: (isPressed: boolean) => void;
  onSoloChange: (isPressed: boolean) => void;
}) {
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  const isVideo = track.kind === 'video';
  return (
    <div style={styles.trackHeaderCell}>
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
        label={\`Lock \${track.label}\`}
        size="sm"
        isIconOnly
        isPressed={isLocked}
        onPressedChange={onLockChange}
        style={tapTargetStyle}
        icon={<Icon icon={LockOpenIcon} size="sm" color="inherit" />}
        pressedIcon={<Icon icon={LockIcon} size="sm" color="inherit" />}
      />
      {isVideo ? (
        <ToggleButton
          label={\`Hide \${track.label}\`}
          size="sm"
          isIconOnly
          isPressed={isMuted}
          onPressedChange={onMuteChange}
          style={tapTargetStyle}
          icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
          pressedIcon={<Icon icon={EyeOffIcon} size="sm" color="inherit" />}
        />
      ) : (
        <>
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
            label={\`Solo \${track.label}\`}
            size="sm"
            isIconOnly
            isPressed={isSolo}
            onPressedChange={onSoloChange}
            style={tapTargetStyle}
            tooltip={isSolo ? 'Solo on' : 'Solo'}
            icon={<Icon icon={HeadphonesIcon} size="sm" color="inherit" />}
          />
        </>
      )}
    </div>
  );
}

// ============= MINI INSPECTOR STRIP =============

/** Slim inspector strip pinned above the timeline dock; binds to the
 * selected clip and writes edits back through onAdjust. */
function InspectorStrip({
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
      <div style={styles.inspectorStrip}>
        <HStack gap={2} vAlign="center" style={styles.inspectorRow}>
          <Text type="body" weight="semibold">
            No clip selected
          </Text>
          <Text type="supporting" color="secondary">
            Click a block on the timeline to inspect and edit it here.
          </Text>
        </HStack>
      </div>
    );
  }
  const {clip: c, track} = selected;
  const isAudio = track.kind === 'audio';
  return (
    <div style={styles.inspectorStrip}>
      <HStack gap={3} vAlign="center" style={styles.inspectorRow}>
        <Badge label={track.label} variant="neutral" />
        <VStack gap={0}>
          <Text type="body" weight="semibold" maxLines={1} style={styles.mono}>
            {c.name}
          </Text>
          <Text type="supporting" color="secondary">
            {track.caption} · {(c.end - c.start).toFixed(0)}s
          </Text>
        </VStack>
        <div style={styles.inspectorDividerBox}>
          <Divider orientation="vertical" />
        </div>
        {/* Wider gap than the strip's base gap so the 11-char timecode
            values read as three distinct columns, not one run-on string. */}
        <HStack gap={5} vAlign="center">
          <VStack gap={0}>
            <Text type="label" color="secondary">
              In
            </Text>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatTimecode(c.start)}
            </Text>
          </VStack>
          <VStack gap={0}>
            <Text type="label" color="secondary">
              Out
            </Text>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatTimecode(c.end)}
            </Text>
          </VStack>
          <VStack gap={0}>
            <Text type="label" color="secondary">
              Duration
            </Text>
            <Text type="supporting" hasTabularNumbers style={styles.mono}>
              {formatTimecode(c.end - c.start)}
            </Text>
          </VStack>
        </HStack>
        <div style={styles.inspectorDividerBox}>
          <Divider orientation="vertical" />
        </div>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" style={styles.inspectorRow}>
            {!isAudio && (
              <div style={styles.inspectorSlider}>
                <HStack gap={2} vAlign="end">
                  <StackItem size="fill">
                    <Slider
                      label="Opacity"
                      value={adjust.opacity}
                      min={0}
                      max={100}
                      step={1}
                      valueDisplay="none"
                      formatValue={v => \`\${v}%\`}
                      width="100%"
                      onChange={(v: number) => onAdjust({opacity: v})}
                    />
                  </StackItem>
                  <Text
                    type="supporting"
                    hasTabularNumbers
                    style={styles.sliderReadout}>
                    {adjust.opacity}%
                  </Text>
                </HStack>
              </div>
            )}
            {!isAudio && (
              <NumberInput
                label="Speed"
                value={adjust.speed}
                min={0.25}
                max={4}
                step={0.25}
                units="×"
                size="sm"
                // Narrow pill keeps the × unit tight against the value
                // ("1 ×") instead of floating at a far edge where it reads
                // as a clear button; 68px still fits the widest value 0.25.
                width={68}
                onChange={v => onAdjust({speed: v})}
              />
            )}
            <div style={styles.inspectorSlider}>
              <HStack gap={2} vAlign="end">
                <StackItem size="fill">
                  <Slider
                    label="Gain"
                    value={adjust.gainDb}
                    min={-24}
                    max={12}
                    step={1}
                    valueDisplay="none"
                    formatValue={v => \`\${v > 0 ? '+' : ''}\${v} dB\`}
                    width="100%"
                    onChange={(v: number) => onAdjust({gainDb: v})}
                  />
                </StackItem>
                <Text
                  type="supporting"
                  hasTabularNumbers
                  style={styles.sliderReadout}>
                  {adjust.gainDb > 0 ? '+' : ''}
                  {adjust.gainDb} dB
                </Text>
              </HStack>
            </div>
          </HStack>
        </StackItem>
      </HStack>
    </div>
  );
}

// ============= PAGE =============

export default function VideoEditorWorkspaceTemplate() {
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedClipId, setSelectedClipId] = useState<string | null>(
    INITIAL_SELECTED_CLIP,
  );
  const [playheadSec, setPlayheadSec] = useState(INITIAL_PLAYHEAD_SEC);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState<ZoomPreset>('100');
  const [snapEnabled, setSnapEnabled] = useState(true);
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
  // Solo applies to audio tracks only; soloing any track sidelines the
  // other audio lanes (they dim like muted lanes) until solo clears.
  const [soloTracks, setSoloTracks] = useState<Record<TrackId, boolean>>({
    v2: false,
    v1: false,
    a1: false,
    a2: false,
  });
  // Inspector edits write back per clip id; unedited clips fall through to
  // their fixture defaults (opacity 100 / speed 1.0 / fixture gain).
  const [clipAdjusts, setClipAdjusts] = useState<Record<string, ClipAdjust>>({});

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // 40px hit areas for the thumb-driven controls at phone widths.
  const tapTargetStyle = isCompact ? styles.tapTarget : undefined;
  const trackHeaderW = isCompact ? TRACK_HEADER_W_COMPACT : TRACK_HEADER_W;

  const pxPerSec = PX_PER_SEC[zoom];
  const canvasWidth = DURATION_SEC * pxPerSec;
  const zoomIndex = ZOOM_ORDER.indexOf(zoom);

  const selected = findClip(selectedClipId);
  const adjustFor = (entry: ClipWithTrack): ClipAdjust =>
    clipAdjusts[entry.clip.id] ?? {
      opacity: entry.clip.opacity,
      speed: entry.clip.speed,
      gainDb: entry.clip.gainDb,
    };
  const patchSelected = (patch: Partial<ClipAdjust>) => {
    if (selected == null) {
      return;
    }
    const current = adjustFor(selected);
    setClipAdjusts(prev => ({
      ...prev,
      [selected.clip.id]: {...current, ...patch},
    }));
  };

  /** Ruler scrubs snap to the nearest clip boundary or marker when snapping
   * is on and one sits within SNAP_THRESHOLD_SEC; otherwise frame-quantize. */
  const scrubTo = (sec: number) => {
    setIsPlaying(false);
    const clamped = clampSec(sec);
    if (snapEnabled) {
      let nearest = SNAP_POINTS[0];
      for (const point of SNAP_POINTS) {
        if (Math.abs(point - clamped) < Math.abs(nearest - clamped)) {
          nearest = point;
        }
      }
      if (Math.abs(nearest - clamped) <= SNAP_THRESHOLD_SEC) {
        setPlayheadSec(nearest);
        return;
      }
    }
    setPlayheadSec(Math.round(clamped * FPS) / FPS);
  };
  const stepFrames = (delta: number) => {
    setIsPlaying(false);
    setPlayheadSec(prev => clampSec(prev + delta / FPS));
  };
  const jumpTo = (sec: number) => {
    setIsPlaying(false);
    setPlayheadSec(clampSec(sec));
  };

  // Program feed: the V1 clip under the playhead (when V1 is visible) plus
  // any active V2 overlay (when V2 is visible).
  const v1Track = TRACKS.find(t => t.id === 'v1');
  const v2Track = TRACKS.find(t => t.id === 'v2');
  const programClip = mutedTracks.v1
    ? null
    : (v1Track?.clips.find(
        c => playheadSec >= c.start && playheadSec < c.end,
      ) ?? null);
  const overlayClip = mutedTracks.v2
    ? null
    : (v2Track?.clips.find(
        c => playheadSec >= c.start && playheadSec < c.end,
      ) ?? null);

  const anySolo = soloTracks.a1 || soloTracks.a2;
  /** A lane dims when muted/hidden, or (audio) sidelined by another solo. */
  const isLaneDimmed = (track: Track) => {
    if (mutedTracks[track.id]) {
      return true;
    }
    return track.kind === 'audio' && anySolo && !soloTracks[track.id];
  };

  const selectClip = (clipId: string) => {
    setSelectedClipId(prev => (prev === clipId ? null : clipId));
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={FilmIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Documentary" variant="neutral" />
            <Badge label="Auto-saved" variant="success" />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {SEQUENCE_NAME} · 00:02:48:00 · {FPS} fps
              </Text>
            )}
          </HStack>
        </StackItem>
        {!isCompact && (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {MARKERS.length} markers · {ALL_CLIPS.length} clips
          </Text>
        )}
        {!isNarrow && (
          <Button
            label="Render queue"
            variant="ghost"
            size="sm"
            onClick={() => {}}
          />
        )}
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
              // Primary fill for the active tool — the secondary treatment
              // was too faint against the light rail to read as selected.
              variant={activeTool === tool.id ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setActiveTool(tool.id)}
            />
          </Tooltip>
        ))}
      </VStack>
    </LayoutPanel>
  );

  // ----- Program monitor + transport + inspector strip -----
  const progressPct = (playheadSec / DURATION_SEC) * 100;
  const monitor = (
    <LayoutContent padding={0}>
      <div style={styles.contentCol}>
        <div style={styles.monitorBackdrop}>
          <div style={styles.monitorColumn}>
            <VStack gap={2}>
              <div style={styles.stage}>
                <span style={styles.stageLabel}>Program: {SEQUENCE_NAME}</span>
                <span style={styles.stageTimecode}>
                  {formatTimecode(playheadSec)}
                </span>
                <div style={styles.stageSafeArea} />
                <div style={styles.stageCenter}>
                  <span style={styles.stageClipName}>
                    {programClip != null ? programClip.name : '— black —'}
                  </span>
                  <span style={styles.stageClipMeta}>
                    {isPlaying ? 'PLAYING' : 'PAUSED'} · V1 · Rec.709 · {FPS}{' '}
                    fps
                  </span>
                  {overlayClip != null && (
                    <span style={styles.stageOverlayChip}>
                      V2 · {overlayClip.name}
                    </span>
                  )}
                </div>
                <div style={styles.stageProgressRail} aria-hidden>
                  <div
                    style={{
                      ...styles.stageProgressFill,
                      width: \`\${progressPct}%\`,
                    }}
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
                      label="Go to start"
                      tooltip="Go to start"
                      icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
                      variant="ghost"
                      size="sm"
                      style={tapTargetStyle}
                      isDisabled={playheadSec <= 0}
                      onClick={() => jumpTo(0)}
                    />
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
                      icon={<Icon icon={StepForwardIcon} size="sm" color="inherit" />}
                      variant="ghost"
                      size="sm"
                      style={tapTargetStyle}
                      isDisabled={playheadSec >= DURATION_SEC}
                      onClick={() => stepFrames(1)}
                    />
                    <IconButton
                      label="Go to end"
                      tooltip="Go to end"
                      icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
                      variant="ghost"
                      size="sm"
                      style={tapTargetStyle}
                      isDisabled={playheadSec >= DURATION_SEC}
                      onClick={() => jumpTo(DURATION_SEC)}
                    />
                  </>
                }
                centerContent={
                  <Text
                    type="supporting"
                    hasTabularNumbers
                    style={styles.timecode}>
                    {formatTimecode(playheadSec)}{' '}
                    <Text
                      type="supporting"
                      color="secondary"
                      style={styles.timecode}>
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
        <InspectorStrip
          selected={selected}
          adjust={selected != null ? adjustFor(selected) : null}
          onAdjust={patchSelected}
        />
      </div>
    </LayoutContent>
  );

  // ----- Timeline dock (320px) -----
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
                {TRACKS.length} tracks · {ALL_CLIPS.length} clips ·{' '}
                {MARKERS.length} markers
              </Text>
            </>
          }
          endContent={
            <>
              <ToggleButton
                label="Snap to edits and markers"
                size="sm"
                isIconOnly
                isPressed={snapEnabled}
                onPressedChange={setSnapEnabled}
                style={tapTargetStyle}
                tooltip={snapEnabled ? 'Snapping on' : 'Snapping off'}
                icon={<Icon icon={MagnetIcon} size="sm" color="inherit" />}
              />
              <IconButton
                label="Zoom out timeline"
                tooltip="Zoom out"
                icon={<Icon icon={ZoomOutIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                style={tapTargetStyle}
                isDisabled={zoomIndex === 0}
                onClick={() => setZoom(ZOOM_ORDER[Math.max(0, zoomIndex - 1)])}
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
              <IconButton
                label="Zoom in timeline"
                tooltip="Zoom in"
                icon={<Icon icon={ZoomInIcon} size="sm" color="inherit" />}
                variant="ghost"
                size="sm"
                style={tapTargetStyle}
                isDisabled={zoomIndex === ZOOM_ORDER.length - 1}
                onClick={() =>
                  setZoom(
                    ZOOM_ORDER[Math.min(ZOOM_ORDER.length - 1, zoomIndex + 1)],
                  )
                }
              />
            </>
          }
        />
        <div style={styles.dockBody}>
          {/* Fixed track header column (148px, 172px compact) — never
              scrolls. */}
          <div style={{...styles.trackHeaderCol, width: trackHeaderW}}>
            <div style={styles.trackHeaderTop}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {pxPerSec} px/s
              </Text>
            </div>
            {TRACKS.map(track => (
              <TrackHeader
                key={track.id}
                track={track}
                isMuted={mutedTracks[track.id]}
                isLocked={lockedTracks[track.id]}
                isSolo={soloTracks[track.id]}
                isCompact={isCompact}
                onMuteChange={isPressed =>
                  setMutedTracks(prev => ({...prev, [track.id]: isPressed}))
                }
                onLockChange={isPressed =>
                  setLockedTracks(prev => ({...prev, [track.id]: isPressed}))
                }
                onSoloChange={isPressed =>
                  setSoloTracks(prev => ({...prev, [track.id]: isPressed}))
                }
              />
            ))}
          </div>
          {/* Horizontally scrolling lane canvas; ruler, markers, slider,
              clips, trim handles, and playhead share one px-per-second
              scale. */}
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
                    opacity: isLaneDimmed(track) ? 0.4 : 1,
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
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={toolRail}
        content={monitor}
        footer={dock}
      />
    </div>
  );
}







`;export{e as default};