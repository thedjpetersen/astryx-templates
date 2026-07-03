var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — nine pending Kestrel Labs approval
 *   items (3 PTO, 2 expense reports, 2 access requests, 1 comp adjustment,
 *   1 offer approval) with fixed July 2026 ISO timestamps, precomputed SLA
 *   labels, reconciling dollar totals, and a decided-today baseline tally.
 *   No clocks, no randomness, no network media.
 * @output Unified Approvals Inbox — the cross-domain manager verdict surface
 *   of the Kestrel Labs workforce platform. Left queue panel groups pending
 *   items by type (PTO, expense, access, comp, offer) with tinted type
 *   glyphs and SLA chips, pinned above a keyboard-hint strip (j/k navigate,
 *   a approve, r reject). The selected item renders as a rich detail pane:
 *   PTO shows a team-coverage calendar strip, expenses show receipt tiles +
 *   policy checks with a reconciling line-item table, access shows the
 *   approval chain + policy gates, comp and offer show a comp-vs-band
 *   meter. Approve is one click / one key; Reject swaps in a
 *   required-comment composer. A delegation banner marks the four items
 *   arriving via Priya Raman's coverage window, and a decided-today tally
 *   footer grows as in-session verdicts land.
 * @position Page template; emitted by \`astryx template workforce-approvals-inbox\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, live pending count, Mine/Delegated filter)
 *   | start queue panel 380 (grouped list scrolls; kbd strip pinned below)
 *   | content detail pane (pinned approval header, scrolling type-specific
 *     body, pinned decision bar) | footer decided-today tally strip.
 * Container policy: list+detail archetype — frame rows and panels only, no
 *   Cards. Receipt tiles, the coverage strip, and the band meter are styled
 *   divs inside the detail pane; the queue is List/ListItem rows under
 *   plain group-header divs.
 * Color policy: token-pure everywhere. The only literals are \`light-dark()\`
 *   fallback pairs on the data-viz categorical tokens (type glyph tints,
 *   receipt-tile gradients, coverage cells) because the demo does not
 *   inject \`--color-data-categorical-*\`.
 *
 * Responsive contract:
 * - > 1080px: full split — queue panel 380, detail fills.
 * - <= 1080px: queue panel narrows to 300; detail metadata wraps ('multi').
 * - <= 700px: single-pane — the queue becomes the content fill; tapping a
 *   row swaps to the detail with a back IconButton; the keyboard-hint
 *   strip is dropped (no hardware keys assumed) and the header row wraps.
 * - The grouped queue and the detail body scroll independently
 *   (\`minHeight: 0\` down both flex chains); the queue kbd strip, detail
 *   header, decision bar, and tally footer are pinned.
 * - Keyboard shortcuts (j/k/a/r/Escape) are ignored while focus is inside
 *   an input or textarea so the reject composer can be typed in safely.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type Ref,
} from 'react';

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  CheckIcon,
  ClockIcon,
  InboxIcon,
  KeyRoundIcon,
  ReceiptIcon,
  TrendingUpIcon,
  UserCheckIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// DATA-VIZ CATEGORICAL FALLBACKS (repo-standard values; demo does not inject
// --color-data-categorical-*)
// ---------------------------------------------------------------------------

const CAT_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const CAT_PURPLE = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const CAT_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const CAT_ORANGE = 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))';
const CAT_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {
    height: '100dvh',
    width: '100%',
  },
  queuePane: {
    height: '100%',
    minHeight: 0,
  },
  queueFilter: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  queueScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingBlockEnd: 'var(--spacing-2)',
  },
  groupHeader: {
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-1)',
  },
  typeGlyph: {
    alignItems: 'center',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    flexShrink: 0,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  kbdStrip: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  detailFill: {
    height: '100%',
    minHeight: 0,
  },
  detailHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-3)',
  },
  detailBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  decisionBar: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  sectionLabelRow: {
    marginBlockEnd: 'var(--spacing-2)',
  },
  // Coverage strip (PTO): one shared 84px day-cell width keeps the strip,
  // its bars, and the requested-day outline registered.
  coverageRow: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  coverageCell: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    flex: '0 0 84px',
    padding: 'var(--spacing-2)',
    width: 84,
  },
  coverageCellRequested: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  coverageMeterTrack: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 999,
    height: 6,
    overflow: 'hidden',
    width: '100%',
  },
  coverageMeterFill: {
    borderRadius: 999,
    height: '100%',
  },
  // Line items (expense): right-aligned tabular numerals.
  lineItemAmount: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
    whiteSpace: 'nowrap',
  },
  lineItemsBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  lineItemRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  receiptRow: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  receiptTile: {
    alignItems: 'flex-end',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    flex: '0 0 88px',
    height: 112,
    overflow: 'hidden',
    padding: 'var(--spacing-1)',
    width: 88,
  },
  receiptTileMissing: {
    alignItems: 'center',
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    flex: '0 0 88px',
    height: 112,
    justifyContent: 'center',
    padding: 'var(--spacing-2)',
    textAlign: 'center',
    width: 88,
  },
  receiptCaption: {
    backgroundColor: 'light-dark(rgba(255,255,255,0.82), rgba(15,23,42,0.78))',
    borderRadius: 'calc(var(--radius-container) / 2)',
    padding: '2px var(--spacing-1)',
    width: '100%',
  },
  // Band meter (comp / offer): the track IS the salary band.
  bandMeterWrap: {
    paddingBlockStart: 'var(--spacing-4)',
    paddingInline: 10, // reserve room so edge markers never clip
  },
  bandTrack: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 999,
    height: 10,
    position: 'relative',
  },
  bandMidTick: {
    backgroundColor: 'var(--color-border)',
    height: 18,
    position: 'absolute',
    insetBlockStart: -4,
    width: 2,
  },
  bandMarker: {
    borderRadius: '50%',
    height: 16,
    position: 'absolute',
    insetBlockStart: -3,
    transform: 'translateX(-8px)',
    width: 16,
  },
  bandMarkerProposed: {
    backgroundColor: 'var(--color-accent)',
    boxShadow: '0 0 0 2px var(--color-background-surface)',
  },
  bandMarkerCurrent: {
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'inset 0 0 0 2px var(--color-text-secondary)',
  },
  quoteBox: {
    backgroundColor: 'var(--color-background-muted)',
    borderInlineStart: '3px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  checksBox: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
  },
  checkRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  moneyText: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  footerBar: {
    width: '100%',
  },
  emptyPad: {
    padding: 'var(--spacing-6)',
  },
};

// ---------------------------------------------------------------------------
// TYPES + TYPE META
// ---------------------------------------------------------------------------

type ApprovalType = 'pto' | 'expense' | 'access' | 'comp' | 'offer';
type SlaTone = 'ok' | 'warn' | 'breach';
type Verdict = 'approved' | 'rejected';
type CheckStatus = 'pass' | 'warn' | 'fail';

interface Requester {
  name: string;
  role: string;
  dept: string;
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
}

interface PolicyCheck {
  status: CheckStatus;
  label: string;
  detail?: string;
}

interface CoverageDay {
  label: string; // "Mon 13"
  requested: boolean;
  available: number;
  alsoOut?: string;
}

interface PtoPayload {
  kind: 'pto';
  range: string;
  workDays: number;
  balanceBefore: number;
  balanceAfter: number;
  policy: string;
  teamLabel: string;
  teamSize: number;
  days: CoverageDay[];
  coverageNote?: string;
}

interface ExpenseLine {
  label: string;
  amount: number;
}

interface ReceiptTile {
  label: string;
  gradient: string;
  missing?: boolean;
}

interface ExpensePayload {
  kind: 'expense';
  purpose: string;
  total: number;
  costCenter: string;
  lines: ExpenseLine[];
  receipts: ReceiptTile[];
  checks: PolicyCheck[];
}

interface ChainStep {
  label: string;
  detail: string;
  state: 'done' | 'current' | 'upcoming';
}

interface AccessPayload {
  kind: 'access';
  system: string;
  scope: string;
  duration: string;
  justification: string;
  checks: PolicyCheck[];
  chain: ChainStep[];
}

interface BandPayload {
  kind: 'comp' | 'offer';
  positionTitle: string;
  bandLabel: string;
  bandMin: number;
  bandMax: number;
  bandMid: number;
  proposed: number;
  current?: number; // comp adjustments only
  bullets: Array<{label: string; value: string}>;
  note: string;
}

type Payload = PtoPayload | ExpensePayload | AccessPayload | BandPayload;

interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  requester: Requester;
  submittedAt: string;
  sla: {label: string; tone: SlaTone};
  viaDelegation: boolean;
  payload: Payload;
}

const TYPE_META: Record<
  ApprovalType,
  {label: string; plural: string; icon: typeof CalendarDaysIcon; color: string}
> = {
  pto: {label: 'PTO request', plural: 'PTO requests', icon: CalendarDaysIcon, color: CAT_GREEN},
  expense: {label: 'Expense report', plural: 'Expense reports', icon: ReceiptIcon, color: CAT_ORANGE},
  access: {label: 'Access request', plural: 'Access requests', icon: KeyRoundIcon, color: CAT_BLUE},
  comp: {label: 'Comp adjustment', plural: 'Comp adjustments', icon: TrendingUpIcon, color: CAT_PURPLE},
  offer: {label: 'Offer approval', plural: 'Offer approvals', icon: BriefcaseIcon, color: CAT_TEAL},
};

const GROUP_ORDER: ApprovalType[] = ['pto', 'expense', 'access', 'comp', 'offer'];

const SLA_TOKEN_COLOR: Record<SlaTone, 'gray' | 'yellow' | 'red'> = {
  ok: 'gray',
  warn: 'yellow',
  breach: 'red',
};

const fmtUsd = (value: number, cents = false): string =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

// ---------------------------------------------------------------------------
// FIXTURES — Kestrel Labs (140 people), July 2026. Viewer: Marcus Webb
// (Platform lead), covering approvals for Priya Raman (VP Engineering)
// until Jul 20. Deterministic: fixed ISO timestamps, precomputed SLA labels
// (SLA target 3 business days), totals that reconcile.
// 3 PTO + 2 expense + 2 access + 1 comp + 1 offer = 9 pending.
// ---------------------------------------------------------------------------

const RECEIPT_GRADIENTS = [
  'linear-gradient(145deg, light-dark(#DBEAFE, #1E3A5F), light-dark(#93C5FD, #2C4F7C))',
  'linear-gradient(145deg, light-dark(#FEF3C7, #4A3A12), light-dark(#FCD34D, #6B531A))',
  'linear-gradient(145deg, light-dark(#DCFCE7, #143A24), light-dark(#86EFAC, #1E5433))',
  'linear-gradient(145deg, light-dark(#FCE7F3, #4A1D33), light-dark(#F9A8D4, #6B2A4A))',
];

const APPROVALS: ApprovalItem[] = [
  // -- PTO (3) — Marcus's own Platform team (8 engineers) -------------------
  {
    id: 'APR-1039',
    type: 'pto',
    title: 'PTO · Jul 9–10 (2 days)',
    requester: {name: 'Camille Duarte', role: 'Platform Engineer', dept: 'Engineering', office: 'Remote-US'},
    submittedAt: '2026-06-29T16:40:00Z',
    sla: {label: 'Overdue 3h', tone: 'breach'},
    viaDelegation: false,
    payload: {
      kind: 'pto',
      range: 'Thu Jul 9 – Fri Jul 10, 2026',
      workDays: 2,
      balanceBefore: 9,
      balanceAfter: 7,
      policy: 'Flexible PTO · Engineering',
      teamLabel: 'Platform team',
      teamSize: 8,
      days: [
        {label: 'Mon 6', requested: false, available: 8},
        {label: 'Tue 7', requested: false, available: 8},
        {label: 'Wed 8', requested: false, available: 8},
        {label: 'Thu 9', requested: true, available: 7},
        {label: 'Fri 10', requested: true, available: 6, alsoOut: 'Devon Marsh'},
      ],
      coverageNote: 'Devon Marsh is also out Fri Jul 10 (approved Jun 22) — coverage dips to 6 of 8.',
    },
  },
  {
    id: 'APR-1042',
    type: 'pto',
    title: 'PTO · Jul 13–17 (5 days)',
    requester: {name: 'Noah Feld', role: 'Senior Platform Engineer', dept: 'Engineering', office: 'SF HQ'},
    submittedAt: '2026-06-30T21:15:00Z',
    sla: {label: '9h left', tone: 'warn'},
    viaDelegation: false,
    payload: {
      kind: 'pto',
      range: 'Mon Jul 13 – Fri Jul 17, 2026',
      workDays: 5,
      balanceBefore: 14,
      balanceAfter: 9,
      policy: 'Flexible PTO · Engineering',
      teamLabel: 'Platform team',
      teamSize: 8,
      days: [
        {label: 'Mon 13', requested: true, available: 7},
        {label: 'Tue 14', requested: true, available: 6, alsoOut: 'Rui Costa'},
        {label: 'Wed 15', requested: true, available: 6, alsoOut: 'Rui Costa'},
        {label: 'Thu 16', requested: true, available: 7},
        {label: 'Fri 17', requested: true, available: 7},
      ],
      coverageNote: 'Rui Costa is also out Jul 14–15 (approved Jun 24) — coverage dips to 6 of 8 midweek.',
    },
  },
  {
    id: 'APR-1044',
    type: 'pto',
    title: 'PTO · Jul 20–24 (5 days)',
    requester: {name: 'Ingrid Halvorsen', role: 'Platform Engineer', dept: 'Engineering', office: 'Lisbon'},
    submittedAt: '2026-07-02T09:05:00Z',
    sla: {label: '2d 4h left', tone: 'ok'},
    viaDelegation: false,
    payload: {
      kind: 'pto',
      range: 'Mon Jul 20 – Fri Jul 24, 2026',
      workDays: 5,
      balanceBefore: 11,
      balanceAfter: 6,
      policy: 'Flexible PTO · Engineering',
      teamLabel: 'Platform team',
      teamSize: 8,
      days: [
        {label: 'Mon 20', requested: true, available: 7},
        {label: 'Tue 21', requested: true, available: 7},
        {label: 'Wed 22', requested: true, available: 7},
        {label: 'Thu 23', requested: true, available: 7},
        {label: 'Fri 24', requested: true, available: 7},
      ],
      coverageNote: 'No overlapping absences — coverage holds at 7 of 8 all week.',
    },
  },
  // -- Expense reports (2) — Marcus's directs ------------------------------
  {
    id: 'APR-1046',
    type: 'expense',
    title: 'KubeCon EU — Berlin travel',
    requester: {name: 'Leah Kim', role: 'Platform Engineer', dept: 'Engineering', office: 'SF HQ'},
    submittedAt: '2026-07-02T18:22:00Z',
    sla: {label: '1d 6h left', tone: 'ok'},
    viaDelegation: false,
    payload: {
      kind: 'expense',
      purpose: 'KubeCon EU 2026 (Berlin, Jun 22–25) — approved conference travel.',
      total: 1842.6,
      costCenter: 'ENG-PLAT · Travel',
      lines: [
        {label: 'Flight SFO → BER (economy, round trip)', amount: 986.4},
        {label: 'Hotel — 3 nights, Motel One Alexanderplatz', amount: 612.0},
        {label: 'Conference meals (4 days)', amount: 154.2},
        {label: 'Ground transport (airport + transit)', amount: 90.0},
      ],
      receipts: [
        {label: 'flight.pdf', gradient: RECEIPT_GRADIENTS[0]},
        {label: 'hotel.pdf', gradient: RECEIPT_GRADIENTS[1]},
        {label: 'meals.jpg', gradient: RECEIPT_GRADIENTS[2]},
        {label: 'transit.jpg', gradient: RECEIPT_GRADIENTS[3]},
      ],
      checks: [
        {status: 'pass', label: 'Within travel policy', detail: 'Economy fare, hotel under the $220/night cap.'},
        {status: 'pass', label: 'Receipts attached', detail: '4 of 4 line items have receipts.'},
        {status: 'pass', label: 'Submitted within 30 days', detail: 'Trip ended Jun 25; submitted Jul 2.'},
      ],
    },
  },
  {
    id: 'APR-1041',
    type: 'expense',
    title: 'Sprint-close team dinner',
    requester: {name: 'Devon Marsh', role: 'Platform Engineer', dept: 'Engineering', office: 'SF HQ'},
    submittedAt: '2026-06-30T23:48:00Z',
    sla: {label: '5h left', tone: 'warn'},
    viaDelegation: false,
    payload: {
      kind: 'expense',
      purpose: 'Sprint 14 close dinner — 4 attendees (Platform team, SF HQ).',
      total: 237.9,
      costCenter: 'ENG-PLAT · Team events',
      lines: [
        {label: 'Dinner — Osteria Nera (4 attendees)', amount: 214.5},
        {label: 'Rideshare — office to restaurant', amount: 23.4},
      ],
      receipts: [
        {label: 'dinner.jpg', gradient: RECEIPT_GRADIENTS[2]},
        {label: 'rideshare', gradient: '', missing: true},
      ],
      checks: [
        {status: 'pass', label: 'Meal within limit', detail: '$53.63 per person for 4 attendees — under the $75 cap.'},
        {status: 'warn', label: 'Receipt missing', detail: 'Rideshare line ($23.40) has no receipt attached.'},
        {status: 'pass', label: 'Submitted within 30 days', detail: 'Dinner Jun 26; submitted Jun 30.'},
      ],
    },
  },
  // -- Access requests (2) — delegated (Priya owns the eng systems) --------
  {
    id: 'APR-1043',
    type: 'access',
    title: 'GitHub org + Datadog — Engineer bundle',
    requester: {name: 'Ken Tanaka', role: 'Platform Engineer (starts Jul 6)', dept: 'Engineering', office: 'SF HQ'},
    submittedAt: '2026-07-01T15:10:00Z',
    sla: {label: '1d 22h left', tone: 'ok'},
    viaDelegation: true,
    payload: {
      kind: 'access',
      system: 'GitHub kestrel-labs org · Datadog',
      scope: 'GitHub write (platform repos) + Datadog viewer',
      duration: 'Standing (role-based grant)',
      justification:
        'Onboarding task ONB-88: day-one repo and observability access for the Platform team. Requested by IT on behalf of the new hire.',
      checks: [
        {status: 'pass', label: 'Matches role bundle', detail: 'Exact match for the "Platform Engineer" grant bundle.'},
        {status: 'pass', label: 'No separation-of-duties conflict'},
        {status: 'pass', label: 'Seat available', detail: 'GitHub pool 4 of 60 seats free; Datadog 7 of 40 free.'},
      ],
      chain: [
        {label: 'Requested', detail: 'Jul 1 · via onboarding workflow', state: 'done'},
        {label: 'Owner approval', detail: 'You, covering for Priya Raman', state: 'current'},
        {label: 'IT provisioning', detail: 'Tom Okonkwo · identity workflow', state: 'upcoming'},
      ],
    },
  },
  {
    id: 'APR-1038',
    type: 'access',
    title: 'AWS production — ReadOnlyAccess',
    requester: {name: 'Rui Costa', role: 'Senior Platform Engineer', dept: 'Engineering', office: 'Lisbon'},
    submittedAt: '2026-06-30T11:30:00Z',
    sla: {label: '3h left', tone: 'warn'},
    viaDelegation: true,
    payload: {
      kind: 'access',
      system: 'AWS production account',
      scope: 'IAM role: kestrel-prod-readonly',
      duration: '90 days (expires Sep 30, 2026)',
      justification:
        'Joining the on-call rotation starting Jul 20 — need read access to prod CloudWatch and ECS consoles to triage pages without paging a second responder.',
      checks: [
        {status: 'pass', label: 'Manager chain valid', detail: 'Reports into Engineering; on-call roster confirms Jul 20 start.'},
        {status: 'warn', label: 'Elevated environment', detail: 'Production scope — falls under the Q3 quarterly access review.'},
        {status: 'pass', label: 'Time-bound', detail: 'Auto-expires Sep 30, 2026; renewal requires a fresh request.'},
      ],
      chain: [
        {label: 'Requested', detail: 'Jun 30 · self-service portal', state: 'done'},
        {label: 'Owner approval', detail: 'You, covering for Priya Raman', state: 'current'},
        {label: 'Security review', detail: 'Required for prod IAM roles', state: 'upcoming'},
        {label: 'IT provisioning', detail: 'Tom Okonkwo · identity workflow', state: 'upcoming'},
      ],
    },
  },
  // -- Comp adjustment (1) — delegated -------------------------------------
  {
    id: 'APR-1040',
    type: 'comp',
    title: 'Promotion · Alma Reyes → L5',
    requester: {name: 'Alma Reyes', role: 'Platform Engineer → Senior (L5)', dept: 'Engineering', office: 'Remote-US'},
    submittedAt: '2026-06-30T19:55:00Z',
    sla: {label: '1d 1h left', tone: 'ok'},
    viaDelegation: true,
    payload: {
      kind: 'comp',
      positionTitle: 'Senior Platform Engineer (L5)',
      bandLabel: 'L5 Engineering band',
      bandMin: 158000,
      bandMax: 196000,
      bandMid: 177000,
      current: 151000,
      proposed: 172000,
      bullets: [
        {label: 'Change', value: '+$21,000 (+13.9%)'},
        {label: 'Effective', value: 'Aug 1, 2026 payroll'},
        {label: 'Promo pool', value: '$21,000 of $60,000 Eng H2 pool remains after this change'},
      ],
      note: 'Proposed by Priya Raman before her leave; calibrated in the June promo round. Lands at 37% of the L5 band — below midpoint, room for merit growth.',
    },
  },
  // -- Offer approval (1) — delegated ---------------------------------------
  {
    id: 'APR-1045',
    type: 'offer',
    title: 'Offer · Staff Engineer, Platform',
    requester: {name: 'Mireille Fontaine', role: 'Candidate · Staff Engineer (L6)', dept: 'Engineering', office: 'Remote-US'},
    submittedAt: '2026-07-02T14:35:00Z',
    sla: {label: '8h left', tone: 'warn'},
    viaDelegation: true,
    payload: {
      kind: 'offer',
      positionTitle: 'Staff Engineer, Platform (L6)',
      bandLabel: 'L6 Engineering band',
      bandMin: 192000,
      bandMax: 228000,
      bandMid: 210000,
      proposed: 214000,
      bullets: [
        {label: 'Base', value: '$214,000 · 61% of L6 band'},
        {label: 'Equity', value: '0.045% · 4-year vest, 1-year cliff'},
        {label: 'Sign-on', value: '$15,000'},
        {label: 'Req', value: 'ENG-2026-14 (approved headcount) · start Aug 17'},
      ],
      note: 'Candidate deadline is Jul 4, 09:00 PT. Recruiter: Dana Whitfield. Comp sits just above midpoint — justified by competing offer at $220k base.',
    },
  },
];

// Baseline decided-today tally (before any in-session verdicts).
const DECIDED_BASELINE = {approved: 5, rejected: 1};

// ---------------------------------------------------------------------------
// SHARED WIDGETS
// ---------------------------------------------------------------------------

function TypeGlyph({type}: {type: ApprovalType}) {
  const meta = TYPE_META[type];
  return (
    <div
      style={{
        ...styles.typeGlyph,
        backgroundColor: 'var(--color-background-muted)',
        color: meta.color,
      }}
      aria-hidden>
      <Icon icon={meta.icon} size="sm" color="inherit" />
    </div>
  );
}

function SlaChip({sla}: {sla: ApprovalItem['sla']}) {
  return (
    <Token
      size="sm"
      color={SLA_TOKEN_COLOR[sla.tone]}
      icon={<Icon icon={ClockIcon} size="sm" color="inherit" />}
      label={sla.label}
    />
  );
}

function SectionLabel({children}: {children: string}) {
  return (
    <div style={styles.sectionLabelRow}>
      <Text type="label" color="secondary">
        {children}
      </Text>
    </div>
  );
}

const CHECK_GLYPH: Record<CheckStatus, {icon: typeof CheckIcon; color: string}> = {
  pass: {icon: CheckCircle2Icon, color: CAT_GREEN},
  warn: {icon: AlertTriangleIcon, color: CAT_ORANGE},
  fail: {icon: XIcon, color: 'light-dark(#DC2626, #F87171)'},
};

function PolicyCheckList({checks}: {checks: PolicyCheck[]}) {
  return (
    <div style={styles.checksBox}>
      {checks.map((check, index) => (
        <div key={check.label}>
          {index > 0 && <Divider />}
          <div style={styles.checkRow}>
            <HStack gap={2} vAlign="start">
              <span style={{color: CHECK_GLYPH[check.status].color, display: 'inline-flex', flexShrink: 0, paddingBlockStart: 2}}>
                <Icon icon={CHECK_GLYPH[check.status].icon} size="sm" color="inherit" />
              </span>
              <VStack gap={0}>
                <Text type="body">{check.label}</Text>
                {check.detail && (
                  <Text type="supporting" color="secondary">
                    {check.detail}
                  </Text>
                )}
              </VStack>
            </HStack>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Comp-vs-band meter: the track spans the salary band (min → max) with a
 * midpoint tick; the accent marker is the proposed pay, the hollow marker
 * (comp adjustments) is current pay. Labels are anchored to the same
 * percentage scale as the markers so the readout stays registered.
 */
function BandMeter({payload}: {payload: BandPayload}) {
  const span = payload.bandMax - payload.bandMin;
  const pct = (value: number): number =>
    Math.min(100, Math.max(0, ((value - payload.bandMin) / span) * 100));
  const proposedPct = pct(payload.proposed);
  return (
    <div style={styles.bandMeterWrap}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary">
            {payload.bandLabel}
          </Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Midpoint {fmtUsd(payload.bandMid)}
          </Text>
        </HStack>
        <div style={styles.bandTrack}>
          <div style={{...styles.bandMidTick, insetInlineStart: \`\${pct(payload.bandMid)}%\`}} aria-hidden />
          {payload.current !== undefined && (
            <div
              style={{...styles.bandMarker, ...styles.bandMarkerCurrent, insetInlineStart: \`\${pct(payload.current)}%\`}}
              title={\`Current \${fmtUsd(payload.current)}\`}
              aria-hidden
            />
          )}
          <div
            style={{...styles.bandMarker, ...styles.bandMarkerProposed, insetInlineStart: \`\${proposedPct}%\`}}
            title={\`Proposed \${fmtUsd(payload.proposed)}\`}
            aria-hidden
          />
        </div>
        <HStack gap={2} vAlign="center">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {fmtUsd(payload.bandMin)}
          </Text>
          <StackItem size="fill">
            {/* display="block" — Text is inline by default, and justify only
                takes effect once the element spans the fill width. */}
            <Text type="supporting" display="block" justify="center" hasTabularNumbers>
              {payload.current !== undefined
                ? \`\${fmtUsd(payload.current)} → \${fmtUsd(payload.proposed)} · \${Math.round(proposedPct)}% of band\`
                : \`Offer \${fmtUsd(payload.proposed)} · \${Math.round(proposedPct)}% of band\`}
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {fmtUsd(payload.bandMax)}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PTO DETAIL — calendar impact strip showing team coverage
// ---------------------------------------------------------------------------

function CoverageDayCell({day, teamSize}: {day: CoverageDay; teamSize: number}) {
  const ratio = day.available / teamSize;
  const dipped = ratio < 0.875; // more than one absent from the 8-person team
  const fillColor = dipped ? CAT_ORANGE : CAT_GREEN;
  return (
    <div
      style={{
        ...styles.coverageCell,
        ...(day.requested ? styles.coverageCellRequested : undefined),
      }}>
      <VStack gap={1}>
        <Text type="supporting" color={day.requested ? 'primary' : 'secondary'}>
          {day.label}
        </Text>
        <div style={styles.coverageMeterTrack}>
          <div
            style={{
              ...styles.coverageMeterFill,
              backgroundColor: fillColor,
              width: \`\${Math.round(ratio * 100)}%\`,
            }}
            aria-hidden
          />
        </div>
        <Text type="supporting" color={dipped ? 'primary' : 'secondary'} hasTabularNumbers>
          {day.available} of {teamSize}
        </Text>
        <Text type="supporting" color="secondary">
          {day.requested ? 'Requested' : day.alsoOut ? 'Overlap' : '—'}
        </Text>
      </VStack>
    </div>
  );
}

function PtoBody({payload}: {payload: PtoPayload}) {
  return (
    <VStack gap={5}>
      <MetadataList columns="multi" label={{position: 'start', width: 96}}>
        <MetadataListItem label="Dates">
          <Text type="body">{payload.range}</Text>
        </MetadataListItem>
        <MetadataListItem label="Days used">
          <Text type="body" hasTabularNumbers>
            {payload.workDays} working days
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Balance">
          <Text type="body" hasTabularNumbers>
            {payload.balanceBefore} days → {payload.balanceAfter} after approval
          </Text>
        </MetadataListItem>
        <MetadataListItem label="Policy">
          <Text type="body">{payload.policy}</Text>
        </MetadataListItem>
      </MetadataList>
      <div>
        <SectionLabel>{\`Calendar impact — \${payload.teamLabel} coverage (\${payload.teamSize} engineers)\`}</SectionLabel>
        <div style={styles.coverageRow}>
          {payload.days.map(day => (
            <CoverageDayCell key={day.label} day={day} teamSize={payload.teamSize} />
          ))}
        </div>
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarDaysIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {payload.coverageNote}
          </Text>
        </HStack>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// EXPENSE DETAIL — receipt tiles + policy checks + reconciling line items
// ---------------------------------------------------------------------------

function ExpenseBody({payload}: {payload: ExpensePayload}) {
  return (
    <VStack gap={5}>
      <MetadataList columns="multi" label={{position: 'start', width: 96}}>
        <MetadataListItem label="Purpose">
          <Text type="body">{payload.purpose}</Text>
        </MetadataListItem>
        <MetadataListItem label="Cost center">
          <Text type="body">{payload.costCenter}</Text>
        </MetadataListItem>
        <MetadataListItem label="Total">
          <Text type="body" weight="bold" hasTabularNumbers>
            {fmtUsd(payload.total, true)}
          </Text>
        </MetadataListItem>
      </MetadataList>
      <div>
        <SectionLabel>Line items</SectionLabel>
        <div style={styles.lineItemsBox}>
          {payload.lines.map((line, index) => (
            <div key={line.label}>
              {index > 0 && <Divider />}
              <div style={styles.lineItemRow}>
                <HStack gap={3} vAlign="center">
                  <StackItem size="fill">
                    <Text type="body">{line.label}</Text>
                  </StackItem>
                  <div style={styles.lineItemAmount}>
                    <Text type="body" hasTabularNumbers>
                      {fmtUsd(line.amount, true)}
                    </Text>
                  </div>
                </HStack>
              </div>
            </div>
          ))}
          <Divider />
          <div style={styles.lineItemRow}>
            <HStack gap={3} vAlign="center">
              <StackItem size="fill">
                <Text type="label">Report total</Text>
              </StackItem>
              <div style={styles.lineItemAmount}>
                <Text type="label" hasTabularNumbers>
                  {fmtUsd(payload.total, true)}
                </Text>
              </div>
            </HStack>
          </div>
        </div>
      </div>
      <div>
        <SectionLabel>Receipts</SectionLabel>
        <div style={styles.receiptRow}>
          {payload.receipts.map(receipt =>
            receipt.missing ? (
              <div key={receipt.label} style={styles.receiptTileMissing}>
                <VStack gap={1} hAlign="center">
                  <Icon icon={AlertTriangleIcon} size="sm" color="warning" />
                  <Text type="supporting" color="secondary">
                    {receipt.label} missing
                  </Text>
                </VStack>
              </div>
            ) : (
              <div key={receipt.label} style={{...styles.receiptTile, background: receipt.gradient}}>
                <div style={styles.receiptCaption}>
                  <Text type="supporting" maxLines={1}>
                    {receipt.label}
                  </Text>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
      <div>
        <SectionLabel>Policy checks</SectionLabel>
        <PolicyCheckList checks={payload.checks} />
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// ACCESS DETAIL — approval chain + policy gates + justification quote
// ---------------------------------------------------------------------------

function ChainStepRow({step}: {step: ChainStep}) {
  const glyph =
    step.state === 'done' ? (
      <span style={{color: CAT_GREEN, display: 'inline-flex'}}>
        <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
      </span>
    ) : step.state === 'current' ? (
      <span style={{color: 'var(--color-accent)', display: 'inline-flex'}}>
        <Icon icon={UserCheckIcon} size="sm" color="inherit" />
      </span>
    ) : (
      <span style={{color: 'var(--color-text-secondary)', display: 'inline-flex'}}>
        <Icon icon={ClockIcon} size="sm" color="inherit" />
      </span>
    );
  return (
    <div>
      <HStack gap={2} vAlign="start">
        <span style={{flexShrink: 0, paddingBlockStart: 2}}>{glyph}</span>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <Text type="body" weight={step.state === 'current' ? 'bold' : undefined}>
              {step.label}
            </Text>
            {step.state === 'current' && <Badge variant="info" label="You are here" />}
          </HStack>
          <Text type="supporting" color="secondary">
            {step.detail}
          </Text>
        </VStack>
      </HStack>
    </div>
  );
}

function AccessBody({payload}: {payload: AccessPayload}) {
  return (
    <VStack gap={5}>
      <MetadataList columns="multi" label={{position: 'start', width: 96}}>
        <MetadataListItem label="System">
          <Text type="body">{payload.system}</Text>
        </MetadataListItem>
        <MetadataListItem label="Scope">
          <Text type="body">{payload.scope}</Text>
        </MetadataListItem>
        <MetadataListItem label="Duration">
          <Text type="body">{payload.duration}</Text>
        </MetadataListItem>
      </MetadataList>
      <div>
        <SectionLabel>Business justification</SectionLabel>
        <div style={styles.quoteBox}>
          <Text type="body">“{payload.justification}”</Text>
        </div>
      </div>
      <div>
        <SectionLabel>Approval chain</SectionLabel>
        <VStack gap={3}>
          {payload.chain.map(step => (
            <ChainStepRow key={step.label} step={step} />
          ))}
        </VStack>
      </div>
      <div>
        <SectionLabel>Policy checks</SectionLabel>
        <PolicyCheckList checks={payload.checks} />
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// COMP / OFFER DETAIL — comp-vs-band meter + terms
// ---------------------------------------------------------------------------

function BandBody({payload}: {payload: BandPayload}) {
  return (
    <VStack gap={5}>
      <MetadataList columns="multi" label={{position: 'start', width: 96}}>
        <MetadataListItem label="Position">
          <Text type="body">{payload.positionTitle}</Text>
        </MetadataListItem>
        {payload.bullets.map(bullet => (
          <MetadataListItem key={bullet.label} label={bullet.label}>
            <Text type="body" hasTabularNumbers>
              {bullet.value}
            </Text>
          </MetadataListItem>
        ))}
      </MetadataList>
      <div>
        <SectionLabel>{payload.kind === 'comp' ? 'Comp vs band' : 'Offer vs band'}</SectionLabel>
        <BandMeter payload={payload} />
        {payload.kind === 'comp' && (
          <HStack gap={3} vAlign="center">
            <HStack gap={1} vAlign="center">
              <span style={{...styles.bandMarker, ...styles.bandMarkerCurrent, position: 'static', transform: 'none', display: 'inline-block'}} aria-hidden />
              <Text type="supporting" color="secondary">
                Current
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <span style={{...styles.bandMarker, ...styles.bandMarkerProposed, position: 'static', transform: 'none', display: 'inline-block'}} aria-hidden />
              <Text type="supporting" color="secondary">
                Proposed
              </Text>
            </HStack>
          </HStack>
        )}
      </div>
      <div>
        <SectionLabel>Context</SectionLabel>
        <div style={styles.quoteBox}>
          <Text type="body">{payload.note}</Text>
        </div>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DECISION BAR — approve / reject with required-comment reject composer
// ---------------------------------------------------------------------------

interface Decision {
  verdict: Verdict;
  comment?: string;
}

function DecisionBar({
  item,
  decision,
  isRejecting,
  rejectComment,
  onApprove,
  onStartReject,
  onCancelReject,
  onRejectCommentChange,
  onConfirmReject,
  onUndo,
  rejectInputRef,
}: {
  item: ApprovalItem;
  decision: Decision | undefined;
  isRejecting: boolean;
  rejectComment: string;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onRejectCommentChange: (value: string) => void;
  onConfirmReject: () => void;
  onUndo: () => void;
  rejectInputRef: Ref<HTMLTextAreaElement>;
}) {
  if (decision) {
    return (
      <div style={styles.decisionBar}>
        <Banner
          status={decision.verdict === 'approved' ? 'success' : 'error'}
          title={decision.verdict === 'approved' ? \`Approved \${item.id}\` : \`Rejected \${item.id}\`}
          description={
            decision.verdict === 'approved'
              ? 'Recorded in the decision log; the requester has been notified.'
              : \`Reason shared with \${item.requester.name}: “\${decision.comment}”\`
          }
          endContent={<Button label="Undo" size="sm" variant="secondary" onClick={onUndo} />}
        />
      </div>
    );
  }
  if (isRejecting) {
    return (
      <VStack gap={2} style={styles.decisionBar}>
        <TextArea
          ref={rejectInputRef}
          label="Rejection reason (required — shared with the requester)"
          placeholder="Explain what the requester should change or expect..."
          value={rejectComment}
          onChange={onRejectCommentChange}
          rows={2}
          width="100%"
        />
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              A comment is required for every rejection — it is written to the audit log.
            </Text>
          </StackItem>
          <Button label="Cancel" variant="ghost" size="sm" onClick={onCancelReject} />
          <Button
            label="Confirm rejection"
            variant="destructive"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            isDisabled={rejectComment.trim().length === 0}
            onClick={onConfirmReject}
          />
        </HStack>
      </VStack>
    );
  }
  return (
    <div style={styles.decisionBar}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="supporting" color="secondary">
            {item.viaDelegation
              ? 'Deciding as delegate for Priya Raman — logged under both names.'
              : 'Your direct report — decision is logged under your name.'}
          </Text>
        </StackItem>
        <Button
          label="Reject"
          variant="secondary"
          size="sm"
          icon={<Icon icon={XIcon} size="sm" />}
          onClick={onStartReject}
        />
        <Button
          label="Approve"
          size="sm"
          icon={<Icon icon={CheckIcon} size="sm" />}
          onClick={onApprove}
        />
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL PANE — pinned approval header, scrolling type body, decision bar
// ---------------------------------------------------------------------------

function DetailBody({item}: {item: ApprovalItem}) {
  switch (item.payload.kind) {
    case 'pto':
      return <PtoBody payload={item.payload} />;
    case 'expense':
      return <ExpenseBody payload={item.payload} />;
    case 'access':
      return <AccessBody payload={item.payload} />;
    default:
      return <BandBody payload={item.payload} />;
  }
}

function DetailPane({
  item,
  decision,
  isRejecting,
  rejectComment,
  isPhone,
  onBack,
  onApprove,
  onStartReject,
  onCancelReject,
  onRejectCommentChange,
  onConfirmReject,
  onUndo,
  rejectInputRef,
}: {
  item: ApprovalItem;
  decision: Decision | undefined;
  isRejecting: boolean;
  rejectComment: string;
  isPhone: boolean;
  onBack?: () => void;
  onApprove: () => void;
  onStartReject: () => void;
  onCancelReject: () => void;
  onRejectCommentChange: (value: string) => void;
  onConfirmReject: () => void;
  onUndo: () => void;
  rejectInputRef: Ref<HTMLTextAreaElement>;
}) {
  const meta = TYPE_META[item.type];
  return (
    <VStack gap={0} style={styles.detailFill}>
      <VStack gap={3} style={styles.detailHeader}>
        {/* On phones this row wraps so trailing chips never clip. */}
        <HStack gap={2} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
          {onBack && (
            <IconButton
              label="Back to approvals queue"
              tooltip="Back to approvals queue"
              size="sm"
              variant="ghost"
              icon={<Icon icon={ArrowLeftIcon} size="sm" />}
              onClick={onBack}
            />
          )}
          <Text type="supporting" color="secondary">
            {item.id}
          </Text>
          <Token size="sm" color="gray" label={meta.label} />
          <SlaChip sla={item.sla} />
          {item.viaDelegation && (
            <Token
              size="sm"
              color="blue"
              icon={<Icon icon={UserCheckIcon} size="sm" color="inherit" />}
              label="For Priya Raman"
            />
          )}
          <StackItem size="fill" />
          <Text type="supporting" color="secondary">
            Submitted <Timestamp value={item.submittedAt} format="date_time" />
          </Text>
        </HStack>
        <Heading level={2}>{item.title}</Heading>
        <HStack gap={3} vAlign="center">
          <Avatar name={item.requester.name} size="small" />
          <VStack gap={0}>
            <Text type="label">{item.requester.name}</Text>
            <Text type="supporting" color="secondary">
              {item.requester.role} · {item.requester.dept} · {item.requester.office}
            </Text>
          </VStack>
        </HStack>
      </VStack>

      <Divider />

      {/* Type-specific rich card scrolls between the pinned header and bar.
          Keyed by item so the scroll position resets when the selection
          changes — otherwise the next item opens mid-scroll. */}
      <div key={item.id} style={styles.detailBody}>
        <DetailBody item={item} />
      </div>

      <Divider />

      <DecisionBar
        item={item}
        decision={decision}
        isRejecting={isRejecting}
        rejectComment={rejectComment}
        onApprove={onApprove}
        onStartReject={onStartReject}
        onCancelReject={onCancelReject}
        onRejectCommentChange={onRejectCommentChange}
        onConfirmReject={onConfirmReject}
        onUndo={onUndo}
        rejectInputRef={rejectInputRef}
      />
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// QUEUE PANE — grouped list with type glyphs + SLA chips, pinned kbd strip
// ---------------------------------------------------------------------------

type QueueFilter = 'all' | 'mine' | 'delegated';

function QueueRow({
  item,
  decision,
  isSelected,
  onSelect,
}: {
  item: ApprovalItem;
  decision: Decision | undefined;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <ListItem
      label={item.title}
      description={\`\${item.requester.name} · \${item.requester.dept}\${item.viaDelegation ? ' · for Priya' : ''}\`}
      startContent={<TypeGlyph type={item.type} />}
      endContent={
        decision ? (
          <Token
            size="sm"
            color={decision.verdict === 'approved' ? 'green' : 'red'}
            label={decision.verdict === 'approved' ? 'Approved' : 'Rejected'}
          />
        ) : (
          <SlaChip sla={item.sla} />
        )
      }
      isSelected={isSelected}
      onClick={() => onSelect(item.id)}
    />
  );
}

function QueuePane({
  items,
  decisions,
  filter,
  selectedId,
  showKbdStrip,
  onFilterChange,
  onSelect,
}: {
  items: ApprovalItem[];
  decisions: Record<string, Decision>;
  filter: QueueFilter;
  selectedId: string | null;
  showKbdStrip: boolean;
  onFilterChange: (value: QueueFilter) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <VStack gap={0} style={styles.queuePane}>
      <div style={styles.queueFilter}>
        <SegmentedControl
          label="Filter approvals"
          value={filter}
          onChange={value => onFilterChange(value as QueueFilter)}
          size="sm">
          <SegmentedControlItem label="All" value="all" />
          <SegmentedControlItem label="Mine" value="mine" />
          <SegmentedControlItem label="Delegated" value="delegated" />
        </SegmentedControl>
      </div>
      <div style={styles.queueScroll}>
        {items.length === 0 ? (
          <div style={styles.emptyPad}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="Nothing in this view"
              description="Switch the filter to see the rest of the queue."
            />
          </div>
        ) : (
          GROUP_ORDER.map(type => {
            const group = items.filter(item => item.type === type);
            if (group.length === 0) {
              return null;
            }
            const pending = group.filter(item => !decisions[item.id]).length;
            return (
              <div key={type}>
                <div style={styles.groupHeader}>
                  <HStack gap={2} vAlign="center">
                    <Text type="label" color="secondary">
                      {TYPE_META[type].plural}
                    </Text>
                    <Badge label={pending} variant={pending === 0 ? 'neutral' : 'info'} />
                  </HStack>
                </div>
                <List density="compact">
                  {group.map(item => (
                    <QueueRow
                      key={item.id}
                      item={item}
                      decision={decisions[item.id]}
                      isSelected={item.id === selectedId}
                      onSelect={onSelect}
                    />
                  ))}
                </List>
              </div>
            );
          })
        )}
      </div>
      {showKbdStrip && (
        <div style={styles.kbdStrip}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <HStack gap={1} vAlign="center">
              <Kbd keys="j" />
              <Kbd keys="k" />
              <Text type="supporting" color="secondary">
                navigate
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="a" />
              <Text type="supporting" color="secondary">
                approve
              </Text>
            </HStack>
            <HStack gap={1} vAlign="center">
              <Kbd keys="r" />
              <Text type="supporting" color="secondary">
                reject
              </Text>
            </HStack>
          </HStack>
        </div>
      )}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function WorkforceApprovalsInboxTemplate() {
  const [filter, setFilter] = useState<QueueFilter>('all');
  const [selectedId, setSelectedId] = useState<string | null>(APPROVALS[0].id);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState('');
  // Single-pane mode is queue-first; tapping a row swaps to the detail.
  const [isDetailShownOnPhone, setIsDetailShownOnPhone] = useState(false);

  const isNarrow = useMediaQuery('(max-width: 1080px)');
  const isPhone = useMediaQuery('(max-width: 700px)');

  const rejectInputRef = useRef<HTMLTextAreaElement>(null);

  const visible = useMemo(() => {
    if (filter === 'mine') {
      return APPROVALS.filter(item => !item.viaDelegation);
    }
    if (filter === 'delegated') {
      return APPROVALS.filter(item => item.viaDelegation);
    }
    return APPROVALS;
  }, [filter]);

  // Flattened visible order (grouped by type) — the j/k traversal order
  // matches exactly what the queue renders.
  const flatOrder = useMemo(
    () => GROUP_ORDER.flatMap(type => visible.filter(item => item.type === type)),
    [visible],
  );

  const selected = flatOrder.find(item => item.id === selectedId) ?? null;
  const selectedDecision = selected ? decisions[selected.id] : undefined;

  const pendingCount = APPROVALS.filter(item => !decisions[item.id]).length;
  const delegatedPending = APPROVALS.filter(item => item.viaDelegation && !decisions[item.id]).length;
  const sessionApproved = Object.values(decisions).filter(d => d.verdict === 'approved').length;
  const sessionRejected = Object.values(decisions).filter(d => d.verdict === 'rejected').length;
  const decidedApproved = DECIDED_BASELINE.approved + sessionApproved;
  const decidedRejected = DECIDED_BASELINE.rejected + sessionRejected;
  const overduePending = APPROVALS.filter(
    item => !decisions[item.id] && item.sla.tone === 'breach',
  ).length;

  const selectItem = (id: string) => {
    setSelectedId(id);
    setRejectingId(null);
    setRejectComment('');
    setIsDetailShownOnPhone(true);
  };

  // After a verdict, advance to the next still-pending item in queue order.
  const advanceFrom = (id: string, nextDecisions: Record<string, Decision>) => {
    const index = flatOrder.findIndex(item => item.id === id);
    const after = [...flatOrder.slice(index + 1), ...flatOrder.slice(0, index)];
    const next = after.find(item => !nextDecisions[item.id]);
    if (next) {
      setSelectedId(next.id);
    }
  };

  const approve = (id: string) => {
    if (decisions[id]) {
      return;
    }
    const next = {...decisions, [id]: {verdict: 'approved' as const}};
    setDecisions(next);
    setRejectingId(null);
    setRejectComment('');
    advanceFrom(id, next);
  };

  const confirmReject = (id: string, comment: string) => {
    const trimmed = comment.trim();
    if (trimmed.length === 0 || decisions[id]) {
      return;
    }
    const next = {...decisions, [id]: {verdict: 'rejected' as const, comment: trimmed}};
    setDecisions(next);
    setRejectingId(null);
    setRejectComment('');
    advanceFrom(id, next);
  };

  const undo = (id: string) => {
    setDecisions(prev => {
      const next = {...prev};
      delete next[id];
      return next;
    });
    setSelectedId(id);
  };

  const startReject = (id: string) => {
    setRejectingId(id);
    setRejectComment('');
    // Focus lands in the composer so typing starts immediately (and the
    // j/k/a/r shortcuts stand down while it has focus).
    requestAnimationFrame(() => rejectInputRef.current?.focus());
  };

  // Global j/k/a/r/Escape shortcuts. Ignored while focus sits in an input,
  // textarea, or select — the reject composer must be typable.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        if (event.key === 'Escape') {
          setRejectingId(null);
        }
        return;
      }
      if (event.key === 'Escape') {
        setRejectingId(null);
        return;
      }
      if (event.key === 'j' || event.key === 'k') {
        event.preventDefault();
        setSelectedId(prevId => {
          if (flatOrder.length === 0) {
            return prevId;
          }
          const index = flatOrder.findIndex(item => item.id === prevId);
          const nextIndex =
            index === -1
              ? 0
              : event.key === 'j'
                ? Math.min(flatOrder.length - 1, index + 1)
                : Math.max(0, index - 1);
          return flatOrder[nextIndex].id;
        });
        setRejectingId(null);
        setRejectComment('');
        setIsDetailShownOnPhone(true);
        return;
      }
      if (event.key === 'a' && selected && !decisions[selected.id]) {
        event.preventDefault();
        approve(selected.id);
        return;
      }
      if (event.key === 'r' && selected && !decisions[selected.id]) {
        event.preventDefault();
        startReject(selected.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const queuePane = (
    <QueuePane
      items={visible}
      decisions={decisions}
      filter={filter}
      selectedId={selected?.id ?? null}
      showKbdStrip={!isPhone}
      onFilterChange={value => {
        setFilter(value);
        setRejectingId(null);
        // Keep a valid selection: if the current item is filtered out,
        // select the first item of the new view (grouped order).
        const nextVisible =
          value === 'mine'
            ? APPROVALS.filter(item => !item.viaDelegation)
            : value === 'delegated'
              ? APPROVALS.filter(item => item.viaDelegation)
              : APPROVALS;
        if (!nextVisible.some(item => item.id === selectedId)) {
          const ordered = GROUP_ORDER.flatMap(type =>
            nextVisible.filter(item => item.type === type),
          );
          setSelectedId(ordered[0]?.id ?? null);
        }
      }}
      onSelect={selectItem}
    />
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={3}>
              {/* On phones the tally chips wrap under the heading. */}
              <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
                <StackItem size="fill">
                  <HStack gap={2} vAlign="center">
                    <Heading level={1}>Approvals inbox</Heading>
                    <Badge variant={pendingCount > 0 ? 'info' : 'neutral'} label={\`\${pendingCount} pending\`} />
                  </HStack>
                </StackItem>
                <Text type="supporting" color="secondary">
                  Marcus Webb · Platform lead · Kestrel Labs
                </Text>
              </HStack>
              <Banner
                status="info"
                container="section"
                title="You're covering approvals for Priya Raman until Jul 20"
                description={\`\${delegatedPending} of the \${pendingCount} pending items arrived via this delegation — decisions are logged under both names.\`}
              />
            </VStack>
          </LayoutHeader>
        }
        start={
          isPhone ? undefined : (
            <LayoutPanel width={isNarrow ? 300 : 380} padding={0} hasDivider label="Approvals queue">
              {queuePane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            {isPhone && (!isDetailShownOnPhone || selected === null) ? (
              queuePane
            ) : selected ? (
              <DetailPane
                item={selected}
                decision={selectedDecision}
                isRejecting={rejectingId === selected.id}
                rejectComment={rejectComment}
                isPhone={isPhone}
                onBack={isPhone ? () => setIsDetailShownOnPhone(false) : undefined}
                onApprove={() => approve(selected.id)}
                onStartReject={() => startReject(selected.id)}
                onCancelReject={() => setRejectingId(null)}
                onRejectCommentChange={setRejectComment}
                onConfirmReject={() => confirmReject(selected.id, rejectComment)}
                onUndo={() => undo(selected.id)}
                rejectInputRef={rejectInputRef}
              />
            ) : (
              <EmptyState
                title="No approval selected"
                description="Pick an item from the queue — or press j / k to move through it."
                icon={<Icon icon={InboxIcon} size="lg" />}
              />
            )}
          </LayoutContent>
        }
        footer={
          <LayoutFooter hasDivider>
            <div style={styles.footerBar}>
              <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
                <Text type="label">Decided today</Text>
                <Token size="sm" color="gray" label={\`\${decidedApproved + decidedRejected} total\`} />
                <Token size="sm" color="green" label={\`\${decidedApproved} approved\`} />
                <Token size="sm" color="red" label={\`\${decidedRejected} rejected\`} />
                <StackItem size="fill" />
                <Text type="supporting" color="secondary">
                  {overduePending > 0
                    ? \`SLA target 3 business days · \${overduePending} pending item past SLA (APR-1039, overdue 3h)\`
                    : 'SLA target 3 business days · no pending items past SLA'}
                </Text>
              </HStack>
            </div>
          </LayoutFooter>
        }
      />
    </div>
  );
}
`;export{e as default};