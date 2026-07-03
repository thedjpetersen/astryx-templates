var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file trip-expense-splitter.tsx
 * @input Deterministic fixtures only (4 travelers on a fixed Lisbon
 *   Jun 11–15 trip, 12 shared expenses in integer cents with payer,
 *   category, trip-day date, and a split definition — equal, percentage,
 *   or exact amounts — two expenses carrying currency-conversion notes).
 *   No clocks, randomness, or network assets.
 * @output Group Trip Expense Splitter — a shared-costs console. The left
 *   rail lists every expense (category chip, payer, split summary, FX
 *   note glyph, delete-with-undo) filterable by payer; the center is the
 *   balance board: per-person Cards (paid vs share vs net Badge), a
 *   who-owes-whom SVG arrow diagram restated as text rows, and a settle-up
 *   checklist generated from the minimal repayment set — marking items
 *   paid drains the arrows until everyone is square. The right sheet adds
 *   or edits an expense with a payer Selector and an
 *   equal/percentage/exact SegmentedControl whose per-person inputs
 *   validate live (percents must total 100, exact amounts must total the
 *   bill) and recompute every share, net, and arrow on save.
 * @position Page template; emitted by \`astryx template trip-expense-splitter\`.
 *
 * Frame: header | expenses rail 300 (start) | balance board (fill) |
 * expense sheet 360 (end). The header carries the trip mark, title, trip
 * meta line, live trip-total readout, and the New-expense action. The
 * board column scrolls; both rails scroll independently.
 *
 * Container policy: tool archetype — the expense rail and the editor
 * sheet are docked LayoutPanels (durable chrome, not Cards); the board
 * uses Cards for the four person tiles and the two board widgets (arrows,
 * settle-up) because they are dashboard-style summaries. Expense rows are
 * full-width unstyled buttons (click/tap/Enter select into the sheet)
 * with a real delete IconButton — never hover-only.
 *
 * All money math is derived state in integer cents: shares per expense
 * come from its split definition (equal splits distribute remainder cents
 * to the earliest travelers; percentage splits round then pin the drift
 * on the largest share, so every expense's shares sum exactly to the
 * bill); nets = paid − share ± marked-paid repayments; arrows are the
 * greedy minimal transfer set over current nets, so they always agree
 * with the checklist. Editing expenses after a plan exists flags the
 * checklist stale with a one-click regenerate that preserves paid rows.
 *
 * Responsive contract:
 * - > 1080px: three docked regions as above; board column max-width 760,
 *   centered.
 * - <= 1080px: the end sheet undocks — the editor opens as a single-pane
 *   takeover of the content region (back arrow returns to the board);
 *   New-expense and row selection both route there.
 * - <= 860px: the start rail undocks — the expense list joins the board
 *   column as a Card below the settle-up widget, same rows and filter.
 * - <= 640px: header rows wrap (trip meta drops); person Cards reflow via
 *   Grid minWidth to 2-up/1-up; the arrow SVG scales to full width via
 *   viewBox (no horizontal overflow at 375px); expense rows keep >=44px
 *   tap targets; Selectors and primary Buttons stretch/grow to ~40px;
 *   checklist rows stack their controls. The diagram is presentational
 *   (role="img" + aria-label) and every debt it encodes is restated as
 *   text rows below it, so nothing is pointer- or hover-only.
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {NumberInput} from '@astryxdesign/core/NumberInput';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useToast} from '@astryxdesign/core/Toast';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CarIcon,
  CheckCircle2Icon,
  HandCoinsIcon,
  HomeIcon,
  InfoIcon,
  PlusIcon,
  RefreshCwIcon,
  TicketIcon,
  Trash2Icon,
  TriangleAlertIcon,
  Undo2Icon,
  UtensilsIcon,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Centered board column inside the scrolling content region.
  board: {maxWidth: 760, marginInline: 'auto', width: '100%'},
  numeric: {fontVariantNumeric: 'tabular-nums'},
  // Header trip mark — gradient placeholder, white glyph, no image asset.
  brandChip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control, 8px)',
    background: 'linear-gradient(135deg, #0171E3, #0D9488)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Expense rows are unstyled full-width buttons so click/tap/Enter all
  // open the row in the editor sheet — never hover-only.
  rowButton: {
    display: 'block',
    width: '100%',
    minHeight: 44,
    paddingBlock: 8,
    paddingInline: 8,
    border: 'none',
    background: 'transparent',
    textAlign: 'start',
    font: 'inherit',
    color: 'inherit',
    cursor: 'pointer',
    borderRadius: 'var(--radius-control, 8px)',
  },
  rowButtonSelected: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Category icon chip: deterministic gradient tile, white glyph.
  chip: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-control, 8px)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  fxGlyph: {
    display: 'flex',
    color: 'var(--color-text-secondary, #667085)',
    flexShrink: 0,
  },
  // The arrow diagram scales with its container through the viewBox; block
  // display kills the inline-SVG baseline gap.
  diagram: {width: '100%', height: 'auto', display: 'block'},
  positiveText: {color: 'var(--color-success, #0B991F)'},
  negativeText: {color: 'var(--color-critical, #D92D20)'},
  staleIcon: {
    display: 'flex',
    color: 'var(--color-data-categorical-orange, #EB6E00)',
    flexShrink: 0,
  },
  settledIcon: {
    display: 'flex',
    color: 'var(--color-success, #0B991F)',
    flexShrink: 0,
  },
  paidRow: {opacity: 0.55, textDecoration: 'line-through'},
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

interface Traveler {
  id: string;
  name: string;
  /** First name for compact copy ("Josh owes Maya"). */
  short: string;
  /** Arrow stroke + node fill. */
  color: string;
}

const TRAVELERS: Traveler[] = [
  {id: 'maya', name: 'Maya Chen', short: 'Maya', color: '#0171E3'},
  {id: 'josh', name: 'Josh Rivera', short: 'Josh', color: '#EB6E00'},
  {id: 'priya', name: 'Priya Nair', short: 'Priya', color: '#6B1EFD'},
  {id: 'devon', name: 'Devon Park', short: 'Devon', color: '#0B991F'},
];

const TRAVELER_BY_ID = new Map(TRAVELERS.map(t => [t.id, t]));

function traveler(id: string): Traveler {
  const found = TRAVELER_BY_ID.get(id);
  if (found == null) {
    throw new Error(\`Unknown traveler "\${id}"\`);
  }
  return found;
}

type Category = 'lodging' | 'food' | 'transport' | 'activities';

const CATEGORY_META: Record<
  Category,
  {label: string; icon: LucideIcon; gradient: string}
> = {
  lodging: {
    label: 'Lodging',
    icon: HomeIcon,
    gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
  },
  food: {
    label: 'Food & drink',
    icon: UtensilsIcon,
    gradient: 'linear-gradient(135deg, #C2410C, #FB923C)',
  },
  transport: {
    label: 'Transport',
    icon: CarIcon,
    gradient: 'linear-gradient(135deg, #1D4ED8, #60A5FA)',
  },
  activities: {
    label: 'Activities',
    icon: TicketIcon,
    gradient: 'linear-gradient(135deg, #0F766E, #2DD4BF)',
  },
};

const CATEGORY_OPTIONS = (
  Object.keys(CATEGORY_META) as Category[]
).map(category => ({value: category, label: CATEGORY_META[category].label}));

// Fixed trip days — date is a pick, not a date-picker, so it stays
// deterministic.
const TRIP_DAYS = [
  'Thu Jun 11',
  'Fri Jun 12',
  'Sat Jun 13',
  'Sun Jun 14',
  'Mon Jun 15',
];

const DAY_OPTIONS = TRIP_DAYS.map(day => ({value: day, label: day}));

type SplitMode = 'equal' | 'percent' | 'exact';

type Split =
  | {mode: 'equal'; participantIds: string[]}
  | {mode: 'percent'; percents: Record<string, number>}
  | {mode: 'exact'; cents: Record<string, number>};

interface Expense {
  id: string;
  description: string;
  category: Category;
  date: string;
  /** Integer cents, always positive. */
  amountCents: number;
  payerId: string;
  split: Split;
  /** Currency-conversion note for bills paid in EUR. */
  fxNote?: string;
}

// Deterministic fixtures: 12 shared expenses, integer cents. The Ramiro
// dinner and the rental car match the archetype brief (equal 4-way vs
// uneven exact split); two rows carry FX conversion notes.
const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e-01',
    description: 'Airbnb — Alfama loft, 4 nights',
    category: 'lodging',
    date: 'Thu Jun 11',
    amountCents: 61200,
    payerId: 'josh',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
  {
    id: 'e-02',
    description: 'Rental car — 4 days',
    category: 'transport',
    date: 'Thu Jun 11',
    amountCents: 24800,
    payerId: 'josh',
    // Uneven exact split: Josh keeps the car two extra days.
    split: {
      mode: 'exact',
      cents: {maya: 5000, josh: 9800, priya: 5000, devon: 5000},
    },
  },
  {
    id: 'e-03',
    description: 'Group dinner — Cervejaria Ramiro',
    category: 'food',
    date: 'Thu Jun 11',
    amountCents: 18400,
    payerId: 'maya',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
  {
    id: 'e-04',
    description: 'Tram & metro day passes',
    category: 'transport',
    date: 'Fri Jun 12',
    amountCents: 3800,
    payerId: 'priya',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
  {
    id: 'e-05',
    description: 'Sintra — Pena Palace tickets',
    category: 'activities',
    date: 'Fri Jun 12',
    amountCents: 8720,
    payerId: 'devon',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
    fxNote: 'Converted from €80.00 at 1.09 USD/EUR',
  },
  {
    id: 'e-06',
    description: 'Groceries & breakfast run',
    category: 'food',
    date: 'Fri Jun 12',
    amountCents: 6450,
    payerId: 'maya',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
  {
    id: 'e-07',
    description: 'Fado night — three tickets',
    category: 'activities',
    date: 'Sat Jun 13',
    amountCents: 15000,
    payerId: 'priya',
    // Devon skipped; Maya took the front-row seat.
    split: {mode: 'percent', percents: {maya: 40, josh: 30, priya: 30, devon: 0}},
  },
  {
    id: 'e-08',
    description: 'Wine tasting — Douro day trip',
    category: 'activities',
    date: 'Sat Jun 13',
    amountCents: 32700,
    payerId: 'devon',
    split: {mode: 'equal', participantIds: ['maya', 'priya', 'devon']},
  },
  {
    id: 'e-09',
    description: 'Fuel + A5 tolls',
    category: 'transport',
    date: 'Sun Jun 14',
    amountCents: 5640,
    payerId: 'josh',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
  {
    id: 'e-10',
    description: 'Pastéis de Belém run',
    category: 'food',
    date: 'Sun Jun 14',
    amountCents: 2180,
    payerId: 'devon',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
    fxNote: 'Converted from €20.00 at 1.09 USD/EUR',
  },
  {
    id: 'e-11',
    description: 'Surf rentals — Costa da Caparica',
    category: 'activities',
    date: 'Sun Jun 14',
    amountCents: 9600,
    payerId: 'maya',
    // Maya kept her board for the second session.
    split: {
      mode: 'exact',
      cents: {maya: 3600, josh: 2000, priya: 2000, devon: 2000},
    },
  },
  {
    id: 'e-12',
    description: 'Last-night dinner — Time Out Market',
    category: 'food',
    date: 'Mon Jun 15',
    amountCents: 14260,
    payerId: 'priya',
    split: {mode: 'equal', participantIds: ['maya', 'josh', 'priya', 'devon']},
  },
];

const PAYER_OPTIONS = TRAVELERS.map(t => ({value: t.id, label: t.name}));

const PAYER_FILTER_OPTIONS = [
  {value: 'all', label: 'All payers'},
  ...PAYER_OPTIONS,
];

// ---------------------------------------------------------------------------
// MONEY MATH (all integer cents; derived, never stored)
// ---------------------------------------------------------------------------

/** $1,234.56 — explicit locale so output never depends on the runtime. */
function formatCents(cents: number): string {
  const dollars = (Math.abs(cents) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return \`\${cents < 0 ? '-' : ''}$\${dollars}\`;
}

/** "93%" / "32.5%" — trims trailing zeros for the validation copy. */
function formatPct(pct: number): string {
  const rounded = Math.round(pct * 100) / 100;
  return \`\${rounded}%\`;
}

/**
 * Per-traveler shares for one split, in traveler order. Sums are exact by
 * construction: equal splits hand remainder cents to the earliest
 * participants; percentage splits round each share then pin the rounding
 * drift on the largest one.
 */
function computeShares(
  amountCents: number,
  split: Split,
): Array<{travelerId: string; cents: number}> {
  if (split.mode === 'equal') {
    const ids = TRAVELERS.filter(t =>
      split.participantIds.includes(t.id),
    ).map(t => t.id);
    if (ids.length === 0) {
      return [];
    }
    const base = Math.floor(amountCents / ids.length);
    const remainder = amountCents - base * ids.length;
    return ids.map((travelerId, index) => ({
      travelerId,
      cents: base + (index < remainder ? 1 : 0),
    }));
  }
  if (split.mode === 'percent') {
    const entries = TRAVELERS.filter(
      t => (split.percents[t.id] ?? 0) > 0,
    ).map(t => ({
      travelerId: t.id,
      cents: Math.round((amountCents * (split.percents[t.id] ?? 0)) / 100),
    }));
    const drift =
      amountCents - entries.reduce((sum, entry) => sum + entry.cents, 0);
    if (drift !== 0 && entries.length > 0) {
      const largest = entries.reduce((best, entry) =>
        entry.cents > best.cents ? entry : best,
      );
      largest.cents += drift;
    }
    return entries;
  }
  return TRAVELERS.filter(t => (split.cents[t.id] ?? 0) > 0).map(t => ({
    travelerId: t.id,
    cents: split.cents[t.id] ?? 0,
  }));
}

/** One-line split summary for the rail rows. */
function splitSummary(expense: Expense): string {
  if (expense.split.mode === 'equal') {
    return \`\${expense.split.participantIds.length}-way equal\`;
  }
  return expense.split.mode === 'percent' ? 'By percent' : 'Exact amounts';
}

interface RepaymentItem {
  id: string;
  fromId: string;
  toId: string;
  amountCents: number;
  isPaid: boolean;
}

/**
 * Greedy minimal repayment set: largest creditor collects from the
 * largest debtor until both sides zero out. Nets always sum to zero
 * (shares are exact), so the loop terminates with every balance cleared.
 * Ties break on traveler order, keeping output deterministic.
 */
function computeMinimalTransfers(
  nets: Record<string, number>,
): Array<{fromId: string; toId: string; amountCents: number}> {
  const creditors = TRAVELERS.filter(t => (nets[t.id] ?? 0) > 0).map(t => ({
    id: t.id,
    remaining: nets[t.id] ?? 0,
  }));
  const debtors = TRAVELERS.filter(t => (nets[t.id] ?? 0) < 0).map(t => ({
    id: t.id,
    remaining: -(nets[t.id] ?? 0),
  }));
  creditors.sort((a, b) => b.remaining - a.remaining);
  debtors.sort((a, b) => b.remaining - a.remaining);
  const out: Array<{fromId: string; toId: string; amountCents: number}> = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const pay = Math.min(creditors[ci].remaining, debtors[di].remaining);
    if (pay > 0) {
      out.push({fromId: debtors[di].id, toId: creditors[ci].id, amountCents: pay});
    }
    creditors[ci].remaining -= pay;
    debtors[di].remaining -= pay;
    if (creditors[ci].remaining === 0) {
      ci += 1;
    }
    if (debtors[di].remaining === 0) {
      di += 1;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// EDITOR DRAFT
// ---------------------------------------------------------------------------

interface Draft {
  /** null while composing a brand-new expense. */
  id: string | null;
  description: string;
  category: Category;
  date: string;
  /** Dollars, straight from the NumberInput. */
  amount: number;
  payerId: string;
  mode: SplitMode;
  included: Record<string, boolean>;
  percents: Record<string, number>;
  /** Dollars per traveler for exact mode. */
  exacts: Record<string, number>;
  fxNote?: string;
}

function blankDraft(): Draft {
  return {
    id: null,
    description: '',
    category: 'food',
    date: TRIP_DAYS[TRIP_DAYS.length - 1],
    amount: 0,
    payerId: TRAVELERS[0].id,
    mode: 'equal',
    included: Object.fromEntries(TRAVELERS.map(t => [t.id, true])),
    percents: Object.fromEntries(TRAVELERS.map(t => [t.id, 25])),
    exacts: Object.fromEntries(TRAVELERS.map(t => [t.id, 0])),
  };
}

function draftFromExpense(expense: Expense): Draft {
  const draft = blankDraft();
  draft.id = expense.id;
  draft.description = expense.description;
  draft.category = expense.category;
  draft.date = expense.date;
  draft.amount = expense.amountCents / 100;
  draft.payerId = expense.payerId;
  draft.mode = expense.split.mode;
  draft.fxNote = expense.fxNote;
  if (expense.split.mode === 'equal') {
    const ids = expense.split.participantIds;
    draft.included = Object.fromEntries(
      TRAVELERS.map(t => [t.id, ids.includes(t.id)]),
    );
  } else if (expense.split.mode === 'percent') {
    const percents = expense.split.percents;
    draft.percents = Object.fromEntries(
      TRAVELERS.map(t => [t.id, percents[t.id] ?? 0]),
    );
  } else {
    const cents = expense.split.cents;
    draft.exacts = Object.fromEntries(
      TRAVELERS.map(t => [t.id, (cents[t.id] ?? 0) / 100]),
    );
  }
  return draft;
}

interface DraftCheck {
  amountCents: number;
  /** First blocking problem, or null when the draft can be saved. */
  error: string | null;
  /** Live share preview; empty while the split is invalid. */
  shares: Array<{travelerId: string; cents: number}>;
}

/** Live validation + share preview, recomputed on every keystroke. */
function checkDraft(draft: Draft): DraftCheck {
  const amountCents = Math.round(draft.amount * 100);
  if (draft.description.trim().length === 0) {
    return {amountCents, error: 'Add a short description.', shares: []};
  }
  if (!(amountCents > 0)) {
    return {
      amountCents,
      error: 'Enter an amount greater than zero.',
      shares: [],
    };
  }
  if (draft.mode === 'equal') {
    const ids = TRAVELERS.filter(t => draft.included[t.id]).map(t => t.id);
    if (ids.length === 0) {
      return {
        amountCents,
        error: 'Pick at least one person to split with.',
        shares: [],
      };
    }
    return {
      amountCents,
      error: null,
      shares: computeShares(amountCents, {mode: 'equal', participantIds: ids}),
    };
  }
  if (draft.mode === 'percent') {
    const total = TRAVELERS.reduce(
      (sum, t) => sum + (draft.percents[t.id] ?? 0),
      0,
    );
    if (Math.abs(total - 100) > 0.001) {
      return {
        amountCents,
        error: \`Percentages add to \${formatPct(total)} — they must total 100%.\`,
        shares: [],
      };
    }
    return {
      amountCents,
      error: null,
      shares: computeShares(amountCents, {
        mode: 'percent',
        percents: draft.percents,
      }),
    };
  }
  const totalCents = TRAVELERS.reduce(
    (sum, t) => sum + Math.round((draft.exacts[t.id] ?? 0) * 100),
    0,
  );
  if (totalCents !== amountCents) {
    const delta = amountCents - totalCents;
    return {
      amountCents,
      error: \`Exact amounts total \${formatCents(totalCents)} of \${formatCents(
        amountCents,
      )} — \${
        delta > 0
          ? \`\${formatCents(delta)} left to assign\`
          : \`\${formatCents(-delta)} over\`
      }.\`,
      shares: [],
    };
  }
  return {
    amountCents,
    error: null,
    shares: computeShares(amountCents, {
      mode: 'exact',
      cents: Object.fromEntries(
        TRAVELERS.map(t => [t.id, Math.round((draft.exacts[t.id] ?? 0) * 100)]),
      ),
    }),
  };
}

/** Draft -> Expense, only called once checkDraft reports no error. */
function expenseFromDraft(draft: Draft, id: string): Expense {
  const amountCents = Math.round(draft.amount * 100);
  let split: Split;
  if (draft.mode === 'equal') {
    split = {
      mode: 'equal',
      participantIds: TRAVELERS.filter(t => draft.included[t.id]).map(
        t => t.id,
      ),
    };
  } else if (draft.mode === 'percent') {
    split = {mode: 'percent', percents: {...draft.percents}};
  } else {
    split = {
      mode: 'exact',
      cents: Object.fromEntries(
        TRAVELERS.map(t => [t.id, Math.round((draft.exacts[t.id] ?? 0) * 100)]),
      ),
    };
  }
  return {
    id,
    description: draft.description.trim(),
    category: draft.category,
    date: draft.date,
    amountCents,
    payerId: draft.payerId,
    split,
    fxNote: draft.fxNote,
  };
}

// ---------------------------------------------------------------------------
// BALANCE ARROW DIAGRAM (plain SVG, scales via viewBox)
// ---------------------------------------------------------------------------

// Fixed node centers for the four travelers in a 480x300 canvas.
const NODE_POS: Record<string, {x: number; y: number}> = {
  maya: {x: 110, y: 82},
  josh: {x: 370, y: 82},
  priya: {x: 110, y: 218},
  devon: {x: 370, y: 218},
};

const NODE_R = 30;

function BalanceDiagram({
  transfers,
}: {
  transfers: Array<{fromId: string; toId: string; amountCents: number}>;
}) {
  const summary =
    transfers.length === 0
      ? 'Balance diagram: everyone is settled — no arrows.'
      : \`Balance diagram: \${transfers
          .map(
            t =>
              \`\${traveler(t.fromId).short} owes \${traveler(t.toId).short} \${formatCents(
                t.amountCents,
              )}\`,
          )
          .join('; ')}.\`;

  return (
    <svg
      viewBox="0 0 480 300"
      style={styles.diagram}
      role="img"
      aria-label={summary}>
      <defs>
        {TRAVELERS.map(t => (
          <marker
            key={t.id}
            id={\`tes-arrow-\${t.id}\`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={t.color} />
          </marker>
        ))}
      </defs>
      {/* Debt arrows first so nodes paint on top of the line ends. */}
      {transfers.map(t => {
        const from = NODE_POS[t.fromId];
        const to = NODE_POS[t.toId];
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        // Trim to the node rims, then bow the line perpendicular so
        // opposite-direction pairs never overlap.
        const sx = from.x + ux * (NODE_R + 8);
        const sy = from.y + uy * (NODE_R + 8);
        const ex = to.x - ux * (NODE_R + 12);
        const ey = to.y - uy * (NODE_R + 12);
        const cx = (sx + ex) / 2 - uy * 26;
        const cy = (sy + ey) / 2 + ux * 26;
        // Quadratic midpoint (t = 0.5) for the amount label.
        const lx = 0.25 * sx + 0.5 * cx + 0.25 * ex;
        const ly = 0.25 * sy + 0.5 * cy + 0.25 * ey;
        const color = traveler(t.fromId).color;
        return (
          <g key={\`\${t.fromId}-\${t.toId}\`}>
            <path
              d={\`M \${sx} \${sy} Q \${cx} \${cy} \${ex} \${ey}\`}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              markerEnd={\`url(#tes-arrow-\${t.fromId})\`}
            />
            <text
              x={lx}
              y={ly - 6}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill={color}
              stroke="var(--color-background, #fff)"
              strokeWidth={4}
              paintOrder="stroke"
              style={{fontVariantNumeric: 'tabular-nums'}}>
              {formatCents(t.amountCents)}
            </text>
          </g>
        );
      })}
      {TRAVELERS.map(t => {
        const pos = NODE_POS[t.id];
        const initials = t.name
          .split(' ')
          .map(word => word[0])
          .join('');
        return (
          <g key={t.id}>
            <circle cx={pos.x} cy={pos.y} r={NODE_R} fill={t.color} />
            <text
              x={pos.x}
              y={pos.y + 5}
              textAnchor="middle"
              fontSize={14}
              fontWeight={600}
              fill="#fff">
              {initials}
            </text>
            <text
              x={pos.x}
              y={pos.y + NODE_R + 18}
              textAnchor="middle"
              fontSize={12}
              fill="var(--color-text-secondary, #667085)">
              {t.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// EXPENSE RAIL
// ---------------------------------------------------------------------------

function ExpenseRow({
  expense,
  isSelected,
  onSelect,
  onDelete,
}: {
  expense: Expense;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const meta = CATEGORY_META[expense.category];
  return (
    <HStack gap={1} vAlign="center">
      <StackItem size="fill">
        <button
          type="button"
          style={
            isSelected
              ? {...styles.rowButton, ...styles.rowButtonSelected}
              : styles.rowButton
          }
          aria-pressed={isSelected}
          onClick={() => onSelect(expense.id)}>
          <HStack gap={2} vAlign="center">
            <div style={{...styles.chip, background: meta.gradient}}>
              <Icon icon={meta.icon} size="sm" color="inherit" />
            </div>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {expense.description}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {expense.date} · {traveler(expense.payerId).short} paid ·{' '}
                  {splitSummary(expense)}
                </Text>
              </VStack>
            </StackItem>
            {expense.fxNote != null && (
              <span
                style={styles.fxGlyph}
                role="img"
                aria-label={expense.fxNote}>
                <Icon icon={InfoIcon} size="sm" color="inherit" />
              </span>
            )}
            <Text type="label" style={styles.numeric}>
              {formatCents(expense.amountCents)}
            </Text>
          </HStack>
        </button>
      </StackItem>
      <IconButton
        label={\`Delete \${expense.description}\`}
        tooltip="Delete expense"
        size="sm"
        variant="ghost"
        icon={<Icon icon={Trash2Icon} size="sm" />}
        onClick={() => onDelete(expense.id)}
      />
    </HStack>
  );
}

function ExpenseList({
  expenses,
  selectedId,
  payerFilter,
  isPhone,
  onPayerFilter,
  onSelect,
  onDelete,
}: {
  expenses: Expense[];
  selectedId: string | null;
  payerFilter: string;
  isPhone: boolean;
  onPayerFilter: (value: string) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const visible =
    payerFilter === 'all'
      ? expenses
      : expenses.filter(expense => expense.payerId === payerFilter);
  const visibleTotal = visible.reduce(
    (sum, expense) => sum + expense.amountCents,
    0,
  );

  return (
    <VStack gap={2}>
      <Selector
        label="Filter by payer"
        isLabelHidden
        size={isPhone ? 'md' : 'sm'}
        options={PAYER_FILTER_OPTIONS}
        value={payerFilter}
        onChange={onPayerFilter}
        width="100%"
      />
      <VStack gap={0}>
        {visible.map((expense, index) => (
          <VStack key={expense.id} gap={0}>
            <ExpenseRow
              expense={expense}
              isSelected={expense.id === selectedId}
              onSelect={onSelect}
              onDelete={onDelete}
            />
            {index < visible.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
      {visible.length === 0 ? (
        <Text type="supporting" color="secondary">
          No expenses paid by {traveler(payerFilter).short} yet.
        </Text>
      ) : (
        <Text type="supporting" color="secondary" style={styles.numeric}>
          {visible.length} expense{visible.length === 1 ? '' : 's'} ·{' '}
          {formatCents(visibleTotal)}
          {payerFilter !== 'all'
            ? \` paid by \${traveler(payerFilter).short}\`
            : ' total'}
        </Text>
      )}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// EDITOR SHEET
// ---------------------------------------------------------------------------

function EditorSheet({
  draft,
  check,
  isPhone,
  showBack,
  onPatch,
  onSave,
  onDelete,
  onBack,
}: {
  draft: Draft;
  check: DraftCheck;
  isPhone: boolean;
  showBack: boolean;
  onPatch: (patch: Partial<Draft>) => void;
  onSave: () => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}) {
  const isEditing = draft.id !== null;
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;
  const shareFor = (travelerId: string) =>
    check.shares.find(share => share.travelerId === travelerId);

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        {showBack && (
          <IconButton
            label="Back to balances"
            tooltip="Back to balances"
            size="sm"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onBack}
          />
        )}
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>
              {isEditing ? 'Edit expense' : 'Add expense'}
            </Heading>
            <Text type="supporting" color="secondary">
              {isEditing
                ? 'Changes recompute every share and arrow on save.'
                : 'New expenses recompute balances the moment you save.'}
            </Text>
          </VStack>
        </StackItem>
      </HStack>

      <TextInput
        label="Description"
        placeholder="Dinner, tickets, taxi..."
        value={draft.description}
        onChange={description => onPatch({description})}
        width="100%"
      />

      <HStack gap={2} wrap="wrap">
        <StackItem size="fill">
          <NumberInput
            label="Amount (USD)"
            value={draft.amount}
            onChange={amount => onPatch({amount: amount ?? 0})}
            min={0}
            step={0.01}
            width="100%"
          />
        </StackItem>
        <StackItem size="fill">
          <Selector
            label="Day"
            options={DAY_OPTIONS}
            value={draft.date}
            onChange={date => onPatch({date})}
            width="100%"
          />
        </StackItem>
      </HStack>

      <HStack gap={2} wrap="wrap">
        <StackItem size="fill">
          <Selector
            label="Category"
            options={CATEGORY_OPTIONS}
            value={draft.category}
            onChange={category => onPatch({category: category as Category})}
            width="100%"
          />
        </StackItem>
        <StackItem size="fill">
          <Selector
            label="Paid by"
            options={PAYER_OPTIONS}
            value={draft.payerId}
            onChange={payerId => onPatch({payerId})}
            width="100%"
          />
        </StackItem>
      </HStack>

      {draft.fxNote != null && (
        <HStack gap={2} vAlign="center">
          <span style={styles.fxGlyph}>
            <Icon icon={InfoIcon} size="sm" color="inherit" />
          </span>
          <Text type="supporting" color="secondary">
            {draft.fxNote}
          </Text>
        </HStack>
      )}

      <Divider />

      <VStack gap={3}>
        <SegmentedControl
          value={draft.mode}
          onChange={mode => onPatch({mode: mode as SplitMode})}
          label="Split mode"
          size={isPhone ? 'lg' : 'md'}>
          <SegmentedControlItem value="equal" label="Equal" />
          <SegmentedControlItem value="percent" label="Percent" />
          <SegmentedControlItem value="exact" label="Exact" />
        </SegmentedControl>

        {draft.mode === 'equal' && (
          <VStack gap={2}>
            {TRAVELERS.map(t => {
              const share = shareFor(t.id);
              return (
                <HStack key={t.id} gap={2} vAlign="center">
                  <StackItem size="fill">
                    <CheckboxInput
                      label={t.name}
                      value={draft.included[t.id] ?? false}
                      onChange={checked =>
                        onPatch({
                          included: {...draft.included, [t.id]: checked},
                        })
                      }
                    />
                  </StackItem>
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.numeric}>
                    {share != null ? formatCents(share.cents) : '—'}
                  </Text>
                </HStack>
              );
            })}
          </VStack>
        )}

        {draft.mode === 'percent' && (
          <VStack gap={2}>
            {TRAVELERS.map(t => {
              const share = shareFor(t.id);
              return (
                <HStack key={t.id} gap={2} vAlign="center">
                  <Avatar name={t.name} size="small" />
                  <StackItem size="fill">
                    <Text type="body" maxLines={1}>
                      {t.short}
                    </Text>
                  </StackItem>
                  <Text
                    type="supporting"
                    color="secondary"
                    style={styles.numeric}>
                    {share != null ? formatCents(share.cents) : '—'}
                  </Text>
                  <NumberInput
                    label={\`\${t.short} percent\`}
                    isLabelHidden
                    value={draft.percents[t.id] ?? 0}
                    onChange={value =>
                      onPatch({
                        percents: {...draft.percents, [t.id]: value ?? 0},
                      })
                    }
                    min={0}
                    max={100}
                    step={5}
                    width={96}
                  />
                </HStack>
              );
            })}
          </VStack>
        )}

        {draft.mode === 'exact' && (
          <VStack gap={2}>
            {TRAVELERS.map(t => (
              <HStack key={t.id} gap={2} vAlign="center">
                <Avatar name={t.name} size="small" />
                <StackItem size="fill">
                  <Text type="body" maxLines={1}>
                    {t.short}
                  </Text>
                </StackItem>
                <NumberInput
                  label={\`\${t.short} exact amount (USD)\`}
                  isLabelHidden
                  value={draft.exacts[t.id] ?? 0}
                  onChange={value =>
                    onPatch({exacts: {...draft.exacts, [t.id]: value ?? 0}})
                  }
                  min={0}
                  step={0.01}
                  width={110}
                />
              </HStack>
            ))}
          </VStack>
        )}

        {/* Live validation line: green once the split resolves, red with the
            exact discrepancy while it does not. */}
        {check.error != null ? (
          <HStack gap={2} vAlign="center">
            <span style={styles.staleIcon}>
              <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" style={styles.negativeText}>
              {check.error}
            </Text>
          </HStack>
        ) : (
          <HStack gap={2} vAlign="center">
            <span style={styles.settledIcon}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <Text type="supporting" color="secondary" style={styles.numeric}>
              Splits {formatCents(check.amountCents)} across{' '}
              {check.shares.length}{' '}
              {check.shares.length === 1 ? 'person' : 'people'} ·{' '}
              {traveler(draft.payerId).short} fronted it
            </Text>
          </HStack>
        )}
      </VStack>

      <Divider />

      <HStack gap={2} wrap="wrap">
        <Button
          label={isEditing ? 'Save changes' : 'Add expense'}
          icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
          isDisabled={check.error != null}
          style={tapTargetStyle}
          onClick={onSave}
        />
        {isEditing && draft.id != null && (
          <Button
            label="Delete"
            variant="secondary"
            icon={<Icon icon={Trash2Icon} size="sm" />}
            style={tapTargetStyle}
            onClick={() => onDelete(draft.id as string)}
          />
        )}
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TripExpenseSplitterTemplate() {
  const toast = useToast();

  // The register itself is state: the sheet edits it, deletes remove from
  // it (with undo), and every balance below derives from it.
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [nextId, setNextId] = useState(13);
  const [payerFilter, setPayerFilter] = useState('all');
  const [draft, setDraft] = useState<Draft>(blankDraft);
  // Narrow viewports open the sheet as a single-pane takeover.
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  // Settle-up checklist. Paid rows keep adjusting balances even after a
  // regenerate; dataVersion vs planVersion flags the checklist stale when
  // expenses change underneath it.
  const [plan, setPlan] = useState<RepaymentItem[] | null>(null);
  const [planVersion, setPlanVersion] = useState(0);
  const [dataVersion, setDataVersion] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  // Responsive contract (see file header): <=1080px undocks the sheet,
  // <=860px undocks the expense rail, <=640px is the phone pass.
  const isNarrow = useMediaQuery('(max-width: 1080px)');
  const isStacked = useMediaQuery('(max-width: 860px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const tapTargetStyle = isPhone ? styles.buttonTapTarget : undefined;

  const check = useMemo(() => checkDraft(draft), [draft]);

  // ---- derived money math (all integer cents) ----

  const tripTotalCents = expenses.reduce(
    (sum, expense) => sum + expense.amountCents,
    0,
  );

  const paidTransfers = useMemo(
    () => (plan ?? []).filter(item => item.isPaid),
    [plan],
  );

  // Per-person paid / share / net. Marked-paid repayments move money from
  // debtor to creditor, so nets drain toward zero as the checklist clears.
  const balances = useMemo(() => {
    const paid: Record<string, number> = {};
    const share: Record<string, number> = {};
    const net: Record<string, number> = {};
    for (const t of TRAVELERS) {
      paid[t.id] = 0;
      share[t.id] = 0;
      net[t.id] = 0;
    }
    for (const expense of expenses) {
      paid[expense.payerId] += expense.amountCents;
      net[expense.payerId] += expense.amountCents;
      for (const entry of computeShares(expense.amountCents, expense.split)) {
        share[entry.travelerId] += entry.cents;
        net[entry.travelerId] -= entry.cents;
      }
    }
    for (const transfer of paidTransfers) {
      net[transfer.fromId] += transfer.amountCents;
      net[transfer.toId] -= transfer.amountCents;
    }
    return {paid, share, net};
  }, [expenses, paidTransfers]);

  // Arrows always derive from current nets, so they agree with the
  // checklist row by row and clear as repayments are marked paid.
  const outstanding = useMemo(
    () => computeMinimalTransfers(balances.net),
    [balances],
  );

  const unpaidCount = (plan ?? []).filter(item => !item.isPaid).length;
  const isPlanStale =
    plan !== null && unpaidCount > 0 && planVersion !== dataVersion;
  const isAllSettled = outstanding.length === 0;

  // ---- expense mutations (every one bumps dataVersion) ----

  const bumpData = () => setDataVersion(version => version + 1);

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

  const openNew = () => {
    setDraft(blankDraft());
    setIsEditorOpen(true);
  };

  const openExpense = (id: string) => {
    const expense = expenses.find(candidate => candidate.id === id);
    if (expense != null) {
      setDraft(draftFromExpense(expense));
      setIsEditorOpen(true);
    }
  };

  const patchDraft = (patch: Partial<Draft>) => {
    setDraft(prev => ({...prev, ...patch}));
  };

  const saveDraft = () => {
    if (check.error != null) {
      return;
    }
    if (draft.id === null) {
      const id = \`e-\${String(nextId).padStart(2, '0')}\`;
      const expense = expenseFromDraft(draft, id);
      setExpenses(prev => [...prev, expense]);
      setNextId(value => value + 1);
      setDraft(blankDraft());
      toast({body: \`Added "\${expense.description}" — balances updated\`});
      setAnnouncement(
        \`Added \${expense.description}, \${formatCents(expense.amountCents)}\`,
      );
    } else {
      const expense = expenseFromDraft(draft, draft.id);
      setExpenses(prev =>
        prev.map(candidate =>
          candidate.id === expense.id ? expense : candidate,
        ),
      );
      toast({body: \`Saved "\${expense.description}" — balances updated\`});
      setAnnouncement(\`Saved \${expense.description}\`);
    }
    bumpData();
    setIsEditorOpen(false);
  };

  const deleteExpense = (id: string) => {
    const index = expenses.findIndex(candidate => candidate.id === id);
    if (index === -1) {
      return;
    }
    const removed = expenses[index];
    setExpenses(prev => prev.filter(candidate => candidate.id !== id));
    if (draft.id === id) {
      setDraft(blankDraft());
      setIsEditorOpen(false);
    }
    bumpData();
    setAnnouncement(\`Deleted \${removed.description} — balances recomputed\`);
    showUndoToast(
      \`Deleted "\${removed.description}" (\${formatCents(removed.amountCents)})\`,
      () => {
        setExpenses(prev => {
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, removed);
          return next;
        });
        bumpData();
        setAnnouncement(\`Restored \${removed.description}\`);
      },
    );
  };

  // ---- settle up ----

  const generatePlan = () => {
    const fresh = computeMinimalTransfers(balances.net).map(
      (transfer, index) => ({
        id: \`t-\${dataVersion}-\${index}\`,
        ...transfer,
        isPaid: false,
      }),
    );
    // Paid rows survive a regenerate: their money already moved.
    setPlan([...(plan ?? []).filter(item => item.isPaid), ...fresh]);
    setPlanVersion(dataVersion);
    setAnnouncement(
      \`Settle-up plan: \${fresh.length} repayment\${fresh.length === 1 ? '' : 's'}\`,
    );
  };

  const setTransferPaid = (id: string, isPaid: boolean) => {
    setPlan(prev =>
      prev === null
        ? prev
        : prev.map(item => (item.id === id ? {...item, isPaid} : item)),
    );
    const item = (plan ?? []).find(candidate => candidate.id === id);
    if (item != null) {
      setAnnouncement(
        \`\${traveler(item.fromId).short} → \${traveler(item.toId).short} \${formatCents(
          item.amountCents,
        )} marked \${isPaid ? 'paid' : 'unpaid'}\`,
      );
    }
  };

  // ---- board widgets ----

  const personCards = (
    <Grid columns={{minWidth: 160, max: 4}} gap={3}>
      {TRAVELERS.map(t => {
        const net = balances.net[t.id];
        return (
          <Card key={t.id}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Avatar name={t.name} size="small" />
                <StackItem size="fill">
                  <Text type="label" maxLines={1}>
                    {t.short}
                  </Text>
                </StackItem>
              </HStack>
              <VStack gap={0}>
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  Paid {formatCents(balances.paid[t.id])}
                </Text>
                <Text type="supporting" color="secondary" style={styles.numeric}>
                  Share {formatCents(balances.share[t.id])}
                </Text>
              </VStack>
              {net > 0 ? (
                <Badge label={\`Is owed \${formatCents(net)}\`} variant="green" />
              ) : net < 0 ? (
                <Badge label={\`Owes \${formatCents(-net)}\`} variant="red" />
              ) : (
                <Badge label="Settled" variant="neutral" />
              )}
            </VStack>
          </Card>
        );
      })}
    </Grid>
  );

  const arrowsCard = (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Heading level={3}>Who owes whom</Heading>
          <Text type="supporting" color="secondary">
            Minimal transfers over current balances
          </Text>
        </HStack>
        {isAllSettled ? (
          <EmptyState
            isCompact
            icon={<Icon icon={CheckCircle2Icon} size="lg" />}
            title="Everyone is square"
            description="No arrows — every balance on this trip is settled."
          />
        ) : (
          <>
            <BalanceDiagram transfers={outstanding} />
            {/* Text restatement: the SVG is presentational only. */}
            <VStack gap={1}>
              {outstanding.map(t => (
                <HStack key={\`\${t.fromId}-\${t.toId}\`} gap={2} vAlign="center">
                  <Avatar name={traveler(t.fromId).name} size="xsmall" />
                  <Text type="supporting">{traveler(t.fromId).short}</Text>
                  <Icon icon={ArrowRightIcon} size="sm" />
                  <Avatar name={traveler(t.toId).name} size="xsmall" />
                  <StackItem size="fill">
                    <Text type="supporting">{traveler(t.toId).short}</Text>
                  </StackItem>
                  <Text type="label" style={styles.numeric}>
                    {formatCents(t.amountCents)}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </>
        )}
      </VStack>
    </Card>
  );

  const settleCard = (
    <Card>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={3}>Settle up</Heading>
          </StackItem>
          {plan !== null && (
            <Text type="supporting" color="secondary" style={styles.numeric}>
              {plan.filter(item => item.isPaid).length} of {plan.length} paid
            </Text>
          )}
        </HStack>

        {plan === null ? (
          isAllSettled ? (
            <Text type="supporting" color="secondary">
              Nothing to settle — add an expense and the repayment plan
              appears here.
            </Text>
          ) : (
            <VStack gap={2}>
              <Text type="supporting" color="secondary">
                Generate the smallest set of repayments that clears every
                arrow above.
              </Text>
              <HStack gap={2}>
                <Button
                  label={\`Settle up (\${outstanding.length} transfer\${
                    outstanding.length === 1 ? '' : 's'
                  })\`}
                  icon={<Icon icon={HandCoinsIcon} size="sm" color="inherit" />}
                  style={tapTargetStyle}
                  onClick={generatePlan}
                />
              </HStack>
            </VStack>
          )
        ) : (
          <VStack gap={3}>
            <ProgressBar
              label="Repayments completed"
              isLabelHidden
              value={plan.filter(item => item.isPaid).length}
              max={Math.max(plan.length, 1)}
            />
            {isPlanStale && (
              <HStack gap={2} vAlign="center" wrap="wrap">
                <span style={styles.staleIcon}>
                  <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
                </span>
                <StackItem size="fill">
                  <Text type="supporting" color="secondary">
                    Expenses changed since this plan was generated.
                  </Text>
                </StackItem>
                <Button
                  label="Regenerate"
                  size="sm"
                  variant="secondary"
                  icon={<Icon icon={RefreshCwIcon} size="sm" />}
                  style={tapTargetStyle}
                  onClick={generatePlan}
                />
              </HStack>
            )}
            <VStack gap={0}>
              {plan.map((item, index) => (
                <VStack key={item.id} gap={0}>
                  <HStack
                    gap={2}
                    vAlign="center"
                    wrap={isPhone ? 'wrap' : 'nowrap'}
                    style={{paddingBlock: 8}}>
                    <StackItem size="fill">
                      <HStack
                        gap={2}
                        vAlign="center"
                        style={item.isPaid ? styles.paidRow : undefined}>
                        <Avatar name={traveler(item.fromId).name} size="xsmall" />
                        <Text type="body">{traveler(item.fromId).short}</Text>
                        <Icon icon={ArrowRightIcon} size="sm" />
                        <Avatar name={traveler(item.toId).name} size="xsmall" />
                        <Text type="body">{traveler(item.toId).short}</Text>
                        <Text type="label" style={styles.numeric}>
                          {formatCents(item.amountCents)}
                        </Text>
                      </HStack>
                    </StackItem>
                    <CheckboxInput
                      label={\`Mark \${traveler(item.fromId).short} → \${
                        traveler(item.toId).short
                      } \${formatCents(item.amountCents)} paid\`}
                      isLabelHidden
                      value={item.isPaid}
                      onChange={checked => setTransferPaid(item.id, checked)}
                    />
                  </HStack>
                  {index < plan.length - 1 && <Divider />}
                </VStack>
              ))}
            </VStack>
            {isAllSettled && unpaidCount === 0 && (
              <HStack gap={2} vAlign="center">
                <span style={styles.settledIcon}>
                  <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" style={styles.positiveText}>
                  All repayments recorded — the balance board is clear.
                </Text>
              </HStack>
            )}
          </VStack>
        )}
      </VStack>
    </Card>
  );

  const expenseList = (
    <ExpenseList
      expenses={expenses}
      selectedId={draft.id}
      payerFilter={payerFilter}
      isPhone={isPhone}
      onPayerFilter={setPayerFilter}
      onSelect={openExpense}
      onDelete={deleteExpense}
    />
  );

  const editor = (
    <EditorSheet
      draft={draft}
      check={check}
      isPhone={isPhone}
      showBack={isNarrow}
      onPatch={patchDraft}
      onSave={saveDraft}
      onDelete={deleteExpense}
      onBack={() => setIsEditorOpen(false)}
    />
  );

  const board = (
    <div style={styles.board}>
      <VStack gap={5}>
        {personCards}
        {arrowsCard}
        {settleCard}
        {/* <=860px single-pane fallback: the expense rail joins the board
            column as a Card with the same rows and payer filter. */}
        {isStacked && (
          <Card>
            <VStack gap={3}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Heading level={3}>Expenses</Heading>
                </StackItem>
                <Button
                  label="New"
                  size="sm"
                  variant="secondary"
                  icon={<Icon icon={PlusIcon} size="sm" />}
                  style={tapTargetStyle}
                  onClick={openNew}
                />
              </HStack>
              {expenseList}
            </VStack>
          </Card>
        )}
      </VStack>
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <div style={styles.brandChip}>
                  <Icon icon={HandCoinsIcon} size="sm" color="inherit" />
                </div>
                <Heading level={1}>Trip Splitter</Heading>
                {!isPhone && (
                  <Text type="supporting" color="secondary">
                    Lisbon · Jun 11–15 · {TRAVELERS.length} travelers
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Text type="label" style={styles.numeric}>
              {formatCents(tripTotalCents)} total
            </Text>
            <Button
              label="New expense"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              style={tapTargetStyle}
              onClick={openNew}
            />
          </HStack>
        </LayoutHeader>
      }
      start={
        isStacked ? undefined : (
          <LayoutPanel width={300} hasDivider label="Shared expenses">
            <VStack gap={3}>
              <Heading level={3}>Expenses</Heading>
              {expenseList}
            </VStack>
          </LayoutPanel>
        )
      }
      end={
        isNarrow ? undefined : (
          <LayoutPanel width={360} hasDivider label="Expense editor">
            {editor}
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={isPhone ? 4 : 6}>
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          {/* <=1080px: the sheet takes over the content region while open;
              its back arrow returns to the board. */}
          {isNarrow && isEditorOpen ? editor : board}
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};