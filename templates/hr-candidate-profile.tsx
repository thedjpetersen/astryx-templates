// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one Kestrel Labs candidate record
 *   (Kwame Mensah, Onsite stage of REQ-1042 "Senior Platform Engineer",
 *   sourced on LinkedIn, Remote-US), carried over verbatim from the
 *   recruiting-pipeline fixtures: entered Onsite 2026-06-27, 3 submitted
 *   scorecards averaging 3.4 on the 1–4 Kestrel rubric, debrief Jul 9.
 *   A 4-interview onsite loop (2 submitted / 2 scheduled), a static
 *   resume excerpt, a draft offer prep against the L5 · Remote-US band
 *   ($153,000–$191,000 base), and a 10-entry activity timeline. Frozen
 *   "as of" date 2026-07-03; fixed ISO timestamps; no clocks, no
 *   randomness, no network media.
 * @output Candidate Profile & Scorecards — the single-candidate detail
 *   surface of the Kestrel Labs ATS. A breadcrumbed action header
 *   (Advance to Offer / Schedule / MoreMenu); an identity band with a
 *   large Avatar, source and location tokens, recruiter + hiring-manager
 *   chips, a scorecard-average star readout, and an Applied → Hired stage
 *   stepper with per-stage entry dates; a static styled resume-excerpt
 *   Card with skills chips and a page footer; an interview-loop panel
 *   (4 rows: interviewer avatar + role, interview focus, scheduled time,
 *   scorecard status token) with a 2-of-4 progress header and a debrief
 *   footer; a submitted-scorecard detail with a SegmentedControl to flip
 *   between the 3 submitted cards, per-competency rating dots, an overall
 *   recommend pill, and a written excerpt; and an end rail carrying the
 *   offer-prep Card (proposed comp vs the L5 Remote-US band with a marker
 *   bar, cash rows, and a 3-step approval chain) above the entity-anchored
 *   activity timeline.
 * @position Page template; emitted by `astryx template hr-candidate-profile`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (breadcrumbs + candidate actions) | content (identity band +
 *   stepper, resume Card, loop panel, scorecard detail in one scrolling
 *   column, maxWidth 880) | end panel 340 (offer prep + activity
 *   timeline, sticky and independently scrollable).
 * Container policy: record-detail archetype per hr-employee-profile —
 *   page chrome, the loop panel, and the scorecard detail are frame-first
 *   bordered sections; Cards only for the two genuinely bounded objects
 *   (the resume document preview and the offer-prep summary widget).
 * Color policy: token-pure. The only literals are `light-dark()` pairs:
 *   the gold scorecard stars (matching hr-recruiting-pipeline), the
 *   recommend-pill green tint, and the repo-standard data-viz categorical
 *   fallbacks on the band bar and rating dots (the demo does not inject
 *   `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1100px: content column + 340px end rail; the rail is sticky and
 *   scrolls independently of the content column.
 * - <= 1100px: the end rail drops and the offer-prep Card + activity
 *   timeline render inline after the scorecard detail, so nothing is
 *   lost silently.
 * - <= 760px: the identity band stacks under the Avatar; the stage
 *   stepper keeps one row and scrolls horizontally (deliberate, the only
 *   x-scroller); loop rows wrap their time/status column below the
 *   interviewer; the resume contact line and chip rails wrap.
 * - All header rows wrap (`flexWrap`) instead of clipping; the content
 *   column is the only vertical scroller besides the rail (`minHeight: 0`
 *   down the flex chain).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  CalendarClockIcon,
  CheckIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  StarIcon,
  UsersRoundIcon,
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
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token, type TokenColor} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============================================================================
// Styles
// ============================================================================

/** Gold scorecard stars — same pair as hr-recruiting-pipeline. */
const STAR_GOLD = 'light-dark(#B45309, #FBBF24)';

/** Repo-standard data-viz categorical fallbacks. */
const CAT = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
};

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  contentScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  contentColumn: {
    maxWidth: 880,
    marginInline: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-5)',
  },
  // Sticky end rail (payout-statements idiom): stick to the top of the
  // panel's scroll context and scroll internally.
  railSticky: {
    position: 'sticky',
    insetBlockStart: 0,
    maxHeight: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  // --- Identity band --------------------------------------------------------
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 9px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    whiteSpace: 'nowrap',
  },
  ownerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
  starRow: {display: 'inline-flex', alignItems: 'center', gap: 2, color: STAR_GOLD},
  // --- Stage stepper ---------------------------------------------------------
  // One row always; scrolls horizontally below 760px (deliberate, the
  // only x-scroller on the page — documented in the responsive contract).
  stepper: {
    display: 'flex',
    alignItems: 'flex-start',
    overflowX: 'auto',
    paddingBlock: 'var(--spacing-1)',
  },
  step: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    minWidth: 92,
    flexShrink: 0,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  stepDotDone: {
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent, var(--color-text-inverse))',
  },
  stepDotCurrent: {
    border: '2px solid var(--color-accent)',
    color: 'var(--color-accent)',
    backgroundColor: 'var(--color-background-surface)',
  },
  stepDotUpcoming: {
    border: '2px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Connector line between step dots — aligned to the dot centerline.
  stepConnector: {
    flex: '1 1 24px',
    minWidth: 24,
    height: 2,
    marginTop: 11,
    backgroundColor: 'var(--color-border)',
  },
  stepConnectorDone: {
    backgroundColor: 'var(--color-accent)',
  },
  // --- Frame sections (loop panel, scorecard detail) --------------------------
  section: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  sectionBody: {
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  sectionFooter: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  loopProgressBar: {
    minWidth: 0,
    width: 140,
  },
  timeChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // --- Resume preview ---------------------------------------------------------
  // The "paper" surface inside the resume Card. Static excerpt: no
  // scrolling, so no mask-fade footgun applies.
  paper: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5) var(--spacing-5) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  resumeRule: {
    height: 1,
    backgroundColor: 'var(--color-border)',
  },
  resumeSectionTitle: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  resumeBullet: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
  },
  resumeBulletDot: {
    flexShrink: 0,
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: 'var(--color-text-secondary)',
    transform: 'translateY(-2px)',
  },
  skillChip: {
    display: 'inline-flex',
    padding: '1px 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  // --- Scorecard detail --------------------------------------------------------
  ratingDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    boxSizing: 'border-box',
  },
  ratingDotOn: {
    backgroundColor: CAT.blue,
  },
  ratingDotOff: {
    border: '1.5px solid var(--color-border)',
    backgroundColor: 'transparent',
  },
  competencyRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    paddingBlock: 6,
  },
  recommendPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 12px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  recommendHire: {
    color: 'light-dark(#0B6A1A, #4ADE80)',
    backgroundColor: 'light-dark(#E7F6EA, rgba(52, 199, 89, 0.16))',
  },
  excerpt: {
    borderInlineStart: '3px solid var(--color-border)',
    paddingInlineStart: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
  },
  // --- Offer prep ---------------------------------------------------------------
  bandTrack: {
    position: 'relative',
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
  },
  bandFill: {
    position: 'absolute',
    insetBlock: 0,
    borderRadius: 999,
    backgroundColor: CAT.teal,
    opacity: 0.45,
  },
  bandMidTick: {
    position: 'absolute',
    top: -2,
    width: 2,
    height: 12,
    backgroundColor: 'var(--color-text-secondary)',
    opacity: 0.7,
  },
  bandMarker: {
    position: 'absolute',
    top: -3,
    width: 14,
    height: 14,
    borderRadius: '50%',
    backgroundColor: CAT.teal,
    border: '2px solid var(--color-background-card)',
    boxShadow: 'var(--shadow-low, 0 1px 2px rgba(0,0,0,0.2))',
    transform: 'translateX(-50%)',
  },
  moneyRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 'var(--spacing-2)',
  },
  // --- Activity timeline ----------------------------------------------------------
  timelineItem: {
    position: 'relative',
    paddingInlineStart: 22,
    paddingBlockEnd: 'var(--spacing-3)',
  },
  timelineDot: {
    position: 'absolute',
    insetInlineStart: 0,
    top: 5,
    width: 9,
    height: 9,
    borderRadius: '50%',
    border: '2px solid var(--color-accent)',
    backgroundColor: 'var(--color-background-surface)',
    boxSizing: 'border-box',
  },
  timelineLine: {
    position: 'absolute',
    insetInlineStart: 4,
    top: 17,
    bottom: 2,
    width: 1,
    backgroundColor: 'var(--color-border)',
  },
};

// ============================================================================
// Fixtures — Kwame Mensah, Onsite stage of REQ-1042, as of 2026-07-03.
// Continuity: stage-entry date (Jun 27), scorecard average (3.4 across 3
// cards), source (LinkedIn), location (Remote-US), and the Jul 9 debrief
// all match this candidate's card on hr-recruiting-pipeline.
// ============================================================================

const REQ = {
  id: 'REQ-1042',
  title: 'Senior Platform Engineer',
  department: 'Engineering',
  office: 'SF HQ',
  level: 'L5',
  recruiter: 'Dana Whitfield',
  hiringManager: 'Marcus Webb',
};

const CANDIDATE = {
  name: 'Kwame Mensah',
  headline: 'Staff Infrastructure Engineer at Northwind Grid',
  location: 'Atlanta, GA (Remote-US)',
  email: 'kwame@kmensah.dev',
  source: 'LinkedIn',
  sourceColor: 'blue' as TokenColor,
  appliedLabel: 'Jun 9',
  daysInStage: 6,
  scorecardAvg: 3.4,
  scorecardCount: 3,
};

interface Stage {
  id: string;
  title: string;
  /** Entry date label for reached stages; null for upcoming ones. */
  entered: string | null;
  state: 'done' | 'current' | 'upcoming';
}

const STAGES: ReadonlyArray<Stage> = [
  {id: 'applied', title: 'Applied', entered: 'Jun 9', state: 'done'},
  {id: 'screen', title: 'Screen', entered: 'Jun 15', state: 'done'},
  {id: 'onsite', title: 'Onsite', entered: 'Jun 27', state: 'current'},
  {id: 'offer', title: 'Offer', entered: null, state: 'upcoming'},
  {id: 'hired', title: 'Hired', entered: null, state: 'upcoming'},
];

// --- Onsite loop -------------------------------------------------------------

interface LoopInterview {
  id: string;
  focus: string;
  interviewer: string;
  role: string;
  /** Fixed schedule label, e.g. "Wed Jul 1 · 10:00–11:15". */
  when: string;
  status: 'submitted' | 'pending';
  /** Overall rating on the 1–4 Kestrel rubric once submitted. */
  score: number | null;
}

const LOOP: ReadonlyArray<LoopInterview> = [
  {
    id: 'int-1',
    focus: 'System design',
    interviewer: 'Priya Raman',
    role: 'VP Engineering',
    when: 'Wed Jul 1 · 10:00–11:15',
    status: 'submitted',
    score: 3.5,
  },
  {
    id: 'int-2',
    focus: 'Infrastructure & operations',
    interviewer: 'Tom Okonkwo',
    role: 'IT Admin',
    when: 'Thu Jul 2 · 14:00–15:00',
    status: 'submitted',
    score: 3.2,
  },
  {
    id: 'int-3',
    focus: 'Cross-functional collaboration',
    interviewer: 'Sofia Ortiz',
    role: 'Design Lead',
    when: 'Mon Jul 6 · 09:30–10:15',
    status: 'pending',
    score: null,
  },
  {
    id: 'int-4',
    focus: 'Career & values',
    interviewer: 'Marcus Webb',
    role: 'Platform Lead · Hiring manager',
    when: 'Tue Jul 7 · 15:00–16:00',
    status: 'pending',
    score: null,
  },
];

const LOOP_SUBMITTED = LOOP.filter(i => i.status === 'submitted').length;

const DEBRIEF = {
  when: 'Thu Jul 9 · 13:00–13:45',
  attendees: 'Full panel + Dana Whitfield',
};

// --- Resume excerpt (static, page 1 of 2) --------------------------------------

interface ResumeRole {
  company: string;
  title: string;
  span: string;
  bullets: string[];
}

const RESUME_ROLES: ReadonlyArray<ResumeRole> = [
  {
    company: 'Northwind Grid',
    title: 'Staff Infrastructure Engineer',
    span: '2022 – present',
    bullets: [
      'Led the migration of 900+ services from a hand-rolled service mesh to a multi-region Envoy control plane; cut cross-region p99 latency 34% and removed 11 single-region failure modes.',
      'Designed the golden-path deploy pipeline (build → canary → progressive rollout) adopted by 40 teams; change-failure rate fell from 8.1% to 2.3% over three quarters.',
      'On-call lead for the compute platform (600 nodes, 4 regions); authored the incident-review rubric now used org-wide.',
    ],
  },
  {
    company: 'Datavine',
    title: 'Senior Platform Engineer',
    span: '2018 – 2022',
    bullets: [
      'Built the internal Kubernetes platform from 3 clusters to 27, with tenant isolation, cost attribution, and self-serve namespaces.',
      'Wrote the Terraform module library that replaced 12k lines of copy-pasted infra config across product teams.',
    ],
  },
  {
    company: 'Helios Cloud',
    title: 'Software Engineer',
    span: '2015 – 2018',
    bullets: [
      'Shipped the metrics-ingestion service (Go, 2M points/sec) and its query cache; on the founding on-call rotation.',
    ],
  },
];

const RESUME_SKILLS = [
  'Kubernetes',
  'Terraform',
  'Go',
  'Rust',
  'Envoy',
  'Postgres',
  'gRPC',
  'Observability',
] as const;

const RESUME_FILE = {
  name: 'kwame-mensah-resume.pdf',
  meta: 'PDF · 2 pages · 184 KB',
  uploaded: 'Uploaded Jun 9, 2026',
};

// --- Submitted scorecards -------------------------------------------------------
// Three submitted cards averaging (3.5 + 3.5 + 3.2) / 3 = 3.4 — the same
// average and count the pipeline board shows for this candidate.

interface Scorecard {
  id: string;
  interviewer: string;
  role: string;
  interview: string;
  submitted: string;
  overall: number;
  recommend: string;
  competencies: ReadonlyArray<{label: string; rating: number}>;
  excerpt: string;
}

const SCORECARDS: ReadonlyArray<Scorecard> = [
  {
    id: 'sc-sysdesign',
    interviewer: 'Priya Raman',
    role: 'VP Engineering',
    interview: 'System design · Onsite',
    submitted: 'Submitted Jul 1 · 11:20',
    overall: 3.5,
    recommend: 'Hire',
    competencies: [
      {label: 'Distributed systems design', rating: 4},
      {label: 'Scaling & reliability', rating: 3},
      {label: 'Trade-off reasoning', rating: 4},
      {label: 'Kestrel principles', rating: 3},
    ],
    excerpt:
      'Kwame designed a multi-region event backbone that degraded gracefully under every failure I injected — he reached for cell-based isolation unprompted and could price each nine of availability in infra spend. Strongest system-design round I have run this cycle; my only hesitation is he leaned on managed services where I wanted to see first-principles reasoning about the storage layer.',
  },
  {
    id: 'sc-infra',
    interviewer: 'Tom Okonkwo',
    role: 'IT Admin',
    interview: 'Infrastructure & operations · Onsite',
    submitted: 'Submitted Jul 3 · 09:15',
    overall: 3.2,
    recommend: 'Hire',
    competencies: [
      {label: 'Incident response', rating: 3},
      {label: 'Infra automation', rating: 4},
      {label: 'Security posture', rating: 3},
      {label: 'Debugging depth', rating: 3},
    ],
    excerpt:
      'Walked my staged outage calmly: bisected the bad rollout in under ten minutes, communicated status at each step, and wrote a crisp follow-up plan. Automation instincts are excellent. Docked on security posture — he treated secrets rotation as a platform-team problem rather than something his pipeline should enforce.',
  },
  {
    id: 'sc-screen',
    interviewer: 'Marcus Webb',
    role: 'Platform Lead · Hiring manager',
    interview: 'Hiring-manager screen · Screen',
    submitted: 'Submitted Jun 20 · 09:00',
    overall: 3.5,
    recommend: 'Hire',
    competencies: [
      {label: 'Platform breadth', rating: 4},
      {label: 'Motivation & role fit', rating: 3},
      {label: 'Communication', rating: 4},
    ],
    excerpt:
      'Exactly the shape of platform experience REQ-1042 needs: he has run a golden-path program at a company one size bigger than us and can talk to both the Envoy internals and the developer-experience story. Wants to move closer to product engineering long-term — worth probing in the career round whether a platform seat holds him for 2+ years.',
  },
];

// --- Offer prep -----------------------------------------------------------------
// Band figures are the canonical L5 · Remote-US base band from
// hr-compensation-bands ($153,000 / $172,000 / $191,000).

const OFFER = {
  status: 'Draft',
  level: 'L5 · Senior Platform Engineer',
  band: 'L5 · Remote-US',
  bandMin: 153_000,
  bandMid: 172_000,
  bandMax: 191_000,
  proposedBase: 182_500,
  compaRatio: '1.06',
  targetBonus: 18_250,
  targetBonusPct: '10%',
  signOn: 10_000,
  equity: 76_000,
  equityNote: 'new-hire grant · 4-yr vest',
  year1Cash: 210_750, // base + target bonus + sign-on
  blockedNote: 'Offer can be sent after all 4 loop scorecards are in — debrief Jul 9.',
};

interface ApprovalStep {
  id: string;
  approver: string;
  role: string;
  status: 'approved' | 'in-review' | 'not-started';
  detail: string;
}

const APPROVAL_CHAIN: ReadonlyArray<ApprovalStep> = [
  {
    id: 'appr-1',
    approver: 'Marcus Webb',
    role: 'Hiring manager',
    status: 'approved',
    detail: 'Approved Jul 2 · 16:30',
  },
  {
    id: 'appr-2',
    approver: 'Elena Voss',
    role: 'Finance Lead',
    status: 'in-review',
    detail: 'In review since Jul 2',
  },
  {
    id: 'appr-3',
    approver: 'Priya Raman',
    role: 'VP Engineering',
    status: 'not-started',
    detail: 'Starts after Finance',
  },
];

// --- Activity timeline ------------------------------------------------------------

interface ActivityEntry {
  id: string;
  when: string;
  actor: string | null;
  action: string;
  detail: string | null;
}

const ACTIVITY: ReadonlyArray<ActivityEntry> = [
  {
    id: 'act-01',
    when: 'Jul 3 · 09:15',
    actor: 'Tom Okonkwo',
    action: 'submitted the Infrastructure & operations scorecard',
    detail: '3.2 overall · Hire',
  },
  {
    id: 'act-02',
    when: 'Jul 2 · 16:30',
    actor: 'Marcus Webb',
    action: 'approved the offer pre-read',
    detail: 'Approval step 1 of 3',
  },
  {
    id: 'act-03',
    when: 'Jul 2 · 11:00',
    actor: 'Dana Whitfield',
    action: 'opened offer prep',
    detail: 'Draft · L5 · Remote-US band',
  },
  {
    id: 'act-04',
    when: 'Jul 1 · 11:20',
    actor: 'Priya Raman',
    action: 'submitted the System design scorecard',
    detail: '3.5 overall · Hire',
  },
  {
    id: 'act-05',
    when: 'Jun 29 · 14:05',
    actor: 'Dana Whitfield',
    action: 'scheduled the onsite loop',
    detail: '4 interviews · debrief Jul 9',
  },
  {
    id: 'act-06',
    when: 'Jun 27 · 10:12',
    actor: 'Marcus Webb',
    action: 'advanced Kwame to Onsite',
    detail: null,
  },
  {
    id: 'act-07',
    when: 'Jun 20 · 09:00',
    actor: 'Marcus Webb',
    action: 'submitted the Hiring-manager screen scorecard',
    detail: '3.5 overall · Hire',
  },
  {
    id: 'act-08',
    when: 'Jun 19 · 15:00',
    actor: null,
    action: 'Hiring-manager screen completed',
    detail: '45-min video call · Marcus Webb',
  },
  {
    id: 'act-09',
    when: 'Jun 15 · 10:30',
    actor: 'Dana Whitfield',
    action: 'advanced Kwame to Screen',
    detail: null,
  },
  {
    id: 'act-10',
    when: 'Jun 9 · 08:47',
    actor: null,
    action: 'Application received via LinkedIn',
    detail: 'Resume + portfolio link attached',
  },
];

function formatUsd(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

// ============================================================================
// Shared bits — stars, rating dots, section shell, stage stepper
// ============================================================================

/** Scorecard average on the 1–4 Kestrel rubric (pipeline-board idiom). */
function ScoreStars({score, count}: {score: number; count: number}) {
  return (
    <HStack gap={1} vAlign="center">
      <span
        style={styles.starRow}
        role="img"
        aria-label={`Scorecard average ${score.toFixed(1)} of 4`}>
        {[1, 2, 3, 4].map(step => (
          <StarIcon
            key={step}
            size={13}
            aria-hidden="true"
            fill={score >= step - 0.25 ? 'currentColor' : 'none'}
            strokeWidth={score >= step - 0.25 ? 0 : 1.5}
          />
        ))}
      </span>
      <Text type="supporting" hasTabularNumbers>
        {score.toFixed(1)}
      </Text>
      <Text type="supporting" color="secondary">
        · {count} scorecard{count === 1 ? '' : 's'}
      </Text>
    </HStack>
  );
}

/** Per-competency rating on the 1–4 rubric as filled dots + numeral. */
function RatingDots({label, rating}: {label: string; rating: number}) {
  return (
    <div style={styles.competencyRow}>
      <StackItem size="fill" style={{minWidth: 0}}>
        <Text type="body" maxLines={1}>
          {label}
        </Text>
      </StackItem>
      <span
        style={{display: 'inline-flex', gap: 4}}
        role="img"
        aria-label={`${label}: ${rating} of 4`}>
        {[1, 2, 3, 4].map(step => (
          <span
            key={step}
            style={{
              ...styles.ratingDot,
              ...(step <= rating ? styles.ratingDotOn : styles.ratingDotOff),
            }}
          />
        ))}
      </span>
      <Text type="supporting" hasTabularNumbers color="secondary">
        {rating}/4
      </Text>
    </div>
  );
}

/** Bordered frame section with a pinned header row (not a Card). */
function SectionShell({
  title,
  titleExtras,
  children,
  footer,
  label,
}: {
  title: string;
  titleExtras?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  label?: string;
}) {
  return (
    <section style={styles.section} aria-label={label ?? title}>
      <div style={styles.sectionHeader}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Heading level={2}>{title}</Heading>
          {titleExtras}
        </HStack>
      </div>
      <div style={styles.sectionBody}>{children}</div>
      {footer === undefined ? null : (
        <div style={styles.sectionFooter}>{footer}</div>
      )}
    </section>
  );
}

/** Applied → Hired stage stepper with per-stage entry dates. */
function StageStepper() {
  return (
    <div style={styles.stepper} aria-label="Hiring stages">
      {STAGES.map((stage, index) => (
        <span key={stage.id} style={{display: 'contents'}}>
          {index === 0 ? null : (
            <span
              style={{
                ...styles.stepConnector,
                ...(stage.state === 'done' || stage.state === 'current'
                  ? styles.stepConnectorDone
                  : undefined),
              }}
              aria-hidden="true"
            />
          )}
          <div style={styles.step}>
            <span
              style={{
                ...styles.stepDot,
                ...(stage.state === 'done'
                  ? styles.stepDotDone
                  : stage.state === 'current'
                    ? styles.stepDotCurrent
                    : styles.stepDotUpcoming),
              }}
              aria-hidden="true">
              {stage.state === 'done' ? (
                <CheckIcon size={13} strokeWidth={3} />
              ) : stage.state === 'current' ? (
                <UsersRoundIcon size={12} />
              ) : (
                <ClockIcon size={12} />
              )}
            </span>
            <Text
              type="supporting"
              color={stage.state === 'upcoming' ? 'secondary' : undefined}>
              {stage.title}
            </Text>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {stage.state === 'current'
                ? `${stage.entered} · ${CANDIDATE.daysInStage}d in stage`
                : (stage.entered ?? '—')}
            </Text>
          </div>
        </span>
      ))}
    </div>
  );
}

// ============================================================================
// Resume preview — static styled excerpt inside a Card (bounded document)
// ============================================================================

function ResumeCard() {
  return (
    <Card padding={4} aria-label="Resume preview">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={FileTextIcon} size="md" color="secondary" />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {RESUME_FILE.name}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {RESUME_FILE.meta} · {RESUME_FILE.uploaded}
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Download"
            variant="secondary"
            size="sm"
            icon={<Icon icon={DownloadIcon} size="sm" color="inherit" />}
          />
        </HStack>
        <div style={styles.paper}>
          <VStack gap={1}>
            <Heading level={3}>{CANDIDATE.name}</Heading>
            <Text type="supporting" color="secondary">
              {CANDIDATE.headline.replace(' at ', ' · ')}
            </Text>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Text type="supporting" color="secondary">
                {CANDIDATE.location}
              </Text>
              <Text type="supporting" color="secondary">
                · {CANDIDATE.email}
              </Text>
              <Text type="supporting" color="secondary">
                · kmensah.dev
              </Text>
            </HStack>
          </VStack>
          <div style={styles.resumeRule} aria-hidden="true" />
          <span style={styles.resumeSectionTitle}>Experience</span>
          {RESUME_ROLES.map(role => (
            <VStack key={role.company} gap={1}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <Text type="label">
                    {role.title} — {role.company}
                  </Text>
                </StackItem>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {role.span}
                </Text>
              </HStack>
              <VStack gap={1}>
                {role.bullets.map(bullet => (
                  <div key={bullet} style={styles.resumeBullet}>
                    <span style={styles.resumeBulletDot} aria-hidden="true" />
                    <Text type="supporting" color="secondary">
                      {bullet}
                    </Text>
                  </div>
                ))}
              </VStack>
            </VStack>
          ))}
          <div style={styles.resumeRule} aria-hidden="true" />
          <span style={styles.resumeSectionTitle}>Skills</span>
          <HStack gap={1} vAlign="center" wrap="wrap">
            {RESUME_SKILLS.map(skill => (
              <span key={skill} style={styles.skillChip}>
                {skill}
              </span>
            ))}
          </HStack>
        </div>
        <Text type="supporting" color="secondary">
          Showing page 1 of 2 — education and open-source work continue on
          page 2.
        </Text>
      </VStack>
    </Card>
  );
}

// ============================================================================
// Interview loop panel — 4 rows + progress header + debrief footer
// ============================================================================

function LoopRow({interview, isCompact}: {interview: LoopInterview; isCompact: boolean}) {
  return (
    <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : undefined}>
      <Avatar name={interview.interviewer} size="small" />
      <StackItem size="fill" style={{minWidth: 180}}>
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {interview.focus}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {interview.interviewer} · {interview.role}
          </Text>
        </VStack>
      </StackItem>
      <span style={styles.timeChip}>
        <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {interview.when}
        </Text>
      </span>
      <div style={{minWidth: 132, display: 'flex', justifyContent: 'flex-end'}}>
        {interview.status === 'submitted' ? (
          <Token
            label={`Submitted · ${interview.score?.toFixed(1)}`}
            color="green"
            size="sm"
          />
        ) : (
          <Token label="Scorecard pending" color="yellow" size="sm" />
        )}
      </div>
    </HStack>
  );
}

function LoopPanel({isCompact}: {isCompact: boolean}) {
  return (
    <SectionShell
      title="Onsite interview loop"
      titleExtras={
        <>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {LOOP_SUBMITTED} of {LOOP.length} scorecards in
          </Text>
          <ProgressBar
            label={`${LOOP_SUBMITTED} of ${LOOP.length} loop scorecards submitted`}
            isLabelHidden
            value={LOOP_SUBMITTED}
            max={LOOP.length}
            style={styles.loopProgressBar}
          />
        </>
      }
      footer={
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Icon icon={UsersRoundIcon} size="sm" color="secondary" />
          <Text type="supporting">Debrief · {DEBRIEF.when}</Text>
          <Text type="supporting" color="secondary">
            {DEBRIEF.attendees}
          </Text>
          <StackItem size="fill" />
          <Button label="Reschedule loop" variant="ghost" size="sm" />
        </HStack>
      }>
      <VStack gap={2}>
        {LOOP.map((interview, index) => (
          <VStack key={interview.id} gap={2}>
            {index === 0 ? null : <Divider variant="subtle" />}
            <LoopRow interview={interview} isCompact={isCompact} />
          </VStack>
        ))}
      </VStack>
    </SectionShell>
  );
}

// ============================================================================
// Scorecard detail — flip between the 3 submitted cards
// ============================================================================

function ScorecardDetail({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const card = SCORECARDS.find(sc => sc.id === selectedId) ?? SCORECARDS[0];
  return (
    <SectionShell
      title="Submitted scorecards"
      label="Submitted scorecards"
      titleExtras={
        <>
          <StackItem size="fill" />
          <SegmentedControl
            label="Scorecard"
            value={card.id}
            onChange={onSelect}
            size="sm">
            {SCORECARDS.map(sc => (
              <SegmentedControlItem
                key={sc.id}
                label={`${sc.interviewer.split(' ')[0][0]}. ${sc.interviewer.split(' ')[1]}`}
                value={sc.id}
              />
            ))}
          </SegmentedControl>
        </>
      }>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Avatar name={card.interviewer} size="small" />
          <StackItem size="fill" style={{minWidth: 200}}>
            <VStack gap={0}>
              <Text type="label" maxLines={1}>
                {card.interview}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {card.interviewer} · {card.role} · {card.submitted}
              </Text>
            </VStack>
          </StackItem>
          <span style={{...styles.recommendPill, ...styles.recommendHire}}>
            <CheckIcon size={13} aria-hidden="true" />
            {card.recommend}
          </span>
          <Text type="body" hasTabularNumbers>
            {card.overall.toFixed(1)} / 4 overall
          </Text>
        </HStack>
        <Divider variant="subtle" />
        <VStack gap={0}>
          {card.competencies.map(competency => (
            <RatingDots
              key={competency.label}
              label={competency.label}
              rating={competency.rating}
            />
          ))}
        </VStack>
        <div style={styles.excerpt}>
          <Text type="supporting" color="inherit">
            “{card.excerpt}”
          </Text>
        </div>
      </VStack>
    </SectionShell>
  );
}

// ============================================================================
// Offer prep — Card widget (level, comp vs band, approval chain)
// ============================================================================

const APPROVAL_DOT: Record<
  ApprovalStep['status'],
  {variant: 'success' | 'warning' | 'neutral'; label: string}
> = {
  approved: {variant: 'success', label: 'Approved'},
  'in-review': {variant: 'warning', label: 'In review'},
  'not-started': {variant: 'neutral', label: 'Not started'},
};

function OfferPrepCard() {
  const span = OFFER.bandMax - OFFER.bandMin;
  const markerPct = ((OFFER.proposedBase - OFFER.bandMin) / span) * 100;
  const midPct = ((OFFER.bandMid - OFFER.bandMin) / span) * 100;
  return (
    <Card padding={4} aria-label="Offer prep">
      <VStack gap={3}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={2}>Offer prep</Heading>
          </StackItem>
          <Badge variant="warning" label={OFFER.status} />
        </HStack>
        <VStack gap={1}>
          <Text type="label">{OFFER.level}</Text>
          <Text type="supporting" color="secondary">
            Band {OFFER.band} · {formatUsd(OFFER.bandMin)} –{' '}
            {formatUsd(OFFER.bandMax)}
          </Text>
        </VStack>
        <VStack gap={2}>
          <div style={styles.moneyRow}>
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Proposed base
              </Text>
            </StackItem>
            <Text type="label" hasTabularNumbers>
              {formatUsd(OFFER.proposedBase)}
            </Text>
          </div>
          <div
            style={styles.bandTrack}
            role="img"
            aria-label={`Proposed base ${formatUsd(OFFER.proposedBase)} sits at ${Math.round(markerPct)}% of the ${OFFER.band} band (${formatUsd(OFFER.bandMin)} to ${formatUsd(OFFER.bandMax)}, mid ${formatUsd(OFFER.bandMid)})`}>
            <div style={{...styles.bandFill, insetInline: 0}} />
            <span style={{...styles.bandMidTick, left: `${midPct}%`}} />
            <span style={{...styles.bandMarker, left: `${markerPct}%`}} />
          </div>
          <HStack gap={2} vAlign="center">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              min {formatUsd(OFFER.bandMin)}
            </Text>
            <StackItem size="fill" style={{textAlign: 'center'}}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                mid {formatUsd(OFFER.bandMid)}
              </Text>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              max {formatUsd(OFFER.bandMax)}
            </Text>
          </HStack>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {Math.round(markerPct)}% through band · compa-ratio{' '}
            {OFFER.compaRatio} vs mid
          </Text>
        </VStack>
        <Divider variant="subtle" />
        <VStack gap={1}>
          {[
            {
              label: `Target bonus (${OFFER.targetBonusPct})`,
              value: formatUsd(OFFER.targetBonus),
            },
            {label: 'Sign-on', value: formatUsd(OFFER.signOn)},
            {
              label: `Equity (${OFFER.equityNote})`,
              value: formatUsd(OFFER.equity),
            },
          ].map(row => (
            <div key={row.label} style={styles.moneyRow}>
              <StackItem size="fill" style={{minWidth: 0}}>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {row.label}
                </Text>
              </StackItem>
              <Text type="supporting" hasTabularNumbers>
                {row.value}
              </Text>
            </div>
          ))}
          <div style={styles.moneyRow}>
            <StackItem size="fill">
              <Text type="label">Year-1 cash</Text>
            </StackItem>
            <Text type="label" hasTabularNumbers>
              {formatUsd(OFFER.year1Cash)}
            </Text>
          </div>
        </VStack>
        <Divider variant="subtle" />
        <VStack gap={2}>
          <Text type="label">Approval chain</Text>
          {APPROVAL_CHAIN.map(step => (
            <HStack key={step.id} gap={2} vAlign="center">
              <Avatar name={step.approver} size="xsmall" />
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0}>
                  <Text type="supporting" maxLines={1}>
                    {step.approver} · {step.role}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {step.detail}
                  </Text>
                </VStack>
              </StackItem>
              <StatusDot
                variant={APPROVAL_DOT[step.status].variant}
                label={APPROVAL_DOT[step.status].label}
              />
            </HStack>
          ))}
        </VStack>
        <Text type="supporting" color="secondary">
          {OFFER.blockedNote}
        </Text>
      </VStack>
    </Card>
  );
}

// ============================================================================
// Activity timeline — entity-anchored, newest first
// ============================================================================

function ActivityTimeline() {
  return (
    <section aria-label="Activity">
      <VStack gap={3}>
        <Heading level={2}>Activity</Heading>
        <div>
          {ACTIVITY.map((entry, index) => (
            <div key={entry.id} style={styles.timelineItem}>
              <span style={styles.timelineDot} aria-hidden="true" />
              {index === ACTIVITY.length - 1 ? null : (
                <span style={styles.timelineLine} aria-hidden="true" />
              )}
              <VStack gap={0}>
                <Text type="supporting">
                  {entry.actor === null ? entry.action : (
                    <>
                      <strong>{entry.actor}</strong> {entry.action}
                    </>
                  )}
                </Text>
                {entry.detail === null ? null : (
                  <Text type="supporting" color="secondary">
                    {entry.detail}
                  </Text>
                )}
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {entry.when}
                </Text>
              </VStack>
            </div>
          ))}
        </div>
      </VStack>
    </section>
  );
}

// ============================================================================
// Identity band
// ============================================================================

function IdentityBand({isCompact}: {isCompact: boolean}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign={isCompact ? 'start' : 'center'} wrap="wrap">
        <Avatar name={CANDIDATE.name} size="large" />
        <StackItem size="fill" style={{minWidth: 240}}>
          <VStack gap={1}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Heading level={1}>{CANDIDATE.name}</Heading>
              <Token
                label={CANDIDATE.source}
                color={CANDIDATE.sourceColor}
                size="sm"
              />
              <Badge variant="info" label="Onsite" />
            </HStack>
            <Text type="supporting" color="secondary">
              {CANDIDATE.headline}
            </Text>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <span style={styles.chip}>
                <MapPinIcon size={12} aria-hidden="true" />
                {CANDIDATE.location}
              </span>
              <span style={styles.chip}>
                {REQ.id} · {REQ.title} · {REQ.level}
              </span>
              <span style={styles.chip}>
                Applied {CANDIDATE.appliedLabel} · {CANDIDATE.source}
              </span>
            </HStack>
            <ScoreStars
              score={CANDIDATE.scorecardAvg}
              count={CANDIDATE.scorecardCount}
            />
          </VStack>
        </StackItem>
        <div style={styles.ownerChip}>
          <Avatar name={REQ.recruiter} size="xsmall" />
          <VStack gap={0}>
            <Text type="supporting">{REQ.recruiter}</Text>
            <Text type="supporting" color="secondary">
              Recruiter
            </Text>
          </VStack>
        </div>
        <div style={styles.ownerChip}>
          <Avatar name={REQ.hiringManager} size="xsmall" />
          <VStack gap={0}>
            <Text type="supporting">{REQ.hiringManager}</Text>
            <Text type="supporting" color="secondary">
              Hiring manager
            </Text>
          </VStack>
        </div>
      </HStack>
      <StageStepper />
    </VStack>
  );
}

// ============================================================================
// Page
// ============================================================================

export default function HrCandidateProfileTemplate() {
  const [scorecardId, setScorecardId] = useState<string>(SCORECARDS[0].id);
  const isRailHidden = useMediaQuery('(max-width: 1100px)');
  const isCompact = useMediaQuery('(max-width: 760px)');

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill" style={{minWidth: 220}}>
                <Breadcrumbs>
                  <BreadcrumbItem onClick={() => {}}>Recruiting</BreadcrumbItem>
                  <BreadcrumbItem onClick={() => {}}>
                    {REQ.id} · {REQ.title}
                  </BreadcrumbItem>
                  <BreadcrumbItem isCurrent>{CANDIDATE.name}</BreadcrumbItem>
                </Breadcrumbs>
              </StackItem>
              <Button
                label="Message"
                variant="ghost"
                size="sm"
                icon={
                  <Icon icon={MessageSquareTextIcon} size="sm" color="inherit" />
                }
              />
              <Button
                label="Schedule"
                variant="secondary"
                size="sm"
                icon={
                  <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
                }
              />
              <Button label="Advance to Offer" variant="primary" size="sm" />
              <MoreMenu
                label={`More actions for ${CANDIDATE.name}`}
                size="sm"
                items={[
                  {label: 'Download resume', onClick: () => {}},
                  {label: 'Copy profile link', onClick: () => {}},
                  {label: 'Move to another stage', onClick: () => {}},
                  {label: 'Reject candidate', onClick: () => {}},
                ]}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div style={styles.contentScroll}>
                <div style={styles.contentColumn}>
                  <IdentityBand isCompact={isCompact} />
                  <ResumeCard />
                  <LoopPanel isCompact={isCompact} />
                  <ScorecardDetail
                    selectedId={scorecardId}
                    onSelect={setScorecardId}
                  />
                  {/* Below 1100px the end rail drops; its offer prep and
                      activity timeline render inline so nothing is lost. */}
                  {isRailHidden ? (
                    <>
                      <OfferPrepCard />
                      <ActivityTimeline />
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isRailHidden ? undefined : (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              isScrollable={false}
              label="Offer prep and activity">
              <div style={styles.railSticky}>
                <OfferPrepCard />
                <ActivityTimeline />
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
