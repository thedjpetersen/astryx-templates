// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (six shots from the "Harbor Light"
 *   documentary reel 2 — each with a CSS-gradient still, SMPTE source
 *   timecode, camera metadata, a seeded luma-waveform profile, a
 *   vectorscope blob profile, and one-to-four grade versions carrying full
 *   lift/gamma/gain wheel values plus temp/tint/contrast/sat and a LUT id;
 *   six film-emulation LUTs with preview swatch gradients; three reference
 *   stills with shot-match grades)
 * @output DaVinci-style color grading suite: a 52px header (project name,
 *   reel Badge, bypass EyeOff ToggleButton, Grab Still, primary Render), a
 *   264px left shot bin (six gradient still thumbnails with status Badges
 *   plus a reference-still gallery and Shot Match button), a center viewer
 *   (16:9 scheme-locked stage with graded LUT tint overlay, reference wipe
 *   split + wipe Slider, grade-version chip row, LUT browser strip with
 *   preview swatches) — the defining regions: a 336px right scopes panel
 *   (SVG luma waveform with IRE graticule, SVG vectorscope with R/Mg/B/Cy/
 *   G/Yl targets and skin-tone line, trace intensity Slider, YRGB curves
 *   thumbnail) and a 296px bottom wheels dock with three trackball wheels
 *   (lift/gamma/gain) — conic hue rings, clickable trackball faces with
 *   crosshair + offset dot, master value Sliders, live signed RGB offset
 *   readouts, per-wheel reset — plus temp/tint/contrast/sat trim sliders
 * @position Page template; emitted by `astryx template
 *   video-editor-color-grading`
 *
 * Frame: root div at 100dvh wraps Layout height="fill", zero page scroll.
 * LayoutHeader carries project chrome. Middle band: LayoutPanel start 264
 * (shot bin + reference stills), LayoutContent (viewer column), LayoutPanel
 * end 336 (scopes). LayoutFooter height 296 hosts the wheels dock. The
 * waveform trace, vectorscope blob, wheel dots, and RGB readouts all derive
 * from ONE Grade object per shot+version, so every scope and readout moves
 * together when a wheel, trim slider, LUT, or version chip changes. The
 * only trackball-and-scopes surface — choose over video-clip-timeline when
 * the user grades shots rather than arranges clips on lanes.
 *
 * Responsive contract:
 * - >1160px: header | bin 264 | viewer (fill) | scopes 336 | dock 296.
 * - <=1160px: the scopes panel drops out (scope SegmentedControl in the
 *   header region is not shown); viewer and dock keep their sizes.
 * - <=900px: the shot bin drops out too; the viewer toolbar gains a shot
 *   stepper (prev/next IconButtons) so every shot stays reachable; header
 *   hides the fps/color-space text; the wheels dock scrolls horizontally
 *   (three 176px wheel columns + trims are wider than a phone by design).
 * - The header row and version chip row wrap (flexWrap) instead of
 *   clipping at every width.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels
 * everywhere; the only Card is the curves-thumbnail widget in the scopes
 * panel. Stills, swatches, and the viewer stage are styled divs with CSS
 * gradients — never <video> or network media.
 *
 * Color policy: four surfaces are deliberately scheme-locked dark and use
 * intentional literals, because their real-world counterparts stay dark in
 * both schemes — (1) the viewer stage and every shot/reference/LUT still
 * gradient (footage stand-ins), (2) the scope faces (broadcast scopes are
 * always near-black; trace green #7CE7A2, graticule slate rgba values),
 * (3) the trackball faces and conic hue rings (physical grading-panel
 * hardware), (4) the curves thumbnail (R/G/B channel literals). All are
 * pinned with colorScheme: 'dark'. Everything outside those surfaces is
 * token-pure or an explicit light-dark() pair (status tints, chip borders).
 */

import {useState, type CSSProperties, type MouseEvent} from 'react';

import {
  ApertureIcon,
  CameraIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  PlusIcon,
  RotateCcwIcon,
  SeparatorVerticalIcon,
  WandSparklesIcon,
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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PROJECT CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const REEL_NAME = 'Reel 2 — The Keeper';
const COLOR_SPACE = 'DaVinci WG → Rec.709-A';
const FPS = 24;

const MONO = 'var(--font-family-code, monospace)';

// Frame geometry.
const SHOT_BIN_W = 264;
const SCOPES_W = 336;
const DOCK_H = 296;
const WHEEL_OUTER = 128; // conic hue ring outer diameter
const WHEEL_FACE = 100; // trackball face diameter inside the ring
const WAVE_COLS = 44; // luma waveform column count

// Scope face literals — broadcast scopes stay near-black in both schemes
// (see the header Color policy), so these are intentional literals.
const SCOPE_BG = '#0B0E14';
const SCOPE_GRID = 'rgba(148, 163, 184, 0.28)';
const SCOPE_LABEL = 'rgba(148, 163, 184, 0.85)';
const TRACE_GREEN = '#7CE7A2';
const SKIN_LINE = 'rgba(244, 173, 127, 0.75)';

// ============= TYPES =============

type ShotStatus = 'graded' | 'in-progress' | 'ungraded';
type WheelId = 'lift' | 'gamma' | 'gain';
type ScopeMode = 'wave' | 'vector' | 'both';
type CurveMode = 'yrgb' | 'huesat';

/** One trackball: x/y is the unit-circle color offset (y up = warm/red
 * axis), master is the luminance ring value in [-0.5, 0.5]. */
interface WheelValue {
  x: number;
  y: number;
  master: number;
}

/** The whole primary grade for one shot version. Every scope, wheel dot,
 * readout, and viewer tint derives from this one object. Ranges: temp/tint
 * -100..100, contrast 0.6..1.6 (1 = unity), sat 0..2 (1 = unity). */
interface Grade {
  lift: WheelValue;
  gamma: WheelValue;
  gain: WheelValue;
  temp: number;
  tint: number;
  contrast: number;
  sat: number;
  lutId: string;
}

interface GradeVersion {
  id: string;
  label: string;
  note: string;
  grade: Grade;
}

/** Seed for the deterministic luma waveform generator — a pure function of
 * column index; no clocks, no randomness. base = mean IRE; amp/amp2 +
 * f1/f2/phase shape two sines; band(:Var) = trace thickness; tilt =
 * left-right exposure tilt. */
interface WaveSeed {
  base: number;
  amp: number;
  amp2: number;
  f1: number;
  f2: number;
  phase: number;
  band: number;
  bandVar: number;
  tilt: number;
}

/** Vectorscope energy blob: polar position (angle deg, 0 = 3 o'clock CCW;
 * dist 0..1 of radius) + ellipse spread (viewBox px, rot deg) + skinLobe
 * 0..1 sizing the skin-tone lobe on the I-line. */
interface VectorBlob {
  angle: number;
  dist: number;
  major: number;
  minor: number;
  rot: number;
  skinLobe: number;
}

interface Shot {
  id: string;
  clipName: string;
  scene: string;
  tcIn: string; // SMPTE source in-point
  durSec: number;
  camera: string;
  status: ShotStatus;
  still: string; // CSS gradient literal — footage stand-in
  wave: WaveSeed;
  blob: VectorBlob;
  versions: GradeVersion[];
}

interface RefStill {
  id: string;
  label: string;
  source: string;
  still: string;
  matchGrade: Grade; // applied by the Shot Match button
}

interface Lut {
  id: string;
  name: string;
  family: string;
  swatch: string; // preview swatch gradient — footage stand-in literal
  tint: string; // viewer overlay gradient when this LUT is active
}

// ============= GRADE FIXTURES =============

const wheelValue = (x: number, y: number, master: number): WheelValue => ({
  x,
  y,
  master,
});

const UNITY_WHEEL = wheelValue(0, 0, 0);

const makeGrade = (
  lift: WheelValue, gamma: WheelValue, gain: WheelValue, temp: number,
  tint: number, contrast: number, sat: number, lutId: string,
): Grade => ({lift, gamma, gain, temp, tint, contrast, sat, lutId});

const UNITY_GRADE = makeGrade(
  UNITY_WHEEL, UNITY_WHEEL, UNITY_WHEEL, 0, 0, 1, 1, 'rec709-neutral',
);

/** Compact fixture literal: 13 numbers in wheel order
 * [liftX, liftY, liftM, gammaX, gammaY, gammaM, gainX, gainY, gainM,
 * temp, tint, contrast, sat] + the LUT id. */
const g13 = (n: number[], lutId: string): Grade =>
  makeGrade(
    wheelValue(n[0], n[1], n[2]), wheelValue(n[3], n[4], n[5]),
    wheelValue(n[6], n[7], n[8]), n[9], n[10], n[11], n[12], lutId,
  );

/** Compact GradeVersion fixture literal. */
const gv = (
  id: string, label: string, note: string, n: number[], lutId: string,
): GradeVersion => ({id, label, note, grade: g13(n, lutId)});

// ============= SHOT FIXTURES =============
// Six shots from Harbor Light reel 2. Still gradients are footage
// stand-ins (scheme-locked dark, intentional literals).

const SHOTS: Shot[] = [
  {
    id: 'sh-01',
    clipName: 'A012_C034_0715KD.braw',
    scene: 'Sc 12 — harbor dawn wide',
    tcIn: '06:12:04:11',
    durSec: 8,
    camera: 'URSA 12K · 5.6K',
    status: 'graded',
    still: 'linear-gradient(160deg, #D9884A 0%, #8A6152 38%, #27404F 100%)',
    wave: {base: 52, amp: 14, amp2: 6, f1: 3, f2: 9, phase: 1.1, band: 26, bandVar: 8, tilt: 10},
    blob: {angle: 24, dist: 0.3, major: 34, minor: 20, rot: 28, skinLobe: 0.2},
    versions: [
      gv('v1', 'Dawn master', 'Approved 07/01 — matches Still 12.',
        [-0.12, -0.06, -0.04, 0.08, 0.14, 0.02, 0.1, 0.18, 0.08, 18, -4, 1.12, 1.08], 'kodak-2383'),
    ],
  },
  {
    id: 'sh-02',
    clipName: 'A012_C036_0715KD.braw',
    scene: 'Sc 12 — nets detail',
    tcIn: '06:14:22:03',
    durSec: 5,
    camera: 'URSA 12K · 5.6K',
    status: 'graded',
    still: 'linear-gradient(150deg, #4E6B5A 0%, #2E4A47 55%, #172A31 100%)',
    wave: {base: 40, amp: 10, amp2: 8, f1: 5, f2: 11, phase: 0.4, band: 22, bandVar: 6, tilt: -6},
    blob: {angle: 210, dist: 0.22, major: 26, minor: 16, rot: -18, skinLobe: 0},
    versions: [
      gv('v1', 'Match sc 12', 'Pulled greens toward the dawn master.',
        [0.04, -0.1, -0.06, -0.08, 0.05, 0, -0.05, 0.09, 0.05, 8, -10, 1.08, 0.96], 'kodak-2383'),
    ],
  },
  {
    id: 'sh-03',
    clipName: 'B007_C011_0716KD.braw',
    scene: 'Sc 14 — keeper interview',
    tcIn: '11:03:48:17',
    durSec: 22,
    camera: 'URSA 12K · 4K',
    status: 'in-progress',
    still: 'linear-gradient(140deg, #6B4F3E 0%, #3E3630 45%, #1C222B 100%)',
    wave: {base: 46, amp: 8, amp2: 5, f1: 2, f2: 7, phase: 2.2, band: 30, bandVar: 10, tilt: 4},
    blob: {angle: 118, dist: 0.26, major: 30, minor: 22, rot: 12, skinLobe: 0.85},
    versions: [
      gv('v1', 'Base balance', 'Neutralized the practical tungsten spill.',
        [0, 0, -0.02, 0.02, 0.04, 0.01, -0.03, 0.02, 0.04, -6, 2, 1.02, 1], 'rec709-neutral'),
      gv('v2', 'Warm key', 'Lifted face key +1/3 stop, warmed mids.',
        [-0.04, -0.05, -0.03, 0.1, 0.16, 0.05, 0.04, 0.1, 0.06, 22, -2, 1.08, 1.05], 'fuji-3513'),
      gv('v3', 'Teal push', 'Show-LUT pass; shadows toward harbor teal.',
        [0.16, -0.14, -0.05, 0.06, 0.1, 0.02, -0.08, 0.14, 0.09, 12, -8, 1.16, 1.12], 'harbor-teal'),
      gv('v4', 'Final trim', 'Client notes 07/02: -2 sat, protect skin.',
        [0.12, -0.1, -0.04, 0.05, 0.09, 0.02, -0.06, 0.12, 0.07, 10, -6, 1.12, 1.02], 'harbor-teal'),
    ],
  },
  {
    id: 'sh-04',
    clipName: 'A013_C002_0716KD.braw',
    scene: 'Sc 15 — lighthouse ext dusk',
    tcIn: '19:41:12:00',
    durSec: 11,
    camera: 'URSA 12K · 5.6K',
    status: 'in-progress',
    still: 'linear-gradient(170deg, #7E5A78 0%, #45415E 48%, #1B2740 100%)',
    wave: {base: 34, amp: 12, amp2: 7, f1: 4, f2: 10, phase: 0.9, band: 20, bandVar: 7, tilt: -12},
    blob: {angle: 300, dist: 0.32, major: 32, minor: 18, rot: -32, skinLobe: 0},
    versions: [
      gv('v1', 'Dusk balance', 'Cooled highlights; held the beacon warm.',
        [0.08, -0.04, -0.08, 0.02, -0.02, -0.03, -0.12, -0.06, 0.1, -18, 8, 1.18, 1.1], 'arri-k1s1'),
      gv('v2', 'Beacon bloom', 'Gain toward amber for the lamp turn-on.',
        [0.06, -0.05, -0.07, 0.04, 0.03, -0.01, 0.02, 0.16, 0.12, -8, 4, 1.2, 1.14], 'harbor-teal'),
    ],
  },
  {
    id: 'sh-05',
    clipName: 'C004_C019_0717KD.braw',
    scene: 'Sc 16 — ferry crossing',
    tcIn: '09:22:37:09',
    durSec: 9,
    camera: 'Pocket 6K Pro',
    status: 'ungraded',
    still: 'linear-gradient(155deg, #8E9BA6 0%, #5E7182 50%, #2C3B4C 100%)',
    wave: {base: 58, amp: 9, amp2: 4, f1: 6, f2: 13, phase: 1.7, band: 18, bandVar: 5, tilt: 6},
    blob: {angle: 250, dist: 0.14, major: 22, minor: 14, rot: 8, skinLobe: 0.1},
    versions: [
      {id: 'v1', label: 'Camera neutral', note: 'Untouched — awaiting grade.', grade: UNITY_GRADE},
    ],
  },
  {
    id: 'sh-06',
    clipName: 'B008_C003_0718KD.braw',
    scene: 'Sc 17 — gulls slow-mo',
    tcIn: '14:55:02:21',
    durSec: 6,
    camera: 'Pocket 6K Pro · 120fps',
    status: 'ungraded',
    still: 'linear-gradient(165deg, #B7BFC4 0%, #7C8B94 52%, #46545E 100%)',
    wave: {base: 66, amp: 7, amp2: 5, f1: 8, f2: 15, phase: 0.2, band: 16, bandVar: 6, tilt: 2},
    blob: {angle: 200, dist: 0.08, major: 18, minor: 12, rot: 0, skinLobe: 0},
    versions: [
      {id: 'v1', label: 'Camera neutral', note: 'Untouched — awaiting grade.', grade: UNITY_GRADE},
    ],
  },
];

// ============= REFERENCE STILLS (shot match gallery) =============

const REFERENCE_STILLS: RefStill[] = [
  {
    id: 'ref-12',
    label: 'Still 12 — dawn master',
    source: 'sh-01 · v1',
    still: 'linear-gradient(160deg, #E09355 0%, #93684F 40%, #21454F 100%)',
    matchGrade: g13(
      [-0.12, -0.06, -0.04, 0.08, 0.14, 0.02, 0.1, 0.18, 0.08, 18, -4, 1.12, 1.08], 'kodak-2383'),
  },
  {
    id: 'ref-18',
    label: 'Still 18 — interview key',
    source: 'sh-03 · v4',
    still: 'linear-gradient(140deg, #7A5A42 0%, #45403A 45%, #14232E 100%)',
    matchGrade: g13(
      [0.12, -0.1, -0.04, 0.05, 0.09, 0.02, -0.06, 0.12, 0.07, 10, -6, 1.12, 1.02], 'harbor-teal'),
  },
  {
    id: 'ref-04',
    label: 'Still 04 — exterior dusk',
    source: 'ep 1 gallery',
    still: 'linear-gradient(170deg, #8A5F80 0%, #4A4668 48%, #172441 100%)',
    matchGrade: g13(
      [0.08, -0.04, -0.08, 0.02, -0.02, -0.03, -0.12, -0.06, 0.1, -18, 8, 1.18, 1.1], 'arri-k1s1'),
  },
];

// ============= LUT BROWSER FIXTURES =============
// Swatches preview each LUT over the same harbor plate; tints overlay the
// viewer stage when the LUT is active. All footage-stand-in literals.

const LUTS: Lut[] = [
  {
    id: 'rec709-neutral', name: 'Rec709 Neutral', family: 'Technical',
    swatch: 'linear-gradient(120deg, #97A3AB 0%, #5C6E7C 55%, #2F3F4C 100%)',
    tint: 'linear-gradient(120deg, rgba(148, 163, 184, 0.05), rgba(30, 41, 59, 0.08))',
  },
  {
    id: 'kodak-2383', name: 'Kodak 2383 D55', family: 'Print film',
    swatch: 'linear-gradient(120deg, #D9925B 0%, #7C5F4E 50%, #1E3D48 100%)',
    tint: 'linear-gradient(120deg, rgba(217, 146, 91, 0.24), rgba(30, 61, 72, 0.3))',
  },
  {
    id: 'fuji-3513', name: 'Fuji 3513DI D65', family: 'Print film',
    swatch: 'linear-gradient(120deg, #CE9A6C 0%, #6E6552 50%, #2C4243 100%)',
    tint: 'linear-gradient(120deg, rgba(206, 154, 108, 0.2), rgba(44, 66, 67, 0.28))',
  },
  {
    id: 'harbor-teal', name: 'Harbor Teal 01', family: 'Show LUT',
    swatch: 'linear-gradient(120deg, #DE9048 0%, #55636A 45%, #0F3E4C 100%)',
    tint: 'linear-gradient(120deg, rgba(222, 144, 72, 0.26), rgba(15, 62, 76, 0.36))',
  },
  {
    id: 'arri-k1s1', name: 'ARRI K1S1 709', family: 'Camera',
    swatch: 'linear-gradient(120deg, #A8988C 0%, #66626E 50%, #2A3350 100%)',
    tint: 'linear-gradient(120deg, rgba(168, 152, 140, 0.16), rgba(42, 51, 80, 0.26))',
  },
  {
    id: 'bleach-06', name: 'Bleach Bypass 06', family: 'Creative',
    swatch: 'linear-gradient(120deg, #B9BDB9 0%, #6F7570 50%, #23292B 100%)',
    tint: 'linear-gradient(120deg, rgba(185, 189, 185, 0.14), rgba(35, 41, 43, 0.34))',
  },
];

const LUT_BY_ID = new Map(LUTS.map(lut => [lut.id, lut]));

// ============= DERIVATION HELPERS (pure, deterministic) =============

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

/** Trackball position -> signed RGB offsets. The three color axes sit at
 * 120° like a vectorscope: red up, green lower-left, blue lower-right. */
function wheelToRgb(w: WheelValue): {r: number; g: number; b: number} {
  return {
    r: w.master + 0.55 * w.y,
    g: w.master + 0.55 * (-0.5 * w.y - 0.866 * w.x),
    b: w.master + 0.55 * (-0.5 * w.y + 0.866 * w.x),
  };
}

const formatOffset = (v: number) =>
  `${v < 0 ? '-' : '+'}${Math.abs(v).toFixed(2)}`;

/** Deterministic per-shot luma columns (IRE lo/hi pairs) — pure function
 * of column index and the shot's WaveSeed. */
function buildWaveColumns(seed: WaveSeed): Array<{lo: number; hi: number}> {
  const cols: Array<{lo: number; hi: number}> = [];
  for (let i = 0; i < WAVE_COLS; i++) {
    const t = i / (WAVE_COLS - 1);
    const mid =
      seed.base +
      seed.tilt * (t - 0.5) * 2 +
      seed.amp * Math.sin(t * Math.PI * seed.f1) +
      seed.amp2 * Math.sin(t * Math.PI * seed.f2 + seed.phase);
    const band = seed.band + seed.bandVar * Math.sin(t * Math.PI * 3 + 1.3);
    cols.push({
      lo: clamp(mid - band / 2, 2, 96),
      hi: clamp(mid + band / 2, 4, 100),
    });
  }
  return cols;
}

const WAVE_BY_SHOT = new Map(
  SHOTS.map(shot => [shot.id, buildWaveColumns(shot.wave)]),
);

/** Push one IRE value through the active grade so the waveform trace
 * responds to lift/gamma/gain/contrast in real time. */
function gradeLuma(ire: number, grade: Grade): number {
  const lifted = ire + grade.lift.master * 26;
  const gained = lifted * (1 + grade.gain.master * 0.65);
  const midBoost = grade.gamma.master * 52 * (ire / 100) * (1 - ire / 100) * 2;
  return clamp(50 + (gained + midBoost - 50) * grade.contrast, 0, 104);
}

/** Polar helper for the vectorscope (0° = 3 o'clock, CCW positive, SVG y
 * axis points down so we negate). */
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad)};
}

