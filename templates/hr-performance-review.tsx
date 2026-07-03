// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs H1 2026 review
 *   cycle for Marcus Webb's six-person Platform team (competency rubric,
 *   last-cycle ratings, drafted narrative text, OKR-derived goal outcomes,
 *   peer-feedback requests, fixed ISO timestamps in June–July 2026). No
 *   clocks, no randomness, no network media.
 * @output Performance Review Authoring — the manager-side surface where
 *   Marcus Webb (Platform lead) writes H1 2026 reviews for his reports.
 *   A cycle header (due Jul 8 · 5 days left · 3 of 6 reports submitted
 *   with a progress bar); a reports rail with per-report status; a review
 *   document for the active report: five competency rows rated on 1–5
 *   segmented scales with a dashed ghost ring marking the H2 2025 rating,
 *   Strengths / Growth-areas TextAreas with live word-count hints, a
 *   goal-outcomes list pulled from team OKRs with attainment pills and a
 *   weighted-attainment readout; and an end rail of peer-feedback quotes
 *   (requested vs received) above a pinned calibration-status note.
 * @position Page template; emitted by `astryx template hr-performance-review`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (cycle title, due chip, submitted progress)
 *   | rail 272 (report list + pinned cycle checklist strip)
 *   | content (subject toolbar w/ save+submit, review document scrolls)
 *   | end panel 320 (peer feedback rail, pinned calibration note).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Peer quotes are styled divs; the rating scale is a styled
 *   radiogroup of buttons.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for attainment pills, rating deltas, and status dots (the demo does
 *   not inject `--color-data-categorical-*`).
 *
 * Responsive contract:
 * - > 1180px: full three-region frame.
 * - <= 1180px: the peer-feedback end panel is dropped; the quotes and the
 *   calibration note render inline at the bottom of the review document.
 * - <= 860px: the reports rail is dropped; a report Selector appears in
 *   the subject toolbar. Header and toolbar rows wrap instead of clipping;
 *   competency rows stack the scale under the label.
 * - The rail, the review document, and the feedback panel each scroll
 *   independently (`minHeight: 0` down every flex chain); the subject
 *   toolbar and the calibration note are pinned.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClipboardCheckIcon,
  FilePenLineIcon,
  MailIcon,
  ScaleIcon,
  SendIcon,
  TargetIcon,
  UsersIcon,
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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-2)'},
  railStrip: {flexShrink: 0, padding: 'var(--spacing-3)'},
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  subjectToolbar: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-5)'},
  docScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  docBody: {
    maxWidth: 880,
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-8)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  visuallyHidden: {position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap'},
  // ---- competency rating rows ----
  compRow: {display: 'flex', gap: 'var(--spacing-4)', alignItems: 'flex-start', padding: 'var(--spacing-3) 0', flexWrap: 'wrap'},
  compLabelCol: {flex: '1 1 260px', minWidth: 220},
  compScaleCol: {flex: '0 0 auto'},
  scaleRow: {display: 'flex', gap: 4},
  scaleSegment: {
    position: 'relative',
    width: 44,
    height: 36,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-control, 6px)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
    padding: 0,
  },
  scaleSegmentActive: {
    backgroundColor: 'var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    fontWeight: 600,
  },
  scaleSegmentDisabled: {cursor: 'default'},
  // Last-cycle ghost marker: dashed inner ring on the H2 2025 segment.
  ghostRing: {
    position: 'absolute',
    inset: 2,
    borderRadius: 4,
    border: '1.5px dashed var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  // Width = 5 segments x 44px + 4 gaps x 4px, keeping the end anchors
  // registered to the scale edges.
  scaleEnds: {display: 'flex', justifyContent: 'space-between', width: 236},
  deltaCol: {flex: '0 0 112px', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end', textAlign: 'end'},
  ratingSummary: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // ---- goal outcomes ----
  goalRow: {display: 'flex', gap: 'var(--spacing-3)', alignItems: 'flex-start', padding: 'var(--spacing-3) 0'},
  attainPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  goalNumbers: {flex: '0 0 150px', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'flex-end', textAlign: 'end'},
  // ---- peer feedback rail ----
  feedbackScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  quoteBlock: {
    borderInlineStart: '3px solid var(--color-border-emphasized)',
    paddingInlineStart: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
  },
  pendingBlock: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px dashed var(--color-border-emphasized)',
  },
  calibrationStrip: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-4)', backgroundColor: 'var(--color-background-muted)'},
  // Word-count hints sit right-aligned under each TextArea.
  wordHintRow: {display: 'flex', justifyContent: 'flex-end'},
  numeric: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  headerProgress: {width: 148, minWidth: 0},
  statusGlyph: {display: 'inline-flex', flexShrink: 0},
};

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const DATA_COLOR = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  red: 'light-dark(#DC2626, #F87171)',
} as const;

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company), H1 2026 review cycle.
// Signed-in manager: Marcus Webb (Platform lead, Engineering). Six direct
// reports; 3 reviews submitted, 1 in draft, 2 not started — the header
// progress (3 of 6), the rail badges, and the checklist strip all agree.
// Reviews due 2026-07-08 (today is fixed at 2026-07-03 → "5 days left");
// calibration for Engineering pod B runs 2026-07-10, facilitated by
// Priya Raman (VP Engineering).
// ---------------------------------------------------------------------------

const MANAGER = 'Marcus Webb';

const CYCLE = {
  name: 'H1 2026',
  dueDate: '2026-07-08T17:00:00Z',
  daysLeft: 5,
  calibration: {
    session: 'Engineering pod B',
    date: '2026-07-10T16:00:00Z',
    facilitator: 'Priya Raman',
  },
  priorCycle: 'H2 2025',
};

type CompetencyId = 'craft' | 'ownership' | 'collab' | 'comms' | 'lead';

interface Competency {
  id: CompetencyId;
  name: string;
  description: string;
}

// [id, name, description] — the shared five-competency rubric.
const COMPETENCIES: Competency[] = (
  [
    ['craft', 'Craft & execution', 'Quality, rigor, and reliability of shipped work.'],
    ['ownership', 'Ownership & impact', 'Drives outcomes end-to-end; impact beyond assigned scope.'],
    ['collab', 'Collaboration', 'Works across teams; makes partners and peers more effective.'],
    ['comms', 'Communication', 'Clear writing and speaking; keeps stakeholders informed.'],
    ['lead', 'Technical leadership', 'Raises the bar through mentoring, review, and direction.'],
  ] as [CompetencyId, string, string][]
).map(([id, name, description]) => ({id, name, description}));

