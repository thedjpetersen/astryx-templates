// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (two quarters of company OKRs — Q2 2026
 *   in flight and Q1 2026 scored — each an objectives→key-results tree with
 *   owner, progress, confidence, score, and a newest-first check-in history
 *   per key result authored by its owner, all on fixed dates; no clocks,
 *   randomness, or network assets)
 * @output OKR tree console: LayoutHeader with quarter Selector, an
 *   at-risk-only Switch, and expand/collapse-all; a company summary Card row
 *   (aggregate ProgressBar, confidence StatusDot tallies, average score); an
 *   expandable two-level tree of objective and key-result rows — owner
 *   Avatar, ProgressBar with percent, confidence Badge (On track / At risk /
 *   Off track), tabular score — and a docked check-in history panel that
 *   opens when a key-result row is clicked
 * @position Page template; emitted by `astryx template okr-tree`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the title,
 * quarter Selector, "At risk only" Switch, and Expand all / Collapse all.
 * LayoutContent scrolls a centered max-w-6xl column: summary Grid of company
 * roll-up Cards, then the tree Card. LayoutPanel end 360 hosts the check-in
 * history for the selected key result (EmptyState until one is picked).
 *
 * Container policy: the roll-up stats are widget Cards in a Grid; the tree
 * itself is flat rows inside a single Card separated by Dividers (no
 * per-row cards) so both hierarchy levels share one column grid; check-ins
 * render as StatusDot rows, not cards.
 *
 * Interaction contract:
 * - Expanded objective ids live in useState as a Set; each objective row's
 *   chevron inserts/removes exactly that objective's key-result rows.
 * - The quarter Selector swaps the whole fixture set, resets expansion to
 *   that quarter's defaults, and clears the panel selection.
 * - The "At risk only" Switch prunes the tree to key results that are at
 *   risk or off track, drops objectives left empty, and force-expands the
 *   survivors (chevrons disable while the filter is on); an EmptyState
 *   covers the nothing-at-risk case.
 * - Clicking a key-result row selects it (click again to deselect) and the
 *   panel shows its metric, current status, and newest-first check-ins with
 *   progress deltas vs the prior check-in.
 *
 * Responsive contract:
 * - >768px: the check-in panel stays docked at 360px on the end edge; the
 *   header shows the company caption and Expand/Collapse all inline.
 * - <=768px: the panel undocks (single-pane fallback) — selecting a key
 *   result swaps LayoutContent to a full-width check-in view with a >=40px
 *   "Back to tree" control; the company caption and Expand/Collapse all
 *   hide, and the header row wraps so the Selector + Switch drop below the
 *   title when needed.
 * - <=640px rows go two-line: owner name folds into the Avatar (the Avatar
 *   itself stays visible), the title + confidence Badge share line one, and
 *   the ProgressBar + score take line two; the objective chevron grows to a
 *   40px tap target and key-result rows are full-width buttons with a
 *   >=44px min height. Everything is click/tap + focus driven — there are
 *   no hover-only interactions anywhere on the page.
 * - The tree Card never forces horizontal scroll: fixed Owner/Progress/
 *   Confidence/Score columns exist only >640px, and the title column
 *   truncates with maxLines instead of pushing width.
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
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  ChevronRightIcon,
  CrosshairIcon,
  HistoryIcon,
  ShieldAlertIcon,
  TargetIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Centered scrollable page column (max-w-6xl).
  page: {maxWidth: 1152, marginInline: 'auto', width: '100%'},
  // Chevron rotates 0deg → 90deg on expand; the wrapper span (not the
  // button) carries the transform so focus rings stay upright.
  chevron: {
    display: 'inline-flex',
    transition: 'transform 120ms ease',
    transform: 'rotate(0deg)',
  },
  chevronOpen: {transform: 'rotate(90deg)'},
  // <=640px the chevron grows from the 28px `sm` chrome to a 40px tap
  // target — it is the only expand/collapse control on phones.
  chevronTouch: {width: 40, height: 40},
  // Key-result rows indent past the objective chevron + icon so both levels
  // read as one hierarchy on a shared column grid.
  krIndent: {width: 36, flexShrink: 0},
  krIndentCompact: {width: 8, flexShrink: 0},
  // Whole key-result row is an unstyled full-width button: tap/click and
  // keyboard focus select it — never hover. Default focus outline is kept.
  krButton: {
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    color: 'inherit',
  },
  krButtonSelected: {
    // Fallback is scheme-aware: the light value keeps the original blue
    // selection tint; dark uses the theme's dark brand blue, slightly
    // stronger so the tint reads on dark ground.
    backgroundColor:
      'var(--color-background-selected, light-dark(rgba(1, 113, 227, 0.08), rgba(61, 135, 255, 0.16)))',
  },
  rowPad: {paddingBlock: 8, paddingInline: 12},
  // <=640px key-result rows keep a comfortable two-line tap target.
  rowPadCompact: {paddingBlock: 10, paddingInline: 12, minHeight: 44},
  // Fixed desktop columns so avatars, bars, badges, and scores align across
  // both hierarchy levels; the title column flexes and truncates. flexBasis 0
  // (not auto) keeps the flex resolution identical on every row so the fixed
  // columns stay on one shared grid, and minWidth guarantees titles render
  // even when the fixed columns consume most of the row.
  colTitle: {flexBasis: 0, minWidth: 120},
  colOwner: {width: 112, flexShrink: 0},
  colProgress: {width: 124, flexShrink: 0},
  colConfidence: {width: 84, flexShrink: 0, display: 'flex'},
  colScore: {width: 40, flexShrink: 0, textAlign: 'end'},
  progressTrack: {flex: 1, minWidth: 0},
  progressPct: {width: 40, flexShrink: 0, textAlign: 'end'},
  // Check-in panel scroll region (the docked panel owns its own scrollbar).
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // <=768px single-pane fallback: the back control keeps a >=40px target.
  backControl: {minHeight: 40, display: 'flex', alignItems: 'center'},
  // The header Switch row reserves a >=40px touch target on phones.
  switchWrap: {minHeight: 40, display: 'flex', alignItems: 'center'},
};

