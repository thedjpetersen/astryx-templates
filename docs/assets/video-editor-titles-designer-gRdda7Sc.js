var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (title comp 'Act I — Cold Open' for
 *   the documentary 'Harbor Light': four text layers with fixed typography/
 *   fill/stroke/shadow/anchor/animation defaults, a named six-swatch stage
 *   palette, six lower-third gallery templates)
 * @output Titles & Graphics designer surface for an NLE: a 52px header
 *   (project name, Autosaved Badge, inspector toggle, Save style + Add to
 *   timeline Buttons), a 248px left text-layers panel (kind glyph, name,
 *   EyeIcon/LockIcon toggles per layer), a center canvas — 16:9
 *   scheme-locked dark stage frozen on PGM 00:04:12:10 with dashed
 *   title/action safe-area guides, live click-to-select text layers in a
 *   3x3 anchor grid with container-query (cqw) font scaling — over a
 *   guides/backdrop toolbar, a 320px right inspector (text TextInput, font
 *   Selector, size/tracking/leading Sliders, weight SegmentedControl,
 *   fill/stroke/shadow swatch sections with Switch enables and NumberInput
 *   steppers, 3x3 alignment grid, animation preset chips with In/Out
 *   steppers and an In-Hold-Out timing bar), and the defining region: a
 *   fixed 216px bottom lower-thirds gallery dock of six CSS-mocked
 *   template cards with an Applied badge.
 * @position Page template; emitted by \`astryx template
 *   video-editor-titles-designer\`
 *
 * Frame: Layout height="fill" inside a 100dvh root div, zero page scroll.
 * LayoutHeader carries project chrome. Middle band: LayoutPanel start 248
 * (text layers, fixed), LayoutContent (canvas stage, flexible), LayoutPanel
 * end 320 (inspector, collapsible via the header toggle). LayoutFooter
 * height 216 hosts the lower-thirds gallery dock: a Toolbar caption row and
 * one horizontally scrolling card rail. The stage uses containerType:
 * 'inline-size' so every layer's font size, stroke width, and shadow
 * offsets are cqw fractions of the 1920px design width — resizing the
 * stage keeps the composition proportionally registered.
 *
 * Responsive contract:
 * - >1100px: header | layers 248 | canvas (fill) | inspector 320 | dock 216.
 * - <=1100px: the layers panel drops out; a compact layer Selector appears
 *   in the canvas toolbar so selection stays reachable.
 * - <=768px: the inspector drops out (its header toggle disables) and the
 *   header hides comp metadata; the header row wraps instead of clipping.
 * - The gallery rail scrolls horizontally at every width by design — six
 *   176px cards outgrow a phone viewport; the caption row never scrolls.
 *
 * Container policy (tool-dock archetype): frame-first rows and panels
 * everywhere; no Cards — layer rows, inspector sections, and gallery cards
 * are styled divs/buttons on panel surfaces. The stage and gallery
 * thumbnails are styled divs with CSS gradients — never <video> or network
 * media.
 *
 * Color policy: the canvas stage and gallery thumbnails are deliberately
 * scheme-locked dark (colorScheme: 'dark') — they stand in for rendered
 * program frames, so their gradients, guide strokes, and scrim text are
 * intentional literals. The fill/stroke/shadow swatches are literal by
 * design too: they are the exact colors composited onto that dark frame
 * ('Paper' #F5F1E8, 'Harbor Gold' #E8B34B, …), not UI chrome, so they must
 * not flip with the theme. Everything else is token-pure (var(--color-*));
 * the only non-stage literal pair is the light-dark(#0171E3, #4C9EFF)
 * accent fallback on the anchor dots and timing bar.
 */

import {useState, type CSSProperties} from 'react';

import {
  ClapperboardIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  LayersIcon,
  LockIcon,
  LockOpenIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
  PlusIcon,
  RotateCcwIcon,
  SparklesIcon,
  TagIcon,
  TextIcon,
  TypeIcon,
  UserIcon,
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
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= COMPOSITION CONSTANTS =============

const PROJECT_NAME = 'Harbor Light';
const COMP_NAME = 'Act I — Cold Open';
const FRAME_TC = '00:04:12:10'; // frozen program frame under the titles
const COMP_DURATION_SEC = 6; // every title layer renders for 6s on the V2 track

const MONO = 'var(--font-family-code, monospace)';

// Design-resolution width the cqw math resolves against: a font size of
// 96 design-px renders at (96 / 1920 * 100)cqw of the stage width.
const DESIGN_W = 1920;
const cq = (designPx: number) => \`\${((designPx / DESIGN_W) * 100).toFixed(4)}cqw\`;

// Fixed panel geometry.
const LAYERS_PANEL_W = 248;
const INSPECTOR_W = 320;
const GALLERY_DOCK_H = 216;
const GALLERY_CARD_W = 176;

// ============= FIXTURES =============
// Fixed layer styles, palette, and gallery rows — no clocks, no randomness.

type FontId = 'archivo' | 'source-serif' | 'inter' | 'plex-mono' | 'marcellus';
type SwatchId =
  | 'paper'
  | 'harbor-gold'
  | 'signal-red'
  | 'tide-teal'
  | 'fog-grey'
  | 'ink';
type AnchorH = 'start' | 'center' | 'end';
type AnchorV = 'top' | 'middle' | 'bottom';
type AnimPreset = 'none' | 'fade' | 'slide' | 'typewriter';
type Backdrop = 'frame' | 'checker' | 'black';

const FONT_OPTIONS: {value: FontId; label: string}[] = [
  {value: 'archivo', label: 'Archivo Grotesk'},
  {value: 'source-serif', label: 'Source Serif 4'},
  {value: 'inter', label: 'Inter'},
  {value: 'plex-mono', label: 'IBM Plex Mono'},
  {value: 'marcellus', label: 'Marcellus Display'},
];

// Preview stacks: each id maps to an installed-or-fallback CSS stack so the
// canvas visibly changes when the Selector changes.
const FONT_STACKS: Record<FontId, string> = {
  archivo: "'Archivo', 'Helvetica Neue', Arial, sans-serif",
  'source-serif': "'Source Serif 4', Georgia, 'Times New Roman', serif",
  inter: "'Inter', 'Segoe UI', system-ui, sans-serif",
  'plex-mono': "'IBM Plex Mono', 'SF Mono', Menlo, monospace",
  marcellus: "'Marcellus', 'Palatino Linotype', 'Book Antiqua', serif",
};

// Stage palette: literal by design (colors composited onto the dark frame,
// never theme-flipped — see the header Color policy).
const SWATCHES: {id: SwatchId; label: string; value: string}[] = [
  {id: 'paper', label: 'Paper', value: '#F5F1E8'},
  {id: 'harbor-gold', label: 'Harbor Gold', value: '#E8B34B'},
  {id: 'signal-red', label: 'Signal Red', value: '#E4572E'},
  {id: 'tide-teal', label: 'Tide Teal', value: '#4FB8C5'},
  {id: 'fog-grey', label: 'Fog Grey', value: '#9AA5B1'},
  {id: 'ink', label: 'Ink', value: '#10151D'},
];

const swatchValue = (id: SwatchId): string =>
  SWATCHES.find(s => s.id === id)?.value ?? '#F5F1E8';

const swatchLabel = (id: SwatchId): string =>
  SWATCHES.find(s => s.id === id)?.label ?? 'Paper';

/** Full editable style for one text layer; inspector edits write back per
 * layer id and Reset restores these fixture defaults. */
interface LayerStyle {
  fontId: FontId;
  sizePx: number; // design px against the 1920 stage width
  weight: 400 | 500 | 600 | 700;
  tracking: number; // 1/1000 em
  leading: number; // percent
  fillId: SwatchId;
  strokeOn: boolean;
  strokeId: SwatchId;
  strokeWidth: number; // design px
  shadowOn: boolean;
  shadowId: SwatchId;
  shadowBlur: number; // design px
  shadowY: number; // design px
  anchorH: AnchorH;
  anchorV: AnchorV;
  preset: AnimPreset;
  inSec: number;
  outSec: number;
}

interface TitleLayer {
  id: string;
  name: string;
  kind: 'Title' | 'Subtitle' | 'Credit' | 'Tag';
  text: string;
  style: LayerStyle;
}

// Main-title defaults; every other layer overrides only what differs.
const BASE_STYLE: LayerStyle = {
  fontId: 'archivo',
  sizePx: 118,
  weight: 700,
  tracking: 28,
  leading: 104,
  fillId: 'paper',
  strokeOn: false,
  strokeId: 'ink',
  strokeWidth: 2,
  shadowOn: true,
  shadowId: 'ink',
  shadowBlur: 28,
  shadowY: 8,
  anchorH: 'center',
  anchorV: 'middle',
  preset: 'fade',
  inSec: 1.2,
  outSec: 0.8,
};
const ls = (overrides: Partial<LayerStyle>): LayerStyle => ({
  ...BASE_STYLE,
  ...overrides,
});

const LAYERS: TitleLayer[] = [
  {
    id: 'main-title',
    name: 'Main title',
    kind: 'Title',
    text: 'HARBOR LIGHT',
    style: ls({}),
  },
  {
    id: 'subtitle',
    name: 'Subtitle',
    kind: 'Subtitle',
    text: 'Three seasons on a working waterfront',
    style: ls({
      fontId: 'source-serif', sizePx: 42, weight: 400, tracking: 8,
      leading: 130, fillId: 'harbor-gold', strokeWidth: 1, shadowBlur: 16,
      shadowY: 4, inSec: 1.6,
    }),
  },
  {
    id: 'director-credit',
    name: 'Director credit',
    kind: 'Credit',
    text: 'A film by Mara Ellison',
    style: ls({
      fontId: 'inter', sizePx: 30, weight: 500, tracking: 16, leading: 120,
      fillId: 'fog-grey', strokeWidth: 1, shadowBlur: 12, shadowY: 3,
      anchorH: 'start', anchorV: 'bottom', preset: 'slide', inSec: 0.6,
      outSec: 0.4,
    }),
  },
  {
    id: 'date-tag',
    name: 'Date tag',
    kind: 'Tag',
    text: 'SPRING 2027',
    style: ls({
      fontId: 'plex-mono', sizePx: 26, weight: 600, tracking: 44,
      leading: 110, fillId: 'tide-teal', strokeWidth: 1, shadowOn: false,
      shadowBlur: 10, shadowY: 2, anchorH: 'end', anchorV: 'bottom',
      preset: 'typewriter', inSec: 0.9, outSec: 0.3,
    }),
  },
];

const INITIAL_SELECTED_LAYER = 'main-title';

const DEFAULT_STYLES: Record<string, LayerStyle> = Object.fromEntries(
  LAYERS.map(layer => [layer.id, layer.style]),
);
const DEFAULT_TEXTS: Record<string, string> = Object.fromEntries(
  LAYERS.map(layer => [layer.id, layer.text]),
);

const LAYER_KIND_ICON: Record<TitleLayer['kind'], typeof TypeIcon> = {
  Title: TypeIcon,
  Subtitle: TextIcon,
  Credit: UserIcon,
  Tag: TagIcon,
};

const ANIM_PRESETS: {id: AnimPreset; label: string; blurb: string}[] = [
  {id: 'none', label: 'None', blurb: 'Cuts in and out with the clip.'},
  {id: 'fade', label: 'Fade', blurb: 'Opacity ramps over the In/Out times.'},
  {id: 'slide', label: 'Slide', blurb: 'Rises 40px while fading in.'},
  {id: 'typewriter', label: 'Typewriter', blurb: 'Characters reveal over the In time.'},
];

/** Lower-thirds gallery: each variant drives a distinct CSS mock. */
interface LowerThirdTemplate {
  id: string;
  name: string;
  caption: string;
  accent: string; // literal — composited onto the dark thumbnail
  variant: 'bar' | 'line' | 'box' | 'chip' | 'split' | 'minimal';
}

const LOWER_THIRDS: LowerThirdTemplate[] = [
  {id: 'lt-interview', name: 'Interview Classic', caption: 'Name over role, gold rule',
    accent: '#E8B34B', variant: 'bar'},
  {id: 'lt-line', name: 'Line Accent', caption: 'Single underline, no plate',
    accent: '#4FB8C5', variant: 'line'},
  {id: 'lt-box', name: 'Boxed Caption', caption: 'Solid plate, high legibility',
    accent: '#F5F1E8', variant: 'box'},
  {id: 'lt-chip', name: 'Locator Tag', caption: 'Compact place/date chip',
    accent: '#E4572E', variant: 'chip'},
  {id: 'lt-split', name: 'Split Rule', caption: 'Name left, role right',
    accent: '#9AA5B1', variant: 'split'},
  {id: 'lt-minimal', name: 'Ticker Minimal', caption: 'Hairline text, no accent',
    accent: '#F5F1E8', variant: 'minimal'},
];

const INITIAL_APPLIED_TEMPLATE = 'lt-interview';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  mono: {fontFamily: MONO},
  // Header controls wrap onto a second row instead of clipping at phone
  // widths — the title cluster holds row one, buttons flow to row two.
  headerRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // ---- Layers panel ----
  panelScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  // Row is a div (the eye/lock ToggleButtons live inside it); the select
  // hit-area is its own nested-button-free <button>.
  layerRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
    width: '100%', padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid transparent',
  },
  layerSelect: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flex: 1, minWidth: 0, background: 'none', border: 'none',
    padding: 'var(--spacing-1) 0', cursor: 'pointer', textAlign: 'left',
    font: 'inherit', color: 'inherit',
  },
  layerRowSelected: {
    backgroundColor: 'var(--color-background-muted)',
    borderColor: 'var(--color-border)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  layerRowHidden: {opacity: 0.55},
  layerRowText: {minWidth: 0, flex: 1},
  // ---- Canvas ----
  canvasBackdrop: {
    height: '100%', overflowY: 'auto', padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex', flexDirection: 'column',
  },
  canvasColumn: {
    width: '100%', maxWidth: 860, marginInline: 'auto', marginBlock: 'auto',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
  },
  canvasToolbarRow: {flexWrap: 'wrap', rowGap: 'var(--spacing-2)'},
  // 16:9 stage — scheme-locked dark (see the header Color policy); a CSS
  // gradient stands in for the frozen program frame. containerType makes
  // the cqw font math resolve against the rendered stage width.
  stage: {
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    colorScheme: 'dark',
    containerType: 'inline-size',
    boxShadow: 'var(--shadow-high)',
  },
  // Harbor-at-dusk frame: horizon band, water sheen, vignette corners.
  stageFrame: {
    background:
      'linear-gradient(180deg, #2B3A52 0%, #3D4E66 34%, #1C2A3E 46%, #101B2C 62%, #0A1220 100%)',
  },
  stageChecker: {
    backgroundColor: '#1A2130', backgroundSize: '24px 24px',
    backgroundImage: 'repeating-conic-gradient(#242E42 0% 25%, #1A2130 0% 50%)',
  },
  stageBlack: {backgroundColor: '#05080E'},
  stageScrimTop: {
    position: 'absolute', top: 8, left: 12, right: 12,
    display: 'flex', justifyContent: 'space-between', gap: 12,
    fontFamily: MONO, fontSize: 11, letterSpacing: '0.06em',
    color: 'rgba(226, 232, 240, 0.75)', pointerEvents: 'none', zIndex: 4,
  },
  // Burn-in plates behind the scrim readouts: the action-safe guide's top
  // edge crosses this band at every stage size, so each span carries its
  // own dark plate to stay legible where the dashed stroke passes under.
  scrimPlate: {
    backgroundColor: 'rgba(5, 8, 14, 0.68)', padding: '1px 6px',
    borderRadius: 3, whiteSpace: 'nowrap',
  },
  // Safe-area guides: dashed literal strokes on the locked-dark stage.
  // Action safe insets 5%, title safe 10% — title safe is labeled at its
  // top-left corner, action safe at its bottom-right, so neither label
  // collides with the burn-in scrim band along the top edge.
  actionSafe: {
    position: 'absolute', inset: '5%', borderRadius: 2,
    border: '1px dashed rgba(148, 163, 184, 0.35)',
    pointerEvents: 'none', zIndex: 3,
  },
  titleSafe: {
    position: 'absolute', inset: '10%', borderRadius: 2,
    border: '1px dashed rgba(94, 178, 197, 0.45)',
    pointerEvents: 'none', zIndex: 3,
  },
  safeLabel: {
    position: 'absolute', top: 3, left: 8, fontFamily: MONO, fontSize: 9,
    lineHeight: 1, letterSpacing: '0.14em',
    color: 'rgba(148, 163, 184, 0.7)', whiteSpace: 'nowrap',
  },
  // Sits in the band between the title-safe and action-safe bottom edges,
  // fully below the title-safe rect so no dashed stroke crosses the text.
  safeLabelBottomRight: {top: 'auto', left: 'auto', bottom: 2, right: 8},
  safeLabelTitle: {color: 'rgba(94, 178, 197, 0.8)'},
  // Layer plotting: a 3x3 grid filling the title-safe area; each cell
  // stacks its layers in a column so two layers sharing an anchor never
  // overlap — they flow like a caption stack.
  anchorGridStage: {
    position: 'absolute', inset: '10%', display: 'grid', zIndex: 2,
    gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr',
  },
  anchorCell: {
    display: 'flex', flexDirection: 'column', gap: cq(18),
    minWidth: 0, minHeight: 0,
  },
  // Each rendered layer is a real button so the canvas is click-to-select;
  // all chrome is stripped and typography comes from the layer style.
  layerTextButton: {
    display: 'block', background: 'none', border: 'none', padding: 2,
    margin: 0, cursor: 'pointer', whiteSpace: 'pre-wrap', maxWidth: '100%',
  },
  layerTextSelected: {
    outline: '1px dashed rgba(94, 178, 197, 0.9)',
    outlineOffset: 4, borderRadius: 2,
  },
  // ---- Inspector ----
  inspectorScroll: {height: '100%', overflowY: 'auto', padding: 'var(--spacing-3)'},
  sectionLabelRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'},
  swatchRow: {display: 'flex', gap: 'var(--spacing-1)', flexWrap: 'wrap'},
  // The inset hairline keeps near-background swatches ('Ink' in dark,
  // 'Paper' in light) legible as tiles; the selected ring replaces it.
  swatch: {
    width: 28, height: 28, borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow:
      'inset 0 0 0 1px light-dark(rgba(16, 21, 29, 0.08), rgba(245, 241, 232, 0.28))',
    cursor: 'pointer', padding: 0,
  },
  swatchSelected: {
    boxShadow:
      'inset 0 0 0 2px var(--color-background-card), 0 0 0 2px var(--color-accent)',
  },
  swatchDisabled: {opacity: 0.4, cursor: 'not-allowed'},
  anchorGridControl: {
    display: 'grid', gap: 4,
    gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(3, 28px)',
  },
  anchorButton: {
    width: 28, height: 28, borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  },
  anchorButtonActive: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
  },
  anchorDot: {width: 6, height: 6, borderRadius: 999, backgroundColor: 'var(--color-border)'},
  anchorDotActive: {backgroundColor: 'var(--color-accent, light-dark(#0171E3, #4C9EFF))'},
  presetChipRow: {display: 'flex', gap: 'var(--spacing-1)', flexWrap: 'wrap'},
  // Timing bar: In / Hold / Out segments share one 6s scale; labels sit
  // under their segments so the readout never needs a legend lookup.
  timingBar: {
    display: 'flex', height: 8, borderRadius: 999, overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  timingIn: {backgroundColor: 'var(--color-accent, light-dark(#0171E3, #4C9EFF))'},
  timingHold: {backgroundColor: 'var(--color-background-muted)'},
  timingOut: {
    backgroundColor: 'var(--color-accent, light-dark(#0171E3, #4C9EFF))',
    opacity: 0.55,
  },
  timingLabels: {
    display: 'flex', fontFamily: MONO, fontSize: 10,
    fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)',
  },
  // ---- Lower-thirds gallery dock ----
  dock: {height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0},
  galleryRail: {
    flex: 1, minHeight: 0, display: 'flex', gap: 'var(--spacing-2)',
    overflowX: 'auto', overflowY: 'hidden', alignItems: 'stretch',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  galleryCard: {
    width: GALLERY_CARD_W, flexShrink: 0, display: 'flex',
    flexDirection: 'column', gap: 4, padding: 6,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer', textAlign: 'left', font: 'inherit', color: 'inherit',
  },
  galleryCardApplied: {boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  // Thumbnail: scheme-locked dark mini program frame (same policy as the
  // stage); the lower-third mock inside uses the template's literal accent.
  galleryThumb: {
    position: 'relative', aspectRatio: '16 / 9', borderRadius: 4,
    overflow: 'hidden', colorScheme: 'dark',
    background: 'linear-gradient(150deg, #2B3A52 0%, #16233A 60%, #0A1220 100%)',
  },
  galleryNameRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  // Mock lower-third primitives (positioned inside the thumbnail).
  ltZone: {position: 'absolute', left: '8%', right: '8%', bottom: '10%'},
  ltBarAccent: {width: 3, alignSelf: 'stretch', borderRadius: 1},
  ltNameLine: {height: 5, borderRadius: 2, backgroundColor: 'rgba(241, 245, 249, 0.92)'},
  ltRoleLine: {height: 3, borderRadius: 2, backgroundColor: 'rgba(148, 163, 184, 0.75)'},
};

// ============= STYLE MATH =============

/** Compose the live CSS for one rendered layer from its editable style.
 * Every length is a cqw fraction of the 1920px design width so the text
 * scales with the stage. */
function layerTextCss(style: LayerStyle): CSSProperties {
  const fill = swatchValue(style.fillId);
  const css: CSSProperties = {
    fontFamily: FONT_STACKS[style.fontId],
    fontSize: cq(style.sizePx),
    fontWeight: style.weight,
    letterSpacing: \`\${(style.tracking / 1000).toFixed(3)}em\`,
    lineHeight: style.leading / 100,
    color: fill,
  };
  if (style.strokeOn) {
    css.WebkitTextStroke = \`\${cq(style.strokeWidth)} \${swatchValue(style.strokeId)}\`;
  }
  if (style.shadowOn) {
    // 'CC' alpha keeps the drop readable without going fully opaque.
    css.textShadow = \`0 \${cq(style.shadowY)} \${cq(style.shadowBlur)} \${swatchValue(
      style.shadowId,
    )}CC\`;
  }
  return css;
}

const ANCHOR_JUSTIFY: Record<AnchorV, CSSProperties['justifyContent']> = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end',
};
const ANCHOR_ALIGN: Record<AnchorH, CSSProperties['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
};
const ANCHOR_TEXT_ALIGN: Record<AnchorH, CSSProperties['textAlign']> = {
  start: 'left',
  center: 'center',
  end: 'right',
};

const ANCHOR_H_ORDER: AnchorH[] = ['start', 'center', 'end'];
const ANCHOR_V_ORDER: AnchorV[] = ['top', 'middle', 'bottom'];

const ANCHOR_NAME: Record<AnchorV, Record<AnchorH, string>> = {
  top: {start: 'Top left', center: 'Top center', end: 'Top right'},
  middle: {start: 'Middle left', center: 'Middle center', end: 'Middle right'},
  bottom: {start: 'Bottom left', center: 'Bottom center', end: 'Bottom right'},
};

// ============= SMALL CONTROLS =============

/** Literal color swatch grid; the pressed swatch carries a token ring. */
function SwatchGrid({
  group,
  selectedId,
  isDisabled,
  onSelect,
}: {
  group: string;
  selectedId: SwatchId;
  isDisabled?: boolean;
  onSelect: (id: SwatchId) => void;
}) {
  return (
    <div style={styles.swatchRow} role="radiogroup" aria-label={\`\${group} color\`}>
      {SWATCHES.map(swatch => {
        const isActive = swatch.id === selectedId;
        return (
          <Tooltip key={swatch.id} content={\`\${swatch.label} \${swatch.value}\`}>
            <button
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={\`\${group}: \${swatch.label}\`}
              disabled={isDisabled}
              style={{
                ...styles.swatch, backgroundColor: swatch.value,
                ...(isActive ? styles.swatchSelected : undefined),
                ...(isDisabled ? styles.swatchDisabled : undefined),
              }}
              onClick={() => onSelect(swatch.id)}
            />
          </Tooltip>
        );
      })}
    </div>
  );
}

/** 3x3 anchor grid — the alignment control the canvas cells mirror. */
function AnchorGridControl({
  anchorH,
  anchorV,
  isDisabled,
  onChange,
}: {
  anchorH: AnchorH;
  anchorV: AnchorV;
  isDisabled?: boolean;
  onChange: (h: AnchorH, v: AnchorV) => void;
}) {
  return (
    <div style={styles.anchorGridControl} role="radiogroup" aria-label="Layer anchor">
      {ANCHOR_V_ORDER.map(v =>
        ANCHOR_H_ORDER.map(h => {
          const isActive = h === anchorH && v === anchorV;
          return (
            <button
              key={\`\${v}-\${h}\`}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={\`Anchor \${ANCHOR_NAME[v][h]}\`}
              disabled={isDisabled}
              style={{
                ...styles.anchorButton,
                ...(isActive ? styles.anchorButtonActive : undefined),
                ...(isDisabled ? styles.swatchDisabled : undefined),
              }}
              onClick={() => onChange(h, v)}>
              <span
                style={{...styles.anchorDot, ...(isActive ? styles.anchorDotActive : undefined)}}
              />
            </button>
          );
        }),
      )}
    </div>
  );
}

/** In / Hold / Out segments on one fixed 6s scale with a labeled readout —
 * never an unlabeled bar. */
function TimingBar({inSec, outSec}: {inSec: number; outSec: number}) {
  const holdSec = Math.max(0, COMP_DURATION_SEC - inSec - outSec);
  const pct = (sec: number) => \`\${((sec / COMP_DURATION_SEC) * 100).toFixed(2)}%\`;
  return (
    <VStack gap={1}>
      <div
        style={styles.timingBar}
        role="img"
        aria-label={\`Timing: in \${inSec.toFixed(1)}s, hold \${holdSec.toFixed(1)}s, out \${outSec.toFixed(1)}s of \${COMP_DURATION_SEC}s\`}>
        <div style={{...styles.timingIn, width: pct(inSec)}} />
        <div style={{...styles.timingHold, width: pct(holdSec)}} />
        <div style={{...styles.timingOut, width: pct(outSec)}} />
      </div>
      <div style={{...styles.timingLabels, justifyContent: 'space-between'}}>
        <span>In {inSec.toFixed(1)}s</span>
        <span>Hold {holdSec.toFixed(1)}s</span>
        <span>Out {outSec.toFixed(1)}s</span>
      </div>
    </VStack>
  );
}

// ============= LAYERS PANEL =============

function LayerRow({
  layer,
  text,
  isSelected,
  isHidden,
  isLocked,
  onSelect,
  onHiddenChange,
  onLockedChange,
}: {
  layer: TitleLayer;
  text: string;
  isSelected: boolean;
  isHidden: boolean;
  isLocked: boolean;
  onSelect: (id: string) => void;
  onHiddenChange: (isPressed: boolean) => void;
  onLockedChange: (isPressed: boolean) => void;
}) {
  const KindIcon = LAYER_KIND_ICON[layer.kind];
  return (
    <div
      style={{
        ...styles.layerRow,
        ...(isSelected ? styles.layerRowSelected : undefined),
        ...(isHidden ? styles.layerRowHidden : undefined),
      }}>
      <button
        type="button"
        style={styles.layerSelect}
        aria-pressed={isSelected}
        aria-label={\`Select layer \${layer.name}\`}
        onClick={() => onSelect(layer.id)}>
        <Icon icon={KindIcon} size="sm" color="secondary" />
        <span style={styles.layerRowText}>
          <VStack gap={0}>
            <Text type="body" weight={isSelected ? 'semibold' : 'normal'} maxLines={1}>
              {layer.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>{text}</Text>
          </VStack>
        </span>
      </button>
      <ToggleButton
        label={\`Hide \${layer.name}\`}
        size="sm"
        isIconOnly
        isPressed={isHidden}
        onPressedChange={onHiddenChange}
        icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
        pressedIcon={<Icon icon={EyeOffIcon} size="sm" color="inherit" />}
      />
      <ToggleButton
        label={\`Lock \${layer.name}\`}
        size="sm"
        isIconOnly
        isPressed={isLocked}
        onPressedChange={onLockedChange}
        icon={<Icon icon={LockOpenIcon} size="sm" color="inherit" />}
        pressedIcon={<Icon icon={LockIcon} size="sm" color="inherit" />}
      />
    </div>
  );
}

// ============= LOWER-THIRDS GALLERY =============

// Shared shorthands for the mock rows.
const ltCol: CSSProperties = {display: 'flex', flexDirection: 'column', gap: 3};
const ltPlate: CSSProperties = {backgroundColor: 'rgba(10, 18, 32, 0.85)'};

/** CSS mock of one lower-third design inside a locked-dark thumbnail. */
function LowerThirdMock({template}: {template: LowerThirdTemplate}) {
  const {accent, variant} = template;
  if (variant === 'bar') {
    return (
      <div style={{...styles.ltZone, display: 'flex', gap: 5}}>
        <span style={{...styles.ltBarAccent, backgroundColor: accent}} />
        <span style={{...ltCol, flex: 1}}>
          <span style={{...styles.ltNameLine, width: '62%'}} />
          <span style={{...styles.ltRoleLine, width: '40%'}} />
        </span>
      </div>
    );
  }
  if (variant === 'line') {
    return (
      <div style={{...styles.ltZone, ...ltCol}}>
        <span style={{...styles.ltNameLine, width: '52%'}} />
        <span style={{height: 2, width: '70%', borderRadius: 1, backgroundColor: accent}} />
      </div>
    );
  }
  if (variant === 'box') {
    return (
      <div
        style={{
          ...styles.ltZone, ...ltCol, ...ltPlate, width: '58%', right: 'auto',
          padding: 5, borderRadius: 2, border: \`1px solid \${accent}\`,
        }}>
        <span style={{...styles.ltNameLine, width: '80%'}} />
        <span style={{...styles.ltRoleLine, width: '55%'}} />
      </div>
    );
  }
  if (variant === 'chip') {
    return (
      <div style={{...styles.ltZone, display: 'flex'}}>
        <span
          style={{
            ...ltPlate, display: 'inline-flex', alignItems: 'center',
            gap: 4, padding: '3px 6px', borderRadius: 999,
          }}>
          <span style={{width: 5, height: 5, borderRadius: 999, backgroundColor: accent}} />
          <span style={{...styles.ltRoleLine, width: 34}} />
        </span>
      </div>
    );
  }
  if (variant === 'split') {
    return (
      <div style={{...styles.ltZone, display: 'flex', alignItems: 'center', gap: 5}}>
        <span style={{...styles.ltNameLine, width: '38%'}} />
        <span style={{flex: 1, height: 1, backgroundColor: accent}} />
        <span style={{...styles.ltRoleLine, width: '24%'}} />
      </div>
    );
  }
  // 'minimal'
  return (
    <div style={{...styles.ltZone, ...ltCol}}>
      <span style={{...styles.ltRoleLine, width: '46%'}} />
    </div>
  );
}

function GalleryCard({
  template,
  isApplied,
  onApply,
}: {
  template: LowerThirdTemplate;
  isApplied: boolean;
  onApply: (id: string) => void;
}) {
  return (
    <button
      type="button"
      style={{
        ...styles.galleryCard,
        ...(isApplied ? styles.galleryCardApplied : undefined),
      }}
      aria-pressed={isApplied}
      aria-label={\`Apply lower third \${template.name}\`}
      onClick={() => onApply(template.id)}>
      <div style={styles.galleryThumb} aria-hidden>
        <LowerThirdMock template={template} />
      </div>
      <div style={styles.galleryNameRow}>
        <StackItem size="fill">
          <Text type="supporting" weight="semibold" maxLines={1}>{template.name}</Text>
        </StackItem>
        {isApplied ? <Badge label="Applied" variant="info" /> : null}
      </div>
      <Text type="supporting" color="secondary" maxLines={1}>{template.caption}</Text>
    </button>
  );
}

// ============= INSPECTOR =============

function Inspector({
  layer,
  text,
  style,
  isLocked,
  onText,
  onPatch,
  onReset,
}: {
  layer: TitleLayer | null;
  text: string;
  style: LayerStyle | null;
  isLocked: boolean;
  onText: (value: string) => void;
  onPatch: (patch: Partial<LayerStyle>) => void;
  onReset: () => void;
}) {
  if (layer == null || style == null) {
    return (
      <div style={styles.inspectorScroll}>
        <VStack gap={1} hAlign="center" style={{paddingTop: 'var(--spacing-8)'}}>
          <Text type="body" weight="semibold">No layer selected</Text>
          <Text type="supporting" color="secondary">
            Pick a text layer on the canvas or in the layers list.
          </Text>
        </VStack>
      </div>
    );
  }
  const disabled = isLocked;
  return (
    <div style={styles.inspectorScroll}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body" weight="semibold" maxLines={1}>{layer.name}</Text>
              <Text type="supporting" color="secondary">
                {layer.kind} layer{isLocked ? ' · locked' : ''}
              </Text>
            </VStack>
          </StackItem>
          <Tooltip content="Reset to template defaults">
            <IconButton
              label={\`Reset \${layer.name} style\`}
              icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
              variant="ghost" size="sm" isDisabled={disabled}
              onClick={onReset}
            />
          </Tooltip>
        </HStack>

        <TextInput
          label="Text"
          value={text}
          size="sm"
          isDisabled={disabled}
          onChange={onText}
        />

        <Divider />

        <VStack gap={2}>
          <Text type="label" color="secondary">Typography</Text>
          <Selector
            label="Font family"
            size="sm"
            options={FONT_OPTIONS}
            value={style.fontId}
            isDisabled={disabled}
            onChange={value => onPatch({fontId: value as FontId})}
          />
          <Slider
            label="Size"
            value={style.sizePx}
            min={12} max={220} step={2}
            isDisabled={disabled}
            valueDisplay="text"
            formatValue={v => \`\${v} px\`}
            onChange={(v: number) => onPatch({sizePx: v})}
          />
          <SegmentedControl
            value={String(style.weight)}
            onChange={v => onPatch({weight: Number(v) as LayerStyle['weight']})}
            label="Weight"
            size="sm"
            layout="fill"
            isDisabled={disabled}>
            <SegmentedControlItem value="400" label="400" />
            <SegmentedControlItem value="500" label="500" />
            <SegmentedControlItem value="600" label="600" />
            <SegmentedControlItem value="700" label="700" />
          </SegmentedControl>
          <Slider
            label="Tracking"
            value={style.tracking}
            min={-20} max={60} step={2}
            isDisabled={disabled}
            valueDisplay="text"
            formatValue={v => \`\${v >= 0 ? '+' : ''}\${v}\`}
            onChange={(v: number) => onPatch({tracking: v})}
          />
          <Slider
            label="Leading"
            value={style.leading}
            min={90} max={200} step={2}
            isDisabled={disabled}
            valueDisplay="text"
            formatValue={v => \`\${v}%\`}
            onChange={(v: number) => onPatch({leading: v})}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">Fill</Text>
            </StackItem>
            <Text type="supporting" color="secondary" style={styles.mono}>
              {swatchLabel(style.fillId)} {swatchValue(style.fillId)}
            </Text>
          </HStack>
          <SwatchGrid
            group="Fill"
            selectedId={style.fillId}
            isDisabled={disabled}
            onSelect={id => onPatch({fillId: id})}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">Stroke</Text>
            </StackItem>
            <Switch
              label="Stroke enabled"
              isLabelHidden
              value={style.strokeOn}
              isDisabled={disabled}
              onChange={value => onPatch({strokeOn: value})}
            />
          </HStack>
          <NumberInput
            label="Stroke width"
            value={style.strokeWidth}
            min={0.5} max={12} step={0.5} units="px" size="sm"
            isDisabled={disabled || !style.strokeOn}
            onChange={v => onPatch({strokeWidth: v})}
          />
          <SwatchGrid
            group="Stroke"
            selectedId={style.strokeId}
            isDisabled={disabled || !style.strokeOn}
            onSelect={id => onPatch({strokeId: id})}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">Shadow</Text>
            </StackItem>
            <Switch
              label="Shadow enabled"
              isLabelHidden
              value={style.shadowOn}
              isDisabled={disabled}
              onChange={value => onPatch({shadowOn: value})}
            />
          </HStack>
          <HStack gap={2}>
            <NumberInput
              label="Blur"
              value={style.shadowBlur}
              min={0} max={64} step={2} units="px" size="sm"
              isDisabled={disabled || !style.shadowOn}
              onChange={v => onPatch({shadowBlur: v})}
            />
            <NumberInput
              label="Offset Y"
              value={style.shadowY}
              min={-24} max={24} step={1} units="px" size="sm"
              isDisabled={disabled || !style.shadowOn}
              onChange={v => onPatch({shadowY: v})}
            />
          </HStack>
          <SwatchGrid
            group="Shadow"
            selectedId={style.shadowId}
            isDisabled={disabled || !style.shadowOn}
            onSelect={id => onPatch({shadowId: id})}
          />
        </VStack>

        <Divider />

        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="label" color="secondary">Alignment</Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              {ANCHOR_NAME[style.anchorV][style.anchorH]}
            </Text>
          </HStack>
          <AnchorGridControl
            anchorH={style.anchorH}
            anchorV={style.anchorV}
            isDisabled={disabled}
            onChange={(h, v) => onPatch({anchorH: h, anchorV: v})}
          />
          <Text type="supporting" color="secondary">
            Anchors snap to the title-safe area; stacked layers share a cell.
          </Text>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <div style={styles.sectionLabelRow}>
            <Icon icon={SparklesIcon} size="sm" color="secondary" />
            <Text type="label" color="secondary">Animation</Text>
          </div>
          <div style={styles.presetChipRow} role="radiogroup" aria-label="Animation preset">
            {ANIM_PRESETS.map(preset => (
              <ToggleButton
                key={preset.id}
                label={preset.label}
                size="sm"
                isPressed={style.preset === preset.id}
                isDisabled={disabled}
                tooltip={preset.blurb}
                onPressedChange={() => onPatch({preset: preset.id})}
              />
            ))}
          </div>
          <HStack gap={2}>
            <NumberInput
              label="In"
              value={style.inSec}
              min={0} max={3} step={0.1} units="s" size="sm"
              isDisabled={disabled || style.preset === 'none'}
              onChange={v => onPatch({inSec: Math.round(v * 10) / 10})}
            />
            <NumberInput
              label="Out"
              value={style.outSec}
              min={0} max={3} step={0.1} units="s" size="sm"
              isDisabled={disabled || style.preset === 'none'}
              onChange={v => onPatch({outSec: Math.round(v * 10) / 10})}
            />
          </HStack>
          {style.preset === 'none' ? (
            <Text type="supporting" color="secondary">
              No animation — the layer cuts with the {COMP_DURATION_SEC}s clip.
            </Text>
          ) : (
            <TimingBar inSec={style.inSec} outSec={style.outSec} />
          )}
        </VStack>
      </VStack>
    </div>
  );
}

// ============= PAGE =============

const BACKDROP_STYLE: Record<Backdrop, CSSProperties> = {
  frame: styles.stageFrame,
  checker: styles.stageChecker,
  black: styles.stageBlack,
};

const LAYER_SELECT_OPTIONS = LAYERS.map(layer => ({
  value: layer.id,
  label: layer.name,
}));

export default function VideoEditorTitlesDesignerTemplate() {
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    INITIAL_SELECTED_LAYER,
  );
  const [layerStyles, setLayerStyles] =
    useState<Record<string, LayerStyle>>(DEFAULT_STYLES);
  const [layerTexts, setLayerTexts] =
    useState<Record<string, string>>(DEFAULT_TEXTS);
  const [hiddenLayers, setHiddenLayers] = useState<Record<string, boolean>>({});
  const [lockedLayers, setLockedLayers] = useState<Record<string, boolean>>({});
  const [showTitleSafe, setShowTitleSafe] = useState(true);
  const [showActionSafe, setShowActionSafe] = useState(true);
  const [backdrop, setBackdrop] = useState<Backdrop>('frame');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [appliedTemplateId, setAppliedTemplateId] = useState(
    INITIAL_APPLIED_TEMPLATE,
  );

  // <=1100px the layers panel drops (a Selector replaces it in the canvas
  // toolbar); <=768px the inspector drops too and header metadata hides.
  const isNarrow = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 768px)');

  const selectedLayer = LAYERS.find(l => l.id === selectedLayerId) ?? null;
  const selectedStyle =
    selectedLayer != null ? layerStyles[selectedLayer.id] : null;
  const isSelectedLocked =
    selectedLayer != null && (lockedLayers[selectedLayer.id] ?? false);

  const patchSelectedStyle = (patch: Partial<LayerStyle>) => {
    if (selectedLayer == null) {
      return;
    }
    const id = selectedLayer.id;
    setLayerStyles(prev => ({...prev, [id]: {...prev[id], ...patch}}));
  };
  const setSelectedText = (value: string) => {
    if (selectedLayer == null) {
      return;
    }
    const id = selectedLayer.id;
    setLayerTexts(prev => ({...prev, [id]: value}));
  };
  const resetSelected = () => {
    if (selectedLayer == null) {
      return;
    }
    const id = selectedLayer.id;
    setLayerStyles(prev => ({...prev, [id]: DEFAULT_STYLES[id]}));
    setLayerTexts(prev => ({...prev, [id]: DEFAULT_TEXTS[id]}));
  };

  // Visible layers grouped into their 3x3 anchor cell, fixture order kept,
  // so two layers sharing an anchor stack instead of overlapping.
  const cellLayers = new Map<string, TitleLayer[]>();
  for (const layer of LAYERS) {
    if (hiddenLayers[layer.id] ?? false) {
      continue;
    }
    const s = layerStyles[layer.id];
    const key = \`\${s.anchorV}-\${s.anchorH}\`;
    const bucket = cellLayers.get(key);
    if (bucket == null) {
      cellLayers.set(key, [layer]);
    } else {
      bucket.push(layer);
    }
  }

  const visibleCount = LAYERS.filter(l => !(hiddenLayers[l.id] ?? false)).length;
  const appliedTemplate =
    LOWER_THIRDS.find(t => t.id === appliedTemplateId) ?? LOWER_THIRDS[0];

  // ----- Header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center" style={styles.headerRow}>
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={ClapperboardIcon} size="md" color="secondary" />
            <Heading level={1}>{PROJECT_NAME}</Heading>
            <Badge label="Autosaved" variant="success" />
            {!isCompact && (
              <Text type="supporting" color="secondary">
                Titles &amp; Graphics · {COMP_NAME} · 1920×1080 · 24 fps
              </Text>
            )}
          </HStack>
        </StackItem>
        <IconButton
          label="Export still frame"
          tooltip="Export still (PNG)"
          icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          variant="ghost" size="sm"
          onClick={() => {}}
        />
        <IconButton
          label={isInspectorOpen ? 'Hide inspector' : 'Show inspector'}
          tooltip={isInspectorOpen ? 'Hide inspector' : 'Show inspector'}
          icon={
            <Icon
              icon={isInspectorOpen ? PanelRightCloseIcon : PanelRightOpenIcon}
              size="sm" color="inherit"
            />
          }
          variant="ghost" size="sm" isDisabled={isCompact}
          onClick={() => setIsInspectorOpen(prev => !prev)}
        />
        <Button label="Save style" variant="secondary" size="sm" onClick={() => {}} />
        <Button label="Add to timeline" variant="primary" size="sm" onClick={() => {}} />
      </HStack>
    </LayoutHeader>
  );

  // ----- Layers panel (248px, drops <=1100px) -----
  const layersPanel = isNarrow ? undefined : (
    <LayoutPanel width={LAYERS_PANEL_W} padding={0} hasDivider label="Text layers">
      <div style={styles.panelScroll}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <Icon icon={LayersIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="body" weight="semibold">Text layers</Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {visibleCount}/{LAYERS.length}
            </Text>
            <IconButton
              label="Add text layer"
              tooltip="Add text layer"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              variant="ghost" size="sm"
              onClick={() => {}}
            />
          </HStack>
          <VStack gap={1}>
            {LAYERS.map(layer => (
              <LayerRow
                key={layer.id}
                layer={layer}
                text={layerTexts[layer.id]}
                isSelected={layer.id === selectedLayerId}
                isHidden={hiddenLayers[layer.id] ?? false}
                isLocked={lockedLayers[layer.id] ?? false}
                onSelect={setSelectedLayerId}
                onHiddenChange={isPressed =>
                  setHiddenLayers(prev => ({...prev, [layer.id]: isPressed}))
                }
                onLockedChange={isPressed =>
                  setLockedLayers(prev => ({...prev, [layer.id]: isPressed}))
                }
              />
            ))}
          </VStack>
          <Divider />
          <Text type="supporting" color="secondary">
            Renders on V2 · {COMP_DURATION_SEC.toFixed(0)}s at {FRAME_TC}
          </Text>
        </VStack>
      </div>
    </LayoutPanel>
  );

  // ----- Canvas -----
  const canvas = (
    <LayoutContent padding={0}>
      <div style={styles.canvasBackdrop}>
        <div style={styles.canvasColumn}>
          <Toolbar
            label="Canvas options"
            size="sm"
            gap={1}
            startContent={
              <>
                {isNarrow && (
                  <Selector
                    label="Layer"
                    isLabelHidden
                    size="sm"
                    width={168}
                    options={LAYER_SELECT_OPTIONS}
                    value={selectedLayerId}
                    onChange={value => setSelectedLayerId(String(value))}
                  />
                )}
                <ToggleButton
                  label="Title safe"
                  size="sm"
                  isPressed={showTitleSafe}
                  tooltip="Title-safe guide (80% box)"
                  onPressedChange={setShowTitleSafe}
                />
                <ToggleButton
                  label="Action safe"
                  size="sm"
                  isPressed={showActionSafe}
                  tooltip="Action-safe guide (90% box)"
                  onPressedChange={setShowActionSafe}
                />
              </>
            }
            endContent={
              <SegmentedControl
                value={backdrop}
                onChange={v => setBackdrop(v as Backdrop)}
                label="Canvas backdrop"
                size="sm">
                <SegmentedControlItem value="frame" label="Frame" />
                <SegmentedControlItem value="checker" label="Checker" />
                <SegmentedControlItem value="black" label="Black" />
              </SegmentedControl>
            }
          />
          <div style={{...styles.stage, ...BACKDROP_STYLE[backdrop]}}>
            <div style={styles.stageScrimTop}>
              <span style={styles.scrimPlate}>PGM {FRAME_TC}</span>
              <span style={styles.scrimPlate}>
                {backdrop === 'frame' ? 'V1 UNDER' : 'MATTE'} · 1920×1080
              </span>
            </div>
            {showActionSafe && (
              <div style={styles.actionSafe}>
                <span style={{...styles.safeLabel, ...styles.safeLabelBottomRight}}>
                  ACTION SAFE 90%
                </span>
              </div>
            )}
            {showTitleSafe && (
              <div style={styles.titleSafe}>
                <span style={{...styles.safeLabel, ...styles.safeLabelTitle}}>
                  TITLE SAFE 80%
                </span>
              </div>
            )}
            {/* Live text layers, plotted into the 3x3 anchor grid over the
                title-safe area; click-to-select mirrors the layers list. */}
            <div style={styles.anchorGridStage}>
              {ANCHOR_V_ORDER.map(v =>
                ANCHOR_H_ORDER.map(h => {
                  const bucket = cellLayers.get(\`\${v}-\${h}\`) ?? [];
                  return (
                    <div
                      key={\`\${v}-\${h}\`}
                      style={{
                        ...styles.anchorCell,
                        justifyContent: ANCHOR_JUSTIFY[v],
                        alignItems: ANCHOR_ALIGN[h],
                        textAlign: ANCHOR_TEXT_ALIGN[h],
                      }}>
                      {bucket.map(layer => {
                        const isSelected = layer.id === selectedLayerId;
                        const isLocked = lockedLayers[layer.id] ?? false;
                        return (
                          <button
                            key={layer.id}
                            type="button"
                            disabled={isLocked}
                            aria-pressed={isSelected}
                            aria-label={\`Select layer \${layer.name} on canvas\`}
                            style={{
                              ...styles.layerTextButton,
                              ...layerTextCss(layerStyles[layer.id]),
                              textAlign: ANCHOR_TEXT_ALIGN[h],
                              cursor: isLocked ? 'not-allowed' : 'pointer',
                              ...(isSelected
                                ? styles.layerTextSelected
                                : undefined),
                            }}
                            onClick={() => setSelectedLayerId(layer.id)}>
                            {layerTexts[layer.id]}
                          </button>
                        );
                      })}
                    </div>
                  );
                }),
              )}
            </div>
          </div>
          {selectedLayer != null && selectedStyle != null && (
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary" maxLines={1}>
                  Selected: {selectedLayer.name} ·{' '}
                  {FONT_OPTIONS.find(f => f.value === selectedStyle.fontId)?.label}{' '}
                  {selectedStyle.sizePx}px · {swatchLabel(selectedStyle.fillId)}
                </Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers style={styles.mono}>
                {FRAME_TC}
              </Text>
            </HStack>
          )}
        </div>
      </div>
    </LayoutContent>
  );

  // ----- Inspector (320px, collapsible; drops <=768px) -----
  const inspectorPanel =
    isInspectorOpen && !isCompact ? (
      <LayoutPanel width={INSPECTOR_W} padding={0} hasDivider label="Layer inspector">
        <Inspector
          layer={selectedLayer}
          text={selectedLayer != null ? layerTexts[selectedLayer.id] : ''}
          style={selectedStyle}
          isLocked={isSelectedLocked}
          onText={setSelectedText}
          onPatch={patchSelectedStyle}
          onReset={resetSelected}
        />
      </LayoutPanel>
    ) : undefined;

  // ----- Lower-thirds gallery dock (148px) -----
  const galleryDock = (
    <LayoutFooter hasDivider height={GALLERY_DOCK_H} padding={0} label="Lower thirds">
      <div style={styles.dock}>
        <Toolbar
          label="Lower-third templates"
          size="sm"
          gap={1}
          dividers={['bottom']}
          startContent={
            <>
              <Text type="body" weight="semibold">Lower thirds</Text>
              <Text type="supporting" color="secondary">
                {LOWER_THIRDS.length} templates · applied: {appliedTemplate.name}
              </Text>
            </>
          }
          endContent={
            <Button label="Browse library" variant="ghost" size="sm" onClick={() => {}} />
          }
        />
        <div style={styles.galleryRail}>
          {LOWER_THIRDS.map(template => (
            <GalleryCard
              key={template.id}
              template={template}
              isApplied={template.id === appliedTemplateId}
              onApply={setAppliedTemplateId}
            />
          ))}
        </div>
      </div>
    </LayoutFooter>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={layersPanel}
        content={canvas}
        end={inspectorPanel}
        footer={galleryDock}
      />
    </div>
  );
}
`;export{e as default};