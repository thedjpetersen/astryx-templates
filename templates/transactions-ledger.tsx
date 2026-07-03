// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file transactions-ledger.tsx
 * @input Deterministic fixtures only (a checking-account register with
 *   fixed ISO timestamps, integer cent amounts, merchant/location/method
 *   details, seeded notes, receipts, and reconcile state) — no clocks,
 *   randomness, or network assets.
 * @output Transactions Ledger — a bank-account register. One table groups
 *   Pending and Posted transactions; each row carries date, merchant with
 *   a category Token, a signed amount, and a running balance, plus a
 *   reconcile checkbox on posted rows. A sticky reconciliation summary
 *   Toolbar tracks cleared vs statement balance as boxes are checked.
 *   Clicking a row opens a detail side panel with merchant info, a
 *   category editor, a receipt placeholder, and per-transaction notes.
 * @position Page template; emitted by `astryx template transactions-ledger`.
 *
 * Frame: header | ledger table (fill) | detail panel 380 (end, rendered
 * only while a row is selected). The header carries the account title,
 * current/available balance readouts, and a filter row (search TextInput,
 * category Selector, month Selector). LayoutContent (padding 0) owns one
 * vertical scroller with the grouped table on top and the reconciliation
 * summary Toolbar stuck to the scroller's bottom edge. Dense records
 * render as table rows — category and status ride on Token and group
 * header rows, not cards.
 *
 * Ledger math is all derived state: running balances accumulate from a
 * fixed opening balance over posted rows in chronological order; the
 * cleared balance is opening + the sum of reconciled amounts; the
 * difference readout hits zero (and flips to a success Badge) when every
 * posted row is checked. Search and the category/month filters compose
 * and only affect what is visible — reconciliation math always covers the
 * full register so filtering can never lie about the cleared balance.
 *
 * Responsive contract:
 * - > 1024px: the detail panel is a fixed 380px LayoutPanel on the end
 *   edge with its own vertical scroll; the table keeps the remaining
 *   width. Columns: reconcile 52 | date 110 | merchant (fill) | amount
 *   110 | balance 122, amounts right-aligned with tabular numerals.
 * - <= 1024px: the end panel is dropped; the detail section renders below
 *   the table inside the shared scroller (index-on-top pattern) with a
 *   close button that returns focus to browsing.
 * - <= 768px: the running-balance column is hidden so the remaining
 *   columns keep readable widths; the balance stays reachable through
 *   the header readout and each row's detail panel.
 * - <= 640px: single-pane — selecting a row swaps the content region to
 *   the detail pane and a back IconButton returns to the register. The
 *   date column is also dropped (the date moves into the merchant cell's
 *   supporting line), so the table fits 375px with zero horizontal
 *   overflow. Header rows wrap instead of clipping; filter controls
 *   stretch full-width; primary buttons grow to ~40px tap targets; the
 *   summary Toolbar collapses to count + difference + an icon-only
 *   reconcile-all button. Reconcile checkboxes are real inputs (no
 *   hover-only affordances) and rows also toggle via Enter/Space.
 * - The summary Toolbar is sticky at the bottom of the content scroller
 *   at every width, so the cleared/statement readout stays visible while
 *   the register scrolls underneath.
 *
 * Color policy: token-pure except the merchant "logo" tiles, which are
 * scheme-locked brand art — each category keeps its literal two-stop
 * gradient with literal white initials (`colorScheme: 'light'` is set on
 * the tile) so the tiles render identically in light and dark mode, like
 * real merchant logos would. Every other raw value is an explicit
 * light-dark() pair (the receipt-scan paper stand-in and its stripes).
 */

import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';

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
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  PaperclipIcon,
  ReceiptIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  contentFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // One shared vertical scroller: grouped table (plus stacked detail on
  // narrow viewports) with the reconciliation bar stuck to its bottom.
  scrollRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  // Reconciliation summary bar: pinned to the bottom of the scroller so
  // the cleared/statement readout never scrolls away. The Toolbar's
  // "section" variant supplies an opaque background.
  reconcileBar: {
    position: 'sticky',
    bottom: 0,
    zIndex: 2,
  },
  row: {
    cursor: 'pointer',
  },
  rowSelected: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Pending vs Posted group header rows span the full column count.
  groupCell: {
    backgroundColor: 'var(--color-background-muted)',
  },
  // Signed amounts and balances stay right-aligned with tabular numerals.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  numericHeader: {
    textAlign: 'end',
  },
  creditAmount: {
    color: 'var(--color-success)',
  },
  pendingGlyph: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    minHeight: 24,
  },
  detail: {
    padding: 'var(--spacing-4)',
  },
  detailScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
  },
  // Merchant "logo": a deterministic gradient tile with initials — no
  // network images. Scheme-locked brand art (see header Color policy):
  // the category gradients and the white initials are literal on purpose
  // so the tile looks the same in both color schemes.
  merchantTile: {
    width: 48,
    height: 48,
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    colorScheme: 'light',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: 16,
    flexShrink: 0,
  },
  // Receipt placeholder: dashed drop-zone when empty…
  receiptEmpty: {
    border: '1px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    textAlign: 'center',
  },
  // …and a styled gradient block standing in for the scan once attached.
  // Slate "paper" in light mode flips to a deep slate panel in dark mode.
  receiptAttached: {
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    background:
      'linear-gradient(135deg, light-dark(#f8fafc, #1e293b) 0%, light-dark(#e2e8f0, #334155) 100%)',
    border: '1px solid var(--color-border)',
  },
  receiptRule: {
    height: 6,
    borderRadius: 3,
    background:
      'repeating-linear-gradient(90deg, light-dark(#cbd5e1, #475569) 0 24px, transparent 24px 32px)',
  },
  // ~40px touch targets on phones (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// DATA