// ============= DATA =============
// Deterministic fixtures: two quarters, fixed dates, fixed progress and
// scores. Objective roll-ups (progress, score, worst confidence) and the
// company summary derive from key results at render time so the at-risk
// filter and quarter switch stay honest.

type Confidence = 'on-track' | 'at-risk' | 'off-track';

const CONFIDENCE_META: Record<
  Confidence,
  {
    label: string;
    badge: 'success' | 'warning' | 'error';
    bar: 'success' | 'warning' | 'error';
    dot: 'success' | 'warning' | 'error';
    rank: number;
  }
> = {
  'on-track': {
    label: 'On track',
    badge: 'success',
    bar: 'success',
    dot: 'success',
    rank: 0,
  },
  'at-risk': {
    label: 'At risk',
    badge: 'warning',
    bar: 'warning',
    dot: 'warning',
    rank: 1,
  },
  'off-track': {
    label: 'Off track',
    badge: 'error',
    bar: 'error',
    dot: 'error',
    rank: 2,
  },
};

interface CheckIn {
  id: string;
  /** Fixed, pre-formatted date — no clocks in fixtures. */
  date: string;
  author: string;
  progress: number;
  confidence: Confidence;
  note: string;
}

interface KeyResult {
  id: string;
  title: string;
  owner: string;
  /** Human-readable current metric reading, e.g. "now 4.2 min". */
  metric: string;
  progress: number;
  confidence: Confidence;
  /** OKR score on the 0.0–1.0 scale (expected score while in flight). */
  score: number;
  /** Newest first. */
  checkIns: CheckIn[];
}

interface Objective {
  id: string;
  title: string;
  owner: string;
  keyResults: KeyResult[];
}

interface Quarter {
  id: string;
  label: string;
  timeframe: string;
  status: 'In flight' | 'Scored';
  objectives: Objective[];
  initiallyExpanded: string[];
}

/** Compact check-in fixture: [date, progress, confidence, note]. */
type CheckInSpec = [
  date: string,
  progress: number,
  confidence: Confidence,
  note: string,
];

interface KeyResultSpec extends Omit<KeyResult, 'checkIns'> {
  /** Newest first; every check-in is authored by the key result owner. */
  checkIns: CheckInSpec[];
}

/** Expands compact check-in tuples into full CheckIn rows with stable ids. */
function kr(spec: KeyResultSpec): KeyResult {
  return {
    ...spec,
    checkIns: spec.checkIns.map(([date, progress, confidence, note], index) => ({
      id: `${spec.id}-c${spec.checkIns.length - index}`,
      date,
      author: spec.owner,
      progress,
      confidence,
      note,
    })),
  };
}

const COMPANY = 'Atlas Labs';

