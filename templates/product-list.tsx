// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (12-product outdoor-gear catalog with
 *   category, price, compare-at price, rating, review count, and stock flags)
 * @output Faceted product list: a collapsible left filter rail (category
 *   CheckboxList with per-facet counts, a price range Slider, and an
 *   "In stock only" Switch) driving a product area with a results toolbar
 *   (live result count, sort Selector, grid/list SegmentedControl) over a
 *   responsive Grid of product Cards — Thumbnail placeholder art, name,
 *   brand, rating Badge, and price with sale strikethrough. All filtering
 *   and sorting runs live through useState/useMemo.
 * @position Page template; emitted by `astryx template product-list`
 *
 * Frame: Layout height="fill". LayoutHeader carries the department title,
 * a storefront byline (or the active-filter summary on compact), and a
 * "Filters" toggle with a live count badge. The start LayoutPanel (264px)
 * is the filter rail; an IconButton in its header collapses it. Cards are
 * the correct container for catalog tiles; the chrome stays frame-first.
 *
 * Responsive contract:
 * - >768px: filter rail is a 264px start LayoutPanel (collapsible via its
 *   hide IconButton or the header "Filters" toggle); the product area fills
 *   the rest and scrolls independently.
 * - <=768px: the rail and its header toggle hide entirely — the header
 *   swaps its byline for a compact active-filter summary line.
 * - Toolbar: single row on wide viewports; wrap="wrap" lets the sort
 *   Selector and view SegmentedControl drop below the count when narrow.
 * - Grid view: Grid columns={{minWidth: 220}} — 4-up on wide viewports,
 *   reflowing to 2-up and 1-up as the viewport narrows.
 * - List view: rows keep their thumbnail/price rails at every width; the
 *   one-line product blurb hides at <=768px so rows never wrap awkwardly.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxList, CheckboxListItem} from '@astryxdesign/core/CheckboxList';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Slider} from '@astryxdesign/core/Slider';
import {Switch} from '@astryxdesign/core/Switch';
import {Thumbnail} from '@astryxdesign/core/Thumbnail';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {InboxIcon, XMarkIcon} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Grid-tile art area: fixed 4:3 box so every card keeps the same height
  // regardless of name length; the Thumbnail renders its placeholder art.
  mediaBox: {
    aspectRatio: '4 / 3',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // List-row art area: compact fixed square that never shrinks.
  listMediaBox: {
    width: 88,
    height: 88,
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Compare-at price in sale rows.
  strike: {textDecoration: 'line-through'},
  // Right-hand price/rating rail in list rows keeps its width.
  listRail: {flexShrink: 0},
};

// ============= DATA =============
// Basecamp Supply — Camping & Hiking department, Fall '26 assortment.
// Fixed catalog; no clocks, randomness, or network image assets (Thumbnail
// renders its built-in placeholder art).

type CategoryId = 'tents' | 'packs' | 'sleep' | 'cook' | 'footwear';

const CATEGORIES: ReadonlyArray<{id: CategoryId; label: string}> = [
  {id: 'tents', label: 'Tents & shelters'},
  {id: 'packs', label: 'Backpacks'},
  {id: 'sleep', label: 'Sleep systems'},
  {id: 'cook', label: 'Camp kitchen'},
  {id: 'footwear', label: 'Footwear'},
];

const ALL_CATEGORY_IDS = CATEGORIES.map(category => category.id);

const CATEGORY_LABEL: Record<CategoryId, string> = Object.fromEntries(
  CATEGORIES.map(category => [category.id, category.label]),
) as Record<CategoryId, string>;

const PRICE_MIN = 0;
const PRICE_MAX = 500;

// Array order is the "Featured" sort (merchandising rank). `compareAt`
// marks sale items; `inStock: false` items surface as "Backordered" and
// drop out when the availability switch is on.
interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  inStock: boolean;
  blurb: string;
}

