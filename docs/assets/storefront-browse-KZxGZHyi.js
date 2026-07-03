var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (16-product Foundry & Loom home-goods
 *   catalog across five departments with price, compare-at price, rating,
 *   review count, availability state, "new this season" flags, and finish
 *   options; every product tile is a two-color CSS gradient keyed by a
 *   deterministic name hash with an initial-letter watermark — no image
 *   assets, no clocks, no randomness)
 * @output Faceted storefront browse: a left filter rail (department
 *   CheckboxList with facet counts, price range Slider, minimum-rating
 *   RadioList, "In stock only" Switch) driving a results toolbar (live
 *   count, sort Selector, and — on compact — a Filters button that opens
 *   the same facets in a Dialog), an applied-filter Token row where every
 *   Token's onRemove actually clears its facet plus a "Clear all" Button,
 *   a responsive Grid of product Cards with Sale/New corner Badges,
 *   always-visible wishlist ToggleButtons, availability Badges, quick-view
 *   and add-to-cart actions, a quick-view Dialog (large art, finish
 *   SegmentedControl, quantity stepper, add-to-cart that increments the
 *   header cart count, wishlist toggle, shipping/returns perks), and a
 *   load-more pagination footer that appends a page at a time and resets
 *   whenever any facet or the sort changes.
 * @position Page template; emitted by \`astryx template storefront-browse\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the department title,
 * a storefront byline (or the active-filter summary on compact), and the
 * wishlist + cart actions with live count Badges. The start LayoutPanel
 * (280px) is the filter rail; the header "Filters" toggle collapses it.
 * Cards are the correct container for catalog tiles; the chrome stays
 * frame-first and the quick-view surface is a Dialog, not a panel.
 *
 * Responsive contract:
 * - >640px: filter rail is a 280px start LayoutPanel (collapsible via its
 *   hide IconButton or the header "Filters" toggle); the product area
 *   fills the rest and scrolls independently.
 * - <=640px (single-pane fallback for the docked panel): the rail and its
 *   header toggle disappear entirely — the toolbar grows a "Filters"
 *   Button (with a live active-facet Badge) that opens the identical
 *   facet stack in a full-width Dialog with a "Show N results" footer.
 *   The header byline swaps to a compact active-filter summary, and the
 *   wishlist/cart Buttons collapse to IconButtons with overlay count
 *   Badges so the header never overflows at 375px.
 * - Toolbar and applied-token rows use wrap="wrap" so the sort Selector
 *   and Tokens drop to new lines instead of forcing horizontal overflow;
 *   nothing on the page scrolls sideways.
 * - Grid: columns={{minWidth: 230}} — 4-up on wide viewports, reflowing
 *   to 2-up and a single column at 375px.
 * - Quick-view Dialog: side-by-side art + details above 640px; at <=640px
 *   it stacks vertically inside width min(720px, 94vw) and scrolls.
 * - Touch targets: card actions (Quick view, add-to-cart, wishlist
 *   toggle), stepper IconButtons, and every toolbar control are md-size
 *   (~40px). Nothing is hover-only — wishlist toggles and quick-view
 *   buttons are always visible and keyboard reachable.
 *
 * Container policy (commerce-browse archetype): frame-first chrome; Cards
 * for catalog tiles; Dialogs for the quick view and the compact filter
 * sheet; gradient art divs keyed to product names keep the catalog
 * deterministic and asset-free.
 *
 * Color policy: the product-art tiles (GRADIENT_PAIRS hex stops, the white
 * key-light radial, and the white initial watermark + its soft shadow) are
 * deliberately scheme-locked — they stand in for product photography, and
 * photos do not reskin in dark mode. styles.art pins colorScheme: 'light'
 * on that surface, and everything painted on it stays a literal so it reads
 * identically in both schemes. All remaining chrome is Astryx components on
 * tokens, so the rest of the page adapts via light-dark() automatically.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  EyeIcon,
  HeartIcon,
  MinusIcon,
  PackageSearchIcon,
  PlusIcon,
  RotateCcwIcon,
  ShoppingBagIcon,
  SlidersHorizontalIcon,
  TruckIcon,
  XIcon,
} from 'lucide-react';

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
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Card art area: fixed 4:3 box so every tile keeps the same height
  // regardless of name length; badge + wishlist overlays pin to its
  // corners.
  mediaBox: {
    position: 'relative',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  // Gradient stand-in for product photography; the aspect ratio is set
  // per usage (4:3 tiles, 1:1 quick-view art). Scheme-locked (see "Color
  // policy" in the header doc): product "photos" render identically in
  // light and dark, so colorScheme is pinned and the paint stays literal.
  art: {
    position: 'relative',
    width: '100%',
    colorScheme: 'light',
  },
  // Oversized initial watermark centered over the gradient. Literal white
  // + literal shadow on the scheme-locked art surface (not tokens) so it
  // never flips against the fixed gradient.
  artInitial: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 56,
    fontWeight: 800,
    letterSpacing: '0.02em',
    color: 'rgba(255, 255, 255, 0.55)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
    userSelect: 'none',
    pointerEvents: 'none',
  },
  // Corner overlays inside the tile art. They paint on the scheme-locked
  // art surface (see "Color policy" in the header doc), so they pin
  // colorScheme: 'light' too — Badge/ToggleButton tokens resolve to their
  // light values, which is the only rendering that stays readable over the
  // fixed pastel gradients (dark-scheme text tokens wash out on them).
  badgeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    alignItems: 'flex-start',
    colorScheme: 'light',
  },
  wishlistOverlay: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
    colorScheme: 'light',
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
  // Quick-view art column keeps its width beside the detail stack.
  quickArtRail: {width: 260, flexShrink: 0},
  // Slider mark labels ($0/$600) hang below the track absolutely
  // positioned, so they add no layout height; without this pad the next
  // section Divider sits flush against the label glyphs.
  sliderMarkPad: {paddingBottom: 14},
};

// Muted home-goods gradient pairs; a name hash picks the pair so every
// tile is stable across renders and sessions. Scheme-locked literals (see
// "Color policy" in the header doc): these are product-photo stand-ins and
// keep the same hex stops in dark mode under styles.art's pinned
// colorScheme.
const GRADIENT_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['#D9C8B4', '#A98F76'],
  ['#C9D6C3', '#8FA98B'],
  ['#D6CFE6', '#9A8FC0'],
  ['#F0D3C0', '#D19A7A'],
  ['#C7D9E3', '#7FA3B8'],
  ['#E6D8C4', '#B99C6B'],
  ['#D8D8D2', '#9A9A90'],
  ['#E3C9CF', '#B98793'],
];

/** Stable name hash (charCode fold) — no Math.random anywhere. */
function gradientFor(name: string): readonly [string, string] {
  let hash = 7;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return GRADIENT_PAIRS[hash % GRADIENT_PAIRS.length];
}

// ============= DATA =============
// Foundry & Loom — Home & Living storefront, Spring '26 collection.
// Fixed catalog; no clocks, randomness, or network image assets (every
// tile is a deterministic gradient with an initial watermark).

type DepartmentId = 'lighting' | 'textiles' | 'tableware' | 'furniture' | 'decor';

const DEPARTMENTS: ReadonlyArray<{id: DepartmentId; label: string}> = [
  {id: 'lighting', label: 'Lighting'},
  {id: 'textiles', label: 'Textiles & bedding'},
  {id: 'tableware', label: 'Tableware'},
  {id: 'furniture', label: 'Furniture'},
  {id: 'decor', label: 'Decor & accents'},
];

const ALL_DEPARTMENT_IDS = DEPARTMENTS.map(department => department.id);

const DEPARTMENT_LABEL: Record<DepartmentId, string> = Object.fromEntries(
  DEPARTMENTS.map(department => [department.id, department.label]),
) as Record<DepartmentId, string>;

const PRICE_MIN = 0;
const PRICE_MAX = 600;

type Availability = 'in-stock' | 'low-stock' | 'backordered';

// Array order is the "Featured" sort (merchandising rank). \`compareAt\`
// marks sale items, \`isNew\` drives the New badge and the Newest sort,
// and \`stockLeft\` only applies to low-stock items.
interface Product {
  id: string;
  name: string;
  brand: string;
  department: DepartmentId;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  availability: Availability;
  stockLeft?: number;
  isNew?: boolean;
  finishes: string[];
  blurb: string;
}

const PRODUCTS: ReadonlyArray<Product> = [
  {
    id: 'sku-01',
    name: 'Halo Arc Floor Lamp',
    brand: 'Ferrow & Co',
    department: 'lighting',
    price: 329,
    rating: 4.7,
    reviews: 412,
    availability: 'in-stock',
    finishes: ['Brass', 'Matte black'],
    blurb:
      'A 78-inch cantilevered arc with a weighted marble base and a dimmable frosted globe.',
  },
  {
    id: 'sku-02',
    name: 'Sling Lounge Chair',
    brand: 'Fern & Frame',
    department: 'furniture',
    price: 549,
    rating: 4.6,
    reviews: 132,
    availability: 'in-stock',
    isNew: true,
    finishes: ['Tan leather', 'Black leather'],
    blurb:
      'Vegetable-tanned leather slung over a solid ash frame — it breaks in, not down.',
  },
  {
    id: 'sku-03',
    name: 'Stonewashed Linen Duvet Set',
    brand: 'Alba Textiles',
    department: 'textiles',
    price: 219,
    compareAt: 259,
    rating: 4.7,
    reviews: 623,
    availability: 'in-stock',
    finishes: ['White', 'Flax', 'Storm'],
    blurb:
      'Pre-washed European flax that arrives soft — duvet cover plus two shams.',
  },
  {
    id: 'sku-04',
    name: 'Lumen Pendant Trio',
    brand: 'Ferrow & Co',
    department: 'lighting',
    price: 249,
    rating: 4.8,
    reviews: 96,
    availability: 'low-stock',
    stockLeft: 2,
    isNew: true,
    finishes: ['Smoked glass', 'Opal'],
    blurb:
      'Three staggered hand-blown globes on a single canopy for over-island drama.',
  },
  {
    id: 'sku-05',
    name: 'Merino Waffle Throw',
    brand: 'Alba Textiles',
    department: 'textiles',
    price: 129,
    rating: 4.6,
    reviews: 844,
    availability: 'in-stock',
    finishes: ['Oat', 'Charcoal', 'Rust'],
    blurb:
      'Thermal-weave merino that traps warmth without weight — 50 by 70 inches.',
  },
  {
    id: 'sku-06',
    name: 'Stoneware Dinner Set (16 pc)',
    brand: 'Kiln House',
    department: 'tableware',
    price: 189,
    rating: 4.5,
    reviews: 709,
    availability: 'in-stock',
    finishes: ['Glaze white', 'Basalt'],
    blurb:
      'Reactive-glaze service for four: dinner plates, salad plates, bowls, and mugs.',
  },
  {
    id: 'sku-07',
    name: 'Drift Oak Side Table',
    brand: 'Fern & Frame',
    department: 'furniture',
    price: 239,
    compareAt: 289,
    rating: 4.4,
    reviews: 218,
    availability: 'in-stock',
    finishes: ['Natural oak', 'Smoked oak'],
    blurb:
      'A single steam-bent oak sheet looped into a C-shape that slides over sofa arms.',
  },
  {
    id: 'sku-08',
    name: 'Dusk Ceramic Table Lamp',
    brand: 'Kiln House',
    department: 'lighting',
    price: 119,
    compareAt: 149,
    rating: 4.5,
    reviews: 268,
    availability: 'in-stock',
    finishes: ['Sand', 'Sage'],
    blurb:
      'Hand-thrown gourd base with a linen drum shade; three-way switch included.',
  },
  {
    id: 'sku-09',
    name: 'Berber Wool Rug 5×8',
    brand: 'Atlas Weave',
    department: 'textiles',
    price: 449,
    rating: 4.4,
    reviews: 187,
    availability: 'backordered',
    finishes: ['Ivory', 'Slate'],
    blurb:
      'High-pile hand-knotted wool with a lattice motif — ships with a rug pad.',
  },
  {
    id: 'sku-10',
    name: 'Walnut Serving Board',
    brand: 'Grove Goods',
    department: 'tableware',
    price: 72,
    rating: 4.8,
    reviews: 458,
    availability: 'low-stock',
    stockLeft: 4,
    finishes: ['Walnut'],
    blurb:
      'End-grain walnut with a juice groove and a leather hanging loop — 20 inches.',
  },
  {
    id: 'sku-11',
    name: 'Smoked Glass Tumblers (6)',
    brand: 'Meridian Glassworks',
    department: 'tableware',
    price: 54,
    rating: 3.8,
    reviews: 342,
    availability: 'in-stock',
    isNew: true,
    finishes: ['Smoke', 'Amber'],
    blurb:
      'Mouth-blown 12-ounce tumblers with a ribbed grip and a moody ombré tint.',
  },
  {
    id: 'sku-12',
    name: 'Loop Counter Stool',
    brand: 'Fern & Frame',
    department: 'furniture',
    price: 179,
    rating: 4.3,
    reviews: 305,
    availability: 'low-stock',
    stockLeft: 3,
    finishes: ['Black', 'Birch'],
    blurb:
      'Bent-ply seat on a powder-coated loop base; 26-inch counter height.',
  },
  {
    id: 'sku-13',
    name: 'Framed Botanical Prints (3)',
    brand: 'Grove Goods',
    department: 'decor',
    price: 112,
    rating: 4.6,
    reviews: 389,
    availability: 'backordered',
    finishes: ['Oak frame', 'Black frame'],
    blurb:
      'Archival giclée fern studies behind UV acrylic, ready to hang as a set.',
  },
  {
    id: 'sku-14',
    name: 'Duo Ceramic Vases',
    brand: 'Kiln House',
    department: 'decor',
    price: 68,
    rating: 4.5,
    reviews: 264,
    availability: 'in-stock',
    finishes: ['Bone', 'Terracotta'],
    blurb:
      'A tall bottleneck and a low bud vase glazed to pair — stems optional.',
  },
  {
    id: 'sku-15',
    name: 'Brass Orbit Candleholders',
    brand: 'Ferrow & Co',
    department: 'decor',
    price: 84,
    compareAt: 98,
    rating: 3.9,
    reviews: 156,
    availability: 'in-stock',
    finishes: ['Brass'],
    blurb:
      'Interlocking spun-brass rings that hold tapers at three staggered heights.',
  },
  {
    id: 'sku-16',
    name: 'Ember Wall Sconce',
    brand: 'Kiln House',
    department: 'lighting',
    price: 89,
    rating: 4.3,
    reviews: 531,
    availability: 'in-stock',
    finishes: ['Aged brass', 'Nickel'],
    blurb:
      'Hardwired half-moon sconce that washes the wall in a warm up-glow.',
  },
];

const SORT_OPTIONS = [
  {value: 'featured', label: 'Featured'},
  {value: 'newest', label: 'Newest'},
  {value: 'price-asc', label: 'Price: Low to high'},
  {value: 'price-desc', label: 'Price: High to low'},
  {value: 'rating', label: 'Top rated'},
];

// Minimum-rating facet: a single-select threshold, not a multi-select.
const RATING_OPTIONS = [
  {value: 'any', label: 'Any rating', min: 0},
  {value: '4.5', label: '4.5 & up', min: 4.5},
  {value: '4.0', label: '4.0 & up', min: 4.0},
] as const;

type RatingValue = (typeof RATING_OPTIONS)[number]['value'];

/** First page plus each "Load more" click. */
const PAGE_SIZE = 8;

// ============= FORMATTERS =============

/** Whole-dollar prices render without cents: $329 vs. $449.95. */
function formatPrice(value: number): string {
  return Number.isInteger(value) ? \`$\${value}\` : \`$\${value.toFixed(2)}\`;
}

/** "1,240" review counts. */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Strong ratings read green; everything else stays neutral. */
function ratingVariant(rating: number): 'green' | 'neutral' {
  return rating >= 4.5 ? 'green' : 'neutral';
}

function minRatingFor(value: RatingValue): number {
  return RATING_OPTIONS.find(option => option.value === value)?.min ?? 0;
}

// ============= PRODUCT ART =============

/**
 * Deterministic product art: a two-color gradient keyed to the product
 * name, a soft key-light radial, and a centered initial watermark. Stands
 * in for every product photo — the template ships zero image assets. The
 * whole surface is scheme-locked via styles.art (see "Color policy" in the
 * header doc), so the white radial literal below stays a literal.
 */
function ProductArt({name, ratio}: {name: string; ratio: string}) {
  const [from, to] = gradientFor(name);
  return (
    <div
      style={{
        ...styles.art,
        aspectRatio: ratio,
        background: [
          'radial-gradient(120% 90% at 22% 14%, rgba(255, 255, 255, 0.5), transparent 58%)',
          \`linear-gradient(150deg, \${from} 0%, \${to} 115%)\`,
        ].join(', '),
      }}>
      <span style={styles.artInitial} aria-hidden>
        {name.charAt(0)}
      </span>
    </div>
  );
}

// ============= WISHLIST TOGGLE =============

/** Heart toggle shared by cards and the quick view — never hover-only. */
function WishlistToggle({
  product,
  isWished,
  onToggle,
  showLabel = false,
}: {
  product: Product;
  isWished: boolean;
  onToggle: (id: string, next: boolean) => void;
  showLabel?: boolean;
}) {
  return (
    <ToggleButton
      label={
        isWished
          ? \`Remove \${product.name} from wishlist\`
          : \`Add \${product.name} to wishlist\`
      }
      isIconOnly={!showLabel}
      icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
      isPressed={isWished}
      onPressedChange={next => onToggle(product.id, next)}
      tooltip={isWished ? 'Remove from wishlist' : 'Add to wishlist'}>
      {showLabel ? (isWished ? 'Saved' : 'Save') : undefined}
    </ToggleButton>
  );
}

// ============= FILTER FIELDS =============

interface FilterState {
  departments: string[];
  priceRange: [number, number];
  minRating: RatingValue;
  inStockOnly: boolean;
}

/**
 * The facet stack itself, shared verbatim by the desktop LayoutPanel rail
 * and the compact filter Dialog so both surfaces stay in lockstep.
 */
function FilterFields({
  filters,
  onDepartmentsChange,
  onPriceRangeChange,
  onMinRatingChange,
  onInStockOnlyChange,
}: {
  filters: FilterState;
  onDepartmentsChange: (values: string[]) => void;
  onPriceRangeChange: (value: [number, number]) => void;
  onMinRatingChange: (value: RatingValue) => void;
  onInStockOnlyChange: (value: boolean) => void;
}) {
  // Facet counts come from the unfiltered catalog, so the rail keeps
  // teaching what each facet would add even while filters are applied.
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of PRODUCTS) {
      counts[product.department] = (counts[product.department] ?? 0) + 1;
    }
    return counts;
  }, []);

  const ratingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const option of RATING_OPTIONS) {
      counts[option.value] = PRODUCTS.filter(
        product => product.rating >= option.min,
      ).length;
    }
    return counts;
  }, []);

  return (
    <VStack gap={4}>
      <CheckboxList
        label="Department"
        value={filters.departments}
        onChange={onDepartmentsChange}>
        {DEPARTMENTS.map(department => (
          <CheckboxListItem
            key={department.id}
            value={department.id}
            label={department.label}
            endContent={
              <Badge label={String(departmentCounts[department.id] ?? 0)} />
            }
          />
        ))}
      </CheckboxList>
      <Divider />
      {/* Live range readout lives in the description line — the inline
          "text" valueDisplay sits flush against the track and collides
          with the max-position thumb. The pad wrapper reserves room for
          the absolutely-positioned $0/$600 mark labels (styles.sliderMarkPad). */}
      <div style={styles.sliderMarkPad}>
        <Slider
          label="Price"
          description={\`$\${filters.priceRange[0]} – $\${filters.priceRange[1]}\`}
          value={filters.priceRange}
          onChange={onPriceRangeChange}
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={25}
          formatValue={value => \`$\${value}\`}
          valueDisplay="none"
          marks={[
            {value: PRICE_MIN, label: \`$\${PRICE_MIN}\`},
            {value: PRICE_MAX, label: \`$\${PRICE_MAX}\`},
          ]}
          width="100%"
        />
      </div>
      <Divider />
      <RadioList
        label="Rating"
        value={filters.minRating}
        onChange={value => onMinRatingChange(value as RatingValue)}>
        {RATING_OPTIONS.map(option => (
          <RadioListItem
            key={option.value}
            value={option.value}
            label={option.label}
            endContent={<Badge label={String(ratingCounts[option.value])} />}
          />
        ))}
      </RadioList>
      <Divider />
      {/* Default spacing keeps the toggle and its label side by side on
          the left, matching the checkbox/radio rows above ("spread" left
          the control orphaned at the far edge of the rail). */}
      <Switch
        label="In stock only"
        description="Hide backordered items"
        value={filters.inStockOnly}
        onChange={onInStockOnlyChange}
      />
    </VStack>
  );
}

/** Desktop rail: FilterFields under a header with Reset + hide controls. */
function FilterRail({
  filters,
  activeCount,
  onReset,
  onHide,
  fieldHandlers,
}: {
  filters: FilterState;
  activeCount: number;
  onReset: () => void;
  onHide: () => void;
  fieldHandlers: {
    onDepartmentsChange: (values: string[]) => void;
    onPriceRangeChange: (value: [number, number]) => void;
    onMinRatingChange: (value: RatingValue) => void;
    onInStockOnlyChange: (value: boolean) => void;
  };
}) {
  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label">Filters</Text>
        </StackItem>
        {activeCount > 0 ? (
          <Button label="Reset" variant="ghost" size="sm" onClick={onReset} />
        ) : null}
        <IconButton
          label="Hide filters"
          icon={<Icon icon={XIcon} size="sm" />}
          variant="ghost"
          size="sm"
          onClick={onHide}
        />
      </HStack>
      <FilterFields filters={filters} {...fieldHandlers} />
    </VStack>
  );
}

// ============= APPLIED FILTER TOKENS =============

interface AppliedFilter {
  key: string;
  label: string;
  onRemove: () => void;
}

/** Removable Token per applied facet, plus Clear all when 2+ are active. */
function AppliedFilterRow({
  applied,
  onClearAll,
}: {
  applied: AppliedFilter[];
  onClearAll: () => void;
}) {
  if (applied.length === 0) {
    return null;
  }
  return (
    <HStack gap={1.5} vAlign="center" wrap="wrap">
      {applied.map(filter => (
        <Token
          key={filter.key}
          label={filter.label}
          onRemove={filter.onRemove}
        />
      ))}
      {applied.length > 1 ? (
        <Button
          label="Clear all filters"
          variant="ghost"
          size="sm"
          onClick={onClearAll}>
          Clear all
        </Button>
      ) : null}
    </HStack>
  );
}

// ============= PRODUCT CARD =============

/** Rating + review count pair, shared by cards and the quick view. */
function RatingLine({product}: {product: Product}) {
  return (
    <HStack gap={1.5} vAlign="center">
      <Badge
        variant={ratingVariant(product.rating)}
        label={\`★ \${product.rating.toFixed(1)}\`}
      />
      <Text type="supporting" color="secondary">
        ({formatCount(product.reviews)})
      </Text>
    </HStack>
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

/** Availability chip: low stock warns, backordered reads neutral. */
function AvailabilityBadge({product}: {product: Product}) {
  if (product.availability === 'low-stock') {
    return (
      <Badge variant="warning" label={\`Only \${product.stockLeft ?? 1} left\`} />
    );
  }
  if (product.availability === 'backordered') {
    return <Badge variant="neutral" label="Backordered" />;
  }
  return null;
}

/**
 * Catalog tile: gradient art with Sale/New corner Badges and an
 * always-visible wishlist toggle, then identity, rating, price, and the
 * Quick view + add-to-cart actions. Nothing here depends on hover.
 */
function ProductCard({
  product,
  isWished,
  onToggleWish,
  onQuickView,
  onAddToCart,
}: {
  product: Product;
  isWished: boolean;
  onToggleWish: (id: string, next: boolean) => void;
  onQuickView: (id: string) => void;
  onAddToCart: (product: Product, quantity: number) => void;
}) {
  const canAdd = product.availability !== 'backordered';
  return (
    <Card padding={3} height="100%">
      <VStack gap={2}>
        <div style={styles.mediaBox}>
          <ProductArt name={product.name} ratio="4 / 3" />
          <div style={styles.badgeOverlay}>
            {product.compareAt != null ? (
              <Badge variant="red" label="Sale" />
            ) : null}
            {product.isNew ? <Badge variant="info" label="New" /> : null}
          </div>
          <div style={styles.wishlistOverlay}>
            <WishlistToggle
              product={product}
              isWished={isWished}
              onToggle={onToggleWish}
            />
          </div>
        </div>
        <VStack gap={0.5}>
          <Text type="body" maxLines={2}>
            {product.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {product.brand} · {DEPARTMENT_LABEL[product.department]}
          </Text>
        </VStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <RatingLine product={product} />
          </StackItem>
          <AvailabilityBadge product={product} />
        </HStack>
        <PriceLine product={product} />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Button
              label={\`Quick view \${product.name}\`}
              variant="secondary"
              icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
              onClick={() => onQuickView(product.id)}>
              Quick view
            </Button>
          </StackItem>
          <Button
            label={
              canAdd
                ? \`Add \${product.name} to cart\`
                : \`\${product.name} is backordered\`
            }
            variant="primary"
            icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
            isIconOnly
            isDisabled={!canAdd}
            tooltip={canAdd ? 'Add to cart' : 'Backordered'}
            onClick={() => onAddToCart(product, 1)}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

// ============= QUICK VIEW DIALOG =============

/**
 * Quick view: large art beside (or, compact, above) the detail stack —
 * finish SegmentedControl, quantity stepper, add-to-cart wired to the
 * header cart count, wishlist toggle, and shipping/returns perks. Mounted
 * with key={product.id} so quantity/finish reset per product.
 */
function QuickViewDialog({
  product,
  isCompact,
  isWished,
  onToggleWish,
  onAddToCart,
  onOpenChange,
}: {
  product: Product;
  isCompact: boolean;
  isWished: boolean;
  onToggleWish: (id: string, next: boolean) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [finish, setFinish] = useState(product.finishes[0]);
  const [quantity, setQuantity] = useState(1);
  const canAdd = product.availability !== 'backordered';
  // Low-stock items cap the stepper at what's left; everything else at 9.
  const maxQuantity =
    product.availability === 'low-stock' ? (product.stockLeft ?? 1) : 9;

  const details = (
    <VStack gap={3}>
      <VStack gap={1}>
        <Text type="supporting" color="secondary">
          {product.brand} · {DEPARTMENT_LABEL[product.department]}
        </Text>
        <HStack gap={1.5} vAlign="center" wrap="wrap">
          {product.compareAt != null ? (
            <Badge variant="red" label="Sale" />
          ) : null}
          {product.isNew ? <Badge variant="info" label="New" /> : null}
          <AvailabilityBadge product={product} />
          <RatingLine product={product} />
        </HStack>
      </VStack>
      <PriceLine product={product} />
      <Text type="body" color="secondary">
        {product.blurb}
      </Text>
      {product.finishes.length > 1 ? (
        <SegmentedControl
          label="Finish"
          value={finish}
          onChange={setFinish}>
          {product.finishes.map(option => (
            <SegmentedControlItem key={option} label={option} value={option} />
          ))}
        </SegmentedControl>
      ) : (
        <Text type="supporting" color="secondary">
          Finish: {product.finishes[0]}
        </Text>
      )}
      <HStack gap={2} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <IconButton
            label="Decrease quantity"
            icon={<Icon icon={MinusIcon} size="sm" />}
            variant="secondary"
            isDisabled={!canAdd || quantity <= 1}
            onClick={() => setQuantity(current => Math.max(1, current - 1))}
          />
          <Text type="label" hasTabularNumbers>
            {quantity}
          </Text>
          <IconButton
            label="Increase quantity"
            icon={<Icon icon={PlusIcon} size="sm" />}
            variant="secondary"
            isDisabled={!canAdd || quantity >= maxQuantity}
            onClick={() =>
              setQuantity(current => Math.min(maxQuantity, current + 1))
            }
          />
        </HStack>
        <StackItem size="fill">
          <Button
            label={
              canAdd
                ? \`Add \${quantity} to cart — \${finish}\`
                : \`\${product.name} is backordered\`
            }
            variant="primary"
            icon={<Icon icon={ShoppingBagIcon} size="sm" color="inherit" />}
            isDisabled={!canAdd}
            onClick={() => {
              onAddToCart(product, quantity);
              onOpenChange(false);
            }}>
            {canAdd ? \`Add \${quantity} to cart\` : 'Backordered'}
          </Button>
        </StackItem>
        <WishlistToggle
          product={product}
          isWished={isWished}
          onToggle={onToggleWish}
          showLabel
        />
      </HStack>
      <Divider />
      <VStack gap={1.5}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TruckIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Free shipping on orders over $75
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={RotateCcwIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            60-day returns, no restocking fee
          </Text>
        </HStack>
      </VStack>
    </VStack>
  );

  return (
    <Dialog
      isOpen
      onOpenChange={onOpenChange}
      purpose="info"
      width="min(720px, 94vw)">
      <Layout
        header={
          <DialogHeader
            title={product.name}
            subtitle={\`\${product.brand} · \${DEPARTMENT_LABEL[product.department]}\`}
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            {isCompact ? (
              <VStack gap={4}>
                <div style={styles.mediaBox}>
                  <ProductArt name={product.name} ratio="4 / 3" />
                </div>
                {details}
              </VStack>
            ) : (
              <HStack gap={5} vAlign="start">
                <div style={{...styles.mediaBox, ...styles.quickArtRail}}>
                  <ProductArt name={product.name} ratio="1 / 1" />
                </div>
                <StackItem size="fill">{details}</StackItem>
              </HStack>
            )}
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// ============= COMPACT FILTER DIALOG =============

/** <=640px fallback for the docked rail: same facets, full-width Dialog. */
function FilterDialog({
  filters,
  resultCount,
  activeCount,
  onReset,
  onOpenChange,
  fieldHandlers,
}: {
  filters: FilterState;
  resultCount: number;
  activeCount: number;
  onReset: () => void;
  onOpenChange: (isOpen: boolean) => void;
  fieldHandlers: {
    onDepartmentsChange: (values: string[]) => void;
    onPriceRangeChange: (value: [number, number]) => void;
    onMinRatingChange: (value: RatingValue) => void;
    onInStockOnlyChange: (value: boolean) => void;
  };
}) {
  return (
    <Dialog
      isOpen
      onOpenChange={onOpenChange}
      purpose="info"
      width="min(420px, 94vw)">
      <Layout
        header={
          <DialogHeader
            title="Filters"
            subtitle={\`\${resultCount} \${resultCount === 1 ? 'match' : 'matches'} in Home & Living\`}
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <FilterFields filters={filters} {...fieldHandlers} />
              <HStack gap={2} vAlign="center">
                {activeCount > 0 ? (
                  <Button
                    label="Reset all filters"
                    variant="secondary"
                    onClick={onReset}>
                    Reset
                  </Button>
                ) : null}
                <StackItem size="fill">
                  <Button
                    label={\`Show \${resultCount} results\`}
                    variant="primary"
                    onClick={() => onOpenChange(false)}>
                    Show {resultCount} results
                  </Button>
                </StackItem>
              </HStack>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// ============= PAGE =============

export default function StorefrontBrowseTemplate() {
  const [departments, setDepartments] = useState<string[]>([
    ...ALL_DEPARTMENT_IDS,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [minRating, setMinRating] = useState<RatingValue>('any');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  // Load-more pagination: how many filtered products are revealed.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isRailOpen, setIsRailOpen] = useState(true);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>(['sku-04']);
  const [cartCount, setCartCount] = useState(0);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);

  // Single-pane fallback breakpoint: below this the rail becomes a Dialog.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ----- Filter handlers: every facet change rewinds the pagination -----

  const handleDepartmentsChange = (values: string[]) => {
    setDepartments(values);
    setVisibleCount(PAGE_SIZE);
  };
  const handlePriceRangeChange = (value: [number, number]) => {
    setPriceRange(value);
    setVisibleCount(PAGE_SIZE);
  };
  const handleMinRatingChange = (value: RatingValue) => {
    setMinRating(value);
    setVisibleCount(PAGE_SIZE);
  };
  const handleInStockOnlyChange = (value: boolean) => {
    setInStockOnly(value);
    setVisibleCount(PAGE_SIZE);
  };
  const handleSortChange = (value: string) => {
    setSort(value);
    setVisibleCount(PAGE_SIZE);
  };

  const fieldHandlers = {
    onDepartmentsChange: handleDepartmentsChange,
    onPriceRangeChange: handlePriceRangeChange,
    onMinRatingChange: handleMinRatingChange,
    onInStockOnlyChange: handleInStockOnlyChange,
  };

  const resetFilters = () => {
    setDepartments([...ALL_DEPARTMENT_IDS]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setMinRating('any');
    setInStockOnly(false);
    setVisibleCount(PAGE_SIZE);
  };

  const filters: FilterState = {departments, priceRange, minRating, inStockOnly};

  const activeFilterCount =
    (departments.length < ALL_DEPARTMENT_IDS.length ? 1 : 0) +
    (priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ? 1 : 0) +
    (minRating !== 'any' ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  // ----- Derived data: filter, then sort ("featured" keeps catalog order) --

  const filteredProducts = useMemo(() => {
    const threshold = minRatingFor(minRating);
    const filtered = PRODUCTS.filter(
      product =>
        departments.includes(product.department) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        product.rating >= threshold &&
        (!inStockOnly || product.availability !== 'backordered'),
    );
    const sorted = [...filtered];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    } else if (sort === 'newest') {
      // Stable: new-this-season first, catalog order within each group.
      sorted.sort((a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false));
    }
    return sorted;
  }, [departments, priceRange, minRating, inStockOnly, sort]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = filteredProducts.length - visibleProducts.length;

  // ----- Applied-filter tokens: each one removes exactly its facet -----

  const appliedFilters: AppliedFilter[] = [
    ...(departments.length < ALL_DEPARTMENT_IDS.length
      ? departments.map(id => ({
          key: \`department-\${id}\`,
          label: DEPARTMENT_LABEL[id as DepartmentId],
          onRemove: () =>
            handleDepartmentsChange(departments.filter(value => value !== id)),
        }))
      : []),
    ...(priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX
      ? [
          {
            key: 'price',
            label: \`$\${priceRange[0]}–$\${priceRange[1]}\`,
            onRemove: () => handlePriceRangeChange([PRICE_MIN, PRICE_MAX]),
          },
        ]
      : []),
    ...(minRating !== 'any'
      ? [
          {
            key: 'rating',
            label: \`★ \${minRating} & up\`,
            onRemove: () => handleMinRatingChange('any'),
          },
        ]
      : []),
    ...(inStockOnly
      ? [
          {
            key: 'stock',
            label: 'In stock',
            onRemove: () => handleInStockOnlyChange(false),
          },
        ]
      : []),
  ];

  // ----- Wishlist / cart / quick view -----

  const toggleWishlist = (id: string, next: boolean) => {
    setWishlist(previous =>
      next ? [...previous, id] : previous.filter(item => item !== id),
    );
  };

  const addToCart = (_product: Product, quantity: number) => {
    setCartCount(previous => previous + quantity);
  };

  const quickViewProduct =
    quickViewId != null
      ? PRODUCTS.find(product => product.id === quickViewId)
      : undefined;

  const filterSummary = \`\${departments.length} of \${ALL_DEPARTMENT_IDS.length} departments · $\${priceRange[0]}–$\${priceRange[1]} · \${
    minRating === 'any' ? 'Any rating' : \`★ \${minRating}+\`
  } · \${inStockOnly ? 'In stock' : 'All items'}\`;

  const showRail = !isCompact && isRailOpen;

  // Header commerce actions: full Buttons on wide viewports; IconButtons
  // with overlay count Badges on compact so the header fits at 375px.
  const headerActions = isCompact ? (
    <HStack gap={2} vAlign="center">
      <div style={styles.countWrap}>
        <IconButton
          label={\`Wishlist, \${wishlist.length} saved\`}
          icon={<Icon icon={HeartIcon} size="sm" />}
          variant="secondary"
        />
        {wishlist.length > 0 ? (
          <div style={styles.countDot}>
            <Badge label={String(wishlist.length)} variant="info" />
          </div>
        ) : null}
      </div>
      <div style={styles.countWrap}>
        <IconButton
          label={\`Cart, \${cartCount} items\`}
          icon={<Icon icon={ShoppingBagIcon} size="sm" />}
          variant="secondary"
        />
        {cartCount > 0 ? (
          <div style={styles.countDot}>
            <Badge label={String(cartCount)} variant="info" />
          </div>
        ) : null}
      </div>
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center">
      <Button
        label={showRail ? 'Hide filters' : 'Show filters'}
        variant="secondary"
        icon={<Icon icon={SlidersHorizontalIcon} size="sm" color="inherit" />}
        onClick={() => setIsRailOpen(open => !open)}
        endContent={
          activeFilterCount > 0 ? (
            <Badge label={String(activeFilterCount)} variant="info" />
          ) : undefined
        }>
        {showRail ? 'Hide filters' : 'Filters'}
      </Button>
      <Button
        label={\`Wishlist, \${wishlist.length} saved\`}
        variant="secondary"
        icon={<Icon icon={HeartIcon} size="sm" color="inherit" />}
        endContent={
          wishlist.length > 0 ? (
            <Badge label={String(wishlist.length)} variant="info" />
          ) : undefined
        }>
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

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Home &amp; Living</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {isCompact
                    ? filterSummary
                    : "Foundry & Loom · Spring '26 collection"}
                </Text>
              </VStack>
            </StackItem>
            {headerActions}
          </HStack>
        </LayoutHeader>
      }
      start={
        showRail ? (
          <LayoutPanel
            width={280}
            padding={4}
            hasDivider
            isScrollable
            label="Product filters">
            <FilterRail
              filters={filters}
              activeCount={activeFilterCount}
              onReset={resetFilters}
              onHide={() => setIsRailOpen(false)}
              fieldHandlers={fieldHandlers}
            />
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={6} label="Product results">
          <VStack gap={4}>
            {/* Results toolbar: count on the left, compact Filters button +
                sort Selector on the right. wrap="wrap" lets the controls
                drop below the count instead of overflowing sideways. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Showing {visibleProducts.length} of {filteredProducts.length}{' '}
                  products
                </Text>
              </StackItem>
              {isCompact ? (
                <Button
                  label="Open filters"
                  variant="secondary"
                  icon={
                    <Icon
                      icon={SlidersHorizontalIcon}
                      size="sm"
                      color="inherit"
                    />
                  }
                  onClick={() => setIsFilterDialogOpen(true)}
                  endContent={
                    activeFilterCount > 0 ? (
                      <Badge label={String(activeFilterCount)} variant="info" />
                    ) : undefined
                  }>
                  Filters
                </Button>
              ) : null}
              <Selector
                label="Sort by"
                isLabelHidden
                options={SORT_OPTIONS}
                value={sort}
                onChange={handleSortChange}
                width={180}
              />
            </HStack>

            <AppliedFilterRow
              applied={appliedFilters}
              onClearAll={resetFilters}
            />

            {filteredProducts.length === 0 ? (
              <EmptyState
                icon={<Icon icon={PackageSearchIcon} size="lg" />}
                title="No products match your filters"
                description="Try widening the price range or adding departments back."
                actions={
                  <Button
                    label="Reset filters"
                    variant="secondary"
                    onClick={resetFilters}
                  />
                }
              />
            ) : (
              <>
                <Grid columns={{minWidth: 230}} gap={4}>
                  {visibleProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isWished={wishlist.includes(product.id)}
                      onToggleWish={toggleWishlist}
                      onQuickView={setQuickViewId}
                      onAddToCart={addToCart}
                    />
                  ))}
                </Grid>

                {/* Load-more pagination footer. The running count lives in
                    the toolbar above the grid — repeating it here read as a
                    duplicate. */}
                <VStack gap={2} hAlign="center">
                  {remainingCount > 0 ? (
                    <Button
                      label={\`Load \${Math.min(PAGE_SIZE, remainingCount)} more products\`}
                      variant="secondary"
                      onClick={() =>
                        setVisibleCount(current => current + PAGE_SIZE)
                      }>
                      Load {Math.min(PAGE_SIZE, remainingCount)} more
                    </Button>
                  ) : filteredProducts.length > PAGE_SIZE ? (
                    <Text type="supporting" color="secondary">
                      You&apos;ve reached the end of the collection.
                    </Text>
                  ) : null}
                </VStack>
              </>
            )}
          </VStack>
        </LayoutContent>
      }
      footer={
        <>
          {quickViewProduct != null ? (
            <QuickViewDialog
              key={quickViewProduct.id}
              product={quickViewProduct}
              isCompact={isCompact}
              isWished={wishlist.includes(quickViewProduct.id)}
              onToggleWish={toggleWishlist}
              onAddToCart={addToCart}
              onOpenChange={open => {
                if (!open) {
                  setQuickViewId(null);
                }
              }}
            />
          ) : null}
          {isCompact && isFilterDialogOpen ? (
            <FilterDialog
              filters={filters}
              resultCount={filteredProducts.length}
              activeCount={activeFilterCount}
              onReset={resetFilters}
              onOpenChange={setIsFilterDialogOpen}
              fieldHandlers={fieldHandlers}
            />
          ) : null}
        </>
      }
    />
  );
}
`;export{e as default};