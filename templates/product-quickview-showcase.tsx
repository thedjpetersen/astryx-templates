// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (an 8-piece Atelier Vega fall
 *   lookbook of apparel items with price, compare-at price, rating,
 *   review count, "new" flags, two-to-three colorways per piece rendered
 *   as layered CSS gradient/pattern weaves, a five-size XS–XL run with
 *   per-color stock exceptions so in-stock / low-stock / sold-out states
 *   are all reachable, and fabric/fit/shipping copy for the details
 *   accordion — no clocks, no randomness, no network image assets)
 * @output Product quickview showcase: a compact lookbook Grid where every
 *   Card opens a quickview, demonstrated in three switchable dialog
 *   variants pinned by a SegmentedControl — a standard modal with an art
 *   pane, color swatches, size chips, and a quantity stepper; a wide
 *   modal that adds a Collapsible fabric/fit/shipping accordion and a
 *   per-size stock-hint row; and a right-edge slide-over drawer for
 *   narrow viewports. Selecting a color re-renders the gradient product
 *   art everywhere in the dialog, choosing a sold-out size swaps the buy
 *   button for a notify-me toggle (requests persist per color+size
 *   across reopens), and Add to bag validates that a size is chosen
 *   (inline role="alert" error), pops the header bag count with a
 *   one-shot keyframe animation, closes the dialog, and confirms with a
 *   Toast. Dialogs are native <dialog> surfaces: focus is trapped, focus
 *   returns to the opener on close, and Escape/backdrop both dismiss.
 * @position Page template; emitted by `astryx template product-quickview-showcase`
 *
 * Frame: Layout height="fill". LayoutHeader carries the boutique title,
 * a lookbook byline, the quickview-style SegmentedControl (wide
 * viewports), and the bag Button whose count Badge remounts through a
 * pop keyframe on every add. LayoutContent holds a toolbar row (piece
 * count, sold-out demo hint, and — on compact — the same variant
 * switcher) above the lookbook Grid. Cards are the correct container for
 * lookbook tiles; every quickview surface is a Dialog (never a panel) so
 * focus trapping, focus restore, and Escape/backdrop dismissal come from
 * the native element. This page demos the quickview pattern itself —
 * choose storefront-browse for faceted catalog filtering and
 * product-detail-gallery for the single-product purchase page.
 *
 * Responsive contract:
 * - >640px: the variant switcher lives in the header beside the bag
 *   Button; the modal variant lays art beside the detail stack, and the
 *   wide variant adds a larger art rail plus the accordion column.
 * - <=640px: the switcher drops out of the header into the toolbar row
 *   (wrap="wrap") so the header holds only title + bag IconButton with
 *   an overlay count Badge and never overflows a 375px frame. Modal and
 *   wide quickviews stack art above the detail stack inside
 *   width min(*, 94vw) and scroll within maxHeight; the drawer variant —
 *   built for this width — anchors to the right edge at
 *   min(420px, 100vw) and runs full height.
 * - Grid: columns={{minWidth: 210}} — 4-up wide, 2-up mid, single column
 *   at 375px. Tile art is a real 3:4 button so the whole picture is a
 *   tap target in addition to the Quick view button.
 * - Touch targets: color swatches (40px), size chips (min 48x40), the
 *   stepper IconButtons (40px), Quick view / Add to bag / notify-me
 *   buttons, and every switcher segment are tap-sized. Nothing is
 *   hover-only: swatch Tooltips are reinforced by the "Color · Camel"
 *   label, sold-out sizes stay rendered and selectable (dashed chip) to
 *   reach the notify-me control, and stock hints are plain text.
 * - No sideways scrolling anywhere; toolbar and dialog action rows use
 *   wrap="wrap" instead of overflowing.
 *
 * Container policy (quickview-showcase archetype): frame-first chrome;
 * Cards for lookbook tiles only; Dialogs for all three quickview
 * variants (the drawer is a position-pinned Dialog, keeping native focus
 * and dismissal semantics); Collapsibles for the wide variant's
 * accordion; layered CSS gradient weaves keyed to each colorway keep the
 * lookbook deterministic and asset-free.
 *
 * Color policy: all chrome (chips, error ring, badges, backgrounds) uses
 * Astryx tokens and adapts to light/dark automatically. The garment art
 * itself — the colorway-keyed hsl gradient weaves, the near-black
 * rgba(10, 10, 12, 0.16) panel-stitch overlay, and the #FFFFFF check on
 * the swatch gradients — is deliberately scheme-locked product imagery
 * (a camel coat stays camel in dark mode), so those surfaces set
 * colorScheme: 'light' and keep raw literals for anything drawn on them.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BellIcon,
  CheckIcon,
  EyeIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  ShoppingBagIcon,
  TruckIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

// One-shot pop for the header bag count. Re-triggered by remounting the
// badge wrapper with the new count as its key — no timers involved.
const BAG_POP_KEYFRAMES = `
@keyframes quickview-bag-pop {
  0% { transform: scale(1); }
  45% { transform: scale(1.4); }
  100% { transform: scale(1); }
}`;