const QUARTERS: Quarter[] = [
  {
    id: 'q2-2026',
    label: 'Q2 2026',
    timeframe: 'Apr 1 – Jun 30 · week 12 of 13',
    status: 'In flight',
    initiallyExpanded: ['q2-o1', 'q2-o2'],
    objectives: [
      {
        id: 'q2-o1',
        title: 'Make onboarding self-serve',
        owner: 'Priya Raman',
        keyResults: [
          kr({
            id: 'q2-o1-kr1',
            title: 'Cut median time-to-first-value from 9 min to 3 min',
            owner: 'Miguel Santos',
            metric: 'now 4.2 min',
            progress: 72,
            confidence: 'on-track',
            score: 0.85,
            checkIns: [
              ['Jun 26', 72, 'on-track', 'Wizard v2 at 100%; median down from 5.1 to 4.2 min.'],
              ['Jun 12', 61, 'on-track', 'Prefilled templates cut two steps from first run.'],
              ['May 29', 48, 'at-risk', 'Lost a week to SSO edge cases; recovery plan set.'],
            ],
          }),
          kr({
            id: 'q2-o1-kr2',
            title: 'Lift activation rate from 34% to 50%',
            owner: 'Aisha Karim',
            metric: 'now 43%',
            progress: 56,
            confidence: 'at-risk',
            score: 0.55,
            checkIns: [
              ['Jun 26', 56, 'at-risk', '43%; nudges flat — betting on checklist experiment.'],
              ['Jun 12', 50, 'at-risk', '41%; nudge test underpowered, extending a week.'],
              ['May 29', 44, 'on-track', '39% after the templates launch.'],
            ],
          }),
          kr({
            id: 'q2-o1-kr3',
            title: 'Ship guided setup for the top 5 integrations',
            owner: 'Tom Brennan',
            metric: '4 of 5 shipped',
            progress: 80,
            confidence: 'on-track',
            score: 0.9,
            checkIns: [
              ['Jun 26', 80, 'on-track', 'Salesforce guide shipped; Slack guide in review.'],
              ['Jun 12', 60, 'on-track', '3 of 5 live; tickets down 18% on covered paths.'],
              ['May 29', 40, 'on-track', 'Stripe and HubSpot guides live at 100%.'],
            ],
          }),
        ],
      },
      {
        id: 'q2-o2',
        title: 'Win the mid-market segment',
        owner: 'Dana Whitfield',
        keyResults: [
          kr({
            id: 'q2-o2-kr1',
            title: 'Close 60 new mid-market logos',
            owner: 'Dana Whitfield',
            metric: '38 of 60 closed',
            progress: 63,
            confidence: 'at-risk',
            score: 0.6,
            checkIns: [
              ['Jun 25', 63, 'at-risk', '38 closed; coverage 2.1x, need 2.5x to make 60.'],
              ['Jun 11', 55, 'at-risk', '33 closed; two competitive losses on pricing.'],
              ['May 28', 47, 'on-track', '28 closed, ahead of the 26 mid-quarter target.'],
            ],
          }),
          kr({
            id: 'q2-o2-kr2',
            title: 'Grow mid-market ARR to $4.2M',
            owner: 'Noah Park',
            metric: 'now $3.3M',
            progress: 74,
            confidence: 'on-track',
            score: 0.8,
            checkIns: [
              ['Jun 25', 74, 'on-track', '$3.3M; expansion revenue 8% ahead of plan.'],
              ['Jun 11', 66, 'on-track', '$2.9M; two six-figure expansions closed.'],
              ['May 28', 57, 'on-track', '$2.5M, on the linear path to target.'],
            ],
          }),
          kr({
            id: 'q2-o2-kr3',
            title: 'Keep quarterly gross churn under 1.5%',
            owner: 'Ines Beck',
            metric: 'now 2.3%',
            progress: 38,
            confidence: 'off-track',
            score: 0.3,
            checkIns: [
              ['Jun 25', 38, 'off-track', '2.3%; two SSO-blocked churns — escalated.'],
              ['Jun 11', 45, 'at-risk', '1.9% and trending wrong; save-desk started.'],
              ['May 28', 60, 'on-track', '1.4%, within target after renewal sweep.'],
            ],
          }),
        ],
      },
      {
        id: 'q2-o3',
        title: 'Ship a rock-solid platform',
        owner: 'Tom Brennan',
        keyResults: [
          kr({
            id: 'q2-o3-kr1',
            title: 'Reach 99.95% monthly uptime',
            owner: 'Ines Beck',
            metric: 'June tracking 99.97%',
            progress: 90,
            confidence: 'on-track',
            score: 0.95,
            checkIns: [
              ['Jun 24', 90, 'on-track', 'June tracking 99.97%; failover drill passed.'],
              ['Jun 10', 78, 'on-track', 'May closed at 99.96% — second clean month.'],
              ['May 27', 65, 'at-risk', 'April incident drags the rolling average.'],
            ],
          }),
          kr({
            id: 'q2-o3-kr2',
            title: 'Cut p95 API latency from 480ms to 250ms',
            owner: 'Miguel Santos',
            metric: 'now 340ms',
            progress: 48,
            confidence: 'at-risk',
            score: 0.45,
            checkIns: [
              ['Jun 24', 48, 'at-risk', '340ms; query cache helped less than modeled.'],
              ['Jun 10', 40, 'at-risk', '365ms; read replicas at 50% of tenants.'],
              ['May 27', 30, 'on-track', '410ms after the index pass.'],
            ],
          }),
          kr({
            id: 'q2-o3-kr3',
            title: 'Resolve every sev-1 in under 24 hours',
            owner: 'Priya Raman',
            metric: '9 of 10 within SLA',
            progress: 85,
            confidence: 'on-track',
            score: 0.85,
            checkIns: [
              ['Jun 24', 85, 'on-track', '9 of 10 inside SLA; miss was a vendor outage.'],
              ['Jun 10', 80, 'on-track', 'Doubled on-call for launch week; no misses.'],
              ['May 27', 70, 'on-track', 'Runbooks cover the top 12 failure modes.'],
            ],
          }),
        ],
      },
      {
        id: 'q2-o4',
        title: 'Grow the team without slowing down',
        owner: 'Lena Fischer',
        keyResults: [
          kr({
            id: 'q2-o4-kr1',
            title: 'Hire 12 engineers with a 90% offer-accept rate',
            owner: 'Lena Fischer',
            metric: '7 of 12 hired',
            progress: 58,
            confidence: 'on-track',
            score: 0.7,
            checkIns: [
              ['Jun 27', 58, 'on-track', '7 hires from 10 offers — 90% accept holds.'],
              ['Jun 13', 45, 'on-track', '5 hires; pipeline healthy after referral push.'],
              ['May 30', 30, 'at-risk', '3 hires; sourcing behind, referral bonus doubled.'],
            ],
          }),
          kr({
            id: 'q2-o4-kr2',
            title: 'Hold the engineering pulse score at 8.0 or higher',
            owner: 'Noah Park',
            metric: 'June pulse 7.4',
            progress: 32,
            confidence: 'off-track',
            score: 0.3,
            checkIns: [
              ['Jun 27', 32, 'off-track', 'June pulse 7.4; on-call load top complaint.'],
              ['Jun 13', 50, 'at-risk', 'Pulse 7.7; focus-time blocks piloted.'],
              ['May 30', 65, 'on-track', 'Pulse 7.9 — within noise of target.'],
            ],
          }),
          kr({
            id: 'q2-o4-kr3',
            title: 'Pair every new hire with a buddy in week one',
            owner: 'Aisha Karim',
            metric: '11 of 11 hires paired',
            progress: 88,
            confidence: 'on-track',
            score: 0.9,
            checkIns: [
              ['Jun 27', 88, 'on-track', 'All 11 hires paired in week one; playbook done.'],
              ['Jun 13', 70, 'on-track', 'Buddy pool grown to 18 volunteers.'],
              ['May 30', 55, 'on-track', 'Program live for all June starts.'],
            ],
          }),
        ],
      },
    ],
  },
  {
    id: 'q1-2026',
    label: 'Q1 2026',
    timeframe: 'Jan 5 – Mar 27 · closed',
    status: 'Scored',
    initiallyExpanded: ['q1-o1'],
    objectives: [
      {
        id: 'q1-o1',
        title: 'Launch the public API platform',
        owner: 'Priya Raman',
        keyResults: [
          kr({
            id: 'q1-o1-kr1',
            title: 'GA the REST API with 25 design partners',
            owner: 'Miguel Santos',
            metric: '27 partners at GA',
            progress: 100,
            confidence: 'on-track',
            score: 1.0,
            checkIns: [
              ['Mar 26', 100, 'on-track', 'GA shipped Mar 24 with 27 partners live.'],
              ['Feb 27', 70, 'on-track', 'Beta at 19 partners; GA checklist on track.'],
            ],
          }),
          kr({
            id: 'q1-o1-kr2',
            title: 'Publish SDKs for JavaScript, Python, and Go',
            owner: 'Tom Brennan',
            metric: 'Go slipped to Q2',
            progress: 67,
            confidence: 'at-risk',
            score: 0.67,
            checkIns: [
              ['Mar 26', 67, 'at-risk', "JS and Python GA'd; Go slipped to Q2."],
              ['Feb 27', 55, 'on-track', 'JS GA, Python in release candidate.'],
            ],
          }),
          kr({
            id: 'q1-o1-kr3',
            title: 'Reach 500 external apps created in-quarter',
            owner: 'Aisha Karim',
            metric: '389 apps created',
            progress: 78,
            confidence: 'on-track',
            score: 0.78,
            checkIns: [
              ['Mar 26', 78, 'on-track', '389 apps; hackathon drove the final surge.'],
              ['Feb 27', 40, 'at-risk', '142 apps; launch marketing landed late.'],
            ],
          }),
        ],
      },
      {
        id: 'q1-o2',
        title: 'Make support world-class',
        owner: 'Dana Whitfield',
        keyResults: [
          kr({
            id: 'q1-o2-kr1',
            title: 'Median first response under 30 minutes',
            owner: 'Ines Beck',
            metric: 'closed at 31 min',
            progress: 92,
            confidence: 'on-track',
            score: 0.92,
            checkIns: [
              ['Mar 25', 92, 'on-track', 'Closed at a 31 min median — just shy of target.'],
              ['Feb 26', 74, 'on-track', '38 min; staffing shifted to EU mornings.'],
            ],
          }),
          kr({
            id: 'q1-o2-kr2',
            title: 'Hold CSAT at 4.6+ across all tiers',
            owner: 'Noah Park',
            metric: 'closed at 4.55',
            progress: 85,
            confidence: 'on-track',
            score: 0.85,
            checkIns: [
              ['Mar 25', 85, 'on-track', '4.55 CSAT; free tier still lags at 4.3.'],
              ['Feb 26', 72, 'at-risk', '4.4 after the free-tier backlog cleared.'],
            ],
          }),
          kr({
            id: 'q1-o2-kr3',
            title: 'Deflect 30% of tickets with the docs revamp',
            owner: 'Aisha Karim',
            metric: 'closed at 13% deflection',
            progress: 43,
            confidence: 'off-track',
            score: 0.43,
            checkIns: [
              ['Mar 25', 43, 'off-track', '13% deflection; search rebuild slipped to Q2.'],
              ['Feb 26', 35, 'at-risk', '9%; new IA shipped, search still weak.'],
            ],
          }),
        ],
      },
      {
        id: 'q1-o3',
        title: 'Put security first',
        owner: 'Ines Beck',
        keyResults: [
          kr({
            id: 'q1-o3-kr1',
            title: 'Complete the SOC 2 Type II audit with zero exceptions',
            owner: 'Ines Beck',
            metric: 'report issued Mar 20',
            progress: 100,
            confidence: 'on-track',
            score: 1.0,
            checkIns: [
              ['Mar 25', 100, 'on-track', 'Report issued Mar 20 — zero exceptions.'],
              ['Feb 26', 80, 'on-track', 'Fieldwork done; observations remediated.'],
            ],
          }),
          kr({
            id: 'q1-o3-kr2',
            title: 'Patch 100% of criticals within 48 hours',
            owner: 'Priya Raman',
            metric: '21 of 24 within SLA',
            progress: 88,
            confidence: 'on-track',
            score: 0.88,
            checkIns: [
              ['Mar 25', 88, 'on-track', '21 of 24 inside 48h; misses vendor-bound.'],
              ['Feb 26', 75, 'on-track', 'Auto-patching live for the base fleet.'],
            ],
          }),
          kr({
            id: 'q1-o3-kr3',
            title: 'Ship SSO and SCIM for the enterprise tier',
            owner: 'Miguel Santos',
            metric: 'SSO GA, SCIM in beta',
            progress: 60,
            confidence: 'at-risk',
            score: 0.6,
            checkIns: [
              ['Mar 25', 60, 'at-risk', "SSO GA'd; SCIM held in beta on sync bugs."],
              ['Feb 26', 45, 'at-risk', 'SSO in RC; SCIM design churned twice.'],
            ],
          }),
        ],
      },
    ],
  },
];