// Standard 75% vectorscope target angles.
const VECTOR_TARGETS: Array<{key: string; deg: number}> = [
  {key: 'R', deg: 103},
  {key: 'Mg', deg: 61},
  {key: 'B', deg: 347},
  {key: 'Cy', deg: 283},
  {key: 'G', deg: 241},
  {key: 'Yl', deg: 167},
];
const SKIN_LINE_DEG = 123; // I-line / skin-tone indicator

const STATUS_META: Record<ShotStatus, {label: string; variant: 'success' | 'info' | 'neutral'}> = {
  graded: {label: 'Graded', variant: 'success'},
  'in-progress': {label: 'In progress', variant: 'info'},
  ungraded: {label: 'Ungraded', variant: 'neutral'},
};

const WHEEL_META: Array<{id: WheelId; label: string; caption: string}> = [
  {id: 'lift', label: 'Lift', caption: 'Shadows'},
  {id: 'gamma', label: 'Gamma', caption: 'Midtones'},
  {id: 'gain', label: 'Gain', caption: 'Highlights'},
];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // The demo stage auto-heights; the root div gives Layout a real height
  // so internal panels can scroll (webhook-delivery-debugger idiom).
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // ----- Shot bin (left panel) -----
  binScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)', minHeight: 0},
  shotRow: {
    display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center', width: '100%',
    padding: 'var(--spacing-2)', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent', backgroundColor: 'transparent',
    cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
    overflow: 'hidden',
  },
  // min-width 0 lets the filename/scene Text ellipsize instead of pushing
  // the status Badge past the row's selection outline.
  shotMeta: {
    minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column',
  },
  shotRowSelected: {
    border: 'var(--border-width) solid var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // 56x32 gradient still — footage stand-in, scheme-locked dark.
  shotThumb: {
    width: 56, height: 32, flexShrink: 0, borderRadius: 4, colorScheme: 'dark',
    border: '1px solid rgba(148, 163, 184, 0.35)',
  },
  refThumb: {
    width: '100%', aspectRatio: '16 / 9', borderRadius: 4, colorScheme: 'dark',
    border: '1px solid rgba(148, 163, 184, 0.35)',
  },
  refButton: {
    display: 'block', width: '100%', padding: 4, borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent', backgroundColor: 'transparent',
    cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
  },
  // ----- Viewer (center) -----
  viewerBackdrop: {
    height: '100%', minHeight: 0, overflowY: 'auto',
    backgroundColor: 'var(--color-background-muted)', padding: 'var(--spacing-4)',
    display: 'flex', flexDirection: 'column',
  },
  viewerColumn: {
    width: '100%', maxWidth: 640, marginInline: 'auto',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)',
  },
  // 16:9 stage — scheme-locked dark footage stand-in (header Color policy).
  stage: {
    position: 'relative', aspectRatio: '16 / 9', borderRadius: 'var(--radius-container)',
    overflow: 'hidden', colorScheme: 'dark', boxShadow: 'var(--shadow-high)',
  },
  // Graded LUT tint sits above the still; the wipe clips its width.
  gradeOverlay: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  wipeLine: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(241, 245, 249, 0.9)', pointerEvents: 'none',
  },
  wipeTag: {
    position: 'absolute', bottom: 8, fontFamily: MONO, fontSize: 9,
    letterSpacing: '0.08em', color: 'rgba(226, 232, 240, 0.85)',
    backgroundColor: 'rgba(15, 23, 42, 0.65)', paddingInline: 5, paddingBlock: 2,
    borderRadius: 3, pointerEvents: 'none',
  },
  stageLabel: {
    position: 'absolute', top: 8, left: 10, fontFamily: MONO, fontSize: 11,
    letterSpacing: '0.05em', color: 'rgba(226, 232, 240, 0.85)',
    textShadow: '0 1px 2px rgba(2, 6, 23, 0.8)',
  },
  stageTc: {
    position: 'absolute', top: 8, right: 10, fontFamily: MONO, fontSize: 11,
    fontVariantNumeric: 'tabular-nums', color: 'rgba(226, 232, 240, 0.85)',
    textShadow: '0 1px 2px rgba(2, 6, 23, 0.8)',
  },
  stageLut: {
    position: 'absolute', bottom: 8, left: 10, fontFamily: MONO, fontSize: 10,
    color: 'rgba(148, 163, 184, 0.9)', textShadow: '0 1px 2px rgba(2, 6, 23, 0.8)',
  },
  stageBypass: {position: 'absolute', bottom: 8, right: 10},
  // ----- Version chips + LUT strip -----
  versionRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  lutStrip: {display: 'flex', gap: 'var(--spacing-2)', overflowX: 'auto', padding: 2},
  lutButton: {
    flexShrink: 0, width: 88, padding: '4px 4px 6px', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
  },
  lutSwatch: {
    width: '100%', height: 36, borderRadius: 4, colorScheme: 'dark',
    border: '1px solid rgba(148, 163, 184, 0.3)',
  },
  lutName: {
    display: 'block', marginTop: 4, fontSize: 10, lineHeight: '13px',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  // ----- Scopes panel -----
  // Block scroller (not flex) so the scope boxes keep their intrinsic
  // SVG aspect height instead of flex-shrinking into clipped slivers.
  scopesScroll: {
    height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-3)',
  },
  // Scope faces: broadcast-scope black in both schemes (Color policy).
  scopeBox: {
    borderRadius: 'var(--radius-container)', overflow: 'hidden', backgroundColor: SCOPE_BG,
    colorScheme: 'dark', border: 'var(--border-width) solid var(--color-border)',
  },
  scopeSvg: {display: 'block', width: '100%', height: 'auto'},
  curveSvg: {display: 'block', width: '100%', height: 'auto', borderRadius: 4},
  // ----- Wheels dock -----
  dock: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  dockBody: {
    flex: 1, minHeight: 0, display: 'flex', gap: 'var(--spacing-4)', alignItems: 'stretch',
    paddingInline: 'var(--spacing-4)', paddingBlock: 'var(--spacing-2)', overflowX: 'auto',
  },
  wheelCol: {
    width: 176, flexShrink: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 'var(--spacing-1)',
  },
  wheelHeadRow: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  // Conic hue ring — physical grading-panel hardware, scheme-locked.
  wheelRing: {
    position: 'relative', width: WHEEL_OUTER, height: WHEEL_OUTER, borderRadius: '50%',
    padding: (WHEEL_OUTER - WHEEL_FACE) / 2,
    background:
      'conic-gradient(#F43F5E, #D946EF, #6366F1, #38BDF8, #34D399, #FACC15, #FB923C, #F43F5E)',
    colorScheme: 'dark', boxShadow: 'var(--shadow-low, 0 1px 2px rgba(2, 6, 23, 0.3))',
    border: 'none', cursor: 'crosshair', display: 'block',
  },
  wheelFace: {
    position: 'relative', width: WHEEL_FACE, height: WHEEL_FACE, borderRadius: '50%',
    background:
      'radial-gradient(circle at 35% 30%, #3B4353 0%, #232936 55%, #161B25 100%)',
    border: '1px solid rgba(15, 23, 42, 0.9)', overflow: 'hidden',
  },
  wheelCrossH: {
    position: 'absolute', left: 8, right: 8, top: '50%', height: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  wheelCrossV: {
    position: 'absolute', top: 8, bottom: 8, left: '50%', width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
  },
  wheelDot: {
    position: 'absolute', width: 10, height: 10, borderRadius: '50%',
    backgroundColor: '#F8FAFC', border: '2px solid rgba(15, 23, 42, 0.85)',
    transform: 'translate(-50%, -50%)', boxShadow: '0 0 6px rgba(248, 250, 252, 0.6)',
  },
  wheelRgbRow: {
    display: 'flex', gap: 'var(--spacing-2)', fontFamily: MONO, fontSize: 10,
    fontVariantNumeric: 'tabular-nums',
  },
  trimCol: {
    width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-2)', paddingTop: 2,
  },
  dockDivider: {alignSelf: 'stretch', flexShrink: 0},
};

