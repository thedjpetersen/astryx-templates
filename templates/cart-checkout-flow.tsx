// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a four-line sample cart with fixed
 *   unit prices in cents, one working promo code BRIGHT15 = 15% off, two
 *   saved addresses, three shipping methods with fixed July 2026 delivery
 *   windows, two saved cards, and a fixed 8.875% tax rate — no Date.now(),
 *   Math.random(), or network assets; product art is CSS gradient swatches)
 * @output Cart & Checkout: four-step commerce checkout — step 1 cart review
 *   (line-item rows with qty steppers, remove, and a promo-code field that
 *   validates against the fixture code), step 2 shipping address with saved
 *   SelectableCards plus a new-address form and a shipping-method RadioList,
 *   step 3 payment method with saved cards, a new-card form, and a
 *   billing-same-as-shipping Switch, step 4 order review (MetadataList +
 *   per-section Edit links) with Place order flipping the page into a
 *   confirmation state (order number, delivery window, totals recap).
 *   Numbered stepper header and a persistent order-summary rail with live
 *   totals (subtotal − promo + shipping + estimated tax).
 * @position Page template; emitted by `astryx template cart-checkout-flow`
 *
 * Frame: Layout height="fill". LayoutHeader carries the checkout title, a
 * "Step N of 4" readout, and a lock-glyph "Secure checkout" affordance.
 * LayoutContent scrolls a centered max-width column (stepper, step Card,
 * Back/Continue footer). The order summary is a 320px LayoutPanel end —
 * pinned by the frame while the step column scrolls, so the totals rail
 * reads as sticky without any position hacks.
 *
 * Choose over form-wizard when the multi-step flow is a purchase with live
 * money math (cart lines, promo, shipping, tax) and a persistent totals
 * rail rather than a one-shot setup form; choose over table-bulk-actions
 * or inbox when rows are priced line items feeding a checkout, not a
 * triage or management surface.
 *
 * Responsive contract:
 * - >640px: the order-summary rail is a 320px LayoutPanel end with a
 *   divider; it never scrolls away while the step column scrolls. The
 *   stepper shows numbered circles with titles beneath.
 * - <=640px: single-pane fallback — the rail is suppressed and replaced by
 *   a full-width order-summary disclosure bar (48px tap target, chevron +
 *   live total) above the step content that expands the same totals Card
 *   inline. The stepper collapses to circles + connectors only; the header
 *   drops the "Secure checkout" label to just the lock glyph and lets the
 *   step readout wrap under the title instead of clipping.
 * - Cart rows: the name/variant column truncates via minWidth 0 + maxLines;
 *   at <=640px the separate unit-price column hides (the line total keeps
 *   the money visible) so a row fits 375px with no horizontal scroll. Qty
 *   steppers and remove are lg IconButtons inside rows with vertical
 *   padding, giving ~40px effective tap targets.
 * - Forms: FormLayout vertical at every width — city/state/ZIP stack, never
 *   sit side by side, so nothing reflows mid-flow.
 * - Footer: Back stays left, the primary action stays right via StackItem
 *   fill; the gate hint between them wraps rather than pushing buttons off
 *   the viewport. Primary actions upgrade to size="lg" on mobile.
 * - Nothing is hover-only: every Tooltip duplicates a visible label or an
 *   aria-label, and all selection surfaces (SelectableCard, RadioList,
 *   steppers, disclosure) are tap + keyboard operable.
 *
 * Container policy (checkout archetype): one Card per step holds the whole
 * step body; cart lines are fixed rows with hairline Dividers inside it.
 * Saved addresses and payment methods are SelectableCard groups (radio-
 * style, state managed at the page root). The totals rail is panel chrome
 * on desktop and becomes a Card only when expanded inline on mobile. All
 * interactions — steppers, remove, promo apply/remove, address + method +
 * card selection, billing toggle, edit links, place order, restore cart —
 * are wired to useState against the fixtures.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  BriefcaseIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  HomeIcon,
  LockIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon,
  Trash2Icon,
  TruckIcon,
  XIcon,
} from 'lucide-react';

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
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Link} from '@astryxdesign/core/Link';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {Selector} from '@astryxdesign/core/Selector';
import {Switch} from '@astryxdesign/core/Switch';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered checkout column; side padding keeps cards off the viewport
  // edges at every width.
  column: {
    maxWidth: 760,
    margin: '0 auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // Stepper: an <ol> of steps joined by connector bars (form-wizard idiom).
  stepper: {
    display: 'flex',
    alignItems: 'flex-start',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    width: '100%',
  },
  // Reset button chrome so done steps stay visually identical to the rest
  // of the stepper while remaining real, focusable buttons.
  stepButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    width: '100%',
    background: 'none',
    border: 'none',
    padding: 0,
    font: 'inherit',
    cursor: 'pointer',
  },
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    boxSizing: 'border-box',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    flexShrink: 0,
  },
  circleDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-inverse, #fff)',
  },
  circleCurrent: {
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    backgroundColor: 'transparent',
  },
  circleUpcoming: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Connectors sit on the circle's vertical center (28px circle → 13px top
  // offset for a 2px bar) and flex to fill the space between steps.
  connector: {
    flex: 1,
    height: 2,
    marginTop: 13,
    backgroundColor: 'var(--color-border, var(--color-background-muted))',
  },
  connectorDone: {
    backgroundColor: 'var(--color-accent)',
  },
  // Product art: fixed gradient swatches, never network images.
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 'var(--radius-md, 8px)',
    flexShrink: 0,
  },
  thumbSmall: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-sm, 6px)',
    flexShrink: 0,
  },
  cartRow: {
    paddingBlock: 'var(--spacing-3)',
  },
  // Qty readout between the stepper buttons: fixed width so rows don't
  // shift when the count changes digit width.
  qtyValue: {
    minWidth: 28,
    textAlign: 'center',
  },
  // Mobile order-summary disclosure: a real button with a 48px tap target.
  summaryToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 48,
    paddingInline: 'var(--spacing-3)',
    boxSizing: 'border-box',
    background: 'var(--color-background-muted)',
    border: 'none',
    borderRadius: 'var(--radius-md, 8px)',
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
  },
  confirmationIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
  },
};