const styles: Record<string, CSSProperties> = {
  // Lookbook tile art: the whole 3:4 picture is a real button so the
  // image itself opens the quickview (bigger tap target than the label).
  tileArtButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    position: 'relative',
  },
  tileArt: {width: '100%', height: '100%'},
  tileBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-start',
  },
  // Quickview art panes keep their width beside the detail stack.
  artRailModal: {width: 240, flexShrink: 0},
  artRailWide: {width: 320, flexShrink: 0},
  artBox: {
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  artFill: {width: '100%', height: '100%'},
  // Color swatches: 40px round gradient buttons with a selected ring.
  swatchRow: {display: 'flex', gap: 10, flexWrap: 'wrap'},
  swatch: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid var(--color-border)',
    padding: 0,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    // Scheme-locked: the check sits on the fixed colorway gradient art
    // (see header color policy), so it stays literal white in both modes.
    color: '#FFFFFF',
    colorScheme: 'light',
  },
  swatchSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow:
      '0 0 0 2px var(--color-background-body), 0 0 0 4px var(--color-accent)',
  },
  // Size chips: min 48x40 tap targets. Sold-out chips stay clickable
  // (dashed border, muted label) so the notify-me flow is reachable.
  sizeGrid: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  sizeChip: {
    minWidth: 48,
    height: 40,
    paddingInline: 12,
    borderRadius: 'var(--radius-element)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-body)',
    color: 'inherit',
    font: 'inherit',
    fontSize: 14,
    cursor: 'pointer',
  },
  sizeChipSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    fontWeight: 600,
  },
  sizeChipOut: {
    borderStyle: 'dashed',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-gray)',
  },
  // The size group grows a red ring while the choose-a-size error shows.
  sizeGroupError: {
    borderRadius: 'var(--radius-element)',
    outline: '1px solid var(--color-text-red)',
    outlineOffset: 6,
  },
  errorText: {
    margin: 0,
    fontSize: 13,
    color: 'var(--color-text-red)',
  },
  // Quantity stepper: 40px IconButtons flanking a tabular count.
  stepperCount: {minWidth: 32, textAlign: 'center'},
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Header bag count: remounted per add so the pop keyframe replays.
  bagPop: {
    display: 'inline-flex',
    animation: 'quickview-bag-pop 320ms ease-out',
  },
  countWrap: {position: 'relative', display: 'inline-flex'},
  countDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
    pointerEvents: 'none',
  },
};

// ============= DATA =============
// Atelier Vega — fall lookbook. Fixed catalog data; no clocks,
// randomness, or network media — every tile, quickview pane, and swatch
// is a layered CSS gradient/pattern weave keyed to the colorway.

type VariantId = 'modal' | 'wide' | 'drawer';

const VARIANTS: ReadonlyArray<{id: VariantId; label: string}> = [
  {id: 'modal', label: 'Modal'},
  {id: 'wide', label: 'Wide'},
  {id: 'drawer', label: 'Drawer'},
];

const VARIANT_LABEL: Record<VariantId, string> = {
  modal: 'standard modal',
  wide: 'wide modal with details',
  drawer: 'slide-over drawer',
};

const SIZES = ['XS', 'S', 'M', 'L', 'XL'] as const;

type SizeId = (typeof SIZES)[number];

type StockState = 'in' | 'low' | 'out';

interface SizeStock {
  state: StockState;
  /** Units remaining; only meaningful for low-stock entries. */
  left?: number;
}

interface ColorOption {
  id: string;
  label: string;
  /** Fixed gradient hue pair + saturation for every weave layer. */
  h1: number;
  h2: number;
  s: number;
}

// Weave pattern per piece; cycled by catalog index so tiles read as
// different garments even though every one is pure CSS.
type WeaveId = 'twill' | 'rib' | 'panel' | 'pleat';

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  isNew?: boolean;
  blurb: string;
  fabric: string;
  fit: string;
  colors: ColorOption[];
  /** Per-color exceptions; any size not listed is fully in stock. */
  stock: Record<string, Partial<Record<SizeId, SizeStock>>>;
}

