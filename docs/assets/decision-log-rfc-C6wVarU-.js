var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — a fixed Kestrel Labs / Atlas Q3
 *   decision register (8 RFC records with context/options/decision prose,
 *   reviewer stances, fixed July 2026 ISO dates, countdown strings rendered
 *   as fixed labels against the suite "now" anchor of Wed Jul 15, 2026).
 *   No clocks, no randomness, no network media.
 * @output Decision Log & RFC Review — the Atlas Q3 decision register at
 *   Kestrel Labs. A filterable decision rail (8 records with
 *   Proposed/Accepted/Superseded status chips, domain tags, driver
 *   Avatars); a selected-RFC detail rendered as a static styled doc
 *   ("RFC-014: Single review queue for Atlas launch" — Context / Options
 *   considered / Decision sections) with an anchored comment thread on one
 *   context paragraph; a reviewer-stances row (2 approve, 1 concern with a
 *   note excerpt, 2 pending with a nudge affordance); a decision-metadata
 *   card (driver, approver, decide-by countdown, status, outcome-review
 *   "Revisit in 90 days" chip); a superseded-by Banner on retired records
 *   plus a supersedes-teaser strip on their replacement.
 * @position Page template; emitted by \`astryx template decision-log-rfc\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | decision rail 340 (resizable 300–460; filter chips + search
 *   pinned above an independently scrolling List) | RFC doc content
 *   (scrolls) | end panel 320 (metadata card, scrolls).
 * Container policy: list+detail archetype per table-split-pane — rail
 *   records are dense List rows, not cards; the doc body is styled text on
 *   the content surface. Cards are reserved for genuine summary widgets:
 *   the decision-metadata card in the end panel (inline below the stance
 *   row when the panel drops). Stance tiles, option rows, the comment
 *   thread, and the supersedes teaser are styled divs.
 * Color policy: token-pure. The ONE accent is the theme accent (selection,
 *   proposed-decision statement panel, thread anchor affordances). The only
 *   literals are explicit light-dark() pairs for the amber comment-anchor
 *   highlight and its thread border — a deliberate review-markup tint that
 *   must read on both schemes. Status semantics ride Token colors
 *   (blue/green/gray) and Banner status, never raw hex.
 *
 * Responsive contract:
 * - > 1100px: full three-region frame; rail drag-resizable 300–460.
 * - <= 1100px: the end panel drops; the metadata card renders inline in
 *   the doc flow after the reviewer-stance row.
 * - <= 900px: the resize handle is hidden and the rail keeps a fixed
 *   280px so dense rows are never crushed.
 * - <= 640px: single-pane list/detail — the rail is dropped and the
 *   decision list becomes the content fill; tapping a row swaps to the
 *   RFC doc and a back IconButton returns. Header rows and the stance
 *   grid wrap instead of clipping.
 * - The rail list, the doc body, and the end panel each scroll
 *   independently (minHeight: 0 down every flex chain); filter chips,
 *   search, and the page header are pinned.
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
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  FileTextIcon,
  InboxIcon,
  MessageSquareTextIcon,
  PlusIcon,
  Repeat2Icon,
  ScrollTextIcon,
  SearchIcon,
  SendIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  panelFill: {height: '100%', minHeight: 0},
  railControls: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-3)'},
  railList: {flex: 1, minHeight: 0, overflowY: 'auto'},
  railEmpty: {padding: 'var(--spacing-4) var(--spacing-3)'},
  docScroll: {height: '100%', minHeight: 0, overflowY: 'auto'},
  docColumn: {
    margin: '0 auto',
    maxWidth: 760,
    padding: 'var(--spacing-5) var(--spacing-5) var(--spacing-6)',
    width: '100%',
  },
  docParagraph: {lineHeight: 1.65},
  sectionKicker: {letterSpacing: '0.08em', textTransform: 'uppercase'},
  // Deliberate review-markup tint (explicit light-dark pair; see Color policy).
  anchorHighlight: {
    backgroundColor: 'light-dark(rgba(245, 158, 11, 0.20), rgba(251, 191, 36, 0.18))',
    borderBottom: '2px solid light-dark(#B45309, #FBBF24)',
    borderRadius: 2,
    cursor: 'pointer',
  },
  threadBlock: {
    backgroundColor: 'var(--color-background-muted)',
    borderLeft: '3px solid light-dark(#B45309, #FBBF24)',
    borderRadius: 'var(--radius-container)',
    marginTop: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
  },
  optionRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3)',
  },
  optionRowChosen: {boxShadow: 'inset 0 0 0 1px var(--color-accent)'},
  optionLetter: {
    alignItems: 'center',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    flexShrink: 0,
    fontFamily: 'var(--font-family-code, monospace)',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  decisionPanel: {
    backgroundColor: 'var(--color-background-muted)',
    borderLeft: '3px solid var(--color-accent)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  stanceGrid: {
    display: 'grid',
    gap: 'var(--spacing-2)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  },
  stanceTile: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  stanceNote: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-1) var(--spacing-2)',
  },
  supersedesTeaser: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  supersedesStrip: {
    alignItems: 'center',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  supersedesBody: {
    padding: 'var(--spacing-3)',
  },
  endPanelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  countdownFixed: {whiteSpace: 'nowrap'},
  // Banner descriptions default to secondary text, which lands ~3.2:1 on the
  // dark warning tint — re-pin to primary so the note clears AA on both schemes.
  bannerDescription: {color: 'var(--color-text-primary)'},
  noWrap: {whiteSpace: 'nowrap'},
};

// ---------------------------------------------------------------------------
// TYPES & STATUS MAPS
// ---------------------------------------------------------------------------

type Status = 'proposed' | 'accepted' | 'superseded';
type StanceKind = 'approve' | 'concern' | 'pending';

interface ReviewerStance {
  name: string;
  role: string;
  kind: StanceKind;
  /** Fixed date label, e.g. "Jul 14" — never computed from a clock. */
  at?: string;
  /** Note excerpt shown on concern stances. */
  note?: string;
}

interface OptionRow {
  id: string;
  title: string;
  summary: string;
  isChosen?: boolean;
}

/** Paragraphs are pre-split around the comment anchor — no runtime matching. */
interface DocParagraph {
  id: string;
  pre: string;
  anchored?: string;
  post?: string;
}

interface CommentEntry {
  id: string;
  author: string;
  at: string;
  body: string;
}

interface Decision {
  id: string;
  title: string;
  status: Status;
  domain: string;
  driver: string;
  approver: string;
  /** Rail metadata line, fixed string. */
  updatedLabel: string;
  /** Proposed records: decide-by date + fixed countdown chip. */
  decideBy?: {date: string; countdown: string; isUrgent: boolean};
  /** Accepted / superseded records: where and when it was decided. */
  decidedAt?: {venue: string; date: string};
  /** Outcome-review reminder chip, e.g. "Revisit in 90 days". */
  outcomeReview?: {chip: string; detail: string};
  supersededBy?: {id: string; note: string};
  supersedes?: {id: string; note: string};
  sourceDoc?: string;
  origin?: string;
  context: DocParagraph[];
  options: OptionRow[];
  decisionStatement: string;
  reviewers: ReviewerStance[];
  comments?: {anchorParagraphId: string; entries: CommentEntry[]};
}

const STATUS_LABEL: Record<Status, string> = {
  proposed: 'Proposed',
  accepted: 'Accepted',
  superseded: 'Superseded',
};

const STATUS_TOKEN_COLOR: Record<Status, 'blue' | 'green' | 'gray'> = {
  proposed: 'blue',
  accepted: 'green',
  superseded: 'gray',
};

const STANCE_META: Record<
  StanceKind,
  {label: string; icon: typeof CheckCircle2Icon; color: string}
> = {
  approve: {
    label: 'Approved',
    icon: CheckCircle2Icon,
    color: 'var(--color-text-success, light-dark(#0B991F, #34C759))',
  },
  concern: {
    label: 'Concern',
    icon: AlertTriangleIcon,
    color: 'light-dark(#B45309, #FBBF24)',
  },
  pending: {
    label: 'Pending',
    icon: CircleDashedIcon,
    color: 'var(--color-text-secondary)',
  },
};

const FILTERS: Array<{value: Status | 'all'; label: string}> = [
  {value: 'all', label: 'All'},
  {value: 'proposed', label: 'Proposed'},
  {value: 'accepted', label: 'Accepted'},
  {value: 'superseded', label: 'Superseded'},
];

// ---------------------------------------------------------------------------
// DATA — deterministic Kestrel Labs / Atlas Q3 fixtures.
// Suite "now" anchor: Wednesday, July 15, 2026. Every countdown below is a
// fixed string derived from that anchor, never computed from a clock.
// ---------------------------------------------------------------------------

const DECISIONS: Decision[] = [
  {
    id: 'RFC-014',
    title: 'Single review queue for Atlas launch',
    status: 'proposed',
    domain: 'Process',
    driver: 'Marcus Webb',
    approver: 'Priya Raman',
    updatedLabel: 'Updated Jul 14',
    decideBy: {date: 'Fri Jul 17', countdown: '2 days left', isUrgent: true},
    outcomeReview: {
      chip: 'Revisit in 90 days',
      detail: 'Outcome review scheduled 90 days after the decision date.',
    },
    supersedes: {
      id: 'RFC-006',
      note: 'Retires the two-queue review split once accepted.',
    },
    sourceDoc: 'Atlas Q3 Launch Plan',
    origin: 'Pre-mortem board · "Review bottleneck" cluster (top-voted, 7 dots)',
    context: [
      {
        id: 'c1',
        pre: 'Launch work currently flows through two review queues — an infra queue owned by Platform and a product queue owned by Product & Beta (RFC-006, accepted May 21). Since the beta-cohort expansion was approved on Jul 9, cross-cutting changes land in both queues and wait twice: median time-to-first-review over the last two weeks is 26 hours in the infra queue against 9 hours in the product queue, and 14 launch-checklist items are blocked behind a review in the slower queue today.',
      },
      {
        id: 'c2',
        pre: 'The pre-mortem session on Jul 13 voted "Review bottleneck" the top launch risk — 7 of 21 dots landed on that cluster. ',
        anchored: 'Pricing and billing cutover changes are the sharpest case: they must clear review before the pricing-page copy freeze on Mon Jul 20, and today they queue behind unrelated infra work.',
        post: ' With the launch checklist due to close on Wed Jul 22, every day of review latency now lands directly on the critical path to the Aug 4 launch.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Keep two queues, add reviewers',
        summary: 'Staff two more reviewers on the infra queue. Adds capacity but keeps the double-wait for cross-cutting changes, and reviewer onboarding lands after the Jul 21 cohort expansion — too late to matter.',
      },
      {
        id: 'B',
        title: 'Single queue with a launch-blocking label',
        summary: 'Merge both queues into one Atlas review queue. A launch-blocking label jumps triage and is applied by default to billing-cutover and launch-checklist changes. Marcus triages mornings, Sofia afternoons.',
        isChosen: true,
      },
      {
        id: 'C',
        title: 'Daily review-captain rotation',
        summary: 'Rotate one captain across both queues each day. Spreads load but leaves ownership ambiguous at every hand-off — the same gap that stalled the current split.',
      },
    ],
    decisionStatement: 'Merge the infra and product review queues into a single Atlas review queue on Mon Jul 20. A launch-blocking label jumps triage and is applied by default to billing-cutover and launch-checklist changes; Marcus Webb triages mornings and Sofia Ortiz afternoons until the Aug 4 launch. RFC-006 is retired; the split may return after the outcome review.',
    reviewers: [
      {name: 'Sofia Ortiz', role: 'Design lead', kind: 'approve', at: 'Jul 14'},
      {name: 'Tom Okonkwo', role: 'IT admin', kind: 'approve', at: 'Jul 14'},
      {
        name: 'Elena Voss',
        role: 'Finance lead',
        kind: 'concern',
        at: 'Jul 14',
        note: 'Billing-cutover PRs need a guaranteed fast lane before the Jul 20 freeze — default label or I am a no.',
      },
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'pending'},
      {name: 'Dana Whitfield', role: 'People Ops', kind: 'pending'},
    ],
    comments: {
      anchorParagraphId: 'c2',
      entries: [
        {
          id: 'k1',
          author: 'Elena Voss',
          at: 'Jul 14 · 9:20 AM',
          body: 'Calling this out: billing-cutover PRs cannot inherit a general-queue SLA. We have exactly three review days left before the Jul 20 copy freeze — if the merged queue treats them as ordinary traffic, we slip.',
        },
        {
          id: 'k2',
          author: 'Marcus Webb',
          at: 'Jul 14 · 11:05 AM',
          body: 'Agreed — the launch-blocking label jumps triage, and billing-cutover items carry it by default until the freeze. Folded that into Option B below.',
        },
        {
          id: 'k3',
          author: 'Sofia Ortiz',
          at: 'Jul 14 · 1:47 PM',
          body: 'Design will take the afternoon triage slot so label decisions never rest on one person.',
        },
      ],
    },
  },
  {
    id: 'RFC-013',
    title: 'Expand beta cohort to 500 seats',
    status: 'accepted',
    domain: 'Product & Beta',
    driver: 'Sofia Ortiz',
    approver: 'Priya Raman',
    updatedLabel: 'Decided Jul 9',
    decidedAt: {venue: 'Launch Readiness Review', date: 'Jul 9'},
    outcomeReview: {
      chip: 'Revisit Oct 7',
      detail: 'Outcome review Oct 7, 2026 — 90 days after the decision.',
    },
    sourceDoc: 'Beta Feedback Themes',
    origin: 'Team poll · closed Jul 8',
    context: [
      {
        id: 'c1',
        pre: '"Beta Feedback Themes" (published by Sofia on Jul 6) shows activation holding at 62% across the current 200-seat cohort while the waitlist passed 1,900 requests. Support load per seat has fallen for three consecutive weeks, and the two blocking bugs from the June cohort review shipped fixes on Jul 2.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Hold at 200 seats until GA',
        summary: 'Lowest risk, but launch-day capacity assumptions would go untested at scale.',
      },
      {
        id: 'B',
        title: 'Expand to 500 seats on Jul 21',
        summary: 'Two weeks of at-scale signal before Aug 4; onboarding batched into three waves so support load stays level.',
        isChosen: true,
      },
      {
        id: 'C',
        title: 'Open the waitlist fully',
        summary: 'Maximum signal, but support and billing cutover cannot absorb 1,900 seats before launch.',
      },
    ],
    decisionStatement: 'Expand the beta cohort from 200 to 500 seats on Tue Jul 21, onboarding in three waves through Fri Jul 24. Support staffing holds at current levels; expansion pauses if activation drops below 55% in any wave.',
    reviewers: [
      {name: 'Marcus Webb', role: 'Platform lead', kind: 'approve', at: 'Jul 8'},
      {name: 'Elena Voss', role: 'Finance lead', kind: 'approve', at: 'Jul 8'},
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'approve', at: 'Jul 9'},
      {name: 'Dana Whitfield', role: 'People Ops', kind: 'approve', at: 'Jul 9'},
      {name: 'Tom Okonkwo', role: 'IT admin', kind: 'approve', at: 'Jul 9'},
    ],
  },
  {
    id: 'RFC-012',
    title: 'Freeze pricing-page copy on Mon Jul 20',
    status: 'accepted',
    domain: 'GTM & Comms',
    driver: 'Dana Whitfield',
    approver: 'Jonah Fields',
    updatedLabel: 'Decided Jul 8',
    decidedAt: {venue: 'Async review in #atlas-q3', date: 'Jul 8'},
    sourceDoc: 'Pricing Page Copy',
    context: [
      {
        id: 'c1',
        pre: 'Localization needs ten business days and legal review five; counting back from the Aug 4 launch leaves Mon Jul 20 as the last safe day to freeze "Pricing Page Copy". Edits after that date have twice slipped translated pages past a launch at Kestrel.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Freeze Jul 20, exceptions via Jonah',
        summary: 'Single exception path through the launch PM; legal and localization start from one stable snapshot.',
        isChosen: true,
      },
      {
        id: 'B',
        title: 'Rolling freeze per section',
        summary: 'Lets late pricing changes land, but localization would juggle four snapshots.',
      },
    ],
    decisionStatement: '"Pricing Page Copy" freezes end of day Mon Jul 20. Dana Whitfield owns the freeze; post-freeze edits require a written exception from Jonah Fields and re-enter legal review.',
    reviewers: [
      {name: 'Elena Voss', role: 'Finance lead', kind: 'approve', at: 'Jul 7'},
      {name: 'Sofia Ortiz', role: 'Design lead', kind: 'approve', at: 'Jul 8'},
      {name: 'Marcus Webb', role: 'Platform lead', kind: 'approve', at: 'Jul 8'},
    ],
  },
  {
    id: 'RFC-011',
    title: 'Meter Atlas overages daily, bill monthly',
    status: 'proposed',
    domain: 'Pricing & Billing',
    driver: 'Elena Voss',
    approver: 'Priya Raman',
    updatedLabel: 'Updated Jul 13',
    decideBy: {date: 'Fri Jul 24', countdown: '9 days left', isUrgent: false},
    sourceDoc: 'Atlas Q3 Launch Plan',
    context: [
      {
        id: 'c1',
        pre: 'Atlas tiers ship with included usage; the open question is how overages accrue. Daily metering with a monthly invoice keeps customer bills predictable and gives Finance a reconciliation window before the first post-launch billing cycle on Sep 1.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Meter daily, bill monthly',
        summary: 'Predictable invoices; reconciliation window before Sep 1. Requires the daily rollup job to ship by Jul 28.',
        isChosen: true,
      },
      {
        id: 'B',
        title: 'Real-time metering and billing',
        summary: 'Cleanest data model, but the billing cutover cannot absorb it before launch.',
      },
    ],
    decisionStatement: 'Proposed: meter overages daily and invoice monthly for all Atlas tiers at launch, with the rollup job shipping by Jul 28 and a reconciliation dry run in the week of Aug 10.',
    reviewers: [
      {name: 'Marcus Webb', role: 'Platform lead', kind: 'approve', at: 'Jul 13'},
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'pending'},
      {name: 'Dana Whitfield', role: 'People Ops', kind: 'pending'},
    ],
  },
  {
    id: 'RFC-010',
    title: 'Gate GA launch on accessibility-audit sign-off',
    status: 'proposed',
    domain: 'Product & Beta',
    driver: 'Sofia Ortiz',
    approver: 'Priya Raman',
    updatedLabel: 'Updated Jul 12',
    decideBy: {date: 'Tue Jul 21', countdown: '6 days left', isUrgent: false},
    sourceDoc: 'Atlas Q3 Launch Plan',
    context: [
      {
        id: 'c1',
        pre: 'The external accessibility audit runs the week of Jul 27 — one week before the Aug 4 launch. The proposal makes audit sign-off a launch gate: any critical finding blocks GA until fixed, rather than shipping with a remediation backlog.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Audit sign-off gates GA',
        summary: 'Critical findings block launch; majors get a dated remediation plan. One week of fix buffer is tight but real.',
        isChosen: true,
      },
      {
        id: 'B',
        title: 'Audit informs, does not gate',
        summary: 'Protects the date, but repeats the Q1 pattern where remediation slipped two quarters.',
      },
    ],
    decisionStatement: 'Proposed: GA launch on Aug 4 requires accessibility-audit sign-off. Critical findings block launch; major findings ship with a remediation plan dated within 30 days.',
    reviewers: [
      {name: 'Marcus Webb', role: 'Platform lead', kind: 'approve', at: 'Jul 12'},
      {name: 'Tom Okonkwo', role: 'IT admin', kind: 'approve', at: 'Jul 12'},
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'pending'},
    ],
  },
  {
    id: 'RFC-008',
    title: 'Consolidate program comms in #atlas-q3',
    status: 'accepted',
    domain: 'Enablement & Comms',
    driver: 'Dana Whitfield',
    approver: 'Priya Raman',
    updatedLabel: 'Decided Jun 8',
    decidedAt: {venue: 'Launch Readiness Review', date: 'Jun 4'},
    outcomeReview: {
      chip: 'Reviewed Jul 8 · kept',
      detail: 'First outcome review passed Jul 8 — channel noise down, zero missed announcements.',
    },
    supersedes: {
      id: 'RFC-002',
      note: 'Replaced the weekly email digest with a single program channel.',
    },
    context: [
      {
        id: 'c1',
        pre: 'Program updates were split across a weekly email digest (RFC-002), three workstream channels, and ad-hoc DMs. Two milestone changes in May reached fewer than half the program roster within 48 hours. Consolidating announcements into #atlas-q3 gives one auditable stream with threads per workstream.',
      },
    ],
    options: [
      {
        id: 'A',
        title: 'Single program channel',
        summary: '#atlas-q3 carries all announcements; workstreams thread underneath.',
        isChosen: true,
      },
      {
        id: 'B',
        title: 'Keep the email digest',
        summary: 'Familiar, but one-way and unmeasured — the 48-hour reach problem stays.',
      },
    ],
    decisionStatement: 'All Atlas Q3 program announcements land in #atlas-q3; the weekly email digest is retired. Workstream channels remain for execution chatter, and milestone changes must be posted within one business day.',
    reviewers: [
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'approve', at: 'Jun 3'},
      {name: 'Marcus Webb', role: 'Platform lead', kind: 'approve', at: 'Jun 3'},
      {name: 'Sofia Ortiz', role: 'Design lead', kind: 'approve', at: 'Jun 4'},
    ],
  },
  {
    id: 'RFC-006',
    title: 'Split reviews into infra and product queues',
    status: 'superseded',
    domain: 'Process',
    driver: 'Marcus Webb',
    approver: 'Priya Raman',
    updatedLabel: 'Retired Jul 9',
    decidedAt: {venue: 'Launch Readiness Review', date: 'May 21'},
    supersededBy: {
      id: 'RFC-014',
      note: 'Retired at the Launch Readiness Review on Jul 9; RFC-014 (in review) proposes the single-queue replacement.',
    },
    context: [
      {
        id: 'c1',
        pre: 'Adopted in May to give Platform and Product & Beta independent review SLAs while the workstreams ran on separate codepaths. The Jul 9 review found the split no longer fits: since beta expansion work began, most launch changes cross both queues and wait twice.',
      },
    ],
    options: [],
    decisionStatement: 'Split code review into an infra queue (Platform) and a product queue (Product & Beta), each with its own SLA. Retired Jul 9 — see RFC-014 for the replacement.',
    reviewers: [
      {name: 'Sofia Ortiz', role: 'Design lead', kind: 'approve', at: 'May 20'},
      {name: 'Tom Okonkwo', role: 'IT admin', kind: 'approve', at: 'May 21'},
    ],
  },
  {
    id: 'RFC-002',
    title: 'Weekly email digest for launch updates',
    status: 'superseded',
    domain: 'Enablement & Comms',
    driver: 'Dana Whitfield',
    approver: 'Priya Raman',
    updatedLabel: 'Retired Jun 8',
    decidedAt: {venue: 'Async review', date: 'Apr 30'},
    supersededBy: {
      id: 'RFC-008',
      note: 'Replaced by the #atlas-q3 program channel on Jun 8.',
    },
    context: [
      {
        id: 'c1',
        pre: 'The original program-comms decision: a Friday email digest summarizing milestone movement and workstream status. Open rates fell below 40% by late May and two milestone changes missed the Friday cut entirely.',
      },
    ],
    options: [],
    decisionStatement: 'Send a weekly Friday email digest of launch updates to the program roster. Retired Jun 8 — see RFC-008 for the replacement.',
    reviewers: [
      {name: 'Jonah Fields', role: 'GTM launch PM', kind: 'approve', at: 'Apr 29'},
      {name: 'Priya Raman', role: 'VP Engineering', kind: 'approve', at: 'Apr 30'},
    ],
  },
];

// ---------------------------------------------------------------------------
// DECISION RAIL (start panel)
// ---------------------------------------------------------------------------

function DecisionList({
  decisions,
  selectedId,
  onSelect,
}: {
  decisions: Decision[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (decisions.length === 0) {
    return (
      <div style={styles.railEmpty}>
        <EmptyState
          isCompact
          icon={<Icon icon={InboxIcon} size="lg" />}
          title="No matching decisions"
          description="Try a different search or status filter."
        />
      </div>
    );
  }
  return (
    <List density="compact" hasDividers>
      {decisions.map(decision => (
        <ListItem
          key={decision.id}
          label={decision.title}
          description={\`\${decision.id} · \${decision.driver} · \${decision.updatedLabel}\`}
          startContent={<Avatar name={decision.driver} size="small" />}
          endContent={
            <VStack gap={1} hAlign="end">
              <Token
                size="sm"
                color={STATUS_TOKEN_COLOR[decision.status]}
                label={STATUS_LABEL[decision.status]}
              />
              <Token size="sm" color="gray" label={decision.domain} />
            </VStack>
          }
          onClick={() => onSelect(decision.id)}
          isSelected={decision.id === selectedId}
        />
      ))}
    </List>
  );
}

function DecisionRail({
  filter,
  onFilterChange,
  query,
  onQueryChange,
  decisions,
  selectedId,
  onSelect,
}: {
  filter: Status | 'all';
  onFilterChange: (value: Status | 'all') => void;
  query: string;
  onQueryChange: (value: string) => void;
  decisions: Decision[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <VStack gap={0} style={styles.panelFill}>
      <VStack gap={2} style={styles.railControls}>
        <TextInput
          label="Search decisions"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search id, title, driver..."
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={onQueryChange}
          hasClear
        />
        {/* Filter chips wrap at narrow rail widths instead of clipping. */}
        <HStack gap={1} wrap="wrap">
          {FILTERS.map(item => (
            <ToggleButton
              key={item.value}
              size="sm"
              label={
                item.value === 'all'
                  ? \`\${item.label} (\${DECISIONS.length})\`
                  : \`\${item.label} (\${DECISIONS.filter(d => d.status === item.value).length})\`
              }
              isPressed={filter === item.value}
              onPressedChange={() => onFilterChange(item.value)}
            />
          ))}
        </HStack>
      </VStack>
      <Divider />
      <div style={styles.railList}>
        <DecisionList
          decisions={decisions}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// REVIEWER STANCES
// ---------------------------------------------------------------------------

function stanceSummary(reviewers: ReviewerStance[]): string {
  const approved = reviewers.filter(r => r.kind === 'approve').length;
  const concerns = reviewers.filter(r => r.kind === 'concern').length;
  const pending = reviewers.filter(r => r.kind === 'pending').length;
  const parts = [\`\${approved} of \${reviewers.length} approved\`];
  if (concerns > 0) {
    parts.push(\`\${concerns} concern\${concerns === 1 ? '' : 's'}\`);
  }
  if (pending > 0) {
    parts.push(\`\${pending} pending\`);
  }
  return parts.join(' · ');
}

function StanceTile({
  stance,
  isNudged,
  onNudge,
}: {
  stance: ReviewerStance;
  isNudged: boolean;
  onNudge: (name: string) => void;
}) {
  const meta = STANCE_META[stance.kind];
  return (
    <div style={styles.stanceTile}>
      <HStack gap={2} vAlign="center">
        <Avatar name={stance.name} size="small" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="label">{stance.name}</Text>
            <Text type="supporting" color="secondary">
              {stance.role}
            </Text>
          </VStack>
        </StackItem>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span style={{color: meta.color, display: 'inline-flex'}}>
          <Icon icon={meta.icon} size="sm" color="inherit" />
        </span>
        <Text type="supporting">{meta.label}</Text>
        {stance.at != null && (
          <Text type="supporting" color="secondary">
            · {stance.at}
          </Text>
        )}
      </HStack>
      {stance.kind === 'concern' && stance.note != null && (
        <div style={styles.stanceNote}>
          <Text type="supporting">“{stance.note}”</Text>
        </div>
      )}
      {stance.kind === 'pending' && (
        <div>
          <Button
            label={isNudged ? 'Nudge sent' : 'Nudge'}
            size="sm"
            variant="ghost"
            icon={<Icon icon={BellIcon} size="sm" />}
            isDisabled={isNudged}
            onClick={() => onNudge(stance.name)}
          />
        </div>
      )}
    </div>
  );
}

function StanceRow({
  decision,
  nudged,
  onNudge,
}: {
  decision: Decision;
  nudged: ReadonlySet<string>;
  onNudge: (name: string) => void;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="supporting" color="secondary" style={styles.sectionKicker}>
          Reviewers
        </Text>
        <Text type="supporting" color="secondary">
          {stanceSummary(decision.reviewers)}
        </Text>
      </HStack>
      <div style={styles.stanceGrid}>
        {decision.reviewers.map(stance => (
          <StanceTile
            key={\`\${decision.id}-\${stance.name}\`}
            stance={stance}
            isNudged={nudged.has(\`\${decision.id}:\${stance.name}\`)}
            onNudge={name => onNudge(\`\${decision.id}:\${name}\`)}
          />
        ))}
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// RFC DOC BODY — static styled document (Context / Options / Decision)
// ---------------------------------------------------------------------------

function SectionKicker({label}: {label: string}) {
  return (
    <Text type="supporting" color="secondary" style={styles.sectionKicker}>
      {label}
    </Text>
  );
}

function CommentThread({
  decision,
  reply,
  onReplyChange,
}: {
  decision: Decision;
  reply: string;
  onReplyChange: (value: string) => void;
}) {
  const comments = decision.comments;
  if (comments == null) {
    return null;
  }
  return (
    <div style={styles.threadBlock}>
      <VStack gap={3}>
        <HStack gap={2} vAlign="center">
          <Icon icon={MessageSquareTextIcon} size="sm" color="secondary" />
          <Text type="label">
            Thread on this paragraph · {comments.entries.length} comments
          </Text>
        </HStack>
        {comments.entries.map(entry => (
          <HStack key={entry.id} gap={2} vAlign="start">
            <Avatar name={entry.author} size="small" />
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label">{entry.author}</Text>
                  <Text type="supporting" color="secondary">
                    {entry.at}
                  </Text>
                </HStack>
                <Text type="body">{entry.body}</Text>
              </VStack>
            </StackItem>
          </HStack>
        ))}
        <VStack gap={2}>
          <TextArea
            label="Reply to thread"
            isLabelHidden
            placeholder="Reply to this thread..."
            value={reply}
            onChange={onReplyChange}
            rows={2}
            width="100%"
          />
          <HStack gap={2}>
            <StackItem size="fill" />
            <Button
              label="Reply"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" />}
              isDisabled={reply.trim().length === 0}
            />
          </HStack>
        </VStack>
      </VStack>
    </div>
  );
}

function ContextSection({
  decision,
  isThreadOpen,
  onToggleThread,
  reply,
  onReplyChange,
}: {
  decision: Decision;
  isThreadOpen: boolean;
  onToggleThread: () => void;
  reply: string;
  onReplyChange: (value: string) => void;
}) {
  const anchorId = decision.comments?.anchorParagraphId;
  return (
    <VStack gap={2}>
      <SectionKicker label="Context" />
      {decision.context.map(paragraph => {
        const isAnchor = anchorId != null && paragraph.id === anchorId;
        return (
          <div key={paragraph.id}>
            <Text type="body" style={styles.docParagraph}>
              {paragraph.pre}
              {paragraph.anchored != null && (
                <span
                  style={styles.anchorHighlight}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isThreadOpen}
                  aria-label={\`Comment thread anchored to this sentence (\${decision.comments?.entries.length ?? 0} comments)\`}
                  onClick={onToggleThread}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onToggleThread();
                    }
                  }}>
                  {paragraph.anchored}
                </span>
              )}
              {paragraph.post}
            </Text>
            {isAnchor && isThreadOpen ? (
              <CommentThread
                decision={decision}
                reply={reply}
                onReplyChange={onReplyChange}
              />
            ) : null}
          </div>
        );
      })}
    </VStack>
  );
}

function OptionsSection({decision}: {decision: Decision}) {
  return (
    <VStack gap={2}>
      <SectionKicker label="Options considered" />
      {decision.options.map(option => (
        <div
          key={option.id}
          style={
            option.isChosen
              ? {...styles.optionRow, ...styles.optionRowChosen}
              : styles.optionRow
          }>
          <HStack gap={3} vAlign="start">
            <div style={styles.optionLetter}>
              <Text type="label">{option.id}</Text>
            </div>
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label">{option.title}</Text>
                  {option.isChosen === true && (
                    <Token
                      size="sm"
                      color={decision.status === 'proposed' ? 'blue' : 'green'}
                      label={decision.status === 'proposed' ? 'Proposed pick' : 'Chosen'}
                    />
                  )}
                </HStack>
                <Text type="body" color="secondary" style={styles.docParagraph}>
                  {option.summary}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
        </div>
      ))}
    </VStack>
  );
}

function DecisionSection({decision}: {decision: Decision}) {
  return (
    <VStack gap={2}>
      <SectionKicker label="Decision" />
      <div style={styles.decisionPanel}>
        <Text type="body" style={styles.docParagraph}>
          {decision.decisionStatement}
        </Text>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// METADATA CARD, ACTIVITY & SUPERSEDES TEASER
// ---------------------------------------------------------------------------

function PersonInline({name}: {name: string}) {
  return (
    <HStack gap={1} vAlign="center">
      <Avatar name={name} size={20} />
      <Text type="body">{name}</Text>
    </HStack>
  );
}

function MetadataCard({decision}: {decision: Decision}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        <Heading level={3}>Decision metadata</Heading>
        <MetadataList columns={1} label={{position: 'start', width: 96}}>
          <MetadataListItem label="Status">
            <Token
              size="sm"
              color={STATUS_TOKEN_COLOR[decision.status]}
              label={STATUS_LABEL[decision.status]}
            />
          </MetadataListItem>
          <MetadataListItem label="Driver">
            <PersonInline name={decision.driver} />
          </MetadataListItem>
          <MetadataListItem label="Approver">
            <PersonInline name={decision.approver} />
          </MetadataListItem>
          <MetadataListItem label="Domain">
            <Token size="sm" color="gray" label={decision.domain} />
          </MetadataListItem>
          {decision.decideBy != null && (
            <MetadataListItem label="Decide by">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="body" style={styles.countdownFixed}>
                  {decision.decideBy.date}
                </Text>
                <Token
                  size="sm"
                  color={decision.decideBy.isUrgent ? 'yellow' : 'gray'}
                  icon={<Icon icon={ClockIcon} size="sm" />}
                  label={decision.decideBy.countdown}
                />
              </HStack>
            </MetadataListItem>
          )}
          {decision.decidedAt != null && (
            <MetadataListItem label="Decided">
              <Text type="body">
                {decision.decidedAt.venue} · {decision.decidedAt.date}
              </Text>
            </MetadataListItem>
          )}
          {decision.sourceDoc != null && (
            <MetadataListItem label="Source doc">
              <Token
                size="sm"
                icon={<Icon icon={FileTextIcon} size="sm" />}
                label={decision.sourceDoc}
                onClick={() => {}}
              />
            </MetadataListItem>
          )}
          {decision.origin != null && (
            <MetadataListItem label="Origin">
              <Text type="body">{decision.origin}</Text>
            </MetadataListItem>
          )}
          {decision.outcomeReview != null && (
            <MetadataListItem label="Outcome review">
              <VStack gap={1} hAlign="start">
                <Token
                  size="sm"
                  color="teal"
                  icon={<Icon icon={CalendarClockIcon} size="sm" />}
                  label={decision.outcomeReview.chip}
                />
                <Text type="supporting" color="secondary">
                  {decision.outcomeReview.detail}
                </Text>
              </VStack>
            </MetadataListItem>
          )}
        </MetadataList>
      </VStack>
    </Card>
  );
}

/**
 * Compact teaser of the OLDER decision this record replaces, carrying the
 * superseded-by banner variant as a tinted strip above the teaser body.
 */
function SupersedesTeaser({
  decision,
  older,
  onOpen,
}: {
  decision: Decision;
  older: Decision;
  onOpen: (id: string) => void;
}) {
  return (
    <VStack gap={2}>
      <SectionKicker label="Supersedes" />
      <div style={styles.supersedesTeaser}>
        <div style={styles.supersedesStrip}>
          <Icon icon={Repeat2Icon} size="sm" color="secondary" />
          <Text type="supporting" color="secondary">
            {older.id} · {older.updatedLabel} — {decision.supersedes?.note}
          </Text>
        </div>
        <div style={styles.supersedesBody}>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <VStack gap={1}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label">{older.title}</Text>
                  <Token
                    size="sm"
                    color={STATUS_TOKEN_COLOR[older.status]}
                    label={STATUS_LABEL[older.status]}
                  />
                </HStack>
                <Text type="supporting" color="secondary">
                  Decided {older.decidedAt?.venue} · {older.decidedAt?.date} · Driver{' '}
                  {older.driver}
                </Text>
              </VStack>
            </StackItem>
            <Button
              label={\`Open \${older.id}\`}
              size="sm"
              variant="secondary"
              icon={<Icon icon={ArrowRightIcon} size="sm" />}
              onClick={() => onOpen(older.id)}
            />
          </HStack>
        </div>
      </div>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// RFC DETAIL (content pane)
// ---------------------------------------------------------------------------

function DecisionDetail({
  decision,
  showInlineMetadata,
  nudged,
  onNudge,
  onOpenDecision,
  onBack,
}: {
  decision: Decision;
  showInlineMetadata: boolean;
  nudged: ReadonlySet<string>;
  onNudge: (key: string) => void;
  onOpenDecision: (id: string) => void;
  onBack?: () => void;
}) {
  const [isThreadOpen, setIsThreadOpen] = useState(true);
  const [reply, setReply] = useState('');
  const older =
    decision.supersedes != null
      ? DECISIONS.find(d => d.id === decision.supersedes?.id) ?? null
      : null;
  const commentCount = decision.comments?.entries.length ?? 0;

  return (
    <div style={styles.docScroll}>
      <VStack gap={5} style={styles.docColumn}>
        {/* Superseded records lead with the superseded-by banner variant. */}
        {decision.supersededBy != null && (
          <Banner
            status="warning"
            title={
              <>
                Superseded by{' '}
                {/* Keep the RFC id from breaking after its hyphen. */}
                <span style={styles.noWrap}>{decision.supersededBy.id}</span>
              </>
            }
            description={
              <span style={styles.bannerDescription}>
                {decision.supersededBy.note}
              </span>
            }
            endContent={
              <Button
                label={\`Open \${decision.supersededBy.id}\`}
                size="sm"
                variant="secondary"
                onClick={() => onOpenDecision(decision.supersededBy?.id ?? '')}
              />
            }
          />
        )}

        {/* Doc header */}
        <VStack gap={2}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            {onBack != null && (
              <IconButton
                label="Back to decision list"
                tooltip="Back to decision list"
                size="sm"
                variant="ghost"
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                onClick={onBack}
              />
            )}
            <Icon icon={ScrollTextIcon} size="sm" color="secondary" />
            <Text type="supporting" color="secondary">
              {decision.id}
            </Text>
            <Token
              size="sm"
              color={STATUS_TOKEN_COLOR[decision.status]}
              label={STATUS_LABEL[decision.status]}
            />
            <Token size="sm" color="gray" label={decision.domain} />
            <StackItem size="fill" />
            {commentCount > 0 && (
              <Token
                size="sm"
                icon={<Icon icon={MessageSquareTextIcon} size="sm" />}
                label={\`\${commentCount} comments\`}
                onClick={() => setIsThreadOpen(open => !open)}
              />
            )}
          </HStack>
          <Heading level={2}>
            {decision.id}: {decision.title}
          </Heading>
          <Text type="supporting" color="secondary">
            Driver {decision.driver} · Approver {decision.approver}
            {decision.decideBy != null
              ? \` · Decide by \${decision.decideBy.date}\`
              : decision.decidedAt != null
                ? \` · Decided \${decision.decidedAt.date}\`
                : ''}
          </Text>
        </VStack>

        <StanceRow decision={decision} nudged={nudged} onNudge={onNudge} />

        {/* End panel drops <=1100px; the metadata card renders inline here. */}
        {showInlineMetadata && <MetadataCard decision={decision} />}

        <Divider />

        <ContextSection
          decision={decision}
          isThreadOpen={isThreadOpen}
          onToggleThread={() => setIsThreadOpen(open => !open)}
          reply={reply}
          onReplyChange={setReply}
        />

        {decision.options.length > 0 && <OptionsSection decision={decision} />}

        <DecisionSection decision={decision} />

        {older != null && (
          <SupersedesTeaser
            decision={decision}
            older={older}
            onOpen={onOpenDecision}
          />
        )}
      </VStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function DecisionLogRfcTemplate() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(DECISIONS[0].id);
  const [nudged, setNudged] = useState<ReadonlySet<string>>(new Set());

  // Responsive contract: <=1100px drops the end panel (metadata card moves
  // inline); <=900px pins the rail at 280 with no resize handle; <=640px
  // collapses to single-pane list/detail with a back button.
  const isNoEndPanel = useMediaQuery('(max-width: 1100px)');
  const isNarrow = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const [isDetailShownOnPhone, setIsDetailShownOnPhone] = useState(false);

  const railPanel = useResizable({
    defaultSize: 340,
    minSizePx: 300,
    maxSizePx: 460,
  });

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return DECISIONS.filter(decision => {
      if (filter !== 'all' && decision.status !== filter) {
        return false;
      }
      if (needle.length === 0) {
        return true;
      }
      return [decision.id, decision.title, decision.domain, decision.driver]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [filter, query]);

  const selected = visible.find(decision => decision.id === selectedId) ?? null;
  const proposedCount = DECISIONS.filter(d => d.status === 'proposed').length;

  const openDecision = (id: string) => {
    // Cross-links (superseded-by banner, supersedes teaser) may target a
    // record hidden by the current filter — reset it so the jump lands.
    if (!visible.some(decision => decision.id === id)) {
      setFilter('all');
      setQuery('');
    }
    setSelectedId(id);
    setIsDetailShownOnPhone(true);
  };

  const handleNudge = (key: string) =>
    setNudged(previous => new Set(previous).add(key));

  const railPane = (
    <DecisionRail
      filter={filter}
      onFilterChange={setFilter}
      query={query}
      onQueryChange={setQuery}
      decisions={visible}
      selectedId={selected?.id ?? null}
      onSelect={openDecision}
    />
  );

  const detailPane =
    selected != null ? (
      <DecisionDetail
        key={selected.id}
        decision={selected}
        showInlineMetadata={isNoEndPanel}
        nudged={nudged}
        onNudge={handleNudge}
        onOpenDecision={openDecision}
        onBack={isPhone ? () => setIsDetailShownOnPhone(false) : undefined}
      />
    ) : (
      <EmptyState
        title="No decision selected"
        description="Select a record from the register to read its RFC."
        icon={<Icon icon={ScrollTextIcon} size="lg" />}
      />
    );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" wrap={isPhone ? 'wrap' : 'nowrap'}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>Decision log</Heading>
                  <Text type="supporting" color="secondary">
                    Atlas Q3 · Kestrel Labs · {DECISIONS.length} decisions ·{' '}
                    {proposedCount} in review
                  </Text>
                </HStack>
              </StackItem>
              <Button
                label="New RFC"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" />}
              />
            </HStack>
          </LayoutHeader>
        }
        start={
          isPhone ? undefined : isNarrow ? (
            <LayoutPanel width={280} padding={0} hasDivider label="Decision register">
              {railPane}
            </LayoutPanel>
          ) : (
            <>
              <LayoutPanel
                resizable={railPanel.props}
                padding={0}
                label="Decision register">
                {railPane}
              </LayoutPanel>
              <ResizeHandle
                direction="horizontal"
                hasDivider
                isAlwaysVisible={false}
                resizable={railPanel.props}
                label="Resize decision register"
              />
            </>
          )
        }
        content={
          <LayoutContent padding={0}>
            {isPhone && (!isDetailShownOnPhone || selected === null)
              ? railPane
              : detailPane}
          </LayoutContent>
        }
        end={
          isNoEndPanel || selected == null ? undefined : (
            <LayoutPanel width={320} padding={0} hasDivider label="Decision metadata">
              <div style={styles.endPanelScroll}>
                <MetadataCard decision={selected} />
              </div>
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};