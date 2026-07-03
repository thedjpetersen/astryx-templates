var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (a fixed order with line items, reason
 *   codes, exchange variant lists, drop-off methods with fees, a fixed RMA
 *   number and return-by date — no clocks, no randomness, no network assets;
 *   item art is gradient placeholder tiles)
 * @output Returns & Exchange: a guided five-step return flow for a fixture
 *   order. Step 1 selects items with per-item checkboxes and qty steppers
 *   (a final-sale row stays disabled); step 2 assigns a reason code per
 *   item (damaged / wrong-item reasons waive the drop-off fee); step 3
 *   picks the resolution — refund to the original card, store credit with
 *   a +10% bonus, or exchange with a per-item variant picker; step 4
 *   chooses a drop-off method with fees; step 5 confirms with a
 *   MetadataList summary and a printable-label (or QR-code) placeholder.
 *   A docked end panel keeps a live refund summary in view the whole way.
 * @position Page template; emitted by \`astryx template returns-exchange-flow\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the storefront chrome
 * (brand tile, "Start a return" title, order Badge, step readout, ghost
 * Back to orders). LayoutContent scrolls and centers a single max-width
 * column: stepper, step Card, footer actions. LayoutPanel (end, 320) docks
 * the live return summary — selected items, subtotal, bonus, fees, and the
 * estimated refund recompute on every interaction.
 *
 * Responsive contract:
 * - Content column: maxWidth 640, centered, viewport-side padding at every
 *   width; the step Card always fills the column.
 * - Summary panel: >640px docks at the end (width 320, own scroll);
 *   <=640px the panel is removed entirely and the same summary renders as
 *   a Collapsible Card between the step Card and the footer (trigger shows
 *   the live refund total, so the number stays visible even collapsed).
 * - Stepper: >640px shows numbered circles with step titles beneath;
 *   <=640px hides the titles (circles + connectors only) — the current
 *   step's title stays visible in the header readout and the Card heading.
 *   Five 28px circles plus connectors fit a 375px viewport.
 * - Header: brand + title + order Badge wrap onto multiple rows below
 *   640px instead of truncating; the placed/paid supporting line hides on
 *   narrow because the same facts live in the summary and confirmation.
 * - Tap targets: item checkboxes keep their full clickable label rows
 *   (name + variant text toggles the box); qty stepper IconButtons and the
 *   sm print/download buttons grow to 40px boxes at <=640px while glyphs
 *   stay "sm". Nothing is hover-only: step circles carry aria-labels, the
 *   fee-waived note renders as visible text, and every Tooltip doubles a
 *   visible label.
 * - Wide content: the label-placeholder barcode is a fixed ~200px bar row
 *   and the QR grid is 7x7 at 10px cells, so neither can force horizontal
 *   scroll at 375px; address lines wrap normally.
 *
 * Color policy: token/light-dark hybrid. Chrome, text, borders, and the
 * label paper all use var(--color-*) tokens. Two surfaces are deliberately
 * scheme-locked with literal colors and a pinned colorScheme: (1) the
 * gradient item-art tiles (ItemThumb) are brand product art — same pixels
 * in both themes, white monogram literal on top; (2) the QR placeholder is
 * scannable "paper" — dark cells on a white grid in both themes, like a
 * real printed code. Everything else adapts to light/dark via tokens.
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
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
// Check/warning glyphs come from the Icon name registry instead.
import {
  CreditCardIcon,
  DownloadIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  PrinterIcon,
  QrCodeIcon,
  RotateCcwIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered single-task column; side padding keeps the card off the
  // viewport edges at every width.
  column: {
    maxWidth: 640,
    margin: '0 auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // Storefront brand tile in the page header.
  brandTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
  },
  // Stepper: an <ol> of steps joined by connector bars.
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
  // Reset button chrome so done steps stay visually identical to the
  // rest of the stepper while remaining real, focusable buttons.
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
    color: 'var(--color-on-accent)',
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
  // Connectors sit on the circle's vertical center (28px circle → 13px
  // top offset for a 2px bar) and flex to fill the space between steps.
  connector: {
    flex: 1,
    height: 2,
    marginTop: 13,
    backgroundColor: 'var(--color-border, var(--color-background-muted))',
  },
  connectorDone: {
    backgroundColor: 'var(--color-accent)',
  },
  // Gradient placeholder art for line items (no network images).
  // Scheme-locked brand product art: identical pixels in both themes (see
  // header "Color policy"), so the monogram stays a literal white too.
  itemThumb: {
    width: 44,
    height: 44,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-container)',
    colorScheme: 'dark',
    color: '#fff',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    letterSpacing: '0.03em',
  },
  itemThumbSmall: {
    width: 28,
    height: 28,
    fontSize: 10,
  },
  itemRow: {
    paddingBlock: 'var(--spacing-2)',
  },
  // Keep the checkbox column from collapsing next to fill items.
  itemBody: {
    minWidth: 0,
  },
  qtyReadout: {
    minWidth: 56,
    textAlign: 'center',
  },
  // <=640px: grow sm controls to 40px hit targets (the sm box is fine for
  // pointers but too small for thumbs); glyphs stay "sm".
  iconTapTarget: {width: 40, height: 40},
  buttonTapTarget: {height: 40},
  // Printable label placeholder: dashed frame around a fake carrier label.
  labelBox: {
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
  },
  labelInner: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
  },
  // Deterministic fake barcode: fixed bar widths, ~200px total, so it
  // always fits a 375px viewport without horizontal scroll.
  barcodeRow: {
    display: 'flex',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 2,
    height: 48,
  },
  barcodeBar: {
    backgroundColor: 'var(--color-text)',
  },
  // Deterministic QR placeholder: 7x7 grid of 10px cells.
  // Scheme-locked "paper": a QR code stays dark-on-white in both themes
  // like a real printed code (see header "Color policy"); the pinned
  // colorScheme resolves the border token to its light value here.
  qrGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 10px)',
    gridAutoRows: 10,
    gap: 2,
    padding: 6,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    colorScheme: 'light',
    backgroundColor: '#fff',
  },
  qrCellOn: {
    // Literal dark cells on the locked white paper above.
    backgroundColor: '#111',
    borderRadius: 1,
  },
  qrCellOff: {
    backgroundColor: 'transparent',
  },
  summaryPanelBody: {
    padding: 'var(--spacing-4)',
  },
};

// ============= DATA =============
// Deterministic fixtures: one fixed order, reason codes, exchange
// variants, drop-off methods, RMA number, return-by date.

const ORDER_NUMBER = 'NW-20351';
const ORDER_PLACED = 'May 14, 2026';
const RETURN_BY = 'Jun 13, 2026';
const PAYMENT_METHOD = 'Visa •••• 4242';
const RMA_NUMBER = 'RMA-88213-QK';
const CREDIT_BONUS_PCT = 10;

interface OrderItem {
  id: string;
  name: string;
  variant: string;
  unitPriceCents: number;
  qtyOrdered: number;
  initials: string;
  gradient: string;
  isFinalSale?: boolean;
}

// Scheme-locked brand art: the gradient stops below are deliberate hex
// literals — product art keeps the same pixels in light and dark (see the
// header "Color policy"; ItemThumb pins colorScheme).

const ORDER_ITEMS: OrderItem[] = [
  {
    id: 'li-tee',
    name: 'Trailhead Tee',
    variant: 'Heather Sage / M',
    unitPriceCents: 3200,
    qtyOrdered: 2,
    initials: 'TT',
    gradient: 'linear-gradient(135deg, #0f766e, #5eead4)',
  },
  {
    id: 'li-shell',
    name: 'Ridgeline Rain Shell',
    variant: 'Storm Blue / L',
    unitPriceCents: 14800,
    qtyOrdered: 1,
    initials: 'RS',
    gradient: 'linear-gradient(135deg, #1d4ed8, #93c5fd)',
  },
  {
    id: 'li-socks',
    name: 'Switchback Socks 3-Pack',
    variant: 'Mixed / L',
    unitPriceCents: 1800,
    qtyOrdered: 1,
    initials: 'SS',
    gradient: 'linear-gradient(135deg, #b45309, #fcd34d)',
  },
  {
    id: 'li-cap',
    name: 'Summit Cap',
    variant: 'Clay / One size',
    unitPriceCents: 2600,
    qtyOrdered: 1,
    initials: 'SC',
    gradient: 'linear-gradient(135deg, #9d174d, #f9a8d4)',
  },
  {
    id: 'li-gift',
    name: 'Basecamp Gift Card',
    variant: 'Digital / $50',
    unitPriceCents: 5000,
    qtyOrdered: 1,
    initials: 'GC',
    gradient: 'linear-gradient(135deg, #374151, #9ca3af)',
    isFinalSale: true,
  },
];

const REASON_OPTIONS = [
  {value: 'too-small', label: 'Too small'},
  {value: 'too-large', label: 'Too large'},
  {value: 'damaged', label: 'Arrived damaged or defective'},
  {value: 'not-as-described', label: 'Not as described'},
  {value: 'wrong-item', label: 'Wrong item was sent'},
  {value: 'changed-mind', label: 'Changed my mind'},
  {value: 'arrived-late', label: 'Arrived too late'},
];

const REASON_LABELS: Record<string, string> = Object.fromEntries(
  REASON_OPTIONS.map(option => [option.value, option.label]),
);

// Reasons that are our fault waive the drop-off fee downstream.
const FEE_WAIVING_REASONS = new Set(['damaged', 'wrong-item']);

// Same-price replacement variants per item — exchanges are always even,
// so the summary never has to model a price delta charge.
const EXCHANGE_VARIANTS: Record<string, Array<{value: string; label: string}>> =
  {
    'li-tee': [
      {value: 'tee-sage-s', label: 'Heather Sage / S'},
      {value: 'tee-sage-l', label: 'Heather Sage / L'},
      {value: 'tee-clay-m', label: 'Clay / M'},
      {value: 'tee-slate-m', label: 'Slate / M'},
    ],
    'li-shell': [
      {value: 'shell-blue-m', label: 'Storm Blue / M'},
      {value: 'shell-blue-xl', label: 'Storm Blue / XL'},
      {value: 'shell-moss-l', label: 'Moss / L'},
    ],
    'li-socks': [
      {value: 'socks-mixed-m', label: 'Mixed / M'},
      {value: 'socks-solid-l', label: 'Solid Gray / L'},
    ],
    'li-cap': [
      {value: 'cap-slate', label: 'Slate / One size'},
      {value: 'cap-sage', label: 'Sage / One size'},
    ],
  };

type ResolutionId = 'refund' | 'credit' | 'exchange';

const RESOLUTION_LABELS: Record<ResolutionId, string> = {
  refund: 'Refund to original payment',
  credit: \`Store credit (+\${CREDIT_BONUS_PCT}% bonus)\`,
  exchange: 'Exchange for a different variant',
};

interface DropoffMethod {
  id: string;
  label: string;
  description: string;
  feeCents: number;
  detail: string;
}

const DROPOFF_METHODS: DropoffMethod[] = [
  {
    id: 'qr',
    label: 'Carrier drop-off with QR code',
    description: 'No printer or box needed — the counter packs it for you.',
    feeCents: 0,
    detail: 'Nearest SwiftParcel counter: Maple & 3rd, 0.4 mi away.',
  },
  {
    id: 'label',
    label: 'Print a prepaid label at home',
    description: 'Box the items yourself and drop at any SwiftParcel point.',
    feeCents: 0,
    detail: 'Any box works — cover or remove old shipping barcodes.',
  },
  {
    id: 'pickup',
    label: 'Scheduled home pickup',
    description: 'A driver collects the boxed return at your door.',
    feeCents: 799,
    detail: 'Next available window: Tue Jun 2, 8:00–12:00.',
  },
  {
    id: 'store',
    label: 'Return in store',
    description: 'Bring the items to any Basecamp Outfitters location.',
    feeCents: 0,
    detail: 'Refunds process at the register — no waiting on transit.',
  },
];

const STEPS = [
  {id: 'items', title: 'Items'},
  {id: 'reasons', title: 'Reasons'},
  {id: 'resolution', title: 'Resolution'},
  {id: 'dropoff', title: 'Drop-off'},
  {id: 'done', title: 'Done'},
];

// Fixed bar widths for the fake label barcode (sums to ~200px with gaps).
const BARCODE_BARS = [
  3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 3, 1, 2,
  1, 1, 3, 1, 2,
];

// Fixed 7x7 fill pattern for the QR placeholder (1 = dark cell).
const QR_PATTERN = [
  [1, 1, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 1, 0],
  [1, 1, 1, 0, 1, 0, 1],
];

const WAREHOUSE_ADDRESS = 'Basecamp Returns, 4180 Meridian Way, Reno NV 89502';
const CUSTOMER_ADDRESS = 'Rosa Marchetti, 212 Alder St Apt 4, Portland OR 97204';

// ============= HELPERS =============

function formatCents(cents: number): string {
  return \`$\${(cents / 100).toFixed(2)}\`;
}

// ============= STEPPER =============

function Stepper({
  currentStep,
  onStepSelect,
  isCompact,
  isLocked,
}: {
  currentStep: number;
  onStepSelect: (index: number) => void;
  isCompact: boolean;
  isLocked: boolean;
}) {
  return (
    <nav aria-label="Return progress">
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
              // shrinks slots to the circle so 5 steps fit a 375px viewport.
              width={isCompact ? 28 : 84}>
              {state === 'done' && !isLocked ? (
                // Completed steps are real buttons: revisit without losing
                // any entered values (state lives at the flow root). Once
                // the return is submitted the stepper locks read-only.
                <button
                  type="button"
                  style={styles.stepButton}
                  onClick={() => onStepSelect(index)}
                  aria-label={\`Go back to step \${index + 1}: \${step.title}\`}>
                  {content}
                </button>
              ) : (
                <div
                  style={styles.step}
                  aria-current={state === 'current' ? 'step' : undefined}
                  aria-label={\`Step \${index + 1}: \${step.title}\${
                    state === 'current' ? ' (current)' : ''
                  }\`}>
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
  children: React.ReactNode;
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

// ============= ITEM ART =============

/** Gradient placeholder tile with the item's initials — no real images. */
function ItemThumb({item, small}: {item: OrderItem; small?: boolean}) {
  return (
    <div
      style={{
        ...styles.itemThumb,
        ...(small ? styles.itemThumbSmall : undefined),
        background: item.gradient,
      }}
      aria-hidden="true">
      {item.initials}
    </div>
  );
}

// ============= QTY STEPPER =============

/**
 * Minus / readout / plus quantity stepper for a selected line item.
 * Buttons clamp to 1..qtyOrdered; on narrow viewports both IconButtons
 * grow to 40px hit targets while the glyphs stay "sm".
 */
function QtyStepper({
  item,
  qty,
  isNarrow,
  onChange,
}: {
  item: OrderItem;
  qty: number;
  isNarrow: boolean;
  onChange: (qty: number) => void;
}) {
  return (
    <HStack gap={1} vAlign="center">
      <IconButton
        label={\`Return one fewer \${item.name}\`}
        tooltip="Decrease quantity"
        icon={<Icon icon={MinusIcon} size="sm" />}
        variant="ghost"
        size="sm"
        style={isNarrow ? styles.iconTapTarget : undefined}
        isDisabled={qty <= 1}
        onClick={() => onChange(Math.max(1, qty - 1))}
      />
      <div style={styles.qtyReadout}>
        <Text type="body" size="sm" weight="medium">
          {qty} of {item.qtyOrdered}
        </Text>
      </div>
      <IconButton
        label={\`Return one more \${item.name}\`}
        tooltip="Increase quantity"
        icon={<Icon icon={PlusIcon} size="sm" />}
        variant="ghost"
        size="sm"
        style={isNarrow ? styles.iconTapTarget : undefined}
        isDisabled={qty >= item.qtyOrdered}
        onClick={() => onChange(Math.min(item.qtyOrdered, qty + 1))}
      />
    </HStack>
  );
}

// ============= SUMMARY =============

interface SummaryFigures {
  selected: Array<{item: OrderItem; qty: number}>;
  subtotalCents: number;
  bonusCents: number;
  feeCents: number;
  isFeeWaived: boolean;
  totalCents: number;
  resolution: ResolutionId;
}

/**
 * Live return summary: selected items, subtotal, store-credit bonus,
 * drop-off fee (with waived state), and the estimated refund/credit.
 * Rendered in the docked end panel above 640px and inside a Collapsible
 * Card below it — same content, one source of truth.
 */
function ReturnSummary({figures}: {figures: SummaryFigures}) {
  const {
    selected,
    subtotalCents,
    bonusCents,
    feeCents,
    isFeeWaived,
    totalCents,
    resolution,
  } = figures;

  if (selected.length === 0) {
    return (
      <VStack gap={2}>
        <Text type="supporting" color="secondary">
          No items selected yet. Check at least one item to see the refund
          estimate.
        </Text>
      </VStack>
    );
  }

  const totalLabel =
    resolution === 'refund'
      ? \`Refund to \${PAYMENT_METHOD}\`
      : resolution === 'credit'
        ? 'Store credit issued'
        : 'Refund due';

  return (
    <VStack gap={3}>
      <VStack gap={2}>
        {selected.map(({item, qty}) => (
          <HStack gap={2} vAlign="center" key={item.id}>
            <ItemThumb item={item} small />
            <StackItem size="fill" style={styles.itemBody}>
              <Text type="body" size="sm">
                {item.name}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary">
              ×{qty}
            </Text>
            <Text type="body" size="sm">
              {formatCents(item.unitPriceCents * qty)}
            </Text>
          </HStack>
        ))}
      </VStack>

      <Divider />

      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Items subtotal
            </Text>
          </StackItem>
          <Text type="body" size="sm">
            {formatCents(subtotalCents)}
          </Text>
        </HStack>
        {resolution === 'credit' && (
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Store-credit bonus (+{CREDIT_BONUS_PCT}%)
              </Text>
            </StackItem>
            <Token
              label={\`+\${formatCents(bonusCents)}\`}
              size="sm"
              color="green"
            />
          </HStack>
        )}
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              Drop-off fee
            </Text>
          </StackItem>
          {isFeeWaived ? (
            <Token label="Waived" size="sm" color="green" />
          ) : (
            <Text type="body" size="sm">
              {feeCents === 0 ? 'Free' : \`−\${formatCents(feeCents)}\`}
            </Text>
          )}
        </HStack>
      </VStack>

      <Divider />

      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="body" size="sm" weight="medium">
            {totalLabel}
          </Text>
        </StackItem>
        <Heading level={3}>{formatCents(totalCents)}</Heading>
      </HStack>

      {resolution === 'exchange' && (
        <Text type="supporting" color="secondary">
          Even exchange — replacements ship as soon as the carrier scans
          your return. Nothing is charged or refunded.
        </Text>
      )}

      <Text type="supporting" color="secondary">
        Return by {RETURN_BY}. Items must be unworn with tags attached.
      </Text>
    </VStack>
  );
}

// ============= LABEL / QR PLACEHOLDERS =============

/** Deterministic fake barcode: fixed bar widths, always ~200px total. */
function BarcodePlaceholder() {
  return (
    <div style={styles.barcodeRow} aria-hidden="true">
      {BARCODE_BARS.map((width, index) => (
        <div
          // Fixture bars never reorder; index keys are stable here.
          key={index}
          style={{...styles.barcodeBar, width: width * 2}}
        />
      ))}
    </div>
  );
}

/** Deterministic QR placeholder: fixed 7x7 fill pattern. */
function QrPlaceholder() {
  return (
    <div style={styles.qrGrid} aria-hidden="true">
      {QR_PATTERN.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={\`\${rowIndex}-\${colIndex}\`}
            style={cell === 1 ? styles.qrCellOn : styles.qrCellOff}
          />
        )),
      )}
    </div>
  );
}

// ============= PAGE =============

export default function ReturnsExchangeFlowTemplate() {
  const [step, setStep] = useState(0);

  // ---- Step 1: per-item selection with quantities ----
  // Presence of an id means "selected"; the value is how many units come
  // back. Two items start selected so the summary math is visible on load.
  const [returnQty, setReturnQty] = useState<Record<string, number>>({
    'li-tee': 1,
    'li-shell': 1,
  });

  // ---- Step 2: reason code per selected item + optional note ----
  const [reasons, setReasons] = useState<Record<string, string>>({
    'li-shell': 'too-large',
  });
  const [note, setNote] = useState('');

  // ---- Step 3: resolution + per-item exchange variants ----
  const [resolution, setResolution] = useState<ResolutionId>('refund');
  const [exchangePicks, setExchangePicks] = useState<Record<string, string>>(
    {},
  );

  // ---- Step 4: drop-off method ----
  const [dropoff, setDropoff] = useState('qr');

  // ---- Step 5: printable-label feedback ----
  const [labelPrinted, setLabelPrinted] = useState(false);

  // <=640px: the summary panel collapses into an inline Collapsible, the
  // stepper hides its titles, and sm controls grow to 40px hit targets.
  const isCompact = useMediaQuery('(max-width: 640px)');

  const toggleItem = (id: string, checked: boolean) => {
    setReturnQty(prev => {
      const next = {...prev};
      if (checked) {
        next[id] = 1;
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const setItemQty = (id: string, qty: number) => {
    setReturnQty(prev => ({...prev, [id]: qty}));
  };

  const setItemReason = (id: string, reason: string) => {
    setReasons(prev => ({...prev, [id]: reason}));
  };

  const setItemExchange = (id: string, variant: string) => {
    setExchangePicks(prev => ({...prev, [id]: variant}));
  };

  // ---- Derived, deterministic figures ----
  const selected = useMemo(
    () =>
      ORDER_ITEMS.filter(item => item.id in returnQty).map(item => ({
        item,
        qty: returnQty[item.id],
      })),
    [returnQty],
  );

  const subtotalCents = selected.reduce(
    (sum, {item, qty}) => sum + item.unitPriceCents * qty,
    0,
  );
  const bonusCents = Math.round((subtotalCents * CREDIT_BONUS_PCT) / 100);

  // Damaged / wrong-item returns are on us, so the drop-off fee is waived.
  const isFeeWaived = selected.some(({item}) =>
    FEE_WAIVING_REASONS.has(reasons[item.id] ?? ''),
  );
  const dropoffMethod =
    DROPOFF_METHODS.find(method => method.id === dropoff) ??
    DROPOFF_METHODS[0];
  const effectiveFeeCents = isFeeWaived ? 0 : dropoffMethod.feeCents;

  const totalCents =
    resolution === 'exchange'
      ? 0
      : resolution === 'credit'
        ? subtotalCents + bonusCents - effectiveFeeCents
        : subtotalCents - effectiveFeeCents;

  const figures: SummaryFigures = {
    selected,
    subtotalCents,
    bonusCents,
    feeCents: dropoffMethod.feeCents,
    isFeeWaived,
    totalCents,
    resolution,
  };

  const unitCount = selected.reduce((sum, {qty}) => sum + qty, 0);
  const missingReasons = selected.filter(({item}) => !reasons[item.id]);
  const missingVariants = selected.filter(
    ({item}) => !exchangePicks[item.id],
  );

  // ---- Per-step gate for the Continue button ----
  const canAdvance =
    step === 0
      ? selected.length > 0
      : step === 1
        ? missingReasons.length === 0
        : step === 2
          ? resolution !== 'exchange' || missingVariants.length === 0
          : true;

  const gateHint =
    step === 0 && selected.length === 0
      ? 'Check at least one item to continue.'
      : step === 1 && missingReasons.length > 0
        ? \`Pick a reason for \${missingReasons.length} more item\${
            missingReasons.length === 1 ? '' : 's'
          }.\`
        : step === 2 && resolution === 'exchange' && missingVariants.length > 0
          ? \`Choose a replacement for \${missingVariants.length} more item\${
              missingVariants.length === 1 ? '' : 's'
            }.\`
          : null;

  const isDropoffStep = step === 3;
  const isSubmitted = step === STEPS.length - 1;

  const resolutionDestination =
    resolution === 'refund'
      ? PAYMENT_METHOD
      : resolution === 'credit'
        ? 'Basecamp account balance'
        : 'Replacement shipment';

  // ============= STEP BODIES =============

  const itemsStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>What are you returning?</Heading>
        <Text type="supporting" color="secondary">
          Order {ORDER_NUMBER}, placed {ORDER_PLACED}. Items are eligible
          for return through {RETURN_BY}.
        </Text>
      </VStack>

      <VStack gap={0}>
        {ORDER_ITEMS.map((item, index) => {
          const isChecked = item.id in returnQty;
          return (
            <VStack gap={0} key={item.id}>
              {index > 0 && <Divider />}
              <HStack gap={3} vAlign="center" style={styles.itemRow}>
                <ItemThumb item={item} />
                <StackItem size="fill" style={styles.itemBody}>
                  {/* The item name is the checkbox label, so the whole
                      name/description block is a tap target — not just
                      the 24px box. */}
                  <CheckboxInput
                    label={item.name}
                    description={\`\${item.variant} · \${formatCents(
                      item.unitPriceCents,
                    )}\${item.qtyOrdered > 1 ? \` · Qty \${item.qtyOrdered}\` : ''}\`}
                    value={isChecked}
                    isDisabled={item.isFinalSale}
                    onChange={checked => toggleItem(item.id, checked)}
                  />
                </StackItem>
                {item.isFinalSale ? (
                  <Token label="Final sale" size="sm" color="gray" />
                ) : (
                  isChecked &&
                  item.qtyOrdered > 1 && (
                    <QtyStepper
                      item={item}
                      qty={returnQty[item.id]}
                      isNarrow={isCompact}
                      onChange={qty => setItemQty(item.id, qty)}
                    />
                  )
                )}
              </HStack>
            </VStack>
          );
        })}
      </VStack>

      <Banner
        status="info"
        title="Gift cards are final sale"
        description="Digital gift cards can't be returned or exchanged, so the Basecamp Gift Card stays with your order."
      />
    </VStack>
  );

  const reasonsStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Why is each item coming back?</Heading>
        <Text type="supporting" color="secondary">
          A reason per item helps us route the return — damaged or
          wrong-item returns skip inspection and ship free.
        </Text>
      </VStack>

      <VStack gap={4}>
        {selected.map(({item, qty}) => (
          <VStack gap={2} key={item.id}>
            <HStack gap={2} vAlign="center">
              <ItemThumb item={item} small />
              <StackItem size="fill" style={styles.itemBody}>
                <Text type="body" size="sm" weight="medium">
                  {item.name}
                </Text>
              </StackItem>
              <Token label={\`×\${qty}\`} size="sm" color="gray" />
            </HStack>
            <Selector
              label={\`Reason for \${item.name}\`}
              isLabelHidden
              options={REASON_OPTIONS}
              placeholder="Choose a reason…"
              value={reasons[item.id]}
              onChange={value => setItemReason(item.id, value)}
            />
          </VStack>
        ))}
      </VStack>

      {isFeeWaived && (
        <Banner
          status="success"
          title="Drop-off fee waived"
          description="One of your reasons is on us (damaged or wrong item), so every drop-off option is free for this return."
        />
      )}

      <TextArea
        label="Anything else we should know?"
        isOptional
        rows={3}
        value={note}
        onChange={setNote}
        placeholder="Loose stitching on the left seam…"
        description="Shared with the returns team only."
      />
    </VStack>
  );

  const resolutionStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>How should we make it right?</Heading>
        <Text type="supporting" color="secondary">
          One resolution applies to the whole return. You can switch until
          you submit.
        </Text>
      </VStack>

      <RadioList
        label="Resolution"
        value={resolution}
        onChange={value => setResolution(value as ResolutionId)}>
        <RadioListItem
          label={RESOLUTION_LABELS.refund}
          value="refund"
          description={\`Back to \${PAYMENT_METHOD} within 5–7 business days after inspection.\`}
        />
        <RadioListItem
          label={RESOLUTION_LABELS.credit}
          value="credit"
          description="Instant credit the moment the carrier scans your return."
          endContent={
            <Badge
              variant="success"
              label={\`+\${formatCents(bonusCents)} bonus\`}
            />
          }
        />
        <RadioListItem
          label={RESOLUTION_LABELS.exchange}
          value="exchange"
          description="Even exchange — the replacement ships as soon as the return is scanned."
        />
      </RadioList>

      {resolution === 'credit' && (
        <Banner
          status="success"
          title={\`Store credit pays \${formatCents(
            subtotalCents + bonusCents,
          )} on \${formatCents(subtotalCents)} of items\`}
          description="Credit never expires and applies automatically at checkout."
        />
      )}

      {resolution === 'exchange' && (
        <VStack gap={3}>
          <Divider />
          <Text type="label" size="sm" color="secondary">
            Pick a replacement for each item
          </Text>
          {selected.map(({item}) => (
            <VStack gap={2} key={item.id}>
              <HStack gap={2} vAlign="center">
                <ItemThumb item={item} small />
                <StackItem size="fill" style={styles.itemBody}>
                  <VStack gap={0}>
                    <Text type="body" size="sm" weight="medium">
                      {item.name}
                    </Text>
                    <Text type="supporting" color="secondary">
                      Currently {item.variant}
                    </Text>
                  </VStack>
                </StackItem>
              </HStack>
              <Selector
                label={\`Replacement for \${item.name}\`}
                isLabelHidden
                options={EXCHANGE_VARIANTS[item.id] ?? []}
                placeholder="Choose a replacement…"
                value={exchangePicks[item.id]}
                onChange={value => setItemExchange(item.id, value)}
              />
            </VStack>
          ))}
          <Text type="supporting" color="secondary">
            All replacements are the same price, so there is nothing to pay
            and nothing to refund.
          </Text>
        </VStack>
      )}
    </VStack>
  );

  const dropoffStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>How will you send it back?</Heading>
        <Text type="supporting" color="secondary">
          {isFeeWaived
            ? 'Fees are waived for this return, so every option is free.'
            : 'Fees come out of the refund before it is issued.'}
        </Text>
      </VStack>

      <RadioList label="Drop-off method" value={dropoff} onChange={setDropoff}>
        {DROPOFF_METHODS.map(method => (
          <RadioListItem
            key={method.id}
            label={method.label}
            value={method.id}
            description={method.description}
            endContent={
              isFeeWaived || method.feeCents === 0 ? (
                <Badge variant="success" label="Free" />
              ) : (
                <Badge
                  variant="neutral"
                  label={formatCents(method.feeCents)}
                />
              )
            }
          />
        ))}
      </RadioList>

      <HStack gap={2} vAlign="center">
        <Icon icon={MapPinIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          {dropoffMethod.detail}
        </Text>
      </HStack>

      <Banner
        status="info"
        title="Submitting locks this return"
        description={\`We reserve \${unitCount} unit\${
          unitCount === 1 ? '' : 's'
        } against order \${ORDER_NUMBER} and email the \${
          dropoff === 'qr' ? 'QR code' : 'label'
        } to rosa@marchetti.dev.\`}
      />
    </VStack>
  );

  const confirmationStep = (
    <VStack gap={4}>
      <Banner
        status="success"
        title={\`Return \${RMA_NUMBER} started\`}
        description={\`We emailed the \${
          dropoff === 'qr' ? 'drop-off QR code' : 'prepaid label'
        } to rosa@marchetti.dev. Drop the items off by \${RETURN_BY}.\`}
      />

      <MetadataList columns="multi">
        <MetadataListItem label="Return ID">{RMA_NUMBER}</MetadataListItem>
        <MetadataListItem label="Order">{ORDER_NUMBER}</MetadataListItem>
        <MetadataListItem label="Items">
          {selected.length} item{selected.length === 1 ? '' : 's'} ·{' '}
          {unitCount} unit{unitCount === 1 ? '' : 's'}
        </MetadataListItem>
        <MetadataListItem label="Resolution">
          {RESOLUTION_LABELS[resolution]}
        </MetadataListItem>
        <MetadataListItem label="Goes to">
          {resolutionDestination}
        </MetadataListItem>
        <MetadataListItem label="Drop-off">
          {dropoffMethod.label}
        </MetadataListItem>
        <MetadataListItem label="Drop-off fee">
          {isFeeWaived
            ? 'Waived'
            : dropoffMethod.feeCents === 0
              ? 'Free'
              : formatCents(dropoffMethod.feeCents)}
        </MetadataListItem>
        <MetadataListItem
          label={
            resolution === 'credit' ? 'Store credit' : 'Estimated refund'
          }>
          {formatCents(totalCents)}
        </MetadataListItem>
      </MetadataList>

      <Divider />

      {/* Printable label / QR placeholder — styled stand-in, no assets. */}
      <div style={styles.labelBox}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <Icon
              icon={dropoff === 'qr' ? QrCodeIcon : PrinterIcon}
              size="sm"
              color="secondary"
            />
            <StackItem size="fill">
              <Text type="label" size="sm" color="secondary">
                {dropoff === 'qr'
                  ? 'Drop-off QR code'
                  : 'Prepaid return label'}
              </Text>
            </StackItem>
            <Token label="SwiftParcel Ground" size="sm" color="gray" />
          </HStack>

          <div style={styles.labelInner}>
            <VStack gap={3}>
              <VStack gap={1}>
                <Text type="supporting" color="secondary">
                  From: {CUSTOMER_ADDRESS}
                </Text>
                <Text type="supporting" color="secondary">
                  To: {WAREHOUSE_ADDRESS}
                </Text>
              </VStack>
              {dropoff === 'qr' ? (
                <HStack gap={3} vAlign="center">
                  <QrPlaceholder />
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary">
                      Show this code at any SwiftParcel counter — they scan
                      it, pack the items, and print the label for you.
                    </Text>
                  </StackItem>
                </HStack>
              ) : (
                <BarcodePlaceholder />
              )}
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="body" size="sm" weight="medium">
                    {RMA_NUMBER}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary">
                  {unitCount} unit{unitCount === 1 ? '' : 's'} · prepaid
                </Text>
              </HStack>
            </VStack>
          </div>

          <HStack gap={2} vAlign="center" wrap="wrap">
            <Button
              label={labelPrinted ? 'Sent to printer' : 'Print label'}
              variant="primary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={PrinterIcon} size="sm" />}
              isDisabled={dropoff === 'qr'}
              onClick={() => setLabelPrinted(true)}
            />
            <Button
              label="Download PDF"
              variant="secondary"
              size="sm"
              style={isCompact ? styles.buttonTapTarget : undefined}
              icon={<Icon icon={DownloadIcon} size="sm" />}
            />
            {dropoff === 'qr' && (
              <Text type="supporting" color="secondary">
                No printer needed for QR drop-off.
              </Text>
            )}
            {labelPrinted && dropoff !== 'qr' && (
              <HStack gap={1} vAlign="center">
                <Icon icon="check" size="sm" color="success" />
                <Text type="supporting" size="sm" color="secondary">
                  Label queued
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>
      </div>

      <Divider />

      <VStack gap={2}>
        <Text type="label" size="sm" color="secondary">
          What happens next
        </Text>
        <HStack gap={2} vAlign="center">
          <Icon icon={MapPinIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            Drop the items off by {RETURN_BY} — {dropoffMethod.detail}
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={RotateCcwIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            We inspect within 2 business days of the carrier scan.
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Icon icon={CreditCardIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {resolution === 'refund'
              ? \`\${formatCents(totalCents)} posts to \${PAYMENT_METHOD} in 5–7 business days.\`
              : resolution === 'credit'
                ? \`\${formatCents(totalCents)} in store credit lands instantly at scan.\`
                : 'Your replacements ship the moment the return is scanned.'}
          </Text>
        </HStack>
      </VStack>

      <HStack gap={2} vAlign="center">
        <Button
          label="Back to orders"
          variant="secondary"
          style={isCompact ? styles.buttonTapTarget : undefined}
        />
        <StackItem size="fill" />
        <Button
          label="Start another return"
          variant="ghost"
          style={isCompact ? styles.buttonTapTarget : undefined}
        />
      </HStack>
    </VStack>
  );

  // ============= FRAME =============

  const summaryPanel = isCompact ? undefined : (
    <LayoutPanel width={320} padding={0} hasDivider label="Return summary">
      <div style={styles.summaryPanelBody}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>Return summary</Heading>
            </StackItem>
            {selected.length > 0 && (
              <Badge
                variant="neutral"
                label={\`\${unitCount} unit\${unitCount === 1 ? '' : 's'}\`}
              />
            )}
          </HStack>
          <ReturnSummary figures={figures} />
        </VStack>
      </div>
    </LayoutPanel>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <div style={styles.brandTile}>
              <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>Start a return</Heading>
                <Badge variant="neutral" label={\`Order \${ORDER_NUMBER}\`} />
                {isSubmitted ? (
                  <Badge variant="success" label="Submitted" />
                ) : (
                  <Text type="supporting" color="secondary">
                    Step {step + 1} of {STEPS.length - 1}:{' '}
                    {STEPS[step].title}
                  </Text>
                )}
              </HStack>
            </StackItem>
            {!isCompact && (
              <Text type="supporting" color="secondary">
                Placed {ORDER_PLACED} · {PAYMENT_METHOD}
              </Text>
            )}
            <Button label="Back to orders" variant="ghost" size="sm" />
          </HStack>
        </LayoutHeader>
      }
      end={summaryPanel}
      content={
        <LayoutContent padding={0}>
          <div style={styles.column}>
            <VStack gap={5}>
              <Stepper
                currentStep={step}
                onStepSelect={setStep}
                isCompact={isCompact}
                isLocked={isSubmitted}
              />

              <Card padding={5} width="100%">
                {step === 0 && itemsStep}
                {step === 1 && reasonsStep}
                {step === 2 && resolutionStep}
                {step === 3 && dropoffStep}
                {isSubmitted && confirmationStep}
              </Card>

              {/* <=640px: the docked panel is gone, so the same summary
                  rides along as a Collapsible whose trigger keeps the live
                  total visible even when collapsed. Hidden once submitted —
                  the confirmation card repeats every figure. */}
              {isCompact && !isSubmitted && (
                <Card padding={4} width="100%">
                  <Collapsible
                    defaultIsOpen={false}
                    trigger={
                      <HStack gap={2} vAlign="center">
                        <StackItem size="fill">
                          <Text type="body" size="sm" weight="medium">
                            Return summary
                          </Text>
                        </StackItem>
                        <Text type="body" size="sm" weight="medium">
                          {selected.length === 0
                            ? 'No items'
                            : formatCents(totalCents)}
                        </Text>
                      </HStack>
                    }>
                    <VStack gap={0} style={{paddingTop: 'var(--spacing-3)'}}>
                      <ReturnSummary figures={figures} />
                    </VStack>
                  </Collapsible>
                </Card>
              )}

              {!isSubmitted && (
                <HStack gap={2} vAlign="center">
                  <Button
                    label="Back"
                    variant="secondary"
                    isDisabled={step === 0}
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    onClick={() =>
                      setStep(current => Math.max(0, current - 1))
                    }
                  />
                  <StackItem size="fill">
                    {gateHint && (
                      <Text type="supporting" color="secondary">
                        {gateHint}
                      </Text>
                    )}
                  </StackItem>
                  <Button
                    label={isDropoffStep ? 'Submit return' : 'Continue'}
                    variant="primary"
                    isDisabled={!canAdvance}
                    style={isCompact ? styles.buttonTapTarget : undefined}
                    onClick={() =>
                      setStep(current =>
                        Math.min(STEPS.length - 1, current + 1),
                      )
                    }
                  />
                </HStack>
              )}
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};