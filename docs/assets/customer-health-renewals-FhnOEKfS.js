var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Evergreen renewal desk for
 *   Q3 FY26 (Jul 1 – Sep 30 2026), internal "today" fixed at Jul 10 2026.
 *   Ten accounts, book total $1,176,500 — hand-checked: 240,000 + 86,000 +
 *   18,500 + 12,000 + 310,000 + 64,000 + 198,000 + 172,000 + 54,000 +
 *   22,000 = 1,176,500 ✓. Health = Math.round(mean of four subscores),
 *   verified per account: Atlas 38+44+52+42=176/4=44 · Halcyon
 *   64+58+70+56=248/4=62 · Quillbase 82+78+88+84=332/4=83 · Kite & Crane
 *   90+84+92+86=352/4=88 · Bridgewell 58+46+64+48=216/4=54 · Ferro
 *   72+68+80+72=292/4=73 · Northwind 78+82+74+78=312/4=78 · Juniper
 *   50+56+40+46=192/4=48 · Meridix 24+18+34+16=92/4=23 · Corvid
 *   66+60+72+58=256/4=64 ✓. Tier thresholds: renewed→Won, churned→Lost,
 *   else health ≥75 Commit · 55–74 Best case · <55 At risk. Opening
 *   buckets: Won $12,000 (Kite) · Commit $216,500 (18,500+198,000) ·
 *   Best $172,000 (86,000+64,000+22,000) · At risk $722,000
 *   (240,000+310,000+172,000) · Churned $54,000 ✓ sums to the book.
 *   Weighted forecast (won 100% · commit 90% · best 60% · risk 30% ·
 *   churn 0%): 12,000 + 194,850 + 103,200 + 216,600 = $526,650 = 56% of
 *   the fixed $940,000 plan. Worked flip kept true in code: applying
 *   "Success plan refresh" (+4 engagement) to Bridgewell makes
 *   58+50+64+48=220/4=55 → Best case; at-risk drops to $412,000, best
 *   rises to $482,000, weighted becomes 12,000+194,850+289,200+123,600 =
 *   $619,650 (+$93,000). No clock reads, no randomness, no timers, no
 *   network assets.
 * @output Evergreen — Renewal Desk: a CS renewal pipeline for one quarter.
 *   A 56px brand header (pine-bough mark, quarter title, live at-risk /
 *   weighted-forecast / plays-logged chips) over an 88px forecast band —
 *   a proportional five-bucket strip (Won / Commit / Best case / At risk /
 *   Churned) with a derived legend and a weighted-vs-plan meter. Below,
 *   the pipeline: renewal rows sorted by date under sticky month headers
 *   (each restating that month's ARR), every 64px row carrying a due
 *   column, a 40px SVG health dial, account + CSM line, signal chips,
 *   tabular ARR, and a tier chip. A 340px account panel owns the selected
 *   account: a 96px dial beside the four subscore bars that compose it,
 *   the risk-signal list, the save-play composer (six motions, each
 *   lifting one named subscore), and the account timeline. Signature
 *   move: applying a save play mutates ONE appliedPlays map — the
 *   subscore bar grows, the dial and tier chip re-derive in the row AND
 *   the panel, ARR physically moves between forecast-strip buckets, the
 *   weighted-forecast chip and plan meter re-derive, and the play appends
 *   to the account timeline with an Undo that reverses all of it.
 * @position Page template; emitted by \`astryx template customer-health-renewals\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 *   brand row. Content column: forecast band (fixed, 88px min) → body row:
 *   pipeline scroller (flex 1, minWidth 0, its own overflow-y) + account
 *   panel (340px, own overflow-y). No modals — the panel is the single
 *   editing surface and the pipeline is the single list.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): pipeline
 *   gets ~705px — due 76 + dial 40 + flexible account cell + signals +
 *   ARR 92 + tier 96 all fit; the forecast band holds one line of legend
 *   chips. Nothing squeezes.
 * - <=900px: rows drop the signal-chip column (signals remain in the
 *   panel); the legend wraps to two lines.
 * - <=680px (390px embed): the body stacks — panel flows under the
 *   pipeline full-width with a top divider; rows drop the due column
 *   (the due label moves into the meta line) and the header chips wrap
 *   under the title. Subtraction, not squeeze.
 * Container policy: work-surface archetype — bands, rows, and one panel;
 *   no Cards. Pipeline rows and play actions are real <button>s
 *   (aria-pressed on the selected row); every mutation is announced via a
 *   polite live region. All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Evergreen pine): light-dark(#166534, #34D399) — #166534 on #FFFFFF
 *   ≈ 6.7:1, #34D399 on ~#1C1C1E ≈ 8.6:1 — used for the mark, Commit/Won
 *   tiers, dial arcs at commit grade, and the plan meter fill. State
 *   pairs with math at the declaration: watch amber light-dark(#B45309,
 *   #F5A623) (≈4.7:1 / ≈8.8:1), risk red light-dark(#DC2626, #F87171)
 *   (≈4.5:1 / ≈7.2:1). Churned rows use text-secondary tokens only.
 *   Tints are ≤16%-alpha washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · forecast band
 *   88 · month headers 32 (sticky) · account rows 64 · due column 76 ·
 *   row dial 40 · panel 340 · panel dial 96 · subscore bars 8 · play rows
 *   min 56 · action buttons 40 · tier chips 22 · strip 20.
 * Fixture policy: one appliedPlays map \`Record<accountId, playId[]>\` is
 *   the single state owner. Every surface — dials, tier chips, bucket
 *   dollars, weighted forecast, plan meter, header chips, timeline —
 *   re-derives from fixtures + that map on every render, so no aggregate
 *   can drift from the rows.
 */

import {useMemo, useState} from 'react';

import {
  AlertTriangleIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  Clock3Icon,
  HeartPulseIcon,
  RotateCcwIcon,
  SparklesIcon,
  TrendingDownIcon,
  UsersIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-customer-health-renewals';

// THE quarantined Evergreen brand pine. #166534 on #FFFFFF ≈ 6.7:1 (passes
// 4.5:1 down to the 11px tier-chip text it colors); #34D399 on a ~#1C1C1E
// dark surface ≈ 8.6:1. Colors the mark, Commit/Won grades, plan meter.
const PINE = 'light-dark(#166534, #34D399)';
// ≤14% wash behind PINE-colored text: #166534 on rgba(22,101,52,.12) over
// white (≈ #E4EEE7) ≈ 6.0:1; #34D399 on rgba(52,211,153,.14) over #1C1C1E
// ≈ 7.4:1 — both clear 4.5:1 with margin.
const PINE_TINT =
  'light-dark(rgba(22, 101, 52, 0.12), rgba(52, 211, 153, 0.14))';
// Watch / Best-case amber: #B45309 on #FFFFFF ≈ 4.7:1; #F5A623 on ~#1C1C1E
// ≈ 8.8:1.
const AMBER = 'light-dark(#B45309, #F5A623)';
const AMBER_TINT =
  'light-dark(rgba(180, 83, 9, 0.12), rgba(245, 166, 35, 0.14))';
// At-risk red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on ~#1C1C1E ≈ 7.2:1.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_TINT =
  'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';
// Forecast-strip segment fills are GRAPHIC swatches (each restated as text
// in the legend beside the same swatch, so the strip never carries meaning
// alone). Muted solids so the 20px strip reads calm in both schemes:
const SEG_WON = 'light-dark(#166534, #2F9E77)';
const SEG_COMMIT = 'light-dark(#4D9E6F, #6FBF97)';
const SEG_BEST = 'light-dark(#D19A2B, #C98F2F)';
const SEG_RISK = 'light-dark(#DC2626, #C25353)';
const SEG_LOST = 'light-dark(#9CA3AF, #55595E)';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — Q3 FY26 renewal book, today fixed at Jul 10 2026.
// ---------------------------------------------------------------------------

type SubscoreKey = 'usage' | 'engagement' | 'support' | 'sentiment';

const SUBSCORE_ORDER: SubscoreKey[] = [
  'usage',
  'engagement',
  'support',
  'sentiment',
];

const SUBSCORE_LABEL: Record<SubscoreKey, string> = {
  usage: 'Product usage',
  engagement: 'Engagement',
  support: 'Support health',
  sentiment: 'Sentiment',
};

type AccountStatus = 'open' | 'renewed' | 'churned';
type Tier = 'won' | 'commit' | 'best' | 'risk' | 'lost';

interface TimelineEvent {
  date: string; // fixed display string
  label: string;
  kind: 'note' | 'risk' | 'play';
}

interface Account {
  id: string;
  name: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB';
  csm: string;
  arr: number; // whole dollars — the math field; every surface formats live
  renewalDate: string; // fixed display string
  dueLabel: string; // 'in 14d' | 'Renewed Jul 2' | 'Notice Jun 30'
  monthKey: 'jul' | 'aug' | 'sep';
  status: AccountStatus;
  seats: string; // display string, e.g. '410 of 500 seats active'
  base: Record<SubscoreKey, number>; // 0–100 each; health = round(mean)
  signals: string[]; // risk signals; empty array is a legal (healthy) state
  timeline: TimelineEvent[];
}

/** Sorted by renewal date — the pipeline renders this order verbatim.
 * Stress fixtures live here on purpose: Bridgewell's 52-char division name
 * exercises row/panel truncation; Quillbase, Kite and Northwind carry
 * empty signal arrays so the zero state renders; Kite (renewed) and
 * Meridix (churned) exercise the closed-account panel. */
const ACCOUNTS: Account[] = [
  {
    id: 'a-quill',
    name: 'Quillbase',
    segment: 'SMB',
    csm: 'Marcus Lee',
    arr: 18_500,
    renewalDate: 'Jul 17, 2026',
    dueLabel: 'in 7d',
    monthKey: 'jul',
    status: 'open',
    seats: '38 of 40 seats active',
    base: {usage: 82, engagement: 78, support: 88, sentiment: 84},
    signals: [],
    timeline: [
      {
        date: 'Jul 6',
        label: 'Renewal order form sent for signature',
        kind: 'note',
      },
      {date: 'Jun 24', label: 'QBR: workflow adoption up 22% QoQ', kind: 'note'},
    ],
  },
  {
    id: 'a-kite',
    name: 'Kite & Crane Creative',
    segment: 'SMB',
    csm: 'Marcus Lee',
    arr: 12_000,
    renewalDate: 'Jul 21, 2026',
    dueLabel: 'Renewed Jul 2',
    monthKey: 'jul',
    status: 'renewed',
    seats: '12 of 12 seats active',
    base: {usage: 90, engagement: 84, support: 92, sentiment: 86},
    signals: [],
    timeline: [
      {
        date: 'Jul 2',
        label: 'Renewed early — 1-year term, flat pricing',
        kind: 'note',
      },
      {
        date: 'Jun 18',
        label: 'Champion presented Evergreen at agency all-hands',
        kind: 'note',
      },
    ],
  },
  {
    id: 'a-atlas',
    name: 'Atlas Freight Systems',
    segment: 'Enterprise',
    csm: 'Dana Okafor',
    arr: 240_000,
    renewalDate: 'Jul 24, 2026',
    dueLabel: 'in 14d',
    monthKey: 'jul',
    status: 'open',
    seats: '176 of 320 seats active',
    base: {usage: 38, engagement: 44, support: 52, sentiment: 42},
    signals: [
      'Weekly active seats down 31% QoQ',
      'Champion (VP Ops) left in May — no replacement mapped',
      '3 open P2 tickets on dispatch sync',
    ],
    timeline: [
      {
        date: 'Jul 8',
        label: 'Procurement asked for month-to-month fallback terms',
        kind: 'risk',
      },
      {
        date: 'Jun 30',
        label: 'Usage review: dispatch module abandoned by 2 depots',
        kind: 'risk',
      },
      {date: 'Jun 12', label: 'Exec sponsor intro deferred by customer', kind: 'note'},
    ],
  },
  {
    id: 'a-halcyon',
    name: 'Halcyon Bio',
    segment: 'Mid-Market',
    csm: 'Priya Raman',
    arr: 86_000,
    renewalDate: 'Jul 31, 2026',
    dueLabel: 'in 21d',
    monthKey: 'jul',
    status: 'open',
    seats: '64 of 75 seats active',
    base: {usage: 64, engagement: 58, support: 70, sentiment: 56},
    signals: [
      'Renewal owner unresponsive for 2 weeks',
      'API call volume flat since April',
    ],
    timeline: [
      {
        date: 'Jul 3',
        label: 'Follow-up #3 to renewal owner — no reply',
        kind: 'risk',
      },
      {
        date: 'Jun 9',
        label: 'Lab-ops team requested LIMS integration demo',
        kind: 'note',
      },
    ],
  },
  {
    id: 'a-bridgewell',
    name: 'Bridgewell Insurance Group — Commercial Lines Division',
    segment: 'Enterprise',
    csm: 'Dana Okafor',
    arr: 310_000,
    renewalDate: 'Aug 14, 2026',
    dueLabel: 'in 35d',
    monthKey: 'aug',
    status: 'open',
    seats: '410 of 500 seats active',
    base: {usage: 58, engagement: 46, support: 64, sentiment: 48},
    signals: [
      'Success plan stale — last mutual milestone dated March',
      'CFO flagged spend in Q2 vendor review',
      'Two of three admin champions reorged to claims division',
    ],
    timeline: [
      {
        date: 'Jul 7',
        label: 'Renewal call: customer asked for 2-year pricing options',
        kind: 'note',
      },
      {
        date: 'Jun 26',
        label: 'Vendor review: Evergreen listed "under evaluation"',
        kind: 'risk',
      },
      {
        date: 'Jun 2',
        label: 'Claims-division reorg moved 2 admins off the account',
        kind: 'risk',
      },
    ],
  },
  {
    id: 'a-ferro',
    name: 'Ferro Manufacturing',
    segment: 'Mid-Market',
    csm: 'Marcus Lee',
    arr: 64_000,
    renewalDate: 'Aug 21, 2026',
    dueLabel: 'in 42d',
    monthKey: 'aug',
    status: 'open',
    seats: '58 of 60 seats active',
    base: {usage: 72, engagement: 68, support: 80, sentiment: 72},
    signals: ['New plant (Monterrey) not yet onboarded — expansion at risk'],
    timeline: [
      {
        date: 'Jul 1',
        label: 'Ops director confirmed intent to renew verbally',
        kind: 'note',
      },
      {date: 'Jun 20', label: 'Monterrey plant kickoff slipped to August', kind: 'risk'},
    ],
  },
  {
    id: 'a-northwind',
    name: 'Northwind Logistics',
    segment: 'Enterprise',
    csm: 'Priya Raman',
    arr: 198_000,
    renewalDate: 'Aug 28, 2026',
    dueLabel: 'in 49d',
    monthKey: 'aug',
    status: 'open',
    seats: '244 of 260 seats active',
    base: {usage: 78, engagement: 82, support: 74, sentiment: 78},
    signals: [],
    timeline: [
      {
        date: 'Jul 9',
        label: 'Legal redlines returned — term and DPA agreed',
        kind: 'note',
      },
      {
        date: 'Jun 17',
        label: 'QBR: route-planning module now in daily use at 9 hubs',
        kind: 'note',
      },
    ],
  },
  {
    id: 'a-juniper',
    name: 'Juniper Health Systems',
    segment: 'Enterprise',
    csm: 'Dana Okafor',
    arr: 172_000,
    renewalDate: 'Sep 11, 2026',
    dueLabel: 'in 63d',
    monthKey: 'sep',
    status: 'open',
    seats: '150 of 240 seats active',
    base: {usage: 50, engagement: 56, support: 40, sentiment: 46},
    signals: [
      '11 support tickets in the last 30 days (baseline: 3)',
      'HL7 feed outage burned trust with clinical ops',
    ],
    timeline: [
      {
        date: 'Jul 6',
        label: 'P1 postmortem shared; customer requested SLA credit',
        kind: 'risk',
      },
      {
        date: 'Jun 28',
        label: 'HL7 interface outage — 6h, clinical ops impacted',
        kind: 'risk',
      },
      {
        date: 'Jun 4',
        label: 'Expansion talk paused pending reliability review',
        kind: 'risk',
      },
    ],
  },
  {
    id: 'a-meridix',
    name: 'Meridix Analytics',
    segment: 'Mid-Market',
    csm: 'Priya Raman',
    arr: 54_000,
    renewalDate: 'Sep 18, 2026',
    dueLabel: 'Notice Jun 30',
    monthKey: 'sep',
    status: 'churned',
    seats: '9 of 45 seats active',
    base: {usage: 24, engagement: 18, support: 34, sentiment: 16},
    signals: ['Formal non-renewal notice received — moving to in-house build'],
    timeline: [
      {
        date: 'Jun 30',
        label: 'Non-renewal notice received; offboarding plan opened',
        kind: 'risk',
      },
      {
        date: 'May 15',
        label: 'Data-eng team demoed internal replacement to leadership',
        kind: 'risk',
      },
    ],
  },
  {
    id: 'a-corvid',
    name: 'Corvid Games',
    segment: 'SMB',
    csm: 'Marcus Lee',
    arr: 22_000,
    renewalDate: 'Sep 25, 2026',
    dueLabel: 'in 77d',
    monthKey: 'sep',
    status: 'open',
    seats: '26 of 30 seats active',
    base: {usage: 66, engagement: 60, support: 72, sentiment: 58},
    signals: ['Studio between projects — budget review in August'],
    timeline: [
      {
        date: 'Jun 27',
        label: 'Producer asked about pausing seats between projects',
        kind: 'risk',
      },
      {
        date: 'Jun 10',
        label: 'Live-ops dashboard adopted by the new title team',
        kind: 'note',
      },
    ],
  },
];

const MONTHS: {key: Account['monthKey']; label: string}[] = [
  {key: 'jul', label: 'July 2026'},
  {key: 'aug', label: 'August 2026'},
  {key: 'sep', label: 'September 2026'},
];

// ---------------------------------------------------------------------------
// SAVE-PLAY CATALOG — each motion lifts exactly ONE named subscore, so the
// dial, its subscore bar, and every dollar aggregate move through one path.
// ---------------------------------------------------------------------------

interface SavePlay {
  id: string;
  label: string;
  detail: string;
  subscore: SubscoreKey;
  lift: number; // points added to that subscore, capped at 100
  effort: 'Low' | 'Medium' | 'High';
}

const PLAYS: SavePlay[] = [
  {
    id: 'p-plan',
    label: 'Success plan refresh',
    detail: 'Rebuild the mutual action plan with dated milestones and owners.',
    subscore: 'engagement',
    lift: 4,
    effort: 'Low',
  },
  {
    id: 'p-train',
    label: 'Admin training blitz',
    detail: 'Two live enablement sessions targeting dormant seat cohorts.',
    subscore: 'usage',
    lift: 5,
    effort: 'Medium',
  },
  {
    id: 'p-esc',
    label: 'Support escalation review',
    detail: 'Weekly ticket triage with support engineering until the queue clears.',
    subscore: 'support',
    lift: 5,
    effort: 'Medium',
  },
  {
    id: 'p-exec',
    label: 'Exec sponsor alignment',
    detail: 'VP-to-VP call pairing roadmap themes to their FY27 initiatives.',
    subscore: 'sentiment',
    lift: 6,
    effort: 'Medium',
  },
  {
    id: 'p-champ',
    label: 'Champion rebuild campaign',
    detail: 'Identify and enable two new power users as internal champions.',
    subscore: 'engagement',
    lift: 7,
    effort: 'High',
  },
  {
    id: 'p-multi',
    label: 'Multi-year with loyalty pricing',
    detail: 'Offer a 2-year term at protected pricing to defuse the review.',
    subscore: 'sentiment',
    lift: 8,
    effort: 'High',
  },
];

const PLAY_BY_ID = new Map(PLAYS.map(p => [p.id, p]));

// ---------------------------------------------------------------------------
// DERIVATION — fixtures + the appliedPlays map in, every displayed number out.
// ---------------------------------------------------------------------------

/** Weighted-forecast convention: won 100% · commit 90% · best 60% ·
 * risk 30% · churn 0%. Opening value: 12,000 + 194,850 + 103,200 +
 * 216,600 = $526,650 = 56% of the $940,000 plan. */
const TIER_WEIGHT: Record<Tier, number> = {
  won: 1,
  commit: 0.9,
  best: 0.6,
  risk: 0.3,
  lost: 0,
};

/** Q3 FY26 gross-renewal plan — a fixed planning number, never derived. */
const PLAN_TARGET = 940_000;

type AppliedPlays = Record<string, string[]>;

interface AccountDerived {
  account: Account;
  effective: Record<SubscoreKey, number>;
  health: number; // Math.round(mean of the four effective subscores)
  tier: Tier;
  appliedPlayIds: string[];
}

function deriveAccount(
  account: Account,
  applied: AppliedPlays,
): AccountDerived {
  const appliedPlayIds = applied[account.id] ?? [];
  const effective: Record<SubscoreKey, number> = {...account.base};
  for (const playId of appliedPlayIds) {
    const play = PLAY_BY_ID.get(playId);
    if (play != null) {
      effective[play.subscore] = Math.min(
        100,
        effective[play.subscore] + play.lift,
      );
    }
  }
  const health = Math.round(
    (effective.usage +
      effective.engagement +
      effective.support +
      effective.sentiment) /
      4,
  );
  let tier: Tier;
  if (account.status === 'renewed') {
    tier = 'won';
  } else if (account.status === 'churned') {
    tier = 'lost';
  } else if (health >= 75) {
    tier = 'commit';
  } else if (health >= 55) {
    tier = 'best';
  } else {
    tier = 'risk';
  }
  return {account, effective, health, tier, appliedPlayIds};
}

const TIER_ORDER: Tier[] = ['won', 'commit', 'best', 'risk', 'lost'];

const TIER_LABEL: Record<Tier, string> = {
  won: 'Renewed',
  commit: 'Commit',
  best: 'Best case',
  risk: 'At risk',
  lost: 'Churned',
};

const fmtUSD = (n: number) => \`$\${n.toLocaleString('en-US')}\`;
const fmtCompact = (n: number) =>
  n >= 1_000_000
    ? \`$\${(n / 1_000_000).toFixed(2)}M\`
    : \`$\${(n / 1_000).toFixed(1)}K\`;

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-customer-health-renewals.
// Density grid repeated verbatim: header 56 · forecast band 88 · month
// headers 32 · account rows 64 · due column 76 · row dial 40 · panel 340 ·
// panel dial 96 · subscore bars 8 · play rows min 56 · action buttons 40 ·
// tier chips 22 · strip 20.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .chr-focusable:focus-visible {
  outline: 2px solid \${PINE};
  outline-offset: -2px;
}
.\${SCOPE} .chr-live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header: 56px brand row ------------------------------------------- */
.\${SCOPE} .chr-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  min-height: 56px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
}
.\${SCOPE} .chr-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${PINE};
}
.\${SCOPE} .chr-title-cluster {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1 1 260px;
}
.\${SCOPE} .chr-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.\${SCOPE} .chr-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .chr-chip strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .chr-chip--risk {
  border-color: \${RED};
  background: \${RED_TINT};
  color: \${RED};
}
.\${SCOPE} .chr-chip--risk strong {
  color: \${RED};
}
.\${SCOPE} .chr-chip--pine {
  border-color: \${PINE};
  background: \${PINE_TINT};
  color: \${PINE};
}
.\${SCOPE} .chr-chip--pine strong {
  color: \${PINE};
}
/* --- content column ----------------------------------------------------- */
.\${SCOPE} .chr-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- forecast band: 88px min ------------------------------------------- */
.\${SCOPE} .chr-band {
  flex-shrink: 0;
  box-sizing: border-box;
  min-height: 88px;
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.\${SCOPE} .chr-band-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-4);
}
.\${SCOPE} .chr-band-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  flex: 1 1 auto;
}
.\${SCOPE} .chr-plan {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .chr-plan strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .chr-plan-rail {
  width: 180px;
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .chr-plan-fill {
  height: 100%;
  border-radius: 999px;
  background: \${PINE};
  transition: width 240ms ease;
}
/* Proportional five-bucket strip — 20px tall, 2px seams. Each segment's
   flex-grow IS its dollar amount, so widths are the math. */
.\${SCOPE} .chr-strip {
  display: flex;
  height: 20px;
  border-radius: var(--radius-container, 8px);
  overflow: hidden;
  gap: 2px;
}
.\${SCOPE} .chr-seg {
  min-width: 3px;
  transition: flex-grow 240ms ease;
}
.\${SCOPE} .chr-seg--won { background: \${SEG_WON}; }
.\${SCOPE} .chr-seg--commit { background: \${SEG_COMMIT}; }
.\${SCOPE} .chr-seg--best { background: \${SEG_BEST}; }
.\${SCOPE} .chr-seg--risk { background: \${SEG_RISK}; }
.\${SCOPE} .chr-seg--lost { background: \${SEG_LOST}; }
.\${SCOPE} .chr-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1) var(--spacing-4);
}
.\${SCOPE} .chr-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .chr-legend-item strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .chr-swatch {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}
/* --- body: pipeline + 340px panel --------------------------------------- */
.\${SCOPE} .chr-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
.\${SCOPE} .chr-pipeline {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
/* Sticky 32px month headers restate that month's derived ARR. */
.\${SCOPE} .chr-month {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 32px;
  box-sizing: border-box;
  padding: 0 var(--spacing-4);
  background: var(--color-background-muted);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-month strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .chr-month .chr-month-fill {
  flex: 1;
}
/* 64px account rows: due 76 · dial 40 · account (flex) · signals · ARR 92 ·
   tier 96. Real <button>s with aria-pressed. */
.\${SCOPE} .chr-row {
  display: grid;
  grid-template-columns: 76px 40px minmax(0, 1fr) minmax(0, 220px) 92px 96px;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  box-sizing: border-box;
  height: 64px;
  padding: 0 var(--spacing-4);
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} .chr-row:hover {
    background: var(--color-background-muted);
  }
}
.\${SCOPE} .chr-row[aria-pressed='true'] {
  background: var(--color-background-muted);
  box-shadow: inset 3px 0 0 0 \${PINE};
}
.\${SCOPE} .chr-row--closed .chr-name,
.\${SCOPE} .chr-row--closed .chr-arr {
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-due {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .chr-due-date {
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.\${SCOPE} .chr-due-in {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .chr-acct {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .chr-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .chr-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* The due label that surfaces inside the meta line below 680px only. */
.\${SCOPE} .chr-meta-due {
  display: none;
}
.\${SCOPE} .chr-signals {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}
.\${SCOPE} .chr-signal {
  max-width: 100%;
  box-sizing: border-box;
  padding: 1px 8px;
  border-radius: 999px;
  background: \${RED_TINT};
  color: \${RED};
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .chr-signal--more {
  background: var(--color-background-muted);
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-signal--none {
  background: transparent;
  color: var(--color-text-secondary);
  font-weight: 400;
  padding-inline: 0;
}
.\${SCOPE} .chr-arr {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  text-align: right;
  white-space: nowrap;
}
/* 22px tier chips — text carries the tier; color reinforces it. */
.\${SCOPE} .chr-tier {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 22px;
  box-sizing: border-box;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  justify-self: end;
}
.\${SCOPE} .chr-tier--won,
.\${SCOPE} .chr-tier--commit {
  border-color: \${PINE};
  background: \${PINE_TINT};
  color: \${PINE};
}
.\${SCOPE} .chr-tier--best {
  border-color: \${AMBER};
  background: \${AMBER_TINT};
  color: \${AMBER};
}
.\${SCOPE} .chr-tier--risk {
  border-color: \${RED};
  background: \${RED_TINT};
  color: \${RED};
}
.\${SCOPE} .chr-tier--lost {
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
}
/* --- account panel: 340px ------------------------------------------------ */
.\${SCOPE} .chr-panel {
  width: 340px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}
.\${SCOPE} .chr-panel-head {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .chr-panel-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  overflow-wrap: anywhere;
}
.\${SCOPE} .chr-panel-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .chr-dial-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}
.\${SCOPE} .chr-dial-facts {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-dial-facts strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .chr-section-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-2);
}
/* Subscore bars: 8px rails; the delta cell lights up when a play lifts. */
.\${SCOPE} .chr-bar-row {
  display: grid;
  grid-template-columns: 108px 1fr 56px;
  align-items: center;
  column-gap: var(--spacing-2);
  min-height: 24px;
  font-size: 12px;
}
.\${SCOPE} .chr-bar-label {
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .chr-bar-rail {
  height: 8px;
  border-radius: 999px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .chr-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 240ms ease;
}
.\${SCOPE} .chr-bar-value {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  text-align: right;
  white-space: nowrap;
}
.\${SCOPE} .chr-bar-value em {
  font-style: normal;
  color: \${PINE};
  font-weight: 700;
}
.\${SCOPE} .chr-panel-signal {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-1) 0;
  font-size: 12px;
  color: var(--color-text-primary);
}
.\${SCOPE} .chr-panel-signal svg {
  flex-shrink: 0;
  margin-top: 1px;
}
.\${SCOPE} .chr-panel-empty {
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* Save-play composer: min-56px play rows with a 40px apply path. */
.\${SCOPE} .chr-play {
  box-sizing: border-box;
  min-height: 56px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
}
.\${SCOPE} .chr-play--applied {
  border-color: \${PINE};
  background: \${PINE_TINT};
}
.\${SCOPE} .chr-play-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .chr-play-name {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.\${SCOPE} .chr-play-lift {
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: \${PINE};
  white-space: nowrap;
}
.\${SCOPE} .chr-play-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-play-foot {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .chr-play-effort {
  flex: 1;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .chr-play-logged {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: \${PINE};
}
/* Density-grid contract: every mutation path (Apply/Undo/Reset) is a 40px
   target regardless of the DS button's compact label sizing. */
.\${SCOPE} .chr-play-foot button,
.\${SCOPE} .chr-chips button {
  min-height: 40px;
}
/* Account timeline: date gutter + dot spine. */
.\${SCOPE} .chr-event {
  display: grid;
  grid-template-columns: 48px 10px 1fr;
  column-gap: var(--spacing-2);
  padding: var(--spacing-1) 0;
  font-size: 12px;
}
.\${SCOPE} .chr-event-date {
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .chr-event-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  margin-top: 4px;
  background: var(--color-border);
}
.\${SCOPE} .chr-event-dot--risk { background: \${RED}; }
.\${SCOPE} .chr-event-dot--play { background: \${PINE}; }
.\${SCOPE} .chr-event-label {
  color: var(--color-text-primary);
  min-width: 0;
}
.\${SCOPE} .chr-event-label--play {
  color: \${PINE};
  font-weight: 600;
}
/* Dial arcs animate via stroke-dasharray. */
.\${SCOPE} .chr-dial-arc {
  transition: stroke-dasharray 240ms ease;
}
/* --- responsive subtraction --------------------------------------------- */
@media (max-width: 900px) {
  .\${SCOPE} .chr-row {
    grid-template-columns: 76px 40px minmax(0, 1fr) 92px 96px;
  }
  .\${SCOPE} .chr-signals {
    display: none;
  }
}
@media (max-width: 680px) {
  .\${SCOPE} .chr-body {
    flex-direction: column;
    overflow-y: auto;
  }
  .\${SCOPE} .chr-pipeline {
    flex: none;
    overflow-y: visible;
  }
  .\${SCOPE} .chr-month {
    position: static;
  }
  .\${SCOPE} .chr-panel {
    width: auto;
    border-left: 0;
    border-top: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .chr-row {
    grid-template-columns: 40px minmax(0, 1fr) 84px 90px;
  }
  .\${SCOPE} .chr-due {
    display: none;
  }
  .\${SCOPE} .chr-meta-due {
    display: inline;
  }
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .chr-plan-fill,
  .\${SCOPE} .chr-seg,
  .\${SCOPE} .chr-bar-fill,
  .\${SCOPE} .chr-dial-arc {
    transition: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — purely props-in, JSX out; all state lives in the
// page component.
// ---------------------------------------------------------------------------

const TIER_COLOR: Record<Tier, string> = {
  won: PINE,
  commit: PINE,
  best: AMBER,
  risk: RED,
  lost: 'var(--color-text-secondary)',
};

const SEG_COLOR: Record<Tier, string> = {
  won: SEG_WON,
  commit: SEG_COMMIT,
  best: SEG_BEST,
  risk: SEG_RISK,
  lost: SEG_LOST,
};

/** Evergreen pine-bough mark — tiny inline SVG, currentColor = brand pine. */
function BrandMark() {
  return (
    <span className="chr-mark" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l5.4 7.2h-3.1L19 16.4h-6v4.1h-2v-4.1H5l4.7-7.2H6.6L12 2z" />
      </svg>
    </span>
  );
}

/** SVG health dial: a 270° arc (pathLength-normalized) whose fill fraction
 * IS score/100. Track and value arc share one rotate(135°) so 0 and 100
 * land symmetrically about the bottom gap. Sizes: 40 (rows) · 96 (panel). */
function HealthDial({
  score,
  tier,
  size,
}: {
  score: number;
  tier: Tier;
  size: 40 | 96;
}) {
  const stroke = size === 96 ? 8 : 4;
  const c = size / 2;
  const r = c - stroke / 2;
  const color = TIER_COLOR[tier];
  return (
    <svg
      width={size}
      height={size}
      viewBox={\`0 0 \${size} \${size}\`}
      role="img"
      aria-label={\`Health \${score} of 100 — \${TIER_LABEL[tier]}\`}>
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="75 100"
        transform={\`rotate(135 \${c} \${c})\`}
      />
      <circle
        className="chr-dial-arc"
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={\`\${Math.max(1, score * 0.75)} 100\`}
        transform={\`rotate(135 \${c} \${c})\`}
      />
      <text
        x={c}
        y={size === 96 ? c + 2 : c + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--color-text-primary)"
        fontSize={size === 96 ? 26 : 13}
        fontWeight={700}
        style={{fontVariantNumeric: 'tabular-nums'}}>
        {score}
      </text>
      {size === 96 && (
        <text
          x={c}
          y={c + 22}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize={10}
          fontWeight={600}>
          / 100
        </text>
      )}
    </svg>
  );
}

/** One 64px pipeline row. The dial, tier chip, and (below 680px) the meta
 * line all re-derive from the same AccountDerived value the panel reads. */
function AccountRow({
  derived,
  isSelected,
  onSelect,
}: {
  derived: AccountDerived;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const {account, health, tier} = derived;
  const isClosed = account.status !== 'open';
  const signalCount = account.signals.length;
  return (
    <button
      type="button"
      className={\`chr-row chr-focusable\${isClosed ? ' chr-row--closed' : ''}\`}
      aria-pressed={isSelected}
      aria-label={\`\${account.name} — renews \${account.renewalDate}, ARR \${fmtUSD(
        account.arr,
      )}, health \${health}, \${TIER_LABEL[tier]}\`}
      onClick={() => onSelect(account.id)}>
      <span className="chr-due">
        <span className="chr-due-date">
          {account.renewalDate.replace(', 2026', '')}
        </span>
        <span className="chr-due-in">{account.dueLabel}</span>
      </span>
      <HealthDial score={health} tier={tier} size={40} />
      <span className="chr-acct">
        <span className="chr-name">{account.name}</span>
        <span className="chr-meta">
          {account.segment} · {account.csm}
          <span className="chr-meta-due">
            {' '}
            · {account.renewalDate.replace(', 2026', '')} ({account.dueLabel})
          </span>
        </span>
      </span>
      <span className="chr-signals">
        {signalCount === 0 ? (
          <span className="chr-signal chr-signal--none">
            {isClosed ? '—' : 'No open signals'}
          </span>
        ) : (
          <>
            <span className="chr-signal" title={account.signals[0]}>
              {account.signals[0]}
            </span>
            {signalCount > 1 && (
              <span
                className="chr-signal chr-signal--more"
                title={account.signals.slice(1).join(' · ')}>
                +{signalCount - 1} more
              </span>
            )}
          </>
        )}
      </span>
      <span className="chr-arr">{fmtUSD(account.arr)}</span>
      <span className={\`chr-tier chr-tier--\${tier}\`}>{TIER_LABEL[tier]}</span>
    </button>
  );
}

/** Subscore bar: label · 8px rail · value cell that grows a pine “+N”
 * delta the moment a play lifts this subscore. */
function SubscoreBar({
  label,
  base,
  effective,
  tier,
}: {
  label: string;
  base: number;
  effective: number;
  tier: Tier;
}) {
  const lifted = effective - base;
  return (
    <div className="chr-bar-row">
      <span className="chr-bar-label">{label}</span>
      <span className="chr-bar-rail">
        <span
          className="chr-bar-fill"
          style={{width: \`\${effective}%\`, background: TIER_COLOR[tier]}}
        />
      </span>
      <span className="chr-bar-value">
        {effective}
        {lifted > 0 && <em> +{lifted}</em>}
      </span>
    </div>
  );
}

/** The 340px account panel: dial + facts, subscore bars, signals, the
 * save-play composer, and the timeline (fixture events + logged plays). */
function AccountPanel({
  derived,
  onApply,
  onUndo,
}: {
  derived: AccountDerived;
  onApply: (accountId: string, playId: string) => void;
  onUndo: (accountId: string, playId: string) => void;
}) {
  const {account, effective, health, tier, appliedPlayIds} = derived;
  const isClosed = account.status !== 'open';
  const playEvents: TimelineEvent[] = appliedPlayIds
    .map(playId => PLAY_BY_ID.get(playId))
    .filter((p): p is SavePlay => p != null)
    .map(p => ({
      date: 'Jul 10',
      label: \`Play logged: \${p.label} (+\${p.lift} \${p.subscore})\`,
      kind: 'play' as const,
    }))
    .reverse();
  const events = [...playEvents, ...account.timeline];
  return (
    <aside className="chr-panel" aria-label={\`\${account.name} account detail\`}>
      <div className="chr-panel-head">
        <span className="chr-panel-name">{account.name}</span>
        <span className="chr-panel-sub">
          {account.segment} · CSM {account.csm} · {account.seats}
        </span>
      </div>

      <div className="chr-dial-row">
        <HealthDial score={health} tier={tier} size={96} />
        <div className="chr-dial-facts">
          <span>
            Tier{' '}
            <span className={\`chr-tier chr-tier--\${tier}\`}>
              {TIER_LABEL[tier]}
            </span>
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
            <Icon icon={Clock3Icon} size="sm" color="secondary" />
            Renews <strong>{account.renewalDate}</strong>
          </span>
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
            <Icon icon={UsersIcon} size="sm" color="secondary" />
            ARR <strong>{fmtUSD(account.arr)}</strong>
          </span>
        </div>
      </div>

      <section aria-label="Health score breakdown">
        <h2 className="chr-section-title">
          <Icon icon={HeartPulseIcon} size="sm" color="inherit" /> Score
          breakdown
        </h2>
        {SUBSCORE_ORDER.map(key => (
          <SubscoreBar
            key={key}
            label={SUBSCORE_LABEL[key]}
            base={account.base[key]}
            effective={effective[key]}
            tier={tier}
          />
        ))}
      </section>

      <section aria-label="Risk signals">
        <h2 className="chr-section-title">Risk signals</h2>
        {account.signals.length === 0 ? (
          <p className="chr-panel-empty">
            No open signals — steady usage and a responsive champion.
          </p>
        ) : (
          account.signals.map(signal => (
            <div key={signal} className="chr-panel-signal">
              <span style={{color: RED, display: 'inline-flex'}}>
                <Icon icon={TrendingDownIcon} size="sm" color="inherit" />
              </span>
              <span>{signal}</span>
            </div>
          ))
        )}
      </section>

      <section aria-label="Save-play composer">
        <h2 className="chr-section-title">
          <Icon icon={SparklesIcon} size="sm" color="inherit" /> Save plays
        </h2>
        {isClosed ? (
          <p className="chr-panel-empty">
            {account.status === 'renewed'
              ? 'Renewal closed won — plays are read-only on this account.'
              : 'Churn notice on file — plays are read-only on this account.'}
          </p>
        ) : (
          PLAYS.map(play => {
            const isApplied = appliedPlayIds.includes(play.id);
            return (
              <div
                key={play.id}
                className={\`chr-play\${isApplied ? ' chr-play--applied' : ''}\`}>
                <div className="chr-play-top">
                  <span className="chr-play-name">{play.label}</span>
                  <span className="chr-play-lift">
                    <Icon icon={ArrowUpRightIcon} size="sm" color="inherit" />+
                    {play.lift} {play.subscore}
                  </span>
                </div>
                <span className="chr-play-detail">{play.detail}</span>
                <div className="chr-play-foot">
                  <span className="chr-play-effort">
                    Effort: {play.effort}
                  </span>
                  {isApplied ? (
                    <>
                      <span className="chr-play-logged">
                        <Icon
                          icon={CheckCircle2Icon}
                          size="sm"
                          color="inherit"
                        />
                        Logged
                      </span>
                      <Button
                        label="Undo"
                        variant="ghost"
                        size="sm"
                        onClick={() => onUndo(account.id, play.id)}
                      />
                    </>
                  ) : (
                    <Button
                      label="Apply play"
                      variant="secondary"
                      size="sm"
                      onClick={() => onApply(account.id, play.id)}
                    />
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      <section aria-label="Account timeline">
        <h2 className="chr-section-title">Timeline</h2>
        {events.map((event, index) => (
          <div key={\`\${event.date}-\${index}\`} className="chr-event">
            <span className="chr-event-date">{event.date}</span>
            <span
              className={\`chr-event-dot\${
                event.kind === 'risk'
                  ? ' chr-event-dot--risk'
                  : event.kind === 'play'
                    ? ' chr-event-dot--play'
                    : ''
              }\`}
            />
            <span
              className={\`chr-event-label\${
                event.kind === 'play' ? ' chr-event-label--play' : ''
              }\`}>
              {event.label}
            </span>
          </div>
        ))}
      </section>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one appliedPlays map owns every mutation; all aggregates re-derive.
// ---------------------------------------------------------------------------

export default function CustomerHealthRenewalsTemplate() {
  const [appliedPlays, setAppliedPlays] = useState<AppliedPlays>({});
  const [selectedId, setSelectedId] = useState<string>('a-atlas');
  const [announcement, setAnnouncement] = useState('');

  const derivedAccounts = useMemo(
    () => ACCOUNTS.map(account => deriveAccount(account, appliedPlays)),
    [appliedPlays],
  );
  const derivedById = useMemo(
    () => new Map(derivedAccounts.map(d => [d.account.id, d])),
    [derivedAccounts],
  );

  // Bucket dollars + counts, weighted forecast, plays logged — all from the
  // same derived rows the pipeline renders, so nothing can drift.
  const buckets = useMemo(() => {
    const out: Record<Tier, {amount: number; count: number}> = {
      won: {amount: 0, count: 0},
      commit: {amount: 0, count: 0},
      best: {amount: 0, count: 0},
      risk: {amount: 0, count: 0},
      lost: {amount: 0, count: 0},
    };
    for (const d of derivedAccounts) {
      out[d.tier].amount += d.account.arr;
      out[d.tier].count += 1;
    }
    return out;
  }, [derivedAccounts]);

  const bookTotal = ACCOUNTS.reduce((sum, a) => sum + a.arr, 0);
  const weighted = Math.round(
    derivedAccounts.reduce(
      (sum, d) => sum + d.account.arr * TIER_WEIGHT[d.tier],
      0,
    ),
  );
  const weightedPct = Math.round((weighted / PLAN_TARGET) * 100);
  const playsLogged = Object.values(appliedPlays).reduce(
    (sum, ids) => sum + ids.length,
    0,
  );

  const selected = derivedById.get(selectedId) ?? derivedAccounts[0];

  const applyPlay = (accountId: string, playId: string) => {
    const account = ACCOUNTS.find(a => a.id === accountId);
    const play = PLAY_BY_ID.get(playId);
    if (account == null || play == null) {
      return;
    }
    const before = deriveAccount(account, appliedPlays);
    const after = deriveAccount(account, {
      ...appliedPlays,
      [accountId]: [...(appliedPlays[accountId] ?? []), playId],
    });
    setAppliedPlays(prev => ({
      ...prev,
      [accountId]: [...(prev[accountId] ?? []), playId],
    }));
    const weightedDelta = Math.round(
      account.arr * (TIER_WEIGHT[after.tier] - TIER_WEIGHT[before.tier]),
    );
    setAnnouncement(
      \`\${play.label} applied to \${account.name}: health \${before.health} to \${
        after.health
      }, tier \${TIER_LABEL[after.tier]}\${
        weightedDelta !== 0
          ? \`, weighted forecast \${
              weightedDelta > 0 ? 'up' : 'down'
            } \${fmtCompact(Math.abs(weightedDelta))}\`
          : ''
      }.\`,
    );
  };

  const undoPlay = (accountId: string, playId: string) => {
    const account = ACCOUNTS.find(a => a.id === accountId);
    const play = PLAY_BY_ID.get(playId);
    setAppliedPlays(prev => ({
      ...prev,
      [accountId]: (prev[accountId] ?? []).filter(id => id !== playId),
    }));
    if (account != null && play != null) {
      setAnnouncement(\`\${play.label} removed from \${account.name}.\`);
    }
  };

  const resetPlays = () => {
    setAppliedPlays({});
    setAnnouncement('All logged plays cleared — forecast back to baseline.');
  };

  const header = (
    <LayoutHeader hasDivider padding={0}>
      <div className="chr-header-row">
        <div className="chr-title-cluster">
          <BrandMark />
          <Heading level={1}>Evergreen · Renewal Desk</Heading>
          <Text type="supporting" color="secondary">
            Q3 FY26 · closes Sep 30 · today Jul 10
          </Text>
        </div>
        <div className="chr-chips">
          <span className="chr-chip chr-chip--risk">
            <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
            At risk <strong>{fmtCompact(buckets.risk.amount)}</strong>
            {' · '}
            {buckets.risk.count} accts
          </span>
          <Tooltip
            content={TIER_ORDER.map(
              tier =>
                \`\${TIER_LABEL[tier]} \${fmtCompact(buckets[tier].amount)}\`,
            ).join(' · ')}>
            <span className="chr-chip chr-chip--pine">
              Weighted <strong>{fmtCompact(weighted)}</strong>
              {' · '}
              {weightedPct}% of plan
            </span>
          </Tooltip>
          <span className="chr-chip">
            <Icon icon={SparklesIcon} size="sm" color="inherit" />
            Plays logged <strong>{playsLogged}</strong>
          </span>
          {playsLogged > 0 && (
            <Button
              label="Reset plays"
              variant="ghost"
              size="sm"
              onClick={resetPlays}
            />
          )}
        </div>
      </div>
    </LayoutHeader>
  );

  const content = (
    <LayoutContent padding={0}>
      <div className="chr-content">
        {/* Forecast band: proportional bucket strip + legend + plan meter. */}
        <section className="chr-band" aria-label="Quarter renewal forecast">
          <div className="chr-band-top">
            <span className="chr-band-title">
              Q3 FY26 renewal forecast · book {fmtCompact(bookTotal)}
            </span>
            <span className="chr-plan">
              Weighted <strong>{fmtCompact(weighted)}</strong> /{' '}
              {fmtCompact(PLAN_TARGET)} plan
              <span className="chr-plan-rail" aria-hidden>
                <span
                  className="chr-plan-fill"
                  style={{width: \`\${Math.min(100, weightedPct)}%\`}}
                />
              </span>
              <strong>{weightedPct}%</strong>
            </span>
          </div>
          <div className="chr-strip" aria-hidden>
            {TIER_ORDER.map(tier =>
              buckets[tier].amount > 0 ? (
                <span
                  key={tier}
                  className={\`chr-seg chr-seg--\${tier}\`}
                  style={{flexGrow: buckets[tier].amount}}
                  title={\`\${TIER_LABEL[tier]} · \${fmtCompact(
                    buckets[tier].amount,
                  )}\`}
                />
              ) : null,
            )}
          </div>
          <div className="chr-legend">
            {TIER_ORDER.map(tier => (
              <span key={tier} className="chr-legend-item">
                <span
                  className="chr-swatch"
                  style={{background: SEG_COLOR[tier]}}
                  aria-hidden
                />
                {TIER_LABEL[tier]}{' '}
                <strong>{fmtCompact(buckets[tier].amount)}</strong>
                {\` (\${buckets[tier].count})\`}
              </span>
            ))}
          </div>
        </section>

        <div className="chr-body">
          {/* Pipeline: sticky month headers over 64px account rows. */}
          <div className="chr-pipeline" role="list" aria-label="Renewal pipeline">
            {MONTHS.map(month => {
              const rows = derivedAccounts.filter(
                d => d.account.monthKey === month.key,
              );
              const monthArr = rows.reduce((sum, d) => sum + d.account.arr, 0);
              return (
                <div key={month.key} role="presentation">
                  <div className="chr-month">
                    {month.label}
                    <span className="chr-month-fill" />
                    <strong>{fmtCompact(monthArr)}</strong>
                    {' · '}
                    {rows.length} renewals
                  </div>
                  {rows.map(d => (
                    <div key={d.account.id} role="listitem">
                      <AccountRow
                        derived={d}
                        isSelected={d.account.id === selectedId}
                        onSelect={setSelectedId}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <AccountPanel
            derived={selected}
            onApply={applyPlay}
            onUndo={undoPlay}
          />
        </div>
      </div>
    </LayoutContent>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <div className="chr-live" aria-live="polite">
        {announcement}
      </div>
      <Layout height="fill" header={header} content={content} />
    </div>
  );
}



`;export{e as default};