// ---------------------------------------------------------------------------

type Category =
  | 'income'
  | 'groceries'
  | 'dining'
  | 'transport'
  | 'utilities'
  | 'shopping'
  | 'entertainment'
  | 'health'
  | 'transfer';

type TokenColor =
  | 'default'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'cyan'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'gray';

interface Transaction {
  id: string;
  /** Fixed ISO timestamp — pending rows use the authorization time. */
  postedAt: string;
  merchant: string;
  /** Raw statement descriptor, as the bank would print it. */
  descriptor: string;
  category: Category;
  /** Integer cents; debits negative, credits positive. */
  amountCents: number;
  status: 'pending' | 'posted';
  method: string;
  location: string;
}

const CATEGORY_META: Record<
  Category,
  {label: string; color: TokenColor; gradient: string}
> = {
  income: {
    label: 'Income',
    color: 'green',
    gradient: 'linear-gradient(135deg, #15803d 0%, #4ade80 100%)',
  },
  groceries: {
    label: 'Groceries',
    color: 'teal',
    gradient: 'linear-gradient(135deg, #0f766e 0%, #2dd4bf 100%)',
  },
  dining: {
    label: 'Dining',
    color: 'orange',
    gradient: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)',
  },
  transport: {
    label: 'Transport',
    color: 'blue',
    gradient: 'linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%)',
  },
  utilities: {
    label: 'Utilities',
    color: 'cyan',
    gradient: 'linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)',
  },
  shopping: {
    label: 'Shopping',
    color: 'purple',
    gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  },
  entertainment: {
    label: 'Entertainment',
    color: 'pink',
    gradient: 'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
  },
  health: {
    label: 'Health',
    color: 'yellow',
    gradient: 'linear-gradient(135deg, #a16207 0%, #facc15 100%)',
  },
  transfer: {
    label: 'Transfer',
    color: 'gray',
    gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
  },
};

const CATEGORY_ORDER: Category[] = [
  'income',
  'groceries',
  'dining',
  'transport',
  'utilities',
  'shopping',
  'entertainment',
  'health',
  'transfer',
];

const CATEGORY_OPTIONS = CATEGORY_ORDER.map(category => ({
  value: category,
  label: CATEGORY_META[category].label,
}));

const CATEGORY_FILTER_OPTIONS = [
  {value: 'all', label: 'All categories'},
  ...CATEGORY_OPTIONS,
];

// Month filter keys are plain ISO prefixes, so filtering is a string
// startsWith — no Date construction, fully deterministic.
const DATE_FILTER_OPTIONS = [
  {value: 'all', label: 'All dates'},
  {value: '2026-07', label: 'July 2026'},
  {value: '2026-06', label: 'June 2026'},
];

// Balance the register opened with on Jun 15, in cents ($4,829.16).
const OPENING_BALANCE_CENTS = 482916;
const STATEMENT_LABEL = 'Statement · Jun 15 – Jul 1';
const ACCOUNT_LABEL = 'Everyday Checking ··· 4821';

