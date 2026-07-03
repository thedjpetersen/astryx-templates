// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one documentary project 'Harbor Light':
 *   23 media assets across seven leaf bins — interview masters, harbor/town
 *   B-roll, dialog/ambience/score WAVs, and title graphics — each with fixed
 *   duration, codec, resolution, fps, size, tags, timeline-usage timecodes,
 *   and proxy status; fixed waveform/filmstrip shade arrays; no clocks, no
 *   Math.random, no network media)
 * @output Project media browser for an NLE: a 52px header (project name,
 *   Synced Badge, asset-count readout, search TextInput, Grid/List
 *   SegmentedControl, primary Import Button), a 248px left bin rail
 *   (TreeList of Footage/Audio/Graphics leaf bins with per-bin counts plus
 *   two smart bins — Used in timeline, Needs proxy — and a media-drive
 *   ProgressBar footer), and the defining region: a media grid/list whose
 *   top carries a dashed import dropzone strip (queued-import ProgressBar)
 *   and a filter toolbar (clickable tag Tokens, sort Selector, thumbnail
 *   size Slider). Grid tiles are scheme-locked dark 16:9 thumb stages with
 *   duration badges, codec/res/fps metadata pills, timeline-usage ×N
 *   badges, and proxy StatusDots; every tile opens a HoverCard preview
 *   (filmstrip, SMPTE in/out, full metadata, usage list). List mode swaps
 *   tiles for a fixed-column row table with right-aligned numerics.
 * @position Page template; emitted by `astryx template video-editor-media-bin`
 *
 * Frame: root div at 100dvh wrapping Layout height="fill" (the demo stage
 * auto-heights, so the wrapper pins the frame — see
 * webhook-delivery-debugger). LayoutHeader carries project chrome + search
 * + view toggle + Import. LayoutPanel start 248 is the bin rail (TreeList
 * scrolls; drive footer stays pinned). LayoutContent stacks dropzone strip,
 * filter toolbar, and the scrolling asset grid/list. LayoutFooter is a
 * 40px status bar: library totals, selected-asset readout, drive meter.
 * The bin browser for the Video Studio suite — choose over
 * video-clip-timeline when the user organizes and inspects source media
 * rather than arranges clips on lanes, and over media-asset-pipeline when
 * assets are browsed/filtered in bins rather than tracked through encode
 * jobs.
 *
 * Responsive contract:
 * - >960px: header | bin rail 248 | content (fill) | footer 40. Grid
 *   columns derive from the thumbnail-size Slider (repeat auto-fill,
 *   minmax(thumb px, 1fr)).
 * - <=960px: the bin rail drops out; a bin Selector appears in the filter
 *   toolbar so every bin (and smart bin) stays reachable. The footer hides
 *   the selected-asset readout and keeps totals + drive meter.
 * - <=768px: the header hides the asset-count readout and the toolbar
 *   hides the thumbnail Slider (grid falls back to 148px tiles); search,
 *   view toggle, and Import stay. Header and toolbar rows wrap (flexWrap)
 *   instead of clipping.
 * - List mode is a deliberate horizontal-scroll surface below 980px of
 *   content width: the column grid keeps a 932px minWidth so numeric
 *   columns never truncate mid-token; the scroll container owns the
 *   overflow.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels;
 * zero Cards — the HoverCard preview and the dropzone strip are styled
 * divs, and the bin rail/list rows are borderless rows on panel surfaces.
 *
 * Color policy: thumbnail stages (grid tiles, list thumbs, HoverCard
 * preview stage + filmstrip) are deliberately scheme-locked dark
 * (colorScheme: 'dark') — they stand in for footage frames, which stay
 * dark in both schemes, so their gradients, slate scrims/labels, and the
 * duration-badge scrim are intentional literals. Everything outside the
 * locked stages is var(--color-*) token-pure or an explicit light-dark()
 * pair: kind tints and tag/pill accents keep exact light values and shift
 * to 400-weight hues on dark; data-categorical tokens always carry their
 * repo-standard light-dark() fallbacks.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  AudioLinesIcon,
  ClapperboardIcon,
  FilmIcon,
  FolderIcon,
  ImageIcon,
  LayersIcon,
  LayoutGridIcon,
  ListIcon,
  MusicIcon,
  SearchIcon,
  UploadIcon,
  ZapIcon,
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
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {HoverCard} from '@astryxdesign/core/HoverCard';
import {Icon} from '@astryxdesign/core/Icon';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PROJECT CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const FPS = 24; // display timebase for SMPTE readouts
const MONO = 'var(--font-family-code, monospace)';
const DRIVE_TOTAL_GB = 2000; // 2 TB scratch drive
const INITIAL_SELECTED_ASSET = 'br-harbor-dawn';
const INITIAL_BIN = 'all';