const PRODUCTS: ReadonlyArray<Product> = [
  {
    id: 'p-01',
    name: 'Alpenglow 2P Dome Tent',
    brand: 'Cairn Peak',
    category: 'tents',
    price: 329,
    rating: 4.7,
    reviews: 412,
    inStock: true,
    blurb: 'Freestanding 3-season dome with a 68D ripstop fly and two vestibules.',
  },
  {
    id: 'p-02',
    name: 'Switchback 55L Pack',
    brand: 'Traverse Works',
    category: 'packs',
    price: 259,
    rating: 4.6,
    reviews: 534,
    inStock: true,
    blurb: 'Adjustable-torso 55-liter hauler with a floating brain lid.',
  },
  {
    id: 'p-03',
    name: 'Solstice 15° Down Bag',
    brand: 'Drift & Down',
    category: 'sleep',
    price: 349,
    rating: 4.8,
    reviews: 322,
    inStock: true,
    blurb: '800-fill hydrophobic down with a 15°F comfort rating.',
  },
  {
    id: 'p-04',
    name: 'Ridgeline UL 1P Shelter',
    brand: 'Northbound',
    category: 'tents',
    price: 449.95,
    compareAt: 499.95,
    rating: 4.8,
    reviews: 186,
    inStock: true,
    blurb: 'Sub-two-pound trekking-pole shelter with a full mesh inner.',
  },
  {
    id: 'p-05',
    name: 'Scree Runner Mid GTX',
    brand: 'Talus',
    category: 'footwear',
    price: 179,
    rating: 4.4,
    reviews: 958,
    inStock: true,
    blurb: 'Waterproof mid hiker with a rock plate and deep-lug outsole.',
  },
  {
    id: 'p-06',
    name: 'Ember 2-Burner Stove',
    brand: 'Loam Gear',
    category: 'cook',
    price: 144.95,
    rating: 4.5,
    reviews: 689,
    inStock: true,
    blurb: 'Twin 10,000-BTU burners with push-button ignition and windscreens.',
  },
  {
    id: 'p-07',
    name: 'Dayhiker 22L',
    brand: 'Traverse Works',
    category: 'packs',
    price: 89.95,
    rating: 4.4,
    reviews: 1240,
    inStock: true,
    blurb: 'Panel-loading daypack with a ventilated trampoline back panel.',
  },
  {
    id: 'p-08',
    name: 'Crestline 38L Fastpack',
    brand: 'Northbound',
    category: 'packs',
    price: 189,
    compareAt: 219,
    rating: 4.5,
    reviews: 97,
    inStock: true,
    blurb: 'Running-vest harness meets overnight capacity for big-mile days.',
  },
  {
    id: 'p-09',
    name: 'Meadow 30° Quilt',
    brand: 'Drift & Down',
    category: 'sleep',
    price: 219,
    rating: 4.6,
    reviews: 148,
    inStock: true,
    blurb: 'Two-season down quilt with pad-attachment straps and a cinch footbox.',
  },
  {
    id: 'p-10',
    name: 'Basin 6P Cabin Tent',
    brand: 'Cairn Peak',
    category: 'tents',
    price: 389,
    rating: 4.3,
    reviews: 268,
    inStock: false,
    blurb: 'Straight-wall family cabin with a hinged door and room divider.',
  },
  {
    id: 'p-11',
    name: 'Tinwood Cook Set',
    brand: 'Loam Gear',
    category: 'cook',
    price: 64,
    compareAt: 80,
    rating: 4.3,
    reviews: 415,
    inStock: true,
    blurb: 'Nested hard-anodized pots and bowls for two — 1.9 lb all in.',
  },
  {
    id: 'p-12',
    name: 'Cloudrest Insulated Pad',
    brand: 'Loam Gear',
    category: 'sleep',
    price: 129.95,
    rating: 4.2,
    reviews: 876,
    inStock: false,
    blurb: 'R-4.4 insulated air pad that packs down to a one-liter roll.',
  },
];

const SORT_OPTIONS = [
  {value: 'featured', label: 'Featured'},
  {value: 'price-asc', label: 'Price: Low to high'},
  {value: 'price-desc', label: 'Price: High to low'},
  {value: 'rating', label: 'Top rated'},
];

// ============= FORMATTERS =============

/** Whole-dollar prices render without cents: $329 vs. $449.95. */
function formatPrice(value: number): string {
  return Number.isInteger(value) ? `$${value}` : `$${value.toFixed(2)}`;
}

/** "1,240" review counts. */
function formatCount(value: number): string {
  return value.toLocaleString('en-US');
}

/** Strong ratings read green; everything else stays neutral. */
function ratingVariant(rating: number): 'green' | 'neutral' {
  return rating >= 4.5 ? 'green' : 'neutral';
}

// ============= FILTER RAIL =============