/** 1–5 anchor labels, shared by every competency scale. */
const SCALE_ANCHORS: Record<number, string> = {1: 'Off track', 2: 'Developing', 3: 'Solid', 4: 'Strong', 5: 'Exceptional'};

type ReviewStatus = 'submitted' | 'draft' | 'not_started';

type Ratings = Record<CompetencyId, number | null>;

interface GoalOutcome {
  id: string;
  title: string;
  /** Team OKR + key result this goal was pulled from. */
  source: string;
  /** Result vs target, spelled out so the pill number is auditable. */
  result: string;
  weightPct: number;
  attainmentPct: number;
}

interface PeerFeedback {
  id: string;
  reviewer: string;
  role: string;
  relationship: 'Peer' | 'Cross-functional' | 'Skip-level';
  requestedAt: string;
  receivedAt?: string;
  quote?: string;
  reminderSentAt?: string;
}

interface Report {
  id: string;
  name: string;
  role: string;
  office: 'SF HQ' | 'Lisbon' | 'Remote-US';
  startDate: string;
  level: string;
  /** H2 2025 ratings; null per-competency for first-cycle employees. */
  lastCycle: Ratings | null;
  goals: GoalOutcome[];
  feedback: PeerFeedback[];
}

const EMPTY_RATINGS: Ratings = {
  craft: null,
  ownership: null,
  collab: null,
  comms: null,
  lead: null,
};

// Compact fixture tuples (office-shared-drive FILE_SPECS pattern):
// goal — [id, title, source, result, weightPct, attainmentPct]
type GoalSpec = [string, string, string, string, number, number];
// feedback — [id, reviewer, role, relationship, requestedAt, extras?]
interface FeedbackExtras {
  received?: string;
  quote?: string;
  reminder?: string;
}
type FeedbackSpec = [
  string,
  string,
  string,
  PeerFeedback['relationship'],
  string,
  FeedbackExtras?,
];

function buildGoals(specs: GoalSpec[]): GoalOutcome[] {
  return specs.map(([id, title, source, result, weightPct, attainmentPct]) => ({
    id,
    title,
    source,
    result,
    weightPct,
    attainmentPct,
  }));
}

