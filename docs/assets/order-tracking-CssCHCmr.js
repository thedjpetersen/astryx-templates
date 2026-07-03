var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one shipment — order TS-482915 from
 *   'Trailhead Supply', placed 2026-06-27, carrier 'Meridian Express',
 *   tracking MX-4821-9937-5502: five fulfillment stages with 'Out for
 *   delivery' current, a four-stop schematic route Portland → Salt Lake City
 *   → Dallas → Austin, ten carrier scan events with fixed ISO timestamps
 *   between 2026-06-27T09:34:00Z and 2026-07-01T08:12:00Z, three line items
 *   with gradient placeholder art, and a fixed delivery address)
 * @output Post-purchase order tracking page: a header with the order number,
 *   an 'Out for delivery' Badge, placed-date note, and copy-tracking /
 *   carrier-site actions; a main column stacking a five-stage progress
 *   stepper (placed → packed → shipped → out for delivery → delivered, the
 *   current stage pulsing, an 'Arriving today by 8:00 PM' ETA line), a
 *   schematic route strip (origin warehouse, two hubs, destination home as
 *   styled nodes on a progress rail with a truck marker riding the active
 *   leg — no real map), a shipment-facts MetadataList, and a carrier event
 *   timeline (rail markers, Timestamps, locations) that collapses older
 *   scans behind a 'Show 6 earlier events' toggle; a 340px end panel with
 *   the line-item list (return-mode CheckboxInputs), order totals, delivery
 *   address, and support actions — 'Report an issue' opens a Dialog
 *   (RadioList reason + TextArea details) and 'Return items' runs an
 *   item-selection flow, both confirming with success Banners
 * @position Page template; emitted by \`astryx template order-tracking\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the order chrome
 * (PackageIcon + order number Heading + status Badge + placed note, copy
 * tracking + carrier-site Buttons). LayoutContent hosts the centered
 * (max 840px) tracking column; LayoutPanel end 340 hosts the scrolling
 * items/address/support rail. Choose over deployment-detail when the
 * "thing in flight" is a PHYSICAL PARCEL — stages, hubs, scans — not a
 * build; choose over timeline when the feed is subordinate to a status
 * stepper and route schematic rather than the whole page.
 *
 * Responsive contract:
 * - >768px: header | tracking column (fill, scrolls internally) | end panel
 *   340 (fixed width, scrolls internally). Only those two regions scroll.
 * - <=768px: the end panel leaves the right edge and stacks below the
 *   tracking column as full-width sections; the column flows at natural
 *   height and LayoutContent scrolls it as one page.
 * - <=640px: the progress stepper flips from a horizontal node row to a
 *   vertical rail (five labeled rows fit a 375px viewport without
 *   squeezing); the header wraps its action row under the title and every
 *   primary control (copy tracking, show-earlier, report issue, return
 *   flow) raises to a >=40px min-height tap target; the route strip pans
 *   horizontally inside an overflow-x scroller (560px min width) so the
 *   four nodes and leg labels keep their alignment instead of wrapping;
 *   event Timestamps wrap under the event title instead of pinning right.
 * - Nothing is hover-only: copy/toggle/marker affordances are real Buttons
 *   and labeled controls; Timestamp tooltips only supplement visible text.
 *
 * Container policy (post-purchase tracker archetype): the page chrome is
 * frame-first rows and panels; Cards wrap the stepper, route strip, and
 * shipment facts; carrier events are plain rail rows (timeline idiom); the
 * end panel is sectioned with Dividers, not nested cards; Banners confirm
 * the return and issue-report flows. All fixtures are fixed — no clocks,
 * randomness, or network assets; item thumbnails are gradient placeholders.
 *
 * Color policy: token-pure except the line-item thumbnail art. Every chrome
 * color is a var(--color-*) token (accent fills use --color-on-accent for
 * their glyphs) or an explicit light-dark() pair (the truck-badge shadow).
 * The three item-thumbnail gradients are deliberately scheme-locked
 * (colorScheme: 'light' on itemArt): they stand in for fixed product
 * photography/brand art and must not reflow with the scheme, so both the
 * gradient stops and the white icon sitting on them stay raw literals.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import type {IconType} from '@astryxdesign/core/Icon';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BackpackIcon,
  Building2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CoffeeIcon,
  CopyIcon,
  ExternalLinkIcon,
  HomeIcon,
  LifeBuoyIcon,
  MapPinIcon,
  MessageSquareWarningIcon,
  NavigationIcon,
  PackageIcon,
  ReceiptTextIcon,
  RotateCcwIcon,
  ShirtIcon,
  TruckIcon,
  WarehouseIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by \`@astryxdesign/core/astryx.css\`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  // Centered tracking column; keeps line lengths readable on wide screens.
  column: {
    maxWidth: 840,
    margin: '0 auto',
    width: '100%',
  },
  mono: {
    fontFamily: 'var(--font-family-code)',
  },
  headerRow: {
    width: '100%',
  },
  // Primary controls grow to a >=40px hit box on touch-first widths; Button
  // md/lg heights (32/36px) stay for pointer-first layouts.
  tapTarget: {
    minHeight: 40,
  },

  // ---- progress stepper (horizontal) ----
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  stepCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 'var(--spacing-2)',
    textAlign: 'center',
  },
  // Connector bars sit between node circles, vertically centered on them.
  stepBar: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginTop: 17, // half of the 36px node = circle midline
    minWidth: 12,
  },
  stepBarDone: {
    backgroundColor: 'var(--color-accent)',
  },
  stepBarUpcoming: {
    backgroundColor: 'var(--color-border)',
  },
  stepNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: '50%',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  stepNodeDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  stepNodeActive: {
    border: '2px solid var(--color-accent)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-accent)',
  },
  stepNodeUpcoming: {
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text-secondary)',
  },

  // ---- progress stepper (vertical, <=640px) ----
  stepRowVertical: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  stepGutter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 36,
  },
  stepConnectorVertical: {
    flex: 1,
    width: 3,
    borderRadius: 2,
    marginTop: 'var(--spacing-1)',
    marginBottom: 'var(--spacing-1)',
    minHeight: 16,
  },
  stepBodyVertical: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
  },
  stepBodyVerticalLast: {
    paddingBottom: 0,
  },

  // ---- schematic route strip ----
  // At narrow widths the strip pans horizontally so the four nodes and leg
  // labels keep alignment instead of sliver-wrapping.
  routeScroll: {
    overflowX: 'auto',
  },
  routeScrollInner: {
    minWidth: 560,
  },
  routeRow: {
    display: 'flex',
    alignItems: 'flex-start',
  },
  routeStop: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: 108,
    flexShrink: 0,
    textAlign: 'center',
  },
  routeNode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 12,
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  routeNodeDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  routeNodeUpcoming: {
    border: '2px dashed var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Legs between stops: a rail that carries the truck marker on the active
  // leg. Completed legs are solid accent; the pending remainder is dashed.
  routeLeg: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minWidth: 48,
    paddingTop: 19, // node midline (40px / 2 - rail 2px / 2)
  },
  routeLegRail: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  routeLegLine: {
    height: 3,
    borderRadius: 2,
    flex: 1,
  },
  routeLegLineDone: {
    backgroundColor: 'var(--color-accent)',
  },
  routeLegLinePending: {
    borderTop: '3px dashed var(--color-border)',
    height: 0,
    borderRadius: 0,
  },
  routeTruck: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    flexShrink: 0,
    margin: '0 var(--spacing-1)',
    marginTop: -13, // recenter the badge on the rail line
    boxShadow: '0 1px 3px light-dark(rgba(15, 23, 42, 0.25), rgba(0, 0, 0, 0.55))',
  },

  // ---- carrier event timeline ----
  eventRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
  },
  eventGutter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 28,
  },
  eventMarker: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  eventMarkerCurrent: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  eventConnector: {
    flex: 1,
    width: 2,
    marginTop: 'var(--spacing-1)',
    backgroundColor: 'var(--color-border)',
    borderRadius: 1,
  },
  eventBody: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 'var(--spacing-4)',
  },
  eventBodyLast: {
    paddingBottom: 'var(--spacing-1)',
  },

  // ---- end panel ----
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Gradient placeholder thumbnails stand in for product photography.
  // Scheme-locked (see "Color policy" in the header doc): the gradients are
  // fixed brand/product art, so colorScheme is pinned and the icon stays a
  // literal white that reads on all three gradients in both schemes.
  itemArt: {
    colorScheme: 'light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 8,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  fullWidth: {
    width: '100%',
  },
};

// ============= DATA =============
// Deterministic fixtures: one order, fixed ISO timestamps, no clocks or
// randomness. "Today" in copy refers to the fixed fixture date 2026-07-01.

const STORE_NAME = 'Trailhead Supply';
const ORDER_NUMBER = 'TS-482915';
const PLACED_NOTE = 'Placed Jun 27, 2026';
const CARRIER_NAME = 'Meridian Express';
const TRACKING_NUMBER = 'MX-4821-9937-5502';
const ETA_HEADLINE = 'Arriving today by 8:00 PM';
const ETA_DETAIL = 'On the truck since 8:12 AM · 14 stops away';
const SUPPORT_EMAIL = 'avery.w@example.com';

// ---- fulfillment stages ----

type StageStatus = 'done' | 'active' | 'upcoming';

interface Stage {
  id: string;
  label: string;
  icon: IconType;
  /** Fixed caption under the stage label: a date for past stages, a live
   * note for the active one, an expectation for upcoming ones. */
  note: string;
}

const STAGES: ReadonlyArray<Stage> = [
  {id: 'placed', label: 'Placed', icon: ReceiptTextIcon, note: 'Jun 27, 9:34 AM'},
  {id: 'packed', label: 'Packed', icon: PackageIcon, note: 'Jun 27, 11:08 AM'},
  {id: 'shipped', label: 'Shipped', icon: TruckIcon, note: 'Jun 28, 6:05 AM'},
  {
    id: 'out-for-delivery',
    label: 'Out for delivery',
    icon: NavigationIcon,
    note: 'Today, 8:12 AM',
  },
  {id: 'delivered', label: 'Delivered', icon: HomeIcon, note: 'By 8:00 PM'},
];

// 'Out for delivery' is the current stage.
const CURRENT_STAGE_INDEX = 3;

const stageStatus = (index: number): StageStatus =>
  index < CURRENT_STAGE_INDEX
    ? 'done'
    : index === CURRENT_STAGE_INDEX
      ? 'active'
      : 'upcoming';

// ---- schematic route (styled nodes, no real map) ----

interface RouteStop {
  id: string;
  kind: 'origin' | 'hub' | 'destination';
  city: string;
  facility: string;
  isReached: boolean;
}

const ROUTE_STOPS: ReadonlyArray<RouteStop> = [
  {
    id: 'pdx',
    kind: 'origin',
    city: 'Portland, OR',
    facility: 'Fulfillment center',
    isReached: true,
  },
  {
    id: 'slc',
    kind: 'hub',
    city: 'Salt Lake City, UT',
    facility: 'Regional hub',
    isReached: true,
  },
  {
    id: 'dal',
    kind: 'hub',
    city: 'Dallas, TX',
    facility: 'Regional hub',
    isReached: true,
  },
  {
    id: 'aus',
    kind: 'destination',
    city: 'Austin, TX',
    facility: 'Delivery address',
    isReached: false,
  },
];

// The truck marker rides the leg between these two stop indexes.
const ACTIVE_LEG_INDEX = 2; // Dallas → Austin

const ROUTE_STOP_ICON: Record<RouteStop['kind'], IconType> = {
  origin: WarehouseIcon,
  hub: Building2Icon,
  destination: HomeIcon,
};

// ---- carrier events ----

interface CarrierEvent {
  id: string;
  ts: string; // fixed ISO timestamp
  title: string;
  location: string;
  icon: IconType;
  isCurrent?: boolean;
}

// Newest first, matching how a shopper scans "where is it right now?".
const CARRIER_EVENTS: ReadonlyArray<CarrierEvent> = [
  {
    id: 'ev-10',
    ts: '2026-07-01T08:12:00Z',
    title: 'Out for delivery',
    location: 'Austin, TX — South Congress delivery station',
    icon: NavigationIcon,
    isCurrent: true,
  },
  {
    id: 'ev-09',
    ts: '2026-07-01T05:47:00Z',
    title: 'Arrived at delivery station',
    location: 'Austin, TX — South Congress delivery station',
    icon: MapPinIcon,
  },
  {
    id: 'ev-08',
    ts: '2026-06-30T22:03:00Z',
    title: 'Departed regional hub',
    location: 'Dallas, TX — Meridian hub 14',
    icon: TruckIcon,
  },
  {
    id: 'ev-07',
    ts: '2026-06-30T14:31:00Z',
    title: 'Arrived at regional hub',
    location: 'Dallas, TX — Meridian hub 14',
    icon: Building2Icon,
  },
  {
    id: 'ev-06',
    ts: '2026-06-29T03:18:00Z',
    title: 'Departed regional hub',
    location: 'Salt Lake City, UT — Meridian hub 6',
    icon: TruckIcon,
  },
  {
    id: 'ev-05',
    ts: '2026-06-28T19:42:00Z',
    title: 'Arrived at regional hub',
    location: 'Salt Lake City, UT — Meridian hub 6',
    icon: Building2Icon,
  },
  {
    id: 'ev-04',
    ts: '2026-06-28T06:05:00Z',
    title: 'Picked up by carrier',
    location: 'Portland, OR — Trailhead fulfillment center',
    icon: TruckIcon,
  },
  {
    id: 'ev-03',
    ts: '2026-06-27T16:22:00Z',
    title: 'Shipping label created',
    location: 'Portland, OR — Trailhead fulfillment center',
    icon: ReceiptTextIcon,
  },
  {
    id: 'ev-02',
    ts: '2026-06-27T11:08:00Z',
    title: 'Order packed',
    location: 'Portland, OR — Trailhead fulfillment center',
    icon: PackageIcon,
  },
  {
    id: 'ev-01',
    ts: '2026-06-27T09:34:00Z',
    title: 'Order placed',
    location: 'trailheadsupply.example.com',
    icon: ReceiptTextIcon,
  },
];

// The four latest scans show by default; the rest sit behind the toggle.
const RECENT_EVENT_COUNT = 4;

// ---- shipment facts ----

const SHIPMENT_FACTS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Carrier', value: CARRIER_NAME},
  {label: 'Service', value: 'Ground Saver'},
  {label: 'Tracking', value: TRACKING_NUMBER},
  {label: 'Weight', value: '6.4 lb · 1 box'},
  {label: 'Shipped', value: 'Jun 28, 2026'},
  {label: 'Est. delivery', value: 'Jul 1, by 8:00 PM'},
];

// ---- line items ----

interface LineItem {
  id: string;
  name: string;
  variant: string;
  qty: number;
  unitPriceCents: number;
  icon: IconType;
  gradient: string; // placeholder art — no network images
}

const LINE_ITEMS: ReadonlyArray<LineItem> = [
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
];

const SHIPPING_CENTS = 0;
const TAX_CENTS = 3044;

/** Cents -> "$1,234.56"; deterministic, no locale surprises in fixtures. */
const usd = (cents: number): string => {
  const dollars = Math.floor(cents / 100);
  const remainder = \`\${cents % 100}\`.padStart(2, '0');
  return \`$\${dollars.toLocaleString('en-US')}.\${remainder}\`;
};

// ---- delivery address ----

const ADDRESS = {
  recipient: 'Avery Whitman',
  lines: ['2114 Bluff Springs Rd, Apt 227', 'Austin, TX 78744'],
  instructions: 'Gate code #4482 — leave with the concierge if no answer.',
};

// ---- issue report options ----

const ISSUE_OPTIONS: ReadonlyArray<{
  value: string;
  label: string;
  description: string;
}> = [
  {
    value: 'damaged',
    label: 'Item arrived damaged',
    description: 'Something in the box is broken or unusable.',
  },
  {
    value: 'missing',
    label: 'Item is missing',
    description: 'The box arrived but something was not inside.',
  },
  {
    value: 'late',
    label: 'Delivery is late',
    description: 'The package has not moved or missed its window.',
  },
  {
    value: 'other',
    label: 'Something else',
    description: 'Billing, address, or anything not listed above.',
  },
];

// ============= COMPONENTS =============

/** One node circle in the fulfillment stepper. */
function StageNode({stage, status}: {stage: Stage; status: StageStatus}) {
  const nodeStyle =
    status === 'done'
      ? styles.stepNodeDone
      : status === 'active'
        ? styles.stepNodeActive
        : styles.stepNodeUpcoming;
  return (
    <div style={{...styles.stepNode, ...nodeStyle}}>
      <Icon
        icon={status === 'done' ? CheckIcon : stage.icon}
        size="sm"
        color="inherit"
        aria-hidden
      />
    </div>
  );
}

function StageCaption({stage, status}: {stage: Stage; status: StageStatus}) {
  return (
    <VStack gap={0.5}>
      <Text
        type="body"
        weight={status === 'active' ? 'semibold' : 'normal'}
        color={status === 'upcoming' ? 'secondary' : undefined}>
        {stage.label}
      </Text>
      <Text type="supporting" color="secondary">
        {stage.note}
      </Text>
    </VStack>
  );
}

/**
 * Five-stage fulfillment stepper. Horizontal node row above 640px; a
 * vertical rail below so all five labels fit a 375px viewport unsqueezed.
 */
function StageStepper({isVertical}: {isVertical: boolean}) {
  if (isVertical) {
    return (
      <VStack gap={0}>
        {STAGES.map((stage, index) => {
          const status = stageStatus(index);
          const isLast = index === STAGES.length - 1;
          return (
            <div key={stage.id} style={styles.stepRowVertical}>
              <div style={styles.stepGutter}>
                <StageNode stage={stage} status={status} />
                {!isLast && (
                  <div
                    style={{
                      ...styles.stepConnectorVertical,
                      ...(index < CURRENT_STAGE_INDEX
                        ? styles.stepBarDone
                        : styles.stepBarUpcoming),
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  ...styles.stepBodyVertical,
                  ...(isLast ? styles.stepBodyVerticalLast : undefined),
                }}>
                <StageCaption stage={stage} status={status} />
              </div>
            </div>
          );
        })}
      </VStack>
    );
  }

  return (
    <div style={styles.stepRow}>
      {STAGES.map((stage, index) => {
        const status = stageStatus(index);
        return (
          <div key={stage.id} style={{display: 'contents'}}>
            {index > 0 && (
              <div
                style={{
                  ...styles.stepBar,
                  ...(index <= CURRENT_STAGE_INDEX
                    ? styles.stepBarDone
                    : styles.stepBarUpcoming),
                }}
              />
            )}
            <div style={styles.stepCell}>
              <StageNode stage={stage} status={status} />
              <StageCaption stage={stage} status={status} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Schematic route strip: origin, hubs, and destination as styled nodes on a
 * progress rail. The truck badge rides the active leg; no real map or tiles.
 */
function RouteStrip() {
  return (
    <div style={styles.routeScroll}>
      <div style={styles.routeScrollInner}>
        <div style={styles.routeRow}>
          {ROUTE_STOPS.map((stop, index) => {
            const legIndex = index - 1; // leg arriving at this stop
            const isLegDone = legIndex < ACTIVE_LEG_INDEX;
            const isActiveLeg = legIndex === ACTIVE_LEG_INDEX;
            return (
              <div key={stop.id} style={{display: 'contents'}}>
                {index > 0 && (
                  <div style={styles.routeLeg}>
                    <div style={styles.routeLegRail}>
                      {isActiveLeg ? (
                        <>
                          <div
                            style={{
                              ...styles.routeLegLine,
                              ...styles.routeLegLineDone,
                            }}
                          />
                          <div style={styles.routeTruck}>
                            <Icon
                              icon={TruckIcon}
                              size="sm"
                              color="inherit"
                              aria-label="Package in transit on this leg"
                            />
                          </div>
                          <div
                            style={{
                              ...styles.routeLegLine,
                              ...styles.routeLegLinePending,
                            }}
                          />
                        </>
                      ) : (
                        <div
                          style={{
                            ...styles.routeLegLine,
                            ...(isLegDone
                              ? styles.routeLegLineDone
                              : styles.routeLegLinePending),
                          }}
                        />
                      )}
                    </div>
                  </div>
                )}
                <div style={styles.routeStop}>
                  <div
                    style={{
                      ...styles.routeNode,
                      ...(stop.isReached
                        ? styles.routeNodeDone
                        : styles.routeNodeUpcoming),
                    }}>
                    <Icon
                      icon={ROUTE_STOP_ICON[stop.kind]}
                      size="sm"
                      color="inherit"
                      aria-hidden
                    />
                  </div>
                  <VStack gap={0.5}>
                    <Text
                      type="body"
                      weight={stop.isReached ? 'normal' : 'semibold'}
                      maxLines={1}>
                      {stop.city}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {stop.facility}
                    </Text>
                  </VStack>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** One carrier scan on the event rail. */
function EventRow({
  event,
  isLast,
  isNarrow,
}: {
  event: CarrierEvent;
  isLast: boolean;
  isNarrow: boolean;
}) {
  const timestamp = (
    <Timestamp value={event.ts} format="date_time" color="secondary" />
  );
  return (
    <div style={styles.eventRow}>
      <div style={styles.eventGutter}>
        <div
          style={{
            ...styles.eventMarker,
            ...(event.isCurrent ? styles.eventMarkerCurrent : undefined),
          }}>
          <Icon
            icon={event.icon}
            size="sm"
            color={event.isCurrent ? 'inherit' : 'secondary'}
            aria-hidden
          />
        </div>
        {!isLast && <div style={styles.eventConnector} />}
      </div>
      <div
        style={{
          ...styles.eventBody,
          ...(isLast ? styles.eventBodyLast : undefined),
        }}>
        <VStack gap={0.5}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="body" weight={event.isCurrent ? 'semibold' : 'normal'}>
                  {event.title}
                </Text>
                {event.isCurrent && (
                  <Token label="Latest scan" color="blue" size="sm" />
                )}
              </HStack>
            </StackItem>
            {!isNarrow && timestamp}
          </HStack>
          <Text type="supporting" color="secondary">
            {event.location}
          </Text>
          {isNarrow && timestamp}
        </VStack>
      </div>
    </div>
  );
}

/** One line item row; grows a return CheckboxInput in return mode. */
function LineItemRow({
  item,
  isReturnMode,
  isSelected,
  onToggle,
}: {
  item: LineItem;
  isReturnMode: boolean;
  isSelected: boolean;
  onToggle: (id: string, checked: boolean) => void;
}) {
  return (
    <HStack gap={3} vAlign="center">
      {isReturnMode && (
        <CheckboxInput
          label={\`Return \${item.name}\`}
          isLabelHidden
          value={isSelected}
          onChange={checked => onToggle(item.id, checked)}
        />
      )}
      <div style={{...styles.itemArt, background: item.gradient}}>
        <Icon icon={item.icon} size="sm" color="inherit" aria-hidden />
      </div>
      <StackItem size="fill">
        <VStack gap={0.5}>
          <Text type="body" maxLines={1}>
            {item.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.variant} · Qty {item.qty}
          </Text>
        </VStack>
      </StackItem>
      <Text type="body" hasTabularNumbers>
        {usd(item.unitPriceCents * item.qty)}
      </Text>
    </HStack>
  );
}

/** Right-aligned money row for the totals block. */
function TotalRow({
  label,
  value,
  isEmphasized,
}: {
  label: string;
  value: string;
  isEmphasized?: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <Text
          type={isEmphasized ? 'body' : 'supporting'}
          weight={isEmphasized ? 'semibold' : 'normal'}
          color={isEmphasized ? undefined : 'secondary'}>
          {label}
        </Text>
      </StackItem>
      <Text
        type={isEmphasized ? 'body' : 'supporting'}
        weight={isEmphasized ? 'semibold' : 'normal'}
        color={isEmphasized ? undefined : 'secondary'}
        hasTabularNumbers>
        {value}
      </Text>
    </HStack>
  );
}

// ============= PAGE =============

export default function OrderTrackingPage() {
  // Responsive contract: <=768px the end panel stacks below the tracking
  // column; <=640px the stepper flips vertical and controls grow tap boxes.
  const isStacked = useMediaQuery('(max-width: 768px)');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  // ---- interactive state ----
  const [hasCopiedTracking, setHasCopiedTracking] = useState(false);
  const [isShowingAllEvents, setIsShowingAllEvents] = useState(false);
  const [isReturnMode, setIsReturnMode] = useState(false);
  const [returnSelection, setReturnSelection] = useState<Set<string>>(
    () => new Set(),
  );
  const [returnBanner, setReturnBanner] = useState<string | null>(null);
  const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
  const [issueReason, setIssueReason] = useState('damaged');
  const [issueDetails, setIssueDetails] = useState('');
  const [hasReportedIssue, setHasReportedIssue] = useState(false);

  const visibleEvents = useMemo(
    () =>
      isShowingAllEvents
        ? CARRIER_EVENTS
        : CARRIER_EVENTS.slice(0, RECENT_EVENT_COUNT),
    [isShowingAllEvents],
  );
  const hiddenEventCount = CARRIER_EVENTS.length - RECENT_EVENT_COUNT;

  const subtotalCents = LINE_ITEMS.reduce(
    (total, item) => total + item.unitPriceCents * item.qty,
    0,
  );
  const totalCents = subtotalCents + SHIPPING_CENTS + TAX_CENTS;
  const itemCount = LINE_ITEMS.reduce((total, item) => total + item.qty, 0);

  // ---- interactions ----
  const handleCopyTracking = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard != null) {
      void navigator.clipboard.writeText(TRACKING_NUMBER);
    }
    setHasCopiedTracking(true);
  };

  const toggleReturnItem = (id: string, checked: boolean) => {
    setReturnSelection(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const enterReturnMode = () => {
    setIsReturnMode(true);
    setReturnBanner(null);
  };

  const cancelReturnMode = () => {
    setIsReturnMode(false);
    setReturnSelection(new Set());
  };

  const startReturn = () => {
    const count = returnSelection.size;
    setReturnBanner(
      \`Return started for \${count} \${count === 1 ? 'item' : 'items'} — a prepaid label was emailed to \${SUPPORT_EMAIL}.\`,
    );
    setIsReturnMode(false);
    setReturnSelection(new Set());
  };

  const openIssueDialog = () => {
    setIsIssueDialogOpen(true);
  };

  const submitIssue = () => {
    setHasReportedIssue(true);
    setIsIssueDialogOpen(false);
    setIssueDetails('');
  };

  // Tap-target raise applied to primary controls on touch-first widths.
  const tapStyle = isNarrow ? styles.tapTarget : undefined;

  // ---- header ----
  const copyButton = (
    <Button
      label={hasCopiedTracking ? 'Copied' : 'Copy tracking'}
      variant="secondary"
      icon={
        <Icon
          icon={hasCopiedTracking ? CheckIcon : CopyIcon}
          size="sm"
          color="inherit"
        />
      }
      onClick={handleCopyTracking}
      style={tapStyle}
    />
  );

  const carrierButton = (
    <Button
      label="Carrier site"
      variant="ghost"
      icon={<Icon icon={ExternalLinkIcon} size="sm" color="inherit" />}
      style={tapStyle}
    />
  );

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Icon icon={PackageIcon} size="md" color="secondary" />
              <Heading level={1}>
                Order <span style={styles.mono}>{ORDER_NUMBER}</span>
              </Heading>
              <Badge label="Out for delivery" variant="info" />
            </HStack>
            <Text type="supporting" color="secondary">
              {STORE_NAME} · {PLACED_NOTE} · {itemCount} items
            </Text>
          </VStack>
        </StackItem>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {copyButton}
          {carrierButton}
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ---- main column sections ----
  const progressCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StatusDot variant="accent" label="Out for delivery" isPulsing />
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              {ETA_HEADLINE}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            {ETA_DETAIL}
          </Text>
        </HStack>
        <StageStepper isVertical={isNarrow} />
      </VStack>
    </Card>
  );

  const routeCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={3}>Route</Heading>
          </StackItem>
          <Text type="supporting" color="secondary">
            Portland, OR → Austin, TX · 3 legs
          </Text>
        </HStack>
        <RouteStrip />
      </VStack>
    </Card>
  );

  const factsCard = (
    <Card padding={4}>
      <MetadataList
        columns={isNarrow ? 'single' : 'multi'}
        label={{position: 'start', width: 104}}>
        {SHIPMENT_FACTS.map(fact => (
          <MetadataListItem key={fact.label} label={fact.label}>
            {fact.label === 'Tracking' ? (
              <Text type="body">
                <span style={styles.mono}>{fact.value}</span>
              </Text>
            ) : (
              <Text type="body">{fact.value}</Text>
            )}
          </MetadataListItem>
        ))}
      </MetadataList>
    </Card>
  );

  const eventSection = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Carrier updates</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {CARRIER_EVENTS.length} scans · {CARRIER_NAME}
        </Text>
      </HStack>
      <div>
        {visibleEvents.map((event, index) => (
          <EventRow
            key={event.id}
            event={event}
            isLast={index === visibleEvents.length - 1}
            isNarrow={isNarrow}
          />
        ))}
      </div>
      <div>
        <Button
          label={
            isShowingAllEvents
              ? 'Show recent scans only'
              : \`Show \${hiddenEventCount} earlier events\`
          }
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isShowingAllEvents ? ChevronUpIcon : ChevronDownIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setIsShowingAllEvents(prev => !prev)}
          style={tapStyle}
        />
      </div>
    </VStack>
  );

  const trackingColumn = (
    <div style={styles.column}>
      <VStack gap={4}>
        {progressCard}
        {routeCard}
        {factsCard}
        {eventSection}
      </VStack>
    </div>
  );

  // ---- end panel sections (docked >768px, stacked below otherwise) ----
  const itemsSection = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={3}>Items</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {itemCount} items
        </Text>
      </HStack>
      {returnBanner != null && (
        <Banner
          status="success"
          title="Return started"
          description={returnBanner}
          isDismissable
          onDismiss={() => setReturnBanner(null)}
        />
      )}
      {isReturnMode && (
        <Text type="supporting" color="secondary">
          Select the items you want to send back.
        </Text>
      )}
      <VStack gap={3}>
        {LINE_ITEMS.map(item => (
          <LineItemRow
            key={item.id}
            item={item}
            isReturnMode={isReturnMode}
            isSelected={returnSelection.has(item.id)}
            onToggle={toggleReturnItem}
          />
        ))}
      </VStack>
      <Divider />
      <VStack gap={1.5}>
        <TotalRow label="Subtotal" value={usd(subtotalCents)} />
        <TotalRow
          label="Shipping"
          value={SHIPPING_CENTS === 0 ? 'Free' : usd(SHIPPING_CENTS)}
        />
        <TotalRow label="Tax" value={usd(TAX_CENTS)} />
        <TotalRow label="Total" value={usd(totalCents)} isEmphasized />
      </VStack>
    </VStack>
  );

  const addressSection = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={MapPinIcon} size="sm" color="secondary" />
        <Heading level={3}>Delivery address</Heading>
      </HStack>
      <VStack gap={0.5}>
        <Text type="body" weight="semibold">
          {ADDRESS.recipient}
        </Text>
        {ADDRESS.lines.map(line => (
          <Text key={line} type="body" color="secondary">
            {line}
          </Text>
        ))}
      </VStack>
      <Card variant="muted" padding={3}>
        <Text type="supporting" color="secondary">
          {ADDRESS.instructions}
        </Text>
      </Card>
    </VStack>
  );

  const supportSection = (
    <VStack gap={3}>
      <HStack gap={2} vAlign="center">
        <Icon icon={LifeBuoyIcon} size="sm" color="secondary" />
        <Heading level={3}>Need help?</Heading>
      </HStack>
      {hasReportedIssue && (
        <Banner
          status="success"
          title="Issue reported"
          description={\`Support will reply to \${SUPPORT_EMAIL} within 24 hours.\`}
          isDismissable
          onDismiss={() => setHasReportedIssue(false)}
        />
      )}
      <VStack gap={2}>
        <Button
          label="Report an issue"
          variant="secondary"
          icon={
            <Icon icon={MessageSquareWarningIcon} size="sm" color="inherit" />
          }
          onClick={openIssueDialog}
          style={{...styles.fullWidth, ...tapStyle}}
        />
        {isReturnMode ? (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Button
                label={
                  returnSelection.size === 0
                    ? 'Start return'
                    : \`Start return (\${returnSelection.size})\`
                }
                variant="primary"
                isDisabled={returnSelection.size === 0}
                onClick={startReturn}
                style={{...styles.fullWidth, ...tapStyle}}
              />
            </StackItem>
            <Button
              label="Cancel"
              variant="ghost"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              onClick={cancelReturnMode}
              style={tapStyle}
            />
          </HStack>
        ) : (
          <Button
            label="Return items"
            variant="secondary"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={enterReturnMode}
            style={{...styles.fullWidth, ...tapStyle}}
          />
        )}
      </VStack>
      <Text type="supporting" color="secondary">
        Returns are free within 60 days of delivery.
      </Text>
    </VStack>
  );

  const panelContent = (
    <VStack gap={4}>
      {itemsSection}
      <Divider />
      {addressSection}
      <Divider />
      {supportSection}
    </VStack>
  );

  // ---- report-issue dialog ----
  const issueDialog = (
    <Dialog
      isOpen={isIssueDialogOpen}
      onOpenChange={setIsIssueDialogOpen}
      width={isNarrow ? 340 : 480}>
      <Layout
        header={
          <DialogHeader
            title="Report an issue"
            subtitle={\`Order \${ORDER_NUMBER} · \${STORE_NAME}\`}
            onOpenChange={setIsIssueDialogOpen}
            hasDivider
          />
        }
        content={
          <LayoutContent>
            <VStack gap={4}>
              <RadioList
                label="What went wrong?"
                value={issueReason}
                onChange={setIssueReason}>
                {ISSUE_OPTIONS.map(option => (
                  <RadioListItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    description={option.description}
                  />
                ))}
              </RadioList>
              <TextArea
                label="Details"
                isOptional
                placeholder="Anything that helps us sort it out faster"
                rows={3}
                value={issueDetails}
                onChange={setIssueDetails}
              />
              <HStack gap={2} vAlign="center" hAlign="end">
                <Button
                  label="Cancel"
                  variant="ghost"
                  onClick={() => setIsIssueDialogOpen(false)}
                  style={tapStyle}
                />
                <Button
                  label="Submit report"
                  variant="primary"
                  onClick={submitIssue}
                  style={tapStyle}
                />
              </HStack>
            </VStack>
          </LayoutContent>
        }
      />
    </Dialog>
  );

  return (
    <>
      <Layout
        height="fill"
        header={header}
        end={
          isStacked ? undefined : (
            <LayoutPanel width={340} padding={0} label="Order summary">
              <div style={styles.panelScroll}>{panelContent}</div>
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={4} label="Order tracking">
            {isStacked ? (
              // Single-pane fallback: the panel sections flow below the
              // tracking column and the page scrolls as one column.
              <VStack gap={5}>
                {trackingColumn}
                <Divider />
                {panelContent}
              </VStack>
            ) : (
              trackingColumn
            )}
          </LayoutContent>
        }
      />
      {issueDialog}
    </>
  );
}
`;export{e as default};