var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Deckload build sheet for Meridian
 *   Cargo flight MC 482 (ORD → ANC, B767-300F, tail N417MC, cutoff 14:45L,
 *   job date Thu Jul 9 — all fixed strings). Aircraft constants: OEW
 *   86,000 kg at arm 24.22 m (LEMAC 22.60 m + 27% of the 6.00 m MAC), MZFW
 *   140,000 kg, max payload 54,000 kg. Sixteen positions: main deck P1–P10
 *   (PMC pallets, arms 7–43 m at 4 m pitch; P1/P10 tapered-zone limit
 *   4,500 kg, P2–P9 limit 7,200 kg) and lower deck AKE positions L1–L3
 *   (fwd hold, arms 10/13/16 m) + L4–L6 (aft hold, arms 33/36/39 m), all
 *   limited to the AKE max gross 1,588 kg. Twelve shipments, five pre-built:
 *   4,860 + 3,240 + 5,410 + 4,150 + 1,420 = 19,080 kg placed; seven queued:
 *   2,640 + 1,980 + 1,420 + 310 + 6,850 + 1,180 + 940 = 15,320 kg
 *   (34,400 kg if fully built — under the 54,000 kg ceiling by design).
 *   Opening balance cross-checked by hand: OEW moment 86,000 × 24.22 =
 *   2,082,920; placement moments 4,860×19 + 3,240×27 + 5,410×23 + 4,150×31
 *   + 1,420×13 = 92,340 + 87,480 + 124,430 + 128,650 + 18,460 = 451,360;
 *   ZFW 105,080 kg at arm 2,534,280 / 105,080 = 24.1175 m = 25.3 %MAC —
 *   inside the interpolated limits 12.1 (fwd) / 30.6 (aft) at that weight.
 *   AWB prefix 618 and carrier rule id MC-DG-12 are invented; the class
 *   3 ↔ 5.1 segregation row paraphrases IATA DGR Table 9.3.A. No clock
 *   reads, no randomness, no timers, no network assets.
 * @output Deckload — Air Cargo ULD Builder: a freighter load-planning
 *   cockpit. Header carries the cobalt Deckload mark, flight/leg/tail
 *   readout, fixed cutoff chip, and a gated "Finalize loadsheet" button.
 *   The main column stacks a five-tile balance strip (payload, ZFW, CG
 *   %MAC, positions filled, queue remaining), the defining region — a
 *   side-elevation aircraft SVG with sixteen absolutely-positioned ULD
 *   slot buttons whose x-centers derive from their physical arms (arm ×
 *   2% of fuselage length) so the map is dimensionally true — an inspect
 *   strip for the selected occupied position, and a bottom band pairing a
 *   weight-&-balance envelope chart (CG marker inside a fwd/aft limit
 *   polygon, dashed track from the OEW point) with a readiness panel
 *   (limit readouts, DG segregation verdicts, three-row finalize
 *   checklist, deterministic build log). A 320px end panel owns the
 *   shipment queue: 64px AWB rows with hazmat diamonds and ULD-type
 *   badges. Signature interaction: select a queued AWB → only
 *   deck/weight-compatible empty slots light cobalt-dashed; placing it
 *   moves the CG marker live inside the envelope, re-derives every tile,
 *   and flags class 3 ↔ 5.1 / 9 ↔ 3 adjacency violations on the map, in
 *   the readiness panel, and against the finalize gate at once.
 * @position Page template; emitted by \`astryx template air-cargo-uld-builder\`
 *
 * Frame: root 100dvh column (scope class tpl-air-cargo-uld-builder) wrapping
 *   Layout height="fill"; LayoutHeader is the only DS chrome band. Content
 *   is a hand-rolled grid \`minmax(0,1fr) 320px\` (comment in CSS explains
 *   why: the queue column must drop BELOW the map at phone widths, which
 *   LayoutPanel's fixed rail cannot do). Main column scrolls vertically;
 *   the deck canvas is a fixed 250px stage whose fuselage SVG stretches
 *   with preserveAspectRatio="none" so slot buttons positioned by
 *   percentage stay registered with the drawing at every width.
 *
 * Responsive contract:
 * - Default (stage ~1045px, no media query needed): main column ~700px +
 *   queue 320px; five stat tiles in one row; envelope band is a two-column
 *   grid 340px + 1fr.
 * - <=880px (full-screen narrow / embed): body collapses to one column —
 *   queue moves below the envelope band and caps at 380px of its own
 *   scroll; stat tiles wrap to a 3-per-row grid; root height goes auto so
 *   the page scrolls as one document.
 * - <=480px (390px embed iframe): stat tiles 2-up, envelope band stacks,
 *   slot buttons drop their weight line (subtraction — id only), header
 *   hides the leg readout and keeps flight number + cutoff + finalize.
 * - The deck canvas never squeezes below 250px tall; horizontal fit comes
 *   from the percentage slot geometry, not overflow scrolling.
 *
 * Container policy (planning-cockpit archetype): frame-first rows, panels,
 *   and two custom SVG surfaces (deck elevation, envelope chart). No Cards;
 *   the stat strip is a bordered tile row, the queue is dense rows, the
 *   readiness panel is a bordered column. Slot positions are real <button>s
 *   overlaid on the SVG so focus rings, disabled reasons, and aria-pressed
 *   come free — the SVG itself is aria-hidden scenery.
 *
 * Color policy: token chrome throughout. ONE quarantined brand accent —
 *   Deckload cobalt light-dark(#1D4ED8, #7CA9FF): #1D4ED8 on #FFFFFF ≈
 *   6.7:1, #7CA9FF on ~#1C1C1E ≈ 7.3:1 (both clear 4.5:1 text). On-accent
 *   ink light-dark(#FFFFFF, #0B1B3A): white on #1D4ED8 ≈ 6.7:1, #0B1B3A on
 *   #7CA9FF ≈ 7.2:1. State pairs with math at declaration: danger
 *   light-dark(#B91C1C, #F87171) ≈ 6.3:1 / 6.6:1, caution
 *   light-dark(#B45309, #FBBF24) ≈ 4.6:1 / 10.9:1 (used ≥11px/600 only),
 *   success light-dark(#15803D, #4ADE80) ≈ 4.8:1 / 9.7:1. The fuselage
 *   drawing uses border/muted tokens only, so the scenery re-themes free.
 *
 * Density grid (repeated verbatim in CSS comments): stat tiles 72 · deck
 *   canvas 250 · main-deck slots 48 · lower-deck slots 36 · inspect strip
 *   56 · envelope 260 · queue panel 320 · queue rows 64 · section bars 34
 *   · gutter var(--spacing-3). tabular-nums on every weight, arm, and
 *   %MAC figure.
 *
 * Fixture policy: one state owner — \`placements\` (position id → shipment
 *   id) plus \`selectedShipmentId\`, \`inspectPositionId\`, \`isFinalized\`, and
 *   an append-only build log. Every surface re-derives from \`placements\`
 *   in the same render: balance tiles, CG marker, envelope verdict,
 *   segregation violations, slot eligibility, queue membership, checklist,
 *   and the finalize gate. Removing a placement returns the AWB to the
 *   queue and reverses every derivation. Finalizing freezes the build and
 *   logs it — no confirms, no timers.
 */

import {useMemo, useState} from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ListChecksIcon,
  LockIcon,
  PackageIcon,
  PlaneTakeoffIcon,
  ScaleIcon,
  SendIcon,
  XCircleIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. ONE brand accent (Deckload cobalt), quarantined here.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-air-cargo-uld-builder';

// THE brand accent. #1D4ED8 on #FFFFFF ≈ 6.7:1; #7CA9FF on ~#1C1C1E ≈ 7.3:1.
const ACCENT = 'light-dark(#1D4ED8, #7CA9FF)';
// Ink over an ACCENT fill: #FFFFFF on #1D4ED8 ≈ 6.7:1; #0B1B3A on #7CA9FF
// ≈ 7.2:1 (white on #7CA9FF would fail at ≈1.9:1, hence the navy ink).
const ACCENT_ON = 'light-dark(#FFFFFF, #0B1B3A)';
// Eligible-slot wash (graphic only — the dashed ACCENT border carries the
// affordance; the wash just warms the surface, so no 3:1 duty).
const ACCENT_TINT =
  'light-dark(rgba(29, 78, 216, 0.10), rgba(124, 169, 255, 0.16))';
// Danger (limit exceeded, segregation violation): #B91C1C on #FFFFFF ≈
// 6.3:1; #F87171 on ~#1C1C1E ≈ 6.6:1.
const DANGER = 'light-dark(#B91C1C, #F87171)';
const DANGER_TINT =
  'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.14))';
// Caution (hazmat diamonds, cutoff chip): #B45309 on #FFFFFF ≈ 4.6:1;
// #FBBF24 on ~#1C1C1E ≈ 10.9:1. Rendered at ≥11px weight 600 only.
const CAUTION = 'light-dark(#B45309, #FBBF24)';
// Success (in-limits verdict, checklist passes): #15803D on #FFFFFF ≈
// 4.8:1; #4ADE80 on ~#1C1C1E ≈ 9.7:1.
const SUCCESS = 'light-dark(#15803D, #4ADE80)';
const SUCCESS_TINT =
  'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';

const MONO = 'var(--font-family-code, ui-monospace, monospace)';

// ---------------------------------------------------------------------------
// AIRCRAFT CONSTANTS — B767-300F freighter geometry (values rounded for the
// fixture; the arithmetic below is exact against these constants).
// ---------------------------------------------------------------------------

const OEW_KG = 86_000;
/** OEW arm = LEMAC 22.60 m + 27% of the 6.00 m MAC = 24.22 m. */
const OEW_ARM_M = 24.22;
const LEMAC_M = 22.6;
const MAC_M = 6.0;
const MZFW_KG = 140_000;
const MAX_PAYLOAD_KG = 54_000;
/** Fuselage span used by the deck map: arms 0–50 m map to 0–100% width. */
const FUSELAGE_SPAN_M = 50;

/**
 * ZFW CG envelope, linear fwd/aft limits interpolated on payload fraction
 * t = (zfw − OEW) / (MZFW − OEW):
 *   fwd limit  11 %MAC at OEW → 14 %MAC at MZFW  (11 + 3t)
 *   aft limit  32 %MAC at OEW → 28 %MAC at MZFW  (32 − 4t)
 */
function envelopeLimitsAt(zfwKg: number): {fwdPct: number; aftPct: number} {
  const t = Math.min(1, Math.max(0, (zfwKg - OEW_KG) / (MZFW_KG - OEW_KG)));
  return {fwdPct: 11 + 3 * t, aftPct: 32 - 4 * t};
}

// ---------------------------------------------------------------------------
// POSITIONS — sixteen ULD stations. \`armM\` is physical (meters from datum);
// the deck map derives each slot's x-center as arm / 50 m of fuselage
// length, so the drawing is dimensionally true.
// ---------------------------------------------------------------------------

type Deck = 'main' | 'lower';

interface UldPosition {
  id: string;
  deck: Deck;
  /** Arm in meters from the datum (nose). */
  armM: number;
  /** Structural limit for this station. */
  limitKg: number;
  /** Hold label used in aria text and the inspect strip. */
  hold: string;
}

const mainPos = (id: string, armM: number, limitKg: number): UldPosition => ({
  id,
  deck: 'main',
  armM,
  limitKg,
  hold: 'Main deck',
});
const lowerPos = (id: string, armM: number, hold: string): UldPosition => ({
  id,
  deck: 'lower',
  armM,
  limitKg: 1_588, // AKE max gross weight
  hold,
});

const POSITIONS: UldPosition[] = [
  // Main deck P1–P10, 4 m pitch. P1/P10 sit in the nose/tail taper: 4,500 kg.
  mainPos('P1', 7, 4_500),
  mainPos('P2', 11, 7_200),
  mainPos('P3', 15, 7_200),
  mainPos('P4', 19, 7_200),
  mainPos('P5', 23, 7_200),
  mainPos('P6', 27, 7_200),
  mainPos('P7', 31, 7_200),
  mainPos('P8', 35, 7_200),
  mainPos('P9', 39, 7_200),
  mainPos('P10', 43, 4_500),
  // Lower deck AKE stations, 3 m pitch, split fwd/aft around the wing box.
  lowerPos('L1', 10, 'Fwd hold'),
  lowerPos('L2', 13, 'Fwd hold'),
  lowerPos('L3', 16, 'Fwd hold'),
  lowerPos('L4', 33, 'Aft hold'),
  lowerPos('L5', 36, 'Aft hold'),
  lowerPos('L6', 39, 'Aft hold'),
];

const POSITION_BY_ID: Record<string, UldPosition> = Object.fromEntries(
  POSITIONS.map(p => [p.id, p]),
);

/**
 * Adjacency for DG segregation: same-deck neighbors only. L3|L4 are NOT
 * adjacent (wing box between the holds), and cross-deck pairs never count —
 * the deck floor is an approved segregation barrier.
 */
const ADJACENT_PAIRS: Array<[string, string]> = [
  ['P1', 'P2'],
  ['P2', 'P3'],
  ['P3', 'P4'],
  ['P4', 'P5'],
  ['P5', 'P6'],
  ['P6', 'P7'],
  ['P7', 'P8'],
  ['P8', 'P9'],
  ['P9', 'P10'],
  ['L1', 'L2'],
  ['L2', 'L3'],
  ['L4', 'L5'],
  ['L5', 'L6'],
];

// ---------------------------------------------------------------------------
// SHIPMENTS — twelve AWBs. Dual fields keep display and math in sync
// (formatKg renders, weightKg computes). AWB prefix 618 is invented.
// ---------------------------------------------------------------------------

type UldType = 'PMC' | 'AKE';
type HazClass = '3' | '5.1' | '7' | '9';

interface Shipment {
  id: string;
  awb: string; // display form '618-4027 1013'
  commodity: string;
  weightKg: number;
  uld: UldType;
  hazClass: HazClass | null;
  /** UN number + proper shipping name fragment, hazmat rows only. */
  hazLabel: string | null;
  priority: 'AOG' | 'Express' | 'General';
}

const SHIPMENTS: Shipment[] = [
  // ----- pre-placed at open (see INITIAL_PLACEMENTS): 19,080 kg -----
  {
    id: 's-stampings',
    awb: '618-4027 1013',
    commodity: 'Automotive stampings, returnable racks',
    weightKg: 4_860,
    uld: 'PMC',
    hazClass: null,
    hazLabel: null,
    priority: 'General',
  },
  {
    id: 's-salmon',
    awb: '618-4027 1155',
    commodity: 'Salmon, fresh chilled — keep cool',
    weightKg: 3_240,
    uld: 'PMC',
    hazClass: null,
    hazLabel: null,
    priority: 'Express',
  },
  {
    id: 's-drill',
    awb: '618-4030 2211',
    commodity: 'Oil-field drill collars, steel',
    weightKg: 5_410,
    uld: 'PMC',
    hazClass: null,
    hazLabel: null,
    priority: 'General',
  },
  {
    id: 's-ecomm',
    awb: '618-4031 0088',
    commodity: 'E-commerce mixed parcels',
    weightKg: 1_420,
    uld: 'AKE',
    hazClass: null,
    hazLabel: null,
    priority: 'Express',
  },
  {
    id: 's-tires',
    awb: '618-4029 7754',
    commodity: 'Mining truck tires, 63-inch',
    weightKg: 4_150,
    uld: 'PMC',
    hazClass: null,
    hazLabel: null,
    priority: 'General',
  },
  // ----- queued at open: 15,320 kg -----
  {
    id: 's-lithium',
    awb: '618-4032 4406',
    commodity: 'Lithium-ion battery modules',
    weightKg: 2_640,
    uld: 'PMC',
    hazClass: '9',
    hazLabel: 'UN 3480 · Lithium ion batteries',
    priority: 'General',
  },
  {
    id: 's-paint',
    awb: '618-4032 4590',
    commodity: 'Paint & lacquer drums',
    weightKg: 1_980,
    uld: 'PMC',
    hazClass: '3',
    hazLabel: 'UN 1263 · Paint, flammable',
    priority: 'General',
  },
  {
    id: 's-peroxide',
    awb: '618-4033 0127',
    commodity: 'Hydrogen peroxide 50%, drums',
    weightKg: 1_420,
    uld: 'PMC',
    hazClass: '5.1',
    hazLabel: 'UN 2014 · Oxidizing liquid',
    priority: 'General',
  },
  {
    id: 's-isotopes',
    awb: '618-4033 0312',
    commodity: 'Medical isotopes, time-critical',
    weightKg: 310,
    uld: 'AKE',
    hazClass: '7',
    hazLabel: 'UN 2915 · Radioactive, Type A',
    priority: 'Express',
  },
  {
    id: 's-machine',
    awb: '618-4034 6621',
    commodity: 'Machine tools, crated lathe bed',
    weightKg: 6_850, // fits P2–P9 (7,200) but NOT the 4,500 kg taper stations
    uld: 'PMC',
    hazClass: null,
    hazLabel: null,
    priority: 'General',
  },
  {
    id: 's-apparel',
    awb: '618-4034 6702',
    commodity: 'Apparel cartons, hanging garments',
    weightKg: 1_180,
    uld: 'AKE',
    hazClass: null,
    hazLabel: null,
    priority: 'General',
  },
  {
    // Stress fixture: 80-char commodity exercises queue-row and inspect-strip
    // truncation.
    id: 's-aog',
    awb: '618-4035 1198',
    commodity:
      'Aerospace AOG — IGT combustor spares for Meridian Line MRO, tail N417MC recovery',
    weightKg: 940,
    uld: 'AKE',
    hazClass: null,
    hazLabel: null,
    priority: 'AOG',
  },
];

const SHIPMENT_BY_ID: Record<string, Shipment> = Object.fromEntries(
  SHIPMENTS.map(s => [s.id, s]),
);

/** Opening build — five placements, 19,080 kg, CG 25.3 %MAC (math in the
 * @input header). */
const INITIAL_PLACEMENTS: Record<string, string> = {
  P4: 's-stampings',
  P5: 's-drill',
  P6: 's-salmon',
  P7: 's-tires',
  L2: 's-ecomm',
};

/** Build log opens with the pre-placed history — fixed strings, newest
 * first. */
const INITIAL_LOG: string[] = [
  '13:11 · Placed 618-4029 7754 → P7 (4,150 kg) · CG 25.3 %MAC',
  '13:08 · Placed 618-4031 0088 → L2 (1,420 kg) · CG 25.0 %MAC',
  '13:05 · Placed 618-4027 1155 → P6 (3,240 kg) · CG 25.2 %MAC',
  '13:03 · Placed 618-4030 2211 → P5 (5,410 kg) · CG 24.7 %MAC',
  '13:02 · Placed 618-4027 1013 → P4 (4,860 kg) · CG 25.0 %MAC',
];

/** Deterministic clock stub for new log lines: starts at 13:14 and advances
 * one minute per mutation — the demo's internal "now", never a real clock. */
const LOG_CLOCK_START_MIN = 13 * 60 + 14;

// ---------------------------------------------------------------------------
// DG SEGREGATION RULES — adjacency-based. The 3 ↔ 5.1 row paraphrases IATA
// DGR Table 9.3.A; MC-DG-12 is an invented carrier rule for the fixture.
// Class 7 has no adjacency row here (NOTOC-handled), noted in the panel.
// ---------------------------------------------------------------------------

interface SegRule {
  a: HazClass;
  b: HazClass;
  code: string;
  text: string;
}

const SEGREGATION_RULES: SegRule[] = [
  {
    a: '3',
    b: '5.1',
    code: 'IATA 9.3.A',
    text: 'Flammable liquids (3) may not load adjacent to oxidizers (5.1)',
  },
  {
    a: '9',
    b: '3',
    code: 'MC-DG-12',
    text: 'Lithium batteries (9) not adjacent to flammable liquids (3)',
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — every surface reads these; \`placements\` is the single owner.
// ---------------------------------------------------------------------------

interface BalanceState {
  payloadKg: number;
  zfwKg: number;
  armM: number;
  macPct: number;
  fwdPct: number;
  aftPct: number;
  verdict: 'ok' | 'fwd' | 'aft';
}

function deriveBalance(placements: Record<string, string>): BalanceState {
  let payloadKg = 0;
  let momentKgM = OEW_KG * OEW_ARM_M;
  for (const [posId, shipId] of Object.entries(placements)) {
    const pos = POSITION_BY_ID[posId];
    const s = SHIPMENT_BY_ID[shipId];
    payloadKg += s.weightKg;
    momentKgM += s.weightKg * pos.armM;
  }
  const zfwKg = OEW_KG + payloadKg;
  const armM = momentKgM / zfwKg;
  const macPct = ((armM - LEMAC_M) / MAC_M) * 100;
  const {fwdPct, aftPct} = envelopeLimitsAt(zfwKg);
  const verdict: BalanceState['verdict'] =
    macPct < fwdPct ? 'fwd' : macPct > aftPct ? 'aft' : 'ok';
  return {payloadKg, zfwKg, armM, macPct, fwdPct, aftPct, verdict};
}

interface Violation {
  posA: string;
  posB: string;
  shipA: Shipment;
  shipB: Shipment;
  rule: SegRule;
}

function deriveViolations(placements: Record<string, string>): Violation[] {
  const out: Violation[] = [];
  for (const [pa, pb] of ADJACENT_PAIRS) {
    const idA = placements[pa];
    const idB = placements[pb];
    if (idA == null || idB == null) {
      continue;
    }
    const shipA = SHIPMENT_BY_ID[idA];
    const shipB = SHIPMENT_BY_ID[idB];
    if (shipA.hazClass == null || shipB.hazClass == null) {
      continue;
    }
    for (const rule of SEGREGATION_RULES) {
      const hit =
        (shipA.hazClass === rule.a && shipB.hazClass === rule.b) ||
        (shipA.hazClass === rule.b && shipB.hazClass === rule.a);
      if (hit) {
        out.push({posA: pa, posB: pb, shipA, shipB, rule});
      }
    }
  }
  return out;
}

const formatKg = (n: number) => n.toLocaleString('en-US');
const formatMac = (n: number) => \`\${n.toFixed(1)} %MAC\`;
const formatClock = (totalMin: number) => {
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
};

/** Arm (m) → percentage x-center on the deck canvas. */
const armToPct = (armM: number) => (armM / FUSELAGE_SPAN_M) * 100;

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector is scoped under .tpl-air-cargo-uld-builder.
// Density grid (verbatim): stat tiles 72 · deck canvas 250 · main-deck
// slots 48 · lower-deck slots 36 · inspect strip 56 · envelope 260 · queue
// panel 320 · queue rows 64 · section bars 34 · gutter var(--spacing-3).
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.\${SCOPE} .acu-btn {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.\${SCOPE} .acu-btn:disabled { cursor: not-allowed; }
.\${SCOPE} button:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.\${SCOPE} .acu-num { font-variant-numeric: tabular-nums; }
.\${SCOPE} .acu-mono { font-family: \${MONO}; }

/* Body: hand-rolled grid instead of LayoutPanel — the 320px queue column
   must drop BELOW the map at phone widths, which a fixed DS rail cannot do.
   Default (stage ~1045px) needs no media query: 1fr + 320. */
.\${SCOPE} .acu-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  height: 100%;
  min-height: 0;
}
.\${SCOPE} .acu-main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.\${SCOPE} .acu-queue {
  min-height: 0;
  border-inline-start: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  background: var(--color-background-card);
}

/* ----- header bits (LayoutHeader owns the 56px band) ----- */
.\${SCOPE} .acu-cutoff {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  height: 28px;
  padding-inline: var(--spacing-2);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: \${CAUTION};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* ----- stat strip: five 72px tiles ----- */
.\${SCOPE} .acu-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--spacing-2);
}
.\${SCOPE} .acu-stat {
  height: 72px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  min-width: 0;
}
.\${SCOPE} .acu-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .acu-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .acu-stat-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .acu-stat.is-danger .acu-stat-value { color: \${DANGER}; }
.\${SCOPE} .acu-stat.is-ok .acu-stat-value { color: \${SUCCESS}; }

/* ----- section bars: 34px label rows over each region ----- */
.\${SCOPE} .acu-section {
  height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .acu-section h2 {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin: 0;
}
.\${SCOPE} .acu-section .acu-section-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}

/* ----- deck canvas: fixed 250px stage; slots are absolute buttons whose
   x-centers derive from physical arms (arm / 50 m → %), so the map stays
   registered with the stretched fuselage SVG at every width. ----- */
.\${SCOPE} .acu-deck-wrap {
  position: relative;
  height: 250px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-muted);
  overflow: hidden;
}
.\${SCOPE} .acu-deck-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.\${SCOPE} .acu-slot {
  position: absolute;
  transform: translateX(-50%);
  border: var(--border-width) solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  font: inherit;
  padding: 0;
  cursor: pointer;
  line-height: 1.2;
}
/* main-deck slots 48 tall / lower-deck slots 36 tall */
.\${SCOPE} .acu-slot--main { top: 74px; height: 48px; width: 7.2%; }
.\${SCOPE} .acu-slot--lower { top: 150px; height: 36px; width: 5.4%; }
.\${SCOPE} .acu-slot-id {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}
.\${SCOPE} .acu-slot-wt {
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  max-width: 92%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .acu-slot.is-occupied {
  background: light-dark(rgba(29, 78, 216, 0.06), rgba(124, 169, 255, 0.10));
  border-color: light-dark(#93A8E8, #4A5E8F);
}
.\${SCOPE} .acu-slot.is-eligible {
  border: 2px dashed \${ACCENT};
  background: \${ACCENT_TINT};
}
.\${SCOPE} .acu-slot.is-eligible .acu-slot-id { color: \${ACCENT}; }
.\${SCOPE} .acu-slot.is-inspected {
  border-color: \${ACCENT};
  box-shadow: inset 0 0 0 1px \${ACCENT};
}
.\${SCOPE} .acu-slot.is-violation {
  border-color: \${DANGER};
  box-shadow: inset 0 0 0 1px \${DANGER};
  background: \${DANGER_TINT};
}
.\${SCOPE} .acu-slot:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.\${SCOPE} .acu-slot-flag {
  position: absolute;
  top: -7px;
  right: -6px;
  color: \${DANGER};
  display: inline-flex;
}
/* hazmat diamond glyph — rotated square, class number set upright */
.\${SCOPE} .acu-haz {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex: none;
}
.\${SCOPE} .acu-deck-legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  font-size: 11px;
  color: var(--color-text-secondary);
  align-items: center;
}
.\${SCOPE} .acu-legend-swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-inline-end: 4px;
  vertical-align: -2px;
}

/* ----- inspect strip: 56px, appears under the map for an occupied slot ----- */
.\${SCOPE} .acu-inspect {
  min-height: 56px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding-inline: var(--spacing-3);
  padding-block: var(--spacing-2);
}
.\${SCOPE} .acu-inspect-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.\${SCOPE} .acu-inspect-title {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .acu-inspect-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ----- envelope band: 340px chart + readiness panel ----- */
.\${SCOPE} .acu-band {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: var(--spacing-3);
  align-items: stretch;
}
.\${SCOPE} .acu-envelope,
.\${SCOPE} .acu-readiness {
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-card);
  padding: var(--spacing-3);
  min-width: 0;
}
.\${SCOPE} .acu-envelope svg { display: block; width: 100%; height: auto; }
.\${SCOPE} .acu-chart-grid { stroke: var(--color-border); stroke-width: 1; }
.\${SCOPE} .acu-chart-label {
  fill: var(--color-text-secondary);
  font-size: 9px;
  font-family: \${MONO};
}
.\${SCOPE} .acu-chart-env {
  fill: \${ACCENT_TINT};
  stroke: \${ACCENT};
  stroke-width: 1.5;
}
.\${SCOPE} .acu-verdict {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  height: 24px;
  padding-inline: var(--spacing-2);
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.\${SCOPE} .acu-verdict.is-ok { color: \${SUCCESS}; background: \${SUCCESS_TINT}; }
.\${SCOPE} .acu-verdict.is-bad { color: \${DANGER}; background: \${DANGER_TINT}; }

/* readiness rows + violations + build log */
.\${SCOPE} .acu-check-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 32px;
  font-size: 13px;
}
.\${SCOPE} .acu-check-row .acu-check-detail {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  margin-inline-start: auto;
  text-align: end;
}
.\${SCOPE} .acu-viol {
  border: var(--border-width) solid \${DANGER};
  background: \${DANGER_TINT};
  border-radius: 6px;
  padding: var(--spacing-2);
  font-size: 12px;
  display: flex;
  gap: var(--spacing-2);
  align-items: flex-start;
}
.\${SCOPE} .acu-viol strong { font-variant-numeric: tabular-nums; }
.\${SCOPE} .acu-log {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: \${MONO};
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .acu-log li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ----- queue panel: 320px, 64px rows ----- */
.\${SCOPE} .acu-queue-head {
  height: 34px;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding-inline: var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  flex: none;
}
.\${SCOPE} .acu-queue-list {
  overflow-y: auto;
  min-height: 0;
  flex: 1;
}
.\${SCOPE} .acu-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  min-height: 64px;
  padding-inline: var(--spacing-3);
  padding-block: var(--spacing-2);
  border-bottom: var(--border-width) solid var(--color-border);
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} .acu-row:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.\${SCOPE} .acu-row.is-selected {
  box-shadow: inset 3px 0 0 \${ACCENT};
  background: \${ACCENT_TINT};
}
.\${SCOPE} .acu-row:disabled { opacity: 0.55; cursor: not-allowed; }
.\${SCOPE} .acu-row-main {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .acu-row-awb {
  font-family: \${MONO};
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  white-space: nowrap;
}
.\${SCOPE} .acu-row-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .acu-row-wt {
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .acu-uld-chip {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  border: var(--border-width) solid var(--color-border);
  border-radius: 4px;
  padding: 1px 4px;
  color: var(--color-text-secondary);
  flex: none;
}
.\${SCOPE} .acu-queue-hint {
  padding: var(--spacing-3);
  font-size: 12px;
  color: var(--color-text-secondary);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .acu-queue-empty {
  padding: var(--spacing-5) var(--spacing-3);
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .acu-aog {
  color: \${DANGER};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* panel titles inside envelope/readiness panels */
.\${SCOPE} .acu-panel-title {
  margin: 0 0 var(--spacing-2) 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .acu-deck-label {
  position: absolute;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--color-text-secondary);
  pointer-events: none;
}

/* live status line under the map */
.\${SCOPE} .acu-status {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-height: 18px;
}

/* ----- responsive: subtraction, not squeeze ----- */
@media (max-width: 880px) {
  .\${SCOPE} { height: auto; min-height: 100dvh; }
  .\${SCOPE} .acu-body { grid-template-columns: minmax(0, 1fr); height: auto; }
  .\${SCOPE} .acu-main { overflow-y: visible; }
  .\${SCOPE} .acu-queue {
    border-inline-start: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .acu-queue-list { max-height: 380px; }
  .\${SCOPE} .acu-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 480px) {
  .\${SCOPE} .acu-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .\${SCOPE} .acu-band { grid-template-columns: minmax(0, 1fr); }
  /* subtraction: slots keep only their id at phone widths */
  .\${SCOPE} .acu-slot-wt { display: none; }
  .\${SCOPE} .acu-leg-readout { display: none; }
}
@media (prefers-reduced-motion: no-preference) {
  .\${SCOPE} .acu-slot { transition: background-color 150ms ease, border-color 150ms ease; }
  .\${SCOPE} .acu-cg-marker { transition: cx 220ms ease, cy 220ms ease; }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — Deckload: a cobalt tile with two deck bands and a CG dot.
// Tiny inline SVG, never an emoji.
// ---------------------------------------------------------------------------

function BrandMark() {
  return (
    <svg width={22} height={22} viewBox="0 0 22 22" aria-hidden focusable="false">
      <rect x={1} y={1} width={20} height={20} rx={5} fill={ACCENT} />
      <rect x={4.5} y={6} width={13} height={4} rx={1} fill={ACCENT_ON} opacity={0.92} />
      <rect x={4.5} y={12.5} width={8} height={3} rx={1} fill={ACCENT_ON} opacity={0.6} />
      <circle cx={16} cy={14} r={2.1} fill={ACCENT_ON} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// HAZMAT DIAMOND — domain glyph: rotated square carrying the DG class
// number upright. A Badge cannot say "class 5.1 in a diamond"; this can.
// ---------------------------------------------------------------------------

function HazDiamond({cls}: {cls: HazClass}) {
  return (
    <span className="acu-haz" title={\`DG class \${cls}\`}>
      <svg width={14} height={14} viewBox="0 0 14 14" aria-hidden focusable="false">
        <rect
          x={2.4}
          y={2.4}
          width={9.2}
          height={9.2}
          rx={1.2}
          transform="rotate(45 7 7)"
          fill="none"
          stroke={CAUTION}
          strokeWidth={1.5}
        />
        <text
          x={7}
          y={9.1}
          textAnchor="middle"
          fontSize={cls.length > 1 ? 4.6 : 6}
          fontWeight={700}
          fill={CAUTION}
          fontFamily="var(--font-family-sans)">
          {cls}
        </text>
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// DECK SCENERY — side-elevation fuselage behind the slot buttons. Drawn in a
// 1000×250 viewBox with preserveAspectRatio="none" so x-coordinates line up
// with the percentage-positioned buttons at any width. Tokens only, so the
// drawing re-themes with the scheme. aria-hidden: the buttons carry meaning.
// ---------------------------------------------------------------------------

function DeckScenery() {
  return (
    <svg
      className="acu-deck-svg"
      viewBox="0 0 1000 250"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false">
      {/* fuselage outline: nose left, tail cone rising right */}
      <path
        d="M 14 130
           C 22 84 60 58 116 54
           L 852 54
           C 916 58 962 84 990 118
           L 990 126
           C 946 168 892 194 820 200
           L 100 200
           C 48 194 20 166 14 138
           Z"
        fill="var(--color-background-card)"
        stroke="var(--color-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* vertical stabilizer */}
      <path
        d="M 872 56 L 948 8 L 972 8 L 934 62 Z"
        fill="var(--color-background-muted)"
        stroke="var(--color-border)"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      {/* cockpit windows */}
      <path
        d="M 44 92 L 86 78 L 96 92 L 52 104 Z"
        fill="var(--color-border)"
        opacity={0.7}
      />
      {/* main-deck floor line at y=140 (between the two slot bands) */}
      <line
        x1={30}
        y1={140}
        x2={968}
        y2={140}
        stroke="var(--color-border)"
        strokeDasharray="5 4"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {/* wing box: occupies the gap between fwd (L3, arm 16) and aft (L4,
          arm 33) holds — 16 m → x 320, 33 m → x 660 */}
      <path
        d="M 400 140 L 620 140 L 592 200 L 428 200 Z"
        fill="var(--color-background-muted)"
        stroke="var(--color-border)"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {/* main gear bogie hint under the wing box */}
      <circle cx={520} cy={216} r={9} fill="none" stroke="var(--color-border)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={548} cy={216} r={9} fill="none" stroke="var(--color-border)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle cx={92} cy={216} r={7} fill="none" stroke="var(--color-border)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ENVELOPE CHART — ZFW weight (y) vs CG %MAC (x). The polygon is the legal
// region; the cobalt marker is the live CG; a dashed track runs from the
// OEW point so the eye reads "how far the build has walked the CG".
// Geometry: viewBox 340×260; x 8–36 %MAC → 46–330 px; y 80–145 t → 230–14 px.
// ---------------------------------------------------------------------------

const ENV_X = (mac: number) => 46 + (mac - 8) * (284 / 28);
const ENV_Y = (kg: number) => 230 - ((kg - 80_000) * 216) / 65_000;

function EnvelopeChart({balance}: {balance: BalanceState}) {
  const envelopePoints = [
    [11, 86_000],
    [14, 140_000],
    [28, 140_000],
    [32, 86_000],
  ]
    .map(([mac, kg]) => \`\${ENV_X(mac).toFixed(1)},\${ENV_Y(kg).toFixed(1)}\`)
    .join(' ');
  const cgX = ENV_X(balance.macPct);
  const cgY = ENV_Y(balance.zfwKg);
  const oewX = ENV_X(27);
  const oewY = ENV_Y(OEW_KG);
  const isOut = balance.verdict !== 'ok';
  const markerColor = isOut ? DANGER : ACCENT;
  return (
    <svg
      viewBox="0 0 340 260"
      role="img"
      aria-label={\`Weight and balance envelope: zero-fuel weight \${formatKg(
        balance.zfwKg,
      )} kilograms at \${balance.macPct.toFixed(1)} percent MAC, \${
        isOut ? 'outside' : 'inside'
      } limits\`}>
      {/* horizontal gridlines every 10 t */}
      {[90_000, 100_000, 110_000, 120_000, 130_000, 140_000].map(kg => (
        <g key={kg}>
          <line
            className="acu-chart-grid"
            x1={46}
            y1={ENV_Y(kg)}
            x2={330}
            y2={ENV_Y(kg)}
            opacity={kg === 140_000 ? 0.9 : 0.45}
          />
          <text className="acu-chart-label" x={40} y={ENV_Y(kg) + 3} textAnchor="end">
            {kg / 1000}t
          </text>
        </g>
      ))}
      {/* x ticks every 5 %MAC */}
      {[10, 15, 20, 25, 30, 35].map(mac => (
        <g key={mac}>
          <line
            className="acu-chart-grid"
            x1={ENV_X(mac)}
            y1={230}
            x2={ENV_X(mac)}
            y2={234}
          />
          <text
            className="acu-chart-label"
            x={ENV_X(mac)}
            y={245}
            textAnchor="middle">
            {mac}%
          </text>
        </g>
      ))}
      <text className="acu-chart-label" x={188} y={257} textAnchor="middle">
        CG · %MAC
      </text>
      {/* legal region */}
      <polygon className="acu-chart-env" points={envelopePoints} />
      {/* MZFW ceiling label */}
      <text className="acu-chart-label" x={330} y={ENV_Y(140_000) - 4} textAnchor="end">
        MZFW 140t
      </text>
      {/* OEW reference point + dashed CG track */}
      <line
        x1={oewX}
        y1={oewY}
        x2={cgX}
        y2={cgY}
        stroke={markerColor}
        strokeWidth={1}
        strokeDasharray="3 3"
        opacity={0.7}
      />
      <rect
        x={oewX - 3.5}
        y={oewY - 3.5}
        width={7}
        height={7}
        fill="var(--color-background-card)"
        stroke="var(--color-text-secondary)"
        strokeWidth={1.2}
      />
      <text className="acu-chart-label" x={oewX + 8} y={oewY + 3}>
        OEW
      </text>
      {/* live CG marker */}
      <circle
        className="acu-cg-marker"
        cx={cgX}
        cy={cgY}
        r={5.5}
        fill={markerColor}
        stroke="var(--color-background-card)"
        strokeWidth={1.5}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// QUEUE ROW — dense 64px shipment row. Purely presentational; reports clicks.
// ---------------------------------------------------------------------------

function QueueRow({
  shipment,
  isSelected,
  isDisabled,
  onSelect,
}: {
  shipment: Shipment;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      className={\`acu-btn acu-row\${isSelected ? ' is-selected' : ''}\`}
      aria-pressed={isSelected}
      disabled={isDisabled}
      aria-label={\`\${shipment.awb}, \${shipment.commodity}, \${formatKg(
        shipment.weightKg,
      )} kilograms, \${shipment.uld} unit\${
        shipment.hazClass != null ? \`, dangerous goods class \${shipment.hazClass}\` : ''
      }\`}
      onClick={() => onSelect(shipment.id)}>
      <div className="acu-row-main">
        <span className="acu-row-awb">
          {shipment.awb}
          {shipment.hazClass != null && <HazDiamond cls={shipment.hazClass} />}
          {shipment.priority === 'AOG' && <span className="acu-aog">AOG</span>}
        </span>
        <span className="acu-row-desc">{shipment.commodity}</span>
        {shipment.hazLabel != null && (
          <span className="acu-row-desc">{shipment.hazLabel}</span>
        )}
      </div>
      <span className="acu-uld-chip">{shipment.uld}</span>
      <span className="acu-row-wt acu-num">{formatKg(shipment.weightKg)} kg</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one state owner (\`placements\`); every region derives per render.
// ---------------------------------------------------------------------------

export default function AirCargoUldBuilderTemplate() {
  const [placements, setPlacements] =
    useState<Record<string, string>>(INITIAL_PLACEMENTS);
  // Opens with the lithium AWB armed so the eligible-slot affordance is
  // visible on first paint.
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | null>(
    's-lithium',
  );
  const [inspectPositionId, setInspectPositionId] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [log, setLog] = useState<string[]>(INITIAL_LOG);

  const balance = useMemo(() => deriveBalance(placements), [placements]);
  const violations = useMemo(() => deriveViolations(placements), [placements]);

  const placedIds = useMemo(
    () => new Set(Object.values(placements)),
    [placements],
  );
  const queue = useMemo(
    () => SHIPMENTS.filter(s => !placedIds.has(s.id)),
    [placedIds],
  );
  const queueKg = queue.reduce((sum, s) => sum + s.weightKg, 0);
  const filledCount = Object.keys(placements).length;
  const mainFilled = Object.keys(placements).filter(
    id => POSITION_BY_ID[id].deck === 'main',
  ).length;

  const selectedShipment =
    selectedShipmentId != null ? SHIPMENT_BY_ID[selectedShipmentId] : null;
  const violatingPositions = useMemo(() => {
    const set = new Set<string>();
    for (const v of violations) {
      set.add(v.posA);
      set.add(v.posB);
    }
    return set;
  }, [violations]);

  // Finalize gate: queue clear + CG in limits + zero segregation conflicts.
  const gateQueueClear = queue.length === 0;
  const gateCgOk = balance.verdict === 'ok';
  const gateDgOk = violations.length === 0;
  const canFinalize = gateQueueClear && gateCgOk && gateDgOk && !isFinalized;

  /** Deterministic log clock: 13:14 + one minute per mutation. */
  const nextClock = () =>
    formatClock(LOG_CLOCK_START_MIN + (log.length - INITIAL_LOG.length));
  const appendLog = (line: string) => setLog(prev => [line, ...prev]);

  const isEligible = (pos: UldPosition): boolean => {
    if (isFinalized || selectedShipment == null) {
      return false;
    }
    if (placements[pos.id] != null) {
      return false;
    }
    const deckMatch =
      (selectedShipment.uld === 'PMC' && pos.deck === 'main') ||
      (selectedShipment.uld === 'AKE' && pos.deck === 'lower');
    return deckMatch && selectedShipment.weightKg <= pos.limitKg;
  };

  const handleSlotClick = (pos: UldPosition) => {
    const occupantId = placements[pos.id];
    if (occupantId != null) {
      // Inspect toggle — placement edits go through the inspect strip.
      setInspectPositionId(prev => (prev === pos.id ? null : pos.id));
      return;
    }
    if (isFinalized || selectedShipment == null || !isEligible(pos)) {
      return;
    }
    const next = {...placements, [pos.id]: selectedShipment.id};
    const nextBalance = deriveBalance(next);
    setPlacements(next);
    setSelectedShipmentId(null);
    setInspectPositionId(pos.id);
    appendLog(
      \`\${nextClock()} · Placed \${selectedShipment.awb} → \${pos.id} (\${formatKg(
        selectedShipment.weightKg,
      )} kg) · CG \${nextBalance.macPct.toFixed(1)} %MAC\`,
    );
  };

  const handleRemove = (posId: string) => {
    const occupantId = placements[posId];
    if (occupantId == null || isFinalized) {
      return;
    }
    const occupant = SHIPMENT_BY_ID[occupantId];
    const next = {...placements};
    delete next[posId];
    const nextBalance = deriveBalance(next);
    setPlacements(next);
    setInspectPositionId(null);
    appendLog(
      \`\${nextClock()} · Removed \${occupant.awb} ← \${posId} · back to queue · CG \${nextBalance.macPct.toFixed(1)} %MAC\`,
    );
  };

  const handleFinalize = () => {
    if (!canFinalize) {
      return;
    }
    setIsFinalized(true);
    setSelectedShipmentId(null);
    appendLog(
      \`\${nextClock()} · Loadsheet finalized — \${formatKg(
        balance.payloadKg,
      )} kg / CG \${balance.macPct.toFixed(1)} %MAC sent to MC 482 crew\`,
    );
  };

  const inspectPos =
    inspectPositionId != null ? POSITION_BY_ID[inspectPositionId] : null;
  const inspectShipment =
    inspectPos != null && placements[inspectPos.id] != null
      ? SHIPMENT_BY_ID[placements[inspectPos.id]]
      : null;

  const slotAria = (pos: UldPosition): string => {
    const occupantId = placements[pos.id];
    if (occupantId != null) {
      const s = SHIPMENT_BY_ID[occupantId];
      const viol = violatingPositions.has(pos.id)
        ? ', segregation violation'
        : '';
      return \`Position \${pos.id}, \${pos.hold}, arm \${pos.armM} meters, loaded with \${s.awb}, \${formatKg(s.weightKg)} kilograms\${viol}. Activate to inspect.\`;
    }
    if (isEligible(pos)) {
      return \`Position \${pos.id}, \${pos.hold}, empty, limit \${formatKg(
        pos.limitKg,
      )} kilograms. Activate to place \${selectedShipment?.awb ?? ''}.\`;
    }
    return \`Position \${pos.id}, \${pos.hold}, empty, limit \${formatKg(
      pos.limitKg,
    )} kilograms.\`;
  };

  const verdictLabel =
    balance.verdict === 'ok'
      ? 'IN LIMITS'
      : balance.verdict === 'fwd'
        ? 'FWD LIMIT EXCEEDED'
        : 'AFT LIMIT EXCEEDED';

  // ----- header -----
  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={2} vAlign="center">
        <BrandMark />
        <Heading level={1}>Deckload</Heading>
        <Badge label="ULD build" variant="neutral" />
        <span className="acu-leg-readout">
          <Text type="supporting" color="secondary" hasTabularNumbers>
            MC 482 · ORD → ANC · B767-300F · N417MC
          </Text>
        </span>
        <StackItem size="fill">
          <span />
        </StackItem>
        <span className="acu-cutoff acu-num">
          <Icon icon={PlaneTakeoffIcon} size="sm" color="inherit" />
          Cutoff 14:45L
        </span>
        {isFinalized ? (
          <Badge label="Loadsheet sent" variant="success" />
        ) : (
          <Button
            label="Finalize loadsheet"
            variant="primary"
            size="sm"
            isDisabled={!canFinalize}
            onClick={handleFinalize}
          />
        )}
      </HStack>
    </LayoutHeader>
  );

  // ----- stat strip -----
  const statStrip = (
    <div className="acu-stats">
      <div className="acu-stat">
        <span className="acu-stat-label">Payload</span>
        <span className="acu-stat-value">{formatKg(balance.payloadKg)} kg</span>
        <span className="acu-stat-sub">of {formatKg(MAX_PAYLOAD_KG)} kg max</span>
      </div>
      <div className="acu-stat">
        <span className="acu-stat-label">Zero-fuel weight</span>
        <span className="acu-stat-value">{formatKg(balance.zfwKg)} kg</span>
        <span className="acu-stat-sub">MZFW {formatKg(MZFW_KG)} kg</span>
      </div>
      <div className={\`acu-stat \${gateCgOk ? 'is-ok' : 'is-danger'}\`}>
        <span className="acu-stat-label">CG</span>
        <span className="acu-stat-value">{formatMac(balance.macPct)}</span>
        <span className="acu-stat-sub">
          limits {balance.fwdPct.toFixed(1)}–{balance.aftPct.toFixed(1)}
        </span>
      </div>
      <div className="acu-stat">
        <span className="acu-stat-label">Positions</span>
        <span className="acu-stat-value">{filledCount} / 16</span>
        <span className="acu-stat-sub">
          main {mainFilled}/10 · lower {filledCount - mainFilled}/6
        </span>
      </div>
      <div className={\`acu-stat\${gateDgOk ? '' : ' is-danger'}\`}>
        <span className="acu-stat-label">Queue</span>
        <span className="acu-stat-value">{queue.length} AWB</span>
        <span className="acu-stat-sub">
          {gateDgOk
            ? \`\${formatKg(queueKg)} kg to build\`
            : \`\${violations.length} DG conflict\${violations.length > 1 ? 's' : ''}\`}
        </span>
      </div>
    </div>
  );

  // ----- deck map -----
  const deckMap = (
    <div className="acu-deck-wrap">
      <DeckScenery />
      <span className="acu-deck-label" style={{top: 58, left: '3%'}}>
        MAIN DECK · PMC
      </span>
      <span className="acu-deck-label" style={{top: 190, left: '3%'}}>
        LOWER HOLDS · AKE
      </span>
      {POSITIONS.map(pos => {
        const occupantId = placements[pos.id];
        const occupant = occupantId != null ? SHIPMENT_BY_ID[occupantId] : null;
        const eligible = isEligible(pos);
        const isViolating = violatingPositions.has(pos.id);
        const isEmptyIneligible = occupant == null && !eligible;
        const classes = [
          'acu-btn',
          'acu-slot',
          pos.deck === 'main' ? 'acu-slot--main' : 'acu-slot--lower',
          occupant != null ? 'is-occupied' : '',
          eligible ? 'is-eligible' : '',
          isViolating ? 'is-violation' : '',
          inspectPositionId === pos.id ? 'is-inspected' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <button
            key={pos.id}
            type="button"
            className={classes}
            style={{left: \`\${armToPct(pos.armM)}%\`}}
            aria-label={slotAria(pos)}
            aria-pressed={inspectPositionId === pos.id}
            // Empty slots that cannot take the armed shipment are inert —
            // the dimming IS the ineligibility read.
            disabled={isEmptyIneligible && selectedShipment != null}
            title={
              isEmptyIneligible && selectedShipment != null
                ? selectedShipment.uld === (pos.deck === 'main' ? 'PMC' : 'AKE')
                  ? \`Over station limit \${formatKg(pos.limitKg)} kg\`
                  : \`\${selectedShipment.uld} units load \${
                      selectedShipment.uld === 'PMC' ? 'main deck' : 'lower holds'
                    } only\`
                : undefined
            }
            onClick={() => handleSlotClick(pos)}>
            <span className="acu-slot-id">{pos.id}</span>
            <span className="acu-slot-wt">
              {occupant != null
                ? \`\${formatKg(occupant.weightKg)}\`
                : \`≤\${formatKg(pos.limitKg)}\`}
            </span>
            {occupant?.hazClass != null && <HazDiamond cls={occupant.hazClass} />}
            {isViolating && (
              <span className="acu-slot-flag" aria-hidden>
                <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const legend = (
    <div className="acu-deck-legend">
      <span>
        <span
          className="acu-legend-swatch"
          style={{
            background: 'light-dark(rgba(29,78,216,0.06), rgba(124,169,255,0.10))',
            border: \`1px solid light-dark(#93A8E8, #4A5E8F)\`,
          }}
        />
        Loaded
      </span>
      <span>
        <span
          className="acu-legend-swatch"
          style={{background: ACCENT_TINT, border: \`2px dashed \${ACCENT}\`}}
        />
        Takes armed AWB
      </span>
      <span>
        <span
          className="acu-legend-swatch"
          style={{background: DANGER_TINT, border: \`1px solid \${DANGER}\`}}
        />
        DG segregation conflict
      </span>
      <span>
        <HazDiamond cls="9" /> DG class aboard
      </span>
      <span className="acu-num">P1/P10 taper limit 4,500 kg · AKE max 1,588 kg</span>
    </div>
  );

  // ----- readiness panel -----
  const checkRow = (
    isPass: boolean,
    label: string,
    detail: string,
    key: string,
  ) => (
    <div className="acu-check-row" key={key}>
      <span style={{color: isPass ? SUCCESS : DANGER, display: 'inline-flex'}}>
        <Icon
          icon={isPass ? CheckCircle2Icon : XCircleIcon}
          size="sm"
          color="inherit"
        />
      </span>
      <span>{label}</span>
      <span className="acu-check-detail">{detail}</span>
    </div>
  );

  const readiness = (
    <div className="acu-readiness">
      <h3 className="acu-panel-title">
        <Icon icon={ListChecksIcon} size="sm" color="inherit" /> Cutoff readiness
      </h3>
      {checkRow(
        gateQueueClear,
        'Queue built out',
        gateQueueClear ? 'all 12 AWBs loaded' : \`\${queue.length} AWB remaining\`,
        'gate-queue',
      )}
      {checkRow(
        gateCgOk,
        'CG within ZFW envelope',
        \`\${formatMac(balance.macPct)} · \${balance.fwdPct.toFixed(1)}–\${balance.aftPct.toFixed(1)} legal\`,
        'gate-cg',
      )}
      {checkRow(
        gateDgOk,
        'DG segregation clear',
        gateDgOk ? 'no adjacency conflicts' : \`\${violations.length} conflict\${violations.length > 1 ? 's' : ''}\`,
        'gate-dg',
      )}
      {violations.map(v => (
        <div className="acu-viol" key={\`\${v.posA}-\${v.posB}-\${v.rule.code}\`}>
          <span style={{color: DANGER, display: 'inline-flex'}}>
            <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
          </span>
          <span>
            <strong>
              {v.posA} ↔ {v.posB}
            </strong>{' '}
            · {v.rule.text} <em>({v.rule.code})</em> — move {v.shipB.awb} or{' '}
            {v.shipA.awb}.
          </span>
        </div>
      ))}
      <Text type="supporting" color="secondary">
        Class 7 (radioactive) is NOTOC-notified; no adjacency rule applies on
        this leg.
      </Text>
      <h3 className="acu-panel-title" style={{marginTop: 'var(--spacing-3)'}}>
        Build log
      </h3>
      <ul className="acu-log">
        {log.slice(0, 6).map(line => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );

  // ----- queue panel -----
  const queuePanel = (
    <aside className="acu-queue" aria-label="Shipment queue">
      <div className="acu-queue-head">
        <Icon icon={PackageIcon} size="sm" color="secondary" />
        <Text type="body" weight="semibold">
          Shipment queue
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {queue.length} AWB · {formatKg(queueKg)} kg
        </Text>
      </div>
      <div className="acu-queue-hint">
        {isFinalized ? (
          <>
            <Icon icon={LockIcon} size="sm" color="secondary" /> Build frozen —
            loadsheet sent at {log[0]?.slice(0, 5)}.
          </>
        ) : (
          'Select an AWB, then tap a cobalt-dashed position on the map. PMC pallets load the main deck; AKE cans load the lower holds.'
        )}
      </div>
      <div className="acu-queue-list">
        {queue.map(s => (
          <QueueRow
            key={s.id}
            shipment={s}
            isSelected={selectedShipmentId === s.id}
            isDisabled={isFinalized}
            onSelect={id =>
              setSelectedShipmentId(prev => (prev === id ? null : id))
            }
          />
        ))}
        {queue.length === 0 && (
          <div className="acu-queue-empty">
            Queue clear — all 12 shipments assigned.
            {!isFinalized && ' Review the map, then finalize the loadsheet.'}
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <div className={SCOPE}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="acu-body">
              <div className="acu-main">
                {statStrip}
                <div className="acu-section">
                  <Icon icon={ScaleIcon} size="sm" color="secondary" />
                  <h2>Deck plan — MC 482</h2>
                  <span className="acu-section-meta">
                    slot x-centers derive from station arms (0–50 m)
                  </span>
                </div>
                {deckMap}
                {legend}
                {/* Live region: the newest build-log line doubles as the
                    action announcement. */}
                <div className="acu-status" role="status" aria-live="polite">
                  {log[0]}
                </div>
                {inspectPos != null && inspectShipment != null && (
                  <div className="acu-inspect">
                    <Badge label={inspectPos.id} variant="neutral" />
                    <div className="acu-inspect-main">
                      <span className="acu-inspect-title acu-mono">
                        {inspectShipment.awb} · {inspectShipment.commodity}
                      </span>
                      <span className="acu-inspect-sub">
                        {inspectPos.hold} · arm {inspectPos.armM.toFixed(1)} m ·{' '}
                        {formatKg(inspectShipment.weightKg)} kg of{' '}
                        {formatKg(inspectPos.limitKg)} kg limit
                        {inspectShipment.hazLabel != null &&
                          \` · \${inspectShipment.hazLabel}\`}
                      </span>
                    </div>
                    <Button
                      label="Return to queue"
                      variant="secondary"
                      size="sm"
                      isDisabled={isFinalized}
                      onClick={() => handleRemove(inspectPos.id)}
                    />
                  </div>
                )}
                <div className="acu-section">
                  <Icon icon={SendIcon} size="sm" color="secondary" />
                  <h2>Weight &amp; balance</h2>
                  <span className="acu-section-meta">
                    OEW {formatKg(OEW_KG)} kg @ {OEW_ARM_M.toFixed(2)} m
                  </span>
                </div>
                <div className="acu-band">
                  <div className="acu-envelope">
                    <HStack gap={2} vAlign="center">
                      <h3 className="acu-panel-title" style={{margin: 0}}>
                        ZFW envelope
                      </h3>
                      <StackItem size="fill">
                        <span />
                      </StackItem>
                      <span
                        className={\`acu-verdict \${gateCgOk ? 'is-ok' : 'is-bad'}\`}>
                        {verdictLabel}
                      </span>
                    </HStack>
                    <EnvelopeChart balance={balance} />
                    <Text type="supporting" color="secondary" hasTabularNumbers>
                      CG {formatMac(balance.macPct)} · arm{' '}
                      {balance.armM.toFixed(2)} m · ZFW{' '}
                      {formatKg(balance.zfwKg)} kg
                    </Text>
                  </div>
                  {readiness}
                </div>
              </div>
              {queuePanel}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}



`;export{e as default};