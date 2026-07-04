var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Stackleaf grow-room console for
 *   Grow Room A at day-anchor Sat Jul 4, 2026: four instrumented racks of
 *   12 tiers (46 occupied, 2 sanitizing), four first-class light recipes
 *   with exact per-tier energy figures, per-tier PPFD/EC/pH actuals with
 *   recipe targets and tolerances, day-in-cycle numerics, and ticket-shaped
 *   operator notes. No Date.now(), no randomness, no network assets —
 *   every relative time is a pre-computed string.
 * @output Vertical Farm Rack Console — a grow-room operator's elevation
 *   view: 260px room/rack tree with occupancy and kWh subtotals, a rack
 *   canvas of 44px TierConditionRows (crop identity, day-in-cycle notch
 *   bar, three calibrated MicroGauges with signed target deltas, a 24h
 *   spectral LightRecipeBar, a HarvestReadinessGlyph phase dial), and a
 *   360px light-recipe aside. Recipes are staged onto shift-selected tier
 *   ranges, diffed against a live kWh/day forecast chip, and pushed to
 *   controllers — stage, diff, push.
 * @position Page template; emitted by \`astryx template vertical-farm-rack-console\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   48px header bar (StackleafMark + wordmark + room Selector | forecast
 *   chip + Push to controllers + avatar)
 *   | view root (flex row, height 100%, minHeight 0, overflow hidden):
 *     260px room/rack tree (own scroll, 36px rows, sticky 36px sync footer)
 *     | main column (36px toolbar/filter row > scrollable rack canvas:
 *       36px sticky RackSection headers + 12 x 44px TierConditionRows)
 *     | 360px light-recipe aside (own scroll, 36px recipe rows expanding
 *       to RecipeCard, sticky Apply footer).
 * Container policy: app-shell archetype — frame rows, rails, and panels
 *   only; no Cards. Tier rows, recipe rows, and tree rows are styled divs
 *   on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   (STACKLEAF_GREEN, the mark fill). Spectrum band colors and gauge
 *   status colors are declared once in the COLOR LITERALS block as
 *   light-dark() pairs; data-viz colors carry the repo-standard
 *   categorical-token fallbacks. Contrast math documented per literal.
 * Density grid (verbatim, no other row heights or panel widths exist):
 *   48px header bar; 36px light rows (tree rows, rack section headers,
 *   toolbar/filter row, recipe-list rows); 44px heavy rows
 *   (TierConditionRow); 260px room/rack tree column (collapses to 56px
 *   icon rail); 360px light-recipe aside (steps to 320px, then drops);
 *   one gutter token GUTTER = 12 for all column gaps and panel padding;
 *   8px intra-row cell gap.
 *
 * Responsive contract (all bands key off the MEASURED CONTAINER width of
 * the view root via useElementWidth — the demo stage is ~1045–1075px
 * inside a 1440px window, so viewport queries would lie; a viewport query
 * survives only as the pre-observer first-frame fallback):
 * - >= 1200px container: full layout — 260px tree + main + 360px aside.
 * - 1000–1199px (the demo-stage default): tree collapses to a 56px icon
 *   rail (room initial squares, unsynced dots preserved) so the 360px
 *   aside and the apply interaction stay fully present.
 * - 900–999px: aside steps 360 -> 320px.
 * - < 900px: aside removed; a "Recipes" button in the 36px toolbar opens
 *   the recipe list + Apply footer in a Dialog.
 * Independently, the MAIN COLUMN measures itself (subtraction, not
 * reflow — nothing squeezes):
 * - main < 920px: the 64px day-notch cell drops (day text folds into the
 *   name block's second line) and the three MicroGauges collapse to a
 *   single worst-delta gauge labeled by its metric. (The spec's fixed
 *   cell arithmetic — 28+24+148+64+3x88+40+56 cells + 8px gaps + 12px
 *   padding = 712px before the recipe bar's 180px minimum — makes 920 the
 *   honest full-row floor.)
 * - main < 680px: the 24px crop glyph also drops, preserving the recipe
 *   bar's 180px minimum at the demo default (~629px main).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
  TriangleAlertIcon,
  UploadIcon,
  WifiOffIcon,
  ZapIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark()
// pair (dark side shifted to the lighter 300–400-weight hue).
// ---------------------------------------------------------------------------

// THE quarantined brand literal — the spec's #5C9E31, used as a runtime
// value (StackleafMark front-leaf fill, recipe selection ring). Never used
// as text: #5C9E31 on white is only 3.1:1.
const STACKLEAF_GREEN = 'light-dark(#5C9E31, #7FBF55)';

// Spectrum band colors — fixed pairs, NOT brand color. Each holds >= 3:1
// against the bar's muted background in both schemes (solid saturated
// fills on near-white / near-black surfaces).
const SPECTRUM_DEEP_RED =
  'var(--color-data-categorical-red, light-dark(#DC2626, #F87171))'; // 660nm
const SPECTRUM_BLUE =
  'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))'; // 450nm
// Far-red 730nm reads as rose-magenta — kept distinct from the 660nm band.
// Dark half is #F472B6 (not the salmon #FB7185, which collided with #F87171
// at swatch size): vs #F87171 it holds ΔE 37.9 normal / 37.3 deutan /
// 12.1 tritan, and >= 3:1 on the dark surface. Fill/swatch only, never text.
const SPECTRUM_FAR_RED = 'light-dark(#9F1239, #F472B6)';

// Gauge status text at 10px must clear 4.5:1: #067647 on white = 5.5:1,
// #4ADE80 on #1E1E1E = 9.9:1; #9A3412 on white = 7.6:1, #FBBF24 on
// #1E1E1E = 10.7:1.
const GOOD_TEXT = 'light-dark(#067647, #4ADE80)';
const WARN_TEXT = 'light-dark(#9A3412, #FBBF24)';
// Warning FILLS (gauge fill, unsynced dot, STALE badge border) — hue only,
// never carries text.
const WARN_FILL = 'light-dark(#D97706, #FBBF24)';
const WARN_SOFT = 'light-dark(rgba(217, 119, 6, 0.10), rgba(251, 191, 36, 0.14))';
// Success arc on the harvest dial (stroke, not text).
const OK_FILL = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
// Selected-row wash — mirrors the accent token's default pair at 8%/16%.
const SELECT_WASH = 'light-dark(rgba(1, 113, 227, 0.08), rgba(76, 158, 255, 0.16))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// One gutter token — every column gap and panel padding on the page.
const GUTTER = 12;

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guard. Transitions animate
// transform/opacity/color only (gauge fills scale via transform, target
// ticks translate, the delta pill fades in) and collapse under
// prefers-reduced-motion — no animation is load-bearing.
// ---------------------------------------------------------------------------

const VFR_CSS = \`
.vfr-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.vfr-fill {
  transform-origin: left center;
  transition: transform 160ms ease-out, background-color 160ms ease-out;
}
.vfr-tick {
  transition: transform 160ms ease-out;
}
.vfr-pill {
  transition: opacity 160ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .vfr-fill { transition: none; }
  .vfr-tick { transition: none; }
  .vfr-pill { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// STYLES — density grid verbatim: 48px header, 36px light rows, 44px heavy
// rows, 260px tree, 360px aside, GUTTER = 12, 8px intra-row cell gap.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // 48px header bar — corner owners: top-left mark + wordmark + room
  // selector; top-right forecast chip + push + avatar.
  header: {
    height: 48,
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    paddingInline: GUTTER,
    overflow: 'hidden',
  },
  brandCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 'auto',
  },
  // View root — the measured element for all container bands.
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  // 260px room/rack tree column; collapses to a 56px icon rail.
  treeCol: {
    width: 260,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  treeRail: {
    width: 56,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    paddingBlock: GUTTER,
    borderRight: 'var(--border-width) solid var(--color-border)',
  },
  treeScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // 36px light rows throughout the tree.
  treeRoomRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingInline: GUTTER,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text)',
    textAlign: 'start',
  },
  treeRackRow: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingInlineStart: GUTTER * 2 + 8,
    paddingInlineEnd: GUTTER,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text)',
    textAlign: 'start',
  },
  treeRackActive: {backgroundColor: SELECT_WASH},
  // Sticky 36px tree footer — bottom-left corner owner (controller sync).
  treeFooter: {
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  railSquare: {
    width: 32,
    height: 32,
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'none',
    cursor: 'pointer',
    color: 'var(--color-text)',
    fontFamily: MONO,
    fontSize: 13,
  },
  railSquareActive: {backgroundColor: SELECT_WASH, borderColor: 'var(--color-accent)'},
  unsyncedDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: WARN_FILL,
    flexShrink: 0,
  },
  railDot: {position: 'absolute', top: 3, right: 3},
  // Main column.
  mainCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // 36px toolbar/filter row.
  toolbar: {
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  canvas: {flex: 1, minHeight: 0, overflowY: 'auto'},
  // 36px sticky rack section header.
  rackHeader: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    backgroundColor: 'var(--color-background)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  // 44px heavy tier row — 8px cell gap, 12px horizontal padding.
  tierRow: {
    height: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
  },
  tierRowSelected: {backgroundColor: SELECT_WASH},
  tierRowEmpty: {cursor: 'default'},
  emptyDash: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    height: 28,
    paddingInline: 8,
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  // Fixed cells of the tier row anatomy.
  well: {
    width: 28,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 0,
  },
  wellIndex: {
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: '10px',
    color: 'var(--color-text-secondary)',
  },
  cropGlyphCell: {
    width: 24,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  },
  nameBlock: {width: 148, flexShrink: 0, minWidth: 0},
  nameLine: {
    fontSize: 13,
    lineHeight: '16px',
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cultivarLine: {
    fontSize: 11,
    lineHeight: '13px',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  notchCell: {width: 64, flexShrink: 0},
  notchTrack: {
    position: 'relative',
    height: 6,
    borderRadius: 3,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  notchFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    backgroundColor: 'var(--color-text-secondary)',
    borderRadius: 3,
  },
  notchMark: {
    position: 'absolute',
    insetBlock: 0,
    width: 2,
    backgroundColor: 'var(--color-background)',
  },
  notchLabel: {
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: '12px',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  gaugeCell: {width: 88, flexShrink: 0},
  gaugeTrack: {
    position: 'relative',
    width: 56,
    height: 6,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
  },
  gaugeFill: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    width: '100%',
    borderRadius: 4,
  },
  gaugeTick: {
    position: 'absolute',
    top: -2,
    left: 0,
    width: 2,
    height: 10,
    backgroundColor: 'var(--color-text)',
  },
  gaugeLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 3,
    fontFamily: MONO,
    fontSize: 10,
    lineHeight: '12px',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  barCell: {flex: 1, minWidth: 180, height: 24, display: 'flex', alignItems: 'center'},
  dialCell: {
    width: 40,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCell: {
    width: 56,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  staleBadge: {
    fontFamily: MONO,
    fontSize: 9,
    lineHeight: '12px',
    letterSpacing: 0.5,
    paddingInline: 3,
    borderRadius: 3,
    border: \`1px solid \${WARN_FILL}\`,
    color: WARN_TEXT,
    backgroundColor: WARN_SOFT,
  },
  // 360px light-recipe aside (steps to 320px, then drops).
  aside: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  asideScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  asideHeader: {
    height: 36,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  // Sticky aside footer — bottom-right corner owner (Apply button).
  asideFooter: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
  },
  // 36px collapsed recipe row.
  recipeRow: {
    minHeight: 36,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'start',
    padding: 0,
    color: 'var(--color-text)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  recipeRowLine: {
    height: 36,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: GUTTER,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  recipeSelected: {
    boxShadow: \`inset 2px 0 0 0 \${STACKLEAF_GREEN}\`,
    backgroundColor: SELECT_WASH,
  },
  recipeCardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: \`0 \${GUTTER}px \${GUTTER}px\`,
  },
  legendRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: '14px',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  legendSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  // Header forecast chip.
  kwhChip: {
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 8,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text)',
  },
  kwhPill: {
    height: 20,
    display: 'inline-flex',
    alignItems: 'center',
    paddingInline: 6,
    borderRadius: 999,
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: WARN_SOFT,
    color: WARN_TEXT,
  },
  // Visually-hidden polite live region (selection counts, apply, push).
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  dialogBody: {padding: GUTTER, display: 'flex', flexDirection: 'column', gap: 8},
};

// ---------------------------------------------------------------------------
// DATA — Stackleaf, Grow Room A, day-anchor Sat Jul 4, 2026. Identity
// consts everywhere; dual fields (numeric + display); aggregates
// cross-check by construction (rack kWh subtotals 104.2 + 98.6 + 112.4 +
// 97.4 = 412.6 = the header chip, each subtotal the exact sum of its
// occupied tiers' recipes' kwhPerTierDay). Deterministic BY LAW.
// ---------------------------------------------------------------------------

const ROOM_A = 'room-grow-a';
const ROOM_B = 'room-grow-b';
const RACK_A1 = 'rack-a1';
const RACK_A2 = 'rack-a2';
const RACK_A3 = 'rack-a3';
const RACK_A4 = 'rack-a4';
const RACK_B1 = 'rack-b1';
const RACK_B2 = 'rack-b2';

const RECIPE_BASIL_SPRINT_V3 = 'rcp-basil-sprint-v3';
const RECIPE_LEAFY_STD_V7 = 'rcp-leafy-std-v7';
const RECIPE_FINISHER_FARRED = 'rcp-finisher-farred';
const RECIPE_SEEDLING_GENTLE = 'rcp-seedling-gentle';

type RoomId = typeof ROOM_A | typeof ROOM_B;
type RackId = string;
type TierId = string;
type RecipeId = string;

interface PhotoSegment {
  onHour: number;
  offHour: number;
  rampMinutes: number;
  /** Far-red-only end-of-day pulse — renders as a single far-red band. */
  farRedOnly?: boolean;
}

interface Spectrum {
  deepRed: number; // 660nm, bottom band
  blue: number; // 450nm, middle band
  farRed: number; // 730nm, top sliver
}

interface Recipe {
  id: RecipeId;
  name: string;
  segments: PhotoSegment[];
  photoperiodDisplay: string; // '18h', '14h + 1h FR'
  spectrum: Spectrum; // sums to 100
  ppfdTarget: number;
  ppfdTargetDisplay: string;
  ppfdTolerance: number;
  ecTarget: number;
  ecTolerance: number;
  phTarget: number;
  phTolerance: number;
  kwhPerTierDay: number;
  kwhDisplay: string;
}

const RECIPES: Record<RecipeId, Recipe> = {
  [RECIPE_SEEDLING_GENTLE]: {
    id: RECIPE_SEEDLING_GENTLE,
    name: 'Seedling Gentle',
    segments: [{onHour: 5, offHour: 21, rampMinutes: 30}],
    photoperiodDisplay: '16h',
    spectrum: {deepRed: 35, blue: 55, farRed: 10},
    ppfdTarget: 160,
    ppfdTargetDisplay: '160 µmol',
    ppfdTolerance: 25,
    ecTarget: 1.0,
    ecTolerance: 0.15,
    phTarget: 5.8,
    phTolerance: 0.25,
    kwhPerTierDay: 4.3,
    kwhDisplay: '4.3 kWh/tier·day',
  },
  [RECIPE_LEAFY_STD_V7]: {
    id: RECIPE_LEAFY_STD_V7,
    name: 'Leafy Standard v7',
    segments: [{onHour: 5, offHour: 21, rampMinutes: 30}],
    photoperiodDisplay: '16h',
    spectrum: {deepRed: 55, blue: 35, farRed: 10},
    ppfdTarget: 380,
    ppfdTargetDisplay: '380 µmol',
    ppfdTolerance: 35,
    ecTarget: 1.6,
    ecTolerance: 0.15,
    phTarget: 5.8,
    phTolerance: 0.25,
    kwhPerTierDay: 5.9,
    kwhDisplay: '5.9 kWh/tier·day',
  },
  [RECIPE_BASIL_SPRINT_V3]: {
    id: RECIPE_BASIL_SPRINT_V3,
    name: 'Basil Sprint v3',
    segments: [{onHour: 4, offHour: 22, rampMinutes: 30}],
    photoperiodDisplay: '18h',
    spectrum: {deepRed: 65, blue: 25, farRed: 10},
    ppfdTarget: 450,
    ppfdTargetDisplay: '450 µmol',
    ppfdTolerance: 35,
    ecTarget: 1.8,
    ecTolerance: 0.2,
    phTarget: 5.9,
    phTolerance: 0.25,
    kwhPerTierDay: 6.5,
    kwhDisplay: '6.5 kWh/tier·day',
  },
  // Highest-energy recipe on purpose: finishing is the high-DLI phase —
  // PPFD 620 over a 14h main photoperiod, plus a SECOND far-red-only
  // 22:00–23:00 pulse (the multi-segment stress fixture for
  // LightRecipeBar).
  [RECIPE_FINISHER_FARRED]: {
    id: RECIPE_FINISHER_FARRED,
    name: 'Finisher Far-Red',
    segments: [
      {onHour: 6, offHour: 20, rampMinutes: 30},
      {onHour: 22, offHour: 23, rampMinutes: 0, farRedOnly: true},
    ],
    photoperiodDisplay: '14h + 1h FR',
    spectrum: {deepRed: 60, blue: 15, farRed: 25},
    ppfdTarget: 620,
    ppfdTargetDisplay: '620 µmol',
    ppfdTolerance: 40,
    ecTarget: 2.0,
    ecTolerance: 0.2,
    phTarget: 5.8,
    phTolerance: 0.25,
    kwhPerTierDay: 11.1,
    kwhDisplay: '11.1 kWh/tier·day',
  },
};

const RECIPE_ORDER: RecipeId[] = [
  RECIPE_BASIL_SPRINT_V3,
  RECIPE_LEAFY_STD_V7,
  RECIPE_FINISHER_FARRED,
  RECIPE_SEEDLING_GENTLE,
];

type CropFamily = 'basil' | 'lettuce' | 'arugula' | 'micro';

interface Phase {
  name: string;
  startDay: number;
}

interface Tier {
  id: TierId;
  rackId: RackId;
  index: number; // 1–12, bottom to top of the rack elevation
  crop?: {name: string; cultivar?: string; family: CropFamily};
  dayInCycle?: number;
  cycleLength?: number;
  transplantDay?: number;
  windowStart?: number;
  windowEnd?: number;
  phases?: Phase[];
  ppfdActual?: number;
  ppfdDisplay?: string;
  ec?: number;
  ecDisplay?: string;
  ph?: number;
  phDisplay?: string;
  recipeId?: RecipeId;
  note?: string;
  /** crop === undefined tiers render the dashed sanitizing placeholder. */
  emptyNote?: string;
}

interface Rack {
  id: RackId;
  roomId: RoomId;
  name: string;
  blurb: string;
  offline?: boolean;
  offlineReason?: string;
}

const RACKS: Rack[] = [
  {id: RACK_A1, roomId: ROOM_A, name: 'Rack A1', blurb: 'Finishing for Friday harvest'},
  {id: RACK_A2, roomId: ROOM_A, name: 'Rack A2', blurb: 'Mixed basil + leafy'},
  {id: RACK_A3, roomId: ROOM_A, name: 'Rack A3', blurb: 'Heads-up finishing'},
  {
    id: RACK_A4,
    roomId: ROOM_A,
    name: 'Rack A4',
    blurb: 'Controller offline',
    offline: true,
    offlineReason:
      'Controller CTL-A4 last heartbeat Jul 4 06:12 — PoE switch port 7 flapping; facilities ticket FAC-2211 open. Readings shown are last-known.',
  },
];

// Room B exists in the tree but is not the active room (proves the room
// selector). Static tree-only figures — its tiers are not loaded here.
const ROOM_B_RACKS = [
  {id: RACK_B1, name: 'Rack B1', occupancy: '12/12', kwh: '71.2'},
  {id: RACK_B2, name: 'Rack B2', occupancy: '9/12', kwh: '56.8'},
];

const tierId = (rackId: RackId, index: number): TierId =>
  \`\${rackId}-t\${String(index).padStart(2, '0')}\`;

// Standard phase ladders per cycle shape (transplant day = notch).
const phasesFor = (transplantDay: number, vegStart: number, windowStart: number): Phase[] => [
  {name: 'germination', startDay: 0},
  {name: 'transplant', startDay: transplantDay},
  {name: 'veg', startDay: vegStart},
  {name: 'harvest window', startDay: windowStart},
];

/** One-line tier constructor — display strings derived from the numerics. */
function tier(
  rackId: RackId,
  index: number,
  family: CropFamily,
  name: string,
  cultivar: string | undefined,
  recipeId: RecipeId,
  dayInCycle: number,
  cycleLength: number,
  transplantDay: number,
  windowStart: number,
  windowEnd: number,
  ppfdActual: number,
  ec: number,
  ph: number,
  note?: string,
): Tier {
  return {
    id: tierId(rackId, index),
    rackId,
    index,
    crop: {name, cultivar, family},
    dayInCycle,
    cycleLength,
    transplantDay,
    windowStart,
    windowEnd,
    phases: phasesFor(transplantDay, transplantDay + 5, windowStart),
    ppfdActual,
    ppfdDisplay: \`\${ppfdActual} µmol\`,
    ec,
    ecDisplay: \`\${ec.toFixed(2)} mS\`,
    ph,
    phDisplay: \`pH \${ph.toFixed(2)}\`,
    recipeId,
    note,
  };
}

function emptyTier(rackId: RackId, index: number, emptyNote: string): Tier {
  return {id: tierId(rackId, index), rackId, index, emptyNote};
}

// Rack A1 — 10 occupied (9 × Finisher Far-Red + 1 × Seedling Gentle),
// t11/t12 sanitizing. Subtotal 9 × 11.1 + 4.3 = 104.2.
const F = RECIPE_FINISHER_FARRED;
const L = RECIPE_LEAFY_STD_V7;
const B = RECIPE_BASIL_SPRINT_V3;
const S = RECIPE_SEEDLING_GENTLE;

const TIER_LIST: Tier[] = [
  tier(RACK_A1, 1, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 611, 1.97, 5.83),
  tier(RACK_A1, 2, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 624, 2.04, 5.79),
  tier(RACK_A1, 3, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 617, 1.94, 5.86),
  tier(RACK_A1, 4, 'lettuce', 'Red Oak Leaf', undefined, F, 31, 34, 7, 29, 34, 605, 2.08, 5.74),
  tier(RACK_A1, 5, 'lettuce', 'Red Oak Leaf', undefined, F, 31, 34, 7, 29, 34, 633, 1.99, 5.81),
  tier(
    RACK_A1, 6, 'lettuce', 'Red Oak Leaf', undefined, F, 31, 34, 7, 29, 34, 598, 2.02, 5.77,
    'Edge burn on outer leaves flagged in walkthrough Jul 2; PPFD stepped down 640 → 598 pending harvest.',
  ),
  tier(RACK_A1, 7, 'arugula', 'Arugula', 'Astro', F, 26, 28, 5, 23, 28, 628, 1.96, 5.84),
  tier(RACK_A1, 8, 'arugula', 'Arugula', 'Astro', F, 26, 28, 5, 23, 28, 615, 2.05, 5.8),
  tier(RACK_A1, 9, 'lettuce', 'Butterhead', 'Rex', F, 33, 35, 7, 30, 35, 621, 1.98, 5.82),
  tier(
    RACK_A1, 10, 'micro', 'Micro Radish', 'Rambo', S, 4, 10, 3, 8, 10, 152, 1.04, 5.76,
    'Tray seeded Jun 30 from lot MR-118; germination 94% at day-3 count.',
  ),
  emptyTier(RACK_A1, 11, 'Empty — sanitizing since Jun 28'),
  emptyTier(RACK_A1, 12, 'Empty — sanitizing since Jun 28'),
  // Rack A2 — 12 occupied: 3 × Basil Sprint v3, 4 × Leafy Standard v7
  // (t05–t08, the shift-selectable conversion range), 5 × Finisher.
  // Subtotal 3 × 6.5 + 4 × 5.9 + 5 × 11.1 = 98.6.
  tier(RACK_A2, 1, 'basil', 'Genovese Basil', 'Sprint', B, 21, 28, 7, 24, 28, 447, 1.83, 5.92),
  tier(RACK_A2, 2, 'basil', 'Genovese Basil', 'Sprint', B, 21, 28, 7, 24, 28, 458, 1.77, 5.88),
  // Past-window stress fixture: day 34 of a 28-day cycle, window 24–28 —
  // HarvestReadinessGlyph over-run state, warning day number.
  tier(
    RACK_A2, 3, 'arugula', 'Arugula', 'Astro', F, 34, 28, 5, 24, 28, 609, 2.03, 5.79,
    'Past sellable window since Jun 30 — held for the Jul 6 wholesale order per S. Imai; flavor check passed Jul 3.',
  ),
  tier(RACK_A2, 4, 'lettuce', 'Butterhead', 'Rex', F, 31, 35, 7, 30, 35, 626, 1.95, 5.85),
  tier(RACK_A2, 5, 'lettuce', 'Butterhead', 'Rex', L, 21, 35, 7, 30, 35, 412, 1.62, 5.94),
  tier(RACK_A2, 6, 'lettuce', 'Red Oak Leaf', undefined, L, 20, 34, 7, 29, 34, 409, 1.58, 5.87),
  // pH stress fixture: +0.42 beyond the ±0.25 tolerance — the pH
  // MicroGauge flips to warning. Note is the ticket-shaped EC history.
  tier(
    RACK_A2, 7, 'lettuce', 'Butterhead', 'Rex', L, 21, 35, 7, 30, 35, 415, 1.71, 6.22,
    'EC drift on rack-a2-t07 after nutrient batch 114; dosing pump recalibrated 2026-06-30, verify before push.',
  ),
  tier(RACK_A2, 8, 'arugula', 'Arugula', 'Astro', L, 15, 28, 5, 23, 28, 412, 1.64, 5.91),
  tier(RACK_A2, 9, 'lettuce', 'Red Oak Leaf', undefined, F, 30, 34, 7, 29, 34, 631, 2.01, 5.78),
  tier(RACK_A2, 10, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 612, 1.92, 5.83),
  tier(RACK_A2, 11, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 619, 2.06, 5.8),
  tier(RACK_A2, 12, 'basil', 'Genovese Basil', 'Sprint', B, 19, 28, 7, 24, 28, 441, 1.86, 5.95),
  // Rack A3 — 12 occupied: 8 × Finisher + 4 × Leafy (t04–t07, the second
  // half of the conversion selection). Subtotal 8 × 11.1 + 4 × 5.9 = 112.4.
  tier(RACK_A3, 1, 'lettuce', 'Butterhead', 'Rex', F, 33, 35, 7, 30, 35, 608, 1.93, 5.86),
  tier(RACK_A3, 2, 'lettuce', 'Butterhead', 'Rex', F, 33, 35, 7, 30, 35, 622, 2.0, 5.81),
  tier(RACK_A3, 3, 'lettuce', 'Red Oak Leaf', undefined, F, 32, 34, 7, 29, 34, 616, 1.97, 5.84),
  tier(RACK_A3, 4, 'lettuce', 'Butterhead', 'Rex', L, 22, 35, 7, 30, 35, 407, 1.57, 5.89),
  // 37-char crop label — exercises the 148px name-block ellipsis.
  tier(
    RACK_A3, 5, 'lettuce', 'Salanova Red Butter Incised Multi-Leaf', undefined, L, 19, 35, 7,
    30, 35, 412, 1.63, 5.92,
  ),
  tier(RACK_A3, 6, 'lettuce', 'Red Oak Leaf', undefined, L, 20, 34, 7, 29, 34, 404, 1.66, 5.85),
  tier(RACK_A3, 7, 'arugula', 'Arugula', 'Astro', L, 14, 28, 5, 23, 28, 410, 1.59, 5.9),
  tier(RACK_A3, 8, 'lettuce', 'Butterhead', 'Rex', F, 31, 35, 7, 30, 35, 627, 2.07, 5.77),
  tier(RACK_A3, 9, 'lettuce', 'Butterhead', 'Rex', F, 31, 35, 7, 30, 35, 613, 1.96, 5.82),
  tier(RACK_A3, 10, 'lettuce', 'Red Oak Leaf', undefined, F, 30, 34, 7, 29, 34, 601, 2.02, 5.8),
  tier(RACK_A3, 11, 'arugula', 'Arugula', 'Astro', F, 25, 28, 5, 23, 28, 634, 1.98, 5.83),
  tier(RACK_A3, 12, 'lettuce', 'Butterhead', 'Rex', F, 32, 35, 7, 30, 35, 618, 1.94, 5.87),
  // Rack A4 — controller OFFLINE (STALE rows): 5 × Finisher + 1 × Basil +
  // 6 × Leafy. Subtotal 5 × 11.1 + 6.5 + 6 × 5.9 = 97.4. Its Leafy tiers
  // are NOT part of the signature selection — applying here is allowed
  // but toasts a caution.
  tier(RACK_A4, 1, 'lettuce', 'Butterhead', 'Rex', F, 30, 35, 7, 30, 35, 610, 1.99, 5.84),
  tier(RACK_A4, 2, 'lettuce', 'Butterhead', 'Rex', F, 30, 35, 7, 30, 35, 623, 2.05, 5.78),
  tier(RACK_A4, 3, 'lettuce', 'Red Oak Leaf', undefined, F, 29, 34, 7, 29, 34, 606, 1.91, 5.85),
  tier(RACK_A4, 4, 'arugula', 'Arugula', 'Astro', F, 24, 28, 5, 23, 28, 629, 2.04, 5.81),
  tier(RACK_A4, 5, 'lettuce', 'Butterhead', 'Rex', F, 30, 35, 7, 30, 35, 614, 1.95, 5.83),
  tier(RACK_A4, 6, 'basil', 'Genovese Basil', 'Sprint', B, 17, 28, 7, 24, 28, 452, 1.81, 5.93),
  tier(RACK_A4, 7, 'lettuce', 'Butterhead', 'Rex', L, 18, 35, 7, 30, 35, 405, 1.61, 5.88),
  tier(RACK_A4, 8, 'lettuce', 'Butterhead', 'Rex', L, 18, 35, 7, 30, 35, 411, 1.55, 5.91),
  tier(RACK_A4, 9, 'lettuce', 'Red Oak Leaf', undefined, L, 17, 34, 7, 29, 34, 399, 1.67, 5.86),
  tier(RACK_A4, 10, 'lettuce', 'Red Oak Leaf', undefined, L, 17, 34, 7, 29, 34, 408, 1.6, 5.89),
  tier(RACK_A4, 11, 'arugula', 'Arugula', 'Astro', L, 12, 28, 5, 23, 28, 413, 1.62, 5.87),
  tier(RACK_A4, 12, 'lettuce', 'Salanova Red Butter Incised Multi-Leaf', undefined, L, 16, 35,
    7, 30, 35, 406, 1.58, 5.9),
];

const INITIAL_TIERS: Record<TierId, Tier> = Object.fromEntries(
  TIER_LIST.map(t => [t.id, t]),
);

// Last-pushed recipe map — the console loads IN SYNC (no staged diffs);
// the +4.2 pill and unsynced dots are EARNED by the apply interaction:
// 7 Leafy Standard v7 tiers (a2 t05–t08 + a3 t04–t06) → Basil Sprint v3
// = 7 × (6.5 − 5.9) = +4.2 kWh/day, exactly.
const INITIAL_PUSHED: Record<TierId, RecipeId | undefined> = Object.fromEntries(
  TIER_LIST.map(t => [t.id, t.recipeId]),
);

// The signed-in operator is a roster entry, not a floating string.
const PEOPLE = {
  imai: {name: 'Sana Imai', role: 'Grow-room lead'},
  petrov: {name: 'Dmitri Petrov', role: 'Fertigation tech'},
};
const SIGNED_IN = PEOPLE.imai;

const ROOM_OPTIONS = [
  {value: ROOM_A, label: 'Grow Room A'},
  {value: ROOM_B, label: 'Grow Room B'},
];

// Fixed staging timestamp string — the suite's "now" is Sat Jul 4, 2026;
// no clock math anywhere.
const STAGED_AT = '14:32';

// ---------------------------------------------------------------------------
// PURE SELECTORS — every aggregate derives live from the rows.
// ---------------------------------------------------------------------------

type RecipeMap = Record<TierId, RecipeId | undefined>;

const recipeMapOf = (tiers: Record<TierId, Tier>): RecipeMap =>
  Object.fromEntries(Object.values(tiers).map(t => [t.id, t.recipeId]));

/** kWh/day for one rack under a given recipe assignment. */
function rackKwh(rackId: RackId, map: RecipeMap): number {
  let sum = 0;
  for (const t of TIER_LIST) {
    if (t.rackId !== rackId) continue;
    const rid = map[t.id];
    if (rid != null) sum += RECIPES[rid].kwhPerTierDay;
  }
  return Math.round(sum * 10) / 10;
}

function roomKwh(map: RecipeMap): number {
  let sum = 0;
  for (const rack of RACKS) sum += rackKwh(rack.id, map);
  return Math.round(sum * 10) / 10;
}

const stagedTierIds = (tiers: Record<TierId, Tier>, pushed: RecipeMap): TierId[] =>
  Object.values(tiers)
    .filter(t => t.recipeId !== pushed[t.id])
    .map(t => t.id);

const fmtSigned = (n: number): string =>
  \`\${n > 0 ? '+' : n < 0 ? '−' : ''}\${Math.abs(Math.round(n * 10) / 10).toFixed(1)}\`;

interface GaugeReading {
  label: 'PPFD' | 'EC' | 'pH';
  actual: number;
  actualDisplay: string;
  target: number;
  delta: number;
  deltaDisplay: string;
  tolerance: number;
  max: number;
}

/** The three calibrated readings for a tier under its CURRENT recipe. */
function gaugeReadings(t: Tier, recipe: Recipe): GaugeReading[] {
  const ppfdDelta = (t.ppfdActual ?? 0) - recipe.ppfdTarget;
  const ecDelta = Math.round(((t.ec ?? 0) - recipe.ecTarget) * 100) / 100;
  const phDelta = Math.round(((t.ph ?? 0) - recipe.phTarget) * 100) / 100;
  return [
    {
      label: 'PPFD',
      actual: t.ppfdActual ?? 0,
      actualDisplay: \`PPFD \${t.ppfdActual ?? 0}\`,
      target: recipe.ppfdTarget,
      delta: ppfdDelta,
      deltaDisplay: \`\${ppfdDelta >= 0 ? '+' : '−'}\${Math.abs(ppfdDelta)}\`,
      tolerance: recipe.ppfdTolerance,
      max: 700,
    },
    {
      label: 'EC',
      actual: t.ec ?? 0,
      actualDisplay: \`EC \${(t.ec ?? 0).toFixed(2)}\`,
      target: recipe.ecTarget,
      delta: ecDelta,
      deltaDisplay: \`\${ecDelta >= 0 ? '+' : '−'}\${Math.abs(ecDelta).toFixed(2)}\`,
      tolerance: recipe.ecTolerance,
      max: 3,
    },
    {
      label: 'pH',
      actual: t.ph ?? 0,
      actualDisplay: \`pH \${(t.ph ?? 0).toFixed(2)}\`,
      target: recipe.phTarget,
      delta: phDelta,
      deltaDisplay: \`\${phDelta >= 0 ? '+' : '−'}\${Math.abs(phDelta).toFixed(2)}\`,
      tolerance: recipe.phTolerance,
      max: 8,
    },
  ];
}

const isOutOfTolerance = (g: GaugeReading): boolean => Math.abs(g.delta) > g.tolerance;

/** Warning tiers: any gauge out of tolerance OR past the sellable window. */
function tierHasWarning(t: Tier): boolean {
  if (t.crop == null || t.recipeId == null) return false;
  if (t.dayInCycle != null && t.windowEnd != null && t.dayInCycle > t.windowEnd) return true;
  return gaugeReadings(t, RECIPES[t.recipeId]).some(isOutOfTolerance);
}

// ---------------------------------------------------------------------------
// CUSTOM GLYPHS — StackleafMark + per-family crop glyphs, inline SVG only.
// ---------------------------------------------------------------------------

/**
 * StackleafMark — three identical leaf outlines offset along an isometric
 * axis (+4px x, −4px y each) like stacked shelf tiers; front leaf filled
 * with the quarantined STACKLEAF_GREEN, back two outlined.
 */
function StackleafMark() {
  const leaf = 'M2 12 C2 6, 6 2, 12 3 C12 9, 8 12, 2 12 Z';
  const vein = 'M3 11 C6 8, 8 7, 11 4';
  return (
    <svg width={20} height={20} viewBox="0 0 28 28" aria-hidden focusable="false">
      <g transform="translate(8, 0)" stroke="var(--color-text-secondary)" strokeWidth={1.5} fill="none">
        <path d={leaf} />
      </g>
      <g transform="translate(4, 4)" stroke="var(--color-text-primary)" strokeWidth={1.5} fill="none">
        <path d={leaf} />
      </g>
      <g transform="translate(0, 8)">
        <path d={leaf} fill={STACKLEAF_GREEN} stroke="none" />
        <path d={vein} stroke="var(--color-background)" strokeWidth={1} fill="none" />
      </g>
    </svg>
  );
}

const CROP_PATHS: Record<CropFamily, string> = {
  // Basil: two opposing rounded leaves on a stem.
  basil: 'M8 14 L8 8 M8 8 C4 8, 2 5, 3 2 C6 2, 8 4, 8 8 M8 8 C12 8, 14 5, 13 2 C10 2, 8 4, 8 8',
  // Lettuce: layered head.
  lettuce: 'M3 10 C2 5, 6 2, 8 4 C10 2, 14 5, 13 10 C11 13, 5 13, 3 10 Z M6 9 C6 7, 8 6, 8 6 C8 6, 10 7, 10 9',
  // Arugula: lobed leaf on a midrib.
  arugula: 'M8 14 L8 3 M8 12 C5 12, 4 10, 5 9 M8 9 C11 9, 12 7, 11 6 M8 6 C6 6, 5 4, 6 3',
  // Microgreen: sprout with seed leaves.
  micro: 'M8 14 L8 9 M8 9 C5 9, 3 7, 3 5 C6 5, 8 6, 8 9 M8 9 C11 9, 13 7, 13 5 C10 5, 8 6, 8 9',
};

function CropGlyph({family}: {family: CropFamily}) {
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden focusable="false">
      <path
        d={CROP_PATHS[family]}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// MicroGauge — 56 × 6px track inside its 88px cell: actual-value fill
// (scaleX transform, never width), a 2 × 10px target tick overhanging the
// track (translateX), warning fill when |delta| exceeds tolerance; below,
// a 10px tabular line 'PPFD 412' left / signed delta right.
// ---------------------------------------------------------------------------

interface MicroGaugeProps {
  reading: GaugeReading;
  /** Ticket-shaped operator note — surfaces as the gauge tooltip. */
  note?: string;
}

function MicroGauge({reading, note}: MicroGaugeProps) {
  const out = isOutOfTolerance(reading);
  const fillFrac = Math.min(1, Math.max(0, reading.actual / reading.max));
  const tickX = Math.min(54, Math.max(0, (reading.target / reading.max) * 56));
  const spoken = \`\${reading.actualDisplay.replace(/^(PPFD|EC|pH) /, \`\${reading.label} \`)} of \${
    reading.label === 'PPFD' ? reading.target : reading.target.toFixed(2)
  } target, \${reading.delta < 0 ? 'minus' : 'plus'} \${Math.abs(reading.delta)}\`;
  const gauge = (
    <div style={styles.gaugeCell} role="img" aria-label={spoken}>
      <div style={styles.gaugeTrack}>
        <div
          className="vfr-fill"
          style={{
            ...styles.gaugeFill,
            transform: \`scaleX(\${fillFrac})\`,
            backgroundColor: out ? WARN_FILL : 'var(--color-accent)',
          }}
        />
        <div className="vfr-tick" style={{...styles.gaugeTick, transform: \`translateX(\${tickX}px)\`}} />
      </div>
      <div style={styles.gaugeLine}>
        <span style={{color: 'var(--color-text-secondary)'}}>{reading.actualDisplay}</span>
        <span style={{color: out ? WARN_TEXT : GOOD_TEXT}}>{reading.deltaDisplay}</span>
      </div>
    </div>
  );
  return note != null ? <Tooltip content={note}>{gauge}</Tooltip> : gauge;
}

// ---------------------------------------------------------------------------
// LightRecipeBar — inline SVG 24h photoperiod bar, 16px tall in a 24px
// cell, viewBox 0 0 240 16 stretched to cell width. Unlit hours: 2px
// baseline at y=13. Lit segments: full-height blocks vertically subdivided
// into spectrum bands (deep red bottom / blue middle / far-red top),
// 30-min dimming-ramp wedges at segment ends, hour ticks at 0/6/12/18/24.
// The Finisher Far-Red fixture proves MULTIPLE lit segments (22:00–23:00
// far-red-only pulse). staged=true adds a dashed accent outline until
// pushed.
// ---------------------------------------------------------------------------

interface LightRecipeBarProps {
  segments: PhotoSegment[];
  spectrum: Spectrum;
  photoperiodDisplay: string;
  staged: boolean;
}

function LightRecipeBar({segments, spectrum, photoperiodDisplay, staged}: LightRecipeBarProps) {
  const LIT_TOP = 1;
  const LIT_BOTTOM = 13;
  const litH = LIT_BOTTOM - LIT_TOP;
  const hDeepRed = (litH * spectrum.deepRed) / 100;
  const hBlue = (litH * spectrum.blue) / 100;
  const hFarRed = litH - hDeepRed - hBlue;
  const label =
    \`Photoperiod \${photoperiodDisplay}, spectrum deep red \${spectrum.deepRed}%, \` +
    \`blue \${spectrum.blue}%, far red \${spectrum.farRed}%\` +
    (staged ? ' — staged, not yet pushed' : '');
  return (
    <svg
      viewBox="0 0 240 16"
      preserveAspectRatio="none"
      style={{width: '100%', height: 16, display: 'block'}}
      role="img"
      aria-label={label}>
      {/* Unlit baseline */}
      <rect x={0} y={12} width={240} height={2} rx={1} fill="var(--color-background-muted)" />
      {/* Hour ticks 0/6/12/18/24 */}
      {[0, 60, 120, 180, 239].map(x => (
        <rect key={x} x={x} y={12} width={1} height={4} fill="var(--color-border)" />
      ))}
      {segments.map((seg, i) => {
        const xOn = seg.onHour * 10;
        const xOff = seg.offHour * 10;
        const rampW = (seg.rampMinutes / 60) * 10;
        const coreX = xOn + rampW;
        const coreW = Math.max(0, xOff - xOn - rampW * 2);
        const rampFill = seg.farRedOnly ? SPECTRUM_FAR_RED : SPECTRUM_DEEP_RED;
        return (
          <g key={i}>
            {rampW > 0 ? (
              <polygon
                points={\`\${xOn},\${LIT_BOTTOM} \${coreX},\${LIT_TOP} \${coreX},\${LIT_BOTTOM}\`}
                fill={rampFill}
              />
            ) : null}
            {seg.farRedOnly ? (
              <rect x={coreX} y={LIT_TOP} width={coreW} height={litH} fill={SPECTRUM_FAR_RED} />
            ) : (
              <g>
                <rect
                  x={coreX}
                  y={LIT_BOTTOM - hDeepRed}
                  width={coreW}
                  height={hDeepRed}
                  fill={SPECTRUM_DEEP_RED}
                />
                <rect
                  x={coreX}
                  y={LIT_BOTTOM - hDeepRed - hBlue}
                  width={coreW}
                  height={hBlue}
                  fill={SPECTRUM_BLUE}
                />
                <rect x={coreX} y={LIT_TOP} width={coreW} height={hFarRed} fill={SPECTRUM_FAR_RED} />
              </g>
            )}
            {rampW > 0 ? (
              <polygon
                points={\`\${xOff - rampW},\${LIT_TOP} \${xOff - rampW},\${LIT_BOTTOM} \${xOff},\${LIT_BOTTOM}\`}
                fill={rampFill}
              />
            ) : null}
          </g>
        );
      })}
      {staged ? (
        <rect
          x={0.5}
          y={0.5}
          width={239}
          height={15}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeDasharray="3 2"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HarvestReadinessGlyph — 28px dial in a 40px cell: 270° sweep, 2.5px arc
// track segmented into phases, sellable window over-stroked 3.5px in the
// success token, needle at currentDay/cycleLength, center tabular day
// number (warning-colored when past window; needle pins beyond arc end).
// ---------------------------------------------------------------------------

const DIAL_C = 14;
const DIAL_R = 10.5;
// SVG y-down angles: 135° = lower-left, sweep clockwise over the top
// (135 → 270 → 405) for the classic 270° gauge.
const DIAL_START = 135;
const DIAL_SWEEP = 270;

const dialPoint = (angleDeg: number, r: number): [number, number] => {
  const rad = (angleDeg * Math.PI) / 180;
  return [DIAL_C + r * Math.cos(rad), DIAL_C + r * Math.sin(rad)];
};

function dialArc(a0: number, a1: number, r: number): string {
  const [x0, y0] = dialPoint(a0, r);
  const [x1, y1] = dialPoint(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return \`M \${x0.toFixed(2)} \${y0.toFixed(2)} A \${r} \${r} 0 \${large} 1 \${x1.toFixed(2)} \${y1.toFixed(2)}\`;
}

interface HarvestReadinessGlyphProps {
  dayInCycle: number;
  cycleLength: number;
  phases: Phase[];
  windowStart: number;
  windowEnd: number;
}

function HarvestReadinessGlyph({
  dayInCycle,
  cycleLength,
  phases,
  windowStart,
  windowEnd,
}: HarvestReadinessGlyphProps) {
  const angleFor = (day: number, overrun = 0): number =>
    DIAL_START + DIAL_SWEEP * Math.min(1 + overrun, Math.max(0, day / cycleLength));
  const past = dayInCycle > windowEnd;
  const label = past
    ? \`Day \${dayInCycle} of \${cycleLength} — past sellable window day \${windowStart} to \${windowEnd}\`
    : \`Day \${dayInCycle} of \${cycleLength}, sellable window day \${windowStart} to \${windowEnd}\`;
  const needleAngle = angleFor(dayInCycle, 0.08); // past-window: pins just beyond arc end
  const [nx, ny] = dialPoint(needleAngle, 8.5);
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" role="img" aria-label={label}>
      {phases.map((phase, i) => {
        const end = phases[i + 1]?.startDay ?? cycleLength;
        const a0 = angleFor(phase.startDay) + (i === 0 ? 0 : 1.5);
        const a1 = angleFor(end);
        if (a1 <= a0) return null;
        return (
          <path
            key={phase.name}
            d={dialArc(a0, a1, DIAL_R)}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={2.5}
            strokeLinecap="butt"
          />
        );
      })}
      <path
        d={dialArc(angleFor(windowStart), angleFor(Math.min(windowEnd, cycleLength)), DIAL_R)}
        fill="none"
        stroke={OK_FILL}
        strokeWidth={3.5}
        strokeLinecap="butt"
      />
      <line
        x1={DIAL_C}
        y1={DIAL_C}
        x2={nx.toFixed(2)}
        y2={ny.toFixed(2)}
        stroke="var(--color-text-primary)"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <circle cx={DIAL_C} cy={DIAL_C} r={2} fill="var(--color-text-primary)" />
      <text
        x={DIAL_C}
        y={24.5}
        textAnchor="middle"
        fontFamily={MONO}
        fontSize={9}
        style={{fontVariantNumeric: 'tabular-nums'}}
        fill={past ? WARN_TEXT : 'var(--color-text-secondary)'}>
        {dayInCycle}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// KwhForecastChip — 28px header chip: bolt glyph + '412.6 kWh/day'; when a
// staged delta exists, a 20px pill ('+4.2', warning if positive, success
// if negative) fades in with the per-tier math as its tooltip.
// ---------------------------------------------------------------------------

interface KwhForecastChipProps {
  forecastDisplay: string;
  stagedDeltaDisplay?: string;
  deltaTooltip?: string;
  deltaIsPositive?: boolean;
}

function KwhForecastChip({
  forecastDisplay,
  stagedDeltaDisplay,
  deltaTooltip,
  deltaIsPositive,
}: KwhForecastChipProps) {
  return (
    <span style={styles.kwhChip}>
      <Icon icon={ZapIcon} size="xsm" color="secondary" />
      <span>{forecastDisplay}</span>
      {stagedDeltaDisplay != null ? (
        <Tooltip content={deltaTooltip ?? 'Staged, not yet pushed'}>
          <span
            className="vfr-pill"
            style={
              deltaIsPositive
                ? styles.kwhPill
                : {...styles.kwhPill, backgroundColor: OK_SOFT, color: GOOD_TEXT}
            }
            title="staged, not yet pushed">
            {stagedDeltaDisplay}
          </span>
        </Tooltip>
      ) : null}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TierConditionRow — the 44px heavy row. Purely presentational; selection
// and data live in the owner. Cells left→right (8px gaps, 12px padding):
// 28px selection well · 24px crop glyph · 148px name block · 64px
// day-notch bar · 3 × 88px MicroGauges · flexible LightRecipeBar (min
// 180px) · 40px HarvestReadinessGlyph · 56px status. Band subtraction:
// 'mid' drops the notch (day folds into the name block's second line) and
// collapses gauges to the single worst-delta metric; 'narrow' also drops
// the crop glyph. crop === undefined renders the dashed sanitizing
// placeholder (fixtures: rack-a1-t11 / rack-a1-t12) with only the well +
// status. The 37-char Salanova label at rack-a3-t05 exercises the 148px
// ellipsis.
// ---------------------------------------------------------------------------

type MainBand = 'full' | 'mid' | 'narrow';

interface TierConditionRowProps {
  tier: Tier;
  recipe?: Recipe;
  selected: boolean;
  staged: boolean;
  stale: boolean;
  staleReason?: string;
  band: MainBand;
  noteOpen: boolean;
  tabbable: boolean;
  onSelect: (tierId: TierId, shiftKey: boolean) => void;
  onRowKeyDown: (e: ReactKeyboardEvent<HTMLDivElement>, tierId: TierId) => void;
  rowRef: (el: HTMLDivElement | null) => void;
}

function TierConditionRow({
  tier,
  recipe,
  selected,
  staged,
  stale,
  staleReason,
  band,
  noteOpen,
  tabbable,
  onSelect,
  onRowKeyDown,
  rowRef,
}: TierConditionRowProps) {
  const indexLabel = \`T\${String(tier.index).padStart(2, '0')}\`;
  const statusCell = (
    <div style={styles.statusCell} role="gridcell">
      {staged ? (
        <Tooltip content={\`Staged \${STAGED_AT} — not yet pushed\`}>
          <span style={styles.unsyncedDot} aria-label="Unsynced — staged change" role="img" />
        </Tooltip>
      ) : null}
      {stale ? (
        <Tooltip content={staleReason ?? 'Controller offline — readings are last-known'}>
          <span style={styles.staleBadge}>STALE</span>
        </Tooltip>
      ) : null}
    </div>
  );

  if (tier.crop == null || recipe == null) {
    return (
      <div
        style={{...styles.tierRow, ...styles.tierRowEmpty}}
        role="row"
        aria-label={\`Tier \${indexLabel}: \${tier.emptyNote ?? 'Empty'}\`}>
        <div style={styles.well} role="gridcell">
          <CheckboxInput
            label={\`Tier \${indexLabel} — empty, cannot select\`}
            isLabelHidden
            size="sm"
            value={false}
            isDisabled
            onChange={() => {}}
          />
          <span style={styles.wellIndex}>{indexLabel}</span>
        </div>
        <div style={styles.emptyDash} role="gridcell">
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {tier.emptyNote}
          </Text>
        </div>
        {statusCell}
      </div>
    );
  }

  const readings = gaugeReadings(tier, recipe);
  const worst = readings.reduce((acc, g) =>
    Math.abs(g.delta) / g.tolerance > Math.abs(acc.delta) / acc.tolerance ? g : acc,
  );
  const dayText = \`\${tier.dayInCycle}/\${tier.cycleLength}d\`;
  const cultivarLine =
    band === 'full'
      ? tier.crop.cultivar ?? '—'
      : \`\${tier.crop.cultivar != null ? \`\${tier.crop.cultivar} · \` : ''}\${dayText}\`;

  return (
    <>
      <div
        ref={rowRef}
        className="vfr-focusable"
        style={selected ? {...styles.tierRow, ...styles.tierRowSelected} : styles.tierRow}
        role="row"
        aria-selected={selected}
        tabIndex={tabbable ? 0 : -1}
        onClick={e => onSelect(tier.id, e.shiftKey)}
        onKeyDown={e => onRowKeyDown(e, tier.id)}>
        <div style={styles.well} role="gridcell" onClick={e => e.stopPropagation()}>
          <CheckboxInput
            label={\`Select tier \${indexLabel} — \${tier.crop.name}\`}
            isLabelHidden
            size="sm"
            value={selected}
            onChange={() => onSelect(tier.id, false)}
          />
          <span style={styles.wellIndex}>{indexLabel}</span>
        </div>
        {band !== 'narrow' ? (
          <div style={styles.cropGlyphCell} role="gridcell" aria-hidden>
            <CropGlyph family={tier.crop.family} />
          </div>
        ) : null}
        <div style={styles.nameBlock} role="gridcell">
          <div style={styles.nameLine}>{tier.crop.name}</div>
          <div style={styles.cultivarLine}>{cultivarLine}</div>
        </div>
        {band === 'full' ? (
          <div style={styles.notchCell} role="gridcell">
            <div style={styles.notchTrack} aria-hidden>
              <div
                style={{
                  ...styles.notchFill,
                  width: \`\${Math.min(100, ((tier.dayInCycle ?? 0) / (tier.cycleLength ?? 1)) * 100)}%\`,
                }}
              />
              <div
                style={{
                  ...styles.notchMark,
                  left: \`\${((tier.transplantDay ?? 0) / (tier.cycleLength ?? 1)) * 100}%\`,
                }}
              />
            </div>
            <div style={styles.notchLabel}>{dayText}</div>
          </div>
        ) : null}
        {band === 'full' ? (
          readings.map(reading => (
            <div key={reading.label} role="gridcell" style={{display: 'contents'}}>
              <MicroGauge reading={reading} note={tier.note} />
            </div>
          ))
        ) : (
          <div role="gridcell" style={{display: 'contents'}}>
            <MicroGauge reading={worst} note={tier.note} />
          </div>
        )}
        <div style={styles.barCell} role="gridcell">
          <LightRecipeBar
            segments={recipe.segments}
            spectrum={recipe.spectrum}
            photoperiodDisplay={recipe.photoperiodDisplay}
            staged={staged}
          />
        </div>
        <div style={styles.dialCell} role="gridcell">
          <HarvestReadinessGlyph
            dayInCycle={tier.dayInCycle ?? 0}
            cycleLength={tier.cycleLength ?? 1}
            phases={tier.phases ?? []}
            windowStart={tier.windowStart ?? 0}
            windowEnd={tier.windowEnd ?? 0}
          />
        </div>
        {statusCell}
      </div>
      {noteOpen && tier.note != null ? (
        <div style={{...styles.rackHeader, position: 'static', height: 36}} role="note">
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {tier.note}
          </Text>
        </div>
      ) : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// RecipeCard — 36px collapsed recipe row (name + photoperiod + kWh/tier·day)
// expanding, when selected, to a full-width LightRecipeBar preview,
// spectrum-mix legend rows, PPFD setpoint, and per-tier energy. Selection
// ring is the brand green inset.
// ---------------------------------------------------------------------------

interface RecipeCardProps {
  recipe: Recipe;
  selected: boolean;
  onSelect: (recipeId: RecipeId) => void;
}

function RecipeCard({recipe, selected, onSelect}: RecipeCardProps) {
  return (
    <button
      type="button"
      className="vfr-focusable"
      style={selected ? {...styles.recipeRow, ...styles.recipeSelected} : styles.recipeRow}
      aria-expanded={selected}
      onClick={() => onSelect(recipe.id)}>
      <span style={styles.recipeRowLine}>
        <Text type="label" size="sm" maxLines={1}>
          {recipe.name}
        </Text>
        <span style={{flex: 1}} aria-hidden />
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {recipe.photoperiodDisplay}
        </Text>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {recipe.kwhDisplay}
        </Text>
      </span>
      {selected ? (
        <span style={styles.recipeCardBody}>
          <LightRecipeBar
            segments={recipe.segments}
            spectrum={recipe.spectrum}
            photoperiodDisplay={recipe.photoperiodDisplay}
            staged={false}
          />
          <span style={styles.legendRow}>
            <span style={{...styles.legendSwatch, backgroundColor: SPECTRUM_DEEP_RED}} />
            Deep red 660nm — {recipe.spectrum.deepRed}%
          </span>
          <span style={styles.legendRow}>
            <span style={{...styles.legendSwatch, backgroundColor: SPECTRUM_BLUE}} />
            Blue 450nm — {recipe.spectrum.blue}%
          </span>
          <span style={styles.legendRow}>
            <span style={{...styles.legendSwatch, backgroundColor: SPECTRUM_FAR_RED}} />
            Far-red 730nm — {recipe.spectrum.farRed}%
          </span>
          <span style={styles.legendRow}>
            PPFD setpoint {recipe.ppfdTargetDisplay} · {recipe.kwhDisplay}
          </span>
        </span>
      ) : null}
    </button>
  );
}

// ---------------------------------------------------------------------------
// RoomRackTree — 260px column of 36px rows (role=tree): rooms expandable
// (aria-expanded), rack rows carry occupancy 'n/12', kWh subtotal, a 6px
// unsynced dot when any tier is staged, and a warning glyph when the
// controller is offline; the active rack row is highlighted. In the 56px
// icon-rail collapse, rooms render as 32px initial squares with the
// unsynced dot preserved. Rack subtotal rows focus their rack section on
// click (every displayed property is an affordance).
// ---------------------------------------------------------------------------

interface RackAgg {
  rack: Rack;
  occupancy: string;
  kwhDisplay: string;
  unsynced: boolean;
}

interface RoomRackTreeProps {
  collapsed: boolean;
  activeRoomId: RoomId;
  expandedRooms: ReadonlySet<RoomId>;
  activeRackId: RackId | null;
  rackAggs: RackAgg[];
  roomAUnsynced: boolean;
  onToggleRoom: (roomId: RoomId) => void;
  onSelectRoom: (roomId: RoomId) => void;
  onRackClick: (rackId: RackId) => void;
}

function RoomRackTree({
  collapsed,
  activeRoomId,
  expandedRooms,
  activeRackId,
  rackAggs,
  roomAUnsynced,
  onToggleRoom,
  onSelectRoom,
  onRackClick,
}: RoomRackTreeProps) {
  if (collapsed) {
    return (
      <nav style={styles.treeRail} aria-label="Rooms">
        <button
          type="button"
          className="vfr-focusable"
          style={
            activeRoomId === ROOM_A
              ? {...styles.railSquare, ...styles.railSquareActive}
              : styles.railSquare
          }
          aria-label={\`Grow Room A\${roomAUnsynced ? ' — unsynced changes staged' : ''}\`}
          aria-pressed={activeRoomId === ROOM_A}
          onClick={() => onSelectRoom(ROOM_A)}>
          A
          {roomAUnsynced ? <span style={{...styles.unsyncedDot, ...styles.railDot}} /> : null}
        </button>
        <button
          type="button"
          className="vfr-focusable"
          style={
            activeRoomId === ROOM_B
              ? {...styles.railSquare, ...styles.railSquareActive}
              : styles.railSquare
          }
          aria-label="Grow Room B"
          aria-pressed={activeRoomId === ROOM_B}
          onClick={() => onSelectRoom(ROOM_B)}>
          B
        </button>
      </nav>
    );
  }
  const roomAExpanded = expandedRooms.has(ROOM_A);
  const roomBExpanded = expandedRooms.has(ROOM_B);
  return (
    <div style={styles.treeScroll} role="tree" aria-label="Rooms and racks">
      <div role="treeitem" aria-expanded={roomAExpanded} aria-selected={activeRoomId === ROOM_A}>
        <button
          type="button"
          className="vfr-focusable"
          style={styles.treeRoomRow}
          onClick={() => onToggleRoom(ROOM_A)}>
          <Icon icon={roomAExpanded ? ChevronDownIcon : ChevronRightIcon} size="xsm" color="secondary" />
          <Text type="label" size="sm">
            Grow Room A
          </Text>
          {roomAUnsynced ? <span style={styles.unsyncedDot} aria-hidden /> : null}
          <span style={{flex: 1}} aria-hidden />
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            4 racks
          </Text>
        </button>
        {roomAExpanded ? (
          <div role="group">
            {rackAggs.map(agg => (
              <div
                key={agg.rack.id}
                role="treeitem"
                aria-selected={activeRackId === agg.rack.id}
                aria-current={activeRackId === agg.rack.id ? 'location' : undefined}>
                <button
                  type="button"
                  className="vfr-focusable"
                  style={
                    activeRackId === agg.rack.id
                      ? {...styles.treeRackRow, ...styles.treeRackActive}
                      : styles.treeRackRow
                  }
                  onClick={() => onRackClick(agg.rack.id)}>
                  <Text type="label" size="sm">
                    {agg.rack.name}
                  </Text>
                  {agg.rack.offline ? (
                    <Icon
                      icon={TriangleAlertIcon}
                      size="xsm"
                      color="inherit"
                      style={{color: WARN_TEXT}}
                      aria-label="Controller offline"
                    />
                  ) : null}
                  {agg.unsynced ? <span style={styles.unsyncedDot} aria-hidden /> : null}
                  <span style={{flex: 1}} aria-hidden />
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {agg.occupancy}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {agg.kwhDisplay}
                  </Text>
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <div role="treeitem" aria-expanded={roomBExpanded} aria-selected={activeRoomId === ROOM_B}>
        <button
          type="button"
          className="vfr-focusable"
          style={styles.treeRoomRow}
          onClick={() => onToggleRoom(ROOM_B)}>
          <Icon icon={roomBExpanded ? ChevronDownIcon : ChevronRightIcon} size="xsm" color="secondary" />
          <Text type="label" size="sm">
            Grow Room B
          </Text>
          <span style={{flex: 1}} aria-hidden />
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            2 racks
          </Text>
        </button>
        {roomBExpanded ? (
          <div role="group">
            {/* Room B has ZERO staged tiers — the unsynced dot only appears
                when earned (stress fixture). */}
            {ROOM_B_RACKS.map(rack => (
              <div key={rack.id} role="treeitem" aria-selected={false}>
                <button
                  type="button"
                  className="vfr-focusable"
                  style={styles.treeRackRow}
                  onClick={() => onSelectRoom(ROOM_B)}>
                  <Text type="label" size="sm">
                    {rack.name}
                  </Text>
                  <span style={{flex: 1}} aria-hidden />
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {rack.occupancy}
                  </Text>
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {rack.kwh}
                  </Text>
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recipe panel body — shared by the 360px aside and the < 900px Dialog.
// ---------------------------------------------------------------------------

interface RecipePanelProps {
  selectedRecipeId: RecipeId | null;
  selectionCount: number;
  onSelectRecipe: (recipeId: RecipeId) => void;
  onApply: () => void;
}

function RecipePanel({selectedRecipeId, selectionCount, onSelectRecipe, onApply}: RecipePanelProps) {
  const applyLabel = \`Apply to \${selectionCount} tier\${selectionCount === 1 ? '' : 's'}\`;
  return (
    <>
      <div style={styles.asideScroll}>
        {RECIPE_ORDER.map(id => (
          <RecipeCard
            key={id}
            recipe={RECIPES[id]}
            selected={selectedRecipeId === id}
            onSelect={onSelectRecipe}
          />
        ))}
      </div>
      <div style={styles.asideFooter}>
        <Button
          label={applyLabel}
          variant="primary"
          size="sm"
          isDisabled={selectionCount === 0 || selectedRecipeId == null}
          onClick={onApply}
        />
        <Text type="supporting" size="xsm" color="secondary">
          Stages recipe changes — push to sync controllers
        </Text>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// useElementWidth — ResizeObserver on a ref, returns integer px. All
// responsive bands key off MEASURED CONTAINER width (the demo stage is
// ~1045–1075px inside a 1440px window; viewport queries would lie). Width
// 0 = first pre-observer frame; viewport queries cover only that frame.
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(Math.round(rect.width));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. One update(tierId, patch) mutator; every
// aggregate (rack subtotals, room forecast, staged delta, unsynced racks)
// derives live from the rows via the pure selectors above.
// ---------------------------------------------------------------------------

interface ConsoleState {
  tiers: Record<TierId, Tier>;
  selection: ReadonlySet<TierId>;
  anchorTierId: TierId | null;
  selectedRecipeId: RecipeId | null;
  activeRoomId: RoomId;
  lastPushed: RecipeMap;
  announce: string;
}

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

export default function VerticalFarmRackConsoleTemplate() {
  const toast = useToast();
  const viewRef = useRef<HTMLDivElement | null>(null);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const viewWidth = useElementWidth(viewRef);
  const mainWidth = useElementWidth(mainRef);
  // Viewport queries survive ONLY as the pre-observer first-frame fallback.
  const vpRail = useMediaQuery('(max-width: 1199px)');
  const vpAside320 = useMediaQuery('(max-width: 999px)');
  const vpNoAside = useMediaQuery('(max-width: 899px)');
  const isRail = viewWidth > 0 ? viewWidth < 1200 : vpRail;
  const isAsideDropped = viewWidth > 0 ? viewWidth < 900 : vpNoAside;
  const isAside320 = !isAsideDropped && (viewWidth > 0 ? viewWidth < 1000 : vpAside320);
  const band: MainBand =
    mainWidth > 0 ? (mainWidth >= 920 ? 'full' : mainWidth >= 680 ? 'mid' : 'narrow') : 'mid';

  const [state, setState] = useState<ConsoleState>(() => ({
    tiers: INITIAL_TIERS,
    selection: new Set<TierId>(),
    anchorTierId: null,
    selectedRecipeId: RECIPE_BASIL_SPRINT_V3,
    activeRoomId: ROOM_A,
    lastPushed: INITIAL_PUSHED,
    announce: '',
  }));
  // UI ephemera outside the domain owner: tree expansion, note strips,
  // warnings filter, the < 900px recipes Dialog, roving focus target,
  // and the tree's active rack highlight.
  const [expandedRooms, setExpandedRooms] = useState<ReadonlySet<RoomId>>(
    () => new Set([ROOM_A]),
  );
  const [noteOpenId, setNoteOpenId] = useState<TierId | null>(null);
  const [filter, setFilter] = useState<'all' | 'warnings'>('all');
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [focusTierId, setFocusTierId] = useState<TierId>(TIER_LIST[0].id);
  const [activeRackId, setActiveRackId] = useState<RackId | null>(null);

  const rowRefs = useRef<Map<TierId, HTMLDivElement>>(new Map());
  const sectionRefs = useRef<Map<RackId, HTMLElement>>(new Map());

  // THE single mutation path — every recipe application flows through here.
  const update = useCallback((tierId: TierId, patch: Partial<Tier>) => {
    setState(prev => {
      const existing = prev.tiers[tierId];
      if (existing == null) return prev;
      return {...prev, tiers: {...prev.tiers, [tierId]: {...existing, ...patch}}};
    });
  }, []);

  // Derived — every aggregate re-derives from the rows on each change.
  const derived = useMemo(() => {
    const currentMap = recipeMapOf(state.tiers);
    const forecast = roomKwh(currentMap);
    const pushedForecast = roomKwh(state.lastPushed);
    const stagedIds = stagedTierIds(state.tiers, state.lastPushed);
    const stagedSet = new Set(stagedIds);
    const unsyncedRackIds = new Set(stagedIds.map(id => state.tiers[id].rackId));
    const rackAggs: RackAgg[] = RACKS.map(rack => {
      const tiersOfRack = TIER_LIST.filter(t => t.rackId === rack.id);
      const occupied = tiersOfRack.filter(t => state.tiers[t.id]?.crop != null).length;
      return {
        rack,
        occupancy: \`\${occupied}/12\`,
        kwhDisplay: rackKwh(rack.id, currentMap).toFixed(1),
        unsynced: unsyncedRackIds.has(rack.id),
      };
    });
    const warningIds = TIER_LIST.filter(t => tierHasWarning(state.tiers[t.id])).map(t => t.id);
    return {
      forecast,
      delta: Math.round((forecast - pushedForecast) * 10) / 10,
      stagedIds,
      stagedSet,
      unsyncedRackIds,
      rackAggs,
      warningIds: new Set(warningIds),
      warningCount: warningIds.length,
    };
  }, [state.tiers, state.lastPushed]);

  const visibleTiers = useMemo(
    () =>
      TIER_LIST.filter(t => {
        if (filter === 'warnings') return derived.warningIds.has(t.id);
        return true;
      }).map(t => state.tiers[t.id]),
    [state.tiers, filter, derived.warningIds],
  );

  // --- actions ------------------------------------------------------------

  const toggleTier = useCallback((tierId: TierId, shiftKey: boolean) => {
    setState(prev => {
      const target = prev.tiers[tierId];
      if (target?.crop == null) return prev;
      const selection = new Set(prev.selection);
      let anchorTierId = prev.anchorTierId;
      const anchor = anchorTierId != null ? prev.tiers[anchorTierId] : null;
      if (shiftKey && anchor != null && anchor.rackId === target.rackId) {
        // Shift: contiguous range from anchor within the same rack.
        const lo = Math.min(anchor.index, target.index);
        const hi = Math.max(anchor.index, target.index);
        for (const t of TIER_LIST) {
          if (t.rackId === target.rackId && t.index >= lo && t.index <= hi && t.crop != null) {
            selection.add(t.id);
          }
        }
      } else {
        if (selection.has(tierId)) selection.delete(tierId);
        else selection.add(tierId);
        anchorTierId = tierId;
      }
      return {
        ...prev,
        selection,
        anchorTierId,
        announce: \`\${selection.size} tier\${selection.size === 1 ? '' : 's'} selected\`,
      };
    });
  }, []);

  const clearSelection = useCallback(() => {
    setState(prev =>
      prev.selection.size === 0
        ? prev
        : {...prev, selection: new Set(), anchorTierId: null, announce: 'Selection cleared'},
    );
  }, []);

  const selectRecipe = useCallback((recipeId: RecipeId) => {
    setState(prev => ({...prev, selectedRecipeId: recipeId}));
  }, []);

  const setRoom = useCallback((roomId: RoomId) => {
    setState(prev => ({...prev, activeRoomId: roomId}));
    setExpandedRooms(prev => new Set(prev).add(roomId));
  }, []);

  const applyRecipe = () => {
    const recipeId = state.selectedRecipeId;
    if (recipeId == null) return;
    const recipe = RECIPES[recipeId];
    const ids = [...state.selection].filter(id => state.tiers[id]?.crop != null);
    if (ids.length === 0) return;
    for (const id of ids) update(id, {recipeId});
    const nextMap = recipeMapOf(state.tiers);
    for (const id of ids) nextMap[id] = recipeId;
    const delta = Math.round((roomKwh(nextMap) - roomKwh(state.lastPushed)) * 10) / 10;
    const msg = \`Applied \${recipe.name} to \${ids.length} tier\${
      ids.length === 1 ? '' : 's'
    }, forecast \${fmtSigned(delta)} kWh/day\`;
    setState(prev => ({...prev, selection: new Set(), anchorTierId: null, announce: msg}));
    const touchesOffline = ids.some(
      id => RACKS.find(r => r.id === state.tiers[id].rackId)?.offline,
    );
    if (touchesOffline) {
      // Applying to a stale rack is allowed but cautions (stress fixture).
      toast({
        body: \`\${msg} — Rack A4 controller offline; its tiers stay staged until it reconnects\`,
        type: 'error',
        isAutoHide: true,
      });
    } else {
      toast({body: msg});
    }
    setIsRecipesOpen(false);
  };

  const pushToControllers = () => {
    const stagedIds = derived.stagedIds;
    if (stagedIds.length === 0) return;
    const rackCount = derived.unsyncedRackIds.size;
    const msg = \`Pushed \${rackCount} rack\${rackCount === 1 ? '' : 's'} · \${stagedIds.length} tier\${
      stagedIds.length === 1 ? '' : 's'
    }\`;
    setState(prev => ({
      ...prev,
      lastPushed: recipeMapOf(prev.tiers),
      announce: msg,
    }));
    toast({body: msg});
  };

  // --- keyboard -----------------------------------------------------------

  const onRowKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>, tierId: TierId) => {
    if (isTypingTarget(e.target)) return;
    if (e.key === ' ') {
      e.preventDefault();
      toggleTier(tierId, e.shiftKey);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setNoteOpenId(prev => (prev === tierId ? null : tierId));
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const rows = visibleTiers.filter(t => t.crop != null);
      const i = rows.findIndex(t => t.id === tierId);
      const next = rows[e.key === 'ArrowDown' ? i + 1 : i - 1];
      if (next != null) {
        setFocusTierId(next.id);
        rowRefs.current.get(next.id)?.focus();
      }
    }
  };

  // Escape layering: the Dialog (when open) owns Escape and restores focus
  // itself; otherwise Escape clears the tier selection.
  const onViewKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape' && !isRecipesOpen && !isTypingTarget(e.target)) {
      clearSelection();
    }
  };

  const focusRack = (rackId: RackId) => {
    setActiveRackId(rackId);
    sectionRefs.current.get(rackId)?.scrollIntoView({block: 'start'});
  };

  // --- render -------------------------------------------------------------

  const isRoomB = state.activeRoomId === ROOM_B;
  const selectionCount = state.selection.size;
  const stagedCount = derived.stagedIds.length;
  const unsyncedRackCount = derived.unsyncedRackIds.size;

  // Per-tier math tooltip for the delta pill — exact when the staged diffs
  // are uniform (the signature path: 7 × +0.6 = +4.2).
  const deltaTooltip = useMemo(() => {
    if (derived.stagedIds.length === 0) return undefined;
    const diffs = derived.stagedIds.map(id => {
      const now = state.tiers[id].recipeId;
      const was = state.lastPushed[id];
      return (
        (now != null ? RECIPES[now].kwhPerTierDay : 0) -
        (was != null ? RECIPES[was].kwhPerTierDay : 0)
      );
    });
    const first = Math.round(diffs[0] * 10) / 10;
    const uniform = diffs.every(d => Math.round(d * 10) / 10 === first);
    return uniform
      ? \`\${diffs.length} tier\${diffs.length === 1 ? '' : 's'} × \${fmtSigned(first)} kWh/tier·day = \${fmtSigned(
          derived.delta,
        )} kWh/day — staged, not yet pushed\`
      : \`\${diffs.length} tiers staged · \${fmtSigned(derived.delta)} kWh/day vs last push\`;
  }, [derived.stagedIds, derived.delta, state.tiers, state.lastPushed]);

  const recipePanel = (
    <RecipePanel
      selectedRecipeId={state.selectedRecipeId}
      selectionCount={selectionCount}
      onSelectRecipe={selectRecipe}
      onApply={applyRecipe}
    />
  );

  return (
    <div style={styles.root}>
      <style>{VFR_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.header}>
              <div style={styles.brandCluster}>
                <StackleafMark />
                <Text type="label" size="base">
                  Stackleaf
                </Text>
              </div>
              <Selector
                label="Grow room"
                isLabelHidden
                size="sm"
                options={ROOM_OPTIONS}
                value={state.activeRoomId}
                onChange={value => setRoom(value as RoomId)}
              />
              <div style={styles.headerRight}>
                <KwhForecastChip
                  forecastDisplay={isRoomB ? '128.0 kWh/day' : \`\${derived.forecast.toFixed(1)} kWh/day\`}
                  stagedDeltaDisplay={
                    !isRoomB && derived.delta !== 0 ? fmtSigned(derived.delta) : undefined
                  }
                  deltaTooltip={deltaTooltip}
                  deltaIsPositive={derived.delta > 0}
                />
                <Button
                  label={
                    unsyncedRackCount > 0
                      ? \`Push to controllers · \${unsyncedRackCount}\`
                      : 'Push to controllers'
                  }
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={UploadIcon} size="sm" />}
                  isDisabled={stagedCount === 0}
                  onClick={pushToControllers}
                />
                <Avatar name={SIGNED_IN.name} size={24} />
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div ref={viewRef} style={styles.viewRoot} onKeyDown={onViewKeyDown}>
              {/* Polite live region: selection counts, apply results, push
                  confirmations. */}
              <div aria-live="polite" style={styles.srOnly}>
                {state.announce}
              </div>
              {isRail ? (
                <RoomRackTree
                  collapsed
                  activeRoomId={state.activeRoomId}
                  expandedRooms={expandedRooms}
                  activeRackId={activeRackId}
                  rackAggs={derived.rackAggs}
                  roomAUnsynced={unsyncedRackCount > 0}
                  onToggleRoom={roomId =>
                    setExpandedRooms(prev => {
                      const next = new Set(prev);
                      if (next.has(roomId)) next.delete(roomId);
                      else next.add(roomId);
                      return next;
                    })
                  }
                  onSelectRoom={setRoom}
                  onRackClick={focusRack}
                />
              ) : (
                <div style={styles.treeCol}>
                  <RoomRackTree
                    collapsed={false}
                    activeRoomId={state.activeRoomId}
                    expandedRooms={expandedRooms}
                    activeRackId={activeRackId}
                    rackAggs={derived.rackAggs}
                    roomAUnsynced={unsyncedRackCount > 0}
                    onToggleRoom={roomId =>
                      setExpandedRooms(prev => {
                        const next = new Set(prev);
                        if (next.has(roomId)) next.delete(roomId);
                        else next.add(roomId);
                        return next;
                      })
                    }
                    onSelectRoom={setRoom}
                    onRackClick={focusRack}
                  />
                  {/* Bottom-left corner owner: controller sync line. */}
                  <div style={styles.treeFooter}>
                    {unsyncedRackCount > 0 ? (
                      <>
                        <span style={styles.unsyncedDot} aria-hidden />
                        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                          {unsyncedRackCount} rack{unsyncedRackCount === 1 ? '' : 's'} unsynced ·
                          staged {STAGED_AT}
                        </Text>
                      </>
                    ) : (
                      <Text type="supporting" size="xsm" color="secondary">
                        All racks in sync
                      </Text>
                    )}
                  </div>
                </div>
              )}
              <div ref={mainRef} style={styles.mainCol}>
                <div style={styles.toolbar} role="toolbar" aria-label="Tier filters">
                  <Token
                    size="sm"
                    color={filter === 'all' ? 'blue' : 'gray'}
                    label="All tiers · 46"
                    onClick={() => setFilter('all')}
                  />
                  <Token
                    size="sm"
                    color={filter === 'warnings' ? 'blue' : 'gray'}
                    label={\`Warnings · \${derived.warningCount}\`}
                    onClick={() => setFilter('warnings')}
                  />
                  <span style={{flex: 1}} aria-hidden />
                  {selectionCount > 0 ? (
                    <>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {selectionCount} selected
                      </Text>
                      <Token size="sm" color="gray" label="Clear" onClick={clearSelection} />
                    </>
                  ) : null}
                  {isAsideDropped && !isRoomB ? (
                    <Button
                      label="Recipes"
                      variant="secondary"
                      size="sm"
                      icon={<Icon icon={SlidersHorizontalIcon} size="sm" />}
                      onClick={() => setIsRecipesOpen(true)}
                    />
                  ) : null}
                </div>
                <div style={styles.canvas}>
                  {isRoomB ? (
                    <div style={{padding: GUTTER * 2}}>
                      <Text type="label" size="sm">
                        Grow Room B is commissioning
                      </Text>
                      <Text type="supporting" size="xsm" color="secondary">
                        Racks B1 and B2 report to the tree only — tier telemetry lands when
                        controller CTL-B goes live on Jul 8.
                      </Text>
                    </div>
                  ) : (
                    RACKS.map(rack => {
                      const agg = derived.rackAggs.find(a => a.rack.id === rack.id);
                      const rackTiers = visibleTiers.filter(t => t.rackId === rack.id);
                      if (filter === 'warnings' && rackTiers.length === 0) return null;
                      return (
                        <section
                          key={rack.id}
                          ref={el => {
                            if (el != null) sectionRefs.current.set(rack.id, el);
                            else sectionRefs.current.delete(rack.id);
                          }}
                          aria-label={\`\${rack.name} — \${rack.blurb}\`}>
                          <div style={styles.rackHeader}>
                            <Text type="label" size="sm">
                              {rack.name}
                            </Text>
                            <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                              {rack.blurb}
                            </Text>
                            {rack.offline ? (
                              <Tooltip content={rack.offlineReason ?? 'Controller offline'}>
                                <span
                                  style={{display: 'inline-flex', alignItems: 'center', gap: 4, color: WARN_TEXT}}>
                                  <Icon icon={WifiOffIcon} size="xsm" color="inherit" />
                                  <Text type="supporting" size="xsm" color="inherit">
                                    offline
                                  </Text>
                                </span>
                              </Tooltip>
                            ) : null}
                            <span style={{flex: 1}} aria-hidden />
                            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                              {agg?.occupancy} tiers
                            </Text>
                            <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                              {agg?.kwhDisplay} kWh/day
                            </Text>
                          </div>
                          <div role="grid" aria-label={\`\${rack.name} tiers\`}>
                            {rackTiers.map(t => (
                              <TierConditionRow
                                key={t.id}
                                tier={t}
                                recipe={t.recipeId != null ? RECIPES[t.recipeId] : undefined}
                                selected={state.selection.has(t.id)}
                                staged={derived.stagedSet.has(t.id)}
                                stale={rack.offline === true}
                                staleReason={rack.offlineReason}
                                band={band}
                                noteOpen={noteOpenId === t.id}
                                tabbable={focusTierId === t.id}
                                onSelect={toggleTier}
                                onRowKeyDown={onRowKeyDown}
                                rowRef={el => {
                                  if (el != null) rowRefs.current.set(t.id, el);
                                  else rowRefs.current.delete(t.id);
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })
                  )}
                </div>
              </div>
              {!isAsideDropped && !isRoomB ? (
                <div style={{...styles.aside, width: isAside320 ? 320 : 360}}>
                  <div style={styles.asideHeader}>
                    <Text type="label" size="sm">
                      Light recipes
                    </Text>
                    <span style={{flex: 1}} aria-hidden />
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                      {RECIPE_ORDER.length} staged profiles
                    </Text>
                  </div>
                  {recipePanel}
                </div>
              ) : null}
            </div>
            {isAsideDropped ? (
              <Dialog
                isOpen={isRecipesOpen}
                onOpenChange={open => setIsRecipesOpen(open)}
                purpose="form"
                width="min(420px, 94vw)">
                <div style={styles.dialogBody}>
                  <DialogHeader
                    title="Light recipes"
                    subtitle={\`\${selectionCount} tier\${selectionCount === 1 ? '' : 's'} selected\`}
                    onOpenChange={open => setIsRecipesOpen(open)}
                  />
                  {recipePanel}
                </div>
              </Dialog>
            ) : null}
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};