const PRODUCTS: ReadonlyArray<Product> = [
  {
    id: 'av-01',
    name: 'Drift Wool Overcoat',
    brand: 'Meridian Atelier',
    price: 348,
    compareAt: 420,
    rating: 4.8,
    reviews: 212,
    blurb:
      'A double-faced wool topcoat with a dropped shoulder and hidden placket — the lookbook anchor piece.',
    fabric: '78% recycled wool, 20% polyamide, 2% cashmere. Double-faced, unlined.',
    fit: 'Relaxed through the body with a dropped shoulder; runs a half size large. Bracelet-length sleeve on the model (5\'9", size S).',
    colors: [
      {id: 'camel', label: 'Camel', h1: 34, h2: 20, s: 45},
      {id: 'charcoal', label: 'Charcoal', h1: 220, h2: 240, s: 8},
    ],
    stock: {
      camel: {XL: {state: 'low', left: 2}},
      charcoal: {XS: {state: 'out'}, S: {state: 'low', left: 1}},
    },
  },
  {
    id: 'av-02',
    name: 'Harbor Rib Turtleneck',
    brand: 'Vega Knits',
    price: 118,
    rating: 4.6,
    reviews: 486,
    blurb:
      'A chunky fisherman rib with a fold-over collar, knit in one piece so there are no shoulder seams to rub.',
    fabric: '100% extra-fine merino, 7-gauge fisherman rib. Hand wash cold.',
    fit: 'True to size with a close ribbed cuff; size up for a slouchier collar.',
    colors: [
      {id: 'ivory', label: 'Ivory', h1: 42, h2: 50, s: 22},
      {id: 'moss', label: 'Moss', h1: 110, h2: 140, s: 28},
      {id: 'rust', label: 'Rust', h1: 18, h2: 2, s: 55},
    ],
    stock: {
      moss: {M: {state: 'low', left: 3}},
      rust: {L: {state: 'out'}, XL: {state: 'out'}},
    },
  },
  {
    id: 'av-03',
    name: 'Fieldline Utility Jacket',
    brand: 'Meridian Atelier',
    price: 228,
    rating: 4.5,
    reviews: 341,
    blurb:
      'Four bellows pockets, a corduroy under-collar, and a garment-dyed canvas shell that fades like a workwear original.',
    fabric: '10 oz organic cotton canvas, garment-dyed. Corozo buttons.',
    fit: 'Straight through the chest with room for a heavy knit underneath.',
    colors: [
      {id: 'olive', label: 'Olive', h1: 80, h2: 60, s: 32},
      {id: 'sand', label: 'Sand', h1: 40, h2: 30, s: 38},
    ],
    stock: {
      olive: {S: {state: 'out'}},
      sand: {XS: {state: 'low', left: 2}},
    },
  },
  {
    id: 'av-04',
    name: 'Solstice Pleated Midi Skirt',
    brand: 'Studio Vega',
    price: 148,
    compareAt: 178,
    rating: 4.7,
    reviews: 264,
    blurb:
      'Knife pleats heat-set to survive a suitcase, with an elasticated back waist hidden under a flat front band.',
    fabric: '100% recycled polyester twill with permanent heat-set pleats.',
    fit: 'Sits at the natural waist; hits mid-calf on the model (5\'7", size S).',
    colors: [
      {id: 'slate', label: 'Slate blue', h1: 215, h2: 240, s: 34},
      {id: 'plum', label: 'Plum', h1: 300, h2: 330, s: 28},
    ],
    stock: {
      slate: {XS: {state: 'low', left: 1}, XL: {state: 'out'}},
      plum: {},
    },
  },
  {
    id: 'av-05',
    name: 'Verse Straight-Leg Jean',
    brand: 'Vega Denim',
    price: 138,
    rating: 4.4,
    reviews: 892,
    blurb:
      'Rigid 13 oz selvedge that breaks in fast, cut straight from hip to hem with a clean high rise.',
    fabric: '13 oz Japanese selvedge denim, 100% cotton. Wash inside out, rarely.',
    fit: 'High rise, straight leg, 28" inseam on every size. Runs true.',
    colors: [
      {id: 'indigo', label: 'Indigo', h1: 225, h2: 250, s: 45},
      {id: 'washed-black', label: 'Washed black', h1: 240, h2: 260, s: 6},
    ],
    stock: {
      indigo: {M: {state: 'low', left: 2}},
      'washed-black': {S: {state: 'out'}, M: {state: 'out'}},
    },
  },
  {
    id: 'av-06',
    name: 'Cinder Boxy Tee',
    brand: 'Vega Knits',
    price: 48,
    rating: 4.3,
    reviews: 1057,
    isNew: true,
    blurb:
      'A heavyweight boxy tee with a ribbed collar that refuses to bacon — the lookbook layering staple.',
    fabric: '6.5 oz carded open-end cotton jersey, enzyme washed.',
    fit: 'Boxy and cropped; the model wears one size up for extra drape.',
    colors: [
      {id: 'bone', label: 'Bone', h1: 45, h2: 40, s: 14},
      {id: 'ink', label: 'Ink', h1: 230, h2: 250, s: 10},
      {id: 'clay', label: 'Clay', h1: 20, h2: 10, s: 45},
    ],
    stock: {
      ink: {XS: {state: 'low', left: 3}},
      clay: {XL: {state: 'low', left: 1}},
    },
  },
  {
    id: 'av-07',
    name: 'Alpine Down Liner Vest',
    brand: 'Meridian Atelier',
    price: 168,
    rating: 4.6,
    reviews: 428,
    blurb:
      'A featherweight 800-fill vest sized to zip under the Fieldline jacket or wear alone over the Harbor rib.',
    fabric: '800-fill RDS down, 10-denier ripstop shell. Packs into its chest pocket.',
    fit: 'Trim liner fit — size up if you want it as an outer layer.',
    colors: [
      {id: 'ember', label: 'Ember', h1: 18, h2: 350, s: 55},
      {id: 'spruce', label: 'Spruce', h1: 160, h2: 180, s: 28},
    ],
    stock: {
      ember: {L: {state: 'low', left: 2}, XL: {state: 'out'}},
      spruce: {XS: {state: 'out'}},
    },
  },
  {
    id: 'av-08',
    name: 'Tidal Linen Shirt',
    brand: 'Studio Vega',
    price: 98,
    compareAt: 124,
    rating: 4.5,
    reviews: 613,
    isNew: true,
    blurb:
      'Washed European linen with a camp collar and shell buttons — cut long enough to wear open as a light layer.',
    fabric: '100% European flax linen, garment washed for softness.',
    fit: 'Easy through the body with a camp collar; true to size.',
    colors: [
      {id: 'seafoam', label: 'Seafoam', h1: 165, h2: 190, s: 30},
      {id: 'white', label: 'White', h1: 48, h2: 50, s: 6},
    ],
    stock: {
      seafoam: {S: {state: 'low', left: 2}},
      white: {M: {state: 'out'}},
    },
  },
];

const WEAVES: ReadonlyArray<WeaveId> = ['twill', 'rib', 'panel', 'pleat'];

