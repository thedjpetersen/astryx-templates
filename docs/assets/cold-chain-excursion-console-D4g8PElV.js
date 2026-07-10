var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Frostline QA disposition desk
 *   for six pharma lots across four cold-chain lanes. Each lot carries a
 *   literal temperature trace (fixed °C readings at a fixed sample
 *   interval), a stability budget, prior time-out-of-refrigeration (TOR)
 *   minutes from earlier legs, a freeze-sensitivity flag, a hard heat
 *   ceiling, and an optional telemetry-gap marker. Every derived figure
 *   is computed live from the trace — event TOR = interval × readings
 *   above 8.0 °C, e.g. LOT 26-F0412: 5 of 13 readings above 8.0 at a
 *   10-min interval = 50 min event TOR, + 30 prior = 80 of 120 budget →
 *   the tree recommends RELEASE; LOT 26-F0398: 8 × 10 = 80 + 60 prior =
 *   140 > 120 with complete data → HOLD; LOT 26-F0405 peaks 16.2 °C over
 *   its 15.0 hard ceiling → DESTROY; LOT 26-F0360 dips to −0.8 °C
 *   (freeze-sensitive) → DESTROY; LOT 26-F0388 blows budget WITH a 38-min
 *   telemetry gap → DESTROY; LOT 26-F0371 arrives already released and
 *   signed. QA signoff clocks advance deterministically from a frozen
 *   14:32 session clock in fixed 4-minute steps. No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Frostline — Cold Chain Excursion Console: left, a 280px lot
 *   queue rail (product, lane, peak °C, a TOR budget bar, live status
 *   chip); center, the selected lot's excursion chart — an SVG trace over
 *   a shaded 2–8 °C keep band with a dashed hard-ceiling line, heat
 *   readings flagged red and freeze dips blue, a dashed telemetry-gap
 *   segment, plus a keyboard range scrubber that drives a hairline and a
 *   t+min/°C readout; a metrics strip (peak, event TOR, cumulative TOR vs
 *   budget, samples); then the disposition decision tree — four evaluated
 *   gate nodes (freeze breach → hard ceiling → budget → data complete)
 *   whose YES/NO path lights to a recommended outcome — beside a QA
 *   signoff gate; a lane risk table closes the page. SIGNATURE: choosing
 *   Release / Hold / Destroy on an outcome card highlights the chosen
 *   path against the recommended one — overriding the recommendation
 *   demands a deviation rationale before the gate unlocks — and signing
 *   as QA closes the lot: the queue chip flips, the gate stamps a
 *   deterministic clock, and the lane risk table re-grades. Reopening
 *   reverses all of it. A screenshot cannot show the gate refusing an
 *   unjustified override.
 * @position Page template; emitted by \`astryx template cold-chain-excursion-console\`
 *
 * Frame: a 100dvh root gives Layout height="fill" a definite height in
 * auto-height hosts. LayoutHeader carries the brand mark, desk identity,
 * and an open-lots badge. LayoutContent (padding 0) owns a hand-rolled
 * \`280px minmax(0,1fr)\` CSS grid — pure CSS because viewport media
 * queries do not fire in the inline demo stage; the DEFAULT grid must
 * already be right at ~1045px. Rail and workbench scroll independently
 * (height:100%, minHeight:0, overflow-y:auto).
 *
 * Responsive contract:
 * - ~1045px default (inline stage): rail 280px, workbench ≈750px; the
 *   tree/gate row is a 1.2fr/0.8fr grid; the chart SVG scales to its
 *   column via viewBox. No breakpoint needed.
 * - <=920px (full-screen narrow): the frame stacks — rail first as a
 *   full-width list, then the workbench; independent pane scrolling
 *   stops; the tree/gate row collapses to one column.
 * - <=560px (390px embed iframe): the metrics strip wraps 2×2, the lane
 *   table scrolls horizontally inside its card (min-width 520px), queue
 *   meta wraps, and every action keeps a >=40px hit height.
 * Subtraction, not squeeze: panes drop columns or gain internal scroll —
 * nothing compresses below its density numbers.
 *
 * Container policy (exception-desk archetype): rows, rails, and working
 * panels — the queue is 76px rows, the tree is 64px gate rows with
 * connector spines, outcomes are 96px action cards, the lane table is
 * 44px rows. Card chrome only frames the chart, tree, gate, and table
 * surfaces.
 *
 * Color policy: token-first chrome (var(--color-*), var(--spacing-*)).
 * ONE quarantined brand accent — Frostline ice blue — as a light-dark()
 * pair with contrast math at the declaration. Heat/freeze/hold/release
 * state colors are light-dark() pairs with math in the STATE COLOR
 * table. Never the bare text token (it does not exist and renders black
 * on SVG): --color-text-primary / --color-text-secondary only.
 *
 * Density grid (repeated verbatim in the CSS): rail 280 · queue rows min
 * 76 · chart viewBox 700×220 · metric tiles min 72 · tree gate rows min
 * 64 · outcome cards min 96 · signoff gate min 220 · lane table rows 44 ·
 * gutter var(--spacing-3) · action buttons >=40px hit height · every
 * numeric cell tabular-nums.
 *
 * Fixture policy: fixed data only — no clock reads, no randomness, no
 * network. Traces are literal arrays; TOR, recommendations, lane grades,
 * and readiness all derive live from lot state so disposition, signoff,
 * and reopen always reconcile by construction; signoff timestamps step a
 * frozen session clock forward 4 minutes per signature.
 */

import {useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {useToast} from '@astryxdesign/core/Toast';
import {
  CheckIcon,
  LockIcon,
  PenLineIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  UnlockIcon,
} from 'lucide-react';

// ============= BRAND =============
// ONE quarantined Frostline accent (ice blue). Text-safe pair:
//   light #0369A1 on #FFFFFF ≈ 5.9:1  (passes 4.5:1 body text)
//   dark  #7CC7EE on #17181A ≈ 9.3:1
// Used for brand text, focus rings, the selected queue row, the scrubber
// hairline, and recommended-path highlights.
const ACCENT = 'light-dark(#0369A1, #7CC7EE)';
const ACCENT_WASH =
  'light-dark(rgba(3, 105, 161, 0.10), rgba(124, 199, 238, 0.14))';

// ============= STATE COLORS =============
// Each pair carries its own contrast math (on page bg #FFFFFF / #17181A):
//   HEAT    light #B91C1C ≈ 5.9:1 · dark #F87171 ≈ 6.9:1
//   FREEZE  light #1D4ED8 ≈ 6.3:1 · dark #93C5FD ≈ 10.2:1
//   RELEASE light #15803D ≈ 4.6:1 · dark #4ADE80 ≈ 9.9:1
//   HOLD    light #B45309 ≈ 4.6:1 · dark #FCD34D ≈ 12.1:1
const HEAT = 'light-dark(#B91C1C, #F87171)';
const FREEZE = 'light-dark(#1D4ED8, #93C5FD)';
const RELEASE = 'light-dark(#15803D, #4ADE80)';
const HOLD = 'light-dark(#B45309, #FCD34D)';
// Chart keep-band fill (non-text wash).
const BAND_WASH =
  'light-dark(rgba(3, 105, 161, 0.08), rgba(124, 199, 238, 0.10))';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= DOMAIN MODEL =============
// Keep band is 2.0–8.0 °C for every lot; hard ceiling and freeze
// sensitivity are per-product. Event TOR = sampleIntervalMin × readings
// strictly above 8.0 °C. A freeze breach = any reading below 0.0 °C on a
// freeze-sensitive lot.
const BAND_LOW_C = 2.0;
const BAND_HIGH_C = 8.0;

type Disposition = 'release' | 'hold' | 'destroy';

interface Lane {
  id: string;
  label: string;
  mode: string;
  carrier: string;
  shipments30d: number;
}

const LANES: Lane[] = [
  {id: 'ln-mem-ord', label: 'MEM → ORD', mode: 'Reefer truck', carrier: 'Polar Freight Co.', shipments30d: 42},
  {id: 'ln-fra-jfk', label: 'FRA → JFK', mode: 'Air — active container', carrier: 'SkyChill Logistics', shipments30d: 18},
  {id: 'ln-sea-anc', label: 'SEA → ANC', mode: 'Air — passive shipper', carrier: 'North Meridian Air', shipments30d: 11},
  {id: 'ln-elp-dfw', label: 'ELP → DFW', mode: 'Reefer truck', carrier: 'Sun Corridor Carriers', shipments30d: 27},
];

const LANE_BY_ID = new Map(LANES.map(lane => [lane.id, lane]));

function laneOf(id: string): Lane {
  const lane = LANE_BY_ID.get(id);
  if (lane === undefined) {
    throw new Error(\`Unknown lane \${id}\`);
  }
  return lane;
}

interface ExcursionLot {
  id: string;
  lotCode: string;
  product: string;
  quantity: string;
  laneId: string;
  /** Fixed wall-clock label for the first reading (site-local). */
  startClock: string;
  sampleIntervalMin: number;
  /** Literal trace, one reading per interval. */
  tempsC: number[];
  /** Dashed segment drawn after this index (telemetry gap), if any. */
  gapAfterIndex: number | null;
  gapNote: string | null;
  freezeSensitive: boolean;
  hardCeilingC: number;
  stabilityBudgetMin: number;
  priorTorMin: number;
  sensor: string;
}

// Six lots engineered to exercise every branch of the decision tree —
// see the @input worked arithmetic. LOT 26-F0371 ships pre-signed so the
// closed state is visible without interacting.
const LOTS: ExcursionLot[] = [
  {
    id: 'lot-0412',
    lotCode: 'LOT 26-F0412',
    product: 'Ravivax quadrivalent influenza vaccine — 10-dose vials',
    quantity: '1,440 vials · 12 cartons',
    laneId: 'ln-mem-ord',
    startClock: '02:10',
    sampleIntervalMin: 10,
    tempsC: [5.2, 5.6, 6.1, 7.4, 8.9, 9.8, 10.4, 9.6, 8.3, 7.1, 6.2, 5.4, 5.1],
    gapAfterIndex: null,
    gapNote: null,
    freezeSensitive: true,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 120,
    priorTorMin: 30,
    sensor: 'TL-8841 (door-side probe)',
  },
  {
    id: 'lot-0398',
    lotCode: 'LOT 26-F0398',
    product: 'GlucaPen U-100 insulin autoinjectors — 2-pack cartons',
    quantity: '3,860 cartons · 4 pallets',
    laneId: 'ln-fra-jfk',
    startClock: '05:35',
    sampleIntervalMin: 10,
    tempsC: [6.0, 6.4, 7.2, 8.6, 9.9, 11.4, 12.8, 12.1, 11.0, 9.4, 8.8, 7.6, 6.9, 6.1],
    gapAfterIndex: null,
    gapNote: null,
    freezeSensitive: true,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 120,
    priorTorMin: 60,
    sensor: 'TL-9102 (pallet 2 core)',
  },
  {
    id: 'lot-0405',
    lotCode: 'LOT 26-F0405',
    product: 'Novimab-CR 180 mg/mL monoclonal antibody — bulk drug substance',
    quantity: '18 × 10 L cryovessels',
    laneId: 'ln-sea-anc',
    startClock: '09:20',
    sampleIntervalMin: 15,
    tempsC: [4.8, 5.5, 7.9, 10.2, 13.6, 15.4, 16.2, 14.9, 12.3, 9.7, 7.8, 6.5],
    gapAfterIndex: null,
    gapNote: null,
    freezeSensitive: false,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 240,
    priorTorMin: 20,
    sensor: 'TL-7719 (vessel rack)',
  },
  {
    id: 'lot-0371',
    lotCode: 'LOT 26-F0371',
    product: 'Ravivax pediatric 0.5 mL prefilled syringes',
    quantity: '9,600 syringes · 8 cartons',
    laneId: 'ln-mem-ord',
    startClock: '07:45',
    sampleIntervalMin: 10,
    tempsC: [5.0, 5.8, 6.9, 8.2, 8.9, 8.4, 7.6, 6.8, 5.9, 5.3],
    gapAfterIndex: null,
    gapNote: null,
    freezeSensitive: true,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 120,
    priorTorMin: 25,
    sensor: 'TL-8623 (carton top)',
  },
  {
    id: 'lot-0388',
    lotCode: 'LOT 26-F0388',
    product: 'CryoZyme lyophilized enzyme kits — 96-well format',
    quantity: '520 kits · 2 pallets',
    laneId: 'ln-elp-dfw',
    startClock: '03:50',
    sampleIntervalMin: 15,
    tempsC: [6.2, 7.0, 8.4, 9.1, 8.8, 8.2, 7.4, 6.6, 6.0, 5.7],
    gapAfterIndex: 3,
    gapNote: '38-min telemetry gap 04:20–04:58 (logger reboot)',
    freezeSensitive: false,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 120,
    priorTorMin: 95,
    sensor: 'TL-9330 (pallet 1 edge)',
  },
  {
    id: 'lot-0360',
    lotCode: 'LOT 26-F0360',
    product: 'HepaTrig pediatric hepatitis B vaccine — single-dose vials',
    quantity: '2,200 vials · 6 cartons',
    laneId: 'ln-fra-jfk',
    startClock: '00:55',
    sampleIntervalMin: 10,
    tempsC: [4.1, 3.2, 2.4, 1.1, 0.3, -0.8, -0.2, 0.9, 2.2, 3.5, 4.4],
    gapAfterIndex: null,
    gapNote: null,
    freezeSensitive: true,
    hardCeilingC: 15.0,
    stabilityBudgetMin: 120,
    priorTorMin: 0,
    sensor: 'TL-9017 (carton mid-stack)',
  },
];

const LOT_BY_ID = new Map(LOTS.map(lot => [lot.id, lot]));

function lotOf(id: string): ExcursionLot {
  const lot = LOT_BY_ID.get(id);
  if (lot === undefined) {
    throw new Error(\`Unknown lot \${id}\`);
  }
  return lot;
}

// ---- trace derivations (single source of truth for every figure) ----

function peakC(lot: ExcursionLot): number {
  return Math.max(...lot.tempsC);
}

function minC(lot: ExcursionLot): number {
  return Math.min(...lot.tempsC);
}

/** Minutes above the 8.0 °C keep-band ceiling in THIS event. */
function eventTorMin(lot: ExcursionLot): number {
  return (
    lot.sampleIntervalMin * lot.tempsC.filter(temp => temp > BAND_HIGH_C).length
  );
}

function cumulativeTorMin(lot: ExcursionLot): number {
  return lot.priorTorMin + eventTorMin(lot);
}

function hasFreezeBreach(lot: ExcursionLot): boolean {
  return lot.freezeSensitive && minC(lot) < 0;
}

// ---- fixture-only clock arithmetic (no runtime clocks) ----

function parseClock(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}

function formatClock(totalMinutes: number): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  const wrapped = ((totalMinutes % 1440) + 1440) % 1440;
  return \`\${pad(Math.floor(wrapped / 60))}:\${pad(wrapped % 60)}\`;
}

/** Wall clock of reading i = startClock + i × interval. */
function readingClock(lot: ExcursionLot, index: number): string {
  return formatClock(
    parseClock(lot.startClock) + index * lot.sampleIntervalMin,
  );
}

// QA signoff clocks: frozen session start, fixed 4-minute steps.
const SIGNOFF_CLOCK_START = 14 * 60 + 32; // 14:32
const SIGNOFF_CLOCK_STEP = 4;
const QA_REVIEWER = 'R. Okafor, QA-2';

// ============= DECISION TREE =============
// Four gate nodes evaluated straight from the trace. The lit YES/NO path
// ends at the recommended outcome; the user may still choose any
// disposition, but overrides demand a deviation rationale.

type GateId = 'freeze' | 'ceiling' | 'budget' | 'complete';

interface GateNode {
  id: GateId;
  question: string;
  /** Which answer routes to the NEXT gate (the other exits the tree). */
  continueOn: 'yes' | 'no';
  exitOutcome: Disposition;
  exitLabel: string;
}

const GATES: GateNode[] = [
  {
    id: 'freeze',
    question:
      'Freeze breach — any reading below 0.0 °C on a freeze-sensitive lot?',
    continueOn: 'no',
    exitOutcome: 'destroy',
    exitLabel: 'YES → potency loss is unrecoverable',
  },
  {
    id: 'ceiling',
    question: 'Peak above the product hard ceiling?',
    continueOn: 'no',
    exitOutcome: 'destroy',
    exitLabel: 'YES → exposure beyond stability data',
  },
  {
    id: 'budget',
    question: 'Cumulative TOR within the stability budget?',
    continueOn: 'no',
    exitOutcome: 'release',
    exitLabel: 'YES → excursion absorbed by budget',
  },
  {
    id: 'complete',
    question: 'Telemetry complete — no logger gaps across the event?',
    continueOn: 'no', // "yes" exits to HOLD; "no" falls through to DESTROY
    exitOutcome: 'hold',
    exitLabel: 'YES → hold for stability review',
  },
];

interface GateAnswer {
  gate: GateNode;
  answer: 'yes' | 'no';
  detail: string;
  /** True when the tree exits at this gate. */
  isExit: boolean;
}

interface TreeEvaluation {
  answers: GateAnswer[];
  recommended: Disposition;
}

function formatTemp(value: number): string {
  return \`\${value.toFixed(1)} °C\`;
}

/**
 * Walks the four gates against the lot's derived figures. Falling out of
 * the final gate (incomplete telemetry AND blown budget) recommends
 * DESTROY.
 */
function evaluateTree(lot: ExcursionLot): TreeEvaluation {
  const answers: GateAnswer[] = [];
  const facts: Record<GateId, {answer: 'yes' | 'no'; detail: string}> = {
    freeze: hasFreezeBreach(lot)
      ? {
          answer: 'yes',
          detail: \`low \${formatTemp(minC(lot))} — freeze-sensitive\`,
        }
      : {
          answer: 'no',
          detail: lot.freezeSensitive
            ? \`low \${formatTemp(minC(lot))} stayed above 0.0\`
            : 'product is not freeze-sensitive',
        },
    ceiling:
      peakC(lot) >= lot.hardCeilingC
        ? {
            answer: 'yes',
            detail: \`peak \${formatTemp(peakC(lot))} ≥ ceiling \${formatTemp(lot.hardCeilingC)}\`,
          }
        : {
            answer: 'no',
            detail: \`peak \${formatTemp(peakC(lot))} < ceiling \${formatTemp(lot.hardCeilingC)}\`,
          },
    budget:
      cumulativeTorMin(lot) <= lot.stabilityBudgetMin
        ? {
            answer: 'yes',
            detail: \`\${cumulativeTorMin(lot)} of \${lot.stabilityBudgetMin} min budget\`,
          }
        : {
            answer: 'no',
            detail: \`\${cumulativeTorMin(lot)} min exceeds \${lot.stabilityBudgetMin} min budget\`,
          },
    complete:
      lot.gapAfterIndex === null
        ? {answer: 'yes', detail: 'contiguous trace, no logger gaps'}
        : {answer: 'no', detail: lot.gapNote ?? 'telemetry gap in trace'},
  };

  for (const gate of GATES) {
    const fact = facts[gate.id];
    const isExit = fact.answer !== gate.continueOn;
    answers.push({gate, answer: fact.answer, detail: fact.detail, isExit});
    if (isExit) {
      return {answers, recommended: gate.exitOutcome};
    }
  }
  // Fell through every gate: budget blown AND telemetry incomplete.
  return {answers, recommended: 'destroy'};
}

// ============= DISPOSITION META =============

const DISPOSITION_META: Record<
  Disposition,
  {label: string; verb: string; color: string; blurb: string}
> = {
  release: {
    label: 'Release',
    verb: 'released to distribution',
    color: RELEASE,
    blurb:
      'Ship to forward DC; excursion logged against the stability budget.',
  },
  hold: {
    label: 'Hold',
    verb: 'held for stability review',
    color: HOLD,
    blurb:
      'Quarantine cage Q-3; stability team issues a memo within 5 business days.',
  },
  destroy: {
    label: 'Destroy',
    verb: 'sent to destruction',
    color: HEAT,
    blurb:
      'Witnessed destruction; file the carrier claim with the trace attached.',
  },
};

const DISPOSITIONS: Disposition[] = ['release', 'hold', 'destroy'];

// Deviation rationales offered when the chosen disposition differs from
// the tree's recommendation.
const DEVIATION_REASONS = [
  {value: 'sm-2214', label: 'Stability memo SM-2214 covers this exposure'},
  {value: 'bridge', label: 'Bridging study data on file with QA'},
  {value: 'market', label: 'Market action — regulatory hold supersedes'},
  {value: 'claim', label: 'Carrier claim requires intact lot — hold instead'},
] as const;

// ============= PER-LOT REVIEW STATE =============

interface LotReview {
  disposition: Disposition | null;
  deviationReason: string | null;
  signedOff: boolean;
  signedClock: string | null;
}

function initialReviews(): Record<string, LotReview> {
  const reviews: Record<string, LotReview> = {};
  for (const lot of LOTS) {
    reviews[lot.id] = {
      disposition: null,
      deviationReason: null,
      signedOff: false,
      signedClock: null,
    };
  }
  // LOT 26-F0371 arrives already dispositioned and signed (11:05, prior
  // shift) so the closed state is visible without interacting.
  reviews['lot-0371'] = {
    disposition: 'release',
    deviationReason: null,
    signedOff: true,
    signedClock: '11:05',
  };
  return reviews;
}

type LotStatus = 'open' | 'pending-qa' | 'closed';

function statusOf(review: LotReview): LotStatus {
  if (review.signedOff) {
    return 'closed';
  }
  return review.disposition === null ? 'open' : 'pending-qa';
}

// ============= LANE RISK =============
// Grade derives from live lot state on the lane: 2 pts per unresolved
// excursion (open or pending QA), 2 pts if mean TOR utilisation ≥ 85%
// (1 pt ≥ 60%), 1 pt per destroyed lot. A(0–1) B(2–3) C(4–5) D(6+).

interface LaneRisk {
  lane: Lane;
  openCount: number;
  closedCount: number;
  meanUtilPct: number;
  destroyedCount: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

function laneRisk(
  lane: Lane,
  reviews: Record<string, LotReview>,
): LaneRisk {
  const laneLots = LOTS.filter(lot => lot.laneId === lane.id);
  let openCount = 0;
  let closedCount = 0;
  let destroyedCount = 0;
  let utilSum = 0;
  for (const lot of laneLots) {
    const review = reviews[lot.id];
    if (statusOf(review) === 'closed') {
      closedCount += 1;
      if (review.disposition === 'destroy') {
        destroyedCount += 1;
      }
    } else {
      openCount += 1;
    }
    utilSum += (cumulativeTorMin(lot) / lot.stabilityBudgetMin) * 100;
  }
  const meanUtilPct =
    laneLots.length === 0 ? 0 : Math.round(utilSum / laneLots.length);
  const score =
    openCount * 2 +
    (meanUtilPct >= 85 ? 2 : meanUtilPct >= 60 ? 1 : 0) +
    destroyedCount;
  const grade = score <= 1 ? 'A' : score <= 3 ? 'B' : score <= 5 ? 'C' : 'D';
  return {lane, openCount, closedCount, meanUtilPct, destroyedCount, grade};
}

// ============= TEMPLATE CSS =============
// Density grid, verbatim: rail 280 · queue rows min 76 · chart viewBox
// 700×220 · metric tiles min 72 · tree gate rows min 64 · outcome cards
// min 96 · signoff gate min 220 · lane table rows 44 · buttons >=40px
// hit height.
const TEMPLATE_CSS = \`
.tpl-cold-chain-excursion-console {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-cold-chain-excursion-console .cce-main {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr); /* rail 280 */
  height: 100%;
  min-height: 0;
}
.tpl-cold-chain-excursion-console .cce-rail {
  min-height: 0;
  overflow-y: auto;
  border-inline-end: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
}
.tpl-cold-chain-excursion-console .cce-work {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
/* ---- header ---- */
.tpl-cold-chain-excursion-console .cce-header-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1;
}
.tpl-cold-chain-excursion-console .cce-brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tpl-cold-chain-excursion-console .cce-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* ---- queue rail: rows min 76 ---- */
.tpl-cold-chain-excursion-console .cce-rail-head {
  padding: var(--spacing-3) var(--spacing-3) var(--spacing-2);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.tpl-cold-chain-excursion-console .cce-queue-row {
  appearance: none;
  background: none;
  border: none;
  border-block-end: var(--border-width) solid var(--color-border);
  font: inherit;
  color: inherit;
  text-align: start;
  width: 100%;
  min-height: 76px; /* queue rows min 76 */
  padding: 10px var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}
.tpl-cold-chain-excursion-console .cce-queue-row[aria-pressed="true"] {
  background: \${ACCENT_WASH};
  box-shadow: inset 3px 0 0 0 \${ACCENT};
}
.tpl-cold-chain-excursion-console .cce-queue-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-queue-code {
  font-family: \${MONO_FONT};
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-queue-product {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-queue-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-peak-heat { color: \${HEAT}; font-weight: 600; }
.tpl-cold-chain-excursion-console .cce-peak-freeze { color: \${FREEZE}; font-weight: 600; }
/* TOR budget bar: 6px track, fill % from an inline width. */
.tpl-cold-chain-excursion-console .cce-torbar {
  display: block;
  height: 6px;
  border-radius: 999px;
  background: var(--color-border);
  overflow: hidden;
  width: 100%;
}
.tpl-cold-chain-excursion-console .cce-torbar-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
}
/* ---- cards ---- */
.tpl-cold-chain-excursion-console .cce-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-cold-chain-excursion-console .cce-card-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-card-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
/* ---- chart ---- */
.tpl-cold-chain-excursion-console .cce-chart-svg {
  width: 100%;
  height: auto;
  display: block;
}
.tpl-cold-chain-excursion-console .cce-scrub-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-scrub {
  flex: 1;
  min-width: 180px;
  height: 40px; /* >=40px hit height */
  margin: 0;
  accent-color: \${ACCENT};
}
.tpl-cold-chain-excursion-console .cce-scrub-readout {
  font-family: \${MONO_FONT};
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  min-width: 220px;
}
.tpl-cold-chain-excursion-console .cce-readout-heat { color: \${HEAT}; }
.tpl-cold-chain-excursion-console .cce-readout-freeze { color: \${FREEZE}; }
/* ---- metrics strip: tiles min 72 ---- */
.tpl-cold-chain-excursion-console .cce-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-3);
}
.tpl-cold-chain-excursion-console .cce-metric {
  min-height: 72px; /* metric tiles min 72 */
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  box-sizing: border-box;
}
.tpl-cold-chain-excursion-console .cce-metric-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.tpl-cold-chain-excursion-console .cce-metric-value {
  font-size: 19px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.tpl-cold-chain-excursion-console .cce-metric-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
/* ---- decision row: tree 1.2fr / gate 0.8fr ---- */
.tpl-cold-chain-excursion-console .cce-decision-row {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: var(--spacing-3);
  align-items: start;
}
/* Tree gate rows: min 64, connector spine on the left. */
.tpl-cold-chain-excursion-console .cce-gate {
  min-height: 64px; /* tree gate rows min 64 */
  display: flex;
  gap: var(--spacing-2);
  padding: 8px 0;
  position: relative;
}
.tpl-cold-chain-excursion-console .cce-gate-spine {
  flex: none;
  width: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.tpl-cold-chain-excursion-console .cce-gate-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--color-border);
  background: transparent;
  flex: none;
  margin-top: 4px;
}
.tpl-cold-chain-excursion-console .cce-gate-on .cce-gate-dot {
  border-color: \${ACCENT};
  background: \${ACCENT};
}
.tpl-cold-chain-excursion-console .cce-gate-line {
  flex: 1;
  width: 2px;
  background: var(--color-border);
  margin-top: 2px;
}
.tpl-cold-chain-excursion-console .cce-gate-on .cce-gate-line {
  background: \${ACCENT};
}
.tpl-cold-chain-excursion-console .cce-gate-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.tpl-cold-chain-excursion-console .cce-gate-q {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.35;
}
.tpl-cold-chain-excursion-console .cce-gate-detail {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-gate-off .cce-gate-q,
.tpl-cold-chain-excursion-console .cce-gate-off .cce-gate-detail {
  color: var(--color-text-secondary);
  opacity: 0.7;
}
.tpl-cold-chain-excursion-console .cce-gate-answer {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
/* ---- outcome cards: min 96 ---- */
.tpl-cold-chain-excursion-console .cce-outcomes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-2);
}
.tpl-cold-chain-excursion-console .cce-outcome {
  appearance: none;
  background: none;
  font: inherit;
  color: inherit;
  text-align: start;
  min-height: 96px; /* outcome cards min 96 */
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  box-sizing: border-box;
}
.tpl-cold-chain-excursion-console .cce-outcome:disabled {
  cursor: default;
  opacity: 0.6;
}
.tpl-cold-chain-excursion-console .cce-outcome-name {
  font-size: 13px;
  font-weight: 700;
}
.tpl-cold-chain-excursion-console .cce-outcome-blurb {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.tpl-cold-chain-excursion-console .cce-outcome-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
/* ---- signoff gate: min 220 ---- */
.tpl-cold-chain-excursion-console .cce-gatecard {
  min-height: 220px; /* signoff gate min 220 */
}
.tpl-cold-chain-excursion-console .cce-gatecard-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 12.5px;
  flex-wrap: wrap;
}
.tpl-cold-chain-excursion-console .cce-deviation {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  border: var(--border-width) dashed \${HOLD};
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-deviation-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: \${HOLD};
}
.tpl-cold-chain-excursion-console .cce-signed {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  padding: 10px;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-signed-line {
  font-family: \${MONO_FONT};
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.tpl-cold-chain-excursion-console .cce-gate-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-wrap: wrap;
}
/* ---- lane risk table: rows 44 ---- */
.tpl-cold-chain-excursion-console .cce-table-scroll { overflow-x: auto; }
.tpl-cold-chain-excursion-console .cce-table {
  width: 100%;
  min-width: 520px;
  border-collapse: collapse;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-table th {
  text-align: start;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
  padding: 6px 10px;
  border-block-end: var(--border-width) solid var(--color-border);
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-table td {
  height: 44px; /* lane table rows 44 */
  padding: 0 10px;
  border-block-end: var(--border-width) solid var(--color-border);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-cold-chain-excursion-console .cce-table tr:last-child td {
  border-block-end: none;
}
.tpl-cold-chain-excursion-console .cce-lane-label {
  font-family: \${MONO_FONT};
  font-weight: 600;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-grade {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
}
.tpl-cold-chain-excursion-console .cce-grade-A { background: light-dark(rgba(21,128,61,0.14), rgba(74,222,128,0.18)); color: \${RELEASE}; }
.tpl-cold-chain-excursion-console .cce-grade-B { background: \${ACCENT_WASH}; color: \${ACCENT}; }
.tpl-cold-chain-excursion-console .cce-grade-C { background: light-dark(rgba(180,83,9,0.14), rgba(252,211,77,0.18)); color: \${HOLD}; }
.tpl-cold-chain-excursion-console .cce-grade-D { background: light-dark(rgba(185,28,28,0.12), rgba(248,113,113,0.18)); color: \${HEAT}; }
/* ---- shared ---- */
.tpl-cold-chain-excursion-console button:focus-visible,
.tpl-cold-chain-excursion-console input:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.tpl-cold-chain-excursion-console .cce-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
@media (prefers-reduced-motion: no-preference) {
  .tpl-cold-chain-excursion-console .cce-outcome,
  .tpl-cold-chain-excursion-console .cce-gate-dot {
    transition: border-color 160ms ease, background-color 160ms ease,
      box-shadow 160ms ease;
  }
}
/* <=920px: rail stacks above the workbench; single page scroll. */
@media (max-width: 920px) {
  .tpl-cold-chain-excursion-console .cce-main {
    display: block;
    overflow-y: auto;
  }
  .tpl-cold-chain-excursion-console .cce-rail {
    overflow-y: visible;
    height: auto;
    border-inline-end: none;
    border-block-end: var(--border-width) solid var(--color-border);
  }
  .tpl-cold-chain-excursion-console .cce-work {
    overflow-y: visible;
    height: auto;
  }
  .tpl-cold-chain-excursion-console .cce-decision-row {
    grid-template-columns: minmax(0, 1fr);
  }
}
/* <=560px (390 embed): metrics 2×2; outcomes stack; header sheds sub. */
@media (max-width: 560px) {
  .tpl-cold-chain-excursion-console .cce-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tpl-cold-chain-excursion-console .cce-outcomes {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-cold-chain-excursion-console .cce-brand-sub {
    display: none;
  }
}
\`;

// ============= BRAND MARK =============
// Frostline mark: a six-arm frost crystal inside a thermometer arc — the
// crystal strokes in the accent, ring in currentColor so it themes with
// the header text.
function FrostlineMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.45"
      />
      <g fill="none" style={{stroke: ACCENT}} strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 5.5v13" />
        <path d="M6.4 8.7l11.2 6.6" />
        <path d="M17.6 8.7L6.4 15.3" />
        <path d="M12 5.5l-1.8 1.9M12 5.5l1.8 1.9" />
        <path d="M12 18.5l-1.8-1.9M12 18.5l1.8-1.9" />
      </g>
    </svg>
  );
}

// ============= EXCURSION CHART =============
// Custom SVG trace, viewBox 700×220 (scales to its column). Fixed y
// domain −2…18 °C covers every fixture (peak 16.2, dip −0.8). The keep
// band 2–8 °C is a tinted rect; the hard ceiling is a dashed rule; heat
// readings paint HEAT dots, freeze dips paint FREEZE dots; a telemetry
// gap renders that segment dashed. The scrub hairline is driven by the
// parent's scrubIndex (range input below the chart — keyboard-first).

const CHART_W = 700;
const CHART_H = 220;
const CHART_PAD = {top: 12, right: 14, bottom: 26, left: 40};
const T_MIN = -2;
const T_MAX = 18;

function chartX(index: number, count: number): number {
  const innerW = CHART_W - CHART_PAD.left - CHART_PAD.right;
  return CHART_PAD.left + (count <= 1 ? 0 : (index / (count - 1)) * innerW);
}

function chartY(temp: number): number {
  const innerH = CHART_H - CHART_PAD.top - CHART_PAD.bottom;
  return CHART_PAD.top + ((T_MAX - temp) / (T_MAX - T_MIN)) * innerH;
}

interface ExcursionChartProps {
  lot: ExcursionLot;
  scrubIndex: number;
}

function ExcursionChart({lot, scrubIndex}: ExcursionChartProps) {
  const count = lot.tempsC.length;
  const gridTemps = [0, 5, 10, 15];
  // Split the polyline at the telemetry gap so the missing stretch draws
  // dashed instead of pretending the trace is contiguous.
  const segments: Array<{points: string; dashed: boolean}> = [];
  if (lot.gapAfterIndex === null) {
    segments.push({
      points: lot.tempsC
        .map((temp, index) => \`\${chartX(index, count)},\${chartY(temp)}\`)
        .join(' '),
      dashed: false,
    });
  } else {
    const cut = lot.gapAfterIndex;
    segments.push({
      points: lot.tempsC
        .slice(0, cut + 1)
        .map((temp, index) => \`\${chartX(index, count)},\${chartY(temp)}\`)
        .join(' '),
      dashed: false,
    });
    segments.push({
      points: [cut, cut + 1]
        .map(index => \`\${chartX(index, count)},\${chartY(lot.tempsC[index])}\`)
        .join(' '),
      dashed: true,
    });
    segments.push({
      points: lot.tempsC
        .slice(cut + 1)
        .map(
          (temp, index) =>
            \`\${chartX(index + cut + 1, count)},\${chartY(temp)}\`,
        )
        .join(' '),
      dashed: false,
    });
  }
  const peakIndex = lot.tempsC.indexOf(peakC(lot));
  const scrubTemp = lot.tempsC[scrubIndex];

  return (
    <svg
      className="cce-chart-svg"
      viewBox={\`0 0 \${CHART_W} \${CHART_H}\`}
      role="img"
      aria-label={\`Temperature trace for \${lot.lotCode}: \${count} readings every \${lot.sampleIntervalMin} minutes from \${lot.startClock}, peak \${formatTemp(peakC(lot))}, low \${formatTemp(minC(lot))}, keep band 2 to 8 degrees.\`}>
      {/* keep band 2–8 °C */}
      <rect
        x={CHART_PAD.left}
        y={chartY(BAND_HIGH_C)}
        width={CHART_W - CHART_PAD.left - CHART_PAD.right}
        height={chartY(BAND_LOW_C) - chartY(BAND_HIGH_C)}
        style={{fill: BAND_WASH}}
      />
      {/* horizontal grid + labels */}
      {gridTemps.map(temp => (
        <g key={temp}>
          <line
            x1={CHART_PAD.left}
            x2={CHART_W - CHART_PAD.right}
            y1={chartY(temp)}
            y2={chartY(temp)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
          <text
            x={CHART_PAD.left - 6}
            y={chartY(temp) + 3.5}
            textAnchor="end"
            fontSize="10"
            fill="var(--color-text-secondary)"
            style={{fontVariantNumeric: 'tabular-nums'}}>
            {temp}°
          </text>
        </g>
      ))}
      {/* band edges */}
      {[BAND_LOW_C, BAND_HIGH_C].map(temp => (
        <line
          key={temp}
          x1={CHART_PAD.left}
          x2={CHART_W - CHART_PAD.right}
          y1={chartY(temp)}
          y2={chartY(temp)}
          style={{stroke: ACCENT}}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}
      {/* hard ceiling */}
      <line
        x1={CHART_PAD.left}
        x2={CHART_W - CHART_PAD.right}
        y1={chartY(lot.hardCeilingC)}
        y2={chartY(lot.hardCeilingC)}
        style={{stroke: HEAT}}
        strokeWidth="1.2"
        strokeDasharray="5 4"
      />
      <text
        x={CHART_W - CHART_PAD.right}
        y={chartY(lot.hardCeilingC) - 4}
        textAnchor="end"
        fontSize="9.5"
        style={{fill: HEAT}}>
        hard ceiling {lot.hardCeilingC.toFixed(1)}°
      </text>
      {/* x ticks: first, peak, last reading clocks */}
      {[0, peakIndex, count - 1]
        .filter((value, index, all) => all.indexOf(value) === index)
        .map(index => (
          <text
            key={index}
            x={chartX(index, count)}
            y={CHART_H - 8}
            textAnchor="middle"
            fontSize="9.5"
            fill="var(--color-text-secondary)"
            style={{fontVariantNumeric: 'tabular-nums'}}>
            {readingClock(lot, index)}
          </text>
        ))}
      {/* trace segments */}
      {segments.map((segment, index) => (
        <polyline
          key={index}
          points={segment.points}
          fill="none"
          style={{stroke: ACCENT}}
          strokeWidth="2"
          strokeDasharray={segment.dashed ? '3 5' : undefined}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {/* per-reading dots, state-colored */}
      {lot.tempsC.map((temp, index) => {
        const out =
          temp > BAND_HIGH_C ? 'heat' : temp < BAND_LOW_C ? 'freeze' : null;
        return (
          <circle
            key={index}
            cx={chartX(index, count)}
            cy={chartY(temp)}
            r={out === null ? 2 : 3.4}
            style={{
              fill:
                out === 'heat'
                  ? HEAT
                  : out === 'freeze'
                    ? FREEZE
                    : 'var(--color-text-secondary)',
            }}
          />
        );
      })}
      {/* peak flag */}
      <text
        x={chartX(peakIndex, count)}
        y={chartY(peakC(lot)) - 8}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        style={{fill: HEAT, fontVariantNumeric: 'tabular-nums'}}>
        peak {peakC(lot).toFixed(1)}°
      </text>
      {/* scrub hairline + halo */}
      <line
        x1={chartX(scrubIndex, count)}
        x2={chartX(scrubIndex, count)}
        y1={CHART_PAD.top}
        y2={CHART_H - CHART_PAD.bottom}
        style={{stroke: ACCENT}}
        strokeWidth="1"
        strokeDasharray="2 3"
      />
      <circle
        cx={chartX(scrubIndex, count)}
        cy={chartY(scrubTemp)}
        r="5.5"
        fill="none"
        style={{stroke: ACCENT}}
        strokeWidth="1.6"
      />
    </svg>
  );
}

// ============= STATUS BADGES =============

const STATUS_BADGE: Record<
  LotStatus,
  {label: string; variant: 'warning' | 'info' | 'neutral'}
> = {
  open: {label: 'open', variant: 'warning'},
  'pending-qa': {label: 'pending QA', variant: 'info'},
  closed: {label: 'closed', variant: 'neutral'},
};

// ============= PAGE =============

export default function ColdChainExcursionConsoleTemplate() {
  const toast = useToast();

  // One state owner: per-lot review records. Queue chips, the gate, and
  // the lane risk table all derive from this map.
  const [reviews, setReviews] = useState<Record<string, LotReview>>(
    initialReviews,
  );
  const [selectedLotId, setSelectedLotId] = useState<string>('lot-0412');
  const [scrubByLot, setScrubByLot] = useState<Record<string, number>>({});
  const [signoffCount, setSignoffCount] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const lot = lotOf(selectedLotId);
  const review = reviews[selectedLotId];
  const status = statusOf(review);
  const evaluation = evaluateTree(lot);
  const scrubIndex = Math.min(
    scrubByLot[selectedLotId] ?? lot.tempsC.indexOf(peakC(lot)),
    lot.tempsC.length - 1,
  );
  const scrubTemp = lot.tempsC[scrubIndex];
  const scrubState =
    scrubTemp > BAND_HIGH_C
      ? 'above band'
      : scrubTemp < BAND_LOW_C
        ? 'below band'
        : 'in band';

  const openCount = LOTS.filter(
    entry => statusOf(reviews[entry.id]) !== 'closed',
  ).length;

  const isOverride =
    review.disposition !== null &&
    review.disposition !== evaluation.recommended;
  const needsReason = isOverride && review.deviationReason === null;
  const canSign = review.disposition !== null && !needsReason && !review.signedOff;

  // ---- mutations ----

  const chooseDisposition = (disposition: Disposition) => {
    if (review.signedOff) {
      return;
    }
    const nowOverride = disposition !== evaluation.recommended;
    setReviews(prev => ({
      ...prev,
      [selectedLotId]: {
        ...prev[selectedLotId],
        disposition,
        // A recommendation-matching choice never carries a stale reason.
        deviationReason: nowOverride
          ? prev[selectedLotId].deviationReason
          : null,
      },
    }));
    setAnnouncement(
      \`\${lot.lotCode}: \${DISPOSITION_META[disposition].label} selected\${
        nowOverride
          ? ' — deviation from the recommended path; rationale required before signoff'
          : ' — matches the recommended path'
      }.\`,
    );
  };

  const chooseReason = (reason: string) => {
    setReviews(prev => ({
      ...prev,
      [selectedLotId]: {...prev[selectedLotId], deviationReason: reason},
    }));
    setAnnouncement(\`\${lot.lotCode}: deviation rationale recorded.\`);
  };

  const signOff = () => {
    if (!canSign || review.disposition === null) {
      if (needsReason) {
        toast({
          body: \`\${lot.lotCode}: override needs a deviation rationale before QA can sign.\`,
          isAutoHide: true,
        });
      }
      return;
    }
    const stamped = formatClock(
      SIGNOFF_CLOCK_START + signoffCount * SIGNOFF_CLOCK_STEP,
    );
    const chosen = review.disposition;
    setReviews(prev => ({
      ...prev,
      [selectedLotId]: {
        ...prev[selectedLotId],
        signedOff: true,
        signedClock: stamped,
      },
    }));
    setSignoffCount(prev => prev + 1);
    toast({
      body: \`\${lot.lotCode} \${DISPOSITION_META[chosen].verb} — signed \${stamped} by \${QA_REVIEWER}.\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${lot.lotCode} closed: \${DISPOSITION_META[chosen].verb}, signed at \${stamped}. Lane risk table updated.\`,
    );
  };

  const reopen = () => {
    setReviews(prev => ({
      ...prev,
      [selectedLotId]: {
        ...prev[selectedLotId],
        signedOff: false,
        signedClock: null,
      },
    }));
    toast({body: \`\${lot.lotCode} reopened for QA review.\`, isAutoHide: true});
    setAnnouncement(\`\${lot.lotCode} reopened. Lane risk table updated.\`);
  };

  const selectLot = (lotId: string) => {
    setSelectedLotId(lotId);
    const nextLot = lotOf(lotId);
    setAnnouncement(
      \`Reviewing \${nextLot.lotCode}: recommended \${
        DISPOSITION_META[evaluateTree(nextLot).recommended].label
      }.\`,
    );
  };

  // ---- render ----

  return (
    <div className="tpl-cold-chain-excursion-console">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="cce-header-row">
              <div className="cce-brand">
                <FrostlineMark />
                <div>
                  <div className="cce-brand-name">
                    <h1 className="cce-vh">
                      Frostline cold chain excursion console
                    </h1>
                    <span aria-hidden>Frostline</span>
                  </div>
                  <div className="cce-brand-sub">
                    QA disposition desk · Regional cold hub CH-04 · keep band
                    2–8 °C
                  </div>
                </div>
              </div>
              <Badge
                label={\`\${openCount} of \${LOTS.length} lots unresolved\`}
                variant={openCount === 0 ? 'success' : 'warning'}
              />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="cce-vh">
              {announcement}
            </div>
            <div className="cce-main">
              {/* ============ LOT QUEUE RAIL ============ */}
              <nav className="cce-rail" aria-label="Excursion lot queue">
                <div className="cce-rail-head">
                  Excursion queue — oldest first
                </div>
                {LOTS.map(entry => {
                  const entryReview = reviews[entry.id];
                  const entryStatus = statusOf(entryReview);
                  const badge = STATUS_BADGE[entryStatus];
                  const util = Math.round(
                    (cumulativeTorMin(entry) / entry.stabilityBudgetMin) * 100,
                  );
                  const froze = hasFreezeBreach(entry);
                  return (
                    <button
                      key={entry.id}
                      type="button"
                      className="cce-queue-row"
                      aria-pressed={entry.id === selectedLotId}
                      onClick={() => selectLot(entry.id)}>
                      <span className="cce-queue-top">
                        <span className="cce-queue-code">{entry.lotCode}</span>
                        <Badge label={badge.label} variant={
                          entryStatus === 'closed' &&
                          entryReview.disposition === 'release'
                            ? 'success'
                            : entryStatus === 'closed' &&
                                entryReview.disposition === 'destroy'
                              ? 'error'
                              : badge.variant
                        } />
                      </span>
                      <span className="cce-queue-product">
                        {entry.product}
                      </span>
                      <span className="cce-queue-meta">
                        <span>{laneOf(entry.laneId).label}</span>
                        <span
                          className={
                            froze ? 'cce-peak-freeze' : 'cce-peak-heat'
                          }>
                          {froze
                            ? \`low \${formatTemp(minC(entry))}\`
                            : \`peak \${formatTemp(peakC(entry))}\`}
                        </span>
                        <span>
                          TOR {cumulativeTorMin(entry)}/
                          {entry.stabilityBudgetMin} min
                        </span>
                      </span>
                      <span
                        className="cce-torbar"
                        role="img"
                        aria-label={\`Stability budget \${Math.min(util, 999)} percent used\`}>
                        <span
                          className="cce-torbar-fill"
                          style={{
                            width: \`\${Math.min(util, 100)}%\`,
                            background:
                              util > 100 ? HEAT : util >= 70 ? HOLD : RELEASE,
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* ============ WORKBENCH ============ */}
              <div className="cce-work">
                {/* ---- excursion chart ---- */}
                <section className="cce-card" aria-label="Excursion trace">
                  <h2 className="cce-card-title">
                    {lot.lotCode} — {lot.product}
                    <Badge
                      label={STATUS_BADGE[status].label}
                      variant={
                        status === 'closed' &&
                        review.disposition === 'release'
                          ? 'success'
                          : status === 'closed' &&
                              review.disposition === 'destroy'
                            ? 'error'
                            : STATUS_BADGE[status].variant
                      }
                    />
                  </h2>
                  <div className="cce-card-sub">
                    {laneOf(lot.laneId).label} ·{' '}
                    {laneOf(lot.laneId).mode} · {laneOf(lot.laneId).carrier} ·
                    sensor {lot.sensor} · {lot.quantity}
                    {lot.gapNote !== null && \` · ⚠ \${lot.gapNote}\`}
                  </div>
                  <ExcursionChart lot={lot} scrubIndex={scrubIndex} />
                  <div className="cce-scrub-row">
                    <input
                      type="range"
                      className="cce-scrub"
                      min={0}
                      max={lot.tempsC.length - 1}
                      step={1}
                      value={scrubIndex}
                      aria-label={\`Scrub trace readings for \${lot.lotCode}\`}
                      aria-valuetext={\`\${readingClock(lot, scrubIndex)}, \${formatTemp(scrubTemp)}, \${scrubState}\`}
                      onChange={event =>
                        setScrubByLot(prev => ({
                          ...prev,
                          [selectedLotId]: Number(event.target.value),
                        }))
                      }
                    />
                    <span
                      className={\`cce-scrub-readout\${
                        scrubTemp > BAND_HIGH_C
                          ? ' cce-readout-heat'
                          : scrubTemp < BAND_LOW_C
                            ? ' cce-readout-freeze'
                            : ''
                      }\`}
                      aria-hidden>
                      {readingClock(lot, scrubIndex)} · t+
                      {scrubIndex * lot.sampleIntervalMin} min ·{' '}
                      {formatTemp(scrubTemp)} · {scrubState}
                    </span>
                  </div>
                </section>

                {/* ---- metrics strip ---- */}
                <section
                  className="cce-metrics"
                  aria-label="Excursion metrics">
                  <div className="cce-metric">
                    <span className="cce-metric-label">Peak / low</span>
                    <span className="cce-metric-value">
                      {peakC(lot).toFixed(1)}° / {minC(lot).toFixed(1)}°
                    </span>
                    <span className="cce-metric-sub">
                      ceiling {lot.hardCeilingC.toFixed(1)}° ·{' '}
                      {lot.freezeSensitive
                        ? 'freeze-sensitive'
                        : 'freeze-tolerant'}
                    </span>
                  </div>
                  <div className="cce-metric">
                    <span className="cce-metric-label">Event TOR</span>
                    <span className="cce-metric-value">
                      {eventTorMin(lot)} min
                    </span>
                    <span className="cce-metric-sub">
                      readings above 8.0° × {lot.sampleIntervalMin}-min
                      interval
                    </span>
                  </div>
                  <div className="cce-metric">
                    <span className="cce-metric-label">Cumulative TOR</span>
                    <span className="cce-metric-value">
                      {cumulativeTorMin(lot)}/{lot.stabilityBudgetMin} min
                    </span>
                    <span className="cce-metric-sub">
                      {lot.priorTorMin} min from earlier legs
                    </span>
                  </div>
                  <div className="cce-metric">
                    <span className="cce-metric-label">Samples</span>
                    <span className="cce-metric-value">
                      {lot.tempsC.length}
                    </span>
                    <span className="cce-metric-sub">
                      from {lot.startClock} ·{' '}
                      {lot.gapAfterIndex === null
                        ? 'contiguous'
                        : 'telemetry gap'}
                    </span>
                  </div>
                </section>

                {/* ---- decision tree + QA gate ---- */}
                <div className="cce-decision-row">
                  <section
                    className="cce-card"
                    aria-label="Disposition decision tree">
                    <h2 className="cce-card-title">
                      Disposition decision tree
                      <Badge
                        label={\`recommends \${DISPOSITION_META[evaluation.recommended].label}\`}
                        variant={
                          evaluation.recommended === 'release'
                            ? 'success'
                            : evaluation.recommended === 'hold'
                              ? 'warning'
                              : 'error'
                        }
                      />
                    </h2>
                    <div>
                      {/* Visited gates light the spine; gates after the
                          exit render dimmed so the whole rubric stays
                          legible. */}
                      {GATES.map((gate, index) => {
                        const entry = evaluation.answers.find(
                          answer => answer.gate.id === gate.id,
                        );
                        const isVisited = entry !== undefined;
                        return (
                          <div
                            key={gate.id}
                            className={\`cce-gate \${
                              isVisited ? 'cce-gate-on' : 'cce-gate-off'
                            }\`}>
                            <span className="cce-gate-spine" aria-hidden>
                              <span className="cce-gate-dot" />
                              {index < GATES.length - 1 && (
                                <span className="cce-gate-line" />
                              )}
                            </span>
                            <span className="cce-gate-body">
                              <span className="cce-gate-q">
                                {gate.question}
                              </span>
                              {isVisited ? (
                                <>
                                  <span className="cce-gate-detail">
                                    {entry.detail}
                                  </span>
                                  <span
                                    className="cce-gate-answer"
                                    style={{
                                      color: entry.isExit
                                        ? DISPOSITION_META[gate.exitOutcome]
                                            .color
                                        : ACCENT,
                                    }}>
                                    {entry.answer.toUpperCase()}
                                    {entry.isExit
                                      ? \` — exits: \${DISPOSITION_META[gate.exitOutcome].label.toUpperCase()}\`
                                      : ' — continue'}
                                  </span>
                                </>
                              ) : (
                                <span className="cce-gate-detail">
                                  not reached — tree exited above
                                </span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                      {evaluation.answers.length === GATES.length &&
                        !evaluation.answers[GATES.length - 1].isExit && (
                          <div className="cce-gate cce-gate-on">
                            <span className="cce-gate-spine" aria-hidden>
                              <span className="cce-gate-dot" />
                            </span>
                            <span className="cce-gate-body">
                              <span className="cce-gate-q">
                                Budget exceeded with incomplete telemetry
                              </span>
                              <span
                                className="cce-gate-answer"
                                style={{color: HEAT}}>
                                FALL-THROUGH — exits: DESTROY
                              </span>
                            </span>
                          </div>
                        )}
                    </div>
                    <div
                      className="cce-outcomes"
                      role="group"
                      aria-label="Choose disposition">
                      {DISPOSITIONS.map(disposition => {
                        const meta = DISPOSITION_META[disposition];
                        const isRecommended =
                          disposition === evaluation.recommended;
                        const isChosen = review.disposition === disposition;
                        return (
                          <button
                            key={disposition}
                            type="button"
                            className="cce-outcome"
                            aria-pressed={isChosen}
                            disabled={review.signedOff}
                            style={
                              isChosen
                                ? {
                                    borderColor: meta.color,
                                    boxShadow: \`inset 0 0 0 1px \${meta.color}\`,
                                  }
                                : undefined
                            }
                            onClick={() => chooseDisposition(disposition)}>
                            <span
                              className="cce-outcome-name"
                              style={{color: meta.color}}>
                              {meta.label}
                            </span>
                            <span className="cce-outcome-blurb">
                              {meta.blurb}
                            </span>
                            <span
                              className="cce-outcome-tag"
                              style={{
                                color: isRecommended
                                  ? ACCENT
                                  : 'var(--color-text-secondary)',
                              }}>
                              {isChosen && isRecommended
                                ? 'chosen · recommended'
                                : isChosen
                                  ? 'chosen · deviation'
                                  : isRecommended
                                    ? 'recommended'
                                    : '\xA0'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* ---- QA signoff gate ---- */}
                  <section
                    className="cce-card cce-gatecard"
                    aria-label="QA signoff gate">
                    <h2 className="cce-card-title">
                      <Icon
                        icon={review.signedOff ? LockIcon : UnlockIcon}
                        size="sm"
                        color="secondary"
                      />
                      QA signoff gate
                    </h2>
                    <div className="cce-gatecard-status">
                      {review.disposition === null ? (
                        <span className="cce-card-sub">
                          Choose a disposition on the tree to arm the gate.
                        </span>
                      ) : (
                        <>
                          <span
                            style={{
                              color:
                                DISPOSITION_META[review.disposition].color,
                              fontWeight: 700,
                            }}>
                            {DISPOSITION_META[review.disposition].label}
                          </span>
                          <span className="cce-card-sub">
                            {isOverride
                              ? \`deviates from recommended \${DISPOSITION_META[evaluation.recommended].label}\`
                              : 'matches the recommended path'}
                          </span>
                        </>
                      )}
                    </div>

                    {isOverride && !review.signedOff && (
                      <div className="cce-deviation">
                        <span className="cce-deviation-title">
                          <Icon
                            icon={TriangleAlertIcon}
                            size="xsm"
                            color="inherit"
                          />
                          Deviation rationale required
                        </span>
                        <Selector
                          label="Rationale"
                          size="sm"
                          placeholder="Select a documented rationale"
                          options={DEVIATION_REASONS.map(reason => ({
                            value: reason.value,
                            label: reason.label,
                          }))}
                          value={review.deviationReason ?? undefined}
                          onChange={value => chooseReason(String(value))}
                        />
                      </div>
                    )}

                    {review.signedOff &&
                    review.disposition !== null &&
                    review.signedClock !== null ? (
                      <div className="cce-signed">
                        <span>
                          <Icon icon={CheckIcon} size="xsm" color="inherit" />{' '}
                          Lot {DISPOSITION_META[review.disposition].verb}.
                        </span>
                        <span className="cce-signed-line">
                          signed {review.signedClock} · {QA_REVIEWER}
                        </span>
                        {review.deviationReason !== null && (
                          <span className="cce-signed-line">
                            deviation:{' '}
                            {DEVIATION_REASONS.find(
                              reason =>
                                reason.value === review.deviationReason,
                            )?.label ?? review.deviationReason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="cce-card-sub">
                        Signing closes the lot, stamps the register, and
                        re-grades the lane risk table below.
                      </span>
                    )}

                    <div className="cce-gate-actions">
                      {review.signedOff ? (
                        <Button
                          label="Reopen lot"
                          variant="ghost"
                          size="sm"
                          icon={<Icon icon={RotateCcwIcon} size="sm" />}
                          onClick={reopen}
                        />
                      ) : (
                        <Button
                          label={\`Sign as QA — \${QA_REVIEWER}\`}
                          variant="primary"
                          size="sm"
                          icon={<Icon icon={PenLineIcon} size="sm" />}
                          isDisabled={!canSign}
                          onClick={signOff}
                        />
                      )}
                      {needsReason && (
                        <span className="cce-card-sub" role="status">
                          gate locked — rationale missing
                        </span>
                      )}
                    </div>
                  </section>
                </div>

                {/* ---- lane risk table ---- */}
                <section className="cce-card" aria-label="Lane risk">
                  <h2 className="cce-card-title">
                    Lane risk — re-grades as lots close
                  </h2>
                  <div className="cce-table-scroll">
                    <table className="cce-table">
                      <thead>
                        <tr>
                          <th scope="col">Lane</th>
                          <th scope="col">Mode / carrier</th>
                          <th scope="col">Ship 30d</th>
                          <th scope="col">Unresolved</th>
                          <th scope="col">Closed</th>
                          <th scope="col">Mean TOR util</th>
                          <th scope="col">Grade</th>
                        </tr>
                      </thead>
                      <tbody>
                        {LANES.map(lane => {
                          const risk = laneRisk(lane, reviews);
                          return (
                            <tr key={lane.id}>
                              <td>
                                <span className="cce-lane-label">
                                  {lane.label}
                                </span>
                              </td>
                              <td>
                                {lane.mode} · {lane.carrier}
                              </td>
                              <td>{lane.shipments30d}</td>
                              <td>
                                {risk.openCount === 0 ? (
                                  '—'
                                ) : (
                                  <span style={{color: HOLD, fontWeight: 600}}>
                                    {risk.openCount}
                                  </span>
                                )}
                              </td>
                              <td>
                                {risk.closedCount}
                                {risk.destroyedCount > 0 &&
                                  \` (\${risk.destroyedCount} destroyed)\`}
                              </td>
                              <td>{risk.meanUtilPct}%</td>
                              <td>
                                <span
                                  className={\`cce-grade cce-grade-\${risk.grade}\`}>
                                  {risk.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <span className="cce-card-sub">
                    Grade = 2 pts per unresolved excursion + budget-pressure
                    pts (mean TOR utilisation ≥ 85% → 2, ≥ 60% → 1) + 1 pt per
                    destroyed lot. A 0–1 · B 2–3 · C 4–5 · D 6+.
                  </span>
                </section>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};