function buildFeedback(specs: FeedbackSpec[]): PeerFeedback[] {
  return specs.map(([id, reviewer, role, relationship, requestedAt, extras]) => ({
    id,
    reviewer,
    role,
    relationship,
    requestedAt,
    receivedAt: extras?.received,
    quote: extras?.quote,
    reminderSentAt: extras?.reminder,
  }));
}
const REPORTS: Report[] = [
  {
    id: 'r-leah',
    name: 'Leah Zhang',
    role: 'Senior Platform Engineer',
    office: 'SF HQ',
    startDate: '2023-04-10',
    level: 'L5',
    lastCycle: {craft: 4, ownership: 4, collab: 3, comms: 4, lead: 3},
    goals: buildGoals([
      ['g-leah-1', 'Ship the deploy-preview pipeline to all product teams',
        'Platform OKR 1 · KR1 — developer velocity',
        '11 of 10 teams onboarded (Design Systems joined late)', 40, 110],
      ['g-leah-2', 'Bring staging parity drift below 2 config diffs/week',
        'Platform OKR 2 · KR3 — environment reliability',
        '1.4 diffs/week vs 2.0 target', 35, 100],
      ['g-leah-3', 'Run the on-call quality program for Platform',
        'Platform OKR 2 · KR1 — page rate',
        'Pages down 31% vs 40% target', 25, 78],
    ]),
    feedback: buildFeedback([
      ['f-leah-1', 'Priya Raman', 'VP Engineering', 'Skip-level', '2026-06-22T09:00:00Z',
        {received: '2026-06-25T14:12:00Z',
          quote: 'Leah ran the deploy-preview rollout like a program manager — crisp milestones, no surprises.'}],
      ['f-leah-2', 'Nadia Rahman', 'Senior Platform Engineer', 'Peer', '2026-06-22T09:00:00Z',
        {received: '2026-06-24T10:40:00Z',
          quote: 'Her review comments teach; I write better infra code because of them.'}],
      ['f-leah-3', 'Sofia Ortiz', 'Design lead', 'Cross-functional', '2026-06-22T09:00:00Z',
        {received: '2026-06-27T16:05:00Z',
          quote: 'Deploy previews changed how Design reviews ship — we catch issues a day earlier.'}],
    ]),
  },
  {
    id: 'r-omar',
    name: 'Omar Haddad',
    role: 'Platform Engineer',
    office: 'Remote-US',
    startDate: '2024-01-08',
    level: 'L4',
    lastCycle: {craft: 3, ownership: 3, collab: 4, comms: 3, lead: 2},
    goals: buildGoals([
      ['g-omar-1', 'Migrate the build cache to the regional object store',
        'Platform OKR 1 · KR2 — build infrastructure',
        'Migration complete; cache hit rate 84% vs 80% target', 45, 105],
      ['g-omar-2', 'Cut cold-start provisioning time to under 4 minutes',
        'Platform OKR 1 · KR3 — environment spin-up',
        '3 min 40 s vs 4 min target', 30, 100],
      ['g-omar-3', 'Document the runtime image standard and drive adoption',
        'Platform OKR 3 · KR2 — golden paths',
        '6 of 10 services adopted by June 30', 25, 60],
    ]),
    feedback: buildFeedback([
      ['f-omar-1', 'Leah Zhang', 'Senior Platform Engineer', 'Peer', '2026-06-22T09:10:00Z',
        {received: '2026-06-26T11:22:00Z',
          quote: 'Omar is the person you want on a gnarly migration — methodical and calm.'}],
      ['f-omar-2', 'Tom Okonkwo', 'IT admin', 'Cross-functional', '2026-06-22T09:10:00Z',
        {received: '2026-06-28T09:48:00Z',
          quote: 'He co-owned the runner fleet handoff with IT and left the docs better than he found them.'}],
    ]),
  },
  {
    id: 'r-felix',
    name: 'Felix Braun',
    role: 'Infrastructure Engineer',
    office: 'Lisbon',
    startDate: '2022-09-19',
    level: 'L4',
    lastCycle: {craft: 4, ownership: 3, collab: 3, comms: 3, lead: 3},
    goals: buildGoals([
      ['g-felix-1', 'Consolidate the three legacy CI clusters into one',
        'Platform OKR 1 · KR2 — build infrastructure',
        'Consolidation shipped June 12; $8.4k/mo saved', 50, 100],
      ['g-felix-2', 'Automate quarterly access reviews for infra roles',
        'Platform OKR 2 · KR4 — audit readiness',
        'Automation live; Q2 review closed in 6 days vs 15 last cycle', 30, 120],
      ['g-felix-3', 'Bring infra runbook coverage to 90% of alerts',
        'Platform OKR 2 · KR1 — page rate',
        '81% coverage vs 90% target', 20, 90],
    ]),
    feedback: buildFeedback([
      ['f-felix-1', 'Omar Haddad', 'Platform Engineer', 'Peer', '2026-06-23T08:30:00Z',
        {received: '2026-06-29T15:02:00Z',
          quote: 'The cluster consolidation was invisible to users — that is the highest compliment infra work gets.'}],
      ['f-felix-2', 'Elena Voss', 'Finance lead', 'Cross-functional', '2026-06-23T08:30:00Z',
        {received: '2026-06-30T10:15:00Z',
          quote: 'Felix flagged the CI spend line before Finance did and closed it out himself.'}],
    ]),
  },
  {
    id: 'r-nadia',
    name: 'Nadia Rahman',
    role: 'Senior Platform Engineer',
    office: 'Lisbon',
    startDate: '2023-11-06',
    level: 'L5',
    lastCycle: {craft: 4, ownership: 3, collab: 4, comms: 3, lead: 3},
    goals: buildGoals([
      ['g-nadia-1', 'Cut CI p95 build time below 8 minutes',
        'Platform OKR 1 · KR1 — developer velocity',
        '7.1 min vs 8.0 target (from 11.6 in January)', 30, 118],
      ['g-nadia-2', 'Ship config service v2 to every internal team',
        'Platform OKR 3 · KR1 — golden paths',
        'All 14 internal teams migrated by June 19', 30, 100],
      ['g-nadia-3', 'Reduce flaky-test rate to under 1%',
        'Platform OKR 1 · KR4 — CI signal quality',
        '1.9% vs 1.0% target (from 4.2% in January)', 25, 72],
      ['g-nadia-4', 'Mentor two interns to independent-commit level',
        'People OKR 2 · KR2 — early-career growth',
        'Both interns landing reviewed changes solo since May', 15, 100],
    ]),
    feedback: buildFeedback([
      ['f-nadia-1', 'Sofia Ortiz', 'Design lead', 'Cross-functional', '2026-06-24T09:00:00Z',
        {received: '2026-06-26T13:31:00Z',
          quote: 'Config v2 unblocked the token pipeline Design had been waiting on for two quarters. Nadia treated our deadline like her own.'}],
      ['f-nadia-2', 'Tom Okonkwo', 'IT admin', 'Cross-functional', '2026-06-24T09:00:00Z',
        {received: '2026-06-27T10:08:00Z',
          quote: 'She scripted the runner enrollment flow for IT unprompted — saved us a week of manual MDM work.'}],
      ['f-nadia-3', 'Omar Haddad', 'Platform Engineer', 'Peer', '2026-06-24T09:00:00Z',
        {received: '2026-06-29T17:44:00Z',
          quote: 'Nadia’s flaky-test dashboards made the problem legible. We argue from data now, not vibes.'}],
      ['f-nadia-4', 'Priya Raman', 'VP Engineering', 'Skip-level', '2026-06-24T09:00:00Z',
        {reminder: '2026-07-01T08:15:00Z'}],
      ['f-nadia-5', 'Jonah Fields', 'GTM', 'Cross-functional', '2026-06-24T09:00:00Z'],
    ]),
  },
  {
    id: 'r-grace',
    name: 'Grace Ito',
    role: 'Platform Engineer',
    office: 'SF HQ',
    startDate: '2026-02-02',
    level: 'L3',
    // First cycle at Kestrel — no H2 2025 ghost markers on her scales.
    lastCycle: null,
    goals: buildGoals([
      ['g-grace-1', 'Own the CLI release train (ramp-up goal)',
        'Platform OKR 3 · KR3 — tooling cadence',
        '5 of 5 releases shipped on schedule since March', 50, 100],
      ['g-grace-2', 'Close 40 paper cuts from the DX backlog',
        'Platform OKR 1 · KR5 — developer experience',
        '46 closed vs 40 target', 30, 115],
      ['g-grace-3', 'Reach solo on-call readiness by June',
        'Platform OKR 2 · KR1 — page rate',
        'Shadowed 4 rotations; first solo week July 13', 20, 85],
    ]),
    feedback: buildFeedback([
      ['f-grace-1', 'Leah Zhang', 'Senior Platform Engineer', 'Peer', '2026-06-25T09:00:00Z',
        {received: '2026-06-30T12:20:00Z',
          quote: 'Fastest ramp I have seen at L3 — she was reviewing CLI changes by week six.'}],
      ['f-grace-2', 'Dana Whitfield', 'People Ops', 'Cross-functional', '2026-06-25T09:00:00Z'],
    ]),
  },
  {
    id: 'r-diego',
    name: 'Diego Morales',
    role: 'Site Reliability Engineer',
    office: 'Remote-US',
    startDate: '2024-06-17',
    level: 'L4',
    lastCycle: {craft: 3, ownership: 4, collab: 3, comms: 2, lead: 3},
    goals: buildGoals([
      ['g-diego-1', 'Hold monthly uptime at 99.95% across core services',
        'Platform OKR 2 · KR2 — availability',
        '99.96% average January–June', 40, 102],
      ['g-diego-2', 'Cut mean incident resolution time to under 45 min',
        'Platform OKR 2 · KR1 — page rate',
        '38 min vs 45 target', 35, 116],
      ['g-diego-3', 'Publish postmortems within 5 working days, every time',
        'Platform OKR 2 · KR4 — audit readiness',
        '9 of 12 postmortems on time', 25, 75],
    ]),
    feedback: buildFeedback([
      ['f-diego-1', 'Felix Braun', 'Infrastructure Engineer', 'Peer', '2026-06-25T09:30:00Z',
        {received: '2026-07-01T09:12:00Z',
          quote: 'When production is on fire, Diego is the steadiest voice on the bridge.'}],
      ['f-diego-2', 'Priya Raman', 'VP Engineering', 'Skip-level', '2026-06-25T09:30:00Z'],
    ]),
  },
];