const SHIPPING_NOTES = [
  {
    icon: TruckIcon,
    title: 'Free shipping over $100',
    detail: 'Standard delivery in 3–5 business days; ships in 1–2.',
  },
  {
    icon: RotateCcwIcon,
    title: '45-day returns',
    detail: 'Free returns and exchanges on unworn pieces with tags.',
  },
] as const;

/** Stepper ceiling for fully stocked sizes. */
const MAX_QUANTITY = 8;

// ============= HELPERS =============

/** Whole-dollar prices render without cents: $348 vs. $348.50. */
function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

/** 1057 -> "1,057" (fixed en-US grouping; deterministic). */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function availabilityFor(
  product: Product,
  colorId: string,
  size: SizeId,
): SizeStock {
  return product.stock[colorId]?.[size] ?? {state: 'in'};
}

function maxQuantityFor(stock: SizeStock): number {
  if (stock.state === 'out') {
    return 0;
  }
  if (stock.state === 'low') {
    return stock.left ?? 1;
  }
  return MAX_QUANTITY;
}

function colorById(product: Product, colorId: string): ColorOption {
  return product.colors.find(color => color.id === colorId) ?? product.colors[0];
}

/** Each piece keeps one weave pattern across every colorway. */
function weaveFor(product: Product): WeaveId {
  const index = PRODUCTS.findIndex(item => item.id === product.id);
  return WEAVES[Math.max(0, index) % WEAVES.length];
}

/**
 * Deterministic garment art: a colorway-keyed base gradient under a
 * per-piece weave pattern (twill diagonals, knit ribs, quilted panels,
 * or knife pleats) and a soft key light. Selecting a different swatch
 * re-renders every pane that shows this piece — no image assets anywhere.
 */
function weaveArtStyle(color: ColorOption, weave: WeaveId): CSSProperties {
  const {h1, h2, s} = color;
  const base = `linear-gradient(155deg, hsl(${h1}, ${s}%, 52%) 0%, hsl(${h2}, ${s}%, 30%) 100%)`;
  const keyLight = `radial-gradient(120% 85% at 24% 14%, hsla(${h1}, ${Math.min(s + 20, 80)}%, 82%, 0.4), transparent 58%)`;
  let pattern: string;
  switch (weave) {
    case 'twill':
      pattern = `repeating-linear-gradient(45deg, hsla(${h1}, ${s}%, 88%, 0.14) 0 3px, transparent 3px 9px)`;
      break;
    case 'rib':
      pattern = `repeating-linear-gradient(90deg, hsla(${h1}, ${s}%, 90%, 0.18) 0 4px, transparent 4px 11px)`;
      break;
    case 'panel':
      // Scheme-locked stitch shadow on the fixed colorway gradient (see
      // header color policy) — quilting seams stay dark in both modes.
      pattern = `repeating-linear-gradient(0deg, rgba(10, 10, 12, 0.16) 0 2px, transparent 2px 34px)`;
      break;
    case 'pleat':
      pattern = `repeating-linear-gradient(100deg, hsla(${h2}, ${s}%, 14%, 0.22) 0 6px, transparent 6px 18px)`;
      break;
  }
  // colorScheme: 'light' locks the art surface — garment colorways are
  // product imagery and must not shift with the page scheme.
  return {background: [keyLight, pattern, base].join(', '), colorScheme: 'light'};
}

function swatchArtStyle(color: ColorOption): CSSProperties {
  return {
    background: `linear-gradient(135deg, hsl(${color.h1}, ${color.s}%, 55%) 0%, hsl(${color.h2}, ${color.s}%, 32%) 100%)`,
    colorScheme: 'light',
  };
}

// ============= SHARED PIECES =============

/** Colorway-keyed weave art filling its parent AspectRatio box. */
function GarmentArt({product, color}: {product: Product; color: ColorOption}) {
  return (
    <div
      style={{...styles.artFill, ...weaveArtStyle(color, weaveFor(product))}}
      role="img"
      aria-label={`${product.name} in ${color.label}`}
    />
  );
}

/** Price with sale strikethrough when compareAt is set. */
function PriceLine({product}: {product: Product}) {
  return (
    <HStack gap={2} vAlign="center">
      <Text type="label">{formatPrice(product.price)}</Text>
      {product.compareAt != null ? (
        <Text type="supporting" color="secondary" hasStrikethrough>
          {formatPrice(product.compareAt)}
        </Text>
      ) : null}
    </HStack>
  );
}

/** Rating + review count pair, shared by tiles and quickviews. */
function RatingLine({product}: {product: Product}) {
  return (
    <HStack gap={1.5} vAlign="center">
      <Badge
        variant={product.rating >= 4.5 ? 'green' : 'neutral'}
        label={`★ ${product.rating.toFixed(1)}`}
      />
      <Text type="supporting" color="secondary" hasTabularNumbers>
        ({formatCount(product.reviews)})
      </Text>
    </HStack>
  );
}

/** Availability line for the currently selected color + size pair. */
function StockStatusLine({
  stock,
  hasSize,
}: {
  stock: SizeStock;
  hasSize: boolean;
}) {
  if (!hasSize) {
    return (
      <Text type="supporting" color="secondary">
        Pick a size to check availability.
      </Text>
    );
  }
  if (stock.state === 'out') {
    return (
      <HStack gap={2} vAlign="center">
        <Badge variant="neutral" label="Sold out" />
        <Text type="supporting" color="secondary">
          This size is gone in this color.
        </Text>
      </HStack>
    );
  }
  if (stock.state === 'low') {
    return (
      <HStack gap={2} vAlign="center">
        <Badge variant="warning" label={`Only ${stock.left ?? 1} left`} />
        <Text type="supporting" color="secondary">
          Ships in 1–2 business days.
        </Text>
      </HStack>
    );
  }
  return (
    <HStack gap={2} vAlign="center">
      <Badge variant="green" label="In stock" />
      <Text type="supporting" color="secondary">
        Ships in 1–2 business days.
      </Text>
    </HStack>
  );
}