// ============= DATA =============
// The signed-in shopper is Dana Whitfield; "today" is fixed at 2026-07-02,
// so every delivery window below is a hard-coded July 2026 string.

const STEPS = [
  {id: 'cart', title: 'Cart'},
  {id: 'shipping', title: 'Shipping'},
  {id: 'payment', title: 'Payment'},
  {id: 'review', title: 'Review'},
];

interface CartLine {
  id: string;
  name: string;
  variant: string;
  unitPriceCents: number;
  qty: number;
  /** Fixed CSS gradient standing in for product photography. */
  gradient: string;
}

const INITIAL_CART: CartLine[] = [
  {
    id: 'line-headphones',
    name: 'Aurora ANC Headphones',
    variant: 'Graphite',
    unitPriceCents: 18900,
    qty: 1,
    gradient: 'linear-gradient(135deg, #4f46e5, #38bdf8)',
  },
  {
    id: 'line-grinder',
    name: 'Loft Burr Coffee Grinder',
    variant: 'Matte black · 40 mm steel',
    unitPriceCents: 7400,
    qty: 1,
    gradient: 'linear-gradient(135deg, #292524, #a8a29e)',
  },
  {
    id: 'line-tote',
    name: 'Fieldnote Canvas Tote',
    variant: 'Olive · 18 L',
    unitPriceCents: 3200,
    qty: 2,
    gradient: 'linear-gradient(135deg, #4d7c0f, #d9f99d)',
  },
  {
    id: 'line-bottle',
    name: 'Summit Insulated Bottle',
    variant: 'Glacier · 20 oz',
    unitPriceCents: 2800,
    qty: 1,
    gradient: 'linear-gradient(135deg, #0e7490, #a5f3fc)',
  },
];

/** The one working fixture code. Anything else is rejected inline. */
const PROMO_CODE = 'BRIGHT15';
const PROMO_PERCENT = 15;

const TAX_RATE = 0.08875; // fixed NYC-style combined rate

interface SavedAddress {
  id: string;
  label: string;
  icon: typeof HomeIcon;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
}

const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'addr-home',
    label: 'Home',
    icon: HomeIcon,
    name: 'Dana Whitfield',
    line1: '414 Cortelyou Rd, Apt 3F',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11218',
  },
  {
    id: 'addr-work',
    label: 'Work',
    icon: BriefcaseIcon,
    name: 'Dana Whitfield',
    line1: '88 Prince St, Floor 4',
    city: 'New York',
    state: 'NY',
    zip: '10012',
  },
];

const STATE_OPTIONS = [
  {value: 'NY', label: 'New York'},
  {value: 'NJ', label: 'New Jersey'},
  {value: 'CT', label: 'Connecticut'},
  {value: 'CA', label: 'California'},
  {value: 'WA', label: 'Washington'},
];

interface ShipMethod {
  id: string;
  label: string;
  priceCents: number;
  /** Fixed July 2026 window derived from the frozen fixture date. */
  eta: string;
}

const SHIP_METHODS: ShipMethod[] = [
  {
    id: 'standard',
    label: 'Standard',
    priceCents: 0,
    eta: 'Arrives Jul 9 – Jul 13',
  },
  {
    id: 'express',
    label: 'Express',
    priceCents: 900,
    eta: 'Arrives Mon, Jul 6',
  },
  {
    id: 'overnight',
    label: 'Overnight',
    priceCents: 2400,
    eta: 'Arrives Fri, Jul 3 by 8 PM',
  },
];

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expires: string;
}

const SAVED_CARDS: SavedCard[] = [
  {id: 'card-visa', brand: 'Visa', last4: '4242', expires: '09/28'},
  {id: 'card-amex', brand: 'Amex', last4: '3007', expires: '01/27'},
];

const ORDER_NUMBER = 'MS-140823';
const CONTACT_EMAIL = 'dana.whitfield@example.com';

// ============= HELPERS =============
// Pure and deterministic — integer cents in, fixed strings out.

