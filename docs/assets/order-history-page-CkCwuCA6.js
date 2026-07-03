var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file order-history-page.tsx
 * @input Deterministic fixtures only (one account — Avery Whitman at
 *   'Trailhead Supply' — with 9 orders spanning 2025–2026 across five
 *   statuses: delivered, shipped, processing, cancelled, and returned;
 *   each order carries fixed ISO placed dates, 1–3 line items with
 *   gradient placeholder art, shipping/tax cents, a payment-method label,
 *   and a fulfillment stage index; lifetime stats derive from the same
 *   fixture array so chips and list never disagree)
 * @output Account-scoped order history page: a header with the page title,
 *   signed-in scope line, and a live cart-count Button; a content column
 *   opening with lifetime-stats chips (orders, lifetime spend, items,
 *   member-since), then a filter bar (status Selector, year Selector,
 *   product search TextInput, Cards/Table SegmentedControl, contextual
 *   Clear-filters); two switchable list layouts — detailed order Cards
 *   with item thumbnails, per-item Buy-again and Review buttons, a status
 *   Badge with a delivery-date note, and an inline Details expansion
 *   (payment summary + mini four-stage progress strip); or a compact
 *   table variant whose rows expand inline to the same detail block plus
 *   line items. View-invoice opens a formatted invoice Dialog with a
 *   download action; Track-package toasts a deep link toward the
 *   order-tracking template; Buy-again increments the header cart count;
 *   filters and search compose live with a no-results EmptyState and
 *   clear-filters action; cancelled and returned orders render distinct
 *   muted/refund treatments
 * @position Page template; emitted by \`astryx template order-history-page\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * title, account scope line, and the cart-count Button. LayoutContent
 * scrolls the column; contentWidth={960} centers it on wide viewports.
 * Stats chips and the filter bar sit above the list; each order is a Card
 * in the detailed layout, while the compact layout is one Card hosting a
 * grid table with expandable rows. Choose over order-tracking when the
 * surface is the WHOLE purchase history — many orders, filters, two list
 * densities — not one shipment in flight; choose over a generic data
 * table when rows are commerce orders that expand into line items,
 * payment summaries, and fulfillment progress.
 *
 * Interaction contract:
 * - Layout toggle: a Cards/Table SegmentedControl swaps list densities.
 *   The toggle and every expanded row persist while filtering — expansion
 *   is keyed by order id in a Set, never reset by filter changes.
 * - Filters: status Selector, year Selector, and product search compose
 *   live (AND semantics). Search matches order numbers, item names, and
 *   variants. Zero matches renders an EmptyState whose action clears all
 *   three controls; a Clear-filters button also appears in the bar while
 *   any filter is active.
 * - Detailed cards: each line item offers Buy again (increments the
 *   header cart count and toasts) and, on delivered/returned orders,
 *   Review (flips to a checked 'Reviewed' state per item). A Details
 *   toggle expands the payment summary and a mini four-stage progress
 *   strip (placed → packed → shipped → delivered; cancelled orders show
 *   a truncated placed → cancelled strip in error color).
 * - Compact table: the whole row is a real <button> that toggles its
 *   inline expansion (line items + payment summary + progress strip +
 *   order actions); the chevron glyph flips with state.
 * - View invoice opens a formatted invoice Dialog (bill-to, line-item
 *   rows, totals, payment method, refund line when applicable) with a
 *   Download-PDF action that flips to 'Downloaded'. Track package (only
 *   on shipped/processing orders) toasts the deep link toward the
 *   order-tracking template.
 *
 * Responsive contract:
 * - Column: Layout contentWidth={960} centers a max 960px column on wide
 *   viewports; below that the column keeps full width minus slot padding.
 * - Header: the cart Button wraps under the title line at <=640px and
 *   grows to a 40px tap target; nothing is hover-only anywhere — every
 *   affordance is a labeled Button/IconButton or a real row button.
 * - Filter bar: controls wrap onto multiple lines at <=640px; the search
 *   input keeps a 180px minimum so typing room never collapses; Selector,
 *   SegmentedControl, and Clear-filters grow to 40px tap targets.
 * - Detailed cards: the order header wraps its action cluster (invoice /
 *   track / details) onto its own line at <=640px; item rows stack their
 *   Buy-again/Review buttons under the item text instead of squeezing the
 *   name column; all sm buttons grow to 40px tap targets.
 * - Compact table: the grid keeps a 640px minimum and pans horizontally
 *   inside a deliberate overflow-x scroller at narrow widths so columns
 *   never sliver-wrap; expanded detail blocks live outside the scroller
 *   and wrap naturally at 375px.
 * - Invoice dialog: width min(560px, 92vw) so it never overflows small
 *   screens; the footer keeps Close + Download side by side at 375px.
 *
 * Container policy (account purchase-history archetype): page chrome is
 * frame-first; the detailed layout uses one Card per order (each order is
 * a self-contained receipt surface); the compact layout is a single Card
 * hosting grid rows + Dividers (table idiom); stats chips are styled
 * pills, not Cards, so they read as summary chrome rather than widgets.
 * All fixtures are fixed — no clocks, randomness, or network assets; item
 * thumbnails and the invoice header are styled gradient placeholders.
 *
 * Color policy: all chrome uses semantic tokens and adapts to light/dark.
 * The ONLY scheme-locked surfaces are the product-thumbnail gradient tiles
 * (each item's \`gradient\` literal + styles.itemArt): they stand in for
 * product photography, so like real images they keep identical brand
 * gradients in both schemes (colorScheme locked to 'light' on the tile),
 * and the overlaid icon stays a literal #FFFFFF — not a token — so it
 * remains readable on the fixed gradient regardless of scheme.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BackpackIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CoffeeIcon,
  CompassIcon,
  CreditCardIcon,
  DownloadIcon,
  FlameIcon,
  FlashlightIcon,
  FootprintsIcon,
  HomeIcon,
  MapIcon,
  PackageIcon,
  PackageSearchIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  SearchIcon,
  ShirtIcon,
  ShoppingCartIcon,
  StarIcon,
  TentIcon,
  TruckIcon,
  WalletIcon,
  WatchIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by \`@astryxdesign/core/astryx.css\`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  mono: {
    fontFamily: 'var(--font-family-code)',
  },
  headerRow: {
    width: '100%',
  },
  // <=640px: primary controls grow to >=40px hit boxes; Button md/sm
  // heights stay for pointer-first layouts.
  tapTarget: {
    minHeight: 40,
  },
  iconTapTarget: {
    width: 40,
    height: 40,
  },

  // ---- lifetime stats chips ----
  statChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 999,
    padding: 'var(--spacing-1) var(--spacing-3)',
    minHeight: 36,
    backgroundColor: 'var(--color-background)',
  },

  // ---- filter bar ----
  searchSlot: {
    minWidth: 180,
    flex: '1 1 220px',
  },

  // ---- detailed order cards ----
  // Scheme-locked surface (see header Color policy): gradient placeholder
  // thumbnails stand in for product photography, so their fixture gradients
  // never flip with the color scheme; colorScheme is pinned and the overlay
  // icon stays literal white so it reads on the fixed gradient in both
  // schemes.
  itemArt: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 10,
    colorScheme: 'light',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  itemArtMuted: {
    opacity: 0.55,
  },
  // Expanded details block inside a card or under a table row.
  detailBlock: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },

  // ---- mini progress strip ----
  stripRow: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  stripCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flex: 1,
    minWidth: 0,
    textAlign: 'center',
  },
  stripNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    borderRadius: '50%',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  stripNodeDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  stripNodeActive: {
    border: '2px solid var(--color-accent)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-accent)',
  },
  stripNodeUpcoming: {
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-secondary)',
  },
  stripNodeError: {
    backgroundColor: 'var(--color-error)',
    color: 'var(--color-on-error)',
  },
  stripBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginTop: 12, // half of the 26px node = circle midline
    minWidth: 10,
  },
  stripBarDone: {
    backgroundColor: 'var(--color-accent)',
  },
  stripBarUpcoming: {
    backgroundColor: 'var(--color-border)',
  },
  stripBarError: {
    backgroundColor: 'var(--color-error)',
  },

  // ---- compact table variant ----
  // The grid keeps a 640px minimum and pans horizontally inside this
  // deliberate overflow-x scroller at narrow widths.
  tableScroll: {
    overflowX: 'auto',
  },
  tableScrollInner: {
    minWidth: 640,
  },
  tableGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 1.6fr) 110px 150px 56px 96px 36px',
    alignItems: 'center',
    columnGap: 'var(--spacing-2)',
    width: '100%',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // The whole compact row is a real <button>: keyboard-reachable, no
  // hover-only affordances, ~48px tall tap target.
  tableRowButton: {
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
    minHeight: 48,
  },
  tableCell: {
    minWidth: 0,
  },
  tableDetail: {
    padding: 'var(--spacing-1) var(--spacing-3) var(--spacing-3)',
  },
  errorText: {
    color: 'var(--color-error)',
  },
  fullWidth: {
    width: '100%',
  },
};

// ============= DATA =============
// Deterministic fixtures: nine orders across 2025–2026 for one account.
// No clocks, no randomness, no network assets. "Today" in copy refers to
// the fixed fixture date 2026-07-01.

const STORE_NAME = 'Trailhead Supply';
const ACCOUNT_NAME = 'Avery Whitman';
const ACCOUNT_EMAIL = 'avery.w@example.com';
const MEMBER_SINCE = '2024';
const BILL_TO_LINES = ['2114 Bluff Springs Rd, Apt 227', 'Austin, TX 78744'];

type OrderStatus =
  | 'delivered'
  | 'shipped'
  | 'processing'
  | 'cancelled'
  | 'returned';

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  qty: number;
  unitPriceCents: number;
  icon: IconType;
  gradient: string; // placeholder art — no network images
}

interface Order {
  id: string;
  number: string;
  placedOn: string; // fixed ISO date
  year: '2026' | '2025';
  status: OrderStatus;
  /** Fixed date-bearing caption beside the status Badge: delivery date,
   * ETA, refund note — whatever the status makes primary. */
  statusNote: string;
  /** Completed-stage count for the mini progress strip (0–4). Ignored for
   * cancelled orders, which render a truncated error strip. */
  stageIndex: number;
  items: OrderItem[];
  shippingCents: number;
  taxCents: number;
  paymentLabel: string;
  /** Refund already issued (returned/cancelled orders). */
  refundCents?: number;
}

const STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    badge: 'success' | 'info' | 'neutral' | 'error' | 'warning';
    icon: IconType;
  }
> = {
  delivered: {label: 'Delivered', badge: 'success', icon: CheckIcon},
  shipped: {label: 'Shipped', badge: 'info', icon: TruckIcon},
  processing: {label: 'Processing', badge: 'neutral', icon: PackageIcon},
  cancelled: {label: 'Cancelled', badge: 'error', icon: XIcon},
  returned: {label: 'Returned', badge: 'warning', icon: RotateCcwIcon},
};

// Nine orders, newest first. TS-482915 mirrors the shipment tracked by
// the order-tracking template so Track package reads as a real deep link.
const ORDERS: ReadonlyArray<Order> = [
  {
    id: 'ord-482915',
    number: 'TS-482915',
    placedOn: '2026-06-27T09:34:00Z',
    year: '2026',
    status: 'shipped',
    statusNote: 'Arriving Jul 1, by 8:00 PM',
    stageIndex: 2,
    items: [
      {
        id: 'item-pack',
        name: 'Cascade 65L Trekking Pack',
        variant: 'Moss · One size',
        qty: 1,
        unitPriceCents: 18900,
        icon: BackpackIcon,
        gradient: 'linear-gradient(135deg, #2F6B4F, #7BB08A)',
      },
      {
        id: 'item-jacket',
        name: 'Ridgeline Insulated Jacket',
        variant: 'Slate · Medium',
        qty: 1,
        unitPriceCents: 14800,
        icon: ShirtIcon,
        gradient: 'linear-gradient(135deg, #3C4A5C, #8296AC)',
      },
      {
        id: 'item-mug',
        name: 'Basecamp Titanium Mug',
        variant: '450 ml · 2-pack',
        qty: 2,
        unitPriceCents: 1600,
        icon: CoffeeIcon,
        gradient: 'linear-gradient(135deg, #8A5A2B, #C99B62)',
      },
    ],
    shippingCents: 0,
    taxCents: 3044,
    paymentLabel: 'Visa •••• 4242',
  },
  {
    id: 'ord-471203',
    number: 'TS-471203',
    placedOn: '2026-06-30T15:12:00Z',
    year: '2026',
    status: 'processing',
    statusNote: 'Preparing to ship · est. Jul 8',
    stageIndex: 1,
    items: [
      {
        id: 'item-stove',
        name: 'Emberline Canister Stove',
        variant: 'Titanium · 88 g',
        qty: 1,
        unitPriceCents: 6400,
        icon: FlameIcon,
        gradient: 'linear-gradient(135deg, #B0451F, #E08A4C)',
      },
    ],
    shippingCents: 595,
    taxCents: 577,
    paymentLabel: 'Visa •••• 4242',
  },
  {
    id: 'ord-458820',
    number: 'TS-458820',
    placedOn: '2026-06-06T18:40:00Z',
    year: '2026',
    status: 'delivered',
    statusNote: 'Delivered Jun 14, 2026',
    stageIndex: 4,
    items: [
      {
        id: 'item-boots',
        name: 'Talus Mid Hiking Boots',
        variant: 'Walnut · US 10',
        qty: 1,
        unitPriceCents: 16500,
        icon: FootprintsIcon,
        gradient: 'linear-gradient(135deg, #5C4327, #A98A5B)',
      },
      {
        id: 'item-socks',
        name: 'Merino Trail Socks',
        variant: 'Crew · 3-pack',
        qty: 1,
        unitPriceCents: 3600,
        icon: ShirtIcon,
        gradient: 'linear-gradient(135deg, #4E5D3A, #93A76B)',
      },
    ],
    shippingCents: 0,
    taxCents: 1658,
    paymentLabel: 'Visa •••• 4242',
  },
  {
    id: 'ord-440511',
    number: 'TS-440511',
    placedOn: '2026-04-19T12:05:00Z',
    year: '2026',
    status: 'delivered',
    statusNote: 'Delivered Apr 24, 2026',
    stageIndex: 4,
    items: [
      {
        id: 'item-tent',
        name: 'Stargazer 2P Backpacking Tent',
        variant: 'Juniper · 2-person',
        qty: 1,
        unitPriceCents: 32900,
        icon: TentIcon,
        gradient: 'linear-gradient(135deg, #1F5F5B, #58A39A)',
      },
      {
        id: 'item-lantern',
        name: 'Firefly Camp Lantern',
        variant: '350 lm · USB-C',
        qty: 1,
        unitPriceCents: 4200,
        icon: FlashlightIcon,
        gradient: 'linear-gradient(135deg, #91762B, #D8BC6A)',
      },
    ],
    shippingCents: 0,
    taxCents: 3061,
    paymentLabel: 'Mastercard •••• 8210',
  },
  {
    id: 'ord-433976',
    number: 'TS-433976',
    placedOn: '2026-03-14T09:18:00Z',
    year: '2026',
    status: 'returned',
    statusNote: 'Returned Mar 30 · $93.42 refunded',
    stageIndex: 4,
    items: [
      {
        id: 'item-watch',
        name: 'Summit Alti-Watch',
        variant: 'Graphite · 42 mm',
        qty: 1,
        unitPriceCents: 8600,
        icon: WatchIcon,
        gradient: 'linear-gradient(135deg, #33383F, #6E7B8A)',
      },
    ],
    shippingCents: 0,
    taxCents: 742,
    paymentLabel: 'Visa •••• 4242',
    refundCents: 9342,
  },
  {
    id: 'ord-421040',
    number: 'TS-421040',
    placedOn: '2026-02-07T20:51:00Z',
    year: '2026',
    status: 'cancelled',
    statusNote: 'Cancelled Feb 9 · refund issued',
    stageIndex: 0,
    items: [
      {
        id: 'item-compass',
        name: 'Northlight Baseplate Compass',
        variant: 'Declination-adjustable',
        qty: 1,
        unitPriceCents: 3800,
        icon: CompassIcon,
        gradient: 'linear-gradient(135deg, #7A2E2E, #C46A5A)',
      },
      {
        id: 'item-map',
        name: 'Hill Country Topo Map Set',
        variant: 'Waterproof · 4 maps',
        qty: 1,
        unitPriceCents: 2900,
        icon: MapIcon,
        gradient: 'linear-gradient(135deg, #2E5E7A, #6AA3C4)',
      },
    ],
    shippingCents: 595,
    taxCents: 604,
    paymentLabel: 'Mastercard •••• 8210',
    refundCents: 7699,
  },
  {
    id: 'ord-398155',
    number: 'TS-398155',
    placedOn: '2025-11-28T08:02:00Z',
    year: '2025',
    status: 'delivered',
    statusNote: 'Delivered Dec 4, 2025',
    stageIndex: 4,
    items: [
      {
        id: 'item-parka',
        name: 'Timberline Down Parka',
        variant: 'Pine · Medium',
        qty: 1,
        unitPriceCents: 24900,
        icon: ShirtIcon,
        gradient: 'linear-gradient(135deg, #274633, #5F8A6C)',
      },
      {
        id: 'item-beanie',
        name: 'Wool Ridge Beanie',
        variant: 'Ember · One size',
        qty: 2,
        unitPriceCents: 2400,
        icon: ShirtIcon,
        gradient: 'linear-gradient(135deg, #96402A, #D07E55)',
      },
      {
        id: 'item-headlamp',
        name: 'Nightfall Headlamp',
        variant: '600 lm · rechargeable',
        qty: 1,
        unitPriceCents: 5400,
        icon: FlashlightIcon,
        gradient: 'linear-gradient(135deg, #3A3357, #7A6FA3)',
      },
    ],
    shippingCents: 0,
    taxCents: 2900,
    paymentLabel: 'Visa •••• 4242',
  },
  {
    id: 'ord-380402',
    number: 'TS-380402',
    placedOn: '2025-08-16T14:27:00Z',
    year: '2025',
    status: 'delivered',
    statusNote: 'Delivered Aug 21, 2025',
    stageIndex: 4,
    items: [
      {
        id: 'item-hammock',
        name: 'Driftwood Camp Hammock',
        variant: 'Sandstone · single',
        qty: 1,
        unitPriceCents: 7200,
        icon: TentIcon,
        gradient: 'linear-gradient(135deg, #8A6A3B, #C9A972)',
      },
    ],
    shippingCents: 595,
    taxCents: 643,
    paymentLabel: 'Visa •••• 4242',
  },
  {
    id: 'ord-362219',
    number: 'TS-362219',
    placedOn: '2025-05-03T10:44:00Z',
    year: '2025',
    status: 'delivered',
    statusNote: 'Delivered May 9, 2025',
    stageIndex: 4,
    items: [
      {
        id: 'item-daypack',
        name: 'Switchback 24L Daypack',
        variant: 'Cobalt · One size',
        qty: 1,
        unitPriceCents: 8900,
        icon: BackpackIcon,
        gradient: 'linear-gradient(135deg, #2B4E8A, #6C8FC9)',
      },
      {
        id: 'item-press',
        name: 'Trailside Coffee Press',
        variant: '350 ml · insulated',
        qty: 1,
        unitPriceCents: 3400,
        icon: CoffeeIcon,
        gradient: 'linear-gradient(135deg, #4A3226, #8A6A55)',
      },
    ],
    shippingCents: 595,
    taxCents: 1064,
    paymentLabel: 'Mastercard •••• 8210',
  },
];

// ---- filter options ----

const STATUS_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'delivered', label: 'Delivered'},
  {value: 'shipped', label: 'Shipped'},
  {value: 'processing', label: 'Processing'},
  {value: 'cancelled', label: 'Cancelled'},
  {value: 'returned', label: 'Returned'},
];

const YEAR_OPTIONS = [
  {value: 'all', label: 'All years'},
  {value: '2026', label: '2026'},
  {value: '2025', label: '2025'},
];

// ---- mini progress strip stages ----

interface StripStage {
  label: string;
  icon: IconType;
  state: 'done' | 'active' | 'upcoming' | 'error';
}

const FULFILLMENT_STAGES: ReadonlyArray<{label: string; icon: IconType}> = [
  {label: 'Placed', icon: ReceiptTextIcon},
  {label: 'Packed', icon: PackageIcon},
  {label: 'Shipped', icon: TruckIcon},
  {label: 'Delivered', icon: HomeIcon},
];

/** Stage list for one order. Cancelled orders truncate to an error strip;
 * everything else walks the four fulfillment stages by stageIndex. */
function stagesFor(order: Order): StripStage[] {
  if (order.status === 'cancelled') {
    return [
      {label: 'Placed', icon: ReceiptTextIcon, state: 'done'},
      {label: 'Cancelled', icon: XIcon, state: 'error'},
    ];
  }
  return FULFILLMENT_STAGES.map((stage, index) => ({
    ...stage,
    state:
      index < order.stageIndex
        ? 'done'
        : index === order.stageIndex
          ? 'active'
          : 'upcoming',
  }));
}

// ============= HELPERS =============

/** Cents -> "$1,234.56"; deterministic, no locale surprises in fixtures. */
const usd = (cents: number): string => {
  const dollars = Math.floor(cents / 100);
  const remainder = \`\${cents % 100}\`.padStart(2, '0');
  return \`$\${dollars.toLocaleString('en-US')}.\${remainder}\`;
};

const orderSubtotalCents = (order: Order): number =>
  order.items.reduce((total, item) => total + item.unitPriceCents * item.qty, 0);

const orderTotalCents = (order: Order): number =>
  orderSubtotalCents(order) + order.shippingCents + order.taxCents;

const orderItemCount = (order: Order): number =>
  order.items.reduce((total, item) => total + item.qty, 0);

// Lifetime stats derive from the same fixture array as the list, so the
// chips and rows can never disagree. Cancelled orders do not count toward
// spend or items — they were refunded before fulfillment.
const LIFETIME_ORDER_COUNT = ORDERS.length;
const LIFETIME_SPEND_CENTS = ORDERS.filter(
  order => order.status !== 'cancelled',
).reduce((total, order) => total + orderTotalCents(order), 0);
const LIFETIME_ITEM_COUNT = ORDERS.filter(
  order => order.status !== 'cancelled',
).reduce((total, order) => total + orderItemCount(order), 0);

// ============= SMALL PIECES =============

/** One lifetime-stat pill in the page intro. */
function StatChip({
  icon,
  value,
  label,
}: {
  icon: IconType;
  value: string;
  label: string;
}) {
  return (
    <div style={styles.statChip}>
      <Icon icon={icon} size="sm" color="secondary" aria-hidden />
      <Text type="body" weight="semibold" hasTabularNumbers>
        {value}
      </Text>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </div>
  );
}

/** Gradient placeholder thumbnail — no network images. */
function ItemArt({item, isMuted}: {item: OrderItem; isMuted: boolean}) {
  return (
    <div
      aria-hidden
      style={{
        ...styles.itemArt,
        background: item.gradient,
        ...(isMuted ? styles.itemArtMuted : undefined),
      }}>
      <Icon icon={item.icon} size="sm" color="inherit" />
    </div>
  );
}

/**
 * Mini four-stage fulfillment strip (placed → packed → shipped →
 * delivered). Cancelled orders render a truncated placed → cancelled
 * strip in error color so the terminal state is unmistakable.
 */
function ProgressStrip({order}: {order: Order}) {
  const stages = stagesFor(order);
  const isError = order.status === 'cancelled';
  return (
    <div style={styles.stripRow}>
      {stages.map((stage, index) => {
        const nodeStyle =
          stage.state === 'done'
            ? styles.stripNodeDone
            : stage.state === 'active'
              ? styles.stripNodeActive
              : stage.state === 'error'
                ? styles.stripNodeError
                : styles.stripNodeUpcoming;
        const barStyle = isError
          ? styles.stripBarError
          : index <= order.stageIndex
            ? styles.stripBarDone
            : styles.stripBarUpcoming;
        return (
          <div key={stage.label} style={{display: 'contents'}}>
            {index > 0 && <div style={{...styles.stripBar, ...barStyle}} />}
            <div style={styles.stripCell}>
              <div style={{...styles.stripNode, ...nodeStyle}}>
                <Icon
                  icon={stage.state === 'done' ? CheckIcon : stage.icon}
                  size="xsm"
                  color="inherit"
                  aria-hidden
                />
              </div>
              <Text
                type="supporting"
                color={stage.state === 'upcoming' ? 'secondary' : undefined}
                style={stage.state === 'error' ? styles.errorText : undefined}
                maxLines={1}>
                {stage.label}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Right-aligned money row for payment summaries and the invoice. */
function TotalRow({
  label,
  value,
  isEmphasized,
  isRefund,
}: {
  label: string;
  value: string;
  isEmphasized?: boolean;
  isRefund?: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <Text
          type={isEmphasized ? 'body' : 'supporting'}
          weight={isEmphasized ? 'semibold' : 'normal'}
          color={isEmphasized || isRefund ? undefined : 'secondary'}
          style={isRefund ? styles.errorText : undefined}>
          {label}
        </Text>
      </StackItem>
      <Text
        type={isEmphasized ? 'body' : 'supporting'}
        weight={isEmphasized ? 'semibold' : 'normal'}
        color={isEmphasized || isRefund ? undefined : 'secondary'}
        style={isRefund ? styles.errorText : undefined}
        hasTabularNumbers>
        {value}
      </Text>
    </HStack>
  );
}

/** Payment summary shared by card expansion, table expansion, and the
 * invoice dialog footprint. */
function PaymentSummary({order}: {order: Order}) {
  return (
    <VStack gap={1.5}>
      <TotalRow label="Subtotal" value={usd(orderSubtotalCents(order))} />
      <TotalRow
        label="Shipping"
        value={order.shippingCents === 0 ? 'Free' : usd(order.shippingCents)}
      />
      <TotalRow label="Tax" value={usd(order.taxCents)} />
      <TotalRow label="Total" value={usd(orderTotalCents(order))} isEmphasized />
      {order.refundCents != null && (
        <TotalRow
          label="Refund issued"
          value={\`−\${usd(order.refundCents)}\`}
          isRefund
        />
      )}
      <HStack gap={2} vAlign="center">
        <Icon icon={CreditCardIcon} size="sm" color="secondary" aria-hidden />
        <Text type="supporting" color="secondary">
          {order.paymentLabel}
        </Text>
      </HStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function OrderHistoryPage() {
  // Responsive contract: <=640px wraps chrome, grows tap targets, and
  // stacks per-item actions under the item text.
  const isCompact = useMediaQuery('(max-width: 640px)');
  const toast = useToast();

  // ---- interactive state ----
  // Layout toggle and the expansion Set survive every filter change: the
  // Set is keyed by order id and only mutated by explicit toggles.
  const [layoutMode, setLayoutMode] = useState('cards');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [reviewedKeys, setReviewedKeys] = useState<Set<string>>(
    () => new Set(),
  );
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [hasDownloadedInvoice, setHasDownloadedInvoice] = useState(false);

  const hasActiveFilters =
    statusFilter !== 'all' || yearFilter !== 'all' || query.trim() !== '';

  // Filters and search compose live with AND semantics. Search matches
  // order numbers, item names, and variants, case-insensitively.
  const visibleOrders = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ORDERS.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }
      if (yearFilter !== 'all' && order.year !== yearFilter) {
        return false;
      }
      if (needle === '') {
        return true;
      }
      const haystack = [
        order.number,
        ...order.items.map(item => \`\${item.name} \${item.variant}\`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [statusFilter, yearFilter, query]);

  // ---- interactions ----

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setYearFilter('all');
    setQuery('');
  };

  const buyAgain = (item: OrderItem) => {
    setCartCount(prev => prev + 1);
    toast({body: \`Added \${item.name} to your cart\`});
  };

  const reviewItem = (orderId: string, item: OrderItem) => {
    setReviewedKeys(prev => new Set(prev).add(\`\${orderId}/\${item.id}\`));
    toast({body: \`Thanks — your review of \${item.name} is saved\`});
  };

  const trackPackage = (order: Order) => {
    // Deep link toward the order-tracking template; fixtures share the
    // same TS-482915 shipment so the hand-off reads as real.
    toast({
      body: \`Opening tracking for \${order.number} — continues in the Order Tracking page\`,
    });
  };

  const openInvoice = (order: Order) => {
    setInvoiceOrder(order);
    setHasDownloadedInvoice(false);
  };

  // Tap-target raise applied to primary controls on touch-first widths.
  const tapStyle = isCompact ? styles.tapTarget : undefined;

  // ---- header ----

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Icon icon={PackageSearchIcon} size="md" color="secondary" />
              <Heading level={1}>Order history</Heading>
            </HStack>
            <Text type="supporting" color="secondary">
              {STORE_NAME} · signed in as {ACCOUNT_NAME} ({ACCOUNT_EMAIL})
            </Text>
          </VStack>
        </StackItem>
        <Button
          label={cartCount === 0 ? 'Cart' : \`Cart (\${cartCount})\`}
          variant="secondary"
          icon={<Icon icon={ShoppingCartIcon} size="sm" color="inherit" />}
          onClick={() =>
            toast({
              body:
                cartCount === 0
                  ? 'Your cart is empty — Buy again adds items here'
                  : \`Cart has \${cartCount} \${cartCount === 1 ? 'item' : 'items'} ready for checkout\`,
            })
          }
          style={tapStyle}
        />
      </HStack>
    </LayoutHeader>
  );

  // ---- lifetime stats chips ----

  const statsRow = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <StatChip
        icon={PackageIcon}
        value={\`\${LIFETIME_ORDER_COUNT}\`}
        label="orders"
      />
      <StatChip
        icon={WalletIcon}
        value={usd(LIFETIME_SPEND_CENTS)}
        label="lifetime"
      />
      <StatChip
        icon={ShoppingCartIcon}
        value={\`\${LIFETIME_ITEM_COUNT}\`}
        label="items"
      />
      <StatChip
        icon={CalendarIcon}
        value={MEMBER_SINCE}
        label="member since"
      />
    </HStack>
  );

  // ---- filter bar ----

  const filterBar = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <Selector
        label="Status"
        isLabelHidden
        size="sm"
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        style={tapStyle}
      />
      <Selector
        label="Year"
        isLabelHidden
        size="sm"
        options={YEAR_OPTIONS}
        value={yearFilter}
        onChange={setYearFilter}
        style={tapStyle}
      />
      <div style={styles.searchSlot}>
        <TextInput
          label="Search products"
          isLabelHidden
          size="sm"
          placeholder="Search products or order numbers…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={setQuery}
          hasClear
          style={tapStyle}
        />
      </div>
      <SegmentedControl
        label="List layout"
        size="sm"
        value={layoutMode}
        onChange={setLayoutMode}
        style={tapStyle}>
        <SegmentedControlItem label="Cards" value="cards" />
        <SegmentedControlItem label="Table" value="table" />
      </SegmentedControl>
      {hasActiveFilters && (
        <Button
          label="Clear filters"
          variant="ghost"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          onClick={clearFilters}
          style={tapStyle}
        />
      )}
    </HStack>
  );

  const resultLine = (
    <Text type="supporting" color="secondary" hasTabularNumbers>
      Showing {visibleOrders.length} of {ORDERS.length} orders
      {hasActiveFilters ? ' · filters active' : ''}
    </Text>
  );

  // ---- shared per-order pieces ----

  /** Action cluster for one order: invoice, tracking (when in flight),
   * and the details/expansion toggle. */
  const orderActions = (order: Order, isExpanded: boolean) => (
    <HStack gap={1} vAlign="center" wrap="wrap">
      <Button
        label="View invoice"
        variant="ghost"
        size="sm"
        icon={<Icon icon={ReceiptTextIcon} size="sm" color="inherit" />}
        onClick={() => openInvoice(order)}
        style={tapStyle}
      />
      {(order.status === 'shipped' || order.status === 'processing') && (
        <Button
          label="Track package"
          variant="secondary"
          size="sm"
          icon={<Icon icon={TruckIcon} size="sm" color="inherit" />}
          onClick={() => trackPackage(order)}
          style={tapStyle}
        />
      )}
      <Button
        label={isExpanded ? 'Hide details' : 'Details'}
        variant="ghost"
        size="sm"
        icon={
          <Icon
            icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            size="sm"
            color="inherit"
          />
        }
        onClick={() => toggleExpanded(order.id)}
        style={tapStyle}
      />
    </HStack>
  );

  /** Buy-again + Review buttons for one line item. Review only exists on
   * delivered/returned orders; once used it flips to a checked state. */
  const itemActions = (order: Order, item: OrderItem) => {
    const reviewKey = \`\${order.id}/\${item.id}\`;
    const isReviewed = reviewedKeys.has(reviewKey);
    const canReview = order.status === 'delivered' || order.status === 'returned';
    return (
      <HStack gap={1} vAlign="center" wrap="wrap">
        <Button
          label="Buy again"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          onClick={() => buyAgain(item)}
          style={tapStyle}
        />
        {canReview && (
          <Button
            label={isReviewed ? 'Reviewed' : 'Review'}
            variant="ghost"
            size="sm"
            isDisabled={isReviewed}
            icon={
              <Icon
                icon={isReviewed ? CheckIcon : StarIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={() => reviewItem(order.id, item)}
            style={tapStyle}
          />
        )}
      </HStack>
    );
  };

  /** One item row in the detailed card (or table expansion). At <=640px
   * the action buttons stack under the item text instead of squeezing it. */
  const itemRow = (order: Order, item: OrderItem, showActions: boolean) => {
    const isMuted = order.status === 'cancelled';
    const details = (
      <StackItem size="fill">
        <VStack gap={0.5} style={styles.tableCell}>
          <Text
            type="body"
            color={isMuted ? 'secondary' : undefined}
            maxLines={1}>
            {item.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.variant} · Qty {item.qty} · {usd(item.unitPriceCents)} each
          </Text>
        </VStack>
      </StackItem>
    );
    const price = (
      <Text type="body" hasTabularNumbers color={isMuted ? 'secondary' : undefined}>
        {usd(item.unitPriceCents * item.qty)}
      </Text>
    );
    if (isCompact && showActions) {
      return (
        <VStack key={item.id} gap={2}>
          <HStack gap={3} vAlign="center">
            <ItemArt item={item} isMuted={isMuted} />
            {details}
            {price}
          </HStack>
          {itemActions(order, item)}
        </VStack>
      );
    }
    return (
      <HStack key={item.id} gap={3} vAlign="center">
        <ItemArt item={item} isMuted={isMuted} />
        {details}
        {showActions && itemActions(order, item)}
        {price}
      </HStack>
    );
  };

  /** Expanded detail block: payment summary + mini progress strip. Shared
   * by both layouts; the table variant also lists items above it. */
  const detailBlock = (order: Order, withItems: boolean) => (
    <div style={styles.detailBlock}>
      <VStack gap={3}>
        {withItems && (
          <>
            <Text type="label" color="secondary">
              Items
            </Text>
            <VStack gap={3}>
              {order.items.map(item => itemRow(order, item, true))}
            </VStack>
            <Divider />
          </>
        )}
        <Text type="label" color="secondary">
          Fulfillment
        </Text>
        <ProgressStrip order={order} />
        <Divider />
        <Text type="label" color="secondary">
          Payment
        </Text>
        <PaymentSummary order={order} />
      </VStack>
    </div>
  );

  // ---- detailed card layout ----

  const orderCard = (order: Order) => {
    const meta = STATUS_META[order.status];
    const isExpanded = expandedIds.has(order.id);
    const isTerminalBad = order.status === 'cancelled';
    return (
      <Card
        key={order.id}
        padding={4}
        variant={isTerminalBad ? 'muted' : undefined}>
        <VStack gap={3}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={0.5} style={styles.tableCell}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="body" weight="semibold">
                    <span style={styles.mono}>{order.number}</span>
                  </Text>
                  <Badge label={meta.label} variant={meta.badge} />
                  <Text type="supporting" color="secondary">
                    {order.statusNote}
                  </Text>
                </HStack>
                <HStack gap={1} vAlign="center" wrap="wrap">
                  <Text type="supporting" color="secondary">
                    Placed
                  </Text>
                  <Timestamp
                    value={order.placedOn}
                    format="date"
                    color="secondary"
                  />
                  <Text type="supporting" color="secondary">
                    · {orderItemCount(order)}{' '}
                    {orderItemCount(order) === 1 ? 'item' : 'items'} ·{' '}
                    {usd(orderTotalCents(order))}
                  </Text>
                </HStack>
              </VStack>
            </StackItem>
            {orderActions(order, isExpanded)}
          </HStack>
          <Divider />
          <VStack gap={3}>
            {order.items.map(item => itemRow(order, item, true))}
          </VStack>
          {isExpanded && detailBlock(order, false)}
        </VStack>
      </Card>
    );
  };

  // ---- compact table layout ----

  const tableHeader = (
    <div style={styles.tableGrid}>
      <Text type="label" color="secondary">
        Order
      </Text>
      <Text type="label" color="secondary">
        Placed
      </Text>
      <Text type="label" color="secondary">
        Status
      </Text>
      <Text type="label" color="secondary" hasTabularNumbers>
        Items
      </Text>
      <Text type="label" color="secondary">
        Total
      </Text>
      <span aria-hidden />
    </div>
  );

  const tableRow = (order: Order) => {
    const meta = STATUS_META[order.status];
    const isExpanded = expandedIds.has(order.id);
    const firstItem = order.items[0];
    const extraCount = order.items.length - 1;
    return (
      <div key={order.id}>
        <Divider />
        {/* Deliberate overflow-x scroller: the grid keeps a 640px minimum
            so columns never sliver-wrap at 375px. */}
        <div style={styles.tableScroll}>
          <div style={styles.tableScrollInner}>
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={() => toggleExpanded(order.id)}
              style={{...styles.tableGrid, ...styles.tableRowButton}}>
              <VStack gap={0.5} style={styles.tableCell}>
                <Text type="body" weight="semibold" maxLines={1}>
                  <span style={styles.mono}>{order.number}</span>
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {firstItem.name}
                  {extraCount > 0 ? \` + \${extraCount} more\` : ''}
                </Text>
              </VStack>
              <Timestamp value={order.placedOn} format="date" color="secondary" />
              <VStack gap={0.5} style={styles.tableCell}>
                <div>
                  <Badge label={meta.label} variant={meta.badge} />
                </div>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {order.statusNote}
                </Text>
              </VStack>
              <Text type="body" hasTabularNumbers>
                {orderItemCount(order)}
              </Text>
              <Text type="body" hasTabularNumbers>
                {usd(orderTotalCents(order))}
              </Text>
              <Icon
                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
                size="sm"
                color="secondary"
                aria-hidden
              />
            </button>
          </div>
        </div>
        {isExpanded && (
          <div style={styles.tableDetail}>
            <VStack gap={3}>
              {detailBlock(order, true)}
              {orderActions(order, isExpanded)}
            </VStack>
          </div>
        )}
      </div>
    );
  };

  const tableCard = (
    <Card padding={2}>
      <div style={styles.tableScroll}>
        <div style={styles.tableScrollInner}>{tableHeader}</div>
      </div>
      {visibleOrders.map(order => tableRow(order))}
    </Card>
  );

  // ---- empty state ----

  const emptyState = (
    <Card padding={4}>
      <EmptyState
        icon={<Icon icon={SearchIcon} size="lg" />}
        title="No orders match"
        description="Nothing in your history matches the current status, year, and search filters."
        actions={
          <Button
            label="Clear filters"
            variant="secondary"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={clearFilters}
            style={tapStyle}
          />
        }
      />
    </Card>
  );

  // ---- invoice dialog ----

  const invoiceDialog = invoiceOrder != null && (
    <Dialog
      isOpen
      onOpenChange={isOpen => {
        if (!isOpen) {
          setInvoiceOrder(null);
        }
      }}
      width="min(560px, 92vw)">
      <Layout
        header={
          <DialogHeader
            title={\`Invoice INV-\${invoiceOrder.number}\`}
            subtitle={\`\${STORE_NAME} · order \${invoiceOrder.number}\`}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setInvoiceOrder(null);
              }
            }}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <HStack gap={3} vAlign="start" wrap="wrap">
                <StackItem size="fill">
                  <VStack gap={0.5}>
                    <Text type="label" color="secondary">
                      Billed to
                    </Text>
                    <Text type="body" weight="semibold">
                      {ACCOUNT_NAME}
                    </Text>
                    {BILL_TO_LINES.map(line => (
                      <Text key={line} type="supporting" color="secondary">
                        {line}
                      </Text>
                    ))}
                  </VStack>
                </StackItem>
                <VStack gap={0.5}>
                  <Text type="label" color="secondary">
                    Issued
                  </Text>
                  <Timestamp value={invoiceOrder.placedOn} format="date" />
                  <Badge
                    label={STATUS_META[invoiceOrder.status].label}
                    variant={STATUS_META[invoiceOrder.status].badge}
                  />
                </VStack>
              </HStack>
              <Divider />
              <VStack gap={2}>
                {invoiceOrder.items.map(item => (
                  <HStack key={item.id} gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Text type="body" maxLines={1}>
                        {item.name}
                      </Text>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {item.qty} × {usd(item.unitPriceCents)}
                      </Text>
                    </StackItem>
                    <Text type="body" hasTabularNumbers>
                      {usd(item.unitPriceCents * item.qty)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
              <Divider />
              <PaymentSummary order={invoiceOrder} />
              <Text type="supporting" color="secondary">
                Questions about this invoice? Reply to your order confirmation
                or write to billing@trailheadsupply.example.com.
              </Text>
            </VStack>
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill" />
              <Button
                label="Close"
                variant="ghost"
                onClick={() => setInvoiceOrder(null)}
                style={tapStyle}
              />
              <Button
                label={hasDownloadedInvoice ? 'Downloaded' : 'Download PDF'}
                variant="secondary"
                isDisabled={hasDownloadedInvoice}
                icon={
                  <Icon
                    icon={hasDownloadedInvoice ? CheckIcon : DownloadIcon}
                    size="sm"
                    color="inherit"
                  />
                }
                onClick={() => setHasDownloadedInvoice(true)}
                style={tapStyle}
              />
            </HStack>
          </LayoutFooter>
        }
      />
    </Dialog>
  );

  // ---- page ----

  return (
    <>
      <Layout
        height="fill"
        contentWidth={960}
        header={header}
        content={
          <LayoutContent padding={4} label="Order history">
            <VStack gap={4}>
              {statsRow}
              <VStack gap={2}>
                {filterBar}
                {resultLine}
              </VStack>
              {visibleOrders.length === 0 ? (
                emptyState
              ) : layoutMode === 'cards' ? (
                <VStack gap={3}>
                  {visibleOrders.map(order => orderCard(order))}
                </VStack>
              ) : (
                tableCard
              )}
            </VStack>
          </LayoutContent>
        }
      />
      {invoiceDialog}
    </>
  );
}
`;export{e as default};