// ---------------------------------------------------------------------------
// REVIEW STATE — per-report ratings + narrative. Three finished reviews,
// Nadia's in-progress draft (one rating and part of the growth section
// still missing), and two untouched. Editing happens in React state seeded
// from these fixtures.
// ---------------------------------------------------------------------------

interface ReviewDraft {
  status: ReviewStatus;
  ratings: Ratings;
  strengths: string;
  growth: string;
  submittedAt?: string;
  lastSavedAt?: string;
}

const INITIAL_DRAFTS: Record<string, ReviewDraft> = {
  'r-leah': {
    status: 'submitted',
    submittedAt: '2026-06-30T15:42:00Z',
    ratings: {craft: 4, ownership: 5, collab: 4, comms: 4, lead: 4},
    strengths:
      'Leah turned the deploy-preview pipeline from a prototype into the default path for eleven teams, and did it while carrying the on-call quality program. Her rollout plan — pilot, feedback loop, then a team-by-team migration calendar — meant zero forced adoptions and no rollback. She has become the reviewer other engineers request by name: her comments consistently trade cleverness for maintainability, and two of the patterns she pushed in review are now part of the Platform style guide. The Design partnership is the clearest signal of growth since H2: Sofia’s team now catches visual regressions a full day earlier, and they credit Leah’s previews directly.',
    growth:
      'The next step to L6 scope is delegation. Leah still holds the hardest migrations herself; handing the Design Systems onboarding to Omar or Grace with her coaching would have grown the team and freed her for the cache architecture work she keeps deferring. The on-call program landed at 78% of its page-reduction target — the miss traces to two services whose owners she chased individually instead of escalating; I want her using the platform-review forum for that leverage next half.',
  },
  'r-omar': {
    status: 'submitted',
    submittedAt: '2026-07-01T11:20:00Z',
    ratings: {craft: 4, ownership: 3, collab: 4, comms: 3, lead: 3},
    strengths:
      'Omar shipped the two hardest infrastructure moves of the half — the build-cache migration and the cold-start work — without a single user-facing incident. His migration runbook was thorough enough that Felix reused its structure for the CI-cluster consolidation. Cache hit rate landed at 84% against an 80% target and cold starts at 3:40 against 4:00, both with headroom left. The IT handoff Tom cites in peer feedback is typical: Omar treats adjacent teams as customers and leaves documentation better than he found it.',
    growth:
      'Adoption work is where Omar should stretch next. The runtime image standard is technically excellent but landed at 6 of 10 services — writing the standard is not the same as selling it, and the last four owners needed a roadshow he was reluctant to run. His written updates are precise but sparse; stakeholders outside Platform read silence as risk. A fortnightly adoption note, in his own voice, would have moved at least two of those services.',
  },
  'r-felix': {
    status: 'submitted',
    submittedAt: '2026-07-02T09:05:00Z',
    ratings: {craft: 4, ownership: 4, collab: 3, comms: 3, lead: 3},
    strengths:
      'Felix closed out the CI-cluster consolidation on schedule and made it boring — the best possible outcome for infra work, as Omar’s peer note says. He spotted the CI spend anomaly before Finance flagged it, sized the fix, and banked $8.4k/month. The access-review automation is the sleeper hit of the half: Q2 closed in six days instead of fifteen, and Elena’s team now points other departments at it as the reference implementation. He is quietly becoming the compliance-minded engineer every platform team needs.',
    growth:
      'Runbook coverage stalled at 81% against a 90% target, mostly on the alerts Felix considers self-explanatory — they are not, to anyone newer than him. Pairing with Grace on the remaining runbooks would close the gap and double as mentoring, which is the competency he most needs reps in before an L5 case. I would also like him presenting the access-review work at an engineering all-hands; the work deserves the visibility and he needs the practice.',
  },
  'r-nadia': {
    status: 'draft',
    lastSavedAt: '2026-07-02T18:26:00Z',
    ratings: {craft: 5, ownership: 4, collab: 4, comms: 3, lead: null},
    strengths:
      'Nadia’s half was defined by compounding wins: CI p95 fell from 11.6 to 7.1 minutes, beating the 8-minute target with six weeks to spare, and config service v2 reached all fourteen internal teams without a single migration rollback. The flaky-test dashboards she built changed how the team argues — as Omar put it, from vibes to data. Cross-team pull is the strongest signal: Design credits her for unblocking the token pipeline (see Sofia’s note), and she scripted IT’s runner enrollment flow unprompted, saving Tom’s team a week. Both interns she mentored have been landing reviewed changes solo since May.',
    growth:
      'Flaky-test rate landed at 1.9% against a 1.0% target. The remaining failures cluster in the two suites she does not own, and she has been fixing them herself rather than pressing the owning teams —',
  },
  'r-grace': {
    status: 'not_started',
    ratings: {...EMPTY_RATINGS},
    strengths: '',
    growth: '',
  },
  'r-diego': {
    status: 'not_started',
    ratings: {...EMPTY_RATINGS},
    strengths: '',
    growth: '',
  },
};

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Fixed-fixture date formatting (UTC) — no locale or clock dependence. */
function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

function formatDateYear(iso: string): string {
  const d = new Date(iso);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;
}

const WORD_TARGET = {min: 100, max: 300};

interface AttainmentMeta {
  label: string;
  color: string;
}

/** Attainment band → pill label/color (goal-outcomes list + summary). */
function attainmentMeta(pct: number): AttainmentMeta {
  if (pct >= 110) {
    return {label: 'Exceeded', color: DATA_COLOR.green};
  }
  if (pct >= 95) {
    return {label: 'Met', color: DATA_COLOR.blue};
  }
  if (pct >= 60) {
    return {label: 'Partial', color: DATA_COLOR.orange};
  }
  return {label: 'Missed', color: DATA_COLOR.red};
}

