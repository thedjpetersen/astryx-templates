// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (Cairn Supply Co., a fictional
 *   outdoor-gear brand: 3 rotating promo-bar messages, a 3-column Shop
 *   mega-menu catalog with 5 links per column plus a featured collection
 *   cell, 3 large category tiles and 6 compact circle tiles with product
 *   counts, a seasonal split-collection banner, an End of Season sale hero
 *   whose countdown starts from a fixed 1d 09:26:40 budget, 2 offer cards
 *   with promo codes, an app-download panel with a deterministic hash-drawn
 *   QR block, and a 4-item incentives list; every piece of imagery is a
 *   two-color CSS gradient keyed by a deterministic name hash — no image
 *   assets, no Date.now, no randomness)
 * @output Storefront-landing showcase stacking four labeled zones: store
 *   navigation (promo top bar whose messages auto-rotate and page with
 *   prev/next IconButtons, a main nav whose Shop Button opens a working
 *   mega-menu Popover of category columns with gradient imagery cells, a
 *   mobile drawer toggle that opens the same catalog in a Dialog, and a
 *   cart Button with a live count Badge), category previews (3-up large
 *   category tile buttons, a 6-up circle-tile row, and a split
 *   seasonal-collection banner), promo sections (full-bleed sale hero with
 *   a ticking countdown and an add-to-cart promoted item that bumps the
 *   nav cart count, two offer Cards whose code chips copy to the clipboard
 *   and confirm with a Toast, and an app-download panel with store buttons
 *   and a QR reveal ToggleButton), and an incentives band switchable
 *   between a 4-up icon-row variant and a bordered inline-strip variant
 *   sized for PDP embedding
 * @position Page template; emitted by `astryx template storefront-promo-navigation`
 *
 * Frame: Layout height="fill" with LayoutContent padding 0 — the content is
 * one scroll container of stacked zones, each introduced by a numbered
 * eyebrow + Heading zone label. Zone 1 renders the live store chrome
 * (promo bar + nav row) inside a bordered showcase surface; the cart count
 * that zone 3's add-to-cart bumps lives there, so the zones are wired
 * together, not isolated screenshots. Choose this template over
 * storefront-browse when the surface is brand landing/merchandising
 * (navigation, promos, incentives), not a filterable product grid.
 *
 * Responsive contract:
 * - >760px: the nav row shows brand | Shop mega-menu trigger + link
 *   Buttons | search + cart; the mega menu opens as a Popover of three
 *   link columns plus a featured cell; offer cards and the app panel sit
 *   2-up; incentives run 4-up.
 * - <=760px: the nav links and mega-menu trigger collapse into a MenuIcon
 *   drawer toggle that opens the full catalog (nav links + all category
 *   columns) in a Dialog — same links, tap-first; search collapses to an
 *   IconButton. Category tiles, offer cards, and incentives reflow via
 *   Grid minWidth (3-up -> 2-up -> 1-up at 375px).
 * - <=640px: the sale hero drops to a smaller display Heading and its
 *   countdown chips wrap; the seasonal split banner and app panel stack
 *   vertically; the inline incentives strip wraps its items instead of
 *   overflowing. Nothing on the page scrolls sideways.
 * - Touch targets: promo-bar pagers, nav links, category tiles (whole
 *   tile is a button), circle tiles (64px), code-copy chips, and drawer
 *   rows all sit at or above ~40px. Every disclosure (mega menu, drawer)
 *   opens on tap/click and closes on Escape with focus return via
 *   Popover/Dialog — nothing is hover-only.
 *
 * Container policy (marketing-storefront showcase archetype): frame-first
 * chrome with custom gradient tiles for merchandising art; Cards for the
 * offer pair; Popover for the mega menu and Dialog for the mobile drawer;
 * Toasts confirm copy/add actions so cause and effect stay visible.
 *
 * Color policy: token-first with documented scheme-locked brand surfaces.
 * The dark-pine promo bar, the sale hero's brand gradient, the tile scrim,
 * the hash-keyed merchandising gradient art (GRADIENT_PAIRS, phone tile),
 * and all text/strokes sitting on those surfaces are deliberate brand art
 * that stays identical in both schemes — each locks colorScheme: 'dark' in
 * its style and keeps color literals so contrast never flips. The QR block
 * is scannable "print paper": locked white via colorScheme: 'light' with
 * literal dark cells. Everything else (page chrome, nav row, brand mark,
 * cards, phone-screen tint) uses var(--color-*) tokens or light-dark()
 * pairs and adapts to the demo's System/Light/Dark toggle.
 */

import {useEffect, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowRightIcon,
  BikeIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CompassIcon,
  CopyIcon,
  FootprintsIcon,
  HeadphonesIcon,
  MenuIcon,
  MountainSnowIcon,
  QrCodeIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShoppingCartIcon,
  SmartphoneIcon,
  SnowflakeIcon,
  TagIcon,
  TentIcon,
  TruckIcon,
  WavesIcon,
  type LucideIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Popover} from '@astryxdesign/core/Popover';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= SURFACE CONSTANTS =============

// Brand mark ink sits on the token nav row, so it adapts: deep pine in
// light mode, pale pine in dark mode (same hue intent, flipped lightness).
const NAV_INK = 'light-dark(#1C2B24, #D7E3DB)';
// Scheme-locked brand chrome (see header Color policy): the promo bar and
// sale hero stay dark pine in both schemes, so their text stays literal.
const PROMO_BAR_BG = '#14211B';
const PROMO_BAR_TEXT = '#E8EFE9';
const HERO_TEXT = '#F2EEE6';
const HERO_TEXT_DIM = 'rgba(242, 238, 230, 0.72)';

