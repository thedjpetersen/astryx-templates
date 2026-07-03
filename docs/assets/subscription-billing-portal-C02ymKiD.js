var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file subscription-billing-portal.tsx
 * @input Deterministic fixtures only (plan catalog, usage counters, saved
 *   payment methods, invoice history for a team workspace)
 * @output Self-serve billing portal: a centered ~840px column of Cards —
 *   current-plan summary with renewal Timestamp, Change-plan Dialog
 *   (RadioList of tiers that re-derives the usage meters), and a Cancel
 *   flow whose Dialog leads with a retention offer (accept applies a
 *   discount Badge, "Cancel anyway" needs a reason and flips the plan into
 *   a canceling Banner with Resume); usage ProgressBar meters vs the
 *   active plan's limits with warning/over-limit escalation; payment
 *   methods list with brand tiles, Default badge, make-default /
 *   remove-behind-AlertDialog, and an add-card Dialog with digit
 *   validation and brand detection; invoice history Table with status
 *   Badges and per-row download feedback
 * @position Page template; emitted by \`astryx template
 *   subscription-billing-portal\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the
 * page title, workspace scope line, and the billing-email chip.
 * LayoutContent scrolls the card column; contentWidth={840} centers it on
 * wide viewports. Each surface is a Card (plan, usage, payment methods,
 * invoices) — a stacked settings archetype, so cards beat rows/panels
 * here. All money math derives from one \`plan\` + \`discount\` pair of
 * useState values so the plan card, meters, and dialogs never disagree.
 *
 * Interaction contract:
 * - Change plan: Dialog with a RadioList of the three tiers (price +
 *   limits in each description). Confirming swaps the plan, re-derives
 *   every usage meter, and downgrades that would blow a limit show an
 *   over-limit error meter rather than being blocked — the meters are the
 *   teaching surface.
 * - Cancel: the Cancel subscription button opens a Dialog that leads with
 *   a retention offer card (25% off for 3 months). "Apply offer" closes
 *   the dialog and pins a green discount Badge + struck-through price on
 *   the plan card. "Cancel anyway" stays disabled until a cancellation
 *   reason is picked from the RadioList, then flips the subscription into
 *   a canceling state: warning Banner with the end date and a Resume
 *   subscription action that undoes it.
 * - Payment methods: exactly one default at a time. "Make default" moves
 *   the Default badge; Remove opens an AlertDialog; the default card's
 *   Remove is disabled with a tooltip explaining why. Add payment method
 *   opens a Dialog whose card-number field validates 16 digits (FieldStatus
 *   error via TextInput status) and detects the brand from the first digit.
 * - Invoices: Download flips its Tooltip "Download PDF" → "Downloaded" per
 *   row (resets when another row is downloaded); the failed invoice's
 *   download is disabled and its row offers Retry payment, which marks the
 *   invoice paid.
 *
 * Responsive contract:
 * - Column: Layout contentWidth={840} centers a max 840px column on wide
 *   viewports; below that the column keeps full width minus slot padding.
 * - Plan card: on desktop the price block and the action cluster sit on
 *   one row; at <=640px the actions wrap onto their own line and grow to
 *   40px-tall tap targets. Nothing is hover-only — every affordance is a
 *   visible Button/IconButton with a label or tooltip + aria label.
 * - Usage meters: full-width ProgressBars at every size; the value line
 *   ("412,000 / 500,000") wraps under the label at <=640px instead of
 *   truncating numbers.
 * - Payment rows: desktop keeps brand tile + details + actions on one
 *   row; at <=640px each row stacks details above a left-aligned action
 *   line, and the sm controls (Make default, Remove) grow to 40px tap
 *   targets.
 * - Invoices: the Table scrolls horizontally inside its own scroll
 *   wrapper on narrow viewports (deliberate overflowX); proportional
 *   columns keep a minimum so the invoice cell never collapses, pixel
 *   columns (amount, status, actions) keep width.
 * - Dialogs: width min(480px, 92vw) so they never overflow small screens;
 *   dialog footers keep Cancel + primary side by side (both fit at 375px).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Table, proportional, pixel} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CreditCardIcon,
  DownloadIcon,
  PlusIcon,
  ReceiptIcon,
  RotateCcwIcon,
  Trash2Icon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // One payment-method row: bordered, rounded, breathing room for the
  // action cluster on the right.
  row: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Card-brand tile: styled gradient placeholder instead of a network
  // image — the brand word is baked in so no asset is fetched.
  brandTile: {
    width: 46,
    height: 30,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: '0.08em',
    flexShrink: 0,
  },
  // Retention offer inside the cancel dialog: a tinted callout that reads
  // as "the good path" before the destructive one.
  offerBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
  },
  // Struck-through list price shown once the retention discount applies.
  strikePrice: {textDecoration: 'line-through'},
  // Over-limit meter copy (Text has no error color prop; token via style).
  errorText: {color: 'var(--color-error)'},
  // Text cells inside flex rows keep truncation working.
  truncateCell: {minWidth: 0},
  // <=640px: grow the sm controls to 40px touch targets (the 28px "sm"
  // box is fine for pointers but too small for thumbs); glyphs stay "sm".
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  // Plan card action cluster wraps onto its own line on narrow widths
  // instead of squeezing the price block.
  planActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    alignItems: 'center',
  },
};

// Brand tiles use fixed gradients per network — deterministic, no assets.
const BRAND_TILE_BACKGROUND: Record<CardBrand, string> = {
  visa: 'linear-gradient(135deg, #1a1f71 0%, #3d4db7 100%)',
  mastercard: 'linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)',
  amex: 'linear-gradient(135deg, #006fcf 0%, #4db8ff 100%)',
};

const BRAND_LABEL: Record<CardBrand, string> = {
  visa: 'VISA',
  mastercard: 'MC',
  amex: 'AMEX',
};

const BRAND_NAME: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
};

// ============= DATA =============

// Plan catalog for the "Lumen Analytics" workspace. Limits drive the
// usage meters, so switching plans visibly re-derives every bar.
interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  blurb: string;
  limits: {
    seats: number;
    apiCalls: number; // per month
    storageGb: number;
  };
}

const PLANS: Plan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    priceMonthly: 29,
    blurb: 'For small teams getting a first dashboard live.',
    limits: {seats: 5, apiCalls: 50_000, storageGb: 20},
  },
  {
    id: 'plan-growth',
    name: 'Growth',
    priceMonthly: 99,
    blurb: 'Serious usage: SSO, audit log, and priority support.',
    limits: {seats: 25, apiCalls: 500_000, storageGb: 200},
  },
  {
    id: 'plan-scale',
    name: 'Scale',
    priceMonthly: 299,
    blurb: 'High-volume workloads with dedicated infrastructure.',
    limits: {seats: 100, apiCalls: 2_000_000, storageGb: 1_000},
  },
];

// Fixed usage counters — chosen so Growth reads "warning-adjacent",
// Starter reads over-limit, and Scale reads comfortable.
const USAGE = {
  seats: 21,
  apiCalls: 412_000,
  storageGb: 148,
};

// Renewal anchors are fixed ISO dates (no clocks).
const RENEWAL_DATE = '2026-07-28T00:00:00Z';
const PERIOD_START = '2026-06-28T00:00:00Z';

// Retention offer surfaced in the cancel dialog.
const RETENTION_DISCOUNT_PCT = 25;
const RETENTION_MONTHS = 3;

type CardBrand = 'visa' | 'mastercard' | 'amex';

interface PaymentMethod {
  id: string;
  brand: CardBrand;
  last4: string;
  expiry: string; // MM/YYYY, fixed
  isExpiringSoon: boolean;
  addedOn: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pm-visa-4242',
    brand: 'visa',
    last4: '4242',
    expiry: '04/2028',
    isExpiringSoon: false,
    addedOn: '2025-11-03T10:15:00Z',
  },
  {
    id: 'pm-mc-8210',
    brand: 'mastercard',
    last4: '8210',
    expiry: '09/2026',
    isExpiringSoon: true,
    addedOn: '2024-09-19T08:40:00Z',
  },
  {
    id: 'pm-amex-3007',
    brand: 'amex',
    last4: '3007',
    expiry: '01/2027',
    isExpiringSoon: false,
    addedOn: '2026-02-12T16:22:00Z',
  },
];

type InvoiceStatus = 'paid' | 'open' | 'failed' | 'refunded';

interface InvoiceRow extends Record<string, unknown> {
  id: string;
  number: string;
  period: string;
  issuedOn: string;
  amount: number;
  status: InvoiceStatus;
}

const INVOICE_BADGE: Record<
  InvoiceStatus,
  {variant: 'success' | 'info' | 'error' | 'neutral'; label: string}
> = {
  paid: {variant: 'success', label: 'Paid'},
  open: {variant: 'info', label: 'Open'},
  failed: {variant: 'error', label: 'Failed'},
  refunded: {variant: 'neutral', label: 'Refunded'},
};

const INVOICES: InvoiceRow[] = [
  {
    id: 'inv-2026-06',
    number: 'INV-2026-0611',
    period: 'Jun 28 – Jul 27, 2026',
    issuedOn: '2026-06-28T00:00:00Z',
    amount: 99,
    status: 'open',
  },
  {
    id: 'inv-2026-05',
    number: 'INV-2026-0512',
    period: 'May 28 – Jun 27, 2026',
    issuedOn: '2026-05-28T00:00:00Z',
    amount: 99,
    status: 'failed',
  },
  {
    id: 'inv-2026-04',
    number: 'INV-2026-0410',
    period: 'Apr 28 – May 27, 2026',
    issuedOn: '2026-04-28T00:00:00Z',
    amount: 99,
    status: 'paid',
  },
  {
    id: 'inv-2026-03',
    number: 'INV-2026-0309',
    period: 'Mar 28 – Apr 27, 2026',
    issuedOn: '2026-03-28T00:00:00Z',
    amount: 99,
    status: 'paid',
  },
  {
    id: 'inv-2026-02',
    number: 'INV-2026-0207',
    period: 'Feb 28 – Mar 27, 2026',
    issuedOn: '2026-02-28T00:00:00Z',
    amount: 128.4,
    status: 'paid',
  },
  {
    id: 'inv-2026-01',
    number: 'INV-2026-0106',
    period: 'Jan 28 – Feb 27, 2026',
    issuedOn: '2026-01-28T00:00:00Z',
    amount: 99,
    status: 'refunded',
  },
  {
    id: 'inv-2025-12',
    number: 'INV-2025-1204',
    period: 'Dec 28 – Jan 27, 2026',
    issuedOn: '2025-12-28T00:00:00Z',
    amount: 99,
    status: 'paid',
  },
  {
    id: 'inv-2025-11',
    number: 'INV-2025-1103',
    period: 'Nov 28 – Dec 27, 2025',
    issuedOn: '2025-11-28T00:00:00Z',
    amount: 29,
    status: 'paid',
  },
];

// Cancellation reasons — the destructive button stays disabled until one
// is picked, so the flow is deliberately two-step.
const CANCEL_REASONS = [
  {value: 'too-expensive', label: 'It costs too much'},
  {value: 'missing-features', label: 'Missing features we need'},
  {value: 'switching', label: 'Switching to another tool'},
  {value: 'pausing', label: 'Pausing the project for now'},
];

// Fixture note: download feedback resets after a fixed beat, matching the
// copy-feedback idiom used across the catalog.
const DOWNLOAD_RESET_MS = 1800;

// ============= HELPERS =============

// Deterministic money formatting — fixed locale so SSR and client agree.
function formatMoney(amount: number): string {
  const hasCents = !Number.isInteger(amount);
  return \`$\${amount.toFixed(hasCents ? 2 : 0)}\`;
}

function formatCount(value: number): string {
  // 412000 → "412,000" without Intl locale drift.
  return value
    .toFixed(0)
    .replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
}

// First digit → brand, the classic BIN shorthand. Deterministic and good
// enough for a fixture form.
function detectBrand(cardNumber: string): CardBrand {
  if (cardNumber.startsWith('3')) {
    return 'amex';
  }
  if (cardNumber.startsWith('5')) {
    return 'mastercard';
  }
  return 'visa';
}

// Meter escalation: comfortable → warning at 80% → error when over.
function meterVariant(used: number, limit: number): 'accent' | 'warning' | 'error' {
  if (used > limit) {
    return 'error';
  }
  if (used / limit >= 0.8) {
    return 'warning';
  }
  return 'accent';
}

// ============= SMALL PIECES =============

// Brand tile: gradient placeholder with the network word baked in — no
// image assets. aria-hidden because the row text names the brand.
function BrandTile({brand}: {brand: CardBrand}) {
  return (
    <div
      aria-hidden
      style={{...styles.brandTile, background: BRAND_TILE_BACKGROUND[brand]}}>
      {BRAND_LABEL[brand]}
    </div>
  );
}

// One usage meter: label + counted value line above a ProgressBar whose
// variant escalates as usage approaches / passes the plan limit. Over
// limit, the bar pins at 100% and the value line calls out the overage.
function UsageMeter({
  label,
  used,
  limit,
  unit,
}: {
  label: string;
  used: number;
  limit: number;
  unit: string;
}) {
  const variant = meterVariant(used, limit);
  const isOver = used > limit;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  return (
    <VStack gap={1}>
      {/* Value line wraps under the label on narrow widths instead of
          truncating numbers. */}
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <StackItem size="fill">
          <Text type="label">{label}</Text>
        </StackItem>
        <Text
          type="supporting"
          color={isOver ? undefined : 'secondary'}
          style={isOver ? styles.errorText : undefined}
          hasTabularNumbers>
          {formatCount(used)} / {formatCount(limit)} {unit}
          {isOver ? \` · \${formatCount(used - limit)} over limit\` : ''}
        </Text>
      </HStack>
      <ProgressBar
        label={\`\${label} usage\`}
        isLabelHidden
        value={percent}
        variant={variant}
      />
      {isOver ? (
        <Text type="supporting" style={styles.errorText}>
          Over the {unit} limit on this plan — upgrade or reduce usage
          before the next cycle.
        </Text>
      ) : null}
    </VStack>
  );
}

// Card section shell: Heading + supporting line, then the section body.
// Kept as a component so all four surfaces share one title rhythm.
function BillingCard({
  title,
  supporting,
  endContent,
  children,
}: {
  title: string;
  supporting: string;
  endContent?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          <StackItem size="fill">
            <VStack gap={0.5} style={styles.truncateCell}>
              <Heading level={2}>{title}</Heading>
              <Text type="supporting" color="secondary">
                {supporting}
              </Text>
            </VStack>
          </StackItem>
          {endContent}
        </HStack>
        {children}
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function SubscriptionBillingPortalTemplate() {
  // <=640px: action clusters wrap and sm controls grow to 40px targets.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- Plan state: one source of truth for card, meters, and dialogs.
  const [planId, setPlanId] = useState('plan-growth');
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState(planId);

  // Cancel flow: dialog → retention offer OR reasoned cancel.
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCanceling, setIsCanceling] = useState(false);
  const [hasRetentionDiscount, setHasRetentionDiscount] = useState(false);

  // ---- Payment methods: exactly one default at a time.
  const [methods, setMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [defaultMethodId, setDefaultMethodId] = useState('pm-visa-4242');
  const [removeTarget, setRemoveTarget] = useState<PaymentMethod | null>(null);

  // Add-card dialog draft. Seeded empty; validation is digit-count only
  // (fixture form, no network).
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [draftNumber, setDraftNumber] = useState('');
  const [draftExpiry, setDraftExpiry] = useState('');
  const [draftName, setDraftName] = useState('');

  // ---- Invoices: retry mutates status; download shows per-row feedback.
  const [invoices, setInvoices] = useState<InvoiceRow[]>(INVOICES);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const plan = PLANS.find(item => item.id === planId) ?? PLANS[1];
  const discountedPrice =
    Math.round(plan.priceMonthly * (1 - RETENTION_DISCOUNT_PCT / 100) * 100) /
    100;
  const defaultMethod = methods.find(item => item.id === defaultMethodId);

  // ---- Plan handlers.

  const openChangePlan = () => {
    setPendingPlanId(planId);
    setIsChangePlanOpen(true);
  };

  const confirmChangePlan = () => {
    setPlanId(pendingPlanId);
    setIsChangePlanOpen(false);
  };

  const openCancel = () => {
    setCancelReason('');
    setIsCancelOpen(true);
  };

  const acceptRetentionOffer = () => {
    setHasRetentionDiscount(true);
    setIsCancelOpen(false);
  };

  const confirmCancel = () => {
    setIsCanceling(true);
    setIsCancelOpen(false);
  };

  // ---- Payment-method handlers.

  const draftDigits = draftNumber.replace(/\\s+/g, '');
  const isDraftNumberValid = /^\\d{16}$/.test(draftDigits);
  const isDraftExpiryValid = /^(0[1-9]|1[0-2])\\/20\\d{2}$/.test(
    draftExpiry.trim(),
  );
  const canAddCard =
    isDraftNumberValid && isDraftExpiryValid && draftName.trim() !== '';

  const addCard = () => {
    if (!canAddCard) {
      return;
    }
    const brand = detectBrand(draftDigits);
    const last4 = draftDigits.slice(-4);
    setMethods(prev => [
      ...prev,
      {
        id: \`pm-\${brand}-\${last4}\`,
        brand,
        last4,
        expiry: draftExpiry.trim(),
        isExpiringSoon: false,
        addedOn: '2026-07-01T12:00:00Z',
      },
    ]);
    setDraftNumber('');
    setDraftExpiry('');
    setDraftName('');
    setIsAddCardOpen(false);
  };

  const removeCard = () => {
    if (removeTarget === null) {
      return;
    }
    setMethods(prev => prev.filter(item => item.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  // ---- Invoice handlers.

  const markDownloaded = (id: string) => {
    setDownloadedId(id);
    setTimeout(() => {
      // Only clear if another row hasn't taken over the feedback slot.
      setDownloadedId(current => (current === id ? null : current));
    }, DOWNLOAD_RESET_MS);
  };

  const retryInvoice = (id: string) => {
    setInvoices(prev =>
      prev.map(row => (row.id === id ? {...row, status: 'paid'} : row)),
    );
  };

  // ---- Invoice columns (defined inline so cells can reach handlers).

  const invoiceColumns: TableColumn<InvoiceRow>[] = [
    {
      key: 'number',
      header: 'Invoice',
      width: proportional(2),
      renderCell: (item: InvoiceRow) => (
        <VStack gap={0}>
          <Text type="label" maxLines={1} hasTabularNumbers>
            {item.number}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {item.period}
          </Text>
        </VStack>
      ),
    },
    {
      key: 'issuedOn',
      header: 'Issued',
      width: pixel(120),
      renderCell: (item: InvoiceRow) => (
        <Timestamp value={item.issuedOn} format="date" color="secondary" />
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      width: pixel(100),
      renderCell: (item: InvoiceRow) => (
        <Text type="body" hasTabularNumbers>
          {formatMoney(item.amount)}
        </Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: pixel(110),
      renderCell: (item: InvoiceRow) => (
        <Badge
          label={INVOICE_BADGE[item.status].label}
          variant={INVOICE_BADGE[item.status].variant}
        />
      ),
    },
    {
      key: 'actions',
      header: '',
      width: pixel(isCompact ? 132 : 150),
      renderCell: (item: InvoiceRow) => {
        const isDownloaded = downloadedId === item.id;
        const canDownload = item.status !== 'failed';
        return (
          <HStack gap={1} vAlign="center">
            {item.status === 'failed' ? (
              <Button
                label="Retry"
                size="sm"
                variant="secondary"
                style={isCompact ? styles.buttonTapTarget : undefined}
                icon={<Icon icon={RotateCcwIcon} size="sm" />}
                onClick={() => retryInvoice(item.id)}
              />
            ) : null}
            <Tooltip
              content={
                canDownload
                  ? isDownloaded
                    ? 'Downloaded'
                    : 'Download PDF'
                  : 'No PDF until the charge succeeds'
              }>
              <IconButton
                label={\`Download \${item.number}\`}
                size="sm"
                variant="ghost"
                isDisabled={!canDownload}
                style={isCompact ? styles.iconTapTarget : undefined}
                icon={<Icon icon={DownloadIcon} size="sm" />}
                onClick={() => markDownloaded(item.id)}
              />
            </Tooltip>
          </HStack>
        );
      },
    },
  ];

  // ---- Derived copy for the plan card.

  const priceLine = hasRetentionDiscount ? (
    <HStack gap={2} vAlign="center">
      <Text type="body" color="secondary" style={styles.strikePrice}>
        {formatMoney(plan.priceMonthly)}
      </Text>
      <Heading level={3}>{formatMoney(discountedPrice)}</Heading>
      <Text type="supporting" color="secondary">
        / month
      </Text>
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center">
      <Heading level={3}>{formatMoney(plan.priceMonthly)}</Heading>
      <Text type="supporting" color="secondary">
        / month
      </Text>
    </HStack>
  );

  return (
    <Layout
      height="fill"
      contentWidth={840}
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
            <StackItem size="fill">
              <VStack gap={1} style={styles.truncateCell}>
                <Heading level={1}>Billing</Heading>
                <Text type="supporting" color="secondary">
                  Plan, usage, payment methods, and invoices for the Lumen
                  Analytics workspace.
                </Text>
              </VStack>
            </StackItem>
            <Badge
              variant="neutral"
              icon={<Icon icon={ReceiptIcon} size="sm" />}
              label="billing@lumen.dev"
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            {/* ---- Canceling banner: only while the cancel is pending. */}
            {isCanceling ? (
              <Banner
                status="warning"
                title="Subscription set to cancel"
                description="Your team keeps full access until Jul 28, 2026, then the workspace becomes read-only."
                endContent={
                  <Button
                    label="Resume subscription"
                    variant="secondary"
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    onClick={() => setIsCanceling(false)}
                  />
                }
              />
            ) : null}

            {/* ---- Card 1: current plan ---- */}
            <BillingCard
              title="Current plan"
              supporting={plan.blurb}
              endContent={
                isCanceling ? (
                  <Badge variant="warning" label="Cancels Jul 28" />
                ) : (
                  <Badge variant="success" label="Active" />
                )
              }>
              <VStack gap={3}>
                <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
                  <StackItem size="fill">
                    <VStack gap={1} style={styles.truncateCell}>
                      <HStack gap={2} vAlign="center">
                        <Heading level={3}>{plan.name}</Heading>
                        {hasRetentionDiscount ? (
                          <Badge
                            variant="green"
                            label={\`\${RETENTION_DISCOUNT_PCT}% off · \${RETENTION_MONTHS} months\`}
                          />
                        ) : null}
                      </HStack>
                      {priceLine}
                      <HStack gap={1} vAlign="center" style={{flexWrap: 'wrap'}}>
                        <Text type="supporting" color="secondary">
                          {isCanceling ? 'Ends' : 'Renews'}
                        </Text>
                        <Timestamp
                          value={RENEWAL_DATE}
                          format="date"
                          color="secondary"
                        />
                        <Text type="supporting" color="secondary">
                          ·{' '}
                          {defaultMethod
                            ? \`billed to \${BRAND_NAME[defaultMethod.brand]} •••• \${defaultMethod.last4}\`
                            : 'no payment method on file'}
                        </Text>
                      </HStack>
                    </VStack>
                  </StackItem>
                  {/* Action cluster wraps onto its own line at <=640px and
                      grows to 40px tap targets. */}
                  <div style={styles.planActions}>
                    <Button
                      label="Change plan"
                      variant="secondary"
                      style={isCompact ? styles.buttonTapTarget : undefined}
                      onClick={openChangePlan}
                    />
                    <Button
                      label="Cancel subscription"
                      variant="ghost"
                      style={isCompact ? styles.buttonTapTarget : undefined}
                      isDisabled={isCanceling}
                      onClick={openCancel}
                    />
                  </div>
                </HStack>
              </VStack>
            </BillingCard>

            {/* ---- Card 2: usage vs plan limits ---- */}
            <BillingCard
              title="Usage this cycle"
              supporting={\`Jun 28 – Jul 27 · limits from the \${plan.name} plan. Meters re-derive when the plan changes.\`}>
              <VStack gap={3}>
                <UsageMeter
                  label="Seats"
                  used={USAGE.seats}
                  limit={plan.limits.seats}
                  unit="seats"
                />
                <UsageMeter
                  label="API requests"
                  used={USAGE.apiCalls}
                  limit={plan.limits.apiCalls}
                  unit="requests"
                />
                <UsageMeter
                  label="Storage"
                  used={USAGE.storageGb}
                  limit={plan.limits.storageGb}
                  unit="GB"
                />
              </VStack>
            </BillingCard>

            {/* ---- Card 3: payment methods ---- */}
            <BillingCard
              title="Payment methods"
              supporting="The default card is charged on each renewal. Keep a backup on file to avoid failed invoices."
              endContent={
                <Button
                  label="Add payment method"
                  variant="secondary"
                  style={isCompact ? styles.buttonTapTarget : undefined}
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  onClick={() => setIsAddCardOpen(true)}
                />
              }>
              {methods.length === 0 ? (
                <EmptyState
                  isCompact
                  icon={<Icon icon={CreditCardIcon} size="lg" />}
                  title="No payment methods"
                  description="Add a card so the next renewal can be charged."
                />
              ) : (
                <VStack gap={2}>
                  {methods.map(method => {
                    const isDefault = method.id === defaultMethodId;
                    const details = (
                      <StackItem size="fill">
                        <VStack gap={0.5} style={styles.truncateCell}>
                          <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
                            <Text type="label" maxLines={1}>
                              {BRAND_NAME[method.brand]} •••• {method.last4}
                            </Text>
                            {isDefault ? (
                              <Badge variant="blue" label="Default" />
                            ) : null}
                            {method.isExpiringSoon ? (
                              <Badge variant="warning" label="Expires soon" />
                            ) : null}
                          </HStack>
                          <HStack gap={1} vAlign="center">
                            <Text type="supporting" color="secondary">
                              Expires {method.expiry} · added
                            </Text>
                            <Timestamp
                              value={method.addedOn}
                              format="date"
                              color="secondary"
                            />
                          </HStack>
                        </VStack>
                      </StackItem>
                    );
                    const actions = (
                      <HStack gap={1} vAlign="center">
                        {isDefault ? null : (
                          <Button
                            label="Make default"
                            size="sm"
                            variant="ghost"
                            style={
                              isCompact ? styles.buttonTapTarget : undefined
                            }
                            onClick={() => setDefaultMethodId(method.id)}
                          />
                        )}
                        <Tooltip
                          content={
                            isDefault
                              ? 'Set another card as default first'
                              : 'Remove card'
                          }>
                          <IconButton
                            label={\`Remove \${BRAND_NAME[method.brand]} ending \${method.last4}\`}
                            size="sm"
                            variant="ghost"
                            isDisabled={isDefault}
                            style={
                              isCompact ? styles.iconTapTarget : undefined
                            }
                            icon={<Icon icon={Trash2Icon} size="sm" />}
                            onClick={() => setRemoveTarget(method)}
                          />
                        </Tooltip>
                      </HStack>
                    );
                    return (
                      <div key={method.id} style={styles.row}>
                        {isCompact ? (
                          // Details above a left-aligned action line so the
                          // 40px controls never squeeze the card summary.
                          <VStack gap={2}>
                            <HStack gap={2} vAlign="center">
                              <BrandTile brand={method.brand} />
                              {details}
                            </HStack>
                            {actions}
                          </VStack>
                        ) : (
                          <HStack gap={3} vAlign="center">
                            <BrandTile brand={method.brand} />
                            {details}
                            {actions}
                          </HStack>
                        )}
                      </div>
                    );
                  })}
                </VStack>
              )}
            </BillingCard>

            {/* ---- Card 4: invoice history ---- */}
            <BillingCard
              title="Invoices"
              supporting="Download PDFs for closed invoices. The failed May charge can be retried against the default card.">
              {/* Table owns horizontal overflow on narrow viewports —
                  proportional invoice cell keeps a minimum, pixel columns
                  keep width. */}
              <Table<InvoiceRow>
                data={invoices}
                columns={invoiceColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
                emptyState={
                  <EmptyState
                    isCompact
                    icon={<Icon icon={ReceiptIcon} size="lg" />}
                    title="No invoices yet"
                    description="Invoices appear after the first billing cycle closes."
                  />
                }
              />
            </BillingCard>
          </VStack>

          {/* ---- Change-plan dialog: RadioList of tiers. ---- */}
          <Dialog
            isOpen={isChangePlanOpen}
            onOpenChange={setIsChangePlanOpen}
            purpose="form"
            width="min(480px, 92vw)">
            <Layout
              header={
                <DialogHeader
                  title="Change plan"
                  subtitle="Upgrades apply immediately; downgrades apply at the next renewal."
                  onOpenChange={setIsChangePlanOpen}
                />
              }
              content={
                <LayoutContent>
                  <RadioList
                    label="Plan"
                    value={pendingPlanId}
                    onChange={setPendingPlanId}>
                    {PLANS.map(item => (
                      <RadioListItem
                        key={item.id}
                        value={item.id}
                        label={\`\${item.name} — \${formatMoney(item.priceMonthly)}/mo\`}
                        description={\`\${item.limits.seats} seats · \${formatCount(item.limits.apiCalls)} API requests · \${formatCount(item.limits.storageGb)} GB storage\`}
                      />
                    ))}
                  </RadioList>
                </LayoutContent>
              }
              footer={
                <LayoutFooter hasDivider>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill">
                      {pendingPlanId !== planId ? (
                        <Text type="supporting" color="secondary">
                          Next invoice:{' '}
                          {formatMoney(
                            PLANS.find(item => item.id === pendingPlanId)
                              ?.priceMonthly ?? plan.priceMonthly,
                          )}
                        </Text>
                      ) : null}
                    </StackItem>
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onClick={() => setIsChangePlanOpen(false)}
                    />
                    <Button
                      label="Confirm change"
                      isDisabled={pendingPlanId === planId}
                      onClick={confirmChangePlan}
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Dialog>

          {/* ---- Cancel dialog: retention offer first, then a reasoned
              destructive path. AlertDialog cannot host the offer card and
              RadioList, so this flow uses Dialog. ---- */}
          <Dialog
            isOpen={isCancelOpen}
            onOpenChange={setIsCancelOpen}
            purpose="form"
            width="min(480px, 92vw)">
            <Layout
              header={
                <DialogHeader
                  title="Cancel subscription?"
                  subtitle="Access continues until Jul 28, 2026."
                  onOpenChange={setIsCancelOpen}
                />
              }
              content={
                <LayoutContent>
                  <VStack gap={3}>
                    {/* Retention offer leads: the good path gets the
                        primary button. */}
                    <div style={styles.offerBox}>
                      <VStack gap={2}>
                        <HStack gap={2} vAlign="center">
                          <StackItem size="fill">
                            <Text type="label">
                              Stay for {RETENTION_DISCOUNT_PCT}% off
                            </Text>
                          </StackItem>
                          <Badge variant="green" label="Limited offer" />
                        </HStack>
                        <Text type="supporting" color="secondary">
                          Keep the {plan.name} plan at{' '}
                          {formatMoney(discountedPrice)}/mo for the next{' '}
                          {RETENTION_MONTHS} months — applied instantly, no
                          commitment.
                        </Text>
                        <div>
                          <Button
                            label="Apply offer and keep my plan"
                            style={
                              isCompact ? styles.buttonTapTarget : undefined
                            }
                            isDisabled={hasRetentionDiscount}
                            onClick={acceptRetentionOffer}
                          />
                        </div>
                      </VStack>
                    </div>
                    <RadioList
                      label="Why are you canceling?"
                      value={cancelReason}
                      onChange={setCancelReason}>
                      {CANCEL_REASONS.map(reason => (
                        <RadioListItem
                          key={reason.value}
                          value={reason.value}
                          label={reason.label}
                        />
                      ))}
                    </RadioList>
                  </VStack>
                </LayoutContent>
              }
              footer={
                <LayoutFooter hasDivider>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill" />
                    <Button
                      label="Keep plan"
                      variant="ghost"
                      onClick={() => setIsCancelOpen(false)}
                    />
                    <Button
                      label="Cancel anyway"
                      variant="destructive"
                      isDisabled={cancelReason === ''}
                      onClick={confirmCancel}
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Dialog>

          {/* ---- Add-card dialog: digit validation + brand detection. */}
          <Dialog
            isOpen={isAddCardOpen}
            onOpenChange={setIsAddCardOpen}
            purpose="form"
            width="min(480px, 92vw)">
            <Layout
              header={
                <DialogHeader
                  title="Add payment method"
                  subtitle="Cards are charged in USD on each renewal."
                  onOpenChange={setIsAddCardOpen}
                />
              }
              content={
                <LayoutContent>
                  <VStack gap={3}>
                    <TextInput
                      label="Card number"
                      placeholder="4242 4242 4242 4242"
                      value={draftNumber}
                      onChange={setDraftNumber}
                      status={
                        draftNumber !== '' && !isDraftNumberValid
                          ? {
                              type: 'error',
                              message: 'Enter the full 16-digit card number.',
                            }
                          : undefined
                      }
                    />
                    <TextInput
                      label="Expiry (MM/YYYY)"
                      placeholder="04/2029"
                      value={draftExpiry}
                      onChange={setDraftExpiry}
                      status={
                        draftExpiry !== '' && !isDraftExpiryValid
                          ? {
                              type: 'error',
                              message: 'Use MM/YYYY, e.g. 04/2029.',
                            }
                          : undefined
                      }
                    />
                    <TextInput
                      label="Name on card"
                      placeholder="Jordan Ellis"
                      value={draftName}
                      onChange={setDraftName}
                    />
                    {isDraftNumberValid ? (
                      <HStack gap={2} vAlign="center">
                        <BrandTile brand={detectBrand(draftDigits)} />
                        <Text type="supporting" color="secondary">
                          Detected {BRAND_NAME[detectBrand(draftDigits)]}{' '}
                          ending {draftDigits.slice(-4)}
                        </Text>
                      </HStack>
                    ) : null}
                  </VStack>
                </LayoutContent>
              }
              footer={
                <LayoutFooter hasDivider>
                  <HStack gap={2} vAlign="center">
                    <StackItem size="fill" />
                    <Button
                      label="Cancel"
                      variant="ghost"
                      onClick={() => setIsAddCardOpen(false)}
                    />
                    <Button
                      label="Add card"
                      icon={<Icon icon={CreditCardIcon} size="sm" />}
                      isDisabled={!canAddCard}
                      onClick={addCard}
                    />
                  </HStack>
                </LayoutFooter>
              }
            />
          </Dialog>

          {/* Two-step destructive: remove a saved card behind an
              AlertDialog. The default card never reaches here — its
              Remove button is disabled with an explanatory tooltip. */}
          <AlertDialog
            isOpen={removeTarget !== null}
            onOpenChange={isOpen => {
              if (!isOpen) {
                setRemoveTarget(null);
              }
            }}
            title={\`Remove \${removeTarget === null ? 'card' : \`\${BRAND_NAME[removeTarget.brand]} •••• \${removeTarget.last4}\`}?\`}
            description="Future renewals fall back to the default card. Any pending charge on this card still completes."
            actionLabel="Remove card"
            onAction={removeCard}
          />
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};