/** 18900 → '$189.00'; 315 → '$3.15'. Money never exceeds $9,999 here. */
function formatUSD(cents: number): string {
  const abs = Math.abs(cents);
  const dollars = Math.floor(abs / 100);
  const remainder = String(abs % 100).padStart(2, '0');
  return `${cents < 0 ? '−' : ''}$${dollars}.${remainder}`;
}

/** Masked card-number entry → last 4 digits (or empty when too short). */
function last4Digits(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 4 ? digits.slice(-4) : '';
}

// ============= STEPPER =============

function Stepper({
  currentStep,
  onStepSelect,
  isCompact,
}: {
  currentStep: number;
  onStepSelect: (index: number) => void;
  isCompact: boolean;
}) {
  return (
    <nav aria-label="Checkout progress">
      <ol style={styles.stepper}>
        {STEPS.map((step, index) => {
          const state =
            index < currentStep
              ? 'done'
              : index === currentStep
                ? 'current'
                : 'upcoming';
          const circleStyle = {
            ...styles.circle,
            ...(state === 'done'
              ? styles.circleDone
              : state === 'current'
                ? styles.circleCurrent
                : styles.circleUpcoming),
          };
          const content = (
            <>
              <div style={circleStyle} aria-hidden="true">
                {state === 'done' ? '✓' : index + 1}
              </div>
              {!isCompact && (
                <Text
                  type="supporting"
                  color={state === 'upcoming' ? 'secondary' : 'primary'}>
                  {step.title}
                </Text>
              )}
            </>
          );
          return (
            <StepFrame
              key={step.id}
              hasConnector={index > 0}
              // A connector is "done" when the step it leads from is done,
              // so the bar into the current step renders filled.
              done={index <= currentStep}
              // Fixed slot width keeps circles evenly spaced whether the
              // step renders as a button (done) or a div; compact mode
              // shrinks slots to the circle so 4 steps fit a 375px viewport.
              width={isCompact ? 28 : 96}>
              {state === 'done' ? (
                // Completed steps are real buttons: revisit without losing
                // anything (all checkout state lives at the page root).
                <button
                  type="button"
                  style={styles.stepButton}
                  onClick={() => onStepSelect(index)}
                  aria-label={`Go back to step ${index + 1}: ${step.title}`}>
                  {content}
                </button>
              ) : (
                <div
                  style={styles.step}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}${
                    state === 'current' ? ' (current)' : ''
                  }`}>
                  {content}
                </div>
              )}
            </StepFrame>
          );
        })}
      </ol>
    </nav>
  );
}

/** One <li> per step; steps after the first carry a leading connector. */
function StepFrame({
  hasConnector,
  done,
  width,
  children,
}: {
  hasConnector: boolean;
  done: boolean;
  width: number;
  children: ReactNode;
}) {
  return (
    <>
      {hasConnector && (
        <li
          role="presentation"
          aria-hidden="true"
          style={{
            ...styles.connector,
            ...(done ? styles.connectorDone : undefined),
          }}
        />
      )}
      <li
        style={{
          display: 'flex',
          justifyContent: 'center',
          width,
          flexShrink: 0,
        }}>
        {children}
      </li>
    </>
  );
}

// ============= ORDER SUMMARY =============
// One body, two frames: the desktop LayoutPanel rail and the mobile
// inline disclosure both render this, so totals can never drift apart.

interface Totals {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
}

function SummaryBody({
  items,
  totals,
  shipLabel,
  appliedPromo,
  onRemovePromo,
}: {
  items: CartLine[];
  totals: Totals;
  shipLabel: string;
  appliedPromo: string | null;
  onRemovePromo: () => void;
}) {
  if (items.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        Your cart is empty — restore the sample cart to keep exploring the
        flow.
      </Text>
    );
  }
  return (
    <VStack gap={3}>
      <VStack gap={2}>
        {items.map(line => (
          <HStack key={line.id} gap={2} vAlign="center">
            <div
              style={{...styles.thumbSmall, background: line.gradient}}
              aria-hidden="true"
            />
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="supporting" maxLines={1}>
                {line.qty} × {line.name}
              </Text>
            </StackItem>
            <Text type="supporting" hasTabularNumbers>
              {formatUSD(line.unitPriceCents * line.qty)}
            </Text>
          </HStack>
        ))}
      </VStack>
      <Divider />
      {appliedPromo != null && (
        <HStack gap={1} vAlign="center">
          <Badge
            label={`${appliedPromo} · −${PROMO_PERCENT}%`}
            variant="success"
          />
          <StackItem size="fill">
            <span />
          </StackItem>
          <IconButton
            label={`Remove promo code ${appliedPromo}`}
            tooltip="Remove promo"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={onRemovePromo}
          />
        </HStack>
      )}
      <VStack gap={1}>
        <SummaryLine label="Subtotal" value={formatUSD(totals.subtotalCents)} />
        {totals.discountCents > 0 && (
          <SummaryLine
            label={`Promo (${PROMO_PERCENT}% off)`}
            value={formatUSD(-totals.discountCents)}
          />
        )}
        <SummaryLine
          label={`Shipping · ${shipLabel}`}
          value={
            totals.shippingCents === 0
              ? 'Free'
              : formatUSD(totals.shippingCents)
          }
        />
        <SummaryLine label="Estimated tax" value={formatUSD(totals.taxCents)} />
      </VStack>
      <Divider />
      <div style={styles.summaryRow}>
        <Text type="body" weight="semibold">
          Total
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="large" weight="semibold" hasTabularNumbers>
          {formatUSD(totals.totalCents)}
        </Text>
      </div>
    </VStack>
  );
}

function SummaryLine({label, value}: {label: string; value: string}) {
  return (
    <div style={styles.summaryRow}>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
      <StackItem size="fill">
        <span />
      </StackItem>
      <Text type="supporting" hasTabularNumbers>
        {value}
      </Text>
    </div>
  );
}

// ============= PAGE =============

export default function CartCheckoutFlowTemplate() {
  const [step, setStep] = useState(0);
  const [isPlaced, setIsPlaced] = useState(false);

  // ---- Step 1: cart + promo ----
  const [items, setItems] = useState<CartLine[]>(INITIAL_CART);
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // ---- Step 2: shipping ----
  const [addressId, setAddressId] = useState('addr-home');
  const [newName, setNewName] = useState('');
  const [newStreet, setNewStreet] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('NY');
  const [newZip, setNewZip] = useState('');
  const [shipMethodId, setShipMethodId] = useState('standard');

  // ---- Step 3: payment ----
  const [cardId, setCardId] = useState('card-visa');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [billingSame, setBillingSame] = useState(true);
  const [billingStreet, setBillingStreet] = useState('');
  const [billingCity, setBillingCity] = useState('');
  const [billingZip, setBillingZip] = useState('');

  // ---- Mobile order-summary disclosure ----
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- Derived, deterministic money math (integer cents throughout) ----
  const subtotalCents = items.reduce(
    (sum, line) => sum + line.unitPriceCents * line.qty,
    0,
  );
  const discountCents =
    appliedPromo != null
      ? Math.round((subtotalCents * PROMO_PERCENT) / 100)
      : 0;
  const shipMethod =
    SHIP_METHODS.find(method => method.id === shipMethodId) ?? SHIP_METHODS[0];
  const shippingCents = items.length === 0 ? 0 : shipMethod.priceCents;
  const taxCents = Math.round((subtotalCents - discountCents) * TAX_RATE);
  const totalCents =
    subtotalCents - discountCents + shippingCents + taxCents;
  const totals: Totals = {
    subtotalCents,
    discountCents,
    shippingCents,
    taxCents,
    totalCents,
  };
  const itemCount = items.reduce((sum, line) => sum + line.qty, 0);

  // ---- Derived address / payment summaries for review + confirmation ----
  const savedAddress = SAVED_ADDRESSES.find(addr => addr.id === addressId);
  const isNewAddress = addressId === 'addr-new';
  const shipToLine = isNewAddress
    ? [
        newName.trim(),
        [newStreet.trim(), newUnit.trim()].filter(Boolean).join(', '),
        `${newCity.trim()}, ${newState} ${newZip.trim()}`,
      ]
        .filter(part => part.replace(/[,\s]/g, '') !== '')
        .join(' · ')
    : savedAddress != null
      ? `${savedAddress.name} · ${savedAddress.line1} · ${savedAddress.city}, ${savedAddress.state} ${savedAddress.zip}`
      : '';

  const savedCard = SAVED_CARDS.find(card => card.id === cardId);
  const isNewCard = cardId === 'card-new';
  const newCardLast4 = last4Digits(cardNumber);
  const paymentLine = isNewCard
    ? newCardLast4 === ''
      ? 'New card'
      : `Card ending ${newCardLast4}`
    : savedCard != null
      ? `${savedCard.brand} ending ${savedCard.last4}`
      : '';

  // ---- Per-step advance gates ----
  const newAddressValid =
    newName.trim() !== '' &&
    newStreet.trim() !== '' &&
    newCity.trim() !== '' &&
    newZip.trim() !== '';
  const newCardValid =
    last4Digits(cardNumber) !== '' &&
    cardName.trim() !== '' &&
    cardExpiry.trim() !== '' &&
    cardCvc.trim() !== '';
  const billingValid =
    billingSame ||
    (billingStreet.trim() !== '' &&
      billingCity.trim() !== '' &&
      billingZip.trim() !== '');

  const cartGate = items.length > 0;
  const shippingGate = !isNewAddress || newAddressValid;
  const paymentGate = (!isNewCard || newCardValid) && billingValid;

  const canAdvance =
    step === 0
      ? cartGate
      : step === 1
        ? shippingGate
        : step === 2
          ? paymentGate
          : cartGate; // review: placing needs a non-empty cart

  const gateHint =
    step === 0 && !cartGate
      ? 'Add at least one item to continue.'
      : step === 1 && !shippingGate
        ? 'Fill in name, street, city, and ZIP to continue.'
        : step === 2 && !paymentGate
          ? !billingValid
            ? 'Fill in the billing address to continue.'
            : 'Fill in the card number, name, expiry, and CVC to continue.'
          : null;

  const isReview = step === STEPS.length - 1;
  const primaryLabel = isReview
    ? `Place order · ${formatUSD(totalCents)}`
    : step === 0
      ? 'Continue to shipping'
      : step === 1
        ? 'Continue to payment'
        : 'Review order';

  // ---- Handlers ----
  const setQty = (lineId: string, delta: number) => {
    setItems(prev =>
      prev.map(line =>
        line.id === lineId
          ? {...line, qty: Math.min(99, Math.max(1, line.qty + delta))}
          : line,
      ),
    );
  };

  const removeLine = (lineId: string) => {
    setItems(prev => prev.filter(line => line.id !== lineId));
  };

  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (code === '') {
      setPromoError('Enter a code first.');
      return;
    }
    if (code === PROMO_CODE) {
      setAppliedPromo(PROMO_CODE);
      setPromoError(null);
      setPromoInput('');
    } else {
      setPromoError(`'${code}' isn't a valid code. Try ${PROMO_CODE}.`);
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const placeOrder = () => {
    setIsPlaced(true);
    setIsSummaryOpen(false);
  };

  const startNewOrder = () => {
    setIsPlaced(false);
    setStep(0);
    setItems(INITIAL_CART);
    setPromoInput('');
    setAppliedPromo(null);
    setPromoError(null);
    setAddressId('addr-home');
    setShipMethodId('standard');
    setCardId('card-visa');
    setBillingSame(true);
  };

  // Steppers and remove get lg icon buttons; with the row's vertical
  // padding, the effective tap target is ~40px+ (mobile contract).
  const controlSize = 'lg' as const;

  // ============= STEP BODIES =============

  const cartStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Review your cart</Heading>
        <Text type="supporting" color="secondary">
          {itemCount === 1 ? '1 item' : `${itemCount} items`} · quantities and
          promo codes update the totals instantly.
        </Text>
      </VStack>

      {items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Everything was removed. Restore the sample cart to keep exploring the checkout flow."
          icon={<Icon icon={ShoppingCartIcon} size="lg" color="secondary" />}
          actions={
            <Button
              label="Restore sample cart"
              variant="primary"
              onClick={() => setItems(INITIAL_CART)}
            />
          }
        />
      ) : (
        <VStack gap={0}>
          {items.map((line, index) => (
            <div key={line.id}>
              <div style={styles.cartRow}>
                <HStack gap={3} vAlign="center">
                  <div
                    style={{...styles.thumb, background: line.gradient}}
                    aria-hidden="true"
                  />
                  <StackItem size="fill" style={{minWidth: 0}}>
                    <VStack gap={0.5}>
                      <Text type="body" weight="semibold" maxLines={1}>
                        {line.name}
                      </Text>
                      <Text type="supporting" color="secondary" maxLines={1}>
                        {line.variant}
                      </Text>
                      {/* Unit price folds into the text column on mobile
                          (the dedicated column hides below 640px). */}
                      {isCompact && (
                        <Text type="supporting" color="secondary">
                          {formatUSD(line.unitPriceCents)} each
                        </Text>
                      )}
                    </VStack>
                  </StackItem>
                  {!isCompact && (
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {formatUSD(line.unitPriceCents)}
                    </Text>
                  )}
                  <HStack gap={1} vAlign="center">
                    <IconButton
                      label={`Decrease quantity of ${line.name}`}
                      tooltip="Decrease quantity"
                      size={controlSize}
                      variant="secondary"
                      isDisabled={line.qty <= 1}
                      icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
                      onClick={() => setQty(line.id, -1)}
                    />
                    <div style={styles.qtyValue}>
                      <Text
                        type="body"
                        weight="semibold"
                        hasTabularNumbers
                        aria-label={`Quantity of ${line.name}: ${line.qty}`}>
                        {line.qty}
                      </Text>
                    </div>
                    <IconButton
                      label={`Increase quantity of ${line.name}`}
                      tooltip="Increase quantity"
                      size={controlSize}
                      variant="secondary"
                      isDisabled={line.qty >= 99}
                      icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                      onClick={() => setQty(line.id, 1)}
                    />
                  </HStack>
                  <Text type="body" weight="semibold" hasTabularNumbers>
                    {formatUSD(line.unitPriceCents * line.qty)}
                  </Text>
                  <IconButton
                    label={`Remove ${line.name} from cart`}
                    tooltip="Remove item"
                    size={controlSize}
                    variant="ghost"
                    icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                    onClick={() => removeLine(line.id)}
                  />
                </HStack>
              </div>
              {index < items.length - 1 && <Divider />}
            </div>
          ))}
        </VStack>
      )}

      <Divider />

      {/* Promo code: one working fixture code (BRIGHT15). */}
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TagIcon} size="sm" color="secondary" />
          <Text type="body" weight="semibold">
            Promo code
          </Text>
          {appliedPromo != null && (
            <Badge label={`${appliedPromo} applied`} variant="success" />
          )}
        </HStack>
        {appliedPromo == null ? (
          <>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <TextInput
                  label="Promo code"
                  isLabelHidden
                  width="100%"
                  placeholder={`Try ${PROMO_CODE}`}
                  value={promoInput}
                  onChange={value => {
                    setPromoInput(value);
                    setPromoError(null);
                  }}
                />
              </StackItem>
              <Button
                label="Apply"
                variant="secondary"
                isDisabled={items.length === 0}
                onClick={applyPromo}
              />
            </HStack>
            {promoError != null && (
              <FieldStatus
                variant="detached"
                type="error"
                message={promoError}
              />
            )}
          </>
        ) : (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <FieldStatus
                variant="detached"
                type="success"
                message={`${PROMO_PERCENT}% off applied — saving ${formatUSD(discountCents)} on this order.`}
              />
            </StackItem>
            <Button label="Remove" variant="ghost" onClick={removePromo} />
          </HStack>
        )}
      </VStack>
    </VStack>
  );

  const shippingStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Shipping address</Heading>
        <Text type="supporting" color="secondary">
          Pick a saved address or enter a new one. The shipping method
          updates the total in the order summary.
        </Text>
      </VStack>

      <VStack gap={2}>
        {SAVED_ADDRESSES.map(addr => (
          <SelectableCard
            key={addr.id}
            label={`Ship to ${addr.label}: ${addr.line1}, ${addr.city}`}
            isSelected={addressId === addr.id}
            onChange={() => setAddressId(addr.id)}
            padding={3}
            width="100%">
            <HStack gap={3} vAlign="center">
              <Icon icon={addr.icon} size="sm" color="secondary" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0.5}>
                  <HStack gap={2} vAlign="center">
                    <Text type="body" weight="semibold">
                      {addr.label}
                    </Text>
                    {addr.id === 'addr-home' && (
                      <Badge label="Default" variant="neutral" />
                    )}
                  </HStack>
                  <Text type="supporting" color="secondary" maxLines={2}>
                    {addr.name} · {addr.line1} · {addr.city}, {addr.state}{' '}
                    {addr.zip}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          </SelectableCard>
        ))}
        <SelectableCard
          label="Use a new address"
          isSelected={isNewAddress}
          onChange={() => setAddressId('addr-new')}
          padding={3}
          width="100%">
          <HStack gap={3} vAlign="center">
            <Icon icon={PlusIcon} size="sm" color="secondary" />
            <Text type="body" weight="semibold">
              Use a new address
            </Text>
          </HStack>
        </SelectableCard>
      </VStack>

      {isNewAddress && (
        <FormLayout>
          <TextInput
            label="Full name"
            isRequired
            value={newName}
            onChange={setNewName}
            placeholder="Dana Whitfield"
          />
          <TextInput
            label="Street address"
            isRequired
            value={newStreet}
            onChange={setNewStreet}
            placeholder="123 Main St"
          />
          <TextInput
            label="Apt, suite, etc."
            isOptional
            value={newUnit}
            onChange={setNewUnit}
            placeholder="Apt 4B"
          />
          <TextInput
            label="City"
            isRequired
            value={newCity}
            onChange={setNewCity}
            placeholder="Brooklyn"
          />
          <Selector
            label="State"
            options={STATE_OPTIONS}
            value={newState}
            onChange={setNewState}
          />
          <TextInput
            label="ZIP code"
            isRequired
            value={newZip}
            onChange={setNewZip}
            placeholder="11218"
          />
        </FormLayout>
      )}

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TruckIcon} size="sm" color="secondary" />
          <Text type="body" weight="semibold">
            Shipping method
          </Text>
        </HStack>
        <RadioList
          label="Shipping method"
          isLabelHidden
          value={shipMethodId}
          onChange={setShipMethodId}>
          {SHIP_METHODS.map(method => (
            <RadioListItem
              key={method.id}
              label={
                method.priceCents === 0
                  ? `${method.label} — Free`
                  : `${method.label} — ${formatUSD(method.priceCents)}`
              }
              value={method.id}
              description={method.eta}
              endContent={
                method.id === 'standard' ? (
                  <Badge variant="success" label="Free" />
                ) : undefined
              }
            />
          ))}
        </RadioList>
      </VStack>
    </VStack>
  );

  const paymentStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Payment method</Heading>
        <Text type="supporting" color="secondary">
          Charged when the order ships. Saved cards are stored with the
          payment processor — this demo never sends anything anywhere.
        </Text>
      </VStack>

      <VStack gap={2}>
        {SAVED_CARDS.map(card => (
          <SelectableCard
            key={card.id}
            label={`Pay with ${card.brand} ending ${card.last4}`}
            isSelected={cardId === card.id}
            onChange={() => setCardId(card.id)}
            padding={3}
            width="100%">
            <HStack gap={3} vAlign="center">
              <Icon icon={CreditCardIcon} size="sm" color="secondary" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0.5}>
                  <Text type="body" weight="semibold">
                    {card.brand} •••• {card.last4}
                  </Text>
                  <Text type="supporting" color="secondary">
                    Expires {card.expires}
                  </Text>
                </VStack>
              </StackItem>
              {card.id === 'card-visa' && (
                <Badge label="Default" variant="neutral" />
              )}
            </HStack>
          </SelectableCard>
        ))}
        <SelectableCard
          label="Pay with a new card"
          isSelected={isNewCard}
          onChange={() => setCardId('card-new')}
          padding={3}
          width="100%">
          <HStack gap={3} vAlign="center">
            <Icon icon={PlusIcon} size="sm" color="secondary" />
            <Text type="body" weight="semibold">
              Use a new card
            </Text>
          </HStack>
        </SelectableCard>
      </VStack>

      {isNewCard && (
        <FormLayout>
          <TextInput
            label="Card number"
            isRequired
            value={cardNumber}
            onChange={setCardNumber}
            placeholder="4242 4242 4242 4242"
          />
          <TextInput
            label="Name on card"
            isRequired
            value={cardName}
            onChange={setCardName}
            placeholder="Dana Whitfield"
          />
          <TextInput
            label="Expiry (MM/YY)"
            isRequired
            value={cardExpiry}
            onChange={setCardExpiry}
            placeholder="09/28"
          />
          <TextInput
            label="CVC"
            isRequired
            description="3 digits on the back, 4 on the front for Amex."
            value={cardCvc}
            onChange={setCardCvc}
            placeholder="123"
          />
        </FormLayout>
      )}

      <Divider />

      <VStack gap={3}>
        <Switch
          label="Billing address same as shipping"
          description={
            shipToLine === ''
              ? 'Uses the address from the previous step.'
              : `Bills to: ${shipToLine}`
          }
          value={billingSame}
          onChange={setBillingSame}
        />
        {!billingSame && (
          <FormLayout>
            <TextInput
              label="Billing street address"
              isRequired
              value={billingStreet}
              onChange={setBillingStreet}
              placeholder="123 Main St"
            />
            <TextInput
              label="Billing city"
              isRequired
              value={billingCity}
              onChange={setBillingCity}
              placeholder="Brooklyn"
            />
            <TextInput
              label="Billing ZIP"
              isRequired
              value={billingZip}
              onChange={setBillingZip}
              placeholder="11218"
            />
          </FormLayout>
        )}
      </VStack>
    </VStack>
  );

  const reviewStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Review your order</Heading>
        <Text type="supporting" color="secondary">
          Nothing is charged until you place the order. Use the Edit links
          (or the stepper above) to change anything.
        </Text>
      </VStack>

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Items ({itemCount})
            </Text>
          </StackItem>
          <Link type="supporting" onClick={() => setStep(0)}>
            Edit
          </Link>
        </HStack>
        <VStack gap={2}>
          {items.map(line => (
            <HStack key={line.id} gap={2} vAlign="center">
              <div
                style={{...styles.thumbSmall, background: line.gradient}}
                aria-hidden="true"
              />
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" maxLines={1}>
                  {line.qty} × {line.name} — {line.variant}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers>
                {formatUSD(line.unitPriceCents * line.qty)}
              </Text>
            </HStack>
          ))}
        </VStack>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="body" weight="semibold">
              Shipping &amp; payment
            </Text>
          </StackItem>
          <Link type="supporting" onClick={() => setStep(1)}>
            Edit shipping
          </Link>
          <Link type="supporting" onClick={() => setStep(2)}>
            Edit payment
          </Link>
        </HStack>
        <MetadataList columns="multi">
          <MetadataListItem label="Ship to">
            {shipToLine === '' ? '—' : shipToLine}
          </MetadataListItem>
          <MetadataListItem label="Method">
            {shipMethod.label} · {shipMethod.eta}
          </MetadataListItem>
          <MetadataListItem label="Payment">{paymentLine}</MetadataListItem>
          <MetadataListItem label="Billing address">
            {billingSame
              ? 'Same as shipping'
              : `${billingStreet.trim() || '—'}, ${billingCity.trim() || '—'} ${billingZip.trim()}`}
          </MetadataListItem>
          <MetadataListItem label="Contact">{CONTACT_EMAIL}</MetadataListItem>
          <MetadataListItem label="Order total">
            {formatUSD(totalCents)}
          </MetadataListItem>
        </MetadataList>
      </VStack>

      <Divider />
      <Text type="supporting" color="secondary">
        By placing this order you agree to the Meridian Supply Terms of Sale
        and Return Policy. Standard returns are free within 30 days.
      </Text>
    </VStack>
  );

  // ============= CONFIRMATION =============

  const confirmation = (
    <Card padding={5} width="100%">
      <VStack gap={4} hAlign="center">
        <div style={styles.confirmationIcon}>
          <Icon icon={CheckCircle2Icon} size="lg" color="success" />
        </div>
        <VStack gap={1} hAlign="center">
          <Heading level={2}>Order confirmed</Heading>
          <Text type="supporting" color="secondary">
            Order {ORDER_NUMBER} — a receipt is on its way to {CONTACT_EMAIL}.
          </Text>
        </VStack>
        <Divider />
        <MetadataList columns="multi">
          <MetadataListItem label="Order number">
            {ORDER_NUMBER}
          </MetadataListItem>
          <MetadataListItem label="Items">
            {itemCount === 1 ? '1 item' : `${itemCount} items`}
          </MetadataListItem>
          <MetadataListItem label="Ship to">
            {shipToLine === '' ? '—' : shipToLine}
          </MetadataListItem>
          <MetadataListItem label="Delivery">
            {shipMethod.label} · {shipMethod.eta}
          </MetadataListItem>
          <MetadataListItem label="Payment">{paymentLine}</MetadataListItem>
          <MetadataListItem label="Total charged">
            {formatUSD(totalCents)}
          </MetadataListItem>
        </MetadataList>
        <HStack gap={2}>
          <Button
            label="Start a new order"
            variant="primary"
            size={isCompact ? 'lg' : 'md'}
            onClick={startNewOrder}
          />
          <Button label="View order history" variant="ghost" />
        </HStack>
      </VStack>
    </Card>
  );

  // ============= SUMMARY FRAMES =============

  const summaryBody = (
    <SummaryBody
      items={items}
      totals={totals}
      shipLabel={shipMethod.label}
      appliedPromo={appliedPromo}
      onRemovePromo={removePromo}
    />
  );

  // Desktop rail: pinned LayoutPanel end — the frame keeps it in view
  // while the step column scrolls, which is the "sticky rail" behavior.
  const summaryRail = (
    <LayoutPanel width={320} padding={4} hasDivider>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Order summary</Heading>
          </StackItem>
          <Badge
            label={itemCount === 1 ? '1 item' : `${itemCount} items`}
            variant="neutral"
          />
        </HStack>
        {summaryBody}
        <Divider />
        <HStack gap={2} vAlign="center">
          <Icon icon={LockIcon} size="xsm" color="secondary" />
          <Text type="supporting" color="secondary">
            Payments are encrypted end to end.
          </Text>
        </HStack>
      </VStack>
    </LayoutPanel>
  );

  // Mobile fallback: the same body behind a 48px disclosure bar above the
  // step content — single pane, no docked panel below 640px.
  const summaryDisclosure = (
    <VStack gap={2}>
      <button
        type="button"
        style={styles.summaryToggle}
        aria-expanded={isSummaryOpen}
        onClick={() => setIsSummaryOpen(open => !open)}>
        <Icon icon={ShoppingCartIcon} size="sm" color="secondary" />
        <Text type="body" weight="semibold">
          Order summary
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="body" weight="semibold" hasTabularNumbers>
          {formatUSD(totalCents)}
        </Text>
        <Icon
          icon={isSummaryOpen ? ChevronUpIcon : ChevronDownIcon}
          size="sm"
          color="secondary"
        />
      </button>
      {isSummaryOpen && (
        <Card padding={4} width="100%">
          {summaryBody}
        </Card>
      )}
    </VStack>
  );

  // ============= FRAME =============

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* wrap lets the step readout drop under the title at 375px
              instead of clipping the lock affordance off-viewport. */}
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>Checkout</Heading>
                <Text type="supporting" color="secondary">
                  {isPlaced
                    ? `Order ${ORDER_NUMBER} confirmed`
                    : `Step ${step + 1} of ${STEPS.length}: ${STEPS[step].title}`}
                </Text>
              </HStack>
            </StackItem>
            <HStack gap={1} vAlign="center">
              <Icon icon={LockIcon} size="sm" color="secondary" />
              {/* Label collapses to the glyph alone on mobile. */}
              {!isCompact && (
                <Text type="supporting" color="secondary">
                  Secure checkout
                </Text>
              )}
            </HStack>
          </HStack>
        </LayoutHeader>
      }
      end={!isCompact && !isPlaced ? summaryRail : undefined}
      content={
        <LayoutContent padding={0}>
          <div style={styles.column}>
            {isPlaced ? (
              confirmation
            ) : (
              <VStack gap={5}>
                <Stepper
                  currentStep={step}
                  onStepSelect={setStep}
                  isCompact={isCompact}
                />

                {isCompact && summaryDisclosure}

                <Card padding={5} width="100%">
                  {step === 0 && cartStep}
                  {step === 1 && shippingStep}
                  {step === 2 && paymentStep}
                  {isReview && reviewStep}
                </Card>

                <HStack gap={2} vAlign="center">
                  <Button
                    label="Back"
                    variant="secondary"
                    size={isCompact ? 'lg' : 'md'}
                    isDisabled={step === 0}
                    onClick={() =>
                      setStep(current => Math.max(0, current - 1))
                    }
                  />
                  <StackItem size="fill">
                    {gateHint != null && (
                      <Text type="supporting" color="secondary">
                        {gateHint}
                      </Text>
                    )}
                  </StackItem>
                  <Button
                    label={primaryLabel}
                    variant="primary"
                    size={isCompact ? 'lg' : 'md'}
                    isDisabled={!canAdvance}
                    onClick={() => {
                      if (isReview) {
                        placeOrder();
                      } else {
                        setStep(current =>
                          Math.min(STEPS.length - 1, current + 1),
                        );
                      }
                    }}
                  />
                </HStack>
              </VStack>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