const QUARTER_OPTIONS = QUARTERS.map(quarter => ({
  value: quarter.id,
  label: quarter.label,
}));

// ============= DERIVED ROLL-UPS =============

interface Rollup {
  progress: number;
  score: number;
  confidence: Confidence;
}

/** Objective roll-up: mean progress/score, worst child confidence. */
function rollupObjective(objective: Objective): Rollup {
  const krs = objective.keyResults;
  const progress = Math.round(
    krs.reduce((sum, keyResult) => sum + keyResult.progress, 0) / krs.length,
  );
  const score =
    krs.reduce((sum, keyResult) => sum + keyResult.score, 0) / krs.length;
  const confidence = krs.reduce<Confidence>(
    (worst, keyResult) =>
      CONFIDENCE_META[keyResult.confidence].rank > CONFIDENCE_META[worst].rank
        ? keyResult.confidence
        : worst,
    'on-track',
  );
  return {progress, score, confidence};
}

interface QuarterSummary {
  krCount: number;
  progress: number;
  avgScore: number;
  counts: Record<Confidence, number>;
}

function summarizeQuarter(quarter: Quarter): QuarterSummary {
  const krs = quarter.objectives.flatMap(objective => objective.keyResults);
  const counts: Record<Confidence, number> = {
    'on-track': 0,
    'at-risk': 0,
    'off-track': 0,
  };
  for (const keyResult of krs) {
    counts[keyResult.confidence] += 1;
  }
  return {
    krCount: krs.length,
    progress: Math.round(
      krs.reduce((sum, keyResult) => sum + keyResult.progress, 0) / krs.length,
    ),
    avgScore:
      krs.reduce((sum, keyResult) => sum + keyResult.score, 0) / krs.length,
    counts,
  };
}

