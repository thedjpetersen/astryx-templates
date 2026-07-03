// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Kestrel Labs IT hardware logistics
 *   (six stocked SKUs, seven July-2026 purchase orders, inbound vendor and
 *   return shipments with fixed tracking refs, the two in-flight new-hire
 *   kits, three offboarding returns, and a Q3 procurement budget whose
 *   spent/committed splits are derived from PO state). No clocks, no
 *   randomness, no network media.
 * @output Hardware Orders & Logistics — the IT-procurement surface of the
 *   Kestrel Labs workforce platform (140 people; signed-in admin Tom
 *   Okonkwo). A stock-on-hand card row (MacBook Pro 14″/16″, Dell XPS 15,
 *   iPhone 16, 27″ monitors, TS4 docks — low-stock cards carry an amber
 *   tint plus an "on order" chip pointing at the replenishing PO); a
 *   filterable, sortable open-orders Table (PO number, items, vendor chip,
 *   cost, ETA, ordered/shipped/received status pill, and a working Receive
 *   action that moves cost from committed to spent, bumps stock on hand,
 *   and flips the matching shipment row to Delivered); an inbound-shipment
 *   tracker with carrier + tracking chips, last-scan lines, and progress
 *   meters; and an end panel stacking the Q3 procurement-budget meter
 *   (spent / committed / remaining reconcile with the PO table), the
 *   new-hire allocation queue (Ava Lindqvist's kit in transit, Ken
 *   Tanaka's remainder reserved with an amber ship-by chip), and the
 *   returns & refurb queue (three offboarding devices with A/B/C condition
 *   grades and dispositions).
 * @position Page template; emitted by `astryx template it-inventory-orders`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | content (stock card grid, orders toolbar + Table, inbound
 *   shipment rows — one scroll column) | end panel 360 (budget meter,
 *   new-hire queue, returns & refurb; scrolls independently).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Stock tiles, shipment rows, kit rows, and the budget meter are
 *   styled divs inside frame sections.
 * Color policy: token-pure everywhere. Intentional literals: the
 *   `light-dark()` fallback pairs on data-viz categorical tokens (vendor
 *   monograms, budget segments — the demo does not inject
 *   `--color-data-categorical-*`), the amber low-stock tint pair on stock
 *   tiles and the ship-by chip, and the condition-grade chip tints.
 *
 * Responsive contract:
 * - > 1200px: full frame with the 360px logistics panel.
 * - <= 1200px: the end panel is dropped and its three sections re-render
 *   stacked at the bottom of the content column, after the shipment
 *   tracker — nothing is lost, the column just gets longer.
 * - <= 900px: the orders table drops the Vendor and ETA columns (vendor
 *   moves into the items sub-line) so PO / items / cost / status never
 *   crush; the header row wraps instead of clipping the search box.
 * - The stock grid is auto-fill (minmax 190px) at every width; the content
 *   column and end panel each scroll independently (`minHeight: 0` down
 *   the flex chains).
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArchiveRestoreIcon,
  CheckCircle2Icon,
  CircleDollarSignIcon,
  ClipboardListIcon,
  LaptopIcon,
  MonitorIcon,
  PackageIcon,
  PackageCheckIcon,
  PlugZapIcon,
  PrinterIcon,
  RecycleIcon,
  SearchIcon,
  SmartphoneIcon,
  TruckIcon,
  UserPlusIcon,
  WrenchIcon,
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
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {
  Table,
  pixel,
  proportional,
  useTableSortable,
  useTableSortableState,
} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sectionHead: {marginBottom: 'var(--spacing-2)'},
  // Stock-on-hand tiles ----------------------------------------------------
  stockGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  stockCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  // Intentional literal pair: amber low-stock tint (documented in the
  // header color policy). The dark side shifts to the lighter hue.
  stockCardLow: {
    border: 'var(--border-width) solid light-dark(#D97706, #FBBF24)',
    backgroundColor: 'light-dark(rgba(217, 119, 6, 0.06), rgba(251, 191, 36, 0.08))',
  },
  stockCount: {fontVariantNumeric: 'tabular-nums', lineHeight: 1},
  onOrderChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Orders table -----------------------------------------------------------
  ordersToolbar: {marginBottom: 'var(--spacing-2)'},
  tableWrap: {
    // Pixel columns keep a floor; narrow viewports scroll horizontally
    // instead of crushing cells.
    overflowX: 'auto',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  poRef: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  numericCell: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  vendorMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 6,
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.4,
    // Monogram tiles are tinted with categorical colors; the glyph is
    // always the near-white literal so it reads on every tint.
    color: 'light-dark(#FFFFFF, #0B1220)',
  },
  tableEmpty: {padding: 'var(--spacing-6) var(--spacing-4)'},
  // Inbound shipment tracker ------------------------------------------------
  shipmentRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'center',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  shipmentGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  trackingChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  shipmentMeter: {width: 120, flexShrink: 0},
  // End panel ---------------------------------------------------------------
  panelScroll: {height: '100%', minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  meterTrack: {
    display: 'flex',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
  },
  meterSegment: {height: '100%'},
  legendSwatch: {width: 10, height: 10, borderRadius: 3, flexShrink: 0},
  kitRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    minWidth: 0,
  },
  hireBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  shipByChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 7px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    // Same documented amber pair as the low-stock tiles.
    color: 'light-dark(#92400E, #FCD34D)',
    backgroundColor: 'light-dark(rgba(217, 119, 6, 0.12), rgba(251, 191, 36, 0.14))',
  },
  gradeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    borderRadius: 6,
    flexShrink: 0,
    fontSize: 11,
    fontWeight: 700,
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company), July 2026. Signed-in admin: Tom Okonkwo (IT admin). Fixtures
// cross-reference the device-inventory surface: Ava Lindqvist's and Ken
// Tanaka's kit shipments carry the same asset tags and tracking refs, the
// KL-MBA-0029 battery return matches the KL-MBA-0088 replacement shipment,
// and Dana Whitfield's iPhone 13 trade-in matches her refresh shipment.
// Budget math reconciles by construction: spent = received POs ($16,489),
// committed = open POs ($23,447), remaining = $86,000 − both.
// ---------------------------------------------------------------------------