// Earthy outdoor-gear gradient pairs; a name hash picks the pair so every
// tile is stable across renders and sessions. Scheme-locked brand art: the
// pairs render identically in light and dark mode (styles.art/.circleArt
// pin colorScheme: 'dark'), so these stay literal by design.
const GRADIENT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#1E3A2F', '#4C7C59'],
  ['#7C3F2C', '#C4764F'],
  ['#24435C', '#5C8CA8'],
  ['#4A4A33', '#8A8B5C'],
  ['#2F2A3E', '#6B5B8E'],
  ['#5C3A2E', '#A67B5B'],
  ['#173F4A', '#3E8E7E'],
  ['#6B2D2D', '#B85C4A'],
];

/** Stable name hash (charCode fold) — no Math.random anywhere. */
function hashOf(name: string): number {
  let hash = 7;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function gradientFor(name: string): readonly [string, string] {
  return GRADIENT_PAIRS[hashOf(name) % GRADIENT_PAIRS.length];
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // One vertical scroll surface holding the stacked zones.
  page: {
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-bg-primary)',
  },
  pageInner: {
    maxWidth: 1120,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-10)',
  },
  // Numbered zone label: eyebrow over heading + supporting copy.
  zoneEyebrow: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Zone 1 renders the live store chrome inside a bordered surface so it
  // reads as a showcased (but fully working) block.
  chromeFrame: {
    border: '1px solid var(--color-border-primary)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  // Promo top bar: dark pine band with rotating messages + pagers.
  // Scheme-locked brand chrome — dark pine in both schemes; colorScheme is
  // pinned so the ghost IconButtons inside resolve dark-scheme tokens.
  promoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 44,
    paddingInline: 'var(--spacing-3)',
    backgroundColor: PROMO_BAR_BG,
    color: PROMO_BAR_TEXT,
    colorScheme: 'dark',
  },
  promoMessage: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    textAlign: 'center',
  },
  promoText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
    fontWeight: 500,
  },
  promoCounter: {
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    opacity: 0.7,
    whiteSpace: 'nowrap',
  },
  // Main nav row.
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    minHeight: 64,
    paddingInline: 'var(--spacing-4)',
    backgroundColor: 'var(--color-bg-primary)',
    borderBottom: '1px solid var(--color-border-primary)',
  },
  brandMark: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    color: NAV_INK,
    fontWeight: 800,
    letterSpacing: '0.1em',
    fontSize: 15,
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    textDecorationLine: 'underline',
    textUnderlineOffset: 6,
    textDecorationThickness: 2,
  },
  // Cart button: live count Badge overlaid on the trailing icon button.
  countWrap: {position: 'relative', display: 'inline-flex'},
  countDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
    pointerEvents: 'none',
  },
  // Mega menu body: three link columns + featured cell.
  megaBody: {
    width: 'min(720px, 92vw)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-1)',
  },
  megaColumn: {
    flex: '1 1 150px',
    minWidth: 150,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  megaLinkList: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  megaFeatured: {
    flex: '1 1 180px',
    minWidth: 180,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  // Shared gradient art block; aspect ratio set per usage. Scheme-locked
  // brand art: the GRADIENT_PAIRS literals render identically in both
  // schemes, so colorScheme is pinned and the watermark stays literal.
  art: {
    position: 'relative',
    width: '100%',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    colorScheme: 'dark',
  },
  artInitial: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    color: 'rgba(255, 255, 255, 0.4)',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  // Large category tile: the whole tile is one button.
  tileButton: {
    position: 'relative',
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
  },
  // Scheme-locked: the scrim darkens locked gradient art in both schemes,
  // so its rgba ramp and light text stay literal for constant contrast.
  tileScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 'var(--spacing-3)',
    paddingTop: 48,
    background:
      'linear-gradient(180deg, transparent 0%, rgba(10, 16, 12, 0.62) 55%, rgba(10, 16, 12, 0.9) 100%)',
    color: '#F4F6F2',
    colorScheme: 'dark',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },
  tileTitle: {fontSize: 18, fontWeight: 700, lineHeight: 1.2},
  tileMeta: {fontSize: 12, opacity: 0.82},
  // Compact circle tiles.
  circleRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-4)',
    rowGap: 'var(--spacing-3)',
  },
  circleButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    width: 84,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
  },
  // Scheme-locked gradient disc (GRADIENT_PAIRS art); literal light icon
  // ink keeps constant contrast on the locked gradient in both schemes.
  circleArt: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(255, 255, 255, 0.92)',
    colorScheme: 'dark',
  },
  // Seasonal split banner: art beside copy; stacks at <=640px.
  splitBanner: {
    display: 'flex',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: '1px solid var(--color-border-primary)',
  },
  splitArt: {flex: '0 0 44%', minHeight: 220, position: 'relative'},
  splitBody: {
    flex: 1,
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'var(--spacing-3)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  // Full-bleed sale hero. Scheme-locked brand gradient art: the pine/copper
  // gradient stack renders identically in both schemes; colorScheme is
  // pinned so nested Buttons/Badges resolve dark-scheme tokens, and all
  // hero text/scrim/border literals below stay literal for contrast.
  saleHero: {
    position: 'relative',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    padding: 'var(--spacing-8)',
    color: HERO_TEXT,
    colorScheme: 'dark',
    background: [
      'radial-gradient(90% 120% at 85% 10%, rgba(196, 118, 79, 0.42), transparent 55%)',
      'radial-gradient(70% 90% at 8% 92%, rgba(62, 142, 126, 0.3), transparent 60%)',
      'linear-gradient(130deg, #14211B 0%, #1E3A2F 55%, #24435C 120%)',
    ].join(', '),
  },
  saleRidge: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    pointerEvents: 'none',
    opacity: 0.5,
  },
  saleBody: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    maxWidth: 640,
  },
  countdownRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    alignItems: 'stretch',
  },
  // On the locked sale hero (inherits its colorScheme): literal scrim +
  // border keep the chips readable on the brand gradient in both schemes.
  countdownUnit: {
    minWidth: 64,
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'rgba(10, 16, 12, 0.45)',
    border: '1px solid rgba(242, 238, 230, 0.22)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
  },
  countdownValue: {
    fontSize: 24,
    fontWeight: 800,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.1,
  },
  countdownLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    opacity: 0.72,
  },
  // On the locked sale hero (inherits its colorScheme): literals by design.
  promotedRow: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'rgba(10, 16, 12, 0.4)',
    border: '1px solid rgba(242, 238, 230, 0.18)',
  },
  promotedArt: {width: 72, flexShrink: 0},
  // Offer code chip row inside each offer Card.
  codeRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  codeText: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontWeight: 700,
    letterSpacing: '0.08em',
    fontSize: 13,
    padding: '6px 10px',
    borderRadius: 'var(--radius-container)',
    border: '1px dashed var(--color-border-primary)',
    backgroundColor: 'var(--color-bg-secondary)',
  },
  // App-download panel: copy beside a CSS phone mock; stacks at <=640px.
  appPanel: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    padding: 'var(--spacing-6)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border-primary)',
    backgroundColor: 'var(--color-bg-secondary)',
    alignItems: 'center',
  },
  phoneMock: {
    flexShrink: 0,
    width: 132,
    borderRadius: 22,
    border: '3px solid var(--color-border-primary)',
    overflow: 'hidden',
    backgroundColor: 'var(--color-bg-primary)',
  },
  // Translucent brand tint over the token phone body — light-dark pairs
  // keep the light appearance exact and brighten the tint on dark bg.
  phoneScreen: {
    aspectRatio: '9 / 16',
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    background: [
      'linear-gradient(160deg,',
      'light-dark(rgba(76, 124, 89, 0.24), rgba(107, 163, 122, 0.3)) 0%,',
      'light-dark(rgba(36, 67, 92, 0.18), rgba(92, 140, 168, 0.24)) 100%)',
    ].join(' '),
  },
  phoneBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-border-primary)',
  },
  // Scheme-locked brand-gradient stand-in for app art (same pine pair as
  // GRADIENT_PAIRS[0]); identical in both schemes, colorScheme pinned.
  phoneTile: {
    flex: 1,
    borderRadius: 8,
    background: 'linear-gradient(150deg, #4C7C59 0%, #1E3A2F 120%)',
    colorScheme: 'dark',
  },
  // Deterministic hash-drawn QR block (9x9 cells). Scheme-locked "print
  // paper": a QR code must stay literal white with literal dark cells in
  // both schemes to read as scannable; colorScheme is pinned to 'light'
  // so any tokens inside resolve to their light values.
  qrGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(9, 10px)',
    gridAutoRows: 10,
    gap: 2,
    padding: 8,
    borderRadius: 'var(--radius-container)',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--color-border-primary)',
    width: 'fit-content',
    colorScheme: 'light',
  },
  qrCellOn: {backgroundColor: '#14211B', borderRadius: 1},
  qrCellOff: {backgroundColor: 'transparent'},
  // Incentives: bordered inline strip variant for PDP embedding.
  inlineStrip: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    rowGap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-border-primary)',
  },
  inlineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1-5)',
    minHeight: 40,
    paddingInline: 'var(--spacing-1)',
  },
  inlineDividerDot: {
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: 'var(--color-border-primary)',
  },
};