function formatScore(score: number): string {
  return score.toFixed(2);
}

/** Progress delta vs the prior (older) check-in, e.g. "+6 pts". */
function deltaLabel(entry: CheckIn, prior: CheckIn | undefined): string {
  if (prior == null) {
    return 'first check-in';
  }
  const delta = entry.progress - prior.progress;
  if (delta === 0) {
    return 'no change';
  }
  return delta > 0 ? `+${delta} pts` : `${delta} pts`;
}

// ============= WIDGETS =============

/** Progress cell shared by both row levels: bar + tabular percent. */
function ProgressCell({
  progress,
  confidence,
  label,
}: {
  progress: number;
  confidence: Confidence;
  label: string;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.progressTrack}>
        <ProgressBar
          value={progress}
          max={100}
          label={label}
          isLabelHidden
          variant={CONFIDENCE_META[confidence].bar}
        />
      </div>
      <div style={styles.progressPct}>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {progress}%
        </Text>
      </div>
    </HStack>
  );
}

function ConfidenceBadge({confidence}: {confidence: Confidence}) {
  const meta = CONFIDENCE_META[confidence];
  return <Badge label={meta.label} variant={meta.badge} />;
}

function ObjectiveRow({
  objective,
  rollup,
  isExpanded,
  isCompact,
  isFilterActive,
  onToggle,
}: {
  objective: Objective;
  rollup: Rollup;
  isExpanded: boolean;
  isCompact: boolean;
  isFilterActive: boolean;
  onToggle: (id: string) => void;
}) {
  const chevron = (
    <IconButton
      label={`${isExpanded ? 'Collapse' : 'Expand'} ${objective.title}`}
      icon={
        <span
          style={{
            ...styles.chevron,
            ...(isExpanded ? styles.chevronOpen : undefined),
          }}>
          <Icon icon={ChevronRightIcon} size="sm" />
        </span>
      }
      variant="ghost"
      size="sm"
      isDisabled={isFilterActive}
      onClick={() => onToggle(objective.id)}
      style={isCompact ? styles.chevronTouch : undefined}
    />
  );

  if (isCompact) {
    // <=640px: two-line objective row — title + badge, then bar + score.
    return (
      <div style={styles.rowPadCompact}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            {chevron}
            <Avatar name={objective.owner} size="xsmall" />
            <StackItem size="fill">
              <Text type="label" maxLines={1}>
                {objective.title}
              </Text>
            </StackItem>
            <ConfidenceBadge confidence={rollup.confidence} />
          </HStack>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <ProgressCell
                progress={rollup.progress}
                confidence={rollup.confidence}
                label={`${objective.title} progress`}
              />
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {formatScore(rollup.score)}
            </Text>
          </HStack>
        </VStack>
      </div>
    );
  }

  return (
    <div style={styles.rowPad}>
      <HStack gap={3} vAlign="center">
        {chevron}
        <Icon icon={TargetIcon} size="sm" color="secondary" />
        <StackItem size="fill" style={styles.colTitle}>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {objective.title}
            </Text>
            <Text type="supporting" color="secondary" size="sm">
              {objective.keyResults.length} key results
            </Text>
          </VStack>
        </StackItem>
        <div style={styles.colOwner}>
          <HStack gap={2} vAlign="center">
            <Avatar name={objective.owner} size="xsmall" />
            <Text type="supporting" maxLines={1}>
              {objective.owner}
            </Text>
          </HStack>
        </div>
        <div style={styles.colProgress}>
          <ProgressCell
            progress={rollup.progress}
            confidence={rollup.confidence}
            label={`${objective.title} progress`}
          />
        </div>
        <div style={styles.colConfidence}>
          <ConfidenceBadge confidence={rollup.confidence} />
        </div>
        <div style={styles.colScore}>
          <Text type="body" hasTabularNumbers>
            {formatScore(rollup.score)}
          </Text>
        </div>
      </HStack>
    </div>
  );
}

