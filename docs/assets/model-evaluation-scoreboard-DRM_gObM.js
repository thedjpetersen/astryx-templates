var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file model-evaluation-scoreboard.tsx
 * @input Deterministic fixtures only — the Benchline release-review picture
 *   for candidate aster-2.1-rc3 vs production baseline aster-2.0, eval run
 *   #418 of Tue Jul 7 2026 (a fixed label; nothing reads a clock). Five
 *   leaderboard runs, nine evaluation slices, five release gates.
 *   Leaderboard composites derive live as (reasoning + code + retrieval +
 *   safety) / 4 and were hand-checked: rc3 (84.2+78.9+88.4+99.2)/4 = 87.7 ·
 *   aster-2.0 345.6/4 = 86.4 · rc2 346.0/4 = 86.5 · comet-1.3 341.4/4 =
 *   85.35 (renders 85.3) · aster-mini-1.8 318.4/4 = 79.6. Item counts sum to
 *   1240+640+512+488+900+410+260+350+180 = 4,980 items (the header chip).
 *   Judge gaps derive as judgeLlm − judgeHuman per slice. At the DEFAULT
 *   gate thresholds the hand-checked verdict is HOLD with 3 of 5 gates
 *   blocking and 5 slice violations:
 *     Δ accuracy ≥ −0.5 pp → 0 failing (min deltas −0.3, −0.2, −0.1)
 *     hallucination ≤ 3.0% → 2 failing (ja-JP 4.1, adversarial 5.2)
 *     refusal correctness ≥ 98.0% → 0 failing (min 98.2)
 *     Δ p95 latency ≤ +60 ms → 1 failing (long-context-32k +142)
 *     judge gap ≤ 6 pts → 2 failing (adversarial 9, low-resource-sw 7)
 *   Loosening hallucination to 5.5%, latency to +150 ms, and gap to 9 pts
 *   flips every red cell and the verdict to CLEAR TO SHIP — the demo's
 *   through-line. adversarial-injection is the authored stress slice (worst
 *   on three metrics at once); low-resource-sw exercises the smallest-n
 *   badge. No clock reads, no randomness, no timers, no network assets.
 * @output Benchline — Model Evaluation Scoreboard: an ML release-review
 *   surface. A 56px brand header (benchmark-line mark, run title, derived
 *   verdict chip + "9 slices · 4,980 items") over a two-region body: the
 *   main column stacks the benchmark leaderboard (five 40px run rows ×
 *   seven numeric columns, candidate row brand-tinted, composite bars
 *   inline), the slice regression matrix (nine 36px slice rows × the four
 *   gated metric columns; each cell re-labels pass/fail against its gate's
 *   CURRENT threshold), and the judge-disagreement dumbbell plot (one 28px
 *   row per slice: hollow human-panel dot, filled LLM-judge dot, gap chip
 *   that flags red past the agreement gate). Beside it, a 336px release
 *   gate rail: the verdict banner (SHIP / HOLD with per-gate reasons),
 *   five gate rows with enable toggles and ± threshold steppers, reset,
 *   a promote button that arms only on SHIP, and the decision log.
 *   Signature move: stepping any gate threshold (or toggling a gate off)
 *   re-evaluates every slice in the same render — matrix cells flip
 *   pass/fail, dumbbell gap chips re-flag, per-gate failing counts
 *   re-count, and the verdict banner re-derives its reasons list from one
 *   gate store; promoting on green appends to the decision log.
 * @position Page template; emitted by \`astryx template model-evaluation-scoreboard\`
 *
 * Frame: root 100dvh div > Layout height="fill". header (brand + verdict
 *   chips) | content: body flex row → main column (vertical scroll:
 *   leaderboard panel → matrix panel → dumbbell panel) · release gate
 *   rail 336 (own vertical scroll). No modal surfaces — the gate rail IS
 *   the editing surface.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): rail
 *   336 + main ≈ 709; matrix grid 172 + 4×92 = 540 and leaderboard grid
 *   180 + 72 + 6×68 = 660 both fit the ~677px padded column with no
 *   horizontal scroll; the dumbbell track flexes.
 * - <= 900px: the gate rail drops below the main column at full width
 *   (the verdict banner stays its first row); panels keep their widths.
 * - <= 620px (390px embed): leaderboard and matrix keep their true grid
 *   widths and scroll horizontally inside their own panels — subtraction,
 *   not squeeze; gate rows wrap; all controls stay >= 40px tall.
 * Container policy: work-surface archetype — stacked bordered panels
 *   with 32px uppercase panel heads, dense rows, and one rail; no Cards.
 *   Slice rows, gate toggles, and steppers are real <button>s
 *   (aria-pressed on slice selection and gate enablement). All numerals
 *   tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Benchline electric blue): light-dark(#1D4ED8, #60A5FA) — #1D4ED8 on
 *   #FFFFFF ≈ 6.7:1, #60A5FA on ~#1C1C1E ≈ 6.7:1. Text on a solid brand
 *   fill: light-dark(#FFFFFF, #0B1B36) — #FFFFFF on #1D4ED8 ≈ 6.7:1,
 *   #0B1B36 on #60A5FA ≈ 6.4:1. State pairs with math at declaration:
 *   pass green light-dark(#15803D, #4ADE80) (≈5.0:1 / ≈9.6:1), fail red
 *   light-dark(#DC2626, #F87171) (≈4.5:1 / ≈7.2:1). Tints are <=16%
 *   alpha washes under text that keeps its own >=4.5:1 pair.
 * Density grid (repeated verbatim in the CSS): header 56 · gate rail 336 ·
 *   verdict banner min 72 · panel heads 32 · leaderboard rows 40 (model
 *   column 180, composite column 72, metric columns 68) · matrix rows 36
 *   (slice label column 172, metric columns 92) · dumbbell rows 28 · gate
 *   rows min 76 · stepper/toggle buttons 40 · chips 20.
 * Fixture policy: one gate store \`Record<gateId, {threshold, enabled}>\`
 *   is the single state owner; ALL pass/fail (matrix cells, gap flags,
 *   per-gate failing counts, verdict + reasons, promote arming)
 *   re-derives from fixtures + gates every render, so no verdict can
 *   drift from the cells that justify it.
 */

import {useState} from 'react';

import {
  CheckCircle2Icon,
  CheckIcon,
  FlaskConicalIcon,
  GaugeIcon,
  MinusIcon,
  OctagonAlertIcon,
  PlusIcon,
  RocketIcon,
  RotateCcwIcon,
  ScaleIcon,
  ShieldCheckIcon,
  TimerIcon,
  type LucideIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-model-evaluation-scoreboard';

// THE quarantined Benchline electric blue. #1D4ED8 on #FFFFFF ≈ 6.7:1
// (passes 4.5:1 down to the 11px chip text it colors); #60A5FA on a
// ~#1C1C1E dark surface ≈ 6.7:1. Colors the mark, candidate row, LLM-judge
// dots, steppers, and the promote button.
const BRAND = 'light-dark(#1D4ED8, #60A5FA)';
// Text/glyph ON a solid brand fill: #FFFFFF on #1D4ED8 ≈ 6.7:1; #0B1B36 on
// #60A5FA ≈ 6.4:1 (white on #60A5FA would fail at ~2.2:1).
const BRAND_ON = 'light-dark(#FFFFFF, #0B1B36)';
// Candidate-row / composite-bar wash — a surface nudge only (10% / 16%
// alpha); text on it keeps its own >=4.5:1 pair.
const BRAND_TINT = 'light-dark(rgba(29, 78, 216, 0.10), rgba(96, 165, 250, 0.16))';
// Gate-pass green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const PASS = 'light-dark(#15803D, #4ADE80)';
const PASS_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Gate-fail red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on #1C1C1E ≈ 7.2:1.
const FAIL = 'light-dark(#DC2626, #F87171)';
const FAIL_TINT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';

// ---------------------------------------------------------------------------
// RUN CONTEXT — fixed labels; the demo's "now" never comes from a clock.
// ---------------------------------------------------------------------------

const RUN = {
  candidate: 'aster-2.1-rc3',
  baseline: 'aster-2.0',
  evalRun: '#418',
  when: 'Tue, Jul 7, 2026',
  harness: 'benchline-harness 3.2',
};

// ---------------------------------------------------------------------------
// LEADERBOARD FIXTURES — five runs; composite derives live as the mean of
// the four quality suites (hand-checked in the @input comment).
// ---------------------------------------------------------------------------

interface RunFixture {
  id: string;
  model: string;
  tag: 'candidate' | 'baseline' | null;
  note: string;
  reasoning: number;
  code: number;
  retrieval: number;
  safety: number;
  /** p95 end-to-end latency, ms. */
  p95: number;
  /** $ per 1k output tokens. */
  cost: number;
}

// prettier-ignore
const RUNS: RunFixture[] = [
  {id: 'rc3', model: 'aster-2.1-rc3', tag: 'candidate', note: 'this review', reasoning: 84.2, code: 78.9, retrieval: 88.4, safety: 99.2, p95: 812, cost: 0.42},
  {id: 'rc2', model: 'aster-2.1-rc2', tag: null, note: 'held Jun 30', reasoning: 83.1, code: 78.2, retrieval: 86.3, safety: 98.4, p95: 799, cost: 0.42},
  {id: 'prod', model: 'aster-2.0', tag: 'baseline', note: 'production', reasoning: 82.6, code: 76.1, retrieval: 87.9, safety: 99.0, p95: 748, cost: 0.45},
  {id: 'comet', model: 'comet-1.3', tag: null, note: 'external ref', reasoning: 85.0, code: 74.5, retrieval: 84.1, safety: 97.8, p95: 1040, cost: 0.61},
  {id: 'mini', model: 'aster-mini-1.8', tag: null, note: 'edge tier', reasoning: 74.3, code: 66.0, retrieval: 79.2, safety: 98.9, p95: 388, cost: 0.09},
];

/** Composite = mean of the four quality suites — derived, never stored. */
function composite(run: RunFixture): number {
  return (run.reasoning + run.code + run.retrieval + run.safety) / 4;
}

/** Composite bars scale across this fixed domain (leaderboard min/max pad). */
const COMPOSITE_MIN = 78;
const COMPOSITE_MAX = 90;

// ---------------------------------------------------------------------------
// SLICE FIXTURES — nine evaluation slices of candidate-vs-baseline deltas.
// Judge gap derives as judgeLlm − judgeHuman. n sums to 4,980 (@input).
// ---------------------------------------------------------------------------

interface SliceFixture {
  id: string;
  label: string;
  /** Eval items in the slice. */
  n: number;
  /** Accuracy delta vs baseline, percentage points. */
  accDelta: number;
  /** Hallucination rate, %. */
  halluc: number;
  /** Refusal correctness, %. */
  refusal: number;
  /** p95 latency delta vs baseline, ms. */
  latDelta: number;
  /** Mean LLM-judge score, 0–100 rubric. */
  judgeLlm: number;
  /** Mean human-panel score, same rubric. */
  judgeHuman: number;
}

// prettier-ignore
const SLICES: SliceFixture[] = [
  {id: 'en-us', label: 'en-US general', n: 1240, accDelta: 1.8, halluc: 1.6, refusal: 99.4, latDelta: 52, judgeLlm: 88, judgeHuman: 86},
  {id: 'es-419', label: 'es-419 general', n: 640, accDelta: -0.2, halluc: 2.1, refusal: 99.0, latDelta: 48, judgeLlm: 84, judgeHuman: 81},
  {id: 'de-de', label: 'de-DE general', n: 512, accDelta: 0.9, halluc: 1.9, refusal: 99.1, latDelta: 55, judgeLlm: 85, judgeHuman: 83},
  {id: 'ja-jp', label: 'ja-JP general', n: 488, accDelta: 0.6, halluc: 4.1, refusal: 98.8, latDelta: 58, judgeLlm: 82, judgeHuman: 77},
  {id: 'code-py', label: 'code-python', n: 900, accDelta: 2.4, halluc: 1.2, refusal: 99.6, latDelta: 31, judgeLlm: 90, judgeHuman: 88},
  {id: 'code-sql', label: 'code-sql', n: 410, accDelta: 1.1, halluc: 1.8, refusal: 99.3, latDelta: 40, judgeLlm: 86, judgeHuman: 84},
  {id: 'long-ctx', label: 'long-context-32k', n: 260, accDelta: 0.3, halluc: 2.8, refusal: 98.6, latDelta: 142, judgeLlm: 80, judgeHuman: 75},
  // Stress slice: worst hallucination, worst judge gap, borderline refusal.
  {id: 'adversarial', label: 'adversarial-injection', n: 350, accDelta: -0.1, halluc: 5.2, refusal: 98.2, latDelta: 36, judgeLlm: 71, judgeHuman: 62},
  {id: 'low-res', label: 'low-resource-sw', n: 180, accDelta: -0.3, halluc: 2.9, refusal: 98.4, latDelta: 44, judgeLlm: 77, judgeHuman: 70},
];

const TOTAL_ITEMS = SLICES.reduce((sum, slice) => sum + slice.n, 0); // 4,980

/** Judge disagreement: LLM judge minus human panel, rubric points. */
function judgeGap(slice: SliceFixture): number {
  return slice.judgeLlm - slice.judgeHuman;
}

// ---------------------------------------------------------------------------
// RELEASE GATES — definitions are fixtures; thresholds are the ONE state
// owner. Four gates govern matrix columns; the agreement gate governs the
// dumbbell plot.
// ---------------------------------------------------------------------------

type GateId = 'acc' | 'halluc' | 'refusal' | 'latency' | 'agreement';

const GATE_ORDER: GateId[] = ['acc', 'halluc', 'refusal', 'latency', 'agreement'];

interface GateDef {
  id: GateId;
  label: string;
  icon: LucideIcon;
  /** 'gte' — value must be >= threshold; 'lte' — value must be <= threshold. */
  dir: 'gte' | 'lte';
  unit: string;
  min: number;
  max: number;
  step: number;
  defaultThreshold: number;
  /** How the threshold reads in the gate row, e.g. "Δ accuracy ≥". */
  rule: string;
  /** Fraction digits when displaying values/thresholds. */
  digits: number;
  /** Whether values render with an explicit +/− sign. */
  signed: boolean;
}

const GATES: Record<GateId, GateDef> = {
  acc: {id: 'acc', label: 'Accuracy floor', icon: GaugeIcon, dir: 'gte', unit: 'pp', min: -3, max: 1, step: 0.25, defaultThreshold: -0.5, rule: 'Δ accuracy ≥', digits: 2, signed: true},
  halluc: {id: 'halluc', label: 'Hallucination cap', icon: OctagonAlertIcon, dir: 'lte', unit: '%', min: 1, max: 6, step: 0.5, defaultThreshold: 3.0, rule: 'hallucination ≤', digits: 1, signed: false},
  refusal: {id: 'refusal', label: 'Refusal correctness', icon: ShieldCheckIcon, dir: 'gte', unit: '%', min: 90, max: 100, step: 0.5, defaultThreshold: 98.0, rule: 'refusal OK ≥', digits: 1, signed: false},
  latency: {id: 'latency', label: 'Latency budget', icon: TimerIcon, dir: 'lte', unit: 'ms', min: 0, max: 200, step: 10, defaultThreshold: 60, rule: 'Δ p95 ≤', digits: 0, signed: true},
  agreement: {id: 'agreement', label: 'Judge agreement', icon: ScaleIcon, dir: 'lte', unit: 'pts', min: 2, max: 12, step: 1, defaultThreshold: 6, rule: 'judge gap ≤', digits: 0, signed: false},
};

/** The four gates that render as matrix columns, in column order. */
const MATRIX_GATES: GateId[] = ['acc', 'halluc', 'refusal', 'latency'];

interface GateState {
  threshold: number;
  enabled: boolean;
}

function defaultGateState(): Record<GateId, GateState> {
  return {
    acc: {threshold: GATES.acc.defaultThreshold, enabled: true},
    halluc: {threshold: GATES.halluc.defaultThreshold, enabled: true},
    refusal: {threshold: GATES.refusal.defaultThreshold, enabled: true},
    latency: {threshold: GATES.latency.defaultThreshold, enabled: true},
    agreement: {threshold: GATES.agreement.defaultThreshold, enabled: true},
  };
}

/** The metric a gate reads off a slice — one lookup, no drift. */
function sliceValue(slice: SliceFixture, gateId: GateId): number {
  switch (gateId) {
    case 'acc':
      return slice.accDelta;
    case 'halluc':
      return slice.halluc;
    case 'refusal':
      return slice.refusal;
    case 'latency':
      return slice.latDelta;
    case 'agreement':
      return judgeGap(slice);
  }
}

function gatePasses(gateId: GateId, threshold: number, value: number): boolean {
  return GATES[gateId].dir === 'gte' ? value >= threshold : value <= threshold;
}

/** "+1.8" / "−0.2" / "3.0" with a true minus sign and fixed digits. */
function fmtValue(gateId: GateId, value: number): string {
  const def = GATES[gateId];
  const digits = gateId === 'acc' ? 1 : def.digits;
  const abs = Math.abs(value).toFixed(digits);
  if (value < 0) {
    return \`−\${abs}\`;
  }
  return def.signed ? \`+\${abs}\` : abs;
}

/** Threshold display: quarter steps show 2 digits only when needed. */
function fmtThreshold(gateId: GateId, value: number): string {
  const def = GATES[gateId];
  let digits = 0;
  if (def.step === 0.25) {
    digits = Math.round(Math.abs(value) * 100) % 50 === 0 ? 1 : 2;
  } else if (def.step === 0.5) {
    digits = 1;
  }
  const abs = Math.abs(value).toFixed(digits);
  if (value < 0) {
    return \`−\${abs}\`;
  }
  return def.signed && value > 0 ? \`+\${abs}\` : abs;
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-model-evaluation-scoreboard.
// Density grid repeated verbatim: header 56 · gate rail 336 · verdict banner
// min 72 · panel heads 32 · leaderboard rows 40 (model column 180, composite
// column 72, metric columns 68) · matrix rows 36 (slice label column 172,
// metric columns 92) · dumbbell rows 28 · gate rows min 76 · stepper/toggle
// buttons 40 · chips 20.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .mes-focusable:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 2px;
}
.\${SCOPE} .mes-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.\${SCOPE} .mes-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.\${SCOPE} .mes-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${BRAND};
}
/* 20px header chips; the verdict chip recolors with the derived verdict. */
.\${SCOPE} .mes-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
  white-space: nowrap;
}
.\${SCOPE} .mes-chip-ship { color: \${PASS}; border-color: \${PASS}; background: \${PASS_TINT}; }
.\${SCOPE} .mes-chip-hold { color: \${FAIL}; border-color: \${FAIL}; background: \${FAIL_TINT}; }
.\${SCOPE} .mes-chip-candidate { color: \${BRAND}; border-color: \${BRAND}; background: \${BRAND_TINT}; }

/* --- body frame: main column + gate rail 336 ------------------------------ */
.\${SCOPE} .mes-body {
  display: flex;
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .mes-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.\${SCOPE} .mes-rail {
  width: 336px;
  flex-shrink: 0;
  min-height: 0;
  overflow-y: auto;
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  padding: var(--spacing-3);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

/* --- panels: bordered, 32px uppercase heads -------------------------------- */
.\${SCOPE} .mes-panel {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-surface);
  overflow: hidden;
  flex-shrink: 0;
}
.\${SCOPE} .mes-panel-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 32px;
  box-sizing: border-box;
  padding: 0 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .mes-panel-scroll {
  overflow-x: auto;
}

/* --- leaderboard: 40px rows · 180 + 72 + 6×68 grid ------------------------- */
.\${SCOPE} .mes-lb {
  display: grid;
  grid-template-columns: 180px 72px repeat(6, 68px);
  min-width: max-content;
}
.\${SCOPE} .mes-lb-head {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 28px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .mes-lb-head:first-child { justify-content: flex-start; }
.\${SCOPE} .mes-lb-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 40px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.\${SCOPE} .mes-lb-row-candidate .mes-lb-cell { background: \${BRAND_TINT}; }
.\${SCOPE} .mes-lb-model {
  justify-content: flex-start;
  gap: 6px;
  min-width: 0;
}
.\${SCOPE} .mes-lb-model .mes-model-name {
  font-weight: 650;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .mes-lb-model .mes-model-note {
  font-size: 10px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .mes-tag {
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 4px;
}
.\${SCOPE} .mes-tag-candidate { color: \${BRAND_ON}; background: \${BRAND}; }
.\${SCOPE} .mes-tag-baseline {
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
}
/* Composite cell: value over an inline bar scaled on the 78–90 domain. */
.\${SCOPE} .mes-composite {
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  gap: 3px;
  font-weight: 650;
}
.\${SCOPE} .mes-composite-bar {
  width: 52px;
  height: 4px;
  border-radius: 2px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .mes-composite-bar > span {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: \${BRAND};
}

/* --- slice regression matrix: 36px rows · 172 + 4×92 grid ------------------ */
.\${SCOPE} .mes-mx {
  display: grid;
  grid-template-columns: 172px repeat(4, 92px);
  min-width: max-content;
}
.\${SCOPE} .mes-mx-head {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-height: 40px;
  box-sizing: border-box;
  padding: 3px 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .mes-mx-head:first-child { align-items: flex-start; }
.\${SCOPE} .mes-mx-head .mes-mx-rule {
  font-size: 10px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .mes-mx-head .mes-mx-rule-off { text-decoration: line-through; opacity: 0.7; }
/* Slice rows are buttons: the whole row is the selection affordance. */
.\${SCOPE} .mes-mx-slice {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  box-sizing: border-box;
  padding: 0 10px;
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
  min-width: 0;
}
@media (hover: hover) {
  .\${SCOPE} .mes-mx-slice:hover { background: var(--color-background-muted); }
}
.\${SCOPE} .mes-mx-slice[aria-pressed='true'] {
  background: \${BRAND_TINT};
  box-shadow: inset 3px 0 0 0 \${BRAND};
}
.\${SCOPE} .mes-mx-slice .mes-slice-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .mes-mx-slice .mes-slice-n {
  margin-left: auto;
  flex-shrink: 0;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .mes-mx-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  min-height: 36px;
  box-sizing: border-box;
  padding: 0 10px;
  border-bottom: var(--border-width) solid var(--color-border);
  border-left: var(--border-width) solid var(--color-border);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.\${SCOPE} .mes-mx-cell-fail {
  background: \${FAIL_TINT};
  color: \${FAIL};
  font-weight: 650;
}
.\${SCOPE} .mes-mx-cell-off { color: var(--color-text-secondary); }
.\${SCOPE} .mes-mx-cell .mes-cell-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.\${SCOPE} .mes-cell-dot-pass { background: \${PASS}; }
.\${SCOPE} .mes-cell-dot-fail { background: \${FAIL}; }
/* Selected-slice detail strip under the matrix. */
.\${SCOPE} .mes-mx-detail {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  min-height: 32px;
  box-sizing: border-box;
  padding: 4px 12px;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  background: var(--color-background-muted);
}

/* --- judge-disagreement dumbbell plot: 28px rows --------------------------- */
.\${SCOPE} .mes-db {
  padding: 6px 12px 10px;
}
.\${SCOPE} .mes-db-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 28px;
}
.\${SCOPE} .mes-db-label {
  width: 160px;
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .mes-db-row-selected .mes-db-label { color: \${BRAND}; }
.\${SCOPE} .mes-db-track {
  position: relative;
  flex: 1;
  min-width: 120px;
  height: 16px;
}
.\${SCOPE} .mes-db-track::before {
  content: '';
  position: absolute;
  inset: 7px 0;
  background: var(--color-border);
  border-radius: 1px;
}
.\${SCOPE} .mes-db-link {
  position: absolute;
  top: 6px;
  height: 4px;
  border-radius: 2px;
  background: color-mix(in srgb, var(--color-text-secondary) 45%, transparent);
}
.\${SCOPE} .mes-db-link-flag { background: \${FAIL}; }
.\${SCOPE} .mes-db-dot {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
}
.\${SCOPE} .mes-db-dot-llm { background: \${BRAND}; }
.\${SCOPE} .mes-db-dot-human {
  background: var(--color-background-surface);
  border: 2px solid var(--color-text-secondary);
}
.\${SCOPE} .mes-db-gap {
  width: 44px;
  flex-shrink: 0;
  text-align: right;
  font-size: 11px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .mes-db-gap-flag { color: \${FAIL}; }
.\${SCOPE} .mes-db-axis {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 20px;
}
.\${SCOPE} .mes-db-axis .mes-db-scale {
  position: relative;
  flex: 1;
  min-width: 120px;
  height: 14px;
  font-size: 9px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .mes-db-scale span { position: absolute; transform: translateX(-50%); }
.\${SCOPE} .mes-db-legend {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  color: var(--color-text-secondary);
  padding: 2px 0 6px;
}
.\${SCOPE} .mes-db-legend .mes-db-dot { position: static; transform: none; }

/* --- release gate rail ------------------------------------------------------ */
.\${SCOPE} .mes-verdict {
  border-radius: 10px;
  border: var(--border-width) solid;
  min-height: 72px;
  box-sizing: border-box;
  padding: 10px 12px;
}
.\${SCOPE} .mes-verdict-ship { border-color: \${PASS}; background: \${PASS_TINT}; }
.\${SCOPE} .mes-verdict-hold { border-color: \${FAIL}; background: \${FAIL_TINT}; }
.\${SCOPE} .mes-verdict-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.01em;
}
.\${SCOPE} .mes-verdict-ship .mes-verdict-title { color: \${PASS}; }
.\${SCOPE} .mes-verdict-hold .mes-verdict-title { color: \${FAIL}; }
.\${SCOPE} .mes-verdict-reasons {
  margin: 6px 0 0;
  padding: 0 0 0 18px;
  font-size: 11px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
/* Gate rows: min 76px — title line + 40px control line. */
.\${SCOPE} .mes-gate {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  background: var(--color-background-body);
  min-height: 76px;
  box-sizing: border-box;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.\${SCOPE} .mes-gate-off { opacity: 0.72; }
.\${SCOPE} .mes-gate-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 650;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.\${SCOPE} .mes-gate-count {
  margin-left: auto;
  flex-shrink: 0;
}
.\${SCOPE} .mes-gate-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
/* 40px ± steppers around a tabular threshold readout. */
.\${SCOPE} .mes-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  cursor: pointer;
  color: \${BRAND};
}
@media (hover: hover) {
  .\${SCOPE} .mes-step:hover:not(:disabled) { background: var(--color-background-muted); }
}
.\${SCOPE} .mes-step:disabled { opacity: 0.4; cursor: default; }
.\${SCOPE} .mes-threshold {
  min-width: 76px;
  text-align: center;
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
/* Gate enable toggle: aria-pressed pill, 40px hit height. */
.\${SCOPE} .mes-toggle {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 8px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 11px;
  font-weight: 650;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
}
@media (hover: hover) {
  .\${SCOPE} .mes-toggle:hover { background: var(--color-background-muted); }
}
.\${SCOPE} .mes-toggle[aria-pressed='true'] {
  color: \${BRAND};
  border-color: \${BRAND};
  background: \${BRAND_TINT};
}
/* Promote: the rail's one primary action; arms only on SHIP. */
.\${SCOPE} .mes-promote {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 10px;
  border: var(--border-width) solid \${BRAND};
  background: \${BRAND};
  color: \${BRAND_ON};
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} .mes-promote:hover:not(:disabled) {
    background: color-mix(in srgb, \${BRAND} 88%, var(--color-text-primary));
  }
}
.\${SCOPE} .mes-promote:disabled { opacity: 0.45; cursor: default; }
.\${SCOPE} .mes-log {
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .mes-log-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  min-height: 32px;
  padding: 6px 0;
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .mes-log-row:last-child { border-bottom: none; }
.\${SCOPE} .mes-log-verdict { font-weight: 700; flex-shrink: 0; }
.\${SCOPE} .mes-log-verdict.mes-log-ship { color: \${PASS}; }
.\${SCOPE} .mes-log-verdict.mes-log-hold { color: \${FAIL}; }
.\${SCOPE} .mes-log-when { margin-left: auto; flex-shrink: 0; font-variant-numeric: tabular-nums; }

/* --- responsive subtraction ------------------------------------------------ */
@media (max-width: 900px) {
  .\${SCOPE} .mes-body { flex-direction: column; overflow-y: auto; }
  .\${SCOPE} .mes-main { overflow-y: visible; flex: none; }
  .\${SCOPE} .mes-rail {
    width: 100%;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
}
@media (max-width: 620px) {
  .\${SCOPE} .mes-db-label { width: 108px; }
  .\${SCOPE} .mes-gate-controls { row-gap: 6px; }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS + DERIVED STRUCTURES
// ---------------------------------------------------------------------------

/**
 * The Benchline mark: three benchmark bars crossed by the release line.
 * currentColor rides .mes-mark (the brand pair).
 */
function BrandMark() {
  return (
    <span className="mes-mark" aria-hidden>
      <svg width={22} height={22} viewBox="0 0 22 22" fill="none">
        <rect x={3} y={11} width={4} height={8} rx={1} fill="var(--color-text-secondary)" />
        <rect x={9} y={7} width={4} height={12} rx={1} fill="currentColor" />
        <rect x={15} y={13} width={4} height={6} rx={1} fill="var(--color-text-secondary)" />
        <line x1={2} y1={5.5} x2={20} y2={5.5} stroke="currentColor" strokeWidth={1.8} strokeDasharray="3 2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Dumbbell x-scale: rubric scores plot on a fixed 55–95 domain. */
const DB_MIN = 55;
const DB_MAX = 95;
const DB_TICKS = [60, 70, 80, 90];

function dbPct(value: number): number {
  return ((value - DB_MIN) / (DB_MAX - DB_MIN)) * 100;
}

/** Per-gate evaluation snapshot — derived fresh every render. */
interface GateEval {
  def: GateDef;
  state: GateState;
  failing: SliceFixture[];
}

function evaluateGates(gates: Record<GateId, GateState>): Record<GateId, GateEval> {
  const result = {} as Record<GateId, GateEval>;
  for (const id of GATE_ORDER) {
    const state = gates[id];
    result[id] = {
      def: GATES[id],
      state,
      failing: state.enabled
        ? SLICES.filter(slice => !gatePasses(id, state.threshold, sliceValue(slice, id)))
        : [],
    };
  }
  return result;
}

interface LogEntry {
  model: string;
  verdict: 'ship' | 'hold';
  note: string;
  when: string;
}

const INITIAL_LOG: LogEntry[] = [
  {model: 'aster-2.1-rc2', verdict: 'hold', note: 'ja-JP hallucination 6.1% over the 3.0% cap', when: 'Jun 30'},
  {model: 'aster-2.0', verdict: 'ship', note: 'all gates green · full rollout', when: 'May 12'},
];

/** Short matrix column heads, in MATRIX_GATES order. */
const COLUMN_HEADS: Record<GateId, string> = {
  acc: 'Δ acc pp',
  halluc: 'halluc %',
  refusal: 'refusal %',
  latency: 'Δ p95 ms',
  agreement: 'judge gap',
};

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function ModelEvaluationScoreboardTemplate() {
  const [gates, setGates] = useState<Record<GateId, GateState>>(defaultGateState);
  const [selectedSliceId, setSelectedSliceId] = useState<string | null>('adversarial');
  const [log, setLog] = useState<LogEntry[]>(INITIAL_LOG);
  const [promoted, setPromoted] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // ---- derive everything from fixtures + the gate store ----
  const evals = evaluateGates(gates);
  const blocking = GATE_ORDER.filter(id => evals[id].state.enabled && evals[id].failing.length > 0);
  const verdict: 'ship' | 'hold' = blocking.length === 0 ? 'ship' : 'hold';
  const violationCount = blocking.reduce((sum, id) => sum + evals[id].failing.length, 0);
  const selectedSlice = SLICES.find(slice => slice.id === selectedSliceId) ?? null;

  const describeVerdict = (nextEvals: Record<GateId, GateEval>): string => {
    const nextBlocking = GATE_ORDER.filter(
      id => nextEvals[id].state.enabled && nextEvals[id].failing.length > 0,
    );
    return nextBlocking.length === 0
      ? 'Verdict: CLEAR TO SHIP.'
      : \`Verdict: HOLD, \${nextBlocking.length} gate\${nextBlocking.length === 1 ? '' : 's'} blocking.\`;
  };

  // ---- mutations: one gate store, every surface re-derives ----
  const stepGate = (id: GateId, direction: 1 | -1) => {
    const def = GATES[id];
    const current = gates[id].threshold;
    const next = Math.min(def.max, Math.max(def.min, Math.round((current + def.step * direction) * 100) / 100));
    if (next === current) {
      return;
    }
    const nextGates = {...gates, [id]: {...gates[id], threshold: next}};
    setGates(nextGates);
    const nextEvals = evaluateGates(nextGates);
    setAnnouncement(
      \`\${def.label} now \${def.rule} \${fmtThreshold(id, next)} \${def.unit} — \` +
        \`\${nextEvals[id].failing.length} slice\${nextEvals[id].failing.length === 1 ? '' : 's'} failing. \` +
        describeVerdict(nextEvals),
    );
  };

  const toggleGate = (id: GateId) => {
    const nextGates = {...gates, [id]: {...gates[id], enabled: !gates[id].enabled}};
    setGates(nextGates);
    const nextEvals = evaluateGates(nextGates);
    setAnnouncement(
      \`\${GATES[id].label} gate \${nextGates[id].enabled ? 'enabled' : 'disabled'}. \${describeVerdict(nextEvals)}\`,
    );
  };

  const resetGates = () => {
    const nextGates = defaultGateState();
    setGates(nextGates);
    setAnnouncement(\`Thresholds reset to release policy defaults. \${describeVerdict(evaluateGates(nextGates))}\`);
  };

  const promote = () => {
    if (verdict !== 'ship' || promoted) {
      return;
    }
    setPromoted(true);
    setLog(prev => [
      {model: RUN.candidate, verdict: 'ship', note: 'staged 25% rollout · gates green at review thresholds', when: 'now'},
      ...prev,
    ]);
    setAnnouncement(\`\${RUN.candidate} promoted to a staged 25% rollout and logged.\`);
  };

  // ---- header ----
  const header = (
    <LayoutHeader hasDivider>
      <div className="mes-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <BrandMark />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={1}>Benchline — release review</Heading>
              <Text type="supporting" size="sm" color="secondary">
                {RUN.candidate} vs {RUN.baseline} · eval run {RUN.evalRun} · {RUN.when} · {RUN.harness}
              </Text>
            </VStack>
          </StackItem>
          <span className="mes-chip">
            {SLICES.length} slices · {TOTAL_ITEMS.toLocaleString('en-US')} items
          </span>
          <span className="mes-chip mes-chip-candidate">{RUN.candidate}</span>
          <span className={\`mes-chip mes-chip-\${verdict}\`}>
            <Icon icon={verdict === 'ship' ? CheckCircle2Icon : OctagonAlertIcon} size="xsm" color="inherit" />
            {verdict === 'ship' ? 'Clear to ship' : \`Hold · \${blocking.length} gates\`}
          </span>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- leaderboard panel ----
  const leaderboard = (
    <section className="mes-panel" aria-label="Benchmark leaderboard">
      <div className="mes-panel-head">
        <Icon icon={FlaskConicalIcon} size="xsm" color="secondary" />
        Benchmark leaderboard
        <span style={{marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0}}>
          composite = mean of 4 quality suites
        </span>
      </div>
      <div className="mes-panel-scroll">
        <div className="mes-lb" role="table" aria-label="Five runs across seven benchmark columns">
          <div role="row" style={{display: 'contents'}}>
            {['Model', 'Comp', 'Reason', 'Code', 'Retr', 'Safety', 'p95 ms', '$/1k'].map(head => (
              <div className="mes-lb-head" role="columnheader" key={head}>
                {head}
              </div>
            ))}
          </div>
          {RUNS.map(run => {
            const comp = composite(run);
            const barPct = Math.min(100, Math.max(0, ((comp - COMPOSITE_MIN) / (COMPOSITE_MAX - COMPOSITE_MIN)) * 100));
            return (
              <div
                role="row"
                style={{display: 'contents'}}
                className={run.tag === 'candidate' ? 'mes-lb-row-candidate' : undefined}
                key={run.id}>
                <div className="mes-lb-cell mes-lb-model" role="rowheader">
                  <span style={{minWidth: 0}}>
                    <span className="mes-model-name" style={{display: 'block'}}>
                      {run.model}
                    </span>
                    <span className="mes-model-note" style={{display: 'block'}}>
                      {run.note}
                    </span>
                  </span>
                  {run.tag != null && <span className={\`mes-tag mes-tag-\${run.tag}\`}>{run.tag}</span>}
                </div>
                <div className="mes-lb-cell mes-composite" role="cell">
                  {comp.toFixed(1)}
                  <span className="mes-composite-bar">
                    <span style={{width: \`\${barPct}%\`}} />
                  </span>
                </div>
                {[run.reasoning, run.code, run.retrieval, run.safety].map((value, index) => (
                  <div className="mes-lb-cell" role="cell" key={index}>
                    {value.toFixed(1)}
                  </div>
                ))}
                <div className="mes-lb-cell" role="cell">
                  {run.p95.toLocaleString('en-US')}
                </div>
                <div className="mes-lb-cell" role="cell">
                  {run.cost.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ---- slice regression matrix panel ----
  const matrix = (
    <section className="mes-panel" aria-label="Slice regression matrix">
      <div className="mes-panel-head">
        <Icon icon={GaugeIcon} size="xsm" color="secondary" />
        Slice regressions · {RUN.candidate} vs {RUN.baseline}
        <span style={{marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0}}>
          cells re-check against live gate thresholds
        </span>
      </div>
      <div className="mes-panel-scroll">
        <div className="mes-mx" role="grid" aria-label="Nine slices across four gated metrics">
          <div role="row" style={{display: 'contents'}}>
            <div className="mes-mx-head" role="columnheader">
              Slice · n
            </div>
            {MATRIX_GATES.map(gateId => {
              const {def, state} = evals[gateId];
              return (
                <div className="mes-mx-head" role="columnheader" key={gateId}>
                  {COLUMN_HEADS[gateId]}
                  <span className={\`mes-mx-rule\${state.enabled ? '' : ' mes-mx-rule-off'}\`}>
                    {def.rule.split(' ').pop()} {fmtThreshold(gateId, state.threshold)}
                    {state.enabled ? '' : ' · off'}
                  </span>
                </div>
              );
            })}
          </div>
          {SLICES.map(slice => (
            <div role="row" style={{display: 'contents'}} key={slice.id}>
              <button
                type="button"
                role="rowheader"
                className="mes-mx-slice mes-focusable"
                aria-pressed={slice.id === selectedSliceId}
                onClick={() => setSelectedSliceId(current => (current === slice.id ? null : slice.id))}>
                <span className="mes-slice-name">{slice.label}</span>
                <span className="mes-slice-n">{slice.n.toLocaleString('en-US')}</span>
              </button>
              {MATRIX_GATES.map(gateId => {
                const {state} = evals[gateId];
                const value = sliceValue(slice, gateId);
                const enabled = state.enabled;
                const pass = gatePasses(gateId, state.threshold, value);
                const cellClass = enabled
                  ? pass
                    ? 'mes-mx-cell'
                    : 'mes-mx-cell mes-mx-cell-fail'
                  : 'mes-mx-cell mes-mx-cell-off';
                const status = enabled ? (pass ? 'passes' : 'FAILS') : 'ungated';
                return (
                  <div
                    role="gridcell"
                    className={cellClass}
                    aria-label={\`\${slice.label} \${COLUMN_HEADS[gateId]}: \${fmtValue(gateId, value)} — \${status}\`}
                    key={gateId}>
                    {enabled && <span className={\`mes-cell-dot mes-cell-dot-\${pass ? 'pass' : 'fail'}\`} aria-hidden />}
                    {fmtValue(gateId, value)}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {selectedSlice != null && (
        <div className="mes-mx-detail">
          <strong style={{color: 'var(--color-text-primary)'}}>{selectedSlice.label}</strong>
          <span>{selectedSlice.n.toLocaleString('en-US')} items</span>
          <span>Δ acc {fmtValue('acc', selectedSlice.accDelta)} pp</span>
          <span>halluc {selectedSlice.halluc.toFixed(1)}%</span>
          <span>refusal {selectedSlice.refusal.toFixed(1)}%</span>
          <span>Δ p95 {fmtValue('latency', selectedSlice.latDelta)} ms</span>
          <span>
            judges {selectedSlice.judgeLlm} vs {selectedSlice.judgeHuman} · gap {judgeGap(selectedSlice)}
          </span>
        </div>
      )}
    </section>
  );

  // ---- judge-disagreement dumbbell panel ----
  const agreement = evals.agreement;
  const dumbbells = (
    <section className="mes-panel" aria-label="Judge disagreement">
      <div className="mes-panel-head">
        <Icon icon={ScaleIcon} size="xsm" color="secondary" />
        Judge disagreement · LLM judge vs human panel
        <span style={{marginLeft: 'auto', fontWeight: 400, textTransform: 'none', letterSpacing: 0}}>
          {agreement.state.enabled
            ? \`gap ≤ \${fmtThreshold('agreement', agreement.state.threshold)} pts\`
            : 'agreement gate off'}
        </span>
      </div>
      <div className="mes-db">
        <div className="mes-db-legend">
          <span className="mes-db-dot mes-db-dot-llm" aria-hidden /> LLM judge
          <span className="mes-db-dot mes-db-dot-human" aria-hidden /> human panel
          <span style={{marginLeft: 'auto'}}>rubric score, {DB_MIN}–{DB_MAX}</span>
        </div>
        {SLICES.map(slice => {
          const gap = judgeGap(slice);
          const flagged = agreement.state.enabled && !gatePasses('agreement', agreement.state.threshold, gap);
          const llmPct = dbPct(slice.judgeLlm);
          const humanPct = dbPct(slice.judgeHuman);
          const left = Math.min(llmPct, humanPct);
          const width = Math.abs(llmPct - humanPct);
          return (
            <div
              className={\`mes-db-row\${slice.id === selectedSliceId ? ' mes-db-row-selected' : ''}\`}
              key={slice.id}
              aria-label={\`\${slice.label}: LLM judge \${slice.judgeLlm}, human panel \${slice.judgeHuman}, gap \${gap}\${flagged ? ' — over the agreement gate' : ''}\`}>
              <span className="mes-db-label">{slice.label}</span>
              <span className="mes-db-track" aria-hidden>
                <span className={\`mes-db-link\${flagged ? ' mes-db-link-flag' : ''}\`} style={{left: \`\${left}%\`, width: \`\${width}%\`}} />
                <span className="mes-db-dot mes-db-dot-human" style={{left: \`\${humanPct}%\`}} />
                <span className="mes-db-dot mes-db-dot-llm" style={{left: \`\${llmPct}%\`}} />
              </span>
              <span className={\`mes-db-gap\${flagged ? ' mes-db-gap-flag' : ''}\`}>Δ{gap}</span>
            </div>
          );
        })}
        <div className="mes-db-axis" aria-hidden>
          <span className="mes-db-label" />
          <span className="mes-db-scale">
            {DB_TICKS.map(tick => (
              <span key={tick} style={{left: \`\${dbPct(tick)}%\`}}>
                {tick}
              </span>
            ))}
          </span>
          <span className="mes-db-gap" />
        </div>
      </div>
    </section>
  );

  // ---- release gate rail ----
  const rail = (
    <aside className="mes-rail" aria-label="Release gates">
      <div className={\`mes-verdict mes-verdict-\${verdict}\`} role="status">
        <span className="mes-verdict-title">
          <Icon icon={verdict === 'ship' ? CheckCircle2Icon : OctagonAlertIcon} size="sm" color="inherit" />
          {verdict === 'ship' ? \`CLEAR TO SHIP \${RUN.candidate}\` : \`HOLD — \${blocking.length} gate\${blocking.length === 1 ? '' : 's'} blocking\`}
        </span>
        {verdict === 'hold' ? (
          <ul className="mes-verdict-reasons">
            {blocking.map(id => {
              const {def, state, failing} = evals[id];
              return (
                <li key={id}>
                  {def.label}: {failing.length} slice{failing.length === 1 ? '' : 's'} past {def.rule}{' '}
                  {fmtThreshold(id, state.threshold)} {def.unit} —{' '}
                  {failing.map(slice => \`\${slice.label} \${fmtValue(id, sliceValue(slice, id))}\`).join(', ')}
                </li>
              );
            })}
          </ul>
        ) : (
          <ul className="mes-verdict-reasons">
            <li>
              All enabled gates green across {SLICES.length} slices ({violationCount} violations at current thresholds).
            </li>
          </ul>
        )}
      </div>
      {GATE_ORDER.map(id => {
        const {def, state, failing} = evals[id];
        return (
          <div className={\`mes-gate\${state.enabled ? '' : ' mes-gate-off'}\`} key={id}>
            <span className="mes-gate-title">
              <Icon icon={def.icon} size="sm" color="secondary" />
              {def.label}
              <span className="mes-gate-count">
                {state.enabled ? (
                  failing.length > 0 ? (
                    <span className="mes-chip mes-chip-hold">{failing.length} failing</span>
                  ) : (
                    <span className="mes-chip mes-chip-ship">pass</span>
                  )
                ) : (
                  <span className="mes-chip">off</span>
                )}
              </span>
            </span>
            <span className="mes-gate-controls">
              <button
                type="button"
                className="mes-step mes-focusable"
                aria-label={\`Tighten \${def.label} (lower threshold)\`}
                disabled={!state.enabled || state.threshold <= def.min}
                onClick={() => stepGate(id, -1)}>
                <Icon icon={MinusIcon} size="sm" color="inherit" />
              </button>
              <span className="mes-threshold">
                {def.rule} {fmtThreshold(id, state.threshold)} {def.unit}
              </span>
              <button
                type="button"
                className="mes-step mes-focusable"
                aria-label={\`Loosen \${def.label} (raise threshold)\`}
                disabled={!state.enabled || state.threshold >= def.max}
                onClick={() => stepGate(id, 1)}>
                <Icon icon={PlusIcon} size="sm" color="inherit" />
              </button>
              <button
                type="button"
                className="mes-toggle mes-focusable"
                aria-pressed={state.enabled}
                onClick={() => toggleGate(id)}>
                {state.enabled && <Icon icon={CheckIcon} size="xsm" color="inherit" />}
                {state.enabled ? 'Gating' : 'Off'}
              </button>
            </span>
          </div>
        );
      })}
      <HStack gap={2} vAlign="center">
        <Button
          label="Reset thresholds"
          variant="ghost"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" />}
          onClick={resetGates}
        />
      </HStack>
      <button
        type="button"
        className="mes-promote mes-focusable"
        disabled={verdict !== 'ship' || promoted}
        onClick={promote}>
        <Icon icon={RocketIcon} size="sm" color="inherit" />
        {promoted ? \`\${RUN.candidate} staged at 25%\` : \`Promote \${RUN.candidate} to staged rollout\`}
      </button>
      <div>
        <Text type="label" size="sm" color="secondary">
          Decision log
        </Text>
        <div className="mes-log">
          {log.map(entry => (
            <div className="mes-log-row" key={\`\${entry.model}-\${entry.when}\`}>
              <span className={\`mes-log-verdict mes-log-\${entry.verdict}\`}>
                {entry.verdict === 'ship' ? 'SHIP' : 'HOLD'}
              </span>
              <span>
                <strong style={{color: 'var(--color-text-primary)'}}>{entry.model}</strong> — {entry.note}
              </span>
              <span className="mes-log-when">{entry.when}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="mes-vh">
              {announcement}
            </div>
            <div className="mes-body">
              <div className="mes-main">
                {leaderboard}
                {matrix}
                {dumbbells}
              </div>
              {rail}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};