/** Weight-blended attainment, derived so it always reconciles with rows. */
function weightedAttainment(goals: GoalOutcome[]): number {
  const total = goals.reduce(
    (sum, goal) => sum + goal.weightPct * goal.attainmentPct,
    0,
  );
  const weights = goals.reduce((sum, goal) => sum + goal.weightPct, 0);
  return Math.round(total / weights);
}

function ratingAverage(ratings: Ratings): number | null {
  const values = COMPETENCIES.map(c => ratings[c.id]).filter(
    (v): v is number => v !== null,
  );
  if (values.length === 0) {
    return null;
  }
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function ratedCount(ratings: Ratings): number {
  return COMPETENCIES.filter(c => ratings[c.id] !== null).length;
}

const STATUS_META: Record<ReviewStatus, {label: string; badge: 'success' | 'info' | 'neutral'; icon: typeof CheckCircle2Icon}> = {
  submitted: {label: 'Submitted', badge: 'success', icon: CheckCircle2Icon},
  draft: {label: 'In draft', badge: 'info', icon: FilePenLineIcon},
  not_started: {label: 'Not started', badge: 'neutral', icon: CircleDashedIcon},
};

// ---------------------------------------------------------------------------
// RATING SCALE — five-segment 1–5 control. The current selection fills
// with the accent; the report's H2 2025 rating renders as a dashed ghost
// ring so movement since last cycle is visible at a glance.
// ---------------------------------------------------------------------------

function RatingScale({
  competency,
  value,
  ghost,
  isDisabled,
  onChange,
}: {
  competency: Competency;
  value: number | null;
  ghost: number | null;
  isDisabled: boolean;
  onChange: (next: number) => void;
}) {
  return (
    <VStack gap={1}>
      <div
        role="radiogroup"
        aria-label={`${competency.name} rating`}
        style={styles.scaleRow}>
        {[1, 2, 3, 4, 5].map(step => {
          const isActive = value === step;
          const showGhost = ghost === step && !isActive;
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={`${step} — ${SCALE_ANCHORS[step]}${
                showGhost ? ` (rated ${step} in ${CYCLE.priorCycle})` : ''
              }`}
              disabled={isDisabled}
              onClick={() => onChange(step)}
              style={{
                ...styles.scaleSegment,
                ...(isActive ? styles.scaleSegmentActive : null),
                ...(isDisabled ? styles.scaleSegmentDisabled : null),
              }}>
              {step}
              {showGhost ? <span style={styles.ghostRing} aria-hidden /> : null}
            </button>
          );
        })}
      </div>
      <div style={styles.scaleEnds}>
        <Text type="supporting" size="sm" color="secondary">
          1 · {SCALE_ANCHORS[1]}
        </Text>
        <Text type="supporting" size="sm" color="secondary">
          5 · {SCALE_ANCHORS[5]}
        </Text>
      </div>
    </VStack>
  );
}

function RatingDelta({
  value,
  last,
}: {
  value: number | null;
  last: number | null;
}) {
  if (value === null) {
    return (
      <Text type="supporting" color="secondary">
        Not rated
      </Text>
    );
  }
  const anchor = SCALE_ANCHORS[value];
  if (last === null) {
    return (
      <>
        <Text type="label" size="sm">
          {value} — {anchor}
        </Text>
        <Text type="supporting" size="sm" color="secondary">
          First cycle
        </Text>
      </>
    );
  }
  const delta = value - last;
  const deltaText =
    delta === 0 ? `No change vs ${CYCLE.priorCycle}` : `${delta > 0 ? '+' : ''}${delta} vs ${CYCLE.priorCycle}`;
  const deltaColor =
    delta > 0 ? DATA_COLOR.green : delta < 0 ? DATA_COLOR.red : undefined;
  return (
    <>
      <Text type="label" size="sm">
        {value} — {anchor}
      </Text>
      <span style={{...styles.numeric, fontSize: 12, color: deltaColor ?? 'var(--color-text-secondary)'}}>
        {deltaText}
      </span>
    </>
  );
}

