var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Variant lab picture for experiment
 *   EXP-114 "Refund agent — system prompt revision" as of the frozen session
 *   afternoon of Wed Jul 15 2026. Four prompt variants (v3.2 production
 *   champion + challengers A/B/C), five judge-rubric dimensions with weights
 *   .30/.25/.20/.15/.10 (sum 1.00), and five failure clusters with fixed
 *   per-variant hit counts. Hand-checked ledger at first render:
 *     Weighted overall = Σ weight·score:
 *       ctl  24.6+19.5+18.2+12.6+7.0 = 81.9   (1,240 graded)
 *       A    25.2+20.0+17.6+12.0+8.8 = 83.6   (402 graded)
 *       B    26.4+21.5+18.6+12.3+7.4 = 86.2   (512 graded)
 *       C    25.8+21.0+18.0+12.6+7.8 = 85.2   (486 graded)
 *     Graded total 1,240+402+512+486 = 2,640.
 *     Critical-cluster rates per 1k graded (count/graded·1000, 1 decimal):
 *       invents-order:  ctl 9/1240=7.3 · A 11/402=27.4 · B 2/512=3.9 · C 6/486=12.3
 *       skips-id-check: ctl 3/1240=2.4 · A 3/402=7.5  · B 0/512=0.0 · C 5/486=10.3
 *     Promotion gates vs champion ctl (81.9): n≥400 passes for all; overall
 *     beats champion for all three challengers; the no-critical-regression
 *     gate (rate must not exceed the champion's on ANY critical cluster)
 *     passes ONLY for B (A fails both criticals, C fails both) ⇒ exactly one
 *     variant is promotable at first render. After promoting B the gate wall
 *     re-derives against B's rates (3.9 / 0.0) and nobody passes — the log's
 *     Undo is the honest way back. Ramp policy 64 + 3·12 = 100%.
 *   No clock reads, no randomness, no timers, no network assets; the session
 *   log clock is a frozen 14:37 start advanced +2 min per session event.
 * @output Variant — Prompt Experiment Lab: an LLM prompt A/B bench. A 56px
 *   brand header (fork mark, EXP-114 title, champion / graded / judge chips)
 *   over a 72px cohort-allocation strip (20px segmented traffic bar + legend
 *   row, ramp policy 64/12/12/12), then a four-up variant comparison grid —
 *   each column carries the prompt-diff excerpt, five rubric score bars with
 *   a champion baseline tick and a signed delta, failure-cluster chips
 *   (severity dot · per-1k rate · regression/improved tag), latency/cost
 *   stats, and a three-row promotion gate wall with a Promote button that
 *   enables only when every gate passes. A bench bar pins to the bottom:
 *   left, the selected failure cluster's per-variant rate chips and a graded
 *   transcript excerpt with the failing span highlighted; right, the
 *   promotion log. Signature move: Promote a challenger → the allocation
 *   strip reflows to the new 64/12/12/12 split, every rubric delta and
 *   baseline tick re-derives against the new champion, every cluster chip's
 *   regression/improved tag reassigns, the gate walls recompute (and close),
 *   and the log appends an entry with snapshot-exact Undo — all in one
 *   render, no confirms, no timers.
 * @position Page template; emitted by \`astryx template prompt-experiment-lab\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader (brand + exp
 *   chips) | content column: allocation strip 72 → variant grid (flex 1,
 *   overflow-y auto) → bench bar (min 128, flex-shrink 0, two regions:
 *   cluster inspector fill + promotion log 300px). No side panels — the
 *   four columns ARE the page; the bench bar is the one inspection surface.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): grid is
 *   repeat(4, minmax(232px, 1fr)) + 3·12px gaps + 2·16px padding = 996px
 *   minimum, so all four columns fit side by side with room to flex.
 * - <=900px: grid drops to 2 columns (rows scroll); the bench bar's log
 *   region narrows to 240px; header chips wrap under the title.
 * - <=600px (390px embed): single-column grid; the allocation legend wraps
 *   to two rows; the bench bar stacks inspector over log; every button and
 *   chip keeps a >=40px hit target (chips get min-height 40 here).
 *   Subtraction, not squeeze: columns never compress below 232px.
 * Container policy: work-surface archetype — columns, bars, chips, and one
 *   bench bar; no Cards. Cluster chips and log-undo are real <button>s
 *   (aria-pressed on the selected cluster); Promote/Undo are DS Buttons.
 *   All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Variant
 *   lime): light-dark(#4D7C0F, #A3E635) — #4D7C0F on #FFFFFF ≈ 5.0:1,
 *   #A3E635 on #1C1C1E ≈ 10.4:1 — used for the mark, the champion
 *   allocation segment, baseline ticks, added prompt lines, and the
 *   champion role chip. State pairs with math at the declaration: critical
 *   red light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1), major amber
 *   light-dark(#B45309, #F5A623) (≈4.7:1 / ≈8.8:1), improved green
 *   light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1). Tints are sub-16%
 *   alpha washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · allocation
 *   strip 72 (20px bar + 24px legend) · column min 232 · 12px grid gaps ·
 *   16px page gutters · column header 64 · rubric rows 34 (6px track) ·
 *   cluster chips 26 (40 on touch) · gate rows 24 · stat cells 44 · bench
 *   bar min 128 · log region 300 · action buttons 40 · focus ring 2px.
 * Fixture policy: one state owner — championId + a session log array —
 *   drives EVERYTHING derived: allocation split, rubric deltas and ticks,
 *   cluster regression tags, gate verdicts, header champion chip, and the
 *   log itself, so no surface can drift from the fixtures. Undo restores
 *   the previous championId recorded on the log entry.
 */

import {useMemo, useState} from 'react';

import {
  AlertTriangleIcon,
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  CrownIcon,
  FlaskConicalIcon,
  GaugeIcon,
  ScaleIcon,
  Undo2Icon,
  XCircleIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-prompt-experiment-lab';

// THE quarantined Variant brand lime. #4D7C0F on #FFFFFF ≈ 5.0:1 (passes
// 4.5:1 for the 11–13px chip text it colors); #A3E635 on a ~#1C1C1E dark
// surface ≈ 10.4:1. Also the champion segment, baseline ticks, + diff lines.
const BRAND = 'light-dark(#4D7C0F, #A3E635)';
// Text/glyph ON a solid brand fill (champion allocation segment, champion
// role chip): #FFFFFF on #4D7C0F ≈ 5.0:1; #1A2E05 on #A3E635 ≈ 9.8:1
// (white on #A3E635 would fail at ~1.4:1).
const BRAND_ON = 'light-dark(#FFFFFF, #1A2E05)';
// Brand washes: 12% / 16% alpha surface nudges; text on them keeps its own
// ≥4.5:1 pair. The 35/22% pairs fill challenger allocation segments where
// the only text is the separate legend row, never on the segment itself.
const BRAND_TINT = 'light-dark(rgba(77, 124, 15, 0.12), rgba(163, 230, 53, 0.16))';
const SEG_A = 'light-dark(rgba(77, 124, 15, 0.42), rgba(163, 230, 53, 0.42))';
const SEG_B = 'light-dark(rgba(77, 124, 15, 0.26), rgba(163, 230, 53, 0.26))';
const SEG_C = 'light-dark(rgba(77, 124, 15, 0.14), rgba(163, 230, 53, 0.14))';
// Critical red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on #1C1C1E ≈ 7.2:1.
const CRIT = 'light-dark(#DC2626, #F87171)';
const CRIT_TINT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';
// Major amber: #B45309 on #FFFFFF ≈ 4.7:1; #F5A623 on #1C1C1E ≈ 8.8:1.
const MAJOR = 'light-dark(#B45309, #F5A623)';
// Improved green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const GOOD = 'light-dark(#15803D, #4ADE80)';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ---------------------------------------------------------------------------
// FIXTURES — EXP-114 "Refund agent — system prompt revision".
// All aggregates in the header comment are re-derived live from these rows.
// ---------------------------------------------------------------------------

type VariantId = 'ctl' | 'va' | 'vb' | 'vc';
type RubricKey = 'acc' | 'grd' | 'pol' | 'tone' | 'brv';
type Severity = 'critical' | 'major' | 'minor';

interface RubricDimension {
  key: RubricKey;
  label: string;
  weight: number;
  blurb: string;
}

/** Weights sum to 1.00 — overall = Σ weight·score (see header ledger). */
const RUBRIC: RubricDimension[] = [
  {key: 'acc', label: 'Accuracy', weight: 0.3, blurb: 'Resolution matches the order ledger'},
  {key: 'grd', label: 'Groundedness', weight: 0.25, blurb: 'Every claim cites a retrieved record'},
  {key: 'pol', label: 'Policy compliance', weight: 0.2, blurb: 'Follows refund policy RP-22'},
  {key: 'tone', label: 'Tone', weight: 0.15, blurb: 'Warm, direct, no apology loops'},
  {key: 'brv', label: 'Brevity', weight: 0.1, blurb: 'Resolves in ≤3 turns where possible'},
];

interface PromptLine {
  text: string;
  /** Changed vs v3.2 production — rendered as a + diff line in brand. */
  added?: boolean;
}

interface VariantFixture {
  id: VariantId;
  name: string;
  shortName: string;
  rev: string;
  hypothesis: string;
  graded: number;
  scores: Record<RubricKey, number>;
  p50Latency: string;
  costPer1k: string;
  promptLines: PromptLine[];
}

const VARIANTS: VariantFixture[] = [
  {
    id: 'ctl',
    name: 'v3.2 · production',
    shortName: 'v3.2',
    rev: 'prm_9f21c4',
    hypothesis: 'Current production system prompt — baseline under test.',
    graded: 1240,
    scores: {acc: 82, grd: 78, pol: 91, tone: 84, brv: 70},
    p50Latency: '2.4 s',
    costPer1k: '$0.81',
    promptLines: [
      {text: 'You are Halcyon, the refund specialist for'},
      {text: 'Nortech Home. Verify identity, look up the'},
      {text: 'order, then apply policy RP-22 exactly.'},
      {text: 'Never promise timelines beyond policy.'},
    ],
  },
  {
    id: 'va',
    name: 'A · terse-policy',
    shortName: 'A',
    rev: 'prm_b04e77',
    hypothesis: 'Cutting the policy digest to 6 bullet rules trades grounding for speed.',
    graded: 402,
    scores: {acc: 84, grd: 80, pol: 88, tone: 80, brv: 88},
    p50Latency: '1.9 s',
    costPer1k: '$0.62',
    promptLines: [
      {text: 'You are Halcyon, the refund specialist for'},
      {text: 'Nortech Home. Verify identity, look up the'},
      {text: 'Policy digest (6 rules, keep terse):', added: true},
      {text: 'RP-22 §2 window · §4 exceptions · §7 escalate.', added: true},
    ],
  },
  {
    id: 'vb',
    name: 'B · chain-of-check',
    shortName: 'B',
    rev: 'prm_3d98a0',
    hypothesis: 'A mandatory self-check pass before answering cuts invented order ids.',
    graded: 512,
    scores: {acc: 88, grd: 86, pol: 93, tone: 82, brv: 74},
    p50Latency: '3.1 s',
    costPer1k: '$1.04',
    promptLines: [
      {text: 'You are Halcyon, the refund specialist for'},
      {text: 'Nortech Home. Verify identity, look up the'},
      {text: 'Before replying, verify: every order id and', added: true},
      {text: 'amount appears verbatim in a retrieved record.', added: true},
    ],
  },
  {
    id: 'vc',
    name: 'C · few-shot refunds w/ escalation exemplars',
    shortName: 'C',
    rev: 'prm_57cc19',
    hypothesis: 'Three worked refund exemplars steady tone but bloat the context.',
    graded: 486,
    scores: {acc: 86, grd: 84, pol: 90, tone: 84, brv: 78},
    p50Latency: '2.7 s',
    costPer1k: '$0.93',
    promptLines: [
      {text: 'You are Halcyon, the refund specialist for'},
      {text: 'Nortech Home. Verify identity, look up the'},
      {text: 'Worked examples (3): partial refund, exchange', added: true},
      {text: 'credit, and an escalation hand-off transcript.', added: true},
    ],
  },
];

interface ClusterFixture {
  id: string;
  label: string;
  severity: Severity;
  counts: Record<VariantId, number>;
  /** One graded transcript excerpt; \`fail\` is the judged failing span. */
  excerpt: {before: string[]; fail: string; after: string[]};
  judgeNote: string;
}

// Per-variant hit counts are raw; every displayed rate is count/graded·1000
// derived live (ledger in the header comment). The 57-char cluster label on
// fc-doc is the deliberate truncation stress row for chips.
const CLUSTERS: ClusterFixture[] = [
  {
    id: 'fc-order',
    label: 'Invents an order number',
    severity: 'critical',
    counts: {ctl: 9, va: 11, vb: 2, vc: 6},
    excerpt: {
      before: [
        'user: I returned the standing desk two weeks ago.',
        '      Where is my refund?',
      ],
      fail: 'agent: Order #88412-R was refunded on July 9 —',
      after: [
        '       you should see it in 2–3 days.',
        'ledger: no order #88412-R exists for this account.',
      ],
    },
    judgeNote:
      'The retrieved record set contains orders #71203 and #71944 only; the cited id and date are fabricated.',
  },
  {
    id: 'fc-idcheck',
    label: 'Skips identity verification',
    severity: 'critical',
    counts: {ctl: 3, va: 3, vb: 0, vc: 5},
    excerpt: {
      before: ['user: Cancel my order and refund the card on file.'],
      fail: 'agent: Done — I have issued the refund to your Visa.',
      after: [
        'policy: RP-22 §1 requires a verified email or last-4',
        '        match before any account mutation.',
      ],
    },
    judgeNote:
      'Refund issued with zero verification turns; RP-22 §1 is an unconditional gate.',
  },
  {
    id: 'fc-window',
    label: 'Over-promises refund window',
    severity: 'major',
    counts: {ctl: 14, va: 6, vb: 5, vc: 4},
    excerpt: {
      before: ['user: How long until the money is back?'],
      fail: 'agent: At most 24 hours, guaranteed.',
      after: ['policy: RP-22 §5 commits to 5–10 business days.'],
    },
    judgeNote: 'Committed to a timeline policy does not authorize.',
  },
  {
    id: 'fc-doc',
    label: 'Cites retired policy doc RP-19 §4.2 (superseded 2025-11)',
    severity: 'major',
    counts: {ctl: 11, va: 8, vb: 4, vc: 9},
    excerpt: {
      before: ['user: Why was my restocking fee 15%?'],
      fail: 'agent: Per policy RP-19 §4.2 the fee is 15%.',
      after: ['policy: RP-22 §6 replaced it — the fee is 10%.'],
    },
    judgeNote: 'RP-19 was retired from retrieval in Nov 2025; citing it is a stale-grounding failure.',
  },
  {
    id: 'fc-tone',
    label: 'Apology loop / robotic tone',
    severity: 'minor',
    counts: {ctl: 7, va: 12, vb: 6, vc: 3},
    excerpt: {
      before: ['user: This is the third time I am asking.'],
      fail: 'agent: I sincerely apologize. I apologize for the inconvenience. Apologies again for…',
      after: ['rubric: tone — one apology, then act.'],
    },
    judgeNote: 'Three stacked apologies with no state change between them.',
  },
];

// Ramp policy: promoted champion holds 64% of traffic; each surviving
// challenger holds 12% (64 + 3·12 = 100 — checked in the header ledger).
const CHAMPION_SHARE = 64;
const CHALLENGER_SHARE = 12;

// Promotion gates (all three must pass, derived live per challenger):
const GATE_MIN_GRADED = 400;

// Frozen session clock for the promotion log: 14:37 start, +2 min per
// session event. Pure arithmetic — never a clock read.
const SESSION_CLOCK_START_MIN = 14 * 60 + 37;
const SESSION_CLOCK_STEP_MIN = 2;

// ---------------------------------------------------------------------------
// DERIVATION HELPERS — every aggregate is computed from the fixtures so no
// displayed number can drift from the row set.
// ---------------------------------------------------------------------------

type ClusterTag = 'regression' | 'improved' | 'on-par';

function variantOf(id: VariantId): VariantFixture {
  return VARIANTS.find(variant => variant.id === id) ?? VARIANTS[0];
}

/** Weighted overall score: Σ weight·score (weights sum to 1.00). */
function overallOf(variant: VariantFixture): number {
  return RUBRIC.reduce(
    (sum, dim) => sum + dim.weight * variant.scores[dim.key],
    0,
  );
}

/** Failure rate per 1,000 graded samples (1 decimal at display time). */
function ratePerK(cluster: ClusterFixture, variantId: VariantId): number {
  return (cluster.counts[variantId] / variantOf(variantId).graded) * 1000;
}

function fmtRate(rate: number): string {
  return rate.toFixed(1);
}

function fmtInt(value: number): string {
  return value.toLocaleString('en-US');
}

function fmtSigned(value: number): string {
  const rounded = value.toFixed(1);
  return value > 0 ? \`+\${rounded}\` : rounded;
}

/** Session log clock: frozen 14:37 start advanced +2 min per event. */
function sessionClockLabel(eventIndex: number): string {
  const total = SESSION_CLOCK_START_MIN + eventIndex * SESSION_CLOCK_STEP_MIN;
  const hours = Math.floor(total / 60) % 24;
  const minutes = total % 60;
  return \`\${String(hours).padStart(2, '0')}:\${String(minutes).padStart(2, '0')}\`;
}

/**
 * Cluster tag vs the current champion, compared on per-1k RATES (never raw
 * counts — the champion has 2–3× the graded volume): regression above
 * 1.2× the champion's rate, improved below 0.8×, on-par between. A nonzero
 * rate against a zero champion rate is always a regression.
 */
function clusterTagOf(
  cluster: ClusterFixture,
  variantId: VariantId,
  championId: VariantId,
): ClusterTag {
  if (variantId === championId) {
    return 'on-par';
  }
  const rate = ratePerK(cluster, variantId);
  const champRate = ratePerK(cluster, championId);
  if (champRate === 0) {
    return rate === 0 ? 'on-par' : 'regression';
  }
  if (rate > champRate * 1.2) {
    return 'regression';
  }
  if (rate < champRate * 0.8) {
    return 'improved';
  }
  return 'on-par';
}

interface GateResult {
  id: 'graded' | 'overall' | 'critical';
  label: string;
  pass: boolean;
  detail: string;
}

/** The three promotion gates, derived live against the current champion. */
function gatesOf(variantId: VariantId, championId: VariantId): GateResult[] {
  const variant = variantOf(variantId);
  const champion = variantOf(championId);
  const overall = overallOf(variant);
  const champOverall = overallOf(champion);
  const criticalRegressions = CLUSTERS.filter(
    cluster =>
      cluster.severity === 'critical' &&
      ratePerK(cluster, variantId) > ratePerK(cluster, championId),
  );
  return [
    {
      id: 'graded',
      label: \`≥ \${GATE_MIN_GRADED} graded samples\`,
      pass: variant.graded >= GATE_MIN_GRADED,
      detail: \`\${fmtInt(variant.graded)} graded\`,
    },
    {
      id: 'overall',
      label: 'Overall beats champion',
      pass: overall > champOverall,
      detail: \`\${overall.toFixed(1)} vs \${champOverall.toFixed(1)}\`,
    },
    {
      id: 'critical',
      label: 'No critical regression',
      pass: criticalRegressions.length === 0,
      detail:
        criticalRegressions.length === 0
          ? 'all critical rates ≤ champion'
          : criticalRegressions
              .map(
                cluster =>
                  \`\${fmtRate(ratePerK(cluster, variantId))} vs \${fmtRate(
                    ratePerK(cluster, championId),
                  )}/1k\`,
              )
              .join(' · '),
    },
  ];
}

/** Ramp policy: champion 64%, every other variant 12% (64 + 3·12 = 100). */
function allocationOf(championId: VariantId): Record<VariantId, number> {
  const allocation = {} as Record<VariantId, number>;
  for (const variant of VARIANTS) {
    allocation[variant.id] =
      variant.id === championId ? CHAMPION_SHARE : CHALLENGER_SHARE;
  }
  return allocation;
}

/** Challenger allocation-segment fills, assigned by column order. */
function segmentFill(variantId: VariantId, championId: VariantId): string {
  if (variantId === championId) {
    return BRAND;
  }
  const challengerIndex = VARIANTS.filter(v => v.id !== championId).findIndex(
    v => v.id === variantId,
  );
  return [SEG_A, SEG_B, SEG_C][challengerIndex] ?? SEG_C;
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'critical',
  major: 'major',
  minor: 'minor',
};

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: CRIT,
  major: MAJOR,
  minor: 'var(--color-text-secondary)',
};

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-prompt-experiment-lab.
// Density grid (verbatim): header 56 · allocation strip 72 (20px bar + 24px
// legend) · column min 232 · 12px grid gaps · 16px page gutters · column
// header 64 · rubric rows 34 (6px track) · cluster chips 26 (40 on touch) ·
// gate rows 24 · stat cells 44 · bench bar min 128 · log region 300 ·
// action buttons 40 · focus ring 2px.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .pel-focusable:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 2px;
}
.\${SCOPE} .pel-num {
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pel-mono {
  font-family: \${MONO_FONT};
}
.\${SCOPE} .pel-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.\${SCOPE} .pel-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${BRAND};
}
.\${SCOPE} .pel-header-chips {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .pel-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
/* --- allocation strip: 20px segmented bar + 24px legend row -------------- */
.\${SCOPE} .pel-alloc {
  flex-shrink: 0;
  min-height: 72px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.\${SCOPE} .pel-alloc-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .pel-alloc-bar {
  display: flex;
  height: 20px;
  border-radius: 4px;
  overflow: hidden;
  border: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .pel-alloc-seg {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  font-size: 11px;
  font-weight: 600;
}
.\${SCOPE} .pel-alloc-seg + .pel-alloc-seg {
  border-inline-start: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .pel-alloc-seg--champion {
  background: \${BRAND};
  color: \${BRAND_ON};
}
.\${SCOPE} .pel-alloc-legend {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 24px;
  flex-wrap: wrap;
}
.\${SCOPE} .pel-alloc-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary);
  min-width: 0;
}
.\${SCOPE} .pel-alloc-swatch {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  border: var(--border-width) solid var(--color-border);
  flex-shrink: 0;
}
/* --- variant comparison grid --------------------------------------------- */
/* Hand-rolled grid (not the DS grid) so the column count can change under
   media queries without inline styles defeating them. */
.\${SCOPE} .pel-grid {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(4, minmax(232px, 1fr));
  gap: var(--spacing-3);
  padding: var(--spacing-4);
  align-content: start;
  box-sizing: border-box;
}
.\${SCOPE} .pel-col {
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.\${SCOPE} .pel-col--champion {
  border-color: \${BRAND};
  box-shadow: inset 0 2px 0 0 \${BRAND};
}
.\${SCOPE} .pel-col-head {
  min-height: 64px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .pel-col-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.\${SCOPE} .pel-col-name {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}
.\${SCOPE} .pel-role-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.\${SCOPE} .pel-role-chip--champion {
  background: \${BRAND};
  color: \${BRAND_ON};
}
.\${SCOPE} .pel-role-chip--challenger {
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-overall {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
}
.\${SCOPE} .pel-overall-value {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pel-delta-up {
  color: \${GOOD};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}
.\${SCOPE} .pel-delta-down {
  color: \${CRIT};
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  font-weight: 600;
}
.\${SCOPE} .pel-col-section {
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.\${SCOPE} .pel-col-section:last-child {
  border-bottom: none;
}
.\${SCOPE} .pel-section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* --- prompt diff excerpt -------------------------------------------------- */
.\${SCOPE} .pel-prompt {
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: var(--spacing-2);
  font-family: \${MONO_FONT};
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
}
.\${SCOPE} .pel-prompt-line {
  white-space: pre;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-prompt-line--added {
  color: \${BRAND};
  background: \${BRAND_TINT};
  border-radius: 2px;
}
/* --- rubric bars: 34px rows, 6px track ------------------------------------ */
.\${SCOPE} .pel-rubric-row {
  min-height: 34px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 3px;
  justify-content: center;
}
.\${SCOPE} .pel-rubric-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--spacing-2);
  font-size: 11px;
}
.\${SCOPE} .pel-rubric-name {
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .pel-rubric-score {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pel-rubric-track {
  position: relative;
  height: 6px;
  border-radius: 3px;
  background: var(--color-background-secondary, \${BRAND_TINT});
  overflow: visible;
}
.\${SCOPE} .pel-rubric-fill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  border-radius: 3px;
  background: \${BRAND};
  opacity: 0.75;
}
.\${SCOPE} .pel-rubric-fill--champion {
  opacity: 1;
}
/* Champion baseline tick: 2px marker at the champion's score position. */
.\${SCOPE} .pel-rubric-tick {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 2px;
  background: \${BRAND};
}
/* --- failure-cluster chips: 26px (40px on touch layouts) ------------------ */
.\${SCOPE} .pel-cluster-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  min-height: 26px;
  box-sizing: border-box;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: transparent;
  cursor: pointer;
  text-align: start;
  min-width: 0;
}
.\${SCOPE} .pel-cluster-chip[aria-pressed='true'] {
  border-color: \${BRAND};
  background: \${BRAND_TINT};
}
.\${SCOPE} .pel-cluster-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.\${SCOPE} .pel-cluster-label {
  flex: 1;
  min-width: 0;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-primary);
}
.\${SCOPE} .pel-cluster-rate {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .pel-cluster-tag {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
}
.\${SCOPE} .pel-cluster-tag--regression {
  color: \${CRIT};
}
.\${SCOPE} .pel-cluster-tag--improved {
  color: \${GOOD};
}
/* --- stats + gates --------------------------------------------------------- */
.\${SCOPE} .pel-stats {
  display: flex;
  gap: var(--spacing-2);
}
.\${SCOPE} .pel-stat {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  box-sizing: border-box;
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.\${SCOPE} .pel-stat-value {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .pel-stat-label {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-gate-row {
  min-height: 24px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  min-width: 0;
}
.\${SCOPE} .pel-gate-pass {
  color: \${GOOD};
  display: inline-flex;
  flex-shrink: 0;
}
.\${SCOPE} .pel-gate-fail {
  color: \${CRIT};
  display: inline-flex;
  flex-shrink: 0;
}
.\${SCOPE} .pel-gate-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-promote-note {
  font-size: 11px;
  color: var(--color-text-secondary);
}
/* --- bench bar: min 128, inspector fill + 300px log ------------------------ */
.\${SCOPE} .pel-bench {
  flex-shrink: 0;
  min-height: 128px;
  box-sizing: border-box;
  border-top: var(--border-width) solid var(--color-border);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
}
.\${SCOPE} .pel-bench-inspect {
  padding: var(--spacing-2) var(--spacing-4);
  border-inline-end: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
  overflow-y: auto;
  max-height: 220px;
}
.\${SCOPE} .pel-bench-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .pel-bench-rates {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.\${SCOPE} .pel-bench-rate {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-bench-rate--champion {
  border-color: \${BRAND};
  color: \${BRAND};
}
.\${SCOPE} .pel-excerpt {
  border: var(--border-width) solid var(--color-border);
  border-radius: 6px;
  padding: var(--spacing-2);
  font-family: \${MONO_FONT};
  font-size: 11px;
  line-height: 1.6;
  overflow-x: auto;
}
.\${SCOPE} .pel-excerpt-line {
  white-space: pre-wrap;
  color: var(--color-text-secondary);
}
.\${SCOPE} .pel-excerpt-fail {
  white-space: pre-wrap;
  color: \${CRIT};
  background: \${CRIT_TINT};
  border-radius: 2px;
}
.\${SCOPE} .pel-bench-log {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-height: 220px;
}
.\${SCOPE} .pel-log-head {
  padding: var(--spacing-2) var(--spacing-3) 0;
}
.\${SCOPE} .pel-log-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-1) var(--spacing-3) var(--spacing-2);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.\${SCOPE} .pel-log-row {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: 12px;
}
.\${SCOPE} .pel-log-clock {
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}
.\${SCOPE} .pel-log-body {
  min-width: 0;
  flex: 1;
}
/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .\${SCOPE} .pel-grid {
    grid-template-columns: repeat(2, minmax(232px, 1fr));
  }
  .\${SCOPE} .pel-bench {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
}
@media (max-width: 600px) {
  .\${SCOPE} .pel-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .pel-bench {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .pel-bench-inspect {
    border-inline-end: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .pel-cluster-chip {
    min-height: 40px;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .pel-cluster-chip,
  .\${SCOPE} .pel-bench-rate {
    transition: background-color 120ms ease, border-color 120ms ease;
  }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — the Variant fork: one input path splitting into two arms with
// a filled champion node. Inline SVG, brand-colored via currentColor.
// ---------------------------------------------------------------------------

function VariantMark() {
  return (
    <span className="pel-mark" aria-hidden>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M3 10h4c1.6 0 2.4-1 3.4-2.4C11.5 6 12.6 5 14.5 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M10 10c.9 1.1 1.6 2.2 2.4 3.1.7.8 1.4 1.4 2.6 1.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="3" cy="10" r="1.7" fill="currentColor" />
        <circle cx="16" cy="5" r="2.3" fill="currentColor" />
        <circle
          cx="16"
          cy="15"
          r="1.9"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — purely props-in, callbacks-out; the page component
// owns every piece of state.
// ---------------------------------------------------------------------------

interface RubricRowProps {
  dim: RubricDimension;
  score: number;
  championScore: number;
  isChampion: boolean;
}

/**
 * One 34px rubric row: label + tabular score (with a signed delta on
 * challengers), then a 6px track whose fill is the variant's score and whose
 * 2px baseline tick marks the CURRENT champion's score — promoting a variant
 * moves every tick and re-signs every delta in the same render.
 */
function RubricRow({dim, score, championScore, isChampion}: RubricRowProps) {
  const delta = score - championScore;
  return (
    <div className="pel-rubric-row">
      <div className="pel-rubric-meta">
        <span className="pel-rubric-name" title={\`\${dim.label} — \${dim.blurb}\`}>
          {dim.label}{' '}
          <span className="pel-num">·{(dim.weight * 100).toFixed(0)}%</span>
        </span>
        <span className="pel-rubric-score">
          <strong className="pel-num">{score}</strong>
          {!isChampion && delta !== 0 && (
            <span className={delta > 0 ? 'pel-delta-up' : 'pel-delta-down'}>
              {fmtSigned(delta)}
            </span>
          )}
        </span>
      </div>
      <div
        className="pel-rubric-track"
        role="img"
        aria-label={\`\${dim.label}: \${score} of 100\${
          isChampion
            ? ' (champion baseline)'
            : \`, champion at \${championScore}\`
        }\`}>
        <span
          className={
            isChampion
              ? 'pel-rubric-fill pel-rubric-fill--champion'
              : 'pel-rubric-fill'
          }
          style={{width: \`\${score}%\`}}
        />
        {!isChampion && (
          <span
            className="pel-rubric-tick"
            style={{insetInlineStart: \`calc(\${championScore}% - 1px)\`}}
          />
        )}
      </div>
    </div>
  );
}

interface ClusterChipProps {
  cluster: ClusterFixture;
  variantId: VariantId;
  championId: VariantId;
  isSelected: boolean;
  onSelect: (clusterId: string) => void;
}

/**
 * One failure-cluster chip: severity dot · truncating label · per-1k rate ·
 * regression/improved arrow vs the current champion. A real toggle button —
 * pressing it points the bench inspector at this cluster.
 */
function ClusterChip({
  cluster,
  variantId,
  championId,
  isSelected,
  onSelect,
}: ClusterChipProps) {
  const rate = ratePerK(cluster, variantId);
  const tag = clusterTagOf(cluster, variantId, championId);
  return (
    <button
      type="button"
      className="pel-cluster-chip pel-focusable"
      aria-pressed={isSelected}
      aria-label={\`\${cluster.label} — \${SEVERITY_LABEL[cluster.severity]}, \${
        cluster.counts[variantId]
      } hits, \${fmtRate(rate)} per 1k\${
        tag === 'on-par' ? '' : \`, \${tag} vs champion\`
      }\`}
      onClick={() => onSelect(cluster.id)}>
      <span
        className="pel-cluster-dot"
        style={{background: SEVERITY_COLOR[cluster.severity]}}
        aria-hidden
      />
      <span className="pel-cluster-label">{cluster.label}</span>
      <span className="pel-cluster-rate">{fmtRate(rate)}/1k</span>
      {tag !== 'on-par' && (
        <span className={\`pel-cluster-tag pel-cluster-tag--\${tag}\`} aria-hidden>
          <Icon
            icon={tag === 'regression' ? ArrowUpRightIcon : ArrowDownRightIcon}
            size="xsm"
            color="inherit"
          />
        </span>
      )}
    </button>
  );
}

interface VariantColumnProps {
  variant: VariantFixture;
  championId: VariantId;
  allocationPct: number;
  selectedClusterId: string;
  onSelectCluster: (clusterId: string) => void;
  onPromote: (variantId: VariantId) => void;
}

/** One comparison column — every number inside re-derives from championId. */
function VariantColumn({
  variant,
  championId,
  allocationPct,
  selectedClusterId,
  onSelectCluster,
  onPromote,
}: VariantColumnProps) {
  const isChampion = variant.id === championId;
  const champion = variantOf(championId);
  const overall = overallOf(variant);
  const overallDelta = overall - overallOf(champion);
  const gates = isChampion ? [] : gatesOf(variant.id, championId);
  const promotable = gates.length > 0 && gates.every(gate => gate.pass);

  return (
    <section
      className={isChampion ? 'pel-col pel-col--champion' : 'pel-col'}
      aria-label={\`Variant \${variant.name}\${isChampion ? ' (champion)' : ''}\`}>
      <header className="pel-col-head">
        <div className="pel-col-title">
          <span className="pel-col-name" title={variant.name}>
            {variant.name}
          </span>
          <span
            className={
              isChampion
                ? 'pel-role-chip pel-role-chip--champion'
                : 'pel-role-chip pel-role-chip--challenger'
            }>
            {isChampion && <Icon icon={CrownIcon} size="xsm" color="inherit" />}
            {isChampion ? 'CHAMPION' : 'CHALLENGER'}
          </span>
        </div>
        <div className="pel-overall">
          <span className="pel-overall-value">{overall.toFixed(1)}</span>
          {!isChampion && overallDelta !== 0 && (
            <span
              className={overallDelta > 0 ? 'pel-delta-up' : 'pel-delta-down'}>
              {fmtSigned(overallDelta)} vs champion
            </span>
          )}
          <Text type="supporting" size="sm" color="secondary">
            <span className="pel-num">
              {allocationPct}% traffic · {fmtInt(variant.graded)} graded
            </span>
          </Text>
        </div>
      </header>

      <div className="pel-col-section">
        <span className="pel-section-label">Prompt diff vs v3.2</span>
        <div className="pel-prompt" tabIndex={0} role="region"
          aria-label={\`Prompt excerpt for \${variant.name}\`}>
          {variant.promptLines.map((line, index) => (
            <div
              // Fixture lines are static — index keys are stable here.
              key={index}
              className={
                line.added === true
                  ? 'pel-prompt-line pel-prompt-line--added'
                  : 'pel-prompt-line'
              }>
              {line.added === true ? '+ ' : '  '}
              {line.text}
            </div>
          ))}
        </div>
        <Text type="supporting" size="sm" color="secondary" maxLines={2}>
          {variant.hypothesis}
        </Text>
      </div>

      <div className="pel-col-section">
        <span className="pel-section-label">Judge rubric · weighted</span>
        {RUBRIC.map(dim => (
          <RubricRow
            key={dim.key}
            dim={dim}
            score={variant.scores[dim.key]}
            championScore={champion.scores[dim.key]}
            isChampion={isChampion}
          />
        ))}
      </div>

      <div className="pel-col-section">
        <span className="pel-section-label">Failure clusters</span>
        {CLUSTERS.map(cluster => (
          <ClusterChip
            key={cluster.id}
            cluster={cluster}
            variantId={variant.id}
            championId={championId}
            isSelected={selectedClusterId === cluster.id}
            onSelect={onSelectCluster}
          />
        ))}
      </div>

      <div className="pel-col-section">
        <div className="pel-stats">
          <div className="pel-stat">
            <span className="pel-stat-value">{variant.p50Latency}</span>
            <span className="pel-stat-label">p50 latency</span>
          </div>
          <div className="pel-stat">
            <span className="pel-stat-value">{variant.costPer1k}</span>
            <span className="pel-stat-label">cost / 1k runs</span>
          </div>
        </div>
      </div>

      <div className="pel-col-section">
        {isChampion ? (
          <div className="pel-gate-row">
            <span className="pel-gate-pass" aria-hidden>
              <Icon icon={CrownIcon} size="xsm" color="inherit" />
            </span>
            <span className="pel-gate-text">
              Serving {allocationPct}% — baseline for every delta and tick.
            </span>
          </div>
        ) : (
          <>
            <span className="pel-section-label">Promotion gates</span>
            {gates.map(gate => (
              <div className="pel-gate-row" key={gate.id}>
                <span
                  className={gate.pass ? 'pel-gate-pass' : 'pel-gate-fail'}
                  aria-hidden>
                  <Icon
                    icon={gate.pass ? CheckCircle2Icon : XCircleIcon}
                    size="xsm"
                    color="inherit"
                  />
                </span>
                <span
                  className="pel-gate-text"
                  title={\`\${gate.label} — \${gate.detail}\`}>
                  {gate.label} · <span className="pel-num">{gate.detail}</span>
                </span>
              </div>
            ))}
            <Button
              label={promotable ? 'Promote to champion' : 'Gates not met'}
              variant={promotable ? 'primary' : 'secondary'}
              size="md"
              isDisabled={!promotable}
              icon={<Icon icon={CrownIcon} size="sm" />}
              onClick={() => onPromote(variant.id)}
            />
            {!promotable && (
              <span className="pel-promote-note">
                {gates.filter(gate => !gate.pass).length} of {gates.length}{' '}
                gates failing — see ✗ rows above.
              </span>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner. championId + the session log drive every derived
// surface: allocation split, deltas, ticks, cluster tags, gates, header chip.
// ---------------------------------------------------------------------------

interface SessionEvent {
  id: string;
  clockLabel: string;
  variantId: VariantId;
  previousChampionId: VariantId;
  summary: string;
}

export default function PromptExperimentLabTemplate() {
  const [championId, setChampionId] = useState<VariantId>('ctl');
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([]);
  // Monotonic — undo does not rewind the clock, so labels stay unique.
  const [eventCount, setEventCount] = useState(0);
  const [selectedClusterId, setSelectedClusterId] = useState('fc-order');
  const [announcement, setAnnouncement] = useState('');

  const champion = variantOf(championId);
  const allocation = allocationOf(championId);
  const selectedCluster =
    CLUSTERS.find(cluster => cluster.id === selectedClusterId) ?? CLUSTERS[0];

  // Derived once per championId: which challengers can currently be promoted
  // (drives the header's promotable count chip).
  const promotableCount = useMemo(
    () =>
      VARIANTS.filter(
        variant =>
          variant.id !== championId &&
          gatesOf(variant.id, championId).every(gate => gate.pass),
      ).length,
    [championId],
  );

  const totalGraded = VARIANTS.reduce((sum, variant) => sum + variant.graded, 0);

  const promote = (variantId: VariantId) => {
    const gates = gatesOf(variantId, championId);
    if (!gates.every(gate => gate.pass)) {
      return; // Button is disabled; this is the keyboard-race guard.
    }
    const promoted = variantOf(variantId);
    const previous = variantOf(championId);
    const clockLabel = sessionClockLabel(eventCount);
    setChampionId(variantId);
    setEventCount(count => count + 1);
    setSessionEvents(events => [
      {
        id: \`evt-\${clockLabel}-\${variantId}\`,
        clockLabel,
        variantId,
        previousChampionId: previous.id,
        summary: \`Promoted \${promoted.shortName} (\${overallOf(promoted).toFixed(
          1,
        )}) over \${previous.shortName} (\${overallOf(previous).toFixed(
          1,
        )}) — ramp reflowed to \${CHAMPION_SHARE}/\${CHALLENGER_SHARE}/\${CHALLENGER_SHARE}/\${CHALLENGER_SHARE}\`,
      },
      ...events,
    ]);
    setAnnouncement(
      \`\${promoted.name} promoted to champion. Traffic reflowed to \${CHAMPION_SHARE} percent; rubric deltas, baseline ticks, cluster tags, and promotion gates re-derived against the new baseline.\`,
    );
  };

  const undoLatest = () => {
    const latest = sessionEvents[0];
    if (latest === undefined) {
      return;
    }
    const restored = variantOf(latest.previousChampionId);
    setChampionId(latest.previousChampionId);
    setSessionEvents(events => events.slice(1));
    setAnnouncement(
      \`Promotion undone — \${restored.name} restored as champion and every derived surface reverted.\`,
    );
  };

  const selectCluster = (clusterId: string) => {
    setSelectedClusterId(clusterId);
    const cluster = CLUSTERS.find(entry => entry.id === clusterId);
    if (cluster !== undefined) {
      setAnnouncement(\`Inspecting failure cluster: \${cluster.label}\`);
    }
  };

  // ---- allocation strip ----

  const allocationStrip = (
    <div className="pel-alloc">
      <div className="pel-alloc-caption">
        <Text type="label" size="sm" color="secondary">
          Cohort allocation — ramp policy {CHAMPION_SHARE}% champion ·{' '}
          {CHALLENGER_SHARE}% per challenger
        </Text>
        <Text type="supporting" size="sm" color="secondary">
          <span className="pel-num">{fmtInt(totalGraded)}</span> graded of the
          Jul 8–15 traffic slice
        </Text>
      </div>
      <div
        className="pel-alloc-bar"
        role="img"
        aria-label={\`Traffic allocation: \${VARIANTS.map(
          variant => \`\${variant.shortName} \${allocation[variant.id]} percent\`,
        ).join(', ')}\`}>
        {VARIANTS.map(variant => {
          const isChampionSeg = variant.id === championId;
          return (
            <span
              key={variant.id}
              className={
                isChampionSeg
                  ? 'pel-alloc-seg pel-alloc-seg--champion'
                  : 'pel-alloc-seg'
              }
              style={{
                width: \`\${allocation[variant.id]}%\`,
                background: isChampionSeg
                  ? undefined
                  : segmentFill(variant.id, championId),
              }}>
              {isChampionSeg && (
                <span className="pel-num">{allocation[variant.id]}%</span>
              )}
            </span>
          );
        })}
      </div>
      <div className="pel-alloc-legend">
        {VARIANTS.map(variant => (
          <span className="pel-alloc-legend-item" key={variant.id}>
            <span
              className="pel-alloc-swatch"
              style={{background: segmentFill(variant.id, championId)}}
              aria-hidden
            />
            <span className="pel-num">
              {variant.shortName} · {allocation[variant.id]}%
            </span>
            {variant.id === championId && (
              <Icon icon={CrownIcon} size="xsm" color="inherit" />
            )}
          </span>
        ))}
      </div>
    </div>
  );

  // ---- bench bar: cluster inspector + promotion log ----

  const benchBar = (
    <div className="pel-bench">
      <div className="pel-bench-inspect">
        <div className="pel-bench-head">
          <span
            className="pel-cluster-dot"
            style={{background: SEVERITY_COLOR[selectedCluster.severity]}}
            aria-hidden
          />
          <Heading level={5} accessibilityLevel={2} maxLines={1}>
            {selectedCluster.label}
          </Heading>
          <Badge
            label={SEVERITY_LABEL[selectedCluster.severity]}
            variant={
              selectedCluster.severity === 'critical'
                ? 'error'
                : selectedCluster.severity === 'major'
                  ? 'warning'
                  : 'neutral'
            }
          />
        </div>
        <div className="pel-bench-rates">
          {VARIANTS.map(variant => (
            <span
              key={variant.id}
              className={
                variant.id === championId
                  ? 'pel-bench-rate pel-bench-rate--champion'
                  : 'pel-bench-rate'
              }>
              <strong>{variant.shortName}</strong>
              {fmtRate(ratePerK(selectedCluster, variant.id))}/1k
              <span>({selectedCluster.counts[variant.id]})</span>
            </span>
          ))}
        </div>
        <div
          className="pel-excerpt"
          tabIndex={0}
          role="region"
          aria-label={\`Graded transcript excerpt for \${selectedCluster.label}\`}>
          {selectedCluster.excerpt.before.map((line, index) => (
            <div className="pel-excerpt-line" key={\`b-\${index}\`}>
              {line}
            </div>
          ))}
          <div className="pel-excerpt-fail">{selectedCluster.excerpt.fail}</div>
          {selectedCluster.excerpt.after.map((line, index) => (
            <div className="pel-excerpt-line" key={\`a-\${index}\`}>
              {line}
            </div>
          ))}
        </div>
        <Text type="supporting" size="sm" color="secondary" maxLines={2}>
          <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" /> Judge
          note: {selectedCluster.judgeNote}
        </Text>
      </div>
      <div className="pel-bench-log">
        <div className="pel-log-head">
          <Text type="label" size="sm" color="secondary">
            Promotion log
          </Text>
        </div>
        <div className="pel-log-scroll">
          {sessionEvents.map((event, index) => (
            <div className="pel-log-row" key={event.id}>
              <span className="pel-log-clock">{event.clockLabel}</span>
              <div className="pel-log-body">
                <Text type="body" size="sm">
                  {event.summary}
                </Text>
                {index === 0 && (
                  <Button
                    label="Undo"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={Undo2Icon} size="sm" />}
                    onClick={undoLatest}
                  />
                )}
              </div>
            </div>
          ))}
          <div className="pel-log-row">
            <span className="pel-log-clock">Jul 8</span>
            <div className="pel-log-body">
              <Text type="body" size="sm" color="secondary">
                EXP-114 started — v3.2 set as champion, ramp{' '}
                <span className="pel-num">64/12/12/12</span>, judge atlas-8
                rubric v4.
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ---- frame ----

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="pel-header-row">
              <HStack gap={3} vAlign="center" wrap="wrap">
                <StackItem size="fill" style={{minWidth: 0}}>
                  <HStack gap={2} vAlign="center">
                    <VariantMark />
                    <Heading level={1} maxLines={1}>
                      Variant — Prompt Experiment Lab
                    </Heading>
                    <Badge
                      label="EXP-114 · Refund agent system prompt"
                      variant="neutral"
                    />
                  </HStack>
                </StackItem>
                <div className="pel-header-chips">
                  <Badge
                    label={\`Champion: \${champion.shortName} · \${overallOf(
                      champion,
                    ).toFixed(1)}\`}
                    variant="success"
                  />
                  <Badge
                    label={\`\${promotableCount} promotable\`}
                    variant={promotableCount > 0 ? 'info' : 'neutral'}
                  />
                  <HStack gap={1} vAlign="center">
                    <Icon icon={GaugeIcon} size="sm" color="secondary" />
                    <Text type="supporting" size="sm" color="secondary">
                      <span className="pel-num">{fmtInt(totalGraded)}</span>{' '}
                      graded
                    </Text>
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <Icon icon={ScaleIcon} size="sm" color="secondary" />
                    <Text type="supporting" size="sm" color="secondary">
                      Judge: atlas-8 · rubric v4
                    </Text>
                  </HStack>
                  <HStack gap={1} vAlign="center">
                    <Icon icon={FlaskConicalIcon} size="sm" color="secondary" />
                    <Text type="supporting" size="sm" color="secondary">
                      Wed Jul 15 2026
                    </Text>
                  </HStack>
                </div>
              </HStack>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div className="pel-content">
              <div
                aria-live="polite"
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  margin: -1,
                  padding: 0,
                  overflow: 'hidden',
                  clipPath: 'inset(50%)',
                  whiteSpace: 'nowrap',
                }}>
                {announcement}
              </div>
              {allocationStrip}
              <div className="pel-grid">
                {VARIANTS.map(variant => (
                  <VariantColumn
                    key={variant.id}
                    variant={variant}
                    championId={championId}
                    allocationPct={allocation[variant.id]}
                    selectedClusterId={selectedClusterId}
                    onSelectCluster={selectCluster}
                    onPromote={promote}
                  />
                ))}
              </div>
              {benchBar}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



`;export{e as default};