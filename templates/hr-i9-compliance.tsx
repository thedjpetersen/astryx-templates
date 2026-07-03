// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs I-9 / work-
 *   authorization program as of a fixed Wed Jul 29, 2026 09:00 PT
 *   snapshot: 140 active I-9 records (137 verified & current + 2 flagged
 *   for correction + 1 reverification due — the split sums to 140 by
 *   construction), 2 in-flight new hires pending Section 2 (Ava Lindqvist,
 *   started Jul 27, Section 2 due Jul 30; Ken Tanaka, starts Aug 3,
 *   remote), one EAD reverification expiring Sep 30 2026 with its 90-day
 *   reminder stamped Jul 2, four E-Verify cases with fixed case numbers,
 *   one authorized-representative appointment, and retention/purge rows.
 *   No clocks, no Math.random(), no network media; every countdown and
 *   count is a fixed value derived from the same module-scope fixtures.
 * @output I-9 & Work Authorization tracker — the federal work-
 *   authorization compliance surface for Kestrel Labs (140-person
 *   platform company). A completion summary strip (segmented 140-record
 *   bar + stat tiles); an urgent day-3 deadline banner; a pending-
 *   Section-2 queue where selecting a hire opens the acceptable-document
 *   checklist rendered as two combo columns (List A vs List B + List C)
 *   with examine-and-certify interaction; a reverification row (EAD
 *   expiring Sep 30 with a 90-day reminder chip and days-remaining
 *   countdown); an E-Verify case table (draft / submitted / employment-
 *   authorized with case numbers and an open/closed filter); a remote-
 *   verification appointment card for the authorized-representative flow;
 *   and an audit-readiness panel (retention rule, purge-eligible archive
 *   rows, 2 files flagged for correction with start-correction actions).
 * @position Page template; emitted by `astryx template hr-i9-compliance`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, snapshot note, E-Verify employer chip, audit-binder
 *   export button)
 *   | content (summary strip, deadline banner, pending queue + document
 *     checklist, reverification row, E-Verify table, remote-verification
 *     appointment — one vertical scroller)
 *   | end panel 340 (audit readiness: retention, purge queue, flagged
 *     files — scrolls independently).
 *
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   design-system Cards. Stat tiles, queue rows, checklist columns, the
 *   appointment card, and flagged-file rows are styled bordered divs; the
 *   audit-readiness region is a LayoutPanel.
 *
 * Color policy: token-pure everywhere; the only literals are the
 *   repo-standard `light-dark()` fallback pairs on the data-viz
 *   categorical tokens (summary bar segments, doc-list accents) and the
 *   `light-dark()` tint/text pairs on the urgency countdown chips
 *   (red = due tomorrow, amber = correction window, green = clear) — the
 *   demo does not inject `--color-data-categorical-*`.
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px audit-readiness panel on the end
 *   edge.
 * - <= 1180px: the audit panel drops and the same audit-readiness section
 *   renders inline at the bottom of the main scroller.
 * - <= 860px: the summary tiles fall from 4-up to 2-up, the two document
 *   checklist columns stack, pending-queue rows wrap their meta line, the
 *   E-Verify table hides the Submitted column, and the header wraps
 *   instead of clipping the export button.
 * - The content column and the audit panel scroll independently
 *   (`minHeight: 0` down each flex chain).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  ArchiveIcon,
  BadgeCheckIcon,
  CalendarClockIcon,
  CheckIcon,
  DownloadIcon,
  FileCheck2Icon,
  FileTextIcon,
  FileWarningIcon,
  IdCardIcon,
  MapPinIcon,
  SendIcon,
  ShieldCheckIcon,
  StampIcon,
  UserCheckIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
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
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