// ============= DATA =============
// Cairn Supply Co. — fictional outdoor-gear brand. Fixed fixtures: no
// clocks (the countdown starts from a fixed seconds budget and only its
// tick cadence is runtime), no randomness, no network assets.

const PROMO_MESSAGES: ReadonlyArray<{id: string; text: string}> = [
  {
    id: 'promo-shipping',
    text: 'Free shipping on orders over $99 — no code needed',
  },
  {
    id: 'promo-sale',
    text: 'End of Season Sale: up to 40% off camp & hike gear',
  },
  {
    id: 'promo-new',
    text: 'Just landed: the Ridgeline pack collection',
  },
];

const NAV_LINKS: ReadonlyArray<{id: string; label: string}> = [
  {id: 'activities', label: 'Activities'},
  {id: 'stories', label: 'Stories'},
  {id: 'outlet', label: 'Outlet'},
];

interface MegaColumn {
  id: string;
  title: string;
  links: string[];
}

const MEGA_COLUMNS: ReadonlyArray<MegaColumn> = [
  {
    id: 'camp',
    title: 'Camp & Hike',
    links: [
      'Tents & shelters',
      'Sleeping bags',
      'Backpacks',
      'Camp kitchen',
      'Trekking poles',
    ],
  },
  {
    id: 'climb',
    title: 'Climb',
    links: [
      'Harnesses',
      'Ropes & slings',
      'Carabiners',
      'Climbing shoes',
      'Chalk & bags',
    ],
  },
  {
    id: 'water',
    title: 'Water',
    links: ['Kayaks', 'Paddles', 'Dry bags', 'Wetsuits', 'Life vests'],
  },
];

const MEGA_FEATURED = {
  title: 'The Ridgeline Collection',
  copy: 'Trail-fit packs from 25L to 65L, cut from 210-denier recycled ripstop.',
  cta: 'Shop new arrivals',
};

interface CategoryTile {
  id: string;
  title: string;
  count: number;
  blurb: string;
}

const CATEGORY_TILES: ReadonlyArray<CategoryTile> = [
  {
    id: 'cat-camp',
    title: 'Camp & Hike',
    count: 128,
    blurb: 'Shelters, sleep systems, and everything for the approach.',
  },
  {
    id: 'cat-climb',
    title: 'Climb',
    count: 86,
    blurb: 'Rack up for granite, gym, or alpine ice.',
  },
  {
    id: 'cat-water',
    title: 'Water',
    count: 64,
    blurb: 'Boats, boards, and dry storage for moving water.',
  },
];

interface CircleTile {
  id: string;
  label: string;
  icon: LucideIcon;
}