// ============= SCOPES (SVG) =============

// Waveform plot geometry (viewBox units).
const WF_W = 312;
const WF_H = 170;
const WF_LEFT = 34;
const WF_RIGHT = 306;
const WF_TOP = 14; // 100 IRE
const WF_BOTTOM = 150; // 0 IRE
const ireToY = (ire: number) => WF_BOTTOM - (ire / 100) * (WF_BOTTOM - WF_TOP);

/** Luma waveform: IRE graticule + one green trace column per luma sample,
 * re-derived through the active grade every render. */
function LumaWaveform({
  shotId,
  grade,
  intensity, // 0..1 trace opacity multiplier
}: {shotId: string; grade: Grade; intensity: number}) {
  const columns = WAVE_BY_SHOT.get(shotId) ?? [];
  const colW = (WF_RIGHT - WF_LEFT) / WAVE_COLS;
  return (
    <svg
      viewBox={`0 0 ${WF_W} ${WF_H}`}
      style={styles.scopeSvg}
      role="img"
      aria-label="Luma waveform scope">
      {[0, 25, 50, 75, 100].map(ire => (
        <g key={ire}>
          <line
            x1={WF_LEFT} x2={WF_RIGHT} y1={ireToY(ire)} y2={ireToY(ire)}
            stroke={SCOPE_GRID} strokeWidth={ire === 0 || ire === 100 ? 1 : 0.5}
            strokeDasharray={ire === 0 || ire === 100 ? undefined : '3 3'}
          />
          <text
            x={WF_LEFT - 6} y={ireToY(ire) + 3} textAnchor="end" fontSize={8}
            fontFamily="monospace" fill={SCOPE_LABEL}>
            {ire}
          </text>
        </g>
      ))}
      {columns.map((col, i) => {
        const lo = gradeLuma(col.lo, grade);
        const hi = gradeLuma(col.hi, grade);
        const x = WF_LEFT + i * colW;
        const mid = (lo + hi) / 2;
        return (
          // Fixed fixture array — index keys are stable.
          // eslint-disable-next-line react/no-array-index-key
          <g key={i}>
            <rect
              x={x + 0.5} width={colW - 1} y={ireToY(hi)}
              height={Math.max(1, ireToY(lo) - ireToY(hi))}
              fill={TRACE_GREEN} opacity={0.28 * intensity}
            />
            <rect
              x={x + 0.5} width={colW - 1} y={ireToY(mid + 4)}
              height={Math.max(1, ireToY(mid - 4) - ireToY(mid + 4))}
              fill={TRACE_GREEN} opacity={0.75 * intensity}
            />
          </g>
        );
      })}
      <text
        x={WF_RIGHT} y={WF_H - 8} textAnchor="end" fontSize={8}
        fontFamily="monospace" fill={SCOPE_LABEL}>
        LUMA · IRE
      </text>
    </svg>
  );
}

