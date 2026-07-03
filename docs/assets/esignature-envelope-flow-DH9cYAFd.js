var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one 3-page 'master-services-agreement
 *   .pdf' painted from percent-positioned paint blocks; 3 recipients — Ana
 *   Moreno / signer, Devon Blake / signer, Priya Raghavan / CC — plus a
 *   2-person add-recipient bench; 5 pre-placed signature/date/initials
 *   fields with page coordinates; a fixed timestamp ladder that the delivery
 *   simulator walks through)
 * @output E-Signature ENVELOPE BUILDER: a four-step wizard — (1) Documents:
 *   page-thumbnail rail + full page preview with placed-field count Badges;
 *   (2) Recipients: signing-order list with colored sequence circles that
 *   renumber live on reorder (accessible ChevronUp/ChevronDown moves), a
 *   Signer / Approver / CC role Selector per row (switching to CC drops the
 *   sequence number, hides that person from the field-assignment picker, and
 *   strips their placed fields behind an Undo Toast), add-from-bench and
 *   remove-with-Undo; (3) Fields: a palette of Signature / Date signed /
 *   Initials chips + a recipient assignment picker + per-recipient placed
 *   count sidebar beside a Page 1/2/3 SegmentedControl page preview where
 *   clicking the paper places the active chip at the click point (plus a
 *   keyboard 'Place at page center' Button), chips are color-coded by
 *   recipient, selectable, and deletable from the chip's X or the selection
 *   strip; (4) Review & send: MetadataList summary + editable email subject
 *   and message. Send flips the ENTIRE surface into a delivery tracker:
 *   per-recipient status rows (Waiting / Sent / Viewed / Signed / Approved)
 *   with the first signer in progress, a 'Simulate next event' Button that
 *   walks the sequential routing forward to a Completed Banner (CC copy
 *   delivered last), and a two-click Void confirm that returns to the editor
 * @position Page template; emitted by \`astryx template esignature-envelope-flow\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the envelope chrome
 * (file-signature Icon, envelope title, a live '3 pages · 3 recipients ·
 * 5 fields placed' counter — or routing progress once sent — and a ghost
 * Cancel). LayoutContent scrolls one centered maxWidth-960 column: stepper,
 * step Card, Back/Next footer (form-wizard idiom). The fields step splits
 * the card internally into a 240px tool sidebar + the page preview column;
 * no LayoutPanel — the wizard is one focused task, so everything lives in
 * the single step Card.
 *
 * Responsive contract:
 * - Content column: maxWidth 960, centered, viewport-side padding at every
 *   width; the step Card always fills the column.
 * - Stepper: >640px numbered circles with titles beneath; <=640px circles +
 *   connectors only (the current title stays in the header readout).
 * - Documents step: >640px thumbnail rail (120px) beside the preview;
 *   <=640px thumbnails become a horizontal scroll row above the preview.
 * - Recipients step: rows are flex with wrap — at narrow widths the role
 *   Selector and the move/remove cluster wrap under the identity block;
 *   move/remove IconButtons grow to lg (~40px) at <=640px.
 * - Fields step: >640px sidebar + preview side by side; <=640px the sidebar
 *   stacks above the preview as full-width sections. Click-to-place works
 *   by tap; the 'Place at page center' Button and the selection strip's
 *   Delete Button provide >=40px non-pointer affordances for everything a
 *   tiny chip X does.
 * - Page paper: AspectRatio 8.5x11, container-query (cqw) type sizing, so
 *   the same paint fixture renders the 120px thumbnails and the ~460px
 *   preview identically; maxWidth 460 keeps the page from towering.
 * - Tracker: status rows are flex with wrap; the event timeline keeps a
 *   left inset at all widths and timestamps never truncate (tabular text
 *   wraps under the label instead).
 *
 * Container policy (wizard archetype): frame-first chrome; one step Card;
 * the only other "cards" are the paper page surfaces, locked to light
 * (colorScheme) so the document reads as paper in dark mode. All sequence
 * numbers, per-recipient counts, and validation hints derive live from the
 * recipients + fields arrays — nothing is cached.
 */

import {useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {FormLayout} from '@astryxdesign/core/FormLayout';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
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
import {
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CrosshairIcon,
  EyeIcon,
  FileSignatureIcon,
  MailIcon,
  PenLineIcon,
  SendIcon,
  Trash2Icon,
  TypeIcon,
  Undo2Icon,
  UserPlusIcon,
  XIcon,
} from 'lucide-react';

// ============= PAPER PAINT CONSTANTS =============
// The agreement pages are "paper": literal light colors locked with
// colorScheme:'light' so the document reads identically in dark mode.

const PAPER_TEXT = '#1C2733';
const PAPER_MUTED = '#6E7D8B';
const PAPER_LINE = '#D7DEE5';
const PAPER_RULE = '#B9C4CE';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered wizard column; side padding keeps the card off the viewport
  // edges at every width.
  column: {
    maxWidth: 960,
    margin: '0 auto',
    padding: 'var(--spacing-6) var(--spacing-4)',
    boxSizing: 'border-box',
  },
  // Stepper (form-wizard idiom): an <ol> of steps joined by connectors.
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
  connector: {
    flex: 1,
    height: 2,
    marginTop: 13,
    backgroundColor: 'var(--color-border, var(--color-background-muted))',
  },
  connectorDone: {
    backgroundColor: 'var(--color-accent)',
  },
  // The paper surface: white page, container for cqw type sizing.
  paper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    color: PAPER_TEXT,
    colorScheme: 'light',
    containerType: 'inline-size',
    overflow: 'hidden',
    borderRadius: 4,
    border: '1px solid var(--color-border, #D7DEE5)',
    boxSizing: 'border-box',
  },
  paperClickable: {
    cursor: 'crosshair',
  },
  // Placed field chip: color-coded translucent box centered on its coords.
  fieldChip: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    borderRadius: '0.8cqw',
    fontSize: '2.1cqw',
    fontWeight: 600,
    lineHeight: 1,
    padding: 0,
    font: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  fieldChipDelete: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    padding: 0,
    fontSize: 11,
    lineHeight: 1,
  },
  // Page preview column: cap the page width so an 8.5x11 sheet does not
  // tower over the sidebar.
  previewWrap: {
    maxWidth: 460,
    width: '100%',
    margin: '0 auto',
  },
  thumbButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'inherit',
    font: 'inherit',
    color: 'inherit',
  },
  thumbSelected: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: 2,
    borderRadius: 6,
  },
  // <=640px documents step: thumbnails become one horizontal scroll row.
  thumbRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBottom: 'var(--spacing-1)',
  },
  thumbRowItem: {
    width: 96,
    flexShrink: 0,
  },
  // Recipient sequence circle, tinted per recipient.
  seqCircle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: '#FFFFFF',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-semibold)',
    flexShrink: 0,
  },
  seqCircleCc: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    border: '2px dashed var(--color-border, #B9C4CE)',
    color: 'var(--color-text-secondary)',
    fontSize: 10,
    fontWeight: 600,
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  // Recipient rows wrap at narrow widths instead of overflowing.
  recipientRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  recipientIdentity: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flex: '1 1 220px',
    minWidth: 0,
  },
  roleSelect: {
    width: 190,
    flexShrink: 0,
  },
  // Palette chip buttons: full-width rows with a color-neutral swatch.
  paletteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-1) var(--spacing-2)',
    boxSizing: 'border-box',
    borderRadius: 8,
    border: '1px solid var(--color-border, #B9C4CE)',
    background: 'none',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
    textAlign: 'left',
  },
  paletteButtonActive: {
    borderColor: 'var(--color-accent)',
    outline: '1px solid var(--color-accent)',
    backgroundColor: 'var(--color-background-muted)',
  },
  assigneeDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  fieldsSplit: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'flex-start',
  },
  fieldsSidebar: {
    width: 240,
    flexShrink: 0,
  },
  fieldsSidebarStacked: {
    width: '100%',
  },
  // Tracker event timeline: inset under the recipient identity.
  timeline: {
    borderLeft: '2px solid var(--color-border, #B9C4CE)',
    paddingLeft: 'var(--spacing-3)',
    marginLeft: 13,
  },
};

// ============= DATA =============
// Deterministic fixtures only: no clocks, no randomness, no network assets.

const ENVELOPE_TITLE = 'Master Services Agreement — Q3 renewal';
const DOCUMENT_FILE = 'master-services-agreement.pdf';

const STEPS = [
  {id: 'documents', title: 'Documents'},
  {id: 'recipients', title: 'Recipients'},
  {id: 'fields', title: 'Fields'},
  {id: 'review', title: 'Review & send'},
];

type Role = 'signer' | 'approver' | 'cc';

const ROLE_OPTIONS = [
  {value: 'signer', label: 'Signer'},
  {value: 'approver', label: 'Approver'},
  {value: 'cc', label: 'Receives a copy (CC)'},
];

const ROLE_LABELS: Record<Role, string> = {
  signer: 'Signer',
  approver: 'Approver',
  cc: 'CC',
};

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: Role;
  colorIndex: number;
}

// Recipient color coding: sequence circles, assignment picker dots, and
// placed-chip tints all derive from this palette by colorIndex.
const RECIPIENT_COLORS = [
  {solid: '#0B5FAE', soft: 'rgba(11, 95, 174, 0.12)'},
  {solid: '#B45309', soft: 'rgba(180, 83, 9, 0.12)'},
  {solid: '#6D28D9', soft: 'rgba(109, 40, 217, 0.12)'},
  {solid: '#0F766E', soft: 'rgba(15, 118, 110, 0.12)'},
  {solid: '#BE185D', soft: 'rgba(190, 24, 93, 0.12)'},
];

const INITIAL_RECIPIENTS: Recipient[] = [
  {
    id: 'r-ana',
    name: 'Ana Moreno',
    email: 'ana.moreno@brightline.co',
    role: 'signer',
    colorIndex: 0,
  },
  {
    id: 'r-devon',
    name: 'Devon Blake',
    email: 'devon.blake@northwind.dev',
    role: 'signer',
    colorIndex: 1,
  },
  {
    id: 'r-priya',
    name: 'Priya Raghavan',
    email: 'priya.r@northwind.dev',
    role: 'cc',
    colorIndex: 2,
  },
];

// Bench of addable people; "Add recipient" pulls the next unused one.
const RECIPIENT_BENCH = [
  {id: 'r-marcus', name: 'Marcus Webb', email: 'marcus.webb@brightline.co'},
  {id: 'r-elena', name: 'Elena Fisher', email: 'elena.fisher@northwind.dev'},
];

type FieldKind = 'signature' | 'date' | 'initials';

interface FieldKindMeta {
  label: string; // palette label
  chipLabel: string; // text painted inside the placed chip
  icon: typeof PenLineIcon;
  w: number; // chip width, % of page width
  h: number; // chip height, % of page height
}

const FIELD_KINDS: Record<FieldKind, FieldKindMeta> = {
  signature: {
    label: 'Signature',
    chipLabel: 'Sign',
    icon: PenLineIcon,
    w: 24,
    h: 6,
  },
  date: {
    label: 'Date signed',
    chipLabel: 'Date',
    icon: CalendarIcon,
    w: 16,
    h: 5,
  },
  initials: {
    label: 'Initials',
    chipLabel: 'Initials',
    icon: TypeIcon,
    w: 11,
    h: 5,
  },
};

const FIELD_KIND_ORDER: FieldKind[] = ['signature', 'date', 'initials'];

interface PlacedField {
  id: string;
  kind: FieldKind;
  recipientId: string;
  page: number; // 0-based page index
  x: number; // chip center, % of page width
  y: number; // chip center, % of page height
}

// 5 pre-placed fields with page coordinates (spec fixture).
const INITIAL_FIELDS: PlacedField[] = [
  {id: 'f-1', kind: 'signature', recipientId: 'r-ana', page: 2, x: 29, y: 46},
  {id: 'f-2', kind: 'date', recipientId: 'r-ana', page: 2, x: 72, y: 46},
  {id: 'f-3', kind: 'signature', recipientId: 'r-devon', page: 2, x: 29, y: 62},
  {id: 'f-4', kind: 'initials', recipientId: 'r-ana', page: 0, x: 86, y: 92},
  {id: 'f-5', kind: 'initials', recipientId: 'r-devon', page: 1, x: 86, y: 92},
];

// ---- document paint blocks (percent coordinates on an 8.5x11 sheet) ----

type PaintBlock =
  | {kind: 'title'; x: number; y: number; w: number; text: string}
  | {kind: 'caption'; x: number; y: number; w: number; text: string}
  | {kind: 'heading'; x: number; y: number; w: number; text: string}
  | {kind: 'rule'; x: number; y: number; w: number}
  | {kind: 'lines'; x: number; y: number; w: number; count: number; lastW: number}
  | {kind: 'sigline'; x: number; y: number; w: number; label: string};

const PAGE_PAINT: PaintBlock[][] = [
  // Page 1 — cover + opening sections.
  [
    {kind: 'title', x: 14, y: 6, w: 72, text: 'MASTER SERVICES AGREEMENT'},
    {kind: 'caption', x: 22, y: 10.5, w: 56, text: 'Northwind Labs, Inc. · Brightline Co.'},
    {kind: 'rule', x: 14, y: 14, w: 72},
    {kind: 'heading', x: 10, y: 18, w: 42, text: '1. Services'},
    {kind: 'lines', x: 10, y: 22, w: 80, count: 5, lastW: 55},
    {kind: 'heading', x: 10, y: 36.5, w: 42, text: '2. Term & renewal'},
    {kind: 'lines', x: 10, y: 40.5, w: 80, count: 4, lastW: 70},
    {kind: 'heading', x: 10, y: 52.5, w: 42, text: '3. Fees & invoicing'},
    {kind: 'lines', x: 10, y: 56.5, w: 80, count: 6, lastW: 40},
    {kind: 'heading', x: 10, y: 73.5, w: 42, text: '4. Service levels'},
    {kind: 'lines', x: 10, y: 77.5, w: 80, count: 4, lastW: 62},
  ],
  // Page 2 — body sections.
  [
    {kind: 'heading', x: 10, y: 7, w: 46, text: '5. Confidentiality'},
    {kind: 'lines', x: 10, y: 11, w: 80, count: 6, lastW: 48},
    {kind: 'heading', x: 10, y: 28, w: 46, text: '6. Data protection'},
    {kind: 'lines', x: 10, y: 32, w: 80, count: 6, lastW: 66},
    {kind: 'heading', x: 10, y: 49, w: 46, text: '7. Limitation of liability'},
    {kind: 'lines', x: 10, y: 53, w: 80, count: 5, lastW: 52},
    {kind: 'heading', x: 10, y: 67.5, w: 46, text: '8. Termination'},
    {kind: 'lines', x: 10, y: 71.5, w: 80, count: 5, lastW: 44},
  ],
  // Page 3 — general provisions + signature blocks.
  [
    {kind: 'heading', x: 10, y: 7, w: 46, text: '9. General provisions'},
    {kind: 'lines', x: 10, y: 11, w: 80, count: 5, lastW: 58},
    {kind: 'caption', x: 10, y: 27, w: 80, text: 'IN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.'},
    {kind: 'rule', x: 10, y: 33, w: 80},
    {kind: 'sigline', x: 10, y: 48, w: 38, label: 'Client signature — Brightline Co.'},
    {kind: 'sigline', x: 58, y: 48, w: 32, label: 'Date'},
    {kind: 'sigline', x: 10, y: 64, w: 38, label: 'Provider signature — Northwind Labs'},
    {kind: 'sigline', x: 58, y: 64, w: 32, label: 'Date'},
    {kind: 'caption', x: 10, y: 75, w: 80, text: 'Countersign within 10 business days of receipt.'},
  ],
];

const PAGE_COUNT = PAGE_PAINT.length;

// ---- delivery simulation ----
// Fixed timestamp ladder: routing stage k (0-based across all recipients)
// resolves to EVENT_TIMES[k]. Long enough for 5 routing recipients.
const EVENT_TIMES = [
  'Jun 12, 9:04 AM',
  'Jun 12, 9:31 AM',
  'Jun 12, 10:12 AM',
  'Jun 12, 11:47 AM',
  'Jun 12, 1:03 PM',
  'Jun 12, 2:26 PM',
  'Jun 12, 4:15 PM',
  'Jun 13, 8:42 AM',
  'Jun 13, 9:18 AM',
  'Jun 13, 10:05 AM',
  'Jun 13, 11:30 AM',
  'Jun 13, 1:21 PM',
  'Jun 13, 2:52 PM',
  'Jun 13, 4:07 PM',
  'Jun 14, 9:15 AM',
];

const eventTime = (index: number) =>
  EVENT_TIMES[Math.min(index, EVENT_TIMES.length - 1)];

/** Stage labels per role: sent -> viewed -> signed/approved. */
const stageLabels = (role: Role): [string, string, string] =>
  role === 'approver' ? ['Sent', 'Viewed', 'Approved'] : ['Sent', 'Viewed', 'Signed'];

const clampPct = (value: number, halfSpan: number) =>
  Math.min(Math.max(value, halfSpan + 1), 100 - halfSpan - 1);

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
    <nav aria-label="Envelope progress">
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
              done={index <= currentStep}
              width={isCompact ? 28 : 110}>
              {state === 'done' ? (
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

// ============= PAGE PAINT =============

/** One document paint block; all type sizes are cqw so miniatures scale. */
function PaintBlockView({block}: {block: PaintBlock}) {
  const frame: CSSProperties = {
    position: 'absolute',
    left: \`\${block.x}%\`,
    top: \`\${block.y}%\`,
    width: \`\${block.w}%\`,
  };
  switch (block.kind) {
    case 'title':
      return (
        <div
          style={{
            ...frame,
            fontSize: '3.4cqw',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
          {block.text}
        </div>
      );
    case 'caption':
      return (
        <div
          style={{
            ...frame,
            fontSize: '2.1cqw',
            color: PAPER_MUTED,
            textAlign: block.w > 60 ? 'left' : 'center',
            lineHeight: 1.35,
          }}>
          {block.text}
        </div>
      );
    case 'heading':
      return (
        <div style={{...frame, fontSize: '2.6cqw', fontWeight: 600, lineHeight: 1.2}}>
          {block.text}
        </div>
      );
    case 'rule':
      return (
        <div
          aria-hidden
          style={{...frame, height: '0.28%', backgroundColor: PAPER_RULE}}
        />
      );
    case 'lines':
      return (
        <div
          aria-hidden
          style={{
            ...frame,
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2cqw',
          }}>
          {Array.from({length: block.count}, (_, index) => (
            <div
              key={index}
              style={{
                height: '1.35cqw',
                borderRadius: '0.6cqw',
                backgroundColor: PAPER_LINE,
                width:
                  index === block.count - 1 ? \`\${block.lastW}%\` : '100%',
              }}
            />
          ))}
        </div>
      );
    case 'sigline':
      return (
        <div style={frame}>
          <div
            aria-hidden
            style={{height: '0.3cqw', backgroundColor: PAPER_TEXT, opacity: 0.65}}
          />
          <div style={{fontSize: '1.9cqw', color: PAPER_MUTED, marginTop: '0.8cqw'}}>
            {block.label}
          </div>
        </div>
      );
  }
}

// ============= PAGE CANVAS =============

interface PageCanvasProps {
  pageIndex: number;
  fields: PlacedField[]; // fields on this page only
  recipientById: Map<string, Recipient>;
  interactive: boolean;
  selectedFieldId?: string | null;
  onPlace?: (x: number, y: number) => void;
  onSelectField?: (id: string) => void;
  onDeleteField?: (id: string) => void;
}

/**
 * One 8.5x11 paper page: paint blocks + placed field chips, both positioned
 * by percentages with cqw type sizing, so the identical fixture renders the
 * 120px thumbnail and the ~460px preview. In interactive mode a click on
 * blank paper reports its percent coordinates for click-to-place.
 */
function PageCanvas({
  pageIndex,
  fields,
  recipientById,
  interactive,
  selectedFieldId,
  onPlace,
  onSelectField,
  onDeleteField,
}: PageCanvasProps) {
  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || onPlace == null) {
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    onPlace(x, y);
  };

  return (
    <AspectRatio ratio={8.5 / 11}>
      <div
        style={{
          ...styles.paper,
          ...(interactive ? styles.paperClickable : undefined),
        }}
        onClick={handlePaperClick}>
        {PAGE_PAINT[pageIndex].map((block, index) => (
          <PaintBlockView key={\`p\${pageIndex}-b\${index}\`} block={block} />
        ))}
        {fields.map(field => {
          const meta = FIELD_KINDS[field.kind];
          const recipient = recipientById.get(field.recipientId);
          const color = RECIPIENT_COLORS[recipient?.colorIndex ?? 0];
          const isSelected = field.id === selectedFieldId;
          const chipStyle: CSSProperties = {
            ...styles.fieldChip,
            left: \`\${field.x}%\`,
            top: \`\${field.y}%\`,
            width: \`\${meta.w}%\`,
            height: \`\${meta.h}%\`,
            backgroundColor: color.soft,
            border: \`1px solid \${color.solid}\`,
            color: color.solid,
            ...(isSelected
              ? {outline: \`2px solid \${color.solid}\`, outlineOffset: 1}
              : undefined),
          };
          if (!interactive) {
            return (
              <div key={field.id} aria-hidden style={chipStyle}>
                {meta.chipLabel}
              </div>
            );
          }
          return (
            <button
              key={field.id}
              type="button"
              style={{...chipStyle, cursor: 'pointer'}}
              aria-label={\`\${meta.label} field for \${
                recipient?.name ?? 'unassigned'
              } on page \${pageIndex + 1}\`}
              aria-pressed={isSelected}
              onClick={event => {
                event.stopPropagation();
                onSelectField?.(field.id);
              }}>
              {meta.chipLabel}
              {isSelected && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={\`Delete this \${meta.label.toLowerCase()} field\`}
                  style={{...styles.fieldChipDelete, backgroundColor: color.solid}}
                  onClick={event => {
                    event.stopPropagation();
                    onDeleteField?.(field.id);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onDeleteField?.(field.id);
                    }
                  }}>
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>
    </AspectRatio>
  );
}

// ============= PAGE =============

export default function EsignatureEnvelopeFlowTemplate() {
  const [step, setStep] = useState(0);
  const [recipients, setRecipients] = useState<Recipient[]>(INITIAL_RECIPIENTS);
  const [fields, setFields] = useState<PlacedField[]>(INITIAL_FIELDS);

  // Documents + fields steps share the page selection.
  const [pageIndex, setPageIndex] = useState(0);

  // Fields step tools.
  const [activeKind, setActiveKind] = useState<FieldKind>('signature');
  const [assigneeId, setAssigneeId] = useState('r-ana');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>('f-1');
  const [placeSeq, setPlaceSeq] = useState(1);

  // Review step.
  const [emailSubject, setEmailSubject] = useState(
    'Please sign: Master Services Agreement — Q3 renewal',
  );
  const [emailMessage, setEmailMessage] = useState(
    'Hi all — the renewed MSA is ready for signature. Fees and the new SLA tier are in sections 3 and 4. Please sign by Friday.',
  );

  // Delivery tracker.
  const [isSent, setIsSent] = useState(false);
  const [advanceCount, setAdvanceCount] = useState(0);
  const [isVoidConfirmOpen, setIsVoidConfirmOpen] = useState(false);

  const toast = useToast();

  // Responsive contract: <=640px stacks the fields sidebar, compacts the
  // stepper, and turns the thumbnail rail into a horizontal scroll row.
  const isCompact = useMediaQuery('(max-width: 640px)');

  // ---- derived state ----
  const recipientById = new Map(recipients.map(r => [r.id, r]));
  // Routing recipients (signers + approvers) in list order carry sequence
  // numbers 1..n; CC recipients drop out of the sequence and the picker.
  const routingRecipients = recipients.filter(r => r.role !== 'cc');
  const ccRecipients = recipients.filter(r => r.role === 'cc');
  const seqByRecipientId = new Map(
    routingRecipients.map((r, index) => [r.id, index + 1]),
  );
  const fieldCountByRecipientId = new Map<string, number>();
  for (const field of fields) {
    fieldCountByRecipientId.set(
      field.recipientId,
      (fieldCountByRecipientId.get(field.recipientId) ?? 0) + 1,
    );
  }
  const fieldsOnPage = (index: number) =>
    fields.filter(field => field.page === index);
  const selectedField = fields.find(f => f.id === selectedFieldId) ?? null;

  // Assignment picker falls back to the first routing recipient whenever
  // the chosen assignee was removed or demoted to CC.
  const effectiveAssigneeId = routingRecipients.some(r => r.id === assigneeId)
    ? assigneeId
    : routingRecipients[0]?.id ?? null;
  const effectiveAssignee =
    effectiveAssigneeId != null ? recipientById.get(effectiveAssigneeId) : null;

  // ---- validation gates ----
  const hasSigner = recipients.some(r => r.role === 'signer');
  const routingMissingFields = routingRecipients.filter(
    r => (fieldCountByRecipientId.get(r.id) ?? 0) === 0,
  );
  const canAdvance =
    step === 1 ? hasSigner : step === 2 ? routingMissingFields.length === 0 : true;
  const advanceHint =
    step === 1 && !hasSigner
      ? 'Add at least one signer to continue.'
      : step === 2 && routingMissingFields.length > 0
        ? \`Place at least one field for \${routingMissingFields
            .map(r => r.name.split(' ')[0])
            .join(', ')}.\`
        : null;

  const isReview = step === STEPS.length - 1;

  // ---- undo toast helper ----
  const showUndoToast = (body: string, onUndo: () => void) => {
    let dismiss: (() => void) | undefined;
    dismiss = toast({
      body,
      endContent: (
        <Button
          label="Undo"
          size="sm"
          variant="secondary"
          icon={<Icon icon={Undo2Icon} size="sm" color="inherit" />}
          onClick={() => {
            onUndo();
            dismiss?.();
          }}
        />
      ),
    });
  };

  // ---- recipient actions ----
  /** Swap a recipient with its neighbor; sequence badges renumber live. */
  const moveRecipient = (id: string, direction: -1 | 1) => {
    setRecipients(prev => {
      const index = prev.findIndex(r => r.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) {
        return prev;
      }
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeRecipient = (id: string) => {
    const index = recipients.findIndex(r => r.id === id);
    const recipient = recipients[index];
    if (recipient == null) {
      return;
    }
    const removedFields = fields.filter(f => f.recipientId === id);
    setRecipients(prev => prev.filter(r => r.id !== id));
    setFields(prev => prev.filter(f => f.recipientId !== id));
    setSelectedFieldId(prev =>
      prev != null && removedFields.some(f => f.id === prev) ? null : prev,
    );
    showUndoToast(
      removedFields.length > 0
        ? \`Removed \${recipient.name} and \${removedFields.length} placed field\${
            removedFields.length === 1 ? '' : 's'
          }\`
        : \`Removed \${recipient.name}\`,
      () => {
        setRecipients(prev => [
          ...prev.slice(0, index),
          recipient,
          ...prev.slice(index),
        ]);
        setFields(prev => [...prev, ...removedFields]);
      },
    );
  };

  /**
   * Role changes renumber the sequence immediately. Demoting to CC also
   * strips that person's placed fields (CC recipients don't sign) behind
   * an Undo that restores both the role and the fields.
   */
  const changeRole = (id: string, role: Role) => {
    const recipient = recipientById.get(id);
    if (recipient == null || recipient.role === role) {
      return;
    }
    const previousRole = recipient.role;
    const strippedFields =
      role === 'cc' ? fields.filter(f => f.recipientId === id) : [];
    setRecipients(prev => prev.map(r => (r.id === id ? {...r, role} : r)));
    if (strippedFields.length > 0) {
      setFields(prev => prev.filter(f => f.recipientId !== id));
      setSelectedFieldId(prev =>
        prev != null && strippedFields.some(f => f.id === prev) ? null : prev,
      );
      showUndoToast(
        \`\${recipient.name} is now CC — removed \${strippedFields.length} placed field\${
          strippedFields.length === 1 ? '' : 's'
        }\`,
        () => {
          setRecipients(prev =>
            prev.map(r => (r.id === id ? {...r, role: previousRole} : r)),
          );
          setFields(prev => [...prev, ...strippedFields]);
        },
      );
    }
  };

  const addRecipient = () => {
    const bench = RECIPIENT_BENCH.find(
      person => !recipients.some(r => r.id === person.id),
    );
    if (bench == null) {
      return;
    }
    const usedColors = new Set(recipients.map(r => r.colorIndex));
    const colorIndex =
      RECIPIENT_COLORS.findIndex((_, index) => !usedColors.has(index)) === -1
        ? recipients.length % RECIPIENT_COLORS.length
        : RECIPIENT_COLORS.findIndex((_, index) => !usedColors.has(index));
    setRecipients(prev => [...prev, {...bench, role: 'signer', colorIndex}]);
    toast({body: \`Added \${bench.name} as a signer\`, isAutoHide: true});
  };

  const canAddRecipient = RECIPIENT_BENCH.some(
    person => !recipients.some(r => r.id === person.id),
  );

  // ---- field actions ----
  const placeField = (x: number, y: number) => {
    if (effectiveAssigneeId == null) {
      toast({
        body: 'Add a signer or approver before placing fields.',
        isAutoHide: true,
      });
      return;
    }
    const meta = FIELD_KINDS[activeKind];
    const id = \`f-placed-\${placeSeq}\`;
    setPlaceSeq(prev => prev + 1);
    setFields(prev => [
      ...prev,
      {
        id,
        kind: activeKind,
        recipientId: effectiveAssigneeId,
        page: pageIndex,
        x: clampPct(x, meta.w / 2),
        y: clampPct(y, meta.h / 2),
      },
    ]);
    setSelectedFieldId(id);
  };

  const deleteField = (id: string) => {
    const field = fields.find(f => f.id === id);
    if (field == null) {
      return;
    }
    setFields(prev => prev.filter(f => f.id !== id));
    setSelectedFieldId(prev => (prev === id ? null : prev));
    const owner = recipientById.get(field.recipientId);
    showUndoToast(
      \`Deleted \${FIELD_KINDS[field.kind].label.toLowerCase()} field\${
        owner != null ? \` for \${owner.name}\` : ''
      } on page \${field.page + 1}\`,
      () => setFields(prev => [...prev, field]),
    );
  };

  // ---- delivery simulation ----
  // Recipient i's routing progress: 0 waiting, 1 sent, 2 viewed, 3 done.
  const routingProgress = (index: number) =>
    Math.min(Math.max(advanceCount + 1 - 3 * index, 0), 3);
  const totalStages = routingRecipients.length * 3;
  const isRoutingComplete =
    routingRecipients.length > 0 && advanceCount + 1 >= totalStages;
  const completedSigners = routingRecipients.filter(
    (_, index) => routingProgress(index) === 3,
  ).length;

  const sendEnvelope = () => {
    setIsSent(true);
    setAdvanceCount(0);
    setIsVoidConfirmOpen(false);
    toast({
      body: \`Envelope sent — \${routingRecipients[0]?.name ?? 'first recipient'} is up first\`,
      isAutoHide: true,
    });
  };

  const voidEnvelope = () => {
    setIsSent(false);
    setAdvanceCount(0);
    setIsVoidConfirmOpen(false);
    setStep(STEPS.length - 1);
    toast({body: 'Envelope voided — back to the editor', isAutoHide: true});
  };

  // ---- shared header ----
  const builderCounter = \`\${PAGE_COUNT} pages · \${recipients.length} recipient\${
    recipients.length === 1 ? '' : 's'
  } · \${fields.length} field\${fields.length === 1 ? '' : 's'} placed\`;
  const trackerCounter = isRoutingComplete
    ? 'All parties complete'
    : \`\${completedSigners} of \${routingRecipients.length} complete\`;

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Icon icon={FileSignatureIcon} size="md" color="secondary" />
            <Heading level={1} maxLines={1}>
              {ENVELOPE_TITLE}
            </Heading>
            {!isCompact && (
              <Text type="supporting" color="secondary" maxLines={1}>
                · {isSent ? trackerCounter : builderCounter}
              </Text>
            )}
          </HStack>
        </StackItem>
        {isSent ? (
          <Badge
            label={isRoutingComplete ? 'Completed' : 'In routing'}
            variant={isRoutingComplete ? 'success' : 'yellow'}
          />
        ) : (
          <>
            {!isCompact && (
              <Text type="supporting" color="secondary">
                Step {step + 1} of {STEPS.length}: {STEPS[step].title}
              </Text>
            )}
            <Button label="Cancel" variant="ghost" />
          </>
        )}
      </HStack>
    </LayoutHeader>
  );

  // ============= STEP BODIES =============

  // ---- step 0: documents ----
  const renderThumb = (index: number) => {
    const count = fieldsOnPage(index).length;
    const isSelected = index === pageIndex;
    return (
      <button
        key={index}
        type="button"
        style={{
          ...styles.thumbButton,
          ...(isSelected ? styles.thumbSelected : undefined),
        }}
        aria-label={\`Preview page \${index + 1}\${
          count > 0 ? \` (\${count} field\${count === 1 ? '' : 's'})\` : ''
        }\`}
        aria-pressed={isSelected}
        onClick={() => setPageIndex(index)}>
        <VStack gap={1}>
          <PageCanvas
            pageIndex={index}
            fields={fieldsOnPage(index)}
            recipientById={recipientById}
            interactive={false}
          />
          <HStack gap={1} vAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              Page {index + 1}
            </Text>
            {count > 0 && (
              <Badge label={\`\${count}\`} variant="neutral" />
            )}
          </HStack>
        </VStack>
      </button>
    );
  };

  const documentsStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Documents</Heading>
        <Text type="supporting" color="secondary">
          {DOCUMENT_FILE} · {PAGE_COUNT} pages · 184 KB. Select a page to
          preview it; badge counts show fields already placed there.
        </Text>
      </VStack>
      {isCompact ? (
        <VStack gap={3}>
          <div style={styles.thumbRow}>
            {Array.from({length: PAGE_COUNT}, (_, index) => (
              <div key={index} style={styles.thumbRowItem}>
                {renderThumb(index)}
              </div>
            ))}
          </div>
          <div style={styles.previewWrap}>
            <PageCanvas
              pageIndex={pageIndex}
              fields={fieldsOnPage(pageIndex)}
              recipientById={recipientById}
              interactive={false}
            />
          </div>
        </VStack>
      ) : (
        <HStack gap={5} vAlign="start">
          <div style={{width: 120, flexShrink: 0}}>
            <VStack gap={3}>
              {Array.from({length: PAGE_COUNT}, (_, index) =>
                renderThumb(index),
              )}
            </VStack>
          </div>
          <StackItem size="fill">
            <div style={styles.previewWrap}>
              <PageCanvas
                pageIndex={pageIndex}
                fields={fieldsOnPage(pageIndex)}
                recipientById={recipientById}
                interactive={false}
              />
            </div>
          </StackItem>
        </HStack>
      )}
    </VStack>
  );

  // ---- step 1: recipients ----
  const recipientsStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Recipients & signing order</Heading>
        <Text type="supporting" color="secondary">
          Routing is sequential: each numbered recipient acts only after the
          one before finishes. CC recipients get the completed copy and never
          sign — they drop out of the sequence and the field picker.
        </Text>
      </VStack>
      <VStack gap={2}>
        {recipients.map((recipient, index) => {
          const color = RECIPIENT_COLORS[recipient.colorIndex];
          const seq = seqByRecipientId.get(recipient.id);
          const controlSize = isCompact ? 'lg' : 'sm';
          return (
            <div key={recipient.id}>
              {index > 0 && <Divider />}
              <div style={{...styles.recipientRow, paddingTop: index > 0 ? 'var(--spacing-2)' : 0}}>
                {recipient.role === 'cc' ? (
                  <Tooltip content="CC — receives the completed copy">
                    <div style={styles.seqCircleCc} aria-label="CC recipient">
                      CC
                    </div>
                  </Tooltip>
                ) : (
                  <div
                    style={{...styles.seqCircle, backgroundColor: color.solid}}
                    aria-label={\`Signs \${seq}\${
                      seq === 1 ? 'st' : seq === 2 ? 'nd' : seq === 3 ? 'rd' : 'th'
                    }\`}>
                    {seq}
                  </div>
                )}
                <div style={styles.recipientIdentity}>
                  <Avatar name={recipient.name} size="small" />
                  <VStack gap={0}>
                    <Text type="body" maxLines={1}>
                      {recipient.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {recipient.email}
                    </Text>
                  </VStack>
                </div>
                <div style={styles.roleSelect}>
                  <Selector
                    label={\`Role for \${recipient.name}\`}
                    isLabelHidden
                    options={ROLE_OPTIONS}
                    value={recipient.role}
                    onChange={value => changeRole(recipient.id, value as Role)}
                  />
                </div>
                <HStack gap={0.5} vAlign="center">
                  <IconButton
                    label={\`Move \${recipient.name} earlier in the signing order\`}
                    tooltip="Move up"
                    icon={<Icon icon={ChevronUpIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size={controlSize}
                    isDisabled={index === 0}
                    onClick={() => moveRecipient(recipient.id, -1)}
                  />
                  <IconButton
                    label={\`Move \${recipient.name} later in the signing order\`}
                    tooltip="Move down"
                    icon={<Icon icon={ChevronDownIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size={controlSize}
                    isDisabled={index === recipients.length - 1}
                    onClick={() => moveRecipient(recipient.id, 1)}
                  />
                  <IconButton
                    label={\`Remove \${recipient.name} from the envelope\`}
                    tooltip="Remove"
                    icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                    variant="ghost"
                    size={controlSize}
                    onClick={() => removeRecipient(recipient.id)}
                  />
                </HStack>
              </div>
            </div>
          );
        })}
      </VStack>
      <HStack gap={2} vAlign="center">
        <Button
          label="Add recipient"
          variant="secondary"
          size="sm"
          icon={<Icon icon={UserPlusIcon} size="sm" color="inherit" />}
          isDisabled={!canAddRecipient}
          tooltip={
            canAddRecipient
              ? 'Add the next teammate from the directory'
              : 'Directory bench exhausted'
          }
          onClick={addRecipient}
        />
        <Text type="supporting" color="secondary">
          {routingRecipients.length} in routing · {ccRecipients.length} CC
        </Text>
      </HStack>
    </VStack>
  );

  // ---- step 2: fields ----
  const paletteSection = (
    <VStack gap={3}>
      <VStack gap={2}>
        <Text type="label">Field palette</Text>
        {FIELD_KIND_ORDER.map(kind => {
          const meta = FIELD_KINDS[kind];
          const isActive = kind === activeKind;
          return (
            <button
              key={kind}
              type="button"
              style={{
                ...styles.paletteButton,
                ...(isActive ? styles.paletteButtonActive : undefined),
              }}
              aria-pressed={isActive}
              onClick={() => setActiveKind(kind)}>
              <Icon icon={meta.icon} size="sm" color={isActive ? 'primary' : 'secondary'} />
              <Text type="body">{meta.label}</Text>
            </button>
          );
        })}
      </VStack>
      <VStack gap={2}>
        <Text type="label">Assign to</Text>
        {routingRecipients.length === 0 ? (
          <Text type="supporting" color="secondary">
            No signers or approvers — everyone is CC.
          </Text>
        ) : (
          <Selector
            label="Assign new fields to"
            isLabelHidden
            options={routingRecipients.map(r => ({
              value: r.id,
              label: \`\${seqByRecipientId.get(r.id)}. \${r.name}\`,
            }))}
            value={effectiveAssigneeId ?? ''}
            onChange={setAssigneeId}
          />
        )}
        <Button
          label={\`Place at center of page \${pageIndex + 1}\`}
          variant="secondary"
          size="sm"
          icon={<Icon icon={CrosshairIcon} size="sm" color="inherit" />}
          isDisabled={effectiveAssigneeId == null}
          onClick={() => placeField(50, 50)}
        />
      </VStack>
      <VStack gap={2}>
        <Text type="label">Placed fields</Text>
        {recipients.map(recipient => {
          const color = RECIPIENT_COLORS[recipient.colorIndex];
          const count = fieldCountByRecipientId.get(recipient.id) ?? 0;
          return (
            <HStack key={recipient.id} gap={2} vAlign="center">
              <div
                aria-hidden
                style={{...styles.assigneeDot, backgroundColor: color.solid}}
              />
              <StackItem size="fill">
                <Text
                  type="supporting"
                  color={recipient.role === 'cc' ? 'secondary' : 'primary'}
                  maxLines={1}>
                  {recipient.name}
                </Text>
              </StackItem>
              {recipient.role === 'cc' ? (
                <Text type="supporting" color="secondary">
                  CC — no fields
                </Text>
              ) : (
                <Badge
                  label={\`\${count} field\${count === 1 ? '' : 's'}\`}
                  variant={count === 0 ? 'yellow' : 'neutral'}
                />
              )}
            </HStack>
          );
        })}
      </VStack>
    </VStack>
  );

  const previewSection = (
    <VStack gap={3}>
      <SegmentedControl
        label="Page"
        value={String(pageIndex)}
        onChange={value => {
          setPageIndex(Number(value));
          setSelectedFieldId(null);
        }}
        size="sm">
        {Array.from({length: PAGE_COUNT}, (_, index) => (
          <SegmentedControlItem
            key={index}
            value={String(index)}
            label={\`Page \${index + 1}\`}
          />
        ))}
      </SegmentedControl>
      <Text type="supporting" color="secondary">
        Click the paper to place a {FIELD_KINDS[activeKind].label.toLowerCase()}
        {effectiveAssignee != null ? \` for \${effectiveAssignee.name}\` : ''}.
        Click a placed chip to select it.
      </Text>
      <div style={styles.previewWrap}>
        <PageCanvas
          pageIndex={pageIndex}
          fields={fieldsOnPage(pageIndex)}
          recipientById={recipientById}
          interactive
          selectedFieldId={selectedFieldId}
          onPlace={placeField}
          onSelectField={id =>
            setSelectedFieldId(prev => (prev === id ? null : id))
          }
          onDeleteField={deleteField}
        />
      </div>
      {selectedField != null && (
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" maxLines={1}>
              Selected: {FIELD_KINDS[selectedField.kind].label} ·{' '}
              {recipientById.get(selectedField.recipientId)?.name ?? '—'} ·
              page {selectedField.page + 1}
            </Text>
          </StackItem>
          <Button
            label="Delete field"
            variant="ghost"
            size="sm"
            icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
            onClick={() => deleteField(selectedField.id)}
          />
        </HStack>
      )}
    </VStack>
  );

  const fieldsStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Place fields</Heading>
        <Text type="supporting" color="secondary">
          Chips are color-coded by recipient. Every signer and approver needs
          at least one field before the envelope can go out.
        </Text>
      </VStack>
      <div
        style={{
          ...styles.fieldsSplit,
          flexDirection: isCompact ? 'column' : 'row',
        }}>
        <div style={isCompact ? styles.fieldsSidebarStacked : styles.fieldsSidebar}>
          {paletteSection}
        </div>
        <StackItem size="fill">{previewSection}</StackItem>
      </div>
    </VStack>
  );

  // ---- step 3: review & send ----
  const reviewStep = (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={2}>Review & send</Heading>
        <Text type="supporting" color="secondary">
          Nothing goes out until you send. Use the steps above to revisit any
          part of the envelope — everything you entered is kept.
        </Text>
      </VStack>
      <MetadataList columns="multi">
        <MetadataListItem label="Document">
          {DOCUMENT_FILE} · {PAGE_COUNT} pages
        </MetadataListItem>
        <MetadataListItem label="Fields placed">
          {fields.length} across{' '}
          {new Set(fields.map(f => f.page)).size} page
          {new Set(fields.map(f => f.page)).size === 1 ? '' : 's'}
        </MetadataListItem>
        <MetadataListItem label="Signing order">
          {routingRecipients.length === 0
            ? '—'
            : routingRecipients
                .map(
                  r =>
                    \`\${seqByRecipientId.get(r.id)}. \${r.name} (\${ROLE_LABELS[r.role]})\`,
                )
                .join(' → ')}
        </MetadataListItem>
        <MetadataListItem label="Copies to">
          {ccRecipients.length === 0
            ? 'No CC recipients'
            : ccRecipients.map(r => r.name).join(', ')}
        </MetadataListItem>
        {routingRecipients.map(r => (
          <MetadataListItem key={r.id} label={\`Fields for \${r.name}\`}>
            {fieldCountByRecipientId.get(r.id) ?? 0}
          </MetadataListItem>
        ))}
      </MetadataList>
      <Divider />
      <FormLayout>
        <TextInput
          label="Email subject"
          value={emailSubject}
          onChange={setEmailSubject}
        />
        <TextArea
          label="Message to recipients"
          rows={3}
          value={emailMessage}
          onChange={setEmailMessage}
        />
      </FormLayout>
      <Text type="supporting" color="secondary">
        Recipients sign in sequence; each receives their email only when the
        previous recipient completes.
      </Text>
    </VStack>
  );

  const stepBodies = [documentsStep, recipientsStep, fieldsStep, reviewStep];

  // ============= BUILDER SURFACE =============

  const builderSurface = (
    <div style={styles.column}>
      <VStack gap={5}>
        <Stepper currentStep={step} onStepSelect={setStep} isCompact={isCompact} />
        <Card padding={5} width="100%">
          {stepBodies[step]}
        </Card>
        <HStack gap={2} vAlign="center">
          <Button
            label="Back"
            variant="secondary"
            isDisabled={step === 0}
            onClick={() => setStep(current => Math.max(0, current - 1))}
          />
          <StackItem size="fill">
            {advanceHint != null && (
              <Text type="supporting" color="secondary">
                {advanceHint}
              </Text>
            )}
          </StackItem>
          <Button
            label={isReview ? 'Send envelope' : 'Next'}
            variant="primary"
            icon={
              isReview ? <Icon icon={SendIcon} size="sm" color="inherit" /> : undefined
            }
            isDisabled={!canAdvance || (isReview && routingMissingFields.length > 0)}
            onClick={() =>
              isReview
                ? sendEnvelope()
                : setStep(current => Math.min(STEPS.length - 1, current + 1))
            }
          />
        </HStack>
      </VStack>
    </div>
  );

  // ============= DELIVERY TRACKER SURFACE =============

  const trackerRows = routingRecipients.map((recipient, index) => {
    const color = RECIPIENT_COLORS[recipient.colorIndex];
    const progress = routingProgress(index);
    const labels = stageLabels(recipient.role);
    const isInProgress = progress > 0 && progress < 3;
    const statusLabel =
      progress === 0
        ? 'Waiting'
        : progress === 3
          ? labels[2]
          : labels[progress - 1];
    const statusVariant =
      progress === 3 ? 'success' : isInProgress ? 'yellow' : 'neutral';
    const statusIcon =
      progress === 0
        ? ClockIcon
        : progress === 1
          ? MailIcon
          : progress === 2
            ? EyeIcon
            : recipient.role === 'approver'
              ? CheckIcon
              : PenLineIcon;
    return (
      <div key={recipient.id}>
        {index > 0 && <Divider />}
        <VStack gap={2} style={{paddingTop: index > 0 ? 'var(--spacing-3)' : 0}}>
          <div style={styles.recipientRow}>
            <div style={{...styles.seqCircle, backgroundColor: color.solid}}>
              {index + 1}
            </div>
            <div style={styles.recipientIdentity}>
              <Avatar name={recipient.name} size="small" />
              <VStack gap={0}>
                <Text type="body" maxLines={1}>
                  {recipient.name}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {ROLE_LABELS[recipient.role]} · {recipient.email}
                </Text>
              </VStack>
            </div>
            <Badge
              label={statusLabel}
              variant={statusVariant}
              icon={<Icon icon={statusIcon} size="xsm" color="inherit" />}
            />
          </div>
          {progress > 0 && (
            <div style={styles.timeline}>
              <VStack gap={1}>
                {labels.slice(0, progress).map((label, stage) => (
                  <HStack key={label} gap={2} vAlign="center">
                    <Text type="supporting">{label}</Text>
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      {eventTime(3 * index + stage)}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </div>
          )}
        </VStack>
      </div>
    );
  });

  const trackerSurface = (
    <div style={styles.column}>
      <VStack gap={4}>
        <Banner
          status={isRoutingComplete ? 'success' : 'info'}
          icon={
            <Icon
              icon={isRoutingComplete ? CheckIcon : SendIcon}
              size="sm"
              color="inherit"
            />
          }
          title={
            isRoutingComplete
              ? 'Envelope completed — all parties have finished'
              : \`Envelope sent to \${routingRecipients.length} recipient\${
                  routingRecipients.length === 1 ? '' : 's'
                } in sequence\`
          }
          description={
            isRoutingComplete
              ? ccRecipients.length > 0
                ? \`The signed copy was delivered to \${ccRecipients
                    .map(r => r.name)
                    .join(', ')} at \${eventTime(totalStages)}.\`
                : 'The signed copy is archived in the envelope record.'
              : \`Subject: "\${emailSubject}". Each recipient is emailed when the previous one completes.\`
          }
        />
        <Card padding={5} width="100%">
          <VStack gap={3}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Heading level={2}>Recipient status</Heading>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {trackerCounter}
              </Text>
            </HStack>
            {trackerRows}
            {ccRecipients.length > 0 && (
              <>
                <Divider />
                {ccRecipients.map(recipient => (
                  <div key={recipient.id} style={styles.recipientRow}>
                    <div style={styles.seqCircleCc}>CC</div>
                    <div style={styles.recipientIdentity}>
                      <Avatar name={recipient.name} size="small" />
                      <VStack gap={0}>
                        <Text type="body" maxLines={1}>
                          {recipient.name}
                        </Text>
                        <Text type="supporting" color="secondary" maxLines={1}>
                          Receives the completed copy · {recipient.email}
                        </Text>
                      </VStack>
                    </div>
                    <Badge
                      label={isRoutingComplete ? 'Copy delivered' : 'Waiting'}
                      variant={isRoutingComplete ? 'success' : 'neutral'}
                      icon={
                        <Icon
                          icon={isRoutingComplete ? MailIcon : ClockIcon}
                          size="xsm"
                          color="inherit"
                        />
                      }
                    />
                  </div>
                ))}
              </>
            )}
          </VStack>
        </Card>
        <HStack gap={2} vAlign="center">
          {isVoidConfirmOpen ? (
            <>
              <Text type="supporting" color="secondary">
                Void this envelope and return to editing?
              </Text>
              <Button
                label="Confirm void"
                variant="secondary"
                size="sm"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                onClick={voidEnvelope}
              />
              <Button
                label="Keep routing"
                variant="ghost"
                size="sm"
                onClick={() => setIsVoidConfirmOpen(false)}
              />
            </>
          ) : (
            <Button
              label="Void envelope"
              variant="ghost"
              size="sm"
              icon={<Icon icon={XIcon} size="sm" color="inherit" />}
              isDisabled={isRoutingComplete}
              tooltip={
                isRoutingComplete
                  ? 'Completed envelopes cannot be voided'
                  : 'Stop routing and return to the editor'
              }
              onClick={() => setIsVoidConfirmOpen(true)}
            />
          )}
          <StackItem size="fill">
            <span />
          </StackItem>
          <Button
            label={isRoutingComplete ? 'Routing complete' : 'Simulate next event'}
            variant="primary"
            icon={
              <Icon
                icon={isRoutingComplete ? CheckIcon : PenLineIcon}
                size="sm"
                color="inherit"
              />
            }
            isDisabled={isRoutingComplete}
            onClick={() => setAdvanceCount(prev => prev + 1)}
          />
        </HStack>
      </VStack>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={header}
      content={
        <LayoutContent padding={0}>
          {isSent ? trackerSurface : builderSurface}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};