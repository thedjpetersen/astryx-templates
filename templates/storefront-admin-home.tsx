// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one fixed afternoon (Thu Jul 2, 2026,
 *   as of 2:30 PM) at "Fernway Goods", a home-goods shop running on the
 *   fictional Carthill commerce platform: today's sales/orders/sessions,
 *   a 30-minute sessions series, five orders in the fulfillment queue, two
 *   low-stock alerts, five top products, and a five-step setup guide. No
 *   clocks, no randomness, no network media.
 * @output Storefront Admin Home — a Carthill merchant home: header bar
 *   (brand mark, admin search, store chip), nav rail with live unfulfilled
 *   count, and a centered home column: live-view strip (visitors-now pulse
 *   dot, 30-min sessions sparkline, cart/checkout counts), today's stat row
 *   (sales, orders, conversion with deltas) with a next-payout chip, a
 *   dismissible 3-of-5 setup-guide checklist, a working pick → pack → label
 *   fulfillment queue, low-stock reorder alerts, and a top-products mini
 *   table that reconciles to the day's net sales.
 * @position Page template; emitted by `astryx template storefront-admin-home`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (brand mark | admin search | bell + store chip)
 *   | rail 244 (TreeList nav + pinned plan strip)
 *   | content (scrolling home column, max-width 980 centered).
 * Container policy: dashboard-home archetype — the shell (header, rail) is
 *   frame-first with no Cards; the home column is a stack of widget Cards
 *   (live view, stats, setup guide, fulfillment queue, inventory alerts,
 *   top products) per the kpi-dashboard / dashboard-tabbed convention.
 * Color policy: ONE Carthill emerald brand accent —
 *   `light-dark(#047857, #34D399)` for the brand mark, active nav, live
 *   pulse, sparkline series, and setup-guide progress. Brand-primary CTAs
 *   re-pin `--color-accent` to solid #047857 on a scoped wrapper so the
 *   design-system primary Button renders emerald with white on-accent text
 *   (5.37:1, AA in both schemes). Everything else is token-pure; product
 *   thumbnail gradients use the data-viz categorical fallback pairs (the
 *   demo does not inject `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1180px: full frame; home column 980 centered.
 * - <= 960px: the nav rail is dropped (the home column is the source of
 *   truth); the store chip collapses to the avatar.
 * - <= 720px: the live-view strip stacks vertically; queue rows wrap their
 *   action cluster onto a second line; the top-products table scrolls
 *   horizontally instead of crushing cells; the header search shrinks and
 *   the header row wraps instead of clipping.
 * - The rail and the home column scroll independently (`minHeight: 0` down
 *   the flex chains); the live pulse animation is disabled under
 *   prefers-reduced-motion (the dot itself remains).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowRightIcon,
  BellIcon,
  ChartColumnIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleCheckIcon,
  ExternalLinkIcon,
  GlobeIcon,
  HomeIcon,
  LandmarkIcon,
  MegaphoneIcon,
  PackageCheckIcon,
  PackageIcon,
  PercentIcon,
  PrinterIcon,
  RadioIcon,
  SearchIcon,
  SettingsIcon,
  ShoppingBagIcon,
  SparklesIcon,
  StoreIcon,
  TagIcon,
  TriangleAlertIcon,
  UsersIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import type {BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Stat} from '@astryxdesign/core/Stat';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {TreeList} from '@astryxdesign/core/TreeList';
import type {TreeListItemData} from '@astryxdesign/core/TreeList';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Carthill emerald. The ONE brand accent for this template.
// ---------------------------------------------------------------------------

/** Accent for text/icons/strokes: emerald 700 light / emerald 400 dark. */
const BRAND_ACCENT = 'light-dark(#047857, #34D399)';
/** Tinted fills only — never text. */
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(4, 120, 87, 0.10), rgba(52, 211, 153, 0.14))';
/**
 * Solid CTA surface. #047857 keeps white on-accent text at 5.37:1 in BOTH
 * schemes, so brand-primary Buttons simply re-pin `--color-accent` here.
 */
const BRAND_SOLID = '#047857';
/** Scoped re-pin wrapper style for design-system primary Buttons. */
const brandCtaScope = {'--color-accent': BRAND_SOLID} as CSSProperties;

/** Live pulse ring; reduced motion keeps the static dot. */
const KEYFRAME_CSS = `
@keyframes carthill-live-pulse {
  0% { box-shadow: 0 0 0 0 light-dark(rgba(4,120,87,0.35), rgba(52,211,153,0.35)); }
  70% { box-shadow: 0 0 0 9px light-dark(rgba(4,120,87,0), rgba(52,211,153,0)); }
  100% { box-shadow: 0 0 0 0 light-dark(rgba(4,120,87,0), rgba(52,211,153,0)); }
}
@media (prefers-reduced-motion: reduce) {
  .carthill-pulse { animation: none !important; }
}
`;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},

  // Header bar ------------------------------------------------------------
  brandMark: {
    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: BRAND_SOLID, color: '#FFFFFF',
  },
  wordmark: {fontWeight: 700, letterSpacing: '-0.02em', whiteSpace: 'nowrap'},
  searchWrap: {flex: 1, display: 'flex', justifyContent: 'center', minWidth: 0},
  storeChip: {
    display: 'inline-flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
    padding: '3px 10px 3px 4px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
  },

  // Nav rail ----------------------------------------------------------------
  railFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railFooter: {flexShrink: 0, padding: 'var(--spacing-3)'},
  navCount: {
    display: 'inline-flex', alignItems: 'center', padding: '0 7px',
    borderRadius: 999, backgroundColor: BRAND_ACCENT_SOFT, color: BRAND_ACCENT,
    fontSize: 11, fontWeight: 600, fontVariantNumeric: 'tabular-nums',
  },

  // Home column -------------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, overflowY: 'auto'},
  column: {
    maxWidth: 980, margin: '0 auto', display: 'flex', flexDirection: 'column',
    padding: 'var(--spacing-5) var(--spacing-6) var(--spacing-8)',
    gap: 'var(--spacing-5)',
  },

  // Live-view strip -----------------------------------------------------------
  liveDot: {
    width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
    backgroundColor: BRAND_ACCENT,
    animation: 'carthill-live-pulse 2.4s ease-out infinite',
  },
  liveNumber: {
    fontSize: 28, lineHeight: '32px', fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  liveDivider: {alignSelf: 'stretch'},
  sparkBox: {display: 'block'},
  liveMetric: {whiteSpace: 'nowrap'},

  // Payout chip ---------------------------------------------------------------
  payoutChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
    padding: '4px 12px', borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
  },

  // Setup guide ---------------------------------------------------------------
  guideProgressBar: {minWidth: 0, width: 160, ...brandCtaScope},
  stepButton: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
    width: '100%', padding: 'var(--spacing-2) var(--spacing-2)',
    border: 'none', borderRadius: 'var(--radius-control, 8px)',
    background: 'transparent', cursor: 'pointer', textAlign: 'start',
    font: 'inherit', color: 'inherit',
  },
  stepButtonOpen: {backgroundColor: 'var(--color-background-muted)'},
  stepDone: {color: BRAND_ACCENT, display: 'inline-flex', flexShrink: 0},
  stepPending: {
    width: 18, height: 18, flexShrink: 0, borderRadius: '50%',
    border: '2px dashed var(--color-border-strong, var(--color-border))',
  },
  // Body indent registers with the 18px glyph + 12px gap above.
  stepBody: {padding: '0 var(--spacing-2) var(--spacing-3)', marginInlineStart: 30},

  // Fulfillment queue -----------------------------------------------------------
  queueRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)',
    flexWrap: 'wrap', padding: 'var(--spacing-3) 0',
  },
  orderId: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
  },
  numeric: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},

  // Inventory alerts ------------------------------------------------------------
  alertGlyph: {
    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor:
      'light-dark(rgba(235, 110, 0, 0.12), rgba(255, 147, 48, 0.16))',
    color: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },
  stockMeterTrack: {
    width: 96, height: 6, borderRadius: 999, overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  stockMeterFill: {
    height: '100%', borderRadius: 999,
    backgroundColor:
      'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  },

  // Top products ----------------------------------------------------------------
  productThumb: {width: 32, height: 32, borderRadius: 8, flexShrink: 0},
  shareTrack: {
    width: 64, height: 6, borderRadius: 999, overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)', flexShrink: 0,
  },
  shareFill: {height: '100%', borderRadius: 999, backgroundColor: BRAND_ACCENT},
  // Footgun 4: Table ships its own scroll wrapper (with bleed margins) that
  // already scrolls horizontally on narrow viewports — do NOT wrap it in an
  // extra overflow container or the bleed margins get clipped top/bottom.

  // Shared card furniture ---------------------------------------------------------
  cardTitleIcon: {display: 'inline-flex', flexShrink: 0, color: 'var(--color-text-secondary)'},
  guideSparkles: {display: 'inline-flex', flexShrink: 0, color: BRAND_ACCENT},
};

// ---------------------------------------------------------------------------
// FIXTURES — Thu Jul 2, 2026, frozen at 2:30 PM. Every number that appears
// twice reconciles:
//   sessions 1,142 × conversion 2.45% ≈ orders 28 (28 / 1,142 = 2.4518%);
//   orders 28 = fulfilled 23 + queue 5 (both derived from queue state);
//   hourly sales sum = $3,847.50 = top-5 net $2,911.75 + all-other $935.75;
//   Juniper candle 31 units and Beeswax tapers 25 units appear identically
//   in the top-products table and the inventory alerts.
// ---------------------------------------------------------------------------

const STORE_NAME = 'Fernway Goods';
const TODAY_LABEL = 'Thursday, July 2, 2026';
const AS_OF_LABEL = 'as of 2:30 PM';

const ORDERS_TODAY = 28;
const SESSIONS_TODAY = 1142;
const SALES_TODAY = 3847.5;

const LIVE = {
  visitorsNow: 18,
  activeCarts: 9,
  checkingOut: 3,
  windowLabel: '2:00 – 2:30 PM',
};

/** Sessions per minute, 2:00 → 2:30 PM. 30 deterministic samples. */
const SESSIONS_30MIN: readonly number[] = [
  4, 5, 3, 6, 5, 7, 6, 4, 5, 8, 7, 6, 9, 7, 5, 6, 8, 7, 9, 8, 6, 7, 5, 6, 8,
  9, 7, 8, 6, 7,
];

/** Hourly net sales 8 AM → 2 PM; sums to exactly $3,847.50. */
const HOURLY_SALES: readonly number[] = [
  312.25, 448.0, 561.5, 702.75, 584.25, 649.0, 589.75,
];

const PAYOUT = {
  amount: 1824.6,
  dateLabel: 'Tue, Jul 7',
  schedule: 'Carthill Payments · paid out every Tuesday and Friday',
};

// Setup guide ---------------------------------------------------------------

type SetupStep = {
  id: string;
  title: string;
  description: string;
  cta: string;
  isDone: boolean;
};

function makeStep(
  id: string,
  title: string,
  description: string,
  cta: string,
  isDone: boolean,
): SetupStep {
  return {id, title, description, cta, isDone};
}

const SETUP_STEPS: readonly SetupStep[] = [
  makeStep('product', 'Add your first product', 'Fernway Goods has 42 active products. The most recent, Walnut Serving Board, was added Jun 28.', 'Add another product', true),
  makeStep('theme', 'Customize your online store', 'The Brightside theme is published with your logo, brand colors, and a featured-collection homepage.', 'Open theme editor', true),
  makeStep('payments', 'Set up Carthill Payments', 'Payments are live. Cards, wallets, and bank transfers settle to First Meridian Bank ••4821.', 'View payment settings', true),
  makeStep('domain', 'Connect a custom domain', 'fernwaygoods.com is registered but still pointing at your old host. Connect it so customers stop seeing fernway-goods.carthill.shop.', 'Connect domain', false),
  makeStep('test-order', 'Place a test order', 'Run one order through checkout, fulfillment, and refund with Carthill test mode so you know the whole flow works before your weekend promo.', 'Create test order', false),
];

// Fulfillment queue -----------------------------------------------------------

/** pick → pack → ready (label needed) → labeled (mark fulfilled removes). */
type FulfillStage = 'pick' | 'pack' | 'ready' | 'labeled';

type QueueOrder = {
  id: string;
  customer: string;
  itemCount: number;
  itemSummary: string;
  total: number;
  destination: string;
  method: 'Standard' | 'Express';
  placedLabel: string;
  stage: FulfillStage;
};

function makeOrder(
  id: string,
  customer: string,
  itemCount: number,
  itemSummary: string,
  total: number,
  destination: string,
  method: 'Standard' | 'Express',
  placedLabel: string,
  stage: FulfillStage,
): QueueOrder {
  return {id, customer, itemCount, itemSummary, total, destination, method, placedLabel, stage};
}

const QUEUE_ORDERS: readonly QueueOrder[] = [
  makeOrder('#2483', 'Maya Okafor', 3, 'Juniper & Sea Salt Candle ×2, Beeswax Taper Pair', 96.5, 'Portland, OR', 'Express', '1:54 PM', 'pick'),
  makeOrder('#2482', 'Daniel Reyes', 1, 'Juniper & Sea Salt Candle', 28.0, 'Boise, ID', 'Standard', '1:31 PM', 'pick'),
  makeOrder('#2481', 'Priya Raman', 2, 'Linen Apron · Rust, Beeswax Taper Pair', 77.75, 'Seattle, WA', 'Standard', '12:48 PM', 'pack'),
  makeOrder('#2480', 'Cole Bennett', 4, 'Stoneware Pour-Over Set, Beeswax Taper Pair ×3', 151.25, 'Denver, CO', 'Standard', '12:07 PM', 'pack'),
  makeOrder('#2479', 'Hannah Liu', 2, 'Walnut Serving Board, Stoneware Pour-Over Set', 122.0, 'San Jose, CA', 'Express', '11:42 AM', 'ready'),
];

const STAGE_META: Record<
  FulfillStage,
  {label: string; variant: BadgeVariant; action: string | null}
> = {
  pick: {label: 'To pick', variant: 'neutral', action: 'Mark picked'},
  pack: {label: 'To pack', variant: 'warning', action: 'Mark packed'},
  ready: {label: 'Label needed', variant: 'info', action: null},
  labeled: {label: 'Label printed', variant: 'success', action: null},
};

// Inventory alerts ------------------------------------------------------------

type StockAlert = {
  sku: string;
  name: string;
  onHand: number;
  reorderPoint: number;
  soldToday: number;
  reorderQty: number;
  supplier: string;
  poNumber: string;
};

const STOCK_ALERTS: readonly StockAlert[] = [
  {sku: 'CNDL-JSS-08', name: 'Juniper & Sea Salt Candle · 8 oz', onHand: 4, reorderPoint: 12, soldToday: 31, reorderQty: 48, supplier: 'Alder & Wick Supply Co.', poNumber: 'PO-1187'},
  {sku: 'CNDL-BWT-PR', name: 'Beeswax Taper Pair', onHand: 6, reorderPoint: 20, soldToday: 25, reorderQty: 60, supplier: 'Alder & Wick Supply Co.', poNumber: 'PO-1188'},
];

// Top products ----------------------------------------------------------------
// units × price = net, exactly; top-5 net sums to $2,911.75 and the
// all-other line of $935.75 closes the day at $3,847.50.

type TopProduct = {
  id: string;
  name: string;
  variantLabel: string;
  units: number;
  price: number;
  net: number;
  sharePct: number;
  gradient: [string, string];
};

const CAT_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const CAT_PURPLE =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const CAT_GREEN =
  'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const CAT_ORANGE =
  'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CAT_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

function makeProduct(
  id: string,
  name: string,
  variantLabel: string,
  units: number,
  price: number,
  net: number,
  sharePct: number,
  gradient: [string, string],
): TopProduct {
  return {id, name, variantLabel, units, price, net, sharePct, gradient};
}

const TOP_PRODUCTS: readonly TopProduct[] = [
  makeProduct('juniper-candle', 'Juniper & Sea Salt Candle', '8 oz · CNDL-JSS-08', 31, 28.0, 868.0, 22.6, [CAT_GREEN, CAT_TEAL]),
  makeProduct('pour-over', 'Stoneware Pour-Over Set', 'Matte cream · KTCH-POV-01', 9, 64.0, 576.0, 15.0, [CAT_BLUE, CAT_PURPLE]),
  makeProduct('linen-apron', 'Linen Apron', 'Rust · TXTL-APR-RS', 12, 42.5, 510.0, 13.3, [CAT_ORANGE, CAT_PURPLE]),
  makeProduct('beeswax-tapers', 'Beeswax Taper Pair', '12 in · CNDL-BWT-PR', 25, 19.75, 493.75, 12.8, [CAT_TEAL, CAT_BLUE]),
  makeProduct('walnut-board', 'Walnut Serving Board', 'Large · KTCH-WSB-LG', 8, 58.0, 464.0, 12.1, [CAT_PURPLE, CAT_ORANGE]),
];

const OTHER_PRODUCTS_NET = 935.75;
const OTHER_PRODUCTS_SHARE = 24.3;

// ---------------------------------------------------------------------------
// FORMATTERS
// ---------------------------------------------------------------------------

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatUsd(value: number): string {
  return USD.format(value);
}

function formatInt(value: number): string {
  return value.toLocaleString('en-US');
}

// ---------------------------------------------------------------------------
// SPARKLINE — hand-rolled polyline + soft area fill; no chart engine.
// ---------------------------------------------------------------------------

function Sparkline({
  data,
  width,
  height,
  ariaLabel,
}: {
  data: readonly number[];
  width: number;
  height: number;
  ariaLabel: string;
}) {
  const pad = 3;
  const lo = Math.min(...data);
  const hi = Math.max(...data);
  const span = hi - lo || 1;
  const x = (i: number) => pad + (i * (width - 2 * pad)) / (data.length - 1);
  const y = (v: number) => height - pad - ((v - lo) / span) * (height - 2 * pad);
  const points = data
    .map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(' ');
  const area = `${pad},${height - pad} ${points} ${(width - pad).toFixed(1)},${
    height - pad
  }`;
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={styles.sparkBox}
      role="img"
      aria-label={ariaLabel}>
      <polygon points={area} fill={BRAND_ACCENT_SOFT} stroke="none" />
      <polyline
        points={points}
        fill="none"
        stroke={BRAND_ACCENT}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={x(data.length - 1)}
        cy={y(data[data.length - 1])}
        r={2.5}
        fill={BRAND_ACCENT}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// LIVE-VIEW STRIP
// ---------------------------------------------------------------------------

function LiveViewStrip({isStacked}: {isStacked: boolean}) {
  return (
    <Card>
      <HStack gap={5} vAlign="center" wrap={isStacked ? 'wrap' : 'nowrap'}>
        <HStack gap={3} vAlign="center">
          <span className="carthill-pulse" style={styles.liveDot} aria-hidden />
          <VStack gap={0}>
            <span style={styles.liveNumber}>{LIVE.visitorsNow}</span>
            <Text type="supporting" color="secondary">
              visitors right now
            </Text>
          </VStack>
        </HStack>
        {isStacked ? null : (
          <div style={styles.liveDivider}>
            <Divider orientation="vertical" />
          </div>
        )}
        <VStack gap={1}>
          <Text type="label" size="sm" color="secondary">
            Sessions · last 30 min ({LIVE.windowLabel})
          </Text>
          <Sparkline
            data={SESSIONS_30MIN}
            width={220}
            height={44}
            ariaLabel={`Sessions per minute from ${LIVE.windowLabel}, ranging ${Math.min(
              ...SESSIONS_30MIN,
            )} to ${Math.max(...SESSIONS_30MIN)}`}
          />
        </VStack>
        <StackItem size="fill">
          <HStack gap={5} vAlign="center" wrap="wrap">
            <VStack gap={0} style={styles.liveMetric}>
              <Text type="body" weight="bold" hasTabularNumbers>
                {LIVE.activeCarts}
              </Text>
              <Text type="supporting" color="secondary">
                active carts
              </Text>
            </VStack>
            <VStack gap={0} style={styles.liveMetric}>
              <Text type="body" weight="bold" hasTabularNumbers>
                {LIVE.checkingOut}
              </Text>
              <Text type="supporting" color="secondary">
                checking out
              </Text>
            </VStack>
          </HStack>
        </StackItem>
        <Button
          label="Live View"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RadioIcon} size="sm" />}
        />
      </HStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TODAY — stat row + payout chip. Conversion reconciles: 28 / 1,142 = 2.45%.
// ---------------------------------------------------------------------------

function TodaySection() {
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>Today</Heading>
            <Text type="supporting" color="secondary">
              {TODAY_LABEL} · {AS_OF_LABEL}
            </Text>
          </VStack>
        </StackItem>
        <Tooltip content={PAYOUT.schedule}>
          <span style={styles.payoutChip}>
            <Icon icon={LandmarkIcon} size="sm" color="inherit" />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Next payout {formatUsd(PAYOUT.amount)} · {PAYOUT.dateLabel}
            </Text>
          </span>
        </Tooltip>
      </HStack>
      <Grid columns={{minWidth: 240, repeat: 'fit'}} gap={4}>
        <Card>
          <Stat
            label="Total sales"
            value={formatUsd(SALES_TODAY)}
            delta={{value: '↑ 12.4%', direction: 'up', sentiment: 'positive'}}
            description="vs yesterday"
            media={
              <Sparkline
                data={HOURLY_SALES}
                width={200}
                height={36}
                ariaLabel="Hourly net sales from 8 AM to 2 PM, totaling $3,847.50"
              />
            }
          />
        </Card>
        <Card>
          <Stat
            label="Orders"
            value={formatInt(ORDERS_TODAY)}
            delta={{value: '↑ 2 orders', direction: 'up', sentiment: 'positive'}}
            description="vs yesterday (26)"
          />
        </Card>
        <Card>
          <Stat
            label="Conversion rate"
            value="2.45%"
            delta={{
              value: '↓ 0.21 pt',
              direction: 'down',
              sentiment: 'negative',
            }}
            description={`vs yesterday · ${formatInt(SESSIONS_TODAY)} sessions`}
          />
        </Card>
      </Grid>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// SETUP GUIDE — dismissible checklist; count and progress derive from state.
// ---------------------------------------------------------------------------

function SetupGuideCard({
  steps,
  openStepId,
  onToggleStep,
  onMarkDone,
  onStepCta,
  onDismiss,
}: {
  steps: readonly SetupStep[];
  openStepId: string | null;
  onToggleStep: (id: string) => void;
  onMarkDone: (id: string) => void;
  onStepCta: (step: SetupStep) => void;
  onDismiss: () => void;
}) {
  const doneCount = steps.filter(step => step.isDone).length;
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <span style={styles.guideSparkles}>
            <Icon icon={SparklesIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <Heading level={3}>Setup guide</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {doneCount} of {steps.length} tasks complete
          </Text>
          <ProgressBar
            label="Setup guide progress"
            isLabelHidden
            value={doneCount}
            max={steps.length}
            variant="accent"
            style={styles.guideProgressBar}
          />
          <IconButton
            label="Dismiss setup guide"
            tooltip="Dismiss"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onDismiss}
          />
        </HStack>
        <Divider />
        <VStack gap={0}>
          {steps.map(step => {
            const isOpen = openStepId === step.id;
            return (
              <div key={step.id}>
                <button
                  type="button"
                  style={
                    isOpen
                      ? {...styles.stepButton, ...styles.stepButtonOpen}
                      : styles.stepButton
                  }
                  aria-expanded={isOpen}
                  onClick={() => onToggleStep(step.id)}>
                  {step.isDone ? (
                    <span style={styles.stepDone}>
                      <Icon icon={CircleCheckIcon} size="sm" color="inherit" />
                    </span>
                  ) : (
                    <span style={styles.stepPending} aria-hidden />
                  )}
                  <span style={{flex: 1, minWidth: 0}}>
                    <Text
                      type="body"
                      color={step.isDone ? 'secondary' : 'primary'}>
                      {step.title}
                    </Text>
                  </span>
                  <Icon
                    icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
                    size="sm"
                    color="secondary"
                  />
                </button>
                {isOpen ? (
                  <div style={styles.stepBody}>
                    <VStack gap={2}>
                      <Text type="supporting" color="secondary">
                        {step.description}
                      </Text>
                      <HStack gap={2} vAlign="center" wrap="wrap">
                        <span style={brandCtaScope}>
                          <Button
                            label={step.cta}
                            variant="primary"
                            size="sm"
                            onClick={() => onStepCta(step)}
                          />
                        </span>
                        {step.isDone ? null : (
                          <Button
                            label="Mark as done"
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkDone(step.id)}
                          />
                        )}
                      </HStack>
                    </VStack>
                  </div>
                ) : null}
              </div>
            );
          })}
        </VStack>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// FULFILLMENT QUEUE — working pick → pack → label → fulfilled row machine.
// Header badge count = row count; footer reconciles to ORDERS_TODAY.
// ---------------------------------------------------------------------------

function QueueOrderRow({
  order,
  onAdvance,
  onPrintLabel,
  onFulfill,
  onPrintSlip,
}: {
  order: QueueOrder;
  onAdvance: (id: string) => void;
  onPrintLabel: (order: QueueOrder) => void;
  onFulfill: (order: QueueOrder) => void;
  onPrintSlip: (order: QueueOrder) => void;
}) {
  const meta = STAGE_META[order.stage];
  return (
    <div style={styles.queueRow}>
      <VStack gap={0} style={{minWidth: 220, flex: '1 1 260px'}}>
        <HStack gap={2} vAlign="center">
          <Text type="body" weight="semibold">
            <span style={styles.orderId}>{order.id}</span> · {order.customer}
          </Text>
          {order.method === 'Express' ? (
            <Token label="Express" size="sm" color="orange" />
          ) : null}
        </HStack>
        <Text type="supporting" color="secondary" maxLines={1}>
          {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} ·{' '}
          {order.itemSummary}
        </Text>
        <Text type="supporting" color="secondary">
          {order.destination} · placed {order.placedLabel}
        </Text>
      </VStack>
      <span style={styles.numeric}>
        <Text type="body" hasTabularNumbers>
          {formatUsd(order.total)}
        </Text>
      </span>
      <Badge label={meta.label} variant={meta.variant} />
      <HStack gap={2} vAlign="center">
        <IconButton
          label={`Print packing slip for order ${order.id}`}
          tooltip="Print packing slip"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PrinterIcon} size="sm" />}
          onClick={() => onPrintSlip(order)}
        />
        {meta.action !== null ? (
          <Button
            label={meta.action}
            variant="secondary"
            size="sm"
            onClick={() => onAdvance(order.id)}
          />
        ) : order.stage === 'ready' ? (
          <span style={brandCtaScope}>
            <Button
              label="Print label"
              variant="primary"
              size="sm"
              icon={<Icon icon={PrinterIcon} size="sm" />}
              onClick={() => onPrintLabel(order)}
            />
          </span>
        ) : (
          <Button
            label="Mark fulfilled"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PackageCheckIcon} size="sm" />}
            onClick={() => onFulfill(order)}
          />
        )}
      </HStack>
    </div>
  );
}

function FulfillmentQueueCard({
  queue,
  onAdvance,
  onPrintLabel,
  onFulfill,
  onPrintSlip,
}: {
  queue: readonly QueueOrder[];
  onAdvance: (id: string) => void;
  onPrintLabel: (order: QueueOrder) => void;
  onFulfill: (order: QueueOrder) => void;
  onPrintSlip: (order: QueueOrder) => void;
}) {
  const fulfilledToday = ORDERS_TODAY - queue.length;
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.cardTitleIcon}>
            <Icon icon={PackageIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Heading level={3}>Orders to fulfill</Heading>
              <Badge label={String(queue.length)} variant="neutral" />
            </HStack>
          </StackItem>
          <Button
            label="All orders"
            variant="ghost"
            size="sm"
            endContent={<Icon icon={ArrowRightIcon} size="sm" />}
          />
        </HStack>
        {queue.length === 0 ? (
          <EmptyState
            title="All caught up"
            description={`All ${ORDERS_TODAY} of today's orders are fulfilled. New orders land here automatically.`}
            icon={<Icon icon={PackageCheckIcon} size="lg" color="secondary" />}
            headingLevel={4}
          />
        ) : (
          <VStack gap={0}>
            {queue.map((order, index) => (
              <div key={order.id}>
                {index > 0 ? <Divider /> : null}
                <QueueOrderRow
                  order={order}
                  onAdvance={onAdvance}
                  onPrintLabel={onPrintLabel}
                  onFulfill={onFulfill}
                  onPrintSlip={onPrintSlip}
                />
              </div>
            ))}
          </VStack>
        )}
        <Divider />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {fulfilledToday} of {ORDERS_TODAY} orders fulfilled today ·{' '}
          {queue.length} remaining
        </Text>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// INVENTORY ALERTS — two low-stock rows with a reorder CTA. The units sold
