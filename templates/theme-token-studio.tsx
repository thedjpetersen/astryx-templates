// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a design-token manifest of 15 tokens in
 *   color / spacing / radius / shadow groups; six 8-step color ramps — Azure,
 *   Graphite, Sand, Ember, Moss, Plum — where every step is an explicit
 *   {light, dark} hex pair; five shadow elevation levels; three brand presets
 *   — Default, Contrast+, Warm — each a literal batch of token edits; and the
 *   'Lumen CRM' mini-app copy the preview panes render)
 * @output THEME TOKEN STUDIO: a left 300px token tree (collapsible color /
 *   spacing / radius / shadow groups; selecting a token expands an inline
 *   editor — ramp-chip row + ramp Slider + step-swatch strip for colors,
 *   NumberInput steppers for spacing and radius, an elevation Slider for
 *   shadows) live-restyling a miniature product preview built from stack
 *   primitives and brand-token-styled controls (mini dashboard card, form
 *   row + button set, deals-table snippet). The signature detail is the
 *   dual-scheme preview: the mini app renders twice, side by side in
 *   forced-light and forced-dark panes (each pane sets colorScheme +
 *   data-astryx-media like the demo site toggle) so one edit visibly lands
 *   in both schemes at once via explicit light-dark() pair resolution. A
 *   right changes rail lists edited tokens as before → after chips with
 *   per-token revert, reset-all, and batch undo; presets append staggered
 *   chip batches that narrate what they touched; an export drawer tabs
 *   JSON / CSS custom properties / a copy-ready diff highlighting exactly
 *   the session's changed lines, each with a clipboard copy action.
 * @position Page template; emitted by `astryx template theme-token-studio`
 *
 * Frame: Layout height="fill". LayoutHeader carries the studio chrome
 * (palette Icon, 'Token studio' Heading, manifest readout, batch Undo, and —
 * on phones — the Tokens-sheet button with an edited-count Badge). The
 * `start` slot docks a 300px LayoutPanel (brand presets card pinned above the
 * scrolling token tree); LayoutContent scrolls the dual preview panes and the
 * export drawer; the `end` slot docks a 300px changes rail. Choose over
 * deck-theme-designer when the artifact under design is a TOKEN MANIFEST
 * (values that must resolve in two schemes at once) rather than deck-wide
 * slide styles; the archetype is token-tree-plus-dual-scheme-preview.
 *
 * Responsive contract:
 * - >1080px: header | token panel 300 (presets pinned, tree scrolls) | dual
 *   panes in a 2-column grid + export drawer (column scrolls) | changes rail
 *   300 (scrolls).
 * - 641–1080px: the changes rail undocks and collapses to a badge-count pill
 *   pinned bottom-right of the content region; tapping it expands an overlay
 *   rail with the same chips/revert/reset controls. Panes stay side by side.
 * - <=640px (usable at 375px): the token panel becomes a bottom sheet opened
 *   from the header's Tokens button; the dual panes become a full-width
 *   scroll-snap carousel (overflow-x deliberate, snap mandatory) with a
 *   Light/Dark segmented switcher as the equivalent button path; the rail
 *   pill and export drawer stack in the single column. All tap targets are
 *   ~40px and nothing is hover-only.
 * - Chip pop-ins and the sheet slide-up are keyframes disabled under
 *   prefers-reduced-motion (chips simply appear; carousel scrolls jump).
 *
 * Container policy (workbench archetype): frame-first panels and rows; Cards
 * only for the presets block, the export drawer, and the preview pane frames.
 * Fixture policy: fixed manifest data only — edits are pure state folded over
 * a change log (undo IS the fold), no clocks, randomness, or network assets.
 *
 * Color policy: token-pure. All app chrome uses var(--color-*) tokens or
 * color-mix() over tokens. The ONLY raw hex/rgba literals are the fixture
 * ramp steps and shadow alphas — every ramp step is an {light, dark} PAIR
 * that is only ever painted through lightDark() as an explicit
 * light-dark(light, dark) expression (that resolution inside the forced
 * panes is the template's whole point), and every shadow rgba sits inside a
 * light-dark() color slot. Diff add/del tints use categorical tokens with
 * explicit light-dark() fallbacks.
 */

import {useMemo, useRef, useState, type CSSProperties} from 'react';

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
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {Slider} from '@astryxdesign/core/Slider';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BracesIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CopyIcon,
  MoonIcon,
  PaletteIcon,
  RotateCcwIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  SunIcon,
  Undo2Icon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react';

// ============= GLOBAL CSS =============
// Keyframes for the staggered chip pop-ins and the phone bottom sheet, plus
// focus/hover states for hand-rolled rows. prefers-reduced-motion kills the
// animations wholesale — chips and the sheet simply appear in place.

const GLOBAL_CSS = `
@keyframes tts-chip-in {
  from { opacity: 0; transform: translateY(8px) scale(0.96); }
  to { opacity: 1; transform: none; }
}
@keyframes tts-sheet-up {
  from { transform: translateY(32px); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.tts-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.tts-row:hover {
  background-color: var(--color-background-muted);
}
@media (prefers-reduced-motion: reduce) {
  .tts-animated { animation: none !important; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  fill: {height: '100%', minHeight: 0},
  fullWidth: {width: '100%'},
  // Token panel: presets pinned on top, tree scrolls beneath.
  panelShell: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  panelPinned: {padding: 'var(--spacing-3)'},
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  // Content region hosts the scroll column plus the overlay pill/sheet.
  contentRoot: {position: 'relative', height: '100%', minHeight: 0},
  contentScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Dual panes, desktop: a strict 2-up grid so light/dark always align.
  paneGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--spacing-4)',
  },
  // Dual panes, <=640px: full-width scroll-snap carousel (deliberate
  // overflow-x); the Light/Dark segmented buttons are the non-gesture path.
  paneSnap: {
    display: 'flex',
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    gap: 'var(--spacing-3)',
    margin: 'calc(-1 * var(--spacing-1))',
    padding: 'var(--spacing-1)',
  },
  paneSnapItem: {flex: '0 0 100%', scrollSnapAlign: 'center', minWidth: 0},
  // One forced-scheme pane: the wrapper sets colorScheme + data-astryx-media
  // so BOTH Astryx tokens and the fixture light-dark() pairs resolve to that
  // scheme regardless of the app's own toggle.
  paneFrame: {
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-body)',
    minWidth: 0,
  },
  paneChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  // Token tree rows: hand-rolled buttons, ~40px tap targets.
  groupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: '0 var(--spacing-2)',
    border: 'none',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  tokenRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: '0 var(--spacing-2)',
    border: 'none',
    borderRadius: 8,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  tokenRowSelected: {
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
  },
  editedDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    flexShrink: 0,
  },
  swatch: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  // Inline editor shell under a selected token row.
  editorShell: {
    margin: '2px var(--spacing-1) var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  rampChip: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  rampChipActive: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: 2,
  },
  stepStrip: {display: 'flex', gap: 3},
  stepSwatch: {
    flex: 1,
    height: 28,
    minWidth: 0,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    padding: 0,
  },
  stepSwatchActive: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: 1,
  },
  shadowPreview: {
    height: 44,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
  },
  // Changes rail chips.
  railScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  chip: {
    border: '1px solid var(--color-border)',
    borderRadius: 10,
    padding: 'var(--spacing-2)',
    backgroundColor: 'var(--color-background-body)',
  },
  chipSwatch: {
    width: 14,
    height: 14,
    borderRadius: 4,
    border: '1px solid var(--color-border)',
    flexShrink: 0,
  },
  // Rail pill (641–1080px and phones): badge-count button pinned inside the
  // content region; expands into the overlay rail.
  railPill: {
    position: 'absolute',
    right: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    zIndex: 4,
  },
  railOverlay: {
    position: 'absolute',
    right: 'var(--spacing-3)',
    bottom: 'var(--spacing-3)',
    zIndex: 5,
    width: 'min(340px, calc(100% - var(--spacing-6)))',
    maxHeight: '70%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
  },
  railOverlayHeader: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid var(--color-border)',
  },
  railOverlayBody: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // Phone bottom sheet for the token tree.
  sheetBackdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 5,
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    backgroundColor: 'color-mix(in srgb, var(--color-text) 32%, transparent)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 6,
    maxHeight: '78%',
    display: 'flex',
    flexDirection: 'column',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    border: '1px solid var(--color-border)',
    borderBottom: 'none',
    backgroundColor: 'var(--color-background-body)',
    boxShadow: 'var(--shadow-high)',
  },
  sheetGrabber: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'var(--color-border)',
    margin: 'var(--spacing-2) auto 0',
  },
  sheetHeader: {padding: 'var(--spacing-2) var(--spacing-3)'},
  sheetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  // Export drawer diff view: custom pre so changed lines can be tinted.
  diffPre: {
    margin: 0,
    padding: 'var(--spacing-2) 0',
    overflowX: 'auto',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 12,
    lineHeight: 1.7,
    color: 'var(--color-text)',
  },
  diffLine: {display: 'block', padding: '0 var(--spacing-3)', whiteSpace: 'pre'},
  diffDel: {
    backgroundColor:
      'color-mix(in srgb, var(--color-data-categorical-red, light-dark(#D92D20, #FF6B5E)) 14%, transparent)',
  },
  diffAdd: {
    backgroundColor:
      'color-mix(in srgb, var(--color-data-categorical-green, light-dark(#0B991F, #34C749)) 16%, transparent)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= RAMP FIXTURES =============
// Six 8-step ramps. EVERY step is an explicit {light, dark} pair, and every
// paint goes through lightDark() below, so each hex literal is always one
// half of a light-dark() expression (see the header Color policy). Dark
// members roughly mirror the light ladder so a step keeps its ROLE contrast
// (step 100 is a surface in both schemes, step 800 is ink in both).

interface RampStep {
  light: string;
  dark: string;
}

interface Ramp {
  id: string;
  name: string;
  steps: RampStep[]; // index 0 = step 100 … index 7 = step 800
}

const RAMPS: Ramp[] = [
  {
    id: 'azure',
    name: 'Azure',
    steps: [
      {light: '#EAF2FE', dark: '#10233F'},
      {light: '#CFE1FC', dark: '#16345C'},
      {light: '#A3C6F8', dark: '#1E4A80'},
      {light: '#6FA4F0', dark: '#2E66A8'},
      {light: '#3D7FE0', dark: '#4C8DDF'},
      {light: '#2563C4', dark: '#6FA4F0'},
      {light: '#1B4A99', dark: '#A3C6F8'},
      {light: '#123566', dark: '#CFE1FC'},
    ],
  },
  {
    id: 'graphite',
    name: 'Graphite',
    steps: [
      {light: '#FCFCFD', dark: '#17181C'},
      {light: '#F2F3F5', dark: '#1F2126'},
      {light: '#E3E5E9', dark: '#2A2D34'},
      {light: '#C6CAD2', dark: '#3D4149'},
      {light: '#9AA1AC', dark: '#6E7683'},
      {light: '#666E7B', dark: '#9AA1AC'},
      {light: '#3B424E', dark: '#C6CAD2'},
      {light: '#1D2129', dark: '#EDEEF1'},
    ],
  },
  {
    id: 'sand',
    name: 'Sand',
    steps: [
      {light: '#FDFBF7', dark: '#1B1815'},
      {light: '#F5F0E8', dark: '#262019'},
      {light: '#E8DFD2', dark: '#332A21'},
      {light: '#D0C2AD', dark: '#4A3E30'},
      {light: '#A8977E', dark: '#7A6B57'},
      {light: '#7A6B57', dark: '#A8977E'},
      {light: '#4A3E30', dark: '#D0C2AD'},
      {light: '#2A2118', dark: '#EFE7DA'},
    ],
  },
  {
    id: 'ember',
    name: 'Ember',
    steps: [
      {light: '#FDF0E7', dark: '#33190A'},
      {light: '#FADCC7', dark: '#4A2410'},
      {light: '#F5BD94', dark: '#6E3617'},
      {light: '#EC9558', dark: '#9C4D1F'},
      {light: '#DE6E22', dark: '#E07B33'},
      {light: '#B8551A', dark: '#EC9558'},
      {light: '#8A3F13', dark: '#F5BD94'},
      {light: '#5C2A0D', dark: '#FADCC7'},
    ],
  },
  {
    id: 'moss',
    name: 'Moss',
    steps: [
      {light: '#EBF6EE', dark: '#0F2416'},
      {light: '#CFE9D8', dark: '#16351F'},
      {light: '#A3D4B4', dark: '#1F4D2D'},
      {light: '#6BB786', dark: '#2E6E42'},
      {light: '#3D9960', dark: '#46A36B'},
      {light: '#2A7A4A', dark: '#6BB786'},
      {light: '#1E5936', dark: '#A3D4B4'},
      {light: '#143D25', dark: '#CFE9D8'},
    ],
  },
  {
    id: 'plum',
    name: 'Plum',
    steps: [
      {light: '#F6EEFB', dark: '#261233'},
      {light: '#E8D6F5', dark: '#381B4A'},
      {light: '#D0ADEA', dark: '#52296E'},
      {light: '#B27DD9', dark: '#74409A'},
      {light: '#9354C2', dark: '#9D66CC'},
      {light: '#7740A3', dark: '#B27DD9'},
      {light: '#582F7A', dark: '#D0ADEA'},
      {light: '#3B2052', dark: '#E8D6F5'},
    ],
  },
];

const RAMP_BY_ID = new Map(RAMPS.map(ramp => [ramp.id, ramp]));

/** The one place fixture pairs become paint: an explicit light-dark() pair. */
const lightDark = (step: RampStep) => `light-dark(${step.light}, ${step.dark})`;

const stepLabel = (index: number) => String((index + 1) * 100);

// Shadow elevations: rgba alphas live inside the light-dark() color slot of
// each box-shadow, so both schemes get a tuned shadow from one token value.
interface ShadowLevel {
  label: string;
  css: string;
}

const SHADOW_LEVELS: ShadowLevel[] = [
  {label: 'None', css: 'none'},
  {
    label: 'Low',
    css: '0 1px 3px light-dark(rgba(23, 26, 31, 0.10), rgba(0, 0, 0, 0.45))',
  },
  {
    label: 'Medium',
    css: '0 3px 10px light-dark(rgba(23, 26, 31, 0.14), rgba(0, 0, 0, 0.55))',
  },
  {
    label: 'High',
    css: '0 8px 20px light-dark(rgba(23, 26, 31, 0.18), rgba(0, 0, 0, 0.60))',
  },
  {
    label: 'Pop',
    css: '0 14px 36px light-dark(rgba(23, 26, 31, 0.24), rgba(0, 0, 0, 0.70))',
  },
];

// ============= TOKEN MANIFEST =============

type TokenGroup = 'color' | 'spacing' | 'radius' | 'shadow';

type TokenValue =
  | {kind: 'color'; ramp: string; step: number}
  | {kind: 'size'; px: number}
  | {kind: 'shadow'; level: number};

interface TokenDef {
  id: string; // the CSS custom property name
  label: string;
  group: TokenGroup;
  description: string;
  base: TokenValue;
  min?: number; // size tokens
  max?: number;
  step?: number;
}

const TOKENS: TokenDef[] = [
  // ---- color ----
  {
    id: '--brand-primary',
    label: 'Primary',
    group: 'color',
    description: 'Buttons, links, focus accents',
    base: {kind: 'color', ramp: 'azure', step: 4},
  },
  {
    id: '--brand-accent',
    label: 'Accent',
    group: 'color',
    description: 'Highlights, secondary emphasis',
    base: {kind: 'color', ramp: 'plum', step: 4},
  },
  {
    id: '--brand-positive',
    label: 'Positive',
    group: 'color',
    description: 'Success chips and deltas',
    base: {kind: 'color', ramp: 'moss', step: 4},
  },
  {
    id: '--brand-surface',
    label: 'Surface',
    group: 'color',
    description: 'App background',
    base: {kind: 'color', ramp: 'graphite', step: 1},
  },
  {
    id: '--brand-surface-raised',
    label: 'Surface / raised',
    group: 'color',
    description: 'Cards and sheets above the surface',
    base: {kind: 'color', ramp: 'graphite', step: 0},
  },
  {
    id: '--brand-border',
    label: 'Border',
    group: 'color',
    description: 'Hairlines and input strokes',
    base: {kind: 'color', ramp: 'graphite', step: 2},
  },
  {
    id: '--brand-text',
    label: 'Text',
    group: 'color',
    description: 'Primary copy',
    base: {kind: 'color', ramp: 'graphite', step: 6},
  },
  {
    id: '--brand-text-muted',
    label: 'Text / muted',
    group: 'color',
    description: 'Labels, captions, helper copy',
    base: {kind: 'color', ramp: 'graphite', step: 5},
  },
  // ---- spacing ----
  {
    id: '--space-control',
    label: 'Control padding',
    group: 'spacing',
    description: 'Inline padding of inputs and buttons',
    base: {kind: 'size', px: 12},
    min: 6,
    max: 20,
    step: 2,
  },
  {
    id: '--space-card',
    label: 'Card padding',
    group: 'spacing',
    description: 'Interior padding of cards',
    base: {kind: 'size', px: 16},
    min: 8,
    max: 28,
    step: 2,
  },
  {
    id: '--space-stack',
    label: 'Stack gap',
    group: 'spacing',
    description: 'Vertical rhythm between blocks',
    base: {kind: 'size', px: 12},
    min: 4,
    max: 24,
    step: 2,
  },
  // ---- radius ----
  {
    id: '--radius-control',
    label: 'Control radius',
    group: 'radius',
    description: 'Inputs, buttons, chips',
    base: {kind: 'size', px: 8},
    min: 0,
    max: 20,
    step: 2,
  },
  {
    id: '--radius-card',
    label: 'Card radius',
    group: 'radius',
    description: 'Cards and panes',
    base: {kind: 'size', px: 12},
    min: 0,
    max: 24,
    step: 2,
  },
  // ---- shadow ----
  {
    id: '--shadow-card',
    label: 'Card shadow',
    group: 'shadow',
    description: 'Resting elevation of cards',
    base: {kind: 'shadow', level: 1},
  },
  {
    id: '--shadow-overlay',
    label: 'Overlay shadow',
    group: 'shadow',
    description: 'Floating actions and popovers',
    base: {kind: 'shadow', level: 3},
  },
];

const TOKEN_BY_ID = new Map(TOKENS.map(token => [token.id, token]));

const GROUPS: {id: TokenGroup; label: string}[] = [
  {id: 'color', label: 'Color'},
  {id: 'spacing', label: 'Spacing'},
  {id: 'radius', label: 'Radius'},
  {id: 'shadow', label: 'Shadow'},
];

// ============= PRESET FIXTURES =============
// Deterministic batch edits. 'Default' is special-cased in the page: it
// reverts every currently edited token to its manifest base.

interface Preset {
  id: string;
  name: string;
  description: string;
  edits: {tokenId: string; value: TokenValue}[];
}

const PRESETS: Preset[] = [
  {
    id: 'contrast',
    name: 'Contrast+',
    description: 'Darker ink, firmer borders, crisper corners',
    edits: [
      {tokenId: '--brand-text', value: {kind: 'color', ramp: 'graphite', step: 7}},
      {
        tokenId: '--brand-text-muted',
        value: {kind: 'color', ramp: 'graphite', step: 6},
      },
      {tokenId: '--brand-border', value: {kind: 'color', ramp: 'graphite', step: 3}},
      {tokenId: '--brand-primary', value: {kind: 'color', ramp: 'azure', step: 5}},
      {tokenId: '--radius-control', value: {kind: 'size', px: 6}},
      {tokenId: '--shadow-card', value: {kind: 'shadow', level: 2}},
    ],
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Ember primary over sand neutrals, softer corners',
    edits: [
      {tokenId: '--brand-primary', value: {kind: 'color', ramp: 'ember', step: 4}},
      {tokenId: '--brand-surface', value: {kind: 'color', ramp: 'sand', step: 1}},
      {
        tokenId: '--brand-surface-raised',
        value: {kind: 'color', ramp: 'sand', step: 0},
      },
      {tokenId: '--brand-border', value: {kind: 'color', ramp: 'sand', step: 2}},
      {tokenId: '--brand-text', value: {kind: 'color', ramp: 'sand', step: 7}},
      {tokenId: '--brand-text-muted', value: {kind: 'color', ramp: 'sand', step: 5}},
      {tokenId: '--radius-card', value: {kind: 'size', px: 16}},
      {tokenId: '--radius-control', value: {kind: 'size', px: 10}},
    ],
  },
];

// ============= CHANGE LOG (pure state over the manifest) =============
// Every mutation appends Edit records; the CURRENT manifest is a fold over
// the log (last edit per token wins, base otherwise). Revert appends a
// base-valued edit (so it is itself undoable); undo pops the last batch.

type EditSource = 'manual' | 'preset' | 'revert' | 'reset';

interface Edit {
  seq: number;
  batch: number;
  batchIndex: number;
  tokenId: string;
  value: TokenValue;
  source: EditSource;
  sourceLabel: string; // 'Manual edit', 'Warm preset', …
}

const nextSeq = (log: Edit[]) =>
  log.length === 0 ? 1 : log[log.length - 1].seq + 1;

const nextBatch = (log: Edit[]) =>
  log.length === 0 ? 1 : log[log.length - 1].batch + 1;

function valuesEqual(a: TokenValue, b: TokenValue): boolean {
  if (a.kind === 'color' && b.kind === 'color') {
    return a.ramp === b.ramp && a.step === b.step;
  }
  if (a.kind === 'size' && b.kind === 'size') {
    return a.px === b.px;
  }
  if (a.kind === 'shadow' && b.kind === 'shadow') {
    return a.level === b.level;
  }
  return false;
}

/** Fold the log: last edit per token. */
function foldLog(log: Edit[]): Map<string, Edit> {
  const map = new Map<string, Edit>();
  for (const edit of log) {
    map.set(edit.tokenId, edit);
  }
  return map;
}

// ============= VALUE RESOLUTION =============

function resolveCss(value: TokenValue): string {
  switch (value.kind) {
    case 'color': {
      const ramp = RAMP_BY_ID.get(value.ramp) ?? RAMPS[0];
      const step = ramp.steps[Math.min(value.step, ramp.steps.length - 1)];
      return lightDark(step);
    }
    case 'size':
      return `${value.px}px`;
    case 'shadow':
      return SHADOW_LEVELS[value.level].css;
  }
}

function formatValue(value: TokenValue): string {
  switch (value.kind) {
    case 'color': {
      const ramp = RAMP_BY_ID.get(value.ramp) ?? RAMPS[0];
      return `${ramp.name} ${stepLabel(value.step)}`;
    }
    case 'size':
      return `${value.px}px`;
    case 'shadow':
      return SHADOW_LEVELS[value.level].label;
  }
}

/** Draft manifest handed to the preview panes and exporters. */
interface Draft {
  value: (tokenId: string) => TokenValue;
  css: (tokenId: string) => string;
  px: (tokenId: string) => number;
}

function buildDraft(overrides: Map<string, Edit>): Draft {
  const value = (tokenId: string): TokenValue => {
    const def = TOKEN_BY_ID.get(tokenId);
    if (!def) {
      return {kind: 'size', px: 0};
    }
    return overrides.get(tokenId)?.value ?? def.base;
  };
  return {
    value,
    css: tokenId => resolveCss(value(tokenId)),
    px: tokenId => {
      const v = value(tokenId);
      return v.kind === 'size' ? v.px : 0;
    },
  };
}

// ============= EXPORTERS =============

function buildCssLine(def: TokenDef, value: TokenValue): string {
  return `  ${def.id}: ${resolveCss(value)};`;
}

function buildCssExport(draft: Draft): string {
  const lines = [':root {', '  color-scheme: light dark;'];
  for (const def of TOKENS) {
    lines.push(buildCssLine(def, draft.value(def.id)));
  }
  lines.push('}');
  return lines.join('\n');
}

function buildJsonExport(draft: Draft, editedIds: Set<string>): string {
  const manifest: Record<string, unknown> = {};
  for (const def of TOKENS) {
    const value = draft.value(def.id);
    manifest[def.id] =
      value.kind === 'color'
        ? {
            group: def.group,
            ramp: value.ramp,
            step: Number(stepLabel(value.step)),
            light: (RAMP_BY_ID.get(value.ramp) ?? RAMPS[0]).steps[value.step].light,
            dark: (RAMP_BY_ID.get(value.ramp) ?? RAMPS[0]).steps[value.step].dark,
            edited: editedIds.has(def.id),
          }
        : value.kind === 'size'
          ? {group: def.group, px: value.px, edited: editedIds.has(def.id)}
          : {
              group: def.group,
              elevation: SHADOW_LEVELS[value.level].label.toLowerCase(),
              edited: editedIds.has(def.id),
            };
  }
  return JSON.stringify(
    {name: 'Lumen CRM brand', schema: 'astryx-tokens/1', tokens: manifest},
    null,
    2,
  );
}

interface DiffLine {
  kind: 'ctx' | 'del' | 'add';
  text: string;
}

function buildDiff(draft: Draft, editedIds: Set<string>): DiffLine[] {
  const lines: DiffLine[] = [{kind: 'ctx', text: ' :root {'}];
  for (const def of TOKENS) {
    if (editedIds.has(def.id)) {
      lines.push({kind: 'del', text: `-${buildCssLine(def, def.base)}`});
      lines.push({kind: 'add', text: `+${buildCssLine(def, draft.value(def.id))}`});
    } else {
      lines.push({kind: 'ctx', text: ` ${buildCssLine(def, def.base)}`});
    }
  }
  lines.push({kind: 'ctx', text: ' }'});
  return lines;
}

// ============= MINI APP FIXTURES =============

const MINI_BARS = [46, 58, 50, 64, 72, 82]; // % heights, revenue by month

const MINI_DEALS: {deal: string; stage: string; tone: 'positive' | 'accent' | 'muted'; amount: string}[] = [
  {deal: 'Aurora renewal', stage: 'Won', tone: 'positive', amount: '$12,400'},
  {deal: 'Beacon pilot', stage: 'In review', tone: 'accent', amount: '$8,150'},
  {deal: 'Citadel expansion', stage: 'Drafting', tone: 'muted', amount: '$21,900'},
];

// ============= MINI APP (draft-token styled preview artwork) =============
// The mini product is preview ARTWORK: its controls are non-interactive
// divs (like slide shapes in deck-theme-designer) painted entirely from the
// draft manifest, so every token edit restyles both panes at once.

function MiniApp({draft}: {draft: Draft}) {
  const surface = draft.css('--brand-surface');
  const raised = draft.css('--brand-surface-raised');
  const border = draft.css('--brand-border');
  const text = draft.css('--brand-text');
  const muted = draft.css('--brand-text-muted');
  const primary = draft.css('--brand-primary');
  const accent = draft.css('--brand-accent');
  const positive = draft.css('--brand-positive');
  const spaceControl = draft.px('--space-control');
  const spaceCard = draft.px('--space-card');
  const spaceStack = draft.px('--space-stack');
  const radiusControl = draft.px('--radius-control');
  const radiusCard = draft.px('--radius-card');
  const shadowCard = draft.css('--shadow-card');
  const shadowOverlay = draft.css('--shadow-overlay');

  const chipTone = (tone: 'positive' | 'accent' | 'muted') =>
    tone === 'positive' ? positive : tone === 'accent' ? accent : muted;

  const card: CSSProperties = {
    backgroundColor: raised,
    border: `1px solid ${border}`,
    borderRadius: radiusCard,
    boxShadow: shadowCard,
    padding: spaceCard,
  };

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: surface,
        color: text,
        padding: spaceCard,
        // Clear the floating '+ New deal' action so it never sits on top of
        // the last table row.
        paddingBottom: spaceCard * 2 + 40,
        display: 'flex',
        flexDirection: 'column',
        gap: spaceStack,
        fontSize: 13,
        lineHeight: 1.4,
      }}>
      {/* Top bar */}
      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
        <div
          aria-hidden
          style={{
            width: 18,
            height: 18,
            borderRadius: Math.min(radiusControl, 9),
            backgroundColor: primary,
            flexShrink: 0,
          }}
        />
        <span style={{fontWeight: 700}}>Lumen CRM</span>
        <span
          style={{
            marginLeft: 'auto',
            color: muted,
            fontSize: 12,
          }}>
          Q3 workspace
        </span>
        <div
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            backgroundColor: accent,
            flexShrink: 0,
          }}
        />
      </div>

      {/* Mini dashboard card */}
      <div style={card}>
        <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
          <div style={{minWidth: 0}}>
            <div style={{color: muted, fontSize: 11}}>Monthly recurring revenue</div>
            <div style={{fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em'}}>
              $48,210
            </div>
          </div>
          <span
            style={{
              marginLeft: 'auto',
              color: positive,
              fontWeight: 600,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}>
            ▲ +6.4%
          </span>
        </div>
        <div
          aria-hidden
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 6,
            height: 44,
            marginTop: spaceStack,
          }}>
          {MINI_BARS.map((height, index) => (
            <div
              key={`bar-${index}`}
              style={{
                flex: 1,
                height: `${height}%`,
                borderRadius: Math.min(radiusControl, 6),
                backgroundColor: index === MINI_BARS.length - 1 ? accent : primary,
              }}
            />
          ))}
        </div>
      </div>

      {/* Form row + button set */}
      <div style={card}>
        <div style={{color: muted, fontSize: 11, marginBottom: 6}}>
          Workspace name
        </div>
        <div
          style={{
            border: `1px solid ${border}`,
            borderRadius: radiusControl,
            padding: `${Math.max(6, spaceControl - 4)}px ${spaceControl}px`,
            backgroundColor: surface,
          }}>
          Acme Industries
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: spaceStack,
          }}>
          <div
            style={{
              backgroundColor: primary,
              color: raised,
              fontWeight: 600,
              borderRadius: radiusControl,
              padding: `${Math.max(6, spaceControl - 4)}px ${spaceControl + 4}px`,
            }}>
            Save changes
          </div>
          <div
            style={{
              border: `1px solid ${border}`,
              color: text,
              fontWeight: 600,
              borderRadius: radiusControl,
              padding: `${Math.max(6, spaceControl - 4)}px ${spaceControl + 4}px`,
            }}>
            Cancel
          </div>
        </div>
      </div>

      {/* Table snippet — the panes are narrow, so each row stacks the stage
          pill under a deal + amount line instead of forcing three columns. */}
      <div style={{...card, padding: 0, overflow: 'hidden'}}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: `${Math.max(6, spaceControl - 4)}px ${spaceCard}px`,
            color: muted,
            fontSize: 11,
            borderBottom: `1px solid ${border}`,
          }}>
          <span style={{flex: 1, minWidth: 0}}>Deal</span>
          <span style={{whiteSpace: 'nowrap'}}>Amount</span>
        </div>
        {MINI_DEALS.map((row, index) => (
          <div
            key={row.deal}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              padding: `${Math.max(6, spaceControl - 4)}px ${spaceCard}px`,
              borderBottom:
                index === MINI_DEALS.length - 1 ? undefined : `1px solid ${border}`,
            }}>
            <div style={{display: 'flex', alignItems: 'baseline', gap: 8}}>
              <span style={{flex: 1, fontWeight: 600, minWidth: 0}}>
                {row.deal}
              </span>
              <span
                style={{
                  whiteSpace: 'nowrap',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                {row.amount}
              </span>
            </div>
            <span
              style={{
                alignSelf: 'flex-start',
                color: chipTone(row.tone),
                border: `1px solid ${chipTone(row.tone)}`,
                borderRadius: Math.max(radiusControl, 4),
                padding: '1px 8px',
                fontSize: 11,
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}>
              {row.stage}
            </span>
          </div>
        ))}
      </div>

      {/* Floating action — exercises the overlay shadow token */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          right: spaceCard,
          bottom: spaceCard,
          backgroundColor: primary,
          color: raised,
          fontWeight: 700,
          borderRadius: Math.max(radiusControl, 12),
          padding: `${Math.max(6, spaceControl - 4)}px ${spaceControl + 4}px`,
          boxShadow: shadowOverlay,
        }}>
        + New deal
      </div>
    </div>
  );
}

// ============= FORCED-SCHEME PANE =============
// The signature detail: each pane forces one scheme with colorScheme (so
// every light-dark() pair — fixture and Astryx token alike — resolves to
// that side) AND data-astryx-media (so the Astryx theme's own scheme
// overrides follow), exactly like the demo site's toggle does at the root.
// Only the MiniApp artwork sits inside the forced wrapper — the pane chrome
// stays in the HOST scheme so its label and badge remain legible either way.

function PreviewPane({scheme, draft}: {scheme: 'light' | 'dark'; draft: Draft}) {
  return (
    <div style={styles.paneFrame}>
      <div style={styles.paneChrome}>
        <Icon icon={scheme === 'light' ? SunIcon : MoonIcon} size="sm" color="secondary" />
        <Text type="label" size="sm">
          {scheme === 'light' ? 'Light' : 'Dark'}
        </Text>
        <Badge label="forced" variant="neutral" />
      </div>
      <div data-astryx-media={scheme} style={{colorScheme: scheme}}>
        <MiniApp draft={draft} />
      </div>
    </div>
  );
}

// ============= INLINE TOKEN EDITORS =============

function ColorEditor({
  value,
  onChange,
}: {
  value: TokenValue & {kind: 'color'};
  onChange: (next: TokenValue) => void;
}) {
  const ramp = RAMP_BY_ID.get(value.ramp) ?? RAMPS[0];
  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <Text type="label" size="sm" color="secondary">
          Ramp
        </Text>
        <HStack gap={1} wrap="wrap">
          {RAMPS.map(candidate => (
            <button
              key={candidate.id}
              type="button"
              className="tts-focusable"
              aria-label={`${candidate.name} ramp`}
              aria-pressed={candidate.id === ramp.id}
              title={candidate.name}
              style={{
                ...styles.rampChip,
                ...(candidate.id === ramp.id ? styles.rampChipActive : null),
                backgroundColor: lightDark(candidate.steps[4]),
              }}
              onClick={() =>
                onChange({kind: 'color', ramp: candidate.id, step: value.step})
              }
            />
          ))}
        </HStack>
      </VStack>
      <Slider
        label="Ramp step"
        min={0}
        max={ramp.steps.length - 1}
        step={1}
        value={value.step}
        onChange={(step: number) => onChange({kind: 'color', ramp: ramp.id, step})}
        formatValue={step => `${ramp.name} ${stepLabel(step)}`}
        marks={[
          {value: 0, label: '100'},
          {value: 3, label: '400'},
          {value: 7, label: '800'},
        ]}
      />
      {/* Button-path equivalent of the slider: tap a step directly. */}
      <div style={styles.stepStrip} role="group" aria-label={`${ramp.name} ramp steps`}>
        {ramp.steps.map((step, index) => (
          <button
            key={`${ramp.id}-${index}`}
            type="button"
            className="tts-focusable"
            aria-label={`${ramp.name} ${stepLabel(index)}`}
            aria-pressed={index === value.step}
            style={{
              ...styles.stepSwatch,
              ...(index === value.step ? styles.stepSwatchActive : null),
              backgroundColor: lightDark(step),
            }}
            onClick={() => onChange({kind: 'color', ramp: ramp.id, step: index})}
          />
        ))}
      </div>
      <Text type="supporting" color="secondary">
        Resolves to light-dark({ramp.steps[value.step].light},{' '}
        {ramp.steps[value.step].dark})
      </Text>
    </VStack>
  );
}

function SizeEditor({
  def,
  value,
  onChange,
}: {
  def: TokenDef;
  value: TokenValue & {kind: 'size'};
  onChange: (next: TokenValue) => void;
}) {
  return (
    <VStack gap={2}>
      <NumberInput
        label={`${def.label} (px)`}
        value={value.px}
        onChange={px => onChange({kind: 'size', px})}
        min={def.min ?? 0}
        max={def.max ?? 32}
        step={def.step ?? 2}
        width="100%"
      />
      <Text type="supporting" color="secondary">
        {def.min ?? 0}–{def.max ?? 32}px in {def.step ?? 2}px steps
      </Text>
    </VStack>
  );
}

function ShadowEditor({
  value,
  onChange,
}: {
  value: TokenValue & {kind: 'shadow'};
  onChange: (next: TokenValue) => void;
}) {
  return (
    <VStack gap={3}>
      <Slider
        label="Elevation"
        min={0}
        max={SHADOW_LEVELS.length - 1}
        step={1}
        value={value.level}
        onChange={(level: number) => onChange({kind: 'shadow', level})}
        formatValue={level => SHADOW_LEVELS[level].label}
        marks={[
          {value: 0, label: 'None'},
          {value: 2, label: 'Medium'},
          {value: 4, label: 'Pop'},
        ]}
      />
      <div
        aria-hidden
        style={{
          ...styles.shadowPreview,
          boxShadow: SHADOW_LEVELS[value.level].css,
        }}
      />
    </VStack>
  );
}

// ============= TOKEN TREE =============

function TokenSummary({value}: {value: TokenValue}) {
  return (
    <HStack gap={1.5} vAlign="center">
      {value.kind === 'color' && (
        <div
          aria-hidden
          style={{
            ...styles.swatch,
            backgroundColor: resolveCss(value),
          }}
        />
      )}
      <Text type="supporting" color="secondary">
        {formatValue(value)}
      </Text>
    </HStack>
  );
}

function TokenTree({
  draft,
  editedIds,
  selectedId,
  collapsedGroups,
  onToggleGroup,
  onSelect,
  onEdit,
  onRevert,
}: {
  draft: Draft;
  editedIds: Set<string>;
  selectedId: string | null;
  collapsedGroups: Set<TokenGroup>;
  onToggleGroup: (group: TokenGroup) => void;
  onSelect: (tokenId: string | null) => void;
  onEdit: (tokenId: string, value: TokenValue) => void;
  onRevert: (tokenId: string) => void;
}) {
  return (
    <VStack gap={1}>
      {GROUPS.map(group => {
        const tokens = TOKENS.filter(token => token.group === group.id);
        const editedCount = tokens.filter(token => editedIds.has(token.id)).length;
        const isCollapsed = collapsedGroups.has(group.id);
        return (
          <VStack key={group.id} gap={0.5}>
            <button
              type="button"
              className="tts-row tts-focusable"
              style={styles.groupHeader}
              aria-expanded={!isCollapsed}
              onClick={() => onToggleGroup(group.id)}>
              <Icon
                icon={isCollapsed ? ChevronRightIcon : ChevronDownIcon}
                size="sm"
                color="secondary"
              />
              <Text type="label" size="sm">
                {group.label}
              </Text>
              <StackItem size="fill">
                <HStack gap={1} vAlign="center" hAlign="end">
                  {editedCount > 0 && (
                    <Badge label={`${editedCount} edited`} variant="blue" />
                  )}
                  <Text type="supporting" color="secondary">
                    {tokens.length}
                  </Text>
                </HStack>
              </StackItem>
            </button>
            {!isCollapsed &&
              tokens.map(def => {
                const value = draft.value(def.id);
                const isSelected = selectedId === def.id;
                const isEdited = editedIds.has(def.id);
                return (
                  <VStack key={def.id} gap={0}>
                    <button
                      type="button"
                      className="tts-row tts-focusable"
                      style={{
                        ...styles.tokenRow,
                        ...(isSelected ? styles.tokenRowSelected : null),
                      }}
                      aria-expanded={isSelected}
                      onClick={() => onSelect(isSelected ? null : def.id)}>
                      {isEdited ? (
                        <span style={styles.editedDot} aria-hidden />
                      ) : (
                        <span style={{width: 6, flexShrink: 0}} aria-hidden />
                      )}
                      <StackItem size="fill">
                        <Text type="body" maxLines={1}>
                          {def.label}
                        </Text>
                      </StackItem>
                      <TokenSummary value={value} />
                    </button>
                    {isSelected && (
                      <div style={styles.editorShell}>
                        <VStack gap={2}>
                          <HStack gap={2} vAlign="center">
                            <StackItem size="fill">
                              <VStack gap={0}>
                                <Text type="label" size="sm">
                                  {def.id}
                                </Text>
                                <Text type="supporting" color="secondary">
                                  {def.description}
                                </Text>
                              </VStack>
                            </StackItem>
                            {isEdited && (
                              <Button
                                label="Revert"
                                variant="ghost"
                                size="sm"
                                icon={
                                  <Icon
                                    icon={RotateCcwIcon}
                                    size="sm"
                                    color="inherit"
                                  />
                                }
                                onClick={() => onRevert(def.id)}
                              />
                            )}
                          </HStack>
                          {value.kind === 'color' && (
                            <ColorEditor
                              value={value}
                              onChange={next => onEdit(def.id, next)}
                            />
                          )}
                          {value.kind === 'size' && (
                            <SizeEditor
                              def={def}
                              value={value}
                              onChange={next => onEdit(def.id, next)}
                            />
                          )}
                          {value.kind === 'shadow' && (
                            <ShadowEditor
                              value={value}
                              onChange={next => onEdit(def.id, next)}
                            />
                          )}
                        </VStack>
                      </div>
                    )}
                  </VStack>
                );
              })}
          </VStack>
        );
      })}
    </VStack>
  );
}

// ============= CHANGES RAIL =============

interface RailChipData {
  def: TokenDef;
  before: TokenValue;
  after: TokenValue;
  seq: number;
  batchIndex: number;
  sourceLabel: string;
}

function ChangeChip({
  chip,
  isAnimated,
  onRevert,
}: {
  chip: RailChipData;
  isAnimated: boolean;
  onRevert: () => void;
}) {
  return (
    <div
      className={isAnimated ? 'tts-animated' : undefined}
      style={{
        ...styles.chip,
        ...(isAnimated
          ? {
              animation: 'tts-chip-in 360ms both',
              animationDelay: `${chip.batchIndex * 70}ms`,
            }
          : null),
      }}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" size="sm" maxLines={1}>
              {chip.def.label}
            </Text>
          </StackItem>
          <IconButton
            label={`Revert ${chip.def.label}`}
            tooltip="Revert to base"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={onRevert}
          />
        </HStack>
        <HStack gap={1.5} vAlign="center" wrap="wrap">
          {chip.before.kind === 'color' && (
            <div
              aria-hidden
              style={{...styles.chipSwatch, backgroundColor: resolveCss(chip.before)}}
            />
          )}
          <Text type="supporting" color="secondary">
            {formatValue(chip.before)}
          </Text>
          <Text type="supporting" color="secondary">
            →
          </Text>
          {chip.after.kind === 'color' && (
            <div
              aria-hidden
              style={{...styles.chipSwatch, backgroundColor: resolveCss(chip.after)}}
            />
          )}
          <Text type="label" size="sm">
            {formatValue(chip.after)}
          </Text>
        </HStack>
        <Text type="supporting" color="secondary">
          {chip.def.id} · {chip.sourceLabel}
        </Text>
      </VStack>
    </div>
  );
}

function ChangesRail({
  chips,
  isAnimated,
  onRevert,
  onResetAll,
}: {
  chips: RailChipData[];
  isAnimated: boolean;
  onRevert: (tokenId: string) => void;
  onResetAll: () => void;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="label" size="sm">
          Changes
        </Text>
        <Badge
          label={String(chips.length)}
          variant={chips.length > 0 ? 'blue' : 'neutral'}
        />
        <StackItem size="fill">
          <HStack gap={1} hAlign="end">
            <Button
              label="Reset all"
              variant="ghost"
              size="sm"
              isDisabled={chips.length === 0}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              onClick={onResetAll}
            />
          </HStack>
        </StackItem>
      </HStack>
      {chips.length === 0 ? (
        <Text type="supporting" color="secondary">
          No edits yet. Select a token in the tree or apply a brand preset —
          each change lands here as a before → after chip.
        </Text>
      ) : (
        chips.map(chip => (
          <ChangeChip
            key={`${chip.def.id}-${chip.seq}`}
            chip={chip}
            isAnimated={isAnimated}
            onRevert={() => onRevert(chip.def.id)}
          />
        ))
      )}
    </VStack>
  );
}

// ============= EXPORT DRAWER =============

type ExportTab = 'json' | 'css' | 'diff';

function ExportDrawer({
  draft,
  editedIds,
  onCopied,
}: {
  draft: Draft;
  editedIds: Set<string>;
  onCopied: (what: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<ExportTab>('diff');

  const jsonText = useMemo(() => buildJsonExport(draft, editedIds), [draft, editedIds]);
  const cssText = useMemo(() => buildCssExport(draft), [draft]);
  const diffLines = useMemo(() => buildDiff(draft, editedIds), [draft, editedIds]);
  const diffText = useMemo(
    () => diffLines.map(line => line.text).join('\n'),
    [diffLines],
  );

  const copy = () => {
    const text = tab === 'json' ? jsonText : tab === 'css' ? cssText : diffText;
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(text).catch(() => undefined);
    }
    onCopied(tab === 'json' ? 'JSON manifest' : tab === 'css' ? 'CSS custom properties' : 'diff');
  };

  return (
    <Card padding={0}>
      <div style={{padding: 'var(--spacing-2) var(--spacing-3)'}}>
        <HStack gap={2} vAlign="center">
          <Icon icon={BracesIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label" size="sm">
                Export
              </Text>
              <Text type="supporting" color="secondary">
                JSON · CSS custom properties · session diff (
                {editedIds.size} token{editedIds.size === 1 ? '' : 's'} changed)
              </Text>
            </VStack>
          </StackItem>
          <Button
            label={isOpen ? 'Close' : 'Open'}
            variant="secondary"
            size="sm"
            icon={
              <Icon
                icon={isOpen ? ChevronDownIcon : ChevronRightIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() => setIsOpen(open => !open)}
          />
        </HStack>
      </div>
      {isOpen && (
        <>
          <Divider />
          <div style={{padding: 'var(--spacing-2) var(--spacing-3)'}}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <TabList
                  value={tab}
                  onChange={value => setTab(value as ExportTab)}
                  size="sm">
                  <Tab value="diff" label="Diff" />
                  <Tab value="css" label="CSS" />
                  <Tab value="json" label="JSON" />
                </TabList>
              </StackItem>
              <Button
                label="Copy"
                variant="secondary"
                size="sm"
                icon={<Icon icon={CopyIcon} size="sm" color="inherit" />}
                tooltip="Copy this tab to the clipboard"
                onClick={copy}
              />
            </HStack>
          </div>
          <Divider />
          {tab === 'diff' ? (
            <pre style={styles.diffPre}>
              {diffLines.map((line, index) => (
                <span
                  key={`diff-${index}`}
                  style={{
                    ...styles.diffLine,
                    ...(line.kind === 'del'
                      ? styles.diffDel
                      : line.kind === 'add'
                        ? styles.diffAdd
                        : null),
                  }}>
                  {line.text}
                </span>
              ))}
            </pre>
          ) : (
            <CodeBlock
              code={tab === 'json' ? jsonText : cssText}
              language={tab === 'json' ? 'json' : 'css'}
              size="sm"
              width="100%"
              hasCopyButton={false}
            />
          )}
        </>
      )}
    </Card>
  );
}

// ============= PAGE =============

export default function ThemeTokenStudioTemplate() {
  // The ENTIRE edit model: an append-only change log. The current manifest,
  // the rail, and every exporter are folds over this array.
  const [log, setLog] = useState<Edit[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(
    '--brand-primary',
  );
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TokenGroup>>(
    () => new Set(),
  );
  const [isTokenSheetOpen, setIsTokenSheetOpen] = useState(false);
  const [isRailExpanded, setIsRailExpanded] = useState(false);
  const [activePane, setActivePane] = useState<0 | 1>(0);
  const [announcement, setAnnouncement] = useState('');

  const paneScrollRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  // Responsive contract: <=640px single-pane fallbacks; <=1080px the rail
  // collapses to the badge-count pill.
  const isPhone = useMediaQuery('(max-width: 640px)');
  const isRailDocked = useMediaQuery('(min-width: 1081px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ---- folds ----
  const overrides = useMemo(() => foldLog(log), [log]);
  const draft = useMemo(() => buildDraft(overrides), [overrides]);

  const editedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const def of TOKENS) {
      if (!valuesEqual(draft.value(def.id), def.base)) {
        ids.add(def.id);
      }
    }
    return ids;
  }, [draft]);

  const railChips = useMemo<RailChipData[]>(() => {
    const chips: RailChipData[] = [];
    for (const def of TOKENS) {
      if (!editedIds.has(def.id)) {
        continue;
      }
      const last = overrides.get(def.id);
      if (!last) {
        continue;
      }
      chips.push({
        def,
        before: def.base,
        after: last.value,
        seq: last.seq,
        batchIndex: last.batchIndex,
        sourceLabel: last.sourceLabel,
      });
    }
    // Most recent edit first, so preset batches read top-down in order.
    return chips.sort((a, b) => b.seq - a.seq);
  }, [editedIds, overrides]);

  // ---- mutations (all appends; undo pops the last batch) ----
  const recordEdit = (tokenId: string, value: TokenValue) => {
    setLog(prev => {
      const last = prev[prev.length - 1];
      // Coalesce consecutive manual edits to the same token (slider drags)
      // so the log — and therefore undo — stays one entry per gesture.
      if (last && last.tokenId === tokenId && last.source === 'manual') {
        return [...prev.slice(0, -1), {...last, value}];
      }
      return [
        ...prev,
        {
          seq: nextSeq(prev),
          batch: nextBatch(prev),
          batchIndex: 0,
          tokenId,
          value,
          source: 'manual',
          sourceLabel: 'Manual edit',
        },
      ];
    });
  };

  const revertToken = (tokenId: string) => {
    const def = TOKEN_BY_ID.get(tokenId);
    if (!def) {
      return;
    }
    setLog(prev => [
      ...prev,
      {
        seq: nextSeq(prev),
        batch: nextBatch(prev),
        batchIndex: 0,
        tokenId,
        value: def.base,
        source: 'revert',
        sourceLabel: 'Revert',
      },
    ]);
    setAnnouncement(`Reverted ${def.label} to its base value`);
  };

  /** Append a staggered batch of edits (presets, reset-all). */
  const appendBatch = (
    edits: {tokenId: string; value: TokenValue}[],
    source: EditSource,
    sourceLabel: string,
  ) => {
    if (edits.length === 0) {
      return;
    }
    setLog(prev => {
      const batch = nextBatch(prev);
      let seq = nextSeq(prev);
      const appended = edits.map((edit, index) => ({
        seq: seq++,
        batch,
        batchIndex: index,
        tokenId: edit.tokenId,
        value: edit.value,
        source,
        sourceLabel,
      }));
      return [...prev, ...appended];
    });
  };

  const resetAll = () => {
    const edits = TOKENS.filter(def => editedIds.has(def.id)).map(def => ({
      tokenId: def.id,
      value: def.base,
    }));
    appendBatch(edits, 'reset', 'Reset all');
    setAnnouncement(`Reset ${edits.length} tokens to the manifest defaults`);
  };

  const applyPreset = (presetId: string) => {
    if (presetId === 'default') {
      if (editedIds.size === 0) {
        toast({body: 'Already at the manifest defaults'});
        return;
      }
      const edits = TOKENS.filter(def => editedIds.has(def.id)).map(def => ({
        tokenId: def.id,
        value: def.base,
      }));
      appendBatch(edits, 'preset', 'Default preset');
      setAnnouncement(`Default preset restored ${edits.length} tokens`);
      return;
    }
    const preset = PRESETS.find(candidate => candidate.id === presetId);
    if (!preset) {
      return;
    }
    // Deterministic batch: only append edits that actually change a value,
    // so the rail narrates exactly what the preset touched.
    const edits = preset.edits.filter(edit => {
      return !valuesEqual(draft.value(edit.tokenId), edit.value);
    });
    if (edits.length === 0) {
      toast({body: `${preset.name} is already applied`});
      return;
    }
    appendBatch(edits, 'preset', `${preset.name} preset`);
    setAnnouncement(`${preset.name} preset changed ${edits.length} tokens`);
  };

  const undoLastBatch = () => {
    if (log.length === 0) {
      return;
    }
    const lastBatch = log[log.length - 1].batch;
    const undone = log.filter(edit => edit.batch === lastBatch);
    setLog(prev => prev.filter(edit => edit.batch !== lastBatch));
    setAnnouncement(
      `Undid ${undone[0].sourceLabel.toLowerCase()} (${undone.length} edit${
        undone.length === 1 ? '' : 's'
      })`,
    );
  };

  const toggleGroup = (group: TokenGroup) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  const onCopied = (what: string) => {
    toast({
      body: `Copied ${what} to the clipboard`,
      endContent: <Icon icon={CheckIcon} size="sm" color="inherit" />,
    });
    setAnnouncement(`Copied ${what}`);
  };

  // Phone carousel: the segmented Light/Dark buttons are the button path
  // for the swipe gesture; onScroll keeps them in sync with the snap.
  const scrollToPane = (index: 0 | 1) => {
    setActivePane(index);
    const node = paneScrollRef.current;
    if (!node) {
      return;
    }
    node.scrollTo({
      left: index * node.clientWidth,
      behavior: isReducedMotion ? 'auto' : 'smooth',
    });
  };

  const onPaneScroll = () => {
    const node = paneScrollRef.current;
    if (!node || node.clientWidth === 0) {
      return;
    }
    const index = Math.round(node.scrollLeft / node.clientWidth) === 0 ? 0 : 1;
    setActivePane(index);
  };

  // ---- shared blocks ----
  const presetsBlock = (
    <Card padding={3}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={SparklesIcon} size="sm" color="secondary" />
          <Text type="label" size="sm">
            Brand presets
          </Text>
        </HStack>
        <Button
          label="Default"
          variant="secondary"
          size="sm"
          style={styles.fullWidth}
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          tooltip="Restore every edited token to the manifest base"
          onClick={() => applyPreset('default')}
        />
        {PRESETS.map(preset => (
          <Button
            key={preset.id}
            label={preset.name}
            variant="secondary"
            size="sm"
            style={styles.fullWidth}
            icon={<Icon icon={WandSparklesIcon} size="sm" color="inherit" />}
            tooltip={preset.description}
            onClick={() => applyPreset(preset.id)}
          />
        ))}
        <Text type="supporting" color="secondary">
          Presets apply as batch edits — watch the changes rail narrate what
          each one touched.
        </Text>
      </VStack>
    </Card>
  );

  const tokenTree = (
    <TokenTree
      draft={draft}
      editedIds={editedIds}
      selectedId={selectedTokenId}
      collapsedGroups={collapsedGroups}
      onToggleGroup={toggleGroup}
      onSelect={setSelectedTokenId}
      onEdit={recordEdit}
      onRevert={revertToken}
    />
  );

  const rail = (
    <ChangesRail
      chips={railChips}
      isAnimated={!isReducedMotion}
      onRevert={revertToken}
      onResetAll={resetAll}
    />
  );

  const panes = isPhone ? (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm">
            Preview · Lumen CRM
          </Text>
        </StackItem>
        <Button
          label="Light"
          variant={activePane === 0 ? 'primary' : 'secondary'}
          size="sm"
          icon={<Icon icon={SunIcon} size="sm" color="inherit" />}
          onClick={() => scrollToPane(0)}
        />
        <Button
          label="Dark"
          variant={activePane === 1 ? 'primary' : 'secondary'}
          size="sm"
          icon={<Icon icon={MoonIcon} size="sm" color="inherit" />}
          onClick={() => scrollToPane(1)}
        />
      </HStack>
      <div ref={paneScrollRef} style={styles.paneSnap} onScroll={onPaneScroll}>
        <div style={styles.paneSnapItem}>
          <PreviewPane scheme="light" draft={draft} />
        </div>
        <div style={styles.paneSnapItem}>
          <PreviewPane scheme="dark" draft={draft} />
        </div>
      </div>
    </VStack>
  ) : (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Text type="label" size="sm">
          Preview · Lumen CRM
        </Text>
        <Text type="supporting" color="secondary">
          One manifest, both schemes — every edit lands in both panes at once
        </Text>
      </HStack>
      <div style={styles.paneGrid}>
        <PreviewPane scheme="light" draft={draft} />
        <PreviewPane scheme="dark" draft={draft} />
      </div>
    </VStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={PaletteIcon} size="md" color="secondary" />
                <Heading level={1}>Token studio</Heading>
                {!isPhone && (
                  <Text type="supporting" color="secondary" maxLines={1}>
                    brand.tokens.json · {editedIds.size} of {TOKENS.length}{' '}
                    tokens edited
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Button
              label="Undo"
              variant="ghost"
              size="sm"
              isIconOnly={isPhone}
              isDisabled={log.length === 0}
              icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
              tooltip="Undo the last edit or batch"
              onClick={undoLastBatch}
            />
            {isPhone && (
              <Button
                label={`Tokens${editedIds.size > 0 ? ` (${editedIds.size})` : ''}`}
                variant="primary"
                size="sm"
                icon={<Icon icon={SlidersHorizontalIcon} size="sm" color="inherit" />}
                onClick={() => setIsTokenSheetOpen(true)}
              />
            )}
          </HStack>
        </LayoutHeader>
      }
      start={
        isPhone ? undefined : (
          <LayoutPanel width={300} padding={0} label="Token manifest">
            <div style={styles.panelShell}>
              <div style={styles.panelPinned}>{presetsBlock}</div>
              <div style={styles.panelScroll}>{tokenTree}</div>
            </div>
          </LayoutPanel>
        )
      }
      end={
        isRailDocked ? (
          <LayoutPanel width={300} padding={0} label="Changes">
            <div style={styles.railScroll}>{rail}</div>
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          <style>{GLOBAL_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.contentRoot}>
            <div style={styles.contentScroll}>
              <VStack gap={4}>
                {panes}
                <ExportDrawer
                  draft={draft}
                  editedIds={editedIds}
                  onCopied={onCopied}
                />
              </VStack>
            </div>

            {/* 641–1080px + phones: the rail collapses to a badge-count pill
                that expands into an overlay. */}
            {!isRailDocked && !isRailExpanded && (
              <div style={styles.railPill}>
                <Button
                  label={`Changes (${railChips.length})`}
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={SlidersHorizontalIcon} size="sm" color="inherit" />}
                  onClick={() => setIsRailExpanded(true)}
                />
              </div>
            )}
            {!isRailDocked && isRailExpanded && (
              <div
                className={isReducedMotion ? undefined : 'tts-animated'}
                style={{
                  ...styles.railOverlay,
                  ...(isReducedMotion
                    ? null
                    : {animation: 'tts-sheet-up 240ms both'}),
                }}>
                <div style={styles.railOverlayHeader}>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Text type="label" size="sm">
                        Changes
                      </Text>
                    </StackItem>
                    <IconButton
                      label="Close changes"
                      icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsRailExpanded(false)}
                    />
                  </HStack>
                </div>
                <div style={{...styles.railOverlayBody, padding: 'var(--spacing-3)'}}>
                  {rail}
                </div>
              </div>
            )}

            {/* Phone bottom sheet: presets + token tree. */}
            {isPhone && isTokenSheetOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close token sheet"
                  style={styles.sheetBackdrop}
                  onClick={() => setIsTokenSheetOpen(false)}
                />
                <div
                  role="dialog"
                  aria-label="Token manifest"
                  className={isReducedMotion ? undefined : 'tts-animated'}
                  style={{
                    ...styles.sheet,
                    ...(isReducedMotion
                      ? null
                      : {animation: 'tts-sheet-up 240ms both'}),
                  }}>
                  <div style={styles.sheetGrabber} aria-hidden />
                  <div style={styles.sheetHeader}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="label" size="sm">
                          Tokens
                        </Text>
                      </StackItem>
                      <IconButton
                        label="Close token sheet"
                        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsTokenSheetOpen(false)}
                      />
                    </HStack>
                  </div>
                  <div style={styles.sheetBody}>
                    <VStack gap={3}>
                      {presetsBlock}
                      {tokenTree}
                    </VStack>
                  </div>
                </div>
              </>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
