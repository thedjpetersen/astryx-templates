var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Hosted Checkout & Payment Element — the payment-service-provider's
 *   hosted payment page for fictional merchant Fern & Flint (small-batch
 *   candles and hearth goods), processed by fictional PSP "Larchpay".
 * @input Deterministic fixtures only: four line items (2× Douglas Fir
 *   Candle $28.00, Flint & Steel Fire Starter Kit $34.00, Waxed Canvas Log
 *   Carrier $72.00, Cedar Room & Linen Mist $18.00 → $180.00 subtotal),
 *   promo FOREST15 (−15% = −$27.00), carbon-neutral ground shipping $8.00,
 *   8% tax computed on the discounted subtotal, session anchored to July
 *   2026 for expiry validation. Card fixture pre-fills a Vexa-detected
 *   number and an expired 04/24 date so exactly one inline error renders
 *   on load. No Date.now(), Math.random(), or network assets — product
 *   thumbs are CSS-gradient tiles.
 * @output Stripe-style hosted checkout: left order-summary column on a
 *   forest-tinted wash (merchant mark + sandbox badge, "Pay Fern & Flint"
 *   total headline, line items with gradient thumbs, removable FOREST15
 *   promo token, subtotal/discount/shipping/tax rows that reconcile to the
 *   total, powered-by footer) beside a right payment column (express-pay
 *   wallet row, "or pay another way" divider, email field, tabbed payment
 *   element — Card with live-formatted number + brand-glyph detection
 *   chip, expiry auto-slash with the inline expired-card error, CVC
 *   tooltip, country + ZIP; Wallet; Bank debit with mandate copy — save
 *   Switch, validation Banner on Pay, accent Pay button showing the live
 *   total, encrypted trust footer, and a static processing-state overlay
 *   specimen).
 * @position Page template; emitted by \`astryx template hosted-checkout-flow\`.
 *
 * Frame: root 100dvh scroll container > CSS grid of two columns via
 * \`repeat(auto-fit, minmax(min(460px, 100%), 1fr))\`. Left column carries
 * the brand-tinted wash with its content column (max 380px) pinned toward
 * the trailing edge; right column is surface-toned with the payment
 * element column (max 420px) pinned toward the leading edge, so both
 * content columns meet at the seam like a hosted checkout.
 *
 * Responsive contract:
 * - >=~960px — two columns side by side; each content column vertically
 *   padded, page scrolls as one document if it overflows 900px.
 * - <~960px  — grid auto-wraps to a single column: summary stacks above
 *   the payment element; the express-pay row and expiry/CVC pair wrap
 *   instead of clipping. No JS breakpoints.
 *
 * Container policy (hosted-checkout archetype): frame-first custom
 * chrome — no Cards. Line items and totals are plain rows; the payment
 * element's method tabs are custom tab tiles (role=tablist) because the
 * design-system SegmentedControl cannot host the two-line icon+label
 * tile geometry this surface is known for. SegmentedControl is used
 * where it fits on one line (bank account type). The processing-state
 * specimen is a bordered inline figure, explicitly labeled, not a live
 * overlay.
 *
 * Color policy: ONE brand accent — Fern & Flint forest green
 * \`light-dark(#15803D, #4ADE80)\` — used for the merchant mark, the
 * selected method tab, the Pay button, and the promo/discount emphasis.
 * Text on the accent button uses light-dark(#FFFFFF, #052E16) (both AA).
 * Express wallet buttons are deliberate near-black/near-white inverse
 * literals (device-wallet trade dress), and card-brand glyphs use fixed
 * brand literals on both schemes; everything else is token-pure.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ChevronLeftIcon,
  CreditCardIcon,
  LandmarkIcon,
  LeafIcon,
  LockIcon,
  ShieldCheckIcon,
  SmartphoneNfcIcon,
  TagIcon,
  WalletIcon,
  XIcon,
} from 'lucide-react';

import {HStack, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {Spinner} from '@astryxdesign/core/Spinner';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';

// ============= BRAND =============

/** Fern & Flint forest green — the single brand accent (§ Color policy). */
const BRAND_ACCENT = 'light-dark(#15803D, #4ADE80)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(21,128,61,0.10), rgba(74,222,128,0.14))';
/** Text/icon color when sitting ON the accent (Pay button). */
const ON_ACCENT = 'light-dark(#FFFFFF, #052E16)';
/** Left column wash — a whisper of the accent over the body background. */
const SUMMARY_WASH =
  'light-dark(rgba(21,128,61,0.05), rgba(74,222,128,0.06))';
/** Device-wallet buttons: deliberate inverse neutrals, not the accent. */
const WALLET_BG = 'light-dark(#111827, #F9FAFB)';
const WALLET_TEXT = 'light-dark(#F9FAFB, #111827)';

// ============= FIXTURES (deterministic; totals reconcile) =============

const MERCHANT = 'Fern & Flint';
const PSP_NAME = 'Larchpay';
/** Fixed session anchor for expiry validation — never Date.now(). */
const SESSION_MONTH = 7;
const SESSION_YEAR = 2026;

type LineItem = {
  id: string;
  name: string;
  detail: string;
  qty: number;
  unitCents: number;
  /** Deterministic CSS-gradient thumb (no network media). */
  thumb: [string, string];
};

const LINE_ITEMS: LineItem[] = [
  {
    id: 'li-fir-candle',
    name: 'Douglas Fir Candle',
    detail: '8 oz · soy blend · 45-hr burn',
    qty: 2,
    unitCents: 2800,
    thumb: ['light-dark(#14532D, #166534)', 'light-dark(#4ADE80, #86EFAC)'],
  },
  {
    id: 'li-fire-kit',
    name: 'Flint & Steel Fire Starter Kit',
    detail: 'Carbon steel striker + English flint',
    qty: 1,
    unitCents: 3400,
    thumb: ['light-dark(#44403C, #57534E)', 'light-dark(#F59E0B, #FCD34D)'],
  },
  {
    id: 'li-log-carrier',
    name: 'Waxed Canvas Log Carrier',
    detail: 'Field tan · leather handles',
    qty: 1,
    unitCents: 7200,
    thumb: ['light-dark(#92400E, #B45309)', 'light-dark(#FDE68A, #FEF3C7)'],
  },
  {
    id: 'li-cedar-mist',
    name: 'Cedar Room & Linen Mist',
    detail: '4 fl oz · atlas cedar + vetiver',
    qty: 1,
    unitCents: 1800,
    thumb: ['light-dark(#155E75, #0E7490)', 'light-dark(#67E8F9, #A5F3FC)'],
  },
];

const PROMO_CODE = 'FOREST15';
const PROMO_PERCENT = 15;
const SHIPPING_CENTS = 800;
const SHIPPING_LABEL = 'Shipping — carbon-neutral ground';
/** 8% flat demo rate applied to the discounted subtotal. */
const TAX_RATE = 0.08;

const COUNTRY_OPTIONS = [
  {value: 'US', label: 'United States'},
  {value: 'CA', label: 'Canada'},
  {value: 'GB', label: 'United Kingdom'},
  {value: 'DE', label: 'Germany'},
  {value: 'NZ', label: 'New Zealand'},
];

// ============= CARD BRANDS (fictional networks) =============

type CardBrand = {
  id: string;
  label: string;
  /** Leading digit that identifies the network (demo BIN table). */
  prefix: string;
  /** Glyph plate + mark colors — fixed literals on both schemes. */
  plate: string;
  mark: string;
};

const CARD_BRANDS: CardBrand[] = [
  {id: 'vexa', label: 'Vexa', prefix: '4', plate: '#1E3A8A', mark: '#FFFFFF'},
  {id: 'mastro', label: 'Mastro', prefix: '5', plate: '#7C2D12', mark: '#FDBA74'},
  {id: 'axm', label: 'Axiom', prefix: '3', plate: '#065F46', mark: '#A7F3D0'},
  {id: 'drover', label: 'Drover', prefix: '6', plate: '#581C87', mark: '#E9D5FF'},
];

// ============= MONEY & FORMAT HELPERS =============

function formatUSD(cents: number): string {
  const sign = cents < 0 ? '−' : '';
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100).toLocaleString('en-US');
  return \`\${sign}$\${dollars}.\${String(abs % 100).padStart(2, '0')}\`;
}

/** Digits only, capped at 16, grouped in fours: "4029 6041 8842 1057". */
function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})(?=.)/g, '$1 ');
}

/** Digits only, capped at 4, auto-slashed: "0424" -> "04/24". */
function formatExpiry(raw: string): string {
  const digits = raw.replace(/\\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return \`\${digits.slice(0, 2)}/\${digits.slice(2)}\`;
}

function detectBrand(cardNumber: string): CardBrand | null {
  const digits = cardNumber.replace(/\\D/g, '');
  if (digits.length === 0) {
    return null;
  }
  return CARD_BRANDS.find(b => digits.startsWith(b.prefix)) ?? null;
}

/** Validates MM/YY against the fixed July 2026 session anchor. */
function expiryError(value: string): string | null {
  const digits = value.replace(/\\D/g, '');
  if (digits.length < 4) {
    return digits.length === 0
      ? null
      : 'Enter the expiration as MM/YY.';
  }
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  if (month < 1 || month > 12) {
    return 'That month doesn’t exist — use MM/YY.';
  }
  if (year < SESSION_YEAR || (year === SESSION_YEAR && month < SESSION_MONTH)) {
    return 'Your card’s expiration date is in the past.';
  }
  return null;
}

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
  },
  splitGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(460px, 100%), 1fr))',
    minHeight: '100%',
    alignItems: 'stretch',
  },
  // ---- Left / order summary ----
  summaryCol: {
    backgroundColor: SUMMARY_WASH,
    borderRight: 'var(--border-width) solid var(--color-border)',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 'var(--spacing-8) var(--spacing-8)',
  },
  summaryInner: {
    width: '100%',
    maxWidth: 380,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  merchantMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  totalHeadline: {
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  qtyBubble: {
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moneyCell: {
    textAlign: 'end',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  promoToken: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    padding: '2px var(--spacing-1) 2px var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    border: \`var(--border-width) dashed \${BRAND_ACCENT}\`,
  },
  discountText: {
    color: BRAND_ACCENT,
  },
  poweredRow: {
    marginTop: 'auto',
    paddingTop: 'var(--spacing-6)',
  },
  // ---- Right / payment element ----
  payCol: {
    backgroundColor: 'var(--color-background-surface)',
    display: 'flex',
    justifyContent: 'flex-start',
    padding: 'var(--spacing-8) var(--spacing-8)',
  },
  payInner: {
    width: '100%',
    maxWidth: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  expressBtn: {
    flex: '1 1 150px',
    height: 44,
    borderRadius: 'var(--radius-container)',
    border: 'none',
    backgroundColor: WALLET_BG,
    color: WALLET_TEXT,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    cursor: 'pointer',
    font: 'inherit',
    fontWeight: 600,
  },
  orDivider: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
  },
  orLine: {
    flex: 1,
    height: 'var(--border-width)',
    backgroundColor: 'var(--color-border)',
  },
  // ---- Method tabs ----
  tabRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  methodTab: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    cursor: 'pointer',
    font: 'inherit',
    textAlign: 'start',
  },
  methodTabActive: {
    boxShadow: \`inset 0 0 0 1px \${BRAND_ACCENT}\`,
    borderColor: BRAND_ACCENT,
    backgroundColor: BRAND_ACCENT_SOFT,
  },
  // ---- Card fields ----
  cardNumberWrap: {
    position: 'relative',
  },
  glyphRail: {
    position: 'absolute',
    insetInlineEnd: 10,
    insetBlockEnd: 8,
    display: 'flex',
    gap: 4,
    pointerEvents: 'none',
  },
  brandGlyph: {
    width: 30,
    height: 20,
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 8,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: 'var(--font-family-code, monospace)',
  },
  detectedChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '1px 6px',
    borderRadius: 999,
    backgroundColor: BRAND_ACCENT_SOFT,
    border: \`var(--border-width) solid \${BRAND_ACCENT}\`,
  },
  fieldPair: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  fieldHalf: {
    flex: '1 1 140px',
    minWidth: 0,
  },
  mandateBox: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
  },
  // ---- Pay + trust footer ----
  payButton: {
    width: '100%',
    height: 44,
    borderRadius: 'var(--radius-container)',
    border: 'none',
    backgroundColor: BRAND_ACCENT,
    color: ON_ACCENT,
    font: 'inherit',
    fontWeight: 600,
    fontSize: 15,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums',
  },
  trustRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  // ---- Processing-state specimen ----
  specimenBox: {
    marginTop: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  specimenStage: {
    position: 'relative',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  specimenScrim: {
    position: 'absolute',
    inset: 0,
    backgroundColor:
      'light-dark(rgba(255,255,255,0.62), rgba(9,12,10,0.62))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  specimenGhostField: {
    height: 12,
    borderRadius: 6,
    backgroundColor: 'var(--color-background-muted)',
  },
  specimenPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-3)',
    borderRadius: 999,
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-high)',
  },
};

// ============= SMALL PIECES (module level — never inline) =============

/** Mini card-network plate. Dimmed until its network is detected. */
function BrandGlyph({brand, isDim}: {brand: CardBrand; isDim: boolean}) {
  return (
    <span
      style={{
        ...styles.brandGlyph,
        backgroundColor: brand.plate,
        color: brand.mark,
        opacity: isDim ? 0.28 : 1,
      }}
      aria-hidden="true">
      {brand.label.slice(0, 4)}
    </span>
  );
}

/** Payment-element method tab tile (Card / Wallet / Bank debit). */
function MethodTab({
  id,
  label,
  icon,
  isActive,
  onSelect,
}: {
  id: string;
  label: string;
  icon: typeof CreditCardIcon;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      id={\`method-tab-\${id}\`}
      aria-selected={isActive}
      aria-controls={\`method-panel-\${id}\`}
      style={{
        ...styles.methodTab,
        ...(isActive ? styles.methodTabActive : null),
      }}
      onClick={() => onSelect(id)}>
      <span
        style={{
          color: isActive ? BRAND_ACCENT : 'var(--color-text-secondary)',
          display: 'inline-flex',
        }}>
        <Icon icon={icon} size="sm" color="inherit" />
      </span>
      <Text type="supporting" weight={isActive ? 'semibold' : 'normal'}>
        {label}
      </Text>
    </button>
  );
}

/** Right-aligned money row in the totals block. */
function SummaryRow({
  label,
  value,
  isEmphasis,
  isDiscount,
}: {
  label: ReactNode;
  value: string;
  isEmphasis?: boolean;
  isDiscount?: boolean;
}) {
  return (
    <HStack gap={3} vAlign="center">
      <StackItem size="fill" style={{minWidth: 0}}>
        {typeof label === 'string' ? (
          <Text
            type={isEmphasis ? 'body' : 'supporting'}
            weight={isEmphasis ? 'semibold' : 'normal'}
            color={isEmphasis ? 'primary' : 'secondary'}>
            {label}
          </Text>
        ) : (
          label
        )}
      </StackItem>
      <span
        style={{
          ...styles.moneyCell,
          ...(isDiscount ? styles.discountText : null),
        }}>
        <Text
          type={isEmphasis ? 'body' : 'supporting'}
          weight={isEmphasis ? 'semibold' : 'normal'}
          color="inherit"
          hasTabularNumbers>
          {value}
        </Text>
      </span>
    </HStack>
  );
}

/** Express-pay device-wallet button (deliberate inverse-neutral literals). */
function ExpressPayButton({
  label,
  icon,
  ariaLabel,
}: {
  label: string;
  icon: typeof WalletIcon;
  ariaLabel: string;
}) {
  return (
    <button type="button" style={styles.expressBtn} aria-label={ariaLabel}>
      <Icon icon={icon} size="sm" color="inherit" />
      <span>{label}</span>
    </button>
  );
}

// ============= PAGE =============

type PayMethod = 'card' | 'wallet' | 'bank';

const METHOD_TABS: {id: PayMethod; label: string; icon: typeof CreditCardIcon}[] =
  [
    {id: 'card', label: 'Card', icon: CreditCardIcon},
    {id: 'wallet', label: 'Wallet', icon: WalletIcon},
    {id: 'bank', label: 'Bank debit', icon: LandmarkIcon},
  ];

export default function HostedCheckoutFlowTemplate() {
  // Payment element state. The expiry pre-fills 04/24 so the surface
  // ships with exactly one live inline error (per the spec).
  const [method, setMethod] = useState<PayMethod>('card');
  const [email, setEmail] = useState('rowan.ashby@example.com');
  const [cardNumber, setCardNumber] = useState('4029 6041 8842 1057');
  const [expiry, setExpiry] = useState('04/24');
  const [cvc, setCvc] = useState('482');
  const [cardName, setCardName] = useState('Rowan Ashby');
  const [country, setCountry] = useState('US');
  const [zip, setZip] = useState('98107');
  const [saveInfo, setSaveInfo] = useState(true);
  const [routing, setRouting] = useState('125008547');
  const [account, setAccount] = useState('000123467802');
  const [accountType, setAccountType] = useState('checking');
  const [isPromoApplied, setIsPromoApplied] = useState(true);
  const [payAttempted, setPayAttempted] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // ---- Derived money (single source of truth; every panel agrees) ----
  const subtotalCents = useMemo(
    () => LINE_ITEMS.reduce((sum, li) => sum + li.qty * li.unitCents, 0),
    [],
  );
  const discountCents = isPromoApplied
    ? Math.round((subtotalCents * PROMO_PERCENT) / 100)
    : 0;
  const taxCents = Math.round((subtotalCents - discountCents) * TAX_RATE);
  const totalCents =
    subtotalCents - discountCents + SHIPPING_CENTS + taxCents;

  // ---- Derived card validation (during render, never in effects) ----
  const detectedBrand = detectBrand(cardNumber);
  const cardDigits = cardNumber.replace(/\\D/g, '');
  const isCardComplete = cardDigits.length === 16;
  const expiryMessage = expiryError(expiry);
  const hasBlockingError = method === 'card' && expiryMessage != null;

  const handlePay = () => {
    setPayAttempted(true);
    setIsConfirmed(!hasBlockingError);
  };

  const selectMethod = (id: string) => {
    setMethod(id as PayMethod);
    setPayAttempted(false);
    setIsConfirmed(false);
  };

  const payLabel = isConfirmed
    ? 'Payment confirmed'
    : \`Pay \${formatUSD(totalCents)}\`;

  // ---- Left column: merchant order summary ----
  const summaryColumn = (
    <section style={styles.summaryCol} aria-label="Order summary">
      <div style={styles.summaryInner}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Link type="supporting" onClick={() => {}}>
            <HStack gap={1} vAlign="center">
              <Icon icon={ChevronLeftIcon} size="sm" color="inherit" />
              <span>Back</span>
            </HStack>
          </Link>
          <span style={styles.merchantMark} aria-hidden="true">
            <Icon icon={LeafIcon} size="sm" color="inherit" />
          </span>
          <Text type="body" weight="semibold">
            {MERCHANT}
          </Text>
          <Badge label="Sandbox" variant="warning" />
        </HStack>

        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Pay {MERCHANT}
          </Text>
          <span style={styles.totalHeadline}>
            <Heading level={1}>{formatUSD(totalCents)}</Heading>
          </span>
          <Text type="supporting" color="secondary">
            Order FF-20260703-0412 · opened July 3, 2026
          </Text>
        </VStack>

        <VStack gap={3}>
          {LINE_ITEMS.map(li => (
            <HStack key={li.id} gap={3} vAlign="center">
              <div
                style={{
                  ...styles.itemThumb,
                  background: \`linear-gradient(135deg, \${li.thumb[0]} 0%, \${li.thumb[1]} 100%)\`,
                }}
                aria-hidden="true"
              />
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0.5}>
                  <HStack gap={2} vAlign="center">
                    <Text type="supporting" weight="semibold" maxLines={1}>
                      {li.name}
                    </Text>
                    {li.qty > 1 ? (
                      <span style={styles.qtyBubble}>
                        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                          ×{li.qty}
                        </Text>
                      </span>
                    ) : null}
                  </HStack>
                  <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                    {li.detail}
                    {li.qty > 1
                      ? \` · \${formatUSD(li.unitCents)} each\`
                      : ''}
                  </Text>
                </VStack>
              </StackItem>
              <span style={styles.moneyCell}>
                <Text type="supporting" hasTabularNumbers>
                  {formatUSD(li.qty * li.unitCents)}
                </Text>
              </span>
            </HStack>
          ))}
        </VStack>

        <Divider />

        <VStack gap={2}>
          <SummaryRow label="Subtotal" value={formatUSD(subtotalCents)} />
          {isPromoApplied ? (
            <SummaryRow
              isDiscount
              label={
                <span style={styles.promoToken}>
                  <Icon icon={TagIcon} size="xsm" color="inherit" />
                  <Text type="supporting" size="xsm" weight="semibold" color="inherit">
                    {PROMO_CODE}
                  </Text>
                  <IconButton
                    icon={<Icon icon={XIcon} size="xsm" />}
                    label={\`Remove promo code \${PROMO_CODE}\`}
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsPromoApplied(false)}
                  />
                </span>
              }
              value={formatUSD(-discountCents)}
            />
          ) : (
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" color="secondary">
                  Promo code removed
                </Text>
              </StackItem>
              <Link type="supporting" onClick={() => setIsPromoApplied(true)}>
                Re-apply {PROMO_CODE}
              </Link>
            </HStack>
          )}
          <SummaryRow label={SHIPPING_LABEL} value={formatUSD(SHIPPING_CENTS)} />
          <SummaryRow label="Tax (8%)" value={formatUSD(taxCents)} />
          <Divider />
          <SummaryRow
            isEmphasis
            label="Total due"
            value={formatUSD(totalCents)}
          />
        </VStack>

        <div style={styles.poweredRow}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Icon icon={ShieldCheckIcon} size="xsm" color="secondary" />
            <Text type="supporting" size="xsm" color="secondary">
              Powered by {PSP_NAME}
            </Text>
            <Text type="supporting" size="xsm" color="secondary" aria-hidden="true">
              ·
            </Text>
            <Link type="supporting" size="xsm" onClick={() => {}}>
              Terms
            </Link>
            <Text type="supporting" size="xsm" color="secondary" aria-hidden="true">
              ·
            </Text>
            <Link type="supporting" size="xsm" onClick={() => {}}>
              Privacy
            </Link>
          </HStack>
        </div>
      </div>
    </section>
  );

  // ---- Right column: payment element ----
  const cardPanel = (
    <VStack gap={3}>
      <div style={styles.cardNumberWrap}>
        <TextInput
          label="Card number"
          value={cardNumber}
          onChange={value => setCardNumber(formatCardNumber(value))}
          placeholder="1234 1234 1234 1234"
          startIcon={CreditCardIcon}
          width="100%"
        />
        <div style={styles.glyphRail}>
          {CARD_BRANDS.map(brand => (
            <BrandGlyph
              key={brand.id}
              brand={brand}
              isDim={detectedBrand != null && detectedBrand.id !== brand.id}
            />
          ))}
        </div>
      </div>
      {detectedBrand != null ? (
        <HStack gap={2} vAlign="center">
          <span style={{...styles.detectedChip, color: BRAND_ACCENT}}>
            <Icon icon={CreditCardIcon} size="xsm" color="inherit" />
            <Text type="supporting" size="xsm" weight="semibold" color="inherit">
              {detectedBrand.label} detected
            </Text>
          </span>
          <Text type="supporting" size="xsm" color="secondary">
            {isCardComplete
              ? 'Number complete — 16 of 16 digits.'
              : \`\${cardDigits.length} of 16 digits.\`}
          </Text>
        </HStack>
      ) : (
        <Text type="supporting" size="xsm" color="secondary">
          Enter a card number to detect the network.
        </Text>
      )}

      <div style={styles.fieldPair}>
        <div style={styles.fieldHalf}>
          <TextInput
            label="Expiration"
            value={expiry}
            onChange={value => setExpiry(formatExpiry(value))}
            placeholder="MM/YY"
            width="100%"
            status={
              expiryMessage != null
                ? {type: 'error', message: expiryMessage}
                : expiry.length === 5
                  ? {type: 'success'}
                  : undefined
            }
          />
        </div>
        <div style={styles.fieldHalf}>
          <TextInput
            label="Security code"
            value={cvc}
            onChange={value => setCvc(value.replace(/\\D/g, '').slice(0, 4))}
            placeholder="CVC"
            width="100%"
            labelTooltip="The 3-digit code on the back of your card (4 digits on the front for Axiom)."
          />
        </div>
      </div>

      <TextInput
        label="Name on card"
        value={cardName}
        onChange={setCardName}
        placeholder="Full name as printed"
        width="100%"
      />

      <div style={styles.fieldPair}>
        <div style={styles.fieldHalf}>
          <Selector
            label="Country"
            options={COUNTRY_OPTIONS}
            value={country}
            onChange={setCountry}
          />
        </div>
        <div style={styles.fieldHalf}>
          <TextInput
            label="ZIP"
            value={zip}
            onChange={value => setZip(value.replace(/\\D/g, '').slice(0, 5))}
            placeholder="98107"
            width="100%"
          />
        </div>
      </div>

      <Switch
        label={\`Save my info for 1-click checkout with \${PSP_NAME}\`}
        description="Pay faster at Fern & Flint and thousands of other shops."
        value={saveInfo}
        onChange={setSaveInfo}
      />
    </VStack>
  );

  const walletPanel = (
    <VStack gap={3}>
      <Text type="supporting" color="secondary">
        Pay with the wallet on this device. Your card details never touch{' '}
        {MERCHANT}&rsquo;s servers — the wallet shares a one-time token with{' '}
        {PSP_NAME}.
      </Text>
      <button
        type="button"
        style={{...styles.expressBtn, flex: 'none', width: '100%'}}
        aria-label={\`Pay \${formatUSD(totalCents)} with the device wallet\`}>
        <Icon icon={SmartphoneNfcIcon} size="sm" color="inherit" />
        <span>Wallet · Pay {formatUSD(totalCents)}</span>
      </button>
      <HStack gap={2} vAlign="center">
        <Icon icon={LockIcon} size="xsm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          Verified on this device · biometric confirmation required at pay.
        </Text>
      </HStack>
    </VStack>
  );

  const bankPanel = (
    <VStack gap={3}>
      <div style={styles.fieldPair}>
        <div style={styles.fieldHalf}>
          <TextInput
            label="Routing number"
            value={routing}
            onChange={value => setRouting(value.replace(/\\D/g, '').slice(0, 9))}
            placeholder="9 digits"
            width="100%"
            status={routing.length === 9 ? {type: 'success'} : undefined}
          />
        </div>
        <div style={styles.fieldHalf}>
          <TextInput
            label="Account number"
            value={account}
            onChange={value =>
              setAccount(value.replace(/\\D/g, '').slice(0, 12))
            }
            placeholder="Up to 12 digits"
            width="100%"
          />
        </div>
      </div>
      <SegmentedControl
        label="Account type"
        value={accountType}
        onChange={setAccountType}
        size="sm">
        <SegmentedControlItem label="Checking" value="checking" />
        <SegmentedControlItem label="Savings" value="savings" />
      </SegmentedControl>
      <div style={styles.mandateBox}>
        <Text type="supporting" size="xsm" color="secondary">
          By providing your account details, you authorize {MERCHANT} and{' '}
          {PSP_NAME} to debit {formatUSD(totalCents)} from the account above
          on July 3, 2026, per the bank-debit mandate. Debits may take 4
          business days to settle.
        </Text>
      </div>
    </VStack>
  );

  const activePanel =
    method === 'card' ? cardPanel : method === 'wallet' ? walletPanel : bankPanel;

  // ---- Processing-state specimen (static inline figure, not live) ----
  const processingSpecimen = (
    <figure style={{...styles.specimenBox, margin: 0}}>
      <HStack gap={2} vAlign="center">
        <Badge label="Specimen" variant="neutral" />
        <Text type="supporting" size="xsm" color="secondary">
          Processing-state overlay — shown while {PSP_NAME} confirms the
          charge.
        </Text>
      </HStack>
      <div style={styles.specimenStage} aria-hidden="true">
        <VStack gap={2}>
          <div style={{...styles.specimenGhostField, width: '58%'}} />
          <div style={{...styles.specimenGhostField, width: '84%'}} />
          <HStack gap={2}>
            <div style={{...styles.specimenGhostField, width: '40%'}} />
            <div style={{...styles.specimenGhostField, width: '32%'}} />
          </HStack>
          <div
            style={{
              ...styles.payButton,
              height: 34,
              fontSize: 13,
              opacity: 0.55,
            }}>
            Pay {formatUSD(totalCents)}
          </div>
        </VStack>
        <div style={styles.specimenScrim}>
          <span style={styles.specimenPill}>
            <Spinner size="sm" aria-label="Processing payment" />
            <Text type="supporting" weight="semibold">
              Processing — don&rsquo;t close this tab
            </Text>
          </span>
        </div>
      </div>
      <figcaption>
        <Text type="supporting" size="xsm" color="secondary">
          The live form dims under a scrim; the Pay button locks until the
          processor responds (about 2–4 s).
        </Text>
      </figcaption>
    </figure>
  );

  const paymentColumn = (
    <section style={styles.payCol} aria-label="Payment">
      <div style={styles.payInner}>
        <VStack gap={2}>
          <Text type="supporting" weight="semibold" color="secondary">
            Express checkout
          </Text>
          <HStack gap={2} wrap="wrap">
            <ExpressPayButton
              label="Wallet Pay"
              icon={WalletIcon}
              ariaLabel={\`Express checkout: pay \${formatUSD(totalCents)} with the device wallet\`}
            />
            <ExpressPayButton
              label="Tap to Pay"
              icon={SmartphoneNfcIcon}
              ariaLabel={\`Express checkout: pay \${formatUSD(totalCents)} with tap to pay\`}
            />
          </HStack>
        </VStack>

        <div style={styles.orDivider} role="separator" aria-label="Or pay another way">
          <span style={styles.orLine} aria-hidden="true" />
          <Text type="supporting" size="xsm" color="secondary">
            Or pay another way
          </Text>
          <span style={styles.orLine} aria-hidden="true" />
        </div>

        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          width="100%"
        />

        <VStack gap={2}>
          <Text type="supporting" weight="semibold" color="secondary">
            Payment method
          </Text>
          <div style={styles.tabRow} role="tablist" aria-label="Payment method">
            {METHOD_TABS.map(tab => (
              <MethodTab
                key={tab.id}
                id={tab.id}
                label={tab.label}
                icon={tab.icon}
                isActive={method === tab.id}
                onSelect={selectMethod}
              />
            ))}
          </div>
        </VStack>

        <div
          role="tabpanel"
          id={\`method-panel-\${method}\`}
          aria-labelledby={\`method-tab-\${method}\`}>
          {activePanel}
        </div>

        {payAttempted && hasBlockingError ? (
          <Banner
            status="error"
            title="Check your card details"
            description="Your card’s expiration date is in the past. Update it to continue — no charge was attempted."
          />
        ) : null}
        {isConfirmed ? (
          <Banner
            status="success"
            title="Payment confirmed (sandbox)"
            description={\`\${formatUSD(totalCents)} authorized via \${
              method === 'card'
                ? \`\${detectedBrand?.label ?? 'card'} ····\${cardDigits.slice(-4)}\`
                : method === 'wallet'
                  ? 'device wallet'
                  : \`bank debit ····\${account.slice(-4)}\`
            }. Sandbox sessions never move money.\`}
          />
        ) : null}

        <button
          type="button"
          style={{
            ...styles.payButton,
            opacity: isConfirmed ? 0.75 : 1,
            cursor: isConfirmed ? 'default' : 'pointer',
          }}
          onClick={handlePay}
          disabled={isConfirmed}>
          <Icon icon={LockIcon} size="sm" color="inherit" />
          <span>{payLabel}</span>
        </button>

        <div style={styles.trustRow}>
          <Icon icon={ShieldCheckIcon} size="xsm" color="secondary" />
          <Text type="supporting" size="xsm" color="secondary">
            Encrypted end-to-end · PCI DSS Level 1
          </Text>
          <Text type="supporting" size="xsm" color="secondary" aria-hidden="true">
            ·
          </Text>
          <Link type="supporting" onClick={() => {}}>
            Terms
          </Link>
          <Text type="supporting" size="xsm" color="secondary" aria-hidden="true">
            ·
          </Text>
          <Link type="supporting" onClick={() => {}}>
            Privacy
          </Link>
        </div>

        {processingSpecimen}
      </div>
    </section>
  );

  return (
    <div style={styles.root}>
      <div style={styles.splitGrid}>
        {summaryColumn}
        {paymentColumn}
      </div>
    </div>
  );
}
`;export{e as default};