// match the top-products table exactly (31 candles, 25 taper pairs).
// ---------------------------------------------------------------------------

function StockAlertRow({
  alert,
  isReordered,
  onReorder,
}: {
  alert: StockAlert;
  isReordered: boolean;
  onReorder: (alert: StockAlert) => void;
}) {
  const meterPct = Math.round((alert.onHand / alert.reorderPoint) * 100);
  return (
    <div style={styles.queueRow}>
      <span style={styles.alertGlyph}>
        <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
      </span>
      <VStack gap={0} style={{minWidth: 200, flex: '1 1 240px'}}>
        <Text type="body" weight="semibold">
          {alert.name}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {alert.sku} · {alert.soldToday} sold today
        </Text>
      </VStack>
      <VStack gap={1}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {alert.onHand} left · reorder point {alert.reorderPoint}
        </Text>
        <div
          style={styles.stockMeterTrack}
          role="meter"
          aria-valuenow={alert.onHand}
          aria-valuemin={0}
          aria-valuemax={alert.reorderPoint}
          aria-label={`${alert.name}: ${alert.onHand} on hand of ${alert.reorderPoint} reorder point`}>
          <div style={{...styles.stockMeterFill, width: `${meterPct}%`}} />
        </div>
      </VStack>
      {isReordered ? (
        <Token
          label={`${alert.poNumber} placed · ${alert.reorderQty} units`}
          size="sm"
          color="green"
        />
      ) : (
        <span style={brandCtaScope}>
          <Button
            label={`Reorder ${alert.reorderQty}`}
            variant="primary"
            size="sm"
            onClick={() => onReorder(alert)}
          />
        </span>
      )}
    </div>
  );
}