function KeyResultRow({
  keyResult,
  isSelected,
  isCompact,
  onSelect,
}: {
  keyResult: KeyResult;
  isSelected: boolean;
  isCompact: boolean;
  onSelect: (id: string) => void;
}) {
  const latest = keyResult.checkIns[0];

  const body = isCompact ? (
    // <=640px: owner name folds into the Avatar; bar + score on line two.
    <VStack gap={1}>
      <HStack gap={2} vAlign="center">
        <span style={styles.krIndentCompact} />
        <Avatar name={keyResult.owner} size="xsmall" />
        <StackItem size="fill">
          <VStack gap={0}>
            <Text type="body" maxLines={1}>
              {keyResult.title}
            </Text>
            <Text type="supporting" color="secondary" size="sm" maxLines={1}>
              {keyResult.metric} · updated {latest.date}
            </Text>
          </VStack>
        </StackItem>
        <ConfidenceBadge confidence={keyResult.confidence} />
      </HStack>
      <HStack gap={2} vAlign="center">
        <span style={styles.krIndentCompact} />
        <StackItem size="fill">
          <ProgressCell
            progress={keyResult.progress}
            confidence={keyResult.confidence}
            label={`${keyResult.title} progress`}
          />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {formatScore(keyResult.score)}
        </Text>
      </HStack>
    </VStack>
  ) : (
    <HStack gap={3} vAlign="center">
      <span style={styles.krIndent} />
      <Icon icon={CrosshairIcon} size="sm" color="secondary" />
      <StackItem size="fill" style={styles.colTitle}>
        <VStack gap={0}>
          <Text type="body" maxLines={1}>
            {keyResult.title}
          </Text>
          <Text type="supporting" color="secondary" size="sm" maxLines={1}>
            {keyResult.metric} · updated {latest.date}
          </Text>
        </VStack>
      </StackItem>
      <div style={styles.colOwner}>
        <HStack gap={2} vAlign="center">
          <Avatar name={keyResult.owner} size="xsmall" />
          <Text type="supporting" maxLines={1}>
            {keyResult.owner}
          </Text>
        </HStack>
      </div>
      <div style={styles.colProgress}>
        <ProgressCell
          progress={keyResult.progress}
          confidence={keyResult.confidence}
          label={`${keyResult.title} progress`}
        />
      </div>
      <div style={styles.colConfidence}>
        <ConfidenceBadge confidence={keyResult.confidence} />
      </div>
      <div style={styles.colScore}>
        <Text type="body" hasTabularNumbers>
          {formatScore(keyResult.score)}
        </Text>
      </div>
    </HStack>
  );

  return (
    <button
      type="button"
      style={{
        ...styles.krButton,
        ...(isSelected ? styles.krButtonSelected : undefined),
        ...(isCompact ? styles.rowPadCompact : styles.rowPad),
      }}
      aria-pressed={isSelected}
      aria-label={`${keyResult.title} — open check-in history`}
      onClick={() => onSelect(keyResult.id)}>
      {body}
    </button>
  );
}

/**
 * Check-in history for the selected key result. Docked in the end panel
 * >768px; rendered as the whole content pane (with a Back control) below.
 */
