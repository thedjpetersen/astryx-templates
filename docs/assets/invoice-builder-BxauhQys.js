var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Invoice Builder — split invoice editor with a form pane on the
 *   left and a live document-style invoice preview on the right that
 *   mirrors every edit, including all subtotal / tax / discount math.
 *
 * @input Deterministic fixtures only: issuer 'Lumen Labs Studio' (gradient
 *   logo mark, fixed address block), four saved clients (Northwind
 *   Robotics, Cascade Provisions, Halcyon Health, Bright Harbor Media)
 *   each with contact, email, and address lines, and invoice
 *   INV-2026-0142 seeded with three line items (discovery workshop,
 *   design system build, accessibility audit), an 8.5% tax rate, a 10%
 *   discount, issue date 2026-07-02, due date 2026-08-01, and a payment
 *   note. No Date.now(), Math.random(), or network assets — the logo is
 *   a CSS gradient placeholder and currency/date formatting is done by
 *   local pure helpers, never locale APIs.
 * @output A billing-tool invoice editor: a 400px form panel (client
 *   Selector with a mirrored bill-to summary, invoice number TextInput,
 *   issue/due DateInputs, a line-item editor with add/remove rows and
 *   qty × rate amounts recomputed per keystroke, tax-rate NumberInput,
 *   discount type Selector + value NumberInput, notes TextArea) beside a
 *   muted canvas holding a 640px paper Card that renders the invoice as
 *   a document — issuer header, bill-to block, items table, and a totals
 *   stack (subtotal, discount, tax, amount due) computed from the same
 *   state. LayoutHeader carries the invoice title, Draft/Sent status
 *   Badge, a live total Badge, and Download / Send actions; Send flips
 *   the status to Sent, stamps the document, and fires a Toast.
 * @position Emitted by \`astryx template invoice-builder\`.
 *
 * Frame (desktop, left to right):
 *   invoice form panel 400px (scrolls) | preview backdrop (fill, scrolls)
 *
 * Container policy (document-editor archetype): the only Card is the
 * invoice "paper" artifact on the preview canvas so it reads as a
 * printable document against the muted backdrop. The form panel is a
 * plain scrolling column of labeled groups separated by Dividers; each
 * line item is a bordered row group, not a Card, so twelve items still
 * read as one table editor rather than a stack of widgets.
 *
 * Choose over form-page / form-side-sheet when the right pane is a live
 * WYSIWYG document computed from the form rather than a second form or a
 * record detail; choose over newsletter-composer because the artifact
 * here is derived (form in, paper out) instead of assembled from
 * palette blocks; choose over cart-checkout-flow because the operator is
 * authoring an outbound bill, not paying one.
 *
 * Responsive contract:
 * - >900px  — split frame: 400px form panel | preview canvas (fill). Both
 *   panes scroll independently; the header never scrolls.
 * - <=900px — single-pane fallback: the form panel leaves the frame and
 *   an Edit/Preview SegmentedControl appears in the header to swap the
 *   full-width content between the form (max 560px column) and the
 *   preview canvas. Nothing becomes unreachable — every control lives in
 *   whichever pane is active.
 * - <=640px — the header HStack wraps: the pane toggle and Download/Send
 *   actions drop to a second row under the title instead of clipping;
 *   Download collapses to an icon-only button (with tooltip + aria
 *   label); the per-row delete IconButtons grow from sm (28px) to lg
 *   (36px+) touch targets and the qty/rate pair wraps under the
 *   description. All actions are always-visible buttons — nothing is
 *   hover-only, so every affordance works by tap or focus.
 * - The preview items table keeps a 460px minimum grid inside its own
 *   overflow-x wrapper so the qty/rate/amount columns never crush; the
 *   document Card caps at 640px and shrinks fluidly below that, so the
 *   page itself never scrolls sideways at 375px.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  Building2Icon,
  DownloadIcon,
  EyeIcon,
  PencilLineIcon,
  PlusIcon,
  ReceiptTextIcon,
  SendIcon,
  Trash2Icon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import type {ISODateString} from '@astryxdesign/core/Calendar';
import {Card} from '@astryxdesign/core/Card';
import {DateInput} from '@astryxdesign/core/DateInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES — plain CSS properties with semantic tokens. The two exceptions are
// the gradient logo mark (deterministic placeholder, no network images) and
// the fixed green of the decorative SENT stamp.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Form panel: a single scrolling column of labeled groups.
  formColumn: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Single-pane tier: the form takes the full content slot but keeps a
  // readable measure instead of stretching inputs edge to edge.
  formSinglePane: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formSinglePaneInner: {
    width: '100%',
    maxWidth: 560,
  },
  // Mirrored bill-to summary under the client Selector, so the operator
  // sees exactly what the preview's Bill to block will render.
  clientSummary: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-body)',
  },
  // One line item: a bordered row group (not a Card) so a dozen items
  // still read as a single table editor.
  lineItemRow: {
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    padding: 'var(--spacing-3)',
  },
  // Preview canvas: muted body color so the invoice Card reads as paper.
  previewScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  paperCard: {
    width: 640,
    maxWidth: '100%',
    boxShadow: 'var(--shadow-med)',
  },
  paperBody: {
    position: 'relative',
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-5)',
  },
  // Issuer logo: fixed-stop CSS gradient — no network images.
  logoMark: {
    width: 48,
    height: 48,
    borderRadius: 10,
    flexShrink: 0,
    background: [
      'radial-gradient(circle at 70% 24%, rgba(255,255,255,0.35) 0 10px, transparent 11px)',
      'radial-gradient(circle at 26% 78%, rgba(255,255,255,0.18) 0 14px, transparent 15px)',
      'linear-gradient(135deg, #5B6CF0 0%, #7C4DD8 55%, #B04DB8 100%)',
    ].join(', '),
  },
  invoiceWordmark: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: '0.14em',
    color: 'var(--color-text-primary)',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  addressLine: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text-secondary)',
  },
  billToName: {
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
  },
  // Items table: a fixed-minimum grid inside its own overflow-x wrapper so
  // currency columns never crush and the page never scrolls sideways.
  tableScroll: {
    overflowX: 'auto',
  },
  tableGrid: {
    minWidth: 460,
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 1fr) 56px 96px 104px',
    columnGap: 12,
    alignItems: 'baseline',
    paddingBlock: 8,
  },
  tableHeadCell: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  tableCell: {
    fontSize: 14,
    color: 'var(--color-text-primary)',
    lineHeight: 1.45,
  },
  tableCellMuted: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    fontStyle: 'italic',
  },
  numericCell: {
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  totalsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px',
    columnGap: 12,
    paddingBlock: 4,
  },
  totalsLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    textAlign: 'right',
  },
  totalsValue: {
    fontSize: 13,
    color: 'var(--color-text-primary)',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  totalsDueLabel: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    textAlign: 'right',
  },
  totalsDueValue: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  notesText: {
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'pre-line',
  },
  footerLine: {
    fontSize: 12,
    textAlign: 'center',
    color: 'var(--color-text-secondary)',
  },
  // Decorative stamp over the paper once the invoice is sent. Fixed green
  // (like the logo gradient, this is artifact ink, not UI chrome).
  sentStamp: {
    position: 'absolute',
    top: 22,
    right: 20,
    transform: 'rotate(8deg)',
    border: '3px solid rgba(31, 157, 85, 0.75)',
    borderRadius: 8,
    paddingBlock: 4,
    paddingInline: 14,
    fontSize: 18,
    fontWeight: 800,
    letterSpacing: '0.18em',
    color: 'rgba(31, 157, 85, 0.85)',
    pointerEvents: 'none',
  },
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. Issuer 'Lumen Labs Studio' billing four
// saved clients; invoice INV-2026-0142 seeds the editor. No clocks,
// randomness, or network assets.
// ---------------------------------------------------------------------------

const ISSUER = {
  name: 'Lumen Labs Studio',
  addressLines: ['500 Harbor Blvd, Suite 210', 'Oakland, CA 94607'],
  email: 'billing@lumenlabs.io',
};

interface Client {
  id: string;
  company: string;
  contact: string;
  email: string;
  addressLines: [string, string];
}

const CLIENTS: Client[] = [
  {
    id: 'northwind',
    company: 'Northwind Robotics',
    contact: 'Priya Raman',
    email: 'ap@northwindrobotics.com',
    addressLines: ['1200 Assembly Way', 'Fremont, CA 94538'],
  },
  {
    id: 'cascade',
    company: 'Cascade Provisions',
    contact: 'Miles Okafor',
    email: 'accounts@cascadeprovisions.com',
    addressLines: ['88 Pike Street', 'Seattle, WA 98101'],
  },
  {
    id: 'halcyon',
    company: 'Halcyon Health',
    contact: 'Dana Whitfield',
    email: 'finance@halcyonhealth.org',
    addressLines: ['415 Meridian Ave, Floor 3', 'Austin, TX 78704'],
  },
  {
    id: 'brightharbor',
    company: 'Bright Harbor Media',
    contact: 'Jonas Lindqvist',
    email: 'billing@brightharbor.media',
    addressLines: ['77 Beacon Street', 'Boston, MA 02108'],
  },
];

interface LineItem {
  id: string;
  description: string;
  /** null when the stepper is cleared; math treats null as 0. */
  qty: number | null;
  rate: number | null;
}

const INITIAL_ITEMS: LineItem[] = [
  {
    id: 'item-1',
    description: 'Product discovery workshop (2 days, on-site)',
    qty: 2,
    rate: 1800,
  },
  {
    id: 'item-2',
    description: 'Design system build — tokens, components, docs',
    qty: 60,
    rate: 145,
  },
  {
    id: 'item-3',
    description: 'Accessibility audit and remediation report',
    qty: 1,
    rate: 2400,
  },
];

type DiscountType = 'percent' | 'fixed';
type InvoiceStatus = 'draft' | 'sent';
type Pane = 'edit' | 'preview';

const DISCOUNT_OPTIONS = [
  {value: 'percent', label: 'Percent (%)'},
  {value: 'fixed', label: 'Fixed amount (USD)'},
];

const INITIAL_NOTES =
  'Payment via ACH or check to Lumen Labs Studio. A 1.5% late fee applies to balances more than 15 days past due. Thank you!';

// ---------------------------------------------------------------------------
// PURE HELPERS — deterministic formatting; no locale APIs, no clocks.
// ---------------------------------------------------------------------------

/** $12,345.67 with a leading minus for negatives. Pure string math. */
function formatUSD(amount: number): string {
  const isNegative = amount < 0;
  const cents = Math.round(Math.abs(amount) * 100);
  const dollars = Math.floor(cents / 100)
    .toString()
    .replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');
  const fraction = (cents % 100).toString().padStart(2, '0');
  return \`\${isNegative ? '−' : ''}$\${dollars}.\${fraction}\`;
}

const MONTH_NAMES = [
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

/** '2026-07-02' → 'Jul 2, 2026'; undefined → an em dash placeholder. */
function formatDate(iso: ISODateString | undefined): string {
  if (iso === undefined) {
    return '—';
  }
  const [year, month, day] = iso.split('-');
  const monthName = MONTH_NAMES[Number(month) - 1] ?? month;
  return \`\${monthName} \${Number(day)}, \${year}\`;
}

/** '8.5' not '8.50' — trims a trailing '.0' style zero for badge labels. */
function formatRate(rate: number): string {
  return Number.isInteger(rate) ? String(rate) : String(rate);
}

interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

/** All invoice math in one place so the editor and preview never drift. */
function computeTotals(
  items: LineItem[],
  discountType: DiscountType,
  discountValue: number | null,
  taxRate: number | null,
): InvoiceTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.qty ?? 0) * (item.rate ?? 0),
    0,
  );
  const rawDiscount =
    discountType === 'percent'
      ? (subtotal * (discountValue ?? 0)) / 100
      : (discountValue ?? 0);
  // A fixed discount can never push the taxable base below zero.
  const discountAmount = Math.min(Math.max(rawDiscount, 0), subtotal);
  const taxable = subtotal - discountAmount;
  const taxAmount = (taxable * (taxRate ?? 0)) / 100;
  return {subtotal, discountAmount, taxAmount, total: taxable + taxAmount};
}

// ---------------------------------------------------------------------------
// LINE ITEM EDITOR ROW — description, qty × rate, live amount, remove.
// ---------------------------------------------------------------------------

function LineItemEditorRow({
  item,
  index,
  canRemove,
  isPhone,
  onPatch,
  onRemove,
}: {
  item: LineItem;
  index: number;
  canRemove: boolean;
  isPhone: boolean;
  onPatch: (id: string, patch: Partial<LineItem>) => void;
  onRemove: (id: string) => void;
}) {
  const amount = (item.qty ?? 0) * (item.rate ?? 0);
  return (
    <div style={styles.lineItemRow}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Item {index + 1}
            </Text>
          </StackItem>
          {/* Live qty × rate amount, mirrored 1:1 into the preview table. */}
          <Text type="label">{formatUSD(amount)}</Text>
          <IconButton
            label={\`Remove item \${index + 1}\`}
            tooltip="Remove item"
            // Phone tier: grows from sm (28px) to lg touch target.
            size={isPhone ? 'lg' : 'sm'}
            variant="ghost"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            isDisabled={!canRemove}
            onClick={() => onRemove(item.id)}
          />
        </HStack>
        <TextInput
          label="Description"
          size="sm"
          value={item.description}
          onChange={value => onPatch(item.id, {description: value})}
          width="100%"
        />
        {/* Qty and rate share a row; \`wrap\` lets them stack on very narrow
            panes instead of crushing the steppers. */}
        <HStack gap={2} wrap="wrap">
          <StackItem size="fill">
            <NumberInput
              label="Qty"
              value={item.qty}
              onChange={qty => onPatch(item.id, {qty})}
              min={0}
              step={1}
              hasClear
              width="100%"
            />
          </StackItem>
          <StackItem size="fill">
            <NumberInput
              label="Rate (USD)"
              value={item.rate}
              onChange={rate => onPatch(item.id, {rate})}
              min={0}
              step={1}
              hasClear
              width="100%"
            />
          </StackItem>
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// INVOICE PREVIEW — the document artifact. Pure render of editor state;
// every field and every total mirrors the form per keystroke.
// ---------------------------------------------------------------------------

function InvoicePreview({
  invoiceNumber,
  client,
  issueDate,
  dueDate,
  items,
  discountType,
  discountValue,
  taxRate,
  notes,
  totals,
  isSent,
}: {
  invoiceNumber: string;
  client: Client;
  issueDate: ISODateString | undefined;
  dueDate: ISODateString | undefined;
  items: LineItem[];
  discountType: DiscountType;
  discountValue: number | null;
  taxRate: number | null;
  notes: string;
  totals: InvoiceTotals;
  isSent: boolean;
}) {
  const discountLabel =
    discountType === 'percent' && (discountValue ?? 0) > 0
      ? \`Discount (\${formatRate(discountValue ?? 0)}%)\`
      : 'Discount';
  const taxLabel =
    (taxRate ?? 0) > 0 ? \`Tax (\${formatRate(taxRate ?? 0)}%)\` : 'Tax';

  return (
    <Card padding={0} style={styles.paperCard}>
      <div style={styles.paperBody}>
        {isSent && (
          <div style={styles.sentStamp} aria-hidden>
            SENT
          </div>
        )}
        <VStack gap={5}>
          {/* Issuer header: logo mark + company block, INVOICE wordmark. */}
          <HStack gap={3} vAlign="start" wrap="wrap">
            <div style={styles.logoMark} aria-hidden />
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label">{ISSUER.name}</Text>
                {ISSUER.addressLines.map(line => (
                  <span key={line} style={styles.addressLine}>
                    {line}
                  </span>
                ))}
                <span style={styles.addressLine}>{ISSUER.email}</span>
              </VStack>
            </StackItem>
            <VStack gap={0} hAlign="end">
              <span style={styles.invoiceWordmark}>INVOICE</span>
              <Text type="supporting" color="secondary">
                {invoiceNumber.trim() === '' ? '—' : invoiceNumber}
              </Text>
            </VStack>
          </HStack>

          <Divider />

          {/* Bill-to and dates row. */}
          <HStack gap={5} vAlign="start" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <span style={styles.metaLabel}>Bill to</span>
                <VStack gap={0}>
                  <span style={styles.billToName}>{client.company}</span>
                  <span style={styles.addressLine}>Attn: {client.contact}</span>
                  {client.addressLines.map(line => (
                    <span key={line} style={styles.addressLine}>
                      {line}
                    </span>
                  ))}
                  <span style={styles.addressLine}>{client.email}</span>
                </VStack>
              </VStack>
            </StackItem>
            <VStack gap={2}>
              <VStack gap={0}>
                <span style={styles.metaLabel}>Issued</span>
                <span style={styles.metaValue}>{formatDate(issueDate)}</span>
              </VStack>
              <VStack gap={0}>
                <span style={styles.metaLabel}>Due</span>
                <span style={styles.metaValue}>{formatDate(dueDate)}</span>
              </VStack>
              <VStack gap={0}>
                <span style={styles.metaLabel}>Amount due</span>
                <span style={styles.metaValue}>{formatUSD(totals.total)}</span>
              </VStack>
            </VStack>
          </HStack>

          {/* Items table: fixed minimum grid inside an overflow-x wrapper
              so number columns never crush on narrow paper. */}
          <div style={styles.tableScroll}>
            <div style={styles.tableGrid}>
              <div style={styles.tableRow}>
                <span style={styles.tableHeadCell}>Description</span>
                <span style={{...styles.tableHeadCell, ...styles.numericCell}}>
                  Qty
                </span>
                <span style={{...styles.tableHeadCell, ...styles.numericCell}}>
                  Rate
                </span>
                <span style={{...styles.tableHeadCell, ...styles.numericCell}}>
                  Amount
                </span>
              </div>
              <Divider />
              {items.length === 0 ? (
                <div style={styles.tableRow}>
                  <span style={styles.tableCellMuted}>
                    No line items yet — add one in the editor.
                  </span>
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id}>
                    {index > 0 && <Divider variant="subtle" />}
                    <div style={styles.tableRow}>
                      <span style={styles.tableCell}>
                        {item.description.trim() === '' ? (
                          <span style={styles.tableCellMuted}>
                            Untitled item
                          </span>
                        ) : (
                          item.description
                        )}
                      </span>
                      <span style={{...styles.tableCell, ...styles.numericCell}}>
                        {item.qty ?? 0}
                      </span>
                      <span style={{...styles.tableCell, ...styles.numericCell}}>
                        {formatUSD(item.rate ?? 0)}
                      </span>
                      <span style={{...styles.tableCell, ...styles.numericCell}}>
                        {formatUSD((item.qty ?? 0) * (item.rate ?? 0))}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <Divider />
              {/* Totals stack, right-aligned under the amount column. */}
              <VStack gap={0} style={{paddingTop: 8}}>
                <div style={styles.totalsRow}>
                  <span style={styles.totalsLabel}>Subtotal</span>
                  <span style={styles.totalsValue}>
                    {formatUSD(totals.subtotal)}
                  </span>
                </div>
                {totals.discountAmount > 0 && (
                  <div style={styles.totalsRow}>
                    <span style={styles.totalsLabel}>{discountLabel}</span>
                    <span style={styles.totalsValue}>
                      {formatUSD(-totals.discountAmount)}
                    </span>
                  </div>
                )}
                {totals.taxAmount > 0 && (
                  <div style={styles.totalsRow}>
                    <span style={styles.totalsLabel}>{taxLabel}</span>
                    <span style={styles.totalsValue}>
                      {formatUSD(totals.taxAmount)}
                    </span>
                  </div>
                )}
                <div style={styles.totalsRow}>
                  <span style={styles.totalsDueLabel}>Amount due</span>
                  <span style={styles.totalsDueValue}>
                    {formatUSD(totals.total)}
                  </span>
                </div>
              </VStack>
            </div>
          </div>

          {notes.trim() !== '' && (
            <VStack gap={1}>
              <span style={styles.metaLabel}>Notes</span>
              <span style={styles.notesText}>{notes}</span>
            </VStack>
          )}

          <Divider />
          <span style={styles.footerLine}>
            {ISSUER.name} · {ISSUER.email} · Payment due by{' '}
            {formatDate(dueDate)}
          </span>
        </VStack>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function InvoiceBuilderTemplate() {
  const toast = useToast();

  // ---- editor state (single source of truth for both panes) ----
  const [clientId, setClientId] = useState<string>('northwind');
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0142');
  const [issueDate, setIssueDate] = useState<ISODateString | undefined>(
    '2026-07-02',
  );
  const [dueDate, setDueDate] = useState<ISODateString | undefined>(
    '2026-08-01',
  );
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [nextItemNumber, setNextItemNumber] = useState(4);
  const [taxRate, setTaxRate] = useState<number | null>(8.5);
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState<number | null>(10);
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [status, setStatus] = useState<InvoiceStatus>('draft');

  // Responsive contract (see file header).
  const isSinglePane = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const [pane, setPane] = useState<Pane>('edit');
  const activePane: Pane = isSinglePane ? pane : 'edit';

  const client =
    CLIENTS.find(entry => entry.id === clientId) ?? CLIENTS[0];
  const totals = computeTotals(items, discountType, discountValue, taxRate);

  // ---- line item operations ----

  const patchItem = (id: string, patch: Partial<LineItem>) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? {...item, ...patch} : item)),
    );
  };

  const addItem = () => {
    const id = \`item-\${nextItemNumber}\`;
    setNextItemNumber(n => n + 1);
    setItems(prev => [
      ...prev,
      {id, description: '', qty: 1, rate: 0},
    ]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // ---- header actions ----

  const sendInvoice = () => {
    setStatus('sent');
    toast({
      body: \`Invoice \${invoiceNumber} (\${formatUSD(totals.total)}) sent to \${client.email}\`,
      uniqueID: 'invoice-send',
    });
  };

  const downloadInvoice = () => {
    toast({
      body: \`\${invoiceNumber || 'invoice'}.pdf saved to Downloads\`,
      uniqueID: 'invoice-download',
    });
  };

  // ---- form pane ----

  const formFields = (
    <VStack gap={4}>
      {/* Client */}
      <VStack gap={2}>
        <Heading level={2}>Client</Heading>
        <Selector
          label="Bill to"
          options={CLIENTS.map(entry => ({
            value: entry.id,
            label: entry.company,
            icon: Building2Icon,
          }))}
          value={clientId}
          onChange={setClientId}
          width="100%"
        />
        {/* Mirrors exactly what the preview's Bill to block renders. */}
        <div style={styles.clientSummary}>
          <VStack gap={0}>
            <Text type="label">{client.contact}</Text>
            <Text type="supporting" color="secondary">
              {client.email}
            </Text>
            <Text type="supporting" color="secondary">
              {client.addressLines.join(' · ')}
            </Text>
          </VStack>
        </div>
      </VStack>

      <Divider />

      {/* Invoice details */}
      <VStack gap={3}>
        <Heading level={2}>Details</Heading>
        <TextInput
          label="Invoice number"
          size="sm"
          value={invoiceNumber}
          onChange={setInvoiceNumber}
          width="100%"
        />
        <HStack gap={2} wrap="wrap">
          <StackItem size="fill">
            <DateInput
              label="Issue date"
              value={issueDate}
              onChange={setIssueDate}
              width="100%"
            />
          </StackItem>
          <StackItem size="fill">
            <DateInput
              label="Due date"
              value={dueDate}
              onChange={setDueDate}
              min={issueDate}
              width="100%"
            />
          </StackItem>
        </HStack>
      </VStack>

      <Divider />

      {/* Line items */}
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Line items</Heading>
          </StackItem>
          <Badge
            label={\`Subtotal \${formatUSD(totals.subtotal)}\`}
            variant="neutral"
          />
        </HStack>
        {items.map((item, index) => (
          <LineItemEditorRow
            key={item.id}
            item={item}
            index={index}
            canRemove={items.length > 1}
            isPhone={isPhone}
            onPatch={patchItem}
            onRemove={removeItem}
          />
        ))}
        <Button
          label="Add line item"
          variant="secondary"
          size={isPhone ? 'md' : 'sm'}
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          onClick={addItem}
        />
      </VStack>

      <Divider />

      {/* Adjustments */}
      <VStack gap={3}>
        <Heading level={2}>Adjustments</Heading>
        <NumberInput
          label="Tax rate (%)"
          description="Applied to the subtotal after the discount."
          value={taxRate}
          onChange={setTaxRate}
          min={0}
          max={100}
          step={0.5}
          hasClear
          width="100%"
        />
        <HStack gap={2} wrap="wrap">
          <StackItem size="fill">
            <Selector
              label="Discount type"
              options={DISCOUNT_OPTIONS}
              value={discountType}
              onChange={value => setDiscountType(value as DiscountType)}
              width="100%"
            />
          </StackItem>
          <StackItem size="fill">
            <NumberInput
              label={
                discountType === 'percent'
                  ? 'Discount (%)'
                  : 'Discount (USD)'
              }
              value={discountValue}
              onChange={setDiscountValue}
              min={0}
              max={discountType === 'percent' ? 100 : undefined}
              step={discountType === 'percent' ? 1 : 50}
              hasClear
              width="100%"
            />
          </StackItem>
        </HStack>
      </VStack>

      <Divider />

      {/* Notes */}
      <VStack gap={2}>
        <Heading level={2}>Notes</Heading>
        <TextArea
          label="Invoice notes"
          isLabelHidden
          rows={3}
          value={notes}
          onChange={setNotes}
          width="100%"
        />
        <Text type="supporting" color="secondary">
          Shown at the bottom of the invoice, above the footer.
        </Text>
      </VStack>
    </VStack>
  );

  const form = isSinglePane ? (
    <div style={styles.formSinglePane}>
      <div style={styles.formSinglePaneInner}>{formFields}</div>
    </div>
  ) : (
    <div style={styles.formColumn}>{formFields}</div>
  );

  // ---- preview pane ----

  const preview = (
    <div style={styles.previewScroll}>
      <VStack gap={2} style={{width: 640, maxWidth: '100%'}}>
        <Text type="supporting" color="secondary">
          Live preview · updates with every edit
        </Text>
        <InvoicePreview
          invoiceNumber={invoiceNumber}
          client={client}
          issueDate={issueDate}
          dueDate={dueDate}
          items={items}
          discountType={discountType}
          discountValue={discountValue}
          taxRate={taxRate}
          notes={notes}
          totals={totals}
          isSent={status === 'sent'}
        />
      </VStack>
    </div>
  );

  // ---- header ----

  const paneToggle: ReactNode = isSinglePane ? (
    <SegmentedControl
      label="Active pane"
      value={pane}
      onChange={value => setPane(value as Pane)}
      size="sm">
      <SegmentedControlItem
        value="edit"
        label="Edit"
        icon={<Icon icon={PencilLineIcon} size="sm" color="inherit" />}
      />
      <SegmentedControlItem
        value="preview"
        label="Preview"
        icon={<Icon icon={EyeIcon} size="sm" color="inherit" />}
      />
    </SegmentedControl>
  ) : null;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          {/* Phone tier: the row wraps so the pane toggle and actions drop
              under the title instead of clipping at 375px. */}
          <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
            <Icon icon={ReceiptTextIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>
                  Invoice {invoiceNumber.trim() === '' ? 'draft' : invoiceNumber}
                </Heading>
                <Badge
                  label={status === 'sent' ? 'Sent' : 'Draft'}
                  variant={status === 'sent' ? 'green' : 'neutral'}
                />
                <Tooltip content="Live total — mirrors the preview's amount due">
                  <Badge label={formatUSD(totals.total)} variant="blue" />
                </Tooltip>
              </HStack>
            </StackItem>
            {paneToggle}
            <Button
              label="Download PDF"
              size={isPhone ? 'md' : 'sm'}
              variant="secondary"
              icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
              // Phone tier: icon-only, but never unlabeled — tooltip plus
              // the label prop keep it announced and tappable.
              isIconOnly={isPhone}
              tooltip={isPhone ? 'Download PDF' : undefined}
              onClick={downloadInvoice}
            />
            <Button
              label={status === 'sent' ? 'Resend' : 'Send invoice'}
              size={isPhone ? 'md' : 'sm'}
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              tooltip={\`Send to \${client.email}\`}
              onClick={sendInvoice}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isSinglePane ? undefined : (
          <LayoutPanel width={400} padding={0} hasDivider label="Invoice form">
            {form}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          {isSinglePane ? (activePane === 'edit' ? form : preview) : preview}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};