const CURRENT_ADMIN = 'Tom Okonkwo';

type SkuId = 'mbp14' | 'mbp16' | 'xps15' | 'iph16' | 'mon27' | 'dock';

interface SkuMeta {
  id: SkuId;
  label: string;
  /** Compact label used inside chips and kit rows. */
  short: string;
  icon: typeof LaptopIcon;
  unitCost: number;
  /** Amber threshold: low when onHand − reserved <= reorderPoint. */
  reorderPoint: number;
}

const SKUS: Record<SkuId, SkuMeta> = {
  mbp14: {id: 'mbp14', label: 'MacBook Pro 14″ M4', short: 'MBP 14″', icon: LaptopIcon, unitCost: 1999, reorderPoint: 4},
  mbp16: {id: 'mbp16', label: 'MacBook Pro 16″ M4', short: 'MBP 16″', icon: LaptopIcon, unitCost: 2499, reorderPoint: 3},
  xps15: {id: 'xps15', label: 'Dell XPS 15', short: 'XPS 15', icon: LaptopIcon, unitCost: 1799, reorderPoint: 2},
  iph16: {id: 'iph16', label: 'iPhone 16', short: 'iPhone 16', icon: SmartphoneIcon, unitCost: 899, reorderPoint: 3},
  mon27: {id: 'mon27', label: 'Dell U2723QE 27″ 4K', short: '27″ monitor', icon: MonitorIcon, unitCost: 579, reorderPoint: 4},
  dock: {id: 'dock', label: 'CalDigit TS4 dock', short: 'TS4 dock', icon: PlugZapIcon, unitCost: 359, reorderPoint: 3},
};

const SKU_ORDER: SkuId[] = ['mbp14', 'mbp16', 'xps15', 'iph16', 'mon27', 'dock'];

interface StockLevel {
  onHand: number;
  /** Held for the new-hire allocation queue below — counts must agree. */
  reserved: number;
}

// Reserved units reconcile with the allocation queue: monitors 2 (Ava desk
// + Ken kit), docks 2 (Ava + Ken), iPhone 1 (Ken — Ava's already shipped).
// Low at load: mbp16 (2 − 0 <= 3) and mon27 (3 − 2 <= 4); both have
// replenishing POs in flight (PO-2607, PO-2604).
const INITIAL_STOCK: Record<SkuId, StockLevel> = {
  mbp14: {onHand: 6, reserved: 0},
  mbp16: {onHand: 2, reserved: 0},
  xps15: {onHand: 3, reserved: 0},
  iph16: {onHand: 5, reserved: 1},
  mon27: {onHand: 3, reserved: 2},
  dock: {onHand: 6, reserved: 2},
};

// ---------------------------------------------------------------------------
// DATA — vendors & purchase orders
// ---------------------------------------------------------------------------

type VendorId = 'apple' | 'dell' | 'cdw';

const VENDORS: Record<VendorId, {label: string; mark: string; color: string}> = {
  apple: {label: 'Apple Business', mark: 'AP', color: CATEGORICAL.purple},
  dell: {label: 'Dell Business', mark: 'DL', color: CATEGORICAL.blue},
  cdw: {label: 'CDW', mark: 'CW', color: CATEGORICAL.orange},
};

type PoStatus = 'ordered' | 'shipped' | 'received';

const PO_STATUS_TOKEN: Record<PoStatus, {color: 'blue' | 'orange' | 'green'; label: string}> = {
  ordered: {color: 'blue', label: 'Ordered'},
  shipped: {color: 'orange', label: 'Shipped'},
  received: {color: 'green', label: 'Received'},
};

interface PoShipment {
  carrier: string;
  trackingRef: string;
  /** Last carrier scan — fixed fixture line + ISO timestamp. */
  lastScan: string;
  scanAt: string;
  /** Fixture route progress, 0–100. */
  pct: number;
}

// The Table generic requires rows assignable to Record<string, unknown>.
interface PoRow extends Record<string, unknown> {
  id: string;
  items: string;
  /** null for accessory bundles that are not tracked as stock SKUs. */
  sku: SkuId | null;
  qty: number;
  vendor: VendorId;
  cost: number;
  requestedBy: string;
  orderedAt: string; // ISO date
  eta: string | null; // ISO date; null once received
  receivedAt: string | null; // ISO date
  status: PoStatus;
  shipment?: PoShipment;
}