/** Shared bordered-surface base for tiles, queue rows, and cards. */
const surfaceCard: CSSProperties = {
  borderRadius: 'var(--radius-container)',
  border: 'var(--border-width) solid var(--color-border)',
  backgroundColor: 'var(--color-background-surface)',
};

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sectionBlock: {minWidth: 0},
  headerNote: {minWidth: 0},
  employerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Summary strip ---------------------------------------------------------
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  statGridCompact: {gridTemplateColumns: 'repeat(2, minmax(0, 1fr))'},
  statTile: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-3)',
    ...surfaceCard,
    minWidth: 0,
  },
  statValue: {
    fontSize: 26,
    lineHeight: 1.1,
    fontWeight: 650,
    fontVariantNumeric: 'tabular-nums',
  },
  // Segmented 140-record completion bar; each segment width is
  // count / 140 of the track. Colors carry the repo-standard fallbacks.
  segBarTrack: {
    display: 'flex',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
  },
  segBarSeg: {height: '100%'},
  legendSwatch: {width: 8, height: 8, borderRadius: 2, flexShrink: 0},
  // Pending Section 2 queue ------------------------------------------------
  queueRow: {
    display: 'flex',
    flexDirection: 'column',
    ...surfaceCard,
    overflow: 'hidden',
  },
  queueRowSelected: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  // The row header is a real <button> (it opens the doc checklist) — reset
  // UA chrome and restyle as a padded flex row.
  queueRowButton: {
    appearance: 'none',
    background: 'none',
    border: 'none',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    width: '100%',
    minWidth: 0,
  },
  deadlineChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Urgency tiers — intentional literals, light-dark pairs (see header
  // Color policy). Red = due within 1 business day.
  chipUrgent: {
    backgroundColor: 'light-dark(#FEE2E2, rgba(248,113,113,0.16))',
    color: 'light-dark(#B91C1C, #FCA5A5)',
  },
  chipWarn: {
    backgroundColor: 'light-dark(#FEF3C7, rgba(251,191,36,0.14))',
    color: 'light-dark(#92400E, #FCD34D)',
  },
  chipNeutral: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  chipClear: {
    backgroundColor: 'light-dark(#DCFCE7, rgba(52,199,89,0.14))',
    color: 'light-dark(#15803D, #4ADE80)',
  },
  checklistWrap: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-muted)',
  },
  comboGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
  },
  comboGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  comboCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    ...surfaceCard,
    minWidth: 0,
  },
  comboColIndicated: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  comboOr: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.08em',
  },
  docRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) 0',
    minWidth: 0,
  },
  // Reverification --------------------------------------------------------
  reverifRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    ...surfaceCard,
  },
  reminderChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    backgroundColor: 'light-dark(rgba(1,113,227,0.10), rgba(76,158,255,0.16))',
    color: 'light-dark(#0159B3, #7CB8FF)',
  },
  reverifSteps: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2) var(--spacing-4)',
  },
  // E-Verify table ---------------------------------------------------------
  tableWrap: {
    ...surfaceCard,
    // Deliberate horizontal scroller on narrow viewports (see responsive
    // contract); vertical growth is unbounded — the page column scrolls.
    overflowX: 'auto',
  },
  caseNumber: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  numericCell: {
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Remote-verification appointment ---------------------------------------
  appointmentCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    ...surfaceCard,
  },
  appointmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
    gap: 'var(--spacing-4)',
  },
  appointmentGridCompact: {gridTemplateColumns: 'minmax(0, 1fr)'},
  stepDotCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 12,
    backgroundColor: 'var(--color-border)',
  },
  complianceNote: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Audit-readiness panel --------------------------------------------------
  panelFill: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  panelScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  flaggedRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    ...surfaceCard,
  },
  flaggedIssue: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-control, 6px)',
    backgroundColor: 'light-dark(#FEF3C7, rgba(251,191,36,0.12))',
  },
  purgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) 0',
    minWidth: 0,
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const SEG_COLOR = {
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

// ---------------------------------------------------------------------------
// DATA — one shared fictional company: Kestrel Labs (140-person platform
// company). Fixed snapshot: Wednesday Jul 29, 2026, 09:00 PT.
//
// Reconciliation (the split sums to the 140 active records everywhere):
//   137 verified & current
//   + 2 verified, flagged for correction (audit panel)
//   + 1 verified, reverification due (EAD expires Sep 30)
//   = 140 active I-9 records.
// The 2 in-flight hires pending Section 2 (Ava Lindqvist, Ken Tanaka) sit
// ON TOP of the 140 — they are never counted as active employees, matching
// every other Workforce Platform surface.
// ---------------------------------------------------------------------------

const SNAPSHOT_LABEL = 'Wed Jul 29, 2026 · 09:00 PT';
const ACTIVE_RECORDS = 140;
const VERIFIED_CURRENT = 137;
const FLAGGED_COUNT = 2;
const REVERIFICATION_DUE = 1;
const PENDING_SECTION2 = 2;

interface SummarySegment {
  id: string;
  label: string;
  count: number;
  color: string;
}

/** Segmented completion bar over the 140 active records. */
const SUMMARY_SEGMENTS: SummarySegment[] = [
  {
    id: 'verified',
    label: 'Verified & current',
    count: VERIFIED_CURRENT,
    color: SEG_COLOR.green,
  },
  {
    id: 'flagged',
    label: 'Flagged for correction',
    count: FLAGGED_COUNT,
    color: SEG_COLOR.orange,
  },
  {
    id: 'reverify',
    label: 'Reverification due',
    count: REVERIFICATION_DUE,
    color: SEG_COLOR.purple,
  },
];

// ---------------------------------------------------------------------------
// PENDING SECTION 2 QUEUE — the two in-flight hires. Section 2 must be
// completed within 3 business days of the first day of work:
//   Ava started Mon Jul 27  → due Thu Jul 30 → 1 business day left (URGENT)
//   Ken starts  Mon Aug 3   → due Thu Aug 6  → not started (remote flow)
// ---------------------------------------------------------------------------

type DocList = 'A' | 'B' | 'C';

interface AcceptableDoc {
  id: string;
  list: DocList;
  name: string;
  note: string;
}

// Compact fixture rows: [id, list, name, note]
type DocSpec = [string, DocList, string, string];

// prettier-ignore — hand-packed fixture tuples, matching suite style.
const DOC_SPECS: DocSpec[] = [
  // ---- List A — one document proves identity + authorization ----
  ['a-passport', 'A', 'U.S. passport or passport card',
    'Identity + employment authorization'],
  ['a-i551', 'A', 'Permanent Resident Card (Form I-551)',
    'Identity + employment authorization'],
  ['a-i766', 'A', 'Employment Authorization Document (Form I-766)',
    'Identity + employment authorization'],
  // ---- List B — identity only ----
  ['b-license', 'B', 'State driver’s license or ID card',
    'Identity only — must show photo'],
  ['b-school', 'B', 'School ID card with photograph', 'Identity only'],
  // ---- List C — employment authorization only ----
  ['c-ssn', 'C', 'Social Security card (unrestricted)',
    'Employment authorization only'],
  ['c-birth', 'C', 'Certified U.S. birth certificate',
    'Employment authorization only'],
];

/**
 * Acceptable-document catalog rendered as the two combo columns: ONE
 * List A document, OR one List B + one List C document.
 */
const ALL_DOCS: AcceptableDoc[] = DOC_SPECS.map(([id, list, name, note]) => ({
  id,
  list,
  name,
  note,
}));
const LIST_A_DOCS = ALL_DOCS.filter(doc => doc.list === 'A');
const LIST_B_DOCS = ALL_DOCS.filter(doc => doc.list === 'B');
const LIST_C_DOCS = ALL_DOCS.filter(doc => doc.list === 'C');

const DOC_BY_ID = new Map<string, AcceptableDoc>(
  ALL_DOCS.map(doc => [doc.id, doc]),
);

type Urgency = 'urgent' | 'warn' | 'neutral';

interface PendingHire {
  id: string;
  name: string;
  role: string;
  department: string;
  office: 'SF HQ' | 'Remote-US';
  startLabel: string;
  section1: {done: boolean; detail: string};
  /** Section 2 deadline — fixed countdown vs the Jul 29 snapshot. */
  deadlineLabel: string;
  countdown: string;
  urgency: Urgency;
  verifier: string;
  /** Doc combo the employee indicated on Section 1 ('A' or 'BC'). */
  indicatedCombo: 'A' | 'BC';
  indicatedNote: string;
  /** Docs pre-checked as already examined at the snapshot. */
  examinedDocIds: string[];
}

const PENDING_HIRES: PendingHire[] = [
  {
    id: 'hire-ava',
    name: 'Ava Lindqvist',
    role: 'Product Engineer',
    department: 'Engineering',
    office: 'SF HQ',
    startLabel: 'Started Mon Jul 27',
    section1: {done: true, detail: 'Completed Jul 27, 8:42 AM — day 1'},
    deadlineLabel: 'Due Thu Jul 30',
    countdown: '1 business day left',
    urgency: 'urgent',
    verifier: 'Dana Whitfield (People Ops)',
    indicatedCombo: 'A',
    indicatedNote:
      'Ava indicated List A on Section 1 — U.S. passport. Examine the ' +
      'original in person, then certify.',
    examinedDocIds: [],
  },
  {
    id: 'hire-ken',
    name: 'Ken Tanaka',
    role: 'Solutions Architect',
    department: 'GTM',
    office: 'Remote-US',
    startLabel: 'Starts Mon Aug 3',
    section1: {done: false, detail: 'Invite sent Jul 24 — opens day 1'},
    deadlineLabel: 'Due Thu Aug 6',
    countdown: 'Not started',
    urgency: 'neutral',
    verifier: 'Authorized representative (remote flow)',
    indicatedCombo: 'BC',
    indicatedNote:
      'Ken pre-indicated List B + C — Ohio driver’s license + Social ' +
      'Security card. The authorized representative examines both on Aug 3.',
    examinedDocIds: [],
  },
];

// ---------------------------------------------------------------------------
// REVERIFICATION — the single active-roster record with expiring work
// authorization. 90 days before Sep 30 is Jul 2 — the reminder chip and
// the 63-days-remaining countdown both reconcile with the Jul 29 snapshot.
// ---------------------------------------------------------------------------

const REVERIFICATION = {
  name: 'Yusuf Demir',
  role: 'Backend Engineer',
  department: 'Engineering',
  office: 'SF HQ',
  document: 'Employment Authorization Document (Form I-766)',
  expiresLabel: 'Wed Sep 30, 2026',
  daysRemaining: 63,
  reminderChip: '90-day reminder sent Jul 2',
  supplementNote: 'Reverify on Supplement B by Sep 30 — never re-run E-Verify',
  // prettier-ignore — hand-packed step rows, matching suite style.
  steps: [
    {id: 'rv-1', label: '90-day reminder sent', detail: 'Jul 2 · auto',
      done: true},
    {id: 'rv-2', label: 'Renewal receipt requested',
      detail: 'Jul 6 · Dana Whitfield', done: true},
    {id: 'rv-3', label: 'EAD renewal receipt on file',
      detail: 'Pending from Yusuf', done: false},
    {id: 'rv-4', label: 'Supplement B recorded', detail: 'Due Sep 30',
      done: false},
  ],
} as const;

// ---------------------------------------------------------------------------
// E-VERIFY CASES — July 2026 cases for employer ID 1339642. A case can
// only be created after Section 2, so Ava's sits in Draft until her
// documents are examined; Ken has no case yet.
// ---------------------------------------------------------------------------

type CaseStatus = 'draft' | 'submitted' | 'authorized';

interface EverifyCase {
  id: string;
  caseNumber: string;
  employee: string;
  role: string;
  submittedLabel: string;
  status: CaseStatus;
  statusDetail: string;
  isOpen: boolean;
}

// Compact fixture rows: [id, caseNumber, employee, role, submittedLabel,
// status, statusDetail, isOpen]
type CaseSpec = [
  string,
  string,
  string,
  string,
  string,
  CaseStatus,
  string,
  boolean,
];

// prettier-ignore — hand-packed fixture tuples, matching suite style.
const CASE_SPECS: CaseSpec[] = [
  // Status details stay short — the Status column is ~250px beside the
  // audit panel and the badge already names the status.
  ['ev-ava', '2026-1893-45210', 'Ava Lindqvist', 'Product Engineer', '—',
    'draft', 'Awaiting Section 2 · due Jul 30', true],
  ['ev-rivera', '2026-1874-98031', 'Tomás Rivera', 'Support Engineer',
    'Jul 28, 2026', 'submitted', 'SSA check in progress', true],
  ['ev-osei', '2026-1861-22475', 'Nadia Osei', 'Revenue Ops Analyst',
    'Jul 14, 2026', 'authorized', 'Closed Jul 21', false],
  ['ev-brant', '2026-1855-10388', 'Cole Brant', 'Security Engineer',
    'Jul 7, 2026', 'authorized', 'Closed Jul 9', false],
];

// prettier-ignore
const EVERIFY_CASES: EverifyCase[] = CASE_SPECS.map(
  ([id, caseNumber, employee, role, submittedLabel, status, statusDetail,
    isOpen]) => ({
    id, caseNumber, employee, role, submittedLabel, status, statusDetail,
    isOpen,
  }),
);

const CASE_STATUS_META: Record<
  CaseStatus,
  {label: string; variant: 'neutral' | 'info' | 'success'}
> = {
  draft: {label: 'Draft', variant: 'neutral'},
  submitted: {label: 'Submitted', variant: 'info'},
  authorized: {label: 'Employment authorized', variant: 'success'},
};

type CaseFilter = 'all' | 'open' | 'closed';

// ---------------------------------------------------------------------------
// REMOTE VERIFICATION — Ken Tanaka's authorized-representative appointment.
// Kestrel is not enrolled in the E-Verify remote-examination alternative
// for this hire, so a rep completes Section 2 in person on Kestrel's
// behalf; Kestrel remains liable for the rep's errors.
// ---------------------------------------------------------------------------

const APPOINTMENT = {
  hire: 'Ken Tanaka',
  office: 'Remote-US · Columbus, OH',
  when: 'Mon Aug 3, 2026 · 2:00 PM ET',
  where: 'Notary office · 44 E Gay St, Suite 300, Columbus, OH',
  representative: 'Meredith Cole — commissioned notary public',
  documents: 'Ohio driver’s license (List B) + Social Security card (List C)',
  deadline: 'Rep must return the signed Section 2 by Thu Aug 6',
  // prettier-ignore — hand-packed step rows, matching suite style.
  steps: [
    {id: 'ap-1', label: 'Rep packet sent',
      detail: 'Jul 24 · instructions + blank Supplement A', done: true},
    {id: 'ap-2', label: 'Representative confirmed',
      detail: 'Jul 28 · Meredith Cole accepted', done: true},
    {id: 'ap-3', label: 'In-person examination',
      detail: 'Aug 3 · 2:00 PM ET appointment', done: false},
    {id: 'ap-4', label: 'Section 2 returned & filed',
      detail: 'Due Aug 6 · countersigned upload', done: false},
  ],
} as const;

// ---------------------------------------------------------------------------
// AUDIT READINESS — retention rule, purge queue, and the 2 active files
// flagged for correction (the same 2 the summary bar carves out of 140).
// ---------------------------------------------------------------------------

interface FlaggedFile {
  id: string;
  name: string;
  role: string;
  issue: string;
  fix: string;
  owner: string;
  dueLabel: string;
}

// Compact fixture rows: [id, name, role, issue, fix]. Owner and due date
// are shared — the Jun 15 internal audit assigned both to Dana Whitfield.
type FlagSpec = [string, string, string, string, string];

// prettier-ignore — hand-packed fixture tuples, matching suite style.
const FLAG_SPECS: FlagSpec[] = [
  ['flag-fuentes', 'Diego Fuentes', 'Sales Engineer · GTM',
    'Section 2 List B entry is missing the issuing authority.',
    'Annotate the original — enter “CA DMV”, initial and date.'],
  ['flag-haddad', 'Omar Haddad', 'Ops lead · Ops',
    'Section 1 signature is dated two days after the first day of work.',
    'Attach a signed correction memo; never backdate the form.'],
];

const FLAGGED_FILES: FlaggedFile[] = FLAG_SPECS.map(
  ([id, name, role, issue, fix]) => ({
    id,
    name,
    role,
    issue,
    fix,
    owner: 'Dana Whitfield',
    dueLabel: 'Correct by Aug 7',
  }),
);

interface PurgeRecord {
  id: string;
  name: string;
  detail: string;
  purgeLabel: string;
}

/**
 * Retention: 3 years after hire OR 1 year after termination — whichever
 * is LATER. These three archived records clear both prongs before the
 * next purge run (Sat Aug 1, 2026).
 */
// prettier-ignore — hand-packed fixture tuples, matching suite style.
// Detail lines stay under ~30 chars — the 340px panel leaves ~180px for
// them beside the eligibility token.
const PURGE_QUEUE: PurgeRecord[] = [
  ['purge-calloway', 'Rhea Calloway',
    'Hired Mar 2021 · left Jun 2025', 'Eligible Jul 1'],
  ['purge-otieno', 'Brian Otieno',
    'Hired Jan 2022 · left Jul 2025', 'Eligible Jul 13'],
  ['purge-marsh', 'Kelly Marsh',
    'Hired Sep 2020 · left Jul 2025', 'Eligible Jul 26'],
].map(([id, name, detail, purgeLabel]) => ({id, name, detail, purgeLabel}));

const AUDIT_META = {
  archivedRecords: 38,
  nextPurgeRun: 'Sat Aug 1, 2026 · 02:00 PT',
  lastInternalAudit: 'Jun 15, 2026 · Dana Whitfield',
  lastBinderExport: 'Jul 21, 2026 · PDF · 142 records',
  everifyEmployer: 'E-Verify employer ID 1339642 · enrolled 2021',
  /** Short form for the header chip — the full string overflows the
   * header row at desktop widths and clips under the export button. */
  everifyEmployerShort: 'E-Verify ID 1339642',
} as const;

// ---------------------------------------------------------------------------
// SMALL HELPERS
// ---------------------------------------------------------------------------

const URGENCY_CHIP: Record<Urgency, CSSProperties> = {
  urgent: styles.chipUrgent,
  warn: styles.chipWarn,
  neutral: styles.chipNeutral,
};

/**
 * A List A doc alone certifies; otherwise one List B AND one List C.
 * Drives the Certify button enablement in the checklist.
 */
function comboSatisfied(examined: ReadonlySet<string>): boolean {
  let hasA = false;
  let hasB = false;
  let hasC = false;
  for (const id of examined) {
    const doc = DOC_BY_ID.get(id);
    if (doc === undefined) {
      continue;
    }
    hasA = hasA || doc.list === 'A';
    hasB = hasB || doc.list === 'B';
    hasC = hasC || doc.list === 'C';
  }
  return hasA || (hasB && hasC);
}

// ---------------------------------------------------------------------------
// SECTION HEADING
// ---------------------------------------------------------------------------

function SectionHeading({
  icon,
  title,
  aside,
}: {
  icon: typeof ShieldCheckIcon;
  title: string;
  aside?: ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
      <Icon icon={icon} size="sm" color="secondary" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <Heading level={2}>{title}</Heading>
      </StackItem>
      {aside}
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// SUMMARY STRIP — segmented 140-record bar + stat tiles. The tile counts
// and the bar segments read the same constants, so they cannot drift.
// ---------------------------------------------------------------------------

function SummaryStrip({isCompact}: {isCompact: boolean}) {
  const tiles = [
    {
      id: 'verified',
      label: 'Verified & current',
      value: VERIFIED_CURRENT,
      note: `of ${ACTIVE_RECORDS} active records`,
      dot: 'success' as const,
    },
    {
      id: 'pending',
      label: 'Pending Section 2',
      value: PENDING_SECTION2,
      note: 'in-flight new hires',
      dot: 'accent' as const,
    },
    {
      id: 'reverify',
      label: 'Reverification due',
      value: REVERIFICATION_DUE,
      note: 'EAD expires Sep 30',
      dot: 'warning' as const,
    },
    {
      // 'Flagged for correction' truncates in the 4-up tile at desktop
      // widths — the legend and audit panel carry the full phrase.
      id: 'flagged',
      label: 'Flagged records',
      value: FLAGGED_COUNT,
      note: 'audit sweep · due Aug 7',
      dot: 'error' as const,
    },
  ];

  return (
    <VStack gap={3} style={styles.sectionBlock}>
      <div
        style={{
          ...styles.statGrid,
          ...(isCompact ? styles.statGridCompact : null),
        }}>
        {tiles.map(tile => (
          <div key={tile.id} style={styles.statTile}>
            <HStack gap={2} vAlign="center">
              <StatusDot variant={tile.dot} label={tile.label} />
              <Text type="supporting" color="secondary" maxLines={1}>
                {tile.label}
              </Text>
            </HStack>
            <span style={styles.statValue}>{tile.value}</span>
            <Text type="supporting" color="secondary" maxLines={1}>
              {tile.note}
            </Text>
          </div>
        ))}
      </div>

      <VStack gap={2}>
        <div
          style={styles.segBarTrack}
          role="img"
          aria-label={`Active I-9 records: ${SUMMARY_SEGMENTS.map(
            segment => `${segment.count} ${segment.label.toLowerCase()}`,
          ).join(', ')} of ${ACTIVE_RECORDS}`}>
          {SUMMARY_SEGMENTS.map(segment => (
            <div
              key={segment.id}
              style={{
                ...styles.segBarSeg,
                width: `${(segment.count / ACTIVE_RECORDS) * 100}%`,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>
        <HStack gap={4} vAlign="center" style={{flexWrap: 'wrap'}}>
          {SUMMARY_SEGMENTS.map(segment => (
            <HStack key={segment.id} gap={2} vAlign="center">
              <span
                style={{
                  ...styles.legendSwatch,
                  backgroundColor: segment.color,
                }}
              />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {segment.label} · {segment.count}
              </Text>
            </HStack>
          ))}
          <StackItem size="fill" style={{minWidth: 0}}>
            <Text
              type="supporting"
              color="secondary"
              hasTabularNumbers
              style={{textAlign: 'end'}}>
              {ACTIVE_RECORDS} active · {PENDING_SECTION2} in-flight hires
              pending
            </Text>
          </StackItem>
        </HStack>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// DOCUMENT CHECKLIST — the two acceptable-combo columns. Column 1 is
// List A (one document does both jobs); column 2 is List B + List C
// together. The column matching the hire's Section 1 indication carries
// the accent outline.
// ---------------------------------------------------------------------------

function DocRow({
  doc,
  isExamined,
  onToggle,
}: {
  doc: AcceptableDoc;
  isExamined: boolean;
  onToggle: (docId: string, checked: boolean) => void;
}) {
  return (
    <div style={styles.docRow}>
      <CheckboxInput
        label={`${doc.name} — examined in person`}
        isLabelHidden
        value={isExamined}
        onChange={checked => onToggle(doc.id, checked)}
      />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Text type="label" maxLines={2}>
            {doc.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {doc.note}
          </Text>
        </VStack>
      </StackItem>
      {isExamined ? <Icon icon={CheckIcon} size="sm" color="success" /> : null}
    </div>
  );
}

function ComboColumn({
  title,
  subtitle,
  docs,
  isIndicated,
  examined,
  onToggle,
}: {
  title: string;
  subtitle: string;
  docs: AcceptableDoc[];
  isIndicated: boolean;
  examined: ReadonlySet<string>;
  onToggle: (docId: string, checked: boolean) => void;
}) {
  return (
    <div
      style={{
        ...styles.comboCol,
        ...(isIndicated ? styles.comboColIndicated : null),
      }}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="label" maxLines={1}>
            {title}
          </Text>
        </StackItem>
        {isIndicated ? (
          <Token size="sm" color="blue" label="Employee indicated" />
        ) : null}
      </HStack>
      <Text type="supporting" color="secondary">
        {subtitle}
      </Text>
      <Divider />
      <VStack gap={1}>
        {docs.map(doc => (
          <DocRow
            key={doc.id}
            doc={doc}
            isExamined={examined.has(doc.id)}
            onToggle={onToggle}
          />
        ))}
      </VStack>
    </div>
  );
}

function DocChecklist({
  hire,
  examined,
  isCertified,
  isCompact,
  onToggle,
  onCertify,
}: {
  hire: PendingHire;
  examined: ReadonlySet<string>;
  isCertified: boolean;
  isCompact: boolean;
  onToggle: (docId: string, checked: boolean) => void;
  onCertify: () => void;
}) {
  const canCertify = comboSatisfied(examined) && !isCertified;

  return (
    <div style={styles.checklistWrap}>
      <VStack gap={3}>
        <Text type="body" size="sm" color="secondary">
          {hire.indicatedNote}
        </Text>

        <div
          style={{
            ...styles.comboGrid,
            ...(isCompact ? styles.comboGridCompact : null),
          }}>
          <ComboColumn
            title="List A — one document"
            subtitle="Proves identity and employment authorization together."
            docs={LIST_A_DOCS}
            isIndicated={hire.indicatedCombo === 'A'}
            examined={examined}
            onToggle={onToggle}
          />
          {isCompact ? null : <div style={styles.comboOr}>OR</div>}
          <ComboColumn
            title="List B + List C — one of each"
            subtitle="One identity document plus one work-authorization document."
            docs={[...LIST_B_DOCS, ...LIST_C_DOCS]}
            isIndicated={hire.indicatedCombo === 'BC'}
            examined={examined}
            onToggle={onToggle}
          />
        </div>

        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <Button
            label={isCertified ? 'Section 2 certified' : 'Certify Section 2'}
            variant="primary"
            size="sm"
            isDisabled={!canCertify}
            icon={
              <Icon
                icon={isCertified ? BadgeCheckIcon : StampIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={onCertify}
          />
          <Text type="supporting" color="secondary">
            {isCertified
              ? 'Recorded to the I-9 file — E-Verify case unblocked.'
              : 'Enabled once one List A doc — or one List B and one List C — is examined.'}
          </Text>
        </HStack>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PENDING SECTION 2 QUEUE
// ---------------------------------------------------------------------------

function PendingHireRow({
  hire,
  isSelected,
  isCertified,
  examined,
  isCompact,
  onSelect,
  onToggleDoc,
  onCertify,
}: {
  hire: PendingHire;
  isSelected: boolean;
  isCertified: boolean;
  examined: ReadonlySet<string>;
  isCompact: boolean;
  onSelect: (hireId: string) => void;
  onToggleDoc: (hireId: string, docId: string, checked: boolean) => void;
  onCertify: (hireId: string) => void;
}) {
  const chipStyle = isCertified ? styles.chipClear : URGENCY_CHIP[hire.urgency];
  const chipLabel = isCertified
    ? 'Section 2 certified'
    : `${hire.deadlineLabel} · ${hire.countdown}`;

  return (
    <div
      style={{
        ...styles.queueRow,
        ...(isSelected ? styles.queueRowSelected : null),
      }}>
      <button
        type="button"
        style={styles.queueRowButton}
        aria-expanded={isSelected}
        onClick={() => onSelect(hire.id)}>
        <Avatar name={hire.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {hire.name}
            </Text>
            {/* Two lines: the badge + deadline chip squeeze this block to
                ~220px at desktop — one line truncates mid-word, and a
                free wrap strands a "·" at the start of line 2. */}
            <Text type="supporting" color="secondary" maxLines={1}>
              {hire.role} · {hire.department} · {hire.office}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {hire.startLabel}
            </Text>
          </VStack>
        </StackItem>
        {isCompact ? null : (
          <HStack gap={2} vAlign="center">
            {hire.section1.done ? (
              <Badge
                variant="success"
                label="Section 1 complete"
                icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
              />
            ) : (
              <Badge variant="neutral" label="Section 1 pending" />
            )}
          </HStack>
        )}
        <span style={{...styles.deadlineChip, ...chipStyle}}>
          <Icon icon={CalendarClockIcon} size="xsm" color="inherit" />
          {chipLabel}
        </span>
      </button>

      {isSelected ? (
        <VStack gap={0}>
          <div style={{paddingInline: 'var(--spacing-3)'}}>
            <Divider />
          </div>
          <HStack
            gap={4}
            vAlign="center"
            style={{
              flexWrap: 'wrap',
              padding: 'var(--spacing-2) var(--spacing-3)',
            }}>
            <Text type="supporting" color="secondary" maxLines={1}>
              Section 1: {hire.section1.detail}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              Verifier: {hire.verifier}
            </Text>
          </HStack>
          <DocChecklist
            hire={hire}
            examined={examined}
            isCertified={isCertified}
            isCompact={isCompact}
            onToggle={(docId, checked) => onToggleDoc(hire.id, docId, checked)}
            onCertify={() => onCertify(hire.id)}
          />
        </VStack>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// REVERIFICATION
// ---------------------------------------------------------------------------

function ReverificationRow({
  isNudged,
  onNudge,
}: {
  isNudged: boolean;
  onNudge: () => void;
}) {
  return (
    <div style={styles.reverifRow}>
      <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Avatar name={REVERIFICATION.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {REVERIFICATION.name}
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {REVERIFICATION.role} · {REVERIFICATION.department} ·{' '}
              {REVERIFICATION.office}
            </Text>
          </VStack>
        </StackItem>
        <span style={styles.reminderChip}>
          <Icon icon={SendIcon} size="xsm" color="inherit" />
          {REVERIFICATION.reminderChip}
        </span>
        <span style={{...styles.deadlineChip, ...styles.chipWarn}}>
          <Icon icon={CalendarClockIcon} size="xsm" color="inherit" />
          Expires {REVERIFICATION.expiresLabel} · {REVERIFICATION.daysRemaining}{' '}
          days
        </span>
      </HStack>

      <HStack gap={4} vAlign="center" style={{flexWrap: 'wrap'}}>
        <HStack gap={2} vAlign="center">
          <Icon icon={IdCardIcon} size="sm" color="secondary" />
          <Text type="body" size="sm" maxLines={1}>
            {REVERIFICATION.document}
          </Text>
        </HStack>
        <Badge variant="warning" label="Supplement B required" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {REVERIFICATION.supplementNote}
        </Text>
      </HStack>

      <Divider />

      <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
        <StackItem size="fill" style={{minWidth: 0}}>
          <div style={styles.reverifSteps}>
            {REVERIFICATION.steps.map(step => (
              <HStack key={step.id} gap={2} vAlign="center">
                <StatusDot
                  variant={step.done ? 'success' : 'neutral'}
                  label={step.done ? 'Done' : 'Pending'}
                />
                <VStack gap={0}>
                  <Text type="label" maxLines={1}>
                    {step.label}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {step.detail}
                  </Text>
                </VStack>
              </HStack>
            ))}
          </div>
        </StackItem>
        <Button
          label={isNudged ? 'Receipt requested' : 'Request receipt again'}
          variant="secondary"
          size="sm"
          isDisabled={isNudged}
          icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
          onClick={onNudge}
        />
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// E-VERIFY CASES
// ---------------------------------------------------------------------------

function EverifyTable({
  filter,
  isCompact,
}: {
  filter: CaseFilter;
  isCompact: boolean;
}) {
  const rows = EVERIFY_CASES.filter(row =>
    filter === 'all' ? true : filter === 'open' ? row.isOpen : !row.isOpen,
  );

  return (
    <div style={styles.tableWrap}>
      <Table
        density="balanced"
        dividers="rows"
        hasHover
        tableProps={{
          'aria-label': 'E-Verify cases — July 2026, employer ID 1339642',
        }}>
        <TableHeader>
          <TableRow isHeaderRow>
            <TableHeaderCell scope="col" style={{width: 150, minWidth: 150}}>
              Case number
            </TableHeaderCell>
            <TableHeaderCell scope="col" style={{minWidth: 160}}>
              Employee
            </TableHeaderCell>
            {isCompact ? null : (
              <TableHeaderCell
                scope="col"
                style={{width: 100, minWidth: 100, textAlign: 'end'}}>
                Submitted
              </TableHeaderCell>
            )}
            <TableHeaderCell scope="col" style={{minWidth: 220}}>
              Status
            </TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(row => {
            const meta = CASE_STATUS_META[row.status];
            return (
              <TableRow key={row.id}>
                <TableCell>
                  <span style={styles.caseNumber}>{row.caseNumber}</span>
                </TableCell>
                <TableCell>
                  <VStack gap={0}>
                    <Text type="label" maxLines={1}>
                      {row.employee}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {row.role}
                    </Text>
                  </VStack>
                </TableCell>
                {isCompact ? null : (
                  <TableCell>
                    <span style={{...styles.numericCell, display: 'block'}}>
                      {row.submittedLabel}
                    </span>
                  </TableCell>
                )}
                <TableCell>
                  <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
                    <Badge variant={meta.variant} label={meta.label} />
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {row.statusDetail}
                    </Text>
                  </HStack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REMOTE VERIFICATION — authorized-representative appointment card
// ---------------------------------------------------------------------------

function AppointmentSteps() {
  return (
    <VStack gap={0}>
      {APPOINTMENT.steps.map((step, index) => (
        <HStack key={step.id} gap={3}>
          <div style={styles.stepDotCol}>
            <StatusDot
              variant={step.done ? 'success' : 'neutral'}
              label={step.done ? 'Done' : 'Pending'}
            />
            {index < APPOINTMENT.steps.length - 1 ? (
              <div style={styles.stepConnector} />
            ) : null}
          </div>
          <VStack gap={0} style={{paddingBottom: 'var(--spacing-3)'}}>
            <Text type="label" maxLines={1}>
              {step.label}
            </Text>
            <Text type="supporting" color="secondary" maxLines={2}>
              {step.detail}
            </Text>
          </VStack>
        </HStack>
      ))}
    </VStack>
  );
}

function AppointmentCard({isCompact}: {isCompact: boolean}) {
  return (
    <div style={styles.appointmentCard}>
      <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
        <Avatar name={APPOINTMENT.hire} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {APPOINTMENT.hire} — authorized representative flow
            </Text>
            <Text type="supporting" color="secondary" maxLines={1}>
              {APPOINTMENT.office}
            </Text>
          </VStack>
        </StackItem>
        <Badge variant="info" label="Appointment scheduled" />
      </HStack>

      <div
        style={{
          ...styles.appointmentGrid,
          ...(isCompact ? styles.appointmentGridCompact : null),
        }}>
        <MetadataList columns={1} label={{position: 'start', width: 108}}>
          <MetadataListItem label="When">
            <Text type="body" size="sm">
              {APPOINTMENT.when}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Where">
            <HStack gap={1} vAlign="center">
              <Icon icon={MapPinIcon} size="xsm" color="secondary" />
              <Text type="body" size="sm" maxLines={2}>
                {APPOINTMENT.where}
              </Text>
            </HStack>
          </MetadataListItem>
          <MetadataListItem label="Representative">
            <Text type="body" size="sm" maxLines={2}>
              {APPOINTMENT.representative}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Documents">
            <Text type="body" size="sm" maxLines={2}>
              {APPOINTMENT.documents}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Deadline">
            <Text type="body" size="sm" maxLines={2}>
              {APPOINTMENT.deadline}
            </Text>
          </MetadataListItem>
        </MetadataList>
        <AppointmentSteps />
      </div>

      <div style={styles.complianceNote}>
        <Icon icon={AlertTriangleIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          Anyone may act as the representative, but Kestrel Labs remains liable
          for any errors or omissions the representative makes on Section 2.
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AUDIT READINESS — rendered in the 340px end panel (wide) or inline at
// the bottom of the content column (narrow).
// ---------------------------------------------------------------------------

function AuditReadiness({
  acknowledged,
  onAcknowledge,
}: {
  acknowledged: ReadonlySet<string>;
  onAcknowledge: (fileId: string) => void;
}) {
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <SectionHeading icon={ArchiveIcon} title="Retention" />
        <Text type="body" size="sm" color="secondary">
          Keep each Form I-9 for 3 years after the hire date or 1 year after
          termination — whichever is later. Store separately from personnel
          files.
        </Text>
        <MetadataList columns={1} label={{position: 'start', width: 118}}>
          <MetadataListItem label="Active records">
            <Text type="body" size="sm" hasTabularNumbers>
              {ACTIVE_RECORDS} + {PENDING_SECTION2} in-flight
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Archived">
            <Text type="body" size="sm" hasTabularNumbers>
              {AUDIT_META.archivedRecords} terminated-employee records
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Next purge run">
            <Text type="body" size="sm">
              {AUDIT_META.nextPurgeRun}
            </Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>

      <VStack gap={1}>
        <Text type="label" color="secondary">
          Purge-eligible ({PURGE_QUEUE.length})
        </Text>
        {PURGE_QUEUE.map(record => (
          <div key={record.id} style={styles.purgeRow}>
            <Icon icon={FileTextIcon} size="sm" color="secondary" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {record.name}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {record.detail}
                </Text>
              </VStack>
            </StackItem>
            <span style={{flexShrink: 0}}>
              <Token size="sm" color="gray" label={record.purgeLabel} />
            </span>
          </div>
        ))}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <SectionHeading
          icon={FileWarningIcon}
          title="Flagged for correction"
          aside={
            <Badge variant="warning" label={`${FLAGGED_FILES.length} files`} />
          }
        />
        {FLAGGED_FILES.map(file => {
          const isAcknowledged = acknowledged.has(file.id);
          return (
            <div key={file.id} style={styles.flaggedRow}>
              <HStack gap={2} vAlign="center">
                <Avatar name={file.name} size="small" />
                <StackItem size="fill" style={{minWidth: 0}}>
                  <VStack gap={0}>
                    <Text type="label" maxLines={1}>
                      {file.name}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {file.role}
                    </Text>
                  </VStack>
                </StackItem>
                <Token size="sm" color="yellow" label={file.dueLabel} />
              </HStack>
              <div style={styles.flaggedIssue}>
                <Icon icon={AlertTriangleIcon} size="xsm" color="warning" />
                <VStack gap={1}>
                  <Text type="supporting">{file.issue}</Text>
                  <Text type="supporting" color="secondary">
                    Fix: {file.fix}
                  </Text>
                </VStack>
              </div>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    Owner: {file.owner}
                  </Text>
                </StackItem>
                {/* No icon — the 340px panel row needs the width so the
                    owner text beside it does not truncate. */}
                <Button
                  label={
                    isAcknowledged ? 'Correction started' : 'Start correction'
                  }
                  variant="secondary"
                  size="sm"
                  isDisabled={isAcknowledged}
                  onClick={() => onAcknowledge(file.id)}
                />
              </HStack>
            </div>
          );
        })}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <SectionHeading icon={ShieldCheckIcon} title="Audit trail" />
        <MetadataList columns={1} label={{position: 'start', width: 118}}>
          <MetadataListItem label="Last internal audit">
            <Text type="body" size="sm">
              {AUDIT_META.lastInternalAudit}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Last binder export">
            <Text type="body" size="sm">
              {AUDIT_META.lastBinderExport}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="E-Verify">
            <Text type="body" size="sm">
              {AUDIT_META.everifyEmployer}
            </Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function I9ComplianceTemplate() {
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  // Ava is pre-selected — her day-3 deadline is the page's headline risk.
  const [selectedHireId, setSelectedHireId] = useState<string | null>(
    'hire-ava',
  );
  // Examined documents per hire (doc ids), and certified Section 2 hires.
  const [examinedByHire, setExaminedByHire] = useState<
    Record<string, string[]>
  >(() =>
    Object.fromEntries(
      PENDING_HIRES.map(hire => [hire.id, hire.examinedDocIds]),
    ),
  );
  const [certifiedHires, setCertifiedHires] = useState<string[]>([]);
  const [isReverifNudged, setIsReverifNudged] = useState(false);
  const [caseFilter, setCaseFilter] = useState<CaseFilter>('all');
  const [acknowledgedFlags, setAcknowledgedFlags] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');

  const certifiedSet = new Set(certifiedHires);
  const acknowledgedSet = new Set(acknowledgedFlags);
  const isAvaCertified = certifiedSet.has('hire-ava');

  const selectHire = (hireId: string) => {
    setSelectedHireId(current => (current === hireId ? null : hireId));
  };

  const toggleDoc = (hireId: string, docId: string, checked: boolean) => {
    setExaminedByHire(current => {
      const existing = current[hireId] ?? [];
      const next = checked
        ? [...existing, docId]
        : existing.filter(id => id !== docId);
      return {...current, [hireId]: next};
    });
  };

  const certify = (hireId: string) => {
    setCertifiedHires(current =>
      current.includes(hireId) ? current : [...current, hireId],
    );
    const hire = PENDING_HIRES.find(candidate => candidate.id === hireId);
    setAnnouncement(
      hire !== undefined
        ? `Section 2 certified for ${hire.name} — E-Verify case unblocked`
        : 'Section 2 certified',
    );
  };

  const nudgeReverification = () => {
    setIsReverifNudged(true);
    setAnnouncement(
      `Renewal-receipt request re-sent to ${REVERIFICATION.name}`,
    );
  };

  const acknowledgeFlag = (fileId: string) => {
    setAcknowledgedFlags(current =>
      current.includes(fileId) ? current : [...current, fileId],
    );
    setAnnouncement('Correction started — assigned to Dana Whitfield');
  };

  const openCaseCount = EVERIFY_CASES.filter(row => row.isOpen).length;

  const auditSection = (
    <AuditReadiness
      acknowledged={acknowledgedSet}
      onAcknowledge={acknowledgeFlag}
    />
  );

  // ----- header: title, snapshot note, E-Verify chip, binder export -------
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={FileCheck2Icon} size="md" color="secondary" />
          <Heading level={1}>I-9 &amp; Work Authorization</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · {ACTIVE_RECORDS} active records
          </Text>
        </HStack>
        <StackItem size="fill" style={{minWidth: 0}}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {/* Non-breaking phrases: the demo header wraps this line, and a
                free wrap splits "Section 2" across lines. */}
            Snapshot {SNAPSHOT_LABEL} ·{' '}
            {`${PENDING_SECTION2} pending Section 2`} ·{' '}
            {`${REVERIFICATION_DUE} reverification due`}
          </Text>
        </StackItem>
        {isCompact ? null : (
          <span style={styles.employerChip}>
            <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
            {AUDIT_META.everifyEmployerShort}
          </span>
        )}
        <VStack gap={0} hAlign="end" style={styles.headerNote}>
          <Button
            label="Export audit binder"
            variant="primary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
            onClick={() =>
              setAnnouncement('Audit binder export started — 142 records, PDF')
            }
          />
          <Text type="supporting" color="secondary" maxLines={1}>
            Last export {AUDIT_META.lastBinderExport}
          </Text>
        </VStack>
      </HStack>
    </LayoutHeader>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              <VStack gap={5}>
                <SummaryStrip isCompact={isCompact} />

                {isAvaCertified ? null : (
                  <Banner
                    status="warning"
                    icon={
                      <Icon
                        icon={AlertTriangleIcon}
                        size="sm"
                        color="inherit"
                      />
                    }
                    title="Ava Lindqvist’s Section 2 is due Thu Jul 30 — 1 business day left"
                    description="Federal rule: complete Section 2 within 3 business days of the first day of work (started Mon Jul 27). Examine her List A document and certify below, or the E-Verify case cannot be submitted."
                  />
                )}

                <Divider />

                {/* Pending Section 2 queue — select a row for the docs. */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <SectionHeading
                    icon={UserCheckIcon}
                    title="Pending verification"
                    aside={
                      <Text type="supporting" color="secondary">
                        {PENDING_SECTION2} hires · select a row to open the
                        acceptable-document checklist
                      </Text>
                    }
                  />
                  <VStack gap={3}>
                    {PENDING_HIRES.map(hire => (
                      <PendingHireRow
                        key={hire.id}
                        hire={hire}
                        isSelected={selectedHireId === hire.id}
                        isCertified={certifiedSet.has(hire.id)}
                        examined={new Set(examinedByHire[hire.id] ?? [])}
                        isCompact={isCompact}
                        onSelect={selectHire}
                        onToggleDoc={toggleDoc}
                        onCertify={certify}
                      />
                    ))}
                  </VStack>
                </VStack>

                <Divider />

                {/* Reverification — the single expiring authorization. */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <SectionHeading
                    icon={IdCardIcon}
                    title="Reverification"
                    aside={
                      <Text type="supporting" color="secondary">
                        {REVERIFICATION_DUE} record · work authorization
                        expiring
                      </Text>
                    }
                  />
                  <ReverificationRow
                    isNudged={isReverifNudged}
                    onNudge={nudgeReverification}
                  />
                </VStack>

                <Divider />

                {/* E-Verify cases -------------------------------------- */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <SectionHeading
                    icon={BadgeCheckIcon}
                    title="E-Verify cases"
                    aside={
                      <HStack gap={3} vAlign="center">
                        <Text
                          type="supporting"
                          color="secondary"
                          hasTabularNumbers>
                          {openCaseCount} open · July 2026
                        </Text>
                        <SegmentedControl
                          label="Filter E-Verify cases"
                          value={caseFilter}
                          onChange={value => setCaseFilter(value as CaseFilter)}
                          size="sm">
                          <SegmentedControlItem label="All" value="all" />
                          <SegmentedControlItem label="Open" value="open" />
                          <SegmentedControlItem label="Closed" value="closed" />
                        </SegmentedControl>
                      </HStack>
                    }
                  />
                  <EverifyTable filter={caseFilter} isCompact={isCompact} />
                </VStack>

                <Divider />

                {/* Remote verification ---------------------------------- */}
                <VStack gap={3} style={styles.sectionBlock}>
                  <SectionHeading
                    icon={MapPinIcon}
                    title="Remote verification"
                    aside={
                      <Text type="supporting" color="secondary">
                        Authorized-representative flow
                      </Text>
                    }
                  />
                  <AppointmentCard isCompact={isCompact} />
                </VStack>

                {isPanelHidden ? (
                  <>
                    <Divider />
                    {auditSection}
                  </>
                ) : null}
              </VStack>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Audit readiness">
              <div style={styles.panelFill}>
                <div style={styles.panelScroll}>{auditSection}</div>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
