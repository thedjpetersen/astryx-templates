var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a 14-effect catalog across five
 *   categories — Color, Blur & Sharpen, Distort, Keying, Transitions — each
 *   with fixed parameter definitions and defaults; three clips from the
 *   'Harbor Light' documentary cut, each shipping a pre-built applied-effect
 *   stack with fixed parameter overrides and keyframed-parameter flags)
 * @output Effects & Transitions browser for an NLE: a 52px header (Harbor
 *   Light project chrome, Saved Badge, Save preset + Render preview
 *   Buttons); a 340px left browser panel (SearchIcon TextInput, category
 *   nav with color-dot counts plus All and starred Favorites views, and a
 *   grouped effect list whose rows carry GripVerticalIcon drag affordances,
 *   GPU Badges, favorite StarIcon ToggleButtons and a PlusIcon apply
 *   button) — and the defining region: the selected clip's effect stack on
 *   the right, a clip strip of three gradient-thumb clip buttons above
 *   ordered effect rows, each with enable Switch, category dot, parameter
 *   summary, move up/down reorder IconButtons and an expand chevron; one
 *   effect ships expanded, exposing per-parameter rows (keyframe toggle
 *   diamonds, Slider + NumberInput pairs), a deterministic mini keyframe
 *   track for animated parameters, and a Reset parameters / Remove effect
 *   row; a LayoutFooter status bar keeps totals in sync with the stack.
 * @position Page template; emitted by \`astryx template video-editor-effects-panel\`
 *
 * Frame: root div at 100dvh wrapping Layout height="fill", zero page
 * scroll. LayoutHeader carries project chrome. LayoutPanel start 340 hosts
 * the effects browser: search + category nav fixed, grouped list scrolls.
 * LayoutContent hosts the effect stack: toolbar (Bypass all Switch, stack
 * totals), clip strip, and a scrolling stack body. LayoutFooter height 36
 * is a one-line status bar. The only effects-browsing surface in the Video
 * Studio suite — choose over video-clip-timeline when the user shops for
 * and tunes effects on one clip rather than arranging clips on lanes.
 *
 * Responsive contract:
 * - >960px: header | browser 340 | stack (fill) | footer 36.
 * - <=960px: browser narrows to 280 and effect-row blurbs hide (name, star,
 *   and add button remain); stack parameter labels narrow to 96px.
 * - <=768px: the browser panel drops out — the stack stays fully editable
 *   and the clip strip wraps (flexWrap) instead of clipping.
 * - The header row wraps (flexWrap) onto a second row at phone widths, and
 *   both scroll regions keep minHeight: 0 down the flex chain so internal
 *   scrolling survives the fill Layout; nothing clips.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels;
 * effect rows, category nav rows, and clip-strip buttons are styled divs /
 * buttons, not Cards. No <video>, no network media — clip thumbnails are
 * CSS gradient stand-ins.
 *
 * Color policy: the three clip-strip thumbnails are deliberately
 * scheme-locked dark (colorScheme: 'dark' in \`styles.clipThumb\`) — they
 * stand in for footage frames, which stay dark in both schemes, so their
 * gradients and slate track labels are intentional literals. Category dots
 * use the data-categorical tokens with repo-standard light-dark() fallback
 * pairs; everything else is a var(--color-*) token, and the keyframe
 * diamonds fill with var(--color-accent) when a parameter is animated.
 */

import {useState, type CSSProperties} from 'react';

// prettier-ignore
import {
  ApertureIcon, ArrowLeftRightIcon, ChevronDownIcon, ChevronRightIcon,
  ChevronUpIcon, ClapperboardIcon, GripVerticalIcon, PaletteIcon, PipetteIcon,
  PlusIcon, RotateCcwIcon, SearchIcon, SlidersHorizontalIcon, SparklesIcon,
  StarIcon, Trash2Icon, WavesIcon,
} from 'lucide-react';

// prettier-ignore
import {
  HStack, Layout, LayoutContent, LayoutFooter, LayoutHeader, LayoutPanel,
  StackItem, VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= PROJECT CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const PROJECT_FILE = 'harbor-light_doc-cut_v7';
const FPS = 24;

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

// ============= EFFECT CATALOG FIXTURES =============
// Fixed catalog — no clocks, no randomness.

type CategoryId = 'color' | 'blur' | 'distort' | 'keying' | 'transitions';
type BrowserView = 'all' | 'favorites' | CategoryId;

interface EffectParamDef {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  unit?: string;
}

interface EffectDef {
  id: string;
  name: string;
  category: CategoryId;
  blurb: string;
  isGpu: boolean;
  params: EffectParamDef[];
}

interface EffectCategory {
  id: CategoryId;
  label: string;
  icon: typeof PaletteIcon;
  dotColor: string;
}

// Repo-standard data-categorical fallback pairs (calendar-month-grid.tsx).
const DOT_ORANGE =
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const DOT_BLUE =
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const DOT_TEAL =
  'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const DOT_GREEN =
  'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const DOT_PURPLE =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';

const CATEGORIES: EffectCategory[] = [
  {id: 'color', label: 'Color', icon: PaletteIcon, dotColor: DOT_ORANGE},
  {id: 'blur', label: 'Blur & Sharpen', icon: ApertureIcon, dotColor: DOT_BLUE},
  {id: 'distort', label: 'Distort', icon: WavesIcon, dotColor: DOT_TEAL},
  {id: 'keying', label: 'Keying', icon: PipetteIcon, dotColor: DOT_GREEN},
  {
    id: 'transitions',
    label: 'Transitions',
    icon: ArrowLeftRightIcon,
    dotColor: DOT_PURPLE,
  },
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(c => [c.id, c]));

const param = (
  id: string,
  label: string,
  min: number,
  max: number,
  step: number,
  defaultValue: number,
  unit?: string,
): EffectParamDef => ({id, label, min, max, step, defaultValue, unit});

const EFFECT_CATALOG: EffectDef[] = [
  // ----- Color -----
  {
    id: 'lumetri',
    name: 'Lumetri Color',
    category: 'color',
    blurb: 'Primary grade: exposure, contrast, and saturation in one pass.',
    isGpu: true,
    params: [
      param('exposure', 'Exposure', -5, 5, 0.1, 0, 'EV'),
      param('contrast', 'Contrast', -100, 100, 1, 0),
      param('highlights', 'Highlights', -100, 100, 1, 0),
      param('shadows', 'Shadows', -100, 100, 1, 0),
      param('saturation', 'Saturation', 0, 200, 1, 100, '%'),
    ],
  },
  {
    id: 'tint',
    name: 'Tint',
    category: 'color',
    blurb: 'Maps shadows and highlights to two tones; classic duotone wash.',
    isGpu: true,
    params: [param('amount', 'Amount to tint', 0, 100, 1, 40, '%')],
  },
  {
    id: 'vibrance',
    name: 'Vibrance',
    category: 'color',
    blurb: 'Boosts muted colors while protecting already-saturated skin.',
    isGpu: true,
    params: [
      param('vibrance', 'Vibrance', -100, 100, 1, 15),
      param('saturation', 'Saturation', -100, 100, 1, 0),
    ],
  },
  {
    id: 'lut-loader',
    name: 'LUT Loader',
    category: 'color',
    blurb: 'Applies a .cube look-up table; intensity blends against source.',
    isGpu: true,
    params: [param('intensity', 'Intensity', 0, 100, 1, 100, '%')],
  },
  // ----- Blur & Sharpen -----
  {
    id: 'gaussian-blur',
    name: 'Gaussian Blur',
    category: 'blur',
    blurb: 'Soft isotropic blur; the workhorse for glows and backgrounds.',
    isGpu: true,
    params: [param('blurriness', 'Blurriness', 0, 100, 0.5, 12, 'px')],
  },
  {
    id: 'directional-blur',
    name: 'Directional Blur',
    category: 'blur',
    blurb: 'Motion-streak blur along a single angle.',
    isGpu: true,
    params: [
      param('direction', 'Direction', 0, 360, 1, 90, '°'),
      param('length', 'Blur length', 0, 100, 0.5, 8, 'px'),
    ],
  },
  {
    id: 'unsharp-mask',
    name: 'Unsharp Mask',
    category: 'blur',
    blurb: 'Edge-contrast sharpening with radius and threshold control.',
    isGpu: false,
    params: [
      param('amount', 'Amount', 0, 500, 1, 60, '%'),
      param('radius', 'Radius', 0.1, 25, 0.1, 1.5, 'px'),
      param('threshold', 'Threshold', 0, 255, 1, 4),
    ],
  },
  // ----- Distort -----
  {
    id: 'warp-stabilizer',
    name: 'Warp Stabilizer',
    category: 'distort',
    blurb: 'Analyzes motion and smooths handheld footage; crops to cover.',
    isGpu: true,
    params: [
      param('smoothness', 'Smoothness', 0, 100, 1, 50, '%'),
      param('crop-scale', 'Crop less–smooth more', 0, 100, 1, 20, '%'),
    ],
  },
  {
    id: 'turbulent-displace',
    name: 'Turbulent Displace',
    category: 'distort',
    blurb: 'Fractal-noise warping for heat haze and water shimmer.',
    isGpu: true,
    params: [
      param('amount', 'Amount', 0, 200, 1, 35),
      param('size', 'Size', 2, 500, 1, 120),
      param('complexity', 'Complexity', 1, 10, 0.5, 3),
    ],
  },
  // ----- Keying -----
  {
    id: 'ultra-key',
    name: 'Ultra Key',
    category: 'keying',
    blurb: 'Chroma key with matte cleanup: choke, soften, and spill controls.',
    isGpu: true,
    params: [
      param('transparency', 'Transparency', 0, 100, 1, 45, '%'),
      param('highlight', 'Highlight', 0, 100, 1, 10, '%'),
      param('tolerance', 'Tolerance', 0, 100, 1, 50, '%'),
      param('pedestal', 'Pedestal', 0, 100, 1, 10, '%'),
    ],
  },
  {
    id: 'luma-key',
    name: 'Luma Key',
    category: 'keying',
    blurb: 'Keys on brightness; ideal for white-sky drone plates.',
    isGpu: false,
    params: [
      param('threshold', 'Threshold', 0, 255, 1, 235),
      param('cutoff', 'Cutoff', 0, 255, 1, 20),
    ],
  },
  // ----- Transitions -----
  {
    id: 'cross-dissolve',
    name: 'Cross Dissolve',
    category: 'transitions',
    blurb: 'Standard opacity mix across the cut; the documentary default.',
    isGpu: true,
    params: [
      param('duration', 'Duration', 6, 96, 1, 24, 'fr'),
      param('ease', 'Ease', 0, 100, 1, 50, '%'),
    ],
  },
  {
    id: 'dip-to-black',
    name: 'Dip to Black',
    category: 'transitions',
    blurb: 'Fades out through black and back in; marks chapter breaks.',
    isGpu: true,
    params: [
      param('duration', 'Duration', 12, 120, 1, 36, 'fr'),
      param('hold', 'Black hold', 0, 24, 1, 6, 'fr'),
    ],
  },
  {
    id: 'film-burn',
    name: 'Film Burn',
    category: 'transitions',
    blurb: 'Archival flash-frame burn with adjustable exposure bloom.',
    isGpu: true,
    params: [
      param('duration', 'Duration', 6, 72, 1, 18, 'fr'),
      param('intensity', 'Intensity', 0, 100, 1, 65, '%'),
    ],
  },
];

const EFFECT_BY_ID = new Map(EFFECT_CATALOG.map(e => [e.id, e]));

// ============= CLIP + APPLIED-STACK FIXTURES =============

interface StudioClip {
  id: string;
  fileName: string;
  label: string;
  track: string;
  durationSec: number;
  /** Scheme-locked dark gradient standing in for a footage frame. */
  thumbGradient: string;
}

const CLIPS: StudioClip[] = [
  {
    id: 'clip-01',
    fileName: 'A034_C011_lighthouse_dawn.mov',
    label: 'Lighthouse dawn',
    track: 'V1',
    durationSec: 8.5,
    thumbGradient: 'linear-gradient(135deg, #3B2F4F, #1E2A44 55%, #0B1120)',
  },
  {
    id: 'clip-02',
    fileName: 'MVI_2214_marta_interview.mov',
    label: 'Marta interview',
    track: 'V1',
    durationSec: 21,
    thumbGradient: 'linear-gradient(135deg, #2E3A2F, #1B2532 55%, #0B1120)',
  },
  {
    id: 'clip-03',
    fileName: 'DJI_0087_harbor_flyover.mp4',
    label: 'Harbor flyover',
    track: 'V1',
    durationSec: 12.5,
    thumbGradient: 'linear-gradient(135deg, #1F3A4A, #142639 55%, #0B1120)',
  },
];

/** One effect instance applied to a clip. Parameter values and keyframed
 * flags key off the catalog's EffectParamDef ids. */
interface AppliedEffect {
  uid: string;
  effectId: string;
  isEnabled: boolean;
  values: Record<string, number>;
  keyframed: Record<string, boolean>;
}

const defaultValues = (def: EffectDef): Record<string, number> =>
  Object.fromEntries(def.params.map(p => [p.id, p.defaultValue]));

const applied = (
  uid: string,
  effectId: string,
  overrides: Record<string, number> = {},
  keyframed: string[] = [],
  isEnabled = true,
): AppliedEffect => {
  const def = EFFECT_BY_ID.get(effectId);
  return {
    uid,
    effectId,
    isEnabled,
    values: {...(def != null ? defaultValues(def) : {}), ...overrides},
    keyframed: Object.fromEntries(keyframed.map(k => [k, true])),
  };
};

/** Pre-built stacks: the dawn shot ships with its Lumetri grade expanded
 * and two keyframed parameters (see INITIAL_EXPANDED_UID). */
const INITIAL_STACKS: Record<string, AppliedEffect[]> = {
  'clip-01': [
    applied('fx-101', 'warp-stabilizer', {smoothness: 34}),
    applied(
      'fx-102',
      'lumetri',
      {exposure: 0.8, contrast: 12, shadows: -14, saturation: 112},
      ['exposure', 'saturation'],
    ),
    applied('fx-103', 'gaussian-blur', {blurriness: 4}, [], false),
    applied('fx-104', 'cross-dissolve', {duration: 30}),
  ],
  'clip-02': [
    applied('fx-201', 'lumetri', {exposure: -0.3, saturation: 96}),
    applied('fx-202', 'unsharp-mask', {amount: 45}),
    applied('fx-203', 'luma-key', {}, [], false),
  ],
  'clip-03': [
    applied('fx-301', 'warp-stabilizer', {smoothness: 62, 'crop-scale': 28}),
    applied('fx-302', 'vibrance', {vibrance: 24}, ['vibrance']),
    applied('fx-303', 'dip-to-black', {duration: 48, hold: 8}),
  ],
};

const INITIAL_SELECTED_CLIP = 'clip-01';
const INITIAL_EXPANDED_UID = 'fx-102';
const INITIAL_FAVORITES: Record<string, boolean> = {
  lumetri: true,
  'gaussian-blur': true,
  'warp-stabilizer': true,
  'cross-dissolve': true,
};

/** Fixed keyframe positions (% along the clip) for the mini keyframe track
 * under keyframed parameters — deterministic stand-ins for real keys. */
const KEYFRAME_POSITIONS: Record<string, number[]> = {
  exposure: [8, 42, 86],
  saturation: [20, 64],
  vibrance: [12, 50, 90],
};
const FALLBACK_KEY_POSITIONS = [25, 75];

/** Uid counter for effects added at runtime; module-level so uids never
 * collide with fixture ids across re-renders. */
let nextRuntimeUid = 900;

/** Compact "Blurriness 12 px · Direction 90°" readout for collapsed rows. */
function summarizeParams(def: EffectDef, values: Record<string, number>): string {
  return def.params
    .slice(0, 2)
    .map(p => {
      const v = values[p.id] ?? p.defaultValue;
      const rounded = Math.round(v * 10) / 10;
      return \`\${p.label} \${rounded}\${p.unit != null ? \` \${p.unit}\` : ''}\`;
    })
    .join(' · ');
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // Browser panel: search + category nav fixed, effect list scrolls.
  browser: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  browserTop: {padding: 'var(--spacing-3)', paddingBottom: 'var(--spacing-2)'},
  browserList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-2) var(--spacing-2)',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
  },
  categoryRowActive: {
    backgroundColor: 'var(--color-background-muted)',
    boxShadow: 'inset 0 0 0 1px var(--color-border)',
  },
  categoryDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  groupHeader: {
    padding: 'var(--spacing-2) var(--spacing-2) var(--spacing-1)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  // Browser effect row: grip drag affordance + name/blurb + star + add.
  effectRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  effectGrip: {
    cursor: 'grab',
    display: 'flex',
    alignItems: 'center',
    paddingTop: 2,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  browserEmpty: {paddingTop: 'var(--spacing-6)', textAlign: 'center'},
  // Stack region: toolbar + clip strip fixed, stack body scrolls.
  stackWrap: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: 'var(--color-background-muted)',
  },
  clipStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    paddingBottom: 'var(--spacing-2)',
  },
  clipButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'left',
    color: 'var(--color-text-primary)',
  },
  clipButtonActive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  // Scheme-locked dark footage stand-in (see header Color policy): the
  // gradient and its slate track label are intentional literals.
  clipThumb: {
    position: 'relative',
    width: 64,
    height: 36,
    borderRadius: 4,
    overflow: 'hidden',
    colorScheme: 'dark',
    flexShrink: 0,
  },
  clipThumbLabel: {
    position: 'absolute',
    bottom: 3,
    left: 5,
    fontFamily: MONO,
    fontSize: 9,
    letterSpacing: '0.05em',
    color: 'rgba(226, 232, 240, 0.78)',
  },
  stackBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-3) var(--spacing-3)',
  },
  stackColumn: {maxWidth: 860, marginInline: 'auto', width: '100%'},
  // Applied effect card-row; expanded body nests under the header row.
  fxRow: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  fxHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  fxHeaderDisabled: {opacity: 0.55},
  fxGrip: {cursor: 'grab', display: 'flex', color: 'var(--color-text-secondary)'},
  fxBody: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-card)',
  },
  // Parameter row: [keyframe diamond] [label 128px] [slider fill] [number].
  paramRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  paramLabel: {width: 128, flexShrink: 0},
  paramLabelNarrow: {width: 96, flexShrink: 0},
  // Slider thumb at min never overlaps the label/number columns.
  paramSlider: {flex: 1, minWidth: 0, paddingInline: 'var(--spacing-1)'},
  paramNumber: {width: 96, flexShrink: 0},
  // Keyframe toggle diamond: a rotated square button; accent-filled when
  // the parameter is keyframed.
  kfButton: {
    width: 22,
    height: 22,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    padding: 0,
    borderRadius: 4,
    flexShrink: 0,
  },
  kfDiamond: {
    width: 9,
    height: 9,
    transform: 'rotate(45deg)',
    borderRadius: 1,
    border: '1.5px solid var(--color-text-secondary)',
    backgroundColor: 'transparent',
  },
  kfDiamondOn: {
    borderColor: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent)',
  },
  // Mini keyframe track: thin rail + fixed diamond markers, indented to
  // start under the slider column (22 diamond + 128 label + 8px gaps).
  kfTrack: {
    position: 'relative',
    height: 12,
    marginLeft: 22 + 8 + 128 + 8,
    marginRight: 96 + 8,
    marginTop: -2,
  },
  kfTrackNarrow: {marginLeft: 22 + 8 + 96 + 8},
  kfRail: {
    position: 'absolute',
    inset: '5px 4px auto',
    height: 2,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
  },
  kfMarker: {
    position: 'absolute',
    top: 2,
    width: 8,
    height: 8,
    transform: 'translateX(-4px) rotate(45deg)',
    borderRadius: 1,
    backgroundColor: 'var(--color-accent)',
  },
  fxFooterRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  stackEmpty: {
    padding: 'var(--spacing-8) var(--spacing-4)',
    textAlign: 'center',
    borderRadius: 'var(--radius-container)',
    border: '1px dashed var(--color-border)',
  },
  flexSpacer: {flex: 1, minWidth: 0},
  footerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingInline: 'var(--spacing-3)',
    height: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
};

// ============= BROWSER PIECES =============

function CategoryNavRow({
  label,
  count,
  isActive,
  dotColor,
  icon,
  onSelect,
}: {
  label: string;
  count: number;
  isActive: boolean;
  dotColor?: string;
  icon?: typeof PaletteIcon;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.categoryRow,
        ...(isActive ? styles.categoryRowActive : undefined),
      }}
      aria-pressed={isActive}
      onClick={onSelect}>
      {icon != null ? (
        <Icon icon={icon} size="sm" color="secondary" />
      ) : (
        <span style={{...styles.categoryDot, backgroundColor: dotColor}} />
      )}
      <StackItem size="fill">
        <Text type="body" weight={isActive ? 'semibold' : 'normal'}>{label}</Text>
      </StackItem>
      <Text type="supporting" color="secondary" hasTabularNumbers>{count}</Text>
    </button>
  );
}

/** One catalog row: grip drag affordance, name + GPU badge + blurb,
 * favorite star, and an explicit add button (click stands in for drag). */
function BrowserEffectRow({
  effect,
  isFavorite,
  showBlurb,
  onToggleFavorite,
  onAdd,
}: {
  effect: EffectDef;
  isFavorite: boolean;
  showBlurb: boolean;
  onToggleFavorite: (isPressed: boolean) => void;
  onAdd: () => void;
}) {
  const category = CATEGORY_BY_ID.get(effect.category);
  return (
    <div style={styles.effectRow}>
      <span
        style={styles.effectGrip}
        draggable
        aria-hidden
        title={\`Drag \${effect.name} onto the stack\`}>
        <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <span
              style={{...styles.categoryDot, backgroundColor: category?.dotColor}}
              aria-hidden
            />
            <Text type="body" weight="semibold">{effect.name}</Text>
            {effect.isGpu ? <Badge label="GPU" variant="info" /> : null}
          </HStack>
          {showBlurb ? (
            <Text type="supporting" color="secondary" maxLines={2}>
              {effect.blurb}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
      <ToggleButton
        label={
          isFavorite
            ? \`Remove \${effect.name} from favorites\`
            : \`Add \${effect.name} to favorites\`
        }
        size="sm"
        isIconOnly
        isPressed={isFavorite}
        onPressedChange={onToggleFavorite}
        tooltip={isFavorite ? 'Unfavorite' : 'Favorite'}
        icon={<Icon icon={StarIcon} size="sm" color="inherit" />}
      />
      <IconButton
        label={\`Apply \${effect.name} to selected clip\`}
        tooltip="Apply to clip"
        icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={onAdd}
      />
    </div>
  );
}

// ============= STACK PIECES =============

/** One parameter row: keyframe toggle diamond, label, Slider, NumberInput;
 * when keyframed, a deterministic mini keyframe track renders underneath. */
function ParamRow({
  def,
  value,
  isKeyframed,
  isDisabled,
  isNarrow,
  onChange,
  onToggleKeyframe,
}: {
  def: EffectParamDef;
  value: number;
  isKeyframed: boolean;
  isDisabled: boolean;
  isNarrow: boolean;
  onChange: (v: number) => void;
  onToggleKeyframe: () => void;
}) {
  const labelStyle = isNarrow ? styles.paramLabelNarrow : styles.paramLabel;
  const keyPositions = KEYFRAME_POSITIONS[def.id] ?? FALLBACK_KEY_POSITIONS;
  return (
    <VStack gap={0}>
      <div style={styles.paramRow}>
        <Tooltip
          content={
            isKeyframed
              ? \`Remove keyframes from \${def.label}\`
              : \`Animate \${def.label}\`
          }>
          <button
            type="button"
            style={styles.kfButton}
            aria-pressed={isKeyframed}
            aria-label={\`Toggle keyframes for \${def.label}\`}
            onClick={onToggleKeyframe}>
            <span
              style={{
                ...styles.kfDiamond,
                ...(isKeyframed ? styles.kfDiamondOn : undefined),
              }}
            />
          </button>
        </Tooltip>
        <div style={labelStyle}>
          <Text type="supporting" color="secondary" maxLines={1}>{def.label}</Text>
        </div>
        <div style={styles.paramSlider}>
          <Slider
            label={def.label}
            isLabelHidden
            value={value}
            min={def.min}
            max={def.max}
            step={def.step}
            isDisabled={isDisabled}
            valueDisplay="none"
            onChange={(v: number) => onChange(v)}
          />
        </div>
        <div style={styles.paramNumber}>
          <NumberInput
            label={def.label}
            isLabelHidden
            value={value}
            min={def.min}
            max={def.max}
            step={def.step}
            units={def.unit}
            size="sm"
            isDisabled={isDisabled}
            onChange={v => onChange(v)}
          />
        </div>
      </div>
      {isKeyframed ? (
        <div
          style={{
            ...styles.kfTrack,
            ...(isNarrow ? styles.kfTrackNarrow : undefined),
          }}
          aria-hidden>
          <div style={styles.kfRail} />
          {keyPositions.map(pos => (
            <span key={pos} style={{...styles.kfMarker, left: \`\${pos}%\`}} />
          ))}
        </div>
      ) : null}
    </VStack>
  );
}

/** One applied-effect row: enable Switch, name + summary, reorder buttons,
 * expand chevron; the expanded body hosts ParamRows + reset/delete. */
function AppliedEffectRow({
  fx,
  index,
  total,
  isExpanded,
  isNarrow,
  onToggleEnabled,
  onToggleExpanded,
  onMove,
  onSetParam,
  onToggleKeyframe,
  onReset,
  onDelete,
}: {
  fx: AppliedEffect;
  index: number;
  total: number;
  isExpanded: boolean;
  isNarrow: boolean;
  onToggleEnabled: (isEnabled: boolean) => void;
  onToggleExpanded: () => void;
  onMove: (delta: -1 | 1) => void;
  onSetParam: (paramId: string, value: number) => void;
  onToggleKeyframe: (paramId: string) => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const def = EFFECT_BY_ID.get(fx.effectId);
  if (def == null) {
    return null;
  }
  const category = CATEGORY_BY_ID.get(def.category);
  const keyframedCount = def.params.filter(
    p => fx.keyframed[p.id] === true,
  ).length;
  const isDirty = def.params.some(
    p => (fx.values[p.id] ?? p.defaultValue) !== p.defaultValue,
  );
  return (
    <div style={styles.fxRow}>
      <div
        style={{
          ...styles.fxHeader,
          ...(fx.isEnabled ? undefined : styles.fxHeaderDisabled),
        }}>
        <span
          style={styles.fxGrip}
          draggable
          aria-hidden
          title={\`Drag to reorder \${def.name}\`}>
          <Icon icon={GripVerticalIcon} size="sm" color="inherit" />
        </span>
        <Switch
          label={\`Enable \${def.name}\`}
          isLabelHidden
          value={fx.isEnabled}
          onChange={checked => onToggleEnabled(checked)}
        />
        <span
          style={{...styles.categoryDot, backgroundColor: category?.dotColor}}
          aria-hidden
        />
        <StackItem size="fill">
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Text type="body" weight="semibold">{def.name}</Text>
              {def.isGpu ? <Badge label="GPU" variant="info" /> : null}
              {keyframedCount > 0 ? (
                <Badge label={\`\${keyframedCount} animated\`} variant="neutral" />
              ) : null}
            </HStack>
            <Text
              type="supporting"
              color="secondary"
              maxLines={1}
              hasTabularNumbers
              style={styles.mono}>
              {summarizeParams(def, fx.values)}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label={\`Move \${def.name} up\`}
          tooltip="Move up"
          icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={index === 0}
          onClick={() => onMove(-1)}
        />
        <IconButton
          label={\`Move \${def.name} down\`}
          tooltip="Move down"
          icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          isDisabled={index === total - 1}
          onClick={() => onMove(1)}
        />
        <IconButton
          label={
            isExpanded
              ? \`Collapse \${def.name} parameters\`
              : \`Expand \${def.name} parameters\`
          }
          tooltip={isExpanded ? 'Collapse' : 'Edit parameters'}
          icon={
            <Icon
              icon={isExpanded ? ChevronDownIcon : ChevronRightIcon}
              size="sm"
              color="inherit"
            />
          }
          variant={isExpanded ? 'secondary' : 'ghost'}
          size="sm"
          onClick={onToggleExpanded}
        />
      </div>
      {isExpanded ? (
        <div style={styles.fxBody}>
          <VStack gap={3}>
            {def.params.map(p => (
              <ParamRow
                key={p.id}
                def={p}
                value={fx.values[p.id] ?? p.defaultValue}
                isKeyframed={fx.keyframed[p.id] === true}
                isDisabled={!fx.isEnabled}
                isNarrow={isNarrow}
                onChange={v => onSetParam(p.id, v)}
                onToggleKeyframe={() => onToggleKeyframe(p.id)}
              />
            ))}
            <Divider />
            <div style={styles.fxFooterRow}>
              <Text type="supporting" color="secondary">
                {fx.isEnabled ? 'Rendering' : 'Bypassed'} ·{' '}
                {def.params.length} parameters
                {keyframedCount > 0 ? \` · \${keyframedCount} animated\` : ''}
              </Text>
              <span style={styles.flexSpacer} />
              <Button
                label="Reset parameters"
                variant="ghost"
                size="sm"
                isDisabled={!isDirty}
                icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
                onClick={onReset}
              />
              <Button
                label="Remove effect"
                variant="destructive"
                size="sm"
                icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                onClick={onDelete}
              />
            </div>
          </VStack>
        </div>
      ) : null}
    </div>
  );
}

/** One clip-strip button: gradient footage thumb + name, duration, and a
 * live effect count that tracks the stack state. */
function ClipStripButton({
  clip,
  effectCount,
  isSelected,
  onSelect,
}: {
  clip: StudioClip;
  effectCount: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.clipButton,
        ...(isSelected ? styles.clipButtonActive : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={\`Edit effects on \${clip.fileName}\`}
      onClick={onSelect}>
      <span style={{...styles.clipThumb, background: clip.thumbGradient}}>
        <span style={styles.clipThumbLabel}>{clip.track}</span>
      </span>
      <VStack gap={0}>
        <Text type="body" weight={isSelected ? 'semibold' : 'normal'}>
          {clip.label}
        </Text>
        <Text
          type="supporting"
          color="secondary"
          hasTabularNumbers
          style={styles.mono}>
          {formatTimecode(clip.durationSec)} · {effectCount} fx
        </Text>
      </VStack>
    </button>
  );
}

// ============= PAGE =============

export default function VideoEditorEffectsPanelTemplate() {
  const [query, setQuery] = useState('');
  const [browserView, setBrowserView] = useState<BrowserView>('all');
  const [favorites, setFavorites] =
    useState<Record<string, boolean>>(INITIAL_FAVORITES);
  const [selectedClipId, setSelectedClipId] = useState(INITIAL_SELECTED_CLIP);
  const [stacks, setStacks] =
    useState<Record<string, AppliedEffect[]>>(INITIAL_STACKS);
  const [expandedUid, setExpandedUid] = useState<string | null>(
    INITIAL_EXPANDED_UID,
  );
  const [bypassAll, setBypassAll] = useState(false);

  const isNarrow = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const selectedClip = CLIPS.find(c => c.id === selectedClipId) ?? CLIPS[0];
  const stack = stacks[selectedClip.id] ?? [];

  // ----- Browser derivations (during render, no effects) -----
  const trimmedQuery = query.trim().toLowerCase();
  const matchesQuery = (e: EffectDef) =>
    trimmedQuery === '' ||
    e.name.toLowerCase().includes(trimmedQuery) ||
    e.blurb.toLowerCase().includes(trimmedQuery);
  const matchesView = (e: EffectDef) =>
    browserView === 'all' ||
    (browserView === 'favorites'
      ? favorites[e.id] === true
      : e.category === browserView);
  const visibleEffects = EFFECT_CATALOG.filter(
    e => matchesQuery(e) && matchesView(e),
  );
  const favoriteCount = EFFECT_CATALOG.filter(e => favorites[e.id]).length;
  const countForCategory = (id: CategoryId) =>
    EFFECT_CATALOG.filter(e => e.category === id && matchesQuery(e)).length;

  // ----- Stack mutations (functional setState; stacks keyed by clip) -----
  const patchStack = (
    clipId: string,
    update: (prev: AppliedEffect[]) => AppliedEffect[],
  ) => {
    setStacks(prev => ({...prev, [clipId]: update(prev[clipId] ?? [])}));
  };

  const addEffect = (effectId: string) => {
    const def = EFFECT_BY_ID.get(effectId);
    if (def == null) {
      return;
    }
    const uid = \`fx-\${nextRuntimeUid++}\`;
    patchStack(selectedClip.id, prev => [
      ...prev,
      {
        uid,
        effectId,
        isEnabled: true,
        values: defaultValues(def),
        keyframed: {},
      },
    ]);
    setExpandedUid(uid);
  };

  const toggleEnabled = (uid: string, isEnabled: boolean) => {
    patchStack(selectedClip.id, prev =>
      prev.map(fx => (fx.uid === uid ? {...fx, isEnabled} : fx)),
    );
  };

  const moveEffect = (uid: string, delta: -1 | 1) => {
    patchStack(selectedClip.id, prev => {
      const from = prev.findIndex(fx => fx.uid === uid);
      const to = from + delta;
      if (from < 0 || to < 0 || to >= prev.length) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const setParam = (uid: string, paramId: string, value: number) => {
    patchStack(selectedClip.id, prev =>
      prev.map(fx =>
        fx.uid === uid
          ? {...fx, values: {...fx.values, [paramId]: value}}
          : fx,
      ),
    );
  };

  const toggleKeyframe = (uid: string, paramId: string) => {
    patchStack(selectedClip.id, prev =>
      prev.map(fx =>
        fx.uid === uid
          ? {
              ...fx,
              keyframed: {
                ...fx.keyframed,
                [paramId]: fx.keyframed[paramId] !== true,
              },
            }
          : fx,
      ),
    );
  };

  const resetEffect = (uid: string) => {
    patchStack(selectedClip.id, prev =>
      prev.map(fx => {
        if (fx.uid !== uid) {
          return fx;
        }
        const def = EFFECT_BY_ID.get(fx.effectId);
        return def != null ? {...fx, values: defaultValues(def)} : fx;
      }),
    );
  };

  const deleteEffect = (uid: string) => {
    patchStack(selectedClip.id, prev => prev.filter(fx => fx.uid !== uid));
    setExpandedUid(prev => (prev === uid ? null : prev));
  };

  // ----- Footer totals stay in sync with every stack -----
  const totalEffects = CLIPS.reduce(
    (sum, c) => sum + (stacks[c.id]?.length ?? 0),
    0,
  );
  const keyframedParamTotal = stack.reduce(
    (sum, fx) =>
      sum + Object.values(fx.keyframed).filter(v => v === true).length,
    0,
  );
  const enabledOnClip = stack.filter(fx => fx.isEnabled).length;

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Saved" variant="success" />
            {!isCompact ? (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Effects &amp; Transitions · {PROJECT_FILE} · {FPS} fps
              </Text>
            ) : null}
          </HStack>
        </StackItem>
        <Button
          label="Save preset"
          variant="ghost"
          size="sm"
          icon={<Icon icon={SparklesIcon} size="sm" color="inherit" />}
          onClick={() => {}}
        />
        <Button
          label="Render preview"
          variant="primary"
          size="sm"
          onClick={() => {}}
        />
      </HStack>
    </LayoutHeader>
  );

  // ----- Effects browser panel (340px, 280px narrow, hidden compact) -----
  const groupedCategories =
    browserView === 'all' || browserView === 'favorites'
      ? CATEGORIES.filter(cat =>
          visibleEffects.some(e => e.category === cat.id),
        )
      : CATEGORIES.filter(cat => cat.id === browserView);

  const browserPanel = isCompact ? undefined : (
    <LayoutPanel
      width={isNarrow ? 280 : 340}
      padding={0}
      hasDivider
      label="Effects browser">
      <div style={styles.browser}>
        <div style={styles.browserTop}>
          <VStack gap={2}>
            <TextInput
              label="Search effects"
              isLabelHidden
              size="sm"
              startIcon={<Icon icon={SearchIcon} size="sm" color="secondary" />}
              placeholder="Search effects…"
              value={query}
              onChange={value => setQuery(value)}
            />
            <VStack gap={0}>
              <CategoryNavRow
                label="All effects"
                count={EFFECT_CATALOG.filter(matchesQuery).length}
                isActive={browserView === 'all'}
                icon={SlidersHorizontalIcon}
                onSelect={() => setBrowserView('all')}
              />
              <CategoryNavRow
                label="Favorites"
                count={favoriteCount}
                isActive={browserView === 'favorites'}
                icon={StarIcon}
                onSelect={() => setBrowserView('favorites')}
              />
              {CATEGORIES.map(cat => (
                <CategoryNavRow
                  key={cat.id}
                  label={cat.label}
                  count={countForCategory(cat.id)}
                  isActive={browserView === cat.id}
                  dotColor={cat.dotColor}
                  onSelect={() => setBrowserView(cat.id)}
                />
              ))}
            </VStack>
            <Divider />
          </VStack>
        </div>
        <div style={styles.browserList}>
          {visibleEffects.length === 0 ? (
            <div style={styles.browserEmpty}>
              <VStack gap={1} hAlign="center">
                <Text type="body" weight="semibold">No effects match</Text>
                <Text type="supporting" color="secondary">
                  Try a different search or category.
                </Text>
              </VStack>
            </div>
          ) : (
            <VStack gap={1}>
              {groupedCategories.map(cat => (
                <VStack key={cat.id} gap={1}>
                  <div style={styles.groupHeader}>
                    <Icon icon={cat.icon} size="sm" color="secondary" />
                    <Text type="label" color="secondary">{cat.label}</Text>
                  </div>
                  {visibleEffects
                    .filter(e => e.category === cat.id)
                    .map(effect => (
                      <BrowserEffectRow
                        key={effect.id}
                        effect={effect}
                        isFavorite={favorites[effect.id] === true}
                        showBlurb={!isNarrow}
                        onToggleFavorite={isPressed =>
                          setFavorites(prev => ({
                            ...prev,
                            [effect.id]: isPressed,
                          }))
                        }
                        onAdd={() => addEffect(effect.id)}
                      />
                    ))}
                </VStack>
              ))}
            </VStack>
          )}
        </div>
      </div>
    </LayoutPanel>
  );

  // ----- Effect stack (content) -----
  const content = (
    <LayoutContent padding={0}>
      <div style={styles.stackWrap}>
        <Toolbar
          label="Effect stack controls"
          size="sm"
          gap={2}
          dividers={['bottom']}
          startContent={
            <>
              <Text type="body" weight="semibold">Effect Controls</Text>
              <Text
                type="supporting"
                color="secondary"
                hasTabularNumbers
                style={styles.mono}>
                {selectedClip.fileName}
              </Text>
            </>
          }
          endContent={
            <>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {enabledOnClip}/{stack.length} enabled
              </Text>
              <Switch
                label="Bypass all"
                value={bypassAll}
                onChange={checked => setBypassAll(checked)}
              />
            </>
          }
        />
        <div style={styles.clipStrip}>
          {CLIPS.map(c => (
            <ClipStripButton
              key={c.id}
              clip={c}
              effectCount={stacks[c.id]?.length ?? 0}
              isSelected={c.id === selectedClip.id}
              onSelect={() => setSelectedClipId(c.id)}
            />
          ))}
        </div>
        <div style={styles.stackBody}>
          <div style={styles.stackColumn}>
            {stack.length === 0 ? (
              <div style={styles.stackEmpty}>
                <VStack gap={1} hAlign="center">
                  <Text type="body" weight="semibold">No effects on this clip</Text>
                  <Text type="supporting" color="secondary">
                    Drag an effect from the browser, or press + on any row to
                    apply it here.
                  </Text>
                </VStack>
              </div>
            ) : (
              <VStack gap={2}>
                {bypassAll ? (
                  <Text type="supporting" color="secondary">
                    All effects bypassed for playback — parameter edits still
                    save to the stack.
                  </Text>
                ) : null}
                {stack.map((fx, index) => (
                  <AppliedEffectRow
                    key={fx.uid}
                    fx={fx}
                    index={index}
                    total={stack.length}
                    isExpanded={fx.uid === expandedUid}
                    isNarrow={isCompact}
                    onToggleEnabled={v => toggleEnabled(fx.uid, v)}
                    onToggleExpanded={() =>
                      setExpandedUid(p => (p === fx.uid ? null : fx.uid))
                    }
                    onMove={delta => moveEffect(fx.uid, delta)}
                    onSetParam={(pid, v) => setParam(fx.uid, pid, v)}
                    onToggleKeyframe={pid => toggleKeyframe(fx.uid, pid)}
                    onReset={() => resetEffect(fx.uid)}
                    onDelete={() => deleteEffect(fx.uid)}
                  />
                ))}
              </VStack>
            )}
          </div>
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Status footer -----
  const footer = (
    <LayoutFooter hasDivider height={36} padding={0} label="Render status">
      <div style={styles.footerBar}>
        <Text type="supporting" color="secondary">GPU acceleration: Metal</Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {totalEffects} effects across {CLIPS.length} clips
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {selectedClip.label}: {enabledOnClip} active ·{' '}
          {keyframedParamTotal} animated params
        </Text>
        {!isCompact ? (
          <>
            <span style={styles.flexSpacer} />
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={styles.mono}>
              {PROJECT_FILE} · {FPS} fps
            </Text>
          </>
        ) : null}
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={browserPanel}
        content={content}
        footer={footer}
      />
    </div>
  );
}
`;export{e as default};