const INITIAL_POS: PoRow[] = [
  {
    id: 'PO-2601', items: '6 × MacBook Pro 14″ M4', sku: 'mbp14', qty: 6,
    vendor: 'apple', cost: 11_994, requestedBy: 'Tom Okonkwo',
    orderedAt: '2026-06-22', eta: null, receivedAt: '2026-07-01', status: 'received',
    shipment: {carrier: 'FedEx', trackingRef: '7841 2290 8815', lastScan: 'Delivered — SF HQ receiving dock', scanAt: '2026-07-01T16:42:00Z', pct: 100},
  },
  {
    id: 'PO-2602', items: '5 × iPhone 16 + cases', sku: 'iph16', qty: 5,
    vendor: 'apple', cost: 4_495, requestedBy: 'Dana Whitfield',
    orderedAt: '2026-06-24', eta: null, receivedAt: '2026-07-02', status: 'received',
    shipment: {carrier: 'UPS', trackingRef: '1Z 884A 02 8790 6641', lastScan: 'Delivered — SF HQ receiving dock', scanAt: '2026-07-02T18:05:00Z', pct: 100},
  },
  {
    id: 'PO-2604', items: '8 × Dell U2723QE 27″ 4K', sku: 'mon27', qty: 8,
    vendor: 'dell', cost: 4_632, requestedBy: 'Tom Okonkwo',
    orderedAt: '2026-06-26', eta: '2026-07-06', receivedAt: null, status: 'shipped',
    shipment: {carrier: 'FedEx Freight', trackingRef: '4482 1107 6690', lastScan: 'Departed Memphis, TN hub', scanAt: '2026-07-02T21:14:00Z', pct: 60},
  },
  {
    id: 'PO-2605', items: '6 × CalDigit TS4 dock', sku: 'dock', qty: 6,
    vendor: 'cdw', cost: 2_154, requestedBy: 'Tom Okonkwo',
    orderedAt: '2026-06-29', eta: '2026-07-07', receivedAt: null, status: 'shipped',
    shipment: {carrier: 'UPS', trackingRef: '1Z 884A 02 8821 4405', lastScan: 'Arrived Oakland, CA facility', scanAt: '2026-07-03T04:52:00Z', pct: 45},
  },
  {
    id: 'PO-2607', items: '4 × MacBook Pro 16″ M4', sku: 'mbp16', qty: 4,
    vendor: 'apple', cost: 9_996, requestedBy: 'Priya Raman',
    orderedAt: '2026-07-02', eta: '2026-07-14', receivedAt: null, status: 'ordered',
  },
  {
    id: 'PO-2608', items: '3 × Dell XPS 15', sku: 'xps15', qty: 3,
    vendor: 'dell', cost: 5_397, requestedBy: 'Jonah Fields',
    orderedAt: '2026-07-02', eta: '2026-07-16', receivedAt: null, status: 'ordered',
  },
  {
    id: 'PO-2609', items: 'Keyboards, mice & USB-C adapters', sku: null, qty: 12,
    vendor: 'cdw', cost: 1_268, requestedBy: 'Tom Okonkwo',
    orderedAt: '2026-07-03', eta: '2026-07-10', receivedAt: null, status: 'ordered',
  },
];

// ---------------------------------------------------------------------------
// DATA — budget, new-hire kits, returns
// ---------------------------------------------------------------------------

/** FY26 Q3 hardware & peripherals budget, approved by Elena Voss (Finance). */
const BUDGET_TOTAL = 86_000;

type KitLineState = 'shipped' | 'reserved';

interface KitLine {
  label: string;
  state: KitLineState;
  /** Shipped lines: carrier + tracking (same refs as device inventory). */
  carrier?: string;
  trackingRef?: string;
  eta?: string; // ISO date
  /** Reserved lines: where the hold is satisfied from. */
  note?: string;
}

interface HireKit {
  id: string;
  name: string;
  dept: string;
  office: string;
  startsAt: string; // ISO date
  /** Remote kits only: remaining reserved items must ship by this date. */
  shipBy?: string;
  lines: KitLine[];
}

// The two in-flight hires — same people, laptops, and tracking refs as the
// onboarding board and the device-inventory in-transit rows.
const HIRE_KITS: HireKit[] = [
  {
    id: 'hire-ava', name: 'Ava Lindqvist', dept: 'Engineering', office: 'SF HQ',
    startsAt: '2026-07-13',
    lines: [
      {label: 'MacBook Pro 14″ · KL-MBP-0163', state: 'shipped', carrier: 'FedEx', trackingRef: '7841 2296 4410', eta: '2026-07-07'},
      {label: 'iPhone 16 · KL-IPH-0221', state: 'shipped', carrier: 'UPS', trackingRef: '1Z 884A 02 6690 1174', eta: '2026-07-07'},
      {label: '27″ monitor + TS4 dock', state: 'reserved', note: 'Desk setup at SF HQ on Jul 10'},
    ],
  },
  {
    id: 'hire-ken', name: 'Ken Tanaka', dept: 'GTM', office: 'Remote-US',
    startsAt: '2026-07-13', shipBy: '2026-07-06',
    lines: [
      {label: 'MacBook Pro 14″ · KL-MBP-0164', state: 'shipped', carrier: 'FedEx', trackingRef: '7841 2296 5583', eta: '2026-07-08'},
      {label: 'iPhone 16 + 27″ monitor + TS4 dock', state: 'reserved', note: 'Reserved from stock — one box to Remote-US'},
    ],
  },
];

type ConditionGrade = 'A' | 'B' | 'C';

// Grade chips are tinted with the categorical palette (A green, B blue,
// C orange) over a translucent wash of the same hue.
const GRADE_META: Record<ConditionGrade, {color: string; wash: string; note: string}> = {
  A: {color: CATEGORICAL.green, wash: 'light-dark(rgba(11, 153, 31, 0.12), rgba(52, 199, 89, 0.16))', note: 'Wipe & restock'},
  B: {color: CATEGORICAL.blue, wash: 'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.16))', note: 'Trade-in / resale'},
  C: {color: CATEGORICAL.orange, wash: 'light-dark(rgba(235, 110, 0, 0.12), rgba(255, 147, 48, 0.16))', note: 'Vendor service'},
};

interface ReturnRow {
  id: string;
  assetTag: string;
  model: string;
  from: string;
  reason: string;
  grade: ConditionGrade;
  disposition: string;
  status: 'received' | 'transit';
  carrier?: string;
  trackingRef?: string;
  eta?: string; // ISO date
  receivedAt?: string; // ISO date
}