function CompetencySection({
  ratings,
  lastCycle,
  isLocked,
  onRate,
}: {
  ratings: Ratings;
  lastCycle: Ratings | null;
  isLocked: boolean;
  onRate: (id: CompetencyId, value: number) => void;
}) {
  const average = ratingAverage(ratings);
  const rated = ratedCount(ratings);
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Heading level={2}>Competency ratings</Heading>
        </StackItem>
        <Text type="supporting" color="secondary">
          Filled = this cycle · dashed ring = {CYCLE.priorCycle}
        </Text>
      </HStack>
      <div>
        {COMPETENCIES.map((competency, index) => (
          <div key={competency.id}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.compRow}>
              <div style={styles.compLabelCol}>
                <VStack gap={0}>
                  <Text type="label">{competency.name}</Text>
                  <Text type="supporting" color="secondary">
                    {competency.description}
                  </Text>
                </VStack>
              </div>
              <div style={styles.compScaleCol}>
                <RatingScale
                  competency={competency}
                  value={ratings[competency.id]}
                  ghost={lastCycle?.[competency.id] ?? null}
                  isDisabled={isLocked}
                  onChange={next => onRate(competency.id, next)}
                />
              </div>
              <div style={styles.deltaCol}>
                <RatingDelta
                  value={ratings[competency.id]}
                  last={lastCycle?.[competency.id] ?? null}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.ratingSummary}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ClipboardCheckIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" hasTabularNumbers>
            {rated} of {COMPETENCIES.length} competencies rated
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {average === null ? 'Average — pending' : `Average ${average.toFixed(1)} / 5`}
        </Text>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// WRITTEN SECTIONS — Strengths / Growth areas with live word-count hints.
// Under-target drafts get a warning status so the submit gate is legible.
// ---------------------------------------------------------------------------

function WrittenSection({
  label,
  description,
  value,
  isLocked,
  onChange,
}: {
  label: string;
  description: string;
  value: string;
  isLocked: boolean;
  onChange: (next: string) => void;
}) {
  const words = wordCount(value);
  const isUnder = words > 0 && words < WORD_TARGET.min;
  return (
    <VStack gap={1}>
      <TextArea
        label={label}
        description={description}
        value={value}
        onChange={onChange}
        rows={6}
        width="100%"
        isDisabled={isLocked}
        placeholder={`Draft the ${label.toLowerCase()} narrative — cite specific work, not adjectives.`}
        status={
          isUnder
            ? {
                type: 'warning',
                message: `Add specific examples — aim for at least ${WORD_TARGET.min} words.`,
              }
            : undefined
        }
      />
      <div style={styles.wordHintRow}>
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
          {words} {words === 1 ? 'word' : 'words'} · aim for {WORD_TARGET.min}–
          {WORD_TARGET.max}
        </Text>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// GOAL OUTCOMES — pulled from team OKRs; attainment pills per goal and a
// derived weighted-attainment readout that always matches the rows.
// ---------------------------------------------------------------------------

function AttainmentPill({pct}: {pct: number}) {
  const meta = attainmentMeta(pct);
  return (
    <span
      style={{
        ...styles.attainPill,
        color: meta.color,
        border: `1px solid ${meta.color}`,
      }}>
      {pct}% · {meta.label}
    </span>
  );
}

function GoalOutcomesSection({goals}: {goals: GoalOutcome[]}) {
  const weighted = weightedAttainment(goals);
  const weightTotal = goals.reduce((sum, goal) => sum + goal.weightPct, 0);
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Heading level={2}>Goal outcomes</Heading>
        </StackItem>
        <Text type="supporting" color="secondary">
          Pulled from Platform team OKRs · H1 2026
        </Text>
      </HStack>
      <div>
        {goals.map((goal, index) => (
          <div key={goal.id}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.goalRow}>
              <span style={{...styles.statusGlyph, color: attainmentMeta(goal.attainmentPct).color, marginTop: 2}}>
                <Icon icon={TargetIcon} size="sm" color="inherit" />
              </span>
              <StackItem size="fill" style={{minWidth: 0}}>
                <VStack gap={0}>
                  <Text type="label">{goal.title}</Text>
                  <Text type="supporting" color="secondary">
                    {goal.source}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {goal.result}
                  </Text>
                </VStack>
              </StackItem>
              <div style={styles.goalNumbers}>
                <AttainmentPill pct={goal.attainmentPct} />
                <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
                  Weight {goal.weightPct}%
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.ratingSummary}>
        <HStack gap={2} vAlign="center">
          <Icon icon={TargetIcon} size="sm" color="secondary" />
          <Text type="label" size="sm" hasTabularNumbers>
            Weighted attainment {weighted}%
          </Text>
        </HStack>
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {goals.length} goals · weights sum to {weightTotal}%
        </Text>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PEER FEEDBACK — requested vs received quotes for the active report,
// plus the pinned calibration-status note. Renders in the end panel on
// wide viewports and inline at the document bottom below 1180px.
// ---------------------------------------------------------------------------

function PeerQuote({item}: {item: PeerFeedback}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <Avatar name={item.reviewer} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <Text type="label" size="sm" maxLines={1}>
              {item.reviewer}
            </Text>
            <Text type="supporting" size="sm" color="secondary" maxLines={1}>
              {item.role} · {item.relationship}
            </Text>
          </VStack>
        </StackItem>
        <Badge variant="success" label="Received" />
      </HStack>
      <div style={styles.quoteBlock}>
        <Text type="body" color="secondary">
          “{item.quote}”
        </Text>
        <Text type="supporting" size="sm" color="secondary">
          Received {formatDate(item.receivedAt ?? item.requestedAt)}
        </Text>
      </div>
    </VStack>
  );
}

function PeerPending({item}: {item: PeerFeedback}) {
  return (
    <div style={styles.pendingBlock}>
      <Avatar name={item.reviewer} size="small" />
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="label" size="sm" maxLines={1}>
                {item.reviewer}
              </Text>
            </StackItem>
            <Badge variant="warning" label="Requested" />
          </HStack>
          <Text type="supporting" size="sm" color="secondary" maxLines={1}>
            {item.role} · {item.relationship}
          </Text>
          {/* Remind shares the meta row — keeping it out of the name row
              so long reviewer names never truncate in the 320 panel. */}
          <HStack gap={2} vAlign="center">
            <StackItem size="fill" style={{minWidth: 0}}>
              <Text type="supporting" size="sm" color="secondary">
                Requested {formatDate(item.requestedAt)}
                {item.reminderSentAt
                  ? ` · reminder sent ${formatDate(item.reminderSentAt)}`
                  : ''}
              </Text>
            </StackItem>
            <Button
              label="Remind"
              variant="ghost"
              size="sm"
              icon={<Icon icon={MailIcon} size="sm" />}
            />
          </HStack>
        </VStack>
      </StackItem>
    </div>
  );
}

function PeerFeedbackContent({report}: {report: Report}) {
  const received = report.feedback.filter(item => item.receivedAt !== undefined);
  const pending = report.feedback.filter(item => item.receivedAt === undefined);
  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Peer feedback</Heading>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {received.length} of {report.feedback.length} received
        </Text>
      </HStack>
      <ProgressBar
        label={`Peer feedback received for ${report.name}`}
        isLabelHidden
        value={received.length}
        max={report.feedback.length}
        variant="neutral"
        style={{minWidth: 0}}
      />
      {received.map(item => (
        <PeerQuote key={item.id} item={item} />
      ))}
      {pending.length > 0 ? (
        <VStack gap={2}>
          <Text type="label" size="sm" color="secondary">
            Awaiting response
          </Text>
          {pending.map(item => (
            <PeerPending key={item.id} item={item} />
          ))}
        </VStack>
      ) : null}
      {report.feedback.length === 0 ? (
        <EmptyState
          isCompact
          icon={<Icon icon={UsersIcon} size="lg" />}
          title="No feedback requested"
          description="Request peer feedback before drafting so quotes can back your examples."
        />
      ) : null}
    </VStack>
  );
}

function CalibrationNote({status}: {status: ReviewStatus}) {
  return (
    <div style={styles.calibrationStrip}>
      <HStack gap={2} vAlign="start">
        <Icon icon={ScaleIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label" size="sm">
                  Calibration · {CYCLE.calibration.session}
                </Text>
              </StackItem>
              {/* shrink-0 wrapper: the session title yields (wraps) instead
                  of the status token truncating in the 320 panel. */}
              <span style={{flexShrink: 0}}>
                <Token
                  size="sm"
                  color={status === 'submitted' ? 'green' : 'orange'}
                  label={status === 'submitted' ? 'In calibration' : 'Pending'}
                />
              </span>
            </HStack>
            <Text type="supporting" size="sm" color="secondary">
              {formatDateYear(CYCLE.calibration.date)} · facilitated by{' '}
              {CYCLE.calibration.facilitator}. Ratings may shift ±1 in
              session; reviews lock once the pod calibrates.
            </Text>
          </VStack>
        </StackItem>
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// REPORTS RAIL — Marcus Webb's six reports with per-review status, plus a
// pinned cycle-checklist strip whose counts always match the list badges.
// ---------------------------------------------------------------------------

function ReportsRail({
  drafts,
  activeId,
  onSelect,
}: {
  drafts: Record<string, ReviewDraft>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const submitted = REPORTS.filter(r => drafts[r.id].status === 'submitted').length;
  const inDraft = REPORTS.filter(r => drafts[r.id].status === 'draft').length;
  const notStarted = REPORTS.length - submitted - inDraft;
  return (
    <div style={styles.panelFill}>
      <div style={styles.railScroll}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" style={{padding: 'var(--spacing-1) var(--spacing-2)'}}>
            <Avatar name={MANAGER} size="small" />
            <VStack gap={0}>
              <Text type="label" size="sm">
                {MANAGER}
              </Text>
              <Text type="supporting" size="sm" color="secondary">
                Platform lead · 6 reports
              </Text>
            </VStack>
          </HStack>
          <List density="compact">
            {REPORTS.map(report => {
              const status = drafts[report.id].status;
              const meta = STATUS_META[status];
              return (
                <ListItem
                  key={report.id}
                  label={report.name}
                  description={`${report.role} · ${report.office}`}
                  isSelected={report.id === activeId}
                  onClick={() => onSelect(report.id)}
                  startContent={<Avatar name={report.name} size="small" />}
                  endContent={<Badge variant={meta.badge} label={meta.label} />}
                />
              );
            })}
          </List>
        </VStack>
      </div>
      <Divider />
      {/* Cycle checklist strip — counts reconcile with the list badges and
          the header progress readout. */}
      <VStack gap={2} style={styles.railStrip}>
        <Text type="label" size="sm">
          {CYCLE.name} checklist
        </Text>
        <MetadataList columns={1} label={{position: 'start', width: 96}}>
          <MetadataListItem label="Submitted">
            <Text type="body" hasTabularNumbers>
              {submitted} of {REPORTS.length}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="In draft">
            <Text type="body" hasTabularNumbers>
              {inDraft}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Not started">
            <Text type="body" hasTabularNumbers>
              {notStarted}
            </Text>
          </MetadataListItem>
          <MetadataListItem label="Due">
            <Text type="body">
              {formatDate(CYCLE.dueDate)} · {CYCLE.daysLeft} days
            </Text>
          </MetadataListItem>
        </MetadataList>
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUBJECT HEADER — who is being reviewed, with tenure and reporting chain.
// ---------------------------------------------------------------------------

function formatMonthYear(isoDate: string): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function SubjectHeader({
  report,
  draft,
}: {
  report: Report;
  draft: ReviewDraft;
}) {
  return (
    <VStack gap={3}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        {/* Avatar + name form one non-wrapping unit so a narrow document
            column wraps the tokens below instead of orphaning the avatar. */}
        <StackItem size="fill" style={{minWidth: 260}}>
          <HStack gap={3} vAlign="center">
            <Avatar name={report.name} size="medium" />
            <StackItem size="fill" style={{minWidth: 0}}>
              <VStack gap={0}>
                <Heading level={2}>{report.name}</Heading>
                <Text type="supporting" color="secondary">
                  {report.role} · reports to {MANAGER} → Priya Raman (VP
                  Engineering)
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </StackItem>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Token size="sm" color="gray" label={report.office} />
          <Token size="sm" color="gray" label={report.level} />
          <Token
            size="sm"
            color="gray"
            label={`Since ${formatMonthYear(report.startDate)}`}
          />
        </HStack>
      </HStack>
      {draft.status === 'submitted' && draft.submittedAt !== undefined ? (
        <div style={styles.ratingSummary}>
          <HStack gap={2} vAlign="center">
            <span style={{...styles.statusGlyph, color: DATA_COLOR.green}}>
              <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            </span>
            <Text type="label" size="sm">
              Submitted {formatDateYear(draft.submittedAt)} — read-only until
              calibration reopens it
            </Text>
          </HStack>
        </div>
      ) : null}
      {report.lastCycle === null ? (
        <Text type="supporting" color="secondary">
          First review cycle at Kestrel Labs — no {CYCLE.priorCycle} markers
          on the scales below.
        </Text>
      ) : null}
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const REPORT_OPTIONS = REPORTS.map(report => ({
  value: report.id,
  label: report.name,
}));

/** Submit gate: every competency rated, both narratives at target length. */
function isReadyToSubmit(draft: ReviewDraft): boolean {
  return (
    ratedCount(draft.ratings) === COMPETENCIES.length &&
    wordCount(draft.strengths) >= WORD_TARGET.min &&
    wordCount(draft.growth) >= WORD_TARGET.min
  );
}

export default function HrPerformanceReviewTemplate() {
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>(INITIAL_DRAFTS);
  const [activeId, setActiveId] = useState<string>('r-nadia');
  const [announcement, setAnnouncement] = useState('');
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  // Responsive contract: <=1180px drops the feedback panel (quotes render
  // inline); <=860px drops the rail (report Selector appears).
  const isPanelHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');

  const activeReport = useMemo(
    () => REPORTS.find(report => report.id === activeId) ?? REPORTS[0],
    [activeId],
  );
  const activeDraft = drafts[activeReport.id];
  const isLocked = activeDraft.status === 'submitted';
  const submittedCount = REPORTS.filter(
    report => drafts[report.id].status === 'submitted',
  ).length;
  const canSubmit = !isLocked && isReadyToSubmit(activeDraft);

  const touchDraft = (updater: (draft: ReviewDraft) => ReviewDraft) => {
    setDrafts(prev => {
      const current = prev[activeReport.id];
      const next = updater(current);
      return {
        ...prev,
        [activeReport.id]: {
          ...next,
          // First edit moves a not-started review into draft.
          status: next.status === 'not_started' ? 'draft' : next.status,
        },
      };
    });
  };

  const handleRate = (id: CompetencyId, value: number) => {
    touchDraft(draft => ({
      ...draft,
      ratings: {...draft.ratings, [id]: value},
    }));
  };

  const handleStrengths = (value: string) => {
    touchDraft(draft => ({...draft, strengths: value}));
  };

  const handleGrowth = (value: string) => {
    touchDraft(draft => ({...draft, growth: value}));
  };

  const saveDraft = () => {
    touchDraft(draft => ({...draft, lastSavedAt: '2026-07-03T09:24:00Z'}));
    setAnnouncement(`Draft saved for ${activeReport.name}`);
  };

  const confirmSubmit = () => {
    setDrafts(prev => ({
      ...prev,
      [activeReport.id]: {
        ...prev[activeReport.id],
        status: 'submitted',
        submittedAt: '2026-07-03T09:30:00Z',
      },
    }));
    setAnnouncement(
      `Review submitted for ${activeReport.name} — ${submittedCount + 1} of ${REPORTS.length} done`,
    );
    setIsSubmitOpen(false);
  };

  const statusMeta = STATUS_META[activeDraft.status];

  // ----- header: cycle title, due chip, submitted progress -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ClipboardCheckIcon} size="md" color="secondary" />
          <Heading level={1}>Performance reviews</Heading>
          <Token size="sm" color="blue" label={`${CYCLE.name} cycle`} />
        </HStack>
        <StackItem size="fill" />
        <HStack gap={2} vAlign="center">
          <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Due {formatDate(CYCLE.dueDate)} · {CYCLE.daysLeft} days left
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center">
          {/* Footgun: ProgressBar enforces minWidth 48 — pinned narrow. */}
          <ProgressBar
            label="Reviews submitted this cycle"
            isLabelHidden
            value={submittedCount}
            max={REPORTS.length}
            variant="neutral"
            style={styles.headerProgress}
          />
          <Text type="label" size="sm" hasTabularNumbers>
            {submittedCount} of {REPORTS.length} submitted
          </Text>
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ----- subject toolbar: breadcrumb / Selector, status, save + submit ----
  const subjectToolbar = (
    <HStack gap={3} vAlign="center" style={styles.subjectToolbar} wrap="wrap">
      {isCompact ? (
        <Selector
          label="Report under review"
          isLabelHidden
          options={REPORT_OPTIONS}
          value={activeReport.id}
          onChange={value => setActiveId(value)}
          size="sm"
          width={200}
        />
      ) : (
        <Breadcrumbs variant="supporting" label="Review location">
          <BreadcrumbItem onClick={() => {}}>Reviews</BreadcrumbItem>
          <BreadcrumbItem onClick={() => {}}>{CYCLE.name}</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{activeReport.name}</BreadcrumbItem>
        </Breadcrumbs>
      )}
      <HStack gap={1} vAlign="center">
        <Icon icon={statusMeta.icon} size="sm" color="secondary" />
        <Badge variant={statusMeta.badge} label={statusMeta.label} />
      </HStack>
      <StackItem size="fill" />
      {activeDraft.lastSavedAt !== undefined && !isLocked ? (
        <Text type="supporting" size="sm" color="secondary">
          Draft saved {formatDate(activeDraft.lastSavedAt)}
        </Text>
      ) : null}
      {isLocked ? null : (
        <HStack gap={2} vAlign="center">
          <Button
            label="Save draft"
            variant="secondary"
            size="sm"
            icon={<Icon icon={FilePenLineIcon} size="sm" />}
            onClick={saveDraft}
          />
          <Button
            label="Submit review"
            variant="primary"
            size="sm"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            isDisabled={!canSubmit}
            tooltip={
              canSubmit
                ? undefined
                : `Rate all ${COMPETENCIES.length} competencies and reach ${WORD_TARGET.min} words in both written sections`
            }
            onClick={() => setIsSubmitOpen(true)}
          />
        </HStack>
      )}
    </HStack>
  );

  // ----- review document -----
  const reviewDocument = (
    <div style={styles.docBody}>
      <SubjectHeader report={activeReport} draft={activeDraft} />
      <Divider />
      <CompetencySection
        ratings={activeDraft.ratings}
        lastCycle={activeReport.lastCycle}
        isLocked={isLocked}
        onRate={handleRate}
      />
      <Divider />
      <VStack gap={4}>
        <Heading level={2}>Written assessment</Heading>
        <WrittenSection
          label="Strengths"
          description="What went demonstrably well this half — cite shipped work and peer evidence."
          value={activeDraft.strengths}
          isLocked={isLocked}
          onChange={handleStrengths}
        />
        <WrittenSection
          label="Growth areas"
          description="Where the next level of scope lives — specific, forward-looking, kind."
          value={activeDraft.growth}
          isLocked={isLocked}
          onChange={handleGrowth}
        />
      </VStack>
      <Divider />
      <GoalOutcomesSection goals={activeReport.goals} />
      {isPanelHidden ? (
        <>
          <Divider />
          <PeerFeedbackContent report={activeReport} />
          <CalibrationNote status={activeDraft.status} />
        </>
      ) : null}
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel
              width={272}
              padding={0}
              hasDivider
              label="Reports in this cycle">
              <ReportsRail
                drafts={drafts}
                activeId={activeReport.id}
                onSelect={setActiveId}
              />
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {subjectToolbar}
              <Divider />
              <div style={styles.docScroll}>{reviewDocument}</div>
            </div>
          </LayoutContent>
        }
        end={
          isPanelHidden ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Peer feedback and calibration">
              <div style={styles.panelFill}>
                <div style={styles.feedbackScroll}>
                  <PeerFeedbackContent report={activeReport} />
                </div>
                <Divider />
                <CalibrationNote status={activeDraft.status} />
              </div>
            </LayoutPanel>
          )
        }
      />

      <AlertDialog
        isOpen={isSubmitOpen}
        onOpenChange={setIsSubmitOpen}
        title={`Submit ${activeReport.name}'s review?`}
        description={`The review goes to ${CYCLE.calibration.session} calibration on ${formatDateYear(CYCLE.calibration.date)} and becomes read-only. You can reopen it only before the session starts.`}
        actionLabel="Submit review"
        cancelLabel="Keep drafting"
        onAction={confirmSubmit}
      />
    </div>
  );
}