/** Vectorscope: graticule rings, 75% R/Mg/B/Cy/G/Yl targets, skin-tone
 * I-line, and a chroma energy blob that follows the gamma wheel and
 * saturation trim. */
function Vectorscope({
  blob,
  grade,
  intensity,
}: {blob: VectorBlob; grade: Grade; intensity: number}) {
  const C = 120;
  const R = 100;
  const center = polar(C, C, blob.dist * R * grade.sat, blob.angle);
  const cx = center.x + grade.gamma.x * 14 + grade.temp * 0.06;
  const cy = center.y - grade.gamma.y * 14 + grade.tint * 0.04;
  const spread = Math.max(0.4, grade.sat);
  const skinTip = polar(C, C, R * 0.88, SKIN_LINE_DEG);
  const skinMid = polar(C, C, R * 0.34, SKIN_LINE_DEG);
  return (
    <svg
      viewBox="0 0 240 240"
      style={styles.scopeSvg}
      role="img"
      aria-label="Vectorscope">
      {[0.25, 0.5, 0.75, 1].map(f => (
        <circle
          key={f} cx={C} cy={C} r={R * f} fill="none" stroke={SCOPE_GRID}
          strokeWidth={f === 1 ? 1 : 0.5} strokeDasharray={f === 1 ? undefined : '3 4'}
        />
      ))}
      <line x1={C - R} x2={C + R} y1={C} y2={C} stroke={SCOPE_GRID} strokeWidth={0.5} />
      <line x1={C} x2={C} y1={C - R} y2={C + R} stroke={SCOPE_GRID} strokeWidth={0.5} />
      <line
        x1={C} y1={C} x2={skinTip.x} y2={skinTip.y}
        stroke={SKIN_LINE} strokeWidth={1} strokeDasharray="5 3"
      />
      {VECTOR_TARGETS.map(target => {
        const box = polar(C, C, R * 0.75, target.deg);
        const tag = polar(C, C, R * 0.93, target.deg);
        return (
          <g key={target.key}>
            <rect
              x={box.x - 6} y={box.y - 6} width={12} height={12}
              fill="none" stroke={SCOPE_LABEL} strokeWidth={0.8}
            />
            <text
              x={tag.x} y={tag.y + 3} textAnchor="middle" fontSize={8}
              fontFamily="monospace" fill={SCOPE_LABEL}>
              {target.key}
            </text>
          </g>
        );
      })}
      <g transform={`rotate(${-blob.rot} ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={blob.major * spread} ry={blob.minor * spread} fill={TRACE_GREEN} opacity={0.18 * intensity} />
        <ellipse cx={cx} cy={cy} rx={blob.major * 0.62 * spread} ry={blob.minor * 0.62 * spread} fill={TRACE_GREEN} opacity={0.3 * intensity} />
        <ellipse cx={cx} cy={cy} rx={blob.major * 0.3 * spread} ry={blob.minor * 0.3 * spread} fill={TRACE_GREEN} opacity={0.55 * intensity} />
      </g>
      {blob.skinLobe > 0 && (
        <ellipse
          cx={skinMid.x} cy={skinMid.y}
          rx={16 * blob.skinLobe * spread} ry={7 * blob.skinLobe * spread}
          transform={`rotate(${-SKIN_LINE_DEG} ${skinMid.x} ${skinMid.y})`}
          fill={TRACE_GREEN} opacity={0.4 * intensity}
        />
      )}
      <text x={C + R} y={232} textAnchor="end" fontSize={8} fontFamily="monospace" fill={SCOPE_LABEL}>
        VECTOR · 75%
      </text>
    </svg>
  );
}

// Channel literals for the curves thumbnail (dark scope face) and the RGB
// readouts under each wheel (token surface -> light-dark pairs).
const CURVE_CHANNELS: Array<{key: 'r' | 'g' | 'b'; stroke: string}> = [
  {key: 'r', stroke: '#F87171'},
  {key: 'g', stroke: '#4ADE80'},
  {key: 'b', stroke: '#60A5FA'},
];
const READOUT_COLORS: Record<'r' | 'g' | 'b', string> = {
  r: 'light-dark(#DC2626, #F87171)',
  g: 'light-dark(#15803D, #4ADE80)',
  b: 'light-dark(#2563EB, #60A5FA)',
};

/** Curves thumbnail: YRGB channel curves whose midpoints follow the gamma
 * wheel, or a Hue-vs-Sat ribbon; toggled by a SegmentedControl. */
function CurvesThumb({mode, grade}: {mode: CurveMode; grade: Grade}) {
  const left = 12;
  const right = 284;
  const top = 12;
  const bottom = 118;
  const midX = (left + right) / 2;
  const gammaRgb = wheelToRgb(grade.gamma);
  const gridX = [0.25, 0.5, 0.75].map(f => left + (right - left) * f);
  const gridY = [0.25, 0.5, 0.75].map(f => top + (bottom - top) * f);
  const hueSatPoints = Array.from({length: 25}, (_, i) => {
    const t = i / 24;
    const x = left + (right - left) * t;
    const y =
      65 -
      (grade.sat - 1) * 26 -
      10 * Math.sin(t * Math.PI * 3 + 0.6) -
      5 * Math.sin(t * Math.PI * 7);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg
      viewBox="0 0 296 130"
      style={styles.curveSvg}
      role="img"
      aria-label={mode === 'yrgb' ? 'YRGB curves thumbnail' : 'Hue versus saturation curve thumbnail'}>
      <rect x={0} y={0} width={296} height={130} fill={SCOPE_BG} />
      {gridX.map(x => (
        <line key={`x${x}`} x1={x} x2={x} y1={top} y2={bottom} stroke={SCOPE_GRID} strokeWidth={0.5} strokeDasharray="3 3" />
      ))}
      {gridY.map(y => (
        <line key={`y${y}`} x1={left} x2={right} y1={y} y2={y} stroke={SCOPE_GRID} strokeWidth={0.5} strokeDasharray="3 3" />
      ))}
      {mode === 'yrgb' ? (
        <>
          <line x1={left} y1={bottom} x2={right} y2={top} stroke={SCOPE_GRID} strokeWidth={1} strokeDasharray="4 3" />
          {CURVE_CHANNELS.map(ch => {
            const lift = (grade.contrast - 1) * 18;
            const midY = 65 - gammaRgb[ch.key] * 120;
            return (
              <path
                key={ch.key}
                d={`M ${left} ${bottom + Math.min(0, -lift)} Q ${midX} ${midY} ${right} ${top - Math.max(-6, -lift)}`}
                fill="none"
                stroke={ch.stroke}
                strokeWidth={1.4}
                opacity={0.9}
              />
            );
          })}
        </>
      ) : (
        <>
          <line x1={left} x2={right} y1={65} y2={65} stroke={SCOPE_GRID} strokeWidth={1} strokeDasharray="4 3" />
          <polyline points={hueSatPoints} fill="none" stroke={TRACE_GREEN} strokeWidth={1.4} opacity={0.9} />
        </>
      )}
    </svg>
  );
}

// ============= TRACKBALL WHEEL =============

/** One lift/gamma/gain trackball: conic hue ring, clickable face with
 * crosshair + offset dot, master Slider, live signed RGB readouts. */
function TrackballWheel({
  meta,
  value,
  isDisabled,
  onPosition,
  onMaster,
  onReset,
}: {
  meta: {id: WheelId; label: string; caption: string};
  value: WheelValue;
  isDisabled: boolean;
  onPosition: (x: number, y: number) => void;
  onMaster: (master: number) => void;
  onReset: () => void;
}) {
  const rgb = wheelToRgb(value);
  const isUnity = value.x === 0 && value.y === 0 && value.master === 0;
  const handleFaceClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isDisabled) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const half = rect.width / 2;
    let x = (event.clientX - rect.left - half) / (half - 10);
    let y = -(event.clientY - rect.top - half) / (half - 10);
    const mag = Math.hypot(x, y);
    if (mag > 1) {
      x /= mag;
      y /= mag;
    }
    onPosition(Math.round(x * 100) / 100, Math.round(y * 100) / 100);
  };
  return (
    <div style={{...styles.wheelCol, opacity: isDisabled ? 0.5 : 1}}>
      <div style={styles.wheelHeadRow}>
        <HStack gap={1} vAlign="center">
          <Text type="label" weight="semibold">
            {meta.label}
          </Text>
          <Text type="supporting" color="secondary">
            {meta.caption}
          </Text>
        </HStack>
        <IconButton
          label={`Reset ${meta.label}`}
          tooltip={`Reset ${meta.label.toLowerCase()} to unity`} variant="ghost" size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          isDisabled={isDisabled || isUnity} onClick={onReset}
        />
      </div>
      <button
        type="button"
        style={styles.wheelRing}
        disabled={isDisabled}
        aria-label={`${meta.label} trackball — click to set the color offset; currently x ${value.x.toFixed(2)}, y ${value.y.toFixed(2)}`}
        onClick={handleFaceClick}>
        <span style={styles.wheelFace}>
          <span style={styles.wheelCrossH} aria-hidden />
          <span style={styles.wheelCrossV} aria-hidden />
          <span
            style={{
              ...styles.wheelDot,
              left: `${50 + value.x * 42}%`,
              top: `${50 - value.y * 42}%`,
            }}
            aria-hidden
          />
        </span>
      </button>
      <Slider
        label={`${meta.label} master`} isLabelHidden value={value.master}
        min={-0.5} max={0.5} step={0.01} width={150} isDisabled={isDisabled}
        valueDisplay="text" formatValue={v => formatOffset(v)}
        onChange={(v: number) => onMaster(v)}
      />
      <div style={styles.wheelRgbRow} aria-hidden>
        {(['r', 'g', 'b'] as const).map(ch => (
          <span key={ch} style={{color: READOUT_COLORS[ch]}}>
            {ch.toUpperCase()} {formatOffset(rgb[ch])}
          </span>
        ))}
      </div>
    </div>
  );
}

// ============= SHOT BIN (left panel) =============

function ShotBin({
  selectedShotId,
  selectedRefId,
  onSelectShot,
  onSelectRef,
  onShotMatch,
}: {
  selectedShotId: string;
  selectedRefId: string;
  onSelectShot: (shotId: string) => void;
  onSelectRef: (refId: string) => void;
  onShotMatch: () => void;
}) {
  return (
    <div style={styles.binScroll}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="label" color="secondary">
            Timeline shots · {SHOTS.length}
          </Text>
          <VStack gap={0.5}>
            {SHOTS.map(shot => {
              const isSelected = shot.id === selectedShotId;
              const status = STATUS_META[shot.status];
              return (
                <button
                  key={shot.id}
                  type="button"
                  style={{
                    ...styles.shotRow,
                    ...(isSelected ? styles.shotRowSelected : undefined),
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Grade shot ${shot.clipName}, ${shot.scene}, ${status.label}`}
                  onClick={() => onSelectShot(shot.id)}>
                  <span
                    style={{...styles.shotThumb, background: shot.still}}
                    aria-hidden
                  />
                  <span style={styles.shotMeta}>
                    <Text type="supporting" weight="semibold" maxLines={1} style={styles.mono}>
                      {shot.clipName}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {shot.scene}
                    </Text>
                    <HStack gap={1} vAlign="center">
                      <Text type="supporting" color="secondary" hasTabularNumbers style={styles.mono}>
                        {shot.tcIn}
                      </Text>
                      <Badge label={status.label} variant={status.variant} />
                    </HStack>
                  </span>
                </button>
              );
            })}
          </VStack>
        </VStack>
        <Divider />
        <VStack gap={2}>
          <Text type="label" color="secondary">
            Reference stills
          </Text>
          {REFERENCE_STILLS.map(ref => {
            const isSelected = ref.id === selectedRefId;
            return (
              <button
                key={ref.id}
                type="button"
                style={{
                  ...styles.refButton,
                  ...(isSelected
                    ? {border: 'var(--border-width) solid var(--color-accent)'}
                    : undefined),
                }}
                aria-pressed={isSelected}
                aria-label={`Reference ${ref.label} from ${ref.source}`}
                onClick={() => onSelectRef(ref.id)}>
                <span style={{...styles.refThumb, background: ref.still, display: 'block'}} aria-hidden />
                <VStack gap={0}>
                  <Text type="supporting" weight="semibold" maxLines={1}>
                    {ref.label}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1} style={styles.mono}>
                    {ref.source}
                  </Text>
                </VStack>
              </button>
            );
          })}
          <Button
            label="Shot match"
            variant="secondary"
            size="sm"
            icon={<Icon icon={WandSparklesIcon} size="sm" color="inherit" />}
            onClick={onShotMatch}
          />
          <Text type="supporting" color="secondary">
            Copies the selected still&apos;s balance onto the current version.
          </Text>
        </VStack>
      </VStack>
    </div>
  );
}

