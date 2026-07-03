var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file payout-statements.tsx
 * @input Deterministic fixtures only (marketplace seller payouts for
 *   "Alpine Goods Marketplace": eight bi-monthly statements PO-2026-0020
 *   through PO-2026-0027 with fixed gross/fee/refund/adjustment cents and
 *   fixed ISO initiation/arrival dates, plus three destination bank
 *   accounts with gradient tile marks). No Date.now(), Math.random(), or
 *   network assets — currency strings come from a local pure cents
 *   formatter, never locale APIs.
 * @output Marketplace payouts console: a statements-by-period master
 *   Table filtered by a Paid / In transit / Upcoming SegmentedControl,
 *   whose selected row populates a detail pane with a gross-to-net fee
 *   breakdown rendered as a waterfall of styled bars (gross, platform
 *   fee, refunds, adjustments, net), a MetadataList of payout facts, and
 *   per-statement CSV/PDF downloads; below the table sits a payout
 *   destinations List with a default Badge and a working "Set default"
 *   action. Every export action confirms via Toast.
 * @position Page template; emitted by \`astryx template payout-statements\`
 *
 * Frame: header | statements table + destinations (fill) | statement
 * detail panel 420 (end).
 *
 * Container policy (finance-console archetype): the master list is flat
 * Table rows and the destinations are flat List rows — no Cards — so the
 * page reads as one dense operator tool. The only "chrome" objects are
 * the 36px gradient bank tiles (styled placeholders standing in for bank
 * logos) and the waterfall tracks, which are plain muted divs so the
 * bars carry the meaning.
 *
 * Selection contract: useState holds the selected statement id, seeded
 * with the first fixture row so the detail pane is never empty. Rows are
 * reachable by keyboard (tabIndex 0, Enter/Space select) and carry
 * aria-selected. When the status filter hides the stored selection the
 * pane falls back to the first visible row without discarding the stored
 * id, so switching back to "All" restores it.
 *
 * Responsive contract:
 * - > 1024px: table + destinations keep the full remaining width; the
 *   statement detail is a fixed 420px LayoutPanel on the end edge with
 *   its own vertical scroll.
 * - <= 1024px: the end panel is dropped; the detail section renders
 *   between the table and the destinations list inside one shared
 *   vertical scroller (index-on-top pattern), so nothing becomes
 *   unreachable.
 * - <= 768px: the Fees and Arrival table columns are hidden so the
 *   remaining columns keep readable widths at tablet sizes; both figures
 *   stay reachable through the detail pane's waterfall and MetadataList.
 * - <= 640px: the header wraps — the status SegmentedControl and the
 *   Export CSV button drop to a second row under the title instead of
 *   clipping; sm buttons (28px) grow to ~40px tap targets (export,
 *   set-default, add-account); the waterfall switches from a
 *   label | track | amount grid to label-and-amount stacked above each
 *   full-width track so bars stay legible at 375px. All actions are
 *   always-visible buttons — nothing is hover-only, so every affordance
 *   works by tap or focus.
 * - The waterfall bars are percentage-scaled against gross, so they
 *   shrink fluidly and the page never scrolls sideways at 375px; the
 *   table handles narrow widths by dropping columns (above) rather than
 *   by horizontal panning.
 *
 * Color policy: token-pure everywhere except the 36px bank tiles, which
 * are scheme-locked brand art — literal gradient stops (ACCOUNTS[*].tint)
 * plus a literal white glyph, with colorScheme pinned to 'light' in
 * styles.bankTile so the bank-logo placeholders render identically in
 * light and dark mode (real bank marks would not recolor either). Every
 * other surface (rows, waterfall rails/bars, selection wash) uses
 * var(--color-*) tokens and adapts via the theme's light-dark() values.
 */

import {useMemo, useState, type CSSProperties, type KeyboardEvent} from 'react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '@astryxdesign/core/Table';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {useToast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  LandmarkIcon,
  PlusIcon,
} from 'lucide-react';

// ============= STYLES =============
// Plain inline styles using Astryx design-token CSS variables (declared at
// :root by \`@astryxdesign/core/astryx.css\`). No StyleX compiler required.

const styles: Record<string, CSSProperties> = {
  contentFill: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  // Wide: only this region scrolls (table + destinations); narrow: it also
  // hosts the stacked detail between the two.
  scrollRegion: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  headerRow: {
    width: '100%',
  },
  row: {
    cursor: 'pointer',
  },
  rowSelected: {
    cursor: 'pointer',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Money columns use tabular numerals so figures digit-align down the page.
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
  },
  numericHeader: {
    textAlign: 'end',
  },
  numeric: {
    fontVariantNumeric: 'tabular-nums',
  },
  detail: {
    padding: 'var(--spacing-4)',
  },
  sectionPad: {
    padding: 'var(--spacing-4)',
  },
  // ~40px touch targets on phones (size="sm" renders 28px).
  buttonTapTarget: {height: 40},

  // ---- waterfall ----
  // Desktop row: fixed label column | flexible track | fixed amount column.
  wfLabel: {
    width: 156,
    flexShrink: 0,
  },
  wfAmount: {
    width: 104,
    flexShrink: 0,
    textAlign: 'end',
  },
  // The track is a muted rail; each bar is absolutely positioned inside it
  // at a start/width percentage of gross, so deductions visually "hang"
  // from where the running balance left off (a true waterfall bridge).
  wfTrack: {
    position: 'relative',
    height: 22,
    borderRadius: 'var(--radius-control, 6px)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    flex: 1,
    minWidth: 0,
  },
  wfBar: {
    position: 'absolute',
    insetBlock: 0,
    borderRadius: 'var(--radius-control, 6px)',
    // Tiny non-zero segments stay visible instead of rounding to nothing.
    minWidth: 3,
  },
  // Phone: label + amount share a line above the full-width track.
  wfPhoneMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 'var(--spacing-2)',
  },

  // ---- destinations ----
  // 36px gradient tile stands in for a bank logo (no network assets).
  // Scheme-locked brand art (see Color policy above): the gradient fixture
  // stops and this white glyph are intentional literals, with colorScheme
  // pinned so the tile never flips in dark mode.
  bankTile: {
    width: 36,
    height: 36,
    borderRadius: 'var(--radius-control, 6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    colorScheme: 'light',
    flexShrink: 0,
  },
};

// Waterfall bar colors: additions accent/success, deductions error.
const BAR_COLOR = {
  gross: 'var(--color-accent)',
  deduction: 'var(--color-error)',
  credit: 'var(--color-success)',
  net: 'var(--color-success)',
} as const;

// ============= DATA =============

type PayoutStatus = 'paid' | 'in_transit' | 'upcoming';
type StatusFilter = 'all' | PayoutStatus;

interface PayoutStatement {
  id: string;
  /** Human period label, e.g. "Jun 16 – Jun 30, 2026". */
  periodLabel: string;
  status: PayoutStatus;
  /** All money fields are integer cents; net is derived, never stored. */
  grossCents: number;
  /** Platform fee (10% of gross for this marketplace tier). */
  platformFeeCents: number;
  /** Buyer refunds clawed back from this period's earnings. */
  refundsCents: number;
  /** Signed: positive = credit (fee reversal), negative = debit (chargeback). */
  adjustmentsCents: number;
  adjustmentsNote: string;
  ordersCount: number;
  destinationId: string;
  /** Absent while the payout has not been initiated yet (upcoming). */
  initiatedAt?: string;
  /** Paid: actual arrival. In transit / upcoming: expected arrival. */
  arrivalAt: string;
}

interface PayoutAccount {
  id: string;
  bankName: string;
  nickname: string;
  last4: string;
  currency: string;
  addedOn: string;
  /**
   * Gradient placeholder standing in for a bank logo. Intentional literal
   * hex stops — scheme-locked brand art rendered on styles.bankTile, which
   * pins colorScheme (see the Color policy in the header comment).
   */
  tint: string;
}

const STATUS_META: Record<
  PayoutStatus,
  {label: string; dot: 'neutral' | 'accent' | 'success'; token: 'gray' | 'blue' | 'green'}
> = {
  paid: {label: 'Paid', dot: 'success', token: 'green'},
  in_transit: {label: 'In transit', dot: 'accent', token: 'blue'},
  upcoming: {label: 'Upcoming', dot: 'neutral', token: 'gray'},
};

const FILTER_OPTIONS: Array<{value: StatusFilter; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'paid', label: 'Paid'},
  {value: 'in_transit', label: 'In transit'},
  {value: 'upcoming', label: 'Upcoming'},
];

// Deterministic fixtures: fixed ISO dates and integer cents, no clocks, no
// randomness. Newest period first; the platform fee is exactly 10% of gross
// in every row so the waterfall math is honest.
const STATEMENTS: PayoutStatement[] = [
  {
    id: 'PO-2026-0027',
    periodLabel: 'Jul 1 – Jul 15, 2026',
    status: 'upcoming',
    grossCents: 612_450,
    platformFeeCents: 61_245,
    refundsCents: 18_900,
    adjustmentsCents: 0,
    adjustmentsNote: 'No adjustments this period',
    ordersCount: 87,
    destinationId: 'acct-mercury',
    arrivalAt: '2026-07-21T00:00:00Z',
  },
  {
    id: 'PO-2026-0026',
    periodLabel: 'Jun 16 – Jun 30, 2026',
    status: 'in_transit',
    grossCents: 1_284_310,
    platformFeeCents: 128_431,
    refundsCents: 46_250,
    adjustmentsCents: 12_000,
    adjustmentsNote: 'Shipping label credit',
    ordersCount: 163,
    destinationId: 'acct-mercury',
    initiatedAt: '2026-07-02T09:00:00Z',
    arrivalAt: '2026-07-05T00:00:00Z',
  },
  {
    id: 'PO-2026-0025',
    periodLabel: 'Jun 1 – Jun 15, 2026',
    status: 'paid',
    grossCents: 1_141_820,
    platformFeeCents: 114_182,
    refundsCents: 89_400,
    adjustmentsCents: -21_500,
    adjustmentsNote: 'Chargeback (order #48112)',
    ordersCount: 149,
    destinationId: 'acct-mercury',
    initiatedAt: '2026-06-17T09:00:00Z',
    arrivalAt: '2026-06-20T00:00:00Z',
  },
  {
    id: 'PO-2026-0024',
    periodLabel: 'May 16 – May 31, 2026',
    status: 'paid',
    grossCents: 998_240,
    platformFeeCents: 99_824,
    refundsCents: 31_200,
    adjustmentsCents: 0,
    adjustmentsNote: 'No adjustments this period',
    ordersCount: 131,
    destinationId: 'acct-mercury',
    initiatedAt: '2026-06-02T09:00:00Z',
    arrivalAt: '2026-06-05T00:00:00Z',
  },
  {
    id: 'PO-2026-0023',
    periodLabel: 'May 1 – May 15, 2026',
    status: 'paid',
    grossCents: 1_076_900,
    platformFeeCents: 107_690,
    refundsCents: 52_480,
    adjustmentsCents: 8_750,
    adjustmentsNote: 'Platform fee reversal',
    ordersCount: 142,
    destinationId: 'acct-mercury',
    initiatedAt: '2026-05-18T09:00:00Z',
    arrivalAt: '2026-05-21T00:00:00Z',
  },
  {
    id: 'PO-2026-0022',
    periodLabel: 'Apr 16 – Apr 30, 2026',
    status: 'paid',
    grossCents: 887_140,
    platformFeeCents: 88_714,
    refundsCents: 12_300,
    adjustmentsCents: 0,
    adjustmentsNote: 'No adjustments this period',
    ordersCount: 118,
    destinationId: 'acct-mercury',
    initiatedAt: '2026-05-04T09:00:00Z',
    arrivalAt: '2026-05-07T00:00:00Z',
  },
  {
    id: 'PO-2026-0021',
    periodLabel: 'Apr 1 – Apr 15, 2026',
    status: 'paid',
    grossCents: 934_610,
    platformFeeCents: 93_461,
    refundsCents: 40_120,
    adjustmentsCents: -5_400,
    adjustmentsNote: 'Dispute fee (order #46007)',
    ordersCount: 121,
    destinationId: 'acct-firstfed',
    initiatedAt: '2026-04-17T09:00:00Z',
    arrivalAt: '2026-04-20T00:00:00Z',
  },
  {
    id: 'PO-2026-0020',
    periodLabel: 'Mar 16 – Mar 31, 2026',
    status: 'paid',
    grossCents: 1_210_330,
    platformFeeCents: 121_033,
    refundsCents: 66_800,
    adjustmentsCents: 0,
    adjustmentsNote: 'No adjustments this period',
    ordersCount: 158,
    destinationId: 'acct-firstfed',
    initiatedAt: '2026-04-02T09:00:00Z',
    arrivalAt: '2026-04-06T00:00:00Z',
  },
];

const ACCOUNTS: PayoutAccount[] = [
  {
    id: 'acct-mercury',
    bankName: 'Mercury Checking',
    nickname: 'Primary operating',
    last4: '4821',
    currency: 'USD',
    addedOn: '2024-11-03T00:00:00Z',
    tint: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  },
  {
    id: 'acct-firstfed',
    bankName: 'First Federal Savings',
    nickname: 'Operating reserve',
    last4: '9034',
    currency: 'USD',
    addedOn: '2025-06-14T00:00:00Z',
    tint: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
  },
  {
    id: 'acct-wise',
    bankName: 'Wise Business',
    nickname: 'EUR settlements',
    last4: '2210',
    currency: 'EUR',
    addedOn: '2026-02-08T00:00:00Z',
    tint: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
  },
];

// ============= HELPERS =============
// Pure local money helpers — no Intl/locale APIs, so output is identical in
// every environment.

function netCents(statement: PayoutStatement): number {
  return (
    statement.grossCents -
    statement.platformFeeCents -
    statement.refundsCents +
    statement.adjustmentsCents
  );
}

/** 1_121_629 -> "$11,216.29"; -21_500 -> "-$215.00". */
function formatUSD(cents: number): string {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const dollars = String(Math.floor(abs / 100)).replace(
    /\\B(?=(\\d{3})+(?!\\d))/g,
    ',',
  );
  const fraction = String(abs % 100).padStart(2, '0');
  return \`\${sign}$\${dollars}.\${fraction}\`;
}

/** Deltas keep an explicit sign so the waterfall column reads as math. */
function formatDelta(cents: number): string {
  if (cents === 0) {
    return '$0.00';
  }
  return cents > 0 ? \`+\${formatUSD(cents)}\` : formatUSD(cents);
}

function accountById(id: string): PayoutAccount {
  return ACCOUNTS.find(account => account.id === id) ?? ACCOUNTS[0];
}

function accountLabel(account: PayoutAccount): string {
  return \`\${account.bankName} ••\${account.last4}\`;
}

// ============= WATERFALL =============

interface WaterfallRow {
  key: string;
  label: string;
  /** Signed delta for steps; absolute value for the gross/net anchors. */
  amountCents: number;
  displayAmount: string;
  startPct: number;
  widthPct: number;
  color: string;
  /** Anchors (gross/net) render bold; steps render as line items. */
  isAnchor: boolean;
  note?: string;
}

/**
 * Builds the gross-to-net bridge. Anchor bars (gross, net) grow from zero;
 * each deduction/credit bar spans exactly the interval the running balance
 * moved through, so the bars visually "step down" from gross to net.
 */
function buildWaterfall(statement: PayoutStatement): WaterfallRow[] {
  const gross = statement.grossCents;
  const pct = (cents: number) => (cents / gross) * 100;

  const rows: WaterfallRow[] = [
    {
      key: 'gross',
      label: 'Gross earnings',
      amountCents: gross,
      displayAmount: formatUSD(gross),
      startPct: 0,
      widthPct: 100,
      color: BAR_COLOR.gross,
      isAnchor: true,
    },
  ];

  let running = gross;
  const steps = [
    {key: 'fee', label: 'Platform fee (10%)', delta: -statement.platformFeeCents},
    {key: 'refunds', label: 'Refunds', delta: -statement.refundsCents},
    {
      key: 'adjustments',
      label: 'Adjustments',
      delta: statement.adjustmentsCents,
      note: statement.adjustmentsNote,
    },
  ];
  for (const step of steps) {
    const next = running + step.delta;
    rows.push({
      key: step.key,
      label: step.label,
      amountCents: step.delta,
      displayAmount: formatDelta(step.delta),
      startPct: pct(Math.min(running, next)),
      widthPct: pct(Math.abs(step.delta)),
      color: step.delta > 0 ? BAR_COLOR.credit : BAR_COLOR.deduction,
      isAnchor: false,
      note: step.note,
    });
    running = next;
  }

  rows.push({
    key: 'net',
    label: 'Net payout',
    amountCents: running,
    displayAmount: formatUSD(running),
    startPct: 0,
    widthPct: pct(running),
    color: BAR_COLOR.net,
    isAnchor: true,
  });
  return rows;
}

function WaterfallChart({
  statement,
  isPhone,
}: {
  statement: PayoutStatement;
  isPhone: boolean;
}) {
  const rows = buildWaterfall(statement);

  return (
    <VStack gap={isPhone ? 3 : 2}>
      {rows.map(row => {
        const amount = (
          <Text
            type={row.isAnchor ? 'label' : 'body'}
            color={row.isAnchor ? undefined : 'secondary'}
            style={styles.numeric}>
            {row.displayAmount}
          </Text>
        );
        const label = (
          <Text
            type={row.isAnchor ? 'label' : 'body'}
            color={row.isAnchor ? undefined : 'secondary'}
            maxLines={1}>
            {row.label}
          </Text>
        );
        // Zero deltas keep their row (constant shape scans better across
        // statements) but render an empty rail instead of a sliver bar.
        const bar = row.widthPct > 0 && (
          <div
            aria-hidden
            style={{
              ...styles.wfBar,
              insetInlineStart: \`\${row.startPct}%\`,
              width: \`\${row.widthPct}%\`,
              backgroundColor: row.color,
            }}
          />
        );

        if (isPhone) {
          // <=640px: label + amount stack above a full-width track so the
          // bars keep their scale at 375px without side columns.
          return (
            <VStack key={row.key} gap={1}>
              <div style={styles.wfPhoneMeta}>
                {label}
                {amount}
              </div>
              <div style={styles.wfTrack}>{bar}</div>
              {row.note !== undefined && row.amountCents !== 0 && (
                <Text type="supporting" color="secondary">
                  {row.note}
                </Text>
              )}
            </VStack>
          );
        }

        return (
          <VStack key={row.key} gap={0.5}>
            <HStack gap={3} vAlign="center">
              <div style={styles.wfLabel}>{label}</div>
              <div style={styles.wfTrack}>{bar}</div>
              <div style={styles.wfAmount}>{amount}</div>
            </HStack>
            {row.note !== undefined && row.amountCents !== 0 && (
              <HStack gap={3}>
                <div style={styles.wfLabel} />
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    {row.note}
                  </Text>
                </StackItem>
              </HStack>
            )}
          </VStack>
        );
      })}
      <Text type="supporting" color="secondary">
        Bars are scaled to this period's gross earnings.
      </Text>
    </VStack>
  );
}

// ============= MASTER TABLE =============

function StatementsTable({
  statements,
  selectedId,
  isCompact,
  onSelect,
}: {
  statements: PayoutStatement[];
  selectedId: string;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const handleRowKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(id);
    }
  };

  return (
    <Table density="compact" dividers="rows" hasHover>
      <TableHeader>
        <TableRow isHeaderRow>
          <TableHeaderCell scope="col">Statement</TableHeaderCell>
          <TableHeaderCell scope="col" style={{width: 130}}>
            Status
          </TableHeaderCell>
          <TableHeaderCell scope="col" style={{...styles.numericHeader, width: 110}}>
            Gross
          </TableHeaderCell>
          {!isCompact && (
            <TableHeaderCell
              scope="col"
              style={{...styles.numericHeader, width: 110}}>
              Fees & refunds
            </TableHeaderCell>
          )}
          <TableHeaderCell scope="col" style={{...styles.numericHeader, width: 110}}>
            Net
          </TableHeaderCell>
          {!isCompact && (
            <TableHeaderCell scope="col" style={{width: 130}}>
              Arrival
            </TableHeaderCell>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {statements.map(statement => {
          const isSelected = statement.id === selectedId;
          const status = STATUS_META[statement.status];
          // Everything between gross and net, folded into one column.
          const deductionsCents = netCents(statement) - statement.grossCents;
          return (
            <TableRow
              key={statement.id}
              tabIndex={0}
              aria-selected={isSelected}
              onClick={() => onSelect(statement.id)}
              onKeyDown={event => handleRowKeyDown(event, statement.id)}
              style={isSelected ? styles.rowSelected : styles.row}>
              <TableCell scope="row">
                <VStack gap={0.5}>
                  <Text type="body" maxLines={1}>
                    {statement.periodLabel}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {statement.id} · {statement.ordersCount} orders
                  </Text>
                </VStack>
              </TableCell>
              <TableCell>
                <HStack gap={2} vAlign="center">
                  <StatusDot
                    variant={status.dot}
                    label={status.label}
                    isPulsing={statement.status === 'in_transit'}
                  />
                  <Text type="body">{status.label}</Text>
                </HStack>
              </TableCell>
              <TableCell style={styles.numericCell}>
                <Text type="body">{formatUSD(statement.grossCents)}</Text>
              </TableCell>
              {!isCompact && (
                <TableCell style={styles.numericCell}>
                  <Text type="body" color="secondary">
                    {formatDelta(deductionsCents)}
                  </Text>
                </TableCell>
              )}
              <TableCell style={styles.numericCell}>
                <Text type="body">{formatUSD(netCents(statement))}</Text>
              </TableCell>
              {!isCompact && (
                <TableCell>
                  <VStack gap={0}>
                    <Timestamp value={statement.arrivalAt} format="date" />
                    {statement.status !== 'paid' && (
                      <Text type="supporting" color="secondary">
                        estimated
                      </Text>
                    )}
                  </VStack>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

// ============= DESTINATIONS =============

function DestinationsSection({
  defaultAccountId,
  tapTargetStyle,
  onSetDefault,
}: {
  defaultAccountId: string;
  tapTargetStyle?: CSSProperties;
  onSetDefault: (id: string) => void;
}) {
  return (
    <VStack gap={2} style={styles.sectionPad}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <VStack gap={0.5}>
            <Heading level={3}>Payout destinations</Heading>
            <Text type="supporting" color="secondary">
              New payouts settle to the default account. Switching the default
              never reroutes payouts already in transit.
            </Text>
          </VStack>
        </StackItem>
        <Button
          label="Add bank account"
          variant="secondary"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          style={tapTargetStyle}
        />
      </HStack>
      <List density="compact" hasDividers>
        {ACCOUNTS.map(account => {
          const isDefault = account.id === defaultAccountId;
          return (
            <ListItem
              key={account.id}
              label={accountLabel(account)}
              description={\`\${account.nickname} · \${account.currency} · verified\`}
              startContent={
                <div aria-hidden style={{...styles.bankTile, background: account.tint}}>
                  <Icon icon={LandmarkIcon} size="sm" />
                </div>
              }
              endContent={
                isDefault ? (
                  <Badge variant="info" label="Default" />
                ) : (
                  <Button
                    label="Set default"
                    variant="ghost"
                    size="sm"
                    style={tapTargetStyle}
                    onClick={() => onSetDefault(account.id)}
                  />
                )
              }
            />
          );
        })}
      </List>
    </VStack>
  );
}

// ============= DETAIL PANE =============

function StatementDetail({
  statement,
  defaultAccountId,
  isPhone,
  tapTargetStyle,
  onExport,
}: {
  statement: PayoutStatement;
  defaultAccountId: string;
  isPhone: boolean;
  tapTargetStyle?: CSSProperties;
  onExport: (statement: PayoutStatement, kind: 'csv' | 'pdf') => void;
}) {
  const status = STATUS_META[statement.status];
  const destination = accountById(statement.destinationId);

  return (
    <VStack gap={4} style={styles.detail}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StatusDot
            variant={status.dot}
            label={status.label}
            isPulsing={statement.status === 'in_transit'}
          />
          <Text type="supporting" color="secondary">
            {statement.id}
          </Text>
          <Token size="sm" color={status.token} label={status.label} />
        </HStack>
        <Heading level={2}>{statement.periodLabel}</Heading>
        <Text type="supporting" color="secondary">
          {statement.ordersCount} orders · net {formatUSD(netCents(statement))}
        </Text>
      </VStack>

      <HStack gap={2} wrap="wrap">
        <Button
          label="Download PDF"
          size="sm"
          icon={<Icon icon={DownloadIcon} size="sm" />}
          style={tapTargetStyle}
          onClick={() => onExport(statement, 'pdf')}
        />
        <Button
          label="Export CSV"
          variant="secondary"
          size="sm"
          icon={<Icon icon={FileSpreadsheetIcon} size="sm" />}
          style={tapTargetStyle}
          onClick={() => onExport(statement, 'csv')}
        />
      </HStack>

      <Divider />

      <VStack gap={3}>
        <Heading level={3}>Gross to net</Heading>
        <WaterfallChart statement={statement} isPhone={isPhone} />
      </VStack>

      <Divider />

      <MetadataList columns="single" label={{position: 'start', width: 120}}>
        <MetadataListItem label="Payout ID">
          <Text type="body">{statement.id}</Text>
        </MetadataListItem>
        <MetadataListItem label="Destination">
          <HStack gap={2} vAlign="center">
            <Text type="body">{accountLabel(destination)}</Text>
            {destination.id === defaultAccountId && (
              <Badge variant="info" label="Default" />
            )}
          </HStack>
        </MetadataListItem>
        <MetadataListItem label="Method">
          <Text type="body">ACH standard (no fee)</Text>
        </MetadataListItem>
        <MetadataListItem label="Initiated">
          {statement.initiatedAt === undefined ? (
            <Text type="body" color="secondary">
              Not yet initiated
            </Text>
          ) : (
            <Timestamp value={statement.initiatedAt} format="date_time" />
          )}
        </MetadataListItem>
        <MetadataListItem
          label={statement.status === 'paid' ? 'Arrived' : 'Expected arrival'}>
          <HStack gap={2} vAlign="center">
            <Timestamp value={statement.arrivalAt} format="date" />
            {statement.status !== 'paid' && (
              <Text type="supporting" color="secondary">
                estimated
              </Text>
            )}
          </HStack>
        </MetadataListItem>
      </MetadataList>

      {statement.status === 'upcoming' && (
        <Text type="supporting" color="secondary">
          Figures for the current period are provisional until the period
          closes; refunds and adjustments may still post.
        </Text>
      )}
    </VStack>
  );
}

// ============= PAGE =============

export default function PayoutStatementsPage() {
  const toast = useToast();

  // First row selected by default so the detail pane is never empty.
  const [selectedId, setSelectedId] = useState(STATEMENTS[0].id);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [defaultAccountId, setDefaultAccountId] = useState('acct-mercury');

  // Responsive contract: <=1024px drops the end panel and stacks the detail
  // below the table; <=768px also hides two table columns.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 768px)');
  // <=640px: sm buttons (28px) are too short to tap; grow the primary
  // actions to ~40px touch targets while keeping the sm type scale.
  const isPhone = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  const visible = useMemo(
    () =>
      filter === 'all'
        ? STATEMENTS
        : STATEMENTS.filter(statement => statement.status === filter),
    [filter],
  );

  // Filtering never clears the stored selection: when the filter hides it,
  // the pane falls back to the first visible row, and switching back to
  // "All" restores the original selection.
  const selected = useMemo(() => {
    return (
      visible.find(statement => statement.id === selectedId) ??
      visible[0] ??
      STATEMENTS[0]
    );
  }, [visible, selectedId]);

  const paidCount = STATEMENTS.filter(s => s.status === 'paid').length;
  const inTransitCount = STATEMENTS.filter(s => s.status === 'in_transit').length;
  const upcomingCount = STATEMENTS.filter(s => s.status === 'upcoming').length;

  // ---- actions (all confirm via Toast; nothing leaves the page) ----

  const exportStatement = (statement: PayoutStatement, kind: 'csv' | 'pdf') => {
    toast({
      body: \`\${statement.id}.\${kind} saved to Downloads\`,
      uniqueID: 'payout-export',
    });
  };

  const exportAllCsv = () => {
    const scope =
      filter === 'all' ? 'all statements' : STATUS_META[filter].label.toLowerCase();
    toast({
      body: \`payout-statements.csv (\${visible.length} rows, \${scope}) saved to Downloads\`,
      uniqueID: 'payout-export',
    });
  };

  const setDefaultAccount = (id: string) => {
    setDefaultAccountId(id);
    toast({
      body: \`\${accountLabel(accountById(id))} is now the default payout account\`,
      uniqueID: 'payout-default-account',
    });
  };

  const detail = (
    <StatementDetail
      statement={selected}
      defaultAccountId={defaultAccountId}
      isPhone={isPhone}
      tapTargetStyle={tapTargetStyle}
      onExport={exportStatement}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.headerRow}>
            <StackItem size="fill">
              <VStack gap={0.5}>
                <Heading level={1}>Payouts</Heading>
                <Text type="supporting" color="secondary">
                  Alpine Goods Marketplace · {paidCount} paid · {inTransitCount} in
                  transit · {upcomingCount} upcoming
                </Text>
              </VStack>
            </StackItem>
            {/* <=640px this pair wraps to its own row under the title. */}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <SegmentedControl
                value={filter}
                onChange={value => setFilter(value as StatusFilter)}
                label="Filter statements by status"
                size="sm">
                {FILTER_OPTIONS.map(option => (
                  <SegmentedControlItem
                    key={option.value}
                    value={option.value}
                    label={option.label}
                  />
                ))}
              </SegmentedControl>
              <Button
                label="Export CSV"
                variant="secondary"
                size="sm"
                icon={<Icon icon={FileSpreadsheetIcon} size="sm" />}
                style={tapTargetStyle}
                onClick={exportAllCsv}
              />
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentFill}>
            <div style={styles.scrollRegion}>
              <StatementsTable
                statements={visible}
                selectedId={selected.id}
                isCompact={isCompact}
                onSelect={setSelectedId}
              />
              {isNarrow && (
                <>
                  <Divider />
                  {detail}
                </>
              )}
              <Divider />
              <DestinationsSection
                defaultAccountId={defaultAccountId}
                tapTargetStyle={tapTargetStyle}
                onSetDefault={setDefaultAccount}
              />
            </div>
          </div>
        </LayoutContent>
      }
      end={
        isNarrow ? undefined : (
          <LayoutPanel width={420} padding={0} hasDivider label="Statement details">
            {detail}
          </LayoutPanel>
        )
      }
    />
  );
}
`;export{e as default};