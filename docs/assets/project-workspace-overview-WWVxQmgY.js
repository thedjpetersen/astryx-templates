var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs "Atlas Launch
 *   Readiness" project record (health, phase, member roster, goals, five
 *   dated milestones on a fixed July–August 2026 window, six linked
 *   resources with fixed staleness strings, four workstream statuses,
 *   two risks, three decision-log records). Suite "now" anchor is
 *   Wednesday, July 15, 2026; every relative string is a fixed literal,
 *   never computed from a clock. No randomness, no network media.
 * @output Project Workspace Overview — the single project home for the
 *   Kestrel Labs "Atlas Launch Readiness" project (the Atlas Q3 program's
 *   launch push). A project header with an at-risk health pill, phase
 *   chip, member facepile, and next-review chip; a description block with
 *   three inline goal rows; a milestone timeline strip (five milestones on
 *   one shared px-per-day scale, one slipped with a struck-through
 *   original date, today marker at Jul 15); a linked-resources grid
 *   (docs / board / dashboard tiles with app-colored glyphs and staleness
 *   badges); four workstream cards (owner, status, progress, next
 *   milestone); a risks & blockers list (two risks with severity chips
 *   and mitigation owners); and a recent-decisions rail citing the Atlas
 *   Q3 decision-log records.
 * @position Page template; emitted by \`astryx template
 *   project-workspace-overview\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (breadcrumb + title row + meta chips, wraps)
 *   | content (single scroll column: description & goals, milestone
 *   strip, resources grid, workstream cards, risks list)
 *   | end panel 340 (recent decisions, scrolls independently).
 * Container policy: app-shell archetype — frame rows, styled-div tiles,
 *   and panels only; no design-system Cards. Workstream "cards",
 *   resource tiles, and decision entries are bordered divs sharing one
 *   radius/padding rhythm.
 * Color policy: token-pure. The one accent stays on interactive chrome
 *   and the launch-target milestone. Health/status colors come from
 *   semantic tokens (StatusDot / Token / ProgressBar variants); the only
 *   literals are the \`light-dark()\` fallback pairs on the data-viz
 *   categorical tokens used for resource-app glyphs and milestone
 *   markers (the demo does not inject \`--color-data-categorical-*\`).
 *
 * Responsive contract:
 * - > 1180px: full frame with the 340px decisions rail.
 * - <= 1180px: the rail is dropped and the same decisions list renders
 *   as the final content section, so the records never disappear.
 * - <= 860px: the header rows wrap (never clip); resource and
 *   workstream grids collapse via auto-fill minmax; the milestone strip
 *   keeps its fixed px-per-day geometry and scrolls horizontally inside
 *   a non-scrolling section shell (deliberate, labeled).
 * - The content column and the decisions rail scroll independently
 *   (\`minHeight: 0\` down both flex chains).
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ActivityIcon,
  BellIcon,
  BellPlusIcon,
  CalendarClockIcon,
  FileTextIcon,
  FlagIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  LinkIcon,
  ScaleIcon,
  ShieldAlertIcon,
  StickyNoteIcon,
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {BreadcrumbItem, Breadcrumbs} from '@astryxdesign/core/Breadcrumbs';
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
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    padding: 0,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  // Header ----------------------------------------------------------------
  headerBlock: {padding: 'var(--spacing-2) 0 var(--spacing-1)'},
  projectGlyph: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-accent)',
  },
  healthPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    whiteSpace: 'nowrap',
  },
  metaChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  // Content column ----------------------------------------------------------
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4) var(--spacing-5) var(--spacing-6)',
  },
  contentInner: {maxWidth: 1080, marginInline: 'auto'},
  sectionHead: {marginBottom: 'var(--spacing-2)'},
  // Description & goals -----------------------------------------------------
  descriptionBlock: {
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  goalRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-1) 0',
    minWidth: 0,
  },
  goalIcon: {
    display: 'inline-flex',
    flexShrink: 0,
    marginTop: 2,
    color: 'var(--color-accent)',
  },
  // Milestone strip -----------------------------------------------------
  // The section shell never scrolls; the inner wrap owns horizontal
  // scrolling so the strip's fixed px-per-day geometry survives narrow
  // viewports (documented in the responsive contract).
  stripShell: {
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
  },
  stripScroll: {overflowX: 'auto', padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)'},
  stripTrack: {position: 'relative', height: 172},
  stripAxis: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 118,
    height: 2,
    backgroundColor: 'var(--color-border)',
  },
  weekTick: {
    position: 'absolute',
    top: 112,
    width: 1,
    height: 14,
    backgroundColor: 'var(--color-border)',
  },
  weekLabel: {
    position: 'absolute',
    top: 134,
    transform: 'translateX(-50%)',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  todayLine: {
    position: 'absolute',
    top: 30,
    bottom: 34,
    width: 2,
    backgroundColor: 'var(--color-accent)',
    opacity: 0.8,
  },
  todayFlag: {
    position: 'absolute',
    top: 6,
    transform: 'translateX(-50%)',
    padding: '1px 8px',
    borderRadius: 999,
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-on-accent)',
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  msDot: {
    position: 'absolute',
    top: 114,
    width: 10,
    height: 10,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    border: '2px solid var(--color-background-surface)',
  },
  msStem: {position: 'absolute', width: 1, backgroundColor: 'var(--color-border)'},
  msLabel: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    width: 176,
    textAlign: 'center',
  },
  msDate: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  msDateStruck: {
    textDecoration: 'line-through',
    color: 'var(--color-text-secondary)',
    opacity: 0.7,
    marginRight: 4,
  },
  stripLegend: {
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    flexWrap: 'wrap',
  },
  // Linked resources ------------------------------------------------------
  resourceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  resourceTile: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  resourceIconTile: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    flexShrink: 0,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  resourceBadgeRow: {
    display: 'flex',
    justifyContent: 'flex-start',
    marginTop: 'var(--spacing-1)',
  },
  // Workstream cards --------------------------------------------------------
  wsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 'var(--spacing-2)',
  },
  wsCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  wsChipGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    marginTop: 'auto',
  },
  wsMilestoneChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 8px',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    minWidth: 0,
  },
  wsFootnote: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
  },
  // Risks -------------------------------------------------------------------
  riskRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
    flexWrap: 'wrap',
  },
  riskBody: {flex: '1 1 320px', minWidth: 0},
  riskOwnerCol: {flex: '0 0 auto'},
  // Decisions rail ------------------------------------------------------
  railFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  railHead: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)'},
  railScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--spacing-3) var(--spacing-3)'},
  decisionEntry: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-1)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  decisionSource: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--color-text-secondary)',
    minWidth: 0,
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — Kestrel Labs · Atlas Launch Readiness (now = Wed Jul 15, 2026)
// ---------------------------------------------------------------------------

// Data-viz categorical fallbacks — the demo does not inject these tokens.
const CATEGORICAL = {
  blue: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  purple: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  green: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  orange: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  teal: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

const PROJECT = {
  org: 'Kestrel Labs',
  name: 'Atlas Launch Readiness',
  phase: 'Phase 3 of 4 · Launch prep',
  health: 'At risk',
  healthNote: 'Health set by Priya Raman · Tue Jul 14',
  countdown: '20 days to launch · Tue Aug 4',
  nextReview: 'Next review · Thu Jul 16, 10:00 AM',
  channel: '#atlas-q3',
  description:
    'The launch push for the Atlas Q3 program: expand the beta cohort, ' +
    'close the launch checklist, and get pricing & billing GA-ready for ' +
    'the Tue Aug 4 launch. Weekly Launch Readiness Review on Thursdays ' +
    '(Priya organizes); daily async standup in #atlas-q3.',
} as const;

// Priya leads; the four stream leads shown in the facepile; Dana plus the
// two July new hires (Ava, Ken) fold into the +3 overflow — 8 members.
const MEMBERS = [
  'Priya Raman',
  'Marcus Webb',
  'Sofia Ortiz',
  'Jonah Fields',
  'Elena Voss',
] as const;
const MEMBER_OVERFLOW = 3; // Dana Whitfield, Ava Lindqvist, Ken Tanaka

interface Goal {
  id: string;
  text: string;
  due: string;
  owner: string;
}

const GOALS: Goal[] = [
  {
    id: 'g1',
    text: 'Expand the beta cohort to 500 seats without regressing p95 latency',
    due: 'Tue Jul 21',
    owner: 'Sofia Ortiz',
  },
  {
    id: 'g2',
    text: 'Close every item on the launch checklist',
    due: 'Wed Jul 22',
    owner: 'Jonah Fields',
  },
  {
    id: 'g3',
    text: 'Ship GA-ready pricing & billing, copy frozen and cutover staged',
    due: 'Tue Aug 4',
    owner: 'Elena Voss',
  },
];

// Milestone strip — one shared px-per-day scale from Mon Jul 6 to Sat
// Aug 8, 2026. \`day\` = offset from Jul 6; today (Wed Jul 15) is day 9.
const PX_PER_DAY = 36;
const WINDOW_DAYS = 33;
const TODAY_DAY = 9;

type MilestoneStatus = 'done' | 'slipped' | 'onTrack' | 'target';

interface Milestone {
  id: string;
  name: string;
  day: number;
  date: string;
  slippedFrom?: {day: number; date: string};
  status: MilestoneStatus;
  tier: 1 | 2;
  /** Horizontal label nudge (px) so a label never sits on the today line. */
  labelShift?: number;
}

const MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: 'Beta cohort at 250 seats',
    day: 3,
    date: 'Thu Jul 9',
    status: 'done',
    tier: 1,
  },
  {
    id: 'm2',
    name: 'Pricing page copy freeze',
    day: 11,
    date: 'Fri Jul 17',
    slippedFrom: {day: 4, date: 'Jul 10'},
    status: 'slipped',
    tier: 2,
    // Two days right of the today line — nudge the label clear of it.
    labelShift: 16,
  },
  {
    id: 'm3',
    name: 'Beta cohort at 500 seats',
    day: 15,
    date: 'Tue Jul 21',
    status: 'onTrack',
    tier: 1,
  },
  {
    id: 'm4',
    name: 'Launch checklist closed',
    day: 16,
    date: 'Wed Jul 22',
    status: 'onTrack',
    tier: 2,
  },
  {
    id: 'm5',
    name: 'Launch',
    day: 29,
    date: 'Tue Aug 4',
    status: 'target',
    tier: 1,
  },
];

const WEEK_TICKS = [
  {day: 0, label: 'Jul 6'},
  {day: 7, label: 'Jul 13'},
  {day: 14, label: 'Jul 20'},
  {day: 21, label: 'Jul 27'},
  {day: 28, label: 'Aug 3'},
] as const;

type Staleness = 'fresh' | 'normal' | 'stale';

interface LinkedResource {
  id: string;
  name: string;
  kind: string;
  icon: typeof FileTextIcon;
  tint: string;
  owner: string;
  staleness: Staleness;
  stalenessLabel: string;
}

const RESOURCES: LinkedResource[] = [
  {
    id: 'r1',
    name: 'Atlas Q3 Launch Plan',
    kind: 'Doc · source of truth',
    icon: FileTextIcon,
    tint: CATEGORICAL.blue,
    owner: 'Priya Raman',
    staleness: 'fresh',
    stalenessLabel: 'Fresh · edited 2h ago',
  },
  {
    id: 'r2',
    name: 'Atlas Q3 Launch Narrative',
    kind: 'Doc',
    icon: FileTextIcon,
    tint: CATEGORICAL.purple,
    owner: 'Jonah Fields',
    staleness: 'normal',
    stalenessLabel: 'Edited Mon Jul 13',
  },
  {
    id: 'r3',
    name: 'Beta Feedback Themes',
    kind: 'Doc',
    icon: FileTextIcon,
    tint: CATEGORICAL.green,
    owner: 'Sofia Ortiz',
    staleness: 'normal',
    stalenessLabel: 'Edited Tue Jul 14',
  },
  {
    id: 'r4',
    name: 'Pricing Page Copy',
    kind: 'Doc · freeze Fri Jul 17',
    icon: FileTextIcon,
    tint: CATEGORICAL.orange,
    owner: 'Dana Whitfield',
    staleness: 'stale',
    stalenessLabel: 'Stale · 9 days (Jul 6)',
  },
  {
    id: 'r5',
    name: 'Launch risks — pre-mortem',
    kind: 'Board · dot-vote',
    icon: StickyNoteIcon,
    tint: CATEGORICAL.teal,
    owner: 'Priya Raman',
    staleness: 'fresh',
    stalenessLabel: 'Active · Jul 14 session',
  },
  {
    id: 'r6',
    name: 'Launch readiness dashboard',
    kind: 'Dashboard',
    icon: LayoutDashboardIcon,
    tint: CATEGORICAL.blue,
    owner: 'Marcus Webb',
    staleness: 'fresh',
    stalenessLabel: 'Live · auto-refresh',
  },
];

interface Workstream {
  id: string;
  name: string;
  owner: string;
  status: 'On track' | 'At risk';
  progress: number;
  update: string;
  nextMilestone: string;
  extraMilestone?: string;
}

const WORKSTREAMS: Workstream[] = [
  {
    id: 'w1',
    name: 'Platform & Infra',
    owner: 'Marcus Webb',
    status: 'On track',
    progress: 78,
    update: 'Capacity headroom verified for 500 seats; soak test green.',
    nextMilestone: 'Load-test sign-off · Sat Jul 18',
  },
  {
    id: 'w2',
    name: 'Product & Beta',
    owner: 'Sofia Ortiz',
    status: 'On track',
    progress: 64,
    update: 'Cohort invites drafted; 38 feedback themes still untriaged.',
    nextMilestone: 'Beta cohort at 500 seats · Tue Jul 21',
    extraMilestone: 'Accessibility audit · wk of Jul 27',
  },
  {
    id: 'w3',
    name: 'GTM & Launch',
    owner: 'Jonah Fields',
    status: 'On track',
    progress: 52,
    update: 'Checklist at 31 of 60 items; narrative in final review.',
    nextMilestone: 'Launch checklist closed · Wed Jul 22',
  },
  {
    id: 'w4',
    name: 'Pricing & Billing',
    owner: 'Elena Voss',
    status: 'At risk',
    progress: 41,
    update: 'Billing migration cutover trending 4 days late; copy freeze reset to Jul 17.',
    nextMilestone: 'Pricing page copy freeze · Fri Jul 17',
  },
];

interface Risk {
  id: string;
  severity: 'High' | 'Medium';
  title: string;
  detail: string;
  mitigation: string;
  mitigationOwner: string;
  raisedBy: string;
  source: string;
}

const RISKS: Risk[] = [
  {
    id: 'k1',
    severity: 'High',
    title: 'Billing migration cutover trending 4 days late',
    detail:
      'Ledger backfill is slower than planned; a late cutover squeezes ' +
      'the GA window ahead of the Aug 4 launch.',
    mitigation:
      'Stage the cutover behind a feature flag so launch does not gate on ' +
      'the backfill (proposed to the decision log, review Thu Jul 16).',
    mitigationOwner: 'Elena Voss',
    raisedBy: 'Marcus Webb',
    source: 'Async standup · Tue Jul 14',
  },
  {
    id: 'k2',
    severity: 'Medium',
    title: 'Beta feedback triage backlog — 38 unresolved themes',
    detail:
      'Untriaged themes could hide a blocker before the cohort expands ' +
      'to 500 seats on Jul 21.',
    mitigation:
      'Daily triage rotation through Jul 21; Ava Lindqvist joins as ' +
      'second reviewer.',
    mitigationOwner: 'Sofia Ortiz',
    raisedBy: 'Sofia Ortiz',
    source: 'Pre-mortem board · Tue Jul 14',
  },
];

interface Decision {
  id: string;
  status: 'Decided' | 'Proposed';
  date: string;
  title: string;
  owner: string;
  summary: string;
  source: string;
  approvals: string;
}

// Records mirror the Atlas Q3 decision log (team-decision-log fixtures).
const DECISIONS: Decision[] = [
  {
    id: 'd1',
    status: 'Decided',
    date: 'Jul 9',
    title: 'Expand beta cohort to 500 seats',
    owner: 'Priya Raman',
    summary:
      'Grow the cohort ahead of launch to pressure-test capacity and ' +
      'pricing against real usage.',
    source: 'Launch Readiness Review · Jul 9',
    approvals: '4 of 4 approved',
  },
  {
    id: 'd2',
    status: 'Decided',
    date: 'Jul 13',
    title: 'Reset pricing copy freeze to Jul 17',
    owner: 'Dana Whitfield',
    summary:
      'Freeze slips one week (from Jul 10) so copy can absorb the final ' +
      'pricing tiers; no change to the Aug 4 launch.',
    source: 'Async standup · Jul 13',
    approvals: '3 of 3 approved',
  },
  {
    id: 'd3',
    status: 'Proposed',
    date: 'Jul 14',
    title: 'Stage billing cutover behind a feature flag',
    owner: 'Elena Voss',
    summary:
      'Top-voted pre-mortem risk cluster: decouple the ledger backfill ' +
      'from launch by flagging the cutover.',
    source: 'Pre-mortem board · Jul 14',
    approvals: 'Review Thu Jul 16',
  },
];

// ---------------------------------------------------------------------------
// SUBCOMPONENTS
// ---------------------------------------------------------------------------

function SectionHead({
  icon,
  title,
  meta,
}: {
  icon: typeof FileTextIcon;
  title: string;
  meta?: ReactNode;
}) {
  return (
    <HStack gap={2} vAlign="center" style={styles.sectionHead}>
      <Icon icon={icon} size="sm" color="secondary" />
      <Heading level={2}>{title}</Heading>
      <StackItem size="fill" />
      {meta ?? null}
    </HStack>
  );
}

function HealthPill() {
  return (
    <Tooltip content={PROJECT.healthNote}>
      <span style={styles.healthPill}>
        <StatusDot variant="warning" label={PROJECT.health} />
      </span>
    </Tooltip>
  );
}

function ProjectHeader({
  isCompact,
  isFollowing,
  onToggleFollow,
}: {
  isCompact: boolean;
  isFollowing: boolean;
  onToggleFollow: () => void;
}) {
  return (
    <LayoutHeader hasDivider>
      <VStack gap={1} style={styles.headerBlock}>
        <Breadcrumbs variant="supporting" label="Project location">
          <BreadcrumbItem onClick={() => {}}>{PROJECT.org}</BreadcrumbItem>
          <BreadcrumbItem onClick={() => {}}>Projects</BreadcrumbItem>
          <BreadcrumbItem isCurrent>{PROJECT.name}</BreadcrumbItem>
        </Breadcrumbs>
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <span style={styles.projectGlyph}>
            <Icon icon={GaugeIcon} size="md" color="inherit" />
          </span>
          <Heading level={1}>{PROJECT.name}</Heading>
          <HealthPill />
          <Token size="sm" color="blue" label={PROJECT.phase} />
          <StackItem size="fill" />
          <AvatarGroup size="xsmall" aria-label="8 project members">
            {MEMBERS.map(name => (
              <Avatar key={name} name={name} />
            ))}
            <AvatarGroupOverflow count={MEMBER_OVERFLOW} />
          </AvatarGroup>
          <Button
            label={isFollowing ? 'Following' : 'Follow'}
            variant={isFollowing ? 'secondary' : 'primary'}
            size="sm"
            icon={
              <Icon
                icon={isFollowing ? BellIcon : BellPlusIcon}
                size="sm"
                color="inherit"
              />
            }
            onClick={onToggleFollow}
          />
        </HStack>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          <span style={styles.metaChip}>
            <Icon icon={FlagIcon} size="sm" color="inherit" />
            {PROJECT.countdown}
          </span>
          <span style={styles.metaChip}>
            <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
            {PROJECT.nextReview}
          </span>
          {isCompact ? null : (
            <span style={styles.metaChip}>
              <Icon icon={UsersIcon} size="sm" color="inherit" />
              {PROJECT.channel}
            </span>
          )}
        </HStack>
      </VStack>
    </LayoutHeader>
  );
}

function DescriptionAndGoals() {
  return (
    <section aria-label="About this project">
      <SectionHead icon={FileTextIcon} title="About" />
      <div style={styles.descriptionBlock}>
        <VStack gap={2}>
          <Text color="secondary">{PROJECT.description}</Text>
          <Divider />
          <Text type="label" size="sm" color="secondary">
            Goals
          </Text>
          <VStack gap={0}>
            {GOALS.map(goal => (
              <div key={goal.id} style={styles.goalRow}>
                <span style={styles.goalIcon}>
                  <Icon icon={TargetIcon} size="sm" color="inherit" />
                </span>
                <StackItem size="fill">
                  <Text type="label">{goal.text}</Text>
                </StackItem>
                <HStack gap={2} vAlign="center">
                  <Token size="sm" color="gray" label={goal.due} />
                  <Tooltip content={\`Goal owner: \${goal.owner}\`}>
                    <Avatar name={goal.owner} size="xsmall" />
                  </Tooltip>
                </HStack>
              </div>
            ))}
          </VStack>
        </VStack>
      </div>
    </section>
  );
}

const MS_COLORS: Record<MilestoneStatus, string> = {
  done: CATEGORICAL.green,
  slipped: CATEGORICAL.orange,
  onTrack: CATEGORICAL.blue,
  target: 'var(--color-accent)',
};

const MS_STATUS_LABELS: Record<MilestoneStatus, string> = {
  done: 'Done',
  slipped: 'Slipped',
  onTrack: 'On track',
  target: 'Launch target',
};

function MilestoneMarker({milestone}: {milestone: Milestone}) {
  const x = milestone.day * PX_PER_DAY;
  // Tier 1 labels sit high, tier 2 low, so the Jul 21 / Jul 22 neighbors
  // never collide; stems bridge label block to the shared axis.
  const labelTop = milestone.tier === 1 ? 26 : 68;
  const stemTop = milestone.tier === 1 ? 60 : 102;
  const color = MS_COLORS[milestone.status];
  return (
    <>
      <div
        style={{
          ...styles.msStem,
          left: x,
          top: stemTop,
          height: 118 - stemTop,
        }}
        aria-hidden
      />
      <div
        style={{...styles.msDot, left: x, backgroundColor: color}}
        aria-hidden
      />
      <div
        style={{
          ...styles.msLabel,
          left: x + (milestone.labelShift ?? 0),
          top: labelTop,
        }}>
        <Text type="label" size="sm" maxLines={1}>
          {milestone.name}
        </Text>
        <div style={styles.msDate}>
          {milestone.slippedFrom ? (
            <span style={styles.msDateStruck}>{milestone.slippedFrom.date}</span>
          ) : null}
          {milestone.date}
          {milestone.status === 'slipped' ? ' · slipped' : ''}
          {milestone.status === 'done' ? ' · done' : ''}
        </div>
      </div>
    </>
  );
}

function MilestoneStrip() {
  const trackWidth = WINDOW_DAYS * PX_PER_DAY;
  return (
    <section aria-label="Milestone timeline, July 6 to August 8, 2026">
      <SectionHead
        icon={FlagIcon}
        title="Milestones"
        meta={
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Jul 6 → Aug 8 · scrolls to launch · 1 slipped
          </Text>
        }
      />
      <div style={styles.stripShell}>
        <div style={styles.stripScroll}>
          <div style={{...styles.stripTrack, width: trackWidth}}>
            <div style={styles.stripAxis} aria-hidden />
            {WEEK_TICKS.map(tick => (
              <div key={tick.day}>
                <div
                  style={{...styles.weekTick, left: tick.day * PX_PER_DAY}}
                  aria-hidden
                />
                <div style={{...styles.weekLabel, left: tick.day * PX_PER_DAY}}>
                  {tick.label}
                </div>
              </div>
            ))}
            <div
              style={{...styles.todayLine, left: TODAY_DAY * PX_PER_DAY}}
              aria-hidden
            />
            <div style={{...styles.todayFlag, left: TODAY_DAY * PX_PER_DAY}}>
              Today · Jul 15
            </div>
            {MILESTONES.map(milestone => (
              <MilestoneMarker key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </div>
        <HStack gap={3} vAlign="center" style={styles.stripLegend}>
          {(Object.keys(MS_COLORS) as MilestoneStatus[]).map(status => (
            <HStack key={status} gap={1} vAlign="center">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: MS_COLORS[status],
                }}
                aria-hidden
              />
              <Text type="supporting" color="secondary">
                {MS_STATUS_LABELS[status]}
              </Text>
            </HStack>
          ))}
          <StackItem size="fill" />
          <Text type="supporting" color="secondary">
            Pricing copy freeze slipped Jul 10 → Jul 17 (decision · Jul 13)
          </Text>
        </HStack>
      </div>
    </section>
  );
}

const STALENESS_TOKEN: Record<Staleness, {color: 'green' | 'gray' | 'orange'}> = {
  fresh: {color: 'green'},
  normal: {color: 'gray'},
  stale: {color: 'orange'},
};

function ResourceTile({resource}: {resource: LinkedResource}) {
  return (
    <div style={styles.resourceTile}>
      <span style={{...styles.resourceIconTile, color: resource.tint}}>
        <Icon icon={resource.icon} size="sm" color="inherit" />
      </span>
      <StackItem size="fill" style={{minWidth: 0}}>
        <VStack gap={0}>
          <Link onClick={() => {}}>
            <Text type="label" maxLines={1}>
              {resource.name}
            </Text>
          </Link>
          <Text type="supporting" color="secondary" maxLines={1}>
            {resource.kind} · {resource.owner}
          </Text>
          {/* The staleness badge gets its own row — sharing the title row
              made long titles collide with (and truncate) the badge. */}
          <div style={styles.resourceBadgeRow}>
            <Token
              size="sm"
              color={STALENESS_TOKEN[resource.staleness].color}
              label={resource.stalenessLabel}
            />
          </div>
        </VStack>
      </StackItem>
    </div>
  );
}

function LinkedResources() {
  return (
    <section aria-label="Linked resources">
      <SectionHead
        icon={LinkIcon}
        title="Linked resources"
        meta={
          <Text type="supporting" color="secondary" hasTabularNumbers>
            6 linked · 1 stale
          </Text>
        }
      />
      <div style={styles.resourceGrid}>
        {RESOURCES.map(resource => (
          <ResourceTile key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}

function WorkstreamCard({stream}: {stream: Workstream}) {
  const isAtRisk = stream.status === 'At risk';
  return (
    <div style={styles.wsCard}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill" style={{minWidth: 0}}>
          <Heading level={3}>{stream.name}</Heading>
        </StackItem>
        <Token
          size="sm"
          color={isAtRisk ? 'orange' : 'green'}
          label={stream.status}
        />
      </HStack>
      <HStack gap={2} vAlign="center">
        <Avatar name={stream.owner} size="xsmall" />
        <Text type="supporting" color="secondary">
          {stream.owner}
        </Text>
      </HStack>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          {/* Footgun: ProgressBar enforces minWidth 48 — pin 0 so the card
              grid can never blow out at narrow widths. */}
          <ProgressBar
            label={\`\${stream.name} progress\`}
            isLabelHidden
            value={stream.progress}
            max={100}
            variant={isAtRisk ? 'warning' : 'success'}
            style={{minWidth: 0}}
          />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {stream.progress}%
        </Text>
      </HStack>
      <Text type="supporting" color="secondary">
        {stream.update}
      </Text>
      {/* \`marginTop: auto\` pins the milestone chips to the card bottom so
          they align across a grid row even when update copy differs. */}
      <div style={styles.wsChipGroup}>
        <div style={styles.wsMilestoneChip}>
          <Icon icon={FlagIcon} size="sm" color="inherit" />
          <Text type="supporting" color="secondary" maxLines={1}>
            Next: {stream.nextMilestone}
          </Text>
        </div>
        {stream.extraMilestone === undefined ? null : (
          <div style={styles.wsMilestoneChip}>
            <Icon icon={CalendarClockIcon} size="sm" color="inherit" />
            <Text type="supporting" color="secondary" maxLines={1}>
              Then: {stream.extraMilestone}
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}

function Workstreams() {
  return (
    <section aria-label="Workstreams">
      <SectionHead
        icon={ActivityIcon}
        title="Workstreams"
        meta={
          <Text type="supporting" color="secondary" hasTabularNumbers>
            3 on track · 1 at risk
          </Text>
        }
      />
      <VStack gap={2}>
        <div style={styles.wsGrid}>
          {WORKSTREAMS.map(stream => (
            <WorkstreamCard key={stream.id} stream={stream} />
          ))}
        </div>
        <div style={styles.wsFootnote}>
          <Text type="supporting" color="secondary">
            Enablement & Comms (Dana Whitfield) is tracked in the weekly
            program roll-up — it reports on the Atlas Q3 program, not this
            launch project.
          </Text>
        </div>
      </VStack>
    </section>
  );
}

function RiskRow({risk}: {risk: Risk}) {
  return (
    <div style={styles.riskRow}>
      <div style={styles.riskBody}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Token
              size="sm"
              color={risk.severity === 'High' ? 'red' : 'orange'}
              label={risk.severity}
            />
            <Heading level={3}>{risk.title}</Heading>
          </HStack>
          <Text type="supporting" color="secondary">
            {risk.detail}
          </Text>
          <Text type="supporting" color="secondary">
            Mitigation: {risk.mitigation}
          </Text>
          <Text type="supporting" color="secondary">
            Raised by {risk.raisedBy} · {risk.source}
          </Text>
        </VStack>
      </div>
      <div style={styles.riskOwnerCol}>
        <VStack gap={1} hAlign="center">
          <Avatar name={risk.mitigationOwner} size="small" />
          <Text type="supporting" color="secondary">
            {risk.mitigationOwner}
          </Text>
          <Token size="sm" color="gray" label="Mitigation owner" />
        </VStack>
      </div>
    </div>
  );
}

function RisksAndBlockers() {
  return (
    <section aria-label="Risks and blockers">
      <SectionHead
        icon={ShieldAlertIcon}
        title="Risks & blockers"
        meta={
          <Text type="supporting" color="secondary" hasTabularNumbers>
            2 open · 1 high
          </Text>
        }
      />
      <VStack gap={2}>
        {RISKS.map(risk => (
          <RiskRow key={risk.id} risk={risk} />
        ))}
      </VStack>
    </section>
  );
}

function DecisionEntry({decision}: {decision: Decision}) {
  return (
    <div style={styles.decisionEntry}>
      <HStack gap={2} vAlign="center">
        <Token
          size="sm"
          color={decision.status === 'Decided' ? 'green' : 'purple'}
          label={decision.status}
        />
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {decision.date}
        </Text>
      </HStack>
      <Link onClick={() => {}}>
        <Text type="label">{decision.title}</Text>
      </Link>
      <Text type="supporting" color="secondary">
        {decision.summary}
      </Text>
      <HStack gap={2} vAlign="center">
        <Avatar name={decision.owner} size="xsmall" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {decision.owner} · {decision.approvals}
        </Text>
      </HStack>
      <div style={styles.decisionSource}>
        <Icon icon={ScaleIcon} size="sm" color="inherit" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {decision.source}
        </Text>
      </div>
    </div>
  );
}

function DecisionsList() {
  return (
    <VStack gap={2}>
      {DECISIONS.map(decision => (
        <DecisionEntry key={decision.id} decision={decision} />
      ))}
      <Button label="Open decision log" variant="ghost" size="sm" />
    </VStack>
  );
}

function DecisionsRail() {
  return (
    <div style={styles.railFill}>
      <div style={styles.railHead}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ScaleIcon} size="sm" color="secondary" />
          <Heading level={2}>Recent decisions</Heading>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            3
          </Text>
        </HStack>
      </div>
      <div style={styles.railScroll}>
        <DecisionsList />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

export default function ProjectWorkspaceOverviewTemplate() {
  // <=1180px the decisions rail drops and the same list renders as the
  // final content section; <=860px header meta chips tighten.
  const isRailHidden = useMediaQuery('(max-width: 1180px)');
  const isCompact = useMediaQuery('(max-width: 860px)');
  const [isFollowing, setIsFollowing] = useState(true);

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <ProjectHeader
            isCompact={isCompact}
            isFollowing={isFollowing}
            onToggleFollow={() => setIsFollowing(prev => !prev)}
          />
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentScroll}>
              <div style={styles.contentInner}>
                <VStack gap={5}>
                  <DescriptionAndGoals />
                  <MilestoneStrip />
                  <LinkedResources />
                  <Workstreams />
                  <RisksAndBlockers />
                  {isRailHidden ? (
                    <section aria-label="Recent decisions">
                      <SectionHead
                        icon={ScaleIcon}
                        title="Recent decisions"
                        meta={
                          <Text
                            type="supporting"
                            color="secondary"
                            hasTabularNumbers>
                            3
                          </Text>
                        }
                      />
                      <DecisionsList />
                    </section>
                  ) : null}
                </VStack>
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
              label="Recent decisions">
              <DecisionsRail />
            </LayoutPanel>
          )
        }
      />
    </div>
  );
}
`;export{e as default};