// Deterministic fixtures: fixed ISO timestamps, integer cents, no clocks,
// no randomness. Pending authorizations first, then the posted register.
const TRANSACTIONS: Transaction[] = [
  {
    id: 'txn-3103',
    postedAt: '2026-07-02T08:15:00Z',
    merchant: 'Transfer from Brokerage',
    descriptor: 'ACH CREDIT LIGHTHOUSE BROKERAGE',
    category: 'transfer',
    amountCents: 25000,
    status: 'pending',
    method: 'ACH transfer',
    location: 'Scheduled online',
  },
  {
    id: 'txn-3102',
    postedAt: '2026-07-02T07:46:00Z',
    merchant: 'Hearthstone Coffee Roasters',
    descriptor: 'HEARTHSTONE COFFEE #12',
    category: 'dining',
    amountCents: -685,
    status: 'pending',
    method: 'Visa debit ··· 4821',
    location: 'Pike St, Seattle WA',
  },
  {
    id: 'txn-3101',
    postedAt: '2026-07-01T18:24:00Z',
    merchant: 'Piatto Trattoria',
    descriptor: 'PIATTO TRATTORIA SEATTLE',
    category: 'dining',
    amountCents: -5430,
    status: 'pending',
    method: 'Visa debit ··· 4821',
    location: 'Ballard Ave, Seattle WA',
  },
  {
    id: 'txn-3016',
    postedAt: '2026-07-01T10:12:00Z',
    merchant: 'Cloudpine Storage',
    descriptor: 'CLOUDPINE.COM MEMBERSHIP',
    category: 'utilities',
    amountCents: -1199,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Online subscription',
  },
  {
    id: 'txn-3015',
    postedAt: '2026-06-30T07:58:00Z',
    merchant: 'Metro Fiber Internet',
    descriptor: 'METROFIBER AUTOPAY JUN',
    category: 'utilities',
    amountCents: -7999,
    status: 'posted',
    method: 'Autopay · ACH',
    location: 'Recurring bill',
  },
  {
    id: 'txn-3014',
    postedAt: '2026-06-29T09:37:00Z',
    merchant: 'Hearthstone Coffee Roasters',
    descriptor: 'HEARTHSTONE COFFEE #12',
    category: 'dining',
    amountCents: -940,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Pike St, Seattle WA',
  },
  {
    id: 'txn-3013',
    postedAt: '2026-06-27T16:55:00Z',
    merchant: 'Ridgeline Climbing Gym',
    descriptor: 'RIDGELINE CLIMBING MO DUES',
    category: 'health',
    amountCents: -7500,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Fremont Ave, Seattle WA',
  },
  {
    id: 'txn-3012',
    postedAt: '2026-06-26T11:19:00Z',
    merchant: 'Northwind Outfitters',
    descriptor: 'NORTHWIND OUTFITTERS REFUND',
    category: 'shopping',
    amountCents: 4999,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Return · REI Way, Seattle WA',
  },
  {
    id: 'txn-3011',
    postedAt: '2026-06-25T08:41:00Z',
    merchant: 'Greenleaf Market',
    descriptor: 'GREENLEAF MKT #204',
    category: 'groceries',
    amountCents: -11207,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Stone Way N, Seattle WA',
  },
  {
    id: 'txn-3010',
    postedAt: '2026-06-24T19:08:00Z',
    merchant: 'Piatto Trattoria',
    descriptor: 'PIATTO TRATTORIA SEATTLE',
    category: 'dining',
    amountCents: -6894,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Ballard Ave, Seattle WA',
  },
  {
    id: 'txn-3009',
    postedAt: '2026-06-23T13:26:00Z',
    merchant: 'Lakeside Pharmacy',
    descriptor: 'LAKESIDE PHARM 0042',
    category: 'health',
    amountCents: -2718,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Green Lake Dr, Seattle WA',
  },
  {
    id: 'txn-3008',
    postedAt: '2026-06-21T09:02:00Z',
    merchant: 'Transfer to High-Yield Savings',
    descriptor: 'INTERNAL XFER TO SAV ··· 0913',
    category: 'transfer',
    amountCents: -50000,
    status: 'posted',
    method: 'Internal transfer',
    location: 'Scheduled online',
  },
  {
    id: 'txn-3007',
    postedAt: '2026-06-20T10:44:00Z',
    merchant: 'Northwind Outfitters',
    descriptor: 'NORTHWIND OUTFITTERS SEATTLE',
    category: 'shopping',
    amountCents: -21389,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'REI Way, Seattle WA',
  },
  {
    id: 'txn-3006',
    postedAt: '2026-06-19T20:15:00Z',
    merchant: 'Marquee Cinemas',
    descriptor: 'MARQUEE CINEMAS 0117',
    category: 'entertainment',
    amountCents: -3150,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Downtown, Seattle WA',
  },
  {
    id: 'txn-3005',
    postedAt: '2026-06-18T07:30:00Z',
    merchant: 'City Power & Light',
    descriptor: 'CITY PWR LT AUTOPAY JUN',
    category: 'utilities',
    amountCents: -12863,
    status: 'posted',
    method: 'Autopay · ACH',
    location: 'Recurring bill',
  },
  {
    id: 'txn-3004',
    postedAt: '2026-06-17T12:05:00Z',
    merchant: 'Café Basalt',
    descriptor: 'CAFE BASALT SEATTLE',
    category: 'dining',
    amountCents: -1475,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Capitol Hill, Seattle WA',
  },
  {
    id: 'txn-3003',
    postedAt: '2026-06-16T08:12:00Z',
    merchant: 'Sound Transit',
    descriptor: 'ORCA CARD RELOAD',
    category: 'transport',
    amountCents: -4200,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Transit reload · online',
  },
  {
    id: 'txn-3002',
    postedAt: '2026-06-15T18:47:00Z',
    merchant: 'Greenleaf Market',
    descriptor: 'GREENLEAF MKT #204',
    category: 'groceries',
    amountCents: -8642,
    status: 'posted',
    method: 'Visa debit ··· 4821',
    location: 'Stone Way N, Seattle WA',
  },
  {
    id: 'txn-3001',
    postedAt: '2026-06-15T09:32:00Z',
    merchant: 'Meridian Labs Payroll',
    descriptor: 'MERIDIAN LABS DIR DEP',
    category: 'income',
    amountCents: 245820,
    status: 'posted',
    method: 'Direct deposit',
    location: 'Employer ACH',
  },
];