/** Seconds -> SMPTE HH:MM:SS:FF at the 24fps display timebase. */
function formatTimecode(sec: number): string {
  const totalFrames = Math.round(sec * FPS);
  const frames = totalFrames % FPS;
  const totalSec = Math.floor(totalFrames / FPS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(totalSec / 3600))}:${pad(
    Math.floor(totalSec / 60) % 60,
  )}:${pad(totalSec % 60)}:${pad(frames)}`;
}

/** Seconds -> compact duration badge, e.g. 402 -> "6:42". */
function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatGb(gb: number): string {
  return gb >= 100 ? `${Math.round(gb)} GB` : `${gb.toFixed(1)} GB`;
}

// ============= FIXTURES =============
// Fixed bins, tags, and 23 assets — no clocks, no randomness.

type BinId =
  | 'all'
  | 'footage'
  | 'audio'
  | 'graphics'
  | 'fo-interviews'
  | 'fo-broll-harbor'
  | 'fo-broll-town'
  | 'au-dialog'
  | 'au-ambience'
  | 'au-music'
  | 'smart-used'
  | 'smart-proxy';

type LeafBinId = Exclude<
  BinId,
  'all' | 'footage' | 'audio' | 'smart-used' | 'smart-proxy'
>;

type AssetKind = 'video' | 'audio' | 'graphic';
type ProxyStatus = 'ready' | 'queued' | 'none';
type ViewMode = 'grid' | 'list';
type SortKey = 'name' | 'duration' | 'size';

interface MediaAsset {
  id: string;
  name: string;
  binId: LeafBinId;
  kind: AssetKind;
  /** Seconds; 0 for stills (duration badge suppressed). */
  durationSec: number;
  codec: string;
  /** '3840×2160' etc; '—' for pure audio. */
  res: string;
  /** '23.98' | '29.97' | '48 kHz' | 'Still' … rendered verbatim in a pill. */
  fps: string;
  sizeGb: number;
  tags: string[];
  /** Timeline placements, e.g. 'V1 · 00:01:12:04'; length = usage count. */
  usedIn: string[];
  proxy: ProxyStatus;
  /** Scheme-locked dark stage gradient — intentional literals. */
  thumb: string;
  scene: string;
  recorded: string;
  note: string;
}

const BIN_LABEL: Record<BinId, string> = {
  all: 'All media',
  footage: 'Footage',
  audio: 'Audio',
  graphics: 'Graphics',
  'fo-interviews': 'Interviews',
  'fo-broll-harbor': 'B-roll · Harbor',
  'fo-broll-town': 'B-roll · Town',
  'au-dialog': 'Dialog',
  'au-ambience': 'Ambience',
  'au-music': 'Music',
  'smart-used': 'Used in timeline',
  'smart-proxy': 'Needs proxy',
};

const FOOTAGE_BINS: LeafBinId[] = [
  'fo-interviews',
  'fo-broll-harbor',
  'fo-broll-town',
];
const AUDIO_BINS: LeafBinId[] = ['au-dialog', 'au-ambience', 'au-music'];

/** Filterable tag rail — order fixed; every tag exists on >=1 asset. */
const TAG_RAIL = [
  'interview',
  'b-roll',
  'drone',
  'dawn',
  'harbor',
  'market',
  'dialog',
  'ambience',
  'score',
  'title',
];

// Thumb gradients are stage literals (scheme-locked dark, see Color policy).
const G = {
  dawn: 'linear-gradient(135deg, #3B2F4E 0%, #6B4E71 45%, #C97B4A 100%)',
  sea: 'linear-gradient(135deg, #16324A 0%, #1E4E66 55%, #2C6E7F 100%)',
  interview: 'linear-gradient(135deg, #2A2118 0%, #4A3826 55%, #6E5237 100%)',
  night: 'linear-gradient(135deg, #131B2C 0%, #26334A 60%, #3D3A5C 100%)',
  market: 'linear-gradient(135deg, #33241C 0%, #59372A 50%, #8A5A33 100%)',
  audio: 'linear-gradient(135deg, #0F2027 0%, #203A43 60%, #2C5364 100%)',
  graphic: 'linear-gradient(135deg, #1F1147 0%, #38246B 55%, #512E8E 100%)',
};

// Compact fixture factories — positional args keep the 23-asset library
// scannable. Order: id, name, bin, durationSec, sizeGb, tags, usedIn, then
// per-kind fields; codec/res/fps override the per-kind defaults.
const video = (
  id: string,
  name: string,
  binId: LeafBinId,
  durationSec: number,
  sizeGb: number,
  tags: string[],
  usedIn: string[],
  proxy: ProxyStatus,
  thumb: string,
  scene: string,
  recorded: string,
  note: string,
  codec = 'ProRes 422',
  res = '3840×2160',
  fps = '23.98',
): MediaAsset => ({
  id, name, binId, kind: 'video', durationSec, codec, res, fps, sizeGb,
  tags, usedIn, proxy, thumb, scene, recorded, note,
});

const audio = (
  id: string,
  name: string,
  binId: LeafBinId,
  durationSec: number,
  sizeGb: number,
  tags: string[],
  usedIn: string[],
  scene: string,
  recorded: string,
  note: string,
): MediaAsset => ({
  id, name, binId, kind: 'audio', durationSec, codec: 'WAV 24-bit',
  res: '—', fps: '48 kHz', sizeGb, tags, usedIn, proxy: 'ready',
  thumb: G.audio, scene, recorded, note,
});

const graphic = (
  id: string,
  name: string,
  durationSec: number,
  sizeGb: number,
  tags: string[],
  usedIn: string[],
  scene: string,
  recorded: string,
  note: string,
  codec = 'ProRes 4444',
  fps = '23.98',
): MediaAsset => ({
  id, name, binId: 'graphics', kind: 'graphic', durationSec, codec,
  res: '3840×2160', fps, sizeGb, tags, usedIn, proxy: 'ready',
  thumb: G.graphic, scene, recorded, note,
});

const HQ = 'ProRes 422 HQ';

const ASSETS: MediaAsset[] = [
  // ---- Footage · Interviews (ARRI masters, ProRes 422 HQ UHD) ----
  video('int-elias-a', 'A012_C003_0714RK.mov', 'fo-interviews', 402, 24.8,
    ['interview', 'elias', 'dawn'],
    ['V1 · 00:00:12:08', 'V1 · 00:03:41:16', 'V1 · 00:11:02:00'], 'ready',
    G.interview, 'Sc 04 · Tk 2', 'Jul 14 · Slip 9 office',
    'Elias Marr on the dawn shift — selects at 02:10 and 05:47.', HQ),
  video('int-elias-b', 'A012_C007_0714RK.mov', 'fo-interviews', 187, 11.6,
    ['interview', 'elias'], ['V1 · 00:07:19:12'], 'ready', G.interview,
    'Sc 04 · Tk 6', 'Jul 14 · Slip 9 office',
    'Pickup — the "nets remember" line, cleaner read than Tk 2.', HQ),
  video('int-priya-a', 'A014_C002_0716QT.mov', 'fo-interviews', 523, 32.3,
    ['interview', 'priya', 'harbor'],
    ['V1 · 00:05:02:20', 'V1 · 00:14:33:04'], 'ready', G.night,
    'Sc 07 · Tk 1', 'Jul 16 · Harbormaster tower',
    'Priya Nair, harbormaster — window light shifts after 06:00.', HQ),
  video('int-priya-b', 'A014_C005_0716QT.mov', 'fo-interviews', 288, 17.8,
    ['interview', 'priya'], [], 'queued', G.night, 'Sc 07 · Tk 4',
    'Jul 16 · Harbormaster tower',
    'B-cam side angle — hold for reaction cutaways.', HQ),
  video('int-rosa-a', 'A016_C001_0718LM.mov', 'fo-interviews', 341, 21.1,
    ['interview', 'rosa', 'market'], ['V1 · 00:09:26:08'], 'ready', G.market,
    'Sc 11 · Tk 3', 'Jul 18 · Fish market stall',
    'Rosa Delgado between customers — keep the bell in the BG.', HQ),
  // ---- Footage · B-roll Harbor ----
  video('br-harbor-dawn', 'B023_C011_harbor-dawn.mov', 'fo-broll-harbor', 37,
    4.2, ['b-roll', 'harbor', 'dawn'],
    ['V1 · 00:00:00:00', 'V1 · 00:04:18:12', 'V2 · 00:08:02:00',
      'V1 · 00:15:47:08'],
    'ready', G.dawn, 'Day 3 · Card B023', 'Jul 15 · North quay, 05:40',
    'Hero opener — mist burns off over the fleet; hold full 15s head.'),
  video('br-gulls', 'B023_C014_gulls-lowpass.mov', 'fo-broll-harbor', 22, 2.5,
    ['b-roll', 'harbor'], [], 'ready', G.sea, 'Day 3 · Card B023',
    'Jul 15 · North quay',
    'Gulls skim the breakwater — slight focus buzz at 00:14.'),
  video('br-drone-breakwater', 'DJI_0142_breakwater.mp4', 'fo-broll-harbor',
    94, 3.1, ['b-roll', 'drone', 'harbor'], [], 'none', G.sea,
    'Day 4 · Drone A', 'Jul 16 · Breakwater orbit',
    'Orbit needs conform to 23.98 before it can cut in.',
    'H.264', '3840×2160', '29.97'),
  video('br-drone-fleet', 'DJI_0147_fleet-return.mp4', 'fo-broll-harbor', 128,
    4.6, ['b-roll', 'drone', 'harbor', 'dawn'],
    ['V1 · 00:02:05:16', 'V1 · 00:13:10:00'], 'queued', G.dawn,
    'Day 4 · Drone A', 'Jul 16 · Fleet return, 06:10',
    'Push-in on the returning fleet — golden light lands at 00:58.',
    'H.264', '3840×2160', '29.97'),
  video('br-nets-macro', 'B025_C002_nets-macro.mov', 'fo-broll-harbor', 41,
    4.7, ['b-roll', 'harbor'], [], 'ready', G.sea, 'Day 5 · Card B025',
    'Jul 17 · Slip 9',
    'Macro rack across salt-crusted nets — pairs with Elias VO.'),
  video('br-lighthouse', 'B025_C009_lighthouse-dusk.mov', 'fo-broll-harbor',
    58, 6.6, ['b-roll', 'harbor'], ['V1 · 00:16:40:04'], 'ready', G.night,
    'Day 5 · Card B025', 'Jul 17 · Point Ferris, dusk',
    'Closing image candidate — first beam sweep at 00:31.'),
  // ---- Footage · B-roll Town ----
  video('br-market-open', 'B027_C004_market-open.mov', 'fo-broll-town', 66,
    7.5, ['b-roll', 'market', 'town'], ['V1 · 00:08:55:00'], 'ready',
    G.market, 'Day 6 · Card B027', 'Jul 18 · Fish market, 06:30',
    'Shutters up, ice trays out — natural sound is usable.'),
  video('br-cannery', 'B027_C008_cannery-row.mov', 'fo-broll-town', 49, 5.6,
    ['b-roll', 'town'], [], 'none', G.market, 'Day 6 · Card B027',
    'Jul 18 · Cannery Row',
    'Rusted signage pans — awaiting proxy before review.'),
  video('br-pier-walk', 'GX010233_pier-walk.mp4', 'fo-broll-town', 154, 2.9,
    ['b-roll', 'town', 'harbor'], [], 'queued', G.sea,
    'Day 6 · GoPro chest rig', 'Jul 18 · Pier 4 walk-through',
    'POV walk for the 40% speed ramp — conform + stabilize.',
    'HEVC', '2704×1520', '59.94'),
  // ---- Audio · Dialog ----
  audio('au-elias-lav', 'HL_int_elias_lav_01.wav', 'au-dialog', 412, 0.14,
    ['dialog', 'elias', 'interview'],
    ['A1 · 00:00:12:08', 'A1 · 00:03:41:16', 'A1 · 00:07:19:12'],
    'Sc 04 · Lav ch1', 'Jul 14 · MixPre-6',
    'Elias lav — light cloth rustle around 04:20, dialog isolate ok.'),
  audio('au-priya-boom', 'HL_int_priya_boom_02.wav', 'au-dialog', 531, 0.18,
    ['dialog', 'priya', 'interview'],
    ['A1 · 00:05:02:20', 'A1 · 00:14:33:04'], 'Sc 07 · Boom ch2',
    'Jul 16 · MixPre-6',
    'Boom is the keeper — tower HVAC notched at 240 Hz.'),
  // ---- Audio · Ambience ----
  audio('au-amb-dawn', 'HL_amb_harbor_dawn_ST.wav', 'au-ambience', 623, 0.21,
    ['ambience', 'harbor', 'dawn'],
    ['A2 · 00:00:00:00', 'A2 · 00:04:18:12', 'A2 · 00:08:02:00',
      'A2 · 00:15:47:08'],
    'Stereo ORTF', 'Jul 15 · North quay, 05:30',
    'Bed under the opener — halyards, water slap, distant diesel.'),
  audio('au-amb-market', 'HL_amb_fishmarket_walla.wav', 'au-ambience', 447,
    0.15, ['ambience', 'market'], [], 'Stereo ORTF', 'Jul 18 · Fish market',
    'Walla + ice shovel texture for the Rosa section.'),
  // ---- Audio · Music ----
  audio('au-score-tides', 'HL_score_tides_theme_v3.wav', 'au-music', 218,
    0.07, ['score', 'theme'], ['A3 · 00:00:41:12'], 'Cue 1M1 · v3',
    'Jun 30 · Composer bounce',
    'Main theme — v3 drops the cello entrance to 00:22.'),
  audio('au-score-undertow', 'HL_score_undertow_cue2.wav', 'au-music', 164,
    0.05, ['score'], [], 'Cue 2M3 · v1', 'Jun 30 · Composer bounce',
    'Tension cue for the storm-season passage — unplaced.'),
  // ---- Graphics ----
  graphic('gfx-title-main', 'HL_title_main_v2.png', 0, 0.02,
    ['title', 'graphics'], ['V2 · 00:00:08:00'], 'Title card · v2',
    'Design drop · Jun 28',
    'Main title over the dawn opener — 4s hold, 12-frame fade.',
    'PNG 16-bit', 'Still'),
  graphic('gfx-lower-elias', 'HL_lowerthird_elias.mov', 8, 0.9,
    ['title', 'graphics', 'elias'],
    ['V2 · 00:00:14:16', 'V2 · 00:07:21:00', 'V2 · 00:11:04:08'],
    'Lower third · alpha', 'Design drop · Jun 28',
    'Animated lower third with alpha — "Elias Marr · Deckhand, 34 yrs".'),
  graphic('gfx-map-overlay', 'HL_map_overlay_harbor.mov', 12, 1.4,
    ['graphics', 'harbor'], ['V2 · 00:06:12:12'], 'Map animate-on',
    'Design drop · Jul 02',
    'Harbor chart animate-on for the shipping-lane explainer.'),
];

// ============= DERIVED FIXTURE HELPERS =============

const TOTAL_SIZE_GB = ASSETS.reduce((sum, a) => sum + a.sizeGb, 0);

const KIND_ICON: Record<AssetKind, typeof FilmIcon> = {
  video: FilmIcon,
  audio: AudioLinesIcon,
  graphic: ImageIcon,
};

const LEAF_BIN_ICON: Record<LeafBinId, typeof FolderIcon> = {
  'fo-interviews': FolderIcon,
  'fo-broll-harbor': FolderIcon,
  'fo-broll-town': FolderIcon,
  'au-dialog': MusicIcon,
  'au-ambience': MusicIcon,
  'au-music': MusicIcon,
  graphics: ImageIcon,
};

const PROXY_META: Record<
  ProxyStatus,
  {label: string; short: string; variant: 'success' | 'warning' | 'error'}
> = {
  ready: {label: 'Proxy ready', short: 'Ready', variant: 'success'},
  queued: {label: 'Proxy queued', short: 'Queued', variant: 'warning'},
  none: {label: 'No proxy', short: 'None', variant: 'error'},
};

/** Fixed 28-bar pseudo-waveform (heights in %) for audio thumb stages; each
 * asset offsets into it by name length so siblings read differently while
 * staying fully deterministic. */
const WAVE = [
  38, 62, 51, 74, 45, 68, 57, 80, 49, 66, 41, 72, 59, 84, 47, 63, 55, 77, 43,
  70, 52, 81, 46, 65, 58, 75, 40, 60,
];

/** Fixed filmstrip scrim opacities for the HoverCard preview; offset per
 * asset by name length — deterministic frame-to-frame variation. */
const STRIP_SHADES = [0.05, 0.3, 0.14, 0.38, 0.1, 0.24];

function matchesBin(asset: MediaAsset, binId: BinId): boolean {
  switch (binId) {
    case 'all':
      return true;
    case 'footage':
      return FOOTAGE_BINS.includes(asset.binId);
    case 'audio':
      return AUDIO_BINS.includes(asset.binId);
    case 'smart-used':
      return asset.usedIn.length > 0;
    case 'smart-proxy':
      return asset.proxy !== 'ready';
    default:
      return asset.binId === binId;
  }
}

function countInBin(binId: BinId): number {
  return ASSETS.filter(a => matchesBin(a, binId)).length;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // The demo stage auto-heights; this wrapper pins Layout height="fill".
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Bin rail: TreeList scrolls, drive footer pinned.
  binRail: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  binScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  binFooter: {padding: 'var(--spacing-3)'},
  binCount: {
    fontFamily: MONO, fontVariantNumeric: 'tabular-nums', fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  // Content column: dropzone + toolbar fixed, browser area scrolls.
  contentCol: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  // Import dropzone strip — dashed, token-pure, never a Card.
  dropzone: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
    flexWrap: 'wrap', rowGap: 'var(--spacing-2)', margin: 'var(--spacing-3)',
    marginBottom: 0, padding: 'var(--spacing-2) var(--spacing-3)',
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  dropzoneMeter: {width: 180},
  // Filter toolbar row under the dropzone.
  filterRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap', rowGap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  tagRail: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
    flexWrap: 'wrap', rowGap: 'var(--spacing-1)',
  },
  // Slider thumb at 0 must never overlap the "Size" caption — the wrapper
  // reserves inline padding (footgun: scrubbers/sliders).
  sizeSliderWrap: {width: 150, paddingInline: 'var(--spacing-2)'},
  browserScroll: {
    flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-2)',
  },
  // ---- Grid tiles ----
  grid: {display: 'grid', gap: 'var(--spacing-3)'},
  tile: {
    display: 'flex', flexDirection: 'column', padding: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)', overflow: 'hidden',
    backgroundColor: 'var(--color-background-card)', cursor: 'pointer',
    textAlign: 'left', font: 'inherit', color: 'inherit',
  },
  tileSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  // Thumb stage: scheme-locked dark footage stand-in (see Color policy).
  thumbStage: {
    position: 'relative', aspectRatio: '16 / 9', colorScheme: 'dark',
    overflow: 'hidden', flexShrink: 0,
  },
  thumbVignette: {
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(2,6,23,0.28) 0%, rgba(2,6,23,0) 34%, rgba(2,6,23,0) 62%, rgba(2,6,23,0.42) 100%)',
  },
  durationBadge: {
    position: 'absolute', right: 6, bottom: 6, padding: '1px 6px',
    borderRadius: 4, backgroundColor: 'rgba(2, 6, 23, 0.72)',
    color: '#E2E8F0', fontFamily: MONO, fontSize: 11,
    fontVariantNumeric: 'tabular-nums', lineHeight: '16px',
  },
  usageBadge: {
    position: 'absolute', left: 6, top: 6, display: 'inline-flex',
    alignItems: 'center', gap: 3, padding: '1px 6px', borderRadius: 4,
    backgroundColor: 'rgba(2, 6, 23, 0.72)', color: '#7DD3FC',
    fontFamily: MONO, fontSize: 11, fontVariantNumeric: 'tabular-nums',
    lineHeight: '16px',
  },
  proxyDotWrap: {position: 'absolute', right: 6, top: 6},
  waveRow: {
    position: 'absolute', insetInline: 10, bottom: 12, top: '38%',
    display: 'flex', alignItems: 'flex-end', gap: 2,
  },
  waveBar: {
    flex: 1, minWidth: 1, borderRadius: 1,
    backgroundColor: 'rgba(125, 211, 252, 0.75)',
  },
  graphicGlyph: {
    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: 'rgba(226, 232, 240, 0.85)',
  },
  tileBody: {
    display: 'flex', flexDirection: 'column', gap: 4,
    padding: 'var(--spacing-2)',
  },
  tileName: {
    fontFamily: MONO, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden',
    textOverflow: 'ellipsis', color: 'var(--color-text-primary)',
  },
  pillRow: {display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap'},
  pill: {
    padding: '0 6px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)', fontFamily: MONO, fontSize: 10,
    fontVariantNumeric: 'tabular-nums', lineHeight: '16px',
    whiteSpace: 'nowrap',
  },
  // ---- List mode ----
  // Fixed column grid; the wrapper owns horizontal scroll below 932px so
  // numeric columns never truncate mid-token.
  listWrap: {overflowX: 'auto'},
  listRow: {
    display: 'grid',
    gridTemplateColumns:
      '56px minmax(220px, 1fr) 72px 118px 96px 64px 76px 104px 56px',
    alignItems: 'center', columnGap: 'var(--spacing-2)', minWidth: 932,
    width: '100%', padding: '6px var(--spacing-2)', border: 0,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'transparent', cursor: 'pointer', textAlign: 'left',
    font: 'inherit', color: 'inherit',
  },
  listRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 2px 0 0 var(--color-accent)',
  },
  listHead: {
    display: 'grid',
    gridTemplateColumns:
      '56px minmax(220px, 1fr) 72px 118px 96px 64px 76px 104px 56px',
    columnGap: 'var(--spacing-2)', minWidth: 932,
    padding: '4px var(--spacing-2)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  listThumb: {
    position: 'relative', width: 56, height: 32, borderRadius: 4,
    overflow: 'hidden', colorScheme: 'dark', flexShrink: 0,
  },
  numCell: {
    textAlign: 'end', fontFamily: MONO, fontVariantNumeric: 'tabular-nums',
    fontSize: 12, color: 'var(--color-text-primary)', whiteSpace: 'nowrap',
  },
  textCell: {
    fontFamily: MONO, fontSize: 12, color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  nameCell: {
    fontFamily: MONO, fontSize: 12, color: 'var(--color-text-primary)',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
    minWidth: 0,
  },
  // ---- HoverCard preview ----
  preview: {width: 288, display: 'flex', flexDirection: 'column', gap: 8},
  previewStage: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 6,
    overflow: 'hidden',
    colorScheme: 'dark',
  },
  previewLabel: {
    position: 'absolute', top: 8, left: 10, fontFamily: MONO, fontSize: 10,
    letterSpacing: '0.06em', color: 'rgba(226, 232, 240, 0.78)',
  },
  filmstrip: {display: 'flex', gap: 2, height: 24},
  filmstripFrame: {
    position: 'relative', flex: 1, borderRadius: 2, overflow: 'hidden',
    colorScheme: 'dark',
  },
  filmstripScrim: {position: 'absolute', inset: 0, backgroundColor: '#020617'},
  previewMetaRow: {display: 'flex', gap: 8, alignItems: 'baseline'},
  previewMetaKey: {
    width: 72, flexShrink: 0, fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  previewMetaVal: {
    fontFamily: MONO, fontSize: 11, fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-primary)', overflowWrap: 'anywhere',
  },
  // Footer status bar.
  statusBar: {flexWrap: 'nowrap', minWidth: 0},
  driveMeter: {width: 140},
};

// Kind tint for list icons — data-categorical tokens with repo-standard
// fallbacks (the demo does not inject these tokens).
const KIND_TINT: Record<AssetKind, string> = {
  video: 'var(--color-data-categorical-blue,   light-dark(#0171E3, #4C9EFF))',
  audio: 'var(--color-data-categorical-green,  light-dark(#0B991F, #34C759))',
  graphic: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
};

// ============= THUMB STAGE =============

/** Rotated slice of the fixed WAVE array — deterministic per asset. */
function waveFor(asset: MediaAsset): number[] {
  const offset = asset.name.length % WAVE.length;
  return [...WAVE.slice(offset), ...WAVE.slice(0, offset)];
}

/** Scheme-locked dark footage stand-in: gradient stage plus a per-kind
 * center treatment (waveform bars for audio, glyph for graphics). */
function ThumbStage({
  asset,
  isMini = false,
}: {
  asset: MediaAsset;
  isMini?: boolean;
}) {
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: asset.thumb}} />
      {asset.kind === 'audio' ? (
        <div
          style={{
            ...styles.waveRow,
            ...(isMini ? {insetInline: 4, bottom: 4, top: '30%', gap: 1} : null),
          }}
          aria-hidden>
          {waveFor(asset).map((v, i) => (
            <span
              // Fixed fixture array — index keys are stable.
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              style={{...styles.waveBar, height: `${v}%`}}
            />
          ))}
        </div>
      ) : null}
      {asset.kind === 'graphic' && !isMini ? (
        <div style={styles.graphicGlyph} aria-hidden>
          <Icon icon={ImageIcon} size="lg" color="inherit" />
        </div>
      ) : null}
      <div style={styles.thumbVignette} aria-hidden />
    </>
  );
}

// ============= HOVER PREVIEW CARD =============

function PreviewMetaRow({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.previewMetaRow}>
      <span style={styles.previewMetaKey}>{label}</span>
      <span style={styles.previewMetaVal}>{value}</span>
    </div>
  );
}

/** HoverCard body: filmstrip preview + full metadata + usage placements. */
function AssetPreviewCard({asset}: {asset: MediaAsset}) {
  const shadeOffset = asset.name.length % STRIP_SHADES.length;
  const proxyMeta = PROXY_META[asset.proxy];
  return (
    <div style={styles.preview}>
      <div style={{...styles.previewStage, background: asset.thumb}}>
        <ThumbStage asset={asset} />
        <span style={styles.previewLabel}>
          {asset.kind === 'audio' ? 'SOURCE · WAVEFORM' : 'SOURCE PREVIEW'}
        </span>
        {asset.durationSec > 0 ? (
          <span style={styles.durationBadge}>
            {formatTimecode(asset.durationSec)}
          </span>
        ) : null}
      </div>
      {asset.kind !== 'audio' ? (
        <div style={styles.filmstrip} aria-hidden>
          {STRIP_SHADES.map((_, i) => {
            const shade =
              STRIP_SHADES[(i + shadeOffset) % STRIP_SHADES.length];
            return (
              <span
                // Fixed fixture array — index keys are stable.
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                style={{...styles.filmstripFrame, background: asset.thumb}}>
                <span style={{...styles.filmstripScrim, opacity: shade}} />
              </span>
            );
          })}
        </div>
      ) : null}
      <VStack gap={0}>
        <Text type="body" weight="semibold" style={styles.mono} maxLines={1}>
          {asset.name}
        </Text>
        <Text type="supporting" color="secondary">
          {BIN_LABEL[asset.binId]} · {asset.scene}
        </Text>
      </VStack>
      <VStack gap={1}>
        <PreviewMetaRow
          label="Format"
          value={`${asset.codec} · ${asset.fps}${
            asset.res === '—' ? '' : ` · ${asset.res}`
          }`}
        />
        <PreviewMetaRow
          label="Duration"
          value={
            asset.durationSec > 0 ? formatTimecode(asset.durationSec) : 'Still'
          }
        />
        <PreviewMetaRow label="Size" value={formatGb(asset.sizeGb)} />
        <PreviewMetaRow label="Recorded" value={asset.recorded} />
      </VStack>
      <Divider />
      <HStack gap={1} vAlign="center">
        <StatusDot variant={proxyMeta.variant} label={proxyMeta.label} />
        <Text type="supporting" color="secondary">
          {proxyMeta.label}
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        {asset.usedIn.length > 0 ? (
          <Badge label={`Used ×${asset.usedIn.length}`} variant="info" />
        ) : (
          <Badge label="Unused" variant="neutral" />
        )}
      </HStack>
      {asset.usedIn.length > 0 ? (
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Timeline placements
          </Text>
          {asset.usedIn.map(placement => (
            <Text
              key={placement}
              type="supporting"
              hasTabularNumbers
              style={styles.mono}>
              {placement}
            </Text>
          ))}
        </VStack>
      ) : null}
      <Text type="supporting" color="secondary">
        {asset.note}
      </Text>
    </div>
  );
}

// ============= GRID TILE =============

function GridTile({
  asset,
  isSelected,
  onSelect,
}: {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}) {
  const proxyMeta = PROXY_META[asset.proxy];
  return (
    <HoverCard
      content={<AssetPreviewCard asset={asset} />}
      placement="above"
      hasHoverIndication={false}>
      <button
        type="button"
        style={{...styles.tile, ...(isSelected ? styles.tileSelected : null)}}
        aria-pressed={isSelected}
        aria-label={`${asset.name}, ${BIN_LABEL[asset.binId]}, ${asset.codec}`}
        onClick={() => onSelect(asset.id)}>
        <div style={styles.thumbStage}>
          <ThumbStage asset={asset} />
          {asset.usedIn.length > 0 ? (
            <Tooltip
              content={`Used ${asset.usedIn.length}× in the timeline`}>
              <span style={styles.usageBadge}>
                <Icon icon={LayersIcon} size="xsm" color="inherit" />
                {`×${asset.usedIn.length}`}
              </span>
            </Tooltip>
          ) : null}
          <span style={styles.proxyDotWrap}>
            <StatusDot
              variant={proxyMeta.variant}
              label={proxyMeta.label}
              tooltip={proxyMeta.label}
            />
          </span>
          {asset.durationSec > 0 ? (
            <span style={styles.durationBadge}>
              {formatDuration(asset.durationSec)}
            </span>
          ) : null}
        </div>
        <div style={styles.tileBody}>
          <span style={styles.tileName}>{asset.name}</span>
          <div style={styles.pillRow}>
            <span style={styles.pill}>{asset.codec}</span>
            {asset.res !== '—' ? (
              <span style={styles.pill}>{asset.res}</span>
            ) : null}
            <span style={styles.pill}>{asset.fps}</span>
          </div>
        </div>
      </button>
    </HoverCard>
  );
}

// ============= LIST ROW =============

const LIST_COLUMNS: {label: string; isNumeric?: boolean}[] = [
  {label: ''},
  {label: 'Name'},
  {label: 'Duration', isNumeric: true},
  {label: 'Codec'},
  {label: 'Resolution'},
  {label: 'Rate', isNumeric: true},
  {label: 'Size', isNumeric: true},
  {label: 'Proxy'},
  {label: 'Used', isNumeric: true},
];

function ListHeaderRow() {
  return (
    <div style={styles.listHead} aria-hidden>
      {LIST_COLUMNS.map(col => (
        <Text
          key={col.label || 'thumb'}
          type="label"
          size="sm"
          color="secondary"
          style={col.isNumeric ? {textAlign: 'end'} : undefined}>
          {col.label}
        </Text>
      ))}
    </div>
  );
}

function ListRow({
  asset,
  isSelected,
  onSelect,
}: {
  asset: MediaAsset;
  isSelected: boolean;
  onSelect: (assetId: string) => void;
}) {
  const proxyMeta = PROXY_META[asset.proxy];
  return (
    <HoverCard
      content={<AssetPreviewCard asset={asset} />}
      placement="above"
      alignment="start"
      hasHoverIndication={false}>
      <button
        type="button"
        style={{
          ...styles.listRow,
          ...(isSelected ? styles.listRowSelected : null),
        }}
        aria-pressed={isSelected}
        aria-label={`${asset.name}, ${BIN_LABEL[asset.binId]}, ${asset.codec}`}
        onClick={() => onSelect(asset.id)}>
        <span style={styles.listThumb}>
          <ThumbStage asset={asset} isMini />
        </span>
        <span style={{minWidth: 0, display: 'flex', alignItems: 'center', gap: 6}}>
          <span style={{color: KIND_TINT[asset.kind], display: 'inline-flex'}}>
            <Icon icon={KIND_ICON[asset.kind]} size="xsm" color="inherit" />
          </span>
          <span style={styles.nameCell}>{asset.name}</span>
        </span>
        <span style={styles.numCell}>
          {asset.durationSec > 0 ? formatDuration(asset.durationSec) : '—'}
        </span>
        <span style={styles.textCell}>{asset.codec}</span>
        <span style={styles.textCell}>{asset.res}</span>
        <span style={styles.numCell}>{asset.fps}</span>
        <span style={styles.numCell}>{formatGb(asset.sizeGb)}</span>
        <span style={{display: 'flex', alignItems: 'center', gap: 6}}>
          <StatusDot variant={proxyMeta.variant} label={proxyMeta.label} />
          <span style={styles.textCell}>{proxyMeta.short}</span>
        </span>
        <span style={styles.numCell}>
          {asset.usedIn.length > 0 ? `×${asset.usedIn.length}` : '—'}
        </span>
      </button>
    </HoverCard>
  );
}

// ============= PAGE =============

const SORT_OPTIONS = [
  {value: 'name', label: 'Name A–Z'},
  {value: 'duration', label: 'Duration'},
  {value: 'size', label: 'File size'},
];

// Compact (<=960px) bin picker — mirrors the rail tree, flattened.
const BIN_SELECT_OPTIONS = [
  {value: 'all', label: 'All media'},
  {value: 'footage', label: 'Footage — all'},
  {value: 'fo-interviews', label: 'Footage · Interviews'},
  {value: 'fo-broll-harbor', label: 'Footage · B-roll Harbor'},
  {value: 'fo-broll-town', label: 'Footage · B-roll Town'},
  {value: 'audio', label: 'Audio — all'},
  {value: 'au-dialog', label: 'Audio · Dialog'},
  {value: 'au-ambience', label: 'Audio · Ambience'},
  {value: 'au-music', label: 'Audio · Music'},
  {value: 'graphics', label: 'Graphics'},
  {value: 'smart-used', label: 'Smart · Used in timeline'},
  {value: 'smart-proxy', label: 'Smart · Needs proxy'},
];

export default function VideoEditorMediaBinTemplate() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeBin, setActiveBin] = useState<BinId>(INITIAL_BIN);
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(
    INITIAL_SELECTED_ASSET,
  );
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [thumbSize, setThumbSize] = useState(148);

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const visibleAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = ASSETS.filter(asset => {
      if (!matchesBin(asset, activeBin)) {
        return false;
      }
      if (
        activeTags.length > 0 &&
        !activeTags.every(tag => asset.tags.includes(tag))
      ) {
        return false;
      }
      if (q.length > 0) {
        const haystack = `${asset.name} ${asset.tags.join(' ')} ${
          asset.scene
        }`.toLowerCase();
        return haystack.includes(q);
      }
      return true;
    });
    return [...matches].sort((a, b) => {
      switch (sortKey) {
        case 'duration':
          return b.durationSec - a.durationSec;
        case 'size':
          return b.sizeGb - a.sizeGb;
        default:
          return a.name.localeCompare(b.name);
      }
    });
  }, [activeBin, activeTags, query, sortKey]);

  const selectedAsset =
    ASSETS.find(a => a.id === selectedAssetId) ?? null;
  const visibleSizeGb = visibleAssets.reduce((sum, a) => sum + a.sizeGb, 0);

  const toggleTag = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag],
    );
  };
  const selectAsset = (assetId: string) => {
    setSelectedAssetId(prev => (prev === assetId ? null : assetId));
  };
  const selectBin = (binId: BinId) => {
    setActiveBin(binId);
  };

  // ----- Bin rail tree items -----
  const binLeaf = (id: LeafBinId): TreeListItemData => ({
    id,
    label: BIN_LABEL[id],
    startContent: (
      <Icon icon={LEAF_BIN_ICON[id]} size="sm" color="secondary" />
    ),
    endContent: <span style={styles.binCount}>{countInBin(id)}</span>,
    isSelected: activeBin === id,
    onClick: () => selectBin(id),
  });
  const binTreeItems: TreeListItemData[] = [
    {
      id: 'all',
      label: BIN_LABEL.all,
      startContent: <Icon icon={ClapperboardIcon} size="sm" color="secondary" />,
      endContent: <span style={styles.binCount}>{ASSETS.length}</span>,
      isSelected: activeBin === 'all',
      onClick: () => selectBin('all'),
    },
    {
      id: 'footage',
      label: BIN_LABEL.footage,
      startContent: <Icon icon={FilmIcon} size="sm" color="secondary" />,
      endContent: <span style={styles.binCount}>{countInBin('footage')}</span>,
      isSelected: activeBin === 'footage',
      isExpanded: true,
      onClick: () => selectBin('footage'),
      children: FOOTAGE_BINS.map(binLeaf),
    },
    {
      id: 'audio',
      label: BIN_LABEL.audio,
      startContent: <Icon icon={AudioLinesIcon} size="sm" color="secondary" />,
      endContent: <span style={styles.binCount}>{countInBin('audio')}</span>,
      isSelected: activeBin === 'audio',
      isExpanded: true,
      onClick: () => selectBin('audio'),
      children: AUDIO_BINS.map(binLeaf),
    },
    binLeaf('graphics'),
  ];
  const smartTreeItems: TreeListItemData[] = [
    {
      id: 'smart-used',
      label: BIN_LABEL['smart-used'],
      startContent: <Icon icon={LayersIcon} size="sm" color="secondary" />,
      endContent: (
        <span style={styles.binCount}>{countInBin('smart-used')}</span>
      ),
      isSelected: activeBin === 'smart-used',
      onClick: () => selectBin('smart-used'),
    },
    {
      id: 'smart-proxy',
      label: BIN_LABEL['smart-proxy'],
      startContent: <Icon icon={ZapIcon} size="sm" color="secondary" />,
      endContent: (
        <span style={styles.binCount}>{countInBin('smart-proxy')}</span>
      ),
      isSelected: activeBin === 'smart-proxy',
      onClick: () => selectBin('smart-proxy'),
    },
  ];

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Synced" variant="success" />
            {!isCompact ? (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Media bin · {ASSETS.length} assets ·{' '}
                {formatGb(TOTAL_SIZE_GB)}
              </Text>
            ) : null}
          </HStack>
        </StackItem>
        <TextInput
          label="Search media"
          isLabelHidden
          size="sm"
          width={isCompact ? 168 : 240}
          placeholder="Search name, tag, scene…"
          startIcon={SearchIcon}
          hasClear
          value={query}
          onChange={setQuery}
        />
        <SegmentedControl
          value={viewMode}
          onChange={v => setViewMode(v as ViewMode)}
          label="Browser view"
          size="sm">
          <SegmentedControlItem
            value="grid"
            label="Grid"
            icon={<Icon icon={LayoutGridIcon} size="sm" color="inherit" />}
          />
          <SegmentedControlItem
            value="list"
            label="List"
            icon={<Icon icon={ListIcon} size="sm" color="inherit" />}
          />
        </SegmentedControl>
        <Button
          label="Import media"
          variant="primary"
          size="sm"
          icon={<Icon icon={UploadIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Bin rail (248px) -----
  const binRail = (
    <LayoutPanel width={248} padding={0} hasDivider label="Project bins">
      <div style={styles.binRail}>
        <div style={styles.binScroll}>
          <VStack gap={3}>
            <TreeList
              density="compact"
              items={binTreeItems}
              header={
                <Text type="label" size="sm" color="secondary">
                  Bins
                </Text>
              }
            />
            <TreeList
              density="compact"
              items={smartTreeItems}
              header={
                <Text type="label" size="sm" color="secondary">
                  Smart bins
                </Text>
              }
            />
          </VStack>
        </div>
        <Divider />
        <div style={styles.binFooter}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Scratch drive
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers style={styles.mono}>
                {formatGb(TOTAL_SIZE_GB)} / 2 TB
              </Text>
            </HStack>
            <ProgressBar
              value={TOTAL_SIZE_GB}
              max={DRIVE_TOTAL_GB}
              label="Scratch drive usage"
              isLabelHidden
            />
          </VStack>
        </div>
      </div>
    </LayoutPanel>
  );

  // ----- Import dropzone strip -----
  const isLeafBin =
    activeBin !== 'all' &&
    activeBin !== 'footage' &&
    activeBin !== 'audio' &&
    activeBin !== 'smart-used' &&
    activeBin !== 'smart-proxy';
  const dropTargetLabel = isLeafBin ? BIN_LABEL[activeBin] : 'All media';
  const dropzone = (
    <div style={styles.dropzone}>
      <Icon icon={UploadIcon} size="md" color="secondary" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" weight="semibold">
            Drop media to import
          </Text>
          <Text type="supporting" color="secondary">
            Files land in “{dropTargetLabel}” · proxies queue automatically
          </Text>
        </VStack>
      </StackItem>
      {!isCompact ? (
        <div style={styles.dropzoneMeter}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary" maxLines={1}>
                  <span style={styles.mono}>A016_C002_0718LM.mov</span>
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers style={styles.mono}>
                62%
              </Text>
            </HStack>
            <ProgressBar
              value={62}
              max={100}
              label="Importing A016_C002_0718LM.mov"
              isLabelHidden
            />
          </VStack>
        </div>
      ) : null}
      <Badge label="2 queued" variant="info" />
      <Button label="Browse files" variant="secondary" size="sm" onClick={() => {}} />
    </div>
  );

  // ----- Filter toolbar -----
  const filterToolbar = (
    <div style={styles.filterRow}>
      {isNarrow ? (
        <Selector
          label="Bin"
          isLabelHidden
          size="sm"
          options={BIN_SELECT_OPTIONS}
          value={activeBin}
          onChange={v => selectBin(v as BinId)}
        />
      ) : null}
      <StackItem size="fill">
        <div style={styles.tagRail}>
          {TAG_RAIL.map(tag => {
            const isActive = activeTags.includes(tag);
            return (
              <Token
                key={tag}
                label={`#${tag}`}
                size="sm"
                color={isActive ? 'blue' : 'default'}
                onClick={() => toggleTag(tag)}
                onRemove={isActive ? () => toggleTag(tag) : undefined}
              />
            );
          })}
        </div>
      </StackItem>
      <Selector
        label="Sort by"
        isLabelHidden
        size="sm"
        options={SORT_OPTIONS}
        value={sortKey}
        onChange={v => setSortKey(v as SortKey)}
      />
      {viewMode === 'grid' && !isCompact ? (
        <div style={styles.sizeSliderWrap}>
          <Slider
            label="Thumbnail size"
            isLabelHidden
            value={thumbSize}
            min={112}
            max={220}
            step={12}
            valueDisplay="none"
            onChange={(v: number) => setThumbSize(v)}
          />
        </div>
      ) : null}
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {visibleAssets.length} of {ASSETS.length} · {formatGb(visibleSizeGb)}
      </Text>
    </div>
  );

  // ----- Browser body (grid / list / empty) -----
  const gridThumb = isCompact ? 148 : thumbSize;
  let browserBody: ReactNode;
  if (visibleAssets.length === 0) {
    browserBody = (
      <EmptyState
        isCompact
        icon={<Icon icon={SearchIcon} size="lg" />}
        title="No media matches"
        description={`Nothing in “${BIN_LABEL[activeBin]}” matches the current search and tag filters.`}
        actions={
          <Button
            label="Clear filters"
            variant="secondary"
            size="sm"
            onClick={() => {
              setQuery('');
              setActiveTags([]);
            }}
          />
        }
      />
    );
  } else if (viewMode === 'grid') {
    browserBody = (
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridThumb}px, 1fr))`,
        }}>
        {visibleAssets.map(asset => (
          <GridTile
            key={asset.id}
            asset={asset}
            isSelected={asset.id === selectedAssetId}
            onSelect={selectAsset}
          />
        ))}
      </div>
    );
  } else {
    browserBody = (
      <div style={styles.listWrap}>
        <ListHeaderRow />
        {visibleAssets.map(asset => (
          <ListRow
            key={asset.id}
            asset={asset}
            isSelected={asset.id === selectedAssetId}
            onSelect={selectAsset}
          />
        ))}
      </div>
    );
  }

  const content = (
    <LayoutContent padding={0}>
      <div style={styles.contentCol}>
        {dropzone}
        {filterToolbar}
        <Divider />
        <div style={styles.browserScroll}>{browserBody}</div>
      </div>
    </LayoutContent>
  );

  // ----- Footer status bar -----
  const footer = (
    <LayoutFooter hasDivider>
      <HStack gap={3} vAlign="center" style={styles.statusBar}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {ASSETS.length} assets · {formatGb(TOTAL_SIZE_GB)} media
        </Text>
        <StackItem size="fill">
          {!isNarrow && selectedAsset != null ? (
            <HStack gap={2} vAlign="center">
              <Icon
                icon={KIND_ICON[selectedAsset.kind]}
                size="sm"
                color="secondary"
              />
              <Text type="supporting" style={styles.mono} maxLines={1}>
                {selectedAsset.name}
              </Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {selectedAsset.durationSec > 0
                  ? formatTimecode(selectedAsset.durationSec)
                  : 'Still'}{' '}
                · {selectedAsset.codec} · {formatGb(selectedAsset.sizeGb)}
              </Text>
            </HStack>
          ) : (
            <span />
          )}
        </StackItem>
        <div style={styles.driveMeter}>
          <ProgressBar
            value={TOTAL_SIZE_GB}
            max={DRIVE_TOTAL_GB}
            label="Scratch drive usage"
            isLabelHidden
          />
        </div>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {Math.round((TOTAL_SIZE_GB / DRIVE_TOTAL_GB) * 100)}% of 2 TB
        </Text>
      </HStack>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={isNarrow ? undefined : binRail}
        content={content}
        footer={footer}
      />
    </div>
  );
}