const CIRCLE_TILES: ReadonlyArray<CircleTile> = [
  {id: 'circ-tents', label: 'Tents', icon: TentIcon},
  {id: 'circ-footwear', label: 'Footwear', icon: FootprintsIcon},
  {id: 'circ-cycling', label: 'Cycling', icon: BikeIcon},
  {id: 'circ-snow', label: 'Snow', icon: SnowflakeIcon},
  {id: 'circ-paddle', label: 'Paddling', icon: WavesIcon},
  {id: 'circ-nav', label: 'Navigation', icon: CompassIcon},
];

const SEASONAL = {
  eyebrow: 'Seasonal collection',
  title: 'The Alpine Start Collection',
  copy:
    'Pre-dawn layers and glacier-ready shells built for cold starts and ' +
    'warm summits — 18 pieces, all under 400 grams.',
  cta: 'Shop the collection',
  artKey: 'Alpine Start',
};

// Fixed countdown budget: 1d 09:26:40 against the sale-end fixture line.
const SALE = {
  eyebrow: 'Limited time',
  title: 'End of Season Sale',
  copy: 'Up to 40% off camp, hike, and climb gear while the snow holds off.',
  endsLine: 'Ends Sunday at midnight MT',
  remainingSeconds: 1 * 86400 + 9 * 3600 + 26 * 60 + 40,
  cta: 'Shop the sale',
};

const PROMOTED_ITEM = {
  id: 'ridgeline-45',
  name: 'Ridgeline 45L Pack',
  price: 129,
  compareAt: 189,
  note: 'Sale price · 3 colorways',
};

interface Offer {
  id: string;
  title: string;
  body: string;
  code: string;
  fineprint: string;
}

const OFFERS: ReadonlyArray<Offer> = [
  {
    id: 'offer-welcome',
    title: '15% off your first order',
    body: 'New to Cairn Supply? Take 15% off anything in your first cart, sale gear included.',
    code: 'TRAILHEAD15',
    fineprint: 'One use per customer. Excludes gift cards.',
  },
  {
    id: 'offer-bundle',
    title: '$30 off camp bundles $200+',
    body: 'Stack a tent, bag, and pad in one order and we knock $30 off at checkout.',
    code: 'BASECAMP30',
    fineprint: 'Bundle must include 3+ camp items.',
  },
];

const APP_PANEL = {
  eyebrow: 'Cairn Supply app',
  title: 'Take the trail guide with you',
  copy:
    'Offline maps for 400+ routes, gear checklists, and order tracking — ' +
    'plus app-only drops every Friday.',
  qrKey: 'cairn-supply-app',
};

interface Incentive {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  short: string;
}

const INCENTIVES: ReadonlyArray<Incentive> = [
  {
    id: 'inc-shipping',
    icon: TruckIcon,
    title: 'Free shipping over $99',
    body: 'Carbon-neutral delivery in 2–4 business days.',
    short: 'Free shipping $99+',
  },
  {
    id: 'inc-returns',
    icon: RotateCcwIcon,
    title: '90-day trail returns',
    body: 'Took it outside? Still returnable within 90 days.',
    short: '90-day returns',
  },
  {
    id: 'inc-warranty',
    icon: ShieldCheckIcon,
    title: 'Lifetime gear warranty',
    body: 'We repair or replace Cairn-made gear, forever.',
    short: 'Lifetime warranty',
  },
  {
    id: 'inc-support',
    icon: HeadphonesIcon,
    title: 'Talk to a guide',
    body: 'Real humans who use the gear, 7am–7pm MT.',
    short: 'Expert support',
  },
];

const INCENTIVE_VARIANTS = [
  {value: 'icon-row', label: 'Icon row'},
  {value: 'inline-strip', label: 'Inline strip'},
];

// ============= HELPERS =============

/** Split a seconds budget into zero-padded d/h/m/s countdown chips. */
function splitCountdown(totalSeconds: number): Array<{unit: string; value: string}> {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, '0');
  return [
    {unit: 'Days', value: pad(days)},
    {unit: 'Hours', value: pad(hours)},
    {unit: 'Min', value: pad(minutes)},
    {unit: 'Sec', value: pad(seconds)},
  ];
}

/** Deterministic 9x9 QR-style fill pattern from a per-cell string hash. */
function qrCellFilled(key: string, row: number, col: number): boolean {
  return hashOf(`${key}-${row}-${col}`) % 5 < 3;
}

// ============= ART PIECES =============

/**
 * Deterministic merchandising art: a two-color gradient keyed to the given
 * name, a soft key-light radial, and a centered initial watermark. Stands
 * in for all category/collection photography — zero image assets ship.
 * Scheme-locked brand art (styles.art pins colorScheme: 'dark'), so the
 * gradient and key-light literals render identically in both schemes.
 */
function CategoryArt({
  name,
  ratio,
  initialSize = 48,
  fill = false,
}: {
  name: string;
  ratio?: string;
  initialSize?: number;
  fill?: boolean;
}) {
  const [from, to] = gradientFor(name);
  return (
    <div
      style={{
        ...styles.art,
        ...(fill ? {position: 'absolute', inset: 0, width: '100%', height: '100%'} : undefined),
        ...(ratio != null ? {aspectRatio: ratio} : undefined),
        background: [
          'radial-gradient(120% 90% at 20% 12%, rgba(255, 255, 255, 0.34), transparent 58%)',
          `linear-gradient(150deg, ${from} 0%, ${to} 118%)`,
        ].join(', '),
      }}>
      <span style={{...styles.artInitial, fontSize: initialSize}} aria-hidden>
        {name.charAt(0)}
      </span>
    </div>
  );
}

/**
 * Faint ridgeline polyline along the sale hero's bottom — decorative.
 * Literal strokes by design: they sit on the scheme-locked hero gradient.
 */