// ============= SCOPES PANEL (right) =============

function ScopesPanel({
  shot,
  grade,
  scopeMode,
  intensity,
  curveMode,
  onScopeModeChange,
  onIntensityChange,
  onCurveModeChange,
}: {
  shot: Shot; grade: Grade; scopeMode: ScopeMode;
  intensity: number; // 20..100
  curveMode: CurveMode;
  onScopeModeChange: (mode: ScopeMode) => void;
  onIntensityChange: (value: number) => void;
  onCurveModeChange: (mode: CurveMode) => void;
}) {
  const traceOpacity = intensity / 100;
  return (
    <div style={styles.scopesScroll}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Scopes
            </Text>
          </StackItem>
          <SegmentedControl
            value={scopeMode}
            onChange={v => onScopeModeChange(v as ScopeMode)}
            label="Scope display"
            size="sm">
            <SegmentedControlItem value="wave" label="Wave" />
            <SegmentedControlItem value="vector" label="Vector" />
            <SegmentedControlItem value="both" label="Both" />
          </SegmentedControl>
        </HStack>
        {scopeMode !== 'vector' && (
          <div style={styles.scopeBox}>
            <LumaWaveform shotId={shot.id} grade={grade} intensity={traceOpacity} />
          </div>
        )}
        {scopeMode !== 'wave' && (
          <div style={styles.scopeBox}>
            <Vectorscope blob={shot.blob} grade={grade} intensity={traceOpacity} />
          </div>
        )}
        <Slider
          label="Trace intensity" value={intensity} min={20} max={100} step={5}
          valueDisplay="text" formatValue={v => `${v}%`}
          onChange={(v: number) => onIntensityChange(v)}
        />
        <Card padding={2}>
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label" weight="semibold">
                  Curves
                </Text>
              </StackItem>
              <SegmentedControl
                value={curveMode}
                onChange={v => onCurveModeChange(v as CurveMode)}
                label="Curve mode"
                size="sm">
                <SegmentedControlItem value="yrgb" label="YRGB" />
                <SegmentedControlItem value="huesat" label="Hue-Sat" />
              </SegmentedControl>
            </HStack>
            <div style={styles.scopeBox}>
              <CurvesThumb mode={curveMode} grade={grade} />
            </div>
            <Text type="supporting" color="secondary">
              {curveMode === 'yrgb'
                ? 'Channel curves follow the gamma wheel and contrast trim.'
                : 'Hue vs Sat ribbon follows the saturation trim.'}
            </Text>
          </VStack>
        </Card>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

export default function VideoEditorColorGradingTemplate() {
  const [selectedShotId, setSelectedShotId] = useState('sh-03');
  const [versionByShot, setVersionByShot] = useState<Record<string, string>>({
    'sh-03': 'v3',
  });
  // Versions added with the "+" chip — cloned from the active grade.
  const [addedVersions, setAddedVersions] = useState<
    Record<string, GradeVersion[]>
  >({});
  // Wheel/trim/LUT edits keyed by `${shotId}/${versionId}`; unedited
  // versions fall through to their fixture grade.
  const [gradeEdits, setGradeEdits] = useState<Record<string, Grade>>({});
  const [isBypassed, setIsBypassed] = useState(false);
  const [isWipeOn, setIsWipeOn] = useState(false);
  const [wipePct, setWipePct] = useState(55);
  const [selectedRefId, setSelectedRefId] = useState('ref-18');
  const [scopeMode, setScopeMode] = useState<ScopeMode>('both');
  const [traceIntensity, setTraceIntensity] = useState(70);
  const [curveMode, setCurveMode] = useState<CurveMode>('yrgb');

  const isNarrow = useMediaQuery('(max-width: 1160px)'); // scopes drop
  const isCompact = useMediaQuery('(max-width: 900px)'); // shot bin drops

  const shotIndex = Math.max(
    0,
    SHOTS.findIndex(s => s.id === selectedShotId),
  );
  const shot = SHOTS[shotIndex];
  const versions = [...shot.versions, ...(addedVersions[shot.id] ?? [])];
  const activeVersionId =
    versionByShot[shot.id] ?? versions[versions.length - 1].id;
  const activeVersion =
    versions.find(v => v.id === activeVersionId) ?? versions[0];
  const gradeKey = `${shot.id}/${activeVersion.id}`;
  const grade = gradeEdits[gradeKey] ?? activeVersion.grade;
  // Scopes, viewer tint, and curves all read the effective grade so the
  // bypass toggle flattens every readout together.
  const effectiveGrade = isBypassed ? UNITY_GRADE : grade;
  const activeLut = LUT_BY_ID.get(grade.lutId) ?? LUTS[0];
  const isEdited = gradeEdits[gradeKey] != null;

  const patchGrade = (patch: Partial<Grade>) => {
    setGradeEdits(prev => ({
      ...prev,
      [gradeKey]: {...(prev[gradeKey] ?? activeVersion.grade), ...patch},
    }));
  };
  const patchWheel = (id: WheelId, patch: Partial<WheelValue>) => {
    patchGrade({[id]: {...grade[id], ...patch}});
  };
  const resetGrade = () => {
    setGradeEdits(prev => {
      const next = {...prev};
      delete next[gradeKey];
      return next;
    });
  };
  const addVersion = () => {
    const nextIndex = versions.length + 1;
    const newVersion: GradeVersion = {
      id: `v${nextIndex}`,
      label: `Trim ${nextIndex}`,
      note: `Cloned from ${activeVersion.id} · ${activeVersion.label}.`,
      grade,
    };
    setAddedVersions(prev => ({
      ...prev,
      [shot.id]: [...(prev[shot.id] ?? []), newVersion],
    }));
    setVersionByShot(prev => ({...prev, [shot.id]: newVersion.id}));
  };
  const applyShotMatch = () => {
    const ref = REFERENCE_STILLS.find(r => r.id === selectedRefId);
    if (ref != null) {
      setGradeEdits(prev => ({...prev, [gradeKey]: ref.matchGrade}));
    }
  };
  const stepShot = (delta: number) => {
    const next = clamp(shotIndex + delta, 0, SHOTS.length - 1);
    setSelectedShotId(SHOTS[next].id);
  };

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ApertureIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME} — Color</Heading>
            <Badge label={REEL_NAME} variant="neutral" />
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {COLOR_SPACE} · {FPS} fps
              </Text>
            )}
          </HStack>
        </StackItem>
        {isEdited && <Badge label="Unsaved trim" variant="warning" />}
        <ToggleButton
          label="Bypass grade" size="sm" isPressed={isBypassed}
          onPressedChange={setIsBypassed}
          tooltip={isBypassed ? 'Grade bypassed' : 'Bypass grade'}
          icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
          pressedIcon={<Icon icon={EyeOffIcon} size="sm" color="inherit" />}
        />
        <Button
          label="Grab still" variant="ghost" size="sm"
          icon={<Icon icon={CameraIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <Button label="Render" variant="primary" size="sm" onClick={() => {}} />
      </HStack>
    </LayoutHeader>
  );

  // ----- Viewer column -----
  const gradedOverlayWidth = isWipeOn ? `${wipePct}%` : '100%';
  const viewer = (
    <LayoutContent padding={0}>
      <div style={styles.viewerBackdrop}>
        <div style={styles.viewerColumn}>
          <HStack gap={2} vAlign="center" style={styles.headerRow}>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Text type="body" weight="semibold">
                  {shot.scene}
                </Text>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {shot.durSec}s · {shot.camera}
                </Text>
              </HStack>
            </StackItem>
            {isCompact && (
              <>
                <IconButton
                  label="Previous shot" tooltip="Previous shot" variant="ghost" size="sm"
                  icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
                  isDisabled={shotIndex === 0} onClick={() => stepShot(-1)}
                />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {shotIndex + 1}/{SHOTS.length}
                </Text>
                <IconButton
                  label="Next shot" tooltip="Next shot" variant="ghost" size="sm"
                  icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
                  isDisabled={shotIndex === SHOTS.length - 1} onClick={() => stepShot(1)}
                />
              </>
            )}
            <ToggleButton
              label="Reference wipe" size="sm" isPressed={isWipeOn}
              onPressedChange={setIsWipeOn}
              tooltip={isWipeOn ? 'Wipe on — left is graded' : 'Reference wipe'}
              icon={<Icon icon={SeparatorVerticalIcon} size="sm" color="inherit" />}
            />
            {isWipeOn && (
              <Slider
                label="Wipe position" isLabelHidden value={wipePct}
                min={10} max={90} step={1} width={120} valueDisplay="none"
                onChange={(v: number) => setWipePct(v)}
              />
            )}
          </HStack>

          <div style={{...styles.stage, background: shot.still}}>
            {!isBypassed && (
              <div
                style={{
                  ...styles.gradeOverlay,
                  width: gradedOverlayWidth,
                  background: activeLut.tint,
                }}
                aria-hidden
              />
            )}
            {isWipeOn && (
              <>
                <div style={{...styles.wipeLine, left: `${wipePct}%`}} aria-hidden />
                <span style={{...styles.wipeTag, left: 10}} aria-hidden>
                  GRADE
                </span>
                <span style={{...styles.wipeTag, right: 10}} aria-hidden>
                  SOURCE
                </span>
              </>
            )}
            <span style={styles.stageLabel}>{shot.clipName}</span>
            <span style={styles.stageTc}>{shot.tcIn}</span>
            {!isWipeOn && (
              <span style={styles.stageLut}>
                {activeLut.name} · {activeVersion.id} {activeVersion.label}
              </span>
            )}
            {isBypassed && (
              <span style={styles.stageBypass}>
                <Badge label="Bypassed" variant="warning" />
              </span>
            )}
          </div>

          <HStack gap={1} vAlign="center" style={styles.versionRow}>
            <Text type="label" color="secondary">
              Versions
            </Text>
            {versions.map(version => (
              <Tooltip key={version.id} content={version.note}>
                <Button
                  label={`${version.id} · ${version.label}`}
                  variant={version.id === activeVersion.id ? 'secondary' : 'ghost'}
                  size="sm"
                  icon={
                    version.id === activeVersion.id ? (
                      <Icon icon={CheckIcon} size="sm" color="inherit" />
                    ) : undefined
                  }
                  onClick={() =>
                    setVersionByShot(prev => ({...prev, [shot.id]: version.id}))
                  }
                />
              </Tooltip>
            ))}
            <IconButton
              label="New version from current grade"
              tooltip="Clone current grade into a new version" variant="ghost" size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              onClick={addVersion}
            />
          </HStack>

          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label" color="secondary">
                  LUT browser · Film looks
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary">
                {activeLut.family}
              </Text>
            </HStack>
            <div style={styles.lutStrip} role="listbox" aria-label="LUT browser">
              {LUTS.map(lut => {
                const isActive = lut.id === grade.lutId;
                return (
                  <button
                    key={lut.id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    style={{
                      ...styles.lutButton,
                      ...(isActive
                        ? {
                            borderColor: 'var(--color-accent)',
                            boxShadow: 'inset 0 0 0 1px var(--color-accent)',
                          }
                        : undefined),
                    }}
                    onClick={() => patchGrade({lutId: lut.id})}>
                    <span style={{...styles.lutSwatch, background: lut.swatch, display: 'block'}} aria-hidden />
                    <Text type="supporting" weight={isActive ? 'semibold' : undefined} style={styles.lutName}>
                      {lut.name}
                    </Text>
                  </button>
                );
              })}
            </div>
          </VStack>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Side panels -----
  const shotBinPanel = !isCompact ? (
    <LayoutPanel width={SHOT_BIN_W} padding={0} hasDivider label="Shot bin">
      <ShotBin
        selectedShotId={shot.id}
        selectedRefId={selectedRefId}
        onSelectShot={setSelectedShotId}
        onSelectRef={setSelectedRefId}
        onShotMatch={applyShotMatch}
      />
    </LayoutPanel>
  ) : undefined;

  const scopesPanel = !isNarrow ? (
    <LayoutPanel width={SCOPES_W} padding={0} hasDivider label="Scopes">
      <ScopesPanel
        shot={shot}
        grade={effectiveGrade}
        scopeMode={scopeMode}
        intensity={traceIntensity}
        curveMode={curveMode}
        onScopeModeChange={setScopeMode}
        onIntensityChange={setTraceIntensity}
        onCurveModeChange={setCurveMode}
      />
    </LayoutPanel>
  ) : undefined;

  // ----- Wheels dock -----
  const dock = (
    <LayoutFooter hasDivider height={DOCK_H} padding={0} label="Primary wheels">
      <div style={styles.dock}>
        <Toolbar
          label="Primary grade controls"
          size="sm"
          gap={1}
          dividers={['bottom']}
          startContent={
            <>
              <Text type="body" weight="semibold">
                Primary wheels
              </Text>
              <Text type="supporting" color="secondary" style={styles.mono}>
                {shot.clipName} · {activeVersion.id}
              </Text>
            </>
          }
          endContent={
            <>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Node 01 / 04 · Serial
              </Text>
              <Button
                label="Reset grade"
                variant="ghost"
                size="sm"
                isDisabled={!isEdited}
                onClick={resetGrade}
              />
            </>
          }
        />
        <div style={styles.dockBody}>
          {WHEEL_META.map(meta => (
            <TrackballWheel
              key={meta.id}
              meta={meta}
              value={grade[meta.id]}
              isDisabled={isBypassed}
              onPosition={(x, y) => patchWheel(meta.id, {x, y})}
              onMaster={master => patchWheel(meta.id, {master})}
              onReset={() => patchWheel(meta.id, {x: 0, y: 0, master: 0})}
            />
          ))}
          <div style={styles.dockDivider}>
            <Divider orientation="vertical" />
          </div>
          <div style={styles.trimCol}>
            <Slider
              label="Temp" value={grade.temp} min={-100} max={100} step={1}
              isDisabled={isBypassed} valueDisplay="text"
              formatValue={v => `${v > 0 ? '+' : ''}${v}`}
              onChange={(v: number) => patchGrade({temp: v})}
            />
            <Slider
              label="Tint" value={grade.tint} min={-100} max={100} step={1}
              isDisabled={isBypassed} valueDisplay="text"
              formatValue={v => `${v > 0 ? '+' : ''}${v}`}
              onChange={(v: number) => patchGrade({tint: v})}
            />
            <Slider
              label="Contrast" value={grade.contrast} min={0.6} max={1.6} step={0.02}
              isDisabled={isBypassed} valueDisplay="text"
              formatValue={v => `×${v.toFixed(2)}`}
              onChange={(v: number) => patchGrade({contrast: v})}
            />
            <Slider
              label="Saturation" value={grade.sat} min={0} max={2} step={0.02}
              isDisabled={isBypassed} valueDisplay="text"
              formatValue={v => v.toFixed(2)}
              onChange={(v: number) => patchGrade({sat: v})}
            />
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
        start={shotBinPanel}
        content={viewer}
        end={scopesPanel}
        footer={dock}
      />
    </div>
  );
}