// ============= LOOKBOOK TILE =============

/**
 * Lookbook tile: the 3:4 weave art is itself a button that opens the
 * quickview (with Sale/New corner Badges), followed by identity, price,
 * rating, and an explicit Quick view button. Nothing depends on hover.
 */
function LookbookTile({
  product,
  onQuickView,
}: {
  product: Product;
  onQuickView: (id: string) => void;
}) {
  const defaultColor = product.colors[0];
  return (
    <Card padding={3} height="100%">
      <VStack gap={2}>
        <button
          type="button"
          aria-label={`Quick view ${product.name}`}
          style={styles.tileArtButton}
          onClick={() => onQuickView(product.id)}>
          <AspectRatio ratio={3 / 4}>
            <div style={styles.tileArt}>
              <GarmentArt product={product} color={defaultColor} />
            </div>
          </AspectRatio>
          <div style={styles.tileBadges}>
            {product.compareAt != null ? (
              <Badge variant="red" label="Sale" />
            ) : null}
            {product.isNew ? <Badge variant="info" label="New" /> : null}
          </div>
        </button>
        <VStack gap={0.5}>
          <Text type="body" maxLines={2}>
            {product.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {product.brand} · {product.colors.length}{' '}
            {product.colors.length === 1 ? 'color' : 'colors'}
          </Text>
        </VStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <PriceLine product={product} />
          </StackItem>
          <RatingLine product={product} />
        </HStack>
        <Button
          label={`Quick view ${product.name}`}
          variant="secondary"
          icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
          onClick={() => onQuickView(product.id)}
          style={styles.controlTouchWide}>
          Quick view
        </Button>
      </VStack>
    </Card>
  );
}

// ============= QUICKVIEW SELECTORS =============

function ColorSwatchRow({
  product,
  selectedId,
  onSelect,
}: {
  product: Product;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected = colorById(product, selectedId);
  return (
    <VStack gap={2}>
      <Text type="label">
        Color ·{' '}
        <Text type="label" color="secondary">
          {selected.label}
        </Text>
      </Text>
      <div style={styles.swatchRow}>
        {product.colors.map(color => (
          <Tooltip key={color.id} content={color.label}>
            <button
              type="button"
              aria-label={`Select color ${color.label}`}
              aria-pressed={color.id === selectedId}
              style={{
                ...styles.swatch,
                ...swatchArtStyle(color),
                ...(color.id === selectedId
                  ? styles.swatchSelected
                  : undefined),
              }}
              onClick={() => onSelect(color.id)}>
              {color.id === selectedId ? (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              ) : null}
            </button>
          </Tooltip>
        ))}
      </div>
    </VStack>
  );
}

/**
 * Size chips. Sold-out sizes stay selectable — picking one is how the
 * notify-me control appears — and are drawn dashed instead of hidden or
 * disabled. While the choose-a-size error is showing, the whole group
 * takes a red outline that clears on the next selection.
 */
function SizeChipGrid({
  product,
  colorId,
  selectedSize,
  hasError,
  onSelect,
}: {
  product: Product;
  colorId: string;
  selectedSize: SizeId | null;
  hasError: boolean;
  onSelect: (size: SizeId) => void;
}) {
  return (
    <VStack gap={2}>
      <Text type="label">Size</Text>
      <div
        style={{
          ...styles.sizeGrid,
          ...(hasError ? styles.sizeGroupError : undefined),
        }}>
        {SIZES.map(size => {
          const stock = availabilityFor(product, colorId, size);
          const isOut = stock.state === 'out';
          const isSelected = size === selectedSize;
          return (
            <button
              key={size}
              type="button"
              aria-label={
                isOut
                  ? `Size ${size}, sold out — select to get notified`
                  : `Select size ${size}`
              }
              aria-pressed={isSelected}
              style={{
                ...styles.sizeChip,
                ...(isOut ? styles.sizeChipOut : undefined),
                ...(isSelected ? styles.sizeChipSelected : undefined),
              }}
              onClick={() => onSelect(size)}>
              {size}
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

/**
 * Per-size stock hints (wide variant only): one supporting line per
 * exception so low and sold-out sizes are visible before selecting.
 */
function SizeStockHints({
  product,
  colorId,
}: {
  product: Product;
  colorId: string;
}) {
  const exceptions = SIZES.map(size => ({
    size,
    stock: availabilityFor(product, colorId, size),
  })).filter(entry => entry.stock.state !== 'in');
  if (exceptions.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        Every size is in stock in this color.
      </Text>
    );
  }
  return (
    <HStack gap={2} vAlign="center" wrap="wrap">
      {exceptions.map(entry => (
        <HStack key={entry.size} gap={1} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {entry.size} ·
          </Text>
          {entry.stock.state === 'out' ? (
            <Badge variant="neutral" label="Sold out" />
          ) : (
            <Badge
              variant="warning"
              label={`${entry.stock.left ?? 1} left`}
            />
          )}
        </HStack>
      ))}
    </HStack>
  );
}

// ============= QUICKVIEW DETAIL STACK =============

interface QuickviewBodyProps {
  product: Product;
  variant: VariantId;
  colorId: string;
  selectedSize: SizeId | null;
  quantity: number;
  sizeError: string | null;
  notifyRequested: boolean;
  onColorSelect: (id: string) => void;
  onSizeSelect: (size: SizeId) => void;
  onQuantityChange: (quantity: number) => void;
  onNotifyToggle: () => void;
  onAddToBag: () => void;
}

/**
 * The interactive detail stack shared by all three dialog variants:
 * identity + price, color swatches, size chips (with the inline
 * choose-a-size error), stock status, quantity stepper, and either the
 * Add-to-bag button or the notify-me toggle when the selected size is
 * sold out. The wide variant additionally renders per-size stock hints.
 */
function QuickviewBody({
  product,
  variant,
  colorId,
  selectedSize,
  quantity,
  sizeError,
  notifyRequested,
  onColorSelect,
  onSizeSelect,
  onQuantityChange,
  onNotifyToggle,
  onAddToBag,
}: QuickviewBodyProps) {
  const stock =
    selectedSize != null
      ? availabilityFor(product, colorId, selectedSize)
      : ({state: 'in'} as SizeStock);
  const isOut = selectedSize != null && stock.state === 'out';
  const maxQuantity = selectedSize != null ? maxQuantityFor(stock) : MAX_QUANTITY;
  const colorLabel = colorById(product, colorId).label;

  return (
    <VStack gap={3}>
      <VStack gap={1}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {product.compareAt != null ? (
            <Badge variant="red" label="Sale" />
          ) : null}
          {product.isNew ? <Badge variant="info" label="New" /> : null}
          <RatingLine product={product} />
        </HStack>
        <PriceLine product={product} />
      </VStack>

      <Text type="body" color="secondary">
        {product.blurb}
      </Text>

      <ColorSwatchRow
        product={product}
        selectedId={colorId}
        onSelect={onColorSelect}
      />

      <SizeChipGrid
        product={product}
        colorId={colorId}
        selectedSize={selectedSize}
        hasError={sizeError != null}
        onSelect={onSizeSelect}
      />
      {sizeError != null ? (
        <p style={styles.errorText} role="alert">
          {sizeError}
        </p>
      ) : null}

      {variant === 'wide' ? (
        <SizeStockHints product={product} colorId={colorId} />
      ) : null}

      <StockStatusLine stock={stock} hasSize={selectedSize != null} />

      <HStack gap={2} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <IconButton
            label="Decrease quantity"
            icon={<Icon icon={MinusIcon} size="sm" />}
            variant="secondary"
            isDisabled={isOut || quantity <= 1}
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            style={styles.controlTouch}
          />
          <Text type="label" hasTabularNumbers style={styles.stepperCount}>
            {isOut ? '—' : quantity}
          </Text>
          <IconButton
            label="Increase quantity"
            icon={<Icon icon={PlusIcon} size="sm" />}
            variant="secondary"
            isDisabled={isOut || quantity >= maxQuantity}
            onClick={() =>
              onQuantityChange(Math.min(maxQuantity, quantity + 1))
            }
            style={styles.controlTouch}
          />
        </HStack>
        <StackItem size="fill">
          <Button
            label={
              isOut
                ? `${selectedSize ?? ''} in ${colorLabel} is sold out`
                : selectedSize == null
                  ? `Add ${product.name} to bag`
                  : `Add ${quantity} to bag — ${colorLabel}, size ${selectedSize}`
            }
            variant="primary"
            icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
            isDisabled={isOut}
            onClick={onAddToBag}
            style={styles.controlTouchWide}>
            {isOut ? 'Sold out' : `Add ${quantity} to bag`}
          </Button>
        </StackItem>
      </HStack>

      {isOut ? (
        <Button
          label={
            notifyRequested
              ? `Restock alert set for size ${selectedSize} in ${colorLabel}`
              : `Email me when size ${selectedSize} in ${colorLabel} is back`
          }
          variant="secondary"
          icon={
            <Icon
              icon={notifyRequested ? CheckIcon : BellIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={onNotifyToggle}
          style={styles.controlTouchWide}>
          {notifyRequested ? "We'll email you" : 'Notify me when available'}
        </Button>
      ) : null}
    </VStack>
  );
}

/**
 * Wide-variant accordion: exclusive Collapsible sections for fabric,
 * fit, and shipping so the larger dialog earns its extra width.
 */
function DetailsAccordion({
  product,
  openSection,
  onSectionChange,
}: {
  product: Product;
  openSection: string | null;
  onSectionChange: (section: string | null) => void;
}) {
  const sections: ReadonlyArray<{id: string; title: string; body: ReactNode}> = [
    {
      id: 'fabric',
      title: 'Fabric & sourcing',
      body: <Text type="body">{product.fabric}</Text>,
    },
    {
      id: 'fit',
      title: 'Fit notes',
      body: <Text type="body">{product.fit}</Text>,
    },
    {
      id: 'shipping',
      title: 'Shipping & returns',
      body: (
        <VStack gap={2}>
          {SHIPPING_NOTES.map(note => (
            <HStack key={note.title} gap={2} vAlign="start">
              <Icon icon={note.icon} size="sm" color="secondary" />
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body" weight="semibold">
                    {note.title}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {note.detail}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      ),
    },
  ];

  return (
    <VStack gap={2}>
      {sections.map((section, index) => (
        <VStack key={section.id} gap={2}>
          {index > 0 ? <Divider /> : null}
          <Collapsible
            isOpen={openSection === section.id}
            onOpenChange={isOpen =>
              onSectionChange(isOpen ? section.id : null)
            }
            trigger={
              <Text type="body" weight="semibold">
                {section.title}
              </Text>
            }>
            {section.body}
          </Collapsible>
        </VStack>
      ))}
    </VStack>
  );
}

// ============= QUICKVIEW DIALOG =============

interface QuickviewDialogProps {
  product: Product;
  variant: VariantId;
  isPhone: boolean;
  notifyKeys: string[];
  onNotifyToggle: (key: string) => void;
  onAddToBag: (
    product: Product,
    colorLabel: string,
    size: SizeId,
    quantity: number,
  ) => void;
  onOpenChange: (isOpen: boolean) => void;
}

/**
 * One quickview, three shells. All three are Dialogs (native <dialog>):
 * focus is trapped inside, Escape and backdrop clicks dismiss
 * (purpose="info"), and focus returns to the tile that opened it.
 * - modal: min(660px, 94vw), art beside the detail stack (stacked <=640px).
 * - wide: min(920px, 96vw), bigger art rail + stock hints + accordion.
 * - drawer: min(420px, 100vw) pinned to the top-right edge, full-height
 *   vertical stack — the shell built for narrow viewports.
 * Mounted with key={product.id + variant} so color/size/quantity state
 * resets per product; notify-me requests persist at page level.
 */
function QuickviewDialog({
  product,
  variant,
  isPhone,
  notifyKeys,
  onNotifyToggle,
  onAddToBag,
  onOpenChange,
}: QuickviewDialogProps) {
  const [colorId, setColorId] = useState(product.colors[0].id);
  const [selectedSize, setSelectedSize] = useState<SizeId | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState<string | null>(null);
  // Wide-variant accordion: exclusive open section, fabric first.
  const [openSection, setOpenSection] = useState<string | null>('fabric');

  const color = colorById(product, colorId);
  const notifyKey = `${product.id}:${colorId}:${selectedSize ?? ''}`;
  const notifyRequested = notifyKeys.includes(notifyKey);

  const clampQuantity = (nextColorId: string, nextSize: SizeId) => {
    const max = maxQuantityFor(availabilityFor(product, nextColorId, nextSize));
    setQuantity(current => Math.min(Math.max(1, max), current));
  };

  const handleColorSelect = (id: string) => {
    setColorId(id);
    if (selectedSize != null) {
      clampQuantity(id, selectedSize);
    }
  };

  const handleSizeSelect = (size: SizeId) => {
    setSelectedSize(size);
    setSizeError(null);
    clampQuantity(colorId, size);
  };

  // Add to bag validates the size choice: no size picked keeps the
  // dialog open and shows the inline role="alert" error instead.
  const handleAddToBag = () => {
    if (selectedSize == null) {
      setSizeError('Choose a size to add this to your bag.');
      return;
    }
    const stock = availabilityFor(product, colorId, selectedSize);
    if (stock.state === 'out') {
      return;
    }
    onAddToBag(product, color.label, selectedSize, quantity);
    onOpenChange(false);
  };

  const body = (
    <QuickviewBody
      product={product}
      variant={variant}
      colorId={colorId}
      selectedSize={selectedSize}
      quantity={quantity}
      sizeError={sizeError}
      notifyRequested={notifyRequested}
      onColorSelect={handleColorSelect}
      onSizeSelect={handleSizeSelect}
      onQuantityChange={setQuantity}
      onNotifyToggle={() => onNotifyToggle(notifyKey)}
      onAddToBag={handleAddToBag}
    />
  );

  const header = (
    <DialogHeader
      title={product.name}
      subtitle={`${product.brand} · ${formatPrice(product.price)}`}
      onOpenChange={onOpenChange}
    />
  );

  const artPane = (railStyle: CSSProperties | undefined, ratio: number) => (
    <div style={{...styles.artBox, ...railStyle}}>
      <AspectRatio ratio={ratio}>
        <GarmentArt product={product} color={color} />
      </AspectRatio>
    </div>
  );

  if (variant === 'drawer') {
    // Right-edge slide-over: a Dialog pinned to the top-right corner
    // running the full viewport height — art on top, stack below.
    return (
      <Dialog
        isOpen
        onOpenChange={onOpenChange}
        purpose="info"
        width="min(420px, 100vw)"
        maxHeight="100vh"
        position={{top: 0, right: 0, bottom: 0}}>
        <Layout
          height="fill"
          header={header}
          content={
            <LayoutContent>
              <VStack gap={4}>
                {artPane(undefined, 4 / 3)}
                {body}
              </VStack>
            </LayoutContent>
          }
        />
      </Dialog>
    );
  }

  if (variant === 'wide') {
    return (
      <Dialog
        isOpen
        onOpenChange={onOpenChange}
        purpose="info"
        width="min(920px, 96vw)"
        maxHeight="88vh">
        <Layout
          header={header}
          content={
            <LayoutContent>
              {isPhone ? (
                <VStack gap={4}>
                  {artPane(undefined, 4 / 3)}
                  {body}
                  <Divider />
                  <DetailsAccordion
                    product={product}
                    openSection={openSection}
                    onSectionChange={setOpenSection}
                  />
                </VStack>
              ) : (
                <HStack gap={5} vAlign="start">
                  {artPane(styles.artRailWide, 3 / 4)}
                  <StackItem size="fill">
                    <VStack gap={4}>
                      {body}
                      <Divider />
                      <DetailsAccordion
                        product={product}
                        openSection={openSection}
                        onSectionChange={setOpenSection}
                      />
                    </VStack>
                  </StackItem>
                </HStack>
              )}
            </LayoutContent>
          }
        />
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen
      onOpenChange={onOpenChange}
      purpose="info"
      width="min(660px, 94vw)"
      maxHeight="88vh">
      <Layout
        header={header}
        content={
          <LayoutContent>
            {isPhone ? (
              <VStack gap={4}>
                {artPane(undefined, 4 / 3)}
                {body}
              </VStack>
            ) : (
              <HStack gap={5} vAlign="start">
                {artPane(styles.artRailModal, 3 / 4)}
                <StackItem size="fill">{body}</StackItem>
              </HStack>
            )}
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// ============= PAGE =============

export default function ProductQuickviewShowcaseTemplate() {
  const [variant, setVariant] = useState<VariantId>('modal');
  const [quickviewId, setQuickviewId] = useState<string | null>(null);
  const [bagCount, setBagCount] = useState(0);
  // Notify-me requests persist across quickview opens, keyed by
  // product:color:size so each sold-out combination remembers its state.
  const [notifyKeys, setNotifyKeys] = useState<string[]>([]);
  const toast = useToast();

  // Single-pane fallback: the switcher moves from the header into the
  // toolbar row and modal/wide quickviews stack art above details.
  const isPhone = useMediaQuery('(max-width: 640px)');

  const handleNotifyToggle = (key: string) => {
    setNotifyKeys(previous =>
      previous.includes(key)
        ? previous.filter(value => value !== key)
        : [...previous, key],
    );
  };

  // Add to bag: bump the header count (the Badge remounts through the
  // pop keyframe) and confirm with a Toast after the dialog closes.
  const handleAddToBag = (
    product: Product,
    colorLabel: string,
    size: SizeId,
    quantity: number,
  ) => {
    setBagCount(previous => previous + quantity);
    toast({
      body: `Added ${quantity} × ${product.name} — ${colorLabel}, size ${size} — to your bag`,
    });
  };

  const quickviewProduct =
    quickviewId != null
      ? PRODUCTS.find(product => product.id === quickviewId)
      : undefined;

  const variantSwitcher = (
    <SegmentedControl
      label="Quickview style"
      value={variant}
      onChange={value => setVariant(value as VariantId)}>
      {VARIANTS.map(option => (
        <SegmentedControlItem
          key={option.id}
          label={option.label}
          value={option.id}
        />
      ))}
    </SegmentedControl>
  );

  // Header bag control: full Button on wide viewports; IconButton with
  // an overlay count Badge on compact so the header fits at 375px. The
  // count wrapper is keyed by bagCount so the pop keyframe replays.
  const bagBadge =
    bagCount > 0 ? (
      <span key={bagCount} style={styles.bagPop}>
        <Badge label={String(bagCount)} variant="info" />
      </span>
    ) : undefined;

  const headerActions = isPhone ? (
    <div style={styles.countWrap}>
      <IconButton
        label={`Bag, ${bagCount} items`}
        icon={<Icon icon={ShoppingBagIcon} size="sm" />}
        variant="secondary"
      />
      {bagCount > 0 ? <div style={styles.countDot}>{bagBadge}</div> : null}
    </div>
  ) : (
    <HStack gap={2} vAlign="center">
      {variantSwitcher}
      <Button
        label={`Bag, ${bagCount} items`}
        variant="secondary"
        icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
        endContent={bagBadge}>
        Bag
      </Button>
    </HStack>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <style>{BAG_POP_KEYFRAMES}</style>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Atelier Vega</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  Fall lookbook · quickview pattern demo
                </Text>
              </VStack>
            </StackItem>
            {headerActions}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6} label="Lookbook grid">
          <VStack gap={4}>
            {/* Toolbar: live variant description, plus the switcher on
                compact where the header can't hold it. wrap="wrap" keeps
                everything on-screen at 375px. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Text type="supporting" color="secondary">
                    {PRODUCTS.length} pieces — every card opens a{' '}
                    {VARIANT_LABEL[variant]} quickview.
                  </Text>
                  <Text type="supporting" color="secondary">
                    Try the Verse jean in Washed black or the Drift coat in
                    Charcoal to reach the sold-out and notify-me states.
                  </Text>
                </VStack>
              </StackItem>
              {isPhone ? variantSwitcher : null}
            </HStack>

            <Grid columns={{minWidth: 210}} gap={4}>
              {PRODUCTS.map(product => (
                <LookbookTile
                  key={product.id}
                  product={product}
                  onQuickView={setQuickviewId}
                />
              ))}
            </Grid>
          </VStack>
        </LayoutContent>
      }
      footer={
        quickviewProduct != null ? (
          <QuickviewDialog
            key={`${quickviewProduct.id}-${variant}`}
            product={quickviewProduct}
            variant={variant}
            isPhone={isPhone}
            notifyKeys={notifyKeys}
            onNotifyToggle={handleNotifyToggle}
            onAddToBag={handleAddToBag}
            onOpenChange={open => {
              if (!open) {
                setQuickviewId(null);
              }
            }}
          />
        ) : undefined
      }
    />
  );
}