function FilterRail({
  categories,
  onCategoriesChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockOnlyChange,
  activeCount,
  onReset,
  onHide,
}: {
  categories: string[];
  onCategoriesChange: (values: string[]) => void;
  priceRange: [number, number];
  onPriceRangeChange: (value: [number, number]) => void;
  inStockOnly: boolean;
  onInStockOnlyChange: (value: boolean) => void;
  activeCount: number;
  onReset: () => void;
  onHide: () => void;
}) {
  // Facet counts come from the unfiltered catalog, so the rail keeps
  // teaching what each category would add even while filters are applied.
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const product of PRODUCTS) {
      counts[product.category] = (counts[product.category] ?? 0) + 1;
    }
    return counts;
  }, []);

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
          icon={<Icon icon={XMarkIcon} size="sm" />}
          variant="ghost"
          size="sm"
          onClick={onHide}
        />
      </HStack>
      <CheckboxList
        label="Category"
        value={categories}
        onChange={onCategoriesChange}
        density="compact">
        {CATEGORIES.map(category => (
          <CheckboxListItem
            key={category.id}
            value={category.id}
            label={category.label}
            endContent={
              <Badge label={String(categoryCounts[category.id] ?? 0)} />
            }
          />
        ))}
      </CheckboxList>
      <Divider />
      <Slider
        label="Price"
        value={priceRange}
        onChange={onPriceRangeChange}
        min={PRICE_MIN}
        max={PRICE_MAX}
        step={10}
        formatValue={value => `$${value}`}
        valueDisplay="text"
        marks={[
          {value: PRICE_MIN, label: `$${PRICE_MIN}`},
          {value: PRICE_MAX, label: `$${PRICE_MAX}`},
        ]}
        width="100%"
      />
      <Divider />
      <Switch
        label="In stock only"
        description="Hide backordered items"
        value={inStockOnly}
        onChange={onInStockOnlyChange}
        labelSpacing="spread"
        width="100%"
      />
    </VStack>
  );
}

// ============= PRODUCT TILES =============

/** Rating + review count pair, shared by both views. */
function RatingBadge({product}: {product: Product}) {
  return (
    <HStack gap={1.5} vAlign="center">
      <Badge
        variant={ratingVariant(product.rating)}
        label={`★ ${product.rating.toFixed(1)}`}
      />
      <Text type="supporting" color="secondary">
        ({formatCount(product.reviews)})
      </Text>
    </HStack>
  );
}

/** Price with sale strikethrough + Sale badge when compareAt is set. */
function PriceLine({product}: {product: Product}) {
  return (
    <HStack gap={2} vAlign="center">
      <Text type="label">{formatPrice(product.price)}</Text>
      {product.compareAt != null ? (
        <>
          <span style={styles.strike}>
            <Text type="supporting" color="secondary">
              {formatPrice(product.compareAt)}
            </Text>
          </span>
          <Badge variant="red" label="Sale" />
        </>
      ) : null}
    </HStack>
  );
}