// Three devices inbound from offboarding/refresh. KL-MBA-0029 is the unit
// the in-transit KL-MBA-0088 replaces; the iPhone 13 is the one Dana's
// refresh shipment replaces; the contractor MacBook is the offboarding
// reclaim.
const RETURNS: ReturnRow[] = [
  {
    id: 'ret-1', assetTag: 'KL-MBP-0121', model: 'MacBook Pro 14″ M4',
    from: 'Elliot Navarro', reason: 'Contractor offboarded Jun 30',
    grade: 'A', disposition: 'Wipe queued → restock as loaner',
    status: 'received', receivedAt: '2026-07-02',
  },
  {
    id: 'ret-2', assetTag: 'KL-MBA-0029', model: 'MacBook Air 13″ M3',
    from: 'Mia Chen', reason: 'Battery swelling — replacement KL-MBA-0088 in transit',
    grade: 'C', disposition: 'Battery service at Apple, then refurb pool',
    status: 'transit', carrier: 'FedEx', trackingRef: '7841 2301 1187', eta: '2026-07-06',
  },
  {
    id: 'ret-3', assetTag: 'KL-IPH-0143', model: 'iPhone 13',
    from: 'Dana Whitfield', reason: 'Device refresh — replaced by KL-IPH-0222',
    grade: 'B', disposition: 'Trade-in credit via resale partner',
    status: 'transit', carrier: 'UPS', trackingRef: '1Z 884A 02 7710 3348', eta: '2026-07-08',
  },
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

function fmtUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Timezone-safe short date for ISO date-only fixtures: '2026-07-06' → 'Jul 6'. */
function fmtDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${MONTH_SHORT[Number(month) - 1]} ${Number(day)}`;
}

function availableUnits(level: StockLevel): number {
  return level.onHand - level.reserved;
}

function isLowStock(sku: SkuMeta, level: StockLevel): boolean {
  return availableUnits(level) <= sku.reorderPoint;
}

/** Units arriving on open POs, per SKU — powers the "+N on order" chips. */
function onOrderBySku(pos: PoRow[]): Partial<Record<SkuId, {qty: number; eta: string | null}>> {
  const out: Partial<Record<SkuId, {qty: number; eta: string | null}>> = {};
  for (const po of pos) {
    if (po.sku !== null && po.status !== 'received') {
      const prev = out[po.sku];
      out[po.sku] = {
        qty: (prev?.qty ?? 0) + po.qty,
        eta: prev?.eta ?? po.eta,
      };
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// SMALL PIECES — chips, pills, stock tiles
// ---------------------------------------------------------------------------

function VendorChip({vendor}: {vendor: VendorId}) {
  const meta = VENDORS[vendor];
  return (
    <HStack gap={2} vAlign="center" style={{minWidth: 0}}>
      <span
        style={{...styles.vendorMark, backgroundColor: meta.color}}
        aria-hidden="true">
        {meta.mark}
      </span>
      <Text type="body" maxLines={1}>
        {meta.label}
      </Text>
    </HStack>
  );
}

function TrackingChip({carrier, trackingRef}: {carrier: string; trackingRef: string}) {
  return (
    <span style={styles.trackingChip}>
      <Icon icon={TruckIcon} size="xsm" color="inherit" />
      {carrier} · {trackingRef}
    </span>
  );
}

function StatusPill({status}: {status: PoStatus}) {
  const meta = PO_STATUS_TOKEN[status];
  return <Token size="sm" color={meta.color} label={meta.label} />;
}

function GradeChip({grade}: {grade: ConditionGrade}) {
  const meta = GRADE_META[grade];
  return (
    <span
      style={{...styles.gradeChip, color: meta.color, backgroundColor: meta.wash}}
      aria-label={`Condition grade ${grade}`}>
      {grade}
    </span>
  );
}

function StockCard({
  sku,
  level,
  onOrder,
}: {
  sku: SkuMeta;
  level: StockLevel;
  onOrder?: {qty: number; eta: string | null};
}) {
  const available = availableUnits(level);
  const isLow = isLowStock(sku, level);
  return (
    <div style={isLow ? {...styles.stockCard, ...styles.stockCardLow} : styles.stockCard}>
      {/* Badge lives on the count row, not the title row — sharing the
          title row truncated both MacBook SKUs to an ambiguous
          "MacBook P…" inside the 190px tile floor. */}
      <HStack gap={2} vAlign="center">
        <Icon icon={sku.icon} size="sm" color="secondary" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" size="sm" maxLines={1}>
            {sku.label}
          </Text>
        </StackItem>
      </HStack>
      <HStack gap={2} vAlign="end">
        <Heading level={2} style={styles.stockCount}>
          {available}
        </Heading>
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            available
          </Text>
        </StackItem>
        {isLow ? <Badge variant="warning" label="Low stock" /> : null}
      </HStack>
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {level.onHand} on hand · {level.reserved} reserved
      </Text>
      <HStack gap={2} vAlign="center" wrap="wrap">
        {onOrder !== undefined ? (
          <span style={styles.onOrderChip}>
            <Icon icon={TruckIcon} size="xsm" color="inherit" />
            +{onOrder.qty} on order
            {onOrder.eta !== null ? ` · ${fmtDate(onOrder.eta)}` : ''}
          </span>
        ) : (
          <span style={styles.onOrderChip}>{fmtUsd(sku.unitCost)} / unit</span>
        )}
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ORDERS TABLE — columns. Fixed-width columns use pixel() so the header
// carries both width and minWidth (Table cells have max-width: 0).
// ---------------------------------------------------------------------------

function PoRefCell({po}: {po: PoRow}) {
  return (
    <VStack gap={0}>
      <Text type="label" style={styles.poRef} maxLines={1}>
        {po.id}
      </Text>
      <Text type="supporting" color="secondary" maxLines={1}>
        {fmtDate(po.orderedAt)}
      </Text>
    </VStack>
  );
}

function ItemsCell({po, isCompact}: {po: PoRow; isCompact: boolean}) {
  const skuIcon = po.sku !== null ? SKUS[po.sku].icon : PackageIcon;
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={skuIcon} size="sm" color="secondary" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {po.items}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {isCompact
              ? `${VENDORS[po.vendor].label} · by ${po.requestedBy}`
              : `Requested by ${po.requestedBy}`}
          </Text>
        </VStack>
      </StackItem>
    </HStack>
  );
}

function EtaCell({po}: {po: PoRow}) {
  if (po.status === 'received' && po.receivedAt !== null) {
    return (
      <HStack gap={1} vAlign="center">
        <Icon icon={PackageCheckIcon} size="xsm" color="secondary" />
        <Text type="body" color="secondary" style={styles.numericCell}>
          {fmtDate(po.receivedAt)}
        </Text>
      </HStack>
    );
  }
  return (
    <Text type="body" style={styles.numericCell}>
      {po.eta !== null ? fmtDate(po.eta) : '—'}
    </Text>
  );
}

function ActionCell({po, onReceive}: {po: PoRow; onReceive: (id: string) => void}) {
  if (po.status === 'shipped') {
    return (
      <Button
        label="Receive"
        variant="secondary"
        size="sm"
        icon={<Icon icon={PackageCheckIcon} size="sm" />}
        onClick={() => onReceive(po.id)}
      />
    );
  }
  if (po.status === 'received') {
    return (
      <HStack gap={1} vAlign="center" hAlign="end">
        <Icon icon={CheckCircle2Icon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          Logged
        </Text>
      </HStack>
    );
  }
  return (
    <MoreMenu
      label={`Actions for ${po.id}`}
      size="sm"
      items={[
        {label: 'Edit order', onClick: () => {}},
        {label: 'Copy vendor confirmation', onClick: () => {}},
        {label: 'Cancel order', onClick: () => {}},
      ]}
    />
  );
}

/** Sort rank for the ETA column: open POs by ETA, received rows last. */
function etaRank(po: PoRow): string {
  return po.status === 'received'
    ? `z-${po.receivedAt ?? ''}`
    : `a-${po.eta ?? '9999-99-99'}`;
}

function buildColumns(
  isCompact: boolean,
  onReceive: (id: string) => void,
): TableColumn<PoRow>[] {
  const columns: TableColumn<PoRow>[] = [
    {
      key: 'id',
      header: 'PO',
      width: pixel(110),
      sortable: true,
      renderCell: (po: PoRow) => <PoRefCell po={po} />,
    },
    {
      key: 'items',
      header: 'Items',
      width: proportional(2, {minWidth: 210}),
      renderCell: (po: PoRow) => <ItemsCell po={po} isCompact={isCompact} />,
    },
  ];
  if (!isCompact) {
    columns.push({
      key: 'vendor',
      header: 'Vendor',
      width: pixel(160),
      sortable: true,
      renderCell: (po: PoRow) => <VendorChip vendor={po.vendor} />,
    });
  }
  columns.push({
    key: 'cost',
    header: 'Cost',
    align: 'end',
    width: pixel(100),
    sortable: true,
    renderCell: (po: PoRow) => (
      <Text type="body" hasTabularNumbers style={styles.numericCell}>
        {fmtUsd(po.cost)}
      </Text>
    ),
  });
  if (!isCompact) {
    columns.push({
      key: 'eta',
      header: 'ETA',
      width: pixel(110),
      sortable: {sortKey: 'eta'},
      renderCell: (po: PoRow) => <EtaCell po={po} />,
    });
  }
  columns.push(
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      sortable: true,
      renderCell: (po: PoRow) => <StatusPill status={po.status} />,
    },
    {
      key: 'action',
      header: '',
      align: 'end',
      width: pixel(120),
      renderCell: (po: PoRow) => <ActionCell po={po} onReceive={onReceive} />,
    },
  );
  return columns;
}

// ---------------------------------------------------------------------------
// INBOUND SHIPMENT TRACKER — one row per PO shipment (open POs show live
// scans and a route meter; received POs stay as muted Delivered rows).
// Offboarding returns in transit appear here too, flagged with a Return
// token, so the tracker is the single "what's on a truck" view.
// ---------------------------------------------------------------------------

interface TrackerRow {
  id: string;
  kind: 'po' | 'return';
  refLabel: string; // PO id or asset tag
  title: string;
  carrier: string;
  trackingRef: string;
  lastScan: string;
  scanAt: string; // ISO datetime
  eta: string | null;
  pct: number;
  isDelivered: boolean;
}

function trackerRowsFromPos(pos: PoRow[]): TrackerRow[] {
  const rows: TrackerRow[] = [];
  for (const po of pos) {
    if (po.shipment !== undefined) {
      rows.push({
        id: `trk-${po.id}`,
        kind: 'po',
        refLabel: po.id,
        title: po.items,
        carrier: po.shipment.carrier,
        trackingRef: po.shipment.trackingRef,
        lastScan: po.shipment.lastScan,
        scanAt: po.shipment.scanAt,
        eta: po.eta,
        pct: po.shipment.pct,
        isDelivered: po.status === 'received',
      });
    }
  }
  for (const ret of RETURNS) {
    if (ret.status === 'transit' && ret.carrier !== undefined && ret.trackingRef !== undefined) {
      rows.push({
        id: `trk-${ret.id}`,
        kind: 'return',
        refLabel: ret.assetTag,
        title: `${ret.model} — return from ${ret.from}`,
        carrier: ret.carrier,
        trackingRef: ret.trackingRef,
        lastScan: 'Return label scanned — en route to SF HQ',
        scanAt: '2026-07-02T15:20:00Z',
        eta: ret.eta ?? null,
        pct: ret.id === 'ret-2' ? 70 : 30,
        isDelivered: false,
      });
    }
  }
  // Active shipments first (soonest ETA), delivered rows sink to the end.
  return rows.sort((a, b) => {
    if (a.isDelivered !== b.isDelivered) {
      return a.isDelivered ? 1 : -1;
    }
    return (a.eta ?? '9999').localeCompare(b.eta ?? '9999');
  });
}

function ShipmentRow({row}: {row: TrackerRow}) {
  return (
    <div style={row.isDelivered ? {...styles.shipmentRow, opacity: 0.62} : styles.shipmentRow}>
      <span style={styles.shipmentGlyph}>
        <Icon
          icon={
            row.isDelivered
              ? PackageCheckIcon
              : row.kind === 'return'
                ? ArchiveRestoreIcon
                : TruckIcon
          }
          size="sm"
          color="inherit"
        />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label" maxLines={1}>
              {row.title}
            </Text>
            <Token
              size="sm"
              color={row.kind === 'return' ? 'purple' : 'gray'}
              label={row.kind === 'return' ? `Return · ${row.refLabel}` : row.refLabel}
            />
          </HStack>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <TrackingChip carrier={row.carrier} trackingRef={row.trackingRef} />
            <Text type="supporting" color="secondary" maxLines={1}>
              {row.lastScan} · <Timestamp value={row.scanAt} format="date_time" />
            </Text>
          </HStack>
        </VStack>
      </StackItem>
      <VStack gap={1} hAlign="end" style={{flexShrink: 0}}>
        {row.isDelivered ? (
          <Badge variant="success" label="Delivered" />
        ) : (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            ETA {row.eta !== null ? fmtDate(row.eta) : '—'}
          </Text>
        )}
        {/* Footgun: ProgressBar enforces minWidth 48 — the fixed 120px
            meter is wide enough, but pin minWidth 0 for safety. */}
        <ProgressBar
          label={`Route progress for ${row.refLabel}`}
          isLabelHidden
          value={row.pct}
          variant="neutral"
          style={{...styles.shipmentMeter, minWidth: 0}}
        />
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// END PANEL — budget meter, new-hire allocation queue, returns & refurb.
// ---------------------------------------------------------------------------

function LegendRow({
  swatch,
  label,
  amount,
  isOutlined = false,
}: {
  swatch: string;
  label: string;
  amount: string;
  /** Muted swatches vanish on the surface background without a border. */
  isOutlined?: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <span
        style={{
          ...styles.legendSwatch,
          backgroundColor: swatch,
          ...(isOutlined
            ? {border: 'var(--border-width) solid var(--color-border)'}
            : null),
        }}
      />
      <StackItem size="fill">
        <Text type="supporting" color="secondary">
          {label}
        </Text>
      </StackItem>
      <Text type="supporting" hasTabularNumbers>
        {amount}
      </Text>
    </HStack>
  );
}

/**
 * Stacked quarter meter — spent (green) / committed (orange) / remaining
 * (muted track). Both figures are derived from the live PO rows, so the
 * Receive action visibly moves money from committed to spent.
 */
function BudgetMeter({spent, committed}: {spent: number; committed: number}) {
  const remaining = BUDGET_TOTAL - spent - committed;
  const spentPct = (spent / BUDGET_TOTAL) * 100;
  const committedPct = (committed / BUDGET_TOTAL) * 100;
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Icon icon={CircleDollarSignIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="label">Q3 procurement budget</Text>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {fmtUsd(BUDGET_TOTAL)}
        </Text>
      </HStack>
      <div
        style={styles.meterTrack}
        role="img"
        aria-label={`Q3 budget: ${fmtUsd(spent)} spent, ${fmtUsd(committed)} committed, ${fmtUsd(remaining)} remaining of ${fmtUsd(BUDGET_TOTAL)}`}>
        <span
          style={{...styles.meterSegment, width: `${spentPct}%`, backgroundColor: CATEGORICAL.green}}
        />
        <span
          style={{...styles.meterSegment, width: `${committedPct}%`, backgroundColor: CATEGORICAL.orange}}
        />
      </div>
      <VStack gap={1}>
        <LegendRow swatch={CATEGORICAL.green} label="Spent (received POs)" amount={fmtUsd(spent)} />
        <LegendRow swatch={CATEGORICAL.orange} label="Committed (open POs)" amount={fmtUsd(committed)} />
        <LegendRow
          swatch="var(--color-background-muted)"
          label="Remaining"
          amount={fmtUsd(remaining)}
          isOutlined
        />
      </VStack>
      <Text type="supporting" color="secondary">
        FY26 Q3 · Jul 1 – Sep 30 · Hardware & peripherals · Approved by
        Elena Voss (Finance)
      </Text>
    </VStack>
  );
}

function KitLineRow({line}: {line: KitLine}) {
  return (
    <div style={styles.kitRow}>
      <Icon
        icon={line.state === 'shipped' ? TruckIcon : PackageIcon}
        size="sm"
        color="secondary"
      />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="body" maxLines={1}>
                {line.label}
              </Text>
            </StackItem>
            {/* Long item labels must truncate — the state token never
                shrinks (otherwise "Reserved" clips to "Reserv…"). */}
            <Token
              size="sm"
              color={line.state === 'shipped' ? 'orange' : 'gray'}
              label={line.state === 'shipped' ? 'Shipped' : 'Reserved'}
              style={{flexShrink: 0}}
            />
          </HStack>
          {line.state === 'shipped' &&
          line.carrier !== undefined &&
          line.trackingRef !== undefined ? (
            <HStack gap={2} vAlign="center" wrap="wrap">
              <TrackingChip carrier={line.carrier} trackingRef={line.trackingRef} />
              {line.eta !== undefined ? (
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  ETA {fmtDate(line.eta)}
                </Text>
              ) : null}
            </HStack>
          ) : null}
          {line.note !== undefined ? (
            <Text type="supporting" color="secondary" maxLines={2}>
              {line.note}
            </Text>
          ) : null}
        </VStack>
      </StackItem>
    </div>
  );
}

function HireKitBlock({kit, onPrintLabel}: {kit: HireKit; onPrintLabel: (name: string) => void}) {
  return (
    <div style={styles.hireBlock}>
      <HStack gap={2} vAlign="center">
        <Avatar name={kit.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {kit.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {kit.dept} · {kit.office} · starts {fmtDate(kit.startsAt)}
            </Text>
          </VStack>
        </StackItem>
        {kit.shipBy !== undefined ? (
          <span style={styles.shipByChip}>Ship by {fmtDate(kit.shipBy)}</span>
        ) : null}
      </HStack>
      <VStack gap={2}>
        {kit.lines.map(line => (
          <KitLineRow key={line.label} line={line} />
        ))}
      </VStack>
      {kit.shipBy !== undefined ? (
        <Button
          label="Print shipping label"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PrinterIcon} size="sm" />}
          onClick={() => onPrintLabel(kit.name)}
        />
      ) : null}
    </div>
  );
}

function ReturnRowItem({ret}: {ret: ReturnRow}) {
  return (
    <div style={styles.kitRow}>
      <GradeChip grade={ret.grade} />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="label" maxLines={1}>
                {ret.model}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" style={styles.poRef}>
              {ret.assetTag}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary" maxLines={2}>
            {ret.from} — {ret.reason}
          </Text>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon
              icon={ret.grade === 'C' ? WrenchIcon : ret.grade === 'B' ? RecycleIcon : ArchiveRestoreIcon}
              size="xsm"
              color="secondary"
            />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="supporting" color="secondary" maxLines={1}>
                {ret.disposition}
              </Text>
            </StackItem>
            {ret.status === 'received' && ret.receivedAt !== undefined ? (
              <Badge variant="success" label={`Received ${fmtDate(ret.receivedAt)}`} />
            ) : (
              <Badge variant="neutral" label={`ETA ${ret.eta !== undefined ? fmtDate(ret.eta) : '—'}`} />
            )}
          </HStack>
        </VStack>
      </StackItem>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PANEL SECTIONS — rendered in the 360px end panel, or stacked at the
// bottom of the content column when the panel is dropped (<= 1200px).
// ---------------------------------------------------------------------------

function LogisticsSections({
  spent,
  committed,
  onPrintLabel,
}: {
  spent: number;
  committed: number;
  onPrintLabel: (name: string) => void;
}) {
  return (
    <VStack gap={4}>
      <BudgetMeter spent={spent} committed={committed} />
      <Divider />
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={UserPlusIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">New-hire allocation queue</Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {HIRE_KITS.length} kits
          </Text>
        </HStack>
        {HIRE_KITS.map(kit => (
          <HireKitBlock key={kit.id} kit={kit} onPrintLabel={onPrintLabel} />
        ))}
      </VStack>
      <Divider />
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ArchiveRestoreIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Text type="label">Returns & refurb</Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {RETURNS.length} inbound
          </Text>
        </HStack>
        {RETURNS.map(ret => (
          <ReturnRowItem key={ret.id} ret={ret} />
        ))}
        <Text type="supporting" color="secondary">
          Grade A restocks as loaner stock; grade B goes to the resale
          partner; grade C ships to vendor service before the refurb pool.
        </Text>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type StatusFilter = 'all' | PoStatus;

export default function ItInventoryOrdersTemplate() {
  const [pos, setPos] = useState<PoRow[]>(INITIAL_POS);
  const [stock, setStock] = useState<Record<SkuId, StockLevel>>(INITIAL_STOCK);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1200px drops the end panel (its sections stack
  // below the shipment tracker); <=900px drops the Vendor and ETA columns.
  const isPanelHidden = useMediaQuery('(max-width: 1200px)');
  const isCompact = useMediaQuery('(max-width: 900px)');

  // Receiving a shipped PO: status flips to received (cost moves from the
  // committed to the spent budget segment), stock on hand picks up the
  // quantity, and the tracker row becomes a Delivered entry.
  const receivePo = (id: string) => {
    const po = pos.find(row => row.id === id);
    if (po === undefined || po.status !== 'shipped') {
      return;
    }
    setPos(prev =>
      prev.map(row =>
        row.id === id
          ? {
              ...row,
              status: 'received' as const,
              receivedAt: '2026-07-03',
              eta: null,
              shipment:
                row.shipment !== undefined
                  ? {
                      ...row.shipment,
                      lastScan: 'Delivered — SF HQ receiving dock',
                      scanAt: '2026-07-03T17:30:00Z',
                      pct: 100,
                    }
                  : undefined,
            }
          : row,
      ),
    );
    if (po.sku !== null) {
      const sku = po.sku;
      setStock(prev => ({
        ...prev,
        [sku]: {...prev[sku], onHand: prev[sku].onHand + po.qty},
      }));
    }
    setAnnouncement(
      `Received ${po.id} — ${po.items}. ${fmtUsd(po.cost)} moved from committed to spent.`,
    );
  };

  const printLabel = (name: string) => {
    setAnnouncement(`Shipping label queued for ${name}'s kit.`);
  };

  // Budget splits derive from the live PO rows so every panel reconciles.
  const spent = pos.reduce((sum, po) => sum + (po.status === 'received' ? po.cost : 0), 0);
  const committed = pos.reduce((sum, po) => sum + (po.status !== 'received' ? po.cost : 0), 0);
  const onOrder = useMemo(() => onOrderBySku(pos), [pos]);
  const trackerRows = useMemo(() => trackerRowsFromPos(pos), [pos]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {all: pos.length, ordered: 0, shipped: 0, received: 0};
    for (const po of pos) {
      counts[po.status] += 1;
    }
    return counts;
  }, [pos]);

  // Status + search filter, derived during render.
  const visiblePos = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pos.filter(po => {
      if (statusFilter !== 'all' && po.status !== statusFilter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return `${po.id} ${po.items} ${VENDORS[po.vendor].label} ${po.requestedBy}`
        .toLowerCase()
        .includes(needle);
    });
  }, [pos, statusFilter, query]);

  // Sort plugin — default soonest-ETA first (received rows sink).
  const {sortedData, sortConfig} = useTableSortableState<PoRow>({
    data: visiblePos,
    defaultSort: [{sortKey: 'eta', direction: 'ascending'}],
    comparators: {
      id: (a, b) => a.id.localeCompare(b.id),
      vendor: (a, b) => VENDORS[a.vendor].label.localeCompare(VENDORS[b.vendor].label),
      cost: (a, b) => a.cost - b.cost,
      eta: (a, b) => etaRank(a).localeCompare(etaRank(b)),
      status: (a, b) => a.status.localeCompare(b.status),
    },
  });
  const sortPlugin = useTableSortable<PoRow>(sortConfig);

  const columns = useMemo(() => buildColumns(isCompact, receivePo), [isCompact, pos]);

  const openCount = statusCounts.ordered + statusCounts.shipped;
  const activeShipments = trackerRows.filter(row => !row.isDelivered).length;

  // ----- header: brand, quarter chip, search, new-PO button -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={PackageIcon} size="md" color="secondary" />
          <Heading level={1}>Hardware Orders</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs IT · {CURRENT_ADMIN}
          </Text>
        </HStack>
        <Token size="sm" color="gray" label="FY26 Q3" />
        <StackItem size="fill">
          <TextInput
            label="Search purchase orders"
            isLabelHidden
            size="sm"
            width="100%"
            style={{maxWidth: 440}}
            placeholder="Search PO, item, vendor, requester…"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={setQuery}
            hasClear
          />
        </StackItem>
        <Button
          label="New purchase order"
          variant="primary"
          size="sm"
          icon={<Icon icon={ClipboardListIcon} size="sm" color="inherit" />}
          onClick={() => setAnnouncement('Draft purchase order opened.')}
        />
      </HStack>
    </LayoutHeader>
  );

  const logisticsSections = (
    <LogisticsSections spent={spent} committed={committed} onPrintLabel={printLabel} />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <div style={styles.contentScroll}>
                <VStack gap={5}>
                  {/* ---- Stock on hand ---- */}
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center" style={styles.sectionHead}>
                      <StackItem size="fill">
                        <Heading level={2}>Stock on hand</Heading>
                      </StackItem>
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        Reserved units are held for the new-hire queue
                      </Text>
                    </HStack>
                    <div style={styles.stockGrid}>
                      {SKU_ORDER.map(skuId => (
                        <StockCard
                          key={skuId}
                          sku={SKUS[skuId]}
                          level={stock[skuId]}
                          onOrder={onOrder[skuId]}
                        />
                      ))}
                    </div>
                  </VStack>

                  {/* ---- Open orders ---- */}
                  <VStack gap={2}>
                    <HStack gap={3} vAlign="center" wrap="wrap" style={styles.ordersToolbar}>
                      <StackItem size="fill">
                        <Heading level={2}>Purchase orders</Heading>
                      </StackItem>
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {openCount} open · {fmtUsd(committed)} committed
                      </Text>
                      <SegmentedControl
                        label="Filter purchase orders by status"
                        value={statusFilter}
                        onChange={value => setStatusFilter(value as StatusFilter)}
                        size="sm">
                        <SegmentedControlItem label={`All ${statusCounts.all}`} value="all" />
                        <SegmentedControlItem label={`Ordered ${statusCounts.ordered}`} value="ordered" />
                        <SegmentedControlItem label={`Shipped ${statusCounts.shipped}`} value="shipped" />
                        <SegmentedControlItem label={`Received ${statusCounts.received}`} value="received" />
                      </SegmentedControl>
                    </HStack>
                    <div style={styles.tableWrap}>
                      <Table<PoRow>
                        data={sortedData}
                        columns={columns}
                        idKey="id"
                        density="balanced"
                        dividers="rows"
                        hasHover
                        plugins={{sort: sortPlugin}}
                        emptyState={
                          <div style={styles.tableEmpty}>
                            <EmptyState
                              isCompact
                              icon={<Icon icon={SearchIcon} size="lg" />}
                              title="No matching orders"
                              description="Try a different PO number, vendor, item, or status filter."
                            />
                          </div>
                        }
                      />
                    </div>
                  </VStack>

                  {/* ---- Inbound shipments ---- */}
                  <VStack gap={2}>
                    <HStack gap={2} vAlign="center" style={styles.sectionHead}>
                      <StackItem size="fill">
                        <Heading level={2}>Inbound shipments</Heading>
                      </StackItem>
                      <Text type="supporting" color="secondary" hasTabularNumbers>
                        {activeShipments} in motion
                      </Text>
                    </HStack>
                    <VStack gap={2}>
                      {trackerRows.map(row => (
                        <ShipmentRow key={row.id} row={row} />
                      ))}
                    </VStack>
                  </VStack>

                  {/* Panel fallback: below 1200px the end panel is dropped
                      and its sections stack here instead. */}
                  {isPanelHidden ? (
                    <>
                      <Divider />
                      {logisticsSections}
                    </>
                  ) : null}
                </VStack>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          !isPanelHidden ? (
            <LayoutPanel width={360} padding={0} hasDivider label="Logistics panel">
              <div style={styles.panelScroll}>{logisticsSections}</div>
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
