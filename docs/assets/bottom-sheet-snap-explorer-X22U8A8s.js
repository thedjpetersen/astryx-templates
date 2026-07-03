var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file bottom-sheet-snap-explorer.tsx
 * @input Deterministic fixtures only: a stylized "Fern Hollow" neighborhood
 *   map (street grid, city blocks, a park with a millpond, one diagonal
 *   avenue — all fixed SVG coordinates) and 12 place records (id, name,
 *   category, rating, review count, price, address, one-line blurb,
 *   open-until string, marker x/y). No Date construction, no randomness,
 *   no network assets — identical fixtures always render identical pixels.
 * @output Snap-Point Bottom Sheet Explorer — a mobile-first place explorer.
 *   The SVG map fills the stage; a draggable bottom sheet rides over it
 *   with three snap points: peek (grab handle + live result count), half
 *   (result cards visible, list pinned), and full (search input + filter
 *   chips + a scrolling list). The sheet tracks the pointer 1:1 during a
 *   drag and, on release, animates to the snap point chosen by a
 *   velocity-aware rule — a fast downward flick from full skips half and
 *   lands at peek. Selecting a card pins a highlighted marker, drops the
 *   sheet to half with the chosen card promoted to the top, and dims the
 *   map proportionally to the sheet's current height. On desktop widths the
 *   same explorer degrades into a fixed left panel beside the map.
 * @position Page template; emitted by \`astryx template bottom-sheet-snap-explorer\`.
 *
 * Frame: Layout height="fill". LayoutHeader carries the neighborhood title
 * and the live result count. <=900px the content is a single stage —
 * position:relative map + dim overlay + absolutely positioned sheet
 * translated by translateY. >900px a LayoutPanel start 360 holds the
 * search/chips/list column and LayoutContent is all map.
 *
 * Interaction contract (the exhibit is the sheet physics):
 * - Pointer path: pointerdown on the sheet header (or anywhere on the card
 *   region while below full) arms a 6px movement gate; crossing it captures
 *   the pointer and the sheet follows clientY 1:1, clamped between the full
 *   and peek translates. Release computes velocity from the last ~120ms of
 *   move samples: |v| >= 0.45 px/ms flings to the next snap in the flick
 *   direction, v >= 1.2 px/ms downward from full skips half entirely, and
 *   anything slower settles on the nearest snap. The settle is a single CSS
 *   transform transition (cubic-bezier(0.32, 0.72, 0, 1)); while dragging
 *   the transition is disabled so tracking stays 1:1.
 * - Drag-versus-scroll handoff: the inner list only scrolls at full. At
 *   full, a pointerdown on the list arms the same gate but only converts to
 *   a sheet drag when the list's scrollTop === 0 AND the pointer moves
 *   downward — exactly the native-sheet boundary rule. Upward movement (or
 *   any movement while scrolled) stays a scroll. Below full the list is
 *   overflow:hidden and the whole card region is a drag surface.
 * - Keyboard path (identical commit logic): the grab handle is a real
 *   <button>. ArrowUp/ArrowRight expand one snap, ArrowDown/ArrowLeft
 *   collapse one snap, Home jumps to full, End to peek; a plain tap/click
 *   cycles peek → half → full → half. Every snap commit — pointer, key, or
 *   tap — funnels through the same commitSnap() and is announced via a
 *   visually hidden aria-live region.
 * - Selection: tapping a result card OR its map marker (markers are
 *   focusable role="button" nodes with Enter/Space handlers) pins the
 *   marker (accent fill + pulse ring), promotes the card to the top of the
 *   list, and drops the sheet to half so the map shows the pin. A pinned
 *   row above the list carries the Unpin control.
 * - Search + chips (full snap / desktop panel): TextInput filters by name,
 *   category, or blurb; category chips filter; a "Top rated" chip re-sorts
 *   by rating. The peek count, half list, and map markers all re-derive
 *   from the same filtered set, so the peek label is always honest.
 * - Map dim: overlay opacity is a pure function of the sheet's current
 *   visible height (drag position included), so dragging visibly mixes the
 *   map in and out.
 *
 * Responsive contract:
 * - <=900px (sheet mode, usable at 375px): single-pane stage; the sheet is
 *   the only chrome over the map. Grab handle button is a full-width ~44px
 *   strip; chips are >=40px tall in a deliberate horizontal scroller (the
 *   only overflowX on the page); cards are full-width buttons well above
 *   40px. No hover-only interactions anywhere — markers, cards, chips, and
 *   the handle are all tap targets.
 * - >900px: LayoutPanel start 360 with the always-expanded search + chips +
 *   scrolling list; the map fills the remaining width; the dim overlay and
 *   sheet mechanics are absent (selection still pins markers).
 * - The map SVG uses preserveAspectRatio slice so it crops instead of
 *   letterboxing at any stage aspect.
 * - Reduced motion: the sheet jumps between snaps with no easing (the
 *   transition is dropped, not just shortened), the dim overlay snaps, and
 *   the marker pulse keyframes are wrapped in
 *   @media (prefers-reduced-motion: no-preference).
 *
 * Container policy (explorer archetype): frame-first — the list column is
 * bespoke card buttons (whole card is the tap target, so no nested
 * controls), chips and the grab handle are hand-rolled buttons in the repo
 * style-object idiom, and the map is inline SVG over fixed fixture
 * coordinates. Astryx supplies the chrome: Layout, LayoutHeader,
 * LayoutPanel, TextInput, Badge, Button, IconButton, EmptyState, Divider.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark(light, dark) pair
 * (the map palette, sheet shadow, and dim overlay below are all
 * light-dark pairs), so the surface survives the demo's dark toggle.
 * Fixture policy: fixed data only — fixed ratings, fixed coordinates,
 * fixed "open until" strings; no clocks, no randomness.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {MapPinIcon, SearchIcon, StarIcon, XIcon} from 'lucide-react';

// ---------------------------------------------------------------------------
// MAP PALETTE — every entry is an explicit light-dark() pair (dark-mode gate).
// ---------------------------------------------------------------------------

const MAP_COLORS = {
  /** Street/base ground the blocks sit on. */
  street: 'light-dark(#F1EDE4, #1C1F24)',
  /** City blocks. */
  block: 'light-dark(#E2DCCF, #2A2E35)',
  /** Block edge stroke. */
  blockEdge: 'light-dark(#D6CFC0, #343941)',
  /** Park fill. */
  park: 'light-dark(#CBE2BE, #24382B)',
  /** Tree canopies inside the park. */
  tree: 'light-dark(#AFD29C, #2F4A36)',
  /** Millpond water. */
  water: 'light-dark(#B9D9EC, #1F3547)',
  /** Dashed centerline on the diagonal avenue. */
  laneDash: 'light-dark(#C9C2B2, #3E434C)',
  /** Marker outline ring. */
  markerRing: 'light-dark(#FFFFFF, #1B1E23)',
  /** Selected-marker label text + halo. */
  label: 'light-dark(#33383F, #D9DDE2)',
  labelHalo: 'light-dark(#F1EDE4, #1C1F24)',
} as const;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // --- stage (sheet mode): map underneath, dim overlay, sheet on top ---
  stage: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  mapFill: {
    position: 'absolute',
    inset: 0,
  },
  mapSvg: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  // Dim overlay: opacity is driven inline from the sheet's live height so a
  // drag visibly mixes the map out. pointerEvents none keeps markers
  // tappable through it. The color is a light-dark pair; opacity does the
  // proportional work.
  dimOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'light-dark(#1E293B, #000000)',
    pointerEvents: 'none',
  },
  // --- the sheet itself ---
  sheet: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-background-surface)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    border: '1px solid var(--color-border)',
    borderBottom: 'none',
    boxShadow:
      '0 -10px 30px light-dark(rgba(30, 41, 59, 0.22), rgba(0, 0, 0, 0.55))',
    boxSizing: 'border-box',
    willChange: 'transform',
  },
  // Header region: grab handle + peek summary. Always a drag surface, so
  // touch-action none here (the button inside stays a real click target).
  sheetHeader: {
    flexShrink: 0,
    touchAction: 'none',
    cursor: 'grab',
  },
  handleButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    minHeight: 44,
    margin: 0,
    padding: 'var(--spacing-2) var(--spacing-4) var(--spacing-1)',
    border: 'none',
    backgroundColor: 'transparent',
    color: 'inherit',
    font: 'inherit',
    cursor: 'grab',
    touchAction: 'none',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  handlePill: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor:
      'color-mix(in srgb, var(--color-text-secondary) 45%, transparent)',
  },
  peekSummary: {
    padding: '0 var(--spacing-4) var(--spacing-3)',
  },
  // Search + chips block (rendered at the full snap only; desktop panel
  // renders it always).
  searchBlock: {
    flexShrink: 0,
    padding: '0 var(--spacing-4) var(--spacing-2)',
  },
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 2,
  },
  chip: {
    flexShrink: 0,
    minHeight: 40,
    margin: 0,
    border: '1px solid var(--color-border)',
    borderRadius: 999,
    padding: '0 var(--spacing-3)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    whiteSpace: 'nowrap',
  },
  chipSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    color: 'var(--color-accent)',
    fontWeight: 600,
  },
  chipDot: {
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    marginRight: 6,
    verticalAlign: 'baseline',
  },
  // The list region. Whether it scrolls (and whether it is a drag surface)
  // is decided inline from the current snap.
  listRegion: {
    flex: 1,
    minHeight: 0,
    padding: '0 var(--spacing-4) var(--spacing-4)',
    overscrollBehavior: 'contain',
    boxSizing: 'border-box',
  },
  pinnedRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 44,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent-muted)',
    padding: 'var(--spacing-1) var(--spacing-2) var(--spacing-1) var(--spacing-3)',
    boxSizing: 'border-box',
  },
  // Result cards: whole card is one <button> (no nested controls), so the
  // tap target is the full row.
  placeCard: {
    display: 'block',
    width: '100%',
    margin: 0,
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3)',
    textAlign: 'left',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    boxSizing: 'border-box',
  },
  placeCardSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  cardSpine: {
    width: 4,
    borderRadius: 2,
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  cardBody: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
  },
  ratingText: {
    color: 'var(--color-warning)',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
  // --- desktop panel ---
  panelScroll: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  panelTop: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
  },
  panelList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-4) var(--spacing-4)',
  },
  emptyWrap: {
    padding: 'var(--spacing-6) var(--spacing-2)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// Marker pulse ring — keyframes are guarded so reduced-motion users get a
// static ring instead of an animation.
const PULSE_CSS = \`
@media (prefers-reduced-motion: no-preference) {
  @keyframes bss-marker-pulse {
    0% { transform: scale(0.55); opacity: 0.85; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  .bss-marker-pulse {
    animation: bss-marker-pulse 1.6s ease-out infinite;
    transform-origin: center;
    transform-box: fill-box;
  }
}
\`;

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

type CategoryId = 'coffee' | 'food' | 'park' | 'shop' | 'culture';

interface PlaceCategory {
  id: CategoryId;
  label: string;
  /** Marker fill / card spine / chip dot — semantic icon token. */
  color: string;
}

const CATEGORIES: readonly PlaceCategory[] = [
  {id: 'coffee', label: 'Coffee', color: 'var(--color-icon-orange)'},
  {id: 'food', label: 'Food', color: 'var(--color-icon-red)'},
  {id: 'park', label: 'Parks', color: 'var(--color-icon-green)'},
  {id: 'shop', label: 'Shops', color: 'var(--color-icon-purple)'},
  {id: 'culture', label: 'Culture', color: 'var(--color-icon-blue)'},
];

const CATEGORY_BY_ID = new Map(CATEGORIES.map(cat => [cat.id, cat]));

interface Place {
  id: string;
  name: string;
  categoryId: CategoryId;
  /** Fixed fixture rating, one decimal. */
  rating: number;
  reviews: number;
  /** '€' | '€€' | '€€€' | 'Free'. */
  price: string;
  address: string;
  blurb: string;
  /** Fixed fixture string — never derived from a clock. */
  openUntil: string;
  /** Marker coordinates in the 400×520 map viewBox. */
  x: number;
  y: number;
}

// 12 fixed places. Fixture order is the "Curated" sort.
const PLACES: readonly Place[] = [
  {
    id: 'pl-marrow-rye',
    name: 'Marrow & Rye',
    categoryId: 'food',
    rating: 4.8,
    reviews: 214,
    price: '€€€',
    address: '88 Alder Row',
    blurb: 'Wood-fired bistro on the park’s south edge; the rye gnocchi is the order.',
    openUntil: 'Open until 23:00',
    x: 178,
    y: 342,
  },
  {
    id: 'pl-little-fern',
    name: 'Little Fern Coffee',
    categoryId: 'coffee',
    rating: 4.7,
    reviews: 389,
    price: '€',
    address: 'Corner of Alder & 2nd',
    blurb: 'Neighborhood roaster with a standing bar and a serious filter list.',
    openUntil: 'Open until 17:00',
    x: 64,
    y: 132,
  },
  {
    id: 'pl-fern-hollow-green',
    name: 'Fern Hollow Green',
    categoryId: 'park',
    rating: 4.9,
    reviews: 812,
    price: 'Free',
    address: 'Between 2nd & 3rd',
    blurb: 'The hollow itself — a broad lawn ringed by lindens, busiest at dusk.',
    openUntil: 'Open until 22:00',
    x: 246,
    y: 250,
  },
  {
    id: 'pl-brass-fig',
    name: 'The Brass Fig',
    categoryId: 'food',
    rating: 4.6,
    reviews: 301,
    price: '€€',
    address: '14 Depot Street',
    blurb: 'Small-plates counter; walk-ins only after 20:00.',
    openUntil: 'Open until 24:00',
    x: 300,
    y: 132,
  },
  {
    id: 'pl-millpond-loop',
    name: 'Millpond Loop',
    categoryId: 'park',
    rating: 4.6,
    reviews: 268,
    price: 'Free',
    address: 'West gate, Fern Hollow Green',
    blurb: 'A ten-minute boardwalk circle around the pond; herons most mornings.',
    openUntil: 'Open until 22:00',
    x: 156,
    y: 238,
  },
  {
    id: 'pl-stacks-stems',
    name: 'Stacks & Stems',
    categoryId: 'shop',
    rating: 4.7,
    reviews: 143,
    price: '€€',
    address: '5 Weaver Lane',
    blurb: 'Half bookshop, half plant shop; the back room is all field guides.',
    openUntil: 'Open until 19:00',
    x: 62,
    y: 296,
  },
  {
    id: 'pl-old-tram-depot',
    name: 'Old Tram Depot Museum',
    categoryId: 'culture',
    rating: 4.8,
    reviews: 233,
    price: '€€',
    address: '1 Depot Street',
    blurb: 'Restored carriage hall with the 1911 tram running on Sundays.',
    openUntil: 'Open until 18:00',
    x: 312,
    y: 58,
  },
  {
    id: 'pl-night-owl',
    name: 'Night Owl Ramen',
    categoryId: 'food',
    rating: 4.4,
    reviews: 522,
    price: '€€',
    address: '203 Kiln Road',
    blurb: 'Late bowls and a short menu; the queue moves faster than it looks.',
    openUntil: 'Open until 02:00',
    x: 366,
    y: 356,
  },
  {
    id: 'pl-hollow-grounds',
    name: 'Hollow Grounds',
    categoryId: 'coffee',
    rating: 4.5,
    reviews: 156,
    price: '€',
    address: '77 Kiln Road',
    blurb: 'Quiet back-block café with garden seating under the fig tree.',
    openUntil: 'Open until 16:00',
    x: 262,
    y: 452,
  },
  {
    id: 'pl-analog-attic',
    name: 'Analog Attic',
    categoryId: 'shop',
    rating: 4.3,
    reviews: 97,
    price: '€€',
    address: '31 Weaver Lane',
    blurb: 'Records upstairs, tape decks and repairs down; cash preferred.',
    openUntil: 'Open until 20:00',
    x: 140,
    y: 452,
  },
  {
    id: 'pl-hollow-works',
    name: 'Hollow Works Gallery',
    categoryId: 'culture',
    rating: 4.5,
    reviews: 121,
    price: '€',
    address: '9 Founders Walk',
    blurb: 'Rotating shows from the studio collective next door; free Thursdays.',
    openUntil: 'Open until 21:00',
    x: 52,
    y: 436,
  },
  {
    id: 'pl-corner-kiosk',
    name: 'Corner Kiosk Espresso',
    categoryId: 'coffee',
    rating: 4.2,
    reviews: 64,
    price: '€',
    address: 'Depot St & Kiln Rd',
    blurb: 'A hatch in the wall, four stools, and the fastest doppio in the hollow.',
    openUntil: 'Open until 15:00',
    x: 362,
    y: 214,
  },
];

// ---------------------------------------------------------------------------
// MAP FIXTURE — fixed geometry in a 400×520 viewBox. Streets read as the
// gaps between blocks; one diagonal avenue is drawn over the grid.
// ---------------------------------------------------------------------------

interface MapBlock {
  x: number;
  y: number;
  w: number;
  h: number;
}

const MAP_BLOCKS: readonly MapBlock[] = [
  // Row 1 (y 16–96) — the first column is split into two half-blocks.
  {x: 16, y: 16, w: 96, h: 34},
  {x: 16, y: 62, w: 96, h: 34},
  {x: 128, y: 16, w: 96, h: 80},
  {x: 240, y: 16, w: 96, h: 80},
  {x: 352, y: 16, w: 32, h: 80},
  // Row 2 (y 112–192).
  {x: 16, y: 112, w: 96, h: 80},
  {x: 128, y: 112, w: 96, h: 80},
  {x: 240, y: 112, w: 44, h: 80},
  {x: 296, y: 112, w: 40, h: 80},
  {x: 352, y: 112, w: 32, h: 80},
  // Row 3 (y 208–304) — columns 2–3 are the park, drawn separately.
  {x: 16, y: 208, w: 96, h: 96},
  {x: 352, y: 208, w: 32, h: 96},
  // Row 4 (y 320–400).
  {x: 16, y: 320, w: 96, h: 80},
  {x: 128, y: 320, w: 96, h: 36},
  {x: 128, y: 368, w: 96, h: 32},
  {x: 240, y: 320, w: 96, h: 80},
  {x: 352, y: 320, w: 32, h: 80},
  // Row 5 (y 416–504).
  {x: 16, y: 416, w: 96, h: 88},
  {x: 128, y: 416, w: 96, h: 88},
  {x: 240, y: 416, w: 96, h: 88},
  {x: 352, y: 416, w: 32, h: 88},
];

/** Park bounds (cols 2–3 of row 3) and its fixed tree canopies. */
const PARK = {x: 128, y: 208, w: 208, h: 96};
const PARK_TREES: readonly {cx: number; cy: number; r: number}[] = [
  {cx: 214, cy: 226, r: 9},
  {cx: 236, cy: 284, r: 11},
  {cx: 282, cy: 232, r: 8},
  {cx: 308, cy: 272, r: 10},
  {cx: 196, cy: 292, r: 7},
  {cx: 318, cy: 224, r: 6},
];
const POND = {cx: 168, cy: 248, rx: 30, ry: 20};

// ---------------------------------------------------------------------------
// SHEET GEOMETRY + SNAP PHYSICS (pure helpers, unit-testable)
// ---------------------------------------------------------------------------

const SNAPS = ['peek', 'half', 'full'] as const;
type Snap = (typeof SNAPS)[number];

/** Visible sheet height at the peek snap. */
const PEEK_HEIGHT = 96;
/** Map sliver kept visible above the sheet at the full snap. */
const TOP_INSET = 48;
/** Release speed (px/ms) that counts as a flick toward the next snap. */
const FLICK_VELOCITY = 0.45;
/** Downward speed (px/ms) from full that skips half and lands at peek. */
const SKIP_VELOCITY = 1.2;
/** Pointer travel (px) before a press converts into a sheet drag. */
const DRAG_SLOP = 6;

function visibleHeightFor(snap: Snap, stageHeight: number): number {
  switch (snap) {
    case 'peek':
      return PEEK_HEIGHT;
    case 'half':
      return Math.round(stageHeight * 0.48);
    case 'full':
      return Math.max(PEEK_HEIGHT, stageHeight - TOP_INSET);
  }
}

function translateFor(snap: Snap, stageHeight: number): number {
  return Math.max(0, stageHeight - visibleHeightFor(snap, stageHeight));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Velocity-aware snap choice. velocity is px/ms, positive = downward.
 * - A flick picks the next snap in the flick direction from the release
 *   position; a fast downward flick that started at full skips to peek.
 * - Below the flick threshold, the nearest snap by distance wins.
 */
function chooseSnap(
  releaseTranslate: number,
  velocity: number,
  fromSnap: Snap,
  stageHeight: number,
): Snap {
  const positions = SNAPS.map(snap => ({
    snap,
    translate: translateFor(snap, stageHeight),
  }));
  if (Math.abs(velocity) >= FLICK_VELOCITY) {
    if (velocity > 0) {
      // Downward flick.
      if (fromSnap === 'full' && velocity >= SKIP_VELOCITY) {
        return 'peek';
      }
      const below = positions
        .filter(p => p.translate > releaseTranslate + 1)
        .sort((a, b) => a.translate - b.translate);
      return below.length > 0 ? below[0].snap : 'peek';
    }
    // Upward flick.
    const above = positions
      .filter(p => p.translate < releaseTranslate - 1)
      .sort((a, b) => b.translate - a.translate);
    return above.length > 0 ? above[0].snap : 'full';
  }
  return positions.reduce((best, p) =>
    Math.abs(p.translate - releaseTranslate) <
    Math.abs(best.translate - releaseTranslate)
      ? p
      : best,
  ).snap;
}

// ---------------------------------------------------------------------------
// SMALL PRESENTERS
// ---------------------------------------------------------------------------

function formatRating(place: Place): string {
  return \`\${place.rating.toFixed(1)} (\${place.reviews.toLocaleString('en-US')})\`;
}

// ---------------------------------------------------------------------------
// MAP
// ---------------------------------------------------------------------------

function NeighborhoodMap({
  places,
  selectedId,
  onSelectPlace,
}: {
  places: readonly Place[];
  selectedId: string | null;
  onSelectPlace: (id: string) => void;
}) {
  const selected = places.find(place => place.id === selectedId);
  return (
    <svg
      viewBox="0 0 400 520"
      preserveAspectRatio="xMidYMid slice"
      style={styles.mapSvg}
      role="img"
      aria-label={
        selected
          ? \`Fern Hollow map, \${selected.name} pinned\`
          : 'Fern Hollow neighborhood map'
      }>
      {/* Ground = street color; blocks drawn on top leave streets as gaps. */}
      <rect x={0} y={0} width={400} height={520} style={{fill: MAP_COLORS.street}} />
      {MAP_BLOCKS.map((block, index) => (
        <rect
          key={index}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx={5}
          style={{
            fill: MAP_COLORS.block,
            stroke: MAP_COLORS.blockEdge,
            strokeWidth: 1,
          }}
        />
      ))}
      {/* Fern Hollow Green: park, millpond, tree canopies. */}
      <rect
        x={PARK.x}
        y={PARK.y}
        width={PARK.w}
        height={PARK.h}
        rx={10}
        style={{fill: MAP_COLORS.park}}
      />
      <ellipse
        cx={POND.cx}
        cy={POND.cy}
        rx={POND.rx}
        ry={POND.ry}
        style={{fill: MAP_COLORS.water}}
      />
      {PARK_TREES.map((tree, index) => (
        <circle
          key={index}
          cx={tree.cx}
          cy={tree.cy}
          r={tree.r}
          style={{fill: MAP_COLORS.tree}}
        />
      ))}
      {/* Diagonal avenue over the grid, with a dashed centerline. */}
      <line
        x1={-8}
        y1={516}
        x2={408}
        y2={88}
        style={{stroke: MAP_COLORS.street, strokeWidth: 18}}
      />
      <line
        x1={-8}
        y1={516}
        x2={408}
        y2={88}
        style={{
          stroke: MAP_COLORS.laneDash,
          strokeWidth: 2,
          strokeDasharray: '8 7',
        }}
      />
      {/* Markers — focusable, keyboard-operable, selected one pulses. */}
      {places.map(place => {
        const category = CATEGORY_BY_ID.get(place.categoryId);
        const isSelected = place.id === selectedId;
        return (
          <g
            key={place.id}
            role="button"
            tabIndex={0}
            aria-label={\`\${place.name}, \${category?.label ?? ''}, rated \${place.rating.toFixed(1)}\${isSelected ? ', pinned' : ''}\`}
            style={{cursor: 'pointer', outlineOffset: 4}}
            onClick={() => onSelectPlace(place.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelectPlace(place.id);
              }
            }}>
            {/* Oversized transparent hit area keeps the tap target usable. */}
            <circle cx={place.x} cy={place.y} r={20} fill="transparent" />
            {isSelected ? (
              <circle
                className="bss-marker-pulse"
                cx={place.x}
                cy={place.y}
                r={12}
                fill="none"
                style={{stroke: 'var(--color-accent)', strokeWidth: 3}}
              />
            ) : null}
            <circle
              cx={place.x}
              cy={place.y}
              r={isSelected ? 9 : 6.5}
              style={{
                fill: isSelected ? 'var(--color-accent)' : (category?.color ?? 'var(--color-neutral)'),
                stroke: MAP_COLORS.markerRing,
                strokeWidth: 2,
              }}
            />
            {isSelected ? (
              <text
                x={place.x}
                y={place.y - 16}
                textAnchor="middle"
                fontSize={12}
                fontWeight={700}
                style={{
                  fill: MAP_COLORS.label,
                  stroke: MAP_COLORS.labelHalo,
                  strokeWidth: 3,
                  paintOrder: 'stroke',
                }}>
                {place.name}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RESULT CARD (whole card is one button — no nested controls)
// ---------------------------------------------------------------------------

function PlaceCard({
  place,
  isSelected,
  onSelect,
}: {
  place: Place;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const category = CATEGORY_BY_ID.get(place.categoryId);
  return (
    <button
      type="button"
      style={{
        ...styles.placeCard,
        ...(isSelected ? styles.placeCardSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={\`\${place.name}, \${category?.label ?? ''}, rated \${place.rating.toFixed(1)} from \${place.reviews} reviews\${isSelected ? ', pinned on the map' : ''}\`}
      onClick={() => onSelect(place.id)}>
      <div style={styles.cardBody}>
        <span
          style={{...styles.cardSpine, backgroundColor: category?.color}}
          aria-hidden="true"
        />
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="body" maxLines={1}>
                  {place.name}
                </Text>
              </StackItem>
              {isSelected ? <Badge variant="info" label="Pinned" /> : null}
            </HStack>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <span style={styles.ratingText}>★ {formatRating(place)}</span>
              <Text type="supporting" color="secondary">
                {category?.label} · {place.price}
              </Text>
              <Text type="supporting" color="secondary">
                {place.openUntil}
              </Text>
            </HStack>
            <Text type="supporting" color="secondary" maxLines={2}>
              {place.blurb} — {place.address}
            </Text>
          </VStack>
        </StackItem>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// SEARCH + FILTER CHIPS (shared by the full-snap sheet and desktop panel)
// ---------------------------------------------------------------------------

function SearchAndChips({
  query,
  onQueryChange,
  categoryFilter,
  onCategoryChange,
  isTopRated,
  onToggleTopRated,
}: {
  query: string;
  onQueryChange: (next: string) => void;
  categoryFilter: CategoryId | 'all';
  onCategoryChange: (next: CategoryId | 'all') => void;
  isTopRated: boolean;
  onToggleTopRated: () => void;
}) {
  return (
    <VStack gap={2}>
      <TextInput
        label="Search places"
        isLabelHidden
        size="sm"
        placeholder="Search Fern Hollow..."
        startIcon={<Icon icon={SearchIcon} size="sm" />}
        value={query}
        onChange={onQueryChange}
        hasClear
        width="100%"
      />
      {/* Deliberate horizontal scroller — the only overflowX on the page. */}
      <div style={styles.chipRow} role="group" aria-label="Filter places">
        <button
          type="button"
          style={{
            ...styles.chip,
            ...(categoryFilter === 'all' ? styles.chipSelected : undefined),
          }}
          aria-pressed={categoryFilter === 'all'}
          onClick={() => onCategoryChange('all')}>
          All
        </button>
        {CATEGORIES.map(category => (
          <button
            key={category.id}
            type="button"
            style={{
              ...styles.chip,
              ...(categoryFilter === category.id
                ? styles.chipSelected
                : undefined),
            }}
            aria-pressed={categoryFilter === category.id}
            onClick={() =>
              onCategoryChange(
                categoryFilter === category.id ? 'all' : category.id,
              )
            }>
            <span
              style={{...styles.chipDot, backgroundColor: category.color}}
              aria-hidden="true"
            />
            {category.label}
          </button>
        ))}
        <button
          type="button"
          style={{
            ...styles.chip,
            ...(isTopRated ? styles.chipSelected : undefined),
          }}
          aria-pressed={isTopRated}
          onClick={onToggleTopRated}>
          ★ Top rated
        </button>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface DragState {
  pointerId: number;
  startY: number;
  startTranslate: number;
  fromSnap: Snap;
  /** Recent move samples for the release-velocity window. */
  samples: {y: number; t: number}[];
}

interface PendingPress {
  pointerId: number;
  startY: number;
  source: 'handle' | 'body' | 'list';
}

export default function BottomSheetSnapExplorerTemplate() {
  // ---- filters + selection ----
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | 'all'>(
    'all',
  );
  const [isTopRated, setIsTopRated] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  // ---- sheet state ----
  const [snap, setSnap] = useState<Snap>('half');
  const [stageHeight, setStageHeight] = useState(640);
  /** Non-null only while a pointer drag is moving the sheet 1:1. */
  const [dragTranslate, setDragTranslate] = useState<number | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const pendingRef = useRef<PendingPress | null>(null);
  /** True right after a drag ended, so the trailing click is swallowed. */
  const justDraggedRef = useRef(false);

  // <=900px: sheet over map. >900px: fixed left panel beside the map.
  const isSheetMode = useMediaQuery('(max-width: 900px)');
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  // Measure the stage so snap translates track the real viewport.
  useLayoutEffect(() => {
    if (!isSheetMode) {
      return;
    }
    const stage = stageRef.current;
    if (!stage) {
      return;
    }
    const measure = () => {
      setStageHeight(Math.max(240, stage.clientHeight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [isSheetMode]);

  // ---- derived list ----
  const filteredPlaces = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = PLACES.filter(place => {
      if (categoryFilter !== 'all' && place.categoryId !== categoryFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      const category = CATEGORY_BY_ID.get(place.categoryId);
      return \`\${place.name} \${category?.label ?? ''} \${place.blurb} \${place.address}\`
        .toLowerCase()
        .includes(needle);
    });
    if (isTopRated) {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [query, categoryFilter, isTopRated]);

  const selectedPlace = useMemo(
    () => PLACES.find(place => place.id === selectedId) ?? null,
    [selectedId],
  );

  // Promote the pinned card to the top of the list.
  const orderedPlaces = useMemo(() => {
    if (selectedId === null) {
      return filteredPlaces;
    }
    const selected = filteredPlaces.find(place => place.id === selectedId);
    if (!selected) {
      return filteredPlaces;
    }
    return [selected, ...filteredPlaces.filter(p => p.id !== selectedId)];
  }, [filteredPlaces, selectedId]);

  const resultLabel = \`\${filteredPlaces.length} \${
    filteredPlaces.length === 1 ? 'place' : 'places'
  }\${
    categoryFilter === 'all'
      ? ''
      : \` · \${CATEGORY_BY_ID.get(categoryFilter)?.label ?? ''}\`
  }\`;

  // ---- snap commits (shared by pointer, keys, and taps) ----
  const snapAnnouncement = useCallback(
    (target: Snap, count: number): string => {
      switch (target) {
        case 'peek':
          return \`Sheet collapsed to peek. \${count} places nearby — drag or press arrow up to expand.\`;
        case 'half':
          return \`Sheet at half height. \${count} result cards visible; expand to full to search and filter.\`;
        case 'full':
          return \`Sheet expanded to full. Search and filters available; the list scrolls.\`;
      }
    },
    [],
  );

  const commitSnap = useCallback(
    (target: Snap) => {
      setSnap(target);
      setAnnouncement(snapAnnouncement(target, filteredPlaces.length));
    },
    [snapAnnouncement, filteredPlaces.length],
  );

  // Leaving full always parks the list back at the top so the half snap
  // shows the (possibly promoted) first card.
  useEffect(() => {
    if (snap !== 'full' && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [snap]);

  // ---- selection (card, marker, and unpin all land here) ----
  const selectPlace = useCallback(
    (id: string) => {
      if (justDraggedRef.current) {
        // A sheet drag ended on this element — not a real tap.
        justDraggedRef.current = false;
        return;
      }
      const place = PLACES.find(p => p.id === id);
      if (!place) {
        return;
      }
      setSelectedId(id);
      if (isSheetMode) {
        // Drop to half so the pinned marker is visible above the sheet.
        setSnap('half');
      }
      setAnnouncement(
        \`Pinned \${place.name}, rated \${place.rating.toFixed(1)}. \${
          isSheetMode ? 'Sheet at half height; card promoted to the top.' : 'Card promoted to the top of the list.'
        }\`,
      );
    },
    [isSheetMode],
  );

  const clearPin = useCallback(() => {
    if (selectedPlace) {
      setAnnouncement(\`Unpinned \${selectedPlace.name}.\`);
    }
    setSelectedId(null);
  }, [selectedPlace]);

  // ---- sheet geometry for this render ----
  const peekTranslate = translateFor('peek', stageHeight);
  const fullTranslate = translateFor('full', stageHeight);
  const currentTranslate = dragTranslate ?? translateFor(snap, stageHeight);
  const visibleHeight = stageHeight - currentTranslate;
  const expandFraction = clamp(
    (visibleHeight - PEEK_HEIGHT) /
      Math.max(1, visibleHeightFor('full', stageHeight) - PEEK_HEIGHT),
    0,
    1,
  );

  // ---- pointer plumbing ----
  const beginDrag = useCallback(
    (element: HTMLElement, pointerId: number, y: number, timeStamp: number) => {
      element.setPointerCapture(pointerId);
      dragRef.current = {
        pointerId,
        startY: y,
        startTranslate: dragTranslate ?? translateFor(snap, stageHeight),
        fromSnap: snap,
        samples: [{y, t: timeStamp}],
      };
      setDragTranslate(dragRef.current.startTranslate);
    },
    [dragTranslate, snap, stageHeight],
  );

  const onSheetPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>, source: PendingPress['source']) => {
      if (dragRef.current !== null) {
        return;
      }
      justDraggedRef.current = false;
      pendingRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        source,
      };
    },
    [],
  );

  const onSheetPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const drag = dragRef.current;
      if (drag && drag.pointerId === event.pointerId) {
        const next = clamp(
          drag.startTranslate + (event.clientY - drag.startY),
          fullTranslate,
          peekTranslate,
        );
        drag.samples.push({y: event.clientY, t: event.timeStamp});
        if (drag.samples.length > 8) {
          drag.samples.shift();
        }
        setDragTranslate(next);
        return;
      }
      const pending = pendingRef.current;
      if (!pending || pending.pointerId !== event.pointerId) {
        return;
      }
      const dy = event.clientY - pending.startY;
      if (pending.source === 'list') {
        // Drag-versus-scroll handoff: only convert to a sheet drag when the
        // list sits at its very top AND the pointer is moving downward —
        // the native-sheet scrollTop === 0 boundary rule.
        const list = listRef.current;
        if (
          snap === 'full' &&
          list &&
          list.scrollTop <= 0 &&
          dy > DRAG_SLOP
        ) {
          pendingRef.current = null;
          beginDrag(
            event.currentTarget,
            event.pointerId,
            event.clientY,
            event.timeStamp,
          );
        }
        return;
      }
      if (Math.abs(dy) > DRAG_SLOP) {
        pendingRef.current = null;
        beginDrag(
          event.currentTarget,
          event.pointerId,
          event.clientY,
          event.timeStamp,
        );
      }
    },
    [beginDrag, fullTranslate, peekTranslate, snap],
  );

  const settleDrag = useCallback(
    (event: ReactPointerEvent<HTMLElement>, isCancel: boolean) => {
      pendingRef.current = null;
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) {
        return;
      }
      dragRef.current = null;
      const releaseTranslate = clamp(
        drag.startTranslate + (event.clientY - drag.startY),
        fullTranslate,
        peekTranslate,
      );
      // Velocity over the trailing ~120ms window (px/ms, + = downward).
      let velocity = 0;
      if (!isCancel && drag.samples.length >= 2) {
        const last = drag.samples[drag.samples.length - 1];
        const windowStart = drag.samples.find(s => last.t - s.t <= 120) ??
          drag.samples[0];
        const dt = last.t - windowStart.t;
        velocity = dt > 0 ? (last.y - windowStart.y) / dt : 0;
      }
      const target = chooseSnap(
        releaseTranslate,
        velocity,
        drag.fromSnap,
        stageHeight,
      );
      justDraggedRef.current =
        Math.abs(event.clientY - drag.startY) > DRAG_SLOP;
      setDragTranslate(null);
      commitSnap(target);
    },
    [commitSnap, fullTranslate, peekTranslate, stageHeight],
  );

  // ---- keyboard + tap path on the grab handle ----
  const onHandleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      const index = SNAPS.indexOf(snap);
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
        event.preventDefault();
        commitSnap(SNAPS[Math.min(SNAPS.length - 1, index + 1)]);
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
        event.preventDefault();
        commitSnap(SNAPS[Math.max(0, index - 1)]);
      } else if (event.key === 'Home') {
        event.preventDefault();
        commitSnap('full');
      } else if (event.key === 'End') {
        event.preventDefault();
        commitSnap('peek');
      }
    },
    [snap, commitSnap],
  );

  const onHandleClick = useCallback(() => {
    if (justDraggedRef.current) {
      justDraggedRef.current = false;
      return;
    }
    // Tap cycles: peek → half → full → half.
    commitSnap(snap === 'peek' ? 'half' : snap === 'half' ? 'full' : 'half');
  }, [snap, commitSnap]);

  // ---- shared list column (sheet body + desktop panel) ----
  const pinnedRow =
    selectedPlace !== null ? (
      <div style={styles.pinnedRow}>
        <Icon icon={MapPinIcon} size="sm" color="accent" />
        <StackItem size="fill">
          <Text type="label" maxLines={1}>
            Pinned: {selectedPlace.name}
          </Text>
        </StackItem>
        <IconButton
          label={\`Unpin \${selectedPlace.name}\`}
          icon={<Icon icon={XIcon} size="sm" />}
          variant="ghost"
          size="sm"
          onClick={clearPin}
        />
      </div>
    ) : null;

  const cardList = (
    <VStack gap={2}>
      {pinnedRow}
      {orderedPlaces.length === 0 ? (
        <div style={styles.emptyWrap}>
          <EmptyState
            isCompact
            icon={<Icon icon={SearchIcon} size="lg" />}
            title="No places match"
            description="Try a different search or clear the category filter."
            actions={
              <Button
                label="Clear filters"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setCategoryFilter('all');
                  setAnnouncement(
                    \`Filters cleared. \${PLACES.length} places nearby.\`,
                  );
                }}
              />
            }
          />
        </div>
      ) : (
        orderedPlaces.map(place => (
          <PlaceCard
            key={place.id}
            place={place}
            isSelected={place.id === selectedId}
            onSelect={selectPlace}
          />
        ))
      )}
    </VStack>
  );

  const searchAndChips = (
    <SearchAndChips
      query={query}
      onQueryChange={next => {
        setQuery(next);
      }}
      categoryFilter={categoryFilter}
      onCategoryChange={next => {
        setCategoryFilter(next);
        const label =
          next === 'all' ? 'All places' : (CATEGORY_BY_ID.get(next)?.label ?? '');
        setAnnouncement(\`Filter: \${label}.\`);
      }}
      isTopRated={isTopRated}
      onToggleTopRated={() => {
        // Announce from current state — never inside a state updater
        // (updaters may re-run and must stay side-effect free).
        setAnnouncement(
          isTopRated ? 'Sorted by curated order.' : 'Sorted by top rating.',
        );
        setIsTopRated(prev => !prev);
      }}
    />
  );

  const map = (
    <NeighborhoodMap
      places={PLACES}
      selectedId={selectedId}
      onSelectPlace={selectPlace}
    />
  );

  // ---- sheet-mode stage ----
  const isDragging = dragTranslate !== null;
  const sheetTransition =
    isDragging || prefersReducedMotion
      ? 'none'
      : 'transform 320ms cubic-bezier(0.32, 0.72, 0, 1)';
  const dimTransition =
    isDragging || prefersReducedMotion ? 'none' : 'opacity 320ms ease';

  const sheetStage = (
    <div ref={stageRef} style={styles.stage}>
      <div style={styles.mapFill} aria-hidden={snap === 'full'}>
        {map}
      </div>
      {/* Dim proportional to the sheet's live height. */}
      <div
        style={{
          ...styles.dimOverlay,
          opacity: expandFraction * 0.45,
          transition: dimTransition,
        }}
        aria-hidden="true"
      />
      <section
        aria-label="Places sheet"
        style={{
          ...styles.sheet,
          transform: \`translateY(\${currentTranslate}px)\`,
          transition: sheetTransition,
          userSelect: isDragging ? 'none' : undefined,
        }}>
        {/* Header region: always a drag surface; the handle button inside
            is the keyboard + tap path through the same commit logic. */}
        <div
          style={styles.sheetHeader}
          onPointerDown={event => onSheetPointerDown(event, 'handle')}
          onPointerMove={onSheetPointerMove}
          onPointerUp={event => settleDrag(event, false)}
          onPointerCancel={event => settleDrag(event, true)}>
          <button
            type="button"
            style={styles.handleButton}
            aria-label={\`Places sheet, \${snap} position, \${resultLabel}. Arrow keys resize; Home expands fully; End collapses.\`}
            onKeyDown={onHandleKeyDown}
            onClick={onHandleClick}>
            <span style={styles.handlePill} aria-hidden="true" />
          </button>
          <div style={styles.peekSummary}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">{resultLabel} nearby</Text>
              </StackItem>
              <Text type="supporting" color="secondary">
                {snap === 'full'
                  ? 'Drag down for map'
                  : snap === 'half'
                    ? 'Drag up to search'
                    : 'Drag up for results'}
              </Text>
            </HStack>
          </div>
          <Divider />
        </div>
        {/* Search + chips exist at the full snap only (peek shows the
            count; half shows cards). Query state lives above, so the
            count stays honest while collapsed. */}
        {snap === 'full' ? (
          <div style={styles.searchBlock}>
            <VStack gap={2}>
              <div />
              {searchAndChips}
            </VStack>
          </div>
        ) : null}
        {/* List region: scrolls only at full; below full it is a drag
            surface so any touch moves the sheet. */}
        <div
          ref={listRef}
          style={{
            ...styles.listRegion,
            overflowY: snap === 'full' && !isDragging ? 'auto' : 'hidden',
            touchAction: snap === 'full' && !isDragging ? 'pan-y' : 'none',
            paddingTop: 'var(--spacing-2)',
          }}
          onPointerDown={event =>
            onSheetPointerDown(event, snap === 'full' ? 'list' : 'body')
          }
          onPointerMove={onSheetPointerMove}
          onPointerUp={event => settleDrag(event, false)}
          onPointerCancel={event => settleDrag(event, true)}>
          {cardList}
        </div>
      </section>
    </div>
  );

  // ---- desktop panel ----
  const desktopPanel = (
    <div style={styles.panelScroll}>
      <div style={styles.panelTop}>
        <VStack gap={2}>
          {searchAndChips}
          <Text type="supporting" color="secondary">
            {resultLabel} nearby
          </Text>
        </VStack>
      </div>
      <Divider />
      <div style={styles.panelList}>
        <VStack gap={2}>
          <div />
          {cardList}
        </VStack>
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={MapPinIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Fern Hollow</Heading>
                <Text type="supporting" color="secondary">
                  Neighborhood explorer
                </Text>
              </HStack>
            </StackItem>
            <HStack gap={2} vAlign="center">
              <Icon icon={StarIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {resultLabel}
              </Text>
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      start={
        !isSheetMode ? (
          <LayoutPanel width={360} padding={0} hasDivider label="Places">
            {desktopPanel}
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={0}>
          {/* Marker pulse keyframes, reduced-motion guarded. */}
          <style>{PULSE_CSS}</style>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {isSheetMode ? (
            sheetStage
          ) : (
            <div style={styles.stage}>
              <div style={styles.mapFill}>{map}</div>
            </div>
          )}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};