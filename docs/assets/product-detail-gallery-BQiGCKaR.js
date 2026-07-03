var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one product — the 'Cascade Trail
 *   Runner' by Northarc at $148, compare-at $185 — with four colorways,
 *   five gallery views per colorway rendered as layered CSS
 *   gradient/pattern compositions, a seven-size run with per-color
 *   in-stock/low-stock/out-of-stock availability, six spec rows, fixed
 *   shipping/returns/warranty perks, a 1,284-review histogram with fixed
 *   star counts, three featured reviews, and a six-item related row — no
 *   clocks, no randomness, no network image assets)
 * @output E-commerce product detail page: a media gallery (4:3 stage with
 *   always-visible prev/next arrows, view-label and position chips, and a
 *   thumbnail rail whose art re-renders per selected colorway), a sticky
 *   buy box Card with price + compare-at strikethrough and savings Badge,
 *   color swatch and size chip selectors that swap fixture stock state,
 *   a live stock-status line, quantity stepper capped by remaining stock,
 *   add-to-cart wired to the header cart count (plus a notify-me toggle
 *   for sold-out sizes), Collapsible spec MetadataList /
 *   shipping-and-returns / materials-and-care sections, a reviews summary
 *   with rating histogram bars and helpful-vote featured reviews, and a
 *   horizontally scrolling related-items row
 * @position Page template; emitted by \`astryx template product-detail-gallery\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the Breadcrumbs trail
 * (Home / Footwear / Trail running / product) plus share, wishlist, and
 * cart actions with live count Badges. LayoutContent (padding 0) scrolls
 * the whole page inside a centered maxWidth 1280 wrapper: the left column
 * is flexible (min 480) and stacks gallery → info collapsibles → reviews
 * → related row; the right column is a fixed 380px buy rail whose Card is
 * position: sticky so price and add-to-cart stay in view while specs and
 * reviews scroll. This is a single-product purchase surface — choose
 * storefront-browse for the faceted catalog grid and cart-checkout-flow
 * for the basket-to-payment funnel.
 *
 * Responsive contract:
 * - >960px: gallery/info column (min 480, fills) | buy rail 380 (fixed
 *   width, sticky Card offset by the page padding).
 * - <=960px: one column — gallery, then the buy box inline (sticky is
 *   dropped so the tall Card never pins over content), then info
 *   sections, reviews, and the related row.
 * - >640px: the thumbnail rail is a vertical 64px strip beside the stage;
 *   <=640px it moves below the stage as a horizontal strip with
 *   deliberate overflowX auto scrolling (the only sideways scroll besides
 *   the related row, which scrolls x at every width with snap points).
 * - <=640px: Breadcrumbs shorten to the last two segments and the header
 *   wishlist/cart Buttons collapse to IconButtons with overlay count
 *   Badges so the row fits a 375px frame; the "sm" stage arrows take the
 *   40px tap-target override, and the review Helpful buttons take the
 *   height-only override.
 * - Color swatches (40px), size chips (min 56 x 40), thumbnails (64px),
 *   and the quantity stepper IconButtons (40px) are tap-sized at every
 *   width. Nothing is hover-only: swatch Tooltips are reinforced by the
 *   'Color · Ember Rust' label text, stage arrows are always visible,
 *   and out-of-stock sizes stay rendered (disabled) rather than hiding.
 *
 * Container policy (product-detail archetype): frame-first page chrome;
 * Cards for the stage surface, the buy box, and each collapsible info
 * section. Histogram bars, featured reviews, and related tiles are plain
 * rows/buttons — no card-in-card nesting. All product art is layered CSS
 * gradients keyed to the selected colorway, so the template ships zero
 * image assets.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BellIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  RotateCcwIcon,
  RulerIcon,
  Share2Icon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ThumbsUpIcon,
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
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered page wrapper; the gallery/buy column pair lives inside it.
  wrapper: {
    width: '100%',
    maxWidth: 1280,
    marginInline: 'auto',
    padding: 'var(--spacing-5)',
  },
  columns: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'flex-start',
  },
  leftColumn: {flex: 1, minWidth: 480},
  buyRail: {width: 380, flexShrink: 0},
  // The buy Card pins while specs and reviews scroll (wide viewports
  // only; stacked layouts render it inline).
  buyBoxSticky: {position: 'sticky', top: 'var(--spacing-5)'},
  // Gallery stage: gradient art inside a Card; overlays pin to corners.
  stageCard: {overflow: 'hidden'},
  stageArt: {position: 'relative', width: '100%', height: '100%'},
  stageBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    display: 'flex',
    gap: 6,
  },
  // Always-visible prev/next arrows — never hover-revealed.
  stageNav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 2,
  },
  stageNavStart: {left: 8},
  stageNavEnd: {right: 8},
  viewChip: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    zIndex: 2,
    backgroundColor: 'rgba(8, 8, 10, 0.72)',
    color: '#FFFFFF',
    fontSize: 12,
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 999,
    lineHeight: 1.4,
  },
  positionChip: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    zIndex: 2,
    backgroundColor: 'rgba(8, 8, 10, 0.72)',
    color: '#FFFFFF',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 999,
    lineHeight: 1.4,
  },
  // Thumbnail rail: vertical 64px strip beside the stage on wide
  // viewports; horizontal strip with deliberate x-scroll under 640px.
  thumbRailVertical: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
  },
  thumbRailHorizontal: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    WebkitOverflowScrolling: 'touch',
  },
  thumb: {
    width: 64,
    height: 64,
    flexShrink: 0,
    padding: 0,
    borderRadius: 'var(--radius-element)',
    border: '2px solid transparent',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'none',
  },
  thumbSelected: {borderColor: 'var(--color-accent)'},
  thumbArt: {width: '100%', height: '100%'},
  galleryRow: {display: 'flex', gap: 'var(--spacing-3)'},
  galleryStageWrap: {flex: 1, minWidth: 0},
  // Color swatches: 40px round gradient buttons with a selected ring.
  swatchRow: {display: 'flex', gap: 10, flexWrap: 'wrap'},
  swatch: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '2px solid var(--color-border)',
    padding: 0,
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
  },
  swatchSelected: {
    borderColor: 'var(--color-accent)',
    boxShadow: '0 0 0 2px var(--color-background), 0 0 0 4px var(--color-accent)',
  },
  // Size chips: min 56x40 tap targets in a wrapping grid; out-of-stock
  // chips stay visible but disabled with a struck label.
  sizeGrid: {display: 'flex', gap: 8, flexWrap: 'wrap'},
  sizeChip: {
    minWidth: 56,
    height: 40,
    paddingInline: 10,
    borderRadius: 'var(--radius-element)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background)',
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
    cursor: 'not-allowed',
    color: 'var(--color-text-secondary)',
    textDecoration: 'line-through',
    backgroundColor: 'var(--color-background-gray)',
  },
  // Quantity stepper: 40px IconButtons flanking a tabular count.
  stepperCount: {minWidth: 32, textAlign: 'center'},
  controlTouch: {width: 40, height: 40},
  controlTouchWide: {height: 40},
  // Rating histogram: plain div track + fill, star label, tabular count.
  histogramTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-gray)',
    overflow: 'hidden',
  },
  histogramFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
  },
  histogramStars: {width: 28, flexShrink: 0},
  histogramCount: {width: 44, flexShrink: 0, textAlign: 'right'},
  reviewBody: {minWidth: 0},
  // Related row: the only always-on sideways scroller — snap points keep
  // tiles tidy and the row never forces the page wider.
  relatedRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBottom: 8,
    scrollSnapType: 'x proximity',
    WebkitOverflowScrolling: 'touch',
  },
  // Whole related tile is a real button; resets keep it card-shaped.
  relatedTile: {
    width: 200,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    padding: 0,
    border: 'none',
    background: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    borderRadius: 'var(--radius-element)',
    font: 'inherit',
    color: 'inherit',
  },
  relatedArt: {
    position: 'relative',
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
  },
  // Compact header actions: IconButton with an overlay count Badge.
  countWrap: {position: 'relative', display: 'inline-flex'},
  countDot: {
    position: 'absolute',
    top: -6,
    right: -6,
    zIndex: 1,
    pointerEvents: 'none',
  },
  perkRow: {minWidth: 0},
};

// ============= DATA =============
// Northarc — Cascade Trail Runner. Fixed catalog data; no clocks,
// randomness, or network media — every gallery frame, thumbnail, swatch,
// and related tile is a layered CSS gradient/pattern composition.

const PRODUCT_NAME = 'Cascade Trail Runner';
const BRAND_NAME = 'Northarc';
const PRICE = 148;
const COMPARE_AT = 185;
const SAVINGS_LABEL = '20% off';
const RATING_AVG = '4.4';
const REVIEW_TOTAL = 1284;
const STYLE_CODE = 'NA-2318-TR';

const BREADCRUMB_TRAIL = ['Home', 'Footwear', 'Trail running'];

type ColorId = 'ember' | 'moss' | 'slate' | 'sand';

interface Colorway {
  id: ColorId;
  label: string;
  /** Fixed gradient hue pair for every frame of this colorway. */
  h1: number;
  h2: number;
}

const COLORWAYS: ReadonlyArray<Colorway> = [
  {id: 'ember', label: 'Ember Rust', h1: 18, h2: 348},
  {id: 'moss', label: 'Moss Green', h1: 110, h2: 150},
  {id: 'slate', label: 'Slate Blue', h1: 210, h2: 240},
  {id: 'sand', label: 'Desert Sand', h1: 42, h2: 24},
];

type ViewId = 'side' | 'top' | 'sole' | 'onfoot' | 'detail';

const VIEWS: ReadonlyArray<{id: ViewId; label: string}> = [
  {id: 'side', label: 'Side profile'},
  {id: 'top', label: 'Top down'},
  {id: 'sole', label: 'Outsole tread'},
  {id: 'onfoot', label: 'On foot'},
  {id: 'detail', label: 'Lacing detail'},
];

const SIZES = ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];

type StockState = 'in' | 'low' | 'out';

interface SizeAvailability {
  state: StockState;
  /** Units remaining; only meaningful for low-stock entries. */
  left?: number;
}

// Per-color exceptions; any size not listed here is fully in stock.
const STOCK_EXCEPTIONS: Record<ColorId, Record<string, SizeAvailability>> = {
  ember: {
    'US 8': {state: 'low', left: 2},
    'US 13': {state: 'out'},
  },
  moss: {
    'US 7': {state: 'out'},
  },
  slate: {
    'US 9': {state: 'low', left: 3},
    'US 12': {state: 'out'},
  },
  sand: {
    'US 10': {state: 'out'},
    'US 11': {state: 'low', left: 1},
  },
};

/** Stepper ceiling for fully stocked sizes. */
const MAX_QUANTITY = 9;

const SPEC_ROWS = [
  {label: 'Weight', value: "9.8 oz (men's US 9)"},
  {label: 'Drop', value: '6 mm'},
  {label: 'Stack height', value: '32 mm heel / 26 mm forefoot'},
  {label: 'Upper', value: 'Recycled engineered mesh'},
  {label: 'Plate', value: 'Nylon propulsion plate'},
  {label: 'Lugs', value: '4 mm multidirectional'},
];

const SHIPPING_ROWS = [
  {
    icon: TruckIcon,
    title: 'Free shipping over $75',
    detail: 'Standard delivery in 3–5 business days; ships in 1–2.',
  },
  {
    icon: RotateCcwIcon,
    title: '60-day trail trial',
    detail: 'Run in them. Return worn pairs within 60 days, no fee.',
  },
  {
    icon: ShieldCheckIcon,
    title: '2-year manufacturing warranty',
    detail: 'Covers delamination, weld failures, and hardware.',
  },
];

const CARE_PARAGRAPHS = [
  'Knock soles together to shed dried mud, then hand-wash the uppers with cold water and a soft brush. Skip the machine — heat weakens the midsole weld.',
  'Air-dry away from radiators with the insoles pulled. Stuffing with newspaper halves the drying time and keeps the toe box shape.',
  'The recycled mesh upper contains 62% post-consumer yarn; the outsole returns to our re-grind program through any retail drop-off.',
];

// Histogram: fixed star counts summing to REVIEW_TOTAL (1,284).
const HISTOGRAM: ReadonlyArray<{stars: number; count: number}> = [
  {stars: 5, count: 812},
  {stars: 4, count: 291},
  {stars: 3, count: 104},
  {stars: 2, count: 46},
  {stars: 1, count: 31},
];

interface Review {
  id: string;
  author: string;
  /** Fixed relative-age label (no clocks). */
  age: string;
  rating: number;
  sizeBought: string;
  colorBought: string;
  title: string;
  text: string;
  helpful: number;
}

const REVIEWS: ReadonlyArray<Review> = [
  {
    id: 'rv-1',
    author: 'Dana Whitmore',
    age: '2 weeks ago',
    rating: 5,
    sizeBought: 'US 10',
    colorBought: 'Moss Green',
    title: 'Plated shoe that still flexes on scree',
    text: 'I put 180 miles on these across the Cascades loop — the nylon plate gives real pop on climbs without the plank feel most plated trail shoes have. Lugs held on wet granite. True to size for a medium-width foot.',
    helpful: 64,
  },
  {
    id: 'rv-2',
    author: 'Marcus Bell',
    age: '1 month ago',
    rating: 4,
    sizeBought: 'US 12',
    colorBought: 'Ember Rust',
    title: 'Great grip, runs a touch warm',
    text: 'Traction is the headline: 4 mm lugs bite in mud that swallowed my previous pair. The mesh is durable but not the most breathable — my summer runs above 85°F got swampy. Sizing up a half was the right call for me.',
    helpful: 38,
  },
  {
    id: 'rv-3',
    author: 'Priya Raman',
    age: '2 months ago',
    rating: 5,
    sizeBought: 'US 8',
    colorBought: 'Slate Blue',
    title: 'Replaced my road shoe for door-to-trail',
    text: 'The 6 mm drop and firm heel counter make pavement miles to the trailhead painless. After 200 miles the tread shows barely any wear on the toe lugs. The Slate Blue colorway is even better in person.',
    helpful: 51,
  },
];

interface RelatedItem {
  id: string;
  name: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  /** Fixed gradient hues for the mock tile art. */
  hues: [number, number];
}

const RELATED: ReadonlyArray<RelatedItem> = [
  {id: 'rel-1', name: 'Ridgeline Merino Run Sock (2-pack)', price: 26, rating: 4.7, reviews: 903, hues: [152, 178]},
  {id: 'rel-2', name: 'Cascade Gaiter Trap Kit', price: 18, rating: 4.3, reviews: 217, hues: [24, 46]},
  {id: 'rel-3', name: 'Northarc Trail Cap', price: 32, compareAt: 40, rating: 4.5, reviews: 441, hues: [206, 232]},
  {id: 'rel-4', name: 'Switchback Hydration Vest 5L', price: 119, rating: 4.6, reviews: 388, hues: [268, 292]},
  {id: 'rel-5', name: 'Granite Grip Insole', price: 34, rating: 4.2, reviews: 156, hues: [40, 18]},
  {id: 'rel-6', name: 'Cascade Trail Runner GTX', price: 178, rating: 4.5, reviews: 512, hues: [340, 8]},
];

// ============= HELPERS =============

/** Whole-dollar prices render without cents: $148 vs. $148.50. */
function formatPrice(value: number): string {
  return Number.isInteger(value) ? \`$\${value}\` : \`$\${value.toFixed(2)}\`;
}

/** 1284 -> "1,284" (fixed en-US grouping; deterministic). */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

function availabilityFor(colorId: ColorId, size: string): SizeAvailability {
  return STOCK_EXCEPTIONS[colorId][size] ?? {state: 'in'};
}

function maxQuantityFor(availability: SizeAvailability): number {
  if (availability.state === 'out') {
    return 0;
  }
  if (availability.state === 'low') {
    return availability.left ?? 1;
  }
  return MAX_QUANTITY;
}

/**
 * Deterministic product art: each view composes a different layered
 * gradient/pattern stack from the colorway's fixed hue pair, so swapping
 * the color swatch visibly re-renders every gallery frame and thumbnail.
 */
function viewArtStyle(color: Colorway, viewId: ViewId): CSSProperties {
  const {h1, h2} = color;
  const base = \`linear-gradient(150deg, hsl(\${h1}, 48%, 46%) 0%, hsl(\${h2}, 42%, 24%) 100%)\`;
  let layers: string[];
  switch (viewId) {
    case 'side':
      layers = [
        \`radial-gradient(120% 85% at 24% 16%, hsla(\${h1}, 70%, 78%, 0.55), transparent 60%)\`,
        \`radial-gradient(70% 40% at 55% 92%, rgba(10, 10, 12, 0.45), transparent 70%)\`,
        base,
      ];
      break;
    case 'top':
      layers = [
        \`radial-gradient(55% 75% at 50% 45%, hsla(\${h1}, 62%, 70%, 0.5), transparent 65%)\`,
        \`linear-gradient(180deg, hsl(\${h2}, 38%, 34%) 0%, hsl(\${h1}, 44%, 22%) 100%)\`,
      ];
      break;
    case 'sole':
      // Tread pattern: alternating diagonal lug stripes over a dark base.
      layers = [
        \`repeating-linear-gradient(45deg, hsla(\${h1}, 45%, 62%, 0.42) 0 12px, transparent 12px 26px)\`,
        \`repeating-linear-gradient(-45deg, rgba(8, 8, 10, 0.3) 0 8px, transparent 8px 22px)\`,
        \`linear-gradient(160deg, hsl(\${h2}, 30%, 26%) 0%, hsl(\${h2}, 34%, 14%) 100%)\`,
      ];
      break;
    case 'onfoot':
      layers = [
        \`radial-gradient(90% 60% at 30% 30%, hsla(\${h1}, 66%, 74%, 0.5), transparent 62%)\`,
        \`radial-gradient(100% 35% at 50% 100%, rgba(10, 10, 12, 0.55), transparent 75%)\`,
        \`linear-gradient(165deg, hsl(\${h1}, 40%, 40%) 0%, hsl(\${h2}, 46%, 20%) 100%)\`,
      ];
      break;
    case 'detail':
      // Lacing pattern: thin vertical straps over a soft key light.
      layers = [
        \`repeating-linear-gradient(90deg, hsla(\${h2}, 40%, 82%, 0.35) 0 6px, transparent 6px 30px)\`,
        \`radial-gradient(110% 80% at 70% 20%, hsla(\${h1}, 68%, 76%, 0.45), transparent 58%)\`,
        base,
      ];
      break;
  }
  return {background: layers.join(', ')};
}

function swatchArtStyle(color: Colorway): CSSProperties {
  return {
    background: \`linear-gradient(135deg, hsl(\${color.h1}, 55%, 48%) 0%, hsl(\${color.h2}, 45%, 30%) 100%)\`,
  };
}

function relatedArtStyle(item: RelatedItem): CSSProperties {
  const [h1, h2] = item.hues;
  return {
    background: [
      \`radial-gradient(110% 80% at 30% 25%, hsla(\${h1}, 55%, 68%, 0.55), transparent 60%)\`,
      \`linear-gradient(135deg, hsl(\${h1}, 42%, 40%) 0%, hsl(\${h2}, 46%, 20%) 100%)\`,
    ].join(', '),
  };
}

// ============= GALLERY =============

interface GalleryProps {
  color: Colorway;
  viewIndex: number;
  onViewChange: (index: number) => void;
  isPhone: boolean;
  isOnSale: boolean;
}

/**
 * Main stage + thumbnail rail. The rail sits beside the stage on wide
 * viewports and becomes a horizontal x-scroll strip below it under
 * 640px. Prev/next arrows are always visible (never hover-revealed) and
 * wrap around the five fixed views.
 */
function Gallery({color, viewIndex, onViewChange, isPhone, isOnSale}: GalleryProps) {
  const view = VIEWS[viewIndex];
  const touch = isPhone ? styles.controlTouch : undefined;

  const goPrev = () =>
    onViewChange((viewIndex - 1 + VIEWS.length) % VIEWS.length);
  const goNext = () => onViewChange((viewIndex + 1) % VIEWS.length);

  const thumbs = VIEWS.map((thumbView, index) => (
    <Tooltip key={thumbView.id} content={thumbView.label}>
      <button
        type="button"
        aria-label={\`Show \${thumbView.label} view\`}
        aria-pressed={index === viewIndex}
        style={{
          ...styles.thumb,
          ...(index === viewIndex ? styles.thumbSelected : undefined),
        }}
        onClick={() => onViewChange(index)}>
        <div style={{...styles.thumbArt, ...viewArtStyle(color, thumbView.id)}} />
      </button>
    </Tooltip>
  ));

  const stage = (
    <Card padding={0} style={styles.stageCard}>
      <AspectRatio ratio={4 / 3}>
        <div style={{...styles.stageArt, ...viewArtStyle(color, view.id)}}>
          <div style={styles.stageBadges}>
            {isOnSale && <Badge variant="red" label="Sale" />}
            <Badge variant="info" label="New season" />
          </div>
          <div style={{...styles.stageNav, ...styles.stageNavStart}}>
            <IconButton
              label="Previous view"
              tooltip="Previous view"
              icon={<Icon icon={ChevronLeftIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              onClick={goPrev}
              style={touch}
            />
          </div>
          <div style={{...styles.stageNav, ...styles.stageNavEnd}}>
            <IconButton
              label="Next view"
              tooltip="Next view"
              icon={<Icon icon={ChevronRightIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              onClick={goNext}
              style={touch}
            />
          </div>
          <span style={styles.viewChip}>
            {view.label} · {color.label}
          </span>
          <span style={styles.positionChip}>
            {viewIndex + 1} / {VIEWS.length}
          </span>
        </div>
      </AspectRatio>
    </Card>
  );

  if (isPhone) {
    // <=640px: stage on top, horizontal thumb strip below (the strip is a
    // deliberate overflowX scroller so five 64px thumbs fit a 375px frame).
    return (
      <VStack gap={2}>
        {stage}
        <div style={styles.thumbRailHorizontal}>{thumbs}</div>
      </VStack>
    );
  }

  return (
    <div style={styles.galleryRow}>
      <div style={styles.thumbRailVertical}>{thumbs}</div>
      <div style={styles.galleryStageWrap}>{stage}</div>
    </div>
  );
}

// ============= VARIANT SELECTORS =============

function ColorSwatchRow({
  selectedId,
  onSelect,
}: {
  selectedId: ColorId;
  onSelect: (id: ColorId) => void;
}) {
  const selected = COLORWAYS.find(color => color.id === selectedId);
  return (
    <VStack gap={2}>
      <Text type="label">
        Color ·{' '}
        <Text type="label" color="secondary">
          {selected?.label}
        </Text>
      </Text>
      <div style={styles.swatchRow}>
        {COLORWAYS.map(color => (
          <Tooltip key={color.id} content={color.label}>
            <button
              type="button"
              aria-label={\`Select color \${color.label}\`}
              aria-pressed={color.id === selectedId}
              style={{
                ...styles.swatch,
                ...swatchArtStyle(color),
                ...(color.id === selectedId
                  ? styles.swatchSelected
                  : undefined),
              }}
              onClick={() => onSelect(color.id)}>
              {color.id === selectedId && (
                <Icon icon={CheckIcon} size="sm" color="inherit" />
              )}
            </button>
          </Tooltip>
        ))}
      </div>
    </VStack>
  );
}

function SizeChipGrid({
  colorId,
  selectedSize,
  onSelect,
}: {
  colorId: ColorId;
  selectedSize: string;
  onSelect: (size: string) => void;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Size · US men&apos;s</Text>
        </StackItem>
        <Button
          label="Size guide"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RulerIcon} size="sm" color="inherit" />}
          tooltip="Runs true to size; between sizes, go up a half"
          onClick={() => {}}
        />
      </HStack>
      <div style={styles.sizeGrid}>
        {SIZES.map(size => {
          const availability = availabilityFor(colorId, size);
          const isOut = availability.state === 'out';
          const isSelected = size === selectedSize;
          return (
            <button
              key={size}
              type="button"
              aria-label={isOut ? \`\${size}, out of stock\` : \`Select size \${size}\`}
              aria-pressed={isSelected}
              disabled={isOut}
              style={{
                ...styles.sizeChip,
                ...(isSelected ? styles.sizeChipSelected : undefined),
                ...(isOut ? styles.sizeChipOut : undefined),
              }}
              onClick={() => onSelect(size)}>
              {size.replace('US ', '')}
            </button>
          );
        })}
      </div>
    </VStack>
  );
}

// ============= BUY BOX =============

function StockStatusLine({availability}: {availability: SizeAvailability}) {
  if (availability.state === 'out') {
    return (
      <HStack gap={2} vAlign="center">
        <Badge variant="neutral" label="Out of stock" />
        <Text type="supporting" color="secondary">
          This size is sold out in this color.
        </Text>
      </HStack>
    );
  }
  if (availability.state === 'low') {
    return (
      <HStack gap={2} vAlign="center">
        <Badge variant="warning" label={\`Only \${availability.left ?? 1} left\`} />
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

interface BuyBoxProps {
  colorId: ColorId;
  selectedSize: string;
  quantity: number;
  cartCount: number;
  isWished: boolean;
  notifyKeys: string[];
  onColorSelect: (id: ColorId) => void;
  onSizeSelect: (size: string) => void;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  onWishToggle: (next: boolean) => void;
  onNotifyToggle: () => void;
}

/**
 * The purchase Card: price block, variant selectors, live stock status,
 * quantity stepper, add-to-cart (wired to the header cart count), a
 * notify-me toggle when the selected size is sold out, and the perks
 * list. Sticky on wide viewports; rendered inline when stacked.
 */
function BuyBox({
  colorId,
  selectedSize,
  quantity,
  cartCount,
  isWished,
  notifyKeys,
  onColorSelect,
  onSizeSelect,
  onQuantityChange,
  onAddToCart,
  onWishToggle,
  onNotifyToggle,
}: BuyBoxProps) {
  const availability = availabilityFor(colorId, selectedSize);
  const maxQuantity = maxQuantityFor(availability);
  const isOut = availability.state === 'out';
  const notifyKey = \`\${colorId}:\${selectedSize}\`;
  const notifyRequested = notifyKeys.includes(notifyKey);
  const colorLabel =
    COLORWAYS.find(color => color.id === colorId)?.label ?? colorId;

  return (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            {BRAND_NAME} · Style {STYLE_CODE}
          </Text>
          <Heading level={1}>{PRODUCT_NAME}</Heading>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Badge variant={Number(RATING_AVG) >= 4.5 ? 'green' : 'neutral'} label={\`★ \${RATING_AVG}\`} />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              ({formatCount(REVIEW_TOTAL)} reviews)
            </Text>
          </HStack>
        </VStack>

        <HStack gap={2} vAlign="center">
          <Heading level={2}>{formatPrice(PRICE)}</Heading>
          <Text type="body" color="secondary" hasStrikethrough>
            {formatPrice(COMPARE_AT)}
          </Text>
          <Badge variant="red" label={SAVINGS_LABEL} />
        </HStack>

        <Divider />

        <ColorSwatchRow selectedId={colorId} onSelect={onColorSelect} />
        <SizeChipGrid
          colorId={colorId}
          selectedSize={selectedSize}
          onSelect={onSizeSelect}
        />

        <StockStatusLine availability={availability} />

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
                  ? \`\${selectedSize} in \${colorLabel} is out of stock\`
                  : \`Add \${quantity} to cart — \${colorLabel}, \${selectedSize}\`
              }
              variant="primary"
              icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
              isDisabled={isOut}
              onClick={onAddToCart}
              style={styles.controlTouchWide}>
              {isOut ? 'Out of stock' : \`Add \${quantity} to cart\`}
            </Button>
          </StackItem>
          <ToggleButton
            label={
              isWished
                ? \`Remove \${PRODUCT_NAME} from wishlist\`
                : \`Add \${PRODUCT_NAME} to wishlist\`
            }
            icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
            isPressed={isWished}
            onPressedChange={onWishToggle}
            tooltip={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            style={styles.controlTouchWide}>
            {isWished ? 'Saved' : 'Save'}
          </ToggleButton>
        </HStack>

        {isOut && (
          <Button
            label={
              notifyRequested
                ? \`Restock alert set for \${selectedSize} in \${colorLabel}\`
                : \`Email me when \${selectedSize} in \${colorLabel} restocks\`
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
        )}

        {cartCount > 0 && (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            In cart · {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </Text>
        )}

        <Divider />

        <VStack gap={2}>
          {SHIPPING_ROWS.map(perk => (
            <HStack key={perk.title} gap={2} vAlign="start">
              <Icon icon={perk.icon} size="sm" color="secondary" />
              <StackItem size="fill" style={styles.perkRow}>
                <Text type="supporting" color="secondary">
                  {perk.title}
                </Text>
              </StackItem>
            </HStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= INFO SECTIONS =============

/** Collapsible section Card shared by specs / shipping / care. */
function InfoSection({
  title,
  supporting,
  isOpen,
  onOpenChange,
  children,
}: {
  title: string;
  supporting: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Card padding={3}>
      <Collapsible
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        trigger={
          <HStack gap={2} vAlign="center">
            <Text type="body" weight="semibold">
              {title}
            </Text>
            {!isOpen && (
              <Text type="supporting" color="secondary" maxLines={1}>
                {supporting}
              </Text>
            )}
          </HStack>
        }>
        {children}
      </Collapsible>
    </Card>
  );
}

function SpecsContent({isNarrow}: {isNarrow: boolean}) {
  return (
    <MetadataList
      columns={isNarrow ? 'single' : 'multi'}
      label={{position: 'start', width: 104}}>
      {SPEC_ROWS.map(spec => (
        <MetadataListItem key={spec.label} label={spec.label}>
          <Text type="body">{spec.value}</Text>
        </MetadataListItem>
      ))}
    </MetadataList>
  );
}

function ShippingContent() {
  return (
    <VStack gap={3}>
      {SHIPPING_ROWS.map(perk => (
        <HStack key={perk.title} gap={2} vAlign="start">
          <Icon icon={perk.icon} size="sm" color="secondary" />
          <StackItem size="fill" style={styles.perkRow}>
            <VStack gap={0}>
              <Text type="body" weight="semibold">
                {perk.title}
              </Text>
              <Text type="supporting" color="secondary">
                {perk.detail}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
      ))}
    </VStack>
  );
}

function CareContent() {
  return (
    <VStack gap={3}>
      {CARE_PARAGRAPHS.map(paragraph => (
        <Text key={paragraph.slice(0, 24)} type="body">
          {paragraph}
        </Text>
      ))}
    </VStack>
  );
}

// ============= REVIEWS =============

function HistogramRow({stars, count}: {stars: number; count: number}) {
  const pct = Math.round((count / REVIEW_TOTAL) * 100);
  return (
    <HStack gap={2} vAlign="center">
      <Text
        type="supporting"
        color="secondary"
        hasTabularNumbers
        style={styles.histogramStars}>
        {stars}★
      </Text>
      <div
        style={styles.histogramTrack}
        role="img"
        aria-label={\`\${stars} star: \${formatCount(count)} reviews (\${pct}%)\`}>
        <div style={{...styles.histogramFill, width: \`\${pct}%\`}} />
      </div>
      <Text
        type="supporting"
        color="secondary"
        hasTabularNumbers
        style={styles.histogramCount}>
        {formatCount(count)}
      </Text>
    </HStack>
  );
}

function ReviewRow({
  review,
  isHelpful,
  onHelpfulToggle,
  isPhone,
}: {
  review: Review;
  isHelpful: boolean;
  onHelpfulToggle: (id: string, next: boolean) => void;
  isPhone: boolean;
}) {
  const helpfulCount = review.helpful + (isHelpful ? 1 : 0);
  return (
    <VStack gap={1} style={styles.reviewBody}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Badge
          variant={review.rating >= 5 ? 'green' : 'neutral'}
          label={\`★ \${review.rating.toFixed(1)}\`}
        />
        <Text type="body" weight="semibold">
          {review.author}
        </Text>
        <Text type="supporting" color="secondary">
          {review.age}
        </Text>
      </HStack>
      <Text type="supporting" color="secondary">
        Bought {review.sizeBought} in {review.colorBought} · Verified purchase
      </Text>
      <Text type="body" weight="semibold">
        {review.title}
      </Text>
      <Text type="body">{review.text}</Text>
      <HStack gap={2} vAlign="center">
        <ToggleButton
          label={
            isHelpful
              ? \`Remove helpful vote for review by \${review.author}\`
              : \`Mark review by \${review.author} helpful\`
          }
          icon={<Icon icon={ThumbsUpIcon} size="sm" color="inherit" />}
          size="sm"
          isPressed={isHelpful}
          onPressedChange={next => onHelpfulToggle(review.id, next)}
          style={isPhone ? styles.controlTouchWide : undefined}>
          Helpful
        </ToggleButton>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatCount(helpfulCount)} found this helpful
        </Text>
      </HStack>
    </VStack>
  );
}

function ReviewsSection({
  helpfulIds,
  onHelpfulToggle,
  isPhone,
}: {
  helpfulIds: string[];
  onHelpfulToggle: (id: string, next: boolean) => void;
  isPhone: boolean;
}) {
  return (
    <VStack gap={4}>
      <Heading level={2}>Reviews</Heading>
      <HStack gap={5} vAlign="start" wrap="wrap">
        <VStack gap={1}>
          <HStack gap={2} vAlign="end">
            <Heading level={2}>{RATING_AVG}</Heading>
            <Text type="supporting" color="secondary">
              out of 5
            </Text>
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatCount(REVIEW_TOTAL)} reviews
          </Text>
          <Badge variant="green" label="86% recommend" />
        </VStack>
        <StackItem size="fill">
          <VStack gap={1.5}>
            {HISTOGRAM.map(bucket => (
              <HistogramRow
                key={bucket.stars}
                stars={bucket.stars}
                count={bucket.count}
              />
            ))}
          </VStack>
        </StackItem>
      </HStack>
      <Divider />
      <VStack gap={4}>
        {REVIEWS.map(review => (
          <ReviewRow
            key={review.id}
            review={review}
            isHelpful={helpfulIds.includes(review.id)}
            onHelpfulToggle={onHelpfulToggle}
            isPhone={isPhone}
          />
        ))}
      </VStack>
      <HStack>
        <Button
          label={\`See all \${formatCount(REVIEW_TOTAL)} reviews\`}
          variant="secondary"
          onClick={() => {}}>
          See all {formatCount(REVIEW_TOTAL)} reviews
        </Button>
      </HStack>
    </VStack>
  );
}

// ============= RELATED ITEMS =============

function RelatedTile({item}: {item: RelatedItem}) {
  return (
    <Tooltip content={\`View \${item.name}\`}>
      <button type="button" style={styles.relatedTile} onClick={() => {}}>
        <VStack gap={1.5}>
          <div style={styles.relatedArt}>
            <AspectRatio ratio={1}>
              <div style={{width: '100%', height: '100%', ...relatedArtStyle(item)}} />
            </AspectRatio>
          </div>
          <Text type="body" maxLines={2}>
            {item.name}
          </Text>
          <HStack gap={2} vAlign="center">
            <Text type="label">{formatPrice(item.price)}</Text>
            {item.compareAt != null && (
              <Text type="supporting" color="secondary" hasStrikethrough>
                {formatPrice(item.compareAt)}
              </Text>
            )}
          </HStack>
          <HStack gap={1.5} vAlign="center">
            <Badge
              variant={item.rating >= 4.5 ? 'green' : 'neutral'}
              label={\`★ \${item.rating.toFixed(1)}\`}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              ({formatCount(item.reviews)})
            </Text>
          </HStack>
        </VStack>
      </button>
    </Tooltip>
  );
}

function RelatedRow() {
  return (
    <VStack gap={3}>
      <Heading level={2}>Pairs well with</Heading>
      {/* Deliberate x-scroller with snap points; tiles keep their 200px
          width at every viewport instead of squeezing the page. */}
      <div style={styles.relatedRow}>
        {RELATED.map(item => (
          <RelatedTile key={item.id} item={item} />
        ))}
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function ProductDetailGalleryTemplate() {
  const [colorId, setColorId] = useState<ColorId>('ember');
  const [viewIndex, setViewIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('US 9');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const [notifyKeys, setNotifyKeys] = useState<string[]>([]);
  const [specsOpen, setSpecsOpen] = useState(true);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [careOpen, setCareOpen] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<string[]>([]);

  // Responsive contract: <=960px the buy box stacks inline under the
  // gallery (sticky dropped); <=640px the thumb rail goes horizontal,
  // breadcrumbs shorten, and header commerce actions become IconButtons.
  const isStacked = useMediaQuery('(max-width: 960px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ----- Variant handlers: keep quantity within the new size's stock -----

  const clampQuantity = (nextColor: ColorId, nextSize: string) => {
    const max = maxQuantityFor(availabilityFor(nextColor, nextSize));
    setQuantity(current => Math.min(Math.max(1, max), Math.max(1, current)));
  };

  const handleColorSelect = (id: ColorId) => {
    setColorId(id);
    clampQuantity(id, selectedSize);
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    clampQuantity(colorId, size);
  };

  const handleAddToCart = () => {
    setCartCount(previous => previous + quantity);
  };

  const handleNotifyToggle = () => {
    const key = \`\${colorId}:\${selectedSize}\`;
    setNotifyKeys(previous =>
      previous.includes(key)
        ? previous.filter(value => value !== key)
        : [...previous, key],
    );
  };

  const handleHelpfulToggle = (id: string, next: boolean) => {
    setHelpfulIds(previous =>
      next ? [...previous, id] : previous.filter(value => value !== id),
    );
  };

  const color = COLORWAYS.find(item => item.id === colorId) ?? COLORWAYS[0];

  // ----- Header: breadcrumbs + share / wishlist / cart actions -----

  // <=640px keeps only the last trail segment before the product so the
  // header never overflows a 375px frame.
  const trail = isPhone
    ? [BREADCRUMB_TRAIL[BREADCRUMB_TRAIL.length - 1], PRODUCT_NAME]
    : [...BREADCRUMB_TRAIL, PRODUCT_NAME];

  const headerActions = isPhone ? (
    <HStack gap={2} vAlign="center">
      <div style={styles.countWrap}>
        <IconButton
          label={isWished ? 'Wishlist, 1 saved' : 'Wishlist, empty'}
          icon={<Icon icon={HeartIcon} size="sm" />}
          variant="secondary"
          onClick={() => setIsWished(previous => !previous)}
        />
        {isWished && (
          <div style={styles.countDot}>
            <Badge label="1" variant="info" />
          </div>
        )}
      </div>
      <div style={styles.countWrap}>
        <IconButton
          label={\`Cart, \${cartCount} items\`}
          icon={<Icon icon={ShoppingBagIcon} size="sm" />}
          variant="secondary"
        />
        {cartCount > 0 && (
          <div style={styles.countDot}>
            <Badge label={String(cartCount)} variant="info" />
          </div>
        )}
      </div>
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center">
      <IconButton
        label={\`Share \${PRODUCT_NAME}\`}
        tooltip="Share"
        icon={<Icon icon={Share2Icon} size="sm" />}
        variant="secondary"
        onClick={() => {}}
      />
      <Button
        label={isWished ? 'Wishlist, 1 saved' : 'Wishlist, empty'}
        variant="secondary"
        icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
        onClick={() => setIsWished(previous => !previous)}
        endContent={isWished ? <Badge label="1" variant="info" /> : undefined}>
        Wishlist
      </Button>
      <Button
        label={\`Cart, \${cartCount} items\`}
        variant="secondary"
        icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
        endContent={
          cartCount > 0 ? (
            <Badge label={String(cartCount)} variant="info" />
          ) : undefined
        }>
        Cart
      </Button>
    </HStack>
  );

  // ----- Column content -----

  const gallery = (
    <Gallery
      color={color}
      viewIndex={viewIndex}
      onViewChange={setViewIndex}
      isPhone={isPhone}
      isOnSale
    />
  );

  const buyBox = (
    <BuyBox
      colorId={colorId}
      selectedSize={selectedSize}
      quantity={quantity}
      cartCount={cartCount}
      isWished={isWished}
      notifyKeys={notifyKeys}
      onColorSelect={handleColorSelect}
      onSizeSelect={handleSizeSelect}
      onQuantityChange={setQuantity}
      onAddToCart={handleAddToCart}
      onWishToggle={setIsWished}
      onNotifyToggle={handleNotifyToggle}
    />
  );

  const infoSections = (
    <VStack gap={3}>
      <InfoSection
        title="Specifications"
        supporting="9.8 oz · 6 mm drop · nylon plate · 4 mm lugs"
        isOpen={specsOpen}
        onOpenChange={setSpecsOpen}>
        <SpecsContent isNarrow={isPhone} />
      </InfoSection>
      <InfoSection
        title="Shipping & returns"
        supporting="Free over $75 · 60-day trail trial · 2-year warranty"
        isOpen={shippingOpen}
        onOpenChange={setShippingOpen}>
        <ShippingContent />
      </InfoSection>
      <InfoSection
        title="Materials & care"
        supporting="62% recycled upper · hand-wash · outsole re-grind program"
        isOpen={careOpen}
        onOpenChange={setCareOpen}>
        <CareContent />
      </InfoSection>
    </VStack>
  );

  const reviews = (
    <ReviewsSection
      helpfulIds={helpfulIds}
      onHelpfulToggle={handleHelpfulToggle}
      isPhone={isPhone}
    />
  );

  let body: ReactNode;
  if (isStacked) {
    // One column: gallery, buy box inline, info, reviews, related.
    body = (
      <VStack gap={5}>
        {gallery}
        {buyBox}
        {infoSections}
        <Divider />
        {reviews}
        <Divider />
        <RelatedRow />
      </VStack>
    );
  } else {
    // Default: (gallery + info + reviews + related) | sticky buy rail 380.
    body = (
      <div style={styles.columns}>
        <div style={styles.leftColumn}>
          <VStack gap={5}>
            {gallery}
            {infoSections}
            <Divider />
            {reviews}
            <Divider />
            <RelatedRow />
          </VStack>
        </div>
        <div style={styles.buyRail}>
          <div style={styles.buyBoxSticky}>{buyBox}</div>
        </div>
      </div>
    );
  }

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Breadcrumbs variant="supporting" label="Catalog path">
                {trail.map((segment, index) => (
                  <BreadcrumbItem
                    key={\`\${index}-\${segment}\`}
                    isCurrent={index === trail.length - 1}
                    onClick={
                      index === trail.length - 1 ? undefined : () => {}
                    }>
                    {segment}
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </StackItem>
            {headerActions}
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} label="Product detail">
          <div style={styles.wrapper}>{body}</div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};