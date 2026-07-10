// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Curbside AM inspection routes for
 *   the City of Norvale Building & Safety department, Thursday Jul 16 2026.
 *   Two inspectors leave the yard at 120 Bay Ave (grid 1,5) at 8:00 AM.
 *   Drive time = Manhattan blocks × 2 min. Hand-verified ledgers:
 *   R-14 Marisol Vega (6 stops, initial order): drives 4+6+6+8+10+16 = 50
 *   min, inspects 40+50+25+35+45+30 = 225 min, ETAs 8:04 / 8:50 / 9:46 /
 *   10:19 / 11:04 / 12:05, ends 12:35 PM — stop 5 (BLD-2026-04502,
 *   window 10:00–11:00) is reached 11:04, a 4-minute window miss that
 *   moving the stop one position earlier cures (arrive 10:25 after the
 *   9:46 stop, end of day slides to 12:47).
 *   R-07 Owen Tran (5 stops): drives 6+6+6+6+8 = 32 min, inspects
 *   45+30+35+25+40 = 175 min, ETAs 8:06 / 8:57 / 9:33 / 10:14 / 10:47
 *   (waits 13 min for the 11:00 window), ends 11:40 AM, zero misses.
 *   Citywide rollup: 11 stops · 1 window miss · 82 min combined drive.
 *   No clock reads, no randomness, no timers, no network tiles — the
 *   map is a schematic street-grid SVG, not a real map.
 * @output Curbside — Permit Inspection Route: the dispatcher's morning
 *   board for same-day inspection routing. A 56px topbar (curb-and-route
 *   mark · route date · derived citywide chips · Reset); a left 424px
 *   ordered stop list under an R-14/R-07 inspector switch and four derived
 *   stat tiles (drive, inspect, end ETA, misses), each 76px stop row
 *   carrying seq badge, permit id, address, type glyph, time window, and a
 *   state-colored ETA chip (on-time / waits n min / misses window by n);
 *   selecting a row opens a 40px action bar (Move up · Move down ·
 *   Reassign to the other inspector). Right: the schematic street-grid SVG
 *   (labeled avenues × numbered streets, yard marker, numbered stop pins
 *   as real overlay buttons) with both inspectors' Manhattan route
 *   polylines and dashed miss-rings on late pins.
 *   Signature move: move or reassign a stop and the WHOLE surface
 *   re-derives in one render — the route polyline redraws through the new
 *   pin order, every downstream ETA chip recomputes, the wait/miss chips
 *   appear or clear, the four stat tiles and the citywide miss/drive chips
 *   update, and pins renumber on the map. A screenshot cannot show it.
 * @position Page template; emitted by `astryx template city-permit-inspection-route`
 *
 * Frame: root 100dvh div > Layout height="fill". header (topbar) |
 *   content: hand-rolled grid `424px minmax(0,1fr)` — stop-list column
 *   (inspector switch, stat tiles, scrolling rows) beside the map column
 *   (SVG + pin overlay + legend). Hand-rolled because the <=900px reflow
 *   reorders map above list, which width-pinned DS panels cannot express
 *   in a media query.
 * Container policy: work-surface archetype — rows, rails, one schematic
 *   canvas; no Cards. Stop rows, inspector tabs, and map pins are real
 *   `<button>`s; the map SVG itself is aria-hidden geometry (pins carry
 *   the semantics).
 * Color policy: token-pure chrome. ONE quarantined brand accent —
 *   Curbside steel blue light-dark(#1F5F8F, #8FC5EE): #1F5F8F on white =
 *   6.8:1, #8FC5EE on #1B1B1F = 9.2:1. R-07's route is slate
 *   light-dark(#475569, #94A3B8) (7.6:1 / 6.6:1). State pairs with math
 *   at declaration: on-time green light-dark(#15803D, #4ADE80) (5.0:1 /
 *   9.7:1), wait amber light-dark(#B45309, #FCD34D) (5.0:1 / 11.7:1),
 *   miss red light-dark(#B91C1C, #F87171) (6.5:1 / 6.1:1). The phantom
 *   bare color-text token is never referenced — SVG strokes use the
 *   pairs above or --color-border, never a bare text token.
 * Density grid (repeated verbatim): topbar 56 · list col 424 · tab row 44
 *   · stat tiles 64 · stop rows 76 · seq badge 24 · action buttons 40 ·
 *   ETA chip 22 · map aspect 660/560 · pin hit target 40 (26px visible
 *   dot) · gutter var(--spacing-4).
 * Fixture policy: stops, windows, durations, and grid coordinates are
 *   literal fixtures; EVERY time on screen (ETA, wait, miss, drive legs,
 *   per-inspector totals, end-of-day, citywide chips) derives from the one
 *   `computeRoute` fold over the current stop order, so a reorder or
 *   reassignment moves every surface in the same render.
 *
 * Responsive contract:
 * - Default desktop (~1045px demo stage — media queries do NOT fire
 *   there): list 424px + map ~620px, both columns fully usable.
 * - <= 900px: single scrolling column — map (fixed aspect) first, stop
 *   list after it; the inspector switch and stat tiles keep their heights.
 * - <= 600px: stat tiles wrap 2×2; the topbar chips wrap under the title;
 *   stop-row addresses ellipsize (the one squeezing segment) while the
 *   window/ETA cell keeps its width.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  ArrowDownIcon,
  ArrowLeftRightIcon,
  ArrowUpIcon,
  CarIcon,
  DropletsIcon,
  FlameIcon,
  HardHatIcon,
  RotateCcwIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// Curbside steel blue. #1F5F8F on white: L=0.105 → (1.05)/(0.155) = 6.8:1.
// #8FC5EE on #1B1B1F (L≈0.012): (0.569)/(0.062) = 9.2:1.
const ACCENT = 'light-dark(#1F5F8F, #8FC5EE)';
const ACCENT_TINT = 'light-dark(rgba(31, 95, 143, 0.10), rgba(143, 197, 238, 0.16))';
// R-07 route slate. #475569 on white: 7.6:1. #94A3B8 on #1B1B1F: 6.6:1.
const SLATE = 'light-dark(#475569, #94A3B8)';
const SLATE_TINT = 'light-dark(rgba(71, 85, 105, 0.10), rgba(148, 163, 184, 0.16))';
// On-time green. #15803D on white: 5.0:1. #4ADE80 on #1B1B1F: 9.7:1.
const OK = 'light-dark(#15803D, #4ADE80)';
// Wait amber. #B45309 on white: 5.0:1. #FCD34D on #1B1B1F: 11.7:1.
const WAIT = 'light-dark(#B45309, #FCD34D)';
const WAIT_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(252, 211, 77, 0.16))';
// Miss red. #B91C1C on white: 6.5:1. #F87171 on #1B1B1F: 6.1:1.
const MISS = 'light-dark(#B91C1C, #F87171)';
const MISS_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.16))';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — City of Norvale, Thursday Jul 16 2026, AM block.
// Grid coordinates are (avenue index 0–8, street index 0–6); drive time is
// Manhattan blocks × 2 min. The @input comment carries the hand-verified
// ETA ledger; computeRoute re-proves it live.
// ---------------------------------------------------------------------------

type InspectionType = 'electrical' | 'building' | 'plumbing' | 'mechanical';

type Stop = {
  id: string;
  permit: string;
  address: string;
  scope: string;
  type: InspectionType;
  /** Grid corner (avenue index, street index). */
  x: number;
  y: number;
  /** Arrival window, minutes since midnight. */
  windowStart: number;
  windowEnd: number;
  durationMin: number;
  contact: string;
};

type InspectorId = 'r14' | 'r07';

type Inspector = {
  id: InspectorId;
  badge: string;
  name: string;
  trades: string;
  color: string;
  tint: string;
};

const INSPECTORS: Record<InspectorId, Inspector> = {
  r14: {
    id: 'r14',
    badge: 'R-14',
    name: 'Marisol Vega',
    trades: 'Electrical · Building · Mechanical',
    color: ACCENT,
    tint: ACCENT_TINT,
  },
  r07: {
    id: 'r07',
    badge: 'R-07',
    name: 'Owen Tran',
    trades: 'Plumbing · Building · Electrical',
    color: SLATE,
    tint: SLATE_TINT,
  },
};

/** Yard: 120 Bay Ave (Bay & 2nd) — both routes start here at 8:00 AM. */
const DEPOT = {x: 1, y: 5};
const SHIFT_START_MIN = 8 * 60;
const MIN_PER_BLOCK = 2;

const STOPS: Stop[] = [
  // ---- R-14 Marisol Vega -------------------------------------------------
  {
    id: 'st-1192',
    permit: 'ELE-2026-01192',
    address: '214 Birch Ave',
    scope: 'Rough electrical — 2nd-floor addition',
    type: 'electrical',
    x: 2,
    y: 4,
    windowStart: 8 * 60,
    windowEnd: 10 * 60,
    durationMin: 40,
    contact: 'GC on site: Ferro Bros. (Nick, 555-0164)',
  },
  {
    id: 'st-4471',
    permit: 'BLD-2026-04471',
    address: '1180 3rd St',
    scope: 'Framing — mixed-use core & shell, floors 1–3',
    type: 'building',
    x: 5,
    y: 4,
    windowStart: 8 * 60,
    windowEnd: 10 * 60 + 30,
    durationMin: 50,
    contact: 'Super: D. Whitaker — check shear-wall nailing at grid C',
  },
  {
    id: 'st-2218',
    permit: 'PLM-2026-02218',
    address: '733 Dover Ave',
    scope: 'Water-heater replacement — final',
    type: 'plumbing',
    x: 6,
    y: 2,
    windowStart: 9 * 60,
    windowEnd: 11 * 60,
    durationMin: 25,
    contact: 'Homeowner: R. Castellanos (works from home)',
  },
  {
    id: 'st-0874',
    permit: 'MEC-2026-00874',
    address: '902 Elm Ave',
    scope: 'Furnace changeout — 80k BTU, new B-vent',
    type: 'mechanical',
    x: 7,
    y: 5,
    windowStart: 10 * 60,
    windowEnd: 12 * 60,
    durationMin: 35,
    contact: 'Tenant present 10–12 only (lunch-shift worker)',
  },
  {
    id: 'st-4502',
    permit: 'BLD-2026-04502',
    // Deliberate stress fixture: the longest address exercises the one
    // ellipsizing segment in the stop row.
    address: '445 Cedar Ave, rear accessory structure (alley access)',
    scope: 'Final building — detached ADU, incl. egress + smoke/CO',
    type: 'building',
    x: 3,
    y: 6,
    windowStart: 10 * 60,
    windowEnd: 11 * 60,
    durationMin: 45,
    contact: 'Owner-builder: P. Nakamura — dog in yard, call ahead',
  },
  {
    id: 'st-1201',
    permit: 'ELE-2026-01201',
    address: '88 Ash Ave',
    scope: '200A service upgrade — meter release',
    type: 'electrical',
    x: 0,
    y: 1,
    windowStart: 11 * 60,
    windowEnd: 13 * 60,
    durationMin: 30,
    contact: 'Norvale Power crew scheduled 2 PM — release before then',
  },
  // ---- R-07 Owen Tran ------------------------------------------------------
  {
    id: 'st-2201',
    permit: 'PLM-2026-02201',
    address: '316 Ash Ave',
    scope: 'Sewer lateral — open trench, camera on request',
    type: 'plumbing',
    x: 0,
    y: 3,
    windowStart: 8 * 60,
    windowEnd: 9 * 60 + 30,
    durationMin: 45,
    contact: 'Trench must close today — contractor holds the plate',
  },
  {
    id: 'st-4466',
    permit: 'BLD-2026-04466',
    address: '501 Birch Ave',
    scope: 'Drywall screw inspection — units 2A/2B',
    type: 'building',
    x: 2,
    y: 2,
    windowStart: 8 * 60 + 30,
    windowEnd: 10 * 60 + 30,
    durationMin: 30,
    contact: 'Lockbox 4471 — manager off site',
  },
  {
    id: 'st-1188',
    permit: 'ELE-2026-01188',
    address: '1420 6th St',
    scope: 'Panel swap — like-for-like 100A',
    type: 'electrical',
    x: 4,
    y: 1,
    windowStart: 9 * 60,
    windowEnd: 11 * 60,
    durationMin: 35,
    contact: 'Electrician meets on site: Arco Electric (Sam)',
  },
  {
    id: 'st-4490',
    permit: 'BLD-2026-04490',
    address: '977 7th St',
    scope: 'Re-roof midpoint — nailing pattern, underlayment',
    type: 'building',
    x: 6,
    y: 0,
    windowStart: 10 * 60,
    windowEnd: 11 * 60 + 30,
    durationMin: 25,
    contact: 'Crew on roof from 7 AM — ladder on north side',
  },
  {
    id: 'st-2230',
    permit: 'PLM-2026-02230',
    address: '640 Dover Ave',
    scope: 'Gas pressure test — 10 lb / 15 min witnessed',
    type: 'plumbing',
    x: 6,
    y: 4,
    windowStart: 11 * 60,
    windowEnd: 12 * 60 + 30,
    durationMin: 40,
    contact: 'Plumber requests 11:00 sharp — gauge already pumped',
  },
];

const STOP_BY_ID = new Map(STOPS.map(s => [s.id, s]));

/** Initial route order — the morning plan as filed by dispatch at 7:40 AM. */
const INITIAL_ORDERS: Record<InspectorId, string[]> = {
  r14: ['st-1192', 'st-4471', 'st-2218', 'st-0874', 'st-4502', 'st-1201'],
  r07: ['st-2201', 'st-4466', 'st-1188', 'st-4490', 'st-2230'],
};

const TYPE_META: Record<InspectionType, {label: string; icon: LucideIcon}> = {
  electrical: {label: 'Electrical', icon: ZapIcon},
  building: {label: 'Building', icon: HardHatIcon},
  plumbing: {label: 'Plumbing', icon: DropletsIcon},
  mechanical: {label: 'Mechanical', icon: FlameIcon},
};

// ---- schematic grid geometry ------------------------------------------------
// Avenues run north–south (x 0–8), numbered streets east–west (y 0–6,
// 7th St at the top). One block = 75px horizontal, 82px vertical.
const MAP_W = 660;
const MAP_H = 560;
const px = (x: number) => 30 + x * 75;
const py = (y: number) => 30 + y * 82;

const AVENUES = ['Ash', 'Bay', 'Birch', 'Cedar', 'Chestnut', 'Denton', 'Dover', 'Elm', 'Fulton'];
const STREETS = ['7th St', '6th St', '5th St', '4th St', '3rd St', '2nd St', '1st St'];

// ---------------------------------------------------------------------------
// SCOPED CSS — every selector is prefixed with the tpl- scope class. The
// two-column grid is hand-rolled (not DS panels) because the <=900px reflow
// puts the map ABOVE the list, which a width-pinned panel cannot express.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-city-permit-inspection-route';

const TEMPLATE_CSS = `
.${SCOPE} {
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.${SCOPE} *,
.${SCOPE} *::before,
.${SCOPE} *::after {
  box-sizing: border-box;
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} :is(button):focus-visible {
  outline: 2px solid ${ACCENT};
  outline-offset: 2px;
}

/* ---- topbar (56px) ------------------------------------------------------ */
.${SCOPE}.topbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${SCOPE} .brandMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  background: ${ACCENT_TINT};
  color: ${ACCENT};
}
.${SCOPE} .titleBlock {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${SCOPE} .eyebrow {
  margin: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ACCENT};
}
.${SCOPE} .pageTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .titleMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${SCOPE} .cityChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 2px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
  background: var(--color-background-body);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .cityChip strong {
  font-weight: 650;
}
.${SCOPE} .cityChip.hasMiss {
  border-color: ${MISS};
  color: ${MISS};
  background: ${MISS_TINT};
}
.${SCOPE} .cityChip.isClean {
  border-color: ${OK};
  color: ${OK};
}
.${SCOPE} .topbarActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

/* ---- shell + grid ------------------------------------------------------- */
.${SCOPE}.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.${SCOPE} .grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 424px minmax(0, 1fr);
}
.${SCOPE} .listCol {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-inline-end: var(--border-width) solid var(--color-border);
}
.${SCOPE} .mapCol {
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: var(--spacing-4);
  gap: var(--spacing-3);
  background: var(--color-background-body);
}

/* ---- inspector switch (44px row) ---------------------------------------- */
.${SCOPE} .tabRow {
  flex-shrink: 0;
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .inspectorTab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
  padding: 4px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: none;
  cursor: pointer;
  text-align: start;
}
@media (hover: hover) {
  .${SCOPE} .inspectorTab:hover {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .inspectorTab[aria-pressed='true'] {
  border-color: var(--tab-color, ${ACCENT});
  background: var(--tab-tint, ${ACCENT_TINT});
}
.${SCOPE} .tabBadge {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--tab-color, ${ACCENT});
  border: var(--border-width) solid var(--tab-color, ${ACCENT});
  border-radius: 6px;
  padding: 1px 6px;
}
.${SCOPE} .tabName {
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .tabName b {
  font-size: 12.5px;
  font-weight: 650;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .tabName span {
  font-size: 10.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ---- stat tiles (64px) ---------------------------------------------------- */
.${SCOPE} .statRow {
  flex-shrink: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .statTile {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1px;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
  border-inline-end: var(--border-width) solid var(--color-border);
}
.${SCOPE} .statTile:last-child {
  border-inline-end: none;
}
.${SCOPE} .statValue {
  font-size: 17px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
}
.${SCOPE} .statValue.isMiss {
  color: ${MISS};
}
.${SCOPE} .statValue.isClean {
  color: ${OK};
}
.${SCOPE} .statLabel {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* ---- stop list (rows 76px) ------------------------------------------------ */
.${SCOPE} .stopScroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.${SCOPE} .stopList {
  list-style: none;
  margin: 0;
  padding: 0;
}
.${SCOPE} .stopList li {
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .stopRow {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  min-height: 76px;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}
@media (hover: hover) {
  .${SCOPE} .stopRow:hover {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .stopRow[aria-expanded='true'] {
  background: var(--row-tint, ${ACCENT_TINT});
}
.${SCOPE} .seqBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: light-dark(#FFFFFF, #1B1B1F);
  background: var(--seq-color, ${ACCENT});
}
.${SCOPE} .stopMain {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${SCOPE} .permitRow {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${SCOPE} .permitId {
  font-family: var(--font-family-code, monospace);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .typeTag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 10.5px;
  font-weight: 650;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* The address is the ONE segment allowed to ellipsize. */
.${SCOPE} .stopAddress {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .driveNote {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .timeCell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
  flex-shrink: 0;
}
.${SCOPE} .windowLabel {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* ETA chip: 22px, state-colored, never color-only (verb in the label). */
.${SCOPE} .etaChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 22px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  border: var(--border-width) solid ${OK};
  color: ${OK};
}
.${SCOPE} .etaChip.isWait {
  border-color: ${WAIT};
  color: ${WAIT};
  background: ${WAIT_TINT};
}
.${SCOPE} .etaChip.isMiss {
  border-color: ${MISS};
  color: ${MISS};
  background: ${MISS_TINT};
}
.${SCOPE} .stopExpand {
  padding: 0 var(--spacing-4) var(--spacing-3) calc(28px + var(--spacing-3) + var(--spacing-4));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${SCOPE} .stopScope {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--color-text-primary);
}
.${SCOPE} .stopContact {
  margin: 0;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${SCOPE} .actionBar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.${SCOPE} .actionBtn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-body);
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 600;
}
@media (hover: hover) {
  .${SCOPE} .actionBtn:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .actionBtn:disabled {
  opacity: 0.45;
  cursor: default;
}
.${SCOPE} .actionBtn.isReassign {
  border-color: ${ACCENT};
  color: ${ACCENT};
}

/* ---- map column ------------------------------------------------------------ */
.${SCOPE} .mapFrame {
  position: relative;
  width: 100%;
  aspect-ratio: ${MAP_W} / ${MAP_H};
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
  overflow: hidden;
}
.${SCOPE} .mapSvg {
  display: block;
  width: 100%;
  height: 100%;
}
/* Pin buttons: 40px hit target centered on the intersection, 26px visible
   dot. Overlay percentages share the SVG's viewBox math exactly because the
   frame's aspect-ratio pins the same 660/560 geometry. */
.${SCOPE} .pinBtn {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
}
.${SCOPE} .pinDot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: light-dark(#FFFFFF, #1B1B1F);
  background: var(--pin-color, ${ACCENT});
  box-shadow: 0 0 0 2px var(--color-background-surface);
}
.${SCOPE} .pinBtn.isDim .pinDot {
  opacity: 0.4;
}
.${SCOPE} .pinBtn.isSelected .pinDot {
  box-shadow:
    0 0 0 2px var(--color-background-surface),
    0 0 0 4px var(--pin-color, ${ACCENT});
}
/* Miss ring: dashed red halo so the late pin reads without color vision. */
.${SCOPE} .pinBtn.isMiss::after {
  content: '';
  position: absolute;
  inset: 1px;
  border: 2px dashed ${MISS};
  border-radius: 50%;
  pointer-events: none;
}
.${SCOPE} .legendRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${SCOPE} .legendItem {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.${SCOPE} .legendSwatch {
  width: 18px;
  height: 3px;
  border-radius: 2px;
}
.${SCOPE} .legendSwatch.isDashed {
  height: 0;
  border-top: 3px dashed ${MISS};
  background: none;
}
.${SCOPE} .mapFootnote {
  margin: 0;
  font-size: 11px;
  line-height: 1.45;
  color: var(--color-text-secondary);
}
.${SCOPE} .srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------- */
/* <=900px: one scrolling column — map first, list after. */
@media (max-width: 900px) {
  .${SCOPE} .grid {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .${SCOPE} .mapCol {
    order: 0;
    overflow-y: visible;
  }
  .${SCOPE} .listCol {
    order: 1;
    border-inline-end: none;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .stopScroll {
    overflow-y: visible;
  }
}
/* <=600px: stat tiles wrap 2x2; nothing else squeezes. */
@media (max-width: 600px) {
  .${SCOPE} .statRow {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .${SCOPE} .statTile {
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .statTile:nth-child(n + 3) {
    border-bottom: none;
  }
  .${SCOPE} .statTile:nth-child(2n) {
    border-inline-end: none;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${SCOPE} .pinDot {
    transition: box-shadow 0.15s ease, opacity 0.15s ease;
  }
}
`;

// ---------------------------------------------------------------------------
// ROUTE ENGINE — the one fold every surface reads. Pure function of the
// current stop order, so reorders and reassignments re-derive everything.
// ---------------------------------------------------------------------------

type RouteLeg = {
  stop: Stop;
  seq: number;
  driveMin: number;
  arriveMin: number;
  /** Early arrival parks until the window opens. */
  waitMin: number;
  /** Minutes past the window end at arrival (0 = on time). */
  missMin: number;
  beginMin: number;
  departMin: number;
};

type RouteResult = {
  legs: RouteLeg[];
  totalDriveMin: number;
  totalInspectMin: number;
  endMin: number;
  missCount: number;
  waitCount: number;
};

function computeRoute(order: string[]): RouteResult {
  const legs: RouteLeg[] = [];
  let clock = SHIFT_START_MIN;
  let at = DEPOT;
  let totalDriveMin = 0;
  let totalInspectMin = 0;
  for (const [index, id] of order.entries()) {
    const stop = STOP_BY_ID.get(id);
    if (stop === undefined) {
      continue;
    }
    const driveMin = (Math.abs(stop.x - at.x) + Math.abs(stop.y - at.y)) * MIN_PER_BLOCK;
    const arriveMin = clock + driveMin;
    const waitMin = Math.max(0, stop.windowStart - arriveMin);
    const missMin = Math.max(0, arriveMin - stop.windowEnd);
    const beginMin = arriveMin + waitMin;
    const departMin = beginMin + stop.durationMin;
    legs.push({stop, seq: index + 1, driveMin, arriveMin, waitMin, missMin, beginMin, departMin});
    totalDriveMin += driveMin;
    totalInspectMin += stop.durationMin;
    clock = departMin;
    at = stop;
  }
  return {
    legs,
    totalDriveMin,
    totalInspectMin,
    endMin: clock,
    missCount: legs.filter(leg => leg.missMin > 0).length,
    waitCount: legs.filter(leg => leg.waitMin > 0).length,
  };
}

/** Minutes-since-midnight → "8:04 AM" (fixed route clock, no Date). */
function fmtClock(totalMin: number): string {
  const h24 = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** 82 → "1h 22m"; 8 → "8m". */
function fmtDur(min: number): string {
  if (min < 60) {
    return `${min}m`;
  }
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}m`;
}

/** "8:00–10:00" window label (minutes stay AM-block, suffix omitted). */
function fmtWindow(startMin: number, endMin: number): string {
  const short = (t: number) => {
    const h24 = Math.floor(t / 60) % 24;
    const m = t % 60;
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return m === 0 ? `${h12}` : `${h12}:${String(m).padStart(2, '0')}`;
  };
  return `${short(startMin)}–${short(endMin)}`;
}

/** Manhattan path for a route: horizontal leg first, then vertical. */
function routePathD(legs: RouteLeg[]): string {
  let d = `M ${px(DEPOT.x)} ${py(DEPOT.y)}`;
  let at = DEPOT;
  for (const leg of legs) {
    const {stop} = leg;
    if (stop.x !== at.x) {
      d += ` L ${px(stop.x)} ${py(at.y)}`;
    }
    if (stop.y !== at.y) {
      d += ` L ${px(stop.x)} ${py(stop.y)}`;
    }
    at = stop;
  }
  return d;
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

/** Curbside mark — a curb corner with a routed dogleg. Inline SVG only. */
function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 4v12a4 4 0 0 0 4 4h12"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M9 9h6v-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="3.6" r="2" fill="currentColor" />
    </svg>
  );
}

/**
 * The schematic street grid. Pure geometry: gridlines, labels, yard marker,
 * and one Manhattan polyline per inspector. Pins are HTML overlay buttons in
 * the page (real focus targets), not SVG children.
 */
function StreetGridSvg({
  r14Legs,
  r07Legs,
  activeInspector,
}: {
  r14Legs: RouteLeg[];
  r07Legs: RouteLeg[];
  activeInspector: InspectorId;
}) {
  const routes: {id: InspectorId; legs: RouteLeg[]; color: string}[] = [
    {id: 'r07', legs: r07Legs, color: SLATE},
    {id: 'r14', legs: r14Legs, color: ACCENT},
  ];
  // Active route paints last (on top) at full width.
  routes.sort(a => (a.id === activeInspector ? 1 : -1));
  return (
    <svg
      className="mapSvg"
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true">
      {/* street grid */}
      {AVENUES.map((name, x) => (
        <g key={name}>
          <line
            x1={px(x)}
            y1={py(0) - 12}
            x2={px(x)}
            y2={py(STREETS.length - 1) + 12}
            stroke="var(--color-border)"
            strokeWidth={1.25}
          />
          <text
            x={px(x)}
            y={14}
            textAnchor="middle"
            fontSize={9}
            fontFamily="var(--font-family-sans, system-ui, sans-serif)"
            fill="var(--color-text-secondary)">
            {name}
          </text>
        </g>
      ))}
      {STREETS.map((name, y) => (
        <g key={name}>
          <line
            x1={px(0) - 12}
            y1={py(y)}
            x2={px(AVENUES.length - 1) + 12}
            y2={py(y)}
            stroke="var(--color-border)"
            strokeWidth={1.25}
          />
          <text
            x={px(AVENUES.length - 1) + 16}
            y={py(y) + 3}
            textAnchor="start"
            fontSize={9}
            fontFamily="var(--font-family-sans, system-ui, sans-serif)"
            fill="var(--color-text-secondary)">
            {name}
          </text>
        </g>
      ))}
      {/* route polylines — re-derive from the CURRENT order every render */}
      {routes.map(route => (
        <path
          key={route.id}
          d={routePathD(route.legs)}
          fill="none"
          stroke={route.color}
          strokeWidth={route.id === activeInspector ? 3 : 1.75}
          opacity={route.id === activeInspector ? 1 : 0.45}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
      {/* yard marker */}
      <rect
        x={px(DEPOT.x) - 7}
        y={py(DEPOT.y) - 7}
        width={14}
        height={14}
        rx={3}
        fill="var(--color-text-secondary)"
      />
      <text
        x={px(DEPOT.x)}
        y={py(DEPOT.y) + 24}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
        fontFamily="var(--font-family-sans, system-ui, sans-serif)"
        fill="var(--color-text-secondary)">
        YARD
      </text>
    </svg>
  );
}

function EtaChip({leg}: {leg: RouteLeg}) {
  if (leg.missMin > 0) {
    return (
      <span className="etaChip isMiss">
        ETA {fmtClock(leg.arriveMin)} · misses window by {leg.missMin}m
      </span>
    );
  }
  if (leg.waitMin > 0) {
    return (
      <span className="etaChip isWait">
        ETA {fmtClock(leg.arriveMin)} · waits {leg.waitMin}m
      </span>
    );
  }
  return <span className="etaChip">ETA {fmtClock(leg.arriveMin)} · on time</span>;
}

function StopRowItem({
  leg,
  inspector,
  otherInspector,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMove,
  onReassign,
}: {
  leg: RouteLeg;
  inspector: Inspector;
  otherInspector: Inspector;
  isSelected: boolean;
  isFirst: boolean;
  isLast: boolean;
  onSelect: (stopId: string) => void;
  onMove: (stopId: string, direction: -1 | 1) => void;
  onReassign: (stopId: string) => void;
}) {
  const {stop} = leg;
  const type = TYPE_META[stop.type];
  const detailId = `cpir-stop-${stop.id}`;
  const rowVars = {
    '--seq-color': inspector.color,
    '--row-tint': inspector.tint,
  } as CSSProperties;
  return (
    <li>
      <button
        type="button"
        className="stopRow"
        style={rowVars}
        aria-expanded={isSelected}
        aria-controls={detailId}
        onClick={() => onSelect(stop.id)}>
        <span className="seqBadge">{leg.seq}</span>
        <span className="stopMain">
          <span className="permitRow">
            <span className="permitId">{stop.permit}</span>
            <span className="typeTag">
              <Icon icon={type.icon} size="xsm" color="inherit" />
              {type.label}
            </span>
          </span>
          <span className="stopAddress">{stop.address}</span>
          <span className="driveNote">
            <Icon icon={CarIcon} size="xsm" color="inherit" /> {leg.driveMin}m drive ·{' '}
            {stop.durationMin}m on site
          </span>
        </span>
        <span className="timeCell">
          <span className="windowLabel">Window {fmtWindow(stop.windowStart, stop.windowEnd)}</span>
          <EtaChip leg={leg} />
        </span>
      </button>
      {isSelected && (
        <div className="stopExpand" id={detailId}>
          <p className="stopScope">{stop.scope}</p>
          <p className="stopContact">{stop.contact}</p>
          <div className="actionBar">
            <button
              type="button"
              className="actionBtn"
              disabled={isFirst}
              onClick={() => onMove(stop.id, -1)}>
              <Icon icon={ArrowUpIcon} size="sm" color="inherit" />
              Move up
            </button>
            <button
              type="button"
              className="actionBtn"
              disabled={isLast}
              onClick={() => onMove(stop.id, 1)}>
              <Icon icon={ArrowDownIcon} size="sm" color="inherit" />
              Move down
            </button>
            <button
              type="button"
              className="actionBtn isReassign"
              onClick={() => onReassign(stop.id)}>
              <Icon icon={ArrowLeftRightIcon} size="sm" color="inherit" />
              Reassign to {otherInspector.badge} {otherInspector.name}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function CityPermitInspectionRouteTemplate() {
  const [orders, setOrders] = useState<Record<InspectorId, string[]>>(INITIAL_ORDERS);
  const [activeInspector, setActiveInspector] = useState<InspectorId>('r14');
  const [selectedStopId, setSelectedStopId] = useState<string | null>('st-4502');
  const [announcement, setAnnouncement] = useState('');

  // The one derivation both columns read.
  const routes = useMemo(
    () => ({r14: computeRoute(orders.r14), r07: computeRoute(orders.r07)}),
    [orders],
  );

  const ownerOf = (stopId: string): InspectorId =>
    orders.r14.includes(stopId) ? 'r14' : 'r07';

  const citywideStops = orders.r14.length + orders.r07.length;
  const citywideMisses = routes.r14.missCount + routes.r07.missCount;
  const citywideDrive = routes.r14.totalDriveMin + routes.r07.totalDriveMin;

  const activeRoute = routes[activeInspector];
  const inspector = INSPECTORS[activeInspector];
  const otherId: InspectorId = activeInspector === 'r14' ? 'r07' : 'r14';
  const otherInspector = INSPECTORS[otherId];

  // ---- handlers -------------------------------------------------------------
  const handleSelect = (stopId: string) => {
    const next = selectedStopId === stopId ? null : stopId;
    setSelectedStopId(next);
    if (next !== null) {
      const owner = ownerOf(stopId);
      setActiveInspector(owner);
      const stop = STOP_BY_ID.get(stopId);
      setAnnouncement(`${stop?.address ?? stopId} selected on ${INSPECTORS[owner].badge}.`);
    }
  };

  const describeRoute = (id: InspectorId, result: RouteResult): string =>
    `${INSPECTORS[id].badge} now ends ${fmtClock(result.endMin)} with ${
      result.missCount === 0 ? 'no window misses' : `${result.missCount} window miss${result.missCount > 1 ? 'es' : ''}`
    }.`;

  const handleMove = (stopId: string, direction: -1 | 1) => {
    const owner = ownerOf(stopId);
    const order = orders[owner];
    const index = order.indexOf(stopId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= order.length) {
      return;
    }
    const next = [...order];
    next[index] = next[target];
    next[target] = stopId;
    const nextOrders = {...orders, [owner]: next};
    setOrders(nextOrders);
    const result = computeRoute(next);
    const leg = result.legs.find(l => l.stop.id === stopId);
    const stop = STOP_BY_ID.get(stopId);
    setAnnouncement(
      `${stop?.permit ?? stopId} moved to stop ${target + 1} — new ETA ${
        leg !== undefined ? fmtClock(leg.arriveMin) : '—'
      }. ${describeRoute(owner, result)}`,
    );
  };

  const handleReassign = (stopId: string) => {
    const from = ownerOf(stopId);
    const to: InspectorId = from === 'r14' ? 'r07' : 'r14';
    const nextOrders: Record<InspectorId, string[]> = {
      ...orders,
      [from]: orders[from].filter(id => id !== stopId),
      [to]: [...orders[to], stopId],
    };
    setOrders(nextOrders);
    setActiveInspector(to);
    const toResult = computeRoute(nextOrders[to]);
    const fromResult = computeRoute(nextOrders[from]);
    const leg = toResult.legs.find(l => l.stop.id === stopId);
    const stop = STOP_BY_ID.get(stopId);
    setAnnouncement(
      `${stop?.permit ?? stopId} reassigned to ${INSPECTORS[to].badge} as stop ${
        leg?.seq ?? nextOrders[to].length
      } — ETA ${leg !== undefined ? fmtClock(leg.arriveMin) : '—'}${
        leg !== undefined && leg.missMin > 0 ? ` (misses window by ${leg.missMin}m)` : ''
      }. ${describeRoute(from, fromResult)}`,
    );
  };

  const handleReset = () => {
    setOrders(INITIAL_ORDERS);
    setActiveInspector('r14');
    setSelectedStopId('st-4502');
    setAnnouncement('Routes reset to the 7:40 AM dispatch plan.');
  };

  // ---- topbar ---------------------------------------------------------------
  const header = (
    <LayoutHeader>
      <div className={`${SCOPE} topbar`}>
        <span className="brandMark">
          <BrandMark />
        </span>
        <div className="titleBlock">
          <p className="eyebrow">Curbside · Dispatch board</p>
          <h1 className="pageTitle">Thursday routes — Jul 16, 2026</h1>
          <div className="titleMeta">
            <span>City of Norvale · Building &amp; Safety</span>
            <Badge label="AM block · 8:00–1:00" variant="neutral" />
          </div>
        </div>
        <div className="topbarActions">
          <span className="cityChip">
            <strong>{citywideStops}</strong> stops
          </span>
          <span className={citywideMisses > 0 ? 'cityChip hasMiss' : 'cityChip isClean'}>
            <strong>{citywideMisses}</strong> window miss{citywideMisses === 1 ? '' : 'es'}
          </span>
          <span className="cityChip">
            <Icon icon={CarIcon} size="xsm" color="inherit" />
            <strong>{fmtDur(citywideDrive)}</strong> combined drive
          </span>
          <Button
            label="Reset plan"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={handleReset}
          />
        </div>
      </div>
    </LayoutHeader>
  );

  // ---- list column ------------------------------------------------------------
  const tabFor = (id: InspectorId) => {
    const person = INSPECTORS[id];
    const result = routes[id];
    const tabVars = {'--tab-color': person.color, '--tab-tint': person.tint} as CSSProperties;
    return (
      <button
        type="button"
        className="inspectorTab"
        style={tabVars}
        aria-pressed={activeInspector === id}
        onClick={() => setActiveInspector(id)}>
        <span className="tabBadge">{person.badge}</span>
        <span className="tabName">
          <b>{person.name}</b>
          <span>
            {routes[id].legs.length} stops · ends {fmtClock(result.endMin)}
          </span>
        </span>
      </button>
    );
  };

  const listCol = (
    <section className="listCol" aria-label="Ordered stop list">
      <div className="tabRow" role="group" aria-label="Inspector routes">
        {tabFor('r14')}
        {tabFor('r07')}
      </div>
      <div className="statRow" aria-label={`${inspector.badge} route totals`}>
        <div className="statTile">
          <span className="statValue">{fmtDur(activeRoute.totalDriveMin)}</span>
          <span className="statLabel">Drive</span>
        </div>
        <div className="statTile">
          <span className="statValue">{fmtDur(activeRoute.totalInspectMin)}</span>
          <span className="statLabel">On site</span>
        </div>
        <div className="statTile">
          <span className="statValue">{fmtClock(activeRoute.endMin)}</span>
          <span className="statLabel">Ends</span>
        </div>
        <div className="statTile">
          <span
            className={
              activeRoute.missCount > 0 ? 'statValue isMiss' : 'statValue isClean'
            }>
            {activeRoute.missCount}
          </span>
          <span className="statLabel">Window misses</span>
        </div>
      </div>
      <div className="stopScroll">
        <ul className="stopList">
          {activeRoute.legs.map((leg, index) => (
            <StopRowItem
              key={leg.stop.id}
              leg={leg}
              inspector={inspector}
              otherInspector={otherInspector}
              isSelected={selectedStopId === leg.stop.id}
              isFirst={index === 0}
              isLast={index === activeRoute.legs.length - 1}
              onSelect={handleSelect}
              onMove={handleMove}
              onReassign={handleReassign}
            />
          ))}
        </ul>
      </div>
    </section>
  );

  // ---- map column ------------------------------------------------------------
  const pinButtons = (['r14', 'r07'] as InspectorId[]).flatMap(id =>
    routes[id].legs.map(leg => {
      const person = INSPECTORS[id];
      const isActive = id === activeInspector;
      const pinClass = [
        'pinBtn',
        isActive ? '' : 'isDim',
        leg.missMin > 0 ? 'isMiss' : '',
        selectedStopId === leg.stop.id ? 'isSelected' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const pinVars = {
        '--pin-color': person.color,
        left: `${(px(leg.stop.x) / MAP_W) * 100}%`,
        top: `${(py(leg.stop.y) / MAP_H) * 100}%`,
      } as CSSProperties;
      return (
        <button
          key={`${id}-${leg.stop.id}`}
          type="button"
          className={pinClass}
          style={pinVars}
          aria-label={`${leg.stop.address} — ${person.badge} stop ${leg.seq}, ETA ${fmtClock(
            leg.arriveMin,
          )}${leg.missMin > 0 ? `, misses window by ${leg.missMin} minutes` : ''}`}
          onClick={() => handleSelect(leg.stop.id)}>
          <span className="pinDot">{leg.seq}</span>
        </button>
      );
    }),
  );

  const mapCol = (
    <section className="mapCol" aria-label="Schematic route map">
      <div className="mapFrame">
        <StreetGridSvg
          r14Legs={routes.r14.legs}
          r07Legs={routes.r07.legs}
          activeInspector={activeInspector}
        />
        {pinButtons}
      </div>
      <div className="legendRow">
        <span className="legendItem">
          <span className="legendSwatch" style={{background: ACCENT}} />
          R-14 Marisol Vega
        </span>
        <span className="legendItem">
          <span className="legendSwatch" style={{background: SLATE}} />
          R-07 Owen Tran
        </span>
        <span className="legendItem">
          <span className="legendSwatch isDashed" />
          missed window
        </span>
        <span className="legendItem">■ Yard — 120 Bay Ave, gates 8:00 AM</span>
      </div>
      <p className="mapFootnote">
        Schematic grid, not to scale: one block = 2 minutes at posted AM speeds (Norvale DOT
        Thursday profile). Select a pin to open its stop row; the polylines, ETAs, and totals
        re-derive from the current order on every change.
      </p>
    </section>
  );

  // ---- frame ----------------------------------------------------------------------
  return (
    <div style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className={`${SCOPE} shell`}>
              <div aria-live="polite" className="srOnly">
                {announcement}
              </div>
              <div className="grid">
                {listCol}
                {mapCol}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
