var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (seven clips from the 24fps documentary
 *   sequence 'harbor-light_fine-cut_v7' — five V1/V2 video clips, one title
 *   graphic, one A1 lav WAV — each carrying full source metadata (codec,
 *   container, color space, resolution, source fps, bit depth, start
 *   timecode, camera, reel), fixed speed-ramp point arrays, per-channel
 *   static peak levels, and per-clip transform/crop/composite/speed/audio
 *   attribute defaults; no clocks, no randomness, no network media)
 * @output NLE clip-inspector surface for the "Harbor Light" documentary: a
 *   52px header (project chrome, Saved Badge, copy/paste-attributes and
 *   reset-attributes Buttons), a 280px left clip-list panel grouped by track
 *   (tint chip, name, in/out timecodes, selection ring), a center inspector
 *   bound to the selected clip — title row with enable Switch, then
 *   a Video | Speed | Audio TabList: Video tab with Transform scrub-label
 *   NumberInput fields (Position X/Y, Scale, Rotation, Anchor X/Y — drag the
 *   ew-resize label to scrub), Crop L/R/T/B Sliders, blend-mode Selector and
 *   opacity Slider; Speed tab with reciprocal Speed %/Duration NumberInputs,
 *   reverse + ramp Switches, time-interpolation Selector, and an
 *   axis-labeled SVG speed-ramp mini graph; Audio tab with gain Slider,
 *   per-channel output-route Selectors over static peak meters, and a mute
 *   Switch — plus a 320px right panel holding a scheme-locked dark
 *   program-monitor thumbnail that live-applies transform/crop/opacity and
 *   a source metadata Card (codec, color space, timecode, camera)
 * @position Page template; emitted by \`astryx template video-editor-clip-inspector\`
 *
 * Frame: root 100dvh div wrapping Layout height="fill", zero page scroll.
 * LayoutHeader carries the project chrome. LayoutPanel start 280 lists the
 * sequence clips (its own scroll region). LayoutContent hosts the inspector
 * column (title row + TabList + scrolling tab body, max-width 640 centered).
 * LayoutPanel end 320 holds the monitor thumbnail and metadata card. The
 * defining region is the tabbed attribute editor whose numeric fields carry
 * scrub affordances and whose edits write straight into the monitor
 * thumbnail's CSS transform/clip-path. Choose over video-clip-timeline when
 * the user tunes one selected clip's attributes rather than arranging clips
 * on lanes; choose over subtitle-cue-editor when the object being edited is
 * a clip's transform/speed/audio, not timed text.
 *
 * Responsive contract:
 * - >1200px: header | clip list 280 | inspector (fill, max 640) | monitor
 *   panel 320.
 * - <=1200px: the right panel drops; the monitor thumbnail (240px) and
 *   metadata card reflow into a wrapping row pinned above the tabs so the
 *   live preview stays visible while editing.
 * - <=860px: the clip-list panel drops; a full-width clip Selector above
 *   the title row keeps selection reachable. Tab bodies stay single-column.
 * - The header row wraps (flexWrap) instead of clipping — the title cluster
 *   holds the first row and the copy/paste/reset cluster flows to a second
 *   row at phone widths.
 * - Crop/opacity/gain Sliders keep the panel's spacing-4 side padding so a
 *   thumb at 0 never overlaps its value text.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels; the
 * only Cards are the source-metadata summary and the paste-buffer notice —
 * genuine inspector widgets. The monitor thumbnail is a styled div with CSS
 * gradients, never <video> or network media.
 *
 * Color policy: the program-monitor thumbnail is deliberately scheme-locked
 * dark (colorScheme: 'dark' in \`styles.monitorStage\`) — it stands in for a
 * program feed that stays dark in both schemes, so its backdrop, checker
 * hatch, frame gradients, and slate label literals are intentional. Clip
 * tint chips and the speed-ramp stroke use data-viz categorical tokens with
 * repo-standard light-dark() fallbacks; every other color is a
 * var(--color-*) token.
 */

import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  AudioLinesIcon,
  ClapperboardIcon,
  ClipboardPasteIcon,
  CopyIcon,
  FilmIcon,
  GaugeIcon,
  RotateCcwIcon,
  TypeIcon,
  VideoIcon,
  VideoOffIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SEQUENCE CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const SEQUENCE_NAME = 'harbor-light_fine-cut_v7';
const FPS = 24;
const SEQUENCE_TC = '00:12:38:16';

const MONO = 'var(--font-family-code, monospace)';

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

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

// ============= FIXTURES =============
// Fixed clip fixtures — deterministic attributes, metadata, and ramp arrays.

type TrackLabel = 'V2' | 'V1' | 'A1';
type TabId = 'video' | 'speed' | 'audio';
type BlendMode =
  | 'normal'
  | 'darken'
  | 'multiply'
  | 'screen'
  | 'lighten'
  | 'overlay'
  | 'soft-light'
  | 'difference';
type ChannelRoute = 'left' | 'right' | 'center' | 'mute';
type TimeInterp = 'sampling' | 'blending' | 'optical-flow';

/** Every attribute the inspector edits; per-clip defaults live on fixtures
 * and edits write into a keyed overrides map. Position/anchor are px
 * offsets from frame center in 1920x1080 sequence space; crop is % per
 * edge; scale/opacity/speed are %; rotation is degrees. */
// prettier-ignore
interface ClipAttrs {
  isEnabled: boolean;
  posX: number; posY: number; scale: number; rotation: number;
  anchorX: number; anchorY: number;
  cropL: number; cropR: number; cropT: number; cropB: number;
  blendMode: BlendMode; opacity: number;
  speed: number; isReversed: boolean; isRampEnabled: boolean;
  timeInterp: TimeInterp;
  gainDb: number; ch1Route: ChannelRoute; ch2Route: ChannelRoute;
  isAudioMuted: boolean;
}

interface SourceMeta {
  codec: string;
  container: string;
  colorSpace: string;
  resolution: string;
  sourceFps: string;
  bitDepth: string;
  audio: string;
  startTc: string;
  camera: string;
  reel: string;
}

/** Speed-ramp keyframes: t is 0..1 across the clip, speed is %. */
type RampPoint = {t: number; speed: number};

// prettier-ignore
interface InspectorClip {
  id: string; name: string; track: TrackLabel;
  kind: 'video' | 'graphic' | 'audio';
  inSec: number; outSec: number; // sequence in/out
  baseDurationSec: number; // source span at 100% speed
  tint: string; // categorical token w/ repo-standard fallback
  stageGradient: string; // literals — rendered inside the locked-dark stage
  ch1PeakDb: number; ch2PeakDb: number; // static peaks for the meters
  meta: SourceMeta; ramp: RampPoint[]; defaults: ClipAttrs;
}

// prettier-ignore
const BASE_ATTRS: ClipAttrs = {
  isEnabled: true, posX: 0, posY: 0, scale: 100, rotation: 0, anchorX: 0,
  anchorY: 0, cropL: 0, cropR: 0, cropT: 0, cropB: 0, blendMode: 'normal',
  opacity: 100, speed: 100, isReversed: false, isRampEnabled: false,
  timeInterp: 'sampling', gainDb: 0, ch1Route: 'left', ch2Route: 'right',
  isAudioMuted: false,
};

const FLAT_RAMP: RampPoint[] = [{t: 0, speed: 100}, {t: 1, speed: 100}];

// Repo-standard categorical fallbacks (see calendar-month-grid.tsx).
const TINT_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const TINT_PURPLE =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const TINT_GREEN =
  'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const TINT_ORANGE =
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const TINT_TEAL =
  'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

/** Positional SourceMeta builder: codec, container, colorSpace, resolution,
 * sourceFps, bitDepth, audio, startTc, camera, reel. */
// prettier-ignore
const meta = (
  codec: string, container: string, colorSpace: string, resolution: string,
  sourceFps: string, bitDepth: string, audio: string, startTc: string,
  camera: string, reel: string,
): SourceMeta => ({
  codec, container, colorSpace, resolution, sourceFps, bitDepth, audio,
  startTc, camera, reel,
});

/** Positional clip builder: id, name, track, kind, sequence in/out (sec),
 * source span at 100% (sec), [ch1, ch2] static peaks (dBFS), then tint,
 * locked-dark stage gradient, meta, optional ramp keyframes, and attribute
 * overrides merged over BASE_ATTRS. */
// prettier-ignore
const clipFx = (
  id: string, name: string, track: TrackLabel, kind: InspectorClip['kind'],
  inSec: number, outSec: number, baseDurationSec: number,
  peaks: [number, number],
  rest: {tint: string; stage: string; meta: SourceMeta; ramp?: RampPoint[];
    attrs?: Partial<ClipAttrs>},
): InspectorClip => ({
  id, name, track, kind, inSec, outSec, baseDurationSec,
  ch1PeakDb: peaks[0], ch2PeakDb: peaks[1],
  tint: rest.tint, stageGradient: rest.stage, meta: rest.meta,
  ramp: rest.ramp ?? FLAT_RAMP,
  defaults: {...BASE_ATTRS, ...rest.attrs},
});

const CLIPS: InspectorClip[] = [
  clipFx('v2-title', 'Title: Harbor Light', 'V2', 'graphic', 12, 18.5, 6.5, [-60, -60], {
    tint: TINT_PURPLE,
    stage: 'linear-gradient(135deg, #312E52 0%, #1E1B36 100%)',
    // prettier-ignore
    meta: meta('ProRes 4444', 'MOV', 'Rec. 709', '1920 × 1080', '24.00',
      '12-bit + alpha', 'None', '00:00:00:00', 'Title generator', 'GFX_TITLES'),
    attrs: {posY: -128, scale: 92, opacity: 96},
  }),
  clipFx('v1-dawn', 'A007_C112_harbor_dawn.mov', 'V1', 'video', 0, 14, 14, [-38, -41], {
    tint: TINT_BLUE,
    stage: 'linear-gradient(135deg, #274060 0%, #101B2E 100%)',
    // prettier-ignore
    meta: meta('ProRes 4444 XQ', 'MOV', 'ARRI LogC3 / AWG3', '3840 × 2160',
      '24.00', '12-bit', '2 ch · 48 kHz · 24-bit', '06:14:22:08',
      'ARRI Alexa Mini LF', 'A007'),
    attrs: {scale: 54, posX: -6},
  }),
  clipFx('v1-drone', 'drone_breakwater_orbit_04.mp4', 'V1', 'video', 14, 26.5, 8, [-54, -57], {
    tint: TINT_TEAL,
    stage: 'linear-gradient(135deg, #1C4A52 0%, #0C2228 100%)',
    // prettier-ignore
    meta: meta('H.265 / HEVC', 'MP4', 'D-Log / D-Gamut', '5120 × 2700',
      '59.94', '10-bit', '2 ch · 48 kHz · 16-bit', '00:03:47:12',
      'DJI Inspire 3', 'DJI_004'),
    // prettier-ignore
    ramp: [{t: 0, speed: 100}, {t: 0.22, speed: 40}, {t: 0.68, speed: 40},
      {t: 1, speed: 100}],
    // prettier-ignore
    attrs: {scale: 41, speed: 64, isRampEnabled: true,
      timeInterp: 'optical-flow', isAudioMuted: true},
  }),
  clipFx('v1-nethaul', 'B019_C007_net_haul_slomo.mov', 'V1', 'video', 26.5, 38, 2.875, [-47, -49], {
    tint: TINT_ORANGE,
    stage: 'linear-gradient(135deg, #4A3421 0%, #211508 100%)',
    // prettier-ignore
    meta: meta('XAVC-I', 'MXF', 'S-Log3 / S-Gamut3.Cine', '3840 × 2160',
      '120.00', '10-bit', '2 ch · 48 kHz · 24-bit', '11:52:03:18',
      'Sony FX9', 'B019'),
    // prettier-ignore
    ramp: [{t: 0, speed: 100}, {t: 0.3, speed: 20}, {t: 0.8, speed: 20},
      {t: 1, speed: 60}],
    attrs: {scale: 56, speed: 25, timeInterp: 'blending'},
  }),
  clipFx('v1-interview', 'interview_ines_A-cam.mov', 'V1', 'video', 38, 61, 23, [-18, -23], {
    tint: TINT_BLUE,
    stage: 'linear-gradient(135deg, #3B3A55 0%, #16161F 100%)',
    // prettier-ignore
    meta: meta('XF-AVC Intra', 'MXF', 'Canon Log 2 / C.Gamut', '4096 × 2160',
      '23.98', '10-bit', '4 ch · 48 kHz · 24-bit', '14:06:51:02',
      'Canon C300 Mk III', 'A012'),
    attrs: {scale: 47, posX: 74, cropL: 4, cropR: 2},
  }),
  clipFx('v1-ferry', 'ferry_wake_macro_02.mov', 'V1', 'video', 61, 69.5, 8.5, [-33, -31], {
    tint: TINT_TEAL,
    stage: 'linear-gradient(135deg, #234A44 0%, #0D1F1C 100%)',
    // prettier-ignore
    meta: meta('ProRes 422 HQ', 'MOV', 'Rec. 709', '1920 × 1080', '24.00',
      '10-bit', '2 ch · 48 kHz · 24-bit', '02:41:15:20',
      'Blackmagic PCC 6K', 'C003'),
    attrs: {blendMode: 'screen', opacity: 82},
  }),
  clipFx('a1-lav', 'ines_lav_ch1_sync.wav', 'A1', 'audio', 38, 61, 23, [-12, -20], {
    tint: TINT_GREEN,
    stage: 'linear-gradient(135deg, #1F3D2A 0%, #0C1911 100%)',
    // prettier-ignore
    meta: meta('PCM (BWF)', 'WAV', '—', '—', '—', '24-bit',
      '2 ch · 48 kHz · 24-bit', '14:06:50:14',
      'Sound Devices MixPre-6', 'SND_D03'),
    attrs: {gainDb: 2.5, ch1Route: 'center', ch2Route: 'mute'},
  }),
];

const INITIAL_SELECTED = 'v1-drone';

const TRACK_ORDER: TrackLabel[] = ['V2', 'V1', 'A1'];
const TRACK_CAPTIONS: Record<TrackLabel, string> = {
  V2: 'Titles',
  V1: 'Picture',
  A1: 'Sync audio',
};

// prettier-ignore
const BLEND_OPTIONS: {value: BlendMode; label: string}[] = [
  {value: 'normal', label: 'Normal'}, {value: 'darken', label: 'Darken'},
  {value: 'multiply', label: 'Multiply'}, {value: 'screen', label: 'Screen'},
  {value: 'lighten', label: 'Lighten'}, {value: 'overlay', label: 'Overlay'},
  {value: 'soft-light', label: 'Soft Light'},
  {value: 'difference', label: 'Difference'},
];

// prettier-ignore
const ROUTE_OPTIONS: {value: ChannelRoute; label: string}[] = [
  {value: 'left', label: 'Output L'}, {value: 'right', label: 'Output R'},
  {value: 'center', label: 'Output L + R'}, {value: 'mute', label: 'Muted'},
];

// prettier-ignore
const INTERP_OPTIONS: {value: TimeInterp; label: string}[] = [
  {value: 'sampling', label: 'Frame sampling'},
  {value: 'blending', label: 'Frame blending'},
  {value: 'optical-flow', label: 'Optical flow'},
];

// prettier-ignore
const TAB_META: {id: TabId; label: string}[] = [
  {id: 'video', label: 'Video'}, {id: 'speed', label: 'Speed'},
  {id: 'audio', label: 'Audio'},
];

/** dBFS -> meter fill % (linear over the -60..0 window the meter draws). */
const dbToPct = (db: number) => clamp(((db + 60) / 60) * 100, 0, 100);

const findClip = (id: string): InspectorClip =>
  CLIPS.find(c => c.id === id) ?? CLIPS[0];

/** Slider value texts get a leading no-break space: the 20px thumb at max
 * overhangs the track by 10px into the row's 8px gap, so bare text would
 * be overlapped by ~2px. The NBSP reserves that sliver (footgun: reserve
 * padding so a thumb at an extreme never overlaps adjacent text). */
const sliderText = (body: string) => \`\\u00A0\${body}\`;

// ============= STYLES =============

// prettier-ignore
const styles: Record<string, CSSProperties> = {
  // Footgun: Layout height="fill" collapses in the demo's auto-height
  // stage — the root div pins the frame to the viewport.
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  timecode: {fontFamily: MONO, fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap'},
  // Header controls wrap onto a second row instead of clipping.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // ----- Clip list panel -----
  // Block padding matches the inspector column's spacing-4 so the list
  // header, inspector card, and monitor stage share a top gridline.
  panelScroll: {height: '100%', overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-3)'},
  trackGroupLabel: {paddingInline: 'var(--spacing-1)'},
  clipRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    width: '100%', padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
    backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
    font: 'inherit', color: 'inherit'},
  // Inset ring keeps the selection outline inside the row bounds.
  clipRowSelected: {backgroundColor: 'var(--color-background-muted)',
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  clipTintChip: {width: 8, alignSelf: 'stretch', minHeight: 30,
    borderRadius: 2, flexShrink: 0},
  clipRowBody: {minWidth: 0, flex: 1},
  clipEditedDot: {width: 6, height: 6, borderRadius: 999,
    backgroundColor: 'var(--color-accent)', flexShrink: 0},
  // ----- Inspector column -----
  inspectorBackdrop: {height: '100%', minHeight: 0, overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)'},
  inspectorColumn: {width: '100%', maxWidth: 640, marginInline: 'auto',
    padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-3)'},
  inspectorSurface: {backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', overflow: 'hidden'},
  // Selected-clip header row (block-level flex so the fill StackItem can
  // ellipsize the mono filename; see the inspectorToolbar comment).
  clipHeaderRow: {padding: 'var(--spacing-2) var(--spacing-4)',
    minHeight: 44,
    borderBottom: 'var(--border-width) solid var(--color-border)'},
  tabBody: {padding: 'var(--spacing-4)'},
  sectionGrid2: {display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    columnGap: 'var(--spacing-4)', rowGap: 'var(--spacing-3)'},
  // Scrub affordance: dotted-underlined label with a horizontal-resize
  // cursor; dragging it scrubs the paired NumberInput's value.
  scrubLabel: {width: 96, flexShrink: 0, cursor: 'ew-resize',
    userSelect: 'none', touchAction: 'none',
    textDecorationLine: 'underline', textDecorationStyle: 'dotted',
    textUnderlineOffset: 3,
    textDecorationColor: 'var(--color-text-secondary)'},
  scrubLabelDisabled: {cursor: 'not-allowed', opacity: 0.5},
  // ----- Speed-ramp mini graph -----
  rampFrame: {border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2)'},
  rampSvg: {display: 'block', width: '100%', height: 'auto'},
  // ----- Audio meters -----
  meterRail: {position: 'relative', height: 8, borderRadius: 999,
    overflow: 'hidden', backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)'},
  meterFill: {height: '100%', borderRadius: 999,
    background:
      'linear-gradient(90deg, light-dark(#0B991F, #34C759) 0%, light-dark(#0B991F, #34C759) 70%, light-dark(#EB6E00, #FF9330) 100%)'},
  meterDb: {width: 72, textAlign: 'end'},
  channelRow: {alignItems: 'center'},
  // ----- Program-monitor thumbnail -----
  // Scheme-locked dark (see header Color policy): a program monitor stays
  // dark in both schemes, so backdrop, hatch, and label colors are
  // intentional literals rendered under colorScheme: 'dark'.
  monitorStage: {position: 'relative', aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)', overflow: 'hidden',
    backgroundColor: '#0B1120',
    backgroundImage:
      'repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.06) 0 8px, transparent 8px 16px)',
    colorScheme: 'dark', boxShadow: 'var(--shadow-high)'},
  monitorFrame: {position: 'absolute', inset: 0, borderRadius: 2},
  monitorFrameLabel: {position: 'absolute', inset: 0, display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontFamily: MONO,
    fontSize: 10, letterSpacing: '0.08em',
    color: 'rgba(226, 232, 240, 0.8)', textTransform: 'uppercase'},
  monitorText: {position: 'absolute', zIndex: 2, fontFamily: MONO,
    fontSize: 10},
  monitorTag: {top: 8, left: 10, letterSpacing: '0.06em',
    color: 'rgba(226, 232, 240, 0.75)'},
  monitorTc: {right: 10, bottom: 8, fontVariantNumeric: 'tabular-nums',
    color: 'rgba(226, 232, 240, 0.85)'},
  monitorDisabledScrim: {position: 'absolute', inset: 0, zIndex: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(11, 17, 32, 0.72)', fontFamily: MONO,
    fontSize: 11, letterSpacing: '0.1em',
    color: 'rgba(148, 163, 184, 0.9)', textTransform: 'uppercase'},
  // ----- Metadata card rows -----
  metaValue: {textAlign: 'end'},
  // <=1200px: monitor + metadata reflow into a wrapping row above the tabs.
  inlineMonitorRow: {display: 'flex', flexWrap: 'wrap',
    gap: 'var(--spacing-3)', alignItems: 'stretch'},
  inlineMonitorCell: {flex: '1 1 240px', minWidth: 240},
  inlineMetaCell: {flex: '2 1 320px', minWidth: 280},
  panelEmpty: {paddingTop: 'var(--spacing-8)', textAlign: 'center'},
};

// ============= SCRUB FIELD =============

/** Numeric field with an NLE-style scrub affordance: the dotted label has
 * an ew-resize cursor and dragging it horizontally scrubs the value (one
 * step per 2px), while the paired NumberInput takes typed entry. */
// prettier-ignore
function ScrubNumberField({
  label, value, min, max, step, units, isDisabled, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  units?: string; isDisabled?: boolean; onChange: (v: number) => void;
}) {
  // Drag origin lives in a ref — transient pointer state should not
  // re-render (rerender-use-ref-transient-values).
  const dragRef = useRef<{startX: number; startValue: number} | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (isDisabled === true) {
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {startX: event.clientX, startValue: value};
  };
  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }
    const rawSteps = (event.clientX - drag.startX) / 2; // 2px per step
    const next = drag.startValue + Math.round(rawSteps) * step;
    // Snap to the step grid to avoid float drift on fractional steps.
    const snapped = Math.round(next / step) * step;
    onChange(clamp(Number(snapped.toFixed(2)), min, max));
  };
  const handlePointerEnd = () => {
    dragRef.current = null;
  };

  const labelStyle =
    isDisabled === true
      ? {...styles.scrubLabel, ...styles.scrubLabelDisabled}
      : styles.scrubLabel;

  return (
    <HStack gap={2} vAlign="center">
      <Tooltip content="Drag horizontally to scrub">
        <span
          style={labelStyle}
          role="presentation"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}>
          <Text type="supporting" color="secondary">
            {label}
          </Text>
        </span>
      </Tooltip>
      <StackItem size="fill">
        <NumberInput
          label={label}
          isLabelHidden
          value={value}
          min={min}
          max={max}
          step={step}
          units={units}
          size="sm"
          isDisabled={isDisabled}
          onChange={onChange}
        />
      </StackItem>
    </HStack>
  );
}

// ============= SPEED-RAMP MINI GRAPH =============

const RAMP_W = 320;
const RAMP_H = 140;
const RAMP_PLOT = {left: 38, right: 312, top: 14, bottom: 112} as const;

/** Axis-labeled SVG speed graph: keyframed ramp when the ramp is enabled,
 * otherwise a flat line at the constant speed. Stroke uses the categorical
 * blue token with the repo-standard fallback. */
// prettier-ignore
function SpeedRampGraph({
  ramp, constantSpeed, isRampEnabled, clipSeconds,
}: {
  ramp: RampPoint[]; constantSpeed: number; isRampEnabled: boolean;
  clipSeconds: number;
}) {
  const points: RampPoint[] = isRampEnabled
    ? ramp
    : [
        {t: 0, speed: constantSpeed},
        {t: 1, speed: constantSpeed},
      ];
  const maxSpeed = points.reduce((m, p) => Math.max(m, p.speed), 0);
  const yMax = Math.max(200, Math.ceil(maxSpeed / 100) * 100);
  const plotW = RAMP_PLOT.right - RAMP_PLOT.left;
  const plotH = RAMP_PLOT.bottom - RAMP_PLOT.top;
  const px = (t: number) => RAMP_PLOT.left + t * plotW;
  const py = (speed: number) => RAMP_PLOT.bottom - (speed / yMax) * plotH;
  const polyline = points
    .map(p => \`\${px(p.t).toFixed(1)},\${py(p.speed).toFixed(1)}\`)
    .join(' ');
  const area = \`\${RAMP_PLOT.left},\${RAMP_PLOT.bottom} \${polyline} \${RAMP_PLOT.right},\${RAMP_PLOT.bottom}\`;
  const yTicks = [0, yMax / 2, yMax];
  const xTicks = [0, 0.5, 1];
  const minSpeed = points.reduce((m, p) => Math.min(m, p.speed), Infinity);
  const graphLabel = isRampEnabled
    ? \`Speed over clip time: ramp between \${minSpeed}% and \${maxSpeed}%\`
    : \`Speed over clip time: constant \${constantSpeed}%\`;
  const axisText: CSSProperties = {
    fontFamily: MONO,
    fontSize: 8.5,
    fill: 'var(--color-text-secondary)',
  };
  const stroke = TINT_BLUE;

  return (
    <div style={styles.rampFrame}>
      <svg
        viewBox={\`0 0 \${RAMP_W} \${RAMP_H}\`}
        style={styles.rampSvg}
        role="img"
        aria-label={graphLabel}>
        {/* Grid + y-axis labels (speed %) */}
        {yTicks.map(tick => (
          <g key={\`y-\${tick}\`}>
            <line
              x1={RAMP_PLOT.left}
              x2={RAMP_PLOT.right}
              y1={py(tick)}
              y2={py(tick)}
              stroke="var(--color-border)"
              strokeWidth={tick === 0 ? 1 : 0.5}
              strokeDasharray={tick === 0 ? undefined : '3 3'}
            />
            <text x={RAMP_PLOT.left - 5} y={py(tick) + 3} textAnchor="end" style={axisText}>
              {tick}%
            </text>
          </g>
        ))}
        {/* X-axis labels (clip-relative seconds) */}
        {xTicks.map(t => (
          <text
            key={\`x-\${t}\`}
            x={px(t)}
            y={RAMP_PLOT.bottom + 14}
            textAnchor={t === 0 ? 'start' : t === 1 ? 'end' : 'middle'}
            style={axisText}>
            {(t * clipSeconds).toFixed(1)}s
          </text>
        ))}
        <polygon points={area} fill={stroke} opacity={0.14} />
        <polyline
          points={polyline}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {isRampEnabled
          ? points.map(p => (
              <circle
                key={\`\${p.t}-\${p.speed}\`}
                cx={px(p.t)}
                cy={py(p.speed)}
                r={3.2}
                fill="var(--color-background-card)"
                stroke={stroke}
                strokeWidth={1.6}
              />
            ))
          : null}
        {/* Axis captions */}
        <text x={RAMP_PLOT.left} y={9} style={axisText}>
          Speed
        </text>
        <text x={RAMP_PLOT.right} y={RAMP_H - 2} textAnchor="end" style={axisText}>
          Clip time
        </text>
      </svg>
    </div>
  );
}

// ============= PROGRAM-MONITOR THUMBNAIL =============

/** Small program monitor: a scheme-locked dark stage whose inner "frame"
 * div live-applies the current transform, crop, and opacity attributes.
 * The frame is a CSS gradient stand-in — never <video>. */
function MonitorThumb({clip, attrs}: {clip: InspectorClip; attrs: ClipAttrs}) {
  // 1920x1080 sequence space -> percentage offsets of the stage box.
  const txPct = (attrs.posX / 1920) * 100;
  const tyPct = (attrs.posY / 1080) * 100;
  const originX = 50 + (attrs.anchorX / 1920) * 100;
  const originY = 50 + (attrs.anchorY / 1080) * 100;
  const frameStyle: CSSProperties = {
    ...styles.monitorFrame,
    background: clip.stageGradient,
    transform: \`translate(\${txPct}%, \${tyPct}%) rotate(\${attrs.rotation}deg) scale(\${
      attrs.scale / 100
    })\`,
    transformOrigin: \`\${originX}% \${originY}%\`,
    clipPath: \`inset(\${attrs.cropT}% \${attrs.cropR}% \${attrs.cropB}% \${attrs.cropL}%)\`,
    opacity: attrs.opacity / 100,
  };
  return (
    <VStack gap={1}>
      <div style={styles.monitorStage}>
        <span style={{...styles.monitorText, ...styles.monitorTag}}>
          PGM · {clip.track}
        </span>
        <div style={frameStyle} aria-hidden>
          <span style={styles.monitorFrameLabel}>
            {clip.kind === 'audio' ? 'Audio only' : clip.meta.reel}
          </span>
        </div>
        {attrs.isEnabled ? null : (
          <div style={styles.monitorDisabledScrim}>Clip disabled</div>
        )}
        <span style={{...styles.monitorText, ...styles.monitorTc}}>
          {formatTimecode(clip.inSec)}
        </span>
      </div>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            Program monitor
          </Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers style={styles.mono}>
          {attrs.scale}% · {attrs.opacity}%
        </Text>
      </HStack>
    </VStack>
  );
}

// ============= SOURCE METADATA CARD =============

function MetaRow({label, value}: {label: string; value: string}) {
  return (
    <HStack gap={3} vAlign="center">
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </StackItem>
      <Text
        type="supporting"
        hasTabularNumbers
        style={{...styles.mono, ...styles.metaValue}}>
        {value}
      </Text>
    </HStack>
  );
}

function SourceMetadataCard({clip}: {clip: InspectorClip}) {
  const m = clip.meta;
  return (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Source
            </Text>
          </StackItem>
          <Badge label={m.reel} variant="neutral" />
        </HStack>
        <Divider />
        <VStack gap={1}>
          {(
            [
              ['Codec', m.codec],
              ['Container', m.container],
              ['Color space', m.colorSpace],
              ['Resolution', m.resolution],
              ['Source fps', m.sourceFps],
              ['Bit depth', m.bitDepth],
              ['Audio', m.audio],
              ['Start TC', m.startTc],
              ['Camera', m.camera],
            ] as const
          ).map(([label, value]) => (
            <MetaRow key={label} label={label} value={value} />
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= TAB BODIES =============

type PatchFn = (patch: Partial<ClipAttrs>) => void;

// prettier-ignore
type NumericAttrKey =
  'posX' | 'posY' | 'scale' | 'rotation' | 'anchorX' | 'anchorY';
type CropKey = 'cropL' | 'cropR' | 'cropT' | 'cropB';

/** In-tab empty state for clips missing a video or audio stream. */
// prettier-ignore
function EmptyNote({
  icon, title, body,
}: {icon: typeof FilmIcon; title: string; body: string}) {
  return (
    <div style={styles.panelEmpty}>
      <VStack gap={1} hAlign="center">
        <Icon icon={icon} size="md" color="secondary" />
        <Text type="body" weight="semibold">
          {title}
        </Text>
        <Text type="supporting" color="secondary">
          {body}
        </Text>
      </VStack>
    </div>
  );
}

// prettier-ignore
const TRANSFORM_FIELDS: {
  key: NumericAttrKey; label: string;
  min: number; max: number; step: number; units: string;
}[] = [
  {key: 'posX', label: 'Position X', min: -960, max: 960, step: 1, units: 'px'},
  {key: 'posY', label: 'Position Y', min: -540, max: 540, step: 1, units: 'px'},
  {key: 'scale', label: 'Scale', min: 10, max: 400, step: 1, units: '%'},
  {key: 'rotation', label: 'Rotation', min: -180, max: 180, step: 0.5, units: '°'},
  {key: 'anchorX', label: 'Anchor X', min: -960, max: 960, step: 1, units: 'px'},
  {key: 'anchorY', label: 'Anchor Y', min: -540, max: 540, step: 1, units: 'px'},
];

const CROP_EDGES: {key: CropKey; label: string}[] = [
  {key: 'cropL', label: 'Left'},
  {key: 'cropR', label: 'Right'},
  {key: 'cropT', label: 'Top'},
  {key: 'cropB', label: 'Bottom'},
];

// prettier-ignore
function VideoTabBody({
  clip, attrs, onPatch,
}: {clip: InspectorClip; attrs: ClipAttrs; onPatch: PatchFn}) {
  if (clip.kind === 'audio') {
    return (
      <EmptyNote
        icon={AudioLinesIcon}
        title="Audio-only clip"
        body={\`\${clip.name} has no video stream — use the Audio tab.\`}
      />
    );
  }
  const isLockedOff = !attrs.isEnabled;
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <Text type="label" color="secondary">
          Transform
        </Text>
        <div style={styles.sectionGrid2}>
          {TRANSFORM_FIELDS.map(f => (
            <ScrubNumberField
              key={f.key}
              label={f.label}
              value={attrs[f.key]}
              min={f.min}
              max={f.max}
              step={f.step}
              units={f.units}
              isDisabled={isLockedOff}
              onChange={v => onPatch({[f.key]: v})}
            />
          ))}
        </div>
        <Text type="supporting" color="secondary">
          Drag a dotted label to scrub · 1920 × 1080 sequence space
        </Text>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Crop
        </Text>
        <div style={styles.sectionGrid2}>
          {CROP_EDGES.map(edge => (
            <Slider
              key={edge.key}
              label={edge.label}
              value={attrs[edge.key]}
              min={0}
              max={100}
              step={1}
              isDisabled={isLockedOff}
              valueDisplay="text"
              formatValue={v => sliderText(\`\${v}%\`)}
              onChange={(v: number) => onPatch({[edge.key]: v})}
            />
          ))}
        </div>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Composite
        </Text>
        <div style={styles.sectionGrid2}>
          <Selector
            label="Blend mode"
            size="sm"
            options={BLEND_OPTIONS}
            value={attrs.blendMode}
            isDisabled={isLockedOff}
            onChange={v => onPatch({blendMode: v as BlendMode})}
          />
          <Slider
            label="Opacity"
            value={attrs.opacity}
            min={0}
            max={100}
            step={1}
            isDisabled={isLockedOff}
            valueDisplay="text"
            formatValue={v => sliderText(\`\${v}%\`)}
            onChange={(v: number) => onPatch({opacity: v})}
          />
        </div>
      </VStack>
    </VStack>
  );
}

// prettier-ignore
function SpeedTabBody({
  clip, attrs, onPatch,
}: {clip: InspectorClip; attrs: ClipAttrs; onPatch: PatchFn}) {
  const isLockedOff = !attrs.isEnabled;
  const base = clip.baseDurationSec;
  // Reciprocal pair: duration = source span / speed; editing either field
  // rewrites the other through the shared \`speed\` attribute.
  const durationSec = Number((base / (attrs.speed / 100)).toFixed(2));
  const handleDurationChange = (nextDur: number) => {
    if (nextDur <= 0) {
      return;
    }
    const nextSpeed = clamp(Number(((base / nextDur) * 100).toFixed(1)), 10, 400);
    onPatch({speed: nextSpeed});
  };
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={1} vAlign="center">
          <Icon icon={GaugeIcon} size="sm" color="secondary" />
          <Text type="label" color="secondary">
            Retime
          </Text>
        </HStack>
        <div style={styles.sectionGrid2}>
          <ScrubNumberField
            label="Speed"
            value={attrs.speed}
            min={10}
            max={400}
            step={1}
            units="%"
            isDisabled={isLockedOff || attrs.isRampEnabled}
            onChange={v => onPatch({speed: v})}
          />
          <ScrubNumberField
            label="Duration"
            value={durationSec}
            min={Number((base / 4).toFixed(2))}
            max={Number((base * 10).toFixed(2))}
            step={0.1}
            units="s"
            isDisabled={isLockedOff || attrs.isRampEnabled}
            onChange={handleDurationChange}
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Source span {base.toFixed(2)}s at 100% → cuts in at{' '}
          {formatTimecode(clip.inSec)}, out at {formatTimecode(clip.outSec)}
        </Text>
        <div style={styles.sectionGrid2}>
          <Switch
            label="Reverse playback"
            value={attrs.isReversed}
            isDisabled={isLockedOff}
            onChange={v => onPatch({isReversed: v})}
          />
          <Selector
            label="Time interpolation"
            size="sm"
            options={INTERP_OPTIONS}
            value={attrs.timeInterp}
            isDisabled={isLockedOff}
            onChange={v => onPatch({timeInterp: v as TimeInterp})}
          />
        </div>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Speed ramp
            </Text>
          </StackItem>
          <Switch
            label="Enable speed ramp"
            isLabelHidden
            value={attrs.isRampEnabled}
            isDisabled={isLockedOff || clip.ramp.length <= 2}
            onChange={v => onPatch({isRampEnabled: v})}
          />
        </HStack>
        <SpeedRampGraph
          ramp={clip.ramp}
          constantSpeed={attrs.speed}
          isRampEnabled={attrs.isRampEnabled}
          clipSeconds={clip.outSec - clip.inSec}
        />
        <Text type="supporting" color="secondary">
          {attrs.isRampEnabled
            ? \`\${clip.ramp.length} keyframes · \${INTERP_OPTIONS.find(
                o => o.value === attrs.timeInterp,
              )?.label ?? ''} between keyframes\`
            : clip.ramp.length > 2
              ? 'Ramp keyframes preserved — enable to override constant speed.'
              : 'No ramp keyframes on this clip — speed applies uniformly.'}
        </Text>
      </VStack>
    </VStack>
  );
}

/** One source channel: static peak meter (gain-shifted), peak readout,
 * output-route Selector. */
// prettier-ignore
function ChannelRow({
  channelLabel, peakDb, gainDb, route, isDisabled, onRouteChange,
}: {
  channelLabel: string; peakDb: number; gainDb: number; route: ChannelRoute;
  isDisabled: boolean; onRouteChange: (route: ChannelRoute) => void;
}) {
  const shifted = clamp(peakDb + gainDb, -60, 0);
  const isRouteMuted = route === 'mute';
  return (
    <HStack gap={3} style={styles.channelRow}>
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" weight="semibold">
                {channelLabel}
              </Text>
            </StackItem>
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={{...styles.mono, ...styles.meterDb}}>
              {isRouteMuted ? 'muted' : \`\${shifted.toFixed(1)} dBFS\`}
            </Text>
          </HStack>
          <div style={styles.meterRail} aria-hidden>
            <div
              style={{
                ...styles.meterFill,
                width: \`\${isRouteMuted ? 0 : dbToPct(shifted)}%\`,
              }}
            />
          </div>
        </VStack>
      </StackItem>
      <Selector
        label={\`\${channelLabel} output\`}
        isLabelHidden
        size="sm"
        options={ROUTE_OPTIONS}
        value={route}
        isDisabled={isDisabled}
        onChange={v => onRouteChange(v as ChannelRoute)}
      />
    </HStack>
  );
}

// prettier-ignore
function AudioTabBody({
  clip, attrs, onPatch,
}: {clip: InspectorClip; attrs: ClipAttrs; onPatch: PatchFn}) {
  if (clip.meta.audio === 'None') {
    return (
      <EmptyNote
        icon={TypeIcon}
        title="No audio stream"
        body={\`\${clip.name} is a generated graphic without embedded audio.\`}
      />
    );
  }
  const isLockedOff = !attrs.isEnabled;
  const isMuted = attrs.isAudioMuted;
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Levels
            </Text>
          </StackItem>
          <Switch
            label="Mute clip audio"
            value={isMuted}
            isDisabled={isLockedOff}
            onChange={v => onPatch({isAudioMuted: v})}
          />
        </HStack>
        <Slider
          label="Gain"
          value={attrs.gainDb}
          min={-24}
          max={24}
          step={0.5}
          isDisabled={isLockedOff || isMuted}
          valueDisplay="text"
          formatValue={v => sliderText(\`\${v > 0 ? '+' : ''}\${v.toFixed(1)} dB\`)}
          onChange={(v: number) => onPatch({gainDb: v})}
        />
        <Text type="supporting" color="secondary">
          Gain applies before the track fader and the A1 bus.
        </Text>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Channel map · {clip.meta.audio}
        </Text>
        {(
          [
            ['Ch 1', clip.ch1PeakDb, attrs.ch1Route, 'ch1Route'],
            ['Ch 2', clip.ch2PeakDb, attrs.ch2Route, 'ch2Route'],
          ] as const
        ).map(([label, peakDb, route, routeKey]) => (
          <ChannelRow
            key={label}
            channelLabel={label}
            peakDb={isMuted ? -60 : peakDb}
            gainDb={attrs.gainDb}
            route={route}
            isDisabled={isLockedOff || isMuted}
            onRouteChange={next => onPatch({[routeKey]: next})}
          />
        ))}
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Peaks measured over the cut range · reference −18 dBFS
        </Text>
      </VStack>
    </VStack>
  );
}

// ============= CLIP LIST PANEL =============

const KIND_ICON = {
  video: FilmIcon,
  graphic: TypeIcon,
  audio: AudioLinesIcon,
} as const;

// prettier-ignore
function ClipListRow({
  clip, isSelected, isEdited, onSelect,
}: {
  clip: InspectorClip; isSelected: boolean; isEdited: boolean;
  onSelect: (id: string) => void;
}) {
  const rowStyle = isSelected
    ? {...styles.clipRow, ...styles.clipRowSelected}
    : styles.clipRow;
  return (
    <button
      type="button"
      style={rowStyle}
      aria-pressed={isSelected}
      aria-label={\`Inspect \${clip.track} clip \${clip.name}\`}
      onClick={() => onSelect(clip.id)}>
      <span style={{...styles.clipTintChip, backgroundColor: clip.tint}} />
      <span style={styles.clipRowBody}>
        <VStack gap={0}>
          <HStack gap={1} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" weight="semibold" maxLines={1} style={styles.mono}>
                {clip.name}
              </Text>
            </StackItem>
            {isEdited ? (
              <Tooltip content="Attributes modified">
                <span style={styles.clipEditedDot} />
              </Tooltip>
            ) : null}
          </HStack>
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={styles.timecode}>
            {formatTimecode(clip.inSec)} – {formatTimecode(clip.outSec)}
          </Text>
        </VStack>
      </span>
    </button>
  );
}

// prettier-ignore
function ClipListPanel({
  selectedId, editedIds, onSelect,
}: {
  selectedId: string; editedIds: ReadonlySet<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={styles.panelScroll}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" style={styles.trackGroupLabel}>
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Sequence clips
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {CLIPS.length}
          </Text>
        </HStack>
        {TRACK_ORDER.map(track => (
          <VStack key={track} gap={1}>
            <div style={styles.trackGroupLabel}>
              <Text type="label" color="secondary">
                {track} · {TRACK_CAPTIONS[track]}
              </Text>
            </div>
            {CLIPS.filter(c => c.track === track).map(clip => (
              <ClipListRow
                key={clip.id}
                clip={clip}
                isSelected={clip.id === selectedId}
                isEdited={editedIds.has(clip.id)}
                onSelect={onSelect}
              />
            ))}
          </VStack>
        ))}
      </VStack>
    </div>
  );
}

// ============= PAGE =============

const CLIP_PICKER_OPTIONS = CLIPS.map(c => ({
  value: c.id,
  label: \`\${c.track} · \${c.name}\`,
}));

export default function VideoEditorClipInspectorTemplate() {
  const [selectedId, setSelectedId] = useState<string>(INITIAL_SELECTED);
  const [tab, setTab] = useState<TabId>('video');
  // Attribute edits write per clip id; unedited clips fall through to
  // their fixture defaults.
  const [overrides, setOverrides] = useState<Record<string, ClipAttrs>>({});
  const [clipboard, setClipboard] = useState<{
    fromName: string;
    attrs: ClipAttrs;
  } | null>(null);

  const isNarrow = useMediaQuery('(max-width: 1200px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const selected = findClip(selectedId);
  const attrs = overrides[selected.id] ?? selected.defaults;

  const editedIds = new Set(
    Object.keys(overrides).filter(id => {
      const clip = findClip(id);
      return JSON.stringify(overrides[id]) !== JSON.stringify(clip.defaults);
    }),
  );
  const isSelectedEdited = editedIds.has(selected.id);

  const patchSelected: PatchFn = patch => {
    setOverrides(prev => ({
      ...prev,
      [selected.id]: {...(prev[selected.id] ?? selected.defaults), ...patch},
    }));
  };
  const resetSelected = () => {
    setOverrides(prev => {
      const next = {...prev};
      delete next[selected.id];
      return next;
    });
  };
  const copyAttrs = () => {
    setClipboard({fromName: selected.name, attrs});
  };
  const pasteAttrs = () => {
    if (clipboard == null) {
      return;
    }
    const pasted = clipboard.attrs;
    setOverrides(prev => ({...prev, [selected.id]: {...pasted}}));
  };
  const handleSelect = (id: string) => {
    setSelectedId(id);
    // Audio-only clips open on their only meaningful tab.
    const next = findClip(id);
    if (next.kind === 'audio' && tab === 'video') {
      setTab('audio');
    }
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
            {isCompact ? null : (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {SEQUENCE_NAME} · {FPS} fps · {SEQUENCE_TC}
              </Text>
            )}
          </HStack>
        </StackItem>
        <Button
          label="Copy attributes"
          variant="ghost"
          size="sm"
          icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
          onClick={copyAttrs}
        />
        <Button
          label="Paste"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ClipboardPasteIcon} size="sm" color="inherit" />}
          isDisabled={clipboard == null}
          tooltip={
            clipboard == null
              ? 'Copy attributes from a clip first'
              : \`Paste attributes from \${clipboard.fromName}\`
          }
          onClick={pasteAttrs}
        />
        <Button
          label="Reset"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          isDisabled={!isSelectedEdited}
          tooltip="Reset selected clip to source attributes"
          onClick={resetSelected}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Inspector column -----
  // Custom block-level HStack row rather than Toolbar: Toolbar's slots are
  // intrinsically sized flex items, so the unbreakable mono filename's
  // min-content pushed the enable Switch label out of the clipped surface.
  // A block-level flex row with a minWidth:0 fill item (the clip-list-row
  // pattern) is the only chain that lets the name ellipsize instead.
  const inspectorToolbar = (
    <HStack gap={2} vAlign="center" style={styles.clipHeaderRow}>
      <Icon icon={KIND_ICON[selected.kind]} size="sm" color="secondary" />
      <StackItem size="fill">
        <Text type="body" weight="semibold" maxLines={1} style={styles.mono}>
          {selected.name}
        </Text>
      </StackItem>
      <Badge label={selected.track} variant="neutral" />
      {isSelectedEdited ? <Badge label="Modified" variant="info" /> : null}
      <Icon
        icon={attrs.isEnabled ? VideoIcon : VideoOffIcon}
        size="sm"
        color={attrs.isEnabled ? 'secondary' : 'error'}
      />
      <Switch
        label="Enable"
        value={attrs.isEnabled}
        onChange={v => patchSelected({isEnabled: v})}
      />
    </HStack>
  );

  const tabBody =
    tab === 'video' ? (
      <VideoTabBody clip={selected} attrs={attrs} onPatch={patchSelected} />
    ) : tab === 'speed' ? (
      <SpeedTabBody clip={selected} attrs={attrs} onPatch={patchSelected} />
    ) : (
      <AudioTabBody clip={selected} attrs={attrs} onPatch={patchSelected} />
    );

  const content = (
    <LayoutContent padding={0}>
      <div style={styles.inspectorBackdrop}>
        <div style={styles.inspectorColumn}>
          {isCompact ? (
            <Selector
              label="Selected clip"
              size="sm"
              options={CLIP_PICKER_OPTIONS}
              value={selectedId}
              onChange={handleSelect}
            />
          ) : null}
          {isNarrow ? (
            <div style={styles.inlineMonitorRow}>
              <div style={styles.inlineMonitorCell}>
                <MonitorThumb clip={selected} attrs={attrs} />
              </div>
              <div style={styles.inlineMetaCell}>
                <SourceMetadataCard clip={selected} />
              </div>
            </div>
          ) : null}
          <div style={styles.inspectorSurface}>
            {inspectorToolbar}
            <TabList value={tab} onChange={v => setTab(v as TabId)}>
              {TAB_META.map(t => (
                <Tab key={t.id} value={t.id} label={t.label} />
              ))}
            </TabList>
            <div style={styles.tabBody}>{tabBody}</div>
          </div>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Panels -----
  const clipListPanel = isCompact ? undefined : (
    <LayoutPanel width={280} padding={0} hasDivider label="Sequence clips">
      <ClipListPanel
        selectedId={selectedId}
        editedIds={editedIds}
        onSelect={handleSelect}
      />
    </LayoutPanel>
  );

  const monitorPanel = isNarrow ? undefined : (
    <LayoutPanel width={320} padding={0} hasDivider label="Program monitor">
      <div style={styles.panelScroll}>
        <VStack gap={3}>
          <MonitorThumb clip={selected} attrs={attrs} />
          <SourceMetadataCard clip={selected} />
          {clipboard == null ? null : (
            <Text type="supporting" color="secondary" maxLines={2}>
              Clipboard: attributes copied from {clipboard.fromName}.
            </Text>
          )}
        </VStack>
      </div>
    </LayoutPanel>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={clipListPanel}
        content={content}
        end={monitorPanel}
      />
    </div>
  );
}
`;export{e as default};