function RidgelineArt() {
  return (
    <svg viewBox="0 0 800 120" style={styles.saleRidge} aria-hidden>
      <polyline
        points="0,110 90,58 160,92 250,30 330,84 430,44 520,96 610,52 700,88 800,40"
        fill="none"
        stroke="rgba(242, 238, 230, 0.5)"
        strokeWidth="2"
      />
      <polyline
        points="0,118 110,80 200,104 300,64 400,102 500,72 620,108 720,80 800,98"
        fill="none"
        stroke="rgba(242, 238, 230, 0.28)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ============= ZONE LABEL =============

/** Numbered eyebrow + Heading that introduces each showcased zone. */
function ZoneLabel({
  index,
  title,
  description,
  actions,
}: {
  index: number;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="end" wrap="wrap">
      <StackItem size="fill">
        <VStack gap={1}>
          <span style={styles.zoneEyebrow}>
            {String(index).padStart(2, '0')} · {title}
          </span>
          <Text type="supporting" color="secondary">
            {description}
          </Text>
        </VStack>
      </StackItem>
      {actions}
    </HStack>
  );
}

// ============= ZONE 1: STORE NAVIGATION =============

/** Rotating promo bar: auto-advances; pagers rewind/advance on tap. */
function PromoTopBar({
  index,
  onPrevious,
  onNext,
}: {
  index: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const message = PROMO_MESSAGES[index];
  return (
    <div style={styles.promoBar}>
      <IconButton
        label="Previous announcement"
        icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={onPrevious}
      />
      <div style={styles.promoMessage}>
        <Icon icon={TagIcon} size="xsm" color="inherit" />
        <span style={styles.promoText}>{message.text}</span>
      </div>
      <span style={styles.promoCounter}>
        {index + 1} / {PROMO_MESSAGES.length}
      </span>
      <IconButton
        label="Next announcement"
        icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={onNext}
      />
    </div>
  );
}

/** Mega-menu body: three link columns with imagery cells + featured cell. */
function MegaMenuBody({
  onNavigate,
}: {
  onNavigate: (label: string) => void;
}) {
  return (
    <div style={styles.megaBody}>
      {MEGA_COLUMNS.map(column => (
        <div key={column.id} style={styles.megaColumn}>
          <CategoryArt name={column.title} ratio="4 / 3" initialSize={32} />
          <Text type="label">{column.title}</Text>
          <div style={styles.megaLinkList}>
            {column.links.map(link => (
              <Button
                key={link}
                label={`Shop ${link}`}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(link)}>
                {link}
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div style={styles.megaFeatured}>
        <CategoryArt
          name={MEGA_FEATURED.title}
          ratio="4 / 3"
          initialSize={32}
        />
        <Badge label="New" variant="info" />
        <Text type="label">{MEGA_FEATURED.title}</Text>
        <Text type="supporting" color="secondary">
          {MEGA_FEATURED.copy}
        </Text>
        <Button
          label={MEGA_FEATURED.cta}
          variant="secondary"
          size="sm"
          icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
          onClick={() => onNavigate(MEGA_FEATURED.title)}>
          {MEGA_FEATURED.cta}
        </Button>
      </div>
    </div>
  );
}

/**
 * <=760px fallback for the nav links + mega menu: the same catalog in a
 * Dialog. Tap-first with Dialog-provided Escape/focus handling.
 */
function MobileDrawerDialog({
  activeLink,
  cartCount,
  onNavigate,
  onSelectLink,
  onOpenChange,
}: {
  activeLink: string | null;
  cartCount: number;
  onNavigate: (label: string) => void;
  onSelectLink: (id: string, label: string) => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  return (
    <Dialog
      isOpen
      onOpenChange={onOpenChange}
      purpose="info"
      width="min(400px, 94vw)">
      <Layout
        header={
          <DialogHeader
            title="Cairn Supply Co."
            subtitle={`Browse the store · ${cartCount} in cart`}
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <VStack gap={1} hAlign="start">
                {NAV_LINKS.map(link => (
                  <Button
                    key={link.id}
                    label={`Go to ${link.label}`}
                    variant="ghost"
                    style={
                      activeLink === link.id ? styles.navLinkActive : undefined
                    }
                    onClick={() => onSelectLink(link.id, link.label)}>
                    {link.label}
                  </Button>
                ))}
              </VStack>
              <Divider />
              {MEGA_COLUMNS.map(column => (
                <VStack key={column.id} gap={1} hAlign="start">
                  <Text type="label">{column.title}</Text>
                  {column.links.map(link => (
                    <Button
                      key={link}
                      label={`Shop ${link}`}
                      variant="ghost"
                      size="sm"
                      onClick={() => onNavigate(link)}>
                      {link}
                    </Button>
                  ))}
                </VStack>
              ))}
              <Divider />
              <Button
                label={MEGA_FEATURED.cta}
                variant="secondary"
                icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
                onClick={() => onNavigate(MEGA_FEATURED.title)}>
                {MEGA_FEATURED.cta}
              </Button>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// ============= ZONE 2: CATEGORY PREVIEWS =============

/** Large category tile: the entire tile is one keyboard-focusable button. */
function CategoryTileButton({
  tile,
  onBrowse,
}: {
  tile: CategoryTile;
  onBrowse: (label: string) => void;
}) {
  return (
    <button
      type="button"
      style={styles.tileButton}
      aria-label={`Browse ${tile.title}, ${tile.count} products`}
      onClick={() => onBrowse(tile.title)}>
      <CategoryArt name={tile.title} ratio="4 / 3" initialSize={64} />
      <div style={styles.tileScrim}>
        <div>
          <div style={styles.tileTitle}>{tile.title}</div>
          <div style={styles.tileMeta}>
            {tile.count} products · {tile.blurb}
          </div>
        </div>
        <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
      </div>
    </button>
  );
}

/** 64px circle tile with an icon over a gradient disc. */
function CircleTileButton({
  tile,
  onBrowse,
}: {
  tile: CircleTile;
  onBrowse: (label: string) => void;
}) {
  const [from, to] = gradientFor(tile.label);
  return (
    <button
      type="button"
      style={styles.circleButton}
      aria-label={`Browse ${tile.label}`}
      onClick={() => onBrowse(tile.label)}>
      <span
        style={{
          ...styles.circleArt,
          background: `linear-gradient(150deg, ${from} 0%, ${to} 120%)`,
        }}>
        <Icon icon={tile.icon} size="md" color="inherit" />
      </span>
      <Text type="supporting">{tile.label}</Text>
    </button>
  );
}

// ============= ZONE 3: PROMO PIECES =============

/** One countdown chip: big tabular value over an uppercase unit label. */
function CountdownChip({unit, value}: {unit: string; value: string}) {
  return (
    <div style={styles.countdownUnit}>
      <span style={styles.countdownValue}>{value}</span>
      <span style={styles.countdownLabel}>{unit}</span>
    </div>
  );
}

/** Offer Card with a dashed code chip whose copy button flips to a check. */
function OfferCard({
  offer,
  isCopied,
  onCopy,
}: {
  offer: Offer;
  isCopied: boolean;
  onCopy: (offer: Offer) => void;
}) {
  return (
    <Card padding={4} height="100%">
      <VStack gap={2}>
        <Badge label="Offer" variant="green" />
        <Heading level={3}>{offer.title}</Heading>
        <Text type="body" color="secondary">
          {offer.body}
        </Text>
        <div style={styles.codeRow}>
          <span style={styles.codeText}>{offer.code}</span>
          <Button
            label={
              isCopied
                ? `${offer.code} copied`
                : `Copy code ${offer.code} to clipboard`
            }
            variant="secondary"
            size="sm"
            icon={
              <Icon
                icon={isCopied ? CheckIcon : CopyIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() => onCopy(offer)}>
            {isCopied ? 'Copied' : 'Copy code'}
          </Button>
        </div>
        <Text type="supporting" color="secondary">
          {offer.fineprint}
        </Text>
      </VStack>
    </Card>
  );
}

/** CSS phone mock beside app copy, store buttons, and a QR reveal toggle. */
function AppPromoPanel({
  isQrVisible,
  onToggleQr,
  onStoreClick,
  isStacked,
}: {
  isQrVisible: boolean;
  onToggleQr: (next: boolean) => void;
  onStoreClick: (store: string) => void;
  isStacked: boolean;
}) {
  return (
    <div
      style={{
        ...styles.appPanel,
        ...(isStacked ? {flexDirection: 'column', alignItems: 'stretch'} : undefined),
      }}>
      <div style={{...styles.phoneMock, ...(isStacked ? {alignSelf: 'center'} : undefined)}}>
        <div style={styles.phoneScreen}>
          <div style={{...styles.phoneBar, width: '55%'}} />
          <div style={{...styles.phoneBar, width: '80%'}} />
          <div style={styles.phoneTile} />
          <div style={{...styles.phoneBar, width: '65%'}} />
          <div style={{...styles.phoneBar, width: '40%'}} />
        </div>
      </div>
      <VStack gap={2}>
        <span style={styles.zoneEyebrow}>{APP_PANEL.eyebrow}</span>
        <Heading level={3}>{APP_PANEL.title}</Heading>
        <Text type="body" color="secondary">
          {APP_PANEL.copy}
        </Text>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Download on the App Store"
            variant="primary"
            icon={<Icon icon={SmartphoneIcon} size="sm" color="inherit" />}
            onClick={() => onStoreClick('App Store')}>
            App Store
          </Button>
          <Button
            label="Get it on Google Play"
            variant="secondary"
            icon={<Icon icon={SmartphoneIcon} size="sm" color="inherit" />}
            onClick={() => onStoreClick('Google Play')}>
            Google Play
          </Button>
          <ToggleButton
            label={isQrVisible ? 'Hide download QR code' : 'Show download QR code'}
            icon={<Icon icon={QrCodeIcon} size="sm" color="inherit" />}
            isPressed={isQrVisible}
            onPressedChange={onToggleQr}
            tooltip={isQrVisible ? 'Hide QR code' : 'Show QR code'}>
            {isQrVisible ? 'Hide QR' : 'Show QR'}
          </ToggleButton>
        </HStack>
        {isQrVisible ? (
          <HStack gap={3} vAlign="center" wrap="wrap">
            <div style={styles.qrGrid} role="img" aria-label="App download QR code">
              {Array.from({length: 81}, (_, cell) => {
                const row = Math.floor(cell / 9);
                const col = cell % 9;
                return (
                  <div
                    key={cell}
                    style={
                      qrCellFilled(APP_PANEL.qrKey, row, col)
                        ? styles.qrCellOn
                        : styles.qrCellOff
                    }
                  />
                );
              })}
            </div>
            <Text type="supporting" color="secondary">
              Point your camera here to install.
            </Text>
          </HStack>
        ) : null}
      </VStack>
    </div>
  );
}

// ============= ZONE 4: INCENTIVES =============

/** 4-up icon-row variant: icon, title, and supporting copy per incentive. */
function IncentiveIconRow() {
  return (
    <Grid columns={{minWidth: 210}} gap={4}>
      {INCENTIVES.map(incentive => (
        <Card key={incentive.id} padding={4} height="100%">
          <VStack gap={2}>
            <Icon icon={incentive.icon} size="md" color="secondary" />
            <Text type="label">{incentive.title}</Text>
            <Text type="supporting" color="secondary">
              {incentive.body}
            </Text>
          </VStack>
        </Card>
      ))}
    </Grid>
  );
}

/** Bordered inline-strip variant sized for PDP embedding; wraps on phones. */
function IncentiveInlineStrip() {
  return (
    <div style={styles.inlineStrip}>
      {INCENTIVES.map((incentive, index) => (
        <div key={incentive.id} style={styles.inlineItem}>
          {index > 0 ? <span style={styles.inlineDividerDot} aria-hidden /> : null}
          <Icon icon={incentive.icon} size="sm" color="secondary" />
          <Text type="supporting">{incentive.short}</Text>
        </div>
      ))}
    </div>
  );
}

// ============= PAGE =============

export default function StorefrontPromoNavigationTemplate() {
  const toast = useToast();

  // ---- zone 1: promo bar rotation + nav state ----
  const [promoIndex, setPromoIndex] = useState(0);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // ---- zone 3: countdown, copied codes, QR reveal ----
  const [remainingSeconds, setRemainingSeconds] = useState(
    SALE.remainingSeconds,
  );
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isQrVisible, setIsQrVisible] = useState(false);

  // ---- zone 4: incentives variant switcher ----
  const [incentiveVariant, setIncentiveVariant] = useState('icon-row');

  // Responsive contract: <=760px swaps nav links + mega menu for the
  // drawer toggle; <=640px stacks split surfaces and shrinks the hero.
  const isCompact = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // Promo bar auto-rotation: fixed message order, cadence-only runtime.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPromoIndex(previous => (previous + 1) % PROMO_MESSAGES.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  // Countdown: decrement the fixed budget once per second until it hits
  // zero. Deterministic start — only the tick cadence is runtime.
  useEffect(() => {
    if (remainingSeconds === 0) {
      return;
    }
    const timer = window.setInterval(() => {
      setRemainingSeconds(previous => (previous > 0 ? previous - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds === 0]);

  const countdown = splitCountdown(remainingSeconds);
  const isSaleOver = remainingSeconds === 0;

  // ---- interactions ----

  const browseTo = (label: string) => {
    setIsMegaOpen(false);
    setIsDrawerOpen(false);
    toast({body: `Browsing ${label}`, uniqueID: 'storefront-browse-to'});
  };

  const selectNavLink = (id: string, label: string) => {
    setActiveLink(id);
    setIsDrawerOpen(false);
    toast({body: `Opened ${label}`, uniqueID: 'storefront-nav-link'});
  };

  const addPromotedToCart = () => {
    setCartCount(previous => previous + 1);
    toast({
      body: `${PROMOTED_ITEM.name} added — ${cartCount + 1} in cart`,
      uniqueID: 'storefront-add-to-cart',
    });
  };

  const copyOfferCode = (offer: Offer) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(offer.code);
    }
    setCopiedCode(offer.code);
    toast({
      body: `Code ${offer.code} copied to clipboard`,
      uniqueID: 'storefront-copy-code',
    });
  };

  const openStoreListing = (store: string) => {
    toast({
      body: `Opening the Cairn Supply listing on the ${store}`,
      uniqueID: 'storefront-app-store',
    });
  };

  // ---- zone 1 chrome pieces ----

  const cartButton = (
    <div style={styles.countWrap}>
      <IconButton
        label={`Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
        tooltip="Cart"
        icon={<Icon icon={ShoppingCartIcon} size="sm" />}
        variant="secondary"
        onClick={() =>
          toast({
            body:
              cartCount === 0
                ? 'Your cart is empty — the sale hero below can fix that.'
                : `${cartCount} ${cartCount === 1 ? 'item' : 'items'} in your cart`,
            uniqueID: 'storefront-cart',
          })
        }
      />
      {cartCount > 0 ? (
        <div style={styles.countDot}>
          <Badge label={String(cartCount)} variant="info" />
        </div>
      ) : null}
    </div>
  );

  const storeNav = (
    <div style={styles.chromeFrame}>
      <PromoTopBar
        index={promoIndex}
        onPrevious={() =>
          setPromoIndex(
            previous =>
              (previous - 1 + PROMO_MESSAGES.length) % PROMO_MESSAGES.length,
          )
        }
        onNext={() =>
          setPromoIndex(previous => (previous + 1) % PROMO_MESSAGES.length)
        }
      />
      <div style={styles.navRow}>
        {isCompact ? (
          <IconButton
            label="Open store menu"
            icon={<Icon icon={MenuIcon} size="sm" />}
            variant="ghost"
            onClick={() => setIsDrawerOpen(true)}
          />
        ) : null}
        <div style={styles.brandMark}>
          <Icon icon={MountainSnowIcon} size="md" color="inherit" />
          <span>CAIRN SUPPLY</span>
        </div>
        {!isCompact ? (
          <HStack gap={1} vAlign="center">
            <Popover
              label="Shop categories"
              placement="below"
              alignment="start"
              isOpen={isMegaOpen}
              onOpenChange={setIsMegaOpen}
              content={<MegaMenuBody onNavigate={browseTo} />}>
              <Button
                label={isMegaOpen ? 'Close the Shop menu' : 'Open the Shop menu'}
                variant="ghost"
                endContent={
                  <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                }>
                Shop
              </Button>
            </Popover>
            {NAV_LINKS.map(link => (
              <Button
                key={link.id}
                label={`Go to ${link.label}`}
                variant="ghost"
                style={activeLink === link.id ? styles.navLinkActive : undefined}
                onClick={() => selectNavLink(link.id, link.label)}>
                {link.label}
              </Button>
            ))}
          </HStack>
        ) : null}
        <StackItem size="fill">
          <span />
        </StackItem>
        <IconButton
          label="Search the store"
          tooltip="Search"
          icon={<Icon icon={SearchIcon} size="sm" />}
          variant="ghost"
          onClick={() =>
            toast({body: 'Search coming to this demo soon', uniqueID: 'storefront-search'})
          }
        />
        {cartButton}
      </div>
    </div>
  );

  // ---- zone 2 pieces ----

  const seasonalBanner = (
    <div
      style={{
        ...styles.splitBanner,
        ...(isPhone ? {flexDirection: 'column'} : undefined),
      }}>
      <div style={isPhone ? {position: 'relative', minHeight: 160} : styles.splitArt}>
        <CategoryArt name={SEASONAL.artKey} initialSize={72} fill />
      </div>
      <div style={styles.splitBody}>
        <span style={styles.zoneEyebrow}>{SEASONAL.eyebrow}</span>
        <Heading level={3}>{SEASONAL.title}</Heading>
        <Text type="body" color="secondary">
          {SEASONAL.copy}
        </Text>
        <HStack gap={2}>
          <Button
            label={SEASONAL.cta}
            variant="primary"
            icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
            onClick={() => browseTo(SEASONAL.title)}>
            {SEASONAL.cta}
          </Button>
        </HStack>
      </div>
    </div>
  );

  // ---- zone 3 pieces ----

  const saleHero = (
    <div style={styles.saleHero}>
      <RidgelineArt />
      <div style={styles.saleBody}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Badge label={SALE.eyebrow} variant="red" />
          <Text type="supporting" color="inherit" style={{color: HERO_TEXT_DIM}}>
            {SALE.endsLine}
          </Text>
        </HStack>
        <Heading
          level={2}
          type={isPhone ? 'display-3' : 'display-2'}
          color="inherit">
          {SALE.title}
        </Heading>
        <Text type="body" color="inherit" style={{color: HERO_TEXT_DIM}}>
          {SALE.copy}
        </Text>
        <div style={styles.countdownRow}>
          {countdown.map(chip => (
            <CountdownChip key={chip.unit} unit={chip.unit} value={chip.value} />
          ))}
        </div>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label={isSaleOver ? 'The sale has ended' : SALE.cta}
            variant="primary"
            isDisabled={isSaleOver}
            onClick={() => browseTo('the End of Season Sale')}>
            {isSaleOver ? 'Sale ended' : SALE.cta}
          </Button>
        </HStack>
        <div style={styles.promotedRow}>
          <div style={styles.promotedArt}>
            <CategoryArt
              name={PROMOTED_ITEM.name}
              ratio="1 / 1"
              initialSize={28}
            />
          </div>
          <StackItem size="fill" style={{minWidth: 160}}>
            <VStack gap={0.5}>
              <Text type="label" color="inherit">
                {PROMOTED_ITEM.name}
              </Text>
              <HStack gap={2} vAlign="center">
                <Text type="label" color="inherit" hasTabularNumbers>
                  ${PROMOTED_ITEM.price}
                </Text>
                <Text
                  type="supporting"
                  color="inherit"
                  hasStrikethrough
                  style={{color: HERO_TEXT_DIM}}>
                  ${PROMOTED_ITEM.compareAt}
                </Text>
                <Text
                  type="supporting"
                  color="inherit"
                  style={{color: HERO_TEXT_DIM}}>
                  {PROMOTED_ITEM.note}
                </Text>
              </HStack>
            </VStack>
          </StackItem>
          <Button
            label={`Add ${PROMOTED_ITEM.name} to cart`}
            variant="secondary"
            icon={<Icon icon={ShoppingCartIcon} size="sm" color="inherit" />}
            onClick={addPromotedToCart}>
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <Layout
      height="fill"
      content={
        <LayoutContent padding={0}>
          <div style={styles.page}>
            <div style={styles.pageInner}>
              {/* ---- Zone 1: store navigation ---- */}
              <VStack gap={3}>
                <ZoneLabel
                  index={1}
                  title="Store navigation"
                  description="Rotating promo bar, mega-menu Shop nav, mobile drawer, and a live cart count — adds from the promo zone land here."
                />
                {storeNav}
              </VStack>

              {/* ---- Zone 2: category previews ---- */}
              <VStack gap={4}>
                <ZoneLabel
                  index={2}
                  title="Category previews"
                  description="Three tile scales for merchandising a catalog: large department tiles, compact circle tiles, and a split seasonal banner."
                />
                <Grid columns={{minWidth: 240}} gap={4}>
                  {CATEGORY_TILES.map(tile => (
                    <CategoryTileButton
                      key={tile.id}
                      tile={tile}
                      onBrowse={browseTo}
                    />
                  ))}
                </Grid>
                <div style={styles.circleRow}>
                  {CIRCLE_TILES.map(tile => (
                    <CircleTileButton
                      key={tile.id}
                      tile={tile}
                      onBrowse={browseTo}
                    />
                  ))}
                </div>
                {seasonalBanner}
              </VStack>

              {/* ---- Zone 3: promo sections ---- */}
              <VStack gap={4}>
                <ZoneLabel
                  index={3}
                  title="Promo sections"
                  description="A countdown sale hero with a cart-wired promoted item, copy-to-clipboard offer codes, and an app-download panel."
                />
                {saleHero}
                <Grid columns={{minWidth: 280}} gap={4}>
                  {OFFERS.map(offer => (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      isCopied={copiedCode === offer.code}
                      onCopy={copyOfferCode}
                    />
                  ))}
                </Grid>
                <AppPromoPanel
                  isQrVisible={isQrVisible}
                  onToggleQr={setIsQrVisible}
                  onStoreClick={openStoreListing}
                  isStacked={isPhone}
                />
              </VStack>

              {/* ---- Zone 4: incentives band ---- */}
              <VStack gap={4}>
                <ZoneLabel
                  index={4}
                  title="Incentives"
                  description="The same four trust signals in two densities — a landing-page icon row and a bordered strip sized for PDP embedding."
                  actions={
                    <SegmentedControl
                      label="Incentives variant"
                      value={incentiveVariant}
                      onChange={setIncentiveVariant}>
                      {INCENTIVE_VARIANTS.map(variant => (
                        <SegmentedControlItem
                          key={variant.value}
                          label={variant.label}
                          value={variant.value}
                        />
                      ))}
                    </SegmentedControl>
                  }
                />
                {incentiveVariant === 'icon-row' ? (
                  <IncentiveIconRow />
                ) : (
                  <IncentiveInlineStrip />
                )}
              </VStack>
            </div>

            {isCompact && isDrawerOpen ? (
              <MobileDrawerDialog
                activeLink={activeLink}
                cartCount={cartCount}
                onNavigate={browseTo}
                onSelectLink={selectNavLink}
                onOpenChange={setIsDrawerOpen}
              />
            ) : null}
          </div>
        </LayoutContent>
      }
    />
  );
}