function InventoryAlertsCard({
  reordered,
  onReorder,
}: {
  reordered: Readonly<Record<string, boolean>>;
  onReorder: (alert: StockAlert) => void;
}) {
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.cardTitleIcon}>
            <Icon icon={TagIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <HStack gap={2} vAlign="center">
              <Heading level={3}>Inventory alerts</Heading>
              <Badge label={String(STOCK_ALERTS.length)} variant="warning" />
            </HStack>
          </StackItem>
        </HStack>
        <VStack gap={0}>
          {STOCK_ALERTS.map((alert, index) => (
            <div key={alert.sku}>
              {index > 0 ? <Divider /> : null}
              <StockAlertRow
                alert={alert}
                isReordered={reordered[alert.sku] === true}
                onReorder={onReorder}
              />
            </div>
          ))}
        </VStack>
        <Divider />
        <Text type="supporting" color="secondary">
          Both restocks ship from {STOCK_ALERTS[0].supplier} in 3–5 business
          days.
        </Text>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// TOP PRODUCTS — mini table. Net = units × price per row; top-5 + all-other
// closes to the $3,847.50 header stat.
// ---------------------------------------------------------------------------

/** Right-aligned tabular numeral cell (footgun 10). */
function numericCell(text: string, isEmphasis = false) {
  return (
    <span style={styles.numeric}>
      <Text
        type="body"
        weight={isEmphasis ? 'semibold' : undefined}
        hasTabularNumbers>
        {text}
      </Text>
    </span>
  );
}

// Footgun 4: fixed-width columns use pixel() so headers carry both width and
// minWidth. Numeric columns right-align with tabular numerals (footgun 10).
const topProductColumns: TableColumn<TopProduct>[] = [
  {
    key: 'product',
    header: 'Product',
    width: proportional(3),
    renderCell: (item: TopProduct) => (
      <HStack gap={2} vAlign="center">
        <span
          style={{
            ...styles.productThumb,
            background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
          }}
          aria-hidden
        />
        <VStack gap={0} style={{minWidth: 0}}>
          <Text type="body" maxLines={1}>
            {item.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.variantLabel}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'units',
    header: 'Units',
    width: pixel(72),
    align: 'end',
    renderCell: (item: TopProduct) => numericCell(String(item.units)),
  },
  {
    key: 'price',
    header: 'Price',
    width: pixel(88),
    align: 'end',
    renderCell: (item: TopProduct) => numericCell(formatUsd(item.price)),
  },
  {
    key: 'net',
    header: 'Net sales',
    width: pixel(104),
    align: 'end',
    renderCell: (item: TopProduct) => numericCell(formatUsd(item.net), true),
  },
  {
    key: 'share',
    header: '% of today',
    width: pixel(140),
    renderCell: (item: TopProduct) => (
      <HStack gap={2} vAlign="center">
        <div style={styles.shareTrack} aria-hidden>
          <div
            style={{
              ...styles.shareFill,
              // Scaled to the largest share (22.6%) so the top bar is full.
              width: `${Math.round((item.sharePct / 22.6) * 100)}%`,
            }}
          />
        </div>
        <span style={styles.numeric}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {item.sharePct.toFixed(1)}%
          </Text>
        </span>
      </HStack>
    ),
  },
];

function TopProductsCard() {
  return (
    <Card>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <span style={styles.cardTitleIcon}>
            <Icon icon={ChartColumnIcon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <Heading level={3}>Top products today</Heading>
          </StackItem>
          <Button
            label="View report"
            variant="ghost"
            size="sm"
            endContent={<Icon icon={ExternalLinkIcon} size="sm" />}
          />
        </HStack>
        <Table<TopProduct>
          data={[...TOP_PRODUCTS]}
          columns={topProductColumns}
          idKey="id"
          density="compact"
          dividers="rows"
          hasHover
        />
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              All other products {formatUsd(OTHER_PRODUCTS_NET)} ·{' '}
              {OTHER_PRODUCTS_SHARE.toFixed(1)}%
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Total {formatUsd(SALES_TODAY)}
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// NAV RAIL — Home selected; Orders carries the live unfulfilled count.
// ---------------------------------------------------------------------------

function navItem(
  id: string,
  label: string,
  icon: typeof HomeIcon,
  extra?: Partial<TreeListItemData>,
): TreeListItemData {
  return {
    id,
    label,
    startContent: <Icon icon={icon} size="sm" color="secondary" />,
    ...extra,
  };
}

function NavRail({unfulfilledCount}: {unfulfilledCount: number}) {
  const items: TreeListItemData[] = [
    navItem('home', 'Home', HomeIcon, {isSelected: true}),
    navItem('orders', 'Orders', PackageIcon, {
      endContent:
        unfulfilledCount > 0 ? (
          <span style={styles.navCount}>{unfulfilledCount}</span>
        ) : undefined,
    }),
    navItem('products', 'Products', TagIcon),
    navItem('customers', 'Customers', UsersIcon),
    navItem('analytics', 'Analytics', ChartColumnIcon),
    navItem('marketing', 'Marketing', MegaphoneIcon),
    navItem('discounts', 'Discounts', PercentIcon),
    {
      id: 'channels',
      label: 'Sales channels',
      isExpanded: true,
      children: [
        navItem('online-store', 'Online Store', GlobeIcon),
        navItem('pos', 'Point of Sale', StoreIcon),
      ],
    },
    navItem('settings', 'Settings', SettingsIcon),
  ];

  return (
    <div style={styles.railFill}>
      <div style={styles.railScroll}>
        <TreeList
          density="compact"
          items={items}
          header={
            <Text type="label" size="sm" color="secondary">
              {STORE_NAME}
            </Text>
          }
        />
      </div>
      <Divider />
      <VStack gap={1} style={styles.railFooter}>
        <Text type="label" size="sm">
          Carthill Grow
        </Text>
        <Text type="supporting" color="secondary">
          Renews Aug 1 · 2 staff seats
        </Text>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HEADER BAR
// ---------------------------------------------------------------------------

function HeaderBar({
  query,
  onQueryChange,
  isChipCollapsed,
}: {
  query: string;
  onQueryChange: (next: string) => void;
  isChipCollapsed: boolean;
}) {
  return (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <HStack gap={2} vAlign="center">
        <span style={styles.brandMark}>
          <Icon icon={ShoppingBagIcon} size="sm" color="inherit" />
        </span>
        <Text type="body" style={styles.wordmark}>
          carthill
        </Text>
      </HStack>
      <div style={styles.searchWrap}>
        <TextInput
          label="Search Carthill admin"
          isLabelHidden
          size="sm"
          width="100%"
          style={{maxWidth: 480}}
          placeholder="Search orders, products, and customers…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={onQueryChange}
        />
      </div>
      <HStack gap={2} vAlign="center">
        <IconButton
          label="Notifications"
          tooltip="Notifications"
          variant="ghost"
          size="sm"
          icon={<Icon icon={BellIcon} size="sm" />}
        />
        <span style={styles.storeChip}>
          <Avatar name={STORE_NAME} size="xsmall" />
          {isChipCollapsed ? null : (
            <Text type="label" size="sm">
              {STORE_NAME}
            </Text>
          )}
        </span>
      </HStack>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function StorefrontAdminHomeTemplate() {
  const toast = useToast();

  // Header search (visual affordance; the home column is the demo surface).
  const [query, setQuery] = useState('');

  // Setup guide.
  const [steps, setSteps] = useState<readonly SetupStep[]>(SETUP_STEPS);
  const [openStepId, setOpenStepId] = useState<string | null>('domain');
  const [isGuideDismissed, setIsGuideDismissed] = useState(false);

  // Fulfillment queue.
  const [queue, setQueue] = useState<readonly QueueOrder[]>(QUEUE_ORDERS);

  // Inventory reorders.
  const [reordered, setReordered] = useState<Readonly<Record<string, boolean>>>(
    {},
  );

  // Responsive contract (see header doc block).
  const isRailHidden = useMediaQuery('(max-width: 960px)');
  const isCompact = useMediaQuery('(max-width: 720px)');

  const setupDoneCount = useMemo(
    () => steps.filter(step => step.isDone).length,
    [steps],
  );

  const handleToggleStep = (id: string) => {
    setOpenStepId(current => (current === id ? null : id));
  };

  const handleMarkDone = (id: string) => {
    setSteps(current =>
      current.map(step => (step.id === id ? {...step, isDone: true} : step)),
    );
    setOpenStepId(null);
    const step = steps.find(item => item.id === id);
    toast({
      body: `“${step?.title ?? 'Task'}” marked as done — ${Math.min(
        setupDoneCount + 1,
        steps.length,
      )} of ${steps.length} complete.`,
    });
  };

  const handleStepCta = (step: SetupStep) => {
    toast({body: `${step.cta} opens in the full Carthill admin.`});
  };

  const handleDismissGuide = () => {
    setIsGuideDismissed(true);
    let dismissToast: (() => void) | undefined;
    dismissToast = toast({
      body: 'Setup guide dismissed. Finish setup anytime from Settings.',
      endContent: (
        <Button
          label="Undo"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsGuideDismissed(false);
            dismissToast?.();
          }}
        />
      ),
    });
  };

  const handleAdvance = (id: string) => {
    setQueue(current =>
      current.map(order => {
        if (order.id !== id) {
          return order;
        }
        const next: FulfillStage = order.stage === 'pick' ? 'pack' : 'ready';
        return {...order, stage: next};
      }),
    );
  };

  const handlePrintLabel = (order: QueueOrder) => {
    setQueue(current =>
      current.map(item =>
        item.id === order.id ? {...item, stage: 'labeled' as const} : item,
      ),
    );
    toast({
      body: `Shipping label for ${order.id} sent to the printer · ${
        order.method
      } to ${order.destination}.`,
    });
  };

  const handleFulfill = (order: QueueOrder) => {
    const nextCount = queue.length - 1;
    setQueue(current => current.filter(item => item.id !== order.id));
    toast({
      body: `${order.id} fulfilled — ${ORDERS_TODAY - nextCount} of ${ORDERS_TODAY} orders done today.`,
    });
  };

  const handlePrintSlip = (order: QueueOrder) => {
    toast({body: `Packing slip for ${order.id} sent to the printer.`});
  };

  const handleReorder = (alert: StockAlert) => {
    setReordered(current => ({...current, [alert.sku]: true}));
    toast({
      body: `${alert.poNumber} for ${alert.reorderQty} × ${alert.name} sent to ${alert.supplier}.`,
    });
  };

  const homeColumn = (
    <div style={styles.column}>
      <VStack gap={0}>
        <Heading level={1}>Good afternoon, Rowan</Heading>
        <Text type="supporting" color="secondary">
          Here’s what’s happening at {STORE_NAME} today.
        </Text>
      </VStack>

      <LiveViewStrip isStacked={isCompact} />

      <TodaySection />

      {isGuideDismissed ? null : (
        <SetupGuideCard
          steps={steps}
          openStepId={openStepId}
          onToggleStep={handleToggleStep}
          onMarkDone={handleMarkDone}
          onStepCta={handleStepCta}
          onDismiss={handleDismissGuide}
        />
      )}

      <FulfillmentQueueCard
        queue={queue}
        onAdvance={handleAdvance}
        onPrintLabel={handlePrintLabel}
        onFulfill={handleFulfill}
        onPrintSlip={handlePrintSlip}
      />

      <InventoryAlertsCard reordered={reordered} onReorder={handleReorder} />

      <TopProductsCard />

      <Text type="supporting" color="secondary">
        Data is frozen at 2:30 PM for this demo — payouts, sessions, and
        conversion update continuously in the full Carthill admin.
      </Text>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{KEYFRAME_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HeaderBar
              query={query}
              onQueryChange={setQuery}
              isChipCollapsed={isCompact}
            />
          </LayoutHeader>
        }
        start={
          isRailHidden ? undefined : (
            <LayoutPanel width={244} padding={0} hasDivider label="Admin navigation">
              <NavRail unfulfilledCount={queue.length} />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>{homeColumn}</div>
          </LayoutContent>
        }
      />
    </div>
  );
}