function CheckInHistory({
  objective,
  keyResult,
  onBack,
  onClose,
}: {
  objective: Objective;
  keyResult: KeyResult;
  onBack?: () => void;
  onClose?: () => void;
}) {
  return (
    <VStack gap={4}>
      {onBack != null && (
        <div style={styles.backControl}>
          <Button
            label="Back to tree"
            variant="ghost"
            size="sm"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onBack}
          />
        </div>
      )}
      <HStack gap={2} vAlign="start">
        <StackItem size="fill">
          <VStack gap={1}>
            <Text type="supporting" color="secondary" maxLines={1}>
              {objective.title}
            </Text>
            <Heading level={2}>{keyResult.title}</Heading>
          </VStack>
        </StackItem>
        {onClose != null && (
          <IconButton
            label="Close check-in history"
            icon={<Icon icon={XIcon} size="sm" />}
            variant="ghost"
            size="sm"
            onClick={onClose}
          />
        )}
      </HStack>

      <HStack gap={2} vAlign="center">
        <Avatar name={keyResult.owner} size="xsmall" />
        <Text type="supporting" maxLines={1}>
          {keyResult.owner}
        </Text>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          · {keyResult.metric}
        </Text>
      </HStack>

      <VStack gap={2}>
        <ProgressBar
          value={keyResult.progress}
          max={100}
          label="Current progress"
          hasValueLabel
          variant={CONFIDENCE_META[keyResult.confidence].bar}
        />
        <HStack gap={2} vAlign="center">
          <ConfidenceBadge confidence={keyResult.confidence} />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Score {formatScore(keyResult.score)}
          </Text>
        </HStack>
      </VStack>

      <Divider />

      <HStack gap={2} vAlign="center">
        <Heading level={3}>Check-in history</Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {keyResult.checkIns.length} check-ins
        </Text>
      </HStack>

      <VStack gap={0}>
        {keyResult.checkIns.map((entry, index) => (
          <VStack key={entry.id} gap={0}>
            <HStack gap={2} vAlign="start" style={{paddingBlock: 8}}>
              <StatusDot
                variant={CONFIDENCE_META[entry.confidence].dot}
                label={CONFIDENCE_META[entry.confidence].label}
              />
              <VStack gap={0.5}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="label" hasTabularNumbers>
                    {entry.date}
                  </Text>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {entry.author}
                  </Text>
                </HStack>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {entry.progress}% ·{' '}
                  {deltaLabel(entry, keyResult.checkIns[index + 1])}
                </Text>
                <Text type="supporting">{entry.note}</Text>
              </VStack>
            </HStack>
            {index < keyResult.checkIns.length - 1 && <Divider />}
          </VStack>
        ))}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function OkrTreeTemplate() {
  const [quarterId, setQuarterId] = useState(QUARTERS[0].id);
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(
    () => new Set(QUARTERS[0].initiallyExpanded),
  );
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);
  const [selectedKrId, setSelectedKrId] = useState<string | null>(null);

  // Responsive contract: <=768px undocks the check-in panel (single-pane
  // fallback); <=640px switches rows to the two-line compact layout.
  const isSinglePane = useMediaQuery('(max-width: 768px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const quarter = QUARTERS.find(q => q.id === quarterId) ?? QUARTERS[0];
  const summary = useMemo(() => summarizeQuarter(quarter), [quarter]);

  // At-risk filter: prune to at-risk/off-track key results, drop objectives
  // left empty, and force-expand what remains (chevrons disable meanwhile).
  const visibleObjectives = useMemo(() => {
    if (!showAtRiskOnly) {
      return quarter.objectives;
    }
    return quarter.objectives
      .map(objective => ({
        ...objective,
        keyResults: objective.keyResults.filter(
          keyResult => keyResult.confidence !== 'on-track',
        ),
      }))
      .filter(objective => objective.keyResults.length > 0);
  }, [quarter, showAtRiskOnly]);

  // Roll-ups always reflect the full objective, not the filtered subset, so
  // the at-risk view still reports honest objective progress.
  const rollups = useMemo(() => {
    const byId = new Map<string, Rollup>();
    for (const objective of quarter.objectives) {
      byId.set(objective.id, rollupObjective(objective));
    }
    return byId;
  }, [quarter]);

  // Selection resolves against the unfiltered quarter so a selected key
  // result keeps its panel even while the at-risk filter hides its row.
  const selected = useMemo(() => {
    if (selectedKrId == null) {
      return null;
    }
    for (const objective of quarter.objectives) {
      for (const keyResult of objective.keyResults) {
        if (keyResult.id === selectedKrId) {
          return {objective, keyResult};
        }
      }
    }
    return null;
  }, [quarter, selectedKrId]);

  const changeQuarter = (id: string) => {
    const next = QUARTERS.find(q => q.id === id) ?? QUARTERS[0];
    setQuarterId(next.id);
    setExpandedIds(new Set(next.initiallyExpanded));
    setSelectedKrId(null);
  };

  const toggleObjective = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** Row click toggles selection; deselecting returns phones to the tree. */
  const selectKeyResult = (id: string) => {
    setSelectedKrId(prev => (prev === id ? null : id));
  };

  // ---- summary ----
  const summarySection = (
    <Grid columns={{minWidth: 240, max: 3}} gap={4}>
      <Card>
        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Company
          </Text>
          <Heading level={2}>{COMPANY}</Heading>
          <HStack gap={2} vAlign="center">
            <Badge
              label={quarter.status}
              variant={quarter.status === 'In flight' ? 'info' : 'neutral'}
            />
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {quarter.label} · {quarter.timeframe}
            </Text>
          </HStack>
        </VStack>
      </Card>
      <Card>
        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Aggregate progress
          </Text>
          <Heading level={2}>{summary.progress}%</Heading>
          <ProgressBar
            value={summary.progress}
            max={100}
            label="Aggregate progress across all key results"
            isLabelHidden
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Mean of {summary.krCount} key results ·{' '}
            {quarter.objectives.length} objectives
          </Text>
        </VStack>
      </Card>
      <Card>
        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Confidence
          </Text>
          <Heading level={2}>
            {formatScore(summary.avgScore)} avg score
          </Heading>
          <HStack gap={3} vAlign="center" wrap="wrap">
            {(Object.keys(CONFIDENCE_META) as Confidence[]).map(confidence => (
              <HStack key={confidence} gap={1} vAlign="center">
                <StatusDot
                  variant={CONFIDENCE_META[confidence].dot}
                  label={CONFIDENCE_META[confidence].label}
                />
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {summary.counts[confidence]}{' '}
                  {CONFIDENCE_META[confidence].label.toLowerCase()}
                </Text>
              </HStack>
            ))}
          </HStack>
        </VStack>
      </Card>
    </Grid>
  );

  // ---- tree ----
  const captionRow = (
    <div style={styles.rowPad}>
      <HStack gap={3} vAlign="center">
        <span style={{width: 28, flexShrink: 0}} />
        <span style={{width: 16, flexShrink: 0}} />
        <StackItem size="fill" style={styles.colTitle}>
          <Text type="supporting" color="secondary" size="sm">
            Objective / key result
          </Text>
        </StackItem>
        <div style={styles.colOwner}>
          <Text type="supporting" color="secondary" size="sm">
            Owner
          </Text>
        </div>
        <div style={styles.colProgress}>
          <Text type="supporting" color="secondary" size="sm">
            Progress
          </Text>
        </div>
        <div style={styles.colConfidence}>
          <Text type="supporting" color="secondary" size="sm">
            Confidence
          </Text>
        </div>
        <div style={styles.colScore}>
          <Text type="supporting" color="secondary" size="sm">
            Score
          </Text>
        </div>
      </HStack>
    </div>
  );

  const treeCard = (
    <Card padding={0}>
      {visibleObjectives.length === 0 ? (
        <div style={{padding: 'var(--spacing-8) var(--spacing-4)'}}>
          <EmptyState
            icon={<Icon icon={ShieldAlertIcon} size="lg" />}
            title="Nothing at risk"
            description={`Every key result in ${quarter.label} is on track. Turn the filter off to see the full tree.`}
            actions={
              <Button
                label="Show all key results"
                size="sm"
                onClick={() => setShowAtRiskOnly(false)}
              />
            }
            isCompact
          />
        </div>
      ) : (
        <VStack gap={0}>
          {!isCompact && (
            <>
              {captionRow}
              <Divider />
            </>
          )}
          {visibleObjectives.map((objective, objectiveIndex) => {
            const rollup = rollups.get(objective.id);
            const isExpanded = showAtRiskOnly || expandedIds.has(objective.id);
            if (rollup == null) {
              return null;
            }
            return (
              <VStack key={objective.id} gap={0}>
                {objectiveIndex > 0 && <Divider />}
                <ObjectiveRow
                  objective={objective}
                  rollup={rollup}
                  isExpanded={isExpanded}
                  isCompact={isCompact}
                  isFilterActive={showAtRiskOnly}
                  onToggle={toggleObjective}
                />
                {isExpanded &&
                  objective.keyResults.map(keyResult => (
                    <VStack key={keyResult.id} gap={0}>
                      <Divider />
                      <KeyResultRow
                        keyResult={keyResult}
                        isSelected={keyResult.id === selectedKrId}
                        isCompact={isCompact}
                        onSelect={selectKeyResult}
                      />
                    </VStack>
                  ))}
              </VStack>
            );
          })}
        </VStack>
      )}
    </Card>
  );

  // ---- panel ----
  const panelBody =
    selected == null ? (
      <EmptyState
        icon={<Icon icon={HistoryIcon} size="lg" />}
        title="No key result selected"
        description="Click a key result row to see its check-in history, confidence changes, and progress deltas."
        isCompact
      />
    ) : (
      <CheckInHistory
        objective={selected.objective}
        keyResult={selected.keyResult}
        onClose={() => setSelectedKrId(null)}
      />
    );

  // <=768px single-pane fallback: a selected key result replaces the tree
  // with a full-width check-in view behind a Back control.
  const showMobileHistory = isSinglePane && selected != null;

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Company OKRs</Heading>
                {!isSinglePane && (
                  <Text type="supporting" color="secondary">
                    {COMPANY} · {quarter.timeframe}
                  </Text>
                )}
              </HStack>
            </StackItem>
            <Selector
              label="Quarter"
              isLabelHidden
              size="sm"
              options={QUARTER_OPTIONS}
              value={quarterId}
              onChange={changeQuarter}
            />
            <div style={styles.switchWrap}>
              <Switch
                label="At risk only"
                value={showAtRiskOnly}
                onChange={setShowAtRiskOnly}
              />
            </div>
            {!isSinglePane && (
              <>
                <Button
                  label="Expand all"
                  variant="ghost"
                  size="sm"
                  isDisabled={showAtRiskOnly}
                  onClick={() =>
                    setExpandedIds(new Set(quarter.objectives.map(o => o.id)))
                  }
                />
                <Button
                  label="Collapse all"
                  variant="ghost"
                  size="sm"
                  isDisabled={showAtRiskOnly}
                  onClick={() => setExpandedIds(new Set())}
                />
              </>
            )}
          </HStack>
        </LayoutHeader>
      }
      end={
        isSinglePane ? undefined : (
          <LayoutPanel width={360} padding={0} label="Check-in history">
            <div style={styles.panelScroll}>{panelBody}</div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={isCompact ? 4 : 6}>
          <div style={styles.page}>
            {showMobileHistory && selected != null ? (
              <CheckInHistory
                objective={selected.objective}
                keyResult={selected.keyResult}
                onBack={() => setSelectedKrId(null)}
              />
            ) : (
              <VStack gap={isCompact ? 4 : 6}>
                {summarySection}
                {showAtRiskOnly && visibleObjectives.length > 0 && (
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    Showing{' '}
                    {visibleObjectives.reduce(
                      (sum, objective) => sum + objective.keyResults.length,
                      0,
                    )}{' '}
                    at-risk or off-track key results ·{' '}
                    {summary.counts['on-track']} on-track hidden
                  </Text>
                )}
                {treeCard}
              </VStack>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
