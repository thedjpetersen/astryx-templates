var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Casewright matter home for
 *   M-2417 "Kestrel Labs — Series C Financing" at Marlow & Voss LLP: fixed
 *   key dates (suite "now" anchor Wed Jul 15, 2026 — every countdown is a
 *   pre-computed string, never clock math), a four-item workstream
 *   checklist, six matter documents with AI summaries and version counts,
 *   the firm + client contact roster, July-to-date hours and budget
 *   figures, and a Casewright activity digest. No clocks, no randomness,
 *   no network media.
 * @output Matter Workspace — the matter home a deal lawyer opens every
 *   morning: privilege banner + matter header (number, client chip,
 *   responsible partner, status, confidentiality tier), a key-dates strip
 *   with countdown chips (one urgent), a workstream checklist with owner
 *   avatars and a doc link, a six-row documents panel with status Tokens,
 *   expandable AI-summary chips and version counts, a signature-status
 *   strip that links out, a Casewright activity feed (research queries,
 *   doc reviews, a conflicts clearance — each AI row carrying disclosure,
 *   citation chips, and a verification Token), and an end panel with the
 *   matter team and a time & billing snapshot (hours-by-person bars,
 *   62% budget meter).
 * @position Page template; emitted by \`astryx template matter-workspace\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (privilege strip, matter header row, key-dates strip)
 *   | content (workstreams, documents, activity — one scroll column)
 *   | end panel 320 (matter team + time & billing, sticky, own scroll).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Workstream rows, document rows, and activity rows are styled
 *   divs on the content surface; the end panel is a LayoutPanel.
 * Color policy: token-pure chrome; ONE accent (the theme accent) for
 *   selection and links. Intentional literals: the Casewright AI-purple
 *   mark/wash, the urgent-date red wash, and the verification traffic
 *   colors — all \`light-dark()\` pairs; data-viz
 *   categorical tokens carry the repo-standard fallback pairs (the demo
 *   does not inject them). No scheme-locked surfaces on this page (the
 *   paper canvases live in the sibling document templates).
 *
 * Responsive contract:
 * - > 1200px: full frame with the sticky end panel.
 * - <= 1200px: the end panel drops; Team and Time & billing reflow into
 *   the main scroll column after Activity.
 * - <= 860px: the header rows and key-dates strip wrap (never clip);
 *   document rows swap from the 5-column grid to stacked two-line rows;
 *   version/updated columns fold into the meta line.
 * - Content column and end panel scroll independently (\`minHeight: 0\`
 *   down the flex chains); the privilege strip, matter header, and
 *   key-dates strip are pinned in the LayoutHeader.
 */

import {useState, type CSSProperties} from 'react';

import {
  ArrowUpRightIcon,
  Building2Icon,
  CalendarClockIcon,
  CheckIcon,
  CircleCheckBigIcon,
  CircleDashedIcon,
  FileTextIcon,
  FlagIcon,
  LandmarkIcon,
  LockIcon,
  PenLineIcon,
  ScaleIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
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
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Link} from '@astryxdesign/core/Link';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

const AI_ACCENT = 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const AI_SOFT = 'light-dark(rgba(107, 30, 253, 0.08), rgba(157, 107, 255, 0.16))';
const URGENT = 'light-dark(#DC2626, #F87171)';
const URGENT_SOFT = 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const BAR_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const BAR_PURPLE = AI_ACCENT;
const BAR_TEAL = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Privilege strip: pinned above the matter header, muted wash, never a
  // shouting Banner — persistent legal furniture, not an alert.
  privilegeStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  headerBlock: {padding: 'var(--spacing-3) var(--spacing-4) 0'},
  matterGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  matterNumber: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Header chip rows wrap instead of clipping (visual bar).
  chipRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  partnerChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInlineEnd: 4,
    whiteSpace: 'nowrap',
  },
  // Key-dates strip: one shared chip geometry so the five dates align on a
  // single baseline; wraps to extra rows below 860px instead of clipping.
  datesStrip: {
    display: 'flex',
    alignItems: 'stretch',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  dateChip: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    minWidth: 148,
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
  },
  dateChipUrgent: {
    borderColor: URGENT,
    backgroundColor: URGENT_SOFT,
  },
  dateChipLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  dateValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
    whiteSpace: 'nowrap',
  },
  urgentText: {color: URGENT},
  // Content column -------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 var(--spacing-4) var(--spacing-6)',
  },
  section: {paddingBlock: 'var(--spacing-4)'},
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    marginBottom: 'var(--spacing-3)',
  },
  // Workstream checklist rows.
  workRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-2) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
  },
  workGlyph: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  workDone: {color: OK_GREEN},
  workActive: {color: 'var(--color-accent)'},
  workRisk: {color: URGENT},
  workPending: {color: 'var(--color-text-secondary)'},
  // Documents grid: header row + six rows share one template so every
  // column lands on the same gridline. Compact swaps to stacked rows.
  docsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(200px, 1fr) 132px 120px 76px 104px',
    columnGap: 'var(--spacing-3)',
    alignItems: 'center',
  },
  docsHeaderCell: {paddingBlock: 'var(--spacing-1)'},
  docCell: {minWidth: 0, paddingBlock: 'var(--spacing-2)'},
  docCellNum: {
    paddingBlock: 'var(--spacing-2)',
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  docName: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  docRowRule: {gridColumn: '1 / -1'},
  // Expanded AI-summary strip under a document row: AI wash, disclosure
  // line, citation chips.
  docSummary: {
    gridColumn: '1 / -1',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    marginBottom: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: AI_SOFT,
  },
  docCompactRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    paddingBlock: 'var(--spacing-2)',
  },
  docSummaryCompact: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    marginBlock: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: AI_SOFT,
  },
  // Casewright sparkle mark — the suite's shared AI-disclosure treatment
  // (same soft-purple chip as meeting-notes-ai-card).
  aiMark: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 22,
    height: 22,
    flexShrink: 0,
    borderRadius: 7,
    backgroundColor: AI_SOFT,
    color: AI_ACCENT,
  },
  disclosureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: AI_ACCENT,
    whiteSpace: 'nowrap',
  },
  // Signature-status strip: chips LINK OUT to the signature tracker —
  // never an envelope builder on this surface.
  sigStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Activity feed rows.
  activityRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-3)',
  },
  activityBody: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6},
  activityMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  activityTime: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Verification chips share a flex row with wrapping prose — pin them
  // (footgun 18) so they never truncate against the note text.
  noShrink: {flexShrink: 0, whiteSpace: 'nowrap'},
  citeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  flagNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: 'var(--spacing-1) var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: URGENT_SOFT,
  },
  // End panel: sticky against the Layout's scroll context so team and
  // billing stay visible while the content column scrolls.
  panelSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  panelSection: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)'},
  personRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', minWidth: 0},
  // Hours-by-person bars: one shared px scale (fill = hours / max), labels
  // outside the track, right-aligned tabular figures.
  barTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  barFill: {height: '100%', borderRadius: 999},
  hoursValue: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    textAlign: 'end',
  },
};

// ---------------------------------------------------------------------------
// DATA — one shared fictional world: Casewright (legal AI platform) at
// Marlow & Voss LLP, matter M-2417 "Kestrel Labs — Series C Financing".
// Suite "now" anchor: Wednesday, July 15, 2026 — countdowns are fixed
// strings computed against that anchor, never against a clock. Signed-in
// user: Priya Khanna (senior associate, day-to-day on M-2417).
// ---------------------------------------------------------------------------

type VerificationState = 'verified' | 'unverified' | 'flagged';

interface Verification {
  state: VerificationState;
  label: string; // e.g. "Verified · R. Vega · Jul 15"
}

interface KeyDate {
  id: string;
  label: string;
  date: string;
  countdown: string;
  isUrgent?: boolean;
  note?: string;
}

const KEY_DATES: KeyDate[] = [
  {id: 'board', label: 'Board approval', date: 'Sat Jul 18', countdown: 'in 3 days'},
  {
    id: 'schedules',
    label: 'Disclosure schedules due',
    date: 'Mon Jul 20',
    countdown: 'in 5 days',
    isUrgent: true,
    note: 'At risk — client inputs outstanding',
  },
  {id: 'signing', label: 'SPA signing target', date: 'Fri Jul 24', countdown: 'in 9 days'},
  {id: 'charter', label: 'A&R Charter filing · Del. SoS', date: 'Thu Jul 30', countdown: 'in 15 days'},
  {id: 'close', label: 'First close', date: 'Fri Jul 31', countdown: 'in 16 days'},
];

type WorkStatus = 'done' | 'in-progress' | 'at-risk' | 'pending';

interface Workstream {
  id: string;
  title: string;
  status: WorkStatus;
  owners: string[];
  meta: string;
  docLink?: string;
}

const WORKSTREAMS: Workstream[] = [
  {
    id: 'term-sheet',
    title: 'Term sheet',
    status: 'done',
    owners: ['Eleanor Marlow'],
    meta: 'Signed with Meridian Growth Partners · Mon Jun 22',
  },
  {
    id: 'spa',
    title: 'SPA drafting',
    status: 'in-progress',
    owners: ['Priya Khanna'],
    meta: 'v3 circulated Mon Jul 13 · Meridian comments received Jul 14',
    docLink: 'Series C Preferred Stock Purchase Agreement — v3',
  },
  {
    id: 'schedules',
    title: 'Disclosure schedules',
    status: 'at-risk',
    owners: ['Priya Khanna', 'Elena Voss'],
    meta: 'Due Mon Jul 20 · 3 of 11 sections returned from the client data room',
  },
  {
    id: 'closing',
    title: 'Closing checklist',
    status: 'pending',
    owners: ['Eleanor Marlow', 'Priya Khanna'],
    meta: 'Opens after signing · officer certificates, secretary certificate, cross-receipts',
  },
];

const WORK_STATUS_META: Record<
  WorkStatus,
  {label: string; tokenColor: 'green' | 'blue' | 'red' | 'gray'}
> = {
  done: {label: 'Done', tokenColor: 'green'},
  'in-progress': {label: 'In progress', tokenColor: 'blue'},
  'at-risk': {label: 'At risk', tokenColor: 'red'},
  pending: {label: 'Pending', tokenColor: 'gray'},
};
type DocStatus = 'Draft' | 'With counterparty' | 'Out for signature' | 'Executed';

const DOC_STATUS_COLOR: Record<DocStatus, 'gray' | 'blue' | 'orange' | 'green'> = {
  Draft: 'gray',
  'With counterparty': 'blue',
  'Out for signature': 'orange',
  Executed: 'green',
};

interface MatterDoc {
  id: string;
  name: string;
  status: DocStatus;
  turn: string; // counterparty-turn number, e.g. "v3"
  versions: number; // saved versions in the doc store
  updated: string;
  owner: string;
  summary: string;
  cites: string[];
  verification: Verification;
}

const DOCUMENTS: MatterDoc[] = [
  {
    id: 'spa',
    name: 'Series C Preferred Stock Purchase Agreement',
    status: 'With counterparty',
    turn: 'v3',
    versions: 12,
    updated: 'Jul 14 · 4:41 PM',
    owner: 'Priya Khanna',
    summary:
      'Meridian turn adds a pay-to-play conversion trigger at § 2.3(b) and tightens the indemnity basket to 0.75% of the round.',
    cites: ['SPA v3 · § 2.3(b)', 'SPA v3 · p. 41'],
    verification: {state: 'unverified', label: 'Not yet checked against source'},
  },
  {
    id: 'schedules',
    name: 'Disclosure Schedules',
    status: 'Draft',
    turn: 'v1',
    versions: 4,
    updated: 'Jul 14 · 11:18 AM',
    owner: 'Priya Khanna',
    summary:
      'Request list drafted from SPA v3 Article III reps — 11 sections; 3 returned, IP and litigation sections outstanding.',
    cites: ['SPA v3 · Art. III'],
    verification: {state: 'unverified', label: 'Not yet checked against source'},
  },
  {
    id: 'coi',
    name: 'Amended & Restated Certificate of Incorporation',
    status: 'Draft',
    turn: 'v2',
    versions: 6,
    updated: 'Jul 13 · 5:02 PM',
    owner: 'Priya Khanna',
    summary:
      'Adds Series C preferences: 1x non-participating liquidation preference and broad-based weighted-average anti-dilution.',
    cites: ['A&R COI v2 · Art. IV(B)'],
    verification: {state: 'verified', label: 'Verified · R. Vega · Jul 14'},
  },
  {
    id: 'ira',
    name: 'Investor Rights Agreement',
    status: 'Draft',
    turn: 'v2',
    versions: 5,
    updated: 'Jul 13 · 3:37 PM',
    owner: 'Eleanor Marlow',
    summary:
      'Registration rights conformed to the Meridian form; information rights extend to holders of 25%+ of Series C.',
    cites: ['IRA v2 · § 3.1'],
    verification: {state: 'unverified', label: 'Not yet checked against source'},
  },
  {
    id: 'board-consent',
    name: 'Board Consent — Series C Approval',
    status: 'Out for signature',
    turn: 'v1',
    versions: 2,
    updated: 'Jul 12 · 9:20 AM',
    owner: 'Eleanor Marlow',
    summary:
      'Approves the financing, the A&R Charter filing, and an option-pool increase to 12% of fully diluted capital.',
    cites: ['Board consent v1 · p. 2'],
    verification: {state: 'unverified', label: 'Not yet checked against source'},
  },
  {
    id: 'term-sheet',
    name: 'Term Sheet — Meridian Growth Partners',
    status: 'Executed',
    turn: 'v4',
    versions: 9,
    updated: 'Jun 22 · 6:11 PM',
    owner: 'Eleanor Marlow',
    summary:
      '$85M at a $520M pre-money valuation; 1x preference, no participation; drag-along binds all preferred holders.',
    cites: ['Term sheet · § 6'],
    verification: {state: 'verified', label: 'Verified · R. Vega · Jun 23'},
  },
];

interface SignatureChip {
  id: string;
  label: string;
  detail: string;
}

// Signature STATUS only — chips deep-link to the signature tracker; the
// envelope wizard lives in \`esignature-envelope-flow\`, not here.
const SIGNATURE_CHIPS: SignatureChip[] = [
  {id: 'board', label: 'Board Consent — Series C Approval', detail: '3 of 5 signed'},
  {id: 'ts', label: 'Term Sheet — Meridian Growth Partners', detail: 'Completed Jun 22'},
];
interface ActivityEvent {
  id: string;
  time: string;
  kind: string;
  isAi: boolean;
  actor: string; // human actor (row author for human events; requesting lawyer for AI runs)
  text: string;
  cites: string[];
  confidence?: 'High confidence' | 'Medium confidence' | 'Low confidence';
  verification?: Verification;
  flagNote?: string;
  canVerify?: boolean;
}

// Cross-template continuity (§5.1): the retracted Renwick citation is the
// research copilot's flagged specimen; the Skylark § 9.2 flag is the
// contract review's top issue (9 · 4 · 1 counts match that surface); the
// Meridian conflicts hit is the intake queue's cleared candidate.
const ACTIVITY: ActivityEvent[] = [
  {
    id: 'research',
    time: 'Jul 15 · 9:42 AM',
    kind: 'Research query',
    isAi: true,
    actor: 'Priya Khanna',
    text:
      'Drafted a research memo for “Are drag-along provisions enforceable against non-signing junior preferred?” — 6 authorities cited.',
    cites: ['Calder Point Capital v. Ostrand Sys., 214 A.3d 887 (Del. Ch. 2021)'],
    confidence: 'Medium confidence',
    verification: {state: 'flagged', label: 'Flagged · 1 citation retracted'},
    flagNote:
      'Quoted language not found in Renwick Data Grp. v. Talvace, Inc., 388 F. Supp. 3d 512 — Casewright retracted the citation from the draft memo.',
  },
  {
    id: 'spa-review',
    time: 'Jul 15 · 8:55 AM',
    kind: 'Doc review',
    isAi: true,
    actor: 'Priya Khanna',
    text:
      'Triaged 9 Meridian comments on SPA v3 — 2 high materiality: the pay-to-play trigger and the indemnity basket.',
    cites: ['SPA v3 · § 2.3(b)', 'SPA v3 · § 8.2'],
    confidence: 'High confidence',
    verification: {state: 'unverified', label: 'Not yet checked against source'},
    canVerify: true,
  },
  {
    id: 'skylark',
    time: 'Jul 14 · 5:20 PM',
    kind: 'Contract review · M-2431',
    isAi: true,
    actor: 'David Chen',
    text:
      'Skylark Cloud MSA v4 review run — 9 issues · 4 verified · 1 flagged. Top issue: § 9.2 liability cap below the firm-playbook floor.',
    cites: ['Skylark MSA v4 · § 9.2 · Limitation of Liability'],
    confidence: 'High confidence',
    verification: {state: 'flagged', label: 'Flagged · below playbook floor'},
  },
  {
    id: 'conflicts',
    time: 'Jul 14 · 4:05 PM',
    kind: 'Conflicts search',
    isAi: true,
    actor: 'Ruth Vega',
    text:
      'Conflicts search for “Meridian Growth Partners” — 1 candidate from a prior adverse matter surfaced for human clearance.',
    cites: ['Intake C-0871 · match basis'],
    confidence: 'High confidence',
    verification: {state: 'verified', label: 'Cleared · R. Vega · Jul 14 · memo on file'},
  },
  {
    id: 'circulated',
    time: 'Jul 13 · 6:30 PM',
    kind: 'Document sent',
    isAi: false,
    actor: 'Priya Khanna',
    text: 'Circulated SPA v3 to Meridian Growth Partners and the Kestrel deal team.',
    cites: [],
  },
  {
    id: 'request-list',
    time: 'Jul 13 · 11:02 AM',
    kind: 'Drafting',
    isAi: true,
    actor: 'Priya Khanna',
    text:
      'Generated the disclosure-schedules request list from SPA v3 Article III representations — 11 sections.',
    cites: ['SPA v3 · Art. III'],
    confidence: 'High confidence',
    verification: {state: 'unverified', label: 'Not yet checked against source'},
    canVerify: true,
  },
];

interface Person {
  name: string;
  role: string;
  detail: string;
}

const FIRM_TEAM: Person[] = [
  {name: 'Eleanor Marlow', role: 'Partner', detail: 'Responsible partner'},
  {name: 'Priya Khanna', role: 'Senior associate', detail: 'Day-to-day'},
  {name: 'Ruth Vega', role: 'Knowledge lawyer', detail: 'Citations · conflicts'},
];

// Company omitted — these render under the "Client contacts" header and the
// 320 panel truncates longer role lines.
const CLIENT_TEAM: Person[] = [
  {name: 'Elena Voss', role: 'Finance lead', detail: 'Primary client contact'},
  {name: 'Tom Okonkwo', role: 'IT admin', detail: 'Data-room access'},
];

interface HoursRow {
  name: string;
  hours: number;
  color: string;
}

// Jul 1 – Jul 14 recorded time; 61.8 + 24.2 + 11.6 = 97.6 h. Budget meter:
// $210,800 of $340,000 fee estimate = 62%.
const HOURS: HoursRow[] = [
  {name: 'Priya Khanna', hours: 61.8, color: BAR_BLUE},
  {name: 'Eleanor Marlow', hours: 24.2, color: BAR_PURPLE},
  {name: 'Ruth Vega', hours: 11.6, color: BAR_TEAL},
];
const HOURS_MAX = 61.8;
const HOURS_TOTAL = '97.6';
const BUDGET_PCT = 62;
const BUDGET_LINE = '$210,800 of $340,000 fee estimate';
// ---------------------------------------------------------------------------
// SHARED TRUST-PATTERN PRIMITIVES — one visual vocabulary across the suite:
// sparkle disclosure, citation chips, and the verified/unverified/flagged
// traffic states (§5.2). AI output never self-verifies; verification labels
// always carry a human actor + date.
// ---------------------------------------------------------------------------

function AiMark() {
  return (
    <span style={styles.aiMark} aria-hidden>
      <Icon icon={SparklesIcon} size="sm" color="inherit" />
    </span>
  );
}

/** The suite-wide AI disclosure line — small, consistent, never buried. */
function DisclosureLine() {
  return (
    <span style={{...styles.disclosureRow, ...styles.noShrink}}>
      <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      <Text type="supporting" size="xsm" color="inherit">
        AI-generated · verify before relying
      </Text>
    </span>
  );
}

const VERIFY_TOKEN: Record<
  VerificationState,
  {color: 'green' | 'yellow' | 'red'; icon: typeof CheckIcon}
> = {
  verified: {color: 'green', icon: CheckIcon},
  unverified: {color: 'yellow', icon: CircleDashedIcon},
  flagged: {color: 'red', icon: FlagIcon},
};

function VerificationChip({verification}: {verification: Verification}) {
  const meta = VERIFY_TOKEN[verification.state];
  return (
    <span style={styles.noShrink}>
      <Token
        size="sm"
        color={meta.color}
        icon={<Icon icon={meta.icon} size="xsm" color="inherit" />}
        label={verification.label}
      />
    </span>
  );
}

/** Compact source-citation chip — every AI assertion carries at least one. */
function CitationChip({label}: {label: string}) {
  return (
    <span style={styles.noShrink}>
      <Token
        size="sm"
        color="gray"
        icon={<Icon icon={FileTextIcon} size="xsm" color="inherit" />}
        label={label}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// HEADER — privilege strip, matter identity row, key-dates strip
// ---------------------------------------------------------------------------

function PrivilegeStrip() {
  return (
    <div style={styles.privilegeStrip}>
      <Icon icon={LockIcon} size="xsm" color="secondary" />
      <Text type="supporting" size="xsm" color="secondary">
        Attorney-Client Privileged · Attorney Work Product — do not forward
      </Text>
      <span style={{flex: 1}} aria-hidden />
      <Text type="supporting" size="xsm" color="secondary">
        Access limited to the M-2417 matter team
      </Text>
    </div>
  );
}
function MatterHeader() {
  return (
    <div style={styles.headerBlock}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <span style={styles.matterGlyph} aria-hidden>
          <Icon icon={ScaleIcon} size="md" color="inherit" />
        </span>
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text type="supporting" size="sm" color="secondary" style={styles.matterNumber}>
                M-2417
              </Text>
              <Heading level={1}>Kestrel Labs — Series C Financing</Heading>
            </HStack>
            <div style={styles.chipRow}>
              <Token
                size="sm"
                color="default"
                icon={<Icon icon={Building2Icon} size="xsm" color="inherit" />}
                label="Kestrel Labs"
              />
              <span style={styles.partnerChip}>
                <Avatar name="Eleanor Marlow" size="tiny" />
                <Text type="supporting" size="xsm" color="secondary">
                  Eleanor Marlow · Responsible partner
                </Text>
              </span>
              <span style={styles.noShrink}>
                <StatusDot variant="success" label="Matter status: active" />
              </span>
              <Text type="supporting" size="xsm" color="secondary">
                Active
              </Text>
              <Token
                size="sm"
                color="purple"
                icon={<Icon icon={LockIcon} size="xsm" color="inherit" />}
                label="Confidentiality · Tier 2 — deal team only"
              />
            </div>
          </VStack>
        </StackItem>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Button
            label="Ask Casewright"
            variant="secondary"
            size="sm"
            icon={<Icon icon={SparklesIcon} size="sm" />}
          />
          <Button
            label="Open matter files"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowUpRightIcon} size="sm" />}
          />
        </HStack>
      </HStack>
    </div>
  );
}

function KeyDatesStrip() {
  return (
    <div style={styles.datesStrip} role="list" aria-label="Key dates">
      {KEY_DATES.map(d => (
        <div
          key={d.id}
          role="listitem"
          style={d.isUrgent ? {...styles.dateChip, ...styles.dateChipUrgent} : styles.dateChip}>
          <span style={styles.dateChipLabel}>
            <Icon
              icon={d.id === 'board' ? LandmarkIcon : d.id === 'signing' ? PenLineIcon : CalendarClockIcon}
              size="xsm"
              color={d.isUrgent ? 'inherit' : 'secondary'}
              style={d.isUrgent ? styles.urgentText : undefined}
            />
            <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
              {d.label}
            </Text>
          </span>
          <span style={styles.dateValueRow}>
            <Text type="label" size="sm" hasTabularNumbers>
              {d.date}
            </Text>
            <Text
              type="supporting"
              size="xsm"
              color={d.isUrgent ? 'inherit' : 'secondary'}
              style={d.isUrgent ? styles.urgentText : undefined}
              hasTabularNumbers>
              {d.countdown}
            </Text>
          </span>
          {d.note != null ? (
            <span style={{...styles.dateChipLabel, ...styles.urgentText}}>
              <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
              <Text type="supporting" size="xsm" color="inherit" maxLines={1}>
                {d.note}
              </Text>
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
// ---------------------------------------------------------------------------
// WORKSTREAMS — checklist rows with owner avatars; 1 of 4 complete
// ---------------------------------------------------------------------------

const WORK_GLYPH: Record<WorkStatus, {icon: typeof CheckIcon; style: CSSProperties}> = {
  done: {icon: CircleCheckBigIcon, style: styles.workDone},
  'in-progress': {icon: CircleDashedIcon, style: styles.workActive},
  'at-risk': {icon: TriangleAlertIcon, style: styles.workRisk},
  pending: {icon: CircleDashedIcon, style: styles.workPending},
};

function WorkstreamRow({stream}: {stream: Workstream}) {
  const glyph = WORK_GLYPH[stream.status];
  const meta = WORK_STATUS_META[stream.status];
  return (
    <div style={styles.workRow}>
      <span style={{...styles.workGlyph, ...glyph.style}} aria-hidden>
        <Icon icon={glyph.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Text type="label" size="sm">
              {stream.title}
            </Text>
            <span style={styles.noShrink}>
              <Token size="sm" color={meta.tokenColor} label={meta.label} />
            </span>
          </HStack>
          <Text type="supporting" size="xsm" color="secondary">
            {stream.meta}
          </Text>
          {stream.docLink != null ? (
            <span style={styles.docName}>
              <Icon icon={FileTextIcon} size="xsm" color="secondary" />
              <Link onClick={() => {}} size="xsm">
                {stream.docLink}
              </Link>
            </span>
          ) : null}
        </VStack>
      </StackItem>
      <Tooltip content={stream.owners.join(' · ')}>
        <span style={styles.noShrink}>
          <AvatarGroup size="small" aria-label={\`Owners: \${stream.owners.join(', ')}\`}>
            {stream.owners.map(name => (
              <Avatar key={name} name={name} />
            ))}
          </AvatarGroup>
        </span>
      </Tooltip>
    </div>
  );
}

function WorkstreamsSection() {
  return (
    <section style={styles.section} aria-label="Workstreams">
      <div style={styles.sectionHeader}>
        <Heading level={2}>Workstreams</Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          1 of 4 complete · signing target Fri Jul 24
        </Text>
      </div>
      <VStack gap={1}>
        {WORKSTREAMS.map((stream, i) => (
          <VStack key={stream.id} gap={1}>
            {i > 0 ? <Divider /> : null}
            <WorkstreamRow stream={stream} />
          </VStack>
        ))}
      </VStack>
    </section>
  );
}
// ---------------------------------------------------------------------------
// DOCUMENTS — six recent matter documents; AI-summary chips expand an
// AI-washed strip with the summary, citation chips, verification state,
// and the disclosure line. Signature chips LINK OUT to the tracker.
// ---------------------------------------------------------------------------

function DocSummaryStrip({doc, isCompact}: {doc: MatterDoc; isCompact: boolean}) {
  return (
    <div style={isCompact ? styles.docSummaryCompact : styles.docSummary}>
      <AiMark />
      <VStack gap={1}>
        <Text type="supporting" size="sm">
          {doc.summary}
        </Text>
        <div style={styles.citeRow}>
          {doc.cites.map(cite => (
            <CitationChip key={cite} label={cite} />
          ))}
          <VerificationChip verification={doc.verification} />
          <DisclosureLine />
        </div>
      </VStack>
    </div>
  );
}

interface DocumentsSectionProps {
  isCompact: boolean;
  openId: string | null;
  onToggle: (id: string) => void;
}

function DocumentsSection({isCompact, openId, onToggle}: DocumentsSectionProps) {
  return (
    <section style={styles.section} aria-label="Documents">
      <div style={styles.sectionHeader}>
        <Heading level={2}>Documents</Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          6 recent · 38 saved versions across the docket
        </Text>
      </div>
      {isCompact ? (
        <VStack gap={0}>
          {DOCUMENTS.map((doc, i) => (
            <VStack key={doc.id} gap={0}>
              {i > 0 ? <Divider /> : null}
              <div style={styles.docCompactRow}>
                <span style={styles.docName}>
                  <Icon icon={FileTextIcon} size="xsm" color="secondary" />
                  <Text type="label" size="sm" maxLines={1}>
                    {doc.name}
                  </Text>
                </span>
                <div style={styles.chipRow}>
                  <Token size="sm" color={DOC_STATUS_COLOR[doc.status]} label={doc.status} />
                  <Token
                    size="sm"
                    color="purple"
                    icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
                    label="AI summary"
                    onClick={() => onToggle(doc.id)}
                  />
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {doc.turn} · {doc.versions} versions · {doc.updated} · {doc.owner}
                  </Text>
                </div>
                {openId === doc.id ? <DocSummaryStrip doc={doc} isCompact /> : null}
              </div>
            </VStack>
          ))}
        </VStack>
      ) : (
        <div style={styles.docsGrid}>
          <div style={styles.docsHeaderCell}>
            <Text type="supporting" size="xsm" color="secondary">Document</Text>
          </div>
          <div style={styles.docsHeaderCell}>
            <Text type="supporting" size="xsm" color="secondary">Status</Text>
          </div>
          <div style={styles.docsHeaderCell}>
            <Text type="supporting" size="xsm" color="secondary">Casewright</Text>
          </div>
          <div style={{...styles.docsHeaderCell, textAlign: 'end'}}>
            <Text type="supporting" size="xsm" color="secondary">Versions</Text>
          </div>
          <div style={{...styles.docsHeaderCell, textAlign: 'end'}}>
            <Text type="supporting" size="xsm" color="secondary">Updated</Text>
          </div>
          {DOCUMENTS.map(doc => (
            <DocGridRow
              key={doc.id}
              doc={doc}
              isOpen={openId === doc.id}
              onToggle={() => onToggle(doc.id)}
            />
          ))}
        </div>
      )}
      <div style={{...styles.sigStrip, marginTop: 'var(--spacing-3)'}}>
        <Icon icon={PenLineIcon} size="xsm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">
          Signatures
        </Text>
        {SIGNATURE_CHIPS.map(chip => (
          <span key={chip.id} style={styles.noShrink}>
            <Token
              size="sm"
              color={chip.detail.startsWith('Completed') ? 'green' : 'orange'}
              icon={<Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />}
              label={\`\${chip.label} · \${chip.detail}\`}
              onClick={() => {}}
            />
          </span>
        ))}
        <Text type="supporting" size="xsm" color="secondary">
          Opens the signature tracker
        </Text>
      </div>
    </section>
  );
}
interface DocGridRowProps {
  doc: MatterDoc;
  isOpen: boolean;
  onToggle: () => void;
}

function DocGridRow({doc, isOpen, onToggle}: DocGridRowProps) {
  return (
    <>
      <div style={styles.docRowRule}>
        <Divider />
      </div>
      <div style={{...styles.docCell, ...styles.docName}}>
        <Icon icon={FileTextIcon} size="xsm" color="secondary" />
        <Text type="label" size="sm" maxLines={1}>
          {doc.name}
        </Text>
      </div>
      <div style={styles.docCell}>
        <Token size="sm" color={DOC_STATUS_COLOR[doc.status]} label={doc.status} />
      </div>
      <div style={styles.docCell}>
        <Token
          size="sm"
          color="purple"
          icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
          label={isOpen ? 'Hide summary' : 'AI summary'}
          onClick={onToggle}
        />
      </div>
      <div style={styles.docCellNum}>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {doc.turn} · {doc.versions}
        </Text>
      </div>
      <div style={styles.docCellNum}>
        <Tooltip content={\`Last edited by \${doc.owner}\`}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
            {doc.updated}
          </Text>
        </Tooltip>
      </div>
      {isOpen ? <DocSummaryStrip doc={doc} isCompact={false} /> : null}
    </>
  );
}

// ---------------------------------------------------------------------------
// ACTIVITY — the Casewright digest: research queries, doc reviews, the
// cross-matter Skylark flag, and the Meridian conflicts clearance. Human
// verification is an explicit action (actor + fixed date); AI rows always
// carry the disclosure line and at least one citation chip.
// ---------------------------------------------------------------------------

const ACTIVITY_GLYPH: Record<string, typeof SearchIcon> = {
  research: SearchIcon,
  'spa-review': FileTextIcon,
  skylark: ScaleIcon,
  conflicts: ShieldCheckIcon,
  'request-list': FileTextIcon,
};

interface ActivityRowProps {
  event: ActivityEvent;
  isVerifiedByUser: boolean;
  onVerify: (id: string) => void;
}

function ActivityRow({event, isVerifiedByUser, onVerify}: ActivityRowProps) {
  const verification: Verification | undefined = isVerifiedByUser
    ? {state: 'verified', label: 'Verified · P. Khanna · Jul 15'}
    : event.verification;
  const GlyphIcon = ACTIVITY_GLYPH[event.id] ?? SparklesIcon;
  return (
    <div style={styles.activityRow}>
      {event.isAi ? (
        <span style={styles.aiMark} aria-hidden>
          <Icon icon={GlyphIcon} size="sm" color="inherit" />
        </span>
      ) : (
        <Avatar name={event.actor} size="xsmall" />
      )}
      <div style={styles.activityBody}>
        <div style={styles.activityMeta}>
          <Text type="supporting" size="xsm" color="secondary" style={styles.activityTime}>
            {event.time}
          </Text>
          <span style={styles.noShrink}>
            <Token size="sm" color="gray" label={event.kind} />
          </span>
          <Text type="supporting" size="xsm" color="secondary">
            {event.isAi ? \`Casewright · run for \${event.actor}\` : event.actor}
          </Text>
          {event.confidence != null ? (
            <Text type="supporting" size="xsm" color="secondary">
              {event.confidence}
            </Text>
          ) : null}
        </div>
        <Text type="body" size="sm">
          {event.text}
        </Text>
        {event.flagNote != null ? (
          <div style={styles.flagNote}>
            <Icon icon={FlagIcon} size="xsm" color="inherit" style={styles.urgentText} />
            <Text type="supporting" size="xsm">
              {event.flagNote}
            </Text>
          </div>
        ) : null}
        {event.isAi ? (
          <div style={styles.citeRow}>
            {event.cites.map(cite => (
              <CitationChip key={cite} label={cite} />
            ))}
            {verification != null ? <VerificationChip verification={verification} /> : null}
            {event.canVerify && !isVerifiedByUser ? (
              // Clickable Token, not a Button — matches the chip scale of the
              // row (a ghost sm Button reads as bare oversized text here).
              <span style={styles.noShrink}>
                <Token
                  size="sm"
                  color="default"
                  icon={<Icon icon={CheckIcon} size="xsm" color="inherit" />}
                  label="Mark verified"
                  onClick={() => onVerify(event.id)}
                />
              </span>
            ) : null}
            <DisclosureLine />
          </div>
        ) : null}
      </div>
    </div>
  );
}
interface ActivitySectionProps {
  verifiedIds: ReadonlySet<string>;
  onVerify: (id: string) => void;
}

function ActivitySection({verifiedIds, onVerify}: ActivitySectionProps) {
  // Counts derive from the same rows they summarize (fixture-realism rule:
  // numbers that repeat must agree) and track Mark-verified clicks.
  const aiRuns = ACTIVITY.filter(event => event.isAi);
  const flaggedCount = aiRuns.filter(
    event => event.verification?.state === 'flagged',
  ).length;
  const verifiedCount = aiRuns.filter(
    event => event.verification?.state === 'verified' || verifiedIds.has(event.id),
  ).length;
  const pendingCount = aiRuns.length - flaggedCount - verifiedCount;
  return (
    <section style={styles.section} aria-label="Casewright activity">
      <div style={styles.sectionHeader}>
        <Heading level={2}>Activity</Heading>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {aiRuns.length} Casewright runs · {verifiedCount} verified ·{' '}
          {flaggedCount} flagged · {pendingCount} awaiting verification · Jul 13 – Jul 15
        </Text>
      </div>
      <VStack gap={0}>
        {ACTIVITY.map((event, i) => (
          <VStack key={event.id} gap={0}>
            {i > 0 ? <Divider /> : null}
            <ActivityRow
              event={event}
              isVerifiedByUser={verifiedIds.has(event.id)}
              onVerify={onVerify}
            />
          </VStack>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// END PANEL — matter team, then the time & billing snapshot
// ---------------------------------------------------------------------------

function PersonRow({person}: {person: Person}) {
  return (
    <div style={styles.personRow}>
      <Avatar name={person.name} size="small" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="label" size="sm" maxLines={1}>
            {person.name}
          </Text>
          <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
            {person.role} · {person.detail}
          </Text>
        </VStack>
      </StackItem>
    </div>
  );
}

function TeamPanel() {
  return (
    <div style={styles.panelSection}>
      <Heading level={3}>Matter team</Heading>
      <Text type="supporting" size="xsm" color="secondary">
        Marlow &amp; Voss LLP
      </Text>
      {FIRM_TEAM.map(person => (
        <PersonRow key={person.name} person={person} />
      ))}
      <Divider />
      <Text type="supporting" size="xsm" color="secondary">
        Client contacts
      </Text>
      {CLIENT_TEAM.map(person => (
        <PersonRow key={person.name} person={person} />
      ))}
    </div>
  );
}

function BillingPanel() {
  return (
    <div style={styles.panelSection}>
      <Heading level={3}>Time &amp; billing</Heading>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        Jul 1 – Jul 14 · {HOURS_TOTAL} h recorded
      </Text>
      <VStack gap={2}>
        {HOURS.map(row => (
          <VStack key={row.name} gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                  {row.name}
                </Text>
              </StackItem>
              <Text
                type="supporting"
                size="xsm"
                color="secondary"
                hasTabularNumbers
                style={styles.hoursValue}>
                {row.hours.toFixed(1)} h
              </Text>
            </HStack>
            <div style={styles.barTrack} aria-hidden>
              <div
                style={{
                  ...styles.barFill,
                  width: \`\${Math.round((row.hours / HOURS_MAX) * 100)}%\`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </VStack>
        ))}
      </VStack>
      <Divider />
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Text type="label" size="sm">
            Budget
          </Text>
        </StackItem>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          {BUDGET_PCT}% used
        </Text>
      </HStack>
      <ProgressBar
        value={BUDGET_PCT}
        max={100}
        label={\`Budget: \${BUDGET_PCT}% used\`}
        isLabelHidden
      />
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {BUDGET_LINE}
      </Text>
      <Text type="supporting" size="xsm" color="secondary">
        WIP through Jul 14 · next invoice drafts Aug 1
      </Text>
    </div>
  );
}
// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function MatterWorkspaceTemplate() {
  // <=1200px the end panel drops and its sections reflow into the content
  // column; <=860px document rows stack and header rows wrap.
  const isPanelHidden = useMediaQuery('(max-width: 1200px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  // The SPA summary starts open — the row the deal team checks first.
  const [openDocId, setOpenDocId] = useState<string | null>('spa');
  // Explicit human verification (footnote: actor + fixed date, §5.2.3);
  // fixture strings only — "Jul 15" is the suite's anchored today.
  const [verifiedIds, setVerifiedIds] = useState<ReadonlySet<string>>(() => new Set());

  const toggleDoc = (id: string) =>
    setOpenDocId(prev => (prev === id ? null : id));
  const markVerified = (id: string) =>
    setVerifiedIds(prev => new Set(prev).add(id));

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <VStack gap={0}>
              <PrivilegeStrip />
              <MatterHeader />
              <KeyDatesStrip />
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div style={styles.contentScroll}>
                <WorkstreamsSection />
                <Divider />
                <DocumentsSection
                  isCompact={isCompact}
                  openId={openDocId}
                  onToggle={toggleDoc}
                />
                <Divider />
                <ActivitySection verifiedIds={verifiedIds} onVerify={markVerified} />
                {isPanelHidden ? (
                  <VStack gap={0}>
                    <Divider />
                    <div style={styles.section}>
                      <TeamPanel />
                    </div>
                    <Divider />
                    <div style={styles.section}>
                      <BillingPanel />
                    </div>
                  </VStack>
                ) : null}
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              isScrollable={false}
              label="Matter team and time and billing">
              <div style={styles.panelSticky}>
                <VStack gap={4}>
                  <TeamPanel />
                  <Divider />
                  <BillingPanel />
                </VStack>
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}

`;export{e as default};