// Rows already ticked off against the paper statement when the page loads,
// so the reconciliation bar starts mid-progress.
const INITIAL_RECONCILED_IDS = [
  'txn-3001',
  'txn-3002',
  'txn-3003',
  'txn-3004',
  'txn-3005',
  'txn-3006',
  'txn-3007',
  'txn-3008',
];

const INITIAL_NOTES: Record<string, string> = {
  'txn-3007': 'Tent and stove for the July trip - split with Sam, owes half.',
  'txn-3008': 'Monthly savings sweep. Bump to $600 after the car loan clears.',
};

const INITIAL_RECEIPT_IDS = ['txn-3005', 'txn-3007'];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

/** $1,234.56 — explicit locale so output never depends on the runtime. */
function formatCents(cents: number): string {
  const dollars = (Math.abs(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${cents < 0 ? '-' : ''}$${dollars}`;
}

/** Signed form for the amount column: +$49.99 / -$213.89. */
function formatSignedCents(cents: number): string {
  return `${cents < 0 ? '-' : '+'}$${(Math.abs(cents) / 100).toLocaleString(
    'en-US',
    {minimumFractionDigits: 2, maximumFractionDigits: 2},
  )}`;
}

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/** "Jul 1" from an ISO string via pure string slicing — timezone-proof. */
function formatShortDate(iso: string): string {
  const month = MONTH_SHORT[Number(iso.slice(5, 7)) - 1];
  return `${month} ${Number(iso.slice(8, 10))}`;
}

/** Initials for the merchant gradient tile: "Greenleaf Market" -> "GM". */
function merchantInitials(name: string): string {
  const words = name
    .split(' ')
    .filter(word => /^[A-Za-z]/.test(word))
    .slice(0, 2);
  return words.map(word => word[0].toUpperCase()).join('');
}

// ---------------------------------------------------------------------------
// LEDGER TABLE
// ---------------------------------------------------------------------------

function GroupHeaderRow({
  icon,
  label,
  hint,
  colCount,
}: {
  icon: typeof ClockIcon;
  label: string;
  hint: string;
  colCount: number;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colCount} style={styles.groupCell}>
        <HStack gap={2} vAlign="center">
          <Icon icon={icon} size="sm" />
          <Text type="label">{label}</Text>
          <Text type="supporting" color="secondary">
            {hint}
          </Text>
        </HStack>
      </TableCell>
    </TableRow>
  );
}

function LedgerRow({
  txn,
  balanceCents,
  isSelected,
  isReconciled,
  isCompact,
  isPhone,
  onSelect,
  onToggleReconciled,
}: {
  txn: Transaction;
  balanceCents: number | null;
  isSelected: boolean;
  isReconciled: boolean;
  isCompact: boolean;
  isPhone: boolean;
  onSelect: (id: string) => void;
  onToggleReconciled: (id: string, checked: boolean) => void;
}) {
  const meta = CATEGORY_META[txn.category];
  const isCredit = txn.amountCents > 0;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(txn.id);
    }
  };

  return (
    <TableRow
      tabIndex={0}
      aria-selected={isSelected}
      onClick={() => onSelect(txn.id)}
      onKeyDown={handleKeyDown}
      style={isSelected ? styles.rowSelected : styles.row}>
      {/* Reconcile checkbox — clicks stay in the cell so ticking a box
          never also opens the detail panel. Pending rows show a clock
          glyph instead: they cannot clear until the bank posts them. */}
      <TableCell>
        {txn.status === 'posted' ? (
          <div
            onClick={event => event.stopPropagation()}
            onKeyDown={event => event.stopPropagation()}>
            <CheckboxInput
              label={`Reconcile ${txn.merchant} ${formatSignedCents(txn.amountCents)}`}
              isLabelHidden
              value={isReconciled}
              onChange={checked => onToggleReconciled(txn.id, checked)}
            />
          </div>
        ) : (
          <div
            style={styles.pendingGlyph}
            role="img"
            aria-label="Pending — cannot be reconciled yet">
            <Icon icon={ClockIcon} size="sm" />
          </div>
        )}
      </TableCell>
      {!isPhone && (
        <TableCell>
          <Timestamp value={txn.postedAt} format="date" />
        </TableCell>
      )}
      <TableCell scope="row">
        <VStack gap={0.5}>
          <HStack gap={2} vAlign="center">
            <Text type="body" maxLines={1}>
              {txn.merchant}
            </Text>
            <Token size="sm" color={meta.color} label={meta.label} />
          </HStack>
          <Text type="supporting" color="secondary" maxLines={1}>
            {isPhone
              ? `${formatShortDate(txn.postedAt)} · ${txn.descriptor}`
              : txn.descriptor}
          </Text>
        </VStack>
      </TableCell>
      <TableCell style={styles.numericCell}>
        <Text
          type="body"
          weight="medium"
          hasTabularNumbers
          style={isCredit ? styles.creditAmount : undefined}>
          {formatSignedCents(txn.amountCents)}
        </Text>
      </TableCell>
      {!isCompact && (
        <TableCell style={styles.numericCell}>
          {balanceCents === null ? (
            <Text type="body" color="secondary" hasTabularNumbers>
              —
            </Text>
          ) : (
            <Text type="body" color="secondary" hasTabularNumbers>
              {formatCents(balanceCents)}
            </Text>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}

function LedgerTable({
  pending,
  posted,
  balances,
  reconciledIds,
  selectedId,
  isCompact,
  isPhone,
  onSelect,
  onToggleReconciled,
}: {
  pending: Transaction[];
  posted: Transaction[];
  balances: Map<string, number>;
  reconciledIds: Set<string>;
  selectedId: string | null;
  isCompact: boolean;
  isPhone: boolean;
  onSelect: (id: string) => void;
  onToggleReconciled: (id: string, checked: boolean) => void;
}) {
  // reconcile + merchant + amount always render; date drops on phones and
  // the running balance drops at <=768px.
  const colCount = 3 + (isPhone ? 0 : 1) + (isCompact ? 0 : 1);

  if (pending.length === 0 && posted.length === 0) {
    return (
      <div style={styles.detail}>
        <EmptyState
          isCompact
          icon={<Icon icon={SearchXIcon} size="lg" />}
          title="No matching transactions"
          description="Try a different search, or clear the category and date filters."
        />
      </div>
    );
  }

  const renderRow = (txn: Transaction) => (
    <LedgerRow
      key={txn.id}
      txn={txn}
      balanceCents={balances.get(txn.id) ?? null}
      isSelected={txn.id === selectedId}
      isReconciled={reconciledIds.has(txn.id)}
      isCompact={isCompact}
      isPhone={isPhone}
      onSelect={onSelect}
      onToggleReconciled={onToggleReconciled}
    />
  );

  return (
    <Table density="compact" dividers="rows" hasHover>
      <TableHeader>
        <TableRow isHeaderRow>
          <TableHeaderCell scope="col" style={{width: 52}}>
            Cleared
          </TableHeaderCell>
          {!isPhone && (
            <TableHeaderCell scope="col" style={{width: 110}}>
              Date
            </TableHeaderCell>
          )}
          <TableHeaderCell scope="col">Merchant</TableHeaderCell>
          <TableHeaderCell
            scope="col"
            style={{...styles.numericHeader, width: 110}}>
            Amount
          </TableHeaderCell>
          {!isCompact && (
            <TableHeaderCell
              scope="col"
              style={{...styles.numericHeader, width: 122}}>
              Balance
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {pending.length > 0 && (
          <GroupHeaderRow
            icon={ClockIcon}
            label={`Pending (${pending.length})`}
            hint="Not yet included in the running balance"
            colCount={colCount}
          />
        )}
        {pending.map(renderRow)}
        {posted.length > 0 && (
          <GroupHeaderRow
            icon={CheckCircle2Icon}
            label={`Posted (${posted.length})`}
            hint={STATEMENT_LABEL}
            colCount={colCount}
          />
        )}
        {posted.map(renderRow)}
      </TableBody>
    </Table>
  );
}

// ---------------------------------------------------------------------------
// RECONCILIATION SUMMARY BAR
// ---------------------------------------------------------------------------

function ReconcileBar({
  reconciledCount,
  postedCount,
  clearedBalanceCents,
  statementBalanceCents,
  isCompact,
  onReconcileAll,
  onClearAll,
}: {
  reconciledCount: number;
  postedCount: number;
  clearedBalanceCents: number;
  statementBalanceCents: number;
  isCompact: boolean;
  onReconcileAll: () => void;
  onClearAll: () => void;
}) {
  const differenceCents = statementBalanceCents - clearedBalanceCents;
  const isBalanced = differenceCents === 0 && postedCount > 0;
  const allReconciled = reconciledCount === postedCount && postedCount > 0;

  return (
    <div style={styles.reconcileBar}>
      <Toolbar
        label="Reconciliation summary"
        size="sm"
        gap={2}
        variant="section"
        dividers={['top']}
        startContent={
          <HStack gap={3} vAlign="center">
            <Text type="label" hasTabularNumbers>
              {isCompact
                ? `${reconciledCount}/${postedCount} cleared`
                : `${reconciledCount} of ${postedCount} posted reconciled`}
            </Text>
            {!isCompact && (
              <ProgressBar
                label="Reconciliation progress"
                isLabelHidden
                value={reconciledCount}
                max={Math.max(postedCount, 1)}
                variant={isBalanced ? 'success' : 'accent'}
                style={{width: 140}}
              />
            )}
          </HStack>
        }
        endContent={
          <HStack gap={2} vAlign="center">
            {!isCompact && (
              <Text type="supporting" color="secondary" hasTabularNumbers>
                Cleared {formatCents(clearedBalanceCents)} · Statement{' '}
                {formatCents(statementBalanceCents)}
              </Text>
            )}
            {isBalanced ? (
              <Badge variant="success" label="Reconciled" />
            ) : (
              <Badge
                variant="warning"
                label={`${formatCents(differenceCents)} off`}
              />
            )}
            {/* One toggle button: check every posted row, or start over.
                Icon-only on phones with the label kept in the tooltip. */}
            <Button
              label={allReconciled ? 'Clear all' : 'Reconcile all'}
              variant="secondary"
              size="sm"
              icon={
                <Icon
                  icon={allReconciled ? XIcon : CheckCircle2Icon}
                  size="sm"
                />
              }
              isIconOnly={isCompact}
              tooltip={
                isCompact
                  ? allReconciled
                    ? 'Clear all'
                    : 'Reconcile all'
                  : undefined
              }
              onClick={allReconciled ? onClearAll : onReconcileAll}
            />
          </HStack>
        }
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// TRANSACTION DETAIL (side panel)
// ---------------------------------------------------------------------------

function TransactionDetail({
  txn,
  balanceCents,
  isReconciled,
  note,
  hasReceipt,
  tapTargetStyle,
  onClose,
  isPhone,
  onCategoryChange,
  onToggleReconciled,
  onNoteChange,
  onAttachReceipt,
  onRemoveReceipt,
}: {
  txn: Transaction;
  balanceCents: number | null;
  isReconciled: boolean;
  note: string;
  hasReceipt: boolean;
  tapTargetStyle?: CSSProperties;
  onClose: () => void;
  isPhone: boolean;
  onCategoryChange: (id: string, category: Category) => void;
  onToggleReconciled: (id: string, checked: boolean) => void;
  onNoteChange: (id: string, note: string) => void;
  onAttachReceipt: (id: string) => void;
  onRemoveReceipt: (id: string) => void;
}) {
  const meta = CATEGORY_META[txn.category];
  const isCredit = txn.amountCents > 0;

  return (
    <VStack gap={4} style={styles.detail}>
      {/* Identity row: back/close affordance, merchant tile, amount. */}
      <HStack gap={3} vAlign="start">
        {isPhone && (
          <IconButton
            label="Back to register"
            tooltip="Back to register"
            size="sm"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onClose}
          />
        )}
        <div style={{...styles.merchantTile, background: meta.gradient}}>
          {merchantInitials(txn.merchant)}
        </div>
        <StackItem size="fill">
          <VStack gap={1}>
            <Heading level={2}>{txn.merchant}</Heading>
            <HStack gap={2} vAlign="center">
              <Token size="sm" color={meta.color} label={meta.label} />
              <Badge
                variant={txn.status === 'pending' ? 'warning' : 'success'}
                label={txn.status === 'pending' ? 'Pending' : 'Posted'}
              />
            </HStack>
          </VStack>
        </StackItem>
        {!isPhone && (
          <IconButton
            label="Close transaction details"
            tooltip="Close"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        )}
      </HStack>

      <HStack gap={2} vAlign="end">
        <Text
          type="large"
          weight="semibold"
          hasTabularNumbers
          style={isCredit ? styles.creditAmount : undefined}>
          {formatSignedCents(txn.amountCents)}
        </Text>
        {balanceCents !== null && (
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Balance after: {formatCents(balanceCents)}
          </Text>
        )}
      </HStack>

      {txn.status === 'posted' ? (
        <CheckboxInput
          label="Reconciled against the statement"
          description="Checked rows count toward the cleared balance below."
          value={isReconciled}
          onChange={checked => onToggleReconciled(txn.id, checked)}
        />
      ) : (
        <Text type="supporting" color="secondary">
          Pending authorization — this amount is held but not yet part of
          the running balance, so it cannot be reconciled.
        </Text>
      )}

      <Divider />

      <MetadataList columns="single" label={{position: 'start', width: 104}}>
        <MetadataListItem label="Date">
          <Timestamp value={txn.postedAt} format="date_time" />
        </MetadataListItem>
        <MetadataListItem label="Method">
          <Text type="body">{txn.method}</Text>
        </MetadataListItem>
        <MetadataListItem label="Location">
          <Text type="body">{txn.location}</Text>
        </MetadataListItem>
        <MetadataListItem label="Descriptor">
          <Text type="code">{txn.descriptor}</Text>
        </MetadataListItem>
        <MetadataListItem label="Reference">
          <Text type="code">{txn.id.toUpperCase()}</Text>
        </MetadataListItem>
      </MetadataList>

      <Divider />

      {/* Category editor — writes straight back into the register, so the
          Token in the table row updates immediately. */}
      <Selector
        label="Category"
        description="Recategorizing updates the row and future budget rollups."
        options={CATEGORY_OPTIONS}
        value={txn.category}
        onChange={next => onCategoryChange(txn.id, next as Category)}
        width="100%"
      />

      <Divider />

      <VStack gap={2}>
        <Heading level={3}>Receipt</Heading>
        {hasReceipt ? (
          <div style={styles.receiptAttached}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon={ReceiptIcon} size="sm" />
                <StackItem size="fill">
                  <Text type="label" maxLines={1}>
                    receipt-{txn.id}.jpg
                  </Text>
                </StackItem>
                <IconButton
                  label="Remove receipt"
                  tooltip="Remove receipt"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={Trash2Icon} size="sm" />}
                  onClick={() => onRemoveReceipt(txn.id)}
                />
              </HStack>
              {/* Stand-in for the scanned image: striped placeholder rules. */}
              <div style={styles.receiptRule} />
              <div style={{...styles.receiptRule, width: '72%'}} />
              <div style={{...styles.receiptRule, width: '48%'}} />
              <Text type="supporting" color="secondary">
                Scanned placeholder · matched to {formatCents(txn.amountCents)}
              </Text>
            </VStack>
          </div>
        ) : (
          <div style={styles.receiptEmpty}>
            <Icon icon={ReceiptIcon} size="lg" />
            <Text type="supporting" color="secondary">
              No receipt attached to this transaction.
            </Text>
            <Button
              label="Attach receipt"
              variant="secondary"
              size="sm"
              icon={<Icon icon={PaperclipIcon} size="sm" />}
              style={tapTargetStyle}
              onClick={() => onAttachReceipt(txn.id)}
            />
          </div>
        )}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Heading level={3}>Notes</Heading>
        <TextArea
          label={`Notes for ${txn.merchant}`}
          isLabelHidden
          placeholder="Add a private note - who it was for, what to remember at tax time..."
          value={note}
          onChange={next => onNoteChange(txn.id, next)}
          rows={3}
          width="100%"
        />
        <Text type="supporting" color="secondary">
          Notes are private to this account and saved as you type.
        </Text>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TransactionsLedgerTemplate() {
  // The register is state because the detail panel edits categories.
  const [transactions, setTransactions] =
    useState<Transaction[]>(TRANSACTIONS);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reconciledIds, setReconciledIds] = useState<Set<string>>(
    () => new Set(INITIAL_RECONCILED_IDS),
  );
  const [notes, setNotes] = useState<Record<string, string>>(INITIAL_NOTES);
  const [receiptIds, setReceiptIds] = useState<Set<string>>(
    () => new Set(INITIAL_RECEIPT_IDS),
  );
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract: <=1024px drops the end panel and stacks the
  // detail below the table; <=768px hides the running-balance column;
  // <=640px goes single-pane and drops the date column.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  // <=640px: sm buttons (28px) are too short to tap; grow primary actions
  // to ~40px touch targets while keeping the sm type scale.
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  // Running balances accumulate over posted rows in chronological order
  // from the fixed opening balance. Pending rows never enter the map.
  const balances = useMemo(() => {
    const map = new Map<string, number>();
    const postedAscending = transactions
      .filter(txn => txn.status === 'posted')
      .slice()
      .sort((a, b) => (a.postedAt < b.postedAt ? -1 : 1));
    let running = OPENING_BALANCE_CENTS;
    for (const txn of postedAscending) {
      running += txn.amountCents;
      map.set(txn.id, running);
    }
    return map;
  }, [transactions]);

  const postedTransactions = useMemo(
    () => transactions.filter(txn => txn.status === 'posted'),
    [transactions],
  );

  // Header readouts: current = opening + all posted; available subtracts
  // pending debit holds (pending credits do not count until they post).
  const currentBalanceCents =
    OPENING_BALANCE_CENTS +
    postedTransactions.reduce((sum, txn) => sum + txn.amountCents, 0);
  const pendingHoldCents = transactions
    .filter(txn => txn.status === 'pending' && txn.amountCents < 0)
    .reduce((sum, txn) => sum + txn.amountCents, 0);
  const availableBalanceCents = currentBalanceCents + pendingHoldCents;

  // Reconciliation math always covers the full register (never the
  // filtered view): cleared = opening + reconciled amounts; the statement
  // balance is what the bank says the account holds today.
  const clearedBalanceCents =
    OPENING_BALANCE_CENTS +
    postedTransactions
      .filter(txn => reconciledIds.has(txn.id))
      .reduce((sum, txn) => sum + txn.amountCents, 0);

  // Search + category + month filters compose over the visible register.
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return transactions.filter(txn => {
      if (categoryFilter !== 'all' && txn.category !== categoryFilter) {
        return false;
      }
      if (dateFilter !== 'all' && !txn.postedAt.startsWith(dateFilter)) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return [
        txn.merchant,
        txn.descriptor,
        CATEGORY_META[txn.category].label,
        formatSignedCents(txn.amountCents),
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [transactions, query, categoryFilter, dateFilter]);

  const visiblePending = visible.filter(txn => txn.status === 'pending');
  const visiblePosted = visible.filter(txn => txn.status === 'posted');

  const selected = transactions.find(txn => txn.id === selectedId) ?? null;

  const toggleReconciled = (id: string, checked: boolean) => {
    const txn = transactions.find(candidate => candidate.id === id);
    // Compute the next set outside the updater so the aria-live
    // announcement is a plain event-handler side effect.
    const next = new Set(reconciledIds);
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    setReconciledIds(next);
    setAnnouncement(
      `${txn?.merchant ?? 'Transaction'} marked ${
        checked ? 'reconciled' : 'unreconciled'
      } — ${next.size} of ${postedTransactions.length} cleared`,
    );
  };

  const reconcileAll = () => {
    setReconciledIds(new Set(postedTransactions.map(txn => txn.id)));
    setAnnouncement(
      `All ${postedTransactions.length} posted transactions marked reconciled`,
    );
  };

  const clearAllReconciled = () => {
    setReconciledIds(new Set());
    setAnnouncement('Reconciliation cleared — 0 transactions marked');
  };

  const changeCategory = (id: string, category: Category) => {
    setTransactions(prev =>
      prev.map(txn => (txn.id === id ? {...txn, category} : txn)),
    );
    setAnnouncement(`Category changed to ${CATEGORY_META[category].label}`);
  };

  const changeNote = (id: string, note: string) => {
    setNotes(prev => ({...prev, [id]: note}));
  };

  const attachReceipt = (id: string) => {
    setReceiptIds(prev => new Set(prev).add(id));
    setAnnouncement('Receipt placeholder attached');
  };

  const removeReceipt = (id: string) => {
    setReceiptIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setAnnouncement('Receipt removed');
  };

  const detail =
    selected === null ? null : (
      <TransactionDetail
        txn={selected}
        balanceCents={balances.get(selected.id) ?? null}
        isReconciled={reconciledIds.has(selected.id)}
        note={notes[selected.id] ?? ''}
        hasReceipt={receiptIds.has(selected.id)}
        tapTargetStyle={tapTargetStyle}
        onClose={() => setSelectedId(null)}
        isPhone={isPhone}
        onCategoryChange={changeCategory}
        onToggleReconciled={toggleReconciled}
        onNoteChange={changeNote}
        onAttachReceipt={attachReceipt}
        onRemoveReceipt={removeReceipt}
      />
    );

  const ledger = (
    <LedgerTable
      pending={visiblePending}
      posted={visiblePosted}
      balances={balances}
      reconciledIds={reconciledIds}
      selectedId={selectedId}
      isCompact={isCompact}
      isPhone={isPhone}
      onSelect={setSelectedId}
      onToggleReconciled={toggleReconciled}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <VStack gap={3}>
            {/* Title row — balances and the export action wrap under the
                heading on phones instead of clipping. */}
            <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
              <StackItem size="fill">
                <VStack gap={0.5}>
                  <Heading level={1}>Transactions</Heading>
                  <Text type="supporting" color="secondary">
                    {ACCOUNT_LABEL}
                  </Text>
                </VStack>
              </StackItem>
              <VStack gap={0} hAlign={isPhone ? 'start' : 'end'}>
                <Text type="supporting" color="secondary">
                  Current
                </Text>
                <Text type="label" hasTabularNumbers>
                  {formatCents(currentBalanceCents)}
                </Text>
              </VStack>
              <VStack gap={0} hAlign={isPhone ? 'start' : 'end'}>
                <Text type="supporting" color="secondary">
                  Available
                </Text>
                <Text type="label" hasTabularNumbers>
                  {formatCents(availableBalanceCents)}
                </Text>
              </VStack>
              <Button
                label="Export"
                variant="secondary"
                size="sm"
                icon={<Icon icon={DownloadIcon} size="sm" />}
                style={tapTargetStyle}
              />
            </HStack>
            {/* Filter row — search plus category/month Selectors; wraps and
                stretches full-width on phones. */}
            <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
              <StackItem size="fill">
                <TextInput
                  label="Search transactions"
                  isLabelHidden
                  size="sm"
                  width="100%"
                  placeholder="Search merchant, descriptor, amount..."
                  startIcon={<Icon icon={SearchIcon} size="sm" />}
                  value={query}
                  onChange={setQuery}
                  hasClear
                />
              </StackItem>
              <Selector
                label="Category filter"
                isLabelHidden
                size="sm"
                options={CATEGORY_FILTER_OPTIONS}
                value={categoryFilter}
                onChange={setCategoryFilter}
                width={isPhone ? '100%' : 170}
              />
              <Selector
                label="Date filter"
                isLabelHidden
                size="sm"
                options={DATE_FILTER_OPTIONS}
                value={dateFilter}
                onChange={setDateFilter}
                width={isPhone ? '100%' : 150}
              />
            </HStack>
          </VStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentFill}>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
            <div style={styles.scrollRegion}>
              {isPhone && detail !== null ? (
                // Single-pane: the detail pane replaces the register and
                // its back IconButton returns to the table.
                detail
              ) : (
                <>
                  {ledger}
                  {isNarrow && !isPhone && detail !== null && (
                    <>
                      <Divider />
                      {detail}
                    </>
                  )}
                </>
              )}
            </div>
            {/* Summary bar stays pinned below the scroller in every mode
                except the phone detail view, where reconciling happens
                through the pane's own checkbox. */}
            {!(isPhone && detail !== null) && (
              <ReconcileBar
                reconciledCount={reconciledIds.size}
                postedCount={postedTransactions.length}
                clearedBalanceCents={clearedBalanceCents}
                statementBalanceCents={currentBalanceCents}
                isCompact={isPhone}
                onReconcileAll={reconcileAll}
                onClearAll={clearAllReconciled}
              />
            )}
          </div>
        </LayoutContent>
      }
      end={
        isNarrow || detail === null ? undefined : (
          <LayoutPanel
            width={380}
            padding={0}
            hasDivider
            label="Transaction details">
            <div style={styles.detailScroll}>{detail}</div>
          </LayoutPanel>
        )
      }
    />
  );
}
