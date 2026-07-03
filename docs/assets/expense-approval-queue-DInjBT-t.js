var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Expense Approvals — finance manager's approvals inbox for submitted
 *   expense reports (approve, reject-with-comment, bulk-approve clean).
 *
 * @input Deterministic fixtures only: eight expense reports from seven
 *   submitters with fixed ISO submitted times spanning Jun 26 – Jul 2 2026,
 *   line items whose amounts sum exactly to the displayed report totals,
 *   per-item policy flags ('missing-receipt', 'over-limit') with concrete
 *   policy-note sentences, and receipt placeholders keyed to line items —
 *   no Date.now(), Math.random(), or network images (receipt thumbnails are
 *   styled gradient tiles). Decisions made in-session stamp one fixed
 *   SESSION_TIME.
 * @output An approvals inbox: left 360px report queue of ListItems — each
 *   with submitter Avatar, purpose, tabular-numeral total, and policy-flag
 *   Badges ('Missing receipt' warning / 'Over limit' error) or a green
 *   'Clean' Token — filtered by Pending/Approved/Rejected header Tabs with
 *   count Badges; clean pending rows carry CheckboxInputs (flagged rows show
 *   a disabled checkbox — flags must be judged one at a time) plus a
 *   'Select all clean' header row, and checking any summons a floating
 *   bottom-center bulk Toolbar ('Approve N'); right detail pane with the
 *   report header (Avatar, total, status Badge), amber policy-warning
 *   Banners quoting the exact rule broken, the line-item breakdown (category
 *   icon, merchant, note, flag Badges, right-aligned tabular amounts summing
 *   to the total), a horizontally scrolling receipt strip of gradient
 *   placeholder tiles (missing receipts render as dashed warning tiles), a
 *   MetadataList of report facts, and a pinned Approve / Reject action bar —
 *   Reject swaps in an inline composer whose 'Confirm rejection' stays
 *   disabled until a comment is entered. Every control is live against the
 *   fixtures: decisions move reports between tabs, record who/when/comment,
 *   and advance the selection to the next pending report.
 * @position Emitted by \`astryx template expense-approval-queue\`.
 *
 * Frame (desktop, left to right):
 *   report queue 360px | report detail (fill)
 * LayoutHeader carries the title, pending-count Badge, an awaiting-review
 * total chip, and the Pending/Approved/Rejected TabList.
 *
 * Container policy (approvals-inbox archetype): frame-first rows and panels,
 * zero Cards — the queue is a List in a LayoutPanel, warnings are Banners,
 * the only floating surface is the bulk-approve Toolbar, and the receipt
 * strip is styled tiles, not media Cards.
 *
 * Choose over shared-team-inbox when the queue holds structured financial
 * documents awaiting a verdict, not conversations awaiting replies; choose
 * over spam-quarantine-console when the detail explains MONEY (line items
 * summing to a total, receipts, policy limits) rather than a spam score, and
 * the reject path demands an audit comment.
 *
 * Responsive contract:
 * - >760px  — two-region frame: 360px queue LayoutPanel | detail fill. The
 *   queue list and detail body scroll independently; the page header,
 *   select-all row, and detail action bar stay pinned.
 * - <=760px — single pane: the queue fills the content region by default
 *   and tapping a row swaps in the detail pane with a back IconButton in
 *   its header; deciding a report returns to the queue. The bulk Toolbar
 *   keeps floating bottom-center over the queue. The header title row and
 *   stat chip wrap instead of clipping.
 * - <=640px — primary controls grow to ~40px touch targets (back, clear
 *   selection, Approve, Reject, Confirm rejection; size="sm" renders a
 *   28px box that is fine for pointers, too small for thumbs), and each
 *   row checkbox sits inside a >=40px hit area that stops the tap so a
 *   near-miss toggles selection instead of opening the detail pane. Fits
 *   a 375px viewport: totals stay on the label row, flag badges wrap
 *   beneath, and the TabList row scrolls horizontally (deliberate
 *   overflowX) rather than squeezing tab labels.
 * - The receipt strip scrolls horizontally at every width (deliberate
 *   overflowX: thumbnails keep a fixed 108px tile). Nothing is hover-only:
 *   flag Tooltips restate text already visible in the detail warnings, and
 *   the disabled bulk checkbox is explained by the visible flag Badges.
 *
 * Color policy: all chrome uses semantic tokens and adapts to light/dark.
 * The ONLY scheme-locked surfaces are the receipt-placeholder gradient
 * tiles (RECEIPT_GRADIENTS + styles.receiptTile): they stand in for photo
 * thumbnails of receipts, so like real images they keep identical brand
 * gradients in both schemes (colorScheme locked to 'light' on the tile),
 * and their overlaid text/icon stays a literal #FFFFFF — not a token — so
 * it remains readable on the fixed gradient regardless of scheme.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  ArrowLeftIcon,
  ArmchairIcon,
  BedDoubleIcon,
  CarFrontIcon,
  CheckCheckIcon,
  CheckIcon,
  ImageOffIcon,
  InboxIcon,
  MonitorIcon,
  PackageIcon,
  PlaneIcon,
  ReceiptTextIcon,
  TicketIcon,
  TriangleAlertIcon,
  UtensilsIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens; the only literal colors
// are the receipt-placeholder gradients (fixture art, not chrome) and the
// white text sitting on them — scheme-locked, see the header Color policy.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Definite height so Layout height="fill" resolves even when the host
  // container is auto-height; without it the detail scroll region collapses
  // to its minHeight floor and clips the receipt strip, while the pinned
  // action bar floats above the bottom of the host frame.
  root: {
    height: '100dvh',
    width: '100%',
  },
  // Positioning context for the floating bulk Toolbar; the list scrolls
  // inside it.
  queueWrap: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  selectAllRow: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  queueScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    // Keep the last rows reachable underneath the floating bulk Toolbar.
    paddingBottom: 76,
  },
  queueEmpty: {
    paddingInline: 'var(--spacing-3)',
    paddingTop: 'var(--spacing-5)',
  },
  // Tabular numerals so stacked report totals digit-align down the queue.
  amountChip: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  // Row-select hit area: >=40px square around the ~16px sm checkbox at
  // phone width so a near-miss tap toggles selection instead of falling
  // through to the row click that opens the detail pane.
  checkboxHit: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  checkboxHitDesktop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagWrap: {
    flexWrap: 'wrap',
  },
  // Floating bulk-approve bar: bottom-centered over the queue region.
  bulkBar: {
    position: 'absolute',
    left: '50%',
    bottom: 'var(--spacing-3)',
    transform: 'translateX(-50%)',
    zIndex: 5,
    maxWidth: 'calc(100% - var(--spacing-3) * 2)',
  },
  bulkBarSurface: {
    backgroundColor: 'var(--color-background-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    paddingInline: 'var(--spacing-2)',
  },
  detailColumn: {
    height: '100%',
    minHeight: 0,
  },
  detailHeader: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  // height 0 + flexGrow keeps long reports from pushing the pinned action
  // bar below the fold (they scroll inside this box); the viewport-tracking
  // minHeight floor keeps the frame tall when the container is auto-sized
  // (440px ≈ page header + detail header + action-bar chrome).
  detailScroll: {
    height: 0,
    minHeight: 'max(300px, calc(100dvh - 440px))',
    flexGrow: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-4)',
  },
  detailBody: {
    maxWidth: 760,
  },
  bannerRow: {
    paddingInline: 'var(--spacing-4)',
    paddingTop: 'var(--spacing-3)',
  },
  lineItemAmount: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  totalRow: {
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    borderTop: '1px solid var(--color-border-emphasized)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Receipt thumbnails keep a fixed tile size; the strip scrolls
  // horizontally at every width (deliberate overflowX).
  receiptStrip: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-2)',
  },
  // Scheme-locked surface (see header Color policy): the tile is a stand-in
  // for a receipt photo, so its RECEIPT_GRADIENTS background never flips
  // with the color scheme; colorScheme is pinned and the overlay text stays
  // literal white so it reads on the fixed gradient in both schemes.
  receiptTile: {
    width: 108,
    minWidth: 108,
    height: 132,
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    colorScheme: 'light',
    color: '#FFFFFF',
  },
  // Missing receipt: dashed warning tile instead of a gradient thumbnail.
  receiptTileMissing: {
    width: 108,
    minWidth: 108,
    height: 132,
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    border: '1px dashed var(--color-border-yellow)',
    backgroundColor: 'var(--color-background-yellow)',
  },
  receiptMeta: {
    minWidth: 0,
  },
  actionBar: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-3)',
  },
  // Rejection is an audit event: the composer gets a red-tinted surface so
  // the required comment reads as consequential, not optional.
  rejectComposer: {
    backgroundColor: 'var(--color-background-red)',
    border: '1px solid var(--color-border-red)',
    borderRadius: 'var(--radius-element)',
    padding: 'var(--spacing-3)',
  },
  // The title cell gives way first so header chrome never clips.
  headerTitle: {
    minWidth: 0,
  },
  // <=640px: the TabList row scrolls sideways instead of squeezing labels.
  tabScroll: {
    overflowX: 'auto',
  },
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in approver is Dana Whitfield,
// reviewing reports against the Brightpath T&E policy (meals $75/person/day,
// lodging $250/night, receipts required over $25). Line-item amounts sum
// exactly to every displayed total; in-session decisions stamp SESSION_TIME.
// ---------------------------------------------------------------------------

const APPROVER = 'Dana Whitfield';
const SESSION_TIME = '2026-07-02T10:15:00';
const POLICY_VERSION = 'T&E Policy v4.2 (May 2026)';

type Category =
  | 'flight'
  | 'lodging'
  | 'meals'
  | 'ground'
  | 'software'
  | 'supplies'
  | 'conference'
  | 'equipment';

const CATEGORY_META: Record<Category, {label: string; icon: typeof PlaneIcon}> =
  {
    flight: {label: 'Flight', icon: PlaneIcon},
    lodging: {label: 'Lodging', icon: BedDoubleIcon},
    meals: {label: 'Meals', icon: UtensilsIcon},
    ground: {label: 'Ground transport', icon: CarFrontIcon},
    software: {label: 'Software', icon: MonitorIcon},
    supplies: {label: 'Supplies', icon: PackageIcon},
    conference: {label: 'Conference', icon: TicketIcon},
    equipment: {label: 'Equipment', icon: ArmchairIcon},
  };

type PolicyFlag = 'missing-receipt' | 'over-limit';

const FLAG_BADGE: Record<PolicyFlag, {label: string; variant: 'warning' | 'error'}> = {
  'missing-receipt': {label: 'Missing receipt', variant: 'warning'},
  'over-limit': {label: 'Over limit', variant: 'error'},
};

interface LineItem {
  id: string;
  date: string;
  category: Category;
  merchant: string;
  note: string;
  amount: number;
  flags: PolicyFlag[];
  /** Concrete sentence quoting the policy rule the item breaks. */
  policyNote?: string;
  hasReceipt: boolean;
}

type ReportStatus = 'pending' | 'approved' | 'rejected';

interface Decision {
  by: string;
  time: string;
  comment?: string;
}

interface ExpenseReport {
  id: string;
  submitter: string;
  department: string;
  costCenter: string;
  purpose: string;
  submittedAt: string;
  tripDates: string | null;
  status: ReportStatus;
  decision?: Decision;
  items: LineItem[];
}

/** Newest submission first — the fixture array is pre-sorted this way. */
const REPORTS: ExpenseReport[] = [
  {
    id: 'exp-chicago',
    submitter: 'Marcus Webb',
    department: 'Sales',
    costCenter: 'CC-4102 · Field Sales',
    purpose: 'Client onsite — Chicago',
    submittedAt: '2026-07-02T08:40:00',
    tripDates: 'Jun 24 – Jun 25',
    status: 'pending',
    items: [
      {
        id: 'chi-1',
        date: '2026-06-24',
        category: 'flight',
        merchant: 'Meridian Air',
        note: 'SFO → ORD round trip, economy',
        amount: 412.6,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'chi-2',
        date: '2026-06-24',
        category: 'lodging',
        merchant: 'Lakeview Suites',
        note: '1 night, corporate rate',
        amount: 238.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'chi-3',
        date: '2026-06-24',
        category: 'meals',
        merchant: 'Gibsons Steakhouse',
        note: 'Client dinner, 2 attendees',
        amount: 118.4,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'chi-4',
        date: '2026-06-25',
        category: 'ground',
        merchant: 'City Cab Co.',
        note: 'Airport transfers, both legs',
        amount: 73.5,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-kickoff',
    submitter: 'Elena Vasquez',
    department: 'Sales',
    costCenter: 'CC-4102 · Field Sales',
    purpose: 'Q3 sales kickoff travel',
    submittedAt: '2026-07-02T07:55:00',
    tripDates: 'Jun 22 – Jun 25',
    status: 'pending',
    items: [
      {
        id: 'kick-1',
        date: '2026-06-22',
        category: 'flight',
        merchant: 'Meridian Air',
        note: 'AUS → DEN round trip, economy',
        amount: 524.3,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'kick-2',
        date: '2026-06-22',
        category: 'lodging',
        merchant: 'Summit Grand Hotel',
        note: '3 nights at $229/night',
        amount: 687.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'kick-3',
        date: '2026-06-23',
        category: 'meals',
        merchant: 'The Copper Range',
        note: 'Team dinner, 4 attendees',
        amount: 412.8,
        flags: ['over-limit'],
        policyNote:
          'Team dinner is $412.80 for 4 attendees — $112.80 over the $75-per-person meal limit.',
        hasReceipt: true,
      },
      {
        id: 'kick-4',
        date: '2026-06-24',
        category: 'ground',
        merchant: 'Denver RideShare',
        note: 'Hotel ↔ venue, 6 rides',
        amount: 96.3,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'kick-5',
        date: '2026-06-24',
        category: 'supplies',
        merchant: 'Summit Grand AV Desk',
        note: 'Breakout-room AV rental',
        amount: 266.0,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-offsite',
    submitter: 'Priya Sharma',
    department: 'Engineering',
    costCenter: 'CC-2210 · Platform Eng',
    purpose: 'Team offsite supplies',
    submittedAt: '2026-07-01T16:20:00',
    tripDates: null,
    status: 'pending',
    items: [
      {
        id: 'off-1',
        date: '2026-06-26',
        category: 'supplies',
        merchant: 'OfficeWorks',
        note: 'Whiteboards and markers',
        amount: 84.63,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'off-2',
        date: '2026-06-26',
        category: 'meals',
        merchant: 'Corner Bakery',
        note: 'Snacks and coffee for 12',
        amount: 57.55,
        flags: ['missing-receipt'],
        policyNote:
          'Snacks and coffee ($57.55) has no receipt — receipts are required for every purchase over $25.',
        hasReceipt: false,
      },
      {
        id: 'off-3',
        date: '2026-06-27',
        category: 'supplies',
        merchant: 'PrintHub',
        note: 'Workshop handouts, 12 sets',
        amount: 38.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'off-4',
        date: '2026-06-27',
        category: 'supplies',
        merchant: 'Facilitation Co.',
        note: 'Retro kit and sticky walls',
        amount: 132.0,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-software',
    submitter: 'Owen Riley',
    department: 'Design',
    costCenter: 'CC-3305 · Product Design',
    purpose: 'Monthly software reimbursements',
    submittedAt: '2026-07-01T11:05:00',
    tripDates: null,
    status: 'pending',
    items: [
      {
        id: 'sw-1',
        date: '2026-06-30',
        category: 'software',
        merchant: 'Figma',
        note: 'Professional seat, June',
        amount: 45.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'sw-2',
        date: '2026-06-30',
        category: 'software',
        merchant: 'Notion',
        note: 'Plus seat, June',
        amount: 24.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'sw-3',
        date: '2026-06-30',
        category: 'software',
        merchant: 'GitHub',
        note: 'Copilot seat, June',
        amount: 39.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'sw-4',
        date: '2026-06-30',
        category: 'software',
        merchant: 'Grammarly',
        note: 'Business seat, June',
        amount: 56.0,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-devworld',
    submitter: 'Jonah Fields',
    department: 'Engineering',
    costCenter: 'CC-2210 · Platform Eng',
    purpose: 'Conference: DevWorld 2026',
    submittedAt: '2026-07-01T09:30:00',
    tripDates: 'Jun 17 – Jun 19',
    status: 'pending',
    items: [
      {
        id: 'dev-1',
        date: '2026-06-17',
        category: 'conference',
        merchant: 'DevWorld 2026',
        note: 'Full conference pass',
        amount: 1199.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'dev-2',
        date: '2026-06-17',
        category: 'flight',
        merchant: 'Coastal Airlines',
        note: 'SEA → SAN round trip, economy',
        amount: 486.4,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'dev-3',
        date: '2026-06-17',
        category: 'lodging',
        merchant: 'Hotel Meridian',
        note: '2 nights at $312/night',
        amount: 624.0,
        flags: ['over-limit'],
        policyNote:
          'Hotel Meridian is $312.00/night for 2 nights — the conference lodging cap is $250/night.',
        hasReceipt: true,
      },
      {
        id: 'dev-4',
        date: '2026-06-18',
        category: 'meals',
        merchant: 'Harborview Grill',
        note: 'Speaker dinner, 2 attendees',
        amount: 158.5,
        flags: ['missing-receipt'],
        policyNote:
          'Speaker dinner ($158.50) has no receipt — receipts are required for every purchase over $25.',
        hasReceipt: false,
      },
      {
        id: 'dev-5',
        date: '2026-06-19',
        category: 'ground',
        merchant: 'San Diego RideShare',
        note: 'Airport + venue transfers',
        amount: 276.0,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-recruiting',
    submitter: 'Aisha Bello',
    department: 'People',
    costCenter: 'CC-5501 · Recruiting',
    purpose: 'Recruiting lunches — June',
    submittedAt: '2026-06-30T15:45:00',
    tripDates: null,
    status: 'pending',
    items: [
      {
        id: 'rec-1',
        date: '2026-06-05',
        category: 'meals',
        merchant: 'Verde Kitchen',
        note: 'Candidate lunch — staff engineer',
        amount: 64.2,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'rec-2',
        date: '2026-06-12',
        category: 'meals',
        merchant: 'Nori House',
        note: 'Candidate lunch — design lead',
        amount: 71.35,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'rec-3',
        date: '2026-06-19',
        category: 'meals',
        merchant: 'The Larder',
        note: 'Panel lunch, 3 interviewers',
        amount: 98.7,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'rec-4',
        date: '2026-06-26',
        category: 'meals',
        merchant: 'Foxtail Coffee',
        note: 'Sourcing coffee chats, 4 candidates',
        amount: 52.5,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-boston',
    submitter: 'Noah Park',
    department: 'Sales',
    costCenter: 'CC-4102 · Field Sales',
    purpose: 'May client travel — Boston',
    submittedAt: '2026-06-27T10:10:00',
    tripDates: 'May 19 – May 21',
    status: 'approved',
    decision: {by: APPROVER, time: '2026-06-28T14:05:00'},
    items: [
      {
        id: 'bos-1',
        date: '2026-05-19',
        category: 'flight',
        merchant: 'Meridian Air',
        note: 'SFO → BOS round trip, economy',
        amount: 389.2,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'bos-2',
        date: '2026-05-19',
        category: 'lodging',
        merchant: 'Beacon Hill Inn',
        note: '2 nights at $238/night',
        amount: 476.0,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'bos-3',
        date: '2026-05-20',
        category: 'meals',
        merchant: 'Union Oyster House',
        note: 'Client dinner, 3 attendees',
        amount: 178.65,
        flags: [],
        hasReceipt: true,
      },
      {
        id: 'bos-4',
        date: '2026-05-21',
        category: 'ground',
        merchant: 'Boston Cab',
        note: 'Airport transfers, both legs',
        amount: 83.5,
        flags: [],
        hasReceipt: true,
      },
    ],
  },
  {
    id: 'exp-chair',
    submitter: 'Tyler Nguyen',
    department: 'Engineering',
    costCenter: 'CC-2210 · Platform Eng',
    purpose: 'Home office chair',
    submittedAt: '2026-06-26T13:25:00',
    tripDates: null,
    status: 'rejected',
    decision: {
      by: APPROVER,
      time: '2026-06-27T09:40:00',
      comment:
        'Furniture goes through the equipment program, not expense reports — please return the chair or re-submit it as an IT equipment request.',
    },
    items: [
      {
        id: 'chair-1',
        date: '2026-06-24',
        category: 'equipment',
        merchant: 'ErgoLine Direct',
        note: 'Apex task chair, graphite',
        amount: 529.99,
        flags: ['over-limit'],
        policyNote:
          'Ergonomic chair ($529.99) exceeds the $300 home-office limit; furniture routes through the equipment program.',
        hasReceipt: true,
      },
    ],
  },
];

/**
 * Receipt-placeholder art: fixed gradient rotation, no network images.
 * Scheme-locked literals (see header Color policy): these tiles play the
 * role of receipt photos, so the gradients stay identical in dark mode —
 * styles.receiptTile pins colorScheme and carries the literal white text.
 */
const RECEIPT_GRADIENTS = [
  'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
  'linear-gradient(135deg, #0E7490 0%, #38BDF8 100%)',
  'linear-gradient(135deg, #4D7C0F 0%, #84CC16 100%)',
  'linear-gradient(135deg, #9D174D 0%, #F472B6 100%)',
  'linear-gradient(135deg, #B45309 0%, #FBBF24 100%)',
];

const STATUS_BADGE: Record<
  ReportStatus,
  {label: string; variant: 'info' | 'success' | 'error'}
> = {
  pending: {label: 'Pending', variant: 'info'},
  approved: {label: 'Approved', variant: 'success'},
  rejected: {label: 'Rejected', variant: 'error'},
};

type QueueTab = ReportStatus;

// ---------------------------------------------------------------------------
// HELPERS — pure and deterministic.
// ---------------------------------------------------------------------------

const reportTotal = (report: ExpenseReport): number =>
  report.items.reduce((sum, item) => sum + item.amount, 0);

const reportFlags = (report: ExpenseReport): PolicyFlag[] => {
  const flags = new Set<PolicyFlag>();
  for (const item of report.items) {
    for (const flag of item.flags) {
      flags.add(flag);
    }
  }
  // Stable order: warnings before hard limits reads oddly, so fix it.
  return (['missing-receipt', 'over-limit'] as const).filter(flag =>
    flags.has(flag),
  );
};

const isClean = (report: ExpenseReport): boolean =>
  reportFlags(report).length === 0;

const policyNotes = (report: ExpenseReport): string[] =>
  report.items.flatMap(item =>
    item.policyNote === undefined ? [] : [item.policyNote],
  );

/** Deterministic USD formatting — no locale dependence. */
const formatUSD = (value: number): string => {
  const [dollars, cents] = value.toFixed(2).split('.');
  const grouped = dollars.replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  return \`$\${grouped}.\${cents}\`;
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ExpenseApprovalQueueTemplate() {
  const [statusById, setStatusById] = useState<Record<string, ReportStatus>>(
    () => Object.fromEntries(REPORTS.map(report => [report.id, report.status])),
  );
  const [decisionById, setDecisionById] = useState<
    Record<string, Decision | undefined>
  >(() =>
    Object.fromEntries(REPORTS.map(report => [report.id, report.decision])),
  );
  const [activeTab, setActiveTab] = useState<QueueTab>('pending');
  const [selectedId, setSelectedId] = useState<string | null>('exp-kickoff');
  const [checkedIds, setCheckedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectDraft, setRejectDraft] = useState('');
  const [banner, setBanner] = useState<{
    status: 'success' | 'error';
    title: string;
  } | null>(null);
  // Responsive contract (see file header).
  const isSinglePane = useMediaQuery('(max-width: 760px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const [isDetailShownOnMobile, setIsDetailShownOnMobile] = useState(false);
  const iconTapTargetStyle = isPhone ? styles.iconTapTarget : undefined;
  const buttonTapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  // ---- derived state ----
  const reportsByTab = useMemo(() => {
    const byTab: Record<QueueTab, ExpenseReport[]> = {
      pending: [],
      approved: [],
      rejected: [],
    };
    for (const report of REPORTS) {
      byTab[statusById[report.id]].push(report);
    }
    return byTab;
  }, [statusById]);

  const tabReports = reportsByTab[activeTab];
  const pendingReports = reportsByTab.pending;
  const cleanPending = pendingReports.filter(isClean);
  const pendingTotal = pendingReports.reduce(
    (sum, report) => sum + reportTotal(report),
    0,
  );

  // Bulk selection only ever holds clean pending reports.
  const checkedCount = checkedIds.size;
  const allCleanChecked =
    cleanPending.length > 0 &&
    cleanPending.every(report => checkedIds.has(report.id));

  const selected =
    selectedId === null
      ? null
      : (REPORTS.find(report => report.id === selectedId) ?? null);
  const selectedStatus = selected === null ? null : statusById[selected.id];
  const selectedDecision = selected === null ? undefined : decisionById[selected.id];
  const selectedFlags = selected === null ? [] : reportFlags(selected);
  const selectedNotes = selected === null ? [] : policyNotes(selected);

  // ---- navigation ----
  const openReport = (id: string) => {
    setSelectedId(id);
    setIsRejecting(false);
    setRejectDraft('');
    setIsDetailShownOnMobile(true);
  };

  const switchTab = (value: string) => {
    const tab = value as QueueTab;
    setActiveTab(tab);
    setSelectedId(reportsByTab[tab][0]?.id ?? null);
    setIsRejecting(false);
    setRejectDraft('');
    setIsDetailShownOnMobile(false);
  };

  // ---- bulk selection ----
  const toggleChecked = (id: string, checked: boolean) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAllClean = (checked: boolean) => {
    setCheckedIds(() =>
      checked ? new Set(cleanPending.map(report => report.id)) : new Set(),
    );
  };

  const clearChecked = () => setCheckedIds(new Set());

  // ---- decisions ----
  // After a decision the pending queue shrinks: keep the review moving by
  // advancing the selection to the report at the same position (or the last
  // one, or none) instead of leaving a decided report selected in a tab
  // that no longer lists it.
  const decideReports = (
    ids: string[],
    verdict: 'approved' | 'rejected',
    comment?: string,
  ) => {
    const decided = new Set(ids);
    setStatusById(prev => {
      const next = {...prev};
      for (const id of ids) {
        next[id] = verdict;
      }
      return next;
    });
    setDecisionById(prev => {
      const next = {...prev};
      for (const id of ids) {
        next[id] = {by: APPROVER, time: SESSION_TIME, comment};
      }
      return next;
    });
    setCheckedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) {
        next.delete(id);
      }
      return next;
    });
    if (
      activeTab === 'pending' &&
      selectedId !== null &&
      decided.has(selectedId)
    ) {
      const remaining = pendingReports.filter(report => !decided.has(report.id));
      const oldIndex = pendingReports.findIndex(
        report => report.id === selectedId,
      );
      const next =
        remaining[Math.min(Math.max(oldIndex, 0), remaining.length - 1)] ??
        null;
      setSelectedId(next?.id ?? null);
    }
    setIsRejecting(false);
    setRejectDraft('');
    setIsDetailShownOnMobile(false);
  };

  const approveOne = (report: ExpenseReport) => {
    decideReports([report.id], 'approved');
    setBanner({
      status: 'success',
      title: \`Approved \${report.submitter}'s "\${report.purpose}" — \${formatUSD(
        reportTotal(report),
      )} released to payroll.\`,
    });
  };

  const rejectOne = (report: ExpenseReport) => {
    const comment = rejectDraft.trim();
    if (comment === '') {
      return;
    }
    decideReports([report.id], 'rejected', comment);
    setBanner({
      status: 'error',
      title: \`Rejected \${report.submitter}'s "\${report.purpose}" — the comment was sent back with the report.\`,
    });
  };

  const bulkApprove = () => {
    if (checkedCount === 0) {
      return;
    }
    const ids = cleanPending
      .filter(report => checkedIds.has(report.id))
      .map(report => report.id);
    const total = cleanPending
      .filter(report => checkedIds.has(report.id))
      .reduce((sum, report) => sum + reportTotal(report), 0);
    decideReports(ids, 'approved');
    setBanner({
      status: 'success',
      title: \`Bulk-approved \${ids.length} clean \${
        ids.length === 1 ? 'report' : 'reports'
      } — \${formatUSD(total)} released to payroll.\`,
    });
  };

  // ---- queue pane ----
  const queueRowStart = (report: ExpenseReport) => {
    if (activeTab !== 'pending') {
      return <Avatar name={report.submitter} size="small" />;
    }
    const clean = isClean(report);
    return (
      <HStack gap={2} vAlign="center">
        {/* The wrapper is the real touch target: it stops the click so
            checking a row never also opens the detail pane, and at phone
            width the >=40px hit area toggles selection itself. Flagged
            reports keep a disabled checkbox — the visible flag Badges
            explain why they must be judged one at a time. */}
        <div
          style={isPhone ? styles.checkboxHit : styles.checkboxHitDesktop}
          onClick={event => {
            event.stopPropagation();
            if (clean && event.target === event.currentTarget) {
              toggleChecked(report.id, !checkedIds.has(report.id));
            }
          }}>
          <CheckboxInput
            label={
              clean
                ? \`Select \${report.submitter}'s \${report.purpose} for bulk approval\`
                : \`\${report.purpose} has policy flags and cannot be bulk-approved\`
            }
            isLabelHidden
            size="sm"
            value={checkedIds.has(report.id)}
            isDisabled={!clean}
            onChange={checked => toggleChecked(report.id, checked)}
          />
        </div>
        <Avatar name={report.submitter} size="small" />
      </HStack>
    );
  };

  const queueRowFlags = (report: ExpenseReport) => {
    const flags = reportFlags(report);
    if (flags.length === 0) {
      return <Token label="Clean" size="sm" color="green" />;
    }
    return flags.map(flag => {
      const note = report.items.find(item => item.flags.includes(flag))
        ?.policyNote;
      return (
        // The Tooltip restates a policy note that is fully visible in the
        // detail warnings — extra context for pointers, never hover-only.
        <Tooltip key={flag} content={note ?? FLAG_BADGE[flag].label}>
          <Badge label={FLAG_BADGE[flag].label} variant={FLAG_BADGE[flag].variant} />
        </Tooltip>
      );
    });
  };

  const queueEmptyCopy: Record<QueueTab, string> = {
    pending: 'Queue clear — every report has been approved or rejected.',
    approved: 'Nothing approved yet — approvals will collect here.',
    rejected: 'Nothing rejected yet — rejections and their comments land here.',
  };

  const queuePane = (
    <div style={styles.queueWrap}>
      {activeTab === 'pending' && cleanPending.length > 0 && (
        <>
          <div style={styles.selectAllRow}>
            <CheckboxInput
              label={\`Select all clean (\${cleanPending.length})\`}
              size="sm"
              value={
                allCleanChecked
                  ? true
                  : checkedCount > 0
                    ? 'indeterminate'
                    : false
              }
              onChange={toggleAllClean}
            />
          </div>
          <Divider />
        </>
      )}
      <div style={styles.queueScroll}>
        {tabReports.length === 0 ? (
          <div style={styles.queueEmpty}>
            <Text type="supporting" color="secondary">
              {queueEmptyCopy[activeTab]}
            </Text>
          </div>
        ) : (
          <List density="compact" hasDividers>
            {tabReports.map(report => (
              <ListItem
                key={report.id}
                isSelected={!isSinglePane && report.id === selectedId}
                onClick={() => openReport(report.id)}
                startContent={queueRowStart(report)}
                label={
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      <Text type="body" weight="semibold" maxLines={1}>
                        {report.submitter}
                      </Text>
                    </StackItem>
                    <div style={styles.amountChip}>
                      <Text type="body" weight="semibold" hasTabularNumbers>
                        {formatUSD(reportTotal(report))}
                      </Text>
                    </div>
                  </HStack>
                }
                description={
                  <VStack gap={1}>
                    <Text type="supporting" color="primary" maxLines={1}>
                      {report.purpose}
                    </Text>
                    <HStack gap={1} vAlign="center" style={styles.flagWrap}>
                      {queueRowFlags(report)}
                      <StackItem size="fill">
                        <span />
                      </StackItem>
                      <Timestamp
                        value={report.submittedAt}
                        format="date"
                        hasTooltip={false}
                        type="supporting"
                        color="secondary"
                      />
                    </HStack>
                  </VStack>
                }
              />
            ))}
          </List>
        )}
      </div>
      {/* Floating bulk-approve bar — only clean reports are checkable, so
          the single action is an approve. */}
      {activeTab === 'pending' && checkedCount > 0 && (
        <div style={styles.bulkBar}>
          <div style={styles.bulkBarSurface}>
            <Toolbar
              label="Bulk approval actions"
              size="sm"
              gap={2}
              startContent={
                <HStack gap={2} vAlign="center">
                  <Text
                    type="label"
                    hasTabularNumbers
                    style={{whiteSpace: 'nowrap'}}>
                    {checkedCount} selected
                  </Text>
                  <IconButton
                    label="Clear selection"
                    tooltip="Clear selection"
                    size="sm"
                    variant="ghost"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    style={iconTapTargetStyle}
                    onClick={clearChecked}
                  />
                </HStack>
              }
              endContent={
                <Button
                  label={\`Approve \${checkedCount}\`}
                  variant="primary"
                  size="sm"
                  icon={<Icon icon={CheckCheckIcon} size="sm" color="inherit" />}
                  style={buttonTapTargetStyle}
                  onClick={bulkApprove}
                />
              }
            />
          </div>
        </div>
      )}
    </div>
  );

  // ---- detail pane ----
  const receiptStrip = (report: ExpenseReport) => (
    <div style={styles.receiptStrip}>
      {report.items.map((item, index) =>
        item.hasReceipt ? (
          <div
            key={item.id}
            style={{
              ...styles.receiptTile,
              background: RECEIPT_GRADIENTS[index % RECEIPT_GRADIENTS.length],
            }}>
            <Icon icon={ReceiptTextIcon} size="md" color="inherit" />
            <div style={styles.receiptMeta}>
              <Text type="supporting" weight="semibold" color="inherit" maxLines={1}>
                {item.merchant}
              </Text>
              <Text type="supporting" color="inherit" hasTabularNumbers>
                {formatUSD(item.amount)}
              </Text>
            </div>
          </div>
        ) : (
          <div key={item.id} style={styles.receiptTileMissing}>
            <Icon icon={ImageOffIcon} size="md" color="secondary" />
            <div style={styles.receiptMeta}>
              <Text type="supporting" weight="semibold" maxLines={1}>
                {item.merchant}
              </Text>
              <Text type="supporting" color="secondary">
                No receipt
              </Text>
            </div>
          </div>
        ),
      )}
    </div>
  );

  const lineItemRow = (item: LineItem) => {
    const meta = CATEGORY_META[item.category];
    return (
      <ListItem
        key={item.id}
        startContent={<Icon icon={meta.icon} size="sm" color="secondary" />}
        label={
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" style={styles.flagWrap}>
                <Text type="body" weight="semibold" maxLines={1}>
                  {item.merchant}
                </Text>
                {item.flags.map(flag => (
                  <Badge
                    key={flag}
                    label={FLAG_BADGE[flag].label}
                    variant={FLAG_BADGE[flag].variant}
                  />
                ))}
              </HStack>
            </StackItem>
            <div style={styles.lineItemAmount}>
              <Text type="body" hasTabularNumbers>
                {formatUSD(item.amount)}
              </Text>
            </div>
          </HStack>
        }
        description={
          <Text type="supporting" color="secondary" maxLines={1}>
            {meta.label} · {item.note} ·{' '}
            <Timestamp
              value={\`\${item.date}T00:00:00\`}
              format="date"
              hasTooltip={false}
              type="supporting"
              color="secondary"
            />
          </Text>
        }
      />
    );
  };

  const detailActionBar =
    selected === null || selectedStatus !== 'pending' ? null : (
      <>
        <Divider />
        <div style={styles.actionBar}>
          {isRejecting ? (
            <div style={styles.rejectComposer}>
              <VStack gap={2}>
                <Text type="label">
                  Reject "{selected.purpose}" — a comment is required
                </Text>
                <TextArea
                  label="Rejection comment"
                  isLabelHidden
                  rows={2}
                  value={rejectDraft}
                  onChange={setRejectDraft}
                  placeholder={\`Tell \${selected.submitter} what to fix before resubmitting…\`}
                />
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      Sent back to {selected.submitter} with the report.
                    </Text>
                  </StackItem>
                  <Button
                    label="Cancel"
                    size="sm"
                    variant="ghost"
                    style={buttonTapTargetStyle}
                    onClick={() => {
                      setIsRejecting(false);
                      setRejectDraft('');
                    }}
                  />
                  <Button
                    label="Confirm rejection"
                    size="sm"
                    variant="destructive"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    style={buttonTapTargetStyle}
                    isDisabled={rejectDraft.trim() === ''}
                    onClick={() => rejectOne(selected)}
                  />
                </HStack>
              </VStack>
            </div>
          ) : (
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  {selectedFlags.length === 0
                    ? 'No policy flags — safe to approve.'
                    : \`\${selectedFlags.length} policy \${
                        selectedFlags.length === 1 ? 'flag' : 'flags'
                      } — review the warnings before deciding.\`}
                </Text>
              </StackItem>
              <Button
                label="Reject"
                size="sm"
                variant="secondary"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                style={buttonTapTargetStyle}
                onClick={() => setIsRejecting(true)}
              />
              <Button
                label={\`Approve \${formatUSD(reportTotal(selected))}\`}
                size="sm"
                variant="primary"
                icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                style={buttonTapTargetStyle}
                onClick={() => approveOne(selected)}
              />
            </HStack>
          )}
        </div>
      </>
    );

  const detailPane =
    selected === null ? (
      <EmptyState
        title="No report selected"
        description="Pick a report from the queue, or switch tabs to review past decisions."
        icon={<Icon icon={InboxIcon} size="lg" color="secondary" />}
      />
    ) : (
      <Stack direction="vertical" style={styles.detailColumn}>
        <div style={styles.detailHeader}>
          <HStack gap={3} vAlign="center">
            {isSinglePane && (
              <IconButton
                label="Back to queue"
                tooltip="Back to queue"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                style={iconTapTargetStyle}
                onClick={() => setIsDetailShownOnMobile(false)}
              />
            )}
            <Avatar name={selected.submitter} size="small" />
            <StackItem size="fill" style={styles.headerTitle}>
              <VStack gap={0}>
                <Heading level={2} maxLines={1}>
                  {selected.purpose}
                </Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {selected.submitter} · {selected.department} · submitted{' '}
                  <Timestamp
                    value={selected.submittedAt}
                    format="date"
                    hasTooltip={false}
                    type="supporting"
                    color="secondary"
                  />
                </Text>
              </VStack>
            </StackItem>
            {selectedStatus !== null && (
              <Badge
                label={STATUS_BADGE[selectedStatus].label}
                variant={STATUS_BADGE[selectedStatus].variant}
              />
            )}
            <div style={styles.amountChip}>
              <Heading level={3}>{formatUSD(reportTotal(selected))}</Heading>
            </div>
          </HStack>
        </div>
        <Divider />
        <StackItem size="fill" style={styles.detailScroll}>
          <VStack gap={4} style={styles.detailBody}>
            {/* Decision record — who, when, and (for rejections) why. */}
            {selectedStatus === 'approved' && selectedDecision !== undefined && (
              <Banner
                status="success"
                container="section"
                title={\`Approved by \${selectedDecision.by}\`}
                description={
                  <Text type="supporting" color="secondary">
                    Released to payroll on{' '}
                    <Timestamp
                      value={selectedDecision.time}
                      format="date_time"
                      hasTooltip={false}
                      type="supporting"
                      color="secondary"
                    />
                    .
                  </Text>
                }
              />
            )}
            {selectedStatus === 'rejected' && selectedDecision !== undefined && (
              <Banner
                status="error"
                container="section"
                title={\`Rejected by \${selectedDecision.by}\`}
                description={
                  <VStack gap={1}>
                    {selectedDecision.comment !== undefined && (
                      <Text type="body">"{selectedDecision.comment}"</Text>
                    )}
                    <Text type="supporting" color="secondary">
                      Sent back to {selected.submitter} on{' '}
                      <Timestamp
                        value={selectedDecision.time}
                        format="date_time"
                        hasTooltip={false}
                        type="supporting"
                        color="secondary"
                      />
                      .
                    </Text>
                  </VStack>
                }
              />
            )}
            {/* Policy warnings — one Banner per broken rule, quoting it. */}
            {selectedStatus === 'pending' &&
              selectedNotes.map(note => (
                <Banner
                  key={note}
                  status="warning"
                  container="section"
                  icon={<Icon icon={TriangleAlertIcon} size="sm" />}
                  title="Policy warning"
                  description={note}
                />
              ))}

            <VStack gap={2}>
              <Heading level={3}>
                Line items ({selected.items.length})
              </Heading>
              <List density="compact" hasDividers>
                {selected.items.map(lineItemRow)}
              </List>
              <HStack gap={2} vAlign="center" style={styles.totalRow}>
                <StackItem size="fill">
                  <Text type="label">Report total</Text>
                </StackItem>
                <Text type="label" hasTabularNumbers>
                  {formatUSD(reportTotal(selected))}
                </Text>
              </HStack>
            </VStack>

            <VStack gap={2}>
              <Heading level={3}>
                Receipts (
                {selected.items.filter(item => item.hasReceipt).length} of{' '}
                {selected.items.length})
              </Heading>
              {receiptStrip(selected)}
            </VStack>

            <Divider />

            <MetadataList columns={2}>
              <MetadataListItem label="Report ID">
                {selected.id.replace('exp-', 'EXP-2026-').toUpperCase()}
              </MetadataListItem>
              <MetadataListItem label="Cost center">
                {selected.costCenter}
              </MetadataListItem>
              <MetadataListItem label="Department">
                {selected.department}
              </MetadataListItem>
              <MetadataListItem label="Trip dates">
                {selected.tripDates ?? 'Not a trip'}
              </MetadataListItem>
              <MetadataListItem label="Submitted">
                <Timestamp
                  value={selected.submittedAt}
                  format="date_time"
                  hasTooltip={false}
                />
              </MetadataListItem>
              <MetadataListItem label="Reviewed against">
                {POLICY_VERSION}
              </MetadataListItem>
            </MetadataList>
          </VStack>
        </StackItem>
        {detailActionBar}
      </Stack>
    );

  // ---- header ----
  const tabCounts: Record<QueueTab, number> = {
    pending: reportsByTab.pending.length,
    approved: reportsByTab.approved.length,
    rejected: reportsByTab.rejected.length,
  };

  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <Icon icon={WalletIcon} size="md" color="secondary" />
          <StackItem size="fill" style={styles.headerTitle}>
            <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
              <Heading level={1} maxLines={1}>
                Expense approvals
              </Heading>
              <Badge
                label={\`\${tabCounts.pending} pending\`}
                variant={tabCounts.pending > 0 ? 'info' : 'success'}
              />
            </HStack>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {formatUSD(pendingTotal)} awaiting review
          </Text>
        </HStack>
        {/* <=640px the tab row scrolls sideways instead of squeezing. */}
        <div style={styles.tabScroll}>
          <TabList value={activeTab} onChange={switchTab} size="sm">
            <Tab
              value="pending"
              label="Pending"
              endContent={
                <Badge label={String(tabCounts.pending)} variant="neutral" />
              }
            />
            <Tab
              value="approved"
              label="Approved"
              endContent={
                <Badge label={String(tabCounts.approved)} variant="neutral" />
              }
            />
            <Tab
              value="rejected"
              label="Rejected"
              endContent={
                <Badge label={String(tabCounts.rejected)} variant="neutral" />
              }
            />
          </TabList>
        </div>
      </VStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isSinglePane ? undefined : (
            <LayoutPanel
              width={360}
              padding={0}
              hasDivider
              label="Report queue">
              {queuePane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <Stack direction="vertical" style={styles.detailColumn}>
              {banner != null && (
                <div style={styles.bannerRow}>
                  <Banner
                    status={banner.status}
                    title={banner.title}
                    isDismissable
                    onDismiss={() => setBanner(null)}
                  />
                </div>
              )}
              <StackItem size="fill" style={{minHeight: 0}}>
                {/* <=760px the queue owns the content region until a row is
                    tapped; deciding a report routes back to the queue. */}
                {isSinglePane && !isDetailShownOnMobile ? queuePane : detailPane}
              </StackItem>
            </Stack>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};