/** Grid tile: 4:3 placeholder art over name, brand, rating, and price. */
function ProductGridCard({product}: {product: Product}) {
  return (
    <Card padding={3} height="100%">
      <VStack gap={2}>
        <div style={styles.mediaBox}>
          <Thumbnail label={product.name} />
        </div>
        <VStack gap={0.5}>
          <Text type="body" maxLines={2}>
            {product.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {product.brand} · {CATEGORY_LABEL[product.category]}
          </Text>
        </VStack>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <RatingBadge product={product} />
          </StackItem>
          {!product.inStock ? (
            <Badge variant="neutral" label="Backordered" />
          ) : null}
        </HStack>
        <PriceLine product={product} />
      </VStack>
    </Card>
  );
}

/** List row: compact art, name + blurb in the middle, price rail on the right. */
function ProductListRow({
  product,
  showBlurb,
}: {
  product: Product;
  showBlurb: boolean;
}) {
  return (
    <Card padding={3}>
      <HStack gap={3} vAlign="center">
        <div style={styles.listMediaBox}>
          <Thumbnail label={product.name} />
        </div>
        <StackItem size="fill">
          <VStack gap={0.5}>
            <Text type="body" maxLines={1}>
              {product.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {product.brand} · {CATEGORY_LABEL[product.category]}
            </Text>
            {showBlurb ? (
              <Text type="supporting" color="secondary" maxLines={1}>
                {product.blurb}
              </Text>
            ) : null}
          </VStack>
        </StackItem>
        <div style={styles.listRail}>
          <VStack gap={1} hAlign="end">
            <PriceLine product={product} />
            <RatingBadge product={product} />
            {!product.inStock ? (
              <Badge variant="neutral" label="Backordered" />
            ) : null}
          </VStack>
        </div>
      </HStack>
    </Card>
  );
}

// ============= PAGE =============

export default function ProductListTemplate() {
  const [categories, setCategories] = useState<string[]>([
    ...ALL_CATEGORY_IDS,
  ]);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    PRICE_MIN,
    PRICE_MAX,
  ]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState('featured');
  const [view, setView] = useState('grid');
  const [isRailOpen, setIsRailOpen] = useState(true);
  const isCompact = useMediaQuery('(max-width: 768px)');

  const activeFilterCount =
    (categories.length < ALL_CATEGORY_IDS.length ? 1 : 0) +
    (priceRange[0] !== PRICE_MIN || priceRange[1] !== PRICE_MAX ? 1 : 0) +
    (inStockOnly ? 1 : 0);

  const resetFilters = () => {
    setCategories([...ALL_CATEGORY_IDS]);
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setInStockOnly(false);
  };

  // ----- Derived data: filter, then sort ("featured" keeps catalog order) --

  const visibleProducts = useMemo(() => {
    const filtered = PRODUCTS.filter(
      product =>
        categories.includes(product.category) &&
        product.price >= priceRange[0] &&
        product.price <= priceRange[1] &&
        (!inStockOnly || product.inStock),
    );
    const sorted = [...filtered];
    if (sort === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    return sorted;
  }, [categories, priceRange, inStockOnly, sort]);

  const filterSummary = `${categories.length} of ${ALL_CATEGORY_IDS.length} categories · $${priceRange[0]}–$${priceRange[1]} · ${
    inStockOnly ? 'In stock' : 'All items'
  }`;

  const showRail = !isCompact && isRailOpen;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <VStack gap={0}>
                <Heading level={1}>Camping &amp; Hiking</Heading>
                <Text type="supporting" color="secondary">
                  {isCompact
                    ? filterSummary
                    : "Basecamp Supply · Fall '26 assortment"}
                </Text>
              </VStack>
            </StackItem>
            {!isCompact ? (
              <Button
                label={showRail ? 'Hide filters' : 'Filters'}
                variant="secondary"
                onClick={() => setIsRailOpen(open => !open)}
                endContent={
                  activeFilterCount > 0 ? (
                    <Badge label={String(activeFilterCount)} variant="info" />
                  ) : undefined
                }
              />
            ) : null}
          </HStack>
        </LayoutHeader>
      }
      start={
        showRail ? (
          <LayoutPanel
            width={264}
            padding={4}
            hasDivider
            isScrollable
            label="Product filters">
            <FilterRail
              categories={categories}
              onCategoriesChange={setCategories}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              inStockOnly={inStockOnly}
              onInStockOnlyChange={setInStockOnly}
              activeCount={activeFilterCount}
              onReset={resetFilters}
              onHide={() => setIsRailOpen(false)}
            />
          </LayoutPanel>
        ) : undefined
      }
      content={
        <LayoutContent padding={6} label="Product results">
          <VStack gap={4}>
            {/* Results toolbar: count on the left, sort + view on the right.
                wrap="wrap" lets the controls drop below the count when the
                viewport is too narrow for a single row. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Showing {visibleProducts.length} of {PRODUCTS.length}{' '}
                  products
                </Text>
              </StackItem>
              <Selector
                label="Sort by"
                isLabelHidden
                size="sm"
                options={SORT_OPTIONS}
                value={sort}
                onChange={setSort}
                width={180}
              />
              <SegmentedControl
                label="View mode"
                value={view}
                onChange={setView}
                size="sm">
                <SegmentedControlItem label="Grid" value="grid" />
                <SegmentedControlItem label="List" value="list" />
              </SegmentedControl>
            </HStack>

            {visibleProducts.length === 0 ? (
              <EmptyState
                icon={<Icon icon={InboxIcon} size="lg" />}
                title="No products match your filters"
                description="Try widening the price range or adding categories back."
                actions={
                  <Button
                    label="Reset filters"
                    variant="secondary"
                    onClick={resetFilters}
                  />
                }
              />
            ) : view === 'grid' ? (
              <Grid columns={{minWidth: 220}} gap={4}>
                {visibleProducts.map(product => (
                  <ProductGridCard key={product.id} product={product} />
                ))}
              </Grid>
            ) : (
              <VStack gap={2}>
                {visibleProducts.map(product => (
                  <ProductListRow
                    key={product.id}
                    product={product}
                    showBlurb={!isCompact}
                  />
                ))}
              </VStack>
            )}
          </VStack>
        </LayoutContent>
      }
    />
  );
}
