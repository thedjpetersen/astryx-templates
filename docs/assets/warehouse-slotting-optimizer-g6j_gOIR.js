var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Slotwise slotting model for
 *   DC-12 (Reno, NV), wave 26-W28: a 6-aisle × 10-bay pick module (60
 *   slots), a 38-SKU catalog with dual display/math fields (velocity class
 *   A/B/C/D stored AND backed by picksPerDay: A ≥ 30, B 12–29, C 4–11,
 *   D < 4 — every stored class matches its number), 38 literal placements
 *   (22 slots deliberately empty so the heatmap shows real voids), and an
 *   8-row ranked move plan MV-01…MV-08. All travel aggregates derive LIVE
 *   from the placement map — nothing is hand-tuned: roundTripFt(slot) =
 *   2 × (AISLE_OFFSET[aisle] + bay × BAY_PITCH) with AISLE_OFFSET =
 *   {A:12, B:26, C:40, D:54, E:68, F:82} ft and BAY_PITCH = 4 ft, so e.g.
 *   MV-01 (SKU-88412, 46 picks/day, F07→A04) is worth
 *   46 × (220 − 56) = 7,544 ft/day and MV-06 is a deliberate NEGATIVE
 *   enabler row (3 × (48 − 200) = −456 ft/day) that frees prime bay A03
 *   for MV-08 (27 × (148 − 48) = +2,700). MV-08 is BLOCKED until MV-06
 *   applies because its destination is occupied — the block is derived
 *   from the live occupancy map, not a flag. No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Slotwise — Warehouse Slotting Optimizer: a velocity heatmap
 *   command surface. Header (brand rack mark · DC/wave identity · a live
 *   travel-saved counter chip · Reset plan). Left column: a 4-tile KPI
 *   band (daily pick travel ft, saved vs baseline ft/day, moves applied
 *   n/8, velocity-fit %), the aisle × bay heatmap (60 slot buttons
 *   colored by the occupant's velocity class, dashed voids for empties,
 *   FROM/TO ring annotations for the selected move), and a slot inspector
 *   strip that reads the selected cell (occupant, picks/day, cube, tier,
 *   round-trip ft, daily travel ft, move involvement). Right: a 380px
 *   move-plan panel — ranked rows with route (F07 → A04), live savings
 *   ft/day, destination cube-fill %, and ergonomic strain delta
 *   (stoop → golden), each with Accept / Skip. SIGNATURE: accepting a
 *   move MUTATES the occupancy map — the two heatmap cells swap or clear
 *   live, the KPI band and header savings counter re-derive from the new
 *   map, dependent moves unblock, and applied rows offer a real Revert
 *   that re-swaps the cells and gives the feet back. A screenshot cannot
 *   show the map re-coloring under an accepted move.
 * @position Page template; emitted by \`astryx template warehouse-slotting-optimizer\`
 *
 * Frame: a 100dvh root gives Layout height="fill" a definite height in
 * auto-height hosts. LayoutHeader carries brand, identity, the savings
 * counter chip, and Reset. LayoutContent (padding 0) owns a hand-rolled
 * two-column CSS grid — \`minmax(0,1fr) 380px\` — because the responsive
 * collapse must be pure CSS (viewport media queries do not fire in the
 * inline demo stage; the DEFAULT grid must already be right at ~1045px).
 * Left column and plan panel scroll independently (height:100%,
 * minHeight:0, overflow-y:auto).
 *
 * Responsive contract:
 * - ~1045px default (inline stage): heatmap column ≈630px — 10 bay
 *   columns of minmax(44px,1fr) + a 34px aisle rail fit without scroll;
 *   the plan panel keeps 380px. No breakpoint needed.
 * - <=920px (full-screen narrow): the grid stacks to one column; the plan
 *   panel loses its fixed width and side border, gains a top border; the
 *   page scrolls as one column (panes stop independent scrolling).
 * - <=560px (390px embed iframe): KPI band wraps 2×2; the heatmap card
 *   scrolls horizontally inside its own body (min-width 560px on the
 *   grid) instead of widening the page; move-row chip clusters wrap; all
 *   action buttons keep >=40px hit height; the header sheds the DC
 *   subtitle. Subtraction, not squeeze — nothing shrinks below its
 *   density numbers; surfaces drop columns or gain internal scroll.
 *
 * Container policy (optimizer console archetype): dense rows and panels,
 * not cards — the heatmap is a CSS grid of real <button> cells, the move
 * plan is 68px action rows with hairline dividers, the inspector is a
 * fixed strip. The only card chrome is the 1px-border heatmap surface.
 *
 * Color policy: token-first chrome (var(--color-*), var(--spacing-*)).
 * ONE quarantined brand accent — Slotwise tangerine — as a light-dark()
 * pair with contrast math at the declaration. The four velocity ramp
 * classes and the gain/loss pair are state colors, each a light-dark()
 * pair with math in the VELOCITY_RAMP / GAIN/LOSS comments. Never the
 * bare text token (it does not exist and renders black on SVG):
 * --color-text-primary / --color-text-secondary only.
 *
 * Density grid (repeated verbatim in the CSS): header 56 · KPI tiles 84 ·
 * heatmap cells 44px tall on minmax(44px,1fr) columns, 4px gap · aisle
 * rail 34 · inspector strip min 92 · move rows min 68 · plan panel 380 ·
 * gutter var(--spacing-3) · action buttons >=40px hit height · every
 * numeric cell tabular-nums.
 *
 * Fixture policy: fixed data only — no clock reads, no randomness, no
 * network. The wave label, SKU numbers, and cube capacities are fixed
 * strings/numbers; savings, fit %, cube-fill %, and travel totals are
 * derived live from the placement map so Accept / Revert / Reset always
 * cross-check by construction.
 */

import {useMemo, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  CheckIcon,
  RotateCcwIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

// ============= BRAND =============
// ONE quarantined Slotwise accent (tangerine). Text-safe pair:
//   light #C2410C on #FFFFFF ≈ 4.8:1  (passes 4.5:1 body text)
//   dark  #FDBA74 on #17181A ≈ 10.2:1
// Used for brand text, focus rings, selected-cell rings, and the savings
// counter. Never used as a large fill behind long body text.
const ACCENT = 'light-dark(#C2410C, #FDBA74)';
// Subtle accent wash for selected chrome (non-text surface only).
const ACCENT_WASH =
  'light-dark(rgba(194, 65, 12, 0.10), rgba(253, 186, 116, 0.14))';

// Gain / loss pair for signed ft/day figures:
//   gain light #15803D on #FFFFFF ≈ 4.6:1 · dark #4ADE80 on #17181A ≈ 9.9:1
//   loss light #B91C1C on #FFFFFF ≈ 5.9:1 · dark #F87171 on #17181A ≈ 6.9:1
const GAIN = 'light-dark(#15803D, #4ADE80)';
const LOSS = 'light-dark(#B91C1C, #F87171)';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

// ============= VELOCITY RAMP =============
// Tangerine heat ramp, hottest = A. Every bg/fg pair carries its own
// contrast math (fg on bg, both schemes ≥ 4.5:1):
//   A: light #FB923C / #431407 ≈ 7.0:1 · dark #9A3412 / #FFEDD5 ≈ 7.8:1
//   B: light #FED7AA / #7C2D12 ≈ 7.6:1 · dark #7C2D12 / #FDBA74 ≈ 5.6:1
//   C: light #FFEDD5 / #9A3412 ≈ 6.4:1 · dark #431407 / #FDBA74 ≈ 8.9:1
//   D: light #F4F4F5 / #3F3F46 ≈ 8.9:1 · dark #26272B / #B8BCC4 ≈ 8.0:1
type VelocityClass = 'A' | 'B' | 'C' | 'D';

const VELOCITY_RAMP: Record<VelocityClass, {bg: string; fg: string}> = {
  A: {bg: 'light-dark(#FB923C, #9A3412)', fg: 'light-dark(#431407, #FFEDD5)'},
  B: {bg: 'light-dark(#FED7AA, #7C2D12)', fg: 'light-dark(#7C2D12, #FDBA74)'},
  C: {bg: 'light-dark(#FFEDD5, #431407)', fg: 'light-dark(#9A3412, #FDBA74)'},
  D: {bg: 'light-dark(#F4F4F5, #26272B)', fg: 'light-dark(#3F3F46, #B8BCC4)'},
};

const VELOCITY_BOUNDS: Record<VelocityClass, string> = {
  A: '≥ 30 picks/day',
  B: '12–29 picks/day',
  C: '4–11 picks/day',
  D: '< 4 picks/day',
};

// ============= GEOMETRY =============
// Travel model (single source of truth for every ft/day figure on the
// page): the pick-drop point sits at the module face; a pick walks down
// the aisle and back. roundTripFt(slot) = 2 * (AISLE_OFFSET + bay * 4).
const AISLES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;
type Aisle = (typeof AISLES)[number];
const BAYS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

const AISLE_OFFSET: Record<Aisle, number> = {
  A: 12,
  B: 26,
  C: 40,
  D: 54,
  E: 68,
  F: 82,
};
const BAY_PITCH = 4;

function slotId(aisle: Aisle, bay: number): string {
  return \`\${aisle}\${String(bay).padStart(2, '0')}\`;
}

function roundTripFt(slot: string): number {
  const aisle = slot[0] as Aisle;
  const bay = Number(slot.slice(1));
  return 2 * (AISLE_OFFSET[aisle] + bay * BAY_PITCH);
}

// Destination cube capacity by bay depth: bays 1–3 are 6 ft³ flow
// shelves, 4–6 are 8 ft³ hand-stack bays, 7–10 are 12 ft³ pallet bays.
function slotCapacityFt3(slot: string): number {
  const bay = Number(slot.slice(1));
  if (bay <= 3) {
    return 6;
  }
  if (bay <= 6) {
    return 8;
  }
  return 12;
}

// Velocity-fit thresholds: an occupant "fits" its slot when its
// round-trip stays inside its class band. Drives the Fit % KPI.
const FIT_MAX_FT: Record<VelocityClass, number> = {
  A: 80,
  B: 130,
  C: 190,
  D: Number.POSITIVE_INFINITY,
};

// Walking pace used ONLY for the "≈ min/shift" translation of saved
// feet: 240 ft/min loaded pick-cart pace (a fixed constant, not a clock).
const FT_PER_MIN = 240;

// Ergonomic tier vocabulary: tier 1 = floor (stoop), 2 = waist (golden),
// 3 = top shelf (reach).
type Tier = 1 | 2 | 3;
const TIER_LABEL: Record<Tier, string> = {1: 'stoop', 2: 'golden', 3: 'reach'};

// ============= SKU CATALOG =============
// 38 SKUs. velClass is stored AND verifiable against picksPerDay
// (A ≥ 30, B 12–29, C 4–11, D < 4) — dual display/math fields.
interface Sku {
  id: string;
  name: string;
  picksPerDay: number;
  cubeFt3: number;
  velClass: VelocityClass;
}

const SKUS: Sku[] = [
  // ---- A movers (≥30 picks/day) ----
  {id: 'SKU-88412', name: 'Insulated tumbler 20 oz — case 24', picksPerDay: 46, cubeFt3: 3.1, velClass: 'A'},
  {id: 'SKU-95542', name: 'Energy chews citrus — case 12', picksPerDay: 44, cubeFt3: 2.6, velClass: 'A'},
  {id: 'SKU-72055', name: 'Trail runner sock 3-pack, M', picksPerDay: 41, cubeFt3: 1.8, velClass: 'A'},
  {id: 'SKU-90118', name: 'Phone mount, vent clip', picksPerDay: 38, cubeFt3: 1.2, velClass: 'A'},
  {id: 'SKU-98131', name: 'Electrolyte mix tub, 30 srv', picksPerDay: 36, cubeFt3: 2.8, velClass: 'A'},
  {id: 'SKU-61773', name: 'LED headlamp 350 lm', picksPerDay: 34, cubeFt3: 2.0, velClass: 'A'},
  {id: 'SKU-83321', name: 'Collapsible bottle 750 ml', picksPerDay: 31, cubeFt3: 1.6, velClass: 'A'},
  {id: 'SKU-77209', name: 'Resistance band set, 5 pc', picksPerDay: 30, cubeFt3: 2.4, velClass: 'A'},
  // ---- B movers (12–29) ----
  {id: 'SKU-55810', name: 'Camp mug enamel 12 oz', picksPerDay: 27, cubeFt3: 2.2, velClass: 'B'},
  {id: 'SKU-51119', name: 'Hydration bladder 2 L', picksPerDay: 26, cubeFt3: 1.9, velClass: 'B'},
  {id: 'SKU-64930', name: 'Dry bag 10 L, roll-top', picksPerDay: 24, cubeFt3: 2.9, velClass: 'B'},
  {id: 'SKU-70344', name: 'Merino beanie, charcoal', picksPerDay: 22, cubeFt3: 1.1, velClass: 'B'},
  {id: 'SKU-57302', name: 'Camp chair, compact', picksPerDay: 21, cubeFt3: 5.2, velClass: 'B'},
  {id: 'SKU-52277', name: 'Trekking pole pair, cork grip', picksPerDay: 19, cubeFt3: 4.6, velClass: 'B'},
  {id: 'SKU-62488', name: 'Lantern mini 200 lm', picksPerDay: 18, cubeFt3: 0.9, velClass: 'B'},
  {id: 'SKU-68115', name: 'First-aid kit, day hike', picksPerDay: 17, cubeFt3: 1.4, velClass: 'B'},
  {id: 'SKU-59462', name: 'Titanium spork 2-pack', picksPerDay: 15, cubeFt3: 0.6, velClass: 'B'},
  {id: 'SKU-69820', name: 'Sit pad, closed-cell foam', picksPerDay: 14, cubeFt3: 1.2, velClass: 'B'},
  {id: 'SKU-73688', name: 'Packable daypack 18 L', picksPerDay: 13, cubeFt3: 2.7, velClass: 'B'},
  {id: 'SKU-66041', name: 'Bear bell w/ silencer', picksPerDay: 12, cubeFt3: 0.5, velClass: 'B'},
  // ---- C movers (4–11) ----
  {id: 'SKU-42061', name: 'Repair patch kit, TPU', picksPerDay: 11, cubeFt3: 0.3, velClass: 'C'},
  {id: 'SKU-40297', name: 'Guyline kit reflective 4 mm', picksPerDay: 10, cubeFt3: 0.8, velClass: 'C'},
  {id: 'SKU-47730', name: 'Camp towel XL microfiber', picksPerDay: 9, cubeFt3: 1.9, velClass: 'C'},
  {id: 'SKU-46617', name: 'Bandana print 22 in', picksPerDay: 9, cubeFt3: 0.4, velClass: 'C'},
  {id: 'SKU-43155', name: 'Stove windscreen, foldable', picksPerDay: 8, cubeFt3: 1.0, velClass: 'C'},
  {id: 'SKU-49984', name: 'Tent footprint 2P', picksPerDay: 7, cubeFt3: 2.3, velClass: 'C'},
  {id: 'SKU-41608', name: 'Mosquito head net', picksPerDay: 6, cubeFt3: 0.4, velClass: 'C'},
  {id: 'SKU-44139', name: 'Tent pole splint', picksPerDay: 6, cubeFt3: 0.6, velClass: 'C'},
  {id: 'SKU-45521', name: 'Paracord 550 — 100 ft spool', picksPerDay: 5, cubeFt3: 1.3, velClass: 'C'},
  {id: 'SKU-40773', name: 'Seam sealer 1 oz', picksPerDay: 5, cubeFt3: 0.5, velClass: 'C'},
  {id: 'SKU-48876', name: 'Gaiter pair, low', picksPerDay: 4, cubeFt3: 1.5, velClass: 'C'},
  // ---- D movers (<4) — includes the 64-char truncation stress label ----
  {id: 'SKU-34518', name: 'Ski strap pair', picksPerDay: 3, cubeFt3: 0.3, velClass: 'D'},
  {id: 'SKU-30112', name: 'Snow stake set, 6 pc', picksPerDay: 3, cubeFt3: 1.7, velClass: 'D'},
  {id: 'SKU-35660', name: 'Crampon spare strap', picksPerDay: 2, cubeFt3: 0.9, velClass: 'D'},
  {id: 'SKU-31447', name: 'Ice axe leash', picksPerDay: 2, cubeFt3: 0.7, velClass: 'D'},
  {id: 'SKU-36071', name: 'Avalanche probe 280 cm', picksPerDay: 2, cubeFt3: 2.1, velClass: 'D'},
  {id: 'SKU-38903', name: 'Expedition duffel 140 L — oversized, ships own carton (LTL only)', picksPerDay: 1, cubeFt3: 6.8, velClass: 'D'},
  {id: 'SKU-33285', name: 'Pulk harness kit', picksPerDay: 1, cubeFt3: 3.4, velClass: 'D'},
];

const SKU_BY_ID = new Map(SKUS.map(sku => [sku.id, sku]));

function skuOf(id: string): Sku {
  const sku = SKU_BY_ID.get(id);
  if (sku === undefined) {
    throw new Error(\`Unknown SKU \${id}\`);
  }
  return sku;
}

// ============= PLACEMENTS =============
// 38 literal placements; the other 22 of the 60 slots are voids. The
// misplacements are engineered: A movers stranded deep (F07, F03, E09,
// E04, D08, C09) and D movers squatting in prime golden bays (A02
// duffel, A03, B01) — exactly the rows the move plan attacks.
interface Placement {
  skuId: string;
  tier: Tier;
}

const INITIAL_PLACEMENTS: ReadonlyArray<{
  slot: string;
  skuId: string;
  tier: Tier;
}> = [
  {slot: 'A01', skuId: 'SKU-72055', tier: 2},
  {slot: 'A02', skuId: 'SKU-38903', tier: 2}, // 1 pick/day duffel in golden prime
  {slot: 'A03', skuId: 'SKU-30112', tier: 1}, // MV-06 vacates this for MV-08
  {slot: 'A05', skuId: 'SKU-77209', tier: 2},
  {slot: 'A07', skuId: 'SKU-51119', tier: 2},
  {slot: 'A08', skuId: 'SKU-70344', tier: 3},
  {slot: 'B01', skuId: 'SKU-31447', tier: 2}, // slow SKU in prime — surfaced by Fit %, not yet planned
  {slot: 'B04', skuId: 'SKU-64930', tier: 1},
  {slot: 'B05', skuId: 'SKU-35660', tier: 2}, // MV-07 swap partner
  {slot: 'B06', skuId: 'SKU-68115', tier: 2},
  {slot: 'B07', skuId: 'SKU-62488', tier: 3},
  {slot: 'B08', skuId: 'SKU-59462', tier: 2},
  {slot: 'B10', skuId: 'SKU-66041', tier: 3},
  {slot: 'C01', skuId: 'SKU-57302', tier: 1},
  {slot: 'C02', skuId: 'SKU-73688', tier: 2},
  {slot: 'C03', skuId: 'SKU-69820', tier: 2},
  {slot: 'C04', skuId: 'SKU-52277', tier: 1},
  {slot: 'C06', skuId: 'SKU-42061', tier: 2},
  {slot: 'C07', skuId: 'SKU-47730', tier: 2},
  {slot: 'C08', skuId: 'SKU-40297', tier: 2},
  {slot: 'C09', skuId: 'SKU-83321', tier: 1}, // A mover stranded deep — MV-07
  {slot: 'D01', skuId: 'SKU-46617', tier: 3},
  {slot: 'D02', skuId: 'SKU-43155', tier: 2},
  {slot: 'D03', skuId: 'SKU-49984', tier: 1},
  {slot: 'D05', skuId: 'SKU-55810', tier: 2}, // MV-08 source
  {slot: 'D06', skuId: 'SKU-41608', tier: 3},
  {slot: 'D07', skuId: 'SKU-45521', tier: 2},
  {slot: 'D08', skuId: 'SKU-61773', tier: 1}, // A mover stranded deep — MV-04
  {slot: 'D09', skuId: 'SKU-44139', tier: 3},
  {slot: 'E01', skuId: 'SKU-48876', tier: 2},
  {slot: 'E02', skuId: 'SKU-40773', tier: 2},
  {slot: 'E03', skuId: 'SKU-36071', tier: 1},
  {slot: 'E04', skuId: 'SKU-98131', tier: 2}, // A mover stranded deep — MV-05
  {slot: 'E05', skuId: 'SKU-34518', tier: 2},
  {slot: 'E06', skuId: 'SKU-33285', tier: 1},
  {slot: 'E09', skuId: 'SKU-90118', tier: 3}, // A mover stranded deep — MV-03
  {slot: 'F03', skuId: 'SKU-95542', tier: 1}, // MV-02 swap partner (fast side)
  {slot: 'F07', skuId: 'SKU-88412', tier: 1}, // top misplacement — MV-01
];

type OccupancyMap = Record<string, Placement | null>;

function buildInitialOccupancy(): OccupancyMap {
  const map: OccupancyMap = {};
  for (const aisle of AISLES) {
    for (const bay of BAYS) {
      map[slotId(aisle, bay)] = null;
    }
  }
  for (const entry of INITIAL_PLACEMENTS) {
    map[entry.slot] = {skuId: entry.skuId, tier: entry.tier};
  }
  return map;
}

// ============= MOVE PLAN =============
// 8 ranked rows. \`kind: 'swap'\` exchanges two occupants; 'relocate'
// targets a void. Savings are NOT stored — they derive live from the
// occupancy map (see savingsOf), so Accept/Revert always reconcile with
// the KPI band. Worked examples (verbatim from the travel model):
//   MV-01  46 × (rt F07 220 − rt A04 56)  = +7,544 ft/day
//   MV-02  (44 − 1) × (rt F03 188 − rt A02 40) = +6,364
//   MV-03  38 × (208 − 68) = +5,320
//   MV-04  34 × (172 − 72) = +3,400
//   MV-05  36 × (168 − 76) = +3,312
//   MV-08  27 × (148 − 48) = +2,700   (blocked until MV-06 frees A03)
//   MV-07  (31 − 2) × (152 − 92) = +1,740
//   MV-06  3 × (48 − 200) = −456      (enabler — frees prime bay A03)
interface MovePlanRow {
  id: string;
  rank: number;
  kind: 'relocate' | 'swap';
  skuId: string;
  from: string;
  to: string;
  toTier: Tier;
  /** For swaps: the occupant of \`to\` rides back to \`from\` at this tier. */
  backTier?: Tier;
  note: string;
}

const MOVE_PLAN: MovePlanRow[] = [
  {
    id: 'MV-01', rank: 1, kind: 'relocate', skuId: 'SKU-88412',
    from: 'F07', to: 'A04', toTier: 2,
    note: 'Top mover buried in pallet aisle F; A04 golden shelf is open.',
  },
  {
    id: 'MV-02', rank: 2, kind: 'swap', skuId: 'SKU-95542',
    from: 'F03', to: 'A02', toTier: 2, backTier: 1,
    note: 'Swap with the LTL duffel squatting in prime — duffel rides back to F03.',
  },
  {
    id: 'MV-03', rank: 3, kind: 'relocate', skuId: 'SKU-90118',
    from: 'E09', to: 'B02', toTier: 2,
    note: 'Top-shelf reach today; B02 flow shelf ends the ladder trips.',
  },
  {
    id: 'MV-04', rank: 4, kind: 'relocate', skuId: 'SKU-61773',
    from: 'D08', to: 'A06', toTier: 2,
    note: 'Headlamps pick every wave; pull them out of the pallet run.',
  },
  {
    id: 'MV-05', rank: 5, kind: 'relocate', skuId: 'SKU-98131',
    from: 'E04', to: 'B03', toTier: 2,
    note: 'Tub cube 2.8 ft³ fits the 6 ft³ flow shelf at 47% fill.',
  },
  {
    id: 'MV-06', rank: 6, kind: 'relocate', skuId: 'SKU-30112',
    from: 'A03', to: 'E08', toTier: 1,
    note: 'Enabler: costs −456 ft/day but frees prime A03 for MV-08.',
  },
  {
    id: 'MV-07', rank: 7, kind: 'swap', skuId: 'SKU-83321',
    from: 'C09', to: 'B05', toTier: 2, backTier: 1,
    note: 'Bottle out of the deep bay; crampon strap takes the C09 floor slot.',
  },
  {
    id: 'MV-08', rank: 8, kind: 'relocate', skuId: 'SKU-55810',
    from: 'D05', to: 'A03', toTier: 2,
    note: 'Depends on MV-06 — destination A03 is occupied until it runs.',
  },
];

type MoveState = 'proposed' | 'applied' | 'skipped';
type PlanFilter = 'all' | 'proposed' | 'done';

// ============= TEMPLATE CSS =============
// Density grid, verbatim: header 56 · KPI tiles 84 · heatmap cells 44px
// tall / minmax(44px,1fr) wide, 4px gap · aisle rail 34 · inspector
// strip min 92 · move rows min 68 · plan panel 380 · buttons >=40px hit
// height.
const TEMPLATE_CSS = \`
.tpl-warehouse-slotting-optimizer {
  height: 100dvh;
  width: 100%;
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
}
.tpl-warehouse-slotting-optimizer .wso-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 380px; /* plan panel 380 */
  height: 100%;
  min-height: 0;
}
.tpl-warehouse-slotting-optimizer .wso-map-col {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}
.tpl-warehouse-slotting-optimizer .wso-plan-col {
  min-height: 0;
  overflow-y: auto;
  border-inline-start: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
}
/* ---- header chrome (56px LayoutHeader) ---- */
.tpl-warehouse-slotting-optimizer .wso-header-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  min-width: 0;
}
.tpl-warehouse-slotting-optimizer .wso-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1;
}
.tpl-warehouse-slotting-optimizer .wso-brand-name {
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.01em;
}
.tpl-warehouse-slotting-optimizer .wso-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-warehouse-slotting-optimizer .wso-savings-chip {
  display: inline-flex;
  gap: 6px;
  border: var(--border-width) solid \${ACCENT};
  background: \${ACCENT_WASH};
  border-radius: 8px;
  padding: 6px 12px;
  min-height: 40px;
  box-sizing: border-box;
  align-items: center;
}
.tpl-warehouse-slotting-optimizer .wso-savings-num {
  font-size: 18px;
  font-weight: 700;
  color: \${ACCENT};
  font-variant-numeric: tabular-nums;
}
.tpl-warehouse-slotting-optimizer .wso-savings-unit {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* ---- KPI band: 84px tiles ---- */
.tpl-warehouse-slotting-optimizer .wso-kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--spacing-3);
}
.tpl-warehouse-slotting-optimizer .wso-kpi {
  min-height: 84px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  box-sizing: border-box;
}
.tpl-warehouse-slotting-optimizer .wso-kpi-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}
.tpl-warehouse-slotting-optimizer .wso-kpi-value {
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.tpl-warehouse-slotting-optimizer .wso-kpi-sub {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.tpl-warehouse-slotting-optimizer .wso-kpi-gain { color: \${GAIN}; }
/* ---- heatmap card ---- */
.tpl-warehouse-slotting-optimizer .wso-map-card {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.tpl-warehouse-slotting-optimizer .wso-map-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-warehouse-slotting-optimizer .wso-map-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}
.tpl-warehouse-slotting-optimizer .wso-legend {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.tpl-warehouse-slotting-optimizer .wso-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: var(--color-text-secondary);
}
.tpl-warehouse-slotting-optimizer .wso-legend-swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: var(--border-width) solid var(--color-border);
}
.tpl-warehouse-slotting-optimizer .wso-map-scroll {
  overflow-x: auto;
  padding-block-start: 8px; /* room for FROM/TO tags on row-1 cells */
}
/* Aisle rail 34px + 10 bay columns minmax(44px,1fr), 4px gap. Fits the
   ~630px map column at the ~1045px stage width without scrolling. */
.tpl-warehouse-slotting-optimizer .wso-grid {
  display: grid;
  grid-template-columns: 34px repeat(10, minmax(44px, 1fr));
  gap: 4px;
  min-width: 560px;
}
.tpl-warehouse-slotting-optimizer .wso-axis {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-height: 20px;
}
.tpl-warehouse-slotting-optimizer .wso-cell {
  height: 44px; /* heatmap cell 44 */
  border-radius: 6px;
  border: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-family: inherit;
  cursor: pointer;
  position: relative;
}
.tpl-warehouse-slotting-optimizer .wso-cell-class {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.1;
}
.tpl-warehouse-slotting-optimizer .wso-cell-picks {
  font-size: 10px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  opacity: 0.85;
}
.tpl-warehouse-slotting-optimizer .wso-cell-empty {
  background: transparent;
  border-style: dashed;
  color: var(--color-text-secondary);
}
.tpl-warehouse-slotting-optimizer .wso-cell-selected {
  outline: 2px solid \${ACCENT};
  outline-offset: 1px;
}
.tpl-warehouse-slotting-optimizer .wso-cell-route {
  outline: 2px dashed \${ACCENT};
  outline-offset: 1px;
}
.tpl-warehouse-slotting-optimizer .wso-cell-tag {
  position: absolute;
  top: -8px;
  inset-inline-end: -3px;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 1px 4px;
  border-radius: 4px;
  background: \${ACCENT};
  color: light-dark(#FFFFFF, #17181A);
  pointer-events: none;
}
/* ---- slot inspector strip: min 92px ---- */
.tpl-warehouse-slotting-optimizer .wso-inspector {
  min-height: 92px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 6px;
  box-sizing: border-box;
}
.tpl-warehouse-slotting-optimizer .wso-inspector-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 13px;
  font-weight: 600;
  min-width: 0;
}
.tpl-warehouse-slotting-optimizer .wso-inspector-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}
.tpl-warehouse-slotting-optimizer .wso-inspector-facts {
  display: flex;
  gap: var(--spacing-3);
  flex-wrap: wrap;
}
.tpl-warehouse-slotting-optimizer .wso-fact {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.tpl-warehouse-slotting-optimizer .wso-fact-label {
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
}
.tpl-warehouse-slotting-optimizer .wso-fact-value {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.tpl-warehouse-slotting-optimizer .wso-inspector-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* ---- move plan panel ---- */
.tpl-warehouse-slotting-optimizer .wso-plan-head {
  padding: var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  border-block-end: var(--border-width) solid var(--color-border);
}
.tpl-warehouse-slotting-optimizer .wso-plan-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-2);
}
.tpl-warehouse-slotting-optimizer .wso-plan-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
}
.tpl-warehouse-slotting-optimizer .wso-move {
  min-height: 68px; /* move rows min 68 */
  padding: 10px var(--spacing-3);
  border-block-end: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tpl-warehouse-slotting-optimizer .wso-move-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-warehouse-slotting-optimizer .wso-move-rank {
  flex: none;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: var(--border-width) solid var(--color-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.tpl-warehouse-slotting-optimizer .wso-move-sku {
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  flex: 1;
}
.tpl-warehouse-slotting-optimizer .wso-move-route {
  font-family: \${MONO_FONT};
  font-size: 11.5px;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}
.tpl-warehouse-slotting-optimizer .wso-move-chips {
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
}
.tpl-warehouse-slotting-optimizer .wso-stat {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.tpl-warehouse-slotting-optimizer .wso-stat strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.tpl-warehouse-slotting-optimizer .wso-gain { color: \${GAIN}; font-weight: 700; }
.tpl-warehouse-slotting-optimizer .wso-loss { color: \${LOSS}; font-weight: 700; }
.tpl-warehouse-slotting-optimizer .wso-move-note {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}
.tpl-warehouse-slotting-optimizer .wso-move-actions {
  display: flex;
  gap: var(--spacing-2);
  align-items: center;
  flex-wrap: wrap;
}
.tpl-warehouse-slotting-optimizer .wso-blocked {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: \${LOSS};
}
.tpl-warehouse-slotting-optimizer .wso-move-selected {
  background: \${ACCENT_WASH};
}
.tpl-warehouse-slotting-optimizer .wso-plan-foot {
  padding: var(--spacing-3);
  font-size: 11.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}
/* Row container is also a button (select-to-highlight); keep it plain. */
.tpl-warehouse-slotting-optimizer .wso-rowbtn {
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font: inherit;
  color: inherit;
  text-align: inherit;
  width: 100%;
  cursor: pointer;
  display: block;
}
.tpl-warehouse-slotting-optimizer button:focus-visible {
  outline: 2px solid \${ACCENT};
  outline-offset: 2px;
}
.tpl-warehouse-slotting-optimizer .wso-vh {
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
  .tpl-warehouse-slotting-optimizer .wso-cell {
    transition: outline-color 160ms ease, opacity 160ms ease;
  }
}
/* <=920px: single column — plan panel below the map, page scrolls whole. */
@media (max-width: 920px) {
  .tpl-warehouse-slotting-optimizer .wso-main {
    display: block;
    overflow-y: auto;
  }
  .tpl-warehouse-slotting-optimizer .wso-map-col {
    overflow-y: visible;
    height: auto;
  }
  .tpl-warehouse-slotting-optimizer .wso-plan-col {
    overflow-y: visible;
    height: auto;
    border-inline-start: none;
    border-block-start: var(--border-width) solid var(--color-border);
  }
}
/* <=560px (390 embed): KPI band 2×2; heatmap scrolls inside its card. */
@media (max-width: 560px) {
  .tpl-warehouse-slotting-optimizer .wso-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .tpl-warehouse-slotting-optimizer .wso-brand-sub {
    display: none;
  }
}
\`;

// ============= BRAND MARK =============
// Slotwise mark: a rounded rack outline with four slot bars, the hot slot
// filled in the accent — inline SVG; chrome strokes use currentColor so
// the mark themes with the header text.
function SlotwiseMark() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false">
      <rect
        x="2.5"
        y="3.5"
        width="19"
        height="17"
        rx="3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <rect x="6" y="7" width="5" height="4" rx="1" style={{fill: ACCENT}} />
      <rect x="13" y="7" width="5" height="4" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="6" y="13" width="5" height="4" rx="1" fill="currentColor" opacity="0.35" />
      <rect x="13" y="13" width="5" height="4" rx="1" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

// ============= DERIVATION HELPERS =============

/** Σ picksPerDay × roundTripFt over every occupied slot. */
function totalTravelFt(occupancy: OccupancyMap): number {
  let total = 0;
  for (const [slot, placement] of Object.entries(occupancy)) {
    if (placement !== null) {
      total += skuOf(placement.skuId).picksPerDay * roundTripFt(slot);
    }
  }
  return total;
}

/** % of occupants whose round-trip is inside their class band. */
function velocityFitPct(occupancy: OccupancyMap): number {
  let occupied = 0;
  let fitting = 0;
  for (const [slot, placement] of Object.entries(occupancy)) {
    if (placement === null) {
      continue;
    }
    occupied += 1;
    const sku = skuOf(placement.skuId);
    if (roundTripFt(slot) <= FIT_MAX_FT[sku.velClass]) {
      fitting += 1;
    }
  }
  return occupied === 0 ? 100 : Math.round((fitting / occupied) * 100);
}

/**
 * Live worth of a move against the CURRENT map (positive = feet saved).
 * Relocate: picks × (rt(from) − rt(to)). Swap adds the partner's reverse
 * leg. Returns null when the move's occupants are no longer where the
 * plan expects them (already applied, or the map changed under it).
 */
function savingsOf(move: MovePlanRow, occupancy: OccupancyMap): number | null {
  const fromPlacement = occupancy[move.from];
  if (fromPlacement === null || fromPlacement.skuId !== move.skuId) {
    return null;
  }
  const delta = roundTripFt(move.from) - roundTripFt(move.to);
  const primary = skuOf(move.skuId).picksPerDay * delta;
  if (move.kind === 'relocate') {
    return primary;
  }
  const partner = occupancy[move.to];
  if (partner === null) {
    return null;
  }
  return primary - skuOf(partner.skuId).picksPerDay * delta;
}

/** Destination fill % once the move lands (sku cube / slot capacity). */
function cubeFillPct(move: MovePlanRow): number {
  return Math.round(
    (skuOf(move.skuId).cubeFt3 / slotCapacityFt3(move.to)) * 100,
  );
}

function formatFt(value: number): string {
  return value.toLocaleString('en-US');
}

function formatSigned(value: number): string {
  return \`\${value >= 0 ? '+' : '−'}\${formatFt(Math.abs(value))}\`;
}

// ============= PAGE =============

export default function WarehouseSlottingOptimizerTemplate() {
  const toast = useToast();

  // One state owner: the occupancy map + per-move lifecycle. Every ft/day
  // figure on the page derives from these two values.
  const [occupancy, setOccupancy] = useState<OccupancyMap>(buildInitialOccupancy);
  const [moveStates, setMoveStates] = useState<Record<string, MoveState>>(
    () => Object.fromEntries(MOVE_PLAN.map(move => [move.id, 'proposed'])),
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>('F07');
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>('MV-01');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('all');
  const [announcement, setAnnouncement] = useState('');

  const baselineTravel = useMemo(
    () => totalTravelFt(buildInitialOccupancy()),
    [],
  );
  const currentTravel = totalTravelFt(occupancy);
  const savedFt = baselineTravel - currentTravel;
  const savedMin = savedFt / FT_PER_MIN;
  const fitPct = velocityFitPct(occupancy);
  const appliedCount = Object.values(moveStates).filter(
    state => state === 'applied',
  ).length;

  const selectedMove =
    selectedMoveId === null
      ? null
      : (MOVE_PLAN.find(move => move.id === selectedMoveId) ?? null);

  // A proposed relocate is blocked while its destination is occupied
  // (derived, never stored — MV-08 unblocks the moment MV-06 applies).
  const isBlocked = (move: MovePlanRow): boolean =>
    move.kind === 'relocate' &&
    moveStates[move.id] === 'proposed' &&
    occupancy[move.to] !== null;

  const blockerOf = (move: MovePlanRow): string | null => {
    if (!isBlocked(move)) {
      return null;
    }
    const squatter = occupancy[move.to];
    if (squatter === null) {
      return null;
    }
    const enabler = MOVE_PLAN.find(
      other =>
        other.id !== move.id &&
        moveStates[other.id] === 'proposed' &&
        other.from === move.to,
    );
    return enabler !== undefined
      ? \`destination \${move.to} occupied — apply \${enabler.id} first\`
      : \`destination \${move.to} occupied by \${skuOf(squatter.skuId).id}\`;
  };

  // ---- mutations ----

  const applyMove = (move: MovePlanRow) => {
    const blocked = blockerOf(move);
    if (blocked !== null) {
      toast({body: \`\${move.id} refused: \${blocked}.\`, isAutoHide: true});
      return;
    }
    const worth = savingsOf(move, occupancy);
    setOccupancy(prev => {
      const next = {...prev};
      const mover = prev[move.from];
      if (mover === null || mover.skuId !== move.skuId) {
        return prev;
      }
      if (move.kind === 'swap') {
        const partner = prev[move.to];
        next[move.to] = {skuId: move.skuId, tier: move.toTier};
        next[move.from] =
          partner === null
            ? null
            : {skuId: partner.skuId, tier: move.backTier ?? partner.tier};
      } else {
        next[move.to] = {skuId: move.skuId, tier: move.toTier};
        next[move.from] = null;
      }
      return next;
    });
    setMoveStates(prev => ({...prev, [move.id]: 'applied'}));
    setSelectedSlot(move.to);
    const worthLabel = worth === null ? '—' : \`\${formatSigned(worth)} ft/day\`;
    toast({
      body: \`\${move.id} applied — \${skuOf(move.skuId).id} now in \${move.to} (\${worthLabel}).\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${move.id} applied. \${skuOf(move.skuId).id} moved from \${move.from} to \${move.to}. \${worthLabel} banked.\`,
    );
  };

  const revertMove = (move: MovePlanRow) => {
    // Reverting an applied relocate needs its ORIGIN free again; a swap
    // reverts unconditionally because both occupants are known.
    if (
      move.kind === 'relocate' &&
      occupancy[move.from] !== null
    ) {
      toast({
        body: \`\${move.id} cannot revert: origin \${move.from} has been refilled.\`,
        isAutoHide: true,
      });
      return;
    }
    const initialTier =
      INITIAL_PLACEMENTS.find(entry => entry.skuId === move.skuId)?.tier ?? 2;
    setOccupancy(prev => {
      const next = {...prev};
      const mover = prev[move.to];
      if (mover === null || mover.skuId !== move.skuId) {
        return prev;
      }
      if (move.kind === 'swap') {
        const partner = prev[move.from];
        const partnerInitialTier =
          partner === null
            ? 2
            : (INITIAL_PLACEMENTS.find(entry => entry.skuId === partner.skuId)
                ?.tier ?? 2);
        next[move.from] = {skuId: move.skuId, tier: initialTier};
        next[move.to] =
          partner === null
            ? null
            : {skuId: partner.skuId, tier: partnerInitialTier};
      } else {
        next[move.from] = {skuId: move.skuId, tier: initialTier};
        next[move.to] = null;
      }
      return next;
    });
    setMoveStates(prev => ({...prev, [move.id]: 'proposed'}));
    setSelectedSlot(move.from);
    toast({
      body: \`\${move.id} reverted — \${skuOf(move.skuId).id} back in \${move.from}.\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${move.id} reverted. \${skuOf(move.skuId).id} returned to \${move.from}.\`,
    );
  };

  const skipMove = (move: MovePlanRow) => {
    setMoveStates(prev => ({...prev, [move.id]: 'skipped'}));
    setAnnouncement(\`\${move.id} skipped.\`);
  };

  const restoreMove = (move: MovePlanRow) => {
    setMoveStates(prev => ({...prev, [move.id]: 'proposed'}));
    setAnnouncement(\`\${move.id} restored to the plan.\`);
  };

  const resetPlan = () => {
    setOccupancy(buildInitialOccupancy());
    setMoveStates(
      Object.fromEntries(MOVE_PLAN.map(move => [move.id, 'proposed'])),
    );
    setSelectedSlot('F07');
    setSelectedMoveId('MV-01');
    toast({body: 'Plan reset — baseline slotting restored.', isAutoHide: true});
    setAnnouncement('Plan reset. Baseline slotting restored.');
  };

  const selectMove = (moveId: string) => {
    const next = selectedMoveId === moveId ? null : moveId;
    setSelectedMoveId(next);
    if (next !== null) {
      const move = MOVE_PLAN.find(entry => entry.id === next);
      if (move !== undefined) {
        // Focus the inspector on whichever end currently holds the SKU.
        const at =
          occupancy[move.from]?.skuId === move.skuId ? move.from : move.to;
        setSelectedSlot(at);
      }
    }
  };

  // ---- plan rows through the filter ----
  const visibleMoves = MOVE_PLAN.filter(move => {
    const state = moveStates[move.id];
    if (planFilter === 'proposed') {
      return state === 'proposed';
    }
    if (planFilter === 'done') {
      return state !== 'proposed';
    }
    return true;
  });

  const proposedTotal = MOVE_PLAN.reduce((sum, move) => {
    if (moveStates[move.id] !== 'proposed') {
      return sum;
    }
    const worth = savingsOf(move, occupancy);
    return worth === null ? sum : sum + worth;
  }, 0);

  // ---- inspector readout ----
  const inspectorPlacement =
    selectedSlot === null ? null : occupancy[selectedSlot];
  const inspectorSku =
    inspectorPlacement === null || inspectorPlacement === undefined
      ? null
      : skuOf(inspectorPlacement.skuId);
  const inspectorMove =
    selectedSlot === null
      ? null
      : (MOVE_PLAN.find(
          move =>
            moveStates[move.id] === 'proposed' &&
            (move.from === selectedSlot || move.to === selectedSlot),
        ) ?? null);

  return (
    <div className="tpl-warehouse-slotting-optimizer">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="wso-header-row">
              <div className="wso-brand">
                <SlotwiseMark />
                <div>
                  <div className="wso-brand-name">
                    <h1 className="wso-vh">
                      Slotwise warehouse slotting optimizer
                    </h1>
                    <span aria-hidden>Slotwise</span>
                  </div>
                  <div className="wso-brand-sub">
                    DC-12 · Reno, NV · slotting wave 26-W28
                  </div>
                </div>
              </div>
              <div
                className="wso-savings-chip"
                role="status"
                aria-label={\`Travel saved: \${formatFt(savedFt)} feet per day, about \${savedMin.toFixed(1)} minutes per shift\`}>
                <span className="wso-savings-num">{formatFt(savedFt)}</span>
                <span className="wso-savings-unit">
                  ft/day saved · ≈{savedMin.toFixed(1)} min/shift
                </span>
              </div>
              <Button
                label="Reset plan"
                variant="ghost"
                size="sm"
                icon={<Icon icon={RotateCcwIcon} size="sm" />}
                onClick={resetPlan}
              />
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" className="wso-vh">
              {announcement}
            </div>
            <div className="wso-main">
              {/* ============ MAP COLUMN ============ */}
              <div className="wso-map-col">
                <section className="wso-kpis" aria-label="Slotting KPIs">
                  <div className="wso-kpi">
                    <span className="wso-kpi-label">Daily pick travel</span>
                    <span className="wso-kpi-value">
                      {formatFt(currentTravel)} ft
                    </span>
                    <span className="wso-kpi-sub">
                      baseline {formatFt(baselineTravel)} ft
                    </span>
                  </div>
                  <div className="wso-kpi">
                    <span className="wso-kpi-label">Saved vs baseline</span>
                    <span className="wso-kpi-value wso-kpi-gain">
                      {formatSigned(savedFt)} ft
                    </span>
                    <span className="wso-kpi-sub">
                      ≈ {savedMin.toFixed(1)} walking min/shift
                    </span>
                  </div>
                  <div className="wso-kpi">
                    <span className="wso-kpi-label">Moves applied</span>
                    <span className="wso-kpi-value">
                      {appliedCount}/{MOVE_PLAN.length}
                    </span>
                    <span className="wso-kpi-sub">
                      {formatSigned(proposedTotal)} ft/day still on the table
                    </span>
                  </div>
                  <div className="wso-kpi">
                    <span className="wso-kpi-label">Velocity fit</span>
                    <span className="wso-kpi-value">{fitPct}%</span>
                    <span className="wso-kpi-sub">
                      occupants inside their class band
                    </span>
                  </div>
                </section>

                <section className="wso-map-card" aria-label="Slot velocity heatmap">
                  <div className="wso-map-head">
                    <h2 className="wso-map-title">
                      Pick module M-2 — aisle × bay velocity heatmap
                    </h2>
                    <div className="wso-legend" aria-hidden>
                      {(Object.keys(VELOCITY_RAMP) as VelocityClass[]).map(
                        velClass => (
                          <span className="wso-legend-item" key={velClass}>
                            <span
                              className="wso-legend-swatch"
                              style={{background: VELOCITY_RAMP[velClass].bg}}
                            />
                            {velClass} {VELOCITY_BOUNDS[velClass]}
                          </span>
                        ),
                      )}
                      <span className="wso-legend-item">
                        <span className="wso-legend-swatch" />
                        empty
                      </span>
                    </div>
                  </div>
                  <div className="wso-map-scroll">
                    <div className="wso-grid">
                      <span className="wso-axis" aria-hidden />
                      {BAYS.map(bay => (
                        <span className="wso-axis" key={\`bay-\${bay}\`} aria-hidden>
                          {String(bay).padStart(2, '0')}
                        </span>
                      ))}
                      {AISLES.map(aisle => (
                        <SlotRow
                          key={aisle}
                          aisle={aisle}
                          occupancy={occupancy}
                          selectedSlot={selectedSlot}
                          selectedMove={
                            selectedMove !== null &&
                            moveStates[selectedMove.id] === 'proposed'
                              ? selectedMove
                              : null
                          }
                          onSelect={setSelectedSlot}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                <section
                  className="wso-inspector"
                  aria-label="Slot inspector"
                  aria-live="polite">
                  {selectedSlot === null ? (
                    <span className="wso-inspector-hint">
                      Select a slot on the heatmap to inspect its occupant,
                      travel cost, and move involvement.
                    </span>
                  ) : inspectorSku === null ? (
                    <>
                      <div className="wso-inspector-title">
                        <Badge label={selectedSlot} variant="neutral" />
                        <span className="wso-inspector-name">Empty slot</span>
                      </div>
                      <div className="wso-inspector-facts">
                        <span className="wso-fact">
                          <span className="wso-fact-label">Round trip</span>
                          <span className="wso-fact-value">
                            {roundTripFt(selectedSlot)} ft
                          </span>
                        </span>
                        <span className="wso-fact">
                          <span className="wso-fact-label">Capacity</span>
                          <span className="wso-fact-value">
                            {slotCapacityFt3(selectedSlot)} ft³
                          </span>
                        </span>
                        {inspectorMove !== null && (
                          <span className="wso-fact">
                            <span className="wso-fact-label">Planned</span>
                            <span className="wso-fact-value">
                              receives {skuOf(inspectorMove.skuId).id} via{' '}
                              {inspectorMove.id}
                            </span>
                          </span>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="wso-inspector-title">
                        <Badge label={selectedSlot} variant="neutral" />
                        <span className="wso-inspector-name">
                          {inspectorSku.id} — {inspectorSku.name}
                        </span>
                        <Badge
                          label={\`class \${inspectorSku.velClass}\`}
                          variant={
                            inspectorSku.velClass === 'A'
                              ? 'success'
                              : inspectorSku.velClass === 'D'
                                ? 'neutral'
                                : 'info'
                          }
                        />
                      </div>
                      <div className="wso-inspector-facts">
                        <span className="wso-fact">
                          <span className="wso-fact-label">Picks/day</span>
                          <span className="wso-fact-value">
                            {inspectorSku.picksPerDay}
                          </span>
                        </span>
                        <span className="wso-fact">
                          <span className="wso-fact-label">Round trip</span>
                          <span className="wso-fact-value">
                            {roundTripFt(selectedSlot)} ft
                          </span>
                        </span>
                        <span className="wso-fact">
                          <span className="wso-fact-label">Daily travel</span>
                          <span className="wso-fact-value">
                            {formatFt(
                              inspectorSku.picksPerDay *
                                roundTripFt(selectedSlot),
                            )}{' '}
                            ft
                          </span>
                        </span>
                        <span className="wso-fact">
                          <span className="wso-fact-label">Cube</span>
                          <span className="wso-fact-value">
                            {inspectorSku.cubeFt3.toFixed(1)} /{' '}
                            {slotCapacityFt3(selectedSlot)} ft³
                          </span>
                        </span>
                        <span className="wso-fact">
                          <span className="wso-fact-label">Tier</span>
                          <span className="wso-fact-value">
                            {inspectorPlacement === null ||
                            inspectorPlacement === undefined
                              ? '—'
                              : TIER_LABEL[inspectorPlacement.tier]}
                          </span>
                        </span>
                        {inspectorMove !== null && (
                          <span className="wso-fact">
                            <span className="wso-fact-label">Planned</span>
                            <span className="wso-fact-value">
                              {inspectorMove.id}:{' '}
                              {inspectorMove.from === selectedSlot
                                ? \`→ \${inspectorMove.to}\`
                                : \`← \${inspectorMove.from}\`}
                            </span>
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </section>
              </div>

              {/* ============ MOVE PLAN PANEL ============ */}
              <aside className="wso-plan-col" aria-label="Ranked move plan">
                <div className="wso-plan-head">
                  <div className="wso-plan-title-row">
                    <h2 className="wso-plan-title">Ranked move plan</h2>
                    <Badge
                      label={\`\${appliedCount} applied · \${
                        MOVE_PLAN.length - appliedCount
                      } open\`}
                      variant="neutral"
                    />
                  </div>
                  <SegmentedControl
                    label="Move plan filter"
                    value={planFilter}
                    onChange={value => setPlanFilter(value as PlanFilter)}
                    size="sm">
                    <SegmentedControlItem value="all" label="All" />
                    <SegmentedControlItem value="proposed" label="Proposed" />
                    <SegmentedControlItem value="done" label="Done" />
                  </SegmentedControl>
                </div>

                {visibleMoves.length === 0 ? (
                  <EmptyState
                    title="Nothing here"
                    description="No moves match this filter — accept or skip rows under Proposed to populate Done."
                  />
                ) : (
                  visibleMoves.map(move => (
                    <MoveRow
                      key={move.id}
                      move={move}
                      state={moveStates[move.id]}
                      savings={savingsOf(move, occupancy)}
                      blocked={blockerOf(move)}
                      isSelected={selectedMoveId === move.id}
                      onSelect={() => selectMove(move.id)}
                      onAccept={() => applyMove(move)}
                      onSkip={() => skipMove(move)}
                      onRevert={() => revertMove(move)}
                      onRestore={() => restoreMove(move)}
                    />
                  ))
                )}

                <div className="wso-plan-foot">
                  Savings recompute from the live slot map: relocate = picks ×
                  (round-trip from − round-trip to); swaps add the partner
                  SKU&apos;s reverse leg. MV-06 is a deliberate negative
                  enabler — it frees prime bay A03 so MV-08 can land.
                </div>
              </aside>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

// ============= SLOT ROW =============
// One aisle of the heatmap: 34px rail label + 10 slot buttons. Cells are
// real <button>s (aria-pressed = inspector selection) whose color comes
// from the occupant's velocity class; FROM/TO tags annotate the ends of
// the selected proposed move.

interface SlotRowProps {
  aisle: Aisle;
  occupancy: OccupancyMap;
  selectedSlot: string | null;
  selectedMove: MovePlanRow | null;
  onSelect: (slot: string) => void;
}

function SlotRow({
  aisle,
  occupancy,
  selectedSlot,
  selectedMove,
  onSelect,
}: SlotRowProps) {
  return (
    <>
      <span className="wso-axis" aria-hidden>
        {aisle}
      </span>
      {BAYS.map(bay => {
        const slot = slotId(aisle, bay);
        const placement = occupancy[slot];
        const sku = placement === null ? null : skuOf(placement.skuId);
        const isSelected = selectedSlot === slot;
        const routeEnd =
          selectedMove === null
            ? null
            : selectedMove.from === slot
              ? 'FROM'
              : selectedMove.to === slot
                ? 'TO'
                : null;
        const className = [
          'wso-cell',
          sku === null ? 'wso-cell-empty' : '',
          isSelected ? 'wso-cell-selected' : '',
          routeEnd !== null ? 'wso-cell-route' : '',
        ]
          .filter(Boolean)
          .join(' ');
        const label =
          sku === null
            ? \`Slot \${slot}, empty, round trip \${roundTripFt(slot)} feet\`
            : \`Slot \${slot}, \${sku.id} \${sku.name}, class \${sku.velClass}, \${sku.picksPerDay} picks per day, \${TIER_LABEL[placement?.tier ?? 2]} tier\`;
        return (
          <button
            key={slot}
            type="button"
            className={className}
            style={
              sku === null
                ? undefined
                : {
                    background: VELOCITY_RAMP[sku.velClass].bg,
                    color: VELOCITY_RAMP[sku.velClass].fg,
                  }
            }
            aria-pressed={isSelected}
            aria-label={label}
            onClick={() => onSelect(slot)}>
            {routeEnd !== null && (
              <span className="wso-cell-tag" aria-hidden>
                {routeEnd}
              </span>
            )}
            {sku === null ? (
              <span className="wso-cell-picks" aria-hidden>
                {slot}
              </span>
            ) : (
              <>
                <span className="wso-cell-class" aria-hidden>
                  {sku.velClass}
                </span>
                <span className="wso-cell-picks" aria-hidden>
                  {sku.picksPerDay}/d
                </span>
              </>
            )}
          </button>
        );
      })}
    </>
  );
}

// ============= MOVE ROW =============
// 68px-min plan row. The header strip is a select button (highlights the
// route on the heatmap); Accept / Skip / Revert / Restore are separate
// real buttons so the row never nests interactive elements.

interface MoveRowProps {
  move: MovePlanRow;
  state: MoveState;
  savings: number | null;
  blocked: string | null;
  isSelected: boolean;
  onSelect: () => void;
  onAccept: () => void;
  onSkip: () => void;
  onRevert: () => void;
  onRestore: () => void;
}

function MoveRow({
  move,
  state,
  savings,
  blocked,
  isSelected,
  onSelect,
  onAccept,
  onSkip,
  onRevert,
  onRestore,
}: MoveRowProps) {
  const sku = skuOf(move.skuId);
  const strainFrom =
    INITIAL_PLACEMENTS.find(entry => entry.skuId === move.skuId)?.tier ?? 2;
  return (
    <div
      className={\`wso-move\${isSelected ? ' wso-move-selected' : ''}\${
        state === 'applied' ? ' wso-move-applied' : ''
      }\`}>
      <button
        type="button"
        className="wso-rowbtn"
        aria-pressed={isSelected}
        aria-label={\`\${move.id}, rank \${move.rank}: move \${sku.id} from \${move.from} to \${move.to}. \${
          isSelected ? 'Selected — route shown on heatmap.' : 'Select to show route on heatmap.'
        }\`}
        onClick={onSelect}>
        <span className="wso-move-top">
          <span className="wso-move-rank" aria-hidden>
            {move.rank}
          </span>
          <span className="wso-move-sku">
            {sku.id} · {sku.name}
          </span>
          <span className="wso-move-route" aria-hidden>
            {move.from}
            <Icon icon={ArrowRightIcon} size="xsm" color="inherit" />
            {move.to}
          </span>
        </span>
      </button>
      <div className="wso-move-chips">
        <span className="wso-stat">
          <span
            className={
              savings === null ? undefined : savings >= 0 ? 'wso-gain' : 'wso-loss'
            }>
            {savings === null ? 'banked' : \`\${formatSigned(savings)} ft/day\`}
          </span>
        </span>
        <span className="wso-stat">
          cube <strong>{cubeFillPct(move)}%</strong> of{' '}
          {slotCapacityFt3(move.to)} ft³
        </span>
        <span className="wso-stat">
          strain <strong>
            {TIER_LABEL[strainFrom]} → {TIER_LABEL[move.toTier]}
          </strong>
        </span>
        {move.kind === 'swap' && <Badge label="swap" variant="info" />}
      </div>
      <div className="wso-move-note">{move.note}</div>
      <div className="wso-move-actions">
        {state === 'proposed' && blocked !== null && (
          <span className="wso-blocked" role="status">
            <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
            {blocked}
          </span>
        )}
        {state === 'proposed' && (
          <>
            <Button
              label="Accept move"
              variant="primary"
              size="sm"
              icon={<Icon icon={CheckIcon} size="sm" />}
              isDisabled={blocked !== null}
              onClick={onAccept}
            />
            <Button
              label="Skip"
              variant="ghost"
              size="sm"
              icon={<Icon icon={XIcon} size="sm" />}
              onClick={onSkip}
            />
          </>
        )}
        {state === 'applied' && (
          <>
            <Badge label="applied" variant="success" />
            <Button
              label="Revert"
              variant="ghost"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" />}
              onClick={onRevert}
            />
          </>
        )}
        {state === 'skipped' && (
          <>
            <Badge label="skipped" variant="neutral" />
            <Button
              label="Restore"
              variant="ghost"
              size="sm"
              onClick={onRestore}
            />
          </>
        )}
      </div>
    </div>
  );
}
`;export{e as default};